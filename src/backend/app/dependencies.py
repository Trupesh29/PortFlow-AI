"""Common dependency providers for FastAPI routes."""
from backend.app.core.config import Settings, settings


def get_settings() -> Settings:
    """Provides application settings dependency."""
    return settings
