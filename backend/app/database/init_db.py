from app.database.session import engine
from app.database.base import Base

# Import models so SQLAlchemy registers them
from app.modules.auth import models as auth_models
from app.modules.candidate import models as candidate_models

from app.modules.recruiter import models as recruiter_models
from app.modules.jobs import models as job_models
from app.modules.applications import models as application_models
from app.modules.saved_jobs import models as saved_jobs_models
from app.modules.notifications import models as notification_models
from app.modules.interviews import models as interview_models
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)