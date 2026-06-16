const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const setupHtml = fs.readFileSync('public/assistant-setup.html', 'utf8');
const signupHtml = fs.readFileSync('public/signup.html', 'utf8');
const signupHeHtml = fs.readFileSync('public/signup-he.html', 'utf8');

test('universal assistant migration adds the MVP data model without replacing legacy tables', () => {
  [
    'const createUniversalAssistantMvpSQL',
    'CREATE TABLE IF NOT EXISTS bna_workspaces',
    'CREATE TABLE IF NOT EXISTS bna_persons',
    'CREATE TABLE IF NOT EXISTS bna_provider_profile_items',
    'CREATE TABLE IF NOT EXISTS bna_student_goals',
    'CREATE TABLE IF NOT EXISTS bna_assistant_memory_summaries',
    'CREATE TABLE IF NOT EXISTS bna_assistant_memories',
    'CREATE TABLE IF NOT EXISTS bna_assistant_actions',
    'CREATE TABLE IF NOT EXISTS bna_assistant_action_runs',
    'CREATE TABLE IF NOT EXISTS bna_class_materials',
    "'internal_super_admin'",
    'universal_assistant_signup_parent_backfill',
    'universal_assistant_agent_job_backfill',
    'ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS codex_status',
    'ALTER TABLE bna_assistant_threads ADD COLUMN IF NOT EXISTS mode',
    'ALTER TABLE bna_assistant_messages ADD COLUMN IF NOT EXISTS tool_results',
    'await pool.query(createUniversalAssistantMvpSQL)',
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
});

test('universal assistant exposes scoped actor, context, permission, route, and tool contracts', () => {
  [
    'async function getActorFromRequest(req)',
    'async function resolveAssistantActor(req, bodyOrDb = pool',
    'function detectLanguage',
    'function normalizeAssistantMode',
    'async function loadAssistantContext',
    'function assertWorkspaceAccess(req, workspaceKey, action =',
    'async function assertHouseholdAccess',
    'async function assertProviderAccess',
    'async function assertStudentAccess(req, studentId, actionOrDb = pool',
    'async function assertAssistantThreadAccess',
    'function assertAssistantPermission',
    'function canonicalUniversalAssistantActionName',
    'const UNIVERSAL_ASSISTANT_TOOLS',
    'create_ticket: createUniversalAssistantTicket',
    'create_task: createUniversalAssistantTask',
    'create_codex_job: createUniversalAssistantCodexJob',
    'create_or_update_person: createOrUpdateUniversalPerson',
    'create_or_update_household: createOrUpdateUniversalHousehold',
    'create_or_update_student_goal: createOrUpdateUniversalStudentGoal',
    'create_student_goal: createUniversalStudentGoal',
    'log_check_in_progress: logUniversalCheckInProgress',
    'log_student_checkin: logUniversalStudentCheckin',
    'create_provider_profile_item: createUniversalProviderProfileItem',
    'upload_or_link_content: uploadOrLinkUniversalContent',
    'create_content_link: createUniversalContentLink',
    'create_class: createUniversalClass',
    'create_class_session: createUniversalClassSession',
    'add_class_material_url: addUniversalClassMaterialUrl',
    'add_worksheet_or_media_url: addUniversalWorksheetOrMediaUrl',
    'ask_provider_question: askUniversalProviderQuestion',
    'show_access_payment_status: showUniversalAccessPaymentStatus',
    'show_access_status: showUniversalAccessStatus',
    'show_payment_status: showUniversalPaymentStatus',
    'show_agent_status: showUniversalAgentStatus',
    "app.post('/api/bna/assistant/message'",
    "app.post('/api/assistant/message'",
    "app.get('/api/bna/assistant/actions/:id'",
    "app.get('/api/bna/assistant/agent-status'",
    "app.get('/api/bna/agent-status'",
    "app.get('/api/bna/agent-jobs'",
    "app.get('/api/bna/agent-jobs/:id'",
    "app.get('/api/bna/tickets'",
    "app.post('/api/bna/tickets'",
    "app.patch('/api/bna/tickets/:id'",
    "app.post('/api/student-portal/assistant/message'",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));

  assert.match(server, /if \(!assistantRoleCanUseCodex\(actor\)\) return res\.status\(403\)/);
  assert.match(server, /Students can only update their own assistant context/);
  assert.match(server, /This parent cannot .* another household/);
  assert.match(server, /This provider cannot .* another provider profile/);
  assert.match(server, /raw_access_code_stored: false/);
  assert.match(server, /access_code_supplied: Boolean/);
});

test('universal assistant action results use explicit success and failure contracts', () => {
  [
    'function universalAssistantToolResult(actionType, payload = {})',
    'ok,',
    'action_name: actionType',
    'created_object_type: createdObjectType',
    'created_object_id: createdObjectId',
    'updated_object_type: payload.updated_object_type',
    'updated_object_id: payload.updated_object_id',
    'summary,',
    'error: payload.error || null',
    'data: payload.data || payload.result || null',
    'I did not complete',
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
});

test('operations, student, and setup surfaces call the universal assistant route', () => {
  assert.match(operationsHtml, /Universal Assistant/);
  assert.match(operationsHtml, /sendAssistantMessage\(payload = \{\}\)/);
  assert.match(operationsHtml, /\/assistant\/message/);
  assert.match(operationsHtml, /What did Codex do\?/);
  assert.match(operationsHtml, /renderAssistantActionCards/);
  assert.match(operationsHtml, /assistant-action-card/);

  assert.match(studentHtml, /id="assistantSection"/);
  assert.match(studentHtml, /\/api\/student-portal\/assistant\/message/);
  assert.match(studentHtml, /access_code: accessCode/);
  assert.match(studentHtml, /setPortalSection\('assistant'/);

  assert.match(setupHtml, /Setup Assistant/);
  assert.match(setupHtml, /\/api\/assistant\/message/);
  assert.match(setupHtml, /action: 'create_ticket'/);

  for (const html of [signupHtml, signupHeHtml]) {
    assert.match(html, /class="signup-assistant"/);
    assert.match(html, /sendSignupAssistantMessage/);
    assert.match(html, /\/api\/assistant\/message/);
    assert.match(html, /action: 'create_ticket'/);
    assert.match(html, /surface: 'signup'/);
  }
  assert.match(signupHeHtml, /language: 'he'/);
});
