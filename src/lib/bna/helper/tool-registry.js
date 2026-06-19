const crypto = require('crypto');
const { confirmationPolicyForTool, inferSideEffectLevel } = require('./confirmation-gates');
const { helperPermissionForTool } = require('./permissions');
const { redactText, redactValue } = require('./redaction');
const { helperResultCard, helperResultLink } = require('./result-links');
const vimeoIntegration = require('../../integrations/vimeo');
const { parseIntakeText } = require('../intake-parser');
const { extractedItemCounts, normalizeSourceChannel } = require('../ramble-protocol');
const { STANDING_GOALS, affectedGoalIdsForText } = require('../goal-registry');

const REQUIRED_HELPER_TOOL_NAMES = [
  'create_task',
  'update_task',
  'add_task_comment',
  'mark_task_done',
  'create_pending_blocker',
  'request_missing_input',
  'create_decision',
  'add_decision_comment',
  'convert_decision_to_task',
  'send_decision_to_codex',
  'open_operations_view',
  'create_codex_work_item',
  'audit_queue_status',
  'show_task_report',
  'create_support_ticket',
  'capture_raw_intake',
  'show_goal_status',
  'run_watchdog_audit',
  'create_student',
  'create_content_item',
  'draft_social_post',
  'draft_email',
  'schedule_social_post_via_buffer',
  'send_email',
  'show_integration_status',
  'create_integration_setup_task',
  'save_provider_api_key',
  'rotate_provider_api_key',
  'create_automation',
  'update_automation',
  'test_resend_connection',
  'test_buffer_connection',
  'test_vimeo_connection',
  'test_wapi_connection',
  'mark_integration_blocked_until_thursday',
  'create_dns_setup_task',
  'create_provider_classroom_draft',
  'ingest_class_video_from_drive_or_upload',
  'transcribe_video',
  'parse_student_questions',
  'generate_worksheet',
  'create_library_item',
  'prepare_vimeo_upload',
  'mark_manual_vimeo_upload_needed',
  'attach_vimeo_url_to_library_item',
  'publish_library_item_after_approval',
];

const FALLBACK_ONLY_TOOL_NAMES = [
  'create_contact',
  'create_parent',
  'create_course',
  'create_worksheet',
  'create_provider_profile',
  'create_setup_flow',
  'ingest_class_video_from_drive_or_upload',
  'transcribe_video',
  'parse_student_questions',
  'generate_worksheet',
  'create_library_item',
  'publish_library_item_after_approval',
];

const TASK_CATEGORIES = new Set([
  'admin',
  'marketing',
  'parent_coaching',
  'student_operations',
  'finance',
  'legal',
  'communications',
  'operations',
  'accountability',
  'content',
  'technology',
  'accounting',
  'community_setup',
  'community',
  'general',
  'torah_class_prep',
  'torah_research',
  'source_sheets',
  'shiur_ideas',
]);

const TASK_STAGES = new Set(['raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive']);
const TASK_URGENCIES = new Set(['urgent', 'today', 'this_week', 'low']);
const CONTENT_SOURCE_TYPES = new Set(['telegram_media', 'telegram_text', 'manual', 'import', 'local_drop', 'google_drive']);
const CONTENT_STATUSES = new Set(['ingested', 'transcribing', 'transcribed', 'parsing', 'drafting', 'needs_approval', 'approved', 'published', 'blocked', 'archived']);
const INTEGRATION_TYPES = new Set(['resend', 'buffer', 'wapi', 'vimeo', 'zoom', 'stripe', 'godaddy_dns', 'google_drive', 'other']);
const INTEGRATION_STATUSES = new Set(['not_configured', 'needs_provider_account', 'needs_api_key', 'needs_dns', 'needs_owner_access', 'blocked_until_thursday', 'ready_for_test', 'connected', 'failed', 'disabled']);
const OPERATIONS_VIEWS = new Set(['dashboard', 'watchdog', 'pipelines', 'tasks', 'students', 'contacts', 'intake', 'community', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'accounting', 'automations', 'api_usage', 'admin', 'integrations', 'settings']);
const SUPPORT_TICKET_CATEGORIES = new Set(['task_manager', 'bot_api', 'automation', 'login', 'access', 'payment', 'recording', 'worksheet', 'drive', 'student_parent_data', 'link', 'other']);
const SUPPORT_TICKET_SEVERITIES = new Set(['low', 'normal', 'high', 'blocking']);
const AUTOMATION_STATUSES = new Set(['active', 'guarded', 'draft', 'blocked', 'paused', 'archived']);
const AUTOMATION_TYPES = new Set(['workflow', 'integration', 'bot', 'scheduler', 'content', 'accounting', 'student', 'system']);

function compactText(value, max = 1000) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, max);
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value || fallback || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return allowed.has(normalized) ? normalized : fallback;
}

function helperSlug(value = '', fallback = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function normalizeProjectKey(value = '') {
  const normalized = helperSlug(value, '');
  if (['bna', 'bnei_neviim', 'bnei_neviim_academy', 'school'].includes(normalized)) return 'bna';
  if (['one_time', 'one_time_mishnah', 'one_time_mishna', 'one_time_mishnah_class', 'one_time_mishna_class', 'rabbi_sheller_provider', 'rabbi_scheller_provider', 'mishnah', 'mishna'].includes(normalized)) return 'one_time_mishnah_class';
  return normalized;
}

function safeAutomationStatus(value = '', fallback = 'draft') {
  const normalized = helperSlug(value, fallback);
  return AUTOMATION_STATUSES.has(normalized) ? normalized : fallback;
}

function safeAutomationType(value = '', fallback = 'workflow') {
  const normalized = helperSlug(value, fallback);
  return AUTOMATION_TYPES.has(normalized) ? normalized : fallback;
}

function compactJsonArray(value, maxItems = 20, maxLength = 300) {
  if (Array.isArray(value)) return value.map((item) => compactText(item, maxLength)).filter(Boolean).slice(0, maxItems);
  const text = compactText(value, maxLength);
  return text ? [text] : [];
}

function normalizePlatform(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['facebook', 'fb'].includes(normalized)) return 'facebook';
  if (['linkedin', 'linked_in'].includes(normalized)) return 'linkedin';
  if (['youtube', 'yt'].includes(normalized)) return 'youtube';
  if (['instagram', 'ig'].includes(normalized)) return 'instagram';
  if (['whatsapp', 'wa'].includes(normalized)) return 'whatsapp';
  return normalized || 'social';
}

function socialOutputType(platform = '') {
  const normalized = normalizePlatform(platform);
  if (normalized === 'facebook') return 'facebook_post';
  if (normalized === 'linkedin') return 'linkedin_post';
  if (normalized === 'youtube') return 'youtube_description';
  if (normalized === 'whatsapp') return 'whatsapp_update';
  return 'social_copy_plan';
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validateArgs(schema = {}, args = {}) {
  const errors = [];
  const normalized = {};
  const input = args && typeof args === 'object' && !Array.isArray(args) ? args : {};
  for (const [field, rule] of Object.entries(schema)) {
    const value = Object.prototype.hasOwnProperty.call(input, field) ? input[field] : undefined;
    const required = Boolean(rule.required);
    if ((value === undefined || value === null || value === '') && required) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value === undefined || value === null || value === '') {
      if (Object.prototype.hasOwnProperty.call(rule, 'default')) normalized[field] = rule.default;
      continue;
    }
    if (rule.type === 'string') {
      const text = compactText(value, rule.maxLength || 4000);
      if (rule.enum && !rule.enum.includes(text)) errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      normalized[field] = text;
      continue;
    }
    if (rule.type === 'integer') {
      const number = normalizeNumber(value);
      if (!Number.isInteger(number)) errors.push(`${field} must be an integer`);
      else normalized[field] = number;
      continue;
    }
    if (rule.type === 'boolean') {
      normalized[field] = Boolean(value);
      continue;
    }
    if (rule.type === 'array') {
      normalized[field] = Array.isArray(value) ? value.slice(0, rule.maxItems || 50) : [value];
      continue;
    }
    if (rule.type === 'object') {
      normalized[field] = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      continue;
    }
    normalized[field] = value;
  }
  return {
    ok: errors.length === 0,
    errors,
    args: normalized,
  };
}

function makeDefinition(definition, handler) {
  const sideEffectLevel = inferSideEffectLevel(definition);
  const confirmationPolicy = confirmationPolicyForTool({ ...definition, sideEffectLevel });
  return {
    risk: 'low',
    requiresConfirmation: false,
    schema: {},
    available: true,
    sideEffectLevel,
    allowedScopes: ['admin', 'project', 'provider', 'rabbi', 'parent', 'student', 'family'],
    requiredRole: 'scope_resolver',
    confirmationPolicy: confirmationPolicy.policy,
    auditMetadata: { registry: 'bna_helper_tool_registry' },
    ...definition,
    sideEffectLevel,
    requiresConfirmation: Boolean(definition.requiresConfirmation) || confirmationPolicy.requiresConfirmation,
    confirmationPolicy: confirmationPolicy.policy,
    handler,
  };
}

function taskLabel(task = {}) {
  return `Task #${task.id}`;
}

async function insertTaskComment(db, taskId, body, { author = 'helper', visibility = 'workspace', sourceContext = {} } = {}) {
  const result = await db.query(
    `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
     VALUES ($1, $2, $3, $4, 'helper', $5::jsonb)
     RETURNING *`,
    [taskId, author, body, visibility, JSON.stringify(sourceContext || {})]
  );
  return result.rows[0];
}

async function createSetupBlocker({ deps, db, context, title, blocker, assignedTo = 'Shloimie', projectKey = null }) {
  return deps.createTaskFromText({
    title,
    raw_text: `${title}\n${blocker || ''}`,
    notes: blocker || title,
    category: 'technology',
    urgency: 'this_week',
    source: 'web',
    created_by: context.userName || 'BNA Helper',
    assigned_to: assignedTo,
    waiting_on: assignedTo,
    task_kind: 'pending_access',
    stage: 'assigned',
    project_key: projectKey || context.projectKey || context.project_key || undefined,
    ai_parsed: {
      parser: 'bna-helper-tool-registry',
      kind: 'task',
      task_kind: 'pending_access',
      missing_integration: true,
      blocker,
    },
  }, { req: context.req }, db);
}

function normalizeIntegrationType(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (['whatsapp', 'wa', 'whapi'].includes(normalized)) return 'wapi';
  if (['godaddy', 'dns', 'domain', 'domains'].includes(normalized)) return 'godaddy_dns';
  if (['google', 'drive', 'google_workspace'].includes(normalized)) return 'google_drive';
  return INTEGRATION_TYPES.has(normalized) ? normalized : 'other';
}

