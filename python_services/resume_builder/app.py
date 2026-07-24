from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List
from pydantic import BaseModel
from pathlib import Path
import subprocess
import requests
import jinja2
import uuid
import os
from fastapi import UploadFile, File
import PyPDF2
import io
import json
import re
from dotenv import load_dotenv

# --- LaTeX escaping -------------------------------------------------------
# Jinja2's autoescape is HTML-oriented and isn't enabled for .tex templates
# anyway. Without this, a name/summary/skill containing LaTeX special
# characters (\, $, %, &, _, {, }, ~, ^) can break the build or, worse,
# attempt file inclusion via \input{...}. Every user-supplied string must
# go through this before being handed to template.render().
_LATEX_SPECIAL_CHARS = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}


def latex_escape(value):
    if value is None:
        return ""
    if not isinstance(value, str):
        value = str(value)
    # backslash must be replaced first, or the backslashes introduced by
    # the other replacements would themselves get escaped again
    result = value.replace("\\", _LATEX_SPECIAL_CHARS["\\"])
    for char, escaped in _LATEX_SPECIAL_CHARS.items():
        if char == "\\":
            continue
        result = result.replace(char, escaped)
    return result


def latex_escape_deep(value):
    """Recursively escape strings inside dicts/lists (for skills/projects)."""
    if isinstance(value, str):
        return latex_escape(value)
    if isinstance(value, dict):
        return {k: latex_escape_deep(v) for k, v in value.items()}
    if isinstance(value, list):
        return [latex_escape_deep(v) for v in value]
    return value

import shutil

# Was: Path(__file__).resolve().parent.parent / ".env" — looked for .env
# one directory ABOVE this service (python_services/.env), not in this
# service's own folder. Every other Python service just uses load_dotenv()
# with no path, which looks in the current/service folder — this one was
# inconsistent, so a .env placed in resume_builder/ (the documented,
# consistent-with-every-other-service location) was silently ignored.
load_dotenv()

# PDFLATEX_PATH was hardcoded to a Windows-only MiKTeX install path, so PDF
# generation could only ever work on that one original machine. Now it's
# resolved cross-platform: explicit env override first, then whatever
# `pdflatex` resolves to on PATH (works for TeX Live on Linux/Mac and for
# MiKTeX on Windows if it's been added to PATH during install).
PDFLATEX_PATH = os.getenv("PDFLATEX_PATH") or shutil.which("pdflatex") or "pdflatex"

