from datetime import datetime, timedelta, timezone

import pytest

from news_monitor import report
from news_monitor.config import load_config
from news_monitor.matcher import GENERAL_CYBER_GROUP, Matcher, compile_term
from news_monitor.models import Item
from news_monitor.pipeline import in_schedule, process
from news_monitor.sources import SourceResult, google_news, ransomware_live, rss, telegram_channel
from news_monitor.store import Store, normalize_url

NOW = datetime(2026, 10, 22, 10, 0, tzinfo=timezone.utc)


@pytest.fixture(scope="module")
def config():
    return load_config()


@pytest.fixture(scope="module")
def matcher(config):
    return Matcher(config)


@pytest.fixture
def store(tmp_path):
    s = Store(str(tmp_path / "t.db"))
    yield s
    s.close()


# ---------- זיהוי ----------

@pytest.mark.parametrize(
    "term,text,expected",
    [
        ("שופרסל", "שופרסל מוכרת 5 סניפים", True),
        ("שופרסל", "המניה של בשופרסל זינקה", True),
        ("שופרסל", "ההנהלה ושופרסל הגיעו להסכם", True),
        ("שופרסל", "בשופרסלים", False),
        ("SAP", "פריצה ללקוחות של ה-SAP", True),
        ("SAP", "בSAP הודיעו", True),
        ("SAP", "the sap of trees", False),
        ("SAP", "SAPIENS acquires", False),
        ("רמי לוי", "רמי  לוי פותח סניף", True),
        ("Nayax", "NAYAX reports results", True),
    ],
)
def test_compile_term(term, text, expected):
    assert bool(compile_term(term).search(text)) is expected


def test_entity_and_tags(matcher):
    m = matcher.analyze(Item("מתקפת כופרה על ריטליקס: מידע של לקוחות דלף", "u", "s"))
    assert m.entities == ["ריטליקס (Retalix)"]
    assert m.groups == ["software"]
    assert "cyber" in m.tags


def test_retail_deal(matcher):
    m = matcher.analyze(Item("יוחננוף רוכשת 3 סניפים מחצי חינם", "u", "s"))
    assert set(m.entities) == {"יוחננוף", "חצי חינם"}
    assert m.groups == ["retail"]
    assert "deal" in m.tags


def test_ambiguous_name_requires_context(matcher):
    assert matcher.analyze(Item("ניצחון של מכבי בגולף", "u", "s")) is None
    m = matcher.analyze(Item("גולף סוגרת 12 חנויות", "u", "s"))
    assert m and m.entities == ["גולף"]


def test_unmatched_cyber_source(matcher):
    assert matcher.analyze(Item("כותרת כללית", "u", "s")) is None
    m = matcher.analyze(Item("קבוצת האקרים תקפה חברה", "u", "s", include_unmatched=True))
    assert m.groups == [GENERAL_CYBER_GROUP]
    assert m.tags[0] == "cyber"


# ---------- מקורות ----------

RSS = b"""<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>t</title>
<item><title><![CDATA[\xd7\xa9\xd7\x95\xd7\xa4\xd7\xa8\xd7\xa1\xd7\x9c &amp; co]]></title>
<link>https://www.ynet.co.il/a/1</link><pubDate>Wed, 21 Oct 2026 08:00:00 GMT</pubDate>
<description>&lt;p&gt;text&lt;/p&gt;</description></item>
<item><title></title><link>https://x</link></item>
</channel></rss>"""


def test_rss_parse():
    items = rss.parse(RSS, "ynet")
    assert len(items) == 1
    assert items[0].include_unmatched is False
    assert rss.parse(RSS, "cyber", include_unmatched=True)[0].include_unmatched is True
    assert items[0].title == "שופרסל & co"
    assert items[0].summary == "text"
    assert items[0].published == datetime(2026, 10, 21, 8, tzinfo=timezone.utc)


