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
    term = term.strip()
    if _is_hebrew(term):
        before, after = rf"(?<!\w){_HEB_PREFIX}", r"(?!\w)"
    else:
        # כינוי לועזי: גבול מבחינת אותיות לטיניות/ספרות בלבד, כך ש"ב-SAP" ו"בSAP" יזוהו
        before, after = r"(?<![A-Za-z0-9])", r"(?![A-Za-z0-9])"
    # מונח שמתחיל או נגמר בסימן (למשל ".co.il") לא צריך גבול מילה באותו צד
    if not (term[0].isalnum() or term[0] == "_"):
        before = ""
    if not (term[-1].isalnum() or term[-1] == "_"):
        after = ""
    return re.compile(before + body + after, re.IGNORECASE)


def alias_term(alias: str | dict) -> str:
    """כינוי הוא מחרוזת, או {term: ..., require_context: true} לכינוי שהוא גם מילה רגילה."""
    return alias["term"] if isinstance(alias, dict) else alias


@dataclass
class _Entity:
    name: str
    group: str
    # (ביטוי, האם נדרשת מילת הקשר כדי שהכינוי ייספר)
    patterns: list[tuple[re.Pattern[str], bool]]


class Matcher:
    def __init__(self, config: dict):
        self.group_labels: dict[str, str] = {}
        self.entities: list[_Entity] = []
        for group_key, group in config["groups"].items():
            self.group_labels[group_key] = group["label"]
            for ent in group["entities"]:
                entity_context = bool(ent.get("require_context", False))
                patterns = []
                for alias in ent["aliases"]:
                    needs_context = entity_context or (isinstance(alias, dict) and alias.get("require_context", False))
                    patterns.append((compile_term(alias_term(alias)), bool(needs_context)))
                self.entities.append(_Entity(name=ent["name"], group=group_key, patterns=patterns))
        self.group_labels[GENERAL_CYBER_GROUP] = "סייבר כללי"
        self.context = [compile_term(w) for w in config.get("context_words", [])]
        self.israel = [compile_term(w) for w in config.get("israel_words", [])]
        self.tag_labels: dict[str, str] = {}
        self.tags: dict[str, list[re.Pattern[str]]] = {}
        for tag_key, tag in config.get("tags", {}).items():
            self.tag_labels[tag_key] = tag["label"]
            self.tags[tag_key] = [compile_term(k) for k in tag["keywords"]]

    def find_entities(self, text: str) -> list[_Entity]:
        has_context: bool | None = None
        found = []
        for ent in self.entities:
            for pattern, needs_context in ent.patterns:
                if not pattern.search(text):
                    continue
                if needs_context:
                    if has_context is None:
                        has_context = any(p.search(text) for p in self.context)
                    if not has_context:
                        continue
                found.append(ent)
                break
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
        if item.include_unmatched == "israel" and not any(p.search(text) for p in self.israel):
            return None  # מקור סייבר כללי: רק ידיעות שקשורות לישראל
        if item.include_unmatched:
            return Match(entities=[], groups=[GENERAL_CYBER_GROUP], tags=tags)
        return None
