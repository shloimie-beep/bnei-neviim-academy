const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const zoomIntegration = require('../src/lib/integrations/zoom');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
const productMigration = fs.readFileSync('railway-migration-2026-06-16-one-time-product-system.sql', 'utf8');

const configuredZoom = {
  accountId: 'acct',
  clientId: 'client',
  clientSecret: 'zoom-client-secret',
  accountOwner: 'Shloimie',
  hostUser: 'me',
  configuredScopes: ['meeting:write:admin', 'meeting:read:admin', 'user:read:admin'],
};

test('Zoom session automation preview is local-only and covers REQ-20260619-307 sections', () => {
  const preview = zoomIntegration.buildZoomSessionAutomationPreview({
    session: {
      id: 17,
      title: 'Tonight Mishnah Class',
      start_at: '2026-06-21T16:00:00.000Z',
      timezone: 'Asia/Jerusalem',
      zoom_meeting_url: 'https://zoom.us/j/123456789?pwd=secret',
    },
    members: [
      { id: 1, email: 'live@example.com', access_tier: 'live_plus_library', access_status: 'active', access_enabled: true },
      { id: 2, email: 'library@example.com', access_tier: 'library_only', access_status: 'active', access_enabled: true },
      { id: 3, access_tier: 'live_plus_library', access_status: 'active', access_enabled: true },
    ],
    webhook: {
      event: 'meeting.participant_joined',
      payload: { object: { id: '123456789', participant: { email: 'live@example.com', user_name: 'Member' } } },
      member_id: 1,
    },
    correction: { live_session_id: 17, member_id: 1, status: 'checked_in', reason: 'Host confirmed attendance.' },
  }, { config: configuredZoom });

  assert.equal(preview.requirement_id, 'REQ-20260619-307');
  assert.equal(preview.status, 'needs_operator_decision');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.production_mutation_performed, false);
  assert.equal(Object.values(preview.gates).every((value) => value === false), true);
  assert.deepEqual(
    preview.sections.map((section) => section.key),
    [
      'session_creation_preview',
      'registrant_management',
      'join_redirect',
      'webhook_attendance',
      'attendance_correction',
      'release_live_smoke',
    ]
  );
  assert.equal(preview.summary.registrants_staged, 1);
  assert.equal(preview.summary.registrants_skipped, 2);
  assert.equal(preview.session_creation.zoom_meeting_id_present, true);
  assert.equal(preview.registrant_management.registrants[0].registration_action, 'stage_registrant_preview');
  assert.equal(preview.registrant_management.registrants[1].registration_action, 'skip_registrant_preview');
  assert.equal(preview.join_redirect.zoom_url_exposed_by_preview, false);
  assert.equal(preview.webhook_attendance.mapped_attendance_status, 'checked_in');
  assert.equal(preview.webhook_attendance.attendance_write_enabled, false);
  assert.equal(preview.attendance_correction.write_enabled, false);
  assert.match(preview.blockers.join(' '), /explicit operator approval/);
  assert.doesNotMatch(JSON.stringify(preview), /zoom-client-secret/);
});

test('Zoom webhook attendance preview maps events without accepting live webhooks', () => {
  const preview = zoomIntegration.buildZoomWebhookAttendancePreview({
    event: 'meeting.participant_left',
    payload: { object: { id: '987654321', participant: { email: 'student@example.com', name: 'Student' } } },
  }, { config: configuredZoom });

  assert.equal(preview.requirement_id, 'REQ-20260619-307');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.local_write_performed, false);
  assert.equal(preview.webhook.meeting_id, '987654321');
  assert.equal(preview.webhook.mapped_attendance_status, 'left_early');
  assert.equal(preview.webhook.signature_required, true);
  assert.equal(preview.webhook.accepted_live_webhook, false);
  assert.equal(preview.webhook.needs_correction_review, true);
});

