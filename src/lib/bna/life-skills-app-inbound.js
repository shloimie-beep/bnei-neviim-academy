const crypto = require('node:crypto');
const { normalizeLifeSkillsPhone, lifeSkillsSheetCrmConfig } = require('./life-skills-sheet-crm');

// One destination, using the existing bridge credential. No arbitrary URL,
// provider download/history call, contact/account creation or outbound reply.
const APP_INBOUND_URL = 'https://life-skills.bneineviimacademy.org/api/private/contact-inbound';
const OUTBOX_SQL = `CREATE TABLE IF NOT EXISTS bna_life_skills_app_inbound_outbox (
  binding_sha256 TEXT NOT NULL CHECK (binding_sha256 ~ '^[a-f0-9]{64}$'),
  event_key TEXT NOT NULL CHECK (event_key ~ '^[a-f0-9]{64}$'),
  key_sha256 TEXT NOT NULL CHECK (key_sha256 ~ '^[a-f0-9]{64}$'),
  payload_digest TEXT NOT NULL CHECK (payload_digest ~ '^[a-f0-9]{64}$'),
  payload_ciphertext BYTEA NOT NULL CHECK (octet_length(payload_ciphertext) > 28),
  stored_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','blocked')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  last_code TEXT CHECK (last_code IS NULL OR last_code ~ '^[A-Z0-9_]{1,40}$'),
  PRIMARY KEY (binding_sha256,event_key)
);
CREATE INDEX IF NOT EXISTS idx_bna_life_skills_app_inbound_pending
  ON bna_life_skills_app_inbound_outbox(next_attempt_at) WHERE status='pending';
REVOKE ALL ON bna_life_skills_app_inbound_outbox FROM PUBLIC;`;

function fail(code) { const error = new Error(code); error.code = code; return error; }
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
    if (Buffer.byteLength(JSON.stringify(inquiry)) > 65536) throw fail('INVALID_INQUIRY');
    result.push(inquiry);
  }
  return result;
}

class LifeSkillsAppInboundOutbox {
  constructor(pool, config, fetcher = fetch) {
    if (!config.ready) throw fail('FORWARD_CONFIGURATION_UNAVAILABLE');
    this.pool = pool; this.config = config; this.fetcher = fetcher;
    this.key = Buffer.from(crypto.hkdfSync('sha256', config.secret, 'life-skills-app-inbound-v1', 'outbox-encryption', 32));
    this.hmacKey = Buffer.from(crypto.hkdfSync('sha256', config.secret, 'life-skills-app-inbound-v1', 'outbox-integrity', 32));
    this.keySha256 = crypto.createHash('sha256').update(this.key).digest('hex');
  }
  digest(value) { return crypto.createHmac('sha256', this.hmacKey).update(canonical(value)).digest('hex'); }
  eventKey(inquiry) { return this.digest({ binding:this.config.bindingSha256, id:inquiry.providerEventId }); }
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
  async capture(inquiry) {
    const eventKey = this.eventKey(inquiry), payloadDigest = this.digest(inquiry);
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`ls-app-inbound:${this.config.bindingSha256}:${eventKey}`]);
      const prior = (await db.query(`SELECT payload_digest,key_sha256 FROM bna_life_skills_app_inbound_outbox WHERE binding_sha256=$1 AND event_key=$2`, [this.config.bindingSha256,eventKey])).rows[0];
      if (prior && (prior.payload_digest !== payloadDigest || prior.key_sha256 !== this.keySha256)) throw fail('INQUIRY_REPLAY_CONFLICT');
      if (!prior) await db.query(`INSERT INTO bna_life_skills_app_inbound_outbox(binding_sha256,event_key,key_sha256,payload_digest,payload_ciphertext) VALUES($1,$2,$3,$4,$5)`, [this.config.bindingSha256,eventKey,this.keySha256,payloadDigest,this.seal(inquiry,eventKey)]);
      await db.query('COMMIT'); // Only this committed encrypted row permits ACK.
      return { replayed:Boolean(prior), eventKey };
    } catch (error) { await db.query('ROLLBACK').catch(() => null); throw error; }
    finally { db.release(); }
  }
  async deliver(eventKey) {
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      const row = (await db.query(`SELECT *,next_attempt_at <= clock_timestamp() AS due FROM bna_life_skills_app_inbound_outbox WHERE binding_sha256=$1 AND event_key=$2 FOR UPDATE`, [this.config.bindingSha256,eventKey])).rows[0];
      if (!row) throw fail('OUTBOX_NOT_FOUND');
      if (row.status !== 'pending') { await db.query('COMMIT'); return { status:row.status }; }
      if (!row.due) { await db.query('COMMIT'); return { status:'pending' }; }
      let status='pending', code='TRANSPORT_UNCONFIRMED';
      try {
        const inquiry = this.unseal(row);
        const response = await this.fetcher(APP_INBOUND_URL, { method:'POST', redirect:'error', signal:AbortSignal.timeout(8000),
          headers:{'Content-Type':'application/json','X-Life-Skills-Bridge-Secret':this.config.secret}, body:JSON.stringify(inquiry) });
        if ([200,201].includes(response.status)) {
          const text = await boundedResponse(response);
          const receipt = JSON.parse(text);
          if (receipt.ok === true && typeof receipt.data?.replayed === 'boolean' && typeof receipt.data?.storedAt === 'string' && Number.isFinite(Date.parse(receipt.data.storedAt))) { status='delivered'; code='COMMITTED_PRIVATE_RECEIPT'; }
          else code='INVALID_PRIVATE_RECEIPT';
        } else {
          code=`HTTP_${response.status}`;
          if ([400,401,403,409,413,415].includes(response.status)) status='blocked';
          await response.body?.cancel();
        }
      } catch (error) { if (error.code === 'OUTBOX_INTEGRITY_FAILURE') { status='blocked'; code=error.code; } }
      const delaySeconds = Math.min(3600,30 * 2 ** Math.min(row.attempts,7));
      await db.query(`UPDATE bna_life_skills_app_inbound_outbox SET status=$3, attempts=attempts+1, last_code=$4, delivered_at=CASE WHEN $3='delivered' THEN clock_timestamp() ELSE delivered_at END, next_attempt_at=clock_timestamp()+($5::int*interval '1 second') WHERE binding_sha256=$1 AND event_key=$2`, [this.config.bindingSha256,eventKey,status,code,delaySeconds]);
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

module.exports = { APP_INBOUND_URL, OUTBOX_SQL, forwardConfig, inquiriesFromEnvelope, LifeSkillsAppInboundOutbox };
