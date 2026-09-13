"""ModelRegistry — lazy singleton loader for trained PortFlow AI models.

Design principles:
- Models are loaded ONCE on first access and cached in module-level singletons.
- If artifact files are missing the registry raises ModelUnavailableError
  (caught by the service layer and surfaced as HTTP 503).
- No DB dependency.  This module only touches the filesystem.
- Thread-safe: Python's GIL + module-level once-loading is safe for uvicorn
  with a single worker process (the default dev mode).

Artifacts expected at:
  src/ml/artifacts/waiting_time_v1.joblib
  src/ml/artifacts/congestion_v1.joblib
  src/ml/artifacts/model_meta.json
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

import joblib
import numpy as np

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
WAITING_TIME_PATH = ARTIFACTS_DIR / "waiting_time_v1.joblib"
CONGESTION_PATH = ARTIFACTS_DIR / "congestion_v1.joblib"
META_PATH = ARTIFACTS_DIR / "model_meta.json"


class ModelUnavailableError(RuntimeError):
    """Raised when a model artifact is missing or cannot be loaded."""

    def __init__(self, model_name: str, path: Path):
        super().__init__(
            f"Model '{model_name}' artifact not found at {path}. "
            "Run `python -m ml.train` from the src/ directory to train and persist models."
        )
        self.model_name = model_name
        self.artifact_path = path


class ModelRegistry:
    """Singleton holding loaded scikit-learn pipelines."""

    _waiting_time_model: Optional[Any] = None
    _congestion_model: Optional[Any] = None
    _meta: Optional[dict] = None
    _loaded: bool = False

    # ── Public loaders ────────────────────────────────────────────

    @classmethod
    def waiting_time_model(cls) -> Any:
        """Return the trained waiting-time regression pipeline.

        Raises:
            ModelUnavailableError: if artifact is missing.
        """
        if cls._waiting_time_model is None:
            cls._waiting_time_model = cls._load(WAITING_TIME_PATH, "waiting_time_v1")
        return cls._waiting_time_model

    @classmethod
    def congestion_model(cls) -> Any:
        """Return the trained congestion classification pipeline.

        Raises:
            ModelUnavailableError: if artifact is missing.
        """
        if cls._congestion_model is None:
            cls._congestion_model = cls._load(CONGESTION_PATH, "congestion_v1")
        return cls._congestion_model

    @classmethod
    def meta(cls) -> dict:
        """Return model metadata dict (from model_meta.json)."""
        if cls._meta is None:
            if META_PATH.exists():
                cls._meta = json.loads(META_PATH.read_text(encoding="utf-8"))
            else:
                cls._meta = {}
        return cls._meta

    @classmethod
    def are_models_available(cls) -> bool:
        """Return True only if both artifact files exist on disk."""
        return WAITING_TIME_PATH.exists() and CONGESTION_PATH.exists()

    @classmethod
    def reset(cls) -> None:
        """Clear cached models (used in tests)."""
        cls._waiting_time_model = None
        cls._congestion_model = None
        cls._meta = None

    # ── Internal ──────────────────────────────────────────────────

    @staticmethod
    def _load(path: Path, name: str) -> Any:
        if not path.exists():
            raise ModelUnavailableError(name, path)
        try:
            model = joblib.load(path)
        except Exception as exc:
            raise ModelUnavailableError(name, path) from exc
        return model


# Convenience module-level accessors
def get_waiting_time_model() -> Any:
    return ModelRegistry.waiting_time_model()


def get_congestion_model() -> Any:
    return ModelRegistry.congestion_model()


def models_available() -> bool:
    return ModelRegistry.are_models_available()
