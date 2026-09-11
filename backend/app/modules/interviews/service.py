from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.applications.models import Application
from app.modules.applications.repository import ApplicationRepository
from app.modules.auth.models import User
from app.modules.candidate.repository import CandidateRepository
from app.modules.interviews.models import Interview
from app.modules.interviews.repository import InterviewRepository
from app.modules.interviews.schemas import InterviewCreate, InterviewResponse, InterviewStatusUpdate
from app.modules.notifications.models import Notification
from app.modules.notifications.repository import NotificationRepository
from app.modules.recruiter.repository import RecruiterRepository


class InterviewService:
    @staticmethod
    def _format_interview(iv: Interview) -> InterviewResponse:
        cand_name = None
        cand_email = None
        if iv.candidate and iv.candidate.user:
            cand_name = iv.candidate.user.name or iv.candidate.user.email
            cand_email = iv.candidate.user.email

        job_title = None
        company_name = None
        if iv.application and iv.application.job:
            job_title = iv.application.job.title
            if iv.application.job.company:
                company_name = iv.application.job.company.company_name

        return InterviewResponse(
            id=iv.id,
            application_id=iv.application_id,
            candidate_id=iv.candidate_id,
            recruiter_id=iv.recruiter_id,
            scheduled_at=iv.scheduled_at,
            duration_minutes=iv.duration_minutes,
            round_name=iv.round_name,
            meeting_link=iv.meeting_link,
            notes=iv.notes,
            status=iv.status,
            created_at=iv.created_at,
            updated_at=iv.updated_at,
            candidate_name=cand_name,
            candidate_email=cand_email,
            job_title=job_title,
            company_name=company_name,
        )

    @staticmethod
    async def schedule_interview(
        db: AsyncSession, current_user: User, data: InterviewCreate
    ) -> InterviewResponse:
        recruiter = await RecruiterRepository.get_profile_by_user_id(db, current_user.id)
        if not recruiter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter profile not found"
            )

        app = await ApplicationRepository.get_application_by_id(db, data.application_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
            )

        # Update application status to 'interview'
        await ApplicationRepository.update_application_status(db, app, "interview")

        interview = Interview(
            application_id=data.application_id,
            candidate_id=app.candidate_id,
            recruiter_id=recruiter.id,
            scheduled_at=data.scheduled_at,
            duration_minutes=data.duration_minutes,
            round_name=data.round_name,
            meeting_link=data.meeting_link,
            notes=data.notes,
            status="scheduled",
        )
        created = await InterviewRepository.create(db, interview)

        # Notify candidate
        if app.candidate and app.candidate.user_id:
            job_title = app.job.title if app.job else "your application"
            notif = Notification(
                user_id=app.candidate.user_id,
                title="Interview Scheduled! 🎉",
                message=f"An interview for '{job_title}' ({data.round_name}) has been scheduled on {data.scheduled_at.strftime('%b %d, %Y at %I:%M %p')}.",
                type="interview",
                link="/candidate/dashboard?tab=interviews",
            )
            await NotificationRepository.create(db, notif)

        loaded = await InterviewRepository.get_by_id(db, created.id)
        return InterviewService._format_interview(loaded or created)

    @staticmethod
    async def get_candidate_interviews(
        db: AsyncSession, current_user: User
    ) -> list[InterviewResponse]:
        candidate = await CandidateRepository.get_profile_by_user_id(db, current_user.id)
        if not candidate:
            return []
        interviews = await InterviewRepository.get_by_candidate(db, candidate.id)
        return [InterviewService._format_interview(iv) for iv in interviews]

    @staticmethod
    async def get_recruiter_interviews(
        db: AsyncSession, current_user: User
    ) -> list[InterviewResponse]:
        recruiter = await RecruiterRepository.get_profile_by_user_id(db, current_user.id)
        if not recruiter:
            return []
        interviews = await InterviewRepository.get_by_recruiter(db, recruiter.id)
        return [InterviewService._format_interview(iv) for iv in interviews]

    @staticmethod
    async def update_interview_status(
        db: AsyncSession,
        current_user: User,
        interview_id: int,
        data: InterviewStatusUpdate,
    ) -> InterviewResponse:
        iv = await InterviewRepository.get_by_id(db, interview_id)
        if not iv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found"
            )

        updated = await InterviewRepository.update_status(
            db, iv, data.status, data.notes
        )

        # Notify candidate on status update
        if iv.candidate and iv.candidate.user_id:
            notif = Notification(
                user_id=iv.candidate.user_id,
                title=f"Interview {data.status.capitalize()}",
                message=f"Your interview for '{iv.application.job.title if iv.application and iv.application.job else 'job'}' has been updated to {data.status}.",
                type="interview",
                link="/candidate/dashboard?tab=interviews",
            )
            await NotificationRepository.create(db, notif)

        loaded = await InterviewRepository.get_by_id(db, updated.id)
        return InterviewService._format_interview(loaded or updated)
