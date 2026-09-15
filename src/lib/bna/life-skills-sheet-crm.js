const crypto = require('crypto'); // CRM adapter uses deterministic, non-PII lead IDs.

const LIFE_SKILLS_SHEET_CRM_CONFIRM = 'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT';
const DEFAULT_SHEET_ID = '1UbbkY6h74L3_sG_m2hcBZ_rmBRLJDO7pYgghrXGdARI';
const DEFAULT_SHEET_NAME = 'Leads';
const MACHINE_HEADERS = Object.freeze({ AA: 'Inbound provider message IDs', AB: 'First inbound at', AC: 'Last inbound at', AD: 'Response owner' });

function truthy(value) { return /^(?:1|true|yes|on|enabled|live)$/i.test(String(value || '').trim()); }
function normalizeText(value, max = 160) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max); }

function normalizeLifeSkillsPhone(value = '', defaultCountry = '972') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.split('@')[0].replace(/^\+/, '');
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && defaultCountry) digits = `${String(defaultCountry).replace(/\D/g, '')}${digits.slice(1)}`;
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : '';
}

function dateOnlyInTimeZone(value, timeZone = 'Asia/Jerusalem') {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (!Number.isFinite(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(date).reduce((result, part) => { if (part.type !== 'literal') result[part.type] = part.value; return result; }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function detectedLanguage(value = '') { return /[\u0590-\u05ff]/.test(String(value || '')) ? 'Hebrew' : 'English'; }

function messageAttribution(payload = {}) {
  const data = payload && typeof payload === 'object' ? payload.data || {} : {};
  const message = data?.message || payload?.message || {};
  return {
    source: normalizeText(payload.source || payload.utm_source || payload.utmSource || data.source || data.utm_source || data.utmSource || message.source || message.utm_source, 120),
    campaign: normalizeText(payload.campaign || payload.utm_campaign || payload.utmCampaign || data.campaign || data.utm_campaign || data.utmCampaign || message.campaign || message.utm_campaign, 120),
  };
}

function lifeSkillsSheetCrmConfig(env = {}) {
  return {
    enabled: truthy(env.LIFE_SKILLS_SHEET_CRM_ENABLED),
    approved: String(env.LIFE_SKILLS_SHEET_CRM_CONFIRM || '').trim() === LIFE_SKILLS_SHEET_CRM_CONFIRM,
    spreadsheetId: normalizeText(env.LIFE_SKILLS_SHEET_CRM_SHEET_ID || DEFAULT_SHEET_ID, 160),
    sheetName: normalizeText(env.LIFE_SKILLS_SHEET_CRM_SHEET_NAME || DEFAULT_SHEET_NAME, 100),
    responseOwner: normalizeText(env.LIFE_SKILLS_SHEET_CRM_RESPONSE_OWNER || 'Shlomo', 120),
    requiredBusinessDigits: String(env.LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS || '972534932631').replace(/\D/g, ''),
    defaultCountry: String(env.LIFE_SKILLS_SHEET_CRM_DEFAULT_COUNTRY || '972').replace(/\D/g, ''),
    timeZone: normalizeText(env.LIFE_SKILLS_SHEET_CRM_TIMEZONE || 'Asia/Jerusalem', 80),
  };
}

function buildLifeSkillsSheetCrmReadiness({ env = {}, googleReady = false } = {}) {
  const config = lifeSkillsSheetCrmConfig(env);
  const blockers = [];
  if (!config.enabled) blockers.push('LIFE_SKILLS_SHEET_CRM_ENABLED not enabled');
  if (!config.approved) blockers.push(`LIFE_SKILLS_SHEET_CRM_CONFIRM must equal ${LIFE_SKILLS_SHEET_CRM_CONFIRM}`);
  if (!config.spreadsheetId) blockers.push('LIFE_SKILLS_SHEET_CRM_SHEET_ID missing');
  if (!config.sheetName) blockers.push('LIFE_SKILLS_SHEET_CRM_SHEET_NAME missing');
  if (!config.requiredBusinessDigits) blockers.push('LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS missing');
  if (!googleReady) blockers.push('authorized Google Sheets client unavailable');
  return { ready: blockers.length === 0, blockers, config };
}

function isLifeSkillsInboundInquiry({ normalized = {}, scope = {}, config = lifeSkillsSheetCrmConfig() } = {}) {
  const blockers = [];
  const projectKey = String(scope.project_key || scope.project || '').trim().toLowerCase();
  const workspaceKey = String(scope.workspace_key || scope.workspace || '').trim().toLowerCase();
  // The shared receiver authenticates ordinary WAPI traffic in its canonical BNA
  // scope. The destination-number binding below—not a synthetic Life Skills
  // project scope—decides whether this message belongs in the Life Skills CRM.
  // One Time remains explicitly excluded from this separate CRM lane.
  if (projectKey === 'one_time_mishnah_class') blockers.push('one_time_project_scope');
  if (workspaceKey === 'rabbi_sheller_provider') blockers.push('one_time_workspace_scope');
  if (normalized.fromMe) blockers.push('outbound_from_me');
  if (String(normalized.messageStatus || '').trim()) blockers.push('delivery_status_event');
  if (!String(normalized.messageId || '').trim()) blockers.push('missing_provider_message_id');
  if (!normalized.messageText && !normalized.hasMedia) blockers.push('missing_inbound_content');
  const phone = normalizeLifeSkillsPhone(normalized.fromNumber || normalized.chatId || '', config.defaultCountry);
  if (!phone) blockers.push('missing_or_invalid_sender_phone');
  const destinationDigits = String(normalized.toNumber || '').replace(/\D/g, '');
  if (!destinationDigits || !config.requiredBusinessDigits || !destinationDigits.endsWith(config.requiredBusinessDigits)) blockers.push('unbound_life_skills_business_number');
  return { eligible: blockers.length === 0, blockers, phone };
}

function stableLeadId(phone) { return `LS-WAPI-${crypto.createHash('sha256').update(`life-skills-sheet-crm:v1:${phone}`).digest('hex').slice(0, 16)}`; }
function providerMessageIds(value, nextId) {
  const known = String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  const id = normalizeText(nextId, 180);
  if (id && !known.includes(id)) known.push(id);
  return known.slice(-16).join(', ');
}
function sheetRange(config, range) { return `'${String(config.sheetName || DEFAULT_SHEET_NAME).replace(/'/g, "''")}'!${range}`; }
function rowNumberFromUpdatedRange(range = '') { const match = String(range || '').match(/![A-Z]+(\d+):/i) || String(range || '').match(/![A-Z]+(\d+)/i); return match ? Number(match[1]) : null; }

function initialLeadRow({ normalized = {}, payload = {}, config = lifeSkillsSheetCrmConfig(), now = new Date() } = {}) {
  const phone = normalizeLifeSkillsPhone(normalized.fromNumber || normalized.chatId || '', config.defaultCountry);
  const receivedAt = new Date(normalized.occurredAt || now);
  const receivedIso = Number.isFinite(receivedAt.getTime()) ? receivedAt.toISOString() : new Date(now).toISOString();
  const attribution = messageAttribution(payload);
  const row = Array(30).fill('');
  row[0] = stableLeadId(phone); row[1] = receivedIso; row[2] = normalizeText(normalized.pushName, 120); row[5] = phone;
  row[7] = detectedLanguage(normalized.messageText || ''); row[11] = attribution.source || 'WhatsApp'; row[12] = attribution.campaign;
  row[13] = 'New inquiry'; row[14] = receivedIso; row[15] = 'Respond to inbound WhatsApp inquiry'; row[16] = dateOnlyInTimeZone(receivedAt, config.timeZone);
  row[26] = providerMessageIds('', normalized.messageId); row[27] = receivedIso; row[28] = receivedIso; row[29] = config.responseOwner;
  return row;
}

async function ensureMachineHeaders(sheets, config) {
  const existing = (await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range: sheetRange(config, 'A1:AD1') })).data?.values?.[0] || [];
  const data = [];
  for (const [column, label] of Object.entries(MACHINE_HEADERS)) {
    const index = column.charCodeAt(1) - 65 + 26;
    const current = normalizeText(existing[index], 160);
    if (current && current !== label) throw new Error(`Life Skills CRM machine column ${column} is already used by ${current}`);
    if (!current) data.push({ range: sheetRange(config, `${column}1`), values: [[label]] });
  }
  if (data.length) await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: config.spreadsheetId, requestBody: { valueInputOption: 'RAW', data } });
}

