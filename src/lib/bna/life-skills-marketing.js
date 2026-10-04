const DEFAULT_SPREADSHEET_ID = '1UbbkY6h74L3_sG_m2hcBZ_rmBRLJDO7pYgghrXGdARI';
const WORKBOOK_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;
const CONTENT_SURFACES = new Set(['FEED', 'VERTICAL', 'STATUS', 'STORY']);
const APPROVED_STATES = new Set(['OWNER_APPROVED', 'OWNER_APPROVED_EXACT_FILE', 'APPROVED_PARENT_EXPORT']);
const CURRENT_STATES = new Set(['CURRENT_APPROVED', 'CURRENT_REVIEW', 'CURRENT_REVIEW_CANDIDATE', 'CURRENT_ACCEPTED_HELD']);
const { driveFileId } = require('./life-skills-marketing-media');

function statusDelivery(value) {
  try {
    const parsed = JSON.parse(text(value));
    return parsed.kind === 'LIFE_SKILLS_STATUS_V1' ? parsed : null;
  } catch { return null; }
}

function text(value) {
  return String(value ?? '').trim();
}

function headerIndex(row = []) {
  const map = new Map();
  row.forEach((value, index) => map.set(text(value).toLowerCase(), index));
  return map;
}

function cell(row, headers, name) {
  const index = headers.get(name.toLowerCase());
  return index === undefined ? '' : text(row[index]);
}

function revisionNumber(value) {
  const matches = text(value).match(/\d+/g);
  return matches ? Number(matches[matches.length - 1]) : 1;
}

