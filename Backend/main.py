from fastapi import FastAPI, Request, HTTPException
from fastapi import Query
from MailAnalyzing import extract_receipt_emails
from AiExtractor import ai_extract_receipt_info
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from dotenv import load_dotenv
from pathlib import Path
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from urllib.parse import urlencode
from datetime import datetime
import re
import uuid
import os
# Load environment variables
load_dotenv(Path("Credentials.env"))

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary store for state values
state_store = {}

@app.get("/")
def home():
    return {"message": "Welcome! Go to /auth/login to log in with Google."}

@app.get("/auth/login", include_in_schema=False)
def google_login():
    state = str(uuid.uuid4())

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "redirect_uris": [REDIRECT_URI],
            }
        },
        scopes=SCOPES,
        state=state
    )

    flow.redirect_uri = REDIRECT_URI
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true"
    )

    state_store[state] = True

    return RedirectResponse(authorization_url)


@app.get("/auth/callback", include_in_schema=False)
async def google_callback(request: Request):
    try:
        state = request.query_params.get('state')

        if not state or state not in state_store:
            raise HTTPException(status_code=400, detail="State mismatch or invalid state.")

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "redirect_uris": [REDIRECT_URI],
                }
            },
            scopes=SCOPES,
            state=state
        )

        flow.redirect_uri = REDIRECT_URI
        flow.fetch_token(authorization_response=str(request.url))
        state_store.pop(state)

        credentials = flow.credentials

        # Decode ID token to get user info
        request_adapter = google_requests.Request()
        user_info = google_id_token.verify_oauth2_token(
            credentials.id_token, request_adapter, CLIENT_ID
        )

        # Prepare query parameters
        query = urlencode({
            "email": user_info.get("email", ""),
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token or "",
            "expires_at": credentials.expiry.timestamp()
        })
        # Redirect to your frontend with token info
        return RedirectResponse(f"http://localhost:5173?{query}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

from fastapi import Query, HTTPException
from datetime import datetime
import re

@app.get("/emails/receipts")
def get_receipt_information(
    access_token: str = Query(...),
    start: int = Query(...),
    end: int = Query(...)
):
    try:
        raw_emails = extract_receipt_emails(access_token, start, end)
        parsed_receipts = []
        seen_keys = set()

        for email in raw_emails:
            parsed = ai_extract_receipt_info(email["body"])

            if "error" in parsed:
                continue

            required_fields = {"company", "total", "date", "category"}
            if not required_fields.issubset(parsed):
                continue

            total_str = str(parsed["total"]).replace("$", "").replace(",", "").strip()
            try:
                if float(total_str) <= 0:
                    continue
            except ValueError:
                continue

            parsed["id"] = email["id"]
            parsed["date"] = datetime.utcfromtimestamp(email["timestamp"]).isoformat()

            dedup_key = f"{parsed['company']}|{parsed['total']}|{parsed['date']}"
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            parsed_receipts.append(parsed)

        return {"receipts": parsed_receipts}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve receipt data: {str(e)}")