const { listActions } = require('../../lib/actions/registry');

const REQUIREMENT_ID = 'REQ-20260623-025';
const SNAPSHOT_VERSION = 'assistant-control-center-v1';

const STATUS_TABLES = Object.freeze([
  ['conversations', 'assistant_conversations', 'status'],
  ['action_plans', 'assistant_action_plans', 'status'],
  ['action_runs', 'assistant_action_runs', 'status'],
  ['previews', 'assistant_previews', 'status'],
  ['approvals', 'assistant_approvals', 'status'],
  ['drafts', 'assistant_drafts', 'status'],
  ['draft_versions', 'assistant_draft_versions', 'approval_state'],
  ['reminders', 'assistant_reminders', 'status'],
  ['notifications', 'assistant_notifications', 'status'],
  ['onboarding_sessions', 'assistant_onboarding_sessions', 'status'],
  ['delivery_outbox', 'assistant_delivery_outbox', 'status'],
  ['dead_letters', 'assistant_dead_letters', 'status'],
]);

function emptyStatusMap() {
  return { total: 0, by_status: {}, unavailable: false };
}

async function safeQuery(db, sql, params = []) {
  if (!db || typeof db.query !== 'function') return { rows: [], unavailable: true };
  if (/\b(insert|update|delete|truncate|drop|alter|create)\b/i.test(sql)) {
    throw new Error('control_center_queries_are_read_only');
  }
  try {
    const result = await db.query(sql, params);
    return { rows: result.rows || [], unavailable: false };
  } catch (error) {
    return { rows: [], unavailable: true, error: error.message || String(error) };
  }
}

async function statusCounts(db, table, column) {
  const result = await safeQuery(
    db,
    `SELECT COALESCE(${column}, 'unknown') AS status, COUNT(*)::int AS count FROM ${table} GROUP BY 1 ORDER BY 1`
  );
  const counts = emptyStatusMap();
  counts.unavailable = result.unavailable;
  for (const row of result.rows) {
    const key = String(row.status || 'unknown');
    const count = Number(row.count || 0);
    counts.by_status[key] = count;
    counts.total += count;
  }
  return counts;
}

async function recentRows(db, table, columns, orderColumn = 'updated_at', limit = 8) {
  const selected = columns.join(', ');
  const result = await safeQuery(
    db,
    `SELECT ${selected} FROM ${table} ORDER BY ${orderColumn} DESC NULLS LAST LIMIT $1`,
    [limit]
  );
  return {
    unavailable: result.unavailable,
    rows: result.rows.map((row) => Object.fromEntries(
      Object.entries(row).filter(([key]) => !/body|payload|content|secret|token/i.test(key))
    )),
  };
}

function registryCoverage() {
  const actions = listActions();
  const risky = actions.filter((action) => action.approval_required || /send|publish|charge|deploy|enable/i.test(`${action.action_id} ${action.label}`));
  return {
    total_actions: actions.length,
    telegram_ready: actions.filter((action) => (action.telegram_intent_examples || []).length).length,
    website_ready: actions.filter((action) => (action.ui_button_labels || action.related_routes || []).length).length,
    approval_required: actions.filter((action) => action.approval_required).length,
    risky_without_approval: risky.filter((action) => !action.approval_required).map((action) => action.action_id),
    missing_handlers: actions.filter((action) => !action.execution_handler).map((action) => action.action_id),
    missing_telegram_examples: actions.filter((action) => !(action.telegram_intent_examples || []).length).map((action) => action.action_id),
  };
}

async function buildAssistantControlCenterSnapshot({ db, actor = {}, now = new Date() } = {}) {
  const statuses = {};
  for (const [key, table, column] of STATUS_TABLES) {
    statuses[key] = await statusCounts(db, table, column);
  }

  const [
    conversations,
    actionPlans,
    approvals,
    drafts,
    reminders,
    deliveries,
    deadLetters,
  ] = await Promise.all([
    recentRows(db, 'assistant_conversations', ['conversation_key', 'channel_key', 'role_key', 'workspace_key', 'project_key', 'status', 'updated_at']),
    recentRows(db, 'assistant_action_plans', ['plan_key', 'conversation_key', 'actor_identity_key', 'action_id', 'status', 'approval_required', 'workspace_key', 'project_key', 'updated_at']),
    recentRows(db, 'assistant_approvals', ['approval_key', 'action_run_key', 'actor_identity_key', 'status', 'expires_at', 'workspace_key', 'project_key', 'created_at'], 'created_at'),
    recentRows(db, 'assistant_drafts', ['draft_key', 'object_type', 'object_id', 'active_version_key', 'status', 'workspace_key', 'project_key', 'updated_at']),
    recentRows(db, 'assistant_reminders', ['reminder_key', 'actor_identity_key', 'status', 'next_run_at', 'workspace_key', 'project_key', 'updated_at']),
    recentRows(db, 'assistant_delivery_outbox', ['delivery_key', 'conversation_key', 'channel_key', 'status', 'attempts', 'next_attempt_at', 'sent_at']),
    recentRows(db, 'assistant_dead_letters', ['dead_letter_key', 'source_table', 'source_key', 'status', 'created_at']),
  ]);

  const coverage = registryCoverage();
  const blockers = [
    statuses.approvals.by_status.pending ? 'pending_approvals' : '',
    statuses.delivery_outbox.by_status.failed ? 'failed_deliveries' : '',
    statuses.dead_letters.total ? 'dead_letters' : '',
    coverage.risky_without_approval.length ? 'risky_action_without_approval' : '',
    coverage.missing_handlers.length ? 'missing_action_handlers' : '',
  ].filter(Boolean);

  return {
    success: true,
    requirement_id: REQUIREMENT_ID,
    snapshot_version: SNAPSHOT_VERSION,
    generated_at: now instanceof Date ? now.toISOString() : new Date(now).toISOString(),
    actor: {
      role: actor.role || actor.actor_role || 'unknown',
      scope_type: actor.scope?.type || actor.scope_type || 'unknown',
      workspace_key: actor.workspace_key || actor.workspaceKey || null,
      project_key: actor.project_key || actor.projectKey || actor.scope?.projectKey || null,
    },
    statuses,
    registry_coverage: coverage,
    recent: {
      conversations,
      action_plans: actionPlans,
      approvals,
      drafts,
      reminders,
      deliveries,
      dead_letters: deadLetters,
    },
    management_prompts: [
      'Show everything the bot can currently do.',
      'Which UI actions are missing natural-language support?',
      'What automations are running?',
      'Which campaigns are waiting for approval?',
      'What did the agents finish today?',
    ],
    blockers,
    no_write_guard: [
      'read_only_status_counts_and_redacted_recent_rows_only',
      'no_action_execution',
      'no_external_send_publish_charge_dns_oauth_or_connector_call',
      'no_raw_message_body_or_secret_payload_returned',
    ],
  };
}

module.exports = {
  REQUIREMENT_ID,
  SNAPSHOT_VERSION,
  buildAssistantControlCenterSnapshot,
  registryCoverage,
};
