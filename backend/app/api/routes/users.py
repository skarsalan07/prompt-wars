"""
User routes: profile, progress, and personalized recommendations.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import UserOut, UserProgress
from app.models.learning import RecommendationResponse
from app.services.firestore import get_user_doc
from app.services import ai_engine
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserOut(
        id=current_user["id"],
        email=current_user["email"],
        display_name=current_user["display_name"],
        created_at=current_user.get("created_at", datetime.utcnow()),
        avatar_url=current_user.get("avatar_url"),
    )


@router.get("/progress", response_model=UserProgress)
async def get_progress(current_user: dict = Depends(get_current_user)):
    """Return the user's learning progress stats."""
    user = get_user_doc(current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    progress = user.get("progress", {})
    return UserProgress(
        user_id=current_user["id"],
        topics_studied=progress.get("topics_studied", []),
        weak_areas=progress.get("weak_areas", []),
        strong_areas=progress.get("strong_areas", []),
        total_questions_answered=progress.get("total_questions_answered", 0),
        correct_answers=progress.get("correct_answers", 0),
        learning_streak=progress.get("learning_streak", 0),
        last_active=progress.get("last_active"),
    )


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """Generate AI-powered personalized topic recommendations."""
    user = get_user_doc(current_user["id"])
    progress = user.get("progress", {}) if user else {}

    result = await ai_engine.generate_recommendations(
        studied_topics=progress.get("topics_studied", []),
        weak_areas=progress.get("weak_areas", []),
        strong_areas=progress.get("strong_areas", []),
    )
    return result
