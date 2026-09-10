"""Streamlit front-end for the agricultural decision support system.

Launch with:

    streamlit run src/streamlit_app.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent))

from prototype_demo import (  # noqa: E402
    estimate_yield,
    known_seasons,
    known_yield_crops,
    recommend_crop,
)

st.set_page_config(page_title="Agri Decision Support", page_icon="🌾", layout="centered")

st.title("🌾 Agricultural Decision Support System")
st.caption(
    "ML-based decision support for small-scale farmers — crop recommendation "
    "and yield estimation."
)


@st.cache_data(show_spinner="Loading trained models…")
def _dropdown_options() -> tuple[list[str], list[str]]:
    """Season and crop choices, read from the saved label encoders."""
    return known_seasons(), known_yield_crops()


tab_reco, tab_yield = st.tabs(["Crop Recommendation", "Yield Estimation"])

# --------------------------------------------------------------------------
# Tab 1 — crop recommendation
# --------------------------------------------------------------------------
with tab_reco:
    st.subheader("Which crop should I sow?")
    st.write("Enter your soil test results and typical local weather.")

    col1, col2 = st.columns(2)
    with col1:
        n = st.number_input("Nitrogen — N (kg/ha)", 0.0, 200.0, 90.0, step=1.0)
        p = st.number_input("Phosphorus — P (kg/ha)", 0.0, 200.0, 42.0, step=1.0)
        k = st.number_input("Potassium — K (kg/ha)", 0.0, 250.0, 43.0, step=1.0)
        ph = st.number_input("Soil pH", 0.0, 14.0, 6.5, step=0.1)
    with col2:
        temperature = st.number_input("Temperature (°C)", -5.0, 60.0, 20.9, step=0.1)
        humidity = st.number_input("Humidity (%)", 0.0, 100.0, 82.0, step=0.1)
        rainfall = st.number_input("Rainfall (mm)", 0.0, 500.0, 202.9, step=1.0)

    if st.button("Recommend crop", type="primary", key="reco_btn"):
        try:
            crop = recommend_crop(n, p, k, temperature, humidity, ph, rainfall)
            st.success(f"Recommended crop: **{crop}**")
        except Exception as exc:  # keep the UI usable if anything goes wrong
            st.error(f"Could not produce a recommendation: {exc}")

# --------------------------------------------------------------------------
# Tab 2 — yield estimation
# --------------------------------------------------------------------------
with tab_yield:
    st.subheader("How much can I expect to harvest?")
    st.write("Pick the crop and season, then describe the plot and conditions.")

    seasons, crops = _dropdown_options()

    col1, col2 = st.columns(2)
    with col1:
        crop_choice = st.selectbox("Crop", crops,
                                   index=crops.index("Rice") if "Rice" in crops else 0)
        season_choice = st.selectbox(
            "Season", seasons,
            index=seasons.index("Kharif") if "Kharif" in seasons else 0,
        )
        area = st.number_input("Area (hectares)", 0.1, 1_000_000.0, 1254.0, step=1.0)
    with col2:
        y_temperature = st.number_input("Temperature (°C)", -5.0, 60.0, 36.0,
                                        step=0.1, key="y_temp")
        y_humidity = st.number_input("Humidity (%)", 0.0, 100.0, 42.0,
                                     step=0.1, key="y_hum")
        soil_moisture = st.number_input("Soil moisture (%)", 0.0, 100.0, 54.0, step=0.1)

    if st.button("Estimate yield", type="primary", key="yield_btn"):
        try:
            value = estimate_yield(
                y_temperature, y_humidity, soil_moisture, area,
                season_choice, crop_choice,
            )
            st.success(f"Estimated yield: **{value:.3f}** production units per hectare")
            st.info(f"Estimated total production for {area:,.1f} ha: "
                    f"**{value * area:,.1f}** units")
        except ValueError as exc:
            st.error(f"⚠️ {exc}")
        except Exception as exc:
            st.error(f"Could not produce an estimate: {exc}")

st.divider()
st.caption(
    "CS5305 course project · Models: Random Forest (classification) and "
    "XGBoost (regression), trained by the pipelines in `src/`."
)
