import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
import uuid

# Helper to generate unique emails
def get_unique_email():
    return f"test_{uuid.uuid4().hex[:6]}@hireai.com"

@pytest.mark.asyncio
async def test_full_platform_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # =====================================================================
        # 1. CANDIDATE FLOW
        # =====================================================================
        candidate_email = get_unique_email()
        candidate_password = "candidatepassword"
        candidate_name = "Jane Candidate"

        # Register Candidate
        reg_resp = await ac.post("/auth/register", json={
            "full_name": candidate_name,
            "email": candidate_email,
            "password": candidate_password,
            "role": "candidate"
        })
        assert reg_resp.status_code == 201
        assert reg_resp.json()["email"] == candidate_email

        # Login Candidate
        login_resp = await ac.post("/auth/login", data={
            "username": candidate_email,
            "password": candidate_password
        })
        assert login_resp.status_code == 200
        candidate_token = login_resp.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {candidate_token}"}

        # Create Candidate Profile
        create_profile_resp = await ac.post("/candidate/profile", headers=cand_headers, json={
            "phone": "+1234567890",
            "college": "Tech State University",
            "degree": "B.S. Computer Science",
            "graduation_year": 2025,
            "skills": "python, javascript, react, fastapi",
            "experience": "Software engineering intern at startup."
        })
        assert create_profile_resp.status_code == 201

        # Update Candidate Profile
        update_profile_resp = await ac.put("/candidate/profile", headers=cand_headers, json={
            "phone": "+1234567890",
            "college": "Tech State University (Honors)",
            "degree": "B.S. Computer Science",
            "graduation_year": 2025,
            "skills": "python, javascript, react, fastapi, docker, sql",
            "experience": "Software engineering intern at startup."
        })
        assert update_profile_resp.status_code == 200

        # =====================================================================
        # 2. RECRUITER FLOW
        # =====================================================================
        recruiter_email = get_unique_email()
        recruiter_password = "recruiterpassword"

        # Register Recruiter
        rec_reg_resp = await ac.post("/auth/register", json={
            "full_name": "John Recruiter",
            "email": recruiter_email,
            "password": recruiter_password,
            "role": "recruiter"
        })
        assert rec_reg_resp.status_code == 201

        # Login Recruiter
        rec_login_resp = await ac.post("/auth/login", data={
            "username": recruiter_email,
            "password": recruiter_password
        })
        assert rec_login_resp.status_code == 200
        recruiter_token = rec_login_resp.json()["access_token"]
        rec_headers = {"Authorization": f"Bearer {recruiter_token}"}

        # Create Company
        company_resp = await ac.post("/recruiter/company", headers=rec_headers, json={
            "name": f"Innovate Solutions LLC {uuid.uuid4().hex[:4]}",
            "website": "https://innovate.com",
            "industry": "Artificial Intelligence",
            "location": "Boston, MA",
            "description": "Building next-generation language models."
        })
        assert company_resp.status_code == 201
        company_id = company_resp.json()["id"]

        # Create Recruiter Profile
        rec_profile_resp = await ac.post("/recruiter/profile", headers=rec_headers, json={
            "company_id": company_id,
            "designation": "Director of Talent",
            "phone": "+1122334455"
        })
        assert rec_profile_resp.status_code == 201

        # Get Recruiter Profile
        get_rec_profile = await ac.get("/recruiter/profile", headers=rec_headers)
        assert get_rec_profile.status_code == 200
        assert get_rec_profile.json()["designation"] == "Director of Talent"

        # Create Job Post
        job_resp = await ac.post("/jobs", headers=rec_headers, json={
            "title": "Software Developer - FastAPI Specialization",
            "description": "We are seeking a developer with extensive knowledge in Python and FastAPI to build clean RESTful APIs.",
            "location": "Boston, MA",
            "employment_type": "full-time",
            "required_skills": ["python", "fastapi", "sql"],
            "minimum_experience": 2,
            "salary_min": 100000,
            "salary_max": 150000
        })
        assert job_resp.status_code == 201
        job_id = job_resp.json()["id"]

        # Fetch Active Jobs List
        all_jobs_resp = await ac.get("/jobs")
        assert all_jobs_resp.status_code == 200
        assert len(all_jobs_resp.json()) > 0

        # =====================================================================
        # 3. RESUME UPLOAD, PARSING, AND ANALYSIS FLOW
        # =====================================================================
        import os
        resume_path = os.path.join("..", "scratch_resume.pdf")
        assert os.path.exists(resume_path), f"Resume path {resume_path} does not exist"

        with open(resume_path, "rb") as f:
            upload_resp = await ac.post(
                "/candidate/resume",
                headers=cand_headers,
                files={"file": ("resume.pdf", f, "application/pdf")}
            )
        assert upload_resp.status_code == 200

        # Parse Resume
        parse_resp = await ac.post("/candidate/resume/parse", headers=cand_headers)
        assert parse_resp.status_code == 200
        assert "extracted_text" in parse_resp.json()

        # Analyze Resume (performs extraction)
        analyze_resp = await ac.post("/candidate/resume/analyze", headers=cand_headers)
        assert analyze_resp.status_code == 200
        assert "skills" in analyze_resp.json()

        # =====================================================================
        # 4. JOB MATCHING & APPLICATION Lifecycle
        # =====================================================================
        # Get matched jobs for the candidate
        matched_jobs_resp = await ac.get("/candidate/matched-jobs", headers=cand_headers)
        assert matched_jobs_resp.status_code == 200
        matched_jobs = matched_jobs_resp.json()
        assert len(matched_jobs) > 0
        matched_job_ids = [mj["job_id"] for mj in matched_jobs]
        assert job_id in matched_job_ids

        # Apply to job
        apply_resp = await ac.post(f"/applications/{job_id}", headers=cand_headers)
        assert apply_resp.status_code == 201
        app_id = apply_resp.json()["id"]

        # Try applying again (should be 400 Bad Request)
        reapply_resp = await ac.post(f"/applications/{job_id}", headers=cand_headers)
        assert reapply_resp.status_code == 400

        # Fetch candidate's applications
        my_apps_resp = await ac.get("/applications/my", headers=cand_headers)
        assert my_apps_resp.status_code == 200
        my_apps = my_apps_resp.json()
        assert len(my_apps) > 0
        assert my_apps[0]["job_id"] == job_id

        # =====================================================================
        # 5. RECRUITER LIFECYCLE MANAGEMENT & AI TOOLS
        # =====================================================================
        # Fetch job applicants
        applicants_resp = await ac.get(f"/applications/jobs/{job_id}", headers=rec_headers)
        assert applicants_resp.status_code == 200
        applicants = applicants_resp.json()
        assert len(applicants) > 0
        assert applicants[0]["id"] == app_id

        # Update application status
        status_resp = await ac.put(f"/applications/{app_id}/status?status=shortlisted", headers=rec_headers)
        assert status_resp.status_code == 200
        assert status_resp.json()["status"] == "shortlisted"

        # Generate Interview Questions
        questions_resp = await ac.post(f"/applications/{app_id}/interview-questions", headers=rec_headers)
        assert questions_resp.status_code == 200
        questions = questions_resp.json()
        assert "technical" in questions
        assert "behavioral" in questions
        assert "coding" in questions
        assert "hr" in questions

