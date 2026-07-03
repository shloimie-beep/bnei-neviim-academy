const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const operationsHtmlPath = path.join(publicRoot, 'operations.html');
const oneTimeHtmlPath = path.join(publicRoot, 'one-time', 'index.html');
const reportDir = path.join(root, 'ops', 'one-time-mishnah', 'operator-ui-review');
const reportPath = path.join(reportDir, 'qa-harness-local-report.json');

const REQUIRED_ROUTES = [
  '/one-time',
  '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
  '/provider.html?review=one-time',
  '/parent.html?review=one-time',
  '/student.html?review=one-time',
  '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
  '/one-time-email-review.html',
];

const FORBIDDEN_ONE_TIME_SCOPE_TEXT = [
  /Dratler/i,
  /Menachem/i,
  /Esther/i,
  /GoHighLevel/i,
  /LeadConnector/i,
  /family Supabase/i,
  /raw private message/i,
  /passwords?[:=]/i,
  /api[_-]?key/i,
];

const ownerAllowedViews = [
  'dashboard',
  'watchdog',
  'pipelines',
  'tasks',
  'agents',
  'contacts',
  'intake',
  'community',
  'content',
  'live_classes',
  'calendar',
  'service_providers',
  'communications',
  'internal_dialogue',
  'automations',
  'api_usage',
  'integrations',
  'settings',
];

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
];

const oneTimeProject = {
  id: 7,
  project_key: 'one_time_mishnah_class',
  name: 'One Time Mishnah Class',
  short_name: 'One Time',
};

const tasks = [
  {
    id: 205,
    title: 'Complete One Time Operations UI',
    display_title: 'Complete One Time Operations UI',
    project_key: 'one_time_mishnah_class',
    project_name: 'One Time Mishnah Class',
    workspace_key: 'rabbi_sheller_provider',
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
    workspace_key: 'rabbi_sheller_provider',
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
    workspace_key: 'rabbi_sheller_provider',
    title: 'Rabbi Elie Scheller One Time Meeting',
    source_type: 'drive',
    media_type: 'audio',
    media_url: 'https://example.test/one-time-meeting.mp3',
    caption: 'Drive meeting note for Rabbi Elie and One Time.',
    transcript_text: 'One Time Mishnah meeting about membership, calendar, community, content, and integrations.',
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
      candidate_pricing: { currency: 'USD', candidates: [67], preferred: 67 },
    },
  ],
  schedules: [{ title: "Rabbi Scheller's 7:00 PM Israel class", status: 'draft' }],
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
  leads: [{ parent_name: 'One Time Review Member', region: 'us', status: 'new', interested_tiers: ['library'] }],
  calendar: { events: [{ title: '7:00 Mishnah Class', start_at: '2026-06-21T16:00:00.000Z' }] },
  source_prep_jobs: [{ title: 'Source sheet draft', status: 'draft' }],
};

function json(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
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

function serveFile(res, filePath, contentType = 'text/html') {
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fs.readFileSync(filePath));
}

function serveStatic(res, requestPath) {
  if (requestPath === '/js/bna-bot-widget.js' || requestPath === '/js/app-select.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end('window.__BNA_QA_WIDGET_DISABLED__ = true;');
    return true;
  }
  const filePath = path.normalize(path.join(publicRoot, decodeURIComponent(requestPath).replace(/^\/+/, '')));
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
    '.ico': 'image/x-icon',
  }[ext] || 'text/plain';
  serveFile(res, filePath, contentType);
  return true;
}

function previewPayload(body) {
  return {
    dry_run: true,
    external_write_performed: false,
    parser_version: 'one-time-rabbi-final-local-smoke',
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
        person_name: 'Operations Admin',
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
        owner: 'Operations Admin',
        title: 'Approve Resend sender/domain setup',
        due_date: 'operator decision',
        blocked_actions: ['email send'],
      },
    ],
  };
}

