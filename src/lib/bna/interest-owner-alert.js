'use strict';
const { createHash } = require('node:crypto');
const { problem } = require('./interest-launch');
const VERSION = 'BNA-INTEREST-OWNER-ALERT-20261108-v1';
const CHANNEL = 'email:bna_interest_owner_alert';
const SENDER = 'office@bneineviimacademy.org';
const SUBJECT = 'New BNA interest form received';
const PATTERN = 'A new BNA interest form has been saved.\n\nInterest: {{program}}\nArea: {{area}}\nReference: {{reference}}\n\nSign in to view the request:\nhttps://bneineviimacademy.org/operations';
const PROGRAMS = { pod: 'Learning pod', academy: 'Academy 2027–28', both: 'Both (Learning pod and Academy 2027–28)' };
function recipient(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(email) ? email : '';
}
function draftOwnerAlert({ reference, program, area, to }) {
  const target = recipient(to);
  if (!target || !/^[a-f0-9-]{36}$/i.test(reference || '') || !Object.hasOwn(PROGRAMS, program) || typeof area !== 'string') throw problem('BNA_OWNER_ALERT_INVALID');
  const values = { program: PROGRAMS[program], area: area.replace(/\s+/g, ' ').trim(), reference };
  const text = PATTERN.replace(/\{\{(program|area|reference)\}\}/g, (_, key) => values[key]);
  const templateHash = createHash('sha256').update(JSON.stringify({ version: VERSION, to: target, subject: SUBJECT, pattern: PATTERN })).digest('hex');
  return { version: VERSION, subject: SUBJECT, text, templateHash };
}
async function enqueueOwnerAlert({ db, inquiryId, leadId, fields, to }) {
  const target = recipient(to);
  if (!target) return null; // Unconfigured notification must never prevent inquiry storage.
  const message = draftOwnerAlert({ reference: inquiryId, program: fields.program, area: fields.area, to: target });
  const release = (await db.query('SELECT template_hashes FROM bna_interest_email_releases WHERE version=$1 AND active=true', [VERSION])).rows[0];
  const active = Array.isArray(release?.template_hashes) && release.template_hashes.includes(message.templateHash);
  const key = `bna-interest-owner:${inquiryId}`;
  const payload = { workspace_key: 'bna', project_key: 'bna', lead_id: leadId, inquiry_reference: inquiryId, to: target, summary: { program: fields.program, area: fields.area }, message, delivery_state: active ? 'queued' : 'draft', activation_required: !active };
  return (await db.query(`INSERT INTO assistant_delivery_outbox(delivery_key,channel_key,recipient_identity_key,payload,idempotency_key,status)
    VALUES($1,$2,'bna-owner-alert',$3::jsonb,$1,$4) ON CONFLICT(delivery_key) DO NOTHING RETURNING id`, [key, CHANNEL, JSON.stringify(payload), active ? 'queued' : 'cancelled'])).rows[0] || null;
}
async function dispatchOwnerAlert({ db, outboxId, transport, to, approvedTemplateHashes }) {
  const target = recipient(to);
  if (!target || !Array.isArray(approvedTemplateHashes)) return { state: 'draft', sent: false };
  const row = (await db.query(`UPDATE assistant_delivery_outbox o SET status='sending',attempts=attempts+1,updated_at=NOW(),payload=payload || '{"delivery_state":"sending"}'::jsonb
    WHERE o.id=$1 AND o.channel_key=$2 AND o.status='queued' AND o.payload->>'workspace_key'='bna' AND o.payload->>'to'=$3
      AND EXISTS(SELECT 1 FROM bna_interest_inquiries i JOIN bna_projects p ON p.id=i.project_id JOIN bna_parent_leads l ON l.id=i.parent_lead_id
        WHERE i.id::text=o.payload->>'inquiry_reference' AND p.project_key='bna' AND l.archived_at IS NULL AND l.status<>'archived') RETURNING o.*`, [outboxId, CHANNEL, target])).rows[0];
  if (!row) return { state: 'not_claimed', sent: false };
  let expected;
  try { expected = draftOwnerAlert({ reference: row.payload.inquiry_reference, ...row.payload.summary, to: target }); } catch {}
  const message = row.payload.message;
  if (!expected || !approvedTemplateHashes.includes(expected.templateHash) || message?.version !== VERSION || message.templateHash !== expected.templateHash || message.subject !== expected.subject || message.text !== expected.text) {
    await db.query(`UPDATE assistant_delivery_outbox SET status='cancelled',updated_at=NOW(),payload=payload || '{"delivery_state":"draft"}'::jsonb WHERE id=$1`, [outboxId]);
    return { state: 'draft', sent: false };
  }
  try {
    const accepted = await transport.send({ to: target, from: SENDER, replyTo: SENDER, subject: message.subject, text: message.text, idempotencyKey: row.idempotency_key });
    if (!accepted?.id) throw Error('PROVIDER_RESULT_UNKNOWN');
    await db.query(`UPDATE assistant_delivery_outbox SET status='sent',sent_at=NOW(),updated_at=NOW(),payload=payload || $2::jsonb WHERE id=$1`, [outboxId, JSON.stringify({ delivery_state: 'provider_accepted', provider: accepted.provider, provider_id: accepted.id })]);
    return { state: 'provider_accepted', sent: true };
  } catch (error) {
    const knownFailure = error?.definitelyNotSent === true, state = knownFailure ? 'failed' : 'unknown';
    await db.query(`UPDATE assistant_delivery_outbox SET status=$2,last_error=$3,updated_at=NOW(),payload=payload || $4::jsonb WHERE id=$1`, [outboxId, knownFailure ? 'failed' : 'sending', knownFailure ? 'PROVIDER_REJECTED' : 'PROVIDER_OUTCOME_UNKNOWN', JSON.stringify({ delivery_state: state })]);
    return { state, sent: false }; // Neither failure nor uncertainty changes the saved inquiry.
  }
}
function createOwnerAlertWorker({ pool, transport, to }) {
  let running = false;
  async function tick() {
    const target = recipient(to);
    if (running || !target) return; running = true;
    try {
      const release = (await pool.query('SELECT * FROM bna_interest_email_releases WHERE version=$1 AND active=true', [VERSION])).rows[0];
      if (!release || release.from_email !== SENDER || release.reply_to !== SENDER) return;
      // A crash can leave an accepted send with no receipt. Park it; never auto-resend.
      await pool.query(`UPDATE assistant_delivery_outbox SET last_error='PROVIDER_OUTCOME_UNKNOWN',payload=payload || '{"delivery_state":"unknown"}'::jsonb
        WHERE channel_key=$1 AND status='sending' AND payload->>'workspace_key'='bna' AND payload->>'to'=$2
          AND payload->>'delivery_state'='sending' AND updated_at<NOW()-INTERVAL '5 minutes'`, [CHANNEL, target]);
      const rows = (await pool.query(`SELECT id FROM assistant_delivery_outbox WHERE channel_key=$1 AND status='queued' AND payload->>'workspace_key'='bna' AND payload->>'to'=$2 ORDER BY id LIMIT 5`, [CHANNEL, target])).rows;
      for (const row of rows) await dispatchOwnerAlert({ db: pool, outboxId: row.id, transport, to: target, approvedTemplateHashes: release.template_hashes });
    } finally { running = false; }
  }
  return { tick };
}
async function activateOwnerAlerts({ pool, transport, to, approvalSource }) {
  const target = recipient(to);
  if (!target || typeof approvalSource !== 'string' || !approvalSource.trim() || approvalSource.length > 300) throw problem('OWNER_ALERT_APPROVAL_REQUIRED');
  const verified = await transport.verifySender();
  if (verified.email !== SENDER) throw problem('BNA_SENDER_NOT_VERIFIED');
  const hash = draftOwnerAlert({ reference: '00000000-0000-4000-8000-000000000000', program: 'both', area: 'Preview', to: target }).templateHash;
  await pool.query(`INSERT INTO bna_interest_email_releases(version,approved_at,approval_source,from_email,from_name,reply_to,template_hashes,active,verified_sender_at)
    VALUES($1,NOW(),$2,$3,'Bnei Neviim Academy',$3,$4::jsonb,true,$5) ON CONFLICT(version) DO UPDATE
    SET approved_at=EXCLUDED.approved_at,approval_source=EXCLUDED.approval_source,template_hashes=EXCLUDED.template_hashes,active=true,verified_sender_at=EXCLUDED.verified_sender_at`, [VERSION, approvalSource, SENDER, JSON.stringify([hash]), verified.verifiedAt]);
  return { active: true, version: VERSION, templateHash: hash, activationScope: 'newly saved BNA inquiries only' };
}
module.exports = { VERSION, CHANNEL, SENDER, SUBJECT, PATTERN, recipient, draftOwnerAlert, enqueueOwnerAlert, dispatchOwnerAlert, createOwnerAlertWorker, activateOwnerAlerts };
