from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Anclora Nexus"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    
    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # LLM Provider Settings
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str
    
    # LangGraph Settings
    MAX_ITERATIONS: int = 10
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
