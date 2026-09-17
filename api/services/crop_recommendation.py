import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from prototype_demo import recommend_crop, _load_crop_bundle

def get_crop_recommendation(N: float, P: float, K: float, temperature: float, humidity: float, ph: float, rainfall: float) -> str:
    """Wrapper for prototype_demo.recommend_crop"""
    return recommend_crop(N=N, P=P, K=K, temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall)

def load_crop_model():
    """Trigger the model loading into memory"""
    return _load_crop_bundle()
