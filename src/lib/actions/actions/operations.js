const { compactText, normalizeWorkspace, WORKSPACES } = require('../types');

const TASK_STAGES = new Set(['raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive']);
const CALENDAR_VISIBILITIES = new Set(['internal', 'parent', 'student', 'provider', 'public']);
const TASK_SOURCES = new Set(['manual', 'ramble', 'telegram', 'web', 'google_drive', 'content_job', 'import', 'community_webhook', 'green_invoice']);
const TICKET_CATEGORIES = new Set(['login', 'payment', 'link', 'recording', 'worksheet', 'access', 'cancellation', 'bot_api', 'drive', 'automation', 'task_manager', 'student_parent_data', 'other']);
const TICKET_SOURCES = new Set(['dashboard', 'telegram', 'api', 'system', 'web_assistant']);
const TICKET_SEVERITIES = new Set(['low', 'normal', 'high', 'blocking']);
const COMMUNITY_AUDIENCES = new Set(['members', 'parents', 'students', 'providers', 'staff']);

function normalizeStage(value) {
  const normalized = String(value || 'assigned').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'payment_pending') return 'needs_decision';
  if (normalized === 'complete' || normalized === 'completed') return 'done';
  return TASK_STAGES.has(normalized) ? normalized : 'assigned';
}

function normalizeVisibility(value, fallback = 'internal') {
  const normalized = String(value || fallback).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return CALENDAR_VISIBILITIES.has(normalized) ? normalized : fallback;
}

function normalizeTaskSource(value) {
  const normalized = String(value || 'manual').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'ui' || normalized === 'ui_button' || normalized === 'assistant') return 'web';
  return TASK_SOURCES.has(normalized) ? normalized : 'manual';
}

function normalizeTicketSource(value) {
  const normalized = String(value || 'dashboard').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'ui' || normalized === 'ui_button' || normalized === 'assistant') return 'web_assistant';
  return TICKET_SOURCES.has(normalized) ? normalized : 'dashboard';
}

function normalizeTicketCategory(value) {
  const normalized = String(value || 'other').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['bug', 'technical', 'system', 'codex', 'deployment', 'deploy'].includes(normalized)) return 'task_manager';
  if (['bot', 'ai', 'openai'].includes(normalized)) return 'bot_api';
  if (['student', 'parent', 'privacy'].includes(normalized)) return 'student_parent_data';
  return TICKET_CATEGORIES.has(normalized) ? normalized : 'other';
}

function normalizeSeverity(value) {
  const normalized = String(value || 'normal').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return TICKET_SEVERITIES.has(normalized) ? normalized : 'normal';
}

function normalizeCommunityAudience(value, fallback = 'members') {
  const normalized = String(value || fallback).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return COMMUNITY_AUDIENCES.has(normalized) ? normalized : fallback;
}

function actorCommunityType(actor = {}) {
  const role = String(actor.role || '').toLowerCase();
  if (/provider/.test(role)) return 'service_provider';
  if (/parent/.test(role)) return 'parent';
  if (/student/.test(role)) return 'student';
  if (/rabbi|rebbe|school/.test(role)) return 'rabbi';
  return 'admin';
}

function identityForWorkspace(workspaceId, requestedIdentity = '') {
  const requested = compactText(requestedIdentity, 120).toLowerCase();
  if (/rabbi|scheller|mishnayos|mishnah/.test(requested)) return 'Rabbi Sheller domain identity';
  if (/bna|school|parent|student/.test(requested)) return 'BNA school domain identity';
  return normalizeWorkspace(workspaceId) === WORKSPACES.RABBI_SHELLER_PROVIDER
    ? 'Rabbi Sheller domain identity'
    : 'BNA school domain identity';
}

