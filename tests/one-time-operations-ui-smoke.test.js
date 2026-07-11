const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = process.env.BNA_ONE_TIME_OPERATIONS_UI_SMOKE_DIR
  ? path.resolve(process.env.BNA_ONE_TIME_OPERATIONS_UI_SMOKE_DIR)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'bna-one-time-operations-ui-smoke-'));
const operationsHtmlPath = path.join(root, 'public', 'operations.html');

const ownerAllowedViews = [
  'contacts',
  'community',
  'content',
  'live_classes',
  'calendar',
  'service_providers',
  'communications',
  'automations',
  'tasks',
  'api_usage',
  'integrations',
  'settings',
];

const oneTimeProject = {
  id: 7,
  project_key: 'one_time_mishnah_class',
  name: 'One Time Mishnah Class',
  short_name: 'One Time',
};

const workspaceCategories = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    workspaces: [
      {
        workspace_key: 'platform',
        name: 'Platform Operations',
        workspace_type: 'super_admin',
        display_category: 'super_admin',
        description: 'Global platform workspace',
      },
    ],
  },
  {
    id: 'school',
    label: 'School',
    workspaces: [
      {
        workspace_key: 'bna',
        name: 'Bnei Neviim Academy',
        workspace_type: 'school',
        display_category: 'school',
        project_key: 'bna',
      },
    ],
  },
  {
    id: 'service_provider',
    label: 'Service Provider',
    workspaces: [
      {
        workspace_key: 'rabbi_sheller_provider',
        name: 'One Time Mishnah Class',
        workspace_type: 'service_provider',
        display_category: 'service_provider',
        project_key: 'one_time_mishnah_class',
        description: 'Rabbi Elie Scheller One Time workspace',
        role: 'project_owner',
      },
    ],
  },
  {
    id: 'family',
    label: 'Family',
    workspaces: [
      {
        workspace_key: 'dratler_family',
        name: 'Dratler Family',
        workspace_type: 'family',
        display_category: 'family',
        project_key: 'family_legacy',
      },
    ],
  },
];

const people = [
  {
    id: 1,
    full_name: 'Rabbi Elie Scheller',
    display_name: 'Rabbi Elie Scheller',
    role: 'project_owner',
    account_type: 'external_user',
    access_level: 'owner',
    project_key: 'one_time_mishnah_class',
    workspace_key: 'rabbi_sheller_provider',
  },
  {
    id: 2,
    full_name: 'Shloimie',
    display_name: 'Shloimie',
    role: 'project_manager',
    account_type: 'internal_admin',
    access_level: 'manager',
    project_key: 'one_time_mishnah_class',
    workspace_key: 'rabbi_sheller_provider',
  },
];

const tasks = [
  {
    id: 205,
    title: 'Complete One Time Operations UI',
    display_title: 'Complete One Time Operations UI',
    project_key: 'one_time_mishnah_class',
    project_name: 'One Time Mishnah Class',
    stage: 'tasks',
    item_type: 'task',
    status: 'running',
    urgency: 'today',
    agent_status: 'running',
    active_agent_run_id: 9105,
    assigned_to: 'Codex',
    notes: 'Scoped UI smoke covers One Time modules, buttons, and no-write preview actions.',
    created_at: '2026-06-19T09:00:00.000Z',
    updated_at: '2026-06-19T09:30:00.000Z',
  },
  {
    id: 207,
    title: 'Prepare Vimeo Zoom and Resend credentials',
    display_title: 'Prepare Vimeo Zoom and Resend credentials',
    project_key: 'one_time_mishnah_class',
    project_name: 'One Time Mishnah Class',
    stage: 'pending',
    item_type: 'task',
    status: 'blocked',
    urgency: 'normal',
    agent_status: 'blocked_needs_human_decision',
    waiting_on: 'owner credentials',
    notes: 'Credential-free integration UI is ready; live provider setup waits for owner-only account actions.',
    created_at: '2026-06-19T09:05:00.000Z',
    updated_at: '2026-06-19T09:25:00.000Z',
  },
];

