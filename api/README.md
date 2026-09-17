# AgriSense FastAPI Backend

This is the backend API for AgriSense, exposing the existing ML inference functions via REST endpoints.

## Installation

Ensure you have installed the requirements:

```bash
pip install -r api/requirements.txt
```

## Starting FastAPI

Run the FastAPI application from the project root:

```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

## Available Endpoints

### 1. Health Check
`GET /api/v1/health`

Returns the health status and whether ML models are successfully loaded into memory.

### 2. Crop Recommendation
`POST /api/v1/predict/crop`

**Example Request:**
```json
{
  "N": 90.0,
  "P": 42.0,
  "K": 43.0,
  "temperature": 20.9,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Example Response:**
```json
{
  "success": true,
  "prediction": {
    "crop": "rice",
    "model_used": "Random Forest",
    "analyzed_crops": 22
  },
  "input_summary": {
    "N": 90.0,
    "P": 42.0,
    "K": 43.0,
    "temperature": 20.9,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
  },
  "timestamp": "2026-09-17T14:30:00Z"
}
```

### 3. Yield Estimation
`POST /api/v1/predict/yield`

**Example Request:**
```json
{
  "temperature": 36.0,
  "humidity": 42.0,
  "soil_moisture": 54.0,
  "area": 1254.0,
  "season": "Kharif",
  "crop": "Arecanut"
}
```

**Example Response:**
```json
{
  "success": true,
  "prediction": {
    "yield_value": 1.2879,
    "total_production": 1615.0,
    "unit_note": "Yield is expressed in the dataset's native production units per hectare. These units vary by crop and do not represent a single standard measure. Compare estimates within the same crop only.",
    "model_used": "XGBoost"
  },
  "input_summary": { ... },
  "timestamp": "2026-09-17T14:30:00Z"
}
```

### 4. Metadata
- `GET /api/v1/metadata/crops`
- `GET /api/v1/metadata/seasons`
- `GET /api/v1/metadata/model-info`

## Development API URL
- **Localhost:** `http://localhost:8000/api/v1`
- **LAN (Physical Android Device Testing):** `http://<YOUR_LOCAL_IP>:8000/api/v1` (Replace `<YOUR_LOCAL_IP>` with your computer's IP address on the local network).
