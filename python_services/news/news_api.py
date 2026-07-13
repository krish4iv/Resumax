import os
from pathlib import Path
from dotenv import load_dotenv
import feedparser
import requests
import traceback
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

PORT = int(os.getenv("NEWS_PORT"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache = {"articles": [], "last_fetched": None}

RSS_FEEDS = [
    "https://news.google.com/rss/search?q=employment+jobs+hiring&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=career+job+market+2025&hl=en-US&gl=US&ceid=US:en",
]

def get_og_image(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, timeout=3, headers=headers)
        soup = BeautifulSoup(res.text, "html.parser")
        og_image = soup.find("meta", property="og:image")
        if og_image:
            return og_image.get("content", "")
    except:
        pass
    return ""

@app.get("/news")
def get_news():
    try:
        if _cache["last_fetched"]:
            elapsed = (datetime.now() - _cache["last_fetched"]).seconds
            if elapsed < 1800 and _cache["articles"]:
                print(f"✅ Returning {len(_cache['articles'])} cached")
                return _cache["articles"]

        articles = []
        seen_urls = set()

        for feed_url in RSS_FEEDS:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]:
                if entry.link not in seen_urls:
                    seen_urls.add(entry.link)
                    image = get_og_image(entry.link)
                    articles.append({
                        "title": entry.get("title", ""),
                        "url": entry.get("link", ""),
                        "domain": entry.get("source", {}).get("title", "Google News"),
                        "seendate": entry.get("published", ""),
                        "socialimage": image,
                    })

        _cache["articles"] = articles
        _cache["last_fetched"] = datetime.now()
        print(f"✅ Fetched {len(articles)} articles")
        return articles

    except Exception as e:
        print(f"❌ Error: {traceback.format_exc()}")
        if _cache["articles"]:
            return _cache["articles"]
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=PORT)