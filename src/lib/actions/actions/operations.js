const { compactText, normalizeWorkspace, WORKSPACES } = require('../types');
const {
  createCampaignDraft,
  createDripSequenceDraft,
  previewCampaignSegment,
} = require('../../../platform/assistant/campaign-control');
const {
  createAutomationDraft,
} = require('../../../platform/assistant/automation-builder');
const {
  planProblemResolution,
} = require('../../../platform/assistant/problem-resolution');
const {
  buildReminderPlan,
} = require('../../../platform/assistant/reminder-notifications');


const TASK_STAGES = new Set(['raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive']);
const CALENDAR_VISIBILITIES = new Set(['internal', 'parent', 'student', 'provider', 'public']);
const TASK_SOURCES = new Set(['manual', 'ramble', 'telegram', 'web', 'google_drive', 'content_job', 'import', 'community_webhook', 'green_invoice']);
const TICKET_CATEGORIES = new Set(['login', 'payment', 'link', 'recording', 'worksheet', 'access', 'cancellation', 'bot_api', 'drive', 'automation', 'task_manager', 'student_parent_data', 'other']);
const TICKET_SOURCES = new Set(['dashboard', 'telegram', 'api', 'system', 'web_assistant']);
const TICKET_SEVERITIES = new Set(['low', 'normal', 'high', 'blocking']);
const COMMUNITY_AUDIENCES = new Set(['members', 'parents', 'students', 'providers', 'staff']);
const COMMUNICATION_SOURCES = new Set(['manual', 'telegram', 'community_import', 'dashboard', 'seed', 'wapi']);
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const CONTENT_JOB_SOURCE_TYPES = new Set(['telegram_media', 'telegram_text', 'manual', 'import', 'local_drop', 'google_drive']);
const CONTENT_JOB_STATUSES = new Set(['ingested', 'transcribing', 'transcribed', 'parsing', 'drafting', 'needs_approval', 'approved', 'published', 'blocked', 'archived']);
const CONTENT_OUTPUT_STATUSES = new Set(['draft', 'needs_approval', 'approved', 'rejected', 'published', 'archived']);
const MODERATED_QUESTION_STATUSES = new Set(['needs_review', 'approved_for_rabbi', 'needs_source_sheet', 'needs_parent_safe_response', 'needs_clarification', 'duplicate_grouped', 'rejected_private']);
const SOCIAL_SCHEDULE_CHANNELS = new Set(['facebook', 'linkedin', 'youtube']);

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
  if (normalized === 'ui' || normalized === 'ui_button' || normalized === 'assistant' || normalized === 'website_assistant' || normalized === 'parent_portal_assistant' || normalized === 'provider_portal_assistant' || normalized === 'student_portal_assistant') return 'web_assistant';
  if (normalized === 'operations_helper') return 'dashboard';
  return TICKET_SOURCES.has(normalized) ? normalized : 'dashboard';
}

function normalizeCommunicationSource(value) {
  const normalized = String(value || 'manual').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'bot') return 'telegram';
  if (normalized === 'ui' || normalized === 'ui_button' || normalized === 'web_assistant') return 'dashboard';
  return COMMUNICATION_SOURCES.has(normalized) ? normalized : 'manual';
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

function normalizeContentJobSourceType(value, inputs = {}) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (CONTENT_JOB_SOURCE_TYPES.has(normalized)) return normalized;
  if (inputs.drive_file_id || inputs.driveFileId || inputs.drive_folder_id || inputs.driveFolderId) return 'google_drive';
  if (inputs.local_path || inputs.localPath) return 'local_drop';
  if (inputs.source_message_id || inputs.sourceMessageId || inputs.source_chat_id || inputs.sourceChatId) return 'telegram_media';
  return 'manual';
}

function normalizeContentJobStatus(value, fallback = 'needs_approval') {
  const normalized = String(value || fallback).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return CONTENT_JOB_STATUSES.has(normalized) ? normalized : fallback;
}

function normalizeContentOutputStatus(value, fallback = 'draft') {
  const normalized = String(value || fallback).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return CONTENT_OUTPUT_STATUSES.has(normalized) ? normalized : fallback;
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

function campaignAudienceInputs(inputs = {}) {
  const audience = inputs.audience && typeof inputs.audience === 'object' ? inputs.audience : {};
  return {
    segment_name: inputs.segment_name || audience.segment_name || inputs.audience_label || audience.audience_label || 'Campaign segment',
    audience_label: inputs.audience_label || audience.audience_label || inputs.segment_name || audience.segment_name || 'Campaign segment',
    estimated_count: inputs.estimated_count || audience.estimated_count || audience.count || 0,
    consent_count: inputs.consent_count || audience.consent_count || 0,
    suppression_counts: inputs.suppression_counts || audience.suppression_counts || {},
    exclusions: inputs.exclusions || audience.exclusions || [],
    workspace_key: inputs.workspace_key || audience.workspace_key,
    project_key: inputs.project_key || audience.project_key,
  };
}

function draftEmailCampaignPreview(inputs = {}, context = {}) {
  return createCampaignDraft({
    actor: context.actor || {},
    channel: context.source || inputs.channel || 'operations_helper',
    goal: inputs.goal || inputs.message || inputs.title || 'Email campaign draft',
    audience: campaignAudienceInputs(inputs),
    message: inputs.message && typeof inputs.message === 'object'
      ? inputs.message
      : { subject: inputs.subject || inputs.title, body: inputs.body || inputs.message },
    sender: inputs.sender || {},
    schedule: inputs.schedule || {},
    workspace_key: inputs.workspace_key,
    project_key: inputs.project_key,
  });
}

function draftDripSequencePreview(inputs = {}, context = {}) {
  return createDripSequenceDraft({
    actor: context.actor || {},
    channel: context.source || inputs.channel || 'operations_helper',
    goal: inputs.goal || inputs.message || inputs.title || 'Drip sequence draft',
    audience: campaignAudienceInputs(inputs),
    messages: inputs.messages || [],
    message_count: inputs.message_count || inputs.messageCount || 6,
    sender: inputs.sender || {},
    schedule: inputs.schedule || {},
    intervals: inputs.intervals || [],
    rate_limit: inputs.rate_limit || inputs.rateLimit || {},
    workspace_key: inputs.workspace_key,
    project_key: inputs.project_key,
  });
}

function draftAutomationPreview(inputs = {}, context = {}) {
  return createAutomationDraft({
    actor: context.actor || {},
    channel: context.source || inputs.channel || 'operations_helper',
    conversation_key: inputs.conversation_key || inputs.conversationKey || '',
    message: inputs.message || inputs.goal || inputs.title || 'Automation draft',
    definition: inputs.definition || null,
    sample_event: inputs.sample_event || inputs.sampleEvent || {},
    workspace_key: inputs.workspace_key,
    project_key: inputs.project_key,
  });
}

function scheduleAssistantReminderPreview(inputs = {}, context = {}) {
  return buildReminderPlan({
    actor: context.actor || {},
    channel: context.source || inputs.channel || 'operations_helper',
    message: inputs.message || inputs.title || inputs.body || 'Assistant reminder',
    timezone: inputs.timezone || 'Asia/Jerusalem',
    audience_scope: inputs.audience_scope || inputs.audienceScope || {},
    delivery_channels: inputs.delivery_channels || inputs.deliveryChannels || [],
    quiet_hours: inputs.quiet_hours || inputs.quietHours || { start: '21:00', end: '08:00' },
    consent_state: inputs.consent_state || inputs.consentState || {},
    current_time: inputs.current_time || inputs.currentTime || new Date(),
    workspace_key: inputs.workspace_key,
    project_key: inputs.project_key,
  });
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

function normalizeTaskRetitleInput(value) {
  return compactText(value, 180)
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function taskRetitleLooksUnsafe(title) {
  const normalized = String(title || '').replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  if (!normalized) return true;
  if (normalized.length > 120) return true;
  if (/\b(umm+|uh+|you know|basically|okay so|ok so|can you|could you|i need|i want|what in the world|nothing gets messed up|super professional)\b/i.test(lower)) return true;
  if (normalized.length > 96 && /\b(i|me|my|you|your|we|our)\b/i.test(normalized)) return true;
  return false;
}

function taskTitlePreview(value, maxLength = 96) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

async function loadTaskForRetitle(taskId, context = {}) {
  if (!context.db) return null;
  const result = await context.db.query(
    `SELECT id, title, stage, category, assigned_to, ai_parsed
     FROM bna_tasks
     WHERE id = $1
     LIMIT 1`,
    [taskId]
  );
  return result.rows[0] || null;
}

async function retitleTaskNaturally(inputs = {}, context = {}) {
  const taskId = Number(inputs.task_id || inputs.taskId || inputs.id || 0);
  if (!taskId) throw new Error('task_id is required');
  const nextTitle = normalizeTaskRetitleInput(inputs.new_title || inputs.newTitle || inputs.title);
  if (!nextTitle) throw new Error('new_title is required');
  if (taskRetitleLooksUnsafe(nextTitle)) {
    throw new Error('new_title must be concise and must not contain raw operator ramble wording');
  }
  const existingTask = await loadTaskForRetitle(taskId, context);
  if (!existingTask && context.db && !context.dryRun) throw new Error('Task was not found');
  const previousTitle = String(inputs.current_title || inputs.currentTitle || existingTask?.title || '').replace(/\s+/g, ' ').trim();
  const previousPreview = taskTitlePreview(previousTitle);
  const reason = compactText(inputs.reason || inputs.notes || '', 240);
  const changed = !previousTitle || previousTitle !== nextTitle;
  const preview = {
    task_updated: false,
    task_id: taskId,
    task_found: Boolean(existingTask) || !context.db,
    previous_title_preview: previousPreview || null,
    previous_title_length: previousTitle.length,
    next_title: nextTitle,
    reason: reason || null,
    changed,
    provenance_preserved: true,
    raw_previous_title_copied: false,
    no_agent_job_created: true,
  };
  if (context.dryRun || !context.db || !changed) return preview;
  const metadata = {
    action_registry: true,
    action_id: 'retitle_task_naturally',
    previous_title_preview: previousPreview || null,
    previous_title_length: previousTitle.length,
    reason: reason || null,
    source_comment_id: inputs.source_comment_id || inputs.sourceCommentId || null,
    raw_previous_title_copied: false,
    updated_by: context.actor?.user_id || 'action_registry',
  };
  const verificationNote = [
    'Retitled through helper action.',
    previousPreview ? `Previous title preview: "${previousPreview}".` : '',
    reason ? `Reason: ${reason}` : '',
    'Full raw wording remains in original task provenance and was not copied into this note.',
  ].filter(Boolean).join(' ');
  const result = await context.db.query(
    `UPDATE bna_tasks
     SET title = $2,
         verification_notes = CONCAT_WS(E'\n', NULLIF(verification_notes, ''), $3),
         ai_parsed = COALESCE(ai_parsed, '{}'::jsonb) || $4::jsonb,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, nextTitle, verificationNote, JSON.stringify(metadata)]
  );
  if (!result.rows[0]) throw new Error('Task was not found');
  return {
    ...preview,
    task_updated: true,
    task: result.rows[0],
  };
}

function normalizeTaskProjectKey(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (!normalized) return '';
  if (['bna', 'school', 'academy', 'bnei_neviim', 'bnei_neviim_academy', 'platform'].includes(normalized)) return 'bna';
  if (['rabbi', 'rabbi_sheller', 'sheller', 'one_time', 'one_time_mishna', 'one_time_mishnah', 'one_time_mishnah_class', 'mishna', 'mishnah'].includes(normalized)) {
    return ONE_TIME_PROJECT_KEY;
  }
  return normalized;
}

function parseDecisionOptions(value) {
  if (value === undefined || value === null || value === '') return [];
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (_error) {
      raw = raw.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
    }
  }
  if (raw && !Array.isArray(raw) && typeof raw === 'object' && Array.isArray(raw.options)) raw = raw.options;
  if (!Array.isArray(raw)) raw = [raw];
  return raw.map((option, index) => normalizeDecisionOption(option, index)).filter(Boolean);
}

function normalizeDecisionOption(option, index = 0) {
  if (option === undefined || option === null || option === '') return null;
  if (typeof option === 'string') {
    const label = compactText(option, 140);
    return label ? { label, value: label } : null;
  }
  if (typeof option !== 'object') {
    const label = compactText(option, 140);
    return label ? { label, value: label } : null;
  }
  const label = compactText(option.label || option.title || option.name || option.value || `Option ${index + 1}`, 140);
  if (!label) return null;
  const normalized = {
    label,
    value: compactText(option.value || option.id || label, 240),
  };
  const rationale = compactText(option.rationale || option.reason || option.notes || '', 300);
  if (rationale) normalized.rationale = rationale;
  if (option.recommended !== undefined) normalized.recommended = Boolean(option.recommended);
  return normalized;
}

function decisionOptionSignature(option = {}) {
  return `${String(option.label || '').toLowerCase()}::${String(option.value || '').toLowerCase()}`;
}

function mergeDecisionOptions(existingOptions = [], newOption = {}) {
  const seen = new Set();
  const merged = [];
  for (const option of [...existingOptions, newOption]) {
    const normalized = normalizeDecisionOption(option, merged.length);
    if (!normalized) continue;
    const signature = decisionOptionSignature(normalized);
    if (seen.has(signature)) continue;
    seen.add(signature);
    merged.push(normalized);
  }
  return merged;
}

function buildDecisionOptionFromInputs(inputs = {}) {
  const label = compactText(inputs.option_label || inputs.optionLabel || inputs.label || inputs.option || inputs.value, 140);
  if (!label) throw new Error('option_label is required');
  const option = {
    label,
    value: compactText(inputs.option_value || inputs.optionValue || inputs.value || label, 240),
  };
  const rationale = compactText(inputs.rationale || inputs.reason || inputs.notes || '', 300);
  if (rationale) option.rationale = rationale;
  if (inputs.recommended !== undefined) option.recommended = Boolean(inputs.recommended);
  return option;
}

async function loadTaskForDecisionAction(taskId, context = {}) {
  if (!context.db) return null;
  const result = await context.db.query(
    `SELECT id, title, stage, project_key, workspace_role, decision_options_json, ai_parsed
     FROM bna_tasks
     WHERE id = $1
     LIMIT 1`,
    [taskId]
  );
  return result.rows[0] || null;
}

async function addDecisionOption(inputs = {}, context = {}) {
  const taskId = Number(inputs.task_id || inputs.taskId || inputs.id || 0);
  if (!taskId) throw new Error('task_id is required');
  const nextOption = buildDecisionOptionFromInputs(inputs);
  const inputOptions = parseDecisionOptions(inputs.current_options || inputs.currentOptions || inputs.decision_options_json || inputs.decisionOptionsJson || inputs.options);
  const previewOptions = mergeDecisionOptions(inputOptions, nextOption);
  const preview = {
    decision_option_added: false,
    task_id: taskId,
    planned_option: nextOption,
    existing_option_count: inputOptions.length,
    next_options: previewOptions,
    decision_required: true,
    next_stage: 'needs_decision',
    no_agent_job_created: true,
  };
  if (context.dryRun || !context.db) return preview;

  const task = await loadTaskForDecisionAction(taskId, context);
  if (!task) throw new Error('Task was not found');
  const existingOptions = parseDecisionOptions(task.decision_options_json);
  const nextOptions = mergeDecisionOptions(existingOptions, nextOption);
  const duplicate = nextOptions.length === existingOptions.length;
  if (duplicate) {
    return {
      ...preview,
      task_found: true,
      duplicate: true,
      existing_option_count: existingOptions.length,
      next_options: nextOptions,
      task,
    };
  }

  const reason = compactText(inputs.reason || inputs.rationale || '', 240);
  const metadata = {
    action_registry: true,
    action_id: 'add_decision_option',
    added_option: nextOption,
    reason: reason || null,
    updated_by: context.actor?.user_id || 'action_registry',
  };
  const verificationNote = [
    `Decision option added through helper action: ${nextOption.label}.`,
    reason ? `Reason: ${reason}` : '',
    'No agent job, send, publish, or external CRM write was created.',
  ].filter(Boolean).join(' ');
  const result = await context.db.query(
    `UPDATE bna_tasks
     SET decision_options_json = $2::jsonb,
         decision_required = TRUE,
         item_type = 'decision',
         stage = CASE WHEN stage IN ('done', 'archive') THEN stage ELSE 'needs_decision' END,
         next_action_label = COALESCE(NULLIF(next_action_label, ''), 'Choose option'),
         verification_notes = CONCAT_WS(E'\n', NULLIF(verification_notes, ''), $3),
         ai_parsed = COALESCE(ai_parsed, '{}'::jsonb) || $4::jsonb,
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, JSON.stringify(nextOptions), verificationNote, JSON.stringify(metadata)]
  );
  if (!result.rows[0]) throw new Error('Task was not found');
  await context.db.query(
    `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
     VALUES ($1, $2, $3, 'workspace', 'system', $4::jsonb)
     RETURNING *`,
    [
      taskId,
      context.actor?.user_id || 'action_registry',
      `Decision option added: ${nextOption.label}`,
      JSON.stringify({ action_registry: true, action_id: 'add_decision_option', option: nextOption }),
    ]
  );
  return {
    ...preview,
    decision_option_added: true,
    task: result.rows[0],
    existing_option_count: existingOptions.length,
    next_options: nextOptions,
  };
}

function normalizeDateOnly(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (!match) return '';
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  if (date.toISOString().slice(0, 10) !== `${match[1]}-${match[2]}-${match[3]}`) return '';
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function normalizePlannedAt(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const iso = raw.match(/\b(20\d{2}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2})(?::\d{2})?)?\b/);
  if (!iso) return '';
  return `${iso[1]}T${iso[2] || '09:00'}:00`;
}

async function scheduleTaskOnDate(inputs = {}, context = {}) {
  const taskId = Number(inputs.task_id || inputs.taskId || inputs.id || 0);
  if (!taskId) throw new Error('task_id is required');
  const dueDate = normalizeDateOnly(inputs.due_date || inputs.dueDate || inputs.date || inputs.planned_at || inputs.plannedAt);
  if (!dueDate) throw new Error('due_date must be a valid YYYY-MM-DD date');
  const plannedAt = normalizePlannedAt(inputs.planned_at || inputs.plannedAt || inputs.datetime || inputs.date_time || inputs.dateTime || inputs.due_date || inputs.dueDate);
  const nextActionLabel = compactText(inputs.next_action_label || inputs.nextActionLabel || '', 120);
  const reason = compactText(inputs.reason || inputs.notes || '', 240);
  const preview = {
    task_scheduled: false,
    task_id: taskId,
    due_date: dueDate,
    planned_at: plannedAt || null,
    next_action_label: nextActionLabel || null,
    reason: reason || null,
    no_agent_job_created: true,
  };
  if (context.dryRun || !context.db) return preview;
  const metadata = {
    action_registry: true,
    action_id: 'schedule_task_on_date',
    due_date: dueDate,
    planned_at: plannedAt || null,
    reason: reason || null,
    updated_by: context.actor?.user_id || 'action_registry',
  };
  const verificationNote = [
    `Scheduled through helper action for ${dueDate}.`,
    plannedAt ? `Planned at: ${plannedAt}.` : '',
    reason ? `Reason: ${reason}` : '',
    'No agent job was created.',
  ].filter(Boolean).join(' ');
  const result = await context.db.query(
    `UPDATE bna_tasks
     SET due_date = $2::date,
         planned_at = COALESCE($3::timestamp, planned_at),
         next_action_label = COALESCE($4, next_action_label),
         verification_notes = CONCAT_WS(E'\n', NULLIF(verification_notes, ''), $5),
         ai_parsed = COALESCE(ai_parsed, '{}'::jsonb) || $6::jsonb,
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, dueDate, plannedAt || null, nextActionLabel || null, verificationNote, JSON.stringify(metadata)]
  );
  if (!result.rows[0]) throw new Error('Task was not found');
  return {
    ...preview,
    task_scheduled: true,
    task: result.rows[0],
  };
}

async function moveTaskWorkspace(inputs = {}, context = {}) {
  const taskId = Number(inputs.task_id || inputs.taskId || inputs.id || 0);
  if (!taskId) throw new Error('task_id is required');
  const targetProjectKey = normalizeTaskProjectKey(inputs.project_key || inputs.projectKey || inputs.project || inputs.workspace_key || inputs.workspaceKey || inputs.workspace);
  if (!targetProjectKey) throw new Error('workspace_key or project_key is required');
  const actorWorkspace = normalizeWorkspace(context.actor?.workspace_id);
  if (actorWorkspace === WORKSPACES.RABBI_SHELLER_PROVIDER && targetProjectKey !== ONE_TIME_PROJECT_KEY) {
    throw new Error('Rabbi Sheller scoped actors can only move tasks within the One Time workspace');
  }
  const workspaceRole = compactText(inputs.workspace_role || inputs.workspaceRole || '', 80);
  const reason = compactText(inputs.reason || inputs.notes || '', 240);
  const preview = {
    task_moved: false,
    task_id: taskId,
    target_project_key: targetProjectKey,
    workspace_role: workspaceRole || null,
    reason: reason || null,
    no_agent_job_created: true,
  };
  if (context.dryRun || !context.db) return preview;

  const existingTask = await loadTaskForDecisionAction(taskId, context);
  if (!existingTask) throw new Error('Task was not found');
  const project = (await context.db.query(
    'SELECT id, project_key, name, short_name FROM bna_projects WHERE project_key = $1 LIMIT 1',
    [targetProjectKey]
  )).rows[0];
  if (!project) throw new Error(`Workspace project was not found: ${targetProjectKey}`);
  const metadata = {
    action_registry: true,
    action_id: 'move_task_workspace',
    previous_project_key: existingTask.project_key || null,
    target_project_key: project.project_key,
    reason: reason || null,
    updated_by: context.actor?.user_id || 'action_registry',
  };
  const verificationNote = [
    `Moved through helper action to ${project.short_name || project.name || project.project_key}.`,
    existingTask.project_key ? `Previous project: ${existingTask.project_key}.` : '',
    reason ? `Reason: ${reason}` : '',
    'No student/parent data copy, external CRM write, or agent job was created.',
  ].filter(Boolean).join(' ');
  const result = await context.db.query(
    `UPDATE bna_tasks
     SET project_id = $2,
         project_key = $3,
         workspace_role = COALESCE($4, workspace_role),
         verification_notes = CONCAT_WS(E'\n', NULLIF(verification_notes, ''), $5),
         ai_parsed = COALESCE(ai_parsed, '{}'::jsonb) || $6::jsonb,
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, project.id, project.project_key, workspaceRole || null, verificationNote, JSON.stringify(metadata)]
  );
  if (!result.rows[0]) throw new Error('Task was not found');
  return {
    ...preview,
    task_moved: true,
    previous_project_key: existingTask.project_key || null,
    target_project_key: project.project_key,
    project,
    task: result.rows[0],
  };
}

