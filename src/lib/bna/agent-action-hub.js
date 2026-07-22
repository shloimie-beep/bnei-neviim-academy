const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');
const {
  CANONICAL_WORKSPACES,
  WORKSPACE_TAXONOMY_VERSION,
  compatibilityMigrationPlan,
  resolveWorkspaceKey,
  workspaceTaxonomyPayload,
  ticketRoutingPayload,
} = require('./workspace-taxonomy');
const {
  buildOneTimeRabbiTorahConsoleReadiness,
} = require('./one-time-rabbi-torah-console');

const AGENT_ACTION_JOB_TYPE = 'agent_action';
const AGENT_ACTION_RUN_ID = 'AGENT-ACTION-20260721-PLATFORM-SEPARATION';
const AGENT_ACTION_PUBLIC_BASE_URL = 'https://bneineviimacademy.org';

const AGENT_ACTION_CATEGORIES = Object.freeze([
  'ui_setup',
  'workflow_build',
  'knowledge_base_setup',
  'provider_console_setup',
  'configuration_review',
  'audit',
  'verification',
]);

const AGENT_ACTION_STATUSES = Object.freeze([
  'draft',
  'ready',
  'claimed',
  'in_progress',
  'saved',
  'blocked',
  'failed',
  'verified',
  'superseded',
]);

const AGENT_ACTION_TERMINAL_STATUSES = Object.freeze(['blocked', 'failed', 'verified', 'superseded']);

const HIGHLEVEL_EXPORT_SOURCE = Object.freeze({
  repository: 'shloimie-beep/onetimev2',
  ref: 'codex/highlevel-final-results-20260722',
  sha: '1fb2d39285b5cf644f2a5bc04d27e1b7385db173',
  artifact_path: 'integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json',
  artifact_blob_sha: '01973e224cd7e2b7b18a4a9a7321ac71d33e633a',
  artifact_url: 'https://raw.githubusercontent.com/shloimie-beep/onetimev2/1fb2d39285b5cf644f2a5bc04d27e1b7385db173/integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json',
  registry_path: 'integrations/highlevel/registry/current.json',
  registry_blob_sha: '71c114d779952e0d4000df706286bf58f50a26a4',
  readback_path: 'integrations/highlevel/agent-mode/results/ONE-TIME-CURRENT-STATE-20260722.json',
  readback_blob_sha: '030f5d72bf6f752f3bd777fa94c2a849d5a9ebef',
  authoritative_result_path: 'integrations/highlevel/agent-mode/results/GHL-FINAL-ORGANIZATION-20260722.result.json',
  authoritative_result_blob_sha: '91719bc831bbe8a9b6032d6f27a946abe77b69f4',
  authoritative_result_sha256: 'b5e116a99854c634b19bdee4653becb424d635368890ba5a92bca859841537cf',
  registry_version: 'highlevel-agent-mode-export-schema-1.1.0',
});

const HIGHLEVEL_QUEUE_RECONCILIATION = Object.freeze({
  'GHL-UI-01': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-02': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-03': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-04': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-05': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-06': { status: 'blocked', canonical_status: 'blocked', blocker: 'The authoritative result does not prove a sending-domain readback.' },
  'GHL-UI-07': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-08': { status: 'superseded', canonical_status: 'superseded', blocker: 'The generic seed job is superseded by workflow-specific activation and controlled-test gates.' },
  'GHL-UI-09': { status: 'superseded', canonical_status: 'superseded', blocker: 'The generic seed job is superseded by workflow-specific activation and controlled-test gates.' },
  'GHL-UI-10': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-11': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-12': { status: 'verified', canonical_status: 'completed', blocker: '' },
  'GHL-UI-13': { status: 'blocked', canonical_status: 'blocked', blocker: 'Phase-2 sender acceptance and a separately authorized reply test remain pending.' },
});

