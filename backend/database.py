from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Ye file automatically ek 'receptionist.db' naam ka database banayegi
SQLALCHEMY_DATABASE_URL = "sqlite:///./receptionist.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()