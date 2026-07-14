from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.candidate.models import (
    CandidateProfile,
    ResumeAnalysis,
)

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
    
    @staticmethod
    async def update_resume_path(
        db: AsyncSession,
        profile: CandidateProfile,
        resume_path: str
    ):
        profile.resume_path = resume_path

        await db.commit()
        await db.refresh(profile)

        return profile
    @staticmethod
    async def get_resume_analysis(
        db: AsyncSession,
        candidate_profile_id: int,
    ):
        result = await db.execute(
            select(ResumeAnalysis).where(
                ResumeAnalysis.candidate_profile_id
                == candidate_profile_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def save_resume_analysis(
        db: AsyncSession,
        candidate_profile_id: int,
        resume_path: str,
        extracted_text: str,
        skills: list[str],
    ):
        analysis = await CandidateRepository.get_resume_analysis(
            db,
            candidate_profile_id,
        )

        if analysis:
            analysis.resume_path = resume_path
            analysis.extracted_text = extracted_text
            analysis.skills = skills
            analysis.total_skills_found = len(skills)
        else:
            analysis = ResumeAnalysis(
                candidate_profile_id=candidate_profile_id,
                resume_path=resume_path,
                extracted_text=extracted_text,
                skills=skills,
                total_skills_found=len(skills),
            )
            db.add(analysis)

        await db.commit()
        await db.refresh(analysis)

        return analysis