from datetime import datetime, timedelta, timezone
from typing import Union

import jwt
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from api.database import SessionLocal, engine, Base
from api.schemas.userdata import *
from api.schemas.group import *

# 秘密鍵とアルゴリズムの設定
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# データベースURLの設定
DATABASE_URL = "sqlite:///./test.db"

# パスワードハッシュの設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2スキームの設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

# データベースセッションの依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# パスワード検証関数
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# パスワードハッシュ生成関数
def get_password_hash(password):
    return pwd_context.hash(password)

# ユーザー取得関数
def get_user(db: Session, username: str):
    return db.query(UserInDB).filter(UserInDB.username == username).first()

# ユーザー認証関数
def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# アクセストークン生成関数
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 現在のユーザーを取得する関数
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id: str = payload.get("id")
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(id=id, username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# 現在のアクティブユーザーを取得する関数
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# ユーザー登録エンドポイント
@router.post("/users/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = UserInDB(
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# トークンエンドポイント
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ユーザー情報取得エンドポイント
@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
