from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import UserRegister
from app.modules.auth.utils import hash_password


class AuthService:

    @staticmethod
    async def register(
        db: AsyncSession,
        user_data: UserRegister
    ):

        existing_user = await AuthRepository.get_user_by_email(
            db,
            user_data.email
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password=hash_password(user_data.password)
        )

        return await AuthRepository.create_user(
            db,
            new_user
        )