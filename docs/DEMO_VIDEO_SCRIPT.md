# AgriSense — demo video: setup, shot list and voice-over script

Target length **4 min 30 s**. Everything below was checked against the code in
this repository; every number the script says is one the models actually
produce.

---

## 1. Before you record

### 1.1 Make the project run cleanly, once

From a fresh terminal, in the repo root:

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
pip install -r api/requirements.txt
pytest tests/ api/tests/        # must print 22 passed
```

If `pytest` is not green, fix that before anything else — a failing suite on
camera is worse than no camera.

### 1.2 The one setting that will ruin your recording if you miss it

The app defaults to `http://10.0.2.2:8000/api/v1`, which is the **Android
emulator's** route to your laptop. If you demo in a browser, that address does
not exist and every prediction fails with `NETWORK_ERROR`.

Create `mobile/.env` with:

```
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

On a **physical phone** over Expo Go, use your laptop's LAN IP instead
(`ipconfig` / `ifconfig`), e.g. `http://192.168.1.14:8000/api/v1`, and keep
both devices on the same Wi-Fi.

### 1.3 Two terminals, side by side

**Terminal A** — repo root, venv active:

```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Wait for `Application startup complete.` Then check
<http://localhost:8000/api/v1/health> in a browser — it should return
`{"status":"healthy", ...}`. Leave that tab closed again before recording.

**Terminal B** — in `mobile/`:

```bash
npm install --legacy-peer-deps
npx expo start --web
```

### 1.4 Seed the app state so the demo tells a story

Do this **before** recording, then leave the app open:

1. Profile → Edit → set your name and a farm name (the home screen greets you
   by name — it looks far better than "Farmer").
2. Profile → Soil Data → enter `N 90, P 42, K 43, pH 6.5`. This pre-fills the
   crop form, which lets you say "it remembers my soil card".
3. Profile → Settings → **clear history**. You want "Recent Analyses" empty at
   the start so the viewer watches it fill up during the demo.

### 1.5 Clean up the desktop

- Display at **1920 × 1080**, browser zoom 100 %, F11 full screen for the app.
- Do Not Disturb on. Close mail, WhatsApp, and every unrelated tab.
- Browser in a clean window — no bookmarks bar, no extensions showing.
- Have these open as background tabs, in this order, so you can cut to them:
  1. `docs/figures/architecture.png`
  2. `outputs/crop_feature_importance.png`
  3. `outputs/crop_confusion_matrix.png`
  4. `outputs/yield_pred_vs_actual.png`
  5. The GitHub repo page.

### 1.6 Rehearse once, silently

Walk the whole flow start to finish without recording. You are checking that
every click lands and every prediction returns. Time it — if the silent run
is longer than 3 minutes, you are clicking too slowly for a 4:30 video.

---

## 2. How to record

**Record picture and sound separately.** Trying to narrate while clicking
makes you fumble both. Do this instead:

1. Record the screen silently, in the order of the shot list below. Pause
   between sections — you will cut them anyway.
2. Record the voice-over afterwards, reading this script, in one take per
   section. A phone's voice-recorder app held 15 cm away and slightly off to
   the side beats a laptop mic.
3. Lay the audio over the video and stretch or trim the silent clips to fit.

**Tools (all free):**

| Job | Windows | macOS |
|---|---|---|
| Screen capture | OBS Studio, or `Win + G` | OBS Studio, or `Cmd+Shift+5` |
| Voice recording | Audacity, or Voice Recorder | Audacity, or Voice Memos |
| Editing | Clipchamp, CapCut, DaVinci Resolve | iMovie, CapCut, DaVinci Resolve |

In OBS: **1920×1080, 30 fps, MP4**. One "Display Capture" source is enough.

**In Audacity, two clicks fix most student audio:** Effect → Noise Reduction
(get a noise profile from two seconds of silence first), then Effect →
Normalize to −3 dB.

---

## 3. Shot list and voice-over script

Read at a normal, unhurried pace — roughly 145 words a minute. The bracketed
lines are what should be on screen; they are not spoken.

---

### [0:00 – 0:18] Title

> **On screen:** slide 1 of `AgriSense_PBL_Final_Review.pptx`, full screen.

"Hello. This is AgriSense — a machine-learning based agricultural decision
support system for small-scale farmers. I am Kartheeban, and with me is
Nishanth, from the Department of Computer Science and Engineering, Chennai
Institute of Technology. In the next four minutes we will show you the
problem, the models, and the working application."

---

### [0:18 – 0:48] The problem

> **On screen:** slide 2.

"A small-scale farmer makes two decisions at the start of every season: what
to sow, and how much to expect from it. Today both are made from experience
and local advice. A soil test card will tell a farmer his nitrogen,
phosphorus, potassium and pH — but nothing about which crop those numbers
actually suit. And the cost of getting it wrong is a whole season. We asked a
simple question: can a model trained on agricultural data that already exists
turn that soil card into a decision?"

---

### [0:48 – 1:22] The data and the models

> **On screen:** cut to the terminal. Scroll the output of a finished
> training run, or just show `outputs/` in the file explorer. Then cut to
> `crop_feature_importance.png`.

"We built two models on two public datasets. The first is crop
recommendation — a classification problem. Two thousand two hundred records,
twenty-two crops, seven features: N, P, K, temperature, humidity, pH and
rainfall. The second is yield estimation — a regression problem, on roughly
fifty thousand records covering seventy-five crops and six seasons. That
second dataset needed real cleaning: we dropped invalid rows, derived yield as
production divided by area, and clipped the extreme one per cent at each end,
which left forty-eight thousand six hundred and eighty-one usable records."

---

### [1:22 – 1:50] How we chose the models

> **On screen:** `crop_feature_importance.png`, then
> `crop_confusion_matrix.png`.

"For each task we compared three models on the same split — logistic or
linear regression, random forest, and XGBoost — then tuned the winner with
grid search and confirmed it with five-fold cross-validation. Random forest
won crop recommendation at ninety-nine point five five per cent test accuracy.
XGBoost won yield estimation with an R-squared of zero point seven four. And
the feature importances tell their own story: rainfall, humidity and potassium
drive crop choice, while yield depends far more on the crop and the season
than on anything you can measure in a field."

---

### [1:50 – 2:12] Architecture

> **On screen:** `docs/figures/architecture.png`.

"The system has three layers. At the bottom, the trained models, with a single
Python entry point for inference. In the middle, a FastAPI service that wraps
it — a thin REST layer with no machine-learning logic of its own. On top, a
React Native app built with Expo. A test in the suite asserts that what the
API returns is identical to what the model returns directly, so the app can
never drift from the science."

---

### [2:12 – 2:25] Starting the backend

> **On screen:** Terminal A. Run uvicorn live so the viewer sees it come up.

"Let's run it. The backend starts, loads both models into memory once, and is
ready to serve."

---

### [2:25 – 3:15] Demo 1 — crop recommendation

> **On screen:** the app's home screen → Crop → Analyze. Type the values
> slowly enough to be read. Pause on the result card for three full seconds.

"This is the app. The home screen shows my soil snapshot and my recent
analyses. I'll tap Crop.

"The form is already pre-filled from the soil card I saved — nitrogen ninety,
phosphorus forty-two, potassium forty-three, pH six point five. Now the
weather: temperature twenty point nine degrees, humidity eighty-two per cent,
rainfall two hundred and two point nine millimetres. Get recommendation.

"Rice. The model is a random forest, and underneath it shows exactly which
inputs produced that answer, so the recommendation can be questioned.

"And it is genuinely reading the soil, not guessing. Watch what happens with a
dry, phosphorus-rich, slightly alkaline plot — nitrogen twenty, phosphorus
sixty, potassium twenty, pH seven point two, rainfall sixty-five millimetres.
Mothbeans. A completely different crop, suited to exactly those conditions."

---

### [3:15 – 3:50] Demo 2 — yield estimation

> **On screen:** back to Analyze → Yield. Run rice / Kharif / 2 ha, then
> change the season to Rabi and run it again.

"The second question is how much. I'll estimate the yield for the rice the
model just recommended. Crop: rice. Season: Kharif. Two hectares. Temperature
thirty, humidity seventy, soil moisture fifty-five per cent.

"Two point two seven seven production units per hectare — about four point six
units in total for the plot. And notice the note under the figure: yield units
in the source data vary by crop, so these estimates are comparable within a
crop, never across crops. We show that on every screen rather than hide it.

"Change only the season to Rabi, and the estimate moves to two point four six
four. The model has learnt that season matters — which is exactly what the
feature importances told us."

---

### [3:50 – 4:08] Persistence and the rest of the app

> **On screen:** History tab, then Profile.

"Every analysis is saved. The History tab keeps them, the home screen shows
the most recent three, and the profile holds the farm details and the soil
card that pre-filled the form. All of it works offline, on the device."

---

### [4:08 – 4:30] Results, limits and close

> **On screen:** `yield_pred_vs_actual.png`, then the GitHub repo page.

"To summarise: crop recommendation at ninety-nine point five five per cent
accuracy, cross-validated at zero point nine nine two seven. Yield estimation
at R-squared zero point seven four — and we are honest that this leaves about
a quarter of the variance unexplained. The datasets carry no region and no
year, so the next step is to add those and retrain per agro-climatic zone.

"The complete project — code, data, trained models and all twenty-two tests —
is public on GitHub at the link on screen. Thank you for watching."

---

## 4. After recording

1. Export **1080p, MP4, 30 fps**. Keep it under about 200 MB.
2. Upload to Google Drive, then **Share → Anyone with the link → Viewer**.
   Open the link in a private window to confirm it really is public — a
   permission-locked link is the most common way these submissions fail.
3. Paste the link into slide 8 of `docs/AgriSense_PBL_Final_Review.pptx`, in
   the "Project Video Link" box, replacing the template instruction text.

---

## 5. Verified demo values

Copy these exactly — each was run against the committed models.

### Crop recommendation

| N | P | K | Temp | Humidity | pH | Rainfall | Result |
|---|---|---|---|---|---|---|---|
| 90 | 42 | 43 | 20.9 | 82 | 6.5 | 202.9 | **rice** |
| 20 | 60 | 20 | 28.5 | 55 | 7.2 | 65 | **mothbeans** |

### Yield estimation

| Crop | Season | Area | Temp | Humidity | Soil moisture | Result |
|---|---|---|---|---|---|---|
| Rice | Kharif | 2 ha | 30 | 70 | 55 | **2.277** /ha — 4.6 total |
| Rice | Rabi | 2 ha | 30 | 70 | 55 | **2.464** /ha — 4.9 total |

### Headline metrics

- Crop recommendation — Random Forest: 99.55 % test accuracy, weighted F1
  0.9955, 5-fold CV 0.9927 ± 0.0039
- Yield estimation — XGBoost tuned: R² 0.740, RMSE 5.025, MAE 1.653,
  5-fold CV R² 0.7428 ± 0.0254

---

## 6. Things that go wrong, and the fix

| Symptom | Cause | Fix |
|---|---|---|
| Every prediction shows `NETWORK_ERROR` | App pointing at `10.0.2.2` | Set `EXPO_PUBLIC_API_URL` (§1.2) |
| Expo won't bundle | Dependencies not installed with the legacy flag | `npm install --legacy-peer-deps` |
| `'pip' is not recognized` | Virtual environment not activated | Re-run the activate command; your prompt must start with `(.venv)` |
| Backend returns 422 on a crop | Crop or season not in the encoder | Pick from the app's dropdown — it is loaded from `/metadata` |
| App opens on the onboarding screen mid-demo | History/settings were cleared after launch | Clear history **before** you start recording, then reload once |
