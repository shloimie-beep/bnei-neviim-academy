const {
  CURRENT_CLASS_LINK_ACTION_ID,
  buildProviderLeadBotPlan,
  buildProviderLeadBotSystemPrompt,
  loadProviderLeadBotProfile,
} = require('../provider-lead-bot');
const {
  resolveAssignedCommunicationAgent,
} = require('./communication-agent-runtime');

const RESPONSE_RUNTIME_VERSION = '2026-07-13-v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

const BLOCKED_ACTION_IDS = new Set([
  'ACTION-CREATE-CRM-TASK',
  'ACTION-CRM-CREATE-TASK',
  'ACTION-GRANT-ACCESS',
  'ACTION-CHARGE-PAYMENT',
  'ACTION-SEND-UNASSIGNED-CHANNEL',
  'ACTION-RELEASE-RAW-CLASS-LINK',
]);

const ALLOWED_ACTION_IDS = new Set([
  CURRENT_CLASS_LINK_ACTION_ID,
  'ACTION-COMMUNICATION-HUMAN-HANDOFF',
  'ACTION-COMMUNICATION-SUPPORT-TICKET',
  'ACTION-COMMUNICATION-PERSIST-SUPPRESSION',
]);

function compact(value = '', max = 1000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function redactUrls(value = '') {
  return String(value || '').replace(/https?:\/\/[^\s)]+/gi, '[redacted-url]');
}

function redactSecrets(value = '') {
  return compact(value, 1000)
    .replace(/sk-[A-Za-z0-9_-]+/g, '[redacted-secret]')
    .replace(/\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, '[redacted-secret]');
}

function hasUnsafeProgramClaim(value = '') {
  return /\b(?:30[- ]?day trial|\$ ?67|67 dollars?|parent portal is open|student portal is open|library access is available|member area is open|portal availability|library availability)\b/i.test(String(value || ''));
}

function hasRawClassLink(value = '') {
  const text = String(value || '');
  const urls = text.match(/https?:\/\/[^\s)]+/gi) || [];
  return urls.some((url) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const path = parsed.pathname.replace(/\/+$/, '') || '/';
      if (hostname === 'join.onetimeonetime.com' && ['/one-time', '/one-time/signup'].includes(path)) return false;
      return true;
    } catch (_) {
      return true;
    }
  });
}

function scopedConversationHistory(history = [], maxItems = 6) {
  return (Array.isArray(history) ? history : [])
    .slice(-maxItems)
    .map((item = {}) => ({
      direction: compact(item.direction || item.role || '', 20) || 'message',
      channel: compact(item.channel || '', 40) || null,
      body: redactUrls(compact(item.body || item.body_text || item.text || item.message || '', 800)),
      occurred_at: compact(item.occurred_at || item.created_at || '', 80) || null,
      raw_provider_id_returned: false,
      raw_recipient_returned: false,
    }))
    .filter((item) => item.body);
}

function deterministicActionsForPlan(plan = {}) {
  const actions = [];
  if (plan.class_link_requested) {
    actions.push({
      action_id: CURRENT_CLASS_LINK_ACTION_ID,
      status: plan.class_link_released ? 'server_authorized_final_delivery_only' : 'requires_contact_request_or_consent',
      raw_link_in_model_context: false,
      raw_link_in_logs: false,
    });
  }
  if (plan.create_support_ticket) {
    actions.push({
      action_id: 'ACTION-COMMUNICATION-SUPPORT-TICKET',
      status: 'allowed_support_intent',
      create_generic_task: false,
    });
  }
  if (plan.opt_out) {
    actions.push({
      action_id: 'ACTION-COMMUNICATION-PERSIST-SUPPRESSION',
      status: 'allowed_opt_out',
      create_follow_up_task: false,
    });
  }
  if (plan.notify_rabbi || plan.notify_platform_support) {
    actions.push({
      action_id: 'ACTION-COMMUNICATION-HUMAN-HANDOFF',
      status: 'needs_human_badge_only',
      create_generic_task: false,
    });
  }
  return actions;
}

function parseModelOutput(output) {
  if (!output) return { reply: '', proposed_actions: [] };
  if (typeof output === 'object') {
    return {
      reply: compact(output.reply || output.message || output.text || '', 3000),
      proposed_actions: Array.isArray(output.proposed_actions) ? output.proposed_actions : [],
    };
  }
  const text = String(output || '').trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return parseModelOutput(JSON.parse(jsonMatch[0]));
    } catch (_) {}
  }
  return { reply: compact(text, 3000), proposed_actions: [] };
}

function extractOpenAIText(responseJson = {}) {
  if (typeof responseJson.output_text === 'string') return responseJson.output_text;
  if (Array.isArray(responseJson.output)) {
    const parts = [];
    for (const item of responseJson.output) {
      if (Array.isArray(item.content)) {
        for (const content of item.content) {
          if (typeof content.text === 'string') parts.push(content.text);
          if (typeof content.output_text === 'string') parts.push(content.output_text);
        }
      }
    }
    return parts.join('\n').trim();
  }
  return '';
}

