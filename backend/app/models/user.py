"""
Pydantic models for User domain.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    display_name: str = Field(..., min_length=2, max_length=80)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: str
    created_at: datetime
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserProgress(BaseModel):
    user_id: str
    topics_studied: list[str] = []
    weak_areas: list[str] = []
    strong_areas: list[str] = []
    total_questions_answered: int = 0
    correct_answers: int = 0
    learning_streak: int = 0
    last_active: Optional[datetime] = None

    @property
    def accuracy(self) -> float:
        if self.total_questions_answered == 0:
            return 0.0
        return round(self.correct_answers / self.total_questions_answered * 100, 1)
