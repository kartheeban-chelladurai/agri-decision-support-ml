# AgriSense — likely examiner questions, with answers

Every figure here is from this repository's own training output
(`outputs/crop_classification_results.json`, `outputs/crop_yield_results.json`).
If you quote a number in the viva, it is one you can show on screen.

---

## 1. Problem and scope

**Q. What problem does this solve?**
A small-scale farmer makes two decisions each season — what to sow, and how
much to expect from it. Both are usually made from experience. A soil test
card gives N, P, K and pH but nothing that maps those to a suitable crop. We
built two models: one recommends a crop from soil and weather, the other
estimates yield for a chosen crop on a given plot.

**Q. Why two models instead of one?**
They are different learning problems. "Which crop?" is multi-class
classification with 22 discrete outputs. "How much?" is regression over a
continuous value. One model cannot do both.

**Q. Who is the user, and would they actually use it?**
A farmer with a soil-test card and a phone. The app asks for seven numbers and
returns an answer in one tap. We have not run a field trial — that is a stated
limitation, not a claim we are making.

---

## 2. The data

**Q. Where did the datasets come from?**
Two public datasets, committed to the repository and used as-is:

| | Rows | Content |
|---|---|---|
| `crop_recommendation.csv` | 2,200 | 22 crops, 100 rows each; N, P, K, temperature, humidity, pH, rainfall |
| `crop_yield_dataset.csv` | 49,999 | 75 crops, 6 seasons; temperature, humidity, soil moisture, area, production |

**Q. Did you create any synthetic data?**
No. Every row is from the source files.

**Q. The crop dataset has exactly 100 rows per class. Is that realistic?**
No, and we say so. Real sowing distributions are heavily skewed. A perfectly
balanced dataset makes accuracy look better than it would in the field. It is
listed as a limitation in the report.

**Q. How big is your test set?**
440 rows for classification (20 % of 2,200, stratified), 3,000 for regression
(20 % of the 15,000 sampled).

---

## 3. Preprocessing

**Q. Walk me through your cleaning for the yield data.**
Four steps, and the pipeline prints the row count after each:

1. Strip whitespace from column names and string values — the raw file stores
   `"Kharif     "` and `"Whole Year "`, which would otherwise become separate
   categories.
2. Drop rows with invalid Area or Production: 49,999 → **49,675** (−324).
3. Derive `Yield = Production / Area`.
4. Keep only the 1st–99th percentile of Yield: 49,675 → **48,681** (−994).

**Q. Why did you clip the extremes?**
Before clipping, yield ranged from 0.0005 to **33,089** units per hectare.
Thirty-three thousand units per hectare is not agronomically possible — those
are unit or data-entry errors. After clipping the range is 0.168 to 129.2,
which is plausible. It cost us 2 % of the rows.

**Q. Why percentile clipping and not z-score or IQR?**
The distribution is heavily right-skewed, so a mean-and-standard-deviation rule
would be dragged by the very outliers we want to remove. A percentile rule
does not depend on the mean.

**Q. How did you handle the categorical columns?**
`LabelEncoder` on Season and Crop, giving `Season_enc` and `Crop_enc`. The
encoders are saved alongside the model (`le_season.pkl`, `le_crop.pkl`) so the
app encodes new input exactly as training did.

**Q. (Hard) Label encoding gives Crop an artificial ordering. Isn't that wrong?**
It is wrong for a *linear* model — it tells linear regression that crop 40 is
"twice" crop 20, which is meaningless. That is part of why Linear Regression
scores R² 0.07 here. Tree models split on thresholds and can isolate any group
of codes, so they tolerate it. **One-hot encoding or target encoding would be
the correct fix**, and with 75 crops one-hot is only 75 extra columns — that is
listed in our future scope.

**Q. Did you scale the features?**
Only where it matters. `StandardScaler` sits inside a `Pipeline` with Logistic
Regression and Linear Regression, which are scale-sensitive. Random Forest and
XGBoost are not, so they get raw features.

