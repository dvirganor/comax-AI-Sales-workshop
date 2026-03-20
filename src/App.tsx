import React, { useState, useEffect } from "react";

var GOLD = "#E8B931";
var DARK = "#0f0f1a";
var PASSWORD = "dvir1971";

/* ======= HELPER COMPONENTS ======= */

function Txt(props) {
  var style = {
    fontSize: props.size || 16,
    fontWeight: props.bold ? 700 : 400,
    color: props.color || "#fff",
    textAlign: props.center ? "center" : "right",
    direction: "rtl",
    lineHeight: 1.7,
    whiteSpace: "pre-line"
  };
  return React.createElement("div", { style: style }, props.children);
}

function Slide(props) {
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      direction: "rtl",
      gap: props.gap || 0
    }
  }, props.children);
}

function CenterSlide(props) {
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: props.gap || 20
    }
  }, props.children);
}

function GoldBox(props) {
  return React.createElement("div", {
    style: {
      background: props.bg || "rgba(232,185,49,0.08)",
      border: "1px solid " + (props.border || "rgba(232,185,49,0.2)"),
      borderRadius: 14,
      padding: props.pad || 18
    }
  }, props.children);
}

function Badge(props) {
  return React.createElement("div", {
    style: { fontSize: 18, color: GOLD, letterSpacing: 3, fontWeight: 700 }
  }, "COMAX × AI");
}

function Divider() {
  return React.createElement("div", {
    style: { width: 80, height: 4, background: "linear-gradient(90deg," + GOLD + ",#F7D060)", borderRadius: 2 }
  });
}

/* ======= SLIDE BUILDERS ======= */

function titleSlide(num, title, sub) {
  return React.createElement(CenterSlide, { gap: 20 },
    React.createElement(Badge),
    React.createElement(Txt, { size: 40, bold: true, center: true }, "סדנת AI למכירות שטח"),
    React.createElement(Divider),
    React.createElement(Txt, { size: 22, color: "#ccc", center: true }, "מפגש " + num + " מתוך 5"),
    React.createElement(Txt, { size: 28, color: GOLD, bold: true, center: true }, title),
    React.createElement(Txt, { size: 14, color: "#999", center: true }, sub)
  );
}

function closingSlide(next, emoji, footer) {
  return React.createElement(CenterSlide, { gap: 24 },
    React.createElement(Badge),
    React.createElement(Txt, { size: 32, bold: true, center: true }, "נתראה בשבוע הבא!"),
    React.createElement(Divider),
    React.createElement(Txt, { size: 20, color: "#ccc", center: true }, next),
    React.createElement("div", { style: { fontSize: 48, marginTop: 16 } }, emoji),
    React.createElement(Txt, { size: 14, color: "#666", center: true }, footer)
  );
}

function breakSlide(text) {
  return React.createElement(CenterSlide, { gap: 24 },
    React.createElement("div", { style: { fontSize: 72 } }, "☕"),
    React.createElement(Txt, { size: 32, bold: true, color: GOLD, center: true }, "הפסקה – 10 דקות"),
    React.createElement(Txt, { size: 18, color: "#aaa", center: true }, text)
  );
}

function quoteSlide(text, footer) {
  return React.createElement(CenterSlide, { gap: 28 },
    React.createElement(Txt, { size: 48, color: "rgba(232,185,49,0.3)", center: true }, '"'),
    React.createElement("div", {
      style: { fontSize: 26, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.6, maxWidth: 550 },
      dangerouslySetInnerHTML: { __html: text }
    }),
    React.createElement(Txt, { size: 48, color: "rgba(232,185,49,0.3)", center: true }, '"'),
    React.createElement(Txt, { size: 14, color: "#888", center: true }, footer)
  );
}

function codeSlide(title, code, footer) {
  return React.createElement(Slide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD }, title),
    React.createElement("div", {
      style: { background: "#1a1a2e", borderRadius: 14, padding: 20, flex: 1, fontFamily: "monospace", border: "1px solid #333", marginTop: 12, overflow: "auto" }
    },
      React.createElement(Txt, { size: 14, color: GOLD }, "PROMPT:"),
      React.createElement(Txt, { size: 14, color: "#ddd" }, code)
    ),
    footer ? React.createElement(Txt, { size: 12, color: "#888", center: true }, footer) : null
  );
}

function summarySlide(items, hw) {
  return React.createElement(Slide, null,
    React.createElement(Txt, { size: 24, bold: true, color: GOLD }, "🎯 מה לוקחים הביתה?"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, margin: "14px 0" } },
      items.map(function(x, i) {
        return React.createElement("div", {
          key: i,
          style: { display: "flex", gap: 12, alignItems: "center", background: "rgba(232,185,49,0.06)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(232,185,49,0.15)" }
        },
          React.createElement("div", { style: { fontSize: 22 } }, x[0]),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement(Txt, { size: 14, bold: true }, x[1]),
            React.createElement(Txt, { size: 12, color: "#aaa" }, x[2])
          )
        );
      })
    ),
    React.createElement("div", {
      style: { background: "linear-gradient(135deg," + GOLD + ",#F7D060)", borderRadius: 14, padding: 16 }
    },
      React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#1a1a2e", textAlign: "right", direction: "rtl" } }, "📌 משימה:"),
      React.createElement("div", { style: { fontSize: 14, color: "#1a1a2e", textAlign: "right", direction: "rtl", lineHeight: 1.8 } }, hw)
    )
  );
}

