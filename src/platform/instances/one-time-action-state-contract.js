const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';

const STATE_KEYS = Object.freeze({
  READY: 'ready',
  PREVIEW_ONLY: 'preview_only',
  NEEDS_RABBI_DECISION: 'needs_rabbi_decision',
  NEEDS_SHLOIMIE_SETUP: 'needs_shloimie_setup',
  BLOCKED_EXTERNAL_SETUP: 'blocked_external_setup',
  INTERNAL_SUPPORT_ONLY: 'internal_support_only',
});

const ONE_TIME_ACTION_STATES = Object.freeze({
  READY: Object.freeze({
    key: STATE_KEYS.READY,
    label: 'Ready',
    description: 'The control can run now inside the scoped One Time workspace contract.',
    disabled: false,
    hideable_from_rabbi_owner_view: false,
  }),
  PREVIEW_ONLY: Object.freeze({
    key: STATE_KEYS.PREVIEW_ONLY,
    label: 'Preview only',
    description: 'The control may show a dry run or read-only preview, but performs no production write.',
    disabled: false,
    hideable_from_rabbi_owner_view: false,
  }),
  NEEDS_RABBI_DECISION: Object.freeze({
    key: STATE_KEYS.NEEDS_RABBI_DECISION,
    label: 'Needs Rabbi decision',
    description: 'The control is held until Rabbi Elie or the named owner approves the exact gate.',
    disabled: true,
    hideable_from_rabbi_owner_view: false,
  }),
  NEEDS_SHLOIMIE_SETUP: Object.freeze({
    key: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    label: 'Needs Shloimie setup',
    description: 'The control needs operator setup, scoped configuration, or a local no-send setup path.',
    disabled: true,
    hideable_from_rabbi_owner_view: false,
  }),
  BLOCKED_EXTERNAL_SETUP: Object.freeze({
    key: STATE_KEYS.BLOCKED_EXTERNAL_SETUP,
    label: 'Blocked external setup',
    description: 'The control is blocked by account, credential, DNS, provider, billing, or external-system setup.',
    disabled: true,
    hideable_from_rabbi_owner_view: false,
  }),
  INTERNAL_SUPPORT_ONLY: Object.freeze({
    key: STATE_KEYS.INTERNAL_SUPPORT_ONLY,
    label: 'Internal support only',
    description: 'The control is for BNA support/admin use and can be hidden from Rabbi owner view.',
    disabled: false,
    hideable_from_rabbi_owner_view: true,
  }),
});

const REQUIRED_PRODUCT_ACTION_KEYS = Object.freeze([
  'one_time.workspace_user.invite_no_send',
  'one_time.workspace_user.assign_role',
  'one_time.workspace_user.lifecycle',
  'one_time.tasks.add',
  'one_time.decisions.create',
  'one_time.class_package.create',
  'one_time.classroom.assignment.create',
  'one_time.appointment.setup_task',
  'one_time.class_package.attach_vimeo',
  'one_time.class_package.preview_upload',
  'one_time.member_library.approve',
  'one_time.member_library.publish',
  'one_time.member_library.rollback',
  'one_time.recording.retry_setup',
  'one_time.classroom.thread.create',
  'one_time.classroom.message.review',
  'one_time.integrations.configure',
  'one_time.integrations.test_connection',
  'one_time.communications.create_draft',
  'one_time.agent_run.view_evidence',
  'one_time.tasks.archive_restore',
]);

const REQUIRED_REGISTRY_ACTION_KEYS = Object.freeze([
  'ACTION-OPERATIONS-HELPER-OPEN',
  'ACTION-ONETIME-WORKSPACE-VIEW',
  'ACTION-HELPER-CREATE-AUTOMATION',
  'ACTION-ONETIME-DRIVE-BRIEF-PREVIEW',
  'preview_one_time_member_library_publish_package',
  'ACTION-ONETIME-MEMBER-LIBRARY-SMOKE',
  'ACTION-ONETIME-CLASS-PACKAGE-PREVIEW',
  'ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW',
  'ACTION-ONETIME-MEMBER-LIBRARY-APPROVE',
  'ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH',
  'ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK',
  'ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN',
  'ACTION-ONETIME-LIVE-ZOOM-LINK-SEND',
  'ACTION-PARENT-ACCESS-CODE-GENERATE',
  'ACTION-PARENT-ACCESS-LINK-OPEN',
  'ACTION-PARENT-ACCESS-LINK-EMAIL',
  'ACTION-PARENT-ACCESS-LINK-WHATSAPP',
  'ACTION-PARENT-PASSWORD-SETUP-PREVIEW',
  'ACTION-PARENT-PASSWORD-SETUP-SEND',
]);

function scopedFields(overrides = {}) {
  return {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    workspace_scope: `${ONE_TIME_WORKSPACE_KEY} / ${ONE_TIME_PROJECT_KEY}`,
    ...overrides,
  };
}

