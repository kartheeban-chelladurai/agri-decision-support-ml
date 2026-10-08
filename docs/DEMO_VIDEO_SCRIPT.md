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

Open <http://localhost:8081> in Chrome. Do this setup in the **same window**
you will record in.

**Start with empty history.** `Alert.alert` is a no-op in react-native-web
0.21, so the Clear button on the History tab does nothing in a browser. Clear
the data from the browser instead: `F12` → Application → Storage → Local
storage → `http://localhost:8081` → right-click → Clear, then reload the page.
Recording in a fresh incognito window works just as well.

**Profile → Edit** — tap Save Profile when done:

| Field | Type exactly |
|---|---|
| Your Name | `Kartheeban` |
| Farm Name | `Green Valley Farm` |
| Location | `Chennai, Tamil Nadu` |
| Farm Area | `2` |
| Area Unit | Hectares |
| Primary Crop | `Rice` |

`Rice` must be spelt with a capital R — it has to match the model's crop list
exactly, or the Yield form's "Use Profile Data" button will not fill the crop.

**Profile → Soil Data** — tap Save Soil Data when done:

| Field | Type exactly |
|---|---|
| Nitrogen (N) | `90` |
| Phosphorus (P) | `42` |
| Potassium (K) | `43` |
| Soil pH | `6.5` |
| Soil Moisture | `55` |

Then go back to the **Home** tab. That is your first frame.

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

"I tap Yield, and Use Profile Data. It fills in rice, and my two hectares.
Season: Kharif. Then temperature, humidity and soil moisture.

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

## 5. Exactly what to type on camera

Every result below was run against the committed models in this repo.

### Crop Recommendation — take 1 (rice)

Home → **Crop → Analyze**, then tap **Use Saved Data**.

| Field | Value | Note |
|---|---|---|
| Nitrogen (N) | `90` | filled by Use Saved Data |
| Phosphorus (P) | `42` | filled by Use Saved Data |
| Potassium (K) | `43` | filled by Use Saved Data |
| Soil pH | `6.5` | filled by Use Saved Data |
| Temperature | `20.9` | type it |
| Humidity | `82` | type it |
| Rainfall | `202.9` | type it |

Tap **🌱 Get Recommendation** → **RICE**

### Crop Recommendation — take 2 (mothbeans)

Tap **New Analysis**, then type all seven.

| Field | Value |
|---|---|
| Nitrogen (N) | `20` |
| Phosphorus (P) | `60` |
| Potassium (K) | `20` |
| Soil pH | `7.2` |
| Temperature | `28.5` |
| Humidity | `55` |
| Rainfall | `65` |

Tap **🌱 Get Recommendation** → **MOTHBEANS**

### Yield Estimation — take 1 (Kharif)

**Back to Analyze Hub → Yield Estimation**, then tap **Use Profile Data**.

| Field | Value | Note |
|---|---|---|
| Crop | `Rice` | filled by Use Profile Data |
| Season | `Kharif` | pick from the dropdown |
| Cultivated Area | `2` | filled by Use Profile Data |
| Temperature | `30` | type it |
| Humidity | `70` | type it |
| Soil Moisture | `55` | type it |

Tap **📊 Estimate Yield** → **2.277** per hectare, **Total for 2 ha: 4.6 units**

### Yield Estimation — take 2 (Rabi)

Tap **New Analysis**, enter the same values but change the season.

| Field | Value |
|---|---|
| Crop | `Rice` |
| Season | `Rabi` |
| Cultivated Area | `2` |
| Temperature | `30` |
| Humidity | `70` |
| Soil Moisture | `55` |

Tap **📊 Estimate Yield** → **2.464** per hectare, **Total for 2 ha: 4.9 units**

### Metrics quoted at the end

- Crop recommendation — Random Forest: **99.55 %** test accuracy
- Yield estimation — XGBoost tuned: **R² 0.740**

## 6. If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Every prediction shows `NETWORK_ERROR` | App pointing at `10.0.2.2` | Set `EXPO_PUBLIC_API_URL` (§1.2) |
| Expo will not bundle | Wrong install flag | `npm install --legacy-peer-deps` |
| `'pip' is not recognized` | Virtual environment not active | Re-run activate; your prompt must start with `(.venv)` |
| App opens on the onboarding screen mid-demo | Storage cleared after launch | Clear local storage **before** recording, then reload once |
| History "Clear" button does nothing | `Alert.alert` is a no-op in react-native-web | Clear local storage from DevTools (§1.4) |
| "Use Profile Data" fills the area but not the crop | Primary Crop does not match the model's list | Set it to `Rice`, capital R |
