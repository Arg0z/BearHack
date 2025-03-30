import google.generativeai as genai
import os
from pathlib import Path
import json
import re
from dotenv import load_dotenv

load_dotenv(Path("Credentials.env"))

# Use a valid model name. "gemini-pro" is the default recommended.
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

def ai_extract_receipt_info(email_text: str) -> dict:
    prompt = f"""
You are a strict JSON API. Extract only the following receipt fields:
- company: string
- total: string (numeric only, no currency symbols, e.g., "25.98")
- date: string (in YYYY-MM-DD format)
- category: string (e.g., Food, Subscription)

Return ONLY a valid JSON object with those keys. No extra text, no markdown.

EMAIL:
{email_text}
"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Remove markdown formatting if present
        match = re.search(r"```json\s*(\{.*?\})\s*```", raw, re.DOTALL | re.IGNORECASE)
        json_text = match.group(1) if match else raw

        try:
            parsed = json.loads(json_text)
        except json.JSONDecodeError as e:
            print(f"[JSON ERROR]: {e}")
            return {"error": f"JSON decode error: {e}"}

        # Validate required keys
        required = {"company", "total", "date", "category"}
        if not required.issubset(parsed.keys()):
            print(f"[AI REJECTED]: missing keys: {required - parsed.keys()}")
            return {"error": "Missing required fields"}

        # Validate total field
        total_str = parsed["total"].replace("$", "").replace(",", "").strip()
        if total_str in {"0", "0.00", "0,00", "0.0", "unknown", ""}:
            print("[AI REJECTED]: total is zero or unknown")
            return {"error": "Invalid or zero total"}

        return parsed

    except Exception as e:
        print(f"[AI EXCEPTION]: {e}")
        return {"error": str(e)}