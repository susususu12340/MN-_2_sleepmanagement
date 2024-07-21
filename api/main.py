from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from api.routers import group
from api.routers import chat
from api.routers import sleepdata
from api.routers import userdata

import api.schemas.group
import api.schemas.chat
import api.schemas.userdata 
import api.schemas.sleepdata
import api.association

from api.database import *

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://172.16.15.35:3000"],
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(group.router)
app.include_router(sleepdata.router)
app.include_router(userdata.router)
app.include_router(group.router)
app.include_router(chat.router)