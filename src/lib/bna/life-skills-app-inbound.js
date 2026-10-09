const crypto = require('node:crypto');
const { normalizeLifeSkillsPhone, lifeSkillsSheetCrmConfig } = require('./life-skills-sheet-crm');

// One destination, using the existing bridge credential. No arbitrary URL,
// provider download/history call, contact/account creation or outbound reply.
const APP_INBOUND_URL = 'https://life-skills.bneineviimacademy.org/api/private/contact-inbound';
const OUTBOX_SQL = `CREATE TABLE IF NOT EXISTS bna_life_skills_app_inbound_outbox (
  binding_sha256 TEXT NOT NULL CHECK (binding_sha256 ~ '^[a-f0-9]{64}$'),
  event_key TEXT NOT NULL CHECK (event_key ~ '^[a-f0-9]{64}$'),
  message_key TEXT NOT NULL CHECK (message_key ~ '^[a-f0-9]{64}$'),
  capture_epoch TEXT NOT NULL CHECK (capture_epoch ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  key_sha256 TEXT NOT NULL CHECK (key_sha256 ~ '^[a-f0-9]{64}$'),
  payload_digest TEXT NOT NULL CHECK (payload_digest ~ '^[a-f0-9]{64}$'),
  payload_ciphertext BYTEA NOT NULL CHECK (octet_length(payload_ciphertext) > 28),
  stored_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','blocked')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  last_code TEXT CHECK (last_code IS NULL OR last_code ~ '^[A-Z0-9_]{1,40}$'),
  private_ack_digest TEXT CHECK (private_ack_digest IS NULL OR private_ack_digest ~ '^[a-f0-9]{64}$'),
  private_acknowledged_at TIMESTAMPTZ,
  conflict_detected BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK ((private_ack_digest IS NULL) = (private_acknowledged_at IS NULL)),
  PRIMARY KEY (binding_sha256,event_key)
);
ALTER TABLE bna_life_skills_app_inbound_outbox
  ADD COLUMN IF NOT EXISTS message_key TEXT,
  ADD COLUMN IF NOT EXISTS capture_epoch TEXT,
  ADD COLUMN IF NOT EXISTS private_ack_digest TEXT,
  ADD COLUMN IF NOT EXISTS private_acknowledged_at TIMESTAMPTZ;
UPDATE bna_life_skills_app_inbound_outbox SET message_key=event_key WHERE message_key IS NULL;
UPDATE bna_life_skills_app_inbound_outbox SET capture_epoch='legacy_unbound' WHERE capture_epoch IS NULL;
ALTER TABLE bna_life_skills_app_inbound_outbox ALTER COLUMN message_key SET NOT NULL,ALTER COLUMN capture_epoch SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bna_ls_app_inbound_message_key_format'
    AND conrelid='bna_life_skills_app_inbound_outbox'::regclass) THEN
    ALTER TABLE bna_life_skills_app_inbound_outbox ADD CONSTRAINT bna_ls_app_inbound_message_key_format CHECK (message_key ~ '^[a-f0-9]{64}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bna_ls_app_inbound_capture_epoch_format'
    AND conrelid='bna_life_skills_app_inbound_outbox'::regclass) THEN
    ALTER TABLE bna_life_skills_app_inbound_outbox ADD CONSTRAINT bna_ls_app_inbound_capture_epoch_format CHECK (capture_epoch ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bna_ls_app_inbound_private_ack_format'
    AND conrelid='bna_life_skills_app_inbound_outbox'::regclass) THEN
    ALTER TABLE bna_life_skills_app_inbound_outbox ADD CONSTRAINT bna_ls_app_inbound_private_ack_format
      CHECK (private_ack_digest IS NULL OR private_ack_digest ~ '^[a-f0-9]{64}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bna_ls_app_inbound_private_ack_pair'
    AND conrelid='bna_life_skills_app_inbound_outbox'::regclass) THEN
    ALTER TABLE bna_life_skills_app_inbound_outbox ADD CONSTRAINT bna_ls_app_inbound_private_ack_pair
      CHECK ((private_ack_digest IS NULL) = (private_acknowledged_at IS NULL));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_bna_life_skills_app_inbound_pending
  ON bna_life_skills_app_inbound_outbox(next_attempt_at) WHERE status='pending';
REVOKE ALL ON bna_life_skills_app_inbound_outbox FROM PUBLIC;`;

