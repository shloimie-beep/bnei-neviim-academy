(function attachPlatformUi(global) {
  const EVENT_NAMES = [
    'instance.changed',
    'workspace.changed',
    'membership.changed',
    'module.visibility.changed',
    'community.created',
    'course.created',
    'lesson.video.attached',
    'integration.readiness.checked',
    'ui.instance.switch_requested',
    'ui.workspace.switch_requested',
    'ui.module.opened',
    'ui.course.opened',
    'ui.community.opened',
    'ui.provider.opened',
    'ui.reward.opened',
    'ui.prompt_queue.opened',
  ];

  const INTEGRATION_ENDPOINTS = {
    shell: 'GET /api/bna/platform-shell-view-model',
    members: 'GET/POST /api/bna/platform-members',
    students: 'GET/POST /api/bna/platform-students',
    communities: 'GET/POST /api/bna/platform-communities',
    courses: 'GET/POST /api/bna/platform-courses',
    lessons: 'GET/PATCH /api/bna/platform-lessons',
    videos: 'GET /api/bna/platform-video-assets',
    rewards: 'GET/POST /api/bna/platform-rewards',
    integrations: 'GET/POST /api/bna/platform-integrations/readiness',
    agents: 'GET /api/bna/platform-agent-runs',
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function byId(list, id) {
    return (list || []).find((item) => String(item.id) === String(id)) || null;
  }

  function redacted(value) {
    if (value === null || value === undefined || value === '') return 'Not stored';
    return '[redacted]';
  }

  function moduleDefinition(fixtures, key) {
    return (fixtures.modules || []).find((module) => module.key === key) || null;
  }

  function visibleModuleDefinitions(shell, fixtures) {
    const visibility = shell.activeWorkspace?.module_visibility || {};
    const visibleKeys = new Set(shell.visibleModules || []);
    const role = shell.activeRole || 'admin';
    return (fixtures.modules || []).filter((module) => {
      const roleAllowed = !Array.isArray(module.roles) || module.roles.includes(role) || role === 'super_admin';
      return roleAllowed && visibility[module.key] !== false && visibleKeys.has(module.key);
    });
  }

  function groupedModules(modules) {
    return modules.reduce((groups, module) => {
      if (!groups[module.group]) groups[module.group] = [];
      groups[module.group].push(module);
      return groups;
    }, {});
  }

  function workspaceData(fixtures, workspaceId) {
    return clone(fixtures.data?.[workspaceId] || fixtures.data?.bna || {});
  }

  function shellViewModel(fixtures, workspaceId) {
    return clone(fixtures.viewModels?.[workspaceId] || fixtures.viewModels?.bna);
  }

  function firstVisibleModule(shell, fixtures) {
    return visibleModuleDefinitions(shell, fixtures)[0]?.key || 'overview';
  }

  function createInitialState(fixtures, options = {}) {
    const workspaceId = options.workspaceId || 'bna';
    const shell = shellViewModel(fixtures, workspaceId);
    const data = workspaceData(fixtures, workspaceId);
    const visible = visibleModuleDefinitions(shell, fixtures);
    const requestedModule = options.moduleKey || 'overview';
    return {
      workspaceId,
      shell,
      data,
      activeModule: visible.some((module) => module.key === requestedModule) ? requestedModule : firstVisibleModule(shell, fixtures),
      selectedCourseId: data.courses?.[0]?.id || null,
      selectedCommunityId: data.communities?.[0]?.id || null,
      selectedRewardId: data.rewards?.[0]?.id || null,
      search: '',
      dialog: null,
      toast: null,
      eventLog: [],
      validationErrors: {},
      loadingState: 'ready',
    };
  }

  function deriveModuleCards(shell, data, fixtures) {
    const counts = {
      overview: data.metrics?.length || 0,
      members: data.members?.length || 0,
      students: data.students?.length || 0,
      service_providers: data.serviceProviders?.length || 0,
      community: data.communities?.length || 0,
      courses: data.courses?.length || 0,
      course_builder: data.courses?.reduce((sum, course) => sum + (course.modules?.length || 0), 0) || 0,
      lesson_video: data.courses?.reduce((sum, course) => sum + (course.lessons?.length || 0), 0) || 0,
      content_research: data.content?.length || 0,
      tasks: data.tasks?.length || 0,
      decisions: data.decisions?.length || 0,
      calendar: data.calendar?.length || 0,
      goals_rewards: data.rewards?.length || 0,
      prompt_queue: data.promptQueue?.length || 0,
      agents: data.agents?.length || 0,
      automations: data.automations?.length || 0,
      integrations: data.integrations?.length || 0,
      settings: Object.keys(shell.activeWorkspace?.module_visibility || {}).length,
    };
    return visibleModuleDefinitions(shell, fixtures).map((module) => ({
      key: module.key,
      label: module.label,
      status: counts[module.key] ? 'active' : 'empty',
      visibility: shell.activeWorkspace?.module_visibility?.[module.key] === false ? 'hidden' : 'visible',
      primaryMetric: counts[module.key] || 0,
      secondaryMetric: module.group,
      actionState: counts[module.key] ? 'ready' : 'empty',
    }));
  }

  function recordEvent(state, type, payload = {}) {
    const event = {
      type,
      payload,
      at: new Date().toISOString(),
      workspace: state.workspaceId,
      instance: state.shell.activeInstance?.slug || '',
    };
    state.eventLog = [event, ...(state.eventLog || [])].slice(0, 12);
    return event;
  }

  function switchWorkspace(state, fixtures, workspaceId) {
    const next = createInitialState(fixtures, { workspaceId });
    next.eventLog = state.eventLog || [];
    recordEvent(next, 'ui.workspace.switch_requested', { workspaceId });
    recordEvent(next, 'workspace.changed', { workspaceId });
    next.toast = `${next.shell.activeWorkspace.name} loaded`;
    return next;
  }

  function switchModule(state, fixtures, moduleKey) {
    const visibleKeys = new Set(visibleModuleDefinitions(state.shell, fixtures).map((module) => module.key));
    if (!visibleKeys.has(moduleKey)) {
      state.toast = 'Module is hidden for this workspace';
      return state;
    }
    state.activeModule = moduleKey;
    recordEvent(state, moduleKey === 'prompt_queue' ? 'ui.prompt_queue.opened' : 'ui.module.opened', { moduleKey });
    return state;
  }

  function validateMember(input = {}) {
    const errors = {};
    if (!String(input.name || '').trim()) errors.name = 'Name is required';
    if (!String(input.role || '').trim()) errors.role = 'Role is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(input.email || '').trim())) errors.email = 'Email is required';
    return errors;
  }

  function validateCommunity(input = {}) {
    const errors = {};
    if (!String(input.name || '').trim()) errors.name = 'Name is required';
    if (!String(input.visibility || '').trim()) errors.visibility = 'Visibility is required';
    if (!String(input.owner || '').trim()) errors.owner = 'Owner is required';
    return errors;
  }

  function validateCourse(input = {}) {
    const errors = {};
    if (!String(input.title || '').trim()) errors.title = 'Title is required';
    if (!String(input.visibility || '').trim()) errors.visibility = 'Visibility is required';
    if (!String(input.enrollment_rule || '').trim()) errors.enrollment_rule = 'Enrollment rule is required';
    return errors;
  }

  function validateVideoAttachment(input = {}) {
    const errors = {};
    if (!String(input.lesson_id || '').trim()) errors.lesson_id = 'Lesson is required';
    if (!String(input.video_asset_id || '').trim()) errors.video_asset_id = 'Approved video asset is required';
    if (!String(input.visibility || '').trim()) errors.visibility = 'Visibility is required';
    return errors;
  }

  function validateRewardAssignment(input = {}) {
    const errors = {};
    if (!String(input.reward_id || '').trim()) errors.reward_id = 'Reward is required';
    if (!String(input.assigned || '').trim()) errors.assigned = 'Assignment target is required';
    return errors;
  }

  function submitMember(state, input) {
    const errors = validateMember(input);
    state.validationErrors = errors;
    if (Object.keys(errors).length) return state;
    state.data.members.unshift({
      id: `mem-${Date.now()}`,
      name: input.name.trim(),
      role: input.role,
      status: 'invited',
      email: input.email.trim(),
      workspace: state.shell.activeWorkspace.name,
    });
    recordEvent(state, 'membership.changed', { name: input.name, role: input.role });
    state.dialog = null;
    state.toast = 'Member invitation staged';
    return state;
  }

  function submitCommunity(state, input) {
    const errors = validateCommunity(input);
    state.validationErrors = errors;
    if (Object.keys(errors).length) return state;
    const community = {
      id: `com-${Date.now()}`,
      name: input.name.trim(),
      visibility: input.visibility,
      groups: Number(input.groups || 1),
      posts: 0,
      moderation: 0,
      pinned: [input.description || 'Launch resource'],
    };
    state.data.communities.unshift(community);
    state.selectedCommunityId = community.id;
    recordEvent(state, 'community.created', { id: community.id, visibility: input.visibility });
    state.dialog = null;
    state.toast = 'Community staged';
    return state;
  }

  function submitCourse(state, input) {
    const errors = validateCourse(input);
    state.validationErrors = errors;
    if (Object.keys(errors).length) return state;
    const course = {
      id: `course-${Date.now()}`,
      title: input.title.trim(),
      status: 'draft',
      visibility: input.visibility,
      enrollment_rule: input.enrollment_rule,
      modules: [{ id: `mod-${Date.now()}`, title: 'Opening module', lessons: 0 }],
      lessons: [],
      progressSummary: { enrolled: 0, started: 0, complete: 0 },
      videoReadiness: { ready: 0, missing: 0, blocked: 0 },
    };
    state.data.courses.unshift(course);
    state.selectedCourseId = course.id;
    recordEvent(state, 'course.created', { id: course.id, visibility: input.visibility });
    state.dialog = null;
    state.toast = 'Course draft staged';
    return state;
  }

  function submitVideoAttachment(state, input, videoAssets = global.PlatformUiFixtures?.videoAssets || []) {
    const errors = validateVideoAttachment(input);
    state.validationErrors = errors;
    if (Object.keys(errors).length) return state;
    const asset = byId(videoAssets, input.video_asset_id);
    for (const course of state.data.courses || []) {
      const lesson = byId(course.lessons || [], input.lesson_id);
      if (lesson) {
        lesson.video_asset_id = input.video_asset_id;
        lesson.status = 'ready';
        lesson.duration = asset?.duration || lesson.duration || '';
        course.videoReadiness.ready += 1;
        course.videoReadiness.missing = Math.max(0, course.videoReadiness.missing - 1);
      }
    }
    recordEvent(state, 'lesson.video.attached', {
      lesson_id: input.lesson_id,
      video_asset_id: input.video_asset_id,
      visibility: input.visibility,
    });
    state.dialog = null;
    state.toast = 'Video attachment staged';
    return state;
  }

  function submitRewardAssignment(state, input) {
    const errors = validateRewardAssignment(input);
    state.validationErrors = errors;
    if (Object.keys(errors).length) return state;
    const reward = byId(state.data.rewards || [], input.reward_id);
    if (reward) {
      reward.assigned = input.assigned.trim();
      reward.state = 'assigned';
      reward.audit = ['Assigned in local UI fixture', ...(reward.audit || [])];
      state.selectedRewardId = reward.id;
      recordEvent(state, 'ui.reward.opened', { reward_id: reward.id, assigned: reward.assigned });
    }
    state.dialog = null;
    state.toast = 'Reward assignment staged';
    return state;
  }

  function testIntegration(state, providerId) {
    const integration = byId(state.data.integrations || [], providerId);
    if (integration) {
      integration.last_check = 'checked in local fixture';
      integration.secret = redacted(integration.secret);
      recordEvent(state, 'integration.readiness.checked', { provider: providerId, readiness: integration.readiness });
      state.toast = `${integration.name} readiness checked`;
    }
    return state;
  }

  function filtered(items, search, fields) {
    const query = String(search || '').trim().toLowerCase();
    if (!query) return items || [];
    return (items || []).filter((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(query)));
  }

  function table(headers, rows) {
    return `
      <div class="pui-table" role="table" style="--pui-table-columns:${headers.length}">
        <div class="pui-table-row pui-table-head" role="row">
          ${headers.map((header) => `<div role="columnheader">${escapeHtml(header)}</div>`).join('')}
        </div>
        ${rows.map((row) => `
          <div class="pui-table-row" role="row">
            ${row.map((cell) => `<div role="cell">${cell}</div>`).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  function emptyState(title, detail) {
    return `<section class="pui-empty" aria-live="polite"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></section>`;
  }

  function statusPill(value) {
    const key = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `<span class="pui-pill pui-pill-${escapeHtml(key)}">${escapeHtml(value || 'unknown')}</span>`;
  }

  function renderTopbar(state, fixtures) {
    const workspaceOptions = (fixtures.workspaces || []).map((workspace) => `
      <button class="pui-workspace-option ${workspace.id === state.workspaceId ? 'is-active' : ''}" type="button" data-action="workspace" data-workspace="${escapeHtml(workspace.id)}">
        <strong>${escapeHtml(workspace.label)}</strong>
        <span>${escapeHtml(workspace.description)}</span>
      </button>
    `).join('');
    return `
      <header class="pui-topbar">
        <div class="pui-brand-lockup">
          <span class="pui-brand-mark" aria-hidden="true">${escapeHtml(state.shell.brand.logo_label)}</span>
          <span><strong>${escapeHtml(state.shell.brand.product_name)}</strong><small>${escapeHtml(state.shell.activeWorkspace.name)} / ${escapeHtml(state.shell.activeRole.replace(/_/g, ' '))}</small></span>
        </div>
        <div class="pui-topbar-controls">
          <div class="pui-workspace-switcher" aria-label="Workspace switcher">${workspaceOptions}</div>
          <label class="pui-command">
            <span class="pui-sr-only">Search workspace</span>
            <input type="search" value="${escapeHtml(state.search)}" placeholder="Search" data-action="search">
          </label>
        </div>
      </header>
    `;
  }

  function renderRail(state, fixtures) {
    const groups = groupedModules(visibleModuleDefinitions(state.shell, fixtures));
    return `
      <aside class="pui-rail" aria-label="Platform modules">
        ${Object.entries(groups).map(([group, modules]) => `
          <section class="pui-nav-group">
            <h2>${escapeHtml(group)}</h2>
            ${modules.map((module) => `
              <button type="button" class="pui-nav-item ${state.activeModule === module.key ? 'is-active' : ''}" data-action="module" data-module="${escapeHtml(module.key)}">
                <span class="pui-marker" aria-hidden="true">${escapeHtml(module.marker)}</span>
                <span>${escapeHtml(module.label)}</span>
              </button>
            `).join('')}
          </section>
        `).join('')}
      </aside>
    `;
  }

  function renderOverview(state, fixtures) {
    const cards = deriveModuleCards(state.shell, state.data, fixtures);
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head">
          <div>
            <p class="pui-kicker">Workspace overview</p>
            <h1 id="pui-view-title">${escapeHtml(state.shell.activeWorkspace.name)}</h1>
          </div>
          <div class="pui-actions">
            <button type="button" class="pui-button" data-action="dialog" data-dialog="member">Add member</button>
            <button type="button" class="pui-button pui-button-primary" data-action="dialog" data-dialog="course">Add course</button>
          </div>
        </div>
        <div class="pui-metric-grid">
          ${(state.data.metrics || []).map((metric) => `
            <article class="pui-metric pui-tone-${escapeHtml(metric.tone)}">
              <span>${escapeHtml(metric.label)}</span>
              <strong>${escapeHtml(metric.value)}</strong>
            </article>
          `).join('')}
        </div>
        <div class="pui-module-grid">
          ${cards.map((card) => `
            <article class="pui-module-card">
              <div>
                <strong>${escapeHtml(card.label)}</strong>
                <span>${escapeHtml(card.secondaryMetric)}</span>
              </div>
              <button type="button" class="pui-icon-button" data-action="module" data-module="${escapeHtml(card.key)}" aria-label="Open ${escapeHtml(card.label)}">${escapeHtml(String(card.primaryMetric))}</button>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderListView(title, kicker, actionLabel, dialog, content) {
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head">
          <div><p class="pui-kicker">${escapeHtml(kicker)}</p><h1 id="pui-view-title">${escapeHtml(title)}</h1></div>
          <button type="button" class="pui-button pui-button-primary" data-action="dialog" data-dialog="${escapeHtml(dialog)}">${escapeHtml(actionLabel)}</button>
        </div>
        ${content}
      </section>
    `;
  }

  function renderUnavailableView(title, detail) {
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head">
          <div><p class="pui-kicker">Workspace scoped</p><h1 id="pui-view-title">${escapeHtml(title)}</h1></div>
        </div>
        ${emptyState(title, detail)}
      </section>
    `;
  }

  function renderPeople(state, type) {
    if (type === 'members') {
      const rows = filtered(state.data.members, state.search, ['name', 'role', 'email']).map((member) => [
        `<strong>${escapeHtml(member.name)}</strong>`,
        escapeHtml(member.role),
        escapeHtml(member.email),
        statusPill(member.status),
      ]);
      return renderListView('Members', 'People', 'Add member', 'member', table(['Name', 'Role', 'Email', 'Status'], rows));
    }
    if (type === 'students') {
      const rows = filtered(state.data.students, state.search, ['name', 'guardian', 'provider']).map((student) => [
        `<strong>${escapeHtml(student.name)}</strong>`,
        escapeHtml(student.guardian),
        escapeHtml(student.provider),
        `<span class="pui-progress"><span style="width:${Math.max(0, Math.min(100, Number(student.progress || 0)))}%"></span></span>`,
        escapeHtml(student.next),
      ]);
      return rows.length ? renderListView('Students', 'People', 'Add student', 'member', table(['Name', 'Guardian', 'Provider', 'Progress', 'Next'], rows)) : renderUnavailableView('Students', 'Hidden for this workspace or no student records are visible.');
    }
    const rows = filtered(state.data.serviceProviders, state.search, ['name', 'category', 'owner']).map((provider) => [
      `<button class="pui-link-button" type="button" data-action="provider" data-provider="${escapeHtml(provider.id)}">${escapeHtml(provider.name)}</button>`,
      escapeHtml(provider.category),
      statusPill(provider.readiness),
      escapeHtml(provider.next),
    ]);
    return rows.length ? renderListView('Service Providers', 'People', 'Add provider', 'member', table(['Name', 'Category', 'Readiness', 'Next'], rows)) : renderUnavailableView('Service Providers', 'Hidden for this workspace or no provider records are visible.');
  }

  function renderCommunity(state) {
    const items = filtered(state.data.communities, state.search, ['name', 'visibility']);
    if (!items.length) return renderUnavailableView('Community', 'No community records are visible.');
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head">
          <div><p class="pui-kicker">Engagement</p><h1 id="pui-view-title">Community</h1></div>
          <button type="button" class="pui-button pui-button-primary" data-action="dialog" data-dialog="community">Add community</button>
        </div>
        <div class="pui-feed-layout">
          ${items.map((community) => `
            <article class="pui-repeated-card">
              <div class="pui-card-head"><strong>${escapeHtml(community.name)}</strong>${statusPill(community.visibility)}</div>
              <div class="pui-stat-row">
                <span><strong>${escapeHtml(community.groups)}</strong> Groups</span>
                <span><strong>${escapeHtml(community.posts)}</strong> Posts</span>
                <span><strong>${escapeHtml(community.moderation)}</strong> Review</span>
              </div>
              <div class="pui-feed">
                ${(community.pinned || []).map((item) => `<button type="button" class="pui-feed-item">${escapeHtml(item)}</button>`).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function selectedCourse(state) {
    return byId(state.data.courses || [], state.selectedCourseId) || state.data.courses?.[0] || null;
  }

  function renderCourses(state, mode) {
    const course = selectedCourse(state);
    if (!course) return renderUnavailableView('Courses', 'No course records are visible.');
    if (mode === 'builder') return renderCourseBuilder(state, course);
    if (mode === 'video') return renderLessonVideo(state, course);
    const rows = filtered(state.data.courses, state.search, ['title', 'visibility', 'status']).map((item) => [
      `<button type="button" class="pui-link-button" data-action="course" data-course="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>`,
      statusPill(item.status),
      escapeHtml(item.visibility),
      escapeHtml(item.enrollment_rule),
      `${escapeHtml(item.progressSummary.started)} started`,
    ]);
    return renderListView('Courses', 'Engagement', 'Add course', 'course', table(['Course', 'Status', 'Visibility', 'Enrollment', 'Progress'], rows));
  }

  function renderCourseBuilder(state, course) {
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head">
          <div><p class="pui-kicker">Course builder</p><h1 id="pui-view-title">${escapeHtml(course.title)}</h1></div>
          <div class="pui-actions">
            <button type="button" class="pui-button">Preview</button>
            <button type="button" class="pui-button pui-button-primary" data-action="dialog" data-dialog="course">Add course</button>
          </div>
        </div>
        <div class="pui-builder">
          <section>
            <h2>Modules</h2>
            ${(course.modules || []).map((module, index) => `
              <article class="pui-builder-row">
                <span class="pui-sort-handle">${index + 1}</span>
                <div><strong>${escapeHtml(module.title)}</strong><span>${escapeHtml(module.lessons)} lessons</span></div>
                <button type="button" class="pui-icon-button" aria-label="Move ${escapeHtml(module.title)}">Up</button>
              </article>
            `).join('')}
          </section>
          <section>
            <h2>Lessons</h2>
            ${(course.lessons || []).map((lesson, index) => `
              <article class="pui-builder-row">
                <span class="pui-sort-handle">${index + 1}</span>
                <div><strong>${escapeHtml(lesson.title)}</strong><span>${lesson.video_asset_id ? 'Video attached' : 'Needs video'}</span></div>
                ${statusPill(lesson.status)}
              </article>
            `).join('')}
          </section>
        </div>
      </section>
    `;
  }

  function renderLessonVideo(state, course) {
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head">
          <div><p class="pui-kicker">Lesson video manager</p><h1 id="pui-view-title">${escapeHtml(course.title)}</h1></div>
          <button type="button" class="pui-button pui-button-primary" data-action="dialog" data-dialog="video">Attach video</button>
        </div>
        <div class="pui-split">
          <section>
            <h2>Lessons</h2>
            ${(course.lessons || []).map((lesson) => `
              <article class="pui-repeated-card">
                <div class="pui-card-head"><strong>${escapeHtml(lesson.title)}</strong>${statusPill(lesson.status)}</div>
                <span>${lesson.video_asset_id ? `Asset ${escapeHtml(lesson.video_asset_id)} / ${escapeHtml(lesson.duration)}` : 'No approved asset attached'}</span>
              </article>
            `).join('')}
          </section>
          <section>
            <h2>Approved assets</h2>
            ${((global.PlatformUiFixtures || {}).videoAssets || []).map((asset) => `
              <article class="pui-repeated-card">
                <div class="pui-card-head"><strong>${escapeHtml(asset.title)}</strong>${statusPill(asset.provider)}</div>
                <span>${escapeHtml(asset.duration)} / ${escapeHtml(asset.privacy)} / transcript ${escapeHtml(asset.transcript)}</span>
              </article>
            `).join('')}
          </section>
        </div>
      </section>
    `;
  }

  function renderTasksOrDecisions(state, type) {
    if (type === 'decisions') {
      return `
        <section class="pui-view" aria-labelledby="pui-view-title">
          <div class="pui-view-head"><div><p class="pui-kicker">Operations</p><h1 id="pui-view-title">Decisions</h1></div></div>
          <div class="pui-decision-list">
            ${(state.data.decisions || []).map((decision) => `
              <article class="pui-repeated-card">
                <div class="pui-card-head"><strong>${escapeHtml(decision.question)}</strong>${statusPill(decision.source)}</div>
                <p>${escapeHtml(decision.context)}</p>
                <div class="pui-segmented">${(decision.options || []).map((option) => `<button type="button">${escapeHtml(option)}</button>`).join('')}</div>
              </article>
            `).join('')}
          </div>
        </section>
      `;
    }
    const buckets = [
      ['Meeting Agenda', state.data.tasks || []],
      ['My Next 30 Days', (state.data.tasks || []).filter((task) => task.status !== 'blocked')],
      ['Codex Queue', (state.data.tasks || []).filter((task) => /codex/i.test(task.owner))],
      ['Waiting / Blocked', (state.data.tasks || []).filter((task) => task.status === 'blocked')],
      ['Recently Completed', []],
      ['Prompt/Ramble Queue', state.data.promptQueue || []],
    ];
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head"><div><p class="pui-kicker">Operations</p><h1 id="pui-view-title">Tasks</h1></div></div>
        <div class="pui-bucket-grid">
          ${buckets.map(([title, items]) => `
            <section class="pui-bucket">
              <h2>${escapeHtml(title)}</h2>
              ${items.length ? items.map((item) => `
                <article class="pui-task-row">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${statusPill(item.status || 'registered')} ${escapeHtml(item.next || `${item.requirements || 0} requirements`)}</span>
                </article>
              `).join('') : '<span class="pui-muted">No visible items</span>'}
            </section>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderSimpleCollection(state, fixtures, key) {
    const config = {
      calendar: ['Calendar', state.data.calendar || [], ['title', 'time', 'scope', 'status']],
      content_research: ['Content / Research', state.data.content || [], ['title', 'type', 'status', 'source']],
      goals_rewards: ['Goals / Rewards', state.data.rewards || [], ['name', 'rule', 'assigned', 'state']],
      agents: ['Agents', state.data.agents || [], ['name', 'status', 'prompt', 'evidence']],
      automations: ['Automations', state.data.automations || [], ['name', 'state', 'last', 'next']],
      prompt_queue: ['Prompt/Ramble Queue', state.data.promptQueue || [], ['title', 'status', 'requirements', 'next']],
    }[key];
    if (!config) return renderUnavailableView('Module', 'The selected module is not configured.');
    const [title, items, fields] = config;
    const rows = filtered(items, state.search, fields).map((item) => fields.map((field) => {
      if (field === 'state' || field === 'status') return statusPill(item[field]);
      return escapeHtml(item[field]);
    }));
    const action = key === 'goals_rewards'
      ? '<button type="button" class="pui-button pui-button-primary" data-action="dialog" data-dialog="reward">Assign reward</button>'
      : '';
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head"><div><p class="pui-kicker">${escapeHtml(moduleDefinition(fixtures, key)?.group || 'Module')}</p><h1 id="pui-view-title">${escapeHtml(title)}</h1></div>${action}</div>
        ${rows.length ? table(fields.map((field) => field.replace(/_/g, ' ')), rows) : emptyState(title, 'No records are visible.')}
      </section>
    `;
  }

  function renderIntegrations(state) {
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head"><div><p class="pui-kicker">System</p><h1 id="pui-view-title">Integrations</h1></div></div>
        <div class="pui-integration-grid">
          ${(state.data.integrations || []).map((integration) => `
            <article class="pui-repeated-card">
              <div class="pui-card-head"><strong>${escapeHtml(integration.name)}</strong>${statusPill(integration.readiness)}</div>
              <dl class="pui-dl">
                <div><dt>Account</dt><dd>${escapeHtml(integration.account)}</dd></div>
                <div><dt>Scopes</dt><dd>${escapeHtml((integration.scopes || []).join(', '))}</dd></div>
                <div><dt>Last check</dt><dd>${escapeHtml(integration.last_check)}</dd></div>
                <div><dt>Secret</dt><dd>${escapeHtml(redacted(integration.secret))}</dd></div>
              </dl>
              <button type="button" class="pui-button" data-action="test-integration" data-provider="${escapeHtml(integration.id)}">Test Connection</button>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderSettings(state, fixtures) {
    const visibility = state.shell.activeWorkspace?.module_visibility || {};
    return `
      <section class="pui-view" aria-labelledby="pui-view-title">
        <div class="pui-view-head"><div><p class="pui-kicker">System</p><h1 id="pui-view-title">Settings</h1></div></div>
        <div class="pui-settings-grid">
          <section>
            <h2>Brand</h2>
            <div class="pui-token-row"><span>Accent</span><i style="background:${escapeHtml(state.shell.brand.accent)}"></i><strong>${escapeHtml(state.shell.brand.accent)}</strong></div>
            <div class="pui-token-row"><span>Secondary</span><i style="background:${escapeHtml(state.shell.brand.accent_2)}"></i><strong>${escapeHtml(state.shell.brand.accent_2)}</strong></div>
            <div class="pui-token-row"><span>Shell</span><i style="background:${escapeHtml(state.shell.brand.shell)}"></i><strong>${escapeHtml(state.shell.brand.shell)}</strong></div>
          </section>
          <section>
            <h2>Module visibility</h2>
            ${Object.entries(visibility).map(([key, value]) => `
              <label class="pui-toggle"><input type="checkbox" ${value ? 'checked' : ''} disabled><span>${escapeHtml(moduleDefinition(fixtures, key)?.label || key)}</span></label>
            `).join('')}
          </section>
        </div>
      </section>
    `;
  }

  function renderActiveModule(state, fixtures) {
    switch (state.activeModule) {
      case 'overview': return renderOverview(state, fixtures);
      case 'members': return renderPeople(state, 'members');
      case 'students': return renderPeople(state, 'students');
      case 'service_providers': return renderPeople(state, 'service_providers');
      case 'community': return renderCommunity(state);
      case 'courses': return renderCourses(state, 'list');
      case 'course_builder': return renderCourses(state, 'builder');
      case 'lesson_video': return renderCourses(state, 'video');
      case 'tasks': return renderTasksOrDecisions(state, 'tasks');
      case 'decisions': return renderTasksOrDecisions(state, 'decisions');
      case 'integrations': return renderIntegrations(state);
      case 'settings': return renderSettings(state, fixtures);
      default: return renderSimpleCollection(state, fixtures, state.activeModule);
    }
  }

  function inputField(id, label, value = '', type = 'text') {
    return `<label><span>${escapeHtml(label)}</span><input id="${escapeHtml(id)}" name="${escapeHtml(id)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}"></label>`;
  }

  function selectField(id, label, options, selected = '') {
    return `<label><span>${escapeHtml(label)}</span><select id="${escapeHtml(id)}" name="${escapeHtml(id)}">${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(selected) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>`;
  }

  function renderDialog(state) {
    if (!state.dialog) return '';
    const errors = state.validationErrors || {};
    const errorList = Object.values(errors).length
      ? `<div class="pui-form-error" role="alert">${Object.values(errors).map(escapeHtml).join('. ')}</div>`
      : '';
    const course = selectedCourse(state);
    const lessonOptions = (course?.lessons || []).map((lesson) => ({ value: lesson.id, label: lesson.title }));
    const assetOptions = ((global.PlatformUiFixtures || {}).videoAssets || []).map((asset) => ({ value: asset.id, label: `${asset.title} / ${asset.provider}` }));
    const rewardOptions = (state.data.rewards || []).map((reward) => ({ value: reward.id, label: reward.name }));
    const forms = {
      member: `
        <h2 id="pui-dialog-title">Add member or student</h2>
        ${inputField('name', 'Name')}
        ${selectField('role', 'Role/type', [{ value: 'Member', label: 'Member' }, { value: 'Student', label: 'Student' }, { value: 'Guardian', label: 'Guardian' }, { value: 'Provider', label: 'Provider' }, { value: 'Admin', label: 'Admin' }])}
        ${inputField('email', 'Email', '', 'email')}
        ${selectField('workspace', 'Workspace', [{ value: state.shell.activeWorkspace.slug, label: state.shell.activeWorkspace.name }])}
        ${selectField('access', 'Invitation/access', [{ value: 'invited', label: 'Invite by email' }, { value: 'manual_review', label: 'Manual review' }])}
      `,
      community: `
        <h2 id="pui-dialog-title">Add community</h2>
        ${inputField('name', 'Name')}
        <label><span>Description</span><textarea id="description" name="description" rows="3"></textarea></label>
        ${selectField('visibility', 'Visibility', [{ value: 'Members only', label: 'Members only' }, { value: 'Private parents', label: 'Private parents' }, { value: 'Admin preview', label: 'Admin preview' }])}
        ${selectField('owner', 'Owner/admin', [{ value: 'Shloimie', label: 'Shloimie' }, { value: 'Rabbi Elie Scheller', label: 'Rabbi Elie Scheller' }, { value: 'BNA Admin', label: 'BNA Admin' }])}
        ${inputField('groups', 'Groups/channels', '1', 'number')}
      `,
      course: `
        <h2 id="pui-dialog-title">Add course</h2>
        ${inputField('title', 'Title')}
        <label><span>Description</span><textarea id="description" name="description" rows="3"></textarea></label>
        ${selectField('visibility', 'Visibility', [{ value: 'BNA students', label: 'BNA students' }, { value: 'Library and live members', label: 'Library and live members' }, { value: 'Admin preview', label: 'Admin preview' }])}
        ${selectField('status', 'Status', [{ value: 'draft', label: 'Draft' }, { value: 'review', label: 'Review' }, { value: 'published', label: 'Published' }])}
        ${selectField('enrollment_rule', 'Enrollment rule', [{ value: 'Admin assigned', label: 'Admin assigned' }, { value: 'Paid or manually granted access', label: 'Paid or manually granted access' }, { value: 'Open inside workspace', label: 'Open inside workspace' }])}
      `,
      video: `
        <h2 id="pui-dialog-title">Attach video</h2>
        ${selectField('lesson_id', 'Lesson', lessonOptions)}
        ${selectField('video_asset_id', 'Approved asset', assetOptions)}
        ${selectField('visibility', 'Privacy/visibility', [{ value: state.shell.activeWorkspace.name, label: state.shell.activeWorkspace.name }, { value: 'Admin preview', label: 'Admin preview' }])}
        ${selectField('transcript', 'Transcript link', [{ value: 'linked', label: 'Linked' }, { value: 'not linked', label: 'Not linked' }])}
      `,
      reward: `
        <h2 id="pui-dialog-title">Assign reward</h2>
        ${selectField('reward_id', 'Reward', rewardOptions)}
        ${inputField('assigned', 'Student/group assignment')}
        ${selectField('state', 'State', [{ value: 'assigned', label: 'Assigned' }, { value: 'awarded', label: 'Awarded' }, { value: 'redeemed', label: 'Redeemed' }])}
      `,
    };
    return `
      <div class="pui-dialog-backdrop" data-action="close-dialog">
        <section class="pui-dialog" role="dialog" aria-modal="true" aria-labelledby="pui-dialog-title" data-dialog-panel>
          <form data-platform-form="${escapeHtml(state.dialog)}">
            ${errorList}
            ${forms[state.dialog] || ''}
            <div class="pui-dialog-actions">
              <button type="button" class="pui-button" data-action="close-dialog">Cancel</button>
              <button type="submit" class="pui-button pui-button-primary">Save</button>
            </div>
          </form>
        </section>
      </div>
    `;
  }

  function renderEventLog(state) {
    return `
      <aside class="pui-event-log" aria-label="Recent UI events">
        <h2>Recent Activity</h2>
        ${(state.eventLog || []).length ? state.eventLog.map((event) => `
          <article><strong>${escapeHtml(event.type)}</strong><span>${escapeHtml(event.workspace)} / ${escapeHtml(event.payload?.moduleKey || event.payload?.workspaceId || event.payload?.provider || event.payload?.id || '')}</span></article>
        `).join('') : '<span class="pui-muted">No local events yet</span>'}
      </aside>
    `;
  }

  function renderApp(state, fixtures) {
    const brand = state.shell.brand || {};
    const activeModule = moduleDefinition(fixtures, state.activeModule);
    return `
      <div class="pui-shell" style="--pui-brand-accent:${escapeHtml(brand.accent)};--pui-brand-accent-2:${escapeHtml(brand.accent_2)};--pui-brand-shell:${escapeHtml(brand.shell)};">
        ${renderTopbar(state, fixtures)}
        <div class="pui-body">
          ${renderRail(state, fixtures)}
          <main class="pui-main" data-active-module="${escapeHtml(state.activeModule)}">
            <div class="pui-context-strip">
              <span>${escapeHtml(state.shell.activeInstance.name)}</span>
              <span>${escapeHtml(state.shell.activeWorkspace.slug)}</span>
              <span>${escapeHtml(activeModule?.group || '')}</span>
            </div>
            ${renderActiveModule(state, fixtures)}
          </main>
          ${renderEventLog(state)}
        </div>
        ${renderDialog(state)}
        ${state.toast ? `<div class="pui-toast" role="status">${escapeHtml(state.toast)}</div>` : ''}
      </div>
    `;
  }

  function formValues(form) {
    return Array.from(new FormData(form).entries()).reduce((acc, [key, value]) => {
      acc[key] = String(value || '').trim();
      return acc;
    }, {});
  }

  function createController(root, fixtures, options = {}) {
    let state = createInitialState(fixtures, options);

    function rerender() {
      root.innerHTML = renderApp(state, fixtures);
      const dialog = root.querySelector('.pui-dialog input, .pui-dialog select, .pui-dialog textarea');
      if (dialog) dialog.focus();
    }

    function update(mutator) {
      state = mutator(state) || state;
      rerender();
    }

    root.addEventListener('click', (event) => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === 'close-dialog') {
        const insidePanel = event.target.closest('[data-dialog-panel]');
        if (insidePanel && actionEl.classList.contains('pui-dialog-backdrop')) return;
        update((draft) => {
          draft.dialog = null;
          draft.validationErrors = {};
          return draft;
        });
      }
      if (action === 'workspace') update((draft) => switchWorkspace(draft, fixtures, actionEl.dataset.workspace));
      if (action === 'module') update((draft) => switchModule(draft, fixtures, actionEl.dataset.module));
      if (action === 'dialog') update((draft) => {
        draft.dialog = actionEl.dataset.dialog;
        draft.validationErrors = {};
        return draft;
      });
      if (action === 'course') update((draft) => {
        draft.selectedCourseId = actionEl.dataset.course;
        recordEvent(draft, 'ui.course.opened', { courseId: actionEl.dataset.course });
        draft.activeModule = 'course_builder';
        return draft;
      });
      if (action === 'provider') update((draft) => {
        recordEvent(draft, 'ui.provider.opened', { providerId: actionEl.dataset.provider });
        draft.toast = 'Provider opened in local fixture';
        return draft;
      });
      if (action === 'test-integration') update((draft) => testIntegration(draft, actionEl.dataset.provider));
    });

    root.addEventListener('input', (event) => {
      if (event.target?.dataset?.action === 'search') {
        update((draft) => {
          draft.search = event.target.value;
          return draft;
        });
      }
    });

    root.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-platform-form]');
      if (!form) return;
      event.preventDefault();
      const type = form.dataset.platformForm;
      const values = formValues(form);
      update((draft) => {
        if (type === 'member') return submitMember(draft, values);
        if (type === 'community') return submitCommunity(draft, values);
        if (type === 'course') return submitCourse(draft, values);
        if (type === 'video') return submitVideoAttachment(draft, values, fixtures.videoAssets);
        if (type === 'reward') return submitRewardAssignment(draft, values);
        return draft;
      });
    });

    rerender();
    return {
      getState: () => clone(state),
      setState(next) {
        state = clone(next);
        rerender();
      },
      dispatch(action) {
        update((draft) => {
          if (action.type === 'workspace') return switchWorkspace(draft, fixtures, action.workspaceId);
          if (action.type === 'module') return switchModule(draft, fixtures, action.moduleKey);
          return draft;
        });
      },
    };
  }

  function init(selector = '[data-platform-ui-root]', options = {}) {
    const fixtures = options.fixtures || global.PlatformUiFixtures;
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root || !fixtures) return null;
    return createController(root, fixtures, options);
  }

  const api = {
    EVENT_NAMES,
    INTEGRATION_ENDPOINTS,
    createInitialState,
    visibleModuleDefinitions,
    deriveModuleCards,
    validateMember,
    validateCommunity,
    validateCourse,
    validateVideoAttachment,
    validateRewardAssignment,
    submitMember,
    submitCommunity,
    submitCourse,
    submitVideoAttachment,
    submitRewardAssignment,
    testIntegration,
    renderApp,
    init,
    redacted,
  };

  global.PlatformUi = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
