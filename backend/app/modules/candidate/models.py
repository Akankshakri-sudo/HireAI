from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


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