"""
Firebase Admin SDK initialization.
Handles graceful fallback when credentials are not yet configured.
"""
import json
import os
import logging

import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_app: firebase_admin.App | None = None
_db = None


def init_firebase() -> None:
    global _app, _db
    if _app:
        return

    key_path = settings.firebase_service_account_key_path
    if os.path.exists(key_path):
        try:
            cred = credentials.Certificate(key_path)
            _app = firebase_admin.initialize_app(cred)
            _db = firestore.client()
            logger.info("Firebase initialized successfully.")
        except Exception as exc:
            logger.warning(f"Firebase init failed: {exc}. Running without Firebase.")
    else:
        logger.warning(
            "Firebase service account key not found at %s. "
            "Firebase features will be disabled.",
            key_path,
        )


def get_db():
    """Return Firestore client (may be None if Firebase not configured)."""
    return _db


def verify_firebase_token(id_token: str) -> dict | None:
    """Verify a Firebase ID token and return the decoded claims."""
    try:
        return firebase_auth.verify_id_token(id_token)
    except Exception as exc:
        logger.warning(f"Firebase token verification failed: {exc}")
        return None
