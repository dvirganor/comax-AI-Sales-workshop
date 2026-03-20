import React, { useState, useEffect } from "react";

var GOLD = "#E8B931";
var DARK = "#0f0f1a";
var PASSWORD = "dvir1971";
var SUPA_URL = "https://qoswnccfcpzrzesdhuky.supabase.co";
var SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc3duY2NmY3B6cnplc2RodWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTMyMTcsImV4cCI6MjA4OTU4OTIxN30.MziqUUUzfInwgojcRyqqZgsKSt1a0MZ1uHUSqXf-lus";

/* ===== SUPABASE HELPERS ===== */
function supaFetch(method, body) {
  var opts = {
    method: method,
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": "Bearer " + SUPA_KEY,
      "Content-Type": "application/json",
      "Prefer": method === "PATCH" ? "return=representation" : "return=representation"
    }
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(SUPA_URL + "/rest/v1/workshop_state?id=eq.current", opts).then(function(r) { return r.json(); });
}

function getState() {
  return supaFetch("GET");
}

function setState(sessionId, slideIndex) {
  return supaFetch("PATCH", { session_id: sessionId, slide_index: slideIndex, updated_at: new Date().toISOString() });
}

/* ===== HELPER COMPONENTS ===== */
function Txt(props) {
  return React.createElement("div", {
    style: { fontSize: props.size || 16, fontWeight: props.bold ? 700 : 400, color: props.color || "#fff", textAlign: props.center ? "center" : "right", direction: "rtl", lineHeight: 1.7, whiteSpace: "pre-line" }
  }, props.children);
}

function CenterSlide(props) {
  return React.createElement("div", {
    style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: props.gap || 20 }
  }, props.children);
}

function Slide(props) {
  return React.createElement("div", {
    style: { display: "flex", flexDirection: "column", height: "100%", direction: "rtl", gap: props.gap || 0 }
  }, props.children);
}

function GoldBox(props) {
  return React.createElement("div", {
    style: { background: props.bg || "rgba(232,185,49,0.08)", border: "1px solid " + (props.border || "rgba(232,185,49,0.2)"), borderRadius: 14, padding: props.pad || 18 }
  }, props.children);
}

function Badge() { return React.createElement("div", { style: { fontSize: 18, color: GOLD, letterSpacing: 3, fontWeight: 700 } }, "COMAX × AI"); }
function Divider() { return React.createElement("div", { style: { width: 80, height: 4, background: "linear-gradient(90deg," + GOLD + ",#F7D060)", borderRadius: 2 } }); }

/* ===== SLIDE BUILDERS ===== */
function titleSlide(num, title, sub) {
  return React.createElement(CenterSlide, { gap: 20 },
    React.createElement(Badge), React.createElement(Txt, { size: 40, bold: true, center: true }, "סדנת AI למכירות שטח"), React.createElement(Divider),
    React.createElement(Txt, { size: 22, color: "#ccc", center: true }, "מפגש " + num + " מתוך 5"),
    React.createElement(Txt, { size: 28, color: GOLD, bold: true, center: true }, title),
    React.createElement(Txt, { size: 14, color: "#999", center: true }, sub));
}
function closingSlide(next, emoji, footer) {
  return React.createElement(CenterSlide, { gap: 24 },
    React.createElement(Badge), React.createElement(Txt, { size: 32, bold: true, center: true }, "נתראה בשבוע הבא!"), React.createElement(Divider),
    React.createElement(Txt, { size: 20, color: "#ccc", center: true }, next),
    React.createElement("div", { style: { fontSize: 48, marginTop: 16 } }, emoji),
    React.createElement(Txt, { size: 14, color: "#666", center: true }, footer));
}
function breakSlide(text) {
  return React.createElement(CenterSlide, { gap: 24 },
    React.createElement("div", { style: { fontSize: 72 } }, "☕"),
    React.createElement(Txt, { size: 32, bold: true, color: GOLD, center: true }, "הפסקה – 10 דקות"),
    React.createElement(Txt, { size: 18, color: "#aaa", center: true }, text));
}
function quoteSlide(html, footer) {
  return React.createElement(CenterSlide, { gap: 28 },
    React.createElement(Txt, { size: 48, color: "rgba(232,185,49,0.3)", center: true }, '"'),
    React.createElement("div", { style: { fontSize: 26, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.6, maxWidth: 550 }, dangerouslySetInnerHTML: { __html: html } }),
    React.createElement(Txt, { size: 48, color: "rgba(232,185,49,0.3)", center: true }, '"'),
    React.createElement(Txt, { size: 14, color: "#888", center: true }, footer));
}
function codeSlide(title, code, footer) {
  return React.createElement(Slide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD }, title),
    React.createElement("div", { style: { background: "#1a1a2e", borderRadius: 14, padding: 20, flex: 1, fontFamily: "monospace", border: "1px solid #333", marginTop: 12, overflow: "auto" } },
      React.createElement(Txt, { size: 14, color: GOLD }, "PROMPT:"),
      React.createElement(Txt, { size: 14, color: "#ddd" }, code)),
    footer ? React.createElement(Txt, { size: 12, color: "#888", center: true }, footer) : null);
}
function summarySlide(items, hw) {
  return React.createElement(Slide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD }, "🎯 מה לוקחים הביתה?"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, margin: "14px 0" } },
      items.map(function(x, i) {
        return React.createElement("div", { key: i, style: { display: "flex", gap: 12, alignItems: "center", background: "rgba(232,185,49,0.06)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(232,185,49,0.15)" } },
          React.createElement("div", { style: { fontSize: 22 } }, x[0]),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement(Txt, { size: 14, bold: true }, x[1]),
            React.createElement(Txt, { size: 12, color: "#aaa" }, x[2])));
      })),
    React.createElement("div", { style: { background: "linear-gradient(135deg," + GOLD + ",#F7D060)", borderRadius: 14, padding: 16 } },
      React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#1a1a2e", textAlign: "right", direction: "rtl" } }, "📌 משימה:"),
      React.createElement("div", { style: { fontSize: 14, color: "#1a1a2e", textAlign: "right", direction: "rtl", lineHeight: 1.8 } }, hw)));
}
function twoColSlide(title, lt, li, lc, rt, ri, rc) {
  function col(t, items, clr) {
    return React.createElement("div", { style: { flex: 1, background: clr + "18", border: "1px solid " + clr + "55", borderRadius: 16, padding: 18 } },
      React.createElement(Txt, { size: 18, bold: true, color: clr }, t),
      React.createElement("div", { style: { marginTop: 12 } }, items.map(function(item, i) { return React.createElement(Txt, { key: i, size: 14, color: "#ddd" }, "• " + item); })));
  }
  return React.createElement(Slide, null,
    React.createElement(Txt, { size: 28, bold: true, color: GOLD }, title),
    React.createElement("div", { style: { display: "flex", gap: 20, flex: 1, marginTop: 20 } }, col(lt, li, lc), col(rt, ri, rc)));
}

