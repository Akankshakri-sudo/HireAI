from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.modules.candidate.models import Candidate, Resume
    from app.modules.jobs.models import Job


APPLICATION_STATUSES = (
    "applied",
    "reviewing",
    "shortlisted",
    "interview",
    "rejected",
    "hired",
)


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint(
            "candidate_id",
            "job_id",
            name="uq_candidate_job_application",
        ),
        CheckConstraint(
            f"status IN ({', '.join(repr(s) for s in APPLICATION_STATUSES)})",
            name="ck_applications_status",
        ),
        CheckConstraint(
            "ai_match_score >= 0 AND ai_match_score <= 100",
            name="ck_applications_ai_match_score",
        ),
        Index("ix_applications_applied_at", "applied_at"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey(
            "candidates.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey(
            "jobs.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey(
            "resumes.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="applied",
        index=True,
    )

    ai_match_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    recruiter_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    candidate: Mapped[Candidate] = relationship(back_populates="applications")

    job: Mapped[Job] = relationship(back_populates="applications")

    resume: Mapped[Resume] = relationship()

    interview_questions: Mapped[InterviewQuestions | None] = relationship(
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @property
    def candidate_profile_id(self) -> int:
        return self.candidate_id

    @property
    def match_score(self) -> int:
        return self.ai_match_score

    @property
    def resume_analysis_id(self) -> int | None:
        if self.resume and getattr(self.resume, "analysis", None):
            return self.resume.analysis.id
        return None


class InterviewQuestions(Base):
    __tablename__ = "interview_questions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    application_id: Mapped[int] = mapped_column(
        ForeignKey(
            "applications.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    technical_questions: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    hr_questions: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    behavioral_questions: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    coding_questions: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    application: Mapped[Application] = relationship(
        back_populates="interview_questions",
    )
