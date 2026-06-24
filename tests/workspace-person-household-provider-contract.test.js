const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const parentHtml = fs.readFileSync(path.join(root, 'public', 'parent.html'), 'utf8');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');
const providerJoinHtml = fs.readFileSync(path.join(root, 'public', 'providers-join.html'), 'utf8');
const providerProfileHtml = fs.readFileSync(path.join(root, 'public', 'provider-profile.html'), 'utf8');
const operationsHtml = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');

test('canonical workspace/person/household schema is bootstrapped idempotently', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_people/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_workspace_memberships/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_households/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_household_members/);
  assert.match(server, /ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS workspace_type/);
  assert.match(server, /ALTER TABLE bna_workspaces DROP CONSTRAINT IF EXISTS bna_workspaces_type_check/);
  assert.match(server, /CHECK \(type IN \('super_admin', 'school', 'family', 'service_provider', 'household', 'provider', 'project', 'community'\)\)/);
  assert.match(server, /const CANONICAL_WORKSPACE_TYPES = new Set\(\['school', 'service_provider', 'family'\]\)/);
  assert.match(server, /const WORKSPACE_CONTEXT_TYPES = new Set\(\['super_admin'\]\)/);
  assert.match(server, /const WORKSPACE_TYPE_COMPATIBILITY_ALIASES = Object\.freeze/);
  assert.match(server, /household: 'family'/);
  assert.match(server, /provider: 'service_provider'/);
  assert.match(server, /\{ id: 'service_provider', label: 'Service Provider'/);
  assert.match(server, /\{ id: 'family', label: 'Family'/);
  assert.match(server, /role_label: workspaceDirectoryRoleLabel/);
  assert.match(server, /scope_label: workspaceDirectoryScopeLabel/);
  assert.match(server, /await pool\.query\(createWorkspaceAccountsSQL\)/);
  assert.match(server, /await pool\.query\(createWorkspaceLinkedColumnsSQL\)/);
});

test('personal workspace seed keeps one person with multiple memberships', () => {
  assert.match(server, /async function ensurePersonalWorkspacesAndPeople/);
  assert.match(server, /projectKey: 'super_admin'/);
  assert.match(server, /projectKey: 'dratler_family'/);
  assert.match(server, /preferred_name: 'Menachem'/);
  assert.match(server, /preferred_name: 'Esty'/);
  assert.match(server, /relationship_to_owner: 'son'/);
  assert.match(server, /relationship_to_owner: 'daughter'/);
  assert.match(server, /role: 'student', access_level: 'member', tags: \['school:student', 'bna:student'\]/);
  assert.match(server, /role: 'owner'[\s\S]*access_level: 'owner'[\s\S]*canonical_workspace: 'rabbi_sheller_provider'/);
  assert.match(server, /Review whether Esty should have a BNA student membership/);
});

test('workspace directory switcher is scoped to identity memberships', () => {
  assert.match(server, /async function ensurePersonalWorkspacesAndPeopleOnce/);
  assert.match(server, /await ensurePersonalWorkspacesAndPeopleOnce\(db\)/);
  assert.match(server, /function shouldShowWorkspaceDirectoryRecord/);
  assert.match(server, /function workspaceDirectoryRecordHasMembership/);
  assert.match(server, /source === 'admin_pseudo_workspace' \|\| key === 'platform'/);
  assert.match(server, /if \(!shouldShowWorkspaceDirectoryRecord\(record, \{ allScope, membershipByWorkspace, source \}\)\) return;/);
  assert.doesNotMatch(server, /sddraftler_workspace_identity/);
});

test('scoped workspace routes guard student and bulk content ids before work starts', () => {
  assert.match(server, /async function assertProjectOwnedRowsAccess/);

  const accountabilityStart = server.indexOf("app.get('/api/bna/accountability'");
  const accountabilityEnd = server.indexOf("app.get('/api/torah-learning/public-summary'");
  assert.notEqual(accountabilityStart, -1);
  assert.notEqual(accountabilityEnd, -1);
  const accountabilityRoute = server.slice(accountabilityStart, accountabilityEnd);
  assert.match(accountabilityRoute, /if \(student_id\) await assertStudentAccess\(req, student_id\);/);
  assert.match(accountabilityRoute, /res\.status\(err\.statusCode \|\| 500\)/);

  const bulkStart = server.indexOf("app.post('/api/bna/content-jobs/bulk-generate'");
  const bulkEnd = server.indexOf('function isParentCreatedGoalBoardText');
  assert.notEqual(bulkStart, -1);
  assert.notEqual(bulkEnd, -1);
  const bulkGenerateRoute = server.slice(bulkStart, bulkEnd);
  assert.match(bulkGenerateRoute, /await assertProjectOwnedRowsAccess\(req, 'bna_content_jobs', ids\);[\s\S]*FROM bna_content_jobs/);
  assert.match(bulkGenerateRoute, /res\.status\(err\.statusCode \|\| 500\)/);
});

