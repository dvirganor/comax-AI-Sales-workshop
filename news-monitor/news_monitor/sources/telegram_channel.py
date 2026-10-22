"""קריאת ערוץ טלגרם ציבורי דרך תצוגת הרשת https://t.me/s/<handle> (ללא התחברות)."""

from __future__ import annotations

from collections import Counter
from datetime import datetime

import requests
from bs4 import BeautifulSoup

from ..models import Item

TITLE_MAX = 220


def _title_from_text(text: str) -> str:
    first = next((line.strip() for line in text.splitlines() if line.strip()), "")
    return first if len(first) <= TITLE_MAX else first[: TITLE_MAX - 1].rstrip() + "…"


def strip_common_lines(texts: list[str]) -> list[str]:
    """מסיר שורות שחוזרות ברוב הפוסטים (חתימה, קישור קבוע לאתר/לערוץ), כדי שלא ישפיעו על הזיהוי."""
    if len(texts) < 4:
        return texts
    counts = Counter(line for t in texts for line in {ln.strip() for ln in t.splitlines()} if line)
    threshold = max(3, len(texts) // 2)
    common = {line for line, n in counts.items() if n >= threshold}
    if not common:
        return texts
    return ["\n".join(ln for ln in t.splitlines() if ln.strip() not in common).strip() for t in texts]


def parse(html: str, channel_name: str, include_unmatched: bool | str = False) -> list[Item]:
    soup = BeautifulSoup(html, "html.parser")
    posts: list[tuple[str, str, datetime | None]] = []
    for msg in soup.select("div.tgme_widget_message"):
        text_el = msg.select_one(".tgme_widget_message_text")
        link_el = msg.select_one("a.tgme_widget_message_date")
        if not text_el or not link_el:
            continue
        for br in text_el.find_all("br"):
            br.replace_with("\n")
        text = text_el.get_text().strip()
        if not text:
            continue
        time_el = link_el.find("time")
        published = None
        if time_el and time_el.get("datetime"):
            published = datetime.fromisoformat(time_el["datetime"])
        posts.append((text, link_el["href"], published))

    texts = strip_common_lines([text for text, _, _ in posts])
    return [
        Item(
            title=_title_from_text(text),
            url=url,
            source=channel_name,
            published=published,
            summary=text[:2000],
            include_unmatched=include_unmatched,
        )
        for text, (_, url, published) in zip(texts, posts)
        if text
    ]


def fetch(session: requests.Session, name: str, handle: str, timeout: int, include_unmatched: bool | str) -> list[Item]:
    handle = handle.strip().lstrip("@").removeprefix("https://t.me/").removeprefix("s/").strip("/")
    resp = session.get(f"https://t.me/s/{handle}", timeout=timeout)
    resp.raise_for_status()
    items = parse(resp.text, name, include_unmatched)
    if not items:
        raise ValueError("לא נמצאו פוסטים - ייתכן שהערוץ פרטי או ששם הערוץ (handle) שגוי")
    return items
