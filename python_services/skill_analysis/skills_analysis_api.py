import os
import re
import math
import requests
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from fuzzywuzzy import fuzz

app = Flask(__name__)
CORS(app)

NODE_API = "http://localhost:5000"

# Load coursera courses
COURSE_CSV_PATH = os.path.join(os.path.dirname(__file__), "coursera_courses.csv")
courses_df = pd.read_csv(COURSE_CSV_PATH)
courses_df["Tags"] = courses_df["Tags"].apply(
    lambda x: [tag.strip(" '[]") for tag in x.split(',')] if isinstance(x, str) else []
)

# Known skills lists
sales_skills = [
    "communication", "negotiation", "lead generation", "cold calling", "closing deals",
    "CRM", "customer relationship management", "B2B sales", "B2C sales", "sales strategy",
    "product knowledge", "salesforce", "HubSpot", "presentation skills", "active listening",
    "email marketing", "social selling", "pipeline management", "target achievement",
    "market research", "customer service", "networking", "upselling", "cross-selling",
    "objection handling", "sales forecasting", "territory management", "account management",
    "client relationship", "solution selling", "retail sales", "telemarketing", "inside sales",
    "outside sales", "quota attainment", "prospecting", "referral marketing", "pricing strategy",
    "consultative selling", "value proposition", "sales enablement", "customer acquisition",
    "sales analytics", "deal negotiation", "sales operations", "channel sales"
]

computer_science_skills = [
    "python", "java", "c++", "c", "html", "css", "javascript", "typescript", "go",
    "ruby", "swift", "rust", "php", "kotlin", "r", "scala", "bash",
    "react", "vue.js", "angular", "next.js", "node.js", "express.js", "svelte", "tailwind css",
    "bootstrap", "jquery",
    "django", "flask", "fastapi", "spring boot", "graphql", "rest api", "microservices",
    "sql", "mysql", "postgresql", "sqlite", "oracle", "mongodb", "firebase", "cassandra",
    "redis", "neo4j",
    "git", "github", "gitlab", "docker", "kubernetes", "jenkins",
    "ansible", "terraform", "linux", "ci/cd", "nginx",
    "aws", "azure", "gcp", "cloud functions", "serverless", "lambda",
    "machine learning", "deep learning", "natural language processing", "computer vision",
    "tensorflow", "pytorch", "scikit-learn", "huggingface", "transformers",
    "pandas", "numpy", "matplotlib", "seaborn", "data analysis",
    "object oriented programming", "data structures", "algorithms",
    "system design", "design patterns", "software architecture", "testing",
    "cybersecurity", "penetration testing", "authentication", "encryption",
    "blockchain", "web3", "big data", "hadoop", "spark", "agile", "scrum"
]

known_skills = set(skill.lower() for skill in sales_skills + computer_science_skills)

SKILL_ALIASES = {
    "java script": "javascript",
    "java-script": "javascript",
    "html5": "html",
    "py": "python",
    "ml": "machine learning",
}

def normalize_alias(skill):
    return SKILL_ALIASES.get(skill.lower(), skill.lower())

def is_noise(skill):
    return len(skill) < 2 or skill in {"a", "an", "the", "is", "us", "to", "in", "on", "of", "and", "for"}

def clean_skills(skill_list):
    return [skill for skill in skill_list if not is_noise(skill)]

def fuzzy_match(text1, text2, threshold=70):
    return fuzz.partial_ratio(text1.lower(), text2.lower()) >= threshold

def is_valid_skill(skill, known_skills, threshold=85):
    if skill.lower() in [ks.lower() for ks in known_skills]:
        return True
    for known_skill in known_skills:
        if skill.lower() in known_skill.lower() or known_skill.lower() in skill.lower():
            if len(skill) < 3:
                continue
            return True
    for known_skill in known_skills:
        if fuzzy_match(skill, known_skill, threshold):
            return True
    return False

def extract_skills_with_regex(text):
    """Extract skills using regex pattern matching"""
    if not text:
        return []
    tech_pattern = r'\b(python|java|javascript|react|angular|vue|node\.js|html|css|sql|aws|azure|docker|kubernetes|machine learning|data science|typescript|go|rust|php|kotlin|scala|bash|django|flask|fastapi|postgresql|mongodb|redis|git|ci/cd|agile|scrum)\b'
    pattern_skills = [match.lower() for match in re.findall(tech_pattern, text.lower())]
    return list(set(pattern_skills))

def get_trending_skills_from_jobs(search_term="software engineer", results_wanted=20):
    """Extract trending skills from scraped job descriptions"""
    try:
        response = requests.get(
            f"http://localhost:8000/scrape_jobs",
            params={
                "search_term": search_term,
                "location": "remote",
                "results_wanted": results_wanted
            },
            timeout=60
        )
        jobs = response.json()

        if isinstance(jobs, dict) and "message" in jobs:
            return {"valid_skills": [], "trending_skills": []}

        all_skills = []
        for job in jobs:
            desc = job.get("description", "") or ""
            extracted = extract_skills_with_regex(desc)
            normalized = [normalize_alias(s) for s in extracted]
            all_skills.extend(normalized)

        valid_skills = [s for s in all_skills if is_valid_skill(s, known_skills)]
        trending = pd.Series(valid_skills).value_counts().head(10).index.tolist()

        return {"valid_skills": valid_skills, "trending_skills": trending}

    except Exception as e:
        print(f"❌ Error getting trending skills: {e}")
        return {"valid_skills": [], "trending_skills": []}

def safe_type(value):
    return None if value is None or (isinstance(value, float) and math.isnan(value)) else value

@app.route('/api/trending_skills', methods=['GET'])
def get_trending_skills():
    skills_data = get_trending_skills_from_jobs()
    return jsonify(skills_data["trending_skills"])

@app.route('/api/skill_gap_analysis/<uid>', methods=['GET'])
def skill_gap_analysis(uid):
    try:
        # Get user from our Node.js API
        response = requests.get(f"{NODE_API}/api/users/{uid}", timeout=10)
        if response.status_code != 200:
            return jsonify({"error": "User not found"}), 404

        user_data = response.json()["user"]

        # Get and validate user skills
        raw_skills = user_data.get("skills", []) or []
        user_skills = []
        for skill in raw_skills:
            normalized = normalize_alias(skill)
            if is_valid_skill(normalized, known_skills):
                user_skills.append(normalized)

        # Get trending skills
        skills_data = get_trending_skills_from_jobs(
            search_term=user_data.get("preferred_role", "software engineer") or "software engineer"
        )
        trending_skills = skills_data["trending_skills"]

        # Find missing skills
        missing_skills = [
            skill for skill in trending_skills
            if not any(fuzzy_match(skill, us, 85) for us in user_skills)
        ]

        # Recommend courses for missing skills
        recommended_courses = []
        for missing_skill in missing_skills:
            for _, row in courses_df.iterrows():
                course_tags = row["Tags"]
                for tag in course_tags:
                    if fuzzy_match(missing_skill, tag, 70):
                        recommended_courses.append({
                            "name": row["Name"],
                            "url": row["Url"],
                            "rating": safe_type(row["Rating"]),
                            "difficulty": safe_type(row["Difficulty"]),
                            "tags": course_tags,
                            "for_skill": missing_skill
                        })
                        break
            if len(recommended_courses) >= 12:
                break

        return jsonify({
            "user_skills": user_skills,
            "trending_skills": trending_skills,
            "missing_skills": missing_skills,
            "recommended_courses": recommended_courses
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)