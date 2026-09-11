from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class InterviewCreate(BaseModel):
    application_id: int
    scheduled_at: datetime
    duration_minutes: int = 45
    round_name: str = "Technical Round"
    meeting_link: str | None = None
    notes: str | None = None


class InterviewStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(scheduled|completed|cancelled|rescheduled)$")
    notes: str | None = None


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    candidate_id: int
    recruiter_id: int
    scheduled_at: datetime
    duration_minutes: int
    round_name: str
    meeting_link: str | None = None
    notes: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    # Expanded metadata
    candidate_name: str | None = None
    candidate_email: str | None = None
    job_title: str | None = None
    company_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
