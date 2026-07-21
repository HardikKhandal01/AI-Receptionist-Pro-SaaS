from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.ai_service import get_chat_response
from backend.services.profile_manager import load_profile

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    profile_name: str = "hotel"
    session_id: str = "web_user_1" # Added for memory tracking

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    reply = get_chat_response(request.message, request.profile_name, request.session_id)
    return ChatResponse(reply=reply)

@router.get("/profile/{profile_name}")
async def get_profile(profile_name: str):
    try:
        profile = load_profile(profile_name)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))