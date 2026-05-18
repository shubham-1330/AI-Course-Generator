from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from app.models.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    UserCreate,
    UserResponse,
    UserInDB,
    UserUpdate,
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.api.deps import get_current_user
from app.db.database import get_database
from bson import ObjectId

router = APIRouter()
RESET_TOKEN_EXPIRE_MINUTES = 30

def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    user_db = UserInDB(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password
    )
    
    result = await db.users.insert_one(user_db.model_dump(by_alias=True, exclude_none=True))
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    return UserResponse(**created_user)

@router.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(reset_request: PasswordResetRequest):
    db = get_database()
    user = await db.users.find_one({"email": reset_request.email})
    response = {
        "message": "If an account exists for this email, a password reset link is ready."
    }

    if not user:
        return response

    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_reset_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    await db.password_reset_tokens.delete_many({"user_id": str(user["_id"])})
    await db.password_reset_tokens.insert_one({
        "user_id": str(user["_id"]),
        "token_hash": token_hash,
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.now(timezone.utc),
    })

    frontend_url = settings.FRONTEND_URL.rstrip("/")
    response["reset_url"] = f"{frontend_url}/reset-password?token={raw_token}"
    return response

@router.post("/reset-password")
async def reset_password(reset_confirm: PasswordResetConfirm):
    if len(reset_confirm.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    db = get_database()
    token_hash = hash_reset_token(reset_confirm.token)
    reset_doc = await db.password_reset_tokens.find_one({
        "token_hash": token_hash,
        "used": False,
    })

    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    expires_at = reset_doc["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user_id = ObjectId(reset_doc["user_id"])
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"hashed_password": get_password_hash(reset_confirm.password)}}
    )
    await db.password_reset_tokens.update_one(
        {"_id": reset_doc["_id"]},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )

    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    user_dict = current_user.model_dump(by_alias=True)
    user_dict["id"] = str(user_dict["_id"])
    return UserResponse(**user_dict)

@router.put("/me", response_model=UserResponse)
async def update_me(user_update: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    update_data = user_update.model_dump(exclude_unset=True)
    if update_data:
        await db.users.update_one(
            {"_id": ObjectId(str(current_user.id))},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"_id": ObjectId(str(current_user.id))})
    updated_user["id"] = str(updated_user["_id"])
    return UserResponse(**updated_user)
