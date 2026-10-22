"""זיהוי חברות ומילות מפתח בטקסט עברי/אנגלי.

בעברית מילים מקבלות תחיליות (ו, ב, ל, ה, מ, ש, כ) ולפעמים מקף: "בשופרסל", "ל-SAP".
לכן כל כינוי מורכב לביטוי רגולרי שמתיר עד שלוש תחיליות לפניו ודורש גבול מילה אחריו.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .models import Item, Match

GENERAL_CYBER_GROUP = "cyber_general"

_HEB_PREFIX = r"(?:[ובלהמשכ]{1,3}[-־\"']?)?"
_HEBREW = re.compile(r"[֐-׿]")


def _is_hebrew(text: str) -> bool:
    return bool(_HEBREW.search(text))


def compile_term(term: str) -> re.Pattern[str]:
    """מחזיר ביטוי רגולרי לזיהוי מונח, כולל תחיליות עבריות."""
    body = re.escape(term.strip()).replace(r"\ ", r"\s+")
    # כינוי קצר באותיות גדולות בלבד (SAP, NCR, KSP) - רגיש לאותיות גדולות כדי לא לתפוס "sap"
    case_sensitive = term.isascii() and term.upper() == term and len(term) <= 6
    flags = 0 if case_sensitive else re.IGNORECASE
    if _is_hebrew(term):
        pattern = rf"(?<!\w){_HEB_PREFIX}{body}(?!\w)"
    else:
        # כינוי לועזי: גבול מבחינת אותיות לטיניות/ספרות בלבד, כך ש"ב-SAP" ו"בSAP" יזוהו
        pattern = rf"(?<![A-Za-z0-9]){body}(?![A-Za-z0-9])"
    return re.compile(pattern, flags)


@dataclass
class _Entity:
    name: str
    group: str
    patterns: list[re.Pattern[str]]
    require_context: bool


class Matcher:
    def __init__(self, config: dict):
        self.group_labels: dict[str, str] = {}
        self.entities: list[_Entity] = []
        for group_key, group in config["groups"].items():
            self.group_labels[group_key] = group["label"]
            for ent in group["entities"]:
                self.entities.append(
                    _Entity(
                        name=ent["name"],
                        group=group_key,
                        patterns=[compile_term(a) for a in ent["aliases"]],
                        require_context=bool(ent.get("require_context", False)),
                    )
                )
        self.group_labels[GENERAL_CYBER_GROUP] = "סייבר כללי"
        self.context = [compile_term(w) for w in config.get("context_words", [])]
        self.tag_labels: dict[str, str] = {}
        self.tags: dict[str, list[re.Pattern[str]]] = {}
        for tag_key, tag in config.get("tags", {}).items():
            self.tag_labels[tag_key] = tag["label"]
            self.tags[tag_key] = [compile_term(k) for k in tag["keywords"]]

    def find_entities(self, text: str) -> list[_Entity]:
        has_context: bool | None = None
        found = []
        for ent in self.entities:
            if not any(p.search(text) for p in ent.patterns):
                continue
            if ent.require_context:
                if has_context is None:
                    has_context = any(p.search(text) for p in self.context)
                if not has_context:
                    continue
            found.append(ent)
        return found

    def find_tags(self, text: str) -> list[str]:
        return [key for key, pats in self.tags.items() if any(p.search(text) for p in pats)]

    def analyze(self, item: Item) -> Match | None:
        """מחזיר Match אם הידיעה רלוונטית, אחרת None."""
        text = f"{item.title}\n{item.summary}"
        entities = self.find_entities(text)
        tags = self.find_tags(text)
        # include_unmatched מסמן מקור ייעודי לסייבר - כל ידיעה ממנו מתויגת כסייבר
        if item.include_unmatched and "cyber" not in tags:
            tags.insert(0, "cyber")
        if entities:
            groups = sorted({e.group for e in entities}, key=list(self.group_labels).index)
            return Match(entities=[e.name for e in entities], groups=groups, tags=tags)
        if item.include_unmatched:
            return Match(entities=[], groups=[GENERAL_CYBER_GROUP], tags=tags)
        return None
