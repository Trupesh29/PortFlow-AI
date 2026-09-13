"""ML inference service for PortFlow AI prediction endpoints.

Provides:
  - WaitingTimeService.predict(schedule_id, db) → WaitingTimePredictionResponse
  - CongestionMLService.predict(request, db)    → CongestionPredictionResponse

Both methods:
  1. Load the ML model via ModelRegistry (raises 503 if artifacts missing).
  2. Retrieve schedule/vessel/terminal context from DB or synthetic fallback.
  3. Engineer features via ml.features.
  4. Run model.predict / predict_proba.
  5. Build human-readable explanation factors.
  6. Return a fully-typed response schema.
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

# Ensure src/ directory is importable
SRC_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from database.models import Berth, Crane, Port, Vessel, VesselSchedule
from data.generate_synthetic import generate_dataset
from ml.inference import ModelRegistry, ModelUnavailableError
from ml.features import (
    FEATURE_NAMES,
    build_inference_feature_vector,
    CONGESTION_THRESHOLD_MINUTES,
)
from backend.app.schemas.predictions import (
    CongestionPredictionRequest,
    CongestionPredictionResponse,
    CongestionSlot,
    ExplanationFactor,
    WaitingTimePredictionResponse,
)


def _classify_risk(prob: float) -> str:
    if prob >= 0.90:
        return "CRITICAL"
    if prob >= 0.70:
        return "HIGH"
    if prob >= 0.40:
        return "MEDIUM"
    return "LOW"


def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def _synthetic_context(scenario: str = "baseline") -> Dict[str, Any]:
    """Return the baseline synthetic dataset as a context dict."""
    raw = generate_dataset(seed=2026, scenario=scenario)
    vessels_by_imo = {v["imo_number"]: v for v in raw["vessels"]}
    return {
        "port": raw["ports"][0],
        "berths": raw["berths"],
        "cranes": raw["cranes"],
        "vessels_by_imo": vessels_by_imo,
        "schedules": raw["vessel_schedules"],
    }


def _build_explanation_factors(
    feat: Dict[str, float],
    waiting_minutes: float,
    model_type: str = "regression",
) -> List[ExplanationFactor]:
    """Generate human-readable explanation factors from the feature dict.

    This is a rule-based post-hoc explanation (not SHAP) that is honest about
    being a heuristic overlay on the trained model output.
    """
    factors: List[ExplanationFactor] = []

    # Draft / berth compatibility
    compat_ratio = feat.get("compatible_ratio", 1.0)
    if compat_ratio < 0.5:
        contrib = round(0.25 + (0.5 - compat_ratio) * 0.5, 2)
        n_compat = int(feat.get("compatible_berths", 0))
        n_avail = int(feat.get("available_berths", 1))
        factors.append(ExplanationFactor(
            factor="berth_draft_mismatch",
            contribution=min(contrib, 0.60),
            description=(
                f"Only {n_compat} of {n_avail} available berths can accommodate "
                f"vessel draft of {feat['vessel_draft_m']:.1f} m and length "
                f"{feat['vessel_length_m']:.0f} m."
            )
        ))

    # Arrival cluster pressure
    concurrent = int(feat.get("concurrent_arrivals_6h", 0))
    if concurrent >= 2:
        contrib = round(min(0.45, concurrent * 0.12), 2)
        factors.append(ExplanationFactor(
            factor="arrival_cluster",
            contribution=contrib,
            description=(
                f"{concurrent} vessel(s) expected within ±3 h of this ETA, "
                "creating berth contention."
            )
        ))

    # High workload
    workload = feat.get("workload_pressure", 0.0)
    if workload > 0.70:
        contrib = round(min(0.40, workload * 0.35), 2)
        factors.append(ExplanationFactor(
            factor="high_container_workload",
            contribution=contrib,
            description=(
                f"Expected container moves utilise {int(workload * 100)}% of "
                "available 6-hour crane throughput capacity."
            )
        ))

    # Priority
    priority = int(feat.get("priority", 3))
    if priority >= 4:
        factors.append(ExplanationFactor(
            factor="low_priority",
            contribution=0.10,
            description=(
                f"Schedule priority {priority}/5 (lower = higher urgency). "
                "Low-priority vessels are displaced when berth contention arises."
            )
        ))

    # Capacity factor
    if feat.get("vessel_capacity_teu", 2000) > 4000:
        factors.append(ExplanationFactor(
            factor="large_vessel",
            contribution=0.08,
            description=(
                f"Large vessel ({int(feat['vessel_capacity_teu'])} TEU) requires "
                "extended berth slot, increasing queue cascade risk."
            )
        ))

    if not factors:
        factors.append(ExplanationFactor(
            factor="nominal_conditions",
            contribution=0.05,
            description="Arrival density and resource availability are within normal operating limits.",
        ))

    return factors


# ── Waiting-Time Service ──────────────────────────────────────────────────────

class WaitingTimeService:
    """Predicts vessel waiting time before berth assignment."""

    @staticmethod
    def predict(
        schedule_id: str,
        db: Optional[Session] = None,
    ) -> WaitingTimePredictionResponse:
        """Run waiting-time regression for the given schedule.

        Raises:
            HTTPException 503: If model artifact is missing.
            HTTPException 404: If schedule_id is not found.
        """
        # ── 1. Load model (503 if missing) ────────────────────────
        try:
            model = ModelRegistry.waiting_time_model()
        except ModelUnavailableError as exc:
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "model_unavailable",
                    "model": "waiting_time_v1",
                    "message": str(exc),
                }
            )

        # ── 2. Resolve schedule context ───────────────────────────
        ctx = _synthetic_context("baseline")
        schedule_dict: Optional[Dict[str, Any]] = None
        vessel_dict: Dict[str, Any] = {}
        port_id_str = "a1b2c3d4-0000-0000-0000-000000000001"
        vessel_id_str = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        eta_str = datetime.now(timezone.utc).isoformat()

        # Try DB first
        if db is not None:
            try:
                from uuid import UUID
                uid = UUID(schedule_id)
                db_sched = db.scalar(
                    select(VesselSchedule).where(VesselSchedule.id == uid)
                )
                if db_sched:
                    v = db_sched.vessel
                    port_id_str = str(db_sched.port_id)
                    vessel_id_str = str(db_sched.vessel_id)
                    eta_str = db_sched.eta.isoformat()
                    schedule_dict = {
                        "eta": db_sched.eta.isoformat(),
                        "expected_containers": db_sched.expected_containers,
                        "priority": db_sched.priority,
                        "vessel_imo": v.imo_number if v else "",
                    }
                    vessel_dict = {
                        "draft_m": float(v.draft_m) if v else 11.0,
                        "length_m": float(v.length_m) if v else 250.0,
                        "beam_m": float(v.beam_m) if v else 32.0,
                        "capacity_teu": v.capacity_teu if v else 2000,
                    }
            except Exception:
                pass

        # Fallback: look for synthetic schedule_id pattern "sched-syn-baseline-NNN"
        if schedule_dict is None:
            schedules = ctx["schedules"]
            vessels_by_imo = ctx["vessels_by_imo"]

            # Only try index extraction for known synthetic ID format
            if schedule_id.startswith("sched-"):
                try:
                    idx = int(schedule_id.rsplit("-", 1)[-1])
                    if 0 <= idx < len(schedules):
                        s = schedules[idx]
                        schedule_dict = s
                        vessel_dict = vessels_by_imo.get(s.get("vessel_imo", ""), {})
                        eta_str = s.get("eta", eta_str)
                except (ValueError, IndexError):
                    pass

            if schedule_dict is None:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "not_found",
                        "message": f"Schedule '{schedule_id}' not found. "
                                   "Use a valid UUID from GET /api/v1/schedules.",
                    }
                )

        # ── 3. Feature engineering ────────────────────────────────
        X = build_inference_feature_vector(
            schedule=schedule_dict,
            vessel=vessel_dict,
            all_schedules=ctx["schedules"],
            berths=ctx["berths"],
            cranes=ctx["cranes"],
        )

        # ── 4. Inference ──────────────────────────────────────────
        import numpy as np
        pred_minutes = float(np.clip(model.predict(X)[0], 0, None))
        pred_hours = round(pred_minutes / 60.0, 2)

        # Confidence: heuristic based on relative prediction scale
        # (genuine uncertainty quantification requires a calibrated ensemble)
        relative_uncertainty = 0.35  # ±35% interval, disclosed as synthetic
        confidence = round(max(0.50, 1.0 - (pred_minutes / max(1, pred_minutes + 60)) * 0.4), 2)
        lower = round(max(0.0, pred_hours * (1 - relative_uncertainty)), 2)
        upper = round(pred_hours * (1 + relative_uncertainty), 2)

        # ── 5. Explanation factors ────────────────────────────────
        from ml.features import build_features
        feat_dict = build_features(
            schedule=schedule_dict,
            vessel=vessel_dict,
            all_schedules=ctx["schedules"],
            berths=ctx["berths"],
            cranes=ctx["cranes"],
        )
        factors = _build_explanation_factors(feat_dict, pred_minutes)

        meta = ModelRegistry.meta()
        model_version = meta.get("waiting_time_model", {}).get("version", "waiting_time_v1")

        return WaitingTimePredictionResponse(
            schedule_id=schedule_id,
            vessel_id=vessel_id_str,
            port_id=port_id_str,
            eta_utc=eta_str,
            predicted_waiting_time_hours=pred_hours,
            prediction_lower_bound_hours=lower,
            prediction_upper_bound_hours=upper,
            confidence=confidence,
            model_version=model_version,
            data_source="synthetic",
            generated_at_utc=_now_utc(),
            explanation_factors=factors,
        )


# ── Congestion ML Service ─────────────────────────────────────────────────────

class CongestionMLService:
    """Predicts congestion probability per time slot using the trained classifier."""

    @staticmethod
    def predict(
        request: CongestionPredictionRequest,
        db: Optional[Session] = None,
    ) -> CongestionPredictionResponse:
        """Run congestion classification for each slot in the requested window.

        Raises:
            HTTPException 503: Model artifact missing.
            HTTPException 422: Window exceeds 72 hours.
        """
        # ── 1. Load model ─────────────────────────────────────────
        try:
            model = ModelRegistry.congestion_model()
        except ModelUnavailableError as exc:
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "model_unavailable",
                    "model": "congestion_v1",
                    "message": str(exc),
                }
            )

        # ── 2. Parse and validate time window ─────────────────────
        try:
            window_start = datetime.fromisoformat(
                request.window_start_utc.replace("Z", "+00:00")
            )
            window_end = datetime.fromisoformat(
                request.window_end_utc.replace("Z", "+00:00")
            )
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail={"error": "invalid_datetime", "message": "window_start_utc / window_end_utc must be ISO 8601 UTC."},
            )

        duration_hours = (window_end - window_start).total_seconds() / 3600
        if duration_hours <= 0 or duration_hours > 72:
            raise HTTPException(
                status_code=422,
                detail={"error": "window_too_large", "message": "window must be between 1 and 72 hours."},
            )

        slot_minutes = request.slot_duration_minutes
        slot_delta = timedelta(minutes=slot_minutes)

        # ── 3. Load terminal context ──────────────────────────────
        ctx = _synthetic_context("baseline")
        berths = ctx["berths"]
        cranes = ctx["cranes"]
        schedules = ctx["schedules"]
        vessels_by_imo = ctx["vessels_by_imo"]
        port_id_str = request.port_id  # pass through as-is

        # ── 4. For each slot, find arriving vessels and predict ────
        import numpy as np
        slots: List[CongestionSlot] = []
        current = window_start

        while current < window_end:
            slot_end = min(current + slot_delta, window_end)

            # Schedules with ETA in this slot
            arriving = []
            for s in schedules:
                try:
                    eta_dt = datetime.fromisoformat(s["eta"])
                    if eta_dt.tzinfo is None:
                        eta_dt = eta_dt.replace(tzinfo=timezone.utc)
                    if current <= eta_dt < slot_end:
                        arriving.append(s)
                except Exception:
                    continue

            if arriving:
                # Average feature vector for vessels arriving in this slot
                X_rows = []
                for s in arriving:
                    imo = s.get("vessel_imo", "")
                    vessel = vessels_by_imo.get(imo, {})
                    x = build_inference_feature_vector(
                        schedule=s,
                        vessel=vessel,
                        all_schedules=schedules,
                        berths=berths,
                        cranes=cranes,
                    )
                    X_rows.append(x[0])
                X_slot = np.array(X_rows)
                probs = model.predict_proba(X_slot)[:, 1]
                cong_prob = float(np.clip(probs.mean(), 0.0, 1.0))
            else:
                cong_prob = 0.0

            # Berth occupancy estimate
            n_berths = max(1, len([b for b in berths if b.get("status") == "available"]))
            occ_pct = round(min(100.0, (len(arriving) / n_berths) * 100.0), 1)

            slots.append(CongestionSlot(
                slot_start_utc=current.isoformat(),
                slot_end_utc=slot_end.isoformat(),
                congestion_probability=round(cong_prob, 4),
                congestion_level=_classify_risk(cong_prob),
                predicted_berth_occupancy_pct=occ_pct,
                vessel_count_expected=len(arriving),
                contributing_vessel_ids=[
                    s.get("schedule_id", f"sched-{i}") for i, s in enumerate(arriving)
                ],
            ))
            current = slot_end

        meta = ModelRegistry.meta()
        model_version = meta.get("congestion_model", {}).get("version", "congestion_v1")

        return CongestionPredictionResponse(
            port_id=port_id_str,
            generated_at_utc=_now_utc(),
            model_version=model_version,
            data_source="synthetic",
            slots=slots,
        )
