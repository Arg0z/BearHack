from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import re
from datetime import datetime
import base64
import html

def _get_plain_text_from_parts(parts):
    for part in parts:
        if part.get("mimeType") == "text/plain" and "data" in part.get("body", {}):
            data = part["body"]["data"]
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
        elif "parts" in part:
            result = _get_plain_text_from_parts(part["parts"])
            if result:
                return result
    return ""

def extract_receipt_emails(token: str, start_timestamp: int, end_timestamp: int) -> list[dict]:
    creds = Credentials(token=token)
    service = build("gmail", "v1", credentials=creds)

    query = "receipt"
    response = service.users().messages().list(userId="me", q=query, maxResults=50).execute()

    messages = response.get("messages", [])
    filtered_emails = []

    for msg in messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"], format="full").execute()
        internal_ts = int(msg_data.get("internalDate", "0")) // 1000  # ms to seconds

        if not (start_timestamp <= internal_ts <= end_timestamp):
            continue

        payload = msg_data.get("payload", {})
        body_text = ""

        if payload.get("mimeType") == "text/plain":
            data = payload["body"].get("data", "")
            body_text = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
        elif "parts" in payload:
            body_text = _get_plain_text_from_parts(payload["parts"])

        if not body_text:
            body_text = msg_data.get("snippet", "")

        body_text = html.unescape(body_text)

        filtered_emails.append({
            "id": msg["id"],
            "body": body_text
        })

    return filtered_emails