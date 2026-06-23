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

const SELECTED_VIDEO_HOST_PROVIDER = 'vimeo';

const MANUAL_VIMEO_WORKFLOW_STEPS = [
  'operator_selects_class_session',
  'operator_pastes_vimeo_url',
  'system_validates_vimeo_url',
  'system_stores_vimeo_video_id',
  'operator_assigns_learning_metadata',
  'rabbi_or_admin_reviews',
  'admin_approves',
  'admin_publishes_to_member_library',
  'member_library_displays_item',
  'admin_can_unpublish_or_restore',
];

const AUTOMATED_VIMEO_UPLOAD_STATES = [
  'disabled_feature_flag',
  'needs_authenticated_vimeo_user',
  'needs_account_owner_and_plan_readback',
  'needs_upload_scope_and_quota_readback',
  'needs_folder_privacy_embed_defaults',
  'ready_for_operator_gated_upload_smoke',
];

const RECORDING_PUBLICATION_LIFECYCLE = [
  'scheduled',
  'meeting_created',
  'live',
  'ended',
  'recording_processing',
  'recording_ready',
  'transcript_ready',
  'summary_ready',
  'privacy_review',
  'rabbi_review',
  'approved',
  'vimeo_manual_or_automated_upload',
  'vimeo_processing',
  'playback_verified',
  'member_library_publication',
  'indexed',
  'archived',
];

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
    status: 'manual_ready_api_disabled',
    result: 'Manual Vimeo URL attachment and member-library publishing are usable with internal approval; API upload remains disabled behind setup.',
  },
  {
    key: 'publication_unpublish_retention',
    label: 'Publication, Unpublish, Deletion, Retention',
    status: 'approval_gated',
    result: 'First-party publish/unpublish is explicit-approval gated; provider deletion remains blocked until playback, metadata, transcript, summary, and retention checks pass.',
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
    status: 'manual_smoke_ready',
    result: 'Temporary-record member-library smoke can verify manual publication without uploading, sending, or inviting.',
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
  }) || SELECTED_VIDEO_HOST_PROVIDER).trim().toLowerCase();
  const automatedUploadEnabled = /^(1|true|yes|enabled)$/i.test(String((options.automatedUploadEnabled ?? loadConfigValue({
    envName: 'BNA_VIMEO_AUTOMATED_UPLOAD_ENABLED',
    names: ['vimeo-automated-upload-enabled', 'video-hosting'],
    fileNames: ['BNA_VIMEO_AUTOMATED_UPLOAD_ENABLED.txt', 'vimeo-automated-upload-enabled.txt'],
    repoRoot,
  })) || '').trim());
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
    automatedUploadEnabled,
    callbackUrl: String(options.callbackUrl || loadConfigValue({
      envName: 'VIMEO_CALLBACK_URL',
      names: ['vimeo-callback-url', 'video-hosting'],
      fileNames: ['VIMEO_CALLBACK_URL.txt', 'vimeo-callback-url.txt'],
      repoRoot,
    }) || '').trim(),
    uploadScope: String(options.uploadScope || loadConfigValue({
      envName: 'VIMEO_UPLOAD_SCOPE',
      names: ['vimeo-upload-scope', 'video-hosting'],
      fileNames: ['VIMEO_UPLOAD_SCOPE.txt', 'vimeo-upload-scope.txt'],
      repoRoot,
    }) || '').trim(),
    storageQuota: String(options.storageQuota || loadConfigValue({
      envName: 'VIMEO_STORAGE_QUOTA',
      names: ['vimeo-storage-quota', 'video-hosting'],
      fileNames: ['VIMEO_STORAGE_QUOTA.txt', 'vimeo-storage-quota.txt'],
      repoRoot,
    }) || '').trim(),
    folder: String(options.folder || options.vimeoFolder || loadConfigValue({
      envName: 'VIMEO_FOLDER',
      names: ['vimeo-folder', 'video-hosting'],
      fileNames: ['VIMEO_FOLDER.txt', 'vimeo-folder.txt'],
      repoRoot,
    }) || '').trim(),
    privacyDefault: String(options.privacyDefault || loadConfigValue({
      envName: 'VIMEO_PRIVACY_DEFAULT',
      names: ['vimeo-privacy-default', 'video-hosting'],
      fileNames: ['VIMEO_PRIVACY_DEFAULT.txt', 'vimeo-privacy-default.txt'],
      repoRoot,
    }) || '').trim(),
    allowedEmbedDomains: String(options.allowedEmbedDomains || loadConfigValue({
      envName: 'VIMEO_ALLOWED_EMBED_DOMAINS',
      names: ['vimeo-allowed-embed-domains', 'video-hosting'],
      fileNames: ['VIMEO_ALLOWED_EMBED_DOMAINS.txt', 'vimeo-allowed-embed-domains.txt'],
      repoRoot,
    }) || '').split(',').map((item) => item.trim()).filter(Boolean),
    lastVerificationAt: String(options.lastVerificationAt || '').trim(),
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

