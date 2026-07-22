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
  ref: 'codex/highlevel-api-finalize-agent-queue',
  sha: '1000e8f46210a85f720f83fce2678b24a44fa94d',
  artifact_path: 'integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json',
  artifact_blob_sha: '8982b719dff696fff291fa868130b5900127f324',
  artifact_url: 'https://raw.githubusercontent.com/shloimie-beep/onetimev2/1000e8f46210a85f720f83fce2678b24a44fa94d/integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json',
  registry_version: 'highlevel-agent-mode-export-schema-1.0.0',
});

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
  const prompt = String(item.exact_copy_paste_prompt || item.exactCopyPastePrompt || item.canonical_prompt_text || item.canonicalPromptText || item.prompt_text || item.promptText || item.prompt || '').trim();
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
    allowed_actions: normalizeStringList(allowedActions),
    forbidden_actions: normalizeStringList(forbiddenActions),
    required_save_behavior: compactText(item.required_save_behavior || item.requiredSaveBehavior || dropoff.readback_verification || 'Save partial or completed result to the BNA Agent Action drop-off, then read back the saved result URL.', 800),
    expected_asset_ids: normalizeStringList(expectedAssetIds),
    completion_checklist: normalizeStringList(item.completion_checklist || item.completionChecklist || item.checklist || []),
    evidence_requirements: normalizeStringList(item.evidence_requirements || item.evidenceRequirements || [
      'Saved Agent Action result.',
      'Readback URL verified after save.',
      'No external GHL execution performed by BNA importer.',
    ]),
    idempotency_key: compactText(item.idempotency_key || item.idempotencyKey || `agent-action:ghl:${source.sha}:${jobIdFromItem(item, index)}`, 180),
    status: normalizeAgentActionStatus(item.status, 'ready'),
    result_readback_url: '',
    metadata: {
      source: 'highlevel_agent_mode_export',
      order: Number(item.order || item.sequence || index + 1),
      one_time_registry_version: source.registry_version || '',
      exact_target_ui_path: item.exact_target_ui_path || item.exactTargetUiPath || '',
      canonical_source_files: normalizeStringList(item.canonical_source_files || item.canonicalSourceFiles || []),
      result_path: item.result_path || item.resultPath || dropoff.result_path || dropoffMetadata.result_file || '',
      job_file: dropoffMetadata.job_file || '',
      ghl_location_id: item.ghl_location?.location_id || item.ghlLocation?.locationId || '',
      ghl_location_fingerprint: item.ghl_location?.location_fingerprint || item.ghlLocation?.locationFingerprint || '',
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
  validateAgentActionJob,
  parseHighLevelAgentModeExport,
  importHighLevelAgentModeExport,
  highLevelImportBlocker,
  agentActionHubPayload,
};
