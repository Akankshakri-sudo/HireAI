from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.recruiter.models import (
    Company,
    Recruiter,
)


class RecruiterRepository:

    @staticmethod
    async def get_company_by_name(
        db: AsyncSession,
        name: str,
    ):
        result = await db.execute(
            select(Company).where(Company.company_name == name)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_company_by_id(
        db: AsyncSession,
        company_id: int,
    ):
        result = await db.execute(
            select(Company).where(Company.id == company_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_company(
        db: AsyncSession,
        company: Company,
    ):
        db.add(company)
        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def get_profile_by_user_id(
        db: AsyncSession,
        user_id: int,
    ):
        result = await db.execute(
            select(Recruiter).where(
                Recruiter.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        profile: Recruiter,
    ):
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        profile: Recruiter,
        update_data: dict,
    ):
        for key, value in update_data.items():
            setattr(profile, key, value)
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def update_company(
        db: AsyncSession,
        company: Company,
        update_data: dict,
    ):
        mapped_data = dict(update_data)
        if "name" in mapped_data:
            mapped_data["company_name"] = mapped_data.pop("name")

        for key, value in mapped_data.items():
            setattr(company, key, value)
        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def get_companies(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(Company).order_by(Company.company_name)
        )
        return result.scalars().all()
