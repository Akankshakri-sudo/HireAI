from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=True
    )

    college: Mapped[str] = mapped_column(
        String(150),
        nullable=True
    )

    degree: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    graduation_year: Mapped[int] = mapped_column(
        Integer,
        nullable=True
    )

    skills: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    experience: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    resume_path: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey(
            "candidate_profiles.id",
            ondelete="CASCADE"
        ),
        unique=True,
        nullable=False,
        index=True
    )

    resume_path: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    extracted_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    skills: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list
    )

    total_skills_found: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
