const crypto = require('crypto'); // CRM adapter uses deterministic, non-PII lead IDs.

const LIFE_SKILLS_SHEET_CRM_CONFIRM = 'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT';
const DEFAULT_SHEET_ID = '1UbbkY6h74L3_sG_m2hcBZ_rmBRLJDO7pYgghrXGdARI';
const DEFAULT_SHEET_NAME = 'Leads';
// This is a named-header contract, not a column-position contract. The current
// Leads layout gives AA:AI to onboarding; legacy inbound headers remain valid.
const SHEET_FIELD_MAP_VERSION = 'life-skills-inbound-v2';
const MACHINE_HEADERS = Object.freeze({
  providerMessageIds: 'Inbound provider message IDs',
  firstInboundAt: 'First inbound at',
  lastInboundAt: 'Last inbound at',
  responseOwner: 'Response owner',
});
const LEAD_HEADERS = Object.freeze({
  leadId: 'Lead ID', receivedAt: 'Date received', parentName: 'Parent/adult name', phone: 'Phone', language: 'Language',
  source: 'Lead source', campaign: 'Campaign', stage: 'Pipeline stage', lastContact: 'Last contact',
  nextAction: 'Next action', dueDate: 'Next-action date',
});

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
    requiredChannelId: normalizeText(env.LIFE_SKILLS_WAPI_CHANNEL_ID || env.WHAPI_CHANNEL_ID || '', 180),
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
  const destinationBound = Boolean(destinationDigits && config.requiredBusinessDigits && destinationDigits.endsWith(config.requiredBusinessDigits));
  const channelId = normalizeText(normalized.channelId || normalized.instanceId, 180);
  const channelBound = Boolean(config.requiredChannelId && channelId && channelId === config.requiredChannelId);
  if (!destinationBound && !channelBound) blockers.push('unbound_life_skills_business_number');
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
function columnName(index) {
  let value = Number(index) + 1;
  let name = '';
  while (value > 0) { const remainder = (value - 1) % 26; name = String.fromCharCode(65 + remainder) + name; value = Math.floor((value - 1) / 26); }
  return name;
}
function columnIndex(column) {
  let value = 0;
  for (const character of String(column)) value = value * 26 + character.charCodeAt(0) - 64;
  return value - 1;
}
function headerIndex(headers, label) {
  const matches = headers.map((header, index) => ({ header: normalizeText(header, 160), index })).filter((entry) => entry.header === label);
  if (matches.length > 1) throw new Error(`Life Skills CRM ambiguous header: ${label}`);
  return matches.length === 1 ? matches[0].index : null;
}
function resolveSheetHeaderMap(headers = []) {
  const normalized = Array.isArray(headers) ? headers : [];
  const columns = {};
  for (const [key, label] of Object.entries(LEAD_HEADERS)) {
    const index = headerIndex(normalized, label);
    if (index === null) throw new Error(`Life Skills CRM required header missing: ${label}`);
    columns[key] = columnName(index);
  }
  const machine = {};
  const missingMachine = [];
  for (const [key, label] of Object.entries(MACHINE_HEADERS)) {
    const index = headerIndex(normalized, label);
    if (index === null) missingMachine.push(key);
    else machine[key] = columnName(index);
  }
  return { version: SHEET_FIELD_MAP_VERSION, columns, machine, missingMachine, headers: normalized.slice(), maxColumnIndex: Math.max(normalized.length - 1, 0) };
}
function legacyHeaderMap() {
  return resolveSheetHeaderMap([
    'Lead ID', 'Date received', 'Parent/adult name', 'Child name', 'Child age', 'Phone', 'Email', 'Language', 'City', 'School status', 'Broad concern', 'Lead source', 'Campaign', 'Pipeline stage', 'Last contact', 'Next action', 'Next-action date', 'Travel to Beit Shemesh', 'Preferred alternative area', 'Weekly schedule feasible', 'Price acknowledgement', 'Consultation preference', 'Offer quoted', 'Outcome', 'General sales notes', 'Enrolled case ID',
    ...Object.values(MACHINE_HEADERS),
  ]);
}

