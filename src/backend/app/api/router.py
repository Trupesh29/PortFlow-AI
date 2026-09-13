from fastapi import APIRouter
from backend.app.api.routes import dashboard, health, predictions, resources, schedules, scenarios

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(dashboard.router)
api_router.include_router(schedules.router)
api_router.include_router(resources.router)
api_router.include_router(scenarios.router)
api_router.include_router(predictions.router)
