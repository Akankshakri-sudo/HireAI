from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.auth import require_role
from app.common.dependencies import get_db
from app.modules.admin.schemas import (
    AdminApplicationResponse,
    AdminJobResponse,
    AdminStatsResponse,
    AdminUserResponse,
    AdminUserStatusUpdate,
)
from app.modules.admin.service import AdminService
from app.modules.auth.models import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
async def get_platform_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.get_stats(db)


@router.get("/users", response_model=list[AdminUserResponse])
async def get_users(
    search: str | None = Query(None, description="Search by name or email"),
    role: str | None = Query(None, description="Filter by role"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.get_users(db, search, role, is_active, skip, limit)


@router.put("/users/{user_id}/status", response_model=AdminUserResponse)
async def update_user_status(
    user_id: int,
    data: AdminUserStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.update_user_status(db, user_id, data.is_active)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.delete_user(db, user_id)


@router.get("/jobs", response_model=list[AdminJobResponse])
async def get_all_jobs(
    search: str | None = Query(None, description="Search title/desc"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.get_jobs(db, search, is_active, skip, limit)


@router.put("/jobs/{job_id}/toggle-status")
async def toggle_job_status(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.toggle_job_status(db, job_id)


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.delete_job(db, job_id)


@router.get("/applications", response_model=list[AdminApplicationResponse])
async def get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return await AdminService.get_all_applications(db, skip, limit)
