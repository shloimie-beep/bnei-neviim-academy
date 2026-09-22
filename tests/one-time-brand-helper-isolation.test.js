const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const oneTime = fs.readFileSync('public/one-time/index.html', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const appSelect = fs.readFileSync('public/js/app-select.js', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

test('One Time landing uses direct WhatsApp launcher without BNA helper chrome', () => {
  assert.match(oneTime, /<html lang="en" data-app-select-surface="one-time" data-one-time-current-masechta="Maseches Berachos">/);
  assert.match(oneTime, /class="one-time-whatsapp-launcher"/);
  assert.match(oneTime, /href="\/api\/one-time\/public-whatsapp\/redirect\?intent=free_class"/);
  assert.match(oneTime, /aria-label="Open WhatsApp for One Time Mishnayos class information"/);
  assert.match(oneTime, /data-action-id="ACTION-ONETIME-PUBLIC-WHATSAPP"/);
  assert.doesNotMatch(oneTime, /<script src="\/js\/bna-helper-knowledge\.js"/);
  assert.doesNotMatch(oneTime, /<script src="\/js\/bna-bot-widget\.js"/);
  assert.doesNotMatch(oneTime, /href="https:\/\/wa\.me/);
  assert.doesNotMatch(oneTime, /Robot Scheller/);
  assert.doesNotMatch(oneTime, /data-bna-site-nav/);
  assert.doesNotMatch(oneTime, /\/js\/bna-site-nav\.js/);
  assert.doesNotMatch(oneTime, /\/js\/app-select\.js/);
  assert.doesNotMatch(oneTime, /id="languageToggle"|data-language-toggle/);
});

test('One Time public WhatsApp launcher uses same-origin runtime redirect and black-yellow landing skin', () => {
  assert.match(oneTime, /\.one-time-whatsapp-launcher/);
  assert.match(oneTime, /background: #25d366/);
  assert.match(oneTime, /\.one-time-whatsapp-launcher:focus-visible/);
  assert.match(oneTime, /body\.modal-open \.one-time-whatsapp-launcher/);
  assert.match(oneTime, /target="_blank"/);
  assert.match(oneTime, /rel="noopener noreferrer"/);
  assert.match(server, /function oneTimePublicWhatsAppReadiness\(\)/);
  assert.match(server, /ONE_TIME_PUBLIC_WHATSAPP_NUMBER/);
  assert.match(server, /redirect_path: configured \? '\/api\/one-time\/public-whatsapp\/redirect'/);
  assert.match(server, /no_whatsapp_sent: true/);
  assert.match(server, /external_write_performed: false/);
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
  assert.match(server, /One Time public landing\/class\/signup context only/);
  assert.match(server, /Do not use BNA Academy enrollment, BNA accountability, BNA service-provider, BNA parent\/student portal, or generic BNA public helper knowledge as One Time public facts/);
  assert.match(server, /if \(surface\.startsWith\('one_time_'\)\) return WORKSPACES\.RABBI_SHELLER_PROVIDER/);
});

test('One Time parent and student review routes mount scoped helper copy', () => {
  assert.match(widget, /const isOneTimeParentReview = isOneTimeReview && isParent/);
  assert.match(widget, /const isOneTimeLoginMode =/);
  assert.match(widget, /const isOneTimeHostDocument =/);
  assert.match(widget, /const isOneTimeStudentReviewOnly = isOneTimeReview && isStudent/);
  assert.match(widget, /const isOneTimeStudentReview = !isOneTimeStudentReviewOnly && \(isOneTimeLoginMode \|\| isOneTimeHostDocument\) && isStudent/);
  assert.match(widget, /const isOneTimeProviderReview = isProvider &&/);
  assert.match(widget, /if \(isOneTimeReview && !isOneTimeParentReview && !isOneTimeStudentReview && !isOneTimeProviderReview\) return/);
  assert.match(widget, /\? 'one_time_parent'/);
  assert.match(widget, /\? 'one_time_student'/);
  assert.match(widget, /\? 'one_time_provider'/);
  assert.match(widget, /surface === 'one_time_parent'/);
  assert.match(widget, /Robot Scheller/);
  assert.match(widget, /Rabbi Scheller's digital assistant/);
  assert.match(widget, /I do not show private billing records, other families, student transcripts, access codes, or admin data/);
  assert.match(widget, /surface === 'one_time_student'/);
  assert.match(widget, /I do not show parent billing, private parent messages, other students, full transcripts, access codes, or admin data/);
  assert.match(widget, /surface === 'one_time_provider'/);
  assert.match(widget, /I will keep this workspace scoped to the One Time Mishnayos class/);
  assert.doesNotMatch(widget, /One Time Parent Helper|One Time Student Helper|Rabbi Scheller Admin Helper|Rabbi Scheller Assistant/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-parent \.bna-bot-launcher/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-student \.bna-bot-launcher/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-provider \.bna-bot-launcher/);
  assert.match(widget, /body\.one-time-review-active\.bna-assistant-surface-one-time-parent \.bna-bot-launcher/);
  assert.match(widget, /@media \(max-width: 520px\)[\s\S]*body\.bna-assistant-surface-one-time-provider \.bna-bot-launcher[\s\S]*font-size: 0/);
  assert.match(widget, /Billing question/);
  assert.match(widget, /Attendance question/);
  assert.match(widget, /Library preview/);
});

test('One Time student login route hides legacy access-code fallback and mounts scoped helper', () => {
  const student = fs.readFileSync('public/student.html', 'utf8');
  assert.match(student, /const ONE_TIME_LOGIN_MODE =/);
  assert.match(student, /ONE_TIME_HOST_MODE && !ONE_TIME_REVIEW_MODE/);
  assert.match(student, /accessDivider\.classList\.add\('hidden'\)/);
  assert.match(student, /codeForm\.classList\.add\('hidden'\)/);
  assert.match(student, /One Time Student Login/);
  assert.match(student, /<a class="portal-topbar-link secondary-link" href="\/one-time-parent">Parent<\/a>/);
  assert.match(widget, /query\.get\('one_time_login'\)/);
  assert.match(widget, /bna-assistant-surface-one-time-student/);
});

test('One Time public helper launcher is archived from the visible landing action set', () => {
  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-PUBLIC-HELPER-OPEN');
  assert.ok(action);
  assert.equal(action.route, '/one-time');
  assert.equal(action.label, 'Robot Scheller public helper');
  assert.equal(action.status, 'removed_from_public_landing');
  assert.match(action.selector_hint, /removed from public\/one-time\/index\.html/);
  assert.match(action.expected_behavior, /ACTION-ONETIME-PUBLIC-WHATSAPP/);
});

test('One Time public WhatsApp action is registry-covered and no-send at runtime', () => {
  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-PUBLIC-WHATSAPP');
  assert.ok(action);
  assert.equal(action.route, '/one-time');
  assert.equal(action.label, 'Open WhatsApp');
  assert.match(action.handler, /\/api\/one-time\/public-whatsapp\/redirect/);
  assert.match(action.status, /active_runtime_redirect_with_setup_fallback/);
  assert.match(action.expected_behavior, /ONE_TIME_PUBLIC_WHATSAPP_NUMBER/);
  assert.match(action.expected_behavior, /performs no WhatsApp send by itself/);
  assert.match(oneTime, /ACTION-ONETIME-PUBLIC-WHATSAPP/);
  assert.match(oneTime, /\/api\/one-time\/public-whatsapp\/redirect\?intent=free_class/);
  assert.match(server, /const ONE_TIME_PUBLIC_WHATSAPP_NUMBER/);
  assert.match(server, /app\.get\(\['\/api\/one-time\/public-whatsapp', '\/api\/bna\/one-time\/public-whatsapp'\]/);
  assert.match(server, /full_number_returned: false/);
  assert.match(server, /no_whatsapp_sent: true/);
  assert.match(server, /external_write_performed: false/);
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
  assert.equal(parentAction.label, 'Robot Scheller');
  assert.match(parentAction.expected_behavior, /without exposing private billing records/);
  assert.ok(studentAction);
  assert.equal(studentAction.route, '/student.html?review=one-time');
  assert.equal(studentAction.label, 'Robot Scheller');
  assert.match(studentAction.expected_behavior, /without exposing parent billing/);
});

test('One Time parent and student review helper routes are registry-covered', () => {
  const routes = new Map(routeRegistry.routes.map((item) => [item.route, item]));
  assert.equal(routes.get('/parent.html?review=one-time')?.surface, 'one_time_parent_review_preview');
  assert.match(routes.get('/parent.html?review=one-time')?.security_expectation || '', /no database write or external send/);
  assert.equal(routes.get('/student.html?review=one-time')?.surface, 'one_time_student_review_preview');
  assert.match(routes.get('/student.html?review=one-time')?.security_expectation || '', /no database write or external send/);
});
