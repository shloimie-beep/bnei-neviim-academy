const {
  loadConfigValue,
  loadSecret,
  redactError,
} = require('./secret-loader');
const crypto = require('node:crypto');
const {
  requireExternalApproval,
} = require('./external-actions');

const MINIMUM_MEETING_SCOPE_CANDIDATES = [
  'meeting:write:admin',
  'meeting:read:admin',
  'user:read:admin',
];

const ZOOM_AUTOMATION_REQUIREMENT_ID = 'REQ-20260619-307';

const ZOOM_AUTOMATION_SECTIONS = [
  {
    key: 'session_creation_preview',
    label: 'Session Creation Preview',
    status: 'preview_ready',
    result: 'Builds local Zoom meeting payload previews without calling Zoom.',
  },
  {
    key: 'registrant_management',
    label: 'Registrant Management',
    status: 'local_contract_present',
    result: 'Stages eligible member registrants locally and skips ineligible members.',
  },
  {
    key: 'join_redirect',
    label: 'Join Redirect',
    status: 'local_contract_present',
    result: 'Documents secure member portal join rules without exposing raw Zoom links in preview output.',
  },
  {
    key: 'webhook_attendance',
    label: 'Webhook Attendance',
    status: 'preview_ready',
    result: 'Normalizes Zoom participant events into attendance previews without accepting live webhooks.',
  },
  {
    key: 'attendance_correction',
    label: 'Attendance Correction',
    status: 'local_contract_present',
    result: 'Drafts reviewable attendance corrections without mutating attendance rows.',
  },
  {
    key: 'release_live_smoke',
    label: 'Release And Live Smoke',
    status: 'blocked_external_approval',
    result: 'Real meeting creation, registrants, webhook writes, and live smoke require operator approval.',
  },
];

function parseList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '').split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
}

function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function safeNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function normalizeZoomMeetingId(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = text.match(/\/j\/([0-9]+)/i) || text.match(/\b([0-9]{8,14})\b/);
  if (match) return match[1];
  const cleaned = text.replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  return cleaned || null;
}

function memberRef(member = {}, index = 0) {
  const id = safeNumber(member.id || member.member_id || member.local_member_id);
  if (id) return `member_${id}`;
  const email = safeText(member.email).toLowerCase();
  if (email) return `email_${email.replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`;
  return `member_preview_${index + 1}`;
}

function memberEligibleForLive(member = {}) {
  const tier = safeText(member.access_tier || member.tier).toLowerCase();
  const status = safeText(member.access_status || member.status || 'active').toLowerCase();
  return tier === 'live_plus_library'
    && ['active', 'trial'].includes(status)
    && member.access_enabled !== false;
}

function registrantPreview(member = {}, index = 0) {
  const emailPresent = Boolean(safeText(member.email));
  const eligible = memberEligibleForLive(member);
  const action = eligible && emailPresent ? 'stage_registrant_preview' : 'skip_registrant_preview';
  return {
    local_member_ref: memberRef(member, index),
    eligible_for_live_access: eligible,
    email_present: emailPresent,
    registration_action: action,
    skip_reason: action === 'skip_registrant_preview'
      ? (eligible ? 'member_email_required_for_zoom_registrant' : 'member_not_live_plus_library_active_or_trial')
      : null,
    external_write_performed: false,
  };
}

function zoomWebhookEventType(payload = {}) {
  return safeText(payload.event || payload.event_type || payload.eventType).toLowerCase();
}

function zoomWebhookObject(payload = {}) {
  return payload.payload?.object || payload.object || payload.meeting || {};
}

function zoomWebhookParticipant(payload = {}) {
  const object = zoomWebhookObject(payload);
  return object.participant || payload.participant || payload.payload?.participant || {};
}

function attendanceStatusForWebhookEvent(eventType) {
  const normalized = safeText(eventType).replace(/\./g, '_');
  if (normalized === 'meeting_participant_joined' || normalized === 'webinar_participant_joined') return 'checked_in';
  if (normalized === 'meeting_participant_left' || normalized === 'webinar_participant_left') return 'left_early';
  if (normalized === 'meeting_ended' || normalized === 'webinar_ended') return 'ended_pending_reconciliation';
  if (normalized === 'meeting_started' || normalized === 'webinar_started') return 'started_no_attendance';
  return 'needs_review';
}

function getZoomConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const accountId = options.accountId !== undefined ? String(options.accountId || '').trim() : loadSecret({
    envName: 'ZOOM_ACCOUNT_ID',
    names: ['zoom-account-id', 'zoom'],
    fileNames: ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt', 'zoom.txt'],
    repoRoot,
  }).value;
  const clientId = options.clientId !== undefined ? String(options.clientId || '').trim() : loadSecret({
    envName: 'ZOOM_CLIENT_ID',
    names: ['zoom-client-id', 'zoom'],
    fileNames: ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt', 'zoom.txt'],
    repoRoot,
  }).value;
  const clientSecret = options.clientSecret !== undefined ? String(options.clientSecret || '').trim() : loadSecret({
    envName: 'ZOOM_CLIENT_SECRET',
    names: ['zoom-client-secret', 'zoom'],
    fileNames: ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt', 'zoom.txt'],
    repoRoot,
  }).value;
  return {
    accountId,
    clientId,
    clientSecret,
    accountOwner: String(options.accountOwner || loadConfigValue({
      envName: 'ZOOM_ACCOUNT_OWNER',
      names: ['zoom-account-owner', 'zoom'],
      fileNames: ['zoom-account-owner.txt', 'ZOOM_ACCOUNT_OWNER.txt', 'zoom.txt'],
      repoRoot,
    }) || 'unknown').trim() || 'unknown',
    hostUser: String(options.hostUser || loadConfigValue({
      envName: 'ZOOM_HOST_USER',
      names: ['zoom-host-user', 'zoom'],
      fileNames: ['zoom-host-user.txt', 'ZOOM_HOST_USER.txt', 'zoom.txt'],
      repoRoot,
    }) || 'me').trim() || 'me',
    configuredScopes: parseList(options.scopes || loadConfigValue({
      envName: 'ZOOM_SCOPES',
      names: ['zoom-scopes', 'zoom'],
      fileNames: ['zoom-scopes.txt', 'ZOOM_SCOPES.txt', 'zoom.txt'],
      repoRoot,
    })),
  };
}

function getZoomReadiness(options = {}) {
  const config = options.config || getZoomConfig(options);
  const missing = [
    config.accountId ? null : 'ZOOM_ACCOUNT_ID',
    config.clientId ? null : 'ZOOM_CLIENT_ID',
    config.clientSecret ? null : 'ZOOM_CLIENT_SECRET',
  ].filter(Boolean);
  const blockers = [];
  if (missing.length) blockers.push(`${missing.join(', ')} must be installed server-side through env/keyholder/.secrets.`);
  if (config.accountOwner === 'unknown') blockers.push('Zoom account owner/admin must be documented before meeting creation.');
  const scopeSet = new Set(config.configuredScopes);
  const missingScopeCandidates = MINIMUM_MEETING_SCOPE_CANDIDATES.filter((scope) => !scopeSet.has(scope));
  if (missingScopeCandidates.length) {
    blockers.push('Zoom Server-to-Server OAuth meeting scopes must be confirmed in the Zoom dashboard before write endpoints are enabled.');
  }
  return {
    provider: 'zoom',
    label: 'Zoom',
    configured: !missing.length,
    status: missing.length ? 'not_configured' : (missingScopeCandidates.length ? 'configured_but_insufficient_scope' : 'configured'),
    mode: 'server_to_server_oauth',
    accountOwner: config.accountOwner,
    hostUserConfigured: Boolean(config.hostUser),
    configuredScopesPresent: config.configuredScopes.length,
    safeActions: ['setup_checklist', 'meeting_preview'],
    blockedActions: ['meeting_create', 'account_grant', 'role_change', 'user_management'],
    blockers,
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildZoomMeetingPreview(payload = {}, options = {}) {
  return {
    provider: 'zoom',
    preview_only: true,
    external_write_performed: false,
    readiness: getZoomReadiness(options),
    meeting: {
      topic: String(payload.topic || payload.title || 'BNA class meeting').slice(0, 180),
      start_time: payload.start_time || payload.startTime || null,
      duration_minutes: Number.isFinite(Number(payload.duration_minutes || payload.durationMinutes))
        ? Number(payload.duration_minutes || payload.durationMinutes)
        : 60,
      timezone: String(payload.timezone || 'Asia/Jerusalem'),
      agenda: String(payload.agenda || '').slice(0, 2000),
      host_user_configured: Boolean((options.config || getZoomConfig(options)).hostUser),
    },
  };
}

function buildZoomWebhookAttendancePreview(payload = {}, options = {}) {
  const config = options.config || getZoomConfig(options);
  const eventType = zoomWebhookEventType(payload);
  const object = zoomWebhookObject(payload);
  const participant = zoomWebhookParticipant(payload);
  const meetingId = normalizeZoomMeetingId(
    object.id || object.uuid || object.meeting_id || payload.meeting_id || payload.zoom_meeting_id
  );
  const matchedMemberId = safeNumber(payload.member_id || payload.local_member_id || participant.member_id);
  const attendanceStatus = attendanceStatusForWebhookEvent(eventType);
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    local_write_performed: false,
    readiness: getZoomReadiness({ ...options, config }),
    webhook: {
      event_type: eventType || 'unknown',
      meeting_id: meetingId,
      participant_email_present: Boolean(safeText(participant.email || payload.email)),
      participant_name_present: Boolean(safeText(participant.user_name || participant.name || payload.name)),
      matched_local_member_id: matchedMemberId,
      mapped_attendance_status: attendanceStatus,
      needs_correction_review: !matchedMemberId || attendanceStatus === 'needs_review',
      signature_required: true,
      accepted_live_webhook: false,
      attendance_write_enabled: false,
    },
    blockers: [
      'Live Zoom webhook acceptance requires signature verification, endpoint approval, and operator live-smoke approval.',
    ],
  };
}

function buildZoomAttendanceCorrectionDraft(input = {}) {
  const allowedStatuses = [
    'checked_in',
    'attended',
    'missed',
    'excused',
    'left_early',
    'corrected',
    'needs_review',
  ];
  const requested = safeText(input.attendance_status || input.status || input.correction_status || 'corrected').toLowerCase();
  const nextStatus = allowedStatuses.includes(requested) ? requested : 'corrected';
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    local_write_performed: false,
    correction: {
      live_session_id: safeNumber(input.live_session_id || input.session_id),
      member_id: safeNumber(input.member_id || input.local_member_id),
      requested_status: nextStatus,
      allowed_statuses: allowedStatuses,
      source: safeText(input.source || 'operations_review').slice(0, 80),
      reason: safeText(input.reason || input.notes || '').slice(0, 500),
      requires_operator_review: true,
      write_enabled: false,
    },
    blockers: [
      'Applying attendance corrections requires the internal attendance write path and operator review; this draft performs no mutation.',
    ],
  };
}

function buildZoomSessionAutomationPreview(payload = {}, options = {}) {
  const config = options.config || getZoomConfig(options);
  const session = payload.session || payload.live_session || payload;
  const members = Array.isArray(payload.members) ? payload.members : [];
  const registrants = members.map(registrantPreview);
  const stagedRegistrants = registrants.filter((item) => item.registration_action === 'stage_registrant_preview').length;
  const skippedRegistrants = registrants.length - stagedRegistrants;
  const webhookPreview = buildZoomWebhookAttendancePreview(payload.webhook || {}, { ...options, config });
  const correctionDraft = buildZoomAttendanceCorrectionDraft(payload.correction || {});
  const meetingPreview = buildZoomMeetingPreview({
    topic: session.title || session.topic || payload.topic,
    title: session.title || payload.title,
    start_time: session.start_at || session.start_time || payload.start_time,
    duration_minutes: session.duration_minutes || payload.duration_minutes,
    timezone: session.timezone || payload.timezone,
    agenda: session.notes || session.agenda || payload.agenda,
  }, { ...options, config });
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    status: 'needs_operator_decision',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    readiness: meetingPreview.readiness,
    sections: ZOOM_AUTOMATION_SECTIONS,
    gates: {
      meeting_create_enabled: false,
      registrant_write_enabled: false,
      join_redirect_live_enabled: false,
      webhook_accept_enabled: false,
      webhook_attendance_write_enabled: false,
      attendance_correction_write_enabled: false,
      external_notifications_enabled: false,
    },
    summary: {
      sessions_considered: session && (session.id || session.title || session.start_at) ? 1 : 0,
      registrants_staged: stagedRegistrants,
      registrants_skipped: skippedRegistrants,
      webhook_events_previewed: payload.webhook ? 1 : 0,
      correction_drafts_previewed: payload.correction ? 1 : 0,
    },
    session_creation: {
      status: 'preview_ready',
      source: 'bna_live_class_sessions',
      local_session_id: safeNumber(session.id || session.live_session_id),
      zoom_meeting_id_present: Boolean(normalizeZoomMeetingId(session.zoom_meeting_id || session.zoom_meeting_url)),
      meeting_preview: meetingPreview.meeting,
      external_write_performed: false,
      blocker: 'Zoom meeting creation requires DEC-20260619-304 plus explicit operator approval and live smoke.',
    },
    registrant_management: {
      status: 'local_contract_present',
      registrants,
      external_write_performed: false,
      blocker: 'Zoom registrant API writes remain disabled until account owner, scopes, and operator approval are complete.',
    },
    join_redirect: {
      status: 'local_contract_present',
      target: 'member_portal_secure_join',
      required_checks: ['valid_member_access_code', 'live_plus_library_access', 'scheduled_or_live_session'],
      zoom_url_exposed_by_preview: false,
      live_redirect_enabled: false,
      blocker: 'Live join redirect should only expose Zoom links to eligible members after portal/live smoke approval.',
    },
    webhook_attendance: webhookPreview.webhook,
    attendance_correction: correctionDraft.correction,
    blockers: [
      ...meetingPreview.readiness.blockers,
      'Real Zoom meeting creation, registrants, join redirects, webhook attendance writes, and live smoke require explicit operator approval.',
    ],
  };
}

function createZoomTokenCache(initial = {}) {
  return {
    accessToken: initial.accessToken || '',
    expiresAtMs: Number(initial.expiresAtMs || 0),
    tokenType: initial.tokenType || 'Bearer',
  };
}

function zoomTokenCacheUsable(cache = {}, nowMs = Date.now()) {
  return Boolean(cache.accessToken && Number(cache.expiresAtMs || 0) - 30000 > nowMs);
}

async function getZoomAccessToken(options = {}) {
  const config = options.config || getZoomConfig(options);
  const cache = options.cache || createZoomTokenCache();
  const nowMs = Number(options.nowMs || Date.now());
  if (zoomTokenCacheUsable(cache, nowMs)) {
    return {
      access_token: cache.accessToken,
      token_type: cache.tokenType || 'Bearer',
      expires_at_ms: cache.expiresAtMs,
      cache_hit: true,
      external_write_performed: false,
    };
  }
  if (!config.accountId || !config.clientId || !config.clientSecret) {
    const error = new Error('Zoom Server-to-Server OAuth credentials are required for token retrieval.');
    error.status = 409;
    throw error;
  }
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    const error = new Error('A fetch implementation is required for Zoom token retrieval.');
    error.status = 500;
    throw error;
  }
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const response = await fetchImpl(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(config.accountId)}`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${credentials}`,
      accept: 'application/json',
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok || !data.access_token) {
    const error = new Error(`Zoom token retrieval failed with status ${response.status}`);
    error.status = response.status || 502;
    error.zoom_response = data;
    throw error;
  }
  const expiresInSeconds = Number(data.expires_in || 3600);
  cache.accessToken = String(data.access_token);
  cache.tokenType = String(data.token_type || 'Bearer');
  cache.expiresAtMs = nowMs + Math.max(60, expiresInSeconds) * 1000;
  return {
    access_token: cache.accessToken,
    token_type: cache.tokenType,
    expires_at_ms: cache.expiresAtMs,
    cache_hit: false,
    external_write_performed: false,
  };
}

function buildZoomApiClient(options = {}) {
  const config = options.config || getZoomConfig(options);
  const cache = options.cache || createZoomTokenCache();
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const baseUrl = String(options.baseUrl || 'https://api.zoom.us/v2').replace(/\/+$/, '');
  async function request(method, path, body = null) {
    const token = await getZoomAccessToken({ ...options, config, cache, fetchImpl });
    const response = await fetchImpl(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers: {
        authorization: `${token.token_type} ${token.access_token}`,
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { text };
    }
    if (!response.ok) {
      const error = new Error(`Zoom API ${method} ${path} failed with status ${response.status}`);
      error.status = response.status;
      error.zoom_response = data;
      throw error;
    }
    return { data, status: response.status, external_write_performed: false };
  }
  return {
    provider: 'zoom',
    mode: 'server_to_server_oauth',
    config,
    cache,
    getToken: () => getZoomAccessToken({ ...options, config, cache, fetchImpl }),
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),
  };
}

function buildZoomApiReadiness(options = {}) {
  const config = options.config || getZoomConfig(options);
  const readiness = getZoomReadiness({ ...options, config });
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    token_loader_ready: readiness.configured,
    token_cache_supported: true,
    retry_supported: true,
    rate_limit_handling_supported: true,
    user_host_readback_supported: true,
    license_readiness_readback_supported: true,
    meeting_create_enabled: false,
    external_write_performed: false,
    readiness,
  };
}

function buildZoomMeetingRequest(session = {}, options = {}) {
  const config = options.config || getZoomConfig(options);
  const duration = Number.isFinite(Number(session.duration_minutes || session.durationMinutes))
    ? Number(session.duration_minutes || session.durationMinutes)
    : 60;
  return {
    method: 'POST',
    path: `/users/${encodeURIComponent(config.hostUser || 'me')}/meetings`,
    idempotency_key: `zoom_meeting:${safeText(session.id || session.live_session_id || session.calendar_event_id || session.title || 'preview')}:${safeText(session.start_at || session.start_time || '')}`,
    body: {
      topic: safeText(session.title || session.topic || 'One Time Mishnayos class').slice(0, 180),
      type: 2,
      start_time: session.start_at || session.start_time || null,
      duration,
      timezone: safeText(session.timezone || 'Asia/Jerusalem'),
      agenda: safeText(session.notes || session.agenda || '').slice(0, 2000),
      password: session.passcode || undefined,
      settings: {
        host_video: true,
        participant_video: false,
        join_before_host: false,
        jbh_time: 0,
        waiting_room: true,
        approval_type: 0,
        registration_type: 1,
        enforce_login: false,
        mute_upon_entry: true,
        use_pmi: false,
        auto_recording: 'cloud',
        meeting_authentication: false,
        registrants_confirmation_email: false,
        registrants_email_notification: false,
        allow_multiple_devices: false,
      },
    },
    security_defaults: {
      unique_meeting_per_session: true,
      personal_meeting_id_disabled: true,
      generated_passcode_required: true,
      waiting_room_enabled: true,
      join_before_host_disabled: true,
      registration_enabled: true,
      host_start_url_never_returned_to_students: true,
    },
    external_write_performed: false,
  };
}

function splitDisplayName(name = '') {
  const parts = safeText(name || 'One Time member').split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || 'One Time',
    last_name: parts.slice(1).join(' ') || 'Member',
  };
}

function buildZoomRegistrantRequest(member = {}, meeting = {}) {
  const name = splitDisplayName(member.display_name || member.name || member.parent_name || member.email);
  return {
    method: 'POST',
    path: `/meetings/${encodeURIComponent(normalizeZoomMeetingId(meeting.zoom_meeting_id || meeting.id || meeting.meeting_id) || ':meetingId')}/registrants`,
    idempotency_key: `zoom_registrant:${safeText(meeting.local_session_id || meeting.live_session_id || meeting.id || 'session')}:${memberRef(member)}`,
    body: {
      email: safeText(member.email).toLowerCase(),
      first_name: name.first_name.slice(0, 64),
      last_name: name.last_name.slice(0, 64),
      auto_approve: true,
    },
    protected_join_reference: {
      member_ref: memberRef(member),
      join_url_stored_server_side: true,
      join_url_returned_to_student: false,
      enrollment_validation_required: true,
      session_time_validation_required: true,
      revocation_after_unenrollment_required: true,
    },
    external_write_performed: false,
  };
}

function buildZoomReportRequest(kind, meetingId, options = {}) {
  const normalizedMeetingId = encodeURIComponent(normalizeZoomMeetingId(meetingId) || ':meetingId');
  const occurrenceId = options.occurrenceId ? `?occurrence_id=${encodeURIComponent(options.occurrenceId)}` : '';
  const paths = {
    participants: `/report/meetings/${normalizedMeetingId}/participants${occurrenceId}`,
    recordings: `/meetings/${normalizedMeetingId}/recordings`,
    transcript: `/meetings/${normalizedMeetingId}/recordings`,
    summary: `/meetings/${normalizedMeetingId}/meeting_summary`,
  };
  return {
    method: 'GET',
    path: paths[kind] || paths.participants,
    report_kind: kind,
    retry_supported: true,
    rate_limit_handling_supported: true,
    external_write_performed: false,
  };
}

function buildZoomWebhookSignature({ rawBody = '', timestamp = '', secret = '' } = {}) {
  const message = `v0:${timestamp}:${typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody || {})}`;
  return `v0=${crypto.createHmac('sha256', secret).update(message).digest('hex')}`;
}

function verifyZoomWebhookSignature({ rawBody = '', headers = {}, secret = '', nowMs = Date.now(), replayWindowSeconds = 300, seenEventIds = new Set() } = {}) {
  const lowerHeaders = Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [String(key).toLowerCase(), value]));
  const timestamp = String(lowerHeaders['x-zm-request-timestamp'] || lowerHeaders['x-zm-timestamp'] || '');
  const signature = String(lowerHeaders['x-zm-signature'] || '');
  const eventId = String(lowerHeaders['x-zm-trackingid'] || lowerHeaders['x-zm-request-id'] || lowerHeaders['x-zm-event-id'] || '');
  if (!secret) return { ok: false, reason: 'missing_webhook_secret', quick_ack: false };
  if (!timestamp || !signature) return { ok: false, reason: 'missing_zoom_signature_headers', quick_ack: false };
  const ageSeconds = Math.abs(Math.floor(nowMs / 1000) - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > replayWindowSeconds) {
    return { ok: false, reason: 'replay_window_expired', quick_ack: false, event_id: eventId || null };
  }
  if (eventId && seenEventIds.has(eventId)) {
    return { ok: false, reason: 'duplicate_event', quick_ack: true, event_id: eventId };
  }
  const expected = buildZoomWebhookSignature({ rawBody, timestamp, secret });
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  const matches = expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  return {
    ok: matches,
    reason: matches ? 'verified' : 'signature_mismatch',
    quick_ack: matches,
    event_id: eventId || null,
    replay_protected: true,
    idempotency_key: eventId || zoomWebhookIdempotencyKey({ rawBody, timestamp }),
  };
}

function zoomWebhookIdempotencyKey(input = {}) {
  const eventType = zoomWebhookEventType(input.payload || input);
  const object = zoomWebhookObject(input.payload || input);
  const participant = zoomWebhookParticipant(input.payload || input);
  const base = [
    eventType || 'unknown',
    object.uuid || object.id || object.meeting_id || input.meeting_id || '',
    participant.id || participant.user_id || participant.email || input.email || '',
    participant.join_time || participant.leave_time || object.start_time || object.end_time || input.timestamp || '',
  ].join('|');
  return crypto.createHash('sha256').update(base).digest('hex');
}

function buildZoomWebhookProcessingPlan(payload = {}, options = {}) {
  const eventType = zoomWebhookEventType(payload);
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    event_type: eventType || 'unknown',
    signature_verification_required: true,
    replay_protection_required: true,
    idempotency_key: zoomWebhookIdempotencyKey(payload),
    quick_ack: true,
    queued_processing: true,
    retry_supported: true,
    dead_letter_state: 'dead_letter',
    writes_enabled: false,
    external_write_performed: false,
    processing_steps: [
      'verify_signature',
      'check_replay_window',
      'deduplicate_event',
      'acknowledge_quickly',
      'queue_processing',
      'map_participant_event',
      'reconcile_attendance',
      'route_errors_to_dead_letter',
    ],
    verification: options.signature
      ? verifyZoomWebhookSignature({ ...options.signature, rawBody: options.signature.rawBody || JSON.stringify(payload || {}) })
      : { ok: false, reason: 'not_checked_in_preview' },
  };
}

function zoomEventTimestamp(event = {}) {
  return Date.parse(event.occurred_at || event.time || event.timestamp || event.join_time || event.leave_time || event.created_at || 0);
}

function normalizeZoomParticipantEvent(event = {}) {
  const eventType = zoomWebhookEventType(event) || safeText(event.type || event.event_type).toLowerCase();
  const participant = zoomWebhookParticipant(event);
  const joined = /joined|join$/.test(eventType);
  const left = /left|leave$/.test(eventType);
  return {
    event_type: eventType || (joined ? 'meeting.participant_joined' : left ? 'meeting.participant_left' : 'needs_review'),
    source: safeText(event.source || 'zoom_webhook'),
    member_id: safeNumber(event.member_id || event.local_member_id || participant.member_id),
    registrant_id: safeText(event.registrant_id || participant.registrant_id || participant.registrant_id),
    participant_user_id: safeText(event.user_id || participant.user_id || participant.id),
    participant_email: safeText(event.email || participant.email).toLowerCase(),
    participant_name: safeText(event.name || event.user_name || participant.name || participant.user_name),
    occurred_at: event.time || event.timestamp || event.join_time || event.leave_time || null,
    is_join: joined,
    is_leave: left,
    dashboard_click_only: safeText(event.source).toLowerCase() === 'dashboard_click',
    technical_issue: event.technical_issue === true,
  };
}

