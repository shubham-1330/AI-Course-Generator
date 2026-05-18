from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
db = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    await client.admin.command("ping")
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    print(f"Connected to MongoDB database '{settings.DATABASE_NAME}'")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")

def get_database():
    if db is None:
        raise RuntimeError("Database is not connected")
    return db