const HIGHLEVEL_WORKFLOW_FOLLOWUPS = Object.freeze([
  ['OT-01', 'adult public signup trigger/filter and operator-owned controlled test not verified'],
  ['OT-02A', 'approved migration cadence and audience acceptance missing'],
  ['OT-02B', 'approved nurture audience, cadence, and content acceptance missing'],
  ['OT-03', 'checkout-started event and approved abandonment window mapping not configured'],
  ['OT-04', 'payment-active projection trigger and provider acceptance not configured'],
  ['OT-05', 'payment-failed grace projection trigger and approved grace timing not configured'],
  ['OT-06', 'subscription-canceled projection trigger and provider acceptance not configured'],
  ['OT-13', 'refund or chargeback projection trigger and provider acceptance not configured'],
  ['OT-07', 'secure companion trigger and operator-owned controlled test not configured'],
  ['OT-08', 'portal-activated trigger and operator-owned controlled test not configured'],
  ['OT-09', 'confirmed-class trigger, approved timing, and operator-owned controlled test not configured'],
  ['OT-10', 'recording-published trigger and protected recording URL mapping not configured'],
  ['OT-C01', 'approved production audience and explicit campaign authorization missing'],
  ['OT-B01', 'bot-action trigger and input contract plus operator-owned controlled test not configured'],
  ['OT-B02', 'next-confirmed-class lookup and operator-owned controlled test not configured'],
  ['OT-B03', 'member-login companion lookup and operator-owned controlled test not configured'],
  ['OT-B04', 'secure password-reset handoff and operator-owned controlled test not configured'],
  ['OT-B05', 'opt-out trigger and channel-suppression mapping plus controlled test not configured'],
]);

const AGENT_ACTION_GITHUB_FALLBACK = Object.freeze({
  repository: 'shloimie-beep/onetimev2',
  base_ref: HIGHLEVEL_EXPORT_SOURCE.ref,
  base_sha: HIGHLEVEL_EXPORT_SOURCE.sha,
  branch_prefix: 'codex/agent-mode-result',
  result_root: 'integrations/highlevel/agent-mode/results',
  persistence_mode: 'sanitized_result_only_pull_request',
  hub_preferred: true,
  hub_required_for_ghl_completion: false,
});

function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function compactText(value, max = 2000) {
  return String(value || '')
    .replace(/(api[_-]?key|token|secret|password|authorization|cookie)\s*[:=]\s*[^\s,}]+/gi, '$1=[redacted]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email-redacted]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone-redacted]')
    .slice(0, max);
}

function normalizeAgentActionStatus(value, fallback = 'draft') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return AGENT_ACTION_STATUSES.includes(normalized) ? normalized : fallback;
}

function normalizeAgentActionCategory(value, fallback = 'audit') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return AGENT_ACTION_CATEGORIES.includes(normalized) ? normalized : fallback;
}

function agentActionResultIsTerminal(row = null) {
  return AGENT_ACTION_TERMINAL_STATUSES.includes(normalizeAgentActionStatus(row?.status, 'draft'));
}

function normalizeStringList(value, maxItems = 50, maxLength = 600) {
  if (Array.isArray(value)) {
    return value.slice(0, maxItems).map((item) => compactText(typeof item === 'string' ? item : JSON.stringify(item), maxLength));
  }
  if (!value) return [];
  return [compactText(typeof value === 'string' ? value : JSON.stringify(value), maxLength)];
}

function redactExportIdentifiers(value = '', item = {}, max = 2000) {
  let text = String(value || '');
  const protectedValues = [
    item.ghl_location?.location_id,
    item.ghlLocation?.locationId,
    item.test_contact_rules?.contact_id,
    item.testContactRules?.contactId,
  ].filter(Boolean);
  protectedValues.forEach((protectedValue) => {
    text = text.split(String(protectedValue)).join('[protected-provider-id]');
  });
  return compactText(text, max);
}

function redactExportStringList(value, item = {}, maxItems = 50, maxLength = 600) {
  return normalizeStringList(value, maxItems, maxLength)
    .map((entry) => redactExportIdentifiers(entry, item, maxLength));
}