function reconcileZoomAttendance(events = [], session = {}, options = {}) {
  const reconnectWindowSeconds = Number(options.reconnectWindowSeconds || 300);
  const lateThresholdMinutes = Number(options.lateThresholdMinutes || 10);
  const sessionStartMs = Date.parse(session.start_at || session.start_time || 0);
  const sessionEndMs = Date.parse(session.end_at || session.end_time || 0);
  const expectedDurationSeconds = Number.isFinite(sessionStartMs) && Number.isFinite(sessionEndMs) && sessionEndMs > sessionStartMs
    ? Math.round((sessionEndMs - sessionStartMs) / 1000)
    : Number(session.duration_seconds || (Number(session.duration_minutes || 60) * 60));
  const normalized = (Array.isArray(events) ? events : []).map(normalizeZoomParticipantEvent);
  const attendanceEvents = normalized
    .filter((event) => !event.dashboard_click_only && (event.is_join || event.is_leave))
    .sort((a, b) => zoomEventTimestamp(a) - zoomEventTimestamp(b));
  const intervals = [];
  let openJoin = null;
  for (const event of attendanceEvents) {
    const timestamp = zoomEventTimestamp(event);
    if (!Number.isFinite(timestamp)) continue;
    if (event.is_join) {
      if (!openJoin) openJoin = timestamp;
    } else if (event.is_leave && openJoin) {
      const last = intervals[intervals.length - 1];
      if (last && openJoin - last.leave <= reconnectWindowSeconds * 1000) {
        last.leave = Math.max(last.leave, timestamp);
      } else {
        intervals.push({ join: openJoin, leave: timestamp });
      }
      openJoin = null;
    }
  }
  if (openJoin) {
    const fallbackLeave = Number.isFinite(sessionEndMs) ? sessionEndMs : openJoin;
    intervals.push({ join: openJoin, leave: fallbackLeave });
  }
  const totalDurationSeconds = intervals.reduce((sum, interval) => sum + Math.max(0, Math.round((interval.leave - interval.join) / 1000)), 0);
  const firstJoinMs = intervals.length ? intervals[0].join : null;
  const finalLeaveMs = intervals.length ? intervals[intervals.length - 1].leave : null;
  const attendancePercentage = expectedDurationSeconds > 0
    ? Math.max(0, Math.min(100, Math.round((totalDurationSeconds / expectedDurationSeconds) * 100)))
    : 0;
  const late = firstJoinMs && Number.isFinite(sessionStartMs) && firstJoinMs - sessionStartMs > lateThresholdMinutes * 60 * 1000;
  const technicalIssue = normalized.some((event) => event.technical_issue);
  let attendanceStatus = 'absent';
  if (options.excused === true) attendanceStatus = 'excused';
  else if (technicalIssue) attendanceStatus = 'technical_issue';
  else if (attendancePercentage >= 85 && !late) attendanceStatus = 'on_time';
  else if (attendancePercentage >= 85 && late) attendanceStatus = 'late';
  else if (attendancePercentage > 0) attendanceStatus = 'partial';
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    dashboard_click_is_attendance: false,
    first_join_at: firstJoinMs ? new Date(firstJoinMs).toISOString() : null,
    final_leave_at: finalLeaveMs ? new Date(finalLeaveMs).toISOString() : null,
    total_duration_seconds: totalDurationSeconds,
    expected_duration_seconds: expectedDurationSeconds,
    attendance_percentage: attendancePercentage,
    attendance_status: attendanceStatus,
    on_time: attendanceStatus === 'on_time',
    late: attendanceStatus === 'late',
    partial: attendanceStatus === 'partial',
    absent: attendanceStatus === 'absent',
    excused: attendanceStatus === 'excused',
    technical_issue: attendanceStatus === 'technical_issue',
    reconnect_intervals_merged: Math.max(0, attendanceEvents.filter((event) => event.is_join).length - intervals.length),
    intervals: intervals.map((interval) => ({
      join_at: new Date(interval.join).toISOString(),
      leave_at: new Date(interval.leave).toISOString(),
      duration_seconds: Math.max(0, Math.round((interval.leave - interval.join) / 1000)),
    })),
    manual_correction: options.manualCorrection ? {
      requested_status: safeText(options.manualCorrection.status || options.manualCorrection.attendance_status),
      reason: safeText(options.manualCorrection.reason || options.manualCorrection.notes),
      audit_required: true,
    } : null,
    external_write_performed: false,
  };
}

