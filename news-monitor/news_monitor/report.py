"""יצירת דוח HTML מקומי (עברית, RTL) עם כל הכותרות מהימים האחרונים."""

from __future__ import annotations

import html
import json
from datetime import datetime
from pathlib import Path

from .store import StoredItem

WEEKDAYS = ["שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"]

_CSS = """
:root{--bg:#f6f7f9;--card:#fff;--text:#1d2330;--muted:#667085;--line:#e4e7ec;--accent:#1f5eff;
--new:#12b76a;--cyber:#d92d20;--deal:#b54708;--chip:#eef2ff}
@media (prefers-color-scheme:dark){:root{--bg:#0f1218;--card:#171b23;--text:#e6e9ef;--muted:#98a2b3;
--line:#2a303c;--accent:#7aa2ff;--chip:#1e2533}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 "Segoe UI",Arial,sans-serif}
header{position:sticky;top:0;background:var(--card);border-bottom:1px solid var(--line);padding:14px 20px;z-index:2}
h1{margin:0 0 4px;font-size:20px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
#refresh{border:0;background:var(--accent);color:#fff;border-radius:8px;padding:7px 14px;cursor:pointer;
font:inherit;font-size:14px;font-weight:600;white-space:nowrap}
#refresh:disabled{opacity:.7;cursor:wait}
#refresh-note{color:var(--muted);font-size:12.5px;margin-top:4px;text-align:left}
.meta{color:var(--muted);font-size:13px}
.warn{color:var(--cyber);font-size:13px;margin-top:4px}
details.sources{font-size:12.5px;color:var(--muted);margin-top:4px}
details.sources summary{cursor:pointer}
details.sources ul{margin:6px 0;padding-inline-start:18px;columns:2;column-gap:24px}
details.sources li{break-inside:avoid}
details.sources .bad{color:var(--cyber)}
.filters{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;align-items:center}
.filters button{border:1px solid var(--line);background:var(--chip);color:var(--text);border-radius:999px;
padding:4px 12px;cursor:pointer;font:inherit;font-size:13px}
.filters button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.filters input{flex:1;min-width:160px;border:1px solid var(--line);background:var(--bg);color:var(--text);
border-radius:8px;padding:5px 10px;font:inherit}
main{max-width:980px;margin:0 auto;padding:12px 16px 40px}
h2{font-size:15px;color:var(--muted);margin:22px 0 8px;border-bottom:1px solid var(--line);padding-bottom:4px}
.item{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:6px 0}
.item a{color:var(--text);text-decoration:none;font-weight:600}
.item a:hover{color:var(--accent);text-decoration:underline}
.sub{color:var(--muted);font-size:12.5px;margin-top:3px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}
.badge{display:inline-block;border-radius:6px;padding:0 7px;font-size:12px;font-weight:600;background:var(--chip)}
.badge.new{background:var(--new);color:#fff}
.badge.cyber{background:var(--cyber);color:#fff}
.badge.deal{background:var(--deal);color:#fff}
.more{font-size:12.5px;margin-top:3px;color:var(--muted)}
.more a{font-weight:400;color:var(--accent)}
.empty{color:var(--muted);text-align:center;padding:40px}
"""

_JS = """
const state={group:'all',tag:'all',q:''};
function apply(){let shown=0;document.querySelectorAll('.item').forEach(el=>{
 const g=el.dataset.groups.split(' '),t=el.dataset.tags.split(' ');
 const ok=(state.group==='all'||g.includes(state.group))&&(state.tag==='all'||t.includes(state.tag)||
  (state.tag==='new'&&el.dataset.new==='1'))&&(!state.q||el.textContent.toLowerCase().includes(state.q));
 el.hidden=!ok;if(ok)shown++;});
 document.querySelectorAll('h2').forEach(h=>{let n=h.nextElementSibling,any=false;
  while(n&&n.tagName!=='H2'){if(n.classList.contains('item')&&!n.hidden)any=true;n=n.nextElementSibling;}h.hidden=!any;});
 document.getElementById('count').textContent=shown;}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{const k=b.dataset.filter;
 state[k]=b.dataset.value;document.querySelectorAll(`[data-filter=${k}]`).forEach(x=>x.classList.toggle('on',x===b));apply();});
document.getElementById('q').oninput=e=>{state.q=e.target.value.trim().toLowerCase();apply();};
apply();

const btn=document.getElementById('refresh'),note=document.getElementById('refresh-note');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function busy(){btn.disabled=true;btn.textContent='⏳ סורק...';note.textContent='הסריקה לוקחת בדרך כלל פחות מדקה';}
async function waitDone(){
 for(;;){await sleep(2000);
  try{const s=await (await fetch('/api/status',{cache:'no-store'})).json();
   if(!s.running){location.reload();return;}}
  catch(e){btn.disabled=false;btn.textContent='🔄 רענן עכשיו';note.textContent='השרת המקומי לא מגיב';return;}}}
btn.onclick=async()=>{
 if(location.protocol==='file:'){
  note.textContent='לסריקה מיידית פתח את הדוח דרך scripts\\\\open_report.bat (או הרץ run_now.bat)';return;}
 busy();
 try{const r=await fetch('/api/refresh',{method:'POST',headers:{'X-Requested-With':'news-monitor'}});
  if(r.status!==202&&r.status!==409)throw new Error(r.status);
  waitDone();}
 catch(e){btn.disabled=false;btn.textContent='🔄 רענן עכשיו';note.textContent='לא ניתן להפעיל סריקה: '+e.message;}};
if(location.protocol!=='file:'){fetch('/api/status',{cache:'no-store'}).then(r=>r.json())
 .then(s=>{if(s.running){busy();waitDone();}else if(s.message)note.textContent=s.message;}).catch(()=>{});}
"""


