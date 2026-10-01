"""Unit tests for the scoring/extraction core. No database required."""

from app.modules.candidate.ats_calculator import calculate_ats_score
from app.modules.candidate.skill_extractor import extract_skills
from app.modules.applications.models import APPLICATION_STATUSES
from app.modules.applications.service import ApplicationService


class TestAtsCalculator:
    def test_perfect_match_scores_100(self):
        result = calculate_ats_score(
            resume_skills=["Python", "Docker"],
            job_skills=["python", "docker"],
        )
        assert result["ats_score"] == 100.0
        assert result["missing_skills"] == []
        assert set(result["matched_skills"]) == {"python", "docker"}

    def test_partial_match(self):
        result = calculate_ats_score(
            resume_skills=["python"],
            job_skills=["python", "docker", "aws"],
        )
        assert result["ats_score"] == round(1 / 3 * 100, 2)
        assert result["missing_skills"] == ["aws", "docker"]

    def test_no_job_skills_scores_zero(self):
        result = calculate_ats_score(resume_skills=["python"], job_skills=[])
        assert result["ats_score"] == 0.0
        assert result["matched_skills"] == []

    def test_no_overlap_scores_zero(self):
        result = calculate_ats_score(
            resume_skills=["cooking"],
            job_skills=["python", "docker"],
        )
        assert result["ats_score"] == 0.0
        assert result["missing_skills"] == ["docker", "python"]

    def test_normalizes_whitespace_and_case(self):
        result = calculate_ats_score(
            resume_skills=["  Python "],
            job_skills=["PYTHON"],
        )
        assert result["ats_score"] == 100.0


class TestSkillExtractor:
    def test_extracts_known_skills(self):
        skills = extract_skills("Built APIs with FastAPI and PostgreSQL, deployed on AWS.")
        assert "fastapi" in skills
        assert "postgresql" in skills
        assert "aws" in skills

    def test_case_insensitive(self):
        skills = extract_skills("REACT and TYPESCRIPT developer")
        assert "react" in skills
        assert "typescript" in skills

    def test_unknown_text_yields_no_skills(self):
        assert extract_skills("Professional bird watcher and gardener.") == []

    def test_word_boundaries_respected(self):
        # "go" must not match inside "golang"; each counts as its own word,
        # and both canonicalize to the same alias "go".
        skills = extract_skills("I go to work. Also know golang.")
        assert skills == ["go"]

    def test_aliases_are_canonicalized(self):
        skills = extract_skills("Knows Postgres and k8s, used Node.js once.")
        assert "postgresql" in skills
        assert "kubernetes" in skills
        assert "node.js" in skills
        assert "postgres" not in skills
        assert "k8s" not in skills


class TestApplicationStatusValidation:
    def test_invalid_status_rejected_before_db_access(self):
        import pytest
        from fastapi import HTTPException

        # Validation happens before any repository call, so db=None never
        # gets touched for an invalid status.
        with pytest.raises(HTTPException) as exc_info:
            import asyncio

            asyncio.run(
                ApplicationService.update_application_status(
                    db=None,
                    application_id=1,
                    status="not-a-status",
                    current_user=None,
                )
            )
        assert exc_info.value.status_code == 422

    def test_status_tuple_is_complete(self):
        assert set(APPLICATION_STATUSES) == {
            "applied",
            "reviewing",
            "shortlisted",
            "interview",
            "rejected",
            "hired",
        }
