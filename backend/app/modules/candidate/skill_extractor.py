import re

KNOWN_SKILLS = {
    # Languages
    "python", "java", "c++", "c#", "c", "javascript", "typescript", "golang", "go",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "sql", "bash", "shell",
    
    # Frontend
    "react", "react.js", "reactjs", "next.js", "nextjs", "vue", "vue.js", "vuejs",
    "angular", "svelte", "html", "html5", "css", "css3", "tailwindcss", "tailwind",
    "bootstrap", "sass", "less", "redux", "zustand", "vite", "webpack",
    
    # Backend & Frameworks
    "fastapi", "flask", "django", "spring", "spring boot", "express", "express.js",
    "node", "node.js", "nodejs", "nest.js", "nestjs", "graphql", "rest api", "restful",
    "grpc", "microservices", "asp.net", "laravel", "ruby on rails",
    
    # Databases & Storage
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "cassandra",
    "elasticsearch", "dynamodb", "oracle", "mariadb", "firebase", "supabase", "prisma", "sqlalchemy",
    
    # Cloud & DevOps
    "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp",
    "google cloud", "terraform", "ansible", "ci/cd", "github actions", "jenkins",
    "gitlab", "linux", "nginx", "prometheus", "grafana",
    
    # AI / ML / Data Science
    "machine learning", "deep learning", "nlp", "natural language processing",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "opencv",
    "llm", "langchain", "generative ai", "data analysis", "data science",
    
    # Messaging & Async
    "kafka", "rabbitmq", "celery", "asyncio", "zeromq",
    
    # Tools & Practices
    "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum",
    "unit testing", "pytest", "jest", "cypress", "system design"
}


def extract_skills(text: str) -> list[str]:
    if not text:
        return []
        
    normalized_text = re.sub(r"\s+", " ", text.lower())
    found_skills = set()

    for skill in KNOWN_SKILLS:
        # Match word boundaries or special chars in skills like c++, next.js, node.js
        escaped_skill = re.escape(skill)
        pattern = rf"(?<!\w){escaped_skill}(?!\w)"
        if re.search(pattern, normalized_text):
            # Standardize aliases
            alias_map = {
                "reactjs": "react",
                "react.js": "react",
                "nextjs": "next.js",
                "vuejs": "vue",
                "vue.js": "vue",
                "nodejs": "node.js",
                "node": "node.js",
                "expressjs": "express",
                "express.js": "express",
                "postgres": "postgresql",
                "tailwind": "tailwindcss",
                "k8s": "kubernetes",
                "golang": "go",
            }
            canonical = alias_map.get(skill, skill)
            found_skills.add(canonical)

    return sorted(list(found_skills))