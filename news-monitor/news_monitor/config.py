from __future__ import annotations

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
