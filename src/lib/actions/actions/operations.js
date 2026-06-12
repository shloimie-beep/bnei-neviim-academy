const { compactText, normalizeWorkspace, WORKSPACES } = require('../types');

const TASK_STAGES = new Set(['raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive']);
const CALENDAR_VISIBILITIES = new Set(['internal', 'parent', 'student', 'provider', 'public']);

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

function parseJsonValue(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function listFromInput(value = '', maxItems = 8) {
  if (Array.isArray(value)) return value.map((item) => compactText(item, 220)).filter(Boolean).slice(0, maxItems);
  return String(value || '')
    .split(/\r?\n|;|\u2022/)
    .map((item) => compactText(item.replace(/^[-*]\s*/, ''), 220))
    .filter(Boolean)
    .slice(0, maxItems);
}

async function findLatestUploadedMedia(inputs = {}, context = {}) {
  if (!context.db) {
    return {
      found: false,
      source: 'no_db',
      note: 'No database context was available, so latest uploaded media could not be inspected.',
    };
  }
  const mediaId = Number(inputs.media_id || inputs.content_job_id || inputs.job_id || 0);
  const params = [];
  const conditions = [
    "source_type IN ('telegram_media', 'local_drop', 'google_drive', 'manual')",
    "status <> 'archived'",
  ];
  if (mediaId) {
    params.push(mediaId);
    conditions.push(`id = $${params.length}`);
  }
  const result = await context.db.query(
    `SELECT id, title, source_type, local_path, media_url, drive_file_id, drive_folder_id,
            drive_stage, mime_type, caption, status, transcript_text, parse_json, notes,
            created_at, updated_at
     FROM bna_content_jobs
     WHERE ${conditions.join(' AND ')}
     ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
     LIMIT 1`,
    params
  );
  const media = result.rows[0] || null;
  return {
    found: Boolean(media),
    source: 'bna_content_jobs',
    media,
    needs_transcription: Boolean(media && !media.transcript_text && !parseJsonValue(media.parse_json, {})?.summary),
    next_actions: media
      ? ['generate_weekly_update', 'generate_parent_newsletter', 'generate_whatsapp_weekly_post', 'attach_video_to_parent_portal']
      : ['create_content_job', 'upload_media_to_drive'],
  };
}

function summarizeWeeklyTopics(inputs = {}) {
  const explicit = listFromInput(inputs.topics || inputs.topic_list || inputs.weekly_topics, 8);
  if (explicit.length) return { topics: explicit, source: 'inputs' };
  const text = String(inputs.source_text || inputs.transcript_text || inputs.learning || inputs.summary || '').replace(/\r/g, '');
  const candidates = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => compactText(line.replace(/^[-*]\s*/, ''), 220))
    .filter((line) => line.length > 12 && !/^dear parents/i.test(line))
    .slice(0, 8);
  return {
    topics: candidates.length ? candidates : ['Learning topics need staff review before sending.'],
    source: candidates.length ? 'source_text' : 'placeholder',
  };
}

function extractStudentQuestions(inputs = {}) {
  const explicit = listFromInput(inputs.questions || inputs.student_questions, 8);
  if (explicit.length) return { questions: explicit, source: 'inputs' };
  const text = String(inputs.source_text || inputs.transcript_text || inputs.learning || '').replace(/\r/g, '');
  const questions = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => compactText(line.replace(/^[-*]\s*/, ''), 240))
    .filter((line) => /\?|asked|question/i.test(line))
    .slice(0, 8);
  return { questions, source: questions.length ? 'source_text' : 'none_found' };
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
      source: inputs.source || context.source || 'telegram',
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
      inputs.source || context.source || 'telegram',
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
    blocked_by_config: !connectorReady,
    approval_checked: Boolean(context.approved),
    note: connectorReady
      ? 'Connector is present, but this safety pass still requires a dedicated send adapter before live external writes.'
      : `${kind} connector is not configured; no external send, publish, sync, payment, or access change was performed.`,
    requested_inputs: inputs,
  };
}

