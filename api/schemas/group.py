from typing import Union, List

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from api.database import SessionLocal, engine, Base
from api.association import association_table

# 秘密鍵とアルゴリズムの設定
SECRET_KEY = "51925bf53f48364c15db67c85e470a91270415775d0a0dda032d41173cad6ff4"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# データベースURLの設定
DATABASE_URL = "sqlite:///./test.db"

class GroupInDB(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

    users = relationship("User_InGroupDB", secondary=association_table, backref="groups")

# データベースモデルの定義
class User_InGroupDB(Base):
    __tablename__ = "users_InGroupDB"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String, index=True)

class user_in_group(BaseModel):
    id: int
    user_id: int
    username: str

    class Config:
        orm_mode = True

class GroupBase(BaseModel):
    group_name: str
    hashed_password: str

class GroupCreate(GroupBase):
    user_id: int
    username: str

class GroupMove(GroupBase):
    user_id: int

class Group(GroupBase):
    id: int
    disabled: Union[bool, None] = None
    users: List[user_in_group] = []

    class Config:
        orm_mode = True

class UserRead(BaseModel):
    id: int
    username: str


# class GroupCreate(BaseModel):
#     username: str
#     password: str

# # トークンのPydanticモデルの定義
# class GroupToken(BaseModel):
#     access_token: str
#     token_type: str

# class GroupTokenData(BaseModel):
#     id: int
#     username: Union[str, None] = None