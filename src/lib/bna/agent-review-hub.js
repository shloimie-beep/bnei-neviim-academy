const AGENT_REVIEW_RUN = {
  raw_id: 'RAW-20260625-024',
  parent_goal_id: 'PARENT-20260625-024',
  requirement_ids: [
    'REQ-20260625-026',
    'REQ-20260625-027',
    'REQ-20260625-028',
    'REQ-20260625-029',
    'REQ-20260625-030',
  ],
  issue_url: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues/24',
  hub_path: '/operations/agent-review',
  result_endpoint: '/api/bna/agent-review/results',
};

const AGENT_REVIEW_SESSION_TTL_MINUTES = 12;

const AGENT_REVIEW_CONTEXTS = [
  {
    key: 'public_visitor',
    label: 'Public Visitor',
    role: 'anonymous_public',
    workspace_key: 'public',
    project_key: 'bna_public',
    target_route: '/',
    helper_surface: 'public website helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['browse public pages', 'ask public-safe helper questions', 'verify login/setup links'],
    prohibited_actions: ['view private records', 'create internal tasks', 'use Operations APIs'],
  },
  {
    key: 'operations_super_admin',
    label: 'BNA Operations',
    role: 'super_admin',
    workspace_key: 'bna_platform',
    project_key: 'bna_school_platform',
    target_route: '/operations?view=tasks',
    helper_surface: 'Operations helper',
    context_type: 'owner_authenticated_live_read_only',
    permitted_actions: ['review tasks and evidence', 'test helper previews', 'submit review result'],
    prohibited_actions: ['deploy', 'send messages', 'charge cards', 'change credentials'],
  },
  {
    key: 'rabbi_provider_admin',
    label: 'Rabbi Provider Admin',
    role: 'workspace_owner',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/provider.html?review=one-time',
    helper_surface: 'provider/Rabbi workspace helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review One Time provider workspace', 'test provider helper', 'verify scoped links'],
    prohibited_actions: ['grant platform access', 'send WhatsApp/email', 'change billing'],
  },
  {
    key: 'provider_participant_staff',
    label: 'Provider Staff',
    role: 'provider_staff',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/provider-participant.html?review=one-time',
    helper_surface: 'provider participant helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review participant setup', 'test staff-safe support flow'],
    prohibited_actions: ['view owner billing', 'edit provider admin settings', 'access unrelated providers'],
  },
  {
    key: 'parent_qa_identity',
    label: 'Parent QA',
    role: 'parent',
    workspace_key: 'bna',
    project_key: 'bna_school_platform',
    target_route: '/parent?review=agent',
    helper_surface: 'parent helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['review parent portal shell', 'test parent-safe helper answers'],
    prohibited_actions: ['view unrelated families', 'see adult internal notes', 'change student records'],
  },
  {
    key: 'student_qa_identity',
    label: 'Student QA',
    role: 'student',
    workspace_key: 'bna',
    project_key: 'bna_school_platform',
    target_route: '/student?review=agent',
    helper_surface: 'student helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['review student-safe routes', 'test student helper boundaries'],
    prohibited_actions: ['see parent-only notes', 'access other students', 'change goals without permission'],
  },
  {
    key: 'one_time_member',
    label: 'One Time Member',
    role: 'member_parent',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/rabbi-member.html?review=one-time',
    helper_surface: 'One Time member helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review member library shell', 'test membership-safe helper responses'],
    prohibited_actions: ['access BNA school records', 'change membership tier', 'see private admin notes'],
  },
  {
    key: 'one_time_classroom',
    label: 'One Time Classroom',
    role: 'classroom_member',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    helper_surface: 'One Time classroom helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review classroom/library', 'test question/support helper flow'],
    prohibited_actions: ['publish recordings', 'send notifications', 'expose raw recordings'],
  },
  {
    key: 'wrong_role_error_states',
    label: 'Wrong Role/Error States',
    role: 'negative_authorization_probe',
    workspace_key: 'mixed',
    project_key: 'mixed',
    target_route: '/operations/agent-review?negative=1',
    helper_surface: 'all helpers, negative cases',
    context_type: 'synthetic_error_probe',
    permitted_actions: ['verify 401/403 states', 'check safe fallbacks', 'record failures'],
    prohibited_actions: ['bypass auth', 'reuse tokens', 'mutate production records'],
  },
];

