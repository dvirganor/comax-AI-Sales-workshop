"""שרת מקומי שמציג את הדוח ומאפשר להפעיל סריקה ידנית מכפתור "רענן עכשיו".

מאזין רק ל-127.0.0.1, כך שהוא נגיש מהמחשב הזה בלבד.
"""

from __future__ import annotations

import json
import logging
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import pipeline
from .config import Paths, load_config, load_secrets
from .matcher import Matcher
from .store import Store

log = logging.getLogger(__name__)

# כותרת שדפדפן לא שולח בבקשה מאתר אחר בלי אישור CORS - מונעת הפעלת סריקה מדף זר
CSRF_HEADER = "X-Requested-With"
CSRF_VALUE = "news-monitor"


class RefreshController:
    """מריץ סריקה ידנית ברקע, אחת בכל פעם."""

    def __init__(self, paths: Paths, run=pipeline.run):
        self.paths = paths
        self._run = run
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()
        self.message = ""

    @property
    def running(self) -> bool:
        # גם סריקה מתוזמנת (תהליך אחר) מחזיקה את קובץ הנעילה
        return (self._thread is not None and self._thread.is_alive()) or self.paths.lock.exists()

    def start(self) -> bool:
        with self._lock:
            if self.running:
                return False
            self._thread = threading.Thread(target=self._work, daemon=True)
            self._thread.start()
            return True

    def _work(self) -> None:
        try:
            # קובץ ההגדרות נקרא מחדש בכל סריקה, כך ששינויים נכנסים לתוקף בלי להפעיל את השרת מחדש
            result = self._run(load_config(), load_secrets(), self.paths, force=True)
            if result.busy:
                self.message = "סריקה אחרת כבר רצה"
            else:
                self.message = f"נמצאו {len(result.new_items)} ידיעות חדשות"
        except Exception as exc:
            log.exception("סריקה ידנית נכשלה")
            self.message = f"הסריקה נכשלה: {exc}"

    def status(self) -> dict:
        last_run = None
        if self.paths.status.exists():
            last_run = json.loads(self.paths.status.read_text(encoding="utf-8")).get("last_run")
        return {"running": self.running, "last_run": last_run, "message": self.message}


def make_handler(paths: Paths, controller: RefreshController):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):  # לוג של כל בקשה מיותר
            pass

        def _send(self, code: int, body: bytes, content_type: str) -> None:
            self.send_response(code)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _json(self, code: int, data: dict) -> None:
            self._send(code, json.dumps(data, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

        def do_GET(self):
            path = self.path.split("?", 1)[0]
            if path in ("/", "/report.html"):
                if not paths.report.exists():
                    config = load_config()
                    store = Store(str(paths.db))
                    try:
                        pipeline.write_report(config, paths, store, Matcher(config), datetime.now().astimezone())
                    finally:
                        store.close()
                self._send(200, paths.report.read_bytes(), "text/html; charset=utf-8")
            elif path == "/api/status":
                self._json(200, controller.status())
            elif path == "/health":
                self._send(200, b"ok", "text/plain")
            else:
                self._send(404, b"not found", "text/plain")

        def do_POST(self):
            if self.path.split("?", 1)[0] != "/api/refresh":
                self._send(404, b"not found", "text/plain")
            elif self.headers.get(CSRF_HEADER) != CSRF_VALUE:
                self._send(403, b"forbidden", "text/plain")
            elif controller.start():
                self._json(202, {"status": "started"})
            else:
                self._json(409, {"status": "running"})

    return Handler


def make_server(paths: Paths, port: int, controller: RefreshController | None = None) -> ThreadingHTTPServer:
    paths.db.parent.mkdir(parents=True, exist_ok=True)
    controller = controller or RefreshController(paths)
    return ThreadingHTTPServer(("127.0.0.1", port), make_handler(paths, controller))


def serve(paths: Paths, port: int) -> None:
    server = make_server(paths, port)
    log.info("השרת המקומי פועל: http://127.0.0.1:%d/", port)
    server.serve_forever()
