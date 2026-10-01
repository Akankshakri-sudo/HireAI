from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Comma-separated list of allowed CORS origins. Falls back to the local
    # Vite dev server when unset.
    CORS_ORIGINS: str = ""
    MAX_UPLOAD_SIZE_MB: int = 5

    # Gemini LLM (optional). When GEMINI_API_KEY is empty the app falls back
    # to the built-in heuristic scoring / template question generation.
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    AI_TIMEOUT_SECONDS: float = 60.0

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str):
            value = value.strip().lower()
            if value in {"release", "prod", "production"}:
                return False
            if value in {"dev", "development"}:
                return True
        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