async function findLeadRowByPhone(sheets, config, phone) {
  const result = await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range: sheetRange(config, 'F2:F1000') });
  const index = (result.data?.values || []).findIndex((row) => normalizeLifeSkillsPhone(row?.[0], config.defaultCountry) === phone);
  return index < 0 ? null : index + 2;
}

async function existingLeadContext(sheets, config, row) {
  const result = await sheets.spreadsheets.values.batchGet({ spreadsheetId: config.spreadsheetId, ranges: [sheetRange(config, `L${row}:Q${row}`), sheetRange(config, `AA${row}:AD${row}`)] });
  const ordinary = result.data?.valueRanges?.[0]?.values?.[0] || [];
  const machine = result.data?.valueRanges?.[1]?.values?.[0] || [];
  return { source: ordinary[0] || '', campaign: ordinary[1] || '', stage: ordinary[2] || '', nextAction: ordinary[4] || '', dueDate: ordinary[5] || '', providerIds: machine[0] || '', firstInboundAt: machine[1] || '', responseOwner: machine[3] || '' };
}

async function updateExistingLead({ sheets, config, normalized, payload, row, now }) {
  const current = await existingLeadContext(sheets, config, row);
  const occurredAt = new Date(normalized.occurredAt || now);
  const occurredIso = Number.isFinite(occurredAt.getTime()) ? occurredAt.toISOString() : new Date(now).toISOString();
  const attribution = messageAttribution(payload);
  const data = [
    { range: sheetRange(config, `O${row}`), values: [[occurredIso]] },
    { range: sheetRange(config, `AA${row}`), values: [[providerMessageIds(current.providerIds, normalized.messageId)]] },
    { range: sheetRange(config, `AC${row}`), values: [[occurredIso]] },
  ];
  if (!current.source && attribution.source) data.push({ range: sheetRange(config, `L${row}`), values: [[attribution.source]] });
  if (!current.campaign && attribution.campaign) data.push({ range: sheetRange(config, `M${row}`), values: [[attribution.campaign]] });
  if (!current.stage) data.push({ range: sheetRange(config, `N${row}`), values: [['New inquiry']] });
  if (!current.nextAction) data.push({ range: sheetRange(config, `P${row}`), values: [['Respond to inbound WhatsApp inquiry']] });
  if (!current.dueDate) data.push({ range: sheetRange(config, `Q${row}`), values: [[dateOnlyInTimeZone(occurredAt, config.timeZone)]] });
  if (!current.firstInboundAt) data.push({ range: sheetRange(config, `AB${row}`), values: [[occurredIso]] });
  if (!current.responseOwner) data.push({ range: sheetRange(config, `AD${row}`), values: [[config.responseOwner]] });
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: config.spreadsheetId, requestBody: { valueInputOption: 'RAW', data } });
  return { action: 'updated_existing', row, providerMessageIds: providerMessageIds(current.providerIds, normalized.messageId) };
}