function normalizeIntegrationStatus(value = '', fallback = 'not_configured') {
  const normalized = String(value || fallback || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return INTEGRATION_STATUSES.has(normalized) ? normalized : fallback;
}

function integrationDisplayName(type = '') {
  return ({
    resend: 'Resend',
    buffer: 'Buffer',
    wapi: 'WAPI / WhatsApp',
    vimeo: 'Vimeo',
    zoom: 'Zoom',
    stripe: 'Stripe',
    godaddy_dns: 'GoDaddy / DNS',
    google_drive: 'Google Drive',
    other: 'Other Integration',
  })[normalizeIntegrationType(type)] || 'Integration';
}

function providerIdFromArgs(args = {}) {
  return normalizeNumber(args.provider_id || args.providerId) || null;
}

function legacyIntegrationStatus(status = '') {
  const normalized = normalizeIntegrationStatus(status);
  if (normalized === 'connected') return 'integrated';
  if (normalized === 'ready_for_test') return 'api_available';
  if (normalized === 'blocked_until_thursday') return 'access_requested';
  if (normalized === 'disabled') return 'disabled';
  return 'no_access';
}

function secretFingerprint(value = '') {
  const salt = process.env.INTEGRATION_SECRET_FINGERPRINT_SALT
    || process.env.SESSION_SECRET
    || 'bna-provider-secret-fingerprint-v1';
  return crypto.createHmac('sha256', salt).update(String(value || '')).digest('hex');
}

function safeSecretRef(context = {}, type = 'other', secretType = 'api_key') {
  const workspace = String(context.workspaceKey || context.projectKey || 'workspace').replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();
  return `keyholder://${workspace}/${normalizeIntegrationType(type)}/${String(secretType || 'api_key').replace(/[^a-z0-9_-]+/gi, '_').toLowerCase()}`;
}

async function recordProviderIntegrationAudit(db, row = {}, action = '', context = {}, metadata = {}) {
  try {
    await db.query(
      `INSERT INTO bna_provider_integration_audit_log (
         workspace_id, provider_id, integration_id, action, actor, outcome,
         route_path, request_ip_hash, user_agent_hash, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)`,
      [
        row.workspace_id || null,
        row.provider_id || null,
        row.id || row.integration_id || null,
        action,
        context.userName || 'BNA Helper',
        metadata.outcome || 'recorded',
        context.req?.path || null,
        context.req?.ip ? secretFingerprint(context.req.ip).slice(0, 24) : null,
        context.req?.headers?.['user-agent'] ? secretFingerprint(context.req.headers['user-agent']).slice(0, 24) : null,
        JSON.stringify(redactValue(metadata || {})),
      ]
    );
  } catch {
    // Helper audit is best-effort; the primary helper action still returns.
  }
}

async function upsertProviderIntegration(db, args = {}, context = {}, overrides = {}) {
  const integrationType = normalizeIntegrationType(overrides.integration_type || args.integration_type || args.integration || args.provider);
  const status = normalizeIntegrationStatus(overrides.status || args.status || 'not_configured');
  const providerId = providerIdFromArgs(args);
  const displayName = compactText(overrides.display_name || args.display_name || args.displayName || integrationDisplayName(integrationType), 160);
  const metadata = redactValue({
    source: 'bna_helper',
    project_key: args.project_key || context.projectKey || null,
    workspace_key: args.workspace_key || context.workspaceKey || null,
    provider_owned_default: true,
    ...overrides.metadata,
  });
  const result = await db.query(
    `INSERT INTO bna_provider_integrations (
       provider_id, integration_key, integration_type, label, display_name,
       external_system, source_of_truth, integration_status, status,
       connected_account_label, last_checked_at, last_error, notes, metadata,
       created_by
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       $10, NOW(), $11, $12, $13::jsonb,
       $14
     )
     ON CONFLICT(provider_id, integration_key) DO UPDATE SET
       integration_type = EXCLUDED.integration_type,
       label = EXCLUDED.label,
       display_name = EXCLUDED.display_name,
       external_system = EXCLUDED.external_system,
       source_of_truth = EXCLUDED.source_of_truth,
       integration_status = EXCLUDED.integration_status,
       status = EXCLUDED.status,
       connected_account_label = EXCLUDED.connected_account_label,
       last_checked_at = NOW(),
       last_error = EXCLUDED.last_error,
       notes = EXCLUDED.notes,
       metadata = bna_provider_integrations.metadata || EXCLUDED.metadata,
       updated_at = NOW()
     RETURNING *`,
    [
      providerId,
      integrationType,
      integrationType,
      displayName,
      displayName,
      integrationType,
      overrides.source_of_truth || args.source_of_truth || 'provider_owned_pending_access',
      legacyIntegrationStatus(status),
      status,
      compactText(overrides.connected_account_label || args.connected_account_label || args.account_label || '', 180) || null,
      compactText(overrides.last_error || args.last_error || '', 500) || null,
      compactText(overrides.notes || args.notes || '', 2000) || null,
      JSON.stringify(metadata),
      context.userName || 'BNA Helper',
    ]
  );
  const row = result.rows[0];
  await recordProviderIntegrationAudit(db, row, overrides.audit_action || 'integration_upserted', context, {
    integration_type: integrationType,
    status,
    raw_secret_stored: false,
  });
  return row;
}

function safeIntegrationRow(row = {}) {
  return redactValue({
    id: row.id,
    provider_id: row.provider_id || null,
    integration_type: row.integration_type || row.integration_key || 'other',
    display_name: row.display_name || row.label || integrationDisplayName(row.integration_key),
    status: row.status || row.integration_status || 'not_configured',
    connected_account_label: row.connected_account_label || null,
    last_checked_at: row.last_checked_at || null,
    last_error: row.last_error || null,
    notes: row.notes || null,
    metadata: row.metadata || {},
  });
}

async function showIntegrationStatusTool({ args, context, db }) {
  const type = args.integration_type ? normalizeIntegrationType(args.integration_type) : null;
  const providerId = providerIdFromArgs(args);
  const params = [];
  const conditions = [];
  if (type) {
    params.push(type);
    conditions.push(`COALESCE(integration_type, integration_key) = $${params.length}`);
  }
  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }
  const result = await db.query(
    `SELECT id, provider_id, integration_key, integration_type, label, display_name,
            integration_status, status, connected_account_label, last_checked_at,
            last_error, notes, metadata
     FROM bna_provider_integrations
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY updated_at DESC, id DESC
     LIMIT 50`,
    params
  );
  return helperResultCard({
    tool: 'show_integration_status',
    recordType: 'helper_audit',
    recordId: null,
    label: 'Integration status',
    summary: `Found ${result.rows.length} provider-scoped integration record(s).`,
    url: '/operations?view=integrations&section=readiness',
    data: {
      integrations: result.rows.map(safeIntegrationRow),
      static_statuses: {
        zoom: { status: 'blocked_until_thursday', reason: 'Needs Zoom Server-to-Server OAuth owner setup.' },
        godaddy_dns: { status: 'blocked_until_thursday', reason: 'Delegate/DNS owner access needs Thursday repair.' },
        vimeo: { status: 'manual_upload_required', reason: 'Vimeo remains the default candidate; API token/upload access still need verification.' },
      },
    },
  });
}

async function createIntegrationSetupTaskTool({ args, context, deps, db }) {
  const integrationType = normalizeIntegrationType(args.integration_type || args.integration);
  const status = normalizeIntegrationStatus(args.status || (['zoom', 'godaddy_dns'].includes(integrationType) ? 'blocked_until_thursday' : 'needs_api_key'));
  const row = await upsertProviderIntegration(db, args, context, {
    integration_type: integrationType,
    status,
    notes: args.reason || args.notes || `Set up ${integrationDisplayName(integrationType)} for this workspace/provider.`,
    audit_action: 'integration_setup_task_created',
  });
  const task = await createSetupBlocker({
    deps,
    db,
    context,
    title: args.title || `Set up ${integrationDisplayName(integrationType)} integration`,
    blocker: args.reason || args.notes || `${integrationDisplayName(integrationType)} needs provider-owned account/API/DNS setup before live use.`,
    assignedTo: args.needed_from || args.assigned_to || (status === 'blocked_until_thursday' ? 'Shloimie / Rabbi Scheller Thursday session' : 'Shloimie'),
    projectKey: args.project_key || context.projectKey,
  });
  return helperResultCard({
    tool: 'create_integration_setup_task',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created ${integrationDisplayName(integrationType)} setup task #${task.id} and recorded safe integration status.`,
    url: helperResultLink('task', task.id),
    data: { task, integration: safeIntegrationRow(row) },
  });
}

async function saveProviderApiKeyTool({ args, context, db }) {
  const integrationType = normalizeIntegrationType(args.integration_type || args.integration);
  const secretType = compactText(args.secret_type || 'api_key', 80).replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();
  const rawInput = String(args.key_input || args.api_key || args.token || '').trim();
  const fingerprint = rawInput ? secretFingerprint(rawInput) : '';
  const row = await upsertProviderIntegration(db, args, context, {
    integration_type: integrationType,
    status: rawInput || args.secret_ref ? 'ready_for_test' : 'needs_api_key',
    notes: 'Provider-owned secret reference registered by BNA Helper. Raw secret was not stored in tracked files or helper output.',
    audit_action: 'provider_secret_reference_registered',
    metadata: {
      secret_type: secretType,
      key_input_received: Boolean(rawInput),
      raw_secret_stored: false,
    },
  });
  const secretRef = compactText(args.secret_ref || safeSecretRef(context, integrationType, secretType), 240);
  const secret = (await db.query(
    `INSERT INTO bna_provider_secret_refs (
       workspace_id, provider_id, integration_id, secret_type, secret_ref,
       secret_label, secret_hash_prefix, fingerprint, encryption_version,
       status, created_by, metadata
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10, $11::jsonb)
     RETURNING id, workspace_id, provider_id, integration_id, secret_type,
       secret_ref, secret_label, secret_hash_prefix, fingerprint, status,
       created_at, last_rotated_at, revoked_at, metadata`,
    [
      row.workspace_id || null,
      row.provider_id || null,
      row.id,
      secretType,
      secretRef,
      compactText(args.secret_label || `${integrationDisplayName(integrationType)} ${secretType}`, 180),
      fingerprint ? fingerprint.slice(0, 12) : null,
      fingerprint ? `hmac:${fingerprint.slice(0, 16)}` : null,
      rawInput ? 'pending_keyholder' : 'pending_keyholder',
      context.userName || 'BNA Helper',
      JSON.stringify(redactValue({
        source: 'bna_helper',
        raw_secret_stored: false,
        storage_instruction: 'Place the real key in the server-side keyholder or Railway env path; this DB row stores only reference/fingerprint metadata.',
      })),
    ]
  )).rows[0];
  await recordProviderIntegrationAudit(db, row, 'provider_secret_reference_registered', context, {
    secret_ref: secret.secret_ref,
    secret_type: secretType,
    fingerprint: secret.fingerprint,
    raw_secret_stored: false,
  });
  return helperResultCard({
    tool: 'save_provider_api_key',
    recordType: 'helper_audit',
    recordId: secret.id,
    label: `${integrationDisplayName(integrationType)} secret reference`,
    summary: `Registered a ${integrationDisplayName(integrationType)} secret reference and safe fingerprint. Raw key was not returned or stored in helper output.`,
    url: '/operations?view=integrations&section=readiness',
    data: { integration: safeIntegrationRow(row), secret_ref: redactValue(secret) },
  });
}

async function rotateProviderApiKeyTool({ args, context, db }) {
  const integrationType = normalizeIntegrationType(args.integration_type || args.integration);
  const row = await upsertProviderIntegration(db, args, context, {
    integration_type: integrationType,
    status: 'needs_api_key',
    notes: args.reason || 'API key rotation requested. Current key should be revoked only after replacement is installed and tested.',
    audit_action: 'provider_secret_rotation_requested',
  });
  await db.query(
    `UPDATE bna_provider_secret_refs
     SET status = 'needs_rotation',
         last_rotated_at = COALESCE(last_rotated_at, NOW())
     WHERE integration_id = $1
       AND status = 'active'`,
    [row.id]
  ).catch(() => null);
  await recordProviderIntegrationAudit(db, row, 'provider_secret_rotation_requested', context, {
    reason: args.reason || null,
  });
  return helperResultCard({
    tool: 'rotate_provider_api_key',
    recordType: 'helper_audit',
    recordId: row.id,
    label: `${integrationDisplayName(integrationType)} rotation requested`,
    summary: `${integrationDisplayName(integrationType)} is marked as needing a replacement key and readiness retest.`,
    url: '/operations?view=integrations&section=readiness',
    data: { integration: safeIntegrationRow(row) },
  });
}

async function projectIdForAutomation(db, projectKey = '') {
  const key = normalizeProjectKey(projectKey);
  if (!key) return null;
  const result = await db.query('SELECT id FROM bna_projects WHERE project_key = $1 LIMIT 1', [key]).catch(() => ({ rows: [] }));
  return result.rows[0]?.id || null;
}

function automationToolView(row = {}) {
  return redactValue({
    id: row.id,
    automation_key: row.automation_key,
    name: row.name,
    summary: row.summary,
    package_key: row.package_key,
    service_key: row.service_key,
    status: row.status,
    automation_type: row.automation_type,
    trigger_label: row.trigger_label,
    channel: row.channel,
    setup_blockers: row.setup_blockers || [],
    related_task_ids: row.related_task_ids || [],
    metadata: row.metadata || {},
  });
}

