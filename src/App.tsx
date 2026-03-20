import { useState, useEffect, useRef } from "react";

// ===================== CONFIG =====================
const PASS = "dvir1971";
const G = "#E8B931";
const BG = "#0f0f1a";
const CARD = "linear-gradient(145deg,#1a1a2e,#16213e)";

// ===================== SLIDE DATA =====================
// Each session: { title, subtitle, emoji, slides: [{ content: JSX, notes: string }] }

function T({ children, c = "#fff", s = 16, w = 400, a = "right" }) {
  return <div style={{ fontSize: s, fontWeight: w, color: c, textAlign: a, direction: "rtl" }}>{children}</div>;
}

function Box({ children, bg = "rgba(232,185,49,0.08)", border = "rgba(232,185,49,0.2)", p = 20, r = 14 }) {
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: r, padding: p }}>{children}</div>;
}

function Cols({ children, gap = 16 }) {
  return <div style={{ display: "flex", gap, flex: 1, direction: "rtl" }}>{children}</div>;
}

function Col({ children, bg, border, flex = 1 }) {
  return <div style={{ flex, background: bg || "rgba(255,255,255,0.03)", border: `1px solid ${border || "#2a2a4a"}`, borderRadius: 14, padding: 16 }}>{children}</div>;
}

// SESSION 1 SLIDES
const S1 = [
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
        <div style={{ fontSize: 18, color: G, letterSpacing: 3, fontWeight: 700 }}>COMAX × AI</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", textAlign: "center" }}>סדנת AI למכירות שטח</div>
        <div style={{ width: 80, height: 4, background: `linear-gradient(90deg,${G},#F7D060)`, borderRadius: 2 }} />
        <div style={{ fontSize: 22, color: "#ccc" }}>מפגש 1 מתוך 5</div>
        <div style={{ fontSize: 28, color: G, fontWeight: 700 }}>"AI זה לא מדע בדיוני"</div>
        <div style={{ fontSize: 14, color: "#999", marginTop: 16 }}>💡 שבירת חסמים • הדלקת מוטיבציה • הכלי הראשון שלכם</div>
      </div>
    ),
    notes: `[פתיחה - עמוד על הבמה, חייך]\n\n"בוקר טוב לכולם! אז... הבוס אמר לכם שאתם הולכים לסדנת AI, ואני בטוח שחלק מכם חשבו: 'יופי, עוד הרצאה שאני יכול לישון בה עם העיניים פתוחות.'\n\nאז יש לי חדשות: היום אף אחד לא ישן. כי היום אנחנו לא מדברים על AI – אנחנו משתמשים ב-AI. על לקוחות אמיתיים שלכם. בזמן אמת.\n\nואם בסוף המפגש הזה לא תגידו 'רגע, זה באמת שימושי' – אני מתחייב לשלם לכם קפה. לא באמת, אבל נעים לדמיין."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
        <T s={28} w={800} c={G}>מה בתוכנית היום?</T>
        <div style={{ marginTop: 24 }}>
          {[{ t: "15 דק׳", i: "👋", n: "פתיחה", d: "סיבוב שולחן + ציפיות" },{ t: "20 דק׳", i: "🎪", n: "הדגמה חיה", d: "AI פוגש לקוח קשה של Comax" },{ t: "25 דק׳", i: "💪", n: "תרגיל 1", d: "הלקוח שלכם – פרומפט ראשון" },{ t: "15 דק׳", i: "🧠", n: "5 כללי זהב", d: "איך לדבר עם AI בלי להישמע מטומטם" },{ t: "20 דק׳", i: "🔥", n: "תרגיל 2", d: "שדרוג פרומפטים – לפני ואחרי" },{ t: "15 דק׳", i: "🎯", n: "סיכום", d: "כלי יומיומי + משימה לשבוע" }].map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 28 }}>{x.i}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{x.n}</div><div style={{ fontSize: 14, color: "#aaa" }}>{x.d}</div></div>
              <div style={{ fontSize: 13, color: G, fontWeight: 600 }}>{x.t}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    notes: `"הנה מה שעומד לקרות. שימו לב – אין פה 'הרצאה משעממת על בינה מלאכותית'. מה שכן יש: תרגילים על לקוחות אמיתיים שלכם.\n\nיש פה מישהו שמכיר את ההרגשה של לשבת מול לקוח ולא לדעת איך לפתוח? מעולה. היום ניתן לכם כלי שחושב אחורה בשבילכם, אבל לפני הפגישה."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
        <div style={{ fontSize: 64 }}>🤔</div>
        <T s={28} w={800} c={G} a="center">סיבוב פתיחה</T>
        <T s={20} c="#ccc" a="center">ספרו בשני משפטים:</T>
        <Box><T s={20} c="#fff" a="right">
          <span style={{ color: G, fontWeight: 700 }}>1.</span> מה אתם חושבים על AI?{"\n"}
          <span style={{ color: G, fontWeight: 700 }}>2.</span> מתי בפעם האחרונה הרגשתם "הלוואי שמישהו היה עוזר לי"?
        </T></Box>
        <T s={14} c="#888" a="center">⏱️ משפט אחד כל אחד – בלי נאומים!</T>
      </div>
    ),
    notes: `"סיבוב מהיר. כל אחד – שני דברים: מה חושב על AI, ומתי הרגיש 'הלוואי שמישהו עוזר'. ואני מדבר על עבודה, לא על להרכיב ארון מאיקאה.\n\n[30 שניות כל אחד. רשום תשובות מעניינות על הלוח]\n\n'מעולה. שמעתי סקפטיות, התלהבות, ובלבול. אף אחד לא טועה לגמרי. בואו נראה מה באמת קורה.'"`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
        <T s={28} w={800} c={G}>בואו נהיה כנים: מה AI יכול ומה לא</T>
        <div style={{ display: "flex", gap: 20, flex: 1, marginTop: 20 }}>
          <Col bg="rgba(76,175,80,0.1)" border="rgba(76,175,80,0.3)">
            <T s={18} w={700} c="#4CAF50">✅ AI מעולה ב:</T>
            <div style={{ marginTop: 12 }}>{["לנסח טקסטים ומיילים","לחקור ענף/לקוח תוך שניות","לתת רעיונות וזוויות חדשות","לתרגל התנגדויות (roleplay)","לסכם ולארגן מידע","לעבוד 24/7 בלי קפה"].map((t,i)=><T key={i} s={14} c="#ddd">• {t}</T>)}</div>
          </Col>
          <Col bg="rgba(244,67,54,0.1)" border="rgba(244,67,54,0.3)">
            <T s={18} w={700} c="#F44336">❌ AI גרוע ב:</T>
            <div style={{ marginTop: 12 }}>{["לבנות יחסים אישיים","להרגיש את הלקוח (שפת גוף)","אינטואיציה של סוכן מנוסה","לשתות קפה עם הלקוח","לסגור עסקה בלחיצת יד","לדעת שדני מרוגז כי ריבו עם אשתו"].map((t,i)=><T key={i} s={14} c="#ddd">• {t}</T>)}</div>
          </Col>
        </div>
      </div>
    ),
    notes: `"AI זה לא ג'יימס בונד של מכירות. הוא לא יסגור עסקאות, לא יתקשר ללקוח, ולא ישב עם בעל מסעדה לאכול חומוס.\n\n[הצבע ירוק] אבל הוא עושה את כל העבודה המשעממת שאתם לא אוהבים.\n[הצבע אדום] ומה הוא לא יכול? בדיוק מה שאתם הכי טובים בו.\n\nהמשוואה: AI עושה הכנה. אתם עושים קסם. ביחד – בלתי ניתנים לעצירה."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 32 }}>
        <div style={{ fontSize: 48, color: "rgba(232,185,49,0.3)" }}>"</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.6 }}>
          AI לא יחליף סוכן מכירות.<br/><span style={{ color: G }}>סוכן שמשתמש ב-AI</span><br/>יחליף סוכן שלא.
        </div>
        <div style={{ fontSize: 48, color: "rgba(232,185,49,0.3)" }}>"</div>
        <T s={14} c="#888" a="center">(ואל תגידו שלא הזהרנו אתכם 😏)</T>
      </div>
    ),
    notes: `[5 שניות שקט]\n\n"קראו את זה. תזכרו את זה. זה לא איום – זה הזדמנות. הסוכנים שילמדו להשתמש ב-AI לפני כולם יסגרו יותר עסקאות.\n\nועכשיו, בואו נפסיק לדבר ונראה בפעולה. מי רוצה להתנדב?"`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
        <div style={{ fontSize: 64 }}>🎪</div>
        <T s={32} w={800} c={G} a="center">הדגמה חיה</T>
        <T s={20} c="#ccc" a="center">עכשיו צריך מתנדב אמיץ אחד.</T>
        <Box>
          <T s={18} c="#fff"><span style={{color:G}}>המשימה:</span> ספרו על הלקוח הכי קשה שלכם. שני משפטים.</T>
          <T s={18} c="#fff"><span style={{color:G}}>אני:</span> אכניס ל-AI בזמן אמת.</T>
          <T s={18} c="#fff"><span style={{color:G}}>ביחד:</span> נראה מה יוצא.</T>
        </Box>
        <T s={14} c="#888" a="center">🎤 מי קודם? הביישן ביותר מתנדב ראשון!</T>
      </div>
    ),
    notes: `"אני צריך מתנדב. מישהו עם לקוח מעצבן.\n\n[אם אף אחד:] 'מי שלא מתנדב – AI ימליץ לי בכל מקרה, עדיף שתשלטו בתהליך.'\n\n[כשמתנדב:] 'מעולה! ספר: מי הלקוח, מה עושה, למה מסובך? שני משפטים, כאילו מספר לחבר בקפה.'\n\n[הקלד בזמן אמת על המסך]"`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
        <T s={24} w={800} c={G}>🖥️ הפרומפט שאני מקליד עכשיו:</T>
        <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 20, flex: 1, fontFamily: "monospace", border: "1px solid #333", marginTop: 16, overflow: "auto" }}>
          <div style={{ fontSize: 14, color: G, marginBottom: 12 }}>PROMPT:</div>
          <T s={15} c="#ddd">
            {"אתה יועץ מכירות מומחה בתחום מערכות ERP/POS\nלקמעונאות ומסעדנות.\n\nלקוח: [מה שהסוכן אמר]\n\nתן לי:\n1. שלוש שאלות חכמות שיגרמו לו לחשוב מחדש\n   (לא אגרסיביות)\n2. שני כאבים שכנראה יש לו ולא מודע אליהם\n3. משפט פתיחה אחד שיפתח את השיחה מחדש"}
          </T>
        </div>
        <T s={13} c="#888" a="center">💡 שימו לב: תפקיד → הקשר → משימה ברורה → פורמט</T>
      </div>
    ),
    notes: `[מקליד בזמן אמת]\n\n"שימו לב: לא כותב 'עזור לי למכור'. נותן תפקיד, הקשר, משימה ברורה.\n\n[הרץ, קרא בקול]\n'מה אתם אומרים? רלוונטי?'\n\n[פרומפט המשך:] 'עכשיו גישה אחרת – יותר רכה, מבוססת סיפור לקוח דומה.'\n\n'ראיתם? אם לא אהבתם – בקשו אחרת. AI לא נעלב.'"`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
        <T s={24} w={800} c={G}>💪 תרגיל: הלקוח שלכם</T>
        <T s={15} c="#ccc">חשבו על לקוח אמיתי – מישהו שתפגשו השבוע, או שאיבדתם.</T>
        <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 18, fontFamily: "monospace", border: "1px solid #333", margin: "12px 0", flex: 1, overflow: "auto" }}>
          <T s={14} c={G}>📋 העתיקו:</T>
          <T s={14} c="#ddd">
            {"אני סוכן מכירות של Comax – מערכות ERP וקופות POS\nלקמעונאות, מסעדנות, ואופנה.\n\nהלקוח שלי: [תאר בשני משפטים]\nהאתגר: [מה קשה לי איתו?]\n\nעזור לי עם:\n1. שלוש שאלות פתיחה מעניינות\n2. שתי נקודות כאב שהוא לא מודע אליהן\n3. הצעה לפתיחת השיחה הבאה"}
          </T>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[{t:"5 דק׳",d:"כתבו וקבלו תשובה"},{t:"10 דק׳",d:"עבודה בזוגות – שפרו"},{t:"10 דק׳",d:"3 מתנדבים משתפים"}].map((s,i)=>(
            <div key={i} style={{flex:1,background:"rgba(232,185,49,0.08)",border:"1px solid rgba(232,185,49,0.2)",borderRadius:12,padding:"12px 16px",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:G}}>{s.t}</div><div style={{fontSize:13,color:"#bbb",marginTop:4}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    notes: `"עכשיו תורכם! תוציאו טלפונים – כן, רשות רשמית להסתכל בטלפון.\n\n[5 דק׳ עצמאי] 'אל תחפשו מושלם – תכתבו ותראו מה קורה.'\n[10 דק׳ זוגות] 'תראו לשכן, תנו פידבק.'\n[10 דק׳ שיתוף] 'מי קיבל משהו מפתיע?'"`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
        <div style={{ fontSize: 72 }}>☕</div>
        <T s={32} w={800} c={G} a="center">הפסקה – 10 דקות</T>
        <T s={18} c="#aaa" a="center">קפה, שירותים, ולבדוק אם ה-AI עונה גם בלי Wi-Fi</T>
        <T s={14} c="#666" a="center">(ספוילר: לא)</T>
      </div>
    ),
    notes: `"הפסקה! 10 דקות. ואם רוצים להתמכר – תנסו עוד פרומפט."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
        <div style={{ fontSize: 64 }}>🏆</div>
        <T s={32} w={800} c={G} a="center">5 כללי הזהב של פרומפט טוב</T>
        <T s={18} c="#aaa" a="center">(או: "איך לדבר עם AI בלי שירגיש שאתה מדבר עם קיר")</T>
      </div>
    ),
    notes: `"למה חלק קיבלו תשובות מעולות וחלק פחות? כמו פגישת מכירה: אם נכנס עם 'רוצה לקנות?' – לא נמכור. אם נכנס מוכן – נסגור.\n\n5 כללים. פשוטים. בואו."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl", gap: 16 }}>
        <T s={24} w={800} c={G}>כללים 1-2</T>
        {[{n:"1️⃣ תן תפקיד",g:"\"אתה מנהל מכירות בכיר בתחום ה-POS עם 15 שנות ניסיון\"",b:"\"עזור לי למכור\""},{n:"2️⃣ תן הקשר",g:"\"רשת של 5 חנויות אופנה, עובד עם אקסלים, שוקל מערכת חדשה\"",b:"\"יש לי לקוח\""}].map((r,i)=>(
          <Box key={i}>
            <T s={20} w={700} c={G}>{r.n}</T>
            <div style={{display:"flex",gap:16,marginTop:12}}>
              <div style={{flex:1,background:"rgba(76,175,80,0.1)",borderRadius:10,padding:12}}><T s={13} c="#4CAF50" w={600}>✅ טוב:</T><T s={14} c="#ddd">{r.g}</T></div>
              <div style={{flex:1,background:"rgba(244,67,54,0.1)",borderRadius:10,padding:12}}><T s={13} c="#F44336" w={600}>❌ גרוע:</T><T s={14} c="#ddd">{r.b}</T></div>
            </div>
          </Box>
        ))}
      </div>
    ),
    notes: `"כלל 1: תן תפקיד. כמו תדריך לעובד חדש – 'אתה מומחה POS עם 15 שנות ניסיון'.\n\nכלל 2: תן הקשר. AI לא קורא מחשבות. 'יש לי לקוח' = גנרי. 'רשת 5 חנויות אופנה עם אקסלים' = עכשיו מדברים."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl", gap: 10 }}>
        <T s={24} w={800} c={G}>כללים 3-4-5</T>
        <Box><T s={18} w={700} c={G}>3️⃣ תן משימה ברורה</T><div style={{display:"flex",gap:12,marginTop:8}}><T s={14} c="#4CAF50">✅ "כתוב 3 שאלות פתיחה שלא נשמעות מכירתיות"</T><T s={14} c="#F44336">❌ "עזור לי עם הפגישה"</T></div></Box>
        <Box><T s={18} w={700} c={G}>4️⃣ תן פורמט</T><T s={15} c="#ccc">"בנקודות" • "במשפט אחד" • "כהודעת WhatsApp" • "כטבלה"</T></Box>
        <Box><T s={18} w={700} c={G}>5️⃣ חזור ושפר 🔄</T><T s={15} c="#ccc">"תהיה יותר ישיר" • "תתמקד רק בעלות" • "תנסח כאילו שולח בוואטסאפ"</T></Box>
        <div style={{background:"linear-gradient(135deg,rgba(232,185,49,0.15),rgba(232,185,49,0.05))",borderRadius:14,padding:14,textAlign:"center"}}><T s={16} c={G} w={600} a="center">💡 AI לא נעלב. תבקשו גרסה אחרת. ועוד אחת. ועוד.</T></div>
      </div>
    ),
    notes: `"כלל 3: משימה ברורה. לא 'עזור לי' – '3 שאלות פתיחה'.\nכלל 4: פורמט. WhatsApp? תגידו. מייל? תגידו.\nכלל 5: חזרו ושפרו! AI לא נעלב – תנסו את זה עם השותף שלכם..."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
        <T s={24} w={800} c={G}>🔥 תרגיל: שדרגו את הפרומפט</T>
        <div style={{background:"rgba(244,67,54,0.1)",borderRadius:14,padding:20,margin:"16px 0",border:"1px solid rgba(244,67,54,0.3)"}}>
          <T s={14} c="#F44336" w={600}>❌ הפרומפט הגרוע:</T>
          <T s={20} c="#ddd">"תכתוב לי מייל ללקוח"</T>
        </div>
        <T s={16} c={G}>⬇️ עכשיו נוסיף ביחד: תפקיד, הקשר, משימה, פורמט...</T>
        <div style={{background:"rgba(76,175,80,0.1)",borderRadius:14,padding:20,border:"1px solid rgba(76,175,80,0.3)",flex:1,display:"flex",alignItems:"center",justifyContent:"center",marginTop:12}}>
          <T s={18} c="#4CAF50" a="center">✅ הפרומפט המשודרג נכתב ביחד, בזמן אמת!</T>
        </div>
        <T s={13} c="#888" a="center">אחרי: כל אחד משדרג את הפרומפט שלו מתרגיל 1</T>
      </div>
    ),
    notes: `"'תכתוב לי מייל ללקוח' – למה גרוע? [חכה לקהל]\n\nבואו נתקן ביחד. מי נותן תפקיד? הקשר? משימה? פורמט?\n\n[בנה בזמן אמת, הרץ, הצג]\n\n'ראיתם את ההבדל? 30 שניות נוספות – תוצאה שונה לחלוטין.'\n\nעכשיו – שדרגו את הפרומפט מתרגיל 1 לפי 5 הכללים. 5 דקות."`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
        <T s={24} w={800} c={G}>🎯 מה לוקחים הביתה?</T>
        <div style={{display:"flex",flexDirection:"column",gap:12,margin:"16px 0"}}>
          {[{i:"📱",t:"אפליקציה מותקנת",d:"ChatGPT או Claude על הסמארטפון"},{i:"📋",t:"תבנית פרומפט בסיסית",d:"נשלחת בוואטסאפ מיד אחרי המפגש"},{i:"🧠",t:"5 כללי הזהב",d:"תפקיד → הקשר → משימה → פורמט → שפר"}].map((x,i)=>(
            <div key={i} style={{display:"flex",gap:14,alignItems:"center",background:"rgba(232,185,49,0.06)",borderRadius:12,padding:"14px 18px",border:"1px solid rgba(232,185,49,0.15)"}}>
              <div style={{fontSize:28}}>{x.i}</div><div style={{flex:1}}><T s={16} w={700}>{x.t}</T><T s={13} c="#aaa">{x.d}</T></div>
            </div>
          ))}
        </div>
        <div style={{background:`linear-gradient(135deg,${G},#F7D060)`,borderRadius:14,padding:20}}>
          <div style={{fontSize:18,fontWeight:800,color:"#1a1a2e",textAlign:"right",direction:"rtl"}}>📌 משימה לשבוע הבא:</div>
          <div style={{fontSize:15,color:"#1a1a2e",textAlign:"right",direction:"rtl",lineHeight:1.8}}>השתמשו ב-AI לפחות פעם אחת ביום לפני פגישה.{"\n"}שלחו ל"AI Wins" דוגמה אחת שעבדה.</div>
        </div>
      </div>
    ),
    notes: `"סיכום! 3 דברים: ראינו מה AI יכול, כתבנו פרומפטים על לקוחות אמיתיים, למדנו 5 כללים.\n\n1. אפליקציה – מי שלא התקין, עכשיו.\n2. תבנית – שולח לקבוצה.\n3. 5 כללים – תפקיד, הקשר, משימה, פורמט, שפר.\n\nמשימה: כל יום לפני פגישה – דקה עם AI. שבוע הבא: הכנת פגישה ב-5 דקות! 🚀"`
  },
  {
    content: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
        <div style={{ fontSize: 18, color: G, letterSpacing: 3, fontWeight: 700 }}>COMAX × AI</div>
        <T s={32} w={800} a="center">נתראה בשבוע הבא!</T>
        <div style={{ width: 60, height: 3, background: G, borderRadius: 2 }} />
        <T s={20} c="#ccc" a="center">מפגש 2: "תכין את הפגישה ב-5 דקות"</T>
        <div style={{ fontSize: 48, marginTop: 16 }}>🚀</div>
        <T s={14} c="#666" a="center">בינתיים – נסו, שתפו, ותשאלו את ה-AI הכל. הוא לא ילך לספר למנהל.</T>
      </div>
    ),
    notes: `"שבוע טוב! AI Wins – תשתפו. ואם יש שאלות – אפשר לשאול אותי או את ה-AI. הוא עונה מהר יותר, אני לא נעלב."`
  }
];

