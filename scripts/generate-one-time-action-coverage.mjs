#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const ROOT_REGISTRY_PATH = 'ops/action-registry.json';
const DETAIL_REGISTRY_PATH = 'ops/action-registry/actions.json';
const OUTPUT_JSON_PATH = 'ops/action-registry/one-time-action-coverage.json';
const OUTPUT_MD_PATH = 'ops/action-registry/one-time-action-coverage.md';
const REQUIREMENT_ID = 'REQ-20260621-502';

const APPROVAL_CLASSIFICATIONS = new Set(['approval_gated', 'preview_then_approve']);
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';

const LEGACY_CONTROL_COVERAGE = [
  ['Operations / Admin / Users', 'Add Member / Invite User', 'one_time.workspace_user.invite_no_send', 'working', 'createWorkspaceUserFromForm', '/api/bna/workspace-users', 'POST', 'workspace_admin', 'rabbi_sheller_provider', 'no-send first-party write', 'person and workspace membership created or updated; audit row recorded', 'inline banner from API error', '', 'tests/workspace-user-role-management.test.js'],
  ['Operations / Admin / Users', 'Assign Role', 'one_time.workspace_user.assign_role', 'working', 'updateWorkspaceUserRole', '/api/bna/workspace-users/:id', 'PATCH', 'workspace_admin', 'rabbi_sheller_provider', 'server role guard; platform roles require platform_super_admin', 'membership role/access updated; role audit row recorded', 'inline banner from API error', 'disabled for users without workspace role-change permission', 'tests/workspace-user-role-management.test.js'],
  ['Operations / Admin / Users', 'Deactivate / Reactivate / Remove Membership', 'one_time.workspace_user.lifecycle', 'working', 'workspaceUserMembershipAction', '/api/bna/workspace-users/:id', 'PATCH', 'workspace_admin', 'rabbi_sheller_provider', 'remove membership uses reversible archive action only', 'membership state updated and audited', 'inline banner from API error', 'remove membership disabled unless platform super admin', 'tests/workspace-user-role-management.test.js'],
  ['Operations / Tasks', 'Add Task', 'one_time.tasks.add', 'working', 'openTaskModal -> saveTask', '/api/bna/tasks', 'POST', 'workspace_manager', 'selected workspace; One Time when scoped', 'first-party task write', 'task appears in scoped task lane', 'alert from API error', '', 'tests/operations-task-queue-visibility.test.js'],
  ['Operations / Tasks', 'Create Decision', 'one_time.decisions.create', 'working', 'openDecisionModal -> saveTask', '/api/bna/tasks', 'POST', 'workspace_manager', 'selected workspace; One Time when scoped', 'first-party decision task write', 'decision-required task appears in Decision views', 'alert from API error', '', 'tests/operations-task-queue-visibility.test.js'],
  ['Operations / Content / One Time Library', 'Add Class', 'one_time.class_package.create', 'working', 'createOneTimeClassPackage', '/api/bna/one-time/classes', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'first-party class package write', 'class package appears in Class Package Manager', 'manager notice from API error', '', 'tests/one-time-classroom-calendar-community-bot.test.js'],
  ['Operations / Content / One Time Classroom', 'Add Session', 'one_time.classroom.assignment.create', 'working', 'createOneTimeClassroomAssignment', '/api/bna/one-time/classroom/assignments', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'first-party internal calendar item; no Google write', 'internal assignment/calendar item created', 'classroom notice from API error', '', 'tests/one-time-classroom-calendar-community-bot.test.js'],
  ['Operations / Service Providers / Schedule', 'Add Appointment setup', 'one_time.appointment.setup_task', 'setup_path', 'openBnaHelperWithPrompt', '/api/bna/actions/run', 'POST', 'workspace_admin', 'rabbi_sheller_provider', 'setup task only; no external booking write', 'Codex/helper task is prepared for missing appointment workflow', 'helper/action runner error', 'requires booking destination, policy, and no-send appointment contract', 'tests/watchdog-action-registry.test.js'],
  ['Operations / Content / One Time Library', 'Save / Attach Vimeo Video', 'one_time.class_package.attach_vimeo', 'working', 'saveOneTimeClassPackage', '/api/bna/one-time/classes/:id', 'PATCH', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'manual URL attach only; Vimeo upload remains setup-gated', 'class package stores hosted media metadata', 'manager notice from API error', '', 'tests/one-time-member-library.test.js'],
  ['Operations / Content / One Time Library', 'Preview Upload', 'one_time.class_package.preview_upload', 'working', 'previewOneTimeClassPackage', '/api/bna/one-time/classes/:id/package-preview', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'preview only; no upload, publish, or send', 'package preview displays linked assets and blockers', 'manager notice from API error', '', 'tests/one-time-member-library.test.js'],
  ['Operations / Content / One Time Library', 'Approve', 'one_time.member_library.approve', 'working', 'approveOneTimeClassLibrary', '/api/bna/one-time/classes/:id/approve-library', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'requires APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING', 'package approved internally; no notification send', 'manager notice from API error', 'approval phrase required', 'tests/one-time-member-library.test.js'],
  ['Operations / Content / One Time Library', 'Publish', 'one_time.member_library.publish', 'working_gated', 'publishOneTimeClassLibrary', '/api/bna/one-time/classes/:id/publish-library', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'requires approval phrase, destination, visibility, and rollback note', 'member-library item published and previous item archived for rollback', 'manager notice from API error', 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING and explicit member-visible tier required', 'tests/one-time-member-library.test.js'],
  ['Operations / Content / One Time Library', 'Unpublish / Restore Latest', 'one_time.member_library.rollback', 'working_gated', 'rollbackOneTimeLibraryItem', '/api/bna/one-time/library-items/:id/rollback', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'manual rollback note; member-library visibility change only', 'latest item archived or restored according to rollback path', 'manager notice from API error', 'requires existing published item and rollback reason', 'tests/one-time-member-library.test.js'],
  ['Operations / Content / Meeting Drops', 'Retry setup', 'one_time.recording.retry_setup', 'setup_path', 'openBnaHelperWithPrompt', '/api/bna/actions/run', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'setup task only; no duplicate recording job', 'retry/dead-letter repair prompt is created', 'helper/action runner error', 'requires source fingerprint and retry policy before processor rerun', 'tests/one-time-action-coverage.test.js'],
  ['Operations / Content / One Time Classroom', 'Post Rabbi Thread', 'one_time.classroom.thread.create', 'working', 'createOneTimeClassroomThread', '/api/bna/one-time/classroom/threads', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'first-party classroom thread only; no public forum', 'thread created in scoped classroom', 'classroom notice from API error', '', 'tests/one-time-classroom-calendar-community-bot.test.js'],
  ['Operations / Content / One Time Classroom', 'Approve / Feature / Parent Hold / Reject', 'one_time.classroom.message.review', 'working', 'reviewOneTimeClassroomMessage', '/api/bna/one-time/classroom/messages/:id/review', 'POST', 'workspace_admin', 'rabbi_sheller_provider / one_time_mishnah_class', 'moderated visibility update only', 'message review state updated', 'classroom notice from API error', '', 'tests/one-time-classroom-calendar-community-bot.test.js'],
  ['Operations / Integrations', 'Configure Integration', 'one_time.integrations.configure', 'working', 'setSettingsLeaf', '', 'client', 'workspace_admin', 'rabbi_sheller_provider', 'read-only/setup fields unless connector credentials are confirmed', 'integration setup status is visible', 'inline settings error', 'external connector writes require owner approval and credentials', 'tests/integrations/w4-onetime-readiness.test.js'],
  ['Operations / Integrations', 'Test Connection', 'one_time.integrations.test_connection', 'working_gated', 'testGoogleIntegrationEndpoint', '/api/google/connections/status', 'GET', 'workspace_admin', 'rabbi_sheller_provider', 'read-only status probe; live connector actions stay gated', 'connection status displayed without secrets', 'alert from API error', 'requires configured connector for live test', 'tests/google-workspace-settings-contract.test.js'],
  ['Operations / Communications', 'Create Draft', 'one_time.communications.create_draft', 'working', 'createCommunicationEmailDraft / createCommunicationSocialDraft', '/api/bna/communications/email/drafts or /api/bna/communications/social/drafts', 'POST', 'workspace_manager', 'rabbi_sheller_provider', 'draft only; no send or publish', 'draft record created for review', 'alert from API error', '', 'tests/action-registry-telegram-ui-bot.test.js'],
  ['Operations / Agents', 'View Evidence', 'one_time.agent_run.view_evidence', 'working', 'openAgentRun', '/api/bna/agent-runs/:run_key', 'GET', 'workspace_manager', 'rabbi_sheller_provider', 'read-only evidence view', 'agent run evidence and prompt are visible', 'agent run notice from API error', '', 'tests/agent-control-center.test.js'],
  ['Operations / Tasks', 'Archive / Restore', 'one_time.tasks.archive_restore', 'working', 'archiveTaskDuplicate / taskAction', '/api/bna/tasks/:id/actions/archive-duplicate or /api/bna/tasks/:id', 'POST/PATCH', 'workspace_manager', 'selected workspace; One Time when scoped', 'first-party task lifecycle write', 'task moves to archive or active lane with audit', 'alert from API error', 'archive requires explicit clicked task', 'tests/workspace-task-no-stale-agent.test.js'],
].map(([page_module, control_label, action_key, status, client_handler, api_endpoint, http_method, required_role, workspace_scope, confirmation_level, success_state, error_state, disabled_reason, test]) => ({
  page_module,
  control_label,
  action_key,
  status,
  client_handler,
  api_endpoint,
  http_method,
  required_role,
  workspace_scope,
  confirmation_level,
  success_state,
  error_state,
  disabled_reason,
  test,
}));

export const ONE_TIME_CONTROL_COVERAGE = [
  {
    control_id: 'operations_helper_open',
    action_id: 'ACTION-OPERATIONS-HELPER-OPEN',
    registry_layer: 'root',
    surface: 'operations',
    route: '/operations',
    label: 'Ask / Search',
    classification: 'typed_action',
    risk: 'low',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-OPERATIONS-HELPER-OPEN"', 'data-bna-helper-open="true"'],
    tests: ['npm run watchdog:actions'],
  },
  {
    control_id: 'one_time_workspace_view',
    action_id: 'ACTION-ONETIME-WORKSPACE-VIEW',
    registry_layer: 'root',
    surface: 'operations',
    route: '/operations?workspace=rabbi_sheller_provider',
    label: 'View One Time as Rabbi',
    classification: 'read_only_navigation',
    risk: 'low',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-ONETIME-WORKSPACE-VIEW"', "switchWorkspace('${option.id}')"],
    tests: ['npm run app:smoke:operations-workspace-taxonomy'],
  },
  {
    control_id: 'helper_create_automation',
    action_id: 'ACTION-HELPER-CREATE-AUTOMATION',
    registry_layer: 'root',
    surface: 'operations_automation_center',
    route: '/operations?view=settings&section=automation_center',
    label: 'Create automation with helper',
    classification: 'preview_then_approve',
    risk: 'medium',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-HELPER-CREATE-AUTOMATION"', 'Create automation with helper'],
    tests: ['tests/watchdog-action-registry.test.js'],
  },
  {
    control_id: 'one_time_drive_brief_preview',
    action_id: 'ACTION-ONETIME-DRIVE-BRIEF-PREVIEW',
    registry_layer: 'root',
    surface: 'operations_content_meeting_drops',
    route: '/operations?view=content&section=meetings',
    label: 'Preview Drive Brief',
    classification: 'preview_only',
    risk: 'low',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-ONETIME-DRIVE-BRIEF-PREVIEW"', 'data-preview-one-time-drive-brief'],
    tests: ['tests/watchdog-action-registry.test.js'],
  },
  {
    control_id: 'one_time_publish_package_preview',
    action_id: 'preview_one_time_member_library_publish_package',
    registry_layer: 'detailed',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Package Preview',
    classification: 'preview_only',
    risk: 'medium',
    external_write: false,
    source_tokens: ['previewOneTimePublishPackage', 'No publishing, send, member visibility'],
    tests: ['tests/action-registry-telegram-ui-bot.test.js'],
  },
  {
    control_id: 'one_time_member_library_smoke',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-SMOKE',
    registry_layer: 'root',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Run Smoke',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING'],
    source_tokens: ['data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-SMOKE"', 'runOneTimeLibrarySmoke(event)'],
    tests: ['tests/one-time-member-library.test.js'],
  },
  {
    control_id: 'one_time_class_package_preview',
    action_id: 'ACTION-ONETIME-CLASS-PACKAGE-PREVIEW',
    registry_layer: 'root',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Preview Package',
    classification: 'preview_only',
    risk: 'low',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-ONETIME-CLASS-PACKAGE-PREVIEW"', 'previewOneTimeClassPackage(event'],
    tests: ['tests/one-time-member-library.test.js'],
  },
  {
    control_id: 'one_time_member_visibility_preview',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW',
    registry_layer: 'root',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Member Preview',
    classification: 'preview_only',
    risk: 'low',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW"', 'previewOneTimeClassMember(event'],
    tests: ['tests/one-time-member-library.test.js'],
  },
  {
    control_id: 'one_time_member_library_approve',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-APPROVE',
    registry_layer: 'root',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Approve',
    classification: 'approval_gated',
    risk: 'high',
    external_write: false,
    gate_tokens: ['APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING'],
    source_tokens: ['data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-APPROVE"', 'approveOneTimeClassLibrary(event'],
    tests: ['tests/one-time-member-library.test.js'],
  },
  {
    control_id: 'one_time_member_library_publish',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH',
    registry_layer: 'root',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Publish',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING', 'library_visibility must be an explicit member-visible tier'],
    source_tokens: ['data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH"', 'publishOneTimeClassLibrary(event'],
    tests: ['tests/one-time-member-library.test.js'],
  },
  {
    control_id: 'one_time_member_library_rollback',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK',
    registry_layer: 'root',
    surface: 'operations_content_one_time_library',
    route: '/operations?view=content&section=one_time_library',
    label: 'Rollback Latest',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['rollbackOneTimeLibraryItem', 'rollback_metadata'],
    source_tokens: ['data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK"', 'rollbackOneTimeLibraryItem(event'],
    tests: ['tests/one-time-member-library.test.js'],
  },
  {
    control_id: 'one_time_live_zoom_dry_run',
    action_id: 'ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN',
    registry_layer: 'root',
    surface: 'operations_live_classes',
    route: '/operations?view=live_classes',
    label: 'Dry-run send',
    classification: 'preview_only',
    risk: 'medium',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN"', 'sendLiveZoomLinks(${Number(session.id)}, true)'],
    tests: ['tests/live-class-infrastructure.test.js'],
  },
  {
    control_id: 'one_time_live_zoom_send',
    action_id: 'ACTION-ONETIME-LIVE-ZOOM-LINK-SEND',
    registry_layer: 'root',
    surface: 'operations_live_classes',
    route: '/operations?view=live_classes',
    label: 'Send links',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['Send the current Zoom link to all eligible members', 'dryRun=false'],
    source_tokens: ['data-action-id="ACTION-ONETIME-LIVE-ZOOM-LINK-SEND"', 'sendLiveZoomLinks(${Number(session.id)}, false)'],
    tests: ['tests/live-class-infrastructure.test.js'],
  },
  {
    control_id: 'parent_access_code_generate',
    action_id: 'ACTION-PARENT-ACCESS-CODE-GENERATE',
    registry_layer: 'root',
    surface: 'operations_parent_access',
    route: '/operations?view=students',
    label: 'Generate Access Code',
    classification: 'approval_gated',
    risk: 'high',
    external_write: false,
    gate_tokens: ['Generate or rotate this parent access code now'],
    source_tokens: ['data-action-id="ACTION-PARENT-ACCESS-CODE-GENERATE"', 'generateParentAccessCode(event'],
    tests: ['tests/operations-pwa-login.test.js'],
  },
  {
    control_id: 'parent_access_link_open',
    action_id: 'ACTION-PARENT-ACCESS-LINK-OPEN',
    registry_layer: 'root',
    surface: 'operations_parent_access',
    route: '/operations?view=students',
    label: 'Open Parent Portal',
    classification: 'deep_link_only',
    risk: 'medium',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-PARENT-ACCESS-LINK-OPEN"', "channel === 'open'"],
    tests: ['tests/operations-pwa-login.test.js'],
  },
  {
    control_id: 'parent_access_link_email',
    action_id: 'ACTION-PARENT-ACCESS-LINK-EMAIL',
    registry_layer: 'root',
    surface: 'operations_parent_access',
    route: '/operations?view=students',
    label: 'Email Login Link',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['single-family send', "send_email: channel === 'email'"],
    source_tokens: ['data-action-id="ACTION-PARENT-ACCESS-LINK-EMAIL"', "channel === 'email'"],
    tests: ['tests/operations-pwa-login.test.js'],
  },
  {
    control_id: 'parent_access_link_whatsapp',
    action_id: 'ACTION-PARENT-ACCESS-LINK-WHATSAPP',
    registry_layer: 'root',
    surface: 'operations_parent_access',
    route: '/operations?view=students',
    label: 'WhatsApp Login Link',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['SEND_WHATSAPP', 'Send this short-lived parent portal login link by WhatsApp now'],
    source_tokens: ['data-action-id="ACTION-PARENT-ACCESS-LINK-WHATSAPP"', "channel === 'whatsapp'"],
    tests: ['tests/operations-pwa-login.test.js'],
  },
  {
    control_id: 'parent_password_setup_preview',
    action_id: 'ACTION-PARENT-PASSWORD-SETUP-PREVIEW',
    registry_layer: 'root',
    surface: 'operations_parent_access',
    route: '/operations?view=students',
    label: 'Preview Password Setup',
    classification: 'preview_only',
    risk: 'medium',
    external_write: false,
    source_tokens: ['data-action-id="ACTION-PARENT-PASSWORD-SETUP-PREVIEW"', 'dry_run: Boolean(dryRun)'],
    tests: ['tests/operations-pwa-login.test.js'],
  },
  {
    control_id: 'parent_password_setup_send',
    action_id: 'ACTION-PARENT-PASSWORD-SETUP-SEND',
    registry_layer: 'root',
    surface: 'operations_parent_access',
    route: '/operations?view=students',
    label: 'Email Password Setup',
    classification: 'approval_gated',
    risk: 'high',
    external_write: true,
    gate_tokens: ['SEND_PARENT_PASSWORD_SETUP', 'Email this parent a password setup/reset link now'],
    source_tokens: ['data-action-id="ACTION-PARENT-PASSWORD-SETUP-SEND"', 'sendParentPasswordSetup(event'],
    tests: ['tests/operations-pwa-login.test.js'],
  },
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(readText(relativePath));
  } catch {
    return fallback;
  }
}

