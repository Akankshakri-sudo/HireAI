from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CandidateProfileCreate(BaseModel):
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[str] = None
    experience: Optional[str] = None


class CandidateProfileResponse(CandidateProfileCreate):
    id: int
    user_id: int
    resume_path: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class ResumeParseResponse(BaseModel):
    resume_path: str
    extracted_text: str
    
class ResumeAnalysisResponse(BaseModel):
    id: int
    candidate_profile_id: int
    resume_path: str
    skills: list[str]
    total_skills_found: int
    analyzed_at: datetime

    model_config = {
        "from_attributes": True
    }
class ATSScoreRequest(BaseModel):
    job_description: str = Field(
        ...,
        min_length=20,
    )


class ATSScoreResponse(BaseModel):
    ats_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    resume_skills: list[str]
    job_skills: list[str]