function automationDefaultsFromArgs(args = {}, context = {}) {
  const rawName = compactText(args.name || args.title || args.summary || 'Helper automation draft', 180);
  const lower = `${rawName} ${args.summary || ''} ${args.description || ''} ${args.action || ''}`.toLowerCase();
  const automationType = safeAutomationType(args.automation_type || (/billing|payment|invoice|tuition/.test(lower) ? 'accounting' : 'workflow'));
  const packageKey = helperSlug(args.package_key || args.package || (automationType === 'accounting' ? 'accounting' : 'operations'), 'operations');
  const serviceKey = helperSlug(args.service_key || args.service || rawName, 'helper_workflow');
  const projectKey = normalizeProjectKey(args.project_key || context.projectKey || context.project_key || '');
  const automationKey = helperSlug(
    args.automation_key || `helper_${projectKey || 'global'}_${packageKey}_${serviceKey}`,
    `helper_${Date.now()}`
  ).slice(0, 180);
  const setupBlockers = compactJsonArray(args.setup_blockers || args.blockers || args.blocker || '', 20, 300);
  return {
    automationKey,
    name: rawName,
    summary: compactText(args.summary || args.purpose || `Helper-created ${automationType} workflow draft.`, 900),
    description: compactText(args.description || args.action || args.summary || rawName, 4000),
    packageKey,
    packageName: compactText(args.package_name || packageKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), 180),
    serviceKey,
    serviceName: compactText(args.service_name || serviceKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), 180),
    projectKey,
    owner: compactText(args.owner || context.userName || 'Shloimie', 120),
    responsiblePerson: compactText(args.responsible_person || args.assigned_to || context.userName || 'Shloimie', 120),
    status: safeAutomationStatus(args.status || 'draft'),
    automationType,
    triggerType: helperSlug(args.trigger_type || args.trigger || 'manual_review', 'manual_review'),
    triggerLabel: compactText(args.trigger_label || args.trigger || 'Manual helper-created workflow draft', 180),
    channel: helperSlug(args.channel || (automationType === 'accounting' ? 'accounting' : 'dashboard'), 'dashboard'),
    audience: compactText(args.audience || 'BNA Operations', 900),
    setupBlockers: setupBlockers.length ? setupBlockers : ['Review trigger, permissions, owner, and rollback before enabling any live handler.'],
  };
}

async function createAutomationTool({ args, context, db }) {
  const spec = automationDefaultsFromArgs(args, context);
  const projectId = await projectIdForAutomation(db, spec.projectKey);
  const metadata = redactValue({
    source: 'bna_helper',
    helper_created: true,
    raw_prompt: args.raw_prompt || args.prompt || null,
    no_external_write: true,
    no_send_publish_charge_or_sync: true,
  });
  const permissions = {
    registry_edits_only: true,
    helper_created_draft: true,
    live_handler_requires_separate_approval: true,
    no_external_send_publish_charge_or_sync: true,
  };
  const result = await db.query(
    `INSERT INTO bna_automations (
       automation_key, name, summary, description, package_key, package_name,
       service_key, service_name, scope_type, project_id, owner, responsible_person,
       status, automation_type, trigger_type, trigger_label, channel, audience,
       permissions, setup_blockers, related_task_ids, config, metadata, created_by, updated_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, 'project', $9, $10, $11,
       $12, $13, $14, $15, $16, $17,
       $18::jsonb, $19::jsonb, '[]'::jsonb, '{}'::jsonb, $20::jsonb, $21, $21
     )
     ON CONFLICT (automation_key) DO UPDATE SET
       name = EXCLUDED.name,
       summary = EXCLUDED.summary,
       description = EXCLUDED.description,
       package_key = EXCLUDED.package_key,
       package_name = EXCLUDED.package_name,
       service_key = EXCLUDED.service_key,
       service_name = EXCLUDED.service_name,
       project_id = COALESCE(EXCLUDED.project_id, bna_automations.project_id),
       owner = EXCLUDED.owner,
       responsible_person = EXCLUDED.responsible_person,
       status = EXCLUDED.status,
       automation_type = EXCLUDED.automation_type,
       trigger_type = EXCLUDED.trigger_type,
       trigger_label = EXCLUDED.trigger_label,
       channel = EXCLUDED.channel,
       audience = EXCLUDED.audience,
       permissions = COALESCE(bna_automations.permissions, '{}'::jsonb) || EXCLUDED.permissions,
       setup_blockers = EXCLUDED.setup_blockers,
       metadata = COALESCE(bna_automations.metadata, '{}'::jsonb) || EXCLUDED.metadata,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()
     RETURNING *`,
    [
      spec.automationKey,
      spec.name,
      spec.summary,
      spec.description,
      spec.packageKey,
      spec.packageName,
      spec.serviceKey,
      spec.serviceName,
      projectId,
      spec.owner,
      spec.responsiblePerson,
      spec.status,
      spec.automationType,
      spec.triggerType,
      spec.triggerLabel,
      spec.channel,
      spec.audience,
      JSON.stringify(permissions),
      JSON.stringify(spec.setupBlockers),
      JSON.stringify(metadata),
      context.userName || 'BNA Helper',
    ]
  );
  const row = result.rows[0];
  return helperResultCard({
    tool: 'create_automation',
    recordType: 'automation',
    recordId: row.id,
    label: `Automation #${row.id}`,
    summary: `Created or updated local ${spec.automationType} workflow draft "${row.name}". No external send, publish, charge, or sync was performed.`,
    url: `/operations?view=automations&automation=${encodeURIComponent(String(row.id))}`,
    data: { automation: automationToolView(row) },
  });
}

async function updateAutomationTool({ args, context, db }) {
  const automationId = normalizeNumber(args.automation_id || args.id);
  const automationKey = helperSlug(args.automation_key || args.key || '', '');
  if (!automationId && !automationKey) {
    const error = new Error('automation_id or automation_key is required');
    error.statusCode = 400;
    throw error;
  }
  const lookup = automationId
    ? await db.query('SELECT * FROM bna_automations WHERE id = $1 LIMIT 1', [automationId])
    : await db.query('SELECT * FROM bna_automations WHERE automation_key = $1 LIMIT 1', [automationKey]);
  const existing = lookup.rows[0];
  if (!existing) {
    const error = new Error('Automation was not found');
    error.statusCode = 404;
    throw error;
  }
  const fields = [];
  const values = [];
  const add = (field, value, cast = '') => {
    values.push(value);
    fields.push(`${field} = $${values.length}${cast}`);
  };
  if (Object.prototype.hasOwnProperty.call(args, 'name')) add('name', compactText(args.name, 180) || existing.name);
  if (Object.prototype.hasOwnProperty.call(args, 'summary')) add('summary', compactText(args.summary, 900) || existing.summary);
  if (Object.prototype.hasOwnProperty.call(args, 'description') || Object.prototype.hasOwnProperty.call(args, 'action')) {
    add('description', compactText(args.description || args.action, 4000) || existing.description);
  }
  if (Object.prototype.hasOwnProperty.call(args, 'status') || Object.prototype.hasOwnProperty.call(args, 'enabled')) {
    add('status', Object.prototype.hasOwnProperty.call(args, 'enabled') ? (args.enabled ? 'guarded' : 'paused') : safeAutomationStatus(args.status, existing.status || 'draft'));
  }
  if (Object.prototype.hasOwnProperty.call(args, 'trigger_label') || Object.prototype.hasOwnProperty.call(args, 'trigger')) {
    add('trigger_label', compactText(args.trigger_label || args.trigger, 180) || existing.trigger_label);
  }
  if (Object.prototype.hasOwnProperty.call(args, 'setup_blockers') || Object.prototype.hasOwnProperty.call(args, 'blocker')) {
    add('setup_blockers', JSON.stringify(compactJsonArray(args.setup_blockers || args.blocker, 20, 300)), '::jsonb');
  }
  const metadata = redactValue({
    source: 'bna_helper',
    helper_updated: true,
    change_note: args.change_note || args.reason || null,
    no_external_write: true,
  });
  values.push(JSON.stringify(metadata));
  fields.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${values.length}::jsonb`);
  add('updated_by', context.userName || 'BNA Helper');
  values.push(existing.id);
  const result = await db.query(
    `UPDATE bna_automations
     SET ${fields.join(', ')},
         updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  const row = result.rows[0];
  return helperResultCard({
    tool: 'update_automation',
    recordType: 'automation',
    recordId: row.id,
    label: `Automation #${row.id}`,
    summary: `Updated local automation metadata for "${row.name}". No automation run, external send, payment, publish, or sync was performed.`,
    url: `/operations?view=automations&automation=${encodeURIComponent(String(row.id))}`,
    data: { automation: automationToolView(row) },
  });
}

function localIntegrationReadiness(type = '') {
  const normalized = normalizeIntegrationType(type);
  if (normalized === 'resend') return { configured: Boolean(process.env.RESEND_API_KEY), required_env: 'RESEND_API_KEY', status_if_missing: 'needs_api_key' };
  if (normalized === 'buffer') return { configured: Boolean(process.env.BUFFER_API_KEY), required_env: 'BUFFER_API_KEY', status_if_missing: 'needs_api_key' };
  if (normalized === 'wapi') return { configured: Boolean(process.env.WAPI_API_TOKEN || process.env.WHAPI_API_TOKEN), required_env: 'WAPI_API_TOKEN or WHAPI_API_TOKEN', status_if_missing: 'needs_api_key' };
  if (normalized === 'vimeo') return { configured: Boolean(process.env.VIMEO_ACCESS_TOKEN), required_env: 'VIMEO_ACCESS_TOKEN', status_if_missing: 'manual_upload_required' };
  return { configured: false, required_env: 'provider-owned secret', status_if_missing: 'needs_api_key' };
}

async function testIntegrationConnectionTool({ args, context, db }, integrationType) {
  const type = normalizeIntegrationType(integrationType || args.integration_type || args.integration);
  if (type === 'vimeo') {
    const vimeo = await vimeoIntegration.testVimeoAuth({ token: args.token || process.env.VIMEO_ACCESS_TOKEN });
    const row = await upsertProviderIntegration(db, args, context, {
      integration_type: type,
      status: vimeo.ok ? 'ready_for_test' : 'needs_api_key',
      last_error: vimeo.ok ? '' : vimeo.blocker || vimeo.status,
      audit_action: 'vimeo_connection_tested',
      metadata: { vimeo_status: vimeo.status, external_write_performed: false },
    });
    return helperResultCard({
      ok: Boolean(vimeo.ok),
      tool: 'test_vimeo_connection',
      recordType: 'helper_audit',
      recordId: row.id,
      label: 'Vimeo readiness',
      summary: vimeo.ok ? 'Vimeo auth is ready for read-only API checks.' : 'Vimeo is not API-ready; manual upload fallback remains available.',
      status: vimeo.ok ? 'executed' : 'missing_integration',
      url: '/operations?view=integrations&section=readiness',
      data: { integration: safeIntegrationRow(row), vimeo: redactValue(vimeo) },
    });
  }
  const readiness = localIntegrationReadiness(type);
  const row = await upsertProviderIntegration(db, args, context, {
    integration_type: type,
    status: readiness.configured ? 'ready_for_test' : readiness.status_if_missing,
    last_error: readiness.configured ? '' : `${readiness.required_env} is not configured for this runtime.`,
    audit_action: `${type}_connection_tested`,
    metadata: { external_write_performed: false, configured: readiness.configured },
  });
  return helperResultCard({
    ok: readiness.configured,
    tool: `test_${type}_connection`,
    recordType: 'helper_audit',
    recordId: row.id,
    label: `${integrationDisplayName(type)} readiness`,
    summary: readiness.configured
      ? `${integrationDisplayName(type)} has server-side credential metadata and is ready for a focused read-only test.`
      : `${integrationDisplayName(type)} needs ${readiness.required_env} before a live readiness check.`,
    status: readiness.configured ? 'executed' : 'missing_integration',
    url: '/operations?view=integrations&section=readiness',
    data: { integration: safeIntegrationRow(row), readiness },
  });
}

async function markIntegrationBlockedUntilThursdayTool({ args, context, deps, db }) {
  const integrationType = normalizeIntegrationType(args.integration_type || args.integration);
  const reason = args.reason || `${integrationDisplayName(integrationType)} needs owner/account access in the Thursday session.`;
  const row = await upsertProviderIntegration(db, args, context, {
    integration_type: integrationType,
    status: 'blocked_until_thursday',
    notes: reason,
    audit_action: 'integration_blocked_until_thursday',
    metadata: { thursday_blocker: true },
  });
  const task = await createSetupBlocker({
    deps,
    db,
    context,
    title: `${integrationDisplayName(integrationType)} blocked until Thursday`,
    blocker: reason,
    assignedTo: args.needed_from || 'Shloimie / Rabbi Scheller Thursday session',
    projectKey: args.project_key || context.projectKey,
  });
  return helperResultCard({
    tool: 'mark_integration_blocked_until_thursday',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `${integrationDisplayName(integrationType)} is marked blocked until Thursday with task #${task.id}.`,
    data: { task, integration: safeIntegrationRow(row) },
  });
}

function dnsValueFromArgs(args = {}) {
  const value = compactText(args.value || args.record_value || '', 2000);
  if (!value || /\.{3}|copy exact|screenshot|truncated/i.test(value)) return '';
  return value;
}

async function createDnsSetupTaskTool({ args, context, db }) {
  const integrationType = normalizeIntegrationType(args.integration_type || args.provider || 'resend');
  const recordType = compactText(args.record_type || args.type || 'TXT', 20).toUpperCase();
  const value = dnsValueFromArgs(args);
  const result = await db.query(
    `INSERT INTO bna_dns_setup_tasks (
       provider_id, provider, provider_account, account_owner, domain,
       purpose, record_purpose, record_type, type, host, value, ttl, priority,
       status, notes, source, created_by
     ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      providerIdFromArgs(args),
      integrationType,
      compactText(args.provider_account || '', 180) || null,
      compactText(args.account_owner || 'provider_owner', 180),
      compactText(args.domain || '', 240),
      compactText(args.purpose || 'verification', 80),
      recordType,
      compactText(args.host || '', 240) || null,
      value || null,
      args.ttl ? Number(args.ttl) : null,
      args.priority ? Number(args.priority) : null,
      value ? 'copied_from_dashboard' : 'needed',
      compactText(args.notes || (value ? 'Exact DNS value captured from dashboard.' : 'Copy exact value from dashboard on Thursday; do not infer from screenshots.'), 2000),
      compactText(args.source || `${integrationType}_dashboard`, 120),
      context.userName || 'BNA Helper',
    ]
  );
  return helperResultCard({
    tool: 'create_dns_setup_task',
    recordType: 'helper_audit',
    recordId: result.rows[0].id,
    label: `DNS task #${result.rows[0].id}`,
    summary: value ? 'Created DNS setup task with dashboard-provided value.' : 'Created DNS setup placeholder; exact dashboard value still needs owner access.',
    url: '/operations?view=integrations&section=communications',
    data: { dns_task: redactValue(result.rows[0]), raw_secret_stored: false },
  });
}

async function prepareVimeoUploadTool({ args }) {
  const intent = vimeoIntegration.createVimeoUploadIntent(args, {
    token: args.token || process.env.VIMEO_ACCESS_TOKEN,
    accountOwner: args.account_owner || 'unknown',
    vimeoPlan: args.vimeo_plan || process.env.VIMEO_PLAN || '',
    uploadAccess: false,
  });
  return helperResultCard({
    ok: false,
    tool: 'prepare_vimeo_upload',
    recordType: 'helper_audit',
    recordId: args.content_id || null,
    label: 'Vimeo upload preparation',
    summary: 'Prepared Vimeo upload intent. API upload remains blocked; manual upload fallback is available.',
    status: 'missing_integration',
    url: '/operations?view=integrations&section=readiness',
    data: redactValue(intent),
  });
}

async function markManualVimeoUploadNeededTool({ args, context, deps, db }) {
  const task = await createSetupBlocker({
    deps,
    db,
    context,
    title: args.title || 'Manual Vimeo upload needed',
    blocker: args.reason || 'Upload the class video manually in Vimeo, then paste the Vimeo URL into the library item for approval.',
    assignedTo: args.needed_from || 'Shloimie / Rabbi Scheller',
    projectKey: args.project_key || context.projectKey,
  });
  return helperResultCard({
    ok: false,
    tool: 'mark_manual_vimeo_upload_needed',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created manual Vimeo upload task #${task.id}.`,
    status: 'missing_integration',
    data: { task },
  });
}

async function attachVimeoUrlToLibraryItemTool({ args, context, deps, db }) {
  const attached = vimeoIntegration.attachVimeoUrl(args);
  if (!attached.ok) {
    const task = await createSetupBlocker({
      deps,
      db,
      context,
      title: 'Valid Vimeo URL needed',
      blocker: attached.blocker,
      assignedTo: 'Shloimie',
      projectKey: args.project_key || context.projectKey,
    });
    return helperResultCard({
      ok: false,
      tool: 'attach_vimeo_url_to_library_item',
      recordType: 'task',
      recordId: task.id,
      label: taskLabel(task),
      summary: 'Could not attach Vimeo URL; created a setup blocker.',
      status: 'schema_validation_failed',
      data: { task, attached },
    });
  }
  let updated = null;
  if (args.content_id || args.contentId) {
    const contentId = Number(args.content_id || args.contentId);
    await deps.assertProjectOwnedRowAccess(context.req, 'bna_content_jobs', contentId, db).catch(() => null);
    updated = (await db.query(
      `UPDATE bna_content_jobs
       SET media_url = $2,
           parse_json = COALESCE(parse_json, '{}'::jsonb) || $3::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, media_url, status`,
      [
        contentId,
        attached.library_item.media_url,
        JSON.stringify({ vimeo_id: attached.library_item.vimeo_id, media_provider: 'vimeo', source: 'bna_helper' }),
      ]
    )).rows[0] || null;
  }
  return helperResultCard({
    tool: 'attach_vimeo_url_to_library_item',
    recordType: updated ? 'content_job' : 'helper_audit',
    recordId: updated?.id || null,
    label: 'Vimeo URL attached',
    summary: 'Attached a manual Vimeo URL for review. Publishing still requires approval.',
    data: { attached, content_job: updated },
  });
}

async function captureRawIntakeTool({ args, context, deps, db }) {
  const rawText = compactText(args.raw_text || args.text || args.message || args.prompt, 20000);
  if (!rawText) throw Object.assign(new Error('raw_text is required'), { code: 'schema_validation_failed', statusCode: 400 });
  const sourceChannel = normalizeSourceChannel(args.source_channel || args.source_type || 'operations_helper');
  const metadata = {
    helper_scope: context.helperScope?.scopeType || context.scopeType || 'admin',
    workspace_key: context.workspaceKey || null,
    project_key: context.projectKey || null,
    source_date: args.source_date || null,
    page_path: context.pageContext?.path || context.req?.originalUrl || null,
    helper_tool: 'capture_raw_intake',
  };
  let rawRecord = null;
  if (typeof deps.createRawIntakeRecord === 'function') {
    rawRecord = await deps.createRawIntakeRecord({
      rawInput: rawText,
      source_type: args.source_type || sourceChannel,
      source_channel: sourceChannel,
      source_user: context.userName || 'BNA Helper',
      intake_type: args.intake_type || 'helper',
      metadata,
      req: context.req,
      db,
    });
  }
  const parsed = parseIntakeText({
    raw_input: rawText,
    source_type: args.source_type || sourceChannel,
    source_channel: sourceChannel,
    source_date: args.source_date || null,
    workspace_key: context.workspaceKey || undefined,
    project_key: context.projectKey || undefined,
    raw_id: rawRecord?.stable_id || args.raw_id || null,
  });
  if (rawRecord && typeof deps.updateRawIntakeRecordAfterParse === 'function') {
    rawRecord = await deps.updateRawIntakeRecordAfterParse(rawRecord, parsed, {
      parser_version: parsed.parser_version,
    }, db);
  }
  const counts = extractedItemCounts(parsed);
  const rawId = rawRecord?.stable_id || parsed.ramble_protocol?.raw_id || null;
  return helperResultCard({
    tool: 'capture_raw_intake',
    recordType: 'raw_intake',
    recordId: rawRecord?.id || null,
    label: rawId || 'Raw intake captured',
    summary: `Captured raw intake${rawId ? ` ${rawId}` : ''}; parsed ${Object.entries(counts).filter(([, count]) => count).map(([key, count]) => `${count} ${key}`).join(', ') || 'no confident lanes yet'}.`,
    url: rawRecord?.id ? helperResultLink('intake', rawRecord.id) : '/operations?view=intake',
    data: {
      raw_id: rawId,
      parse_status: rawRecord?.parse_status || 'parsed_local',
      counts,
      requirement_register_path: parsed.ramble_protocol?.requirement_register_path || null,
      goal_mode_execution_requested: Boolean(parsed.ramble_protocol?.goal_mode_execution_requested),
      should_create_or_continue_goal: Boolean(parsed.ramble_protocol?.should_create_or_continue_goal),
      related_goal_ids: [...new Set([
        ...affectedGoalIdsForText(rawText),
        ...((parsed.goal_candidates || []).flatMap((item) => item.related_goal_ids || [])),
      ])],
      filing_targets: parsed.ramble_protocol?.filing_targets || [],
      raw_text_returned: false,
    },
  });
}

async function showGoalStatusTool({ args }) {
  const related = args.text ? affectedGoalIdsForText(args.text) : [];
  const goals = related.length
    ? STANDING_GOALS.filter((goal) => related.includes(goal.id))
    : STANDING_GOALS;
  return helperResultCard({
    tool: 'show_goal_status',
    recordType: 'goal_memory',
    recordId: null,
    label: 'Goal status',
    summary: `Showing ${goals.length} standing goal(s).`,
    url: '/operations?view=watchdog',
    data: {
      goals,
      related_goal_ids: related,
      source: 'QUALITY-GOALS.md',
    },
  });
}

async function runWatchdogAuditTool({ args, context, deps, db }) {
  const task = await deps.createTaskFromText({
    title: args.title || 'Run BNA watchdog audit',
    raw_text: args.reason || args.notes || 'Run the requested local-safe watchdog audit and report findings.',
    notes: [
      args.reason || args.notes || 'Run the requested local-safe watchdog audit.',
      `Suggested command: ${args.command || 'npm run watchdog:audit'}`,
      'Do not send, publish, charge, change DNS, upload, sync, or copy credentials.',
    ].join('\n'),
    assigned_to: 'Codex',
    category: 'technology',
    urgency: normalizeEnum(args.urgency, TASK_URGENCIES, 'this_week'),
    project_key: args.project_key || context.projectKey || undefined,
    source: 'web',
    created_by: context.userName || 'BNA Helper',
    task_kind: 'agent_job',
    stage: 'assigned',
    agent_executable: true,
    ai_parsed: {
      kind: 'watchdog_audit_request',
      command: args.command || 'npm run watchdog:audit',
      source: 'bna_helper',
    },
  }, { req: context.req }, db);
  return helperResultCard({
    tool: 'run_watchdog_audit',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created Codex watchdog audit task #${task.id}.`,
    url: helperResultLink('task', task.id),
    data: { task_id: task.id, command: args.command || 'npm run watchdog:audit' },
  });
}

async function createTaskTool({ args, context, deps, db }) {
  const task = await deps.createTaskFromText({
    title: args.title,
    raw_text: args.raw_text || args.notes || args.title,
    notes: args.notes || null,
    summary: args.summary || null,
    assigned_to: args.assigned_to || undefined,
    category: normalizeEnum(args.category, TASK_CATEGORIES, 'operations'),
    urgency: normalizeEnum(args.urgency, TASK_URGENCIES, 'this_week'),
    due_date: args.due_date || null,
    stage: normalizeEnum(args.stage, TASK_STAGES, 'assigned'),
    project_key: args.project_key || context.projectKey || undefined,
    source: 'web',
    created_by: context.userName || 'BNA Helper',
    agent_executable: false,
  }, { req: context.req }, db);
  return helperResultCard({
    tool: 'create_task',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created task #${task.id}.`,
    data: { task },
  });
}

async function createCodexWorkItemTool({ args, context, deps, db }) {
  const brief = compactText(args.brief || args.notes || args.title, 10000);
  const task = await deps.createTaskFromText({
    title: args.title,
    raw_text: brief,
    notes: brief,
    summary: args.summary || null,
    assigned_to: 'Codex',
    category: normalizeEnum(args.category, TASK_CATEGORIES, 'technology'),
    urgency: normalizeEnum(args.urgency, TASK_URGENCIES, 'this_week'),
    project_key: args.project_key || context.projectKey || undefined,
    source: 'web',
    created_by: context.userName || 'BNA Helper',
    task_kind: 'agent_job',
    stage: 'assigned',
    agent_executable: true,
  }, { req: context.req }, db);
  return helperResultCard({
    tool: 'create_codex_work_item',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created Codex work item #${task.id}.`,
    data: { task },
  });
}

