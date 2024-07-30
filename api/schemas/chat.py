from datetime import datetime, timedelta, timezone
from typing import Union

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, Mapped, relationship
from api.database import SessionLocal, engine, Base

# データベースURLの設定
DATABASE_URL = "sqlite:///./test.db"

# データベースモデルの定義
class ChatDataInDB(Base):
    __tablename__ = "ChatDatas"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer)
    user_id = Column(Integer)
    user_name = Column(String)
    message = Column(String)
    date = Column(String) #2024-07-12
    #weekday = Column(Integer) #月0~日6

class ChatBase(BaseModel):
    group_id: int | None = Field(None, description="グループID")
    user_id: int | None = Field(None, description="ユーザID")
    user_name: str | None = Field(None, description="ユーザ名")
    message: str | None = Field(None, description="メッセージ")

class ChatData(ChatBase):
    id: int | None = Field(None, description="プライマリーキー")
    date: str | None = Field(None, description="投稿日")

    model_config = ConfigDict(from_attributes=True)
