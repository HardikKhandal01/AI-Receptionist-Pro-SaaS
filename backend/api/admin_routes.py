from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.lead import Lead

router = APIRouter()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/leads")
async def get_all_leads(db: Session = Depends(get_db)):
    """Fetches all captured leads from the database, newest first."""
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return leads