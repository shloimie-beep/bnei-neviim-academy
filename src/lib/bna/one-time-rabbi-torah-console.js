const crypto = require('crypto');

const ONE_TIME_RABBI_TORAH_CONSOLE_KEY = 'one_time_rabbi_torah_console';
const ONE_TIME_RABBI_TORAH_WORKSPACE = 'one_time';
const ONE_TIME_RABBI_TORAH_PROJECT = 'one_time_mishnayos';

const TORAH_CONSOLE_SOURCE_OF_TRUTH = Object.freeze({
  conversations: 'ghl_conversations',
  pipeline: 'one_time_torah_questions',
  telegram_role: 'transport_and_operator_controls_only',
  local_customer_transcript: 'forbidden',
});

const TORAH_CONSOLE_ALLOWED_ACTIONS = Object.freeze([
  'list_assigned_questions',
  'open_question',
  'save_text_draft',
  'save_voice_draft',
  'preview_draft',
  'send_confirmed_answer',
  'return_to_shloimie',
  'close_question',
  'draft_torah_newsletter',
  'draft_warm_enrollment_email',
]);

const TORAH_CONSOLE_FORBIDDEN_CAPABILITIES = Object.freeze([
  'show_general_support',
  'answer_torah_independently',
  'create_second_customer_transcript',
  'send_unconfirmed_answer',
  'send_bulk_campaign_without_exact_segment_count_confirmation',
]);

function compactConsoleText(value = '', max = 4000) {
  return String(value || '')
    .replace(/(api[_-]?key|token|secret|password|authorization|cookie)\s*[:=]\s*[^\s,}]+/gi, '[redacted-sensitive-field]')
    .slice(0, max);
}

function hasConfiguredValue(value) {
  return Boolean(String(value || '').trim());
}

function firstConfigured(env = {}, keys = []) {
  return keys.find((key) => hasConfiguredValue(env[key])) || '';
}

function buildOneTimeRabbiTorahConsoleReadiness({ env = process.env } = {}) {
  const telegramTokenKey = firstConfigured(env, [
    'TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER',
    'RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN',
  ]);
  const telegramChatKey = firstConfigured(env, [
    'TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER',
    'RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID',
    'ONE_TIME_TELEGRAM_CHAT_ID',
  ]);
  const ghlTokenKey = firstConfigured(env, [
    'ONE_TIME_GHL_PRIVATE_INTEGRATION_TOKEN',
    'ONE_TIME_HIGHLEVEL_ACCESS_TOKEN',
    'HIGHLEVEL_ACCESS_TOKEN',
  ]);
  const ghlLocationKey = firstConfigured(env, [
    'ONE_TIME_GHL_LOCATION_ID',
    'HIGHLEVEL_LOCATION_ID',
  ]);
  const missing = [];
  if (!telegramTokenKey) missing.push('protected_rabbi_telegram_bot_token');
  if (!telegramChatKey) missing.push('operator_owned_rabbi_telegram_chat');
  if (!ghlTokenKey) missing.push('protected_one_time_ghl_token');
  if (!ghlLocationKey) missing.push('one_time_ghl_location');
  const protectedProvidersReady = missing.length === 0;
  return {
    console_key: ONE_TIME_RABBI_TORAH_CONSOLE_KEY,
    workspace_key: ONE_TIME_RABBI_TORAH_WORKSPACE,
    project_key: ONE_TIME_RABBI_TORAH_PROJECT,
    mode: protectedProvidersReady ? 'private_canary_ready' : 'provider_off',
    adapter: protectedProvidersReady ? 'provider_contract_only' : 'fake',
    provider_configured: protectedProvidersReady,
    configured_key_names: {
      telegram_token: telegramTokenKey || null,
      telegram_chat: telegramChatKey || null,
      ghl_token: ghlTokenKey || null,
      ghl_location: ghlLocationKey || null,
    },
    blockers: missing,
    source_of_truth: TORAH_CONSOLE_SOURCE_OF_TRUTH,
    allowed_actions: TORAH_CONSOLE_ALLOWED_ACTIONS,
    forbidden_capabilities: TORAH_CONSOLE_FORBIDDEN_CAPABILITIES,
    operator_private_canary: {
      eligible: protectedProvidersReady,
      max_messages: 1,
      operator_owned_recipient_required: true,
      exact_confirmation_required: true,
      customer_recipient_allowed: false,
      run_by_preview: false,
    },
    customer_messages_sent: 0,
    external_write_performed: false,
  };
}

