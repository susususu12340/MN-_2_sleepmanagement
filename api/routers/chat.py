from typing import List
from fastapi import APIRouter, Depends, Request, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError, BaseModel
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, Column, String, Integer, and_

from api.schemas.chat import *
from api.database import SessionLocal, engine, Base

t_delta = timedelta(hours=9)  # 9時間
JST = timezone(t_delta, 'JST')

router = APIRouter()
router.chat = None
sleep_data_db = []

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# WebSocket manager to manage active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.post("/chats/", response_model=ChatData)
async def create_chat(chat: ChatBase, db: Session = Depends(get_db)):
    db_chat = ChatDataInDB(
        group_id=chat.group_id,
        user_id=chat.user_id,
        user_name=chat.user_name,
        message=chat.message,
        date=datetime.now(JST).isoformat()
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    await manager.broadcast(f"New message in group {chat.group_id}: {chat.message}")
    return db_chat

@router.get("/chats/{group_id}", response_model=List[ChatData])
def read_chats(group_id: int, db: Session = Depends(get_db)):
    chats = db.query(ChatDataInDB).filter(ChatDataInDB.group_id == group_id).all()
    return chats

@router.websocket("/ws/{group_id}")
async def websocket_endpoint(websocket: WebSocket, group_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message to group {group_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
