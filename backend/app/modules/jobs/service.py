from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.jobs.models import Job
from app.modules.jobs.repository import JobRepository
from app.modules.jobs.schemas import JobCreate, JobUpdate
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
        recruiter = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not recruiter:
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

        skills = job_data.skills_required or job_data.required_skills
        normalized_skills = sorted(
            {
                skill.strip().lower()
                for skill in skills
                if skill.strip()
            }
        )

        deadline = job_data.deadline or job_data.application_deadline

        job = Job(
            recruiter_id=recruiter.id,
            company_id=recruiter.company_id,
            title=job_data.title.strip(),
            description=job_data.description.strip(),
            location=job_data.location,
            employment_type=job_data.employment_type,
            skills_required=normalized_skills,
            minimum_experience=job_data.minimum_experience,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            deadline=deadline,
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
    async def search_jobs(
        db: AsyncSession,
        search: str | None = None,
        location: str | None = None,
        employment_type: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ):
        return await JobRepository.search_jobs(
            db,
            search=search,
            location=location,
            employment_type=employment_type,
            skip=skip,
            limit=limit,
        )

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

        candidate = (
            await CandidateRepository.get_profile_by_user_id(
                db,
                current_user.id,
            )
        )

        if not candidate:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found",
            )

        resume_analysis = (
            await CandidateRepository.get_resume_analysis(
                db,
                candidate.id,
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
        job_skills = job.skills_required or []

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

    @staticmethod
    async def update_job_service(
        db: AsyncSession,
        job_id: int,
        job_data: JobUpdate,
        current_user: User,
    ):
        recruiter = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not recruiter:
            raise HTTPException(
                status_code=404,
                detail="Recruiter profile not found",
            )

        job = await JobRepository.get_job_by_id(db, job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        if job.recruiter_id != recruiter.id:
            raise HTTPException(
                status_code=403,
                detail="You do not own this job",
            )

        update_dict = job_data.model_dump(exclude_unset=True)

        if "salary_min" in update_dict or "salary_max" in update_dict:
            new_min = update_dict.get("salary_min", job.salary_min)
            new_max = update_dict.get("salary_max", job.salary_max)
            if new_min is not None and new_max is not None and new_min > new_max:
                raise HTTPException(
                    status_code=400,
                    detail="Minimum salary cannot exceed maximum salary",
                )

        if "skills_required" in update_dict or "required_skills" in update_dict:
            skills = update_dict.pop("skills_required", None) or update_dict.pop("required_skills", None)
            if skills is not None:
                update_dict["skills_required"] = sorted(
                    {skill.strip().lower() for skill in skills if skill.strip()}
                )

        if "application_deadline" in update_dict:
            update_dict["deadline"] = update_dict.pop("application_deadline")

        return await JobRepository.update_job(
            db,
            job,
            update_dict,
        )

    @staticmethod
    async def delete_job_service(
        db: AsyncSession,
        job_id: int,
        current_user: User,
    ):
        recruiter = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not recruiter:
            raise HTTPException(
                status_code=404,
                detail="Recruiter profile not found",
            )

        job = await JobRepository.get_job_by_id(db, job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        if job.recruiter_id != recruiter.id:
            raise HTTPException(
                status_code=403,
                detail="You do not own this job",
            )

        await JobRepository.delete_job(db, job_id)
        return {"detail": "Job deleted successfully"}

    @staticmethod
    async def get_recruiter_jobs(
        db: AsyncSession,
        current_user: User,
    ):
        recruiter = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not recruiter:
            raise HTTPException(
                status_code=404,
                detail="Recruiter profile not found",
            )

        return await JobRepository.get_jobs_by_recruiter(db, recruiter.id)