function inputList(value, maxItems = 18) {
  if (value === undefined || value === null || value === '') return [];
  const raw = Array.isArray(value) ? value : String(value).split(/\r?\n|;/);
  const seen = new Set();
  const items = [];
  for (const item of raw) {
    const line = compactText(item, 220);
    const key = line.toLowerCase();
    if (!line || seen.has(key)) continue;
    seen.add(key);
    items.push(line);
    if (items.length >= maxItems) break;
  }
  return items;
}

function bulletBlock(label, items = []) {
  return items.length ? [`${label}:`, ...items.map((item) => `- ${item}`)].join('\n') : '';
}

async function loadOneTimeProject(context = {}) {
  if (!context.db) return null;
  const project = (await context.db.query(
    'SELECT id, project_key, name, short_name FROM bna_projects WHERE project_key = $1 LIMIT 1',
    [ONE_TIME_PROJECT_KEY]
  )).rows[0];
  if (!project) throw new Error('One Time Mishnah Class project is not seeded');
  return project;
}

function rabbiContentTopic(inputs = {}) {
  return compactText(inputs.title || inputs.topic || inputs.mishnah_ref || inputs.mishnahRef || inputs.prompt || inputs.message || inputs.raw_text, 220);
}

function rabbiShiurIdeaSpec(inputs = {}) {
  const topic = rabbiContentTopic(inputs);
  if (!topic) throw new Error('title or topic is required');
  const mishnahRef = compactText(inputs.mishnah_ref || inputs.mishnahRef || inputs.reference || '', 160);
  const audience = compactText(inputs.audience || inputs.member_level || inputs.memberLevel || 'One Time Mishnayos members', 160);
  const outlineItems = inputList(inputs.outline || inputs.suggested_outline || inputs.suggestedOutline || inputs.points || inputs.key_points, 12);
  const sourceHints = inputList(inputs.source_hints || inputs.sourceHints || inputs.sources || '', 12);
  const title = /^shiur idea:/i.test(topic) ? topic : `Shiur idea: ${topic}`;
  const notes = [
    mishnahRef ? `Mishnah/reference: ${mishnahRef}` : '',
    `Audience: ${audience}`,
    compactText(inputs.summary || inputs.notes || inputs.context || '', 700),
    bulletBlock('Suggested outline', outlineItems),
    bulletBlock('Source hints to verify', sourceHints),
    'Review policy: internal One Time/Rabbi review only. Do not publish, send, schedule, or present sources as verified until Rabbi/Shloimie approves.',
  ].filter(Boolean).join('\n\n');
  return {
    action_id: 'create_rabbi_shiur_idea',
    task_created: false,
    title,
    topic,
    notes,
    summary: compactText(inputs.summary || topic, 500),
    category: 'shiur_ideas',
    project_key: ONE_TIME_PROJECT_KEY,
    assigned_to: compactText(inputs.assigned_to || inputs.assignedTo || 'Rabbi Elie Scheller', 120),
    waiting_on: compactText(inputs.waiting_on || inputs.waitingOn || 'Rabbi Elie Scheller', 120),
    next_action_label: compactText(inputs.next_action_label || inputs.nextActionLabel || 'Rabbi review', 120),
    source_context: {
      mishnah_ref: mishnahRef || null,
      audience,
      outline_count: outlineItems.length,
      source_hint_count: sourceHints.length,
      source_url: inputs.source_url || inputs.sourceUrl || null,
      source_content_job_id: inputs.source_content_job_id || inputs.sourceContentJobId || null,
      class_session_id: inputs.class_session_id || inputs.classSessionId || null,
    },
    no_agent_job_created: true,
    no_send: true,
    external_write_performed: false,
    member_visible: false,
    public_visible: false,
    approval_required_before_publish: true,
  };
}