function providerPortalPayload() {
  return {
    provider: {
      id: 1,
      provider_name: 'Rabbi Elie Scheller',
      status: 'review',
      provider_status: 'review',
      entitlement_plan: 'revenue_share_partner',
      commercial_model: 'revenue_share',
      integration_status: 'no_access',
      source_of_truth: 'first_party_bna_operations',
      public_signup_enabled: false,
      plan: { label: 'One Time workspace', helper: 'Scoped One Time provider workspace.' },
    },
    profile: { id: 1 },
    guardrails: {
      public_changes: 'One Time provider changes stay pending review until BNA approves them.',
    },
    services: [
      {
        id: 8,
        title: 'One Time Mishnah Class',
        description: 'Live Mishnayos class and member library review surface.',
        status: 'review',
        service_type: 'learning',
        city: 'Online',
      },
    ],
    one_time_class_media_enabled: true,
    one_time_class_media: [],
    entitlements: [{ entitlement_key: 'one_time_class_media', enabled: true, notes: 'Preview and review only.' }],
    integrations: integrationCards.map((card) => ({
      label: card.label,
      integration_key: card.provider,
      integration_status: card.status,
      external_system: card.mode,
      source_of_truth: 'owner_action_required',
      notes: card.blockers.join(' '),
    })),
    access_checklist: [
      { item_key: 'vimeo_owner', label: 'Vimeo owner access', status: 'needed', next_action: 'Owner confirms token path.' },
      { item_key: 'resend_dns', label: 'Resend DNS', status: 'needed', next_action: 'DNS proof required before send.' },
    ],
    messages: [],
    media: [],
    comments: [],
    google_business: { reviews_live: false },
    upgrade: {},
  };
}

function parentPortalPayload() {
  return {
    parent: {
      id: 1,
      name: 'One Time Review Parent',
      email: 'one-time-parent@example.test',
      preferred_language: 'en',
      rabbi_contact: {},
    },
    students: [
      {
        id: 1,
        name: 'One Time Review Learner',
        name_en: 'One Time Review Learner',
        goals: [],
        assignments: [],
        questions: [],
        calendar_events: [],
      },
    ],
    calendar_events: [],
    questions: [],
    notifications: [],
    service_providers: [],
    device_access: { status: 'review_only' },
    ws11: {},
  };
}

function studentPortalPayload() {
  return {
    student: {
      id: 1,
      name: 'One Time Review Learner',
      name_en: 'One Time Review Learner',
    },
    torah: {
      class_trip_percentage: 0,
      public_trip_percentage: 0,
      daily_completion_percentage: 0,
      morning_goal_status: 'not_yet',
      history: [],
    },
    goals: [],
    questions: [],
    assignments: [],
    calendar_events: [],
    next_meeting_date: null,
    weekly_private_meeting: {},
    rabbi_contact: {},
    device_access: { status: 'review_only' },
    ws11: {},
  };
}

function classroomPayload() {
  return {
    classroom: {
      access: { member_label: 'One Time Review Member', tier: 'library_only' },
      today_video: {
        id: 1,
        title: 'Mishnah Aleph Review',
        description: 'Member-visible sample video loaded from the local smoke fixture.',
        class_date: '2026-06-21',
        media_provider: 'manual',
        package_status: 'published',
        media_url: 'https://example.test/one-time-review-video',
      },
      calendar_items: [
        { id: 1, assignment_title: 'Prepare Mishnah Aleph', display_label: 'Review assignment', start_at: '2026-06-21T16:00:00.000Z', source: 'internal' },
      ],
      curriculum: [{ id: 1, title: 'Seder Moed', description: 'Review unit.' }],
      classes: [{ id: 1, curriculum_unit_id: 1, title: 'Mishnah Aleph', description: 'Review class.', class_date: '2026-06-21', package_status: 'published' }],
      participation_summary: [{ actor_label: 'Review participant', approved_questions: 1, approved_responses: 1, rabbi_featured: 0 }],
      top_questions: [{ thread_title: 'Why this Mishnah first?', body_preview: 'Approved question preview.', author_label: 'Review participant' }],
      threads: [
        {
          id: 44,
          title: 'Rabbi review thread',
          thread_type: 'question',
          messages: [{ author_name: 'Rabbi Elie Scheller', body: 'Reply privately first; review decides what can be shared.' }],
        },
      ],
    },
  };
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
      logo_url: '/images/one-time-logo-black.png',
    };
  }
  if (pathname === '/api/bna/projects') return { projects: [oneTimeProject] };
  if (pathname === '/api/bna/people') {
    return {
      people: [
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
          full_name: 'Operations Admin',
          display_name: 'Operations Admin',
          role: 'project_manager',
          account_type: 'internal_admin',
          access_level: 'manager',
          project_key: 'one_time_mishnah_class',
          workspace_key: 'rabbi_sheller_provider',
        },
      ],
    };
  }
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
  if (pathname === '/api/bna/members') return { members: [{ id: 1, display_name: 'One Time Review Member', access_tier: 'library_only', access_status: 'active' }] };
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

