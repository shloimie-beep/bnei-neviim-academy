const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const {
  AGENT_REVIEW_RUN,
  AGENT_MODE_PROMPTS,
  AGENT_REVIEW_CONTEXTS,
  AGENT_REVIEW_SESSION_TTL_MINUTES,
  buildAgentReviewRepairItem,
  buildPromptIndex,
  normalizeAgentReviewResultStatus,
  renderRerunPrompt,
} = require('../src/lib/bna/agent-review-hub');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const hub = fs.readFileSync(path.join(root, 'public', 'agent-review.html'), 'utf8');
const session = fs.readFileSync(path.join(root, 'public', 'agent-review-session.html'), 'utf8');
const dropoff = fs.readFileSync(path.join(root, 'public', 'agent-review-dropoff.html'), 'utf8');
const agentModeProtocol = fs.readFileSync(path.join(root, 'docs', 'AGENT-REVIEW-AGENT-MODE-PROTOCOL.md'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const railwayRedeploy = fs.readFileSync(path.join(root, 'scripts', 'railway-redeploy.ps1'), 'utf8');

test('Agent Review context matrix covers Issue #24 role cards', () => {
  const keys = new Set(AGENT_REVIEW_CONTEXTS.map((item) => item.key));
  [
    'public_visitor',
    'one_time_public_landing',
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

test('Agent Mode prompt pack has exactly 16 generated mobile-copyable files', () => {
  assert.equal(AGENT_MODE_PROMPTS.length, 16);
  assert.equal(packageJson.scripts['agent-review:prompts'], 'node scripts/generate-agent-review-prompts.cjs');
  const index = buildPromptIndex({ baseUrl: 'https://bneineviimacademy.org' });
  assert.equal(index.length, 16);

  for (const prompt of index) {
    const filePath = path.join(root, 'public', 'agent-review-prompts', prompt.file);
    assert.equal(fs.existsSync(filePath), true, prompt.file);
    const text = fs.readFileSync(filePath, 'utf8');
    assert.match(text, /Agent Review Hub/);
    assert.match(text, /agent_review_run_id/);
    assert.match(text, /prompt_key/);
    assert.match(text, /return_url/);
    assert.match(text, /dropoff_url/);
    assert.match(text, /requirement_id/);
    assert.match(text, /idempotency_key/);
    assert.match(text, /Reusable protocol\/template: docs\/AGENT-REVIEW-AGENT-MODE-PROTOCOL\.md/);
    assert.match(text, /Preferred drop-off: https:\/\/bneineviimacademy\.org\/operations\/agent-review\/dropoff/);
    assert.match(text, /autosave=1/);
    assert.match(text, /API fallback: https:\/\/bneineviimacademy\.org\/api\/bna\/agent-review\/results/);
    assert.match(text, /## Required Workflow State/);
    assert.match(text, /Click Start Audit \/ I started this agent mode/);
    assert.match(text, /Do not treat a partial audit as pass/);
    assert.match(text, /If blocked midway, save BLOCKED immediately/);
    assert.match(text, /POST to \/api\/bna\/agent-review\/results/);
    assert.match(text, /You must submit the structured result yourself/);
    assert.match(text, /OPERATIONS_DROPOFF_SAVED: AGR-\.\.\./);
    assert.match(text, /OPERATIONS_DROPOFF_FAILED:/);
    assert.match(text, /Emergency fallback: open the drop-off page and use "Emergency paste JSON and save"/);
    assert.match(text, /readback API shows the AGR result/);
    assert.match(text, /Do not ask for or store passwords/);
    assert.match(text, /save BLOCKED/);
    assert.match(text, /blocked_route_or_step/);
    assert.match(text, /partial_routes_visited/);
    assert.match(text, /partial_helper_responses/);
    assert.doesNotMatch(text, /OPS_PASSWORD|API_KEY=|COOKIE=/);
    assert.doesNotMatch(text, /If Agent Mode cannot save, return the full redacted report in chat/i);
    [
      'download this report',
      'upload it yourself',
      'I compiled the JSON',
      'here is the file',
      'manual upload required',
    ].forEach((phrase) => assert.doesNotMatch(text, new RegExp(phrase, 'i'), `${prompt.file} must not contain ${phrase}`));
  }

  for (const key of [
    'one-time-parent-trial-journey',
    'one-time-student-login-reset-journey',
    'one-time-role-ia-consistency',
    'one-time-brand-helper-toolbar-audit',
    'one-time-public-signup-whatsapp-workflow',
  ]) {
    const prompt = index.find((item) => item.key === key);
    assert.ok(prompt, key);
    const text = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', prompt.file), 'utf8');
    assert.match(text, /## Exact Navigation/);
    assert.match(text, /## Required Audit Output/);
  }

  const brandPrompt = index.find((item) => item.key === 'one-time-brand-helper-toolbar-audit');
  assert.ok(brandPrompt);
  const brandText = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', brandPrompt.file), 'utf8');
  assert.match(brandText, /REQ-20260707-136/);
  assert.match(brandText, /\/one-time/);
  assert.match(brandText, /join\.onetimeonetime\.com\/parent\/login/);
  assert.match(brandText, /Communications > WhatsApp/);
  assert.match(brandText, /WAPI readiness/);
  assert.match(brandText, /\/operations\?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview/);
  assert.match(brandText, /\/operations\?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email/);
  assert.match(brandText, /1440px, 1024px, 768px, 430px, and 390px/);
  assert.match(brandText, /black\/yellow scoped/);
  assert.match(brandText, /Communications loops or bad-display switches/);
  assert.match(brandText, /OPERATIONS_DROPOFF_FAILED/);

  const signupPrompt = index.find((item) => item.key === 'one-time-public-signup-whatsapp-workflow');
  assert.ok(signupPrompt);
  const signupText = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', signupPrompt.file), 'utf8');
  assert.match(signupText, /REQ-20260708-071/);
  assert.match(signupText, /Sign Up Now/);
  assert.match(signupText, /one visible email input only/);
  assert.match(signupText, /Running \/ Drop-off Needed/);
  assert.match(signupText, /\/api\/one-time\/interest/);
  assert.match(signupText, /Do not send a WhatsApp message/);
  assert.match(signupText, /Communications > WhatsApp/);
  assert.match(signupText, /prompt copied/);
  assert.match(signupText, /1440px, 1024px, 768px, 430px, and 390px/);
  assert.match(signupText, /no external send\/charge\/access\/WhatsApp occurred/);

  const rabbiPrompt = index.find((item) => item.key === 'rabbi-provider-admin');
  assert.ok(rabbiPrompt);
  const rabbiText = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', rabbiPrompt.file), 'utf8');
  assert.match(rabbiText, /Open Rabbi Provider Portal/);
  assert.match(rabbiText, /Now Viewing: Rabbi \/ One Time Inbox/);
  assert.match(rabbiText, /Communications > WhatsApp/);
  assert.match(rabbiText, /WAPI readiness/);
  assert.match(rabbiText, /join\.onetimeonetime\.com\/parent\/login/);
  assert.match(rabbiText, /join\.onetimeonetime\.com\/student\/login/);
  assert.match(rabbiText, /join\.onetimeonetime\.com\/one-time-parent/);
  assert.match(rabbiText, /BNA Academy reset\/login branding/);
  assert.match(rabbiText, /classroom-code fallback/);
  assert.match(rabbiText, /recovery-code fallback/);
  assert.match(rabbiText, /Student View, Parent\/Member View, Classroom, and Library/);
  assert.match(rabbiText, /Super Admin noise/);

  const parentPrompt = index.find((item) => item.key === 'one-time-parent-trial-journey');
  assert.ok(parentPrompt);
  const parentText = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', parentPrompt.file), 'utf8');
  assert.match(parentText, /join\.onetimeonetime\.com/);
  assert.match(parentText, /BNA Academy reset\/login pages/);
  assert.match(parentText, /parent can reset the child password/);
  assert.match(parentText, /separate classroom\/recovery code/);

  const studentPrompt = index.find((item) => item.key === 'one-time-student-login-reset-journey');
  assert.ok(studentPrompt);
  const studentText = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', studentPrompt.file), 'utf8');
  assert.match(studentText, /no recovery\/classroom-code fallback/);
  assert.match(studentText, /should not show BNA Academy reset/);
  assert.match(studentText, /parent forgot-password sends a reset to the signup email/);
  assert.doesNotMatch(studentText, /access-code fallback/);
});

test('Agent Mode protocol template locks reusable Start Audit drop-off sequence', () => {
  [
    'src/lib/bna/agent-review-hub.js',
    'renderAgentModePrompt',
    'docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md',
    'public/agent-review.html',
    'public/agent-review-dropoff.html',
    'public/agent-review-prompts/*.md',
    'npm run agent-review:prompts',
    'tests/agent-review-hub.test.js',
    'Click Start Audit / I started this agent mode',
    'Do not treat a partial audit as pass',
    'If blocked midway, save BLOCKED immediately',
    'Emergency paste JSON and save',
    'POST to /api/bna/agent-review/results',
    'readback API shows the AGR result',
    'OPERATIONS_DROPOFF_SAVED: AGR-...',
    'OPERATIONS_DROPOFF_FAILED:',
    'blocked_route_or_step',
    'partial_routes_visited',
    'partial_helper_responses',
  ].forEach((needle) => assert.match(agentModeProtocol, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    'download this report',
    'upload it yourself',
    'I compiled the JSON',
    'here is the file',
    'manual upload required',
  ].forEach((phrase) => assert.match(agentModeProtocol, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  const prompts = buildPromptIndex({ baseUrl: 'https://bneineviimacademy.org' });
  for (const prompt of prompts) {
    const text = fs.readFileSync(path.join(root, 'public', 'agent-review-prompts', prompt.file), 'utf8');
    for (const phrase of [
      'Click Start Audit / I started this agent mode',
      'Do not treat a partial audit as pass',
      'If blocked midway, save BLOCKED immediately',
      'Emergency paste JSON and save',
      'POST to /api/bna/agent-review/results',
      'readback API shows the AGR result',
      'OPERATIONS_DROPOFF_SAVED: AGR-...',
      'OPERATIONS_DROPOFF_FAILED:',
      'blocked_route_or_step',
      'partial_routes_visited',
      'partial_helper_responses',
    ]) {
      assert.match(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${prompt.file} missing ${phrase}`);
    }
  }
});

test('server exposes secure review-session and result APIs', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_agent_review_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_agent_review_results/);
  assert.match(server, /app\.get\('\/api\/bna\/agent-review\/contexts', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-review\/prompts\/start', requireAdmin/);
  assert.match(server, /latestAgentReviewResultsByPrompt/);
  assert.match(server, /agentReviewResultByIdempotencyKey/);
  assert.match(server, /status:\s*'in_progress'/);
  assert.match(server, /app\.get\('\/api\/bna\/agent-review\/dropoff-context'/);
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
  assert.match(server, /app\.get\('\/operations\/agent-review\/dropoff'/);
  assert.match(server, /res\.redirect\(303, '\/agent-review\/session'\)/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-review\/results'/);
  assert.match(server, /parseAgentReviewDropoffBody/);
  assert.match(server, /requestedWorkflowState/);
  assert.match(server, /prompt_copied/);
  assert.match(server, /buildAgentReviewRepairItem/);
  assert.match(server, /renderRerunPrompt/);
  assert.match(server, /ON CONFLICT \(idempotency_key\) DO UPDATE/);
});

test('Agent Review login returnTo preserves hub and drop-off pages only', () => {
  assert.match(server, /allowedPaths = new Set\(\[\s*'\/operations',\s*'\/operations\/agent-review',\s*'\/operations\/agent-review\/dropoff'/);
  assert.match(server, /agentReviewExactLoginUrl/);
  assert.match(server, /takeover_hint: 'Use takeover mode to log in once, then return here\.'/);
  assert.match(fs.readFileSync(path.join(root, 'public', 'operations-login.html'), 'utf8'), /allowedPaths = new Set\(\['\/operations', '\/operations\/agent-review', '\/operations\/agent-review\/dropoff'\]\)/);
});

test('Start Audit state is a first-class prompt workflow state', () => {
  assert.equal(normalizeAgentReviewResultStatus('started'), 'in_progress');
  assert.equal(normalizeAgentReviewResultStatus('in_progress'), 'in_progress');
  const index = buildPromptIndex({
    baseUrl: 'https://bneineviimacademy.org',
    resultsByPrompt: {
      'one-time-brand-helper-toolbar-audit': {
        result_ref: 'AGR-started',
        prompt_key: 'one-time-brand-helper-toolbar-audit',
        status: 'in_progress',
        requirement_id: 'REQ-20260707-136',
        idempotency_key: '2026-06-26-agent-review-dropoff-repair:one-time-brand-helper-toolbar-audit:all-contexts',
        started_at: '2026-07-08T00:00:00.000Z',
      },
    },
  });
  const prompt = index.find((item) => item.key === 'one-time-brand-helper-toolbar-audit');
  assert.equal(prompt.status, 'in_progress');
  assert.equal(prompt.workflow_state, 'in_progress');
  assert.equal(prompt.last_result_ref, 'AGR-started');
  assert.equal(prompt.copy_metadata.current_result_ref, 'AGR-started');

  const copiedIndex = buildPromptIndex({
    baseUrl: 'https://bneineviimacademy.org',
    resultsByPrompt: {
      'one-time-public-signup-whatsapp-workflow': {
        result_ref: 'AGR-copied',
        prompt_key: 'one-time-public-signup-whatsapp-workflow',
        status: 'in_progress',
        workflow_state: 'prompt_copied',
        requirement_id: 'REQ-20260708-071',
        idempotency_key: '2026-06-26-agent-review-dropoff-repair:one-time-public-signup-whatsapp-workflow:all-contexts',
        started_at: '2026-07-08T00:00:00.000Z',
      },
    },
  });
  const copiedPrompt = copiedIndex.find((item) => item.key === 'one-time-public-signup-whatsapp-workflow');
  assert.equal(copiedPrompt.status, 'in_progress');
  assert.equal(copiedPrompt.workflow_state, 'prompt_copied');
  assert.equal(copiedPrompt.copy_metadata.current_workflow_state, 'prompt_copied');
});

test('FAIL and BLOCKED Agent Review results create repair and rerun metadata', () => {
  const repair = buildAgentReviewRepairItem({
    resultRef: 'AGR-static',
    promptKey: 'student-portal',
    requirementId: 'REQ-20260626-004',
    status: 'blocked',
    severity: 'high',
    blocker: 'Scoped session opened public helper.',
  });
  assert.ok(repair);
  assert.match(repair.repair_ref, /^AGR-REPAIR-/);
  assert.match(repair.requirement_id, /^REQ-REPAIR-/);
  assert.match(repair.operations_url, /\/operations\/agent-review\?repair=AGR-REPAIR-/);
  const rerun = renderRerunPrompt({ resultRef: 'AGR-static', repair, baseUrl: 'https://bneineviimacademy.org' });
  assert.match(rerun, /Rerun/);
  assert.match(rerun, /Drop-off URL|Return\/drop-off URL/);
});

test('Agent Review newest-recording trace is available in the deploy bundle', () => {
  assert.match(server, /newestRecordingTraceStatus/);
  assert.match(server, /2026-06-25-issue-24-newest-recording/);
  assert.match(railwayRedeploy, /action-registry\.json/);
  assert.match(railwayRedeploy, /route-registry\.json/);
  assert.match(railwayRedeploy, /2026-06-25-issue-24-newest-recording/);
  assert.match(railwayRedeploy, /NEWEST-RECORDING-TRACE\.json/);
  assert.match(railwayRedeploy, /NEWEST-RECORDING-TRACE\.md/);
});

test('hub and session pages expose banner, Exit, prompt links, and typed result control', () => {
  assert.match(hub, /Agent Review Hub/);
  assert.match(hub, /ACTION-AGENT-REVIEW-OPEN-CONTEXT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-SUBMIT-RESULT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-PROMPT-OPEN/);
  assert.match(hub, /ACTION-AGENT-REVIEW-START-AUDIT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-COPY-PROMPT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-OPEN-DROPOFF/);
  assert.match(hub, /ACTION-AGENT-REVIEW-MARK-BLOCKED/);
  assert.match(hub, /ACTION-AGENT-REVIEW-VIEW-RESULT/);
  assert.match(hub, /ACTION-AGENT-REVIEW-RERUN-PROMPT/);
  assert.match(hub, /copyPrompt/);
  assert.match(hub, /startPromptAudit/);
  assert.match(hub, /recordPromptCopied/);
  assert.match(hub, /prompt_copied/);
  assert.match(hub, /Ready To Copy/);
  assert.match(hub, /Running \/ Drop-off Needed/);
  assert.match(hub, /Saved \/ Needs Repair/);
  assert.match(hub, /promptLaneKey/);
  assert.match(hub, /\/api\/bna\/agent-review\/prompts\/start/);
  assert.match(hub, /\/api\/bna\/agent-review\/results/);
  assert.match(hub, /Starting audit before copy/);
  assert.match(hub, /Copy Agent Prompt/);
  assert.match(hub, /Prompt copied and moved to Running \/ Drop-off Needed/);
  assert.match(hub, /Start Audit/);
  assert.match(hub, /Started \$\{elapsedLabel/);
  assert.match(hub, /markPromptBlocked/);
  assert.match(hub, /newest_recording_trace/);
  assert.match(hub, /\.\.\.options,\s*credentials: 'same-origin',\s*headers: \{ 'Content-Type': 'application\/json', \.\.\.\(options\.headers \|\| \{\}\) \}/);

  assert.match(session, /Reviewing as/);
  assert.match(session, /exchangeToken/);
  assert.match(session, /history\.replaceState\(\{\}, '', '\/agent-review\/session'\)/);
  assert.match(session, /HttpOnly cookie/);
  assert.match(session, /ACTION-AGENT-REVIEW-EXIT/);
  assert.match(session, /ACTION-AGENT-REVIEW-OPEN-TARGET/);
  assert.match(session, /ACTION-AGENT-REVIEW-COPY-SESSION/);
  assert.match(session, /ACTION-AGENT-REVIEW-OPEN-DROPOFF/);
  assert.match(session, /save BLOCKED/);
  assert.match(session, /\/api\/bna\/agent-review\/results/);
  assert.match(session, /\.\.\.options,\s*credentials: 'same-origin',\s*headers: \{ 'Content-Type': 'application\/json', \.\.\.\(options\.headers \|\| \{\}\) \}/);

  assert.match(dropoff, /Agent Review Drop-Off/);
  assert.match(dropoff, /Emergency paste JSON and save/);
  assert.match(dropoff, /blocked_route_or_step/);
  assert.match(dropoff, /attempted_action/);
  assert.match(dropoff, /observed_failure/);
  assert.match(dropoff, /partial_routes_visited/);
  assert.match(dropoff, /partial_helper_responses/);
  assert.match(dropoff, /evidence_notes/);
  assert.match(dropoff, /readbackMeta/);
  assert.match(dropoff, /Draft saved locally in this browser/);
  assert.match(dropoff, /Draft not autosaved because it looks like it may contain a secret/);
  assert.match(dropoff, /ACTION-AGENT-REVIEW-SUBMIT-RESULT/);
  assert.match(dropoff, /ACTION-AGENT-REVIEW-MARK-BLOCKED/);
  assert.match(dropoff, /ACTION-AGENT-REVIEW-VIEW-RESULT/);
  assert.match(dropoff, /ACTION-AGENT-REVIEW-RERUN-PROMPT/);
  assert.match(dropoff, /\/api\/bna\/agent-review\/dropoff-context/);
  assert.match(dropoff, /\/api\/bna\/agent-review\/results/);
  assert.match(dropoff, /parseReport/);
  assert.match(dropoff, /autoSaveRequested/);
  assert.match(dropoff, /scheduleAutosave/);
  assert.match(dropoff, /Local draft autosave is enabled/);
  assert.match(dropoff, /Ctrl\+Enter/);
  assert.match(dropoff, /requestSubmit\(\)/);
});

test('Agent Review pages inline scripts parse', () => {
  for (const [label, html] of [['hub', hub], ['session', session], ['dropoff', dropoff]]) {
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
    '/operations/agent-review/dropoff',
    '/api/bna/agent-review/contexts',
    '/api/bna/agent-review/prompts/start',
    '/api/bna/agent-review/dropoff-context',
    '/api/bna/agent-review/sessions',
    '/api/bna/agent-review/session',
    '/api/bna/agent-review/results',
    '/api/bna/agent-review/results/:resultRef',
  ].forEach((route) => assert.ok(routes.has(route), route));

  const actions = new Set(actionRegistry.actions.map((item) => item.action_id));
  [
    'ACTION-AGENT-REVIEW-OPEN-CONTEXT',
    'ACTION-AGENT-REVIEW-OPEN-TARGET',
    'ACTION-AGENT-REVIEW-EXIT',
    'ACTION-AGENT-REVIEW-SUBMIT-RESULT',
    'ACTION-AGENT-REVIEW-PROMPT-OPEN',
    'ACTION-AGENT-REVIEW-START-AUDIT',
    'ACTION-AGENT-REVIEW-RETURN-HUB',
    'ACTION-AGENT-REVIEW-COPY-SESSION',
    'ACTION-AGENT-REVIEW-COPY-PROMPT',
    'ACTION-AGENT-REVIEW-OPEN-DROPOFF',
    'ACTION-AGENT-REVIEW-MARK-BLOCKED',
    'ACTION-AGENT-REVIEW-VIEW-RESULT',
    'ACTION-AGENT-REVIEW-RERUN-PROMPT',
  ].forEach((action) => assert.ok(actions.has(action), action));
});
