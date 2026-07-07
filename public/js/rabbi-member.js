(function () {
  const queryParams = new URLSearchParams(window.location.search);
  const ONE_TIME_MEMBER_REVIEW_MODE = ['one-time', 'onetime', '1', 'true'].includes(String(queryParams.get('review') || '').toLowerCase());
  const state = {
    token: ONE_TIME_MEMBER_REVIEW_MODE ? '' : (localStorage.getItem('rabbi_member_session') || ''),
    member: null,
    library: [],
    sessions: [],
    questions: [],
    supportTickets: [],
    notice: '',
    previewMode: ONE_TIME_MEMBER_REVIEW_MODE,
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  function renderNotice() {
    const node = $('memberNotice');
    if (!node) return;
    node.textContent = state.notice || '';
    node.hidden = !state.notice;
  }

  function renderMember() {
    const node = $('memberState');
    if (!node) return;
    if (!state.member) {
      node.innerHTML = '<div class="soft-panel">Request a member login link to view access.</div>';
      return;
    }
    const scopes = state.member.access_scopes || [];
    node.innerHTML = `
      <div class="access-card">
        <span class="eyebrow">Member Access</span>
        <h2>${escapeHtml(state.member.display_name || 'Member')}</h2>
        <p>${scopes.length ? `Active scopes: ${escapeHtml(scopes.join(', '))}` : 'No active access grant yet.'}</p>
        ${state.previewMode ? '<p>Preview mode uses TEST One Time member data. No login link, support ticket, private question, payment, or access-grant write runs here.</p>' : ''}
      </div>
    `;
  }

  function renderLibrary() {
    const node = $('libraryList');
    if (!node) return;
    if (!state.member?.has_library_access) {
      node.innerHTML = '<div class="soft-panel">Library access is pending.</div>';
      return;
    }
    if (!state.library.length) {
      node.innerHTML = '<div class="soft-panel">No published library items yet.</div>';
      return;
    }
    node.innerHTML = state.library.map((item) => `
      <article class="member-item">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${item.media_url ? `<a href="${escapeHtml(item.media_url)}" target="_blank" rel="noopener">Open recording</a>` : '<span>Recording link pending</span>'}
      </article>
    `).join('');
  }

  function renderSessions() {
    const node = $('sessionList');
    if (!node) return;
    if (!state.sessions.length) {
      node.innerHTML = '<div class="soft-panel">No live sessions are scheduled yet.</div>';
      return;
    }
    node.innerHTML = state.sessions.map((session) => `
      <article class="member-item">
        <h3>${escapeHtml(session.title)}</h3>
        <p>${escapeHtml(session.start_at ? new Date(session.start_at).toLocaleString() : 'Time pending')}</p>
        ${session.class_link?.available
          ? '<button type="button" disabled title="Protected join reference pending">Join Class</button><p>Secure Join Class is relationship-scoped and disabled until the approved Zoom/entitlement handoff is active; host/start URLs are never exposed.</p>'
          : `<span>${escapeHtml(session.class_link?.status === 'live_access_required' ? 'Live access is required before a protected class link can be shown.' : 'Protected class link pending.')}</span>`}
      </article>
    `).join('');
  }

  function renderQuestions() {
    const node = $('questionList');
    if (!node) return;
    if (!state.member) {
      node.innerHTML = '<div class="soft-panel">Open a member session to submit private questions.</div>';
      return;
    }
    if (!state.questions.length) {
      node.innerHTML = '<div class="soft-panel">No private questions have been submitted yet.</div>';
      return;
    }
    node.innerHTML = state.questions.map((question) => `
      <article class="member-item">
        <div class="badge-row">
          <span class="badge">${escapeHtml(question.question_number || 'Question')}</span>
          <span class="badge">${escapeHtml((question.review_status || 'needs_review').replace(/_/g, ' '))}</span>
        </div>
        <h3>${escapeHtml(question.title || question.topic || 'Private question')}</h3>
        <p>${escapeHtml(question.question_preview || '')}</p>
        ${question.staff_reply_available ? `<div class="reply-list"><strong>Rabbi reply</strong><p>${escapeHtml(question.staff_reply || '')}</p></div>` : ''}
      </article>
    `).join('');
  }

  function renderSupportTickets() {
    const node = $('supportList');
    if (!node) return;
    if (!state.member) {
      node.innerHTML = '<div class="soft-panel">Open a member session to create support tickets.</div>';
      return;
    }
    if (!state.supportTickets.length) {
      node.innerHTML = '<div class="soft-panel">No support tickets are open.</div>';
      return;
    }
    node.innerHTML = state.supportTickets.map((ticket) => {
      const replies = Array.isArray(ticket.staff_replies) ? ticket.staff_replies : [];
      return `
        <article class="member-item">
          <div class="badge-row">
            <span class="badge">${escapeHtml(ticket.ticket_number || 'Ticket')}</span>
            <span class="badge">${escapeHtml((ticket.status || 'open').replace(/_/g, ' '))}</span>
            <span class="badge">${escapeHtml(ticket.category || 'support')}</span>
          </div>
          <h3>${escapeHtml(ticket.title || 'Support ticket')}</h3>
          <p>${escapeHtml(ticket.description || '')}</p>
          ${replies.length ? `<div class="reply-list">${replies.map((reply) => `<p><strong>${escapeHtml(reply.author || 'Staff')}</strong><br>${escapeHtml(reply.body || '')}</p>`).join('')}</div>` : ''}
        </article>
      `;
    }).join('');
  }

  function renderAll() {
    renderNotice();
    renderMember();
    renderLibrary();
    renderSessions();
    renderQuestions();
    renderSupportTickets();
  }

  function clearMemberSession(message = 'Member session cleared.') {
    state.token = '';
    state.member = null;
    state.library = [];
    state.sessions = [];
    state.questions = [];
    state.supportTickets = [];
    state.notice = message;
    localStorage.removeItem('rabbi_member_session');
    localStorage.removeItem('one_time_member_library_code');
    localStorage.removeItem('oneTimeClassroomCode');
    renderAll();
  }

  function applyMemberReviewChrome() {
    if (!ONE_TIME_MEMBER_REVIEW_MODE) return;
    document.body.classList.add('one-time-member-review-active');
    document.title = 'One Time Member Preview';
    const brandSmall = document.querySelector('.member-brand-lockup small');
    if (brandSmall) brandSmall.textContent = 'Member preview';
    const loginTitle = document.querySelector('#member-access h2');
    if (loginTitle) loginTitle.textContent = 'Member preview';
    const loginForm = $('loginForm');
    if (loginForm) {
      loginForm.querySelectorAll('input, button').forEach((control) => {
        control.disabled = true;
        control.dataset.buttonState = 'blocked';
        control.title = 'Member preview mode uses TEST data and does not request or send login links.';
      });
    }
  }

  async function loadMemberReview() {
    applyMemberReviewChrome();
    try {
      const data = await api('/api/one-time-review/member');
      state.previewMode = true;
      state.member = data.member || null;
      state.library = data.library || [];
      state.sessions = data.live_sessions || [];
      state.questions = data.questions || [];
      state.supportTickets = data.support_tickets || [];
      state.notice = 'Member preview mode is read-only. Question and support submits are simulated locally; no external send or database write runs.';
    } catch (error) {
      state.notice = error.message || 'Could not load member preview.';
    }
    renderAll();
  }

  async function requestLogin(event) {
    event?.preventDefault?.();
    if (state.previewMode) {
      state.notice = 'Member preview mode does not request or send login links.';
      renderAll();
      return;
    }
    const email = $('loginEmail')?.value || '';
    if (!email) return;
    try {
      state.notice = 'Requesting login link...';
      renderNotice();
      const data = await api('/api/rabbi/member/request-login', {
        method: 'POST',
        body: JSON.stringify({ email, dryRun: true }),
      });
      if (data.preview_login_token) {
        await loginWithToken(data.preview_login_token);
        return;
      }
      state.notice = data.message || 'If this email has access, a login link will be sent.';
    } catch (error) {
      state.notice = error.message || 'Could not request login.';
    }
    renderAll();
  }

  async function loginWithToken(token) {
    const data = await api('/api/rabbi/member/login', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    state.token = data.session_token || '';
    if (state.token) localStorage.setItem('rabbi_member_session', state.token);
    state.member = data.member || null;
    state.notice = 'Member session opened.';
    await loadMemberData();
  }

  async function loadMemberData() {
    if (!state.token) {
      renderAll();
      return;
    }
    try {
      const [sessionData, libraryData, liveData, questionData, supportData] = await Promise.all([
        api('/api/rabbi/member/session'),
        api('/api/rabbi/member/library'),
        api('/api/rabbi/member/live-sessions'),
        api('/api/rabbi/member/questions'),
        api('/api/rabbi/member/support-tickets'),
      ]);
      state.member = sessionData.member || libraryData.member || liveData.member || questionData.member || supportData.member || null;
      state.library = libraryData.items || [];
      state.sessions = liveData.live_sessions || [];
      state.questions = questionData.questions || [];
      state.supportTickets = supportData.tickets || [];
    } catch (error) {
      state.notice = error.message || 'Could not load member access.';
      state.token = '';
      localStorage.removeItem('rabbi_member_session');
    }
    renderAll();
  }

  async function submitQuestion(event) {
    event?.preventDefault?.();
    if (state.previewMode) {
      state.notice = 'Preview question simulated locally. No private question record, forum post, member feed, or external send was created.';
      renderAll();
      return;
    }
    if (!state.token) {
      state.notice = 'Open a member session before submitting a question.';
      renderAll();
      return;
    }
    const body = $('questionBody')?.value || '';
    const topic = $('questionTopic')?.value || '';
    if (!body.trim()) return;
    try {
      state.notice = 'Submitting private question...';
      renderNotice();
      const data = await api('/api/rabbi/member/questions', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          question_text: body,
          page_path: window.location.pathname,
        }),
      });
      if (data.question) state.questions = [data.question, ...state.questions];
      if ($('questionBody')) $('questionBody').value = '';
      if ($('questionTopic')) $('questionTopic').value = '';
      state.notice = data.question?.question_number
        ? `Private question ${data.question.question_number} submitted.`
        : 'Private question submitted.';
    } catch (error) {
      state.notice = error.message || 'Could not submit private question.';
    }
    renderAll();
  }

  async function submitSupportTicket(event) {
    event?.preventDefault?.();
    if (state.previewMode) {
      state.notice = 'Preview support ticket simulated locally. No support ticket, notification, payment/access change, or external send was created.';
      renderAll();
      return;
    }
    if (!state.token) {
      state.notice = 'Open a member session before creating a support ticket.';
      renderAll();
      return;
    }
    const title = $('supportTitle')?.value || '';
    const description = $('supportDescription')?.value || '';
    if (!title.trim() && !description.trim()) return;
    try {
      state.notice = 'Opening support ticket...';
      renderNotice();
      const data = await api('/api/rabbi/member/support-tickets', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category: $('supportCategory')?.value || 'other',
          severity: $('supportSeverity')?.value || 'normal',
          page_path: window.location.pathname,
        }),
      });
      if (data.ticket) state.supportTickets = [data.ticket, ...state.supportTickets];
      if ($('supportTitle')) $('supportTitle').value = '';
      if ($('supportDescription')) $('supportDescription').value = '';
      state.notice = data.ticket?.ticket_number
        ? `Support ticket ${data.ticket.ticket_number} opened.`
        : 'Support ticket opened.';
    } catch (error) {
      state.notice = error.message || 'Could not open support ticket.';
    }
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    $('loginForm')?.addEventListener('submit', requestLogin);
    $('questionForm')?.addEventListener('submit', submitQuestion);
    $('supportForm')?.addEventListener('submit', submitSupportTicket);
    const params = queryParams;
    if (ONE_TIME_MEMBER_REVIEW_MODE) {
      localStorage.removeItem('rabbi_member_session');
      await loadMemberReview();
      return;
    }
    if (params.get('logout') === '1') {
      clearMemberSession();
      window.history.replaceState({}, '', '/rabbi-member');
      return;
    }
    const token = params.get('token');
    if (token) {
      try {
        await loginWithToken(token);
        window.history.replaceState({}, '', '/rabbi-member');
        return;
      } catch (error) {
        state.notice = error.message || 'Login link could not be opened.';
      }
    }
    await loadMemberData();
  });
})();
