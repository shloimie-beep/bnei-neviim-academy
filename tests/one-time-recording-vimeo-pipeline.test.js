const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const videoHosting = require('../src/lib/integrations/video-hosting');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

const configuredVideoHosting = {
  providerDecision: 'vimeo',
  vimeoToken: 'vimeo-secret-token',
  vimeoClientId: 'vimeo-client-id',
  vimeoClientSecret: 'vimeo-client-secret',
  accountOwner: 'Shloimie',
  vimeoPlan: 'Pro',
};

test('recording pipeline preview covers REQ-20260619-308 without writes', () => {
  const preview = videoHosting.buildRecordingPipelinePreview({
    event: 'recording.completed',
    source_recording_id: 'zoom-recording-123',
    class_session: {
      id: 12,
      title: 'Mishnah Berachos 1',
      summary: 'Rabbi summary saved for review.',
      transcript_text: 'Transcript text saved for review.',
      media_url: 'https://vimeo.com/123456789',
      package_status: 'review',
    },
    metadata: { masechta: 'Berachos', perek: '1', mishnah: '1' },
    recording_files: [
      { id: 'gallery', recording_type: 'gallery_view', file_type: 'mp4', size_bytes: 200 },
      { id: 'speaker-share', recording_type: 'shared_screen_with_speaker_view', file_type: 'mp4', size_bytes: 100 },
      { id: 'audio', recording_type: 'audio_only', file_type: 'm4a', size_bytes: 50 },
    ],
    processing_completed: true,
    playback_verified: true,
    retention_permits_deletion: false,
  }, { config: configuredVideoHosting });

  assert.equal(preview.requirement_id, 'REQ-20260619-308');
  assert.equal(preview.status, 'manual_vimeo_ready');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.production_mutation_performed, false);
  assert.equal(preview.gates.manual_vimeo_attach_enabled, true);
  assert.equal(preview.gates.member_library_publish_route_enabled, true);
  assert.equal(preview.gates.member_library_unpublish_route_enabled, true);
  assert.equal(preview.gates.api_upload_enabled, false);
  assert.equal(preview.gates.provider_publish_enabled, false);
  assert.equal(preview.gates.delete_enabled, false);
  assert.equal(preview.gates.notification_send_enabled, false);
  assert.deepEqual(
    preview.sections.map((section) => section.key),
    [
      'recording_webhook_handling',
      'recording_file_selection',
      'transcript_summary_retrieval',
      'retry_dead_letter_idempotency',
      'review_correction_approval',
      'manual_and_api_vimeo_modes',
      'publication_unpublish_retention',
      'entitlement_watch_progress',
      'release_live_smoke',
    ]
  );
  assert.equal(preview.summary.recording_files_seen, 3);
  assert.equal(preview.summary.audio_only_files_seen, 1);
  assert.equal(preview.summary.manual_vimeo_ready, true);
  assert.equal(preview.summary.automated_upload_enabled, false);
  assert.equal(preview.preferred_file.local_file_ref, 'speaker-share');
  assert.equal(preview.transcript_summary.status, 'ready_for_review');
  assert.equal(preview.manual_vimeo_workflow.status, 'manual_vimeo_ready');
  assert.equal(preview.manual_vimeo_workflow.url_validation.vimeo_id, '123456789');
  assert.deepEqual(preview.manual_vimeo_workflow.missing_metadata, []);
  assert.equal(preview.automated_upload_readiness.feature_flag_enabled, false);
  assert.equal(preview.automated_upload_readiness.api_upload_enabled, false);
  assert.equal(preview.publication_lifecycle.states.some((state) => state.state === 'member_library_publication'), true);
  assert.equal(preview.publication_lifecycle.supports.multiple_recording_files, true);
  assert.equal(preview.publication.vimeo_id_present, true);
  assert.equal(preview.publication.first_party_publish_route_enabled, true);
  assert.equal(preview.publication.member_library_publish_enabled, true);
  assert.equal(preview.publication.provider_publish_enabled, false);
  assert.equal(preview.publication.unpublish_enabled, true);
  assert.equal(preview.publication.delete_enabled, false);
  assert.equal(preview.retention.source_delete_allowed, false);
  assert.equal(preview.entitlement_watch_progress.member_visibility_enabled, true);
  assert.equal(preview.entitlement_watch_progress.watch_progress_write_enabled, false);
  assert.match(preview.blockers.join(' '), /Never publish directly from a webhook/);
  assert.doesNotMatch(JSON.stringify(preview), /vimeo-secret-token/);
  assert.doesNotMatch(JSON.stringify(preview), /vimeo-client-secret/);
});

