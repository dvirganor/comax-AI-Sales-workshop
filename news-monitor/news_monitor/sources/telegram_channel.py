"""קריאת ערוץ טלגרם ציבורי דרך תצוגת הרשת https://t.me/s/<handle> (ללא התחברות)."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

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


_Post = tuple[str, str, "datetime | None"]  # (טקסט, קישור, זמן פרסום)


def _post_id(url: str) -> int | None:
    tail = url.rstrip("/").rsplit("/", 1)[-1]
    return int(tail) if tail.isdigit() else None


def _extract_posts(html: str) -> list[_Post]:
    soup = BeautifulSoup(html, "html.parser")
    posts: list[_Post] = []
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
    return posts


def _build_items(posts: list[_Post], channel_name: str, include_unmatched: bool | str) -> list[Item]:
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


def parse(html: str, channel_name: str, include_unmatched: bool | str = False) -> list[Item]:
    return _build_items(_extract_posts(html), channel_name, include_unmatched)


def fetch(
    session: requests.Session,
    name: str,
    handle: str,
    timeout: int,
    include_unmatched: bool | str,
    max_age_hours: int = 72,
    max_pages: int = 10,
) -> list[Item]:
    """הדף הציבורי מציג כ-20 פוסטים; מדפדפים אחורה (?before=) עד שמגיעים לפוסטים ישנים מ-max_age_hours."""
    handle = handle.strip().lstrip("@").removeprefix("https://t.me/").removeprefix("s/").strip("/")
    oldest_wanted = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    posts: dict[str, _Post] = {}
    before: int | None = None
    for _ in range(max_pages):
        url = f"https://t.me/s/{handle}" + (f"?before={before}" if before else "")
        if before is None:
            resp = session.get(url, timeout=timeout)
            resp.raise_for_status()
        else:
            # דף ישן יותר שנכשל - מסתפקים במה שכבר נאסף
            try:
                resp = session.get(url, timeout=timeout)
            except requests.RequestException:
                break
            if resp.status_code != 200:
                break
        page = _extract_posts(resp.text)
        for post in page:
            posts.setdefault(post[1], post)
        ids = [i for i in (_post_id(p[1]) for p in page) if i is not None]
        dates = [p[2] for p in page if p[2] is not None]
        if not ids or (before is not None and min(ids) >= before):
            break  # אין עוד פוסטים ישנים יותר
        if dates and min(dates) < oldest_wanted:
            break
        before = min(ids)
    items = _build_items(list(posts.values()), name, include_unmatched)
    if not items:
        raise ValueError("לא נמצאו פוסטים - ייתכן שהערוץ פרטי או ששם הערוץ (handle) שגוי")
    return items
