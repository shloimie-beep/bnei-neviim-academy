const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const memberLibraryHtml = fs.readFileSync('public/member-library.html', 'utf8');

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('One Time class sessions are the package anchor with additive publishing columns', () => {
  assert.match(server, /const createOneTimeMemberLibrarySQL = `/);
  [
    'description',
    'media_provider',
    'media_url',
    'vimeo_id',
    'thumbnail_url',
    'transcript_status',
    'transcript_notes',
    'source_sheet_draft',
    'package_status',
    'updated_by',
  ].forEach((column) => {
    assert.match(server, new RegExp(`ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS ${column}\\b`));
  });
  assert.match(server, /bna_class_sessions_media_provider_check/);
  assert.match(server, /CHECK \(media_provider IN \('vimeo', 'manual_url', 'drive', 'placeholder'\)\)/);
  assert.match(server, /bna_class_sessions_transcript_status_check/);
  assert.match(server, /bna_class_sessions_package_status_check/);
  assert.match(server, /project_key = '\$\{ONE_TIME_PROJECT_KEY\}'/);
});

test('One Time member library tables cover assets, items, access codes, and publish events', () => {
  [
    'CREATE TABLE IF NOT EXISTS one_time_class_assets',
    'CREATE TABLE IF NOT EXISTS one_time_member_library_items',
    'CREATE TABLE IF NOT EXISTS one_time_member_access',
    'CREATE TABLE IF NOT EXISTS one_time_library_publish_events',
  ].forEach((needle) => assert.match(server, new RegExp(needle.replace(/[()]/g, '\\$&'))));
  assert.match(server, /asset_type TEXT NOT NULL DEFAULT 'worksheet' CHECK \(asset_type IN \('worksheet', 'source_sheet', 'thumbnail', 'transcript', 'example', 'other'\)\)/);
  assert.match(server, /destination TEXT NOT NULL DEFAULT 'member_library' CHECK \(destination IN \('member_library'\)\)/);
  assert.match(server, /library_visibility TEXT NOT NULL DEFAULT 'private' CHECK \(library_visibility IN \('private', 'tier', 'specific_members', 'smoke'\)\)/);
  assert.match(server, /required_tier TEXT NOT NULL DEFAULT 'library_only' CHECK \(required_tier IN \('library_only', 'live_class', 'all_members', 'admin_preview', 'smoke'\)\)/);
  assert.match(server, /tier TEXT NOT NULL DEFAULT 'library_only' CHECK \(tier IN \('library_only', 'live_class', 'admin_preview', 'smoke'\)\)/);
  assert.match(server, /CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_member_library_items_one_published/);
  assert.match(server, /WHERE publish_status = 'published'/);
});

test('Admin APIs are scoped to One Time and require explicit approval for publish, rollback, and smoke', () => {
  [
    "app.get('/api/bna/one-time/classes'",
    "app.post('/api/bna/one-time/classes'",
    "app.patch('/api/bna/one-time/classes/:id'",
    "app.post('/api/bna/one-time/classes/:id/assets'",
    "app.post('/api/bna/one-time/classes/:id/package-preview'",
    "app.post('/api/bna/one-time/classes/:id/member-preview'",
    "app.post('/api/bna/one-time/classes/:id/approve-library'",
    "app.post('/api/bna/one-time/classes/:id/publish-library'",
    "app.post('/api/bna/one-time/library-items/:id/rollback'",
    "app.post('/api/bna/one-time/library-smoke'",
  ].forEach((route) => assert.match(server, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.match(server, /assertOneTimeLibraryAdminAccess/);
  assert.match(server, /assertWorkspaceAccess\(req, 'rabbi_sheller_provider'\)/);
  assert.match(server, /getProjectByKey\(ONE_TIME_PROJECT_KEY/);
  assert.match(server, /ONE_TIME_LIBRARY_APPROVAL_FLAG = 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING'/);
  const publishRoute = sliceBetween(server, "app.post('/api/bna/one-time/classes/:id/publish-library'", "app.post('/api/bna/one-time/library-items/:id/rollback'");
  assert.match(publishRoute, /requireOneTimeLibraryApprovalFlag\(body\)/);
  assert.match(publishRoute, /destination must be member_library/);
  assert.match(publishRoute, /library_visibility must be an explicit member-visible tier or smoke target/);
  const rollbackRoute = sliceBetween(server, "app.post('/api/bna/one-time/library-items/:id/rollback'", "app.post('/api/bna/one-time/library-smoke'");
  assert.match(rollbackRoute, /requireOneTimeLibraryApprovalFlag\(body\)/);
  const smokeRoute = sliceBetween(server, "app.post('/api/bna/one-time/library-smoke'", "app.get('/api/member-library'");
  assert.match(smokeRoute, /requireOneTimeLibraryApprovalFlag\(body\)/);
  assert.match(smokeRoute, /library_visibility, required_tier/);
});

test('Member library API returns only published tier-visible safe items', () => {
  const helper = sliceBetween(server, 'async function getOneTimeMemberLibraryForAccessCode', 'async function oneTimeClassMediaServiceContext');
  assert.match(helper, /status = 'active'/);
  assert.match(helper, /expires_at IS NULL OR expires_at > NOW\(\)/);
  assert.match(helper, /destination = 'member_library'/);
  assert.match(helper, /publish_status = 'published'/);
  assert.match(helper, /libraryVisibilityAllowsMember\(item\.library_visibility, tier, item\.required_tier\)/);
  const publicView = sliceBetween(server, 'function oneTimeMemberLibraryPublicView', 'function normalizeOneTimeClassroomModerationStatus');
  assert.doesNotMatch(publicView, /approval_flag|approved_by|rollback_metadata|transcript_notes|private_admin_only|package_status/);
  assert.match(server, /app\.get\('\/api\/member-library'/);
  assert.match(server, /app\.get\(\['\/member-library', '\/one-time-member-library'\]/);
});

test('Visibility helpers keep smoke/private/admin states out of ordinary member readback', () => {
  const tierHelper = sliceBetween(server, 'function tierCanViewItem', 'function libraryVisibilityAllowsMember');
  assert.match(tierHelper, /required === 'smoke'\) return tier === 'smoke'/);
  assert.match(tierHelper, /required === 'admin_preview'\) return tier === 'admin_preview'/);
  assert.match(tierHelper, /required === 'live_class'\) return tier === 'live_class'/);
  const visibilityHelper = sliceBetween(server, 'function libraryVisibilityAllowsMember', 'function oneTimeClassSessionView');
  assert.match(visibilityHelper, /normalizedVisibility === 'smoke'/);
  assert.match(visibilityHelper, /normalizedVisibility !== 'tier'\) return false/);
  assert.match(visibilityHelper, /tierCanViewItem\(tier, requiredTier\)/);
});

test('Operations UI exposes class package management without external upload or student portal coupling', () => {
  assert.match(operationsHtml, /getOneTimeClasses/);
  assert.match(operationsHtml, /createOneTimeClass/);
  assert.match(operationsHtml, /publishOneTimeClassLibrary/);
  assert.match(operationsHtml, /rollbackOneTimeLibraryItem/);
  assert.match(operationsHtml, /runOneTimeLibrarySmoke/);
  assert.match(operationsHtml, /function renderOneTimeClassManagerPanel/);
  assert.match(operationsHtml, /Class Package Manager/);
  assert.match(operationsHtml, /Vimeo\/manual hosted URL/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(operationsHtml, /destination.*member_library/s);
  const manager = sliceBetween(operationsHtml, 'function renderOneTimeClassManagerPanel', 'function renderOneTimeContentLibraryPanel');
  assert.doesNotMatch(manager, /uploadToVimeo|vimeo API|createCheckout|sendParentAccessLink|student-goal|goal board|accounting/i);
});

test('Public member page uses the safe access-code API and does not expose admin fields', () => {
  assert.match(memberLibraryHtml, /One Time Member Library/);
  assert.match(memberLibraryHtml, /\/api\/member-library\?code=/);
  assert.match(memberLibraryHtml, /player\.vimeo\.com\/video/);
  assert.match(memberLibraryHtml, /Open Media/);
  assert.match(memberLibraryHtml, /asset\.file_url/);
  assert.doesNotMatch(memberLibraryHtml, /approval_flag|approved_by|rollback_metadata|transcript_notes|private_admin_only|package_status|bna_students|goal board|accounting/i);
  assert.doesNotMatch(memberLibraryHtml, /\/student|\/signup|\/parent/);
});
