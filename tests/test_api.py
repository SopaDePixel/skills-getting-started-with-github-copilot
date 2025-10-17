import pytest
from fastapi import status
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)

def test_get_activities_returns_200_and_structure():
    resp = client.get("/activities")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert isinstance(data, dict)
    # should contain at least one known activity
    assert "Chess Club" in data

@pytest.mark.parametrize("email", ["pytest.user1@example.com", "pytest.user2@example.com"]) 
def test_signup_and_unregister_flow(email):
    # Ensure email not already present
    activities_before = client.get("/activities").json()
    participants_before = activities_before["Chess Club"]["participants"]
    if email in participants_before:
        # remove for test isolation
        client.delete(f"/activities/Chess%20Club/unregister?email={email}")

    # Signup
    resp = client.post(f"/activities/Chess%20Club/signup?email={email}")
    assert resp.status_code == status.HTTP_200_OK
    assert "Signed up" in resp.json().get("message", "")

    # Verify participant now present
    activities_after = client.get("/activities").json()
    assert email in activities_after["Chess Club"]["participants"]

    # Unregister
    resp = client.delete(f"/activities/Chess%20Club/unregister?email={email}")
    assert resp.status_code == status.HTTP_200_OK
    assert "Removed" in resp.json().get("message", "")

    # Verify removed
    activities_final = client.get("/activities").json()
    assert email not in activities_final["Chess Club"]["participants"]
