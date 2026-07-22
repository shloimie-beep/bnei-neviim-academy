const crypto = require('crypto');
const {
  normalizeRabbiAnswerInput,
} = require('./one-time-rabbi-torah-console');

const RABBI_PROVIDER_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_questions (
  id SERIAL PRIMARY KEY,
  question_ref TEXT NOT NULL UNIQUE,
  opportunity_id TEXT NOT NULL UNIQUE,
  contact_id TEXT NOT NULL,
  conversation_id TEXT,
  pipeline_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Synthetic Torah question',
  status TEXT NOT NULL DEFAULT 'assigned',
  synthetic BOOLEAN NOT NULL DEFAULT TRUE,
  draft_note_id TEXT,
  draft_sha256 TEXT,
  draft_saved_at TIMESTAMP,
  audit_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_telegram_updates (
  id SERIAL PRIMARY KEY,
  update_id BIGINT NOT NULL UNIQUE,
  update_fingerprint TEXT NOT NULL,
  actor_fingerprint TEXT NOT NULL,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_operator_state (
  actor_fingerprint TEXT PRIMARY KEY,
  question_ref TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_consumer_leases (
  consumer_key TEXT PRIMARY KEY,
  owner_ref TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_audit_events (
  id SERIAL PRIMARY KEY,
  audit_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  question_ref TEXT,
  actor_fingerprint TEXT,
  safe_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_canaries (
  id SERIAL PRIMARY KEY,
  canary_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  safe_outcome JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function fingerprint(value = '', label = 'ref') {
  return `${label}:sha256:${sha256(value).slice(0, 16)}`;
}

function truthy(value) {
  return /^(?:1|true|yes|on|enabled)$/i.test(String(value || '').trim());
}

function timingSafeEqual(left = '', right = '') {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function providerConfig(env = process.env) {
  return {
    telegramToken: String(env.TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER || env.RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN || '').trim(),
    telegramChatId: String(env.TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER || env.RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID || '').trim(),
    webhookSecret: String(env.ONE_TIME_RABBI_TELEGRAM_WEBHOOK_SECRET || '').trim(),
    ghlToken: String(env.ONE_TIME_GHL_PRIVATE_INTEGRATION_TOKEN || '').trim(),
    ghlLocationId: String(env.ONE_TIME_GHL_LOCATION_ID || '').trim(),
    syntheticContactId: String(env.ONE_TIME_RABBI_SYNTHETIC_CONTACT_ID || '').trim(),
    consumerEnabled: truthy(env.ONE_TIME_RABBI_CONSUMER_ENABLED),
    syntheticOnly: truthy(env.ONE_TIME_RABBI_SYNTHETIC_ONLY),
    sendEnabled: truthy(env.ONE_TIME_RABBI_GHL_SEND_ENABLED),
    voiceEnabled: truthy(env.ONE_TIME_RABBI_VOICE_TRANSCRIPTION_ENABLED),
    openAiKey: String(env.OPENAI_API_KEY || '').trim(),
    publicBaseUrl: String(env.ONE_TIME_RABBI_PREVIEW_BASE_URL || env.RAILWAY_PUBLIC_DOMAIN || '').trim().replace(/^([^h])/, 'https://$1').replace(/\/$/, ''),
    ownerRef: String(env.RAILWAY_REPLICA_ID || env.RAILWAY_DEPLOYMENT_ID || 'preview-singleton').trim(),
  };
}

function providerReadiness(env = process.env) {
  const config = providerConfig(env);
  const blockers = [];
  if (!config.telegramToken) blockers.push('dedicated_rabbi_telegram_token_absent');
  if (!config.telegramChatId) blockers.push('private_chat_allowlist_absent');
  if (!config.webhookSecret) blockers.push('telegram_webhook_secret_absent');
  if (!config.ghlToken) blockers.push('one_time_ghl_pit_absent');
  if (!config.ghlLocationId) blockers.push('one_time_ghl_location_absent');
  if (!config.syntheticContactId) blockers.push('operator_owned_synthetic_contact_absent');
  if (!config.consumerEnabled) blockers.push('single_consumer_not_enabled');
  if (!config.syntheticOnly) blockers.push('synthetic_only_gate_not_enabled');
  return {
    ready: blockers.length === 0,
    mode: blockers.length ? 'provider_off' : 'private_canary_ready',
    adapter: blockers.length ? 'fake' : 'telegram_webhook_and_ghl',
    blockers,
    telegram: {
      provider_ready: Boolean(config.telegramToken && config.telegramChatId && config.webhookSecret && config.consumerEnabled),
      private_chat_allowlist: Boolean(config.telegramChatId),
      signed_webhook: Boolean(config.webhookSecret),
      consumer_strategy: 'telegram_webhook_max_connections_1_plus_postgres_lease',
    },
    ghl: {
      provider_ready: Boolean(config.ghlToken && config.ghlLocationId && config.syntheticContactId && config.syntheticOnly),
      canonical_transcript: true,
      synthetic_only: config.syntheticOnly,
      customer_send_enabled: false,
    },
    voice: {
      enabled: Boolean(config.voiceEnabled && config.openAiKey),
      blocker: config.voiceEnabled && config.openAiKey ? '' : 'protected_voice_transcription_gate_absent',
    },
  };
}

function createPostgresRabbiRepository(db) {
  if (!db || typeof db.query !== 'function') throw new Error('rabbi_postgres_repository_required');
  return {
    async ensureSchema() {
      await db.query(RABBI_PROVIDER_SCHEMA_SQL);
    },
    async claimConsumer(ownerRef, ttlSeconds = 45) {
      const result = await db.query(
        `INSERT INTO bna_one_time_rabbi_consumer_leases (consumer_key, owner_ref, expires_at)
         VALUES ('one_time_rabbi_telegram', $1, NOW() + ($2::text || ' seconds')::interval)
         ON CONFLICT (consumer_key) DO UPDATE SET
           owner_ref = EXCLUDED.owner_ref,
           expires_at = EXCLUDED.expires_at,
           updated_at = NOW()
         WHERE bna_one_time_rabbi_consumer_leases.owner_ref = EXCLUDED.owner_ref
            OR bna_one_time_rabbi_consumer_leases.expires_at < NOW()
         RETURNING owner_ref`,
        [ownerRef, String(ttlSeconds)]
      );
      return result.rows[0]?.owner_ref === ownerRef;
    },
    async claimUpdate({ updateId, updateFingerprint, actorFingerprint, eventType, auditId }) {
      const result = await db.query(
        `INSERT INTO bna_one_time_rabbi_telegram_updates
           (update_id, update_fingerprint, actor_fingerprint, event_type, outcome, audit_id)
         VALUES ($1, $2, $3, $4, 'accepted', $5)
         ON CONFLICT (update_id) DO NOTHING
         RETURNING update_id`,
        [updateId, updateFingerprint, actorFingerprint, eventType, auditId]
      );
      return Boolean(result.rows[0]);
    },
    async recordAudit(event) {
      await db.query(
        `INSERT INTO bna_one_time_rabbi_audit_events
           (audit_id, event_type, outcome, question_ref, actor_fingerprint, safe_details)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (audit_id) DO NOTHING`,
        [event.audit_id, event.event_type, event.outcome, event.question_ref || null, event.actor_fingerprint || null, JSON.stringify(event.safe_details || {})]
      );
      return event;
    },
    async upsertQuestion(row) {
      const result = await db.query(
        `INSERT INTO bna_one_time_rabbi_questions
           (question_ref, opportunity_id, contact_id, conversation_id, pipeline_id, stage_id, title, status, synthetic, audit_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,$9)
         ON CONFLICT (opportunity_id) DO UPDATE SET
           pipeline_id = EXCLUDED.pipeline_id,
           stage_id = EXCLUDED.stage_id,
           status = EXCLUDED.status,
           audit_id = EXCLUDED.audit_id,
           updated_at = NOW()
         RETURNING *`,
        [row.question_ref, row.opportunity_id, row.contact_id, row.conversation_id || null, row.pipeline_id, row.stage_id, row.title || 'Synthetic Torah question', row.status || 'assigned', row.audit_id || null]
      );
      return result.rows[0];
    },
    async listQuestions() {
      return (await db.query(
        `SELECT question_ref, title, status, synthetic, draft_sha256, draft_saved_at, audit_id
         FROM bna_one_time_rabbi_questions
         WHERE synthetic = TRUE AND status NOT IN ('closed', 'returned_to_shloimie')
         ORDER BY updated_at DESC`
      )).rows;
    },
    async getQuestion(questionRef) {
      return (await db.query('SELECT * FROM bna_one_time_rabbi_questions WHERE question_ref = $1 AND synthetic = TRUE LIMIT 1', [questionRef])).rows[0] || null;
    },
    async findByOpportunity(opportunityId) {
      return (await db.query('SELECT * FROM bna_one_time_rabbi_questions WHERE opportunity_id = $1 AND synthetic = TRUE LIMIT 1', [opportunityId])).rows[0] || null;
    },
    async saveDraftRef(questionRef, { noteId, draftSha256, auditId }) {
      return (await db.query(
        `UPDATE bna_one_time_rabbi_questions
         SET draft_note_id = $2, draft_sha256 = $3, draft_saved_at = NOW(), status = 'draft_saved', audit_id = $4, updated_at = NOW()
         WHERE question_ref = $1 AND synthetic = TRUE RETURNING *`,
        [questionRef, noteId, draftSha256, auditId]
      )).rows[0] || null;
    },
    async setSelectedQuestion(actorFingerprint, questionRef) {
      await db.query(
        `INSERT INTO bna_one_time_rabbi_operator_state (actor_fingerprint, question_ref)
         VALUES ($1,$2) ON CONFLICT (actor_fingerprint) DO UPDATE SET question_ref = EXCLUDED.question_ref, updated_at = NOW()`,
        [actorFingerprint, questionRef]
      );
    },
    async selectedQuestion(actorFingerprint) {
      return (await db.query('SELECT question_ref FROM bna_one_time_rabbi_operator_state WHERE actor_fingerprint = $1', [actorFingerprint])).rows[0]?.question_ref || '';
    },
    async saveCanary(canary) {
      return (await db.query(
        `INSERT INTO bna_one_time_rabbi_canaries (canary_id, status, audit_id, safe_outcome)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (canary_id) DO UPDATE SET status=EXCLUDED.status,audit_id=EXCLUDED.audit_id,safe_outcome=EXCLUDED.safe_outcome,updated_at=NOW()
         RETURNING *`,
        [canary.canary_id, canary.status, canary.audit_id, JSON.stringify(canary.safe_outcome || {})]
      )).rows[0];
    },
    async latestCanary() {
      return (await db.query('SELECT canary_id, status, audit_id, safe_outcome, updated_at FROM bna_one_time_rabbi_canaries ORDER BY updated_at DESC LIMIT 1')).rows[0] || null;
    },
  };
}

function createHttpClients({ env = process.env, fetchImpl = global.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch_required');
  const config = providerConfig(env);
  async function jsonRequest(url, options = {}) {
    const response = await fetchImpl(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(`provider_request_failed_${response.status}`);
      error.statusCode = 502;
      throw error;
    }
    return data;
  }
  function ghl(path, { method = 'GET', body, version = '2021-07-28' } = {}) {
    return jsonRequest(`https://services.leadconnectorhq.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.ghlToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Version: version,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  function telegram(method, body = {}) {
    return jsonRequest(`https://api.telegram.org/bot${config.telegramToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  async function transcribeTelegramVoice(fileId) {
    if (!config.voiceEnabled || !config.openAiKey) throw new Error('protected_voice_transcription_gate_absent');
    const file = await telegram('getFile', { file_id: fileId });
    const filePath = String(file.result?.file_path || '');
    if (!filePath) throw new Error('telegram_voice_file_missing');
    const audioResponse = await fetchImpl(`https://api.telegram.org/file/bot${config.telegramToken}/${filePath}`);
    if (!audioResponse.ok) throw new Error('telegram_voice_download_failed');
    const contentLength = Number(audioResponse.headers?.get?.('content-length') || 0);
    if (contentLength > 10 * 1024 * 1024) throw new Error('telegram_voice_too_large');
    const audioBlob = await audioResponse.blob();
    if (audioBlob.size > 10 * 1024 * 1024) throw new Error('telegram_voice_too_large');
    const form = new FormData();
    form.append('model', 'gpt-4o-mini-transcribe');
    form.append('file', audioBlob, 'rabbi-voice.ogg');
    const transcriptResponse = await fetchImpl('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.openAiKey}` },
      body: form,
    });
    const transcript = await transcriptResponse.json().catch(() => ({}));
    if (!transcriptResponse.ok || !String(transcript.text || '').trim()) throw new Error('protected_voice_transcription_failed');
    return String(transcript.text).trim().slice(0, 12000);
  }
  return { config, ghl, telegram, jsonRequest, transcribeTelegramVoice };
}

function safeQuestionView(row = {}) {
  return {
    question_ref: row.question_ref,
    title: row.title || 'Synthetic Torah question',
    status: row.status || 'assigned',
    synthetic: row.synthetic === true,
    draft_saved: Boolean(row.draft_sha256),
    draft_fingerprint: row.draft_sha256 ? `sha256:${String(row.draft_sha256).slice(0, 16)}` : '',
    audit_id: row.audit_id || '',
    provider_ids_exposed: false,
    customer_content_included: false,
  };
}

function createOneTimeRabbiProviderAdapter({ repository, env = process.env, fetchImpl = global.fetch } = {}) {
  if (!repository) throw new Error('rabbi_repository_required');
  const http = createHttpClients({ env, fetchImpl });
  const { config } = http;
  async function requireSyntheticQuestion(questionRef) {
    const row = await repository.getQuestion(questionRef);
    if (!row || row.synthetic !== true || row.contact_id !== config.syntheticContactId) throw new Error('synthetic_torah_question_not_found');
    return row;
  }
  return {
    adapter_key: 'one_time_rabbi_telegram_ghl',
    mode: 'private_canary_ready',
    async discoverSyntheticQuestion({ createIfMissing = false } = {}) {
      const pipelines = await http.ghl(`/opportunities/pipelines?locationId=${encodeURIComponent(config.ghlLocationId)}`);
      const pipeline = (pipelines.pipelines || []).find((item) => /torah questions/i.test(String(item.name || '')));
      if (!pipeline) throw new Error('one_time_torah_questions_pipeline_not_found');
      const stage = (pipeline.stages || []).find((item) => /assigned to rabbi/i.test(String(item.name || ''))) || pipeline.stages?.[0];
      if (!stage) throw new Error('torah_question_assigned_stage_not_found');
      const query = new URLSearchParams({ location_id: config.ghlLocationId, contact_id: config.syntheticContactId, pipeline_id: pipeline.id });
      const found = await http.ghl(`/opportunities/search?${query}`);
      let opportunity = (found.opportunities || []).find((item) => String(item.name || '').startsWith('[SYNTHETIC]'));
      if (!opportunity && createIfMissing) {
        const created = await http.ghl('/opportunities/', {
          method: 'POST',
          body: {
            pipelineId: pipeline.id,
            locationId: config.ghlLocationId,
            name: '[SYNTHETIC] OT-LAUNCH-01 Torah Question',
            pipelineStageId: stage.id,
            status: 'open',
            contactId: config.syntheticContactId,
            monetaryValue: 0,
          },
        });
        opportunity = created.opportunity;
      }
      if (!opportunity) return null;
      const questionRef = `TQ-${sha256(opportunity.id).slice(0, 12)}`;
      const auditId = `RTA-${sha256(`${questionRef}:discover`).slice(0, 16)}`;
      return repository.upsertQuestion({
        question_ref: questionRef,
        opportunity_id: opportunity.id,
        contact_id: config.syntheticContactId,
        pipeline_id: pipeline.id,
        stage_id: opportunity.pipelineStageId || stage.id,
        title: 'Synthetic Torah question',
        status: 'assigned',
        audit_id: auditId,
      });
    },
    async listAssignedQuestions() {
      return (await repository.listQuestions()).map(safeQuestionView);
    },
    async openQuestion(questionRef) {
      return safeQuestionView(await requireSyntheticQuestion(questionRef));
    },
    async saveDraft(questionRef, payload = {}) {
      const row = await requireSyntheticQuestion(questionRef);
      const input = normalizeRabbiAnswerInput(payload);
      if (!input.text) throw new Error('protected_voice_transcription_required');
      const draftHash = sha256(input.text);
      if (row.draft_sha256 === draftHash && row.draft_note_id) {
        await http.ghl(`/contacts/${encodeURIComponent(row.contact_id)}/notes/${encodeURIComponent(row.draft_note_id)}`);
        return { question: safeQuestionView(row), status: 'idempotent_readback', send_performed: false, customer_message_sent: false, local_customer_transcript_created: false };
      }
      const auditId = `RTA-${sha256(`${questionRef}:${draftHash}`).slice(0, 16)}`;
      const noteBody = `[SYNTHETIC TORAH DRAFT][${questionRef}][${auditId}]\n${input.text}`;
      const created = await http.ghl(`/contacts/${encodeURIComponent(row.contact_id)}/notes`, { method: 'POST', body: { body: noteBody } });
      const noteId = created.note?.id || created.id;
      if (!noteId) throw new Error('ghl_draft_note_id_missing');
      const readback = await http.ghl(`/contacts/${encodeURIComponent(row.contact_id)}/notes/${encodeURIComponent(noteId)}`);
      if (!readback.note && !readback.id) throw new Error('ghl_draft_readback_failed');
      const saved = await repository.saveDraftRef(questionRef, { noteId, draftSha256: draftHash, auditId });
      await repository.recordAudit({ audit_id: auditId, event_type: 'draft_saved_readback', outcome: 'pass', question_ref: questionRef, safe_details: { synthetic: true, draft_fingerprint: `sha256:${draftHash.slice(0, 16)}`, customer_messages_sent: 0, second_transcript_created: false } });
      return { question: safeQuestionView(saved), status: 'saved_readback', audit_id: auditId, send_performed: false, customer_message_sent: false, local_customer_transcript_created: false };
    },
    async saveVoiceDraft(questionRef, voice = {}) {
      await requireSyntheticQuestion(questionRef);
      if (!config.voiceEnabled || !config.openAiKey) throw new Error('protected_voice_transcription_gate_absent');
      if (Number(voice.duration || voice.duration_seconds || 0) > 120) throw new Error('telegram_voice_too_long');
      const transcript = await http.transcribeTelegramVoice(String(voice.file_id || ''));
      const result = await this.saveDraft(questionRef, { text: transcript });
      return { ...result, input_mode: 'voice_transcribed', raw_audio_stored: false };
    },
    async previewDraft(questionRef) {
      const row = await requireSyntheticQuestion(questionRef);
      if (!row.draft_sha256) throw new Error('draft_not_found');
      return { question: safeQuestionView(row), channel: 'ghl_conversations', send_performed: false, customer_message_sent: false, local_customer_transcript_created: false };
    },
    async sendConfirmedAnswer() {
      throw new Error('customer_send_disabled_for_followup');
    },
    async returnToShloimie(questionRef) {
      await requireSyntheticQuestion(questionRef);
      return { question_ref: questionRef, status: 'return_to_shloimie_preview', send_performed: false };
    },
    async closeQuestion(questionRef) {
      await requireSyntheticQuestion(questionRef);
      return { question_ref: questionRef, status: 'close_preview', send_performed: false };
    },
    async draftTorahNewsletter() { return { status: 'draft_only', bulk_send_allowed: false, send_performed: false }; },
    async draftWarmEnrollmentEmail() { return { status: 'draft_only', bulk_send_allowed: false, send_performed: false }; },
    async sendOperatorMessage(text) {
      return http.telegram('sendMessage', { chat_id: config.telegramChatId, text: String(text || '').slice(0, 3000), disable_web_page_preview: true });
    },
  };
}

async function handleTelegramWebhook({ update, headers = {}, repository, adapter, env = process.env, nowMs = Date.now() } = {}) {
  const config = providerConfig(env);
  if (!timingSafeEqual(headers['x-telegram-bot-api-secret-token'] || headers['X-Telegram-Bot-Api-Secret-Token'], config.webhookSecret)) {
    const error = new Error('telegram_webhook_signature_invalid');
    error.statusCode = 401;
    throw error;
  }
  if (!config.consumerEnabled) throw new Error('telegram_consumer_disabled');
  if (!await repository.claimConsumer(config.ownerRef)) {
    const error = new Error('telegram_consumer_lease_held');
    error.statusCode = 503;
    throw error;
  }
  const updateId = Number(update?.update_id);
  const message = update?.message;
  if (!Number.isSafeInteger(updateId) || !message) throw new Error('telegram_update_invalid');
  if (message.chat?.type !== 'private' || String(message.chat?.id || '') !== config.telegramChatId) {
    const error = new Error('telegram_private_chat_not_allowed');
    error.statusCode = 403;
    throw error;
  }
  if (!Number.isFinite(Number(message.date)) || Math.abs(nowMs - Number(message.date) * 1000) > 5 * 60 * 1000) {
    const error = new Error('telegram_update_replay_window_rejected');
    error.statusCode = 409;
    throw error;
  }
  const actorFingerprint = fingerprint(String(message.chat.id), 'telegram-actor');
  const updateFingerprint = fingerprint(JSON.stringify({ update_id: updateId, message_id: message.message_id, date: message.date }), 'telegram-update');
  const auditId = `RTA-${sha256(`${updateId}:${updateFingerprint}`).slice(0, 16)}`;
  const eventType = message.voice ? 'voice' : 'text';
  if (!await repository.claimUpdate({ updateId, updateFingerprint, actorFingerprint, eventType, auditId })) {
    return { success: true, accepted: false, outcome: 'duplicate_replay_rejected', audit_id: auditId, customer_messages_sent: 0 };
  }
  const text = String(message.text || '').trim();
  let outcome = 'ignored';
  if (/^\/questions\b/i.test(text)) {
    const rows = await adapter.listAssignedQuestions();
    await adapter.sendOperatorMessage(rows.length ? rows.map((row) => `${row.question_ref} — ${row.status}`).join('\n') : 'No assigned synthetic Torah questions.');
    outcome = 'listed';
  } else if (/^\/open\s+/i.test(text)) {
    const questionRef = text.replace(/^\/open\s+/i, '').trim();
    const question = await adapter.openQuestion(questionRef);
    await repository.setSelectedQuestion(actorFingerprint, question.question_ref);
    await adapter.sendOperatorMessage(`${question.question_ref} — ${question.status}. Synthetic record; customer content is not mirrored here.`);
    outcome = 'opened';
  } else if (/^\/preview\b/i.test(text)) {
    const questionRef = await repository.selectedQuestion(actorFingerprint);
    const preview = await adapter.previewDraft(questionRef);
    await adapter.sendOperatorMessage(`${preview.question.question_ref} draft is saved and ready for explicit confirmation. No message sent.`);
    outcome = 'previewed';
  } else if (/^\/save\s+/i.test(text)) {
    const questionRef = await repository.selectedQuestion(actorFingerprint);
    await adapter.saveDraft(questionRef, { text: text.replace(/^\/save\s+/i, '') });
    await adapter.sendOperatorMessage(`${questionRef} draft saved to the canonical synthetic GHL record and read back. No message sent.`);
    outcome = 'draft_saved';
  } else if (message.voice) {
    const questionRef = await repository.selectedQuestion(actorFingerprint);
    if (config.voiceEnabled && config.openAiKey && questionRef) {
      await adapter.saveVoiceDraft(questionRef, message.voice);
      await adapter.sendOperatorMessage(`${questionRef} voice was transcribed, saved to the canonical synthetic GHL record, and read back. Raw audio was not stored; no message sent.`);
      outcome = 'voice_draft_saved';
    } else {
      outcome = 'voice_received_transcription_gate_required';
      await adapter.sendOperatorMessage('Voice received. Protected transcription and a selected synthetic question are required before the draft can be saved.');
    }
  }
  await repository.recordAudit({ audit_id: auditId, event_type: `telegram_${eventType}`, outcome, actor_fingerprint: actorFingerprint, safe_details: { update_fingerprint: updateFingerprint, customer_messages_sent: 0, content_logged: false } });
  return { success: true, accepted: true, outcome, audit_id: auditId, customer_messages_sent: 0 };
}

module.exports = {
  RABBI_PROVIDER_SCHEMA_SQL,
  createHttpClients,
  createOneTimeRabbiProviderAdapter,
  createPostgresRabbiRepository,
  fingerprint,
  handleTelegramWebhook,
  providerConfig,
  providerReadiness,
  safeQuestionView,
  sha256,
  timingSafeEqual,
};