def test_google_news_queries_and_parse(config):
    queries = google_news.build_queries(config["groups"], 6)
    assert '"רמי לוי"' in " ".join(queries)
    assert all(q.count(" OR ") >= 1 for q in queries)
    assert "when%3A1d" in google_news.query_url("x", "1d")
    xml = """<?xml version="1.0"?><rss><channel><item><title>טאביט מגייסת - גלובס</title>
    <link>https://news.google.com/rss/articles/abc</link><source url="https://globes.co.il">גלובס</source>
    <pubDate>Wed, 21 Oct 2026 08:00:00 GMT</pubDate></item></channel></rss>""".encode()
    [item] = google_news.parse(xml)
    assert item.title == "טאביט מגייסת"
    assert item.source == "גלובס"


TG_HTML = """<div class="tgme_widget_message_wrap"><div class="tgme_widget_message" data-post="ch/10">
<div class="tgme_widget_message_text">🔴 דליפת מידע מרשת אושר עד<br>פרטים נוספים בהמשך</div>
<a class="tgme_widget_message_date" href="https://t.me/ch/10"><time datetime="2026-10-22T07:30:00+00:00">10:30</time></a>
</div></div>
<div class="tgme_widget_message"><a class="tgme_widget_message_date" href="https://t.me/ch/11"></a></div>"""


def test_telegram_parse(matcher):
    [item] = telegram_channel.parse(TG_HTML, "ערוץ", include_unmatched=True)
    assert item.title == "🔴 דליפת מידע מרשת אושר עד"
    assert item.url == "https://t.me/ch/10"
    assert item.published == datetime(2026, 10, 22, 7, 30, tzinfo=timezone.utc)
    m = matcher.analyze(item)
    assert m.entities == ["אושר עד"] and "cyber" in m.tags


def test_ransomware_parse(matcher):
    data = [
        {"victim": "shufersal.co.il", "group": "lockbit", "discovered": "2026-10-21 10:00:00.000"},
        {"post_title": "Some Israeli Co", "group_name": "akira", "url": "https://x/1"},
        {"nothing": 1},
    ]
    items = ransomware_live.parse(data)
    assert [i.title for i in items] == [
        "קורבן כופרה: shufersal.co.il (קבוצת lockbit)",
        "קורבן כופרה: Some Israeli Co (קבוצת akira)",
    ]
    assert items[0].published.tzinfo is not None
    assert items[1].url == "https://x/1"
    assert matcher.analyze(items[0]).entities == ["שופרסל"]
    assert matcher.analyze(items[1]).groups == [GENERAL_CYBER_GROUP]
    assert ransomware_live.parse({"victims": data[:1]})[0].title.startswith("קורבן")


# ---------- אחסון וסינון כפילויות ----------

def test_normalize_url():
    assert normalize_url("HTTPS://Site.co.il/a/?utm_source=x&id=2#top") == "https://site.co.il/a?id=2"


def test_process_dedupes(matcher, store):
    results = [
        SourceResult("a", [
            Item("שופרסל מוכרת סניפים", "https://a/1?utm_source=x", "A", NOW),
            Item("שופרסל מוכרת סניפים", "https://b/2", "B", NOW),  # אותה כותרת ממקור אחר
            Item("ידיעה לא רלוונטית", "https://a/3", "A", NOW),
            Item("רמי לוי ישנה", "https://a/4", "A", NOW - timedelta(days=10)),  # ישנה מדי
        ])
    ]
    new = process(results, matcher, store, NOW, 72)
    assert [i.title for i in new] == ["שופרסל מוכרת סניפים"]
    # סריקה נוספת - אותו פריט לא נחשב חדש
    assert process(results, matcher, store, NOW + timedelta(hours=1), 72) == []
    [stored] = store.recent(7, now=NOW)
    # המקור השני נשמר כקישור נוסף, פעם אחת בלבד
    assert stored.extra_links == [("B", "https://b/2")]


