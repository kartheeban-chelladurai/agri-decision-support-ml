# AgriSense — slide-by-slide speaker notes

Companion to `docs/AgriSense_PBL_Final_Review.pptx`. For each slide: what is on
it, what to say, and the deeper detail to fall back on if the examiner probes.

Everything here matches the code in this repository — file names, function
names and numbers are real.

---

# Slide 1 — Title

**On screen:** course title, project title, both team members, mentor.

**Say (15 seconds):**

> "Good morning. Our project is AgriSense — an ML-based agricultural decision
> support system for small-scale farmers. I am Kartheeban, with Nishanth, from
> Computer Science and Engineering, guided by Ms. Rajapriya."

Do not explain anything yet. Move on.

---

# Slide 2 — Problem & Objectives

This slide carries the **problem statement** and the **proposed solution**.
It is the one that decides whether the rest of your talk lands.

## 2.1 The problem statement, explained

**The one-sentence version:** a small-scale farmer has to decide what to sow
and how much to expect, and has no data-driven way to do either.

**Unpack it in four layers:**

**1. The decision.** Every season a farmer makes two choices that determine the
whole year's income — crop selection and expected output. Crop selection
fixes everything downstream: seed cost, water requirement, labour, time to
harvest, which market. Expected output drives storage, transport and credit
decisions.

**2. Why it is hard today.** The decision is made from experience, from what
the neighbour sowed, or from what was sown last year. These are not wrong, but
they are not responsive to this season's actual conditions.

**3. The information gap — this is the key insight.** The farmer is not short
of *data*. A soil test card already reports nitrogen, phosphorus, potassium and
pH. Weather data is on a phone. What is missing is the **mapping** from those
numbers to a decision. Nobody converts "N 90, P 42, K 43, pH 6.5, rainfall
203 mm" into "sow rice". That translation normally needs an agronomist, and
there is no agronomist per plot per season.

**4. Why it matters.** The cost of a wrong choice is a whole season — you
cannot undo a sowing decision in month three. And the spread is enormous: in
the yield dataset we used, output ranges across four orders of magnitude.

**Who is affected:** farmers working single small plots, who carry the entire
downside themselves with no diversification to absorb it.

> **If asked "why can't an agronomist just do this?"** — they can, and they do
> it better. The constraint is availability, not capability. One expert cannot
> advise thousands of plots every season. A model can be consulted an unlimited
> number of times at zero marginal cost. We are not replacing expertise; we are
> making a narrow slice of it available where none is available at all.

## 2.2 The proposed solution, explained

**The one-sentence version:** two trained models that turn a soil test into a
crop recommendation and a yield estimate, delivered through a mobile app.

**Three decisions make up the solution:**

**Decision 1 — two models, not one.** The two questions are different learning
problems:

| | What to sow | How much |
|---|---|---|
| Type | Multi-class classification | Regression |
| Output | One of 22 crop labels | A continuous number |
| Target | `label` | `Yield = Production / Area` |
| Best model | Random Forest | XGBoost |

A single model cannot produce both a category and a quantity. Treating them
separately also let us pick the best algorithm independently for each — and we
did end up with different winners.

**Decision 2 — use existing public data, not collected data.** We deliberately
did not gather our own field data. Two public datasets already contain the
soil-weather-crop relationships we need. This is the difference between a
project that works and one that spends its entire duration on data collection.

**Decision 3 — ship it as an app, not a notebook.** A model in a Jupyter
notebook helps nobody. The solution only counts if the intended user can
operate it. So the models sit behind a REST API and a mobile app: seven numbers
in, an answer out, no code.

## 2.3 Objectives, as stated on the slide

1. **Identify** which soil and weather variables actually drive crop choice and
   yield — the feature-importance analysis.
2. **Develop** the two models.
3. **Apply** ML to turn one soil test into an actionable decision.
4. **Evaluate** on held-out data with cross-validation, then tune.

## 2.4 Expected outcome