function contract(fields) {
  const primaryKey = fields.action_key || fields.action_id;
  const uiState = fields.ui_state || STATE_KEYS.READY;
  const state = stateFor(uiState);
  const normalized = {
    action_key: primaryKey,
    action_id: fields.action_id || primaryKey,
    label: fields.label,
    control_label: fields.control_label || fields.label,
    category: fields.category || 'product_control',
    ui_state: uiState,
    state_label: state.label,
    click_outcome: fields.click_outcome,
    handler: fields.handler || '',
    api_route: fields.api_route || '',
    helper_route: fields.helper_route || '',
    first_party_write: Boolean(fields.first_party_write),
    external_write_action: Boolean(fields.external_write_action),
    external_write_performed: false,
    approval_gated: Boolean(fields.approval_gated),
    preview_only: uiState === STATE_KEYS.PREVIEW_ONLY || Boolean(fields.preview_only),
    internal_support_only: uiState === STATE_KEYS.INTERNAL_SUPPORT_ONLY || Boolean(fields.internal_support_only),
    hide_from_rabbi_owner_view: uiState === STATE_KEYS.INTERNAL_SUPPORT_ONLY || Boolean(fields.hide_from_rabbi_owner_view),
    disabled_blocker_message: fields.disabled_blocker_message || '',
    blocker_owner: fields.blocker_owner || '',
    confirmation_gate: fields.confirmation_gate || '',
    expected_tests: Object.freeze([...(fields.expected_tests || [])]),
    aliases: Object.freeze([...(fields.aliases || [])]),
    direct_live_action: false,
    no_send: fields.no_send !== false,
    no_charge: fields.no_charge !== false,
    no_zoom_mutation: fields.no_zoom_mutation !== false,
    no_vimeo_mutation: fields.no_vimeo_mutation !== false,
    ...scopedFields(fields.scope || {}),
  };
  return Object.freeze(normalized);
}

function stateFor(stateKey) {
  return Object.values(ONE_TIME_ACTION_STATES).find((state) => state.key === stateKey)
    || ONE_TIME_ACTION_STATES.BLOCKED_EXTERNAL_SETUP;
}

