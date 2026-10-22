from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Item:
    """ידיעה גולמית שנאספה ממקור כלשהו."""

    title: str
    url: str
    source: str
    published: datetime | None = None
    # טקסט נוסף לזיהוי חברות (תקציר RSS, גוף פוסט בטלגרם, אתר של קורבן כופרה)
    summary: str = ""
    # האם להציג את הידיעה גם אם לא זוהתה בה חברה מהרשימה ("סייבר כללי")
    include_unmatched: bool = False


@dataclass
class Match:
    """תוצאת ניתוח של ידיעה: אילו חברות זוהו ובאילו קבוצות/תגיות."""

    entities: list[str] = field(default_factory=list)
    groups: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
