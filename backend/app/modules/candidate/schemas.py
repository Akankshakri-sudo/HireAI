from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CandidateProfileCreate(BaseModel):
    phone: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    location: Optional[str] = None


class CandidateProfileResponse(CandidateProfileCreate):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True
    }


class ResumeParseResponse(BaseModel):
    resume_path: str
    extracted_text: str


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    candidate_id: Optional[int] = None
    candidate_profile_id: Optional[int] = None
    resume_path: str
    skills: list[str]
    total_skills_found: int
    ats_score: Optional[float] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    suggestions: Optional[str] = None
    analyzed_at: datetime

    model_config = {
        "from_attributes": True
    }


class ATSScoreRequest(BaseModel):
    job_description: str = Field(
        ...,
        min_length=20,
    )


class ResumeUploadResponse(BaseModel):
    id: int
    candidate_id: int
    file_url: str
    uploaded_at: datetime

    model_config = {
        "from_attributes": True
    }


class ATSScoreResponse(BaseModel):
    ats_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    resume_skills: list[str]
    job_skills: list[str]