function twoColSlide(title, leftTitle, leftItems, leftColor, rightTitle, rightItems, rightColor) {
  function col(t, items, clr) {
    return React.createElement("div", {
      style: { flex: 1, background: clr + "18", border: "1px solid " + clr + "55", borderRadius: 16, padding: 18 }
    },
      React.createElement(Txt, { size: 18, bold: true, color: clr }, t),
      React.createElement("div", { style: { marginTop: 12 } },
        items.map(function(item, i) {
          return React.createElement(Txt, { key: i, size: 14, color: "#ddd" }, "• " + item);
        })
      )
    );
  }
  return React.createElement(Slide, null,
    React.createElement(Txt, { size: 28, bold: true, color: GOLD }, title),
    React.createElement("div", { style: { display: "flex", gap: 20, flex: 1, marginTop: 20 } },
      col(leftTitle, leftItems, leftColor),
      col(rightTitle, rightItems, rightColor)
    )
  );
}

/* ======= SESSION DATA ======= */

var S1 = [
  { c: titleSlide(1, '"AI זה לא מדע בדיוני"', "💡 שבירת חסמים • הדלקת מוטיבציה • הכלי הראשון שלכם"), n: "\"בוקר טוב! הבוס אמר סדנת AI. חלק חשבו 'עוד הרצאה'. היום אף אחד לא ישן – משתמשים ב-AI על לקוחות אמיתיים. בזמן אמת.\n\nואם בסוף לא תגידו 'זה שימושי' – הקפה עליי.\"" },
  { c: twoColSlide("מה AI יכול ומה לא",
    "✅ AI מעולה ב:", ["לנסח טקסטים ומיילים", "לחקור ענף מזון/אופנה תוך שניות", "רעיונות לגישת מכירה", "תרגול התנגדויות", "לסכם שיחה טלפונית", "לעבוד 24/7 בלי קפה"], "#4CAF50",
    "❌ AI גרוע ב:", ["לבנות יחסים אישיים", "להרגיש טון בטלפון", "אינטואיציה של סוכן מנוסה", "לקפוץ ללקוח לביקור", "לסגור עסקה בלחיצת יד", "לדעת שדני מרוגז כי ריבו עם אשתו"], "#F44336"
  ), n: "\"AI לא ג'יימס בונד של מכירות. לא יתקשר ללקוח, לא יקפוץ לביקור. אבל עושה את כל ההכנה.\n\nAI = הכנה. אתם = קסם. ביחד = בלתי ניתנים לעצירה.\"" },
  { c: quoteSlide("AI לא יחליף סוכן מכירות.<br/><span style='color:" + GOLD + "'>סוכן שמשתמש ב-AI</span><br/>יחליף סוכן שלא.", "(ואל תגידו שלא הזהרנו 😏)"), n: "[5 שניות שקט]\n\n\"קראו. תזכרו. בואו נראה בפעולה. מי מתנדב?\"" },
  { c: codeSlide("🎪 הדגמה חיה – הפרומפט:",
    "אתה יועץ מכירות מומחה בתחום מערכות ERP/POS\nלקמעונאות מזון ואופנה.\n\nלקוח: [מה שהסוכן אמר – למשל: בעל מיניסופר 2 סניפים,\nעובד עם קופה ישנה, מתלונן על חוסר שליטה במלאי]\n\nתן לי:\n1. שלוש שאלות חכמות שיגרמו לו לחשוב מחדש\n2. שני כאבים שכנראה יש לו ולא מודע אליהם\n3. משפט פתיחה – לפגישה פיזית או לשיחת טלפון",
    "💡 תפקיד → הקשר → משימה ברורה → פורמט"
  ), n: "\"שימו לב: לא 'עזור לי למכור'. נותן תפקיד, הקשר, משימה.\n\n[הרץ, קרא בקול]\n\n'אם לא אהבתם – בקשו אחרת. AI לא נעלב.'\n\n[פרומפט המשך:] 'גישה אחרת – מבוססת סיפור לקוח דומה שעשה מעבר.'\"" },
  { c: codeSlide("💪 תרגיל: הלקוח שלכם",
    "אני סוכן/ת מכירות של Comax – מערכות ERP וקופות POS\nלקמעונאות מזון ואופנה.\n\nהלקוח שלי: [תאר בשני משפטים – סוג חנות, גודל, מצב]\nהאתגר: [מה קשה? למשל: לא עונה לטלפון / אומר יקר / יש מתחרה]\n\nעזור לי עם:\n1. שלוש שאלות פתיחה (לפגישה או לשיחת טלפון)\n2. שתי נקודות כאב שהוא לא מודע אליהן\n3. הצעה לאיך לפתוח את השיחה הבאה",
    "5 דק׳ כתבו → 10 דק׳ בזוגות → 10 דק׳ שיתוף"
  ), n: "\"תוציאו טלפונים – רשות רשמית!\n\nגם מי שעובד בטלפון – תכתבו על לקוח שמתכננים להתקשר אליו.\n\n[5 דק׳] 'אל תחפשו מושלם – תכתבו ותראו.'\n[10 דק׳ זוגות]\n[10 דק׳ שיתוף] 'מי קיבל משהו מפתיע?'\"" },
  { c: breakSlide("קפה, שירותים, ולבדוק אם AI עונה בלי Wi-Fi (ספוילר: לא)"), n: "\"הפסקה! ואם רוצים להתמכר – תנסו עוד פרומפט.\"" },
  { c: twoColSlide("5 כללי הזהב",
    "✅ עשו:", ["1️⃣ תנו תפקיד – 'אתה מומחה POS'", "2️⃣ תנו הקשר – 'רשת ביגוד, 3 סניפים'", "3️⃣ משימה ברורה – '3 שאלות פתיחה'", "4️⃣ פורמט – 'כהודעת WhatsApp'", "5️⃣ חזרו ושפרו – 'יותר ישיר'"], "#4CAF50",
    "❌ אל תעשו:", ["'עזור לי למכור'", "'יש לי לקוח'", "'עזור לי עם הפגישה'", "'תכתוב משהו'", "לקחת תשובה ראשונה כאילו אין מחר"], "#F44336"
  ), n: "\"5 כללים. פשוטים.\n\nתפקיד, הקשר, משימה, פורמט, שפר.\n\nAI לא נעלב – תנסו את זה עם השותף...\"" },
  { c: summarySlide([
    ["📱", "אפליקציה מותקנת", "ChatGPT או Claude על הסמארטפון"],
    ["📋", "תבנית פרומפט בסיסית", "נשלחת בוואטסאפ אחרי המפגש"],
    ["🧠", "5 כללי הזהב", "תפקיד → הקשר → משימה → פורמט → שפר"]
  ], "AI לפחות פעם ביום – לפני פגישה או שיחת טלפון.\nשלחו ל-\"AI Wins\" דוגמה אחת שעבדה."), n: "\"אפליקציה. תבנית. 5 כללים.\n\nמשימה: לפני כל פגישה או שיחה – דקה עם AI.\n\nשבוע הבא: הכנת פגישה/שיחה ב-5 דקות! 🚀\"" },
  { c: closingSlide("מפגש 2: \"תכין את הפגישה ב-5 דקות\"", "🚀", "נסו, שתפו. AI לא ילך לספר למנהל."), n: "\"שבוע טוב! AI Wins!\"" }
];

