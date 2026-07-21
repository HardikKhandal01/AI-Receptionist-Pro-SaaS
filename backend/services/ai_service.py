import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv

from backend.services.profile_manager import load_profile
from backend.database import SessionLocal
from backend.models.lead import Lead

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

chat_sessions = {}

def generate_system_prompt(profile: dict) -> str:
    return f"""
    You are the elite AI Receptionist for '{profile['business_name']}'.
    Your tone must be {profile['tone']}.
    
    Business Details:
    - Type: {profile['business_type']}
    - Location: {profile['location']}
    - Contact: {profile['contact_phone']}, {profile['contact_email']}
    
    Services/Inventory:
    {profile['services']}
    
    Policies:
    {profile['policies']}
    
    CRITICAL INSTRUCTIONS:
    1. Answer ONLY using the provided knowledge base. Keep answers short and conversational.
    2. Ask the user for their Name and Phone Number to assist them better or book an appointment.
    3. 🔴 STRICT LEAD CAPTURE RULE 🔴: 
       - You MUST NOT output the LEAD block unless the user has explicitly provided BOTH their real Name AND real Phone Number.
       - NEVER use placeholders, and NEVER generate this block prematurely.
       - ONLY when you have both details, append this JSON block at the very end of your response:
         ||LEAD: {{"name": "User's Name", "phone": "User's Phone", "purpose": "Reason for inquiry"}}||
       - Do not explain this code to the user. Just say "Thank you, I have saved your details..." and append the block.
    """

def save_lead_to_db(lead_data: dict, profile_name: str):
    """Saves intercepted lead data to SQLite Database."""
    db = SessionLocal()
    try:
        new_lead = Lead(
            business_profile=profile_name,
            name=lead_data.get("name", "Unknown"),
            phone=lead_data.get("phone", "Unknown"),
            purpose=lead_data.get("purpose", "General Inquiry")
        )
        db.add(new_lead)
        db.commit()
        print(f"✅ Lead Successfully Saved in DB: {lead_data['name']}")
    except Exception as e:
        print(f"❌ DB Save Error: {e}")
    finally:
        db.close()

def get_chat_response(message: str, profile_name: str, session_id: str = "default_user") -> str:
    """Generates response and intercepts hidden lead data."""
    try:
        profile = load_profile(profile_name)
        
        if session_id not in chat_sessions:
            sys_prompt = generate_system_prompt(profile)
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=sys_prompt
            )
            chat_sessions[session_id] = model.start_chat(history=[])
        
        chat = chat_sessions[session_id]
        response = chat.send_message(message)
        reply = response.text.strip()

        # Intercept the Secret Lead Tag from AI
        lead_match = re.search(r'\|\|LEAD:\s*(\{.*?\})\s*\|\|', reply)
        if lead_match:
            try:
                lead_json_str = lead_match.group(1)
                lead_data = json.loads(lead_json_str)
                # Save to Database
                save_lead_to_db(lead_data, profile_name)
                # Remove the secret tag so the user doesn't see it on the website
                reply = re.sub(r'\|\|LEAD:\s*\{.*?\}\s*\|\|', '', reply).strip()
            except Exception as e:
                print("JSON Parsing Error from AI:", e)
        
        return reply

    except Exception as e:
        print(f"AI Service Error: {e}")
        return "I apologize, my cognitive link is refreshing. Please try again."