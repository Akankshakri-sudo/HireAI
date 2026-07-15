from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.jobs.models import Job
from app.modules.jobs.repository import JobRepository
from app.modules.jobs.schemas import JobCreate
from app.modules.recruiter.repository import RecruiterRepository
from app.modules.candidate.ats_calculator import calculate_ats_score
from app.modules.candidate.repository import CandidateRepository

class JobService:

    @staticmethod
    async def create_job(
        db: AsyncSession,
        job_data: JobCreate,
        current_user: User,
    ):
        recruiter_profile = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not recruiter_profile:
            raise HTTPException(
                status_code=404,
                detail="Recruiter profile not found",
            )

        if (
            job_data.salary_min is not None
            and job_data.salary_max is not None
            and job_data.salary_min > job_data.salary_max
        ):
            raise HTTPException(
                status_code=400,
                detail="Minimum salary cannot exceed maximum salary",
            )

        normalized_skills = sorted(
            {
                skill.strip().lower()
                for skill in job_data.required_skills
                if skill.strip()
            }
        )

        job = Job(
            recruiter_id=recruiter_profile.id,
            company_id=recruiter_profile.company_id,
            title=job_data.title.strip(),
            description=job_data.description.strip(),
            location=job_data.location,
            employment_type=job_data.employment_type,
            required_skills=normalized_skills,
            minimum_experience=job_data.minimum_experience,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            application_deadline=job_data.application_deadline,
        )

        return await JobRepository.create_job(
            db,
            job,
        )
    @staticmethod
    async def get_active_jobs(
        db: AsyncSession,
    ):
        return await JobRepository.get_active_jobs(db)
    @staticmethod
    async def get_job_by_id(
        db: AsyncSession,
        job_id: int,
    ):
        job = await JobRepository.get_job_by_id(
            db,
            job_id,
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        return job
    @staticmethod
    async def match_job_with_candidate(
        db: AsyncSession,
        job_id: int,
        current_user: User,
    ):
        job = await JobRepository.get_job_by_id(
            db,
            job_id,
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        candidate_profile = (
            await CandidateRepository.get_profile_by_user_id(
                db,
                current_user.id,
            )
        )

        if not candidate_profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found",
            )

        resume_analysis = (
            await CandidateRepository.get_resume_analysis(
                db,
                candidate_profile.id,
            )
        )

        if not resume_analysis:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Resume analysis not found. "
                    "Upload and analyze your resume first."
                ),
            )

        resume_skills = resume_analysis.skills or []
        job_skills = job.required_skills or []

        score_result = calculate_ats_score(
            resume_skills=resume_skills,
            job_skills=job_skills,
        )

        return {
            "job_id": job.id,
            "job_title": job.title,
            "match_score": score_result["ats_score"],
            "matched_skills": score_result["matched_skills"],
            "missing_skills": score_result["missing_skills"],
            "resume_skills": sorted(resume_skills),
            "job_skills": sorted(job_skills),
        }