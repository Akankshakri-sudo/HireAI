from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Application(Base):
    __tablename__ = "applications"

    __table_args__ = (
        UniqueConstraint(
            "candidate_profile_id",
            "job_id",
            name="uq_candidate_job_application",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey(
            "candidate_profiles.id",
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

    resume_analysis_id: Mapped[int] = mapped_column(
        ForeignKey(
            "resume_analyses.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="applied",
    )

    match_score: Mapped[int] = mapped_column(
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