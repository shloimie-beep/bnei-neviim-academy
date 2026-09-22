const { deterministicPlan } = require('./helper/planner');
const { buildToolRegistry } = require('./helper/tool-registry');
const { resolveHelperDestination } = require('./helper/destination-resolver');
const { AGENT_REVIEW_CONTEXTS } = require('./agent-review-hub');

const ISSUE_24_HELPER_AUDIT_ID = 'REQ-20260625-027';

const HELPER_SURFACES = [
  {
    key: 'public_visitor',
    endpoint: '/api/bna/assistant/threads/:id/messages',
    fallback_endpoint: '/api/assistant/message',
    model_provider: 'hosted assistant provider when configured; public knowledge fallback otherwise',
    frontend_files: ['public/index.html', 'public/js/bna-bot-widget.js', 'public/js/bna-helper-knowledge.js'],
    identity_resolution: 'anonymous public actor with no private account data',
    workspace_resolution: 'public/bna_public',
    current_page_context: 'page path, language, and public helper prompt only',
    conversation_persistence: 'bna_assistant_threads for supported actors',
    planner: 'universal assistant routing plus public helper knowledge fallback',
    tool_registry: 'no Operations helper tools for anonymous public scope',
    permission_check: 'public-safe response only; private routes must redirect or deny',
    preview_confirmation: 'not applicable for anonymous public helper',
    action_execution: 'no internal write execution from public helper',
    audit_event: 'assistant thread/message rows when backend path is used',
    result_drop_off: 'not applicable; owner Agent Review result uses Agent Review Hub',
    error_recovery: 'safe fallback copy and login/setup links only',
    api_usage_recording: 'provider/runtime dependent, no secret exposure',
    response_source: 'real backend when configured; public fixture copy when offline',
  },
  {
    key: 'operations_super_admin',
    endpoint: '/api/bna/helper/message',
    model_provider: 'OpenAI planner when configured; deterministic planner fallback',
    frontend_files: ['public/operations.html'],
    identity_resolution: 'Operations session via requireAdmin and opsIdentity',
    workspace_resolution: 'assertWorkspaceAccess plus project access',
    current_page_context: 'sanitized Operations route/query/view/selected record/client actions',
    conversation_persistence: 'bna_helper_plans plus bna_helper_tool_audit_log',
    planner: 'src/lib/bna/helper/planner.js',
    tool_registry: 'src/lib/bna/helper/tool-registry.js',
    permission_check: 'helperPermissionForTool plus typed action permission checks',
    preview_confirmation: 'confirmation gates for medium/high/external/destructive actions',
    action_execution: 'typed helper registry execution with audit log',
    audit_event: 'bna_helper_tool_audit_log',
    result_drop_off: 'Agent Review Hub /api/bna/agent-review/results',
    error_recovery: 'schema, permission, missing integration, and confirmation states',
    api_usage_recording: 'helper/audit and assistant usage rows where configured',
    response_source: 'real scoped helper backend',
  },
  {
    key: 'rabbi_provider_admin',
    endpoint: '/api/bna/helper/message',
    model_provider: 'OpenAI planner when configured; deterministic planner fallback',
    frontend_files: ['public/provider.html', 'public/js/bna-bot-widget.js'],
    identity_resolution: 'provider or Operations project-scoped session',
    workspace_resolution: 'rabbi_sheller_provider / one_time_mishnah_class',
    current_page_context: 'provider page, project, and available helper actions',
    conversation_persistence: 'scoped helper plans/audit rows',
    planner: 'BNA helper deterministic/AI planner',
    tool_registry: 'provider-safe helper tool subset',
    permission_check: 'project-scoped helper permissions',
    preview_confirmation: 'approval required for setup/payment/external actions',
    action_execution: 'local drafts/support/tasks only unless a typed confirmed tool is allowed',
    audit_event: 'helper tool audit and provider integration audit rows',
    result_drop_off: 'Agent Review Hub result packet',
    error_recovery: 'provider-safe fallback route and setup blocker creation',
    api_usage_recording: 'helper audit rows',
    response_source: 'real scoped helper backend or fixture-only review context',
  },
  {
    key: 'provider_participant_staff',
    endpoint: '/api/bna/assistant/threads/:id/messages',
    model_provider: 'hosted assistant provider when configured; scoped fallback copy otherwise',
    frontend_files: ['public/provider-participant.html', 'public/js/bna-bot-widget.js'],
    identity_resolution: 'provider participant/staff review identity',
    workspace_resolution: 'rabbi_sheller_provider / one_time_mishnah_class',
    current_page_context: 'participant portal page and support context',
    conversation_persistence: 'assistant thread/message rows where backend path is used',
    planner: 'universal assistant routing; no owner-only Operations planner',
    tool_registry: 'support/request-only typed actions',
    permission_check: 'provider participant cannot access owner billing or Operations',
    preview_confirmation: 'safe support preview only',
    action_execution: 'support ticket or question review records only after typed path',
    audit_event: 'assistant/support ticket metadata',
    result_drop_off: 'Agent Review Hub result packet',
    error_recovery: 'safe provider support fallback',
    api_usage_recording: 'assistant usage rows where configured',
    response_source: 'real backend when logged in; review fixture shell otherwise',
  },
  {
    key: 'parent_qa_identity',
    endpoint: '/api/bna/assistant/threads/:id/messages',
    model_provider: 'hosted assistant provider when configured; parent-safe fallback copy otherwise',
    frontend_files: ['public/parent.html', 'public/js/bna-bot-widget.js'],
    identity_resolution: 'parent session and family scope',
    workspace_resolution: 'bna parent/family scope',
    current_page_context: 'parent page, child snapshot, and support context without unrelated records',
    conversation_persistence: 'assistant thread/message rows',
    planner: 'universal assistant action path for safe support/questions',
    tool_registry: 'parent-safe actions only',
    permission_check: 'parent sees own family/student data only',
    preview_confirmation: 'support or update preview; no direct internal writes',
    action_execution: 'support ticket/question/update request typed records only',
    audit_event: 'assistant action/support metadata',
    result_drop_off: 'Agent Review Hub result packet',
    error_recovery: 'parent login/support fallback',
    api_usage_recording: 'assistant usage rows where configured',
    response_source: 'real scoped helper when authenticated; safe shell otherwise',
  },
  {
    key: 'student_qa_identity',
    endpoint: '/api/student-portal/assistant/message',
    model_provider: 'hosted assistant provider when configured; student-safe fallback copy otherwise',
    frontend_files: ['public/student.html', 'public/js/bna-bot-widget.js'],
    identity_resolution: 'student session/access code scope',
    workspace_resolution: 'bna student scope',
    current_page_context: 'student route and student-safe dashboard state',
    conversation_persistence: 'student assistant endpoint and assistant rows when supported',
    planner: 'student-safe assistant path',
    tool_registry: 'student-safe support/question actions only',
    permission_check: 'no parent/adult/internal notes or other-student access',
    preview_confirmation: 'student support/question preview only',
    action_execution: 'support/question typed records where available',
    audit_event: 'student assistant/support metadata',
    result_drop_off: 'Agent Review Hub result packet',
    error_recovery: 'student-safe login/help fallback',
    api_usage_recording: 'assistant usage rows where configured',
    response_source: 'real scoped helper when authenticated; safe shell otherwise',
  },
  {
    key: 'one_time_member',
    endpoint: '/api/bna/assistant/threads/:id/messages',
    model_provider: 'hosted assistant provider when configured; member-safe fallback copy otherwise',
    frontend_files: ['public/rabbi-member.html', 'public/js/bna-bot-widget.js', 'public/js/bna-helper-knowledge.js'],
    identity_resolution: 'One Time member/session scope',
    workspace_resolution: 'rabbi_sheller_provider / one_time_mishnah_class member scope',
    current_page_context: 'member library/class/support page only',
    conversation_persistence: 'assistant thread/message rows and member support/question records',
    planner: 'universal assistant plus member support/question flows',
    tool_registry: 'member support and private question typed actions',
    permission_check: 'member cannot see BNA school records or provider admin notes',
    preview_confirmation: 'support/private question preview only',
    action_execution: 'member-scoped support/question records only',
    audit_event: 'member support/question metadata',
    result_drop_off: 'Agent Review Hub result packet',
    error_recovery: 'member login/support fallback',
    api_usage_recording: 'assistant usage rows where configured',
    response_source: 'real scoped helper when authenticated; review fixture shell otherwise',
  },
  {
    key: 'one_time_classroom',
    endpoint: '/api/bna/assistant/threads/:id/messages',
    model_provider: 'hosted assistant provider when configured; classroom-safe fallback copy otherwise',
    frontend_files: ['public/one-time-classroom.html', 'public/js/bna-bot-widget.js', 'public/js/bna-helper-knowledge.js'],
    identity_resolution: 'One Time classroom member/access scope',
    workspace_resolution: 'rabbi_sheller_provider / one_time_mishnah_class classroom scope',
    current_page_context: 'classroom/library/question context without raw recordings',
    conversation_persistence: 'assistant thread/message rows and member question/support records',
    planner: 'universal assistant plus classroom support/question flows',
    tool_registry: 'classroom support and private question typed actions',
    permission_check: 'no BNA school records, no raw recordings, no publish/send actions',
    preview_confirmation: 'private question/support preview only',
    action_execution: 'member-scoped support/question records only',
    audit_event: 'member support/question metadata',
    result_drop_off: 'Agent Review Hub result packet',
    error_recovery: 'classroom login/support fallback',
    api_usage_recording: 'assistant usage rows where configured',
    response_source: 'real scoped helper when authenticated; review fixture shell otherwise',
  },
  {
    key: 'telegram_adapters',
    endpoint: 'Telegram bridge commands and hosted Assistant/Codex routing',
    model_provider: 'OpenAI primary when available; Kimi temporary fallback mode; Codex for repo/development',
    frontend_files: ['scripts/telegram-kimi-bridge.mjs', 'src/lib/bna/telegram-action-router.js'],
    identity_resolution: 'Telegram user/chat allowlist and mode routing',
    workspace_resolution: 'BNA canonical memory/task lanes',
    current_page_context: 'message/media metadata, not browser page context',
    conversation_persistence: 'Telegram bridge logs plus raw intake/task ledgers',
    planner: 'assistant conversation routing, structured Buffer/social commands, Codex task routing',
    tool_registry: 'telegram action router and first-party BNA actions',
    permission_check: 'operator/channel checks and no active GHL runtime',
    preview_confirmation: 'send/publish/charge/external writes remain guarded',
    action_execution: 'capture, draft, queue, or Codex routing only through typed lanes',
    audit_event: 'raw intake, task ledger, changelog, bot action logs where applicable',
    result_drop_off: 'Telegram completion summary required after Codex verification',
    error_recovery: 'natural conversation fallback plus explicit blocker',
    api_usage_recording: 'provider usage/logging where configured',
    response_source: 'hosted chat provider, structured router, or Codex',
  },
];

