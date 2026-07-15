from collections.abc import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.modules.auth.jwt_handler import verify_token
from app.modules.auth.repository import AuthRepository
from app.modules.auth.models import User
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")



async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    # Verify JWT token
    payload = verify_token(token)

    # Get email from token payload
    email = payload.get("sub")

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    # Fetch user from database
    user = await AuthRepository.get_user_by_email(
        db,
        email
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user
def require_role(required_role: str) -> Callable:

    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account",
            )

        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Only {required_role}s can access this resource",
            )

        return current_user

    return role_checker