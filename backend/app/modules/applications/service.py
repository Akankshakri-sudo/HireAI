import logging

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.llm import coerce_str_list, generate_json
from app.modules.applications.models import (
    APPLICATION_STATUSES,
    Application,
)
from app.modules.applications.repository import (
    ApplicationRepository,
)
from app.modules.auth.models import User
from app.modules.candidate.ats_calculator import (
    calculate_ats_score,
)
from app.modules.candidate.repository import CandidateRepository
from app.modules.jobs.repository import JobRepository

logger = logging.getLogger(__name__)


SKILL_QUESTIONS = {
    "python": {
        "tech": [
            "What is the difference between list and tuple in Python?",
            "Explain Python decorators and how they are used.",
            "What are generators in Python and how do they save memory?",
        ],
        "coding": [
            "Write a Python function to reverse a linked list.",
            "Write a Python function to find the first non-repeating character in a string.",
        ]
    },
    "javascript": {
        "tech": [
            "What is the difference between '==' and '===' in JavaScript?",
            "Explain closures and how they are useful in JavaScript development.",
            "What is the Event Loop in JavaScript and how does asynchronous execution work?",
        ],
        "coding": [
            "Implement a debounce function in pure JavaScript.",
            "Write a function to deep clone an object in JavaScript.",
        ]
    },
    "typescript": {
        "tech": [
            "What is the difference between an interface and a type alias in TypeScript?",
            "Explain generics in TypeScript with a quick example.",
            "What are utility types in TypeScript (e.g. Partial, Pick, Omit)?",
        ],
        "coding": [
            "Write a TypeScript generic interface for a standard API response wrapper.",
        ]
    },
    "react": {
        "tech": [
            "What are React hooks? Explain the rules of using them.",
            "Explain the difference between functional and class components in React.",
            "What is the virtual DOM and how does React optimize rendering?",
        ],
        "coding": [
            "Create a custom React hook `useLocalStorage` to persist state across page reloads.",
            "Write a simple toggle button component in React using useState.",
        ]
    },
    "fastapi": {
        "tech": [
            "How does FastAPI handle asynchronous request execution under the hood?",
            "What is Pydantic and how is it used in FastAPI for validation?",
            "How do you handle dependency injection in FastAPI?",
        ],
        "coding": [
            "Write a FastAPI endpoint that receives a JSON body containing a username and email, validates them using Pydantic, and returns a success status.",
        ]
    },
    "sql": {
        "tech": [
            "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?",
            "Explain indexing in databases and how it speeds up query execution.",
            "What are database transactions and what does ACID stand for?",
        ],
        "coding": [
            "Write a SQL query to find the second highest salary from an Employee table.",
        ]
    },
    "docker": {
        "tech": [
            "What is the difference between a Docker image and a Docker container?",
            "Explain what a multi-stage Docker build is and why we use it.",
            "What is Docker Compose and how does it manage multi-container apps?",
        ],
        "coding": [
            "Write a simple Dockerfile for a Python FastAPI application.",
        ]
    },
    "aws": {
        "tech": [
            "What is the difference between S3, EC2, and RDS in AWS?",
            "How does AWS IAM manage authorization and resource access?",
            "What is AWS Lambda and when would you use serverless computing?",
        ],
        "coding": [
            "Write a python snippet using boto3 to upload a local file to an AWS S3 bucket.",
        ]
    }
}


