const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const loginHtml = fs.readFileSync('public/operations-login.html', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const publicIndexHtml = fs.readFileSync('public/index.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const operationsManifest = JSON.parse(fs.readFileSync('public/operations-manifest.json', 'utf8'));
const publicManifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
const parentManifest = JSON.parse(fs.readFileSync('public/parent-manifest.json', 'utf8'));
const serviceWorker = fs.readFileSync('public/sw.js', 'utf8');
const serverJs = fs.readFileSync('server.js', 'utf8');

test('Operations login installs and resumes as the Operations PWA', () => {
  assert.match(loginHtml, /<link rel="manifest" href="\/operations-manifest\.json">/);
  assert.equal(operationsManifest.id, '/operations');
  assert.equal(operationsManifest.start_url, '/operations?source=ops-pwa');
  assert.equal(operationsManifest.scope, '/operations');
  assert.equal(operationsManifest.icons[0].src, '/icons/operations-icon.svg');
  assert.equal(operationsManifest.background_color, '#f8f5ee');
  assert.match(serviceWorker, /bna-public-v10/);
});

test('public and parent installs do not open Operations', () => {
  assert.equal(publicManifest.start_url, '/?source=public-pwa');
  assert.equal(parentManifest.id, '/parent');
  assert.equal(parentManifest.start_url, '/parent?source=parent-pwa');
  assert.equal(parentManifest.scope, '/parent');
  assert.equal(parentManifest.icons[0].src, '/icons/parent-icon.svg');
  assert.match(parentHtml, /<link rel="manifest" href="\/parent-manifest\.json">/);
  assert.doesNotMatch(serviceWorker, /\/parent-manifest\.json/);
  assert.doesNotMatch(serviceWorker, /\/operations-manifest\.json/);
  assert.match(serviceWorker, /PRIVATE_APP_PREFIXES/);
  assert.match(serviceWorker, /isPrivateAppPath\(url\.pathname\)/);
  assert.match(publicIndexHtml, /<title>Bnei Nevi'im Academy \| Torah Learning for Boys<\/title>/);
  assert.doesNotMatch(publicIndexHtml, /href="\/operations-login\.html" class="nav-link" data-i18n="navOperations"/);
  assert.doesNotMatch(publicIndexHtml, /navOperations/);
  assert.doesNotMatch(publicIndexHtml, /redirectStandaloneLaunchToOperations|\/operations\?source=pwa/);
  assert.doesNotMatch(serverJs, /source === 'pwa'[\s\S]{0,120}res\.redirect\('\/'\)/);
});

test('public navigation keeps Operations out of prospect-facing menus', () => {
  const siteNav = fs.readFileSync('public/js/bna-site-nav.js', 'utf8');
  assert.doesNotMatch(siteNav, /operationsLogin/);
  assert.doesNotMatch(siteNav, /\/operations-login\.html/);
  assert.match(siteNav, /Advertise for free/);
  assert.match(publicIndexHtml, /Advertise for free/);
});

test('Operations login preserves only safe Operations return paths', () => {
  assert.match(loginHtml, /function operationsReturnTo\(\)/);
  assert.match(loginHtml, /allowedPaths = new Set\(\['\/operations', '\/operations\/agent-review', '\/operations\/agent-review\/dropoff'\]\)/);
  assert.match(loginHtml, /url\.origin !== window\.location\.origin \|\| !allowedPaths\.has\(url\.pathname\)/);
  assert.match(loginHtml, /window\.location\.href = operationsReturnTo\(\)/);
  assert.match(loginHtml, /window\.location\.replace\(operationsReturnTo\(\)\)/);
  assert.match(loginHtml, /function isOperationsSession\(data\)/);
  assert.match(loginHtml, /\['super_admin', 'project_owner', 'project_manager', 'one_time_ai_studio_operator', 'one_time_ai_video_worker'\]\.includes\(role\)/);
  assert.match(loginHtml, /response\.ok && isOperationsSession\(data\)/);
  assert.match(loginHtml, /redirectIfAlreadySignedIn\(\)/);
});

test('Operations login accepts configured admin email aliases without mixing portal accounts', () => {
  assert.match(serverJs, /function parseOpsLoginAliases/);
  assert.match(serverJs, /process\.env\.OPS_LOGIN_ALIASES/);
  assert.match(serverJs, /process\.env\.EMAIL_CC_SHLOIMIE/);
  assert.match(serverJs, /OPS_LOGIN_ALIASES\.has\(normalizedUser\)/);
  assert.match(serverJs, /username: OPS_USERNAME/);
  assert.match(loginHtml, /Operations email or username/);
  assert.match(loginHtml, /Use the same identity password from any legitimate portal/);
  assert.match(loginHtml, /Access still follows your actual role and workspace permissions/);
  assert.match(loginHtml, /document\.getElementById\('username'\)\.value\.trim\(\)/);
  assert.doesNotMatch(serverJs, /bna_parent_password_accounts[\s\S]{0,500}role: 'super_admin'/);
});

test('Operations login remains stable while typing on mobile keyboards', () => {
  assert.match(loginHtml, /--login-vh/);
  assert.match(loginHtml, /function syncLoginViewport\(\)/);
  assert.match(loginHtml, /window\.visualViewport\?\.addEventListener\('resize', syncLoginViewport\)/);
  assert.match(loginHtml, /function loginTextEntryActive\(\)/);
  assert.match(loginHtml, /if \(loginTextEntryActive\(\)\) return;/);
  assert.match(loginHtml, /function isOperationsSession\(data\)/);
  assert.doesNotMatch(loginHtml, /\/js\/bna-bot-widget\.js/);
  assert.match(loginHtml, /@media \(max-width: 640px\)[\s\S]*input \{[\s\S]*font-size: 16px;/);
  assert.doesNotMatch(loginHtml, /html,\s*body\s*\{\s*width:\s*100%;\s*height:\s*100%;\s*\}/);
});

test('Operations dashboard skips background refresh while text entry is active', () => {
  assert.match(operationsHtml, /function backgroundRefreshCanRun\(\)/);
  assert.match(operationsHtml, /return !renderShouldWaitForTextEntry\(\)/);
  assert.match(operationsHtml, /if \(!backgroundRefreshCanRun\(\)\) return;\s*loadData\(\{ background: true \}\);/);
});

test('Operations shell falls back scoped Studio/task-only sessions to allowed views', () => {
  assert.match(operationsHtml, /function firstAllowedViewForWorkspace/);
  assert.match(operationsHtml, /function ensureCurrentViewAllowedForWorkspace/);
  assert.match(operationsHtml, /function isStudioTaskOnlySession/);
  assert.match(operationsHtml, /\['studio', 'tasks', 'dashboard'\]/);
  assert.match(operationsHtml, /one_time_ai_video_worker/);
  assert.match(operationsHtml, /const needsPipelineData = !studioTaskOnlySession/);
  assert.match(operationsHtml, /const needsAgentFleetData = !studioTaskOnlySession/);
  assert.match(operationsHtml, /const needsQueueHealthData = !studioTaskOnlySession/);
  assert.doesNotMatch(operationsHtml, /if \(!viewAllowed\(currentView\)\) currentView = 'dashboard'/);
});

test('Operations Admin Roles exposes read-only role and access policy matrix', () => {
  assert.match(operationsHtml, /function renderAdminRolesPolicyPanel/);
  assert.match(operationsHtml, /data-role-access-policy-matrix/);
  assert.match(operationsHtml, /Role \/ Access Policy Matrix/);
  assert.match(operationsHtml, /Second Parent \/ Spouse/);
  assert.match(operationsHtml, /Service Provider \/ Rabbi Sheller/);
  assert.match(operationsHtml, /Community Member/);
  assert.match(operationsHtml, /Codex \/ Agent Work/);
  assert.match(operationsHtml, /APPROVE_PARENT_WEEKLY_UPDATE_SEND/);
  assert.match(operationsHtml, /SEND_PARENT_PASSWORD_SETUP/);
  assert.match(operationsHtml, /APPROVE_GOOGLE_LIVE_ADAPTER_TEST/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE/);
  assert.match(operationsHtml, /This page does not create invitations, login tokens, password resets, email sends, WhatsApp sends, access grants, billing changes, or external connector writes/);
  assert.match(operationsHtml, /adminSection === 'roles' \? renderAdminRolesPolicyPanel\(\)/);
  assert.doesNotMatch(operationsHtml, /\['roles', 'invitations', 'messages', 'settings'\]\.includes\(adminSection\)/);
});

test('Operations Admin Users separates external users from parent accounts', () => {
  assert.match(operationsHtml, /function renderAdminUsersPanel/);
  assert.match(operationsHtml, /data-super-admin-user-management/);
  assert.match(operationsHtml, /Users \/ External Access/);
  assert.match(operationsHtml, /adminExternalUserRows/);
  assert.match(operationsHtml, /metadata\.account_type === 'external_user'/);
  assert.match(operationsHtml, /External project user\. This is not a parent account/);
  assert.match(operationsHtml, /Parent account separation/);
  assert.match(operationsHtml, /One Time app credentials/);
  assert.match(operationsHtml, /No email, WhatsApp, password reset, billing, member-library, or external connector write runs from this panel/);
  assert.match(operationsHtml, /External Access Create\/Edit Preview/);
  assert.match(operationsHtml, /data-admin-external-access-preview/);
  assert.match(operationsHtml, /previewExternalAccess/);
  assert.match(operationsHtml, /Real write locked/);
  assert.match(operationsHtml, /createAdminOpsAccessLink/);
  assert.match(operationsHtml, /api\.createOpsAccessLink/);
  assert.match(operationsHtml, /purpose: 'super_admin_external_user_access'/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/admin\/external-access'/);
  assert.match(serverJs, /dry_run: true/);
  assert.match(serverJs, /no_parent_account_created: true/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/ops-access-links'/);
  assert.match(serverJs, /Only the platform admin can create Operations access links/);
  assert.doesNotMatch(operationsHtml, /createParentAccountFromExternalUser/);
  assert.doesNotMatch(operationsHtml, /sendExternalUserInviteEmail/);
});

test('Operations Settings exposes read-only owner approval gateboard', () => {
  assert.match(operationsHtml, /approval_gates/);
  assert.match(operationsHtml, /function ownerApprovalGateItems/);
  assert.match(operationsHtml, /function renderOwnerApprovalGateboardSettings/);
  assert.match(operationsHtml, /data-owner-approval-gateboard/);
  assert.match(operationsHtml, /Owner Approval Gateboard/);
  assert.match(operationsHtml, /APPROVE_GOOGLE_LIVE_ADAPTER_TEST/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE/);
  assert.match(operationsHtml, /One Time question public\/member surface/);
  assert.match(operationsHtml, /The private digest is review-only/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_BILLING_PROVIDER_GREEN_INVOICE/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_REFUND_POLICY_R2_SEVEN_DAY_FIRST_PAYMENT/);
  assert.match(operationsHtml, /APPROVE_BUFFER_SOCIAL_DRAFT/);
  assert.match(operationsHtml, /RABBI_LIVE_APP_ACCESS_CONFIRMATION/);
  assert.match(operationsHtml, /APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW/);
  assert.match(operationsHtml, /APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET/);
  assert.match(operationsHtml, /No external writes run from this gateboard/);
  assert.match(operationsHtml, /if \(section === 'approval_gates'\) return renderOwnerApprovalGateboardSettings\(\)/);
  assert.doesNotMatch(operationsHtml, /submitOwnerApprovalGate|approveOwnerGate|runOwnerApprovalGate/);
});

test('Operations auth redirect sends browser users back to the requested Operations route', () => {
  assert.match(serverJs, /function safeOperationsReturnPath\(value\)/);
  assert.match(serverJs, /allowedPaths = new Set\(\[\s*'\/operations',\s*'\/operations\/agent-review',\s*'\/operations\/agent-review\/dropoff'/);
  assert.match(serverJs, /url\.origin !== 'https:\/\/bna\.local' \|\| !allowedPaths\.has\(url\.pathname\)/);
  assert.match(serverJs, /function operationsLoginUrlForRequest\(req\)/);
  assert.match(serverJs, /return `\/operations-login\.html\?returnTo=\$\{encodeURIComponent\(returnTo\)\}`;/);
  assert.match(serverJs, /return res\.redirect\(operationsLoginUrlForRequest\(req\)\);/);
});

test('Operations auth/me preserves scoped Studio worker sessions', () => {
  const routeStart = serverJs.indexOf("app.get('/api/bna/auth/me', async (req, res) => {");
  assert.ok(routeStart > -1, 'public auth/me route should exist');
  const routeBlock = serverJs.slice(routeStart, routeStart + 700);
  assert.match(routeBlock, /identifyOpsAssistantRequest\(req\)/);
  assert.match(routeBlock, /buildBnaIdentityPayload\(\{ identity: opsIdentity, req, actor: 'admin' \}\)/);
  assert.doesNotMatch(routeBlock, /identifyAdminRequest\(req\)/);
});
