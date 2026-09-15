import pytest

def test_create_emergency_request(client):
    res = client.post("/api/emergency/request", json={
        "patient_name": "Meera Joshi",
        "patient_phone": "+919876543299",
        "emergency_type": "CARDIAC",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "address": "Near Trinity Metro Station",
        "notes": "Patient experiencing severe chest tightness"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["patient_name"] == "Meera Joshi"
    assert data["emergency_type"] == "CARDIAC"
    assert data["status"] == "PENDING"
    assert "id" in data

def test_nearby_ambulance_discovery(client):
    # Location near central Bangalore
    res = client.get("/api/emergency/nearby?latitude=12.9716&longitude=77.5946&radius_km=15&emergency_type=CARDIAC")
    assert res.status_code == 200
    ambulances = res.json()
    assert len(ambulances) >= 3

    # Verify sorting and ranking
    first = ambulances[0]
    assert first["ranking"] == 1
    assert "suitability_score" in first
    assert "estimated_response_time_min" in first
    assert "distance_km" in first
    assert first["is_online"] is True

def test_one_tap_call_logging(client):
    res = client.post("/api/emergency/call-record", json={
        "ambulance_id": 1,
        "driver_phone": "+919876543210"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["ambulance_id"] == 1
    assert data["driver_phone"] == "+919876543210"
    assert data["status"] == "INITIATED"