A system that recommends one of 22 crops from a soil test and estimates the
yield of that crop on a given plot, delivered as a React Native app over a
FastAPI service — with every reported figure read from the training run's JSON
output rather than typed in by hand.

---

# Slide 3 — Input, Analysis & Insights

## 3.1 Input — the data

| | Crop recommendation | Yield estimation |
|---|---|---|
| Rows | 2,200 | 49,999 |
| Classes / categories | 22 crops, 100 rows each | 75 crops, 6 seasons |
| Features | N, P, K, temperature, humidity, pH, rainfall | temperature, humidity, soil moisture, area, season, crop |

Both are public CSVs, committed to the repository and used as-is. No synthetic
rows.

## 3.2 Analysis — the cleaning chain

Say this as a **sequence of numbers**, because it shows the work:

> "49,999 rows. Drop rows with invalid area or production — 49,675. Clip to the
> 1st–99th percentile of yield — 48,681. Then sample 15,000 for training."

Why each step:

- **Whitespace stripping.** The raw file stores `"Kharif     "` and
  `"Whole Year "` with trailing spaces. Without stripping, those become
  separate categories from `"Kharif"` — silently corrupting the encoder.
- **Dropping invalid rows (−324).** Area or production of zero or missing makes
  `Production / Area` undefined or infinite.
- **Percentile clipping (−994, about 2 %).** Before clipping, yield ranged from
  0.0005 to **33,089** units per hectare. 33,089 is not agronomically possible —
  those are unit or data-entry errors. After clipping: 0.168 to 129.2.
- **Label encoding.** Season and crop become integers, and the fitted encoders
  are saved next to the model so the app encodes new input exactly as training
  did.

> **Why percentile and not z-score?** The distribution is heavily right-skewed,
> so a mean-and-standard-deviation rule would be dragged by the very outliers
> we want removed. A percentile rule does not depend on the mean.

## 3.3 Key insights — what the data told us

**Insight 1 — crop choice is driven by water, then potassium.**
rainfall 0.223, humidity 0.217, K 0.183, P 0.146, N 0.102, temperature 0.076,
pH 0.053. Rainfall and humidity together decide water availability, which is
the first constraint on what can grow at all.

**Insight 2 — yield is driven by the crop itself, not the field.**
Crop identity 0.495 and season 0.340 together are **83 %** of the model's
decisions. Every environmental variable we measured contributes under 9 %.

**Insight 3 — the two tasks are not equally hard.** Crop classes separate
cleanly (99.55 % accuracy). Yield does not (best R² 0.740). Insight 2 explains
insight 3: yield depends mostly on things that are not in the data.

---

# Slide 4 — Technical Approach

This is the slide you will be questioned on hardest. It has three boxes:
architecture, methodology, tech stack.

## 4.1 Architecture — three layers

```
┌─────────────────────────────────────────┐
│  mobile/   React Native + Expo          │   Presentation
│            screens, forms, AsyncStorage │
└───────────────────┬─────────────────────┘
                    │  HTTP, JSON over REST
┌───────────────────▼─────────────────────┐
│  api/      FastAPI + Pydantic           │   Service
│            validation, routing, errors  │
└───────────────────┬─────────────────────┘
                    │  direct Python import
┌───────────────────▼─────────────────────┐
│  src/      prototype_demo.py            │   Inference
│            recommend_crop/estimate_yield│
└───────────────────┬─────────────────────┘
                    │  joblib
┌───────────────────▼─────────────────────┐
│  models/   crop_model.pkl, yield_model  │   Artefacts
│            + the two label encoders     │
└─────────────────────────────────────────┘
```

**What each layer is responsible for, and what it must never do:**

| Layer | Does | Must never do |
|---|---|---|
| `mobile/` | Collect input, show results, store history on-device | Contain any prediction logic |
| `api/` | Validate, route, shape responses, map errors | Load a model or reimplement inference |
| `src/` | All inference, all model loading and caching | Know anything about HTTP |
| `models/` | Hold the fitted artefacts | — |