function createServer() {
  let activePort = 0;
  const previewRequests = [];
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    const review = () => buildOneTimeSharedReviewData({ baseUrl: `http://127.0.0.1:${activePort || 0}` });
    if (url.pathname === '/one-time' || url.pathname.startsWith('/one-time/')) {
      return serveFile(res, oneTimeHtmlPath);
    }
    if (url.pathname === '/operations' || url.pathname === '/operations.html') {
      return serveFile(res, operationsHtmlPath);
    }
    if (url.pathname === '/provider.html' || url.pathname === '/provider') {
      return serveFile(res, path.join(publicRoot, 'provider.html'));
    }
    if (url.pathname === '/parent.html' || url.pathname === '/parent') {
      return serveFile(res, path.join(publicRoot, 'parent.html'));
    }
    if (url.pathname === '/student.html' || url.pathname === '/student') {
      return serveFile(res, path.join(publicRoot, 'student.html'));
    }
    if (url.pathname === '/one-time-classroom.html' || url.pathname === '/one-time-classroom') {
      return serveFile(res, path.join(publicRoot, 'one-time-classroom.html'));
    }
    if (url.pathname === '/one-time-email-review.html' || url.pathname === '/one-time-email-review') {
      return serveFile(res, path.join(publicRoot, 'one-time-email-review.html'));
    }
    if (url.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (url.pathname === '/api/one-time/campaign') {
      return json(res, {
        success: true,
        configured: false,
        deadline_at: null,
        decision_id: 'DEC-20260622-ONE-TIME-CAMPAIGN-DEADLINE',
        external_write_performed: false,
      });
    }
    if (url.pathname === '/api/one-time/interest') {
      return json(res, {
        success: true,
        message: 'Local smoke captured interest preview only.',
        external_write_performed: false,
      });
    }
    if (url.pathname === '/api/one-time-review/provider') {
      const data = review();
      return json(res, { success: true, ...data.provider_portal, links: data.links, test_only: true, external_write_performed: false });
    }
    if (url.pathname === '/api/one-time-review/parent') {
      const data = review();
      return json(res, { success: true, ...data.parent_portal, links: data.links, test_only: true, external_write_performed: false });
    }
    if (url.pathname === '/api/one-time-review/student') {
      const data = review();
      return json(res, { success: true, ...data.student_portal, links: data.links, test_only: true, external_write_performed: false });
    }
    if (url.pathname === '/api/one-time-review/classroom') {
      const data = review();
      return json(res, { success: true, classroom: data.classroom, links: data.links, test_only: true, external_write_performed: false });
    }
    if (url.pathname === '/api/one-time-review/email-templates') {
      const data = review();
      return json(res, { success: true, email_templates: data.email_templates, links: data.links, blockers: data.external_blockers, send_disabled: true, test_only: true, external_write_performed: false });
    }
    if (url.pathname === '/api/provider-portal/session') return json(res, providerPortalPayload());
    if (url.pathname === '/api/parent-portal' || url.pathname === '/api/parent-portal/session') return json(res, parentPortalPayload());
    if (url.pathname === '/api/student-portal/session') return json(res, studentPortalPayload());
    if (url.pathname === '/api/one-time-classroom') return json(res, classroomPayload());
    if (url.pathname === '/api/one-time-classroom/threads/44/responses') return json(res, { message: 'Submitted for review.', external_write_performed: false });
    if (url.pathname === '/api/bna/project-meetings/one-time-drive-brief/preview') {
      const body = await readBody(req);
      previewRequests.push({ method: req.method, body });
      return json(res, previewPayload(body));
    }
    if (url.pathname.startsWith('/api/bna/')) return json(res, defaultApiPayload(url.pathname));
    if (url.pathname.startsWith('/api/')) {
      return json(res, { success: true, test_only: true, external_write_performed: false });
    }
    if (serveStatic(res, url.pathname)) return;
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });
  return {
    server,
    previewRequests,
    listen: async () => {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      activePort = server.address().port;
      return `http://127.0.0.1:${activePort}`;
    },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function gotoRoute(page, baseUrl, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

async function textContent(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) return true;
      if (element.closest('script, style, template, noscript, [hidden], [aria-hidden="true"], .hidden')) return false;
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      if (!element.getClientRects().length) return false;
      return true;
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !isVisible(parent)) return NodeFilter.FILTER_REJECT;
        if (!String(node.nodeValue || '').trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const pieces = [];
    let node = walker.nextNode();
    while (node) {
      pieces.push(node.nodeValue);
      node = walker.nextNode();
    }
    return pieces.join(' ').replace(/\s+/g, ' ').trim();
  });
}