const contentJobs = [
  {
    id: 501,
    project_key: 'one_time_mishnah_class',
    title: 'Rabbi Elie Scheller One Time Meeting',
    source_type: 'drive',
    media_type: 'audio',
    media_url: 'https://example.test/one-time-meeting.mp3',
    caption: 'Drive meeting note for Rabbi Elie and Shloimie.',
    transcript_text: 'Rabbi Elie Scheller One Time Mishnah meeting about membership, calendar, community, content, and integrations.',
    status: 'transcribed',
    uploaded_at: '2026-06-19T07:00:00.000Z',
    created_at: '2026-06-19T07:00:00.000Z',
  },
];

const projectMeetings = [
  {
    id: 301,
    project_key: 'one_time_mishnah_class',
    content_job_id: 501,
    meeting_type: 'rabbi_one_time',
    title: 'Rabbi Elie / One Time Decisions',
    summary: 'Scoped meeting summary with decisions, tasks, calendar, and integrations.',
    status: 'structured',
    extracted_task_ids: [205, 207],
    updated_at: '2026-06-19T08:00:00.000Z',
    content_job: contentJobs[0],
  },
];

const integrationCards = [
  {
    provider: 'vimeo',
    label: 'Vimeo',
    configured: false,
    status: 'missing_credentials',
    mode: 'owner_access_required',
    blockers: ['Vimeo owner token is not configured.'],
    blockedActions: ['upload', 'publish'],
    safeActions: ['readiness_check'],
  },
  {
    provider: 'zoom',
    label: 'Zoom',
    configured: false,
    status: 'missing_credentials',
    mode: 'server_to_server_oauth',
    blockers: ['Zoom account owner/admin action is required.'],
    blockedActions: ['meeting_create', 'send_links'],
    safeActions: ['readiness_check'],
  },
  {
    provider: 'resend',
    label: 'Resend',
    configured: false,
    status: 'dns_needed',
    mode: 'draft_preview_only',
    blockers: ['Resend DNS/domain verification is not complete.'],
    blockedActions: ['send_email'],
    safeActions: ['draft_preview'],
  },
];

const oneTimeProductSystem = {
  planning_tiers: [
    {
      tier_key: 'library_live_low_touch',
      display_name: 'Library + Live',
      description: 'Draft membership tier for review.',
      price_status: 'decision_pending',
      candidate_pricing: { currency: 'USD', candidates: [9, 30], preferred: 30 },
    },
  ],
  decisions: [
    {
      decision_key: 'DEC-ONE-TIME-CREDENTIALS',
      title: 'Approve provider credential owners',
      question: 'Who should complete Vimeo, Zoom, and Resend owner actions?',
      status: 'needs_owner',
      needed_from: 'Rabbi Elie Scheller',
    },
  ],
  funnels: [{ region: 'us', route_path: '/one-time/us', status: 'draft', noindex: true }],
  leads: [{ parent_name: 'One Time Member', region: 'us', status: 'new', interested_tiers: ['library'] }],
  calendar: { events: [{ title: '7:00 Mishnah Class', start_at: '2026-06-21T16:00:00.000Z' }] },
  source_prep_jobs: [{ title: 'Source sheet draft', status: 'draft' }],
};