def test_extra_sources_across_runs(matcher, store):
    first = [SourceResult("a", [Item("טאביט מגייסת 20 מיליון", "https://globes/1", "גלובס", NOW)])]
    later = [SourceResult("b", [
        Item("טאביט מגייסת 20 מיליון", "https://ynet/9", "ynet", NOW),
        Item("טאביט מגייסת 20 מיליון", "https://news.google.com/x", "גלובס", NOW),  # אותו מקור כמו הראשי
        Item("טאביט מגייסת 20 מיליון", "https://calcalist/5", "כלכליסט", NOW),
    ])]
    assert len(process(first, matcher, store, NOW, 72)) == 1
    assert process(later, matcher, store, NOW + timedelta(hours=1), 72) == []
    [item] = store.recent(7, now=NOW)
    assert item.url == "https://globes/1"
    assert item.extra_links == [("ynet", "https://ynet/9"), ("כלכליסט", "https://calcalist/5")]
    page = report.render([item], matcher.group_labels, matcher.tag_labels, NOW)
    assert "גם ב:" in page and 'href="https://ynet/9"' in page


@pytest.mark.parametrize(
    "dt,expected",
    [
        (datetime(2026, 10, 25, 8, 0), True),    # ראשון 08:00
        (datetime(2026, 10, 29, 18, 0), True),   # חמישי 18:00
        (datetime(2026, 10, 29, 19, 0), False),  # חמישי 19:00
        (datetime(2026, 10, 25, 7, 59), False),
        (datetime(2026, 10, 30, 10, 0), False),  # שישי
        (datetime(2026, 10, 31, 10, 0), False),  # שבת
    ],
)
def test_schedule(config, dt, expected):
    assert in_schedule(config, dt) is expected


# ---------- פלט ----------

def _stored(store, matcher, title, url):
    item = Item(title, url, "גלובס", NOW)
    return store.add(item, matcher.analyze(item), NOW)


def test_report_render(matcher, store):
    item = _stored(store, matcher, 'פריצה ל"טאביט" <script>', "https://a/x?a=1&b=2")
    page = report.render([item], matcher.group_labels, matcher.tag_labels, NOW, run_started=NOW,
                         failed_sources=["ice"])
    assert 'dir="rtl"' in page
    assert "&lt;script&gt;" in page
    assert 'href="https://a/x?a=1&amp;b=2"' in page
    assert "badge new" in page and "badge cyber" in page
    assert "ice" in page


# ---------- נעילה ושרת מקומי ----------

def test_run_lock(tmp_path):
    from news_monitor.pipeline import run_lock

    lock = tmp_path / "run.lock"
    with run_lock(lock) as first:
        assert first and lock.exists()
        with run_lock(lock) as second:
            assert second is False
    assert not lock.exists()


def test_server_refresh(tmp_path, monkeypatch):
    import json
    import threading
    import urllib.error
    import urllib.request

    from news_monitor import server
    from news_monitor.config import load_config, paths
    from news_monitor.pipeline import RunResult

    p = paths(load_config(), base=tmp_path)
    release = threading.Event()
    calls = []

    def fake_run(config, paths_, force):
        calls.append(force)
        release.wait(5)
        return RunResult(new_items=[])

    controller = server.RefreshController(p, run=fake_run)
    srv = server.make_server(p, 0, controller)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"

    def request(path, method="GET", headers=None):
        req = urllib.request.Request(base + path, method=method, headers=headers or {})
        try:
            with urllib.request.urlopen(req, timeout=5) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    try:
        status, body = request("/")
        assert status == 200 and "רענן עכשיו".encode() in body
        assert request("/api/refresh", "POST")[0] == 403  # בלי הכותרת - חסום
        hdr = {server.CSRF_HEADER: server.CSRF_VALUE}
        assert request("/api/refresh", "POST", hdr)[0] == 202
        assert request("/api/refresh", "POST", hdr)[0] == 409  # כבר רצה
        assert json.loads(request("/api/status")[1])["running"] is True
        release.set()
        controller._thread.join(5)
        st = json.loads(request("/api/status")[1])
        assert st["running"] is False and st["message"] == "נמצאו 0 ידיעות חדשות"
        assert calls == [True]
        # סריקה מתוזמנת שרצה בתהליך אחר (קובץ נעילה) נחשבת "רצה"
        p.lock.write_text("1")
        assert request("/api/refresh", "POST", hdr)[0] == 409
    finally:
        srv.shutdown()
        srv.server_close()