**The invariant that holds it together:** `api/services/` puts `src/` on
`sys.path` and imports `recommend_crop` and `estimate_yield` directly. The API
calls the *same function* the test suite calls. It never loads a model itself.

**Why that matters:** if the API reimplemented inference, the app could show one
answer while the model computed another, and nobody would notice. The bug would
be silent and the demo would still look fine.

**How we prove it:** `api/tests/test_parity.py` calls the endpoint and the
function directly with the same input and asserts the outputs are equal to
1e-5. If anyone breaks the invariant, that test fails.

> **If asked "why three layers and not one Flask file?"** — separation of
> concerns, and testability. We can test inference with no server running, test
> the API with no app running, and swap the app for a web UI without touching
> the model. The Streamlit UI in `src/streamlit_app.py` still works and is proof
> of that.

## 4.2 Workflow — how it actually works

### Workflow A: training (offline, run once)

`python src/crop_recommendation_pipeline.py`

```
Load CSV
  → EDA plots (distributions, correlation heatmap)
  → LabelEncoder on the crop label
  → train_test_split(test_size=0.2, stratify=y, random_state=42)
  → fit 3 models on the SAME split
       Logistic Regression (inside a Pipeline with StandardScaler)
       Random Forest
       XGBoost
  → pick the winner by weighted F1
  → GridSearchCV(cv=5, scoring="accuracy") on the winner
  → cross_val_score(cv=5) over the full dataset to confirm
  → save: models/crop_model.pkl   {model, label_encoder, features, model_name}
          outputs/crop_classification_results.json
          outputs/*.png
```

The yield pipeline is the same shape with the cleaning chain in front and
`scoring="r2"`.

**Three things to point out about this workflow:**

1. **All three models see the identical split.** The comparison is fair.
2. **The scaler is inside a `Pipeline`.** During cross-validation it is
   re-fitted on each training fold, so no test statistics leak into training.
3. **The model is saved as a bundle, not a bare estimator.** `crop_model.pkl`
   holds the model *and* its label encoder *and* the feature order. Loading it
   gives you everything needed to make a prediction identical to training.

### Workflow B: inference (runtime, every tap)

Trace one request end to end:

**1. The app.** User fills the form in
`mobile/app/analyze/crop-recommendation.tsx` and taps Get Recommendation.
`handleSubmit` checks no field is empty and every value parses as a number.

**2. The call.** `mobile/services/api.ts` POSTs JSON to
`${EXPO_PUBLIC_API_URL}/predict/crop`.

**3. CORS and routing.** FastAPI's CORS middleware admits the request;
`api/routers/predict.py::predict_crop` receives it.

**4. Validation.** Pydantic parses the body into `CropRecommendationRequest`.
If a field is missing or the wrong type, the request **never reaches the
model** — our custom `RequestValidationError` handler in `api/main.py` returns
**422** with code `VALIDATION_ERROR` and a per-field list of what was wrong.

**5. Crossing into the ML layer.**
`api/services/crop_recommendation.py` inserts `src/` on `sys.path` and calls
`prototype_demo.recommend_crop(...)`.

**6. The model.** `_load_crop_bundle()` returns the bundle from a module-level
cache — already warmed at server startup by the `lifespan` hook in
`api/main.py`, so the first user does not pay the disk read. Features are
assembled in the saved order, `model.predict` returns an encoded integer, and
`label_encoder.inverse_transform` turns it back into `"rice"`.

**7. The response envelope.** The router wraps it:

```json
{
  "success": true,
  "prediction": { "crop": "rice", "model_used": "Random Forest", "analyzed_crops": 22 },
  "input_summary": { "N": 90.0, "P": 42.0, ... },
  "timestamp": "2026-10-08T04:52:04Z"
}
```

`input_summary` is echoed back deliberately — the result screen shows the user
exactly which inputs produced the answer, so the recommendation can be
questioned rather than just trusted.

**8. Back in the app.** The result renders in `crop-result.tsx`, and
`historyService` writes the record to AsyncStorage on the device.

**The yield path differs in two ways:**

