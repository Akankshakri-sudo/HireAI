from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Float,
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
    from app.modules.auth.models import User


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    education: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    experience: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
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

    user: Mapped[User] = relationship(back_populates="candidate")

    resumes: Mapped[list[Resume]] = relationship(
        back_populates="candidate",
        cascade="all, delete-orphan",
    )

    applications: Mapped[list[Application]] = relationship(
        back_populates="candidate",
    )


class Resume(Base):
    __tablename__ = "resumes"
    __table_args__ = (
        Index(
            "ix_resumes_candidate_id_uploaded_at",
            "candidate_id",
            "uploaded_at",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    file_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    candidate: Mapped[Candidate] = relationship(back_populates="resumes")

    analysis: Mapped[ResumeAnalysis | None] = relationship(
        back_populates="resume",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @property
    def resume_path(self) -> str:
        return self.file_url


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    __table_args__ = (
        CheckConstraint(
            "ats_score IS NULL OR (ats_score >= 0 AND ats_score <= 100)",
            name="ck_resume_analyses_ats_score",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey(
            "resumes.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    resume: Mapped[Resume] = relationship(
        back_populates="analysis",
        lazy="joined",
    )

    @property
    def candidate_id(self) -> int | None:
        if self.resume:
            return self.resume.candidate_id
        return None

    @property
    def candidate_profile_id(self) -> int | None:
        return self.candidate_id

    @property
    def resume_path(self) -> str | None:
        if self.resume:
            return self.resume.file_url
        return None

    extracted_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    skills: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    total_skills_found: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    ats_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    education: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    experience: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    suggestions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
