"""Deterministic, fictional terminal data for demos and future ML work."""
from __future__ import annotations
import argparse
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

SEED = 2026
SCENARIOS = ("baseline", "arrival_surge", "crane_outage", "berth_closure", "handling_slowdown")

def generate_dataset(seed: int = SEED, scenario: str = "baseline") -> dict[str, list[dict]]:
    if scenario not in SCENARIOS:
        raise ValueError(f"scenario must be one of {SCENARIOS}")
    rng = random.Random(seed)
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    port = {"code": "PFA", "name": "Bluehaven Container Terminal", "country": "Fictionland", "latitude": 12.345678, "longitude": 78.901234, "timezone": "UTC", "max_yard_capacity_teu": 42000, "is_synthetic": True}
    berths = [{"code": f"B{i}", "name": f"Bluehaven Quay {i}", "max_length_m": (330 if i == 1 else 280), "max_draft_m": (15 if i != 3 else 11), "max_cranes": 3, "status": "closed" if scenario == "berth_closure" and i == 3 else "available", "is_synthetic": True} for i in (1, 2, 3)]
    cranes = [{"code": f"QC{i:02d}", "moves_per_hour": 32 + rng.randrange(0, 13), "status": "outage" if scenario == "crane_outage" and i in (6, 7) else "available", "berth_code": f"B{((i - 1) % 3) + 1}", "is_synthetic": True} for i in range(1, 8)]
    vessels = []
    for i in range(1, 16):
        vessels.append({"imo_number": f"990{i:04d}", "name": f"Fictional Trader {i:02d}", "vessel_type": "container", "capacity_teu": 1800 + (i % 5) * 700, "length_m": 210 + (i % 6) * 18, "beam_m": 30 + (i % 3) * 3, "draft_m": 10.0 + (i % 5) * 1.1, "operator_name": "Northstar Lines", "is_synthetic": True})
    schedules = []
    operations = []
    for i in range(36):
        vessel = vessels[i % len(vessels)]
        surge = scenario == "arrival_surge" and i < 24
        eta = now + timedelta(hours=(i * 3 if not surge else (i % 8) * 2))
        compatible = [b for b in berths if vessel["length_m"] <= b["max_length_m"] and vessel["draft_m"] <= b["max_draft_m"] and b["status"] == "available"]
        berth = compatible[i % len(compatible)] if compatible else next(b for b in berths if b["status"] == "available")
        moves = 180 + (i * 47) % 620
        cranes_used = 1 + min(3, moves // 260)
        productivity = sum(c["moves_per_hour"] for c in cranes if c["status"] == "available" and c["berth_code"] == berth["code"])
        productivity = max(20, productivity // max(1, cranes_used))
        slowdown = 1.35 if scenario == "handling_slowdown" else 1.0
        waiting = max(0, (i - 10) * 7) + (25 if surge else 0) + (35 if scenario in ("crane_outage", "berth_closure") else 0)
        service = max(30, round(moves / productivity * 60 * slowdown))
        schedule = {"vessel_imo": vessel["imo_number"], "eta": eta.isoformat(), "expected_containers": moves, "cargo_type": "mixed", "priority": 1 + (i % 5), "preferred_berth_code": berth["code"], "status": "scheduled", "source": "synthetic", "is_synthetic": True}
        schedules.append(schedule)
        arrival = eta + timedelta(minutes=waiting)
        start = arrival
        end = start + timedelta(minutes=service)
        operations.append({"schedule_index": i, "actual_arrival": arrival.isoformat(), "berth_start": start.isoformat(), "berth_end": end.isoformat(), "actual_departure": end.isoformat(), "assigned_berth_code": berth["code"], "cranes_used": cranes_used, "average_moves_per_hour": productivity, "waiting_minutes": waiting, "service_minutes": service, "delay_reason": "berth congestion" if waiting else None, "is_synthetic": True})
    return {"ports": [port], "berths": berths, "cranes": cranes, "vessels": vessels, "vessel_schedules": schedules, "historical_operations": operations}

def write_scenarios(output_dir: Path, seed: int = SEED) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for scenario in SCENARIOS:
        (output_dir / f"{scenario}.json").write_text(json.dumps(generate_dataset(seed, scenario), indent=2), encoding="utf-8")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).parent / "scenarios")
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()
    write_scenarios(args.output, args.seed)
    print(f"Generated {len(SCENARIOS)} synthetic scenarios with seed {args.seed} in {args.output}")
