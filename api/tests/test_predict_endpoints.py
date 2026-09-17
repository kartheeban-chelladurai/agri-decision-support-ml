def test_predict_crop_valid(client):
    response = client.post(
        "/api/v1/predict/crop",
        json={
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 20.9,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.9
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prediction" in data
    assert data["prediction"]["crop"] == "rice"

def test_predict_crop_invalid(client):
    response = client.post(
        "/api/v1/predict/crop",
        json={
            "N": -10,  # Invalid, must be >= 0
            "P": 42,
            "K": 43,
            "temperature": 20.9,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.9
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"

def test_predict_yield_valid(client):
    response = client.post(
        "/api/v1/predict/yield",
        json={
            "temperature": 36.0,
            "humidity": 42.0,
            "soil_moisture": 54.0,
            "area": 1254.0,
            "season": "Kharif",
            "crop": "Arecanut"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prediction" in data
    assert "yield_value" in data["prediction"]

def test_predict_yield_unknown_crop(client):
    response = client.post(
        "/api/v1/predict/yield",
        json={
            "temperature": 36.0,
            "humidity": 42.0,
            "soil_moisture": 54.0,
            "area": 1254.0,
            "season": "Kharif",
            "crop": "Dragonfruit"
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNKNOWN_VALUE"
