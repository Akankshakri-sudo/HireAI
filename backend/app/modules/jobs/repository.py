from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
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
            .options(selectinload(Job.company))
            .where(Job.is_active.is_(True))
            .order_by(Job.created_at.desc())
        )

        return result.scalars().all()

    @staticmethod
    async def search_jobs(
        db: AsyncSession,
        search: str | None = None,
        location: str | None = None,
        employment_type: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ):
        query = (
            select(Job)
            .options(selectinload(Job.company))
            .where(Job.is_active.is_(True))
        )

        if search:
            query = query.where(
                or_(
                    Job.title.ilike(f"%{search}%"),
                    Job.description.ilike(f"%{search}%"),
                )
            )

        if location:
            query = query.where(Job.location.ilike(f"%{location}%"))

        if employment_type:
            query = query.where(Job.employment_type == employment_type)

        query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_job_by_id(
        db: AsyncSession,
        job_id: int,
    ):
        result = await db.execute(
            select(Job)
            .options(selectinload(Job.company))
            .where(
                Job.id == job_id,
                Job.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update_job(
        db: AsyncSession,
        job: Job,
        update_data: dict,
    ):
        for key, value in update_data.items():
            setattr(job, key, value)
        
        await db.commit()
        await db.refresh(job)
        return job

    @staticmethod
    async def delete_job(
        db: AsyncSession,
        job_id: int,
    ):
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            await db.delete(job)
            await db.commit()
            return True
        return False

    @staticmethod
    async def get_jobs_by_recruiter(
        db: AsyncSession,
        recruiter_id: int,
    ):
        result = await db.execute(
            select(Job)
            .options(selectinload(Job.company))
            .where(Job.recruiter_id == recruiter_id)
            .order_by(Job.created_at.desc())
        )
        return result.scalars().all()
