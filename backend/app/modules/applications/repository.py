from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.applications.models import Application, InterviewQuestions


class ApplicationRepository:

    @staticmethod
    async def get_by_candidate_and_job(
        db: AsyncSession,
        candidate_id: int,
        job_id: int,
    ):
        result = await db.execute(
            select(Application).where(
                Application.candidate_id == candidate_id,
                Application.job_id == job_id,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create_application(
        db: AsyncSession,
        application: Application,
    ):
        db.add(application)
        await db.commit()
        await db.refresh(application)

        return application

    @staticmethod
    async def get_candidate_applications(
        db: AsyncSession,
        candidate_id: int,
    ):
        result = await db.execute(
            select(Application)
            .where(
                Application.candidate_id == candidate_id
            )
            .order_by(Application.applied_at.desc())
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        application_id: int,
    ):
        result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_job_applications_detailed(
        db: AsyncSession,
        job_id: int,
    ):
        from app.modules.candidate.models import Candidate, Resume, ResumeAnalysis
        from app.modules.auth.models import User

        stmt = (
            select(Application, Candidate, User, Resume, ResumeAnalysis)
            .join(Candidate, Application.candidate_id == Candidate.id)
            .join(User, Candidate.user_id == User.id)
            .outerjoin(Resume, Application.resume_id == Resume.id)
            .outerjoin(ResumeAnalysis, Resume.id == ResumeAnalysis.resume_id)
            .where(Application.job_id == job_id)
            .order_by(Application.ai_match_score.desc())
        )

        result = await db.execute(stmt)
        rows = result.all()

        detailed_apps = []
        for app, candidate, user, resume, analysis in rows:
            detailed_apps.append({
                "id": app.id,
                "candidate_id": app.candidate_id,
                "candidate_profile_id": app.candidate_id,
                "job_id": app.job_id,
                "resume_id": app.resume_id,
                "resume_analysis_id": analysis.id if analysis else None,
                "status": app.status,
                "ai_match_score": app.ai_match_score,
                "match_score": app.ai_match_score,
                "recruiter_notes": app.recruiter_notes,
                "applied_at": app.applied_at,
                "candidate": {
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": candidate.phone,
                    "education": candidate.education,
                    "experience": candidate.experience,
                    "location": candidate.location,
                    "resume_path": resume.file_url if resume else None,
                },
                "skills_extracted": analysis.skills if analysis else [],
            })

        return detailed_apps

    @staticmethod
    async def get_interview_questions(
        db: AsyncSession,
        application_id: int,
    ):
        result = await db.execute(
            select(InterviewQuestions).where(
                InterviewQuestions.application_id == application_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def save_interview_questions(
        db: AsyncSession,
        interview_questions: InterviewQuestions,
    ):
        db.add(interview_questions)
        await db.commit()
        await db.refresh(interview_questions)
        return interview_questions

    @staticmethod
    async def get_recruiter_stats(
        db: AsyncSession,
        user_id: int,
    ):
        from sqlalchemy import func
        from app.modules.jobs.models import Job
        from app.modules.recruiter.models import Recruiter
        
        job_stmt = (
            select(func.count(Job.id))
            .join(Recruiter, Job.recruiter_id == Recruiter.id)
            .where(Recruiter.user_id == user_id)
        )
        total_jobs = await db.scalar(job_stmt) or 0
        
        app_stmt = (
            select(Application.status, func.count(Application.id))
            .join(Job, Application.job_id == Job.id)
            .join(Recruiter, Job.recruiter_id == Recruiter.id)
            .where(Recruiter.user_id == user_id)
            .group_by(Application.status)
        )
        
        result = await db.execute(app_stmt)
        status_counts = {status: count for status, count in result.all()}
        
        return {
            "total_jobs": total_jobs,
            "total_applicants": sum(status_counts.values()),
            "shortlisted": status_counts.get("shortlisted", 0),
            "selected": status_counts.get("selected", 0),
            "reviewed": status_counts.get("reviewed", 0),
            "rejected": status_counts.get("rejected", 0),
        }
