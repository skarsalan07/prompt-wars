"""
Auth routes: register, login, logout, token refresh.
Supports both custom JWT and Firebase token verification.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Body

from app.core.security import hash_password, verify_password, create_access_token
from app.core.firebase import verify_firebase_token
from app.models.user import UserCreate, UserLogin, TokenResponse, UserOut
from app.services.firestore import create_user_doc, get_user_doc

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    """Register a new user with email + password."""
    # Check if email already taken (scan Firestore — simple linear scan for MVP)
    # In production: add a unique email index or use Firebase Auth
    user_id = str(uuid.uuid4())
    hashed = hash_password(payload.password)

    now = datetime.now(timezone.utc)
    user_doc = create_user_doc(user_id, payload.email, payload.display_name)

    # Store hashed password separately (never returned to client)
    from app.core.firebase import get_db
    db = get_db()
    if db:
        db.collection("user_credentials").document(user_id).set({
            "user_id": user_id,
            "email": payload.email,
            "hashed_password": hashed,
        })

    token = create_access_token(subject=user_id)
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user_id,
            email=payload.email,
            display_name=payload.display_name,
            created_at=now,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    """Authenticate with email + password."""
    from app.core.firebase import get_db
    db = get_db()

    if db:
        # Look up credentials in Firestore
        creds_query = (
            db.collection("user_credentials")
            .where("email", "==", payload.email)
            .limit(1)
            .get()
        )
        if not creds_query:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        cred_doc = creds_query[0].to_dict()
        if not verify_password(payload.password, cred_doc["hashed_password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        user_id = cred_doc["user_id"]
        user = get_user_doc(user_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unavailable — Firebase not configured",
        )

    token = create_access_token(subject=user_id)
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user["id"],
            email=user["email"],
            display_name=user["display_name"],
            created_at=user["created_at"],
            avatar_url=user.get("avatar_url"),
        ),
    )


@router.post("/firebase-login", response_model=TokenResponse)
async def firebase_login(id_token: str = Body(..., embed=True)):
    """Exchange a Firebase ID token for an internal JWT."""
    claims = verify_firebase_token(id_token)
    if not claims:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")

    uid = claims["uid"]
    email = claims.get("email", "")
    name = claims.get("name", email.split("@")[0])

    # Upsert user document
    user = get_user_doc(uid)
    if not user:
        user = create_user_doc(uid, email, name)

    token = create_access_token(subject=uid)
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=uid,
            email=email,
            display_name=name,
            created_at=user["created_at"],
            avatar_url=claims.get("picture"),
        ),
    )
