const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { redactValue } = require('../src/lib/bna/helper/redaction');

const server = fs.readFileSync('server.js', 'utf8');
const setupHtml = fs.readFileSync('public/assistant-setup.html', 'utf8');

test('developer tester assistant role is explicit, ticket-only, and never Codex-enabled', () => {
  [
    "return 'developer_tester'",
    'function isDeveloperTesterAssistantRequest',
    'function developerTesterActorFromRequestBody',
    "type: 'developer_tester'",
    "role: 'developer_tester'",
    'canUseCodex: false',
    "workspace_key: 'developer_testing'",
    "actor_type IN ('anonymous', 'parent', 'student', 'service_provider', 'provider', 'developer_tester'",
    "mode IN ('super_admin', 'operator', 'bna_admin', 'parent', 'student', 'provider', 'developer_tester'",
    'if (developerTesterActor) return developerTesterActor',
    "if (actor.type === 'developer_tester') return 'developer_tester'",
    "developer_tester: ['create_ticket']",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));

  const roleActions = server.match(/const roleActions = \{[\s\S]*?\n  \};/)?.[0] || '';
  assert.match(roleActions, /developer_tester:\s*\['create_ticket'\]/);
  assert.doesNotMatch(roleActions, /developer_tester:[^\]]*create_task/);
  assert.doesNotMatch(roleActions, /developer_tester:[^\]]*create_codex_job/);
  assert.doesNotMatch(roleActions, /developer_tester:[^\]]*show_agent_status/);
});

test('developer tester ticket context records page and device proof without private record access', () => {
  [
    'function developerTesterTicketContext',
    'function safeTesterAttachmentReference',
    'function safeTesterLogContext',
    'no_private_record_context: true',
    "developerTester ? null : (context.household?.id",
    "developerTester ? null : (context.student?.id",
    "developerTester ? null : (context.provider_profile?.id",
    'developer_tester_context: developerTester ? developerTesterTicketContext(body) : null',
    "const pagePath = actorType === 'developer_tester'",
    "page_path: actorType === 'developer_tester' ? limitText(redactValue(requestPagePath), 700) : requestPagePath",
    'const requestedStudentId = developerTester ? 0',
    'const requestedHouseholdId = developerTester ? 0',
    'const requestedProviderProfileId = developerTester ? 0',
    'const requestedClassSessionId = developerTester ? 0',
    'safeTesterNumber',
    'redacted_data_url',
    'redactValue',
  ].forEach((needle) => assert.ok(server.includes(needle), needle));

  const sourceContext = server.match(/function universalAssistantSourceContext[\s\S]*?\n}\n\nasync function loadAssistantContext/)?.[0] || '';
  assert.match(sourceContext, /actor_type:\s*actorType/);
  assert.match(sourceContext, /page_path:\s*developerTester \? limitText\(redactValue\(pagePath\), 700\) : pagePath/);
});

test('setup assistant can submit developer tester tickets with safe browser context', () => {
  [
    '<option value="developer_tester">Developer tester</option>',
    "const isDeveloperTester = mode === 'developer_tester'",
    "role: isDeveloperTester ? 'developer_tester' : mode",
    "title: roleTitle",
    'tester_name: isDeveloperTester ? name : undefined',
    'tester_email: isDeveloperTester ? email : undefined',
    'user_agent: navigator.userAgent',
    'platform: navigator.platform',
    'viewport: {',
    "surface: 'setup_page'",
    "action: 'create_ticket'",
  ].forEach((needle) => assert.ok(setupHtml.includes(needle), needle));
});

test('developer tester redaction strips private record query context', () => {
  const redacted = redactValue('/assistant-setup.html?student_id=123&household_id=456&providerProfileId=789&token=secret-smoke');
  assert.doesNotMatch(redacted, /student_id=123/);
  assert.doesNotMatch(redacted, /household_id=456/);
  assert.doesNotMatch(redacted, /providerProfileId=789/);
  assert.doesNotMatch(redacted, /token=secret-smoke/);
  assert.match(redacted, /\[redacted-record-id\]/);
  assert.match(redacted, /\[redacted-secret\]/);
});

test('developer tester assistant avoids fake workspace foreign keys', () => {
  [
    'ALTER TABLE bna_workspaces ADD COLUMN IF NOT EXISTS "key" TEXT',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_workspaces_key_unique ON bna_workspaces("key")',
    'ALTER TABLE bna_assistant_threads ALTER COLUMN workspace_id DROP DEFAULT',
    'AND NOT EXISTS (SELECT 1 FROM bna_projects p WHERE p.id = at.workspace_id)',
    "workspace = { id: null, key: project.project_key",
    'project_id, workspace_id, actor_type',
    'project?.id || null,\n      project?.id || null,',
    'SET workspace_id = $2',
    'context.project?.id || null',
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
});