def _local(dt: datetime) -> datetime:
    return dt.astimezone()


def _day_label(d: datetime) -> str:
    return f"יום {WEEKDAYS[d.weekday()]}, {d:%d/%m/%Y}"


def render(
    items: list[StoredItem],
    group_labels: dict[str, str],
    tag_labels: dict[str, str],
    generated_at: datetime,
    run_started: datetime | None = None,
    failed_sources: list[str] | None = None,
    sources: dict[str, int | str] | None = None,
) -> str:
    esc = html.escape
    buttons = ['<button class="on" data-filter="group" data-value="all">הכל</button>']
    buttons += [
        f'<button data-filter="group" data-value="{esc(k)}">{esc(v)}</button>' for k, v in group_labels.items()
    ]
    buttons.append('<span style="width:10px"></span>')
    buttons.append('<button class="on" data-filter="tag" data-value="all">כל הסוגים</button>')
    buttons.append('<button data-filter="tag" data-value="new">חדש בסריקה האחרונה</button>')
    buttons += [f'<button data-filter="tag" data-value="{esc(k)}">{esc(v)}</button>' for k, v in tag_labels.items()]

    body: list[str] = []
    current_day = None
    for it in items:
        when = _local(it.when)
        if when.date() != current_day:
            current_day = when.date()
            body.append(f"<h2>{esc(_day_label(when))}</h2>")
        is_new = run_started is not None and it.first_seen >= run_started
        badges = []
        if is_new:
            badges.append('<span class="badge new">חדש</span>')
        badges += [f'<span class="badge {esc(t)}">{esc(tag_labels.get(t, t))}</span>' for t in it.tags]
        labels = [group_labels.get(g, g) for g in it.groups]
        sub = [f"{when:%H:%M}", esc(it.source)]
        if it.entities:
            sub.append("🏢 " + esc(", ".join(it.entities)))
        else:
            sub.append(esc(", ".join(labels)))
        more = ""
        if it.extra_links:
            links = " · ".join(
                f'<a href="{esc(url, quote=True)}" target="_blank" rel="noopener">{esc(source)}</a>'
                for source, url in it.extra_links
            )
            more = f'<div class="more">🔗 גם ב: {links}</div>'
        body.append(
            f'<div class="item" data-groups="{esc(" ".join(it.groups))}" data-tags="{esc(" ".join(it.tags))}"'
            f' data-new="{1 if is_new else 0}">'
            f'<a href="{esc(it.url, quote=True)}" target="_blank" rel="noopener">{esc(it.title)}</a>'
            f'<div class="sub">{"".join(badges)}<span>{" · ".join(sub)}</span></div>{more}</div>'
        )
    if not items:
        body.append('<div class="empty">אין עדיין ידיעות. הדוח יתעדכן בסריקה הבאה.</div>')

    warn = ""
    if failed_sources:
        google = [s for s in failed_sources if s.startswith("Google News")]
        names = [s for s in failed_sources if not s.startswith("Google News")]
        if google:
            names.insert(0, f"Google News ({len(google)} חיפושים)" if len(google) > 1 else google[0])
        warn = f'<div class="warn">⚠ מקורות שנכשלו בסריקה האחרונה: {esc(", ".join(names))}</div>'
    if sources:
        # ערך מספרי = כמות פריטים שהתקבלו; מחרוזת = הודעת שגיאה
        ok = sum(1 for v in sources.values() if isinstance(v, int))
        rows = "".join(
            f"<li>✓ {esc(name)}: {value} פריטים</li>" if isinstance(value, int)
            else f'<li class="bad">✗ {esc(name)}: {esc(str(value))}</li>'
            for name, value in sources.items()
        )
        warn += (f'<details class="sources"><summary>מצב מקורות: {ok} מתוך {len(sources)} תקינים</summary>'
                 f"<ul>{rows}</ul></details>")

    return f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="900">
<title>ניטור חדשות</title>
<style>{_CSS}</style>
</head>
<body>
<header>
<div class="top">
<div>
<h1>ניטור חדשות - ERP, קופות וקמעונאות</h1>
<div class="meta">עודכן: {generated_at.astimezone():%d/%m/%Y %H:%M} · מוצגות <span id="count">{len(items)}</span> ידיעות</div>
</div>
<div><button id="refresh" type="button">🔄 רענן עכשיו</button><div id="refresh-note"></div></div>
</div>
{warn}
<div class="filters">{"".join(buttons)}<input id="q" type="search" placeholder="חיפוש..."></div>
</header>
<main>
{chr(10).join(body)}
</main>
<script>{_JS}</script>
</body>
</html>
"""


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(content, encoding="utf-8")
    tmp.replace(path)


def write_status(path: Path, status: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(status, ensure_ascii=False, indent=2), encoding="utf-8")