# ---------- איתור פיד RSS ----------

class _Resp:
    def __init__(self, status, content=b""):
        self.status_code, self.content = status, content
        self.text = content.decode("utf-8", "replace")

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"{self.status_code} error")


class _FakeSession:
    def __init__(self, pages):
        self.pages, self.requested = pages, []

    def get(self, url, timeout=None):
        self.requested.append(url)
        return self.pages.get(url, _Resp(404))


def test_rss_discovery_from_homepage_link():
    home = b'<html><head><link rel="alternate" type="application/rss+xml" href="/news/rss.xml"></head></html>'
    session = _FakeSession({"https://site.co.il/": _Resp(200, home), "https://site.co.il/news/rss.xml": _Resp(200, RSS)})
    items = rss.fetch(session, "s", "https://site.co.il/feed/", 5, include_unmatched=True)
    assert len(items) == 1 and items[0].include_unmatched


def test_rss_discovery_common_path_and_failure():
    session = _FakeSession({"https://site.co.il/": _Resp(200, b"<html></html>"), "https://site.co.il/rss": _Resp(200, RSS)})
    assert len(rss.fetch(session, "s", "https://site.co.il/", 5)) == 1
    with pytest.raises(RuntimeError, match="404"):
        rss.fetch(_FakeSession({}), "s", "https://nothing.co.il/feed", 5)
    with pytest.raises(ValueError, match="לא נמצא פיד"):
        rss.fetch(_FakeSession({"https://x.co.il/": _Resp(200, b"<html></html>")}), "s", "https://x.co.il/", 5)


def test_report_sources_panel(matcher):
    page = report.render([], matcher.group_labels, matcher.tag_labels, NOW,
                         sources={"ynet": 30, "כלכליסט": "403 Forbidden"})
    assert "מצב מקורות: 1 מתוך 2 תקינים" in page
    assert "✓ ynet: 30 פריטים" in page and "✗ כלכליסט: 403 Forbidden" in page


# ---------- תזמון פנימי באפליקציה ----------

@pytest.mark.parametrize(
    "now,expected",
    [
        (datetime(2026, 10, 25, 9, 30), datetime(2026, 10, 25, 10, 0)),  # ראשון באמצע היום
        (datetime(2026, 10, 25, 18, 5), datetime(2026, 10, 26, 8, 0)),   # אחרי 18:00 -> מחר 08:00
        (datetime(2026, 10, 29, 18, 0), datetime(2026, 11, 1, 8, 0)),    # חמישי ערב -> ראשון
        (datetime(2026, 10, 25, 6, 0), datetime(2026, 10, 25, 8, 0)),    # לפני תחילת היום
    ],
)
def test_next_scheduled(config, now, expected):
    from news_monitor.pipeline import next_scheduled

    assert next_scheduled(config, now) == expected


def test_auto_scheduler_once_per_hour(config):
    from news_monitor.server import AutoScheduler

    class Ctrl:
        starts = 0

        def start(self):
            Ctrl.starts += 1
            return True

    sched = AutoScheduler(Ctrl())
    assert sched.tick(datetime(2026, 10, 25, 9, 0, 10), config) is True      # תחילת שעה בחלון
    assert sched.tick(datetime(2026, 10, 25, 9, 40), config) is False        # אותה שעה - לא שוב
    assert sched.tick(datetime(2026, 10, 25, 10, 0, 20), config) is True     # שעה חדשה
    assert sched.tick(datetime(2026, 10, 30, 10, 0), config) is False        # שישי - מחוץ לחלון
    assert Ctrl.starts == 2


def test_second_server_instance_exits_quietly(tmp_path):
    from news_monitor import server
    from news_monitor.config import load_config, paths

    p = paths(load_config(), base=tmp_path)
    first = server.make_server(p, 0)
    try:
        # serve() על פורט תפוס חוזר מיד בלי חריגה
        server.serve(p, first.server_address[1])
    finally:
        first.server_close()


