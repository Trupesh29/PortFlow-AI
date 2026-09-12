from typing import List, Union
import json
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime settings loaded from environment."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "PortFlow AI API"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    VERSION: str = "0.1.0"
    SERVICE_NAME: str = "portflow-api"

    DATABASE_URL: str = "postgresql+psycopg://portflow:portflow@localhost:5432/portflow"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173"]
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