const AGENT_MODE_PROMPTS = [
  {
    key: 'public-login-setup',
    title: 'Public/Login/Setup Surfaces',
    context_keys: ['public_visitor', 'wrong_role_error_states'],
    requirement_id: 'REQ-20260625-027',
    focus: 'public pages, login paths, setup links, public helper safety, and logged-out behavior',
  },
  {
    key: 'operations-super-admin',
    title: 'Operations Super-Admin',
    context_keys: ['operations_super_admin'],
    requirement_id: 'REQ-20260625-027',
    focus: 'Operations helper, task/evidence lookup, safe preview actions, route landmarks, and owner-only controls',
  },
  {
    key: 'rabbi-provider-admin',
    title: 'Rabbi Scheller Provider Admin',
    context_keys: ['rabbi_provider_admin'],
    requirement_id: 'REQ-20260625-027',
    focus: 'One Time provider admin scope, provider helper links, payment/access previews, classroom setup, and no cross-workspace leakage',
  },
  {
    key: 'provider-participant-staff',
    title: 'Provider Participant/Staff',
    context_keys: ['provider_participant_staff'],
    requirement_id: 'REQ-20260625-027',
    focus: 'provider participant portal, staff-safe helper behavior, support requests, and denied owner-only actions',
  },
  {
    key: 'parent-portal',
    title: 'Parent Portal',
    context_keys: ['parent_qa_identity'],
    requirement_id: 'REQ-20260625-027',
    focus: 'parent-safe navigation, child-only visibility, parent helper answers, setup flows, and wrong-family denial',
  },
  {
    key: 'student-portal',
    title: 'Student Portal',
    context_keys: ['student_qa_identity'],
    requirement_id: 'REQ-20260625-027',
    focus: 'student-safe dashboard, no adult/private notes, helper boundaries, assignments, progress, and denied cross-student access',
  },
  {
    key: 'one-time-member-library-classroom',
    title: 'One Time Member/Library/Classroom',
    context_keys: ['one_time_member', 'one_time_classroom'],
    requirement_id: 'REQ-20260625-027',
    focus: 'member library, classroom, question/support flow, fixture-only review data, and no raw recording exposure',
  },
  {
    key: 'cross-role-wrong-permission',
    title: 'Cross-Role Wrong-Permission/Error States',
    context_keys: ['wrong_role_error_states'],
    requirement_id: 'REQ-20260625-027',
    focus: '401/403 handling, wrong-role requests, wrong-workspace requests, ambiguous names, and safe fallbacks',
  },
  {
    key: 'helper-natural-language-action-audit',
    title: 'Helper Natural-Language Action Audit',
    context_keys: AGENT_REVIEW_CONTEXTS.map((item) => item.key),
    requirement_id: 'REQ-20260625-027',
    focus: 'natural-language helper actions, link grounding, typed audits, unsupported actions, and readback proof',
  },
  {
    key: 'navigation-ia-duplicate-control-audit',
    title: 'Navigation IA/Duplicate-Control Audit',
    context_keys: AGENT_REVIEW_CONTEXTS.map((item) => item.key),
    requirement_id: 'REQ-20260625-029',
    focus: 'side navigation, horizontal tabs, filters, duplicate controls, selected states, and mobile overflow',
  },
  {
    key: 'final-regression-pass',
    title: 'Final Regression Pass',
    context_keys: AGENT_REVIEW_CONTEXTS.map((item) => item.key),
    requirement_id: 'REQ-20260625-030',
    focus: 'complete Issue #24 acceptance gates, prompt pack links, result drop-off, newest recording trace, helper reachability, and live smoke evidence',
  },
];