var S2 = [
  { c: titleSlide(2, '"תכין את הפגישה ב-5 דקות"', "🔍 מחקר לקוח • כרטיס הכנה • תוכנית פגישה/שיחה • שרשור פרומפטים"), n: "\"שבוע שני! היום – שרשרת פרומפטים. תהליך שלם ב-5 דקות. גם לפגישה פיזית וגם לשיחת טלפון.\"" },
  { c: codeSlide("🔍 שלב 1: מחקר ענפי (60 שנ׳)",
    "אני סוכן Comax – ERP וקופות POS לקמעונאות מזון ואופנה.\n\nמחר יש לי [פגישה/שיחה] עם בעלים של\n[מיניסופר 3 סניפים / חנות אופנה 2 סניפים].\n\nתן לי תמונה מהירה:\n1. 3 אתגרים עיקריים של [הענף] בישראל\n2. כאבים תפעוליים שלא תמיד מודעים אליהם\n3. מה גורם לחפש מערכת חדשה?\n4. שאלות שצפוי לשאול\n5. מילים/מושגים שחשוב שאשתמש\n\nקצר – קורא לפני השיחה.",
    "🆕 שאלה 5: שפה ענפית = מראה שמבינים את העולם שלו"
  ), n: "\"שלב 1. מחקר. שאלה 5 = שפה. כשאומרים 'שחיקת מלאי' לבעל מיני, או 'סוף עונה' לבעל אופנה – זה הבדל של סגירה.\n\nעובד גם לפני שיחת טלפון – לא רק פגישה.\"" },
  { c: codeSlide("📋 שלב 2: כרטיס לקוח (90 שנ׳)",
    "באותה שיחה! בנה כרטיס הכנה:\n\n🏪 שם: [סופר דני / בוטיק שרון]\n📍 [3 סניפים באזור המרכז]\n🖥️ [קופה ישנה / אקסלים / מתחרה]\n👤 [הבעלים, hands-on / מנהל רכש]\n\n🎯 הזדמנות מרכזית ל-Comax\n⚡ 3 כאבים ספציפיים לענף שלו\n💎 2 פיצ'רים ב-Comax שיפתרו בעיה אמיתית\n❓ 3 שאלות פתיחה (לפגישה או לטלפון)\n🛡️ 2 התנגדויות צפויות + תשובות\n⚠️ דבר אחד שלא כדאי להגיד",
    "🔑 באותה שיחה! AI זוכר את המחקר הענפי"
  ), n: "\"שלב 2. באותה שיחה! ביקשתי 'דבר שלא כדאי להגיד' – זה הזהב.\n\nגם בשיחת טלפון – אל תפתחו עם 'מה שלומך' אם הלקוח עסוק.\"" },
  { c: codeSlide("🗺️ שלב 3: תוכנית (90 שנ׳)",
    "המשך שיחה. בנה תוכנית ל:\n[פגישה 30 דק׳ / שיחת טלפון 10 דק׳]\n\nמטרה: [לסגור דמו / לקבוע פגישה / לשלוח הצעה]\n\nלפגישה:\n⏱️ פתיחה (5 דק׳) – משפט ראשון, מה לא להגיד\n⏱️ גילוי (10 דק׳) – 5 שאלות שחושפות צורך\n⏱️ ערך (10 דק׳) – 3 נקודות + סיפור לקוח דומה\n⏱️ סגירה (5 דק׳) – משפט מדויק לצעד הבא\n\nלשיחת טלפון:\n⏱️ פתיחה (1 דק׳) – למה מתקשר, hook\n⏱️ גילוי (4 דק׳) – 3 שאלות ממוקדות\n⏱️ ערך (3 דק׳) – נקודה אחת חזקה\n⏱️ סגירה (2 דק׳) – קביעת פגישה/דמו",
    ""
  ), n: "\"גם לפגישה וגם לטלפון! הבדל מהותי: בטלפון יש לכם 10 דקות, לא 30. צריך להיות חד יותר.\n\nביקשתי סימני אזהרה – מה לעשות כשהלקוח רוצה לסיים.\"" },
  { c: breakSlide("חצי מכם כבר שולחים בוואטסאפ 'אחי, לא מאמין מה AI עשה'"), n: "\"הפסקה!\"" },
  { c: summarySlide([
    ["🔗", "שיטת השרשרת", "מחקר → כרטיס → תוכנית. 5 דקות."],
    ["⚙️", "Custom Instructions", "AI כבר יודע שאתם Comax"],
    ["📋", "3 תבניות", "מחקר, כרטיס, תוכנית – לפגישה ולטלפון"]
  ], "הכינו לפחות 2 פגישות או שיחות עם שיטת השרשרת.\nשתפו כרטיס לפני + מה קרה אחרי."), n: "\"שרשרת. Custom Instructions. 3 תבניות. עובד גם בטלפון!\n\nשבוע הבא – התנגדויות. AI ישחק לקוח קשה! 🥊\"" },
  { c: closingSlide("מפגש 3: \"התגבר על כל התנגדות\"", "🥊", "AI ישחק לקוח קשה. מי שמפחד – יתרגל בבית 😉"), n: "\"שבוע הבא Roleplay! שבוע טוב!\"" }
];

