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
class SleepDataInDB(Base):
    __tablename__ = "SleepDatas"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    date = Column(String) #2024-07-12
    bedtime = Column(String) #2024-07-12T22:03
    wakeup = Column(String) #2024-07-12T22:03
    sleeptime = Column(Integer) #9
    #weekday = Column(Integer) #月0~日6

class SleepBase(BaseModel):
    user_id: int | None = Field(None, description="ユーザID")
    date: str | None = Field(None, description="睡眠日時(就寝日)")
    bedtime: str | None = Field(None, description="就寝時間")
    wakeup: str | None = Field(None, description="起床時間")
    sleeptime: int | None = Field(None, description="睡眠時間")

class SleepData(SleepBase):
    id: int | None = Field(None, description="プライマリーキー")

    model_config = ConfigDict(from_attributes=True)

# class System(BaseModel):
#     current_id: int = Field(0, descript="Current (latest) ID")
#     messages: dict[int, Message] = Field({})

# class Response(System):
#     current_time: datetime = Field(None, description="Current server time")
#     ids: list = Field([])