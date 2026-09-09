const LIFE_SKILLS_WAPI_REPLY_COPY_VERSION = '2026-09-09-launch-v1';
const LIFE_SKILLS_WAPI_REPLY_HE = 'שלום! איך אפשר לעזור?';
const LIFE_SKILLS_WAPI_REPLY_EN = 'Hi! How can I help?';
const LIFE_SKILLS_WAPI_REPLY_CONFIRM = 'APPROVE_LIFE_SKILLS_WAPI_AUTO_REPLY';

function truthy(value) {
  return /^(?:1|true|yes|live|enabled)$/i.test(String(value || '').trim());
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function lifeSkillsWapiReplyLanguage(messageText = '') {
  return /[\u0590-\u05ff]/.test(String(messageText || '')) ? 'he' : 'en';
}

function lifeSkillsWapiReplyBody(messageText = '', options = {}) {
  const language = lifeSkillsWapiReplyLanguage(messageText);
  return language === 'he'
    ? String(options.hebrew || LIFE_SKILLS_WAPI_REPLY_HE).trim()
    : String(options.english || LIFE_SKILLS_WAPI_REPLY_EN).trim();
}

function buildLifeSkillsWapiReplyReadiness({
  env = {},
  tokenPresent = false,
  webhookSecretPresent = false,
  oneTimeScope = false,
} = {}) {
  const enabled = truthy(env.LIFE_SKILLS_WAPI_AUTO_REPLY_ENABLED);
  const approved = String(env.LIFE_SKILLS_WAPI_AUTO_REPLY_CONFIRM || '').trim() === LIFE_SKILLS_WAPI_REPLY_CONFIRM;
  const senderDigits = normalizeDigits(
    env.LIFE_SKILLS_WHAPI_PHONE ||
    env.LIFE_SKILLS_WAPI_PHONE ||
    env.WHAPI_PHONE ||
    env.WAPI_PHONE ||
    env.BNA_WHATSAPP_NUMBER ||
    ''
  );
  const requiredSenderDigits = normalizeDigits(env.LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS || '972534932631');
  const channelId = String(env.LIFE_SKILLS_WHAPI_CHANNEL_ID || env.WHAPI_CHANNEL_ID || '').trim();
  const senderBound = Boolean(senderDigits && requiredSenderDigits && senderDigits === requiredSenderDigits);
  const blockers = [];
  if (oneTimeScope) blockers.push('one_time_scope_uses_separate_responder');
  if (!enabled) blockers.push('LIFE_SKILLS_WAPI_AUTO_REPLY_ENABLED not enabled');
  if (!approved) blockers.push(`LIFE_SKILLS_WAPI_AUTO_REPLY_CONFIRM must equal ${LIFE_SKILLS_WAPI_REPLY_CONFIRM}`);
  if (!tokenPresent) blockers.push('WAPI_API_TOKEN or WHAPI_API_TOKEN missing');
  if (!webhookSecretPresent) blockers.push('WAPI_WEBHOOK_SECRET missing');
  if (!channelId) blockers.push('WHAPI_CHANNEL_ID missing');
  if (!senderBound) blockers.push('WHAPI_PHONE does not match the approved Life Skills business number');
  return {
    ready: blockers.length === 0,
    blockers,
    enabled,
    approved,
    channel_id: channelId,
    sender_bound: senderBound,
    required_sender_digits: requiredSenderDigits,
    copy_version: LIFE_SKILLS_WAPI_REPLY_COPY_VERSION,
  };
}

function lifeSkillsWapiReplyInboundBlockers(normalized = {}, readiness = {}) {
  const blockers = [...(readiness.blockers || [])];
  const chatId = String(normalized.chatId || '').trim();
  if (normalized.fromMe) blockers.push('inbound_only_outbound_from_me');
  if (String(normalized.messageStatus || '').trim()) blockers.push('delivery_status_event_not_customer_message');
  if (!String(normalized.messageText || '').trim() && !normalized.hasMedia) blockers.push('no_inbound_message_content');
  if (/@g\.us$|@newsletter$|@broadcast$/i.test(chatId)) blockers.push('group_broadcast_or_newsletter_not_supported');
  if (readiness.channel_id && normalized.channelId && String(normalized.channelId).trim() !== readiness.channel_id) {
    blockers.push('provider_channel_mismatch');
  }
  return [...new Set(blockers)];
}

module.exports = {
  LIFE_SKILLS_WAPI_REPLY_CONFIRM,
  LIFE_SKILLS_WAPI_REPLY_COPY_VERSION,
  LIFE_SKILLS_WAPI_REPLY_EN,
  LIFE_SKILLS_WAPI_REPLY_HE,
  buildLifeSkillsWapiReplyReadiness,
  lifeSkillsWapiReplyBody,
  lifeSkillsWapiReplyInboundBlockers,
  lifeSkillsWapiReplyLanguage,
  normalizeDigits,
};