// SESSION 2-5 placeholders (same structure)
const S2 = [
  { content: <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20}}><div style={{fontSize:18,color:G,letterSpacing:3,fontWeight:700}}>COMAX × AI</div><div style={{fontSize:40,fontWeight:800,color:"#fff",textAlign:"center"}}>סדנת AI למכירות שטח</div><div style={{width:80,height:4,background:`linear-gradient(90deg,${G},#F7D060)`,borderRadius:2}}/><div style={{fontSize:22,color:"#ccc"}}>מפגש 2 מתוך 5</div><div style={{fontSize:28,color:G,fontWeight:700}}>"תכין את הפגישה ב-5 דקות"</div><div style={{fontSize:14,color:"#999",marginTop:16}}>🔍 מחקר לקוח • כרטיס הכנה • תוכנית פגישה • שרשור פרומפטים</div></div>, notes: "מפגש 2 – פתיחה. תוכן מלא יתווסף בקרוב." },
  { content: <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}><T s={24} c="#888" a="center">🚧 תוכן מפגש 2 בבנייה...</T></div>, notes: "" }
];
const S3 = [
  { content: <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20}}><div style={{fontSize:18,color:G,letterSpacing:3,fontWeight:700}}>COMAX × AI</div><div style={{fontSize:40,fontWeight:800,color:"#fff",textAlign:"center"}}>סדנת AI למכירות שטח</div><div style={{width:80,height:4,background:`linear-gradient(90deg,${G},#F7D060)`,borderRadius:2}}/><div style={{fontSize:22,color:"#ccc"}}>מפגש 3 מתוך 5</div><div style={{fontSize:28,color:G,fontWeight:700}}>"התגבר על כל התנגדות"</div><div style={{fontSize:14,color:"#999",marginTop:16}}>🛡️ מאגר התנגדויות • Roleplay מתקדם • AI כ"לקוח קשה"</div></div>, notes: "מפגש 3 – פתיחה." },
  { content: <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}><T s={24} c="#888" a="center">🚧 תוכן מפגש 3 בבנייה...</T></div>, notes: "" }
];
const S4 = [
  { content: <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20}}><div style={{fontSize:18,color:G,letterSpacing:3,fontWeight:700}}>COMAX × AI</div><div style={{fontSize:40,fontWeight:800,color:"#fff",textAlign:"center"}}>סדנת AI למכירות שטח</div><div style={{width:80,height:4,background:`linear-gradient(90deg,${G},#F7D060)`,borderRadius:2}}/><div style={{fontSize:22,color:"#ccc"}}>מפגש 4 מתוך 5</div><div style={{fontSize:28,color:G,fontWeight:700}}>"כתיבה שמוכרת"</div><div style={{fontSize:14,color:"#999",marginTop:16}}>✍️ פולו-אפ • WhatsApp • הצעות מחיר • Persona Chains</div></div>, notes: "מפגש 4 – פתיחה." },
  { content: <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}><T s={24} c="#888" a="center">🚧 תוכן מפגש 4 בבנייה...</T></div>, notes: "" }
];
const S5 = [
  { content: <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20}}><div style={{fontSize:18,color:G,letterSpacing:3,fontWeight:700}}>COMAX × AI</div><div style={{fontSize:40,fontWeight:800,color:"#fff",textAlign:"center"}}>סדנת AI למכירות שטח</div><div style={{width:80,height:4,background:`linear-gradient(90deg,${G},#F7D060)`,borderRadius:2}}/><div style={{fontSize:22,color:"#ccc"}}>מפגש 5 מתוך 5</div><div style={{fontSize:28,color:G,fontWeight:700}}>"הסוכן החכם"</div><div style={{fontSize:14,color:"#999",marginTop:16}}>🏆 סימולציה מלאה • תחרות פרומפטים • ערכה אישית</div></div>, notes: "מפגש 5 – פתיחה." },
  { content: <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}><T s={24} c="#888" a="center">🚧 תוכן מפגש 5 בבנייה...</T></div>, notes: "" }
];