test('publication and retention previews allow approval-gated member publish while provider delete stays disabled', () => {
  const publication = videoHosting.buildVimeoPublicationPreview({
    vimeo_url: 'https://player.vimeo.com/video/987654321',
    title: 'Approved class draft',
    transcript: 'Transcript ready.',
    summary: 'Summary ready.',
    metadata: { masechta: 'Peah' },
    processing_completed: true,
    playback_verified: true,
    retention_permits_deletion: true,
  }, { config: configuredVideoHosting });
  const retention = videoHosting.buildRecordingRetentionPreview({
    retention_policy: 'retain_source_for_90_days_after_verified_publish',
  });

  assert.equal(publication.requirement_id, 'REQ-20260619-308');
  assert.equal(publication.preview_only, true);
  assert.equal(publication.publication.vimeo_id_present, true);
  assert.equal(publication.publication.first_party_publish_route_enabled, true);
  assert.equal(publication.publication.member_library_publish_enabled, true);
  assert.equal(publication.publication.provider_publish_enabled, false);
  assert.equal(publication.publication.unpublish_enabled, true);
  assert.equal(publication.publication.delete_enabled, false);
  assert.equal(publication.publication.member_visibility_enabled, true);
  assert.equal(publication.publication.checks.transcript_summary_saved, true);
  assert.equal(retention.requirement_id, 'REQ-20260619-308');
  assert.equal(retention.retention.delete_enabled, false);
  assert.equal(retention.retention.requires_operator_approval, true);
});

test('server exposes protected recording/Vimeo preview routes and keeps upload blocked', () => {
  [
    "app.post('/api/bna/video-library/recording-pipeline-preview', requireAdmin",
    "app.post('/api/bna/video-library/:id/publication-preview', requireAdmin",
    "app.post('/api/bna/video-library/:id/retention-preview', requireAdmin",
    'recording_pipeline: videoHostingIntegration.buildRecordingPipelinePreview',
    "app.post('/api/bna/video-library/:id/upload', requireAdmin",
    'Video upload is not enabled in this closeout pass',
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations One Time Library shows no-write recording Vimeo readiness', () => {
  assert.match(operations, /renderOneTimeRecordingVimeoReadinessPanel/);
  assert.match(operations, /data-one-time-recording-vimeo-readiness/);
  assert.match(operations, /REQ-20260619-308/);
  assert.match(operations, /Recording \/ Vimeo Pipeline/);
  assert.match(operations, /manual mode ready, automated upload disabled/);
  assert.match(operations, /Manual Vimeo URL attachment and approval-gated first-party member-library publish run through the Class Package Manager/);
  assert.match(operations, /No provider webhook, recording fetch, Vimeo upload, provider publish, provider unpublish, provider delete, watch-progress write, notification send, or external portal publish runs from this panel/);
  [
    'authenticated Vimeo user',
    'account owner',
    'upload scope',
    'upload capability',
    'storage/quota',
    'privacy default',
    'allowed embed domains',
    'callback URL',
    'token state',
    'last verification',
  ].forEach((label) => assert.match(operations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.match(operations, /Never publish directly from a webhook/);
});

test('route registry declares private no-write recording and Vimeo preview routes', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  [
    '/api/bna/video-library/recording-pipeline-preview',
    '/api/bna/video-library/:id/publication-preview',
    '/api/bna/video-library/:id/retention-preview',
  ].forEach((path) => {
    const row = routes.get(path);
    assert.ok(row, `${path} should be registered`);
    assert.equal(row.access, 'private');
    assert.equal(row.public_allowed, false);
    assert.match(row.security_expectation, /Preview only/i);
  });
});
