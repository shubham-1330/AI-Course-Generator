from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Course Generator API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "course_generator_db"
    GEMINI_API_KEY: str = ""
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
