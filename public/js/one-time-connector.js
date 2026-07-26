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

  function renderProviderPreview() {
    const storage = state.data?.storage || {};
    const provider = state.data?.rabbi_provider_preview || {};
    const readiness = provider.readiness || {};
    const question = provider.synthetic_question || {};
    const canary = provider.last_canary || {};
    const exactBlocker = provider.exact_provider_off_blocker || storage.blocker || '';
    const cards = [
      ['Agent Action job status', storage.durable ? 'durable' : 'blocked', storage.durable ? 'PostgreSQL ready' : (storage.blocker || 'PostgreSQL unavailable')],
      ['Telegram provider readiness', readiness.telegram?.provider_ready ? 'ready' : 'blocked', readiness.telegram?.provider_ready ? 'Private signed consumer ready' : (readiness.blockers?.[0] || 'Provider gate absent')],
      ['GHL location readiness', readiness.ghl?.provider_ready ? 'ready' : 'blocked', readiness.ghl?.provider_ready ? 'Synthetic-only canonical record access ready' : (readiness.blockers?.[0] || 'Provider gate absent')],
      ['Synthetic question state', question.status || 'not_created', question.synthetic === true ? 'Operator-owned synthetic record' : (question.blocker || 'Synthetic record unavailable')],
      ['Last sanitized canary', canary.status || 'not_run', canary.status ? `Audit ${canary.audit_id || 'recorded'} · zero customer sends` : 'No durable canary readback yet'],
    ];
    return `
      <section class="card" aria-labelledby="oneTimeProviderPreviewTitle">
        <div class="job-meta"><span class="status-pill ${exactBlocker ? 'blocked' : 'ready'}">Preview</span><span>Sanitized operator state</span></div>
        <h2 id="oneTimeProviderPreviewTitle">Agent Actions + Rabbi provider Preview</h2>
        <p class="muted">No tokens, chat IDs, provider record IDs, contact details, or message bodies are shown.</p>
        <div class="grid two">
          ${cards.map(([label, status, detail]) => `
            <article class="card">
              <div class="job-meta"><span class="status-pill ${status === 'ready' || status === 'durable' || status === 'pass' ? 'ready' : 'blocked'}">${escapeHtml(status)}</span></div>
              <h3>${escapeHtml(label)}</h3>
              <p class="muted">${escapeHtml(detail)}</p>
            </article>
          `).join('')}
        </div>
        ${exactBlocker ? `<div class="notice error"><strong>Provider-off blocker</strong><br>${escapeHtml(exactBlocker)}</div>` : '<div class="notice"><strong>Provider gates ready.</strong> Confirm/send remains disabled; customer messages sent: 0.</div>'}
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
      ${renderProviderPreview()}
      ${renderTicketRouting()}
    `;
  }

  async function load() {
    try {
      state.data = await requestJson('/api/platform/agent-actions');
      render();
    } catch (error) {
      try {
        const provider = await requestJson('/api/platform/one-time-rabbi/preview');
        state.data = {
          storage: {
            mode: 'unavailable',
            ready: false,
            durable: false,
            blocker: error.message,
          },
          rabbi_provider_preview: provider?.preview || {},
          highlevel_import: { blocker: { id: 'DATABASE_REQUIRED', message: error.message, next_action: 'Attach one disposable PostgreSQL service to this preview environment.' } },
          jobs: [],
        };
      } catch (previewError) {
        state.error = previewError.message;
      }
      render();
    }
  }

  load();
}());