var S3 = [
  { c: titleSlide(3, '"התגבר על כל התנגדות"', "🛡️ מאגר התנגדויות • 3 אסטרטגיות • Roleplay • AI כמאמן"), n: "\"היום הכי כיפי! AI הופך ללקוח קשה – בעל מיני שאומר 'יקר', בעלת בוטיק שאומרת 'לא עכשיו'. ואתם מנסים למכור.\"" },
  { c: twoColSlide("10 ההתנגדויות הנפוצות",
    "💰 כסף ותזמון:", ["\"יקר לי\"", "\"לא עכשיו, אולי בשנה הבאה\"", "\"רוצה לראות עוד הצעות\"", "\"אין לי זמן לזה\"", "\"מה אם לא עובד?\""], "#F44336",
    "🖥️ מערכת ושינוי:", ["\"יש לי כבר מערכת/קופה\"", "\"צריך לדבר עם השותף/רו\"ח\"", "\"המעבר מסובך מדי\"", "\"למה Comax ולא המתחרה?\"", "\"העובדים שלי לא יסכימו\""], "#E8B931"
  ), n: "\"10 קלאסיקות. חילקתי לשתי קטגוריות: כסף/תזמון ומערכת/שינוי.\n\nמה חסר? [רשמו]. לכל אחת – 3 תשובות.\"" },
  { c: codeSlide("🧠 AI בונה תשובות",
    "אתה מומחה מכירות 20 שנות ניסיון + פסיכולוגיית מכירות.\nאתה מכיר את עולם הקמעונאות (מזון ואופנה) בישראל.\n\nאני סוכן Comax. לקוח (בעל מיניסופר / חנות בגדים)\nאומר: \"יקר לי\"\n\n3 אסטרטגיות:\n🔄 הפוך: שאלה שמשנה פרספקטיבה\n💎 ערך: ROI/חיסכון עם דוגמה מספרית מהענף\n🤝 רכך: הסכמה + צעד קטן\n\nלכל אחת:\n• משפט מילה במילה (טבעי! לא תסריט)\n• למה עובד פסיכולוגית\n• מתי להשתמש (פגישה או טלפון)\n• מה להגיד אחרי שהלקוח מגיב",
    "🆕 ביקשנו \"מתי – פגישה או טלפון\" + \"מה ההמשך\""
  ), n: "\"תפקיד כפול – מומחה מכירות ופסיכולוגיה. ומותאם לקמעונאות!\n\nשימו לב: ביקשנו 'מתי להשתמש – פגישה או טלפון'. כי בטלפון התגובה צריכה להיות קצרה יותר.\"" },
  { c: codeSlide("🥊 Roleplay – AI כלקוח קשה",
    "אתה לקוח בסימולציית מכירה.\n\nפרופיל: [בחר אחד]\n• דני, בעל רשת מיני מרקט 4 סניפים, חסכן\n• שרון, בעלת בוטיק אופנה 2 סניפים, עסוקה מאוד\n• מוחמד, בעל סופר שכונתי, חתום עם מתחרה\n• רונית, בעלת רשת ביגוד ספורט, מפחדת מטכנולוגיה\n\nכללים:\n• התנגד 4 פעמים לפני פתיחות\n• באמצע: \"מתחרה הציע זול יותר אתמול\"\n• בסוף: ציון 1-10, 3 טוב, 3 לשפר\n\n[אם בטלפון – הוסף: 'אני באמצע משהו, יש לך דקה']",
    "בחרו פרופיל → הכניסו → התחילו Roleplay!"
  ), n: "\"4 פרופילים מעולם המזון והאופנה. כל אחד עם אתגר שונה.\n\nשימו לב: הוספתי אופציה לטלפון – 'אני באמצע משהו, יש לך דקה'. כי זה מה שקורה בחיים.\n\n[10 דק׳ שיחה, ציון, החלפה]\"" },
  { c: breakSlide("אם AI נתן ציון נמוך – אל תיקחו אישית. הוא מחמיא יותר מהמנהל שלכם."), n: "\"הפסקה!\"" },
  { c: codeSlide("🧪 Pro: ניתוח פגישה/שיחה בדיעבד",
    "אתה מאמן מכירות. חוזר מ[פגישה / שיחת טלפון].\n\n• הלקוח: [סוג עסק – מיני/אופנה, מצב]\n• הוא אמר: [התנגדויות]\n• אני עניתי: [מה אמרתי]\n• תוצאה: [סגירה? דחייה? 'נדבר'? ניתוק?]\n\n1. ניתוח: מה נכון ומה הייתי עושה אחרת\n2. 3 תשובות טובות יותר להתנגדויות\n3. אם 'נדבר' / ניתוק – מה הפולו-אפ הנכון\n4. שיעור אחד לפעם הבאה\n\nתהיה ישיר. אל תחמיא.",
    "💡 כל פגישה/שיחה = שיעור. גם כשלא סוגרים."
  ), n: "\"הטכניקה הכי חזקה. אחרי כל פגישה או שיחת טלפון – ברכב, הזינו.\n\nגם אם הלקוח ניתק – AI ינתח למה ומה לעשות אחרת.\"" },
  { c: summarySlide([
    ["🛡️", "מאגר התנגדויות", "15 תשובות מוכנות – מזון ואופנה"],
    ["🥊", "Roleplay", "AI כלקוח + ציון – פגישה וטלפון"],
    ["📊", "ניתוח בדיעבד", "כל פגישה/שיחה = שיעור"]
  ], "כל התנגדות → AI ברכב. בונוס: 2 Roleplay בבית – פגישה אחת וטלפון אחד."), n: "\"מאגר, Roleplay, ניתוח. עובד גם בטלפון!\n\nשבוע הבא – כתיבה שמוכרת! ✍️\"" },
  { c: closingSlide("מפגש 4: \"כתיבה שמוכרת\"", "✍️", "ה-WhatsApp שלכם הולך לקבל שדרוג 😎"), n: "\"תביאו הצעת מחיר ישנה!\"" }
];

