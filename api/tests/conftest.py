import pytest
from fastapi.testclient import TestClient
from api.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
