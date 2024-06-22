from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from api.routers import group
from api.routers import sleepdata
from api.routers import user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['null'],
    allow_methods=['*'],
)

# app.include_router(group.router)
app.include_router(sleepdata.router)
# app.include_router(user.router)