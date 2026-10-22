"""שורת פקודה: python -m news_monitor <פקודה>

  run [--force]                   סריקה (מחוץ לשעות 08-18 א'-ה' מדלג, אלא אם --force)
  check-sources                   בדיקת כל המקורות והצגת מספר הפריטים מכל אחד
  report                          יצירה מחדש של דוח ה-HTML
  serve                           שרת מקומי: הדוח + כפתור "רענן עכשיו" (http://127.0.0.1:8765)
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler

from . import pipeline, server
from .config import load_config, paths
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
    sub.add_parser("check-sources")
    sub.add_parser("report")
    sub.add_parser("serve")
    args = parser.parse_args(argv)

    config = load_config()
    p = paths(config)
    _setup_logging(p.logs)

    if args.cmd == "run":
        result = pipeline.run(config, p, force=args.force)
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

    return 1


if __name__ == "__main__":
    sys.exit(main())
