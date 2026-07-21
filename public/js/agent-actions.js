(function () {
  const state = {
    payload: null,
    csrf: '',
    notice: '',
    error: '',
    readback: null,
  };

  const root = document.getElementById('agentActionsApp');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]);
  }

  function jobIdFromPath() {
    const match = window.location.pathname.match(/^\/operations\/agent-actions\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function selectedJobs() {
    const jobs = Array.isArray(state.payload?.jobs) ? state.payload.jobs : [];
    const jobId = jobIdFromPath();
    return jobId ? jobs.filter((job) => job.job_id === jobId) : jobs;
  }

  function statusClass(status) {
    return String(status || 'draft').replace(/[^a-z0-9_-]+/g, '_');
  }

  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (response.status === 401) {
      window.location.href = `/operations-login.html?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return null;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  function jobById(jobId) {
    return (state.payload?.jobs || []).find((job) => job.job_id === jobId) || null;
  }

  async function copyText(value, label) {
    await navigator.clipboard.writeText(String(value || ''));
    state.notice = `${label} copied.`;
    render();
  }

  async function postJobAction(jobId, action) {
    const job = jobById(jobId);
    if (!job) return;
    state.notice = '';
    state.error = '';
    const result = await requestJson(`/api/platform/agent-actions/${encodeURIComponent(jobId)}/results`, {
      method: 'POST',
      headers: { 'X-BNA-Agent-Action-CSRF': state.csrf },
      body: JSON.stringify({
        action,
        idempotency_key: `${job.idempotency_key}:${action}`,
        summary: action === 'supersede'
          ? 'Agent Action job superseded from the Super Admin queue.'
          : 'Agent Action job started from the Super Admin queue.',
        evidence: [`${action} clicked in /operations/agent-actions.`],
      }),
    });
    if (!result) return;
    state.notice = `${action.replace(/_/g, ' ')} saved as ${result.result_ref}.`;
    if (result.readback_url) {
      state.readback = await requestJson(result.readback_url);
    }
    await load();
  }

  async function readback(jobId) {
    const job = jobById(jobId);
    if (!job?.latest_result_ref) {
      state.notice = 'No saved result is available for readback yet.';
      render();
      return;
    }
    state.readback = await requestJson(`/api/platform/agent-actions/${encodeURIComponent(jobId)}/results?result_ref=${encodeURIComponent(job.latest_result_ref)}`);
    state.notice = `Readback verified for ${job.latest_result_ref}.`;
    await load();
  }

  function renderHighLevelCard() {
    const importPreview = state.payload?.highlevel_import || {};
    const jobs = (state.payload?.jobs || []).filter((job) => job.source_repository === 'shloimie-beep/onetimev2' && job.target_application === 'HighLevel');
    const blocker = importPreview.blocker;
    return `
      <section class="card">
        <div class="job-meta">
          <span class="status-pill ${jobs.length ? 'ready' : 'blocked'}">${jobs.length} imported</span>
          <span>${escapeHtml(importPreview.source?.repository || 'shloimie-beep/onetimev2')}</span>
          <span>${escapeHtml(importPreview.source?.sha || '')}</span>
        </div>
        <h2>One Time — HighLevel UI Setup</h2>
        <p class="muted">Ordered UI setup jobs from the pinned One Time HighLevel Agent Mode export.</p>
        ${blocker ? `<div class="notice error"><strong>${escapeHtml(blocker.id || 'Blocked')}</strong><br>${escapeHtml(blocker.message || '')}<br>${escapeHtml(blocker.next_action || '')}</div>` : ''}
        <div class="job-list">
          ${jobs.length ? jobs.map(renderJobCard).join('') : '<div class="notice">No GHL jobs were imported because the export JSON is not available on the pinned One Time ref.</div>'}
        </div>
      </section>
    `;
  }

  function renderJobCard(job) {
    const readbackDisabled = job.latest_result_ref ? '' : 'disabled';
    return `
      <article class="card job-card" data-agent-action-job="${escapeHtml(job.job_id)}">
        <div class="job-meta">
          <span class="status-pill ${statusClass(job.status)}">${escapeHtml(job.status)}</span>
          <span>${escapeHtml(job.category)}</span>
          <span>${escapeHtml(job.target_workspace)}</span>
          <span>${escapeHtml(job.source_sha || '')}</span>
        </div>
        <div>
          <h3>${escapeHtml(job.title || job.job_id)}</h3>
          <p class="muted">${escapeHtml(job.target_application || '')} / ${escapeHtml(job.target_ui_url || '')}</p>
        </div>
        <div class="prompt-box">${escapeHtml(job.prompt || 'No prompt loaded.')}</div>
        <div class="toolbar">
          <button type="button" data-action-id="ACTION-AGENT-ACTION-COPY-PROMPT" onclick="AgentActions.copyPrompt('${escapeHtml(job.job_id)}')">Copy Prompt</button>
          <a class="button" data-action-id="ACTION-AGENT-ACTION-OPEN-TARGET" href="${escapeHtml(job.target_ui_url || '#')}" target="_blank" rel="noopener">Open Target</a>
          <button type="button" data-action-id="ACTION-AGENT-ACTION-I-STARTED" onclick="AgentActions.started('${escapeHtml(job.job_id)}')">I Started</button>
          <a class="button" data-action-id="ACTION-AGENT-ACTION-SAVE-PARTIAL" href="${escapeHtml(job.dropoff_url)}?mode=partial">Save Partial Result</a>
          <a class="button primary" data-action-id="ACTION-AGENT-ACTION-SAVE-COMPLETED" href="${escapeHtml(job.dropoff_url)}?mode=complete">Save Completed Result</a>
          <button type="button" data-action-id="ACTION-AGENT-ACTION-READBACK" onclick="AgentActions.readback('${escapeHtml(job.job_id)}')" ${readbackDisabled}>Readback</button>
          <button type="button" data-action-id="ACTION-AGENT-ACTION-RETRY" onclick="AgentActions.retry('${escapeHtml(job.job_id)}')">Retry</button>
          <button type="button" class="danger" data-action-id="ACTION-AGENT-ACTION-SUPERSEDE" onclick="AgentActions.supersede('${escapeHtml(job.job_id)}')">Supersede</button>
        </div>
      </article>
    `;
  }

  function renderQueue() {
    const jobs = selectedJobs();
    const detailId = jobIdFromPath();
    if (detailId && !jobs.length) {
      return `<section class="card"><h2>Agent Action not found</h2><p class="muted">${escapeHtml(detailId)}</p></section>`;
    }
    return `
      ${renderHighLevelCard()}
      <section class="grid">
        <div class="platform-header">
          <div>
            <p class="platform-kicker">${detailId ? 'Job detail' : 'Queue'}</p>
            <h2>${detailId ? escapeHtml(detailId) : 'All Agent Action Jobs'}</h2>
          </div>
          <span class="status-pill">${jobs.length} shown</span>
        </div>
        <div class="job-list">
          ${jobs.length ? jobs.map(renderJobCard).join('') : '<div class="card">No Agent Action jobs are available yet.</div>'}
        </div>
      </section>
    `;
  }

  function renderReadback() {
    if (!state.readback) return '';
    return `
      <section class="card">
        <h2>Readback</h2>
        <pre class="readback">${escapeHtml(JSON.stringify(state.readback, null, 2))}</pre>
      </section>
    `;
  }

  function render() {
    if (!root) return;
    if (!state.payload) {
      root.innerHTML = '<section class="card">Loading Agent Actions...</section>';
      return;
    }
    root.innerHTML = `
      ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ''}
      ${state.error ? `<div class="notice error">${escapeHtml(state.error)}</div>` : ''}
      <section class="grid three">
        <div class="card"><div class="metric">${escapeHtml(state.payload.jobs?.length || 0)}</div><div class="muted">Jobs</div></div>
        <div class="card"><div class="metric">${escapeHtml(state.payload.ghl_jobs_imported || 0)}</div><div class="muted">GHL imported</div></div>
        <div class="card"><div class="metric">${escapeHtml(state.payload.job_type || 'agent_action')}</div><div class="muted">Job type</div></div>
      </section>
      ${renderQueue()}
      ${renderReadback()}
    `;
  }

  async function load() {
    try {
      state.payload = await requestJson('/api/platform/agent-actions');
      state.csrf = state.payload?.csrf_token || '';
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  window.AgentActions = {
    copyPrompt(jobId) {
      const job = jobById(jobId);
      if (job) copyText(job.prompt, 'Prompt').catch((error) => {
        state.error = error.message;
        render();
      });
    },
    started(jobId) {
      postJobAction(jobId, 'i_started').catch((error) => {
        state.error = error.message;
        render();
      });
    },
    retry(jobId) {
      postJobAction(jobId, 'retry').catch((error) => {
        state.error = error.message;
        render();
      });
    },
    supersede(jobId) {
      postJobAction(jobId, 'supersede').catch((error) => {
        state.error = error.message;
        render();
      });
    },
    readback(jobId) {
      readback(jobId).catch((error) => {
        state.error = error.message;
        render();
      });
    },
  };

  load();
}());
