const test = require('node:test');
const assert = require('node:assert/strict');

const {
  LIVE_ACCESS_TIERS,
  canViewRecording,
  canViewZoomLink,
  isValidAccessTier,
  normalizeAccessTier,
  sanitizeLiveSessionForMember,
} = require('../src/lib/bna/live-access');

const zoomUrl = 'https://zoom.us/j/123456789?pwd=current';
const oldZoomUrl = 'https://zoom.us/j/987654321?pwd=old';
const vimeoUrl = 'https://vimeo.com/123456789';

function member(overrides = {}) {
  return {
    id: 10,
    access_tier: LIVE_ACCESS_TIERS.LIBRARY_ONLY,
    access_status: 'active',
    enabled: true,
    ...overrides,
  };
}

function session(overrides = {}) {
  return {
    id: 42,
    title: 'Tonight Mishnah Class',
    start_at: '2026-06-15T18:00:00.000Z',
    end_at: '2026-06-15T19:00:00.000Z',
    timezone: 'Asia/Jerusalem',
    status: 'scheduled',
    required_tier: LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY,
    zoom_meeting_url: zoomUrl,
    previous_zoom_meeting_url: oldZoomUrl,
    recording_status: 'none',
    ...overrides,
  };
}

test('library_only cannot see Zoom URL', () => {
  assert.equal(canViewZoomLink(member(), session()), false);
});

test('live_plus_library can see Zoom URL for scheduled live session', () => {
  assert.equal(canViewZoomLink(member({ access_tier: LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY }), session()), true);
});

test('canceled and archived sessions hide Zoom URL', () => {
  const liveMember = member({ access_tier: LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY });
  assert.equal(canViewZoomLink(liveMember, session({ status: 'canceled' })), false);
  assert.equal(canViewZoomLink(liveMember, session({ status: 'archived' })), false);
});

test('published Vimeo recording is visible to both tiers', () => {
  const recording = session({ status: 'completed', recording_status: 'published', vimeo_recording_url: vimeoUrl });

  assert.equal(canViewRecording(member(), recording), true);
  assert.equal(canViewRecording(member({ access_tier: LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY }), recording), true);
});

test('unpublished and hidden recordings are not visible', () => {
  assert.equal(canViewRecording(member(), session({ recording_status: 'pending', vimeo_recording_url: vimeoUrl })), false);
  assert.equal(canViewRecording(member(), session({ recording_status: 'hidden', vimeo_recording_url: vimeoUrl })), false);
  assert.equal(canViewRecording(member(), session({ recording_status: 'published', vimeo_recording_url: '' })), false);
});

test('sanitizer does not include old or current Zoom URL for ineligible member', () => {
  const safe = sanitizeLiveSessionForMember(session(), member());

  assert.equal(safe.zoom_link_available, false);
  assert.equal(Object.prototype.hasOwnProperty.call(safe, 'zoom_meeting_url'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(safe, 'previous_zoom_meeting_url'), false);
  assert.equal(JSON.stringify(safe).includes(zoomUrl), false);
  assert.equal(JSON.stringify(safe).includes(oldZoomUrl), false);
});

test('invalid tiers are rejected and normalized safely', () => {
  assert.equal(isValidAccessTier('vip_live'), false);
  assert.equal(normalizeAccessTier('vip_live'), LIVE_ACCESS_TIERS.LIBRARY_ONLY);
  assert.equal(normalizeAccessTier('Live Plus Library'), LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY);
});
