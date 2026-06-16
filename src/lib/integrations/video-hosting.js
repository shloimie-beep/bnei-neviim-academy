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

function getVideoHostingConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const vimeoToken = options.vimeoToken !== undefined ? String(options.vimeoToken || '').trim() : loadSecret({
    envName: 'VIMEO_ACCESS_TOKEN',
    names: ['vimeo-access-token', 'vimeo'],
    fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt'],
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
  VIDEO_HOST_DECISION_OPTIONS,
  assertVideoUploadApproved,
  buildVideoLibraryDraft,
  getVideoHostingConfig,
  getVideoHostingReadiness,
  safeVideoHostingError,
};
