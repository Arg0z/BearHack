from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import re
from datetime import datetime

def search_receipt_emails(token: str, start_timestamp: int, end_timestamp: int):
    """
    Search Gmail for emails with the word 'receipt' in the given time range.

    :param token: Google access token
    :param start_timestamp: Unix timestamp (in seconds)
    :param end_timestamp: Unix timestamp (in seconds)
    :return: List of email snippets
    """
    creds = Credentials(token=token)
    service = build("gmail", "v1", credentials=creds)

    # Gmail search query
    query = f'receipt after:{start_timestamp} before:{end_timestamp}'

    # Fetch matching messages
    response = service.users().messages().list(userId="me", q=query, maxResults=10).execute()

    messages = response.get("messages", [])
    receipts = []

    for msg in messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()
        snippet = msg_data.get("snippet", "")
        receipt_info = extract_receipt_data(snippet)
        receipt_info["message_id"] = msg["id"]  # optional for tracking
        receipts.append(receipt_info)

    return receipts

def extract_receipt_data(text: str):
    """
    Parses a receipt-like email text to extract date, company name, and total amount.
    """

    # Company name (simple fallback: first line or from "Thank you for shopping at X")
    company_match = re.search(r"Thank you for (shopping at|choosing|your order with)\s+([A-Za-z0-9&.\- ]+)", text, re.IGNORECASE)
    company = company_match.group(2).strip() if company_match else "Unknown"

    # Date (look for typical formats)
    date_match = re.search(
        r"(?:Date|Order Date|Purchase Date|Transaction Date)[:\s]*([\w ,\-\/]+)", text, re.IGNORECASE
    )
    date_raw = date_match.group(1).strip() if date_match else None

    # Attempt to parse date
    try:
        parsed_date = datetime.strptime(date_raw, "%B %d, %Y") if date_raw else None
    except:
        parsed_date = None

    # Total amount (look for $XX.XX or similar)
    total_match = re.search(
        r"(Total|Amount Paid|Grand Total|Order Total)[^\d]*([\$€£]?\s*\d+[.,]?\d{0,2})",
        text,
        re.IGNORECASE,
    )
    total = total_match.group(2).strip() if total_match else "Unknown"

    return {
        "company": company,
        "date": parsed_date.isoformat() if parsed_date else "Unknown",
        "total": total
    }