function initialLeadRow({ normalized = {}, payload = {}, config = lifeSkillsSheetCrmConfig(), now = new Date(), headerMap = legacyHeaderMap() } = {}) {
  const phone = normalizeLifeSkillsPhone(normalized.fromNumber || normalized.chatId || '', config.defaultCountry);
  const receivedAt = new Date(normalized.occurredAt || now);
  const receivedIso = Number.isFinite(receivedAt.getTime()) ? receivedAt.toISOString() : new Date(now).toISOString();
  const attribution = messageAttribution(payload);
  if (headerMap.missingMachine?.length) throw new Error('Life Skills CRM machine headers are unresolved');
  const row = Array(Math.max(headerMap.maxColumnIndex + 1, ...Object.values({ ...headerMap.columns, ...headerMap.machine }).map(columnIndex))).fill('');
  const set = (column, value) => { row[columnIndex(column)] = value; };
  set(headerMap.columns.leadId, stableLeadId(phone)); set(headerMap.columns.receivedAt, receivedIso); set(headerMap.columns.parentName, normalizeText(normalized.pushName, 120)); set(headerMap.columns.phone, phone);
  set(headerMap.columns.language, detectedLanguage(normalized.messageText || '')); set(headerMap.columns.source, attribution.source || 'WhatsApp'); set(headerMap.columns.campaign, attribution.campaign);
  set(headerMap.columns.stage, 'New inquiry'); set(headerMap.columns.lastContact, receivedIso); set(headerMap.columns.nextAction, 'Respond to inbound WhatsApp inquiry'); set(headerMap.columns.dueDate, dateOnlyInTimeZone(receivedAt, config.timeZone));
  set(headerMap.machine.providerMessageIds, providerMessageIds('', normalized.messageId)); set(headerMap.machine.firstInboundAt, receivedIso); set(headerMap.machine.lastInboundAt, receivedIso); set(headerMap.machine.responseOwner, config.responseOwner);
  return row;
}

async function ensureMachineHeaders(sheets, config) {
  const existing = (await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range: sheetRange(config, 'A1:ZZ1') })).data?.values?.[0] || [];
  const currentMap = resolveSheetHeaderMap(existing);
  if (!currentMap.missingMachine.length) return currentMap;
  const data = [];
  let nextColumnIndex = existing.reduce((last, value, index) => normalizeText(value, 160) ? index : last, -1) + 1;
  for (const key of currentMap.missingMachine) {
    const column = columnName(nextColumnIndex++);
    data.push({ range: sheetRange(config, `${column}1`), values: [[MACHINE_HEADERS[key]]] });
  }
  if (data.length) await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: config.spreadsheetId, requestBody: { valueInputOption: 'RAW', data } });
  const updated = existing.slice();
  for (const write of data) {
    const column = String(write.range).match(/!([A-Z]+)1$/i)?.[1];
    if (column) updated[columnIndex(column)] = write.values[0][0];
  }
  return resolveSheetHeaderMap(updated);
}

async function findLeadRowByPhone(sheets, config, phone, headerMap) {
  const column = headerMap.columns.phone;
  const result = await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range: sheetRange(config, `${column}2:${column}1000`) });
  const index = (result.data?.values || []).findIndex((row) => normalizeLifeSkillsPhone(row?.[0], config.defaultCountry) === phone);
  return index < 0 ? null : index + 2;
}

async function existingLeadContext(sheets, config, row, headerMap) {
  const fields = { source: headerMap.columns.source, campaign: headerMap.columns.campaign, stage: headerMap.columns.stage, nextAction: headerMap.columns.nextAction, dueDate: headerMap.columns.dueDate, providerIds: headerMap.machine.providerMessageIds, firstInboundAt: headerMap.machine.firstInboundAt, responseOwner: headerMap.machine.responseOwner };
  const keys = Object.keys(fields);
  const result = await sheets.spreadsheets.values.batchGet({ spreadsheetId: config.spreadsheetId, ranges: keys.map((key) => sheetRange(config, `${fields[key]}${row}`)) });
  return Object.fromEntries(keys.map((key, index) => [key, result.data?.valueRanges?.[index]?.values?.[0]?.[0] || '']));
}

