import sys
from pathlib import Path
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from prototype_demo import recommend_crop, estimate_yield

def test_parity_crop_1(client):
    # Test case 1
    inputs = {
        "N": 90, "P": 42, "K": 43,
        "temperature": 20.9, "humidity": 82.0,
        "ph": 6.5, "rainfall": 202.9
    }
    api_resp = client.post("/api/v1/predict/crop", json=inputs)
    assert api_resp.status_code == 200
    
    direct_res = recommend_crop(**inputs)
    assert api_resp.json()["prediction"]["crop"] == direct_res
    assert direct_res == "rice"

def test_parity_crop_2(client):
    inputs = {
        "N": 20, "P": 130, "K": 200,
        "temperature": 22.0, "humidity": 92.0,
        "ph": 5.9, "rainfall": 110.0
    }
    api_resp = client.post("/api/v1/predict/crop", json=inputs)
    assert api_resp.status_code == 200
    
    direct_res = recommend_crop(**inputs)
    assert api_resp.json()["prediction"]["crop"] == direct_res

def test_parity_yield_3(client):
    inputs = {
        "temperature": 36.0, "humidity": 42.0,
        "soil_moisture": 54.0, "area": 1254.0,
        "season": "Kharif", "crop": "Arecanut"
    }
    api_resp = client.post("/api/v1/predict/yield", json=inputs)
    assert api_resp.status_code == 200
    
    direct_res = estimate_yield(**inputs)
    assert abs(api_resp.json()["prediction"]["yield_value"] - direct_res) < 1e-5

def test_parity_yield_4(client):
    inputs = {
        "temperature": 30.0, "humidity": 50.0,
        "soil_moisture": 40.0, "area": 500.0,
        "season": "Rabi", "crop": "Rice"
    }
    api_resp = client.post("/api/v1/predict/yield", json=inputs)
    assert api_resp.status_code == 200
    
    direct_res = estimate_yield(**inputs)
    assert abs(api_resp.json()["prediction"]["yield_value"] - direct_res) < 1e-5

def test_parity_yield_5(client):
    inputs = {
        "temperature": 30.0, "humidity": 50.0,
        "soil_moisture": 40.0, "area": 500.0,
        "season": "Kharif", "crop": "Dragonfruit"
    }
    api_resp = client.post("/api/v1/predict/yield", json=inputs)
    assert api_resp.status_code == 422
    
    with pytest.raises(ValueError):
        estimate_yield(**inputs)
