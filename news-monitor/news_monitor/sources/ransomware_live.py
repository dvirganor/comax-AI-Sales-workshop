"""קורבנות כופרה ישראליים מתוך ransomware.live (מאגר ציבורי של פרסומים באתרי הדלפה)."""

from __future__ import annotations

from datetime import datetime, timezone

import requests

from ..models import Item

HOME = "https://www.ransomware.live/"


def _first(d: dict, *keys: str) -> str:
    for key in keys:
        if d.get(key):
            return str(d[key]).strip()
    return ""


def _parse_date(value: str) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00").replace(" ", "T", 1))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def parse(data, include_unmatched: bool = True) -> list[Item]:
    records = data.get("victims", data.get("data", [])) if isinstance(data, dict) else data
    items = []
    for rec in records or []:
        if not isinstance(rec, dict):
            continue
        victim = _first(rec, "victim", "post_title", "name")
        if not victim:
            continue
        group = _first(rec, "group", "group_name")
        website = _first(rec, "website", "domain")
        title = f"קורבן כופרה: {victim}" + (f" (קבוצת {group})" if group else "")
        items.append(
            Item(
                title=title,
                url=_first(rec, "permalink", "url", "post_url") or HOME,
                source="ransomware.live",
                published=_parse_date(_first(rec, "discovered", "published", "attackdate", "date")),
                summary=" ".join(x for x in (victim, website, _first(rec, "description"))),
                include_unmatched=include_unmatched,
            )
        )
    return items


def fetch(session: requests.Session, url: str, timeout: int, include_unmatched: bool) -> list[Item]:
    resp = session.get(url, timeout=timeout, headers={"Accept": "application/json"})
    resp.raise_for_status()
    return parse(resp.json(), include_unmatched)
