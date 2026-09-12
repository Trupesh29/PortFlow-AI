from datetime import datetime, timezone
import uuid
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from backend.app.schemas.common import ErrorDetail, ErrorPayload, ErrorResponse


class AppError(Exception):
    """Base application exception with error code and status."""
    def __init__(
        self,
        message: str,
        code: str = "BAD_REQUEST",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: list = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []


def register_error_handlers(app: FastAPI) -> None:
    """Registers standardized error handlers matching API_CONTRACT.md."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        payload = ErrorPayload(
            code=exc.code,
            message=exc.message,
            details=[ErrorDetail(issue=d) if isinstance(d, str) else d for d in exc.details],
            request_id=req_id,
            timestamp_utc=datetime.now(timezone.utc).isoformat()
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(error=payload).model_dump()
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        details = []
        for err in exc.errors():
            loc = " -> ".join(str(item) for item in err.get("loc", []))
            details.append(ErrorDetail(field=loc, issue=err.get("msg", "Invalid value")))

        payload = ErrorPayload(
            code="VALIDATION_ERROR",
            message="Request validation failed.",
            details=details,
            request_id=req_id,
            timestamp_utc=datetime.now(timezone.utc).isoformat()
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ErrorResponse(error=payload).model_dump()
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        payload = ErrorPayload(
            code="INTERNAL_ERROR",
            message="An unexpected server error occurred.",
            details=[],
            request_id=req_id,
            timestamp_utc=datetime.now(timezone.utc).isoformat()
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(error=payload).model_dump()
        )
