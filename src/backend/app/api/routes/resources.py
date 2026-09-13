"""FastAPI endpoints for terminal berths and cranes resources."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.dependencies import get_db
from backend.app.schemas.dashboard import BerthsResponse, CranesResponse
from backend.app.services.dashboard import DashboardService

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get(
    "/berths",
    response_model=BerthsResponse,
    summary="Get berth capacities and status"
)
def get_berths(
    port_code: str = Query(default="PFA", description="Port identifier code"),
    scenario: str = Query(default="baseline", description="Operational scenario key"),
    db: Optional[Session] = Depends(get_db),
) -> BerthsResponse:
    """Returns terminal berths, physical limits, and operational availability status."""
    return DashboardService.get_berths(
        port_code=port_code,
        scenario=scenario,
        db=db,
    )


@router.get(
    "/cranes",
    response_model=CranesResponse,
    summary="Get quay cranes and operational throughput"
)
def get_cranes(
    port_code: str = Query(default="PFA", description="Port identifier code"),
    scenario: str = Query(default="baseline", description="Operational scenario key"),
    db: Optional[Session] = Depends(get_db),
) -> CranesResponse:
    """Returns quay cranes, handling productivities, and status."""
    return DashboardService.get_cranes(
        port_code=port_code,
        scenario=scenario,
        db=db,
    )
