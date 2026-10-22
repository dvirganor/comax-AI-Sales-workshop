"""סריקה אחת: איסוף ממקורות, זיהוי, סינון כפילויות, דוח HTML והודעה בטלגרם."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from . import report, telegram_bot
from .config import Paths
from .matcher import GENERAL_CYBER_GROUP, Matcher
from .sources import SourceResult, fetch_all
from .store import Store, StoredItem, item_id, title_key

log = logging.getLogger(__name__)


@dataclass
class RunResult:
    skipped: bool = False
    new_items: list[StoredItem] = field(default_factory=list)
    failed_sources: list[str] = field(default_factory=list)
    first_run: bool = False


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


def notify(config: dict, secrets: dict, store: Store, matcher: Matcher, first_run: bool, report_path) -> None:
    pending = store.pending_notifications()
    token, chat_id = secrets["telegram"]["bot_token"], secrets["telegram"]["chat_id"]
    if not config.get("telegram_bot", {}).get("enabled", False) or not token or not chat_id:
        if config.get("telegram_bot", {}).get("enabled", False):
            log.warning("בוט טלגרם לא הוגדר (secrets.yaml) - לא נשלחה הודעה")
        # מסמנים כ"טופלו" כדי שלא תגיע הצפה כשהבוט יוגדר בהמשך
        store.mark_notified([i.id for i in pending])
        return
    if not config["telegram_bot"].get("send_general_cyber", False):
        to_send = [i for i in pending if i.groups != [GENERAL_CYBER_GROUP]]
    else:
        to_send = pending
    if first_run:
        # סריקה ראשונה: לא מציפים את הבוט בכל הארכיון - רק סיכום
        telegram_bot.send_text(
            token,
            chat_id,
            f"✅ מערכת ניטור החדשות הופעלה.\nבסריקה הראשונה נמצאו {len(to_send)} ידיעות רלוונטיות - "
            f"הן מופיעות בדוח המקומי:\n{report_path}\nמעכשיו יישלחו לכאן רק ידיעות חדשות.",
        )
    elif to_send:
        telegram_bot.send_items(token, chat_id, to_send, matcher.group_labels, matcher.tag_labels)
    store.mark_notified([i.id for i in pending])


def run(config: dict, secrets: dict, paths: Paths, force: bool = False, send_telegram: bool = True) -> RunResult:
    now = datetime.now().astimezone()
    if not force and not in_schedule(config, now):
        log.info("מחוץ לחלון הזמנים (%s) - דילוג", now.strftime("%a %H:%M"))
        return RunResult(skipped=True)

    paths.db.parent.mkdir(parents=True, exist_ok=True)
    store = Store(str(paths.db))
    try:
        first_run = store.is_empty()
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

        if send_telegram:
            try:
                notify(config, secrets, store, matcher, first_run, paths.report)
            except Exception as exc:  # ננסה שוב בסריקה הבאה (הפריטים נשארים "לא נשלחו")
                log.error("שליחה לטלגרם נכשלה: %s", exc)
        return RunResult(new_items=new_items, failed_sources=failed, first_run=first_run)
    finally:
        store.close()
