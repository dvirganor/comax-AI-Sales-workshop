from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Callable

import requests

from ..models import Item
from . import google_news, ransomware_live, rss, telegram_channel

log = logging.getLogger(__name__)


@dataclass
class SourceResult:
    name: str
    items: list[Item] = field(default_factory=list)
    error: str | None = None


def make_session(config: dict) -> requests.Session:
    session = requests.Session()
    session.headers["User-Agent"] = config["http"]["user_agent"]
    session.headers["Accept-Language"] = "he-IL,he;q=0.9,en;q=0.8"
    return session


def build_fetchers(config: dict) -> list[tuple[str, Callable[[requests.Session, int], list[Item]]]]:
    """רשימת (שם מקור, פונקציית איסוף) לפי קובץ ההגדרות."""
    src = config["sources"]
    fetchers: list[tuple[str, Callable]] = []

    gn = src.get("google_news", {})
    if gn.get("enabled", True):
        for i, query in enumerate(google_news.build_queries(config["groups"], gn.get("entities_per_query", 6)), 1):
            fetchers.append(
                (f"Google News #{i}", lambda s, t, q=query: google_news.fetch(s, q, gn.get("when", "1d"), t))
            )

    for feed in src.get("rss", []) or []:
        fetchers.append((feed["name"], lambda s, t, f=feed: rss.fetch(s, f["name"], f["url"], t)))

    for ch in src.get("telegram_channels", []) or []:
        if not ch.get("handle"):
            log.warning("ערוץ הטלגרם '%s' מדולג: לא הוגדר handle ב-config.yaml", ch["name"])
            continue
        fetchers.append(
            (
                f"טלגרם: {ch['name']}",
                lambda s, t, c=ch: telegram_channel.fetch(
                    s, c["name"], c["handle"], t, c.get("include_unmatched", False)
                ),
            )
        )

    rl = src.get("ransomware_live", {})
    if rl.get("enabled", False):
        fetchers.append(
            ("ransomware.live", lambda s, t: ransomware_live.fetch(s, rl["url"], t, rl.get("include_unmatched", True)))
        )
    return fetchers


def fetch_all(config: dict) -> list[SourceResult]:
    session = make_session(config)
    timeout = config["http"]["timeout_seconds"]
    results = []
    for name, fetch in build_fetchers(config):
        try:
            items = fetch(session, timeout)
            log.info("%s: %d פריטים", name, len(items))
            results.append(SourceResult(name, items))
        except Exception as exc:  # מקור אחד שנכשל לא מפיל את הסריקה
            log.warning("%s: נכשל - %s", name, exc)
            results.append(SourceResult(name, error=str(exc)[:300]))
    return results