function normalizeTorahQuestion(raw = {}) {
  const questionId = compactConsoleText(raw.question_id || raw.questionId || raw.id, 120);
  if (!questionId) throw new Error('question_id is required');
  const recordType = String(raw.record_type || raw.recordType || raw.type || 'torah_question')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (recordType !== 'torah_question') throw new Error('general_support_is_not_available_in_torah_console');
  return {
    question_id: questionId,
    title: compactConsoleText(raw.title || 'Assigned Torah question', 180),
    question_text: compactConsoleText(raw.question_text || raw.questionText || raw.body || '', 6000),
    status: compactConsoleText(raw.status || 'assigned', 40),
    assigned_to: compactConsoleText(raw.assigned_to || raw.assignedTo || 'rabbi_elie_scheller', 120),
    ghl_conversation_id: compactConsoleText(raw.ghl_conversation_id || raw.ghlConversationId, 160),
    pipeline_record_id: compactConsoleText(raw.pipeline_record_id || raw.pipelineRecordId, 160),
    record_type: 'torah_question',
    draft: raw.draft && typeof raw.draft === 'object' ? { ...raw.draft } : null,
    source_of_truth: TORAH_CONSOLE_SOURCE_OF_TRUTH,
  };
}

function normalizeRabbiAnswerInput(payload = {}) {
  const text = compactConsoleText(payload.text || payload.answer_text || payload.answerText || '', 12000).trim();
  const voice = payload.voice && typeof payload.voice === 'object' ? payload.voice : null;
  if (text) {
    return {
      input_mode: 'text',
      text,
      voice: null,
      raw_audio_stored: false,
    };
  }
  const assetId = compactConsoleText(voice?.asset_id || voice?.assetId || '', 180);
  if (!assetId) throw new Error('Rabbi text or a voice asset_id is required');
  return {
    input_mode: 'voice',
    text: compactConsoleText(voice?.transcript || voice?.transcript_text || '', 12000),
    voice: {
      asset_id: assetId,
      duration_seconds: Number.isFinite(Number(voice?.duration_seconds)) ? Number(voice.duration_seconds) : null,
      mime_type: compactConsoleText(voice?.mime_type || voice?.mimeType || '', 80),
    },
    raw_audio_stored: false,
  };
}

function validateBulkCampaignConfirmation(payload = {}) {
  const exactSegment = compactConsoleText(payload.exact_segment || payload.exactSegment || '', 240).trim();
  const recipientCount = Number(payload.recipient_count ?? payload.recipientCount);
  const exactCount = Number.isInteger(recipientCount) && recipientCount > 0;
  const confirmed = payload.confirmed === true;
  const missing = [];
  if (!exactSegment) missing.push('exact_segment');
  if (!exactCount) missing.push('exact_recipient_count');
  if (!confirmed) missing.push('explicit_confirmation');
  return {
    valid: missing.length === 0,
    missing,
    exact_segment: exactSegment || null,
    recipient_count: exactCount ? recipientCount : null,
    confirmed,
  };
}

function createFakeTorahConsoleAdapter({ questions = [], now = () => new Date().toISOString() } = {}) {
  const store = new Map();
  questions.forEach((question) => {
    try {
      const normalized = normalizeTorahQuestion(question);
      store.set(normalized.question_id, normalized);
    } catch {
      // General support and malformed records are intentionally invisible here.
    }
  });

  function requireQuestion(questionId) {
    const row = store.get(String(questionId || ''));
    if (!row) throw new Error('torah_question_not_found');
    return row;
  }

  return {
    adapter_key: 'fake_one_time_torah_console',
    mode: 'provider_off',
    async listAssignedQuestions({ assignee = 'rabbi_elie_scheller' } = {}) {
      return Array.from(store.values())
        .filter((row) => row.assigned_to === assignee)
        .filter((row) => !['closed', 'returned_to_shloimie'].includes(row.status))
        .map((row) => ({ ...row }));
    },
    async openQuestion(questionId) {
      return { ...requireQuestion(questionId) };
    },
    async saveDraft(questionId, payload = {}) {
      const row = requireQuestion(questionId);
      const input = normalizeRabbiAnswerInput(payload);
      row.draft = {
        ...input,
        saved_at: now(),
        provider: 'fake',
        customer_message_sent: false,
      };
      row.status = 'draft_saved';
      return { question: { ...row }, draft: { ...row.draft }, send_performed: false };
    },
    async previewDraft(questionId) {
      const row = requireQuestion(questionId);
      if (!row.draft) throw new Error('draft_not_found');
      return {
        question_id: row.question_id,
        preview: { ...row.draft },
        canonical_delivery_channel: 'ghl_conversations',
        local_customer_transcript_created: false,
        send_performed: false,
      };
    },
    async sendConfirmedAnswer(questionId, confirmation = {}) {
      const row = requireQuestion(questionId);
      const exactQuestionId = String(confirmation.exact_question_id || confirmation.exactQuestionId || '');
      if (confirmation.confirmed !== true || exactQuestionId !== row.question_id) {
        throw new Error('exact_answer_confirmation_required');
      }
      if (!row.draft) throw new Error('draft_not_found');
      return {
        question_id: row.question_id,
        status: 'provider_off_preview',
        channel: 'ghl_conversations',
        would_send_through: 'ghl_conversations',
        customer_message_sent: false,
        send_performed: false,
        local_customer_transcript_created: false,
        blocker: 'protected_provider_credentials_absent',
      };
    },
    async returnToShloimie(questionId, reason = '') {
      const row = requireQuestion(questionId);
      row.status = 'returned_to_shloimie';
      row.return_reason = compactConsoleText(reason, 1200);
      return { question: { ...row }, send_performed: false };
    },
    async closeQuestion(questionId) {
      const row = requireQuestion(questionId);
      row.status = 'closed';
      row.closed_at = now();
      return { question: { ...row }, send_performed: false };
    },
    async draftTorahNewsletter(payload = {}) {
      return {
        draft_type: 'torah_newsletter',
        subject: compactConsoleText(payload.subject || '', 240),
        body: compactConsoleText(payload.body || payload.text || '', 20000),
        send_performed: false,
        bulk_send_allowed: false,
      };
    },
    async draftWarmEnrollmentEmail(payload = {}) {
      return {
        draft_type: 'warm_enrollment_email',
        subject: compactConsoleText(payload.subject || '', 240),
        body: compactConsoleText(payload.body || payload.text || '', 20000),
        send_performed: false,
        bulk_send_allowed: false,
      };
    },
  };
}

