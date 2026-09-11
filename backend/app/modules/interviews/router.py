from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.auth import get_current_user, require_role
from app.common.dependencies import get_db
from app.modules.auth.models import User
from app.modules.interviews.schemas import (
    InterviewCreate,
    InterviewResponse,
    InterviewStatusUpdate,
)
from app.modules.interviews.service import InterviewService

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    data: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await InterviewService.schedule_interview(db, current_user, data)


@router.get("/candidate", response_model=list[InterviewResponse])
async def get_candidate_interviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    return await InterviewService.get_candidate_interviews(db, current_user)


@router.get("/recruiter", response_model=list[InterviewResponse])
async def get_recruiter_interviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await InterviewService.get_recruiter_interviews(db, current_user)


@router.put("/{interview_id}/status", response_model=InterviewResponse)
async def update_interview_status(
    interview_id: int,
    data: InterviewStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await InterviewService.update_interview_status(
        db, current_user, interview_id, data
    )