OLLAMA_API = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
# Was int(os.getenv("RESUME_BUILDER_PORT")) with no fallback — if that env
# var wasn't set (guaranteed given the .env bug above), this line threw
# TypeError at import time and took the entire service down before any
# endpoint could respond, not just PDF generation.
PORT = int(os.getenv("RESUME_BUILDER_PORT", 8009))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/resumes", exist_ok=True)
os.makedirs("templates", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")



class RewriteRequest(BaseModel):
    bullet: str

class SummarizeRequest(BaseModel):
    bullets: List[str]

class ProjectModel(BaseModel):
    name: str
    description: str

class ResumeRequest(BaseModel):
    name: str
    email: str
    phone: str
    summary: str
    skills: List[str] = []
    projects: List[ProjectModel]
    template: str

def create_templates():
    classic = r'''
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\begin{document}
\begin{center}
    {\LARGE \textbf{ {{name}} }}\\
    \vspace{0.2cm}
    {{email}} | {{phone}}
\end{center}
\section*{Summary}
{{summary}}
\section*{Skills}
{% if skills %}
\begin{itemize}[leftmargin=*]
    {% for skill in skills %}\item {{skill}}{% endfor %}
\end{itemize}
{% endif %}
\section*{Projects}
{% for project in projects %}
\textbf{ {{project.name}} }\\
{{project.description}}
{% if not loop.last %}\vspace{0.3cm}{% endif %}
{% endfor %}
\end{document}
'''

    modern = r'''
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=0.8in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}
\definecolor{accent}{RGB}{70,130,180}
\titleformat{\section}{\large\color{accent}\bfseries}{}{0em}{}
\begin{document}
\begin{center}
    {\LARGE \textbf{\textcolor{accent}{ {{name}} }}}\\
    \vspace{0.2cm}
    {{email}} | {{phone}}
\end{center}
\section*{Summary}
{{summary}}
\section*{Skills}
{% if skills %}
\begin{itemize}[leftmargin=*]
    {% for skill in skills %}\item {{skill}}{% endfor %}
\end{itemize}
{% endif %}
\section*{Projects}
{% for project in projects %}
\textbf{\textcolor{accent}{ {{project.name}} }}\\
{{project.description}}
{% if not loop.last %}\vspace{0.3cm}{% endif %}
{% endfor %}
\end{document}
'''

    creative = r'''
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}
\definecolor{accent1}{RGB}{70,150,120}
\definecolor{accent2}{RGB}{200,120,50}
\titleformat{\section}{\large\color{accent1}\bfseries}{}{0em}{}[{\color{accent2}\titlerule[1pt]}]
\begin{document}
\begin{center}
    {\LARGE \textbf{\textcolor{accent1}{ {{name}} }}}\\
    \vspace{0.2cm}
    {\color{accent2}{{email}} | {{phone}}}
\end{center}
\section*{Summary}
{{summary}}
\section*{Skills}
{% if skills %}
\begin{itemize}[leftmargin=*]
    {% for skill in skills %}\item {{skill}}{% endfor %}
\end{itemize}
{% endif %}
\section*{Projects}
{% for project in projects %}
\textbf{\textcolor{accent1}{ {{project.name}} }}\\
{{project.description}}
{% if not loop.last %}\vspace{0.3cm}{% endif %}
{% endfor %}
\end{document}
'''

    with open("templates/classic.tex", "w") as f:
        f.write(classic)
    with open("templates/modern.tex", "w") as f:
        f.write(modern)
    with open("templates/creative.tex", "w") as f:
        f.write(creative)

create_templates()

template_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader("templates"),
)


def clean_extracted_content(data):
    """Strip placeholder/empty entries and fix common email/phone mixups
    coming out of the extraction LLM call."""

    def is_meaningful(entry):
        # An entry is meaningful if at least one string field is non-empty
        # or any bullets list is non-empty
        for v in entry.values():
            if isinstance(v, str) and v.strip():
                return True
            if isinstance(v, list) and any(str(x).strip() for x in v):
                return True
        return False

    for key in ("education", "experience", "projects", "skills"):
        if key in data and isinstance(data[key], list):
            data[key] = [e for e in data[key] if isinstance(e, dict) and is_meaningful(e)]

    # basic email/phone sanity fix — if the email field doesn't look like an
    # email but contains one, extract it; move any leftover text (often a
    # phone number, username, or location) to phone if phone is empty
    personal = data.get("personal", {})
    email_field = personal.get("email", "") or ""
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', email_field)
    if email_match and email_match.group() != email_field.strip():
        leftover = email_field.replace(email_match.group(), "").strip()
        personal["email"] = email_match.group()
        if leftover and not personal.get("phone", "").strip():
            phone_match = re.search(r'[\d][\d\s\-\+\(\)]{6,}', leftover)
            personal["phone"] = phone_match.group().strip() if phone_match else ""
        data["personal"] = personal

    return data


@app.post("/summarize/")
async def summarize_endpoint(request: SummarizeRequest):
    try:
        formatted = "\n".join(f"- {b}" for b in request.bullets if b.strip())
        if not formatted:
            return {"summary": ""}

        response = requests.post(OLLAMA_API, json={
            "model": OLLAMA_MODEL,
            "prompt": f"Generate a professional one paragraph resume summary from these points:\n{formatted}",
            "stream": False
        })

        if response.status_code != 200:
            raise Exception(f"Ollama error: {response.text}")

        summary = response.json().get("response", "").strip()
        return {"summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-pdf/")
