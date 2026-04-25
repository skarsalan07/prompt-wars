"""
Chat routes: conversational AI with persistent history.
Authentication removed — open access mode.
"""
from fastapi import APIRouter

from app.models.learning import ChatRequest, ChatResponse, ChatMessage
from app.services import ai_engine
from app.services.firestore import save_chat_message, get_chat_history

router = APIRouter(prefix="/chat", tags=["Chat"])

GUEST_ID = "guest"


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    """Send a message and receive a context-aware AI response."""
    result = await ai_engine.chat_with_ai(
        message=payload.message,
        history=payload.history,
        topic_context=payload.topic_context,
    )
    save_chat_message(GUEST_ID, "user", payload.message)
    save_chat_message(GUEST_ID, "assistant", result.reply)
    return result


@router.get("/history", response_model=list[ChatMessage])
async def get_history(limit: int = 50):
    """Retrieve recent chat history."""
    raw = get_chat_history(GUEST_ID, limit=limit)
    return [
        ChatMessage(role=m["role"], content=m["content"], timestamp=m.get("timestamp"))
        for m in raw
    ]
