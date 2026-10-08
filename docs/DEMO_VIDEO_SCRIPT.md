# AgriSense — demo video: setup and voice-over script

A **2 min 20 s** video showing only the app running in the browser. No slides,
no terminal, no charts on camera.

Every number the script says was run against the committed models in this
repo, so what you say will match what appears on screen.

---

## 1. Setup (all of this is off camera)

### 1.1 Check the project runs

In the repo root:

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
pip install -r api/requirements.txt
pytest tests/ api/tests/        # must print 22 passed
```

### 1.2 The one setting that breaks a browser demo

The app defaults to `http://10.0.2.2:8000/api/v1` — the **Android emulator's**
address. In a browser that does not exist, so every prediction fails with
`NETWORK_ERROR`.

Create `mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 1.3 Start both halves

**Terminal A** — repo root, venv active:

```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Wait for `Application startup complete.`

**Terminal B** — in `mobile/`:

```bash
npm install --legacy-peer-deps
npx expo start --web
```

Both terminals stay minimised during the recording.

### 1.4 Prepare the app before you record

1. **Profile → Edit** — set your name and a farm name. The home screen greets
   you by name instead of "Farmer".
2. **Profile → Soil Data** — enter `N 90, P 42, K 43, pH 6.5`. The crop form
   does **not** fill itself; it shows a **Use Saved Data** button, which you
   tap on camera. That is a good beat — it shows the app remembers.
3. **Profile → Settings → clear history**, then reload the page once. History
   starts empty and fills up during the demo.
4. Go back to the **home screen**. That is your first frame.

### 1.5 Clean the screen

- 1920 × 1080, browser zoom 100 %, **F11 for full screen**.
- Do Not Disturb on. No bookmarks bar, no other tabs, no notifications.
- Nothing but the app is visible at any point in the video.

### 1.6 Rehearse once, silently

Click through the whole flow without recording. You are checking that every
prediction returns. It should take about 90 seconds.

---

## 2. How to record

**Record the screen and the voice separately.** Narrating while clicking makes
you fumble both.

1. Capture the screen silently, in the order below.
2. Record the voice afterwards, reading the script, one section at a time.
   A phone voice recorder held about 15 cm away, slightly off to the side,
   beats a laptop mic.
3. Lay the audio over the video, and trim or stretch the clips to fit.

**Tools (all free):**

| Job | Windows | macOS |
|---|---|---|
| Screen capture | OBS Studio, or `Win + G` | OBS Studio, or `Cmd+Shift+5` |
| Voice recording | Audacity, or Voice Recorder | Audacity, or Voice Memos |
| Editing | Clipchamp, CapCut | iMovie, CapCut |

OBS settings: **1920×1080, 30 fps, MP4**, one Display Capture source.

In Audacity, two clicks fix most student audio: Effect → Noise Reduction
(take a noise profile from two seconds of silence first), then Effect →
Normalize to −3 dB.

---

## 3. Script

Speak slowly and plainly. Short sentences. The bracketed lines are screen
directions, not spoken.

---

### [0:00 – 0:15] Home screen

> **On screen:** the app home screen, nothing else.

"Hi. This is AgriSense.

"It is a machine learning app for small farmers. It answers two questions.
What crop should I grow? And how much will I get?

"I am Kartheeban, with Nishanth, from CSE, Chennai Institute of Technology."

---

### [0:15 – 0:27] Home screen tour

> **On screen:** scroll the home screen slowly — soil snapshot, then the empty
> Recent Analyses card.

"This is the home screen. It shows my saved soil values. Below that are my
recent analyses. It is empty right now.

"Let me start with the first question."

---

### [0:27 – 1:02] Crop recommendation

> **On screen:** Home → Crop → Analyze. Tap **Use Saved Data**, then type the
> three weather values slowly. Hold on the result card for three full seconds.

"I tap Crop.

"I saved my soil card earlier, so I tap Use Saved Data. Nitrogen ninety.
Phosphorus forty-two. Potassium forty-three. pH six point five. All filled in.

"Now the weather. Temperature twenty point nine degrees. Humidity eighty-two
percent. Rainfall two hundred and two millimetres.

"I tap Get Recommendation.

"The answer is rice. It also shows the model, and the values I entered. So the
farmer can check the answer."

---

### [1:02 – 1:22] A second crop

> **On screen:** New Analysis. Enter the dry-plot values. Hold on the result.

"Now let me change the soil. This is a dry plot. Nitrogen twenty. Phosphorus
sixty. Potassium twenty. pH seven point two. And rainfall only sixty-five
millimetres.

"This time it says mothbeans. A completely different crop.

"So the model is really reading the soil. It is not guessing."

---

### [1:22 – 1:55] Yield estimation

> **On screen:** Analyze → Yield. Run rice / Kharif / 2 ha. Then New Analysis,
> same values, season Rabi.

"Now the second question. How much will I get?

"I tap Yield. Crop: rice. Season: Kharif. Area: two hectares. Then
temperature, humidity and soil moisture.

"It says two point two seven seven units per hectare. About four point six for
the whole plot.

"The note below is important. Yield units are different for every crop. So you
can only compare rice with rice. We show that on every screen.

"Now I change only the season, to Rabi. The answer becomes two point four six.
So the season matters a lot."

---

### [1:55 – 2:20] History, profile and close

> **On screen:** History tab, then Profile, then stop on the home screen.

"Every result is saved. This is the history. And this is my profile, with my
farm details and my soil card.

"The crop model is ninety-nine point five percent accurate. The yield model
has an R squared of zero point seven four. All the code is on GitHub.

"That is AgriSense. Thank you."

---

## 4. After recording

1. Export **1080p MP4, 30 fps**.
2. Upload to Google Drive. **Share → Anyone with the link → Viewer.**
3. Open the link in a private window to confirm it really is public. A
   permission-locked link is the most common way these submissions fail.
4. Paste the link into slide 8 of `docs/AgriSense_PBL_Final_Review.pptx`, in
   the "Project Video Link" box.

---

## 5. Values to type on camera

These were run against the committed models. Use them exactly.

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

### Metrics quoted at the end

- Crop recommendation — Random Forest: **99.55 %** test accuracy
- Yield estimation — XGBoost tuned: **R² 0.740**

---

## 6. If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Every prediction shows `NETWORK_ERROR` | App pointing at `10.0.2.2` | Set `EXPO_PUBLIC_API_URL` (§1.2) |
| Expo will not bundle | Wrong install flag | `npm install --legacy-peer-deps` |
| `'pip' is not recognized` | Virtual environment not active | Re-run activate; your prompt must start with `(.venv)` |
| App opens on the onboarding screen mid-demo | History cleared after launch | Clear history **before** recording, then reload once |