/* ===== SESSIONS ===== */
var S1 = [
  { c: titleSlide(1, '"AI זה לא מדע בדיוני"', "💡 שבירת חסמים • הדלקת מוטיבציה • הכלי הראשון שלכם"), n: "\"בוקר טוב! הבוס אמר סדנת AI. חלק חשבו 'עוד הרצאה'. היום אף אחד לא ישן – משתמשים ב-AI על לקוחות אמיתיים. בזמן אמת.\n\nואם בסוף לא תגידו 'זה שימושי' – הקפה עליי.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 28, bold: true, color: GOLD }, "מה בתוכנית היום?"),
    React.createElement("div", { style: { marginTop: 16 } },
      [{ t: "15 דק׳", i: "👋", n: "פתיחה", d: "סיבוב שולחן + ציפיות" }, { t: "20 דק׳", i: "🎪", n: "הדגמה חיה", d: "AI פוגש לקוח קשה של Comax" }, { t: "25 דק׳", i: "💪", n: "תרגיל 1", d: "הלקוח שלכם – פרומפט ראשון" }, { t: "10 דק׳", i: "☕", n: "הפסקה", d: "" }, { t: "15 דק׳", i: "🧠", n: "5 כללי זהב", d: "איך לדבר עם AI" }, { t: "20 דק׳", i: "🔥", n: "תרגיל 2", d: "שדרוג פרומפטים – לפני ואחרי" }, { t: "15 דק׳", i: "🎯", n: "סיכום", d: "כלי יומיומי + משימה לשבוע" }].map(function(x, i) {
        return React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 12 } },
          React.createElement("div", { style: { fontSize: 26 } }, x.i),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "#fff", textAlign: "right" } }, x.n),
            React.createElement("div", { style: { fontSize: 13, color: "#aaa", textAlign: "right" } }, x.d)),
          React.createElement("div", { style: { fontSize: 13, color: GOLD, fontWeight: 600 } }, x.t));
      }))), n: "\"הנה התוכנית. שימו לב – אין 'הרצאה משעממת'. יש תרגילים על לקוחות אמיתיים שלכם.\n\nיש מישהו שחוזר מפגישה וחושב 'הייתי צריך להגיד אחרת'? היום ניתן כלי שעושה את זה לפני הפגישה.\"" },
  { c: React.createElement(CenterSlide, null,
    React.createElement("div", { style: { fontSize: 64 } }, "🤔"),
    React.createElement(Txt, { size: 28, bold: true, color: GOLD, center: true }, "סיבוב פתיחה"),
    React.createElement(Txt, { size: 20, color: "#ccc", center: true }, "ספרו בשני משפטים:"),
    React.createElement(GoldBox, null,
      React.createElement(Txt, { size: 20 }, React.createElement("span", { style: { color: GOLD, fontWeight: 700 } }, "1."), " מה אתם חושבים על AI?"),
      React.createElement(Txt, { size: 20 }, React.createElement("span", { style: { color: GOLD, fontWeight: 700 } }, "2."), " מתי הרגשתם \"הלוואי שמישהו עוזר לי\"?")),
    React.createElement(Txt, { size: 14, color: "#888", center: true }, "⏱️ משפט אחד כל אחד – בלי נאומים!")), n: "\"סיבוב מהיר. 30 שניות כל אחד.\n\n[רשמו תשובות מעניינות על הלוח]\n\n'שמעתי סקפטיות, התלהבות, ובלבול. אף אחד לא טועה לגמרי. בואו נראה מה באמת קורה.'\"" },
  { c: twoColSlide("מה AI יכול ומה לא", "✅ AI מעולה ב:", ["לנסח טקסטים ומיילים", "לחקור ענף מזון/אופנה תוך שניות", "רעיונות לגישת מכירה", "תרגול התנגדויות", "לסכם שיחה טלפונית", "לעבוד 24/7 בלי קפה"], "#4CAF50", "❌ AI גרוע ב:", ["לבנות יחסים אישיים", "להרגיש טון בטלפון", "אינטואיציה של סוכן מנוסה", "לקפוץ ללקוח לביקור", "לסגור עסקה בלחיצת יד", "לדעת שדני מרוגז כי ריבו עם אשתו"], "#F44336"), n: "\"AI לא ג'יימס בונד. לא יתקשר ללקוח, לא יקפוץ לביקור.\n\n[ירוק] הוא עושה את ההכנה המשעממת.\n[אדום] ומה הוא לא יכול? בדיוק מה שאתם הכי טובים בו.\n\nAI = הכנה. אתם = קסם. ביחד = בלתי ניתנים לעצירה.\"" },
  { c: quoteSlide("AI לא יחליף סוכן מכירות.<br/><span style='color:" + GOLD + "'>סוכן שמשתמש ב-AI</span><br/>יחליף סוכן שלא.", "(ואל תגידו שלא הזהרנו 😏)"), n: "[5 שניות שקט]\n\n\"קראו. תזכרו. זה לא איום – זה הזדמנות.\n\nועכשיו בואו נראה בפעולה. מי מתנדב?\"" },
  { c: React.createElement(CenterSlide, null,
    React.createElement("div", { style: { fontSize: 64 } }, "🎪"),
    React.createElement(Txt, { size: 32, bold: true, color: GOLD, center: true }, "הדגמה חיה"),
    React.createElement(Txt, { size: 20, color: "#ccc", center: true }, "עכשיו צריך מתנדב אמיץ אחד."),
    React.createElement(GoldBox, null,
      React.createElement(Txt, { size: 18 }, React.createElement("span", { style: { color: GOLD } }, "המשימה:"), " ספרו על הלקוח הכי קשה. שני משפטים."),
      React.createElement(Txt, { size: 18 }, React.createElement("span", { style: { color: GOLD } }, "אני:"), " אכניס ל-AI בזמן אמת."),
      React.createElement(Txt, { size: 18 }, React.createElement("span", { style: { color: GOLD } }, "ביחד:"), " נראה מה יוצא.")),
    React.createElement(Txt, { size: 14, color: "#888", center: true }, "🎤 הביישן ביותר מתנדב ראשון!")), n: "\"צריך מתנדב. מי הלקוח, מה עושה, למה מסובך?\n\n[אם אין:] 'מי שלא מתנדב – AI ימליץ בכל מקרה.'\n\n[כשמתנדב:] 'שני משפטים, כאילו מספר לחבר בקפה.'\n\n[הקלד בזמן אמת על המסך]\"" },
  { c: codeSlide("🖥️ הפרומפט שאני מקליד:", "אתה יועץ מכירות מומחה ERP/POS\nלקמעונאות מזון ואופנה.\n\nלקוח: [מה שהסוכן אמר – למשל: בעל מיניסופר 2 סניפים,\nעובד עם קופה ישנה, מתלונן על חוסר שליטה במלאי]\n\nתן לי:\n1. שלוש שאלות חכמות שיגרמו לו לחשוב מחדש\n2. שני כאבים שכנראה יש לו ולא מודע אליהם\n3. משפט פתיחה – לפגישה פיזית או לשיחת טלפון", "💡 תפקיד → הקשר → משימה ברורה → פורמט"), n: "\"לא 'עזור לי למכור'. תפקיד, הקשר, משימה.\n\n[הרץ, קרא בקול] 'רלוונטי?'\n\n[פרומפט המשך:] 'גישה אחרת – מבוססת סיפור לקוח דומה.'\n\n'ראיתם? אם לא אהבתם – בקשו אחרת. AI לא נעלב.'\"" },
  { c: codeSlide("💪 תרגיל: הלקוח שלכם", "אני סוכן/ת מכירות של Comax – מערכות ERP וקופות POS\nלקמעונאות מזון ואופנה.\n\nהלקוח שלי: [תאר בשני משפטים – סוג חנות, גודל, מצב]\nהאתגר: [מה קשה? לא עונה / אומר יקר / יש מתחרה]\n\nעזור לי עם:\n1. שלוש שאלות פתיחה (לפגישה או לשיחת טלפון)\n2. שתי נקודות כאב שהוא לא מודע אליהן\n3. הצעה לאיך לפתוח את השיחה הבאה", "5 דק׳ כתבו → 10 דק׳ בזוגות → 10 דק׳ שיתוף"), n: "\"תוציאו טלפונים – רשות רשמית!\n\nגם מי שעובד בטלפון – כתבו על לקוח שמתכננים להתקשר אליו.\n\n[5 דק׳] 'אל תחפשו מושלם – תכתבו ותראו.'\n[10 דק׳ זוגות] 'תראו לשכן, פידבק.'\n[10 דק׳] 'מי קיבל משהו מפתיע?'\"" },
  { c: breakSlide("קפה, שירותים, ולבדוק אם AI עונה בלי Wi-Fi (ספוילר: לא)"), n: "\"הפסקה! ואם רוצים להתמכר – תנסו עוד פרומפט.\"" },
  { c: React.createElement(CenterSlide, null,
    React.createElement("div", { style: { fontSize: 64 } }, "🏆"),
    React.createElement(Txt, { size: 32, bold: true, color: GOLD, center: true }, "5 כללי הזהב של פרומפט טוב"),
    React.createElement(Txt, { size: 18, color: "#aaa", center: true }, "(\"איך לדבר עם AI בלי להרגיש שמדברים עם קיר\")")), n: "\"למה חלק קיבלו תשובות מעולות? כמו פגישת מכירה: מוכן = סוגר.\n\n5 כללים. פשוטים. בואו.\"" },
  { c: twoColSlide("5 כללי הזהב", "✅ עשו:", ["1️⃣ תנו תפקיד – 'אתה מומחה POS'", "2️⃣ הקשר – 'רשת ביגוד, 3 סניפים'", "3️⃣ משימה ברורה – '3 שאלות פתיחה'", "4️⃣ פורמט – 'כהודעת WhatsApp'", "5️⃣ חזרו ושפרו – 'יותר ישיר'"], "#4CAF50", "❌ אל תעשו:", ["'עזור לי למכור'", "'יש לי לקוח'", "'עזור לי עם הפגישה'", "'תכתוב משהו'", "לקחת תשובה ראשונה כאילו אין מחר"], "#F44336"), n: "\"5 כללים:\n\n1. תפקיד – 'אתה מומחה POS עם 15 שנות ניסיון'\n2. הקשר – 'רשת 5 חנויות אופנה, אקסלים'\n3. משימה – '3 שאלות פתיחה שלא נשמעות מכירתיות'\n4. פורמט – 'כהודעת WhatsApp קצרה'\n5. שפרו – 'יותר ישיר', 'קצר', 'גישה הפוכה'\n\nAI לא נעלב – תנסו את זה עם השותף...\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD }, "🔥 תרגיל: שדרגו את הפרומפט"),
    React.createElement("div", { style: { background: "rgba(244,67,54,0.1)", borderRadius: 14, padding: 18, margin: "14px 0", border: "1px solid rgba(244,67,54,0.3)" } },
      React.createElement(Txt, { size: 14, color: "#F44336", bold: true }, "❌ הפרומפט הגרוע:"),
      React.createElement(Txt, { size: 20, color: "#ddd" }, "\"תכתוב לי מייל ללקוח\"")),
    React.createElement(Txt, { size: 16, color: GOLD }, "⬇️ עכשיו נוסיף ביחד: תפקיד, הקשר, משימה, פורמט..."),
    React.createElement("div", { style: { background: "rgba(76,175,80,0.1)", borderRadius: 14, padding: 18, border: "1px solid rgba(76,175,80,0.3)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12 } },
      React.createElement(Txt, { size: 18, color: "#4CAF50", center: true }, "✅ הפרומפט המשודרג נכתב ביחד, בזמן אמת!")),
    React.createElement(Txt, { size: 13, color: "#888", center: true }, "אחרי: כל אחד משדרג את הפרומפט שלו מתרגיל 1")), n: "\"'תכתוב לי מייל ללקוח' – למה גרוע? [חכו לקהל]\n\nאין תפקיד, אין הקשר, אין משימה, אין פורמט.\n\nבואו נתקן ביחד. [בנו בזמן אמת עם הקהל]\n\n'ראיתם? 30 שניות נוספות – תוצאה שונה לחלוטין.'\n\nעכשיו – שדרגו את הפרומפט מתרגיל 1 לפי 5 הכללים. 5 דקות.\"" },
  { c: twoColSlide("📊 לפני ואחרי", "😰 בלי AI:", ["הכנה? איזו הכנה?", "נכנס 'ברגשת בטן'", "חוזר ונזכר מה היה צריך להגיד", "שוכח לבדוק את הענף", "לא מכיר התנגדויות מראש", "פולו-אפ אחרי 3 ימים (אם בכלל)"], "#F44336", "🚀 עם AI:", ["5 דקות הכנה = הכנה מלאה", "נכנס עם שאלות חכמות", "יודע כאבים לפני שהלקוח מספר", "מדבר בשפה של הענף", "מוכן להתנגדויות", "פולו-אפ באותו יום"], "#4CAF50"), n: "\"תראו את ההבדל.\n\n[שמאל] הסוכן בלי AI – לא רע, מוכשר, מנוסה. אבל נכנס עם מה שיש בראש.\n\n[ימין] אותו סוכן עם AI. אותו כישרון. 5 דקות הכנה – נכנס כאילו הכין יומיים.\n\nמה אתם מעדיפים?\"" },
  { c: summarySlide([["📱", "אפליקציה מותקנת", "ChatGPT או Claude על הסמארטפון"], ["📋", "תבנית פרומפט בסיסית", "נשלחת בוואטסאפ אחרי המפגש"], ["🧠", "5 כללי הזהב", "תפקיד → הקשר → משימה → פורמט → שפר"]], "AI לפחות פעם ביום – לפני פגישה או שיחת טלפון.\nשלחו ל-\"AI Wins\" דוגמה אחת שעבדה."), n: "\"סיכום! אפליקציה מותקנת. תבנית בוואטסאפ. 5 כללים.\n\nמשימה: כל יום לפני פגישה או שיחה – דקה עם AI. שלחו ל-AI Wins.\n\nשבוע הבא: הכנת פגישה שלמה ב-5 דקות! 🚀\"" },
  { c: closingSlide("מפגש 2: \"תכין את הפגישה ב-5 דקות\"", "🚀", "נסו, שתפו. AI לא ילך לספר למנהל."), n: "\"שבוע טוב! AI Wins – תשתפו!\"" }
];

