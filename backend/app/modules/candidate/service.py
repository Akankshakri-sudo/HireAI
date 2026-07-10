import os
import uuid
from app.modules.candidate.resume_parser import extract_text_from_pdf
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.candidate.models import CandidateProfile
from app.modules.candidate.repository import CandidateRepository
from app.modules.candidate.schemas import CandidateProfileCreate


class CandidateService:

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        profile_data: CandidateProfileCreate,
        current_user: User
    ):
        existing_profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id
        )

        if existing_profile:
            raise HTTPException(
                status_code=400,
                detail="Candidate profile already exists"
            )

        profile = CandidateProfile(
            user_id=current_user.id,
            phone=profile_data.phone,
            college=profile_data.college,
            degree=profile_data.degree,
            graduation_year=profile_data.graduation_year,
            skills=profile_data.skills,
            experience=profile_data.experience
        )

        return await CandidateRepository.create_profile(
            db,
            profile
        )

    @staticmethod
    async def get_profile(
        db: AsyncSession,
        current_user: User
    ):
        profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id
        )

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found"
            )

        return profile

    @staticmethod
    async def upload_resume(
        db: AsyncSession,
        current_user: User,
        file: UploadFile
    ):
        profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id
        )

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found"
            )

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing"
            )

        allowed_extensions = {".pdf", ".docx"}
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are allowed"
            )

        upload_dir = os.path.join("uploads", "resumes")
        os.makedirs(upload_dir, exist_ok=True)

        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        return await CandidateRepository.update_resume_path(
            db,
            profile,
            file_path
        )
    @staticmethod
    async def parse_resume(
        db: AsyncSession,
        current_user: User
    ):
        profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id
        )

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found"
            )

        if not profile.resume_path:
            raise HTTPException(
                status_code=400,
                detail="Please upload a resume first"
            )

        file_extension = os.path.splitext(
            profile.resume_path
        )[1].lower()

        if file_extension != ".pdf":
            raise HTTPException(
                status_code=400,
                detail="Resume parsing currently supports PDF files only"
            )

        if not os.path.exists(profile.resume_path):
            raise HTTPException(
                status_code=404,
                detail="Resume file not found on server"
            )

        try:
            extracted_text = extract_text_from_pdf(
                profile.resume_path
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Unable to parse the resume"
            )

        if not extracted_text:
            raise HTTPException(
                status_code=422,
                detail="No readable text found in the resume"
            )

        return {
            "resume_path": profile.resume_path,
            "extracted_text": extracted_text
        }