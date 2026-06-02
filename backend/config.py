from pathlib import Path
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
    PUBLIC_CTA_ORG_ID: str = "00000000-0000-0000-0000-000000000000"
    LEGACY_SINGLE_TENANT_ORG_ID: Optional[str] = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
    ALLOW_LEGACY_ORG_FALLBACK: bool = False
    APP_BASE_URL: str = "http://localhost:3000"
    
    # AI Runtime Settings
    AI_RUNTIME_PROFILE: str = "groq-cloudflare"

    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL_PRIMARY: str = "openai/gpt-oss-20b"
    GROQ_MODEL_FALLBACK: str = "llama-3.3-70b-versatile"
    GROQ_MODEL_FAST: str = "llama-3.1-8b-instant"
    GROQ_MODEL_NO_EVIDENCE: str = "llama-3.1-8b-instant"
    GROQ_MODEL_GUARD: str = "llama-3.1-8b-instant"

    CLOUDFLARE_ACCOUNT_ID: Optional[str] = None
    CLOUDFLARE_API_TOKEN: Optional[str] = None
    CLOUDFLARE_AI_BASE_URL: Optional[str] = None
    CLOUDFLARE_MODEL_PRIMARY: str = "@cf/openai/gpt-oss-20b"
    CLOUDFLARE_MODEL_FALLBACK: str = "@cf/meta/llama-3.1-8b-instruct"
    CLOUDFLARE_MODEL_FAST: str = "@cf/meta/llama-3.1-8b-instruct"
    CLOUDFLARE_MODEL_NO_EVIDENCE: str = "@cf/meta/llama-3.1-8b-instruct"
    CLOUDFLARE_MODEL_GUARD: str = "@cf/meta/llama-3.1-8b-instruct"
    CLOUDFLARE_EMBED_MODEL: str = "@cf/baai/bge-small-en-v1.5"

    INTERNAL_AUDIT_SECRET: Optional[str] = None

    # Native email transport (BL-next-03)
    RESEND_API_KEY: Optional[str] = None
    RESEND_FROM: Optional[str] = None
    RESEND_REPLY_TO: Optional[str] = None
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: str = "Anclora Nexus"
    SMTP_REPLY_TO: Optional[str] = None
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    RECAPTCHA_SECRET_KEY: Optional[str] = None
    RECAPTCHA_VERIFY_URL: str = "https://www.google.com/recaptcha/api/siteverify"
    
    TURNSTILE_SECRET_KEY: Optional[str] = None
    TURNSTILE_VERIFY_URL: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    
    N8N_WEBHOOK_URL: Optional[str] = None
    N8N_API_KEY: Optional[str] = None

    # SyncXML Pilot Settings
    SYNCXML_ADMIN_PASSWORD: Optional[str] = None
    SYNCXML_APP_URL: str = "https://anclora-syncxml.vercel.app"
    SYNCXML_LOGIN_URL: str = "https://anclora-syncxml.vercel.app/login"
    SYNCXML_WEBHOOK_SECRET: Optional[str] = None
    SYNCXML_INTERNAL_API_URL: str = "https://anclora-syncxml.vercel.app/api/internal/pilot-users"
    SYNCXML_INTERNAL_API_SECRET: Optional[str] = None
    ADMIN_EMAIL: str = "toni@anclora.com"
    ADMIN_EMAILS: str = "antonio@anclora.com"
    NEXUS_INTERNAL_API_KEY: Optional[str] = None

    # Hermes Worker Settings
    HERMES_WORKER_URL: str = "http://localhost:8787"
    HERMES_WORKER_API_KEY: Optional[str] = None

    # Legacy compatibility - deprecated
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    CRON_SECRET: Optional[str] = None
    
    # LangGraph Settings
    MAX_ITERATIONS: int = 10
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        extra="ignore"
    )

settings = Settings()
