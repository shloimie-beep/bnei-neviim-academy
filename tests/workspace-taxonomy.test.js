const assert = require('assert');
const test = require('node:test');

const {
  CANONICAL_WORKSPACES,
  compatibilityMigrationPlan,
  legacyRuntimeProjectKey,
  legacyRuntimeWorkspaceKey,
  resolveProjectKey,
  resolveRole,
  resolveWorkspaceKey,
  ticketRoutingPayload,
  workspaceTaxonomyPayload,
} = require('../src/lib/bna/workspace-taxonomy');
const {
  WORKSPACES,
  ROLES,
  normalizeRole,
  normalizeWorkspace,
} = require('../src/lib/actions/types');

test('workspace taxonomy resolves canonical keys and required aliases', () => {
  assert.equal(CANONICAL_WORKSPACES.platform_control.label, 'Super Admin');
  assert.equal(resolveWorkspaceKey('bna_platform'), 'platform_control');
  assert.equal(resolveWorkspaceKey('bna_school_platform'), 'bna_school');
  assert.equal(resolveWorkspaceKey('bna'), 'bna_school');
  assert.equal(resolveWorkspaceKey('rabbi_sheller_provider'), 'one_time');
  assert.equal(resolveWorkspaceKey('one_time_mishnah_class'), 'one_time');
  assert.equal(resolveProjectKey('one_time_mishnah_class'), 'one_time_mishnayos');
  assert.equal(resolveRole('super_admin'), 'platform_super_admin');
});

test('legacy runtime aliases are available without destructive database rename', () => {
  assert.equal(legacyRuntimeWorkspaceKey('platform_control'), 'platform');
  assert.equal(legacyRuntimeWorkspaceKey('bna_school'), 'bna');
  assert.equal(legacyRuntimeWorkspaceKey('one_time'), 'rabbi_sheller_provider');
  assert.equal(legacyRuntimeProjectKey('one_time_mishnayos'), 'one_time_mishnah_class');
  const plan = compatibilityMigrationPlan();
  assert.equal(plan.destructive_database_rename, false);
  assert.match(plan.strategy.join('\n'), /compatibility resolver/);
});

test('action framework normalizers use canonical workspace and role keys', () => {
  assert.equal(WORKSPACES.PLATFORM, 'platform_control');
  assert.equal(WORKSPACES.BNA, 'bna_school');
  assert.equal(WORKSPACES.RABBI_SHELLER_PROVIDER, 'one_time');
  assert.equal(ROLES.SUPER_ADMIN, 'platform_super_admin');
  assert.equal(normalizeWorkspace('rabbi_sheller_provider'), 'one_time');
  assert.equal(normalizeWorkspace('bna'), 'bna_school');
  assert.equal(normalizeRole('owner'), 'platform_super_admin');
});

test('ticket routing separates live questions, business conversations, and technical tickets', () => {
  const routing = ticketRoutingPayload().records;
  assert.equal(routing.live_class_question.owner, 'one_time');
  assert.equal(routing.live_class_question.support_ticket, false);
  assert.deepEqual(routing.live_class_question.statuses, [
    'submitted',
    'selected',
    'student_ready',
    'live',
    'answered',
    'approved_for_board',
    'kept_private',
    'rejected',
  ]);
  assert.equal(routing.business_conversation.owner, 'highlevel');
  assert.equal(routing.business_conversation.duplicate_to_bna_by_default, false);
  assert.equal(routing.technical_ticket.owner, 'platform_control');
  assert.deepEqual(routing.technical_ticket.source_workspaces, ['bna_school', 'one_time']);
  assert.equal(routing.technical_ticket.bna_school_owns_one_time_tickets, false);
  assert.equal(routing.technical_ticket.one_time_operates_without_platform_ticket_system, true);
});

test('taxonomy payload exposes canonical labels without confusing platform-as-BNA naming', () => {
  const payload = workspaceTaxonomyPayload();
  const labels = payload.workspaces.map((workspace) => workspace.label);
  assert.deepEqual(labels, ['Super Admin', 'BNA', 'One Time']);
  assert.equal(payload.aliases.workspaces.bna_platform, 'platform_control');
  assert.equal(payload.aliases.projects.one_time_mishnah_class, 'one_time_mishnayos');
});
