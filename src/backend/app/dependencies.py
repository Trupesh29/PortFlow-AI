"""Common dependency providers for FastAPI routes."""
import socket
from collections.abc import Generator
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.core.config import Settings, settings
from database.session import SessionLocal

_db_checked: bool = False
_db_online: bool = False


def is_postgres_online(host: str = "localhost", port: int = 5432, timeout: float = 0.5) -> bool:
    """Quickly tests if the PostgreSQL port is reachable before attempting pooling."""
    global _db_checked, _db_online
    if _db_checked:
        return _db_online
    try:
        with socket.create_connection((host, port), timeout=timeout):
            _db_online = True
    except (OSError, TimeoutError):
        _db_online = False
    _db_checked = True
    return _db_online


def get_settings() -> Settings:
    """Provides application settings dependency."""
    return settings


def get_db() -> Generator[Optional[Session], None, None]:
    """Provides database session dependency with instant fallback when PostgreSQL is offline."""
    if not is_postgres_online():
        yield None
        return

    db = None
    try:
        db = SessionLocal()
        yield db
    except Exception:
        yield None
    finally:
        if db is not None:
            try:
                db.close()
            except Exception:
                pass
