# פסח של מספרים — CLAUDE.md

## תיאור הפרויקט
משחק חינוכי לילדים ללימוד חיבור וחיסור בנושא פסח.
קובץ יחיד: `index.html` — ללא build system, ללא dependencies.

## טכנולוגיות
- HTML / CSS / Vanilla JS בלבד
- Web Speech API לקריינות
- גופנים: Frank Ruhl Libre, Varela Round (Google Fonts)
- כיווניות: RTL (עברית)

## מבנה הפרויקט
```
passover-game/
├── index.html          # כל הקוד — HTML, CSS, JS
├── images/             # תמונות לכל שקופית
│   ├── slide_01.jpg.png
│   ├── slide_q1.jpg.png
│   ├── slide_q2.png
│   ├── slide_q3.png
│   ├── slide_q4.png
│   ├── slide_summary.png
│   └── slide_end.png
└── .claude/
    ├── skills/         # סקריפטים שימושיים
    ├── rules/          # כללי עבודה
    └── commands/       # פקודות מותאמות

## כללי עבודה
- **אל תפצל** את index.html לקבצים נפרדים — הכל נשאר בקובץ אחד
- **דפדפן מועדף**: Safari (קול Carmit — עברית טבעית)
- **כיוון משוואות**: משמאל לימין (`direction: ltr` על `.eqRow`)
- **קריינות**: קצרה בלבד — משפטי שבח רנדומליים, לא חזרה על התשובה

## מבנה ה-slides
כל שאלה (type: "q") מכילה:
- `img` — תמונה עם השאלה (אין טקסט שאלה נפרד)
- `a`, `b`, `op`, `correct` — נתוני המשוואה
- `narration` — טקסט לקריינות לפני התשובה
