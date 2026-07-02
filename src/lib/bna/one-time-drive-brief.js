const crypto = require('crypto');

const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_SOURCE_DATE = '2026-06-18';

const LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE = {
  drive_file_id: '1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI',
  title: '2026-06-18-rabbi-elie-scheller.md',
  url: 'https://drive.google.com/file/d/1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI/view',
  created_time: '2026-06-18T17:16:22.555Z',
  modified_time: '2026-06-18T17:16:21.504Z',
  mime_type: 'text/markdown',
};

const SERVICE_DECISION_SPECS = [
  {
    key: 'zoom_access',
    service: 'Zoom',
    title: 'Verify Zoom owner role, license, and app-management path',
    owner: 'Rabbi Elie + Shloimie',
    due_date: '2026-06-19',
    required_inputs: ['Zoom account ID', 'Shloimie role', 'license state', 'Server-to-Server OAuth app permission', 'required scopes'],
    blocked_actions: ['meeting_create', 'account_grant', 'role_change', 'user_management'],
  },
  {
    key: 'vimeo_access',
    service: 'Vimeo',
    title: 'Decide Vimeo seat, user, token, and manual-library strategy',
    owner: 'Rabbi Elie',
    due_date: '2026-06-19',
    required_inputs: ['Vimeo team seat decision', 'temporary shared-login exception decision', 'token/app ownership', 'approved domains for embeds'],
    blocked_actions: ['video_upload', 'privacy_change', 'folder_write'],
  },
  {
    key: 'resend_account',
    service: 'Resend',
    title: 'Decide Resend recovery, new account, or alternate email provider',
    owner: 'Rabbi Elie + Shloimie',
    due_date: '2026-06-20',
    required_inputs: ['Resend account owner', 'sending domain', 'from identity', 'API key stored server-side', 'DNS records from dashboard'],
    blocked_actions: ['email_send', 'domain_verify_write'],
  },
  {
    key: 'dns_domain',
    service: 'DNS/domain',
    title: 'Identify One Time launch domain and DNS authority',
    owner: 'Rabbi Elie',
    due_date: '2026-06-20',
    required_inputs: ['domain name', 'registrar', 'DNS host', 'delegated access or screenshare plan', 'provider-generated records'],
    blocked_actions: ['dns_record_create', 'domain_connect'],
  },
  {
    key: 'stripe_payment',
    service: 'Stripe',
    title: 'Confirm Stripe role, live/test mode, and payment structure',
    owner: 'Rabbi Elie + Shloimie',
    due_date: '2026-06-19',
    required_inputs: ['Shloimie role', 'developer/webhook access', 'test/live separation', 'products/prices', 'webhook endpoint plan'],
    blocked_actions: ['checkout_create', 'live_billing', 'refund'],
  },
  {
    key: 'calendar_source',
    service: 'Calendar',
    title: 'Choose internal calendar now or external sync after smoke tests',
    owner: 'Shloimie',
    due_date: '2026-06-20',
    required_inputs: ['calendar source of truth', 'class reminder policy', 'Zoom/calendar dependency decision'],
    blocked_actions: ['external_calendar_sync', 'student_reminder_send'],
  },
  {
    key: 'youtube_deferred',
    service: 'YouTube',
    title: 'Defer or grant YouTube channel access for Week 3 content workflow',
    owner: 'Rabbi Elie',
    due_date: '2026-07-03',
    required_inputs: ['channel permission decision', 'upload/analytics need', 'posting owner'],
    blocked_actions: ['youtube_upload', 'analytics_read'],
  },
  {
    key: 'meta_deferred',
    service: 'Meta/Facebook',
    title: 'Schedule separate Meta access session before ads or page posting',
    owner: 'Rabbi Elie + Shloimie',
    due_date: '2026-06-24',
    required_inputs: ['business/page role', 'pixel/domain status', 'ad spend decision'],
    blocked_actions: ['ad_launch', 'pixel_write', 'lead_form_sync'],
  },
  {
    key: 'email_provider_decision',
    service: 'Google/email provider',
    title: 'Choose first-party email path without reviving active GHL runtime',
    owner: 'Shloimie + Rabbi Elie',
    due_date: '2026-06-24',
    required_inputs: ['email provider decision', 'domain records', 'legal import policy for email lists'],
    blocked_actions: ['crm_publish', 'bulk_email_send', 'contact_import'],
    notes: 'The meeting brief mentions GHL historically; active runtime remains first-party BNA unless the operator explicitly approves otherwise.',
  },
];

