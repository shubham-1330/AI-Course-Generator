from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.models.course import CourseInDB
from app.models.user import UserInDB
from app.api.deps import get_current_user
from app.db.database import get_database
from app.services.llm_service import generate_lesson_and_quiz

router = APIRouter()

@router.get("/{course_id}/lessons/{module_idx}/{lesson_idx}")
async def get_or_generate_lesson(course_id: str, module_idx: int, lesson_idx: int, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    course_data = await db.courses.find_one({"_id": ObjectId(course_id), "user_id": str(current_user.id)})
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")
        
    course = CourseInDB(**course_data)
    
    try:
        module = course.modules[module_idx]
        lesson = module.lessons[lesson_idx]
    except IndexError:
        raise HTTPException(status_code=404, detail="Lesson not found in curriculum")

    lesson_db_id = f"{course_id}_{module_idx}_{lesson_idx}"
    existing_lesson = await db.lessons.find_one({"_id": lesson_db_id})
    
    if existing_lesson and "Failed to generate" not in existing_lesson.get("content_markdown",""):
     return existing_lesson
        
    combined_data = await generate_lesson_and_quiz(
        course_topic=course.topic,
        module_title=module.title,
        lesson_title=lesson.title,
        difficulty=course.difficulty
    )
    
    new_lesson_doc = {
        "_id": lesson_db_id,
        "course_id": course_id,
        "module_title": module.title,
        "lesson_title": lesson.title,
        "content_markdown": combined_data.get("content_markdown", "Content not available."),
        "quiz": combined_data.get("quiz", [])
    }
    
    await db.lessons.update_one(
    {"_id": lesson_db_id},
    {"$set": new_lesson_doc},
    upsert=True
)
    return new_lesson_doc

@router.post("/{course_id}/lessons/{lesson_db_id}/complete")
async def complete_lesson(course_id: str, lesson_db_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    progress = await db.progress.find_one({"user_id": str(current_user.id), "course_id": course_id})
    if not progress:
        await db.progress.insert_one({
            "user_id": str(current_user.id),
            "course_id": course_id,
            "completed_lesson_ids": [lesson_db_id]
        })
    else:
        await db.progress.update_one(
            {"_id": progress["_id"]},
            {"$addToSet": {"completed_lesson_ids": lesson_db_id}}
        )
    return {"message": "Lesson marked as complete"}
