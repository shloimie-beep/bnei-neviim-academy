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
  assert.match(server, /workspace_type IN \('super_admin', 'school', 'family', 'household', 'service_provider', 'community', 'project'\)/);
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
  assert.match(server, /Review whether Esty should have a BNA student membership/);
});

test('workspace, household, provider, assistant, ticket, and Google APIs are present', () => {
  [
    "app.get('/api/bna/workspaces'",
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

test('provider profile and Google fallback do not fake live Google data', () => {
  assert.match(server, /business_profile_live_feed: false/);
  assert.match(server, /reviews_live: false/);
  assert.match(server, /reviews: \[\]/);
  assert.match(server, /No live reviews are faked/);
  assert.match(providerProfileHtml, /Google live feed is not connected yet/);
  assert.match(providerProfileHtml, /Manual fallback/);
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
  assert.match(operationsHtml, /workspace_key: 'super_admin'/);
  assert.match(operationsHtml, /workspace_key: 'dratler_family'/);
  assert.match(operationsHtml, /workspace_key: 'parent_households'/);
  assert.match(operationsHtml, /\{ id: 'household', label: 'Parent Households'/);
  assert.match(operationsHtml, /data-workspace-kind-filter="\$\{escapeHtml\(filter\.id\)\}"/);
  assert.match(operationsHtml, /One Time Mishnayos Provider Workspace/);
});

test('public provider micro landing page is route-backed and private-data safe', () => {
  assert.match(server, /app\.get\('\/providers\/:slug'/);
  assert.match(providerProfileHtml, /\/api\/providers\/\$\{encodeURIComponent\(slug\)\}/);
  assert.match(providerProfileHtml, /No private school or household data is shown here/);
  assert.doesNotMatch(providerProfileHtml, /localStorage\.setItem\([^)]*provider/i);
});

test('public website exposes conversational parent and provider onboarding', () => {
  assert.match(server, /app\.post\('\/api\/parent-accountability\/onboarding'/);
  assert.match(indexHtml, /\/parent\/login\?onboard=accountability/);
  assert.match(indexHtml, /\/become-service-provider\?onboard=provider/);
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
  assert.match(providerJoinHtml, /family-intake funnel paths/);
});
