const path = require('node:path');

const { buildPlatformContext, normalizeKey, stableId, unwrap } = require('../core');
const { createVideoAssetReference } = require('../courses');
const {
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
} = require('../instances/one-time');
const { buildOneTimeIntegrationReadinessPayload } = require('./readiness');
const {
  attachVimeoUrl,
  createVimeoUploadIntent,
  parseVimeoUrl,
} = require('../../lib/integrations/vimeo');
const {
  buildZoomAttendanceCorrectionDraft,
  buildZoomMeetingPreview,
  buildZoomWebhookAttendancePreview,
  normalizeZoomMeetingId,
} = require('../../lib/integrations/zoom');
const { compactWhitespace } = require('../../lib/bna/task-shaping');
const { stableHash } = require('../ingestion/intake-source');

const ONE_TIME_MEDIA_PIPELINE_VERSION = 'one-time-media-local-pipeline-v1';
const REQUIREMENT_ID = 'REQ-20260619-413';

function cleanText(value = '', fallback = '') {
  const text = compactWhitespace(value);
  return text || fallback;
}

function firstValue(...values) {
  return values.find((value) => cleanText(value));
}

function truthy(value) {
  if (value === true) return true;
  if (typeof value === 'number') return value > 0;
  return /^(?:1|true|yes|on|approved|current|private|raw)$/i.test(String(value || '').trim());
}

function inferSourceType(input = {}) {
  const explicit = normalizeKey(input.source_type || input.sourceType || input.provider || '');
  if (['zoom_recording', 'zoom'].includes(explicit)) return 'zoom_recording';
  if (['vimeo_asset', 'vimeo'].includes(explicit)) return 'vimeo_asset';
  if (['approved_drop_folder_video', 'drop_folder', 'drive', 'local_file'].includes(explicit)) {
    return 'approved_drop_folder_video';
  }
  const value = [
    input.url,
    input.source_url,
    input.sourceUrl,
    input.media_url,
    input.mediaUrl,
    input.file_path,
    input.filePath,
    input.local_path,
    input.localPath,
    input.raw_text,
    input.rawText,
  ].map((item) => String(item || '').toLowerCase()).join(' ');
  if (value.includes('vimeo.com')) return 'vimeo_asset';
  if (/\bzoom\b|\/j\/[0-9]+/.test(value)) return 'zoom_recording';
  if (/\b(drop[-_\s]?folder|drive|approved folder|\.mp4|\.mov|\.webm|\.mkv)\b/.test(value)) {
    return 'approved_drop_folder_video';
  }
  return 'unknown_media_source';
}

function buildLocalAdminContext(options = {}) {
  const workspaceId = options.workspace_id || 'workspace-one-time-local-beta';
  return buildPlatformContext({
    instance: { id: options.instance_id || 'instance-bna-platform', slug: 'bna-platform' },
    organization: { id: 'org-bna', slug: 'bna' },
    workspace: {
      id: workspaceId,
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
    },
    actor: {
      id: options.actor_id || 'one-time-local-media-admin',
      person_id: options.person_id || 'person-one-time-local-media-admin',
      role: 'workspace_admin',
    },
    memberships: [{
      actor_id: options.actor_id || 'one-time-local-media-admin',
      instance_id: options.instance_id || 'instance-bna-platform',
      workspace_id: workspaceId,
      role: 'workspace_admin',
      status: 'active',
    }],
  });
}

function safeFileName(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  return path.basename(path.win32.basename(text));
}

function extensionFor(fileName = '') {
  return path.extname(fileName).replace(/^\./, '').toLowerCase() || null;
}

function fingerprintFor(sourceType, input = {}, source = {}) {
  const parts = [
    sourceType,
    source.provider || '',
    source.provider_asset_id || '',
    source.vimeo_id || '',
    source.zoom_meeting_id || '',
    source.recording_id || '',
    source.file_name || '',
    source.drive_file_id || '',
    input.class_session_id || input.classSessionId || input.live_session_id || input.liveSessionId || '',
    input.lesson_id || input.lessonId || '',
  ];
  return stableHash(parts.join('\n--one-time-media--\n'));
}

