(function () {
  const state = {
    token: localStorage.getItem('rabbi_member_session') || '',
    member: null,
    library: [],
    sessions: [],
    notice: '',
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

  function renderAll() {
    renderNotice();
    renderMember();
    renderLibrary();
    renderSessions();
  }

  async function requestLogin(event) {
    event?.preventDefault?.();
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
      const [sessionData, libraryData, liveData] = await Promise.all([
        api('/api/rabbi/member/session'),
        api('/api/rabbi/member/library'),
        api('/api/rabbi/member/live-sessions'),
      ]);
      state.member = sessionData.member || libraryData.member || liveData.member || null;
      state.library = libraryData.items || [];
      state.sessions = liveData.live_sessions || [];
    } catch (error) {
      state.notice = error.message || 'Could not load member access.';
      state.token = '';
      localStorage.removeItem('rabbi_member_session');
    }
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    $('loginForm')?.addEventListener('submit', requestLogin);
    const params = new URLSearchParams(window.location.search);
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