function writeText(relativePath, text) {
  fs.mkdirSync(path.dirname(absolute(relativePath)), { recursive: true });
  fs.writeFileSync(absolute(relativePath), text);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function rootActionRows(rootRegistry) {
  return Array.isArray(rootRegistry?.actions) ? rootRegistry.actions : [];
}

function normalizeRootAction(action) {
  return {
    action_id: action.action_id,
    label: action.label,
    route: action.route,
    permission: action.permission,
    status: action.status,
    approval_required: /approval|gated/i.test(String(action.status || '')),
    dry_run_supported: /preview|dry-run|no-write|dry run/i.test(`${action.status || ''} ${action.expected_behavior || ''} ${action.test?.expected_result || ''}`),
    execution_handler: action.handler || action.api_route || action.helper_tool || action.expected_behavior || '',
    registry_layer: 'root',
  };
}

function normalizeDetailedAction(action) {
  return {
    action_id: action.action_id,
    label: action.label,
    route: Array.isArray(action.related_routes) ? action.related_routes[0] : '',
    permission: Array.isArray(action.allowed_roles) ? action.allowed_roles.join('/') : '',
    status: action.approval_required ? 'approval_gated' : 'active',
    approval_required: Boolean(action.approval_required),
    dry_run_supported: Boolean(action.dry_run_supported),
    execution_handler: action.execution_handler || '',
    registry_layer: 'detailed',
  };
}

function buildActionMap(rootRegistry, detailedRegistry) {
  const map = new Map();
  rootActionRows(rootRegistry).forEach((action) => map.set(action.action_id, normalizeRootAction(action)));
  (Array.isArray(detailedRegistry) ? detailedRegistry : []).forEach((action) => {
    if (action?.action_id) map.set(action.action_id, normalizeDetailedAction(action));
  });
  return map;
}

function sourceBundle() {
  const paths = ['public/operations.html', 'server.js', ROOT_REGISTRY_PATH, DETAIL_REGISTRY_PATH];
  const files = {};
  for (const relativePath of paths) files[relativePath] = readText(relativePath);
  return files;
}

function tokenIsPresent(files, token) {
  return Object.values(files).some((text) => text.includes(token));
}

function rowForControl(control, actionMap, files) {
  const action = actionMap.get(control.action_id) || null;
  const missingSourceTokens = (control.source_tokens || []).filter((token) => !tokenIsPresent(files, token));
  const missingGateTokens = (control.gate_tokens || []).filter((token) => !tokenIsPresent(files, token));
  const registered = Boolean(action);
  const approvalSafe = !control.external_write
    || APPROVAL_CLASSIFICATIONS.has(control.classification)
    || Boolean(action?.approval_required);
  const hasHandler = Boolean(action?.execution_handler);
  const ok = registered && hasHandler && !missingSourceTokens.length && !missingGateTokens.length && approvalSafe;
  const status = ok ? 'covered' : 'needs_repair';
  return {
    ...control,
    status,
    registered,
    action_status: action?.status || '',
    permission: action?.permission || '',
    dry_run_supported: Boolean(action?.dry_run_supported),
    approval_required: Boolean(action?.approval_required || APPROVAL_CLASSIFICATIONS.has(control.classification)),
    execution_handler: action?.execution_handler || '',
    missing_source_tokens: missingSourceTokens,
    missing_gate_tokens: missingGateTokens,
    approval_safe: approvalSafe,
  };
}

function renderMarkdown(report) {
  const lines = [
    '# One Time Action Coverage',
    '',
    `Generated at ${report.generated_at}.`,
    '',
    `Scope: \`${report.workspace_key}\` / \`${report.project_key}\``,
    '',
    `Requirement: ${report.requirement_id}`,
    '',
    '## Summary',
    '',
    `- Status: ${report.ok ? 'covered' : 'needs repair'}`,
    `- Product controls inventoried: ${report.summary.product_controls}`,
    `- Registry hook controls inventoried: ${report.registry_summary.controls}`,
    `- Root registry actions: ${report.summary.root_actions}`,
    `- Detailed registry actions: ${report.summary.detailed_actions}`,
    `- Registry external/app-visible write controls: ${report.registry_summary.external_write_controls}`,
    `- Registry missing/repair rows: ${report.registry_summary.needs_repair}`,
    '',
    '## Required Label Coverage',
    '',
    '| Required control | Coverage |',
    '| --- | --- |',
    ...report.controls.map((row) => `| ${String(row.control_label).replace(/\|/g, '\\|')} | \`${String(row.action_key).replace(/\|/g, '\\|')}\` |`),
    '',
    '## Registry Hook Classification Counts',
    '',
    ...Object.entries(report.registry_summary.by_classification).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Registry Hook Coverage',
    '',
    '| Status | Control | Action | Classification | Risk | Gate | Tests |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.registry_controls.map((row) => [
      row.coverage_result,
      row.label,
      row.action_id,
      row.classification,
      row.risk,
      row.approval_required ? 'approval/dry-run required' : 'direct/read-only',
      (row.tests || []).join('<br>'),
    ].map((value) => String(value || '').replace(/\|/g, '\\|')).join(' | ')).map((line) => `| ${line} |`),
  ];
  if (report.findings.length) {
    lines.push('', '## Findings', '');
    for (const finding of report.findings) lines.push(`- ${finding.control_id}: ${finding.reason}`);
  }
  return `${lines.join('\n')}\n`;
}

