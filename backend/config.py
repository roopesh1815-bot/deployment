import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///users.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://127.0.0.1:5500")

    @classmethod
    def validate(cls):
        if not cls.SECRET_KEY:
            raise RuntimeError("SECRET_KEY must be configured in the environment or .env file.")
        if not cls.JWT_SECRET_KEY:
            raise RuntimeError("JWT_SECRET_KEY must be configured in the environment or .env file.")
        if cls.JWT_EXPIRES_MINUTES < 1:
            raise RuntimeError("JWT_EXPIRES_MINUTES must be at least 1.")
