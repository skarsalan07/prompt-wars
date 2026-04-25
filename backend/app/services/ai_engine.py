"""
AI Engine: Gemini 1.5 Pro integration for all AI features.
- Topic explanation (simple / intermediate / advanced)
- MCQ quiz generation
- Answer evaluation (semantic similarity)
- Conversational chat with memory
- Topic recommendations
"""
import json
import logging
import re
import uuid
from typing import Optional

import google.generativeai as genai

from app.core.config import get_settings
from app.models.learning import (
    ExplainResponse,
    MCQOption,
    QuizQuestion,
    QuizResponse,
    EvaluateResponse,
    ChatMessage,
    ChatResponse,
    RecommendationResponse,
)

logger = logging.getLogger(__name__)
settings = get_settings()


def _init_model(model_name: str = "gemini-1.5-pro") -> genai.GenerativeModel:
    genai.configure(api_key=settings.google_gemini_api_key)
    return genai.GenerativeModel(model_name)


# ─── Explanation ─────────────────────────────────────────────────────────────

async def generate_explanation(topic: str, level: str) -> ExplainResponse:
    """Generate a tiered explanation for a topic."""
    level_descriptions = {
        "simple": "a complete beginner with no prior knowledge. Use analogies, everyday language, and avoid jargon.",
        "intermediate": "someone with basic knowledge. Include technical terms with brief definitions and examples.",
        "advanced": "an expert. Use precise technical language, edge cases, complexity analysis, and real-world applications.",
    }
    prompt = f"""You are an expert educator. Explain the concept of "{topic}" to {level_descriptions[level]}

Respond ONLY with valid JSON in this exact format:
{{
  "explanation": "<detailed explanation>",
  "key_concepts": ["concept1", "concept2", "concept3"],
  "suggested_next_levels": ["topic1", "topic2"]
}}"""

    try:
        model = _init_model()
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Extract JSON even if wrapped in markdown code fences
        match = re.search(r"\{.*\}", text, re.DOTALL)
        data = json.loads(match.group() if match else text)
        return ExplainResponse(
            topic=topic,
            level=level,
            explanation=data["explanation"],
            key_concepts=data.get("key_concepts", []),
            suggested_next_levels=data.get("suggested_next_levels", []),
        )
    except Exception as exc:
        logger.error(f"Explanation generation failed: {exc}")
        return ExplainResponse(
            topic=topic,
            level=level,
            explanation=f"Unable to generate explanation at this time. Please try again.",
            key_concepts=[],
            suggested_next_levels=[],
        )


# ─── Quiz Generation ─────────────────────────────────────────────────────────

async def generate_quiz(topic: str, difficulty: str, num_questions: int) -> QuizResponse:
    """Generate MCQ questions for a topic."""
    prompt = f"""You are a quiz master. Generate {num_questions} multiple-choice questions about "{topic}" at {difficulty} difficulty.

Respond ONLY with valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "<the question text>",
      "options": [
        {{"key": "A", "text": "<option A>"}},
        {{"key": "B", "text": "<option B>"}},
        {{"key": "C", "text": "<option C>"}},
        {{"key": "D", "text": "<option D>"}}
      ],
      "correct_key": "A",
      "explanation": "<why this answer is correct>"
    }}
  ]
}}

Rules:
- Questions must be clear and unambiguous
- Only one option is correct
- Explanations should be educational
- Vary question types (definition, application, analysis)"""

    try:
        model = _init_model()
        response = model.generate_content(prompt)
        text = response.text.strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        data = json.loads(match.group() if match else text)

        questions = []
        for q in data.get("questions", []):
            questions.append(
                QuizQuestion(
                    id=str(uuid.uuid4()),
                    question=q["question"],
                    options=[MCQOption(**o) for o in q["options"]],
                    explanation=q.get("explanation", ""),
                )
            )

        return QuizResponse(topic=topic, difficulty=difficulty, questions=questions)
    except Exception as exc:
        logger.error(f"Quiz generation failed: {exc}")
        return QuizResponse(topic=topic, difficulty=difficulty, questions=[])


# ─── Answer Evaluation ───────────────────────────────────────────────────────