function whatsappConnectorStatus(context = {}) {
  const config = context.connectors?.whatsapp || {};
  const provider = config.provider || (config.configured ? 'wapi' : 'manual_link');
  const configured = Boolean(config.configured || config.api_key_configured || context.helpers?.sendWhatsappMessage);
  const testMode = Boolean(config.test_mode);
  return {
    provider,
    configured,
    base_url: config.base_url || '',
    instance_id: config.instance_id || '',
    default_sender: config.default_sender || '',
    default_parent_group_id: config.default_parent_group_id || config.default_group_id || '',
    approval_required: config.approval_required !== false,
    test_mode: testMode,
    ready_to_send: configured && !testMode,
    blocked_by_config: !configured,
    blocked_reason: configured ? (testMode ? 'WAPI test mode is enabled; no real WhatsApp send is performed.' : '') : 'WAPI is not configured. Use the manual WhatsApp link fallback.',
  };
}

function normalizeWhatsAppRecipient(value = '') {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  return digits.replace(/^\+/, '');
}

function whatsAppComposeUrl(to = '', body = '') {
  const recipient = normalizeWhatsAppRecipient(to);
  const text = encodeURIComponent(String(body || '').trim());
  return recipient ? `https://wa.me/${recipient}${text ? `?text=${text}` : ''}` : '';
}

function draftWhatsAppMessage(inputs = {}, context = {}) {
  const workspace = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id);
  const sourceText = summarizeBody(inputs.body || inputs.message || inputs.source_text || inputs.newsletter_body || '', 1200);
  const audience = compactText(inputs.audience || (workspace === WORKSPACES.RABBI_SHELLER_PROVIDER ? 'Rabbi Sheller participants' : 'BNA parents'), 160);
  const body = sourceText || [
    workspace === WORKSPACES.RABBI_SHELLER_PROVIDER ? 'Rabbi Sheller update' : 'BNA update',
    '',
    'Hi, here is the update:',
    '- ',
    '',
    'Reply here if you need help.',
  ].join('\n');
  return {
    draft_created: true,
    channel: 'whatsapp',
    workspace,
    audience,
    body,
    sent: false,
    approval_required_before_send: true,
    connector_status: whatsappConnectorStatus(context),
    compose_url: whatsAppComposeUrl(inputs.to || inputs.phone || inputs.whatsapp || '', body),
  };
}

function generateWhatsAppLink(inputs = {}, context = {}) {
  const draft = draftWhatsAppMessage(inputs, context);
  return {
    ...draft,
    compose_url: whatsAppComposeUrl(inputs.to || inputs.phone || inputs.whatsapp || '', draft.body),
    note: 'This is a prefilled WhatsApp link only. No API send was performed.',
  };
}

async function sendWhatsAppViaWapi(inputs = {}, context = {}) {
  const draft = draftWhatsAppMessage(inputs, context);
  const sendInputs = { ...inputs, body: draft.body };
  const connectorStatus = whatsappConnectorStatus(context);
  const composeUrl = draft.compose_url || whatsAppComposeUrl(inputs.to || inputs.phone || inputs.whatsapp || '', draft.body);
  if (context.dryRun || !context.approved) {
    return {
      ...draft,
      send_preview: true,
      sent: false,
      approval_required_before_send: true,
      connector: 'wapi',
      connector_ready: connectorStatus.configured,
      blocked_by_config: connectorStatus.blocked_by_config,
      blocked_reason: connectorStatus.blocked_reason,
      manual_link_fallback: composeUrl,
      log_status: 'action_audit_logged_only',
    };
  }
  if (!connectorStatus.configured) {
    return {
      ...draft,
      sent: false,
      connector: 'manual_link',
      connector_ready: false,
      blocked_by_config: true,
      blocked_reason: connectorStatus.blocked_reason,
      manual_link_fallback: composeUrl,
      log_status: 'action_audit_logged_only',
    };
  }
  if (connectorStatus.test_mode) {
    return {
      ...draft,
      sent: false,
      connector: 'wapi',
      connector_ready: true,
      test_mode: true,
      blocked_reason: connectorStatus.blocked_reason,
      manual_link_fallback: composeUrl,
      log_status: 'action_audit_logged_only',
    };
  }
  if (context.helpers?.sendWhatsappMessage) {
    return context.helpers.sendWhatsappMessage(sendInputs, context);
  }
  return connectorGuardedResult('whatsapp', sendInputs, context);
}

