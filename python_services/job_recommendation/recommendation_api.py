import os
import re
import requests
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from fuzzywuzzy import fuzz
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

NODE_API = os.getenv("NODE_API_URL")
JOB_SCRAPER_URL = os.getenv("JOB_SCRAPER_URL")
PORT = int(os.getenv("JOB_RECOMMENDATION_PORT"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")

app = Flask(__name__)
CORS(app, origins=[FRONTEND_ORIGIN], supports_credentials=True)

COMMON_SKILLS = [
    "javascript", "html", "css", "react", "angular", "vue", "typescript",
    "redux", "bootstrap", "tailwind", "responsive design",
    "node.js", "express", "django", "flask", "spring", "php",
    "java", "python", "c#", "c++", "go", "rust", "kotlin", "scala",
    "sql", "mysql", "postgresql", "mongodb", "firebase", "redis",
    "elasticsearch", "graphql",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins",
    "terraform", "ci/cd", "microservices", "serverless",
    "android", "ios", "swift", "react native", "flutter",
    "git", "rest api", "agile", "scrum",
    "machine learning", "ai", "data science", "big data", "blockchain",
    "security", "oauth", "jwt", "testing", "ui/ux"
]

def fuzzy_match(text1, text2, threshold=60):
    if not text1 or not text2:
        return False
    return fuzz.partial_ratio(str(text1).lower(), str(text2).lower()) >= threshold

def extract_skills_from_text(description):
    if not description or not isinstance(description, str):
        return []
    description = description.lower()
    found_skills = []
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, description):
            found_skills.append(skill)
    return found_skills

def extract_skills_from_title(title):
    if not title or not isinstance(title, str):
        return []
    title = title.lower()
    found_skills = []
    title_skill_mapping = {
        "java developer": ["java", "spring"],
        "python developer": ["python", "django", "flask"],
        "frontend developer": ["javascript", "html", "css", "react"],
        "backend developer": ["api", "sql"],
        "full stack": ["javascript", "sql"],
        "node": ["node.js", "javascript", "express"],
        "react": ["react", "javascript"],
        "angular": ["angular", "typescript"],
        "devops": ["docker", "kubernetes", "ci/cd"],
        "data scientist": ["python", "machine learning"],
        "mobile developer": ["android", "ios"]
    }
    for pattern, skills in title_skill_mapping.items():
        if pattern in title:
            found_skills.extend(skills)
    return list(set(found_skills))

@app.route('/api/recommend_jobs/<uid>', methods=['GET'])
def recommend_jobs(uid):
    try:
        response = requests.get(f"{NODE_API}/api/users/{uid}", timeout=10)
        if response.status_code != 200:
            return jsonify({"error": "User not found"}), 404

        user_data = response.json()["user"]
        preferred_role = user_data.get("preferred_role", "software engineer") or "software engineer"
        user_skills = [s.lower() for s in (user_data.get("skills", []) or [])]
        location = user_data.get("location", "remote") or "remote"

        scrape_response = requests.get(
            f"{JOB_SCRAPER_URL}/scrape_jobs",
            params={
                "search_term": preferred_role,
                "location": location,
                "results_wanted": 20
            },
            timeout=60
        )
        jobs = scrape_response.json()

        if isinstance(jobs, dict) and "message" in jobs:
            return jsonify([])

        scored_jobs = []
        for job in jobs:
            job_title    = str(job.get("title", "")).lower()
            job_location = str(job.get("location", "")).lower()
            job_desc     = str(job.get("description", ""))
            job_skills   = extract_skills_from_text(job_desc)

            if not job_skills:
                job_skills = extract_skills_from_title(job_title)

            title_score = 100 if fuzzy_match(preferred_role, job_title, 70) else 0
            location_score = fuzz.partial_ratio(location, job_location) if location and job_location else 50

            if user_skills and job_skills:
                matches = sum(1 for us in user_skills if any(fuzzy_match(us, js, 70) for js in job_skills))
                skills_score = int((matches / len(user_skills)) * 100)
            else:
                skills_score = 50

            total_score = (title_score * 0.5) + (location_score * 0.3) + (skills_score * 0.2)

            if total_score >= 30:
                scored_jobs.append({
                    "id": job.get("id", ""),
                    "title": job.get("title", ""),
                    "company": job.get("company", ""),
                    "location": job.get("location", ""),
                    "url": job.get("job_url", ""),
                    "description": job_desc[:300],
                    "match_score": round(total_score, 1)
                })

        recommendations = sorted(scored_jobs, key=lambda x: x['match_score'], reverse=True)[:10]
        return jsonify(recommendations)

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=PORT, debug=False)