(function () {
  if (window.BNABotWidgetLoaded) return;
  window.BNABotWidgetLoaded = true;

  const path = window.location.pathname;
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
  const direction = () => document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
  const language = () => document.documentElement.lang || (direction() === 'rtl' ? 'he' : 'en');
  const studentAccessCode = () => new URLSearchParams(window.location.search).get('code') || localStorage.getItem('bnaStudentAccessCode') || '';

  function getOrCreateAnonymousId() {
    const existing = localStorage.getItem('bnaAssistantAnonymousId');
    if (existing) return existing;
    const next = `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem('bnaAssistantAnonymousId', next);
    return next;
  }

  function introCopy() {
    if (isOperations) return 'Hi Shloimie. I can help with BNA state, contacts, students, tasks, content, settings, tickets, hosted AI responses, and tracked Codex/system work.';
    if (isParent) return "Hi, I'm the BNA helper. I can help you check your son's progress, ask about attendance or questions, send Shloimie a message, report a login issue, or ask about school updates.";
    if (isStudent) return "Hi, I'm the BNA helper. I can help you understand your schedule, your goals, and how to send a message to your rebbi or Shloimie.";
    if (isProvider) return "Hi, I'm the BNA helper. I can help with scoped provider messages and support tickets.";
    return "Hi, I'm the BNA helper. I can answer basic questions or help you send a message to the office.";
  }

  const style = document.createElement('style');
  style.textContent = `
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
      width: min(410px, 100vw);
      height: 100dvh;
      display: flex;
      flex-direction: column;
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
    .bna-bot-icon-button,
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
    .bna-bot-close { font-size: 1.15rem; }
    .bna-bot-modes {
      display: none;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.35rem;
      background: rgba(255,255,255,0.12);
      padding: 0.25rem;
      border-radius: 8px;
    }
    .bna-bot-modes.is-visible { display: grid; }
    .bna-bot-mode {
      border: 0;
      border-radius: 7px;
      min-height: 32px;
      background: transparent;
      color: rgba(255,255,255,0.82);
      font: 800 0.78rem "Trebuchet MS", Verdana, sans-serif;
      cursor: pointer;
    }
    .bna-bot-mode.is-active {
      background: #fffaf0;
      color: #173f64;
    }
    .bna-bot-history {
      display: none;
      border-bottom: 1px solid rgba(23, 32, 25, 0.12);
      background: #fff;
      max-height: 180px;
      overflow: auto;
      padding: 0.65rem;
    }
    .bna-bot-history.is-open { display: grid; gap: 0.4rem; }
    .bna-bot-history button {
      border: 1px solid rgba(47, 100, 141, 0.18);
      border-radius: 8px;
      background: #f7fbff;
      color: #173f64;
      text-align: start;
      padding: 0.55rem 0.65rem;
      cursor: pointer;
      font: 800 0.8rem "Trebuchet MS", Verdana, sans-serif;
    }
    .bna-bot-thread {
      flex: 1 1 auto;
      overflow: auto;
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
      padding: 0.75rem;
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
      }
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('bna-universal-assistant-active');

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'bna-bot-launcher';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'bnaBotPanel');
  launcher.innerHTML = '<span class="bna-bot-launcher-dot"></span><span>BNA Helper</span>';

  const panel = document.createElement('aside');
  panel.className = 'bna-bot-panel';
  panel.id = 'bnaBotPanel';
  panel.setAttribute('aria-label', 'BNA Helper');
  const hostedAiMode = 'ai';
  const hostedAiLabel = 'Open' + 'AI';

  panel.innerHTML = `
    <div class="bna-bot-head">
      <div class="bna-bot-head-top">
        <div><strong>BNA Helper</strong><span data-bot-subtitle>${escapeHtml(surfaceLabel())}</span></div>
        <div class="bna-bot-head-actions">
          <button class="bna-bot-icon-button" type="button" data-history-toggle aria-label="Chat history">H</button>
          <button class="bna-bot-close" type="button" aria-label="Close">x</button>
        </div>
      </div>
      <div class="bna-bot-modes" data-mode-list aria-label="Assistant mode">
        <button class="bna-bot-mode is-active" type="button" data-mode="auto">Auto</button>
        <button class="bna-bot-mode" type="button" data-mode="${hostedAiMode}">${hostedAiLabel}</button>
        <button class="bna-bot-mode" type="button" data-mode="codex">Codex</button>
      </div>
    </div>
    <div class="bna-bot-history" data-history-list></div>
    <div class="bna-bot-thread" data-thread></div>
    <div class="bna-bot-typing" data-typing><span class="bna-bot-spinner"></span><span>Thinking...</span></div>
    <form class="bna-bot-form" data-chat-form>
      <textarea class="bna-bot-input" name="message" rows="1" maxlength="4000" placeholder="Write a message"></textarea>
      <button class="bna-bot-send" type="submit" aria-label="Send">Send</button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const closeButton = panel.querySelector('.bna-bot-close');
  const historyToggle = panel.querySelector('[data-history-toggle]');
  const historyList = panel.querySelector('[data-history-list]');
  const threadEl = panel.querySelector('[data-thread]');
  const typingEl = panel.querySelector('[data-typing]');
  const form = panel.querySelector('[data-chat-form]');
  const input = form.elements.message;
  const sendButton = form.querySelector('.bna-bot-send');
  const modeList = panel.querySelector('[data-mode-list]');
  const modeButtons = Array.from(panel.querySelectorAll('[data-mode]'));
  let mode = localStorage.getItem(`${storagePrefix}:mode`) || 'auto';
  let threadId = localStorage.getItem(`${storagePrefix}:threadId`) || '';
  let canUseCodex = false;

  setActiveMode(mode);
  appendMessage('assistant', introCopy());

  function surfaceLabel() {
    if (isOperations) return 'Admin assistant';
    if (isParent) return 'Parent portal';
    if (isStudent) return 'Student portal';
    if (isProvider) return 'Provider workspace';
    if (isSignup) return 'Registration help';
    return 'Public help';
  }

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus();
      if (threadId) loadThread(threadId);
    }
  }

  function setBusy(busy) {
    typingEl.classList.toggle('is-visible', busy);
    input.disabled = busy;
    sendButton.disabled = busy;
  }

  function setActiveMode(nextMode) {
    mode = ['auto', hostedAiMode, 'codex'].includes(nextMode) ? nextMode : 'auto';
    localStorage.setItem(`${storagePrefix}:mode`, mode);
    modeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
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

  function requestPayload(message) {
    const payload = {
      message,
      thread_id: threadId || undefined,
      anonymous_id: getOrCreateAnonymousId(),
      surface,
      page_path: window.location.pathname + window.location.search,
      language: language(),
      mode: canUseCodex ? mode : 'safe',
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
      }
      canUseCodex = Boolean(result.actor?.can_use_codex);
      modeList.classList.toggle('is-visible', canUseCodex);
      const assistantMessages = (result.messages || []).filter((item) => item.author_type !== 'user');
      if (!assistantMessages.length) appendMessage('assistant', 'Saved.');
      assistantMessages.forEach((item) => appendMessage('assistant', item.body || 'Saved.'));
    } catch (error) {
      appendMessage('assistant', error.message || 'Assistant unavailable.');
    } finally {
      setBusy(false);
      input.focus();
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

  async function loadHistory() {
    historyList.classList.toggle('is-open');
    if (!historyList.classList.contains('is-open')) return;
    historyList.textContent = 'Loading history...';
    try {
      const params = new URLSearchParams({ anonymous_id: getOrCreateAnonymousId() });
      if (isStudent) params.set('access_code', studentAccessCode());
      const response = await fetch(`/api/bna/assistant/threads?${params.toString()}`, {
        credentials: 'same-origin',
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'History unavailable');
      canUseCodex = Boolean(result.actor?.can_use_codex);
      modeList.classList.toggle('is-visible', canUseCodex);
      const threads = Array.isArray(result.threads) ? result.threads : [];
      historyList.innerHTML = threads.length
        ? threads.map((thread) => `<button type="button" data-thread-id="${escapeAttr(thread.id)}">${escapeHtml(thread.surface || 'Assistant')} - ${escapeHtml(new Date(thread.updated_at || thread.created_at).toLocaleString())}</button>`).join('')
        : '<button type="button" disabled>No previous chats yet</button>';
    } catch (error) {
      historyList.innerHTML = `<button type="button" disabled>${escapeHtml(error.message || 'History unavailable')}</button>`;
    }
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

  launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  closeButton.addEventListener('click', () => setOpen(false));
  historyToggle.addEventListener('click', loadHistory);
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveMode(button.dataset.mode));
  });
  historyList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-thread-id]');
    if (!button) return;
    threadId = String(button.dataset.threadId || '');
    localStorage.setItem(`${storagePrefix}:threadId`, threadId);
    historyList.classList.remove('is-open');
    loadThread(threadId);
  });
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
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
})();