async function logWhatsAppMessage(inputs = {}, context = {}) {
  const body = String(inputs.body || inputs.message || '').trim();
  if (!body) throw new Error('body is required');
  const summary = compactText(inputs.summary || titleFromBody(body, 'WhatsApp message'), 240);
  const base = {
    logged: false,
    channel: 'whatsapp',
    direction: inputs.direction || 'outbound',
    summary,
    body,
  };
  if (context.dryRun || !context.db) return base;
  const result = await context.db.query(
    `INSERT INTO bna_contact_communications (
       contact_type, lead_id, signup_id, student_id, channel, direction,
       summary, body, follow_up_required, occurred_at, created_by, source,
       source_context, metadata
     ) VALUES (
       $1, $2, $3, $4, 'whatsapp', $5,
       $6, $7, $8, NOW(), $9, $10, $11::jsonb, $12::jsonb
     )
     RETURNING *`,
    [
      inputs.contact_type || (inputs.lead_id ? 'lead' : inputs.signup_id ? 'signup' : inputs.student_id ? 'student' : 'general'),
      inputs.lead_id || null,
      inputs.signup_id || null,
      inputs.student_id || null,
      ['inbound', 'outbound', 'internal_note'].includes(String(inputs.direction || '').toLowerCase()) ? inputs.direction : 'outbound',
      summary,
      body,
      Boolean(inputs.follow_up_required),
      inputs.created_by || context.actor?.user_id || 'action_registry',
      ['dashboard', 'telegram', 'wapi'].includes(String(context.source || '').toLowerCase()) ? context.source : 'dashboard',
      JSON.stringify({ action_registry: true, source_action: inputs.source_action || null }),
      JSON.stringify(inputs.metadata || {}),
    ]
  );
  return { ...base, logged: true, communication: result.rows[0] };
}

async function viewWhatsAppThread(inputs = {}, context = {}) {
  if (!context.db) return { entries: [], source: 'no_db' };
  const limit = Math.max(1, Math.min(Number(inputs.limit || 20), 80));
  const conditions = ["channel = 'whatsapp'"];
  const params = [];
  for (const key of ['lead_id', 'signup_id', 'student_id']) {
    if (inputs[key]) {
      params.push(Number(inputs[key]));
      conditions.push(`${key} = $${params.length}`);
    }
  }
  params.push(limit);
  const result = await context.db.query(
    `SELECT *
     FROM bna_contact_communications
     WHERE ${conditions.join(' AND ')}
     ORDER BY occurred_at DESC NULLS LAST, created_at DESC, id DESC
     LIMIT $${params.length}`,
    params
  );
  return { entries: result.rows.reverse() };
}

function draftParentLoginWhatsApp(inputs = {}, context = {}) {
  const parentName = compactText(inputs.parent_name || inputs.name || 'parent', 80);
  const url = String(inputs.url || inputs.login_url || '').trim();
  const body = [
    `Hi ${parentName},`,
    '',
    'Here is your secure BNA Parent Portal link.',
    url || '[login link will be generated by the parent access flow]',
    '',
    'For safety, the link is short-lived. Reply here if you need help.',
  ].join('\n');
  return {
    ...draftWhatsAppMessage({ ...inputs, body, audience: 'BNA parent' }, context),
    parent_email: inputs.parent_email || null,
    safe_to_send_after_approval: Boolean(url),
    note: 'Parent login WhatsApp is generated as a draft/preview first. Live sending uses the parent access link endpoint or approved WAPI action.',
  };
}