var S4 = [
  { c: titleSlide(4, '"כתיבה שמוכרת"', "✍️ פולו-אפ • WhatsApp • הצעות מחיר • Multi-shot • Persona Chain"), n: "\"מפגש 4. הכתיבה – שם כולנו מזניחים. מי שולח פולו-אפ אחרי כל שיחה? ... היום: טכניקות Pro.\"" },
  { c: codeSlide("🧪 Multi-shot: AI כותב בסגנון שלכם",
    "למד את הסגנון שלי מ-3 דוגמאות.\n\n3 הודעות WhatsApp שכתבתי ועבדו:\n\nדוגמה 1: \"[הודעה ששלחתם ללקוח מזון/אופנה שעבדה]\"\nדוגמה 2: \"[הודעה נוספת]\"\nדוגמה 3: \"[ועוד]\"\n\nבסגנון הזה כתוב הודעה חדשה:\n• לקוח: [בעל סופר / חנות בגדים]\n• מטרה: [לקבוע פגישה / פולו-אפ / חימום]\n\nשמור על הטון, האורך, הסגנון שלי.",
    "💡 AI כותב בסגנון שלכם – לא כרובוט. זה Pro level."
  ), n: "\"Multi-shot: במקום לתאר – להראות. 3 דוגמאות שעבדו. AI לומד ואז כותב כמוכם.\"" },
  { c: codeSlide("📱 פולו-אפ שעובד – 3 הודעות",
    "היה לי [פגישה / שיחת טלפון]:\n\nלקוח: [בעל רשת מיני 5 סניפים / בעלת בוטיק]\nדיברנו על: [מה הצגתי, מה עניין]\nהתנגדות: [מה אמר]\nסיכמנו: [צעד הבא]\n\n3 הודעות WhatsApp:\n\n1. מיד אחרי – סיכום חם, מזכיר מה הכי עניין\n2. יום לפני השיחה הבאה – תזכורת + ערך\n   (טיפ לענף שלו, חדשות רלוונטיות)\n3. אם לא עונה – לא רודף. שאלה שקל לענות.\n\nמקסימום 4 שורות כל הודעה. בלי 'בברכה'.",
    ""
  ), n: "\"לא הודעה אחת – סדרה. 3 הודעות.\n\nהודעה 2: מוסיף ערך. 'שמעתי שמחירי הסחורה עולים – חשבתי שיעניין'. עכשיו אתה יועץ, לא סוכן.\"" },
  { c: codeSlide("🔗 Persona Chain – AI בודק את AI",
    "שלב 1: כתוב הצעת מחיר / WhatsApp / פולו-אפ\n[AI כותב...]\n\n──────────────────\n\nשלב 2: עכשיו שכח שכתבת.\nאתה הלקוח – [בעל סופר חסכן / בעלת בוטיק עסוקה].\n\nקראת את ההודעה/ההצעה. תן ציון:\n• הייתי פותח? כן/לא ולמה\n• מה הרגשתי כלקוח?\n• מה היה גורם לי להגיב?\n• מה היה גורם למחוק?\n• תשכתב – גרסה שהייתי באמת מגיב אליה",
    "כותב → מבקר כלקוח → משכתב. 3 שכבות = יהלום."
  ), n: "\"הטכניקה הכי מתקדמת. AI כותב, ואז 'אתה הלקוח – מה חושב?'\n\nAI מבקר את עצמו. הגרסה השלישית = שנתיים אור מהראשונה.\"" },
  { c: breakSlide("בדקו WhatsApp. אולי מישהו כבר ענה 😏"), n: "\"הפסקה!\"" },
  { c: summarySlide([
    ["🎯", "Multi-shot", "AI כותב בסגנון שלכם"],
    ["🔗", "Persona Chain", "כותב → מבקר → משכתב"],
    ["📱", "4 תבניות", "פולו-אפ, WhatsApp, חימום, הצעה"]
  ], "כל כתיבה → AI. שלחו הודעת ערך ללקוח שלא דיברתם איתו חודש."), n: "\"Multi-shot, Persona Chain, תבניות.\n\nשבוע הבא – הגמר! 🏆\"" },
  { c: closingSlide("מפגש 5: \"הסוכן החכם\" – הגמר!", "🏆", "תחרות פרומפטים + ערכה אישית. מי שלא יבוא – AI ידע 🤖"), n: "\"הגמר! בואו מוכנים!\"" }
];