# ---------- מקרים אמיתיים מהשימוש ----------

@pytest.mark.parametrize(
    "title,expected",
    [
        ("קלייפייס מוכיח ש-DC מוכנה להגעיל - ביקורת סרט האימה ביקום של באטמן", []),
        ("ביקום משיקה מערכת קופות חדשה למסעדות", ["ביקום (Beecomm)"]),
        ("Beecomm raises $10M", ["ביקום (Beecomm)"]),
        ("טיפים לגלישת סאפ בים", []),
        ("סאפ ישראל מעדכנת את מערכת ה-ERP", ["SAP"]),
    ],
)
def test_ambiguous_aliases(matcher, title, expected):
    m = matcher.analyze(Item(title, "u", "s"))
    assert (m.entities if m else []) == expected


@pytest.mark.parametrize(
    "text,shown",
    [
        ('שפע של "הזדמנויות עסקיות" בטלגרם', False),
        ("השבוע הזה לא נגמר: GitLab משחררת תיקון לחולשה קריטית", False),
        ("מתקפת סייבר גרמה להשבתת שירותים בעיר קולומביה שבדרום קרוליינה", False),
        ("מתקפת סייבר על חברת ביטוח ישראלית", True),
        ("דליפת מידע מהאתר example.co.il", False),  # כתובת בלבד אינה סימן לישראל
        ("Iranian hackers target Israeli logistics firm", True),
        ("פריצה למערכות של שופרסל", True),  # חברה מהרשימה - תמיד מוצג
    ],
)
def test_cyber_channel_israel_filter(matcher, text, shown):
    item = Item(text, "u", "ערוץ", include_unmatched="israel")
    assert (matcher.analyze(item) is not None) is shown


def test_compile_term_punctuation_edges():
    assert compile_term(".co.il").search("shufersal.co.il")
    assert compile_term('צה"ל').search('לפי צה"ל')


def test_channel_footer_does_not_pass_israel_filter(matcher):
    footer = "📢 ערוץ חדשות הסייבר של ישראל<br>לאתר: <a href='https://cybersecurityil.co.il'>cybersecurityil.co.il</a>"
    posts = [
        "חברת Quest Diagnostics מדווחת על גישה בלתי מורשית למערכת",
        "קבוצת תקיפה טוענת שפרצה למשרד הכלכלה והתעשייה של כווית.",
        "תוקפים פרצו לרשת של חברת Railway וגנבו מפתחות API",
        "חברת שירותי הענן היפנית Onamae Desktop Cloud השביתה שרתים",
        "מערך הסייבר הלאומי מזהיר מפני מתקפה על חברות ישראליות",
    ]
    html = "".join(
        f'<div class="tgme_widget_message"><div class="tgme_widget_message_text">{p}<br><br>{footer}</div>'
        f'<a class="tgme_widget_message_date" href="https://t.me/ch/{i}"></a></div>'
        for i, p in enumerate(posts)
    )
    items = telegram_channel.parse(html, "ערוץ", include_unmatched="israel")
    assert all("cybersecurityil" not in i.summary for i in items)
    shown = [i.title for i in items if matcher.analyze(i)]
    assert shown == ["מערך הסייבר הלאומי מזהיר מפני מתקפה על חברות ישראליות"]


def test_code_watcher(tmp_path):
    from news_monitor.server import CodeWatcher, code_signature

    pkg = tmp_path / "pkg"
    pkg.mkdir()
    (pkg / "a.py").write_text("x = 1")
    before = code_signature(pkg)
    (pkg / "a.py").write_text("x = 2")
    assert code_signature(pkg) != before

    class Ctrl:
        running = False

    sig = {"v": "1"}
    watcher = CodeWatcher(Ctrl(), signature=lambda: sig["v"])
    assert watcher.should_restart() is False
    sig["v"] = "2"
    Ctrl.running = True
    assert watcher.should_restart() is False  # לא באמצע סריקה
    Ctrl.running = False
    assert watcher.should_restart() is True