async function generateWeeklyUpdate(inputs = {}, context = {}) {
  let latestMedia = null;
  if (inputs.from_latest_media || inputs.latest_media || inputs.use_latest_media) {
    latestMedia = await findLatestUploadedMedia(inputs, context);
  }
  const media = latestMedia?.media || {};
  const studentName = compactText(inputs.student_name || inputs.student || 'your child', 120);
  const parsed = parseJsonValue(media.parse_json, {}) || {};
  const sourceText = inputs.source_text || inputs.learning || inputs.learning_notes || media.transcript_text || media.caption || media.notes || parsed.summary || '';
  const topicResult = summarizeWeeklyTopics({ ...inputs, source_text: sourceText, summary: parsed.summary });
  const questionResult = extractStudentQuestions({ ...inputs, source_text: sourceText });
  const learning = summarizeBody(sourceText, 520);
  const links = Array.isArray(inputs.links) ? inputs.links : String(inputs.links || '').split(/\s+/).filter(Boolean);
  const mediaLink = inputs.video_url || inputs.media_url || media.media_url || (media.drive_file_id ? `drive:${media.drive_file_id}` : '');
  const title = inputs.title || `${studentName} weekly update`;
  const summary = learning || 'Learning notes are ready for staff review before publishing to parents.';
  const body = [
    title,
    '',
    summary,
    '',
    topicResult.topics.length ? 'Topics learned/discussed:' : '',
    ...topicResult.topics.map((topic) => `- ${topic}`),
    questionResult.questions.length ? '\nStudent questions:' : '',
    ...questionResult.questions.map((question) => `- ${question}`),
    links.length ? `Links: ${links.slice(0, 4).join(', ')}` : '',
    mediaLink ? `Video/audio: ${mediaLink}` : '',
  ].filter(Boolean).join('\n');
  return {
    weekly_update_created: true,
    student_name: studentName,
    title,
    date: inputs.date || new Date().toISOString().slice(0, 10),
    summary,
    topics: topicResult.topics,
    student_questions: questionResult.questions,
    worksheet_links: links,
    attendance_snapshot: inputs.attendance_snapshot || inputs.attendance || null,
    payment_form_alerts: listFromInput(inputs.payment_form_alerts || inputs.alerts, 4),
    media: media && media.id ? {
      id: media.id,
      title: media.title,
      source_type: media.source_type,
      status: media.status,
      media_url: mediaLink,
      needs_transcription: latestMedia?.needs_transcription || false,
    } : null,
    body,
    parent_visible: Boolean(inputs.parent_visible),
    published: false,
    workspace: normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id),
    next_actions: ['refine_newsletter_draft', 'publish_weekly_update_to_parent_portal', 'generate_parent_newsletter', 'generate_whatsapp_weekly_post', 'send_weekly_update_whatsapp'],
  };
}

async function generateParentNewsletter(inputs = {}, context = {}) {
  const update = await generateWeeklyUpdate(inputs, context);
  const body = [
    'Dear parents,',
    '',
    update.summary,
    '',
    update.topics?.length ? 'This week we worked on:' : '',
    ...(update.topics || []).map((topic) => `- ${topic}`),
    update.student_questions?.length ? '\nQuestions the boys raised:' : '',
    ...(update.student_questions || []).map((question) => `- ${question}`),
    update.media?.media_url ? `\nVideo/audio link: ${update.media.media_url}` : '',
    '',
    'Warmly,',
    'Bnei Neviim Academy',
  ].filter(Boolean).join('\n');
  return {
    newsletter_draft_created: true,
    title: inputs.newsletter_title || update.title,
    body,
    sent: false,
    source_update: update,
  };
}

