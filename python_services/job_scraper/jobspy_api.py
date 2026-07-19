import os
import time
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from jobspy import scrape_jobs
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

PORT = int(os.getenv("JOB_SCRAPER_PORT"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")

# How long a cached result set stays valid. Job listings don't meaningfully
# change minute-to-minute, so this trades a bit of freshness for a lot fewer
# live scrapes. Override in .env if you want it tighter/looser.
CACHE_TTL_SECONDS = int(os.getenv("JOB_SCRAPER_CACHE_TTL", 3600))  # default 1 hour
CACHE_MAX_ENTRIES = int(os.getenv("JOB_SCRAPER_CACHE_MAX_ENTRIES", 200))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Process-local cache: shared automatically across every caller of this
# service (frontend, job_recommendation, skill_analysis) since they all hit
# this one FastAPI process. Lost on restart — that's fine for this use case.
_cache = TTLCache(maxsize=CACHE_MAX_ENTRIES, ttl=CACHE_TTL_SECONDS)


def _cache_key(search_term: str, location: str, results_wanted: int) -> tuple:
    # Normalize so "Software Engineer" / "software engineer " / "SOFTWARE ENGINEER"
    # all hit the same cache entry instead of scraping three times for the
    # same effective query.
    return (search_term.strip().lower(), location.strip().lower(), results_wanted)


@app.get("/scrape_jobs")
async def get_jobs(search_term: str, location: str, results_wanted: int = 200, force_refresh: bool = False):
    key = _cache_key(search_term, location, results_wanted)

    if not force_refresh and key in _cache:
        print(f"✅ Cache hit for {key}")
        return _cache[key]

    print(f"⏳ Cache miss for {key} — scraping live...")
    start = time.time()

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

    print(f"   scrape took {time.time() - start:.1f}s")

    if jobs.empty:
        result = {"message": "No jobs found"}
        print(f"⚠️  Empty result for {key} — not caching (likely a transient scrape failure)")
        return result

    jobs = jobs.astype(str).replace("nan", "")
    result = jobs.to_dict(orient="records")

    _cache[key] = result
    return result


@app.get("/cache/stats")
async def cache_stats():
    # Handy while you're tuning TTL/size — not meant for the frontend to call.
    return {
        "size": len(_cache),
        "max_size": _cache.maxsize,
        "ttl_seconds": CACHE_TTL_SECONDS,
        "keys": [list(k) for k in _cache.keys()],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=PORT)