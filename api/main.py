from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from api.routers import group
from api.routers import sleepdata
from api.routers import userdata

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(group.router)
app.include_router(sleepdata.router)
app.include_router(userdata.router)