from __future__ import annotations

import calendar
import html
import logging
import re
from datetime import datetime, timezone
from urllib.parse import urljoin, urlsplit

import feedparser
import requests
from bs4 import BeautifulSoup

from ..models import Item

log = logging.getLogger(__name__)

_TAGS = re.compile(r"<[^>]+>")
_FEED_TYPES = ("application/rss+xml", "application/atom+xml", "application/feed+json")
# כתובות פיד נפוצות (WordPress, Wix, Ghost, Hugo ועוד)
_COMMON_PATHS = ("/feed/", "/rss", "/rss.xml", "/feed.xml", "/atom.xml", "/blog-feed.xml", "/index.xml", "/rss/")


def clean_html(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(_TAGS.sub(" ", text or ""))).strip()


def entry_published(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        value = entry.get(key)
        if value:
            return datetime.fromtimestamp(calendar.timegm(value), tz=timezone.utc)
    return None


def parse(content: bytes, source_name: str, include_unmatched: bool = False) -> list[Item]:
    feed = feedparser.parse(content)
    if feed.bozo and not feed.entries:
        raise ValueError(f"פיד לא תקין: {feed.get('bozo_exception')}")
    items = []
    for entry in feed.entries:
        title = clean_html(entry.get("title", ""))
        link = entry.get("link", "")
        if not title or not link:
            continue
        items.append(
            Item(
                title=title,
                url=link,
                source=source_name,
                published=entry_published(entry),
                summary=clean_html(entry.get("summary", ""))[:1000],
                include_unmatched=include_unmatched,
            )
        )
    return items


def _try_feed(session: requests.Session, url: str, timeout: int) -> bytes | None:
    try:
        resp = session.get(url, timeout=timeout)
    except requests.RequestException:
        return None
    if resp.status_code != 200 or not feedparser.parse(resp.content).entries:
        return None
    return resp.content


def discover(session: requests.Session, url: str, timeout: int) -> tuple[str, bytes] | None:
    """מחפש את פיד ה-RSS של אתר: קודם בקישורים שבדף הבית, אחר כך בכתובות נפוצות."""
    parts = urlsplit(url)
    home = f"{parts.scheme}://{parts.netloc}/"
    candidates: list[str] = []
    try:
        resp = session.get(home, timeout=timeout)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            for link in soup.find_all("link", href=True):
                if (link.get("type") or "").lower() in _FEED_TYPES:
                    candidates.append(urljoin(home, link["href"]))
    except requests.RequestException:
        pass
    candidates += [urljoin(home, p) for p in _COMMON_PATHS]
    for candidate in dict.fromkeys(candidates):
        if candidate.rstrip("/") == url.rstrip("/"):
            continue
        content = _try_feed(session, candidate, timeout)
        if content:
            return candidate, content
    return None


def fetch(session: requests.Session, name: str, url: str, timeout: int, include_unmatched: bool = False) -> list[Item]:
    resp = session.get(url, timeout=timeout)
    if resp.status_code == 200 and feedparser.parse(resp.content).entries:
        return parse(resp.content, name, include_unmatched)
    # הכתובת לא מחזירה פיד (404, או דף HTML רגיל) - מנסים לאתר את הפיד של האתר
    found = discover(session, url, timeout)
    if found is None:
        if resp.status_code != 200:
            resp.raise_for_status()
        raise ValueError("לא נמצא פיד RSS באתר")
    feed_url, content = found
    log.warning("%s: הפיד נמצא בכתובת %s - מומלץ לעדכן אותה ב-config.yaml", name, feed_url)
    return parse(content, name, include_unmatched)
