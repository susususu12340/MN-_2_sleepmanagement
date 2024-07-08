from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional


app = FastAPI()

origins = [
    "http://localhost:3000",  # ReactアプリケーションのURL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB設定
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.sleeptracker
users_collection = db.users

# パスワードハッシュ化設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT設定
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# JWTトークン生成
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ユーザーモデル
class UserInDB(BaseModel):
    username: str
    hashed_password: str

class User(BaseModel):
    username: str

class UserCreate(BaseModel):
    username: str
    password: str

# スリープデータ用モデル
class SleepData(BaseModel):
    user_id: str
    sleep_time: datetime
    wake_time: datetime
    sleep_duration: Optional[float] = None

# パスワードの検証
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# パスワードのハッシュ化
def get_password_hash(password):
    return pwd_context.hash(password)

# ユーザー検索
async def get_user(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        return UserInDB(**user)
    return None

# ユーザー認証
async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

# OAuth2PasswordBearer設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# トークンから現在のユーザーを取得
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user(username)
    if user is None:
        raise credentials_exception
    return user

# ユーザー登録エンドポイント
@app.post("/register", response_model=User)
async def register(user: UserCreate):
    try:
        hashed_password = get_password_hash(user.password)
        user_data = user.dict()
        user_data["hashed_password"] = hashed_password
        del user_data["password"]
        await users_collection.insert_one(user_data)
        return User(username=user.username)
    except Exception as e:
        print(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# トークン発行エンドポイント
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# テスト用のエンドポイント
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# スリープデータ保存エンドポイント
@app.post("/sleepdata")
async def create_sleep_data(sleep_data: SleepData, current_user: User = Depends(get_current_user)):
    sleep_duration = (sleep_data.wake_time - sleep_data.sleep_time).total_seconds() / 3600
    sleep_data.sleep_duration = sleep_duration
    sleep_data_dict = sleep_data.dict()
    sleep_data_dict["user_id"] = current_user.username
    await db.sleepdata.insert_one(sleep_data_dict)
    return {"message": "Sleep data saved successfully"}

# スリープデータ取得エンドポイント
@app.get("/sleepdata")
async def get_sleep_data(current_user: User = Depends(get_current_user)):
    sleep_data = await db.sleepdata.find({"user_id": current_user.username}).to_list(None)
    return sleep_data
