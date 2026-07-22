(function () {
  const root = document.getElementById('oneTimeConnectorApp');
  const state = { data: null, error: '' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]);
  }

  async function requestJson(path) {
    const response = await fetch(path, { credentials: 'same-origin' });
    if (response.status === 401) {
      window.location.href = `/operations-login.html?returnTo=${encodeURIComponent('/operations/workspaces/one-time')}`;
      return null;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  function renderConnector() {
    const connector = state.data?.one_time_connector || {};
    return `
      <section class="grid two">
        <article class="card">
          <h2>Connector</h2>
          <p><strong>${escapeHtml(connector.label || 'One Time')}</strong></p>
          <p class="muted">${escapeHtml(connector.type || 'external product connector')}</p>
          <div class="toolbar">
            <a class="button" data-action-id="ACTION-ONETIME-CONNECTOR-OPEN-APP" href="${escapeHtml(connector.application || 'https://join.onetimeonetime.com')}" target="_blank" rel="noopener">Open Target</a>
            <a class="button" data-action-id="ACTION-ONETIME-CONNECTOR-OPEN-AGENT-ACTIONS" href="/operations/agent-actions">Agent Actions</a>
          </div>
        </article>
        <article class="card">
          <h2>Canonical keys</h2>
          <p><strong>${escapeHtml(connector.key || 'one_time')}</strong></p>
          <p class="muted">Project: ${escapeHtml(connector.project_key || 'one_time_mishnayos')}</p>
          <p class="muted">Repository: ${escapeHtml(connector.repository || 'shloimie-beep/onetimev2')}</p>
        </article>
      </section>
    `;
  }

  function renderHighLevel() {
    const importPreview = state.data?.highlevel_import || {};
    const jobs = (state.data?.jobs || []).filter((job) => job.source_repository === 'shloimie-beep/onetimev2' && job.target_application === 'HighLevel');
    const blocker = importPreview.blocker;
    return `
      <section class="card">
        <div class="job-meta">
          <span class="status-pill ${jobs.length ? 'ready' : 'blocked'}">${jobs.length} imported</span>
          <span>${escapeHtml(importPreview.source?.artifact_path || '')}</span>
        </div>
        <h2>One Time — HighLevel UI Setup</h2>
        <p class="muted">Read-only import preview. BNA never executes GHL automatically and never imports secrets.</p>
        ${blocker ? `<div class="notice error"><strong>${escapeHtml(blocker.id || 'Blocked')}</strong><br>${escapeHtml(blocker.message || '')}<br>${escapeHtml(blocker.next_action || '')}</div>` : ''}
        <div class="job-list">
          ${jobs.length ? jobs.map((job) => `
            <article class="card">
              <div class="job-meta">
                <span class="status-pill ${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
                <span>${escapeHtml(job.category)}</span>
              </div>
              <h3>${escapeHtml(job.title)}</h3>
              <div class="toolbar">
                <a class="button" href="${escapeHtml(job.detail_url)}">Readback</a>
                <a class="button" href="${escapeHtml(job.dropoff_url)}?mode=complete">Save Completed Result</a>
              </div>
            </article>
          `).join('') : '<div class="notice">No dry-run GHL job is available because the pinned export JSON is missing.</div>'}
        </div>
      </section>
    `;
  }

  function renderFoundations() {
    const persistence = state.data?.result_persistence || {};
    const fallback = persistence.github_fallback || {};
    const telegram = state.data?.rabbi_telegram_foundation || {};
    const telegramReady = telegram.mode === 'private_canary_ready';
    return `
      <section class="grid two">
        <article class="card">
          <div class="job-meta">
            <span class="status-pill ready">Hub preferred</span>
            <span>${escapeHtml(fallback.persistence_mode || 'sanitized result-only PR')}</span>
          </div>
          <h2>Result persistence fallback</h2>
          <p class="muted">If the BNA Hub is unavailable, a sanitized result-only branch/PR can be prepared in ${escapeHtml(fallback.repository || 'shloimie-beep/onetimev2')}. GHL completion is never blocked by Hub availability.</p>
        </article>
        <article class="card">
          <div class="job-meta">
            <span class="status-pill ${telegramReady ? 'ready' : 'blocked'}">${escapeHtml(telegram.mode || 'provider_off')}</span>
            <span>${escapeHtml(telegram.console_key || 'one_time_rabbi_torah_console')}</span>
          </div>
          <h2>Rabbi Telegram foundation</h2>
          <p class="muted">Provider-neutral Torah question controls use GHL Conversations and the One Time Torah Questions pipeline as source of truth. No second transcript and no customer send.</p>
          <p class="muted">Adapter: ${escapeHtml(telegram.adapter || 'fake')} · Customer messages sent: ${escapeHtml(telegram.customer_messages_sent ?? 0)}</p>
        </article>
      </section>
    `;
  }

  function renderTicketRouting() {
    const records = state.data?.ticket_routing?.records || {};
    return `
      <section class="grid three">
        ${Object.values(records).map((record) => `
          <article class="card">
            <h3>${escapeHtml(String(record.record_type || '').replace(/_/g, ' '))}</h3>
            <p class="muted">Owner: ${escapeHtml(record.owner || '')}</p>
            <span class="status-pill ${record.support_ticket === false ? 'ready' : ''}">${record.support_ticket === false ? 'not a support ticket' : 'routed'}</span>
          </article>
        `).join('')}
      </section>
    `;
  }

  function render() {
    if (!root) return;
    if (state.error) {
      root.innerHTML = `<div class="notice error">${escapeHtml(state.error)}</div>`;
      return;
    }
    if (!state.data) {
      root.innerHTML = '<section class="card">Loading One Time connector...</section>';
      return;
    }
    root.innerHTML = `
      ${renderConnector()}
      ${renderHighLevel()}
      ${renderFoundations()}
      ${renderTicketRouting()}
    `;
  }

  async function load() {
    try {
      state.data = await requestJson('/api/platform/agent-actions');
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  load();
}());