- `estimate_yield` raises a readable `ValueError` for an unknown crop or
  season, or a non-positive area, instead of letting a raw scikit-learn encoder
  error escape. The router maps it to **422 `UNKNOWN_VALUE`** — a client error,
  not a server crash.
- The response carries `yield_value`, `total_production` (yield × area), and a
  `unit_note` stating that estimates are comparable within a crop only.

### Error codes, and what each means

| Code | HTTP | Raised when |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Pydantic rejected the request body |
| `UNKNOWN_VALUE` | 422 | A crop or season the encoder has never seen |
| `INTERNAL_ERROR` | 500 | Anything unexpected inside the handler |
| `NETWORK_ERROR` | — | Client-side only; the app could not reach the backend |

## 4.3 Tech stack — what, and why

### ML layer

| Technology | What it does here | Why it, and not the alternative |
|---|---|---|
| **Python 3.11+** | Language for the ML and API layers | The entire scientific stack is Python-first |
| **pandas** | Load CSVs, clean, derive `Yield`, strip whitespace | Vectorised operations over 50,000 rows without loops |
| **NumPy** | Numeric arrays into the models | The array format every scikit-learn estimator expects |
| **scikit-learn** | `train_test_split`, `LabelEncoder`, `StandardScaler`, `Pipeline`, `GridSearchCV`, `cross_val_score`, Random Forest, Logistic/Linear Regression, metrics | One consistent `fit`/`predict` interface, so swapping a model is a one-line change |
| **XGBoost** | Gradient-boosted trees; won the regression task | Usually stronger than Random Forest on tabular regression, and it was here — R² 0.695 vs 0.672 before tuning |
| **joblib** | Save and load the fitted models | More efficient than `pickle` for the large NumPy arrays inside a forest |
| **matplotlib** | Confusion matrix, feature importance, predicted-vs-actual, EDA | Figures are generated by the pipeline, not drawn by hand, so they cannot drift from the model |

### Backend layer

| Technology | What it does here | Why it |
|---|---|---|
| **FastAPI** | REST endpoints, routing, OpenAPI docs | Validation is declarative via type hints; `/docs` gives a live API explorer for free |
| **Pydantic** | Request and response schemas | A malformed request is rejected *before* the model is called — validation and documentation from one definition |
| **Uvicorn** | ASGI server | FastAPI's standard runtime |

> **Why FastAPI and not Flask?** With Flask we would hand-write type checking
> and range validation in every route, and keep the API docs in sync manually.
> Pydantic does both from the schema. For a project where bad input is the
> expected failure mode, that is the whole ballgame.

### Mobile layer

| Technology | What it does here | Why it |
|---|---|---|
| **React Native 0.86** | The UI | One codebase for Android, iOS and web |
| **Expo SDK 57** | Tooling, dev server, bundling | Runs on a phone through Expo Go with no Android Studio install |
| **TypeScript** | Types across screens, services, API contracts | The API response shape is a compile-time type, so a backend change that breaks the client fails at build rather than on a user's phone |
| **Expo Router** | File-based navigation | The folder structure *is* the navigation graph — `app/analyze/crop-result.tsx` is the route |
| **AsyncStorage** | Profile, soil card, analysis history | Local key-value storage; works offline and needs no backend database |
| **react-native-svg** | Chart and icon rendering | Required by the UI components |

### Testing and tooling

| Technology | What it does here |
|---|---|
| **pytest** | 22 tests — 9 for the ML layer, 13 for the API, including the parity test |
| **Git / GitHub** | Version control; models and data committed so a clean clone runs with no training step |

> **Why is there no database?** The backend is **stateless** — it holds no user
> data between requests. Everything the user owns (profile, soil card, history)
> lives on their device in AsyncStorage. That removes an entire class of
> privacy and deployment concerns, and it means the app's history works with no
> network at all.

---

# Slide 5 — Feasibility, Risk and Challenges

**Feasibility, in four dimensions:**

- **Technical** — both models train in minutes on a laptop CPU; the saved
  artefacts total about 3 MB. No GPU, no cloud.