function sanitizeFallbackText(value = '', max = 2000) {
  return compactText(value, max)
    .replace(/(api[_-]?key|token|secret|password|authorization|cookie)\s*=\[redacted\]/gi, '[redacted-sensitive-field]');
}

function sanitizeFallbackList(value, maxItems = 50, maxLength = 600) {
  return normalizeStringList(value, maxItems, maxLength).map((item) => sanitizeFallbackText(item, maxLength));
}

function safeAgentActionFallbackSlug(value = '', fallback = 'result') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56);
  return normalized || fallback;
}

function safeAgentActionResultPath(job = {}) {
  const configured = String(job?.metadata?.result_path || '').replace(/\\/g, '/').trim();
  const root = `${AGENT_ACTION_GITHUB_FALLBACK.result_root}/`;
  if (configured.startsWith(root) && configured.endsWith('.result.json') && !configured.includes('..')) return configured;
  return `${root}${safeAgentActionFallbackSlug(job.job_id, 'agent-action')}.result.json`;
}

function sanitizeAgentActionResultForFallback(result = {}, job = {}) {
  const metadata = result.metadata && typeof result.metadata === 'object' ? result.metadata : {};
  const sanitized = {
    schema_id: 'bna-agent-action-result-fallback',
    schema_version: '1.0.0',
    job_id: sanitizeFallbackText(result.job_id || job.job_id, 160),
    result_ref: sanitizeFallbackText(result.result_ref || result.resultRef || '', 160),
    status: normalizeAgentActionStatus(result.status, 'saved'),
    completion_intent: ['partial', 'completed'].includes(metadata.completion_intent) ? metadata.completion_intent : null,
    summary: sanitizeFallbackText(result.summary || '', 6000),
    evidence: sanitizeFallbackList(result.evidence),
    completion_checklist: sanitizeFallbackList(result.completion_checklist || result.completionChecklist),
    expected_asset_ids: sanitizeFallbackList(result.expected_asset_ids || result.expectedAssetIds),
    idempotency_key: sanitizeFallbackText(result.idempotency_key || result.idempotencyKey || '', 200),
    source: {
      repository: sanitizeFallbackText(job.source_repository || HIGHLEVEL_EXPORT_SOURCE.repository, 160),
      ref: sanitizeFallbackText(job.source_ref || HIGHLEVEL_EXPORT_SOURCE.ref, 160),
      sha: sanitizeFallbackText(job.source_sha || HIGHLEVEL_EXPORT_SOURCE.sha, 80),
      artifact_path: sanitizeFallbackText(job.source_artifact_path || HIGHLEVEL_EXPORT_SOURCE.artifact_path, 500),
    },
    persistence: {
      primary: 'bna_agent_action_hub',
      fallback: 'github_result_only_pull_request',
      ghl_completion_blocked_by_hub: false,
    },
    customer_messages_sent: 0,
    secrets_included: false,
  };
  return sanitized;
}

function buildAgentActionGitHubFallbackPlan(result = {}, job = {}) {
  const sanitized = sanitizeAgentActionResultForFallback(result, job);
  const fingerprint = sha256Hex(JSON.stringify(sanitized)).slice(0, 12);
  const jobSlug = safeAgentActionFallbackSlug(sanitized.job_id, 'agent-action');
  const resultSlug = safeAgentActionFallbackSlug(sanitized.result_ref, fingerprint).slice(0, 24);
  const branch = `${AGENT_ACTION_GITHUB_FALLBACK.branch_prefix}-${jobSlug}-${resultSlug}`.slice(0, 180);
  const path = safeAgentActionResultPath(job);
  return {
    repository: AGENT_ACTION_GITHUB_FALLBACK.repository,
    base_ref: AGENT_ACTION_GITHUB_FALLBACK.base_ref,
    base_sha: AGENT_ACTION_GITHUB_FALLBACK.base_sha,
    branch,
    path,
    commit_message: `Record sanitized Agent Mode result ${sanitized.job_id}`,
    pull_request_title: `[Agent Mode result] ${sanitized.job_id}`,
    pull_request_body: [
      'Sanitized Agent Mode result-only fallback.',
      '',
      '- BNA Agent Action Hub remains the preferred persistence path.',
      '- This fallback contains no credentials, customer transcript, or contact export.',
      '- GHL completion does not depend on Hub availability.',
      `- Source SHA: ${sanitized.source.sha}`,
    ].join('\n'),
    result: sanitized,
    result_json: `${JSON.stringify(sanitized, null, 2)}\n`,
    persistence_mode: AGENT_ACTION_GITHUB_FALLBACK.persistence_mode,
    hub_preferred: true,
    hub_required_for_ghl_completion: false,
    sanitized_result_only: true,
    secrets_included: false,
    customer_transcript_included: false,
    external_write_performed: false,
  };
}

