from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.candidate.models import CandidateProfile
from app.modules.candidate.repository import CandidateRepository
from app.modules.candidate.schemas import CandidateProfileCreate


class CandidateService:

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        profile_data: CandidateProfileCreate,
        current_user: User
    ):
        existing_profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id
        )

        if existing_profile:
            raise HTTPException(
                status_code=400,
                detail="Candidate profile already exists"
            )

        profile = CandidateProfile(
            user_id=current_user.id,
            phone=profile_data.phone,
            college=profile_data.college,
            degree=profile_data.degree,
            graduation_year=profile_data.graduation_year,
            skills=profile_data.skills,
            experience=profile_data.experience
        )

        return await CandidateRepository.create_profile(db, profile)