async function updateTaskTool({ args, context, deps, db }) {
  await deps.assertTaskAccess(context.req, args.task_id, db);
  const updates = {};
  if (args.title) updates.title = args.title;
  if (args.notes) updates.notes = args.notes;
  if (args.summary) updates.summary = args.summary;
  if (args.stage) updates.stage = normalizeEnum(args.stage, TASK_STAGES, 'assigned');
  if (args.category) updates.category = normalizeEnum(args.category, TASK_CATEGORIES, 'operations');
  if (args.urgency) updates.urgency = normalizeEnum(args.urgency, TASK_URGENCIES, 'this_week');
  if (args.assigned_to) updates.assigned_to = args.assigned_to;
  if (args.due_date) updates.due_date = args.due_date;
  if (!Object.keys(updates).length) throw Object.assign(new Error('No supported task updates were supplied'), { code: 'schema_validation_failed', statusCode: 400 });
  const task = await deps.patchTaskAndReturn(args.task_id, updates, {
    actor: context.userName || 'BNA Helper',
    eventType: 'helper_task_updated',
    eventSummary: 'BNA Helper updated this task.',
  });
  return helperResultCard({
    tool: 'update_task',
    recordType: 'task',
    recordId: args.task_id,
    label: taskLabel(task),
    summary: `Updated task #${args.task_id}.`,
    data: { task },
  });
}

async function addTaskCommentTool({ args, context, deps, db }) {
  await deps.assertTaskAccess(context.req, args.task_id, db);
  const comment = await insertTaskComment(db, args.task_id, args.body, {
    author: context.userName || 'BNA Helper',
    visibility: context.projectKey === 'one_time_mishnah_class' ? 'project' : 'workspace',
    sourceContext: { tool: 'add_task_comment' },
  });
  if (deps.recordTaskActivity) {
    await deps.recordTaskActivity(args.task_id, 'helper_comment_added', {
      actor: context.userName || 'BNA Helper',
      summary: compactText(args.body, 400),
      metadata: { comment_id: comment.id },
    }, db);
  }
  return helperResultCard({
    tool: 'add_task_comment',
    recordType: 'task',
    recordId: args.task_id,
    label: `Comment on task #${args.task_id}`,
    summary: `Added a comment to task #${args.task_id}.`,
    data: { comment },
  });
}

async function markTaskDoneTool({ args, context, deps, db }) {
  await deps.assertTaskAccess(context.req, args.task_id, db);
  const note = compactText(args.verification_notes || args.notes || 'Marked done by BNA Helper.', 4000);
  const task = await deps.patchTaskAndReturn(args.task_id, {
    stage: 'done',
    task_kind: 'history',
    completed_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
    verification_notes: note,
    decision_required: false,
    agent_status: 'completed',
    proof_status: args.proof_url ? 'valid' : 'not_required',
    status_detail: args.proof_url ? 'done_with_report' : 'done_with_report',
    next_action_label: 'Done',
    next_action: 'Review completed result',
  }, {
    actor: context.userName || 'BNA Helper',
    eventType: 'helper_task_marked_done',
    eventSummary: note,
  });
  if (deps.updateLatestAgentJobForTask) {
    await deps.updateLatestAgentJobForTask(args.task_id, 'completed', { result_summary: note }, db).catch(() => null);
  }
  return helperResultCard({
    tool: 'mark_task_done',
    recordType: 'task',
    recordId: args.task_id,
    label: taskLabel(task),
    summary: `Marked task #${args.task_id} done.`,
    data: { task },
  });
}

async function createPendingBlockerTool({ args, context, deps, db }) {
  const task = await createSetupBlocker({
    deps,
    db,
    context,
    title: args.title,
    blocker: args.blocker || args.needed_from || args.title,
    assignedTo: args.assigned_to || args.needed_from || 'Shloimie',
    projectKey: args.project_key || context.projectKey,
  });
  return helperResultCard({
    tool: 'create_pending_blocker',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created pending blocker #${task.id}.`,
    data: { task },
  });
}

async function requestMissingInputTool({ args, context, deps, db }) {
  if (args.task_id) {
    await deps.assertTaskAccess(context.req, args.task_id, db);
    const task = await deps.patchTaskAndReturn(args.task_id, {
      item_type: 'task',
      task_kind: 'pending_access',
      stage: 'assigned',
      waiting_on: args.needed_from || 'external',
      status_detail: 'requested',
      requested_at: new Date().toISOString(),
      requested_by: context.userName || 'BNA Helper',
      next_action_label: 'Input requested',
      next_action: args.prompt,
    }, {
      actor: context.userName || 'BNA Helper',
      eventType: 'helper_missing_input_requested',
      eventSummary: args.prompt,
    });
    await insertTaskComment(db, args.task_id, args.prompt, {
      author: context.userName || 'BNA Helper',
      sourceContext: { tool: 'request_missing_input', needed_from: args.needed_from || null },
    });
    return helperResultCard({
      tool: 'request_missing_input',
      recordType: 'task',
      recordId: args.task_id,
      label: taskLabel(task),
      summary: `Requested missing input for task #${args.task_id}.`,
      data: { task },
    });
  }
  return createPendingBlockerTool({
    args: {
      title: args.title || 'Request missing input',
      blocker: args.prompt,
      assigned_to: args.needed_from || 'Shloimie',
      project_key: args.project_key,
    },
    context,
    deps,
    db,
  });
}

async function createDecisionTool({ args, context, deps, db }) {
  const task = await deps.createTaskFromText({
    title: args.title,
    raw_text: args.context || args.title,
    notes: args.context || '',
    category: normalizeEnum(args.category, TASK_CATEGORIES, 'operations'),
    urgency: normalizeEnum(args.urgency, TASK_URGENCIES, 'this_week'),
    source: 'web',
    created_by: context.userName || 'BNA Helper',
    assigned_to: args.owner || 'Shloimie',
    decision_owner: args.owner || 'Shloimie',
    decision_required: true,
    item_type: 'decision',
    task_kind: 'decision',
    stage: 'needs_decision',
    decision_options_json: args.options || [],
    project_key: args.project_key || context.projectKey || undefined,
  }, { req: context.req }, db);
  return helperResultCard({
    tool: 'create_decision',
    recordType: 'decision',
    recordId: task.id,
    label: `Decision #${task.id}`,
    summary: `Created decision #${task.id}.`,
    data: { task },
  });
}

async function addDecisionCommentTool({ args, context, deps, db }) {
  const taskId = args.decision_id || args.task_id;
  await deps.assertTaskAccess(context.req, taskId, db);
  const comment = await insertTaskComment(db, taskId, args.body, {
    author: context.userName || 'BNA Helper',
    sourceContext: { tool: 'add_decision_comment' },
  });
  await db.query(
    `UPDATE bna_tasks
     SET decision_last_activity_at = NOW(),
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [taskId]
  );
  return helperResultCard({
    tool: 'add_decision_comment',
    recordType: 'decision',
    recordId: taskId,
    label: `Decision #${taskId}`,
    summary: `Added a decision comment to #${taskId}.`,
    data: { comment },
  });
}

async function convertDecisionTool({ args, context, deps, db, codex = false }) {
  const taskId = args.decision_id || args.task_id;
  await deps.assertTaskAccess(context.req, taskId, db);
  const current = await deps.fetchTaskWithProject(taskId, db);
  if (!current) throw Object.assign(new Error('Decision not found'), { code: 'record_not_found', statusCode: 404 });
  const linked = deps.createLinkedDecisionTask
    ? await deps.createLinkedDecisionTask(current, {
      action: codex ? 'send_to_codex' : 'add_task',
      actor: context.userName || 'BNA Helper',
      assignedTo: codex ? 'Codex' : (args.assigned_to || 'Shloimie'),
      title: args.title,
      notes: args.notes,
      codex,
    }, db)
    : await deps.createTaskFromText({
      title: args.title || `${codex ? 'Codex' : 'Task'}: ${current.title}`,
      raw_text: args.notes || current.notes || current.title,
      notes: args.notes || current.notes || '',
      assigned_to: codex ? 'Codex' : (args.assigned_to || 'Shloimie'),
      category: current.category || 'operations',
      source: 'web',
      created_by: context.userName || 'BNA Helper',
      parent_task_id: current.id,
      agent_executable: codex,
      task_kind: codex ? 'agent_job' : 'task',
      project_key: current.project_key || context.projectKey || undefined,
    }, { req: context.req }, db);
  await db.query(
    `UPDATE bna_tasks
     SET decision_status = $2,
         decision_route = $3,
         next_action_label = $4,
         next_action = $5,
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      current.id,
      codex ? 'sent_to_codex' : 'converted_to_task',
      codex ? 'codex' : 'my_task',
      codex ? 'Sent to Codex' : 'Converted to task',
      `Track linked task #${linked.id}`,
    ]
  );
  return helperResultCard({
    tool: codex ? 'send_decision_to_codex' : 'convert_decision_to_task',
    recordType: 'task',
    recordId: linked.id,
    label: taskLabel(linked),
    summary: codex ? `Sent decision #${current.id} to Codex as task #${linked.id}.` : `Converted decision #${current.id} to task #${linked.id}.`,
    data: { task: linked, decision_id: current.id },
  });
}

async function openOperationsViewTool({ args, context }) {
  const view = OPERATIONS_VIEWS.has(String(args.view || '').trim()) ? String(args.view || '').trim() : 'tasks';
  const params = new URLSearchParams();
  params.set('view', view);
  if (args.section) params.set('section', compactText(args.section, 80));
  if (args.workspace_key || context.workspaceKey) params.set('workspace', compactText(args.workspace_key || context.workspaceKey, 120));
  if (args.task_id) params.set('task', String(args.task_id));
  if (args.student_id) params.set('student', String(args.student_id));
  if (args.content_job_id) params.set('content_job', String(args.content_job_id));
  if (args.calendar_mode) params.set('calendar_mode', compactText(args.calendar_mode, 40));
  if (args.date) params.set('date', compactText(args.date, 40));
  const sectionLabel = args.section ? ` / ${args.section}` : '';
  return helperResultCard({
    tool: 'open_operations_view',
    recordType: 'operations_route',
    recordId: args.task_id || args.student_id || args.content_job_id || null,
    label: `Open ${view}${sectionLabel}`,
    summary: `Prepared an Operations link for ${view}${sectionLabel}.`,
    url: `/operations?${params.toString()}`,
    data: { view, section: args.section || null },
  });
}

async function auditQueueStatusTool({ args, context, deps }) {
  const snapshot = await deps.buildCodexQueueSnapshot(context.req, { limit: args.limit || 50 });
  return helperResultCard({
    tool: 'audit_queue_status',
    recordType: 'helper_audit',
    recordId: snapshot.queue?.latest_task?.id || null,
    label: 'Codex queue status',
    summary: `Codex queue: ${snapshot.queue?.queued || 0} queued, ${snapshot.queue?.running || 0} running, ${snapshot.queue?.blocked || 0} blocked.`,
    url: '/operations?view=tasks&section=tasks',
    data: snapshot,
  });
}

async function createSupportTicketTool({ args, context, deps, db }) {
  const project = await deps.resolveProjectFromInput({ project_key: args.project_key || context.projectKey || 'bna' }, db);
  deps.assertProjectAccess(context.req, project);
  const title = compactText(args.title || args.description || 'Helper support report', 180);
  const description = compactText(args.description || args.body || args.expected || title, 4000);
  const severity = normalizeEnum(args.severity, SUPPORT_TICKET_SEVERITIES, 'normal');
  const category = normalizeEnum(args.category, SUPPORT_TICKET_CATEGORIES, 'task_manager');
  const sourceContext = redactValue({
    source: 'bna_helper',
    page_context: context.pageContext || {},
    expected: args.expected || null,
    selected_record: context.selectedRecord || context.pageContext?.selectedRecord || null,
  });
  const result = await db.query(
    `INSERT INTO bna_support_tickets (
       project_id, title, description, severity, status, category,
       reporter_name, reporter_role, assigned_to, source, source_context, created_by
     )
     VALUES ($1, $2, $3, $4, 'open', $5, $6, $7, $8, 'dashboard', $9::jsonb, $10)
     RETURNING *`,
    [
      project.id,
      title,
      description || null,
      severity,
      category,
      context.userName || 'BNA Helper',
      context.userRole || 'admin',
      compactText(args.assigned_to || (['blocking', 'high'].includes(severity) ? 'Codex' : 'Shloimie'), 120),
      JSON.stringify(sourceContext),
      context.userName || 'BNA Helper',
    ]
  );
  const ticket = result.rows[0];
  return helperResultCard({
    tool: 'create_support_ticket',
    recordType: 'support_ticket',
    recordId: ticket.id,
    label: `Support ticket #${ticket.id}`,
    summary: `Created support ticket #${ticket.id}.`,
    url: '/operations?view=admin&section=tickets',
    data: { ticket },
  });
}

