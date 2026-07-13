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
    'masechta',
    'perek',
    'mishnah_range',
    'duration_seconds',
    'transcript_status',
    'transcript_notes',
    'metadata_draft',
    'metadata_review_state',
    'bot_knowledge_handoff',
    'bot_knowledge_status',
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
  assert.match(server, /bna_class_sessions_metadata_review_state_check/);
  assert.match(server, /bna_class_sessions_bot_knowledge_status_check/);
  assert.match(server, /idx_bna_class_sessions_metadata_review_state/);
  assert.match(server, /idx_bna_class_sessions_bot_knowledge_status/);
  assert.match(server, /project_key = '\$\{ONE_TIME_PROJECT_KEY\}'/);
});

test('One Time member library tables cover assets, items, access codes, and publish events', () => {
  [
    'CREATE TABLE IF NOT EXISTS one_time_class_assets',
    'CREATE TABLE IF NOT EXISTS one_time_member_library_items',
    'CREATE TABLE IF NOT EXISTS one_time_member_access',
    'CREATE TABLE IF NOT EXISTS one_time_library_publish_events',
    'CREATE TABLE IF NOT EXISTS one_time_member_watch_progress',
    'CREATE TABLE IF NOT EXISTS one_time_member_watch_events',
  ].forEach((needle) => assert.match(server, new RegExp(needle.replace(/[()]/g, '\\$&'))));
  assert.match(server, /asset_type TEXT NOT NULL DEFAULT 'worksheet' CHECK \(asset_type IN \('worksheet', 'source_sheet', 'slideshow', 'slide_deck', 'thumbnail', 'transcript', 'example', 'other'\)\)/);
  assert.match(server, /one_time_class_assets_asset_type_check/);
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
  const classPackageView = sliceBetween(server, 'function buildOneTimeClassPackage', 'function isOneTimeEditableSlideAsset');
  assert.match(classPackageView, /metadata_review/);
  assert.match(classPackageView, /bot_knowledge/);
  assert.match(classPackageView, /private_admin_only:[\s\S]*metadata_draft[\s\S]*bot_knowledge_handoff/);
  assert.doesNotMatch(publicView, /approval_flag|approved_by|rollback_metadata|transcript_notes|private_admin_only|package_status/);
  assert.doesNotMatch(publicView, /metadata_draft|bot_knowledge_handoff|bot_knowledge_status|transcript_text/);
  assert.match(server, /const ONE_TIME_ASSET_TYPES = new Set\(\['worksheet', 'source_sheet', 'slideshow', 'slide_deck', 'thumbnail', 'transcript', 'example', 'other'\]\)/);
  assert.match(server, /function isOneTimeEditableSlideAsset/);
  assert.match(server, /!\s*isOneTimeEditableSlideAsset\(asset\)/);
  assert.match(publicView, /\['worksheet', 'source_sheet', 'slideshow', 'slide_deck', 'example', 'other'\]\.includes\(asset\.asset_type\)/);
  assert.doesNotMatch(publicView, /\['worksheet', 'source_sheet', 'slideshow', 'slide_deck', 'transcript'/);
  assert.match(server, /app\.get\('\/api\/member-library'/);
  assert.match(server, /app\.post\('\/api\/member-library\/items\/:id\/progress'/);
  assert.match(server, /recordOneTimeMemberWatchProgress/);
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
  assert.match(operationsHtml, /name="masechta"/);
  assert.match(operationsHtml, /name="perek"/);
  assert.match(operationsHtml, /name="mishnah_range"/);
  assert.match(operationsHtml, /name="duration_seconds"/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(operationsHtml, /destination.*member_library/s);
  const manager = sliceBetween(operationsHtml, 'function renderOneTimeClassManagerPanel', 'function renderOneTimeContentLibraryPanel');
  assert.doesNotMatch(manager, /uploadToVimeo|vimeo API|createCheckout|sendParentAccessLink|student-goal|goal board|accounting/i);
});

test('Public member page uses the safe access-code API and does not expose admin fields', () => {
  assert.match(memberLibraryHtml, /One Time Member Library/);
  assert.match(memberLibraryHtml, /\/api\/member-library\?code=/);
  assert.match(memberLibraryHtml, /\/api\/member-library'/);
  assert.match(memberLibraryHtml, /currentMemberSessionToken/);
  assert.match(memberLibraryHtml, /Authorization = `Bearer \$\{sessionToken\}`/);
  assert.match(memberLibraryHtml, /Current One Time access/);
  assert.match(memberLibraryHtml, /Parent account setup\/reset/);
  assert.match(memberLibraryHtml, /There is no separate classroom or library password/);
  assert.doesNotMatch(memberLibraryHtml, /Use fallback access code|Fallback access code|support recovery code|Recovery-code/i);
  assert.match(memberLibraryHtml, /setAccessPanelState/);
  assert.match(memberLibraryHtml, /currentAccessCode\(\)/);
  assert.match(memberLibraryHtml, /currentAccessCode\(\) \? `\/one-time-classroom\?code=\$\{encodeURIComponent\(currentAccessCode\(\)\)\}` : '\/one-time-classroom'/);
  assert.match(memberLibraryHtml, /player\.vimeo\.com\/video/);
  assert.match(memberLibraryHtml, /filter-rail/);
  assert.match(memberLibraryHtml, /Newest/);
  assert.match(memberLibraryHtml, /Continue Watching/);
  assert.match(memberLibraryHtml, /Masechta/);
  assert.match(memberLibraryHtml, /Perek/);
  assert.match(memberLibraryHtml, /Materials/);
  assert.match(memberLibraryHtml, /Worksheets/);
  assert.match(memberLibraryHtml, /Review/);
  assert.match(memberLibraryHtml, /Completed/);
  assert.match(memberLibraryHtml, /metadata-chip/);
  assert.match(memberLibraryHtml, /watch_progress_percent/);
  assert.match(memberLibraryHtml, /watch_progress_seconds/);
  assert.match(memberLibraryHtml, /activeMediaItems/);
  assert.match(memberLibraryHtml, /activateMedia/);
  assert.match(memberLibraryHtml, /Play Video/);
  assert.match(memberLibraryHtml, /loading="lazy"/);
  assert.match(memberLibraryHtml, /grid-template-columns: repeat\(auto-fill, minmax\(280px, 380px\)\)/);
  assert.match(memberLibraryHtml, /media_provider !== 'vimeo'/);
  assert.match(memberLibraryHtml, /setItemProgress/);
  assert.match(memberLibraryHtml, /recordItemProgress/);
  assert.match(memberLibraryHtml, /\/api\/member-library\/items\/\$\{encodeURIComponent\(item\.id\)\}\/progress/);
  assert.match(memberLibraryHtml, /player\.vimeo\.com\/api\/player\.js/);
  assert.match(memberLibraryHtml, /attachVimeoTracking/);
  assert.match(memberLibraryHtml, /timeupdate/);
  assert.match(memberLibraryHtml, /Open Media/);
  assert.match(memberLibraryHtml, /asset\.file_url/);
  assert.doesNotMatch(memberLibraryHtml, /approval_flag|approved_by|rollback_metadata|transcript_notes|private_admin_only|package_status|bna_students|goal board|accounting/i);
  assert.doesNotMatch(memberLibraryHtml, /\/student|\/signup|\/parent/);
});
