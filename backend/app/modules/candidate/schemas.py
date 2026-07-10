from pydantic import BaseModel
from typing import Optional


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