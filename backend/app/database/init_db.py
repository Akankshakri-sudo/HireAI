from app.database.session import engine
from app.database.base import Base

# Import models so SQLAlchemy registers them
from app.modules.auth import models
from app.modules.candidate import models as candidate_models



async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)