"""שמירת ידיעות ב-SQLite ומניעת כפילויות בין סריקות ובין מקורות."""

from __future__ import annotations

import hashlib
import json
import re
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from .models import Item, Match

_SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
    id         TEXT PRIMARY KEY,
    title_key  TEXT NOT NULL,
    title      TEXT NOT NULL,
    url        TEXT NOT NULL,
    source     TEXT NOT NULL,
    published  TEXT,
    first_seen TEXT NOT NULL,
    entities   TEXT NOT NULL,
    groups_    TEXT NOT NULL,
    tags       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_items_title_key ON items(title_key);
CREATE INDEX IF NOT EXISTS idx_items_first_seen ON items(first_seen);
CREATE TABLE IF NOT EXISTS links (
    item_id TEXT NOT NULL,
    url     TEXT NOT NULL,
    source  TEXT NOT NULL,
    PRIMARY KEY (item_id, source)
);
"""


def normalize_url(url: str) -> str:
    parts = urlsplit(url.strip())
    query = [(k, v) for k, v in parse_qsl(parts.query) if not k.lower().startswith(("utm_", "fbclid", "gclid"))]
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip("/"), urlencode(query), ""))


def title_key(title: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", title.lower())).strip()


def item_id(url: str) -> str:
    return hashlib.sha1(normalize_url(url).encode("utf-8")).hexdigest()


@dataclass
class StoredItem:
    id: str
    title: str
    url: str
    source: str
    published: datetime | None
    first_seen: datetime
    entities: list[str]
    groups: list[str]
    tags: list[str]
    # מקורות נוספים שפרסמו את אותה ידיעה: [(שם המקור, קישור)]
    extra_links: list[tuple[str, str]] = field(default_factory=list)

    @property
    def when(self) -> datetime:
        return self.published or self.first_seen


class Store:
    def __init__(self, path: str):
        self.db = sqlite3.connect(path)
        self.db.executescript(_SCHEMA)

    def close(self) -> None:
        self.db.close()

    def find(self, item: Item, dedupe_days: int = 7, now: datetime | None = None) -> str | None:
        """מחזיר את המזהה של ידיעה קיימת זהה (לפי קישור או כותרת), אם יש."""
        now = now or datetime.now().astimezone()
        since = (now - timedelta(days=dedupe_days)).isoformat()
        row = self.db.execute(
            "SELECT id FROM items WHERE id = ? OR (title_key = ? AND first_seen >= ?) LIMIT 1",
            (item_id(item.url), title_key(item.title), since),
        ).fetchone()
        return row[0] if row else None

    def add_link(self, existing_id: str, item: Item) -> bool:
        """מוסיף מקור נוסף לידיעה קיימת. לא מוסיף את המקור הראשי או מקור שכבר קיים."""
        if item_id(item.url) == existing_id:
            return False
        row = self.db.execute("SELECT source FROM items WHERE id = ?", (existing_id,)).fetchone()
        if row is None or row[0] == item.source:
            return False
        cur = self.db.execute(
            "INSERT OR IGNORE INTO links (item_id, url, source) VALUES (?, ?, ?)",
            (existing_id, item.url, item.source),
        )
        self.db.commit()
        return cur.rowcount > 0

    def add(self, item: Item, match: Match, now: datetime) -> StoredItem:
        stored = StoredItem(
            id=item_id(item.url),
            title=item.title,
            url=item.url,
            source=item.source,
            published=item.published,
            first_seen=now,
            entities=match.entities,
            groups=match.groups,
            tags=match.tags,
        )
        self.db.execute(
            "INSERT OR IGNORE INTO items (id, title_key, title, url, source, published, first_seen,"
            " entities, groups_, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                stored.id,
                title_key(item.title),
                item.title,
                item.url,
                item.source,
                item.published.isoformat() if item.published else None,
                now.isoformat(),
                json.dumps(match.entities, ensure_ascii=False),
                json.dumps(match.groups),
                json.dumps(match.tags),
            ),
        )
        self.db.commit()
        return stored

    def recent(self, days: int, now: datetime | None = None) -> list[StoredItem]:
        now = now or datetime.now().astimezone()
        since = (now - timedelta(days=days)).isoformat()
        items = self._query("WHERE first_seen >= ?", (since,))
        return sorted(items, key=lambda s: s.when, reverse=True)

    def _query(self, where: str, params: tuple = ()) -> list[StoredItem]:
        rows = self.db.execute(
            "SELECT id, title, url, source, published, first_seen, entities, groups_, tags FROM items " + where,
            params,
        ).fetchall()
        links: dict[str, list[tuple[str, str]]] = {}
        if rows:
            marks = ",".join("?" * len(rows))
            for iid, url, source in self.db.execute(
                f"SELECT item_id, url, source FROM links WHERE item_id IN ({marks}) ORDER BY rowid",
                [r[0] for r in rows],
            ):
                links.setdefault(iid, []).append((source, url))
        return [
            StoredItem(
                id=r[0],
                title=r[1],
                url=r[2],
                source=r[3],
                published=datetime.fromisoformat(r[4]) if r[4] else None,
                first_seen=datetime.fromisoformat(r[5]),
                entities=json.loads(r[6]),
                groups=json.loads(r[7]),
                tags=json.loads(r[8]),
                extra_links=links.get(r[0], []),
            )
            for r in rows
        ]
