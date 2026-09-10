"""Prototype inference layer for the agricultural decision support system.

Loads the trained artefacts from ``models/`` and exposes two plain functions
that the Streamlit UI and the test-suite both call:

    recommend_crop(N, P, K, temperature, humidity, ph, rainfall) -> str
    estimate_yield(temperature, humidity, soil_moisture, area, season, crop) -> float

If the ``.pkl`` files are missing the corresponding training pipeline is run
once to create them; subsequent calls reuse the cached artefacts.
"""

from __future__ import annotations

import sys
from pathlib import Path

import joblib
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

MODELS_DIR = PROJECT_ROOT / "models"
CROP_MODEL_PATH = MODELS_DIR / "crop_model.pkl"
YIELD_MODEL_PATH = MODELS_DIR / "yield_model.pkl"
LE_SEASON_PATH = MODELS_DIR / "le_season.pkl"
LE_CROP_PATH = MODELS_DIR / "le_crop.pkl"

# Module-level caches so the artefacts are read from disk at most once.
_crop_bundle = None
_yield_bundle = None


# --------------------------------------------------------------------------
# Artefact loading (train-once-on-demand)
# --------------------------------------------------------------------------
def _load_crop_bundle():
    """Return the crop-recommendation bundle, training it if it is missing."""
    global _crop_bundle
    if _crop_bundle is not None:
        return _crop_bundle

    if not CROP_MODEL_PATH.exists():
        print("[prototype] crop_model.pkl not found - running the training "
              "pipeline once (this takes a few minutes)...")
        import crop_recommendation_pipeline

        crop_recommendation_pipeline.main()

    _crop_bundle = joblib.load(CROP_MODEL_PATH)
    return _crop_bundle


def _load_yield_bundle():
    """Return (model, le_season, le_crop, features), training if missing."""
    global _yield_bundle
    if _yield_bundle is not None:
        return _yield_bundle

    missing = [p for p in (YIELD_MODEL_PATH, LE_SEASON_PATH, LE_CROP_PATH)
               if not p.exists()]
    if missing:
        print("[prototype] yield artefacts not found - running the training "
              "pipeline once (this takes a few minutes)...")
        import crop_yield_pipeline

        crop_yield_pipeline.main()

    bundle = joblib.load(YIELD_MODEL_PATH)
    _yield_bundle = {
        "model": bundle["model"],
        "features": bundle["features"],
        "model_name": bundle.get("model_name", "unknown"),
        "le_season": joblib.load(LE_SEASON_PATH),
        "le_crop": joblib.load(LE_CROP_PATH),
    }
    return _yield_bundle


# --------------------------------------------------------------------------
# Public helpers used by the Streamlit app
# --------------------------------------------------------------------------
def known_crops() -> list[str]:
    """Crop labels the recommendation model can output."""
    return list(_load_crop_bundle()["label_encoder"].classes_)


def known_yield_crops() -> list[str]:
    """Crop names the yield model was trained on."""
    return list(_load_yield_bundle()["le_crop"].classes_)


def known_seasons() -> list[str]:
    """Season names the yield model was trained on."""
    return list(_load_yield_bundle()["le_season"].classes_)


# --------------------------------------------------------------------------
# Task 1 - crop recommendation
# --------------------------------------------------------------------------
def recommend_crop(N, P, K, temperature, humidity, ph, rainfall) -> str:
    """Recommend the crop best suited to the given soil/weather conditions.

    Args:
        N, P, K: soil nitrogen / phosphorus / potassium content (kg/ha).
        temperature: average temperature in degrees Celsius.
        humidity: relative humidity in percent.
        ph: soil pH.
        rainfall: rainfall in millimetres.

    Returns:
        The recommended crop name, e.g. ``"rice"``.
    """
    bundle = _load_crop_bundle()
    x = np.array([[float(N), float(P), float(K), float(temperature),
                   float(humidity), float(ph), float(rainfall)]], dtype=float)
    encoded = bundle["model"].predict(x)
    return str(bundle["label_encoder"].inverse_transform(encoded)[0])


# --------------------------------------------------------------------------
# Task 2 - yield estimation
# --------------------------------------------------------------------------
def estimate_yield(temperature, humidity, soil_moisture, area, season, crop) -> float:
    """Estimate yield (production per unit area) for a planned cultivation.

    Args:
        temperature: average temperature in degrees Celsius.
        humidity: relative humidity in percent.
        soil_moisture: soil moisture percentage.
        area: cultivated area in hectares (must be positive).
        season: season name, e.g. ``"Kharif"``.
        crop: crop name, e.g. ``"Rice"``.

    Returns:
        Estimated yield as production units per hectare.

    Raises:
        ValueError: if ``area`` is not positive, or if ``season``/``crop`` was
            not present in the training data.
    """
    bundle = _load_yield_bundle()
    le_season, le_crop = bundle["le_season"], bundle["le_crop"]

    area = float(area)
    if area <= 0:
        raise ValueError(f"Area must be greater than 0, got {area}.")

    season_clean = str(season).strip()
    crop_clean = str(crop).strip()

    # Validate against the encoders ourselves so the caller gets a readable
    # message instead of a raw scikit-learn "y contains previously unseen
    # labels" error.
    if season_clean not in set(le_season.classes_):
        raise ValueError(
            f"Unknown season {season_clean!r}. "
            f"Known seasons: {', '.join(le_season.classes_)}."
        )
    if crop_clean not in set(le_crop.classes_):
        raise ValueError(
            f"Unknown crop {crop_clean!r}. This crop was not in the training "
            f"data ({len(le_crop.classes_)} crops known, e.g. "
            f"{', '.join(list(le_crop.classes_)[:5])})."
        )

    x = np.array([[
        float(temperature),
        float(humidity),
        float(soil_moisture),
        area,
        float(le_season.transform([season_clean])[0]),
        float(le_crop.transform([crop_clean])[0]),
    ]], dtype=float)
    return float(bundle["model"].predict(x)[0])


if __name__ == "__main__":
    print("=" * 66)
    print("Agricultural Decision Support System - prototype demo")
    print("=" * 66)

    # --- Example 1: crop recommendation -----------------------------------
    sample = dict(N=90, P=42, K=43, temperature=20.9, humidity=82.0,
                  ph=6.5, rainfall=202.9)
    print("\n[1] Crop recommendation")
    print(f"    Input : {sample}")
    print(f"    Output: {recommend_crop(**sample)}")

    # --- Example 2: yield estimation --------------------------------------
    yield_sample = dict(temperature=36, humidity=42, soil_moisture=54,
                        area=1254.0, season="Kharif", crop="Arecanut")
    print("\n[2] Yield estimation")
    print(f"    Input : {yield_sample}")
    print(f"    Output: {estimate_yield(**yield_sample):.4f} units per hectare")

    # --- Example 3: unknown crop is reported clearly ----------------------
    print("\n[3] Unknown crop handling")
    try:
        estimate_yield(30, 45, 50, 100.0, "Kharif", "Dragonfruit")
    except ValueError as exc:
        print(f"    ValueError: {exc}")