test('workspace, household, provider, assistant, ticket, and Google APIs are present', () => {
  [
    "app.get('/api/bna/workspaces'",
    "app.get('/api/bna/workspace-directory'",
    "app.post('/api/bna/session/workspace'",
    "app.get('/api/households/current'",
    "app.get('/api/household/filter-setup'",
    "app.post('/api/household/filter-setup/submit-code'",
    "app.get('/api/providers'",
    "app.post('/api/providers/signup'",
    "app.post('/api/providers/:id/upgrade-intent'",
    "app.get('/api/integrations/google/status'",
    "app.get('/api/integrations/google/business-profile/status'",
    "app.get('/api/assistant/threads'",
    "app.post('/api/assistant/action'",
    "app.get('/api/tickets'",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
});

test('provider profile does not expose Google live-feed UI or fake live data', () => {
  assert.match(server, /business_profile_live_feed: false/);
  assert.match(server, /reviews_live: false/);
  assert.match(server, /reviews: \[\]/);
  assert.match(server, /No live reviews are faked/);
  assert.doesNotMatch(providerProfileHtml, /Google live feed is not connected yet/);
  assert.doesNotMatch(providerProfileHtml, /Manual fallback/);
  assert.match(providerProfileHtml, /Basic listing stays free/);
});

test('parent and provider portals expose new workspace-specific sections', () => {
  assert.match(parentHtml, /data-parent-goal-form/);
  assert.match(parentHtml, /data-filter-setup-form/);
  assert.match(parentHtml, /data-parent-assistant-form/);
  assert.match(parentHtml, /התקנת טאבלט וסינון/);
  assert.match(providerHtml, /data-provider-section="media"/);
  assert.match(providerHtml, /data-provider-section="comments"/);
  assert.match(providerHtml, /data-provider-section="google_business"/);
  assert.match(providerHtml, /data-provider-section="upgrade"/);
  assert.match(operationsHtml, /workspace_key: 'platform'[\s\S]*display_category: 'super_admin'/);
  assert.match(operationsHtml, /workspace_key: 'dratler_family'/);
  assert.doesNotMatch(operationsHtml, /Family Directory/);
  assert.doesNotMatch(operationsHtml, /workspace_type: 'household'/);
  assert.match(operationsHtml, /const WORKSPACE_CANONICAL_TYPES = \['school', 'service_provider', 'family'\]/);
  assert.match(operationsHtml, /const WORKSPACE_CONTEXTS = \['super_admin'\]/);
  assert.match(operationsHtml, /const WORKSPACE_LEGACY_TYPE_ALIASES = \{/);
  assert.match(operationsHtml, /\{ id: 'service_provider', label: 'Service Provider'/);
  assert.match(operationsHtml, /\{ id: 'family', label: 'Family'/);
  assert.match(operationsHtml, /scope_label: workspaceRoleScopeLabel\(workspace\)/);
  assert.doesNotMatch(operationsHtml, /\{ id: 'household', label: 'Parent Households'/);
  assert.match(operationsHtml, /data-workspace-kind-filter="\$\{escapeHtml\(filter\.id\)\}"/);
  assert.match(operationsHtml, /One Time Mishnah Class/);
});

test('public provider micro landing page is route-backed and private-data safe', () => {
  assert.match(server, /app\.get\('\/providers\/:slug'/);
  assert.match(providerProfileHtml, /\/api\/providers\/\$\{encodeURIComponent\(slug\)\}/);
  assert.match(providerProfileHtml, /No private school or household data is shown here/);
  assert.doesNotMatch(providerProfileHtml, /localStorage\.setItem\([^)]*provider/i);
});

test('public website exposes conversational parent and provider onboarding', () => {
  assert.match(server, /app\.post\('\/api\/parent-accountability\/onboarding'/);
  assert.match(indexHtml, /\/parent\/login/);
  assert.doesNotMatch(indexHtml, /\/parent\/login\?onboard=accountability/);
  assert.match(indexHtml, /\/providers\/join\?onboard=provider/);
  assert.match(parentHtml, /data-parent-accountability-onboarding/);
  assert.match(parentHtml, /function isParentAccountabilityOnboarding/);
  assert.match(parentHtml, /else if \(isParentAccountabilityOnboarding\(\)\) showLogin\(\)/);
  assert.match(parentHtml, /parentOnboardingSteps/);
  assert.match(parentHtml, /child_struggles/);
  assert.match(parentHtml, /meal_preferences/);
  assert.match(parentHtml, /self-governance/);
  assert.match(parentHtml, /\/api\/parent-accountability\/onboarding/);
  assert.match(providerJoinHtml, /data-provider-onboarding-bot/);
  assert.match(providerJoinHtml, /Provider onboarding assistant/);
  assert.match(providerJoinHtml, /free provider signup/);
  assert.match(providerJoinHtml, /BNA reviews before public listing/);
});
