@echo off
cd backend
echo Starting the AI Course Generator Backend...
call .\venv\Scripts\activate.bat
uvicorn app.main:app --reload
pause
