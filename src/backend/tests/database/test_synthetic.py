from data.generate_synthetic import generate_dataset

def test_generator_is_reproducible_and_sized():
    data = generate_dataset(2026, "baseline")
    assert data == generate_dataset(2026, "baseline")
    assert len(data["vessels"]) >= 12 and len(data["vessel_schedules"]) >= 30
    assert len(data["berths"]) == 3 and len(data["cranes"]) == 7

def test_every_operation_uses_compatible_berth():
    data = generate_dataset()
    vessels = {v["imo_number"]: v for v in data["vessels"]}; berths = {b["code"]: b for b in data["berths"]}
    for schedule, operation in zip(data["vessel_schedules"], data["historical_operations"]):
        vessel = vessels[schedule["vessel_imo"]]; berth = berths[operation["assigned_berth_code"]]
        assert vessel["length_m"] <= berth["max_length_m"] and vessel["draft_m"] <= berth["max_draft_m"]

def test_congested_scenarios_have_more_pressure_than_baseline():
    baseline = sum(x["waiting_minutes"] for x in generate_dataset(2026, "baseline")["historical_operations"])
    for scenario in ("arrival_surge", "crane_outage", "berth_closure"):
        assert sum(x["waiting_minutes"] for x in generate_dataset(2026, scenario)["historical_operations"]) > baseline
