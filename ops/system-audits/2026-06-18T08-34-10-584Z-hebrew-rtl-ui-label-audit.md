# Hebrew RTL UI Label Audit - 2026-06-18T08:34:10.584Z

Task: #569
Result: passed

## Surfaces

### parent-portal

Parent portal Hebrew mode should have RTL and Hebrew labels.

- PASS sets document direction for Hebrew
- PASS has Hebrew language toggle target
- PASS home has Hebrew label - אישי/בית | אישי/בית | בית
- PASS myChildren has Hebrew label - הילדים שלי
- PASS providerIndex has Hebrew label - אינדקס ספקים
- PASS parentCoaching has Hebrew label - הדרכת הורים
- PASS interestTopics has Hebrew label - נושאי עניין
- PASS struggleSignals has Hebrew label - מה ייתכן שהוא מתמודד איתו
- PASS openEndedQuestions has Hebrew label - שאלות פתוחות להורה
- PASS studentLoginSettings has Hebrew label - הגדרות כניסת תלמיד
- PASS studentLoginStatus has Hebrew label - כניסת תלמיד
- PASS studentLoginFor has Hebrew label - כניסה לפורטל תלמיד עבור
- PASS studentLoginChildCopy has Hebrew label - כאן אפשר להגדיר או לאפס שם משתמש וסיסמה עבור הילד הזה בלבד.
- PASS studentUsername has Hebrew label - שם משתמש לתלמיד
- PASS studentPassword has Hebrew label - סיסמת תלמיד חדשה
- PASS studentPasswordNeverShown has Hebrew label - סיסמאות שמורות אינן מוצגות לאחר הגדרה או איפוס.
- PASS studentAccessFallback has Hebrew label - גיבוי קוד גישה
- PASS classroomSource has Hebrew label - כיתה
- PASS no known parent Hebrew student-login fallbacks remain

### student-portal

Student portal Hebrew mode should have RTL and Hebrew labels.

- PASS sets document direction for Hebrew
- PASS has Hebrew language button
- PASS topbar student navigation labels are language-driven
- PASS device access state labels are language-driven
- PASS daily checkoff weekday labels are localized
- PASS publicSite has Hebrew label - אתר ציבורי
- PASS families has Hebrew label - משפחות
- PASS parentLoginNav has Hebrew label - כניסת הורים
- PASS dailyAccountability has Hebrew label - אחריות יומית
- PASS enterCode has Hebrew label - כניסת תלמיד | כניסת תלמיד
- PASS accessHelp has Hebrew label - היכנס עם שם המשתמש והסיסמה שההורה הגדיר עבורך. | היכנס עם שם המשתמש והסיסמה שההורה הגדיר עבורך.
- PASS studentUsername has Hebrew label - שם משתמש | שם משתמש
- PASS studentPassword has Hebrew label - סיסמה | סיסמה
- PASS studentLogin has Hebrew label - כניסה | כניסה
- PASS accessFallback has Hebrew label - בתקופת המעבר, גם קישור קוד הגישה הפרטי עדיין עובד. | בתקופת המעבר, גם קישור קוד הגישה הפרטי עדיין עובד.
- PASS clearCode has Hebrew label - יציאה | יציאה
- PASS boardTitle has Hebrew label - לוח המטרות שלי | לוח המטרות שלי
- PASS goalView has Hebrew label - תצוגת מטרות | תצוגת מטרות
- PASS today has Hebrew label - היום | היום
- PASS upcoming has Hebrew label - עתידי | בהמשך
- PASS waiting has Hebrew label - בהמתנה | בהמתנה
- PASS done has Hebrew label - בוצע | בוצע
- PASS assignedOnly has Hebrew label - מטרות, השלכות, זמני שינה וכללי טאבלט נקבעים על ידי הרב/מנהל. הדף הזה מיועד רק לסימון אמיתי, פתק קצר, ומעקב קריאה בלבד. | מטרות, השלכות, זמני שינה וכללי טאבלט נקבעים על ידי הרב או המנהל. הדף הזה מיועד רק לסימון אמיתי, פתק קצר, ומעקב קריאה בלבד.
- PASS dailyCheckoffs has Hebrew label - סימונים יומיים | סימונים יומיים
- PASS noteFor has Hebrew label - פתק עבור | פתק עבור
- PASS saveDayNote has Hebrew label - שמור פתק יומי | שמור פתק יומי
- PASS tabletAccessLabel has Hebrew label - גישת טאבלט | גישת טאבלט
- PASS deviceNotConfigured has Hebrew label - לא מוגדר
- PASS deviceLocked has Hebrew label - נעול
- PASS deviceAccountabilityOnly has Hebrew label - אחריות בלבד
- PASS deviceApprovedAccess has Hebrew label - גישה מאושרת
- PASS deviceExpired has Hebrew label - פג תוקף
- PASS questionsTitle has Hebrew label - השאלות שלי | השאלות שלי
- PASS askQuestion has Hebrew label - שלח שאלה
- PASS parentMessageTitle has Hebrew label - שלח הודעה להורה | שלח הודעה להורה
- PASS sendParentMessage has Hebrew label - שלח להורה | שלח להורה
- PASS talkTitle has Hebrew label - שאל את עוזר BNA | שאל את עוזר BNA
- PASS sendMessage has Hebrew label - בקשת עזרה | בקש עזרה
- PASS assistantTitle has Hebrew label - עוזר תלמיד
- PASS sendAssistant has Hebrew label - שלח לעוזר
- PASS calendarTitle has Hebrew label - לוח השנה שלי | לוח הזמנים שלי
- PASS googleClassroomStatus has Hebrew label - Google Classroom לא מחובר | Google Classroom לא מחובר
- PASS classroomSource has Hebrew label or approved product name - כיתה | Google Classroom
- PASS no known student Hebrew login fallbacks remain

### signup-he

Hebrew registration should be RTL and Hebrew-first.

- PASS html declares Hebrew RTL
- PASS site nav initializes in Hebrew
- PASS form language is Hebrew
- PASS no known English registration-section labels remain

### public-provider-navigation

Public Hebrew navigation should not fall back for provider entry labels.

- PASS school has Hebrew label - בית הספר
- PASS parents has Hebrew label - משפחות
- PASS serviceProviders has Hebrew label - ספקי שירות
- PASS audience has Hebrew label - למי זה מתאים
- PASS portals has Hebrew label - כניסה לפורטלים
- PASS parentLogin has Hebrew label - הורים
- PASS studentLogin has Hebrew label - תלמיד
- PASS providerLogin has Hebrew label - רב / ספק
- PASS providerJoin has Hebrew label - פרסמו את התוכנית בחינם
- PASS contact has Hebrew label - צור קשר
- PASS signup has Hebrew label - הרשמה
- PASS openMenu has Hebrew label - פתיחת תפריט ניווט
- PASS public navigation omits Operations login entry

### provider-portal

Provider portal currently has no Hebrew mode to audit.

- PASS provider portal is explicitly English-only today
- PASS provider portal does not advertise a Hebrew toggle
- PASS provider Hebrew entry point covered by public nav audit - public-provider-navigation
