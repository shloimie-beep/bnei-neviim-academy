'use strict';
const { createHash } = require('node:crypto');
const VERSION = 'BNA-INTEREST-ACK-20261105-v1';
const CHANNEL = 'email:bna_interest_confirmation';
const TEMPLATES = Object.freeze({
  en: { subject: 'Thanks for your interest in Bnei Neviim Academy', body: 'Thanks for getting in touch. I’ve received your interest form, and I’ll be in touch personally to hear more about your son and what you’re looking for.', signature: 'Shloimie' },
  he: { subject: 'תודה על ההתעניינות בבני נביאים', body: 'תודה שפניתם. קיבלתי את טופס ההתעניינות שלכם, ואצור אתכם קשר באופן אישי כדי לשמוע יותר על הבן שלכם ועל מה שאתם מחפשים.', signature: 'שלומי' },
});
function draftEmail(language = 'en', reliableFirstName = '') {
  const locale = language === 'he' ? 'he' : 'en', template = TEMPLATES[locale];
  const name = typeof reliableFirstName === 'string' && /^[\p{L}\p{M}][\p{L}\p{M}'’-]{0,59}$/u.test(reliableFirstName) ? reliableFirstName : '';
  const greeting = locale === 'he' ? (name ? `שלום ${name},` : 'שלום,') : (name ? `Hi ${name},` : 'Hi,');
  const text = `${greeting}\n\n${template.body}\n\n${template.signature}`;
  return { version: VERSION, language: locale, subject: template.subject, text, templateHash: createHash('sha256').update(JSON.stringify({ version: VERSION, locale, subject: template.subject, text })).digest('hex') };
}
// A transport error after dispatch can mean acceptance with a lost response.
// Such outcomes are parked for reconciliation, never retried automatically.
async function dispatchAcknowledgement({ db, outboxId, send, approval }) {
  if (!approval?.approved || approval.version !== VERSION || !approval.sender || !approval.replyTo) return { state: 'draft', sent: false };
  const claimed = (await db.query(`UPDATE assistant_delivery_outbox SET status='sending', attempts=attempts+1, updated_at=NOW(), payload=payload || '{"delivery_state":"sending"}'::jsonb
    WHERE id=$1 AND channel_key=$2 AND status='queued' AND payload->>'workspace_key'='bna' RETURNING *`, [outboxId, CHANNEL])).rows[0];
  if (!claimed) return { state: 'not_claimed', sent: false };
  const message = claimed.payload.message;
  if (message.version !== VERSION || !approval.templateHashes?.includes(message.templateHash)) {
    await db.query(`UPDATE assistant_delivery_outbox SET status='cancelled', payload=payload || '{"delivery_state":"draft"}'::jsonb, updated_at=NOW() WHERE id=$1`, [outboxId]);
    return { state: 'draft', sent: false };
  }
  try {
    const result = await send({ to: claimed.payload.to, from: approval.sender, replyTo: approval.replyTo, subject: message.subject, text: message.text, idempotencyKey: claimed.idempotency_key });
    if (!result?.id) throw new Error('PROVIDER_RESULT_UNKNOWN');
    await db.query(`UPDATE assistant_delivery_outbox SET status='sent', sent_at=NOW(), updated_at=NOW(), payload=payload || $2::jsonb WHERE id=$1`, [outboxId, JSON.stringify({ delivery_state: 'provider_accepted', provider: result.provider, provider_id: result.id })]);
    return { state: 'provider_accepted', sent: true };
  } catch (error) {
    const state = error?.definitelyNotSent === true ? 'failed' : 'unknown';
    await db.query(`UPDATE assistant_delivery_outbox SET status=$2, last_error=$3, updated_at=NOW(), payload=payload || $4::jsonb WHERE id=$1`, [outboxId, state === 'failed' ? 'failed' : 'sending', state === 'failed' ? 'PROVIDER_REJECTED' : 'PROVIDER_OUTCOME_UNKNOWN', JSON.stringify({ delivery_state: state })]);
    return { state, sent: false };
  }
}
module.exports = { VERSION, CHANNEL, TEMPLATES, draftEmail, dispatchAcknowledgement };
