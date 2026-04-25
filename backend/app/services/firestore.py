"""
Firestore data access layer for user progress and session history.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from app.core.firebase import get_db
from app.models.user import UserProgress

logger = logging.getLogger(__name__)


def _users_col():
    db = get_db()
    if db is None:
        return None
    return db.collection("users")


# ─── User CRUD ───────────────────────────────────────────────────────────────

def create_user_doc(user_id: str, email: str, display_name: str) -> dict:
    col = _users_col()
    now = datetime.now(timezone.utc)
    doc = {
        "id": user_id,
        "email": email,
        "display_name": display_name,
        "created_at": now,
        "avatar_url": None,
        "progress": {
            "topics_studied": [],
            "weak_areas": [],
            "strong_areas": [],
            "total_questions_answered": 0,
            "correct_answers": 0,
            "learning_streak": 0,
            "last_active": now,
        },
        "chat_sessions": [],
    }
    if col:
        col.document(user_id).set(doc)
    return doc


def get_user_doc(user_id: str) -> Optional[dict]:
    col = _users_col()
    if col is None:
        return None
    doc = col.document(user_id).get()
    return doc.to_dict() if doc.exists else None


def update_progress(user_id: str, topic: str, correct: bool) -> None:
    """Update user's progress after a quiz answer."""
    col = _users_col()
    if col is None:
        return
    doc_ref = col.document(user_id)
    doc = doc_ref.get()
    if not doc.exists:
        return
    data = doc.to_dict()
    progress = data.get("progress", {})

    # Update stats
    topics = progress.get("topics_studied", [])
    if topic not in topics:
        topics.append(topic)

    total = progress.get("total_questions_answered", 0) + 1
    correct_count = progress.get("correct_answers", 0) + (1 if correct else 0)
    accuracy = correct_count / total

    weak = progress.get("weak_areas", [])
    strong = progress.get("strong_areas", [])
    if accuracy < 0.5 and topic not in weak:
        weak.append(topic)
        if topic in strong:
            strong.remove(topic)
    elif accuracy >= 0.8 and topic not in strong:
        strong.append(topic)
        if topic in weak:
            weak.remove(topic)

    doc_ref.update({
        "progress.topics_studied": topics,
        "progress.total_questions_answered": total,
        "progress.correct_answers": correct_count,
        "progress.weak_areas": weak,
        "progress.strong_areas": strong,
        "progress.last_active": datetime.now(timezone.utc),
    })


def save_chat_message(user_id: str, role: str, content: str) -> None:
    """Persist a chat message to Firestore."""
    col = _users_col()
    if col is None:
        return
    msg = {"role": role, "content": content, "timestamp": datetime.now(timezone.utc)}
    col.document(user_id).collection("chat_history").add(msg)


def get_chat_history(user_id: str, limit: int = 50) -> list[dict]:
    """Retrieve recent chat history from Firestore."""
    col = _users_col()
    if col is None:
        return []
    try:
        docs = (
            col.document(user_id)
            .collection("chat_history")
            .order_by("timestamp")
            .limit_to_last(limit)
            .get()
        )
        return [d.to_dict() for d in docs]
    except Exception as exc:
        logger.warning(f"Failed to fetch chat history: {exc}")
        return []