const PRODUCT_DECISION_SPECS = [
  ['launch_positioning', 'Confirm Worldwide Mishnayos launch positioning and starting masechta', 'Rabbi Elie + Shloimie', '2026-06-20'],
  ['first_offer', 'Choose first funnel offer and pricing', 'Rabbi Elie + Shloimie', '2026-06-20'],
  ['first_100_offer', 'Approve or reject first-100 free-month/shout-out/kit offer', 'Rabbi Elie', '2026-06-21'],
  ['live_format', 'Choose live format: room broadcast, Zoom-only, or hybrid', 'Rabbi Elie + Shloimie', '2026-06-21'],
  ['question_model', 'Choose student question submission and moderation model', 'Rabbi Elie + Shloimie', '2026-06-21'],
  ['video_library_policy', 'Decide same-day video library posting requirements', 'Rabbi Elie + Shloimie', '2026-06-24'],
  ['payment_policy', 'Set refunds, cancellation, sharing, bank, and accounting rules', 'Rabbi Elie + Shloimie', '2026-06-24'],
  ['ai_review_standard', 'Set public AI review and visual guardrail standard', 'Rabbi Elie', '2026-06-24'],
];

const TIMELINE_TASK_SPECS = [
  ['verify_zoom', 'Verify Zoom account role, plan/license, and app-management path', 'Rabbi Elie + Shloimie', '2026-06-19', 'decision'],
  ['confirm_vimeo', 'Confirm Vimeo seat/user/API strategy', 'Rabbi Elie', '2026-06-19', 'decision'],
  ['confirm_stripe', 'Confirm Stripe role, live/test mode, and payment structure', 'Rabbi Elie + Shloimie', '2026-06-19', 'decision'],
  ['identify_dns', 'Identify domain registrar/DNS host and verification notices', 'Rabbi Elie', '2026-06-20', 'decision'],
  ['choose_resend', 'Decide Resend recovery vs new One Time account vs alternate email provider', 'Shloimie + Rabbi Elie', '2026-06-20', 'decision'],
  ['verify_roles', 'Confirm One Time workspace owner/admin model and safe login handoff', 'Shloimie + Codex', '2026-06-21', 'codex'],
  ['zoom_workflow', 'Create Zoom app after owner approval or document manual Zoom workflow', 'Shloimie', '2026-06-26', 'blocked'],
  ['vimeo_workflow', 'Configure Vimeo API after approval or document manual video-library workflow', 'Shloimie', '2026-06-26', 'blocked'],
  ['email_dns', 'Configure Resend/email sending domain records after DNS access', 'Shloimie + Rabbi Elie', '2026-06-27', 'blocked'],
  ['stripe_plan', 'Draft Stripe products, prices, and webhook/access plan', 'Shloimie', '2026-06-28', 'blocked'],
  ['internal_calendar', 'Create internal One Time calendar from due dates and milestones', 'Codex', '2026-07-01', 'codex'],
  ['content_workflow', 'Build upload, naming, review, posting, and ad-candidate content workflow', 'Shloimie + Rabbi Elie', '2026-07-06', 'blocked'],
  ['registration_funnel', 'Finalize registration funnel, first offer, pricing, refund, and cancellation', 'Rabbi Elie + Shloimie', '2026-07-07', 'decision'],
  ['pilot_workflow', 'Pilot Zoom, Vimeo, and content workflow with one class recording', 'Shloimie + Rabbi Elie', '2026-07-08', 'blocked'],
  ['end_to_end_test', 'Run end-to-end signup, payment, access, reminder, recording, and support test', 'Shloimie + Codex', '2026-07-14', 'blocked'],
  ['launch_rehearsal', 'Run launch rehearsal for class format, camera, questions, and worksheet flow', 'Rabbi Elie + Shloimie', '2026-07-15', 'blocked'],
  ['go_no_go', 'Review unresolved Decisions and set launch go/no-go', 'Rabbi Elie + Shloimie', '2026-07-16', 'decision'],
];

