"""
Chat routes: conversational AI with persistent history.
"""
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.learning import ChatRequest, ChatResponse, ChatMessage
from app.services import ai_engine
from app.services.firestore import save_chat_message, get_chat_history

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Send a message and receive a context-aware AI response."""
    user_id = current_user["id"]

    # Merge persisted history with request history (use request history for speed)
    history = payload.history

    result = await ai_engine.chat_with_ai(
        message=payload.message,
        history=history,
        topic_context=payload.topic_context,
    )

    # Persist both user message and AI reply
    save_chat_message(user_id, "user", payload.message)
    save_chat_message(user_id, "assistant", result.reply)

    return result


@router.get("/history", response_model=list[ChatMessage])
async def get_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve recent chat history for the authenticated user."""
    raw = get_chat_history(current_user["id"], limit=limit)
    return [
        ChatMessage(role=m["role"], content=m["content"], timestamp=m.get("timestamp"))
        for m in raw
    ]
