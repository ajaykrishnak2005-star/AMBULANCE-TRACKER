import pytest

def test_driver_availability_toggle(client):
    # 1. Login as driver
    res_login = client.post("/api/auth/login", json={
        "email": "driver.rajesh@ambulance.org",
        "password": "DriverPassword123"
    })
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Toggle to OFFLINE
    res_off = client.put("/api/drivers/availability", json={"is_online": False}, headers=headers)
    assert res_off.status_code == 200
    assert res_off.json()["is_online"] is False

    # 3. Toggle back to ONLINE
    res_on = client.put("/api/drivers/availability", json={"is_online": True}, headers=headers)
    assert res_on.status_code == 200
    assert res_on.json()["is_online"] is True

def test_driver_location_broadcast(client):
    res_login = client.post("/api/auth/login", json={
        "email": "driver.rajesh@ambulance.org",
        "password": "DriverPassword123"
    })
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_loc = client.put("/api/drivers/location", json={
        "latitude": 12.9730,
        "longitude": 77.5930,
        "heading": 180.0,
        "speed": 45.0,
        "address": "Residency Road Junction"
    }, headers=headers)
    assert res_loc.status_code == 200
    assert res_loc.json()["latitude"] == 12.9730
    assert res_loc.json()["longitude"] == 77.5930
