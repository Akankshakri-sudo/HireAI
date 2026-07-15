from datetime import date, datetime

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=20)
    location: str | None = None
    employment_type: str = "full-time"
    required_skills: list[str] = []
    minimum_experience: int = Field(default=0, ge=0)
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    application_deadline: date | None = None
    

class JobResponse(JobCreate):
    id: int
    recruiter_id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class JobMatchResponse(BaseModel):
    job_id: int
    job_title: str
    match_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    resume_skills: list[str]
    job_skills: list[str]