const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const styles = fs.readFileSync('public/css/bna-app-shell.css', 'utf8');

function functionBlock(name) {
  const start = operations.indexOf(`function ${name}`);
  assert.ok(start >= 0, `missing function ${name}`);
  const next = operations.indexOf('\n        function ', start + 1);
  return operations.slice(start, next > start ? next : operations.length);
}

test('dashboard uses one compact context strip and keeps alert cards out of overview', () => {
  const dashboard = functionBlock('renderDashboard()');
  assert.match(operations, /function renderDashboardCompactHeader\(\)/);
  assert.match(dashboard, /renderDashboardCompactHeader\(\)/);
  assert.match(operations, /class="dashboard-compact-strip"/);
  assert.match(operations, /class="status-chip-row compact-context-pills"/);
  assert.match(dashboard, /section === 'alerts' \? `[\s\S]*renderMetricButton\(item\.label, item\.value, item\.note, item\.target\)/);
  assert.match(dashboard, /section === 'overview' \? renderOperationsCommandCenter\(\) : ''/);
  assert.doesNotMatch(dashboard, /section === 'overview' \? `[\s\S]*alerts\.map/);
  assert.match(styles, /dashboard-compact-strip/);
  assert.match(styles, /compact-context-pills/);
});

test('settings category pages use compact leaf tabs instead of open-button cards', () => {
  const overview = functionBlock('renderSettingsCategoryOverview(category)');
  assert.match(overview, /data-settings-compact-navigation/);
  assert.match(overview, /class="settings-leaf-tab"/);
  assert.match(overview, /role="tablist"/);
  assert.match(overview, /role="tab"/);
  assert.match(overview, /setSettingsLeaf\('\$\{child\.id\}'\)/);
  assert.doesNotMatch(overview, /renderSettingsControlRow[\s\S]*Open/);
  assert.match(styles, /settings-leaf-tabs/);
  assert.match(styles, /settings-leaf-tab/);
});

test('Users and Roles settings exposes user creation, role, workspace, invite, and portal reset controls', () => {
  const usersRoles = functionBlock('renderUsersRolesSettingsPanel()');
  assert.match(usersRoles, /data-users-roles-access-management/);
  assert.match(usersRoles, /Add users, assign roles\/workspaces/);
  for (const label of [
    'Add user',
    'Assign role',
    'Assign workspace',
    'Send invite/access email',
    'Reset portal access',
    'Audit invitation status',
    'Admin Users',
    'Role Matrix',
    'Portal Resets',
  ]) {
    assert.match(usersRoles, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(usersRoles, /renderAdminExternalAccessPreviewForm\(\)/);
  assert.match(usersRoles, /renderAdminAccessLinkResult\(\)/);
});

test('learning portals settings manages parent and student portal access without bulk sends', () => {
  const portals = functionBlock('renderLearningPortalAccessSettings');
  assert.match(portals, /data-learning-portal-access-management/);
  assert.match(portals, /Bulk parent emails[\s\S]*stay disabled/);
  for (const label of [
    'Send new portal email',
    'Generate student access',
    'Reset parent portal access',
    'Track people',
    'Refresh Readiness',
    'Student Access Readiness',
  ]) {
    assert.match(portals, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(operations, /settingsNeedsPortalReadiness/);
  assert.match(operations, /\['learning_portals', 'parent_portal', 'student_portal'\]/);
});

test('API usage and billing settings are role/workspace scoped and payment-provider gated', () => {
  const apiLimits = functionBlock('renderApiLimitsSettingsPanel');
  assert.match(apiLimits, /data-api-usage-limits-by-role/);
  for (const label of [
    'Super Admin view',
    'Workspace admin view',
    'Parent role limit',
    'Student role limit',
    'Provider role limit',
    'Spend / budget limits',
  ]) {
    assert.match(apiLimits, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const billing = functionBlock('renderBillingPaymentsSettingsPanel');
  assert.match(billing, /data-billing-payment-workflows/);
  for (const label of [
    'Payment links',
    'Plan/pricing status',
    'Billing workflows',
    'Payment events',
    'Integration status',
    'Accounting',
    'Payment Provider',
  ]) {
    assert.match(billing, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(billing, /live creation needs approved Stripe or Green Invoice credentials/);
});

test('Integrations settings lists real providers separately with setup, token, test, storage, and rotation policy', () => {
  const integrations = functionBlock('renderCoreIntegrationsSettingsPanel');
  const cards = functionBlock('integrationSetupCards()');
  assert.match(integrations, /data-real-integrations-setup/);
  assert.match(integrations, /data-integration-card="\$\{escapeHtml\(card\.id\)\}"/);
  for (const label of [
    'Setup instructions',
    'API key/token entry',
    'Validation/test button',
    'Encrypted storage',
    'Rotation reminder',
  ]) {
    assert.match(integrations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const provider of [
    'Resend Email Provider',
    'Buffer Social Scheduler',
    'WAPI / WhatsApp',
    'Payment Provider',
    'Google Calendar',
    'Google Classroom',
  ]) {
    assert.match(cards, new RegExp(provider.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(cards, /Dedicated email-provider setup\. Do not mix Resend with Gmail or social connectors\./);
  assert.match(cards, /Separate social scheduling integration for approved drafts\/posts\./);
  assert.match(cards, /Coming soon \/ internal-first/);
  assert.match(styles, /settings-integration-grid/);
  assert.match(styles, /settings-integration-card/);
});

test('Google Calendar and Classroom settings are marked coming soon while keeping internal-first workflow', () => {
  const calendar = functionBlock('renderGoogleCalendarSettings');
  const classroom = functionBlock('renderGoogleClassroomSettings');
  assert.match(calendar, /Coming soon \/ internal-first/);
  assert.match(calendar, /internal calendar works now/i);
  assert.match(calendar, /Internal-first status/);
  assert.match(classroom, /Coming soon \/ internal-first/);
  assert.match(classroom, /BNA Classroom is first-party and usable now/);
  assert.match(classroom, /Internal-first status/);
});

test('Automation Center exposes a helper creation path and keeps automation metadata understandable', () => {
  const center = functionBlock('renderAutomationCenter()');
  const row = functionBlock('renderAutomationRow');
  const status = functionBlock('renderAutomationStatusCell');
  const detail = functionBlock('renderAutomationDetailPanel');
  const edit = functionBlock('renderAutomationEditForm');
  assert.match(operations, /function openBnaHelperWithPrompt\(prompt = ''\)/);
  assert.match(center, /Create automation with helper/);
  assert.match(center, /name, purpose, trigger, action, workspace, enabled or disabled state, last-run evidence/);
  for (const field of [
    'Automation / Purpose / Trigger',
    'Edit',
  ]) {
    assert.match(center, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const field of [
    'Purpose',
    'Trigger',
    'Action',
    'Workspace',
    'Last run',
    'Edit / Toggle',
    'Edit / Details',
  ]) {
    assert.match(row, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(status, /Enabled/);
  assert.match(status, /Status:/);
  for (const field of [
    'Trigger',
    'Setup Blockers',
    'Schedule',
  ]) {
    assert.match(detail + edit, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const field of [
    'Status',
    'Next Run',
  ]) {
    assert.match(edit, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(center, /executeAutomation/i);
});
