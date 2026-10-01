import asyncio
import os
import fitz
from httpx import ASGITransport, AsyncClient
from app.main import app


async def test_full_system():
    print("=" * 60)
    print("[*] RUNNING COMPREHENSIVE END-TO-END VERIFICATION OF HIREAI")
    print("=" * 60)

    # 1. CREATE A TEST PDF RESUME
    pdf_path = "e2e_test_resume.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (50, 72),
        "Alex Developer - Full Stack Engineer\n\n"
        "Summary: Experienced software engineer with 3+ years in cloud and web.\n\n"
        "Skills:\n"
        "Python, FastAPI, PostgreSQL, React, TypeScript, Docker, Git, SQL, AWS, Redis\n\n"
        "Experience:\n"
        "Software Engineer at Tech Startup: Built asynchronous microservices with FastAPI and PostgreSQL.\n"
        "Designed rich interactive UIs using React and Tailwind CSS.\n\n"
        "Education:\n"
        "Bachelor of Technology in Computer Science\n",
        fontsize=11
    )
    doc.save(pdf_path)
    doc.close()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # ----------------------------------------------------
        # TEST 1: CANDIDATE REGISTRATION & LOGIN
        # ----------------------------------------------------
        print("\n[STEP 1] Testing Candidate Registration & Login...")
        cand_email = f"alex.cand.{os.getpid()}@test.com"
        reg_res = await client.post("/auth/register", json={
            "full_name": "Alex Developer",
            "email": cand_email,
            "password": "password123",
            "role": "candidate"
        })
        assert reg_res.status_code in (200, 201), f"Candidate registration failed: {reg_res.text}"
        print(f"  -> Candidate registered successfully: {cand_email}")

        login_res = await client.post("/auth/login", data={
            "username": cand_email,
            "password": "password123"
        })
        assert login_res.status_code == 200, f"Candidate login failed: {login_res.text}"
        cand_token = login_res.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}
        print("  -> Candidate token obtained.")

        # Check /auth/me
        me_res = await client.get("/auth/me", headers=cand_headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == cand_email
        print(f"  -> /auth/me verified: {me_res.json()['full_name']} ({me_res.json()['role']})")

        # ----------------------------------------------------
        # TEST 2: CANDIDATE PROFILE & RESUME UPLOAD
        # ----------------------------------------------------
        print("\n[STEP 2] Testing Candidate Profile & Resume Upload...")
        prof_update = await client.put("/candidate/profile", json={
            "phone": "+91 9876540000",
            "education": "B.Tech Computer Science",
            "experience": "3 years building FastAPI & React web apps",
            "location": "Bangalore, India"
        }, headers=cand_headers)
        assert prof_update.status_code == 200
        print("  -> Candidate profile updated.")

        with open(pdf_path, "rb") as f:
            upload_res = await client.post(
                "/candidate/resume",
                files={"file": ("resume.pdf", f, "application/pdf")},
                headers=cand_headers,
            )
        assert upload_res.status_code == 200, f"Resume upload failed: {upload_res.text}"
        upload_data = upload_res.json()
        print(f"  -> Resume uploaded & parsed! Extracted skills: {upload_data.get('skills_extracted')}")
        print(f"  -> ATS baseline score: {upload_data.get('ats_score')}%")

        # ----------------------------------------------------
        # TEST 3: RECRUITER REGISTRATION & JOB CREATION
        # ----------------------------------------------------
        print("\n[STEP 3] Testing Recruiter Registration & Job Posting...")
        rec_email = f"rachel.rec.{os.getpid()}@test.com"
        rec_reg = await client.post("/auth/register", json={
            "full_name": "Rachel Recruiter",
            "email": rec_email,
            "password": "password123",
            "role": "recruiter"
        })
        assert rec_reg.status_code in (200, 201), f"Recruiter registration failed: {rec_reg.text}"
        print(f"  -> Recruiter registered: {rec_email}")

        rec_login = await client.post("/auth/login", data={
            "username": rec_email,
            "password": "password123"
        })
        assert rec_login.status_code == 200
        rec_token = rec_login.json()["access_token"]
        rec_headers = {"Authorization": f"Bearer {rec_token}"}

        # Create company
        comp_res = await client.post("/recruiter/company", json={
            "name": f"NextGen AI Labs {os.getpid()}",
            "website": "https://nextgenai.test",
            "industry": "Artificial Intelligence",
            "location": "Bangalore",
            "description": "Building high-performance AI agents"
        }, headers=rec_headers)
        assert comp_res.status_code in (200, 201), f"Create company failed: {comp_res.text}"
        comp_id = comp_res.json()["id"]
        print(f"  -> Company created: ID {comp_id}")

        # Create recruiter profile
        rec_prof = await client.post("/recruiter/profile", json={
            "company_id": comp_id,
            "designation": "Head of Talent",
            "phone": "+91 9988776655"
        }, headers=rec_headers)
        assert rec_prof.status_code in (200, 201), f"Create recruiter profile failed: {rec_prof.text}"
        print("  -> Recruiter profile linked to company.")

        # Post a job
        job_res = await client.post("/jobs", json={
            "title": "Lead Python & FastAPI Developer",
            "description": "We are seeking a senior engineer proficient in Python, FastAPI, PostgreSQL, and Docker to lead our platform team.",
            "location": "Bangalore, India",
            "employment_type": "full_time",
            "skills_required": ["python", "fastapi", "postgresql", "docker", "redis"],
            "minimum_experience": 2,
            "salary_min": 2000000,
            "salary_max": 3000000
        }, headers=rec_headers)
        assert job_res.status_code in (200, 201), f"Job creation failed: {job_res.text}"
        new_job = job_res.json()
        job_id = new_job["id"]
        print(f"  -> Job posted successfully: '{new_job['title']}' (ID: {job_id})")

        # ----------------------------------------------------
        # TEST 4: PUBLIC JOB BROWSING & MATCHING
        # ----------------------------------------------------
        print("\n[STEP 4] Testing Job Search & Semantic Matching...")
        search_res = await client.get("/jobs?search=FastAPI")
        assert search_res.status_code == 200
        found_jobs = search_res.json()
        assert any(j["id"] == job_id for j in found_jobs)
        print(f"  -> Public job search verified. Found {len(found_jobs)} matching jobs.")

        # Candidate checks matched jobs
        matches_res = await client.get("/candidate/matched-jobs", headers=cand_headers)
        assert matches_res.status_code == 200
        matches = matches_res.json()
        target_match = next((m for m in matches if m["job_id"] == job_id), None)
        assert target_match is not None
        print(f"  -> AI Matching Score for posted job: {target_match['match_score']}% (Matched: {target_match['matched_skills']})")

        # ----------------------------------------------------
        # TEST 5: SAVED JOBS
        # ----------------------------------------------------
        print("\n[STEP 5] Testing Saved Jobs Flow...")
        save_res = await client.post(f"/saved-jobs/{job_id}", headers=cand_headers)
        assert save_res.status_code == 201, f"Save job failed: {save_res.text}"
        print(f"  -> Job #{job_id} saved by candidate.")

        saved_list = await client.get("/saved-jobs", headers=cand_headers)
        assert saved_list.status_code == 200
        assert any(sj["job_id"] == job_id for sj in saved_list.json())
        print(f"  -> Saved jobs list verified ({len(saved_list.json())} items).")

        # ----------------------------------------------------
        # TEST 6: JOB APPLICATION FLOW
        # ----------------------------------------------------
        print("\n[STEP 6] Testing Job Application Flow...")
        app_res = await client.post(f"/applications/{job_id}", headers=cand_headers)
        assert app_res.status_code == 201, f"Application failed: {app_res.text}"
        app_data = app_res.json()
        app_id = app_data["id"]
        print(f"  -> Application submitted! (Application ID: {app_id}, Status: {app_data['status']}, Match Score: {app_data['ai_match_score']}%)")

        # Check candidate's application list
        my_apps = await client.get("/applications/my", headers=cand_headers)
        assert my_apps.status_code == 200
        assert any(a["job_id"] == job_id for a in my_apps.json())
        print("  -> /applications/my verified.")

        # ----------------------------------------------------
        # TEST 7: RECRUITER APPLICANT REVIEW & AI INTERVIEW QUESTIONS
        # ----------------------------------------------------
        print("\n[STEP 7] Testing Recruiter Applicant Review & AI Questions...")
        applicants_res = await client.get(f"/applications/jobs/{job_id}", headers=rec_headers)
        assert applicants_res.status_code == 200
        applicants = applicants_res.json()
        assert len(applicants) >= 1
        print(f"  -> Recruiter fetched applicants for Job #{job_id} ({len(applicants)} candidate(s)).")

        # Generate AI Interview Questions
        ai_q_res = await client.post(f"/applications/{app_id}/interview-questions", headers=rec_headers)
        assert ai_q_res.status_code == 200
        questions = ai_q_res.json()
        print("  -> AI Interview Questions generated:")
        print(f"     - Technical: {len(questions['technical'])} questions")
        print(f"     - Behavioral: {len(questions['behavioral'])} questions")
        print(f"     - Coding: {len(questions['coding'])} questions")
        print(f"     Sample: '{questions['technical'][0]}'")

        # Update application status to 'shortlisted'
        status_update = await client.put(f"/applications/{app_id}/status?status=shortlisted", headers=rec_headers)
        assert status_update.status_code == 200
        print("  -> Application status updated to 'shortlisted'.")

        # ----------------------------------------------------
        # TEST 8: INTERVIEW SCHEDULING & NOTIFICATIONS
        # ----------------------------------------------------
        print("\n[STEP 8] Testing Interview Scheduling & Notification Alerts...")
        iv_res = await client.post("/interviews", json={
            "application_id": app_id,
            "scheduled_at": "2026-09-20T10:00:00Z",
            "duration_minutes": 45,
            "round_name": "Technical Evaluation Round 1",
            "meeting_link": "https://meet.google.com/test-e2e-meeting",
            "notes": "Please prepare for live coding in Python."
        }, headers=rec_headers)
        assert iv_res.status_code == 201, f"Interview schedule failed: {iv_res.text}"
        iv_data = iv_res.json()
        iv_id = iv_data["id"]
        print(f"  -> Interview scheduled (ID: {iv_id}, Round: '{iv_data['round_name']}', Link: {iv_data['meeting_link']})")

        # Candidate checks their scheduled interviews
        cand_ivs = await client.get("/interviews/candidate", headers=cand_headers)
        assert cand_ivs.status_code == 200
        assert any(i["id"] == iv_id for i in cand_ivs.json())
        print("  -> Candidate retrieved scheduled interview in dashboard.")

        # Candidate checks notifications
        notifs_res = await client.get("/notifications", headers=cand_headers)
        assert notifs_res.status_code == 200
        notifs = notifs_res.json()
        assert len(notifs) >= 1
        print(f"  -> Candidate received {len(notifs)} real-time notifications:")
        for n in notifs[:2]:
            print(f"     - [{n['type']}] {n['title']}: {n['message']}")

        # ----------------------------------------------------
        # TEST 9: ADMIN CONSOLE GOVERNANCE & STATS
        # ----------------------------------------------------
        print("\n[STEP 9] Testing Admin Console Governance...")
        admin_login = await client.post("/auth/login", data={
            "username": "admin@test.com",
            "password": "password123"
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        stats_res = await client.get("/admin/stats", headers=admin_headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        print("  -> Platform Stats:")
        print(f"     - Total Users: {stats['total_users']}")
        print(f"     - Active Jobs: {stats['active_jobs']}")
        print(f"     - Total Applications: {stats['total_applications']}")
        print(f"     - Status Breakdown: {stats['status_breakdown']}")

        # Admin lists all jobs & users
        admin_users = await client.get("/admin/users", headers=admin_headers)
        assert admin_users.status_code == 200
        assert len(admin_users.json()) >= 3

        admin_jobs = await client.get("/admin/jobs", headers=admin_headers)
        assert admin_jobs.status_code == 200

        admin_apps = await client.get("/admin/applications", headers=admin_headers)
        assert admin_apps.status_code == 200
        print("  -> Admin user management, job moderation, and applications audit verified.")

    # Cleanup temp pdf
    if os.path.exists(pdf_path):
        os.remove(pdf_path)

    print("\n" + "=" * 60)
    print("ALL 9 SYSTEM MODULES & END-TO-END FLOWS PASSED 100%!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_full_system())
