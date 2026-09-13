"""FastAPI endpoints for synthetic operational scenarios."""
from fastapi import APIRouter
from backend.app.schemas.dashboard import ScenariosListResponse
from backend.app.services.dashboard import DashboardService

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get(
    "",
    response_model=ScenariosListResponse,
    summary="Get available synthetic scenarios"
)
def get_scenarios() -> ScenariosListResponse:
    """Returns the list of configured synthetic operational scenarios for the terminal."""
    return DashboardService.get_scenarios()
