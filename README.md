# ML-Based Agricultural Decision Support System for Small-Scale Farmers

**CS5305 — Machine Learning course project**

A decision support prototype that answers the two questions a small-scale
farmer faces at the start of a season:

1. **What should I sow?** — a **classification** model that recommends one of
   22 crops from a soil test (N, P, K, pH) and local weather (temperature,
   humidity, rainfall).
2. **How much will I harvest?** — a **regression** model that estimates yield
   (production per hectare) from temperature, humidity, soil moisture, plot
   area, season and crop.

Both models are wrapped in a small Streamlit UI so the system can be
demonstrated without touching the code.

---

## Prediction tasks

| | Task 1 — Crop recommendation | Task 2 — Yield estimation |
|---|---|---|
| Type | Multi-class classification | Regression |
| Target | `label` (22 crops) | `Yield = Production / Area` |
| Features | N, P, K, temperature, humidity, ph, rainfall | Temperature, Humidity, Soil_Moisture, Area, Season, Crop |
| Rows used | 2,200 | 15,000 (sampled from 48,681 cleaned) |
| Best model | Random Forest | XGBoost |
| Headline score | **99.55 %** accuracy | **R² 0.740** |

---

## Datasets

Both CSVs are committed under `data/` and are used as-is — no synthetic data.

