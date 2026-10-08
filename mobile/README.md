# AgriSense Mobile Application

This directory contains the React Native (Expo) front-end application for AgriSense.

## 1. Project Overview

AgriSense provides machine-learning based agricultural decision support to help farmers optimize crop selection and estimate yields. 
The application acts as a professional interface to existing Scikit-Learn models via a FastAPI backend.

### Architecture

```
Mobile Application (React Native / Expo)
         ↓
FastAPI Backend (REST JSON API)
         ↓
Existing ML Inference (prototype_demo.py)
         ↓
Prediction Response
         ↓
Mobile Result Screen
         ↓
Local History (AsyncStorage)
```

## 2. Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

## 3. Expo Startup

To start the Expo development server:

```bash
npx expo start
```

## 4. Browser (Web) Setup

The fastest way to run the app on a laptop — no emulator, no phone.

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --web
```

It opens at <http://localhost:8081>.

`mobile/.env` ships pointing at `http://localhost:8000/api/v1`, which is what a
browser needs. Leave it alone for a browser run; change it only for an
emulator or a physical phone (sections 5 and 6).

The web build needs `react-dom`, `react-native-web` and `@expo/metro-runtime`.
They are declared in `package.json`, so `npm install` brings them in — you do
not need to install them separately.

**Note on `Alert.alert`:** react-native-web implements it as an empty
function, so confirmation dialogs do nothing in a browser. That means the
History tab's **Clear** button and the per-item delete have no effect on web.
To reset the app's stored data, clear Local storage for
`http://localhost:8081` in DevTools (F12 → Application → Storage), or use a
private window. Both work normally on Android and iOS.

## 5. Android Emulator Setup

If you have Android Studio and an emulator running, press `a` in the Expo terminal to open it in the emulator.
The default API URL points to `http://10.0.2.2:8000/api/v1` which routes to your computer's localhost from the Android emulator.

## 6. Physical Android Phone Setup

If you are using the Expo Go app on a physical Android phone, `10.0.2.2` will not work. You must point the application to your computer's local IP address.

1. Find your computer's LAN IP (e.g., `192.168.1.100`)
2. Start the Expo server with the environment variable set:
   ```bash
   # On Windows (PowerShell)
   $env:EXPO_PUBLIC_API_URL="http://192.168.1.100:8000/api/v1"
   npx expo start
   ```

## 7. FastAPI Startup

Ensure the backend is running before testing API requests:
```bash
# From the REPOSITORY ROOT -- the folder containing api/, src/ and models/.
# Running this from anywhere else gives "ModuleNotFoundError: No module named 'api'".
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

## 8. EXPO_PUBLIC_API_URL Configuration

The `EXPO_PUBLIC_API_URL` environment variable controls where the app looks for the backend.
It is read from `mobile/.env`, which this repository ships set to
`http://localhost:8000/api/v1` for browser runs. If no value is supplied at
all, the code falls back to `http://10.0.2.2:8000/api/v1` (Android emulator).

| Where you run the app | Value |
|---|---|
| Browser on your laptop | `http://localhost:8000/api/v1` |
| Android emulator | `http://10.0.2.2:8000/api/v1` |
| Physical phone (Expo Go) | `http://<your-LAN-IP>:8000/api/v1` |

## 9. Development Workflow

- `app/`: Expo Router application screens and navigation flow
- `components/`: Reusable React components (UI, layout, forms, etc.)
- `constants/`: Design system tokens (colors, typography, spacing, theme)
- `services/`: API integration and other background services
- `types/`: Strict TypeScript definitions

## 10. Testing

TypeScript type checking:
```bash
npx tsc --noEmit
```

Backend regression tests (run from the root directory):
```bash
python -m pytest tests/ api/tests/ -v
```

## 11. Android Build Instructions

To build the APK for Android devices:
```bash
# Build locally (requires Android Studio / SDK setup)
npx expo run:android

# Or build via EAS (Expo Application Services)
eas build -p android --profile preview
```

**Branding Note:**
The application expects the following assets in `mobile/assets/`:
- `icon.png` (1024x1024)
- `android-icon-foreground.png` (1024x1024, transparent background)
- `splash.png` (1242x2436 or similar)
Current configuration is placed in `app.json`.

## 12. Troubleshooting

- **API Network Errors**: Ensure your FastAPI backend is running and the `EXPO_PUBLIC_API_URL` is set correctly for your device/emulator. If using a physical phone, ensure your computer's firewall allows incoming connections on port 8000.
- **Expo Go crashes**: Ensure you have the latest version of Expo Go installed on your device.
- **Dependency Issues**: Always use `--legacy-peer-deps` due to the Lucide React Native and Expo React versions.