function agentActionResultPersistenceOptions({ result = {}, job = {}, hubAvailable = true } = {}) {
  return {
    preferred: hubAvailable ? 'bna_agent_action_hub' : 'github_result_only_pull_request',
    hub: {
      available: Boolean(hubAvailable),
      preferred: true,
      required_for_ghl_completion: false,
    },
    github_fallback: buildAgentActionGitHubFallbackPlan(result, job),
    ghl_completion_allowed: true,
    ghl_completion_blocked_by_hub: false,
  };
}

function hasSecretLikeContent(value = '') {
  return /(api[_-]?key|token|secret|password|authorization|cookie)\s*[:=]\s*[^\s,}]+/i.test(String(value || ''));
}

function normalizeExportJobs(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.jobs)) return parsed.jobs;
  if (Array.isArray(parsed?.agent_mode_jobs)) return parsed.agent_mode_jobs;
  if (Array.isArray(parsed?.agentModeJobs)) return parsed.agentModeJobs;
  if (Array.isArray(parsed?.queue)) return parsed.queue;
  return [];
}

function jobIdFromItem(item = {}, index = 0) {
  const explicit = item.job_id || item.jobId || item.id || item.key || item.slug || item.name || item.title || '';
  const base = explicit || `${item.prompt || item.prompt_text || item.canonical_prompt || ''}:${index}`;
  return `AA-GHL-${sha256Hex(base).slice(0, 12)}`;
}

function agentActionJobFingerprint(job = {}) {
  return `sha256:${sha256Hex([
    job.job_id,
    job.source_repository,
    job.source_ref,
    job.source_sha,
    job.source_artifact_path,
    job.target_application,
    job.target_workspace,
    job.target_ui_url,
    job.prompt,
    JSON.stringify(job.allowed_actions || []),
    JSON.stringify(job.forbidden_actions || []),
    JSON.stringify(job.completion_checklist || []),
  ].join('\n'))}`;
}

