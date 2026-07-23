import os
import time
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from starlette.concurrency import run_in_threadpool
from jobspy import scrape_jobs
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("job_scraper")

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is not set in .env — job_scraper cannot start without it")
    return value


PORT = int(_require_env("JOB_SCRAPER_PORT"))
FRONTEND_ORIGIN = _require_env("FRONTEND_ORIGIN")

INTERNAL_SECRET = os.getenv("JOB_SCRAPER_INTERNAL_SECRET")


CACHE_TTL_SECONDS = int(os.getenv("JOB_SCRAPER_CACHE_TTL", 3600))  # default 1 hour
CACHE_MAX_ENTRIES = int(os.getenv("JOB_SCRAPER_CACHE_MAX_ENTRIES", 200))

MAX_RESULTS_WANTED = int(os.getenv("JOB_SCRAPER_MAX_RESULTS", 100))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_cache = TTLCache(maxsize=CACHE_MAX_ENTRIES, ttl=CACHE_TTL_SECONDS)


def _cache_key(search_term: str, location: str, results_wanted: int, country: str) -> tuple:

    return (search_term.strip().lower(), location.strip().lower(), results_wanted, country.strip().lower())


def _check_internal_secret(x_internal_secret: Optional[str]) -> None:
    """Raise 403 if an internal secret is configured and the caller didn't send it."""
    if INTERNAL_SECRET and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Missing or invalid internal secret")


@app.get("/scrape_jobs")
async def get_jobs(
    search_term: str,
    location: str,
    results_wanted: int = 50,
    country: str = "usa",
    force_refresh: bool = False,
    x_internal_secret: Optional[str] = Header(default=None),
):

    results_wanted = min(max(results_wanted, 1), MAX_RESULTS_WANTED)

    if force_refresh:
        
        _check_internal_secret(x_internal_secret)

    key = _cache_key(search_term, location, results_wanted, country)

    if not force_refresh and key in _cache:
        logger.info(f"Cache hit for {key}")
        return _cache[key]

    logger.info(f"Cache miss for {key} — scraping live...")
    start = time.time()

    try:
        
        jobs = await run_in_threadpool(
            scrape_jobs,
            site_name=["indeed", "linkedin", "glassdoor", "naukri"],
            search_term=search_term,
            google_search_term=f"{search_term} jobs near {location}",
            location=location,
            results_wanted=results_wanted,
            hours_old=72,
            country_indeed=country,
            linkedin_fetch_description=True,
        )
    except Exception as e:
        logger.exception(f"Scrape failed for {key}")
        raise HTTPException(status_code=500, detail="Error scraping jobs") from e

    logger.info(f"Scrape for {key} took {time.time() - start:.1f}s")

    if jobs.empty:
        result = {"message": "No jobs found"}
        logger.warning(f"Empty result for {key} — not caching (likely a transient scrape failure)")
        return result

    jobs = jobs.astype(str).replace("nan", "")
    result = jobs.to_dict(orient="records")

    _cache[key] = result
    return result


@app.get("/cache/stats")
async def cache_stats(x_internal_secret: Optional[str] = Header(default=None)):
    _check_internal_secret(x_internal_secret)
    return {
        "size": len(_cache),
        "max_size": _cache.maxsize,
        "ttl_seconds": CACHE_TTL_SECONDS,
        "keys": [list(k) for k in _cache.keys()],
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=PORT)