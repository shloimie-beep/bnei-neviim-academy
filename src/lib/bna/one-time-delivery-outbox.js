const {
  buildOneTimeClassReminderMessage,
  buildOneTimeSignupConfirmationEmail,
  nextOneTimeClassSchedule,
} = require('./one-time-signup-workflow');

const ONE_TIME_OUTBOX_CHANNEL_KEYS = Object.freeze([
  'email:one_time_signup_confirmation',
  'whatsapp:one_time_signup_confirmation',
  'telegram:one_time_rabbi_operator',
  'email:one_time_class_reminder',
  'whatsapp:one_time_class_reminder',
]);

const ONE_TIME_OUTBOX_MAX_ATTEMPTS = 5;

function compact(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizePhoneDigits(value = '') {
  return String(value || '').replace(/\D+/g, '');
}

function parsePayload(value = {}) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isOneTimeOutboxChannel(channelKey = '') {
  return ONE_TIME_OUTBOX_CHANNEL_KEYS.includes(String(channelKey || '').trim());
}

function outboxChannelTransport(channelKey = '') {
  const key = String(channelKey || '').trim();
  if (key.startsWith('email:')) return 'email';
  if (key.startsWith('whatsapp:')) return 'whatsapp';
  if (key.startsWith('telegram:')) return 'telegram';
  return '';
}

function outboxMessageKind(channelKey = '') {
  const key = String(channelKey || '').trim();
  if (key.endsWith('one_time_signup_confirmation')) return 'signup_confirmation';
  if (key.endsWith('one_time_class_reminder')) return 'class_reminder';
  if (key === 'telegram:one_time_rabbi_operator') return 'rabbi_signup_alert';
  return '';
}

function cityFromPayload(payload = {}, contact = {}) {
  const city = payload.city && typeof payload.city === 'object' && !Array.isArray(payload.city)
    ? payload.city
    : null;
  const metadata = contact.metadata && typeof contact.metadata === 'object' && !Array.isArray(contact.metadata)
    ? contact.metadata
    : {};
  const metadataCity = metadata.city && typeof metadata.city === 'object' && !Array.isArray(metadata.city)
    ? metadata.city
    : null;
  const selected = city || metadataCity;
  if (!selected?.timezone) return null;
  return {
    id: selected.id || '',
    label: selected.label || selected.name || selected.city || '',
    city: selected.city || selected.name || '',
    name: selected.name || selected.city || '',
    region: selected.region || '',
    country: selected.country || '',
    country_code: selected.country_code || selected.countryCode || '',
    timezone: selected.timezone,
  };
}

function classInstantFromPayload(payload = {}, now = new Date()) {
  const raw = payload.class_instant_iso || payload.classInstantIso || '';
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return nextOneTimeClassSchedule({ now }).class_instant;
}

function emailRecipientForOutbox(contact = {}) {
  return normalizeEmail(contact.parent_email || contact.email || contact.to_email || '');
}

function phoneRecipientForOutbox(contact = {}) {
  return normalizePhoneDigits(contact.parent_whatsapp || contact.parent_phone || contact.phone || contact.whatsapp || '');
}

function assertSafeClassJoinUrl(classJoinUrl = '') {
  const link = compact(classJoinUrl);
  if (!/^https:\/\//i.test(link)) {
    const error = new Error('Current One Time class join link is not configured.');
    error.code = 'one_time_class_join_link_missing';
    error.retryable = true;
    throw error;
  }
  return link;
}

function assertTelegramTextDoesNotExposeClassLink(text = '', classJoinUrl = '') {
  const body = String(text || '');
  const link = compact(classJoinUrl);
  if ((link && body.includes(link)) || /zoom\.us|join\s+zoom|current\s+class\s+link/i.test(body)) {
    const error = new Error('One Time Rabbi Telegram alert must not include the class join link.');
    error.code = 'telegram_zoom_link_blocked';
    error.retryable = false;
    throw error;
  }
}

function htmlFromText(text = '') {
  return String(text || '')
    .split('\n')
    .map((line) => line
      ? line.replace(/[&<>"]/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
        }[char]))
      : '')
    .join('<br>');
}

function redactPublicError(value = '') {
  return compact(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/https?:\/\/\S+/gi, '[url]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[phone]')
    .slice(0, 240);
}

