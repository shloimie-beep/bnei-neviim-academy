const { createHash } = require('node:crypto');
const { google } = require('googleapis');
const { Pool } = require('pg');

const SPREADSHEET_ID = '1UbbkY6h74L3_sG_m2hcBZ_rmBRLJDO7pYgghrXGdARI';
const SERVICE_ID = '4079db35-5f4a-44ef-a767-3406c74f6005';
const ENVIRONMENT_ID = '3ce30933-49c7-4b90-8c36-a5afd67df329';
const CHANNEL_ID = 'WOLVRN-YRJVR';
const PHONE = '972534932631';
const INTERVAL_MS = 23 * 60 * 60 * 1000 + 55 * 60 * 1000;
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const LOCK_KEYS = [20261004, 972534];
const MARKER = 'LIFE_SKILLS_STATUS_V1';
const HEADER = { asset: "'Asset Registry'!A1:AA600", calendar: "'30-Day Calendar'!A9:O100" };

function value(row, index) { return String(row?.[index] ?? '').trim(); }
function record(cell) {
  try { const parsed = JSON.parse(cell); return parsed.kind === MARKER ? parsed : null; } catch { return null; }
}
function explicitRevision(value) {
  const match = String(value || '').trim().match(/^(?:NUMERIC-)?[rv]?(\d+)(?:-derived)?(?:\/(?:BOLD|APPB))?$/i);
  const revision = match ? Number(match[1]) : null;
  return Number.isSafeInteger(revision) && revision > 0 && revision <= 999999 ? revision : null;
}
function isEligible(asset) {
  return asset && asset.surface === 'VERTICAL' && asset.width === 1080 && asset.height === 1920 &&
    explicitRevision(asset.revision) !== null && asset.id && asset.concept && ['HE', 'EN'].includes(asset.language) &&
    ['OWNER_APPROVED', 'OWNER_APPROVED_EXACT_FILE'].includes(asset.approval) &&
    asset.libraryState === 'CURRENT_APPROVED' && /^[a-f0-9]{64}$/.test(asset.digest) &&
    /^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\//.test(asset.url) &&
    !/REJECT|HOLD|PENDING|REVIEW|SUPERSEDED|DO_NOT_USE/i.test(`${asset.qa} ${asset.readiness}`);
}
function assetFromRow(row, rowNumber) {
  return { rowNumber, id: value(row, 0), concept: Number(value(row, 1)) || null,
    language: value(row, 2).toUpperCase(), surface: value(row, 3).toUpperCase(), revision: value(row, 4),
    width: Number(value(row, 6)), height: Number(value(row, 7)), approval: value(row, 8).toUpperCase(),
    url: value(row, 10), digest: value(row, 12).toLowerCase(), qa: value(row, 18), readiness: value(row, 25).toUpperCase(),
    planned: value(row, 19), slot: value(row, 20), deliveryText: value(row, 21),
    delivery: record(value(row, 21)), libraryState: value(row, 26).toUpperCase() };
}
function calendarFromRow(row, rowNumber) {
  return { rowNumber, slot: value(row, 0), date: value(row, 1), day: value(row, 2),
    status: value(row, 7), assetUrl: value(row, 9), version: value(row, 10), approval: value(row, 11),
    quiet: value(row, 12), scheduler: value(row, 13), receipts: value(row, 14) };
}
function parseWorkbook(result) {
  const [assetRange, calendarRange] = result.data.valueRanges || [];
  return {
    assets: (assetRange?.values || []).slice(1).map((row, index) => assetFromRow(row, index + 2)),
    calendar: (calendarRange?.values || []).slice(1).map((row, index) => calendarFromRow(row, index + 10)),
  };
}
function driveId(url) { return String(url).match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] || null; }
function isoFromEpoch(seconds) { return new Date(seconds * 1000).toISOString(); }
function localStamp(iso) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso)); }
function localDate(iso) { return localStamp(iso).slice(0, 10); }
function quietDate(iso, calendar) {
  const date = localDate(iso);
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short' }).format(new Date(iso));
  if (day === 'Fri' || day === 'Sat') return true;
  return calendar.some(item => item.date === date && quietSlot(item));
}
function calendarHorizonDate(calendar) {
  return calendar.map(item => item.date).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(String(date || '')) &&
    Number.isFinite(Date.parse(`${date}T00:00:00Z`))).sort().at(-1) || null;
}
function nextPermittedAtOrAfter(candidate, calendar, horizonDate) {
  const horizonTime = Date.parse(`${horizonDate}T00:00:00Z`);
  for (let days = 0; days <= 366; days++) {
    const iso = candidate.toISOString();
    if (Date.parse(`${localDate(iso)}T00:00:00Z`) > horizonTime) return null;
    if (!quietDate(iso, calendar)) return iso;
    candidate = new Date(candidate.getTime() + 86400000);
  }
  return null;
}
function quietSlot(slot) {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short' }).format(new Date(`${slot.date}T12:00:00Z`));
  return day === 'Fri' || day === 'Sat' ||
    (/SKIP|QUIET|HOLIDAY|NO POST/i.test(slot.quiet) && !/NO RECORDED|NO HOLIDAY|NO QUIET/i.test(slot.quiet));
}
function nextAllowedIso(confirmedIso, calendar) {
  const confirmedAt = Date.parse(confirmedIso);
  const horizonDate = calendarHorizonDate(calendar);
  if (!Number.isFinite(confirmedAt) || !horizonDate) return null;
  return nextPermittedAtOrAfter(new Date(confirmedAt + INTERVAL_MS), calendar, horizonDate);
}
function successorScheduleIso(confirmedIso, calendar, nextSlot = null) {
  let nextAt = nextAllowedIso(confirmedIso, calendar);
  if (!nextAt || !nextSlot) return nextAt;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(nextSlot.date || ''))) return null;
  const horizonDate = calendarHorizonDate(calendar);
  if (!horizonDate || nextSlot.date > horizonDate) return null;
  let candidate = new Date(nextAt);
  while (localDate(candidate.toISOString()) < nextSlot.date) {
    candidate = new Date(candidate.getTime() + 86400000);
    if (localDate(candidate.toISOString()) > horizonDate) return null;
  }
  nextAt = nextPermittedAtOrAfter(candidate, calendar, horizonDate);
  return nextAt;
}
function heldSuccessorCalendarUpdates(calendar, heldSuccessors) {
  const updates = [], slots = new Set();
  for (const { delivery } of heldSuccessors) {
    const heldSlot = uniqueRow(calendar, 'slot', delivery.anchorSlot);
    if (heldSlot && !slots.has(heldSlot.slot)) {
      slots.add(heldSlot.slot);
      updates.push(cells(`'30-Day Calendar'!H${heldSlot.rowNumber}`, `HELD — ${delivery.error}`),
        cells(`'30-Day Calendar'!N${heldSlot.rowNumber}`, delivery.error));
    }
  }
  return { updates, slots };
}
function scheduledSuccessorCalendarUpdates(slot, scheduledAt) {
  if (!slot) return [];
  return [
    ...(slot.recoverPublisherSelectionHold ? [cells(`'30-Day Calendar'!H${slot.rowNumber}`, slot.calendarRestoreStatus)] : []),
    cells(`'30-Day Calendar'!N${slot.rowNumber}`, `SCHEDULED — ${localStamp(scheduledAt)} Asia/Jerusalem via rolling Status publisher`),
  ];
}
function expectedScheduleMarker(asset, slot) {
  if (asset?.delivery?.state !== 'SCHEDULED' || !asset.delivery.scheduledAt || asset.delivery.anchorSlot !== slot?.slot) return false;
  return slot.scheduler === `SCHEDULED — ${localStamp(asset.delivery.scheduledAt)} Asia/Jerusalem via rolling Status publisher`;
}
function calendarVersionMatches(asset, slot) {
  const version = String(slot?.version || '').split(/[|/]/, 1)[0].trim().toLowerCase();
  const revision = String(asset?.revision || '').trim().toLowerCase();
  return revision && (version === revision || version.startsWith(`${revision} `));
}
function calendarHoldState(slot) {
  const match = `${slot?.status || ''} ${slot?.scheduler || ''}`.match(/\b(HELD|BLOCKED|OFF)\b/i);
  return match ? match[1].toUpperCase() : null;
}
function hasCalendarSendEvidence(slot, ignoreExpectedSchedule = false, ignoreSelectionHold = false) {
  let scheduler = String(slot?.scheduler || '');
  if (ignoreExpectedSchedule) scheduler = '';
  const status = ignoreSelectionHold && slot?.recoverPublisherSelectionHold ? '' : String(slot?.status || '');
  const state = `${status} ${scheduler}`.replace(/no send queued|no post queued/ig, '');
  if (/PUBLISHED|SENDING|RESERVED|UNKNOWN|FAILED|QUEUED|SCHEDULED/i.test(state) ||
      (!(ignoreSelectionHold && slot?.recoverPublisherSelectionHold) && calendarHoldState({ status, scheduler }))) return true;
  const receipt = String(slot?.receipts || '').trim();
  return Boolean(receipt && !/^(?:no provider delivery|no provider call(?: yet)?|no receipt|none|[-—])(?:\s|;|$)/i.test(receipt));
}
function sameAssetAndSlot(asset, slot, { allowExpectedSchedule = false, allowSelectionHold = false } = {}) {
  const expected = allowExpectedSchedule && expectedScheduleMarker(asset, slot);
  return slot && asset.url === slot.assetUrl &&
    String(slot.version || '').toLowerCase().includes(asset.digest) && calendarVersionMatches(asset, slot) &&
    /^Approved$/i.test(slot.approval) && !quietSlot(slot) && !hasCalendarSendEvidence(slot, expected, allowSelectionHold);
}
function noPriorDelivery(asset) {
  if (asset?.delivery?.state === 'HELD' && asset.delivery.holdType === 'SELECTION') return true;
  return !asset.delivery && (!asset.deliveryText || /^(?:No provider delivery|No provider call)/i.test(asset.deliveryText));
}
function calendarSelectionHold(workbook, slot) {
  const error = String(slot?.status || '').match(/^HELD — (.+)$/)?.[1];
  if (!error || slot.scheduler !== error || !/^(?:AMBIGUOUS_NEXT_HEBREW_ASSET|HEBREW_CALENDAR_BINDING_MISMATCH):/.test(error)) return null;
  return workbook.assets.find(asset => asset.delivery?.state === 'HELD' && asset.delivery.holdType === 'SELECTION' &&
    asset.delivery.anchorSlot === slot.slot && asset.delivery.error === error)?.delivery || null;
}
function scheduledIdentityMatches(asset) {
  const delivery = asset?.delivery;
  if (!delivery || delivery.state !== 'SCHEDULED') return false;
  return deliveryAssetIdentityMatches(asset, delivery);
}
function deliveryAssetIdentityMatches(asset, delivery) {
  return delivery?.assetId === asset?.id && Number(delivery?.conceptId) === asset?.concept &&
    String(delivery.language || '').toUpperCase() === asset.language &&
    String(delivery.surface || '').toUpperCase() === asset.surface &&
    String(delivery.revision || '') === asset.revision &&
    String(delivery.sha256 || '').toLowerCase() === asset.digest &&
    String(delivery.driveFileId || '') === driveId(asset.url);
}
function hasPriorConceptDelivery(workbook, candidate) {
  if (!noPriorDelivery(candidate)) return true;
  return workbook.assets.some(other => other !== candidate && other.concept === candidate.concept &&
    other.language === candidate.language && other.surface === candidate.surface && !noPriorDelivery(other));
}
function makeRecord(asset, state, extra = {}) {
  return { kind: MARKER, state, conceptId: asset.concept, assetId: asset.id, language: asset.language,
    surface: asset.surface, revision: asset.revision, sha256: asset.digest, driveFileId: driveId(asset.url),
    ...extra };
}
function validScheduledAt(value) {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}
function invalidScheduledHolds(workbook, heldAt) {
  return workbook.assets.filter(asset => asset.delivery?.state === 'SCHEDULED' && !validScheduledAt(asset.delivery.scheduledAt))
    .map(asset => ({ asset, delivery: { ...asset.delivery, state: 'HELD', heldAt, error: 'SCHEDULED_TIMESTAMP_INVALID: inspect the saved time before rescheduling' } }));
}
function invalidActiveAttemptHolds(workbook, heldAt) {
  return workbook.assets.filter(asset => {
    const delivery = asset.delivery;
    return ['RESERVED', 'SENDING'].includes(delivery?.state) &&
      (!validScheduledAt(delivery.reservedAt) || (delivery.state === 'SENDING' && !validScheduledAt(delivery.submittedAt)));
  }).map(asset => {
    const state = asset.delivery.state === 'SENDING' ? 'UNKNOWN' : 'HELD';
    const action = state === 'UNKNOWN' ? 'inspect provider history before retry' : 'reconcile the active reservation before continuing';
    return { asset, delivery: { ...asset.delivery, state, recoveryAt: heldAt,
      error: `ACTIVE_ATTEMPT_TIMESTAMP_INVALID: ${action}` } };
  });
}
function invalidPublisherRecordHolds(workbook, heldAt) {
  return workbook.assets.filter(asset => {
    const text = asset.deliveryText;
    return !asset.delivery && text && !/^(?:No provider delivery|No provider call(?: yet)?|No post receipt|No receipt|none|[-—])(?:\s|;|$)/i.test(text);
  }).map(asset => {
    const raw = asset.deliveryText;
    const evidence = { malformedRecordSha256: createHash('sha256').update(raw).digest('hex'), malformedRecordLength: raw.length };
    if (raw.length <= 12000) evidence.malformedRecordRaw = raw;
    else evidence.malformedRecordPreview = `${raw.slice(0, 3000)}…${raw.slice(-3000)}`;
    const mayHaveSent = /"state"\s*:\s*"(?:RESERVED|SENDING|UNKNOWN|PUBLISHED|FAILED)"|providerReceiptId|provider receipt|WHAPI:/i.test(raw);
    const state = mayHaveSent ? 'UNKNOWN' : 'HELD';
    const error = mayHaveSent
      ? 'MALFORMED_PUBLISHER_RECORD: inspect provider history before retry'
      : 'MALFORMED_PUBLISHER_RECORD: reconcile saved send state before rescheduling';
    return { asset, delivery: makeRecord(asset, state, { heldAt, holdType: 'MALFORMED_RECORD', error, ...evidence }) };
  });
}
function createClient(env = process.env) {
  const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
  auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
  return { sheets: google.sheets({ version: 'v4', auth }), drive: google.drive({ version: 'v3', auth }) };
}
function provider(env = process.env) {
  const token = env.WHAPI_API_TOKEN || env.WHAPI_TOKEN || env.WAPI_API_TOKEN;
  if (!token) throw new Error('Whapi token unavailable in service runtime');
  const root = new URL(env.WHAPI_API_BASE_URL || env.WHAPI_API_URL || env.WAPI_API_BASE_URL || 'https://gate.whapi.cloud');
  return async (path, options = {}) => {
    const response = await fetch(new URL(path, root), { ...options, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) }, signal: AbortSignal.timeout(30000) });
    return { http: response.status, body: await response.json().catch(() => ({})) };
  };
}
function assertBinding(env, health) {
  if (env.WHAPI_CHANNEL_ID !== CHANNEL_ID || String(env.WHAPI_PHONE || '').replace(/\D/g, '') !== PHONE ||
      health.http !== 200 || health.body.channel_id !== CHANNEL_ID ||
      String(health.body.user?.id || '').replace(/\D/g, '') !== PHONE || health.body.status?.text !== 'AUTH') {
    throw new Error('Whapi business account/channel binding failed');
  }
}
async function exactMedia(drive, asset) {
  const id = driveId(asset.url);
  if (!id) throw new Error('Drive file ID unavailable');
  const metadata = (await drive.files.get({ fileId: id, fields: 'id,mimeType,trashed,size' })).data;
  if (metadata.trashed || metadata.mimeType !== 'image/png') throw new Error('Approved PNG unavailable');
  const declaredSize = Number(metadata.size);
  if (!Number.isSafeInteger(declaredSize) || declaredSize < 33 || declaredSize > MAX_MEDIA_BYTES)
    throw new Error('Approved PNG size is unavailable or exceeds maximum size');
  const media = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' });
  const bytes = await readBounded(media.data, Math.min(MAX_MEDIA_BYTES, declaredSize));
  if (bytes.length !== declaredSize) throw new Error('Approved PNG size changed during download');
  if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a' || bytes.readUInt32BE(16) !== 1080 || bytes.readUInt32BE(20) !== 1920 ||
      createHash('sha256').update(bytes).digest('hex') !== asset.digest) throw new Error('Approved PNG bytes/hash/dimensions mismatch');
  return bytes;
}
async function readBounded(stream, maxBytes) {
  if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') throw new Error('Approved PNG download stream unavailable');
  const chunks = [];
  let total = 0;
  try {
    for await (const chunk of stream) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += bytes.length;
      if (total > maxBytes) throw new Error('Approved PNG download exceeds maximum size');
      chunks.push(bytes);
    }
  } catch (error) {
    stream.destroy?.();
    throw error;
  }
  return Buffer.concat(chunks, total);
}
function receiptId(body) { return body?.id || body?.message?.id || body?.messages?.[0]?.id || body?.sent?.[0]?.id || null; }
function ownStories(body) { return body?.messages || body?.stories || []; }
function verifiedStoryReadback(result, id) {
  const item = result?.body?.message || result?.body;
  if (result?.http !== 200 || item?.id !== id || item?.type !== 'story' || item?.status !== 'read' || !item?.image ||
      Number(item.image.width) !== 1080 || Number(item.image.height) !== 1920 || Number(item.timestamp) <= 0) return null;
  return { id, timestamp: Number(item.timestamp), type: item.type,
    width: Number(item.image.width), height: Number(item.image.height) };
}
async function verifyStory(api, id) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await api(`/stories/${encodeURIComponent(id)}`);
    const verified = verifiedStoryReadback(result, id);
    if (verified) return { ...verified, verifiedAt: new Date().toISOString() };
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  return null;
}
function cells(range, value) { return { range, values: [[String(value)]] }; }
async function write(sheets, data) {
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: SPREADSHEET_ID, requestBody: { valueInputOption: 'RAW', data } });
}
function nextAsset(workbook, language, anchorSlot) {
  if (language === 'EN') {
    const candidates = workbook.assets.filter(asset => asset.language === 'EN' && isEligible(asset) && !hasPriorConceptDelivery(workbook, asset))
      .sort((a, b) => a.concept - b.concept || a.rowNumber - b.rowNumber);
    if (!candidates.length) return null;
    const conceptId = candidates[0].concept;
    const sameConcept = candidates.filter(asset => asset.concept === conceptId);
    if (sameConcept.length !== 1) return { state: 'HELD', reason: 'AMBIGUOUS_NEXT_ENGLISH_ASSET', conceptId, candidates: sameConcept };
    return sameConcept[0];
  }
  const anchor = Number(String(anchorSlot || '').match(/\d+/)?.[0] || 0);
  const slots = workbook.calendar.map(slot => ({ slot, number: Number(slot.slot.match(/^D(\d+)$/i)?.[1] || 0) }))
    .filter(item => item.number > anchor)
    .sort((left, right) => left.number - right.number || String(left.slot.date).localeCompare(String(right.slot.date)) || left.slot.rowNumber - right.slot.rowNumber);
  for (const { slot, number } of slots) {
    if (workbook.calendar.filter(item => item.slot === slot.slot).length !== 1)
      return { state: 'HELD', reason: 'DUPLICATE_HEBREW_CALENDAR_SLOT', conceptId: number, candidates: [], slot, preserveCalendarHold: true };
    const conceptAssets = workbook.assets.filter(item => item.language === 'HE' && item.concept === number && isEligible(item) && !hasPriorConceptDelivery(workbook, item));
    const calendarHold = calendarHoldState(slot);
    const selectionHold = calendarSelectionHold(workbook, slot);
    if (calendarHold && !selectionHold) return { state: 'HELD', reason: `HEBREW_CALENDAR_${calendarHold}`, conceptId: number,
      candidates: conceptAssets, slot, preserveCalendarHold: true };
    if (!conceptAssets.length) continue;
    const selectionSlot = selectionHold ? { ...slot, recoverPublisherSelectionHold: true } : slot;
    const matches = conceptAssets.filter(item => sameAssetAndSlot(item, selectionSlot, { allowSelectionHold: Boolean(selectionHold) }));
    if (matches.length > 1) return { state: 'HELD', reason: 'AMBIGUOUS_NEXT_HEBREW_ASSET', conceptId: number, candidates: matches, slot };
    if (matches.length === 1) return { asset: matches[0], slot: selectionHold ? { ...selectionSlot,
      calendarRestoreStatus: selectionHold.calendarRestoreStatus, calendarRestoreScheduler: selectionHold.calendarRestoreScheduler } : slot };
    return { state: 'HELD', reason: 'HEBREW_CALENDAR_BINDING_MISMATCH', conceptId: number, candidates: conceptAssets, slot };
  }
  return null;
}
function holdAmbiguousNextTurn(selection, heldAt) {
  if (selection?.state !== 'HELD' || !Array.isArray(selection.candidates)) return [];
  if (selection.preserveCalendarHold) return [];
  const candidateAssetIds = selection.candidates.map(asset => asset.id);
  const error = selection.reason === 'HEBREW_CALENDAR_BINDING_MISMATCH'
    ? `${selection.reason}: concept ${selection.conceptId}; renew the exact calendar binding before scheduling`
    : `${selection.reason}: concept ${selection.conceptId}; choose one exact approved asset before scheduling`;
  return selection.candidates.map(asset => {
    const calendarRestoreStatus = asset.delivery?.holdType === 'SELECTION' ? asset.delivery.calendarRestoreStatus : selection.slot?.status;
    const calendarRestoreScheduler = asset.delivery?.holdType === 'SELECTION' ? asset.delivery.calendarRestoreScheduler : selection.slot?.scheduler;
    return { asset, slot: selection.slot || null,
      delivery: makeRecord(asset, 'HELD', { heldAt, error, holdType: 'SELECTION', candidateAssetIds,
        ...(selection.slot ? { anchorSlot: selection.slot.slot, calendarRestoreStatus, calendarRestoreScheduler } : {}) }) };
  });
}
function scheduledPreflight(workbook, now = Date.now()) {
  const malformed = workbook.assets.filter(item => item.delivery?.holdType === 'MALFORMED_RECORD' &&
    ['HELD', 'UNKNOWN'].includes(item.delivery.state));
  if (malformed.length) {
    const state = malformed.some(item => item.delivery.state === 'UNKNOWN') ? 'UNKNOWN' : 'HELD';
    return { state, reason: 'MALFORMED_PUBLISHER_RECORD_REQUIRES_RECONCILIATION', assetIds: malformed.map(item => item.id) };
  }
  const scheduled = workbook.assets.filter(item => item.delivery?.state === 'SCHEDULED');
  if (scheduled.length > 1) return { state: 'HELD', reason: 'Multiple scheduled Status records need reconciliation', assetIds: scheduled.map(item => item.id) };
  const due = scheduled.filter(item => Date.parse(item.delivery.scheduledAt) <= now);
  if (!due.length) return { state: 'WAITING', next: scheduled.map(item => ({ assetId: item.id, scheduledAt: item.delivery.scheduledAt })) };
  return { state: 'DUE', asset: due[0] };
}
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
}
function sameDelivery(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}
function sameAssetSource(left, right) {
  return ['rowNumber', 'id', 'concept', 'language', 'surface', 'revision', 'width', 'height', 'approval',
    'url', 'digest', 'qa', 'readiness', 'planned', 'slot', 'libraryState'].every(key => left?.[key] === right?.[key]);
}
function sameCalendarSource(left, right) {
  return ['rowNumber', 'slot', 'date', 'day', 'status', 'assetUrl', 'version', 'approval', 'quiet', 'scheduler', 'receipts']
    .every(key => left?.[key] === right?.[key]);
}
function sameCalendarBinding(left, right) {
  return ['rowNumber', 'slot', 'date', 'day', 'assetUrl', 'version', 'approval', 'quiet', 'receipts']
    .every(key => left?.[key] === right?.[key]);
}
function sameCalendarIdentity(left, right) {
  return ['slot', 'date', 'day', 'assetUrl', 'version', 'approval', 'quiet']
    .every(key => left?.[key] === right?.[key]);
}
function uniqueRow(rows, key, value) {
  const matches = rows.filter(row => row?.[key] === value);
  return matches.length === 1 ? matches[0] : null;
}
function publicationResultPreflight(original, current, { assetId, baselineAsset, baselineSlot = null, expectedDelivery } = {}) {
  const originalAsset = uniqueRow(original.assets, 'id', assetId);
  const asset = uniqueRow(current.assets, 'id', assetId);
  if (!originalAsset || !asset || !sameDelivery(asset.delivery, expectedDelivery) || expectedDelivery?.state !== 'SENDING')
    return { ok: false, reason: 'Provider result cannot be bound to the unique unchanged SENDING record' };
  const bindingFields = ['id', 'concept', 'language', 'surface', 'revision', 'width', 'height', 'approval',
    'url', 'digest', 'qa', 'readiness', 'planned', 'slot', 'libraryState'];
  const assetBindingChanged = !bindingFields.every(key => baselineAsset?.[key] === asset?.[key]);
  let slot = null;
  let canWriteCalendarReceipt = false;
  let canUpdateCalendarState = false;
  if (baselineSlot) {
    slot = uniqueRow(current.calendar, 'slot', baselineSlot.slot);
    const uniqueOriginalSlot = uniqueRow(original.calendar, 'slot', baselineSlot.slot);
    if (slot && uniqueOriginalSlot && sameCalendarIdentity(baselineSlot, slot) &&
        slot.receipts === baselineSlot.receipts) {
      canWriteCalendarReceipt = true;
      canUpdateCalendarState = slot.status === `SENDING — ${assetId}` &&
        slot.scheduler === 'SENDING — rolling Status publisher';
    }
  }
  return { ok: true, asset, slot: canWriteCalendarReceipt ? slot : null, canWriteCalendarReceipt,
    canUpdateCalendarState, assetBindingChanged };
}
function reservationPreflightMatches(original, current, { initial = false, assetId, anchorSlot, now = Date.now() } = {}) {
  const oldAsset = uniqueRow(original.assets, 'id', assetId);
  const asset = uniqueRow(current.assets, 'id', assetId);
  if (!oldAsset || !asset || !sameAssetSource(oldAsset, asset) || !isEligible(asset))
    return { ok: false, reason: 'Asset Registry approval or exact revision changed before reservation' };
  if (initial) {
    if (!noPriorDelivery(oldAsset) || !noPriorDelivery(asset))
      return { ok: false, reason: 'Asset already has send or receipt state before reservation' };
  } else if (!sameDelivery(oldAsset.delivery, asset.delivery) || !scheduledIdentityMatches(asset) ||
      !validScheduledAt(asset.delivery?.scheduledAt) || Date.parse(asset.delivery.scheduledAt) > now) {
    return { ok: false, reason: 'Scheduled Asset Registry reservation changed before sending' };
  }
  const calendarSlot = asset.language === 'HE' ? anchorSlot : null;
  let slot = null;
  if (calendarSlot) {
    const oldSlot = uniqueRow(original.calendar, 'slot', calendarSlot);
    slot = uniqueRow(current.calendar, 'slot', calendarSlot);
    if (!oldSlot || !slot || !sameCalendarSource(oldSlot, slot) ||
        !sameAssetAndSlot(asset, slot, { allowExpectedSchedule: !initial }))
      return { ok: false, reason: 'Calendar approval, hold, quiet-day, or exact asset binding changed before reservation' };
  }
  if (quietDate(new Date(now).toISOString(), current.calendar))
    return { ok: false, reason: 'Quiet-day restriction became active before reservation' };
  return { ok: true, asset, slot };
}
function publisherStatePreflightMatches(workbook, { baselineAsset, baselineSlot = null, expectedDelivery, now = Date.now() } = {}) {
  const asset = uniqueRow(workbook.assets, 'id', baselineAsset?.id);
  if (!asset || !sameAssetSource(baselineAsset, asset) || !isEligible(asset) ||
      !sameDelivery(asset.delivery, expectedDelivery) || !deliveryAssetIdentityMatches(asset, expectedDelivery) ||
      !['RESERVED', 'SENDING'].includes(expectedDelivery?.state))
    return { ok: false, reason: 'Asset, approval, or reserved send state changed before provider POST' };
  if (workbook.assets.some(item => item.id !== asset.id && ['SCHEDULED', 'RESERVED', 'SENDING'].includes(item.delivery?.state)))
    return { ok: false, reason: 'Another Status send or schedule appeared before provider POST' };
  if (workbook.assets.some(other => other !== asset && other.concept === asset.concept &&
      other.language === asset.language && other.surface === asset.surface && !noPriorDelivery(other)))
    return { ok: false, reason: 'A duplicate concept/language send state appeared before provider POST' };
  let slot = null;
  if (baselineSlot) {
    slot = uniqueRow(workbook.calendar, 'slot', baselineSlot.slot);
    const marker = `${expectedDelivery.state} — ${asset.id}`;
    const scheduler = `${expectedDelivery.state} — rolling Status publisher`;
    if (!slot || !sameCalendarBinding(baselineSlot, slot) || slot.status !== marker || slot.scheduler !== scheduler ||
        calendarHoldState(slot) || quietSlot(slot))
      return { ok: false, reason: 'Calendar hold, approval, exact binding, or receipt changed before provider POST' };
  }
  if (quietDate(new Date(now).toISOString(), workbook.calendar))
    return { ok: false, reason: 'Quiet-day restriction became active before provider POST' };
  return { ok: true, asset, slot };
}
function successorPreflightMatches(original, current, selection, { nextLanguage, publishingAssetId, anchorSlot, now = Date.now() } = {}) {
  if (!selection) return { ok: false, reason: 'NO_ELIGIBLE_EXACT_APPROVED_ASSET' };
  if (selection.state === 'HELD' && selection.preserveCalendarHold)
    return { ok: true, selection, preserveHold: true };
  const currentSelection = nextAsset(current, nextLanguage, anchorSlot);
  if (selection.state === 'HELD') {
    const originalIds = (selection.candidates || []).map(item => item.id).sort();
    const currentIds = (currentSelection?.candidates || []).map(item => item.id).sort();
    if (currentSelection?.state !== 'HELD' || currentSelection.reason !== selection.reason ||
        currentSelection.conceptId !== selection.conceptId || JSON.stringify(currentIds) !== JSON.stringify(originalIds))
      return { ok: false, reason: 'SUCCESSOR_SELECTION_CHANGED_BEFORE_SCHEDULE' };
  } else {
    const currentAsset = currentSelection?.asset || currentSelection;
    const selectedAsset = selection.asset || selection;
    if (!currentAsset || currentSelection?.state === 'HELD' || currentAsset.id !== selectedAsset.id)
      return { ok: false, reason: 'SUCCESSOR_SELECTION_CHANGED_BEFORE_SCHEDULE' };
  }
  const candidates = currentSelection.state === 'HELD' ? currentSelection.candidates : [currentSelection.asset || currentSelection];
  if (!Array.isArray(candidates) || !candidates.length)
    return { ok: false, reason: selection.reason || 'NO_ELIGIBLE_EXACT_APPROVED_ASSET' };
  if (current.assets.some(item => item.delivery?.state === 'SCHEDULED' ||
      (item.id !== publishingAssetId && ['RESERVED', 'SENDING'].includes(item.delivery?.state))))
    return { ok: false, reason: 'ANOTHER_STATUS_SEND_OR_SCHEDULE_APPEARED_BEFORE_SUCCESSOR_SCHEDULE' };
  const refreshed = [];
  for (const candidate of candidates) {
    const originalCandidate = uniqueRow(original.assets, 'id', candidate.id);
    const asset = uniqueRow(current.assets, 'id', candidate.id);
    if (!originalCandidate || !asset || asset.language !== nextLanguage || !sameAssetSource(originalCandidate, asset) ||
        !isEligible(asset) || !noPriorDelivery(originalCandidate) || !noPriorDelivery(asset) ||
        hasPriorConceptDelivery(current, asset))
      return { ok: false, reason: 'SUCCESSOR_ASSET_APPROVAL_OR_EXACT_REVISION_CHANGED_BEFORE_SCHEDULE' };
    refreshed.push(asset);
  }
  let slot = null;
  if (nextLanguage === 'HE') {
    const oldSlot = selection.slot;
    slot = uniqueRow(current.calendar, 'slot', oldSlot?.slot);
    const recoverSelectionHold = Boolean(oldSlot?.recoverPublisherSelectionHold && currentSelection?.slot?.recoverPublisherSelectionHold);
    if (slot && recoverSelectionHold) slot = { ...slot, recoverPublisherSelectionHold: true,
      calendarRestoreStatus: currentSelection.slot.calendarRestoreStatus,
      calendarRestoreScheduler: currentSelection.slot.calendarRestoreScheduler };
    if (!oldSlot || !slot || !sameCalendarSource(oldSlot, slot) ||
        refreshed.some(asset => !sameAssetAndSlot(asset, slot, { allowSelectionHold: recoverSelectionHold })) || quietSlot(slot))
      return { ok: false, reason: 'SUCCESSOR_CALENDAR_HOLD_OR_EXACT_BINDING_CHANGED_BEFORE_SCHEDULE' };
  }
  if (quietDate(new Date(now).toISOString(), current.calendar))
    return { ok: false, reason: 'SUCCESSOR_QUIET_DAY_RESTRICTION_ACTIVE' };
  const nextSelection = currentSelection.state === 'HELD'
    ? { ...currentSelection, candidates: refreshed, slot: slot || currentSelection.slot }
    : currentSelection.asset
      ? { ...currentSelection, asset: refreshed[0], slot: slot || currentSelection.slot }
      : refreshed[0];
  return { ok: true, selection: nextSelection, workbook: current, preserveHold: false };
}
function pendingSuccessorPlan(workbook, now = Date.now()) {
  const pending = workbook.assets.filter(asset => asset.delivery?.state === 'PUBLISHED' && asset.delivery.nextTurnHold?.state === 'HELD');
  if (!pending.length) return null;
  if (pending.length !== 1) return { state: 'HELD', reason: 'MULTIPLE_UNRESOLVED_NEXT_TURN_HOLDS', assetIds: pending.map(asset => asset.id) };
  const predecessor = pending[0];
  const delivery = predecessor.delivery;
  const nextLanguage = String(delivery.nextTurnHold.language || '').toUpperCase();
  const expectedLanguage = delivery.language === 'HE' ? 'EN' : (delivery.language === 'EN' ? 'HE' : null);
  if (!expectedLanguage || nextLanguage !== expectedLanguage || !delivery.providerReceiptId || !delivery.used ||
      delivery.providerType !== 'story' || Number(delivery.providerWidth) !== 1080 || Number(delivery.providerHeight) !== 1920 ||
      !deliveryAssetIdentityMatches(predecessor, delivery) ||
      !validScheduledAt(delivery.confirmedAt) || !validScheduledAt(delivery.verificationAt))
    return { state: 'HELD', predecessor, reason: 'PREDECESSOR_PUBLICATION_RECEIPT_OR_NEXT_LANGUAGE_UNVERIFIED' };
  const selection = nextAsset(workbook, nextLanguage, delivery.anchorSlot);
  if (!selection || selection.state === 'HELD')
    return { state: 'HELD', predecessor, reason: selection?.reason || delivery.nextTurnHold.reason || 'NO_ELIGIBLE_EXACT_APPROVED_ASSET' };
  const preflight = successorPreflightMatches(workbook, workbook, selection,
    { nextLanguage, publishingAssetId: predecessor.id, anchorSlot: delivery.anchorSlot, now });
  if (!preflight.ok) return { state: 'HELD', predecessor, reason: preflight.reason };
  const resolvedSelection = preflight.selection;
  const asset = resolvedSelection?.asset || resolvedSelection;
  const slot = resolvedSelection?.slot || null;
  const scheduledAt = successorScheduleIso(delivery.confirmedAt, workbook.calendar, slot);
  if (!scheduledAt) return { state: 'HELD', predecessor, asset, slot, reason: 'SUCCESSOR_SCHEDULE_HORIZON_EXHAUSTED' };
  if (Date.parse(scheduledAt) <= now)
    return { state: 'HELD', predecessor, asset, slot, scheduledAt, reason: 'SUCCESSOR_SCHEDULE_TIME_PASSED_NO_BACKFILL' };
  return { state: 'READY', predecessor, selection: resolvedSelection, asset, slot, nextLanguage, scheduledAt };
}
function pendingSuccessorPreflightMatches(original, current, plan, { now = Date.now() } = {}) {
  if (plan?.state !== 'READY') return { ok: false, reason: plan?.reason || 'NO_RESOLVABLE_HELD_SUCCESSOR' };
  const originalPredecessor = uniqueRow(original.assets, 'id', plan.predecessor?.id);
  const predecessor = uniqueRow(current.assets, 'id', plan.predecessor?.id);
  if (!originalPredecessor || !predecessor || !sameDelivery(originalPredecessor.delivery, plan.predecessor.delivery) ||
      !sameDelivery(predecessor.delivery, plan.predecessor.delivery))
    return { ok: false, reason: 'PUBLISHED_PREDECESSOR_OR_HELD_TURN_CHANGED_BEFORE_SCHEDULE' };
  const refreshed = pendingSuccessorPlan(current, now);
  if (refreshed?.state !== 'READY' || refreshed.predecessor.id !== predecessor.id || refreshed.asset.id !== plan.asset.id)
    return { ok: false, reason: refreshed?.reason || 'HELD_SUCCESSOR_SELECTION_CHANGED_BEFORE_SCHEDULE' };
  return { ok: true, plan: refreshed };
}
async function holdOwnReservation(sheets, workbook, { assetId, expectedDelivery, baselineSlot, reason, now = new Date().toISOString() }) {
  const asset = uniqueRow(workbook.assets, 'id', assetId);
  if (!asset || !sameDelivery(asset.delivery, expectedDelivery)) return false;
  const held = { ...expectedDelivery, state: 'HELD', heldAt: now, error: reason };
  const updates = [cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(held))];
  if (baselineSlot) {
    const slot = uniqueRow(workbook.calendar, 'slot', baselineSlot.slot);
    const ownMarker = `${expectedDelivery.state} — ${asset.id}`;
    const ownScheduler = `${expectedDelivery.state} — rolling Status publisher`;
    if (slot && sameCalendarBinding(baselineSlot, slot) && slot.status === ownMarker && slot.scheduler === ownScheduler) {
      updates.push(cells(`'30-Day Calendar'!H${slot.rowNumber}`, `HELD — ${asset.id}`),
        cells(`'30-Day Calendar'!N${slot.rowNumber}`, reason));
    }
  }
  await write(sheets, updates);
  return true;
}
async function lockedRun({ initial = false, dryRun = false, env = process.env, pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 }) } = {}) {
  const db = await pool.connect();
  let locked = false;
  try {
    const lock = await db.query('SELECT pg_try_advisory_lock($1, $2) AS acquired', LOCK_KEYS);
    locked = lock.rows[0]?.acquired === true;
    if (!locked) return { state: 'HELD', reason: 'Another Status publisher holds the production lock' };
    const { sheets, drive } = createClient(env);
    const api = provider(env);
    const workbook = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID, ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
    let asset, slot, scheduledAt, anchorSlot;
    if (initial) {
      slot = workbook.calendar.find(item => item.slot === 'D20' && item.date === '2026-10-04');
      asset = workbook.assets.find(item => item.id === 'C20-HE-STATUS-WHITE-v04-FROZEN');
      if (!isEligible(asset) || !noPriorDelivery(asset) || !sameAssetAndSlot(asset, slot) || quietDate(new Date().toISOString(), workbook.calendar))
        return { state: 'HELD', reason: 'C20 current approval, reservation, publication, or quiet-day preflight failed',
          checks: { eligible: isEligible(asset), unused: noPriorDelivery(asset), calendar: sameAssetAndSlot(asset, slot), quiet: quietDate(new Date().toISOString(), workbook.calendar),
            registryRow: asset?.rowNumber || null, calendarRow: slot?.rowNumber || null } };
      scheduledAt = new Date().toISOString(); anchorSlot = slot.slot;
      const recent = await api('/stories?from_me=true&count=50');
      if (recent.http !== 200 || !Array.isArray(ownStories(recent.body)) || ownStories(recent.body).some(item => Number(item.timestamp) >= 1791061200))
        return { state: 'HELD', reason: 'Recent provider Status history needs reconciliation before first send' };
    } else {
      const invalidSchedules = invalidScheduledHolds(workbook, new Date().toISOString());
      if (invalidSchedules.length) {
        const updates = invalidSchedules.flatMap(({ asset, delivery }) => {
          const heldSlot = asset.language === 'HE' ? workbook.calendar.find(item => item.slot === delivery.anchorSlot) : null;
          return [cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(delivery)),
            ...(heldSlot ? [cells(`'30-Day Calendar'!H${heldSlot.rowNumber}`, `HELD — ${asset.id}`),
              cells(`'30-Day Calendar'!N${heldSlot.rowNumber}`, delivery.error)] : [])];
        });
        await write(sheets, updates);
        return { state: 'HELD', reason: 'SCHEDULED_TIMESTAMP_INVALID', assetIds: invalidSchedules.map(({ asset }) => asset.id) };
      }
      const invalidRecords = invalidPublisherRecordHolds(workbook, new Date().toISOString());
      if (invalidRecords.length) {
        await write(sheets, invalidRecords.map(({ asset, delivery }) =>
          cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(delivery))));
        const state = invalidRecords.some(item => item.delivery.state === 'UNKNOWN') ? 'UNKNOWN' : 'HELD';
        return { state, reason: 'MALFORMED_PUBLISHER_RECORD_REQUIRES_RECONCILIATION',
          assetIds: invalidRecords.map(({ asset }) => asset.id) };
      }
      const invalidAttempts = invalidActiveAttemptHolds(workbook, new Date().toISOString());
      if (invalidAttempts.length) {
        const updates = [];
        for (const { asset, delivery } of invalidAttempts) {
          updates.push(cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(delivery)));
          const oldState = asset.delivery.state;
          const heldSlot = asset.language === 'HE' ? uniqueRow(workbook.calendar, 'slot', asset.delivery.anchorSlot) : null;
          if (heldSlot && heldSlot.status === `${oldState} — ${asset.id}` &&
              heldSlot.scheduler === `${oldState} — rolling Status publisher`) {
            updates.push(cells(`'30-Day Calendar'!H${heldSlot.rowNumber}`, `${delivery.state} — ${asset.id}`),
              cells(`'30-Day Calendar'!N${heldSlot.rowNumber}`, delivery.error));
          }
        }
        await write(sheets, updates);
        const state = invalidAttempts.some(item => item.delivery.state === 'UNKNOWN') ? 'UNKNOWN' : 'HELD';
        return { state, reason: 'ACTIVE_ATTEMPT_TIMESTAMP_INVALID', assetIds: invalidAttempts.map(({ asset }) => asset.id) };
      }
      const stale = workbook.assets.find(item => ['RESERVED', 'SENDING'].includes(item.delivery?.state) &&
        Date.parse(item.delivery.reservedAt) <= Date.now() - 10 * 60 * 1000);
      if (stale) {
        const state = stale.delivery.state === 'SENDING' ? 'UNKNOWN' : 'FAILED';
        const updated = { ...stale.delivery, state, recoveryAt: new Date().toISOString(), error: 'Publisher process ended before verification; inspect provider history before retry' };
        const staleSlot = stale.language === 'HE' ? workbook.calendar.find(item => item.slot === stale.delivery.anchorSlot) : null;
        await write(sheets, [cells(`'Asset Registry'!V${stale.rowNumber}`, JSON.stringify(updated)),
          ...(staleSlot ? [cells(`'30-Day Calendar'!H${staleSlot.rowNumber}`, `${state} — ${stale.id}`),
            cells(`'30-Day Calendar'!N${staleSlot.rowNumber}`, `${state} — reconcile provider before retry`)] : [])]);
        return { state, assetId: stale.id, reason: 'Stale publisher attempt requires provider reconciliation' };
      }
      const schedule = scheduledPreflight(workbook);
    if (schedule.state === 'WAITING' && !schedule.next?.length && !dryRun) {
      const pendingPlan = pendingSuccessorPlan(workbook, Date.now());
      if (pendingPlan) {
        if (pendingPlan.state !== 'READY')
          return { state: pendingPlan.state, assetId: pendingPlan.predecessor?.id || null, reason: pendingPlan.reason };
        const latestForSuccessor = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
          ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
        const pendingCheck = pendingSuccessorPreflightMatches(workbook, latestForSuccessor, pendingPlan, { now: Date.now() });
        if (!pendingCheck.ok) return { state: 'HELD', assetId: pendingPlan.predecessor.id, reason: pendingCheck.reason };
        const resolved = pendingCheck.plan;
        const queuedAt = new Date().toISOString();
        const predecessorDelivery = { ...resolved.predecessor.delivery,
          nextTurnHold: { ...resolved.predecessor.delivery.nextTurnHold, state: 'RESOLVED', resolvedAt: queuedAt,
            scheduledAssetId: resolved.asset.id, scheduledAt: resolved.scheduledAt } };
        const scheduledDelivery = makeRecord(resolved.asset, 'SCHEDULED', { queuedAt, scheduledAt: resolved.scheduledAt,
          anchorSlot: resolved.slot?.slot || resolved.predecessor.delivery.anchorSlot,
          predecessorReceiptId: resolved.predecessor.delivery.providerReceiptId });
        const updates = [cells(`'Asset Registry'!V${resolved.predecessor.rowNumber}`, JSON.stringify(predecessorDelivery)),
          cells(`'Asset Registry'!T${resolved.asset.rowNumber}`, `${localStamp(resolved.scheduledAt)} Asia/Jerusalem`),
          cells(`'Asset Registry'!V${resolved.asset.rowNumber}`, JSON.stringify(scheduledDelivery)),
          ...scheduledSuccessorCalendarUpdates(resolved.slot, resolved.scheduledAt)];
        await write(sheets, updates);
        const readback = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
          ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
        const previous = uniqueRow(readback.assets, 'id', resolved.predecessor.id)?.delivery;
        const scheduled = uniqueRow(readback.assets, 'id', resolved.asset.id)?.delivery;
        if (previous?.providerReceiptId !== resolved.predecessor.delivery.providerReceiptId ||
            previous?.nextTurnHold?.state !== 'RESOLVED' || previous.nextTurnHold.scheduledAssetId !== resolved.asset.id ||
            previous.nextTurnHold.scheduledAt !== resolved.scheduledAt || scheduled?.state !== 'SCHEDULED' ||
            scheduled.scheduledAt !== resolved.scheduledAt || scheduled.predecessorReceiptId !== previous.providerReceiptId)
          throw new Error('Canonical held-successor recovery readback failed');
        if (resolved.slot) {
          const calendarSlot = uniqueRow(readback.calendar, 'slot', resolved.slot.slot);
          const expectedStatus = resolved.slot.recoverPublisherSelectionHold ? resolved.slot.calendarRestoreStatus : resolved.slot.status;
          const expectedScheduler = `SCHEDULED — ${localStamp(resolved.scheduledAt)} Asia/Jerusalem via rolling Status publisher`;
          if (calendarSlot?.status !== expectedStatus || calendarSlot.scheduler !== expectedScheduler)
            throw new Error('Canonical held-successor Calendar readback failed');
        }
        return { state: 'SCHEDULED', assetId: resolved.asset.id, language: resolved.asset.language,
          scheduledAt: resolved.scheduledAt, predecessorReceiptId: resolved.predecessor.delivery.providerReceiptId,
          schedulerReadback: true };
      }
    }
      if (schedule.state !== 'DUE') return schedule;
      asset = schedule.asset; scheduledAt = asset.delivery.scheduledAt; anchorSlot = asset.delivery.anchorSlot;
      slot = asset.language === 'HE' ? workbook.calendar.find(item => item.slot === anchorSlot) : null;
      const bindingMatches = scheduledIdentityMatches(asset);
      const calendarMatches = asset.language !== 'HE' || (slot && sameAssetAndSlot(asset, slot, { allowExpectedSchedule: true }));
      if (!isEligible(asset) || !bindingMatches || quietDate(new Date().toISOString(), workbook.calendar) || !calendarMatches) {
        const held = { ...asset.delivery, state: 'HELD', heldAt: new Date().toISOString(), error: 'Scheduled approval, exact asset binding, calendar, or quiet-day preflight failed' };
        await write(sheets, [cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(held)),
          ...(slot ? [cells(`'30-Day Calendar'!H${slot.rowNumber}`, `HELD — ${asset.id}`),
            cells(`'30-Day Calendar'!N${slot.rowNumber}`, 'HELD — publisher preflight requires review')] : [])]);
        return { state: 'HELD', assetId: asset.id, reason: held.error };
      }
    }
    const health = await api('/health?wakeup=false');
    assertBinding(env, health);
    const bytes = await exactMedia(drive, asset);
    if (dryRun) return { state: 'PREPARED', assetId: asset.id, language: asset.language, sha256: asset.digest,
      width: asset.width, height: asset.height, bytes: bytes.length, scheduledAt, channelId: health.body.channel_id };
    const latestWorkbook = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
      ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
    const reservationCheck = reservationPreflightMatches(workbook, latestWorkbook,
      { initial, assetId: asset.id, anchorSlot, now: Date.now() });
    if (!reservationCheck.ok) return { state: 'HELD', assetId: asset.id, reason: reservationCheck.reason };
    const baselineAsset = reservationCheck.asset;
    const baselineSlot = reservationCheck.slot;
    asset = baselineAsset;
    slot = baselineSlot;
    const queuedAt = initial ? new Date().toISOString() : asset.delivery.queuedAt;
    const base = makeRecord(asset, 'RESERVED', { queuedAt, scheduledAt, anchorSlot, reservedAt: new Date().toISOString(),
      ...(asset.delivery?.predecessorReceiptId ? { predecessorReceiptId: asset.delivery.predecessorReceiptId } : {}) });
    const registryRange = `'Asset Registry'!V${asset.rowNumber}`;
    const calendarUpdates = state => slot ? [cells(`'30-Day Calendar'!H${slot.rowNumber}`, `${state} — ${asset.id}`), cells(`'30-Day Calendar'!N${slot.rowNumber}`, `${state} — rolling Status publisher`)] : [];
    await write(sheets, [cells(registryRange, JSON.stringify(base)), ...calendarUpdates('RESERVED')]);
    let reservedWorkbook = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
      ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
    let reservationReadback = publisherStatePreflightMatches(reservedWorkbook,
      { baselineAsset, baselineSlot, expectedDelivery: base, now: Date.now() });
    if (!reservationReadback.ok) {
      await holdOwnReservation(sheets, reservedWorkbook, { assetId: asset.id, expectedDelivery: base, baselineSlot,
        reason: reservationReadback.reason });
      return { state: 'HELD', assetId: asset.id, reason: reservationReadback.reason };
    }
    const sending = { ...base, state: 'SENDING', submittedAt: new Date().toISOString() };
    await write(sheets, [cells(registryRange, JSON.stringify(sending)), ...calendarUpdates('SENDING')]);
    reservedWorkbook = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
      ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
    reservationReadback = publisherStatePreflightMatches(reservedWorkbook,
      { baselineAsset, baselineSlot, expectedDelivery: sending, now: Date.now() });
    if (!reservationReadback.ok) {
      await holdOwnReservation(sheets, reservedWorkbook, { assetId: asset.id, expectedDelivery: sending, baselineSlot,
        reason: reservationReadback.reason });
      return { state: 'HELD', assetId: asset.id, reason: reservationReadback.reason };
    }
    let post;
    try { post = await api('/stories/send/media', { method: 'POST', body: JSON.stringify({ media: `data:image/png;base64,${bytes.toString('base64')}`, mime_type: 'image/png' }) }); }
    catch (error) { post = { http: 0, body: { error: String(error.message || '').slice(0, 100) } }; }
    const id = receiptId(post.body);
    let verified = null;
    if (post.http === 200 && id) verified = await verifyStory(api, id).catch(() => null);
    const resultWorkbook = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
      ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
    let resultCheck = publicationResultPreflight(workbook, resultWorkbook,
      { assetId: asset.id, baselineAsset, baselineSlot, expectedDelivery: sending });
    if (!resultCheck.ok) return { state: 'UNKNOWN', assetId: asset.id, providerHttp: post.http,
      providerReceiptId: id, providerReadback: Boolean(verified), error: resultCheck.reason,
      retry: 'blocked until provider history and canonical send state are reconciled' };
    asset = resultCheck.asset;
    slot = resultCheck.slot;
    if (!verified) {
      const state = post.http >= 400 && post.http < 500 && !id ? 'FAILED' : 'UNKNOWN';
      const failure = { ...sending, state, providerHttp: post.http, providerReceiptId: id, verificationAt: new Date().toISOString(), error: 'Provider readback did not prove publication; reconcile history before retry' };
      const updates = [cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(failure))];
      if (resultCheck.canWriteCalendarReceipt && slot) {
        if (resultCheck.canUpdateCalendarState) updates.push(cells(`'30-Day Calendar'!H${slot.rowNumber}`, `${state} — ${asset.id}`),
          cells(`'30-Day Calendar'!N${slot.rowNumber}`, `${state} — reconcile provider before retry`));
        updates.push(cells(`'30-Day Calendar'!O${slot.rowNumber}`, `WHAPI ${state}; receipt ${id || 'none'}; HTTP ${post.http}; no automatic retry`));
      }
      await write(sheets, updates);
      return { state, assetId: asset.id, providerHttp: post.http, providerReceiptId: id };
    }
    const confirmedAt = isoFromEpoch(verified.timestamp);
    const nextLanguage = asset.language === 'HE' ? 'EN' : 'HE';
    let successorWorkbook = resultWorkbook;
    let nextSelection = resultCheck.assetBindingChanged || (baselineSlot && !resultCheck.canUpdateCalendarState)
      ? { state: 'HELD', reason: 'PUBLISHING_ASSET_OR_CALENDAR_CHANGED_AFTER_PROVIDER_SUBMISSION', conceptId: null, candidates: [], preserveCalendarHold: true }
      : nextAsset(resultWorkbook, nextLanguage, anchorSlot);
    if (nextSelection && !(nextSelection.state === 'HELD' && nextSelection.preserveCalendarHold) &&
        (nextSelection.asset || nextSelection.candidates?.length)) {
      const latestForSuccessor = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID,
        ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
      const latestPublicationCheck = publicationResultPreflight(resultWorkbook, latestForSuccessor,
        { assetId: asset.id, baselineAsset, baselineSlot, expectedDelivery: sending });
      if (!latestPublicationCheck.ok) return { state: 'UNKNOWN', assetId: asset.id, providerHttp: post.http,
        providerReceiptId: id, providerReadback: true, error: latestPublicationCheck.reason,
        retry: 'blocked until provider history and canonical send state are reconciled' };
      resultCheck = latestPublicationCheck;
      asset = resultCheck.asset;
      slot = resultCheck.slot;
      successorWorkbook = latestForSuccessor;
      if (resultCheck.assetBindingChanged || (baselineSlot && !resultCheck.canUpdateCalendarState)) {
        nextSelection = { state: 'HELD', reason: 'PUBLISHING_ASSET_OR_CALENDAR_CHANGED_AFTER_PROVIDER_SUBMISSION',
          conceptId: null, candidates: [], preserveCalendarHold: true };
      } else {
        const successorCheck = successorPreflightMatches(resultWorkbook, latestForSuccessor, nextSelection,
          { nextLanguage, publishingAssetId: asset.id, anchorSlot, now: Date.now() });
        if (successorCheck.ok) nextSelection = successorCheck.selection;
        else nextSelection = { state: 'HELD', reason: `SUCCESSOR_PREFLIGHT_FAILED: ${successorCheck.reason}`,
          conceptId: (nextSelection.asset || nextSelection.candidates?.[0])?.concept || null, candidates: [], preserveCalendarHold: true };
      }
    }
    const ambiguousNext = nextSelection?.state === 'HELD' ? nextSelection : null;
    let nextTurnHold = ambiguousNext ? { state: 'HELD', language: nextLanguage, reason: ambiguousNext.reason,
      conceptId: ambiguousNext.conceptId, candidateAssetIds: ambiguousNext.candidates.map(item => item.id) } :
      !nextSelection ? { state: 'HELD', language: nextLanguage, reason: 'NO_ELIGIBLE_EXACT_APPROVED_ASSET' } : null;
    const successorHeldAt = new Date().toISOString();
    const heldSuccessors = holdAmbiguousNextTurn(ambiguousNext, successorHeldAt);
    let nextItem = nextTurnHold ? null : (nextSelection?.asset || nextSelection);
    let nextSlot = nextTurnHold ? null : (nextSelection?.slot || null);
    let nextAt = nextItem ? successorScheduleIso(confirmedAt, successorWorkbook.calendar, nextSlot) : null;
    if (nextItem && !nextAt) {
      const horizon = calendarHorizonDate(successorWorkbook.calendar) || 'unavailable';
      const error = `SUCCESSOR_SCHEDULE_HORIZON_EXHAUSTED: no permitted time on or before ${horizon}; refresh Calendar restrictions before rescheduling`;
      nextTurnHold = { state: 'HELD', language: nextLanguage, reason: error, conceptId: nextItem.concept, candidateAssetIds: [nextItem.id] };
      heldSuccessors.push({ asset: nextItem, delivery: makeRecord(nextItem, 'HELD', { heldAt: successorHeldAt, error,
        ...(nextSlot ? { anchorSlot: nextSlot.slot } : {}), predecessorReceiptId: id }) });
      nextItem = null;
      nextSlot = null;
      nextAt = null;
    }
    const publication = { ...sending, state: 'PUBLISHED', used: true, providerHttp: post.http, providerReceiptId: id,
      confirmedAt, verificationAt: verified.verifiedAt, providerType: verified.type, providerWidth: verified.width, providerHeight: verified.height,
      ...(nextTurnHold ? { nextTurnHold } : {}) };
    const updates = [cells(`'Asset Registry'!V${asset.rowNumber}`, JSON.stringify(publication))];
    if (resultCheck.canWriteCalendarReceipt && slot) {
      if (resultCheck.canUpdateCalendarState) updates.push(cells(`'30-Day Calendar'!H${slot.rowNumber}`, `PUBLISHED / USED — ${asset.id}`),
        cells(`'30-Day Calendar'!N${slot.rowNumber}`, 'PUBLISHED / USED — rolling Status publisher'));
      updates.push(cells(`'30-Day Calendar'!O${slot.rowNumber}`, `WHAPI: ${id}; confirmed ${confirmedAt}; GET /stories/${id} HTTP200, type=story, 1080x1920; exact asset ${sending.assetId} SHA256 ${sending.sha256}; verified ${verified.verifiedAt}`));
    }
    if (nextItem) {
      const nextRecord = makeRecord(nextItem, 'SCHEDULED', { queuedAt: new Date().toISOString(), scheduledAt: nextAt,
        anchorSlot: nextSlot?.slot || anchorSlot, predecessorReceiptId: id });
      updates.push(cells(`'Asset Registry'!T${nextItem.rowNumber}`, `${localStamp(nextAt)} Asia/Jerusalem`));
      updates.push(cells(`'Asset Registry'!V${nextItem.rowNumber}`, JSON.stringify(nextRecord)));
      updates.push(...scheduledSuccessorCalendarUpdates(nextSlot, nextAt));
    }
    for (const { asset: heldAsset, delivery: heldDelivery } of heldSuccessors) {
      updates.push(cells(`'Asset Registry'!V${heldAsset.rowNumber}`, JSON.stringify(heldDelivery)));
    }
    const heldCalendar = heldSuccessorCalendarUpdates(successorWorkbook.calendar, heldSuccessors);
    updates.push(...heldCalendar.updates);
    const heldCalendarSlots = heldCalendar.slots;
    await write(sheets, updates);
    const readback = parseWorkbook(await sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID, ranges: [HEADER.asset, HEADER.calendar], valueRenderOption: 'FORMATTED_VALUE' }));
    const published = uniqueRow(readback.assets, 'id', asset.id)?.delivery;
    const scheduled = nextItem ? uniqueRow(readback.assets, 'id', nextItem.id)?.delivery : null;
    if (published?.state !== 'PUBLISHED' || published.providerReceiptId !== id || (nextItem && scheduled?.scheduledAt !== nextAt) ||
        (nextTurnHold && (published.nextTurnHold?.state !== 'HELD' || published.nextTurnHold?.language !== nextLanguage || published.nextTurnHold?.reason !== nextTurnHold.reason)))
      throw new Error('Canonical publication/schedule readback failed');
    for (const { asset: heldAsset, delivery: heldDelivery } of heldSuccessors) {
      const persisted = uniqueRow(readback.assets, 'id', heldAsset.id)?.delivery;
      if (persisted?.state !== 'HELD' || persisted.error !== heldDelivery.error) throw new Error('Canonical next-turn hold readback failed');
    }
    for (const slotName of heldCalendarSlots) {
      const persistedSlot = uniqueRow(readback.calendar, 'slot', slotName);
      const expectedHold = heldSuccessors.find(item => item.delivery.anchorSlot === slotName)?.delivery.error;
      if (!persistedSlot?.status?.startsWith('HELD — ') || persistedSlot.scheduler !== expectedHold)
        throw new Error('Canonical next-turn calendar hold readback failed');
    }
    return { state: 'PUBLISHED', assetId: asset.id, language: asset.language, sha256: asset.digest, confirmedAt,
      providerReceiptId: id, providerReadback: true, nextAssetId: nextItem?.id || null, nextLanguage,
      nextScheduledAt: nextAt, schedulerReadback: Boolean(scheduled && scheduled.state === 'SCHEDULED'), nextTurnHold };
  } finally {
    if (locked) await db.query('SELECT pg_advisory_unlock($1, $2)', LOCK_KEYS).catch(() => {});
    db.release();
  }
}
async function oneShot(initial, dryRun = false) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try { return await lockedRun({ initial, dryRun, pool }); } finally { await pool.end(); }
}
function startScheduler({ env = process.env, logger = console } = {}) {
  if (env.RAILWAY_SERVICE_ID !== SERVICE_ID || env.RAILWAY_ENVIRONMENT_ID !== ENVIRONMENT_ID) return false;
  const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
  attachPoolErrorHandler(pool, logger);
  let inFlight = false;
  let nextLogged = false;
  const tick = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      const result = await lockedRun({ env, pool });
      if (!['WAITING', 'SCHEDULED', 'PUBLISHED'].includes(result.state)) logger.warn('[life-skills-status] scheduler needs attention', result);
      else if (result.state === 'PUBLISHED' && result.nextTurnHold) { logger.warn('[life-skills-status] published; next language turn held', result); nextLogged = false; }
      else if (result.state === 'PUBLISHED') { logger.info('[life-skills-status] published', result); nextLogged = false; }
      else if (!nextLogged) { logger.info('[life-skills-status] next durable schedule', result.next || (result.state === 'SCHEDULED' ? [{ assetId: result.assetId, scheduledAt: result.scheduledAt }] : [])); nextLogged = true; }
    } catch (error) { logger.error('[life-skills-status] scheduler error', { code: String(error.code || error.name || 'UNKNOWN').slice(0, 40) }); }
    finally { inFlight = false; }
  };
  setTimeout(tick, 5000).unref();
  setInterval(tick, 60000).unref();
  logger.info('[life-skills-status] scheduler active');
  return true;
}
function attachPoolErrorHandler(pool, logger = console) {
  pool.on('error', error => logger.error('[life-skills-status] database pool idle client error',
    { code: String(error?.code || error?.name || 'UNKNOWN').slice(0, 40) }));
  return pool;
}
module.exports = { lockedRun, oneShot, startScheduler, parseWorkbook, isEligible, nextAllowedIso, nextAsset,
  sameAssetAndSlot, scheduledIdentityMatches, verifiedStoryReadback, hasPriorConceptDelivery, validScheduledAt,
  invalidScheduledHolds, invalidActiveAttemptHolds, invalidPublisherRecordHolds, holdAmbiguousNextTurn, scheduledPreflight, reservationPreflightMatches,
  publisherStatePreflightMatches, successorPreflightMatches, pendingSuccessorPlan, pendingSuccessorPreflightMatches,
  publicationResultPreflight, holdOwnReservation,
  successorScheduleIso, heldSuccessorCalendarUpdates, scheduledSuccessorCalendarUpdates,
  attachPoolErrorHandler, record, exactMedia, MAX_MEDIA_BYTES };
