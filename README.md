# HireAI 🚀 — Intelligent Recruitment Platform

HireAI connects **candidates** and **recruiters** on one platform: candidates upload a resume and instantly see how well they match every open job, while recruiters post jobs, review ranked applicants, and generate AI-tailored interview question sheets — all powered by Google Gemini.

| | |
|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Jobs](docs/screenshots/jobs.png) |
| *Public landing page* | *Browse & search open jobs* |

---

## 🧭 What is HireAI? (in plain words)

Think of HireAI as a hiring pipeline in three steps:

1. **A candidate uploads their resume (PDF).**
   The backend extracts the text from the PDF, pulls out every technical skill it recognizes, and then asks **Gemini** to analyze the resume — producing a real education summary, an experience summary, concrete improvement suggestions, extra skills the keyword parser missed, and a 0–100 resume quality score.

2. **The platform matches the candidate against every open job.**
   Each job lists required skills. HireAI compares the candidate's skills with each job's requirements and produces a **match score** (e.g. *92%*) plus the exact *matched* and *missing* skills. Candidates see their best matches on their dashboard; recruiters see their applicants **ranked by match score**.

3. **The recruiter generates an interview worksheet.**
   For any applicant, one click asks Gemini to write a tailored interview sheet — technical questions about the skills the candidate *and* the job share, coding exercises, behavioral questions, and HR questions. No more generic question lists.

Everything works **without** a Gemini key too — the platform falls back to its built-in deterministic scoring and question templates, so the app never breaks because an AI call failed.

## 📸 A tour through the app

**Candidate dashboard** — resume insights on the left, every open job ranked by ATS match score on the right, with matched/missing skills and application status:

![Candidate Dashboard](docs/screenshots/candidate-dashboard.png)

**Professional profile** — contact details, education, skills, and experience, with a profile-completion meter:

![Candidate Profile](docs/screenshots/candidate-profile.png)

**Recruiter dashboard** — hiring stats (total jobs, applicants, shortlisted, hired) and all your job postings in one place:

![Recruiter Dashboard](docs/screenshots/recruiter-dashboard.png)

**Applicant review** — every applicant ranked by match score; change their pipeline status, schedule interviews, or open the AI workspace:

![Job Applicants](docs/screenshots/job-applicants.png)

**AI interview worksheet** — Gemini writes technical, coding, behavioral, and HR questions tailored to this exact candidate–job pair, with PDF export:

![AI Interview Questions](docs/screenshots/ai-interview-questions.png)

**Admin console** — platform-wide stats, application funnel, and management of users, jobs, and applications:

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

## 👥 Who uses it and what can they do?

### 🧑‍💻 Candidate
- Register and fill in a profile (contact, education, skills, experience)
- Upload a resume PDF → instant skill extraction + AI analysis
- See all open jobs **ranked by match score** with matched/missing skills
- Save jobs for later, apply with one click (double-apply is prevented)
- Track application statuses (`applied → reviewing → shortlisted → interview → hired/rejected`), scheduled interviews, and in-app notifications

### 🏢 Recruiter
- Register and attach themselves to a company (or create one)
- Post jobs with required skills, salary range, location, and job type
- View applicants for each job **sorted by match score**
- Move applicants through the pipeline, schedule interviews (candidates get notified)
- Generate the AI interview worksheet per applicant
- Dashboard stats: total jobs, applicants, shortlisted, hired

### 🛡 Admin
- Platform KPIs (users, jobs, applications, growth)
- Manage users (activate/deactivate — deactivated users immediately lose access)
- Audit all jobs and applications

## 🤖 How the AI part works

| Feature | Without a Gemini key | With `GEMINI_API_KEY` set |
|---|---|---|
| Skill extraction | Keyword matching against a built-in tech-skill taxonomy (~120 skills, with aliases like `postgres → postgresql`) | Same, **plus** Gemini adds skills it spots that the keyword list missed |
| Resume analysis | Heuristic placeholders | Real education/experience summaries, concrete suggestions, and a 0–100 quality score |
| Job matching | Deterministic skill-overlap score (fast, explainable) | Same (LLM is not used for scoring — ranking stays deterministic and cheap) |
| Interview questions | Template bank for 8 common skills | Gemini writes questions tailored to the candidate–job skill overlap |

The Gemini client (`backend/app/common/llm.py`) is deliberately defensive: every call has a timeout, replies are parsed tolerantly (markdown fences, comma-separated strings, list-of-dicts shapes), and **any failure returns `None`**, which silently falls back to the non-AI behavior.

## 🛠 Technology stack