test('Zoom token retrieval uses cache and redacted client scaffolding without writes', async () => {
  const cache = zoomIntegration.createZoomTokenCache();
  let tokenCalls = 0;
  const fetchImpl = async (url, options) => {
    tokenCalls += 1;
    assert.match(String(url), /zoom\.us\/oauth\/token/);
    assert.equal(options.method, 'POST');
    assert.match(options.headers.authorization, /^Basic /);
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ access_token: 'zoom-access-token', token_type: 'Bearer', expires_in: 3600 }),
    };
  };

  const first = await zoomIntegration.getZoomAccessToken({ config: configuredZoom, cache, fetchImpl, nowMs: 1000 });
  const second = await zoomIntegration.getZoomAccessToken({ config: configuredZoom, cache, fetchImpl, nowMs: 2000 });
  assert.equal(first.cache_hit, false);
  assert.equal(second.cache_hit, true);
  assert.equal(tokenCalls, 1);
  assert.equal(first.external_write_performed, false);

  const readiness = zoomIntegration.buildZoomApiReadiness({ config: configuredZoom });
  assert.equal(readiness.token_cache_supported, true);
  assert.equal(readiness.retry_supported, true);
  assert.equal(readiness.rate_limit_handling_supported, true);
  assert.equal(readiness.meeting_create_enabled, false);
  assert.doesNotMatch(JSON.stringify(readiness), /zoom-client-secret/);
});

test('Zoom request builders enforce secure meeting and protected registrant defaults', () => {
  const meeting = zoomIntegration.buildZoomMeetingRequest({
    id: 17,
    title: 'Tonight Mishnah',
    start_at: '2026-06-21T16:00:00.000Z',
    duration_minutes: 60,
    timezone: 'Asia/Jerusalem',
  }, { config: configuredZoom });
  assert.equal(meeting.method, 'POST');
  assert.match(meeting.path, /\/users\/me\/meetings/);
  assert.equal(meeting.body.settings.use_pmi, false);
  assert.equal(meeting.body.settings.waiting_room, true);
  assert.equal(meeting.body.settings.join_before_host, false);
  assert.equal(meeting.body.settings.approval_type, 0);
  assert.equal(meeting.security_defaults.host_start_url_never_returned_to_students, true);
  assert.equal(meeting.external_write_performed, false);

  const registrant = zoomIntegration.buildZoomRegistrantRequest({
    id: 5,
    display_name: 'Live Member',
    email: 'LIVE@EXAMPLE.COM',
  }, { zoom_meeting_id: '123456789', local_session_id: 17 });
  assert.match(registrant.path, /\/meetings\/123456789\/registrants/);
  assert.equal(registrant.body.email, 'live@example.com');
  assert.equal(registrant.protected_join_reference.join_url_returned_to_student, false);
  assert.equal(registrant.protected_join_reference.revocation_after_unenrollment_required, true);

  const participants = zoomIntegration.buildZoomReportRequest('participants', '123456789', { occurrenceId: 'occ1' });
  const recordings = zoomIntegration.buildZoomReportRequest('recordings', '123456789');
  const transcript = zoomIntegration.buildZoomReportRequest('transcript', '123456789');
  const summary = zoomIntegration.buildZoomReportRequest('summary', '123456789');
  assert.match(participants.path, /\/report\/meetings\/123456789\/participants\?occurrence_id=occ1/);
  assert.match(recordings.path, /\/meetings\/123456789\/recordings/);
  assert.equal(transcript.report_kind, 'transcript');
  assert.match(summary.path, /meeting_summary/);
});

