(function () {
  if (window.BNABotWidgetLoaded) return;
  window.BNABotWidgetLoaded = true;

  const path = window.location.pathname;
  const query = new URLSearchParams(window.location.search);
  if (/^\/parent/.test(path) && query.get('onboard') === 'accountability') return;
  const isParent = /^\/parent/.test(path);
  const isStudent = /^\/student/.test(path);
  const isProvider = /^\/provider/.test(path);
  const isOperations = /^\/operations/.test(path);
  const isSignup = /^\/signup/.test(path);
  const surface = isOperations
    ? 'operations'
    : isParent
      ? 'parent_portal'
      : isStudent
        ? 'student_portal'
        : isProvider
          ? 'provider_workspace'
          : isSignup
            ? 'signup'
            : 'public';
  const storagePrefix = `bnaAssistant:${surface}`;
  const PUBLIC_ASSISTANT_AUTOPROMPT_DELAY_MS = 2600;
  const PUBLIC_ASSISTANT_FOLLOWUP_DELAY_MS = 5600;
  const PUBLIC_ASSISTANT_TYPING_DELAY_MS = 900;
  const direction = () => document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
  const language = () => document.documentElement.lang || (direction() === 'rtl' ? 'he' : 'en');
  const isHebrew = () => /^he\b/i.test(language()) || direction() === 'rtl';
  const studentAccessCode = () => new URLSearchParams(window.location.search).get('code') || localStorage.getItem('bnaStudentAccessCode') || '';
  const isPublicLeadSurface = () => ['public', 'signup'].includes(surface);

  function getOrCreateAnonymousId() {
    const existing = localStorage.getItem('bnaAssistantAnonymousId');
    if (existing) return existing;
    const next = `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem('bnaAssistantAnonymousId', next);
    return next;
  }

  function introCopy() {
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
          : "Hi, I'm the BNA learning helper. I can help you understand your schedule, goals, learning, and how to message your rebbi or Shloimie.",
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
    if (isProvider) {
      return {
        ...base,
        surfaceLabel: he ? 'מרחב ספק' : 'Provider workspace',
        intro: he
          ? 'שלום, אני מסייע הספקים של BNA. אפשר לעדכן פרופיל, שירותים, תמונות, שאלות מהורים, Google וחסימות שדרוג.'
          : "Hi, I'm the BNA provider assistant. I can help with your profile, services, pictures, parent questions, Google status, and upgrade blockers.",
        cards: he
          ? [
            ['פרופיל ציבורי', 'כותרת, תיאור, שירותים, תמונות ואזור שירות.'],
            ['שיחות הורים', 'שאלות נכנסות, תגובות וכרטיסי תמיכה.'],
            ['חיבורים ושדרוג', 'Google Business, מגבלות מסלול וקישור שדרוג כשיהיה מוגדר.'],
          ]
          : [
            ['Public profile', 'Headline, bio, services, pictures, and service area.'],
            ['Parent conversations', 'Inbound questions, replies, and support tickets.'],
            ['Connections and upgrade', 'Google Business, plan limits, and upgrade link status.'],
          ],
        prompts: he
          ? ['עדכן את תיאור הפרופיל שלי.', 'מה חסר כדי לחבר Google Business?', 'אני רוצה להוסיף תמונה לפרופיל.']
          : ['Update my profile description.', 'What is missing for Google Business?', 'I want to add a profile picture.'],
      };
    }
    if (isSignup) {
      return {
        ...base,
        surfaceLabel: he ? 'עזרת הרשמה' : 'Registration help',
        intro: he
          ? 'שלום, אני מסייע ההרשמה של BNA. אפשר לשאול על הטופס, הרשאות הורים, תשלום או שליחה.'
          : "Hi, I'm the BNA registration helper. I can help with the form, parent permissions, payment, or submission questions.",
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
        : "Hi, I am here to help. Ask me about BNA, self-governance, accountability, or whether this learning program fits your child.",
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

  const style = document.createElement('style');
  style.textContent = `
    :root {
      --app-vh: 100dvh;
      --keyboard-offset: 0px;
      --assistant-header-height: 56px;
      --assistant-composer-height: 76px;
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
    .bna-bot-panel {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 6401;
      width: min(460px, 100vw);
      height: var(--app-vh);
      max-height: var(--app-vh);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto auto;
      background: #fffaf0;
      color: #172019;
      border-left: 1px solid rgba(23, 32, 25, 0.12);
      box-shadow: -24px 0 70px rgba(27, 49, 32, 0.18);
      transform: translateX(105%);
      transition: transform 0.22s ease;
    }
    .bna-bot-panel.is-open { transform: translateX(0); }
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
    .bna-bot-typing {
      display: none;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1rem 0.75rem;
      color: #60705f;
      font: 0.82rem "Trebuchet MS", Verdana, sans-serif;
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
    }
    .bna-bot-input {
      min-height: 44px;
      max-height: 130px;
      border: 1px solid rgba(47, 100, 141, 0.22);
      border-radius: 8px;
      background: #fff;
      color: #172019;
      padding: 0.7rem 0.75rem;
      font: 0.92rem "Trebuchet MS", Verdana, sans-serif;
      resize: none;
      overflow: auto;
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
      .bna-bot-launcher { right: 12px; bottom: 12px; }
      [dir="rtl"] .bna-bot-launcher { left: 12px; right: auto; }
      .bna-bot-panel,
      [dir="rtl"] .bna-bot-panel {
        left: 0;
        right: auto;
        width: 100vw;
        height: var(--app-vh);
        max-height: var(--app-vh);
      }
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('bna-universal-assistant-active');
  const copy = surfaceConfig();

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'bna-bot-launcher';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'bnaBotPanel');
  launcher.innerHTML = `<span class="bna-bot-launcher-dot"></span><span>${escapeHtml(copy.helperTitle)}</span>`;

  const panel = document.createElement('aside');
  panel.className = 'bna-bot-panel assistant-shell';
  panel.id = 'bnaBotPanel';
  panel.setAttribute('aria-label', copy.helperTitle);

  panel.innerHTML = `
    <div class="bna-bot-head">
      <div class="bna-bot-head-top">
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
      <textarea class="bna-bot-input" name="message" rows="1" maxlength="4000" placeholder="${escapeAttr(copy.placeholder)}"></textarea>
      <button class="bna-bot-send" type="submit" aria-label="${escapeAttr(copy.send)}">${escapeHtml(copy.send)}</button>
    </form>
  `;

  document.body.appendChild(launcher);
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
  let dismissedPublicPrompt = sessionStorage.getItem(`${storagePrefix}:publicPromptDismissed`) === '1';

  function syncVisualViewportHeight() {
    const height = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const keyboardOffset = Math.max(0, (window.innerHeight || height) - height - (window.visualViewport?.offsetTop || 0));
    document.documentElement.style.setProperty('--app-vh', `${Math.max(320, Math.round(height))}px`);
    document.documentElement.style.setProperty('--keyboard-offset', `${Math.round(keyboardOffset)}px`);
  }

  window.visualViewport?.addEventListener('resize', syncVisualViewportHeight);
  window.visualViewport?.addEventListener('scroll', syncVisualViewportHeight);
  window.addEventListener('resize', syncVisualViewportHeight);
  syncVisualViewportHeight();

  appendMessage('assistant', introCopy());

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
    return isHebrew()
      ? 'אני עדיין כאן אם תרצו לשאול על שלטון עצמי, על התוכנית, או להשאיר פרטים כדי ששלוימי יחזור אליכם.'
      : "I'm still here if you want to ask about self-governance, the learning program, or leave details so Shloimie can follow up.";
  }

  function clearPublicFollowup() {
    if (publicAutoPromptTimer) clearTimeout(publicAutoPromptTimer);
    if (publicFollowupTimer) clearTimeout(publicFollowupTimer);
    if (publicTypingTimer) clearTimeout(publicTypingTimer);
    publicAutoPromptTimer = null;
    publicFollowupTimer = null;
    publicTypingTimer = null;
    typingEl.classList.remove('is-visible');
  }

  function dismissPublicPromptForSession() {
    if (!isPublicLeadSurface()) return;
    dismissedPublicPrompt = true;
    sessionStorage.setItem(`${storagePrefix}:publicPromptDismissed`, '1');
    clearPublicFollowup();
  }

  function schedulePublicFollowup() {
    if (!isPublicLeadSurface() || dismissedPublicPrompt) return;
    if (publicFollowupTimer) return;
    publicFollowupTimer = setTimeout(() => {
      publicFollowupTimer = null;
      if (dismissedPublicPrompt || !panel.classList.contains('is-open')) return;
      typingEl.classList.add('is-visible');
      publicTypingTimer = setTimeout(() => {
        publicTypingTimer = null;
        if (dismissedPublicPrompt || !panel.classList.contains('is-open')) {
          typingEl.classList.remove('is-visible');
          return;
        }
        typingEl.classList.remove('is-visible');
        appendMessage('assistant', publicFollowupCopy());
      }, PUBLIC_ASSISTANT_TYPING_DELAY_MS);
    }, PUBLIC_ASSISTANT_FOLLOWUP_DELAY_MS);
  }

  function setOpen(open, options = {}) {
    panel.classList.toggle('is-open', open);
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      syncVisualViewportHeight();
      if (options.focus !== false) input.focus();
      if (threadId) loadThread(threadId);
      if (options.autoPrompt) schedulePublicFollowup();
    }
  }

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

  function appendMessage(author, body) {
    const bubble = document.createElement('div');
    bubble.className = `bna-bot-message ${author === 'user' ? 'user' : 'assistant'}`;
    bubble.textContent = body;
    threadEl.appendChild(bubble);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  function replaceThread(messages) {
    threadEl.textContent = '';
    if (!messages.length) appendMessage('assistant', introCopy());
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
        input.focus();
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
      input.focus();
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
    publicAutoPromptTimer = setTimeout(() => {
      publicAutoPromptTimer = null;
      if (dismissedPublicPrompt || panel.classList.contains('is-open')) return;
      setOpen(true, { autoPrompt: true, focus: false });
    }, PUBLIC_ASSISTANT_AUTOPROMPT_DELAY_MS);
  }

  launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
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
  input.addEventListener('focus', () => {
    syncVisualViewportHeight();
    setTimeout(syncVisualViewportHeight, 120);
    setTimeout(() => {
      threadEl.scrollTop = threadEl.scrollHeight;
    }, 160);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setHistoryOpen(false);
      dismissPublicPromptForSession();
      setOpen(false);
    }
  });
})();
