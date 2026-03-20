import { useState, useEffect, useCallback } from "react";

// ========================
// SLIDE DATA - SESSION 1
// ========================
const slidesData = [
  {
    content: {
      type: "title",
      title: "סדנת AI למכירות שטח",
      subtitle: "מפגש 1 מתוך 5",
      highlight: "\"AI זה לא מדע בדיוני\"",
      footer: "💡 שבירת חסמים • הדלקת מוטיבציה • הכלי הראשון שלכם"
    },
    notes: `[פתיחה - עמוד על הבמה, חייך]

"בוקר טוב לכולם! אז... הבוס אמר לכם שאתם הולכים לסדנת AI, ואני בטוח שחלק מכם חשבו: 'יופי, עוד הרצאה שאני יכול לישון בה עם העיניים פתוחות.'

אז יש לי חדשות: היום אף אחד לא ישן. כי היום אנחנו לא מדברים על AI – אנחנו משתמשים ב-AI. על לקוחות אמיתיים שלכם. בזמן אמת.

ואם בסוף המפגש הזה לא תגידו 'רגע, זה באמת שימושי' – אני מתחייב לשלם לכם קפה. לא באמת, אבל נעים לדמיין."

[הצג את השקף]`
  },
  {
    content: {
      type: "agenda",
      items: [
        { time: "15 דק׳", icon: "👋", title: "פתיחה", desc: "סיבוב שולחן + ציפיות" },
        { time: "20 דק׳", icon: "🎪", title: "הדגמה חיה", desc: "AI פוגש לקוח קשה של Comax" },
        { time: "25 דק׳", icon: "💪", title: "תרגיל 1", desc: "הלקוח שלכם – פרומפט ראשון" },
        { time: "15 דק׳", icon: "🧠", title: "5 כללי זהב", desc: "איך לדבר עם AI ולא להישמע מטומטם" },
        { time: "20 דק׳", icon: "🔥", title: "תרגיל 2", desc: "שדרוג פרומפטים – לפני ואחרי" },
        { time: "15 דק׳", icon: "🎯", title: "סיכום", desc: "כלי יומיומי + משימה לשבוע" },
      ]
    },
    notes: `"אז הנה מה שעומד לקרות בשעתיים הקרובות. שימו לב – אין פה אף נקודה שכתוב בה 'הרצאה משעממת על מה זה בינה מלאכותית'. 

מה שכן יש: תרגילים. על לקוחות אמיתיים. שלכם. 

יש פה מישהו שמכיר את ההרגשה של לשבת מול לקוח ולא לדעת איך לפתוח? או ההרגשה שאתה חוזר מפגישה וחושב 'הייתי צריך להגיד את זה אחרת'? 

מעולה. אז היום ניתן לכם כלי שעושה בדיוק את זה – חושב אחורה בשבילכם, אבל לפני הפגישה."`
  },
  {
    content: {
      type: "centered",
      emoji: "🤔",
      title: "סיבוב פתיחה",
      subtitle: "ספרו בשני משפטים:",
      box: ["1. מה אתם חושבים על AI?", "2. מתי בפעם האחרונה הרגשתם\n\"הלוואי שמישהו היה עוזר לי עם זה\"?"],
      footer: "⏱️ משפט אחד כל אחד – בלי נאומים!"
    },
    notes: `"טוב, לפני שנתחיל – בואו נעשה סיבוב מהיר. כל אחד אומר שני דברים: מה הוא חושב על AI, ומתי בפעם האחרונה הרגיש 'הלוואי שמישהו היה עוזר לי עם זה'. ואני מדבר על עבודה, לא על להרכיב ארון מאיקאה.

[תן לכל אחד לדבר – הגבל ל-30 שניות. רשום על הלוח תשובות מעניינות]

[אחרי הסיבוב:]
'מעולה. אז שמעתי פה כמה דברים: יש כאלה שחושבים AI זה העתיד, יש כאלה שחושבים שזה באזז, ויש מישהו שבטוח שהרובוטים יחליפו אותנו מחר. 

חדשות: אף אחד מכם לא טועה לגמרי. אבל בואו נראה מה באמת קורה.'"`
  },
  {
    content: {
      type: "two-columns",
      title: "בואו נהיה כנים: מה AI יכול ומה לא",
      left: {
        title: "✅ AI מעולה ב:",
        color: "#4CAF50",
        items: ["לנסח טקסטים ומיילים", "לחקור ענף/לקוח תוך שניות", "לתת רעיונות וזוויות חדשות", "לתרגל התנגדויות (roleplay)", "לסכם ולארגן מידע", "לעבוד 24/7 בלי קפה"]
      },
      right: {
        title: "❌ AI גרוע ב:",
        color: "#F44336",
        items: ["לבנות יחסים אישיים", "להרגיש את הלקוח (שפת גוף)", "אינטואיציה של סוכן מנוסה", "לשתות קפה עם הלקוח", "לסגור עסקה בלחיצת יד", "לדעת שדני מרוגז כי ריבו עם אשתו"]
      }
    },
    notes: `"אז בואו נשים את הדברים על השולחן. AI זה לא ג'יימס בונד של מכירות. הוא לא הולך לסגור לכם עסקאות, הוא לא הולך להתקשר ללקוח במקומכם, והוא בטח לא הולך לשבת עם בעל מסעדה ולאכול חומוס כדי לסגור דיל.

[הצבע על העמודה הירוקה]
אבל תראו מה הוא כן יכול: לנסח, לחקור, לתרגל, לארגן. בעצם – הוא עושה את כל העבודה המשעממת שאתם לא אוהבים לעשות.

[הצבע על העמודה האדומה]
ומה הוא לא יכול? בדיוק את מה שאתם הכי טובים בו: לבנות קשר, להרגיש בן אדם, לדעת מתי ללחוץ ומתי לעזוב.

אז המשוואה פשוטה: AI עושה את ההכנה. אתם עושים את הקסם. ביחד – אתם בלתי ניתנים לעצירה.

ואגב, 'לעבוד 24/7 בלי קפה' – תנסו את זה עם הסוכנים של המתחרים."`
  },
  {
    content: {
      type: "quote",
      text: "AI לא יחליף סוכן מכירות.\nסוכן שמשתמש ב-AI\nיחליף סוכן שלא.",
      footer: "(ואל תגידו שלא הזהרנו אתכם 😏)"
    },
    notes: `[השאר את השקף הזה על המסך 5 שניות בשקט]

"קראו את זה. תזכרו את זה. 

זה לא איום – זה הזדמנות. הסוכנים שילמדו להשתמש ב-AI לפני כולם? הם אלה שיסגרו יותר עסקאות, יבזבזו פחות זמן על דברים שגוגל יכול לעשות, ויגיעו לפגישות מוכנים כמו שצריך.

ועכשיו, בואו נפסיק לדבר ונראה את זה בפעולה. מי רוצה להתנדב?"`
  },
  {
    content: {
      type: "centered",
      emoji: "🎪",
      title: "הדגמה חיה",
      subtitle: "עכשיו צריך מתנדב אמיץ אחד.",
      box: ["המשימה: ספרו לי על הלקוח הכי קשה שלכם.\nשני משפטים.", "אני: אכניס את זה ל-AI בזמן אמת.", "ביחד: נראה מה יוצא."],
      footer: "🎤 מי קודם? הביישן ביותר מתנדב ראשון!"
    },
    notes: `"אוקיי, הגיע הרגע. אני צריך מתנדב. מישהו שיש לו לקוח שמעצבן אותו. כן, אני יודע שיש לכם – אני רואה את זה בעיניים.

[אם אף אחד לא מתנדב:]
'טוב, מי שלא מתנדב – AI ימליץ לי על שאלות להתנגדויות שלו בכל מקרה, אז עדיף שתשלטו בתהליך.'

[כשמישהו מתנדב:]
'מעולה! ספר לנו: מי הלקוח, מה הוא עושה, ולמה הוא מסובך? שני משפטים, כאילו אתה מספר לחבר בהפסקת קפה.'

[הקלד את הפרומפט בזמן אמת על המסך הגדול – תן לכולם לראות את התהליך]"`
  },
  {
    content: {
      type: "code",
      title: "🖥️ הפרומפט שאני מקליד עכשיו:",
      code: "אתה יועץ מכירות מומחה בתחום מערכות ERP/POS\nלקמעונאות ומסעדנות.\n\nלקוח: [מה שהסוכן אמר]\n\nתן לי:\n1. שלוש שאלות חכמות שיגרמו לו לחשוב מחדש\n   (לא אגרסיביות)\n2. שני כאבים שכנראה יש לו ולא מודע אליהם\n3. משפט פתיחה אחד שיפתח את השיחה מחדש",
      footer: "💡 שימו לב: תפקיד → הקשר → משימה ברורה → פורמט"
    },
    notes: `[מקליד בזמן אמת – לאט, כדי שכולם יראו]

"שימו לב מה אני עושה כאן. אני לא כותב 'עזור לי למכור'. אני נותן ל-AI תפקיד – הוא יועץ מכירות. אני נותן לו הקשר – מה הלקוח ומה הסיטואציה. ואני נותן לו משימה ברורה – 3 שאלות, 2 כאבים, משפט פתיחה.

[לחץ Enter, חכה לתשובה]

[כשהתשובה מגיעה, קרא אותה בקול]

'אז מה אתם אומרים? [פנה למתנדב] – זה רלוונטי? היית אומר את זה ללקוח?'

[אם התשובה טובה:] 'ראיתם? 10 שניות, ויש לנו 3 זוויות שלא חשבנו עליהן.'

[אם התשובה בינונית:] 'לא מושלם, נכון? אז בואו נשפר את זה...'

[הקלד פרומפט המשך:]
'עכשיו תן לי גישה אחרת – יותר רכה, מבוססת סיפור של לקוח דומה שעשה מעבר מוצלח.'

'ראיתם? זה הטריק – אם לא אהבתם את התשובה, בקשו אחרת. AI לא נעלב.'"`
  },
  {
    content: {
      type: "exercise",
      title: "💪 תרגיל: הלקוח שלכם",
      intro: "חשבו על לקוח אמיתי – מישהו שתפגשו השבוע, או שאיבדתם לאחרונה.",
      code: "אני סוכן מכירות של Comax – מערכות ERP וקופות POS\nלקמעונאות, מסעדנות, ואופנה.\n\nהלקוח שלי: [תאר בשני משפטים]\nהאתגר: [מה קשה לי איתו?]\n\nעזור לי עם:\n1. שלוש שאלות פתיחה שיגרמו לשיחה להיות מעניינת\n2. שתי נקודות כאב שכנראה יש לו בלי שהוא יודע\n3. הצעה לאיך לפתוח את השיחה הבאה איתו",
      steps: [
        { time: "5 דק׳", text: "כתבו וקבלו תשובה" },
        { time: "10 דק׳", text: "עבודה בזוגות – שפרו" },
        { time: "10 דק׳", text: "3 מתנדבים משתפים" },
      ]
    },
    notes: `"אוקיי, עכשיו תורכם. תוציאו טלפונים – כן, אני נותן לכם רשות רשמית להסתכל בטלפון. פעם ראשונה שזה קורה בהרצאה, נכון?

[הצג את התבנית]

'קחו את התבנית הזו, חשבו על לקוח אמיתי, ותריצו. אל תחפשו מושלם – תכתבו משהו ותראו מה קורה.'

[חמש דקות עבודה עצמאית]

[אם מישהו תקוע:] 'אל תסתבכו. פשוט תכתבו: יש לי בעל חנות נעליים שאומר שיקר לו. מה אני עושה? – גם ככה זה יעבוד.'

[אחרי 5 דקות:]
'עכשיו, פנו לשכן שלכם. תראו לו מה קיבלתם, הוא יראה לכם. תנו פידבק אחד לשני – מה חזק, מה חסר?'

[אחרי 10 דקות:]
'מי קיבל משהו שהפתיע אותו? מי מוכן לשתף?'

[בחר 3 מתנדבים – תן לכל אחד 2 דקות. אחרי כל אחד, שאל את הקבוצה: 'מה הייתם מוסיפים?']"`
  },
  {
    content: {
      type: "centered",
      emoji: "☕",
      title: "הפסקה – 10 דקות",
      subtitle: "קפה, שירותים, ולבדוק אם ה-AI באמת עונה גם בלי Wi-Fi",
      footer: "(ספוילר: לא)"
    },
    notes: `"הפסקה! 10 דקות. קחו קפה. ואם אתם רוצים להתחיל להתמכר – תנסו עוד פרומפט על לקוח אחר.

אנחנו חוזרים בעוד 10 דקות, ואז נדבר על איך לכתוב פרומפטים כמו מקצוענים."`
  },
  {
    content: {
      type: "centered",
      emoji: "🏆",
      title: "5 כללי הזהב של פרומפט טוב",
      subtitle: "(או: \"איך לדבר עם AI בלי שירגיש שאתה מדבר עם קיר\")"
    },
    notes: `"אוקיי, אז עכשיו אחרי שניסיתם – בואו נדבר על למה חלק מכם קיבלו תשובות מעולות, וחלק קיבלו... פחות.

זה כמו פגישת מכירה: אם תיכנס ותגיד 'אז מה, רוצה לקנות?' – לא תמכור כלום. אם תיכנס מוכן – תסגור.

אותו דבר עם AI. אם תכתוב לו 'עזור לי' – הוא יתן לך תשובה גנרית. אם תכתוב לו בצורה חכמה – הוא יתן לך זהב.

5 כללים. פשוטים. בואו."`
  },
  {
    content: {
      type: "rules",
      title: "כללים 1-2",
      rules: [
        {
          n: "1️⃣", name: "תן תפקיד",
          good: "\"אתה מנהל מכירות בכיר בתחום ה-POS עם 15 שנות ניסיון\"",
          bad: "\"עזור לי למכור\""
        },
        {
          n: "2️⃣", name: "תן הקשר",
          good: "\"רשת של 5 חנויות אופנה, עובד עם אקסלים, שוקל מערכת חדשה\"",
          bad: "\"יש לי לקוח\""
        }
      ]
    },
    notes: `"כלל מספר 1: תן תפקיד. 

תחשבו על זה ככה – אם תגידו לעובד חדש 'לך תמכור', הוא יסתכל עליכם בבהלה. אם תגידו לו 'אתה מומחה POS, יש לך 15 שנות ניסיון, הלקוח הזה צריך פתרון למלאי' – הוא ידע מה לעשות. אותו דבר עם AI.

כלל מספר 2: תן הקשר. AI הוא לא קורא מחשבות – הוא קורא טקסט. ככל שתתנו לו יותר פרטים, התשובה תהיה יותר מדויקת. 'יש לי לקוח' – תשובה גנרית. 'יש לי רשת של 5 חנויות אופנה שעובדת עם אקסלים' – עכשיו אנחנו מדברים."`
  },
  {
    content: {
      type: "rules-345",
      rules: [
        { n: "3️⃣", name: "תן משימה ברורה", good: "\"כתוב 3 שאלות פתיחה שלא נשמעות מכירתיות\"", bad: "\"עזור לי עם הפגישה\"" },
        { n: "4️⃣", name: "תן פורמט", examples: "\"בנקודות\" • \"במשפט אחד\" • \"כהודעת WhatsApp\" • \"כטבלה\"" },
        { n: "5️⃣", name: "חזור ושפר 🔄", examples: "\"תהיה יותר ישיר\" • \"תתמקד רק בעלות\"\n\"תנסח כאילו שולח בוואטסאפ\" • \"תנסה גישה הפוכה לגמרי\"" },
      ],
      bonus: "💡 כלל הבונוס: AI לא נעלב. תבקשו גרסה אחרת. ועוד אחת. ועוד."
    },
    notes: `"כלל 3: משימה ברורה. אל תגידו 'עזור לי' – תגידו מה אתם רוצים.

כלל 4: פורמט. אתם רוצים את זה כהודעת WhatsApp? תגידו. כמייל? תגידו.

כלל 5 – והכי חשוב: חזרו ושפרו. הפרומפט הראשון הוא כמו טיוטה ראשונה. אף אחד לא שולח הצעת מחיר בטיוטה ראשונה, נכון?

וזה הבונוס: AI לא נעלב! אתם יכולים להגיד לו 'זה היה גרוע, תנסה שוב' והוא יגיד 'בטח!' – תנסו את זה עם השותף שלכם..."`
  },
  {
    content: {
      type: "exercise-upgrade",
      title: "🔥 תרגיל: שדרגו את הפרומפט",
      bad: "\"תכתוב לי מייל ללקוח\"",
      instruction: "⬇️ עכשיו נוסיף ביחד: תפקיד, הקשר, משימה, פורמט...",
      footer: "אחרי זה: כל אחד משדרג את הפרומפט שלו מתרגיל 1 לפי 5 הכללים"
    },
    notes: `"אוקיי תרגיל! תסתכלו על המסך. 'תכתוב לי מייל ללקוח'. זה הפרומפט. 

מי יכול להגיד לי למה הוא גרוע? [חכה לתשובות מהקהל]

'נכון – אין תפקיד, אין הקשר, אין משימה ברורה, ואין פורמט.'

בואו נתקן ביחד. [בנה את הפרומפט בזמן אמת עם הקהל]

עכשיו – חזרו לפרומפט שכתבתם בתרגיל 1. שדרגו אותו לפי 5 הכללים. 5 דקות."`
  },
  {
    content: {
      type: "summary",
      title: "🎯 מה לוקחים הביתה?",
      items: [
        { icon: "📱", title: "אפליקציה מותקנת", desc: "ChatGPT או Claude על הסמארטפון – מוכן לשימוש" },
        { icon: "📋", title: "תבנית פרומפט בסיסית", desc: "נשלחת אליכם בוואטסאפ מיד אחרי המפגש" },
        { icon: "🧠", title: "5 כללי הזהב", desc: "תפקיד → הקשר → משימה → פורמט → שפר" },
      ],
      homework: "השתמשו ב-AI לפחות פעם אחת ביום לפני פגישה עם לקוח.\nשלחו לקבוצת \"AI Wins\" דוגמה אחת שעבדה לכם."
    },
    notes: `"סיכום! היום עשינו 3 דברים: ראינו מה AI יכול, כתבנו פרומפטים על לקוחות אמיתיים, ולמדנו 5 כללי זהב.

מה לוקחים:
1. אפליקציה – מי שעדיין לא התקין, תתקינו עכשיו.
2. תבנית – אני שולח עכשיו לקבוצה.
3. 5 כללים – תפקיד, הקשר, משימה, פורמט, שפר.

והמשימה: כל יום לפני פגישה – דקה עם AI. ואם עבד – שלחו לקבוצה.

שבוע הבא נלמד להכין פגישה שלמה ב-5 דקות. תודה, אתם אלופים! 🚀"`
  },
  {
    content: {
      type: "closing",
      title: "נתראה בשבוע הבא!",
      next: "מפגש 2: \"תכין את הפגישה ב-5 דקות\"",
      emoji: "🚀",
      footer: "בינתיים – נסו, שתפו, ותשאלו את ה-AI הכל. הוא לא ילך לספר למנהל."
    },
    notes: `"שבוע טוב! זכרו – AI Wins – תשתפו שם. ואם יש שאלות, אפשר לשאול אותי או את ה-AI. הוא עונה יותר מהר ממני, אני לא נעלב."`
  }
];