test('Zoom webhook signature verification enforces signature, replay, and idempotency', () => {
  const rawBody = JSON.stringify({ event: 'meeting.participant_joined', payload: { object: { id: '123' } } });
  const secret = 'zoom-webhook-secret';
  const nowMs = Date.parse('2026-06-21T16:00:00.000Z');
  const timestamp = String(Math.floor(nowMs / 1000));
  const signature = zoomIntegration.buildZoomWebhookSignature({ rawBody, timestamp, secret });
  const verified = zoomIntegration.verifyZoomWebhookSignature({
    rawBody,
    secret,
    nowMs,
    headers: {
      'x-zm-request-timestamp': timestamp,
      'x-zm-signature': signature,
      'x-zm-trackingid': 'evt-1',
    },
  });
  assert.equal(verified.ok, true);
  assert.equal(verified.quick_ack, true);
  assert.equal(verified.replay_protected, true);
  assert.equal(verified.idempotency_key, 'evt-1');

  const duplicate = zoomIntegration.verifyZoomWebhookSignature({
    rawBody,
    secret,
    nowMs,
    headers: {
      'x-zm-request-timestamp': timestamp,
      'x-zm-signature': signature,
      'x-zm-trackingid': 'evt-1',
    },
    seenEventIds: new Set(['evt-1']),
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.reason, 'duplicate_event');

  const plan = zoomIntegration.buildZoomWebhookProcessingPlan(JSON.parse(rawBody));
  assert.equal(plan.quick_ack, true);
  assert.equal(plan.queued_processing, true);
  assert.equal(plan.retry_supported, true);
  assert.equal(plan.dead_letter_state, 'dead_letter');
  assert.equal(plan.writes_enabled, false);
});

test('Zoom attendance reconciliation ignores dashboard clicks and merges reconnects', () => {
  const session = {
    start_at: '2026-06-21T16:00:00.000Z',
    end_at: '2026-06-21T17:00:00.000Z',
  };
  const result = zoomIntegration.reconcileZoomAttendance([
    { event: 'dashboard.click', source: 'dashboard_click', timestamp: '2026-06-21T15:55:00.000Z' },
    { event: 'meeting.participant_joined', timestamp: '2026-06-21T16:05:00.000Z', member_id: 1 },
    { event: 'meeting.participant_left', timestamp: '2026-06-21T16:25:00.000Z', member_id: 1 },
    { event: 'meeting.participant_joined', timestamp: '2026-06-21T16:27:00.000Z', member_id: 1 },
    { event: 'meeting.participant_left', timestamp: '2026-06-21T17:00:00.000Z', member_id: 1 },
  ], session, { reconnectWindowSeconds: 300, lateThresholdMinutes: 10 });

  assert.equal(result.dashboard_click_is_attendance, false);
  assert.equal(result.first_join_at, '2026-06-21T16:05:00.000Z');
  assert.equal(result.final_leave_at, '2026-06-21T17:00:00.000Z');
  assert.equal(result.reconnect_intervals_merged, 1);
  assert.equal(result.attendance_percentage, 92);
  assert.equal(result.attendance_status, 'on_time');
  assert.equal(result.external_write_performed, false);

  const absent = zoomIntegration.reconcileZoomAttendance([
    { event: 'dashboard.click', source: 'dashboard_click', timestamp: '2026-06-21T16:00:00.000Z' },
  ], session);
  assert.equal(absent.attendance_status, 'absent');
  assert.equal(absent.total_duration_seconds, 0);
});

test('Zoom workflow model links sessions, meetings, registrants, reports, retry, and audit without secrets', () => {
  const model = zoomIntegration.buildZoomSessionWorkflowModel({
    session: {
      id: 17,
      title: 'Tonight Mishnah',
      start_at: '2026-06-21T16:00:00.000Z',
      end_at: '2026-06-21T17:00:00.000Z',
      zoom_meeting_id: '123456789',
    },
    members: [
      { id: 1, display_name: 'Live Member', email: 'live@example.com', access_tier: 'live_plus_library', access_status: 'active', access_enabled: true },
    ],
    participant_events: [
      { event: 'meeting.participant_joined', timestamp: '2026-06-21T16:00:00.000Z', member_id: 1 },
      { event: 'meeting.participant_left', timestamp: '2026-06-21T17:00:00.000Z', member_id: 1 },
    ],
  }, { config: configuredZoom });

  assert.equal(model.requirement_id, 'REQ-20260619-307');
  assert.equal(model.preview_only, true);
  assert.equal(model.external_write_performed, false);
  assert.equal(model.zoom_meeting.personal_meeting_id_disabled, true);
  assert.equal(model.zoom_meeting.host_start_url_returned_to_students, false);
  assert.equal(model.registrants.length, 1);
  assert.equal(model.protected_join_references[0].raw_zoom_url_exposed, false);
  assert.equal(model.attendance_results[0].attendance_status, 'on_time');
  assert.equal(model.recording_reader.report_kind, 'recordings');
  assert.equal(model.transcript_reader.report_kind, 'transcript');
  assert.equal(model.summary_reader.report_kind, 'summary');
  assert.equal(model.retry_job.manual_retry_supported, true);
  assert.equal(model.audit_event.host_start_url_redacted, true);
  assert.doesNotMatch(JSON.stringify(model), /zoom-client-secret/);
});

test('Zoom attendance correction drafts are review-only and sanitize unsupported statuses', () => {
  const draft = zoomIntegration.buildZoomAttendanceCorrectionDraft({
    live_session_id: 17,
    member_id: 1,
    status: 'charge_card',
    reason: 'Operator typo should not become an attendance state.',
  });

  assert.equal(draft.requirement_id, 'REQ-20260619-307');
  assert.equal(draft.preview_only, true);
  assert.equal(draft.external_write_performed, false);
  assert.equal(draft.local_write_performed, false);
  assert.equal(draft.correction.requested_status, 'corrected');
  assert.equal(draft.correction.requires_operator_review, true);
  assert.equal(draft.correction.write_enabled, false);
});

test('server declares protected Zoom automation preview endpoints while live meeting creation stays blocked', () => {
  [
    "app.get('/api/bna/integrations/zoom/status', requireAdmin",
    "app.post('/api/bna/integrations/zoom/session-automation-preview', requireAdmin",
    "app.post('/api/bna/integrations/zoom/webhook-attendance-preview', requireAdmin",
    "app.post('/api/bna/integrations/zoom/attendance-correction-preview', requireAdmin",
    'api_readiness: zoomIntegration.buildZoomApiReadiness',
    'automation_readiness: zoomIntegration.buildZoomSessionAutomationPreview',
    'workflow_foundation: zoomIntegration.buildZoomSessionWorkflowModel',
    'webhook_processing: zoomIntegration.buildZoomWebhookProcessingPlan',
    "app.post('/api/bna/integrations/zoom/meetings', requireAdmin",
    'Zoom meeting creation is not enabled in this closeout pass',
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations Live Classes shows no-write Zoom attendance automation readiness', () => {
  assert.match(operations, /renderOneTimeZoomAutomationReadinessPanel/);
  assert.match(operations, /data-one-time-zoom-automation-readiness/);
  assert.match(operations, /Zoom Attendance Automation/);
  assert.match(operations, /REQ-20260619-307/);
  assert.match(operations, /No Zoom meeting, registrant, webhook attendance write, join redirect, external send, portal publish, recording read\/write, transcript read\/write, summary read\/write, or attendance correction is enabled/);
  assert.match(operations, /API client and token cache/);
  assert.match(operations, /Meeting request builder/);
  assert.match(operations, /Webhook security/);
  assert.match(operations, /Dashboard clicks are not attendance/);
  assert.match(operations, /Recording\/report readers/);
  assert.match(operations, /Real Zoom writes require operator approval, DEC-20260619-304, release, and live smoke proof/);
});

test('route registry declares private no-write Zoom automation preview routes', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  [
    '/api/bna/integrations/zoom/status',
    '/api/bna/integrations/zoom/meeting-preview',
    '/api/bna/integrations/zoom/session-automation-preview',
    '/api/bna/integrations/zoom/webhook-attendance-preview',
    '/api/bna/integrations/zoom/attendance-correction-preview',
  ].forEach((path) => {
    const row = routes.get(path);
    assert.ok(row, `${path} should be registered`);
    assert.equal(row.access, 'private');
    assert.equal(row.public_allowed, false);
    assert.match(row.security_expectation, /Preview only|Readiness only/i);
  });
});

test('One Time migration declares Zoom meeting, webhook, attendance, asset, retry, and audit tables', () => {
  [
    'bna_one_time_zoom_meetings',
    'bna_one_time_zoom_occurrences',
    'bna_one_time_zoom_registrants',
    'bna_one_time_zoom_join_references',
    'bna_one_time_zoom_webhook_events',
    'bna_one_time_zoom_participant_events',
    'bna_one_time_zoom_attendance_results',
    'bna_one_time_zoom_assets',
    'bna_one_time_zoom_retry_jobs',
    'bna_one_time_zoom_audit_events',
  ].forEach((table) => {
    assert.match(productMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });
  assert.match(productMigration, /dashboard_click_is_attendance BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(productMigration, /raw_zoom_join_url_returned BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(productMigration, /external_write_performed BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(productMigration, /idempotency_key TEXT NOT NULL/);
  assert.match(productMigration, /dead_letter|queued|retry/);
});