class ApplicationService:

    @staticmethod
    async def apply_to_job(
        db: AsyncSession,
        job_id: int,
        current_user: User,
    ):
        candidate_profile = (
            await CandidateRepository.get_profile_by_user_id(
                db,
                current_user.id,
            )
        )

        if not candidate_profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found",
            )

        resume_analysis = (
            await CandidateRepository.get_resume_analysis(
                db,
                candidate_profile.id,
            )
        )

        if not resume_analysis:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Resume analysis not found. "
                    "Upload and analyze your resume first."
                ),
            )

        job = await JobRepository.get_job_by_id(
            db,
            job_id,
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        existing_application = (
            await ApplicationRepository.get_by_candidate_and_job(
                db,
                candidate_profile.id,
                job.id,
            )
        )

        if existing_application:
            raise HTTPException(
                status_code=400,
                detail="You have already applied to this job",
            )

        score_result = calculate_ats_score(
            resume_skills=resume_analysis.skills or [],
            job_skills=job.required_skills or [],
        )

        application = Application(
            candidate_id=candidate_profile.id,
            job_id=job.id,
            resume_id=resume_analysis.resume_id,
            status="applied",
            ai_match_score=round(score_result["ats_score"]),
        )

        return await ApplicationRepository.create_application(
            db,
            application,
        )
        
    @staticmethod
    async def get_my_applications(
        db: AsyncSession,
        current_user: User,
    ):
        candidate_profile = (
            await CandidateRepository.get_profile_by_user_id(
                db,
                current_user.id,
            )
        )

        if not candidate_profile:
            raise HTTPException(
                status_code=404,
                detail="Candidate profile not found",
            )

        return await ApplicationRepository.get_candidate_applications(
            db,
            candidate_profile.id,
        )

    @staticmethod
    async def get_job_applicants(
        db: AsyncSession,
        job_id: int,
        current_user: User,
    ):
        from app.modules.recruiter.repository import RecruiterRepository
        recruiter_profile = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )
        if not recruiter_profile:
            raise HTTPException(
                status_code=403,
                detail="Access denied: Recruiter profile not found",
            )
            
        job = await JobRepository.get_job_by_id(db, job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )
            
        if job.recruiter_id != recruiter_profile.id:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not own this job listing",
            )
            
        return await ApplicationRepository.get_job_applications_detailed(db, job_id)

    @staticmethod
    async def update_application_status(
        db: AsyncSession,
        application_id: int,
        status: str,
        current_user: User,
    ):
        status = (status or "").strip().lower()
        if status not in APPLICATION_STATUSES:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Invalid status '{status}'. "
                    f"Allowed values: {', '.join(APPLICATION_STATUSES)}"
                ),
            )

        from app.modules.recruiter.repository import RecruiterRepository
        recruiter_profile = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )
        if not recruiter_profile:
            raise HTTPException(
                status_code=403,
                detail="Access denied: Recruiter profile not found",
            )
            
        application = await ApplicationRepository.get_by_id(db, application_id)
        if not application:
            raise HTTPException(
                status_code=404,
                detail="Application not found",
            )
            
        job = await JobRepository.get_job_by_id(db, application.job_id)
        if not job or job.recruiter_id != recruiter_profile.id:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not own this job listing",
            )

        application = await ApplicationRepository.update_status(db, application, status)

        # Notify candidate
        try:
            from app.modules.notifications.models import Notification
            from app.modules.notifications.repository import NotificationRepository
            cand = await CandidateRepository.get_profile_by_id(db, application.candidate_id)
            if cand and cand.user_id:
                status_titles = {
                    "shortlisted": "You've Been Shortlisted! 🌟",
                    "interview": "Interview Stage! 📅",
                    "hired": "Congratulations! You're Hired! 🎉",
                    "rejected": "Application Status Update",
                    "reviewing": "Application Under Review",
                }
                title = status_titles.get(application.status, f"Application Status: {application.status.capitalize()}")
                notif = Notification(
                    user_id=cand.user_id,
                    title=title,
                    message=f"Your application for '{job.title}' has been updated to: {application.status.upper()}.",
                    type="application_status",
                    link="/candidate/dashboard?tab=applications",
                )
                await NotificationRepository.create(db, notif)
        except Exception:
            logger.warning(
                "Failed to create status-change notification for application %s",
                application_id,
                exc_info=True,
            )

        return application

    @staticmethod
    async def _llm_question_sheet(
        job_title: str,
        job_description: str,
        job_skills: list[str],
        candidate_skills: list[str],
        matched_skills: list[str],
    ) -> tuple[list[str], list[str], list[str], list[str]] | None:
        """Generate a tailored question sheet with Gemini.

        Returns (technical, coding, behavioral, hr) or None when the LLM is
        unavailable / returned an unusable payload.
        """
        prompt = f"""You are a senior technical interviewer preparing an interview question sheet.

Job title: {job_title}
Job description: {job_description[:1500]}
Required skills: {", ".join(job_skills) or "not specified"}
Candidate skills (from resume): {", ".join(candidate_skills) or "not specified"}
Overlapping skills: {", ".join(matched_skills) or "none"}

Generate an interview sheet tailored to this exact candidate-job pair. Focus technical
questions on the overlapping skills (or the job's required skills when there is no overlap).

Return ONLY a JSON object with these keys:
{{
  "technical": [4 to 6 technical questions probing depth in the relevant skills],
  "coding": [2 to 3 practical coding exercises appropriate for this role],
  "behavioral": [4 behavioral questions informed by the candidate's skill set],
  "hr": [4 standard HR/fit questions]
}}"""
        raw = await generate_json(
            prompt,
            system="You are an expert technical interviewer. Respond with JSON only.",
        )
        if not isinstance(raw, dict):
            return None

        technical = coerce_str_list(raw.get("technical"), 6)
        coding = coerce_str_list(raw.get("coding"), 3)
        behavioral = coerce_str_list(raw.get("behavioral"), 4)
        hr = coerce_str_list(raw.get("hr"), 4)

        if not technical or not coding:
            return None
        return technical, coding, behavioral, hr

    @staticmethod
    def _template_question_sheet(
        matched_skills: list[str],
        job_skills: list[str],
    ) -> tuple[list[str], list[str], list[str], list[str]]:
        """Deterministic fallback question sheet built from the skill template bank."""
        skills_to_use = matched_skills or job_skills
        if not skills_to_use:
            skills_to_use = ["python", "javascript", "react", "sql"]

        tech_questions: list[str] = []
        coding_questions: list[str] = []
        for skill in skills_to_use:
            if skill in SKILL_QUESTIONS:
                tech_questions.extend(SKILL_QUESTIONS[skill]["tech"])
                coding_questions.extend(SKILL_QUESTIONS[skill]["coding"])

        tech_questions = list(dict.fromkeys(tech_questions))[:4]
        coding_questions = list(dict.fromkeys(coding_questions))[:2]

        if not tech_questions:
            tech_questions = [
                "Explain the concept of OOP (Object Oriented Programming) and its pillars.",
                "What is a RESTful API and what are the standard HTTP methods?",
                "How do you design a database schema for scale? Explain normalization.",
                "What is the difference between git merge and git rebase?",
            ]
        if not coding_questions:
            coding_questions = [
                "Write a function to check if a string is a palindrome.",
                "Write a function to return the prime numbers up to N.",
            ]

        behavioral_questions = [
            "Tell me about a challenging project you built. What technologies did you use and what obstacles did you overcome?",
            "Describe a time you had a conflict with a team member or stakeholder. How did you resolve it?",
            "How do you prioritize your tasks when working under tight deadlines?",
            "Tell me about a time you had to learn a new tool or technology quickly for a project.",
        ]

        hr_questions = [
            "Why are you interested in joining our company as a developer?",
            "What are your salary expectations and availability to start?",
            "Where do you see yourself in 5 years? What are your career goals?",
            "Why should we hire you over other candidates for this job?",
        ]

        return tech_questions, coding_questions, behavioral_questions, hr_questions

    @staticmethod
    async def generate_interview_questions(
        db: AsyncSession,
        application_id: int,
        current_user: User,
    ):
        from app.modules.recruiter.repository import RecruiterRepository
        recruiter_profile = await RecruiterRepository.get_profile_by_user_id(
            db,
            current_user.id,
        )
        if not recruiter_profile:
            raise HTTPException(
                status_code=403,
                detail="Access denied: Recruiter profile not found",
            )
            
        application = await ApplicationRepository.get_by_id(db, application_id)
        if not application:
            raise HTTPException(
                status_code=404,
                detail="Application not found",
            )
            
        job = await JobRepository.get_job_by_id(db, application.job_id)
        if not job or job.recruiter_id != recruiter_profile.id:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not own this job listing",
            )
            
        # Check if already generated and saved in db
        questions_record = await ApplicationRepository.get_interview_questions(db, application_id)
        if questions_record:
            return {
                "application_id": questions_record.application_id,
                "technical": questions_record.technical_questions,
                "behavioral": questions_record.behavioral_questions,
                "hr": questions_record.hr_questions,
                "coding": questions_record.coding_questions,
            }

        from app.modules.candidate.repository import CandidateRepository
        resume_analysis = await CandidateRepository.get_resume_analysis(
            db,
            application.candidate_id,
        )

        # Collect matched skills
        candidate_skills = [s.lower() for s in (resume_analysis.skills if resume_analysis else [])]
        job_skills = [s.lower() for s in (job.required_skills or [])]
        matched_skills = sorted(set(candidate_skills).intersection(set(job_skills)))

        llm_questions = await ApplicationService._llm_question_sheet(
            job_title=job.title,
            job_description=job.description or "",
            job_skills=job_skills,
            candidate_skills=candidate_skills,
            matched_skills=matched_skills,
        )
        if llm_questions is not None:
            tech_questions, coding_questions, behavioral_questions, hr_questions = llm_questions
        else:
            (
                tech_questions,
                coding_questions,
                behavioral_questions,
                hr_questions,
            ) = ApplicationService._template_question_sheet(matched_skills, job_skills)
        
        # Save to database
        from app.modules.applications.models import InterviewQuestions
        questions_record = InterviewQuestions(
            application_id=application_id,
            technical_questions=tech_questions,
            behavioral_questions=behavioral_questions,
            hr_questions=hr_questions,
            coding_questions=coding_questions
        )
        await ApplicationRepository.save_interview_questions(db, questions_record)

        return {
            "application_id": application.id,
            "technical": tech_questions,
            "behavioral": behavioral_questions,
            "hr": hr_questions,
            "coding": coding_questions,
        }

    @staticmethod
    async def get_recruiter_stats_service(
        db: AsyncSession,
        user_id: int,
    ):
        from app.modules.recruiter.repository import RecruiterRepository
        recruiter = await RecruiterRepository.get_profile_by_user_id(db, user_id)
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")
            
        return await ApplicationRepository.get_recruiter_stats(db, user_id)