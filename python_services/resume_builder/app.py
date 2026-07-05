from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List
from pydantic import BaseModel
from pathlib import Path
import subprocess  #This lets Python execute commands on your computer.
import requests #This lets Python send requests to the internet.
import jinja2 #This lets Python generate text files.
import uuid #This lets Python generate unique IDs.
import os #This lets Python interact with your computer's file system.

PDFLATEX_PATH = r"C:\Program Files\MiKTeX\miktex\bin\x64\pdflatex.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/resumes", exist_ok=True)
os.makedirs("templates", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

OLLAMA_API = "http://localhost:11434/api/generate"

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

@app.post("/summarize/")
async def summarize_endpoint(request: SummarizeRequest):
    try:
        formatted = "\n".join(f"- {b}" for b in request.bullets if b.strip())
        if not formatted:
            return {"summary": ""}

        response = requests.post(OLLAMA_API, json={
            "model": "gemma2",
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
            name=request.name,
            email=request.email,
            phone=request.phone,
            summary=request.summary,
            skills=request.skills,
            projects=request.projects
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

@app.get("/")
async def root():
    return {"message": "Resume Builder API running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8009)