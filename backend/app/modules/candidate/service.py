import os
import uuid
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.candidate.models import Candidate, Resume, ResumeAnalysis
from app.modules.candidate.repository import CandidateRepository
from app.modules.candidate.schemas import (
    CandidateProfileCreate,
    CandidateProfileResponse,
    ResumeUploadResponse,
    ResumeAnalysisResponse,
)
from app.modules.candidate.resume_parser import extract_text_from_pdf
from app.modules.candidate.skill_extractor import extract_skills
from app.modules.candidate.ats_calculator import calculate_ats_score


class CandidateService:
    @staticmethod
    async def _get_or_create_profile(db: AsyncSession, current_user: User) -> Candidate:
        profile = await CandidateRepository.get_profile_by_user_id(db, current_user.id)
        if not profile:
            profile = Candidate(
                user_id=current_user.id,
                phone=None,
                education=None,
                experience=None,
                location=None,
            )
            profile = await CandidateRepository.create_profile(db, profile)
        return profile

    @staticmethod
    async def create_profile(
        db: AsyncSession, profile_data: CandidateProfileCreate, current_user: User
    ) -> CandidateProfileResponse:
        existing_profile = await CandidateRepository.get_profile_by_user_id(
            db, current_user.id
        )
        if existing_profile:
            update_data = profile_data.model_dump(exclude_unset=True)
            updated = await CandidateRepository.update_profile(
                db, existing_profile, update_data
            )
            return await CandidateService._format_profile_response(db, updated)

        profile = Candidate(
            user_id=current_user.id,
            phone=profile_data.phone,
            education=profile_data.education,
            experience=profile_data.experience,
            location=profile_data.location,
        )
        created = await CandidateRepository.create_profile(db, profile)
        return await CandidateService._format_profile_response(db, created)

    @staticmethod
    async def _format_profile_response(
        db: AsyncSession, profile: Candidate
    ) -> CandidateProfileResponse:
        analysis = await CandidateRepository.get_resume_analysis(db, profile.id)
        skills = analysis.skills if analysis else []
        return CandidateProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            phone=profile.phone,
            education=profile.education,
            experience=profile.experience,
            location=profile.location,
            skills=skills,
            parsed_data={"skills": skills} if skills else None,
        )

    @staticmethod
    async def get_profile(
        db: AsyncSession, current_user: User
    ) -> CandidateProfileResponse:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        return await CandidateService._format_profile_response(db, profile)

    @staticmethod
    async def update_profile(
        db: AsyncSession, profile_data: CandidateProfileCreate, current_user: User
    ) -> CandidateProfileResponse:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        update_data = profile_data.model_dump(exclude_unset=True)
        updated = await CandidateRepository.update_profile(db, profile, update_data)
        return await CandidateService._format_profile_response(db, updated)

    @staticmethod
    async def upload_resume(
        db: AsyncSession, current_user: User, file: UploadFile
    ) -> ResumeUploadResponse:
        profile = await CandidateService._get_or_create_profile(db, current_user)

        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is missing")

        allowed_extensions = {".pdf", ".docx", ".txt"}
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Only PDF, DOCX, and TXT files are supported",
            )

        upload_dir = os.path.join("uploads", "resumes")
        os.makedirs(upload_dir, exist_ok=True)

        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        resume = Resume(
            candidate_id=profile.id,
            file_url=file_path,
        )
        saved_resume = await CandidateRepository.create_resume(db, resume)

        # Automatically extract text and skills immediately upon upload
        extracted_text = extract_text_from_pdf(file_path)
        skills = extract_skills(extracted_text) if extracted_text else []
        
        # If no skills found from text, check if text has common tech terms
        if not skills and extracted_text:
            raw_words = [w.lower().strip(" ,.-/") for w in extracted_text.split() if len(w) > 2]
            skills = extract_skills(" ".join(raw_words))

        ats_score = round(min(len(skills) * 12.5, 95.0), 1) if skills else 50.0
        education = "Extracted from Resume" if "education" in extracted_text.lower() or "b.tech" in extracted_text.lower() or "b.s." in extracted_text.lower() else None
        experience = "Extracted from Resume" if "experience" in extracted_text.lower() or "work" in extracted_text.lower() else None
        suggestions = (
            "Great resume! Make sure to quantify your project achievements with numbers."
            if len(skills) >= 5
            else "Consider explicitly listing key technologies and frameworks (e.g. Python, React, Docker) in a dedicated Skills section."
        )

        await CandidateRepository.save_resume_analysis(
            db=db,
            resume_id=saved_resume.id,
            extracted_text=extracted_text or "Uploaded document content",
            skills=skills,
            ats_score=ats_score,
            education=education,
            experience=experience,
            suggestions=suggestions,
        )

        return ResumeUploadResponse(
            id=saved_resume.id,
            candidate_id=profile.id,
            file_url=file_path,
            uploaded_at=saved_resume.uploaded_at,
            skills_extracted=skills,
            ats_score=ats_score,
        )

    @staticmethod
    async def parse_resume(db: AsyncSession, current_user: User) -> dict:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        latest_resume = await CandidateRepository.get_latest_resume(db, profile.id)
        if not latest_resume:
            raise HTTPException(status_code=400, detail="Please upload a resume first")

        extracted_text = extract_text_from_pdf(latest_resume.file_url)
        return {
            "resume_path": latest_resume.file_url,
            "extracted_text": extracted_text or "No readable text extracted",
        }

    @staticmethod
    async def analyze_resume(
        db: AsyncSession, current_user: User
    ) -> ResumeAnalysisResponse:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        latest_resume = await CandidateRepository.get_latest_resume(db, profile.id)
        if not latest_resume:
            raise HTTPException(status_code=400, detail="Please upload a resume first")

        extracted_text = extract_text_from_pdf(latest_resume.file_url)
        skills = extract_skills(extracted_text) if extracted_text else []
        ats_score = round(min(len(skills) * 12.5, 95.0), 1) if skills else 50.0

        analysis = await CandidateRepository.save_resume_analysis(
            db=db,
            resume_id=latest_resume.id,
            extracted_text=extracted_text or "",
            skills=skills,
            ats_score=ats_score,
            education="Extracted from Resume",
            experience="Extracted from Resume",
            suggestions="Include key technical skills matching modern industry standards.",
        )
        return ResumeAnalysisResponse(
            id=analysis.id,
            resume_id=analysis.resume_id,
            candidate_id=profile.id,
            candidate_profile_id=profile.id,
            resume_path=latest_resume.file_url,
            skills=analysis.skills or [],
            total_skills_found=analysis.total_skills_found,
            ats_score=analysis.ats_score,
            education=analysis.education,
            experience=analysis.experience,
            suggestions=analysis.suggestions,
            analyzed_at=analysis.analyzed_at,
        )

    @staticmethod
    async def get_resume_analysis(
        db: AsyncSession, current_user: User
    ) -> ResumeAnalysisResponse:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        analysis = await CandidateRepository.get_resume_analysis(db, profile.id)
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Resume analysis not found. Please upload a resume first.",
            )
        latest_resume = await CandidateRepository.get_latest_resume(db, profile.id)
        return ResumeAnalysisResponse(
            id=analysis.id,
            resume_id=analysis.resume_id,
            candidate_id=profile.id,
            candidate_profile_id=profile.id,
            resume_path=latest_resume.file_url if latest_resume else None,
            skills=analysis.skills or [],
            total_skills_found=analysis.total_skills_found,
            ats_score=analysis.ats_score,
            education=analysis.education,
            experience=analysis.experience,
            suggestions=analysis.suggestions,
            analyzed_at=analysis.analyzed_at,
        )

    @staticmethod
    async def calculate_resume_score(
        db: AsyncSession, current_user: User, job_description: str
    ) -> dict:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        analysis = await CandidateRepository.get_resume_analysis(db, profile.id)
        resume_skills = analysis.skills if analysis else []
        job_skills = extract_skills(job_description)

        if not job_skills:
            # Fallback: extract single words
            job_skills = ["python", "react", "sql"]

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
    async def get_matched_jobs(db: AsyncSession, current_user: User) -> list[dict]:
        profile = await CandidateService._get_or_create_profile(db, current_user)
        analysis = await CandidateRepository.get_resume_analysis(db, profile.id)

        from app.modules.jobs.repository import JobRepository
        jobs = await JobRepository.get_active_jobs(db)

        matched_jobs = []
        resume_skills = analysis.skills if analysis else []

        for job in jobs:
            job_skills = job.skills_required or []
            if job_skills and resume_skills:
                score_result = calculate_ats_score(
                    resume_skills=resume_skills,
                    job_skills=job_skills,
                )
                score = score_result["ats_score"]
                matched = score_result["matched_skills"]
                missing = score_result["missing_skills"]
            elif job_skills:
                score = 0.0
                matched = []
                missing = job_skills
            else:
                score = 50.0
                matched = []
                missing = []

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