function fail(code) { const error = new Error(code); error.code = code; return error; }
function receiptDigest(inquiry, secret) {
  return crypto.createHmac('sha256',secret).update('life-skills-inbound-ack/v1\n').update(canonical(inquiry)).digest('hex');
}
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
function forwardConfig(env = {}) {
  const enabled = env.LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED === 'true';
  const secret = String(env.LIFE_SKILLS_APP_BRIDGE_SECRET || '').trim();
  const channelId = String(env.LIFE_SKILLS_WAPI_CHANNEL_ID || env.WHAPI_CHANNEL_ID || '').trim();
  const businessNumber = normalizeLifeSkillsPhone(env.LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS || '972534932631');
  const ready = enabled && secret.length >= 32 && secret.length <= 1024 && channelId.length >= 1 && channelId.length <= 180 && Boolean(businessNumber);
  const binding = { provider: 'whapi', channelId, businessNumber };
  const captureConsent = lifeSkillsSheetCrmConfig(env);
  return { enabled:enabled && captureConsent.enabled && captureConsent.approved, ready:ready && captureConsent.enabled && captureConsent.approved, secret, channelId, businessNumber,
    bindingSha256: crypto.createHash('sha256').update(canonical(binding)).digest('hex') };
}
function bounded(value, max, required = false) {
  const text = value == null ? '' : String(value);
  if (text.length > max || (required && !text.length)) throw fail('INVALID_INQUIRY');
  return text;
}
/** Complete provider evidence only, after webhook/channel authorization. Never
 * infer business intent from message text, UTM, push name or a contact prefix.
 * Whapi: context.ad.ctwa/attrib/source.id/type. Missing/invalid evidence stays
 * unqualified; it must not prevent durable capture of the ordinary message.
 */
function ctwaAttributionFromProviderMessage(message) {
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const own = (value, key) => Object.hasOwn(value, key) ? value[key] : undefined;
  if (!record(message)) return null;
  const context = own(message, 'context'); if (!record(context)) return null;
  const ad = own(context, 'ad'); if (!record(ad)) return null;
  const source = own(ad, 'source'); if (!record(source)) return null;
  const click = own(ad, 'ctwa'), id = own(source, 'id');
  if (typeof click !== 'string' || typeof id !== 'string' || own(ad, 'attrib') !== true || own(source, 'type') !== 'ad') return null;
  const clickId = click.trim(), adId = id.trim();
  if (!clickId.length || clickId.length > 2048 || !adId.length || adId.length > 180) return null;
  return { clickId, adId, attributed:true, sourceType:'ad' };
}
/** Consume only authenticated new messages.post envelopes. The provider message
 * ID is also the event idempotency key: replayed callbacks have one identity.
 * An attachment is its real provider descriptor, never its URL or preview.
 */
