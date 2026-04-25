"""
Pydantic models for Learning domain.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ExplainRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    level: Literal["simple", "intermediate", "advanced"] = "simple"


class ExplainResponse(BaseModel):
    topic: str
    level: str
    explanation: str
    key_concepts: list[str]
    suggested_next_levels: list[str]


class QuizRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    difficulty: Literal["easy", "medium", "hard"] = "easy"
    num_questions: int = Field(default=3, ge=1, le=10)


class MCQOption(BaseModel):
    key: str   # A, B, C, D
    text: str


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[MCQOption]
    explanation: str  # shown after answer


class QuizResponse(BaseModel):
    topic: str
    difficulty: str
    questions: list[QuizQuestion]


class EvaluateRequest(BaseModel):
    question: str
    correct_answer: str
    user_answer: str
    topic: str


class EvaluateResponse(BaseModel):
    score: float          # 0.0 – 1.0
    is_correct: bool
    feedback: str
    correct_answer: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=50)
    topic_context: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    topic_context: Optional[str] = None


class RecommendationResponse(BaseModel):
    next_topics: list[str]
    revision_topics: list[str]
    rationale: str