async function upsertLifeSkillsSheetLead({ sheets, normalized = {}, payload = {}, scope = {}, config = lifeSkillsSheetCrmConfig(), now = new Date() } = {}) {
  if (!sheets?.spreadsheets?.values) throw new Error('Google Sheets adapter is required');
  const eligibility = isLifeSkillsInboundInquiry({ normalized, scope, config });
  if (!eligibility.eligible) return { action: 'skipped_ineligible', blockers: eligibility.blockers };
  await ensureMachineHeaders(sheets, config);
  const existingRow = await findLeadRowByPhone(sheets, config, eligibility.phone);
  if (existingRow) return updateExistingLead({ sheets, config, normalized, payload, row: existingRow, now });
  const append = await sheets.spreadsheets.values.append({ spreadsheetId: config.spreadsheetId, range: sheetRange(config, 'A:AD'), valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [initialLeadRow({ normalized, payload, config, now })] } });
  return { action: 'created', row: rowNumberFromUpdatedRange(append.data?.updates?.updatedRange), providerMessageIds: providerMessageIds('', normalized.messageId) };
}

module.exports = { DEFAULT_SHEET_ID, DEFAULT_SHEET_NAME, LIFE_SKILLS_SHEET_CRM_CONFIRM, MACHINE_HEADERS, buildLifeSkillsSheetCrmReadiness, dateOnlyInTimeZone, initialLeadRow, isLifeSkillsInboundInquiry, lifeSkillsSheetCrmConfig, messageAttribution, normalizeLifeSkillsPhone, providerMessageIds, stableLeadId, upsertLifeSkillsSheetLead };
