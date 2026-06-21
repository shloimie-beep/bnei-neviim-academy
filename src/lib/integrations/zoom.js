const {
  loadConfigValue,
  loadSecret,
  redactError,
} = require('./secret-loader');
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
  buildZoomAttendanceCorrectionDraft,
  buildZoomMeetingPreview,
  buildZoomSessionAutomationPreview,
  buildZoomWebhookAttendancePreview,
  getZoomConfig,
  getZoomReadiness,
  normalizeZoomMeetingId,
  safeZoomError,
};
