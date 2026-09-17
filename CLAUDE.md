# AgriSense — project notes for Claude

ML-based agricultural decision support (CS5305 course project). Two predictions:
**crop recommendation** (classification) and **yield estimation** (regression).

## Architecture

Three layers. The ML layer is the source of truth; the other two wrap it.

```
mobile/   Expo / React Native app (TypeScript, expo-router)
   │  HTTP JSON
api/      FastAPI backend — thin REST wrapper, no ML logic of its own
   │  direct import
src/      ML pipelines + prototype_demo.py (recommend_crop / estimate_yield)
   │  joblib
models/   committed .pkl artefacts (~3 MB total)
```

**The important invariant:** `api/services/*` import `recommend_crop` /
`estimate_yield` from `src/prototype_demo.py` by inserting `src/` on
`sys.path`. The API must never reimplement inference or load models itself —
`api/tests/test_parity.py` asserts endpoint output equals direct function
output, and that is the test that protects this. Model loading is cached at
module level in `prototype_demo.py`; `api/main.py` warms it in a `lifespan`
hook.

## Layout

| Path | Contents |
|---|---|
| `src/crop_recommendation_pipeline.py` | Classification: EDA → compare 3 models → GridSearchCV → save |
| `src/crop_yield_pipeline.py` | Regression: clean → encode → compare → tune → save |
| `src/prototype_demo.py` | `recommend_crop`, `estimate_yield`, `known_*` helpers. **Inference entry point for everything.** |
| `src/streamlit_app.py` | Original Streamlit UI — still works, predates the mobile app |
| `api/routers/` | `predict` (crop, yield), `metadata` (crops, seasons, model-info), `health` |
| `api/services/` | Thin wrappers over `prototype_demo` |
| `mobile/app/` | expo-router screens: `(tabs)/`, `analyze/`, `profile/`, `onboarding` |
| `mobile/services/` | `api.ts` (backend calls) + AsyncStorage services (history, profile, soil, settings) |
| `mobile/constants/` | Design tokens — colors, typography, spacing, theme |
| `tests/`, `api/tests/` | 9 + 13 tests |

## Commands

```bash
# ML layer (repo root, venv active)
pytest                                        # 9 tests
python src/prototype_demo.py                  # CLI demo
python src/crop_recommendation_pipeline.py    # retrain (~1 min)
python src/crop_yield_pipeline.py             # retrain (~2 min)
streamlit run src/streamlit_app.py

# Backend (from repo root — module path api.main matters)
pip install -r api/requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
pytest tests/ api/tests/                      # 22 tests, full suite

# Mobile (from mobile/)
npm install --legacy-peer-deps                # --legacy-peer-deps is required
npx expo start
npx tsc --noEmit                              # type check
```

## Conventions

**API response envelope** — every endpoint returns `success`, plus either
`prediction` + `input_summary` + `timestamp`, or `error` with
`{code, message, details}`. Error codes in use: `VALIDATION_ERROR` (422, from
the custom `RequestValidationError` handler), `UNKNOWN_VALUE` (422, an unknown
crop/season reaching the encoders), `INTERNAL_ERROR` (500), and
`NETWORK_ERROR` (client-side only, set in `mobile/services/api.ts`).

**Unknown crop/season is a 422, not a 500.** `estimate_yield` raises
`ValueError` with a readable message rather than letting a raw scikit-learn
encoder error escape; `predict.py` maps that to `UNKNOWN_VALUE`. Preserve this
chain.

**Yield units vary by crop** (tonnes, bales, nuts — straight from the source
data). Every surface that displays a yield carries the `unit_note` saying
estimates are comparable within a crop, not across crops.

## Gotchas

- **Python 3.11+ required.** pandas, numpy, scikit-learn and matplotlib all
  declare `Requires-Python >= 3.11`. Verified on 3.11.15 and 3.14.3.
- **`.pkl` files are committed on purpose** so tests and the API run without
  training. They are version-sensitive; `api/requirements.txt` pins the same
  scikit-learn/xgboost versions as the root `requirements.txt` for this reason.
  Keep those pins in sync.
- **Mobile → backend URL:** `EXPO_PUBLIC_API_URL`, defaulting to
  `http://10.0.2.2:8000/api/v1` (the Android emulator's route to host
  localhost). A physical device needs the machine's LAN IP.
- **CORS is `["*"]`** in `api/config.py` — deliberate for LAN device testing,
  not production-safe.
- `mobile/` has its own `.gitignore`, `README.md` and `LICENSE`.
- Forest models run with `n_jobs=-1`, so raw JSON metrics can differ in the
  last significant digits between runs. `random_state=42` makes every figure
  reproducible at the precision reported.

## Current metrics

Classification: Random Forest, 99.55% test accuracy, 5-fold CV 0.9927 ± 0.0039.
Regression: XGBoost, R² 0.7403, RMSE 5.0247, MAE 1.6527, 5-fold CV R² 0.7428 ± 0.0254.

`GET /api/v1/metadata/model-info` serves these live from `outputs/*_results.json`,
so they never drift from the last training run. Do not hardcode metrics anywhere.