function conceptNumber(value) {
  const match = text(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function publicationClaimed(status, scheduler) {
  return [status, scheduler].some(value => /^PUBLISHED\b/i.test(text(value)));
}

function verifiedPublicationReceipt(receipts, asset = null) {
  const receipt = parseReceipt(receipts);
  const reads = [...text(receipts).matchAll(/\bGET\s+\/(?:messages|stories)\/([^;\s/?]+)\s+(?:returned\s+)?HTTP\s*200\s*,\s*type=story\b/gi)];
  if (!receipt || reads.length !== 1 || reads[0][1] !== receipt) return null;
  if (asset && !text(receipts).toLowerCase().includes(`exact asset ${text(asset.assetId).toLowerCase()} sha256 ${text(asset.contentDigest).toLowerCase()}`)) return null;
  return receipt;
}

function publicationState(status, scheduler, receipts, asset = null) {
  const combined = `${status} ${scheduler}`.toUpperCase();
  if (publicationClaimed(status, scheduler)) return verifiedPublicationReceipt(receipts, asset) ? 'published' : 'unknown';
  if (receiptEvidencePresent(receipts)) return verifiedPublicationReceipt(receipts, asset) ? 'published' : 'unknown';
  if (combined.includes('SENDING')) return 'sending';
  if (combined.includes('RESERVED')) return 'scheduled';
  if (combined.includes('UNKNOWN')) return 'unknown';
  if (combined.includes('FAILED')) return 'failed';
  if (combined.includes('SKIP')) return 'skipped';
  if (combined.includes('HELD')) return 'held';
  if (combined.includes('QUEUED') || combined.includes('SCHEDULED')) return 'scheduled';
  if (combined.includes('BLOCKED') || combined.includes('OFF')) return 'draft';
  if (combined.includes('READY') || combined.includes('APPROVED')) return 'ready';
  return 'draft';
}

function parseReceipt(receipts) {
  const match = text(receipts).match(/WHAPI:\s*([^;\s]+)/i) || text(receipts).match(/receipt\s+([^;\s]+)/i);
  return match ? match[1] : null;
}

function receiptEvidencePresent(receipts) {
  const value = text(receipts);
  return Boolean(value && !/^(?:no provider delivery|no provider call(?: yet)?|no post receipt|no receipt|none|[-—])(?:\s|;|$)/i.test(value));
}

function scheduledIso(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  return `${date}T${time}:00+03:00`;
}

function creativeReview(approval, libraryState, readiness, qa) {
  const combined = `${libraryState} ${readiness} ${qa}`.toUpperCase();
  if (combined.includes('REJECT') || combined.includes('SUPERSEDED') || combined.includes('DO_NOT_USE')) return 'retired';
  if (APPROVED_STATES.has(approval) && libraryState === 'CURRENT_APPROVED') return 'approved';
  if (approval === 'OWNER_ACCEPTED_DISPLAYED_BATCH' && libraryState === 'CURRENT_ACCEPTED_HELD') return 'approved';
  if (combined.includes('REVIEW') || combined.includes('PENDING') || combined.includes('HOLD')) return 'in_review';
  return 'draft';
}
function explicitRevisionNumber(value) {
  const match = text(value).match(/^(?:NUMERIC-)?[vr]?(\d+)(?:-derived)?(?:\/(?:BOLD|APPB))?$/i);
  const revision = match ? Number(match[1]) : null;
  return Number.isSafeInteger(revision) && revision > 0 && revision <= 999999 ? revision : null;
}

function statusDeliveryMatchesAsset(delivery, asset) {
  if (!delivery || !asset?.registeredRevision || !asset.imageUrl) return false;
  let currentFileId;
  try { currentFileId = driveFileId(asset.imageUrl); } catch { return false; }
  return delivery.assetId === asset.assetId && Number(delivery.conceptId) === asset.concept &&
    text(delivery.language).toLowerCase() === asset.locale && text(delivery.surface).toUpperCase() === asset.surface &&
    explicitRevisionNumber(delivery.revision) === asset.revision &&
    text(delivery.driveFileId) === currentFileId && text(delivery.sha256).toLowerCase() === asset.contentDigest;
}

function verifiedStatusDelivery(delivery) {
  return delivery?.state === 'PUBLISHED' && Boolean(delivery.providerReceiptId) &&
    Number(delivery.providerHttp) === 200 && Number.isFinite(Date.parse(delivery.confirmedAt)) &&
    Number.isFinite(Date.parse(delivery.verificationAt)) && delivery.providerType === 'story' &&
    Number(delivery.providerWidth) === 1080 && Number(delivery.providerHeight) === 1920;
}

function sourceLink(value, fallback) {
  try { const url = new URL(value); if (url.protocol === 'https:') return url.href; } catch { /* Registry evidence may be prose, not a link. */ }
  return fallback;
}

function usableDimensions(item) {
  return item.width === 1080 && (item.surface === 'FEED' ? item.height === 1350 : item.height === 1920);
}

function calendarAsset(row, headers, assets, allCreatives = assets) {
  // This maintained calendar owns Hebrew WhatsApp Status only. Its exact file,
  // asset/concept, version and hash must all identify ONE matching revision.
  const key = cell(row, headers, 'Asset ID'), concept = key.match(/^LS-MONTH-\d{8}-(\d{2})$/)?.[1];
  let file; try { file = driveFileId(cell(row, headers, 'Asset link')); } catch { return null; }
  const versions = [...cell(row, headers, 'Version / SHA256').matchAll(/\bv(\d+)(?:-derived)?(?:\s+original)?\s*[/|]\s*([a-f0-9]{64})\b/gi)].map(match => ({ revision: Number(match[1]), digest: match[2].toLowerCase() }));
  const matches = assets.filter(asset => {
    if (asset.locale !== 'he' || !['VERTICAL', 'STATUS'].includes(asset.surface) || !(asset.assetId === key || concept && asset.concept === Number(concept))) return false;
    let source; try { source = driveFileId(asset.imageUrl); } catch { return false; }
    return source === file && versions.filter(version => version.revision === asset.revision && version.digest === asset.contentDigest).length === 1;
  });
  if (matches.length !== 1) return null;
  const match = matches[0];
  const currentKeyMatches = allCreatives.filter(asset => CURRENT_STATES.has(asset.libraryState) && asset.assetId === match.assetId);
  // The media route selects by Asset key first. A matching calendar row is not
  // operational if that lookup would be ambiguous or invalid in selectedAsset.
  if (currentKeyMatches.length !== 1 || currentKeyMatches[0] !== match ||
      !/^[A-Za-z0-9._-]{1,200}$/.test(match.assetId) || match.review === 'retired' ||
      match.registeredRevision !== true || !Number.isSafeInteger(match.revision) || match.revision < 1 ||
      !/^[a-f0-9]{64}$/.test(match.contentDigest)) return null;
  return match;
}

function parseWorkbook({ assetRows = [], calendarRows = [], fetchedAt = new Date().toISOString() } = {}) {
  const assetHeaders = headerIndex(assetRows[0]);
  const calendarHeaderRow = calendarRows.findIndex(row => text(row[0]) === 'Slot');
  const calendarHeaders = headerIndex(calendarRows[calendarHeaderRow] || []);
  const calendar = calendarHeaderRow >= 0 ? calendarRows.slice(calendarHeaderRow + 1) : [];
  const contentFiles = [], calendarFiles = [];
  for (const row of assetRows.slice(1)) {
    const surface = cell(row, assetHeaders, 'Surface').toUpperCase();
    const digest = cell(row, assetHeaders, 'SHA256').toLowerCase();
    if (!CONTENT_SURFACES.has(surface) || !/^[a-f0-9]{64}$/.test(digest)) continue;
    const concept = conceptNumber(cell(row, assetHeaders, 'Concept'));
    const approval = cell(row, assetHeaders, 'Approval').toUpperCase();
    const libraryState = cell(row, assetHeaders, 'Current library state').toUpperCase();
    const readiness = cell(row, assetHeaders, 'Readiness').toUpperCase();
    const qa = cell(row, assetHeaders, 'QA / hold').toUpperCase();
    const review = creativeReview(approval, libraryState, readiness, qa);
    const locale = cell(row, assetHeaders, 'Language').toLowerCase();
    if (!['he', 'en'].includes(locale)) continue;
    const imageUrl = cell(row, assetHeaders, 'Drive file / archive') || null;
    const asset = {
      assetId: cell(row, assetHeaders, 'Asset key'),
      concept,
      revision: revisionNumber(cell(row, assetHeaders, 'Revision')),
      registeredRevisionLabel: cell(row, assetHeaders, 'Revision'),
      registeredRevision: explicitRevisionNumber(cell(row, assetHeaders, 'Revision')) !== null,
      locale,
      surface,
      width: Number(cell(row, assetHeaders, 'Width px')) || 0,
      height: Number(cell(row, assetHeaders, 'Height px')) || 0,
      imageUrl,
      sourceUrl: sourceLink(cell(row, assetHeaders, 'Record evidence'), sourceLink(imageUrl, WORKBOOK_URL)),
      title: concept ? `Concept ${String(concept).padStart(2, '0')} — ${surface}` : cell(row, assetHeaders, 'Asset key'),
      caption: '',
      contentDigest: digest,
      review,
      approvedDigest: review === 'approved' ? digest : null,
      holdReason: review === 'approved' && libraryState === 'CURRENT_APPROVED' ? null : (cell(row, assetHeaders, 'QA / hold') || cell(row, assetHeaders, 'Readiness') || 'Not approved'),
      libraryState: libraryState || 'UNRECORDED',
      statusDelivery: statusDelivery(cell(row, assetHeaders, 'Provider delivery')),
    };
    contentFiles.push(asset);
    // Keep legacy display metadata visible, but never use its implicit fallback
    // as evidence that a calendar row belongs to this exact registry revision.
    if (explicitRevisionNumber(cell(row, assetHeaders, 'Revision')) === asset.revision) calendarFiles.push(asset);
  }

  const captions = new Map();
  for (const row of calendar.filter(row => /^D\d+$/i.test(cell(row, calendarHeaders, 'Slot')))) {
    const asset = calendarAsset(row, calendarHeaders, calendarFiles, contentFiles); if (!asset) continue;
    const list = captions.get(asset) || [];
    list.push({ approved: ['APPROVED', ...APPROVED_STATES].includes(cell(row, calendarHeaders, 'Exact approval').toUpperCase()), caption: cell(row, calendarHeaders, 'Proposed caption') });
    captions.set(asset, list);
  }
  for (const asset of contentFiles) {
    // Object identity binds the one eligible matched registry row. Display
    // fallback revisions or same-digest siblings must never inherit its copy.
    const rows = captions.get(asset);
    if (asset.libraryState !== 'CURRENT_ACCEPTED_HELD' && rows?.length === 1 && rows[0].approved) asset.caption = rows[0].caption;
  }
  const current = contentFiles.filter(item => CURRENT_STATES.has(item.libraryState));
  const approved = current.filter(item => item.review === 'approved' && item.libraryState === 'CURRENT_APPROVED');
  const readyStatus = approved.filter(item => item.locale === 'he' && item.width === 1080 && item.height === 1920);
  const readyHeFeed = approved.filter(item => item.locale === 'he' && item.width === 1080 && item.height === 1350);
  const readyEnFeed = approved.filter(item => item.locale === 'en' && item.width === 1080 && item.height === 1350);
  const concepts = new Set(contentFiles.map(item => item.concept).filter(Boolean));

  const publications = calendar.filter(row => /^D\d+$/i.test(cell(row, calendarHeaders, 'Slot'))).map(row => {
    const slot = cell(row, calendarHeaders, 'Slot');
    const date = cell(row, calendarHeaders, 'Date');
    const time = cell(row, calendarHeaders, 'Local time');
    const status = cell(row, calendarHeaders, 'WhatsApp Status');
    const scheduler = cell(row, calendarHeaders, 'Scheduler state');
    const receipts = cell(row, calendarHeaders, 'Provider receipts / errors');
    const matching = calendarAsset(row, calendarHeaders, calendarFiles, contentFiles);
    const readbackReceipt = verifiedPublicationReceipt(receipts);
    const receiptAsset = readbackReceipt && contentFiles.find(item => item.statusDelivery?.providerReceiptId === readbackReceipt && verifiedStatusDelivery(item.statusDelivery));
    const slotDeliveryAsset = !matching && /^D\d+$/i.test(slot) ? contentFiles.find(item => item.statusDelivery?.anchorSlot === slot && item.locale === 'he' && ['VERTICAL', 'STATUS'].includes(item.surface)) : null;
    const evidenceAsset = receiptAsset || matching || slotDeliveryAsset || null;
    const delivery = evidenceAsset?.statusDelivery || null;
    const receiptProofAsset = receiptAsset ? { assetId: delivery.assetId, contentDigest: delivery.sha256 } : matching;
    const exactReceipt = receiptProofAsset ? verifiedPublicationReceipt(receipts, receiptProofAsset) : null;
    const sourceState = publicationState(status, scheduler, receipts, receiptProofAsset);
    const deliveryMatches = statusDeliveryMatchesAsset(delivery, evidenceAsset);
    const deliveryState = String(delivery?.state || '').toUpperCase();
    const verifiedDelivery = verifiedStatusDelivery(delivery);
    const deliveryBoundToSlot = deliveryMatches && delivery?.anchorSlot === slot;
    const calendarBlock = `${status} ${scheduler}`.match(/\b(OFF|BLOCKED)\b/i)?.[1]?.toUpperCase() || null;
    const scheduleBindingMissing = sourceState === 'scheduled' && !matching;
    const scheduleBindingChanged = deliveryState === 'SCHEDULED' && (!deliveryMatches || delivery?.anchorSlot !== slot);
    const futurePublication = ['ready', 'scheduled', 'sending'].includes(sourceState);
    const bindingUnavailable = futurePublication && !matching;
    // Display acceptance never clears release holds. Preserve historical verified
    // publication/error evidence, but do not advertise a held future slot as ready.
    const releaseAsset = matching || evidenceAsset;
    const publicationHeld = !!releaseAsset &&
      ((futurePublication && (releaseAsset.libraryState !== 'CURRENT_APPROVED' || releaseAsset.review !== 'approved' || !releaseAsset.caption || !usableDimensions(releaseAsset))) ||
       (releaseAsset.libraryState === 'CURRENT_ACCEPTED_HELD' && publicationClaimed(status, scheduler) && !exactReceipt && !verifiedDelivery));
    let state = sourceState;
    if (['unknown', 'failed', 'skipped', 'sending'].includes(sourceState)) {
      state = sourceState;
    } else if (sourceState === 'published' && (exactReceipt || verifiedDelivery)) {
      state = 'published';
    } else if (verifiedDelivery && delivery?.state === 'PUBLISHED') {
      state = 'published';
    } else if (sourceState === 'held' || deliveryState === 'HELD') {
      state = 'held';
    } else if (calendarBlock && (sourceState === 'scheduled' || ['SCHEDULED', 'RESERVED'].includes(deliveryState))) {
      state = 'draft';
    } else if ((publicationHeld && !exactReceipt && !verifiedDelivery) || bindingUnavailable || scheduleBindingMissing || scheduleBindingChanged) {
      state = 'draft';
    } else if (deliveryBoundToSlot && deliveryState === 'SENDING') {
      state = 'sending';
    } else if ((deliveryBoundToSlot && ['SCHEDULED', 'RESERVED'].includes(deliveryState)) || (sourceState === 'scheduled' && matching)) {
      state = 'scheduled';
    } else if (sourceState === 'published') {
      state = 'unknown';
    } else if (sourceState === 'scheduled') {
      state = 'draft';
    }
    const creative = evidenceAsset || matching;
    const providerReceiptId = state === 'published' ? (exactReceipt || (verifiedDelivery ? delivery.providerReceiptId : null)) : null;
    const digest = /^[a-f0-9]{64}$/i.test(String(delivery?.sha256 || '')) ? String(delivery.sha256).toLowerCase() : (creative?.contentDigest || '');
    const assetId = delivery?.assetId || creative?.assetId || cell(row, calendarHeaders, 'Asset ID');
    const revision = explicitRevisionNumber(delivery?.revision) || creative?.revision || 1;
    const bindingError = scheduleBindingChanged ? 'SCHEDULED_ASSET_BINDING_CHANGED' : scheduleBindingMissing ? 'SCHEDULED_ASSET_BINDING_MISSING' : null;
    return {
      id: `whatsapp-status:${slot}:${date}`,
      assetId,
      creativeRevision: revision,
      creativeDigest: digest,
      channel: 'whatsapp_status',
      destinationLabel: 'Life Skills WhatsApp Status',
      scheduledFor: ['scheduled', 'published'].includes(state) || bindingError ? (delivery?.scheduledAt || scheduledIso(date, time)) : null,
      confirmedAt: delivery?.confirmedAt || null,
      timezone: 'Asia/Jerusalem',
      state,
      provider: state === 'published' || state === 'scheduled' ? 'whapi' : 'unbound',
      providerReceiptId,
      providerReadAt: verifiedDelivery ? delivery.verificationAt : (providerReceiptId ? fetchedAt : null),
      postUrl: null,
      receiptKind: state === 'published' && providerReceiptId ? 'publication' : 'unknown',
      manualReportedAt: null,
      errorCode: bindingError || (calendarBlock && state === 'draft' ? `CALENDAR_${calendarBlock}` : null) || (deliveryState === 'HELD' ? delivery.error || 'PUBLISHER_HELD' : (bindingUnavailable ? 'ASSET_BINDING_UNAVAILABLE' : publicationHeld ? 'ASSET_PUBLICATION_HELD' : (['failed', 'unknown', 'draft', 'held'].includes(state) ? (status || scheduler || null) : null))),
    };
  });

  const publicationKeys = new Set(publications.filter(item => item.assetId && item.creativeDigest).map(item => `${item.assetId}|${item.creativeRevision}|${item.creativeDigest}`));
  const publicationReceipts = new Set(publications.map(item => item.providerReceiptId).filter(Boolean));
  for (const item of contentFiles) {
    const delivery = item.statusDelivery;
    if (!delivery) continue;
    const stateValue = String(delivery.state || 'UNKNOWN').toUpperCase();
    const exactBinding = statusDeliveryMatchesAsset(delivery, item);
    const scheduledApprovalValid = item.libraryState === 'CURRENT_APPROVED' && item.review === 'approved' &&
      item.registeredRevision === true && /^[a-f0-9]{64}$/.test(item.contentDigest) && usableDimensions(item);
    let state;
    if (stateValue === 'PUBLISHED') state = verifiedStatusDelivery(delivery) ? 'published' : 'unknown';
    else if (stateValue === 'SCHEDULED') state = exactBinding && scheduledApprovalValid ? 'scheduled' : 'draft';
    else if (stateValue === 'RESERVED') state = exactBinding && scheduledApprovalValid ? 'scheduled' : 'draft';
    else if (stateValue === 'SENDING') state = exactBinding ? 'sending' : 'unknown';
    else if (stateValue === 'HELD') state = 'held';
    else if (['UNKNOWN', 'FAILED', 'SKIPPED'].includes(stateValue)) state = stateValue.toLowerCase();
    else continue;
    if (item.libraryState === 'CURRENT_ACCEPTED_HELD' && ['ready', 'scheduled', 'sending'].includes(state)) state = 'draft';
    const revision = explicitRevisionNumber(delivery.revision) || item.revision;
    const digest = /^[a-f0-9]{64}$/i.test(String(delivery.sha256 || '')) ? String(delivery.sha256).toLowerCase() : item.contentDigest;
    const assetId = delivery.assetId || item.assetId;
    const key = `${assetId}|${revision}|${digest}`;
    if (publicationKeys.has(key) || (delivery.providerReceiptId && publicationReceipts.has(delivery.providerReceiptId))) continue;
    const identityMismatch = ['SCHEDULED', 'RESERVED'].includes(stateValue) && !exactBinding;
    const approvalMismatch = ['SCHEDULED', 'RESERVED'].includes(stateValue) && !scheduledApprovalValid;
    publications.push({
      id: `whatsapp-status:${assetId}:${revision}:${digest}`,
      assetId,
      creativeRevision: revision,
      creativeDigest: digest,
      channel: 'whatsapp_status',
      destinationLabel: 'Life Skills WhatsApp Status',
      scheduledFor: ['scheduled', 'draft'].includes(state) && delivery.scheduledAt ? delivery.scheduledAt : null,
      confirmedAt: delivery.confirmedAt || null,
      timezone: 'Asia/Jerusalem',
      state,
      provider: ['RESERVED', 'SENDING', 'PUBLISHED', 'UNKNOWN', 'FAILED', 'HELD'].includes(stateValue) || delivery.providerReceiptId ? 'whapi' : 'unbound',
      providerReceiptId: state === 'published' ? delivery.providerReceiptId || null : null,
      providerReadAt: state === 'published' ? delivery.verificationAt || null : null,
      postUrl: null,
      receiptKind: state === 'published' && delivery.providerReceiptId ? 'publication' : 'unknown',
      manualReportedAt: null,
      errorCode: identityMismatch ? 'SCHEDULED_ASSET_BINDING_CHANGED' : approvalMismatch ? 'SCHEDULED_ASSET_APPROVAL_REVOKED' : delivery.error || null,
    });
    publicationKeys.add(key);
    if (delivery.providerReceiptId) publicationReceipts.add(delivery.providerReceiptId);
  }

  const unavailablePublications = publications.filter(item => ['draft', 'failed', 'unknown', 'held'].includes(item.state) || (item.state === 'sending' && item.errorCode));
  const uncoveredHeldAssets = current.filter(asset => asset.libraryState === 'CURRENT_ACCEPTED_HELD' && !unavailablePublications.some(item => item.assetId === asset.assetId && item.creativeRevision === asset.revision && item.creativeDigest === asset.contentDigest));

  return {
    fetchedAt,
    workbookUrl: WORKBOOK_URL,
    creatives: current,
    publications,
    inventory: {
      files: Math.max(assetRows.length - 1, 0),
      concepts: concepts.size,
      publishablePosts: approved.filter(item => item.caption && usableDimensions(item)).length,
      heStatusReady: readyStatus.length,
      heFeedReady: readyHeFeed.length,
      enFeedReady: readyEnFeed.length,
      adEligible: readyHeFeed.length + readyEnFeed.length,
      inLiveAds: null,
      queued: publications.filter(item => item.state === 'scheduled').length,
      published: publications.filter(item => item.state === 'published').length,
      needsApproval: current.filter(item => item.review === 'in_review' || item.review === 'draft').length,
      needsResizeOrCaption: current.filter(item => !item.caption || !usableDimensions(item)).length,
      heldMissing: unavailablePublications.length + uncoveredHeldAssets.length,
      partial: true,
      asOf: fetchedAt,
    },
  };
}

async function readLifeSkillsMarketingSnapshot({ sheets, spreadsheetId = DEFAULT_SPREADSHEET_ID } = {}) {
  if (!sheets) throw new Error('Google Sheets client is required');
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: ["'Asset Registry'!A1:AA1000", "'30-Day Calendar'!A1:O100"],
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const [assets, calendar] = response.data.valueRanges || [];
  const assetHeaders = headerIndex(assets?.values?.[0]);
  if (!['Asset key', 'Language', 'Surface', 'Revision', 'Width px', 'Height px', 'SHA256', 'Approval', 'Drive file / archive', 'Current library state'].every(name => assetHeaders.has(name.toLowerCase()))) {
    throw new Error('GRAPHICS_REGISTRY_UNAVAILABLE');
  }
  return parseWorkbook({
    assetRows: assets?.values || [],
    calendarRows: calendar?.values || [],
    fetchedAt: new Date().toISOString(),
  });
}

module.exports = {
  DEFAULT_SPREADSHEET_ID,
  parseWorkbook,
  publicationState,
  readLifeSkillsMarketingSnapshot,
};
