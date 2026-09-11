import asyncio
import sys
from datetime import datetime, timedelta, timezone

from app.database.session import AsyncSessionLocal
from app.modules.applications.models import Application, InterviewQuestions
from app.modules.auth.models import User
from app.modules.auth.utils import hash_password
from app.modules.candidate.models import Candidate, Resume, ResumeAnalysis
from app.modules.interviews.models import Interview
from app.modules.jobs.models import Job
from app.modules.notifications.models import Notification
from app.modules.recruiter.models import Company, Recruiter
from app.modules.saved_jobs.models import SavedJob


async def seed():
    async with AsyncSessionLocal() as db:
        print("[*] Seeding realistic HireAI database...")

        # 1. USERS
        admin_user = User(
            name="Platform Admin",
            email="admin@test.com",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
        )
        recruiter_user_1 = User(
            name="Priya Sharma",
            email="recruiter@test.com",
            password_hash=hash_password("password123"),
            role="recruiter",
            is_active=True,
        )
        recruiter_user_2 = User(
            name="Rahul Verma",
            email="recruiter2@techcorp.com",
            password_hash=hash_password("password123"),
            role="recruiter",
            is_active=True,
        )
        candidate_user_1 = User(
            name="Akanksha Candidate",
            email="candidate@test.com",
            password_hash=hash_password("password123"),
            role="candidate",
            is_active=True,
        )
        candidate_user_2 = User(
            name="John Doe",
            email="john.doe@email.com",
            password_hash=hash_password("password123"),
            role="candidate",
            is_active=True,
        )
        candidate_user_3 = User(
            name="Sarah Smith",
            email="sarah.smith@email.com",
            password_hash=hash_password("password123"),
            role="candidate",
            is_active=True,
        )

        db.add_all([
            admin_user,
            recruiter_user_1,
            recruiter_user_2,
            candidate_user_1,
            candidate_user_2,
            candidate_user_3,
        ])
        await db.flush()

        # 2. COMPANIES
        company_1 = Company(
            company_name="TechCorp India",
            website="https://techcorp.in",
            industry="Artificial Intelligence & Cloud",
            location="Bangalore, India",
            description="Leading AI and cloud engineering solutions company building high-scale distributed systems.",
        )
        company_2 = Company(
            company_name="CloudScale Systems",
            website="https://cloudscale.io",
            industry="Enterprise SaaS & DevOps",
            location="Hyderabad, India",
            description="Pioneering cloud infrastructure, Kubernetes orchestration, and enterprise observability tools.",
        )
        db.add_all([company_1, company_2])
        await db.flush()

        # 3. RECRUITER PROFILES
        recruiter_1 = Recruiter(
            user_id=recruiter_user_1.id,
            company_id=company_1.id,
            designation="Talent Acquisition Lead",
            phone="+91 9876543210",
        )
        recruiter_2 = Recruiter(
            user_id=recruiter_user_2.id,
            company_id=company_2.id,
            designation="Engineering Recruitment Manager",
            phone="+91 9876543211",
        )
        db.add_all([recruiter_1, recruiter_2])
        await db.flush()

        # 4. CANDIDATE PROFILES
        cand_1 = Candidate(
            user_id=candidate_user_1.id,
            phone="+91 9812345678",
            education="B.Tech Computer Science, IIT Delhi (2024)",
            experience="2 years experience building FastAPI backends, PostgreSQL databases, and React web apps.",
            location="Bangalore, India",
        )
        cand_2 = Candidate(
            user_id=candidate_user_2.id,
            phone="+91 9823456789",
            education="B.S. Software Engineering, NIT Surathkal (2023)",
            experience="Frontend specialist with 3 years building complex dashboards in React, TypeScript, and Tailwind CSS.",
            location="Remote, India",
        )
        cand_3 = Candidate(
            user_id=candidate_user_3.id,
            phone="+91 9834567890",
            education="M.Tech Distributed Systems, BITS Pilani (2022)",
            experience="Full stack & Cloud engineer specializing in Python, Docker, Kubernetes, microservices, and AWS.",
            location="Pune, India",
        )
        db.add_all([cand_1, cand_2, cand_3])
        await db.flush()

        # 5. RESUMES & ANALYSES
        resume_1 = Resume(
            candidate_id=cand_1.id,
            file_url="uploads/resumes/candidate_akanksha.pdf",
        )
        resume_2 = Resume(
            candidate_id=cand_2.id,
            file_url="uploads/resumes/candidate_john.pdf",
        )
        resume_3 = Resume(
            candidate_id=cand_3.id,
            file_url="uploads/resumes/candidate_sarah.pdf",
        )
        db.add_all([resume_1, resume_2, resume_3])
        await db.flush()

        analysis_1 = ResumeAnalysis(
            resume_id=resume_1.id,
            extracted_text="Akanksha Software Engineer. Skills: Python, FastAPI, PostgreSQL, React, Docker, Git, REST APIs, SQL, AsyncIO.",
            skills=["python", "fastapi", "postgresql", "react", "docker", "git", "rest api", "sql", "asyncio"],
            total_skills_found=9,
            ats_score=88.5,
            education="B.Tech Computer Science",
            experience="2 years Full Stack Development",
            suggestions="Strong skills in backend development. Consider adding certifications in AWS Cloud Architecture.",
        )
        analysis_2 = ResumeAnalysis(
            resume_id=resume_2.id,
            extracted_text="John Doe Frontend Developer. Skills: React, TypeScript, Tailwind CSS, JavaScript, Redux, Next.js, HTML5, CSS3, Vite.",
            skills=["react", "typescript", "tailwindcss", "javascript", "redux", "next.js", "html5", "css3", "vite"],
            total_skills_found=9,
            ats_score=92.0,
            education="B.S. Software Engineering",
            experience="3 years Frontend Architecture",
            suggestions="Excellent frontend expertise. Highlight performance optimization metrics in projects.",
        )
        analysis_3 = ResumeAnalysis(
            resume_id=resume_3.id,
            extracted_text="Sarah Smith Senior Cloud Engineer. Skills: Python, AWS, Docker, Kubernetes, PostgreSQL, CI/CD, Terraform, FastAPI, Microservices.",
            skills=["python", "aws", "docker", "kubernetes", "postgresql", "ci/cd", "terraform", "fastapi", "microservices"],
            total_skills_found=9,
            ats_score=95.0,
            education="M.Tech Distributed Systems",
            experience="4 years Cloud Infrastructure",
            suggestions="Outstanding profile for senior backend/cloud roles.",
        )
        db.add_all([analysis_1, analysis_2, analysis_3])
        await db.flush()

        # 6. JOBS
        job_1 = Job(
            recruiter_id=recruiter_1.id,
            company_id=company_1.id,
            title="Senior Python & Backend Engineer",
            description="We are seeking an experienced Backend Engineer to architect high-performance APIs and microservices. You will work with FastAPI, PostgreSQL, Redis, and Docker to power our next-generation AI platform.",
            location="Bangalore, India",
            employment_type="full_time",
            skills_required=["python", "fastapi", "postgresql", "docker", "sql", "git"],
            minimum_experience=2,
            salary_min=1800000,
            salary_max=2800000,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=30),
            is_active=True,
        )
        job_2 = Job(
            recruiter_id=recruiter_1.id,
            company_id=company_1.id,
            title="Lead React & Frontend Architect",
            description="Join TechCorp to craft world-class interactive web applications. You will spearhead our React 19 component design systems, integrate state-of-the-art UI animations, and deliver lightning-fast user experiences.",
            location="Bangalore (Hybrid)",
            employment_type="full_time",
            skills_required=["react", "typescript", "tailwindcss", "javascript", "vite"],
            minimum_experience=3,
            salary_min=1600000,
            salary_max=2500000,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=25),
            is_active=True,
        )
        job_3 = Job(
            recruiter_id=recruiter_2.id,
            company_id=company_2.id,
            title="Cloud DevOps & Kubernetes Specialist",
            description="Scale our multi-region Kubernetes clusters on AWS. Responsibilities include automated CI/CD pipelines with GitHub Actions, Terraform infrastructure-as-code, and microservices reliability.",
            location="Remote",
            employment_type="remote",
            skills_required=["aws", "docker", "kubernetes", "terraform", "ci/cd", "python"],
            minimum_experience=3,
            salary_min=2000000,
            salary_max=3200000,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=45),
            is_active=True,
        )
        job_4 = Job(
            recruiter_id=recruiter_2.id,
            company_id=company_2.id,
            title="Full Stack AI Application Developer",
            description="Build end-to-end applications integrating Large Language Models and real-time streaming interfaces. Stack includes FastAPI, React, PostgreSQL, and Docker.",
            location="Hyderabad, India",
            employment_type="full_time",
            skills_required=["python", "react", "fastapi", "postgresql", "docker"],
            minimum_experience=1,
            salary_min=1400000,
            salary_max=2200000,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=20),
            is_active=True,
        )
        job_5 = Job(
            recruiter_id=recruiter_1.id,
            company_id=company_1.id,
            title="Junior Frontend Developer (Internship)",
            description="Exciting 6-month internship with mentorship from senior engineers. Hands-on experience building clean responsive UIs with React, Tailwind CSS, and TypeScript.",
            location="Bangalore, India",
            employment_type="internship",
            skills_required=["react", "javascript", "tailwindcss", "html5", "css3"],
            minimum_experience=0,
            salary_min=400000,
            salary_max=600000,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=15),
            is_active=True,
        )
        job_6 = Job(
            recruiter_id=recruiter_2.id,
            company_id=company_2.id,
            title="Database Reliability Engineer (Contract)",
            description="6-month contract role focused on PostgreSQL query performance tuning, index optimization, read-replica scaling, and high availability.",
            location="Remote",
            employment_type="contract",
            skills_required=["postgresql", "sql", "docker", "python"],
            minimum_experience=4,
            salary_min=1800000,
            salary_max=2400000,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=35),
            is_active=True,
        )
        db.add_all([job_1, job_2, job_3, job_4, job_5, job_6])
        await db.flush()

        # 7. APPLICATIONS
        app_1 = Application(
            candidate_id=cand_1.id,
            job_id=job_1.id,
            resume_id=resume_1.id,
            status="interview",
            ai_match_score=92,
            recruiter_notes="Candidate demonstrates strong proficiency in Python and FastAPI. Recommended for technical round.",
        )
        app_2 = Application(
            candidate_id=cand_1.id,
            job_id=job_4.id,
            resume_id=resume_1.id,
            status="shortlisted",
            ai_match_score=85,
            recruiter_notes="Good full-stack profile with both React and FastAPI experience.",
        )
        app_3 = Application(
            candidate_id=cand_2.id,
            job_id=job_2.id,
            resume_id=resume_2.id,
            status="shortlisted",
            ai_match_score=95,
            recruiter_notes="Exceptional frontend portfolio and clean React code.",
        )
        app_4 = Application(
            candidate_id=cand_3.id,
            job_id=job_3.id,
            resume_id=resume_3.id,
            status="hired",
            ai_match_score=98,
            recruiter_notes="Outstanding system design and Kubernetes hands-on knowledge. Extended offer.",
        )
        app_5 = Application(
            candidate_id=cand_3.id,
            job_id=job_1.id,
            resume_id=resume_3.id,
            status="reviewing",
            ai_match_score=89,
        )
        db.add_all([app_1, app_2, app_3, app_4, app_5])
        await db.flush()

        # 8. INTERVIEW QUESTIONS
        iq_1 = InterviewQuestions(
            application_id=app_1.id,
            technical_questions=[
                "How does FastAPI handle asynchronous request execution under the hood?",
                "What is the difference between list and tuple in Python?",
                "Explain database indexing in PostgreSQL and how it optimizes query plans.",
                "Explain what a multi-stage Docker build is and why we use it.",
            ],
            behavioral_questions=[
                "Tell me about a challenging backend system you designed and built.",
                "How do you approach debugging production API latency bottlenecks?",
                "Describe a situation where you worked under a tight deadline to ship a feature.",
            ],
            hr_questions=[
                "Why are you interested in joining TechCorp India?",
                "What are your growth aspirations over the next 2 to 3 years?",
                "What is your notice period and current compensation expectation?",
            ],
            coding_questions=[
                "Write a Python function to find the first non-repeating character in a string.",
                "Write a FastAPI endpoint that validates an incoming payload using Pydantic.",
            ],
        )
        db.add(iq_1)
        await db.flush()

        # 9. SCHEDULED INTERVIEWS
        interview_time_1 = datetime.now(timezone.utc) + timedelta(days=2, hours=3)
        iv_1 = Interview(
            application_id=app_1.id,
            candidate_id=cand_1.id,
            recruiter_id=recruiter_1.id,
            scheduled_at=interview_time_1,
            duration_minutes=45,
            round_name="Technical Deep Dive (Round 1)",
            meeting_link="https://meet.google.com/hireai-tech-eval",
            notes="Please be prepared with a shared coding environment.",
            status="scheduled",
        )
        db.add(iv_1)
        await db.flush()

        # 10. SAVED JOBS
        saved_1 = SavedJob(candidate_id=cand_1.id, job_id=job_2.id)
        saved_2 = SavedJob(candidate_id=cand_1.id, job_id=job_3.id)
        saved_3 = SavedJob(candidate_id=cand_2.id, job_id=job_5.id)
        db.add_all([saved_1, saved_2, saved_3])
        await db.flush()

        # 11. NOTIFICATIONS
        notif_1 = Notification(
            user_id=candidate_user_1.id,
            title="Interview Scheduled!",
            message=f"Your technical round for 'Senior Python & Backend Engineer' has been scheduled on {interview_time_1.strftime('%b %d, %Y at %I:%M %p')}.",
            type="interview",
            link="/candidate/dashboard?tab=interviews",
            is_read=False,
        )
        notif_2 = Notification(
            user_id=candidate_user_1.id,
            title="You've Been Shortlisted!",
            message="Your application for 'Full Stack AI Application Developer' at CloudScale Systems has been shortlisted.",
            type="application_status",
            link="/candidate/dashboard?tab=applications",
            is_read=False,
        )
        notif_3 = Notification(
            user_id=candidate_user_3.id,
            title="Congratulations! You're Hired!",
            message="Your offer for 'Cloud DevOps & Kubernetes Specialist' has been approved and issued.",
            type="application_status",
            link="/candidate/dashboard?tab=applications",
            is_read=True,
        )
        notif_4 = Notification(
            user_id=recruiter_user_1.id,
            title="New Application Received",
            message="Akanksha Candidate applied for 'Senior Python & Backend Engineer' (Match Score: 92%).",
            type="info",
            link=f"/recruiter/job-applicants/{job_1.id}",
            is_read=False,
        )
        db.add_all([notif_1, notif_2, notif_3, notif_4])

        await db.commit()

        print("\n" + "=" * 55)
        print("DATABASE SEEDED WITH REALISTIC ENTERPRISE DATA!")
        print("=" * 55)
        print("\nLOGIN CREDENTIALS:")
        print("  1. ADMIN:")
        print("     Email:    admin@test.com")
        print("     Password: password123")
        print("     Role:     admin (Access to Admin Console)\n")
        print("  2. RECRUITER:")
        print("     Email:    recruiter@test.com")
        print("     Password: password123")
        print("     Role:     recruiter (TechCorp India)\n")
        print("  3. CANDIDATE:")
        print("     Email:    candidate@test.com")
        print("     Password: password123")
        print("     Role:     candidate (92% match score, scheduled interview)\n")
        print("=" * 55)


if __name__ == "__main__":
    asyncio.run(seed())
