const {
  loadConfigValue,
  loadSecret,
  redactError,
} = require('./secret-loader');
const {
  requireExternalApproval,
} = require('./external-actions');

const VIDEO_HOST_DECISION_OPTIONS = [
  {
    provider: 'vimeo',
    filterReliability: 'Usually better for private embeds than public video portals, but plan/account support must be confirmed.',
    embedControl: 'Private links and domain/embed controls may fit family/student access if the plan supports them.',
    apiUpload: 'Requires token and plan/account capability confirmation.',
    captionsTranscripts: 'Supports caption workflows; transcript source can remain BNA/Drive-first.',
    ownershipModel: 'Needs a documented BNA or Rabbi-owned admin account.',
  },
  {
    provider: 'youtube',
    filterReliability: 'May be blocked by family/student filters, especially for supervised devices.',
    embedControl: 'Unlisted/private embed behavior depends on account and viewer restrictions.',
    apiUpload: 'API upload requires OAuth scopes and quota planning.',
    captionsTranscripts: 'Good caption ecosystem, but public-platform exposure must be reviewed.',
    ownershipModel: 'Needs BNA/Rabbi channel ownership and OAuth approval.',
  },
  {
    provider: 'drive_or_first_party',
    filterReliability: 'Often works where video portals are filtered, but player UX and permissions need care.',
    embedControl: 'Strong first-party gating possible if files are copied/hosted through approved app paths.',
    apiUpload: 'Drive upload/write actions require explicit Google approval gates.',
    captionsTranscripts: 'BNA transcript/worksheet pipeline can remain provider-neutral.',
    ownershipModel: 'Can stay under BNA Operations/Drive ownership if approved.',
  },
];

const RECORDING_PIPELINE_REQUIREMENT_ID = 'REQ-20260619-308';

const RECORDING_PIPELINE_SECTIONS = [
  {
    key: 'recording_webhook_handling',
    label: 'Recording Webhook Handling',
    status: 'local_contract_present',
    result: 'Normalizes recording webhook/sample payloads without accepting live provider webhooks.',
  },
  {
    key: 'recording_file_selection',
    label: 'Recording File Selection',
    status: 'preview_ready',
    result: 'Ranks multiple recording files, preferred layouts, and audio-only fallbacks locally.',
  },
  {
    key: 'transcript_summary_retrieval',
    label: 'Transcript And Summary Retrieval',
    status: 'preview_ready',
    result: 'Tracks transcript and summary readiness without fetching private provider assets.',
  },
  {
    key: 'retry_dead_letter_idempotency',
    label: 'Retry, Dead Letter, And Idempotency',
    status: 'local_contract_present',
    result: 'Defines retry/dead-letter/idempotency keys for repeated provider events.',
  },
  {
    key: 'review_correction_approval',
    label: 'Review, Correction, Approval, Rejection',
    status: 'local_contract_present',
    result: 'Keeps Rabbi/operator review decisions local before any publishing action.',
  },
  {
    key: 'manual_and_api_vimeo_modes',
    label: 'Manual And API Vimeo Modes',
    status: 'needs_operator_decision',
    result: 'Supports manual Vimeo ID entry and API-upload preview while leaving uploads disabled.',
  },
  {
    key: 'publication_unpublish_retention',
    label: 'Publication, Unpublish, Deletion, Retention',
    status: 'blocked_external_approval',
    result: 'Blocks publish, unpublish, and deletion until approval, playback, metadata, transcript, and retention checks pass.',
  },
  {
    key: 'entitlement_watch_progress',
    label: 'Entitlement And Watch Progress',
    status: 'local_contract_present',
    result: 'Defines member-library entitlement and watch-progress handoff without granting access.',
  },
  {
    key: 'release_live_smoke',
    label: 'Release And Live Smoke',
    status: 'blocked_external_approval',
    result: 'Deployment, provider writes, member visibility, and live smoke require operator approval.',
  },
];

function getVideoHostingConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const vimeoToken = options.vimeoToken !== undefined ? String(options.vimeoToken || '').trim() : loadSecret({
    envName: 'VIMEO_ACCESS_TOKEN',
    names: ['vimeo-access-token', 'vimeo'],
    fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt'],
    repoRoot,
  }).value;
  const vimeoClientId = options.vimeoClientId !== undefined ? String(options.vimeoClientId || '').trim() : loadSecret({
    envName: 'VIMEO_CLIENT_ID',
    names: ['vimeo-client-id', 'vimeo'],
    fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt'],
    repoRoot,
  }).value;
  const vimeoClientSecret = options.vimeoClientSecret !== undefined ? String(options.vimeoClientSecret || '').trim() : loadSecret({
    envName: 'VIMEO_CLIENT_SECRET',
    names: ['vimeo-client-secret', 'vimeo'],
    fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt'],
    repoRoot,
  }).value;
  const providerDecision = String(options.providerDecision || loadConfigValue({
    envName: 'BNA_VIDEO_HOST_PROVIDER',
    names: ['video-host-provider', 'video-hosting', 'vimeo'],
    fileNames: ['video-host-provider.txt', 'BNA_VIDEO_HOST_PROVIDER.txt', 'video-hosting.txt', 'vimeo.txt'],
    repoRoot,
  }) || 'vimeo').trim().toLowerCase();
  return {
    vimeoToken,
    vimeoClientId,
    vimeoClientSecret,
    providerDecision,
    accountOwner: String(options.accountOwner || loadConfigValue({
      envName: 'BNA_VIDEO_HOST_ACCOUNT_OWNER',
      names: ['video-host-account-owner', 'video-hosting', 'vimeo'],
      fileNames: ['video-host-account-owner.txt', 'BNA_VIDEO_HOST_ACCOUNT_OWNER.txt', 'video-hosting.txt', 'vimeo.txt'],
      repoRoot,
    }) || 'unknown').trim() || 'unknown',
    vimeoPlan: String(options.vimeoPlan || loadConfigValue({
      envName: 'VIMEO_PLAN',
      names: ['vimeo-plan', 'vimeo'],
      fileNames: ['vimeo-plan.txt', 'VIMEO_PLAN.txt', 'vimeo.txt'],
      repoRoot,
    }) || '').trim(),
  };
}

function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function parseVimeoId(value = '') {
  const text = String(value || '').trim();
  const match = text.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d{5,})/i)
    || text.match(/\b(\d{5,})\b/);
  return match ? match[1] : '';
}

function normalizeRecordingFile(file = {}, index = 0) {
  const recordingType = safeText(file.recording_type || file.recordingType || file.type || file.layout || 'unknown').toLowerCase();
  const fileType = safeText(file.file_type || file.fileType || file.mime_type || file.mimeType || 'unknown').toLowerCase();
  const sizeBytes = safeNumber(file.file_size || file.fileSize || file.size_bytes || file.sizeBytes, 0);
  const hasDownloadUrl = Boolean(safeText(file.download_url || file.downloadUrl || file.url));
  const isAudioOnly = /audio/.test(recordingType) || /audio/.test(fileType) || file.audio_only === true || file.audioOnly === true;
  const layoutRank = (() => {
    if (/shared.*speaker|speaker.*shared|screen.*speaker/.test(recordingType)) return 10;
    if (/active.*speaker|speaker/.test(recordingType)) return 8;
    if (/gallery/.test(recordingType)) return 6;
    if (/shared|screen/.test(recordingType)) return 5;
    if (isAudioOnly) return 2;
    return 3;
  })();
  return {
    local_file_ref: safeText(file.id || file.file_id || file.fileId || `recording_file_${index + 1}`),
    recording_type: recordingType,
    file_type: fileType,
    size_bytes: sizeBytes > 0 ? sizeBytes : null,
    duration_seconds: safeNumber(file.duration || file.duration_seconds || file.durationSeconds, 0) || null,
    has_download_url: hasDownloadUrl,
    audio_only: isAudioOnly,
    layout_rank: layoutRank,
    selected_for_preview: false,
    external_write_performed: false,
  };
}

