from pydantic import BaseModel, Field
from datetime import datetime

class SleepData(BaseModel):
    # user: str | None = Field("0", description="ユーザID")
    date: str | None = Field(None, description="睡眠日時(就寝日)")
    bedtime: str | None = Field(None, description="就寝時間")
    wakeup: str | None = Field(None, description="起床時間")
    sleeptime: str | None = Field(None, description="睡眠時間")

# class System(BaseModel):
#     current_id: int = Field(0, descript="Current (latest) ID")
#     messages: dict[int, Message] = Field({})

# class Response(System):
#     current_time: datetime = Field(None, description="Current server time")
#     ids: list = Field([])