function buildAgentActionJobFromGhlExportItem(item = {}, index = 0, source = HIGHLEVEL_EXPORT_SOURCE) {
  const prompt = redactExportIdentifiers(item.exact_copy_paste_prompt || item.exactCopyPastePrompt || item.canonical_prompt_text || item.canonicalPromptText || item.prompt_text || item.promptText || item.prompt || '', item, 20000).trim();
  const targetWorkspace = resolveWorkspaceKey(item.target_workspace || item.targetWorkspace || item.workspace_key || item.workspace || 'one_time');
  const dropoff = item.bna_agent_action_dropoff || item.bnaAgentActionDropoff || {};
  const dropoffMetadata = dropoff.metadata && typeof dropoff.metadata === 'object' ? dropoff.metadata : {};
  const expectedAssetIds = item.expected_ghl_ids_to_capture || item.expectedGhlIdsToCapture || item.expected_asset_ids || item.expectedAssetIds || item.expected_assets || item.expectedAssets || [];
  const allowedActions = item.allowed_actions || item.allowedActions || item.prerequisites || [
    'Perform only the UI work described by the exact copy/paste prompt.',
    'Save every edited HighLevel workflow, bot, knowledge base, folder, or custom value screen.',
    'Verify the saved state by reopening or reading the saved state.',
  ];
  const forbiddenActions = item.forbidden_actions || item.forbiddenActions || item.forbidden_assets || item.forbiddenAssets || [
    'Do not import secrets.',
    'Do not execute GHL automation automatically.',
    'Do not send external messages.',
    'Do not change BNA School data.',
  ];
  const job = {
    job_type: AGENT_ACTION_JOB_TYPE,
    job_id: item.job_id || item.jobId || jobIdFromItem(item, index),
    title: compactText(item.title || item.name || `HighLevel UI setup ${index + 1}`, 160),
    category: normalizeAgentActionCategory(item.category || item.action_category || item.actionCategory || 'ui_setup'),
    source_repository: source.repository,
    source_ref: source.ref,
    source_sha: source.sha,
    source_artifact_path: source.artifact_path,
    source_artifact_url: item.source_artifact_url || item.sourceArtifactUrl || '',
    source_fingerprint: '',
    target_application: item.target_application || item.targetApplication || 'HighLevel',
    target_workspace: targetWorkspace,
    target_ui_url: item.target_ui_url || item.targetUiUrl || item.url || item.target_url || 'https://app.gohighlevel.com/',
    prompt,
    allowed_actions: redactExportStringList(allowedActions, item),
    forbidden_actions: redactExportStringList(forbiddenActions, item),
    required_save_behavior: compactText(item.required_save_behavior || item.requiredSaveBehavior || dropoff.readback_verification || 'Save partial or completed result to the BNA Agent Action drop-off, then read back the saved result URL.', 800),
    expected_asset_ids: normalizeStringList(expectedAssetIds),
    completion_checklist: redactExportStringList(item.completion_checklist || item.completionChecklist || item.checklist || [], item),
    evidence_requirements: redactExportStringList(item.evidence_requirements || item.evidenceRequirements || [
      'Saved Agent Action result.',
      'Readback URL verified after save.',
      'No external GHL execution performed by BNA importer.',
    ], item),
    idempotency_key: compactText(item.idempotency_key || item.idempotencyKey || `agent-action:ghl:${source.sha}:${jobIdFromItem(item, index)}`, 180),
    status: normalizeAgentActionStatus(item.status, HIGHLEVEL_QUEUE_RECONCILIATION[item.job_id || item.jobId]?.status || 'ready'),
    result_readback_url: '',
    metadata: {
      source: 'highlevel_agent_mode_export',
      order: Number(item.order || item.sequence || index + 1),
      one_time_registry_version: source.registry_version || '',
      exact_target_ui_path: item.exact_target_ui_path || item.exactTargetUiPath || '',
      canonical_source_files: redactExportStringList(item.canonical_source_files || item.canonicalSourceFiles || [], item),
      result_path: item.result_path || item.resultPath || dropoff.result_path || dropoffMetadata.result_file || '',
      job_file: dropoffMetadata.job_file || '',
      ghl_location_fingerprint: item.ghl_location?.location_fingerprint || item.ghlLocation?.locationFingerprint || '',
      canonical_status: HIGHLEVEL_QUEUE_RECONCILIATION[item.job_id || item.jobId]?.canonical_status || 'active',
      canonical_blocker: HIGHLEVEL_QUEUE_RECONCILIATION[item.job_id || item.jobId]?.blocker || '',
      no_send: item.defaults?.no_send !== false,
      no_publish: item.defaults?.no_publish !== false,
      no_production_workflow_enrollment: item.defaults?.no_production_workflow_enrollment !== false,
      no_live_payment_mutation: item.defaults?.no_live_payment_mutation !== false,
      external_write_performed: false,
      secrets_included: false,
    },
  };
  job.source_fingerprint = agentActionJobFingerprint(job);
  job.result_readback_url = `/api/platform/agent-actions/${encodeURIComponent(job.job_id)}/results`;
  return job;
}