var S5 = [
  { c: titleSlide(5, '"הסוכן החכם"', "🏆 סימולציה מלאה • Mega Prompt • תחרות פרומפטים • ערכה אישית"), n: "\"המפגש האחרון! היום: Mega Prompt – פרומפט אחד שעושה הכל.\"" },
  { c: codeSlide("🧠 Mega Prompt – הנשק הסודי",
    "אתה עוזר AI למכירות Comax – ERP וקופות POS\nלקמעונאות מזון ואופנה.\n\nהלקוח: [שם, סוג עסק, גודל, מיקום]\nידוע: [מערכת נוכחית, מצב, איך הגעתי]\nמטרה: [דמו / הצעה / סגירה / קביעת פגישה]\nסוג אינטראקציה: [פגישה פיזית / שיחת טלפון]\n\nבנה חבילת הכנה מלאה:\n1. מחקר ענפי – 3 אתגרים, כאבים, שפה ענפית\n2. כרטיס לקוח – הזדמנות, כאבים, שאלות, התנגדויות\n3. תוכנית [פגישה 30 דק׳ / שיחה 10 דק׳]\n4. 3 התנגדויות צפויות × 3 אסטרטגיות\n5. 3 הודעות פולו-אפ WhatsApp\n6. דבר אחד לא להגיד + סימני אזהרה\n\nקורא ב-5 דק׳ לפני הפגישה/שיחה.",
    "פרומפט אחד = חבילה שלמה. דקה וחצי."
  ), n: "\"Mega Prompt. הכל בבת אחת. דקה וחצי – חבילה שלמה.\n\nשימו לב: הוספנו 'סוג אינטראקציה' – פגישה או טלפון. AI מתאים את התוכנית.\n\nזה הכלי שתשתמשו 90% מהזמן.\"" },
  { c: twoColSlide("איפה AI ואיפה אני?",
    "🤖 AI עושה:", ["מחקר ענפי", "ניסוח הודעות", "רעיונות לגישה", "תרגול התנגדויות", "ניתוח בדיעבד", "עובד 24/7"], "#4FC3F7",
    "🧑 אתם עושים:", ["קשר אישי ואמון", "טון הדיבור בטלפון", "אינטואיציה של סוכן", "גמישות בזמן אמת", "סגירת עסקאות", "קפה עם הלקוח ☕"], GOLD
  ), n: "\"AI מכין. אתם סוגרים. ביחד – בלתי ניתנים לעצירה.\n\nAI לא ישמע את הטון של הלקוח בטלפון. אבל יוודא שאתם מוכנים.\"" },
  { c: summarySlide([
    ["🧠", "Mega Prompt", "הכל בפרומפט אחד – פגישה וטלפון"],
    ["🛡️", "ארגז כלים מלא", "מחקר, כרטיס, תוכנית, התנגדויות, כתיבה"],
    ["🏆", "ספר הפרומפטים", "כל הפרומפטים המנצחים של הצוות"]
  ], "אתגר 30 יום: AI כל יום – לפני כל פגישה ושיחה.\nשתפו ב-\"AI Wins\". בעוד חודש ניפגש לבדוק."), n: "\"30 יום – AI כל יום. לפני כל פגישה, לפני כל טלפון.\n\n'התחלנו עם מה AI עושה בשבילי. עכשיו: מה אני עושה עם AI. תשובתי: כמעט הכל.'\n\nתודה! אתם אלופים! 🚀\"" },
  { c: React.createElement(CenterSlide, { gap: 20 },
    React.createElement(Badge),
    React.createElement(Txt, { size: 28, bold: true, center: true }, "🎓 סיום הסדנה!"),
    React.createElement(Divider),
    React.createElement("div", { style: { fontSize: 48 } }, "🚀"),
    React.createElement(GoldBox, null,
      React.createElement(Txt, { size: 16, center: true }, "התחלנו: \"מה AI יכול בשבילי?\""),
      React.createElement(Txt, { size: 16, color: GOLD, bold: true, center: true }, "עכשיו: \"מה אני יכול עם AI?\""),
      React.createElement(Txt, { size: 16, center: true }, "תשובתי: כמעט הכל.")
    )
  ), n: "\"תודה לכולם! 🚀\"" }
];

var SESSIONS = [
  { id: 1, title: "AI זה לא מדע בדיוני", emoji: "💡", sub: "שבירת חסמים", slides: S1 },
  { id: 2, title: "תכין את הפגישה ב-5 דקות", emoji: "🔍", sub: "שרשרת פרומפטים", slides: S2 },
  { id: 3, title: "התגבר על כל התנגדות", emoji: "🛡️", sub: "Roleplay + התנגדויות", slides: S3 },
  { id: 4, title: "כתיבה שמוכרת", emoji: "✍️", sub: "Multi-shot + Persona Chain", slides: S4 },
  { id: 5, title: "הסוכן החכם", emoji: "🏆", sub: "Mega Prompt + ערכה", slides: S5 }
];

/* ======= SCREENS ======= */