async function assertNoForbiddenScopeText(page, route) {
  const text = await textContent(page);
  for (const pattern of FORBIDDEN_ONE_TIME_SCOPE_TEXT) {
    assert.doesNotMatch(text, pattern, `${route} leaked forbidden scope text matching ${pattern}`);
  }
}

async function assertButtonContracts(page, route) {
  const offenders = await page.locator('button:visible').evaluateAll((buttons) => buttons
    .map((button) => {
      const marked = button.hasAttribute('data-action-id')
        || button.hasAttribute('data-one-time-action-state')
        || button.hasAttribute('data-button-state');
      if (marked) return null;
      return button.outerHTML.replace(/\s+/g, ' ').slice(0, 180);
    })
    .filter(Boolean));
  assert.deepEqual(offenders, [], `${route} has visible buttons without data-action-id or button-state marker`);
}

async function assertGatedButtonsExplainState(page, route) {
  const offenders = await page.locator('button:visible').evaluateAll((buttons) => buttons
    .map((button) => {
      const state = String(button.getAttribute('data-one-time-action-state') || '').toLowerCase();
      const gated = button.disabled
        || button.getAttribute('aria-disabled') === 'true'
        || /preview-disabled|gated|disabled|blocked|locked/.test(state);
      if (!gated) return null;
      const describedBy = button.getAttribute('aria-describedby');
      const describedText = describedBy ? (document.getElementById(describedBy)?.textContent || '') : '';
      const localText = [
        button.textContent,
        button.title,
        button.getAttribute('aria-label'),
        describedText,
        button.closest('[data-one-time-no-write-preview], [data-one-time-setup-blocker], .notice, .panel')?.textContent,
      ].filter(Boolean).join(' ');
      return /preview|gated|blocked|no-write|review|disabled|not configured|locked|scope|access code|login|required|private/i.test(localText)
        ? null
        : button.outerHTML.replace(/\s+/g, ' ').slice(0, 180);
    })
    .filter(Boolean));
  assert.deepEqual(offenders, [], `${route} has preview/gated buttons without visible explanation`);
}

async function assertNoMobileOverflow(page, baseUrl, route) {
  await page.setViewportSize({ width: 390, height: 900 });
  await gotoRoute(page, baseUrl, route);
  const metrics = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(metrics.scrollWidth <= metrics.width + 1, `${route} mobile overflow ${metrics.scrollWidth} > ${metrics.width}`);
}

async function assertScopeMarkers(page, route) {
  await page.waitForSelector('[data-one-time-rabbi-dashboard]', { timeout: 15000 });
  const markers = await page.locator('[data-one-time-rabbi-dashboard]').evaluateAll((nodes) => nodes.map((node) => ({
    dashboard: node.getAttribute('data-one-time-rabbi-dashboard') || '',
    workspace: node.getAttribute('data-one-time-workspace') || '',
    project: node.getAttribute('data-one-time-project') || '',
    text: node.textContent.replace(/\s+/g, ' ').trim(),
  })));
  assert.ok(markers.length >= 1, `${route} missing One Time dashboard marker`);
  const hasScope = markers.some((marker) => marker.workspace === 'rabbi_sheller_provider' && marker.project === 'one_time_mishnah_class')
    || markers.some((marker) => /rabbi_sheller_provider/.test(marker.text) && /one_time_mishnah_class/.test(marker.text));
  assert.ok(hasScope, `${route} missing visible or attributed One Time workspace/project scope`);
  assert.match(await textContent(page), /One Time|OneTime|Mishnah/i, `${route} missing One Time branding`);
}

async function assertRouteShell(page, baseUrl, route) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRoute(page, baseUrl, route);
  await assertScopeMarkers(page, route);
  await assertNoForbiddenScopeText(page, route);
  await assertButtonContracts(page, route);
  await assertGatedButtonsExplainState(page, route);
  await assertNoMobileOverflow(page, baseUrl, route);
}

