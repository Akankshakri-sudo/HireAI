from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.applications.models import Application
from app.modules.auth.models import User
from app.modules.candidate.models import Candidate
from app.modules.jobs.models import Job
from app.modules.recruiter.models import Company, Recruiter


class AdminRepository:
    @staticmethod
    async def get_stats(db: AsyncSession) -> dict:
        total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
        total_candidates = (
            await db.execute(select(func.count(Candidate.id)))
        ).scalar() or 0
        total_recruiters = (
            await db.execute(select(func.count(Recruiter.id)))
        ).scalar() or 0
        total_jobs = (await db.execute(select(func.count(Job.id)))).scalar() or 0
        active_jobs = (
            await db.execute(select(func.count(Job.id)).where(Job.is_active.is_(True)))
        ).scalar() or 0
        total_apps = (
            await db.execute(select(func.count(Application.id)))
        ).scalar() or 0

        # Status breakdown
        status_query = select(Application.status, func.count(Application.id)).group_by(
            Application.status
        )
        status_res = (await db.execute(status_query)).all()
        status_breakdown = {status: count for status, count in status_res}

        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_users = (
            await db.execute(
                select(func.count(User.id)).where(User.created_at >= week_ago)
            )
        ).scalar() or 0
        recent_apps = (
            await db.execute(
                select(func.count(Application.id)).where(
                    Application.applied_at >= week_ago
                )
            )
        ).scalar() or 0

        return {
            "total_users": total_users,
            "total_candidates": total_candidates,
            "total_recruiters": total_recruiters,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_apps,
            "status_breakdown": status_breakdown,
            "recent_users_count_7d": recent_users,
            "recent_applications_count_7d": recent_apps,
        }

    @staticmethod
    async def get_users(
        db: AsyncSession,
        search: str | None = None,
        role: str | None = None,
        is_active: bool | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[User]:
        query = select(User)
        if search:
            query = query.where(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )
        if role:
            query = query.where(User.role == role)
        if is_active is not None:
            query = query.where(User.is_active == is_active)

        query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def update_user_status(
        db: AsyncSession, user_id: int, is_active: bool
    ) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.is_active = is_active
            await db.commit()
            await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: int) -> bool:
        result = await db.execute(delete(User).where(User.id == user_id))
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_jobs_with_details(
        db: AsyncSession,
        search: str | None = None,
        is_active: bool | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[tuple[Job, int]]:
        query = (
            select(
                Job,
                func.count(Application.id).label("apps_count"),
            )
            .outerjoin(Application, Application.job_id == Job.id)
            .options(
                selectinload(Job.company),
                selectinload(Job.recruiter).selectinload(Recruiter.user),
            )
            .group_by(Job.id)
        )
        if search:
            query = query.where(
                or_(
                    Job.title.ilike(f"%{search}%"),
                    Job.description.ilike(f"%{search}%"),
                )
            )
        if is_active is not None:
            query = query.where(Job.is_active == is_active)

        query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
        res = await db.execute(query)
        return res.all()

    @staticmethod
    async def toggle_job_status(db: AsyncSession, job_id: int) -> Job | None:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            job.is_active = not job.is_active
            await db.commit()
            await db.refresh(job)
        return job

    @staticmethod
    async def delete_job(db: AsyncSession, job_id: int) -> bool:
        result = await db.execute(delete(Job).where(Job.id == job_id))
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_all_applications(
        db: AsyncSession, skip: int = 0, limit: int = 50
    ) -> list[Application]:
        query = (
            select(Application)
            .options(
                selectinload(Application.candidate).selectinload(Candidate.user),
                selectinload(Application.job).selectinload(Job.company),
            )
            .order_by(Application.applied_at.desc())
            .offset(skip)
            .limit(limit)
        )
        res = await db.execute(query)
        return list(res.scalars().all())
