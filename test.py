from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import List

from api.schemas.chat import *
from api.schemas.group import *
from api.schemas.sleepdata import *
from api.schemas.userdata import *
from api.database import SessionLocal, engine, Base

# データベース設定
DATABASE_URL = "sqlite:///./test.db"


# テスト用データを追加する関数
def add_test_data():
    db = SessionLocal()
    try:
        # テスト用のグループデータ
        group = GroupInDB(
            group_name="Test Group 1",
            hashed_password="hashedpassword"
        )
        db.add(group)
        db.commit()

        group = GroupInDB(
            group_name="Test Group 2",
            hashed_password="hashedpassword"
        )
        db.add(group)
        db.commit()

        # テスト用のユーザーデータ
        user = UserInDB(
            username="testuser 1",
            hashed_password="hashedpassword"
        )
        db.add(user)
        db.commit()

        user = UserInDB(
            username="testuser 2",
            hashed_password="hashedpassword"
        )
        db.add(user)
        db.commit()

        # テスト用のチャットデータ
        chat_data = ChatDataInDB(
            group_id=1,
            user_id=1,
            user_name="testuser 1",
            message="This is a test message 1.",
            date=datetime.now().strftime("%Y-%m-%d")
        )
        db.add(chat_data)
        db.commit()

        chat_data = ChatDataInDB(
            group_id=1,
            user_id=1,
            user_name="testuser 1",
            message="This is a test message 2.",
            date=datetime.now().strftime("%Y-%m-%d")
        )
        db.add(chat_data)
        db.commit()

        chat_data = ChatDataInDB(
            group_id=1,
            user_id=2,
            user_name="testuser 1",
            message="This is a test message 3.",
            date=datetime.now().strftime("%Y-%m-%d")
        )
        db.add(chat_data)
        db.commit()

        # テスト用の睡眠データ
        sleep_data = SleepDataInDB(
            user_id=1,
            date=datetime.now().strftime("%Y-%m-%d"),
            bedtime="22:00",
            wakeup="06:00",
            sleeptime=8
        )
        db.add(sleep_data)
        db.commit()

    finally:
        db.close()

# テスト用データの追加
if __name__ == "__main__":
    add_test_data()
    print("テストデータベースとデータの作成が完了しました。")