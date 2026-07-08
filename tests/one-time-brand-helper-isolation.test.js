const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const oneTime = fs.readFileSync('public/one-time/index.html', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const appSelect = fs.readFileSync('public/js/app-select.js', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

test('One Time landing mounts helper without BNA nav or language toggle chrome', () => {
  assert.match(oneTime, /<html lang="en" data-app-select-surface="one-time">/);
  assert.match(oneTime, /<script src="\/js\/bna-helper-knowledge\.js"><\/script>\s*<script src="\/js\/bna-bot-widget\.js"><\/script>\s*<script src="\/js\/app-select\.js"><\/script>/);
  assert.doesNotMatch(oneTime, /data-bna-site-nav/);
  assert.doesNotMatch(oneTime, /\/js\/bna-site-nav\.js/);
  assert.doesNotMatch(oneTime, /id="languageToggle"|data-language-toggle/);
});

test('One Time public helper has separate surface, copy, actions, and black-yellow skin', () => {
  assert.match(widget, /const isOneTimePublic = /);
  assert.match(widget, /const isOneTimePublicDocument = /);
  assert.match(widget, /\['\/rabbi-preview', '\/one-time-mishnayos'\]\.includes\(path\)/);
  assert.match(widget, /document\.documentElement\?\.dataset\?\.appSelectSurface === 'one-time'/);
  assert.match(widget, /\? 'one_time_public'/);
  assert.match(widget, /surface === 'one_time_public'/);
  assert.match(widget, /Rabbi Scheller digital assistant/);
  assert.match(widget, /Rabbi Scheller Assistant/);
  assert.match(widget, /I only answer public OneTime questions and do not show private parent billing, attendance, student transcripts, access codes, raw class transcripts, or admin data/);
  assert.match(widget, /Open Rabbi Scheller Assistant/);
  assert.match(widget, /Speak to Rabbi Scheller/);
  assert.match(widget, /Start 30 days free/);
  assert.match(widget, /bna-assistant-surface-one-time-public/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-public \.bna-bot-launcher/);

  const oneTimePublicDataBlock = widget.slice(
    widget.indexOf('function oneTimePublicHelperData()'),
    widget.indexOf('function fallbackPublicHelperData()')
  );
  assert.match(oneTimePublicDataBlock, /Rabbi Scheller's digital assistant/);
  assert.doesNotMatch(oneTimePublicDataBlock, /Learn about BNA|How BNA works|BNA model path|Service-provider ecosystem path/);
});

test('One Time select controls do not use the default BNA-blue app-select theme', () => {
  assert.match(appSelect, /html\[data-app-select-surface="one-time"\] \.app-select__button/);
  assert.match(appSelect, /html\[data-app-select-surface="one-time"\] \.app-select__menu[\s\S]*background: #080910/);
  assert.match(appSelect, /html\[data-app-select-surface="one-time"\] \.app-select__option\.is-active[\s\S]*background: #ede518/);
});

test('One Time helper surfaces normalize and store under the One Time project', () => {
  assert.match(server, /one_time_public', 'onetime_public', 'one_time_landing'/);
  assert.match(server, /one_time_parent', 'onetime_parent'/);
  assert.match(server, /one_time_student', 'onetime_student'/);
  assert.match(server, /function assistantProjectForSurface\(surface\)/);
  assert.match(server, /normalized\.startsWith\('one_time_'\)/);
  assert.match(server, /projectKey: ONE_TIME_PROJECT_KEY/);
  assert.match(server, /metadata: \{ source: 'assistant_surface_scope', workspace_key: surfaceSpec\.workspaceKey \}/);
  assert.match(server, /surface === 'one_time_public'/);
  assert.match(server, /Rabbi Scheller digital assistant/);
  assert.match(server, /OneTime public landing\/class\/signup context only/);
  assert.match(server, /Do not use BNA Academy enrollment, BNA accountability, BNA service-provider, BNA parent\/student portal, or generic BNA public helper knowledge as OneTime public facts/);
  assert.match(server, /if \(surface\.startsWith\('one_time_'\)\) return WORKSPACES\.RABBI_SHELLER_PROVIDER/);
});

test('One Time parent and student review routes mount scoped helper copy', () => {
  assert.match(widget, /const isOneTimeParentReview = isOneTimeReview && isParent/);
  assert.match(widget, /const isOneTimeStudentReview = isOneTimeReview && isStudent/);
  assert.match(widget, /if \(isOneTimeReview && !isOneTimeParentReview && !isOneTimeStudentReview\) return/);
  assert.match(widget, /\? 'one_time_parent'/);
  assert.match(widget, /\? 'one_time_student'/);
  assert.match(widget, /surface === 'one_time_parent'/);
  assert.match(widget, /One Time Parent Helper/);
  assert.match(widget, /I do not show private billing records, other families, student transcripts, access codes, or admin data/);
  assert.match(widget, /surface === 'one_time_student'/);
  assert.match(widget, /One Time Student Helper/);
  assert.match(widget, /I do not show parent billing, private parent messages, other students, full transcripts, access codes, or admin data/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-parent \.bna-bot-launcher/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-student \.bna-bot-launcher/);
  assert.match(widget, /Billing question/);
  assert.match(widget, /Attendance question/);
  assert.match(widget, /Library preview/);
});

test('One Time public helper launcher is registered as a visible action', () => {
  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-PUBLIC-HELPER-OPEN');
  assert.ok(action);
  assert.equal(action.route, '/one-time');
  assert.equal(action.label, 'Rabbi Scheller Assistant');
  assert.match(action.expected_behavior, /schedule, program, 30-day trial, member login/);
  assert.match(action.expected_behavior, /raw class transcripts/);
});

test('One Time Rabbi public aliases are registry-covered and route to the focused landing', () => {
  const routes = new Map(routeRegistry.routes.map((item) => [item.route, item]));
  for (const route of ['/rabbi', '/rabbi.html', '/rabbi-preview', '/one-time-mishnayos']) {
    const row = routes.get(route);
    assert.ok(row, `${route} missing from route registry`);
    assert.equal(row.canonical_target, '/one-time');
    assert.match(row.expected_logged_out_behavior || '', /without_bna_preview_chrome/);
    assert.match(row.security_expectation || '', /no BNA provider preview|legacy BNA preview|Server route must intercept/);
  }
  assert.match(server, /app\.get\(\['\/rabbi\.html'\], sendOneTimePublicLanding\)/);
  assert.match(server, /app\.get\(\['\/rabbi', '\/rabbi-preview', '\/one-time-mishnayos'\], sendOneTimePublicLanding\)/);
});

test('One Time parent and student helper launchers are registered visible actions', () => {
  const parentAction = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-PARENT-HELPER-OPEN');
  const studentAction = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-STUDENT-HELPER-OPEN');
  assert.ok(parentAction);
  assert.equal(parentAction.route, '/parent.html?review=one-time');
  assert.match(parentAction.expected_behavior, /without exposing private billing records/);
  assert.ok(studentAction);
  assert.equal(studentAction.route, '/student.html?review=one-time');
  assert.match(studentAction.expected_behavior, /without exposing parent billing/);
});

test('One Time parent and student review helper routes are registry-covered', () => {
  const routes = new Map(routeRegistry.routes.map((item) => [item.route, item]));
  assert.equal(routes.get('/parent.html?review=one-time')?.surface, 'one_time_parent_review_preview');
  assert.match(routes.get('/parent.html?review=one-time')?.security_expectation || '', /no database write or external send/);
  assert.equal(routes.get('/student.html?review=one-time')?.surface, 'one_time_student_review_preview');
  assert.match(routes.get('/student.html?review=one-time')?.security_expectation || '', /no database write or external send/);
});
