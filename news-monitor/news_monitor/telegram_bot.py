"""שליחת הכותרות החדשות לבוט טלגרם פרטי (Bot API)."""

from __future__ import annotations

import html
import logging

import requests

from .store import StoredItem

log = logging.getLogger(__name__)

API = "https://api.telegram.org/bot{token}/{method}"
MAX_LEN = 3800  # מגבלת טלגרם היא 4096 תווים להודעה


def _api(token: str, method: str, timeout: int = 20, **params) -> dict:
    resp = requests.post(API.format(token=token, method=method), json=params, timeout=timeout)
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram API: {data.get('description', resp.status_code)}")
    return data["result"]


def format_item(item: StoredItem, tag_labels: dict[str, str]) -> str:
    tags = " ".join(f"#{tag_labels.get(t, t).replace(' ', '_').replace('/', '')}" for t in item.tags)
    who = ", ".join(item.entities)
    meta = " | ".join(x for x in (who, item.source) if x)
    return (
        f'• <a href="{html.escape(item.url, quote=True)}">{html.escape(item.title)}</a>\n'
        f"  <i>{html.escape(meta)}</i>{(' ' + html.escape(tags)) if tags else ''}"
    )


def build_messages(
    items: list[StoredItem], group_labels: dict[str, str], tag_labels: dict[str, str]
) -> list[str]:
    """מחלק את הכותרות להודעות לפי קבוצה, בלי לחרוג ממגבלת האורך."""
    blocks: list[str] = []
    for group_key, label in group_labels.items():
        in_group = [i for i in items if group_key in i.groups]
        if not in_group:
            continue
        blocks.append(f"<b>{html.escape(label)}</b> ({len(in_group)})")
        blocks.extend(format_item(i, tag_labels) for i in in_group)

    header = f"🔔 <b>{len(items)} ידיעות חדשות</b>"
    messages: list[str] = []
    current = header
    for block in blocks:
        if len(current) + len(block) + 2 > MAX_LEN:
            messages.append(current)
            current = block
        else:
            current += "\n\n" + block if block.startswith("<b>") else "\n" + block
    messages.append(current)
    return messages


def send_text(token: str, chat_id: str | int, text: str) -> None:
    _api(token, "sendMessage", chat_id=chat_id, text=text, parse_mode="HTML", disable_web_page_preview=True)


def send_items(
    token: str, chat_id: str | int, items: list[StoredItem], group_labels: dict[str, str], tag_labels: dict[str, str]
) -> None:
    for msg in build_messages(items, group_labels, tag_labels):
        send_text(token, chat_id, msg)


def list_chats(token: str) -> list[tuple[int, str]]:
    """מחזיר את הצ'אטים שכתבו לבוט לאחרונה - לצורך מציאת ה-chat_id."""
    chats: dict[int, str] = {}
    for update in _api(token, "getUpdates"):
        msg = update.get("message") or update.get("channel_post") or {}
        chat = msg.get("chat")
        if chat:
            name = chat.get("title") or " ".join(x for x in (chat.get("first_name"), chat.get("last_name")) if x)
            chats[chat["id"]] = name or chat.get("username", "")
    return list(chats.items())
