from datetime import datetime
from pydantic import BaseModel

from app.modules.jobs.schemas import JobResponse

class SavedJobResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    saved_at: datetime
    job: JobResponse

    class Config:
        from_attributes = True
