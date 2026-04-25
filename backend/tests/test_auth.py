"""
Tests for auth routes and security utilities.
"""
import pytest
from unittest.mock import patch, MagicMock
from app.core.security import hash_password, verify_password, create_access_token, decode_token


# ─── Security unit tests ──────────────────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = hash_password("secret123")
        assert hashed != "secret123"

    def test_correct_password_verifies(self):
        hashed = hash_password("secret123")
        assert verify_password("secret123", hashed) is True

    def test_wrong_password_fails(self):
        hashed = hash_password("secret123")
        assert verify_password("wrongpass", hashed) is False


class TestJWT:
    def test_create_and_decode_token(self):
        token = create_access_token(subject="user-abc")
        subject = decode_token(token)
        assert subject == "user-abc"

    def test_invalid_token_returns_none(self):
        result = decode_token("totally.invalid.token")
        assert result is None

    def test_tampered_token_returns_none(self):
        token = create_access_token(subject="user-abc")
        tampered = token[:-5] + "XXXXX"
        assert decode_token(tampered) is None


# ─── Auth endpoint tests ──────────────────────────────────────────────────────

class TestAuthEndpoints:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_register_without_firebase_returns_503_or_201(self, client, mock_firestore):
        """Register endpoint should handle missing Firebase gracefully."""
        payload = {
            "email": "test@example.com",
            "display_name": "Test User",
            "password": "securepassword123",
        }
        # When Firestore is not configured, register still creates the token
        # but won't persist — we just verify it doesn't 500
        with patch("app.api.routes.auth.create_user_doc", return_value={
            "id": "test-id",
            "email": "test@example.com",
            "display_name": "Test User",
            "created_at": "2024-01-01T00:00:00",
        }):
            response = client.post("/api/v1/auth/register", json=payload)
            assert response.status_code in (201, 503)

    def test_login_without_firebase_returns_503(self, client, mock_firestore):
        payload = {"email": "test@example.com", "password": "securepassword123"}
        response = client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 503

    def test_protected_route_without_token(self, client):
        response = client.get("/api/v1/users/me")
        assert response.status_code == 403

    def test_protected_route_with_invalid_token(self, client):
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalidtoken"},
        )
        assert response.status_code == 401
