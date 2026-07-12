'use strict';

// Transport-only contract starter. This module must not resolve roles/scopes,
// plan actions, call LLMs, or execute domain behavior.

const FORBIDDEN_AUTHORITY_FIELDS = new Set([
  'actor', 'actor_role', 'role', 'role_key', 'approved', 'approval',
  'workspace', 'workspace_key', 'project', 'project_key', 'scope',
  'dry_run', 'execute', 'permissions', 'capabilities',
]);

function compactText(value, max = 12000) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, max);
}

function assertNoAuthorityFields(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_FIELDS.has(String(key).toLowerCase())) {
      const error = new Error(`transport_authority_field_forbidden:${path}.${key}`);
      error.code = 'TRANSPORT_AUTHORITY_FIELD_FORBIDDEN';
      throw error;
    }
    if (nested && typeof nested === 'object') assertNoAuthorityFields(nested, `${path}.${key}`);
  }
}

function normalizeTelegramUpdateToEnvelope(update, context = {}) {
  if (!update || typeof update !== 'object') throw new TypeError('Telegram update is required');
  const message = update.message || update.edited_message || null;
  const callback = update.callback_query || null;
  const chat = message?.chat || callback?.message?.chat || {};
  const from = message?.from || callback?.from || {};
  const providerUpdateId = String(update.update_id ?? '').trim();
  if (!providerUpdateId) throw new Error('telegram_update_id_required');
  if (!context.channelInstanceKey) throw new Error('channel_instance_key_required');
  if (!context.externalUserHmac || !context.externalChatHmac) throw new Error('external_identity_hmacs_required');
  if (String(chat.type || 'unknown') !== 'private' && context.requirePrivateChat !== false) {
    const error = new Error('private_chat_required');
    error.code = 'PRIVATE_CHAT_REQUIRED';
    throw error;
  }

  const eventType = callback ? 'callback_query' : message ? 'message' : 'unsupported';
  const envelope = {
    channel_instance_key: String(context.channelInstanceKey),
    provider_update_id: providerUpdateId,
    provider_message_id: String(message?.message_id ?? callback?.message?.message_id ?? ''),
    event_type: eventType,
    external_user_hmac: String(context.externalUserHmac),
    external_chat_hmac: String(context.externalChatHmac),
    chat_type: String(chat.type || 'unknown'),
    locale_hint: String(from.language_code || context.locale || 'en').toLowerCase().startsWith('he') ? 'he' : 'en',
    text: compactText(message?.text || message?.caption || '', 12000),
    reply_to_provider_message_id: message?.reply_to_message?.message_id == null ? null : String(message.reply_to_message.message_id),
    callback_token: callback ? compactText(callback.data, 512) : null,
    attachments: [],
    client_metadata: {
      has_message: Boolean(message),
      has_callback: Boolean(callback),
      has_media: Boolean(message && !message.text && (message.document || message.photo || message.video || message.audio || message.voice)),
    },
  };
  assertNoAuthorityFields(envelope);
  return Object.freeze(envelope);
}

function assertResultRenderable(result) {
  if (!result || typeof result !== 'object') throw new TypeError('Capability result is required');
  if (!result.capability_id || !result.status) throw new Error('invalid_capability_result');
  if (result.status === 'succeeded' && result.executed && !result.audit_event_id) {
    throw new Error('executed_result_missing_audit_event');
  }
  return result;
}

function renderTelegramResult(result, options = {}) {
  assertResultRenderable(result);
  const language = options.language === 'he' ? 'he' : 'en';
  if (result.status === 'denied') {
    return { text: language === 'he' ? 'אין הרשאה לבצע את הפעולה בהיקף הזה.' : 'That action is not available in this scope.', buttons: [] };
  }
  if (result.status === 'blocked') {
    return { text: compactText(result.data?.message || (language === 'he' ? 'הפעולה חסומה כרגע.' : 'That capability is currently blocked.'), 4000), buttons: [] };
  }
  if (result.status === 'preview_ready' || result.status === 'approval_pending') {
    return {
      text: compactText(result.preview?.display_text || result.data?.message || 'Review this action before continuing.', 4000),
      buttons: [
        { label: language === 'he' ? 'אישור חד-פעמי' : 'Approve once', token: result.approval?.callback_token },
        { label: language === 'he' ? 'עריכה' : 'Edit', token: result.approval?.edit_token },
        { label: language === 'he' ? 'ביטול' : 'Cancel', token: result.approval?.cancel_token },
      ].filter((button) => button.token),
    };
  }
  return {
    text: compactText(result.data?.display_text || result.data?.message || result.summary || '', 4000),
    buttons: Array.isArray(result.data?.buttons) ? result.data.buttons.slice(0, 20) : [],
  };
}

module.exports = {
  FORBIDDEN_AUTHORITY_FIELDS,
  assertNoAuthorityFields,
  assertResultRenderable,
  normalizeTelegramUpdateToEnvelope,
  renderTelegramResult,
};
