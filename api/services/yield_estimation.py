import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from prototype_demo import estimate_yield, _load_yield_bundle

def get_yield_estimation(temperature: float, humidity: float, soil_moisture: float, area: float, season: str, crop: str) -> float:
    """Wrapper for prototype_demo.estimate_yield"""
    return estimate_yield(
        temperature=temperature,
        humidity=humidity,
        soil_moisture=soil_moisture,
        area=area,
        season=season,
        crop=crop
    )

def load_yield_model():
    """Trigger the model loading into memory"""
    return _load_yield_bundle()
