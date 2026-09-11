from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.common.auth import get_current_user
from app.modules.auth.models import User
from app.modules.saved_jobs.service import SavedJobService

router = APIRouter(
    prefix="/saved-jobs",
    tags=["Saved Jobs"],
)


@router.post("/{job_id}", status_code=201)
async def save_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await SavedJobService.save_job(db, current_user, job_id)


@router.delete("/{job_id}")
async def unsave_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await SavedJobService.unsave_job(db, current_user, job_id)


@router.get("")
async def get_saved_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await SavedJobService.get_saved_jobs(db, current_user)
