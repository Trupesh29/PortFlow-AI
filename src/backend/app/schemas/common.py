from datetime import datetime, timezone
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check endpoint response schema."""
    status: str = Field(default="healthy", description="Service health status")
    service: str = Field(default="portflow-api", description="Service identifier")
    version: str = Field(default="0.1.0", description="Application version")


class ErrorDetail(BaseModel):
    """Validation or business rule error detail item."""
    field: Optional[str] = None
    issue: str


class ErrorPayload(BaseModel):
    """Standardized API error envelope payload."""
    code: str
    message: str
    details: List[ErrorDetail] = Field(default_factory=list)
    request_id: Optional[str] = None
    timestamp_utc: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class ErrorResponse(BaseModel):
    """Standard top-level error response model."""
    error: ErrorPayload


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int = 1
    page_size: int = 20
    total_items: int = 0
    total_pages: int = 0


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic envelope for paginated collection responses."""
    data: List[T] = Field(default_factory=list)
    pagination: PaginationMeta
