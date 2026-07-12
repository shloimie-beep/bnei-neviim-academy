const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const oneTime = fs.readFileSync('public/one-time/index.html', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const appSelect = fs.readFileSync('public/js/app-select.js', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

test('One Time landing uses direct WhatsApp lead capture without BNA nav or helper chrome', () => {
  assert.match(oneTime, /<html lang="en" data-app-select-surface="one-time" data-one-time-current-masechta="Maseches Berachos">/);
  assert.match(oneTime, /class="whatsapp-lead-launcher"/);
  assert.match(oneTime, /href="\/api\/one-time\/public-whatsapp\/redirect\?intent=lead_capture"/);
  assert.match(oneTime, /data-action-id="ACTION-ONETIME-PUBLIC-WHATSAPP"/);
  assert.match(oneTime, /Open One Time WhatsApp lead capture/);
  assert.doesNotMatch(oneTime, /data-bna-site-nav/);
  assert.doesNotMatch(oneTime, /\/js\/bna-site-nav\.js/);
  assert.doesNotMatch(oneTime, /\/js\/app-select\.js/);
  assert.doesNotMatch(oneTime, /\/js\/bna-helper-knowledge\.js/);
  assert.doesNotMatch(oneTime, /\/js\/bna-bot-widget\.js/);
  assert.doesNotMatch(oneTime, /robot-scheller-whatsapp\.png/);
  assert.doesNotMatch(oneTime, /id="languageToggle"|data-language-toggle/);
});

test('One Time public helper fallback has separate lead-capture surface and no BNA language', () => {
  assert.match(widget, /const isOneTimePublic = /);
  assert.match(widget, /const isOneTimePublicDocument = /);
  assert.match(widget, /\['\/rabbi-preview', '\/one-time-mishnayos'\]\.includes\(path\)/);
  assert.match(widget, /document\.documentElement\?\.dataset\?\.appSelectSurface === 'one-time'/);
  assert.match(widget, /&& !isParent\s+&& !isStudent\s+&& !isProvider\s+&& !\/\^\(\?:\\\/rabbi-member\|\\\/member-library\|\\\/one-time-classroom/);
  assert.match(widget, /\? 'one_time_public'/);
  assert.match(widget, /surface === 'one_time_public'/);
  assert.match(widget, /One Time WhatsApp/);
  assert.match(widget, /Rabbi Scheller class lead capture/);
  assert.match(widget, /ONE_TIME_PUBLIC_FIRST_NUDGE_DELAY_MS = 10000/);
  assert.match(widget, /ONE_TIME_PUBLIC_SECOND_NUDGE_DELAY_MS = 20000/);
  assert.match(widget, /name, location, and contact information/);
  assert.match(widget, /Open One Time WhatsApp lead capture/);
  assert.match(widget, /Sign Up Now/);
  assert.match(widget, /type: 'signup'/);
  assert.match(widget, /Question for Rabbi Scheller/);
  assert.match(widget, /Current class information/);
  assert.match(widget, /Open WhatsApp/);
  assert.match(widget, /\/api\/one-time\/public-whatsapp\/redirect\?intent=lead_capture/);
  assert.match(widget, /bna-assistant-surface-one-time-public/);
  assert.match(widget, /body\.bna-assistant-surface-one-time-public \.bna-bot-launcher/);

  const oneTimePublicDataBlock = widget.slice(
    widget.indexOf('function oneTimePublicHelperData()'),
    widget.indexOf('function fallbackPublicHelperData()')
  );
  assert.match(oneTimePublicDataBlock, /name, location, and contact information/);
  assert.match(oneTimePublicDataBlock, /Sign Up Now/);
  assert.match(oneTimePublicDataBlock, /type: 'signup'/);
  assert.match(oneTimePublicDataBlock, /oneTimeJoinMomentCopy\(\)/);
  assert.match(oneTimePublicDataBlock, /lead_capture/);
  assert.doesNotMatch(oneTimePublicDataBlock, /Robot Scheller/);
  assert.doesNotMatch(oneTimePublicDataBlock, /Join the free class/);
  assert.doesNotMatch(oneTimePublicDataBlock, /approved free Zoom/);
  assert.doesNotMatch(oneTimePublicDataBlock, /Do you want your son to love Torah/);
  assert.doesNotMatch(oneTimePublicDataBlock, /I only answer public One Time questions/);
  assert.doesNotMatch(oneTimePublicDataBlock, /private parent billing, attendance, student transcripts, access codes, raw class transcripts, or admin data/);
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

test('One Time public Robot image launcher is superseded by direct WhatsApp icon', () => {
  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-PUBLIC-HELPER-OPEN');
  assert.ok(action);
  assert.equal(action.route, '/one-time');
  assert.equal(action.label, 'Legacy Robot Scheller Assistant');
  assert.match(action.status, /superseded_by_direct_whatsapp_icon/);
  assert.match(action.expected_behavior, /old Robot image launcher is not rendered/);
});

test('One Time public WhatsApp action is registry-covered and no-send at runtime', () => {
  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-ONETIME-PUBLIC-WHATSAPP');
  assert.ok(action);
  assert.equal(action.route, '/one-time');
  assert.equal(action.label, 'Open WhatsApp Assistant');
  assert.match(action.handler, /\/api\/one-time\/public-whatsapp\/redirect/);
  assert.match(action.status, /active_runtime_configured_or_signup_fallback/);
  assert.match(action.expected_behavior, /ONE_TIME_PUBLIC_WHATSAPP_NUMBER/);
  assert.match(action.expected_behavior, /name, location, and contact information/);
  assert.match(action.expected_behavior, /performs no WhatsApp send by itself/);
  assert.match(oneTime, /ACTION-ONETIME-PUBLIC-WHATSAPP/);
  assert.match(oneTime, /\/api\/one-time\/public-whatsapp\/redirect\?intent=lead_capture/);
  assert.match(widget, /\/api\/one-time\/public-whatsapp\/redirect\?intent=current_info/);
  assert.match(widget, /\/api\/one-time\/public-whatsapp\/redirect\?intent=lead_capture/);
  assert.match(server, /const ONE_TIME_PUBLIC_WHATSAPP_NUMBER/);
  assert.match(server, /My location is:/);
  assert.match(server, /please ask me for it instead of guessing/);
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
