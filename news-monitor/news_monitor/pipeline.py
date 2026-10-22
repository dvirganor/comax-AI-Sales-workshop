"""סריקה אחת: איסוף ממקורות, זיהוי, סינון כפילויות ודוח HTML."""

from __future__ import annotations

import json
import logging
import os
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path

from . import report
from .config import Paths
from .matcher import Matcher
from .sources import SourceResult, fetch_all
from .store import Store, StoredItem, item_id, title_key

log = logging.getLogger(__name__)


@dataclass
class RunResult:
    skipped: bool = False
    # סריקה אחרת (מתוזמנת או ידנית) כבר רצה
    busy: bool = False
    new_items: list[StoredItem] = field(default_factory=list)
    failed_sources: list[str] = field(default_factory=list)


LOCK_STALE_SECONDS = 30 * 60


@contextmanager
def run_lock(path: Path):
    """נעילה בין תהליכים: מונעת סריקה מתוזמנת וסריקה ידנית במקביל. מחזיר False אם נעול."""
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        if time.time() - path.stat().st_mtime > LOCK_STALE_SECONDS:
            path.unlink(missing_ok=True)  # נעילה שנשארה מתהליך שקרס
    except FileNotFoundError:
        pass
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        yield False
        return
    try:
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        yield True
    finally:
        path.unlink(missing_ok=True)


def in_schedule(config: dict, now: datetime) -> bool:
    sched = config["schedule"]
    # Python: Monday=0 ... Sunday=6 ; בקובץ ההגדרות: ראשון=0 ... שבת=6
    day = (now.weekday() + 1) % 7
    return day in sched["days"] and sched["start_hour"] <= now.hour <= sched["end_hour"]


def process(
    results: list[SourceResult], matcher: Matcher, store: Store, now: datetime, max_age_hours: int
) -> list[StoredItem]:
    oldest = now - timedelta(hours=max_age_hours)
    new: list[StoredItem] = []
    # ידיעות שכבר טופלו בסריקה הזו: קישור/כותרת -> מזהה הידיעה השמורה
    by_url: dict[str, str] = {}
    by_title: dict[str, str] = {}
    for result in results:
        for item in result.items:
            if item.published and item.published < oldest:
                continue
            iid, tkey = item_id(item.url), title_key(item.title)
            existing = by_url.get(iid) or by_title.get(tkey)
            if existing is None:
                match = matcher.analyze(item)
                if match is None:
                    continue
                existing = store.find(item, now=now)
                if existing is None:
                    stored = store.add(item, match, now)
                    new.append(stored)
                    existing = stored.id
                by_url[iid] = by_title[tkey] = existing
            # אותה ידיעה ממקור נוסף - נשמרת כקישור נוסף תחת אותה כותרת
            store.add_link(existing, item)
    return new


def write_report(config: dict, paths: Paths, store: Store, matcher: Matcher, now: datetime) -> None:
    status = {}
    if paths.status.exists():
        status = json.loads(paths.status.read_text(encoding="utf-8"))
    run_started = datetime.fromisoformat(status["last_run"]) if status.get("last_run") else None
    items = store.recent(config["report"]["days_to_show"], now=now)
    page = report.render(
        items,
        matcher.group_labels,
        matcher.tag_labels,
        generated_at=now,
        run_started=run_started,
        failed_sources=status.get("failed_sources"),
    )
    report.write(paths.report, page)


def run(config: dict, paths: Paths, force: bool = False) -> RunResult:
    now = datetime.now().astimezone()
    if not force and not in_schedule(config, now):
        log.info("מחוץ לחלון הזמנים (%s) - דילוג", now.strftime("%a %H:%M"))
        return RunResult(skipped=True)

    with run_lock(paths.lock) as acquired:
        if not acquired:
            log.info("סריקה אחרת כבר רצה - דילוג")
            return RunResult(skipped=True, busy=True)
        return _run(config, paths, now)


def _run(config: dict, paths: Paths, now: datetime) -> RunResult:
    paths.db.parent.mkdir(parents=True, exist_ok=True)
    store = Store(str(paths.db))
    try:
        matcher = Matcher(config)
        results = fetch_all(config)
        new_items = process(results, matcher, store, now, config.get("max_age_hours", 72))
        failed = [r.name for r in results if r.error]
        log.info("סריקה הסתיימה: %d ידיעות חדשות, %d מקורות נכשלו", len(new_items), len(failed))

        report.write_status(
            paths.status,
            {
                "last_run": now.isoformat(),
                "new_items": len(new_items),
                "failed_sources": failed,
                "sources": {r.name: (r.error or len(r.items)) for r in results},
            },
        )
        write_report(config, paths, store, matcher, now)
        return RunResult(new_items=new_items, failed_sources=failed)
    finally:
        store.close()
