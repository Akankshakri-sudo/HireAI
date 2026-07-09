from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.auth import get_current_user
from app.common.dependencies import get_db
from app.modules.auth.models import User
from app.modules.candidate.schemas import (
    CandidateProfileCreate,
    CandidateProfileResponse
)
from app.modules.candidate.service import CandidateService


router = APIRouter(
    prefix="/candidate",
    tags=["Candidate"]
)


@router.post(
    "/profile",
    response_model=CandidateProfileResponse,
    status_code=201
)
async def create_profile(
    profile_data: CandidateProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CandidateService.create_profile(
        db,
        profile_data,
        current_user
    )