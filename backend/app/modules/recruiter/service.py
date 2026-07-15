from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.recruiter.models import (
    Company,
    RecruiterProfile,
)
from app.modules.recruiter.repository import RecruiterRepository
from app.modules.recruiter.schemas import (
    CompanyCreate,
    RecruiterProfileCreate,
)


class RecruiterService:

    @staticmethod
    async def create_company(
        db: AsyncSession,
        company_data: CompanyCreate,
    ):
        existing_company = await RecruiterRepository.get_company_by_name(
            db,
            company_data.name,
        )

        if existing_company:
            raise HTTPException(
                status_code=400,
                detail="Company already exists",
            )

        company = Company(
            name=company_data.name,
            website=company_data.website,
            industry=company_data.industry,
            location=company_data.location,
            description=company_data.description,
        )

        return await RecruiterRepository.create_company(
            db,
            company,
        )

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        profile_data: RecruiterProfileCreate,
        current_user: User,
    ):
        existing_profile = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if existing_profile:
            raise HTTPException(
                status_code=400,
                detail="Recruiter profile already exists",
            )

        company = await RecruiterRepository.get_company_by_id(
            db,
            profile_data.company_id,
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

        profile = RecruiterProfile(
            user_id=current_user.id,
            company_id=profile_data.company_id,
            designation=profile_data.designation,
            phone=profile_data.phone,
        )

        return await RecruiterRepository.create_profile(
            db,
            profile,
        )