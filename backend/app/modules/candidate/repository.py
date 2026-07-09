from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.candidate.models import CandidateProfile


class CandidateRepository:

    @staticmethod
    async def get_profile_by_user_id(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_profile(db: AsyncSession, profile: CandidateProfile):
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile