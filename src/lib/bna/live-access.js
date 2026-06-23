const LIVE_ACCESS_TIERS = Object.freeze({
  LIBRARY_ONLY: 'library_only',
  LIVE_PLUS_LIBRARY: 'live_plus_library',
});

const LIVE_MEMBER_ACCESS_STATUSES = Object.freeze([
  'active',
  'paused',
  'canceled',
  'trial',
]);

const LIVE_SESSION_STATUSES = Object.freeze([
  'draft',
  'scheduled',
  'live',
  'completed',
  'canceled',
  'archived',
]);

const LIVE_RECORDING_STATUSES = Object.freeze([
  'none',
  'pending',
  'published',
  'hidden',
]);

const LIVE_ACCESS_TIER_VALUES = Object.freeze(Object.values(LIVE_ACCESS_TIERS));
const LIVE_ACCESS_TIER_SET = new Set(LIVE_ACCESS_TIER_VALUES);
const LIVE_MEMBER_STATUS_SET = new Set(LIVE_MEMBER_ACCESS_STATUSES);
const LIVE_SESSION_STATUS_SET = new Set(LIVE_SESSION_STATUSES);
const LIVE_RECORDING_STATUS_SET = new Set(LIVE_RECORDING_STATUSES);

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function normalizeAccessTier(value, fallback = LIVE_ACCESS_TIERS.LIBRARY_ONLY) {
  const normalized = normalizeKey(value);
  if (LIVE_ACCESS_TIER_SET.has(normalized)) return normalized;
  return LIVE_ACCESS_TIER_SET.has(fallback) ? fallback : LIVE_ACCESS_TIERS.LIBRARY_ONLY;
}

function isValidAccessTier(value) {
  return LIVE_ACCESS_TIER_SET.has(normalizeKey(value));
}

function normalizeLiveAccessStatus(value, fallback = 'active') {
  const normalized = normalizeKey(value);
  if (LIVE_MEMBER_STATUS_SET.has(normalized)) return normalized;
  return LIVE_MEMBER_STATUS_SET.has(fallback) ? fallback : 'active';
}

function isValidLiveAccessStatus(value) {
  return LIVE_MEMBER_STATUS_SET.has(normalizeKey(value));
}

function normalizeLiveSessionStatus(value, fallback = 'draft') {
  const normalized = normalizeKey(value);
  if (LIVE_SESSION_STATUS_SET.has(normalized)) return normalized;
  return LIVE_SESSION_STATUS_SET.has(fallback) ? fallback : 'draft';
}

function isValidLiveSessionStatus(value) {
  return LIVE_SESSION_STATUS_SET.has(normalizeKey(value));
}

function normalizeRecordingStatus(value, fallback = 'none') {
  const normalized = normalizeKey(value);
  if (LIVE_RECORDING_STATUS_SET.has(normalized)) return normalized;
  return LIVE_RECORDING_STATUS_SET.has(fallback) ? fallback : 'none';
}

function isValidRecordingStatus(value) {
  return LIVE_RECORDING_STATUS_SET.has(normalizeKey(value));
}

function memberAccessEnabled(member = {}) {
  if (!member) return false;
  if (member.enabled === false) return false;
  if (member.access_enabled === false) return false;
  if (member.member_access_enabled === false) return false;
  return true;
}

function memberHasActiveAccess(member = {}) {
  if (!memberAccessEnabled(member)) return false;
  const status = normalizeLiveAccessStatus(member.access_status);
  return status === 'active' || status === 'trial';
}

function sessionRequiresLiveTier(session = {}) {
  return normalizeAccessTier(session.required_tier, LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY) === LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY;
}

function canViewZoomLink(member = {}, session = {}) {
  if (!memberHasActiveAccess(member)) return false;
  const sessionStatus = normalizeLiveSessionStatus(session.status);
  if (sessionStatus !== 'scheduled' && sessionStatus !== 'live') return false;
  if (!String(session.zoom_meeting_url || '').trim()) return false;
  const memberTier = normalizeAccessTier(member.access_tier);
  if (!sessionRequiresLiveTier(session)) return true;
  return memberTier === LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY;
}

function canViewRecording(member = {}, sessionOrRecording = {}) {
  if (!memberHasActiveAccess(member)) return false;
  const recordingStatus = normalizeRecordingStatus(sessionOrRecording.recording_status);
  if (recordingStatus !== 'published') return false;
  return Boolean(String(
    sessionOrRecording.vimeo_recording_url ||
    sessionOrRecording.recording_url ||
    sessionOrRecording.vimeo_url ||
    ''
  ).trim());
}

function publicLiveSessionFields(session = {}) {
  return {
    id: session.id,
    series_id: session.series_id || null,
    title: session.title || '',
    description: session.description || '',
    start_at: session.start_at || null,
    end_at: session.end_at || null,
    timezone: session.timezone || 'Asia/Jerusalem',
    required_tier: normalizeAccessTier(session.required_tier, LIVE_ACCESS_TIERS.LIVE_PLUS_LIBRARY),
    status: normalizeLiveSessionStatus(session.status),
    reminders_enabled: Boolean(session.reminders_enabled),
    reminder_minutes_before: Number(session.reminder_minutes_before || 0),
    recording_status: normalizeRecordingStatus(session.recording_status),
    published_at: session.published_at || null,
  };
}

function sanitizeLiveSessionForMember(session = {}, member = {}) {
  const safe = publicLiveSessionFields(session);
  const mayViewZoom = canViewZoomLink(member, session);
  const mayViewRecording = canViewRecording(member, session);

  safe.zoom_link_available = mayViewZoom;
  if (mayViewZoom) {
    safe.zoom_meeting_url = String(session.zoom_meeting_url || '').trim();
    if (session.zoom_meeting_id) safe.zoom_meeting_id = String(session.zoom_meeting_id);
    safe.zoom_link_version = Number(session.zoom_link_version || session.link_version || 1);
    safe.zoom_link_updated_at = session.zoom_link_updated_at || null;
  } else if (sessionRequiresLiveTier(session)) {
    safe.zoom_upgrade_message = 'Live class links are available with live_plus_library access.';
  }

  safe.recording_available = mayViewRecording;
  if (mayViewRecording) {
    safe.vimeo_recording_url = String(
      session.vimeo_recording_url ||
      session.recording_url ||
      session.vimeo_url ||
      ''
    ).trim();
  }

  return safe;
}

module.exports = {
  LIVE_ACCESS_TIERS,
  LIVE_ACCESS_TIER_VALUES,
  LIVE_MEMBER_ACCESS_STATUSES,
  LIVE_SESSION_STATUSES,
  LIVE_RECORDING_STATUSES,
  normalizeAccessTier,
  isValidAccessTier,
  normalizeLiveAccessStatus,
  isValidLiveAccessStatus,
  normalizeLiveSessionStatus,
  isValidLiveSessionStatus,
  normalizeRecordingStatus,
  isValidRecordingStatus,
  canViewZoomLink,
  canViewRecording,
  sanitizeLiveSessionForMember,
};
