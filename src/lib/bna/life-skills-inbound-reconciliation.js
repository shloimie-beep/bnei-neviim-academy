const { detectedLanguage, messageAttribution } = require('./life-skills-sheet-crm');

const RECONCILIATION_SQL=`CREATE TABLE IF NOT EXISTS bna_life_skills_app_inbound_reconciliation (
  binding_sha256 TEXT NOT NULL CHECK (binding_sha256 ~ '^[a-f0-9]{64}$'),
  event_key TEXT NOT NULL CHECK (event_key ~ '^[a-f0-9]{64}$'),
  message_key TEXT NOT NULL CHECK (message_key ~ '^[a-f0-9]{64}$'),
  payload_digest TEXT NOT NULL CHECK (payload_digest ~ '^[a-f0-9]{64}$'),
  capture_epoch TEXT NOT NULL CHECK (capture_epoch ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  sheet_sync_id INTEGER REFERENCES bna_life_skills_sheet_crm_sync(id) ON DELETE RESTRICT,
  private_receipt_status TEXT NOT NULL DEFAULT 'pending' CHECK (private_receipt_status IN ('pending','confirmed','blocked')),
  private_ack_digest TEXT CHECK (private_ack_digest IS NULL OR private_ack_digest ~ '^[a-f0-9]{64}$'),
  private_acknowledged_at TIMESTAMPTZ,
  authority_disposition TEXT NOT NULL DEFAULT 'unresolved' CHECK (authority_disposition IN ('unresolved','sheet_materialized')),
  rollback_disposition TEXT NOT NULL DEFAULT 'sheet_materialization_required' CHECK (rollback_disposition IN ('sheet_materialization_required','not_required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK ((private_ack_digest IS NULL) = (private_acknowledged_at IS NULL)),
  CHECK ((authority_disposition='sheet_materialized') = (rollback_disposition='not_required')),
  PRIMARY KEY(binding_sha256,event_key)
);
CREATE INDEX IF NOT EXISTS idx_bna_ls_inbound_reconciliation_epoch
 ON bna_life_skills_app_inbound_reconciliation(capture_epoch,authority_disposition,private_receipt_status);
REVOKE ALL ON bna_life_skills_app_inbound_reconciliation FROM PUBLIC;`;

function fail(code){const error=new Error(code);error.code=code;return error;}
function epoch(value){const result=String(value||'');if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(result))throw fail('INVALID_WRITER_EPOCH');return result;}
function hex(value){return typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);}

/** Called inside the outbox row transaction. It registers every eligible
 * batch event before provider ACK, without writing Google Sheets. Replays may
 * repair a missing counterpart but never replace original content or epoch. */
async function registerInboundReconciliation(db,{inquiry,bindingSha256,eventKey,messageKey,payloadDigest,captureEpoch,attribution={}}){
  if(!inquiry||inquiry.providerEventId!==inquiry.providerMessageId||![bindingSha256,eventKey,messageKey,payloadDigest].every(hex))throw fail('INBOUND_RECONCILIATION_INVALID');
  const originalEpoch=epoch(captureEpoch);
  await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`ls-inbound-reconcile:${bindingSha256}:${eventKey}`]);
  await db.query(`INSERT INTO bna_life_skills_app_inbound_reconciliation
    (binding_sha256,event_key,message_key,payload_digest,capture_epoch) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT(binding_sha256,event_key) DO NOTHING`,[bindingSha256,eventKey,messageKey,payloadDigest,originalEpoch]);
  const rows=(await db.query(`SELECT message_key,payload_digest,capture_epoch,sheet_sync_id FROM bna_life_skills_app_inbound_reconciliation
    WHERE binding_sha256=$1 AND event_key=$2 FOR UPDATE`,[bindingSha256,eventKey])).rows;
  const retained=rows[0];
  if(rows.length!==1||retained.message_key!==messageKey||retained.payload_digest!==payloadDigest)throw fail('INBOUND_RECONCILIATION_CONFLICT');
  const inserted=(await db.query(`INSERT INTO bna_life_skills_sheet_crm_sync
    (provider_message_id,phone_e164,to_number,push_name,has_media,message_type,occurred_at,attribution,native_binding_sha256,native_event_key)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10) ON CONFLICT(provider_message_id) DO NOTHING RETURNING id,phone_e164,to_number,native_binding_sha256,native_event_key`,
    [inquiry.providerMessageId,inquiry.fromNumber,inquiry.businessNumber,inquiry.pushName||null,Boolean(inquiry.media?.length),inquiry.messageType||null,inquiry.occurredAt,
      JSON.stringify({...messageAttribution(attribution),detected_language:detectedLanguage(inquiry.messageText||''),writer_epoch:retained.capture_epoch}),bindingSha256,eventKey])).rows[0];
  const sheet=inserted||(await db.query(`UPDATE bna_life_skills_sheet_crm_sync SET
    native_binding_sha256=COALESCE(native_binding_sha256,$2),native_event_key=COALESCE(native_event_key,$3),updated_at=clock_timestamp()
    WHERE provider_message_id=$1 AND phone_e164=$4 AND to_number=$5
     AND (native_binding_sha256 IS NULL OR native_binding_sha256=$2)
     AND (native_event_key IS NULL OR native_event_key=$3)
    RETURNING id,phone_e164,to_number,native_binding_sha256,native_event_key`,
    [inquiry.providerMessageId,bindingSha256,eventKey,inquiry.fromNumber,inquiry.businessNumber])).rows[0];
  if(!sheet||sheet.native_binding_sha256!==bindingSha256||sheet.native_event_key!==eventKey)throw fail('INBOUND_RECONCILIATION_CONFLICT');
  if(retained.sheet_sync_id!==null&&Number(retained.sheet_sync_id)!==Number(sheet.id))throw fail('INBOUND_RECONCILIATION_CONFLICT');
  await db.query(`UPDATE bna_life_skills_app_inbound_reconciliation SET sheet_sync_id=$3,updated_at=clock_timestamp()
    WHERE binding_sha256=$1 AND event_key=$2`,[bindingSha256,eventKey,sheet.id]);
  return {captureEpoch:retained.capture_epoch,sheetSyncId:Number(sheet.id)};
}