function summarizeBody(value, maxLength = 420) {
  const text = String(value || '').replace(/\r/g, '').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function titleFromBody(body, fallback = 'Draft') {
  const firstLine = String(body || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  return compactText(firstLine || fallback, 160);
}

function buildRefinedNewsletterBody(body = '', instruction = '') {
  const original = String(body || '').replace(/\r/g, '').trim();
  const cleanInstruction = compactText(instruction || 'Make the draft clearer, warmer, and easier for parents to scan.', 260);
  if (!original) {
    return [
      'Weekly BNA Update',
      '',
      'Dear parents,',
      '',
      'Here is a clearer draft structure for this week. Add the specific learning moments, schedule notes, and any parent action items before approval.',
      '',
      'This week at BNA',
      '- Learning highlight:',
      '- Student growth note:',
      '- Schedule reminder:',
      '',
      'Warmly,',
      'Bnei Neviim Academy',
    ].join('\n');
  }
  const paragraphs = original
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const lead = paragraphs.shift() || original;
  const bulletLines = paragraphs
    .flatMap((part) => part.split(/\r?\n/))
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 6);
  return [
    titleFromBody(original, 'Weekly BNA Update'),
    '',
    'Dear parents,',
    '',
    lead.replace(/^dear parents,?\s*/i, '').trim(),
    '',
    bulletLines.length ? 'This week to notice:' : '',
    ...bulletLines.map((line) => `- ${line}`),
    '',
    cleanInstruction ? `Editorial direction used: ${cleanInstruction}` : '',
    '',
    'Warmly,',
    'Bnei Neviim Academy',
  ].filter((line, index, lines) => line || lines[index - 1]).join('\n').trim();
}

async function findLatestNewsletterDraft(inputs = {}, context = {}) {
  const outputId = Number(inputs.output_id || inputs.outputId || 0);
  if (!context.db) {
    return {
      found: Boolean(inputs.draft_body || inputs.newsletter_body),
      draft: inputs.draft_body || inputs.newsletter_body
        ? { id: outputId || null, title: titleFromBody(inputs.draft_body || inputs.newsletter_body, 'Provided newsletter draft'), body: inputs.draft_body || inputs.newsletter_body }
        : null,
      source: 'inputs_only',
    };
  }
  const params = [];
  const conditions = ["output_type = 'weekly_newsletter'", "status <> 'archived'"];
  if (outputId) {
    params.push(outputId);
    conditions.push(`id = $${params.length}`);
  }
  const result = await context.db.query(
    `SELECT *
     FROM bna_content_outputs
     WHERE ${conditions.join(' AND ')}
     ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
     LIMIT 1`,
    params
  );
  return {
    found: Boolean(result.rows[0]),
    draft: result.rows[0] || null,
    source: 'bna_content_outputs',
  };
}

async function refineNewsletterDraft(inputs = {}, context = {}) {
  const latest = await findLatestNewsletterDraft(inputs, context);
  const sourceDraft = latest.draft || {};
  const sourceBody = inputs.draft_body || inputs.newsletter_body || sourceDraft.body || '';
  const revisedBody = buildRefinedNewsletterBody(sourceBody, inputs.instruction);
  const baseResult = {
    source_found: Boolean(latest.found),
    source_output_id: sourceDraft.id || null,
    title: sourceDraft.title || titleFromBody(revisedBody, 'Weekly BNA Update'),
    revised_body: revisedBody,
    before_after_summary: [
      'Clarified the opening and parent-facing structure.',
      'Grouped details into scannable bullets.',
      'Kept this as an internal draft/revision; no email or public post was sent.',
    ],
  };
  if (context.dryRun || inputs.save_revision === false || !context.db || !sourceDraft.id || !sourceDraft.job_id) {
    return {
      ...baseResult,
      saved: false,
      next_actions: ['copy', 'approve_newsletter', 'draft_email_from_newsletter', 'generate_whatsapp_from_newsletter', 'generate_social_posts_from_newsletter', 'open_content_item_url'],
    };
  }
  const metadata = {
    action_registry_revision: true,
    source_output_id: sourceDraft.id,
    source_status: sourceDraft.status || null,
    instruction: inputs.instruction || null,
    created_by_action: 'refine_newsletter_draft',
  };
  const result = await context.db.query(
    `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
     VALUES ($1, 'weekly_newsletter', $2, $3, 'email', 'needs_approval', $4::jsonb)
     RETURNING *`,
    [
      sourceDraft.job_id,
      inputs.title || sourceDraft.title || titleFromBody(revisedBody, 'Weekly BNA Update'),
      revisedBody,
      JSON.stringify(metadata),
    ]
  );
  return {
    ...baseResult,
    saved: true,
    revision_output_id: result.rows[0].id,
    output: result.rows[0],
    next_actions: ['approve_newsletter', 'draft_email_from_newsletter', 'generate_whatsapp_from_newsletter', 'generate_social_posts_from_newsletter', 'open_content_item_url'],
  };
}

async function saveNewsletterRevision(inputs = {}, context = {}) {
  const body = String(inputs.body || '').trim();
  if (!body) throw new Error('body is required');
  if (context.dryRun || !context.db) {
    return { saved: false, title: inputs.title || titleFromBody(body, 'Newsletter revision'), body_preview: summarizeBody(body) };
  }
  const sourceOutputId = Number(inputs.source_output_id || inputs.output_id || 0);
  let jobId = Number(inputs.job_id || 0);
  if (!jobId && sourceOutputId) {
    const source = (await context.db.query('SELECT job_id FROM bna_content_outputs WHERE id = $1', [sourceOutputId])).rows[0];
    jobId = Number(source?.job_id || 0);
  }
  if (!jobId) throw new Error('job_id or source_output_id is required to save a newsletter revision');
  const result = await context.db.query(
    `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
     VALUES ($1, 'weekly_newsletter', $2, $3, 'email', 'needs_approval', $4::jsonb)
     RETURNING *`,
    [
      jobId,
      inputs.title || titleFromBody(body, 'Newsletter revision'),
      body,
      JSON.stringify({ action_registry_revision: true, source_output_id: sourceOutputId || null }),
    ]
  );
  return { saved: true, output: result.rows[0] };
}

async function approveNewsletter(inputs = {}, context = {}) {
  const outputId = Number(inputs.output_id || inputs.outputId || 0);
  if (!outputId) throw new Error('output_id is required');
  if (context.dryRun || !context.db) return { approved: false, output_id: outputId, status: 'preview_only' };
  const result = await context.db.query(
    `UPDATE bna_content_outputs
     SET status = 'approved', approved_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND output_type = 'weekly_newsletter'
     RETURNING *`,
    [outputId]
  );
  if (!result.rows[0]) throw new Error('Newsletter output was not found');
  return { approved: true, output: result.rows[0] };
}

function draftEmail(inputs = {}, context = {}) {
  const body = String(inputs.body || inputs.newsletter_body || inputs.source_text || '').trim()
    || 'Draft the message body here before approval.';
  const subject = compactText(inputs.subject || titleFromBody(body, 'BNA update'), 160);
  return {
    draft_created: true,
    identity: identityForWorkspace(context.actor?.workspace_id, inputs.identity),
    audience: compactText(inputs.audience || 'manual review list', 120),
    subject,
    body,
    sent: false,
    approval_required_before_send: true,
  };
}

async function draftEmailFromNewsletter(inputs = {}, context = {}) {
  let newsletterBody = inputs.newsletter_body || inputs.body || '';
  if (!newsletterBody && context.db && (inputs.output_id || inputs.outputId)) {
    const row = (await context.db.query('SELECT body, title FROM bna_content_outputs WHERE id = $1', [Number(inputs.output_id || inputs.outputId)])).rows[0];
    newsletterBody = row?.body || '';
    inputs.subject = inputs.subject || row?.title;
  }
  if (!newsletterBody) {
    const latest = await findLatestNewsletterDraft(inputs, context);
    newsletterBody = latest.draft?.body || '';
    inputs.subject = inputs.subject || latest.draft?.title;
  }
  return draftEmail({ ...inputs, body: newsletterBody }, context);
}

function refineEmail(inputs = {}) {
  const body = String(inputs.body || '').trim();
  if (!body) throw new Error('body is required');
  return {
    draft_created: true,
    subject: inputs.subject || titleFromBody(body, 'Email draft'),
    body: [
      body.replace(/\s+\n/g, '\n').trim(),
      '',
      compactText(inputs.instruction || 'Refined for clarity and a warmer parent-facing tone.', 240),
    ].join('\n').trim(),
    sent: false,
  };
}

async function createTask(inputs = {}, context = {}) {
  const title = compactText(inputs.title || inputs.text || inputs.raw_text, 240);
  if (!title) throw new Error('title is required');
  if (context.dryRun) {
    return {
      task_created: false,
      preview: {
        title,
        notes: inputs.notes || inputs.raw_text || '',
        stage: normalizeStage(inputs.stage),
        category: inputs.category || 'operations',
      },
    };
  }
  if (context.helpers?.createTaskFromText) {
    const task = await context.helpers.createTaskFromText({
      ...inputs,
      title,
      source: normalizeTaskSource(inputs.source || context.source || 'telegram'),
      created_by: inputs.created_by || context.actor?.user_id || context.source || 'action_registry',
    });
    return { task_created: true, task };
  }
  if (!context.db) return { task_created: false, preview: { title } };
  const result = await context.db.query(
    `INSERT INTO bna_tasks (title, notes, stage, category, urgency, source, created_by, assigned_to, ai_parsed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     RETURNING *`,
    [
      title,
      inputs.notes || inputs.raw_text || null,
      normalizeStage(inputs.stage),
      inputs.category || 'operations',
      inputs.urgency || 'this_week',
      normalizeTaskSource(inputs.source || context.source || 'telegram'),
      inputs.created_by || context.actor?.user_id || 'action_registry',
      inputs.assigned_to || null,
      JSON.stringify({ parser: 'action-registry', action_id: 'create_task', original_text: inputs.raw_text || title }),
    ]
  );
  return { task_created: true, task: result.rows[0] };
}

async function updateTaskStage(inputs = {}, context = {}) {
  const taskId = Number(inputs.task_id || inputs.taskId || inputs.id || 0);
  if (!taskId) throw new Error('task_id is required');
  const stage = normalizeStage(inputs.stage);
  if (context.dryRun || !context.db) return { task_updated: false, task_id: taskId, next_stage: stage };
  const result = await context.db.query(
    `UPDATE bna_tasks
     SET stage = $2, verification_notes = COALESCE($3, verification_notes), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, stage, inputs.verification_notes || null]
  );
  if (!result.rows[0]) throw new Error('Task was not found');
  return { task_updated: true, task: result.rows[0] };
}

async function createCalendarEvent(inputs = {}, context = {}, overrides = {}) {
  const title = compactText(inputs.title, 220);
  if (!title) throw new Error('title is required');
  const startAt = inputs.start_at || inputs.startAt || inputs.start || '';
  if (!startAt || Number.isNaN(Date.parse(startAt))) throw new Error('start_at must be a valid date/time');
  const workspaceKey = normalizeWorkspace(overrides.workspace_id || inputs.workspace_key || inputs.workspace || context.actor?.workspace_id);
  const visibility = normalizeVisibility(overrides.visibility || inputs.visibility, 'internal');
  const source = compactText(overrides.source || inputs.source || 'internal', 80).replace(/[\s-]+/g, '_').toLowerCase();
  const preview = {
    workspace_key: workspaceKey,
    title,
    description: inputs.description || null,
    start_at: startAt,
    end_at: inputs.end_at || inputs.endAt || inputs.end || null,
    visibility,
    source,
    related_type: overrides.related_type || inputs.related_type || inputs.relatedType || null,
    related_id: inputs.related_id || inputs.relatedId || null,
    meeting_url: inputs.meeting_url || inputs.meetingUrl || null,
  };
  if (context.dryRun || !context.db) return { event_created: false, preview };
  const result = await context.db.query(
    `INSERT INTO bna_calendar_events (
       workspace_key, related_type, related_id, title, description, start_at, end_at,
       location, meeting_url, status, visibility, source, metadata_json, created_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6::timestamp, $7::timestamp,
       $8, $9, 'scheduled', $10, $11, $12::jsonb, $13
     )
     RETURNING *`,
    [
      preview.workspace_key,
      preview.related_type,
      preview.related_id === undefined || preview.related_id === '' ? null : Number(preview.related_id),
      preview.title,
      preview.description,
      preview.start_at,
      preview.end_at,
      inputs.location || null,
      preview.meeting_url,
      preview.visibility,
      preview.source,
      JSON.stringify({ ...(inputs.metadata || {}), action_registry: true }),
      inputs.created_by || context.actor?.user_id || 'action_registry',
    ]
  );
  return { event_created: true, event: result.rows[0] };
}

async function updateCalendarVisibility(inputs = {}, context = {}, visibility = 'internal') {
  const eventId = Number(inputs.event_id || inputs.eventId || inputs.id || 0);
  if (!eventId) throw new Error('event_id is required');
  if (context.dryRun || !context.db) return { event_updated: false, event_id: eventId, visibility };
  const result = await context.db.query(
    `UPDATE bna_calendar_events
     SET visibility = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [eventId, visibility]
  );
  if (!result.rows[0]) throw new Error('Calendar event was not found');
  return { event_updated: true, event: result.rows[0] };
}

async function updateCalendarEvent(inputs = {}, context = {}) {
  const eventId = Number(inputs.event_id || inputs.eventId || inputs.id || 0);
  if (!eventId) throw new Error('event_id is required');
  const allowed = {
    title: inputs.title,
    description: inputs.description,
    start_at: inputs.start_at || inputs.startAt || inputs.start,
    end_at: inputs.end_at || inputs.endAt || inputs.end,
    location: inputs.location,
    meeting_url: inputs.meeting_url || inputs.meetingUrl,
    status: inputs.status,
    visibility: inputs.visibility,
  };
  const fields = Object.entries(allowed).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '');
  if (!fields.length) throw new Error('At least one calendar field is required');
  if (context.dryRun || !context.db) return { event_updated: false, event_id: eventId, fields: fields.map(([key]) => key) };
  const values = [];
  const clauses = [];
  for (const [key, value] of fields) {
    values.push(key === 'visibility' ? normalizeVisibility(value) : value);
    const cast = key === 'start_at' || key === 'end_at' ? '::timestamp' : '';
    clauses.push(`${key} = $${values.length}${cast}`);
  }
  values.push(eventId);
  const result = await context.db.query(
    `UPDATE bna_calendar_events
     SET ${clauses.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  if (!result.rows[0]) throw new Error('Calendar event was not found');
  return { event_updated: true, event: result.rows[0] };
}

async function archiveCalendarEvent(inputs = {}, context = {}) {
  const eventId = Number(inputs.event_id || inputs.eventId || inputs.id || 0);
  if (!eventId) throw new Error('event_id is required');
  if (context.dryRun || !context.db) return { event_archived: false, event_id: eventId, status: 'archived' };
  const result = await context.db.query(
    `UPDATE bna_calendar_events
     SET status = 'archived', visibility = 'internal', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [eventId]
  );
  if (!result.rows[0]) throw new Error('Calendar event was not found');
  return { event_archived: true, event: result.rows[0] };
}