async def evaluate_answer(
    question: str, correct_answer: str, user_answer: str, topic: str
) -> EvaluateResponse:
    """Semantically evaluate a user's answer using Gemini."""
    prompt = f"""You are a fair and constructive evaluator for a learning platform.

Topic: {topic}
Question: {question}
Expected Answer: {correct_answer}
Student's Answer: {user_answer}

Evaluate the student's answer. Consider partial credit for answers that demonstrate understanding even if not perfectly worded.

Respond ONLY with valid JSON:
{{
  "score": <float between 0.0 and 1.0>,
  "is_correct": <true if score >= 0.7>,
  "feedback": "<constructive feedback explaining the evaluation>",
  "correct_answer": "<a clear, well-worded correct answer>"
}}"""

    try:
        model = _init_model()
        response = model.generate_content(prompt)
        text = response.text.strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        data = json.loads(match.group() if match else text)
        score = float(data.get("score", 0.0))
        return EvaluateResponse(
            score=score,
            is_correct=score >= 0.7,
            feedback=data.get("feedback", ""),
            correct_answer=data.get("correct_answer", correct_answer),
        )
    except Exception as exc:
        logger.error(f"Answer evaluation failed: {exc}")
        return EvaluateResponse(
            score=0.0,
            is_correct=False,
            feedback="Evaluation service temporarily unavailable.",
            correct_answer=correct_answer,
        )


# ─── Conversational Chat ─────────────────────────────────────────────────────

async def chat_with_ai(
    message: str,
    history: list[ChatMessage],
    topic_context: Optional[str] = None,
) -> ChatResponse:
    """Context-aware conversational response using Gemini."""
    system_prompt = f"""You are Learning Companion, an expert AI tutor. You help users learn and understand concepts deeply.
Be concise yet thorough, use examples, and adapt to the user's apparent level.
{f'Current learning topic context: {topic_context}' if topic_context else ''}
Always be encouraging and constructive."""

    # Build Gemini chat history
    gemini_history = []
    for msg in history[-20:]:  # Last 20 messages for context window
        gemini_history.append({
            "role": msg.role if msg.role == "user" else "model",
            "parts": [msg.content],
        })

    try:
        model = _init_model()
        chat = model.start_chat(history=gemini_history)
        full_message = f"{system_prompt}\n\nUser: {message}" if not gemini_history else message
        response = chat.send_message(full_message)
        return ChatResponse(
            reply=response.text,
            topic_context=topic_context,
        )
    except Exception as exc:
        logger.error(f"Chat generation failed: {exc}")
        return ChatResponse(
            reply="I'm having trouble connecting right now. Please try again in a moment.",
            topic_context=topic_context,
        )


# ─── Personalization / Recommendations ──────────────────────────────────────

async def generate_recommendations(
    studied_topics: list[str],
    weak_areas: list[str],
    strong_areas: list[str],
) -> RecommendationResponse:
    """Generate personalized next topic recommendations."""
    prompt = f"""You are a personalized learning advisor.

Student profile:
- Topics studied: {", ".join(studied_topics) if studied_topics else "None yet"}
- Weak areas: {", ".join(weak_areas) if weak_areas else "None identified"}
- Strong areas: {", ".join(strong_areas) if strong_areas else "None yet"}

Recommend the next steps for this student.

Respond ONLY with valid JSON:
{{
  "next_topics": ["topic1", "topic2", "topic3"],
  "revision_topics": ["topic_to_revise1", "topic_to_revise2"],
  "rationale": "<brief explanation of why these recommendations make sense>"
}}"""

    try:
        model = _init_model()
        response = model.generate_content(prompt)
        text = response.text.strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        data = json.loads(match.group() if match else text)
        return RecommendationResponse(
            next_topics=data.get("next_topics", []),
            revision_topics=data.get("revision_topics", []),
            rationale=data.get("rationale", ""),
        )
    except Exception as exc:
        logger.error(f"Recommendation generation failed: {exc}")
        return RecommendationResponse(
            next_topics=[],
            revision_topics=[],
            rationale="Recommendations temporarily unavailable.",
        )
