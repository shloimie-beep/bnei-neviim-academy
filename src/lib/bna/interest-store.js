'use strict';
const { randomUUID, randomBytes, createHash } = require('node:crypto');
const { DECISION, NOTICE, problem } = require('./interest-launch');
const { draftEmail, CHANNEL } = require('./interest-email');
const { enqueueOwnerAlert } = require('./interest-owner-alert');
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS bna_interest_challenges (
 token_hash text PRIMARY KEY, issued_at timestamptz NOT NULL DEFAULT NOW(), expires_at timestamptz NOT NULL,
 consumed_at timestamptz
);
CREATE TABLE IF NOT EXISTS bna_interest_inquiries (
 id uuid PRIMARY KEY, project_id integer NOT NULL REFERENCES bna_projects(id),
 parent_lead_id integer NOT NULL REFERENCES bna_parent_leads(id),
 payload_digest text NOT NULL, fields jsonb NOT NULL, attribution jsonb NOT NULL,
 notice_version text NOT NULL, privacy_version text NOT NULL,
 outbox_id integer REFERENCES assistant_delivery_outbox(id),
 created_at timestamptz NOT NULL DEFAULT NOW(), UNIQUE(project_id,payload_digest)
);
CREATE TABLE IF NOT EXISTS bna_interest_operations (
 operation_id uuid PRIMARY KEY, inquiry_id uuid NOT NULL REFERENCES bna_interest_inquiries(id),
 payload_digest text NOT NULL, recovery_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bna_interest_inquiries_lead ON bna_interest_inquiries(parent_lead_id,created_at);
CREATE TABLE IF NOT EXISTS bna_interest_archive_runs (
 migration_id text PRIMARY KEY, cutoff timestamptz NOT NULL, inventory jsonb NOT NULL,
 state text NOT NULL DEFAULT 'prepared', created_at timestamptz NOT NULL DEFAULT NOW(), applied_at timestamptz, restored_at timestamptz
);
CREATE TABLE IF NOT EXISTS bna_interest_email_releases (
 version text PRIMARY KEY, approved_at timestamptz NOT NULL, approval_source text NOT NULL,
 from_email text NOT NULL, from_name text NOT NULL, reply_to text NOT NULL,
 template_hashes jsonb NOT NULL, active boolean NOT NULL DEFAULT false,
 verified_sender_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS bna_interest_archive_items (
 migration_id text NOT NULL REFERENCES bna_interest_archive_runs(migration_id),
 entity_table text NOT NULL, entity_id text NOT NULL, snapshot jsonb NOT NULL,
 archive_patch jsonb NOT NULL DEFAULT '{}', archived_at timestamptz, restored_at timestamptz,
 PRIMARY KEY(migration_id,entity_table,entity_id)
);
CREATE INDEX IF NOT EXISTS bna_interest_archive_active ON bna_interest_archive_items(entity_table,entity_id) WHERE archived_at IS NOT NULL AND restored_at IS NULL;`;
const tokenHash = token => createHash('sha256').update(token).digest('hex');
function createInterestStore({ pool, now = () => Date.now(), minChallengeAge = 1200, privacyVersion = 'BNA-ACQUISITION-PRIVACY-v1', ownerAlertRecipient = process.env.BNA_INTEREST_OWNER_ALERT_TO || '' }) {
  async function project(db) {
    const rows = (await db.query("SELECT id FROM bna_projects WHERE project_key='bna' LIMIT 2")).rows;
    if (rows.length !== 1) throw problem('BNA_PROJECT_UNAVAILABLE', 503); return rows[0].id;
  }
  const response = row => ({ saved: true, reference: row.id, email: { state: row.delivery_state || 'draft' } });
  async function result(db, id) { const row = (await db.query(`SELECT i.id, o.payload->>'delivery_state' AS delivery_state FROM bna_interest_inquiries i LEFT JOIN assistant_delivery_outbox o ON o.id=i.outbox_id WHERE i.id=$1`, [id])).rows[0]; if (!row) throw problem('SAVE_UNAVAILABLE', 503); return response(row); }
  async function issueChallenge() {
    const token = randomBytes(32).toString('base64url');
    await pool.query('INSERT INTO bna_interest_challenges(token_hash,expires_at) VALUES($1,$2)', [tokenHash(token), new Date(now() + 10 * 60 * 1000)]);
    return { challenge: token, notice: NOTICE, minWaitMs: minChallengeAge };
  }
  async function save(input, challenge) {
    if (typeof challenge !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) throw problem('INVALID_CHALLENGE', 403);
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      // Serialize BNA inquiry creation; scope includes both operation and content dedupe.
      await db.query("SELECT pg_advisory_xact_lock(hashtext('bna-interest-launch-save'))");
      const replay = (await db.query('SELECT inquiry_id,payload_digest FROM bna_interest_operations WHERE operation_id=$1', [input.operationId])).rows[0];
      if (replay) {
        if (replay.payload_digest !== input.digest) throw problem('OPERATION_CONFLICT', 409);
        const saved = await result(db, replay.inquiry_id); await db.query('COMMIT'); return { ...saved, replayed: true };
      }
      const offer = (await db.query('SELECT * FROM bna_interest_challenges WHERE token_hash=$1 FOR UPDATE', [tokenHash(challenge)])).rows[0];
      if (!offer || offer.consumed_at || new Date(offer.expires_at).getTime() <= now() || now() - new Date(offer.issued_at).getTime() < minChallengeAge) throw problem('INVALID_CHALLENGE', 403);
      const projectId = await project(db);
      const duplicate = (await db.query('SELECT id FROM bna_interest_inquiries WHERE project_id=$1 AND payload_digest=$2', [projectId, input.digest])).rows[0];
      if (duplicate) {
        await db.query('INSERT INTO bna_interest_operations(operation_id,inquiry_id,payload_digest,recovery_hash) VALUES($1,$2,$3,$4)', [input.operationId, duplicate.id, input.digest, input.recoveryHash]);
        await db.query('UPDATE bna_interest_challenges SET consumed_at=NOW() WHERE token_hash=$1', [tokenHash(challenge)]);
        const saved = await result(db, duplicate.id); await db.query('COMMIT'); return { ...saved, replayed: true };
      }
      const f = input.fields, id = randomUUID();
      const metadata = { interest_launch: DECISION, program_interest: f.program, area: f.area, preferred_area: f.preferredArea, child_ages: f.childAges, language: f.language, preferred_reply: f.contactChannel, latest_inquiry_reference: id, consent: f.permission, marketing: { articles: f.articleUpdates, pod: f.podUpdates, academy: f.academyUpdates } };
      // Legacy/archived people never become active merely because the email matches.
      let lead = (await db.query(`SELECT id FROM bna_parent_leads WHERE project_id=$1 AND lower(parent_email)=$2 AND archived_at IS NULL AND status<>'archived' AND metadata->>'interest_launch'=$3 ORDER BY id LIMIT 1 FOR UPDATE`, [projectId, f.email, DECISION])).rows[0];
      if (lead) {
        await db.query(`UPDATE bna_parent_leads SET parent_name=$2,parent_phone=NULLIF($3,''),metadata=COALESCE(metadata,'{}'::jsonb)||$4::jsonb,last_inbound_at=NOW(),updated_at=NOW() WHERE id=$1`, [lead.id, f.name, f.phone, JSON.stringify(metadata)]);
      } else {
        lead = (await db.query(`INSERT INTO bna_parent_leads(project_id,parent_name,parent_email,parent_phone,student_age,lead_type,status,source,source_detail,metadata,last_inbound_at) VALUES($1,$2,$3,NULLIF($4,''),$5,'school_interest','new','website_form','BNA interest launch',$6::jsonb,NOW()) RETURNING id`, [projectId, f.name, f.email, f.phone, f.childAges[0], JSON.stringify(metadata)])).rows[0];
      }
      const message = draftEmail(f.language); // Full parent name is not guessed into a first name.
      const release = (await db.query('SELECT template_hashes FROM bna_interest_email_releases WHERE version=$1 AND active=true', [message.version])).rows[0];
      const activated = Array.isArray(release?.template_hashes) && release.template_hashes.includes(message.templateHash);
      const outbox = (await db.query(`INSERT INTO assistant_delivery_outbox(delivery_key,channel_key,recipient_identity_key,payload,idempotency_key,status) VALUES($1,$2,$3,$4::jsonb,$1,$5) RETURNING id`, [`bna-interest:${id}`, CHANNEL, `bna-lead:${lead.id}`, JSON.stringify({ workspace_key: 'bna', project_key: 'bna', lead_id: lead.id, inquiry_reference: id, to: f.email, message, delivery_state: activated ? 'queued' : 'draft', activation_required: !activated }), activated ? 'queued' : 'cancelled'])).rows[0];
      await db.query('INSERT INTO bna_interest_inquiries(id,project_id,parent_lead_id,payload_digest,fields,attribution,notice_version,privacy_version,outbox_id) VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9)', [id, projectId, lead.id, input.digest, JSON.stringify(f), JSON.stringify(input.attribution), NOTICE.version, privacyVersion, outbox.id]);
      await enqueueOwnerAlert({ db, inquiryId: id, leadId: lead.id, fields: f, to: ownerAlertRecipient });
      await db.query('INSERT INTO bna_interest_operations(operation_id,inquiry_id,payload_digest,recovery_hash) VALUES($1,$2,$3,$4)', [input.operationId, id, input.digest, input.recoveryHash]);
      await db.query('UPDATE bna_interest_challenges SET consumed_at=NOW() WHERE token_hash=$1', [tokenHash(challenge)]);
      const saved = await result(db, id); await db.query('COMMIT'); return { ...saved, replayed: false };
    } catch (error) { await db.query('ROLLBACK').catch(() => {}); throw error; }
    finally { db.release(); }
  }
  async function recover(operationId, recoveryToken) {
    if (!/^[a-f0-9-]{36}$/i.test(operationId || '') || !/^[a-f0-9-]{36}$/i.test(recoveryToken || '')) throw problem('INVALID_RECOVERY', 403);
    const db = await pool.connect();
    try {
      await db.query('BEGIN'); await db.query("SELECT pg_advisory_xact_lock(hashtext('bna-interest-launch-save'))");
      const row = (await db.query('SELECT inquiry_id FROM bna_interest_operations WHERE operation_id=$1 AND recovery_hash=$2', [operationId, tokenHash(recoveryToken)])).rows[0];
      if (!row) throw problem('SAVE_NOT_CONFIRMED', 404);
      const saved = await result(db, row.inquiry_id); await db.query('COMMIT'); return saved;
    } catch (error) { await db.query('ROLLBACK').catch(() => {}); throw error; } finally { db.release(); }
  }
  return { issueChallenge, save, recover, ensureSchema: () => pool.query(SCHEMA_SQL) };
}
module.exports = { SCHEMA_SQL, createInterestStore };
