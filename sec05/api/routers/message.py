from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from pydantic import ValidationError
from datetime import datetime

import api.schemas.message as message_schema
from api.misc.lock import lock, unlock

router = APIRouter()

app = router
router.system = None


def load():
    try:
        lock()
        with open("data.json", "rt", encoding="utf-8") as f:
            router.system = message_schema.System.parse_raw(f.read())
    except (FileNotFoundError, ValidationError):
        # ファイルが存在しない or ファイルがうまく読めない
        # →Default の System Data を作成する
        router.system = message_schema.System()
    finally:
        unlock()


async def save():
    print("saving...")
    try:
        lock()
        with open("data.json", "wt", encoding="utf-8") as f:
            f.write(router.system.model_dump_json(indent=4))
    finally:
        unlock()


@router.get("/messages", response_model=message_schema.Response)
async def get_messages(from_id: int = 1, to_id: int | None = None,
                       from_time: datetime | None = None,
                       important: bool | None = None,
                       ids_only: bool = False):
    """全ての message を返す"""
    if from_id is None or from_id < 1:
        from_id = 1
    if to_id is None:
        to_id = router.system.current_id
    l: list = []
    for i in range(from_id, to_id + 1):
        if i in router.system.messages:
            if from_time is None or \
               from_time <= router.system.messages[i].update_time:
                if important is None:
                    l.append(i)
                elif router.system.messages[i].important == important:
                    l.append(i)

    if ids_only:
        return message_schema.Response(
            current_id=router.system.current_id,
            current_time=datetime.now(),
            ids=l)

    return message_schema.Response(
        current_id=router.system.current_id,
        current_time=datetime.now(),
        messages={i: router.system.messages[i] for i in l})


@router.get("/messages/current_id")
async def get_messages_current_id():
    return {"current_id": router.system.current_id}


@router.post("/messages", response_model=message_schema.Message)
async def post_message(message: message_schema.MessageBase):
    """message のPOST"""
    next_id = app.system.current_id + 1
    time = datetime.now()
    m = message_schema.Message(time=time, update_time=time, id=next_id,
                               **message.dict())
    router.system.messages[next_id] = m
    app.system.current_id = next_id
    return m


@router.get("/messages/{message_id}", response_model=message_schema.Message)
async def get_message(message_id: int):
    """個別 message のGET"""
    # 該当 ID の message が存在しない場合は 404 を返す(他の関数でも同様)
    if message_id not in router.system.messages:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")

    return router.system.messages[message_id]


@router.put("/messages/{message_id}", response_model=message_schema.Message)
async def put_message(message_id: int, message: message_schema.MessageBase):
    """message のPUT"""
    if message_id not in router.system.messages:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")

    orig = router.system.messages[message_id]
    m = message_schema.Message(time=orig.time,
                               update_time=datetime.now(),
                               id=message_id,
                               **message.dict())
    router.system.messages[message_id] = m
    return m


@router.delete("/messages/{message_id}")
async def delete_message(message_id: int):
    """message のDELETE"""
    if message_id not in router.system.messages:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")

    del router.system.messages[message_id]
    return {"success": True}


@router.get("/messages/{message_id}/important")
async def get_message_important(message_id: int):
    """message imporant flag の GET """
    if message_id not in router.system.messages:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")

    return {"important": router.system.messages[message_id].important}


@router.put("/messages/{message_id}/important")
async def put_message_important(message_id: int):
    """message imporant flag の PUT (important = True)"""
    if message_id not in router.system.messages:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")

    router.system.messages[message_id].update_time = datetime.now()
    router.system.messages[message_id].important = True
    return {"success": True}


@router.delete("/messages/{message_id}/important")
async def delete_message_important(message_id: int):
    """message imporant flag の DELETE (important = False)"""
    if message_id not in router.system.messages:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")

    router.system.messages[message_id].update_time = datetime.now()
    router.system.messages[message_id].important = False
    return {"success": True}


@app.on_event("startup")
async def event_startup():
    load()


@app.on_event("shutdown")
async def event_shutdown():
    await save()
