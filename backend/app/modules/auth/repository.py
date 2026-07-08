from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User


class AuthRepository:

    @staticmethod
    async def get_user_by_email(
        db: AsyncSession,
        email: str
    ):
        result = await db.execute(
            select(User).where(User.email == email)
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(
        db: AsyncSession,
        user: User
    ):
        db.add(user)

        await db.commit()

        await db.refresh(user)

        return user