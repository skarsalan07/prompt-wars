"""
Shared FastAPI dependencies: auth-free guest user for open access mode.
"""

GUEST_USER = {"id": "guest", "email": "guest@learning.ai", "display_name": "Learner"}


async def get_current_user() -> dict:
    """Return a fixed guest user — authentication is disabled."""
    return GUEST_USER
