const DEFAULT_SPREADSHEET_ID = '1UbbkY6h74L3_sG_m2hcBZ_rmBRLJDO7pYgghrXGdARI';
const WORKBOOK_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;
const CONTENT_SURFACES = new Set(['FEED', 'VERTICAL', 'STATUS', 'STORY']);
const APPROVED_STATES = new Set(['OWNER_APPROVED', 'APPROVED_PARENT_EXPORT']);

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

function publicationState(status, scheduler, receipts) {
  const combined = `${status} ${scheduler}`.toUpperCase();
  if (combined.includes('PUBLISHED') && /WHAPI:|type=story|published/i.test(receipts)) return 'published';
  if (combined.includes('QUEUED')) return 'scheduled';
  if (combined.includes('SENDING')) return 'sending';
  if (combined.includes('UNKNOWN')) return 'unknown';
  if (combined.includes('FAILED')) return 'failed';
  if (combined.includes('SKIP')) return 'skipped';
  if (combined.includes('BLOCKED') || combined.includes('HELD') || combined.includes('OFF')) return 'draft';
  if (combined.includes('READY') || combined.includes('APPROVED')) return 'ready';
  return 'draft';
}

function parseReceipt(receipts) {
  const match = text(receipts).match(/WHAPI:\s*([^;\s]+)/i) || text(receipts).match(/receipt\s+([^;\s]+)/i);
  return match ? match[1] : null;
}

function scheduledIso(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  return `${date}T${time}:00+03:00`;
}

function creativeReview(approval, libraryState, readiness, qa) {
  const combined = `${libraryState} ${readiness} ${qa}`.toUpperCase();
  if (combined.includes('REJECT') || combined.includes('SUPERSEDED') || combined.includes('DO_NOT_USE')) return 'retired';
  if (APPROVED_STATES.has(approval) && libraryState === 'CURRENT_APPROVED') return 'approved';
  if (combined.includes('REVIEW') || combined.includes('PENDING') || combined.includes('HOLD')) return 'in_review';
  return 'draft';
}

function parseWorkbook({ assetRows = [], calendarRows = [], fetchedAt = new Date().toISOString() } = {}) {
  const assetHeaders = headerIndex(assetRows[0]);
  const calendarHeaderRow = calendarRows.findIndex(row => text(row[0]) === 'Slot');
  const calendarHeaders = headerIndex(calendarRows[calendarHeaderRow] || []);
  const calendar = calendarHeaderRow >= 0 ? calendarRows.slice(calendarHeaderRow + 1) : [];
  const captions = new Map();
  for (const row of calendar) {
    const concept = conceptNumber(cell(row, calendarHeaders, 'Asset ID'));
    if (concept) captions.set(concept, cell(row, calendarHeaders, 'Proposed caption'));
  }

  const contentFiles = [];
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
    contentFiles.push({
      assetId: cell(row, assetHeaders, 'Asset key'),
      concept,
      revision: revisionNumber(cell(row, assetHeaders, 'Revision')),
      locale: cell(row, assetHeaders, 'Language').toLowerCase() === 'he' ? 'he' : 'en',
      surface,
      width: Number(cell(row, assetHeaders, 'Width px')) || 0,
      height: Number(cell(row, assetHeaders, 'Height px')) || 0,
      imageUrl: cell(row, assetHeaders, 'Drive file / archive') || null,
      sourceUrl: cell(row, assetHeaders, 'Record evidence') || WORKBOOK_URL,
      title: concept ? `Concept ${String(concept).padStart(2, '0')} — ${surface}` : cell(row, assetHeaders, 'Asset key'),
      caption: captions.get(concept) || '',
      contentDigest: digest,
      review,
      approvedDigest: review === 'approved' ? digest : null,
      holdReason: review === 'approved' ? null : (cell(row, assetHeaders, 'QA / hold') || cell(row, assetHeaders, 'Readiness') || 'Not approved'),
      libraryState: libraryState || 'UNRECORDED',
    });
  }

  const current = contentFiles.filter(item => item.libraryState === 'CURRENT_APPROVED' || item.libraryState === 'CURRENT_REVIEW_CANDIDATE');
  const approved = current.filter(item => item.review === 'approved');
  const readyStatus = approved.filter(item => item.locale === 'he' && item.width === 1080 && item.height === 1920);
  const readyHeFeed = approved.filter(item => item.locale === 'he' && item.width === 1080 && item.height === 1350);
  const readyEnFeed = approved.filter(item => item.locale === 'en' && item.width === 1080 && item.height === 1350);
  const concepts = new Set(contentFiles.map(item => item.concept).filter(Boolean));
  const readyConcepts = new Set(approved.map(item => item.concept).filter(Boolean));

  const publications = calendar.filter(row => /^D\d+$/i.test(cell(row, calendarHeaders, 'Slot'))).map(row => {
    const slot = cell(row, calendarHeaders, 'Slot');
    const date = cell(row, calendarHeaders, 'Date');
    const time = cell(row, calendarHeaders, 'Local time');
    const status = cell(row, calendarHeaders, 'WhatsApp Status');
    const scheduler = cell(row, calendarHeaders, 'Scheduler state');
    const receipts = cell(row, calendarHeaders, 'Provider receipts / errors');
    const state = publicationState(status, scheduler, receipts);
    const digest = (cell(row, calendarHeaders, 'Version / SHA256').match(/[a-f0-9]{64}/i) || [])[0]?.toLowerCase() || '';
    const matching = contentFiles.find(item => item.contentDigest === digest);
    const assetId = matching?.assetId || cell(row, calendarHeaders, 'Asset ID');
    const providerReceiptId = state === 'published' ? parseReceipt(receipts) : null;
    return {
      id: `whatsapp-status:${slot}:${date}`,
      assetId,
      creativeRevision: matching?.revision || 1,
      creativeDigest: digest,
      channel: 'whatsapp_status',
      destinationLabel: 'Life Skills WhatsApp Status',
      scheduledFor: scheduledIso(date, time),
      timezone: 'Asia/Jerusalem',
      state,
      provider: state === 'published' || state === 'scheduled' ? 'whapi' : 'unbound',
      providerReceiptId,
      providerReadAt: state === 'published' && /GET \/messages\//i.test(receipts) ? fetchedAt : null,
      postUrl: null,
      receiptKind: state === 'published' && providerReceiptId ? 'publication' : 'unknown',
      manualReportedAt: null,
      errorCode: ['failed', 'unknown', 'draft'].includes(state) ? (status || scheduler || null) : null,
    };
  });

  return {
    fetchedAt,
    workbookUrl: WORKBOOK_URL,
    creatives: current,
    publications,
    inventory: {
      files: Math.max(assetRows.length - 1, 0),
      concepts: concepts.size,
      publishablePosts: readyConcepts.size,
      heStatusReady: readyStatus.length,
      heFeedReady: readyHeFeed.length,
      enFeedReady: readyEnFeed.length,
      adEligible: readyHeFeed.length + readyEnFeed.length,
      inLiveAds: null,
      queued: publications.filter(item => item.state === 'scheduled').length,
      published: publications.filter(item => item.state === 'published').length,
      needsApproval: current.filter(item => item.review === 'in_review' || item.review === 'draft').length,
      needsResizeOrCaption: current.filter(item => !item.caption || !([1080, 1920].includes(item.height) && item.width === 1080)).length,
      heldMissing: publications.filter(item => item.state === 'draft' || item.state === 'failed' || item.state === 'unknown').length,
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