function inquiriesFromEnvelope(payload = {}, scope = {}, config) {
  if (!config.enabled) return [];
  if (scope.project_key === 'one_time_mishnah_class' || scope.workspace_key === 'rabbi_sheller_provider') return [];
  const channel = String(payload.channel_id || payload.channelId || payload.channel?.id || payload.data?.channel_id || '').trim();
  if (!channel || channel !== config.channelId) return [];
  if (!config.ready) throw fail('FORWARD_CONFIGURATION_UNAVAILABLE');
  if (payload.event?.type !== 'messages' || payload.event?.event !== 'post') return [];
  const messages = payload.messages || payload.data?.messages;
  if (!Array.isArray(messages) || messages.length > 100) throw fail('INVALID_INQUIRY');
  const result = [];
  for (const message of messages) {
    if (!message || typeof message !== 'object') throw fail('INVALID_INQUIRY');
    const thread = String(message.chat_id || '');
    if (message.from_me !== false || message.status || /@(?:g\.us|newsletter|broadcast)$/.test(thread)) continue;
    if (!/^[0-9]+@(?:s\.whatsapp\.net|c\.us)$/.test(thread)) continue;
    const suppliedDestination = message.to || payload.to;
    if (suppliedDestination && normalizeLifeSkillsPhone(suppliedDestination) !== config.businessNumber) throw fail('DESTINATION_MISMATCH');
    const type = bounded(message.type, 60, true);
    const attachment = ['image','video','audio','voice','document','sticker'].includes(type) ? message[type] : null;
    const media = [];
    if (attachment) {
      const bytes = attachment.file_size ?? null;
      if (bytes !== null && (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > 50_000_000)) throw fail('INVALID_INQUIRY');
      media.push({ providerMediaId: bounded(attachment.id, 180, true), fileName: bounded(attachment.file_name || attachment.filename, 255),
        mimeType: bounded(attachment.mime_type, 120), sizeBytes: bytes });
    }
    const messageText = bounded(typeof message.text === 'object' ? message.text.body : message.text || attachment?.caption || '', 16000);
    if (!messageText && !media.length) throw fail('UNSUPPORTED_INQUIRY_CONTENT');
    if (!Number.isFinite(message.timestamp) || message.timestamp <= 0) throw fail('INVALID_INQUIRY');
    const date = new Date(message.timestamp < 1e12 ? message.timestamp * 1000 : message.timestamp);
    if (!Number.isFinite(date.getTime())) throw fail('INVALID_INQUIRY');
    const fromNumber = normalizeLifeSkillsPhone(message.from);
    if (!fromNumber || normalizeLifeSkillsPhone(thread) !== fromNumber) throw fail('INVALID_INQUIRY');
    const id = bounded(message.id, 180, true);
    const inquiry = { provider:'whapi', channelId:config.channelId, businessNumber:config.businessNumber,
      providerEventId:id, providerMessageId:id, providerThreadId:bounded(thread,180,true), eventType:'inbound_message',
      fromMe:false, fromNumber, pushName:bounded(message.from_name,120), messageType:type, messageText,
      occurredAt:date.toISOString(), media };
    const ctwaAttribution = ctwaAttributionFromProviderMessage(message);
    if (ctwaAttribution) inquiry.ctwaAttribution = ctwaAttribution;
    if (Buffer.byteLength(JSON.stringify(inquiry)) > 65536) throw fail('INVALID_INQUIRY');
    result.push(inquiry);
  }
  return result;
}

