"""MVP operational entities; business rules remain in services, not models."""
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4
from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.base import Base, TimestampMixin

UUIDType = PG_UUID(as_uuid=True)

class Port(TimestampMixin, Base):
    __tablename__ = "ports"
    __table_args__ = (UniqueConstraint("code", name="uq_ports_code"),)
    id: Mapped[UUID] = mapped_column(UUIDType, primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str] = mapped_column(String(80), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    max_yard_capacity_teu: Mapped[int | None] = mapped_column(Integer)
    berths: Mapped[list["Berth"]] = relationship(back_populates="port", cascade="all, delete-orphan")
    cranes: Mapped[list["Crane"]] = relationship(back_populates="port", cascade="all, delete-orphan")
    schedules: Mapped[list["VesselSchedule"]] = relationship(back_populates="port", cascade="all, delete-orphan")

class Vessel(TimestampMixin, Base):
    __tablename__ = "vessels"
    __table_args__ = (UniqueConstraint("imo_number", name="uq_vessels_imo_number"), CheckConstraint("capacity_teu > 0", name="positive_capacity"), CheckConstraint("length_m > 0 AND beam_m > 0 AND draft_m > 0", name="positive_dimensions"))
    id: Mapped[UUID] = mapped_column(UUIDType, primary_key=True, default=uuid4)
    imo_number: Mapped[str] = mapped_column(String(16), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    vessel_type: Mapped[str] = mapped_column(String(40), nullable=False)
    capacity_teu: Mapped[int] = mapped_column(Integer, nullable=False)
    length_m: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    beam_m: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    draft_m: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    operator_name: Mapped[str] = mapped_column(String(120), nullable=False)
    schedules: Mapped[list["VesselSchedule"]] = relationship(back_populates="vessel")

class Berth(TimestampMixin, Base):
    __tablename__ = "berths"
    __table_args__ = (UniqueConstraint("port_id", "code", name="uq_berths_port_code"), Index("ix_berths_port_status", "port_id", "status"), CheckConstraint("max_length_m > 0 AND max_draft_m > 0 AND max_cranes >= 0", name="valid_berth_capacity"))
    id: Mapped[UUID] = mapped_column(UUIDType, primary_key=True, default=uuid4)
    port_id: Mapped[UUID] = mapped_column(ForeignKey("ports.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    max_length_m: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    max_draft_m: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    max_cranes: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="available")
    available_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    available_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    port: Mapped[Port] = relationship(back_populates="berths")
    home_cranes: Mapped[list["Crane"]] = relationship(back_populates="berth")
    preferred_by: Mapped[list["VesselSchedule"]] = relationship(back_populates="preferred_berth", foreign_keys="VesselSchedule.preferred_berth_id")
    operations: Mapped[list["HistoricalOperation"]] = relationship(back_populates="assigned_berth")

class Crane(TimestampMixin, Base):
    __tablename__ = "cranes"
    __table_args__ = (UniqueConstraint("port_id", "code", name="uq_cranes_port_code"), Index("ix_cranes_port_status", "port_id", "status"), CheckConstraint("moves_per_hour > 0", name="positive_productivity"))
    id: Mapped[UUID] = mapped_column(UUIDType, primary_key=True, default=uuid4)
    port_id: Mapped[UUID] = mapped_column(ForeignKey("ports.id", ondelete="CASCADE"), nullable=False)
    berth_id: Mapped[UUID | None] = mapped_column(ForeignKey("berths.id", ondelete="SET NULL"))
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    moves_per_hour: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="available")
    available_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    available_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    port: Mapped[Port] = relationship(back_populates="cranes")
    berth: Mapped[Berth | None] = relationship(back_populates="home_cranes")

class VesselSchedule(TimestampMixin, Base):
    __tablename__ = "vessel_schedules"
    __table_args__ = (Index("ix_schedules_port_eta", "port_id", "eta"), Index("ix_schedules_vessel_eta", "vessel_id", "eta"), CheckConstraint("priority BETWEEN 1 AND 5", name="priority_range"), CheckConstraint("expected_containers >= 0", name="nonnegative_containers"))
    id: Mapped[UUID] = mapped_column(UUIDType, primary_key=True, default=uuid4)
    vessel_id: Mapped[UUID] = mapped_column(ForeignKey("vessels.id", ondelete="CASCADE"), nullable=False)
    port_id: Mapped[UUID] = mapped_column(ForeignKey("ports.id", ondelete="CASCADE"), nullable=False)
    eta: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    etd: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expected_containers: Mapped[int] = mapped_column(Integer, nullable=False)
    cargo_type: Mapped[str] = mapped_column(String(40), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_berth_id: Mapped[UUID | None] = mapped_column(ForeignKey("berths.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="scheduled")
    source: Mapped[str] = mapped_column(String(40), nullable=False, default="synthetic")
    is_synthetic: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    vessel: Mapped[Vessel] = relationship(back_populates="schedules")
    port: Mapped[Port] = relationship(back_populates="schedules")
    preferred_berth: Mapped[Berth | None] = relationship(back_populates="preferred_by", foreign_keys=[preferred_berth_id])
    historical_operation: Mapped["HistoricalOperation | None"] = relationship(back_populates="schedule", uselist=False, cascade="all, delete-orphan")

class HistoricalOperation(Base):
    __tablename__ = "historical_operations"
    __table_args__ = (Index("ix_operations_schedule_id", "schedule_id"), CheckConstraint("waiting_minutes >= 0", name="nonnegative_waiting"), CheckConstraint("service_minutes IS NULL OR service_minutes > 0", name="positive_service"), CheckConstraint("cranes_used >= 0", name="nonnegative_cranes"), CheckConstraint("actual_departure IS NULL OR actual_arrival IS NULL OR actual_departure >= actual_arrival", name="departure_after_arrival"))
    id: Mapped[UUID] = mapped_column(UUIDType, primary_key=True, default=uuid4)
    schedule_id: Mapped[UUID] = mapped_column(ForeignKey("vessel_schedules.id", ondelete="CASCADE"), nullable=False, unique=True)
    actual_arrival: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    berth_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    berth_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    actual_departure: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    assigned_berth_id: Mapped[UUID] = mapped_column(ForeignKey("berths.id"), nullable=False)
    cranes_used: Mapped[int] = mapped_column(Integer, nullable=False)
    average_moves_per_hour: Mapped[int] = mapped_column(Integer, nullable=False)
    waiting_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    service_minutes: Mapped[int | None] = mapped_column(Integer)
    delay_reason: Mapped[str | None] = mapped_column(String(120))
    is_synthetic: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    schedule: Mapped[VesselSchedule] = relationship(back_populates="historical_operation")
    assigned_berth: Mapped[Berth] = relationship(back_populates="operations")
