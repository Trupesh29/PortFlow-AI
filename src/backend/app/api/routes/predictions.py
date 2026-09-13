"""FastAPI routes for ML-based prediction endpoints.

Implements:
  POST /api/v1/predictions/waiting-time  — §8 of API_CONTRACT.md
  POST /api/v1/predictions/congestion    — §7 of API_CONTRACT.md
"""
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.schemas.predictions import (
    CongestionPredictionRequest,
    CongestionPredictionResponse,
    WaitingTimePredictionRequest,
    WaitingTimePredictionResponse,
)
from backend.app.services.ml_service import CongestionMLService, WaitingTimeService

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post(
    "/waiting-time",
    response_model=WaitingTimePredictionResponse,
    summary="Predict vessel waiting time before berth assignment",
    responses={
        404: {"description": "schedule_id not found"},
        503: {"description": "ML model artifact not loaded — run `python -m ml.train` first"},
    },
)
def predict_waiting_time(
    body: WaitingTimePredictionRequest,
    db: Optional[Session] = Depends(get_db),
) -> WaitingTimePredictionResponse:
    """Predicts waiting time in hours for a given vessel schedule before a berth is assigned.

    Uses the trained `GradientBoostingRegressor` (waiting_time_v1). Returns
    503 with `error: model_unavailable` if artifacts have not been generated
    (run `python -m ml.train` from `src/`).
    """
    return WaitingTimeService.predict(schedule_id=body.schedule_id, db=db)


@router.post(
    "/congestion",
    response_model=CongestionPredictionResponse,
    summary="Predict congestion probability per time slot",
    responses={
        422: {"description": "Invalid window parameters (max 72 hours)"},
        503: {"description": "ML model artifact not loaded — run `python -m ml.train` first"},
    },
)
def predict_congestion(
    body: CongestionPredictionRequest,
    db: Optional[Session] = Depends(get_db),
) -> CongestionPredictionResponse:
    """Predicts congestion probability and level for each time slot in the requested window.

    Uses the trained `GradientBoostingClassifier` (congestion_v1). Returns
    503 with `error: model_unavailable` if artifacts have not been generated.
    """
    return CongestionMLService.predict(request=body, db=db)