function preferredRecordingFile(files = []) {
  const normalized = files.map(normalizeRecordingFile);
  const ranked = normalized.slice().sort((a, b) => {
    if (b.layout_rank !== a.layout_rank) return b.layout_rank - a.layout_rank;
    return (b.size_bytes || 0) - (a.size_bytes || 0);
  });
  const preferred = ranked[0] || null;
  return normalized.map((file) => ({
    ...file,
    selected_for_preview: preferred ? file.local_file_ref === preferred.local_file_ref : false,
  }));
}

function buildPublicationReadinessChecks(payload = {}) {
  const transcriptText = safeText(payload.transcript || payload.transcript_text || payload.transcriptText);
  const summaryText = safeText(payload.summary || payload.summary_text || payload.summaryText);
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
  return {
    correct_vimeo_asset_exists: Boolean(parseVimeoId(payload.vimeo_url || payload.vimeoUrl || payload.media_url || payload.mediaUrl || payload.vimeo_id || payload.vimeoId)),
    processing_completed: payload.processing_completed === true || payload.processingCompleted === true || safeText(payload.processing_status || payload.processingStatus).toLowerCase() === 'complete',
    playback_verified: payload.playback_verified === true || payload.playbackVerified === true,
    metadata_saved: Boolean(metadata.masechta || metadata.perek || metadata.mishnah || payload.masechta || payload.title),
    transcript_summary_saved: Boolean(transcriptText && summaryText),
    retention_permits_deletion: payload.retention_permits_deletion === true || payload.retentionPermitsDeletion === true,
  };
}