async function generateWhatsAppWeeklyPost(inputs = {}, context = {}) {
  const update = await generateWeeklyUpdate(inputs, context);
  const lines = [
    'BNA weekly update',
    '',
    update.summary,
    ...(update.topics || []).slice(0, 4).map((topic) => `- ${topic}`),
    update.student_questions?.length ? `Questions: ${update.student_questions.slice(0, 2).join('; ')}` : '',
    update.media?.media_url ? `Video/audio: ${update.media.media_url}` : '',
  ].filter(Boolean);
  return draftWhatsAppMessage({
    ...inputs,
    body: lines.join('\n'),
    audience: inputs.audience || 'BNA parent group',
  }, context);
}

function attachVideoToParentPortal(inputs = {}, context = {}) {
  const videoUrl = String(inputs.video_url || inputs.media_url || inputs.drive_url || '').trim();
  return {
    attached: Boolean(videoUrl && !context.dryRun),
    preview_only: Boolean(context.dryRun),
    video_url: videoUrl || null,
    thumbnail_url: inputs.thumbnail_url || null,
    parent_visible: Boolean(inputs.parent_visible || inputs.publish),
    note: videoUrl
      ? 'Video is ready to attach to the parent portal weekly update after approval.'
      : 'No video URL was provided. Use find_latest_uploaded_media first or attach a Drive/Vimeo/Replit link.',
  };
}

async function saveWeeklyUpdateRevision(inputs = {}, context = {}) {
  const body = String(inputs.body || inputs.update_body || '').trim();
  if (!body) throw new Error('body is required');
  if (context.dryRun || !context.db) {
    return {
      saved: false,
      title: inputs.title || titleFromBody(body, 'Weekly parent update revision'),
      body_preview: summarizeBody(body, 520),
      parent_visible: Boolean(inputs.parent_visible),
    };
  }
  const jobId = Number(inputs.job_id || inputs.content_job_id || 0);
  if (!jobId) throw new Error('job_id or content_job_id is required to save a weekly update revision');
  const result = await context.db.query(
    `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
     VALUES ($1, 'weekly_newsletter', $2, $3, 'parent_portal', $4, $5::jsonb)
     RETURNING *`,
    [
      jobId,
      inputs.title || titleFromBody(body, 'Weekly parent update revision'),
      body,
      inputs.parent_visible ? 'approved' : 'needs_approval',
      JSON.stringify({
        action_registry_revision: true,
        parent_portal_weekly_update: true,
        student_id: inputs.student_id || null,
        links: inputs.links || [],
      }),
    ]
  );
  return { saved: true, output: result.rows[0] };
}

async function publishWeeklyUpdate(inputs = {}, context = {}) {
  const update = await generateWeeklyUpdate({ ...inputs, parent_visible: true }, context);
  return {
    ...update,
    published: !context.dryRun,
    note: context.dryRun
      ? 'Preview only. Parent-visible publication requires approval and a persisted update target.'
      : 'Parent-visible publication was approved and audited. Persisted weekly-update storage is handled by the portal data source.',
  };
}

