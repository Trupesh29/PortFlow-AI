"""Tests for prediction endpoints (Phase 7).

Covers:
  - 503 model_unavailable when artifacts are missing
  - 404 when schedule_id is unknown
  - 422 when congestion window > 72 hours
  - Valid prediction ranges after training
  - Congestion slot structure integrity
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from ml.inference import ModelRegistry

client = TestClient(app, raise_server_exceptions=False)


def _reset_registry() -> None:
    """Clear cached models to force re-load from disk on next call."""
    ModelRegistry.reset()


# ── Fixture: isolate model state ──────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_model_registry():
    """Ensure each test starts with a clean model registry."""
    _reset_registry()
    yield
    _reset_registry()


# ── 503 model unavailable tests ───────────────────────────────────────────────

def test_waiting_time_503_when_model_missing(tmp_path, monkeypatch):
    """Endpoint returns 503 with error=model_unavailable when artifacts absent."""
    # Point ModelRegistry artifact paths to non-existent files
    import ml.inference as infer
    monkeypatch.setattr(infer, "WAITING_TIME_PATH", tmp_path / "missing.joblib")
    _reset_registry()

    response = client.post(
        "/api/v1/predictions/waiting-time",
        json={"schedule_id": "sched-syn-baseline-000"},
    )
    assert response.status_code == 503, response.text
    detail = response.json().get("detail", {})
    assert detail.get("error") == "model_unavailable"


def test_congestion_503_when_model_missing(tmp_path, monkeypatch):
    """Endpoint returns 503 with error=model_unavailable when artifacts absent."""
    import ml.inference as infer
    monkeypatch.setattr(infer, "CONGESTION_PATH", tmp_path / "missing.joblib")
    _reset_registry()

    response = client.post(
        "/api/v1/predictions/congestion",
        json={
            "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
            "window_start_utc": "2026-01-01T00:00:00Z",
            "window_end_utc": "2026-01-01T06:00:00Z",
            "slot_duration_minutes": 60,
        },
    )
    assert response.status_code == 503, response.text
    detail = response.json().get("detail", {})
    assert detail.get("error") == "model_unavailable"


# ── Validation error tests ────────────────────────────────────────────────────

def test_congestion_422_when_window_exceeds_72_hours():
    """Window > 72 hours should return 422."""
    import ml.inference as infer
    from pathlib import Path
    # Create a dummy joblib file so 503 is not triggered before 422
    dummy = Path(__file__).parent.parent.parent / "ml" / "artifacts" / "congestion_v1.joblib"
    if not dummy.exists():
        pytest.skip("Model artifact missing — cannot reach the window validation logic.")

    response = client.post(
        "/api/v1/predictions/congestion",
        json={
            "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
            "window_start_utc": "2026-01-01T00:00:00Z",
            "window_end_utc": "2026-01-04T01:00:00Z",  # 73 hours
            "slot_duration_minutes": 60,
        },
    )
    assert response.status_code == 422, response.text


def test_congestion_422_when_slot_duration_invalid():
    """slot_duration_minutes of 45 (not 30 or 60) should return 422."""
    response = client.post(
        "/api/v1/predictions/congestion",
        json={
            "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
            "window_start_utc": "2026-01-01T00:00:00Z",
            "window_end_utc": "2026-01-01T06:00:00Z",
            "slot_duration_minutes": 45,
        },
    )
    assert response.status_code == 422, response.text


# ── Tests that require trained artifacts ──────────────────────────────────────

@pytest.mark.skipif(
    not ModelRegistry.are_models_available(),
    reason="ML artifacts not trained yet — run `python -m ml.train` from src/",
)
def test_waiting_time_prediction_returns_valid_range():
    """After training, waiting-time prediction must return non-negative hours."""
    response = client.post(
        "/api/v1/predictions/waiting-time",
        json={"schedule_id": "sched-syn-baseline-000"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["predicted_waiting_time_hours"] >= 0.0
    assert data["prediction_lower_bound_hours"] >= 0.0
    assert data["prediction_upper_bound_hours"] >= data["prediction_lower_bound_hours"]
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["model_version"].startswith("waiting_time")
    assert data["data_source"] == "synthetic"
    assert isinstance(data["explanation_factors"], list)
    assert len(data["explanation_factors"]) >= 1


@pytest.mark.skipif(
    not ModelRegistry.are_models_available(),
    reason="ML artifacts not trained yet — run `python -m ml.train` from src/",
)
def test_congestion_prediction_probability_between_0_and_1():
    """After training, each congestion slot must have a probability in [0, 1]."""
    response = client.post(
        "/api/v1/predictions/congestion",
        json={
            "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
            "window_start_utc": "2026-01-01T00:00:00Z",
            "window_end_utc": "2026-01-03T00:00:00Z",
            "slot_duration_minutes": 60,
        },
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "slots" in data
    assert len(data["slots"]) > 0
    for slot in data["slots"]:
        assert 0.0 <= slot["congestion_probability"] <= 1.0
        assert slot["congestion_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
        assert slot["vessel_count_expected"] >= 0
    assert data["model_version"].startswith("congestion")


@pytest.mark.skipif(
    not ModelRegistry.are_models_available(),
    reason="ML artifacts not trained yet — run `python -m ml.train` from src/",
)
def test_unknown_schedule_id_returns_404():
    """A schedule_id that does not exist returns 404 not_found."""
    response = client.post(
        "/api/v1/predictions/waiting-time",
        json={"schedule_id": "00000000-0000-0000-0000-000000000000"},
    )
    assert response.status_code == 404, response.text
    detail = response.json().get("detail", {})
    assert detail.get("error") == "not_found"
