const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const parentHtml = fs.readFileSync(path.join(root, 'public', 'parent.html'), 'utf8');
const parentLoginHtml = fs.readFileSync(path.join(root, 'public', 'parent-login.html'), 'utf8');
const operationsHtml = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
const {
  DEFAULT_ACCOUNTABILITY_SECTIONS,
  normalizeIdentityEmail,
  normalizeIdentityPhone,
  slugifySectionKey,
  parentMergeDecision,
  shouldMergeChildInHousehold,
  shouldMergeChildAcrossHouseholds,
} = require('../src/lib/bna/identity-linking');

test('identity helper normalization and merge decisions are deterministic', () => {
  assert.equal(normalizeIdentityEmail(' Parent@Example.COM '), 'parent@example.com');
  assert.equal(normalizeIdentityPhone('+972 54-123-4567'), '0541234567');
  assert.equal(slugifySectionKey('Torah / Learning!'), 'torah_learning');
  assert.equal(slugifySectionKey('', 'goals'), 'goals');
  assert.equal(DEFAULT_ACCOUNTABILITY_SECTIONS.map(section => section.section_key).join(','), 'goals,diet,attendance,assignments,behavior,torah_learning,chores');

  assert.deepEqual(parentMergeDecision({ existingByEmail: { id: 1 }, existingByPhone: { id: 1 } }), {
    action: 'use_existing',
    person_id: 1,
    reason: 'exact_email',
  });
  assert.equal(parentMergeDecision({ existingByEmail: { id: 1 }, existingByPhone: { id: 2 } }).action, 'review');
});

test('child identity helpers reject cross-household name-only merges', () => {
  assert.equal(shouldMergeChildAcrossHouseholds(), false);
  assert.equal(shouldMergeChildInHousehold({ existingHouseholdChild: { id: 4 }, sameHousehold: true, stableSignal: true }), true);
  assert.equal(shouldMergeChildInHousehold({ existingHouseholdChild: { id: 4 }, sameHousehold: false, stableSignal: true }), false);
});

test('server creates canonical identity schema, parent auth, and scoped parent APIs', () => {
  [
    'CREATE TABLE IF NOT EXISTS bna_person_contacts',
    'CREATE TABLE IF NOT EXISTS bna_identity_workspaces',
    'CREATE TABLE IF NOT EXISTS bna_person_workspace_roles',
    'CREATE TABLE IF NOT EXISTS bna_household_memberships',
    'CREATE TABLE IF NOT EXISTS bna_parent_accounts',
    'CREATE TABLE IF NOT EXISTS bna_identity_merge_reviews',
    'CREATE TABLE IF NOT EXISTS bna_accountability_sections',
    'CREATE TABLE IF NOT EXISTS bna_accountability_items',
    'CREATE TABLE IF NOT EXISTS bna_provider_profiles',
    'CREATE TABLE IF NOT EXISTS bna_provider_questions',
    "app.post('/api/parent/auth/login'",
    "app.post('/api/parent/auth/logout'",
    "app.get('/api/parent/me'",
    "app.get('/api/parent/household'",
    "app.get('/api/parent/children'",
    "app.get('/api/parent/accountability'",
    "app.post('/api/parent/accountability/items'",
    "app.get('/api/parent/provider-index'",
    "app.post('/api/parent/provider-questions'",
    "app.post('/api/parent/assistant'",
    "app.post('/api/bna/identity/backfill'",
    "app.get('/api/bna/identity/merge-reviews'",
    "app.post('/api/bna/parent-accounts/access-code'",
    "app.post('/api/bna/students/:id/household-link'",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));

  assert.match(server, /req\.parentSession = \{[\s\S]*household_id: context\.household\.id/);
  assert.match(server, /Child not found in this household/);
  assert.match(server, /WHERE id = \$\$\{values\.length - 1\}\s+AND household_id = \$\$\{values\.length\}/);
  assert.match(server, /COALESCE\(metadata->>'parent_visible', 'true'\) <> 'false'/);
  assert.match(server, /preserve_school_membership: body\.preserve_school_membership !== false/);
  assert.match(server, /school\/BNA student membership was not changed/);
});

test('backfill and seed rules preserve Dratler roles without Esty school linking', () => {
  assert.match(server, /full_name: 'Shloimie Dratler'/);
  assert.match(server, /full_name: 'Menachem Mendel Dratler'/);
  assert.match(server, /preferred_name: 'Esty'/);
  assert.match(server, /family_name: 'Dratler'/);
  assert.match(server, /household_name: 'Dratler Family'/);
  assert.match(server, /role: 'student', access_level: 'member', tags: \['school:student', 'bna:student'\]/);
  assert.match(server, /Review whether Esty should have a BNA student membership/);
  assert.doesNotMatch(server, /linkExactStudentPerson\(\{\s*person: esty/);
  assert.match(server, /WHERE identity_backfilled_at IS NULL/);
  assert.match(server, /identity_backfilled_at = COALESCE\(identity_backfilled_at, NOW\(\)\)/);
});

test('student identity payloads expose canonical workspace keys', () => {
  assert.match(server, /function visibleIdentityWorkspaceKey/);
  assert.match(server, /if \(key === 'family_app'\) return 'dratler_family'/);
  assert.match(server, /if \(key === 'bna_school'\) return 'bna'/);
  assert.match(server, /workspace_key: workspaceKey/);
});

test('parent and operations UI expose access-code login and identity review actions', () => {
  assert.match(parentLoginHtml, /\/api\/parent\/auth\/login/);
  assert.match(parentLoginHtml, /\/api\/parent\/me/);
  assert.match(parentLoginHtml, /Email or phone/);
  assert.match(parentLoginHtml, /id="continuePanel"/);
  assert.match(parentLoginHtml, /Continue to parent portal/);
  assert.match(parentLoginHtml, /Request parent access \/ Family setup/);
  assert.match(parentLoginHtml, /switchParentButton/);
  assert.match(parentLoginHtml, /continuePanel\.classList\.remove\('hidden'\)/);
  assert.match(parentLoginHtml, /form\.classList\.add\('hidden'\)/);
  assert.doesNotMatch(parentLoginHtml, /Start Accountability Intake/);
  assert.match(parentHtml, /\/api\/parent\/assistant/);
  assert.match(parentHtml, /\/api\/parent\/provider-questions/);
  assert.match(operationsHtml, /Generate Access Code/);
  assert.match(operationsHtml, /generateParentAccessCode/);
  assert.match(operationsHtml, /Identity Reviews/);
  assert.match(operationsHtml, /Merge Review Queue/);
  assert.match(operationsHtml, /runIdentityBackfill/);
  assert.match(operationsHtml, /getIdentityMergeReviews/);
});