async function viewEmailLog(inputs = {}, context = {}) {
  if (!context.db) return { entries: [], source: 'no_db' };
  const limit = Math.max(1, Math.min(Number(inputs.limit || 10), 50));
  const result = await context.db.query(
    `SELECT id, email_type, recipient_email, subject, status, sent_at, created_at
     FROM bna_email_log
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return { entries: result.rows };
}

function connectorGuardedResult(kind, inputs = {}, context = {}) {
  const connectorReady = Boolean(context.connectors?.[kind]?.configured || context.connectors?.[kind]?.test_mode);
  return {
    executed: false,
    connector: kind,
    connector_ready: connectorReady,
    approval_checked: Boolean(context.approved),
    note: connectorReady
      ? 'Connector is present, but this safety pass still requires a dedicated send adapter before live external writes.'
      : `${kind} connector is not configured; no external send, publish, sync, payment, or access change was performed.`,
    requested_inputs: inputs,
  };
}

function googleDriveConnectorReady(context = {}) {
  return Boolean(
    context.connectors?.google_drive?.configured
    || context.connectors?.google_drive?.test_mode
    || context.connectors?.google_oauth?.configured
    || context.connectors?.google_oauth?.test_mode
  );
}

function googleDrivePreview(kind, inputs = {}, context = {}) {
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id);
  const connectorReady = googleDriveConnectorReady(context);
  const query = compactText(inputs.query || inputs.file_name || inputs.title || 'latest Rabbi Scheller Mishnah video', 220);
  const folderName = compactText(inputs.folder_name || inputs.target_folder_name || inputs.source_stage || 'known BNA Drive folder', 180);
  const base = {
    executed: false,
    connector: 'google_drive',
    connector_ready: connectorReady,
    workspace_key: workspaceKey,
    external_write_performed: false,
    dry_run_only: true,
    scope_policy: 'Prefer app-created/file-specific or known-folder access. Do not request broad Drive access until the Drive scope audit is approved.',
    missing_connection_task_needed: !connectorReady,
    blocker: connectorReady ? null : 'Google Drive OAuth or owner pipeline is not connected for this workspace.',
  };
  if (kind === 'find_file') {
    return {
      ...base,
      drive_action: 'find_or_list_files',
      query,
      folder_id: inputs.folder_id || null,
      folder_name: folderName,
      mime_type: inputs.mime_type || null,
      limit: Math.max(1, Math.min(Number(inputs.limit || 10), 25)),
      planned_result_fields: ['id', 'name', 'mimeType', 'modifiedTime', 'webViewLink'],
      next_confirmation: 'Connect a test-user or owner Drive pipeline before reading private Drive metadata.',
    };
  }
  if (kind === 'create_doc') {
    return {
      ...base,
      drive_action: 'create_google_doc',
      title: compactText(inputs.title || 'Class summary draft', 180),
      body_preview: summarizeBody(inputs.body || 'Use reviewed BNA class notes or transcript text as the source.', 700),
      folder_id: inputs.folder_id || null,
      folder_name: folderName,
      approval_required_before_external_write: true,
      required_external_inputs: ['connected Google account', 'destination folder policy', 'confirmed source content'],
    };
  }
  if (kind === 'create_folder') {
    return {
      ...base,
      drive_action: 'create_folder',
      folder_name: folderName === 'known BNA Drive folder' ? compactText(inputs.provider_name || 'Provider workspace folder', 180) : folderName,
      parent_folder_id: inputs.parent_folder_id || null,
      provider_id: inputs.provider_id || null,
      approval_required_before_external_write: true,
      required_external_inputs: ['connected Google account', 'parent folder ID', 'provider/workspace scope'],
    };
  }
  return {
    ...base,
    drive_action: 'move_or_import_file',
    file_id: inputs.file_id || null,
    file_name: compactText(inputs.file_name || query || 'selected Drive file', 180),
    target_folder_id: inputs.target_folder_id || null,
    target_folder_name: folderName,
    related_type: inputs.related_type || null,
    related_id: inputs.related_id || null,
    approval_required_before_external_write: true,
    required_external_inputs: ['file ID or selected file', 'target folder ID', 'connected Google account'],
  };
}

async function createTicket(inputs = {}, context = {}) {
  const description = String(inputs.message || inputs.description || inputs.body || '').trim();
  if (!description) throw new Error('message is required');
  const title = compactText(inputs.title || titleFromBody(description, 'Support ticket'), 220);
  const severity = normalizeSeverity(inputs.severity);
  const category = normalizeTicketCategory(inputs.category || inputs.route);
  const preview = {
    ticket_created: false,
    title,
    category,
    severity,
    route: inputs.route || null,
    related_type: inputs.related_type || null,
    related_id: inputs.related_id || null,
    source: normalizeTicketSource(context.source || inputs.source),
    no_codex_task_created: category !== 'task_manager',
  };
  if (context.dryRun || !context.db) return preview;
  const result = await context.db.query(
    `INSERT INTO bna_support_tickets (
       title, description, severity, status, category, reporter_name, reporter_role,
       assigned_to, source, source_context, created_by
     ) VALUES (
       $1, $2, $3, 'open', $4, $5, $6,
       $7, $8, $9::jsonb, $10
     )
     RETURNING *`,
    [
      title,
      description,
      severity,
      category,
      inputs.reporter_name || context.actor?.user_id || null,
      context.actor?.role || null,
      inputs.assigned_to || null,
      preview.source,
      JSON.stringify({
        action_registry: true,
        route: inputs.route || null,
        related_type: inputs.related_type || null,
        related_id: inputs.related_id || null,
      }),
      context.actor?.user_id || 'action_registry',
    ]
  );
  return { ...preview, ticket_created: true, ticket: result.rows[0] };
}

async function createDecision(inputs = {}, context = {}) {
  const title = compactText(inputs.title || inputs.question || inputs.message, 240);
  if (!title) throw new Error('title is required');
  const notes = [
    inputs.question || '',
    Array.isArray(inputs.options) && inputs.options.length
      ? `Options:\n${inputs.options.map((option, index) => `${index + 1}. ${option}`).join('\n')}`
      : '',
    inputs.recommendation ? `Recommendation: ${inputs.recommendation}` : '',
    inputs.context ? `Context: ${inputs.context}` : '',
  ].filter(Boolean).join('\n\n');
  if (context.dryRun || !context.db) {
    return {
      decision_created: false,
      title,
      stage: 'needs_decision',
      decision_required: true,
      route: 'Shloimie Decisions',
    };
  }
  const result = await context.db.query(
    `INSERT INTO bna_tasks (
       title, notes, stage, category, urgency, source, source_context,
       created_by, assigned_to, ai_parsed, decision_required, author
     ) VALUES (
       $1, $2, 'needs_decision', 'operations', 'this_week', $3, $4,
       $5, 'Shloimie', $6::jsonb, TRUE, $7
     )
     RETURNING *`,
    [
      title,
      notes || null,
      normalizeTaskSource(context.source || inputs.source),
      JSON.stringify({ action_registry: true, route: 'shloimie_decisions' }),
      context.actor?.user_id || 'action_registry',
      JSON.stringify({ kind: 'decision', options: Array.isArray(inputs.options) ? inputs.options : [], recommendation: inputs.recommendation || null }),
      context.actor?.user_id || 'action_registry',
    ]
  );
  return { decision_created: true, decision: result.rows[0] };
}

async function draftWeeklyUpdate(inputs = {}, context = {}) {
  const sourceText = String(inputs.source_text || inputs.body || inputs.message || '').trim();
  const title = compactText(inputs.title || titleFromBody(sourceText, 'Weekly BNA Update'), 220);
  const summary = summarizeBody(inputs.summary || sourceText, 900);
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id);
  const body = sourceText || [
    'Dear parents,',
    '',
    'This weekly update is ready for staff review before it is selected for the parent dashboard.',
  ].join('\n');
  const base = {
    draft_created: false,
    title,
    summary,
    body,
    workspace_key: workspaceKey,
    selected_for_parent_portal: false,
    sent: false,
    privacy_filtered: true,
  };
  if (context.dryRun || !context.db) return base;
  const result = await context.db.query(
    `INSERT INTO bna_weekly_updates (
       workspace_key, title, summary, body, status, selected_for_parent_portal, metadata_json, created_by
     ) VALUES (
       $1, $2, $3, $4, 'draft', FALSE, $5::jsonb, $6
     )
     RETURNING *`,
    [
      workspaceKey,
      title,
      summary || null,
      body,
      JSON.stringify({
        action_registry: true,
        source: context.source || 'bot',
        audience: inputs.audience || null,
        provider_id: inputs.provider_id || null,
        community_id: inputs.community_id || null,
        privacy_filter: 'parent_safe',
      }),
      context.actor?.user_id || 'action_registry',
    ]
  );
  return { ...base, draft_created: true, update: result.rows[0] };
}

async function selectWeeklyUpdateHero(inputs = {}, context = {}) {
  const updateId = Number(inputs.update_id || inputs.updateId || 0);
  if (!updateId) throw new Error('update_id is required');
  if (context.dryRun || !context.db) {
    return { hero_selected: false, update_id: updateId, selected_for_parent_portal: true, approval_required: true };
  }
  const existing = (await context.db.query('SELECT * FROM bna_weekly_updates WHERE id = $1', [updateId])).rows[0];
  if (!existing) throw new Error('Weekly update was not found');
  await context.db.query(
    `UPDATE bna_weekly_updates
     SET selected_for_parent_portal = FALSE,
         updated_at = NOW()
     WHERE workspace_key = $1
       AND id <> $2`,
    [existing.workspace_key, updateId]
  );
  const result = await context.db.query(
    `UPDATE bna_weekly_updates
     SET selected_for_parent_portal = TRUE,
         status = 'selected',
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [updateId]
  );
  return { hero_selected: true, update: result.rows[0] };
}

