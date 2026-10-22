from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import yaml

BASE_DIR = Path(__file__).resolve().parent.parent


@dataclass
class Paths:
    base: Path
    db: Path
    report: Path
    status: Path
    lock: Path
    logs: Path


def load_config(path: Path | None = None) -> dict:
    path = path or BASE_DIR / "config.yaml"
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_secrets(path: Path | None = None) -> dict:
    """טוקן ו-chat_id של הבוט: מ-secrets.yaml או ממשתני סביבה."""
    path = path or BASE_DIR / "secrets.yaml"
    secrets: dict = {}
    if path.exists():
        with open(path, encoding="utf-8") as f:
            secrets = yaml.safe_load(f) or {}
    tg = secrets.setdefault("telegram", {}) or {}
    secrets["telegram"] = tg
    tg["bot_token"] = os.environ.get("NEWS_MONITOR_TG_TOKEN") or tg.get("bot_token") or ""
    tg["chat_id"] = os.environ.get("NEWS_MONITOR_TG_CHAT_ID") or tg.get("chat_id") or ""
    return secrets


def paths(config: dict, base: Path = BASE_DIR) -> Paths:
    data = base / "data"
    return Paths(
        base=base,
        db=data / "news.db",
        report=base / config["report"]["path"],
        status=data / "status.json",
        lock=data / "run.lock",
        logs=base / "logs",
    )