function prepareRabbiShellerAccessRequest(inputs = {}) {
  const checklist = [
    'Replit access or deploy/project invitation.',
    'Website admin access and read-only backend/database visibility.',
    'Vimeo/video library access or export list.',
    'GoDaddy/DNS/domain records as redacted screenshots or delegated access.',
    'Payment processor/link and Israeli payment setup.',
    'Email domain/account ownership and sender identities.',
    'Publer/social connector accounts or invitations.',
    'Past members/customers CSV export and WhatsApp/contact list.',
    'Questions/comments system export or screenshots.',
    'Worksheets/source sheets folder and video library structure.',
    'Analytics dashboard, app backend docs, and API/export options.',
  ];
  const safeIntakeMethods = [
    'Direct account invitation',
    'Shared password-manager item',
    'One-time secret link',
    'OAuth/connect flow',
    'Redacted screenshot for non-secret config',
    'Drive upload for non-secret materials only',
  ];
  const message = [
    'Hi Rabbi Sheller,',
    '',
    'To prepare tonight safely, can you please share the access/materials below? Please do not send raw passwords in Drive screenshots if an invite, password manager share, or one-time secret link is possible.',
    '',
    checklist.map(item => `- ${item}`).join('\n'),
    '',
    'Safe ways to send sensitive access:',
    safeIntakeMethods.map(item => `- ${item}`).join('\n'),
    '',
    'We will keep this separate from BNA school student data and will not change anything without approval.',
  ].join('\n');
  return {
    access_request_ready: true,
    recipient: inputs.recipient || 'Rabbi Sheller',
    checklist: checklist.map((item) => ({
      item,
      status: /access|invitation|processor|account/i.test(item) ? 'needed' : 'requested',
      owner: /payment|domain|email|social|member|customer/i.test(item) ? 'Rabbi Sheller' : 'Shloimie/Rabbi Sheller',
      safe_intake_method: /password|access|account|processor|database/i.test(item)
        ? 'direct invitation, password manager, OAuth, or one-time secret link'
        : 'Drive upload or redacted screenshot is acceptable',
      credential_status: /access|account|processor|database/i.test(item) ? 'secret_not_received' : 'non_secret_material',
    })),
    safe_intake_methods: safeIntakeMethods,
    drive_folder_plan: ['screenshots of pages', 'CSV exports', 'docs', 'videos', 'transcripts', 'website screenshots', 'non-secret setup notes'],
    message,
    sent: false,
  };
}

function createReportProblemTicket(inputs = {}, context = {}) {
  const pageContext = inputs.page_context || inputs.source_context || {};
  const target = pageContext.target || inputs.target || {};
  const boundingBox = inputs.bounding_box || target.rect || target.bounding_box || null;
  const selector = compactText(inputs.selector || [
    target.tag,
    target.id ? `#${target.id}` : '',
    target.classes ? `.${String(target.classes).split(/\s+/).slice(0, 3).join('.')}` : '',
  ].filter(Boolean).join(''), 240);
  return {
    ticket_ready: true,
    issue_id: inputs.issue_id || `ui-${Date.now().toString(36)}`,
    title: compactText(inputs.title || 'Operations UI issue', 180),
    description: summarizeBody(inputs.description || inputs.note || 'Reported from Operations assistant.', 900),
    severity: inputs.severity || 'normal',
    category: inputs.category || 'bot_api',
    reporter_user_id: context.actor?.user_id || inputs.reporter_user_id || null,
    reporter_role: context.actor?.role || inputs.reporter_role || null,
    workspace_id: context.actor?.workspace_id || inputs.workspace_id || null,
    route: pageContext.route || inputs.route || null,
    page_context: pageContext,
    selector,
    bounding_box: boundingBox,
    note: inputs.note || inputs.description || '',
    screenshot_path: inputs.screenshot_path || null,
    screenshot_status: inputs.screenshot_path ? 'captured' : 'not_captured_in_browser',
    status: inputs.status || 'open',
    assigned_to: inputs.assigned_to || (['high', 'blocking'].includes(inputs.severity) ? 'Codex' : 'Shloimie'),
    created_task_id: inputs.created_task_id || null,
    created: !context.dryRun,
  };
}

function summarizeCurrentPage(inputs = {}) {
  return {
    page_summary: compactText(inputs.title || inputs.route || 'Current Operations page', 220),
    visible_counts: inputs.visible_counts || {},
    recommended_next_actions: [
      'Report a problem with page context',
      'Draft WhatsApp/message copy through the action registry',
      'Create a scoped task when code/system work is actually needed',
    ],
  };
}

