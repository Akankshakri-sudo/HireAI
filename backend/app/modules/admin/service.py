from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.admin.repository import AdminRepository
from app.modules.admin.schemas import (
    AdminApplicationResponse,
    AdminJobResponse,
    AdminStatsResponse,
    AdminUserResponse,
)


class AdminService:
    @staticmethod
    async def get_stats(db: AsyncSession) -> AdminStatsResponse:
        data = await AdminRepository.get_stats(db)
        return AdminStatsResponse(**data)

    @staticmethod
    async def get_users(
        db: AsyncSession,
        search: str | None = None,
        role: str | None = None,
        is_active: bool | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AdminUserResponse]:
        users = await AdminRepository.get_users(
            db, search, role, is_active, skip, limit
        )
        return [
            AdminUserResponse(
                id=u.id,
                full_name=u.name or u.email,
                email=u.email,
                role=u.role,
                is_active=u.is_active,
                created_at=u.created_at,
            )
            for u in users
        ]

    @staticmethod
    async def update_user_status(
        db: AsyncSession, user_id: int, is_active: bool
    ) -> AdminUserResponse:
        user = await AdminRepository.update_user_status(db, user_id, is_active)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return AdminUserResponse(
            id=user.id,
            full_name=user.name or user.email,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: int) -> dict:
        success = await AdminRepository.delete_user(db, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return {"message": "User deleted successfully"}

    @staticmethod
    async def get_jobs(
        db: AsyncSession,
        search: str | None = None,
        is_active: bool | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AdminJobResponse]:
        rows = await AdminRepository.get_jobs_with_details(
            db, search, is_active, skip, limit
        )
        results = []
        for job, count in rows:
            recruiter_name = None
            recruiter_email = None
            if job.recruiter and job.recruiter.user:
                recruiter_name = job.recruiter.user.name or job.recruiter.user.email
                recruiter_email = job.recruiter.user.email
            company_name = job.company.company_name if job.company else None

            results.append(
                AdminJobResponse(
                    id=job.id,
                    title=job.title,
                    company_name=company_name,
                    recruiter_name=recruiter_name,
                    recruiter_email=recruiter_email,
                    location=job.location,
                    employment_type=job.employment_type,
                    is_active=job.is_active,
                    applications_count=count,
                    created_at=job.created_at,
                )
            )
        return results

    @staticmethod
    async def toggle_job_status(db: AsyncSession, job_id: int) -> dict:
        job = await AdminRepository.toggle_job_status(db, job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
            )
        return {
            "message": f"Job status updated to {'active' if job.is_active else 'inactive'}",
            "is_active": job.is_active,
        }

    @staticmethod
    async def delete_job(db: AsyncSession, job_id: int) -> dict:
        success = await AdminRepository.delete_job(db, job_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
            )
        return {"message": "Job deleted successfully"}

    @staticmethod
    async def get_all_applications(
        db: AsyncSession, skip: int = 0, limit: int = 50
    ) -> list[AdminApplicationResponse]:
        apps = await AdminRepository.get_all_applications(db, skip, limit)
        results = []
        for a in apps:
            cand_name = "Anonymous"
            cand_email = ""
            if a.candidate and a.candidate.user:
                cand_name = a.candidate.user.name or a.candidate.user.email
                cand_email = a.candidate.user.email

            job_title = a.job.title if a.job else "Unknown Job"
            company_name = (
                a.job.company.company_name
                if a.job and a.job.company
                else "Confidential"
            )

            results.append(
                AdminApplicationResponse(
                    id=a.id,
                    candidate_name=cand_name,
                    candidate_email=cand_email,
                    job_title=job_title,
                    company_name=company_name,
                    status=a.status,
                    ai_match_score=a.ai_match_score,
                    applied_at=a.applied_at,
                )
            )
        return results