var S2 = [
  { c: titleSlide(2, '"תכין את הפגישה ב-5 דקות"', "🔍 מחקר • כרטיס הכנה • תוכנית פגישה/שיחה • שרשור פרומפטים"), n: "\"שבוע שני! מי השתמש ב-AI? שבוע שעבר למדנו לדבר. היום – נגרום ל-AI לעבוד בשבילנו. תהליך שלם ב-5 דקות.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 28, bold: true, color: GOLD }, "🏆 מה קרה מאז שבוע שעבר?"),
    React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 20 } },
      React.createElement("div", { style: { flex: 1, background: "rgba(76,175,80,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(76,175,80,0.2)" } },
        React.createElement(Txt, { size: 16, bold: true, color: "#4CAF50" }, "✅ סיפורי הצלחה"),
        React.createElement(Txt, { size: 14, color: "#aaa" }, "מי השתמש? מה עשיתם? מה קרה?")),
      React.createElement("div", { style: { flex: 1, background: "rgba(244,67,54,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(244,67,54,0.2)" } },
        React.createElement(Txt, { size: 16, bold: true, color: "#F44336" }, "🤔 מה לא עבד?"),
        React.createElement(Txt, { size: 14, color: "#aaa" }, "כישלונות מעניינים = שיעורים טובים"))),
    React.createElement(GoldBox, null,
      React.createElement(Txt, { size: 15, color: GOLD, bold: true, center: true }, "💡 תזכורת: תפקיד → הקשר → משימה → פורמט → שפר"))), n: "\"סיבוב מהיר: מי השתמש? מה עשה? מה קרה?\n\n[2-3 דוגמאות מ-AI Wins]\n\n'שבוע שעבר: פרומפט אחד. היום: שרשרת של 3. כמו לגו – כל קוביה בונה על הקודמת.'\"" },
  { c: React.createElement(CenterSlide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD, center: true }, "מה ההבדל בין שבוע שעבר להיום?"),
    React.createElement("div", { style: { display: "flex", gap: 30, marginTop: 16 } },
      React.createElement("div", { style: { background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px 28px", border: "1px solid #333", textAlign: "center" } },
        React.createElement("div", { style: { fontSize: 40 } }, "📝"),
        React.createElement(Txt, { size: 16, color: "#aaa", center: true, bold: true }, "מפגש 1"),
        React.createElement(Txt, { size: 14, color: "#666", center: true }, "פרומפט בודד")),
      React.createElement("div", { style: { fontSize: 32, color: GOLD, display: "flex", alignItems: "center" } }, "→"),
      React.createElement("div", { style: { background: "rgba(232,185,49,0.1)", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(232,185,49,0.3)", textAlign: "center", boxShadow: "0 0 30px rgba(232,185,49,0.1)" } },
        React.createElement("div", { style: { fontSize: 40 } }, "⛓️"),
        React.createElement(Txt, { size: 16, color: GOLD, center: true, bold: true }, "מפגש 2"),
        React.createElement(Txt, { size: 14, color: "#ccc", center: true }, "שרשרת פרומפטים"))),
    React.createElement(Txt, { size: 15, color: "#888", center: true }, "כל פרומפט מזין את הבא. 3 צעדים = הכנה מלאה.")), n: "\"שבוע שעבר: פרומפט אחד, תשובה אחת. היום: שרשרת.\n\n3 פרומפטים שעובדים ביחד. באותה שיחה. כמו לגו.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 26, bold: true, color: GOLD }, "⏱️ שיטת 5 הדקות – 3 שלבים"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, flex: 1, marginTop: 16 } },
      [{ s: "1", t: "60 שנ׳", n: "🔍 מחקר ענפי", d: "אתגרים, כאבים, שפה ענפית", c: "#4FC3F7" }, { s: "2", t: "90 שנ׳", n: "📋 כרטיס לקוח", d: "הזדמנות, כאבים, שאלות, התנגדויות", c: GOLD }, { s: "3", t: "90 שנ׳", n: "🗺️ תוכנית פגישה/שיחה", d: "פתיחה → גילוי → ערך → סגירה", c: "#4CAF50" }].map(function(x, i) {
        return React.createElement("div", { key: i, style: { display: "flex", gap: 16 } },
          React.createElement("div", { style: { width: 40, height: 40, borderRadius: 20, background: x.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#1a1a2e" } }, x.s),
          React.createElement("div", { style: { flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 18px", border: "1px solid " + x.c + "33" } },
            React.createElement(Txt, { size: 18, bold: true }, x.n),
            React.createElement(Txt, { size: 14, color: "#aaa" }, x.d),
            React.createElement(Txt, { size: 13, color: x.c, bold: true }, x.t)));
      })),
    React.createElement("div", { style: { background: "rgba(232,185,49,0.08)", borderRadius: 12, padding: 12, textAlign: "center", marginTop: 8 } },
      React.createElement("span", { style: { color: "#aaa", fontSize: 14 } }, "+ דקה לקריאה = "),
      React.createElement("span", { style: { color: GOLD, fontSize: 18, fontWeight: 800 } }, "פחות מ-5 דקות"))), n: "\"3 שלבים. 5 דקות.\n\nשלב 1: מחקר ענפי. דקה. אתגרי הענף.\nשלב 2: כרטיס לקוח. דקה וחצי.\nשלב 3: תוכנית. דקה וחצי.\n\n5 דקות במקום 'נראה מה יקרה' – נכנסים עם תוכנית.\"" },
  { c: codeSlide("🔍 שלב 1: מחקר ענפי (60 שנ׳)", "אני סוכן Comax – ERP וקופות POS.\n\nמחר [פגישה/שיחה] עם בעלים של\n[מיניסופר 3 סניפים / חנות אופנה 2 סניפים].\n\n1. 3 אתגרים עיקריים של הענף בישראל\n2. כאבים תפעוליים שלא מודעים אליהם\n3. מה גורם לחפש מערכת חדשה?\n4. שאלות שצפוי לשאול\n5. מילים/מושגים שחשוב שאשתמש", "🆕 שאלה 5: שפה ענפית – 'שחיקת מלאי' לבעל מיני, 'סוף עונה' לאופנה"), n: "\"שלב 1. מחקר. שאלה 5 = שפה. כשאומרים 'שחיקת מלאי' לבעל מיני, 'סוף עונה' לאופנה – זה הבדל של סגירה.\n\nדקה אחת – כל התמונה. כמו להגיע לדייט ולדעת מה אוהבת.\"" },
  { c: codeSlide("📋 שלב 2: כרטיס לקוח (90 שנ׳)", "באותה שיחה! בנה כרטיס:\n\n🏪 [סופר דני 3 סניפים / בוטיק שרון]\n🖥️ [קופה ישנה / אקסלים / מתחרה]\n👤 [הבעלים, hands-on / מנהל רכש]\n\n🎯 הזדמנות מרכזית\n⚡ 3 כאבים ספציפיים לענף\n💎 2 פיצ'רים ב-Comax שיפתרו בעיה\n❓ 3 שאלות פתיחה (פגישה או טלפון)\n🛡️ 2 התנגדויות + תשובות\n⚠️ דבר אחד שלא כדאי להגיד", "🔑 באותה שיחה! AI זוכר את המחקר"), n: "\"שלב 2. באותה שיחה! 'דבר שלא כדאי להגיד' – הזהב.\n\nלמשל, אם לקוח פנה אחרי שהמערכת קרסה – לא כדאי 'כמה הפסדת?' כי ירגיש ניצול. עדיף: 'בואי נראה שזה לא יקרה שוב.'\"" },
  { c: codeSlide("🗺️ שלב 3: תוכנית (90 שנ׳)", "המשך שיחה. מטרה: [דמו / קביעת פגישה / הצעה]\n\nלפגישה 30 דק׳:\n⏱️ פתיחה (5) – משפט ראשון, מה לא להגיד\n⏱️ גילוי (10) – 5 שאלות שחושפות צורך\n⏱️ ערך (10) – 3 נקודות + סיפור לקוח דומה\n⏱️ סגירה (5) – משפט מדויק לצעד הבא\n\nלשיחת טלפון 10 דק׳:\n⏱️ פתיחה (1) – hook\n⏱️ גילוי (4) – 3 שאלות ממוקדות\n⏱️ ערך (3) – נקודה חזקה אחת\n⏱️ סגירה (2) – קביעת פגישה/דמו", ""), n: "\"גם לפגישה וגם לטלפון! בטלפון 10 דקות – צריך להיות חד יותר.\n\nביקשתי 'סימני אזהרה' – מה לעשות כשיוצא מהמסלול. Plan B.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD }, "💪 תרגיל: 5 דקות מול השעון!"),
    React.createElement(Txt, { size: 15, color: "#ccc" }, "פגישה/שיחה אמיתית מהשבוע. כל 3 השלבים. באותה שיחה."),
    React.createElement("div", { style: { background: "rgba(244,67,54,0.08)", borderRadius: 16, padding: 20, border: "1px solid rgba(244,67,54,0.3)", textAlign: "center", margin: "16px 0" } },
      React.createElement("div", { style: { fontSize: 48, fontWeight: 800, color: "#F44336" } }, "⏱️ 5:00"),
      React.createElement("div", { style: { fontSize: 14, color: "#F44336", marginTop: 4 } }, "מחקר → כרטיס → תוכנית")),
    React.createElement("div", { style: { display: "flex", gap: 10 } },
      [{ t: "5 דק׳", n: "מחקר", c: "#4FC3F7" }, { t: "5 דק׳", n: "כרטיס", c: GOLD }, { t: "5 דק׳", n: "תוכנית", c: "#4CAF50" }].map(function(s, i) {
        return React.createElement("div", { key: i, style: { flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 12, border: "1px solid " + s.c + "33", textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 14, color: s.c, fontWeight: 700 } }, s.t),
          React.createElement(Txt, { size: 15, bold: true, center: true }, s.n));
      }))), n: "\"לא תיאורטי – אמיתי! פגישה מהשבוע.\n\n[הפעל טיימר] 5 דקות. כל 3 השלבים.\n\n'מי סיים? מי הגיע לשלב 3?'\n\n[2 מציגים] 'ראיתם? 5 דקות. הכנה שלמה.'\"" },
  { c: breakSlide("חצי מכם שולחים בוואטסאפ 'אחי, לא מאמין מה AI עשה'"), n: "\"הפסקה!\"" },
  { c: codeSlide("⚙️ Custom Instructions – הגדירו פעם אחת!", "ב-ChatGPT: Settings → Custom Instructions\nב-Claude: Settings → Profile\n\nמה לכתוב:\n────────────────────\nאני סוכן/ת מכירות שטח בחברת Comax.\nמערכות ERP וקופות POS לקמעונאות מזון ואופנה.\nאני עובד/ת בעיקר עם: [סוג הלקוחות]\nאזור: [מרכז / צפון / דרום]\nתמיד בעברית, קצר וישיר, סגנון מקצועי.\nאל תהיה מכירתי מדי.", "💡 מעכשיו AI יודע מי אתם – בלי לכתוב כל פעם מחדש"), n: "\"Custom Instructions – כותבים פעם אחת, AI זוכר לתמיד.\n\nחוסכים 3 שורות בכל פרומפט. בואו נעשה את זה עכשיו – דקה אחת!\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 22, bold: true, color: GOLD }, "🔥 Pro Tips: תזינו מידע אמיתי"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, flex: 1, marginTop: 14 } },
      [{ i: "📸", t: "תצלמו את האתר של הלקוח", d: "העתיקו טקסט ותגידו 'תנתח'", l: "בסיסי", c: "#4FC3F7" }, { i: "📊", t: "תזינו נתוני CRM", d: "היסטוריית רכישות, דוחות", l: "מתקדם", c: GOLD }, { i: "📝", t: "ספרו מה היה בפגישה הקודמת", d: "'הוא אמר X, תבנה גישה חדשה'", l: "מתקדם", c: GOLD }, { i: "🗞️", t: "חפשו חדשות על הלקוח", d: "כתבה? פוסט? תזינו ל-AI", l: "Pro", c: "#F44336" }].map(function(x, i) {
        return React.createElement("div", { key: i, style: { display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "10px 14px", border: "1px solid #2a2a4a" } },
          React.createElement("div", { style: { fontSize: 24 } }, x.i),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
              React.createElement("div", { style: { fontSize: 11, color: x.c, fontWeight: 600, background: x.c + "15", padding: "2px 8px", borderRadius: 6 } }, x.l),
              React.createElement(Txt, { size: 14, bold: true }, x.t)),
            React.createElement(Txt, { size: 12, color: "#aaa" }, x.d)));
      }))), n: "\"Pro Tip. AI טוב כמה שהמידע טוב.\n\nתזינו אתר, CRM, כתבות. אבל שכל – לא מידע רגיש. מידע ציבורי = בסדר גמור.\"" },
  { c: twoColSlide("📊 לפני ואחרי", "😰 בלי AI:", ["הכנה? איזו הכנה?", "נכנס 'ברגשת בטן'", "שוכח לבדוק ענף", "לא מכיר התנגדויות מראש", "פולו-אפ אחרי 3 ימים"], "#F44336", "🚀 עם AI:", ["5 דקות = הכנה מלאה", "נכנס עם כרטיס + תוכנית", "מדבר בשפה של הענף", "מוכן ל-3 התנגדויות", "פולו-אפ באותו יום"], "#4CAF50"), n: "\"ההבדל: אותו סוכן. אותו כישרון. 5 דקות הכנה = נכנס כאילו הכין יומיים.\"" },
  { c: summarySlide([["🔗", "שיטת השרשרת", "מחקר → כרטיס → תוכנית. 5 דקות."], ["⚙️", "Custom Instructions", "AI יודע שאתם Comax"], ["📋", "3 תבניות", "פגישה וטלפון"], ["💡", "Pro Tips", "תזינו מידע אמיתי – AI נהיה חד"]], "הכינו 2 פגישות או שיחות עם שיטת השרשרת.\nשתפו כרטיס לפני + מה קרה אחרי."), n: "\"שרשרת. Custom Instructions. 3 תבניות. Pro Tips.\n\nמשימה: 2 פגישות/שיחות עם AI. שתפו לפני ואחרי.\n\nשבוע הבא – התנגדויות! AI ישחק לקוח קשה! 🥊\"" },
  { c: closingSlide("מפגש 3: \"התגבר על כל התנגדות\"", "🥊", "AI ישחק לקוח קשה. מי שמפחד – יתרגל בבית 😉"), n: "\"שבוע הבא Roleplay! תנסו בבית: 'תשחק לקוח קשה ואני מוכר Comax'. שבוע טוב!\"" }
];

