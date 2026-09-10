"""Crop recommendation pipeline (multi-class classification).

Predicts the best crop to sow from soil nutrients (N, P, K) and weather
(temperature, humidity, pH, rainfall).

Run directly to execute the full pipeline:

    python src/crop_recommendation_pipeline.py
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")  # headless-safe: we only ever write PNGs
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "crop_recommendation.csv"
MODEL_PATH = PROJECT_ROOT / "models" / "crop_model.pkl"
OUTPUT_DIR = PROJECT_ROOT / "outputs"
RESULTS_PATH = OUTPUT_DIR / "crop_classification_results.json"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
RANDOM_STATE = 42


# --------------------------------------------------------------------------
# 1. Load + describe
# --------------------------------------------------------------------------
def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    print("=" * 70)
    print("CROP RECOMMENDATION DATASET")
    print("=" * 70)
    print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"\nColumns: {list(df.columns)}")
    print("\nSummary statistics:")
    print(df[FEATURES].describe().round(3).to_string())
    print("\nMissing values per column:")
    print(df.isna().sum().to_string())
    print(f"\nClasses: {df['label'].nunique()}")
    print(df["label"].value_counts().to_string())
    return df


# --------------------------------------------------------------------------
# 2. EDA plots
# --------------------------------------------------------------------------
def run_eda(df: pd.DataFrame) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    fig, axes = plt.subplots(3, 3, figsize=(15, 11))
    for ax, col in zip(axes.ravel(), FEATURES):
        ax.hist(df[col], bins=40, color="#4c72b0", edgecolor="white")
        ax.set_title(col)
        ax.set_ylabel("count")
    for ax in axes.ravel()[len(FEATURES):]:
        ax.axis("off")
    fig.suptitle("Feature distributions - crop recommendation", fontsize=14)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "crop_feature_distributions.png", dpi=120)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 6.5))
    sns.heatmap(
        df[FEATURES].corr(), annot=True, fmt=".2f", cmap="coolwarm",
        center=0, square=True, ax=ax,
    )
    ax.set_title("Feature correlation heatmap")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "crop_correlation_heatmap.png", dpi=120)
    plt.close(fig)

    print(f"\n[EDA] Saved distribution grid and correlation heatmap to {OUTPUT_DIR}/")


# --------------------------------------------------------------------------
# 3. Model comparison
# --------------------------------------------------------------------------
def evaluate(name, model, X_test, y_test) -> dict:
    pred = model.predict(X_test)
    scores = {
        "model": name,
        "accuracy": float(accuracy_score(y_test, pred)),
        "precision_weighted": float(precision_score(y_test, pred, average="weighted", zero_division=0)),
        "recall_weighted": float(recall_score(y_test, pred, average="weighted", zero_division=0)),
        "f1_weighted": float(f1_score(y_test, pred, average="weighted", zero_division=0)),
    }
    print(
        f"  {name:<22} acc={scores['accuracy']:.4f}  "
        f"prec={scores['precision_weighted']:.4f}  "
        f"rec={scores['recall_weighted']:.4f}  f1={scores['f1_weighted']:.4f}"
    )
    return scores


def build_models() -> dict:
    return {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
        ]),
        "Random Forest": RandomForestClassifier(
            n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.2,
            random_state=RANDOM_STATE, n_jobs=-1, tree_method="hist",
        ),
    }


# --------------------------------------------------------------------------
# 4. Plots for the winning model
# --------------------------------------------------------------------------
def plot_confusion_matrix(y_test, pred, class_names) -> None:
    cm = confusion_matrix(y_test, pred)
    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues", cbar=False,
        xticklabels=class_names, yticklabels=class_names, ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion matrix - best crop recommendation model")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "crop_confusion_matrix.png", dpi=120)
    plt.close(fig)


def plot_feature_importance(model, name) -> dict | None:
    estimator = model.named_steps["clf"] if isinstance(model, Pipeline) else model
    if not hasattr(estimator, "feature_importances_"):
        return None
    importance = dict(zip(FEATURES, (float(v) for v in estimator.feature_importances_)))
    order = sorted(importance, key=importance.get)

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(order, [importance[f] for f in order], color="#55a868")
    ax.set_xlabel("Importance")
    ax.set_title(f"Feature importance - {name}")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "crop_feature_importance.png", dpi=120)
    plt.close(fig)
    return importance


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
def main() -> dict:
    df = load_data()
    run_eda(df)

    label_encoder = LabelEncoder()
    X = df[FEATURES].to_numpy(dtype=float)
    y = label_encoder.fit_transform(df["label"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"\nStratified split -> train={X_train.shape[0]}  test={X_test.shape[0]}")

    print("\nModel comparison (test set):")
    comparison = []
    for name, model in build_models().items():
        model.fit(X_train, y_train)
        comparison.append(evaluate(name, model, X_test, y_test))

    best_name = max(comparison, key=lambda r: r["f1_weighted"])["model"]
    print(f"\nBest model by weighted F1: {best_name}")

    # ---- hyper-parameter tuning on the winner ----
    if best_name == "XGBoost":
        base = XGBClassifier(
            random_state=RANDOM_STATE, n_jobs=-1, tree_method="hist",
            eval_metric="mlogloss",
        )
        grid = {
            "n_estimators": [100, 200, 300],
            "max_depth": [3, 6, 9],
            "learning_rate": [0.1, 0.2],
        }
    elif best_name == "Random Forest":
        base = RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=-1)
        grid = {
            "n_estimators": [100, 200, 300],
            "max_depth": [None, 10, 20],
            "min_samples_split": [2, 5, 10],
        }
    else:
        base = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
        ])
        grid = {"clf__C": [0.1, 1.0, 10.0]}

    print(f"\nGridSearchCV on {best_name} ({len(grid)} hyper-parameters, cv=5)...")
    search = GridSearchCV(base, grid, cv=5, scoring="accuracy", n_jobs=-1)
    search.fit(X_train, y_train)
    print(f"  Best params: {search.best_params_}")
    print(f"  Best CV accuracy (grid): {search.best_score_:.4f}")

    best_model = search.best_estimator_
    tuned_scores = evaluate(f"{best_name} (tuned)", best_model, X_test, y_test)

    cv = cross_val_score(best_model, X, y, cv=5, scoring="accuracy", n_jobs=-1)
    print(f"  5-fold CV accuracy: {cv.mean():.4f} +/- {cv.std():.4f}")

    pred = best_model.predict(X_test)
    plot_confusion_matrix(
        label_encoder.inverse_transform(y_test),
        label_encoder.inverse_transform(pred),
        label_encoder.classes_,
    )
    importance = plot_feature_importance(best_model, best_name)
    print(f"[PLOTS] Confusion matrix + feature importance saved to {OUTPUT_DIR}/")

    results = {
        "task": "crop_recommendation (classification)",
        "dataset": {
            "rows": int(df.shape[0]),
            "features": FEATURES,
            "n_classes": int(df["label"].nunique()),
            "train_rows": int(X_train.shape[0]),
            "test_rows": int(X_test.shape[0]),
        },
        "model_comparison": comparison,
        "best_model": best_name,
        "best_params": {k: v for k, v in search.best_params_.items()},
        "tuned_test_scores": tuned_scores,
        "cross_validation": {
            "folds": 5,
            "metric": "accuracy",
            "mean": float(cv.mean()),
            "std": float(cv.std()),
            "scores": [float(s) for s in cv],
        },
        "feature_importance": importance,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(results, indent=2))
    print(f"[RESULTS] {RESULTS_PATH}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"model": best_model, "label_encoder": label_encoder,
         "features": FEATURES, "model_name": best_name},
        MODEL_PATH,
    )
    print(f"[MODEL]   {MODEL_PATH}")
    return results


if __name__ == "__main__":
    main()
