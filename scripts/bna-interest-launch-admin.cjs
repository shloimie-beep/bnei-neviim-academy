'use strict';
const { createOutboxPool } = require('../src/lib/bna/life-skills-inbound-database');
const { createInterestStore } = require('../src/lib/bna/interest-store');
const { createBnaArchive, MIGRATION } = require('../src/lib/bna/interest-archive');
const { draftEmail, dispatchAcknowledgement, VERSION } = require('../src/lib/bna/interest-email');
const { createBnaGmailTransport, activateBnaAcknowledgements, BNA_EMAIL } = require('../src/lib/bna/interest-mail-runtime');
const { google } = require('googleapis');
const argument = name => { const at = process.argv.indexOf(name); return at < 0 ? '' : process.argv[at + 1] || ''; };
function auth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) throw Error('BNA_GMAIL_UNAVAILABLE');
  const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN }); return client;
}
async function main() {
  // The existing pinned client checks project, environment, service and TLS
  // identity before opening the BNA database. No alternate target is inferred.
  const pool = createOutboxPool(process.env), command = process.argv[2];
  try {
    if (command === '--migrate') {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await createInterestStore({ pool: client }).ensureSchema();
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
      finally { client.release(); }
      return { schemaApplied: true, scope: 'BNA interest sidecars only', compatibilityBoot: false };
    }
    if (command === '--prepare-archive') return await createBnaArchive({ pool }).prepare();
    if (command === '--apply-archive') return await createBnaArchive({ pool }).apply();
    if (command === '--verify-archive') {
      const run = (await pool.query('SELECT migration_id,cutoff,inventory,state,applied_at FROM bna_interest_archive_runs WHERE migration_id=$1', [MIGRATION])).rows[0];
      const rows = (await pool.query('SELECT entity_table,COUNT(*)::int AS inventoried,COUNT(*) FILTER (WHERE archived_at IS NOT NULL AND restored_at IS NULL)::int AS archived FROM bna_interest_archive_items WHERE migration_id=$1 GROUP BY entity_table ORDER BY entity_table', [MIGRATION])).rows;
      return { run, tables: rows, authTablesChanged: false };
    }
    if (command === '--send-owner-test' || command === '--activate-email') {
      if (argument('--approval-source') !== 'RAW-20261105-002') throw Error('EXACT_EMAIL_APPROVAL_RECEIPT_REQUIRED');
      const reference = argument('--test-reference'); if (!/^[a-f0-9-]{36}$/i.test(reference)) throw Error('TEST_REFERENCE_REQUIRED');
      const row = (await pool.query("SELECT i.id,i.fields,o.id AS outbox_id,o.payload,o.status FROM bna_interest_inquiries i JOIN assistant_delivery_outbox o ON o.id=i.outbox_id JOIN bna_projects p ON p.id=i.project_id WHERE i.id=$1 AND p.project_key='bna'", [reference])).rows[0];
      if (!row || row.fields.email !== BNA_EMAIL || !/synthetic/i.test(row.fields.name) || row.payload.message.version !== VERSION) throw Error('SCOPED_OWNER_TEST_REQUIRED');
      const transport = createBnaGmailTransport({ createAuth: auth });
      if (command === '--send-owner-test') {
        await transport.verifySender();
        await pool.query("UPDATE assistant_delivery_outbox SET status='queued',payload=payload || '{\"delivery_state\":\"queued\"}'::jsonb WHERE id=$1 AND status='cancelled' AND payload->>'delivery_state'='draft'", [row.outbox_id]);
        await dispatchAcknowledgement({ db: pool, outboxId: row.outbox_id, send: transport.send, approval: { approved: true, version: VERSION, sender: BNA_EMAIL, replyTo: BNA_EMAIL, templateHashes: ['en', 'he'].map(locale => draftEmail(locale).templateHash) } });
        const receipt = (await pool.query("SELECT payload->>'delivery_state' AS state,payload->>'provider' AS provider,payload->>'provider_id' AS provider_id FROM assistant_delivery_outbox WHERE id=$1", [row.outbox_id])).rows[0];
        return { testReference: reference, ...receipt, delivered: false };
      }
      if (row.payload.delivery_state !== 'provider_accepted' || !argument('--recipient-proof')) throw Error('OWNER_RECIPIENT_READBACK_REQUIRED');
      const activated = await activateBnaAcknowledgements({ pool, transport, approvalSource: 'RAW-20261105-002; owner receipt ' + argument('--recipient-proof') });
      return { ...activated, testReference: reference, recipientEvidence: argument('--recipient-proof') };
    }
    throw Error('UNKNOWN_BNA_LAUNCH_COMMAND');
  } finally { await pool.end(); }
}
main().then(result => console.log(JSON.stringify(result))).catch(error => { console.error(JSON.stringify({ error: error.code || 'BNA_LAUNCH_OPERATION_FAILED', detail: /^[A-Z0-9_]+$/.test(error.message || '') ? error.message : undefined })); process.exitCode = 1; });