// ========================
// SLIDE RENDERER
// ========================
function SlideRenderer({ data }) {
  const d = data;
  const gold = "#E8B931";

  if (d.type === "title") return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:24 }}>
      <div style={{ fontSize:18,color:gold,letterSpacing:3,fontWeight:700 }}>COMAX × AI</div>
      <div style={{ fontSize:42,fontWeight:800,color:"#fff",textAlign:"center",lineHeight:1.3 }}>{d.title}</div>
      <div style={{ width:80,height:4,background:`linear-gradient(90deg,${gold},#F7D060)`,borderRadius:2 }}/>
      <div style={{ fontSize:22,color:"#ccc" }}>{d.subtitle}</div>
      <div style={{ fontSize:28,color:gold,fontWeight:700,marginTop:8 }}>{d.highlight}</div>
      {d.footer && <div style={{ fontSize:15,color:"#999",marginTop:24 }}>{d.footer}</div>}
    </div>
  );

  if (d.type === "agenda") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px" }}>
      <div style={{ fontSize:28,fontWeight:800,color:gold,textAlign:"right",marginBottom:30 }}>מה בתוכנית היום?</div>
      {d.items.map((item,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:16,marginBottom:14,direction:"rtl" }}>
          <div style={{ fontSize:28 }}>{item.icon}</div>
          <div style={{ flex:1,textAlign:"right" }}>
            <div style={{ fontSize:17,fontWeight:700,color:"#fff" }}>{item.title}</div>
            <div style={{ fontSize:14,color:"#aaa" }}>{item.desc}</div>
          </div>
          <div style={{ fontSize:13,color:gold,fontWeight:600,minWidth:55,textAlign:"left" }}>{item.time}</div>
        </div>
      ))}
    </div>
  );

  if (d.type === "centered") return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:24 }}>
      {d.emoji && <div style={{ fontSize:64 }}>{d.emoji}</div>}
      <div style={{ fontSize:32,fontWeight:800,color:gold,textAlign:"center" }}>{d.title}</div>
      {d.subtitle && <div style={{ fontSize:20,color:"#ccc",textAlign:"center",lineHeight:1.8 }}>{d.subtitle}</div>}
      {d.box && (
        <div style={{ background:`rgba(232,185,49,0.1)`,border:`1px solid rgba(232,185,49,0.3)`,borderRadius:16,padding:"24px 32px",maxWidth:480,width:"100%" }}>
          <div style={{ fontSize:20,color:"#fff",textAlign:"right",lineHeight:1.8,direction:"rtl",whiteSpace:"pre-line" }}>
            {d.box.map((line,i) => <div key={i} style={{ marginBottom:8 }}><span style={{ color:gold,fontWeight:700 }}>{i+1 <= 9 ? "" : ""}</span>{line}</div>)}
          </div>
        </div>
      )}
      {d.footer && <div style={{ fontSize:14,color:"#888",marginTop:16 }}>{d.footer}</div>}
    </div>
  );

  if (d.type === "two-columns") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px" }}>
      <div style={{ fontSize:28,fontWeight:800,color:gold,textAlign:"right",marginBottom:24 }}>{d.title}</div>
      <div style={{ display:"flex",gap:20,flex:1,direction:"rtl" }}>
        {[d.left, d.right].map((col,i) => (
          <div key={i} style={{ flex:1,background:`${col.color}11`,border:`1px solid ${col.color}44`,borderRadius:16,padding:20 }}>
            <div style={{ fontSize:18,fontWeight:700,color:col.color,marginBottom:16,textAlign:"right" }}>{col.title}</div>
            {col.items.map((t,j) => <div key={j} style={{ fontSize:15,color:"#ddd",marginBottom:10,textAlign:"right",direction:"rtl" }}>• {t}</div>)}
          </div>
        ))}
      </div>
    </div>
  );

  if (d.type === "quote") return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:32 }}>
      <div style={{ fontSize:48,color:"rgba(232,185,49,0.3)" }}>"</div>
      <div style={{ fontSize:28,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.6,maxWidth:600,whiteSpace:"pre-line" }}>
        {d.text.split("\n").map((line,i) => <span key={i}>{i===1 ? <span style={{color:gold}}>{line}</span> : line}<br/></span>)}
      </div>
      <div style={{ fontSize:48,color:"rgba(232,185,49,0.3)" }}>"</div>
      {d.footer && <div style={{ fontSize:14,color:"#888" }}>{d.footer}</div>}
    </div>
  );

  if (d.type === "code") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px" }}>
      <div style={{ fontSize:24,fontWeight:800,color:gold,textAlign:"right",marginBottom:20 }}>{d.title}</div>
      <div style={{ background:"#1a1a2e",borderRadius:16,padding:24,flex:1,direction:"rtl",fontFamily:"monospace",border:"1px solid #333",overflow:"auto" }}>
        <div style={{ fontSize:14,color:gold,marginBottom:12 }}>PROMPT:</div>
        <div style={{ fontSize:15,color:"#ddd",lineHeight:2,textAlign:"right",whiteSpace:"pre-line" }}>{d.code}</div>
      </div>
      {d.footer && <div style={{ fontSize:13,color:"#888",textAlign:"center",marginTop:12 }}>{d.footer}</div>}
    </div>
  );

  if (d.type === "exercise") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px" }}>
      <div style={{ fontSize:24,fontWeight:800,color:gold,textAlign:"right",marginBottom:10 }}>{d.title}</div>
      <div style={{ fontSize:15,color:"#ccc",textAlign:"right",direction:"rtl",marginBottom:14,lineHeight:1.6 }}>{d.intro}</div>
      <div style={{ background:"#1a1a2e",borderRadius:16,padding:20,direction:"rtl",fontFamily:"monospace",border:"1px solid #333",marginBottom:14,flex:1,overflow:"auto" }}>
        <div style={{ fontSize:14,color:gold,marginBottom:8 }}>📋 העתיקו:</div>
        <div style={{ fontSize:14,color:"#ddd",lineHeight:2,textAlign:"right",whiteSpace:"pre-line" }}>{d.code}</div>
      </div>
      <div style={{ display:"flex",gap:12,direction:"rtl" }}>
        {d.steps.map((s,i) => (
          <div key={i} style={{ flex:1,background:"rgba(232,185,49,0.08)",border:"1px solid rgba(232,185,49,0.2)",borderRadius:12,padding:"12px 16px",textAlign:"center" }}>
            <div style={{ fontSize:16,fontWeight:700,color:gold }}>{s.time}</div>
            <div style={{ fontSize:13,color:"#bbb",marginTop:4 }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (d.type === "rules") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px",direction:"rtl",gap:16 }}>
      <div style={{ fontSize:24,fontWeight:800,color:gold,textAlign:"right" }}>{d.title}</div>
      {d.rules.map((r,i) => (
        <div key={i} style={{ background:"rgba(232,185,49,0.08)",borderRadius:16,padding:20,border:"1px solid rgba(232,185,49,0.2)" }}>
          <div style={{ fontSize:20,fontWeight:700,color:gold,marginBottom:12,textAlign:"right" }}>{r.n} {r.name}</div>
          <div style={{ display:"flex",gap:16 }}>
            <div style={{ flex:1,background:"rgba(76,175,80,0.1)",borderRadius:10,padding:12 }}>
              <div style={{ fontSize:13,color:"#4CAF50",fontWeight:600,marginBottom:6,textAlign:"right" }}>✅ טוב:</div>
              <div style={{ fontSize:14,color:"#ddd",textAlign:"right" }}>{r.good}</div>
            </div>
            <div style={{ flex:1,background:"rgba(244,67,54,0.1)",borderRadius:10,padding:12 }}>
              <div style={{ fontSize:13,color:"#F44336",fontWeight:600,marginBottom:6,textAlign:"right" }}>❌ גרוע:</div>
              <div style={{ fontSize:14,color:"#ddd",textAlign:"right" }}>{r.bad}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (d.type === "rules-345") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px",direction:"rtl",gap:10 }}>
      <div style={{ fontSize:24,fontWeight:800,color:gold,textAlign:"right" }}>כללים 3-4-5</div>
      {d.rules.map((r,i) => (
        <div key={i} style={{ background:"rgba(232,185,49,0.08)",borderRadius:14,padding:16,border:"1px solid rgba(232,185,49,0.2)" }}>
          <div style={{ fontSize:18,fontWeight:700,color:gold,marginBottom:8,textAlign:"right" }}>{r.n} {r.name}</div>
          {r.good && <div style={{ display:"flex",gap:12,fontSize:14 }}>
            <div style={{ flex:1,color:"#4CAF50",textAlign:"right" }}>✅ {r.good}</div>
            <div style={{ flex:1,color:"#F44336",textAlign:"right" }}>❌ {r.bad}</div>
          </div>}
          {r.examples && <div style={{ fontSize:15,color:"#ccc",textAlign:"right",lineHeight:1.8,whiteSpace:"pre-line" }}>{r.examples}</div>}
        </div>
      ))}
      {d.bonus && <div style={{ background:"linear-gradient(135deg,rgba(232,185,49,0.15),rgba(232,185,49,0.05))",borderRadius:14,padding:14,textAlign:"center" }}>
        <div style={{ fontSize:16,color:gold,fontWeight:600 }}>{d.bonus}</div>
      </div>}
    </div>
  );

  if (d.type === "exercise-upgrade") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px" }}>
      <div style={{ fontSize:24,fontWeight:800,color:gold,textAlign:"right",marginBottom:16 }}>{d.title}</div>
      <div style={{ background:"rgba(244,67,54,0.1)",borderRadius:14,padding:20,marginBottom:16,border:"1px solid rgba(244,67,54,0.3)" }}>
        <div style={{ fontSize:14,color:"#F44336",fontWeight:600,marginBottom:8,textAlign:"right",direction:"rtl" }}>❌ הפרומפט הגרוע:</div>
        <div style={{ fontSize:20,color:"#ddd",fontFamily:"monospace",textAlign:"right",direction:"rtl" }}>{d.bad}</div>
      </div>
      <div style={{ fontSize:16,color:gold,textAlign:"right",direction:"rtl",marginBottom:12 }}>{d.instruction}</div>
      <div style={{ background:"rgba(76,175,80,0.1)",borderRadius:14,padding:20,border:"1px solid rgba(76,175,80,0.3)",flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ fontSize:18,color:"#4CAF50",textAlign:"center" }}>✅ הפרומפט המשודרג נכתב ביחד, בזמן אמת!</div>
      </div>
      <div style={{ fontSize:13,color:"#888",textAlign:"center",marginTop:12,direction:"rtl" }}>{d.footer}</div>
    </div>
  );

  if (d.type === "summary") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"0 10px",direction:"rtl" }}>
      <div style={{ fontSize:24,fontWeight:800,color:gold,textAlign:"right",marginBottom:20 }}>{d.title}</div>
      <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
        {d.items.map((item,i) => (
          <div key={i} style={{ display:"flex",gap:14,alignItems:"center",background:"rgba(232,185,49,0.06)",borderRadius:12,padding:"14px 18px",border:"1px solid rgba(232,185,49,0.15)" }}>
            <div style={{ fontSize:28 }}>{item.icon}</div>
            <div style={{ flex:1,textAlign:"right" }}>
              <div style={{ fontSize:16,fontWeight:700,color:"#fff" }}>{item.title}</div>
              <div style={{ fontSize:13,color:"#aaa" }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:`linear-gradient(135deg,${gold},#F7D060)`,borderRadius:14,padding:20,textAlign:"right" }}>
        <div style={{ fontSize:18,fontWeight:800,color:"#1a1a2e",marginBottom:8 }}>📌 משימה לשבוע הבא:</div>
        <div style={{ fontSize:15,color:"#1a1a2e",lineHeight:1.8,whiteSpace:"pre-line" }}>{d.homework}</div>
      </div>
    </div>
  );

  if (d.type === "closing") return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:24 }}>
      <div style={{ fontSize:18,color:gold,letterSpacing:3,fontWeight:700 }}>COMAX × AI</div>
      <div style={{ fontSize:32,fontWeight:800,color:"#fff" }}>{d.title}</div>
      <div style={{ width:60,height:3,background:gold,borderRadius:2 }}/>
      <div style={{ fontSize:20,color:"#ccc" }}>{d.next}</div>
      <div style={{ fontSize:48,marginTop:16 }}>{d.emoji}</div>
      <div style={{ fontSize:14,color:"#666",marginTop:24 }}>{d.footer}</div>
    </div>
  );

  return <div style={{ color:"#fff" }}>שקף</div>;
}

