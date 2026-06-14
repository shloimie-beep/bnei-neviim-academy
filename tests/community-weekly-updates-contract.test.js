const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const homeHtml = fs.readFileSync('public/index.html', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const providerHtml = fs.readFileSync('public/provider.html', 'utf8');
const botWidgetJs = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const emailSmoke = fs.readFileSync('scripts/smoke-email.mjs', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');

test('learning community schema separates communities, members, threads, and messages', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_learning_communities/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_learning_community_members/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_community_threads/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_community_messages/);
  assert.match(server, /auto_include_bna_portal/);
  assert.match(server, /async function ensureDefaultLearningCommunity/);
  assert.match(server, /await ensureDefaultLearningCommunity\(\)/);
});

test('community dialogue endpoints resolve actor sessions before listing or posting', () => {
  assert.match(server, /async function resolveCommunityActor/);
  assert.match(server, /getValidParentSession\(cookies\[PARENT_SESSION_COOKIE_NAME\]/);
  assert.match(server, /getValidProviderSession\(cookies\[PROVIDER_SESSION_COOKIE_NAME\]/);
  assert.match(server, /findStudentByAccessCode\(accessCode/);
  assert.match(server, /async function assertCommunityAccess/);
  assert.match(server, /app\.get\('\/api\/community\/learning-communities'/);
  assert.match(server, /app\.get\('\/api\/community\/threads'/);
  assert.match(server, /app\.post\('\/api\/community\/threads'/);
  assert.match(server, /app\.post\('\/api\/community\/threads\/:id\/messages'/);
  assert.match(server, /A parent, student, provider, or admin session is required/);
});

test('Operations can administer learning communities and selected weekly updates', () => {
  assert.match(server, /app\.get\('\/api\/bna\/learning-communities', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/learning-communities', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/learning-communities\/:id\/members', requireAdmin/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_weekly_updates/);
  assert.match(server, /selected_for_parent_portal BOOLEAN DEFAULT FALSE/);
  assert.match(server, /app\.get\('\/api\/bna\/weekly-updates', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/weekly-updates', requireAdmin/);
  assert.match(server, /app\.patch\('\/api\/bna\/weekly-updates\/:id', requireAdmin/);
  assert.match(server, /UPDATE bna_weekly_updates[\s\S]*selected_for_parent_portal = FALSE/);
});

test('parent announcements persist as selected weekly updates without sending', () => {
  assert.match(server, /app\.get\('\/api\/bna\/parent-announcements', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/parent-announcements', requireAdmin/);
  assert.match(server, /APPROVE_PARENT_ANNOUNCEMENT/);
  assert.match(server, /latest_announcement/);
  assert.match(server, /local_write_performed: false/);
  assert.match(server, /local_write_performed: true/);
  assert.match(server, /no_send: true/);
  assert.match(server, /external_write_performed: false/);
  assert.match(server, /status', 'selected'/);
  assert.match(server, /source: 'operations_announcements'/);
  assert.doesNotMatch(server, /parent-announcements[\s\S]{0,1400}SEND_WHATSAPP/);
  assert.doesNotMatch(server, /parent-announcements[\s\S]{0,1400}sendEmail/);
  assert.match(operationsHtml, /getParentAnnouncements/);
  assert.match(operationsHtml, /approveParentAnnouncement/);
  assert.match(operationsHtml, /function renderAnnouncementPanel/);
  assert.match(operationsHtml, /Parent Readback/);
  assert.match(operationsHtml, /approveParentAnnouncementPrompt/);
  assert.match(operationsHtml, /No email, WhatsApp, or social post will be sent/);
});

test('parent portal payload and UI can render selected weekly updates', () => {
  assert.match(server, /async function getParentPortalWeeklyUpdates/);
  assert.match(server, /latest_weekly_update: weeklyUpdates\[0\] \|\| null/);
  assert.match(server, /weekly_updates: weeklyUpdates/);
  assert.match(parentHtml, /function renderLatestWeeklyUpdate/);
  assert.match(parentHtml, /function parentWeeklyUpdates/);
  assert.match(parentHtml, /weekly-update-hero/);
  assert.match(parentHtml, /weekly-update-history/);
  assert.match(parentHtml, /latest_weekly_update/);
  assert.match(parentHtml, /weekly_updates/);
});

test('signup permissions also write a normalized parent permission profile', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_parent_permission_profiles/);
  assert.match(server, /async function upsertParentPermissionProfileFromSignup/);
  assert.match(server, /permission_profile JSONB DEFAULT '\{\}'/);
  assert.match(server, /await upsertParentPermissionProfileFromSignup\(signup, signupStudent\)/);
  assert.match(server, /await upsertParentPermissionProfileFromSignup\(signup, student\)/);
});

test('universal sliding assistant uses one server-side chat panel and safe action/ticket routing', () => {
  assert.match(server, /visibleActionsForActor/);
  assert.match(server, /app\.get\('\/api\/portal-bot\/actions'/);
  assert.match(server, /app\.post\('\/api\/portal-bot\/actions\/preview'/);
  assert.match(server, /Preview only\. Staff-controlled or sensitive actions stay in Operations approval flows\./);
  assert.doesNotMatch(server, /app\.post\('\/api\/portal-bot\/chat'/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_threads/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_messages/);
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/chat'/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/threads'/);
  assert.match(server, /queue_codex_task/);
  assert.match(server, /Non-admin Codex\/CLI request converted to support ticket/);
  assert.match(server, /assistantAdaptiveIntent/);
  assert.match(server, /assistantVisibleActionCatalog/);
  assert.match(server, /assistantRunActionTool/);
  assert.match(server, /function assistantShouldUseWebSearch/);
  assert.match(server, /tools: \[\{ type: 'web_search' \}\]/);
  for (const html of [homeHtml, parentHtml, studentHtml, providerHtml]) {
    assert.match(html, /\/js\/bna-bot-widget\.js/);
  }
  assert.match(botWidgetJs, /bna-bot-panel/);
  assert.match(botWidgetJs, /api\/bna\/assistant\/chat/);
  assert.match(botWidgetJs, /api\/bna\/assistant\/threads/);
  assert.match(botWidgetJs, /bna-bot-typing/);
  assert.match(botWidgetJs, /mode: 'safe'/);
  assert.match(botWidgetJs, /data-history-toggle/);
  assert.match(botWidgetJs, /bna-bot-history-toggle/);
  assert.match(botWidgetJs, /Continue chat/);
  assert.doesNotMatch(botWidgetJs, /data-agent-prompt|data-mode=/);
  assert.doesNotMatch(botWidgetJs, /openai|chat\/completions|responses\.create/i);
});

test('email smoke script exercises guarded send-test action path', () => {
  assert.match(packageJson, /"email:smoke": "node scripts\/smoke-email\.mjs"/);
  assert.match(emailSmoke, /action_id: 'send_test_email'/);
  assert.match(emailSmoke, /dry_run: !send/);
  assert.match(emailSmoke, /APPROVE_TYPED_ACTION/);
  assert.match(emailSmoke, /OPS_USERNAME and OPS_PASSWORD are required/);
});