/** Same pinned public transaction as the outbox delivery marker. A successful
 * private ACK remains receipt_only; it cannot close rollback responsibility. */
async function confirmPrivateReceipt(db,{bindingSha256,eventKey,ackDigest}){
  if(![bindingSha256,eventKey,ackDigest].every(hex))throw fail('INBOUND_RECONCILIATION_INVALID');
  const rows=(await db.query(`UPDATE bna_life_skills_app_inbound_reconciliation SET
    private_receipt_status='confirmed',private_ack_digest=COALESCE(private_ack_digest,$3),
    private_acknowledged_at=COALESCE(private_acknowledged_at,clock_timestamp()),updated_at=clock_timestamp()
    WHERE binding_sha256=$1 AND event_key=$2 AND (private_ack_digest IS NULL OR private_ack_digest=$3)
    RETURNING authority_disposition,rollback_disposition`,[bindingSha256,eventKey,ackDigest])).rows;
  if(rows.length!==1||(rows[0].authority_disposition==='unresolved'&&rows[0].rollback_disposition!=='sheet_materialization_required'))throw fail('INBOUND_RECONCILIATION_CONFLICT');
}

async function markPrivateReceiptBlocked(db,{bindingSha256,eventKey}){
  if(![bindingSha256,eventKey].every(hex))throw fail('INBOUND_RECONCILIATION_INVALID');
  const rows=(await db.query(`UPDATE bna_life_skills_app_inbound_reconciliation SET
    private_receipt_status='blocked',updated_at=clock_timestamp()
    WHERE binding_sha256=$1 AND event_key=$2 AND private_ack_digest IS NULL RETURNING event_key`,
    [bindingSha256,eventKey])).rows;
  if(rows.length!==1)throw fail('INBOUND_RECONCILIATION_CONFLICT');
}

/** Called only after the external Sheet upsert returned and its local sync row
 * was checkpointed. A failed local commit leaves the event retryable; the
 * provider message-id upsert makes the external retry idempotent. */
async function markSheetMaterialized(db,{bindingSha256,eventKey}){
  if(![bindingSha256,eventKey].every(hex))throw fail('INBOUND_RECONCILIATION_INVALID');
  const rows=(await db.query(`UPDATE bna_life_skills_app_inbound_reconciliation r SET authority_disposition='sheet_materialized',
    rollback_disposition='not_required',updated_at=clock_timestamp() FROM bna_life_skills_sheet_crm_sync s
    WHERE r.binding_sha256=$1 AND r.event_key=$2 AND r.sheet_sync_id=s.id AND s.status='synced' RETURNING r.event_key`,
    [bindingSha256,eventKey])).rows;
  if(rows.length!==1)throw fail('INBOUND_RECONCILIATION_CONFLICT');
}

/** Aggregate-only owner readback. Native projection deliberately remains null:
 * neither transport ACK nor Sheet state proves a native CRM outcome/epoch. */
async function readInboundReconciliation(pool,writerEpoch){
  const selected=epoch(writerEpoch||'sheet');
  const row=(await pool.query(`SELECT count(*)::int AS total,
    count(*) FILTER(WHERE private_receipt_status='confirmed' AND authority_disposition='unresolved')::int AS private_receipt_only,
    count(*) FILTER(WHERE private_receipt_status='pending')::int AS private_receipt_pending,
    count(*) FILTER(WHERE private_receipt_status='blocked')::int AS private_receipt_blocked,
    count(*) FILTER(WHERE authority_disposition='sheet_materialized')::int AS sheet_applied,
    count(*) FILTER(WHERE rollback_disposition='sheet_materialization_required')::int AS sheet_replay_required_if_rollback,
    count(*) FILTER(WHERE sheet_sync_id IS NULL)::int AS missing_sheet_receipts
   FROM bna_life_skills_app_inbound_reconciliation WHERE capture_epoch=$1`,[selected])).rows[0];
  return {captureEpoch:selected,total:Number(row.total),privateReceiptOnly:Number(row.private_receipt_only),
    privateReceiptPending:Number(row.private_receipt_pending),privateReceiptBlocked:Number(row.private_receipt_blocked),
    sheetApplied:Number(row.sheet_applied),sheetReplayRequiredIfRollback:Number(row.sheet_replay_required_if_rollback),
    missingSheetReceipts:Number(row.missing_sheet_receipts),authorityEpoch:null,nativeProjectionProofAvailable:false,nativeProjected:null};
}

module.exports={RECONCILIATION_SQL,registerInboundReconciliation,confirmPrivateReceipt,markPrivateReceiptBlocked,markSheetMaterialized,readInboundReconciliation};