const SESSIONS = [
  { id: 1, title: "AI זה לא מדע בדיוני", emoji: "💡", subtitle: "שבירת חסמים + הכלי הראשון", slides: S1 },
  { id: 2, title: "תכין את הפגישה ב-5 דקות", emoji: "🔍", subtitle: "מחקר + כרטיס + תוכנית פגישה", slides: S2 },
  { id: 3, title: "התגבר על כל התנגדות", emoji: "🛡️", subtitle: "מאגר התנגדויות + Roleplay", slides: S3 },
  { id: 4, title: "כתיבה שמוכרת", emoji: "✍️", subtitle: "פולו-אפ + WhatsApp + הצעות מחיר", slides: S4 },
  { id: 5, title: "הסוכן החכם", emoji: "🏆", subtitle: "סימולציה + ערכה אישית", slides: S5 },
];

// ===================== WAITING SCREEN =====================
function WaitingScreen() {
  const [dots, setDots] = useState(0);
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const i = setInterval(() => setDots(d => (d + 1) % 4), 600); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setPulse(p => p + 1), 2000); return () => clearInterval(i); }, []);

  const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',Tahoma,sans-serif", direction: "rtl" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: `linear-gradient(135deg,${G},#F7D060)`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 0 ${30 + (pulse % 2) * 20}px rgba(232,185,49,${0.3 + (pulse % 2) * 0.2})`, transition: "box-shadow 1s" }}>
            C
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: G, letterSpacing: 2 }}>COMAX × AI</div>
          <div style={{ fontSize: 16, color: "#888", marginTop: 4 }}>סדנת AI למכירות שטח</div>
        </div>

        {/* Clock */}
        <div style={{ fontSize: 48, fontWeight: 300, color: "#fff", marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
          {time}
        </div>

        {/* Animated waiting */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: G, opacity: (dots + i) % 4 === 0 ? 1 : 0.3, transition: "opacity 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize: 18, color: "#aaa" }}>ממתינים למנחה{".".repeat(dots)}</div>
        </div>

        {/* Fun rotating tips */}
        <div style={{ background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.15)", borderRadius: 16, padding: "16px 24px" }}>
          <div style={{ fontSize: 14, color: "#888" }}>
            {["💡 ידעתם? AI יכול לעזור לכם להכין פגישה ב-5 דקות","🤖 AI לא ישן, לא אוכל ולא מתלונן על בונוס","📱 וודאו ש-ChatGPT או Claude מותקנים על הטלפון","☕ בינתיים אפשר להביא קפה. ל-AI לא צריך."][pulse % 4]}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== PRESENTER DASHBOARD =====================
function PresenterDashboard({ onStart }) {
  const viewerUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(viewerUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: BG, fontFamily: "'Segoe UI',Tahoma,sans-serif", direction: "rtl", padding: 24 }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 14, color: G, letterSpacing: 2, fontWeight: 700 }}>🎤 מצב מנחה</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>סדנת AI למכירות שטח – Comax</div>
        </div>

        {/* Copy link for viewers */}
        <div style={{ background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.2)", borderRadius: 14, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: G, fontWeight: 600, marginBottom: 4 }}>🔗 לינק לסוכנים (העתק ושלח בוואטסאפ):</div>
            <div style={{ fontSize: 13, color: "#aaa", wordBreak: "break-all" }}>{viewerUrl}</div>
          </div>
          <button onClick={copyLink} style={{ background: copied ? "#4CAF50" : G, color: "#1a1a2e", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
            {copied ? "✅ הועתק!" : "📋 העתק"}
          </button>
        </div>

        {/* Session selector */}
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>בחר מפגש להפעלה:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SESSIONS.map(s => (
            <button key={s.id} onClick={() => onStart(s.id)}
              style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a4a", borderRadius: 14, padding: "16px 20px", cursor: "pointer", textAlign: "right", transition: "all 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.background = "rgba(232,185,49,0.06)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "#2a2a4a"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ fontSize: 32 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>מפגש {s.id}: "{s.title}"</div>
                <div style={{ fontSize: 13, color: "#888" }}>{s.subtitle} • {s.slides.length} שקפים</div>
              </div>
              <div style={{ fontSize: 14, color: G, fontWeight: 700 }}>▶ התחל</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== SLIDE VIEW =====================
function SlideView({ session, isPresenter, onBack }) {
  const [current, setCurrent] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const ses = SESSIONS.find(s => s.id === session);
  const slides = ses.slides;
  const slide = slides[current];

  useEffect(() => {
    if (!isPresenter) return;
    const h = e => {
      if (e.key === "ArrowLeft") setCurrent(p => Math.min(p + 1, slides.length - 1));
      if (e.key === "ArrowRight") setCurrent(p => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isPresenter, slides.length]);

  // Store current session/slide for viewers
  useEffect(() => {
    if (isPresenter) {
      try {
        window.__COMAX_STATE = { session, slide: current };
      } catch(e) {}
    }
  }, [isPresenter, session, current]);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: BG, fontFamily: "'Segoe UI',Tahoma,sans-serif", direction: "rtl" }}>
      <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: "16px 16px 0" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700 }}>COMAX</div>
            <div style={{ fontSize: 12, color: "#555" }}>|</div>
            <div style={{ fontSize: 12, color: "#888" }}>מפגש {session}</div>
            {isPresenter && <div style={{ fontSize: 11, color: "#1a1a2e", background: G, padding: "2px 8px", borderRadius: 6, fontWeight: 700, marginRight: 8 }}>מנחה</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#555" }}>{current + 1}/{slides.length}</div>
            {isPresenter && <button onClick={onBack} style={{ fontSize: 11, color: "#666", background: "none", border: "1px solid #333", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>🔙 חזרה</button>}
          </div>
        </div>

        {/* Slide */}
        <div style={{ background: CARD, borderRadius: 18, width: "100%", aspectRatio: "16/9", padding: 36, boxSizing: "border-box", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid #2a2a4a", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100, background: "radial-gradient(circle at top left,rgba(232,185,49,0.08),transparent)" }} />
          <div style={{ height: "100%", position: "relative", zIndex: 1 }}>{slide.content}</div>
        </div>

        {/* Controls */}
        {isPresenter ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 14 }}>
            <button onClick={() => setCurrent(p => Math.min(p + 1, slides.length - 1))} style={{ background: current < slides.length - 1 ? G : "#333", color: current < slides.length - 1 ? "#1a1a2e" : "#666", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>הבא ←</button>
            <button onClick={() => setShowNotes(!showNotes)} style={{ background: showNotes ? "rgba(232,185,49,0.2)" : "rgba(255,255,255,0.06)", color: showNotes ? G : "#888", border: `1px solid ${showNotes ? "rgba(232,185,49,0.4)" : "#333"}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, cursor: "pointer" }}>{showNotes ? "🎤 הסתר" : "🎤 הערות"}</button>
            <button onClick={() => setCurrent(p => Math.max(p - 1, 0))} style={{ background: current > 0 ? "rgba(255,255,255,0.1)" : BG, color: current > 0 ? "#ccc" : "#333", border: "1px solid #333", borderRadius: 10, padding: "10px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>→ הקודם</button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
            <button onClick={() => setCurrent(p => Math.min(p + 1, slides.length - 1))} style={{ background: "rgba(255,255,255,0.06)", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "8px 24px", fontSize: 14, cursor: "pointer" }}>הבא ←</button>
            <button onClick={() => setCurrent(p => Math.max(p - 1, 0))} style={{ background: "rgba(255,255,255,0.06)", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "8px 24px", fontSize: 14, cursor: "pointer" }}>→ הקודם</button>
          </div>
        )}

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10, flexWrap: "wrap", paddingBottom: 8 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={isPresenter ? () => setCurrent(i) : undefined}
              style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, background: i === current ? G : "#333", cursor: isPresenter ? "pointer" : "default", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Notes - presenter only */}
      {isPresenter && showNotes && slide.notes && (
        <div style={{ maxWidth: 960, margin: "12px auto 0", padding: "0 16px 24px" }}>
          <div style={{ background: "rgba(232,185,49,0.06)", border: "1px solid rgba(232,185,49,0.2)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, color: G, fontWeight: 700, marginBottom: 10, textAlign: "right" }}>🎤 הערות למנחה:</div>
            <div style={{ fontSize: 15, color: "#ccc", lineHeight: 2, textAlign: "right", whiteSpace: "pre-wrap" }}>{slide.notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== MAIN APP =====================
export default function App() {
  const [isPresenter, setIsPresenter] = useState(false);
  const [activeSession, setActiveSession] = useState(null); // null = not started
  const [viewerSession, setViewerSession] = useState(null);

  // Check URL for presenter mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("presenter") === PASS) {
      setIsPresenter(true);
    }
  }, []);

  // For viewers: poll for active session (using storage)
  useEffect(() => {
    if (isPresenter) return;
    const check = async () => {
      try {
        const r = await window.storage.get("active_session", true);
        if (r && r.value) setViewerSession(parseInt(r.value));
      } catch(e) {}
    };
    check();
    const i = setInterval(check, 2000);
    return () => clearInterval(i);
  }, [isPresenter]);

  // Presenter: save active session
  const startSession = async (id) => {
    setActiveSession(id);
    try { await window.storage.set("active_session", String(id), true); } catch(e) {}
  };

  const backToDashboard = async () => {
    setActiveSession(null);
    try { await window.storage.set("active_session", "0", true); } catch(e) {}
  };

  // ---- PRESENTER ----
  if (isPresenter) {
    if (activeSession) return <SlideView session={activeSession} isPresenter={true} onBack={backToDashboard} />;
    return <PresenterDashboard onStart={startSession} />;
  }

  // ---- VIEWER ----
  if (viewerSession && viewerSession > 0) return <SlideView session={viewerSession} isPresenter={false} onBack={() => {}} />;
  return <WaitingScreen />;
}