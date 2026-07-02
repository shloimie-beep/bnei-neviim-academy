const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildOneTimeMediaPipelinePreview,
} = require('../src/platform/integrations/media-local-pipeline');

const configuredZoom = {
  accountId: 'acct',
  clientId: 'client',
  clientSecret: 'zoom-client-secret',
  accountOwner: 'Rabbi Elie Scheller',
  hostUser: 'me',
  configuredScopes: ['meeting:write:admin', 'meeting:read:admin', 'user:read:admin'],
};

test('One Time media pipeline maps Zoom recordings to attendance previews without writes', () => {
  const preview = buildOneTimeMediaPipelinePreview({
    source_type: 'zoom_recording',
    class_session_id: 'class-17',
    class_title: 'Mishnah Berachos 1:1',
    zoom_meeting_url: 'https://zoom.us/j/123456789?pwd=zoom-secret-link-token',
    recording_id: 'rec-123456789',
    participant_events: [
      {
        event: 'meeting.participant_joined',
        payload: {
          object: {
            id: '123456789',
            participant: { email: 'student@example.test', user_name: 'Student' },
          },
        },
        member_id: 7,
      },
      {
        event: 'meeting.participant_left',
        payload: {
          object: {
            id: '123456789',
            participant: { email: 'student@example.test', user_name: 'Student' },
          },
        },
        member_id: 7,
      },
    ],
  }, {
    checkedAt: '2026-06-20T00:00:00.000Z',
    zoomOptions: { config: configuredZoom },
    zoomReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
  });

  assert.equal(preview.requirement_id, 'REQ-20260619-413');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.media_upload_performed, false);
  assert.equal(preview.zoom_mutation_performed, false);
  assert.equal(preview.zoom_webhook_accepted, false);
  assert.equal(preview.attendance_write_performed, false);
  assert.equal(preview.source.type, 'zoom_recording');
  assert.equal(preview.source.zoom_meeting_id, '123456789');
  assert.equal(preview.source.sanitized_url_included, false);
  assert.equal(preview.attendance_preview.event_previews.length, 2);
  assert.equal(preview.attendance_preview.counts.checked_in, 1);
  assert.equal(preview.attendance_preview.counts.left_early, 1);
  assert.equal(preview.video_reference.provider, 'zoom');
  assert.equal(preview.library_draft.status, 'needs_privacy_review');
  assert.ok(preview.blocked_actions.includes('zoom_meeting_create'));
  assert.ok(preview.blocked_actions.includes('attendance_write'));
  assert.doesNotMatch(JSON.stringify(preview), /zoom-secret-link-token|zoom-client-secret/);
});

test('One Time media pipeline maps a Vimeo URL to a draft library reference idempotently', () => {
  const input = {
    source_type: 'vimeo_asset',
    class_session_id: 'class-vimeo-1',
    class_title: 'One Time Intro Video',
    vimeo_url: 'https://vimeo.com/987654321',
    worksheet_requested: true,
  };
  const first = buildOneTimeMediaPipelinePreview(input, {
    checkedAt: '2026-06-20T00:00:00.000Z',
    videoHostingReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
  });
  const second = buildOneTimeMediaPipelinePreview(input, {
    checkedAt: '2026-06-20T00:00:00.000Z',
    videoHostingReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
  });

  assert.equal(first.source.type, 'vimeo_asset');
  assert.equal(first.source.vimeo_id, '987654321');
  assert.equal(first.vimeo_attachment.ok, true);
  assert.equal(first.vimeo_attachment.library_item.vimeo_id, '987654321');
  assert.equal(first.video_reference.provider, 'vimeo');
  assert.equal(first.video_reference.playback_url, 'https://player.vimeo.com/video/987654321');
  assert.equal(first.library_draft.status, 'needs_operator_approval');
  assert.equal(first.member_library_publish_performed, false);
  assert.equal(first.upload_intent.preview_only, true);
  assert.equal(first.upload_intent.external_write_performed, false);
  assert.equal(first.worksheet_material_handoff.status, 'draft_material_review');
  assert.equal(first.idempotency.source_fingerprint, second.idempotency.source_fingerprint);
  assert.equal(first.video_reference.id, second.video_reference.id);
  assert.equal(first.library_draft.id, second.library_draft.id);
});

test('One Time media pipeline keeps drop-folder video private until source review passes', () => {
  const preview = buildOneTimeMediaPipelinePreview({
    source_type: 'approved_drop_folder_video',
    class_session_id: 'class-drop-1',
    class_title: 'Drop Folder Review',
    file_path: 'C:\\BNA\\drop-folder\\student-private-class.mp4',
    drive_file_id: 'drive-file-123',
    approved: true,
    contains_private_data: true,
    transcript_reference: 'transcript-draft-1',
  }, {
    checkedAt: '2026-06-20T00:00:00.000Z',
  });

  assert.equal(preview.source.type, 'approved_drop_folder_video');
  assert.equal(preview.source.provider, 'drop_folder');
  assert.equal(preview.source.file_name, 'student-private-class.mp4');
  assert.equal(preview.source.full_path_included, false);
  assert.equal(preview.source.drive_file_id_present, true);
  assert.equal(preview.source.privacy_review_required, true);
  assert.equal(preview.video_reference.provider, 'drop_folder');
  assert.equal(preview.video_reference.privacy, 'admin_provider_only');
  assert.equal(preview.video_reference.status, 'privacy_review_required');
  assert.equal(preview.library_draft.publish_enabled, false);
  assert.equal(preview.library_draft.status, 'needs_privacy_review');
  assert.equal(preview.drive_permission_write_performed, false);
  assert.equal(preview.drive_file_copy_performed, false);
  assert.equal(preview.member_library_publish_performed, false);
  assert.ok(preview.review_items.some((item) => item.title.includes('privacy review')));
  assert.doesNotMatch(JSON.stringify(preview), /C:\\BNA\\drop-folder/);
});

test('One Time media pipeline exposes Vimeo and Zoom readiness cards with live actions blocked', () => {
  const preview = buildOneTimeMediaPipelinePreview({
    source_type: 'vimeo_asset',
    class_title: 'Readiness Video',
    vimeo_url: 'https://player.vimeo.com/video/123456789',
  }, {
    checkedAt: '2026-06-20T00:00:00.000Z',
    videoHostingReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
    zoomReadiness: { configured: false, connected: false, blocker: 'Missing Zoom credentials.' },
  });
  const cards = new Map(preview.readiness_cards.map((card) => [card.provider, card]));

  assert.deepEqual([...cards.keys()].sort(), ['vimeo', 'zoom']);
  assert.ok(cards.get('vimeo').safe_actions.includes('video_library_draft'));
  assert.ok(cards.get('vimeo').blocked_actions.includes('video_upload'));
  assert.ok(cards.get('zoom').safe_actions.includes('meeting_preview'));
  assert.ok(cards.get('zoom').blocked_actions.includes('meeting_create'));
  assert.ok(preview.guardrails.includes('operator_approval_required_for_live_provider_actions'));
});
