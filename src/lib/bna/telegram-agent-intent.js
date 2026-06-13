function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

const {
  hasContactLeadPipelineBuildIntent,
  hasInterestedParentLeadCaptureIntent,
} = require('./telegram-contact-lead-capture');
const {
  hasDirectReplyInsteadOfCodexIntent,
} = require('./telegram-direct-reply-guard');

function normalizeText(value) {
  return compactText(value).toLowerCase();
}

function includesAny(normalized, patterns) {
  return patterns.some((pattern) => pattern.test(normalized));
}

const CONTENT_OBJECTS = [
  ['newsletter', /\b(newsletter|weekly update|parent update|end[-\s]?of[-\s]?week update)\b/],
  ['whatsapp', /\b(whatsapp|what'?s\s*app|wa update)\b/],
  ['facebook', /\b(facebook|fb)\b/],
  ['blog', /\b(blog|article|website post|website draft)\b/],
  ['caption', /\b(caption|copy|post copy|copy block)\b/],
  ['transcript', /\b(transcripts?|recordings?|audios?|videos?|content jobs?)\b/],
];

function mentionedObjects(text) {
  const normalized = normalizeText(text);
  return CONTENT_OBJECTS
    .filter(([, pattern]) => pattern.test(normalized))
    .map(([name]) => name);
}

function hasExplicitContentCreate(normalized) {
  return includesAny(normalized, [
    /\b(make|create|generate|draft|write|compose|prepare)\b.{0,80}\b(newsletter|weekly update|parent update|whatsapp|facebook|fb|blog|article|caption|post copy|copy block)\b/,
    /\b(newsletter|weekly update|parent update|whatsapp|facebook|fb|blog|article|caption|post copy|copy block)\b.{0,60}\b(draft|copy|post|version)\b/,
    /\bmake this into\b.{0,80}\b(newsletter|weekly update|parent update|whatsapp|facebook|fb|blog|article|caption|post)\b/,
  ]);
}

function hasDirectContentCreateRequest(normalized) {
  return includesAny(normalized, [
    /^(please\s+)?(make|create|generate|draft|write|compose|prepare)\b.{0,80}\b(newsletter|weekly update|parent update|whatsapp|facebook|fb|blog|article|caption|post copy|copy block)\b/,
    /\b(please|can you|could you|would you|i need you to|i want you to)\b.{0,80}\b(make|create|generate|draft|write|compose|prepare)\b.{0,80}\b(newsletter|weekly update|parent update|whatsapp|facebook|fb|blog|article|caption|post copy|copy block)\b/,
    /\bmake this into\b.{0,80}\b(newsletter|weekly update|parent update|whatsapp|facebook|fb|blog|article|caption|post)\b/,
  ]);
}

function hasExplicitContentEdit(normalized) {
  return includesAny(normalized, [
    /\b(edit|revise|rewrite|change|fix|shorten|tighten|clean up|adjust|polish|redo|regenerate)\b.{0,80}\b(output|draft|newsletter|weekly update|whatsapp|facebook|fb|blog|caption|post)\b/,
    /\b(content\s*)?(output|draft)\s*#?\s*\d+\b/,
    /\b(no|instead|change it|make it|fix it)\b.{0,80}\b(first section|next section|bullet|date on top|caption|copy block|newsletter|whatsapp|facebook|blog)\b/,
  ]);
}

function hasContentDiscussionMarkers(normalized) {
  return includesAny(normalized, [
    /\b(talking about|talk about|discuss|discussion|workflow|system|tool|tools|agent|bot|bridge|routing|parser|parsing|parsing mechanism|content section|backend|technical|prompt|prompts|natural language|recognize|understand|confused|confusing|mistake|wrong|bug|issue|audit|why did|why would|when i say|when i'm talking about something else)\b/,
    /\b(different way|different framework|setup|architecture|instead of|keeps? getting confused)\b/,
  ]);
}

function hasPromptPlanningIntent(normalized) {
  return includesAny(normalized, [
    /\b(prompt|brief)\b.{0,60}\b(codex|chatgpt|chat gpt|planning mode|refine|refining|draft)\b/,
    /\b(codex|chatgpt|chat gpt)\b.{0,60}\b(prompt|brief|planning mode|refine|refining)\b/,
  ]);
}

function hasCodexWorkIntent(normalized) {
  const target = /\b(codex|repo|code|files?|server|database|schema|migration|railway|deploy|bridge|telegram bot|parser|parsing|routing|dashboard|playwright|browser|test|smoke)\b/.test(normalized);
  const action = /\b(build|fix|implement|wire|change|update|remove|add|test|verify|smoke|deploy|inspect|audit|run|check|queue|requeue)\b/.test(normalized);
  return target && action;
}

function hasBrowserTestIntent(normalized) {
  return includesAny(normalized, [
    /\b(test|verify|smoke|check)\b.{0,80}\b(playwright|browser|chrome|page|ui|signup|website|app|rabbi bot|bot)\b/,
    /\b(anytime i tell you to test|testing.*playwright|use playwright)\b/,
  ]);
}

function hasGhlIntent(normalized) {
  return /\b(ghl|go high level|highlevel|leadconnector|crm|pipeline|contact|opportunity)\b/.test(normalized);
}

function hasBufferIntent(normalized) {
  return /\b(buffer|social scheduler|social channels?|social drafts?)\b/.test(normalized);
}

function hasExternalSendOrPublish(normalized) {
  return includesAny(normalized, [
    /\b(publish now|post now|post it|publish it|make it live|go live|publicly publish)\b/,
    /\b(send|email|text|sms|message)\b.{0,80}\b(parents?|families|people|contacts?|leads?|students?|everyone|whatsapp|email|sms|telegram)\b/,
    /\b(send this|send it|email this|text this)\b/,
  ]);
}

function hasDirectExternalSendOrPublish(normalized) {
  return includesAny(normalized, [
    /\b(publish now|post now|post it|publish it|make it live|go live|publicly publish)\b/,
    /^(please\s+)?(send|email|text|sms|message|publish|post)\b.{0,100}\b(parents?|families|people|contacts?|leads?|students?|everyone|whatsapp|email|sms|telegram|facebook|fb|youtube)\b/,
    /\b(please|can you|could you|would you|i need you to|i want you to)\b.{0,60}\b(send|email|text|sms|message|publish|post)\b.{0,100}\b(parents?|families|people|contacts?|leads?|students?|everyone|whatsapp|email|sms|telegram|facebook|fb|youtube)\b/,
    /\b(send this|send it|email this|text this)\b/,
  ]);
}

function hasDraftOrInternalPublish(normalized) {
  return includesAny(normalized, [
    /\b(publish draft|post draft|create facebook draft|create buffer draft|create ghl draft|send to buffer|send to ghl|push to buffer|push to ghl|buffer draft|ghl draft)\b/,
  ]);
}

function hasTaskCaptureMarkers(normalized) {
  return includesAny(normalized, [
    /\b(another task|separate task|task for me|task for myself|put (?:that|this|it).{0,50}\btask|put it on my tasks?|create (?:a )?task|file (?:a )?task|mark .* task)\b/,
    /\b(task|tasks)\b.{0,80}\b(need|needs|build|fix|wire|change|update|delete|remove|add|configure|set up|setup|map out|finish)\b/,
  ]);
}

function hasInternalWorkIntent(normalized) {
  const internalObject = /\b(accountability|student login|parent login|student portal|parent portal|portal|login|password|reset password|admin only|psychoanalysis|internal|external|filter|dropdown|drop-down|users?|student|students|parents?|parent chat|chat window|telegram bot|accountability system|tablets?|codex test|test parent|dns|www|certificate|google workspace|workspace|sender display|office p|prompt|prompts|content prompt|content section|daily content|codex|backend|technical|raw clip|thumbnail|first frame|black fade|fade|video edit|comments?|buttons?|queue|requeue|research section|source sheets?|sourcesheets?|sefaria|safari|work cards?|worksheets?|recordings?|class topics?)\b/.test(normalized);
  const workVerb = /\b(need|needs|we need|i need|you need|have to|has to|make|build|add|delete|remove|change|configure|set up|setup|fix|wire|map|filter|upload|parse|update|manage|put|task|tasks|finish|check|queue|requeue|deal with|dealt with|expand|develop)\b/.test(normalized);
  return hasCodexWorkIntent(normalized) || hasTaskCaptureMarkers(normalized) || (internalObject && workVerb);
}

function isConfirmationText(text) {
  return /^(confirm|confirmed|approve|approved|yes[, ]+send|yes[, ]+publish)\b/i.test(compactText(text));
}

function stripConfirmationPrefix(text) {
  return compactText(text).replace(/^(confirm|confirmed|approve|approved)\s*[:,-]?\s*/i, '');
}

function buildAction(kind, subsystem, risk, requiresApproval, reason) {
  return { kind, subsystem, risk, requiresApproval, reason };
}

function planTelegramIntent({ text = '', replyText = '', isCommand = false, scoped = false } = {}) {
  const raw = compactText(text);
  const normalized = normalizeText(raw);
  const combined = normalizeText(`${raw}\n${replyText || ''}`);
  const objects = mentionedObjects(`${raw}\n${replyText || ''}`);
  const proposedActions = [];
  const blockedHandlers = [];
  const allowedHandlers = [];

  if (!raw) {
    return {
      version: 'telegram-agent-intent-v1',
      primaryIntent: 'empty',
      confidence: 1,
      mentionedObjects: [],
      proposedActions: [],
      blockedHandlers: [],
      allowedHandlers: [],
      replyStrategy: 'ignore',
      requiresApproval: false,
    };
  }

  if (isCommand) {
    return {
      version: 'telegram-agent-intent-v1',
      primaryIntent: 'command',
      confidence: 1,
      mentionedObjects: objects,
      proposedActions: [buildAction('run_command_handler', 'telegram', 'normal', false, 'Explicit slash command or mode button')],
      blockedHandlers,
      allowedHandlers: ['commands'],
      replyStrategy: 'execute_command',
      requiresApproval: false,
    };
  }

  let primaryIntent = 'conversation';
  let confidence = 0.72;
  let replyStrategy = 'answer_naturally';

  const externalSendOrPublish = hasExternalSendOrPublish(normalized);
  const directExternalSendOrPublish = hasDirectExternalSendOrPublish(normalized);
  const internalWorkIntent = hasInternalWorkIntent(normalized);
  const contactLeadCaptureIntent = hasInterestedParentLeadCaptureIntent(raw);
  const contactPipelineBuildIntent = hasContactLeadPipelineBuildIntent(raw);

  if (hasDirectReplyInsteadOfCodexIntent(raw)) {
    primaryIntent = 'conversation';
    confidence = 0.96;
    replyStrategy = 'answer_naturally';
    proposedActions.push(buildAction('answer_in_chat', 'conversation', 'read_only', false, 'Operator explicitly rejected Codex/task filing and asked for a direct reply'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'latestVideoEdit', 'publish', 'typedAction', 'taskCapture', 'codex');
  } else if (contactLeadCaptureIntent && contactPipelineBuildIntent) {
    primaryIntent = 'codex_work';
    confidence = 0.9;
    replyStrategy = 'route_to_codex';
    proposedActions.push(buildAction('capture_contact_leads_and_update_contacts_pipeline', 'contacts', 'local_write', false, 'Interested-parent lead update with a Contacts pipeline build request'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'latestVideoEdit', 'publish');
  } else if (contactLeadCaptureIntent) {
    primaryIntent = 'contact_capture';
    confidence = 0.9;
    replyStrategy = 'answer_naturally';
    proposedActions.push(buildAction('capture_contact_leads', 'contacts', 'local_write', false, 'Interested-parent lead update with phone/contact details'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'latestVideoEdit', 'publish');
  } else if (externalSendOrPublish && (!internalWorkIntent || directExternalSendOrPublish)) {
    primaryIntent = 'publish_send';
    confidence = 0.93;
    replyStrategy = isConfirmationText(raw) ? 'execute_confirmed_external_action' : 'ask_for_approval';
    proposedActions.push(buildAction('publish_or_send', 'external', 'external_send', !isConfirmationText(raw), 'Message asks to publish or send to other people'));
    allowedHandlers.push(isConfirmationText(raw) ? 'publish' : 'approval_request');
  } else if (externalSendOrPublish && internalWorkIntent) {
    primaryIntent = 'codex_work';
    confidence = 0.88;
    replyStrategy = 'route_to_codex';
    proposedActions.push(buildAction('queue_codex_work', 'codex', 'local_write', false, 'Internal implementation/task ramble mentions send or publish words incidentally'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'latestVideoEdit', 'publish');
  } else if (hasPromptPlanningIntent(normalized)) {
    primaryIntent = 'planning';
    confidence = 0.9;
    replyStrategy = 'draft_or_refine_prompt_in_chat';
    proposedActions.push(buildAction('draft_prompt', 'conversation', 'local', false, 'Operator is refining a prompt or brief'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyReport', 'latestDriveIngest', 'publish');
  } else if (objects.length && hasContentDiscussionMarkers(normalized) && !hasDirectContentCreateRequest(normalized) && (!hasExplicitContentEdit(combined) || internalWorkIntent)) {
    primaryIntent = internalWorkIntent ? 'codex_work' : 'conversation';
    confidence = 0.9;
    replyStrategy = primaryIntent === 'codex_work' ? 'route_to_codex_or_discuss_fix' : 'answer_naturally';
    proposedActions.push(buildAction('discuss_content_system', 'conversation', 'read_only', false, 'Content words are being discussed, not requested as output'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'publish');
  } else if (hasExplicitContentEdit(combined)) {
    primaryIntent = 'content_edit';
    confidence = 0.86;
    replyStrategy = 'edit_saved_content_or_reply';
    proposedActions.push(buildAction('edit_content_draft', 'content', 'local_write', false, 'Explicit saved draft/content edit intent'));
    allowedHandlers.push('contentApproval', 'contentDraftEdit');
  } else if (hasExplicitContentCreate(combined)) {
    primaryIntent = 'content_generate';
    confidence = 0.84;
    replyStrategy = 'generate_or_queue_content';
    proposedActions.push(buildAction('generate_content_draft', 'content', 'local_write', false, 'Explicit content draft generation request'));
    allowedHandlers.push('weeklyReport', 'latestDriveIngest', 'contentDraftEdit');
  } else if (hasBrowserTestIntent(normalized)) {
    primaryIntent = 'browser_test';
    confidence = 0.86;
    replyStrategy = 'route_to_codex_with_playwright';
    proposedActions.push(buildAction('run_browser_test', 'codex', 'local_tool', false, 'Operator asked to test something browser-verifiable'));
  } else if (hasCodexWorkIntent(normalized)) {
    primaryIntent = 'codex_work';
    confidence = 0.82;
    replyStrategy = 'route_to_codex';
    proposedActions.push(buildAction('queue_codex_work', 'codex', 'local_write', false, 'Implementation or verification request'));
    if (internalWorkIntent || hasTaskCaptureMarkers(normalized)) {
      blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'latestVideoEdit', 'publish');
    }
  } else if (internalWorkIntent) {
    primaryIntent = 'codex_work';
    confidence = 0.82;
    replyStrategy = 'route_to_codex';
    proposedActions.push(buildAction('queue_codex_work', 'codex', 'local_write', false, 'Internal implementation or task-queue request'));
    blockedHandlers.push('contentApproval', 'contentDraftEdit', 'weeklyTranscriptTopic', 'weeklyReport', 'latestDriveIngest', 'latestVideoEdit', 'publish');
  } else if (hasBufferIntent(normalized)) {
    primaryIntent = hasDraftOrInternalPublish(normalized) ? 'buffer_action' : 'buffer_discussion';
    confidence = 0.78;
    replyStrategy = primaryIntent === 'buffer_action' ? 'use_buffer_tool_if_clear' : 'answer_naturally';
    proposedActions.push(buildAction(primaryIntent === 'buffer_action' ? 'buffer_draft_or_lookup' : 'discuss_buffer', 'buffer', primaryIntent === 'buffer_action' ? 'external_write' : 'read_only', false, 'Buffer was referenced'));
  } else if (hasGhlIntent(normalized)) {
    primaryIntent = hasDraftOrInternalPublish(normalized) ? 'ghl_action' : 'ghl_discussion';
    confidence = 0.78;
    replyStrategy = primaryIntent === 'ghl_action' ? 'use_ghl_tool_if_clear' : 'answer_naturally';
    proposedActions.push(buildAction(primaryIntent === 'ghl_action' ? 'ghl_draft_or_lookup' : 'discuss_ghl', 'ghl', primaryIntent === 'ghl_action' ? 'external_write' : 'read_only', false, 'GHL was referenced'));
  }

  return {
    version: 'telegram-agent-intent-v1',
    primaryIntent,
    confidence,
    mentionedObjects: objects,
    proposedActions,
    blockedHandlers,
    allowedHandlers,
    replyStrategy,
    requiresApproval: proposedActions.some((action) => action.requiresApproval),
    scoped: Boolean(scoped),
  };
}

function isHandlerBlocked(intentPlan, handlerName) {
  return Array.isArray(intentPlan?.blockedHandlers) && intentPlan.blockedHandlers.includes(handlerName);
}

function shouldAskForExternalApproval(intentPlan) {
  return intentPlan?.primaryIntent === 'publish_send' && intentPlan?.requiresApproval;
}

function summarizeIntentPlan(intentPlan = {}) {
  return {
    version: intentPlan.version || 'telegram-agent-intent-v1',
    primaryIntent: intentPlan.primaryIntent || 'unknown',
    confidence: intentPlan.confidence || 0,
    mentionedObjects: intentPlan.mentionedObjects || [],
    proposedActions: intentPlan.proposedActions || [],
    blockedHandlers: intentPlan.blockedHandlers || [],
    allowedHandlers: intentPlan.allowedHandlers || [],
    replyStrategy: intentPlan.replyStrategy || '',
    requiresApproval: Boolean(intentPlan.requiresApproval),
  };
}

module.exports = {
  isConfirmationText,
  isHandlerBlocked,
  hasDirectReplyInsteadOfCodexIntent,
  planTelegramIntent,
  shouldAskForExternalApproval,
  stripConfirmationPrefix,
  summarizeIntentPlan,
};