function rabbiSourceSheetTaskSpec(inputs = {}) {
  const topic = rabbiContentTopic(inputs);
  if (!topic) throw new Error('title or topic is required');
  const mishnahRef = compactText(inputs.mishnah_ref || inputs.mishnahRef || inputs.reference || '', 160);
  const sourceableTopics = inputList(inputs.sourceable_topics || inputs.sourceableTopics || inputs.topics || topic, 24);
  const studentQuestions = inputList(inputs.student_questions || inputs.studentQuestions || inputs.questions || '', 18);
  const sourceHints = inputList(inputs.source_hints || inputs.sourceHints || inputs.sources || '', 18);
  const transcriptExcerpt = compactText(inputs.transcript_excerpt || inputs.transcriptExcerpt || inputs.transcript_text || inputs.transcriptText || '', 1800);
  const title = /^source-sheet/i.test(topic) ? topic : `Rabbi source-sheet prep: ${topic}`;
  const notes = [
    mishnahRef ? `Mishnah/reference: ${mishnahRef}` : '',
    compactText(inputs.summary || inputs.notes || inputs.context || '', 700),
    'Research scope: prepare an internal source-sheet brief for Rabbi/Shloimie review before any member-facing material is published.',
    'Required output: source title, citation, concise explanation, and direct Sefaria link for each Torah source used where available.',
    'Review policy: flag anything that needs Rabbi/rav review instead of presenting automated research as final psak.',
    'Privacy policy: do not expose BNA private student/accountability data or One Time member identities in public/member drafts.',
    bulletBlock('Sourceable topics', sourceableTopics),
    bulletBlock('Questions to answer', studentQuestions),
    bulletBlock('Source hints to verify', sourceHints),
    transcriptExcerpt ? `Transcript excerpt for context:\n${transcriptExcerpt}` : '',
    'Publishing policy: no Drive write, Sefaria sheet write, website/member-library post, email, WhatsApp, social post, or external CRM write is created by this helper.',
  ].filter(Boolean).join('\n\n');
  return {
    action_id: 'create_rabbi_source_sheet_task',
    task_created: false,
    title,
    topic,
    notes,
    summary: compactText(inputs.summary || topic, 500),
    category: 'source_sheets',
    project_key: ONE_TIME_PROJECT_KEY,
    assigned_to: compactText(inputs.assigned_to || inputs.assignedTo || 'Shloimie', 120),
    waiting_on: compactText(inputs.waiting_on || inputs.waitingOn || 'Shloimie', 120),
    next_action_label: compactText(inputs.next_action_label || inputs.nextActionLabel || 'Approve source-sheet research', 120),
    source_context: {
      mishnah_ref: mishnahRef || null,
      sourceable_topic_count: sourceableTopics.length,
      student_question_count: studentQuestions.length,
      source_hint_count: sourceHints.length,
      source_url: inputs.source_url || inputs.sourceUrl || null,
      source_content_job_id: inputs.source_content_job_id || inputs.sourceContentJobId || null,
      class_session_id: inputs.class_session_id || inputs.classSessionId || null,
      suggested_codex_requeue: true,
    },
    no_agent_job_created: true,
    no_send: true,
    external_write_performed: false,
    member_visible: false,
    public_visible: false,
    approval_required_before_publish: true,
  };
}

async function insertRabbiContentTask(spec = {}, inputs = {}, context = {}) {
  const project = await loadOneTimeProject(context);
  const metadata = {
    action_registry: true,
    action_id: spec.action_id,
    kind: spec.action_id,
    project_key: ONE_TIME_PROJECT_KEY,
    no_send: true,
    external_write_performed: false,
    no_agent_job_created: true,
    created_by: context.actor?.user_id || 'action_registry',
    source_context: spec.source_context,
  };
  const sourceContext = {
    action_registry: true,
    action_id: spec.action_id,
    project_key: ONE_TIME_PROJECT_KEY,
    no_send: true,
    external_write_performed: false,
    ...spec.source_context,
  };
  const result = await context.db.query(
    `INSERT INTO bna_tasks (
       title, notes, summary, stage, category, urgency, source, source_context,
       created_by, assigned_to, ai_parsed, project_id, project_key, item_type,
       decision_required, author, waiting_on, agent_status, source_channel,
       source_message_id, next_action_label, last_activity_at
     ) VALUES (
       $1, $2, $3, 'assigned', $4, $5, $6, $7,
       $8, $9, $10::jsonb, $11, $12, 'task',
       FALSE, $13, $14, 'none', $15,
       $16, $17, NOW()
     )
     RETURNING *`,
    [
      spec.title,
      spec.notes,
      spec.summary || null,
      spec.category,
      inputs.urgency || 'this_week',
      normalizeTaskSource(inputs.source || context.source || 'telegram'),
      JSON.stringify(sourceContext),
      inputs.created_by || context.actor?.user_id || 'action_registry',
      spec.assigned_to || null,
      JSON.stringify(metadata),
      project.id,
      project.project_key,
      context.actor?.user_id || 'action_registry',
      spec.waiting_on || null,
      compactText(context.source || inputs.source_channel || inputs.sourceChannel || 'action_registry', 80),
      inputs.source_message_id || inputs.sourceMessageId ? String(inputs.source_message_id || inputs.sourceMessageId).slice(0, 160) : null,
      spec.next_action_label,
    ]
  );
  return result.rows[0];
}

async function createRabbiShiurIdea(inputs = {}, context = {}) {
  const spec = rabbiShiurIdeaSpec(inputs);
  if (context.dryRun || !context.db) return spec;
  const task = await insertRabbiContentTask(spec, inputs, context);
  return {
    ...spec,
    task_created: true,
    local_write_performed: true,
    task,
  };
}

async function createRabbiSourceSheetTask(inputs = {}, context = {}) {
  const spec = rabbiSourceSheetTaskSpec(inputs);
  if (context.dryRun || !context.db) return spec;
  const task = await insertRabbiContentTask(spec, inputs, context);
  return {
    ...spec,
    task_created: true,
    local_write_performed: true,
    task,
  };
}

function referralLedgerSpec(inputs = {}) {
  const referrerName = compactText(inputs.referrer_name || inputs.referrerName || inputs.member_name || inputs.memberName || inputs.parent_name || inputs.parentName, 160);
  const referredName = compactText(inputs.referred_name || inputs.referredName || inputs.prospect_name || inputs.prospectName || inputs.lead_name || inputs.leadName, 160);
  const title = compactText(
    inputs.title
      || [
        'Referral review',
        referredName ? `for ${referredName}` : '',
        referrerName ? `from ${referrerName}` : '',
      ].filter(Boolean).join(' '),
    220
  );
  if (!title) throw new Error('title is required');
  const sourceDetail = compactText(inputs.source_detail || inputs.sourceDetail || inputs.referral_source || inputs.referralSource || (referrerName ? `Referral from ${referrerName}` : 'manual referral'), 240);
  const referralCode = compactText(inputs.referral_code || inputs.referralCode || '', 120);
  const referralLink = compactText(inputs.referral_link || inputs.referralLink || '', 400);
  const notes = [
    referrerName ? `Referrer: ${referrerName}` : '',
    referredName ? `Referred prospect: ${referredName}` : '',
    compactText(inputs.context || inputs.notes || inputs.summary || '', 900),
    inputs.ask_copy || inputs.askCopy ? `Proposed ask copy for later approval:\n${summarizeBody(inputs.ask_copy || inputs.askCopy, 900)}` : '',
    referralCode ? `Referral code supplied for review: ${referralCode}` : '',
    referralLink ? `Referral link supplied for review: ${referralLink}` : '',
    'Review policy: internal referral ledger only. Do not ask, send, reward, discount, credit, publish, or notify anyone until Shloimie approves the exact referral policy and copy.',
  ].filter(Boolean).join('\n\n');
  const tags = inputList(inputs.tags || ['one-time-referral-lead', 'one-time-manual-referral-review'], 12);
  if (!tags.includes('one-time-referral-lead')) tags.unshift('one-time-referral-lead');
  if (!tags.includes('one-time-manual-referral-review')) tags.push('one-time-manual-referral-review');
  return {
    action_id: 'create_referral_ledger_entry',
    referral_entry_created: false,
    lead_created: false,
    communication_created: false,
    task_created: false,
    project_key: ONE_TIME_PROJECT_KEY,
    title,
    referrer_name: referrerName || null,
    referred_name: referredName || null,
    lead: {
      parent_name: referredName || compactText(inputs.parent_name || inputs.parentName || 'Referral prospect pending name', 160),
      parent_phone: compactText(inputs.referred_phone || inputs.referredPhone || inputs.parent_phone || inputs.parentPhone || '', 80) || null,
      parent_email: compactText(inputs.referred_email || inputs.referredEmail || inputs.parent_email || inputs.parentEmail || '', 160) || null,
      student_name: compactText(inputs.student_name || inputs.studentName || inputs.learner_name || inputs.learnerName || '', 160) || null,
      lead_type: 'content_interest',
      status: 'lead_candidate',
      interest_level: compactText(inputs.interest_level || inputs.interestLevel || 'unknown', 40),
      source: 'referral',
      source_detail: sourceDetail,
      next_follow_up_date: normalizeDateOnly(inputs.next_follow_up_date || inputs.nextFollowUpDate || inputs.follow_up_date || inputs.followUpDate) || null,
      owner: compactText(inputs.owner || 'Shloimie', 120),
      tags,
    },
    notes,
    source_context: {
      referrer_name: referrerName || null,
      referrer_contact_id: inputs.referrer_contact_id || inputs.referrerContactId || null,
      referrer_lead_id: inputs.referrer_lead_id || inputs.referrerLeadId || null,
      referred_name: referredName || null,
      referral_code: referralCode || null,
      referral_link: referralLink || null,
      reward_policy: compactText(inputs.reward_policy || inputs.rewardPolicy || 'manual_review_only', 160),
      no_send: true,
      referral_link_created: false,
      reward_created: false,
    },
    no_send: true,
    external_write_performed: false,
    referral_link_created: false,
    reward_created: false,
    live_send_performed: false,
    no_agent_job_created: true,
    approval_required_before_send: true,
  };
}

async function createReferralLedgerEntry(inputs = {}, context = {}) {
  const spec = referralLedgerSpec(inputs);
  if (context.dryRun || !context.db) return spec;
  const project = await loadOneTimeProject(context);
  const createdBy = context.actor?.user_id || 'action_registry';
  const leadMetadata = {
    action_registry: true,
    action_id: 'create_referral_ledger_entry',
    project_key: ONE_TIME_PROJECT_KEY,
    ...spec.source_context,
  };
  const lead = (await context.db.query(
    `INSERT INTO bna_parent_leads (
       project_id, parent_name, parent_phone, parent_email, student_name,
       lead_type, status, interest_level, source, source_detail,
       next_follow_up_date, owner, tags, notes, metadata
     ) VALUES (
       $1, $2, $3, $4, $5,
       'content_interest', 'lead_candidate', $6, 'referral', $7,
       $8::date, $9, $10::text[], $11, $12::jsonb
     )
     RETURNING *`,
    [
      project.id,
      spec.lead.parent_name,
      spec.lead.parent_phone,
      spec.lead.parent_email,
      spec.lead.student_name,
      ['hot', 'warm', 'cool', 'unknown'].includes(spec.lead.interest_level) ? spec.lead.interest_level : 'unknown',
      spec.lead.source_detail,
      spec.lead.next_follow_up_date,
      spec.lead.owner,
      spec.lead.tags,
      spec.notes,
      JSON.stringify(leadMetadata),
    ]
  )).rows[0];
  const communication = (await context.db.query(
    `INSERT INTO bna_contact_communications (
       project_id, contact_type, lead_id, channel, direction, summary, body,
       follow_up_required, created_by, source, source_context, metadata
     ) VALUES (
       $1, 'lead', $2, 'internal_note', 'internal_note', $3, $4,
       TRUE, $5, $6, $7::jsonb, $8::jsonb
     )
     RETURNING *`,
    [
      project.id,
      lead.id,
      spec.title,
      spec.notes,
      createdBy,
      normalizeCommunicationSource(context.source || inputs.source),
      JSON.stringify({ ...spec.source_context, lead_id: lead.id }),
      JSON.stringify({ action_registry: true, action_id: 'create_referral_ledger_entry', no_send: true }),
    ]
  )).rows[0];
  const task = await insertRabbiContentTask({
    action_id: 'create_referral_ledger_entry',
    title: `Referral review: ${spec.lead.parent_name}`,
    notes: [
      spec.notes,
      `Linked referral lead id: ${lead.id}.`,
      `Linked ledger communication id: ${communication.id}.`,
      'Next review: confirm eligibility, privacy, timing, copy, and reward/no-reward policy before any request is sent.',
    ].join('\n\n'),
    summary: spec.title,
    category: 'communications',
    assigned_to: spec.lead.owner || 'Shloimie',
    waiting_on: spec.lead.owner || 'Shloimie',
    next_action_label: 'Review referral eligibility',
    source_context: {
      ...spec.source_context,
      lead_id: lead.id,
      communication_id: communication.id,
    },
  }, inputs, context);
  return {
    ...spec,
    referral_entry_created: true,
    lead_created: true,
    communication_created: true,
    task_created: true,
    local_write_performed: true,
    lead,
    communication,
    task,
  };
}

function moderatedQuestionSpec(inputs = {}) {
  const questionText = compactText(inputs.question_text || inputs.questionText || inputs.question || inputs.body || inputs.message || inputs.title, 1800);
  if (!questionText) throw new Error('question_text is required');
  const topic = compactText(inputs.topic || inputs.mishnah_ref || inputs.mishnahRef || inputs.class_topic || inputs.classTopic || '', 180);
  const submitterLabel = compactText(inputs.submitter_label || inputs.submitterLabel || inputs.member_name || inputs.memberName || inputs.student_name || inputs.studentName || 'Private submitter', 160);
  const title = compactText(inputs.title || `Moderate question: ${topic || questionText}`, 220);
  const privacyNotes = compactText(inputs.privacy_notes || inputs.privacyNotes || 'Keep submitter identity private unless explicitly approved.', 600);
  const notes = [
    topic ? `Topic/reference: ${topic}` : '',
    `Submitter label: ${submitterLabel}`,
    `Question:\n${questionText}`,
    privacyNotes ? `Privacy notes: ${privacyNotes}` : '',
    compactText(inputs.context || inputs.notes || '', 900),
    'Moderation policy: private One Time/Rabbi review only. Do not publish to a forum, send a reply, expose member/student identity, or create a member-visible answer until reviewed and approved.',
  ].filter(Boolean).join('\n\n');
  return {
    action_id: 'submit_student_question_for_moderation',
    question_submitted: false,
    task_created: false,
    project_key: ONE_TIME_PROJECT_KEY,
    title,
    topic: topic || null,
    question_text: questionText,
    submitter_label: submitterLabel,
    privacy_notes: privacyNotes,
    notes,
    category: 'torah_class_prep',
    assigned_to: compactText(inputs.assigned_to || inputs.assignedTo || 'Rabbi Elie Scheller', 120),
    waiting_on: compactText(inputs.waiting_on || inputs.waitingOn || 'Rabbi Elie Scheller', 120),
    next_action_label: compactText(inputs.next_action_label || inputs.nextActionLabel || 'Moderate private question', 120),
    source_context: {
      submitter_label: submitterLabel,
      submitter_contact_id: inputs.submitter_contact_id || inputs.submitterContactId || null,
      student_id: inputs.student_id || inputs.studentId || null,
      member_id: inputs.member_id || inputs.memberId || null,
      class_session_id: inputs.class_session_id || inputs.classSessionId || null,
      source_content_job_id: inputs.source_content_job_id || inputs.sourceContentJobId || null,
      topic: topic || null,
      privacy_review_required: true,
    },
    no_agent_job_created: true,
    no_send: true,
    external_write_performed: false,
    public_visible: false,
    member_visible: false,
    forum_post_created: false,
    approval_required_before_response: true,
  };
}

