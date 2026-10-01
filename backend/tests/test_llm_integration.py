"""Unit tests for the Gemini LLM integration. All mocked — no network."""

import app.modules.candidate.service as candidate_service
import app.modules.applications.service as applications_service
from app.common.llm import _extract_json, coerce_str_list
from app.modules.applications.service import ApplicationService
from app.modules.candidate.service import CandidateService


class TestExtractJson:
    def test_plain_json(self):
        assert _extract_json('{"a": 1}') == {"a": 1}

    def test_markdown_fenced_json(self):
        assert _extract_json('```json\n{"a": [1, 2]}\n```') == {"a": [1, 2]}

    def test_json_embedded_in_prose(self):
        text = 'Here is your result:\n{"technical": ["q1"], "coding": ["c1"]}\nThanks!'
        assert _extract_json(text) == {"technical": ["q1"], "coding": ["c1"]}

    def test_garbage_returns_none(self):
        assert _extract_json("not json at all") is None
        assert _extract_json("") is None


class TestCoerceStrList:
    def test_plain_strings(self):
        assert coerce_str_list([" a ", "b"], 10) == ["a", "b"]

    def test_dict_items_take_first_string_value(self):
        assert coerce_str_list([{"question": "What is X?"}], 10) == ["What is X?"]

    def test_drops_junk_and_respects_cap(self):
        items = ["a", 42, None, {}, "b", "c"]
        assert coerce_str_list(items, 2) == ["a", "b"]

    def test_comma_separated_string_is_split(self):
        # Models sometimes ignore list instructions and return one long string.
        assert coerce_str_list("python, docker, kubernetes", 10) == [
            "python",
            "docker",
            "kubernetes",
        ]

    def test_non_list_input(self):
        assert coerce_str_list("nope", 5) == ["nope"]
        assert coerce_str_list(None, 5) == []
        assert coerce_str_list(123, 5) == []


class TestLLMQuestionSheet:
    async def test_returns_none_when_llm_unavailable(self, monkeypatch):
        async def fake_generate_json(*args, **kwargs):
            return None

        monkeypatch.setattr(applications_service, "generate_json", fake_generate_json)
        result = await ApplicationService._llm_question_sheet(
            job_title="Backend Engineer",
            job_description="Build APIs.",
            job_skills=["python"],
            candidate_skills=["python"],
            matched_skills=["python"],
        )
        assert result is None

    async def test_normalizes_good_payload(self, monkeypatch):
        async def fake_generate_json(*args, **kwargs):
            return {
                "technical": ["T1", "T2", "T3", "T4"],
                "coding": [{"question": "C1"}],
                "behavioral": ["B1", "B2", "B3", "B4"],
                "hr": ["H1", "H2", "H3", "H4"],
            }

        monkeypatch.setattr(applications_service, "generate_json", fake_generate_json)
        result = await ApplicationService._llm_question_sheet(
            job_title="Backend Engineer",
            job_description="Build APIs.",
            job_skills=["python"],
            candidate_skills=["python"],
            matched_skills=["python"],
        )
        assert result is not None
        technical, coding, behavioral, hr = result
        assert technical == ["T1", "T2", "T3", "T4"]
        assert coding == ["C1"]
        assert len(behavioral) == 4 and len(hr) == 4

    async def test_returns_none_when_missing_required_sections(self, monkeypatch):
        async def fake_generate_json(*args, **kwargs):
            return {"technical": ["T1"]}  # no coding questions

        monkeypatch.setattr(applications_service, "generate_json", fake_generate_json)
        result = await ApplicationService._llm_question_sheet(
            job_title="X", job_description="x", job_skills=[], candidate_skills=[], matched_skills=[],
        )
        assert result is None


class TestTemplateQuestionSheet:
    def test_known_skill_produces_questions(self):
        technical, coding, behavioral, hr = (
            ApplicationService._template_question_sheet(["python"], ["python"])
        )
        assert technical and coding
        assert len(behavioral) == 4 and len(hr) == 4

    def test_unknown_skills_fall_back_to_generics(self):
        technical, coding, _, _ = (
            ApplicationService._template_question_sheet(["pottery"], ["pottery"])
        )
        assert technical and coding  # generic fallback lists

    def test_no_skills_use_defaults(self):
        technical, _, _, _ = ApplicationService._template_question_sheet([], [])
        assert technical


class TestLLMResumeInsights:
    async def test_disabled_llm_returns_empty(self, monkeypatch):
        monkeypatch.setattr(candidate_service, "llm_enabled", lambda: False)
        result = await CandidateService._llm_resume_insights("some resume text", [])
        assert result == {}

    async def test_no_text_returns_empty(self, monkeypatch):
        monkeypatch.setattr(candidate_service, "llm_enabled", lambda: True)
        result = await CandidateService._llm_resume_insights("", [])
        assert result == {}

    async def test_good_payload_passthrough(self, monkeypatch):
        async def fake_generate_json(*args, **kwargs):
            return {
                "education": "B.Tech in CS",
                "experience": "3 years backend",
                "suggestions": "Add metrics.",
                "skills": ["graphql", "redis"],
                "ats_score": 78,
            }

        monkeypatch.setattr(candidate_service, "llm_enabled", lambda: True)
        monkeypatch.setattr(candidate_service, "generate_json", fake_generate_json)
        result = await CandidateService._llm_resume_insights("text", ["python"])
        assert result["education"] == "B.Tech in CS"
        assert result["ats_score"] == 78

    async def test_non_dict_payload_returns_empty(self, monkeypatch):
        async def fake_generate_json(*args, **kwargs):
            return ["unexpected"]

        monkeypatch.setattr(candidate_service, "llm_enabled", lambda: True)
        monkeypatch.setattr(candidate_service, "generate_json", fake_generate_json)
        result = await CandidateService._llm_resume_insights("text", [])
        assert result == {}
