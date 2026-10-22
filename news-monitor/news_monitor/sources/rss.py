from __future__ import annotations

import calendar
import html
import re
from datetime import datetime, timezone

import feedparser
import requests

from ..models import Item

_TAGS = re.compile(r"<[^>]+>")


def clean_html(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(_TAGS.sub(" ", text or ""))).strip()


def entry_published(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        value = entry.get(key)
        if value:
            return datetime.fromtimestamp(calendar.timegm(value), tz=timezone.utc)
    return None


def parse(content: bytes, source_name: str) -> list[Item]:
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
            )
        )
    return items


def fetch(session: requests.Session, name: str, url: str, timeout: int) -> list[Item]:
    resp = session.get(url, timeout=timeout)
    resp.raise_for_status()
    return parse(resp.content, name)
