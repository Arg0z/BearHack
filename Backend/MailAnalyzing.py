from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

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
    snippets = []

    for msg in messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()
        snippet = msg_data.get("snippet", "")
        snippets.append(snippet)

    return snippets