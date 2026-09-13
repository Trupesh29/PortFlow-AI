"""FastAPI endpoints for operational dashboard summary and congestion forecast."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.dependencies import get_db
from backend.app.schemas.dashboard import CongestionForecastResponse, DashboardSummaryResponse
from backend.app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    summary="Get operational dashboard summary KPIs"
)
def get_dashboard_summary(
    port_code: str = Query(default="PFA", description="Port identifier code"),
    horizon_hours: int = Query(default=72, ge=6, le=168, description="Forecasting horizon in hours"),
    scenario: str = Query(default="baseline", description="Operational scenario key"),
    db: Optional[Session] = Depends(get_db),
) -> DashboardSummaryResponse:
    """Returns real-time and forecasted operational metrics for the terminal dashboard."""
    return DashboardService.get_dashboard_summary(
        port_code=port_code,
        horizon_hours=horizon_hours,
        scenario=scenario,
        db=db,
    )


@router.get(
    "/congestion",
    response_model=CongestionForecastResponse,
    summary="Get 6-hour bucket baseline congestion forecast"
)
def get_dashboard_congestion(
    port_code: str = Query(default="PFA", description="Port identifier code"),
    horizon_hours: int = Query(default=72, ge=6, le=168, description="Forecasting horizon in hours"),
    scenario: str = Query(default="baseline", description="Operational scenario key"),
    db: Optional[Session] = Depends(get_db),
) -> CongestionForecastResponse:
    """Returns the deterministic six-hour bucket congestion forecast calculated via baseline_rule_v1."""
    return DashboardService.get_congestion_forecast(
        port_code=port_code,
        horizon_hours=horizon_hours,
        scenario=scenario,
        db=db,
    )