function nullableInteger(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : null;
}

function notificationKeyForAction(eventType, sourceTable, sourceId, recipientLabel = 'Shloimie') {
  const recipient = compactText(recipientLabel, 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'shloimie';
  return `${eventType}:${recipient}:${sourceTable}:${sourceId || Date.now()}`;
}

async function insertActionInAppNotification({
  context,
  project,
  eventType,
  title,
  body,
  priority = 'normal',
  recipientLabel = 'Shloimie',
  recipientRole = 'operator',
  relatedType = '',
  relatedId = null,
  sourceTable = '',
  sourceId = null,
  sourceContext = {},
}) {
  if (!context.db || !title) return null;
  const notificationKey = notificationKeyForAction(eventType, sourceTable || relatedType || 'action', sourceId || relatedId, recipientLabel);
  const workspaceKey = project?.project_key === ONE_TIME_PROJECT_KEY ? WORKSPACES.RABBI_SHELLER_PROVIDER : normalizeWorkspace(context.actor?.workspace_id || WORKSPACES.BNA);
  const result = await context.db.query(
    `INSERT INTO bna_in_app_notifications (
       notification_key, project_id, workspace_key, recipient_label, recipient_role,
       event_type, title, body, priority, status, related_type, related_id,
       source_table, source_id, source_context, delivery_state, no_send,
       external_write_performed, created_by
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, 'unread', $10, $11,
       $12, $13, $14::jsonb, 'in_app_only', TRUE,
       FALSE, $15
     )
     ON CONFLICT (notification_key) DO UPDATE SET
       title = EXCLUDED.title,
       body = EXCLUDED.body,
       priority = EXCLUDED.priority,
       source_context = COALESCE(bna_in_app_notifications.source_context, '{}'::jsonb) || EXCLUDED.source_context,
       delivery_state = 'in_app_only',
       no_send = TRUE,
       external_write_performed = FALSE,
       updated_at = NOW()
     RETURNING *`,
    [
      notificationKey,
      project?.id || null,
      workspaceKey,
      compactText(recipientLabel, 160) || 'Shloimie',
      compactText(recipientRole, 120) || 'operator',
      eventType,
      compactText(title, 220),
      compactText(body, 1200) || null,
      ['low', 'normal', 'high', 'urgent'].includes(priority) ? priority : 'normal',
      compactText(relatedType, 80) || null,
      relatedId ? String(relatedId) : null,
      compactText(sourceTable, 120) || null,
      sourceId ? Number(sourceId) : null,
      JSON.stringify({
        ...sourceContext,
        action_registry: true,
        in_app_notification_only: true,
        no_send: true,
        external_write_performed: false,
      }),
      context.actor?.user_id || 'action_registry',
    ]
  );
  return result.rows[0] || null;
}

async function insertOneTimeQuestionReview(spec = {}, task = {}, inputs = {}, context = {}) {
  const project = await loadOneTimeProject(context);
  const sourceContext = {
    action_registry: true,
    action_id: 'submit_student_question_for_moderation',
    project_key: ONE_TIME_PROJECT_KEY,
    no_send: true,
    external_write_performed: false,
    public_visible: false,
    member_visible: false,
    forum_post_created: false,
    ...spec.source_context,
  };
  const result = await context.db.query(
    `INSERT INTO bna_one_time_question_reviews (
       project_id, task_id, content_job_id, class_session_id, member_id, student_id,
       submitter_label, question_text, topic, privacy_notes, review_status,
       assigned_to, waiting_on, next_action_label, source_context,
       public_visible, member_visible, forum_post_created, no_send,
       external_write_performed, created_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, 'needs_review',
       $11, $12, $13, $14::jsonb,
       FALSE, FALSE, FALSE, TRUE,
       FALSE, $15
     )
     ON CONFLICT (task_id) DO UPDATE
     SET question_text = EXCLUDED.question_text,
         topic = EXCLUDED.topic,
         privacy_notes = EXCLUDED.privacy_notes,
         assigned_to = EXCLUDED.assigned_to,
         waiting_on = EXCLUDED.waiting_on,
         next_action_label = EXCLUDED.next_action_label,
         source_context = COALESCE(bna_one_time_question_reviews.source_context, '{}'::jsonb) || EXCLUDED.source_context,
         public_visible = FALSE,
         member_visible = FALSE,
         forum_post_created = FALSE,
         no_send = TRUE,
         external_write_performed = FALSE,
         updated_at = NOW()
     RETURNING *`,
    [
      project.id,
      task.id || null,
      nullableInteger(inputs.source_content_job_id || inputs.sourceContentJobId),
      nullableInteger(inputs.class_session_id || inputs.classSessionId),
      inputs.member_id || inputs.memberId || null,
      nullableInteger(inputs.student_id || inputs.studentId),
      spec.submitter_label,
      spec.question_text,
      spec.topic || null,
      spec.privacy_notes || null,
      spec.assigned_to || null,
      spec.waiting_on || null,
      spec.next_action_label || null,
      JSON.stringify(sourceContext),
      context.actor?.user_id || inputs.created_by || 'action_registry',
    ]
  );
  return result.rows[0];
}

async function submitStudentQuestionForModeration(inputs = {}, context = {}) {
  const spec = moderatedQuestionSpec(inputs);
  if (context.dryRun || !context.db) return spec;
  const task = await insertRabbiContentTask(spec, inputs, context);
  const questionReview = await insertOneTimeQuestionReview(spec, task, inputs, context);
  const project = await loadOneTimeProject(context);
  const notification = await insertActionInAppNotification({
    context,
    project,
    eventType: 'one_time_question_needs_review',
    title: `Review Mishnah question: ${spec.topic || spec.submitter_label}`,
    body: spec.question_text,
    priority: 'high',
    recipientLabel: spec.assigned_to || 'Rabbi Elie Scheller',
    recipientRole: 'rabbi_reviewer',
    relatedType: 'one_time_question_review',
    relatedId: questionReview.id,
    sourceTable: 'bna_one_time_question_reviews',
    sourceId: questionReview.id,
    sourceContext: {
      task_id: task.id,
      review_status: questionReview.review_status,
      topic: spec.topic || null,
      no_public_forum: true,
    },
  });
  return {
    ...spec,
    question_submitted: true,
    task_created: true,
    question_review_created: true,
    in_app_notification_id: notification?.id || null,
    local_write_performed: true,
    task,
    question_review: questionReview,
  };
}

function normalizeModeratedQuestionStatus(value) {
  const normalized = String(value || 'needs_review').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'approve' || normalized === 'approved' || normalized === 'rabbi') return 'approved_for_rabbi';
  if (normalized === 'source_sheet' || normalized === 'source') return 'needs_source_sheet';
  if (normalized === 'parent_response' || normalized === 'member_response' || normalized === 'response') return 'needs_parent_safe_response';
  if (normalized === 'clarify') return 'needs_clarification';
  if (normalized === 'duplicate') return 'duplicate_grouped';
  if (normalized === 'reject' || normalized === 'rejected' || normalized === 'private') return 'rejected_private';
  return MODERATED_QUESTION_STATUSES.has(normalized) ? normalized : 'needs_review';
}

function moderatedQuestionReviewPlan(inputs = {}) {
  const taskId = Number(inputs.task_id || inputs.taskId || inputs.id || 0);
  if (!taskId) throw new Error('task_id is required');
  const reviewStatus = normalizeModeratedQuestionStatus(inputs.review_status || inputs.reviewStatus || inputs.status || inputs.decision);
  const reviewer = compactText(inputs.reviewer || inputs.reviewed_by || inputs.reviewedBy || 'Shloimie/Rabbi review', 120);
  const reviewNotes = compactText(inputs.review_notes || inputs.reviewNotes || inputs.notes || inputs.decision_notes || inputs.decisionNotes || '', 900);
  const nextActionByStatus = {
    needs_review: 'Continue private review',
    approved_for_rabbi: 'Rabbi response review',
    needs_source_sheet: 'Prepare source-sheet review',
    needs_parent_safe_response: 'Draft parent/member-safe response',
    needs_clarification: 'Clarify question privately',
    duplicate_grouped: 'Group with existing private question',
    rejected_private: 'Keep private; no response',
  };
  const nextStage = reviewStatus === 'needs_clarification'
    ? 'needs_decision'
    : (reviewStatus === 'duplicate_grouped' || reviewStatus === 'rejected_private' ? 'done' : 'assigned');
  return {
    action_id: 'review_moderated_question',
    moderation_review_recorded: false,
    task_id: taskId,
    review_status: reviewStatus,
    reviewer,
    review_notes: reviewNotes || null,
    next_stage: nextStage,
    next_action_label: compactText(inputs.next_action_label || inputs.nextActionLabel || nextActionByStatus[reviewStatus], 120),
    no_agent_job_created: true,
    no_send: true,
    external_write_performed: false,
    public_visible: false,
    member_visible: false,
    forum_post_created: false,
  };
}