| Layer | Technology | What it does here |
|---|---|---|
| API | [FastAPI](https://fastapi.tiangolo.com/) | Async REST API, auto docs at `/docs` |
| Database | PostgreSQL + [SQLAlchemy](https://www.sqlalchemy.org/) 2.0 (async) | Users, jobs, applications, analyses (JSONB for skills/questions) |
| Auth | JWT (python-jose) + bcrypt | Role-based access: candidate / recruiter / admin |
| Resume parsing | [PyMuPDF](https://pymupdf.readthedocs.io/) | Fast PDF text extraction |
| AI | [Google Gemini](https://ai.google.dev/) via REST (`httpx`) | Resume analysis + interview question generation (optional) |
| Frontend | React 19 + Vite | SPA with role-based routing |
| Styling | Tailwind CSS v4 | Dark-themed UI |
| Tests | pytest + httpx | Unit tests (no DB) + live end-to-end API tests |

## 🚀 Running it locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- A local PostgreSQL server

### 1. Database
Create a database named `hireai_db` (tables are created automatically on first start). Default expected connection:

```
postgresql+asyncpg://postgres:1234@localhost:5432/hireai_db
```

### 2. Backend
```powershell
cd backend
python -m venv ..\.venv
..\.venv\Scripts\pip install -r requirements.txt

# configure environment
copy .env.example .env        # then edit DATABASE_URL / SECRET_KEY
# optional: add your GEMINI_API_KEY from https://aistudio.google.com/apikey

$env:PYTHONPATH="."
..\.venv\Scripts\uvicorn app.main:app --port 8000 --reload
```
API docs: <http://127.0.0.1:8000/docs>

### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```
App: <http://localhost:5173>

> The frontend calls `http://localhost:8000` by default. For any other backend URL, create `frontend/.env` with `VITE_API_URL=http://your-host:port`.

### 4. Demo data (optional)
```powershell
cd backend
$env:PYTHONPATH="."
..\.venv\Scripts\python seed_data.py
```
This seeds three ready-made accounts (password `password123` for all):

| Role | Email |
|---|---|
| Admin | `admin@test.com` |
| Recruiter | `recruiter@test.com` |
| Candidate | `candidate@test.com` |

## 🧪 Running the tests

```powershell
cd backend
$env:PYTHONPATH="."
..\.venv\Scripts\pytest tests        # unit + API tests (needs the local DB)
..\.venv\Scripts\python test_all_features_e2e.py   # full 9-step user-journey run
```
- `tests/test_unit_logic.py` + `tests/test_llm_integration.py` — pure unit tests (ATS scoring, skill extraction, status validation, mocked LLM behavior); no database needed
- `tests/test_api.py`, `tests/test_full_suite.py` — API tests against the live local database
- `test_all_features_e2e.py` — registers users, uploads a generated resume, posts a job, matches, applies, generates AI questions, schedules an interview, and checks the admin console

## 📁 Project structure

```text
HireAI/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app: routers, CORS, startup
│   │   ├── common/
│   │   │   ├── auth.py           # get_current_user / require_role dependencies
│   │   │   ├── dependencies.py   # DB session dependency
│   │   │   └── llm.py            # Gemini client (JSON mode, safe fallbacks)
│   │   ├── core/config.py        # Settings from backend/.env
│   │   ├── database/             # async engine, session, init
│   │   └── modules/              # one folder per feature:
│   │       ├── auth/             #   register/login, JWT
│   │       ├── candidate/        #   profile, resume upload, parser,
│   │       │                     #   skill extractor, ATS calculator
│   │       ├── recruiter/        #   recruiter profiles, companies
│   │       ├── jobs/             #   job postings, search, matching
│   │       ├── applications/     #   apply, status pipeline,
│   │       │                     #   AI interview question sheets
│   │       ├── saved_jobs/       #   bookmark jobs
│   │       ├── notifications/    #   in-app alerts
│   │       ├── interviews/       #   interview scheduling
│   │       └── admin/            #   platform governance
│   ├── tests/                    # pytest suite (unit + API)
│   └── test_all_features_e2e.py  # full user-journey script
├── frontend/
│   └── src/
│       ├── App.jsx               # routes + role-based protection
│       ├── constants.js          # shared enums (job types, statuses)
│       ├── services/api.js       # axios client (VITE_API_URL aware)
│       ├── components/           # filters, modals, timeline, toasts…
│       └── pages/                # one page per screen (12 pages)
└── docs/screenshots/             # images used in this README
```

Each backend module follows the same layered layout: `router` (HTTP endpoints) → `service` (business logic) → `repository` (database queries) → `models` (SQLAlchemy tables) + `schemas` (request/response validation).

## ⚙️ Configuration reference (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | — | Async PostgreSQL connection string |
| `SECRET_KEY` | — | JWT signing secret — **change it** in production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Login token lifetime |
| `CORS_ORIGINS` | `http://localhost:5173,…` | Comma-separated allowed frontend origins |
| `MAX_UPLOAD_SIZE_MB` | `5` | Resume upload limit |
| `GEMINI_API_KEY` | *(empty)* | Enables Gemini AI features (optional) |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Which Gemini model to call |
| `AI_TIMEOUT_SECONDS` | `60` | Per-call LLM timeout |

## 🔌 API at a glance

| Module | Key endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Candidate | `GET/PUT /candidate/profile`, `POST /candidate/resume`, `GET /candidate/resume/analyze`, `GET /candidate/matched-jobs` |
| Recruiter | `POST/PUT /recruiter/company`, `GET/PUT /recruiter/profile` |
| Jobs | `GET /jobs` (search/filter/pagination), `POST /jobs`, `GET /jobs/my`, `PUT/DELETE /jobs/{id}` |
| Applications | `POST /applications/{job_id}`, `GET /applications/my`, `GET /applications/jobs/{id}`, `PUT /applications/{id}/status`, `POST /applications/{id}/interview-questions` |
| Saved jobs | `POST/DELETE /saved-jobs/{job_id}`, `GET /saved-jobs` |
| Interviews | `POST /interviews`, `GET /interviews/candidate`, `GET /interviews/recruiter`, `PUT /interviews/{id}/status` |
| Notifications | `GET /notifications`, `PUT /notifications/{id}/read` |
| Admin | `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/{id}/status`, `GET /admin/jobs`, `GET /admin/applications` |

Full interactive docs live at <http://127.0.0.1:8000/docs> (Swagger UI).

## 🔒 Security notes

- Passwords are bcrypt-hashed; sessions use short-lived JWTs
- Role checks on every protected route; deactivated accounts are rejected immediately
- Recruiters can only manage their **own** jobs, applicants, interviews, and company
- Uploads are extension-checked, content-sniffed (PDF magic bytes), and size-limited
- Resume files are stored on the local disk under `backend/uploads/` and are **not** committed to git
