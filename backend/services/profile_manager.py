import json
import os

def load_profile(profile_name: str) -> dict:
    """Loads the business profile JSON from the profiles directory."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    profile_path = os.path.join(base_dir, "profiles", f"{profile_name}.json")
    
    try:
        with open(profile_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise ValueError(f"Profile '{profile_name}' not found. Please check configuration.")