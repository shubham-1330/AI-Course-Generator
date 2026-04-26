from typing import List, Dict, Any
import json
from google import genai
from pydantic import BaseModel, Field
from app.core.config import settings
import os

client = None

def get_genai_client():
    global client
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    if client is None:
        os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return client


# ---------------- PROMPT TEMPLATES ---------------- #

CURRICULUM_PROMPT_TEMPLATE = """
You are an expert instructional designer and curriculum developer.

Generate a structured course curriculum.

Topic: {topic}
Difficulty: {difficulty}

Rules:

If difficulty is Beginner:
- Exactly 3 modules
- Exactly 3 lessons per module

If difficulty is Intermediate:
- Exactly 5 modules
- Exactly 5 lessons per module

If difficulty is Advanced:
- Exactly 8 modules
- Exactly 5 lessons per module

Return ONLY valid JSON:

{{
 "title":"Course Title",
 "description":"Two sentence course description",
 "modules":[
   {{
      "title":"Module 1",
      "lessons":[
         {{"title":"Lesson 1"}},
         {{"title":"Lesson 2"}}
      ]
   }}
 ]
}}

Rules:
- JSON only
- No markdown code blocks
- No explanation outside JSON
"""


COMBINED_LESSON_PROMPT_TEMPLATE = """
You are an expert educator and assessor.

Create a detailed lesson and quiz.

Course Topic: {course_topic}
Module: {module_title}
Lesson Title: {lesson_title}
Difficulty: {difficulty}

Quiz Rules:

If Beginner:
- Exactly 3 quiz questions

If Intermediate:
- Exactly 5 quiz questions

If Advanced:
- Exactly 8 quiz questions

Return ONLY valid JSON:

{{
 "content_markdown":"Detailed lesson content in markdown with explanations, examples and code snippets if needed",
 "quiz":[
   {{
      "question":"Question text",
      "options":["Option A","Option B","Option C","Option D"],
      "correct_index":0
   }}
 ]
}}

Rules:
- JSON only
- No markdown fences
- No text outside JSON
- Every question must have exactly 4 options
"""


# ---------------- IMPLEMENTATION ---------------- #

async def generate_curriculum(
    topic: str,
    difficulty: str
) -> Dict[str, Any]:

    prompt = CURRICULUM_PROMPT_TEMPLATE.format(
        topic=topic,
        difficulty=difficulty
    )

    response = get_genai_client().models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.3,
        ),
    )

    try:
        return json.loads(response.text)

    except json.JSONDecodeError:
        print("Error parsing curriculum JSON:")
        print(response.text)

        return {
            "error":"Failed to parse curriculum"
        }



async def generate_lesson_and_quiz(
    course_topic:str,
    module_title:str,
    lesson_title:str,
    difficulty:str
):

    prompt = COMBINED_LESSON_PROMPT_TEMPLATE.format(
        course_topic=course_topic,
        module_title=module_title,
        lesson_title=lesson_title,
        difficulty=difficulty
    )

    try:
        response = get_genai_client().models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )

        print(response.text)

        data = json.loads(response.text)

        if "quiz" not in data:
            data["quiz"] = []

        return data


    except Exception as e:
        print("Generation error:", e)

        return {
            "content_markdown": f"""
# {lesson_title}

## Introduction
This is fallback lesson content for {lesson_title}.

### Key Concepts
- Overview
- Examples
- Applications
""",
            "quiz":[]
        }
