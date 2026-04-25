"""
Learning routes: explain, quiz, evaluate.
Authentication removed — open access mode.
"""
from fastapi import APIRouter

from app.models.learning import (
    ExplainRequest, ExplainResponse,
    QuizRequest, QuizResponse,
    EvaluateRequest, EvaluateResponse,
)
from app.services import ai_engine
from app.services.firestore import update_progress

router = APIRouter(prefix="/learning", tags=["Learning"])


@router.post("/explain", response_model=ExplainResponse)
async def explain_topic(payload: ExplainRequest):
    """Generate a tiered explanation for a topic."""
    return await ai_engine.generate_explanation(payload.topic, payload.level)


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(payload: QuizRequest):
    """Generate adaptive MCQ quiz questions for a topic."""
    return await ai_engine.generate_quiz(payload.topic, payload.difficulty, payload.num_questions)


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answer(payload: EvaluateRequest):
    """Evaluate a user's answer using Gemini semantic similarity."""
    result = await ai_engine.evaluate_answer(
        payload.question,
        payload.correct_answer,
        payload.user_answer,
        payload.topic,
    )
    update_progress(user_id="guest", topic=payload.topic, correct=result.is_correct)
    return result
