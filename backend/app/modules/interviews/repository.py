from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.applications.models import Application
from app.modules.candidate.models import Candidate
from app.modules.interviews.models import Interview
from app.modules.jobs.models import Job
from app.modules.recruiter.models import Recruiter


class InterviewRepository:
    @staticmethod
    async def create(db: AsyncSession, interview: Interview) -> Interview:
        db.add(interview)
        await db.commit()
        await db.refresh(interview)
        return interview

    @staticmethod
    async def get_by_id(db: AsyncSession, interview_id: int) -> Interview | None:
        result = await db.execute(
            select(Interview)
            .options(
                selectinload(Interview.application).selectinload(Application.job).selectinload(Job.company),
                selectinload(Interview.candidate).selectinload(Candidate.user),
                selectinload(Interview.recruiter).selectinload(Recruiter.user),
            )
            .where(Interview.id == interview_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_candidate(db: AsyncSession, candidate_id: int) -> list[Interview]:
        result = await db.execute(
            select(Interview)
            .options(
                selectinload(Interview.application).selectinload(Application.job).selectinload(Job.company),
                selectinload(Interview.candidate).selectinload(Candidate.user),
                selectinload(Interview.recruiter).selectinload(Recruiter.user),
            )
            .where(Interview.candidate_id == candidate_id)
            .order_by(Interview.scheduled_at.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_recruiter(db: AsyncSession, recruiter_id: int) -> list[Interview]:
        result = await db.execute(
            select(Interview)
            .options(
                selectinload(Interview.application).selectinload(Application.job).selectinload(Job.company),
                selectinload(Interview.candidate).selectinload(Candidate.user),
                selectinload(Interview.recruiter).selectinload(Recruiter.user),
            )
            .where(Interview.recruiter_id == recruiter_id)
            .order_by(Interview.scheduled_at.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_status(
        db: AsyncSession, interview: Interview, status: str, notes: str | None = None
    ) -> Interview:
        interview.status = status
        if notes:
            interview.notes = notes
        await db.commit()
        await db.refresh(interview)
        return interview
