"""Pydantic schemas for the predictions endpoints.

Implements the API_CONTRACT.md §7 (Congestion Prediction) and §8
(Waiting-Time Prediction) contracts verbatim.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


# ── §8 Waiting-Time Prediction ────────────────────────────────────────────────

class WaitingTimePredictionRequest(BaseModel):
    """POST /api/v1/predictions/waiting-time request body."""
    schedule_id: str = Field(
        ...,
        description="UUID of the vessel schedule to predict waiting time for.",
        examples=["d0000001-0000-0000-0000-000000000001"],
    )


class ExplanationFactor(BaseModel):
    """A single SHAP-style explanation factor for a prediction."""
    factor: str
    contribution: float = Field(ge=0.0, le=1.0)
    description: str


class WaitingTimePredictionResponse(BaseModel):
    """Response for POST /api/v1/predictions/waiting-time."""
    schedule_id: str
    vessel_id: str
    port_id: str
    eta_utc: str
    predicted_waiting_time_hours: float = Field(ge=0.0)
    prediction_lower_bound_hours: float = Field(ge=0.0)
    prediction_upper_bound_hours: float = Field(ge=0.0)
    confidence: float = Field(ge=0.0, le=1.0)
    model_version: str
    data_source: str
    generated_at_utc: str
    explanation_factors: List[ExplanationFactor]


# ── §7 Congestion Prediction ──────────────────────────────────────────────────

class CongestionPredictionRequest(BaseModel):
    """POST /api/v1/predictions/congestion request body."""
    port_id: str = Field(
        ...,
        description="UUID of the port.",
        examples=["a1b2c3d4-0000-0000-0000-000000000001"],
    )
    window_start_utc: str = Field(
        ...,
        description="ISO 8601 UTC start of prediction window.",
        examples=["2026-09-12T06:00:00Z"],
    )
    window_end_utc: str = Field(
        ...,
        description="ISO 8601 UTC end of prediction window (max 72 h from start).",
        examples=["2026-09-15T06:00:00Z"],
    )
    slot_duration_minutes: int = Field(
        default=60,
        description="Slot granularity in minutes (30 or 60).",
        ge=30,
        le=60,
    )

    @field_validator("slot_duration_minutes")
    @classmethod
    def must_be_30_or_60(cls, v: int) -> int:
        if v not in (30, 60):
            raise ValueError("slot_duration_minutes must be 30 or 60")
        return v


class CongestionSlot(BaseModel):
    """One time slot in the congestion prediction response."""
    slot_start_utc: str
    slot_end_utc: str
    congestion_probability: float = Field(ge=0.0, le=1.0)
    congestion_level: str  # LOW | MEDIUM | HIGH | CRITICAL
    predicted_berth_occupancy_pct: float = Field(ge=0.0, le=100.0)
    vessel_count_expected: int = Field(ge=0)
    contributing_vessel_ids: List[str]


class CongestionPredictionResponse(BaseModel):
    """Response for POST /api/v1/predictions/congestion."""
    port_id: str
    generated_at_utc: str
    model_version: str
    data_source: str
    slots: List[CongestionSlot]
