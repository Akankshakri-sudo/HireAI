from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    website: str | None = None
    industry: str | None = None
    location: str | None = None
    description: str | None = None


class CompanyResponse(CompanyCreate):
    id: int

    model_config = {
        "from_attributes": True
    }


class RecruiterProfileCreate(BaseModel):
    company_id: int
    designation: str | None = None
    phone: str | None = None


class RecruiterProfileResponse(RecruiterProfileCreate):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True
    }