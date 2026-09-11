from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.common.auth import require_role
from app.common.dependencies import get_db
from app.modules.auth.models import User
from app.modules.jobs.schemas import (
    JobCreate,
    JobUpdate,
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
    search: Optional[str] = Query(None, description="Search in title/description"),
    location: Optional[str] = Query(None, description="Filter by location"),
    employment_type: Optional[str] = Query(None, description="Filter by type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    return await JobService.search_jobs(
        db,
        search=search,
        location=location,
        employment_type=employment_type,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/my",
    response_model=list[JobResponse],
)
async def get_my_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await JobService.get_recruiter_jobs(db, current_user)


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


@router.put(
    "/{job_id}",
    response_model=JobResponse,
)
async def update_job(
    job_id: int,
    job_data: JobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await JobService.update_job_service(
        db,
        job_id,
        job_data,
        current_user,
    )


@router.delete(
    "/{job_id}",
)
async def delete_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await JobService.delete_job_service(
        db,
        job_id,
        current_user,
    )