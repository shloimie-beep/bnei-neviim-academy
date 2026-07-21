const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  CANONICAL_WORKSPACES,
  WORKSPACE_TAXONOMY_VERSION,
  compatibilityMigrationPlan,
  resolveWorkspaceKey,
  workspaceTaxonomyPayload,
  ticketRoutingPayload,
} = require('./workspace-taxonomy');

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
  ref: 'pull/93/head',
  sha: '977e4453c34684cd06359f663d0e8f50dc3645f5',
  artifact_path: 'integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json',
  registry_version: 'missing-export-at-pr93-2026-07-21',
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
  const prompt = String(item.canonical_prompt_text || item.canonicalPromptText || item.prompt_text || item.promptText || item.prompt || '').trim();
  const targetWorkspace = resolveWorkspaceKey(item.target_workspace || item.targetWorkspace || item.workspace_key || item.workspace || 'one_time');
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
    target_ui_url: item.target_ui_url || item.targetUiUrl || item.url || item.target_url || '',
    prompt,
    allowed_actions: normalizeStringList(item.allowed_actions || item.allowedActions || ['configure UI only inside the target application']),
    forbidden_actions: normalizeStringList(item.forbidden_actions || item.forbiddenActions || [
      'Do not import secrets.',
      'Do not execute GHL automation automatically.',
      'Do not send external messages.',
      'Do not change BNA School data.',
    ]),
    required_save_behavior: compactText(item.required_save_behavior || item.requiredSaveBehavior || 'Save partial or completed result to the BNA Agent Action drop-off, then read back the saved result URL.', 800),
    expected_asset_ids: normalizeStringList(item.expected_asset_ids || item.expectedAssetIds || item.expected_assets || item.expectedAssets || []),
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
    registry_version: parsed.registry_version || parsed.registryVersion || source.registry_version || '',
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
    path.join(repoRoot, '..', 'OneTime', source.artifact_path),
    path.join(repoRoot, 'integrations', 'highlevel', 'agent-mode', 'GHL-AGENT-MODE-EXPORT.json'),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || '';
}

function importHighLevelAgentModeExport({ repoRoot = process.cwd(), source = HIGHLEVEL_EXPORT_SOURCE, filePath = '' } = {}) {
  const resolvedPath = filePath || findLocalHighLevelExport(repoRoot, source);
  if (!resolvedPath) {
    return highLevelImportBlocker(source);
  }
  const text = fs.readFileSync(resolvedPath, 'utf8');
  return {
    ...parseHighLevelAgentModeExport(text, source),
    resolved_path: resolvedPath,
  };
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
      message: `${source.repository} ${source.ref} at ${source.sha} does not expose ${source.artifact_path}.`,
      next_action: 'Provide or merge the exported GHL-AGENT-MODE-EXPORT.json artifact on a reachable One Time ref.',
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
  sha256Hex,
  compactText,
  normalizeAgentActionStatus,
  normalizeAgentActionCategory,
  agentActionResultIsTerminal,
  normalizeStringList,
  hasSecretLikeContent,
  agentActionJobFingerprint,
  buildAgentActionJobFromGhlExportItem,
  validateAgentActionJob,
  parseHighLevelAgentModeExport,
  importHighLevelAgentModeExport,
  highLevelImportBlocker,
  agentActionHubPayload,
};