// ========================
// MAIN APP
// ========================
const PRESENTER_PASS = "comax2025";

export default function App() {
  const [mode, setMode] = useState(null); // null = choose, 'viewer', 'presenter'
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (mode !== "presenter") return;
    const h = (e) => {
      if (e.key === "ArrowLeft") setCurrent(p => Math.min(p + 1, slidesData.length - 1));
      if (e.key === "ArrowRight") setCurrent(p => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode]);

  // ========================
  // MODE SELECTION SCREEN
  // ========================
  if (!mode) return (
    <div style={{ width:"100%",minHeight:"100vh",background:"#0f0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI', Tahoma, sans-serif",direction:"rtl" }}>
      <div style={{ maxWidth:500,width:"100%",padding:24 }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ fontSize:18,color:"#E8B931",letterSpacing:3,fontWeight:700,marginBottom:12 }}>COMAX × AI</div>
          <div style={{ fontSize:32,fontWeight:800,color:"#fff",marginBottom:8 }}>סדנת AI למכירות שטח</div>
          <div style={{ fontSize:16,color:"#888" }}>מפגש 1: "AI זה לא מדע בדיוני"</div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <button onClick={() => setMode("viewer")}
            style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)",border:"2px solid #E8B931",borderRadius:16,padding:"24px 20px",cursor:"pointer",textAlign:"center" }}>
            <div style={{ fontSize:32,marginBottom:8 }}>👁️</div>
            <div style={{ fontSize:20,fontWeight:700,color:"#E8B931" }}>צפייה במצגת</div>
            <div style={{ fontSize:14,color:"#aaa",marginTop:6 }}>לסוכנים – צפייה בשקפים בלבד</div>
          </button>
          <div style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)",border:"2px solid #333",borderRadius:16,padding:"24px 20px",textAlign:"center" }}>
            <div style={{ fontSize:32,marginBottom:8 }}>🎤</div>
            <div style={{ fontSize:20,fontWeight:700,color:"#fff",marginBottom:12 }}>מצב מנחה</div>
            <div style={{ fontSize:14,color:"#aaa",marginBottom:16 }}>שליטה + הערות + ניווט</div>
            <div style={{ display:"flex",gap:8,justifyContent:"center",direction:"ltr" }}>
              <input
                type="password"
                placeholder="סיסמה"
                value={passInput}
                onChange={e => { setPassInput(e.target.value); setPassError(false); }}
                onKeyDown={e => { if (e.key === "Enter") { if (passInput === PRESENTER_PASS) setMode("presenter"); else setPassError(true); }}}
                style={{ background:"rgba(255,255,255,0.06)",border:`1px solid ${passError ? "#F44336" : "#444"}`,borderRadius:10,padding:"10px 16px",color:"#fff",fontSize:16,textAlign:"center",width:150,outline:"none" }}
              />
              <button onClick={() => { if (passInput === PRESENTER_PASS) setMode("presenter"); else setPassError(true); }}
                style={{ background:"#E8B931",color:"#1a1a2e",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,fontSize:15,cursor:"pointer" }}>
                כניסה
              </button>
            </div>
            {passError && <div style={{ color:"#F44336",fontSize:13,marginTop:8 }}>סיסמה שגויה</div>}
          </div>
        </div>
        <div style={{ textAlign:"center",marginTop:24,fontSize:12,color:"#444" }}>
          סיסמת מנחה: comax2025
        </div>
      </div>
    </div>
  );

  const slide = slidesData[current];
  const isPresenter = mode === "presenter";

  // ========================
  // PRESENTATION VIEW
  // ========================
  return (
    <div style={{ width:"100%",minHeight:"100vh",background:"#0f0f1a",fontFamily:"'Segoe UI', Tahoma, sans-serif",direction:"rtl" }}>
      <div style={{ width:"100%",maxWidth:960,margin:"0 auto",padding:"20px 16px 0" }}>
        {/* Top bar */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <div style={{ fontSize:12,color:"#E8B931",fontWeight:700 }}>COMAX</div>
            <div style={{ fontSize:12,color:"#555" }}>|</div>
            <div style={{ fontSize:12,color:"#888" }}>מפגש 1</div>
            {isPresenter && <div style={{ fontSize:11,color:"#1a1a2e",background:"#E8B931",padding:"2px 8px",borderRadius:6,fontWeight:700,marginRight:8 }}>מנחה</div>}
            {!isPresenter && <div style={{ fontSize:11,color:"#aaa",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:6,marginRight:8 }}>צפייה</div>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ fontSize:12,color:"#555" }}>{current + 1} / {slidesData.length}</div>
            <button onClick={() => { setMode(null); setCurrent(0); setShowNotes(false); setPassInput(""); }}
              style={{ fontSize:11,color:"#666",background:"none",border:"1px solid #333",borderRadius:6,padding:"4px 10px",cursor:"pointer" }}>
              🔙 חזרה
            </button>
          </div>
        </div>

        {/* Slide */}
        <div style={{
          background:"linear-gradient(145deg,#1a1a2e,#16213e)",
          borderRadius:20,width:"100%",aspectRatio:"16/9",padding:40,
          boxSizing:"border-box",boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
          border:"1px solid #2a2a4a",overflow:"hidden",position:"relative"
        }}>
          <div style={{ position:"absolute",top:0,left:0,width:120,height:120,background:"radial-gradient(circle at top left,rgba(232,185,49,0.08),transparent)" }}/>
          <div style={{ position:"absolute",bottom:0,right:0,width:120,height:120,background:"radial-gradient(circle at bottom right,rgba(232,185,49,0.05),transparent)" }}/>
          <div style={{ height:"100%",position:"relative",zIndex:1 }}>
            <SlideRenderer data={slide.content} />
          </div>
        </div>

        {/* Navigation - ONLY for presenter */}
        {isPresenter && (
          <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:16,marginTop:16 }}>
            <button onClick={() => setCurrent(p => Math.min(p + 1, slidesData.length - 1))}
              style={{ background:current < slidesData.length - 1 ? "#E8B931" : "#333",color:current < slidesData.length - 1 ? "#1a1a2e" : "#666",border:"none",borderRadius:10,padding:"10px 28px",fontSize:15,fontWeight:700,cursor:"pointer" }}>
              הבא ←
            </button>
            <button onClick={() => setShowNotes(!showNotes)}
              style={{ background:showNotes ? "rgba(232,185,49,0.2)" : "rgba(255,255,255,0.06)",color:showNotes ? "#E8B931" : "#888",border:"1px solid "+(showNotes?"rgba(232,185,49,0.4)":"#333"),borderRadius:10,padding:"10px 20px",fontSize:14,cursor:"pointer" }}>
              {showNotes ? "🎤 הסתר הערות" : "🎤 הערות מנחה"}
            </button>
            <button onClick={() => setCurrent(p => Math.max(p - 1, 0))}
              style={{ background:current > 0 ? "rgba(255,255,255,0.1)" : "#1a1a2e",color:current > 0 ? "#ccc" : "#333",border:"1px solid #333",borderRadius:10,padding:"10px 28px",fontSize:15,fontWeight:700,cursor:"pointer" }}>
              → הקודם
            </button>
          </div>
        )}

        {/* Slide dots - presenter can click, viewer sees position */}
        <div style={{ display:"flex",justifyContent:"center",gap:6,marginTop:isPresenter ? 12 : 20,paddingBottom:8 }}>
          {slidesData.map((_,i) => (
            <div key={i}
              onClick={isPresenter ? () => setCurrent(i) : undefined}
              style={{ width:i===current?24:8,height:8,borderRadius:4,background:i===current?"#E8B931":"#333",cursor:isPresenter?"pointer":"default",transition:"all 0.3s" }}
            />
          ))}
        </div>

        {/* Viewer navigation - simple arrows only, no notes */}
        {!isPresenter && (
          <div style={{ display:"flex",justifyContent:"center",gap:12,marginTop:8,paddingBottom:20 }}>
            <button onClick={() => setCurrent(p => Math.min(p + 1, slidesData.length - 1))}
              style={{ background:"rgba(255,255,255,0.06)",color:"#aaa",border:"1px solid #333",borderRadius:10,padding:"8px 24px",fontSize:14,cursor:"pointer" }}>
              הבא ←
            </button>
            <button onClick={() => setCurrent(p => Math.max(p - 1, 0))}
              style={{ background:"rgba(255,255,255,0.06)",color:"#aaa",border:"1px solid #333",borderRadius:10,padding:"8px 24px",fontSize:14,cursor:"pointer" }}>
              → הקודם
            </button>
          </div>
        )}
      </div>

      {/* Speaker Notes - ONLY presenter */}
      {isPresenter && showNotes && slide.notes && (
        <div style={{ maxWidth:960,margin:"16px auto 0",padding:"0 16px 24px" }}>
          <div style={{ background:"rgba(232,185,49,0.06)",border:"1px solid rgba(232,185,49,0.2)",borderRadius:16,padding:24 }}>
            <div style={{ fontSize:14,color:"#E8B931",fontWeight:700,marginBottom:12,textAlign:"right" }}>
              🎤 מה לומר – הערות למנחה:
            </div>
            <div style={{ fontSize:15,color:"#ccc",lineHeight:2,textAlign:"right",whiteSpace:"pre-wrap",direction:"rtl" }}>
              {slide.notes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}