def test_metadata_crops(client):
    response = client.get("/api/v1/metadata/crops")
    assert response.status_code == 200
    data = response.json()
    assert "recommendation_crops" in data
    assert "yield_crops" in data
    assert len(data["recommendation_crops"]) == 22
    assert len(data["yield_crops"]) == 75

def test_metadata_seasons(client):
    response = client.get("/api/v1/metadata/seasons")
    assert response.status_code == 200
    data = response.json()
    assert "seasons" in data
    assert len(data["seasons"]) == 6

def test_metadata_model_info(client):
    response = client.get("/api/v1/metadata/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "yield_estimation" in data
    assert data["recommendation"]["model_name"] == "Random Forest"
    assert data["yield_estimation"]["model_name"] == "XGBoost"