async function showTaskReportTool({ args, context, db }) {
  const params = [];
  const conditions = [];
  if (context.projectKey) {
    params.push(context.projectKey);
    conditions.push(`COALESCE(project_key, '') = $${params.length}`);
  }
  if (args.assigned_to) {
    params.push(args.assigned_to);
    conditions.push(`COALESCE(assigned_to, '') ILIKE '%' || $${params.length} || '%'`);
  }
  if (args.stage) {
    params.push(args.stage);
    conditions.push(`stage = $${params.length}`);
  }
  params.push(Math.max(1, Math.min(Number(args.limit || 25), 100)));
  const result = await db.query(
    `SELECT id, title, display_title, summary, stage, task_kind, assigned_to, waiting_on, agent_status, project_key, updated_at
     FROM bna_tasks
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY updated_at DESC NULLS LAST, id DESC
     LIMIT $${params.length}`,
    params
  );
  return helperResultCard({
    tool: 'show_task_report',
    recordType: 'helper_audit',
    recordId: null,
    label: 'Task report',
    summary: `Found ${result.rows.length} task rows for this report.`,
    url: '/operations?view=tasks',
    data: { tasks: result.rows },
  });
}

async function createStudentTool({ args, context, deps, db }) {
  const project = await deps.resolveProjectFromInput({ project_key: args.project_key || context.projectKey || 'bna' }, db);
  deps.assertProjectAccess(context.req, project);
  const result = await db.query(
    `INSERT INTO bna_students (
       project_id, workspace_id, name, name_en, parent_name, parent_email, parent_phone,
       age, grade, current_school, status, notes, tags
     ) VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11::text[])
     RETURNING *`,
    [
      project.id,
      args.name,
      args.name_en || args.name,
      args.parent_name || null,
      args.parent_email || null,
      args.parent_phone || null,
      args.age || null,
      args.grade || null,
      args.current_school || null,
      args.notes || null,
      args.tags || [],
    ]
  );
  const student = result.rows[0];
  return helperResultCard({
    tool: 'create_student',
    recordType: 'student',
    recordId: student.id,
    label: `Student #${student.id}`,
    summary: `Created student ${student.name}.`,
    data: { student },
  });
}

async function createContentItemTool({ args, context, deps, db }) {
  const project = await deps.resolveProjectFromInput({ project_key: args.project_key || context.projectKey || 'bna' }, db);
  deps.assertProjectAccess(context.req, project);
  const result = await db.query(
    `INSERT INTO bna_content_jobs (
       project_id, title, source_type, caption, media_url, local_path, status, transcript_text, notes, parse_json
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
     RETURNING *`,
    [
      project.id,
      args.title,
      normalizeEnum(args.source_type, CONTENT_SOURCE_TYPES, 'manual'),
      args.caption || args.notes || null,
      args.media_url || null,
      args.local_path || null,
      normalizeEnum(args.status, CONTENT_STATUSES, 'ingested'),
      args.transcript_text || null,
      args.notes || null,
      JSON.stringify({ source: 'bna_helper', created_by: context.userName || 'BNA Helper' }),
    ]
  );
  const job = result.rows[0];
  return helperResultCard({
    tool: 'create_content_item',
    recordType: 'content_job',
    recordId: job.id,
    label: `Content item #${job.id}`,
    summary: `Created content item #${job.id}.`,
    data: { job },
  });
}

function normalizeClassCount(value) {
  const number = Number(String(value || '').match(/\d+/)?.[0] || 0);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.max(1, Math.min(number, 52));
}

function normalizeBooleanInput(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const text = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'enabled', 'on'].includes(text)) return true;
  if (['false', '0', 'no', 'n', 'disabled', 'off'].includes(text)) return false;
  return fallback;
}

async function createProviderClassroomDraftTool({ args, context, deps, db }) {
  const projectKey = args.project_key || context.projectKey || 'one_time_mishnah_class';
  const project = await deps.resolveProjectFromInput({ project_key: projectKey }, db);
  deps.assertProjectAccess(context.req, project);
  const rawPrompt = compactText(args.raw_prompt || args.prompt || args.notes || args.title, 4000);
  const classCount = normalizeClassCount(args.class_count || rawPrompt);
  const setupPlan = {
    title: args.title,
    provider_id: args.provider_id || null,
    provider_name: args.provider_name || null,
    workspace_key: args.workspace_key || context.workspaceKey || null,
    project_key: project.project_key || projectKey,
    status: 'draft',
    class_count: classCount,
    community_dialogue_style: args.community_dialogue_style || 'Rabbi/teacher-led Q&A with private student replies',
    student_access: args.student_access || 'Provider-managed member/student access; BNA admin review before grants',
    display_rules: args.display_rules || 'Teacher-approved posts and responses only; internal classroom first',
    message_permissions: args.message_permissions || 'Students may reply privately to the teacher; no student-to-student chat unless explicitly enabled',
    student_to_teacher_replies: normalizeBooleanInput(args.student_to_teacher_replies, true),
    student_to_student_chat_enabled: normalizeBooleanInput(args.student_to_student_chat_enabled, false),
    teacher_moderation_required: normalizeBooleanInput(args.teacher_moderation_required, true),
    public_display_enabled: normalizeBooleanInput(args.public_display_enabled, false),
  };
  const setupQuestions = [
    classCount ? null : 'How many classes or weeks should this classroom start with?',
    args.community_dialogue_style ? null : 'What dialogue style should this use?',
    args.student_access ? null : 'Who should receive student/member access first?',
    args.display_rules ? null : 'What may appear on the public/community display after teacher approval?',
    args.message_permissions ? null : 'Should student-to-student chat stay off?',
  ].filter(Boolean);
  const notes = [
    rawPrompt ? `Raw prompt: ${rawPrompt}` : '',
    `Class count: ${classCount || 'needs provider answer'}`,
    `Dialogue style: ${setupPlan.community_dialogue_style}`,
    `Student access: ${setupPlan.student_access}`,
    `Display rules: ${setupPlan.display_rules}`,
    `Message permissions: ${setupPlan.message_permissions}`,
    `Moderation: private student-to-teacher replies, no student-student chat unless enabled, teacher moderation/publish queue.`,
    setupQuestions.length ? `Open setup questions:\n- ${setupQuestions.join('\n- ')}` : '',
  ].filter(Boolean).join('\n');
  const task = await deps.createTaskFromText({
    title: args.title,
    raw_text: rawPrompt || args.title,
    notes,
    summary: `Provider classroom/community setup draft for ${setupPlan.provider_name || setupPlan.workspace_key || project.project_key}.`,
    assigned_to: args.assigned_to || 'Shloimie',
    category: 'community_setup',
    urgency: 'this_week',
    source: 'web',
    created_by: context.userName || 'BNA Helper',
    stage: 'assigned',
    task_kind: 'provider_classroom_draft',
    project_key: project.project_key || projectKey,
    ai_parsed: {
      parser: 'bna-helper-tool-registry',
      kind: 'provider_classroom_draft',
      action_id: 'create_provider_classroom_draft',
      setup_plan: setupPlan,
      setup_questions: setupQuestions,
      no_external_write: true,
      no_google_classroom_write: true,
      no_payment_or_access_grant: true,
    },
  }, { req: context.req }, db);
  return helperResultCard({
    tool: 'create_provider_classroom_draft',
    recordType: 'task',
    recordId: task.id,
    label: taskLabel(task),
    summary: `Created provider classroom setup draft #${task.id}. No external classroom, message, payment, or access write was performed.`,
    url: helperResultLink('task', task.id),
    data: { task, setup_plan: setupPlan, setup_questions: setupQuestions },
  });
}

async function draftSocialPostTool({ args, context, deps, db }) {
  const platform = normalizePlatform(args.platform);
  let jobId = Number(args.content_job_id || 0);
  if (!jobId) {
    const created = await createContentItemTool({
      args: {
        title: args.title || `${platform.replace(/_/g, ' ')} draft`,
        caption: args.text,
        notes: args.text,
        status: 'needs_approval',
        project_key: args.project_key,
      },
      context,
      deps,
      db,
    });
    jobId = Number(created.record_id);
  } else {
    await deps.assertProjectOwnedRowAccess(context.req, 'bna_content_jobs', jobId, db);
  }
  const output = (await db.query(
    `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
     VALUES ($1, $2, $3, $4, $5, 'draft', $6::jsonb)
     RETURNING *`,
    [
      jobId,
      socialOutputType(platform),
      args.title || `${platform.replace(/_/g, ' ')} draft`,
      args.text,
      platform,
      JSON.stringify({ source: 'bna_helper', scheduled_at: args.scheduled_at || null, media_url: args.media_url || null, external_post_created: false }),
    ]
  )).rows[0];
  return helperResultCard({
    tool: 'draft_social_post',
    recordType: 'content_job',
    recordId: jobId,
    label: `${platform} draft`,
    summary: `Created a local ${platform} draft. No external post was scheduled or published.`,
    data: { output, scheduled: false },
  });
}

async function draftEmailTool({ args }) {
  return helperResultCard({
    tool: 'draft_email',
    recordType: 'helper_audit',
    recordId: null,
    label: 'Email draft',
    summary: `Prepared email draft: ${args.subject}. No email was sent.`,
    data: {
      to: args.to || null,
      subject: args.subject,
      body: args.body,
      purpose: args.purpose || null,
      sent: false,
    },
  });
}

async function scheduleSocialPostViaBufferTool({ args, context, deps, db }) {
  const blocker = await createSetupBlocker({
    deps,
    db,
    context,
    title: 'Connect Buffer before scheduling social posts',
    blocker: 'BNA Helper received a Buffer scheduling request, but no Buffer scheduling adapter is configured. Create/confirm Buffer API credentials and hosted media URL policy before enabling live scheduling.',
    assignedTo: 'Shloimie',
    projectKey: args.project_key || context.projectKey,
  });
  const draft = await draftSocialPostTool({
    args: {
      platform: args.platform,
      text: args.text,
      scheduled_at: args.scheduled_at,
      media_url: args.media_url,
      title: `Manual ${normalizePlatform(args.platform)} scheduling draft`,
      project_key: args.project_key,
    },
    context,
    deps,
    db,
  });
  return helperResultCard({
    ok: false,
    tool: 'schedule_social_post_via_buffer',
    recordType: 'task',
    recordId: blocker.id,
    label: taskLabel(blocker),
    summary: 'Buffer scheduling is not configured. Created a setup blocker and a local manual draft instead.',
    status: 'missing_integration',
    data: { scheduled: false, setup_blocker: blocker, fallback_draft: draft },
  });
}

async function sendEmailTool({ args, context, deps, db }) {
  const configured = deps.isGmailConfigured ? deps.isGmailConfigured() : false;
  if (!configured) {
    const blocker = await createSetupBlocker({
      deps,
      db,
      context,
      title: 'Connect Gmail before BNA Helper can send email',
      blocker: 'Gmail OAuth refresh token is not configured for this runtime. The Helper prepared a draft only.',
      assignedTo: 'Shloimie',
      projectKey: context.projectKey,
    });
    const draft = await draftEmailTool({ args });
    return helperResultCard({
      ok: false,
      tool: 'send_email',
      recordType: 'task',
      recordId: blocker.id,
      label: taskLabel(blocker),
      summary: 'Gmail is not configured. Created a setup blocker and returned a draft. No email was sent.',
      status: 'missing_integration',
      data: { sent: false, setup_blocker: blocker, draft },
    });
  }
  const result = await deps.sendGmailMessage({
    to: args.to,
    subject: args.subject,
    text: args.text || args.body || '',
    html: args.html || null,
    workspace: context.workspaceKey || context.projectKey || null,
  });
  await db.query(
    `INSERT INTO bna_email_log (email_type, recipient_email, subject, body_text, body_html, provider, provider_message_id, status, metadata)
     VALUES ('helper_send_email', $1, $2, $3, $4, $5, $6, 'sent', $7::jsonb)`,
    [
      args.to,
      args.subject,
      args.text || args.body || '',
      args.html || null,
      result.provider || 'gmail',
      result.data?.id || result.data?.messageId || null,
      JSON.stringify({ source: 'bna_helper', user: context.userName || null }),
    ]
  ).catch(() => null);
  return helperResultCard({
    tool: 'send_email',
    recordType: 'helper_audit',
    recordId: null,
    label: 'Email sent',
    summary: `Sent email to ${args.to}.`,
    data: { sent: true, provider: result.provider, provider_id: result.data?.id || null },
  });
}

