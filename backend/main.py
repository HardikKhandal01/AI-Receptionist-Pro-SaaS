from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.chat_routes import router as chat_router
from backend.api.admin_routes import router as admin_router # NAYA IMPORT

# Database imports
from backend.database import engine, Base
from backend.models import lead

# Automatically create tables in SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Receptionist Pro SaaS",
    description="Universal AI Receptionist Platform with Auto Lead Capture",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes ko mount karna
app.include_router(chat_router, prefix="/api")
app.include_router(admin_router, prefix="/api/admin") # NAYA ROUTE ADD KIYA

@app.get("/")
async def health_check():
    return {
        "status": "online", 
        "message": "AI Receptionist Pro Database & Backend Engine running."
    }