function WaitingScreen() {
  var _d = useState(0), dots = _d[0], setDots = _d[1];
  var _t = useState(0), tip = _t[0], setTip = _t[1];
  var _tm = useState(""), time = _tm[0], setTime = _tm[1];

  useEffect(function() { var i = setInterval(function() { setDots(function(d) { return (d + 1) % 4; }); }, 800); return function() { clearInterval(i); }; }, []);
  useEffect(function() { var i = setInterval(function() { setTip(function(t) { return t + 1; }); }, 6000); return function() { clearInterval(i); }; }, []);
  useEffect(function() { var u = function() { setTime(new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })); }; u(); var i = setInterval(u, 1000); return function() { clearInterval(i); }; }, []);

  var tips = ["💡 AI יכול להכין פגישה ב-5 דקות", "🤖 AI לא ישן ולא מתלונן על בונוס", "📱 וודאו ש-ChatGPT או Claude מותקנים", "☕ בינתיים קפה. ל-AI לא צריך.", "🧠 סוכן + AI = צוות בלתי ניתן לעצירה", "📞 עובד גם לפני שיחת טלפון!"];

  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',sans-serif", direction: "rtl" } },
    React.createElement("div", { style: { textAlign: "center", maxWidth: 420, padding: 24 } },
      React.createElement("div", { style: { marginBottom: 48 } },
        React.createElement("div", { style: { width: 90, height: 90, borderRadius: 45, background: "linear-gradient(135deg," + GOLD + ",#F7D060)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, color: "#1a1a2e" } }, "C"),
        React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: GOLD, letterSpacing: 2 } }, "COMAX × AI"),
        React.createElement("div", { style: { fontSize: 16, color: "#888", marginTop: 6 } }, "סדנת AI למכירות שטח")
      ),
      React.createElement("div", { style: { fontSize: 52, fontWeight: 300, color: "#fff", marginBottom: 40, fontVariantNumeric: "tabular-nums", fontFamily: "monospace" } }, time),
      React.createElement("div", { style: { marginBottom: 48 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 } },
          [0, 1, 2].map(function(i) { return React.createElement("div", { key: i, style: { width: 12, height: 12, borderRadius: 6, background: GOLD, opacity: (dots + i) % 4 === 0 ? 1 : 0.25, transition: "opacity 0.4s" } }); })
        ),
        React.createElement("div", { style: { fontSize: 20, color: "#aaa" } }, "ממתינים למנחה" + ".".repeat(dots))
      ),
      React.createElement("div", { style: { background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.15)", borderRadius: 16, padding: "16px 24px" } },
        React.createElement("div", { style: { fontSize: 15, color: "#888" } }, tips[tip % tips.length])
      )
    )
  );
}

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
        React.createElement("button", { onClick: go, style: { background: GOLD, color: "#1a1a2e", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer" } }, "כניסה")
      ),
      err ? React.createElement("div", { style: { color: "#F44336", fontSize: 14 } }, "סיסמה שגויה") : null
    )
  );
}

function Dashboard(props) {
  var base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  var viewerUrl = base + "?view=true";
  var _c = useState(false), copied = _c[0], setCopied = _c[1];

  function copy() {
    var ta = document.createElement("textarea");
    ta.value = viewerUrl;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 3000);
  }

  var btns = SESSIONS.map(function(s) {
    return React.createElement("div", {
      key: s.id,
      onClick: function() { props.onStart(s.id); },
      style: { display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a4a", borderRadius: 14, padding: "16px 20px", cursor: "pointer", textAlign: "right" }
    },
      React.createElement("div", { style: { fontSize: 32 } }, s.emoji),
      React.createElement("div", { style: { flex: 1 } },
        React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "#fff" } }, "מפגש " + s.id + ": \"" + s.title + "\""),
        React.createElement("div", { style: { fontSize: 13, color: "#888" } }, s.sub + " • " + s.slides.length + " שקפים")
      ),
      React.createElement("div", { style: { fontSize: 14, color: GOLD, fontWeight: 700 } }, "▶ התחל")
    );
  });

  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, fontFamily: "'Segoe UI',sans-serif", direction: "rtl", padding: 24 } },
    React.createElement("div", { style: { maxWidth: 700, margin: "0 auto" } },
      React.createElement("div", { style: { textAlign: "center", marginBottom: 28 } },
        React.createElement("div", { style: { fontSize: 14, color: GOLD, letterSpacing: 2, fontWeight: 700 } }, "🎤 מצב מנחה"),
        React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 8 } }, "סדנת AI למכירות שטח – Comax")
      ),
      React.createElement("div", { style: { background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.2)", borderRadius: 14, padding: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 4 } }, "🔗 לינק לסוכנים:"),
          React.createElement("div", { style: { fontSize: 12, color: "#aaa", wordBreak: "break-all" } }, viewerUrl)
        ),
        React.createElement("button", { onClick: copy, style: { background: copied ? "#4CAF50" : GOLD, color: "#1a1a2e", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" } }, copied ? "✅ הועתק!" : "📋 העתק")
      ),
      copied ? React.createElement("div", { style: { background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 10, padding: "10px 16px", marginBottom: 16, textAlign: "center" } },
        React.createElement("div", { style: { fontSize: 14, color: "#4CAF50", fontWeight: 600 } }, "✅ הלינק הועתק! שלחו בוואטסאפ לסוכנים")
      ) : React.createElement("div", { style: { marginBottom: 16 } }),
      React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 } }, "בחר מפגש:"),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, btns)
    )
  );
}

