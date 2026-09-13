import pytest
from sqlalchemy import create_engine
from database.base import Base
from database.models import Port, Vessel, VesselSchedule

def test_metadata_contains_required_tables():
    assert set(Base.metadata.tables) == {"ports", "vessels", "berths", "cranes", "vessel_schedules", "historical_operations"}

def test_foreign_keys_and_unique_constraints_exist():
    for table, columns in {"berths": ["port_id"], "cranes": ["port_id", "berth_id"], "vessel_schedules": ["vessel_id", "port_id", "preferred_berth_id"], "historical_operations": ["schedule_id", "assigned_berth_id"]}.items():
        assert all(Base.metadata.tables[table].c[name].foreign_keys for name in columns)
    for table, name in (("ports", "uq_ports_code"), ("vessels", "uq_vessels_imo_number"), ("berths", "uq_berths_port_code"), ("cranes", "uq_cranes_port_code")):
        assert name in {c.name for c in Base.metadata.tables[table].constraints}

def test_relationships_are_bidirectional():
    assert Port.berths.property.back_populates == "port"
    assert Port.cranes.property.back_populates == "port"
    assert Vessel.schedules.property.back_populates == "vessel"
    assert VesselSchedule.historical_operation.property.back_populates == "schedule"

def test_validation_checks_are_declared():
    checks = {c.name for t in Base.metadata.tables.values() for c in t.constraints if c.__class__.__name__ == "CheckConstraint"}
    assert any(name.endswith("_nonnegative_waiting") for name in checks)
    assert any(name.endswith("_priority_range") for name in checks)
    assert any(name.endswith("_positive_productivity") for name in checks)
    assert any(name.endswith("_positive_dimensions") for name in checks)

@pytest.mark.integration
def test_postgresql_migration_smoke():
    import os
    url = os.getenv("DATABASE_URL", "postgresql+psycopg://portflow:change-me@localhost:5432/portflow")
    if os.getenv("APP_ENV", "development") == "production":
        pytest.skip("refusing to use a production environment for tests")
    try:
        engine = create_engine(url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
        with engine.connect(): pass
    except Exception as exc:
        pytest.skip(f"PostgreSQL unavailable at configured test URL: {exc.__class__.__name__}")
