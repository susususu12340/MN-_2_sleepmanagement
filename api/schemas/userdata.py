from datetime import datetime, timedelta, timezone
from typing import Union

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from api.database import SessionLocal, engine, Base

# 秘密鍵とアルゴリズムの設定
SECRET_KEY = "51925bf53f48364c15db67c85e470a91270415775d0a0dda032d41173cad6ff4"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# データベースURLの設定
DATABASE_URL = "sqlite:///./test.db"

# データベースモデルの定義
class UserInDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

# トークンのPydanticモデルの定義
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Union[str, None] = None

class User(BaseModel):
    id: int
    username: str
    disabled: Union[bool, None] = None

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str