async def generate_pdf_endpoint(request: ResumeRequest):
    try:
        resume_id = str(uuid.uuid4())
        temp_dir = f"static/resumes/{resume_id}"
        os.makedirs(temp_dir, exist_ok=True)

        template_name = request.template
        if template_name not in ["classic", "modern", "creative"]:
            template_name = "classic"

        template = template_env.get_template(f"{template_name}.tex")
        tex_content = template.render(
            name=latex_escape(request.name),
            email=latex_escape(request.email),
            phone=latex_escape(request.phone),
            summary=latex_escape(request.summary),
            skills=[latex_escape(s) for s in request.skills],
            projects=[latex_escape_deep(p.dict()) for p in request.projects],
        )

        tex_path = os.path.join(temp_dir, "resume.tex")
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(tex_content)

        

        process = subprocess.run(
            [PDFLATEX_PATH, "-interaction=nonstopmode",
             f"-output-directory={temp_dir}", tex_path],
            capture_output=True,
            text=True
        )

        pdf_path = os.path.join(temp_dir, "resume.pdf")
        if not os.path.exists(pdf_path):
            raise Exception(f"PDF generation failed: {process.stdout}")

        return {"pdf_url": f"/static/resumes/{resume_id}/resume.pdf"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/analyze-resume/")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        resume_text = ""
        for page in pdf_reader.pages:
            resume_text += page.extract_text() or ""

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        resume_text = resume_text[:6000]

        # ---- CALL 1: scoring + findings ----
        score_prompt = f"""You are an expert ATS resume analyzer. Analyze this resume and return ONLY this JSON:

{{
  "ats_score": <0-100>,
  "content_quality": <0-40>,
  "ats_structure": <0-20>,
  "job_optimization": <0-25>,
  "writing_quality": <0-10>,
  "app_ready": <0-5>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "findings": [
    {{"issue": "short title", "detail": "explanation and fix", "severity": "high"}}
  ]
}}

Return 3-6 findings, most important first, severity is "high", "medium", or "low".

Resume:
{resume_text}

Return ONLY the JSON, no other text."""

        # NOTE: concurrency was tried here (asyncio.gather + httpx) and
        # tested — timing came back identical to sequential, confirming
        # Ollama serializes requests to this model regardless of
        # OLLAMA_NUM_PARALLEL on this hardware. Reverted to sequential
        # since it's simpler with zero measured downside right now.
        score_response = requests.post(OLLAMA_API, json={
            "model": OLLAMA_MODEL,
            "prompt": score_prompt,
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 900}
        }, timeout=400)

        if score_response.status_code != 200:
            raise Exception(f"Ollama error (scoring): {score_response.text}")

        try:
            score_json_body = score_response.json()
        except json.JSONDecodeError as je:
            raise Exception(
                f"Ollama's HTTP response wasn't valid JSON: {je}. "
                f"Raw HTTP body: {score_response.text[:500]}"
            )

        score_raw = score_json_body.get("response", "").strip()
        print("---- RAW SCORE RESPONSE ----")
        print(score_raw)
        print("----------------------------")
        score_match = re.search(r'\{.*\}', score_raw, re.DOTALL)
        if not score_match:
            raise Exception(f"Could not parse scoring JSON. Raw model output: {score_raw[:500]}")
        try:
            score_result = json.loads(score_match.group())
        except json.JSONDecodeError as je:
            raise Exception(f"Scoring JSON was malformed: {je}. Raw match: {score_match.group()[:500]}")

        # ---- CALL 2: content extraction (separate) ----
        extract_prompt = f"""Extract structured resume data. Return ONLY this JSON:

{{
  "personal": {{"name": "", "email": "", "phone": ""}},
  "summary": "",
  "education": [{{"school": "", "degree": "", "field": "", "start_date": "", "end_date": "", "current": false}}],
  "experience": [{{"role": "", "company": "", "location": "", "start_date": "", "end_date": "", "current": false, "bullets": []}}],
  "projects": [{{"name": "", "tech": "", "bullets": []}}],
  "skills": [{{"name": "", "category": ""}}]
}}

Rules:
- "email" must contain ONLY a valid email address (e.g. name@domain.com). Never put a phone number in this field.
- "phone" must contain ONLY a phone number (digits, spaces, +, -, parentheses). Never put usernames, links, or location text in this field.
- If a value like a GitHub/LinkedIn username or city appears near contact info, ignore it — it does not belong in personal.name, email, or phone.
- Fix obvious PDF-extraction spacing errors when copying text (e.g. "r etail" -> "retail", "Expr ess.js" -> "Express.js") so bullets and text read as normal, correctly-spaced words.
- Do NOT include placeholder entries. If there is no education listed, return "education": []. If there are no skills listed, return "skills": []. Never return an array containing an object where all fields are empty.
- Only include an item in education/experience/projects/skills if it has real, non-empty data from the resume.
- Do not invent details — omit fields/entries you cannot find rather than guessing.
- For skills, assign a real, specific "category" based on what the skill actually is — e.g. "Programming Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Tools". If the resume already groups skills under its own headings (e.g. "Web Development", "Databases"), reuse those exact category names instead of inventing new ones. Only use "Other" if a skill genuinely doesn't fit any sensible category — do not use it as a default.
- Preserve the resume's own section groupings and ordering wherever possible (e.g. keep projects in the order they appear, keep skill categories as the resume author organized them) rather than reorganizing into a different structure.

Resume:
{resume_text}

Return ONLY the JSON, no other text."""

        extract_response = requests.post(OLLAMA_API, json={
            "model": OLLAMA_MODEL,
            "prompt": extract_prompt,
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 2000}
        }, timeout=400)

        extracted_content = {}
        if extract_response.status_code == 200:
            extract_raw = extract_response.json().get("response", "").strip()
            print("---- RAW EXTRACT RESPONSE ----")
            print(extract_raw)
            print("-------------------------------")
            extract_match = re.search(r'\{.*\}', extract_raw, re.DOTALL)
            if extract_match:
                try:
                    extracted_content = json.loads(extract_match.group())
                    extracted_content = clean_extracted_content(extracted_content)
                except json.JSONDecodeError as je:
                    print(f"Extraction JSON parse failed: {je}")
                    print(f"Raw match: {extract_match.group()[:500]}")
            else:
                print(f"No JSON object found in extraction output. Raw: {extract_raw[:500]}")
        else:
            print(f"Extraction call failed with status {extract_response.status_code}: {extract_response.text[:500]}")

        score_result.setdefault("strengths", [])
        score_result.setdefault("findings", [])
        score_result["extracted_content"] = extracted_content
        score_result["filename"] = file.filename

        return score_result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rewrite-bullet/")
async def rewrite_bullet(request: RewriteRequest):
    try:
        if not request.bullet.strip():
            raise HTTPException(status_code=400, detail="Bullet text is required")

        prompt = f"""Rewrite this resume bullet point to be stronger, more impactful, and ATS-friendly.
Use action verbs, quantify achievements where possible, and follow the STAR method.
Return ONLY the rewritten bullet point, nothing else.

Original: {request.bullet}

Rewritten:"""

        response = requests.post(OLLAMA_API, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        })

        if response.status_code != 200:
            raise Exception(f"Ollama error: {response.text}")

        rewritten = response.json().get("response", "").strip()

        # Clean up any extra text
        rewritten = rewritten.split('\n')[0].strip()
        rewritten = rewritten.lstrip('•-* ')

        return {
            "original": request.bullet,
            "rewritten": rewritten
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Resume Builder API running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=PORT)