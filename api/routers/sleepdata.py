from typing import List
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from pydantic import ValidationError, BaseModel
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, and_

from api.schemas.sleepdata import *
from api.schemas.userdata import *

router = APIRouter()
router.sleepdatas = None
sleep_data_db = []

# OAuth2スキームの設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# データベースURLの設定
DATABASE_URL = "sqlite:///./test.db"

# データベースセッションの依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ユーザー取得関数
def get_user(db: Session, id: int, username: str):
    return db.query(UserInDB).filter(and_(UserInDB.id == id, UserInDB.username == username)).first()

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

# IDと睡眠日時から睡眠データ取得関数
def get_sleepdata(db: Session, date: str, user_id: int):
    return db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == date)).first()

@router.post("/sleep-data/", response_model=SleepData)
def add_sleep_data(sleepdata: SleepData, db: Session = Depends(get_db)):

    db_sleepdata = get_sleepdata(db, date=sleepdata.date, user_id=sleepdata.user_id)

    if db_sleepdata:
        db_sleepdata.bedtime = sleepdata.bedtime
        db_sleepdata.wakeup = sleepdata.wakeup
        db_sleepdata.sleeptime = sleepdata.sleeptime
    else:
        db_sleepdata = SleepDataInDB(
            parent_id = sleepdata.user_id,
            date = sleepdata.date,
            bedtime = sleepdata.bedtime,
            wakeup = sleepdata.wakeup,
            sleeptime = sleepdata.sleeptime
        )
    db.add(db_sleepdata)
    db.commit()
    db.refresh(db_sleepdata)
    return db_sleepdata

@router.get("/sleep-data/", response_model=SleepData)
def get_sleep_data(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id)).all()

@router.get("/sleep-data/4days", response_model=List[SleepData])
def get_sleep_data_4days(user_id: int, date: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):

    tdatetime = datetime.strptime(date, '%Y-%m-%d')
    tdate = datetime.date(tdatetime.year, tdatetime.month, tdatetime.day)

    t1 = tdate + datetime.timedelta(days=-1)
    t2 = tdate + datetime.timedelta(days=-2)
    t3 = tdate + datetime.timedelta(days=-3)

    sleep_data_list = [
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == date)),
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == t1.strftime('%Y-%m-%d'))),
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == t2.strftime('%Y-%m-%d'))),
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == t3.strftime('%Y-%m-%d')))
    ]

    return sleep_data_list

@router.get("/sleep-data/week", response_model=List[SleepData])
def get_sleep_data_week(user_id: int, date: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):

    tdatetime = datetime.strptime(date, '%Y-%m-%d')
    t1 = tdatetime + datetime.timedelta(days=-1)
    t2 = tdatetime + datetime.timedelta(days=-2)
    t3 = tdatetime + datetime.timedelta(days=-3)

    sleep_data_list = [
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == date)),
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == t1)),
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == t2)),
        db.query(SleepDataInDB).filter(and_(SleepDataInDB.parent_id == user_id, SleepDataInDB.date == t3))
    ]

    return sleep_data_db