from datetime import date, datetime

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=20)
    location: str | None = None
    employment_type: str = "full-time"
    required_skills: list[str] = []
    skills_required: list[str] | None = None
    minimum_experience: int = 0
    salary_min: int | None = None
    salary_max: int | None = None
    application_deadline: date | None = None
    deadline: date | None = None


class JobResponse(JobCreate):
    id: int
    recruiter_id: int
    company_id: int
    is_active: bool
    company_name: str | None = None
    created_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }


class JobMatchResponse(BaseModel):
    job_id: int
    job_title: str
    company_name: str | None = None
    location: str | None = None
    employment_type: str | None = None
    description: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    match_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    resume_skills: list[str]
    job_skills: list[str]


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=150)
    description: str | None = Field(default=None, min_length=20)
    location: str | None = None
    employment_type: str | None = None
    required_skills: list[str] | None = None
    skills_required: list[str] | None = None
    minimum_experience: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    application_deadline: date | None = None
    deadline: date | None = None
    is_active: bool | None = None
