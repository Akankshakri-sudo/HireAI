import os
import uuid
from app.modules.candidate.resume_parser import extract_text_from_pdf
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.candidate.models import Candidate, Resume
from app.modules.candidate.repository import CandidateRepository
from app.modules.candidate.schemas import CandidateProfileCreate
from app.modules.candidate.skill_extractor import extract_skills
from app.modules.candidate.ats_calculator import (
    calculate_ats_score,
)


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

        profile = Candidate(
            user_id=current_user.id,
            phone=profile_data.phone,
            education=profile_data.education,
            experience=profile_data.experience,
            location=profile_data.location,
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
    async def update_profile(
        db: AsyncSession,
        profile_data: CandidateProfileCreate,
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

        update_data = profile_data.model_dump(exclude_unset=True)
        return await CandidateRepository.update_profile(
            db,
            profile,
            update_data
        )

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

        resume = Resume(
            candidate_id=profile.id,
            file_url=file_path,
        )
        return await CandidateRepository.create_resume(db, resume)

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

        latest_resume = await CandidateRepository.get_latest_resume(db, profile.id)
        if not latest_resume:
            raise HTTPException(
                status_code=400,
                detail="Please upload a resume first"
            )

        file_extension = os.path.splitext(
            latest_resume.file_url
        )[1].lower()

        if file_extension != ".pdf":
            raise HTTPException(
                status_code=400,
                detail="Resume parsing currently supports PDF files only"
            )

        if not os.path.exists(latest_resume.file_url):
            raise HTTPException(
                status_code=404,
                detail="Resume file not found on server"
            )

        try:
            extracted_text = extract_text_from_pdf(
                latest_resume.file_url
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
            "resume_path": latest_resume.file_url,
            "extracted_text": extracted_text
        }

    @staticmethod
    async def analyze_resume(
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

        latest_resume = await CandidateRepository.get_latest_resume(db, profile.id)
        if not latest_resume:
            raise HTTPException(
                status_code=400,
                detail="Please upload a resume first"
            )

        file_extension = os.path.splitext(
            latest_resume.file_url
        )[1].lower()

        if file_extension != ".pdf":
            raise HTTPException(
                status_code=400,
                detail="Resume analysis currently supports PDF files only"
            )

        if not os.path.exists(latest_resume.file_url):
            raise HTTPException(
                status_code=404,
                detail="Resume file not found on server"
            )

        extracted_text = extract_text_from_pdf(
            latest_resume.file_url
        )

        if not extracted_text:
            raise HTTPException(
                status_code=422,
                detail="No readable text found in the resume"
            )

        skills = extract_skills(extracted_text)

        ats_score = min(len(skills) * 10.0, 100.0)
        education = "Extracted from PDF details"
        experience = "Extracted from PDF details"
        suggestions = "Consider adding more keywords matching modern SaaS stacks."

        return await CandidateRepository.save_resume_analysis(
            db=db,
            resume_id=latest_resume.id,
            extracted_text=extracted_text,
            skills=skills,
            ats_score=ats_score,
            education=education,
            experience=experience,
            suggestions=suggestions,
        )

    @staticmethod
    async def get_resume_analysis(
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

        analysis = await CandidateRepository.get_resume_analysis(
            db,
            profile.id
        )

        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Resume analysis not found. Analyze your resume first."
            )

        return analysis

    @staticmethod
    async def calculate_resume_score(
        db: AsyncSession,
        current_user: User,
        job_description: str,
    ):
        profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found",
            )

        analysis = await CandidateRepository.get_resume_analysis(
            db,
            profile.id,
        )

        if not analysis:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Resume analysis not found. "
                    "Analyze your resume first."
                ),
            )

        job_skills = extract_skills(job_description)
        resume_skills = analysis.skills or []

        if not job_skills:
            raise HTTPException(
                status_code=422,
                detail=(
                    "No recognized technical skills were "
                    "found in the job description."
                ),
            )

        score_result = calculate_ats_score(
            resume_skills=resume_skills,
            job_skills=job_skills,
        )

        return {
            **score_result,
            "resume_skills": sorted(resume_skills),
            "job_skills": sorted(job_skills),
        }

    @staticmethod
    async def get_matched_jobs(
        db: AsyncSession,
        current_user: User,
    ):
        profile = await CandidateRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found",
            )

        resume_analysis = await CandidateRepository.get_resume_analysis(
            db,
            profile.id,
        )

        from app.modules.jobs.repository import JobRepository
        jobs = await JobRepository.get_active_jobs(db)

        matched_jobs = []
        resume_skills = resume_analysis.skills if resume_analysis else []

        for job in jobs:
            job_skills = job.skills_required or []
            if resume_analysis and job_skills:
                score_result = calculate_ats_score(
                    resume_skills=resume_skills,
                    job_skills=job_skills,
                )
                score = score_result["ats_score"]
                matched = score_result["matched_skills"]
                missing = score_result["missing_skills"]
            else:
                score = 0.0
                matched = []
                missing = job_skills

            matched_jobs.append({
                "job_id": job.id,
                "job_title": job.title,
                "company_name": job.company.company_name if job.company else None,
                "location": job.location,
                "employment_type": job.employment_type,
                "description": job.description[:200] if job.description else None,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "match_score": score,
                "matched_skills": matched,
                "missing_skills": missing,
                "resume_skills": sorted(resume_skills),
                "job_skills": sorted(job_skills),
            })

        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        return matched_jobs