**Q. (Hard) Does the scaler leak test data into training?**
No. It is inside a scikit-learn `Pipeline`, so during cross-validation it is
re-fitted on each training fold only. The split happens before any fitting.

**Q. Why sample 15,000 rows instead of using all 48,681?**
Grid search over three hyper-parameters on the full set was slow on a laptop.
We sampled with `random_state=42` so the sample is reproducible. Training on
the full set is a reasonable next step and might improve R².

---

## 4. Model selection

**Q. Which models did you try?**
Three per task, on the same split:

| Task | Models compared |
|---|---|
| Crop recommendation | Logistic Regression, Random Forest, XGBoost |
| Yield estimation | Linear Regression, Random Forest, XGBoost |

**Q. How did you pick the winner?**
Empirically, not by preference. Classification is chosen by weighted F1,
regression by R². The winner is then tuned with `GridSearchCV` and confirmed
with 5-fold cross-validation.

**Q. Classification results?**

| Model | Accuracy | Weighted F1 |
|---|---|---|
| Logistic Regression | 0.9727 | 0.9725 |
| **Random Forest** | **0.9955** | **0.9955** |
| XGBoost | 0.9886 | 0.9885 |

**Q. Why did Random Forest beat XGBoost here?**
With 1,760 training rows and 22 well-separated classes, bagging is enough.
Boosting's advantage is fitting hard residuals, and there are very few hard
cases. XGBoost's extra capacity gained nothing — it lost by 0.7 points.

**Q. Regression results?**

| Model | R² | RMSE | MAE |
|---|---|---|---|
| Linear Regression | 0.0726 | 9.495 | 4.602 |
| Random Forest | 0.6719 | 5.647 | 1.661 |
| **XGBoost** | **0.6946** | **5.448** | 1.729 |
| **XGBoost (tuned)** | **0.7403** | **5.025** | **1.653** |

**Q. Why is Linear Regression so bad — R² 0.07?**
Two reasons. The relationship is non-linear, and the dominant predictor is
crop identity, which is a category that a linear model cannot use from a
label-encoded integer. It is a useful result: it shows the problem genuinely
needs a non-linear model, so our choice is justified rather than assumed.

**Q. What did grid search change?**
Classification: `n_estimators=100, max_depth=10, min_samples_split=5` — the
same test accuracy with a smaller, faster model.
Regression: `n_estimators=200, max_depth=4, learning_rate=0.1` — R² rose from
0.6946 to **0.7403**, a genuine improvement.

**Q. (Hard) Tuning did not improve classification accuracy at all. Why report it?**
Because that is the honest result. It picked a model with half the trees and a
depth cap, which is less likely to overfit and faster to run, at identical
accuracy. Reporting only the changes that flatter us would be dishonest.

---

## 5. Evaluation — expect the hardest questions here

**Q. 99.55 % accuracy. Is your model overfitting?**
Four pieces of evidence that it is not:
1. That figure is on a **held-out test set** of 440 rows never used in training.
2. **5-fold cross-validation over the whole dataset gives 0.9927 ± 0.0039** —
   consistent across folds, so it is not one lucky split.
3. Only **2 of 440** test rows were misclassified.
4. Even Logistic Regression, a linear model with almost no capacity to
   overfit, reaches 97.3 %. The task is genuinely easy, not the model
   suspiciously good.

**Q. So why is it so easy?**
The 22 classes occupy nearly non-overlapping regions of the seven-dimensional
feature space, and the dataset is perfectly balanced with no noise. Real field
data would be noisier and skewed, so we expect a lower number in practice. We
say this in the limitations.

**Q. Which crops did it confuse?**
Exactly two rows: one **blackgram predicted as maize**, and one **rice
predicted as jute**. Rice and jute are both high-rainfall, high-humidity
monsoon crops, so that confusion is agronomically sensible.