function json(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function serveStatic(res, requestPath) {
  const publicRoot = path.join(root, 'public');
  const filePath = path.normalize(path.join(publicRoot, requestPath.replace(/^\/+/, '')));
  if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.html': 'text/html',
  }[ext] || 'text/plain';
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fs.readFileSync(filePath));
  return true;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function defaultApiPayload(pathname) {
  if (pathname === '/api/bna/auth/me') {
    return {
      authenticated: true,
      username: 'rabbi-owner@example.test',
      role: 'project_owner',
      displayName: 'Rabbi Elie Scheller',
      allowedViews: ownerAllowedViews,
      scope: { type: 'project', projectKey: 'one_time_mishnah_class' },
    };
  }
  if (pathname === '/api/bna/workspace-directory') return { categories: workspaceCategories, review_items: [] };
  if (pathname === '/api/bna/workspace-platform') {
    return {
      workspaces: workspaceCategories.flatMap((category) => category.workspaces),
      connector_settings: integrationCards.map((card) => ({
        connector_type: card.provider === 'vimeo' ? 'video_library' : card.provider,
        display_name: card.label,
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
        status: card.status,
      })),
      bot_actions: [],
      bot_action_logs: [],
    };
  }
  if (/^\/api\/bna\/workspace-settings\/[^/]+\/branding$/.test(pathname)) {
    return {
      workspace_key: 'rabbi_sheller_provider',
      workspace_name_override: 'One Time Mishnah Class',
      logo_url: '/icons/operations-icon.svg',
    };
  }
  if (pathname === '/api/bna/projects') return { projects: [oneTimeProject] };
  if (pathname === '/api/bna/people') return { people };
  if (pathname === '/api/bna/tasks') return { tasks };
  if (pathname === '/api/bna/agent-fleet/status') {
    return {
      queue: { pending: 1, in_progress: 1, urgent_today: 1, latest_task: { title: 'Complete One Time Operations UI' } },
      fleet: { status: 'running', stale: false, last_seen_at: '2026-06-19T09:45:00.000Z' },
    };
  }
  if (pathname === '/api/bna/content-jobs') return { jobs: contentJobs };
  if (pathname === '/api/bna/class-sessions') return { sessions: [{ id: 41, project_key: 'one_time_mishnah_class', title: 'Mishnah Class', status: 'scheduled' }] };
  if (pathname === '/api/bna/project-meetings') return { meetings: projectMeetings };
  if (pathname === '/api/bna/one-time/classes') return { classes: [{ id: 1, title: 'Mishnah Aleph', status: 'draft' }] };
  if (pathname === '/api/bna/one-time/classroom') return { classroom: { assignments: [], threads: [], held_responses: [] } };
  if (pathname === '/api/bna/one-time/question-moderation') return { reviews: [], summary: { pending: 0 } };
  if (pathname === '/api/bna/members') return { members: [{ id: 1, display_name: 'One Time Member', access_tier: 'library_only', access_status: 'active' }] };
  if (pathname === '/api/bna/live-sessions') return { sessions: [{ id: 1, title: '7:00 Mishnah Class', start_at: '2026-06-21T16:00:00.000Z', status: 'scheduled', required_tier: 'live_plus_library' }] };
  if (pathname === '/api/bna/courses') return { courses: [{ id: 1, title: 'One Time Mishnah Community', project_key: 'one_time_mishnah_class', status: 'active' }] };
  if (pathname === '/api/bna/worksheets') return { worksheets: [{ id: 1, title: 'Mishnah Review', status: 'draft' }] };
  if (pathname === '/api/bna/course-questions') return { questions: [{ id: 1, title: 'Tonight question', prompt: 'What did we learn?', approval_status: 'pending' }] };
  if (pathname === '/api/bna/gamification-events') return { events: [] };
  if (pathname === '/api/bna/shoutouts') return { shoutouts: [] };
  if (pathname === '/api/bna/calendar-events') return { events: [{ id: 1, title: '7:00 Mishnah Class', workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class', start_at: '2026-06-21T16:00:00.000Z' }] };
  if (pathname === '/api/bna/pipeline-cards') return { cards: [] };
  if (pathname === '/api/bna/internal-dialogue') return { threads: [], messages: [] };
  if (pathname === '/api/bna/service-providers') return { providers: [{ id: 1, provider_name: 'Rabbi Elie Scheller', contact_name: 'Rabbi Elie Scheller', status: 'review', provider_status: 'review', services: [{ service_title: 'One Time Mishnah Class' }] }] };
  if (pathname === '/api/bna/contact-communications') return { communications: [] };
  if (pathname === '/api/bna/parent-leads') return { leads: [] };
  if (pathname === '/api/bna/signups') return { signups: [] };
  if (pathname === '/api/bna/payments') return { payments: [] };
  if (pathname === '/api/bna/payment-intake') return { intake: [] };
  if (pathname === '/api/bna/payment-reminders/due') return { found: 0, recipients: [] };
  if (pathname === '/api/bna/parent-announcements') return { announcements: [] };
  if (pathname === '/api/bna/support-tickets') return { tickets: [] };
  if (pathname === '/api/bna/notifications') return { notifications: [], summary: { unread: 0 } };
  if (pathname === '/api/bna/notification-preferences') return { preferences: [] };
  if (pathname === '/api/bna/automations') return { automations: [], filters: {} };
  if (pathname === '/api/bna/integrations/status') return { success: true, generated_at: '2026-06-19T09:45:00.000Z', cards: integrationCards };
  if (pathname === '/api/bna/integrations/google/status') return { configured: false, status: 'not_configured', blockers: ['Google OAuth is not configured.'] };
  if (pathname === '/api/bna/communications/social/drafts') return { drafts: [] };
  if (pathname === '/api/bna/communications/email/drafts') return { drafts: [] };
  if (pathname === '/api/bna/communications/dns-tasks') return { tasks: [] };
  if (pathname === '/api/bna/integrations/buffer/health') return { configured: false, status: 'not_configured' };
  if (pathname === '/api/bna/integrations/buffer/channels') return { channels: [] };
  if (pathname === '/api/bna/integrations/resend/health') return { configured: false, status: 'not_configured' };
  if (pathname === '/api/bna/integrations/resend/domains') return { domains: [] };
  if (pathname === '/api/bna/one-time/product-system') return oneTimeProductSystem;
  if (pathname === '/api/bna/one-time/calendar') return { events: oneTimeProductSystem.calendar.events };
  if (pathname === '/api/bna/product-leads') return { leads: oneTimeProductSystem.leads };
  if (pathname === '/api/bna/one-time/app-access-readiness') return { ready_for_member_library_publish: false, blockers: integrationCards.flatMap((card) => card.blockers) };
  if (pathname === '/api/bna/one-time/drive-social-ingestion') return { folders: [], social_platforms: [] };
  if (pathname.startsWith('/api/bna/rabbi/')) {
    return {
      config: { site: { title: 'One Time Mishnah Class' } },
      tiers: [],
      provider_settings: [],
      checkouts: [],
      members: [],
      access_grants: [],
      library_items: [],
      live_sessions: [],
      communications: [],
      site: { title: 'One Time Mishnah Class' },
    };
  }
  return {};
}

function previewPayload(body) {
  return {
    dry_run: true,
    external_write_performed: false,
    parser_version: 'one-time-drive-brief-preview-smoke',
    source: {
      title: 'Rabbi Elie Scheller / One Time latest Drive brief',
      source_type: 'drive',
      drive_file_id: 'drive-file-redacted',
    },
    routing: {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      requested_workspace_key: body.workspace_key,
    },
    counts: {
      decisions: 2,
      tasks: 4,
      calendar_events: 1,
      content_items: 3,
      community_records: 2,
      integration_items: 3,
      notes: 2,
    },
    owner_assignments: [
      {
        person_name: 'Rabbi Elie Scheller',
        role: 'Owner',
        access_level: 'project_owner',
        workspace_key: 'rabbi_sheller_provider',
      },
      {
        person_name: 'Shloimie',
        role: 'Admin',
        access_level: 'project_manager',
        workspace_key: 'rabbi_sheller_provider',
      },
    ],
    idempotency: {
      duplicate_policy: 'Match by source key and record key; preview does not write.',
    },
    acceptance: {
      no_secrets_in_output: true,
    },
    blockers: [
      {
        owner: 'Rabbi Elie Scheller',
        title: 'Confirm Vimeo owner token path',
        due_date: 'owner action',
        blocked_actions: ['video upload', 'library publish'],
      },
      {
        owner: 'Shloimie',
        title: 'Approve Resend sender/domain setup',
        due_date: 'operator decision',
        blocked_actions: ['email send'],
      },
    ],
  };
}

test('One Time Operations UI exposes scoped owner modules, integrations, and no-write Drive preview', async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const previewRequests = [];
  let activePort = 0;
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    if (url.pathname === '/operations') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(operationsHtmlPath));
      return;
    }
    if (url.pathname === '/api/bna/project-meetings/one-time-drive-brief/preview') {
      const body = await readBody(req);
      previewRequests.push({ method: req.method, body });
      return json(res, previewPayload(body));
    }
    if (url.pathname.startsWith('/api/bna/')) {
      return json(res, defaultApiPayload(url.pathname));
    }
    if (serveStatic(res, url.pathname)) return;
    res.writeHead(404);
    res.end('not found');
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  activePort = server.address().port;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  try {
    await page.goto(`http://127.0.0.1:${activePort}/operations?workspace=rabbi_sheller_provider&view=content&section=meetings&nav=modules`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-top-filter-rail][data-current-module="content"]', { timeout: 15000 });
    await page.waitForSelector('[data-preview-one-time-drive-brief]', { timeout: 15000 });

    const initialContract = await page.evaluate(() => {
      const navItems = window.workspaceNavItems().map((item) => ({
        id: item.id,
        label: item.label,
        navKey: item.navKey || item.id,
        section: item.section || '',
      }));
      const filterIds = Array.from(document.querySelectorAll('[data-top-filter-id]')).map((item) => item.getAttribute('data-top-filter-id'));
      const sidebarLabels = Array.from(document.querySelectorAll('.ops-sidebar-button')).map((item) => item.textContent.trim().replace(/\s+/g, ' '));
      const sidebarSectionLabels = Array.from(document.querySelectorAll('.ops-nested-subnav .ops-nested-button')).map((item) => item.textContent.trim().replace(/\s+/g, ' '));
      const footerLabels = Array.from(document.querySelectorAll('.ops-sidebar-footer .ops-sidebar-mini')).map((item) => item.textContent.trim().replace(/\s+/g, ' '));
      const workspaceOptions = Array.from(document.querySelectorAll('[data-workspace-option]')).map((button) => ({
        label: button.textContent.trim().replace(/\s+/g, ' '),
        disabled: button.getAttribute('aria-disabled') === 'true',
        current: button.getAttribute('aria-current') === 'true',
      }));
      const workspaceSummary = document.querySelector('[data-one-time-workspace-summary]')?.textContent.trim().replace(/\s+/g, ' ') || '';
      return {
        currentWorkspace: window.currentWorkspaceKey(),
        roleLabel: window.currentWorkspaceRoleLabel(),
        navIds: navItems.map((item) => item.id),
        navKeys: navItems.map((item) => item.navKey),
        navLabels: navItems.map((item) => item.label),
        navSections: navItems.map((item) => item.section),
        filterIds,
        sidebarLabels,
        sidebarSectionLabels,
        footerLabels,
        workspaceOptions,
        workspaceSummary,
        hasStudentsText: navItems.some((item) => item.id === 'students'),
        hasAccountingText: navItems.some((item) => item.id === 'accounting'),
        driveButton: Boolean(document.querySelector('[data-preview-one-time-drive-brief]')),
        topRailModule: document.querySelector('[data-top-filter-rail]')?.getAttribute('data-current-module') || '',
        hasModuleToolbar: Boolean(document.querySelector('[data-module-toolbar-id]')),
      };
    });

    assert.equal(initialContract.currentWorkspace, 'rabbi_sheller_provider');
    assert.equal(initialContract.roleLabel, 'Workspace Owner');
    assert.deepEqual(initialContract.navLabels, ['Overview', 'Members', 'Content', 'Live', 'Schedule', 'Community', 'Comms', 'Auto', 'Payments', 'Tasks', 'Reports', 'Connectors', 'Setup']);
    assert.deepEqual(initialContract.navKeys, ['overview_package_status', 'members_crm', 'classes_content', 'live_class_schedule', 'program_schedule', 'community_questions', 'communications', 'automations', 'payments_access', 'tasks_decisions', 'reporting_readiness', 'connector_setup', 'settings_setup']);
    for (const expected of ['service_providers', 'contacts', 'content', 'live_classes', 'calendar', 'community', 'communications', 'automations', 'tasks', 'api_usage', 'integrations', 'settings']) {
      assert.ok(initialContract.navIds.includes(expected), `missing Rabbi-facing nav item ${expected}`);
    }
    for (const hidden of ['dashboard', 'watchdog', 'agents', 'pipelines', 'internal_dialogue', 'platform_suite', 'admin', 'accounting', 'students', 'studio']) {
      assert.equal(initialContract.navIds.includes(hidden), false, `raw support nav item should be demoted: ${hidden}`);
    }
    assert.equal(initialContract.hasStudentsText, false);
    assert.equal(initialContract.hasAccountingText, false);
    assert.equal(initialContract.topRailModule, 'content');
    assert.equal(initialContract.hasModuleToolbar, false);
    assert.deepEqual(initialContract.filterIds, ['library', 'meeting_drops', 'source_prep', 'bundles']);
    assert.equal(initialContract.footerLabels.some((label) => /Platform Support/.test(label)), false);
    assert.ok(initialContract.sidebarLabels.some((label) => /Payments/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Tasks/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Content/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Live/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Schedule/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Community/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Reports/.test(label)));
    assert.ok(initialContract.sidebarLabels.some((label) => /Connectors/.test(label)));
    assert.ok(initialContract.sidebarSectionLabels.some((label) => /^Library/.test(label)));
    assert.ok(initialContract.sidebarSectionLabels.some((label) => /Meeting Drops/.test(label)));
    assert.ok(initialContract.sidebarSectionLabels.some((label) => /Source Prep/.test(label)));
    assert.equal(initialContract.sidebarSectionLabels.some((label) => /Selected|Repurpose|Newsletter|Prompts/.test(label)), false);
    assert.equal(initialContract.sidebarLabels.some((label) => /Agents|Watchdog|Team|Accounting|Students/.test(label)), false);
    assert.equal(initialContract.workspaceOptions.length, 0);
    assert.match(initialContract.workspaceSummary, /One Time Mishnah Class/);
    assert.doesNotMatch(initialContract.workspaceSummary, /Bnei Neviim|Dratler|Super Admin|School|Family/);
    assert.equal(initialContract.driveButton, true);

    await page.goto(`http://127.0.0.1:${activePort}/operations?view=dashboard&section=overview&workspace=rabbi_sheller_provider`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-one-time-rabbi-dashboard][data-one-time-program-route="overview"]', { timeout: 15000 });
    const dashboardContract = await page.evaluate(() => ({
      currentView: document.querySelector('[data-top-filter-rail]')?.getAttribute('data-current-module') || '',
      currentSection: window.currentSectionId(),
      visibleText: document.body.innerText.replace(/\s+/g, ' ').trim(),
      activeSidebar: Array.from(document.querySelectorAll('.ops-sidebar-button.active')).map((item) => item.textContent.trim().replace(/\s+/g, ' ')),
      topbarChips: Array.from(document.querySelectorAll('.ops-topbar-status .ops-brand-chip')).map((item) => item.textContent.trim().replace(/\s+/g, ' ')),
      hasWorkspaceDirectoryOptions: Boolean(document.querySelector('[data-workspace-option]')),
    }));
    assert.equal(dashboardContract.currentView, 'service_providers');
    assert.equal(dashboardContract.currentSection, 'overview');
    assert.ok(dashboardContract.activeSidebar.some((label) => /Overview/.test(label)), 'dashboard route should highlight One Time Overview');
    assert.deepEqual(dashboardContract.topbarChips.map((label) => label.replace(/\d+/g, '').trim()), ['CRM', 'Classes', 'Setup']);
    assert.equal(dashboardContract.hasWorkspaceDirectoryOptions, false);
    assert.doesNotMatch(dashboardContract.visibleText, /Codex Queue|Student accountability|Daily Command Center|Tablet Access|Workspace Directory|Super Admin|Bnei Neviim Academy|Dratler Family/);
    assert.match(dashboardContract.visibleText, /Program Overview/);
    assert.match(dashboardContract.visibleText, /Communications|Setup|One Time Mishnah Class/);

    await page.locator('[data-sidebar-nav-key="payments_access"]').click();
    await page.waitForSelector('[data-top-filter-rail][data-current-module="service_providers"] [data-top-filter-id="trial_offer"].active', { timeout: 10000 });
    const paymentNavContract = await page.evaluate(() => ({
      currentView: document.querySelector('[data-top-filter-rail]')?.getAttribute('data-current-module') || '',
      section: window.currentSectionId(),
      railText: document.querySelector('[data-top-filter-rail]')?.textContent.replace(/\s+/g, ' ').trim() || '',
    }));
    assert.equal(paymentNavContract.currentView, 'service_providers');
    assert.equal(paymentNavContract.section, 'tiers');
    assert.match(paymentNavContract.railText, /Trial & Offer|Billing Readiness|Member Access/);

    await page.evaluate(() => {
      window.switchView('service_providers');
      window.setCurrentSection('content');
    });
    await page.waitForSelector('[data-one-time-rabbi-module="content-bridge"]', { timeout: 10000 });
    const contentBridgeContract = await page.evaluate(() => ({
      currentView: document.querySelector('[data-top-filter-rail]')?.getAttribute('data-current-module') || '',
      section: window.currentSectionId(),
      text: document.querySelector('[data-one-time-rabbi-module="content-bridge"]')?.textContent.replace(/\s+/g, ' ').trim() || '',
    }));
    assert.equal(contentBridgeContract.currentView, 'service_providers');
    assert.equal(contentBridgeContract.section, 'content');
    assert.match(contentBridgeContract.text, /Library|Meeting Drops|Source Prep|Bundles/);

    await page.evaluate(() => {
      window.switchView('content');
      window.setCurrentSection('meetings');
    });
    await page.waitForSelector('[data-top-filter-rail][data-current-module="content"] [data-top-filter-id="meeting_drops"].active', { timeout: 10000 });

    await page.getByRole('button', { name: 'Preview Drive Brief' }).click();
    await page.waitForSelector('[data-one-time-drive-brief-preview]', { timeout: 10000 });
    const previewContract = await page.locator('[data-one-time-drive-brief-preview]').evaluate((node) => node.textContent.replace(/\s+/g, ' ').trim());
    assert.match(previewContract, /No-write Drive Brief Preview/);
    assert.match(previewContract, /one_time_mishnah_class/);
    assert.match(previewContract, /rabbi_sheller_provider/);
    assert.match(previewContract, /production writes: no/);
    assert.match(previewContract, /Rabbi Elie Scheller/);
    assert.match(previewContract, /Shloimie/);
    assert.equal(previewRequests.length, 1);
    assert.equal(previewRequests[0].method, 'POST');
    assert.notEqual(previewRequests[0].body.workspace_key, 'bna');
    assert.notEqual(previewRequests[0].body.project_key, 'bna');

    const moduleChecks = [
      ['tasks', /Rabbi \/ One Time Dialogue|Complete One Time Operations UI/],
      ['community', /One Time Mishnah Community|One Time community overview/],
      ['content', /Rabbi Meeting Intake|Meeting Drops|One Time Library/],
      ['live_classes', /Live Classes|Program Schedule|7:00 Mishnah Class/],
      ['integrations', /Integrations|Google|Communications|Connectors/],
    ];

    for (const [name, expectedText] of moduleChecks) {
      await page.evaluate((view) => window.switchView(view), name);
      await page.waitForSelector(`[data-top-filter-rail][data-current-module="${name}"]`, { timeout: 10000 });
      await page.waitForFunction((patternSource) => new RegExp(patternSource).test(document.body.textContent), expectedText.source, { timeout: 10000 });
      const bodyText = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' ').trim());
      assert.match(bodyText, expectedText, `${name} rendered expected One Time text`);
    }

    await page.evaluate(() => {
      window.switchView('settings');
      window.setCurrentSection('users_access');
    });
    await page.waitForFunction(() => /Users|Access|Rabbi Elie|Shloimie|One Time/.test(document.body.textContent), null, { timeout: 10000 });

    await page.screenshot({ path: path.join(outDir, 'desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.evaluate(() => {
      window.switchView('content');
      window.setCurrentSection('one_time_library');
    });
    await page.waitForSelector('[data-top-filter-rail][data-current-module="content"] [data-top-filter-id="library"].active', { timeout: 10000 });
    const mobileMetrics = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasContentRail: Boolean(document.querySelector('[data-top-filter-rail][data-current-module="content"]')),
      hasHiddenSupportNav: Array.from(document.querySelectorAll('.ops-sidebar-button')).some((item) => /Agents|Watchdog|Studio/.test(item.textContent || '')),
      hasModuleToolbar: Boolean(document.querySelector('[data-module-toolbar-id]')),
    }));
    assert.equal(mobileMetrics.hasContentRail, true);
    assert.equal(mobileMetrics.hasHiddenSupportNav, false);
    assert.equal(mobileMetrics.hasModuleToolbar, false);
    assert.ok(mobileMetrics.scrollWidth <= mobileMetrics.width + 1, `mobile overflow ${mobileMetrics.scrollWidth} > ${mobileMetrics.width}`);
    await page.screenshot({ path: path.join(outDir, 'mobile-content.png'), fullPage: true });

    await page.evaluate(() => {
      window.switchView('content');
      window.setCurrentSection('one_time_library');
    });
    await page.waitForSelector('[data-top-filter-rail][data-current-module="content"] [data-top-filter-id="library"].active', { timeout: 10000 });
    const mobileContentRail = await page.evaluate(() => {
      const rail = document.querySelector('[data-top-filter-rail][data-current-module="content"]');
      const track = rail?.querySelector('.ops-filter-track');
      return {
        ids: Array.from(rail?.querySelectorAll('[data-top-filter-id]') || []).map((item) => item.getAttribute('data-top-filter-id')),
        overflowX: track ? getComputedStyle(track).overflowX : '',
        flexWrap: track ? getComputedStyle(track).flexWrap : '',
        hasMeta: Boolean(rail?.querySelector('.ops-filter-rail-meta') && getComputedStyle(rail.querySelector('.ops-filter-rail-meta')).display !== 'none'),
        pageWidth: document.documentElement.clientWidth,
        pageScrollWidth: document.documentElement.scrollWidth,
      };
    });
    assert.deepEqual(mobileContentRail.ids, ['library', 'meeting_drops', 'source_prep', 'bundles']);
    assert.equal(mobileContentRail.overflowX, 'auto');
    assert.equal(mobileContentRail.flexWrap, 'nowrap');
    assert.equal(mobileContentRail.hasMeta, false);
    assert.ok(mobileContentRail.pageScrollWidth <= mobileContentRail.pageWidth + 1, `mobile content overflow ${mobileContentRail.pageScrollWidth} > ${mobileContentRail.pageWidth}`);

    assert.deepEqual(consoleErrors, []);

    const redactedPreviewRequests = previewRequests.map((request) => ({
      method: request.method,
      redacted: true,
      body: {
        ...request.body,
        source: request.body?.source
          ? {
              ...request.body.source,
              drive_file_id: request.body.source.drive_file_id ? 'redacted' : request.body.source.drive_file_id,
              url: request.body.source.url ? 'redacted' : request.body.source.url,
            }
          : request.body?.source,
      },
    }));

    const report = {
      ok: true,
      target: '/operations?workspace=rabbi_sheller_provider&view=content&section=meetings&nav=modules',
      initialContract,
      paymentNavContract,
      contentBridgeContract,
      previewRequests: redactedPreviewRequests,
      mobileMetrics,
      mobileContentRail,
      screenshots: [
        path.relative(root, path.join(outDir, 'desktop.png')).replace(/\\/g, '/'),
        path.relative(root, path.join(outDir, 'mobile-content.png')).replace(/\\/g, '/'),
      ],
      guardrails: {
        productionWrites: false,
        secretsInFixture: false,
        productionDataMutation: false,
      },
    };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
    fs.writeFileSync(
      path.join(outDir, 'report.md'),
      `# One Time Operations UI Local Smoke\n\nPASS. Scoped One Time owner UI rendered the generated Rabbi-facing IA, hid internal support/Studio/Students/Accounting modules, opened the Payments side item directly to Access, clicked the no-write Drive Brief preview, and passed mobile/content rail overflow checks.\n\n- Desktop: ${report.screenshots[0]}\n- Mobile Content: ${report.screenshots[1]}\n- Production writes: no\n- Preview requests: ${previewRequests.length}\n`,
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
