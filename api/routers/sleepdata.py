from typing import List
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from pydantic import ValidationError, BaseModel
from datetime import datetime

import api.schemas.sleepdata as sleepdata_schema

router = APIRouter()
router.sleepdatas = None
sleep_data_db = []

@router.post("/sleep-data/", response_model=sleepdata_schema.SleepData)
async def add_sleep_data(data: sleepdata_schema.SleepData):
    sleep_data_db.append(data)
    return {"message": "Sleep data added successfully"}

@router.get("/sleep-data/", response_model=List[sleepdata_schema.SleepData])
def get_sleep_data():
    return sleep_data_db