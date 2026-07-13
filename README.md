# Resumax

Resumax is a full-stack job-search and career-prep platform. It combines resume building (with local AI assistance), job discovery and tracking, AI-powered job recommendations and skill-gap analysis, career news, and a NeetCode-style coding interview tracker — all behind Firebase authentication.

The project is split into three layers:

- **Frontend** — React 19 (Vite) single-page app
- **Backend** — Node.js/Express REST API backed by PostgreSQL (Sequelize ORM), handling auth, persistence, and business logic
- **Python microservices** — five independent FastAPI/Flask services that handle job scraping, AI-driven recommendations, skill-gap analysis, news aggregation, and resume generation/rewriting

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database & Firebase Setup](#1-database--firebase-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Python Microservices Setup](#4-python-microservices-setup)
  - [5. Running Everything](#5-running-everything)
- [Environment Variables Reference](#environment-variables-reference)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Known Limitations](#known-limitations)

## Architecture

```
                    ┌─────────────────────┐
                    │   React Frontend     │
                    │   (Vite, port 3000)  │
                    └──────────┬───────────┘
                               │  Firebase ID token on every request
                               ▼
                    ┌─────────────────────┐
                    │  Node/Express API    │
                    │   (port 5000)        │
                    │  - Auth middleware   │
                    │  - Sequelize ORM     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  PostgreSQL (Supabase│
                    │  or self-hosted)     │
                    └─────────────────────┘

        Independent Python microservices (called directly by the frontend,
        and from each other for cross-service data):

   ┌────────────────┐ ┌───────────────────┐ ┌──────────────┐
   │ job_scraper      │ │ job_recommendation │ │ skill_analysis│
   │ FastAPI :8000     │ │ Flask :5003         │ │ Flask :5002    │
   └────────────────┘ └───────────────────┘ └──────────────┘
   ┌────────────────┐ ┌───────────────────┐
   │ news             │ │ resume_builder     │
   │ FastAPI :8001     │ │ FastAPI :8009        │
   └────────────────┘ │ (+ local Ollama LLM, │
                       │  LaTeX/pdflatex)     │
                       └───────────────────┘
```

Authentication is handled by **Firebase Auth** on the frontend. The Node backend verifies the Firebase ID token on every protected route via `firebase-admin`. The Python microservices do not verify auth themselves — they're treated as trusted internal services, and two of them (`job_recommendation`, `skill_analysis`) call back into the Node backend's `GET /api/users/:firebase_uid` endpoint (intentionally unauthenticated) to fetch user profile data by UID.

## Features

- **Resume Builder** — build a resume section-by-section (personal info, summary, experience, education, projects, skills), get AI-assisted bullet rewriting and summarization via a local Ollama model, and export to PDF via a LaTeX template rendered through `pdflatex`.
- **Job Search & Scraping** — search live job listings scraped on-demand from Indeed, LinkedIn, Glassdoor, and Naukri via the `jobspy` library.
- **Applications Tracker** — save jobs and track application status.
- **AI Job Recommendations** — fuzzy-matches your profile (preferred role, skills, location) against freshly scraped listings and returns a ranked, scored shortlist.
- **Skill Gap Analysis** — extracts trending skills from current job postings, compares them against your profile, and recommends Coursera courses for the gaps.
- **Career News Feed** — aggregates job-market news from Google News RSS feeds, with Open Graph image extraction, cached for 30 minutes.
- **Interview Prep Tracker** — a NeetCode 150 / Blind 75-style coding question tracker: browse by pattern/category, filter by company, difficulty, or solve status, and track your progress with live stats (solved count, patterns covered, etc.).
- **Profile Management** — experience, education, and project CRUD, all scoped to the authenticated user.

## Tech Stack

**Frontend**
- React 19, Vite, React Router
- Redux Toolkit (auth state)
- Tailwind CSS, Radix UI primitives, shadcn-style components
- Firebase Auth (client SDK)
- Recharts (skill trend charts), Framer Motion, Three.js

**Backend**
- Node.js, Express 5
- Sequelize ORM over PostgreSQL
- firebase-admin (server-side token verification)

**Python Microservices**
- FastAPI (`job_scraper`, `news`, `resume_builder`)
- Flask (`job_recommendation`, `skill_analysis`)
- `jobspy` (job scraping), `fuzzywuzzy` (fuzzy skill/title matching), `feedparser` + `BeautifulSoup` (news/RSS), `pandas`
- Local Ollama LLM (`llama3.2:3b` by default) for bullet-point rewriting
- `pdflatex` (MiKTeX/TeX Live) for PDF resume generation

**Database & Auth**
- PostgreSQL (developed against Supabase, but any Postgres instance works)
- Firebase Authentication

## Project Structure

```
Resumax/
├── frontend/                  # React SPA
│   └── src/
│       ├── components/        # layout, resume modals, interview widgets, shared UI
│       ├── config/            # firebase.js, apiConfig.js (all service base URLs)
│       ├── pages/              # route-level views (Dashboard, Jobs, Profile, Interview, ...)
│       ├── services/           # one file per API domain, all routed through api.service.js / externalApi.js
│       ├── store/               # Redux slices + thunks
│       └── hooks/
├── backend/                   # Node/Express API
│   └── src/
│       ├── config/db.js        # Sequelize connection (pooled)
│       ├── controllers/         # one per resource
│       ├── middleware/          # auth.middleware.js (Firebase token verification)
│       ├── models/               # Sequelize models + associations (models/index.js)
│       └── routes/
├── python_services/
│   ├── job_scraper/            # FastAPI — GET /scrape_jobs
│   ├── job_recommendation/      # Flask — GET /api/recommend_jobs/:uid
│   ├── skill_analysis/          # Flask — GET /api/skill_gap_analysis/:uid, /api/trending_skills
│   ├── news/                     # FastAPI — GET /news
│   └── resume_builder/           # FastAPI — AI rewrite/summarize + PDF generation
└── port/                       # misc local dev notes
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+ (or a free [Supabase](https://supabase.com) project)
- A [Firebase](https://console.firebase.google.com) project (Auth enabled)
- [Ollama](https://ollama.com) running locally, with a model pulled (default: `llama3.2:3b`) — only required for AI bullet rewriting/summarization
- A LaTeX distribution with `pdflatex` on your `PATH` (TeX Live on Linux/Mac, MiKTeX on Windows) — only required for PDF export

### 1. Database & Firebase Setup

1. Create a PostgreSQL database (or a Supabase project — use the **session pooler** connection string, not the direct connection, since the backend holds a long-lived connection pool).
2. In the [Firebase console](https://console.firebase.google.com), create a project, enable **Authentication → Email/Password** (or your preferred provider), and:
   - Generate a **Web app** config for the frontend.
   - Generate a **service account key** (Project Settings → Service Accounts → Generate new private key) for the backend.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=your-db-user
DB_PASSWORD=your-db-password

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> `FIREBASE_PRIVATE_KEY` must keep its `\n` escapes intact (wrap in quotes as shown) — the SDK expects a real multi-line key at runtime.

Run it:

```bash
npm run dev   # nodemon, auto-restarts
# or
npm start
```

On first run, `sequelize.sync({ alter: true })` creates/updates all tables automatically — no manual migrations needed.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

VITE_API_BASE_URL=http://localhost:5000/api
VITE_JOBS_API_URL=http://localhost:8000
VITE_NEWS_API_URL=http://localhost:8001
VITE_SKILL_ANALYSIS_API_URL=http://localhost:5002
VITE_RECOMMENDATIONS_API_URL=http://localhost:5003
VITE_RESUME_AI_API_URL=http://localhost:8009
```

Run it:

```bash
npm run dev
```

The app runs at `http://localhost:3000` by default (matches the CORS origin configured on the backend and Python services).

### 4. Python Microservices Setup

Each service is independent, with its own `requirements.txt`. Repeat for each of `job_scraper`, `job_recommendation`, `skill_analysis`, `news`, `resume_builder`:

```bash
cd python_services/<service_name>
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Optionally create a `.env` in each service directory to override defaults (see [Environment Variables Reference](#environment-variables-reference)).

Start each service (default ports shown):

```bash
# job_scraper (FastAPI, :8000)
python jobspy_api.py

# news (FastAPI, :8001)
python news_api.py

# skill_analysis (Flask, :5002)
python skills_analysis_api.py

# job_recommendation (Flask, :5003)
python recommendation_api.py

# resume_builder (FastAPI, :8009) — also needs Ollama running locally
python app.py
```

### 5. Running Everything

You'll end up with 7 processes running locally for full functionality:

| Service | Port | Command |
|---|---|---|
| Frontend | 3000 | `cd frontend && npm run dev` |
| Backend API | 5000 | `cd backend && npm run dev` |
| job_scraper | 8000 | `python python_services/job_scraper/jobspy_api.py` |
| news | 8001 | `python python_services/news/news_api.py` |
| skill_analysis | 5002 | `python python_services/skill_analysis/skills_analysis_api.py` |
| job_recommendation | 5003 | `python python_services/job_recommendation/recommendation_api.py` |
| resume_builder | 8009 | `python python_services/resume_builder/app.py` |

Not every feature needs every service — e.g. the Jobs page only needs `job_scraper` and the backend; Interview Prep only needs the backend. Start what you're actively working on.

## Environment Variables Reference

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `PORT` | Express server port (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK service account credentials |

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` | Firebase client config |
| `VITE_API_BASE_URL` | Node backend base URL |
| `VITE_JOBS_API_URL` | job_scraper base URL |
| `VITE_NEWS_API_URL` | news base URL |
| `VITE_SKILL_ANALYSIS_API_URL` | skill_analysis base URL |
| `VITE_RECOMMENDATIONS_API_URL` | job_recommendation base URL |
| `VITE_RESUME_AI_API_URL` | resume_builder base URL |

**Python services (optional `.env` per service)**

| Variable | Used by | Default |
|---|---|---|
| `FRONTEND_ORIGIN` | all 5 services (CORS) | `http://localhost:3000` |
| `NODE_API_URL` | job_recommendation, skill_analysis | `http://localhost:5000` |
| `JOB_SCRAPER_URL` | job_recommendation, skill_analysis | `http://localhost:8000` |
| `FLASK_DEBUG` | job_recommendation, skill_analysis | `false` |
| `OLLAMA_API_URL`, `OLLAMA_MODEL` | resume_builder | `http://localhost:11434/api/generate`, `llama3.2:3b` |
| `PDFLATEX_PATH` | resume_builder | auto-detected via `PATH`, override if `pdflatex` isn't discoverable |

## API Reference

All Node backend routes are prefixed with `/api` and (except `/auth/register`, `/auth/login`, `/health`, and `/users/:firebase_uid`) require a `Authorization: Bearer <firebase-id-token>` header.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile` |
| Users | `GET /users/:firebase_uid` *(unauthenticated — internal use by Python services)* |
| Jobs | `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `DELETE /jobs/:id` |
| Applications | `GET /applications`, `POST /applications`, `PUT /applications/:id`, `DELETE /applications/:id` |
| Saved Jobs | `GET /saved-jobs`, `POST /saved-jobs`, `DELETE /saved-jobs/:id` |
| Experience | `GET /experience`, `POST /experience`, `PUT /experience/:id`, `DELETE /experience/:id` |
| Education | `GET /education`, `POST /education`, `PUT /education/:id`, `DELETE /education/:id` |
| Projects | `GET /projects`, `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id` |
| Resumes | `GET /resumes`, `GET /resumes/:id`, `POST /resumes`, `PUT /resumes/:id`, `DELETE /resumes/:id` |
| Interview Prep | `GET /interview/questions`, `PATCH /interview/questions/:id/progress`, `GET /interview/stats`, `GET /interview/companies` |

**Python microservice endpoints**

| Service | Endpoint |
|---|---|
| job_scraper | `GET /scrape_jobs?search_term=&location=&results_wanted=` |
| news | `GET /news` |
| skill_analysis | `GET /api/skill_gap_analysis/:uid`, `GET /api/trending_skills` |
| job_recommendation | `GET /api/recommend_jobs/:uid` |
| resume_builder | `POST /analyze-resume/`, `POST /summarize/`, `POST /generate-pdf/`, `POST /rewrite-bullet/` |

## Data Model

Core Sequelize models and their relationships:

- **User** — Firebase-linked profile (skills, preferred role, location, etc.)
- **Experience**, **Education**, **Project**, **Resume** — all scoped to a `user_id`
- **Job** — scraped/saved job listings
- **Application** — a user's application to a job, with status
- **SavedJob** — a user's bookmarked jobs
- **InterviewQuestion** — coding questions (category, difficulty, metadata for `neetcode150`/`blind75` flags, company tags)
- **UserQuestionProgress** — per-user status (`todo`/`attempted`/`solved`) per question, `hasMany`/`belongsTo` associated with `InterviewQuestion`
- **Company** — companies used to tag/filter interview questions
- **InterviewSession**, **InterviewSessionTurn** — (session-based interview practice, `hasMany`/`belongsTo` associated)

## Known Limitations

- `resume_builder`'s PDF export depends on a local `pdflatex` install — there's no cloud fallback, so PDF export won't work in an environment without a TeX distribution.
- `GET /api/users/:firebase_uid` is intentionally unauthenticated so the Python services can call it 
- The `job_scraper` service scrapes live job boards on every request (no persistent job cache), so response times depend on the upstream sites' availability and rate limits.
- Ollama-based rewriting/summarization requires a local Ollama install and a pulled model; there's currently no hosted-LLM fallback.