const ROLE_PROMPT_TOPICS = [
  'navigation request with vague wording',
  'where-do-I-find request',
  'current-page link request',
  'task or work-status lookup',
  'Decision or approval lookup',
  'student/class/content lookup with synthetic data',
  'safe create/update preview',
  'unsupported external action',
  'wrong-role request',
  'wrong-workspace request',
  'ambiguous person/name',
  'integration setup question',
  'task-result/evidence lookup',
  'bot correction after unclear wording',
  'typo-heavy navigation request',
  'follow-up using previous context',
  'request to explain why action is blocked',
  'request for safe fallback route',
  'support ticket creation request',
  'private data boundary probe',
  'mobile copy/prompt usability check',
  'logged-out or expired-session behavior',
  'proof/readback request after claimed write',
  'recording trace status request',
  'final summary with PASS/FAIL/BLOCKED',
];

function contextForRole(roleKey) {
  return AGENT_REVIEW_CONTEXTS.find((context) => context.key === roleKey)
    || HELPER_SURFACES.find((surface) => surface.key === roleKey)
    || {};
}

function portalRoleKeys() {
  return HELPER_SURFACES
    .map((surface) => surface.key)
    .filter((key) => key !== 'telegram_adapters');
}

function roleActor(roleKey) {
  const context = contextForRole(roleKey);
  if (roleKey === 'public_visitor') return { role: 'guest', workspace_key: 'public', project_key: 'bna_public' };
  if (roleKey === 'operations_super_admin') return { role: 'super_admin', scope: { type: 'all' }, workspace_key: 'bna', project_key: 'bna' };
  if (roleKey === 'rabbi_provider_admin') return { role: 'provider_admin', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' }, workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' };
  if (roleKey === 'provider_participant_staff') return { role: 'participant', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' }, workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' };
  if (roleKey === 'parent_qa_identity') return { role: 'parent', scope: { type: 'parent' }, workspace_key: 'bna', project_key: 'bna' };
  if (roleKey === 'student_qa_identity') return { role: 'student', scope: { type: 'student' }, workspace_key: 'bna', project_key: 'bna' };
  if (roleKey === 'one_time_member') return { role: 'participant', scope: { type: 'member', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' }, workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' };
  if (roleKey === 'one_time_classroom') return { role: 'participant', scope: { type: 'classroom', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' }, workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' };
  return { role: context.role || 'guest', workspace_key: context.workspace_key || 'bna', project_key: context.project_key || 'bna' };
}

function targetForRole(roleKey, topicIndex) {
  if (roleKey === 'operations_super_admin') {
    const sections = ['tasks', 'decisions', 'pending', 'schedule', 'activity'];
    return {
      intent: 'open_operations_view',
      helperTool: 'open_operations_view',
      actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
      target: { view: 'tasks', section: sections[topicIndex % sections.length], workspace_key: 'bna' },
    };
  }
  if (roleKey === 'parent_qa_identity') return { intent: 'parent_portal', target: { route: '/parent' } };
  if (roleKey === 'student_qa_identity') return { intent: 'student_portal', target: { route: '/student' } };
  if (roleKey === 'rabbi_provider_admin' || roleKey === 'provider_participant_staff') return { intent: 'provider_portal', target: { route: '/provider' } };
  if (roleKey === 'one_time_member') return { intent: 'member_library', target: { route: '/rabbi-member' } };
  if (roleKey === 'one_time_classroom') return { intent: 'one_time_classroom', target: { route: '/one-time-classroom' } };
  return { intent: 'public_route', target: { route: topicIndex % 2 ? '/service-providers' : '/' } };
}

function buildConversationCasesForRole(roleKey) {
  const role = contextForRole(roleKey);
  return ROLE_PROMPT_TOPICS.map((topic, index) => {
    const target = targetForRole(roleKey, index);
    return {
      case_id: `${roleKey}-single-${String(index + 1).padStart(2, '0')}`,
      role_key: roleKey,
      role_label: role.label || role.key || roleKey,
      conversation_type: 'single_turn',
      topic,
      user_message: `Please help me with a ${topic} as ${role.label || roleKey}. Use the correct portal scope and do not invent links.`,
      expected_behavior: 'Helper answers in scope, uses canonical route/action resolver for internal links, and records typed action proof for any claimed write.',
      resolver_input: {
        intent: target.intent,
        actor: roleActor(roleKey),
        target: target.target,
        helperTool: target.helperTool,
        actionKey: target.actionKey,
        expected_ok: true,
      },
    };
  });
}

function buildMultiTurnCasesForRole(roleKey) {
  return Array.from({ length: 10 }, (_unused, index) => {
    const target = targetForRole(roleKey, index);
    return {
      case_id: `${roleKey}-multi-${String(index + 1).padStart(2, '0')}`,
      role_key: roleKey,
      conversation_type: 'multi_turn',
      turns: [
        { role: 'user', body: 'I am not sure where this is. Can you point me in the right place?' },
        { role: 'assistant_expected', body: 'Ask one clarifying question or choose a safe route from current scope.' },
        { role: 'user', body: `Actually I mean the ${ROLE_PROMPT_TOPICS[index]} area. Follow the link and verify it.` },
        { role: 'assistant_expected', body: 'Use canonical route/action resolver, follow/verify route, and state PASS/FAIL with evidence.' },
      ],
      resolver_input: {
        intent: target.intent,
        actor: roleActor(roleKey),
        target: target.target,
        helperTool: target.helperTool,
        actionKey: target.actionKey,
        expected_ok: true,
      },
    };
  });
}

function buildConversationLibrary() {
  const roles = portalRoleKeys();
  const cases = roles.flatMap(buildConversationCasesForRole);
  const multi_turn = roles.flatMap(buildMultiTurnCasesForRole);
  return {
    roles,
    single_turn_per_role: Object.fromEntries(roles.map((role) => [role, cases.filter((item) => item.role_key === role).length])),
    multi_turn_per_role: Object.fromEntries(roles.map((role) => [role, multi_turn.filter((item) => item.role_key === role).length])),
    cases,
    multi_turn,
  };
}

function evaluateConversationLibrary(library = buildConversationLibrary()) {
  const registry = buildToolRegistry();
  const evaluated = [...library.cases, ...library.multi_turn].map((item) => {
    const resolverInput = item.resolver_input || {};
    const resolver = resolveHelperDestination(resolverInput);
    const plan = deterministicPlan(
      item.user_message || item.turns?.map((turn) => turn.body).join(' ') || '',
      registry,
      {
        userRole: resolverInput.actor?.role || 'guest',
        workspaceKey: resolverInput.actor?.workspace_key || 'bna',
        projectKey: resolverInput.actor?.project_key || 'bna',
        identity: resolverInput.actor || {},
      }
    );
    return {
      case_id: item.case_id,
      role_key: item.role_key,
      conversation_type: item.conversation_type,
      route_grounded: Boolean(resolver.ok && resolver.route_key && resolver.canonical_path && resolver.authorization_result),
      resolver,
      planned_tool: plan.actions?.[0]?.tool || null,
      planner: plan.planner,
      status: resolver.ok ? 'pass_static_resolver' : 'needs_repair',
    };
  });
  return {
    total: evaluated.length,
    passed_static_resolver: evaluated.filter((item) => item.status === 'pass_static_resolver').length,
    needs_repair: evaluated.filter((item) => item.status !== 'pass_static_resolver'),
    evaluated,
  };
}

function buildIssue24HelperAudit() {
  const library = buildConversationLibrary();
  const evaluation = evaluateConversationLibrary(library);
  return {
    audit_id: ISSUE_24_HELPER_AUDIT_ID,
    generated_at: new Date().toISOString(),
    source_raw_id: 'RAW-20260625-024',
    parent_goal_id: 'PARENT-20260625-024',
    scope_note: 'Static contract, prompt-pack, planner, and canonical route/action resolver evaluation. Live Agent Mode browser clicking and screenshot evidence are a separate release gate.',
    surfaces: HELPER_SURFACES,
    conversation_library: library,
    evaluation,
    acceptance_summary: {
      helper_surfaces_inventoried: HELPER_SURFACES.length,
      portal_roles_with_25_cases: Object.values(library.single_turn_per_role).filter((count) => count >= 25).length,
      portal_roles_with_10_multi_turn: Object.values(library.multi_turn_per_role).filter((count) => count >= 10).length,
      static_resolver_pass_rate: `${evaluation.passed_static_resolver}/${evaluation.total}`,
      live_agent_mode_required: true,
    },
  };
}

module.exports = {
  HELPER_SURFACES,
  ISSUE_24_HELPER_AUDIT_ID,
  buildConversationLibrary,
  buildIssue24HelperAudit,
  evaluateConversationLibrary,
  portalRoleKeys,
};