function buildHighLevelWorkflowFollowupJobs(source = HIGHLEVEL_EXPORT_SOURCE) {
  return HIGHLEVEL_WORKFLOW_FOLLOWUPS.map(([workflowKey, blocker], index) => {
    const jobId = `GHL-FOLLOWUP-${workflowKey}`;
    return {
      job_type: AGENT_ACTION_JOB_TYPE,
      job_id: jobId,
      title: `${workflowKey} activation and controlled-test follow-up`,
      category: 'workflow_build',
      source_repository: source.repository,
      source_ref: source.ref,
      source_sha: source.sha,
      source_artifact_path: source.authoritative_result_path,
      source_artifact_url: '',
      source_fingerprint: `sha256:${source.authoritative_result_sha256}`,
      target_application: 'HighLevel',
      target_workspace: 'one_time',
      target_ui_url: 'https://app.gohighlevel.com/',
      prompt: `Reopen ${workflowKey}. Resolve only its recorded activation/test dependency: ${blocker}. Keep the workflow draft/off unless the exact dependency, operator-owned synthetic test, and explicit activation approval are present. Save and read back the sanitized result; do not send to a customer or broad audience.`,
      allowed_actions: [
        `Inspect and repair only ${workflowKey}.`,
        'Use an operator-owned synthetic record for any separately authorized controlled test.',
        'Save a sanitized result and verify readback.',
      ],
      forbidden_actions: [
        'Do not send to a customer or broad audience.',
        'Do not create a Student contact or credential.',
        'Do not include provider IDs, contact data, message bodies, or secrets in the result.',
      ],
      required_save_behavior: 'Save sanitized result-only JSON, then read it back. BNA Hub remains optional for GHL completion.',
      expected_asset_ids: [workflowKey],
      completion_checklist: [
        `Recorded blocker for ${workflowKey} is resolved or truthfully remains blocked.`,
        'Workflow saved and reopened.',
        'Any test was operator-owned and synthetic.',
        'No customer or broad-audience message was sent.',
      ],
      evidence_requirements: [
        'Sanitized status/readback only.',
        `Authoritative result SHA-256 ${source.authoritative_result_sha256}.`,
        'Zero customer sends.',
      ],
      idempotency_key: `one-time-ghl-followup:${source.sha}:${workflowKey}`,
      status: 'blocked',
      result_readback_url: `/api/platform/agent-actions/${encodeURIComponent(jobId)}/results`,
      metadata: {
        source: 'highlevel_final_organization_result',
        order: 100 + index,
        workflow_key: workflowKey,
        canonical_status: 'blocked',
        canonical_blocker: blocker,
        authoritative_result_blob_sha: source.authoritative_result_blob_sha,
        authoritative_result_sha256: source.authoritative_result_sha256,
        prior_creation_saved_and_reopened: true,
        external_write_performed: false,
        secrets_included: false,
      },
    };
  });
}

function validateAgentActionJob(job = {}) {
  const errors = [];
  const requiredFields = [
    'job_id',
    'source_repository',
    'source_ref',
    'source_sha',
    'source_artifact_path',
    'target_application',
    'target_workspace',
    'target_ui_url',
    'prompt',
    'idempotency_key',
    'status',
    'result_readback_url',
  ];
  requiredFields.forEach((field) => {
    if (!String(job[field] || '').trim()) errors.push(`${field} is required`);
  });
  if (!AGENT_ACTION_CATEGORIES.includes(job.category)) errors.push('category is not supported');
  if (!AGENT_ACTION_STATUSES.includes(job.status)) errors.push('status is not supported');
  if (resolveWorkspaceKey(job.target_workspace, '') !== job.target_workspace) errors.push('target_workspace must be canonical');
  ['prompt', 'target_ui_url', 'source_artifact_url'].forEach((field) => {
    if (hasSecretLikeContent(job[field])) errors.push(`${field} appears to include secret-like content`);
  });
  return { valid: errors.length === 0, errors };
}