const CONTRACT_LIST = [
  contract({
    action_key: 'one_time.workspace_user.invite_no_send',
    label: 'Add Member / Invite User',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates or updates the first-party One Time person and workspace membership only; no email, WhatsApp, password reset, billing, or external invite send runs.',
    handler: 'createWorkspaceUserFromForm',
    api_route: 'POST /api/bna/workspace-users',
    first_party_write: true,
    disabled_blocker_message: 'Disabled for users without workspace_admin permission; invitation sends remain out of scope.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/workspace-user-role-management.test.js', 'tests/operations-pwa-login.test.js'],
    aliases: ['Add Member', 'Invite User'],
  }),
  contract({
    action_key: 'one_time.workspace_user.assign_role',
    label: 'Assign Role',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Updates a scoped One Time membership role/access row with server role guards; platform roles require platform super admin.',
    handler: 'updateWorkspaceUserRole',
    api_route: 'PATCH /api/bna/workspace-users/:id',
    first_party_write: true,
    disabled_blocker_message: 'Disabled when the viewer cannot change the selected role or workspace scope.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/workspace-user-role-management.test.js'],
    aliases: ['Assign Role'],
  }),
  contract({
    action_key: 'one_time.workspace_user.lifecycle',
    label: 'Deactivate / Reactivate / Remove Membership',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Runs a reversible scoped membership lifecycle update; remove stays disabled unless the user has the platform-admin gate.',
    handler: 'workspaceUserMembershipAction',
    api_route: 'PATCH /api/bna/workspace-users/:id',
    first_party_write: true,
    approval_gated: true,
    confirmation_gate: 'Platform-admin gate for remove membership; scoped role guard for deactivate/reactivate.',
    disabled_blocker_message: 'Remove membership is blocked unless platform super admin confirms the reversible archive action.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/workspace-user-role-management.test.js'],
    aliases: ['Deactivate', 'Reactivate', 'Remove Membership'],
  }),
  contract({
    action_key: 'one_time.tasks.add',
    label: 'Add Task',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates a first-party task in the selected One Time workspace/project lane only.',
    handler: 'openTaskModal -> saveTask',
    api_route: 'POST /api/bna/tasks',
    first_party_write: true,
    expected_tests: ['tests/operations-task-queue-visibility.test.js'],
    aliases: ['Add Task'],
  }),
  contract({
    action_key: 'one_time.decisions.create',
    label: 'Create Decision',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates a first-party decision task scoped to One Time with owner, blocker, and next-action fields.',
    handler: 'openDecisionModal -> saveTask',
    api_route: 'POST /api/bna/tasks',
    first_party_write: true,
    expected_tests: ['tests/operations-task-queue-visibility.test.js'],
    aliases: ['Create Decision'],
  }),
  contract({
    action_key: 'one_time.class_package.create',
    label: 'Add Class',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates a first-party One Time class package record with manual media metadata only.',
    handler: 'createOneTimeClassPackage',
    api_route: 'POST /api/bna/one-time/classes',
    first_party_write: true,
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Add Class'],
  }),
  contract({
    action_key: 'one_time.classroom.assignment.create',
    label: 'Add Session',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates an internal One Time assignment/calendar item only; no Google Calendar or Zoom meeting write runs.',
    handler: 'createOneTimeClassroomAssignment',
    api_route: 'POST /api/bna/one-time/classroom/assignments',
    first_party_write: true,
    expected_tests: ['tests/live-class-infrastructure.test.js'],
    aliases: ['Add Session', 'Create Internal Calendar Item'],
  }),
  contract({
    action_key: 'one_time.appointment.setup_task',
    label: 'Add Appointment setup',
    ui_state: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    click_outcome: 'Opens a helper/setup task for the missing appointment workflow only; no external booking, calendar, Zoom, email, WhatsApp, or payment write runs.',
    handler: 'openBnaHelperWithPrompt',
    helper_route: 'POST /api/bna/actions/run',
    disabled_blocker_message: 'Requires booking destination, policy, owner, and no-send appointment contract before becoming runnable.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/watchdog-action-registry.test.js'],
    aliases: ['Add Appointment setup'],
  }),
  contract({
    action_key: 'one_time.class_package.attach_vimeo',
    label: 'Save / Attach Vimeo Video',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Saves a manual Vimeo/hosted URL or Vimeo ID on the first-party class package only; no Vimeo upload, privacy change, delete, or publish API call runs.',
    handler: 'saveOneTimeClassPackage',
    api_route: 'PATCH /api/bna/one-time/classes/:id',
    first_party_write: true,
    no_vimeo_mutation: true,
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Save Vimeo Video', 'Attach Vimeo Video'],
  }),
  contract({
    action_key: 'one_time.class_package.preview_upload',
    label: 'Preview Upload',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Displays linked assets, readiness, and blockers with dry-run semantics; no production write, upload, publish, send, charge, Zoom, Vimeo, or Drive mutation runs.',
    handler: 'previewOneTimeClassPackage',
    api_route: 'POST /api/bna/one-time/classes/:id/package-preview',
    preview_only: true,
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Preview Upload'],
  }),
  contract({
    action_key: 'one_time.member_library.approve',
    label: 'Approve',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Records internal package approval only after the exact approval phrase; it does not publish, notify, upload, send, or charge.',
    handler: 'approveOneTimeClassLibrary',
    api_route: 'POST /api/bna/one-time/classes/:id/approve-library',
    first_party_write: true,
    approval_gated: true,
    confirmation_gate: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    disabled_blocker_message: 'Needs the exact APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING phrase and approved class package.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Member Library Approve'],
  }),
  contract({
    action_key: 'one_time.member_library.publish',
    label: 'Publish',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Publishes one member-library item only after destination, explicit member-visible tier, rollback note, and approval phrase are present; it is never a direct live action.',
    handler: 'publishOneTimeClassLibrary',
    api_route: 'POST /api/bna/one-time/classes/:id/publish-library',
    first_party_write: true,
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING plus explicit member-visible tier and rollback note.',
    disabled_blocker_message: 'Needs Rabbi destination/visibility approval, rollback owner, and APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Publish'],
  }),
  contract({
    action_key: 'one_time.member_library.rollback',
    label: 'Unpublish / Restore Latest',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Archives or restores the latest scoped member-library item only with a rollback reason; no deletion, provider mutation, send, or billing change runs.',
    handler: 'rollbackOneTimeLibraryItem',
    api_route: 'POST /api/bna/one-time/library-items/:id/rollback',
    first_party_write: true,
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING plus rollback metadata/reason.',
    disabled_blocker_message: 'Requires an existing published item and a rollback reason/owner.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Unpublish', 'Restore Latest', 'Rollback Latest'],
  }),
  contract({
    action_key: 'one_time.recording.retry_setup',
    label: 'Retry setup',
    ui_state: STATE_KEYS.INTERNAL_SUPPORT_ONLY,
    click_outcome: 'Opens an internal support prompt for retry queue review only; no duplicate recording job, Vimeo upload, Zoom fetch, Drive write, publish, or send runs.',
    handler: 'openBnaHelperWithPrompt',
    helper_route: 'POST /api/bna/actions/run',
    internal_support_only: true,
    hide_from_rabbi_owner_view: true,
    disabled_blocker_message: 'Needs source fingerprint, retry policy, and operator review before any processor rerun.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/watchdog-action-registry.test.js'],
    aliases: ['Retry setup'],
  }),
  contract({
    action_key: 'one_time.classroom.thread.create',
    label: 'Post Rabbi Thread',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates a first-party scoped classroom thread; no public forum, external notification, email, WhatsApp, Telegram, or social post runs.',
    handler: 'createOneTimeClassroomThread',
    api_route: 'POST /api/bna/one-time/classroom/threads',
    first_party_write: true,
    expected_tests: ['tests/live-class-infrastructure.test.js'],
    aliases: ['Post Rabbi Thread'],
  }),
  contract({
    action_key: 'one_time.classroom.message.review',
    label: 'Approve / Feature / Parent Hold / Reject',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Updates the first-party classroom moderation state only; public/member Q&A publication still requires its separate approval gate.',
    handler: 'reviewOneTimeClassroomMessage',
    api_route: 'POST /api/bna/one-time/classroom/messages/:id/review',
    first_party_write: true,
    disabled_blocker_message: 'Public/member question surface remains gated by APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/live-class-infrastructure.test.js'],
    aliases: ['Approve / Feature / Parent Hold / Reject', 'Feature', 'Parent Hold', 'Reject'],
  }),
  contract({
    action_key: 'one_time.integrations.configure',
    label: 'Configure Integration',
    ui_state: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    click_outcome: 'Shows or saves local readiness/setup fields only; connector credentials, DNS, Zoom, Vimeo, Resend, Railway, or external provider writes stay blocked.',
    handler: 'setSettingsLeaf / integration readiness panel',
    disabled_blocker_message: 'Needs owner-approved connector account path, credentials, and no-secret setup plan before real provider configuration.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/integrations/w4-onetime-readiness.test.js'],
    aliases: ['Configure Integration'],
  }),
  contract({
    action_key: 'one_time.integrations.test_connection',
    label: 'Test Connection',
    ui_state: STATE_KEYS.BLOCKED_EXTERNAL_SETUP,
    click_outcome: 'May become a read-only status probe after credentials exist; no live connector mutation, send, DNS, Zoom, Vimeo, or Resend write runs.',
    handler: 'testGoogleIntegrationEndpoint',
    api_route: 'GET /api/google/connections/status',
    disabled_blocker_message: 'Requires configured connector credentials and owner-approved read-only probe scope.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/google-workspace-settings-contract.test.js'],
    aliases: ['Test Connection'],
  }),
  contract({
    action_key: 'one_time.communications.create_draft',
    label: 'Create Draft',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Creates a first-party email/social draft for review only; no email send, WhatsApp send, Buffer publish, social post, or charge runs.',
    handler: 'createCommunicationEmailDraft / createCommunicationSocialDraft',
    api_route: 'POST /api/bna/communications/email/drafts or /api/bna/communications/social/drafts',
    first_party_write: true,
    expected_tests: ['tests/action-registry-telegram-ui-bot.test.js'],
    aliases: ['Create Draft'],
  }),
  contract({
    action_key: 'one_time.agent_run.view_evidence',
    label: 'View Evidence',
    ui_state: STATE_KEYS.INTERNAL_SUPPORT_ONLY,
    click_outcome: 'Opens read-only agent-run evidence for BNA support/admin review; no task mutation, deploy, send, publish, or external write runs.',
    handler: 'openAgentRun',
    api_route: 'GET /api/bna/agent-runs/:run_key',
    internal_support_only: true,
    hide_from_rabbi_owner_view: true,
    expected_tests: ['tests/agent-control-center.test.js'],
    aliases: ['View Evidence'],
  }),
  contract({
    action_key: 'one_time.tasks.archive_restore',
    label: 'Archive / Restore',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Updates first-party task lifecycle state with audit metadata only; no send, publish, delete from provider, or charge runs.',
    handler: 'archiveTaskDuplicate / taskAction',
    api_route: 'POST /api/bna/tasks/:id/actions/archive-duplicate or PATCH /api/bna/tasks/:id',
    first_party_write: true,
    disabled_blocker_message: 'Requires an explicit selected task and scoped workspace permission.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/workspace-task-no-stale-agent.test.js'],
    aliases: ['Archive', 'Restore', 'Archive / Restore'],
  }),
  contract({
    action_key: 'ACTION-OPERATIONS-HELPER-OPEN',
    action_id: 'ACTION-OPERATIONS-HELPER-OPEN',
    label: 'Ask / Search',
    category: 'registry_hook',
    ui_state: STATE_KEYS.INTERNAL_SUPPORT_ONLY,
    click_outcome: 'Opens the scoped Operations helper drawer for support/admin search and drafting; no external write or production mutation runs from opening it.',
    handler: 'openBnaHelperDrawer',
    internal_support_only: true,
    hide_from_rabbi_owner_view: true,
    expected_tests: ['npm run watchdog:actions'],
    aliases: ['Ask / Search', 'BNA Helper'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-WORKSPACE-VIEW',
    action_id: 'ACTION-ONETIME-WORKSPACE-VIEW',
    label: 'View One Time as Rabbi',
    category: 'registry_hook',
    ui_state: STATE_KEYS.READY,
    click_outcome: 'Switches the Operations workspace context into Rabbi/One Time read/write scope without mutating records or exposing unrelated workspace data.',
    handler: 'switchWorkspace',
    expected_tests: ['npm run app:smoke:operations-workspace-taxonomy'],
    aliases: ['View One Time as Rabbi'],
  }),
  contract({
    action_key: 'ACTION-HELPER-CREATE-AUTOMATION',
    action_id: 'ACTION-HELPER-CREATE-AUTOMATION',
    label: 'Create automation with helper',
    category: 'registry_hook',
    ui_state: STATE_KEYS.INTERNAL_SUPPORT_ONLY,
    click_outcome: 'Creates or stages local automation metadata only after helper confirmation; no sends, connector writes, schedules, charges, or production mutation run directly.',
    handler: 'create_automation helper action',
    helper_route: 'POST /api/bna/actions/run',
    approval_gated: true,
    confirmation_gate: 'Helper confirmation token / CONFIRM before local metadata draft.',
    internal_support_only: true,
    hide_from_rabbi_owner_view: true,
    disabled_blocker_message: 'Needs helper preview, scoped action plan, and operator confirmation before local metadata write.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/watchdog-action-registry.test.js'],
    aliases: ['Create automation with helper'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-DRIVE-BRIEF-PREVIEW',
    action_id: 'ACTION-ONETIME-DRIVE-BRIEF-PREVIEW',
    label: 'Preview Drive Brief',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Runs a no-write Drive brief preview with dry_run=true and One Time-only routing; no task creation, Drive mutation, send, publish, charge, or external write runs.',
    handler: 'previewOneTimeDriveBrief',
    api_route: 'POST /api/bna/project-meetings/one-time-drive-brief/preview',
    preview_only: true,
    expected_tests: ['tests/one-time-operations-ui-smoke.test.js', 'tests/watchdog-action-registry.test.js'],
    aliases: ['Preview Drive Brief'],
  }),
  contract({
    action_key: 'preview_one_time_member_library_publish_package',
    action_id: 'preview_one_time_member_library_publish_package',
    label: 'Package Preview',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Previews the member-library publish package, blockers, and approval requirements only; no production write, publishing, send, member visibility, upload, or external write runs.',
    handler: 'content.previewOneTimeMemberLibraryPublishPackage',
    preview_only: true,
    approval_gated: true,
    confirmation_gate: 'Preview is no-write; any later publish requires APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING.',
    expected_tests: ['tests/action-registry-telegram-ui-bot.test.js'],
    aliases: ['Package Preview'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-MEMBER-LIBRARY-SMOKE',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-SMOKE',
    label: 'Run Smoke',
    category: 'registry_hook',
    ui_state: STATE_KEYS.INTERNAL_SUPPORT_ONLY,
    click_outcome: 'Runs only the bounded internal smoke after the member-library approval phrase and rollback evidence are present; it is hideable from Rabbi owner view.',
    handler: 'runOneTimeLibrarySmoke',
    api_route: 'POST /api/bna/one-time/library-smoke',
    first_party_write: true,
    approval_gated: true,
    confirmation_gate: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    internal_support_only: true,
    hide_from_rabbi_owner_view: true,
    disabled_blocker_message: 'Needs exact smoke approval phrase, smoke item, rollback evidence, and support/admin viewer.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Run Smoke'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-CLASS-PACKAGE-PREVIEW',
    action_id: 'ACTION-ONETIME-CLASS-PACKAGE-PREVIEW',
    label: 'Preview Package',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Previews the selected class package and linked assets without publishing, sending, billing, Drive/video-host, social, Zoom, Vimeo, or CRM writes.',
    handler: 'previewOneTimeClassPackage',
    api_route: 'POST /api/bna/one-time/classes/:id/package-preview',
    preview_only: true,
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Preview Package'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW',
    label: 'Member Preview',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Shows whether the selected package would be visible for a member tier without changing member-library state or sending anything.',
    handler: 'previewOneTimeClassMember',
    api_route: 'POST /api/bna/one-time/classes/:id/member-preview',
    preview_only: true,
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Member Preview'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-MEMBER-LIBRARY-APPROVE',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-APPROVE',
    label: 'Approve',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Records internal package approval only after the exact phrase; it does not publish or notify members.',
    handler: 'approveOneTimeClassLibrary',
    api_route: 'POST /api/bna/one-time/classes/:id/approve-library',
    first_party_write: true,
    approval_gated: true,
    confirmation_gate: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    disabled_blocker_message: 'Needs approval phrase and Rabbi/package approval.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Approve'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH',
    label: 'Publish',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Publishes member-library visibility only after approval phrase, explicit destination/tier, and rollback metadata; never a direct live action.',
    handler: 'publishOneTimeClassLibrary',
    api_route: 'POST /api/bna/one-time/classes/:id/publish-library',
    first_party_write: true,
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING plus library_visibility member tier and rollback note.',
    disabled_blocker_message: 'Needs Rabbi destination, visibility, copy, smoke, and rollback decision.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Publish'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK',
    action_id: 'ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK',
    label: 'Rollback Latest',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Archives/restores the latest member-library item with rollback metadata only; no delete, provider write, send, or charge runs.',
    handler: 'rollbackOneTimeLibraryItem',
    api_route: 'POST /api/bna/one-time/library-items/:id/rollback',
    first_party_write: true,
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'Rollback action, selected item, and rollback_metadata/reason.',
    disabled_blocker_message: 'Requires existing published item plus rollback reason and owner.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/one-time-member-library.test.js'],
    aliases: ['Rollback Latest'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN',
    action_id: 'ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN',
    label: 'Dry-run send',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Calculates eligible/skipped live members with dryRun=true; no email, WhatsApp, Zoom, portal, or external send runs.',
    handler: 'sendLiveZoomLinks(sessionId, true)',
    api_route: 'POST /api/bna/live-sessions/:id/send-zoom-link',
    preview_only: true,
    expected_tests: ['tests/live-class-infrastructure.test.js'],
    aliases: ['Dry-run send'],
  }),
  contract({
    action_key: 'ACTION-ONETIME-LIVE-ZOOM-LINK-SEND',
    action_id: 'ACTION-ONETIME-LIVE-ZOOM-LINK-SEND',
    label: 'Send links',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_RABBI_DECISION,
    click_outcome: 'Sends the current Zoom link only after explicit Operations confirmation and project-scoped recipient resolution; it never bypasses the dry-run/confirm gate.',
    handler: 'sendLiveZoomLinks(sessionId, false)',
    api_route: 'POST /api/bna/live-sessions/:id/send-zoom-link',
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'Browser confirm: Send the current Zoom link to all eligible members for this session?',
    disabled_blocker_message: 'Requires dry-run review, scoped recipients, current Zoom link, and explicit send confirmation.',
    blocker_owner: 'Rabbi Elie Scheller',
    expected_tests: ['tests/live-class-infrastructure.test.js'],
    aliases: ['Send links'],
  }),
  contract({
    action_key: 'ACTION-PARENT-ACCESS-CODE-GENERATE',
    action_id: 'ACTION-PARENT-ACCESS-CODE-GENERATE',
    label: 'Generate Access Code',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    click_outcome: 'Generates or rotates one scoped parent access code only after explicit confirmation; no bulk onboarding, email, WhatsApp, or portal campaign runs.',
    handler: 'generateParentAccessCode',
    api_route: 'POST /api/bna/parent-access/code',
    first_party_write: true,
    approval_gated: true,
    confirmation_gate: 'Browser confirm: Generate or rotate this parent access code now.',
    disabled_blocker_message: 'Requires specific parent/student row and operator confirmation.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/operations-pwa-login.test.js'],
    aliases: ['Generate Access Code'],
  }),
  contract({
    action_key: 'ACTION-PARENT-ACCESS-LINK-OPEN',
    action_id: 'ACTION-PARENT-ACCESS-LINK-OPEN',
    label: 'Open Parent Portal',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Creates/opens a local short-lived parent portal preview link for the selected family only; no production write, email, WhatsApp, broadcast, or external send runs.',
    handler: 'sendParentAccessLink(channel=open)',
    api_route: 'POST /api/bna/parent-access/link',
    preview_only: true,
    expected_tests: ['tests/operations-pwa-login.test.js'],
    aliases: ['Open Parent Portal'],
  }),
  contract({
    action_key: 'ACTION-PARENT-ACCESS-LINK-EMAIL',
    action_id: 'ACTION-PARENT-ACCESS-LINK-EMAIL',
    label: 'Email Login Link',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    click_outcome: 'Sends one short-lived parent portal login link by email only after single-family confirmation; no bulk send or One Time campaign runs.',
    handler: 'sendParentAccessLink(channel=email)',
    api_route: 'POST /api/bna/parent-access/link',
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'Single-family send confirmation for channel=email.',
    disabled_blocker_message: 'Requires selected family, verified recipient, copy review, and explicit single-family email confirmation.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/operations-pwa-login.test.js'],
    aliases: ['Email Login Link'],
  }),
  contract({
    action_key: 'ACTION-PARENT-ACCESS-LINK-WHATSAPP',
    action_id: 'ACTION-PARENT-ACCESS-LINK-WHATSAPP',
    label: 'WhatsApp Login Link',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    click_outcome: 'Sends one short-lived parent portal login link by WhatsApp only after explicit confirmation and SEND_WHATSAPP server token.',
    handler: 'sendParentAccessLink(channel=whatsapp)',
    api_route: 'POST /api/bna/parent-access/link',
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'SEND_WHATSAPP plus browser confirm for the selected family.',
    disabled_blocker_message: 'Requires selected family, WhatsApp destination, copy review, and SEND_WHATSAPP confirmation.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/operations-pwa-login.test.js'],
    aliases: ['WhatsApp Login Link'],
  }),
  contract({
    action_key: 'ACTION-PARENT-PASSWORD-SETUP-PREVIEW',
    action_id: 'ACTION-PARENT-PASSWORD-SETUP-PREVIEW',
    label: 'Preview Password Setup',
    category: 'registry_hook',
    ui_state: STATE_KEYS.PREVIEW_ONLY,
    click_outcome: 'Shows a dry_run=true password setup/reset email preview for one selected parent; no email send, WhatsApp send, or account mutation runs.',
    handler: 'sendParentPasswordSetup(dryRun=true)',
    api_route: 'POST /api/bna/parent-access/password-reset',
    preview_only: true,
    expected_tests: ['tests/operations-pwa-login.test.js'],
    aliases: ['Preview Password Setup'],
  }),
  contract({
    action_key: 'ACTION-PARENT-PASSWORD-SETUP-SEND',
    action_id: 'ACTION-PARENT-PASSWORD-SETUP-SEND',
    label: 'Email Password Setup',
    category: 'registry_hook',
    ui_state: STATE_KEYS.NEEDS_SHLOIMIE_SETUP,
    click_outcome: 'Sends one password setup/reset email only after the explicit UI confirmation and SEND_PARENT_PASSWORD_SETUP server token.',
    handler: 'sendParentPasswordSetup(dryRun=false)',
    api_route: 'POST /api/bna/parent-access/password-reset',
    external_write_action: true,
    approval_gated: true,
    confirmation_gate: 'SEND_PARENT_PASSWORD_SETUP plus selected parent confirmation.',
    disabled_blocker_message: 'Requires selected parent, copy preview, and SEND_PARENT_PASSWORD_SETUP confirmation.',
    blocker_owner: 'Shloimie',
    expected_tests: ['tests/operations-pwa-login.test.js'],
    aliases: ['Email Password Setup'],
  }),
];

