# Running the project locally

Every command below was run end-to-end on both platforms before this document
was written — Windows 11 / Python 3.14.3 and Linux / Python 3.11.15.

---

## Prerequisites

| Requirement | Check with | Notes |
|---|---|---|
| **Python 3.11 or newer** | `python --version` | Hard requirement. pandas, numpy, scikit-learn and matplotlib all declare `Requires-Python >= 3.11`. On 3.10 or older `pip install` fails with *"no matching distribution"*. |
| **git** | `git --version` | Only needed to clone. |

No GPU, no database, no API keys. Everything runs on CPU in a few seconds,
because the trained models are committed to the repository.

---

## Quick start

### Windows (Command Prompt or PowerShell)

Run these **one line at a time**:

```
git clone https://github.com/kartheeban-chelladurai/agri-decision-support-ml.git
cd agri-decision-support-ml
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### macOS / Linux

```bash
git clone https://github.com/kartheeban-chelladurai/agri-decision-support-ml.git
cd agri-decision-support-ml
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

> **After the activate step your prompt must start with `(.venv)`.**
> If it doesn't, the virtual environment is not active and the next command
> fails with `'pip' is not recognized`. See [Troubleshooting](#troubleshooting).

The install takes 1–3 minutes; `xgboost` and `streamlit` are large downloads.

---

## Running it

The three commands below are the whole project. Paths use backslashes on
Windows (`src\prototype_demo.py`) and forward slashes on macOS/Linux
(`src/prototype_demo.py`).

### 1. Run the tests — fastest proof everything works

```
pytest
```

Expected:

```
collected 9 items
tests\test_prototype.py .........                    [100%]
9 passed
```

This finishes in seconds because it loads the committed `.pkl` models rather
than training.

### 2. Run the command-line demo

```
python src/prototype_demo.py          # Windows: python src\prototype_demo.py
```

Expected output:

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

The third block is intentional — it demonstrates the error handling, not a
crash.

### 3. Launch the web app

```
streamlit run src/streamlit_app.py    # Windows: streamlit run src\streamlit_app.py
```

**The first launch asks for an email address. Press Enter to skip it** — it is
Streamlit's optional newsletter signup, not something the app needs.

Your browser then opens <http://localhost:8501> with two tabs:

- **Crop Recommendation** — number inputs for N, P, K, temperature, humidity,
  pH and rainfall. Defaults are pre-filled, so you can just click
  *Recommend crop*.
- **Yield Estimation** — crop and season dropdowns (populated from the saved
  label encoders), plus temperature, humidity, soil moisture and area. Click
  *Estimate yield*.

Stop the server with **Ctrl+C** in the terminal.

---

## Optional: retrain the models yourself

Not required — the trained models are committed. Do this only to reproduce the
metrics in the README from scratch.

```
python src/crop_recommendation_pipeline.py    # ~1 minute
python src/crop_yield_pipeline.py             # ~2 minutes
```

Each script prints its dataset summary, the three-model comparison, the
`GridSearchCV` result and the cross-validation score, then overwrites
`models/` and `outputs/`.

`random_state=42` is set throughout, so you should reproduce every figure in
the README at the precision shown. The raw JSON may differ in the last couple
of significant digits — the forest models run with `n_jobs=-1`, and parallel
float reduction is not bit-deterministic.

---

## Coming back later

The virtual environment persists, so a new terminal session only needs:

```
cd agri-decision-support-ml
.venv\Scripts\activate                 # macOS/Linux: source .venv/bin/activate
```

Leave the environment with `deactivate`.

To pick up the latest changes:

```
git pull
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `'source' is not recognized as an internal or external command` | Used the macOS/Linux activate command on Windows. | Run `.venv\Scripts\activate` instead. |
| `'pip' is not recognized...` | The virtual environment is not activated — `pip` lives in `.venv\Scripts\`. | Activate first; confirm your prompt starts with `(.venv)`. |
| `'python3' is not recognized` (Windows) | Windows usually installs the command as `python`. | Use `python` instead of `python3`. |
| `ERROR: Could not find a version that satisfies the requirement pandas==3.0.5` | Python older than 3.11. | Check `python --version` and install 3.11+. |
| `ModuleNotFoundError: No module named 'pandas'` when running a script | Environment not activated, or a different Python is being used. | Re-activate, then re-run. |
| `Port 8501 is already in use` | Another Streamlit instance is running. | Stop it with Ctrl+C, or run `streamlit run src/streamlit_app.py --server.port 8502`. |
| A pickle, `InconsistentVersionWarning`, or attribute error when loading a model | The committed `.pkl` files were written by the pinned library versions; something else is installed. | Confirm the venv is active, then regenerate: run both pipeline scripts (see above). |
| Streamlit sits at `Email:` | First-run newsletter prompt. | Press Enter. |

---

## What gets created

Nothing below is required to exist before you start — the repository ships
with all of it, and the pipeline scripts regenerate it.

| Path | Contents |
|---|---|
| `models/crop_model.pkl` | Tuned Random Forest classifier + label encoder (2.6 MB) |
| `models/yield_model.pkl` | Tuned XGBoost regressor (336 KB) |
| `models/le_season.pkl`, `models/le_crop.pkl` | Fitted `LabelEncoder`s for the yield model |
| `outputs/*.png` | EDA plots, confusion matrix, predicted-vs-actual, feature importances |
| `outputs/*_results.json` | Full metrics for both tasks |
| `.venv/` | Your virtual environment — git-ignored, never committed |
