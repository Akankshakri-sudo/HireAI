# HireAI 🚀 - Intelligent Recruitment Platform

HireAI is a next-generation recruitment and ATS matching system that connects developers and recruiters. Featuring PDF resume parsing, automated skill-based ATS scoring, semantic job matching, and customized AI-generated interview question sheets.

---

## Key Features

### 🧑‍💻 Candidate Flow
1. **Interactive Profile**: Fill in educational credentials, contact details, experience, and technical skill sets.
2. **Resume PDF Upload**: Securely upload a resume PDF to the server.
3. **AI Resume Parser**: Extract text and identify known technical skills using standard lexical profiling.
4. **Semantic Recommendations**: Calculate real-time ATS match scores against active job openings, indicating matching and missing skill sets.
5. **Double-Apply Prevention**: Prevent duplicate applications for the same position.

### 🏢 Recruiter Flow
1. **Company Association**: Register a new corporate profile or select an existing brand.
2. **Job Post Creator**: Create new positions with custom descriptions, target experience, salaries, locations, and required skills.
3. **ATS Rank Listing**: View applicants sorted dynamically by their semantic resume-to-job ATS matching scores.
4. **Application Management**: Move candidate application statuses through standard pipelines (Applied, Reviewed, Shortlisted, Selected, Rejected).
5. **AI Interview Worksheet**: Automatically generate custom technical, coding, behavioral, and HR questions tailored specifically to the intersection of candidate resume keywords and job requirements.

---

## Technology Stack

- **Backend**:
  - [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous python web framework)
  - [SQLAlchemy](https://www.sqlalchemy.org/) with PostgreSQL (using `asyncpg`)
  - [PyMuPDF](https://pymupdf.readthedocs.io/) (Fast PDF text extractor)
  - [pytest](https://docs.pytest.org/) & [httpx](https://www.python-httpx.org/) (Asynchronous endpoint verification)
- **Frontend**:
  - [React](https://react.dev/) + [Vite](https://vite.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/) (Modern CSS utilities & design tokens)
  - [Lucide React](https://lucide.dev/) (Vector icons)
  - [Axios](https://axios-http.com/) (API client)

---

## Directory Structure

```text
HireAI/
├── backend/
│   ├── app/
│   │   ├── common/         # Common dependencies, auth middleware
│   │   ├── core/           # Config and app settings
│   │   ├── database/       # DB session and base classes
│   │   └── modules/        # Module architectures
│   │       ├── auth/
│   │       ├── candidate/  # Resume parsing, skill extractors, matching
│   │       ├── recruiter/  # Company profiles, recruiter designations
│   │       ├── jobs/       # Active postings database
│   │       └── applications/# Application tracking & AI question generator
│   └── tests/              # End-to-end API route tests
└── frontend/
    ├── src/
    │   ├── pages/          # Candidate/Recruiter dashboards, profiles, login/register
    │   ├── services/       # Base API settings & route endpoints
    │   └── App.jsx         # Route protector & site paths
    └── tailwind.config.js
```

---

## Running the Application Locally

Make sure you have a local PostgreSQL instance running with database credentials corresponding to the config:
`postgresql+asyncpg://postgres:1234@localhost:5432/hireai_db`

### 1. Launch the Backend Server
From the root workspace directory, run:
```powershell
cd backend
$env:PYTHONPATH="."
..\.venv\Scripts\uvicorn app.main:app --port 8000 --reload
```
The API documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Launch the Frontend Dev Server
From the root workspace directory, run:
```powershell
cd frontend
npm run dev
```
The user interface is hosted at `http://localhost:5173`.

### 3. Running Backend Tests
Ensure your server variables are configured and execute:
```powershell
cd backend
$env:PYTHONPATH="."
..\.venv\Scripts\pytest tests
```