const ONE_TIME_BUTTON_CONTRACTS = Object.freeze(Object.fromEntries(CONTRACT_LIST.map((item) => [item.action_key, item])));

const CONTRACT_LOOKUP = new Map();
for (const item of CONTRACT_LIST) {
  const keys = [
    item.action_key,
    item.action_id,
    item.label,
    item.control_label,
    ...item.aliases,
  ].filter(Boolean);
  for (const key of keys) {
    CONTRACT_LOOKUP.set(normalizeActionKey(key), item);
  }
}

function normalizeActionKey(actionKey) {
  return String(actionKey || '').trim().toLowerCase();
}

function lookupContract(actionKey) {
  return CONTRACT_LOOKUP.get(normalizeActionKey(actionKey)) || null;
}

function hiddenForContext(item, context = {}) {
  const role = String(context.viewer_role || context.role || context.viewerRole || '').toLowerCase();
  return Boolean(item?.hide_from_rabbi_owner_view && ['rabbi_owner', 'project_owner', 'rabbi'].includes(role));
}

function getUnknownActionDisplay(actionKey) {
  return {
    action_key: String(actionKey || ''),
    action_id: String(actionKey || ''),
    label: String(actionKey || 'Unregistered One Time action'),
    ui_state: STATE_KEYS.BLOCKED_EXTERNAL_SETUP,
    state_label: ONE_TIME_ACTION_STATES.BLOCKED_EXTERNAL_SETUP.label,
    disabled: true,
    hidden: false,
    click_outcome: 'Blocked: no One Time button contract is registered, so the control must stay disabled until a contract, handler, scope, and guardrails are added.',
    handler: '',
    external_write_action: false,
    external_write_performed: false,
    disabled_blocker_message: 'No One Time button/action contract is registered for this action key.',
    blocker_owner: 'Shloimie',
    confirmation_gate: '',
    expected_tests: [],
  };
}

