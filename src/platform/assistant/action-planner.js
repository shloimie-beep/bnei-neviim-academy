const { listActions, getAction } = require('../../lib/actions/registry');
const { actorFrom, visibleActionsForActor } = require('../../lib/actions/permissions');
const { runAction } = require('../../lib/actions/runner');
const { normalizeChannel } = require('./control-plane');

const PLANNER_VERSION = 'assistant-action-planner-v1';
const EXECUTOR_VERSION = 'assistant-action-runner-v1';

function compact(value = '', maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function actionInputValue(inputs, field) {
  if (Object.prototype.hasOwnProperty.call(inputs || {}, field)) return inputs[field];
  const camel = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return inputs?.[camel];
}

function missingRequiredInputs(action, inputs = {}) {
  return (action?.required_inputs || []).filter((field) => {
    const value = actionInputValue(inputs, field);
    return value === undefined || value === null || String(value).trim() === '';
  });
}

function extractFirstUrl(message = '') {
  return (String(message || '').match(/https?:\/\/[^\s<>"')]+/i) || [])[0] || '';
}

function extractGoogleBusinessUrl(message = '') {
  const urls = String(message || '').match(/https?:\/\/[^\s<>"')]+/gi) || [];
  return urls.find((url) => /google|maps\.app\.goo\.gl|g\.page|goo\.gl\/maps/i.test(url)) || '';
}

function extractProviderId(message = '') {
  const match = String(message || '').match(/\b(?:provider|profile)\s*#?\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function extractAudienceCount(message = '') {
  const match = String(message || '').match(/\b(\d{1,3}(?:,\d{3})+|\d+)\s*(?:opted[-\s]?in\s*)?(?:lead|parent|contact|recipient|person|people|email)s?\b/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function extractMessageCount(message = '') {
  const match = String(message || '').match(/\b(\d+)[-\s]?(?:message|email)s?\b|\b(\d+)[-\s]?part\b/i);
  return match ? Number(match[1] || match[2]) : null;
}

function titleFromMessage(message = '', fallback = 'Assistant request') {
  return compact(String(message || '')
    .replace(/^\s*(ticket|task|todo|decision|codex|bug)\s*:\s*/i, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || fallback, 220);
}

function inferInputs(actionId, message = '', provided = {}) {
  const text = compact(message, 4000);
  const title = titleFromMessage(text);
  const inferred = {};
  if (actionId === 'create_task') {
    Object.assign(inferred, {
      title,
      notes: text,
      source: 'assistant_control_plane',
      category: /\b(code|server|bug|deploy|test|railway|api|database)\b/i.test(text) ? 'technology' : 'operations',
      urgency: /\b(urgent|today|asap|blocking|right now)\b/i.test(text) ? 'today' : 'this_week',
    });
  } else if (actionId === 'create_decision') {
    Object.assign(inferred, {
      title,
      question: text,
      context: text,
    });
  } else if (actionId === 'create_ticket' || actionId === 'create_report_problem_ticket') {
    Object.assign(inferred, {
      title,
      message: text,
      route: /\b(code|server|bug|deploy|test|railway|api|database)\b/i.test(text) ? 'codex_review' : 'support',
      category: /\b(payment|charged|billing|invoice)\b/i.test(text) ? 'billing' : /\b(broken|bug|error|does not work|doesn't work)\b/i.test(text) ? 'bug' : 'support',
      severity: /\b(urgent|blocking|broken|down|critical|right now)\b/i.test(text) ? 'blocking' : 'normal',
      source: 'assistant_control_plane',
    });
  } else if (actionId === 'route_bug_to_codex') {
    Object.assign(inferred, {
      title,
      message: text,
      severity: /\b(urgent|blocking|down|critical|right now)\b/i.test(text) ? 'blocking' : 'normal',
      evidence: extractFirstUrl(text),
    });
  } else if (actionId === 'capture_provider_google_business_link') {
    Object.assign(inferred, {
      provider_id: extractProviderId(text),
      google_business_profile_url: extractGoogleBusinessUrl(text),
      notes: text,
    });
  } else if (actionId === 'create_provider_question_post') {
    Object.assign(inferred, {
      body: text,
      visibility: 'provider',
    });
  } else if (actionId === 'preview_campaign_segment') {
    Object.assign(inferred, {
      segment_name: title,
      audience_label: title,
      estimated_count: extractAudienceCount(text) || '',
      consent_count: /\bopted[-\s]?in|consent\b/i.test(text) ? (extractAudienceCount(text) || '') : '',
      exclusions: [
        /\bunsubscribed|unsubscribe\b/i.test(text) ? 'unsubscribed' : '',
        /\bbounced?\b/i.test(text) ? 'bounced' : '',
        /\balready enrolled|enrolled\b/i.test(text) ? 'already_enrolled' : '',
      ].filter(Boolean),
    });
  } else if (actionId === 'draft_email_campaign') {
    Object.assign(inferred, {
      goal: text,
      segment_name: title,
      estimated_count: extractAudienceCount(text) || '',
      consent_count: /\bopted[-\s]?in|consent\b/i.test(text) ? (extractAudienceCount(text) || '') : '',
      message: { subject: title, body: text },
    });
  } else if (actionId === 'draft_drip_sequence') {
    Object.assign(inferred, {
      goal: text,
      segment_name: title,
      estimated_count: extractAudienceCount(text) || '',
      consent_count: /\bopted[-\s]?in|consent\b/i.test(text) ? (extractAudienceCount(text) || '') : '',
      message_count: extractMessageCount(text) || 6,
    });
  } else {
    Object.assign(inferred, {
      title,
      message: text,
    });
  }
  return { ...inferred, ...(provided || {}) };
}

function buildActionPlannerSchema({ actor = {}, channel = 'website_assistant', actions = listActions() } = {}) {
  const canonicalChannel = normalizeChannel(channel) || 'website_assistant';
  const normalizedActor = actorFrom(actor);
  const allowedActions = visibleActionsForActor(actions, normalizedActor);
  return {
    planner_version: PLANNER_VERSION,
    channel: canonicalChannel,
    actor: normalizedActor,
    actions: allowedActions.map((action) => ({
      action_id: action.action_id,
      label: action.label,
      category: action.category,
      required_inputs: [...(action.required_inputs || [])],
      optional_inputs: [...(action.optional_inputs || [])],
      dry_run_supported: Boolean(action.dry_run_supported),
      approval_required: Boolean(action.approval_required),
      related_routes: [...(action.related_routes || [])],
      ui_button_labels: [...(action.ui_button_labels || [])],
      telegram_intent_examples: [...(action.telegram_intent_examples || [])],
      execution_handler: action.execution_handler,
    })),
  };
}

function scoreAction(action, message = '', requestedActionId = '') {
  const text = compact(message, 4000).toLowerCase();
  if (requestedActionId && action.action_id === requestedActionId) return 100;
  const id = action.action_id;
  const label = String(action.label || '').toLowerCase();
  const examples = (action.telegram_intent_examples || []).join(' ').toLowerCase();
  let score = 0;
  if (text.includes(id.toLowerCase())) score += 80;
  if (label && text.includes(label)) score += 20;
  if (examples && examples.split(/\W+/).filter((word) => word.length > 4 && text.includes(word)).length >= 2) score += 10;

  if (/\b(decision|decide|approval|choose)\b/.test(text) && id === 'create_decision') score += 70;
  if (/\b(task|todo|to do|follow[-\s]?up)\b/.test(text) && id === 'create_task') score += 65;
  if (/\b(ticket|support|broken|bug|does not work|doesn't work|problem|issue)\b/.test(text) && id === 'create_ticket') score += 65;
  if (/\b(report problem|report a bug|broken button|unclear)\b/.test(text) && id === 'create_report_problem_ticket') score += 65;
  if (/\b(codex|code|server|api|database|deploy|railway|test|fix this button)\b/.test(text) && id === 'route_bug_to_codex') score += 80;
  if (/\b(provider|profile|google business|google maps|place id|maps link)\b/.test(text) && id === 'capture_provider_google_business_link') score += 70;
  if (/\b(provider|rabbi|classroom|post|question)\b/.test(text) && id === 'create_provider_question_post') score += 55;
  if (/\b(segment|audience|suppression|suppress|unsubscribed|bounced|opted[-\s]?in)\b/.test(text) && id === 'preview_campaign_segment') score += 65;
  if (/\b(email campaign|campaign|bulk email|send email|audience preview)\b/.test(text) && id === 'draft_email_campaign') score += 70;
  if (/\b(drip|sequence|nurture|follow[-\s]?up series|six[-\s]?email|6[-\s]?email)\b/.test(text) && id === 'draft_drip_sequence') score += 85;
  return score;
}

function selectAction(message = '', allowedActions = [], requestedActionId = '') {
  const scored = allowedActions
    .map((action) => ({ action, score: scoreAction(action, message, requestedActionId) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.action.action_id.localeCompare(b.action.action_id));
  return scored[0] || null;
}

function buildAssistantActionPlan({
  message = '',
  actor = {},
  channel = 'website_assistant',
  inputs = {},
  requested_action_id = '',
  mode = 'act',
  actions = listActions(),
} = {}) {
  const schema = buildActionPlannerSchema({ actor, channel, actions });
  const actionId = String(requested_action_id || '').trim();
  const unknownActionRequested = actionId && !getAction(actionId);
  const deniedRequestedAction = actionId && getAction(actionId) && !schema.actions.some((action) => action.action_id === actionId);
  const selected = !unknownActionRequested && !deniedRequestedAction
    ? selectAction(message, schema.actions.map((action) => getAction(action.action_id)).filter(Boolean), actionId)
    : null;
  const rejected = [];
  if (unknownActionRequested) rejected.push({ action_id: actionId, reason: 'unknown_action_id' });
  if (deniedRequestedAction) rejected.push({ action_id: actionId, reason: 'permission_denied' });

  const plannedInputs = selected ? inferInputs(selected.action.action_id, message, inputs) : {};
  const missing = selected ? missingRequiredInputs(selected.action, plannedInputs) : [];
  const planAction = selected ? {
    action_id: selected.action.action_id,
    label: selected.action.label,
    confidence: Math.min(0.99, Math.max(0.3, selected.score / 100)),
    reason: actionId ? 'requested_action_id' : 'registry_keyword_match',
    inputs: plannedInputs,
    missing_inputs: missing,
    preview_required: Boolean(selected.action.approval_required || selected.action.dry_run_supported),
    approval_required: Boolean(selected.action.approval_required),
    dry_run: Boolean(selected.action.approval_required || selected.action.dry_run_supported),
    can_execute: missing.length === 0,
    execution_handler: selected.action.execution_handler,
  } : null;

  const questions = missing.map((field) => `What should I use for ${field.replace(/_/g, ' ')}?`);
  return {
    success: true,
    planner_version: PLANNER_VERSION,
    channel: schema.channel,
    mode,
    actor: schema.actor,
    allowed_action_count: schema.actions.length,
    rejected_actions: rejected,
    actions: planAction ? [planAction] : [],
    reply: {
      summary: planAction
        ? `${planAction.label} is available through the shared action registry.`
        : rejected.length
          ? 'That action is not available for this actor and workspace.'
          : 'No typed action matched confidently.',
      questions,
    },
    schema,
  };
}

async function runPlannedAssistantAction({ plan = {}, action_id = '', approved = false, dry_run = undefined, context = {} } = {}) {
  const actionId = String(action_id || plan.actions?.[0]?.action_id || '').trim();
  const planned = (plan.actions || []).find((action) => action.action_id === actionId);
  if (!planned) {
    return {
      success: false,
      executor_version: EXECUTOR_VERSION,
      error: 'planned_action_not_found',
      executed: false,
    };
  }
  if (planned.missing_inputs?.length) {
    return {
      success: false,
      executor_version: EXECUTOR_VERSION,
      action_id: actionId,
      missing_inputs: planned.missing_inputs,
      error: `Missing required input(s): ${planned.missing_inputs.join(', ')}`,
      executed: false,
    };
  }
  const shouldDryRun = dry_run === undefined
    ? planned.dry_run || (!approved && planned.approval_required)
    : Boolean(dry_run) || (!approved && planned.approval_required);
  return runAction({
    action_id: actionId,
    inputs: planned.inputs,
    source: plan.channel || context.source || 'assistant_control_plane',
    actor: plan.actor || context.actor,
    dry_run: shouldDryRun,
    approved,
  }, {
    ...context,
    source: plan.channel || context.source || 'assistant_control_plane',
    actor: plan.actor || context.actor,
  });
}

module.exports = {
  EXECUTOR_VERSION,
  PLANNER_VERSION,
  buildActionPlannerSchema,
  buildAssistantActionPlan,
  inferInputs,
  missingRequiredInputs,
  runPlannedAssistantAction,
};
