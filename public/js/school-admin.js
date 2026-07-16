(() => {
  'use strict';

  performance.mark('bna-school-admin-script-start');

  const app = document.getElementById('schoolApp');
  const tabs = [...document.querySelectorAll('[data-view]')];
  const searchForm = document.getElementById('schoolSearchForm');
  const searchInput = document.getElementById('schoolSearch');
  const refreshButton = document.getElementById('schoolRefresh');

  const params = new URLSearchParams(window.location.search);
  const state = {
    view: ['dashboard', 'students', 'families', 'classes', 'attendance', 'progress'].includes(params.get('view'))
      ? params.get('view')
      : 'dashboard',
    q: params.get('q') || '',
    loading: true,
    error: '',
    data: null,
    selected: null,
    controller: null,
  };

  if (searchInput) searchInput.value = state.q;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function formatDay(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
  }

  function syncTabs() {
    tabs.forEach((tab) => {
      const active = tab.dataset.view === state.view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.pathname = '/operations/school';
    url.searchParams.set('view', state.view);
    if (state.q) url.searchParams.set('q', state.q);
    else url.searchParams.delete('q');
    window.history.replaceState({ schoolAdmin: true }, '', `${url.pathname}${url.search}`);
  }

  function markUsefulAction() {
    if (document.documentElement.dataset.schoolUsefulAction === 'ready') return;
    document.documentElement.dataset.schoolUsefulAction = 'ready';
    performance.mark('bna-school-admin-useful-action');
    performance.measure('bna-school-admin-navigation-to-useful-action', 'bna-school-admin-html-start', 'bna-school-admin-useful-action');
    window.__bnaSchoolAdminPerformance = {
      route_id: 'operations_school_admin',
      useful_action_ready: true,
      view: state.view,
      request_groups_before_useful_action: ['school_admin_summary'],
      excluded_before_useful_action: ['control_plane', 'provider_marketplace', 'one_time', 'global_agents', 'deployment', 'integration_readiness'],
    };
  }

  function metric(label, value, helper = '') {
    return `
      <article class="school-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        ${helper ? `<p class="school-muted">${escapeHtml(helper)}</p>` : ''}
      </article>
    `;
  }

  function chip(value, kind = '') {
    return value ? `<span class="school-chip ${escapeHtml(kind)}">${escapeHtml(value)}</span>` : '';
  }

  function rowAction(label, kind, id, view = '') {
    return `<button type="button" class="school-row-button" data-action-id="ACTION-SCHOOL-ADMIN-ROW-OPEN" data-open-kind="${escapeHtml(kind)}" data-open-id="${escapeHtml(id)}" data-open-view="${escapeHtml(view)}">${escapeHtml(label)}</button>`;
  }

  function emptyState(label) {
    return `<div class="school-empty">${escapeHtml(label)}</div>`;
  }

  function currentRows(kind) {
    const data = state.data || {};
    if (kind === 'students') return data.students?.rows || [];
    if (kind === 'families') return data.families?.rows || [];
    if (kind === 'classes') return data.classes?.rows || [];
    if (kind === 'attendance') return data.attendance?.rows || [];
    if (kind === 'progress') return data.progress?.rows || [];
    return [];
  }

  function selectedRecord() {
    if (!state.selected) return null;
    return currentRows(state.selected.kind).find((item) => String(item.id) === String(state.selected.id)) || null;
  }

  function renderHeader(title, helper = '') {
    return `
      <section class="school-panel">
        <h2>${escapeHtml(title)}</h2>
        ${helper ? `<p class="school-muted">${escapeHtml(helper)}</p>` : ''}
      </section>
    `;
  }

  function renderDashboard() {
    const summary = state.data?.summary || {};
    const students = currentRows('students').slice(0, 4);
    const classes = currentRows('classes').slice(0, 4);
    return `
      <div class="school-grid">
        ${metric('Students', summary.active_students || 0, 'Active school roster')}
        ${metric('Families', Number(summary.family_signups || 0) + Number(summary.parent_leads || 0), 'Signups and parent leads')}
        ${metric('Classes', summary.active_classes || 0, 'Scheduled school classes')}
        ${metric('Recent updates', summary.recent_progress_events || 0, 'Last 14 days')}
      </div>
      <div class="school-detail">
        <section class="school-panel">
          <h2>Students</h2>
          <div class="school-list">
            ${students.length ? students.map(renderStudentRow).join('') : emptyState('No students loaded.')}
          </div>
        </section>
        <section class="school-panel">
          <h2>Classes</h2>
          <div class="school-list">
            ${classes.length ? classes.map(renderClassRow).join('') : emptyState('No classes loaded.')}
          </div>
        </section>
      </div>
    `;
  }

  function renderStudentRow(student) {
    return `
      <article class="school-row">
        <div>
          <h3>${escapeHtml(student.name || 'Student')}</h3>
          <p class="school-muted">${escapeHtml([student.grade, student.parent_name].filter(Boolean).join(' / ') || 'No family details loaded')}</p>
          <div class="school-row-meta">
            ${chip(`${Number(student.open_goals || 0)} open goals`, Number(student.open_goals || 0) ? 'warn' : 'ok')}
            ${chip(student.latest_progress_percent === null ? 'No progress' : `${student.latest_progress_percent}% progress`)}
            ${chip(student.attendance_percent === null ? 'No attendance' : `${student.attendance_percent}% attendance`)}
            ${chip(student.masked_parent_email)}
          </div>
        </div>
        ${rowAction('Open', 'students', student.id, 'students')}
      </article>
    `;
  }

  function renderFamilyRow(family) {
    return `
      <article class="school-row">
        <div>
          <h3>${escapeHtml(family.parent_name || 'Family')}</h3>
          <p class="school-muted">${escapeHtml(family.student_name || 'No student name')} ${family.student_grade ? `/ ${escapeHtml(family.student_grade)}` : ''}</p>
          <div class="school-row-meta">
            ${chip(family.source)}
            ${chip(family.status)}
            ${chip(family.interest_level)}
            ${chip(family.payment_status)}
            ${chip(family.masked_parent_email)}
          </div>
        </div>
        ${rowAction('Open', 'families', family.id, 'families')}
      </article>
    `;
  }

  function renderClassRow(item) {
    return `
      <article class="school-row">
        <div>
          <h3>${escapeHtml(item.title || 'Class')}</h3>
          <p class="school-muted">${escapeHtml(item.class_type || 'Class')} / ${escapeHtml(formatDate(item.starts_at))}</p>
          <div class="school-row-meta">
            ${chip(item.status)}
            ${chip(`${Number(item.attendance_records || 0)} attendance rows`)}
            ${chip(`${Number(item.present_records || 0)} present`, 'ok')}
          </div>
        </div>
        ${rowAction('Open', 'classes', item.id, 'classes')}
      </article>
    `;
  }

  function renderAttendanceRow(item) {
    return `
      <article class="school-row">
        <div>
          <h3>${escapeHtml(item.student_name || 'Student')}</h3>
          <p class="school-muted">${escapeHtml(item.class_title || 'Class')} / ${escapeHtml(formatDay(item.attendance_date))}</p>
          <div class="school-row-meta">
            ${chip(item.status, item.status === 'present' ? 'ok' : 'warn')}
            ${chip(`Class #${item.class_id || ''}`)}
          </div>
        </div>
        ${rowAction('Open class', 'attendance', item.id, 'classes')}
      </article>
    `;
  }

  function renderProgressRow(item) {
    return `
      <article class="school-row">
        <div>
          <h3>${escapeHtml(item.title || item.event_type || 'Progress')}</h3>
          <p class="school-muted">${escapeHtml(item.student_name || 'Student')} / ${escapeHtml(formatDate(item.occurred_at))}</p>
          <div class="school-row-meta">
            ${chip(item.event_type)}
            ${chip(item.progress_percent === null ? '' : `${item.progress_percent}% progress`)}
            ${chip(item.attendance_status)}
            ${item.follow_up_required ? chip('Follow up', 'warn') : ''}
          </div>
        </div>
        ${rowAction('Open student', 'progress', item.id, 'students')}
      </article>
    `;
  }

  function renderRows(title, kind, renderer, helper = '') {
    const rows = currentRows(kind);
    return `
      ${renderHeader(title, helper)}
      <section class="school-panel">
        <div class="school-list">
          ${rows.length ? rows.map(renderer).join('') : emptyState(`No ${title.toLowerCase()} match this view.`)}
        </div>
      </section>
      ${renderSelectedDetail()}
    `;
  }

  function renderSelectedDetail() {
    const record = selectedRecord();
    if (!record) return '';
    return `
      <section class="school-panel">
        <h2>Selected</h2>
        <div class="school-card-grid">
          ${Object.entries(record).slice(0, 9).map(([key, value]) => `
            <article class="school-card">
              <span>${escapeHtml(key.replace(/_/g, ' '))}</span>
              <p>${escapeHtml(value === null || value === undefined || value === '' ? 'Not set' : value)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderProgress() {
    const goals = state.data?.group_goals || [];
    return `
      ${renderHeader('Progress', 'Learner progress, goals, questions, and recent learning notes.')}
      <section class="school-panel">
        <h2>Group goals</h2>
        <div class="school-card-grid">
          ${goals.length ? goals.map((goal) => `
            <article class="school-card">
              <span>${escapeHtml(goal.status || 'goal')}</span>
              <h3>${escapeHtml(goal.title || 'Goal')}</h3>
              <p class="school-muted">Due ${escapeHtml(formatDay(goal.due_date))}</p>
            </article>
          `).join('') : emptyState('No active group goals loaded.')}
        </div>
      </section>
      <section class="school-panel">
        <h2>Recent progress</h2>
        <div class="school-list">
          ${currentRows('progress').length ? currentRows('progress').map(renderProgressRow).join('') : emptyState('No progress rows loaded.')}
        </div>
      </section>
      ${renderSelectedDetail()}
    `;
  }

  function render() {
    syncTabs();
    syncUrl();

    if (state.loading && !state.data) {
      app.innerHTML = `
        <section class="school-panel school-panel-loading">
          <div class="school-loading-line"></div>
          <div class="school-loading-line short"></div>
        </section>
      `;
      return;
    }

    if (state.error && !state.data) {
      app.innerHTML = `<section class="school-error">${escapeHtml(state.error)}</section>`;
      return;
    }

    const staleNotice = state.loading ? '<section class="school-panel"><p class="school-muted">Refreshing...</p></section>' : '';
    const errorNotice = state.error ? `<section class="school-error">${escapeHtml(state.error)}</section>` : '';
    let content = '';

    if (state.view === 'dashboard') content = renderDashboard();
    if (state.view === 'students') content = renderRows('Students', 'students', renderStudentRow, 'Roster, attendance, progress, and parent contact readiness.');
    if (state.view === 'families') content = renderRows('Families', 'families', renderFamilyRow, 'Current signups and parent leads.');
    if (state.view === 'classes') content = renderRows('Classes', 'classes', renderClassRow, 'Class and schedule rows scoped to BNA School.');
    if (state.view === 'attendance') content = renderRows('Attendance', 'attendance', renderAttendanceRow, 'Recent class attendance records.');
    if (state.view === 'progress') content = renderProgress();

    app.innerHTML = staleNotice + errorNotice + content;
    markUsefulAction();
  }

  async function loadData() {
    if (state.controller) state.controller.abort();
    state.controller = new AbortController();
    state.loading = true;
    state.error = '';
    render();

    const query = new URLSearchParams({ limit: '40' });
    if (state.q) query.set('q', state.q);

    try {
      performance.mark('bna-school-admin-data-request-start');
      const response = await fetch(`/api/bna/school-admin/summary?${query.toString()}`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        signal: state.controller.signal,
      });
      if (response.status === 401) {
        window.location.href = '/operations-login.html?redirect=/operations/school';
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
      performance.mark('bna-school-admin-data-request-end');
      performance.measure('bna-school-admin-summary-request', 'bna-school-admin-data-request-start', 'bna-school-admin-data-request-end');
      state.data = data;
      state.loading = false;
      state.error = '';
    } catch (error) {
      if (error.name === 'AbortError') return;
      state.loading = false;
      state.error = error.message || 'School data could not load.';
    }

    render();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.view = tab.dataset.view || 'dashboard';
      state.selected = null;
      render();
    });
  });

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.q = searchInput?.value?.trim() || '';
    state.selected = null;
    loadData();
  });

  refreshButton?.addEventListener('click', () => {
    state.selected = null;
    loadData();
  });

  app.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-kind]');
    if (!button) return;
    const nextView = button.dataset.openView || state.view;
    if (['dashboard', 'students', 'families', 'classes', 'attendance', 'progress'].includes(nextView)) {
      state.view = nextView;
    }
    state.selected = {
      kind: button.dataset.openKind,
      id: button.dataset.openId,
    };
    render();
  });

  window.addEventListener('popstate', () => {
    const next = new URLSearchParams(window.location.search);
    state.view = ['dashboard', 'students', 'families', 'classes', 'attendance', 'progress'].includes(next.get('view'))
      ? next.get('view')
      : 'dashboard';
    state.q = next.get('q') || '';
    if (searchInput) searchInput.value = state.q;
    render();
  });

  performance.mark('bna-school-admin-shell-ready');
  loadData();
})();
