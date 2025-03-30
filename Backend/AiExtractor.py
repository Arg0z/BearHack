import google.generativeai as genai
import os
from pathlib import Path
import json
import re

from dotenv import load_dotenv
load_dotenv(Path("Credentials.env"))

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.0-flash")

def ai_extract_receipt_info(email_text: str) -> dict:
    prompt = f"""
You are a strict JSON API. You must only return a valid JSON object with the following keys:
- company: string
- total: string
- date: string in YYYY-MM-DD
- category: string

No text, no Markdown, no explanation. Just pure JSON.

    EMAIL:
    {email_text}
    """
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()

        # Remove Markdown code block if present
        match = re.search(r"```json\n(.*?)\n```", content, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1).strip()

        return json.loads(content)
    except Exception as e:
        return {"error": str(e)}