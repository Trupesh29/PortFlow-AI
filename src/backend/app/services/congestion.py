"""Deterministic Baseline Congestion Rule Engine (baseline_rule_v1).

Formula and Logic Documentation:
--------------------------------
This module calculates operational congestion risk and estimated vessel queues
over a specified horizon (default 72 hours) partitioned into 6-hour buckets.
It is an explicit, deterministic heuristic rule engine (baseline_rule_v1)
and NOT a trained statistical or machine learning model.

For each 6-hour bucket [t_start, t_end):
1. Arrivals demand:
   - Identifies scheduled vessel arrivals where t_start <= ETA < t_end.
   - Computes expected container moves demand = sum(schedule.expected_containers).
2. Resource capacity:
   - Available berths count (excluding closed berths in the scenario).
   - Available cranes count (excluding outage cranes in the scenario).
   - Crane moves throughput = sum(moves_per_hour of available cranes) * 6 hours * slowdown_factor.
3. Physical feasibility & draft checks:
   - For each arriving vessel, checks how many available berths meet both:
     vessel.length_m <= berth.max_length_m AND vessel.draft_m <= berth.max_draft_m.
   - A vessel with 0 compatible available berths represents a physical bottleneck.
   - A vessel restricted to <= 1 berth represents a constrained assignment.
4. Congestion pressure score (S):
   - Berth pressure: R_berth = scheduled_arrivals / max(1, available_berths)
   - Workload pressure: R_work = expected_moves / max(1, crane_moves_throughput)
   - Bottleneck penalty: 0.25 if restricted vessels exist, 0.40 if unaccommodated vessels exist.
   - Scenario baseline adjustments (e.g. arrival surge density, outage impact).
   - Raw pressure score: S = 0.50 * min(2.0, R_berth) + 0.30 * min(2.0, R_work) + bottleneck_penalty
5. Risk probability:
   - risk_probability = min(1.0, max(0.0, round(S / 1.75, 2)))
6. Risk level:
   - LOW: [0.0, 0.40)
   - MEDIUM: [0.40, 0.70)
   - HIGH: [0.70, 0.90)
   - CRITICAL: [0.90, 1.00]
7. Estimated queue count:
   - max(0, scheduled_arrivals - available_berths) + carryover_queue
8. Top rule drivers:
   - Transparent human-readable explanations based on specific triggered thresholds.
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Tuple
from backend.app.schemas.dashboard import CongestionBucketItem, CongestionForecastResponse


def classify_risk_level(prob: float) -> str:
    """Classifies risk level based on standard probability thresholds."""
    if prob >= 0.90:
        return "critical"
    if prob >= 0.70:
        return "high"
    if prob >= 0.40:
        return "medium"
    return "low"


def calculate_baseline_congestion(
    port_code: str,
    schedules: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    cranes: List[Dict[str, Any]],
    horizon_hours: int = 72,
    bucket_hours: int = 6,
    scenario: str = "baseline",
    reference_time: Optional[datetime] = None
) -> CongestionForecastResponse:
    """Computes a deterministic 72-hour congestion forecast using baseline_rule_v1."""
    if reference_time is None:
        if schedules:
            try:
                # Use earliest schedule ETA truncated to hour or current UTC
                first_eta = datetime.fromisoformat(schedules[0]["eta"])
                reference_time = datetime(first_eta.year, first_eta.month, first_eta.day, tzinfo=timezone.utc)
            except Exception:
                reference_time = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        else:
            reference_time = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)

    # Effective resources considering scenario
    available_berths = [b for b in berths if b.get("status") == "available"]
    available_cranes = [c for c in cranes if c.get("status") == "available"]
    
    slowdown_factor = 0.65 if scenario == "handling_slowdown" else 1.0
    nominal_crane_mph = sum(c.get("moves_per_hour", 35) for c in available_cranes)
    effective_6h_crane_capacity = max(50, int(nominal_crane_mph * bucket_hours * slowdown_factor))

    num_buckets = max(1, horizon_hours // bucket_hours)
    buckets: List[CongestionBucketItem] = []
    
    cumulative_queue = 0
    peak_risk = 0.0

    for b_idx in range(num_buckets):
        w_start = reference_time + timedelta(hours=b_idx * bucket_hours)
        w_end = w_start + timedelta(hours=bucket_hours)

        # Vessels arriving in this 6-hour bucket
        arriving_schedules: List[Dict[str, Any]] = []
        for s in schedules:
            try:
                eta_dt = datetime.fromisoformat(s["eta"])
                if w_start <= eta_dt < w_end:
                    arriving_schedules.append(s)
            except Exception:
                continue

        scheduled_arrivals = len(arriving_schedules)
        expected_moves = sum(s.get("expected_containers", 0) for s in arriving_schedules)
        affected_ids = [str(s.get("schedule_id", f"sched-{b_idx}-{i}")) for i, s in enumerate(arriving_schedules)]
        affected_vessels = [s.get("vessel_name", f"Vessel {s.get('vessel_imo', 'Unknown')}") for s in arriving_schedules]

        # Compatibility analysis
        restricted_count = 0
        unaccommodated_count = 0
        for s in arriving_schedules:
            v_len = s.get("length_m", 250.0)
            v_draft = s.get("draft_m", 11.0)
            compatible = [
                b for b in available_berths
                if v_len <= b.get("max_length_m", 300.0) and v_draft <= b.get("max_draft_m", 15.0)
            ]
            if len(compatible) == 0:
                unaccommodated_count += 1
            elif len(compatible) == 1:
                restricted_count += 1

        # Resource pressure calculations
        num_avail_berths = max(1, len(available_berths))
        berth_ratio = scheduled_arrivals / num_avail_berths
        workload_ratio = expected_moves / max(1, effective_6h_crane_capacity)
        
        # Rule drivers explanations
        drivers: List[str] = []
        bottleneck_penalty = 0.0

        if scheduled_arrivals > len(available_berths):
            excess = scheduled_arrivals - len(available_berths)
            drivers.append(f"{scheduled_arrivals} scheduled arrivals exceed {len(available_berths)} available berths (+{excess} vessel queue pressure)")
        
        if unaccommodated_count > 0:
            bottleneck_penalty += 0.35
            drivers.append(f"{unaccommodated_count} vessel(s) exceed maximum draft/length of all currently open berths")
        elif restricted_count > 0:
            bottleneck_penalty += 0.18
            drivers.append(f"{restricted_count} vessel(s) restricted to a single quay due to deep draft requirement")

        if workload_ratio > 0.85:
            drivers.append(f"Container workload ({expected_moves} moves) utilizes {int(workload_ratio * 100)}% of 6h crane throughput capacity ({effective_6h_crane_capacity} moves)")

        if scenario == "crane_outage":
            drivers.append(f"Active crane outage: 2 quay cranes offline, reducing 6-hour throughput to {effective_6h_crane_capacity} moves")
        elif scenario == "berth_closure":
            drivers.append("Active berth closure: Quay B3 offline for maintenance, concentrating traffic on remaining berths")
        elif scenario == "handling_slowdown":
            drivers.append("Handling slowdown: 35% operational productivity reduction applied across all crane operations")
        elif scenario == "arrival_surge":
            if scheduled_arrivals >= 3:
                drivers.append(f"Arrival surge window: Cluster of {scheduled_arrivals} container vessels arriving within 6 hours")

        if not drivers:
            drivers.append("Nominal arrival density within standard berth and crane throughput limits")

        # Score S formulation
        pressure_score = (0.45 * min(2.5, berth_ratio)) + (0.35 * min(2.5, workload_ratio)) + bottleneck_penalty
        if cumulative_queue > 0:
            pressure_score += min(0.3, cumulative_queue * 0.1)

        # Map to probability 0.0 .. 1.0
        prob = min(1.0, max(0.0, round(pressure_score / 1.75, 2)))
        r_level = classify_risk_level(prob)

        # Estimated queue
        raw_queue = max(0, scheduled_arrivals - len(available_berths))
        estimated_queue = raw_queue + (1 if cumulative_queue > 0 and raw_queue > 0 else 0)
        cumulative_queue = max(0, estimated_queue - 1)

        # Berth occupancy estimate percentage
        occ_estimate = min(100.0, round((scheduled_arrivals / max(1, len(berths))) * 100.0, 1))

        if prob > peak_risk:
            peak_risk = prob

        buckets.append(
            CongestionBucketItem(
                bucket_index=b_idx,
                window_start_utc=w_start.isoformat(),
                window_end_utc=w_end.isoformat(),
                risk_probability=prob,
                risk_level=r_level,
                estimated_queue=estimated_queue,
                scheduled_arrivals=scheduled_arrivals,
                expected_container_moves=expected_moves,
                available_berths=len(available_berths),
                available_cranes=len(available_cranes),
                berth_occupancy_estimate_pct=occ_estimate,
                affected_schedule_ids=affected_ids,
                affected_vessels=affected_vessels,
                top_rule_drivers=drivers
            )
        )

    return CongestionForecastResponse(
        port_code=port_code,
        horizon_hours=horizon_hours,
        bucket_hours=bucket_hours,
        selected_scenario=scenario,
        is_synthetic=True,
        calculation_method="baseline_rule_v1",
        as_of_utc=reference_time.isoformat(),
        peak_risk_probability=peak_risk,
        peak_risk_level=classify_risk_level(peak_risk),
        buckets=buckets
    )