class LifeSkillsAppInboundOutbox {
  constructor(pool, config, fetcher = fetch, reconciliation = null) {
    if (!config.ready) throw fail('FORWARD_CONFIGURATION_UNAVAILABLE');
    this.pool = pool; this.config = config; this.fetcher = fetcher; this.reconciliation = reconciliation;
    this.key = Buffer.from(crypto.hkdfSync('sha256', config.secret, 'life-skills-app-inbound-v1', 'outbox-encryption', 32));
    this.hmacKey = Buffer.from(crypto.hkdfSync('sha256', config.secret, 'life-skills-app-inbound-v1', 'outbox-integrity', 32));
    this.keySha256 = crypto.createHash('sha256').update(this.key).digest('hex');
  }
  digest(value) { return crypto.createHmac('sha256', this.hmacKey).update(canonical(value)).digest('hex'); }
  eventKey(inquiry) { return this.digest({ binding:this.config.bindingSha256, id:inquiry.providerEventId }); }
  messageKey(inquiry) { return this.digest({ binding:this.config.bindingSha256, message:inquiry.providerMessageId }); }
  seal(inquiry, key) {
    const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(`${this.config.bindingSha256}/${key}`));
    return Buffer.concat([iv,cipher.update(JSON.stringify(inquiry)),cipher.final(),cipher.getAuthTag()]);
  }
  unseal(row) {
    try {
      if (row.key_sha256 !== this.keySha256) throw fail('OUTBOX_KEY_CHANGED');
      const bytes = row.payload_ciphertext, decipher = crypto.createDecipheriv('aes-256-gcm', this.key, bytes.subarray(0,12));
      decipher.setAAD(Buffer.from(`${row.binding_sha256}/${row.event_key}`)); decipher.setAuthTag(bytes.subarray(-16));
      const inquiry = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(12,-16)),decipher.final()]).toString('utf8'));
      if (this.digest(inquiry) !== row.payload_digest || this.eventKey(inquiry) !== row.event_key) throw fail('OUTBOX_INTEGRITY_FAILURE');
      return inquiry;
    } catch { throw fail('OUTBOX_INTEGRITY_FAILURE'); }
  }
  async capture(inquiry, captureEpoch='sheet') {
    if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(captureEpoch))throw fail('INVALID_WRITER_EPOCH');
    const eventKey = this.eventKey(inquiry), messageKey=this.messageKey(inquiry), payloadDigest = this.digest(inquiry);
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`ls-app-inbound:${this.config.bindingSha256}:${eventKey}`]);
      const prior = (await db.query(`SELECT payload_digest,key_sha256,message_key,capture_epoch FROM bna_life_skills_app_inbound_outbox WHERE binding_sha256=$1 AND event_key=$2`, [this.config.bindingSha256,eventKey])).rows[0];
      const legacyMessageKey=prior?.capture_epoch==='legacy_unbound'&&prior.message_key===eventKey;
      if (prior && (prior.payload_digest !== payloadDigest || prior.key_sha256 !== this.keySha256 || (!legacyMessageKey&&prior.message_key!==messageKey))) throw fail('INQUIRY_REPLAY_CONFLICT');
      if(legacyMessageKey)await db.query(`UPDATE bna_life_skills_app_inbound_outbox SET message_key=$3
        WHERE binding_sha256=$1 AND event_key=$2 AND message_key=event_key AND capture_epoch='legacy_unbound'`,[this.config.bindingSha256,eventKey,messageKey]);
      if (!prior) await db.query(`INSERT INTO bna_life_skills_app_inbound_outbox(binding_sha256,event_key,message_key,capture_epoch,key_sha256,payload_digest,payload_ciphertext) VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [this.config.bindingSha256,eventKey,messageKey,captureEpoch,this.keySha256,payloadDigest,this.seal(inquiry,eventKey)]);
      const retainedEpoch=prior?.capture_epoch||captureEpoch;
      if(this.reconciliation?.register)await this.reconciliation.register(db,{inquiry,bindingSha256:this.config.bindingSha256,eventKey,messageKey,payloadDigest,captureEpoch:retainedEpoch});
      await db.query('COMMIT'); // Only this committed encrypted row permits ACK.
      return { replayed:Boolean(prior), eventKey, captureEpoch:retainedEpoch };
    } catch (error) { await db.query('ROLLBACK').catch(() => null); throw error; }
    finally { db.release(); }
  }
  async captureBatch(inquiries,captureEpoch='sheet') {
    const conflicts=[]; const receipts=[]; let captured=0;
    for (const inquiry of inquiries) {
      try { const result=await this.capture(inquiry,captureEpoch); captured++; receipts.push({providerEventId:inquiry.providerEventId,eventKey:result.eventKey,replayed:result.replayed,bindingSha256:this.config.bindingSha256,captureEpoch:result.captureEpoch}); }
      catch (error) { if(error.code !== 'INQUIRY_REPLAY_CONFLICT') throw error; conflicts.push(this.eventKey(inquiry)); }
    }
    // Retain the original immutable payload, record the conflict durably and
    // allow valid later messages to commit instead of poisoning batch retries.
    if(conflicts.length) await this.pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET conflict_detected=TRUE WHERE binding_sha256=$1 AND event_key=ANY($2::text[])`,[this.config.bindingSha256,conflicts]);
    return {captured,conflicts:conflicts.length,receipts};
  }
  async deliver(eventKey) {
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      const row = (await db.query(`SELECT *,next_attempt_at <= clock_timestamp() AS due FROM bna_life_skills_app_inbound_outbox WHERE binding_sha256=$1 AND event_key=$2 FOR UPDATE`, [this.config.bindingSha256,eventKey])).rows[0];
      if (!row) throw fail('OUTBOX_NOT_FOUND');
      if (row.status !== 'pending') { await db.query('COMMIT'); return { status:row.status }; }
      if (!row.due) { await db.query('COMMIT'); return { status:'pending' }; }
      let status='pending', code='TRANSPORT_UNCONFIRMED', privateAckDigest=null;
      try {
        const inquiry = this.unseal(row);
        const retainedMessageKey=row.capture_epoch==='legacy_unbound'&&row.message_key===row.event_key?this.messageKey(inquiry):row.message_key;
        if(retainedMessageKey!==row.message_key)await db.query(`UPDATE bna_life_skills_app_inbound_outbox SET message_key=$3
          WHERE binding_sha256=$1 AND event_key=$2 AND message_key=event_key AND capture_epoch='legacy_unbound'`,[row.binding_sha256,row.event_key,retainedMessageKey]);
        // Repair either registration ordering on the same pinned public
        // connection before contacting the private service.
        if(this.reconciliation?.register)await this.reconciliation.register(db,{inquiry,bindingSha256:row.binding_sha256,eventKey:row.event_key,
          messageKey:retainedMessageKey,payloadDigest:row.payload_digest,captureEpoch:row.capture_epoch});
        const response = await this.fetcher(APP_INBOUND_URL, { method:'POST', redirect:'error', signal:AbortSignal.timeout(8000),
          headers:{'Content-Type':'application/json','X-Life-Skills-Bridge-Secret':this.config.secret}, body:JSON.stringify(inquiry) });
        if ([200,201].includes(response.status)) {
          const text = await boundedResponse(response);
          const receipt = JSON.parse(text);
          const ack=receipt.data?.ackDigest;
          const correlated=typeof ack === 'string' && /^[a-f0-9]{64}$/.test(ack) && crypto.timingSafeEqual(Buffer.from(ack,'hex'),Buffer.from(receiptDigest(inquiry,this.config.secret),'hex'));
          if (correlated && receipt.ok === true && typeof receipt.data?.replayed === 'boolean' && typeof receipt.data?.storedAt === 'string' && Number.isFinite(Date.parse(receipt.data.storedAt))) { status='delivered'; code='COMMITTED_PRIVATE_RECEIPT'; privateAckDigest=ack; }
          else code='INVALID_PRIVATE_RECEIPT';
        } else {
          code=`HTTP_${response.status}`;
          if ([400,401,403,409,413,415].includes(response.status)) status='blocked';
          await response.body?.cancel();
        }
      } catch (error) {
        if (['OUTBOX_INTEGRITY_FAILURE','INBOUND_RECONCILIATION_CONFLICT','INBOUND_RECONCILIATION_INVALID'].includes(error.code)) { status='blocked'; code=error.code; }
      }
      const delaySeconds = Math.min(3600,30 * 2 ** Math.min(row.attempts,7));
      // A correlated ACK proves only an encrypted private receipt. Before the
      // native authority switch the private service intentionally stores it as
      // receipt_only, so this row must never be treated as CRM projection proof.
      if(status==='delivered'&&this.reconciliation?.confirm)await this.reconciliation.confirm(db,{bindingSha256:this.config.bindingSha256,eventKey,ackDigest:privateAckDigest});
      if(status==='blocked'&&this.reconciliation?.block)await this.reconciliation.block(db,{bindingSha256:this.config.bindingSha256,eventKey});
      await db.query(`UPDATE bna_life_skills_app_inbound_outbox SET status=$3, attempts=attempts+1, last_code=$4,
        delivered_at=CASE WHEN $3='delivered' THEN clock_timestamp() ELSE delivered_at END,
        private_ack_digest=CASE WHEN $3='delivered' THEN $6 ELSE private_ack_digest END,
        private_acknowledged_at=CASE WHEN $3='delivered' THEN clock_timestamp() ELSE private_acknowledged_at END,
        next_attempt_at=clock_timestamp()+($5::int*interval '1 second') WHERE binding_sha256=$1 AND event_key=$2`,
        [this.config.bindingSha256,eventKey,status,code,delaySeconds,privateAckDigest]);
      await db.query('COMMIT'); return { status, code };
    } catch (error) { await db.query('ROLLBACK').catch(() => null); throw error; }
    finally { db.release(); }
  }
  async drain(limit=25) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 25) throw fail('INVALID_LIMIT');
    const rows = (await this.pool.query(`SELECT event_key FROM bna_life_skills_app_inbound_outbox WHERE binding_sha256=$1 AND key_sha256=$2 AND status='pending' AND next_attempt_at <= clock_timestamp() ORDER BY stored_at,event_key LIMIT $3`, [this.config.bindingSha256,this.keySha256,limit])).rows;
    const counts={ attempted:0, delivered:0, pending:0, blocked:0 };
    for (const row of rows) { const result=await this.deliver(row.event_key); counts.attempted++; counts[result.status]++; }
    return counts;
  }
}

async function boundedResponse(response) {
  const reader=response.body?.getReader(); if (!reader) throw fail('INVALID_PRIVATE_RECEIPT');
  let count=0; const parts=[];
  try { for (;;) { const {done,value}=await reader.read(); if(done) break; count+=value.byteLength; if(count>4096) { await reader.cancel(); throw fail('INVALID_PRIVATE_RECEIPT'); } parts.push(Buffer.from(value)); } }
  finally { reader.releaseLock(); }
  return Buffer.concat(parts).toString('utf8');
}

module.exports = { APP_INBOUND_URL, OUTBOX_SQL, forwardConfig, inquiriesFromEnvelope, ctwaAttributionFromProviderMessage, receiptDigest, LifeSkillsAppInboundOutbox };