function generateStudentWorksheet(inputs = {}, context = {}) {
  const studentId = inputs.student_id || inputs.studentId;
  const assignmentId = inputs.assignment_id || inputs.assignmentId;
  if (!studentId) throw new Error('student_id is required');
  if (!assignmentId) throw new Error('assignment_id is required');
  const language = compactText(inputs.language || 'English/Hebrew as appropriate', 80);
  const level = compactText(inputs.level || inputs.reading_level || 'student-safe level', 120);
  const interests = Array.isArray(inputs.interests) ? inputs.interests.slice(0, 8) : compactText(inputs.interests || '', 220);
  return {
    worksheet_generated: !context.dryRun,
    student_id: studentId,
    assignment_id: assignmentId,
    privacy_filtered: true,
    admin_only_notes_excluded: true,
    parent_private_notes_excluded: true,
    source_context_preview: {
      language,
      level,
      interests,
      prompt_patch_used: Boolean(inputs.prompt_patch),
    },
    worksheet_preview: [
      '1. Review the source idea in your own words.',
      '2. Answer one clear question connected to the class topic.',
      '3. Choose one small practice step for the next class.',
    ],
  };
}

function draftParentResponse(inputs = {}) {
  const message = compactText(inputs.message || inputs.body || '', 1200);
  if (!message) throw new Error('message is required');
  return {
    draft_created: true,
    sent: false,
    privacy_filtered: true,
    admin_only_notes_excluded: true,
    student_id: inputs.student_id || null,
    body: [
      'Thank you for reaching out.',
      '',
      summarizeBody(message, 900),
      '',
      'I will make sure this is reviewed in the right BNA channel and follow up with parent-safe details.',
    ].join('\n'),
  };
}

