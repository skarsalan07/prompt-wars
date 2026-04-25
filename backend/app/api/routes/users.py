"""
User routes: profile, progress, and personalized recommendations.
Authentication removed — open access mode using guest user.
"""
from fastapi import APIRouter
from datetime import datetime

from app.models.user import UserOut, UserProgress
from app.models.learning import RecommendationResponse
from app.services.firestore import get_user_doc, create_user_doc
from app.services import ai_engine

router = APIRouter(prefix="/users", tags=["Users"])

GUEST_ID = "guest"


def _get_or_create_guest() -> dict:
    user = get_user_doc(GUEST_ID)
    if not user:
        user = create_user_doc(GUEST_ID, "guest@learning.ai", "Learner")
    return user


@router.get("/me", response_model=UserOut)
async def get_me():
    user = _get_or_create_guest()
    return UserOut(
        id=user["id"],
        email=user["email"],
        display_name=user["display_name"],
        created_at=user.get("created_at", datetime.utcnow()),
        avatar_url=user.get("avatar_url"),
    )


@router.get("/progress", response_model=UserProgress)
async def get_progress():
    user = _get_or_create_guest()
    progress = user.get("progress", {})
    return UserProgress(
        user_id=GUEST_ID,
        topics_studied=progress.get("topics_studied", []),
        weak_areas=progress.get("weak_areas", []),
        strong_areas=progress.get("strong_areas", []),
        total_questions_answered=progress.get("total_questions_answered", 0),
        correct_answers=progress.get("correct_answers", 0),
        learning_streak=progress.get("learning_streak", 0),
        last_active=progress.get("last_active"),
    )


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations():
    user = _get_or_create_guest()
    progress = user.get("progress", {})
    return await ai_engine.generate_recommendations(
        studied_topics=progress.get("topics_studied", []),
        weak_areas=progress.get("weak_areas", []),
        strong_areas=progress.get("strong_areas", []),
    )