**Q. Why is accuracy a fair metric for 22 classes?**
Because the classes are balanced at 100 each, so accuracy is not inflated by a
dominant class. We also report weighted precision, recall and F1, and they all
land within 0.0003 of each other — which is what you expect on balanced data.

**Q. What is the baseline you are beating?**
Random guessing on 22 balanced classes is 1/22 = **4.5 %**. The majority-class
baseline is the same, since all classes are equal. Our real baseline is
Logistic Regression at 97.3 %.

**Q. Explain R² 0.74 in plain language.**
The model explains about 74 % of the variance in test-set yield. The remaining
26 % is driven by things not in the data — rainfall timing, soil type,
irrigation, fertiliser, pest events, the year.

**Q. Why report both RMSE and MAE?**
MAE (1.65) is the average error in the original units. RMSE (5.02) squares
errors before averaging, so it is dominated by the few large misses. RMSE being
three times MAE tells you the errors are not uniform — most predictions are
close and a minority are badly wrong. One number alone would hide that.

**Q. Why is yield so much harder than crop choice?**
Crop choice is determined by the conditions we measured. Yield is determined
mostly by things we did not measure. Our own feature importances say so:
crop identity (0.495) and season (0.340) together account for 83 % of the
model's decisions, while every environmental variable we have contributes
under 9 %.

**Q. Was cross-validation done on the full dataset or the training set?**
`cross_val_score` runs over the full `X, y` — so the folds are independent of
our single train/test split, and the agreement between the two is meaningful.

---

## 6. Feature importance

**Q. Which features drive crop recommendation?**

| Feature | Importance |
|---|---|
| rainfall | 0.223 |
| humidity | 0.217 |
| K | 0.183 |
| P | 0.146 |
| N | 0.102 |
| temperature | 0.076 |
| pH | 0.053 |

**Q. Does that make agronomic sense?**
Yes. Rainfall and humidity together decide water availability, which is the
first constraint on what can grow. Potassium and phosphorus differentiate
pulses from cereals from fruit. pH matters least here because this dataset's
pH range is narrow across most crops — it does not mean pH is unimportant in
agriculture.

**Q. And for yield?**
Crop 0.495, Season 0.340, Area 0.085, Temperature 0.035, Soil moisture 0.026,
Humidity 0.019. The model is mostly learning "this crop in this season yields
about this much", which is a sensible prior but not a precise forecast.

---

## 7. System design

**Q. Describe the architecture.**
Three layers. `src/` holds the models and `prototype_demo.py`, the single
inference entry point. `api/` is a FastAPI service that wraps it over REST and
contains no ML logic of its own. `mobile/` is a React Native app built with
Expo that calls the API.

**Q. Why separate the API from the model?**
So the app never reimplements inference. Any drift between what the app shows
and what the model computes would be a silent bug. The API imports the same
function the test suite calls.

**Q. How do you *prove* they agree?**
`api/tests/test_parity.py` calls the endpoint and the function directly with
the same input and asserts the outputs are equal to 1e-5. If anyone
reimplements inference in the API, that test fails.

**Q. How many tests are there?**
22 — 9 for the ML layer, 13 for the API. They pass on a fresh clone because
the trained `.pkl` files are committed, so no training step is required.

**Q. Why FastAPI?**
Pydantic schemas give request validation for free, so a malformed request is
rejected with a 422 before it reaches the model. It also generates interactive
API docs at `/docs` with no extra code.

**Q. What happens if the user sends a crop the model has never seen?**
`estimate_yield` raises a `ValueError` with a readable message rather than
letting a raw scikit-learn encoder error escape. The router maps that to a 422
with error code `UNKNOWN_VALUE`. It is a client error, not a server crash.

**Q. Why are the `.pkl` files committed to Git?**
So the project runs on a fresh clone without a training step — the examiner can
check it out and the tests pass. They total about 3 MB. They are
version-sensitive, so `api/requirements.txt` pins the same scikit-learn and
XGBoost versions as the root file.

