const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const zoomIntegration = require('../src/lib/integrations/zoom');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

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
    "app.post('/api/bna/integrations/zoom/session-automation-preview', requireAdmin",
    "app.post('/api/bna/integrations/zoom/webhook-attendance-preview', requireAdmin",
    "app.post('/api/bna/integrations/zoom/attendance-correction-preview', requireAdmin",
    'automation_readiness: zoomIntegration.buildZoomSessionAutomationPreview',
    "app.post('/api/bna/integrations/zoom/meetings', requireAdmin",
    'Zoom meeting creation is not enabled in this closeout pass',
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations Live Classes shows no-write Zoom attendance automation readiness', () => {
  assert.match(operations, /renderOneTimeZoomAutomationReadinessPanel/);
  assert.match(operations, /data-one-time-zoom-automation-readiness/);
  assert.match(operations, /Zoom Attendance Automation/);
  assert.match(operations, /REQ-20260619-307/);
  assert.match(operations, /No Zoom meeting, registrant, webhook attendance write, join redirect, external send, portal publish, or attendance correction is enabled/);
  assert.match(operations, /Real Zoom writes require operator approval, DEC-20260619-304, release, and live smoke proof/);
});

test('route registry declares private no-write Zoom automation preview routes', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  [
    '/api/bna/integrations/zoom/session-automation-preview',
    '/api/bna/integrations/zoom/webhook-attendance-preview',
    '/api/bna/integrations/zoom/attendance-correction-preview',
  ].forEach((path) => {
    const row = routes.get(path);
    assert.ok(row, `${path} should be registered`);
    assert.equal(row.access, 'private');
    assert.equal(row.public_allowed, false);
    assert.match(row.security_expectation, /Preview only/i);
  });
});