function normalizeBaseUrl(baseUrl = '') {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

function absoluteUrl(baseUrl, route) {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized ? `${normalized}${route}` : route;
}

function contextByKey(key) {
  return AGENT_REVIEW_CONTEXTS.find((item) => item.key === key) || null;
}

function promptFileName(prompt) {
  return `${prompt.key}.md`;
}

function promptPublicPath(prompt) {
  return `/agent-review-prompts/${promptFileName(prompt)}`;
}

function buildAgentReviewContexts({ baseUrl = '', newestRecordingTrace = null } = {}) {
  return AGENT_REVIEW_CONTEXTS.map((context) => ({
    ...context,
    target_url: absoluteUrl(baseUrl, context.target_route),
    session_ttl_minutes: AGENT_REVIEW_SESSION_TTL_MINUTES,
    newest_recording_trace: newestRecordingTrace ? {
      status: newestRecordingTrace.status || newestRecordingTrace.verdict?.status || 'UNKNOWN',
      selected_job: newestRecordingTrace.selected_job || newestRecordingTrace.selection?.selected_job?.job_ref || null,
      selected_drive_file: newestRecordingTrace.selected_drive_file || newestRecordingTrace.selection?.selected_file?.id_ref?.redacted || null,
      evidence_path: newestRecordingTrace.evidence_path || null,
    } : null,
  }));
}

function buildPromptIndex({ baseUrl = '' } = {}) {
  return AGENT_MODE_PROMPTS.map((prompt) => ({
    ...prompt,
    file: promptFileName(prompt),
    path: promptPublicPath(prompt),
    url: absoluteUrl(baseUrl, promptPublicPath(prompt)),
  }));
}

function renderAgentModePrompt(prompt, { baseUrl = '', generatedAt = new Date().toISOString() } = {}) {
  const contexts = prompt.context_keys.map(contextByKey).filter(Boolean);
  const hubUrl = absoluteUrl(baseUrl, AGENT_REVIEW_RUN.hub_path);
  const resultUrl = absoluteUrl(baseUrl, AGENT_REVIEW_RUN.result_endpoint);
  return [
    `# Agent Mode Prompt - ${prompt.title}`,
    '',
    `Generated: ${generatedAt}`,
    `Source issue: ${AGENT_REVIEW_RUN.issue_url}`,
    `Raw/source ID: ${AGENT_REVIEW_RUN.raw_id}`,
    `Parent goal: ${AGENT_REVIEW_RUN.parent_goal_id}`,
    `Primary requirement: ${prompt.requirement_id}`,
    '',
    '## Start',
    '',
    `Open the Agent Review Hub: ${hubUrl}`,
    '',
    'Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.',
    '',
    '## Review Contexts',
    '',
    ...contexts.flatMap((context) => [
      `- ${context.label}: role ${context.role}, workspace ${context.workspace_key}, project ${context.project_key}, route ${context.target_route}, helper ${context.helper_surface}.`,
    ]),
    '',
    '## Work To Perform',
    '',
    `Focus: ${prompt.focus}.`,
    '',
    '1. Open each listed review context from the hub.',
    '2. Confirm the visible "Reviewing as" banner, role, workspace/project, expiry, and Exit control.',
    '3. Converse naturally with the scoped helper using paraphrases, typos, follow-ups, and corrections.',
    '4. Follow every internal link returned by the helper and verify route, section/tab, role, workspace, project, expected landmark, authorization result, and safe fallback.',
    '5. Test safe preview actions only. Do not send, publish, charge, deploy, change DNS, rotate credentials, move Drive files, retry production workers, or mutate student data.',
    '6. For any claimed write, verify the typed action/audit/result record. If no record exists, mark the claim failed.',
    '7. Include the newest Drive recording trace status from the hub; do not claim the recording processed beyond the trace evidence.',
    '8. Submit the structured result through the hub control or typed result API.',
    '',
    '## Result Shape',
    '',
    `Submit to: ${resultUrl}`,
    '',
    '```json',
    JSON.stringify({
      raw_id: AGENT_REVIEW_RUN.raw_id,
      parent_goal_id: AGENT_REVIEW_RUN.parent_goal_id,
      requirement_id: prompt.requirement_id,
      prompt_key: prompt.key,
      status: 'pass|fail|blocked',
      role_workspace: 'role/workspace tested',
      conversation_summary: 'brief summary, no private transcript body',
      routes_visited: ['canonical route keys and paths'],
      helper_responses: ['short redacted summaries only'],
      link_action_outcomes: ['PASS/FAIL per link/action'],
      evidence: ['screenshot path or DOM/readback evidence, redacted'],
      severity: 'none|low|medium|high|critical',
      suggested_correction: 'exact repair or none',
      idempotency_key: `${prompt.key}:<agent-run-id-or-timestamp>`,
    }, null, 2),
    '```',
    '',
    'End with PASS, FAIL, or BLOCKED and the exact remaining issue.',
    '',
  ].join('\n');
}

function normalizeAgentReviewResultStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['pass', 'passed', 'ok', 'success'].includes(normalized)) return 'pass';
  if (['fail', 'failed', 'failure'].includes(normalized)) return 'fail';
  if (['blocked', 'blocker'].includes(normalized)) return 'blocked';
  return 'needs_review';
}

module.exports = {
  AGENT_MODE_PROMPTS,
  AGENT_REVIEW_CONTEXTS,
  AGENT_REVIEW_RUN,
  AGENT_REVIEW_SESSION_TTL_MINUTES,
  buildAgentReviewContexts,
  buildPromptIndex,
  contextByKey,
  normalizeAgentReviewResultStatus,
  promptFileName,
  promptPublicPath,
  renderAgentModePrompt,
};
