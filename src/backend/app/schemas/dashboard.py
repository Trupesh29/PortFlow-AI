"""Pydantic schemas for the PortFlow dashboard, congestion baseline, schedules, and resources."""
from __future__ import annotations
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Scenarios
# ---------------------------------------------------------------------------

class ScenarioItem(BaseModel):
    """Metadata describing a synthetic operational scenario."""
    key: str = Field(..., description="Unique scenario identifier key")
    name: str = Field(..., description="Human-readable scenario name")
    description: str = Field(..., description="Operational description of the scenario effect")
    is_synthetic: bool = Field(default=True, description="Indicates data is fictional and synthetic")


class ScenariosListResponse(BaseModel):
    """Response containing all available synthetic scenarios."""
    data: List[ScenarioItem]
    default: str = Field(default="baseline", description="Default active scenario key")
    calculation_method: str = Field(default="baseline_rule_v1", description="Baseline calculation engine")
    is_synthetic: bool = Field(default=True)


# ---------------------------------------------------------------------------
# Berths & Cranes Resources
# ---------------------------------------------------------------------------

class BerthResourceItem(BaseModel):
    """Berth resource operational status."""
    berth_id: str
    code: str
    name: str
    max_length_m: float
    max_draft_m: float
    max_cranes: int
    status: str = Field(..., description="Operational status: available, closed, maintenance")
    current_occupancy: str = Field(default="available", description="Current state: available or occupied")
    assigned_vessel_name: Optional[str] = None
    allocated_cranes_count: int = Field(default=0)


class BerthsResponse(BaseModel):
    """List of berths for a port."""
    port_code: str
    selected_scenario: str
    is_synthetic: bool = Field(default=True)
    data: List[BerthResourceItem]


class CraneResourceItem(BaseModel):
    """Crane resource operational status."""
    crane_id: str
    code: str
    berth_code: Optional[str] = None
    moves_per_hour: int
    status: str = Field(..., description="Operational status: available, outage, maintenance, in_use")


class CranesResponse(BaseModel):
    """List of cranes for a port."""
    port_code: str
    selected_scenario: str
    is_synthetic: bool = Field(default=True)
    data: List[CraneResourceItem]


# ---------------------------------------------------------------------------
# Schedules
# ---------------------------------------------------------------------------

class ScheduleItemResponse(BaseModel):
    """Vessel schedule item with compatibility and baseline impact analysis."""
    schedule_id: str
    vessel_imo: str
    vessel_name: str
    vessel_type: str
    length_m: float
    draft_m: float
    beam_m: float
    eta_utc: str
    etd_utc: Optional[str] = None
    expected_containers: int
    priority: int = Field(..., ge=1, le=5)
    priority_label: str = Field(..., description="Normal, High, Urgent, Critical")
    preferred_berth_code: Optional[str] = None
    assigned_berth_code: Optional[str] = None
    compatible_berth_count: int
    compatible_berth_codes: List[str]
    status: str
    baseline_estimated_waiting_hours: float
    baseline_estimated_impact: str
    congestion_risk_level: str = Field(..., description="low, medium, high, critical")
    is_synthetic: bool = Field(default=True)


class SchedulesListResponse(BaseModel):
    """Paginated list of vessel schedules."""
    data: List[ScheduleItemResponse]
    port_code: str
    selected_scenario: str
    total_items: int
    is_synthetic: bool = Field(default=True)


# ---------------------------------------------------------------------------
# Congestion Baseline Forecast
# ---------------------------------------------------------------------------

class CongestionBucketItem(BaseModel):
    """Six-hour congestion forecast bucket."""
    bucket_index: int
    window_start_utc: str
    window_end_utc: str
    risk_probability: float = Field(..., ge=0.0, le=1.0, description="Deterministic risk probability 0.0 to 1.0")
    risk_level: str = Field(..., description="Risk category: low, medium, high, critical")
    estimated_queue: int = Field(..., ge=0, description="Estimated waiting vessels queue count")
    scheduled_arrivals: int = Field(..., ge=0, description="Vessels arriving in this window")
    expected_container_moves: int = Field(..., ge=0, description="Total expected container moves")
    available_berths: int
    available_cranes: int
    berth_occupancy_estimate_pct: float
    affected_schedule_ids: List[str] = Field(default_factory=list)
    affected_vessels: List[str] = Field(default_factory=list)
    top_rule_drivers: List[str] = Field(default_factory=list)


class CongestionForecastResponse(BaseModel):
    """72-hour congestion forecast divided into six-hour windows."""
    port_code: str
    horizon_hours: int = Field(default=72)
    bucket_hours: int = Field(default=6)
    selected_scenario: str
    is_synthetic: bool = Field(default=True)
    calculation_method: str = Field(default="baseline_rule_v1")
    as_of_utc: str
    peak_risk_probability: float
    peak_risk_level: str
    buckets: List[CongestionBucketItem]


# ---------------------------------------------------------------------------
# Dashboard Summary
# ---------------------------------------------------------------------------

class PortIdentity(BaseModel):
    """Port identity metadata."""
    code: str
    name: str
    country: str
    latitude: float
    longitude: float
    timezone: str


class DashboardSummaryResponse(BaseModel):
    """Operational dashboard summary KPIs and status."""
    port: PortIdentity
    as_of_utc: str
    horizon_hours: int = Field(default=72)
    active_upcoming_vessels: int
    arrivals_next_24h: int
    total_berths: int
    available_berths: int
    occupied_berths: int
    berth_occupancy_pct: float
    total_cranes: int
    available_cranes: int
    peak_congestion_risk: float = Field(..., ge=0.0, le=1.0)
    peak_congestion_level: str
    average_waiting_time_hours: float
    critical_vessel_count: int
    selected_scenario: str
    is_synthetic: bool = Field(default=True)
    calculation_method: str = Field(default="baseline_rule_v1")