function parseHighLevelAgentModeExport(jsonText = '', source = HIGHLEVEL_EXPORT_SOURCE) {
  const sourceFingerprint = `sha256:${sha256Hex(jsonText)}`;
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return {
      success: false,
      source,
      source_fingerprint: sourceFingerprint,
      jobs: [],
      rejected: [{ index: -1, errors: [`Invalid JSON: ${error.message}`] }],
      external_write_performed: false,
      secrets_included: false,
    };
  }
  if (hasSecretLikeContent(jsonText)) {
    return {
      success: false,
      source,
      source_fingerprint: sourceFingerprint,
      jobs: [],
      rejected: [{ index: -1, errors: ['Export appears to include secret-like content.'] }],
      external_write_performed: false,
      secrets_included: false,
    };
  }
  const rawJobs = normalizeExportJobs(parsed);
  const seen = new Set();
  const rejected = [];
  const jobs = [];
  rawJobs.forEach((item, index) => {
    const job = buildAgentActionJobFromGhlExportItem(item, index, source);
    job.source_fingerprint = sourceFingerprint;
    const validation = validateAgentActionJob(job);
    if (!validation.valid) {
      rejected.push({ index, job_id: job.job_id, errors: validation.errors });
      return;
    }
    const dedupeKey = job.idempotency_key || job.source_fingerprint || job.job_id;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    jobs.push(job);
  });
  const includesAuthoritativeCurrentQueue = rawJobs.some((item) => (item.job_id || item.jobId) === 'GHL-UI-13')
    && String(parsed.schema_version || parsed.schemaVersion || '') === '1.1.0';
  (includesAuthoritativeCurrentQueue ? buildHighLevelWorkflowFollowupJobs(source) : []).forEach((job, index) => {
    const validation = validateAgentActionJob(job);
    if (!validation.valid) {
      rejected.push({ index: rawJobs.length + index, job_id: job.job_id, errors: validation.errors });
      return;
    }
    if (seen.has(job.idempotency_key)) return;
    seen.add(job.idempotency_key);
    jobs.push(job);
  });
  return {
    success: rejected.length === 0,
    source,
    source_fingerprint: sourceFingerprint,
    registry_version: parsed.registry_version || parsed.registryVersion || parsed.schema_version || parsed.schemaVersion || source.registry_version || '',
    schema_id: parsed.schema_id || parsed.schemaId || '',
    schema_version: parsed.schema_version || parsed.schemaVersion || '',
    ingestion: parsed.ingestion || {},
    source_metadata: parsed.source || {},
    safety: parsed.safety || {},
    jobs,
    rejected,
    external_write_performed: false,
    secrets_included: false,
  };
}