var S3 = [
  { c: titleSlide(3, '"התגבר על כל התנגדות"', "🛡️ מאגר התנגדויות • 3 אסטרטגיות • Roleplay • AI כמאמן"), n: "\"היום הכי כיפי! AI הופך ללקוח קשה ואתם מנסים למכור.\"" },
  { c: twoColSlide("10 ההתנגדויות", "💰 כסף ותזמון:", ["\"יקר לי\"", "\"לא עכשיו\"", "\"רוצה עוד הצעות\"", "\"אין לי זמן\"", "\"מה אם לא עובד?\""], "#F44336", "🖥️ מערכת ושינוי:", ["\"יש לי מערכת\"", "\"צריך לדבר עם השותף\"", "\"המעבר מסובך\"", "\"למה Comax?\"", "\"העובדים לא יסכימו\""], GOLD), n: "\"10 קלאסיקות. מה חסר? לכל אחת – 3 תשובות.\"" },
  { c: codeSlide("🧠 AI בונה תשובות", "אתה מומחה מכירות + פסיכולוגיית מכירות.\nמכיר קמעונאות מזון ואופנה בישראל.\n\nלקוח (בעל מיני / חנות בגדים) אומר: \"יקר לי\"\n\n3 אסטרטגיות:\n🔄 הפוך: שאלה שמשנה פרספקטיבה\n💎 ערך: ROI עם דוגמה מהענף\n🤝 רכך: הסכמה + צעד קטן\n\nלכל אחת:\n• משפט מילה במילה\n• למה עובד פסיכולוגית\n• מתי (פגישה או טלפון)\n• מה להגיד אחרי שמגיב", ""), n: "\"תפקיד כפול – מכירות ופסיכולוגיה. ומותאם לקמעונאות!\"" },
  { c: codeSlide("🥊 Roleplay – AI כלקוח", "אתה לקוח בסימולציית מכירה.\n\nבחר פרופיל:\n• דני, רשת מיני 4 סניפים, חסכן\n• שרון, בוטיק אופנה 2 סניפים, עסוקה\n• מוחמד, סופר שכונתי, חתום עם מתחרה\n• רונית, רשת ביגוד ספורט, מפחדת מטכנולוגיה\n\nכללים:\n• התנגד 4 פעמים\n• באמצע: \"מתחרה הציע זול יותר\"\n• בסוף: ציון 1-10, 3 טוב, 3 לשפר\n\n[בטלפון: 'אני באמצע משהו, יש לך דקה']", ""), n: "\"4 פרופילים מעולם המזון והאופנה. גם אופציה לטלפון.\"" },
  { c: breakSlide("אם AI נתן ציון נמוך – הוא מחמיא יותר מהמנהל שלכם"), n: "\"הפסקה!\"" },
  { c: codeSlide("🧪 Pro: ניתוח בדיעבד", "מאמן מכירות. חוזר מ[פגישה / שיחת טלפון].\n\n• הלקוח: [מיני/אופנה, מצב]\n• הוא אמר: [התנגדויות]\n• עניתי: [מה אמרתי]\n• תוצאה: [סגירה? דחייה? ניתוק?]\n\n1. ניתוח\n2. 3 תשובות טובות יותר\n3. פולו-אפ נכון\n4. שיעור לפעם הבאה\n\nתהיה ישיר.", "💡 כל פגישה/שיחה = שיעור"), n: "\"אחרי כל פגישה או שיחה – ברכב, הזינו. גם אם ניתק.\"" },
  { c: summarySlide([["🛡️", "מאגר התנגדויות", "15 תשובות – מזון ואופנה"], ["🥊", "Roleplay", "AI כלקוח – פגישה וטלפון"], ["📊", "ניתוח בדיעבד", "כל שיחה = שיעור"]], "כל התנגדות → AI ברכב. בונוס: 2 Roleplay בבית."), n: "\"שבוע הבא: כתיבה שמוכרת! ✍️\"" },
  { c: closingSlide("מפגש 4: \"כתיבה שמוכרת\"", "✍️", "ה-WhatsApp שלכם הולך לקבל שדרוג 😎"), n: "\"תביאו הצעת מחיר ישנה!\"" }
];

