def calculate_ats_score(
    resume_skills: list[str],
    job_skills: list[str],
) -> dict:
    normalized_resume_skills = {
        skill.strip().lower()
        for skill in resume_skills
    }

    normalized_job_skills = {
        skill.strip().lower()
        for skill in job_skills
    }

    if not normalized_job_skills:
        return {
            "ats_score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
        }

    matched_skills = sorted(
        normalized_resume_skills.intersection(
            normalized_job_skills
        )
    )

    missing_skills = sorted(
        normalized_job_skills.difference(
            normalized_resume_skills
        )
    )

    score = (
        len(matched_skills)
        / len(normalized_job_skills)
    ) * 100

    return {
        "ats_score": round(score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }