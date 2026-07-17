from datetime import datetime

from pydantic import BaseModel


class ApplicationResponse(BaseModel):
    id: int
    candidate_profile_id: int
    job_id: int
    resume_analysis_id: int
    status: str
    match_score: int
    recruiter_notes: str | None
    applied_at: datetime

    model_config = {
        "from_attributes": True
    }

from pydantic import EmailStr

class CandidateDetails(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    college: str | None = None
    degree: str | None = None
    graduation_year: int | None = None
    skills: str | None = None
    experience: str | None = None
    resume_path: str | None = None

class ApplicationDetailResponse(ApplicationResponse):
    candidate: CandidateDetails
    skills_extracted: list[str] = []

class InterviewQuestionsResponse(BaseModel):
    application_id: int
    technical: list[str]
    behavioral: list[str]
    hr: list[str]
    coding: list[str]