function buildClassSessionHandoff(input = {}, source = {}, fingerprint = '') {
  const title = cleanText(
    input.class_title || input.classTitle || input.lesson_title || input.lessonTitle || input.title,
    'One Time media handoff'
  );
  const id = input.class_session_id
    || input.classSessionId
    || input.live_session_id
    || input.liveSessionId
    || stableId('CLASSSESSION', [fingerprint, title]);
  return {
    id,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    title,
    lesson_id: cleanText(input.lesson_id || input.lessonId),
    course_id: cleanText(input.course_id || input.courseId),
    module_id: cleanText(input.module_id || input.moduleId),
    start_at: input.start_at || input.startAt || input.class_start_at || input.classStartAt || null,
    source_type: source.type,
    source_fingerprint: fingerprint,
    attendance_minutes_status: source.type === 'zoom_recording' ? 'zoom_preview_ready' : 'review_required',
    media_status: 'draft_handoff',
    publish_status: 'blocked_until_operator_approval',
  };
}

function buildReviewItem(title, reason, sourceFingerprint, metadata = {}) {
  return {
    id: stableId('REVIEW', [REQUIREMENT_ID, sourceFingerprint, title, reason]),
    title,
    status: 'needs_review',
    reason,
    source_fingerprint: sourceFingerprint,
    metadata,
  };
}

function buildVideoReference(context, source, fingerprint, input = {}) {
  if (!source.provider_asset_id) return null;
  return unwrap(createVideoAssetReference(context, {
    provider: source.provider,
    provider_asset_id: source.provider_asset_id,
    source_url: source.safe_source_url || '',
    playback_url: source.playback_url || '',
    duration_seconds: input.duration_seconds || input.durationSeconds,
    privacy: source.privacy || 'workspace',
    status: source.video_reference_status || 'draft_reference',
    metadata: {
      requirement_id: REQUIREMENT_ID,
      source_type: source.type,
      source_fingerprint: fingerprint,
      no_upload_performed: true,
      privacy_review_required: source.privacy_review_required === true,
    },
  }));
}

function normalizeZoomEvent(event = {}, source = {}) {
  if (event.payload || event.object || event.participant || event.event || event.event_type || event.eventType) {
    return {
      ...event,
      meeting_id: event.meeting_id || event.meetingId || event.zoom_meeting_id || source.zoom_meeting_id,
    };
  }
  return {
    event: event.type || 'meeting.participant_joined',
    meeting_id: source.zoom_meeting_id,
    participant: event,
  };
}

