"""FastAPI endpoints for vessel schedules."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.dependencies import get_db
from backend.app.schemas.dashboard import SchedulesListResponse
from backend.app.services.dashboard import DashboardService

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.get(
    "",
    response_model=SchedulesListResponse,
    summary="Get vessel schedules with compatibility and baseline impact"
)
def get_schedules(
    port_code: str = Query(default="PFA", description="Port identifier code"),
    scenario: str = Query(default="baseline", description="Operational scenario key"),
    start_time: Optional[datetime] = Query(default=None, description="Start filter timestamp (ISO 8601 UTC)"),
    end_time: Optional[datetime] = Query(default=None, description="End filter timestamp (ISO 8601 UTC)"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=50, ge=1, le=100, description="Results per page"),
    db: Optional[Session] = Depends(get_db),
) -> SchedulesListResponse:
    """Returns scheduled vessel arrivals with physical berth compatibility and baseline congestion impact."""
    return DashboardService.get_schedules(
        port_code=port_code,
        scenario=scenario,
        start_time=start_time,
        end_time=end_time,
        page=page,
        page_size=page_size,
        db=db,
    )
