"""Crop yield estimation pipeline (regression).

Estimates yield (production per unit area) from weather, soil moisture,
cultivated area, season and crop, using Indian district-level agriculture
records.

Run directly to execute the full pipeline:

    python src/crop_yield_pipeline.py
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBRegressor

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "crop_yield_dataset.csv"
MODELS_DIR = PROJECT_ROOT / "models"
MODEL_PATH = MODELS_DIR / "yield_model.pkl"
LE_SEASON_PATH = MODELS_DIR / "le_season.pkl"
LE_CROP_PATH = MODELS_DIR / "le_crop.pkl"
OUTPUT_DIR = PROJECT_ROOT / "outputs"
RESULTS_PATH = OUTPUT_DIR / "crop_yield_results.json"

FEATURES = ["Temperature", "Humidity", "Soil_Moisture", "Area", "Season_enc", "Crop_enc"]
SAMPLE_SIZE = 15_000
RANDOM_STATE = 42


# --------------------------------------------------------------------------
# 1. Load + clean
# --------------------------------------------------------------------------
def load_and_clean() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    print("=" * 70)
    print("CROP YIELD DATASET")
    print("=" * 70)
    print(f"Raw shape: {df.shape[0]} rows x {df.shape[1]} columns")

    # The raw file pads strings with trailing spaces ("Kharif     ").
    df.columns = [c.strip() for c in df.columns]
    for col in df.select_dtypes(include=["object", "string"]).columns:
        df[col] = df[col].astype(str).str.strip()
    print(f"Columns after strip: {list(df.columns)}")
    print("\nMissing values per column:")
    print(df.isna().sum().to_string())

    rows_before = len(df)

    # Area / Production must be present and strictly positive for a real yield.
    df["Area"] = pd.to_numeric(df["Area"], errors="coerce")
    df["Production"] = pd.to_numeric(df["Production"], errors="coerce")
    df = df.dropna(subset=["Area", "Production"])
    df = df[(df["Area"] > 0) & (df["Production"] > 0)]
    rows_after_validity = len(df)

    df["Yield"] = df["Production"] / df["Area"]
    yield_min_raw, yield_max_raw = df["Yield"].min(), df["Yield"].max()

    lo, hi = df["Yield"].quantile([0.01, 0.99])
    df = df[(df["Yield"] >= lo) & (df["Yield"] <= hi)].copy()
    rows_after_clip = len(df)

    print("\n--- Cleaning summary ---")
    print(f"Rows before cleaning              : {rows_before}")
    print(f"After dropping invalid Area/Prod  : {rows_after_validity} "
          f"(-{rows_before - rows_after_validity})")
    print(f"After 1st-99th percentile clipping: {rows_after_clip} "
          f"(-{rows_after_validity - rows_after_clip})")
    print(f"Yield range before clipping       : {yield_min_raw:.4f} .. {yield_max_raw:.4f}")
    print(f"Yield range after clipping        : {df['Yield'].min():.4f} .. {df['Yield'].max():.4f}")
    print(f"Yield mean / median               : {df['Yield'].mean():.4f} / {df['Yield'].median():.4f}")

    df.attrs["clean_stats"] = {
        "rows_before": int(rows_before),
        "rows_after_validity_filter": int(rows_after_validity),
        "rows_after_percentile_clip": int(rows_after_clip),
        "yield_min_before_clip": float(yield_min_raw),
        "yield_max_before_clip": float(yield_max_raw),
        "yield_min_after_clip": float(df["Yield"].min()),
        "yield_max_after_clip": float(df["Yield"].max()),
        "clip_bounds": [float(lo), float(hi)],
    }
    return df


# --------------------------------------------------------------------------
# 2. Encode + sample
# --------------------------------------------------------------------------
def encode_and_sample(df: pd.DataFrame):
    le_season, le_crop = LabelEncoder(), LabelEncoder()
    df["Season_enc"] = le_season.fit_transform(df["Season"])
    df["Crop_enc"] = le_crop.fit_transform(df["Crop"])
    print(f"\nLabel encoders fitted: {len(le_season.classes_)} seasons, "
          f"{len(le_crop.classes_)} crops")
    print(f"Seasons: {list(le_season.classes_)}")

    if len(df) > SAMPLE_SIZE:
        df = df.sample(n=SAMPLE_SIZE, random_state=RANDOM_STATE).reset_index(drop=True)
        print(f"Sampled {SAMPLE_SIZE} rows for training speed.")
    else:
        print(f"Dataset has {len(df)} rows - using all of them.")

    return df, le_season, le_crop


# --------------------------------------------------------------------------
# 3. Model comparison
# --------------------------------------------------------------------------
def evaluate(name, model, X_test, y_test) -> dict:
    pred = model.predict(X_test)
    scores = {
        "model": name,
        "rmse": float(np.sqrt(mean_squared_error(y_test, pred))),
        "mae": float(mean_absolute_error(y_test, pred)),
        "r2": float(r2_score(y_test, pred)),
    }
    print(f"  {name:<26} RMSE={scores['rmse']:.4f}  "
          f"MAE={scores['mae']:.4f}  R2={scores['r2']:.4f}")
    return scores


def build_models() -> dict:
    return {
        "Linear Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("reg", LinearRegression()),
        ]),
        "Random Forest": RandomForestRegressor(
            n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1
        ),
        "XGBoost": XGBRegressor(
            n_estimators=300, max_depth=6, learning_rate=0.1,
            random_state=RANDOM_STATE, n_jobs=-1, tree_method="hist",
        ),
    }


# --------------------------------------------------------------------------
# 4. Plots
# --------------------------------------------------------------------------
def plot_pred_vs_actual(y_test, pred, name) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    fig, ax = plt.subplots(figsize=(7, 7))
    ax.scatter(y_test, pred, s=8, alpha=0.35, color="#4c72b0", edgecolors="none")
    lim = [min(y_test.min(), pred.min()), max(y_test.max(), pred.max())]
    ax.plot(lim, lim, "--", color="#c44e52", linewidth=1.5, label="perfect prediction")
    ax.set_xlabel("Actual yield")
    ax.set_ylabel("Predicted yield")
    ax.set_title(f"Predicted vs actual yield - {name}")
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "yield_pred_vs_actual.png", dpi=120)
    plt.close(fig)


def plot_feature_importance(model, name) -> dict | None:
    estimator = model.named_steps["reg"] if isinstance(model, Pipeline) else model
    if hasattr(estimator, "feature_importances_"):
        values = [float(v) for v in estimator.feature_importances_]
        ylabel = "Importance"
    elif hasattr(estimator, "coef_"):
        values = [abs(float(v)) for v in np.ravel(estimator.coef_)]
        ylabel = "|coefficient|"
    else:
        return None

    importance = dict(zip(FEATURES, values))
    order = sorted(importance, key=importance.get)
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(order, [importance[f] for f in order], color="#55a868")
    ax.set_xlabel(ylabel)
    ax.set_title(f"Feature importance - {name}")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "yield_feature_importance.png", dpi=120)
    plt.close(fig)
    return importance


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
def main() -> dict:
    df = load_and_clean()
    clean_stats = df.attrs["clean_stats"]
    df, le_season, le_crop = encode_and_sample(df)

    X = df[FEATURES].to_numpy(dtype=float)
    y = df["Yield"].to_numpy(dtype=float)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )
    print(f"\nSplit -> train={X_train.shape[0]}  test={X_test.shape[0]}")

    print("\nModel comparison (test set):")
    comparison, fitted = [], {}
    for name, model in build_models().items():
        model.fit(X_train, y_train)
        fitted[name] = model
        comparison.append(evaluate(name, model, X_test, y_test))

    best_name = max(comparison, key=lambda r: r["r2"])["model"]
    print(f"\nBest model by R2: {best_name}")

    if best_name == "XGBoost":
        base = XGBRegressor(random_state=RANDOM_STATE, n_jobs=-1, tree_method="hist")
        grid = {
            "n_estimators": [200, 400],
            "max_depth": [4, 6, 8],
            "learning_rate": [0.05, 0.1],
        }
    elif best_name == "Random Forest":
        base = RandomForestRegressor(random_state=RANDOM_STATE, n_jobs=-1)
        grid = {
            "n_estimators": [100, 200, 300],
            "max_depth": [None, 12, 20],
            "min_samples_split": [2, 5, 10],
        }
    else:
        base = Pipeline([("scaler", StandardScaler()), ("reg", LinearRegression())])
        grid = {"reg__fit_intercept": [True, False]}

    print(f"\nGridSearchCV on {best_name} (cv=3, scoring=r2)...")
    search = GridSearchCV(base, grid, cv=3, scoring="r2", n_jobs=-1)
    search.fit(X_train, y_train)
    print(f"  Best params: {search.best_params_}")
    print(f"  Best CV R2 (grid): {search.best_score_:.4f}")

    best_model = search.best_estimator_
    tuned_scores = evaluate(f"{best_name} (tuned)", best_model, X_test, y_test)

    cv = cross_val_score(best_model, X, y, cv=5, scoring="r2", n_jobs=-1)
    print(f"  5-fold CV R2: {cv.mean():.4f} +/- {cv.std():.4f}")

    pred = best_model.predict(X_test)
    plot_pred_vs_actual(y_test, pred, best_name)
    importance = plot_feature_importance(best_model, best_name)
    print(f"[PLOTS] Predicted-vs-actual + feature importance saved to {OUTPUT_DIR}/")

    results = {
        "task": "crop_yield (regression)",
        "dataset": {
            "features": FEATURES,
            "target": "Yield = Production / Area",
            "cleaning": clean_stats,
            "rows_used_for_training": int(len(df)),
            "train_rows": int(X_train.shape[0]),
            "test_rows": int(X_test.shape[0]),
            "n_seasons": int(len(le_season.classes_)),
            "n_crops": int(len(le_crop.classes_)),
        },
        "model_comparison": comparison,
        "best_model": best_name,
        "best_params": {k: v for k, v in search.best_params_.items()},
        "tuned_test_scores": tuned_scores,
        "cross_validation": {
            "folds": 5,
            "metric": "r2",
            "mean": float(cv.mean()),
            "std": float(cv.std()),
            "scores": [float(s) for s in cv],
        },
        "feature_importance": importance,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(results, indent=2))
    print(f"[RESULTS] {RESULTS_PATH}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"model": best_model, "features": FEATURES, "model_name": best_name},
        MODEL_PATH,
    )
    joblib.dump(le_season, LE_SEASON_PATH)
    joblib.dump(le_crop, LE_CROP_PATH)
    print(f"[MODEL]   {MODEL_PATH}")
    print(f"[MODEL]   {LE_SEASON_PATH}")
    print(f"[MODEL]   {LE_CROP_PATH}")
    return results


if __name__ == "__main__":
    main()
