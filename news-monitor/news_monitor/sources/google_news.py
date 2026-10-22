"""חיפוש ב-Google News RSS בעברית/ישראל - מכסה את רוב אתרי החדשות הישראליים."""

from __future__ import annotations

from urllib.parse import quote

import feedparser
import requests

from ..matcher import alias_term
from ..models import Item
from .rss import clean_html, entry_published

BASE = "https://news.google.com/rss/search?q={q}&hl=he&gl=IL&ceid=IL:he"


def _quote_term(term: str) -> str:
    return f'"{term}"' if " " in term or "-" in term else term


def build_queries(groups: dict, per_query: int) -> list[str]:
    """מאחד כמה חברות לשאילתת OR אחת כדי לצמצם את מספר הבקשות."""
    terms = []
    for group in groups.values():
        for ent in group["entities"]:
            # שני הכינויים הראשונים של כל חברה (בד"כ עברית + אנגלית)
            terms.append(" OR ".join(_quote_term(alias_term(a)) for a in ent["aliases"][:2]))
    return [" OR ".join(terms[i : i + per_query]) for i in range(0, len(terms), per_query)]


def query_url(query: str, when: str) -> str:
    return BASE.format(q=quote(f"{query} when:{when}"))


def parse(content: bytes) -> list[Item]:
    feed = feedparser.parse(content)
    items = []
    for entry in feed.entries:
        title = clean_html(entry.get("title", ""))
        publisher = (entry.get("source") or {}).get("title", "")
        # Google מוסיף " - שם האתר" לסוף הכותרת
        if publisher and title.endswith(f" - {publisher}"):
            title = title[: -len(publisher) - 3]
        if not title or not entry.get("link"):
            continue
        items.append(
            Item(
                title=title,
                url=entry["link"],
                source=publisher or "Google News",
                published=entry_published(entry),
            )
        )
    return items


def fetch(session: requests.Session, query: str, when: str, timeout: int) -> list[Item]:
    resp = session.get(query_url(query, when), timeout=timeout)
    resp.raise_for_status()
    return parse(resp.content)
