
import os
from functools import wraps
from flask import request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
_google_request = google_requests.Request()


def verify_firebase_token():
    """Returns the decoded token dict if valid, else None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        return id_token.verify_firebase_token(token, _google_request, audience=FIREBASE_PROJECT_ID)
    except Exception:
        return None


def require_auth(f):
    """
    Decorator: rejects the request with 401 if there's no valid Firebase
    token. Sets request.verified_uid to the token's uid on success.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        decoded = verify_firebase_token()
        if not decoded:
            return jsonify({"error": "Unauthorized"}), 401
        request.verified_uid = decoded.get("uid") or decoded.get("sub")
        return f(*args, **kwargs)
    return decorated