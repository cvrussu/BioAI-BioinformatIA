"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central settings object — values come from .env or real env vars."""

    # --- Groq (primary AI provider) ---
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # --- Anthropic / Claude (fallback) ---
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # --- CORS ---
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # --- External services ---
    esmfold_api_url: str = "https://api.esmatlas.com/foldSequence/v1/pdb/"
    alphafold_api_url: str = "https://alphafold.ebi.ac.uk/api/prediction"

    # --- App ---
    log_level: str = "info"
    max_sequence_length_esmfold: int = 400

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
