from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.candidate.repository import CandidateRepository
from app.modules.saved_jobs.models import SavedJob
from app.modules.saved_jobs.repository import SavedJobRepository
from app.modules.jobs.repository import JobRepository


class SavedJobService:

    @staticmethod
    async def save_job(db: AsyncSession, current_user: User, job_id: int):
        profile = await CandidateRepository.get_profile_by_user_id(
            db, current_user.id
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Candidate profile not found")

        job = await JobRepository.get_job_by_id(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        already_saved = await SavedJobRepository.is_saved(db, profile.id, job_id)
        if already_saved:
            raise HTTPException(status_code=409, detail="Job already saved")

        saved = SavedJob(candidate_id=profile.id, job_id=job_id)
        return await SavedJobRepository.save_job(db, saved)

    @staticmethod
    async def unsave_job(db: AsyncSession, current_user: User, job_id: int):
        profile = await CandidateRepository.get_profile_by_user_id(
            db, current_user.id
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Candidate profile not found")

        removed = await SavedJobRepository.unsave_job(db, profile.id, job_id)
        if not removed:
            raise HTTPException(status_code=404, detail="Saved job not found")
        return {"detail": "Job unsaved successfully"}

    @staticmethod
    async def get_saved_jobs(db: AsyncSession, current_user: User):
        profile = await CandidateRepository.get_profile_by_user_id(
            db, current_user.id
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Candidate profile not found")

        saved_jobs = await SavedJobRepository.get_saved_jobs(db, profile.id)

        return [
            {
                "id": sj.id,
                "job_id": sj.job.id,
                "job_title": sj.job.title,
                "company_name": sj.job.company.company_name if sj.job.company else None,
                "location": sj.job.location,
                "employment_type": sj.job.employment_type,
                "salary_min": sj.job.salary_min,
                "salary_max": sj.job.salary_max,
                "skills_required": sj.job.skills_required,
                "saved_at": sj.saved_at,
            }
            for sj in saved_jobs
        ]
