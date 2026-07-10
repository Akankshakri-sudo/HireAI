from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.common.auth import get_current_user

from app.modules.auth.models import User

from app.modules.candidate.schemas import (
    CandidateProfileCreate,
    CandidateProfileResponse,
    ResumeParseResponse,
    ResumeAnalysisResponse,
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


@router.get(
    "/profile",
    response_model=CandidateProfileResponse
)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CandidateService.get_profile(
        db,
        current_user
    )
    
@router.post(
    "/resume",
    response_model=CandidateProfileResponse
)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CandidateService.upload_resume(
        db,
        current_user,
        file
    )
@router.post(
    "/resume/parse",
    response_model=ResumeParseResponse
)
async def parse_resume(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CandidateService.parse_resume(
        db,
        current_user
    )
@router.post(
    "/resume/analyze",
    response_model=ResumeAnalysisResponse,
)
async def analyze_resume(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await CandidateService.analyze_resume(
        db,
        current_user,
    )