async function callOpenAIResponses({
  apiKey = '',
  baseUrl = DEFAULT_OPENAI_BASE_URL,
  model = DEFAULT_OPENAI_MODEL,
  systemPrompt = '',
  input = {},
  fetchImpl = globalThis.fetch,
  timeoutMs = 30000,
} = {}) {
  if (!apiKey) {
    return { ok: false, status: 'missing_api_key', text: '', model, error_redacted: 'OPENAI_API_KEY not configured' };
  }
  if (typeof fetchImpl !== 'function') {
    return { ok: false, status: 'missing_fetch', text: '', model, error_redacted: 'fetch unavailable' };
  }
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetchImpl(`${String(baseUrl || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, '')}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions: systemPrompt,
        input: JSON.stringify(input),
        text: {
          format: {
            type: 'json_schema',
            name: 'communication_agent_response',
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['reply', 'proposed_actions'],
              properties: {
                reply: { type: 'string' },
                proposed_actions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              },
            },
          },
        },
      }),
      signal: controller?.signal,
    });
    const bodyText = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        status: 'provider_error',
        text: '',
        model,
        error_redacted: `OpenAI response ${response.status}: ${redactSecrets(bodyText).slice(0, 240)}`,
      };
    }
    let json = {};
    try {
      json = JSON.parse(bodyText);
    } catch (_) {
      json = { output_text: bodyText };
    }
    return { ok: true, status: 'ok', text: extractOpenAIText(json), model, response_id: compact(json.id || '', 120) || null };
  } catch (error) {
    return {
      ok: false,
      status: error?.name === 'AbortError' ? 'timeout' : 'provider_exception',
      text: '',
      model,
      error_redacted: redactSecrets(error?.message || String(error)).slice(0, 240),
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function enforceCommunicationAgentPolicy({
  agent = {},
  deterministicPlan = {},
  modelResult = {},
  modelStatus = 'not_called',
} = {}) {
  const proposed = parseModelOutput(modelResult);
  const blocked_actions = [];
  const allowed_actions = [];
  for (const rawAction of proposed.proposed_actions || []) {
    const actionId = compact(rawAction.action_id || rawAction.id || rawAction.action || '', 120);
    if (!actionId) continue;
    if (BLOCKED_ACTION_IDS.has(actionId) || /task|charge|payment|grant|access|credential|secret/i.test(actionId)) {
      blocked_actions.push({ action_id: actionId, reason: 'prohibited_capability' });
      continue;
    }
    if (!ALLOWED_ACTION_IDS.has(actionId)) {
      blocked_actions.push({ action_id: actionId, reason: 'unregistered_or_unassigned_action' });
      continue;
    }
    allowed_actions.push({ ...rawAction, action_id: actionId });
  }

  for (const action of deterministicActionsForPlan(deterministicPlan)) {
    if (!allowed_actions.some((item) => item.action_id === action.action_id)) allowed_actions.push(action);
  }

  const modelReply = compact(proposed.reply, 2500);
  const deterministicReply = compact(deterministicPlan.reply_body || '', 2500);
  const modelReplyUnsafe = hasUnsafeProgramClaim(modelReply) || hasRawClassLink(modelReply);
  const deterministicReplyUnsafe = hasUnsafeProgramClaim(deterministicReply) || hasRawClassLink(deterministicReply);

  let reply = '';
  let responseStatus = 'needs_human';
  let fallbackUsed = false;
  if (deterministicPlan.suppress_outbound) {
    responseStatus = 'suppressed';
    reply = '';
  } else if (modelReply && !modelReplyUnsafe) {
    responseStatus = modelStatus === 'ok' ? 'model_reply_accepted' : 'model_reply_accepted_without_provider_ok';
    reply = modelReply;
  } else if (deterministicReply && !deterministicReplyUnsafe) {
    responseStatus = modelReplyUnsafe ? 'model_reply_blocked_fallback_used' : 'fallback_used';
    fallbackUsed = true;
    reply = deterministicReply;
  } else {
    responseStatus = modelReplyUnsafe || deterministicReplyUnsafe ? 'needs_human_unsafe_reply_blocked' : 'needs_human_no_reply';
  }

  const replyMode = agent.reply_mode || 'capture_only';
  const delivery = reply
    ? {
        enqueue: replyMode === 'live' && Boolean(agent.outbox_channel_key),
        mode: replyMode,
        channel_key: replyMode === 'live' ? agent.outbox_channel_key || null : null,
        body: reply,
        raw_class_link_in_model_context: false,
        raw_class_link_in_logs: false,
      }
    : null;

  return {
    response_status: responseStatus,
    reply,
    reply_mode: replyMode,
    fallback_used: fallbackUsed,
    allowed_actions,
    blocked_actions,
    delivery,
    model_reply_blocked: Boolean(modelReply && modelReplyUnsafe),
    deterministic_reply_blocked: Boolean(deterministicReply && deterministicReplyUnsafe),
    create_task: false,
    external_send_performed: false,
    raw_class_link_in_model_context: false,
    raw_class_link_in_logs: false,
  };
}

async function generateCommunicationAgentResponse({
  binding = {},
  channel = '',
  provider = '',
  message = '',
  contact = {},
  conversationHistory = [],
  dynamicKnowledge = {},
  publicBaseUrl = '',
  openai = {},
} = {}) {
  const agent = resolveAssignedCommunicationAgent({ binding, channel, provider });
  if (!agent.loaded) {
    return {
      success: false,
      response_status: 'agent_not_loaded',
      agent_loaded: false,
      reason: agent.reason || 'not_loaded',
      external_send_performed: false,
    };
  }
  const profile = loadProviderLeadBotProfile('one-time');
  const deterministicPlan = buildProviderLeadBotPlan({
    profile,
    message,
    contact,
    dynamicKnowledge,
    classJoinUrl: '',
    publicBaseUrl,
  });
  const systemPrompt = buildProviderLeadBotSystemPrompt(profile, dynamicKnowledge);
  const promptInput = {
    runtime_version: RESPONSE_RUNTIME_VERSION,
    channel: agent.channel,
    formatting_policy: agent.channel_formatting_policy,
    approved_knowledge: agent.published_knowledge_snapshot,
    conversation_history: scopedConversationHistory(conversationHistory),
    latest_user_message: redactUrls(compact(message, 1600)),
    deterministic_plan: {
      intent: deterministicPlan.intent,
      access_state: deterministicPlan.access_state,
      class_link_requested: deterministicPlan.class_link_requested,
      class_link_action_id: deterministicPlan.class_link_action_id,
      route_aliases: deterministicPlan.route_aliases,
      create_support_ticket: deterministicPlan.create_support_ticket,
      opt_out: deterministicPlan.opt_out,
      suppress_outbound: deterministicPlan.suppress_outbound,
      raw_class_link_in_model_context: false,
    },
    response_contract: {
      return_json: true,
      fields: ['reply', 'proposed_actions'],
      prohibited_claims: ['trial terms', 'pricing', 'portal availability', 'library availability', 'access grants'],
      raw_class_link_in_model_context: false,
      raw_class_link_in_logs: false,
    },
  };
  const model = openai.model || agent.model_config?.model || DEFAULT_OPENAI_MODEL;
  const modelCall = await callOpenAIResponses({
    apiKey: openai.apiKey || '',
    baseUrl: openai.baseUrl || DEFAULT_OPENAI_BASE_URL,
    model,
    systemPrompt,
    input: promptInput,
    fetchImpl: openai.fetchImpl,
    timeoutMs: openai.timeoutMs || 30000,
  });
  const policy = enforceCommunicationAgentPolicy({
    agent,
    deterministicPlan,
    modelResult: modelCall.ok ? modelCall.text : '',
    modelStatus: modelCall.status,
  });
  return {
    success: true,
    runtime_version: RESPONSE_RUNTIME_VERSION,
    agent_loaded: true,
    agent_key: agent.agent_key,
    agent_version: agent.agent_version,
    knowledge_snapshot_version: agent.knowledge_snapshot_version,
    knowledge_snapshot_hash: agent.knowledge_snapshot_hash,
    channel_binding_key: agent.channel_binding_key,
    channel_id: agent.channel_id,
    channel: agent.channel,
    model,
    model_status: modelCall.status,
    model_response_id: modelCall.response_id || null,
    model_error_redacted: modelCall.ok ? null : modelCall.error_redacted || null,
    prompt_version: RESPONSE_RUNTIME_VERSION,
    prompt_input_returned: false,
    raw_api_key_stored: false,
    raw_secret_returned: false,
    deterministic_plan: {
      intent: deterministicPlan.intent,
      route_aliases: deterministicPlan.route_aliases,
      create_support_ticket: deterministicPlan.create_support_ticket,
      opt_out: deterministicPlan.opt_out,
      suppress_outbound: deterministicPlan.suppress_outbound,
      class_link_requested: deterministicPlan.class_link_requested,
      class_link_released: false,
      raw_class_link_returned: false,
    },
    ...policy,
  };
}

module.exports = {
  RESPONSE_RUNTIME_VERSION,
  callOpenAIResponses,
  enforceCommunicationAgentPolicy,
  generateCommunicationAgentResponse,
  hasRawClassLink,
  hasUnsafeProgramClaim,
  parseModelOutput,
  redactSecrets,
  scopedConversationHistory,
};
