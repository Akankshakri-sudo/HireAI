import asyncio
import sys
import os

# Add current folder to sys.path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database.session import engine
from app.database.base import Base

# Import all models to register them on Base.metadata
from app.modules.auth import models as auth_models
from app.modules.candidate import models as candidate_models
from app.modules.recruiter import models as recruiter_models
from app.modules.jobs import models as job_models
from app.modules.applications import models as application_models
from app.modules.saved_jobs import models as saved_jobs_models
from app.modules.notifications import models as notification_models
from app.modules.interviews import models as interview_models

async def reset_db():
    async with engine.begin() as conn:
        print("Dropping public schema...")
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        print("Recreating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database reset complete!")

if __name__ == "__main__":
    asyncio.run(reset_db())
