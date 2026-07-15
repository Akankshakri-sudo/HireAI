from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.auth import require_role
from app.common.dependencies import get_db
from app.modules.auth.models import User
from app.modules.recruiter.schemas import (
    CompanyCreate,
    CompanyResponse,
    RecruiterProfileCreate,
    RecruiterProfileResponse,
)
from app.modules.recruiter.service import RecruiterService


router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"],
)


@router.post(
    "/company",
    response_model=CompanyResponse,
    status_code=201,
)
async def create_company(
    company_data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
   current_user: User = Depends(require_role("recruiter"))
):
    return await RecruiterService.create_company(
        db,
        company_data,
    )


@router.post(
    "/profile",
    response_model=RecruiterProfileResponse,
    status_code=201,
)
async def create_recruiter_profile(
    profile_data: RecruiterProfileCreate,
    db: AsyncSession = Depends(get_db),
   current_user: User = Depends(require_role("recruiter"))
):
    return await RecruiterService.create_profile(
        db,
        profile_data,
        current_user,
    )