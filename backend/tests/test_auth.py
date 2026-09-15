import pytest
from app.models.user import UserRole

def test_login_success(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@ambulance.org",
        "password": "AdminPassword123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"
    assert data["email"] == "admin@ambulance.org"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@ambulance.org",
        "password": "WrongPassword123"
    })
    assert res.status_code == 401

def test_register_user_success(client):
    res = client.post("/api/auth/register", json={
        "email": "newuser@ambulance.org",
        "password": "SecretPassword123",
        "full_name": "Rohan Verma",
        "phone": "+919876500001",
        "role": "USER"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "newuser@ambulance.org"
    assert data["role"] == "USER"

def test_rbac_admin_protected_route(client):
    # 1. Login as standard user
    res_user = client.post("/api/auth/login", json={
        "email": "patient@ambulance.org",
        "password": "UserPassword123"
    })
    user_token = res_user.json()["access_token"]

    # Attempt to view admin dashboard
    res_forbidden = client.get(
        "/api/admin/dashboard",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert res_forbidden.status_code == 403

    # 2. Login as admin
    res_admin = client.post("/api/auth/login", json={
        "email": "admin@ambulance.org",
        "password": "AdminPassword123"
    })
    admin_token = res_admin.json()["access_token"]

    res_allowed = client.get(
        "/api/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_allowed.status_code == 200
    assert "total_users" in res_allowed.json()