function buildZoomSource(input = {}, options = {}) {
  const zoomUrl = firstValue(
    input.zoom_recording_url,
    input.zoomRecordingUrl,
    input.zoom_meeting_url,
    input.zoomMeetingUrl,
    input.source_url,
    input.sourceUrl,
    input.url
  );
  const meetingId = normalizeZoomMeetingId(input.zoom_meeting_id || input.zoomMeetingId || input.meeting_id || input.meetingId || zoomUrl);
  const recordingId = cleanText(input.recording_id || input.recordingId || input.provider_asset_id || input.providerAssetId || input.source_id || input.sourceId || meetingId);
  const source = {
    type: 'zoom_recording',
    provider: 'zoom',
    zoom_meeting_id: meetingId,
    recording_id: recordingId,
    provider_asset_id: recordingId || meetingId,
    url_present: Boolean(zoomUrl),
    sanitized_url_included: false,
    safe_source_url: '',
    playback_url: '',
    privacy: 'admin_provider_only',
    privacy_review_required: true,
    video_reference_status: 'draft_recording_review',
  };
  source.fingerprint = fingerprintFor(source.type, input, source);
  const events = Array.isArray(input.participant_events || input.participantEvents)
    ? (input.participant_events || input.participantEvents)
    : (Array.isArray(input.zoom_events || input.zoomEvents) ? (input.zoom_events || input.zoomEvents) : []);
  const previews = events.map((event) => buildZoomWebhookAttendancePreview(
    normalizeZoomEvent(event, source),
    options.zoomOptions || options
  ));
  const counts = previews.reduce((acc, preview) => {
    const status = preview.webhook?.mapped_attendance_status || 'needs_review';
    acc[status] = (acc[status] || 0) + 1;
    if (preview.webhook?.needs_correction_review) acc.needs_correction_review += 1;
    return acc;
  }, { total_events: previews.length, needs_correction_review: 0 });
  return {
    source,
    attendance_preview: {
      provider: 'zoom',
      preview_only: true,
      external_write_performed: false,
      attendance_write_performed: false,
      accepted_live_webhook: false,
      meeting_id: meetingId,
      event_previews: previews.map((preview) => preview.webhook),
      counts,
      correction_draft: buildZoomAttendanceCorrectionDraft({
        live_session_id: input.live_session_id || input.liveSessionId || input.class_session_id || input.classSessionId,
        member_id: input.member_id || input.memberId,
        status: input.attendance_status || input.attendanceStatus || 'needs_review',
        reason: input.attendance_review_reason || input.attendanceReviewReason || 'Zoom media pipeline preview.',
      }).correction,
    },
    meeting_preview: buildZoomMeetingPreview({
      topic: input.class_title || input.classTitle || input.title,
      start_time: input.start_at || input.startAt,
      duration_minutes: input.duration_minutes || input.durationMinutes,
      timezone: input.timezone,
    }, options.zoomOptions || options).meeting,
  };
}

function buildVimeoSource(input = {}, options = {}) {
  const url = firstValue(input.vimeo_url, input.vimeoUrl, input.media_url, input.mediaUrl, input.source_url, input.sourceUrl, input.url);
  const parsed = parseVimeoUrl(url || '');
  const explicitAssetId = cleanText(input.provider_asset_id || input.providerAssetId || input.video_id || input.videoId);
  const vimeoId = parsed.ok ? parsed.id : explicitAssetId;
  const source = {
    type: 'vimeo_asset',
    provider: 'vimeo',
    vimeo_id: vimeoId,
    provider_asset_id: vimeoId,
    url_present: Boolean(url),
    parse_status: parsed.ok ? 'valid_vimeo_url' : parsed.error,
    safe_source_url: parsed.ok ? parsed.url : '',
    playback_url: parsed.ok ? parsed.embed_url : '',
    privacy: 'workspace',
    privacy_review_required: false,
    video_reference_status: parsed.ok ? 'draft_reference' : 'needs_valid_vimeo_url',
  };
  source.fingerprint = fingerprintFor(source.type, input, source);
  const attachment = attachVimeoUrl({ content_id: input.content_id || input.contentId, vimeo_url: url || '' });
  return {
    source,
    vimeo_attachment: attachment,
    upload_intent: createVimeoUploadIntent({
      title: input.class_title || input.classTitle || input.title || 'One Time class video',
    }, options.vimeoOptions || options),
  };
}

