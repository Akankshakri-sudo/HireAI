from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.applications.models import Application


class ApplicationRepository:

    @staticmethod
    async def get_by_candidate_and_job(
        db: AsyncSession,
        candidate_profile_id: int,
        job_id: int,
    ):
        result = await db.execute(
            select(Application).where(
                Application.candidate_profile_id
                == candidate_profile_id,
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
        candidate_profile_id: int,
    ):
        result = await db.execute(
            select(Application)
            .where(
                Application.candidate_profile_id
                == candidate_profile_id
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
        from app.modules.candidate.models import CandidateProfile, ResumeAnalysis
        from app.modules.auth.models import User
        
        stmt = (
            select(Application, CandidateProfile, User, ResumeAnalysis)
            .join(CandidateProfile, Application.candidate_profile_id == CandidateProfile.id)
            .join(User, CandidateProfile.user_id == User.id)
            .outerjoin(ResumeAnalysis, Application.resume_analysis_id == ResumeAnalysis.id)
            .where(Application.job_id == job_id)
            .order_by(Application.match_score.desc())
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        detailed_apps = []
        for app, profile, user, analysis in rows:
            detailed_apps.append({
                "id": app.id,
                "candidate_profile_id": app.candidate_profile_id,
                "job_id": app.job_id,
                "resume_analysis_id": app.resume_analysis_id,
                "status": app.status,
                "match_score": app.match_score,
                "recruiter_notes": app.recruiter_notes,
                "applied_at": app.applied_at,
                "candidate": {
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": profile.phone,
                    "college": profile.college,
                    "degree": profile.degree,
                    "graduation_year": profile.graduation_year,
                    "skills": profile.skills,
                    "experience": profile.experience,
                    "resume_path": profile.resume_path,
                },
                "skills_extracted": analysis.skills if analysis else [],
            })
            
        return detailed_apps