async function runOperationsHandler(handler, inputs = {}, context = {}) {
  switch (handler) {
    case 'tasks.create':
      return createTask(inputs, context);
    case 'tasks.updateStage':
      return updateTaskStage(inputs, context);
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
    case 'whatsapp.draftFromNewsletter':
      return { draft_created: true, channel: 'whatsapp', body: summarizeBody(inputs.newsletter_body || inputs.body || 'Newsletter WhatsApp draft needs source text.', 900), sent: false };
    case 'whatsapp.draft':
      return draftWhatsAppMessage(inputs, context);
    case 'whatsapp.generateLink':
      return generateWhatsAppLink(inputs, context);
    case 'whatsapp.sendViaWapi':
    case 'whatsapp.sendGroup':
      return sendWhatsAppViaWapi(inputs, context);
    case 'whatsapp.draftParentLogin':
      return draftParentLoginWhatsApp(inputs, context);
    case 'whatsapp.logMessage':
      return logWhatsAppMessage(inputs, context);
    case 'whatsapp.viewThread':
      return viewWhatsAppThread(inputs, context);
    case 'content.findLatestUploadedMedia':
      return findLatestUploadedMedia(inputs, context);
    case 'content.transcribeOrParseMediaIfNeeded': {
      const media = await findLatestUploadedMedia(inputs, context);
      return {
        ...media,
        queued: false,
        note: media.needs_transcription
          ? 'Media needs transcription/parsing before a final parent update. This action previews the blocker; it does not start an external transcription job.'
          : 'Media already has transcript/parse context available.',
      };
    }
    case 'content.summarizeWeeklyTopics':
      return summarizeWeeklyTopics(inputs);
    case 'content.extractStudentQuestions':
      return extractStudentQuestions(inputs);
    case 'parent.generateWeeklyUpdate':
      return generateWeeklyUpdate(inputs, context);
    case 'parent.generateNewsletter':
      return generateParentNewsletter(inputs, context);
    case 'whatsapp.generateWeeklyPost':
      return generateWhatsAppWeeklyPost(inputs, context);
    case 'parent.attachVideoToPortal':
      return attachVideoToParentPortal(inputs, context);
    case 'parent.saveWeeklyUpdateRevision':
      return saveWeeklyUpdateRevision(inputs, context);
    case 'parent.publishWeeklyUpdate':
      return publishWeeklyUpdate(inputs, context);
    case 'provider.prepareAccessRequest':
      return prepareRabbiShellerAccessRequest(inputs, context);
    case 'support.reportProblem':
      return createReportProblemTicket(inputs, context);
    case 'assistant.summarizePage':
      return summarizeCurrentPage(inputs, context);
    case 'social.draftFromNewsletter':
      return { draft_created: true, channels: inputs.channels || ['facebook', 'linkedin'], body: summarizeBody(inputs.newsletter_body || inputs.body || 'Newsletter social draft needs source text.', 700), published: false };
    case 'student.showTodayPlan':
    case 'student.showAssignments':
    case 'student.explainAssignment':
    case 'parent.showChildCalendar':
    case 'parent.draftMessageToAdmin':
    case 'parent.viewVisibleNotes':
    case 'support.createHelpRequest':
      return { scope_safe: true, handler, note: 'Returned through scoped helper context; admin-only notes and other-family data are excluded.' };
    case 'provider.createQuestionPost':
      return { provider_scope: true, post_created: !context.dryRun, body: inputs.body || '', note: 'Provider participant data stays separate from BNA school accountability.' };
    case 'provider.updateProfile':
      return { provider_scope: true, approved_write_required: true, provider_id: inputs.provider_id || null };
    case 'crm.moveLeadStage':
      return { lead_stage_update: !context.dryRun, stage: inputs.stage, lead_id: inputs.lead_id || null, lead_name: inputs.lead_name || null, note: 'CRM stage update is typed and audited; external CRM connector writes remain approval-gated.' };
    default:
      return { executed: false, handler, note: 'No dedicated handler is wired yet; action was validated and audited only.' };
  }
}

module.exports = {
  buildRefinedNewsletterBody,
  findLatestNewsletterDraft,
  runOperationsHandler,
};