function buildDropFolderSource(input = {}) {
  const fullPath = firstValue(input.file_path, input.filePath, input.local_path, input.localPath, input.drive_path, input.drivePath, input.source_path, input.sourcePath);
  const fileName = cleanText(input.filename || input.file_name || input.name || safeFileName(fullPath), 'one-time-video');
  const sourceApproved = input.source_approved === true
    || input.sourceApproved === true
    || input.folder_approved === true
    || input.folderApproved === true
    || input.approved === true;
  const privacyReviewRequired = truthy(input.contains_private_data)
    || truthy(input.containsPrivateData)
    || truthy(input.raw_recording)
    || truthy(input.rawRecording)
    || /(?:private|raw|student|parent)/i.test(String(input.privacy || input.review_flags || input.reviewFlags || ''));
  const driveFileId = cleanText(input.drive_file_id || input.driveFileId || input.file_id || input.fileId);
  const source = {
    type: 'approved_drop_folder_video',
    provider: 'drop_folder',
    provider_asset_id: driveFileId || cleanText(input.checksum || input.sha256 || input.provider_asset_id || input.providerAssetId),
    file_name: fileName,
    extension: extensionFor(fileName),
    folder_label: cleanText(input.folder_label || input.folderLabel || input.folder || 'approved drop folder'),
    drive_file_id: driveFileId || null,
    drive_file_id_present: Boolean(driveFileId),
    local_path_present: Boolean(fullPath),
    full_path_included: false,
    source_approved: sourceApproved,
    safe_source_url: '',
    playback_url: '',
    privacy: privacyReviewRequired ? 'admin_provider_only' : 'workspace',
    privacy_review_required: privacyReviewRequired || !sourceApproved,
    video_reference_status: privacyReviewRequired ? 'privacy_review_required' : 'draft_reference',
  };
  source.provider_asset_id = source.provider_asset_id || `${normalizeKey(fileName)}_${stableHash(`${fullPath}|${fileName}`).slice(0, 12)}`;
  source.fingerprint = fingerprintFor(source.type, input, source);
  return { source };
}

function buildLibraryDraft(source = {}, videoReference = null, classSession = {}) {
  const status = source.privacy_review_required
    ? 'needs_privacy_review'
    : 'needs_operator_approval';
  return {
    id: stableId('LIBRARYDRAFT', [source.fingerprint, videoReference?.id || source.provider_asset_id]),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    class_session_id: classSession.id,
    video_asset_id: videoReference?.id || null,
    provider: source.provider,
    source_type: source.type,
    title: classSession.title,
    status,
    publish_enabled: false,
    member_library_publish_performed: false,
    approval_required: true,
    privacy_review_required: source.privacy_review_required === true,
  };
}

function buildWorksheetMaterialHandoff(input = {}, source = {}, classSession = {}) {
  const transcriptPresent = Boolean(cleanText(input.transcript_text || input.transcriptText || input.transcript_reference || input.transcriptReference));
  const worksheetRequested = truthy(input.worksheet_requested || input.worksheetRequested)
    || /\b(worksheet|source[-_\s]?sheet|handout|materials?)\b/i.test(String(input.raw_text || input.rawText || input.notes || ''));
  return {
    id: stableId('MATERIALHANDOFF', [source.fingerprint, classSession.id]),
    status: transcriptPresent || worksheetRequested ? 'draft_material_review' : 'optional',
    transcript_present: transcriptPresent,
    worksheet_requested: worksheetRequested,
    external_write_performed: false,
    student_visible: false,
    parent_visible: false,
    approval_required_before_visibility: true,
  };
}