**Q. Where is user data stored?**
On the device, in AsyncStorage — profile, soil card and analysis history. The
backend is stateless and stores nothing.

**Q. Is this production ready?**
No. CORS is `["*"]` for LAN testing, there is no authentication, and it runs on
a development server. Those are deliberate choices for a prototype and we would
change all three before deploying.

---

## 8. Honesty questions

**Q. What is the weakest part of this project?**
The yield model. R² 0.74 means a quarter of the variance is unexplained, and
the features we have are not the ones that matter most. We report it as a
planning estimate, not a forecast.

**Q. The yield number has no unit. Why?**
Because the source dataset mixes units across crops — tonnes for cereals,
bales for cotton, nuts for coconut. There is no single standard measure to
convert to. Rather than invent one, every screen that shows a yield carries a
note saying estimates are comparable within a crop only.

**Q. Have you validated this with a real farmer?**
No. No field trial, no farmer feedback. It is a prototype evaluated on public
data, and we have not claimed otherwise anywhere in the report.

**Q. What would make these results untrustworthy?**
Applying them outside the data's range. Neither dataset records year or
region, so we cannot say the model holds for a particular district or season.
That is why "add region and year, retrain per agro-climatic zone" is our first
future-scope item.

---

## 9. Theory you must be able to answer in one line

| Question | Answer |
|---|---|
| What is Random Forest? | Many decision trees trained on bootstrap samples with random feature subsets; they vote. Averaging reduces variance. |
| What is XGBoost? | Gradient boosting — trees added in sequence, each fitting the previous ensemble's errors. |
| Bagging vs boosting? | Bagging trains trees in parallel to cut variance; boosting trains them in sequence to cut bias. |
| Why is Random Forest less likely to overfit than one tree? | A single deep tree memorises; averaging many decorrelated trees cancels individual errors. |
| What is cross-validation? | Split data into k folds, train on k−1 and test on the held-out one, k times, then average. |
| What is GridSearchCV? | Exhaustive search over a hyper-parameter grid, each combination scored by cross-validation. |
| Precision vs recall? | Precision = of those predicted positive, how many were; recall = of the actual positives, how many were found. |
| What is F1? | Harmonic mean of precision and recall. |
| What is R²? | The fraction of the target's variance the model explains. 1.0 is perfect, 0 is no better than predicting the mean. |
| RMSE vs MAE? | RMSE squares errors before averaging, so large errors hurt more; MAE is the plain average error. |
| What is overfitting? | Learning noise in the training set; training score high, test score low. |
| Why stratify the split? | So every class keeps its proportion in both train and test — important for 22 classes. |
| What does `random_state=42` do? | Fixes the random seed so the split, sampling and model are reproducible. |
| Classification vs regression? | Classification predicts a category; regression predicts a continuous number. |

---

## 10. Questions about who did what

Be ready to answer for your own half and to describe your partner's.

- Which part did you build, and which did your partner?
- Show me a piece of code you wrote and explain it line by line.
- What was the hardest bug you fixed?
- How did you divide the work, and how did you keep it in sync?
- If your partner were absent, could you explain their part?

A real answer to the bug question, from this project: the app showed a yield of
**1,615** when the model returned **1.288**. The screen was displaying the
total production for the plot in the headline where the per-hectare yield
belonged. The fix separated the two values and labelled both.

---

## 11. Likely demo requests

Have these ready to run live:

| Request | What to do |
|---|---|
| "Show me it working" | The app at `localhost:8081` — crop, then yield |
| "Change an input and show the answer changes" | `20, 60, 20, 7.2, 28.5, 55, 65` → mothbeans instead of rice |
| "Show your tests" | `pytest tests/ api/tests/` → 22 passed |
| "Show the metrics are real" | `outputs/crop_classification_results.json` |
| "Show the API" | `http://localhost:8000/docs` |
| "What does the model see?" | `outputs/crop_feature_importance.png` |