function buildZoomSessionWorkflowModel(payload = {}, options = {}) {
  const session = payload.session || payload.live_session || {};
  const members = Array.isArray(payload.members) ? payload.members : [];
  const events = Array.isArray(payload.participant_events || payload.events) ? (payload.participant_events || payload.events) : [];
  const meetingRequest = buildZoomMeetingRequest(session, options);
  const meetingId = normalizeZoomMeetingId(session.zoom_meeting_id || session.zoom_meeting_url || payload.zoom_meeting_id);
  return {
    provider: 'zoom',
    requirement_id: ZOOM_AUTOMATION_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    class_session: {
      local_session_id: safeNumber(session.id || session.live_session_id || session.class_session_id),
      title: safeText(session.title || session.topic || 'One Time Mishnayos class'),
      start_at: session.start_at || session.start_time || null,
      end_at: session.end_at || session.end_time || null,
      timezone: safeText(session.timezone || 'Asia/Jerusalem'),
    },
    zoom_meeting: {
      meeting_id: meetingId,
      request_builder: meetingRequest,
      create_enabled: false,
      unique_meeting_per_session: true,
      personal_meeting_id_disabled: true,
      host_start_url_returned_to_students: false,
    },
    occurrence: {
      occurrence_id: safeText(payload.occurrence_id || session.occurrence_id),
      status: safeText(payload.occurrence_status || 'planned'),
    },
    registrants: members.map((member) => buildZoomRegistrantRequest(member, {
      zoom_meeting_id: meetingId || ':meetingId',
      local_session_id: session.id || session.live_session_id,
    })),
    protected_join_references: members.map((member) => ({
      member_ref: memberRef(member),
      personalized_join_url_stored: false,
      protected_join_reference_ready: Boolean(member.email && memberEligibleForLive(member)),
      raw_zoom_url_exposed: false,
      revoke_after_unenrollment: true,
    })),
    participant_events: events.map(normalizeZoomParticipantEvent),
    attendance_results: [reconcileZoomAttendance(events, session, options.attendance || {})],
    recording_reader: buildZoomReportRequest('recordings', meetingId || ':meetingId'),
    transcript_reader: buildZoomReportRequest('transcript', meetingId || ':meetingId'),
    summary_reader: buildZoomReportRequest('summary', meetingId || ':meetingId'),
    retry_job: {
      retry_state: 'not_started',
      idempotency_key: meetingRequest.idempotency_key,
      manual_retry_supported: true,
      dead_letter_state: 'dead_letter',
    },
    audit_event: {
      action: 'zoom_foundation_preview',
      created_by: 'system',
      external_write_performed: false,
      host_start_url_redacted: true,
    },
  };
}

function assertZoomMeetingCreateApproved(payload = {}, options = {}) {
  const config = options.config || getZoomConfig(options);
  const readiness = getZoomReadiness({ ...options, config });
  requireExternalApproval({
    provider: 'zoom',
    action: 'meeting_create',
    riskLevel: 'high',
    previewOnly: false,
    confirm: payload.confirm || payload.confirmation_phrase || '',
    accountOwner: readiness.accountOwner,
    mode: readiness.mode,
    secrets: [config.clientSecret],
  });
  const error = new Error('Zoom meeting creation is intentionally not enabled in INT-05; use meeting preview until credentials, scopes, host, and approval are finalized.');
  error.status = 409;
  throw error;
}

function safeZoomError(error, config = {}) {
  return redactError(error, [config.clientSecret]);
}

module.exports = {
  MINIMUM_MEETING_SCOPE_CANDIDATES,
  ZOOM_AUTOMATION_REQUIREMENT_ID,
  ZOOM_AUTOMATION_SECTIONS,
  assertZoomMeetingCreateApproved,
  buildZoomApiClient,
  buildZoomApiReadiness,
  buildZoomAttendanceCorrectionDraft,
  buildZoomMeetingPreview,
  buildZoomMeetingRequest,
  buildZoomRegistrantRequest,
  buildZoomReportRequest,
  buildZoomSessionAutomationPreview,
  buildZoomSessionWorkflowModel,
  buildZoomWebhookAttendancePreview,
  buildZoomWebhookProcessingPlan,
  buildZoomWebhookSignature,
  createZoomTokenCache,
  getZoomAccessToken,
  getZoomConfig,
  getZoomReadiness,
  normalizeZoomMeetingId,
  reconcileZoomAttendance,
  verifyZoomWebhookSignature,
  zoomWebhookIdempotencyKey,
  safeZoomError,
};
