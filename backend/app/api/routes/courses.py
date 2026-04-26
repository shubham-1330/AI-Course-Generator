from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId

from app.models.course import CourseInDB, CourseBase
from app.models.user import UserInDB
from app.api.deps import get_current_user
from app.db.database import get_database
from app.services.llm_service import generate_curriculum

router = APIRouter()

@router.get("/")
async def list_courses(current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    cursor = db.courses.find({"user_id": str(current_user.id)})
    courses = await cursor.to_list(length=100)
    return [CourseInDB(**c).model_dump(by_alias=True) for c in courses]

@router.post("/generate")
async def generate_course(topic: str, difficulty: str, current_user: UserInDB = Depends(get_current_user)):
    curriculum_data = await generate_curriculum(topic, difficulty)
    
    if "error" in curriculum_data:
        raise HTTPException(status_code=500, detail="Failed to generate course structure")
        
    db = get_database()
    
    course_in_db = CourseInDB(
        user_id=str(current_user.id),
        title=curriculum_data.get("title", f"{topic} Course"),
        topic=topic,
        difficulty=difficulty,
        description=curriculum_data.get("description", ""),
        modules=curriculum_data.get("modules", [])
    )
    
    result = await db.courses.insert_one(course_in_db.model_dump(by_alias=True, exclude_none=True))
    return {"message": "Course generated successfully", "course_id": str(result.inserted_id)}

@router.get("/{course_id}")
async def get_course(course_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    course = await db.courses.find_one({"_id": ObjectId(course_id), "user_id": str(current_user.id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseInDB(**course).model_dump(by_alias=True)

@router.get("/{course_id}/progress")
async def get_course_progress(course_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    progress = await db.progress.find_one({"user_id": str(current_user.id), "course_id": course_id})
    if not progress:
        return {"completed_lesson_ids": []}
    return {"completed_lesson_ids": progress.get("completed_lesson_ids", [])}