export function buildOneTimeActionCoverage({ write = false } = {}) {
  const rootRegistry = readJson(ROOT_REGISTRY_PATH, { actions: [] });
  const detailedRegistry = readJson(DETAIL_REGISTRY_PATH, []);
  const actionMap = buildActionMap(rootRegistry, detailedRegistry);
  const files = sourceBundle();
  const registryControls = ONE_TIME_CONTROL_COVERAGE.map((control) => rowForControl(control, actionMap, files));
  const controls = LEGACY_CONTROL_COVERAGE.map((row) => ({ ...row }));
  const findings = [];
  for (const row of registryControls) {
    if (!row.registered) findings.push({ control_id: row.control_id, reason: `Action ${row.action_id} is not registered.` });
    if (!row.execution_handler) findings.push({ control_id: row.control_id, reason: `Action ${row.action_id} has no execution behavior recorded.` });
    if (row.missing_source_tokens.length) findings.push({ control_id: row.control_id, reason: `Missing source tokens: ${row.missing_source_tokens.join(', ')}` });
    if (row.missing_gate_tokens.length) findings.push({ control_id: row.control_id, reason: `Missing gate tokens: ${row.missing_gate_tokens.join(', ')}` });
    if (!row.approval_safe) findings.push({ control_id: row.control_id, reason: 'External/app-visible write is not approval-gated.' });
  }
  const sourceHashes = Object.fromEntries(Object.entries(files).map(([file, text]) => [file, sha256(text)]));
  for (const row of registryControls) row.coverage_result = row.status;
  const summary = {
    controls: controls.length + registryControls.length,
    product_controls: controls.length,
    root_actions: rootActionRows(rootRegistry).length,
    detailed_actions: Array.isArray(detailedRegistry) ? detailedRegistry.length : 0,
    external_write_controls: registryControls.filter((row) => row.external_write).length,
    approval_gated_controls: registryControls.filter((row) => row.approval_required).length,
    needs_repair: registryControls.filter((row) => row.coverage_result !== 'covered').length,
    by_classification: countBy(registryControls, 'classification'),
    by_surface: countBy(registryControls, 'surface'),
  };
  const registrySummary = {
    controls: registryControls.length,
    external_write_controls: registryControls.filter((row) => row.external_write).length,
    approval_gated_controls: registryControls.filter((row) => row.approval_required).length,
    needs_repair: registryControls.filter((row) => row.coverage_result !== 'covered').length,
    by_classification: countBy(registryControls, 'classification'),
    by_surface: countBy(registryControls, 'surface'),
  };
  const contentHash = sha256(JSON.stringify({ controls, registryControls, findings, sourceHashes, summary, registrySummary }));
  const report = {
    generated_at: new Date().toISOString(),
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    requirement_id: REQUIREMENT_ID,
    coverage_status: 'verified_local_pending_deploy',
    policy: 'Visible One Time actions are classified as working, setup_path, disabled_blocker, or informational. External writes stay gated unless an explicit confirmation field is listed.',
    ok: findings.length === 0,
    content_hash: contentHash,
    source_hashes: sourceHashes,
    summary,
    registry_summary: registrySummary,
    controls,
    registry_controls: registryControls,
    findings,
  };
  if (write) {
    writeText(OUTPUT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
    writeText(OUTPUT_MD_PATH, renderMarkdown(report));
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const report = buildOneTimeActionCoverage({ write: true });
  console.log(`One Time action coverage: ${report.ok ? 'ok' : 'needs repair'} (${report.summary.controls} controls)`);
  if (!report.ok) process.exitCode = 1;
}
