"""Point-in-time feature engineering for PortFlow AI ML models.

Features are derived from vessel schedules, vessel physical attributes, and
terminal snapshot data.  All inputs are plain Python dicts so the same logic
runs during offline training AND online FastAPI inference without any DB
dependency here.

Feature vector (17 numeric columns, no categoricals):
  vessel_draft_m          – vessel draft in metres
  vessel_length_m         – vessel LOA in metres
  vessel_beam_m           – vessel beam in metres
  vessel_capacity_teu     – nominal TEU capacity
  expected_containers     – container moves expected this call
  priority                – integer 1 (urgent) – 5 (low)
  hour_of_day             – UTC hour of ETA [0-23]
  day_of_week             – UTC weekday of ETA [0=Mon – 6=Sun]
  concurrent_arrivals_6h  – # other vessels with ETA within ±3 h of this one
  available_berths        – terminal berths with status == 'available'
  compatible_berths       – berths that satisfy draft + length constraints
  compatible_ratio        – compatible_berths / max(1, available_berths)
  available_cranes        – cranes with status == 'available'
  crane_total_mph         – sum of moves_per_hour of available cranes
  berth_pressure          – concurrent_arrivals_6h / max(1, available_berths)
  workload_pressure       – expected_containers / max(1, crane_total_mph * 6)
  congestion_label        – [TARGET] 1 if waiting_minutes >= 30 else 0
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import numpy as np

FEATURE_NAMES = [
    "vessel_draft_m",
    "vessel_length_m",
    "vessel_beam_m",
    "vessel_capacity_teu",
    "expected_containers",
    "priority",
    "hour_of_day",
    "day_of_week",
    "concurrent_arrivals_6h",
    "available_berths",
    "compatible_berths",
    "compatible_ratio",
    "available_cranes",
    "crane_total_mph",
    "berth_pressure",
    "workload_pressure",
]

WAITING_TIME_TARGET = "waiting_minutes"
CONGESTION_TARGET = "congestion_label"
CONGESTION_THRESHOLD_MINUTES = 30  # waiting >= 30 min => congested


def _parse_eta(eta_str: str) -> datetime:
    """Parse ISO-8601 ETA string to UTC datetime."""
    dt = datetime.fromisoformat(eta_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def build_features(
    schedule: Dict[str, Any],
    vessel: Dict[str, Any],
    all_schedules: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    cranes: List[Dict[str, Any]],
) -> Dict[str, float]:
    """Build the feature dict for a single schedule row.

    Args:
        schedule:      Dict with 'eta', 'expected_containers', 'priority'
        vessel:        Dict with 'draft_m', 'length_m', 'beam_m', 'capacity_teu'
        all_schedules: Full list of schedule dicts for concurrent-arrival calc
        berths:        Terminal berth dicts with 'max_draft_m', 'max_length_m',
                       'status'
        cranes:        Terminal crane dicts with 'moves_per_hour', 'status'

    Returns:
        Dict keyed by FEATURE_NAMES entries with float values.
    """
    eta_dt = _parse_eta(schedule["eta"])

    # --- Vessel physical attributes ---
    draft = float(vessel.get("draft_m", 11.0))
    length = float(vessel.get("length_m", 250.0))
    beam = float(vessel.get("beam_m", 32.0))
    capacity = float(vessel.get("capacity_teu", 2000))

    # --- Schedule attributes ---
    containers = float(schedule.get("expected_containers", 300))
    priority = float(schedule.get("priority", 3))
    hour_of_day = float(eta_dt.hour)
    day_of_week = float(eta_dt.weekday())

    # --- Terminal berth snapshot ---
    available_berths = [b for b in berths if b.get("status") == "available"]
    compatible_berths = [
        b for b in available_berths
        if length <= float(b.get("max_length_m", 300.0))
        and draft <= float(b.get("max_draft_m", 15.0))
    ]
    n_avail_berths = len(available_berths)
    n_compat_berths = len(compatible_berths)
    compat_ratio = n_compat_berths / max(1, n_avail_berths)

    # --- Terminal crane snapshot ---
    available_cranes = [c for c in cranes if c.get("status") == "available"]
    n_avail_cranes = len(available_cranes)
    crane_total_mph = sum(
        float(c.get("moves_per_hour", 32)) for c in available_cranes
    ) if available_cranes else 1.0

    # --- Concurrent arrivals within ±3 h of this ETA ---
    window = timedelta(hours=3)
    concurrent = sum(
        1
        for s in all_schedules
        if s is not schedule  # identity check to exclude self
        and abs((_parse_eta(s["eta"]) - eta_dt).total_seconds()) <= window.total_seconds()
    )

    # --- Derived pressure ratios ---
    berth_pressure = concurrent / max(1, n_avail_berths)
    workload_pressure = containers / max(1.0, crane_total_mph * 6.0)

    return {
        "vessel_draft_m": draft,
        "vessel_length_m": length,
        "vessel_beam_m": beam,
        "vessel_capacity_teu": capacity,
        "expected_containers": containers,
        "priority": priority,
        "hour_of_day": hour_of_day,
        "day_of_week": day_of_week,
        "concurrent_arrivals_6h": float(concurrent),
        "available_berths": float(n_avail_berths),
        "compatible_berths": float(n_compat_berths),
        "compatible_ratio": compat_ratio,
        "available_cranes": float(n_avail_cranes),
        "crane_total_mph": crane_total_mph,
        "berth_pressure": berth_pressure,
        "workload_pressure": workload_pressure,
    }


def build_feature_matrix(
    schedules: List[Dict[str, Any]],
    vessels_by_imo: Dict[str, Dict[str, Any]],
    berths: List[Dict[str, Any]],
    cranes: List[Dict[str, Any]],
) -> tuple[np.ndarray, Optional[np.ndarray], Optional[np.ndarray]]:
    """Build X, y_wait, y_congestion matrices for training.

    Args:
        schedules:       List of schedule dicts (each must have 'vessel_imo',
                         'eta', 'expected_containers', 'priority', and
                         optionally 'waiting_minutes' for supervised training).
        vessels_by_imo:  Mapping of IMO number → vessel dict.
        berths:          Terminal berth list.
        cranes:          Terminal crane list.

    Returns:
        (X, y_wait, y_congestion) as numpy arrays.
        y_wait / y_congestion are None if waiting_minutes is not in the data.
    """
    rows, y_wait_list, y_cong_list = [], [], []
    has_targets = any("waiting_minutes" in s for s in schedules)

    for s in schedules:
        imo = s.get("vessel_imo", "")
        vessel = vessels_by_imo.get(imo, {})
        feat = build_features(s, vessel, schedules, berths, cranes)
        rows.append([feat[col] for col in FEATURE_NAMES])

        if has_targets:
            wm = float(s.get("waiting_minutes", 0))
            y_wait_list.append(wm)
            y_cong_list.append(1 if wm >= CONGESTION_THRESHOLD_MINUTES else 0)

    X = np.array(rows, dtype=np.float64)
    y_wait = np.array(y_wait_list, dtype=np.float64) if has_targets else None
    y_cong = np.array(y_cong_list, dtype=np.int32) if has_targets else None
    return X, y_wait, y_cong


def build_inference_feature_vector(
    schedule: Dict[str, Any],
    vessel: Dict[str, Any],
    all_schedules: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    cranes: List[Dict[str, Any]],
) -> np.ndarray:
    """Return a (1, 16) feature array ready for model.predict()."""
    feat = build_features(schedule, vessel, all_schedules, berths, cranes)
    row = [feat[col] for col in FEATURE_NAMES]
    return np.array([row], dtype=np.float64)
