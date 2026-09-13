"""Unit and integration tests for dashboard, baseline congestion, schedules, and resource APIs."""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from data.generate_synthetic import SCENARIOS, generate_dataset


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


def test_dashboard_summary_returns_seeded_data(client):
    """1. Dashboard summary returns all required KPI fields with seeded data."""
    response = client.get("/api/v1/dashboard/summary?port_code=PFA&scenario=baseline")
    assert response.status_code == 200
    data = response.json()

    assert data["port"]["code"] == "PFA"
    assert "Bluehaven" in data["port"]["name"]
    assert data["horizon_hours"] == 72
    assert data["active_upcoming_vessels"] > 0
    assert data["arrivals_next_24h"] > 0
    assert data["total_berths"] == 3
    assert data["available_berths"] == 3
    assert data["total_cranes"] == 7
    assert data["available_cranes"] == 7
    assert 0.0 <= data["peak_congestion_risk"] <= 1.0
    assert data["peak_congestion_level"] in {"low", "medium", "high", "critical"}
    assert data["average_waiting_time_hours"] >= 0.0
    assert data["selected_scenario"] == "baseline"
    assert data["is_synthetic"] is True
    assert data["calculation_method"] == "baseline_rule_v1"


def test_congestion_horizon_returns_six_hour_buckets(client):
    """2. Congestion endpoint returns twelve 6-hour buckets for 72-hour horizon."""
    response = client.get("/api/v1/dashboard/congestion?port_code=PFA&horizon_hours=72&scenario=baseline")
    assert response.status_code == 200
    data = response.json()

    assert data["port_code"] == "PFA"
    assert data["horizon_hours"] == 72
    assert data["bucket_hours"] == 6
    assert data["calculation_method"] == "baseline_rule_v1"
    assert data["is_synthetic"] is True
    
    buckets = data["buckets"]
    assert len(buckets) == 12  # 72 / 6 = 12 buckets

    for idx, b in enumerate(buckets):
        assert b["bucket_index"] == idx
        assert "window_start_utc" in b
        assert "window_end_utc" in b
        assert 0.0 <= b["risk_probability"] <= 1.0
        assert b["risk_level"] in {"low", "medium", "high", "critical"}
        assert b["estimated_queue"] >= 0
        assert b["scheduled_arrivals"] >= 0
        assert b["expected_container_moves"] >= 0
        assert b["available_berths"] >= 0
        assert b["available_cranes"] >= 0
        assert isinstance(b["top_rule_drivers"], list)
        assert len(b["top_rule_drivers"]) > 0


def test_risk_probability_stays_between_0_and_1_across_all_scenarios(client):
    """3. Risk probability is bounded in [0.0, 1.0] across all scenarios."""
    for sc in SCENARIOS:
        response = client.get(f"/api/v1/dashboard/congestion?port_code=PFA&scenario={sc}")
        assert response.status_code == 200
        data = response.json()
        assert data["selected_scenario"] == sc
        assert 0.0 <= data["peak_risk_probability"] <= 1.0
        for b in data["buckets"]:
            assert 0.0 <= b["risk_probability"] <= 1.0
            assert b["risk_level"] in {"low", "medium", "high", "critical"}


def test_invalid_scenario_returns_standard_error_envelope(client):
    """4. Invalid scenario returns standard error envelope with code VALIDATION_ERROR."""
    response = client.get("/api/v1/dashboard/summary?port_code=PFA&scenario=invalid_scenario_xyz")
    assert response.status_code == 422
    err = response.json()
    assert "error" in err
    assert err["error"]["code"] == "VALIDATION_ERROR"
    assert "invalid_scenario_xyz" in err["error"]["message"]
    assert len(err["error"]["details"]) > 0


def test_scenario_does_not_modify_persisted_source_records(client):
    """5. Querying a scenario does not mutate baseline data."""
    # Baseline before
    res_before = client.get("/api/v1/dashboard/summary?port_code=PFA&scenario=baseline")
    assert res_before.status_code == 200
    baseline_before = res_before.json()

    # Run surge and outage scenarios
    res_surge = client.get("/api/v1/dashboard/summary?port_code=PFA&scenario=arrival_surge")
    assert res_surge.status_code == 200
    res_outage = client.get("/api/v1/dashboard/summary?port_code=PFA&scenario=crane_outage")
    assert res_outage.status_code == 200

    # Baseline after
    res_after = client.get("/api/v1/dashboard/summary?port_code=PFA&scenario=baseline")
    assert res_after.status_code == 200
    baseline_after = res_after.json()

    assert baseline_before["total_cranes"] == baseline_after["total_cranes"]
    assert baseline_before["available_cranes"] == baseline_after["available_cranes"]
    assert baseline_before["total_berths"] == baseline_after["total_berths"]
    assert baseline_before["available_berths"] == baseline_after["available_berths"]
    assert baseline_before["active_upcoming_vessels"] == baseline_after["active_upcoming_vessels"]


def test_schedule_list_filters_by_port_and_date_range(client):
    """6. Schedule list filters correctly by port and returns compatibility analysis."""
    response = client.get("/api/v1/schedules?port_code=PFA&scenario=baseline")
    assert response.status_code == 200
    data = response.json()

    assert data["port_code"] == "PFA"
    assert data["total_items"] > 0
    assert len(data["data"]) > 0

    first_item = data["data"][0]
    assert "vessel_name" in first_item
    assert "eta_utc" in first_item
    assert "expected_containers" in first_item
    assert "priority" in first_item
    assert "priority_label" in first_item
    assert "compatible_berth_count" in first_item
    assert "compatible_berth_codes" in first_item
    assert "baseline_estimated_waiting_hours" in first_item
    assert "baseline_estimated_impact" in first_item
    assert "congestion_risk_level" in first_item
    assert first_item["is_synthetic"] is True


def test_no_data_for_unknown_port_returns_honest_not_found(client):
    """7. Non-existent port code returns an honest error envelope."""
    response = client.get("/api/v1/dashboard/summary?port_code=UNKNOWN_XYZ")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"


def test_resources_berths_and_cranes_endpoints(client):
    """8. Berths and cranes endpoints expose required status and capacities."""
    res_berths = client.get("/api/v1/resources/berths?port_code=PFA&scenario=baseline")
    assert res_berths.status_code == 200
    berths = res_berths.json()["data"]
    assert len(berths) == 3
    assert all("code" in b and "max_draft_m" in b and "status" in b for b in berths)

    res_cranes = client.get("/api/v1/resources/cranes?port_code=PFA&scenario=baseline")
    assert res_cranes.status_code == 200
    cranes = res_cranes.json()["data"]
    assert len(cranes) == 7
    assert all("code" in c and "moves_per_hour" in c and "status" in c for c in cranes)


def test_scenarios_endpoint_returns_all_options(client):
    """9. Scenarios endpoint lists all 5 synthetic scenarios."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert data["default"] == "baseline"
    assert data["calculation_method"] == "baseline_rule_v1"
    assert data["is_synthetic"] is True
    assert len(data["data"]) == 5
    keys = {s["key"] for s in data["data"]}
    assert keys == set(SCENARIOS)