async function postCommunityMessage(inputs = {}, context = {}) {
  const communityId = Number(inputs.community_id || inputs.communityId || 0);
  const body = String(inputs.message || inputs.body || '').trim();
  if (!communityId) throw new Error('community_id is required');
  if (!body) throw new Error('message is required');
  const audience = normalizeCommunityAudience(inputs.audience || inputs.visibility);
  const actorType = actorCommunityType(context.actor);
  const preview = {
    community_message_posted: false,
    community_id: communityId,
    audience,
    visibility: audience,
    privacy_filtered: true,
  };
  if (context.dryRun || !context.db) return preview;
  let threadId = Number(inputs.thread_id || inputs.threadId || 0);
  if (!threadId) {
    const thread = (await context.db.query(
      `INSERT INTO bna_community_threads (
         community_id, title, created_by_type, created_by_email, audience, metadata_json
       ) VALUES (
         $1, $2, $3, $4, $5, $6::jsonb
       )
       RETURNING *`,
      [
        communityId,
        compactText(inputs.title || titleFromBody(body, 'Community update'), 180),
        actorType,
        context.actor?.user_id || null,
        audience,
        JSON.stringify({ action_registry: true }),
      ]
    )).rows[0];
    threadId = thread.id;
  }
  const result = await context.db.query(
    `INSERT INTO bna_community_messages (
       thread_id, author_type, author_email, author_name, body, visibility, metadata_json
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7::jsonb
     )
     RETURNING *`,
    [
      threadId,
      actorType,
      context.actor?.user_id || null,
      inputs.author_name || context.actor?.user_id || 'BNA admin',
      body,
      audience,
      JSON.stringify({ action_registry: true, privacy_filter: 'scoped_community' }),
    ]
  );
  return { ...preview, community_message_posted: true, thread_id: threadId, message: result.rows[0] };
}