async function handleTorahConsoleAction(adapter, request = {}) {
  if (!adapter || typeof adapter !== 'object') throw new Error('torah_console_adapter_required');
  const action = String(request.action || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!TORAH_CONSOLE_ALLOWED_ACTIONS.includes(action)) {
    if (action === 'send_bulk_campaign') throw new Error('bulk_campaign_send_not_available');
    throw new Error('torah_console_action_not_allowed');
  }
  const questionId = request.question_id || request.questionId || '';
  let result;
  if (action === 'list_assigned_questions') result = await adapter.listAssignedQuestions(request);
  if (action === 'open_question') result = await adapter.openQuestion(questionId);
  if (action === 'save_text_draft') result = await adapter.saveDraft(questionId, { text: request.text || request.answer_text });
  if (action === 'save_voice_draft') result = await adapter.saveDraft(questionId, { voice: request.voice });
  if (action === 'preview_draft') result = await adapter.previewDraft(questionId);
  if (action === 'send_confirmed_answer') result = await adapter.sendConfirmedAnswer(questionId, request.confirmation || request);
  if (action === 'return_to_shloimie') result = await adapter.returnToShloimie(questionId, request.reason);
  if (action === 'close_question') result = await adapter.closeQuestion(questionId);
  if (action === 'draft_torah_newsletter') result = await adapter.draftTorahNewsletter(request);
  if (action === 'draft_warm_enrollment_email') result = await adapter.draftWarmEnrollmentEmail(request);
  if (result?.channel && result.channel !== 'ghl_conversations') throw new Error('answers_must_send_through_ghl_conversations');
  if (result?.local_customer_transcript_created === true) throw new Error('second_customer_transcript_forbidden');
  return {
    success: true,
    console_key: ONE_TIME_RABBI_TORAH_CONSOLE_KEY,
    action,
    result,
    source_of_truth: TORAH_CONSOLE_SOURCE_OF_TRUTH,
    customer_messages_sent: result?.customer_message_sent === true ? 1 : 0,
  };
}

function privateCanaryId(payload = {}) {
  return `TORAH-CANARY-${crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 12)}`;
}

module.exports = {
  ONE_TIME_RABBI_TORAH_CONSOLE_KEY,
  ONE_TIME_RABBI_TORAH_WORKSPACE,
  ONE_TIME_RABBI_TORAH_PROJECT,
  TORAH_CONSOLE_SOURCE_OF_TRUTH,
  TORAH_CONSOLE_ALLOWED_ACTIONS,
  TORAH_CONSOLE_FORBIDDEN_CAPABILITIES,
  compactConsoleText,
  buildOneTimeRabbiTorahConsoleReadiness,
  normalizeTorahQuestion,
  normalizeRabbiAnswerInput,
  validateBulkCampaignConfirmation,
  createFakeTorahConsoleAdapter,
  handleTorahConsoleAction,
  privateCanaryId,
};