async function reviewModeratedQuestion(inputs = {}, context = {}) {
  const plan = moderatedQuestionReviewPlan(inputs);
  if (context.dryRun || !context.db) return plan;
  const metadata = {
    action_registry: true,
    action_id: 'review_moderated_question',
    review_status: plan.review_status,
    reviewer: plan.reviewer,
    no_send: true,
    external_write_performed: false,
    public_visible: false,
    member_visible: false,
  };
  const verificationNote = [
    `Moderated question review recorded: ${plan.review_status}.`,
    plan.reviewer ? `Reviewer: ${plan.reviewer}.` : '',
    plan.review_notes ? `Notes: ${plan.review_notes}` : '',
    'No response, forum post, external notification/send, external write, or agent job was created. A private in-app review alert may be logged.',
  ].filter(Boolean).join(' ');
  const result = await context.db.query(
    `UPDATE bna_tasks
     SET stage = CASE
           WHEN $2 = 'needs_decision' THEN 'needs_decision'
           WHEN $2 = 'done' THEN 'done'
           ELSE CASE WHEN stage IN ('done', 'archive') THEN stage ELSE 'assigned' END
         END,
         next_action_label = $3,
         verification_notes = CONCAT_WS(E'\n', NULLIF(verification_notes, ''), $4),
         ai_parsed = COALESCE(ai_parsed, '{}'::jsonb) || $5::jsonb,
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [plan.task_id, plan.next_stage, plan.next_action_label, verificationNote, JSON.stringify(metadata)]
  );
  if (!result.rows[0]) throw new Error('Task was not found');
  const comment = (await context.db.query(
    `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
     VALUES ($1, $2, $3, 'workspace', 'system', $4::jsonb)
     RETURNING *`,
    [
      plan.task_id,
      context.actor?.user_id || 'action_registry',
      verificationNote,
      JSON.stringify({ action_registry: true, action_id: 'review_moderated_question', review_status: plan.review_status, no_send: true }),
    ]
  )).rows[0];
  const questionReview = (await context.db.query(
    `UPDATE bna_one_time_question_reviews
     SET review_status = $2,
         reviewed_by = $3,
         review_notes = $4,
         reviewed_at = NOW(),
         next_action_label = $5,
         public_visible = FALSE,
         member_visible = FALSE,
         forum_post_created = FALSE,
         no_send = TRUE,
         external_write_performed = FALSE,
         source_context = COALESCE(source_context, '{}'::jsonb) || $6::jsonb,
         updated_at = NOW()
     WHERE task_id = $1
     RETURNING *`,
    [
      plan.task_id,
      plan.review_status,
      plan.reviewer,
      plan.review_notes || null,
      plan.next_action_label,
      JSON.stringify({ action_registry: true, action_id: 'review_moderated_question', review_status: plan.review_status, no_send: true }),
    ]
  )).rows[0] || null;
  const project = await loadOneTimeProject(context);
  const notification = await insertActionInAppNotification({
    context,
    project,
    eventType: 'one_time_question_reviewed',
    title: `Question review recorded: ${plan.review_status}`,
    body: verificationNote,
    priority: plan.review_status === 'approved_for_rabbi' ? 'high' : 'normal',
    recipientLabel: plan.review_status === 'approved_for_rabbi' ? 'Rabbi Elie Scheller' : 'Shloimie',
    recipientRole: plan.review_status === 'approved_for_rabbi' ? 'rabbi_reviewer' : 'operator',
    relatedType: 'one_time_question_review',
    relatedId: questionReview?.id || plan.task_id,
    sourceTable: 'bna_one_time_question_reviews',
    sourceId: questionReview?.id || null,
    sourceContext: {
      task_id: plan.task_id,
      review_status: plan.review_status,
      no_public_forum: true,
    },
  });
  return {
    ...plan,
    moderation_review_recorded: true,
    local_write_performed: true,
    in_app_notification_id: notification?.id || null,
    task: result.rows[0],
    comment,
    question_review: questionReview,
  };
}

function oneTimeVideoLibraryOutputPlans(inputs = {}, title = '') {
  const transcriptStatus = compactText(inputs.transcript_status || inputs.transcriptStatus || (inputs.transcript_text ? 'transcript_received' : 'missing'), 80);
  const thumbnailStatus = compactText(inputs.thumbnail_status || inputs.thumbnailStatus || (inputs.thumbnail_url ? 'thumbnail_received' : 'needs_thumbnail'), 80);
  const worksheetStatus = compactText(inputs.worksheet_status || inputs.worksheetStatus || 'not_started', 80);
  const socialStatus = compactText(inputs.social_draft_status || inputs.socialDraftStatus || 'not_started', 80);
  const newsletterStatus = compactText(inputs.newsletter_draft_status || inputs.newsletterDraftStatus || 'not_started', 80);
  const summary = summarizeBody(inputs.summary || inputs.description || inputs.notes || 'Review this source before any member-library or public publishing.', 900);
  const commonMetadata = {
    action_registry: true,
    action_id: 'create_one_time_video_library_item',
    project_key: ONE_TIME_PROJECT_KEY,
    member_visible: false,
    public_visible: false,
    external_write_performed: false,
    approval_required_before_publish: true,
    source_url: inputs.source_url || inputs.sourceUrl || inputs.media_url || inputs.mediaUrl || null,
    drive_file_id: inputs.drive_file_id || inputs.driveFileId || null,
    source_content_job_id: inputs.source_content_job_id || inputs.sourceContentJobId || null,
  };
  return [
    {
      output_type: 'video_library_item',
      title: `${title} library card`,
      body: [
        `Title: ${title}`,
        summary ? `Summary: ${summary}` : '',
        'Visibility: internal review only.',
        'Publishing: blocked until Rabbi/Shloimie approval and a first-party member-library destination are confirmed.',
      ].filter(Boolean).join('\n'),
      platform: 'one_time_library',
      status: 'needs_approval',
      metadata: {
        ...commonMetadata,
        release_status: compactText(inputs.release_status || inputs.releaseStatus || 'needs_review', 80),
        rabbi_review_status: compactText(inputs.rabbi_review_status || inputs.rabbiReviewStatus || 'pending', 80),
        privacy_review_status: compactText(inputs.privacy_review_status || inputs.privacyReviewStatus || 'pending', 80),
      },
    },
    {
      output_type: 'transcript_review',
      title: `${title} transcript review`,
      body: String(inputs.transcript_text || inputs.transcriptText || '').trim() || `Transcript state: ${transcriptStatus}`,
      platform: 'internal_transcript',
      status: transcriptStatus === 'missing' ? 'draft' : 'needs_approval',
      metadata: { ...commonMetadata, transcript_status: transcriptStatus },
    },
    {
      output_type: 'thumbnail_brief',
      title: `${title} thumbnail brief`,
      body: String(inputs.thumbnail_brief || inputs.thumbnailBrief || '').trim() || `Thumbnail state: ${thumbnailStatus}`,
      platform: 'internal_design',
      status: 'draft',
      metadata: {
        ...commonMetadata,
        thumbnail_status: thumbnailStatus,
        thumbnail_url: inputs.thumbnail_url || inputs.thumbnailUrl || null,
      },
    },
    {
      output_type: 'worksheet_draft',
      title: `${title} worksheet/source-sheet plan`,
      body: String(inputs.worksheet_body || inputs.worksheetBody || inputs.worksheet_notes || inputs.worksheetNotes || '').trim() || `Worksheet/source-sheet state: ${worksheetStatus}`,
      platform: 'internal_materials',
      status: 'draft',
      metadata: { ...commonMetadata, worksheet_status: worksheetStatus },
    },
    {
      output_type: 'social_copy_plan',
      title: `${title} social copy plan`,
      body: String(inputs.social_notes || inputs.socialNotes || '').trim() || `Social draft state: ${socialStatus}`,
      platform: 'internal_social_plan',
      status: 'draft',
      metadata: { ...commonMetadata, social_draft_status: socialStatus, buffer_write_performed: false },
    },
    {
      output_type: 'newsletter_plan',
      title: `${title} newsletter plan`,
      body: String(inputs.newsletter_notes || inputs.newsletterNotes || '').trim() || `Newsletter draft state: ${newsletterStatus}`,
      platform: 'internal_newsletter_plan',
      status: 'draft',
      metadata: { ...commonMetadata, newsletter_draft_status: newsletterStatus, email_send_performed: false },
    },
  ].map((output) => ({
    ...output,
    status: normalizeContentOutputStatus(output.status, 'draft'),
  }));
}

function oneTimeVideoLibraryPreview(inputs = {}) {
  const title = compactText(inputs.title || inputs.video_title || inputs.videoTitle, 220);
  if (!title) throw new Error('title is required');
  const sourceType = normalizeContentJobSourceType(inputs.source_type || inputs.sourceType, inputs);
  const jobStatus = normalizeContentJobStatus(inputs.status, 'needs_approval');
  const outputs = oneTimeVideoLibraryOutputPlans(inputs, title);
  return {
    library_item_created: false,
    content_job_created: false,
    project_key: ONE_TIME_PROJECT_KEY,
    title,
    job: {
      title,
      source_type: sourceType,
      status: jobStatus,
      media_url: inputs.media_url || inputs.mediaUrl || inputs.source_url || inputs.sourceUrl || null,
      drive_file_id: inputs.drive_file_id || inputs.driveFileId || null,
      drive_folder_id: inputs.drive_folder_id || inputs.driveFolderId || null,
      drive_stage: inputs.drive_stage || inputs.driveStage || 'one_time_video_library',
      mime_type: inputs.mime_type || inputs.mimeType || null,
      caption: inputs.caption || null,
      notes: inputs.notes || null,
      parse_json: {
        project_key: ONE_TIME_PROJECT_KEY,
        content_kind: 'one_time_video_library_item',
        source_content_job_id: inputs.source_content_job_id || inputs.sourceContentJobId || null,
        summary: inputs.summary || inputs.description || null,
        source_url: inputs.source_url || inputs.sourceUrl || null,
      },
    },
    planned_outputs: outputs.map((output) => ({
      output_type: output.output_type,
      title: output.title,
      platform: output.platform,
      status: output.status,
      member_visible: false,
      public_visible: false,
    })),
    member_visible: false,
    public_visible: false,
    external_write_performed: false,
    local_write_performed: false,
    live_send_performed: false,
    no_send: true,
    approval_required_before_publish: true,
  };
}

function oneTimeOutputStatuses(inputs = {}) {
  const raw = inputs.output_statuses || inputs.outputStatuses || {};
  const statuses = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const readStatus = (key, fallback = 'missing') => normalizeContentOutputStatus(
    statuses[key] || inputs[`${key}_status`] || inputs[`${key}Status`] || fallback,
    fallback,
  );
  return {
    video_library_item: readStatus('video_library_item'),
    transcript_review: readStatus('transcript_review'),
    thumbnail_brief: readStatus('thumbnail_brief'),
    worksheet_draft: readStatus('worksheet_draft'),
    social_copy_plan: readStatus('social_copy_plan'),
    newsletter_plan: readStatus('newsletter_plan'),
  };
}

function oneTimeMemberLibraryPublishPackagePreview(inputs = {}, context = {}) {
  const contentJobId = Number(inputs.content_job_id || inputs.contentJobId || inputs.job_id || inputs.jobId || 0);
  if (!Number.isFinite(contentJobId) || contentJobId <= 0) throw new Error('content_job_id is required');
  const title = compactText(inputs.title || inputs.content_title || inputs.contentTitle || `One Time content job #${contentJobId}`, 220);
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.RABBI_SHELLER_PROVIDER);
  const projectKey = compactText(inputs.project_key || inputs.projectKey || ONE_TIME_PROJECT_KEY, 120);
  const mediaUrl = compactText(inputs.media_url || inputs.mediaUrl || inputs.hosted_media_url || inputs.hostedMediaUrl, 500);
  const sourceUrl = compactText(inputs.source_url || inputs.sourceUrl, 500);
  const outputStatuses = oneTimeOutputStatuses(inputs);
  const releaseStatus = compactText(inputs.release_status || inputs.releaseStatus || 'needs_review', 80);
  const rabbiReviewStatus = compactText(inputs.rabbi_review_status || inputs.rabbiReviewStatus || 'pending', 80);
  const privacyReviewStatus = compactText(inputs.privacy_review_status || inputs.privacyReviewStatus || 'pending', 80);
  const destination = compactText(inputs.destination || inputs.member_library_destination || inputs.memberLibraryDestination, 220);
  const audience = compactText(inputs.audience || inputs.eligible_audience || inputs.eligibleAudience, 220);
  const visibilityRules = compactText(inputs.visibility_rules || inputs.visibilityRules, 320);
  const notificationPlan = compactText(inputs.notification_plan || inputs.notificationPlan || 'no-send until separately approved', 320);
  const rollbackPlan = compactText(inputs.rollback_plan || inputs.rollbackPlan, 320);
  const approvalPhrase = compactText(inputs.approval_phrase || inputs.approvalPhrase, 120);
  const upstreamBlockers = inputList(inputs.blockers_from_operations || inputs.blockersFromOperations, 8);
  const blockers = [...upstreamBlockers];

  if (projectKey !== ONE_TIME_PROJECT_KEY) blockers.push('Package must stay scoped to one_time_mishnah_class.');
  if (workspaceKey !== WORKSPACES.RABBI_SHELLER_PROVIDER) blockers.push('Confirm this package belongs in the Rabbi Scheller provider workspace before publishing.');
  if (!mediaUrl || !/^https?:\/\//i.test(mediaUrl)) blockers.push('Hosted media URL is required before a member-library package can be published.');
  if (outputStatuses.video_library_item !== 'approved') blockers.push('Library card output must be approved internally.');
  if (!['approved', 'published'].includes(outputStatuses.transcript_review)) blockers.push('Transcript review must be approved internally.');
  if (!['approved', 'published'].includes(outputStatuses.worksheet_draft)) blockers.push('Worksheet/source-sheet lane must be reviewed or explicitly skipped by Shloimie.');
  if (!/approved|ready/i.test(releaseStatus)) blockers.push('Release status must be approved/ready.');
  if (!/approved|ready/i.test(rabbiReviewStatus)) blockers.push('Rabbi review must be approved/ready.');
  if (!/approved|ready/i.test(privacyReviewStatus)) blockers.push('Privacy review must be approved/ready.');
  if (!destination) blockers.push('Member-library destination is not approved yet.');
  if (!audience) blockers.push('Eligible member audience is not approved yet.');
  if (!visibilityRules) blockers.push('Visibility and access rules are not approved yet.');
  if (!rollbackPlan) blockers.push('Rollback/takedown plan is not approved yet.');
  if (approvalPhrase !== 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING') {
    blockers.push('Final approval phrase has not been supplied for a live publishing smoke.');
  }

  const uniqueBlockers = Array.from(new Set(blockers.filter(Boolean)));
  return {
    publish_package_preview_created: true,
    action_id: 'preview_one_time_member_library_publish_package',
    content_job_id: contentJobId,
    project_key: ONE_TIME_PROJECT_KEY,
    workspace_key: workspaceKey,
    title,
    package: {
      destination: destination || 'blocked_until_approved',
      audience: audience || 'blocked_until_approved',
      visibility_rules: visibilityRules || 'blocked_until_approved',
      notification_plan: notificationPlan,
      rollback_plan: rollbackPlan || 'blocked_until_approved',
      media_url: mediaUrl || null,
      source_url: sourceUrl || null,
      output_statuses: outputStatuses,
      review_statuses: {
        release_status: releaseStatus,
        rabbi_review_status: rabbiReviewStatus,
        privacy_review_status: privacyReviewStatus,
      },
    },
    blockers: uniqueBlockers,
    ready_for_one_item_smoke: uniqueBlockers.length === 0,
    approval_phrase_required: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    approval_phrase_present: approvalPhrase === 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    approval_required_before_publish: true,
    member_visible: false,
    public_visible: false,
    member_visibility_changed: false,
    publish_performed: false,
    member_library_publish_performed: false,
    drive_video_host_write_performed: false,
    buffer_social_write_performed: false,
    email_whatsapp_send_performed: false,
    checkout_access_write_performed: false,
    external_crm_write_performed: false,
    external_write_performed: false,
    local_write_performed: false,
    live_send_performed: false,
    no_send: true,
    dry_run_only: true,
  };
}

function normalizeSocialScheduleChannels(value) {
  const chunks = Array.isArray(value) ? value : [value];
  const channels = [];
  const add = (channel) => {
    if (!SOCIAL_SCHEDULE_CHANNELS.has(channel) || channels.includes(channel)) return;
    channels.push(channel);
  };
  for (const chunk of chunks) {
    const text = String(chunk || '').toLowerCase();
    if (/\bfacebook\b|\bfb\b|facebook_post/.test(text)) add('facebook');
    if (/\blinkedin\b|\blinked\s*in\b|linkedin_post/.test(text)) add('linkedin');
    if (/\byoutube\b|\byou\s*tube\b|youtube_description|shorts?\b/.test(text)) add('youtube');
  }
  return channels;
}

function normalizeSocialPostCount(value, fallbackSource = '') {
  const direct = Number(value);
  if (Number.isFinite(direct) && direct > 0) return Math.min(Math.round(direct), 14);
  const source = compactText(fallbackSource, 500).toLowerCase();
  const numbered = source.match(/\b(\d{1,2})\s+(?:social\s+)?posts?\b/);
  if (numbered) return Math.min(Number(numbered[1]), 14);
  if (/\bone\s+(?:post\s+)?per\s+day\s+this\s+week\b|\bdaily\b.{0,30}\bthis\s+week\b/.test(source)) return 7;
  return 1;
}

function socialScheduleStart(value) {
  const text = compactText(value, 120);
  const match = text.match(/\b(20\d{2}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2})(?::\d{2})?)?\b/);
  if (!match) return '';
  return `${match[1]}T${match[2] || '09:00'}:00`;
}