test('final local One Time/Rabbi UI QA harness covers scoped routes without external writes', async () => {
  fs.mkdirSync(reportDir, { recursive: true });
  const local = createServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const report = {
    ok: false,
    baseUrl,
    routes: [],
    previewRequests: [],
    guardrails: {
      mockedApiOnly: true,
      productionWrites: false,
      externalWrites: false,
      deploy: false,
    },
  };

  try {
    for (const route of REQUIRED_ROUTES) {
      await assertRouteShell(page, baseUrl, route);
      report.routes.push({ route, status: 'basic-shell-pass' });
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoRoute(page, baseUrl, REQUIRED_ROUTES[1]);
    await page.waitForFunction(() => typeof window.workspaceNavItems === 'function', null, { timeout: 15000 });
    const operationsContract = await page.evaluate(() => {
      const navItems = window.workspaceNavItems().map((item) => ({
        id: item.id,
        label: item.label,
        navKey: item.navKey || item.id,
      }));
      const navIds = navItems.map((item) => item.id);
      return {
        workspace: window.currentWorkspaceKey(),
        role: window.currentWorkspaceRoleLabel(),
        navIds,
        navLabels: navItems.map((item) => item.label),
        navKeys: navItems.map((item) => item.navKey),
        hasStudents: navIds.includes('students'),
        hasAccounting: navIds.includes('accounting'),
      };
    });
    assert.equal(operationsContract.workspace, 'rabbi_sheller_provider');
    assert.equal(operationsContract.role, 'Workspace Owner');
    assert.deepEqual(operationsContract.navLabels, ['Overview', 'Members', 'Classes', 'Comms', 'Auto', 'Payments', 'Tasks', 'Setup']);
    assert.deepEqual(operationsContract.navKeys, ['overview_package_status', 'members_crm', 'classes_content', 'communications', 'automations', 'payments_access', 'tasks_decisions', 'settings_setup']);
    for (const expected of ['service_providers', 'contacts', 'content', 'communications', 'automations', 'tasks', 'settings']) {
      assert.ok(operationsContract.navIds.includes(expected), `operations missing Rabbi-facing module ${expected}`);
    }
    for (const hidden of ['dashboard', 'watchdog', 'agents', 'integrations', 'api_usage', 'studio', 'live_classes', 'calendar']) {
      assert.equal(operationsContract.navIds.includes(hidden), false, `operations should demote support/raw module ${hidden}`);
    }
    assert.equal(operationsContract.hasStudents, false, 'students module must be hidden/demoted in One Time provider scope');
    assert.equal(operationsContract.hasAccounting, false, 'accounting module must be hidden/demoted in One Time provider scope');

    await page.evaluate(() => {
      window.switchView('content');
      window.setCurrentSection('meetings');
    });
    await page.waitForSelector('[data-preview-one-time-drive-brief]', { timeout: 15000 });
    await page.locator('[data-preview-one-time-drive-brief]').click();
    await page.waitForSelector('[data-one-time-content-command-center]', { timeout: 15000 });
    const contentCommandText = await page.locator('[data-one-time-content-command-center]').textContent();
    assert.match(contentCommandText, /No-write Drive Brief Preview/i);
    assert.match(contentCommandText, /one_time_mishnah_class/);
    assert.match(contentCommandText, /rabbi_sheller_provider/);
    assert.equal(local.previewRequests.length, 1);
    assert.equal(local.previewRequests[0].method, 'POST');

    await page.evaluate(() => window.switchView('agents'));
    await page.waitForSelector('[data-one-time-task-lane]', { timeout: 15000 });
    const taskLaneText = await page.locator('[data-one-time-task-lane]').textContent();
    assert.match(taskLaneText, /One Time Agent Status/i);
    assert.match(taskLaneText, /Complete One Time Operations UI/i);

    await gotoRoute(page, baseUrl, '/one-time');
    const publicText = await textContent(page);
    assert.doesNotMatch(publicText, /Codex Queue|Need decision|Operations dashboard|agent run/i, '/one-time public route exposed private Operations text');
    assert.ok(
      /Future upsell/i.test(publicText) || !/VIP|internal-only|upsell/i.test(publicText),
      'public internal-only VIP module should be hidden or demoted as future copy, not an enabled action',
    );

    assert.deepEqual(consoleErrors, []);
    report.ok = true;
    report.previewRequests = local.previewRequests.map((request) => ({
      method: request.method,
      redacted: true,
      body: {
        source: request.body?.source
          ? {
              title: request.body.source.title || 'redacted local source',
              drive_file_id: request.body.source.drive_file_id ? 'redacted' : undefined,
              url: request.body.source.url ? 'redacted' : undefined,
              mime_type: request.body.source.mime_type || undefined,
            }
          : undefined,
      },
    }));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(
      path.join(reportDir, 'qa-harness-local-report.md'),
      [
        '# One Time Rabbi UI Final Local Smoke',
        '',
        'PASS: Local mocked route smoke completed without console errors, mobile overflow, external writes, or private scope leakage.',
        '',
        ...report.routes.map((entry) => `- ${entry.route}: ${entry.status}`),
        '',
        `Preview POSTs: ${local.previewRequests.length}`,
        '',
      ].join('\n'),
    );
  } finally {
    await browser.close();
    await local.close();
  }
});
