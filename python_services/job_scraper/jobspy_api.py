import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from jobspy import scrape_jobs
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

PORT = int(os.getenv("JOB_SCRAPER_PORT"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/scrape_jobs")
async def get_jobs(search_term: str, location: str, results_wanted: int = 200):
    try:
        jobs = scrape_jobs(
            site_name=["indeed", "linkedin", "glassdoor", "naukri"],
            search_term=search_term,
            google_search_term=f"{search_term} jobs near {location}",
            location=location,
            results_wanted=results_wanted,
            hours_old=72,
            country_indeed="USA",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping jobs: {str(e)}")

    if jobs.empty:
        return {"message": "No jobs found"}

    jobs = jobs.astype(str).replace("nan", "")

    return jobs.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=PORT)