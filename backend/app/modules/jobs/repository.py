from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.jobs.models import Job


class JobRepository:

    @staticmethod
    async def create_job(
        db: AsyncSession,
        job: Job,
    ):
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return job
    
    @staticmethod
    async def get_active_jobs(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(Job)
            .where(Job.is_active.is_(True))
            .order_by(Job.created_at.desc())
        )

        return result.scalars().all()
    @staticmethod
    async def get_job_by_id(
        db: AsyncSession,
        job_id: int,
    ):
        result = await db.execute(
            select(Job).where(
                Job.id == job_id,
                Job.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()