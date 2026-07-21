(function () {
  const root = document.getElementById('schoolAdminApp');
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
      window.location.href = `/operations-login.html?returnTo=${encodeURIComponent('/operations/school')}`;
      return null;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  function renderCards() {
    const cards = Array.isArray(state.data?.cards) ? state.data.cards : [];
    return `
      <section class="grid four">
        ${cards.map((card) => `
          <article class="card" id="${escapeHtml(card.id)}">
            <div class="metric">${card.count === null ? 'N/A' : escapeHtml(card.count)}</div>
            <h3>${escapeHtml(card.label)}</h3>
            <span class="status-pill ${escapeHtml(card.status)}">${escapeHtml(card.status)}</span>
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderControls() {
    const controls = Array.isArray(state.data?.controls) ? state.data.controls : [];
    return `
      <section class="card" id="progress">
        <h2>School controls</h2>
        <p class="muted">These links open the existing Operations modules with BNA School scope selected through compatibility routing.</p>
        <div class="toolbar">
          ${controls.map((control) => `<a class="button" data-action-id="ACTION-BNA-SCHOOL-OPEN-MODULE" href="${escapeHtml(control.target)}">${escapeHtml(control.label)}</a>`).join('')}
        </div>
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
      root.innerHTML = '<section class="card">Loading BNA School workspace...</section>';
      return;
    }
    root.innerHTML = `
      <section class="grid two">
        <article class="card">
          <h2>Canonical scope</h2>
          <p><strong>${escapeHtml(state.data.workspace?.workspace_key || state.data.workspace?.key || 'bna_school')}</strong></p>
          <p class="muted">${escapeHtml(state.data.workspace?.subtitle || 'School workspace')}</p>
        </article>
        <article class="card">
          <h2>Isolation</h2>
          <p class="muted">Private One Time connector/product data is not loaded by this summary route.</p>
          <span class="status-pill ready">bounded summary</span>
        </article>
      </section>
      ${renderCards()}
      ${renderControls()}
    `;
  }

  async function load() {
    try {
      state.data = await requestJson('/api/bna/school-admin/summary');
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  load();
}());
