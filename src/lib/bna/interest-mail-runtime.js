'use strict';
const { google } = require('googleapis');
const { createHash } = require('node:crypto');
const { VERSION, CHANNEL, draftEmail, dispatchAcknowledgement } = require('./interest-email');
const { problem } = require('./interest-launch');
const BNA_EMAIL = 'office@bneineviimacademy.org';
function gmailMessage(message) {
  if (message.from !== BNA_EMAIL || message.replyTo !== BNA_EMAIL || !/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(message.to)) throw problem('BNA_EMAIL_IDENTITY_INVALID');
  const id = createHash('sha256').update(message.idempotencyKey).digest('hex');
  const encoded = [
    `To: ${message.to}`, `From: Bnei Neviim Academy <${BNA_EMAIL}>`, `Reply-To: ${BNA_EMAIL}`,
    `Message-ID: <bna-interest-${id}@bneineviimacademy.org>`,
    `Subject: =?UTF-8?B?${Buffer.from(message.subject).toString('base64')}?=`,
    'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    Buffer.from(message.text, 'utf8').toString('base64').replace(/.{1,76}/g, '$&\r\n'),
  ].join('\r\n');
  return Buffer.from(encoded, 'utf8').toString('base64url');
}
function createBnaGmailTransport({ createAuth }) {
  let checkedAt = 0;
  async function verifySender() {
    const auth = createAuth();
    // The existing token has Drive and gmail.send. Drive account metadata proves
    // its primary account without requesting new Gmail read/settings scopes.
    const account = (await google.drive({ version: 'v3', auth }).about.get({ fields: 'user(emailAddress)' }, { retry: false, timeout: 15000 })).data.user?.emailAddress;
    if (account !== BNA_EMAIL) throw problem('BNA_SENDER_NOT_VERIFIED', 503);
    checkedAt = Date.now(); return { email: account, provider: 'gmail', verifiedAt: new Date(checkedAt).toISOString() };
  }
  async function send(message) {
    try {
      if (Date.now() - checkedAt > 5 * 60 * 1000) await verifySender();
      const gmail = google.gmail({ version: 'v1', auth: createAuth() });
      const result = await gmail.users.messages.send({ userId: 'me', requestBody: { raw: gmailMessage(message) } }, { retry: false, timeout: 15000 });
      return { provider: 'gmail', id: result.data.id };
    } catch (error) {
      if (error.code === 'BNA_SENDER_NOT_VERIFIED' || error.response?.status >= 400 && error.response.status < 500) error.definitelyNotSent = true;
      throw error;
    }
  }
  return { verifySender, send };
}
function createBnaAcknowledgementWorker({ pool, transport }) {
  let running = false;
  async function tick() {
    if (running) return; running = true;
    try {
      const release = (await pool.query('SELECT * FROM bna_interest_email_releases WHERE version=$1 AND active=true', [VERSION])).rows[0];
      if (!release || release.from_email !== BNA_EMAIL || release.reply_to !== BNA_EMAIL) return;
      const rows = (await pool.query(`SELECT o.id FROM assistant_delivery_outbox o
        JOIN bna_interest_inquiries i ON i.outbox_id=o.id JOIN bna_projects p ON p.id=i.project_id
        JOIN bna_parent_leads l ON l.id=i.parent_lead_id
        WHERE p.project_key='bna' AND o.channel_key=$1 AND o.status='queued'
          AND l.archived_at IS NULL AND l.status<>'archived' AND o.payload->>'workspace_key'='bna'
        ORDER BY o.id LIMIT 5`, [CHANNEL])).rows;
      const approval = { approved: true, version: VERSION, sender: release.from_email, replyTo: release.reply_to, templateHashes: release.template_hashes };
      for (const row of rows) await dispatchAcknowledgement({ db: pool, outboxId: row.id, send: transport.send, approval });
    } finally { running = false; }
  }
  return { tick };
}
async function activateBnaAcknowledgements({ pool, transport, approvalSource }) {
  if (typeof approvalSource !== 'string' || !approvalSource.trim() || approvalSource.length > 300) throw problem('APPROVAL_RECEIPT_REQUIRED');
  const verified = await transport.verifySender();
  const hashes = ['en', 'he'].map(language => draftEmail(language).templateHash);
  await pool.query(`INSERT INTO bna_interest_email_releases(version,approved_at,approval_source,from_email,from_name,reply_to,template_hashes,active,verified_sender_at)
    VALUES($1,NOW(),$2,$3,'Bnei Neviim Academy',$3,$4::jsonb,true,$5)
    ON CONFLICT(version) DO UPDATE SET approved_at=EXCLUDED.approved_at,approval_source=EXCLUDED.approval_source,active=true,verified_sender_at=EXCLUDED.verified_sender_at`, [VERSION, approvalSource, BNA_EMAIL, JSON.stringify(hashes), verified.verifiedAt]);
  // Deliberately no draft backfill or legacy outbox drain here.
  return { active: true, version: VERSION, sender: BNA_EMAIL, templateHashes: hashes, activationScope: 'newly saved BNA inquiries only' };
}
module.exports = { BNA_EMAIL, gmailMessage, createBnaGmailTransport, createBnaAcknowledgementWorker, activateBnaAcknowledgements };
