from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.modules.saved_jobs.models import SavedJob
from app.modules.jobs.models import Job


class SavedJobRepository:

    @staticmethod
    async def save_job(db: AsyncSession, saved_job: SavedJob) -> SavedJob:
        db.add(saved_job)
        await db.commit()
        await db.refresh(saved_job)
        return saved_job

    @staticmethod
    async def unsave_job(
        db: AsyncSession, candidate_id: int, job_id: int
    ) -> bool:
        result = await db.execute(
            delete(SavedJob).where(
                SavedJob.candidate_id == candidate_id,
                SavedJob.job_id == job_id,
            )
        )
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_saved_jobs(
        db: AsyncSession, candidate_id: int
    ) -> list[SavedJob]:
        result = await db.execute(
            select(SavedJob)
            .options(selectinload(SavedJob.job).selectinload(Job.company))
            .where(SavedJob.candidate_id == candidate_id)
            .order_by(SavedJob.saved_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def is_saved(
        db: AsyncSession, candidate_id: int, job_id: int
    ) -> bool:
        result = await db.execute(
            select(SavedJob.id).where(
                SavedJob.candidate_id == candidate_id,
                SavedJob.job_id == job_id,
            )
        )
        return result.scalar_one_or_none() is not None
