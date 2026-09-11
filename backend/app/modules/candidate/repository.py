from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.candidate.models import (
    Candidate,
    Resume,
    ResumeAnalysis,
)


class CandidateRepository:

    @staticmethod
    async def get_profile_by_user_id(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(Candidate).where(Candidate.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_profile_by_id(db: AsyncSession, candidate_id: int):
        result = await db.execute(
            select(Candidate).where(Candidate.id == candidate_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_profile(db: AsyncSession, profile: Candidate):
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        profile: Candidate,
        update_data: dict,
    ):
        for key, value in update_data.items():
            setattr(profile, key, value)

        await db.commit()
        await db.refresh(profile)

        return profile

    @staticmethod
    async def get_resume_analysis(
        db: AsyncSession,
        candidate_id: int,
    ):
        result = await db.execute(
            select(ResumeAnalysis)
            .join(Resume, ResumeAnalysis.resume_id == Resume.id)
            .where(Resume.candidate_id == candidate_id)
            .order_by(Resume.uploaded_at.desc())
        )
        return result.scalars().first()

    @staticmethod
    async def save_resume_analysis(
        db: AsyncSession,
        resume_id: int,
        extracted_text: str,
        skills: list[str],
        ats_score: float | None = None,
        education: str | None = None,
        experience: str | None = None,
        suggestions: str | None = None,
    ):
        result = await db.execute(
            select(ResumeAnalysis).where(ResumeAnalysis.resume_id == resume_id)
        )
        analysis = result.scalar_one_or_none()

        if analysis:
            analysis.extracted_text = extracted_text
            analysis.skills = skills
            analysis.total_skills_found = len(skills)
            analysis.ats_score = ats_score
            analysis.education = education
            analysis.experience = experience
            analysis.suggestions = suggestions
        else:
            analysis = ResumeAnalysis(
                resume_id=resume_id,
                extracted_text=extracted_text,
                skills=skills,
                total_skills_found=len(skills),
                ats_score=ats_score,
                education=education,
                experience=experience,
                suggestions=suggestions,
            )
            db.add(analysis)

        await db.commit()
        await db.refresh(analysis)
        return analysis

    @staticmethod
    async def create_resume(db: AsyncSession, resume: Resume):
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        return resume

    @staticmethod
    async def get_latest_resume(db: AsyncSession, candidate_id: int):
        result = await db.execute(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .order_by(Resume.uploaded_at.desc())
        )
        return result.scalars().first()