function addDaysToIsoDateTime(value, days) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return '';
  const date = new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]) + days,
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  ));
  return date.toISOString().replace(/\.\d{3}Z$/, '');
}

function socialSchedulePreview(inputs = {}, context = {}) {
  const sourceText = compactText(
    inputs.post_text
      || inputs.postText
      || inputs.body
      || inputs.caption
      || inputs.source_text
      || inputs.sourceText
      || inputs.newsletter_body
      || inputs.newsletterBody
      || inputs.summary
      || '',
    1800,
  );
  const rawChannels = inputs.channels || inputs.platforms || inputs.channel || inputs.platform || sourceText;
  const channels = normalizeSocialScheduleChannels(rawChannels);
  const postCount = normalizeSocialPostCount(inputs.post_count || inputs.postCount, sourceText);
  const scheduleStart = socialScheduleStart(inputs.schedule_start || inputs.scheduleStart || inputs.scheduled_for || inputs.scheduledFor || inputs.planned_at || inputs.plannedAt || sourceText);
  const cadence = compactText(inputs.cadence || (postCount > 1 ? 'daily' : 'single'), 80);
  const sourceUrl = compactText(inputs.source_url || inputs.sourceUrl || inputs.media_url || inputs.mediaUrl, 500);
  const hostedMediaUrl = compactText(inputs.hosted_media_url || inputs.hostedMediaUrl || inputs.media_url || inputs.mediaUrl, 500);
  const approvalPhrase = compactText(inputs.approval_phrase || inputs.approvalPhrase, 120);
  const explicitBufferMode = /buffer|scheduler|schedule/i.test(`${inputs.destination || ''} ${inputs.mode || ''} ${sourceText}`);
  const blockers = inputList(inputs.blockers || inputs.blockers_from_operations || inputs.blockersFromOperations, 8);

  if (!sourceText) blockers.push('Post copy or source text is required before a social scheduling package can be reviewed.');
  if (!channels.length) blockers.push('Target social channel must be selected before creating a Buffer draft.');
  if (!scheduleStart && (postCount > 1 || /schedule|queue|calendar|per day|daily/i.test(sourceText))) {
    blockers.push('Schedule start/window must be confirmed before queueing social drafts.');
  }
  if (/\bvideo|clip|recording|reel|short\b/i.test(sourceText) && !sourceUrl && !hostedMediaUrl) {
    blockers.push('Source video, transcript, or hosted media URL is required for video-derived social posts.');
  }
  if (hostedMediaUrl && !/^https?:\/\//i.test(hostedMediaUrl)) {
    blockers.push('Hosted media URL must be HTTP(S) before Buffer/media handoff.');
  }
  if (approvalPhrase !== 'APPROVE_BUFFER_SOCIAL_DRAFT') {
    blockers.push('Final Buffer draft approval phrase has not been supplied.');
  }

  const uniqueBlockers = Array.from(new Set(blockers.filter(Boolean)));
  const slots = Array.from({ length: postCount }, (_, index) => ({
    draft_index: index + 1,
    channel_targets: channels,
    scheduled_for: scheduleStart ? addDaysToIsoDateTime(scheduleStart, cadence === 'daily' ? index : 0) : null,
    status: 'preview_only',
  }));

  return {
    social_schedule_preview_created: true,
    action_id: 'preview_social_schedule_package',
    provider: 'buffer',
    buffer_is_active_social_provider: true,
    workspace_key: normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.BNA),
    channels,
    post_count: postCount,
    cadence,
    schedule_start: scheduleStart || null,
    explicit_buffer_mode_requested: explicitBufferMode,
    package: {
      source_text: sourceText,
      source_url: sourceUrl || null,
      hosted_media_url: hostedMediaUrl || null,
      slots,
      next_step: 'Approve source, channel, copy, schedule window, and rollback/no-post path before using the existing Buffer draft commit path.',
    },
    blockers: uniqueBlockers,
    ready_for_buffer_draft_smoke: uniqueBlockers.length === 0,
    approval_phrase_required: 'APPROVE_BUFFER_SOCIAL_DRAFT',
    approval_phrase_present: approvalPhrase === 'APPROVE_BUFFER_SOCIAL_DRAFT',
    approval_required_before_buffer: true,
    preview_only_action: true,
    buffer_draft_write_performed: false,
    buffer_social_write_performed: false,
    buffer_media_upload_performed: false,
    publish_performed: false,
    external_write_performed: false,
    local_write_performed: false,
    live_send_performed: false,
    no_send: true,
  };
}

async function insertOneTimeVideoLibraryItem(inputs = {}, context = {}) {
  const preview = oneTimeVideoLibraryPreview(inputs);
  const project = (await context.db.query(
    'SELECT id, project_key, name FROM bna_projects WHERE project_key = $1 LIMIT 1',
    [ONE_TIME_PROJECT_KEY]
  )).rows[0];
  if (!project) throw new Error('One Time Mishnah Class project is not seeded');
  const outputs = oneTimeVideoLibraryOutputPlans(inputs, preview.title);
  const parseJson = {
    ...preview.job.parse_json,
    draft_states: outputs.reduce((states, output) => {
      states[output.output_type] = output.status;
      return states;
    }, {}),
    created_by_action: 'create_one_time_video_library_item',
  };
  const job = (await context.db.query(
    `INSERT INTO bna_content_jobs (
       project_id, title, source_type, source_message_id, source_chat_id, local_path, media_url,
       drive_file_id, drive_folder_id, drive_stage, mime_type, caption, status,
       transcript_text, transcript_json, parse_json, notes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17)
     RETURNING *`,
    [
      project.id,
      preview.title,
      preview.job.source_type,
      inputs.source_message_id || inputs.sourceMessageId || null,
      inputs.source_chat_id || inputs.sourceChatId || null,
      inputs.local_path || inputs.localPath || null,
      preview.job.media_url,
      preview.job.drive_file_id,
      preview.job.drive_folder_id,
      preview.job.drive_stage,
      preview.job.mime_type,
      preview.job.caption,
      preview.job.status,
      inputs.transcript_text || inputs.transcriptText || null,
      inputs.transcript_json || inputs.transcriptJson ? JSON.stringify(inputs.transcript_json || inputs.transcriptJson) : null,
      JSON.stringify(parseJson),
      preview.job.notes,
    ]
  )).rows[0];
  const createdOutputs = [];
  for (const output of outputs) {
    const created = (await context.db.query(
      `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING *`,
      [
        job.id,
        output.output_type,
        output.title,
        output.body,
        output.platform,
        output.status,
        JSON.stringify(output.metadata),
      ]
    )).rows[0];
    createdOutputs.push(created);
  }
  return {
    ...preview,
    library_item_created: true,
    content_job_created: true,
    local_write_performed: true,
    job,
    outputs: createdOutputs,
    content_job_id: job.id,
    output_ids: createdOutputs.map((output) => output.id).filter(Boolean),
  };
}