var S4 = [
  { c: titleSlide(4, '"כתיבה שמוכרת"', "✍️ פולו-אפ • WhatsApp • הצעות מחיר • Multi-shot • Persona Chain"), n: "\"מפגש 4! הכתיבה – שם כולנו מזניחים. מי שולח פולו-אפ אחרי כל שיחה? ... ומי שולח פולו-אפ טוב? ... בדיוק. היום: טכניקות Pro.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 28, bold: true, color: GOLD }, "🏆 מה קרה מאז שבוע שעבר?"),
    React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 16 } },
      React.createElement("div", { style: { flex: 1, background: "rgba(232,185,49,0.06)", borderRadius: 14, padding: 18, border: "1px solid rgba(232,185,49,0.2)" } },
        React.createElement(Txt, { size: 16, bold: true, color: GOLD }, "📊 מי ניתח פגישה/שיחה?"),
        React.createElement(Txt, { size: 14, color: "#aaa" }, "חזרתם → הזנתם ל-AI → מה למדתם?")),
      React.createElement("div", { style: { flex: 1, background: "rgba(232,185,49,0.06)", borderRadius: 14, padding: 18, border: "1px solid rgba(232,185,49,0.2)" } },
        React.createElement(Txt, { size: 16, bold: true, color: GOLD }, "🥊 מי תרגל Roleplay?"),
        React.createElement(Txt, { size: 14, color: "#aaa" }, "AI שיחק לקוח – מה הציון?")))), n: "\"סיבוב: מי ניתח פגישה? מי תרגל Roleplay?\n\n[2-3 דוגמאות]\n\n'היום טכניקות שרוב אנשי שיווק לא מכירים. Multi-shot, Persona Chain.'\"" },
  { c: React.createElement(CenterSlide, null,
    React.createElement(Txt, { size: 26, bold: true, color: GOLD, center: true }, "הבעיה עם תקשורת כתובה"),
    React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 16 } },
      [{ i: "📱", t: "WhatsApp", b: "\"היי, אני מ-Comax...\"", s: "2/10" }, { i: "📧", t: "פולו-אפ", b: "\"היה נחמד. מחכה.\"", s: "1/10" }, { i: "📄", t: "הצעת מחיר", b: "\"רצ\"ב. בברכה.\"", s: "3/10" }].map(function(x, i) {
        return React.createElement("div", { key: i, style: { flex: 1, background: "rgba(244,67,54,0.06)", borderRadius: 14, padding: 14, border: "1px solid rgba(244,67,54,0.2)", textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 28 } }, x.i),
          React.createElement(Txt, { size: 14, bold: true, center: true }, x.t),
          React.createElement(Txt, { size: 12, color: "#F44336", center: true }, x.b),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#F44336", marginTop: 6 } }, x.s));
      })),
    React.createElement(Txt, { size: 16, color: "#ccc", center: true }, "50 הודעות ביום. למה שיקרא דווקא את שלכם?")), n: "\"הלקוח מקבל 50 הודעות. 'היי אני מ-Comax' = ספאם. מוחק.\n\nהיום – כל הודעה תהיה שונה.\"" },
  { c: codeSlide("🧪 Multi-shot: AI בסגנון שלכם", "למד את הסגנון שלי מ-3 דוגמאות.\n\n3 הודעות WhatsApp שכתבתי ועבדו:\n\nדוגמה 1: \"[הודעה ללקוח מזון שעבדה]\"\nדוגמה 2: \"[הודעה ללקוח אופנה]\"\nדוגמה 3: \"[עוד אחת]\"\n\nבסגנון הזה כתוב הודעה חדשה:\n• לקוח: [בעל סופר / חנות בגדים]\n• מטרה: [קביעת פגישה / פולו-אפ]\n\nשמור על הטון, האורך, הסגנון שלי.", "💡 AI כותב בסגנון שלכם – לא כרובוט. זה Pro level."), n: "\"Multi-shot: 3 דוגמאות שעבדו. AI לומד ואז כותב כמוכם – לא כרובוט.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 22, bold: true, color: GOLD }, "💬 3 סוגי הודעות WhatsApp"),
    React.createElement("div", { style: { display: "flex", gap: 12, flex: 1, marginTop: 14 } },
      [{ t: "👋 פתיחה", d: "ללקוח חדש/קר", ex: "מקס 3 שורות\nשאלה פתוחה בסוף\n3 גרסאות: ישירה, רכה, יצירתית", c: "#4FC3F7" }, { t: "🔥 חימום", d: "ללקוח שנתקע", ex: "לא רודף, לא מיואש\nמחזיר שיחה בלי לחץ\nנותן סיבה לענות", c: GOLD }, { t: "💎 ערך", d: "בלי למכור כלום", ex: "טיפ/תובנה לענף שלו\nמבסס אמון\n'ראיתי שמחירי X עולים'", c: "#4CAF50" }].map(function(x, i) {
        return React.createElement("div", { key: i, style: { flex: 1, background: x.c + "11", borderRadius: 14, padding: 14, border: "1px solid " + x.c + "44", display: "flex", flexDirection: "column" } },
          React.createElement(Txt, { size: 16, bold: true, color: x.c, center: true }, x.t),
          React.createElement(Txt, { size: 12, color: "#aaa", center: true }, x.d),
          React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 10, marginTop: "auto" } },
            React.createElement(Txt, { size: 12, color: "#ddd" }, x.ex)));
      }))), n: "\"3 סוגים. הודעת ערך – הכי חשובה! לא מוכרים. רק ערך. 'שמעתי שמחירי הסחורה עולים'. עכשיו אתם יועצים, לא סוכנים.\"" },
  { c: codeSlide("📱 פולו-אפ – 3 הודעות ברצף", "היה לי [פגישה / שיחת טלפון]:\n\nלקוח: [בעל רשת מיני / בעלת בוטיק]\nדיברנו על: [מה הצגתי]\nהתנגדות: [מה אמר]\nסיכמנו: [צעד הבא]\n\n3 הודעות WhatsApp:\n1. מיד אחרי – סיכום חם, מזכיר מה הכי עניין\n2. יום לפני השיחה הבאה – תזכורת + ערך\n3. אם לא עונה – לא רודף. שאלה שקל לענות.\n\nמקסימום 4 שורות. בלי 'בברכה'.", ""), n: "\"לא הודעה אחת – סדרה! הודעה 2: מוסיף ערך. עכשיו אתם יועצים.\"" },
  { c: codeSlide("🔗 Persona Chain – AI בודק את AI", "שלב 1: כתוב הצעה / WhatsApp / פולו-אפ\n[AI כותב...]\n\n──────────────────\n\nשלב 2: עכשיו שכח שכתבת.\nאתה הלקוח – [בעל סופר חסכן / בעלת בוטיק עסוקה].\n\nקראת את ההודעה. תן ציון:\n• הייתי פותח? למה?\n• מה הרגשתי?\n• מה היה גורם להגיב?\n• מה היה גורם למחוק?\n• תשכתב גרסה שהייתי מגיב", "כותב → מבקר כלקוח → משכתב = יהלום"), n: "\"הטכניקה הכי מתקדמת! AI כותב, 'אתה הלקוח – מה חושב?' AI מבקר את עצמו.\n\nהגרסה השלישית = שנתיים אור מהראשונה. דקה וחצי.\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 22, bold: true, color: GOLD }, "💪 תרגיל: כתבו. שלחו. עכשיו!"),
    React.createElement(Txt, { size: 15, color: "#ccc" }, "בחרו לקוח אמיתי שצריך הודעה. מי שאמיץ – שולח עכשיו!"),
    React.createElement("div", { style: { display: "flex", gap: 12, margin: "16px 0" } },
      [{ t: "7 דק׳", d: "כתבו הודעה עם AI" }, { t: "5 דק׳", d: "בזוגות: נשמע טבעי?" }, { t: "3 דק׳", d: "מי שולח?! 🚀" }].map(function(s, i) {
        return React.createElement("div", { key: i, style: { flex: 1, background: "rgba(232,185,49,0.06)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(232,185,49,0.15)" } },
          React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: GOLD } }, s.t),
          React.createElement(Txt, { size: 13, color: "#aaa", center: true }, s.d));
      })),
    React.createElement("div", { style: { background: "rgba(244,67,54,0.06)", borderRadius: 14, padding: 18, border: "1px solid rgba(244,67,54,0.2)", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 20, color: "#F44336", fontWeight: 700 } }, "⚡ מי שולח הודעה ללקוח אמיתי מתוך הסדנה?"))), n: "\"רגע האמת! לקוח אמיתי. הודעה אמיתית.\n\n[7 דק׳ כתיבה, 5 דק׳ ביקורת]\n\n'מי שולח? ממש עכשיו!'\n\n[זה הרגע הכי חזק. אם מישהו מקבל תשובה בסדנה – זהב.]\"" },
  { c: codeSlide("📄 שדרוג הצעת מחיר", "לקוח: [בעל רשת מיני 5 סניפים / בוטיק]\nהצגתי: [מוצרים/שירותים]\nחשוב לו: [מה הדגיש]\n\nכתוב חלק טקסטואלי:\n1. פסקת פתיחה – על הכאב שלו, לא על המוצר\n2. מה מציעים – בשפה שלו, לא טכנית\n   (לא 'מודול BI' אלא 'דוח שמראה איפה מפסידים')\n3. למה עכשיו – דחיפות עדינה\n4. צעד הבא – ברור, קל\n\nטון: שותף עסקי, לא ספק טכנולוגיה.", ""), n: "\"הצעת מחיר = מסמך שיווקי, לא טכני. הלקוח צריך לקרוא ולהרגיש 'הם הבינו אותי'.\n\n'מודול BI' → 'דוח שמראה בדיוק איפה מפסידים כסף'. אותו מוצר, שפה שונה.\"" },
  { c: breakSlide("בדקו WhatsApp. אולי מישהו כבר ענה 😏"), n: "\"הפסקה!\"" },
  { c: React.createElement(Slide, null,
    React.createElement(Txt, { size: 22, bold: true, color: GOLD }, "📱 בנו מנוע תבניות אישי"),
    React.createElement(Txt, { size: 14, color: "#aaa" }, "4 תבניות שנשמרות בטלפון – מוכנות לכל רגע:"),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, marginTop: 12 } },
      [{ n: "1️⃣", t: "סיכום + פולו-אפ", d: "מיד אחרי פגישה/שיחה", c: "#4FC3F7" }, { n: "2️⃣", t: "WhatsApp ללקוח חדש", d: "כשמקבלים ליד", c: GOLD }, { n: "3️⃣", t: "חימום לקוח", d: "כשלא עונה", c: "#4CAF50" }, { n: "4️⃣", t: "טקסט להצעת מחיר", d: "לפני ששולחים הצעה", c: "#9C27B0" }].map(function(t, i) {
        return React.createElement("div", { key: i, style: { background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, border: "1px solid " + t.c + "33" } },
          React.createElement(Txt, { size: 14, color: t.c, bold: true }, t.n + " " + t.t),
          React.createElement(Txt, { size: 12, color: "#aaa" }, t.d));
      })),
    React.createElement(GoldBox, null,
      React.createElement(Txt, { size: 14, bold: true, color: GOLD }, "📍 איפה שומרים?"),
      React.createElement(Txt, { size: 13, color: "#ccc" }, "Notes בטלפון • שיחה נעוצה ב-ChatGPT • Text Replacement"))), n: "\"4 תבניות. שמרו בטלפון.\n\nPro tip: Text Replacement – מקלידים 'פולואפ' ומופיע הפרומפט המלא.\"" },
  { c: summarySlide([["🎯", "Multi-shot", "AI כותב בסגנון שלכם"], ["🔗", "Persona Chain", "כותב → מבקר → משכתב"], ["📱", "4 תבניות כתיבה", "פולו-אפ, WhatsApp, חימום, הצעה"], ["💎", "הודעת ערך", "לא כל הודעה מוכרת. ערך = אמון"]], "כל כתיבה → AI. שלחו הודעת ערך ללקוח שלא דיברתם איתו חודש."), n: "\"Multi-shot, Persona Chain, תבניות, הודעת ערך.\n\nמשימה: כל כתיבה → AI. שלחו הודעת ערך ללקוח ישן.\n\nשבוע הבא – הגמר! 🏆\"" },
  { c: closingSlide("מפגש 5: \"הסוכן החכם\" – הגמר!", "🏆", "תחרות פרומפטים + ערכה אישית. מי שלא יבוא – AI ידע 🤖"), n: "\"הגמר! בואו מוכנים!\"" }
];