| File | Rows | Source |
|---|---|---|
| `data/crop_recommendation.csv` | 2,200 (22 balanced classes, 100 each) | [Gladiator07/Harvestify](https://raw.githubusercontent.com/Gladiator07/Harvestify/master/Data-processed/crop_recommendation.csv) |
| `data/crop_yield_dataset.csv` | 49,999 | [AbhishekKandoi/Crop-Yield-Prediction-based-on-Indian-Agriculture](https://raw.githubusercontent.com/AbhishekKandoi/Crop-Yield-Prediction-based-on-Indian-Agriculture/main/Crop%20Prediction%20dataset.csv) |

The yield dataset needs real cleaning before it is usable — the pipeline logs
each step:

```
Rows before cleaning              : 49999
After dropping invalid Area/Prod  : 49675 (-324)
After 1st-99th percentile clipping: 48681 (-994)
Yield range before clipping       : 0.0005 .. 33089.0055
Yield range after clipping        : 0.1680 .. 129.2316
```

String columns are also whitespace-stripped (the raw file stores
`"Kharif     "`, `"Whole Year "`, …), leaving 6 seasons and 75 crops.

---

## Project structure

```
agri-decision-support/
├── data/
│   ├── crop_recommendation.csv
│   └── crop_yield_dataset.csv
├── src/
│   ├── crop_recommendation_pipeline.py   # classification: EDA → compare → tune → save
│   ├── crop_yield_pipeline.py            # regression: clean → encode → compare → tune → save
│   ├── prototype_demo.py                 # recommend_crop() / estimate_yield()
│   └── streamlit_app.py                  # two-tab web UI
├── models/                               # trained .pkl artefacts (committed, all < 3 MB)
├── outputs/                              # EDA plots, confusion matrix, results JSON
├── tests/
│   └── test_prototype.py
├── requirements.txt
├── .gitignore
├── README.md
└── LICENSE
```

---

## Setup

**Requires Python 3.11 or newer** — the pinned versions of pandas, numpy,
scikit-learn and matplotlib all declare `Requires-Python: >=3.11`. Check with
`python3 --version` before starting.

```bash
git clone https://github.com/kartheeban-chelladurai/agri-decision-support-ml.git
cd agri-decision-support-ml

python3 -m venv .venv
```

Activate it — **macOS / Linux**:

```bash
source .venv/bin/activate
```

**Windows** (Command Prompt or PowerShell):

```
.venv\Scripts\activate
```

Your prompt should now start with `(.venv)`. If it doesn't, the next step
will fail with `'pip' is not recognized` — pip lives inside the venv and only
reaches your PATH once it is activated.

```bash
pip install -r requirements.txt
```

Verified from a clean clone on Linux/Python 3.11 and Windows/Python 3.14:
`pip install -r requirements.txt` succeeds and all 9 tests pass without
retraining, because the trained `.pkl` artefacts are committed.

On Windows use backslashes in the paths below (`python src\prototype_demo.py`,
`streamlit run src\streamlit_app.py`). The first `streamlit run` prompts once
for an email address — press Enter to skip it.

## Running the pipelines

```bash
python src/crop_recommendation_pipeline.py   # ~1 min
python src/crop_yield_pipeline.py            # ~2 min
```

Each script prints dataset statistics, the three-model comparison, the
`GridSearchCV` result and the cross-validation score, then writes its plots to
`outputs/`, its metrics to `outputs/*_results.json`, and its trained model to
`models/`.

## Running the prototype

```bash
python src/prototype_demo.py
```

```
[1] Crop recommendation
    Input : {'N': 90, 'P': 42, 'K': 43, 'temperature': 20.9, 'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}
    Output: rice

[2] Yield estimation
    Input : {'temperature': 36, 'humidity': 42, 'soil_moisture': 54, 'area': 1254.0, 'season': 'Kharif', 'crop': 'Arecanut'}
    Output: 1.2879 units per hectare

[3] Unknown crop handling
    ValueError: Unknown crop 'Dragonfruit'. This crop was not in the training data (75 crops known, e.g. Arecanut, Arhar/Tur, Bajra, Banana, Barley).
```

## Launching the web app

```bash
streamlit run src/streamlit_app.py
```

Opens on <http://localhost:8501> with two tabs — **Crop Recommendation**
(number inputs for N/P/K/temperature/humidity/pH/rainfall) and **Yield
Estimation** (crop and season dropdowns populated from the saved label
encoders, number inputs for the rest).

## Running the tests

```bash
pytest
```

9 tests cover the label range of `recommend_crop`, the sign and type of
`estimate_yield`, and the `ValueError` paths for unknown crop, unknown season
and non-positive area.

---

## Results

All numbers below are the actual output of the two pipeline scripts on this
repository's data (`outputs/crop_classification_results.json` and
`outputs/crop_yield_results.json`). Re-running reproduces them —
`random_state=42` throughout.

### Task 1 — Crop recommendation (classification)

Stratified 80/20 split: 1,760 train / 440 test. Precision, recall and F1 are
weighted averages.

| Model | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| Logistic Regression (baseline) | 0.9727 | 0.9740 | 0.9727 | 0.9725 |
| **Random Forest** | **0.9955** | **0.9957** | **0.9955** | **0.9955** |
| XGBoost | 0.9886 | 0.9894 | 0.9886 | 0.9885 |

**Tuning** — `GridSearchCV` over `n_estimators`, `max_depth`,
`min_samples_split` (5-fold, 27 candidates) selected
`{max_depth: 10, min_samples_split: 5, n_estimators: 100}` with a best grid CV
accuracy of 0.9960. The tuned model scores 0.9955 accuracy on the held-out
test set.

**Cross-validation** — 5-fold accuracy on the full dataset:
**0.9927 ± 0.0039**.

**Feature importance** (tuned Random Forest):

| Feature | Importance |
|---|---|
| rainfall | 0.2231 |
| humidity | 0.2169 |
| K | 0.1834 |
| P | 0.1456 |
| N | 0.1020 |
| temperature | 0.0755 |
| ph | 0.0535 |

Rainfall and humidity dominate — consistent with the agronomy, since the 22
crops separate largely along water requirement.

### Task 2 — Yield estimation (regression)

15,000 rows sampled from the 48,681 cleaned rows; 12,000 train / 3,000 test.

| Model | RMSE | MAE | R² |
|---|---|---|---|
| Linear Regression (baseline) | 9.4949 | 4.6019 | 0.0726 |
| Random Forest | 5.6473 | **1.6607** | 0.6719 |
| **XGBoost** | **5.4483** | 1.7289 | **0.6946** |

**Tuning** — `GridSearchCV` over `n_estimators`, `max_depth`, `learning_rate`
(3-fold, 12 candidates) selected
`{learning_rate: 0.1, max_depth: 4, n_estimators: 200}` with a best grid CV R²
of 0.7346. The tuned model improves the test set to **RMSE 5.0247, MAE 1.6527,
R² 0.7403**.

**Cross-validation** — 5-fold R²: **0.7428 ± 0.0254**.

**Feature importance** (tuned XGBoost):

| Feature | Importance |
|---|---|
| Crop_enc | 0.4949 |
| Season_enc | 0.3404 |
| Area | 0.0850 |
| Temperature | 0.0354 |
| Soil_Moisture | 0.0258 |
| Humidity | 0.0185 |

The crop identity and season account for ~84 % of the signal — different crops
simply have very different yields per hectare, and the weather columns in this
dataset are coarse integers with little variance.

The linear baseline's R² of 0.07 is the interesting result here: yield as a
function of crop and season is strongly non-linear, so a linear model on
label-encoded categoricals has almost nothing to work with. That gap is what
justifies the tree ensembles.

### Generated artefacts

| File | Content |
|---|---|
| `outputs/crop_feature_distributions.png` | Histogram grid of the 7 numeric features |
| `outputs/crop_correlation_heatmap.png` | Feature correlation heatmap |
| `outputs/crop_confusion_matrix.png` | 22×22 confusion matrix, tuned Random Forest |
| `outputs/crop_feature_importance.png` | Feature importance, tuned Random Forest |
| `outputs/yield_pred_vs_actual.png` | Predicted vs actual yield scatter |
| `outputs/yield_feature_importance.png` | Feature importance, tuned XGBoost |
| `outputs/crop_classification_results.json` | All classification metrics |
| `outputs/crop_yield_results.json` | All regression metrics + cleaning stats |

---

## Model artefacts

`models/` holds four files, all small enough to commit:

| File | Size | Content |
|---|---|---|
| `crop_model.pkl` | 2.6 MB | `{model, label_encoder, features, model_name}` |
| `yield_model.pkl` | 336 KB | `{model, features, model_name}` |
| `le_season.pkl` | 4 KB | Fitted `LabelEncoder` for seasons |
| `le_crop.pkl` | 4 KB | Fitted `LabelEncoder` for crops |

**Regenerating them**: delete `models/` and run both pipeline scripts, or just
run `python src/prototype_demo.py` — it trains once on demand when an artefact
is missing and caches the result, so nothing retrains on subsequent calls.

## API

```python
from prototype_demo import recommend_crop, estimate_yield

recommend_crop(N=90, P=42, K=43, temperature=20.9,
               humidity=82.0, ph=6.5, rainfall=202.9)
# 'rice'

estimate_yield(temperature=36, humidity=42, soil_moisture=54,
               area=1254.0, season='Kharif', crop='Arecanut')
# 1.2879...
```

`estimate_yield` raises a descriptive `ValueError` — not a raw scikit-learn
encoder error — when the season or crop was not in the training data, or when
`area` is not positive.

## Limitations

- The yield dataset's weather columns are coarse integers (temperature 25–37,
  humidity 35–55), which caps how much signal a weather-driven model can
  extract; R² 0.74 reflects that ceiling.
- Yield is reported in the dataset's own production units per hectare, which
  vary by crop (tonnes, bales, nuts). Compare estimates within a crop, not
  across crops.
- The crop recommendation dataset is perfectly balanced and synthetic-looking
  in its class separation; 99.5 % accuracy will not transfer directly to raw
  field data.

## License

MIT — see [LICENSE](LICENSE).
