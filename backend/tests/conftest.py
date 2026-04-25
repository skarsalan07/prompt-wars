"""
Pytest configuration and shared fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_firestore():
    """Patch Firestore so tests run without a real Firebase connection."""
    with patch("app.core.firebase.get_db", return_value=None):
        yield


@pytest.fixture
def auth_token():
    return create_access_token(subject="test-user-123")


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