function SlideView(props) {
  var _c = useState(0), cur = _c[0], setCur = _c[1];
  var _n = useState(false), notes = _n[0], setNotes = _n[1];
  var ses = SESSIONS.find(function(s) { return s.id === props.session; });
  var sl = ses.slides;
  var s = sl[cur];
  var isP = props.isP;

  useEffect(function() {
    if (!isP) return;
    function h(e) {
      if (e.key === "ArrowLeft") setCur(function(p) { return Math.min(p + 1, sl.length - 1); });
      if (e.key === "ArrowRight") setCur(function(p) { return Math.max(p - 1, 0); });
    }
    window.addEventListener("keydown", h);
    return function() { window.removeEventListener("keydown", h); };
  }, [isP, sl.length]);

  var dots = sl.map(function(_, i) {
    return React.createElement("div", {
      key: i,
      onClick: isP ? function() { setCur(i); } : undefined,
      style: { width: i === cur ? 20 : 7, height: 7, borderRadius: 4, background: i === cur ? GOLD : "#333", cursor: isP ? "pointer" : "default", transition: "all 0.3s" }
    });
  });

  var navPresenter = React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 14 } },
    React.createElement("button", { onClick: function() { setCur(function(p) { return Math.min(p + 1, sl.length - 1); }); }, style: { background: cur < sl.length - 1 ? GOLD : "#333", color: cur < sl.length - 1 ? "#1a1a2e" : "#666", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" } }, "הבא ←"),
    React.createElement("button", { onClick: function() { setNotes(!notes); }, style: { background: notes ? "rgba(232,185,49,0.2)" : "rgba(255,255,255,0.06)", color: notes ? GOLD : "#888", border: "1px solid " + (notes ? "rgba(232,185,49,0.4)" : "#333"), borderRadius: 10, padding: "10px 18px", fontSize: 14, cursor: "pointer" } }, notes ? "🎤 הסתר" : "🎤 הערות"),
    React.createElement("button", { onClick: function() { setCur(function(p) { return Math.max(p - 1, 0); }); }, style: { background: cur > 0 ? "rgba(255,255,255,0.1)" : DARK, color: cur > 0 ? "#ccc" : "#333", border: "1px solid #333", borderRadius: 10, padding: "10px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" } }, "→ הקודם")
  );

  var navViewer = React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 12, marginTop: 14 } },
    React.createElement("button", { onClick: function() { setCur(function(p) { return Math.min(p + 1, sl.length - 1); }); }, style: { background: "rgba(255,255,255,0.06)", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "8px 24px", fontSize: 14, cursor: "pointer" } }, "הבא ←"),
    React.createElement("button", { onClick: function() { setCur(function(p) { return Math.max(p - 1, 0); }); }, style: { background: "rgba(255,255,255,0.06)", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "8px 24px", fontSize: 14, cursor: "pointer" } }, "→ הקודם")
  );

  var notesPanel = isP && notes && s.n ? React.createElement("div", { style: { maxWidth: 960, margin: "12px auto 0", padding: "0 16px 24px" } },
    React.createElement("div", { style: { background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.2)", borderRadius: 14, padding: 20 } },
      React.createElement("div", { style: { fontSize: 14, color: GOLD, fontWeight: 700, marginBottom: 10, textAlign: "right" } }, "🎤 הערות למנחה:"),
      React.createElement("div", { style: { fontSize: 15, color: "#ccc", lineHeight: 2, textAlign: "right", whiteSpace: "pre-wrap", direction: "rtl" } }, s.n)
    )
  ) : null;

  return React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: DARK, fontFamily: "'Segoe UI',sans-serif", direction: "rtl" } },
    React.createElement("div", { style: { width: "100%", maxWidth: 960, margin: "0 auto", padding: "16px 16px 0" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
          React.createElement("div", { style: { fontSize: 12, color: GOLD, fontWeight: 700 } }, "COMAX"),
          React.createElement("div", { style: { fontSize: 12, color: "#555" } }, "|"),
          React.createElement("div", { style: { fontSize: 12, color: "#888" } }, "מפגש " + props.session),
          isP ? React.createElement("div", { style: { fontSize: 11, color: "#1a1a2e", background: GOLD, padding: "2px 8px", borderRadius: 6, fontWeight: 700, marginRight: 8 } }, "מנחה") : null
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("div", { style: { fontSize: 12, color: "#555" } }, (cur + 1) + "/" + sl.length),
          isP ? React.createElement("button", { onClick: props.onBack, style: { fontSize: 11, color: "#666", background: "none", border: "1px solid #333", borderRadius: 6, padding: "4px 10px", cursor: "pointer" } }, "🔙 חזרה") : null
        )
      ),
      React.createElement("div", { style: { background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 18, width: "100%", aspectRatio: "16/9", padding: 36, boxSizing: "border-box", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid #2a2a4a", overflow: "hidden", position: "relative" } },
        React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: 100, height: 100, background: "radial-gradient(circle at top left,rgba(232,185,49,0.08),transparent)" } }),
        React.createElement("div", { style: { height: "100%", position: "relative", zIndex: 1 } }, s.c)
      ),
      isP ? navPresenter : navViewer,
      React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 5, marginTop: 10, flexWrap: "wrap", paddingBottom: 8 } }, dots)
    ),
    notesPanel
  );
}

/* ======= MAIN APP ======= */

export default function App() {
  var _p = useState(false), isP = _p[0], setIsP = _p[1];
  var _s = useState(null), ses = _s[0], setSes = _s[1];
  var _v = useState(null), vSes = _v[0], setVSes = _v[1];

  var params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  var isViewer = params ? params.get("view") === "true" : false;

  useEffect(function() {
    if (!isViewer) return;
    function check() {
      try {
        window.storage.get("active_session", true).then(function(r) {
          if (r && r.value) { setVSes(parseInt(r.value)); }
        }).catch(function() {});
      } catch (e) {}
    }
    check();
    var i = setInterval(check, 2000);
    return function() { clearInterval(i); };
  }, [isViewer]);

  function start(id) {
    setSes(id);
    try { window.storage.set("active_session", String(id), true).catch(function() {}); } catch (e) {}
  }

  function back() {
    setSes(null);
    try { window.storage.set("active_session", "0", true).catch(function() {}); } catch (e) {}
  }

  if (isViewer) {
    if (vSes && vSes > 0) { return React.createElement(SlideView, { session: vSes, isP: false, onBack: function() {} }); }
    return React.createElement(WaitingScreen);
  }

  if (!isP) { return React.createElement(LoginScreen, { onLogin: function() { setIsP(true); } }); }
  if (ses) { return React.createElement(SlideView, { session: ses, isP: true, onBack: back }); }
  return React.createElement(Dashboard, { onStart: start });
}