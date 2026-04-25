"""
Learning routes: explain, quiz, evaluate.
All endpoints require authentication.
"""
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.learning import (
    ExplainRequest, ExplainResponse,
    QuizRequest, QuizResponse,
    EvaluateRequest, EvaluateResponse,
)
from app.services import ai_engine
from app.services.firestore import update_progress

router = APIRouter(prefix="/learning", tags=["Learning"])


@router.post("/explain", response_model=ExplainResponse)
async def explain_topic(
    payload: ExplainRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate a tiered explanation for a topic."""
    result = await ai_engine.generate_explanation(payload.topic, payload.level)
    return result


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(
    payload: QuizRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate adaptive MCQ quiz questions for a topic."""
    result = await ai_engine.generate_quiz(
        payload.topic, payload.difficulty, payload.num_questions
    )
    return result


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answer(
    payload: EvaluateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Evaluate a user's answer using Gemini semantic similarity."""
    result = await ai_engine.evaluate_answer(
        payload.question,
        payload.correct_answer,
        payload.user_answer,
        payload.topic,
    )
    # Persist progress update to Firestore
    update_progress(
        user_id=current_user["id"],
        topic=payload.topic,
        correct=result.is_correct,
    )
    return result