function getOneTimeButtonState(actionKey, context = {}) {
  const item = lookupContract(actionKey);
  if (!item) return STATE_KEYS.BLOCKED_EXTERNAL_SETUP;
  if (hiddenForContext(item, context)) return STATE_KEYS.INTERNAL_SUPPORT_ONLY;
  return item.ui_state;
}

function isOneTimeExternalWriteAction(actionKey) {
  return Boolean(lookupContract(actionKey)?.external_write_action);
}

function getOneTimeBlockedReason(actionKey, context = {}) {
  const item = lookupContract(actionKey);
  if (!item) return getUnknownActionDisplay(actionKey).disabled_blocker_message;
  if (hiddenForContext(item, context)) return 'Internal support control; hide this from Rabbi owner view.';
  if (item.disabled_blocker_message) return item.disabled_blocker_message;
  if (item.approval_gated) return `Requires gate: ${item.confirmation_gate}`;
  if (item.preview_only) return 'Preview only; no production write is performed.';
  return '';
}

function getOneTimeActionDisplay(actionKey, context = {}) {
  const item = lookupContract(actionKey);
  if (!item) return getUnknownActionDisplay(actionKey);
  const stateKey = getOneTimeButtonState(actionKey, context);
  const state = stateFor(stateKey);
  const hidden = hiddenForContext(item, context);
  return {
    action_key: item.action_key,
    action_id: item.action_id,
    label: item.label,
    control_label: item.control_label,
    category: item.category,
    ui_state: state.key,
    state_label: state.label,
    disabled: state.disabled,
    hidden,
    hide_from_rabbi_owner_view: item.hide_from_rabbi_owner_view,
    click_outcome: item.click_outcome,
    handler: item.handler,
    api_route: item.api_route,
    helper_route: item.helper_route,
    workspace_key: item.workspace_key,
    project_key: item.project_key,
    workspace_scope: item.workspace_scope,
    first_party_write: item.first_party_write,
    external_write_action: item.external_write_action,
    external_write_performed: item.external_write_performed,
    approval_gated: item.approval_gated,
    preview_only: item.preview_only,
    disabled_blocker_message: getOneTimeBlockedReason(actionKey, context),
    blocker_owner: item.blocker_owner,
    confirmation_gate: item.confirmation_gate,
    expected_tests: [...item.expected_tests],
  };
}

