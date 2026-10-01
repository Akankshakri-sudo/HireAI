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
    RecruiterProfileDetailResponse,
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


@router.get(
    "/profile",
    response_model=RecruiterProfileDetailResponse,
)
async def get_recruiter_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await RecruiterService.get_profile(
        db,
        current_user,
    )


@router.put(
    "/profile",
    response_model=RecruiterProfileResponse,
)
async def update_recruiter_profile(
    profile_data: RecruiterProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await RecruiterService.update_profile(
        db,
        profile_data,
        current_user,
    )


@router.put(
    "/company/{company_id}",
    response_model=CompanyResponse,
)
async def update_company(
    company_id: int,
    company_data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await RecruiterService.update_company(
        db,
        company_id,
        company_data,
        current_user,
    )


@router.get(
    "/companies",
    response_model=list[CompanyResponse],
)
async def get_companies(
    db: AsyncSession = Depends(get_db),
):
    return await RecruiterService.get_companies(db)