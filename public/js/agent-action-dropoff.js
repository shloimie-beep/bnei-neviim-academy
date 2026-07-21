(function () {
  const state = {
    job: null,
    csrf: '',
    notice: '',
    error: '',
    result: null,
    readback: null,
  };
  const root = document.getElementById('agentActionDropoffApp');

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
    const match = window.location.pathname.match(/^\/operations\/agent-actions\/([^/]+)\/dropoff$/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function modeFromQuery() {
    const mode = new URLSearchParams(window.location.search).get('mode');
    return mode === 'complete' ? 'complete' : 'partial';
  }

  function draftKey() {
    return `bna-agent-action-dropoff:${jobIdFromPath()}`;
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
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

  function loadDraft() {
    try {
      return JSON.parse(localStorage.getItem(draftKey()) || '{}');
    } catch {
      return {};
    }
  }

  function saveDraft() {
    const form = document.getElementById('agentActionForm');
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem(draftKey(), JSON.stringify({ ...data, saved_at: new Date().toISOString() }));
    state.notice = 'Emergency draft saved locally.';
    render();
  }

  function renderJob() {
    const job = state.job;
    if (!job) return '<section class="card">Loading Agent Action job...</section>';
    return `
      <section class="card">
        <div class="job-meta">
          <span class="status-pill ${escapeAttr(job.status)}">${escapeHtml(job.status)}</span>
          <span>${escapeHtml(job.category)}</span>
          <span>${escapeHtml(job.target_workspace)}</span>
        </div>
        <h2>${escapeHtml(job.title || job.job_id)}</h2>
        <p class="muted">${escapeHtml(job.source_repository)} / ${escapeHtml(job.source_sha)}</p>
        <div class="prompt-box">${escapeHtml(job.prompt || '')}</div>
        <div class="toolbar">
          <button type="button" onclick="AgentActionDropoff.copyPrompt()">Copy Prompt</button>
          <a class="button" href="${escapeAttr(job.target_ui_url || '#')}" target="_blank" rel="noopener">Open Target</a>
          <a class="button" href="${escapeAttr(job.detail_url || '/operations/agent-actions')}">Readback</a>
        </div>
      </section>
    `;
  }

  function renderForm() {
    if (!state.job) return '';
    const draft = loadDraft();
    const mode = modeFromQuery();
    const defaultAction = mode === 'complete' ? 'save_completed' : 'save_partial';
    const defaultSummary = draft.summary || '';
    const defaultEvidence = draft.evidence || '';
    const defaultChecklist = draft.completion_checklist || '';
    const defaultAssets = draft.expected_asset_ids || '';
    const defaultJson = draft.result_json || '';
    const idempotency = draft.idempotency_key || `${state.job.idempotency_key}:${defaultAction}`;
    return `
      <form id="agentActionForm" class="card form-grid" onsubmit="AgentActionDropoff.submit(event)">
        <div class="field">
          <label for="action">Save action</label>
          <select id="action" name="action">
            <option value="save_partial" ${defaultAction === 'save_partial' ? 'selected' : ''}>Save Partial Result</option>
            <option value="save_completed" ${defaultAction === 'save_completed' ? 'selected' : ''}>Save Completed Result</option>
            <option value="blocked">Blocked</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div class="field">
          <label for="idempotency_key">Idempotency key</label>
          <input id="idempotency_key" name="idempotency_key" value="${escapeAttr(idempotency)}">
        </div>
        <div class="field full">
          <label for="summary">Summary</label>
          <textarea id="summary" name="summary" required>${escapeHtml(defaultSummary)}</textarea>
        </div>
        <div class="field full">
          <label for="evidence">Evidence requirements</label>
          <textarea id="evidence" name="evidence" placeholder="One item per line">${escapeHtml(defaultEvidence)}</textarea>
        </div>
        <div class="field">
          <label for="completion_checklist">Completion checklist</label>
          <textarea id="completion_checklist" name="completion_checklist" placeholder="One item per line">${escapeHtml(defaultChecklist)}</textarea>
        </div>
        <div class="field">
          <label for="expected_asset_ids">Expected asset IDs</label>
          <textarea id="expected_asset_ids" name="expected_asset_ids" placeholder="One item per line">${escapeHtml(defaultAssets)}</textarea>
        </div>
        <div class="field full">
          <label for="result_json">Optional JSON result</label>
          <textarea id="result_json" name="result_json">${escapeHtml(defaultJson)}</textarea>
        </div>
        <div class="field full toolbar">
          <button type="button" onclick="AgentActionDropoff.saveDraft()">Save Emergency Draft</button>
          <button type="submit" data-action-id="ACTION-AGENT-ACTION-SAVE-PARTIAL">Save Partial Result</button>
          <button type="button" class="primary" data-action-id="ACTION-AGENT-ACTION-SAVE-COMPLETED" onclick="AgentActionDropoff.submitCompleted()">Save Completed Result</button>
        </div>
      </form>
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
    root.innerHTML = `
      ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ''}
      ${state.error ? `<div class="notice error">${escapeHtml(state.error)}</div>` : ''}
      ${renderJob()}
      ${renderForm()}
      ${renderReadback()}
    `;
  }

  function lines(value) {
    return String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }

  async function submitWithAction(action) {
    const form = document.getElementById('agentActionForm');
    if (!form || !state.job) return;
    const data = Object.fromEntries(new FormData(form).entries());
    data.action = action || data.action;
    data.evidence = lines(data.evidence);
    data.completion_checklist = lines(data.completion_checklist);
    data.expected_asset_ids = lines(data.expected_asset_ids);
    const parsed = data.result_json ? JSON.parse(data.result_json) : {};
    const response = await requestJson(`/api/platform/agent-actions/${encodeURIComponent(state.job.job_id)}/results`, {
      method: 'POST',
      headers: { 'X-BNA-Agent-Action-CSRF': state.csrf },
      body: JSON.stringify({ ...parsed, ...data }),
    });
    if (!response) return;
    state.result = response.result;
    state.notice = `${response.result_ref} saved. Running readback.`;
    localStorage.removeItem(draftKey());
    state.readback = await requestJson(response.readback_url);
    state.notice = `${response.result_ref} saved and read back.`;
    render();
  }

  async function load() {
    try {
      const jobId = jobIdFromPath();
      const data = await requestJson(`/api/platform/agent-actions/${encodeURIComponent(jobId)}`);
      state.job = data.job;
      state.csrf = data.csrf_token || '';
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  window.AgentActionDropoff = {
    copyPrompt() {
      navigator.clipboard.writeText(state.job?.prompt || '').then(() => {
        state.notice = 'Prompt copied.';
        render();
      }).catch((error) => {
        state.error = error.message;
        render();
      });
    },
    saveDraft,
    submit(event) {
      event.preventDefault();
      submitWithAction().catch((error) => {
        state.error = error.message;
        render();
      });
    },
    submitCompleted() {
      submitWithAction('save_completed').catch((error) => {
        state.error = error.message;
        render();
      });
    },
  };

  load();
}());
