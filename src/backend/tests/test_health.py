import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check_returns_200(client: TestClient):
    """Asserts GET /api/v1/health returns 200 and valid health payload."""
    response = client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "status": "healthy",
        "service": "portflow-api",
        "version": "0.1.0"
    }