async function updateExistingLead({ sheets, config, normalized, payload, row, now, headerMap }) {
  const current = await existingLeadContext(sheets, config, row, headerMap);
  const occurredAt = new Date(normalized.occurredAt || now);
  const occurredIso = Number.isFinite(occurredAt.getTime()) ? occurredAt.toISOString() : new Date(now).toISOString();
  const attribution = messageAttribution(payload);
  const data = [
    { range: sheetRange(config, `${headerMap.columns.lastContact}${row}`), values: [[occurredIso]] },
    { range: sheetRange(config, `${headerMap.machine.providerMessageIds}${row}`), values: [[providerMessageIds(current.providerIds, normalized.messageId)]] },
    { range: sheetRange(config, `${headerMap.machine.lastInboundAt}${row}`), values: [[occurredIso]] },
  ];
  if (!current.source && attribution.source) data.push({ range: sheetRange(config, `${headerMap.columns.source}${row}`), values: [[attribution.source]] });
  if (!current.campaign && attribution.campaign) data.push({ range: sheetRange(config, `${headerMap.columns.campaign}${row}`), values: [[attribution.campaign]] });
  if (!current.stage) data.push({ range: sheetRange(config, `${headerMap.columns.stage}${row}`), values: [['New inquiry']] });
  if (!current.nextAction) data.push({ range: sheetRange(config, `${headerMap.columns.nextAction}${row}`), values: [['Respond to inbound WhatsApp inquiry']] });
  if (!current.dueDate) data.push({ range: sheetRange(config, `${headerMap.columns.dueDate}${row}`), values: [[dateOnlyInTimeZone(occurredAt, config.timeZone)]] });
  if (!current.firstInboundAt) data.push({ range: sheetRange(config, `${headerMap.machine.firstInboundAt}${row}`), values: [[occurredIso]] });
  if (!current.responseOwner) data.push({ range: sheetRange(config, `${headerMap.machine.responseOwner}${row}`), values: [[config.responseOwner]] });
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: config.spreadsheetId, requestBody: { valueInputOption: 'RAW', data } });
  return { action: 'updated_existing', row, providerMessageIds: providerMessageIds(current.providerIds, normalized.messageId) };
}

async function upsertLifeSkillsSheetLead({ sheets, normalized = {}, payload = {}, scope = {}, config = lifeSkillsSheetCrmConfig(), now = new Date() } = {}) {
  if (!sheets?.spreadsheets?.values) throw new Error('Google Sheets adapter is required');
  const eligibility = isLifeSkillsInboundInquiry({ normalized, scope, config });
  if (!eligibility.eligible) return { action: 'skipped_ineligible', blockers: eligibility.blockers };
  const headerMap = await ensureMachineHeaders(sheets, config);
  const existingRow = await findLeadRowByPhone(sheets, config, eligibility.phone, headerMap);
  if (existingRow) return updateExistingLead({ sheets, config, normalized, payload, row: existingRow, now, headerMap });
  const append = await sheets.spreadsheets.values.append({ spreadsheetId: config.spreadsheetId, range: sheetRange(config, `A:${columnName(headerMap.maxColumnIndex)}`), valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [initialLeadRow({ normalized, payload, config, now, headerMap })] } });
  return { action: 'created', row: rowNumberFromUpdatedRange(append.data?.updates?.updatedRange), providerMessageIds: providerMessageIds('', normalized.messageId) };
}

module.exports = { DEFAULT_SHEET_ID, DEFAULT_SHEET_NAME, LEAD_HEADERS, LIFE_SKILLS_SHEET_CRM_CONFIRM, MACHINE_HEADERS, SHEET_FIELD_MAP_VERSION, buildLifeSkillsSheetCrmReadiness, dateOnlyInTimeZone, initialLeadRow, isLifeSkillsInboundInquiry, lifeSkillsSheetCrmConfig, messageAttribution, normalizeLifeSkillsPhone, providerMessageIds, resolveSheetHeaderMap, stableLeadId, upsertLifeSkillsSheetLead };
