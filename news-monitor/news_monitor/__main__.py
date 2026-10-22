"""שורת פקודה: python -m news_monitor <פקודה>

  run [--force] [--no-telegram]   סריקה (מחוץ לשעות 08-18 א'-ה' מדלג, אלא אם --force)
  check-sources                   בדיקת כל המקורות והצגת מספר הפריטים מכל אחד
  report                          יצירה מחדש של דוח ה-HTML
  telegram-chat-id                הצגת ה-chat_id של מי שכתב לבוט
  telegram-test                   שליחת הודעת בדיקה לבוט
  serve                           שרת מקומי: הדוח + כפתור "רענן עכשיו" (http://127.0.0.1:8765)
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler

from . import pipeline, server, telegram_bot
from .config import load_config, load_secrets, paths
from .matcher import Matcher
from .sources import fetch_all
from .store import Store


def _setup_logging(log_dir) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)
    handlers: list[logging.Handler] = [
        RotatingFileHandler(log_dir / "monitor.log", maxBytes=2_000_000, backupCount=3, encoding="utf-8")
    ]
    if sys.stderr is not None:  # pythonw (ריצה מתוזמנת ללא חלון) - אין קונסולה
        handlers.append(logging.StreamHandler())
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", handlers=handlers)


def _print(text: str = "") -> None:
    if sys.stdout is not None:
        print(text)


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        if stream is not None and hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(prog="news_monitor", description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    run_p = sub.add_parser("run")
    run_p.add_argument("--force", action="store_true", help="להריץ גם מחוץ לחלון הזמנים")
    run_p.add_argument("--no-telegram", action="store_true", help="לא לשלוח לבוט")
    sub.add_parser("check-sources")
    sub.add_parser("report")
    sub.add_parser("telegram-chat-id")
    sub.add_parser("telegram-test")
    sub.add_parser("serve")
    args = parser.parse_args(argv)

    config = load_config()
    secrets = load_secrets()
    p = paths(config)
    _setup_logging(p.logs)

    if args.cmd == "run":
        result = pipeline.run(config, secrets, p, force=args.force, send_telegram=not args.no_telegram)
        if result.busy:
            _print("סריקה אחרת כבר רצה - נסה שוב בעוד דקה.")
        elif not result.skipped:
            _print(f"נמצאו {len(result.new_items)} ידיעות חדשות. דוח: {p.report}")
        return 0

    if args.cmd == "serve":
        server.serve(p, config.get("server", {}).get("port", 8765))
        return 0

    if args.cmd == "check-sources":
        for r in fetch_all(config):
            _print(f"{'✗' if r.error else '✓'} {r.name}: {r.error or f'{len(r.items)} פריטים'}")
        return 0

    if args.cmd == "report":
        p.db.parent.mkdir(parents=True, exist_ok=True)
        store = Store(str(p.db))
        try:
            pipeline.write_report(config, p, store, Matcher(config), datetime.now().astimezone())
        finally:
            store.close()
        _print(f"הדוח נוצר: {p.report}")
        return 0

    token = secrets["telegram"]["bot_token"]
    if not token:
        _print("חסר bot_token בקובץ secrets.yaml")
        return 1

    if args.cmd == "telegram-chat-id":
        chats = telegram_bot.list_chats(token)
        if not chats:
            _print("לא נמצאו הודעות. שלח הודעה כלשהי לבוט בטלגרם ונסה שוב.")
            return 1
        for chat_id, name in chats:
            _print(f"chat_id: {chat_id}   ({name})")
        return 0

    if args.cmd == "telegram-test":
        telegram_bot.send_text(token, secrets["telegram"]["chat_id"], "✅ הודעת בדיקה ממערכת ניטור החדשות")
        _print("נשלח.")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
