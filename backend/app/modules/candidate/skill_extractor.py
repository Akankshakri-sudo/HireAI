import re


KNOWN_SKILLS = {
    "python",
    "java",
    "c++",
    "c#",
    "javascript",
    "typescript",
    "react",
    "html",
    "css",
    "fastapi",
    "flask",
    "django",
    "spring boot",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "machine learning",
    "deep learning",
    "nlp",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
}


def extract_skills(text: str) -> list[str]:
    normalized_text = re.sub(r"\s+", " ", text.lower())

    found_skills = []

    for skill in KNOWN_SKILLS:
        pattern = rf"(?<!\w){re.escape(skill)}(?!\w)"

        if re.search(pattern, normalized_text):
            found_skills.append(skill)

    return sorted(found_skills)