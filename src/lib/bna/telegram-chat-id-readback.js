const { previewMessage, redactText } = require('./helper/redaction');

function maskIdentifier(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const sign = text.startsWith('-') ? '-' : '';
  const body = sign ? text.slice(1) : text;
  if (body.length <= 4) return `${sign}${'*'.repeat(body.length)}`;
  return `${sign}${'*'.repeat(Math.max(0, body.length - 4))}${body.slice(-4)}`;
}

function messageKind(message = {}) {
  const text = String(message.text || '').trim();
  if (!text) return 'non_text';
  if (/^\/start(?:\s|$)/i.test(text)) return 'start_command';
  if (text.startsWith('/')) return 'command';
  return 'text';
}

function compactIdentity(chat = {}) {
  return {
    type: chat.type || '',
    username: chat.username || '',
    first_name: chat.first_name || '',
    last_name: chat.last_name || '',
    title: chat.title || '',
  };
}

function candidateFromMessage(update = {}, message = {}, source = 'message', { includeTextPreview = false } = {}) {
  const chat = message.chat || {};
  const chatId = String(chat.id || '').trim();
  if (!chatId) return null;
  const candidate = {
    update_id: update.update_id,
    source,
    chat_id: chatId,
    chat_id_masked: maskIdentifier(chatId),
    chat: compactIdentity(chat),
    message_id: message.message_id || null,
    message_date: message.date ? new Date(Number(message.date) * 1000).toISOString() : '',
    text_kind: messageKind(message),
  };
  if (includeTextPreview && message.text) {
    candidate.text_preview = previewMessage(redactText(String(message.text)), 120);
  }
  return candidate;
}

function extractTelegramChatCandidates(updates = [], options = {}) {
  const candidates = [];
  for (const update of Array.isArray(updates) ? updates : []) {
    const directSources = [
      ['message', update.message],
      ['edited_message', update.edited_message],
      ['channel_post', update.channel_post],
      ['edited_channel_post', update.edited_channel_post],
    ];
    for (const [source, message] of directSources) {
      const candidate = candidateFromMessage(update, message, source, options);
      if (candidate) candidates.push(candidate);
    }
    const callbackMessage = update.callback_query?.message;
    const callbackCandidate = candidateFromMessage(update, callbackMessage, 'callback_query.message', options);
    if (callbackCandidate) candidates.push(callbackCandidate);
  }
  return candidates;
}

function redactChatIdCandidates(candidates = []) {
  return candidates.map((candidate) => {
    const {
      chat_id: _chatId,
      ...safeCandidate
    } = candidate || {};
    return safeCandidate;
  });
}

function summarizeChatIdReadback(candidates = []) {
  const uniqueChats = new Set(candidates.map((candidate) => String(candidate.chat_id || '')).filter(Boolean));
  const startCommands = candidates.filter((candidate) => candidate.text_kind === 'start_command').length;
  return {
    candidate_count: candidates.length,
    unique_chat_count: uniqueChats.size,
    start_command_count: startCommands,
    has_candidates: candidates.length > 0,
  };
}

module.exports = {
  extractTelegramChatCandidates,
  maskIdentifier,
  redactChatIdCandidates,
  summarizeChatIdReadback,
};