function findLocalHighLevelExport(repoRoot = process.cwd(), source = HIGHLEVEL_EXPORT_SOURCE) {
  const candidates = [
    process.env.ONE_TIME_GHL_AGENT_MODE_EXPORT_PATH,
    path.join(repoRoot, '..', 'onetimev2', source.artifact_path),
    path.join(process.env.TEMP || process.env.TMP || '', 'onetimev2-agent-mode-current', source.artifact_path),
    path.join(repoRoot, '..', 'OneTime', source.artifact_path),
    path.join(repoRoot, 'integrations', 'highlevel', 'agent-mode', 'GHL-AGENT-MODE-EXPORT.json'),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || '';
}

function fetchText(url, { timeoutMs = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'bna-agent-action-importer',
        Accept: 'application/json,text/plain',
      },
      timeout: timeoutMs,
    }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} while reading pinned HighLevel export.`));
        return;
      }
      let text = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        text += chunk;
      });
      response.on('end', () => resolve(text));
    });
    request.on('timeout', () => {
      request.destroy(new Error('Timed out while reading pinned HighLevel export.'));
    });
    request.on('error', reject);
  });
}

async function importHighLevelAgentModeExport({ repoRoot = process.cwd(), source = HIGHLEVEL_EXPORT_SOURCE, filePath = '', allowNetwork = true } = {}) {
  const resolvedPath = filePath || findLocalHighLevelExport(repoRoot, source);
  if (resolvedPath) {
    const text = fs.readFileSync(resolvedPath, 'utf8');
    return {
      ...parseHighLevelAgentModeExport(text, source),
      resolved_path: resolvedPath,
    };
  }
  if (allowNetwork && source.artifact_url) {
    try {
      const text = await fetchText(source.artifact_url);
      return {
        ...parseHighLevelAgentModeExport(text, source),
        resolved_url: source.artifact_url,
      };
    } catch (error) {
      return {
        ...highLevelImportBlocker(source),
        blocker: {
          ...highLevelImportBlocker(source).blocker,
          message: `${source.repository} ${source.ref} at ${source.sha} could not be read from the pinned raw export URL: ${compactText(error.message, 400)}`,
        },
      };
    }
  }
  return highLevelImportBlocker(source);
}

function highLevelImportBlocker(source = HIGHLEVEL_EXPORT_SOURCE) {
  return {
    success: false,
    source,
    source_fingerprint: '',
    registry_version: source.registry_version,
    jobs: [],
    rejected: [],
    blocker: {
      id: 'BLOCK-20260721-001',
      requirement_id: 'REQ-20260721-006',
      message: `${source.repository} ${source.ref} at ${source.sha} did not provide a readable ${source.artifact_path} artifact to this importer run.`,
      next_action: 'Provide a reachable pinned One Time export artifact or set ONE_TIME_GHL_AGENT_MODE_EXPORT_PATH to the exported GHL-AGENT-MODE-EXPORT.json file.',
    },
    external_write_performed: false,
    secrets_included: false,
  };
}

function agentActionHubPayload({ baseUrl = AGENT_ACTION_PUBLIC_BASE_URL, importPreview = highLevelImportBlocker() } = {}) {
  return {
    agent_action_run_id: AGENT_ACTION_RUN_ID,
    job_type: AGENT_ACTION_JOB_TYPE,
    base_url: baseUrl,
    hub_path: '/operations/agent-actions',
    categories: AGENT_ACTION_CATEGORIES,
    statuses: AGENT_ACTION_STATUSES,
    terminal_statuses: AGENT_ACTION_TERMINAL_STATUSES,
    taxonomy: workspaceTaxonomyPayload(),
    migration_plan: compatibilityMigrationPlan(),
    ticket_routing: ticketRoutingPayload(),
    one_time_connector: CANONICAL_WORKSPACES.one_time,
    highlevel_import: importPreview,
    result_persistence: {
      preferred: 'bna_agent_action_hub',
      github_fallback: AGENT_ACTION_GITHUB_FALLBACK,
      ghl_completion_blocked_by_hub: false,
    },
    rabbi_telegram_foundation: buildOneTimeRabbiTorahConsoleReadiness(),
    external_write_performed: false,
  };
}

module.exports = {
  AGENT_ACTION_JOB_TYPE,
  AGENT_ACTION_RUN_ID,
  AGENT_ACTION_PUBLIC_BASE_URL,
  AGENT_ACTION_CATEGORIES,
  AGENT_ACTION_STATUSES,
  AGENT_ACTION_TERMINAL_STATUSES,
  HIGHLEVEL_EXPORT_SOURCE,
  HIGHLEVEL_QUEUE_RECONCILIATION,
  HIGHLEVEL_WORKFLOW_FOLLOWUPS,
  AGENT_ACTION_GITHUB_FALLBACK,
  sha256Hex,
  compactText,
  normalizeAgentActionStatus,
  normalizeAgentActionCategory,
  agentActionResultIsTerminal,
  normalizeStringList,
  sanitizeFallbackText,
  safeAgentActionResultPath,
  sanitizeAgentActionResultForFallback,
  buildAgentActionGitHubFallbackPlan,
  agentActionResultPersistenceOptions,
  hasSecretLikeContent,
  agentActionJobFingerprint,
  buildAgentActionJobFromGhlExportItem,
  buildHighLevelWorkflowFollowupJobs,
  validateAgentActionJob,
  parseHighLevelAgentModeExport,
  importHighLevelAgentModeExport,
  highLevelImportBlocker,
  agentActionHubPayload,
};