function getVideoHostingReadiness(options = {}) {
  const config = options.config || getVideoHostingConfig(options);
  const blockers = [];
  if (!config.providerDecision) blockers.push('Vimeo is the default candidate, but the video host decision still needs explicit owner confirmation before uploads.');
  if (config.providerDecision === 'vimeo' && !config.vimeoToken) blockers.push('Vimeo access token is not configured server-side.');
  if (config.providerDecision === 'vimeo' && !config.vimeoPlan) blockers.push('Confirm the current Vimeo plan/account supports API uploads and intended embed controls.');
  if (config.accountOwner === 'unknown') blockers.push('Video-host account owner/admin must be documented before upload or publish actions.');
  const manualFallbackReady = config.providerDecision === 'vimeo' || !config.providerDecision;
  return {
    provider: 'video_hosting',
    label: 'Vimeo / Video Hosting',
    configured: Boolean(config.providerDecision && (config.providerDecision !== 'vimeo' || config.vimeoToken)),
    status: config.providerDecision === 'vimeo' && !config.vimeoToken
      ? 'manual_upload_required'
      : config.providerDecision && (config.providerDecision !== 'vimeo' || config.vimeoToken)
        ? 'configured'
        : 'not_configured',
    mode: config.providerDecision || 'undecided',
    accountOwner: config.accountOwner,
    safeActions: ['hosting_decision_review', 'video_library_draft', 'manual_vimeo_url_attach', 'worksheet_preview', 'upload_preview'],
    blockedActions: ['provider_upload', 'provider_publish', 'host_migration'],
    blockers,
    decisionTable: VIDEO_HOST_DECISION_OPTIONS,
    vimeo: {
      configured: Boolean(config.vimeoToken),
      appCredentialsConfigured: Boolean(config.vimeoClientId && config.vimeoClientSecret),
      planConfigured: Boolean(config.vimeoPlan),
      manualUploadFallbackReady: manualFallbackReady,
      apiUploadStatus: config.vimeoToken && config.vimeoPlan ? 'needs_upload_access_check' : 'manual_only',
    },
    manualFallback: {
      ready: manualFallbackReady,
      library_item_status: 'waiting_for_vimeo_url',
      next_step: 'Manually upload in Vimeo, paste the Vimeo URL, then publish after approval.',
    },
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildVideoLibraryDraft(payload = {}, options = {}) {
  return {
    provider: 'video_hosting',
    preview_only: true,
    external_write_performed: false,
    readiness: getVideoHostingReadiness(options),
    draft: {
      title: String(payload.title || 'Untitled class recording').slice(0, 180),
      source_kind: String(payload.source_kind || payload.sourceKind || 'drive_drop'),
      source_file_id_present: Boolean(payload.source_file_id || payload.sourceFileId),
      transcript_present: Boolean(String(payload.transcript || payload.transcript_text || '').trim()),
      worksheet_style_sample_present: Boolean(payload.worksheet_style_sample || payload.worksheetStyleSample),
      student_questions_count: Array.isArray(payload.student_questions) ? payload.student_questions.length : 0,
      approval_status: 'draft',
    },
  };
}

function buildRecordingPipelinePreview(payload = {}, options = {}) {
  const config = options.config || getVideoHostingConfig(options);
  const readiness = getVideoHostingReadiness({ ...options, config });
  const classSession = payload.class_session || payload.classSession || payload.session || {};
  const contentJob = payload.content_job || payload.contentJob || {};
  const rawFiles = asArray(payload.recording_files || payload.recordingFiles || payload.files || payload.recording_file || payload.recordingFile);
  const files = preferredRecordingFile(rawFiles);
  const selectedFile = files.find((file) => file.selected_for_preview) || null;
  const transcriptText = safeText(payload.transcript || payload.transcript_text || payload.transcriptText || classSession.transcript_text || contentJob.transcript_text);
  const summaryText = safeText(payload.summary || payload.summary_text || payload.summaryText || classSession.summary || contentJob.summary);
  const sourceId = safeText(payload.source_recording_id || payload.sourceRecordingId || payload.zoom_recording_id || payload.zoomRecordingId || classSession.id || contentJob.id);
  const idempotencySource = [
    'recording_pipeline',
    sourceId || 'unknown_source',
    selectedFile?.local_file_ref || 'no_file',
    parseVimeoId(payload.vimeo_url || payload.media_url || classSession.media_url || classSession.vimeo_id || ''),
  ].join(':');
  const publicationChecks = buildPublicationReadinessChecks({
    ...payload,
    transcript: transcriptText,
    summary: summaryText,
    title: classSession.title || contentJob.title || payload.title,
  });
  return {
    provider: 'video_hosting',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    status: 'needs_operator_decision',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    readiness,
    sections: RECORDING_PIPELINE_SECTIONS,
    gates: {
      live_webhook_accept_enabled: false,
      provider_asset_fetch_enabled: false,
      api_upload_enabled: false,
      vimeo_publish_enabled: false,
      unpublish_enabled: false,
      delete_enabled: false,
      member_visibility_enabled: false,
      notification_send_enabled: false,
    },
    summary: {
      recording_files_seen: files.length,
      preferred_file_selected: Boolean(selectedFile),
      audio_only_files_seen: files.filter((file) => file.audio_only).length,
      transcript_present: Boolean(transcriptText),
      summary_present: Boolean(summaryText),
      vimeo_id_present: Boolean(parseVimeoId(payload.vimeo_url || payload.media_url || classSession.media_url || classSession.vimeo_id || '')),
      publication_checks_passed: Object.values(publicationChecks).filter(Boolean).length,
      publication_checks_total: Object.keys(publicationChecks).length,
    },
    recording_webhook: {
      status: 'preview_ready',
      event_type: safeText(payload.event || payload.event_type || payload.eventType || 'recording.completed.preview'),
      source_recording_id_present: Boolean(sourceId),
      live_webhook_accepted: false,
      external_write_performed: false,
    },
    recording_files: files,
    preferred_file: selectedFile,
    transcript_summary: {
      status: transcriptText && summaryText ? 'ready_for_review' : 'needs_transcript_or_summary',
      transcript_present: Boolean(transcriptText),
      transcript_chars: transcriptText.length,
      summary_present: Boolean(summaryText),
      summary_chars: summaryText.length,
      retrieval_enabled: false,
      blocker: transcriptText && summaryText ? null : 'Save transcript and summary before publication approval.',
    },
    retry_dead_letter: {
      idempotency_key: idempotencySource.replace(/[^A-Za-z0-9:_-]/g, '_').slice(0, 180),
      retry_state: 'manual_retry_available',
      dead_letter_state: 'operator_review_required',
      retry_write_enabled: false,
    },
    review_flow: {
      review_state: safeText(payload.review_state || payload.reviewState || 'needs_review'),
      correction_enabled: true,
      approval_enabled: false,
      rejection_enabled: false,
      approval_blocker: 'Publication approval remains no-write until operator release/live-smoke scope is approved.',
    },
    publication: buildVimeoPublicationPreview({
      ...payload,
      vimeo_url: payload.vimeo_url || payload.vimeoUrl || payload.media_url || payload.mediaUrl || classSession.media_url || classSession.vimeo_id || '',
      transcript: transcriptText,
      summary: summaryText,
      title: classSession.title || contentJob.title || payload.title,
      metadata: payload.metadata || classSession.metadata || {},
    }, { ...options, config }).publication,
    retention: buildRecordingRetentionPreview(payload).retention,
    entitlement_watch_progress: {
      required_tier: safeText(payload.required_tier || payload.requiredTier || 'library_only'),
      member_visibility_enabled: false,
      watch_progress_write_enabled: false,
      blocker: 'Member visibility and watch-progress writes require approved publication and live smoke.',
    },
    blockers: [
      ...readiness.blockers,
      'Never publish directly from a webhook; operator/Rabbi review and exact approval are required.',
      'Real Vimeo upload/publish/unpublish/delete, member visibility, notifications, and provider writes require explicit operator approval and live smoke.',
    ],
  };
}

function buildVimeoPublicationPreview(payload = {}, options = {}) {
  const config = options.config || getVideoHostingConfig(options);
  const readiness = getVideoHostingReadiness({ ...options, config });
  const vimeoId = parseVimeoId(payload.vimeo_url || payload.vimeoUrl || payload.media_url || payload.mediaUrl || payload.vimeo_id || payload.vimeoId);
  const checks = buildPublicationReadinessChecks(payload);
  return {
    provider: 'video_hosting',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    readiness,
    publication: {
      status: 'needs_operator_decision',
      mode: vimeoId ? 'manual_vimeo_id_review' : (config.vimeoToken ? 'api_upload_preview' : 'manual_upload_required'),
      vimeo_id_present: Boolean(vimeoId),
      checks,
      publish_enabled: false,
      unpublish_enabled: false,
      delete_enabled: false,
      member_visibility_enabled: false,
      required_confirmation: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
      blocker: 'Publication, unpublishing, deletion, and member visibility require approved asset, playback, metadata, transcript/summary, retention checks, release, and live smoke.',
    },
  };
}

function buildRecordingRetentionPreview(payload = {}) {
  return {
    provider: 'video_hosting',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    retention: {
      policy: safeText(payload.retention_policy || payload.retentionPolicy || 'retain_source_until_publication_verified'),
      delete_enabled: false,
      source_delete_allowed: false,
      requires_verified_backup: true,
      requires_playback_smoke: true,
      requires_operator_approval: true,
      blocker: 'Source recordings are not deleted until retention policy, backup, playback smoke, and operator approval are recorded.',
    },
  };
}

function assertVideoUploadApproved(payload = {}, options = {}) {
  const config = options.config || getVideoHostingConfig(options);
  const readiness = getVideoHostingReadiness({ ...options, config });
  requireExternalApproval({
    provider: readiness.mode === 'vimeo' ? 'vimeo' : 'video_hosting',
    action: 'upload',
    riskLevel: 'high',
    previewOnly: false,
    confirm: payload.confirm || payload.confirmation_phrase || '',
    accountOwner: readiness.accountOwner,
    mode: readiness.mode,
    secrets: [config.vimeoToken],
  });
  const error = new Error('Video upload is intentionally blocked until the video host decision, account owner, upload support, and rollback plan are approved.');
  error.status = 409;
  throw error;
}

function safeVideoHostingError(error, config = {}) {
  return redactError(error, [config.vimeoToken]);
}

module.exports = {
  RECORDING_PIPELINE_REQUIREMENT_ID,
  RECORDING_PIPELINE_SECTIONS,
  VIDEO_HOST_DECISION_OPTIONS,
  assertVideoUploadApproved,
  buildRecordingPipelinePreview,
  buildRecordingRetentionPreview,
  buildVimeoPublicationPreview,
  buildVideoLibraryDraft,
  getVideoHostingConfig,
  getVideoHostingReadiness,
  safeVideoHostingError,
};