function unsupportedFallbackTool(toolName) {
  return async ({ args, context, deps, db }) => {
    const label = toolName.replace(/_/g, ' ');
    const task = await createSetupBlocker({
      deps,
      db,
      context,
      title: `Define ${label} before BNA Helper executes it`,
      blocker: `The Helper understood a request for ${label}, but this first pass only supports a blocker/manual fallback for that tool.`,
      assignedTo: 'Codex',
      projectKey: args.project_key || context.projectKey,
    });
    return helperResultCard({
      ok: false,
      tool: toolName,
      recordType: 'task',
      recordId: task.id,
      label: taskLabel(task),
      summary: `${label} is not fully wired yet. Created setup blocker #${task.id}.`,
      status: 'fallback_created',
      data: { fallback: true, setup_blocker: task },
    });
  };
}

function buildToolRegistry(deps = {}) {
  const tools = [
    makeDefinition({
      name: 'capture_raw_intake',
      description: 'Capture natural language as raw intake, parse it into BNA lanes, and return raw ID plus counts.',
      category: 'intake',
      risk: 'medium',
      schema: {
        raw_text: { type: 'string', required: true, maxLength: 20000 },
        source_type: { type: 'string', maxLength: 80, default: 'operations_helper' },
        source_channel: { type: 'string', maxLength: 80, default: 'operations_helper' },
        source_date: { type: 'string', maxLength: 40 },
        intake_type: { type: 'string', maxLength: 80, default: 'helper' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, captureRawIntakeTool),
    makeDefinition({
      name: 'show_goal_status',
      description: 'Show standing BNA goals or goals related to supplied text.',
      category: 'watchdog',
      schema: {
        text: { type: 'string', maxLength: 4000 },
        goal_id: { type: 'string', maxLength: 80 },
      },
    }, showGoalStatusTool),
    makeDefinition({
      name: 'run_watchdog_audit',
      description: 'Create a Codex-owned request to run a local-safe watchdog audit.',
      category: 'watchdog',
      risk: 'medium',
      schema: {
        title: { type: 'string', maxLength: 240 },
        command: { type: 'string', maxLength: 240, default: 'npm run watchdog:audit' },
        reason: { type: 'string', maxLength: 2000 },
        notes: { type: 'string', maxLength: 2000 },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, runWatchdogAuditTool),
    makeDefinition({
      name: 'create_task',
      description: 'Create an Operations task.',
      category: 'tasks',
      schema: {
        title: { type: 'string', required: true, maxLength: 240 },
        notes: { type: 'string', maxLength: 10000 },
        summary: { type: 'string', maxLength: 1000 },
        assigned_to: { type: 'string', maxLength: 120 },
        category: { type: 'string', maxLength: 80, default: 'operations' },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        stage: { type: 'string', maxLength: 40, default: 'assigned' },
        due_date: { type: 'string', maxLength: 40 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createTaskTool),
    makeDefinition({
      name: 'update_task',
      description: 'Update a task title, status, assignment, notes, or due date.',
      category: 'tasks',
      risk: 'medium',
      requiresConfirmation: false,
      schema: {
        task_id: { type: 'integer', required: true },
        title: { type: 'string', maxLength: 240 },
        notes: { type: 'string', maxLength: 10000 },
        summary: { type: 'string', maxLength: 1000 },
        stage: { type: 'string', maxLength: 40 },
        category: { type: 'string', maxLength: 80 },
        urgency: { type: 'string', maxLength: 40 },
        assigned_to: { type: 'string', maxLength: 120 },
        due_date: { type: 'string', maxLength: 40 },
      },
    }, updateTaskTool),
    makeDefinition({
      name: 'add_task_comment',
      description: 'Add a comment to an Operations task.',
      category: 'tasks',
      schema: {
        task_id: { type: 'integer', required: true },
        body: { type: 'string', required: true, maxLength: 4000 },
      },
    }, addTaskCommentTool),
    makeDefinition({
      name: 'mark_task_done',
      description: 'Mark a task done with verification notes.',
      category: 'tasks',
      risk: 'medium',
      schema: {
        task_id: { type: 'integer', required: true },
        verification_notes: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 4000 },
        proof_url: { type: 'string', maxLength: 1000 },
      },
    }, markTaskDoneTool),
    makeDefinition({
      name: 'create_pending_blocker',
      description: 'Create a Pending/access blocker task.',
      category: 'tasks',
      schema: {
        title: { type: 'string', required: true, maxLength: 240 },
        blocker: { type: 'string', required: true, maxLength: 4000 },
        needed_from: { type: 'string', maxLength: 120 },
        assigned_to: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createPendingBlockerTool),
    makeDefinition({
      name: 'request_missing_input',
      description: 'Request missing access or input, attached to a task when possible.',
      category: 'tasks',
      schema: {
        prompt: { type: 'string', required: true, maxLength: 4000 },
        task_id: { type: 'integer' },
        title: { type: 'string', maxLength: 240 },
        needed_from: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, requestMissingInputTool),
    makeDefinition({
      name: 'create_decision',
      description: 'Create a decision card.',
      category: 'decisions',
      schema: {
        title: { type: 'string', required: true, maxLength: 240 },
        context: { type: 'string', maxLength: 10000 },
        options: { type: 'array', maxItems: 12 },
        owner: { type: 'string', maxLength: 120 },
        category: { type: 'string', maxLength: 80, default: 'operations' },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createDecisionTool),
    makeDefinition({
      name: 'add_decision_comment',
      description: 'Add a comment to a decision card.',
      category: 'decisions',
      schema: {
        decision_id: { type: 'integer', required: true },
        body: { type: 'string', required: true, maxLength: 4000 },
      },
    }, addDecisionCommentTool),
    makeDefinition({
      name: 'convert_decision_to_task',
      description: 'Convert a decision to a linked task.',
      category: 'decisions',
      schema: {
        decision_id: { type: 'integer', required: true },
        title: { type: 'string', maxLength: 240 },
        notes: { type: 'string', maxLength: 10000 },
        assigned_to: { type: 'string', maxLength: 120 },
      },
    }, (payload) => convertDecisionTool({ ...payload, codex: false })),
    makeDefinition({
      name: 'send_decision_to_codex',
      description: 'Create a linked Codex task from a decision.',
      category: 'decisions',
      schema: {
        decision_id: { type: 'integer', required: true },
        title: { type: 'string', maxLength: 240 },
        notes: { type: 'string', maxLength: 10000 },
      },
    }, (payload) => convertDecisionTool({ ...payload, codex: true })),
    makeDefinition({
      name: 'open_operations_view',
      description: 'Open a scoped Operations view, lane, record detail, or calendar route.',
      category: 'navigation',
      schema: {
        view: { type: 'string', required: true, maxLength: 80 },
        section: { type: 'string', maxLength: 80 },
        task_id: { type: 'integer' },
        student_id: { type: 'integer' },
        content_job_id: { type: 'integer' },
        calendar_mode: { type: 'string', maxLength: 40 },
        date: { type: 'string', maxLength: 40 },
        workspace_key: { type: 'string', maxLength: 120 },
      },
    }, openOperationsViewTool),
    makeDefinition({
      name: 'create_codex_work_item',
      description: 'Create a Codex-owned machine work item.',
      category: 'codex',
      schema: {
        title: { type: 'string', required: true, maxLength: 240 },
        brief: { type: 'string', maxLength: 10000 },
        notes: { type: 'string', maxLength: 10000 },
        summary: { type: 'string', maxLength: 1000 },
        category: { type: 'string', maxLength: 80, default: 'technology' },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createCodexWorkItemTool),
    makeDefinition({
      name: 'audit_queue_status',
      description: 'Show Codex queue status.',
      category: 'codex',
      schema: { limit: { type: 'integer', default: 50 } },
    }, auditQueueStatusTool),
    makeDefinition({
      name: 'show_task_report',
      description: 'Show a compact task report.',
      category: 'reports',
      schema: {
        stage: { type: 'string', maxLength: 40 },
        assigned_to: { type: 'string', maxLength: 120 },
        limit: { type: 'integer', default: 25 },
      },
    }, showTaskReportTool),
    makeDefinition({
      name: 'create_support_ticket',
      description: 'Create a first-party Operations support ticket or problem report.',
      category: 'support',
      risk: 'medium',
      schema: {
        title: { type: 'string', required: true, maxLength: 180 },
        description: { type: 'string', maxLength: 4000 },
        expected: { type: 'string', maxLength: 2000 },
        severity: { type: 'string', maxLength: 40, default: 'normal' },
        category: { type: 'string', maxLength: 80, default: 'task_manager' },
        assigned_to: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createSupportTicketTool),
    makeDefinition({
      name: 'create_student',
      description: 'Create a BNA student record.',
      category: 'students',
      risk: 'medium',
      schema: {
        name: { type: 'string', required: true, maxLength: 180 },
        name_en: { type: 'string', maxLength: 180 },
        parent_name: { type: 'string', maxLength: 180 },
        parent_email: { type: 'string', maxLength: 240 },
        parent_phone: { type: 'string', maxLength: 80 },
        age: { type: 'integer' },
        grade: { type: 'string', maxLength: 80 },
        current_school: { type: 'string', maxLength: 180 },
        notes: { type: 'string', maxLength: 4000 },
        tags: { type: 'array', maxItems: 20 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createStudentTool),
    makeDefinition({
      name: 'create_content_item',
      description: 'Create a local content-library item.',
      category: 'content',
      schema: {
        title: { type: 'string', required: true, maxLength: 240 },
        source_type: { type: 'string', maxLength: 80, default: 'manual' },
        caption: { type: 'string', maxLength: 4000 },
        media_url: { type: 'string', maxLength: 1000 },
        local_path: { type: 'string', maxLength: 1000 },
        transcript_text: { type: 'string', maxLength: 20000 },
        notes: { type: 'string', maxLength: 4000 },
        status: { type: 'string', maxLength: 80, default: 'ingested' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createContentItemTool),
    makeDefinition({
      name: 'draft_social_post',
      description: 'Create a local social post draft only.',
      category: 'communications',
      schema: {
        platform: { type: 'string', required: true, maxLength: 80 },
        text: { type: 'string', required: true, maxLength: 4000 },
        title: { type: 'string', maxLength: 240 },
        content_job_id: { type: 'integer' },
        scheduled_at: { type: 'string', maxLength: 80 },
        media_url: { type: 'string', maxLength: 1000 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftSocialPostTool),
    makeDefinition({
      name: 'draft_email',
      description: 'Create an email draft only.',
      category: 'communications',
      schema: {
        to: { type: 'string', maxLength: 240 },
        subject: { type: 'string', required: true, maxLength: 240 },
        body: { type: 'string', required: true, maxLength: 10000 },
        purpose: { type: 'string', maxLength: 240 },
      },
    }, draftEmailTool),
    makeDefinition({
      name: 'schedule_social_post_via_buffer',
      description: 'Schedule through Buffer only if a real Buffer scheduling adapter is configured.',
      category: 'communications',
      risk: 'high',
      requiresConfirmation: true,
      available: false,
      unavailableReason: 'missing_integration',
      schema: {
        platform: { type: 'string', required: true, maxLength: 80 },
        text: { type: 'string', required: true, maxLength: 4000 },
        scheduled_at: { type: 'string', required: true, maxLength: 80 },
        media_url: { type: 'string', maxLength: 1000 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, scheduleSocialPostViaBufferTool),
    makeDefinition({
      name: 'send_email',
      description: 'Send an email through Gmail when configured.',
      category: 'communications',
      risk: 'high',
      requiresConfirmation: true,
      schema: {
        to: { type: 'string', required: true, maxLength: 240 },
        subject: { type: 'string', required: true, maxLength: 240 },
        text: { type: 'string', maxLength: 10000 },
        body: { type: 'string', maxLength: 10000 },
        html: { type: 'string', maxLength: 12000 },
      },
    }, sendEmailTool),
    makeDefinition({
      name: 'show_integration_status',
      description: 'Show provider-scoped integration status without returning secrets.',
      category: 'integrations',
      schema: {
        integration_type: { type: 'string', maxLength: 80 },
        provider_id: { type: 'integer' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showIntegrationStatusTool),
    makeDefinition({
      name: 'create_integration_setup_task',
      description: 'Create or update a provider integration setup task and readiness record.',
      category: 'integrations',
      risk: 'medium',
      schema: {
        integration_type: { type: 'string', required: true, maxLength: 80 },
        provider_id: { type: 'integer' },
        title: { type: 'string', maxLength: 240 },
        reason: { type: 'string', maxLength: 2000 },
        notes: { type: 'string', maxLength: 2000 },
        status: { type: 'string', maxLength: 80 },
        needed_from: { type: 'string', maxLength: 180 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createIntegrationSetupTaskTool),
    makeDefinition({
      name: 'create_automation',
      description: 'Create a local Automation Center workflow or billing workflow draft without running external actions.',
      category: 'automations',
      risk: 'medium',
      requiresConfirmation: true,
      schema: {
        name: { type: 'string', required: true, maxLength: 180 },
        summary: { type: 'string', maxLength: 900 },
        description: { type: 'string', maxLength: 4000 },
        action: { type: 'string', maxLength: 4000 },
        trigger: { type: 'string', maxLength: 180 },
        trigger_label: { type: 'string', maxLength: 180 },
        package_key: { type: 'string', maxLength: 80 },
        package_name: { type: 'string', maxLength: 180 },
        service_key: { type: 'string', maxLength: 80 },
        service_name: { type: 'string', maxLength: 180 },
        status: { type: 'string', maxLength: 40, default: 'draft' },
        automation_type: { type: 'string', maxLength: 40, default: 'workflow' },
        channel: { type: 'string', maxLength: 80 },
        audience: { type: 'string', maxLength: 900 },
        setup_blockers: { type: 'array', maxItems: 20 },
        owner: { type: 'string', maxLength: 120 },
        responsible_person: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
        raw_prompt: { type: 'string', maxLength: 4000 },
      },
    }, createAutomationTool),
    makeDefinition({
      name: 'update_automation',
      description: 'Edit, pause, disable, or re-enable local Automation Center metadata without running the automation.',
      category: 'automations',
      risk: 'medium',
      requiresConfirmation: true,
      schema: {
        automation_id: { type: 'integer' },
        automation_key: { type: 'string', maxLength: 180 },
        name: { type: 'string', maxLength: 180 },
        summary: { type: 'string', maxLength: 900 },
        description: { type: 'string', maxLength: 4000 },
        action: { type: 'string', maxLength: 4000 },
        status: { type: 'string', maxLength: 40 },
        enabled: { type: 'boolean' },
        trigger: { type: 'string', maxLength: 180 },
        trigger_label: { type: 'string', maxLength: 180 },
        setup_blockers: { type: 'array', maxItems: 20 },
        blocker: { type: 'string', maxLength: 300 },
        reason: { type: 'string', maxLength: 1000 },
        change_note: { type: 'string', maxLength: 1000 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, updateAutomationTool),
    makeDefinition({
      name: 'save_provider_api_key',
      description: 'Register a provider-owned secret reference and fingerprint without returning the raw key.',
      category: 'integrations',
      risk: 'high',
      requiresConfirmation: true,
      schema: {
        integration_type: { type: 'string', required: true, maxLength: 80 },
        provider_id: { type: 'integer' },
        key_input: { type: 'string', maxLength: 4000 },
        api_key: { type: 'string', maxLength: 4000 },
        token: { type: 'string', maxLength: 4000 },
        secret_type: { type: 'string', maxLength: 80, default: 'api_key' },
        secret_ref: { type: 'string', maxLength: 240 },
        secret_label: { type: 'string', maxLength: 180 },
        connected_account_label: { type: 'string', maxLength: 180 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, saveProviderApiKeyTool),
    makeDefinition({
      name: 'rotate_provider_api_key',
      description: 'Mark a provider integration key as needing rotation and retest.',
      category: 'integrations',
      risk: 'medium',
      requiresConfirmation: true,
      schema: {
        integration_type: { type: 'string', required: true, maxLength: 80 },
        provider_id: { type: 'integer' },
        reason: { type: 'string', maxLength: 1000 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, rotateProviderApiKeyTool),
    makeDefinition({
      name: 'test_resend_connection',
      description: 'Run a safe Resend readiness check without sending email.',
      category: 'integrations',
      schema: {
        provider_id: { type: 'integer' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, (params) => testIntegrationConnectionTool(params, 'resend')),
    makeDefinition({
      name: 'test_buffer_connection',
      description: 'Run a safe Buffer readiness check without scheduling or publishing.',
      category: 'integrations',
      schema: {
        provider_id: { type: 'integer' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, (params) => testIntegrationConnectionTool(params, 'buffer')),
    makeDefinition({
      name: 'test_vimeo_connection',
      description: 'Run a safe Vimeo auth/readiness check; no upload is performed.',
      category: 'integrations',
      schema: {
        provider_id: { type: 'integer' },
        token: { type: 'string', maxLength: 4000 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, (params) => testIntegrationConnectionTool(params, 'vimeo')),
    makeDefinition({
      name: 'test_wapi_connection',
      description: 'Run a safe WAPI/WhatsApp readiness check without sending.',
      category: 'integrations',
      schema: {
        provider_id: { type: 'integer' },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, (params) => testIntegrationConnectionTool(params, 'wapi')),
    makeDefinition({
      name: 'mark_integration_blocked_until_thursday',
      description: 'Mark an integration as blocked for the Thursday owner-access session.',
      category: 'integrations',
      risk: 'medium',
      schema: {
        integration_type: { type: 'string', required: true, maxLength: 80 },
        provider_id: { type: 'integer' },
        reason: { type: 'string', maxLength: 2000 },
        needed_from: { type: 'string', maxLength: 180 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, markIntegrationBlockedUntilThursdayTool),
    makeDefinition({
      name: 'create_dns_setup_task',
      description: 'Create a DNS setup checklist row without inventing record values.',
      category: 'integrations',
      risk: 'medium',
      schema: {
        provider: { type: 'string', maxLength: 80, default: 'resend' },
        integration_type: { type: 'string', maxLength: 80 },
        provider_id: { type: 'integer' },
        domain: { type: 'string', required: true, maxLength: 240 },
        purpose: { type: 'string', maxLength: 80, default: 'verification' },
        record_type: { type: 'string', maxLength: 20, default: 'TXT' },
        host: { type: 'string', maxLength: 240 },
        value: { type: 'string', maxLength: 2000 },
        ttl: { type: 'integer' },
        priority: { type: 'integer' },
        notes: { type: 'string', maxLength: 2000 },
        source: { type: 'string', maxLength: 120 },
      },
    }, createDnsSetupTaskTool),
    makeDefinition({
      name: 'prepare_vimeo_upload',
      description: 'Prepare a Vimeo upload intent; no upload is performed.',
      category: 'video',
      risk: 'high',
      requiresConfirmation: true,
      schema: {
        content_id: { type: 'integer' },
        title: { type: 'string', maxLength: 240 },
        token: { type: 'string', maxLength: 4000 },
        account_owner: { type: 'string', maxLength: 180 },
        vimeo_plan: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, prepareVimeoUploadTool),
    makeDefinition({
      name: 'mark_manual_vimeo_upload_needed',
      description: 'Create a task for manual Vimeo upload and later URL attachment.',
      category: 'video',
      schema: {
        title: { type: 'string', maxLength: 240 },
        reason: { type: 'string', maxLength: 2000 },
        needed_from: { type: 'string', maxLength: 180 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, markManualVimeoUploadNeededTool),
    makeDefinition({
      name: 'attach_vimeo_url_to_library_item',
      description: 'Attach a manually uploaded Vimeo URL to a local content/library item for approval.',
      category: 'video',
      risk: 'medium',
      schema: {
        content_id: { type: 'integer' },
        vimeo_url: { type: 'string', required: true, maxLength: 1000 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, attachVimeoUrlToLibraryItemTool),
    makeDefinition({
      name: 'create_provider_classroom_draft',
      description: 'Create a first-party provider classroom/community setup draft from natural language.',
      category: 'community',
      risk: 'medium',
      schema: {
        title: { type: 'string', required: true, maxLength: 240 },
        raw_prompt: { type: 'string', maxLength: 4000 },
        provider_id: { type: 'integer' },
        provider_name: { type: 'string', maxLength: 180 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120, default: 'one_time_mishnah_class' },
        class_count: { type: 'integer' },
        community_dialogue_style: { type: 'string', maxLength: 240 },
        student_access: { type: 'string', maxLength: 240 },
        display_rules: { type: 'string', maxLength: 280 },
        message_permissions: { type: 'string', maxLength: 300 },
        student_to_teacher_replies: { type: 'boolean' },
        student_to_student_chat_enabled: { type: 'boolean' },
        teacher_moderation_required: { type: 'boolean' },
        public_display_enabled: { type: 'boolean' },
        assigned_to: { type: 'string', maxLength: 120 },
      },
    }, createProviderClassroomDraftTool),
    ...FALLBACK_ONLY_TOOL_NAMES.map((name) => makeDefinition({
      name,
      description: `${name.replace(/_/g, ' ')} fallback/setup blocker.`,
      category: 'fallback',
      risk: 'medium',
      requiresConfirmation: false,
      available: false,
      unavailableReason: 'fallback_only',
      schema: {
        title: { type: 'string', maxLength: 240 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, unsupportedFallbackTool(name))),
  ];

  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  return {
    deps,
    tools,
    byName,
    get(name) {
      return byName.get(String(name || '').trim()) || null;
    },
    metadata(context = {}) {
      return tools.map((tool) => {
        const permission = helperPermissionForTool(tool, context, {});
        return {
          name: tool.name,
          description: tool.description,
          category: tool.category,
          risk: tool.risk,
          side_effect_level: tool.sideEffectLevel,
          allowed_scopes: tool.allowedScopes,
          required_role: tool.requiredRole,
          confirmation_policy: tool.confirmationPolicy,
          available: Boolean(tool.available && permission.allowed),
          unavailable_reason: !tool.available ? tool.unavailableReason || 'unavailable' : permission.allowed ? null : permission.reason,
          requires_confirmation: Boolean(tool.requiresConfirmation),
        };
      });
    },
    validate(name, args = {}) {
      const tool = byName.get(name);
      if (!tool) return { ok: false, errors: ['tool_not_found'], args: {} };
      return validateArgs(tool.schema, args);
    },
    async execute(name, args, context = {}, db = deps.db) {
      const tool = byName.get(name);
      if (!tool) throw Object.assign(new Error('tool_not_found'), { code: 'tool_not_found', statusCode: 404 });
      const validation = validateArgs(tool.schema, args);
      if (!validation.ok) {
        const error = new Error(validation.errors.join('; '));
        error.code = 'schema_validation_failed';
        error.statusCode = 400;
        error.validation_errors = validation.errors;
        throw error;
      }
      const permission = helperPermissionForTool(tool, context, validation.args);
      if (!permission.allowed) {
        const error = new Error(permission.reason || 'permission_denied');
        error.code = 'permission_denied';
        error.statusCode = 403;
        throw error;
      }
      const result = await tool.handler({ args: validation.args, context, deps, db, tool });
      return {
        ...result,
        args_preview: redactValue(validation.args),
      };
    },
  };
}

function safeToolForClient(tool) {
  return {
    name: tool.name,
    description: tool.description,
    category: tool.category,
    risk: tool.risk,
    side_effect_level: tool.sideEffectLevel,
    allowed_scopes: tool.allowedScopes,
    required_role: tool.requiredRole,
    confirmation_policy: tool.confirmationPolicy,
    available: Boolean(tool.available),
    requires_confirmation: Boolean(tool.requiresConfirmation),
  };
}

module.exports = {
  FALLBACK_ONLY_TOOL_NAMES,
  REQUIRED_HELPER_TOOL_NAMES,
  buildToolRegistry,
  safeToolForClient,
  validateArgs,
};
