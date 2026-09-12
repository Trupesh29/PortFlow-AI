"""Idempotently seed the local/development PostgreSQL database with fictional data."""
from __future__ import annotations
import argparse
import os
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from database.models import Berth, Crane, HistoricalOperation, Port, Vessel, VesselSchedule
from database.session import SessionLocal
from data.generate_synthetic import generate_dataset

def seed_database(session: Session, seed: int = 2026, scenario: str = "baseline", reset: bool = False) -> dict[str, int]:
    if reset and os.getenv("APP_ENV", "development").lower() not in {"development", "test", "local"}:
        raise RuntimeError("--reset is only permitted in development, test, or local environments")
    if reset:
        for model in (HistoricalOperation, VesselSchedule, Crane, Berth, Vessel, Port):
            session.execute(delete(model))
    data = generate_dataset(seed, scenario)
    port = session.scalar(select(Port).where(Port.code == data["ports"][0]["code"]))
    if port is None:
        now = datetime.now(timezone.utc)
        p = data["ports"][0]
        port = Port(**{k: p[k] for k in ("code", "name", "country", "latitude", "longitude", "timezone", "max_yard_capacity_teu")}, created_at=now, updated_at=now)
        session.add(port); session.flush()
    berth_map = {}
    now = datetime.now(timezone.utc)
    for item in data["berths"]:
        berth = session.scalar(select(Berth).where(Berth.port_id == port.id, Berth.code == item["code"]))
        if berth is None:
            berth = Berth(port_id=port.id, **{k: item[k] for k in ("code", "name", "max_length_m", "max_draft_m", "max_cranes", "status")}, created_at=now, updated_at=now)
            session.add(berth); session.flush()
        berth_map[item["code"]] = berth
    for item in data["cranes"]:
        if session.scalar(select(Crane).where(Crane.port_id == port.id, Crane.code == item["code"])) is None:
            session.add(Crane(port_id=port.id, berth_id=berth_map[item["berth_code"]].id, code=item["code"], moves_per_hour=item["moves_per_hour"], status=item["status"], created_at=now, updated_at=now))
    vessel_map = {}
    for item in data["vessels"]:
        vessel = session.scalar(select(Vessel).where(Vessel.imo_number == item["imo_number"]))
        if vessel is None:
            vessel = Vessel(**{k: item[k] for k in ("imo_number", "name", "vessel_type", "capacity_teu", "length_m", "beam_m", "draft_m", "operator_name")}, created_at=now, updated_at=now)
            session.add(vessel); session.flush()
        vessel_map[item["imo_number"]] = vessel
    for i, item in enumerate(data["vessel_schedules"]):
        eta = datetime.fromisoformat(item["eta"])
        schedule = session.scalar(select(VesselSchedule).join(Vessel).where(VesselSchedule.port_id == port.id, Vessel.imo_number == item["vessel_imo"], VesselSchedule.eta == eta))
        if schedule is None:
            schedule = VesselSchedule(vessel_id=vessel_map[item["vessel_imo"]].id, port_id=port.id, eta=eta, expected_containers=item["expected_containers"], cargo_type=item["cargo_type"], priority=item["priority"], preferred_berth_id=berth_map[item["preferred_berth_code"]].id, status=item["status"], source=item["source"], is_synthetic=True, created_at=now, updated_at=now)
            session.add(schedule); session.flush()
            op = data["historical_operations"][i]
            session.add(HistoricalOperation(schedule_id=schedule.id, actual_arrival=datetime.fromisoformat(op["actual_arrival"]), berth_start=datetime.fromisoformat(op["berth_start"]), berth_end=datetime.fromisoformat(op["berth_end"]), actual_departure=datetime.fromisoformat(op["actual_departure"]), assigned_berth_id=berth_map[op["assigned_berth_code"]].id, cranes_used=op["cranes_used"], average_moves_per_hour=op["average_moves_per_hour"], waiting_minutes=op["waiting_minutes"], service_minutes=op["service_minutes"], delay_reason=op["delay_reason"], is_synthetic=True, created_at=now))
    session.commit()
    return {name: session.query(model).count() for name, model in (("ports", Port), ("berths", Berth), ("cranes", Crane), ("vessels", Vessel), ("vessel_schedules", VesselSchedule), ("historical_operations", HistoricalOperation))}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(); parser.add_argument("--seed", type=int, default=2026); parser.add_argument("--scenario", default="baseline"); parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    with SessionLocal() as db:
        print(seed_database(db, args.seed, args.scenario, args.reset))