function parseVimeoUrl(value = '') {
  const url = safeText(value);
  if (!url) return { ok: false, url: '', vimeo_id: '', embed_url: '', error: 'missing_vimeo_url' };
  const vimeoId = parseVimeoId(url);
  const isVimeoUrl = /(?:^https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\//i.test(url);
  if (!vimeoId || !isVimeoUrl) {
    return { ok: false, url, vimeo_id: '', embed_url: '', error: 'not_a_valid_vimeo_url' };
  }
  return {
    ok: true,
    url,
    vimeo_id: vimeoId,
    embed_url: `https://player.vimeo.com/video/${vimeoId}`,
    error: '',
  };
}

function normalizeTranscriptState(value = '') {
  const normalized = safeText(value, 'needs_review').toLowerCase().replace(/[\s-]+/g, '_');
  if (['missing', 'draft', 'needs_review', 'review', 'approved', 'published'].includes(normalized)) return normalized;
  return 'needs_review';
}

function normalizeLearningMetadata(payload = {}) {
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
  return {
    masechta: safeText(payload.masechta || metadata.masechta),
    perek: safeText(payload.perek || metadata.perek),
    mishnah_range: safeText(payload.mishnah_range || payload.mishnahRange || metadata.mishnah_range || metadata.mishnahRange || payload.mishnah || metadata.mishnah),
    class_date: safeText(payload.class_date || payload.classDate || metadata.class_date || metadata.classDate),
    title: safeText(payload.title || metadata.title, 'Untitled One Time class'),
    description: safeText(payload.description || payload.summary || metadata.description || metadata.summary),
    thumbnail_url: safeText(payload.thumbnail_url || payload.thumbnailUrl || metadata.thumbnail_url || metadata.thumbnailUrl),
    duration_seconds: safeNumber(payload.duration_seconds || payload.durationSeconds || metadata.duration_seconds || metadata.durationSeconds, 0) || null,
    transcript_state: normalizeTranscriptState(payload.transcript_state || payload.transcriptStatus || payload.transcript_status || metadata.transcript_state || metadata.transcriptStatus),
    visibility: safeText(payload.library_visibility || payload.visibility || metadata.visibility, 'tier'),
    required_tier: safeText(payload.required_tier || payload.requiredTier || metadata.required_tier || metadata.requiredTier, 'library_only'),
  };
}

function buildManualVimeoWorkflow(payload = {}, options = {}) {
  const parsed = parseVimeoUrl(payload.vimeo_url || payload.vimeoUrl || payload.media_url || payload.mediaUrl || payload.url);
  const metadata = normalizeLearningMetadata(payload);
  const missingMetadata = ['masechta', 'perek', 'mishnah_range', 'title']
    .filter((key) => !safeText(metadata[key]));
  const hasReview = ['review', 'approved', 'published'].includes(metadata.transcript_state)
    || payload.review_state === 'approved'
    || payload.reviewState === 'approved'
    || payload.rabbi_reviewed === true
    || payload.rabbiReviewed === true;
  const readyForApproval = parsed.ok && missingMetadata.length === 0;
  return {
    provider: 'vimeo',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    mode: 'manual_vimeo',
    selected_provider: SELECTED_VIDEO_HOST_PROVIDER,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    status: parsed.ok ? (readyForApproval ? 'manual_vimeo_ready' : 'needs_learning_metadata') : parsed.error,
    workflow_steps: MANUAL_VIMEO_WORKFLOW_STEPS,
    url_validation: parsed,
    vimeo_metadata_readback: {
      attempted: false,
      available: Boolean(metadata.title || metadata.thumbnail_url || metadata.duration_seconds),
      source: 'manual_or_mocked_metadata',
      title: metadata.title,
      description: metadata.description,
      thumbnail_url: metadata.thumbnail_url,
      duration_seconds: metadata.duration_seconds,
    },
    assignment: metadata,
    missing_metadata: missingMetadata,
    review: {
      rabbi_reviewed: hasReview,
      admin_approval_required: true,
      approval_phrase: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    },
    member_library: {
      first_party_publish_route_enabled: readyForApproval,
      publish_requires_approval_phrase: true,
      unpublish_route_enabled: true,
      rollback_route_enabled: true,
      provider_publish_enabled: false,
      notification_send_enabled: false,
    },
    next_action: readyForApproval
      ? 'Approve the package, publish to the first-party member library with the explicit approval phrase, then smoke the access-code view.'
      : 'Paste a valid Vimeo URL and complete Masechta, Perek, Mishnah range, and title before approval.',
    blockers: parsed.ok ? missingMetadata.map((field) => `missing_${field}`) : [parsed.error],
  };
}

function buildVimeoAutomatedUploadReadiness(options = {}) {
  const config = options.config || getVideoHostingConfig(options);
  const tokenPresent = Boolean(config.vimeoToken);
  const appCredentialsPresent = Boolean(config.vimeoClientId && config.vimeoClientSecret);
  const uploadCapabilityKnown = Boolean(config.uploadScope || config.storageQuota || config.vimeoPlan);
  const setup = {
    authenticated_vimeo_user: tokenPresent ? 'token_present_user_readback_pending' : 'missing_user_level_access_token',
    account_owner: config.accountOwner || 'unknown',
    plan: config.vimeoPlan || 'unknown',
    upload_scope: config.uploadScope || 'unknown',
    upload_capability: uploadCapabilityKnown ? 'needs_readback' : 'unknown',
    storage_quota: config.storageQuota || 'unknown',
    folder: config.folder || 'not_selected',
    privacy_default: config.privacyDefault || 'not_selected',
    allowed_embed_domains: config.allowedEmbedDomains || [],
    callback_url: config.callbackUrl || 'not_configured',
    token_state: tokenPresent ? 'present_but_user_capability_unverified' : 'missing_user_token',
    app_credentials_state: appCredentialsPresent ? 'client_credentials_present' : 'client_credentials_missing',
    last_verification: config.lastVerificationAt || null,
  };
  return {
    provider: 'vimeo',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    mode: 'automated_vimeo_upload',
    selected_provider: SELECTED_VIDEO_HOST_PROVIDER,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    feature_flag_enabled: Boolean(config.automatedUploadEnabled),
    status: config.automatedUploadEnabled ? 'operator_gated_readiness_check_required' : 'disabled_feature_flag',
    api_upload_enabled: false,
    oauth_or_token_install_flow_present: true,
    upload_job_model_present: true,
    idempotency_key_required: true,
    resumable_upload_planned: true,
    retry_state_supported: true,
    transcode_polling_supported: true,
    playback_verification_required: true,
    embed_verification_required: true,
    audit_trail_required: true,
    setup,
    upload_states: AUTOMATED_VIMEO_UPLOAD_STATES,
    disabled_reason: 'Automated Vimeo upload requires explicit authorization plus a user-level token, account owner, plan/quota, folder/privacy/embed defaults, and a focused upload smoke.',
  };
}

function normalizeRecordingLifecycleState(value = '') {
  const normalized = safeText(value, 'scheduled').toLowerCase().replace(/[\s-]+/g, '_');
  return RECORDING_PUBLICATION_LIFECYCLE.includes(normalized) ? normalized : 'scheduled';
}

function buildRecordingPublicationLifecycle(payload = {}) {
  const currentState = normalizeRecordingLifecycleState(payload.state || payload.status || payload.current_state || payload.currentState);
  const currentIndex = RECORDING_PUBLICATION_LIFECYCLE.indexOf(currentState);
  const checks = buildPublicationReadinessChecks(payload);
  return {
    provider: 'video_hosting',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    current_state: currentState,
    states: RECORDING_PUBLICATION_LIFECYCLE.map((state, index) => ({
      state,
      reached: index <= currentIndex,
      current: index === currentIndex,
      requires_manual_review: ['privacy_review', 'rabbi_review', 'approved', 'member_library_publication'].includes(state),
    })),
    supports: {
      multiple_recording_files: true,
      preferred_layout: true,
      audio_only_file: true,
      transcript_file: true,
      summary: true,
      retries: true,
      idempotency: true,
      manual_reprocessing: true,
      review_queue: true,
      correction: true,
      rejection: true,
      approval: true,
      publication: true,
      unpublishing: true,
      deletion_policy: true,
      retention_policy: true,
    },
    webhook_publication_guardrail: 'Never publish directly from a webhook.',
    source_delete_requirements: {
      vimeo_asset_exists: checks.correct_vimeo_asset_exists,
      vimeo_processing_completed: checks.processing_completed,
      playback_verified: checks.playback_verified,
      metadata_saved: checks.metadata_saved,
      transcript_saved: Boolean(safeText(payload.transcript || payload.transcript_text || payload.transcriptText)),
      summary_saved: Boolean(safeText(payload.summary || payload.summary_text || payload.summaryText)),
      retention_policy_permits_deletion: checks.retention_permits_deletion,
      source_delete_allowed: Object.values(checks).every(Boolean),
    },
  };
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
  if (!config.providerDecision) blockers.push('Vimeo is selected for One Time, but runtime config did not return a provider value.');
  if (config.providerDecision === 'vimeo' && !config.vimeoToken) blockers.push('Vimeo access token is not configured server-side.');
  if (config.providerDecision === 'vimeo' && !config.vimeoPlan) blockers.push('Confirm the current Vimeo plan/account supports API uploads and intended embed controls.');
  if (config.accountOwner === 'unknown') blockers.push('Video-host account owner/admin must be documented before upload or publish actions.');
  const manualFallbackReady = config.providerDecision === 'vimeo' || !config.providerDecision;
  const automatedUpload = buildVimeoAutomatedUploadReadiness({ ...options, config });
  return {
    provider: 'video_hosting',
    label: 'Vimeo / Video Hosting',
    selectedProviderDecision: SELECTED_VIDEO_HOST_PROVIDER,
    decisionStatus: 'vimeo_selected_for_one_time',
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
      automatedUploadEnabled: automatedUpload.feature_flag_enabled,
    },
    manualFallback: {
      ready: manualFallbackReady,
      mode: 'manual_vimeo_url_attach',
      library_item_status: 'usable_now_with_internal_approval',
      workflow_steps: MANUAL_VIMEO_WORKFLOW_STEPS,
      next_step: 'Manually upload/select the Vimeo video, paste the Vimeo URL, complete learning metadata, approve, then publish to the first-party member library.',
    },
    automatedUpload,
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
  const vimeoReference = payload.vimeo_url || payload.vimeoUrl || payload.media_url || payload.mediaUrl || classSession.media_url || classSession.vimeo_id || '';
  const idempotencySource = [
    'recording_pipeline',
    sourceId || 'unknown_source',
    selectedFile?.local_file_ref || 'no_file',
    parseVimeoId(vimeoReference),
  ].join(':');
  const publicationChecks = buildPublicationReadinessChecks({
    ...payload,
    transcript: transcriptText,
    summary: summaryText,
    title: classSession.title || contentJob.title || payload.title,
  });
  const manualWorkflow = buildManualVimeoWorkflow({
    ...payload,
    vimeo_url: vimeoReference,
    title: classSession.title || contentJob.title || payload.title,
    description: classSession.description || contentJob.description || payload.description || summaryText,
    transcript_state: classSession.transcript_status || payload.transcript_state || payload.transcriptStatus,
  }, { config });
  const automatedUpload = buildVimeoAutomatedUploadReadiness({ ...options, config });
  const lifecycle = buildRecordingPublicationLifecycle({
    ...payload,
    transcript: transcriptText,
    summary: summaryText,
    vimeo_url: vimeoReference,
    title: classSession.title || contentJob.title || payload.title,
  });
  const manualReady = manualWorkflow.status === 'manual_vimeo_ready';
  return {
    provider: 'video_hosting',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    status: manualReady ? 'manual_vimeo_ready' : 'manual_vimeo_setup_needed',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    readiness,
    manual_vimeo_workflow: manualWorkflow,
    automated_upload_readiness: automatedUpload,
    publication_lifecycle: lifecycle,
    sections: RECORDING_PIPELINE_SECTIONS,
    gates: {
      live_webhook_accept_enabled: false,
      provider_asset_fetch_enabled: false,
      manual_vimeo_attach_enabled: true,
      member_library_publish_route_enabled: true,
      member_library_unpublish_route_enabled: true,
      api_upload_enabled: false,
      provider_publish_enabled: false,
      delete_enabled: false,
      member_visibility_enabled: true,
      notification_send_enabled: false,
    },
    summary: {
      recording_files_seen: files.length,
      preferred_file_selected: Boolean(selectedFile),
      audio_only_files_seen: files.filter((file) => file.audio_only).length,
      transcript_present: Boolean(transcriptText),
      summary_present: Boolean(summaryText),
      vimeo_id_present: Boolean(parseVimeoId(vimeoReference)),
      manual_vimeo_ready: manualReady,
      automated_upload_enabled: automatedUpload.api_upload_enabled,
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
      approval_enabled: true,
      rejection_enabled: false,
      approval_blocker: 'Approval requires the explicit first-party member-library approval phrase; provider uploads and sends stay disabled.',
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
      member_visibility_enabled: true,
      watch_progress_write_enabled: false,
      blocker: 'First-party member visibility is allowed only after approved publication; watch-progress writes stay future-scoped.',
    },
    blockers: [
      ...readiness.blockers,
      'Never publish directly from a webhook; operator/Rabbi review and exact approval are required.',
      'Real Vimeo upload, provider publish/unpublish/delete, notifications, and external writes require explicit operator approval and live smoke.',
    ],
  };
}

function buildVimeoPublicationPreview(payload = {}, options = {}) {
  const config = options.config || getVideoHostingConfig(options);
  const readiness = getVideoHostingReadiness({ ...options, config });
  const vimeoId = parseVimeoId(payload.vimeo_url || payload.vimeoUrl || payload.media_url || payload.mediaUrl || payload.vimeo_id || payload.vimeoId);
  const checks = buildPublicationReadinessChecks(payload);
  const readyForMemberLibrary = Boolean(
    vimeoId
    && checks.processing_completed
    && checks.playback_verified
    && checks.metadata_saved
    && checks.transcript_summary_saved
  );
  return {
    provider: 'video_hosting',
    requirement_id: RECORDING_PIPELINE_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    readiness,
    publication: {
      status: readyForMemberLibrary ? 'ready_for_approval_gated_member_library_publish' : 'needs_publication_readiness',
      mode: vimeoId ? 'manual_vimeo_id_review' : (config.vimeoToken ? 'api_upload_preview' : 'manual_upload_required'),
      vimeo_id_present: Boolean(vimeoId),
      checks,
      first_party_publish_route_enabled: true,
      member_library_publish_enabled: readyForMemberLibrary,
      publish_requires_approval_phrase: true,
      unpublish_enabled: true,
      provider_publish_enabled: false,
      delete_enabled: false,
      member_visibility_enabled: readyForMemberLibrary,
      required_confirmation: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
      blocker: readyForMemberLibrary
        ? 'Use the class package manager with the explicit approval phrase for first-party member-library publish. Provider-side Vimeo publish/delete remains disabled.'
        : 'Save Vimeo asset, playback verification, metadata, transcript, and summary before first-party member-library publishing.',
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
  AUTOMATED_VIMEO_UPLOAD_STATES,
  MANUAL_VIMEO_WORKFLOW_STEPS,
  RECORDING_PUBLICATION_LIFECYCLE,
  RECORDING_PIPELINE_REQUIREMENT_ID,
  RECORDING_PIPELINE_SECTIONS,
  SELECTED_VIDEO_HOST_PROVIDER,
  VIDEO_HOST_DECISION_OPTIONS,
  assertVideoUploadApproved,
  buildManualVimeoWorkflow,
  buildRecordingPublicationLifecycle,
  buildRecordingPipelinePreview,
  buildRecordingRetentionPreview,
  buildVimeoAutomatedUploadReadiness,
  buildVimeoPublicationPreview,
  buildVideoLibraryDraft,
  getVideoHostingConfig,
  getVideoHostingReadiness,
  parseVimeoUrl,
  safeVideoHostingError,
};