var S5 = [
  { c: titleSlide(5, '"הסוכן החכם"', "🏆 סימולציה • Mega Prompt • תחרות • ערכה אישית"), n: "\"המפגש האחרון! Mega Prompt – הנשק הסודי.\"" },
  { c: codeSlide("🧠 Mega Prompt – הנשק הסודי", "עוזר AI למכירות Comax – ERP וקופות POS\nלקמעונאות מזון ואופנה.\n\nהלקוח: [שם, סוג עסק, גודל, מיקום]\nידוע: [מערכת, מצב, איך הגעתי]\nמטרה: [דמו / הצעה / סגירה / קביעת פגישה]\nסוג: [פגישה פיזית / שיחת טלפון]\n\nחבילת הכנה מלאה:\n1. מחקר ענפי – אתגרים, כאבים, שפה\n2. כרטיס לקוח – הזדמנות, שאלות, התנגדויות\n3. תוכנית [פגישה 30 דק׳ / שיחה 10 דק׳]\n4. 3 התנגדויות × 3 אסטרטגיות\n5. 3 הודעות פולו-אפ WhatsApp\n6. דבר אחד לא להגיד + אזהרות\n\nקורא ב-5 דק׳ לפני.", "פרומפט אחד = חבילה שלמה. דקה וחצי."), n: "\"Mega Prompt. הכל בבת אחת. גם פגישה וגם טלפון. 90% מהשימוש.\"" },
  { c: twoColSlide("איפה AI ואיפה אני?", "🤖 AI:", ["מחקר ענפי", "ניסוח הודעות", "רעיונות", "תרגול", "ניתוח", "24/7"], "#4FC3F7", "🧑 אתם:", ["קשר אישי", "טון בטלפון", "אינטואיציה", "גמישות", "סגירה", "קפה ☕"], GOLD), n: "\"AI מכין. אתם סוגרים. ביחד – בלתי ניתנים לעצירה.\"" },
  { c: summarySlide([["🧠", "Mega Prompt", "הכל בפרומפט אחד"], ["🛡️", "ארגז כלים", "מחקר, כרטיס, תוכנית, התנגדויות, כתיבה"], ["🏆", "ספר הפרומפטים", "הפרומפטים המנצחים של הצוות"]], "אתגר 30 יום: AI כל יום – לפני כל פגישה ושיחה."), n: "\"30 יום – AI כל יום. תודה! אתם אלופים! 🚀\"" },
  { c: React.createElement(CenterSlide, { gap: 20 }, React.createElement(Badge), React.createElement(Txt, { size: 28, bold: true, center: true }, "🎓 סיום הסדנה!"), React.createElement(Divider), React.createElement("div", { style: { fontSize: 48 } }, "🚀"), React.createElement(GoldBox, null, React.createElement(Txt, { size: 16, center: true }, "התחלנו: \"מה AI יכול בשבילי?\""), React.createElement(Txt, { size: 16, color: GOLD, bold: true, center: true }, "עכשיו: \"מה אני יכול עם AI?\""), React.createElement(Txt, { size: 16, center: true }, "תשובתי: כמעט הכל."))), n: "\"תודה לכולם! 🚀\"" }
];

var SESSIONS = [
  { id: 1, title: "AI זה לא מדע בדיוני", emoji: "💡", sub: "שבירת חסמים", slides: S1 },
  { id: 2, title: "תכין את הפגישה ב-5 דקות", emoji: "🔍", sub: "שרשרת פרומפטים", slides: S2 },
  { id: 3, title: "התגבר על כל התנגדות", emoji: "🛡️", sub: "Roleplay + התנגדויות", slides: S3 },
  { id: 4, title: "כתיבה שמוכרת", emoji: "✍️", sub: "Multi-shot + Persona Chain", slides: S4 },
  { id: 5, title: "הסוכן החכם", emoji: "🏆", sub: "Mega Prompt + ערכה", slides: S5 }
];

