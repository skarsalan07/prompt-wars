"""
AI Engine: Gemini 2.0 Flash integration using the new google-genai SDK.
"""
import json
import logging
import re
import uuid
from typing import Optional

from google import genai
from google.genai import types

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

MODEL = "gemini-2.5-flash"


def _client() -> genai.Client:
    return genai.Client(api_key=settings.google_gemini_api_key)


def _extract_json(text: str) -> dict:
    """Extract the first JSON object from a string, stripping markdown fences."""
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
    text = re.sub(r"```\s*$", "", text.strip(), flags=re.MULTILINE)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    return json.loads(match.group() if match else text)


# ─── Explanation ─────────────────────────────────────────────────────────────

async def generate_explanation(topic: str, level: str) -> ExplainResponse:
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
        client = _client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        data = _extract_json(response.text)
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
            topic=topic, level=level,
            explanation="Unable to generate explanation at this time. Please try again.",
            key_concepts=[], suggested_next_levels=[],
        )


# ─── Quiz Generation ─────────────────────────────────────────────────────────

async def generate_quiz(topic: str, difficulty: str, num_questions: int) -> QuizResponse:
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

Rules: Questions must be clear, only one correct option, explanations educational."""

    try:
        client = _client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        data = _extract_json(response.text)
        questions = [
            QuizQuestion(
                id=str(uuid.uuid4()),
                question=q["question"],
                options=[MCQOption(**o) for o in q["options"]],
                explanation=q.get("explanation", ""),
            )
            for q in data.get("questions", [])
        ]
        return QuizResponse(topic=topic, difficulty=difficulty, questions=questions)
    except Exception as exc:
        logger.error(f"Quiz generation failed: {exc}")
        return QuizResponse(topic=topic, difficulty=difficulty, questions=[])


# ─── Answer Evaluation ───────────────────────────────────────────────────────

async def evaluate_answer(
    question: str, correct_answer: str, user_answer: str, topic: str
) -> EvaluateResponse:
    prompt = f"""You are a fair evaluator for a learning platform.

Topic: {topic}
Question: {question}
Expected Answer: {correct_answer}
Student's Answer: {user_answer}

Evaluate the student's answer. Give partial credit for answers showing understanding.

Respond ONLY with valid JSON:
{{
  "score": <float 0.0-1.0>,
  "is_correct": <true if score >= 0.7>,
  "feedback": "<constructive feedback>",
  "correct_answer": "<clear correct answer>"
}}"""

    try:
        client = _client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        data = _extract_json(response.text)
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
            score=0.0, is_correct=False,
            feedback="Evaluation service temporarily unavailable.",
            correct_answer=correct_answer,
        )


# ─── Conversational Chat ─────────────────────────────────────────────────────

async def chat_with_ai(
    message: str,
    history: list[ChatMessage],
    topic_context: Optional[str] = None,
) -> ChatResponse:
    system_prompt = (
        f"You are Learning Companion, an expert AI tutor. Help users learn deeply. "
        f"Be concise yet thorough, use examples, and adapt to the user's level. "
        f"Always be encouraging and constructive."
        + (f" Current topic context: {topic_context}." if topic_context else "")
    )

    contents = []
    for msg in history[-20:]:
        role = "user" if msg.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    try:
        client = _client()
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt),
        )
        return ChatResponse(reply=response.text, topic_context=topic_context)
    except Exception as exc:
        logger.error(f"Chat generation failed: {exc}")
        return ChatResponse(
            reply="I'm having trouble connecting right now. Please try again.",
            topic_context=topic_context,
        )


# ─── Recommendations ─────────────────────────────────────────────────────────

async def generate_recommendations(
    studied_topics: list[str],
    weak_areas: list[str],
    strong_areas: list[str],
) -> RecommendationResponse:
    prompt = f"""You are a personalized learning advisor.

Student profile:
- Topics studied: {", ".join(studied_topics) if studied_topics else "None yet"}
- Weak areas: {", ".join(weak_areas) if weak_areas else "None identified"}
- Strong areas: {", ".join(strong_areas) if strong_areas else "None yet"}

Recommend next steps.

Respond ONLY with valid JSON:
{{
  "next_topics": ["topic1", "topic2", "topic3"],
  "revision_topics": ["topic1", "topic2"],
  "rationale": "<brief explanation>"
}}"""

    try:
        client = _client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        data = _extract_json(response.text)
        return RecommendationResponse(
            next_topics=data.get("next_topics", []),
            revision_topics=data.get("revision_topics", []),
            rationale=data.get("rationale", ""),
        )
    except Exception as exc:
        logger.error(f"Recommendation generation failed: {exc}")
        return RecommendationResponse(
            next_topics=[], revision_topics=[],
            rationale="Recommendations temporarily unavailable.",
        )