function buildOneTimeOutboxDeliveryRequest({
  outboxRow = {},
  contact = {},
  classJoinUrl = '',
  now = new Date(),
} = {}) {
  const payload = parsePayload(outboxRow.payload);
  const channelKey = compact(outboxRow.channel_key);
  if (!isOneTimeOutboxChannel(channelKey)) {
    const error = new Error(`Unsupported One Time outbox channel: ${channelKey || 'missing'}`);
    error.code = 'unsupported_one_time_outbox_channel';
    error.retryable = false;
    throw error;
  }
  const transport = outboxChannelTransport(channelKey);
  const kind = outboxMessageKind(channelKey);
  const classLink = transport === 'telegram' ? compact(classJoinUrl) : assertSafeClassJoinUrl(classJoinUrl);
  const city = cityFromPayload(payload, contact);
  const classInstant = classInstantFromPayload(payload, now);
  const contactName = compact(contact.parent_name || contact.contact_name || payload.contact_name || '');
  const reminderPreference = payload.reminder_preference || contact.metadata?.reminder_preference || 'none';

  if (transport === 'email') {
    const to = emailRecipientForOutbox(contact);
    if (!to) {
      const error = new Error('Email recipient is missing for One Time outbox delivery.');
      error.code = 'missing_email_recipient';
      error.retryable = false;
      throw error;
    }
    if (kind === 'signup_confirmation') {
      const email = buildOneTimeSignupConfirmationEmail({
        contactName,
        city,
        classInstant,
        zoomJoinUrl: classLink,
        reminderPreference,
      });
      return {
        transport,
        kind,
        provider: 'resend',
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      };
    }
    const text = buildOneTimeClassReminderMessage({ city, classInstant, zoomJoinUrl: classLink });
    return {
      transport,
      kind,
      provider: 'resend',
      to,
      subject: "Rabbi Scheller's Mishnah class starts in 30 minutes",
      text,
      html: htmlFromText(text),
    };
  }

  if (transport === 'whatsapp') {
    const to = phoneRecipientForOutbox(contact);
    if (!to) {
      const error = new Error('WhatsApp recipient is missing for One Time outbox delivery.');
      error.code = 'missing_whatsapp_recipient';
      error.retryable = false;
      throw error;
    }
    const text = kind === 'signup_confirmation'
      ? buildOneTimeSignupConfirmationEmail({
          contactName,
          city,
          classInstant,
          zoomJoinUrl: classLink,
          reminderPreference,
        }).text
      : buildOneTimeClassReminderMessage({ city, classInstant, zoomJoinUrl: classLink });
    return {
      transport,
      kind,
      provider: 'one_time_wapi',
      to,
      text,
    };
  }

  const text = compact(payload.text || payload.body || payload.message || '');
  assertTelegramTextDoesNotExposeClassLink(text, classLink);
  if (!text) {
    const error = new Error('Telegram alert text is missing for One Time outbox delivery.');
    error.code = 'missing_telegram_alert_text';
    error.retryable = false;
    throw error;
  }
  return {
    transport,
    kind,
    provider: 'one_time_rabbi_telegram',
    role_alias: payload.role_alias || 'one_time_rabbi_operator',
    text,
  };
}

function nextRetryAt({ now = new Date(), attempts = 0 } = {}) {
  const base = now instanceof Date ? now : new Date(now);
  const minutes = Math.min(60, Math.max(1, 2 ** Math.max(0, Number(attempts || 0))) * 5);
  return new Date(base.getTime() + minutes * 60 * 1000).toISOString();
}

function failedOutboxStatus({ attempts = 0, maxAttempts = ONE_TIME_OUTBOX_MAX_ATTEMPTS } = {}) {
  return Number(attempts || 0) >= Number(maxAttempts || ONE_TIME_OUTBOX_MAX_ATTEMPTS)
    ? 'dead_lettered'
    : 'failed';
}

function publicOutboxDeliveryResult({
  outboxRow = {},
  request = {},
  status = '',
  providerResult = {},
  error = null,
  attempts = null,
  nextAttemptAt = null,
} = {}) {
  return {
    outbox_id: outboxRow.id ? Number(outboxRow.id) : null,
    delivery_key: outboxRow.delivery_key || null,
    channel_key: outboxRow.channel_key || null,
    transport: request.transport || outboxChannelTransport(outboxRow.channel_key),
    message_kind: request.kind || outboxMessageKind(outboxRow.channel_key),
    status,
    attempts,
    next_attempt_at: nextAttemptAt || null,
    provider: request.provider || null,
    provider_message_id: providerResult?.data?.id || providerResult?.message_id || providerResult?.id || null,
    error: error ? redactPublicError(error.message || String(error)) : null,
    raw_join_url_returned: false,
    message_body_returned: false,
  };
}

module.exports = {
  ONE_TIME_OUTBOX_CHANNEL_KEYS,
  ONE_TIME_OUTBOX_MAX_ATTEMPTS,
  buildOneTimeOutboxDeliveryRequest,
  failedOutboxStatus,
  isOneTimeOutboxChannel,
  nextRetryAt,
  outboxChannelTransport,
  outboxMessageKind,
  publicOutboxDeliveryResult,
};