function buildOneTimeMediaPipelinePreview(input = {}, options = {}) {
  const sourceType = inferSourceType(input);
  const context = options.context || buildLocalAdminContext(options);
  const reviewItems = [];
  let built = {};

  if (sourceType === 'zoom_recording') {
    built = buildZoomSource(input, options);
  } else if (sourceType === 'vimeo_asset') {
    built = buildVimeoSource(input, options);
  } else if (sourceType === 'approved_drop_folder_video') {
    built = buildDropFolderSource(input, options);
  } else {
    const source = {
      type: 'unknown_media_source',
      provider: 'local_preview',
      provider_asset_id: cleanText(input.provider_asset_id || input.providerAssetId || input.source_id || input.sourceId),
      safe_source_url: '',
      playback_url: '',
      privacy: 'admin_provider_only',
      privacy_review_required: true,
      video_reference_status: 'needs_source_review',
    };
    source.fingerprint = fingerprintFor(source.type, input, source);
    built = { source };
  }

  const { source } = built;
  if (!source.provider_asset_id) {
    reviewItems.push(buildReviewItem(
      'Confirm media source asset ID',
      'The media pipeline could not derive a provider asset ID from the local input.',
      source.fingerprint,
      { source_type: source.type }
    ));
  }
  if (source.type === 'vimeo_asset' && source.parse_status !== 'valid_vimeo_url') {
    reviewItems.push(buildReviewItem(
      'Paste valid Vimeo URL before library mapping',
      'Vimeo mapping requires a valid Vimeo URL or explicit reviewed asset ID.',
      source.fingerprint,
      { parse_status: source.parse_status }
    ));
  }
  if (source.type === 'zoom_recording' && !source.zoom_meeting_id) {
    reviewItems.push(buildReviewItem(
      'Confirm Zoom meeting ID',
      'Zoom attendance and minutes preview needs a meeting ID or meeting URL.',
      source.fingerprint
    ));
  }
  if (source.type === 'approved_drop_folder_video' && source.privacy_review_required) {
    reviewItems.push(buildReviewItem(
      'Complete privacy review before publishing drop-folder video',
      'Drop-folder videos stay admin/provider-only until source approval and private-data review are complete.',
      source.fingerprint,
      { source_approved: source.source_approved }
    ));
  }

  const classSession = buildClassSessionHandoff(input, source, source.fingerprint);
  const videoReference = buildVideoReference(context, source, source.fingerprint, input);
  const readiness = buildOneTimeIntegrationReadinessPayload({
    checkedAt: options.checkedAt,
    videoHostingReadiness: options.videoHostingReadiness,
    zoomReadiness: options.zoomReadiness,
    resendReadiness: options.resendReadiness,
    stripeReadiness: options.stripeReadiness,
  });

  return {
    pipeline_version: ONE_TIME_MEDIA_PIPELINE_VERSION,
    requirement_id: REQUIREMENT_ID,
    checked_at: options.checkedAt || new Date().toISOString(),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    media_upload_performed: false,
    zoom_mutation_performed: false,
    zoom_webhook_accepted: false,
    attendance_write_performed: false,
    drive_permission_write_performed: false,
    drive_file_copy_performed: false,
    member_library_publish_performed: false,
    notification_send_performed: false,
    secret_values_included: false,
    source,
    class_session_handoff: classSession,
    video_reference: videoReference,
    attendance_preview: built.attendance_preview || null,
    meeting_preview: built.meeting_preview || null,
    vimeo_attachment: built.vimeo_attachment || null,
    upload_intent: built.upload_intent || null,
    library_draft: buildLibraryDraft(source, videoReference, classSession),
    worksheet_material_handoff: buildWorksheetMaterialHandoff(input, source, classSession),
    review_items: reviewItems,
    readiness_cards: readiness.cards.filter((card) => ['vimeo', 'zoom'].includes(card.provider)),
    blocked_actions: [
      'video_upload',
      'vimeo_publication_mutation',
      'zoom_meeting_create',
      'zoom_webhook_accept',
      'attendance_write',
      'drive_permission_write',
      'drive_file_copy',
      'member_library_publish',
      'parent_student_notification_send',
    ],
    guardrails: [
      'preview_only',
      'external_write_performed_false',
      'no_zoom_secret_or_url_query_in_output',
      'no_video_upload',
      'no_drive_permission_write',
      'no_member_library_publish',
      'privacy_review_before_public_visibility',
      'operator_approval_required_for_live_provider_actions',
    ],
    idempotency: {
      source_fingerprint: source.fingerprint,
      class_session_id: classSession.id,
      video_asset_id: videoReference?.id || null,
      library_draft_id: stableId('LIBRARYDRAFT', [source.fingerprint, videoReference?.id || source.provider_asset_id]),
    },
  };
}

module.exports = {
  ONE_TIME_MEDIA_PIPELINE_VERSION,
  buildLocalAdminContext,
  buildOneTimeMediaPipelinePreview,
  inferSourceType,
};