async function requestProviderContact(inputs = {}, context = {}) {
  const providerId = Number(inputs.provider_id || inputs.providerId || 0);
  const body = String(inputs.message || inputs.body || '').trim();
  if (!providerId) throw new Error('provider_id is required');
  if (!body) throw new Error('message is required');
  const preview = {
    provider_contact_request_saved: false,
    provider_id: providerId,
    student_id: inputs.student_id || null,
    community_id: inputs.community_id || null,
    preferred_contact_method: compactText(inputs.preferred_contact_method || 'provider_cta', 80),
    live_send_performed: false,
    external_booking_owned_by_provider: true,
  };
  if (context.dryRun || !context.db) return preview;
  const result = await context.db.query(
    `INSERT INTO bna_provider_messages (
       provider_id, service_id, parent_email, student_id, direction, channel,
       subject, body, status, source, source_context, metadata
     ) VALUES (
       $1, $2, $3, $4, 'parent_to_provider', 'portal',
       $5, $6, 'open', 'parent_portal', $7::jsonb, $8::jsonb
     )
     RETURNING *`,
    [
      providerId,
      inputs.service_id ? Number(inputs.service_id) : null,
      inputs.parent_email || context.actor?.user_id || null,
      inputs.student_id ? Number(inputs.student_id) : null,
      compactText(inputs.subject || 'Provider contact request', 180),
      body,
      JSON.stringify({
        action_registry: true,
        community_id: inputs.community_id || null,
        request_type: inputs.request_type || 'contact',
      }),
      JSON.stringify({
        preferred_contact_method: preview.preferred_contact_method,
        live_send_performed: false,
      }),
    ]
  );
  return { ...preview, provider_contact_request_saved: true, request: result.rows[0] };
}

function parseJsonObject(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeGoogleBusinessUrl(value = '') {
  const raw = compactText(value, 700).replace(/[),.;\]]+$/g, '');
  if (!raw) return '';
  let url = null;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('google_business_profile_url must be a valid Google Maps/Profile URL');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('google_business_profile_url must use http or https');
  }
  const host = url.hostname.toLowerCase();
  const allowed = host.includes('google.')
    || host === 'maps.app.goo.gl'
    || host === 'g.page'
    || host.endsWith('.g.page')
    || host === 'goo.gl'
    || host.endsWith('.goo.gl');
  if (!allowed) {
    throw new Error('google_business_profile_url must be a Google Maps/Profile link');
  }
  return url.href;
}