function registryRowsFrom(registryData) {
  if (!registryData) return [];
  if (Array.isArray(registryData)) return registryData;
  const rows = [];
  if (Array.isArray(registryData.actions)) rows.push(...registryData.actions);
  if (Array.isArray(registryData.rootRegistry?.actions)) rows.push(...registryData.rootRegistry.actions);
  if (Array.isArray(registryData.root?.actions)) rows.push(...registryData.root.actions);
  if (Array.isArray(registryData.detailedRegistry)) rows.push(...registryData.detailedRegistry);
  if (Array.isArray(registryData.detailed)) rows.push(...registryData.detailed);
  if (Array.isArray(registryData.registry_controls)) rows.push(...registryData.registry_controls);
  if (Array.isArray(registryData.controls)) rows.push(...registryData.controls);
  return rows;
}

function rowActionKey(row) {
  return row?.action_key || row?.action_id || row?.id || row?.control_id || row?.control_label || row?.label || '';
}

function rowLooksOneTimeRelevant(row) {
  const haystack = [
    row?.action_key,
    row?.action_id,
    row?.id,
    row?.label,
    row?.control_label,
    row?.surface,
    row?.route,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes('one_time')
    || haystack.includes('onetime')
    || haystack.includes('one time')
    || haystack.includes('parent-access')
    || haystack.includes('parent access')
    || haystack.includes('parent-password')
    || haystack.includes('live-zoom')
    || haystack.includes('zoom-link');
}

function assertOneTimeButtonContractCoverage(registryData) {
  const errors = [];
  const validStateKeys = new Set(Object.values(ONE_TIME_ACTION_STATES).map((state) => state.key));
  const allRequired = [...REQUIRED_PRODUCT_ACTION_KEYS, ...REQUIRED_REGISTRY_ACTION_KEYS];
  for (const requiredKey of allRequired) {
    if (!ONE_TIME_BUTTON_CONTRACTS[requiredKey]) {
      errors.push(`Missing One Time button contract for ${requiredKey}`);
    }
  }
  for (const item of CONTRACT_LIST) {
    for (const field of ['label', 'action_key', 'ui_state', 'click_outcome', 'handler', 'external_write_performed', 'expected_tests']) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        errors.push(`${item.action_key} is missing required contract field: ${field}`);
      }
    }
    if (!validStateKeys.has(item.ui_state)) errors.push(`${item.action_key} uses unknown state ${item.ui_state}`);
    if (item.preview_only && !/no (production )?write|no-write|dry[_ -]?run|without (?:changing|publishing|sending|writing)/i.test(`${item.click_outcome} ${item.disabled_blocker_message}`)) {
      errors.push(`${item.action_key} is preview-only but does not clearly say no production write.`);
    }
    if (item.external_write_action && (!item.approval_gated || !item.confirmation_gate || item.ui_state === STATE_KEYS.READY)) {
      errors.push(`${item.action_key} is an external/app-visible write action without a non-ready approval gate.`);
    }
    if (item.external_write_action && item.external_write_performed !== false) {
      errors.push(`${item.action_key} must not perform an external write directly.`);
    }
    if (item.approval_gated && !item.confirmation_gate) {
      errors.push(`${item.action_key} is approval-gated but does not name the exact gate.`);
    }
    if (item.internal_support_only && !item.hide_from_rabbi_owner_view) {
      errors.push(`${item.action_key} is internal support only but is not hideable from Rabbi owner view.`);
    }
    if (item.first_party_write && (!item.workspace_key || !item.project_key || !item.workspace_scope)) {
      errors.push(`${item.action_key} is a first-party scoped write without workspace/project scope.`);
    }
    for (const guardrailField of ['no_send', 'no_charge', 'no_zoom_mutation', 'no_vimeo_mutation']) {
      if (item[guardrailField] !== true) {
        errors.push(`${item.action_key} violates guardrail ${guardrailField}`);
      }
    }
  }

  const registryRows = registryRowsFrom(registryData);
  let registryRowsChecked = 0;
  const registryRowsWithoutContracts = [];
  for (const row of registryRows) {
    const item = lookupContract(rowActionKey(row)) || lookupContract(row.label);
    if (!item && !rowLooksOneTimeRelevant(row)) continue;
    if (!item) {
      registryRowsWithoutContracts.push(rowActionKey(row));
      continue;
    }
    registryRowsChecked += 1;
    const rowExternalWrite = row.external_write === true || row.external_write_action === true || /external_write|send|publish|rollback|smoke/i.test(String(row.classification || row.status || ''));
    const rowApprovalRequired = row.approval_required === true || /approval|gated/i.test(String(row.status || row.classification || ''));
    if (rowExternalWrite && !item.approval_gated) {
      errors.push(`Registry row ${rowActionKey(row)} is external/app-visible but the contract is not approval-gated.`);
    }
    if (rowApprovalRequired && !item.confirmation_gate) {
      errors.push(`Registry row ${rowActionKey(row)} requires approval but the contract does not name a gate.`);
    }
  }

  if (errors.length) {
    const error = new Error(`One Time button contract coverage failed:\n- ${errors.join('\n- ')}`);
    error.details = errors;
    throw error;
  }

  return {
    ok: true,
    contract_count: CONTRACT_LIST.length,
    product_controls: REQUIRED_PRODUCT_ACTION_KEYS.length,
    registry_hook_controls: REQUIRED_REGISTRY_ACTION_KEYS.length,
    registry_rows_checked: registryRowsChecked,
    registry_rows_without_contracts: registryRowsWithoutContracts,
    states: Object.values(ONE_TIME_ACTION_STATES).map((state) => state.key),
  };
}

module.exports = {
  ONE_TIME_ACTION_STATES,
  ONE_TIME_BUTTON_CONTRACTS,
  getOneTimeButtonState,
  isOneTimeExternalWriteAction,
  getOneTimeBlockedReason,
  getOneTimeActionDisplay,
  assertOneTimeButtonContractCoverage,
};
