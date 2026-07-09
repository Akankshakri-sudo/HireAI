from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from app.common.dependencies import get_db
from app.common.auth import get_current_user
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    UserRegister,
    UserResponse,
    Token
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
    
@router.post(
    "/login",
    response_model=Token
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.login(
        db,
        form_data.username,   # email
        form_data.password
    )
    
@router.get(
    "/me",
    response_model=UserResponse
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user