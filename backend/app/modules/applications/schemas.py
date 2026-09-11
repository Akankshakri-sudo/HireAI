from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class ApplicationResponse(BaseModel):
    id: int
    candidate_id: int
    candidate_profile_id: int
    job_id: int
    resume_id: int
    resume_analysis_id: int | None = None
    status: str
    ai_match_score: int
    match_score: int
    recruiter_notes: str | None = None
    applied_at: datetime

    model_config = {
        "from_attributes": True
    }

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data):
        if hasattr(data, "candidate_id"):
            return {
                "id": data.id,
                "candidate_id": data.candidate_id,
                "candidate_profile_id": data.candidate_id,
                "job_id": data.job_id,
                "resume_id": data.resume_id,
                "resume_analysis_id": data.resume_analysis_id,
                "status": data.status,
                "ai_match_score": data.ai_match_score,
                "match_score": data.ai_match_score,
                "recruiter_notes": data.recruiter_notes,
                "applied_at": data.applied_at,
            }
        if isinstance(data, dict):
            if "candidate_profile_id" not in data and "candidate_id" in data:
                data["candidate_profile_id"] = data["candidate_id"]
            if "match_score" not in data and "ai_match_score" in data:
                data["match_score"] = data["ai_match_score"]
        return data


class CandidateDetails(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    education: str | None = None
    experience: str | None = None
    location: str | None = None
    resume_path: str | None = None


class ApplicationDetailResponse(ApplicationResponse):
    candidate: CandidateDetails
    skills_extracted: list[str] = Field(default_factory=list)


class InterviewQuestionsResponse(BaseModel):
    application_id: int
    technical: list[str]
    hr: list[str]
    behavioral: list[str]
    coding: list[str]
