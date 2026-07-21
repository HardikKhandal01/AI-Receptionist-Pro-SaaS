from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    business_profile = Column(String, index=True) # Ye batayega ki lead Hotel ki hai ya Travel Agency ki
    name = Column(String)
    phone = Column(String)
    purpose = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)