function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function compactText(value = '', limit = 600) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function stableRecordId(prefix, index, date = ONE_TIME_SOURCE_DATE) {
  const cleanPrefix = String(prefix || 'ITEM').toUpperCase();
  const cleanDate = String(date || ONE_TIME_SOURCE_DATE).replace(/-/g, '');
  return `${cleanPrefix}-${cleanDate}-${String(index).padStart(3, '0')}`;
}

function normalizeSource(source = {}) {
  return {
    ...LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE,
    ...source,
    drive_file_id: source.drive_file_id || source.driveFileId || source.id || LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE.drive_file_id,
    modified_time: source.modified_time || source.modifiedTime || source.updated_at || source.modified || LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE.modified_time,
    created_time: source.created_time || source.createdTime || source.created_at || source.created || LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE.created_time,
    title: source.title || source.name || LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE.title,
    url: source.url || source.webViewLink || LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE.url,
    mime_type: source.mime_type || source.mimeType || LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE.mime_type,
  };
}

function sourceDate(source = {}, text = '') {
  const value = `${source.title || ''}\n${text || ''}`;
  const match = value.match(/\b(20\d{2})[-_](\d{2})[-_](\d{2})\b/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const time = source.created_time || source.modified_time;
  if (Number.isFinite(Date.parse(time))) return new Date(time).toISOString().slice(0, 10);
  return ONE_TIME_SOURCE_DATE;
}

function parseMarkdownTables(text = '') {
  const tables = [];
  const lines = String(text || '').split(/\r?\n/);
  let currentHeading = '';
  let current = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (/^#{1,4}\s+/.test(line)) currentHeading = line.replace(/^#{1,4}\s+/, '').trim();
    if (/^\|.*\|$/.test(line)) {
      current.push(line);
      continue;
    }
    if (current.length) {
      tables.push({ heading: currentHeading, rows: parseMarkdownTableRows(current) });
      current = [];
    }
  }
  if (current.length) tables.push({ heading: currentHeading, rows: parseMarkdownTableRows(current) });
  return tables.filter((table) => table.rows.length);
}

function splitTableCells(line = '') {
  return String(line || '')
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function parseMarkdownTableRows(lines = []) {
  const rows = [];
  const header = splitTableCells(lines[0] || '');
  if (!header.length) return rows;
  for (const line of lines.slice(1)) {
    if (/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line)) continue;
    const cells = splitTableCells(line);
    if (!cells.some(Boolean)) continue;
    const row = {};
    header.forEach((key, index) => {
      row[key.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')] = cells[index] || '';
    });
    rows.push(row);
  }
  return rows;
}

function matchingTableRows(text = '', headingPattern) {
  return parseMarkdownTables(text)
    .filter((table) => headingPattern.test(table.heading || ''))
    .flatMap((table) => table.rows);
}

function sourceKeyForBrief(source = {}, text = '') {
  const normalized = normalizeSource(source);
  const raw = [
    'one-time-drive-brief',
    normalized.drive_file_id,
    normalized.modified_time,
    normalized.title,
    text ? sha256Hex(text).slice(0, 24) : 'metadata-only',
  ].join('|');
  return sha256Hex(raw).slice(0, 48);
}

function recordKey(kind, sourceKey, itemKey) {
  return sha256Hex([kind, sourceKey, itemKey].join('|')).slice(0, 32);
}

function commonRecordFields({ id, kind, key, sourceKey, source, title, owner, dueDate, status = 'parsed' }) {
  return {
    id,
    record_key: recordKey(kind, sourceKey, key),
    item_key: key,
    item_type: kind,
    title,
    owner,
    due_date: dueDate || null,
    status,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    source_drive_file_id: source.drive_file_id,
    source_title: source.title,
    external_write_performed: false,
  };
}

function buildDecisionRecords({ source, sourceKey, date }) {
  const serviceDecisions = SERVICE_DECISION_SPECS.map((spec, index) => ({
    ...commonRecordFields({
      id: stableRecordId('DEC', 201 + index, date),
      kind: 'decision',
      key: spec.key,
      sourceKey,
      source,
      title: spec.title,
      owner: spec.owner,
      dueDate: spec.due_date,
      status: 'needs_operator_decision',
    }),
    decision_type: 'access_or_integration',
    service: spec.service,
    required_inputs: spec.required_inputs,
    blocked_actions: spec.blocked_actions,
    notes: spec.notes || '',
  }));

  const productDecisions = PRODUCT_DECISION_SPECS.map(([key, title, owner, dueDate], index) => ({
    ...commonRecordFields({
      id: stableRecordId('DEC', 221 + index, date),
      kind: 'decision',
      key,
      sourceKey,
      source,
      title,
      owner,
      dueDate,
      status: 'needs_operator_decision',
    }),
    decision_type: 'product_or_launch',
    required_inputs: ['owner approval', 'written choice', 'evidence path'],
    blocked_actions: ['public_launch', 'checkout_enable', 'member_notice_send'],
  }));

  return [...serviceDecisions, ...productDecisions];
}

function taskStatusForKind(kind) {
  if (kind === 'codex') return 'ready_for_codex';
  if (kind === 'decision') return 'waiting_on_decision';
  return 'blocked_external';
}

function buildTaskRecords({ source, sourceKey, date }) {
  return TIMELINE_TASK_SPECS.map(([key, title, owner, dueDate, dependencyKind], index) => ({
    ...commonRecordFields({
      id: stableRecordId('TASK', 241 + index, date),
      kind: 'task',
      key,
      sourceKey,
      source,
      title,
      owner,
      dueDate,
      status: taskStatusForKind(dependencyKind),
    }),
    task_kind: dependencyKind === 'codex' ? 'agent_job' : dependencyKind === 'decision' ? 'decision_followup' : 'pending_access',
    target_lane: dependencyKind === 'codex' ? 'Tasks' : dependencyKind === 'decision' ? 'Decisions' : 'Pending',
    dependency_kind: dependencyKind,
    next_action: dependencyKind === 'codex'
      ? 'Codex can implement and verify this without credentials.'
      : 'Record the owner decision or credential/access evidence before implementation.',
  }));
}

function buildCalendarRecords({ source, sourceKey, date, tasks }) {
  return tasks
    .filter((task) => task.due_date)
    .map((task, index) => ({
      ...commonRecordFields({
        id: stableRecordId('CAL', 261 + index, date),
        kind: 'calendar_event',
        key: `calendar_${task.item_key}`,
        sourceKey,
        source,
        title: task.title,
        owner: task.owner,
        dueDate: task.due_date,
        status: task.dependency_kind === 'codex' ? 'internal_draft' : 'pending_external',
      }),
      start_date: task.due_date,
      visibility: 'internal',
      related_task_id: task.id,
      external_calendar_sync: false,
    }));
}

function buildIntegrationRecords({ source, sourceKey, date }) {
  return SERVICE_DECISION_SPECS.map((spec, index) => ({
    ...commonRecordFields({
      id: stableRecordId('INT', 281 + index, date),
      kind: 'integration_item',
      key: `integration_${spec.key}`,
      sourceKey,
      source,
      title: `${spec.service} readiness gate`,
      owner: spec.owner,
      dueDate: spec.due_date,
      status: 'credential_or_owner_action_required',
    }),
    integration_type: spec.key === 'email_provider_decision' ? 'email_provider_decision' : spec.service.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
    active_runtime: spec.key !== 'email_provider_decision',
    safe_actions: ['readiness_check', 'preview'],
    blocked_actions: spec.blocked_actions,
    required_secure_inputs: spec.required_inputs,
    secret_storage_policy: 'keyholder_or_server_env_only',
  }));
}

function buildContentItems({ source, sourceKey, date, text = '' }) {
  const summary = compactText(text.match(/## Product And Launch Decisions[\s\S]*?## Thirty-Day Timeline/)?.[0] || '', 900);
  return [
    {
      ...commonRecordFields({
        id: stableRecordId('CONTENT', 301, date),
        kind: 'content_item',
        key: 'mishnayos_launch_positioning',
        sourceKey,
        source,
        title: 'One Time Mishnayos launch positioning',
        owner: 'Rabbi Elie + Shloimie',
        dueDate: '2026-06-20',
        status: 'needs_review',
      }),
      summary: summary || 'Meeting brief says launch positioning, first offer, live format, and AI review standards need confirmation.',
      content_visibility: 'internal',
    },
    {
      ...commonRecordFields({
        id: stableRecordId('CONTENT', 302, date),
        kind: 'content_item',
        key: 'ai_video_guardrails',
        sourceKey,
        source,
        title: 'AI video and public copy guardrails',
        owner: 'Rabbi Elie',
        dueDate: '2026-06-24',
        status: 'needs_review',
      }),
      summary: 'AI outputs must be human-reviewed; public visuals need Jewish dress/tzniut/logical-animation guardrails before publication.',
      content_visibility: 'internal',
    },
  ];
}

function buildCommunityRecords({ source, sourceKey, date }) {
  return [
    {
      ...commonRecordFields({
        id: stableRecordId('COMMUNITY', 321, date),
        kind: 'community_record',
        key: 'moderated_question_model',
        sourceKey,
        source,
        title: 'Use structured questions or moderated channels at launch',
        owner: 'Rabbi Elie + Shloimie',
        dueDate: '2026-06-21',
        status: 'needs_decision',
      }),
      community_visibility: 'moderated_only',
      open_forum_enabled: false,
    },
  ];
}

function buildNoteRecords({ source, sourceKey, date }) {
  return [
    {
      ...commonRecordFields({
        id: stableRecordId('NOTE', 341, date),
        kind: 'note',
        key: 'owner_admin_model',
        sourceKey,
        source,
        title: 'One Time role model: Rabbi Owner, Shloimie Admin',
        owner: 'Codex',
        dueDate: '2026-06-21',
        status: 'implemented_locally_needs_live_verification',
      }),
      note_type: 'workspace_role',
      expected_owner_assignments: oneTimeOwnerAssignments(),
    },
  ];
}

function oneTimeOwnerAssignments() {
  return [
    {
      person_name: 'Rabbi Elie Scheller',
      role: 'project owner',
      access_level: 'owner',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
    },
    {
      person_name: 'Shloimie',
      role: 'project admin',
      access_level: 'admin',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
    },
  ];
}

function flattenRecords(preview = {}) {
  const records = preview.records || {};
  return Object.values(records).flatMap((value) => Array.isArray(value) ? value : []);
}

function scanForUnsafeSecretMaterial(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || {});
  const patterns = [
    /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}\b/i,
    /\bZOOM_CLIENT_SECRET\s*[:=]\s*\S+/i,
    /\bRESEND_API_KEY\s*[:=]\s*\S+/i,
    /\bVIMEO_ACCESS_TOKEN\s*[:=]\s*\S+/i,
    /\b(?:password|api[_ -]?key|secret|token)\s*[:=]\s*(?!keyholder|server env|not configured|unknown|pending|missing|redacted|approved|required)[A-Za-z0-9._~+/=-]{8,}/i,
  ];
  return patterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => String(pattern));
}

function buildBlockers(decisions = []) {
  return decisions
    .filter((decision) => decision.decision_type === 'access_or_integration')
    .map((decision) => ({
      decision_id: decision.id,
      title: decision.title,
      owner: decision.owner,
      due_date: decision.due_date,
      required_inputs: decision.required_inputs,
      blocked_actions: decision.blocked_actions,
    }));
}

function buildOneTimeDriveBriefIngestionPreview({ text = '', source = {}, fetched_at = null } = {}) {
  const normalizedSource = normalizeSource(source);
  const body = String(text || '');
  const date = sourceDate(normalizedSource, body);
  const sourceKey = sourceKeyForBrief(normalizedSource, body);
  const sourceHash = body ? sha256Hex(body) : sha256Hex(JSON.stringify(normalizedSource));
  const accountRows = matchingTableRows(body, /Account And Access Checklist/i);
  const timelineRows = matchingTableRows(body, /Thirty-Day Timeline/i);
  const decisions = buildDecisionRecords({ source: normalizedSource, sourceKey, date });
  const tasks = buildTaskRecords({ source: normalizedSource, sourceKey, date });
  const calendarEvents = buildCalendarRecords({ source: normalizedSource, sourceKey, date, tasks });
  const integrationItems = buildIntegrationRecords({ source: normalizedSource, sourceKey, date });
  const contentItems = buildContentItems({ source: normalizedSource, sourceKey, date, text: body });
  const communityRecords = buildCommunityRecords({ source: normalizedSource, sourceKey, date });
  const notes = buildNoteRecords({ source: normalizedSource, sourceKey, date });
  const preview = {
    success: true,
    dry_run: true,
    external_write_performed: false,
    parser_version: 'one-time-drive-brief-v1',
    generated_at: fetched_at || new Date().toISOString(),
    source: {
      drive_file_id: normalizedSource.drive_file_id,
      title: normalizedSource.title,
      url: normalizedSource.url,
      created_time: normalizedSource.created_time,
      modified_time: normalizedSource.modified_time,
      mime_type: normalizedSource.mime_type,
      sha256: sourceHash,
      raw_text_present: Boolean(body.trim()),
      raw_text_committed_to_git: false,
    },
    source_tables_detected: {
      account_access_rows: accountRows.length,
      timeline_rows: timelineRows.length,
    },
    routing: {
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      confidence: /rabbi|elie|scheller|sheller|one time|mishnah|mishnayos/i.test(`${normalizedSource.title}\n${body}`) ? 0.98 : 0.62,
      default_bna_workspace_allowed: false,
      reason: 'Rabbi Elie Scheller / One Time Mishnah Class source must stay in the One Time provider workspace.',
    },
    owner_assignments: oneTimeOwnerAssignments(),
    idempotency: {
      source_key: sourceKey,
      source_fingerprint: sourceHash,
      duplicate_policy: 'match by source_key plus each record_key; update same record, do not create duplicate visible cards',
    },
    records: {
      decisions,
      tasks,
      calendar_events: calendarEvents,
      content_items: contentItems,
      community_records: communityRecords,
      integration_items: integrationItems,
      notes,
    },
    counts: {
      decisions: decisions.length,
      tasks: tasks.length,
      calendar_events: calendarEvents.length,
      content_items: contentItems.length,
      community_records: communityRecords.length,
      integration_items: integrationItems.length,
      notes: notes.length,
    },
    blockers: buildBlockers(decisions),
    acceptance: {
      one_time_only: true,
      no_public_or_bna_school_records: true,
      no_external_writes: true,
      no_secrets_in_output: scanForUnsafeSecretMaterial({ decisions, tasks, integrationItems }).length === 0,
      production_mutation_performed: false,
    },
  };
  const leaks = scanForUnsafeSecretMaterial(preview);
  if (leaks.length) {
    preview.acceptance.no_secrets_in_output = false;
    preview.secret_findings = leaks;
  }
  return preview;
}

function assertOneTimeScopedPreview(preview = {}) {
  const records = flattenRecords(preview);
  for (const record of records) {
    if (record.project_key !== ONE_TIME_PROJECT_KEY || record.workspace_key !== ONE_TIME_WORKSPACE_KEY) {
      throw new Error(`One Time Drive brief record escaped scope: ${record.id || record.item_key || 'unknown'}`);
    }
    if (record.external_write_performed !== false) {
      throw new Error(`One Time Drive brief preview attempted an external write: ${record.id || record.item_key || 'unknown'}`);
    }
  }
  if (preview.routing?.default_bna_workspace_allowed !== false) {
    throw new Error('One Time Drive brief preview must reject default BNA routing.');
  }
  const leaks = scanForUnsafeSecretMaterial(preview);
  if (leaks.length) {
    throw new Error('One Time Drive brief preview contains unsafe secret-like material.');
  }
  return true;
}

module.exports = {
  LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  assertOneTimeScopedPreview,
  buildOneTimeDriveBriefIngestionPreview,
  oneTimeOwnerAssignments,
  scanForUnsafeSecretMaterial,
  sourceKeyForBrief,
};
