"""Tests for the prototype inference layer."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from prototype_demo import (  # noqa: E402
    estimate_yield,
    known_crops,
    known_seasons,
    known_yield_crops,
    recommend_crop,
)


# --------------------------------------------------------------------------
# Crop recommendation
# --------------------------------------------------------------------------
def test_recommend_crop_returns_known_label():
    crop = recommend_crop(N=90, P=42, K=43, temperature=20.9,
                          humidity=82.0, ph=6.5, rainfall=202.9)
    assert isinstance(crop, str)
    assert crop in known_crops()


def test_recommend_crop_is_deterministic():
    args = dict(N=20, P=130, K=200, temperature=22.0,
                humidity=92.0, ph=5.9, rainfall=110.0)
    assert recommend_crop(**args) == recommend_crop(**args)


def test_known_crops_covers_all_22_classes():
    assert len(known_crops()) == 22


# --------------------------------------------------------------------------
# Yield estimation
# --------------------------------------------------------------------------
def test_estimate_yield_returns_positive_float():
    value = estimate_yield(temperature=36, humidity=42, soil_moisture=54,
                           area=1254.0, season="Kharif", crop="Arecanut")
    assert isinstance(value, float)
    assert value > 0


def test_estimate_yield_accepts_every_known_season():
    crop = known_yield_crops()[0]
    for season in known_seasons():
        value = estimate_yield(35, 45, 52, 500.0, season, crop)
        assert isinstance(value, float)


def test_estimate_yield_rejects_unknown_crop():
    with pytest.raises(ValueError, match="Unknown crop"):
        estimate_yield(30, 45, 50, 100.0, "Kharif", "Dragonfruit")


def test_estimate_yield_rejects_unknown_season():
    with pytest.raises(ValueError, match="Unknown season"):
        estimate_yield(30, 45, 50, 100.0, "Monsoon", known_yield_crops()[0])


def test_estimate_yield_rejects_non_positive_area():
    with pytest.raises(ValueError, match="Area must be greater than 0"):
        estimate_yield(30, 45, 50, 0.0, "Kharif", known_yield_crops()[0])


def test_estimate_yield_tolerates_padded_strings():
    """The raw dataset had padded values like 'Kharif     '."""
    padded = estimate_yield(36, 42, 54, 1254.0, "  Kharif  ", " Arecanut ")
    clean = estimate_yield(36, 42, 54, 1254.0, "Kharif", "Arecanut")
    assert padded == clean
