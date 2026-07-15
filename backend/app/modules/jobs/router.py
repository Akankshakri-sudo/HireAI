from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.auth import require_role
from app.common.dependencies import get_db
from app.modules.auth.models import User
from app.modules.jobs.schemas import (
    JobCreate,
    JobMatchResponse,
    JobResponse,
)
from app.modules.jobs.service import JobService


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post(
    "",
    response_model=JobResponse,
    status_code=201,
)
async def create_job(
    job_data: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await JobService.create_job(
        db,
        job_data,
        current_user,
    )


@router.get(
    "",
    response_model=list[JobResponse],
)
async def get_jobs(
    db: AsyncSession = Depends(get_db),
):
    return await JobService.get_active_jobs(db)


@router.get(
    "/{job_id}/match",
    response_model=JobMatchResponse,
)
async def match_job_with_candidate(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    return await JobService.match_job_with_candidate(
        db=db,
        job_id=job_id,
        current_user=current_user,
    )


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
async def get_job_by_id(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await JobService.get_job_by_id(
        db,
        job_id,
    )