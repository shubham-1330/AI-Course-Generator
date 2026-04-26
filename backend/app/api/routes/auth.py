from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse, UserInDB, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from app.db.database import get_database
from bson import ObjectId

router = APIRouter()

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
