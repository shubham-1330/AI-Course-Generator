from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from app.models.user import PyObjectId

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int

class LessonBase(BaseModel):
    title: str

class LessonInDB(LessonBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    course_id: str
    module_title: str
    content_markdown: str = ""
    quiz: List[QuizQuestion] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Module(BaseModel):
    title: str
    lessons: List[LessonBase]

class CourseBase(BaseModel):
    title: str
    topic: str
    difficulty: str
    description: str

class CourseInDB(CourseBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    modules: List[Module] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
