"""האפליקציה המקומית: מציגה את הדוח, מריצה סריקה מכפתור "רענן עכשיו",
ומריצה סריקה אוטומטית בכל שעה עגולה בחלון הזמנים שב-config.yaml.

מאזינה רק ל-127.0.0.1, כך שהיא נגישה מהמחשב הזה בלבד.
"""

from __future__ import annotations

import hashlib
import json
import logging
import subprocess
import sys
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import pipeline
from .config import BASE_DIR, Paths, load_config
from .matcher import Matcher
from .store import Store

log = logging.getLogger(__name__)

# כותרת שדפדפן לא שולח בבקשה מאתר אחר בלי אישור CORS - מונעת הפעלת סריקה מדף זר
CSRF_HEADER = "X-Requested-With"
CSRF_VALUE = "news-monitor"


class RefreshController:
    """מריץ סריקה ברקע (ידנית או אוטומטית), אחת בכל פעם."""

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
            result = self._run(load_config(), self.paths, force=True)
            if result.busy:
                self.message = "סריקה אחרת כבר רצה"
            else:
                self.message = f"נמצאו {len(result.new_items)} ידיעות חדשות"
        except Exception as exc:
            log.exception("הסריקה נכשלה")
            self.message = f"הסריקה נכשלה: {exc}"

    def status(self) -> dict:
        last_run = None
        if self.paths.status.exists():
            last_run = json.loads(self.paths.status.read_text(encoding="utf-8")).get("last_run")
        next_scan = pipeline.next_scheduled(load_config(), datetime.now().astimezone())
        return {
            "running": self.running,
            "last_run": last_run,
            "next_scan": next_scan.isoformat() if next_scan else None,
            "message": self.message,
        }


class AutoScheduler:
    """מפעיל סריקה פעם אחת בכל שעה שנמצאת בחלון הזמנים (ראשונה ברגע שהאפליקציה עולה)."""

    def __init__(self, controller: RefreshController, interval_seconds: int = 30):
        self.controller = controller
        self.interval = interval_seconds
        self.last_slot: str | None = None

    def tick(self, now: datetime, config: dict) -> bool:
        if not pipeline.in_schedule(config, now):
            return False
        slot = now.strftime("%Y-%m-%d %H")
        if slot == self.last_slot:
            return False
        self.last_slot = slot
        log.info("סריקה אוטומטית (%02d:00)", now.hour)
        return self.controller.start()

    def run_forever(self, stop: threading.Event) -> None:
        while True:
            try:
                self.tick(datetime.now().astimezone(), load_config())
            except Exception:  # שגיאה בקובץ ההגדרות וכו' - לא עוצרים את התזמון
                log.exception("שגיאה בתזמון הסריקה")
            if stop.wait(self.interval):
                return


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


class _Server(ThreadingHTTPServer):
    # ב-Windows, SO_REUSEADDR מאפשר לשני תהליכים להאזין לאותו פורט - שם מכבים אותו
    # כדי שהפעלה כפולה של האפליקציה תיכשל בבירור במקום להתנגש
    allow_reuse_address = sys.platform != "win32"
    daemon_threads = True


def make_server(paths: Paths, port: int, controller: RefreshController | None = None) -> ThreadingHTTPServer:
    paths.db.parent.mkdir(parents=True, exist_ok=True)
    controller = controller or RefreshController(paths)
    server = _Server(("127.0.0.1", port), make_handler(paths, controller))
    server.controller = controller
    return server


def code_signature(package_dir: Path = Path(__file__).resolve().parent) -> str:
    """טביעת אצבע של קוד האפליקציה - משתנה כשמחלצים גרסה חדשה מעל התיקייה."""
    digest = hashlib.sha1()
    for path in sorted(package_dir.rglob("*.py")):
        digest.update(path.relative_to(package_dir).as_posix().encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()


class CodeWatcher:
    """מזהה שהקוד עודכן, ומבקש הפעלה מחדש רק כשאין סריקה באמצע."""

    def __init__(self, controller: RefreshController, signature=code_signature):
        self.controller = controller
        self._signature = signature
        self._initial = signature()

    def should_restart(self) -> bool:
        try:
            changed = self._signature() != self._initial
        except OSError:  # קובץ באמצע חילוץ - ננסה בבדיקה הבאה
            return False
        return changed and not self.controller.running


def _spawn_new_instance() -> None:
    flags = getattr(subprocess, "DETACHED_PROCESS", 0) | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    subprocess.Popen([sys.executable, "-m", "news_monitor", "serve"], cwd=str(BASE_DIR),
                     creationflags=flags, close_fds=True)


def serve(paths: Paths, port: int) -> None:
    try:
        server = make_server(paths, port)
    except OSError:
        log.info("האפליקציה כבר פועלת בפורט %d - אין צורך בהפעלה נוספת", port)
        return
    stop = threading.Event()
    restart = threading.Event()
    watcher = CodeWatcher(server.controller)

    def watch() -> None:
        while not stop.wait(30):
            if watcher.should_restart():
                restart.set()
                server.shutdown()
                return

    threading.Thread(target=AutoScheduler(server.controller).run_forever, args=(stop,), daemon=True).start()
    threading.Thread(target=watch, daemon=True).start()
    log.info("האפליקציה פועלת: http://127.0.0.1:%d/", port)
    try:
        server.serve_forever()
    finally:
        stop.set()
        server.server_close()  # משחרר את הפורט לפני שהמופע החדש עולה
    if restart.is_set():
        log.info("קוד האפליקציה עודכן - מפעיל מחדש")
        _spawn_new_instance()
