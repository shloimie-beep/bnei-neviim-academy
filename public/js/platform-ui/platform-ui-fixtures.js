(function attachPlatformUiFixtures(global) {
  const modules = [
    { key: 'overview', label: 'Overview', group: 'Overview', marker: 'OV', roles: ['super_admin', 'admin', 'provider_admin', 'moderator'] },
    { key: 'members', label: 'Members', group: 'People', marker: 'MB', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'students', label: 'Students', group: 'People', marker: 'ST', roles: ['super_admin', 'admin'] },
    { key: 'service_providers', label: 'Service Providers', group: 'People', marker: 'SP', roles: ['super_admin', 'admin'] },
    { key: 'community', label: 'Community', group: 'Engagement', marker: 'CO', roles: ['super_admin', 'admin', 'provider_admin', 'moderator'] },
    { key: 'courses', label: 'Courses', group: 'Engagement', marker: 'CR', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'course_builder', label: 'Course Builder', group: 'Engagement', marker: 'CB', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'lesson_video', label: 'Lesson Video', group: 'Engagement', marker: 'LV', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'content_research', label: 'Content / Research', group: 'Engagement', marker: 'CT', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'tasks', label: 'Tasks', group: 'Operations', marker: 'TS', roles: ['super_admin', 'admin', 'provider_admin', 'moderator'] },
    { key: 'decisions', label: 'Decisions', group: 'Operations', marker: 'DE', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'calendar', label: 'Calendar', group: 'Operations', marker: 'CA', roles: ['super_admin', 'admin', 'provider_admin', 'moderator'] },
    { key: 'goals_rewards', label: 'Goals / Rewards', group: 'Operations', marker: 'GR', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'prompt_queue', label: 'Prompt/Ramble Queue', group: 'Operations', marker: 'PQ', roles: ['super_admin', 'admin'] },
    { key: 'agents', label: 'Agents', group: 'System', marker: 'AG', roles: ['super_admin', 'admin'] },
    { key: 'automations', label: 'Automations', group: 'System', marker: 'AU', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'integrations', label: 'Integrations', group: 'System', marker: 'IN', roles: ['super_admin', 'admin', 'provider_admin'] },
    { key: 'settings', label: 'Settings', group: 'System', marker: 'SE', roles: ['super_admin', 'admin', 'provider_admin'] },
  ];

  const allModuleVisibility = modules.reduce((acc, module) => {
    acc[module.key] = true;
    return acc;
  }, {});

  const viewModels = {
    bna: {
      activeInstance: {
        id: 'inst-webcraft-saas',
        slug: 'webcraft-saas',
        name: 'WebCraft School Platform',
        deployment_mode: 'saas_tenant',
        canonical_codebase: 'bna-platform',
        database_scope: 'shared_tenant',
        domain_scope: 'tenant_routes',
        secret_scope: 'tenant_scoped',
      },
      activeWorkspace: {
        id: 'workspace-bna',
        instance_id: 'inst-webcraft-saas',
        organization_id: 'org-bna',
        slug: 'bna',
        name: 'BNA',
        brand_id: 'brand-bna',
        visibility: 'private_operations',
        module_visibility: { ...allModuleVisibility },
      },
      authorizedWorkspaces: [
        { id: 'workspace-bna', slug: 'bna', name: 'BNA', role: 'admin', workspace_type: 'school' },
        { id: 'workspace-one-time', slug: 'one_time_mishnah_class', name: 'One Time Mishnah Class', role: 'admin', workspace_type: 'service_provider' },
      ],
      activeRole: 'admin',
      visibleModules: modules.map((module) => module.key),
      brand: {
        name: 'BNA',
        product_name: 'Bnei Neviim Academy',
        accent: '#c9a227',
        accent_2: '#0e7c7b',
        shell: '#101820',
        surface: '#f7f4ed',
        logo_label: 'BNA',
      },
    },
    one_time: {
      activeInstance: {
        id: 'inst-webcraft-saas',
        slug: 'webcraft-saas',
        name: 'WebCraft School Platform',
        deployment_mode: 'saas_tenant',
        canonical_codebase: 'bna-platform',
        database_scope: 'shared_tenant',
        domain_scope: 'tenant_routes',
        secret_scope: 'tenant_scoped',
      },
      activeWorkspace: {
        id: 'workspace-one-time',
        instance_id: 'inst-webcraft-saas',
        organization_id: 'org-rabbi-sheller',
        slug: 'one_time_mishnah_class',
        name: 'One Time Mishnah Class',
        brand_id: 'brand-one-time',
        visibility: 'provider_private',
        module_visibility: {
          ...allModuleVisibility,
          students: false,
          service_providers: false,
          prompt_queue: false,
        },
      },
      authorizedWorkspaces: [
        { id: 'workspace-bna', slug: 'bna', name: 'BNA', role: 'admin', workspace_type: 'school' },
        { id: 'workspace-one-time', slug: 'one_time_mishnah_class', name: 'One Time Mishnah Class', role: 'admin', workspace_type: 'service_provider' },
      ],
      activeRole: 'provider_admin',
      visibleModules: modules
        .filter((module) => !['students', 'service_providers', 'prompt_queue'].includes(module.key))
        .map((module) => module.key),
      brand: {
        name: 'One Time',
        product_name: 'One Time Mishnah Class',
        accent: '#b68a1f',
        accent_2: '#237a6f',
        shell: '#151916',
        surface: '#f6f2e7',
        logo_label: 'OT',
      },
      owners: {
        owner: 'Rabbi Elie Scheller',
        admin: 'Shloimie',
      },
    },
  };

  const data = {
    bna: {
      metrics: [
        { label: 'Active students', value: 18, tone: 'good' },
        { label: 'Provider leads', value: 11, tone: 'watch' },
        { label: 'Open decisions', value: 7, tone: 'warn' },
        { label: 'Agent runs', value: 4, tone: 'good' },
      ],
      members: [
        { id: 'mem-bna-shloimie', name: 'Shloimie', role: 'Admin', status: 'active', email: 'shloimie@example.test', workspace: 'BNA' },
        { id: 'mem-bna-ops', name: 'Operations Assistant', role: 'Operator', status: 'active', email: 'ops@example.test', workspace: 'BNA' },
      ],
      students: [
        { id: 'stu-001', name: 'Student Alpha', guardian: 'Parent Alpha', provider: 'BNA Staff', progress: 72, status: 'active', next: 'Review weekly goal' },
        { id: 'stu-002', name: 'Student Beta', guardian: 'Parent Beta', provider: 'BNA Staff', progress: 46, status: 'active', next: 'Confirm tablet access' },
        { id: 'stu-003', name: 'Student Gamma', guardian: 'Parent Gamma', provider: 'Coach Team', progress: 88, status: 'active', next: 'Award milestone' },
      ],
      serviceProviders: [
        { id: 'sp-001', name: 'Speech Provider', category: 'Learning Support', readiness: 'profile_review', owner: 'BNA Admin', next: 'Verify public listing' },
        { id: 'sp-002', name: 'Math Coach', category: 'Tutoring', readiness: 'ready', owner: 'BNA Admin', next: 'Open package terms' },
      ],
      communities: [
        { id: 'com-bna', name: 'BNA Parent Community', visibility: 'Private parents', groups: 4, posts: 18, moderation: 2, pinned: ['Registration updates', 'Weekly goal notes'] },
      ],
      courses: [
        {
          id: 'course-bna-01',
          title: 'Self-Governance Foundations',
          status: 'draft',
          visibility: 'BNA students',
          enrollment_rule: 'Admin assigned',
          modules: [
            { id: 'mod-1', title: 'Own the day', lessons: 3 },
            { id: 'mod-2', title: 'Practical accountability', lessons: 4 },
          ],
          lessons: [
            { id: 'lesson-1', title: 'Daily ownership', video_asset_id: 'video-bna-1', status: 'ready', duration: '08:32' },
            { id: 'lesson-2', title: 'Parent update loop', video_asset_id: null, status: 'needs_video', duration: '' },
          ],
          progressSummary: { enrolled: 18, started: 12, complete: 4 },
          videoReadiness: { ready: 1, missing: 1, blocked: 0 },
        },
      ],
      tasks: [
        { id: 'task-1', title: 'Finalize parent update workflow', status: 'in_progress', owner: 'Codex', next: 'Bind approval evidence' },
        { id: 'task-2', title: 'Clean service provider onboarding cards', status: 'blocked', owner: 'Shloimie', next: 'Choose package wording' },
        { id: 'task-3', title: 'Verify student portal permissions', status: 'queued', owner: 'Codex', next: 'Run scoped smoke' },
      ],
      decisions: [
        { id: 'dec-1', question: 'Which parent update cadence is approved for launch?', context: 'Weekly updates exist as drafts. Sends remain approval gated.', options: ['Weekly digest', 'Only manual updates', 'Pilot with one family'], source: 'REQ-20260619-402' },
        { id: 'dec-2', question: 'Which reward wording should be visible to students?', context: 'Rewards stay neutral until policy is approved.', options: ['Milestone', 'Privilege', 'Recognition'], source: 'UI fixture' },
      ],
      calendar: [
        { id: 'cal-1', title: 'Weekly parent review', time: 'Monday 09:00', scope: 'BNA', status: 'scheduled' },
        { id: 'cal-2', title: 'Provider onboarding review', time: 'Tuesday 13:30', scope: 'BNA', status: 'draft' },
      ],
      content: [
        { id: 'content-1', title: 'Self-governance newsletter draft', type: 'Newsletter', status: 'draft', source: 'Approved public topic' },
        { id: 'content-2', title: 'Provider welcome outline', type: 'Research', status: 'review', source: 'Operations note' },
      ],
      rewards: [
        { id: 'reward-1', name: 'Milestone lunch', rule: 'Group Torah progress 80%', assigned: 'BNA group', state: 'available', audit: ['Created locally', 'Policy wording pending'] },
        { id: 'reward-2', name: 'Device time privilege', rule: 'Daily goal complete', assigned: 'Student Gamma', state: 'awarded', audit: ['Awarded from goal board', 'Redeem pending'] },
      ],
      agents: [
        { id: 'agent-1', name: 'Codex W2', status: 'running', prompt: 'SaaS UI package', evidence: 'local harness pending' },
        { id: 'agent-2', name: 'Watchdog', status: 'idle', prompt: 'Action registry audit', evidence: 'not run in W2' },
      ],
      automations: [
        { id: 'auto-1', name: 'Parent weekly update approval', state: 'approval_required', last: 'No send', next: 'Review draft' },
        { id: 'auto-2', name: 'Provider onboarding review', state: 'guarded', last: 'Local preview', next: 'Confirm provider fields' },
      ],
      integrations: [
        { id: 'buffer', name: 'Buffer', readiness: 'ready_for_text_drafts', account: 'BNA social scheduler', scopes: ['draft', 'queue'], last_check: 'local fixture', secret: null, next: 'Hosted media URL support' },
        { id: 'google', name: 'Google Workspace', readiness: 'blocked_oauth', account: 'Test user pending', scopes: ['Drive', 'Calendar', 'Classroom'], last_check: 'not connected', secret: '[redacted]', next: 'Approve OAuth test user' },
        { id: 'resend', name: 'Resend', readiness: 'configured_no_send', account: 'BNA sender identity', scopes: ['draft', 'domain status'], last_check: 'metadata only', secret: '[redacted]', next: 'Approval before any send' },
      ],
      promptQueue: [
        { id: 'raw-001', title: 'Website correction packet', status: 'registered', requirements: 6, next: 'Implementation batch' },
        { id: 'raw-002', title: 'Agent control follow-up', status: 'parsed', requirements: 4, next: 'Evidence audit' },
      ],
    },
    one_time: {
      metrics: [
        { label: 'Members', value: 36, tone: 'good' },
        { label: 'Courses', value: 2, tone: 'good' },
        { label: 'Open decisions', value: 5, tone: 'warn' },
        { label: 'Integration gates', value: 4, tone: 'watch' },
      ],
      members: [
        { id: 'mem-ot-rabbi', name: 'Rabbi Elie Scheller', role: 'Owner', status: 'active', email: 'rabbi@example.test', workspace: 'One Time' },
        { id: 'mem-ot-shloimie', name: 'Shloimie', role: 'Admin', status: 'active', email: 'shloimie@example.test', workspace: 'One Time' },
        { id: 'mem-ot-parent', name: 'Member Family', role: 'Member', status: 'pending_access', email: 'member@example.test', workspace: 'One Time' },
      ],
      students: [],
      serviceProviders: [],
      communities: [
        { id: 'com-ot', name: 'One Time Community', visibility: 'Members only', groups: 3, posts: 24, moderation: 3, pinned: ['Class recordings', 'Source sheets', 'Weekly questions'] },
      ],
      courses: [
        {
          id: 'course-ot-01',
          title: 'Mishnayos Daily Path',
          status: 'draft',
          visibility: 'Library and live members',
          enrollment_rule: 'Paid or manually granted access',
          modules: [
            { id: 'ot-mod-1', title: 'Seder Zeraim', lessons: 6 },
            { id: 'ot-mod-2', title: 'Seder Moed', lessons: 5 },
          ],
          lessons: [
            { id: 'ot-lesson-1', title: 'Berachos overview', video_asset_id: 'video-ot-1', status: 'ready', duration: '21:08' },
            { id: 'ot-lesson-2', title: 'Peah opening', video_asset_id: null, status: 'needs_video', duration: '' },
          ],
          progressSummary: { enrolled: 36, started: 28, complete: 9 },
          videoReadiness: { ready: 1, missing: 1, blocked: 0 },
        },
      ],
      tasks: [
        { id: 'ot-task-1', title: 'Confirm member library destination', status: 'blocked', owner: 'Shloimie', next: 'Owner decision' },
        { id: 'ot-task-2', title: 'Prepare class recording metadata', status: 'in_progress', owner: 'Codex', next: 'Attach video fixture' },
      ],
      decisions: [
        { id: 'ot-dec-1', question: 'Does One Time launch as scoped workspace or partner-owned single tenant?', context: 'Local work can proceed with mocks. Deployment split is gated.', options: ['Scoped workspace now', 'Single tenant now', 'Decide after pilot'], source: 'DECISIONS-AND-EXTERNAL-GATES.md' },
        { id: 'ot-dec-2', question: 'Which access destination is approved for member library launch?', context: 'No live portal publish until approved.', options: ['BNA member portal', 'Existing Rabbi app', 'Manual Drive links'], source: 'One Time backlog' },
      ],
      calendar: [
        { id: 'ot-cal-1', title: 'Live Mishnah class', time: 'Sunday 20:00', scope: 'One Time', status: 'scheduled' },
        { id: 'ot-cal-2', title: 'Recording review', time: 'Monday 12:00', scope: 'One Time admin', status: 'draft' },
      ],
      content: [
        { id: 'ot-content-1', title: 'Berachos class transcript', type: 'Transcript', status: 'review', source: 'Class recording' },
        { id: 'ot-content-2', title: 'Mishnah source sheet', type: 'Source sheet', status: 'draft', source: 'Rabbi review pending' },
      ],
      rewards: [
        { id: 'ot-reward-1', name: 'Learning streak recognition', rule: 'Three attended classes', assigned: 'Members', state: 'policy_pending', audit: ['Neutral wording only', 'No public leaderboard'] },
      ],
      agents: [
        { id: 'ot-agent-1', name: 'Codex W2', status: 'running', prompt: 'One Time UI fixtures', evidence: 'local harness pending' },
        { id: 'ot-agent-2', name: 'Content reviewer', status: 'queued', prompt: 'Recording package', evidence: 'fixture only' },
      ],
      automations: [
        { id: 'ot-auto-1', name: 'Question review alert', state: 'private_review_ready', last: 'No send', next: 'Approve alert preference' },
        { id: 'ot-auto-2', name: 'Recording added review', state: 'review_ready', last: 'No publish', next: 'Select destination' },
      ],
      integrations: [
        { id: 'vimeo', name: 'Vimeo', readiness: 'mock_ready', account: 'Provider account TBD', scopes: ['metadata', 'upload preparation'], last_check: 'mocked', secret: '[redacted]', next: 'Approve live OAuth' },
        { id: 'zoom', name: 'Zoom', readiness: 'mock_ready', account: 'Rabbi class account TBD', scopes: ['meeting metadata'], last_check: 'mocked', secret: '[redacted]', next: 'Approve live mutation' },
        { id: 'resend', name: 'Resend', readiness: 'no_send', account: 'Sender not approved', scopes: ['draft'], last_check: 'metadata only', secret: '[redacted]', next: 'Approve sender identity' },
      ],
      promptQueue: [],
    },
  };

  const videoAssets = [
    { id: 'video-bna-1', title: 'Daily ownership approved clip', provider: 'Drive', duration: '08:32', privacy: 'BNA students', transcript: 'linked' },
    { id: 'video-ot-1', title: 'Berachos overview approved asset', provider: 'Vimeo', duration: '21:08', privacy: 'One Time members', transcript: 'linked' },
    { id: 'video-shared-1', title: 'Neutral platform intro', provider: 'Drive', duration: '03:14', privacy: 'Admin preview', transcript: 'not linked' },
  ];

  const fixtures = {
    modules,
    workspaces: [
      { id: 'bna', label: 'BNA', description: 'School operations workspace', profile: 'school' },
      { id: 'one_time', label: 'One Time', description: 'Rabbi Elie owner, Shloimie admin', profile: 'service_provider' },
    ],
    viewModels,
    data,
    videoAssets,
    states: {
      empty: { title: 'No records in this workspace', detail: 'This state is used when a role or module has no visible records.' },
      loading: { title: 'Loading workspace', detail: 'Local fixture loading state for integration testing.' },
      error: { title: 'Could not load workspace', detail: 'Adapter should surface the backend error here.' },
      success: { title: 'Saved locally', detail: 'The mock adapter recorded the event without writing production data.' },
    },
  };

  global.PlatformUiFixtures = fixtures;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fixtures;
  }
})(typeof window !== 'undefined' ? window : globalThis);
