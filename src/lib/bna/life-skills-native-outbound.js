const crypto = require('node:crypto');
const { lifeSkillsCrmWriterState } = require('./life-skills-sheet-crm');
const { forwardConfig } = require('./life-skills-app-inbound');

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowed = new Set(['operationId','authorityEpoch','bindingSha256','leadId','phone','body','recordMode']);
function failure(code, statusCode) { return Object.assign(new Error(code), { code, statusCode }); }
const nativeEpoch = epoch => `native-epoch-${String(epoch).padStart(8, '0')}`;

/** The private app owns recipient resolution, authorization and encrypted
 * pre-send intent. This transport never reads/writes Leads or changes authority.
 * It is disabled under the default Sheet mode and under a generic freeze epoch.
 * Cutover must explicitly bind the receiver to the app's final native epoch.
 */
function validateNativeSend(input, env) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length !== allowed.size || Object.keys(input).some(key => !allowed.has(key)) ||
      typeof input.operationId !== 'string' || !uuid.test(input.operationId) ||
      !Number.isSafeInteger(input.authorityEpoch) || input.authorityEpoch < 1 || input.authorityEpoch > 1000000000 ||
      typeof input.leadId !== 'string' || !/^LS-(?:LEAD|WAPI)-[A-Za-z0-9_-]{1,80}$/.test(input.leadId) ||
      typeof input.phone !== 'string' || !/^\+[1-9][0-9]{7,14}$/.test(input.phone) ||
      typeof input.body !== 'string' || !input.body.trim() || input.body !== input.body.trim() || input.body.length > 2000 ||
      input.recordMode !== 'live') throw failure('INVALID_NATIVE_SEND', 400);
  const writer = lifeSkillsCrmWriterState(env), binding = forwardConfig(env);
  if (!writer.ready || writer.mode !== 'capture_only' || writer.epoch !== nativeEpoch(input.authorityEpoch))
    throw failure('NATIVE_SEND_AUTHORITY_HELD', 423);
  if (!binding.ready || input.bindingSha256 !== binding.bindingSha256)
    throw failure('NATIVE_SEND_BINDING_UNAVAILABLE', 503);
  return { ...input, digest: crypto.createHmac('sha256', binding.secret)
    .update('life-skills-native-send/v1\n').update(JSON.stringify([...allowed].map(key => input[key]))).digest('hex') };
}

/** Uses the EXISTING provider-attempt ledger. A committed but unresolved attempt
 * never resends, including timeout, failed result persistence and process death.
 * Same operation with a changed destination/body/epoch is an explicit conflict.
 */
async function deliverNativeProspectMessage(input, {env, pool, createAttempt, updateResult, send, messageId}) {
  const request = validateNativeSend(input, env), db = await pool.connect();
  // Preserve the existing same-day lead/body duplicate guard across a browser
  // retry with a fresh app operation and across the Sheet-to-native boundary.
  const localDate = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Jerusalem'}).format(new Date());
  const deliveryKey = crypto.createHash('sha256').update(`${request.leadId}\n${request.body}\n${localDate}`).digest('hex');
  let attempt;
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`life-skills-native-send:${request.operationId}`]);
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`life-skills-practitioner-send:${deliveryKey}`]);
    const rows = (await db.query(`SELECT id,metadata,source_context,body FROM bna_contact_communications
      WHERE metadata->>'life_skills_native_operation'=$1 OR metadata->>'life_skills_delivery_key'=$2
      ORDER BY id DESC LIMIT 2`, [request.operationId,deliveryKey])).rows;
    if (rows.length) {
      const sameOperation = rows[0].metadata?.life_skills_native_operation === request.operationId;
      if (rows.length !== 1 || (sameOperation ? rows[0].metadata?.life_skills_native_digest !== request.digest :
          rows[0].body !== request.body || rows[0].metadata?.recipient_phone !== request.phone || rows[0].metadata?.stable_lead_id !== request.leadId))
        throw failure('NATIVE_SEND_OPERATION_CONFLICT', 409);
      const prior = rows[0], status = prior.metadata?.delivery_status;
      if (!['sent','delivered','read','played'].includes(status) || !prior.metadata?.wapi_message_id || !prior.metadata?.checked_at)
        throw failure('NATIVE_SEND_OUTCOME_UNRESOLVED', 409);
      await db.query('COMMIT');
      return { provider:'whapi', providerMessageId:prior.metadata.wapi_message_id,
        sentAt:prior.metadata.checked_at, replaySuppressed:true, sheetUpdated:false };
    }
    attempt = await createAttempt({
      recipient:{to:request.phone, phone:request.phone, contact_type:'life_skills_prospect', match_source:'life_skills_native'},
      messageBody:request.body, summary:'Life Skills practitioner WhatsApp attempted',
      source:'life_skills_private_app', createdBy:'life-skills-practitioner',
      metadata:{life_skills_native_operation:request.operationId, life_skills_native_digest:request.digest,
        life_skills_delivery_key:deliveryKey, stable_lead_id:request.leadId, native_authority_epoch:request.authorityEpoch},
      sourceContext:{stable_lead_id:request.leadId, native_authority_epoch:request.authorityEpoch},
    }, db);
    if (!attempt?.id) throw failure('NATIVE_SEND_LEDGER_UNAVAILABLE', 503);
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK').catch(() => null);
    throw error;
  } finally { db.release(); }
  // No retry here: the app retains its encrypted intent on any unknown outcome.
  const sent = await send({to:request.phone, body:request.body, workspace_key:'', project_key:''});
  const id = messageId(sent.response);
  if (typeof id !== 'string' || !id || id.length > 200) throw failure('NATIVE_SEND_OUTCOME_UNRESOLVED', 503);
  const saved = await updateResult(attempt.id, {sendResult:sent, summary:'Life Skills practitioner WhatsApp sent'});
  if (saved?.metadata?.wapi_message_id !== id || !saved.metadata.checked_at ||
      !['sent','delivered','read','played'].includes(saved.metadata.delivery_status)) throw failure('NATIVE_SEND_LEDGER_UNAVAILABLE', 503);
  return {provider:'whapi', providerMessageId:id, sentAt:saved.metadata.checked_at, replaySuppressed:false, sheetUpdated:false};
}

module.exports = { nativeEpoch, validateNativeSend, deliverNativeProspectMessage };
