from contextlib import asynccontextmanager
from app.modules.auth.router import router as auth_router
from app.modules.candidate.router import router as candidate_router
from fastapi import FastAPI

from app.core.config import settings
from app.database.init_db import init_db
from app.modules.recruiter.router import router as recruiter_router
from app.modules.jobs.router import router as jobs_router
from app.modules.applications.router import (
    router as applications_router,
)
from app.modules.saved_jobs.router import router as saved_jobs_router
from app.modules.notifications.router import router as notifications_router
from app.modules.interviews.router import router as interviews_router
from app.modules.admin.router import router as admin_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Recruitment Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(candidate_router)
app.include_router(recruiter_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(saved_jobs_router)
app.include_router(notifications_router)
app.include_router(interviews_router)
app.include_router(admin_router)
@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "debug": settings.DEBUG
    }