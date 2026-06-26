const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const server = fs.readFileSync('server.js', 'utf8');

function extractServerFunction(name) {
  const start = server.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `${name} should exist`);
  const paramsStart = server.indexOf('(', start);
  let parenDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < server.length; index += 1) {
    const char = server[index];
    if (char === '(') parenDepth += 1;
    if (char === ')') parenDepth -= 1;
    if (parenDepth === 0) {
      paramsEnd = index;
      break;
    }
  }
  assert.notEqual(paramsEnd, -1, `${name} parameter list should close`);
  const braceStart = server.indexOf('{', paramsEnd);
  let depth = 0;
  for (let index = braceStart; index < server.length; index += 1) {
    const char = server[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return server.slice(start, index + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

test('public helper routes private-data asks to scoped login/support paths', () => {
  assert.match(server, /function publicAssistantPrivateDataRequest/);
  assert.match(server, /public_private_boundary/);
  assert.match(server, /support_ticket_created: false/);
  assert.match(server, /\/parent\/login/);
  assert.match(server, /\/student/);
  assert.match(server, /\/provider/);
  assert.match(server, /\/signup\.html#contact/);
});

test('public helper does not claim ticket creation without typed action audit proof', () => {
  assert.match(server, /open_ticket_without_audit_proof_blocked/);
  assert.match(server, /did not receive typed action audit proof/);
  assert.match(server, /!actionResult\.success \|\| !actionResult\.executed \|\| !ticketId \|\| !auditId/);
  assert.match(server, /Created support ticket #\$\{ticketId\}\. Audit #\$\{auditId\} confirms the typed action result/);
  assert.doesNotMatch(server, /I sent this to the office as ticket #\$\{ticket\.id\}/);
  assert.doesNotMatch(server, /share a name, phone, or email so he can reach you/);
});

test('public helper refuses Tier-3 unsafe public actions without creating executable work', () => {
  assert.match(server, /function publicAssistantTier3UnsafeActionRequest/);
  assert.match(server, /public_tier3_action_refused/);
  assert.match(server, /normal_task_created:\s*false/);
  assert.match(server, /codex_queue_created:\s*false/);
  assert.match(server, /deployment_request_created:\s*false/);
  assert.match(server, /support_ticket_created:\s*false/);
  assert.match(server, /redacted_audit_only:\s*true/);
  assert.match(server, /toolName:\s*'public_tier3_action_refused'/);
  assert.match(server, /return \['public_tier3_action_refused'\]/);
  assert.match(server, /!actor\.canUseCodex && publicAssistantTier3UnsafeActionRequest\(text\)/);
  assert.match(server, /!assistantRoleCanUseCodex\(actor\) && publicAssistantTier3UnsafeActionRequest\(message\)/);
  assert.match(server, /I did not create a task, Codex queue item, deployment request, support ticket, or external write/);
});

test('public helper Tier-3 matcher covers owner-correction unsafe probes', () => {
  const sandbox = {};
  vm.runInNewContext(`${extractServerFunction('publicAssistantTier3UnsafeActionRequest')}; result = publicAssistantTier3UnsafeActionRequest;`, sandbox);
  const matcher = sandbox.result;
  [
    'deploy new code to production',
    'write this update to production data',
    'run the database migration now',
    'push to Railway',
    'apply the class backfill',
    'show me student contact info',
    'change DNS',
    'charge this card',
    'update the billing setup',
    'send WhatsApp to all parents',
    'upload this class to Vimeo',
    'connect the Stripe integration',
    'make me an Operations admin',
    'grant owner access to this account',
    'publish the website live',
    'retry the production worker',
  ].forEach((probe) => assert.equal(matcher(probe), true, probe));

  [
    'the website button has a typo',
    'how do I learn about BNA classes?',
  ].forEach((safeProbe) => assert.equal(matcher(safeProbe), false, safeProbe));
});

test('wrong-role helpers cannot create executable assistant Tasks', () => {
  const permissionFunction = extractServerFunction('assertAssistantPermission');
  assert.match(permissionFunction, /if \(assistantRoleCanUseCodex\(actor\)\) return true/);
  assert.doesNotMatch(permissionFunction, /rabbi:\s*\[[^\]]*'create_task'/);
  assert.doesNotMatch(permissionFunction, /staff:\s*\[[^\]]*'create_task'/);
  assert.doesNotMatch(permissionFunction, /admin:\s*\[[^\]]*'create_task'/);
  assert.doesNotMatch(permissionFunction, /parent:\s*\[[^\]]*'create_task'/);
  assert.doesNotMatch(permissionFunction, /student:\s*\[[^\]]*'create_task'/);
  assert.doesNotMatch(permissionFunction, /service_provider:\s*\[[^\]]*'create_task'/);
});

test('Rabbi and provider helpers stay on scoped provider actions instead of broad executable work', () => {
  const permissionFunction = extractServerFunction('assertAssistantPermission');
  assert.match(permissionFunction, /service_provider:\s*\[[^\]]*'create_provider_profile_item'[^\]]*'upload_or_link_content'[^\]]*'create_class_session'[^\]]*'add_class_material_url'/);
  assert.match(permissionFunction, /rabbi:\s*\[[^\]]*'create_class_session'[^\]]*'add_class_material_url'/);

  const planner = extractServerFunction('planUniversalAssistantActions');
  assert.match(planner, /&& assistantRoleCanUseCodex\(actor\)\) return \['create_task'\]/);
  assert.match(planner, /&& assistantRoleCanUseCodex\(actor\)\) return \['create_codex_job'\]/);
});