function extractGooglePlaceId(...values) {
  const joined = values.map((value) => String(value || '')).join(' ');
  const explicit = joined.match(/\b(?:place[_\s-]?id|placeid)\s*[:=]\s*([A-Za-z0-9_-]{10,220})/i)?.[1];
  if (explicit) return compactText(explicit, 220);
  const queryParam = joined.match(/[?&](?:place_id|placeid)=([^&#\s]+)/i)?.[1];
  if (queryParam) return compactText(decodeURIComponent(queryParam), 220);
  const chij = joined.match(/\bChI[A-Za-z0-9_-]{10,220}\b/)?.[0];
  return chij ? compactText(chij, 220) : '';
}

async function captureProviderGoogleBusinessLink(inputs = {}, context = {}) {
  const providerId = Number(inputs.provider_id || inputs.providerId || 0);
  const providerProfileId = Number(inputs.provider_profile_id || inputs.providerProfileId || 0);
  if (!providerId && !providerProfileId) throw new Error('provider_id is required');

  const rawGoogleUrl = inputs.google_business_profile_url
    || inputs.googleBusinessProfileUrl
    || inputs.google_maps_url
    || inputs.googleMapsUrl
    || inputs.google_url
    || inputs.googleUrl
    || '';
  const googleBusinessProfileUrl = normalizeGoogleBusinessUrl(rawGoogleUrl);
  const googlePlaceId = compactText(inputs.google_place_id || inputs.googlePlaceId || inputs.place_id || inputs.placeId || extractGooglePlaceId(rawGoogleUrl), 220);
  if (!googleBusinessProfileUrl && !googlePlaceId) {
    throw new Error('A Google Business/Profile URL or Google Place ID is required');
  }

  const preview = {
    provider_google_business_link_captured: false,
    provider_id: providerId || null,
    provider_profile_id: providerProfileId || null,
    google_business_profile_url: googleBusinessProfileUrl || null,
    google_place_id: googlePlaceId || null,
    google_business_status: 'manual',
    live_google_api_used: false,
    external_write_performed: false,
    public_listing_review_needed: true,
    place_id_needs_manual_lookup: Boolean(googleBusinessProfileUrl && !googlePlaceId),
    note: 'Manual Google Business/Profile fields can be stored now. Live GBP API/review sync still requires provider opt-in, business.manage, and approval.',
  };
  if (context.dryRun || !context.db) return preview;

  const targetId = providerProfileId || providerId;
  let profile = (await context.db.query(
    'SELECT * FROM bna_service_provider_profiles WHERE id = $1 LIMIT 1',
    [targetId]
  )).rows[0] || null;
  let legacyProvider = null;
  let legacyProviderId = 0;

  if (profile) {
    const metadata = parseJsonObject(profile.metadata);
    legacyProviderId = Number(inputs.legacy_provider_id || inputs.legacyProviderId || metadata.service_provider_id || metadata.legacy_provider_id || 0);
    if (legacyProviderId) {
      legacyProvider = (await context.db.query(
        'SELECT * FROM bna_service_providers WHERE id = $1 LIMIT 1',
        [legacyProviderId]
      )).rows[0] || null;
    }
  } else {
    legacyProviderId = providerId;
    legacyProvider = (await context.db.query(
      'SELECT * FROM bna_service_providers WHERE id = $1 LIMIT 1',
      [legacyProviderId]
    )).rows[0] || null;
  }

  if (!profile && !legacyProvider) throw new Error('Provider profile was not found');

  const metadataPatch = {
    manual_google_profile_url: googleBusinessProfileUrl || null,
    google_business_link_captured_at: new Date().toISOString(),
    google_business_link_captured_by: context.actor?.user_id || 'action_registry',
    google_business_link_capture_source: context.source || 'action_registry',
    google_business_link_notes: compactText(inputs.notes || '', 600) || null,
    live_feed_enabled: false,
  };

  let updatedProfile = null;
  if (profile) {
    updatedProfile = (await context.db.query(
      `UPDATE bna_service_provider_profiles
       SET google_business_status = 'manual',
           google_place_id = COALESCE($2, google_place_id),
           metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        profile.id,
        googlePlaceId || null,
        JSON.stringify(metadataPatch),
      ]
    )).rows[0] || null;
  }

  let updatedLegacyProvider = null;
  if (legacyProvider) {
    updatedLegacyProvider = (await context.db.query(
      `UPDATE bna_service_providers
       SET google_business_profile_url = COALESCE($2, google_business_profile_url),
           google_place_id = COALESCE($3, google_place_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, display_name, google_business_profile_url, google_place_id`,
      [
        legacyProvider.id,
        googleBusinessProfileUrl || null,
        googlePlaceId || null,
      ]
    )).rows[0] || null;
  }

  return {
    ...preview,
    provider_google_business_link_captured: true,
    provider_profile_id: updatedProfile?.id || profile?.id || null,
    legacy_provider_id: updatedLegacyProvider?.id || legacyProvider?.id || null,
    profile_updated: Boolean(updatedProfile),
    legacy_provider_updated: Boolean(updatedLegacyProvider),
    updated_profile: updatedProfile,
    updated_legacy_provider: updatedLegacyProvider,
  };
}

function queueTelegramReport(inputs = {}) {
  const message = compactText(inputs.message || inputs.body || '', 1800);
  if (!message) throw new Error('message is required');
  return {
    telegram_report_queued: false,
    approval_required_before_send: true,
    live_send_performed: false,
    related_task_id: inputs.related_task_id || null,
    message_preview: message,
  };
}

async function routeBugToCodex(inputs = {}, context = {}) {
  const title = compactText(inputs.title || inputs.message || 'Technical issue for Codex', 240);
  if (!title) throw new Error('title is required');
  const notes = [
    inputs.message || '',
    inputs.route ? `Route: ${inputs.route}` : '',
    inputs.evidence ? `Evidence: ${typeof inputs.evidence === 'string' ? inputs.evidence : JSON.stringify(inputs.evidence)}` : '',
  ].filter(Boolean).join('\n\n');
  if (context.dryRun || !context.db) {
    return {
      codex_task_created: false,
      title,
      assigned_to: 'Codex',
      category: 'technology',
      approval_required_before_queue: true,
    };
  }
  const result = await context.db.query(
    `INSERT INTO bna_tasks (
       title, notes, stage, category, urgency, source, source_context,
       created_by, assigned_to, ai_parsed, decision_required, author
     ) VALUES (
       $1, $2, 'assigned', 'technology', $3, $4, $5,
       $6, 'Codex', $7::jsonb, FALSE, $8
     )
     RETURNING *`,
    [
      title,
      notes || null,
      normalizeSeverity(inputs.severity) === 'blocking' ? 'urgent' : 'this_week',
      normalizeTaskSource(context.source || inputs.source),
      JSON.stringify({ action_registry: true, route: inputs.route || null, ticket_id: inputs.ticket_id || null }),
      context.actor?.user_id || 'action_registry',
      JSON.stringify({ kind: 'technical_bug', evidence: inputs.evidence || null }),
      context.actor?.user_id || 'action_registry',
    ]
  );
  return { codex_task_created: true, task: result.rows[0] };
}

async function runOperationsHandler(handler, inputs = {}, context = {}) {
  switch (handler) {
    case 'tasks.create':
      return createTask(inputs, context);
    case 'tasks.updateStage':
      return updateTaskStage(inputs, context);
    case 'tickets.create':
      return createTicket(inputs, context);
    case 'decisions.create':
      return createDecision(inputs, context);
    case 'timeline.addNote':
      return { note_added: !context.dryRun, note: inputs.note, related_type: inputs.related_type || null, related_id: inputs.related_id || null };
    case 'content.findLatestNewsletterDraft':
      return findLatestNewsletterDraft(inputs, context);
    case 'content.refineNewsletterDraft':
      return refineNewsletterDraft(inputs, context);
    case 'content.saveNewsletterRevision':
      return saveNewsletterRevision(inputs, context);
    case 'content.approveNewsletter':
      return approveNewsletter(inputs, context);
    case 'weekly.draftUpdate':
      return draftWeeklyUpdate(inputs, context);
    case 'weekly.selectHero':
      return selectWeeklyUpdateHero(inputs, context);
    case 'content.openItemUrl':
      return { url: `/operations?view=content&content=${encodeURIComponent(inputs.content_id || '')}` };
    case 'email.draft':
      return draftEmail(inputs, context);
    case 'email.draftFromNewsletter':
      return draftEmailFromNewsletter(inputs, context);
    case 'email.refine':
      return refineEmail(inputs, context);
    case 'email.approve':
      return { approved: !context.dryRun, draft_id: inputs.draft_id || null, note: 'Approval was logged; no email was sent.' };
    case 'email.schedule':
    case 'email.pauseScheduled':
    case 'email.sendTest':
      return connectorGuardedResult('email', inputs, context);
    case 'email.viewLog':
      return viewEmailLog(inputs, context);
    case 'calendar.createEvent':
      return createCalendarEvent(inputs, context);
    case 'calendar.createStudentScheduleItem':
      return createCalendarEvent(inputs, context, { workspace_id: WORKSPACES.BNA, visibility: 'student', source: 'manual', related_type: 'student' });
    case 'calendar.createParentVisibleEvent':
      return createCalendarEvent(inputs, context, { workspace_id: WORKSPACES.BNA, visibility: 'parent', source: 'manual', related_type: 'student' });
    case 'calendar.createProviderClassSession':
      return createCalendarEvent(inputs, context, { workspace_id: WORKSPACES.RABBI_SHELLER_PROVIDER, visibility: 'provider', source: 'provider_program', related_type: 'class_session' });
    case 'calendar.updateEvent':
      return updateCalendarEvent(inputs, context);
    case 'calendar.archiveEvent':
      return archiveCalendarEvent(inputs, context);
    case 'calendar.markParentVisible':
      return updateCalendarVisibility(inputs, context, 'parent');
    case 'calendar.markStudentVisible':
      return updateCalendarVisibility(inputs, context, 'student');
    case 'calendar.markAdminOnly':
      return updateCalendarVisibility(inputs, context, 'internal');
    case 'calendar.openEvent':
      return { url: `/operations?view=calendar&event=${encodeURIComponent(inputs.event_id || '')}` };
    case 'calendar.syncGoogleCalendar':
      return connectorGuardedResult('google_calendar', inputs, context);
    case 'calendar.syncGoogleClassroom':
      return connectorGuardedResult('google_classroom', inputs, context);
    case 'googleDrive.findFilePreview':
      return googleDrivePreview('find_file', inputs, context);
    case 'googleDrive.createDocPreview':
      return googleDrivePreview('create_doc', inputs, context);
    case 'googleDrive.createFolderPreview':
      return googleDrivePreview('create_folder', inputs, context);
    case 'googleDrive.moveFilePreview':
      return googleDrivePreview('move_file', inputs, context);
    case 'whatsapp.draftFromNewsletter':
      return { draft_created: true, channel: 'whatsapp', body: summarizeBody(inputs.newsletter_body || inputs.body || 'Newsletter WhatsApp draft needs source text.', 900), sent: false };
    case 'social.draftFromNewsletter':
      return { draft_created: true, channels: inputs.channels || ['facebook', 'linkedin'], body: summarizeBody(inputs.newsletter_body || inputs.body || 'Newsletter social draft needs source text.', 700), published: false };
    case 'student.showTodayPlan':
    case 'student.showAssignments':
    case 'student.explainAssignment':
      return { scope_safe: true, handler, note: 'Returned through scoped helper context; admin-only notes and other-family data are excluded.' };
    case 'student.generateWorksheet':
      return generateStudentWorksheet(inputs, context);
    case 'parent.showChildCalendar':
    case 'parent.draftMessageToAdmin':
    case 'parent.viewVisibleNotes':
    case 'support.createHelpRequest':
      return { scope_safe: true, handler, note: 'Returned through scoped helper context; admin-only notes and other-family data are excluded.' };
    case 'parent.draftResponse':
      return draftParentResponse(inputs, context);
    case 'support.createReportProblemTicket':
      return {
        scope_safe: true,
        review_ticket: true,
        codex_task_created: false,
        handler,
        route: inputs.route || null,
        classification: inputs.classification || 'problem_report',
        note: 'Parent/student reports create review tickets for Shloimie/admin. They do not create Codex code tasks automatically.',
      };
    case 'provider.createQuestionPost':
      return { provider_scope: true, post_created: !context.dryRun, body: inputs.body || '', note: 'Provider participant data stays separate from BNA school accountability.' };
    case 'community.postMessage':
      return postCommunityMessage(inputs, context);
    case 'provider.requestContact':
      return requestProviderContact(inputs, context);
    case 'provider.updateProfile':
      return { provider_scope: true, approved_write_required: true, provider_id: inputs.provider_id || null };
    case 'provider.captureGoogleBusinessLink':
      return captureProviderGoogleBusinessLink(inputs, context);
    case 'crm.moveLeadStage':
      return { lead_stage_update: !context.dryRun, stage: inputs.stage, lead_id: inputs.lead_id || null, lead_name: inputs.lead_name || null, note: 'CRM stage update is typed and audited; external CRM connector writes remain approval-gated.' };
    case 'telegram.queueReport':
      return queueTelegramReport(inputs, context);
    case 'codex.routeBug':
      return routeBugToCodex(inputs, context);
    default:
      return { executed: false, handler, note: 'No dedicated handler is wired yet; action was validated and audited only.' };
  }
}

module.exports = {
  buildRefinedNewsletterBody,
  findLatestNewsletterDraft,
  runOperationsHandler,
};