/* ===== WAITING SCREEN ===== */
function WaitingScreen() {
  var _d = useState(0), dots = _d[0], setDots = _d[1];
  var _t = useState(0), tip = _t[0], setTip = _t[1];
  var _tm = useState(""), time = _tm[0], setTime = _tm[1];
  useEffect(function() { var i = setInterval(function() { setDots(function(d) { return (d + 1) % 4; }); }, 800); return function() { clearInterval(i); }; }, []);
  useEffect(function() { var i = setInterval(function() { setTip(function(t) { return t + 1; }); }, 6000); return function() { clearInterval(i); }; }, []);
  useEffect(function() { var u = function() { setTime(new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })); }; u(); var i = setInterval(u, 1000); return function() { clearInterval(i); }; }, []);
  var tips = ["💡 AI יכול להכין פגישה ב-5 דקות", "🤖 AI לא ישן ולא מתלונן על בונוס", "📱 וודאו ש-ChatGPT או Claude מותקנים", "☕ בינתיים קפה. ל-AI לא צריך.", "🧠 סוכן + AI = בלתי ניתן לעצירה", "📞 עובד גם לפני שיחת טלפון!"];
  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',sans-serif", direction: "rtl" } },
    React.createElement("div", { style: { textAlign: "center", maxWidth: 420, padding: 24 } },
      React.createElement("div", { style: { marginBottom: 48 } },
        React.createElement("div", { style: { width: 90, height: 90, borderRadius: 45, background: "linear-gradient(135deg," + GOLD + ",#F7D060)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, color: "#1a1a2e" } }, "C"),
        React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: GOLD, letterSpacing: 2 } }, "COMAX × AI"),
        React.createElement("div", { style: { fontSize: 16, color: "#888", marginTop: 6 } }, "סדנת AI למכירות שטח")),
      React.createElement("div", { style: { fontSize: 52, fontWeight: 300, color: "#fff", marginBottom: 40, fontVariantNumeric: "tabular-nums", fontFamily: "monospace" } }, time),
      React.createElement("div", { style: { marginBottom: 48 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 } },
          [0, 1, 2].map(function(i) { return React.createElement("div", { key: i, style: { width: 12, height: 12, borderRadius: 6, background: GOLD, opacity: (dots + i) % 4 === 0 ? 1 : 0.25, transition: "opacity 0.4s" } }); })),
        React.createElement("div", { style: { fontSize: 20, color: "#aaa" } }, "קצת סבלנות, עוד מעט מתחילים" + ".".repeat(dots))),
      React.createElement("div", { style: { background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.15)", borderRadius: 16, padding: "16px 24px" } },
        React.createElement("div", { style: { fontSize: 15, color: "#888" } }, tips[tip % tips.length]))));
}

/* ===== LOGIN ===== */
function LoginScreen(props) {
  var _p = useState(""), pw = _p[0], setPw = _p[1];
  var _e = useState(false), err = _e[0], setErr = _e[1];
  function go() { if (pw === PASSWORD) { props.onLogin(); } else { setErr(true); } }
  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',sans-serif", direction: "rtl" } },
    React.createElement("div", { style: { maxWidth: 420, width: "100%", padding: 24, textAlign: "center" } },
      React.createElement("div", { style: { width: 80, height: 80, borderRadius: 40, background: "linear-gradient(135deg," + GOLD + ",#F7D060)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, color: "#1a1a2e" } }, "C"),
      React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: GOLD, letterSpacing: 2, marginBottom: 4 } }, "COMAX × AI"),
      React.createElement("div", { style: { fontSize: 16, color: "#888", marginBottom: 32 } }, "כניסת מנחה"),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", direction: "ltr", marginBottom: 12 } },
        React.createElement("input", { type: "password", placeholder: "סיסמה", value: pw, onChange: function(e) { setPw(e.target.value); setErr(false); }, onKeyDown: function(e) { if (e.key === "Enter") go(); }, style: { background: "rgba(255,255,255,0.06)", border: "1px solid " + (err ? "#F44336" : "#444"), borderRadius: 12, padding: "12px 18px", color: "#fff", fontSize: 16, textAlign: "center", width: 180, outline: "none" } }),
        React.createElement("button", { onClick: go, style: { background: GOLD, color: "#1a1a2e", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer" } }, "כניסה")),
      err ? React.createElement("div", { style: { color: "#F44336", fontSize: 14 } }, "סיסמה שגויה") : null));
}

/* ===== EXPORT FUNCTIONS ===== */
function exportHTML(sessionId) {
  var ses = SESSIONS.find(function(s) { return s.id === sessionId; });
  var html = '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Comax AI - מפגש ' + ses.id + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f0f1a;font-family:Segoe UI,sans-serif;direction:rtl}.slide{width:100%;max-width:900px;margin:20px auto;background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:18px;padding:40px;border:1px solid #2a2a4a;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;page-break-after:always}.slide-num{text-align:center;color:#888;font-size:12px;margin:8px 0 0}.gold{color:#E8B931}h1{color:#fff;font-size:28px;text-align:center;line-height:1.6}h2{color:#E8B931;font-size:22px;text-align:right;margin-bottom:12px}p{color:#ccc;font-size:16px;text-align:right;line-height:1.8}.header{text-align:center;padding:30px;color:#E8B931;font-size:24px;font-weight:800;letter-spacing:2px}@media print{.slide{break-after:page;margin:0 auto;box-shadow:none}}</style></head><body><div class="header">COMAX × AI | מפגש ' + ses.id + ': "' + ses.title + '"</div>';

  ses.slides.forEach(function(slide, i) {
    var noteText = slide.n || "";
    noteText = noteText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    html += '<div class="slide"><div style="width:100%;text-align:center"><h2>שקף ' + (i + 1) + '</h2></div></div>';
    html += '<div class="slide-num">שקף ' + (i + 1) + ' מתוך ' + ses.slides.length + '</div>';
  });

  html += '</body></html>';

  var blob = new Blob([html], { type: "text/html;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "comax-session-" + sessionId + ".html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printSession(sessionId) {
  var ses = SESSIONS.find(function(s) { return s.id === sessionId; });
  var win = window.open("", "_blank");
  var html = '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><title>Comax AI - מפגש ' + ses.id + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;font-family:Segoe UI,sans-serif;direction:rtl;padding:20px}.page{width:100%;max-width:800px;margin:0 auto 30px;border:2px solid #E8B931;border-radius:12px;padding:30px;page-break-after:always;min-height:400px}.gold{color:#E8B931}h1{font-size:24px;text-align:center;margin-bottom:10px}h2{color:#E8B931;font-size:18px;text-align:right;margin-bottom:8px}p,.note{font-size:14px;text-align:right;line-height:1.8;color:#333}.note{background:#f9f5e8;border-right:4px solid #E8B931;padding:12px;margin-top:12px;border-radius:6px}.header{text-align:center;font-size:22px;font-weight:800;color:#E8B931;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #E8B931}.num{text-align:center;color:#999;font-size:12px;margin-top:8px}@media print{body{padding:0}.page{border:1px solid #ddd;margin-bottom:0}}</style></head><body>';
  html += '<div class="header">COMAX × AI | מפגש ' + ses.id + ': "' + ses.title + '"</div>';

  ses.slides.forEach(function(slide, i) {
    var noteClean = (slide.n || "אין הערות").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>").replace(/"/g, "&quot;");
    html += '<div class="page">';
    html += '<h2>שקף ' + (i + 1) + ' מתוך ' + ses.slides.length + '</h2>';
    html += '<div class="note"><strong>🎤 הערות מנחה:</strong><br>' + noteClean + '</div>';
    html += '</div>';
  });

  html += '<script>setTimeout(function(){window.print()},500)<\/script></body></html>';
  win.document.write(html);
  win.document.close();
}

/* ===== DASHBOARD ===== */
function Dashboard(props) {
  var base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  var _c = useState(false), copied = _c[0], setCopied = _c[1];
  var _cs = useState(0), copiedSes = _cs[0], setCopiedSes = _cs[1];
  function copyLink(sid) {
    var url = base + "?view=true&session=" + sid;
    var ta = document.createElement("textarea");
    ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    setCopied(true); setCopiedSes(sid);
    setTimeout(function() { setCopied(false); setCopiedSes(0); }, 3000);
  }
  var btns = SESSIONS.map(function(s) {
    var ic = copied && copiedSes === s.id;
    return React.createElement("div", { key: s.id, style: { background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a4a", borderRadius: 14, padding: "16px 20px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } },
        React.createElement("div", { style: { fontSize: 32 } }, s.emoji),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "#fff" } }, "מפגש " + s.id + ": \"" + s.title + "\""),
          React.createElement("div", { style: { fontSize: 13, color: "#888" } }, s.sub + " • " + s.slides.length + " שקפים"))),
      React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
        React.createElement("button", { onClick: function() { props.onStart(s.id); }, style: { flex: 1, background: GOLD, color: "#1a1a2e", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" } }, "▶ התחל מצגת"),
        React.createElement("button", { onClick: function() { copyLink(s.id); }, style: { flex: 1, background: ic ? "#4CAF50" : "rgba(255,255,255,0.06)", color: ic ? "#fff" : "#aaa", border: "1px solid " + (ic ? "#4CAF50" : "#333"), borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer" } }, ic ? "✅ הועתק!" : "🔗 לינק לסוכנים")),
      React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 6 } },
        React.createElement("button", { onClick: function() { exportHTML(s.id); }, style: { flex: 1, background: "rgba(255,255,255,0.03)", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer" } }, "📥 הורד HTML"),
        React.createElement("button", { onClick: function() { printSession(s.id); }, style: { flex: 1, background: "rgba(255,255,255,0.03)", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer" } }, "🖨️ הדפס PDF")),
      ic ? React.createElement("div", { style: { background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, padding: "8px", marginTop: 8, textAlign: "center" } },
        React.createElement("div", { style: { fontSize: 13, color: "#4CAF50" } }, "✅ הלינק הועתק! שלחו בוואטסאפ")) : null);
  });
  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, fontFamily: "'Segoe UI',sans-serif", direction: "rtl", padding: 24 } },
    React.createElement("div", { style: { maxWidth: 700, margin: "0 auto" } },
      React.createElement("div", { style: { textAlign: "center", marginBottom: 28 } },
        React.createElement("div", { style: { fontSize: 14, color: GOLD, letterSpacing: 2, fontWeight: 700 } }, "🎤 מצב מנחה"),
        React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 8 } }, "סדנת AI למכירות שטח – Comax")),
      React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 } }, "בחר מפגש:"),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, btns)));
}

