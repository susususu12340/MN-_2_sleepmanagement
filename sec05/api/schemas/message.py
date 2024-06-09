from pydantic import BaseModel, Field
from datetime import datetime


class MessageBase(BaseModel):
    name: str | None = Field(None, examples=["System"], description="Message from")
    message: str | None = Field(None, examples=["Default Message"], description="Message body")
    important: bool | None = Field(False, description="Important or not")


class Message(MessageBase):
    id: int | None = Field(None, description="Message ID")
    time: datetime | None = Field(None, description="Message post time")
    update_time: datetime | None = Field(None, description="Message update time")


class System(BaseModel):
    current_id: int = Field(0, descript="Current (latest) ID")
    messages: dict[int, Message] = Field({})


class Response(System):
    current_time: datetime = Field(None, description="Current server time")
    ids: list = Field([])
