const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const {
  AGENT_MODE_PROMPTS,
  AGENT_REVIEW_CONTEXTS,
  AGENT_REVIEW_SESSION_TTL_MINUTES,
  buildPromptIndex,
} = require('../src/lib/bna/agent-review-hub');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const hub = fs.readFileSync(path.join(root, 'public', 'agent-review.html'), 'utf8');
const session = fs.readFileSync(path.join(root, 'public', 'agent-review-session.html'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('Agent Review context matrix covers Issue #24 role cards', () => {
  const keys = new Set(AGENT_REVIEW_CONTEXTS.map((item) => item.key));
  [
    'public_visitor',
    'operations_super_admin',
    'rabbi_provider_admin',
    'provider_participant_staff',
    'parent_qa_identity',
    'student_qa_identity',
    'one_time_member',
    'one_time_classroom',
    'wrong_role_error_states',
  ].forEach((key) => assert.ok(keys.has(key), key));

  assert.equal(AGENT_REVIEW_SESSION_TTL_MINUTES <= 15, true);
  assert.equal(AGENT_REVIEW_CONTEXTS.every((item) => item.workspace_key && item.role && item.target_route), true);
  assert.equal(AGENT_REVIEW_CONTEXTS.some((item) => item.role === 'super_admin' && item.context_type.includes('live')), true);
});

test('Agent Mode prompt pack has exactly 11 generated mobile-copyable files', () => {
  assert.equal(AGENT_MODE_PROMPTS.length, 11);
  assert.equal(packageJson.scripts['agent-review:prompts'], 'node scripts/generate-agent-review-prompts.cjs');
  const index = buildPromptIndex({ baseUrl: 'https://bneineviimacademy.org' });
  assert.equal(index.length, 11);

  for (const prompt of index) {
    const filePath = path.join(root, 'public', 'agent-review-prompts', prompt.file);
    assert.equal(fs.existsSync(filePath), true, prompt.file);
    const text = fs.readFileSync(filePath, 'utf8');
    assert.match(text, /Agent Review Hub/);
    assert.match(text, /Submit to: https:\/\/bneineviimacademy\.org\/api\/bna\/agent-review\/results/);
    assert.match(text, /Do not ask for or store passwords/);
    assert.doesNotMatch(text, /OPS_PASSWORD|API_KEY=|COOKIE=/);
  }
});

test('server exposes secure review-session and result APIs', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_agent_review_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_agent_review_results/);
  assert.match(server, /app\.get\('\/api\/bna\/agent-review\/contexts', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-review\/sessions', requireAdmin/);
  assert.match(server, /verifyAgentReviewCsrf\(req\)/);
  assert.match(server, /revoked_at = COALESCE\(revoked_at, NOW\(\)\)/);
  assert.match(server, /all_access_secret_in_url:\s*false/);
  assert.match(server, /token_scope:\s*'single scoped review session'/);
  assert.match(server, /AGENT_REVIEW_SESSION_COOKIE_NAME/);
  assert.match(server, /setAgentReviewSessionCookie/);
  assert.match(server, /exchangeAgentReviewSessionToken/);
  assert.match(server, /exchange_used_at/);
  assert.match(server, /HttpOnly/);
  assert.match(server, /review_url = `\$\{requestBaseUrl\(req\)\}\/agent-review\/session\?exchange=/);
  assert.match(server, /app\.get\('\/agent-review\/session', async \(req, res\) =>/);
  assert.match(server, /res\.redirect\(303, '\/agent-review\/session'\)/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-review\/results'/);
  assert.match(server, /ON CONFLICT \(idempotency_key\) DO UPDATE/);
});

test('hub and session pages expose banner, Exit, prompt links, and typed result control', () => {
  assert.match(hub, /Agent Review Hub/);
  assert.match(hub, /ACTION-AGENT-REVIEW-OPEN-CONTEXT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-SUBMIT-RESULT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-PROMPT-OPEN/);
  assert.match(hub, /newest_recording_trace/);
  assert.match(hub, /\.\.\.options,\s*credentials: 'same-origin',\s*headers: \{ 'Content-Type': 'application\/json', \.\.\.\(options\.headers \|\| \{\}\) \}/);

  assert.match(session, /Reviewing as/);
  assert.match(session, /exchangeToken/);
  assert.match(session, /history\.replaceState\(\{\}, '', '\/agent-review\/session'\)/);
  assert.match(session, /HttpOnly cookie/);
  assert.match(session, /ACTION-AGENT-REVIEW-EXIT/);
  assert.match(session, /ACTION-AGENT-REVIEW-OPEN-TARGET/);
  assert.match(session, /ACTION-AGENT-REVIEW-COPY-SESSION/);
  assert.match(session, /\/api\/bna\/agent-review\/results/);
  assert.match(session, /\.\.\.options,\s*credentials: 'same-origin',\s*headers: \{ 'Content-Type': 'application\/json', \.\.\.\(options\.headers \|\| \{\}\) \}/);
});

test('Agent Review pages inline scripts parse', () => {
  for (const [label, html] of [['hub', hub], ['session', session]]) {
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => match[1].trim())
      .filter(Boolean);
    assert.ok(scripts.length >= 1, `${label} should have an inline script`);
    scripts.forEach((script, index) => {
      assert.doesNotThrow(() => new vm.Script(script), `${label} inline script ${index + 1} should parse`);
    });
  }
});

test('route and action registries cover Agent Review Hub surface', () => {
  const routes = new Set(routeRegistry.routes.map((item) => item.route));
  [
    '/operations/agent-review',
    '/agent-review/session',
    '/api/bna/agent-review/contexts',
    '/api/bna/agent-review/sessions',
    '/api/bna/agent-review/session',
    '/api/bna/agent-review/results',
  ].forEach((route) => assert.ok(routes.has(route), route));

  const actions = new Set(actionRegistry.actions.map((item) => item.action_id));
  [
    'ACTION-AGENT-REVIEW-OPEN-CONTEXT',
    'ACTION-AGENT-REVIEW-OPEN-TARGET',
    'ACTION-AGENT-REVIEW-EXIT',
    'ACTION-AGENT-REVIEW-SUBMIT-RESULT',
    'ACTION-AGENT-REVIEW-PROMPT-OPEN',
    'ACTION-AGENT-REVIEW-RETURN-HUB',
    'ACTION-AGENT-REVIEW-COPY-SESSION',
  ].forEach((action) => assert.ok(actions.has(action), action));
});
