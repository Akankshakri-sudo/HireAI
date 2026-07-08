from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.modules.auth.schemas import (
    UserRegister,
    UserResponse
)
from app.modules.auth.service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
async def register(
    user: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.register(
        db,
        user
    )