- **Economic** — entirely open-source tooling and public datasets. No licence
  cost, no hardware cost.
- **Operational** — the farmer enters seven values. Models stay cached in
  memory, so there is no retraining per request.
- **Reproducible** — fixed random seed, pinned dependency versions, models
  committed to the repository.

**Risks, stated honestly** (the slide lists seven; know these three cold):

1. **Yield is genuinely hard.** R² 0.740 leaves about a quarter of the test
   variance unexplained.
2. **Yield units are not uniform.** The source data mixes tonnes, bales and
   nuts, so estimates compare within a crop only. We print that note on every
   screen that shows a yield rather than hide it.
3. **The crop dataset is perfectly balanced** at 100 rows per class, which
   flatters accuracy relative to a real, skewed field distribution.

**Mitigation:** present yield as a planning estimate with its unit note; keep a
held-out test set plus 5-fold cross-validation behind every number; validate at
three layers — Pydantic schemas, encoder guards, and 22 automated tests.

---

# Slide 6 — Result and Applications

**Lead with the two headline lines, then let the screenshots talk.**

> "Crop recommendation — Random Forest: 99.55 % test accuracy, weighted F1
> 0.9955, 5-fold CV 0.9927 ± 0.0039.
> Yield estimation — tuned XGBoost: R² 0.740, RMSE 5.025, MAE 1.653."

**Pre-empt the overfitting question before it is asked:**

> "That 99.55 % is on a held-out test set, and 5-fold cross-validation over the
> whole dataset gives 0.9927 with a standard deviation of 0.0039 — so it is not
> one lucky split. Only 2 of 440 test rows were wrong."

**If asked which two:** one blackgram predicted as maize, one rice predicted as
jute. Rice and jute are both high-rainfall monsoon crops, so that confusion is
agronomically sensible.

**The scatter plot on the right** is predicted versus actual yield. Points
cluster along the diagonal at low yields and spread at high yields — that is
R² 0.74 made visible, and it is why we call it a planning estimate.

**Applications:** pre-season sowing advice from a soil-test card; yield
planning for storage and credit; advisory at farmer-producer-organisation
scale; a field tool for agriculture extension officers; a teaching example of
applied ML.

---

# Slide 7 — Conclusion, Limitations & Future Scope

**Conclusion, in one breath:** a three-layer system — scikit-learn and XGBoost
models, a FastAPI service, a React Native app — trained on 2,200 soil records
and 48,681 cleaned yield records, reaching 99.55 % accuracy and R² 0.740, with
a parity test keeping the app's answer identical to the model's and all 22
tests passing on a clean checkout.

**The finding worth stating:** crop choice proved almost separable from soil
and weather alone; yield depends far more on crop and season than on anything
measured in the field.

**Limitations — say them before you are asked.** 2,200 rows with perfectly
balanced classes; no year or location in the yield data, so no regional
validation; R² 0.740 leaves a quarter of the variance unexplained; no field
trial with real farmers.

**Future scope, in priority order.** Add region and year to the yield features
and retrain per agro-climatic zone — that directly attacks the biggest
limitation. Then confidence intervals instead of a single number; on-device
inference so the app works without a network; regional-language UI and voice
input.

---

# Slide 8 — Thank You

Names, department, GitHub link, project video link. Invite questions.

---

# The four sentences to have ready

If you remember nothing else, these cover most of what you will be asked:

1. **Problem.** "A soil card gives a farmer N, P, K and pH but nothing that
   maps those numbers to a crop — that translation needs an agronomist, and
   there isn't one per plot per season."
2. **Solution.** "Two models — classification for which crop, regression for
   how much — behind a REST API and a mobile app, so the user never touches
   code."
3. **Architecture.** "Three layers, and the API never reimplements inference —
   it imports the same function the tests call, and a parity test proves they
   agree to 1e-5."
4. **Results.** "99.55 % on a held-out test set, cross-validated at
   0.9927 ± 0.0039; yield at R² 0.740, which we report as a planning estimate
   because a quarter of the variance is unexplained."
