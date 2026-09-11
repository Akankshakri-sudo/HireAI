from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AdminStatsResponse(BaseModel):
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_jobs: int
    active_jobs: int
    total_applications: int
    status_breakdown: dict[str, int]
    recent_users_count_7d: int
    recent_applications_count_7d: int


class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


class AdminJobResponse(BaseModel):
    id: int
    title: str
    company_name: str | None = None
    recruiter_name: str | None = None
    recruiter_email: str | None = None
    location: str | None = None
    employment_type: str
    is_active: bool
    applications_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminApplicationResponse(BaseModel):
    id: int
    candidate_name: str
    candidate_email: str
    job_title: str
    company_name: str
    status: str
    ai_match_score: int
    applied_at: datetime
