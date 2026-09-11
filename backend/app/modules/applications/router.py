from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.auth import require_role
from app.common.dependencies import get_db
from app.modules.applications.schemas import ApplicationResponse, ApplicationDetailResponse, InterviewQuestionsResponse
from app.modules.applications.service import ApplicationService
from app.modules.auth.models import User


router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)

# Static routes MUST come before parameterized routes to avoid conflicts

@router.get(
    "/my",
    response_model=list[ApplicationResponse],
)
async def get_my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    return await ApplicationService.get_my_applications(
        db=db,
        current_user=current_user,
    )

@router.get(
    "/stats",
)
async def get_recruiter_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await ApplicationService.get_recruiter_stats_service(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/jobs/{job_id}",
    response_model=list[ApplicationDetailResponse],
)
async def get_job_applicants(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await ApplicationService.get_job_applicants(
        db=db,
        job_id=job_id,
        current_user=current_user,
    )

@router.post(
    "/{job_id}",
    response_model=ApplicationResponse,
    status_code=201,
)
async def apply_to_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    return await ApplicationService.apply_to_job(
        db=db,
        job_id=job_id,
        current_user=current_user,
    )

@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
async def update_application_status(
    application_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await ApplicationService.update_application_status(
        db=db,
        application_id=application_id,
        status=status,
        current_user=current_user,
    )

@router.post(
    "/{application_id}/interview-questions",
    response_model=InterviewQuestionsResponse,
)
async def generate_interview_questions(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    return await ApplicationService.generate_interview_questions(
        db=db,
        application_id=application_id,
        current_user=current_user,
    )