async function createOneTimeVideoLibraryItem(inputs = {}, context = {}) {
  const preview = oneTimeVideoLibraryPreview(inputs);
  if (context.dryRun || !context.db) return preview;
  if (typeof context.db.connect === 'function') {
    const client = await context.db.connect();
    try {
      await client.query('BEGIN');
      const result = await insertOneTimeVideoLibraryItem(inputs, { ...context, db: client });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  return insertOneTimeVideoLibraryItem(inputs, context);
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

function dateOnlyFromInput(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (match) return match[1];
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function addDaysToDateOnly(dateOnly, days) {
  if (!dateOnly) return '';
  const date = new Date(`${dateOnly}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function launchCalendarItem({ week, type, title, date, time, visibility, description }) {
  return {
    week,
    type,
    title,
    date: date || null,
    start_at: date && time ? `${date}T${time}:00` : null,
    visibility,
    description,
    internal_calendar_write_performed: false,
    google_calendar_write_performed: false,
  };
}

function calendarBatchLaunchPlanPreview(inputs = {}, context = {}) {
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.RABBI_SHELLER_PROVIDER);
  const program = compactText(inputs.program || inputs.title || 'One Time Mishnayos launch', 180);
  const requestedWeeks = Number(inputs.weeks || 8);
  const weeks = Math.max(1, Math.min(Number.isFinite(requestedWeeks) ? requestedWeeks : 8, 12));
  const startDate = dateOnlyFromInput(inputs.start_date || inputs.startDate || inputs.start_at || inputs.startAt || inputs.start);
  const classTime = compactText(inputs.class_time || inputs.classTime || '19:00', 20);
  const timezone = compactText(inputs.timezone || 'Asia/Jerusalem', 80);
  const blockers = [];
  if (!startDate) blockers.push('Choose a start_date before turning this preview into internal or Google Calendar events.');
  if (workspaceKey !== WORKSPACES.RABBI_SHELLER_PROVIDER) {
    blockers.push('Confirm this launch calendar belongs outside the Rabbi Scheller provider workspace before writing events.');
  }

  const items = [];
  if (startDate) {
    items.push(launchCalendarItem({
      week: 0,
      type: 'launch_kickoff',
      title: `${program}: launch kickoff and owner checklist`,
      date: startDate,
      time: classTime,
      visibility: 'provider',
      description: 'Review offer, access, billing, content, support, and communication blockers before public launch.',
    }));
    for (let index = 0; index < weeks; index += 1) {
      const week = index + 1;
      const classDate = addDaysToDateOnly(startDate, index * 7);
      items.push(launchCalendarItem({
        week,
        type: 'source_sheet_prep',
        title: `Week ${week}: source sheet and worksheet prep`,
        date: addDaysToDateOnly(classDate, -2),
        time: '10:00',
        visibility: 'internal',
        description: 'Prepare reviewed source sheet, worksheet, and class materials. Keep drafts private until Rabbi/Shloimie approval.',
      }));
      items.push(launchCalendarItem({
        week,
        type: 'live_mishnah_class',
        title: `Week ${week}: live Mishnayos class`,
        date: classDate,
        time: classTime,
        visibility: 'provider',
        description: 'Provider-scoped class session. No BNA school accountability, parent, or student private data is included.',
      }));
      items.push(launchCalendarItem({
        week,
        type: 'content_review',
        title: `Week ${week}: recording, transcript, and member update review`,
        date: addDaysToDateOnly(classDate, 1),
        time: '10:00',
        visibility: 'internal',
        description: 'Review recording/transcript/library card and draft member/social/newsletter updates without sending or publishing.',
      }));
    }
    items.push(launchCalendarItem({
      week: weeks + 1,
      type: 'launch_retrospective',
      title: `${program}: launch retrospective and next-cycle decision`,
      date: addDaysToDateOnly(startDate, weeks * 7 + 1),
      time: '10:00',
      visibility: 'internal',
      description: 'Review attendance, questions, content readiness, support tickets, and billing/access blockers before the next cycle.',
    }));
  }

  return {
    calendar_batch_preview_created: true,
    events_created: false,
    internal_calendar_write_performed: false,
    google_calendar_write_performed: false,
    external_write_performed: false,
    no_send: true,
    workspace_key: workspaceKey,
    program,
    start_date: startDate || null,
    weeks,
    timezone,
    class_time: classTime,
    item_count: items.length,
    items,
    blockers,
    approval_required_before_write: true,
    next_confirmation: 'After review, create internal provider-calendar events first; Google Calendar sync remains separate and requires OAuth scope approval plus explicit external-write confirmation.',
  };
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

function googleClassroomConnectorReady(context = {}) {
  return Boolean(
    context.connectors?.google_classroom?.configured
    || context.connectors?.google_classroom?.test_mode
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

function classroomTopicMaterialPreview(inputs = {}, context = {}) {
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.BNA);
  const connectorReady = googleClassroomConnectorReady(context);
  const courseId = compactText(inputs.course_id || inputs.courseId || '', 120);
  const courseName = compactText(inputs.course_name || inputs.courseName || inputs.class_name || inputs.className || '', 180);
  const topicId = compactText(inputs.topic_id || inputs.topicId || '', 120);
  const topicName = compactText(inputs.topic_name || inputs.topic || inputs.unit || '', 120);
  const requestedTitle = compactText(inputs.material_title || inputs.title || inputs.name || inputs.file_name || '', 180);
  const materialUrl = compactText(inputs.material_url || inputs.url || inputs.link || inputs.source_url || '', 400);
  const materialTitle = requestedTitle || (materialUrl ? 'Linked Classroom material' : 'Class material draft');
  const description = summarizeBody(inputs.description || inputs.notes || inputs.body || '', 700);
  const sourceType = compactText(inputs.source_type || inputs.sourceType || (materialUrl ? 'link' : 'manual'), 80);
  const blockers = [];
  if (!courseId && !courseName) blockers.push('Choose a Classroom course before a live topic/material write.');
  if (!topicId && !topicName) blockers.push('Choose or create a Classroom topic before a live material write.');
  if (!requestedTitle && !materialUrl) blockers.push('Add a material_title or material_url before a live Classroom material write.');
  if (!connectorReady) blockers.push('Google Classroom OAuth is not connected for this workspace.');

  return {
    classroom_topic_material_preview_created: true,
    executed: false,
    connector: 'google_classroom',
    connector_ready: connectorReady,
    workspace_key: workspaceKey,
    classroom_read_performed: false,
    classroom_write_performed: false,
    google_classroom_write_performed: false,
    internal_write_performed: false,
    external_write_performed: false,
    live_google_api_used: false,
    no_send: true,
    dry_run_only: true,
    course_id: courseId || null,
    course_name: courseName || null,
    topic_id: topicId || null,
    topic_name: topicName || null,
    material_title: materialTitle,
    material_url: materialUrl || null,
    source_type: sourceType,
    description_preview: description || null,
    planned_classroom_action: topicId || topicName
      ? 'courseWorkMaterials.create under selected topic'
      : 'topic lookup/create policy review before material create',
    topic_lookup_policy: topicId
      ? 'Use the supplied topic_id after confirmation.'
      : 'Match an existing topic by name, or create a new topic only after explicit topic-create approval.',
    planned_payload_fields: ['courseId', 'topicId', 'title', 'materials', 'description', 'state'],
    planned_classroom_payload: {
      courseId: courseId || '[selected course]',
      topicId: topicId || '[matched or approved topic]',
      title: materialTitle,
      materials: materialUrl ? [{ link: { url: materialUrl } }] : [],
      description: description || null,
      state: 'DRAFT_OR_PUBLISHED_AFTER_HUMAN_CONFIRMATION',
    },
    required_external_inputs: ['connected Google account', 'Classroom course', 'topic id or approved topic create policy', 'reviewed material source'],
    blockers,
    approval_required_before_external_write: true,
    next_confirmation: 'After review, connect Google Classroom test-user OAuth and explicitly confirm the topic/material write before any external Classroom API call.',
  };
}

function normalizeBooleanInput(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const text = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'enabled', 'on'].includes(text)) return true;
  if (['false', '0', 'no', 'n', 'disabled', 'off'].includes(text)) return false;
  return fallback;
}

function normalizeClassCount(value) {
  const number = Number(String(value || '').match(/\d+/)?.[0] || 0);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.max(1, Math.min(number, 52));
}

async function createProviderClassroomDraft(inputs = {}, context = {}) {
  const rawPrompt = compactText(inputs.raw_prompt || inputs.prompt || inputs.notes || inputs.description || '', 2000);
  const title = compactText(inputs.title || titleFromBody(rawPrompt, 'Provider classroom setup draft'), 180);
  if (!title) throw new Error('title is required');
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.RABBI_SHELLER_PROVIDER);
  const classCount = normalizeClassCount(inputs.class_count || inputs.classCount || inputs.classes || rawPrompt);
  const communityDialogueStyle = compactText(
    inputs.community_dialogue_style || inputs.dialogue_style || inputs.community_style || 'Rabbi/teacher-led Q&A with private student replies',
    240
  );
  const studentAccess = compactText(
    inputs.student_access || inputs.access_model || 'Provider-managed member/student access; BNA admin review before grants',
    240
  );
  const displayRules = compactText(
    inputs.display_rules || inputs.display_policy || 'Teacher-approved posts and responses only; internal classroom first',
    280
  );
  const messagePermissions = compactText(
    inputs.message_permissions || inputs.permissions || 'Students may reply privately to the teacher; no student-to-student chat unless explicitly enabled',
    300
  );
  const plan = {
    title,
    workspace_key: workspaceKey,
    provider_id: inputs.provider_id || inputs.providerId || null,
    provider_name: compactText(inputs.provider_name || inputs.providerName || '', 180) || null,
    status: 'draft',
    class_count: classCount,
    community_dialogue_style: communityDialogueStyle,
    student_access: studentAccess,
    display_rules: displayRules,
    message_permissions: messagePermissions,
    student_to_teacher_replies: normalizeBooleanInput(inputs.student_to_teacher_replies, true),
    student_to_student_chat_enabled: normalizeBooleanInput(inputs.student_to_student_chat_enabled, false),
    teacher_moderation_required: normalizeBooleanInput(inputs.teacher_moderation_required, true),
    public_display_enabled: normalizeBooleanInput(inputs.public_display_enabled, false),
  };
  const setupQuestions = [
    classCount ? null : 'How many classes or weeks should this classroom start with?',
    inputs.community_dialogue_style || inputs.dialogue_style ? null : 'Should the dialogue style be Rabbi Q&A, assignment replies, discussion prompts, or announcements only?',
    inputs.student_access ? null : 'Who should receive student/member access in the first draft?',
    inputs.display_rules ? null : 'Which parts may appear on the public/community display after teacher approval?',
    inputs.message_permissions ? null : 'Should any student-to-student chat ever be allowed, or only private replies to the teacher?',
  ].filter(Boolean);
  const preview = {
    provider_classroom_draft_created: false,
    executed: false,
    draft_record_type: 'bna_tasks',
    no_google_classroom_write_performed: true,
    external_write_performed: false,
    live_send_performed: false,
    no_payment_or_access_grant_performed: true,
    setup_plan: plan,
    setup_questions: setupQuestions,
    next_step: setupQuestions.length
      ? 'Ask the provider the remaining setup questions, then save the draft for BNA review.'
      : 'Review the provider classroom draft and create class/session/content records when approved.',
  };
  if (context.dryRun) return preview;

  const notes = [
    rawPrompt ? `Raw prompt: ${rawPrompt}` : '',
    `Class count: ${classCount || 'needs provider answer'}`,
    `Dialogue style: ${communityDialogueStyle}`,
    `Student access: ${studentAccess}`,
    `Display rules: ${displayRules}`,
    `Message permissions: ${messagePermissions}`,
    `Student-to-teacher replies: ${plan.student_to_teacher_replies ? 'enabled' : 'disabled'}`,
    `Student-to-student chat: ${plan.student_to_student_chat_enabled ? 'enabled' : 'disabled'}`,
    `Teacher moderation required: ${plan.teacher_moderation_required ? 'yes' : 'no'}`,
    `Public display: ${plan.public_display_enabled ? 'teacher-approved public/community display allowed' : 'off until approved'}`,
    setupQuestions.length ? `Open setup questions:\n- ${setupQuestions.join('\n- ')}` : '',
  ].filter(Boolean).join('\n');

  const taskInputs = {
    title,
    raw_text: rawPrompt || title,
    notes,
    summary: `Provider classroom/community setup draft for ${plan.provider_name || workspaceKey}.`,
    stage: 'assigned',
    category: 'community_setup',
    urgency: 'this_week',
    assigned_to: 'Shloimie',
    project_key: workspaceKey === WORKSPACES.RABBI_SHELLER_PROVIDER ? ONE_TIME_PROJECT_KEY : workspaceKey,
    source: context.source || 'telegram',
    created_by: context.actor?.user_id || 'action_registry',
    task_kind: 'provider_classroom_draft',
    ai_parsed: {
      parser: 'action-registry',
      action_id: 'create_provider_classroom_draft',
      provider_id: plan.provider_id,
      workspace_key: workspaceKey,
      setup_plan: plan,
      setup_questions: setupQuestions,
      no_external_write: true,
    },
  };
  let task = null;
  if (context.helpers?.createTaskFromText) {
    task = await context.helpers.createTaskFromText(taskInputs);
  } else if (context.db) {
    const result = await context.db.query(
      `INSERT INTO bna_tasks (
         title, notes, summary, stage, category, urgency, source,
         created_by, assigned_to, task_kind, ai_parsed
       ) VALUES (
         $1, $2, $3, 'assigned', 'community_setup', 'this_week', $4,
         $5, 'Shloimie', 'provider_classroom_draft', $6::jsonb
       )
       RETURNING *`,
      [
        title,
        notes,
        taskInputs.summary,
        normalizeTaskSource(context.source || inputs.source || 'telegram'),
        context.actor?.user_id || 'action_registry',
        JSON.stringify(taskInputs.ai_parsed),
      ]
    );
    task = result.rows[0] || null;
  }
  return {
    ...preview,
    provider_classroom_draft_created: Boolean(task),
    executed: Boolean(task),
    task_id: task?.id || null,
    task,
  };
}

async function createTicket(inputs = {}, context = {}) {
  const description = String(inputs.message || inputs.description || inputs.body || '').trim();
  if (!description) throw new Error('message is required');
  const title = compactText(inputs.title || titleFromBody(description, 'Support ticket'), 220);
  const problemResolution = planProblemResolution({
    message: description,
    actor: context.actor || {},
    channel: context.source || inputs.channel || 'website_assistant',
    context: {
      ...(inputs.source_context || inputs.sourceContext || {}),
      title,
      route: inputs.route || inputs.page_url || inputs.url || null,
      object_type: inputs.related_type || inputs.relatedType || null,
      object_id: inputs.related_id || inputs.relatedId || null,
      device: inputs.device_context || inputs.deviceContext || null,
      viewport: inputs.viewport || null,
      workspace_key: inputs.workspace_key || inputs.workspaceKey || context.actor?.workspace_key || context.actor?.workspace_id,
      project_key: inputs.project_key || inputs.projectKey || context.actor?.project_key,
      child_id: inputs.child_id || inputs.student_id || inputs.studentId || null,
      provider_id: inputs.provider_id || inputs.providerId || null,
    },
    files: inputs.files || inputs.attachments || [],
    existing_tickets: inputs.existing_tickets || inputs.existingTickets || [],
  });
  const severity = normalizeSeverity(inputs.severity || problemResolution.classification.severity);
  const category = normalizeTicketCategory(inputs.category || problemResolution.classification.category || inputs.route);
  const preview = {
    requirement_id: problemResolution.requirement_id,
    ticket_created: false,
    title,
    category,
    severity,
    route: inputs.route || null,
    related_type: inputs.related_type || null,
    related_id: inputs.related_id || null,
    source: normalizeTicketSource(context.source || inputs.source),
    no_codex_task_created: true,
    agent_work_handoff_required: Boolean(problemResolution.agent_work_package),
    problem_resolution: problemResolution,
  };
  if (context.dryRun || !context.db) return preview;
  const sourceContext = {
    action_registry: true,
    route: inputs.route || null,
    related_type: inputs.related_type || null,
    related_id: inputs.related_id || null,
    problem_resolution: {
      requirement_id: problemResolution.requirement_id,
      dedupe_key: problemResolution.dedupe_key,
      classification: problemResolution.classification,
      agent_work_required: Boolean(problemResolution.agent_work_package),
      private_reply_required: problemResolution.classification.private_reply_required,
    },
  };
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
      JSON.stringify(sourceContext),
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

function normalizePhoneDigits(value = '') {
  return String(value || '').replace(/[^0-9]/g, '');
}

function phoneTokenVariants(value = '') {
  const digits = normalizePhoneDigits(value);
  if (!digits || digits.length < 7) return [];
  const variants = new Set([digits]);
  if (digits.startsWith('00') && digits.length > 9) variants.add(digits.slice(2));
  if (digits.startsWith('972') && digits.length >= 11) variants.add(`0${digits.slice(3)}`);
  if (digits.startsWith('0') && digits.length >= 9) variants.add(`972${digits.slice(1)}`);
  return [...variants].filter((token) => token.length >= 7);
}

function phoneTokensFromValues(values = []) {
  return [...new Set((values || []).flatMap((value) => phoneTokenVariants(value)))];
}

function emailTokensFromValues(values = []) {
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const tokens = [];
  (values || []).forEach((value) => {
    const matches = String(value || '').match(emailPattern) || [];
    matches.forEach((match) => tokens.push(match.trim().toLowerCase()));
  });
  return [...new Set(tokens)];
}

function communicationPhoneTokens(row = {}) {
  const sourceContext = parseJsonObject(row.source_context);
  const metadata = parseJsonObject(row.metadata);
  return phoneTokensFromValues([
    sourceContext.from_number,
    sourceContext.to_number,
    sourceContext.phone,
    sourceContext.recipient,
    sourceContext.chat_id,
    sourceContext.wapi_chat_id,
    sourceContext.matched_phone,
    metadata.from_number,
    metadata.to_number,
    metadata.phone,
    row.contact_phone,
  ]);
}

function communicationEmailTokens(row = {}) {
  const sourceContext = parseJsonObject(row.source_context);
  const metadata = parseJsonObject(row.metadata);
  return emailTokensFromValues([
    sourceContext.from_address,
    sourceContext.to_address,
    sourceContext.email,
    sourceContext.parent_email,
    sourceContext.matched_email,
    metadata.from_address,
    metadata.to_address,
    metadata.email,
    metadata.parent_email,
    row.contact_email,
    row.email,
  ]);
}

function tokensIntersect(left = [], right = []) {
  if (!left.length || !right.length) return false;
  const rightSet = new Set(right);
  return left.some((token) => rightSet.has(token));
}

function normalizedContactHistoryName(value = '') {
  return compactText(value, 160).toLowerCase();
}

function contactHistoryRowNameText(row = {}) {
  return [
    row.lead_parent_name,
    row.signup_parent_name,
    row.signup_student_name,
    row.student_name,
    row.summary,
  ].map(normalizedContactHistoryName).filter(Boolean).join(' ');
}

function contactHistoryMatches(row = {}, query = {}) {
  const reasons = [];
  if (query.lead_id && Number(row.lead_id) === Number(query.lead_id)) reasons.push('lead_id');
  if (query.signup_id && Number(row.signup_id) === Number(query.signup_id)) reasons.push('signup_id');
  if (query.student_id && Number(row.student_id) === Number(query.student_id)) reasons.push('student_id');
  if (tokensIntersect(query.phone_tokens, communicationPhoneTokens(row))) reasons.push('normalized_phone_or_wapi_source_context');
  if (tokensIntersect(query.email_tokens, communicationEmailTokens(row))) reasons.push('email_or_source_address');
  if (query.contact_name) {
    const rowNames = contactHistoryRowNameText(row);
    if (rowNames && rowNames.includes(query.contact_name)) reasons.push('name_or_summary');
  }
  return reasons;
}

function summarizeCommunicationHistoryRow(row = {}, reasons = []) {
  return {
    id: row.id,
    contact_type: row.contact_type || 'general',
    lead_id: row.lead_id || null,
    signup_id: row.signup_id || null,
    student_id: row.student_id || null,
    channel: row.channel || 'internal_note',
    direction: row.direction || 'internal_note',
    summary: compactText(row.summary || 'Communication', 220),
    body_preview: compactText(row.body || '', 280),
    occurred_at: row.occurred_at || row.created_at || null,
    source: row.source || null,
    follow_up_required: Boolean(row.follow_up_required),
    display_name: row.lead_parent_name || row.signup_parent_name || row.signup_student_name || row.student_name || null,
    match_reasons: reasons,
  };
}

async function showContactCommunicationHistory(inputs = {}, context = {}) {
  const limit = Math.max(1, Math.min(Number(inputs.limit || 8), 25));
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.BNA);
  const query = {
    lead_id: inputs.lead_id || inputs.leadId || null,
    signup_id: inputs.signup_id || inputs.signupId || null,
    student_id: inputs.student_id || inputs.studentId || null,
    phone_tokens: phoneTokensFromValues([inputs.phone, inputs.parent_phone, inputs.whatsapp_phone, inputs.phone_number]),
    email_tokens: emailTokensFromValues([inputs.email, inputs.parent_email, inputs.from_address, inputs.to_address]),
    contact_name: normalizedContactHistoryName(inputs.contact_name || inputs.name || inputs.parent_name || inputs.lead_name),
  };
  const blockers = [];
  if (!query.lead_id && !query.signup_id && !query.student_id && !query.phone_tokens.length && !query.email_tokens.length && !query.contact_name) {
    blockers.push('Provide a lead_id, signup_id, student_id, phone, email, or contact_name to preview communication history.');
  }
  if (!context.db) blockers.push('Database context is required for local communication history readback.');

  const base = {
    contact_history_preview_created: true,
    action_id: 'show_contact_communication_history',
    workspace_key: workspaceKey,
    query: {
      lead_id: query.lead_id,
      signup_id: query.signup_id,
      student_id: query.student_id,
      phone_token_count: query.phone_tokens.length,
      email_token_count: query.email_tokens.length,
      contact_name: query.contact_name || null,
      limit,
    },
    match_strategy: ['lead/signup/student id', 'normalized phone variants', 'email/source address', 'WAPI source context', 'name/summary fallback'],
    communications: [],
    summary: {
      total_matches: 0,
      whatsapp: 0,
      email: 0,
      internal_note: 0,
      follow_up_required: 0,
    },
    blockers,
    no_send: true,
    local_write_performed: false,
    external_write_performed: false,
    whatsapp_send_performed: false,
    broadcast_created: false,
    contact_tag_write_performed: false,
    google_drive_write_performed: false,
    buffer_social_write_performed: false,
    preview_only_action: true,
  };
  if (blockers.length) return base;

  const params = [];
  const conditions = [];
  if (workspaceKey !== WORKSPACES.PLATFORM) {
    const projectKey = workspaceKey === WORKSPACES.RABBI_SHELLER_PROVIDER ? ONE_TIME_PROJECT_KEY : workspaceKey;
    params.push(projectKey);
    conditions.push(`COALESCE(c.project_id, l.project_id, s.project_id, st.project_id, (SELECT id FROM bna_projects WHERE project_key = $1 LIMIT 1)) = (SELECT id FROM bna_projects WHERE project_key = $1 LIMIT 1)`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = (await context.db.query(
    `SELECT c.id, c.contact_type, c.lead_id, c.signup_id, c.student_id,
            c.channel, c.direction, c.summary, c.body, c.follow_up_required,
            c.occurred_at, c.created_at, c.source, c.source_context, c.metadata,
            l.parent_name AS lead_parent_name,
            s.parent_name AS signup_parent_name,
            s.student_name AS signup_student_name,
            st.name AS student_name
     FROM bna_contact_communications c
     LEFT JOIN bna_parent_leads l ON l.id = c.lead_id
     LEFT JOIN signups s ON s.id = c.signup_id
     LEFT JOIN bna_students st ON st.id = c.student_id
     ${whereClause}
     ORDER BY c.occurred_at DESC NULLS LAST, c.created_at DESC NULLS LAST, c.id DESC
     LIMIT 300`,
    params,
  )).rows || [];
  const matches = rows
    .map((row) => ({ row, reasons: contactHistoryMatches(row, query) }))
    .filter((item) => item.reasons.length)
    .slice(0, limit)
    .map((item) => summarizeCommunicationHistoryRow(item.row, item.reasons));

  return {
    ...base,
    communications: matches,
    summary: {
      total_matches: matches.length,
      whatsapp: matches.filter((item) => String(item.channel || '').toLowerCase() === 'whatsapp').length,
      email: matches.filter((item) => String(item.channel || '').toLowerCase() === 'email').length,
      internal_note: matches.filter((item) => /internal/.test(String(item.channel || item.direction || '').toLowerCase())).length,
      follow_up_required: matches.filter((item) => item.follow_up_required).length,
    },
    blockers: matches.length ? [] : ['No local communication history matched the supplied contact clue.'],
  };
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

function extractGoogleBusinessUrl(...values) {
  const joined = values.map((value) => String(value || '')).join(' ');
  const urls = joined.match(/https?:\/\/[^\s<>"')]+/gi) || [];
  return urls.find((url) => /google|maps\.app\.goo\.gl|g\.page|goo\.gl\/maps/i.test(url)) || '';
}

function googleBusinessConnectorReady(context = {}) {
  return Boolean(
    context.connectors?.google_business_profile?.configured
    || context.connectors?.google_business_profile?.test_mode
    || context.connectors?.google_oauth?.configured
    || context.connectors?.google_oauth?.test_mode
  );
}

function googleBusinessPlaceIdLookupPreview(inputs = {}, context = {}) {
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.BNA);
  const rawQuery = compactText(inputs.query || inputs.search_query || inputs.provider_name || inputs.notes || '', 300);
  const rawGoogleUrl = inputs.google_business_profile_url
    || inputs.googleBusinessProfileUrl
    || inputs.google_maps_url
    || inputs.googleMapsUrl
    || inputs.google_url
    || inputs.googleUrl
    || extractGoogleBusinessUrl(rawQuery, inputs.notes)
    || '';
  let googleBusinessProfileUrl = '';
  let urlValidationError = '';
  if (rawGoogleUrl) {
    try {
      googleBusinessProfileUrl = normalizeGoogleBusinessUrl(rawGoogleUrl);
    } catch (error) {
      urlValidationError = error instanceof Error ? error.message : String(error);
    }
  }
  const placeId = compactText(inputs.google_place_id || inputs.googlePlaceId || inputs.place_id || inputs.placeId || extractGooglePlaceId(rawGoogleUrl, rawQuery, inputs.notes), 220);
  const connectorReady = googleBusinessConnectorReady(context);
  const blockers = [];
  if (urlValidationError) blockers.push(urlValidationError);
  if (!placeId) blockers.push('No Place ID was found in the supplied text or URL; live Maps/Places lookup is not approved or wired in this preview.');
  if (!rawGoogleUrl && !rawQuery && !placeId) blockers.push('Provide a Google Maps/Profile URL, Place ID, or provider search query.');
  if (!connectorReady) blockers.push('Google Business Profile OAuth is not connected for this workspace.');

  return {
    google_business_place_id_lookup_preview_created: true,
    executed: false,
    connector: 'google_business_profile',
    connector_ready: connectorReady,
    workspace_key: workspaceKey,
    provider_id: inputs.provider_id || inputs.providerId || null,
    provider_name: compactText(inputs.provider_name || inputs.providerName || '', 180) || null,
    query: rawQuery || null,
    google_business_profile_url: googleBusinessProfileUrl || null,
    google_place_id: placeId || null,
    place_id_found_from_input: Boolean(placeId),
    place_id_needs_live_lookup: !placeId,
    maps_lookup_performed: false,
    google_business_profile_api_used: false,
    live_google_api_used: false,
    external_read_performed: false,
    external_write_performed: false,
    no_send: true,
    dry_run_only: true,
    planned_external_adapter: placeId ? null : 'Google Maps Places lookup after Maps key/API approval and explicit confirmation.',
    required_external_inputs: ['provider opt-in when provider-owned', 'approved Maps/Places or GBP API access', 'reviewed search query or Maps URL'],
    blockers,
    approval_required_before_external_read: true,
    next_confirmation: 'After review, use manual Place ID capture now; live Maps/Google Business lookup remains blocked until API access, provider approval, and explicit external-read confirmation are ready.',
  };
}

function googleBusinessListLocationsPreview(inputs = {}, context = {}) {
  const workspaceKey = normalizeWorkspace(inputs.workspace_key || inputs.workspace || context.actor?.workspace_id || WORKSPACES.BNA);
  const connectorReady = googleBusinessConnectorReady(context);
  const providerName = compactText(inputs.provider_name || inputs.providerName || inputs.name || '', 180);
  const blockers = [];
  if (!connectorReady) blockers.push('Google Business Profile OAuth is not connected for this workspace.');
  if (!inputs.provider_id && !providerName && !inputs.account_id) blockers.push('Choose a provider or Google Business account before a live locations read.');

  return {
    google_business_locations_preview_created: true,
    executed: false,
    connector: 'google_business_profile',
    connector_ready: connectorReady,
    workspace_key: workspaceKey,
    provider_id: inputs.provider_id || inputs.providerId || null,
    provider_name: providerName || null,
    account_id: inputs.account_id || inputs.accountId || null,
    location_id: inputs.location_id || inputs.locationId || null,
    location_name: compactText(inputs.location_name || inputs.locationName || '', 180) || null,
    business_locations_read_performed: false,
    google_business_profile_api_used: false,
    live_google_api_used: false,
    external_read_performed: false,
    external_write_performed: false,
    no_send: true,
    dry_run_only: true,
    planned_google_business_action: 'accounts.locations.list after provider opt-in and business.manage OAuth approval',
    planned_result_fields: ['name', 'title', 'storefrontAddress', 'phoneNumbers', 'websiteUri', 'metadata.placeId'],
    required_external_inputs: ['provider opt-in', 'business.manage OAuth connection', 'Google Business account id', 'explicit external-read confirmation'],
    blockers,
    approval_required_before_external_read: true,
    next_confirmation: 'After provider opt-in and OAuth approval, list locations in a test-user smoke before any profile/review automation is enabled.',
  };
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
    case 'tasks.retitleNaturally':
      return retitleTaskNaturally(inputs, context);
    case 'tasks.addDecisionOption':
      return addDecisionOption(inputs, context);
    case 'tasks.scheduleOnDate':
      return scheduleTaskOnDate(inputs, context);
    case 'tasks.moveWorkspace':
      return moveTaskWorkspace(inputs, context);
    case 'tickets.create':
      return createTicket(inputs, context);
    case 'communications.previewCampaignSegment':
      return previewCampaignSegment({
        actor: context.actor || {},
        channel: context.source || inputs.channel || 'operations_helper',
        ...campaignAudienceInputs(inputs),
      });
    case 'communications.draftEmailCampaign':
      return draftEmailCampaignPreview(inputs, context);
    case 'communications.draftDripSequence':
      return draftDripSequencePreview(inputs, context);
    case 'communications.draftAutomation':
      return draftAutomationPreview(inputs, context);
    case 'reminders.scheduleAssistantReminder':
      return scheduleAssistantReminderPreview(inputs, context);
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
    case 'content.createOneTimeVideoLibraryItem':
      return createOneTimeVideoLibraryItem(inputs, context);
    case 'content.previewOneTimeMemberLibraryPublishPackage':
      return oneTimeMemberLibraryPublishPackagePreview(inputs, context);
    case 'content.createRabbiShiurIdea':
      return createRabbiShiurIdea(inputs, context);
    case 'content.createRabbiSourceSheetTask':
      return createRabbiSourceSheetTask(inputs, context);
    case 'crm.createReferralLedgerEntry':
      return createReferralLedgerEntry(inputs, context);
    case 'content.submitStudentQuestionForModeration':
      return submitStudentQuestionForModeration(inputs, context);
    case 'content.reviewModeratedQuestion':
      return reviewModeratedQuestion(inputs, context);
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
    case 'calendar.batchLaunchPlanPreview':
      return calendarBatchLaunchPlanPreview(inputs, context);
    case 'calendar.syncGoogleClassroom':
      return connectorGuardedResult('google_classroom', inputs, context);
    case 'classroom.topicMaterialPreview':
      return classroomTopicMaterialPreview(inputs, context);
    case 'provider.createClassroomDraft':
      return createProviderClassroomDraft(inputs, context);
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
    case 'social.previewSchedulePackage':
      return socialSchedulePreview(inputs, context);
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
        problem_resolution: planProblemResolution({
          message: inputs.message || inputs.body || inputs.description || 'Problem report',
          actor: context.actor || {},
          channel: context.source || inputs.channel || 'website_assistant',
          context: {
            route: inputs.route || null,
            viewport: inputs.viewport || null,
            selected_area: inputs.selected_area || inputs.selectedArea || null,
            child_id: inputs.student_id || inputs.studentId || null,
            workspace_key: context.actor?.workspace_key || context.actor?.workspace_id || 'bna',
          },
          files: inputs.files || inputs.attachments || [],
          existing_tickets: inputs.existing_tickets || inputs.existingTickets || [],
        }),
        note: 'Parent/student reports create review tickets for Shloimie/admin. They do not create Codex code tasks automatically.',
      };
    case 'provider.createQuestionPost':
      return { provider_scope: true, post_created: !context.dryRun, body: inputs.body || '', note: 'Provider participant data stays separate from BNA school accountability.' };
    case 'community.postMessage':
      return postCommunityMessage(inputs, context);
    case 'provider.requestContact':
      return requestProviderContact(inputs, context);
    case 'communications.showContactHistory':
      return showContactCommunicationHistory(inputs, context);
    case 'provider.updateProfile':
      return { provider_scope: true, approved_write_required: true, provider_id: inputs.provider_id || null };
    case 'provider.captureGoogleBusinessLink':
      return captureProviderGoogleBusinessLink(inputs, context);
    case 'googleBusiness.placeIdLookupPreview':
      return googleBusinessPlaceIdLookupPreview(inputs, context);
    case 'googleBusiness.listLocationsPreview':
      return googleBusinessListLocationsPreview(inputs, context);
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
