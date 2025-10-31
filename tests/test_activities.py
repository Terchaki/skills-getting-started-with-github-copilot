from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)
TEST_EMAIL = "pytest-user@example.com"
ACTIVITY = "Chess Club"


def cleanup_email():
    # Remove TEST_EMAIL from any activity if present to ensure test isolation
    res = client.get("/activities")
    assert res.status_code == 200
    activities = res.json()
    for name, info in activities.items():
        if TEST_EMAIL in info.get("participants", []):
            client.delete(f"/activities/{name}/participants", params={"email": TEST_EMAIL})


def test_get_activities_exists():
    res = client.get("/activities")
    assert res.status_code == 200
    activities = res.json()
    assert "Chess Club" in activities


def test_signup_and_unregister_flow():
    cleanup_email()

    # Sign up
    res = client.post(f"/activities/{ACTIVITY}/signup", params={"email": TEST_EMAIL})
    assert res.status_code == 200
    data = res.json()
    assert "Signed up" in data.get("message", "")

    # Verify present
    res = client.get("/activities")
    activities = res.json()
    assert TEST_EMAIL in activities[ACTIVITY]["participants"]

    # Double signup should fail
    res = client.post(f"/activities/{ACTIVITY}/signup", params={"email": TEST_EMAIL})
    assert res.status_code == 400

    # Unregister
    res = client.delete(f"/activities/{ACTIVITY}/participants", params={"email": TEST_EMAIL})
    assert res.status_code == 200

    # Verify removed
    res = client.get("/activities")
    activities = res.json()
    assert TEST_EMAIL not in activities[ACTIVITY]["participants"]

    # Unregistering again should return 404
    res = client.delete(f"/activities/{ACTIVITY}/participants", params={"email": TEST_EMAIL})
    assert res.status_code == 404