/* ===== SLIDE VIEW ===== */
function SlideView(props) {
  var _c = useState(props.initialSlide || 0), cur = _c[0], setCur = _c[1];
  var ses = SESSIONS.find(function(s) { return s.id === props.session; });
  var sl = ses.slides;
  var s = sl[cur];
  var isP = props.isP;

  useEffect(function() {
    if (!isP) return;
    setState(props.session, cur).catch(function() {});
  }, [isP, props.session, cur]);

  useEffect(function() {
    if (isP) return;
    function poll() {
      getState().then(function(data) {
        if (data && data.length > 0 && data[0].session_id === props.session) {
          setCur(data[0].slide_index);
        }
      }).catch(function() {});
    }
    poll();
    var i = setInterval(poll, 1500);
    return function() { clearInterval(i); };
  }, [isP, props.session]);

  useEffect(function() {
    if (!isP) return;
    function h(e) {
      if (e.key === "ArrowLeft") setCur(function(p) { return Math.min(p + 1, sl.length - 1); });
      if (e.key === "ArrowRight") setCur(function(p) { return Math.max(p - 1, 0); });
    }
    window.addEventListener("keydown", h);
    return function() { window.removeEventListener("keydown", h); };
  }, [isP, sl.length]);

  var dotsEl = sl.map(function(_, i) {
    return React.createElement("div", { key: i, onClick: isP ? function() { setCur(i); } : undefined, style: { width: i === cur ? 20 : 7, height: 7, borderRadius: 4, background: i === cur ? GOLD : "#333", cursor: isP ? "pointer" : "default", transition: "all 0.3s" } });
  });

  // PRESENTER: split layout
  if (isP) {
    var topBar = React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 16px" } },
      React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
        React.createElement("div", { style: { fontSize: 12, color: GOLD, fontWeight: 700 } }, "COMAX"),
        React.createElement("div", { style: { fontSize: 12, color: "#555" } }, "|"),
        React.createElement("div", { style: { fontSize: 12, color: "#888" } }, "מפגש " + props.session),
        React.createElement("div", { style: { fontSize: 11, color: "#1a1a2e", background: GOLD, padding: "2px 8px", borderRadius: 6, fontWeight: 700, marginRight: 8 } }, "מנחה")),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        React.createElement("div", { style: { fontSize: 12, color: "#555" } }, (cur + 1) + "/" + sl.length),
        React.createElement("button", { onClick: props.onBack, style: { fontSize: 11, color: "#666", background: "none", border: "1px solid #333", borderRadius: 6, padding: "4px 10px", cursor: "pointer" } }, "🔙 חזרה")));

    var slideEl = React.createElement("div", { style: { background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, width: "100%", aspectRatio: "16/9", padding: 28, boxSizing: "border-box", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", border: "1px solid #2a2a4a", overflow: "hidden", position: "relative" } },
      React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: 80, height: 80, background: "radial-gradient(circle at top left,rgba(232,185,49,0.08),transparent)" } }),
      React.createElement("div", { style: { height: "100%", position: "relative", zIndex: 1 } }, s.c));

    var navBtns = React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 8 } },
      React.createElement("button", { onClick: function() { setCur(function(p) { return Math.min(p + 1, sl.length - 1); }); }, style: { background: cur < sl.length - 1 ? GOLD : "#333", color: cur < sl.length - 1 ? "#1a1a2e" : "#666", border: "none", borderRadius: 8, padding: "8px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" } }, "הבא ←"),
      React.createElement("button", { onClick: function() { setCur(function(p) { return Math.max(p - 1, 0); }); }, style: { background: cur > 0 ? "rgba(255,255,255,0.1)" : DARK, color: cur > 0 ? "#ccc" : "#333", border: "1px solid #333", borderRadius: 8, padding: "8px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" } }, "→ הקודם"));

    var dotsRow = React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 4, marginTop: 6, flexWrap: "wrap" } }, dotsEl);

    var notesPanel = React.createElement("div", { style: { background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.2)", borderRadius: 14, padding: 16, height: "100%", overflow: "auto", boxSizing: "border-box" } },
      React.createElement("div", { style: { fontSize: 14, color: GOLD, fontWeight: 700, marginBottom: 10, textAlign: "right" } }, "🎤 הערות למנחה:"),
      React.createElement("div", { style: { fontSize: 14, color: "#ccc", lineHeight: 1.9, textAlign: "right", whiteSpace: "pre-wrap", direction: "rtl" } }, s.n || "(אין הערות לשקף זה)"));

    return React.createElement("div", { style: { width: "100%", height: "100vh", background: DARK, fontFamily: "'Segoe UI',sans-serif", direction: "rtl", display: "flex", flexDirection: "column", overflow: "hidden" } },
      topBar,
      React.createElement("div", { style: { display: "flex", flex: 1, gap: 12, padding: "0 16px 12px", overflow: "hidden" } },
        React.createElement("div", { style: { flex: "0 0 62%", display: "flex", flexDirection: "column" } },
          slideEl, navBtns, dotsRow),
        React.createElement("div", { style: { flex: "0 0 36%", display: "flex", flexDirection: "column" } },
          notesPanel)));
  }

  // VIEWER: simple layout, no nav, no notes
  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, fontFamily: "'Segoe UI',sans-serif", direction: "rtl" } },
    React.createElement("div", { style: { width: "100%", maxWidth: 960, margin: "0 auto", padding: "16px 16px 0" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
          React.createElement("div", { style: { fontSize: 12, color: GOLD, fontWeight: 700 } }, "COMAX"),
          React.createElement("div", { style: { fontSize: 12, color: "#555" } }, "|"),
          React.createElement("div", { style: { fontSize: 12, color: "#888" } }, "מפגש " + props.session)),
        React.createElement("div", { style: { fontSize: 12, color: "#555" } }, (cur + 1) + "/" + sl.length)),
      React.createElement("div", { style: { background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 18, width: "100%", aspectRatio: "16/9", padding: 36, boxSizing: "border-box", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid #2a2a4a", overflow: "hidden", position: "relative" } },
        React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: 100, height: 100, background: "radial-gradient(circle at top left,rgba(232,185,49,0.08),transparent)" } }),
        React.createElement("div", { style: { height: "100%", position: "relative", zIndex: 1 } }, s.c)),
      React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 5, marginTop: 10, flexWrap: "wrap", paddingBottom: 8 } }, dotsEl)));
}

/* ===== MAIN APP ===== */
export default function App() {
  var _p = useState(false), isP = _p[0], setIsP = _p[1];
  var _s = useState(null), ses = _s[0], setSes = _s[1];
  var _v = useState(null), vSes = _v[0], setVSes = _v[1];
  var _vs = useState(0), vSlide = _vs[0], setVSlide = _vs[1];

  var params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  var isViewer = params ? params.get("view") === "true" : false;

  // Viewer: poll Supabase for active session
  useEffect(function() {
    if (!isViewer) return;
    function check() {
      getState().then(function(data) {
        if (data && data.length > 0 && data[0].session_id > 0) {
          setVSes(data[0].session_id);
          setVSlide(data[0].slide_index);
        } else {
          setVSes(null);
        }
      }).catch(function() {});
    }
    check();
    var i = setInterval(check, 1500);
    return function() { clearInterval(i); };
  }, [isViewer]);

  // Presenter starts session -> push to Supabase
  function start(id) {
    setSes(id);
    setState(id, 0).catch(function() {});
  }

  function back() {
    setSes(null);
    setState(0, 0).catch(function() {});
  }

  // VIEWER
  if (isViewer) {
    if (vSes && vSes > 0) {
      return React.createElement(SlideView, { session: vSes, isP: false, onBack: function() {}, initialSlide: vSlide });
    }
    return React.createElement(WaitingScreen);
  }

  // PRESENTER
  if (!isP) { return React.createElement(LoginScreen, { onLogin: function() { setIsP(true); } }); }
  if (ses) { return React.createElement(SlideView, { session: ses, isP: true, onBack: back }); }
  return React.createElement(Dashboard, { onStart: start });
}