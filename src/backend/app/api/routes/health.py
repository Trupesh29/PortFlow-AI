from fastapi import APIRouter, status
from backend.app.core.config import settings
from backend.app.schemas.common import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Returns the health status, service name, and version of the API."
)
async def get_health() -> HealthResponse:
    """Service liveness probe returning healthy status."""
    return HealthResponse(
        status="healthy",
        service=settings.SERVICE_NAME,
        version=settings.VERSION
    )
