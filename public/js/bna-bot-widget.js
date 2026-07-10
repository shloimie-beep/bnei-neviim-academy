(function () {
  if (window.BNABotWidgetLoaded) return;

  const path = window.location.pathname;
  const query = new URLSearchParams(window.location.search);
  const isParent = /^\/parent/.test(path);
  const isStudent = /^\/student/.test(path);
  const isOneTimeReview = ['one-time', 'onetime', '1', 'true'].includes(String(query.get('review') || '').toLowerCase());
  const isOneTimeLoginMode = ['one-time', 'onetime', '1', 'true'].includes(String(query.get('one_time_login') || '').toLowerCase());
  const isOneTimeHostDocument = /(^|\.)onetimeonetime\.com$/i.test(window.location.hostname || '')
    || document.documentElement?.dataset?.appSelectSurface === 'one-time';
  const isOneTimeParentReview = isOneTimeReview && isParent;
  const isOneTimeStudentReviewOnly = isOneTimeReview && isStudent;
  const isOneTimeStudentReview = !isOneTimeStudentReviewOnly && (isOneTimeLoginMode || isOneTimeHostDocument) && isStudent;
  const isProvider = [
    '/provider',
    '/provider/',
    '/provider.html',
    '/provider/login',
    '/provider-dashboard',
  ].includes(path);
  const isOneTimeProviderReview = isProvider && (
    isOneTimeReview
      || isOneTimeHostDocument
      || ['one-time', 'onetime'].includes(String(query.get('admin_provider') || query.get('adminProvider') || '').toLowerCase())
      || query.has('view_as_rabbi')
      || query.has('viewAsRabbi')
      || document.body?.dataset?.oneTimeWorkspace === 'rabbi_sheller_provider'
  );
  if (isOneTimeReview && !isOneTimeParentReview && !isOneTimeStudentReview && !isOneTimeProviderReview) return;
  try {
    if (!isStudent) localStorage.removeItem('bnaStudentAccessCode');
  } catch {}
  if (isParent && query.get('onboard') === 'accountability') return;
  window.BNABotWidgetLoaded = true;
  const isOneTimePublicDocument = document.documentElement?.dataset?.appSelectSurface === 'one-time'
    || document.body?.dataset?.oneTimeWorkspace === 'rabbi_sheller_provider'
    || document.body?.dataset?.siteConfig === '/config/service-provider-sites/one-time.json';
  const isOneTimePublic = (
    /^(?:\/one-time|\/rabbi)(?:\/|$|\.html$)/.test(path)
      || ['/rabbi-preview', '/one-time-mishnayos'].includes(path)
      || isOneTimePublicDocument
    )
    && !isParent
    && !isStudent
    && !isProvider
    && !/^(?:\/rabbi-member|\/member-library|\/one-time-classroom|\/provider-participant)(?:\/|$|\.html$)/.test(path);
  const isOneTimeMember = /^(?:\/rabbi-member|\/member-library|\/one-time-classroom|\/provider-participant)(?:\/|$|\.html$)/.test(path)
    || ['/member', '/member.html', '/member-portal', '/one-time/member-login'].includes(path);
  const isOperations = /^\/operations/.test(path);
  const isSignup = /^\/signup(?:\/|$|-|\.html$)/.test(path);
  const surface = isOperations
    ? 'operations'
    : isOneTimePublic
      ? 'one_time_public'
      : isOneTimeParentReview
        ? 'one_time_parent'
        : isOneTimeStudentReview
          ? 'one_time_student'
          : isOneTimeProviderReview
            ? 'one_time_provider'
      : isParent
      ? 'parent_portal'
      : isStudent
        ? 'student_portal'
        : isOneTimeMember
          ? 'one_time_member'
          : isProvider
            ? 'provider_workspace'
            : isSignup
              ? 'signup'
              : 'public';
  const storagePrefix = `bnaAssistant:${surface}`;
  const HELPER_FIRST_NUDGE_DELAY_MS = 12000;
  const HELPER_SECOND_NUDGE_DELAY_MS = 45000;
  const ONE_TIME_PUBLIC_FIRST_NUDGE_DELAY_MS = 10000;
  const ONE_TIME_PUBLIC_SECOND_NUDGE_DELAY_MS = 20000;
  const HELPER_DISMISS_SUPPRESS_HOURS = 24;
  const PUBLIC_ASSISTANT_AUTOPROMPT_DELAY_MS = HELPER_FIRST_NUDGE_DELAY_MS;
  const PUBLIC_ASSISTANT_FOLLOWUP_DELAY_MS = HELPER_SECOND_NUDGE_DELAY_MS;
  const PUBLIC_ASSISTANT_TYPING_DELAY_MS = 900;
  const isHebrewPath = () => /^\/he(?:\/|$)/i.test(path) || query.get('lang') === 'he';
  const direction = () => document.documentElement.dir === 'rtl' || isHebrewPath() ? 'rtl' : 'ltr';
  const language = () => isHebrewPath() ? 'he' : (document.documentElement.lang || (direction() === 'rtl' ? 'he' : 'en'));
  const isHebrew = () => /^he\b/i.test(language()) || direction() === 'rtl';
  const studentAccessCode = () => isStudent ? (new URLSearchParams(window.location.search).get('code') || '') : '';
  const isPublicLeadSurface = () => ['public', 'signup', 'one_time_public'].includes(surface);

  function oneTimeCurrentMasechta() {
    const value =
      document.documentElement?.dataset?.oneTimeCurrentMasechta ||
      document.body?.dataset?.oneTimeCurrentMasechta ||
      window.ONE_TIME_CURRENT_MASECHTA ||
      'Maseches Berachos';
    return String(value || 'Maseches Berachos').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Maseches Berachos';
  }

  function oneTimeJoinMomentCopy() {
    return `We are up to ${oneTimeCurrentMasechta()} now. It is a great time to join.`;
  }

  function getOrCreateAnonymousId() {
    const existing = localStorage.getItem('bnaAssistantAnonymousId');
    if (existing) return existing;
    const next = `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem('bnaAssistantAnonymousId', next);
    return next;
  }

  function introCopy() {
    if (surface === 'public') return publicHelperData().intro || surfaceConfig().intro;
    return surfaceConfig().intro;
  }

  function surfaceConfig() {
    const he = isHebrew();
    const base = he ? {
      helperTitle: 'מסייע BNA',
      close: 'סגירה',
      history: 'היסטוריה',
      modeLabel: 'מצב מסייע',
      autoMode: 'אוטומטי',
      hostedMode: 'שיחה',
      codexMode: 'Codex',
      thinking: 'חושב...',
      placeholder: 'כתוב הודעה',
      send: 'שליחה',
      saved: 'נשמר.',
      unavailable: 'המסייע אינו זמין כרגע.',
      historyLoading: 'טוען היסטוריה...',
      historyEmpty: 'אין שיחות קודמות עדיין',
      historyUnavailable: 'ההיסטוריה אינה זמינה',
      boxKicker: 'מסייע אישי',
      boxTitle: 'איך אפשר לעזור עכשיו',
      guardrail: 'המסייע שומר על ההרשאות של החשבון הזה. הוא לא יציג משפחות, תלמידים או ספקים שאין לך גישה אליהם.',
    } : {
      helperTitle: 'BNA Helper',
      close: 'Close',
      history: 'Chat history',
      modeLabel: 'Assistant mode',
      autoMode: 'Auto',
      hostedMode: 'Chat',
      codexMode: 'Codex',
      thinking: 'Thinking...',
      placeholder: 'Write a message',
      send: 'Send',
      saved: 'Saved.',
      unavailable: 'Assistant unavailable.',
      historyTitle: 'Previous chats',
      historyLoading: 'Loading previous chats...',
      historyEmpty: 'No previous chats yet',
      historyUnavailable: 'Previous chats are unavailable right now',
      continueChat: 'Continue chat',
      boxKicker: 'Personal assistant',
      boxTitle: 'How I can help now',
      guardrail: 'The assistant follows this account permissions. It will not show families, students, providers, or admin data you cannot access.',
    };

    if (isOperations) {
      return {
        ...base,
        surfaceLabel: he ? 'מסייע ניהול' : 'Admin assistant',
        intro: he
          ? 'שלום שלוימי. אני יכול לעזור עם מצב המערכת, אנשי קשר, תלמידים, משימות, תוכן, הגדרות, כרטיסי תמיכה ועבודת Codex מתועדת.'
          : 'Hi Shloimie. I can help with BNA state, contacts, students, tasks, content, settings, tickets, hosted AI responses, and tracked Codex/system work.',
        cards: he
          ? [
            ['מצב עבודה', 'בדיקת משימות, חסימות, תוצאות Codex ועבודת מערכת.'],
            ['נתוני BNA', 'עזרה עם תלמידים, ספקים, הרשמות, תשלומים ותוכן.'],
            ['כרטיסים והחלטות', 'יצירת כרטיס ברור או החלטה בלי לערבב בין Pending לעבודת סוכן.'],
          ]
          : [
            ['Work status', 'Inspect tasks, blockers, Codex results, and system work.'],
            ['BNA data', 'Help with students, providers, signups, payments, and content.'],
            ['Tickets and decisions', 'Create a clear ticket or decision without mixing Pending with agent work.'],
          ],
        prompts: he
          ? ['מה חסום עכשיו?', 'הראה לי את מרחבי העבודה שלי.', 'צור כרטיס: צריך לבדוק את המסך בעברית.']
          : ['What is blocked right now?', 'Show my current workspaces.', 'Create a ticket: the Hebrew screen needs review.'],
      };
    }
    if (surface === 'one_time_parent') {
      return {
        ...base,
        helperTitle: 'Robot Scheller',
        surfaceLabel: 'One Time member help',
        intro: "Hi, I'm Robot Scheller, Rabbi Scheller's digital assistant. I can help with the trial, class schedule, child access, attendance questions, and how to ask Rabbi Scheller a class question. I do not show private billing records, other families, student transcripts, access codes, or admin data.",
        cards: [
          ['Trial and schedule', 'Review how the 30-day trial works, where class links appear, and what a parent should expect.'],
          ['Child access', 'Understand how parent and student login fit together without resetting a password or exposing private codes here.'],
          ['Billing and attendance help', 'Prepare a support question about billing or attendance without changing payment or access status.'],
        ],
        prompts: [
          'What should I do during the 30-day trial?',
          'How does my child get into class?',
          'Help me ask about billing or attendance.',
        ],
      };
    }
    if (surface === 'one_time_student') {
      return {
        ...base,
        helperTitle: 'Robot Scheller',
        surfaceLabel: "Rabbi Scheller's digital assistant",
        intro: "Hi, I'm Robot Scheller, Rabbi Scheller's digital assistant. I can help with today's class, the library, worksheets, class questions, and how to ask Rabbi Scheller for help. I do not show parent billing, private parent messages, other students, full transcripts, access codes, or admin data.",
        cards: [
          ['Today and schedule', 'Find what to do next for the Mishnayos class without opening admin or billing information.'],
          ['Library and worksheets', 'Get oriented around recordings, worksheets, and safe class materials.'],
          ['Ask Rabbi Scheller', 'Draft a clear class question without exposing private student or family details.'],
        ],
        prompts: [
          'What should I do for class today?',
          'Where should I look for the latest class material?',
          'Help me ask Rabbi Scheller a question.',
        ],
      };
    }
    if (isParent) {
      return {
        ...base,
        surfaceLabel: he ? 'פורטל הורים' : 'Parent portal',
        intro: he
          ? 'שלום, אני מסייע ההורים של BNA. אפשר לבקש ממני יעדים, התקדמות, צ׳ק-אין, התקנת טאבלט, שאלות לספקים וכרטיסי תמיכה.'
          : "Hi, I'm the BNA parent assistant. I can help with goals, progress, check-ins, tablet setup, provider questions, and support tickets.",
        cards: he
          ? [
            ['ילדים ויעדים', 'הוספת יעד, סימון התקדמות או בדיקת מה נשאר לשבוע.'],
            ['התקנה וסינון', 'פתיחת תהליך התקנת טאבלט והדבקת קוד/סטטוס לבדיקה.'],
            ['ספקים ותמיכה', 'שאלה לספק, שיחה קיימת או כרטיס תמיכה לצוות.'],
          ]
          : [
            ['Children and goals', 'Add a goal, log progress, or check what remains this week.'],
            ['Setup and filtering', 'Start tablet setup and paste back the setup code or status for review.'],
            ['Providers and support', 'Ask a provider, continue a conversation, or create a staff ticket.'],
          ],
        prompts: he
          ? ['הוסף יעד קריאה למנחם השבוע.', 'מנחם סיים את היעד היום.', 'אני צריך עזרה בהתקנת הטאבלט.']
          : ['Add a reading goal for Menachem this week.', 'Menachem finished his goal today.', 'I need help setting up the tablet.'],
      };
    }
    if (isStudent) {
      return {
        ...base,
        surfaceLabel: he ? 'פורטל תלמיד' : 'Student portal',
        intro: he
          ? 'שלום, אני מסייע הלמידה של BNA. אפשר לשאול על סדר היום, יעדים, הבנה, ושאלות לרב או לשלוימי.'
          : "Hi, I'm the BNA learning helper. I can walk you through Today, goals, daily checkoff, questions, reflection, and how to message your rebbi or Shloimie.",
        cards: he
          ? [
            ['היום שלי', 'בדיקת לוח זמנים, צ׳ק-אין ויעדים פתוחים.'],
            ['למידה', 'עזרה לחשוב על שאלה או להבין משימה.'],
            ['הודעה', 'ניסוח הודעה לרב או לשלוימי בצורה ברורה.'],
          ]
          : [
            ['My day', 'Check schedule, check-ins, and open goals.'],
            ['Learning', 'Think through a question or understand an assignment.'],
            ['Message', 'Draft a clear note to your rebbi or Shloimie.'],
          ],
        prompts: he
          ? ['מה אני צריך לעשות היום?', 'עזור לי להבין את היעד שלי.', 'אני רוצה לשלוח שאלה לרב.']
          : ['What do I need to do today?', 'Help me understand my goal.', 'I want to send a question to my rebbi.'],
      };
    }
    if (surface === 'one_time_public') {
      return {
        ...base,
        helperTitle: 'Robot Scheller',
        surfaceLabel: "Rabbi Scheller's automated assistant",
        intro: "Hi - I'm Robot Scheller, Rabbi Scheller's automated assistant. Would you like the current class information or help signing up?",
        cards: [
          ['Sign Up Now', 'Leave the minimum details and the One Time team will follow up.'],
          ['Current class information', 'Ask what the class is learning now and how to join.'],
          ['Speak to Rabbi Scheller', 'Send a short question or contact request.'],
        ],
        prompts: [
          'I want to sign up for the One Time Mishnayos class.',
          'Please send me the current class information.',
          'What is the schedule?',
          'I want to speak to Rabbi Scheller.',
        ],
      };
    }
    if (isOneTimeMember) {
      return {
        ...base,
        helperTitle: 'Robot Scheller',
        surfaceLabel: "Rabbi Scheller's digital assistant",
        intro: "Hi, I'm Robot Scheller, Rabbi Scheller's digital assistant. I can help with member access, the library, the classroom, questions for Rabbi Scheller, support tickets, and account help. This scope does not show BNA school goals, parent dashboards, other students, or admin data.",
        cards: [
          ['Member access', 'Help with login links, access codes, account status, and safe return paths.'],
          ['Library and classroom', 'Find the right recording, worksheet/source sheet, live class, or classroom section.'],
          ['Questions and support', 'Draft a clear question or support ticket without opening a public forum.'],
        ],
        prompts: [
          'I cannot open the member library.',
          'Where is the latest Mishnah class recording?',
          'Help me ask Rabbi Scheller a question.',
        ],
      };
    }
    if (surface === 'one_time_provider') {
      return {
        ...base,
        helperTitle: 'Robot Scheller',
        surfaceLabel: "Rabbi Scheller's digital assistant",
        intro: "Hi Rabbi Scheller. I'm Robot Scheller, your digital assistant for One Time contacts, CRM follow-up, class content, student questions, parent questions, emails, WhatsApp status, tickets, and class workflow. I will keep this workspace scoped to the One Time Mishnayos class.",
        cards: [
          ['CRM and inbox', 'Review contacts, conversations, follow-up notes, email drafts, WhatsApp status, and support tickets for this class.'],
          ['Class content', 'Work on recordings, transcripts, worksheets, slides, library organization, and class-question review.'],
          ['Student activity', 'Check student questions, attendance signals, leaderboard items, and parent-facing updates without exposing platform diagnostics.'],
        ],
        prompts: [
          'Show contacts that need follow-up.',
          'Draft a reply to a parent question.',
          'What class content still needs review?',
        ],
      };
    }
    if (isProvider) {
      return {
        ...base,
        surfaceLabel: he ? 'מרחב ספק' : 'Provider workspace',
        intro: he
          ? 'שלום, אני מסייע הספקים של BNA. אפשר לעדכן פרופיל, שירותים, תמונות, שאלות מהורים, Google וחסימות שדרוג.'
          : "Hi, I'm the BNA provider assistant. I can help with your profile, services, pictures, classroom setup drafts, parent questions, Google status, and upgrade blockers.",
        cards: he
          ? [
            ['פרופיל ציבורי', 'כותרת, תיאור, שירותים, תמונות ואזור שירות.'],
            ['שיחות הורים', 'שאלות נכנסות, תגובות וכרטיסי תמיכה.'],
            ['חיבורים ושדרוג', 'Google Business, מגבלות מסלול וקישור שדרוג כשיהיה מוגדר.'],
          ]
          : [
            ['Public profile', 'Headline, bio, services, pictures, and service area.'],
            ['Classrooms', 'Start a classroom/community setup draft with class count, access, dialogue style, display rules, and message permissions.'],
            ['Parent conversations', 'Inbound questions, replies, and support tickets.'],
            ['Connections', 'Google Business, plan limits, and upgrade link status.'],
          ],
        prompts: he
          ? ['עדכן את תיאור הפרופיל שלי.', 'מה חסר כדי לחבר Google Business?', 'אני רוצה להוסיף תמונה לפרופיל.']
          : ['Start an 8-class classroom where students reply privately to the teacher.', 'Update my profile description.', 'What is missing for Google Business?'],
      };
    }
    if (isSignup) {
      return {
        ...base,
        surfaceLabel: he ? 'עזרת הרשמה' : 'Registration help',
        intro: he
          ? 'שלום, אני כאן כדי לעזור. אפשר לשאול אותי על BNA, על שלטון עצמי, על טופס ההרשמה, הרשאות הורים, תשלום או שליחה.'
          : "Hi, I am here to help. Ask me about BNA, self-governance, the registration form, parent permissions, payment, or submission questions.",
        cards: he
          ? [
            ['טופס', 'עזרה בשדות חסרים או בהבנת הרשאות.'],
            ['תשלום', 'הסבר על מצב תשלום בלי להמציא קישור חדש.'],
            ['שאלה לצוות', 'יצירת הודעה ברורה למשרד.'],
          ]
          : [
            ['Form', 'Help with missing fields or permission wording.'],
            ['Payment', 'Explain payment state without inventing a new link.'],
            ['Office question', 'Create a clear note for the office.'],
          ],
        prompts: he
          ? ['מה חסר בטופס?', 'יש לי שאלה על תשלום.', 'אני צריך עזרה עם הרשאות הורים.']
          : ['What is missing from the form?', 'I have a payment question.', 'I need help with parent permissions.'],
      };
    }
    return {
      ...base,
      surfaceLabel: he ? 'עזרה ציבורית' : 'Public help',
      intro: he
        ? 'שלום, אני כאן כדי לעזור. אפשר לשאול אותי על BNA, על למידה מתוך אחריות, על שלטון עצמי, או לבקש שאעביר הודעה לשלוימי.'
        : "Hi, I am here to help. Ask me about BNA, the 10-1 program, self-governance, accountability, or whether this learning program fits your child.",
      cards: he
        ? [
          ['שלטון עצמי', 'איך ילד לומד לקחת אחריות דרך מטרות, שיקוף וצ׳ק-אין.'],
          ['תוכנית הלמידה', 'שאלות על BNA, תורה, קהילה, הורים ולמידה עצמאית.'],
          ['יצירת קשר', 'השארת הודעה לשלוימי בלי לחשוף מידע פרטי.'],
        ]
        : [
          ['Self-governance', 'How a child learns responsibility through goals, reflection, and check-ins.'],
          ['Learning program', 'Ask about BNA, Torah learning, community, parents, and autonomous learning.'],
          ['Contact', 'Leave a clear message for Shloimie without exposing private data.'],
        ],
      prompts: he
        ? ['איך יוצרים קשר עם שלוימי?', 'מה זה שלטון עצמי אצל ילד?', 'האם BNA מתאים לבן שלי?']
        : ['How do I contact Shloimie?', 'What does self-governance mean for a child?', 'Could BNA fit my son?'],
    };
  }

  function oneTimePublicHelperData() {
    return {
      intro:
        "Hi - I'm Robot Scheller, Rabbi Scheller's automated assistant. Would you like the current class information or help signing up?",
      choices: [
        { id: 'trial', label: 'Sign Up Now' },
        { id: 'current_info', label: 'Current class information' },
        { id: 'schedule', label: 'Class schedule' },
        { id: 'rabbi_question', label: 'Speak to Rabbi Scheller' },
        { id: 'member_access', label: 'Member login' },
      ],
      nudges: {
        first: {
          body: "Hi - I'm Robot Scheller. Want the current free-class details?",
          actions: [
            { type: 'signup', label: 'Sign Up Now' },
            { type: 'link', href: '/api/one-time/public-whatsapp/redirect?intent=free_class', label: 'WhatsApp' },
          ],
        },
        second: {
          body: oneTimeJoinMomentCopy(),
          actions: [
            { type: 'signup', label: 'Sign Up Now' },
            { type: 'path', path: 'schedule', label: 'Schedule' },
          ],
        },
      },
      paths: {
        schedule: {
          body: `${oneTimeJoinMomentCopy()} Ask your schedule question and we will help you get started.`,
          actions: [
            { type: 'prefill', label: 'Ask schedule question', prompt: 'I have a schedule question about the One Time Mishnayos class: ' },
            { type: 'signup', label: 'Sign Up Now' },
          ],
        },
        current_info: {
          body: `${oneTimeJoinMomentCopy()} Leave your name and contact information and the One Time team will send the current free-class details.`,
          actions: [
            { type: 'signup', label: 'Sign Up Now' },
            { type: 'link', href: '/api/one-time/public-whatsapp/redirect?intent=current_info', label: 'Open WhatsApp' },
          ],
        },
        program: {
          body: 'One Time is Rabbi Scheller\'s live Mishnayos class for boys who should enjoy learning, review clearly, and feel proud of their progress.',
          actions: [
            { type: 'prefill', label: 'Ask about program', prompt: 'I want to know if the One Time Mishnayos class is right for my child: ' },
          ],
        },
        trial: {
          body: 'Tell us who to contact and the One Time team will follow up with the current free-class details. No charge today.',
          actions: [
            { type: 'signup', label: 'Sign Up Now' },
            { type: 'link', href: '/api/one-time/public-whatsapp/redirect?intent=free_class', label: 'Open WhatsApp' },
          ],
        },
        member_access: {
          body: 'Already joined? Open the member login path here.',
          actions: [
            { type: 'link', href: '/rabbi-member', label: 'Member login' },
          ],
        },
        rabbi_question: {
          body: 'Send a short question or contact request for Rabbi Scheller.',
          actions: [
            { type: 'prefill', label: 'Leave message', prompt: 'I would like Rabbi Scheller to follow up about: ' },
          ],
        },
      },
      safety:
        'This sounds urgent or safety-related. Please bring in a trusted adult right now and contact local emergency support if anyone may be in danger. This public helper cannot handle emergencies.',
    };
  }

  function fallbackPublicHelperData() {
    if (isHebrew()) {
      return {
        intro:
          '\u05e9\u05dc\u05d5\u05dd - \u05d0\u05e0\u05d9 \u05db\u05d0\u05df \u05dc\u05e2\u05d6\u05d5\u05e8. \u05d0\u05ea\u05dd \u05e8\u05d5\u05e6\u05d9\u05dd \u05dc\u05e8\u05e9\u05d5\u05dd \u05d9\u05dc\u05d3, \u05dc\u05d4\u05d1\u05d9\u05df \u05d0\u05d9\u05da \u05d4\u05ea\u05d5\u05db\u05e0\u05d9\u05ea \u05e2\u05d5\u05d1\u05d3\u05ea, \u05d0\u05d5 \u05dc\u05d4\u05e6\u05d8\u05e8\u05e3 \u05db\u05e0\u05d5\u05ea\u05e0\u05d9 \u05e9\u05d9\u05e8\u05d5\u05ea?',
        choices: [
          { id: 'signup', label: '\u05dc\u05e8\u05e9\u05d5\u05dd \u05d9\u05dc\u05d3' },
          { id: 'learn_bna', label: '\u05dc\u05d4\u05d1\u05d9\u05df \u05e2\u05dc \u05d1\u05e0\u05d9 \u05e0\u05d1\u05d9\u05d0\u05d9\u05dd' },
          { id: 'student', label: '\u05d0\u05e0\u05d9 \u05ea\u05dc\u05de\u05d9\u05d3' },
          { id: 'provider', label: '\u05dc\u05d4\u05e6\u05d8\u05e8\u05e3 \u05db\u05e0\u05d5\u05ea\u05df \u05e9\u05d9\u05e8\u05d5\u05ea' },
          { id: 'self_governance', label: '\u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea' },
          { id: 'sodas', label: '\u05e2\u05d6\u05e8\u05d4 \u05dc\u05d4\u05d5\u05e8\u05d9\u05dd' },
          { id: 'question', label: '\u05dc\u05e9\u05d0\u05d5\u05dc \u05e9\u05d0\u05dc\u05d4' },
        ],
        nudges: {
          first: { body: '\u05e6\u05e8\u05d9\u05db\u05d9\u05dd \u05e2\u05d6\u05e8\u05d4 \u05dc\u05de\u05e6\u05d5\u05d0 \u05d0\u05ea \u05d4\u05db\u05d9\u05d5\u05d5\u05df?', actions: [{ type: 'open', label: '\u05dc\u05e4\u05ea\u05d5\u05d7' }] },
          second: { body: '\u05d0\u05e0\u05d9 \u05d9\u05db\u05d5\u05dc \u05dc\u05e2\u05d6\u05d5\u05e8 \u05e2\u05dd \u05e8\u05d9\u05e9\u05d5\u05dd, \u05de\u05d5\u05d3\u05dc \u05d4\u05dc\u05d9\u05de\u05d5\u05d3, \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea \u05d0\u05d5 \u05e0\u05d5\u05ea\u05e0\u05d9 \u05e9\u05d9\u05e8\u05d5\u05ea.', actions: [] },
        },
        paths: {},
      };
    }
    return {
      intro:
        "Hi - I'm here to help. Are you looking to sign up a child, learn how the program works, or join as a service provider?",
      choices: [
        { id: 'signup', label: 'Sign up a child' },
        { id: 'learn_bna', label: 'Learn about BNA' },
        { id: 'student', label: "I'm a student" },
        { id: 'provider', label: 'Become a service provider' },
        { id: 'self_governance', label: 'Ask about self-governance' },
        { id: 'sodas', label: 'Parenting / SODAS help' },
        { id: 'question', label: 'Ask a question' },
      ],
      nudges: {
        first: { body: 'Need help finding the right path?', actions: [{ type: 'open', label: 'Open helper' }] },
        second: {
          body:
            'I can help with signup, the school model, self-governance, or becoming a service provider.',
          actions: [
            { type: 'path', path: 'signup', label: 'Sign up' },
            { type: 'path', path: 'provider', label: 'Service provider' },
            { type: 'path', path: 'learn_bna', label: 'How BNA works' },
            { type: 'path', path: 'question', label: 'Ask a question' },
          ],
        },
      },
      paths: {},
      safety:
        'This sounds like it may involve safety or urgent harm. Please bring in a trusted adult right now, and contact local emergency support if anyone may be in danger. What adult can be with you or the child now?',
    };
  }

  function publicHelperData() {
    if (surface === 'one_time_public') return oneTimePublicHelperData();
    const lang = isHebrew() ? 'he' : 'en';
    const helper = window.BNAHelperKnowledge;
    if (helper && typeof helper.get === 'function') {
      try {
        return helper.get(lang) || fallbackPublicHelperData();
      } catch {}
    }
    return fallbackPublicHelperData();
  }

  function ensureAssistantViewportMeta() {
    const wanted = 'interactive-widget=resizes-content';
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', `width=device-width, initial-scale=1, ${wanted}`);
      document.head.appendChild(meta);
      return;
    }
    const content = meta.getAttribute('content') || 'width=device-width, initial-scale=1';
    if (!content.includes('interactive-widget=')) {
      meta.setAttribute('content', `${content}, ${wanted}`);
    }
  }

  ensureAssistantViewportMeta();

  const style = document.createElement('style');
  style.textContent = `
    :root {
      --app-vh: 100dvh;
      --keyboard-offset: 0px;
      --assistant-header-height: 56px;
      --assistant-composer-height: 76px;
      --assistant-mobile-panel-height: clamp(280px, calc(var(--app-vh) * 0.72), calc(var(--app-vh) - 24px));
    }
    html,
    body {
      max-width: 100%;
      overflow-x: hidden;
    }
    body.bna-universal-assistant-active .parent-assistant-dock,
    body.bna-universal-assistant-active .student-helper-dock {
      display: none !important;
    }
    .bna-bot-launcher {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 6400;
      border: 0;
      border-radius: 999px;
      min-height: 48px;
      padding: 0 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      background: #173f64;
      color: #fff;
      font: 900 0.92rem "Trebuchet MS", Verdana, sans-serif;
      box-shadow: 0 16px 34px rgba(23, 63, 100, 0.28);
      cursor: pointer;
    }
    .bna-bot-launcher-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #e3b848;
      box-shadow: 0 0 0 4px rgba(227, 184, 72, 0.22);
    }
    .bna-bot-avatar {
      flex: 0 0 auto;
      width: 34px;
      height: 34px;
      border: 2px solid rgba(237, 229, 24, 0.76);
      border-radius: 999px;
      background: linear-gradient(150deg, #25d366 0%, #0e9f73 44%, #0d3140 100%);
      box-shadow: 0 0 0 4px rgba(237, 229, 24, 0.14);
    }
    .bna-bot-avatar::after {
      content: "RS";
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      color: #fff;
      font-size: 0.68rem;
      font-weight: 900;
      letter-spacing: 0;
    }
    .bna-bot-nudge {
      position: fixed;
      right: 18px;
      bottom: 78px;
      z-index: 6399;
      width: min(330px, calc(100vw - 36px));
      display: none;
      gap: 0.65rem;
      padding: 0.78rem;
      border: 1px solid rgba(23, 32, 25, 0.14);
      border-radius: 8px;
      background: #fffdf7;
      color: #172019;
      box-shadow: 0 18px 46px rgba(27, 49, 32, 0.18);
      font: 0.9rem "Trebuchet MS", Verdana, sans-serif;
    }
    .bna-bot-nudge.is-visible {
      display: grid;
    }
    [dir="rtl"] .bna-bot-nudge {
      right: auto;
      left: 18px;
      direction: rtl;
    }
    .bna-bot-nudge-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .bna-bot-nudge-body {
      margin: 0;
      line-height: 1.35;
      font-weight: 800;
    }
    .bna-bot-nudge-close {
      flex: 0 0 auto;
      width: 28px;
      height: 28px;
      border: 1px solid rgba(23, 32, 25, 0.14);
      border-radius: 999px;
      background: #ffffff;
      color: #172019;
      cursor: pointer;
    }
    .bna-bot-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: auto;
      z-index: 6401;
      width: min(460px, 100vw);
      height: var(--app-vh);
      max-height: var(--app-vh);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto auto;
      box-sizing: border-box;
      overflow: hidden;
      background: #fffaf0;
      color: #172019;
      border-left: 1px solid rgba(23, 32, 25, 0.12);
      box-shadow: -24px 0 70px rgba(27, 49, 32, 0.18);
      transform: translateX(105%);
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.22s ease;
    }
    .bna-bot-panel.is-open {
      transform: translateX(0);
      visibility: visible;
      pointer-events: auto;
    }
    [dir="rtl"] .bna-bot-panel {
      right: auto;
      left: 0;
      border-left: 0;
      border-right: 1px solid rgba(23, 32, 25, 0.12);
      box-shadow: 24px 0 70px rgba(27, 49, 32, 0.18);
      transform: translateX(-105%);
    }
    [dir="rtl"] .bna-bot-panel.is-open { transform: translateX(0); }
    [dir="rtl"] .bna-bot-launcher { right: auto; left: 18px; }
    body.bna-assistant-surface-one-time-public .bna-bot-launcher,
    body.bna-assistant-surface-one-time-parent .bna-bot-launcher,
    body.bna-assistant-surface-one-time-student .bna-bot-launcher,
    body.bna-assistant-surface-one-time-member .bna-bot-launcher,
    body.bna-assistant-surface-one-time-provider .bna-bot-launcher {
      border: 1px solid rgba(237, 229, 24, 0.48);
      background: #080910;
      color: #ffffff;
      box-shadow: 0 16px 34px rgba(8, 9, 16, 0.34);
    }
    body.bna-assistant-surface-one-time-public .bna-bot-launcher .bna-bot-avatar,
    body.bna-assistant-surface-one-time-parent .bna-bot-launcher .bna-bot-avatar,
    body.bna-assistant-surface-one-time-student .bna-bot-launcher .bna-bot-avatar,
    body.bna-assistant-surface-one-time-member .bna-bot-launcher .bna-bot-avatar,
    body.bna-assistant-surface-one-time-provider .bna-bot-launcher .bna-bot-avatar {
      width: 38px;
      height: 38px;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-launcher-dot,
    body.bna-assistant-surface-one-time-parent .bna-bot-launcher-dot,
    body.bna-assistant-surface-one-time-student .bna-bot-launcher-dot,
    body.bna-assistant-surface-one-time-member .bna-bot-launcher-dot,
    body.bna-assistant-surface-one-time-provider .bna-bot-launcher-dot {
      background: #ede518;
      box-shadow: 0 0 0 4px rgba(237, 229, 24, 0.22);
    }
    body.bna-assistant-surface-one-time-public .bna-bot-head,
    body.bna-assistant-surface-one-time-parent .bna-bot-head,
    body.bna-assistant-surface-one-time-student .bna-bot-head,
    body.bna-assistant-surface-one-time-member .bna-bot-head,
    body.bna-assistant-surface-one-time-provider .bna-bot-head {
      border-bottom: 1px solid rgba(237, 229, 24, 0.36);
      background: #080910;
      color: #ffffff;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-head span,
    body.bna-assistant-surface-one-time-parent .bna-bot-head span,
    body.bna-assistant-surface-one-time-student .bna-bot-head span,
    body.bna-assistant-surface-one-time-member .bna-bot-head span,
    body.bna-assistant-surface-one-time-provider .bna-bot-head span {
      color: rgba(255, 255, 255, 0.74);
    }
    body.bna-assistant-surface-one-time-public .bna-bot-panel,
    body.bna-assistant-surface-one-time-parent .bna-bot-panel,
    body.bna-assistant-surface-one-time-student .bna-bot-panel,
    body.bna-assistant-surface-one-time-member .bna-bot-panel,
    body.bna-assistant-surface-one-time-provider .bna-bot-panel {
      border-color: rgba(237, 229, 24, 0.28);
      background: #15171d;
      color: #ffffff;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-form,
    body.bna-assistant-surface-one-time-parent .bna-bot-form,
    body.bna-assistant-surface-one-time-student .bna-bot-form,
    body.bna-assistant-surface-one-time-member .bna-bot-form,
    body.bna-assistant-surface-one-time-provider .bna-bot-form,
    body.bna-assistant-surface-one-time-public .bna-bot-history,
    body.bna-assistant-surface-one-time-parent .bna-bot-history,
    body.bna-assistant-surface-one-time-student .bna-bot-history,
    body.bna-assistant-surface-one-time-member .bna-bot-history,
    body.bna-assistant-surface-one-time-provider .bna-bot-history {
      background: #0f1117;
      border-color: rgba(237, 229, 24, 0.18);
    }
    body.bna-assistant-surface-one-time-public .bna-bot-message.assistant,
    body.bna-assistant-surface-one-time-parent .bna-bot-message.assistant,
    body.bna-assistant-surface-one-time-student .bna-bot-message.assistant,
    body.bna-assistant-surface-one-time-member .bna-bot-message.assistant,
    body.bna-assistant-surface-one-time-provider .bna-bot-message.assistant,
    body.bna-assistant-surface-one-time-public .bna-bot-history-state,
    body.bna-assistant-surface-one-time-parent .bna-bot-history-state,
    body.bna-assistant-surface-one-time-student .bna-bot-history-state,
    body.bna-assistant-surface-one-time-member .bna-bot-history-state,
    body.bna-assistant-surface-one-time-provider .bna-bot-history-state {
      border-color: rgba(237, 229, 24, 0.18);
      background: #080910;
      color: #ffffff;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-message.user,
    body.bna-assistant-surface-one-time-parent .bna-bot-message.user,
    body.bna-assistant-surface-one-time-student .bna-bot-message.user,
    body.bna-assistant-surface-one-time-member .bna-bot-message.user,
    body.bna-assistant-surface-one-time-provider .bna-bot-message.user,
    body.bna-assistant-surface-one-time-public .bna-helper-action,
    body.bna-assistant-surface-one-time-parent .bna-helper-action,
    body.bna-assistant-surface-one-time-student .bna-helper-action,
    body.bna-assistant-surface-one-time-member .bna-helper-action,
    body.bna-assistant-surface-one-time-provider .bna-helper-action {
      border-color: rgba(237, 229, 24, 0.6);
      background: #ede518;
      color: #080910;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-send,
    body.bna-assistant-surface-one-time-parent .bna-bot-send,
    body.bna-assistant-surface-one-time-student .bna-bot-send,
    body.bna-assistant-surface-one-time-member .bna-bot-send,
    body.bna-assistant-surface-one-time-provider .bna-bot-send {
      background: #ede518;
      color: #080910;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-launcher,
    body.one-time-review-active.bna-assistant-surface-one-time-parent .bna-bot-launcher,
    body.one-time-review-active.bna-assistant-surface-one-time-student .bna-bot-launcher,
    body.one-time-review-active.bna-assistant-surface-one-time-member .bna-bot-launcher,
    body.bna-assistant-surface-one-time-provider .bna-bot-launcher {
      right: 14px;
      bottom: 14px;
      width: 46px;
      min-width: 46px;
      min-height: 46px;
      padding: 0;
      justify-content: center;
      font-size: 0;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-launcher {
      top: auto;
      right: 22px;
      bottom: calc(22px + env(safe-area-inset-bottom, 0px));
      width: 56px;
      min-width: 56px;
      min-height: 56px;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-nudge {
      top: auto;
      right: 22px;
      bottom: calc(92px + env(safe-area-inset-bottom, 0px));
    }
    body.bna-assistant-surface-one-time-member .bna-bot-launcher,
    body.bna-assistant-surface-one-time-member .bna-bot-nudge {
      display: none;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-launcher-dot,
    body.one-time-review-active.bna-assistant-surface-one-time-parent .bna-bot-launcher-dot,
    body.one-time-review-active.bna-assistant-surface-one-time-student .bna-bot-launcher-dot,
    body.one-time-review-active.bna-assistant-surface-one-time-member .bna-bot-launcher-dot,
    body.bna-assistant-surface-one-time-provider .bna-bot-launcher-dot {
      width: 12px;
      height: 12px;
    }
    @media (max-width: 520px) {
      body.bna-assistant-surface-one-time-public .bna-bot-launcher,
      body.one-time-review-active.bna-assistant-surface-one-time-parent .bna-bot-launcher,
      body.one-time-review-active.bna-assistant-surface-one-time-student .bna-bot-launcher,
      body.one-time-review-active.bna-assistant-surface-one-time-member .bna-bot-launcher,
      body.bna-assistant-surface-one-time-provider .bna-bot-launcher {
        right: 10px;
        bottom: 10px;
        width: 46px;
        min-width: 46px;
        min-height: 46px;
        padding: 0;
        justify-content: center;
        font-size: 0;
      }
      body.bna-assistant-surface-one-time-public .bna-bot-launcher {
        top: auto;
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        width: 54px;
        min-width: 54px;
        min-height: 54px;
      }
      body.bna-assistant-surface-one-time-public .bna-bot-nudge {
        top: auto;
        right: 12px;
        bottom: calc(78px + env(safe-area-inset-bottom, 0px));
      }
      body.bna-assistant-surface-one-time-member .bna-bot-launcher,
      body.bna-assistant-surface-one-time-member .bna-bot-nudge {
        display: none;
      }
      body.bna-assistant-surface-one-time-public .bna-bot-launcher-dot,
      body.one-time-review-active.bna-assistant-surface-one-time-parent .bna-bot-launcher-dot,
      body.one-time-review-active.bna-assistant-surface-one-time-student .bna-bot-launcher-dot,
      body.one-time-review-active.bna-assistant-surface-one-time-member .bna-bot-launcher-dot,
      body.bna-assistant-surface-one-time-provider .bna-bot-launcher-dot {
        width: 12px;
        height: 12px;
      }
    }
    body.bna-assistant-surface-one-time-public .bna-bot-nudge,
    body.bna-assistant-surface-one-time-public .bna-bot-nudge-close {
      border-color: rgba(237, 229, 24, 0.28);
      background: #080910;
      color: #ffffff;
    }
    body.bna-assistant-surface-one-time-public .bna-bot-nudge-body {
      color: #ffffff;
    }
    .bna-bot-head {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
      background: #173f64;
      color: #fff;
    }
    .bna-bot-head-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .bna-bot-head strong { display: block; font-size: 1rem; }
    .bna-bot-head span { display: block; color: rgba(255,255,255,0.78); font-size: 0.78rem; }
    .bna-bot-head-actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .bna-bot-history-toggle,
    .bna-bot-close {
      width: 36px;
      height: 36px;
      border: 1px solid rgba(255,255,255,0.32);
      border-radius: 999px;
      background: transparent;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
    }
    .bna-bot-history-toggle {
      display: grid;
      place-items: center;
    }
    .bna-bot-history-toggle svg {
      width: 18px;
      height: 18px;
      display: block;
    }
    .bna-bot-close { font-size: 1.15rem; }
    .bna-bot-history {
      display: none;
      border-bottom: 1px solid rgba(23, 32, 25, 0.1);
      background: #fffdf7;
      padding: 0.7rem;
      max-height: min(42vh, 320px);
      overflow: auto;
      min-width: 0;
    }
    .bna-bot-history.is-open { display: block; }
    .bna-bot-history-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 0.45rem;
      font-size: 0.8rem;
      font-weight: 800;
      color: #173f64;
    }
    .bna-bot-history-list {
      display: grid;
      gap: 0.42rem;
    }
    .bna-bot-history-item {
      width: 100%;
      display: grid;
      gap: 0.18rem;
      text-align: left;
      border: 1px solid rgba(23, 32, 25, 0.1);
      border-radius: 8px;
      background: #fffaf0;
      color: #172019;
      padding: 0.55rem 0.65rem;
      cursor: pointer;
      font: inherit;
    }
    [dir="rtl"] .bna-bot-history-item { text-align: right; }
    .bna-bot-history-item:hover,
    .bna-bot-history-item:focus-visible {
      outline: 2px solid rgba(23, 63, 100, 0.28);
      border-color: rgba(23, 63, 100, 0.28);
    }
    .bna-bot-history-item.is-active {
      border-color: #173f64;
      background: #eef6ff;
    }
    .bna-bot-history-name {
      font-size: 0.84rem;
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .bna-bot-history-meta {
      color: #667085;
      font-size: 0.72rem;
      overflow-wrap: anywhere;
    }
    .bna-bot-history-state {
      padding: 0.65rem;
      color: #667085;
      font-size: 0.82rem;
      border: 1px dashed rgba(23, 32, 25, 0.14);
      border-radius: 8px;
      background: #ffffff;
    }
    .bna-bot-thread {
      min-height: 0;
      min-width: 0;
      overflow: auto;
      overscroll-behavior: contain;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.72rem;
    }
    .bna-bot-message {
      width: fit-content;
      max-width: 88%;
      border-radius: 8px;
      padding: 0.68rem 0.78rem;
      line-height: 1.42;
      font: 0.92rem "Trebuchet MS", Verdana, sans-serif;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .bna-bot-message.assistant {
      align-self: flex-start;
      background: #ffffff;
      border: 1px solid rgba(23, 32, 25, 0.12);
      color: #172019;
    }
    .bna-bot-message.user {
      align-self: flex-end;
      background: #173f64;
      color: #ffffff;
    }
    [dir="rtl"] .bna-bot-message.assistant { align-self: flex-end; }
    [dir="rtl"] .bna-bot-message.user { align-self: flex-start; }
    .bna-helper-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.42rem;
      margin-top: 0.58rem;
      white-space: normal;
    }
    .bna-helper-action {
      border: 1px solid rgba(23, 63, 100, 0.22);
      border-radius: 8px;
      background: #eef6ff;
      color: #173f64;
      padding: 0.5rem 0.62rem;
      font: 900 0.78rem "Trebuchet MS", Verdana, sans-serif;
      cursor: pointer;
      text-align: start;
      line-height: 1.15;
    }
    .bna-helper-action:hover,
    .bna-helper-action:focus-visible {
      outline: 2px solid rgba(23, 63, 100, 0.25);
      background: #ffffff;
    }
    .bna-bot-typing {
      display: none;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1rem 0.75rem;
      color: #60705f;
      font: 0.82rem "Trebuchet MS", Verdana, sans-serif;
      min-width: 0;
    }
    .bna-bot-typing.is-visible { display: flex; }
    .bna-bot-spinner {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      border: 2px solid rgba(23, 63, 100, 0.18);
      border-top-color: #173f64;
      animation: bnaBotSpin 0.8s linear infinite;
    }
    @keyframes bnaBotSpin { to { transform: rotate(360deg); } }
    .bna-bot-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.55rem;
      padding: 0.75rem 0.75rem max(0.75rem, env(safe-area-inset-bottom));
      border-top: 1px solid rgba(23, 32, 25, 0.12);
      background: #fff;
      box-sizing: border-box;
      min-width: 0;
      flex-shrink: 0;
    }
    .bna-bot-input {
      min-height: 44px;
      max-height: 130px;
      border: 1px solid rgba(47, 100, 141, 0.22);
      border-radius: 8px;
      background: #fff;
      color: #172019;
      padding: 0.7rem 0.75rem;
      font: 16px/1.25 "Trebuchet MS", Verdana, sans-serif;
      resize: none;
      overflow: auto;
      min-width: 0;
      -webkit-text-size-adjust: 100%;
      touch-action: manipulation;
    }
    .bna-bot-send {
      min-width: 52px;
      border: 0;
      border-radius: 8px;
      background: #e3b848;
      color: #172019;
      font: 900 0.88rem "Trebuchet MS", Verdana, sans-serif;
      cursor: pointer;
    }
    .bna-bot-send:disabled,
    .bna-bot-input:disabled {
      opacity: 0.62;
      cursor: wait;
    }
    @media (max-width: 520px) {
      .bna-bot-launcher {
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        max-width: calc(100vw - 24px);
        min-height: 44px;
        padding: 0 0.85rem;
      }
      [dir="rtl"] .bna-bot-launcher { left: 12px; right: auto; }
      .bna-bot-nudge {
        right: 12px;
        bottom: 70px;
        width: min(320px, calc(100vw - 24px));
      }
      [dir="rtl"] .bna-bot-nudge {
        right: auto;
        left: 12px;
      }
      .bna-bot-panel,
      [dir="rtl"] .bna-bot-panel {
        top: auto;
        right: 8px;
        bottom: calc(max(8px, env(safe-area-inset-bottom)) + var(--keyboard-offset));
        left: 8px;
        width: auto;
        max-width: calc(100vw - 16px);
        height: var(--assistant-mobile-panel-height);
        min-height: min(280px, calc(var(--app-vh) - 24px));
        max-height: calc(var(--app-vh) - 16px);
        border: 1px solid rgba(23, 32, 25, 0.12);
        border-radius: 16px 16px 10px 10px;
        box-shadow: 0 -18px 52px rgba(27, 49, 32, 0.22);
        transform: translateY(110%);
        contain: layout paint;
      }
      .bna-bot-panel.is-open,
      [dir="rtl"] .bna-bot-panel.is-open { transform: translateY(0); }
      .bna-bot-launcher.is-panel-open {
        bottom: calc(var(--assistant-mobile-panel-height) + var(--keyboard-offset) + 18px);
        z-index: 6402;
      }
      body.bna-assistant-keyboard-open .bna-bot-launcher.is-panel-open {
        display: none;
      }
      .bna-bot-head { padding: 0.82rem 0.9rem; }
      .bna-bot-thread {
        padding: 0.78rem;
        max-width: 100%;
      }
      .bna-bot-form { padding: 0.65rem; }
      .bna-bot-input { font-size: 16px; }
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('bna-universal-assistant-active');
  document.body.classList.add(`bna-assistant-surface-${surface.replace(/_/g, '-')}`);
  const copy = surfaceConfig();
  const isOneTimeAssistantSurface = surface.startsWith('one_time_');
  const oneTimeAssistantAvatar = '<span class="bna-bot-avatar" aria-hidden="true"></span>';

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'bna-bot-launcher';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'bnaBotPanel');
  const launcherLabel = surface === 'one_time_public'
    ? 'Open Rabbi Scheller’s WhatsApp assistant.'
    : copy.helperTitle;
  launcher.setAttribute('aria-label', launcherLabel);
  launcher.setAttribute('title', launcherLabel);
  launcher.innerHTML = `${isOneTimeAssistantSurface ? oneTimeAssistantAvatar : '<span class="bna-bot-launcher-dot"></span>'}<span>${escapeHtml(copy.helperTitle)}</span>`;

  const nudge = document.createElement('div');
  nudge.className = 'bna-bot-nudge';
  nudge.setAttribute('role', 'status');
  nudge.setAttribute('aria-live', 'polite');

  const panel = document.createElement('aside');
  panel.className = 'bna-bot-panel assistant-shell';
  panel.id = 'bnaBotPanel';
  panel.setAttribute('aria-label', copy.helperTitle);
  panel.setAttribute('aria-hidden', 'true');
  if ('inert' in panel) panel.inert = true;

  panel.innerHTML = `
    <div class="bna-bot-head">
      <div class="bna-bot-head-top">
        ${isOneTimeAssistantSurface ? oneTimeAssistantAvatar : ''}
        <div><strong>${escapeHtml(copy.helperTitle)}</strong><span data-bot-subtitle>${escapeHtml(surfaceLabel())}</span></div>
        <div class="bna-bot-head-actions">
          <button class="bna-bot-history-toggle" type="button" data-history-toggle aria-label="${escapeAttr(copy.history)}" title="${escapeAttr(copy.history)}" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 12a9 9 0 1 0 3-6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M3 4v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
          <button class="bna-bot-close" type="button" aria-label="${escapeAttr(copy.close)}">x</button>
        </div>
      </div>
    </div>
    <div class="bna-bot-history" data-history-panel>
      <div class="bna-bot-history-head"><span>${escapeHtml(historyTitleCopy())}</span></div>
      <div class="bna-bot-history-list" data-history-list></div>
    </div>
    <div class="bna-bot-thread assistant-messages" data-thread></div>
    <div class="bna-bot-typing" data-typing><span class="bna-bot-spinner"></span><span>${escapeHtml(copy.thinking)}</span></div>
    <form class="bna-bot-form assistant-composer" data-chat-form>
      <textarea class="bna-bot-input" name="message" rows="1" maxlength="4000" inputmode="text" enterkeyhint="send" autocapitalize="sentences" autocomplete="off" autocorrect="on" spellcheck="true" aria-label="${escapeAttr(copy.placeholder)}" placeholder="${escapeAttr(copy.placeholder)}"></textarea>
      <button class="bna-bot-send" type="submit" aria-label="${escapeAttr(copy.send)}">${escapeHtml(copy.send)}</button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(nudge);
  document.body.appendChild(panel);

  const closeButton = panel.querySelector('.bna-bot-close');
  const historyToggle = panel.querySelector('[data-history-toggle]');
  const historyPanel = panel.querySelector('[data-history-panel]');
  const historyList = panel.querySelector('[data-history-list]');
  const threadEl = panel.querySelector('[data-thread]');
  const typingEl = panel.querySelector('[data-typing]');
  const form = panel.querySelector('[data-chat-form]');
  const input = form.elements.message;
  const sendButton = form.querySelector('.bna-bot-send');
  let threadId = localStorage.getItem(`${storagePrefix}:threadId`) || '';
  let historyLoaded = false;
  let publicAutoPromptTimer = null;
  let publicFollowupTimer = null;
  let publicTypingTimer = null;
  let assistantKeyboardSyncTimer = null;
  let dismissedPublicPrompt = publicNudgesSuppressed();

  function resizeAssistantInput() {
    input.style.height = 'auto';
    const nextHeight = Math.min(130, Math.max(44, input.scrollHeight || 44));
    input.style.height = `${nextHeight}px`;
  }

  function syncVisualViewportHeight() {
    const visualViewport = window.visualViewport;
    const height = visualViewport?.height || document.documentElement.clientHeight || window.innerHeight;
    const layoutHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, height);
    const keyboardOffset = Math.max(0, layoutHeight - height - (visualViewport?.offsetTop || 0));
    document.documentElement.style.setProperty('--app-vh', `${Math.max(320, Math.round(height))}px`);
    document.documentElement.style.setProperty('--keyboard-offset', `${Math.round(keyboardOffset)}px`);
    document.body?.classList.toggle('bna-assistant-keyboard-open', keyboardOffset > 40);
  }

  function scheduleAssistantKeyboardSync(delay = 0) {
    if (assistantKeyboardSyncTimer) clearTimeout(assistantKeyboardSyncTimer);
    assistantKeyboardSyncTimer = setTimeout(() => {
      assistantKeyboardSyncTimer = null;
      keepAssistantComposerReachable();
    }, delay);
  }

  function keepAssistantComposerReachable() {
    if (!panel.classList.contains('is-open')) return;
    resizeAssistantInput();
    syncVisualViewportHeight();
    threadEl.scrollTop = threadEl.scrollHeight;
    if (!isMobileKeyboardSurface()) return;
    try {
      form.scrollIntoView({ block: 'end', inline: 'nearest' });
    } catch {}
  }

  function handleAssistantViewportChange() {
    syncVisualViewportHeight();
    if (!panel.classList.contains('is-open')) return;
    window.requestAnimationFrame?.(keepAssistantComposerReachable);
    scheduleAssistantKeyboardSync(80);
  }

  function isMobileKeyboardSurface() {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
    const viewportWidth = Math.min(window.innerWidth || 9999, document.documentElement.clientWidth || 9999);
    return Boolean(coarsePointer || viewportWidth < 760);
  }

  function focusAssistantInput(options = {}) {
    if (options.force !== true && isMobileKeyboardSurface()) return;
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }

  window.visualViewport?.addEventListener('resize', handleAssistantViewportChange);
  window.visualViewport?.addEventListener('scroll', handleAssistantViewportChange);
  window.visualViewport?.addEventListener('geometrychange', handleAssistantViewportChange);
  window.addEventListener('resize', handleAssistantViewportChange);
  window.addEventListener('orientationchange', () => scheduleAssistantKeyboardSync(140));
  syncVisualViewportHeight();

  appendMessage('assistant', introCopy(), { actions: publicInitialHelperActions() });

  function surfaceLabel() {
    return surfaceConfig().surfaceLabel;
  }

  function historyTitleCopy() {
    return isHebrew() ? 'שיחות קודמות' : (copy.historyTitle || 'Previous chats');
  }

  function historyLoadingCopy() {
    return isHebrew() ? 'טוען שיחות קודמות...' : (copy.historyLoading || 'Loading previous chats...');
  }

  function historyEmptyCopy() {
    return isHebrew() ? 'אין שיחות קודמות עדיין' : (copy.historyEmpty || 'No previous chats yet');
  }

  function historyUnavailableCopy() {
    return isHebrew() ? 'אי אפשר לטעון שיחות קודמות כרגע' : (copy.historyUnavailable || 'Previous chats are unavailable right now');
  }

  function continueChatCopy() {
    return isHebrew() ? 'המשך שיחה' : (copy.continueChat || 'Continue chat');
  }

  function publicFollowupCopy() {
    if (surface === 'one_time_public') {
      return oneTimeJoinMomentCopy();
    }
    return isHebrew()
      ? 'אפשר לשאול על תוכנית 10-1, על שלטון עצמי, או לשלוח לשלוימי הודעה קצרה.'
      : 'Want to ask about the 10-1 program, self-governance, or send Shloimie a quick note?';
  }

  function publicNudgeSuppressUntilKey() {
    return `${storagePrefix}:helperNudgeSuppressUntil`;
  }

  function publicNudgesSuppressed() {
    try {
      const until = Number(localStorage.getItem(publicNudgeSuppressUntilKey()) || '0');
      if (until > Date.now()) return true;
      if (until) localStorage.removeItem(publicNudgeSuppressUntilKey());
      return sessionStorage.getItem(`${storagePrefix}:publicPromptDismissed`) === '1';
    } catch {
      return false;
    }
  }

  function hidePublicNudge() {
    nudge.classList.remove('is-visible');
    nudge.textContent = '';
  }

  function showPublicNudge(stage) {
    if (!isPublicLeadSurface() || dismissedPublicPrompt || panel.classList.contains('is-open')) return;
    const data = publicHelperData();
    const config = stage === 'second' ? data.nudges?.second : data.nudges?.first;
    if (!config?.body) return;
    nudge.innerHTML = `
      <div class="bna-bot-nudge-head">
        <p class="bna-bot-nudge-body">${escapeHtml(config.body)}</p>
        <button type="button" class="bna-bot-nudge-close" data-nudge-dismiss aria-label="${escapeAttr(copy.close)}">x</button>
      </div>
    `;
    const actionButtons = renderActionButtons(config.actions || [{ type: 'open', label: 'Open helper' }]);
    if (actionButtons) nudge.appendChild(actionButtons);
    nudge.classList.add('is-visible');
  }

  function clearPublicFollowup() {
    if (publicAutoPromptTimer) clearTimeout(publicAutoPromptTimer);
    if (publicFollowupTimer) clearTimeout(publicFollowupTimer);
    if (publicTypingTimer) clearTimeout(publicTypingTimer);
    publicAutoPromptTimer = null;
    publicFollowupTimer = null;
    publicTypingTimer = null;
    typingEl.classList.remove('is-visible');
    hidePublicNudge();
  }

  function dismissPublicPromptForSession() {
    if (!isPublicLeadSurface()) return;
    dismissedPublicPrompt = true;
    try {
      const suppressMs = HELPER_DISMISS_SUPPRESS_HOURS * 60 * 60 * 1000;
      localStorage.setItem(publicNudgeSuppressUntilKey(), String(Date.now() + suppressMs));
      sessionStorage.removeItem(`${storagePrefix}:publicPromptDismissed`);
    } catch {
      try {
        sessionStorage.setItem(`${storagePrefix}:publicPromptDismissed`, '1');
      } catch {}
    }
    clearPublicFollowup();
  }

  function schedulePublicFollowup() {
    if (!isPublicLeadSurface() || dismissedPublicPrompt) return;
    if (publicAutoPromptTimer || publicFollowupTimer) return;
    const firstDelay = surface === 'one_time_public' ? ONE_TIME_PUBLIC_FIRST_NUDGE_DELAY_MS : HELPER_FIRST_NUDGE_DELAY_MS;
    const secondDelay = surface === 'one_time_public' ? ONE_TIME_PUBLIC_SECOND_NUDGE_DELAY_MS : HELPER_SECOND_NUDGE_DELAY_MS;
    publicAutoPromptTimer = setTimeout(() => {
      publicAutoPromptTimer = null;
      showPublicNudge('first');
      publicFollowupTimer = setTimeout(() => {
        publicFollowupTimer = null;
        showPublicNudge('second');
      }, secondDelay);
    }, firstDelay);
  }

  function setOpen(open, options = {}) {
    panel.classList.toggle('is-open', open);
    launcher.classList.toggle('is-panel-open', open);
    launcher.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    if ('inert' in panel) panel.inert = !open;
    if (open) {
      clearPublicFollowup();
      keepAssistantComposerReachable();
      if (options.focus !== false) focusAssistantInput();
      if (threadId) loadThread(threadId);
    }
  }

  window.BNAAssistant = {
    ...(window.BNAAssistant || {}),
    open(message = '') {
      setOpen(true, { focus: true });
      const seeded = String(message || '').trim();
      if (seeded) input.value = seeded;
      resizeAssistantInput();
      scheduleAssistantKeyboardSync(80);
      focusAssistantInput({ force: true });
    },
    close() {
      setOpen(false);
    },
    surface,
    currentThreadId() {
      return threadId || '';
    },
  };

  function setHistoryOpen(open) {
    historyPanel.classList.toggle('is-open', open);
    historyToggle.setAttribute('aria-expanded', String(open));
    if (open && !historyLoaded) loadHistory();
  }

  function setBusy(busy) {
    typingEl.classList.toggle('is-visible', busy);
    input.disabled = busy;
    sendButton.disabled = busy;
  }

  function publicInitialHelperActions() {
    if (surface === 'one_time_public') {
      return [
        { type: 'signup', label: 'Sign Up Now' },
        { type: 'path', path: 'current_info', label: 'Current class information' },
        { type: 'prefill', label: 'Class schedule', prompt: 'I have a schedule question about the One Time Mishnayos class: ' },
        { type: 'prefill', label: 'Speak to Rabbi Scheller', prompt: 'I would like Rabbi Scheller to follow up about: ' },
        { type: 'link', href: '/rabbi-member', label: 'Member login' },
      ];
    }
    if (surface === 'one_time_parent') {
      return [
        { type: 'link', href: '/one-time-classroom.html', label: 'Classroom link' },
        { type: 'prefill', label: 'Billing question', prompt: 'I have a parent billing or access question about One Time: ' },
        { type: 'prefill', label: 'Attendance question', prompt: 'I have a parent attendance question about One Time: ' },
      ];
    }
    if (surface === 'one_time_student') {
      return [
        { type: 'link', href: '/one-time-classroom.html', label: 'Classroom' },
        { type: 'link', href: '/rabbi-member?review=one-time', label: 'Library preview' },
        { type: 'prefill', label: 'Ask Rabbi Scheller', prompt: 'I have a Mishnah class question for Rabbi Scheller: ' },
      ];
    }
    if (surface !== 'public') return [];
    return (publicHelperData().choices || []).map((choice) => ({
      type: 'path',
      path: choice.id,
      label: choice.label,
    }));
  }

  function renderActionButtons(actions) {
    const validActions = (actions || []).filter((action) => action && action.label);
    if (!validActions.length) return null;
    const wrap = document.createElement('div');
    wrap.className = 'bna-helper-actions';
    for (const action of validActions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bna-helper-action';
      button.textContent = action.label;
      button.dataset.helperAction = encodeURIComponent(JSON.stringify(action));
      wrap.appendChild(button);
    }
    return wrap;
  }

  function readHelperAction(target) {
    const button = target.closest?.('[data-helper-action]');
    if (!button) return null;
    try {
      return JSON.parse(decodeURIComponent(button.dataset.helperAction || ''));
    } catch {
      return null;
    }
  }

  function appendMessage(author, body, options = {}) {
    const bubble = document.createElement('div');
    bubble.className = `bna-bot-message ${author === 'user' ? 'user' : 'assistant'}`;
    const text = document.createElement('span');
    text.textContent = body;
    bubble.appendChild(text);
    const actions = renderActionButtons(options.actions || []);
    if (actions) bubble.appendChild(actions);
    threadEl.appendChild(bubble);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  function renderHelperPath(pathId, userLabel) {
    const data = publicHelperData();
    const pathCopy = data.paths?.[pathId];
    if (userLabel) appendMessage('user', userLabel);
    if (!pathCopy) {
      input.value = '';
      resizeAssistantInput();
      scheduleAssistantKeyboardSync(80);
      focusAssistantInput({ force: true });
      return;
    }
    const messages = Array.isArray(pathCopy.messages) ? pathCopy.messages : [pathCopy.body];
    messages.filter(Boolean).forEach((message, index) => {
      appendMessage('assistant', message, {
        actions: index === messages.filter(Boolean).length - 1 ? pathCopy.actions || [] : [],
      });
    });
  }

  function handleHelperAction(action) {
    if (!action) return;
    if (action.type === 'open') {
      setOpen(true, { focus: false });
      return;
    }
    if (action.type === 'path') {
      setOpen(true, { focus: false });
      renderHelperPath(action.path, action.label);
      return;
    }
    if (action.type === 'link' && action.href) {
      window.location.href = action.href;
      return;
    }
    if (action.type === 'scroll' && action.target) {
      const target = document.querySelector(action.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpen(false);
      return;
    }
    if (action.type === 'signup') {
      const signupTrigger = document.querySelector('[data-signup-trigger]');
      if (signupTrigger) {
        setOpen(false);
        signupTrigger.click();
      }
      return;
    }
    if (action.type === 'prefill') {
      setOpen(true, { focus: false });
      if (action.label) appendMessage('user', action.label);
      input.value = action.prompt || '';
      resizeAssistantInput();
      scheduleAssistantKeyboardSync(80);
      focusAssistantInput({ force: true });
      return;
    }
    if (action.type === 'message' && action.body) {
      if (action.label) appendMessage('user', action.label);
      appendMessage('assistant', action.body);
      return;
    }
    if (action.type === 'sodas_option') {
      if (action.label) appendMessage('user', action.label);
      const data = publicHelperData();
      appendMessage('assistant', data.sodas?.nextAfterFeeling || 'What choices were available in that moment?', {
        actions: data.sodas?.optionButtons || [],
      });
    }
  }

  function looksLikeSafetyIssue(text) {
    return /\b(suicide|kill myself|kill him|kill her|hurt myself|hurt him|hurt her|abuse|danger|emergency|unsafe|weapon|bleeding)\b/i.test(text);
  }

  function replaceThread(messages) {
    threadEl.textContent = '';
    if (!messages.length) appendMessage('assistant', introCopy(), { actions: publicInitialHelperActions() });
    for (const message of messages) {
      appendMessage(message.author_type === 'user' ? 'user' : 'assistant', message.body || '');
    }
  }

  function threadDisplayName(thread) {
    const role = thread.actor_role || thread.actor_type || '';
    return `${continueChatCopy()} #${thread.id}${role ? ` · ${role}` : ''}`;
  }

  function formatThreadTime(thread) {
    const raw = thread.updated_at || thread.created_at;
    if (!raw) return '';
    try {
      return new Intl.DateTimeFormat(language() || 'en', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(raw));
    } catch {
      return String(raw).slice(0, 16);
    }
  }

  function renderHistoryState(text) {
    historyList.innerHTML = `<div class="bna-bot-history-state">${escapeHtml(text)}</div>`;
  }

  function renderHistory(threads) {
    historyLoaded = true;
    historyList.textContent = '';
    if (!threads.length) {
      renderHistoryState(historyEmptyCopy());
      return;
    }
    for (const thread of threads) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `bna-bot-history-item${String(thread.id) === String(threadId) ? ' is-active' : ''}`;
      item.dataset.threadId = thread.id;
      item.setAttribute('aria-label', `${continueChatCopy()} ${thread.id}`);
      const metaParts = [formatThreadTime(thread), thread.surface || '', thread.page_path || '']
        .map((part) => String(part || '').trim())
        .filter(Boolean);
      item.innerHTML = `
        <span class="bna-bot-history-name">${escapeHtml(threadDisplayName(thread))}</span>
        <span class="bna-bot-history-meta">${escapeHtml(metaParts.join(' · '))}</span>
      `;
      item.addEventListener('click', () => {
        threadId = String(thread.id);
        localStorage.setItem(`${storagePrefix}:threadId`, threadId);
        setHistoryOpen(false);
        loadThread(threadId);
        focusAssistantInput();
      });
      historyList.appendChild(item);
    }
  }

  function requestPayload(message) {
    const payload = {
      message,
      thread_id: threadId || undefined,
      anonymous_id: getOrCreateAnonymousId(),
      surface,
      page_path: window.location.pathname + window.location.search,
      language: language(),
      mode: 'safe',
      user_agent: navigator.userAgent || '',
    };
    if (isStudent) payload.access_code = studentAccessCode();
    return payload;
  }

  async function sendMessage(message) {
    const text = String(message || '').trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    resizeAssistantInput();
    scheduleAssistantKeyboardSync(80);
    if (isPublicLeadSurface() && looksLikeSafetyIssue(text)) {
      appendMessage('assistant', publicHelperData().safety || copy.unavailable);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/bna/assistant/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload(text)),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Assistant unavailable');
      if (result.anonymous_id) localStorage.setItem('bnaAssistantAnonymousId', result.anonymous_id);
      if (result.thread?.id) {
        threadId = String(result.thread.id);
        localStorage.setItem(`${storagePrefix}:threadId`, threadId);
        historyLoaded = false;
      }
      const assistantMessages = (result.messages || []).filter((item) => item.author_type !== 'user');
      if (!assistantMessages.length) appendMessage('assistant', copy.saved);
      assistantMessages.forEach((item) => appendMessage('assistant', item.body || copy.saved));
    } catch (error) {
      appendMessage('assistant', copy.unavailable);
    } finally {
      setBusy(false);
      focusAssistantInput();
    }
  }

  async function loadHistory() {
    renderHistoryState(historyLoadingCopy());
    try {
      const params = new URLSearchParams({ anonymous_id: getOrCreateAnonymousId() });
      if (isStudent) params.set('access_code', studentAccessCode());
      const response = await fetch(`/api/bna/assistant/threads?${params.toString()}`, {
        credentials: 'same-origin',
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || historyUnavailableCopy());
      if (result.anonymous_id) localStorage.setItem('bnaAssistantAnonymousId', result.anonymous_id);
      renderHistory(Array.isArray(result.threads) ? result.threads : []);
    } catch {
      historyLoaded = false;
      renderHistoryState(historyUnavailableCopy());
    }
  }

  async function loadThread(id) {
    try {
      const params = new URLSearchParams({ anonymous_id: getOrCreateAnonymousId() });
      if (isStudent) params.set('access_code', studentAccessCode());
      const response = await fetch(`/api/bna/assistant/threads/${encodeURIComponent(id)}?${params.toString()}`, {
        credentials: 'same-origin',
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && Array.isArray(result.messages)) replaceThread(result.messages);
    } catch {}
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  if (isPublicLeadSurface() && !dismissedPublicPrompt) {
    schedulePublicFollowup();
  }

  launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  threadEl.addEventListener('click', (event) => {
    const action = readHelperAction(event.target);
    if (!action) return;
    event.preventDefault();
    handleHelperAction(action);
  });
  nudge.addEventListener('click', (event) => {
    if (event.target.closest('[data-nudge-dismiss]')) {
      dismissPublicPromptForSession();
      return;
    }
    const action = readHelperAction(event.target);
    if (action) {
      event.preventDefault();
      setOpen(true, { focus: false });
      handleHelperAction(action);
      return;
    }
    if (event.target.closest('.bna-bot-nudge')) setOpen(true, { focus: false });
  });
  closeButton.addEventListener('click', () => {
    setHistoryOpen(false);
    dismissPublicPromptForSession();
    setOpen(false);
  });
  historyToggle.addEventListener('click', () => setHistoryOpen(!historyPanel.classList.contains('is-open')));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    resizeAssistantInput();
    scheduleAssistantKeyboardSync(80);
  });
  input.addEventListener('compositionend', () => scheduleAssistantKeyboardSync(80));
  input.addEventListener('focus', () => {
    keepAssistantComposerReachable();
    setTimeout(keepAssistantComposerReachable, 120);
    setTimeout(keepAssistantComposerReachable, 260);
    setTimeout(keepAssistantComposerReachable, 520);
    setTimeout(keepAssistantComposerReachable, 760);
  });
  input.addEventListener('blur', () => scheduleAssistantKeyboardSync(120));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setHistoryOpen(false);
      dismissPublicPromptForSession();
      setOpen(false);
    }
  });
  document.addEventListener('click', (event) => {
    const opener = event.target.closest?.('[data-helper-open], [data-bna-assistant-open]');
    if (!opener) return;
    event.preventDefault();
    window.BNAAssistant.open(opener.getAttribute('data-assistant-prompt') || '');
  });
})();
