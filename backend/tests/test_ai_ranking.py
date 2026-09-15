import pytest
from app.ai.ranking_engine import ranking_engine
from app.ai.eta_predictor import eta_predictor
from app.models.ambulance import AmbulanceType

def test_eta_prediction():
    eta_mins, conf, method = eta_predictor.predict(distance_km=3.5, ambulance_type="BASIC")
    assert eta_mins >= 2
    assert 0.0 <= conf <= 1.0
    assert isinstance(method, str)

def test_ai_ranking_bounds_and_hierarchy():
    ambulances = [
        {
            "id": 101,
            "ambulance_type": AmbulanceType.ICU,
            "distance_km": 0.8,
            "is_online": True,
        },
        {
            "id": 102,
            "ambulance_type": AmbulanceType.BASIC,
            "distance_km": 12.0,
            "is_online": True,
        },
        {
            "id": 103,
            "ambulance_type": AmbulanceType.PATIENT_TRANSPORT,
            "distance_km": 28.0,
            "is_online": True,
        }
    ]

    # For a critical cardiac emergency, ICU at 0.8 km should be ranked 1st with high score
    ranked = ranking_engine.rank_ambulances(ambulances, emergency_type="CARDIAC")
    assert len(ranked) == 3
    assert ranked[0]["id"] == 101
    assert ranked[0]["ranking"] == 1
    assert 0.0 <= ranked[0]["suitability_score"] <= 100.0
    assert ranked[0]["suitability_score"] > ranked[1]["suitability_score"]
    assert ranked[1]["suitability_score"] > ranked[2]["suitability_score"]

def test_ai_rank_api_endpoint(client):
    res = client.post("/api/ai/rank-ambulances", json={
        "emergency_type": "CARDIAC",
        "latitude": 12.9716,
        "longitude": 77.5946
    })
    assert res.status_code == 200
    data = res.json()
    assert "rankings" in data
    assert data["total_evaluated"] >= 1
    assert data["rankings"][0]["ranking"] == 1
