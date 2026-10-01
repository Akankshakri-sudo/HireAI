from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.modules.applications.models import Application
    from app.modules.recruiter.models import Company, Recruiter


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint(
            "salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min",
            name="ck_jobs_salary_range",
        ),
        Index("ix_jobs_is_active_deadline", "is_active", "deadline"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    recruiter_id: Mapped[int] = mapped_column(
        ForeignKey(
            "recruiters.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    location: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )

    employment_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="full-time",
    )

    skills_required: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    minimum_experience: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    salary_min: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    salary_max: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    deadline: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    recruiter: Mapped[Recruiter] = relationship(back_populates="jobs")

    company: Mapped[Company] = relationship(back_populates="jobs")

    applications: Mapped[list[Application]] = relationship(
        back_populates="job",
    )

    @property
    def required_skills(self) -> list[str]:
        return self.skills_required

    @property
    def application_deadline(self) -> date | None:
        return self.deadline

    @property
    def company_name(self) -> str | None:
        if "company" in self.__dict__ and self.company:
            return self.company.company_name
        return None

