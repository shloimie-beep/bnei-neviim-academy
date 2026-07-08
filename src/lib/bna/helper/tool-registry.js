const crypto = require('crypto');
const { confirmationPolicyForTool, inferSideEffectLevel } = require('./confirmation-gates');
const { resolveHelperDestination } = require('./destination-resolver');
const { helperPermissionForTool, normalizeWorkspaceKey } = require('./permissions');
const { redactText, redactValue } = require('./redaction');
const { helperResultCard, helperResultLink } = require('./result-links');
const { notifySuperAdminSupportTicket } = require('../telegram-notifications');
const vimeoIntegration = require('../../integrations/vimeo');
const { parseIntakeText } = require('../intake-parser');
const { extractedItemCounts, normalizeSourceChannel } = require('../ramble-protocol');
const { STANDING_GOALS, affectedGoalIdsForText } = require('../goal-registry');
const { runAction } = require('../../actions/runner');

const RABBI_WORKSPACE_KEY = 'rabbi_sheller_provider';
const RABBI_PROJECT_KEY = 'one_time_mishnah_class';

const REQUIRED_HELPER_TOOL_NAMES = [
  'create_task',
  'create_rabbi_shiur_idea',
  'create_rabbi_source_sheet_task',
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
  'route_bug_to_codex',
  'audit_queue_status',
  'show_task_report',
  'show_one_time_launch_checklist',
  'list_calendar_sessions',
  'open_calendar_event',
  'view_email_log',
  'show_contact_communication_history',
  'list_provider_leads',
  'open_content_item_url',
  'list_students',
  'show_assignments',
  'show_my_assignments',
  'show_my_goals',
  'show_parent_students',
  'show_student_progress',
  'show_student_progress_for_parent',
  'show_child_calendar',
  'view_parent_visible_notes',
  'calendar_batch_launch_plan_preview',
  'classroom_topic_material_preview',
  'google_drive_find_file_preview',
  'google_drive_create_doc_preview',
  'google_drive_create_folder_preview',
  'google_business_place_id_lookup',
  'google_business_list_locations_preview',
  'add_decision_option',
  'add_timeline_note',
  'create_calendar_event',
  'update_calendar_event',
  'create_parent_visible_event',
  'mark_event_admin_only',
  'create_provider_class_session',
  'create_referral_ledger_entry',
  'request_provider_contact',
  'retitle_task_naturally',
  'update_task_stage',
  'create_calendar_event_draft',
  'update_calendar_event_draft',
  'create_shoutout_draft',
  'distill_ramble',
  'draft_automation',
  'draft_drip_sequence',
  'draft_email_campaign',
  'draft_email_from_newsletter',
  'draft_mishnayos_landing_page',
  'find_latest_newsletter_draft',
  'generate_social_posts_from_newsletter',
  'generate_student_worksheet',
  'preview_campaign_segment',
  'refine_email',
  'refine_newsletter_draft',
  'draft_message_to_admin',
  'create_support_ticket',
  'create_report_problem_ticket',
  'create_ticket',
  'create_help_request',
  'capture_raw_intake',
  'capture_ramble',
  'show_goal_status',
  'show_operating_goals',
  'run_watchdog_audit',
  'create_student',
  'create_content_item',
  'draft_social_post',
  'draft_email',
  'draft_parent_response',
  'draft_weekly_update',
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

function delegatedResult(result, aliasToolName, delegatedToolName, extraData = {}) {
  const resultData = result?.data && typeof result.data === 'object' && !Array.isArray(result.data)
    ? result.data
    : { delegated_result: result?.data || null };
  return {
    ...result,
    tool: aliasToolName,
    data: {
      ...resultData,
      ...extraData,
      delegated_tool: delegatedToolName,
    },
  };
}

async function captureRambleTool(payload) {
  const { args } = payload;
  const result = await captureRawIntakeTool({
    ...payload,
    args: {
      raw_text: args.raw_text || args.text || args.message || args.prompt,
      source_type: args.source_type || 'operations_helper',
      source_channel: args.source_channel || 'operations_helper',
      source_date: args.source_date || null,
      intake_type: args.intake_type || 'helper',
      project_key: args.project_key || undefined,
    },
  });
  return delegatedResult(result, 'capture_ramble', 'capture_raw_intake');
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

async function showOperatingGoalsTool(payload) {
  const result = await showGoalStatusTool({
    ...payload,
    args: { text: payload.args.text || payload.args.goal_text || '' },
  });
  return delegatedResult(result, 'show_operating_goals', 'show_goal_status');
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

function rabbiScopeError(reason) {
  const error = new Error(`permission_denied: ${reason}`);
  error.code = 'permission_denied';
  error.statusCode = 403;
  return error;
}

function explicitArgValue(args = {}, ...keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(args, key) && args[key] !== undefined && args[key] !== null && args[key] !== '') {
      return args[key];
    }
  }
  return '';
}

function rabbiProjectKey(args = {}, context = {}) {
  const explicitProject = explicitArgValue(args, 'project_key', 'project');
  if (explicitProject && normalizeProjectKey(explicitProject) !== RABBI_PROJECT_KEY) {
    throw rabbiScopeError('Rabbi helper project scope mismatch');
  }
  const scopedProject = context.identity?.scope?.projectKey || context.identity?.scope?.project_key || '';
  if (context.identity?.scope?.type === 'project' && scopedProject && normalizeProjectKey(scopedProject) !== RABBI_PROJECT_KEY) {
    throw rabbiScopeError('Rabbi helper project scope mismatch');
  }
  return RABBI_PROJECT_KEY;
}

function rabbiWorkspaceKey(args = {}, context = {}) {
  const explicitWorkspace = explicitArgValue(args, 'workspace_key', 'workspace');
  if (explicitWorkspace && normalizeWorkspaceKey(explicitWorkspace) !== RABBI_WORKSPACE_KEY) {
    throw rabbiScopeError('Rabbi helper workspace scope mismatch');
  }
  const scopedWorkspace = context.identity?.scope?.workspaceKey
    || context.identity?.scope?.workspace_key
    || context.helperScope?.workspaceKey
    || context.helperScope?.workspace_key
    || '';
  if (scopedWorkspace && normalizeWorkspaceKey(scopedWorkspace) !== RABBI_WORKSPACE_KEY) {
    throw rabbiScopeError('Rabbi helper workspace scope mismatch');
  }
  return RABBI_WORKSPACE_KEY;
}

async function resolveRabbiProject({ args = {}, context = {}, deps = {}, db }) {
  const projectKey = rabbiProjectKey(args, context);
  const workspaceKey = rabbiWorkspaceKey(args, context);
  const project = deps.resolveProjectFromInput
    ? await deps.resolveProjectFromInput({ project_key: projectKey, workspace_key: workspaceKey }, db)
    : { id: null, project_key: projectKey, workspace_key: workspaceKey };
  if (project?.project_key && normalizeProjectKey(project.project_key) !== projectKey) {
    throw rabbiScopeError('Rabbi helper project scope mismatch');
  }
  if (project?.workspace_key && normalizeWorkspaceKey(project.workspace_key) !== workspaceKey) {
    throw rabbiScopeError('Rabbi helper workspace scope mismatch');
  }
  if (deps.assertProjectAccess) deps.assertProjectAccess(context.req, project);
  return { project, projectKey, workspaceKey, projectId: normalizeNumber(project?.id) };
}

function helperLimit(value, fallback = 10, max = 50) {
  const number = normalizeNumber(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.max(1, Math.min(Math.trunc(number), max));
}

function appendQueryParam(path = '', key = '', value = '') {
  if (!path || !key || value === undefined || value === null || value === '') return path || null;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
}

function emailDomain(value = '') {
  const domain = String(value || '').split('@')[1] || '';
  return domain ? domain.toLowerCase() : null;
}

function safeCommunicationParty(name = '', address = '') {
  return {
    name: compactText(name, 120) || null,
    email_domain: emailDomain(address),
    address_returned: false,
  };
}

async function createRabbiTaskAliasTool(payload, aliasToolName, defaults) {
  const { args, context } = payload;
  const title = compactText(args.title || args.topic || args.idea || args.prompt || defaults.title, 240);
  const notes = [
    args.notes || args.raw_text || args.prompt || args.idea || args.topic || '',
    defaults.notes || '',
    'Created through a Rabbi / One Time scoped natural-language helper alias.',
  ].filter(Boolean).join('\n');
  const result = await createTaskTool({
    ...payload,
    args: {
      title,
      notes,
      summary: args.summary || defaults.summary || null,
      assigned_to: args.assigned_to || 'Shloimie',
      category: defaults.category,
      urgency: args.urgency || 'this_week',
      stage: args.stage || 'assigned',
      due_date: args.due_date || null,
      project_key: rabbiProjectKey(args, context),
    },
  });
  return delegatedResult(result, aliasToolName, 'create_task', {
    rabbi_alias_category: defaults.category,
  });
}

async function createRabbiShiurIdeaTool(payload) {
  return createRabbiTaskAliasTool(payload, 'create_rabbi_shiur_idea', {
    title: 'Rabbi shiur idea',
    category: 'shiur_ideas',
    summary: 'Rabbi / One Time shiur idea task.',
  });
}

async function createRabbiSourceSheetTaskTool(payload) {
  return createRabbiTaskAliasTool(payload, 'create_rabbi_source_sheet_task', {
    title: 'Prepare Rabbi source sheet',
    category: 'source_sheets',
    summary: 'Rabbi / One Time source sheet task.',
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

async function routeBugToCodexTool(payload) {
  const { args, context } = payload;
  const title = compactText(args.title || args.issue || args.description || 'Route Rabbi helper issue to Codex', 240);
  const brief = [
    args.description || args.issue || args.notes || title,
    args.expected ? `Expected: ${args.expected}` : '',
    args.actual ? `Actual: ${args.actual}` : '',
    'Scope: Rabbi Scheller / One Time only. Do not touch BNA Academy or unrelated provider data.',
  ].filter(Boolean).join('\n');
  const result = await createCodexWorkItemTool({
    ...payload,
    args: {
      title,
      brief,
      summary: args.summary || 'Rabbi / One Time helper issue routed to Codex.',
      category: 'technology',
      urgency: args.urgency || 'this_week',
      project_key: rabbiProjectKey(args, context),
    },
  });
  return delegatedResult(result, 'route_bug_to_codex', 'create_codex_work_item');
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
  const sectionLabel = args.section ? ` / ${args.section}` : '';
  const destination = resolveHelperDestination({
    intent: 'open_operations_view',
    actor: {
      role: context.identity?.role || context.userRole || 'admin',
      scope: context.identity?.scope || {},
      workspace_key: args.workspace_key || context.workspaceKey || context.workspace_key || 'bna',
      project_key: context.projectKey || context.project_key || 'bna',
      user_id: context.userName || context.identity?.username || 'BNA Helper',
    },
    context,
    channel: 'operations_helper',
    helperTool: 'open_operations_view',
    actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
    target: {
      view,
      section: args.section ? compactText(args.section, 80) : '',
      workspace_key: args.workspace_key || context.workspaceKey || context.workspace_key || '',
      task_id: args.task_id || '',
      student_id: args.student_id || '',
      content_job_id: args.content_job_id || '',
      calendar_mode: args.calendar_mode ? compactText(args.calendar_mode, 40) : '',
      date: args.date ? compactText(args.date, 40) : '',
    },
    reason: 'Operations helper navigation request',
  });
  return helperResultCard({
    ok: destination.ok,
    tool: 'open_operations_view',
    recordType: 'operations_route',
    recordId: args.task_id || args.student_id || args.content_job_id || null,
    label: `Open ${view}${sectionLabel}`,
    summary: destination.ok
      ? `Prepared an Operations link for ${view}${sectionLabel}.`
      : `Could not prepare that Operations link: ${destination.reason}.`,
    url: destination.ok ? destination.path : destination.fallback?.path || null,
    status: destination.ok ? 'prepared' : 'blocked',
    data: { view, section: args.section || null, destination },
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
  notifySuperAdminSupportTicket({
    ticket: {
      ...ticket,
      project_key: project.project_key,
      workspace_key: project.workspace_key || (project.project_key === 'one_time_mishnah_class' ? 'rabbi_sheller_provider' : null),
    },
    context: {
      source: 'bna_helper_support_ticket',
      projectKey: project.project_key,
      workspaceKey: project.workspace_key || (project.project_key === 'one_time_mishnah_class' ? 'rabbi_sheller_provider' : null),
      reviewPath: '/operations?view=admin&section=tickets',
    },
  }).catch((error) => console.error('Helper support ticket Telegram alert error:', error.message || error));
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

async function supportTicketAliasTool(payload, aliasToolName, fallbackTitle) {
  const { args, context } = payload;
  const result = await createSupportTicketTool({
    ...payload,
    args: {
      title: compactText(args.title || args.issue || args.description || fallbackTitle, 180),
      description: args.description || args.issue || args.body || args.notes || fallbackTitle,
      expected: args.expected || null,
      severity: args.severity || 'normal',
      category: args.category || 'task_manager',
      assigned_to: args.assigned_to || null,
      project_key: rabbiProjectKey(args, context),
    },
  });
  return delegatedResult(result, aliasToolName, 'create_support_ticket');
}

async function createReportProblemTicketTool(payload) {
  return supportTicketAliasTool(payload, 'create_report_problem_ticket', 'Rabbi helper problem report');
}

async function createTicketTool(payload) {
  return supportTicketAliasTool(payload, 'create_ticket', 'Rabbi helper ticket');
}

async function createHelpRequestTool(payload) {
  return supportTicketAliasTool(payload, 'create_help_request', 'Rabbi helper help request');
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

async function showOneTimeLaunchChecklistTool({ args, context, deps, db }) {
  const { projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const limit = helperLimit(args.limit, 20, 50);
  const result = await db.query(
    `SELECT id, title, display_title, summary, stage, category, waiting_on, agent_status, updated_at
     FROM bna_tasks
     WHERE COALESCE(project_key, '') = $1
       AND COALESCE(stage, '') <> 'done'
     ORDER BY updated_at DESC NULLS LAST, id DESC
     LIMIT $2`,
    [projectKey, limit]
  );
  return helperResultCard({
    tool: 'show_one_time_launch_checklist',
    recordType: 'helper_audit',
    recordId: null,
    label: 'One Time launch checklist',
    summary: `Found ${result.rows.length} open One Time launch/task row(s).`,
    url: `/operations?view=tasks&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      checklist: [
        { key: 'tool_scope', label: 'Helper tool scope map', status: 'tracked_in_repo' },
        { key: 'agent_mode', label: 'Agent Mode probes', status: 'run_per_batch' },
        { key: 'external_writes', label: 'External sends/publishes/payments/access grants', status: 'approval_gated' },
      ],
      tasks: result.rows.map((row) => ({
        id: row.id,
        title: row.display_title || row.title,
        summary: row.summary || null,
        stage: row.stage || null,
        category: row.category || null,
        waiting_on: row.waiting_on || null,
        agent_status: row.agent_status || null,
        updated_at: row.updated_at || null,
      })),
    },
  });
}

function safeCalendarEvent(row = {}) {
  return {
    id: row.id,
    title: row.title,
    related_type: row.related_type || null,
    related_id: row.related_id || null,
    start_at: row.start_at,
    end_at: row.end_at || null,
    status: row.status || null,
    visibility: row.visibility || null,
    source: row.source || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    meeting_url_present: Boolean(row.meeting_url_present),
    meeting_url_returned: false,
    description_returned: false,
  };
}

async function listCalendarSessionsTool({ args, context, deps, db }) {
  const { workspaceKey, projectKey } = await resolveRabbiProject({ args, context, deps, db });
  const params = [workspaceKey];
  const conditions = [`workspace_key = $1`];
  if (args.status) {
    params.push(compactText(args.status, 40));
    conditions.push(`status = $${params.length}`);
  }
  if (args.date_from) {
    params.push(compactText(args.date_from, 40));
    conditions.push(`start_at >= $${params.length}`);
  }
  if (args.date_to) {
    params.push(compactText(args.date_to, 40));
    conditions.push(`start_at <= $${params.length}`);
  }
  params.push(helperLimit(args.limit, 10, 50));
  const result = await db.query(
    `SELECT id, related_type, related_id, title, start_at, end_at, status, visibility,
            source, created_at, updated_at, meeting_url IS NOT NULL AS meeting_url_present
     FROM bna_calendar_events
     WHERE ${conditions.join(' AND ')}
     ORDER BY start_at ASC, id ASC
     LIMIT $${params.length}`,
    params
  );
  return helperResultCard({
    tool: 'list_calendar_sessions',
    recordType: 'helper_audit',
    recordId: null,
    label: 'One Time calendar sessions',
    summary: `Found ${result.rows.length} scoped One Time calendar event(s).`,
    url: `/operations?view=calendar&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      events: result.rows.map(safeCalendarEvent),
    },
  });
}

async function openCalendarEventTool({ args, context, deps, db }) {
  const { workspaceKey, projectKey } = await resolveRabbiProject({ args, context, deps, db });
  const result = await db.query(
    `SELECT id, related_type, related_id, title, start_at, end_at, status, visibility,
            source, created_at, updated_at, meeting_url IS NOT NULL AS meeting_url_present
     FROM bna_calendar_events
     WHERE id = $1 AND workspace_key = $2
     LIMIT 1`,
    [args.event_id, workspaceKey]
  );
  if (!result.rows[0]) {
    return helperResultCard({
      ok: false,
      tool: 'open_calendar_event',
      recordType: 'calendar_event',
      recordId: args.event_id,
      label: `Calendar event #${args.event_id}`,
      summary: 'No One Time calendar event was found for that scoped ID.',
      status: 'not_found',
      data: { scope: { workspace_key: workspaceKey, project_key: projectKey } },
    });
  }
  const destination = resolveHelperDestination({
    intent: 'open_calendar_event',
    actor: {
      role: context.identity?.role || context.userRole || 'admin',
      scope: context.identity?.scope || {},
      workspace_key: workspaceKey,
      project_key: projectKey,
      user_id: context.userName || context.identity?.username || 'BNA Helper',
    },
    context,
    channel: 'operations_helper',
    helperTool: 'open_calendar_event',
    target: {
      view: 'calendar',
      workspace_key: workspaceKey,
    },
    reason: 'Open scoped One Time calendar event',
  });
  return helperResultCard({
    ok: destination.ok,
    tool: 'open_calendar_event',
    recordType: 'calendar_event',
    recordId: args.event_id,
    label: `Calendar event #${args.event_id}`,
    summary: destination.ok
      ? `Prepared a scoped calendar event link for #${args.event_id}.`
      : `Found the scoped event, but could not prepare the Operations link: ${destination.reason}.`,
    url: destination.ok ? appendQueryParam(destination.path, 'event', args.event_id) : destination.fallback?.path || null,
    status: destination.ok ? 'prepared' : 'blocked',
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      event: safeCalendarEvent(result.rows[0]),
      destination,
    },
  });
}

function safeContentItem(row = {}) {
  return {
    id: row.id,
    title: row.title,
    status: row.status || null,
    source_type: row.source_type || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    media_url_present: Boolean(row.media_url_present),
    media_url_returned: false,
    drive_file_present: Boolean(row.drive_file_present),
    drive_file_id_returned: false,
  };
}

async function openContentItemUrlTool({ args, context, deps, db }) {
  const { project, projectKey, workspaceKey, projectId } = await resolveRabbiProject({ args, context, deps, db });
  const result = await db.query(
    `SELECT cj.id, cj.title, cj.status, cj.source_type, cj.created_at, cj.updated_at,
            cj.media_url IS NOT NULL AS media_url_present,
            cj.drive_file_id IS NOT NULL AS drive_file_present
     FROM bna_content_jobs cj
     LEFT JOIN bna_projects p ON p.id = cj.project_id
     WHERE cj.id = $1
       AND (cj.project_id = $2 OR p.project_key = $3)
     LIMIT 1`,
    [args.content_id, projectId || project.id || 0, projectKey]
  );
  if (!result.rows[0]) {
    return helperResultCard({
      ok: false,
      tool: 'open_content_item_url',
      recordType: 'content_job',
      recordId: args.content_id,
      label: `Content item #${args.content_id}`,
      summary: 'No One Time content item was found for that scoped ID.',
      status: 'not_found',
      data: { scope: { workspace_key: workspaceKey, project_key: projectKey } },
    });
  }
  return helperResultCard({
    tool: 'open_content_item_url',
    recordType: 'content_job',
    recordId: args.content_id,
    label: `Content item #${args.content_id}`,
    summary: `Prepared a scoped content item link for #${args.content_id}.`,
    url: helperResultLink('content_job', args.content_id),
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      content_item: safeContentItem(result.rows[0]),
    },
  });
}

function safeCommunicationRow(row = {}) {
  return {
    id: row.id,
    channel: row.channel || null,
    direction: row.direction || null,
    communication_type: row.communication_type || null,
    subject: row.subject || null,
    status: row.status || null,
    provider: row.provider || null,
    occurred_at: row.occurred_at || null,
    created_at: row.created_at || null,
    from: safeCommunicationParty(row.from_name, row.from_address),
    to: safeCommunicationParty(row.to_name, row.to_address),
    body_returned: false,
    raw_message_returned: false,
  };
}

async function viewEmailLogTool({ args, context, deps, db }) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const params = [projectId || 0, projectKey];
  const conditions = [`c.channel = 'email'`, `(c.project_id = $1 OR p.project_key = $2)`];
  if (args.status) {
    params.push(compactText(args.status, 80));
    conditions.push(`c.status = $${params.length}`);
  }
  if (args.direction) {
    params.push(compactText(args.direction, 40));
    conditions.push(`c.direction = $${params.length}`);
  }
  params.push(helperLimit(args.limit, 10, 50));
  const result = await db.query(
    `SELECT c.id, c.channel, c.direction, c.communication_type, c.from_name, c.from_address,
            c.to_name, c.to_address, c.subject, c.provider, c.status, c.occurred_at, c.created_at
     FROM bna_communications c
     LEFT JOIN bna_projects p ON p.id = c.project_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(c.occurred_at, c.created_at) DESC, c.id DESC
     LIMIT $${params.length}`,
    params
  );
  return helperResultCard({
    tool: 'view_email_log',
    recordType: 'helper_audit',
    recordId: null,
    label: 'One Time email log',
    summary: `Found ${result.rows.length} scoped One Time email log row(s).`,
    url: `/operations?view=communications&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      emails: result.rows.map(safeCommunicationRow),
    },
  });
}

function contactHistoryFilters(args = {}) {
  const filters = [];
  const values = [];
  function push(sql, ...inputValues) {
    const start = values.length;
    let index = 0;
    filters.push(sql.replace(/\?/g, () => `$${start + (++index)}`));
    values.push(...inputValues);
  }
  if (args.contact_id) push('c.contact_id = ?', args.contact_id);
  if (args.signup_id) push('c.signup_id = ?', args.signup_id);
  if (args.student_id) push('c.student_id = ?', args.student_id);
  if (args.email) {
    values.push(String(args.email).toLowerCase());
    filters.push(`(LOWER(COALESCE(c.from_address, '')) = $${values.length} OR LOWER(COALESCE(c.to_address, '')) = $${values.length})`);
  }
  if (args.phone) {
    const phone = String(args.phone || '').replace(/\D+/g, '');
    if (phone) push(`regexp_replace(COALESCE(c.metadata::text, ''), '\\D', '', 'g') LIKE '%' || ? || '%'`, phone);
  }
  if (args.contact_name) {
    const contactName = compactText(args.contact_name, 120);
    push(
      `(COALESCE(c.from_name, '') ILIKE '%' || ? || '%' OR COALESCE(c.to_name, '') ILIKE '%' || ? || '%')`,
      contactName,
      contactName
    );
  }
  return { filters, values };
}

async function showContactCommunicationHistoryTool({ args, context, deps, db }) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const scopedParams = [projectId || 0, projectKey];
  const { filters, values } = contactHistoryFilters(args);
  if (!filters.length) {
    return helperResultCard({
      ok: false,
      tool: 'show_contact_communication_history',
      recordType: 'helper_audit',
      recordId: null,
      label: 'Contact communication history',
      summary: 'A scoped contact, signup, student, email, phone, or contact name is required before showing communication history.',
      status: 'needs_input',
      data: { scope: { workspace_key: workspaceKey, project_key: projectKey }, body_returned: false },
    });
  }
  const offsetFilters = filters.map((filter) => filter.replace(/\$(\d+)/g, (_, number) => `$${Number(number) + scopedParams.length}`));
  const params = scopedParams.concat(values);
  params.push(helperLimit(args.limit, 10, 50));
  const result = await db.query(
    `SELECT c.id, c.channel, c.direction, c.communication_type, c.from_name, c.from_address,
            c.to_name, c.to_address, c.subject, c.provider, c.status, c.occurred_at, c.created_at
     FROM bna_communications c
     LEFT JOIN bna_projects p ON p.id = c.project_id
     WHERE (c.project_id = $1 OR p.project_key = $2)
       AND (${offsetFilters.join(' OR ')})
     ORDER BY COALESCE(c.occurred_at, c.created_at) DESC, c.id DESC
     LIMIT $${params.length}`,
    params
  );
  return helperResultCard({
    tool: 'show_contact_communication_history',
    recordType: 'helper_audit',
    recordId: args.contact_id || args.signup_id || args.student_id || null,
    label: 'Contact communication history',
    summary: `Found ${result.rows.length} scoped communication row(s).`,
    url: `/operations?view=communications&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      communications: result.rows.map(safeCommunicationRow),
      body_returned: false,
    },
  });
}

function safeProviderLead(row = {}) {
  return {
    id: row.id,
    record_type: row.record_type || 'parent_lead',
    parent_name: compactText(row.parent_name, 140) || null,
    student_name: compactText(row.student_name, 140) || null,
    lead_type: row.lead_type || null,
    status: row.status || null,
    interest_level: row.interest_level || null,
    source: row.source || null,
    source_detail: compactText(row.source_detail, 120) || null,
    last_inbound_at: row.last_inbound_at || null,
    last_outbound_at: row.last_outbound_at || null,
    next_follow_up_date: row.next_follow_up_date || null,
    tag_count: Number(row.tag_count || 0),
    communication_count: Number(row.communication_count || 0),
    latest_communication_at: row.latest_communication_at || null,
    email_domain: emailDomain(row.parent_email),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    parent_email_returned: false,
    parent_phone_returned: false,
    notes_returned: false,
    raw_contact_export_returned: false,
  };
}

async function listProviderLeadsTool({ args, context, deps, db }) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const params = [projectId || 0, projectKey];
  const leadConditions = [`(l.project_id = $1 OR p.project_key = $2)`];
  const signupConditions = [`(s.project_id = $1 OR sp.project_key = $2)`];
  if (args.status) {
    params.push(compactText(args.status, 80));
    leadConditions.push(`l.status = $${params.length}`);
    signupConditions.push(`s.status = $${params.length}`);
  }
  if (args.search) {
    params.push(compactText(args.search, 120));
    leadConditions.push(`(l.parent_name ILIKE '%' || $${params.length} || '%' OR l.student_name ILIKE '%' || $${params.length} || '%' OR l.source_detail ILIKE '%' || $${params.length} || '%')`);
    signupConditions.push(`(s.parent_name ILIKE '%' || $${params.length} || '%' OR s.student_name ILIKE '%' || $${params.length} || '%')`);
  }
  params.push(helperLimit(args.limit, 10, 50));
  const result = await db.query(
    `SELECT *
     FROM (
       SELECT 'parent_lead' AS record_type,
              l.id, l.parent_name, l.student_name, l.lead_type, l.status,
              l.interest_level, l.source, l.source_detail, l.last_inbound_at,
              l.last_outbound_at, l.next_follow_up_date,
              COALESCE(cardinality(l.tags), 0)::int AS tag_count,
              l.parent_email, l.created_at, l.updated_at,
              COUNT(cc.id)::int AS communication_count,
              MAX(cc.occurred_at) AS latest_communication_at
       FROM bna_parent_leads l
       LEFT JOIN bna_projects p ON p.id = l.project_id
       LEFT JOIN bna_contact_communications cc ON cc.lead_id = l.id
       WHERE ${leadConditions.join(' AND ')}
       GROUP BY l.id
       UNION ALL
       SELECT 'signup' AS record_type,
              s.id, s.parent_name, s.student_name, 'signup' AS lead_type,
              COALESCE(s.status, 'new') AS status,
              NULL AS interest_level, 'signup' AS source, NULL AS source_detail,
              NULL AS last_inbound_at, NULL AS last_outbound_at,
              NULL AS next_follow_up_date,
              COALESCE(cardinality(s.tags), 0)::int AS tag_count,
              s.parent_email, s.created_at, s.updated_at,
              COUNT(cc.id)::int AS communication_count,
              MAX(cc.occurred_at) AS latest_communication_at
       FROM signups s
       LEFT JOIN bna_projects sp ON sp.id = s.project_id
       LEFT JOIN bna_contact_communications cc ON cc.signup_id = s.id
       WHERE ${signupConditions.join(' AND ')}
       GROUP BY s.id
     ) scoped_provider_leads
     ORDER BY updated_at DESC NULLS LAST, id DESC
     LIMIT $${params.length}`,
    params
  );
  return helperResultCard({
    tool: 'list_provider_leads',
    recordType: 'helper_audit',
    recordId: null,
    label: 'One Time provider contact leads',
    summary: `Found ${result.rows.length} scoped One Time contact lead/signup row(s).`,
    url: `/operations?view=contacts&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      leads: result.rows.map(safeProviderLead),
    },
  });
}

function projectScopeSql(alias = 'st', signupAlias = 'su', projectAlias = 'p', startIndex = 1) {
  return `(${alias}.project_id = $${startIndex} OR ${signupAlias}.project_id = $${startIndex} OR ${projectAlias}.project_key = $${startIndex + 1})`;
}

function safeStudentSummary(row = {}) {
  return {
    id: row.id,
    signup_id: row.signup_id || null,
    name: row.name || null,
    name_en: row.name_en || null,
    name_he: row.name_he || null,
    grade: row.grade || null,
    current_school: row.current_school || null,
    status: row.status || null,
    tags: Array.isArray(row.tags) ? row.tags.slice(0, 12) : [],
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    parent_contact_returned: false,
    student_access_code_returned: false,
    private_notes_returned: false,
  };
}

async function queryRabbiStudents({ args = {}, context = {}, deps = {}, db, limit = 25 } = {}) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const params = [projectId || 0, projectKey];
  const conditions = [projectScopeSql('st', 'su', 'p', 1), `COALESCE(st.status, 'active') NOT IN ('inactive', 'archived')`];
  if (args.student_id) {
    params.push(args.student_id);
    conditions.push(`st.id = $${params.length}`);
  }
  if (args.search) {
    params.push(compactText(args.search, 120));
    conditions.push(`(st.name ILIKE '%' || $${params.length} || '%' OR st.name_en ILIKE '%' || $${params.length} || '%' OR st.name_he ILIKE '%' || $${params.length} || '%')`);
  }
  params.push(helperLimit(args.limit, limit, 100));
  const result = await db.query(
    `SELECT st.id, st.signup_id, st.name, st.name_en, st.name_he, st.grade,
            st.current_school, st.status, st.tags, st.created_at, st.updated_at
     FROM bna_students st
     LEFT JOIN signups su ON su.id = st.signup_id
     LEFT JOIN bna_projects p ON p.id = COALESCE(st.project_id, su.project_id)
     WHERE ${conditions.join(' AND ')}
     ORDER BY st.name ASC, st.id ASC
     LIMIT $${params.length}`,
    params
  );
  return {
    projectId,
    projectKey,
    workspaceKey,
    rows: result.rows,
    students: result.rows.map(safeStudentSummary),
  };
}

function visibilityExpr(alias = 'ast', audience = 'student') {
  const keys = audience === 'parent'
    ? [`${alias}.metadata->>'parent_visible'`, `${alias}.metadata->>'share_with_parent'`]
    : [`${alias}.metadata->>'student_visible'`, `${alias}.metadata->>'share_with_student'`];
  return `LOWER(COALESCE(${keys.join(', ')}, 'true')) <> 'false'`;
}

function safeAssignmentRow(row = {}) {
  return {
    id: row.assignment_student_id || null,
    assignment_id: row.assignment_id,
    student_id: row.student_id || null,
    student_name: row.student_name || null,
    title: row.title || null,
    language_mode: row.language_mode || null,
    worksheet_type: row.worksheet_type || null,
    schedule_text: row.schedule_text || null,
    assignment_status: row.assignment_status || null,
    status: row.status || null,
    scheduled_start_at: row.scheduled_start_at || null,
    due_at: row.due_at || null,
    sync_mode: row.sync_mode || null,
    sync_status: row.sync_status || null,
    classroom_state: row.classroom_state || null,
    worksheet_returned: false,
    raw_instructions_returned: false,
    material_url_present: Boolean(row.material_url_present),
    material_url_returned: false,
    youtube_url_present: Boolean(row.youtube_url_present),
    youtube_url_returned: false,
    classroom_link_present: Boolean(row.classroom_link_present),
    classroom_link_returned: false,
    calendar_link_present: Boolean(row.calendar_link_present),
    calendar_link_returned: false,
  };
}

async function queryRabbiAssignments({ args = {}, context = {}, deps = {}, db, audience = 'student', limit = 25 } = {}) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const params = [projectId || 0, projectKey];
  const conditions = [
    `(a.project_id = $1 OR st.project_id = $1 OR su.project_id = $1 OR p.project_key = $2)`,
    `COALESCE(a.status, 'draft') <> 'archived'`,
    `COALESCE(ast.status, 'assigned') <> 'archived'`,
    visibilityExpr('ast', audience),
  ];
  if (args.student_id) {
    params.push(args.student_id);
    conditions.push(`st.id = $${params.length}`);
  }
  params.push(helperLimit(args.limit, limit, 100));
  const result = await db.query(
    `SELECT a.id AS assignment_id, a.title, a.language_mode, a.worksheet_type,
            a.schedule_text, a.status AS assignment_status, a.sync_mode,
            a.material_url IS NOT NULL AS material_url_present,
            a.youtube_url IS NOT NULL AS youtube_url_present,
            ast.id AS assignment_student_id, ast.student_id, COALESCE(ast.student_name, st.name) AS student_name,
            ast.status, ast.scheduled_start_at, ast.due_at, ast.sync_status,
            ast.classroom_state,
            ast.classroom_alternate_link IS NOT NULL AS classroom_link_present,
            ast.calendar_html_link IS NOT NULL AS calendar_link_present
     FROM bna_assignment_students ast
     JOIN bna_assignments a ON a.id = ast.assignment_id
     LEFT JOIN bna_students st ON st.id = ast.student_id
     LEFT JOIN signups su ON su.id = st.signup_id
     LEFT JOIN bna_projects p ON p.id = COALESCE(a.project_id, st.project_id, su.project_id)
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(ast.scheduled_start_at, ast.due_at, ast.created_at) ASC, ast.id DESC
     LIMIT $${params.length}`,
    params
  );
  return {
    projectKey,
    workspaceKey,
    assignments: result.rows.map(safeAssignmentRow),
  };
}

function safeGoalRow(row = {}) {
  return {
    id: row.id,
    student_id: row.student_id || null,
    student_name: row.student_name || null,
    title: row.title || null,
    topic: row.topic || null,
    goal_target_value: row.goal_target_value || null,
    goal_actual_value: row.goal_actual_value || null,
    goal_unit: row.goal_unit || null,
    progress_percent: row.progress_percent === null || row.progress_percent === undefined ? null : Number(row.progress_percent),
    follow_up_required: Boolean(row.follow_up_required),
    next_check_in_date: row.next_check_in_date || null,
    occurred_at: row.occurred_at || null,
    updated_at: row.updated_at || null,
    raw_notes_returned: false,
    private_goal_metadata_returned: false,
  };
}

async function queryRabbiGoals({ args = {}, context = {}, deps = {}, db, audience = 'student', limit = 25 } = {}) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const visibleKeys = audience === 'parent'
    ? [`ae.metadata->>'parent_visible'`, `ae.metadata->'goal_board'->>'parent_visible'`, `ae.metadata->>'share_with_parent'`]
    : [`ae.metadata->>'student_visible'`, `ae.metadata->'goal_board'->>'student_visible'`, `ae.metadata->>'share_with_student'`];
  const params = [projectId || 0, projectKey];
  const conditions = [
    `(ae.project_id = $1 OR st.project_id = $1 OR su.project_id = $1 OR p.project_key = $2)`,
    `ae.event_type = 'student_goal'`,
    `LOWER(COALESCE(${visibleKeys.join(', ')}, 'true')) <> 'false'`,
    `COALESCE(ae.metadata->'goal_board'->>'status', '') <> 'archived'`,
  ];
  if (args.student_id) {
    params.push(args.student_id);
    conditions.push(`st.id = $${params.length}`);
  }
  params.push(helperLimit(args.limit, limit, 100));
  const result = await db.query(
    `SELECT ae.id, ae.student_id, COALESCE(ae.student_name, st.name) AS student_name,
            ae.title, ae.topic, ae.goal_target_value, ae.goal_actual_value,
            ae.goal_unit, ae.progress_percent, ae.follow_up_required,
            ae.next_check_in_date, ae.occurred_at, ae.updated_at
     FROM bna_accountability_events ae
     LEFT JOIN bna_students st ON st.id = ae.student_id
     LEFT JOIN signups su ON su.id = st.signup_id
     LEFT JOIN bna_projects p ON p.id = COALESCE(ae.project_id, st.project_id, su.project_id)
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(ae.follow_up_required, FALSE) DESC,
              COALESCE(ae.progress_percent, -1) ASC,
              ae.occurred_at DESC NULLS LAST,
              ae.id DESC
     LIMIT $${params.length}`,
    params
  );
  return {
    projectKey,
    workspaceKey,
    goals: result.rows.map(safeGoalRow),
  };
}

async function queryRabbiCalendarEvents({ args = {}, context = {}, deps = {}, db, audience = 'parent', limit = 25 } = {}) {
  const { projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const visibilityList = audience === 'parent' ? ['parent', 'student', 'provider', 'public'] : ['student', 'provider', 'public'];
  const params = [workspaceKey, visibilityList];
  const conditions = [
    `ce.workspace_key = $1`,
    `ce.status NOT IN ('cancelled', 'archived')`,
    `ce.visibility = ANY($2::text[])`,
  ];
  if (args.student_id) {
    params.push(args.student_id);
    conditions.push(`(
      ce.related_type IN ('class_session', 'provider_program')
      OR (ce.related_type = 'student' AND ce.related_id = $${params.length})
      OR COALESCE(ce.metadata_json->>'student_id', ce.metadata_json->>'studentId', '') = $${params.length}::text
      OR COALESCE(ce.metadata_json->'student_ids', '[]'::jsonb) ? $${params.length}::text
      OR COALESCE(ce.metadata_json->'studentIds', '[]'::jsonb) ? $${params.length}::text
    )`);
  }
  params.push(helperLimit(args.limit, limit, 100));
  const result = await db.query(
    `SELECT ce.id, ce.related_type, ce.related_id, ce.title, ce.start_at, ce.end_at,
            ce.status, ce.visibility, ce.source, ce.created_at, ce.updated_at,
            ce.meeting_url IS NOT NULL AS meeting_url_present
     FROM bna_calendar_events ce
     WHERE ${conditions.join(' AND ')}
     ORDER BY ce.start_at ASC, ce.id ASC
     LIMIT $${params.length}`,
    params
  );
  return {
    projectKey,
    workspaceKey,
    events: result.rows.map(safeCalendarEvent),
  };
}

function safeParentVisibleNote(row = {}) {
  return {
    id: row.id,
    student_id: row.student_id || null,
    student_name: row.student_name || null,
    event_type: row.event_type || null,
    title: row.title || null,
    topic: row.topic || null,
    note_preview: compactText(row.notes || row.question_text || '', 220) || null,
    occurred_at: row.occurred_at || null,
    created_at: row.created_at || null,
    raw_notes_returned: false,
    private_metadata_returned: false,
  };
}

async function queryRabbiParentVisibleNotes({ args = {}, context = {}, deps = {}, db, limit = 25 } = {}) {
  const { projectId, projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const params = [projectId || 0, projectKey];
  const conditions = [
    `(ae.project_id = $1 OR st.project_id = $1 OR su.project_id = $1 OR p.project_key = $2)`,
    `LOWER(COALESCE(ae.metadata->>'parent_visible', ae.metadata->'goal_board'->>'parent_visible', ae.metadata->>'share_with_parent', 'false')) = 'true'`,
  ];
  if (args.student_id) {
    params.push(args.student_id);
    conditions.push(`st.id = $${params.length}`);
  }
  params.push(helperLimit(args.limit, limit, 50));
  const result = await db.query(
    `SELECT ae.id, ae.student_id, COALESCE(ae.student_name, st.name) AS student_name,
            ae.event_type, ae.title, ae.topic, ae.notes, ae.question_text,
            ae.occurred_at, ae.created_at
     FROM bna_accountability_events ae
     LEFT JOIN bna_students st ON st.id = ae.student_id
     LEFT JOIN signups su ON su.id = st.signup_id
     LEFT JOIN bna_projects p ON p.id = COALESCE(ae.project_id, st.project_id, su.project_id)
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(ae.occurred_at, ae.created_at) DESC, ae.id DESC
     LIMIT $${params.length}`,
    params
  );
  return {
    projectKey,
    workspaceKey,
    notes: result.rows.map(safeParentVisibleNote),
  };
}

async function listStudentsTool(payload) {
  const { rows, students, projectKey, workspaceKey } = await queryRabbiStudents({ ...payload, limit: 25 });
  return helperResultCard({
    tool: payload.tool?.name || 'list_students',
    recordType: 'helper_audit',
    recordId: null,
    label: 'One Time students',
    summary: `Found ${rows.length} scoped One Time student row(s).`,
    url: `/operations?view=students&workspace=${workspaceKey}`,
    data: { scope: { workspace_key: workspaceKey, project_key: projectKey }, students },
  });
}

async function showAssignmentsTool(payload) {
  const audience = payload.tool?.name === 'show_assignments' ? 'parent' : 'student';
  const { assignments, projectKey, workspaceKey } = await queryRabbiAssignments({ ...payload, audience, limit: 25 });
  return helperResultCard({
    tool: payload.tool?.name || 'show_assignments',
    recordType: 'helper_audit',
    recordId: payload.args.student_id || null,
    label: 'One Time assignments',
    summary: `Found ${assignments.length} scoped visible assignment row(s).`,
    url: `/operations?view=students&workspace=${workspaceKey}`,
    data: { scope: { workspace_key: workspaceKey, project_key: projectKey }, audience, assignments },
  });
}

async function showGoalsTool(payload) {
  const { goals, projectKey, workspaceKey } = await queryRabbiGoals({ ...payload, audience: 'student', limit: 25 });
  return helperResultCard({
    tool: payload.tool?.name || 'show_my_goals',
    recordType: 'helper_audit',
    recordId: payload.args.student_id || null,
    label: 'One Time student goals',
    summary: `Found ${goals.length} scoped visible goal row(s).`,
    url: `/operations?view=students&workspace=${workspaceKey}`,
    data: { scope: { workspace_key: workspaceKey, project_key: projectKey }, audience: 'student', goals },
  });
}

async function showStudentProgressTool(payload) {
  const audience = payload.tool?.name === 'show_student_progress_for_parent' ? 'parent' : 'student';
  const studentsResult = await queryRabbiStudents({ ...payload, limit: payload.args.student_id ? 1 : 10 });
  const assignmentsResult = await queryRabbiAssignments({ ...payload, audience, limit: 20 });
  const goalsResult = await queryRabbiGoals({ ...payload, audience, limit: 20 });
  return helperResultCard({
    tool: payload.tool?.name || 'show_student_progress',
    recordType: 'helper_audit',
    recordId: payload.args.student_id || null,
    label: 'One Time student progress',
    summary: `Found ${studentsResult.students.length} student(s), ${assignmentsResult.assignments.length} assignment(s), and ${goalsResult.goals.length} visible goal(s).`,
    url: `/operations?view=students&workspace=${studentsResult.workspaceKey}`,
    data: {
      scope: { workspace_key: studentsResult.workspaceKey, project_key: studentsResult.projectKey },
      audience,
      students: studentsResult.students,
      assignments: assignmentsResult.assignments,
      goals: goalsResult.goals,
      parent_contact_returned: false,
      student_access_code_returned: false,
      private_notes_returned: false,
    },
  });
}

async function showChildCalendarTool(payload) {
  const { events, projectKey, workspaceKey } = await queryRabbiCalendarEvents({ ...payload, audience: 'parent', limit: 25 });
  return helperResultCard({
    tool: 'show_child_calendar',
    recordType: 'helper_audit',
    recordId: payload.args.student_id || null,
    label: 'One Time child calendar',
    summary: `Found ${events.length} scoped visible calendar event(s).`,
    url: `/operations?view=calendar&workspace=${workspaceKey}`,
    data: { scope: { workspace_key: workspaceKey, project_key: projectKey }, audience: 'parent', events },
  });
}

async function viewParentVisibleNotesTool(payload) {
  const { notes, projectKey, workspaceKey } = await queryRabbiParentVisibleNotes({ ...payload, limit: 25 });
  return helperResultCard({
    tool: 'view_parent_visible_notes',
    recordType: 'helper_audit',
    recordId: payload.args.student_id || null,
    label: 'Parent-visible notes',
    summary: `Found ${notes.length} scoped parent-visible note row(s).`,
    url: `/operations?view=students&workspace=${workspaceKey}`,
    data: { scope: { workspace_key: workspaceKey, project_key: projectKey }, notes },
  });
}

function compactList(value, limit = 8) {
  return Array.isArray(value) ? value.slice(0, limit) : [];
}

function safePreviewSummary(actionId, preview = {}) {
  const blockers = compactList([
    ...(Array.isArray(preview.blockers) ? preview.blockers : []),
    preview.blocker,
  ].filter(Boolean), 8);
  const base = {
    action_id: actionId,
    executed: false,
    dry_run_only: true,
    no_send: true,
    connector: preview.connector || null,
    connector_ready: Boolean(preview.connector_ready),
    workspace_key: preview.workspace_key || RABBI_WORKSPACE_KEY,
    external_write_performed: false,
    external_read_performed: false,
    google_calendar_write_performed: false,
    google_classroom_write_performed: false,
    google_business_profile_api_used: false,
    live_google_api_used: false,
    raw_external_ids_returned: false,
    raw_urls_returned: false,
    body_preview_returned: false,
    blockers,
    required_external_inputs: compactList(preview.required_external_inputs, 8),
    next_confirmation: compactText(preview.next_confirmation || '', 360) || null,
  };
  if (actionId === 'calendar_batch_launch_plan_preview') {
    return {
      ...base,
      calendar_batch_preview_created: Boolean(preview.calendar_batch_preview_created),
      program: preview.program || null,
      start_date: preview.start_date || null,
      weeks: preview.weeks || null,
      timezone: preview.timezone || null,
      class_time: preview.class_time || null,
      item_count: preview.item_count || 0,
      items: compactList(preview.items, 20).map((item) => ({
        week: item.week,
        type: item.type || null,
        title: item.title || null,
        date: item.date || null,
        start_at: item.start_at || null,
        visibility: item.visibility || null,
      })),
    };
  }
  if (actionId === 'classroom_topic_material_preview') {
    return {
      ...base,
      classroom_topic_material_preview_created: Boolean(preview.classroom_topic_material_preview_created),
      classroom_read_performed: false,
      classroom_write_performed: false,
      course_name: preview.course_name || null,
      topic_name: preview.topic_name || null,
      material_title: preview.material_title || null,
      source_type: preview.source_type || null,
      planned_classroom_action: preview.planned_classroom_action || null,
      topic_lookup_policy: preview.topic_lookup_policy || null,
    };
  }
  if (actionId.startsWith('google_drive_')) {
    return {
      ...base,
      drive_action: preview.drive_action || null,
      query: preview.query || null,
      title: preview.title || null,
      folder_name: preview.folder_name || null,
      missing_connection_task_needed: Boolean(preview.missing_connection_task_needed),
      scope_policy: preview.scope_policy || null,
      planned_result_fields: compactList(preview.planned_result_fields, 8),
    };
  }
  if (actionId.startsWith('google_business_')) {
    return {
      ...base,
      provider_name: preview.provider_name || null,
      query: preview.query || null,
      place_id_found_from_input: Boolean(preview.place_id_found_from_input),
      place_id_needs_live_lookup: Boolean(preview.place_id_needs_live_lookup),
      planned_external_adapter: preview.planned_external_adapter || null,
      planned_google_business_action: preview.planned_google_business_action || null,
      planned_result_fields: compactList(preview.planned_result_fields, 8),
    };
  }
  return base;
}

async function runRabbiPreviewActionTool({ args, context, db, deps, tool }, actionId, label) {
  const { projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const inputs = {
    ...args,
    workspace_key: workspaceKey,
    project_key: projectKey,
  };
  const result = await runAction({
    action_id: actionId,
    inputs,
    dry_run: true,
    approved: false,
    source: 'rabbi_helper_preview',
    actor: {
      user_id: context.userName || context.userId || 'rabbi_helper',
      role: 'system',
      workspace_id: workspaceKey,
    },
  }, {
    db,
    source: 'rabbi_helper_preview',
    actor: {
      user_id: context.userName || context.userId || 'rabbi_helper',
      role: 'system',
      workspace_id: workspaceKey,
    },
  });
  const preview = safePreviewSummary(actionId, redactValue(result.preview || result.result || {}));
  return helperResultCard({
    tool: tool?.name || actionId,
    recordType: 'helper_audit',
    recordId: null,
    label,
    summary: `${label} created as a scoped dry-run preview. No external read, write, send, sync, upload, publish, credential, payment, or access change was performed.`,
    url: `/operations?view=settings&section=google_workspace&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      delegated_action_id: actionId,
      action_success: Boolean(result.success),
      approval_required: Boolean(result.approval_required),
      action_audit_log_id: result.audit_log?.action_run_id || null,
      preview,
    },
  });
}

async function calendarBatchLaunchPlanPreviewTool(payload) {
  return runRabbiPreviewActionTool(payload, 'calendar_batch_launch_plan_preview', 'One Time launch calendar preview');
}

async function classroomTopicMaterialPreviewTool(payload) {
  return runRabbiPreviewActionTool(payload, 'classroom_topic_material_preview', 'Classroom topic material preview');
}

async function googleDriveFindFilePreviewTool(payload) {
  return runRabbiPreviewActionTool(payload, 'google_drive_find_file_preview', 'Google Drive file search preview');
}

async function googleDriveCreateDocPreviewTool(payload) {
  return runRabbiPreviewActionTool(payload, 'google_drive_create_doc_preview', 'Google Drive doc creation preview');
}

async function googleDriveCreateFolderPreviewTool(payload) {
  return runRabbiPreviewActionTool(payload, 'google_drive_create_folder_preview', 'Google Drive folder creation preview');
}

async function googleBusinessPlaceIdLookupTool(payload) {
  return runRabbiPreviewActionTool(payload, 'google_business_place_id_lookup', 'Google Business Place ID preview');
}

async function googleBusinessListLocationsPreviewTool(payload) {
  return runRabbiPreviewActionTool(payload, 'google_business_list_locations_preview', 'Google Business locations preview');
}

function draftTextPreview(value = '', max = 700) {
  return compactText(redactText(value || ''), max) || null;
}

function noLiveDraftFlags() {
  return {
    executed: false,
    dry_run_only: true,
    no_send: true,
    no_publish: true,
    no_external_sync: true,
    external_write_performed: false,
    external_send_performed: false,
    external_publish_performed: false,
    payment_or_access_change_performed: false,
    credential_write_performed: false,
    raw_private_body_returned: false,
    raw_contact_export_returned: false,
    raw_external_ids_returned: false,
    raw_urls_returned: false,
  };
}

function safeAudienceSummary(preview = {}) {
  const audience = preview.audience_preview || preview.audience || {};
  return {
    segment_name: compactText(audience.segment_name || audience.audience_label || preview.segment_name || '', 180) || null,
    estimated_count: Number(audience.estimated_count || preview.estimated_count || 0),
    consent_count: Number(audience.consent_count || preview.consent_count || 0),
    sendable_count: Number(audience.sendable_count || preview.sendable_count || 0),
    suppressed_count: Number(audience.suppressed_count || preview.suppressed_count || 0),
    consent_checked: Boolean(audience.consent_checked || preview.consent_checked),
    suppression_checked: Boolean(audience.suppression_checked || preview.suppression_checked),
    contact_rows_returned: false,
  };
}

function safeDraftActionSummary(actionId, preview = {}) {
  const previewOk = !preview.preview_error;
  const base = {
    action_id: actionId,
    ...noLiveDraftFlags(),
    workspace_key: preview.workspace_key || preview.audience_preview?.workspace_key || RABBI_WORKSPACE_KEY,
    project_key: preview.project_key || preview.audience_preview?.project_key || RABBI_PROJECT_KEY,
    status: preview.status || null,
    preview_error: preview.preview_error || null,
    approval_required_before_live_action: true,
  };
  if (actionId === 'preview_campaign_segment') {
    return {
      ...base,
      segment_preview_created: previewOk,
      audience: safeAudienceSummary(preview),
    };
  }
  if (actionId === 'draft_email_campaign') {
    const content = preview.email?.version?.content || {};
    const campaignBody = content.body || preview.body;
    return {
      ...base,
      campaign_draft_created: previewOk && Boolean(preview.email || preview.draft_created || preview.goal || preview.subject || campaignBody),
      goal: compactText(preview.goal || '', 300) || null,
      audience: safeAudienceSummary(preview),
      subject: compactText(content.subject || preview.subject || '', 180) || null,
      body_preview: draftTextPreview(campaignBody),
      body_preview_returned: Boolean(campaignBody),
      ready_for_live_send: false,
      blockers: compactList(preview.safety_gate?.blockers || preview.blockers, 10),
    };
  }
  if (actionId === 'draft_drip_sequence') {
    const sequence = preview.sequence || {};
    const messageCount = Number(sequence.message_count || preview.message_count || compactList(sequence.messages || preview.messages, 12).length || 0);
    return {
      ...base,
      drip_sequence_draft_created: previewOk && Boolean(preview.sequence || preview.goal || messageCount),
      goal: compactText(preview.goal || '', 300) || null,
      audience: safeAudienceSummary(preview),
      message_count: messageCount,
      intervals: compactList(sequence.intervals || preview.intervals, 10),
      messages: compactList(sequence.messages || preview.messages, 12).map((message) => ({
        message_number: message.message_number || null,
        subject: compactText(message.subject || '', 180) || null,
        delay: compactText(message.delay || '', 120) || null,
        approval_state: message.approval_state || 'draft',
      })),
      ready_for_live_send: false,
      blockers: compactList(preview.safety_gate?.blockers || preview.blockers, 10),
    };
  }
  if (actionId === 'draft_automation') {
    return {
      ...base,
      automation_draft_created: previewOk && Boolean(preview.draft || preview.steps || preview.workflow || preview.message || preview.goal),
      trigger: compactText(preview.trigger?.label || preview.trigger_type || preview.definition?.trigger || '', 180) || null,
      step_count: Array.isArray(preview.steps) ? preview.steps.length : Number(preview.step_count || 0),
      steps: compactList(preview.steps, 12).map((step) => ({
        step_id: step.step_id || null,
        type: step.type || null,
        label: compactText(step.label || step.action_type || step.condition_type || step.trigger_type || '', 180) || null,
        approval_required: Boolean(step.approval_required),
      })),
      enabled: false,
      blockers: compactList(preview.blockers || preview.safety_gate?.blockers, 10),
    };
  }
  if (actionId === 'draft_email_from_newsletter') {
    return {
      ...base,
      email_draft_created: previewOk && Boolean(preview.draft_created || preview.newsletter_body || preview.subject),
      identity: compactText(preview.identity || '', 180) || null,
      audience: compactText(preview.audience || '', 180) || null,
      subject: compactText(preview.subject || '', 180) || null,
      body_preview: draftTextPreview(preview.body),
      body_preview_returned: Boolean(preview.body),
      sent: false,
    };
  }
  if (actionId === 'find_latest_newsletter_draft') {
    return {
      ...base,
      newsletter_found: previewOk && Boolean(preview.found),
      source: preview.source || null,
      source_output_id: preview.draft?.id || null,
      title: compactText(preview.draft?.title || '', 180) || null,
      body_returned: false,
    };
  }
  if (actionId === 'generate_social_posts_from_newsletter') {
    return {
      ...base,
      social_drafts_created: previewOk && Boolean(preview.draft_created || preview.newsletter_body || preview.body || preview.channels),
      channels: compactList(preview.channels, 8),
      body_preview: draftTextPreview(preview.body),
      body_preview_returned: Boolean(preview.body),
      published: false,
    };
  }
  if (actionId === 'refine_newsletter_draft') {
    const newsletterDraft = preview.revised_body || preview.draft_body || preview.newsletter_body;
    return {
      ...base,
      newsletter_refined: previewOk && Boolean(newsletterDraft || preview.source_found),
      source_found: Boolean(preview.source_found),
      source_output_id: preview.source_output_id || null,
      title: compactText(preview.title || '', 180) || null,
      revised_body_preview: draftTextPreview(preview.revised_body),
      revised_body_returned: Boolean(preview.revised_body),
      saved: false,
      next_actions: compactList(preview.next_actions, 8),
    };
  }
  if (actionId === 'refine_email') {
    return {
      ...base,
      email_refined: previewOk && Boolean(preview.draft_created || preview.body),
      subject: compactText(preview.subject || '', 180) || null,
      body_preview: draftTextPreview(preview.body),
      body_preview_returned: Boolean(preview.body),
      sent: false,
    };
  }
  if (actionId === 'create_calendar_event' || actionId === 'update_calendar_event') {
    return {
      ...base,
      calendar_draft_created: previewOk && Boolean(preview.preview || preview.event || preview.title || preview.event_id),
      title: compactText(preview.preview?.title || preview.event?.title || preview.title || '', 180) || null,
      start_at: preview.preview?.start_at || preview.event?.start_at || preview.start_at || null,
      end_at: preview.preview?.end_at || preview.event?.end_at || preview.end_at || null,
      visibility: preview.preview?.visibility || preview.event?.visibility || preview.visibility || 'provider',
      internal_calendar_write_performed: false,
      google_calendar_write_performed: false,
    };
  }
  return base;
}

async function runRabbiDraftActionTool({ args, context, db, deps, tool }, actionId, label, defaults = {}) {
  const { projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const actor = {
    user_id: context.userName || context.userId || 'rabbi_helper',
    role: 'admin',
    workspace_id: workspaceKey,
    workspace_key: workspaceKey,
    project_key: projectKey,
  };
  const inputs = {
    ...defaults,
    ...args,
    workspace_key: workspaceKey,
    project_key: projectKey,
  };
  const result = await runAction({
    action_id: actionId,
    inputs,
    dry_run: true,
    approved: false,
    source: 'operations_helper',
    actor,
  }, {
    db,
    source: 'operations_helper',
    actor,
  });
  const actionPreview = redactValue(result.preview || result.result || {});
  const preview = safeDraftActionSummary(actionId, {
    ...inputs,
    ...actionPreview,
  });
  return helperResultCard({
    tool: tool?.name || actionId,
    recordType: 'helper_audit',
    recordId: null,
    label,
    summary: `${label} prepared as a scoped draft/preview. No send, publish, sync, upload, credential, payment, access, or live external write was performed.`,
    url: `/operations?view=content&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      delegated_action_id: actionId,
      action_success: Boolean(result.success),
      missing_inputs: result.missing_inputs || [],
      approval_required: Boolean(result.approval_required),
      action_audit_log_id: result.audit_log?.action_run_id || null,
      preview,
    },
  });
}

async function createCalendarEventDraftTool(payload) {
  return runRabbiDraftActionTool(payload, 'create_calendar_event', 'Calendar event draft', {
    visibility: 'provider',
    source: 'rabbi_helper_draft',
    related_type: 'class_session',
  });
}

async function updateCalendarEventDraftTool(payload) {
  return runRabbiDraftActionTool(payload, 'update_calendar_event', 'Calendar event update draft', {
    visibility: 'provider',
  });
}

async function draftAutomationTool(payload) {
  return runRabbiDraftActionTool(payload, 'draft_automation', 'Automation draft');
}

async function draftDripSequenceTool(payload) {
  return runRabbiDraftActionTool(payload, 'draft_drip_sequence', 'Drip sequence draft');
}

async function draftEmailCampaignTool(payload) {
  return runRabbiDraftActionTool(payload, 'draft_email_campaign', 'Email campaign draft');
}

async function draftEmailFromNewsletterTool(payload) {
  return runRabbiDraftActionTool(payload, 'draft_email_from_newsletter', 'Newsletter email draft');
}

async function findLatestNewsletterDraftTool(payload) {
  return runRabbiDraftActionTool(payload, 'find_latest_newsletter_draft', 'Latest newsletter draft lookup');
}

async function generateSocialPostsFromNewsletterTool(payload) {
  return runRabbiDraftActionTool(payload, 'generate_social_posts_from_newsletter', 'Newsletter social post drafts');
}

async function previewCampaignSegmentTool(payload) {
  return runRabbiDraftActionTool(payload, 'preview_campaign_segment', 'Campaign segment preview');
}

async function refineEmailTool(payload) {
  return runRabbiDraftActionTool(payload, 'refine_email', 'Email refinement draft');
}

async function refineNewsletterDraftTool(payload) {
  return runRabbiDraftActionTool(payload, 'refine_newsletter_draft', 'Newsletter refinement draft');
}

async function runLocalRabbiDraftTool({ args, context, db, deps, tool }, label, buildPreview) {
  const { projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const preview = {
    action_id: tool?.name || label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    ...noLiveDraftFlags(),
    workspace_key: workspaceKey,
    project_key: projectKey,
    ...buildPreview(args, { workspaceKey, projectKey }),
  };
  return helperResultCard({
    tool: tool?.name,
    recordType: 'helper_audit',
    recordId: null,
    label,
    summary: `${label} prepared as a scoped local draft. No send, publish, sync, upload, credential, payment, access, or live external write was performed.`,
    url: `/operations?view=content&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      local_draft_only: true,
      preview,
    },
  });
}

async function createShoutoutDraftTool(payload) {
  return runLocalRabbiDraftTool(payload, 'Student shoutout draft', (args) => ({
    shoutout_draft_created: true,
    student_id: args.student_id || null,
    student_label: compactText(args.student_name || args.student_label || '', 120) || null,
    title: compactText(args.title || 'One Time student shoutout', 180),
    message_preview: draftTextPreview(args.message || args.body || args.notes || 'Draft a parent-safe shoutout for review.', 500),
    audience: compactText(args.audience || 'provider_review_first', 120),
    parent_visible_after_approval: true,
  }));
}

async function distillRambleTool(payload) {
  return runLocalRabbiDraftTool(payload, 'Ramble distillation draft', (args) => {
    const rawText = compactText(args.raw_text || args.text || args.message || args.prompt || '', 12000);
    const parsed = parseIntakeText({
      raw_input: rawText,
      source_type: 'operations_helper',
      source_channel: 'operations_helper',
      workspace_key: RABBI_WORKSPACE_KEY,
      project_key: RABBI_PROJECT_KEY,
    });
    return {
      ramble_distilled: true,
      raw_text_returned: false,
      text_length: rawText.length,
      affected_goal_ids: affectedGoalIdsForText(rawText).slice(0, 8),
      item_counts: extractedItemCounts(parsed),
      visible_title_suggestions: compactList(parsed.tasks, 5).map((task) => compactText(task.title || task.canonical_title || '', 180)).filter(Boolean),
      needs_register: Boolean(parsed.requirements?.length || parsed.tasks?.length || parsed.decisions?.length),
    };
  });
}

async function draftMishnayosLandingPageTool(payload) {
  return runLocalRabbiDraftTool(payload, 'Mishnayos landing page draft', (args) => ({
    landing_page_draft_created: true,
    brand_scope: 'one_time_black_yellow',
    title: compactText(args.title || 'OneTimeOneTime Mishnah', 180),
    audience: compactText(args.audience || 'parents considering One Time Mishnayos', 180),
    offer: compactText(args.offer || args.goal || 'Clear Mishnayos learning with Rabbi Scheller', 240),
    sections: [
      'hero_offer',
      'parent_problem',
      'rabbi_trust',
      'classroom_preview',
      'signup_call_to_action',
    ],
    copy_preview: draftTextPreview(args.copy || args.prompt || args.notes || 'Draft the One Time Mishnayos landing page copy for review.', 600),
    public_page_changed: false,
  }));
}

async function generateStudentWorksheetTool(payload) {
  return runLocalRabbiDraftTool(payload, 'Student worksheet draft preview', (args) => ({
    worksheet_draft_created: true,
    student_id: args.student_id || null,
    assignment_id: args.assignment_id || null,
    topic: compactText(args.topic || args.title || 'One Time Mishnah review', 180),
    level: compactText(args.level || 'student_safe', 80),
    language: compactText(args.language || 'english', 80),
    prompt_preview: draftTextPreview(args.prompt_patch || args.prompt || args.notes || 'Generate a student-safe worksheet outline for Rabbi review.', 600),
    worksheet_outline: [
      'review_prompt',
      'inside_text_question',
      'short_answer_question',
      'parent_visible_completion_note',
    ],
    worksheet_body_returned: false,
    student_access_code_returned: false,
    official_assignment_mutated: false,
  }));
}

async function draftMessageToAdminTool(payload) {
  return runLocalRabbiDraftTool(payload, 'Message to admin draft', (args) => ({
    admin_message_draft_created: true,
    subject: compactText(args.subject || args.title || 'One Time admin message draft', 180),
    message_preview: draftTextPreview(args.message || args.body || args.notes || 'Draft a message to BNA admin for review.', 700),
    recipient_scope: 'bna_admin_review',
    sent: false,
    parent_impersonation_performed: false,
  }));
}

function noExternalWriteFlags() {
  return {
    external_write_performed: false,
    external_send_performed: false,
    external_publish_performed: false,
    payment_or_access_change_performed: false,
    credential_write_performed: false,
    raw_private_body_returned: false,
    raw_contact_export_returned: false,
    raw_external_ids_returned: false,
    raw_urls_returned: false,
    student_access_code_returned: false,
  };
}

function safeInternalActionSummary(actionId, inputs = {}, actionPreview = {}, result = {}) {
  const inputFields = Object.keys(inputs || {}).filter((key) => ![
    'body',
    'description',
    'message',
    'note',
    'notes',
    'parent_email',
    'parent_phone',
    'referred_email',
    'referred_phone',
    'text',
  ].includes(key));
  const base = {
    action_id: actionId,
    ...noExternalWriteFlags(),
    workspace_key: inputs.workspace_key || RABBI_WORKSPACE_KEY,
    project_key: inputs.project_key || RABBI_PROJECT_KEY,
    status: result.executed
      ? 'executed_internal_write'
      : result.approval_required
        ? 'approval_required_before_internal_write'
        : 'previewed_internal_write',
    dry_run: Boolean(result.dry_run),
    executed: Boolean(result.executed),
    internal_write_performed: Boolean(result.executed),
    approval_required_before_live_action: Boolean(result.approval_required),
    preview_error: actionPreview.preview_error || result.error || null,
    input_fields: inputFields.slice(0, 18),
    body_preview_returned: false,
    message_preview_returned: false,
    note_preview_returned: false,
  };

  if (actionId === 'add_decision_option') {
    return {
      ...base,
      task_id: Number(inputs.task_id || 0) || null,
      option_label: compactText(inputs.option_label || actionPreview.planned_option?.label || '', 140) || null,
      decision_required: Boolean(actionPreview.decision_required || inputs.decision_required),
      next_stage: actionPreview.next_stage || null,
      next_options_returned: false,
    };
  }

  if (actionId === 'add_timeline_note') {
    return {
      ...base,
      related_type: compactText(inputs.related_type || actionPreview.related_type || '', 80) || null,
      related_id: inputs.related_id || actionPreview.related_id || null,
      visibility: compactText(inputs.visibility || '', 80) || 'internal',
    };
  }

  if (actionId === 'update_task_stage') {
    return {
      ...base,
      task_id: Number(inputs.task_id || actionPreview.task_id || 0) || null,
      stage: compactText(inputs.stage || actionPreview.next_stage || '', 80) || null,
    };
  }

  if (actionId === 'retitle_task_naturally') {
    return {
      ...base,
      task_id: Number(inputs.task_id || actionPreview.task_id || 0) || null,
      next_title: compactText(inputs.new_title || actionPreview.next_title || '', 180) || null,
      raw_previous_title_copied: false,
    };
  }

  if (actionId === 'create_calendar_event' || actionId === 'update_calendar_event') {
    const previewEvent = actionPreview.preview || actionPreview.event || {};
    return {
      ...base,
      event_id: Number(inputs.event_id || actionPreview.event_id || previewEvent.id || 0) || null,
      title: compactText(inputs.title || previewEvent.title || actionPreview.title || '', 180) || null,
      start_at: inputs.start_at || previewEvent.start_at || actionPreview.start_at || null,
      end_at: inputs.end_at || previewEvent.end_at || actionPreview.end_at || null,
      visibility: compactText(inputs.visibility || previewEvent.visibility || actionPreview.visibility || '', 80) || null,
      source: compactText(inputs.source || previewEvent.source || actionPreview.source || '', 80) || null,
      related_type: compactText(inputs.related_type || previewEvent.related_type || actionPreview.related_type || '', 80) || null,
      fields: compactList(actionPreview.fields, 12),
      meeting_url_returned: false,
      google_calendar_write_performed: false,
    };
  }

  if (actionId === 'mark_event_admin_only') {
    return {
      ...base,
      event_id: Number(inputs.event_id || actionPreview.event_id || 0) || null,
      visibility: 'internal',
      google_calendar_write_performed: false,
    };
  }

  if (actionId === 'create_provider_class_session') {
    const previewEvent = actionPreview.preview || actionPreview.event || {};
    return {
      ...base,
      title: compactText(inputs.title || previewEvent.title || '', 180) || null,
      start_at: inputs.start_at || previewEvent.start_at || null,
      visibility: 'provider',
      related_type: 'class_session',
      meeting_url_returned: false,
      google_calendar_write_performed: false,
    };
  }

  if (actionId === 'create_referral_ledger_entry') {
    return {
      ...base,
      title: compactText(inputs.title || actionPreview.title || '', 180) || null,
      no_send: true,
      referral_link_created: false,
      reward_created: false,
      lead_contact_fields_returned: false,
    };
  }

  if (actionId === 'request_provider_contact') {
    return {
      ...base,
      provider_id: Number(inputs.provider_id || actionPreview.provider_id || 0) || null,
      student_id: Number(inputs.student_id || actionPreview.student_id || 0) || null,
      preferred_contact_method: compactText(inputs.preferred_contact_method || actionPreview.preferred_contact_method || '', 80) || null,
      live_send_performed: false,
      external_booking_owned_by_provider: Boolean(actionPreview.external_booking_owned_by_provider),
      request_body_returned: false,
    };
  }

  return base;
}

async function runRabbiInternalActionTool({ args, context, db, deps, tool }, spec) {
  const { projectKey, workspaceKey } = await resolveRabbiProject({ args, context, deps, db });
  const actor = {
    user_id: context.userName || context.userId || 'rabbi_helper',
    role: 'admin',
    workspace_id: workspaceKey,
    workspace_key: workspaceKey,
    project_key: projectKey,
  };
  const inputs = {
    ...(spec.defaults || {}),
    ...args,
    workspace_key: workspaceKey,
    project_key: projectKey,
  };
  const dryRun = Boolean(args.dry_run || args.preview_only || spec.requiresConfirmation);
  const result = await runAction({
    action_id: spec.actionId,
    inputs,
    dry_run: dryRun,
    approved: false,
    source: 'operations_helper',
    actor,
  }, {
    db,
    source: 'operations_helper',
    actor,
  });
  const actionPreview = redactValue(result.preview || result.result || {});
  const preview = safeInternalActionSummary(spec.actionId, inputs, actionPreview, {
    ...result,
    approval_required: result.approval_required || Boolean(spec.requiresConfirmation),
  });
  const approvalRequired = Boolean(result.approval_required || spec.requiresConfirmation);
  const actionVerb = result.executed
    ? 'ran as a scoped internal write'
    : approvalRequired
      ? 'prepared as an approval-gated internal write preview'
      : 'prepared as a scoped internal write preview';
  return helperResultCard({
    tool: tool?.name || spec.name,
    recordType: 'helper_audit',
    recordId: null,
    label: spec.label,
    summary: `${spec.label} ${actionVerb}. No external send, publish, sync, upload, credential, payment, access, or cross-workspace write was performed.`,
    url: `/operations?view=tasks&workspace=${workspaceKey}`,
    data: {
      scope: { workspace_key: workspaceKey, project_key: projectKey },
      delegated_action_id: spec.actionId,
      action_success: Boolean(result.success),
      missing_inputs: result.missing_inputs || [],
      approval_required: approvalRequired,
      action_audit_log_id: result.audit_log?.action_run_id || null,
      preview,
    },
  });
}

const RABBI_INTERNAL_ACTION_SCOPE_SCHEMA = {
  dry_run: { type: 'boolean', default: false },
  preview_only: { type: 'boolean', default: false },
  workspace_key: { type: 'string', maxLength: 120 },
  project_key: { type: 'string', maxLength: 120 },
};

const RABBI_INTERNAL_ACTION_TOOL_DEFINITIONS = [
  {
    name: 'add_decision_option',
    actionId: 'add_decision_option',
    label: 'Decision option update',
    description: 'Add a scoped One Time decision option preview/write without creating an agent job or external write.',
    category: 'tasks',
    sideEffectLevel: 'internal_write',
    requiresConfirmation: true,
    schema: {
      task_id: { type: 'integer', required: true },
      option_label: { type: 'string', required: true, maxLength: 140 },
      option_value: { type: 'string', maxLength: 240 },
      rationale: { type: 'string', maxLength: 300 },
      reason: { type: 'string', maxLength: 300 },
      recommended: { type: 'boolean' },
      current_options: { type: 'array', maxItems: 12 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'add_timeline_note',
    actionId: 'add_timeline_note',
    label: 'Timeline note update',
    description: 'Add a scoped One Time internal timeline note without returning the raw note body.',
    category: 'tasks',
    sideEffectLevel: 'internal_write',
    schema: {
      note: { type: 'string', required: true, maxLength: 2000 },
      related_type: { type: 'string', maxLength: 80 },
      related_id: { type: 'integer' },
      visibility: { type: 'string', maxLength: 80 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'create_calendar_event',
    actionId: 'create_calendar_event',
    label: 'Calendar event update',
    description: 'Create a scoped One Time internal calendar event without Google Calendar sync.',
    category: 'calendar',
    sideEffectLevel: 'internal_write',
    schema: {
      title: { type: 'string', required: true, maxLength: 180 },
      start_at: { type: 'string', required: true, maxLength: 80 },
      end_at: { type: 'string', maxLength: 80 },
      description: { type: 'string', maxLength: 1000 },
      visibility: { type: 'string', maxLength: 40 },
      source: { type: 'string', maxLength: 80 },
      related_type: { type: 'string', maxLength: 80 },
      related_id: { type: 'integer' },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'update_calendar_event',
    actionId: 'update_calendar_event',
    label: 'Calendar event update',
    description: 'Update a scoped One Time internal calendar event without Google Calendar sync.',
    category: 'calendar',
    sideEffectLevel: 'internal_write',
    schema: {
      event_id: { type: 'integer', required: true },
      title: { type: 'string', maxLength: 180 },
      start_at: { type: 'string', maxLength: 80 },
      end_at: { type: 'string', maxLength: 80 },
      description: { type: 'string', maxLength: 1000 },
      visibility: { type: 'string', maxLength: 40 },
      status: { type: 'string', maxLength: 40 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'create_parent_visible_event',
    actionId: 'create_calendar_event',
    label: 'Parent-visible event update',
    description: 'Create a scoped One Time parent-visible internal event through the Rabbi workspace, never the BNA-only parent shortcut.',
    category: 'calendar',
    sideEffectLevel: 'internal_write',
    requiresConfirmation: true,
    defaults: {
      visibility: 'parent',
      source: 'rabbi_helper_internal',
      related_type: 'class_session',
    },
    schema: {
      title: { type: 'string', required: true, maxLength: 180 },
      start_at: { type: 'string', required: true, maxLength: 80 },
      end_at: { type: 'string', maxLength: 80 },
      description: { type: 'string', maxLength: 1000 },
      related_id: { type: 'integer' },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'mark_event_admin_only',
    actionId: 'mark_event_admin_only',
    label: 'Calendar visibility update',
    description: 'Restrict a scoped One Time calendar event to internal/admin visibility without external calendar sync.',
    category: 'calendar',
    sideEffectLevel: 'internal_write',
    schema: {
      event_id: { type: 'integer', required: true },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'create_provider_class_session',
    actionId: 'create_provider_class_session',
    label: 'Provider class session update',
    description: 'Create a scoped Rabbi provider class session without exposing BNA school accountability data.',
    category: 'calendar',
    sideEffectLevel: 'internal_write',
    schema: {
      title: { type: 'string', required: true, maxLength: 180 },
      start_at: { type: 'string', required: true, maxLength: 80 },
      end_at: { type: 'string', maxLength: 80 },
      description: { type: 'string', maxLength: 1000 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'create_referral_ledger_entry',
    actionId: 'create_referral_ledger_entry',
    label: 'Referral ledger update',
    description: 'Create a scoped One Time referral ledger preview/write without sending, exporting contacts, minting rewards, or creating referral links.',
    category: 'contacts_crm',
    sideEffectLevel: 'internal_write',
    requiresConfirmation: true,
    schema: {
      title: { type: 'string', required: true, maxLength: 180 },
      referrer_name: { type: 'string', maxLength: 160 },
      referred_name: { type: 'string', maxLength: 160 },
      student_name: { type: 'string', maxLength: 160 },
      source_detail: { type: 'string', maxLength: 240 },
      interest_level: { type: 'string', maxLength: 40 },
      next_follow_up_date: { type: 'string', maxLength: 40 },
      notes: { type: 'string', maxLength: 1000 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'request_provider_contact',
    actionId: 'request_provider_contact',
    label: 'Provider contact request update',
    description: 'Save a scoped One Time provider contact request without live send, booking, contact export, or raw body return.',
    category: 'contacts_crm',
    sideEffectLevel: 'internal_write',
    schema: {
      provider_id: { type: 'integer', required: true },
      message: { type: 'string', required: true, maxLength: 2000 },
      subject: { type: 'string', maxLength: 180 },
      student_id: { type: 'integer' },
      service_id: { type: 'integer' },
      preferred_contact_method: { type: 'string', maxLength: 80 },
      request_type: { type: 'string', maxLength: 80 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'retitle_task_naturally',
    actionId: 'retitle_task_naturally',
    label: 'Task title update',
    description: 'Retitle a scoped One Time task with a concise title while preserving raw provenance.',
    category: 'tasks',
    sideEffectLevel: 'internal_write',
    requiresConfirmation: true,
    schema: {
      task_id: { type: 'integer', required: true },
      new_title: { type: 'string', required: true, maxLength: 120 },
      current_title: { type: 'string', maxLength: 180 },
      reason: { type: 'string', maxLength: 300 },
      source_comment_id: { type: 'integer' },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
  {
    name: 'update_task_stage',
    actionId: 'update_task_stage',
    label: 'Task stage update',
    description: 'Move a scoped One Time task to another Operations stage without external writes.',
    category: 'tasks',
    sideEffectLevel: 'internal_write',
    schema: {
      task_id: { type: 'integer', required: true },
      stage: { type: 'string', required: true, maxLength: 80 },
      verification_notes: { type: 'string', maxLength: 1000 },
      ...RABBI_INTERNAL_ACTION_SCOPE_SCHEMA,
    },
  },
];

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

async function draftParentResponseTool(payload) {
  const { args } = payload;
  const result = await draftEmailTool({
    args: {
      to: args.to || args.parent_email || '',
      subject: args.subject || 'One Time parent response draft',
      body: args.body || args.message || args.notes || args.prompt || 'Draft parent response for review.',
      purpose: args.purpose || 'rabbi_parent_response_draft',
    },
  });
  return delegatedResult(result, 'draft_parent_response', 'draft_email', {
    draft_scope: 'provider_visible_parent_summary_only',
    sent: false,
  });
}

async function draftWeeklyUpdateTool(payload) {
  const { args } = payload;
  const result = await draftEmailTool({
    args: {
      to: args.to || args.recipient_segment || '',
      subject: args.subject || 'One Time weekly update draft',
      body: args.body || args.update || args.notes || args.prompt || 'Draft weekly update for review.',
      purpose: args.purpose || 'rabbi_weekly_update_draft',
    },
  });
  return delegatedResult(result, 'draft_weekly_update', 'draft_email', {
    draft_scope: 'one_time_provider_update',
    sent: false,
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
      name: 'capture_ramble',
      description: 'Capture a Rabbi / One Time ramble as raw intake and parse it into BNA lanes.',
      category: 'intake',
      risk: 'medium',
      schema: {
        raw_text: { type: 'string', maxLength: 20000 },
        text: { type: 'string', maxLength: 20000 },
        message: { type: 'string', maxLength: 20000 },
        prompt: { type: 'string', maxLength: 20000 },
        source_type: { type: 'string', maxLength: 80, default: 'operations_helper' },
        source_channel: { type: 'string', maxLength: 80, default: 'operations_helper' },
        source_date: { type: 'string', maxLength: 40 },
        intake_type: { type: 'string', maxLength: 80, default: 'helper' },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, captureRambleTool),
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
      name: 'show_operating_goals',
      description: 'Show operating and quality goals relevant to the Rabbi / One Time helper scope.',
      category: 'watchdog',
      sideEffectLevel: 'read_only',
      schema: {
        text: { type: 'string', maxLength: 4000 },
        goal_text: { type: 'string', maxLength: 4000 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showOperatingGoalsTool),
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
      name: 'create_rabbi_shiur_idea',
      description: 'Create a Rabbi / One Time shiur idea task from natural language.',
      category: 'tasks',
      schema: {
        title: { type: 'string', maxLength: 240 },
        topic: { type: 'string', maxLength: 240 },
        idea: { type: 'string', maxLength: 4000 },
        prompt: { type: 'string', maxLength: 4000 },
        raw_text: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 10000 },
        summary: { type: 'string', maxLength: 1000 },
        assigned_to: { type: 'string', maxLength: 120 },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        stage: { type: 'string', maxLength: 40, default: 'assigned' },
        due_date: { type: 'string', maxLength: 40 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createRabbiShiurIdeaTool),
    makeDefinition({
      name: 'create_rabbi_source_sheet_task',
      description: 'Create a Rabbi / One Time source sheet preparation task from natural language.',
      category: 'tasks',
      schema: {
        title: { type: 'string', maxLength: 240 },
        topic: { type: 'string', maxLength: 240 },
        prompt: { type: 'string', maxLength: 4000 },
        raw_text: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 10000 },
        summary: { type: 'string', maxLength: 1000 },
        assigned_to: { type: 'string', maxLength: 120 },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        stage: { type: 'string', maxLength: 40, default: 'assigned' },
        due_date: { type: 'string', maxLength: 40 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createRabbiSourceSheetTaskTool),
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
      name: 'route_bug_to_codex',
      description: 'Route a Rabbi / One Time bug or helper issue to Codex as a scoped work item.',
      category: 'codex',
      schema: {
        title: { type: 'string', maxLength: 240 },
        issue: { type: 'string', maxLength: 4000 },
        description: { type: 'string', maxLength: 4000 },
        expected: { type: 'string', maxLength: 2000 },
        actual: { type: 'string', maxLength: 2000 },
        notes: { type: 'string', maxLength: 4000 },
        summary: { type: 'string', maxLength: 1000 },
        urgency: { type: 'string', maxLength: 40, default: 'this_week' },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, routeBugToCodexTool),
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
      name: 'show_one_time_launch_checklist',
      description: 'Show a read-only One Time launch checklist plus scoped open tasks/blockers.',
      category: 'reports',
      sideEffectLevel: 'read_only',
      schema: {
        limit: { type: 'integer', default: 20 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showOneTimeLaunchChecklistTool),
    makeDefinition({
      name: 'list_calendar_sessions',
      description: 'List One Time calendar sessions without returning meeting URLs or private descriptions.',
      category: 'calendar',
      sideEffectLevel: 'read_only',
      schema: {
        status: { type: 'string', maxLength: 40 },
        date_from: { type: 'string', maxLength: 40 },
        date_to: { type: 'string', maxLength: 40 },
        limit: { type: 'integer', default: 10 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, listCalendarSessionsTool),
    makeDefinition({
      name: 'open_calendar_event',
      description: 'Open a scoped One Time calendar event link after verifying workspace ownership.',
      category: 'calendar',
      sideEffectLevel: 'read_only',
      schema: {
        event_id: { type: 'integer', required: true },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, openCalendarEventTool),
    makeDefinition({
      name: 'view_email_log',
      description: 'Show scoped One Time email log summaries without email bodies or raw addresses.',
      category: 'communications',
      sideEffectLevel: 'read_only',
      schema: {
        status: { type: 'string', maxLength: 80 },
        direction: { type: 'string', maxLength: 40 },
        limit: { type: 'integer', default: 10 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, viewEmailLogTool),
    makeDefinition({
      name: 'show_contact_communication_history',
      description: 'Show scoped contact communication summaries without raw private message bodies.',
      category: 'communications',
      sideEffectLevel: 'read_only',
      schema: {
        contact_id: { type: 'integer' },
        signup_id: { type: 'integer' },
        student_id: { type: 'integer' },
        email: { type: 'string', maxLength: 240 },
        phone: { type: 'string', maxLength: 80 },
        contact_name: { type: 'string', maxLength: 120 },
        limit: { type: 'integer', default: 10 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showContactCommunicationHistoryTool),
    makeDefinition({
      name: 'list_provider_leads',
      description: 'List One Time provider contact lead and signup summaries without contact exports, raw notes, or phone/email values.',
      category: 'contacts_crm',
      sideEffectLevel: 'read_only',
      schema: {
        status: { type: 'string', maxLength: 80 },
        search: { type: 'string', maxLength: 120 },
        limit: { type: 'integer', default: 10 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, listProviderLeadsTool),
    makeDefinition({
      name: 'open_content_item_url',
      description: 'Open a scoped One Time content item link without returning raw media or Drive URLs.',
      category: 'content',
      sideEffectLevel: 'read_only',
      schema: {
        content_id: { type: 'integer', required: true },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, openContentItemUrlTool),
    makeDefinition({
      name: 'list_students',
      description: 'List scoped One Time student summaries without parent contact values, access codes, or private notes.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        search: { type: 'string', maxLength: 120 },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, listStudentsTool),
    makeDefinition({
      name: 'show_assignments',
      description: 'Show parent-visible scoped One Time assignment summaries without worksheet bodies, raw instructions, or private links.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showAssignmentsTool),
    makeDefinition({
      name: 'show_my_assignments',
      description: 'Show student-visible scoped One Time assignment summaries without worksheet bodies, raw instructions, or private links.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showAssignmentsTool),
    makeDefinition({
      name: 'show_my_goals',
      description: 'Show student-visible scoped One Time goal summaries without raw notes or private goal metadata.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showGoalsTool),
    makeDefinition({
      name: 'show_parent_students',
      description: 'Show scoped One Time student roster summaries for parent-facing review without contact values or access codes.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        search: { type: 'string', maxLength: 120 },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, listStudentsTool),
    makeDefinition({
      name: 'show_student_progress',
      description: 'Show student-visible scoped One Time progress summaries without parent contact values, access codes, private notes, or raw assignment links.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showStudentProgressTool),
    makeDefinition({
      name: 'show_student_progress_for_parent',
      description: 'Show parent-visible scoped One Time progress summaries without contact values, access codes, private notes, or raw assignment links.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showStudentProgressTool),
    makeDefinition({
      name: 'show_child_calendar',
      description: 'Show parent-visible scoped One Time calendar summaries without meeting URLs.',
      category: 'calendar',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, showChildCalendarTool),
    makeDefinition({
      name: 'view_parent_visible_notes',
      description: 'Show scoped One Time parent-visible note previews without raw private metadata or non-parent-visible notes.',
      category: 'students',
      sideEffectLevel: 'read_only',
      schema: {
        student_id: { type: 'integer' },
        limit: { type: 'integer', default: 25 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, viewParentVisibleNotesTool),
    makeDefinition({
      name: 'calendar_batch_launch_plan_preview',
      description: 'Preview a scoped One Time launch calendar batch without creating internal events or writing to Google Calendar.',
      category: 'calendar',
      sideEffectLevel: 'draft_only',
      schema: {
        program: { type: 'string', maxLength: 180 },
        start_date: { type: 'string', maxLength: 40 },
        start_at: { type: 'string', maxLength: 80 },
        weeks: { type: 'integer', default: 8 },
        class_time: { type: 'string', maxLength: 40 },
        timezone: { type: 'string', maxLength: 120 },
        notes: { type: 'string', maxLength: 2000 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, calendarBatchLaunchPlanPreviewTool),
    makeDefinition({
      name: 'classroom_topic_material_preview',
      description: 'Preview a scoped Classroom topic/material payload without reading or writing Google Classroom.',
      category: 'calendar',
      sideEffectLevel: 'draft_only',
      schema: {
        course_id: { type: 'string', maxLength: 120 },
        course_name: { type: 'string', maxLength: 180 },
        topic_id: { type: 'string', maxLength: 120 },
        topic_name: { type: 'string', maxLength: 120 },
        material_title: { type: 'string', maxLength: 180 },
        material_url: { type: 'string', maxLength: 400 },
        description: { type: 'string', maxLength: 2000 },
        source_type: { type: 'string', maxLength: 80 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, classroomTopicMaterialPreviewTool),
    makeDefinition({
      name: 'google_drive_find_file_preview',
      description: 'Preview a scoped Google Drive file search/import plan without reading or writing Drive data.',
      category: 'content',
      sideEffectLevel: 'draft_only',
      schema: {
        query: { type: 'string', maxLength: 220 },
        folder_id: { type: 'string', maxLength: 180 },
        folder_name: { type: 'string', maxLength: 180 },
        source_stage: { type: 'string', maxLength: 120 },
        mime_type: { type: 'string', maxLength: 120 },
        limit: { type: 'integer', default: 10 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, googleDriveFindFilePreviewTool),
    makeDefinition({
      name: 'google_drive_create_doc_preview',
      description: 'Preview a scoped Google Drive document creation plan without writing to Drive or returning raw body text.',
      category: 'content',
      sideEffectLevel: 'draft_only',
      schema: {
        title: { type: 'string', maxLength: 180 },
        body: { type: 'string', maxLength: 4000 },
        folder_id: { type: 'string', maxLength: 180 },
        folder_name: { type: 'string', maxLength: 180 },
        related_type: { type: 'string', maxLength: 80 },
        related_id: { type: 'integer' },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, googleDriveCreateDocPreviewTool),
    makeDefinition({
      name: 'google_drive_create_folder_preview',
      description: 'Preview a scoped Google Drive folder creation plan without writing to Drive or returning raw folder IDs.',
      category: 'content',
      sideEffectLevel: 'draft_only',
      schema: {
        folder_name: { type: 'string', maxLength: 180 },
        parent_folder_id: { type: 'string', maxLength: 180 },
        provider_id: { type: 'integer' },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, googleDriveCreateFolderPreviewTool),
    makeDefinition({
      name: 'google_business_place_id_lookup',
      description: 'Preview a scoped Google Business Place ID lookup plan without live Maps or Google Business reads.',
      category: 'integrations',
      sideEffectLevel: 'draft_only',
      schema: {
        query: { type: 'string', maxLength: 220 },
        provider_name: { type: 'string', maxLength: 180 },
        google_maps_url: { type: 'string', maxLength: 400 },
        google_place_id: { type: 'string', maxLength: 220 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, googleBusinessPlaceIdLookupTool),
    makeDefinition({
      name: 'google_business_list_locations_preview',
      description: 'Preview a scoped Google Business locations read plan without live Google Business API reads or writes.',
      category: 'integrations',
      sideEffectLevel: 'draft_only',
      schema: {
        provider_name: { type: 'string', maxLength: 180 },
        account_id: { type: 'string', maxLength: 180 },
        location_id: { type: 'string', maxLength: 180 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, googleBusinessListLocationsPreviewTool),
    ...RABBI_INTERNAL_ACTION_TOOL_DEFINITIONS.map((spec) => makeDefinition({
      name: spec.name,
      description: spec.description,
      category: spec.category,
      sideEffectLevel: spec.sideEffectLevel,
      requiresConfirmation: Boolean(spec.requiresConfirmation),
      schema: spec.schema,
    }, (payload) => runRabbiInternalActionTool(payload, spec))),
    makeDefinition({
      name: 'create_calendar_event_draft',
      description: 'Preview a scoped One Time calendar event without creating an internal event or syncing Google Calendar.',
      category: 'calendar',
      sideEffectLevel: 'draft_only',
      schema: {
        title: { type: 'string', required: true, maxLength: 180 },
        start_at: { type: 'string', required: true, maxLength: 80 },
        end_at: { type: 'string', maxLength: 80 },
        description: { type: 'string', maxLength: 1000 },
        visibility: { type: 'string', maxLength: 40 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createCalendarEventDraftTool),
    makeDefinition({
      name: 'update_calendar_event_draft',
      description: 'Preview a scoped One Time calendar event update without changing the event or syncing Google Calendar.',
      category: 'calendar',
      sideEffectLevel: 'draft_only',
      schema: {
        event_id: { type: 'integer', required: true },
        title: { type: 'string', maxLength: 180 },
        start_at: { type: 'string', maxLength: 80 },
        end_at: { type: 'string', maxLength: 80 },
        description: { type: 'string', maxLength: 1000 },
        visibility: { type: 'string', maxLength: 40 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, updateCalendarEventDraftTool),
    makeDefinition({
      name: 'create_shoutout_draft',
      description: 'Create a parent-safe One Time shoutout draft without publishing or notifying anyone.',
      category: 'students',
      sideEffectLevel: 'draft_only',
      schema: {
        student_id: { type: 'integer' },
        student_name: { type: 'string', maxLength: 120 },
        student_label: { type: 'string', maxLength: 120 },
        title: { type: 'string', maxLength: 180 },
        message: { type: 'string', maxLength: 2000 },
        body: { type: 'string', maxLength: 2000 },
        notes: { type: 'string', maxLength: 2000 },
        audience: { type: 'string', maxLength: 120 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, createShoutoutDraftTool),
    makeDefinition({
      name: 'distill_ramble',
      description: 'Distill Rabbi / One Time natural-language ramble text into scoped lanes without returning raw private wording.',
      category: 'intake',
      sideEffectLevel: 'draft_only',
      schema: {
        raw_text: { type: 'string', maxLength: 12000 },
        text: { type: 'string', maxLength: 12000 },
        message: { type: 'string', maxLength: 12000 },
        prompt: { type: 'string', maxLength: 12000 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, distillRambleTool),
    makeDefinition({
      name: 'draft_automation',
      description: 'Compile a scoped One Time automation draft without enabling it or sending messages.',
      category: 'automations',
      sideEffectLevel: 'draft_only',
      schema: {
        message: { type: 'string', required: true, maxLength: 4000 },
        goal: { type: 'string', maxLength: 1000 },
        definition: { type: 'object' },
        sample_event: { type: 'object' },
        conversation_key: { type: 'string', maxLength: 180 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftAutomationTool),
    makeDefinition({
      name: 'draft_drip_sequence',
      description: 'Draft a scoped One Time drip sequence preview without enabling or sending it.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        goal: { type: 'string', required: true, maxLength: 1000 },
        audience: { type: 'object' },
        segment_name: { type: 'string', maxLength: 180 },
        estimated_count: { type: 'integer' },
        consent_count: { type: 'integer' },
        messages: { type: 'array', maxItems: 12 },
        message_count: { type: 'integer', default: 3 },
        schedule: { type: 'object' },
        intervals: { type: 'array', maxItems: 12 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftDripSequenceTool),
    makeDefinition({
      name: 'draft_email_campaign',
      description: 'Draft a scoped One Time email campaign preview without sending email.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        goal: { type: 'string', required: true, maxLength: 1000 },
        audience: { type: 'object' },
        segment_name: { type: 'string', maxLength: 180 },
        estimated_count: { type: 'integer' },
        consent_count: { type: 'integer' },
        subject: { type: 'string', maxLength: 180 },
        body: { type: 'string', maxLength: 4000 },
        schedule: { type: 'object' },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftEmailCampaignTool),
    makeDefinition({
      name: 'draft_email_from_newsletter',
      description: 'Draft a scoped email from a newsletter body without sending email.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        output_id: { type: 'integer' },
        newsletter_body: { type: 'string', maxLength: 10000 },
        subject: { type: 'string', maxLength: 180 },
        audience: { type: 'string', maxLength: 180 },
        identity: { type: 'string', maxLength: 180 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftEmailFromNewsletterTool),
    makeDefinition({
      name: 'draft_mishnayos_landing_page',
      description: 'Draft One Time Mishnayos landing page copy without changing the public page.',
      category: 'content',
      sideEffectLevel: 'draft_only',
      schema: {
        title: { type: 'string', maxLength: 180 },
        audience: { type: 'string', maxLength: 180 },
        offer: { type: 'string', maxLength: 240 },
        goal: { type: 'string', maxLength: 240 },
        copy: { type: 'string', maxLength: 4000 },
        prompt: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 4000 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftMishnayosLandingPageTool),
    makeDefinition({
      name: 'find_latest_newsletter_draft',
      description: 'Find the newest scoped newsletter draft metadata without returning the raw newsletter body.',
      category: 'content',
      sideEffectLevel: 'draft_only',
      schema: {
        output_id: { type: 'integer' },
        status: { type: 'string', maxLength: 80 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, findLatestNewsletterDraftTool),
    makeDefinition({
      name: 'generate_social_posts_from_newsletter',
      description: 'Generate scoped social post drafts from newsletter text without publishing or scheduling.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        output_id: { type: 'integer' },
        newsletter_body: { type: 'string', maxLength: 10000 },
        body: { type: 'string', maxLength: 10000 },
        channels: { type: 'array', maxItems: 8 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, generateSocialPostsFromNewsletterTool),
    makeDefinition({
      name: 'generate_student_worksheet',
      description: 'Preview a scoped One Time student worksheet draft without mutating official assignments or exposing access codes.',
      category: 'students',
      sideEffectLevel: 'draft_only',
      schema: {
        student_id: { type: 'integer' },
        assignment_id: { type: 'integer' },
        topic: { type: 'string', maxLength: 180 },
        title: { type: 'string', maxLength: 180 },
        prompt: { type: 'string', maxLength: 4000 },
        prompt_patch: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 4000 },
        language: { type: 'string', maxLength: 80 },
        level: { type: 'string', maxLength: 80 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, generateStudentWorksheetTool),
    makeDefinition({
      name: 'preview_campaign_segment',
      description: 'Preview a scoped One Time campaign segment without returning contacts or sending messages.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        segment_name: { type: 'string', required: true, maxLength: 180 },
        audience_label: { type: 'string', maxLength: 180 },
        estimated_count: { type: 'integer' },
        consent_count: { type: 'integer' },
        suppression_counts: { type: 'object' },
        exclusions: { type: 'array', maxItems: 12 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, previewCampaignSegmentTool),
    makeDefinition({
      name: 'refine_email',
      description: 'Refine an email draft without sending or scheduling it.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        body: { type: 'string', required: true, maxLength: 10000 },
        instruction: { type: 'string', maxLength: 1000 },
        subject: { type: 'string', maxLength: 180 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, refineEmailTool),
    makeDefinition({
      name: 'refine_newsletter_draft',
      description: 'Refine a scoped newsletter draft preview without saving or approving it.',
      category: 'content',
      sideEffectLevel: 'draft_only',
      schema: {
        output_id: { type: 'integer' },
        draft_body: { type: 'string', maxLength: 10000 },
        newsletter_body: { type: 'string', maxLength: 10000 },
        instruction: { type: 'string', maxLength: 1000 },
        save_revision: { type: 'boolean', default: false },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, refineNewsletterDraftTool),
    makeDefinition({
      name: 'draft_message_to_admin',
      description: 'Draft a scoped message to BNA admin without sending it or impersonating a parent.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        subject: { type: 'string', maxLength: 180 },
        title: { type: 'string', maxLength: 180 },
        message: { type: 'string', maxLength: 4000 },
        body: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 4000 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftMessageToAdminTool),
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
    ...[
      ['create_report_problem_ticket', 'Create a Rabbi / One Time problem-report ticket.', createReportProblemTicketTool],
      ['create_ticket', 'Create a Rabbi / One Time support ticket.', createTicketTool],
      ['create_help_request', 'Create a Rabbi / One Time help-request ticket.', createHelpRequestTool],
    ].map(([name, description, handler]) => makeDefinition({
      name,
      description,
      category: 'support',
      risk: 'medium',
      schema: {
        title: { type: 'string', maxLength: 180 },
        issue: { type: 'string', maxLength: 4000 },
        description: { type: 'string', maxLength: 4000 },
        body: { type: 'string', maxLength: 4000 },
        notes: { type: 'string', maxLength: 4000 },
        expected: { type: 'string', maxLength: 2000 },
        severity: { type: 'string', maxLength: 40, default: 'normal' },
        category: { type: 'string', maxLength: 80, default: 'task_manager' },
        assigned_to: { type: 'string', maxLength: 120 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, handler)),
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
      name: 'draft_parent_response',
      description: 'Prepare a provider-visible parent response draft without sending email.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        to: { type: 'string', maxLength: 240 },
        parent_email: { type: 'string', maxLength: 240 },
        subject: { type: 'string', maxLength: 240 },
        body: { type: 'string', maxLength: 10000 },
        message: { type: 'string', maxLength: 10000 },
        notes: { type: 'string', maxLength: 10000 },
        prompt: { type: 'string', maxLength: 10000 },
        purpose: { type: 'string', maxLength: 240 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftParentResponseTool),
    makeDefinition({
      name: 'draft_weekly_update',
      description: 'Prepare a Rabbi / One Time weekly update draft without sending it.',
      category: 'communications',
      sideEffectLevel: 'draft_only',
      schema: {
        to: { type: 'string', maxLength: 240 },
        recipient_segment: { type: 'string', maxLength: 240 },
        subject: { type: 'string', maxLength: 240 },
        body: { type: 'string', maxLength: 10000 },
        update: { type: 'string', maxLength: 10000 },
        notes: { type: 'string', maxLength: 10000 },
        prompt: { type: 'string', maxLength: 10000 },
        purpose: { type: 'string', maxLength: 240 },
        workspace_key: { type: 'string', maxLength: 120 },
        project_key: { type: 'string', maxLength: 120 },
      },
    }, draftWeeklyUpdateTool),
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
