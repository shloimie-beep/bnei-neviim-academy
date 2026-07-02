const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_DOMAIN = 'onetimeonetime.com';
const ONE_TIME_FROM_EMAIL = 'info@onetimeonetime.com';
const ONE_TIME_FROM_NAME = 'OneTimeOneTime Mishnah';
const ONE_TIME_REPLY_TO = ONE_TIME_FROM_EMAIL;
const ONE_TIME_TRIAL_DAYS = 30;
const ONE_TIME_LAUNCH_BATCH = 'one-time-launch-2026-06-28';
const ONE_TIME_REQUIRED_CONTACT_TAGS = [
  'active_old_app',
  'warm_uncontacted',
  'imported_needs_review',
  'no_send',
  'campaign_candidate_30_day_free',
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
];

const SPREADSHEET_EXTENSIONS = new Set(['.csv', '.tsv', '.xlsx']);
const RABBI_CUE = /\b(rabbi|scheller|sheller|one[\s_-]*time|onetime|mishnah|mishnayos|subscriber|subscribed|audience)\b|subscribed[_\s-]*email[_\s-]*audience|email[_\s-]*audience|audience[_\s-]*export/i;
const NON_RABBI_CUE = /\b(webcraft|plumber|orthoped|doctor|ucla|facebook[_\s-]*ads|bnei[-_\s]*neviim[-_\s]*academy[-_\s]*transactions)\b/i;
const SUPPRESSION_CUE = /\b(unsubscribed|cleaned|bounce|complaint|suppressed)\b|unsubscribed[_\s-]*email|cleaned[_\s-]*email|suppressed[_\s-]*contact/i;
const EMAIL_FIELD_NAMES = [
  'email',
  'email_address',
  'parent_email',
  'e_mail',
  'e_mail_1_value',
  'e_mail_2_value',
  'e_mail_3_value',
  'e_mail_4_value',
  'email_1_value',
  'email_2_value',
  'email_3_value',
  'email_4_value',
];
const PHONE_FIELD_NAMES = [
  'phone',
  'phone_number',
  'parent_phone',
  'mobile',
  'mobile_phone',
  'cell',
  'cell_phone',
  'whatsapp',
  'whatsapp_phone',
  'telephone',
  'phone_1_value',
  'phone_2_value',
  'phone_3_value',
  'phone_4_value',
  'phone_5_value',
  'phone_6_value',
];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const handle = fs.openSync(filePath, 'r');
  const chunk = Buffer.allocUnsafe(1024 * 1024);
  try {
    let bytesRead = 0;
    do {
      bytesRead = fs.readSync(handle, chunk, 0, chunk.length, null);
      if (bytesRead > 0) hash.update(chunk.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(handle);
  }
  return hash.digest('hex');
}

function readFilePrefix(filePath, maxBytes = 2 * 1024 * 1024) {
  const handle = fs.openSync(filePath, 'r');
  const buffer = Buffer.allocUnsafe(maxBytes);
  try {
    const bytesRead = fs.readSync(handle, buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(handle);
  }
}

function safeRelative(filePath, baseDir = process.cwd()) {
  return path.relative(baseDir, filePath).replace(/\\/g, '/');
}

function normalizeHeader(value = '') {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeEmail(value = '') {
  const match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : '';
}

function normalizePhone(value = '') {
  const digits = String(value || '').replace(/\D+/g, '');
  if (digits.length < 7) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  return digits;
}

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseDelimited(text = '', delimiter = ',') {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((value) => compactWhitespace(value)));
}

function rowsToObjects(rows = []) {
  const [headerRow = [], ...bodyRows] = rows;
  const headers = headerRow.map((header) => String(header || '').trim());
  const normalizedHeaders = headers.map(normalizeHeader);
  const objects = bodyRows.map((cells, rowIndex) => {
    const row = { __row_number: rowIndex + 2 };
    normalizedHeaders.forEach((header, columnIndex) => {
      if (!header) return;
      row[header] = compactWhitespace(cells[columnIndex] || '');
    });
    return row;
  });
  return { headers, normalizedHeaders, rows: objects };
}

function decodeXmlEntities(value = '') {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function unzipEntries(buffer) {
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;
  const searchStart = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= searchStart; offset -= 1) {
    if (buffer.readUInt32LE(offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error('XLSX central directory was not found');
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  let centralOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  for (let entryIndex = 0; entryIndex < totalEntries; entryIndex += 1) {
    if (buffer.readUInt32LE(centralOffset) !== 0x02014b50) {
      throw new Error('Invalid XLSX central directory entry');
    }
    const method = buffer.readUInt16LE(centralOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralOffset + 20);
    const fileNameLength = buffer.readUInt16LE(centralOffset + 28);
    const extraLength = buffer.readUInt16LE(centralOffset + 30);
    const commentLength = buffer.readUInt16LE(centralOffset + 32);
    const localHeaderOffset = buffer.readUInt32LE(centralOffset + 42);
    const name = buffer
      .subarray(centralOffset + 46, centralOffset + 46 + fileNameLength)
      .toString('utf8')
      .replace(/\\/g, '/');
    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = compressed;
    else if (method === 8) data = zlib.inflateRawSync(compressed);
    else throw new Error(`Unsupported XLSX compression method ${method}`);
    entries.set(name, data.toString('utf8'));
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

function columnIndex(cellRef = '') {
  const letters = String(cellRef || '').match(/^[A-Z]+/i)?.[0] || 'A';
  return [...letters.toUpperCase()].reduce((sum, char) => sum * 26 + (char.charCodeAt(0) - 64), 0) - 1;
}

function textFromCell(cellXml = '', sharedStrings = []) {
  const type = cellXml.match(/\bt="([^"]+)"/)?.[1] || '';
  if (type === 'inlineStr') {
    const inline = [...cellXml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXmlEntities(match[1])).join('');
    return compactWhitespace(inline);
  }
  const value = cellXml.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1] || '';
  if (type === 's') return compactWhitespace(sharedStrings[Number(value)] || '');
  return compactWhitespace(decodeXmlEntities(value));
}

function parseXlsxRows(buffer) {
  const entries = unzipEntries(buffer);
  const sharedXml = entries.get('xl/sharedStrings.xml') || '';
  const sharedStrings = [...sharedXml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXmlEntities(part[1])).join('')
  );
  const sheetPath = [...entries.keys()].find((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name));
  if (!sheetPath) return [];
  const sheetXml = entries.get(sheetPath) || '';
  return [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const cells = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const ref = cellMatch[1].match(/\br="([^"]+)"/)?.[1] || '';
      cells[columnIndex(ref)] = textFromCell(`<c ${cellMatch[1]}>${cellMatch[2]}</c>`, sharedStrings);
    }
    return cells.map((cell) => cell || '');
  }).filter((row) => row.some((value) => compactWhitespace(value)));
}

function readSpreadsheet(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  if (ext === '.xlsx') {
    return rowsToObjects(parseXlsxRows(buffer));
  }
  const text = buffer.toString('utf8');
  return rowsToObjects(parseDelimited(text, ext === '.tsv' ? '\t' : ','));
}

function recognizedFields(normalizedHeaders = []) {
  const known = new Set([
    'email',
    'email_address',
    'parent_email',
    'e_mail_1_value',
    'e_mail_2_value',
    'e_mail_3_value',
    'e_mail_4_value',
    'email_1_value',
    'email_2_value',
    'email_3_value',
    'email_4_value',
    'name',
    'full_name',
    'parent_name',
    'display_name',
    'file_as',
    'first_name',
    'last_name',
    'phone',
    'phone_number',
    'parent_phone',
    'mobile',
    'mobile_phone',
    'cell',
    'cell_phone',
    'whatsapp',
    'whatsapp_phone',
    'phone_1_value',
    'phone_2_value',
    'phone_3_value',
    'phone_4_value',
    'phone_5_value',
    'phone_6_value',
    'status',
    'plan',
    'product_name',
    'action',
    'action_type',
    'marketing_opt_in',
    'tags',
    'notes',
    'joined',
    'trial_end',
  ]);
  return [...new Set(normalizedHeaders.filter((header) => known.has(header)))].sort();
}

function rowCueText(rows = []) {
  return rows.slice(0, 80).map((row) => [
    row.product_name,
    row.status,
    row.action,
    row.action_type,
    row.tags,
    row.notes,
    row.plan,
  ].filter(Boolean).join(' ')).join(' ');
}

function isEmailHeader(header = '') {
  const normalized = normalizeHeader(header);
  return EMAIL_FIELD_NAMES.includes(normalized) || /^e?_?mail_\d+_value$/.test(normalized);
}

function isPhoneHeader(header = '') {
  const normalized = normalizeHeader(header);
  return PHONE_FIELD_NAMES.includes(normalized) || /^phone_\d+_value$/.test(normalized);
}

function hasContactHeader(normalizedHeaders = []) {
  return normalizedHeaders.some((header) => isEmailHeader(header) || isPhoneHeader(header));
}

function classifySpreadsheet({ filePath, normalizedHeaders = [], rows = [], forceRabbiOneTime = false } = {}) {
  const name = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const haystack = `${name} ${recognizedFields(normalizedHeaders).join(' ')} ${rowCueText(rows)}`;
  if (NON_RABBI_CUE.test(name)) {
    return {
      classification: 'excluded_non_rabbi',
      import_lane: 'excluded',
      reason: 'filename_matches_non_rabbi_or_webcraft_pattern',
    };
  }
  const hasContactShape = hasContactHeader(normalizedHeaders);
  if (forceRabbiOneTime && hasContactShape) {
    return {
      classification: 'rabbi_onetime_contact_export',
      import_lane: SUPPRESSION_CUE.test(name) ? 'suppression_import_candidate' : 'contact_import_candidate',
      reason: 'operator_approved_rabbi_onetime_contact_fields',
    };
  }
  const rabbiLikely = RABBI_CUE.test(haystack);
  if (rabbiLikely && hasContactShape) {
    return {
      classification: 'rabbi_onetime_contact_export',
      import_lane: SUPPRESSION_CUE.test(name) ? 'suppression_import_candidate' : 'contact_import_candidate',
      reason: 'rabbi_onetime_cue_with_contact_fields',
    };
  }
  if (rabbiLikely) {
    return {
      classification: ext === '.xlsx' ? 'rabbi_onetime_xlsx_review' : 'rabbi_onetime_review',
      import_lane: 'review_only',
      reason: 'rabbi_onetime_cue_without_contact_fields',
    };
  }
  if (hasContactShape) {
    return {
      classification: 'contact_export_unclassified',
      import_lane: 'needs_review',
      reason: 'contact_fields_without_rabbi_onetime_cue',
    };
  }
  return {
    classification: 'not_contact_import_candidate',
    import_lane: 'excluded',
    reason: 'no_contact_shape_or_rabbi_onetime_cue',
  };
}

function inventoryDownloadsSpreadsheets(options = {}) {
  const downloadsDir = options.downloadsDir || path.join(os.homedir(), 'Downloads');
  const now = options.now ? new Date(options.now) : new Date();
  const sinceDays = Number.isFinite(Number(options.sinceDays)) ? Number(options.sinceDays) : 10;
  const maxParseBytes = Number.isFinite(Number(options.maxParseBytes))
    ? Number(options.maxParseBytes)
    : 8 * 1024 * 1024;
  const maxSampleBytes = Number.isFinite(Number(options.maxSampleBytes))
    ? Number(options.maxSampleBytes)
    : 2 * 1024 * 1024;
  const sinceTime = now.getTime() - sinceDays * 24 * 60 * 60 * 1000;
  const files = fs.existsSync(downloadsDir)
    ? fs.readdirSync(downloadsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && SPREADSHEET_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => path.join(downloadsDir, entry.name))
    : [];
  const inventory = files.map((filePath) => {
    const stat = fs.statSync(filePath);
    let parsed = { headers: [], normalizedHeaders: [], rows: [] };
    let parseError = null;
    let parseStatus = 'parsed';
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const withinSinceWindow = stat.mtime.getTime() >= sinceTime;
    const likelyRabbiByName = RABBI_CUE.test(fileName) && !NON_RABBI_CUE.test(fileName);
    try {
      if (stat.size > maxParseBytes && !withinSinceWindow && !likelyRabbiByName) {
        parseStatus = 'skipped_oversize_outside_window';
      } else if (stat.size > maxParseBytes && ext !== '.xlsx') {
        const sample = readFilePrefix(filePath, maxSampleBytes).toString('utf8');
        parsed = rowsToObjects(parseDelimited(sample, ext === '.tsv' ? '\t' : ','));
        parseStatus = 'sampled_oversize';
      } else if (stat.size > maxParseBytes) {
        parseStatus = 'skipped_oversize_xlsx_needs_review';
        parseError = `file_size_exceeds_parse_limit:${stat.size}`;
      } else {
        parsed = readSpreadsheet(filePath);
      }
    } catch (error) {
      parseError = error.message;
      parseStatus = 'failed';
    }
    const classification = classifySpreadsheet({
      filePath,
      normalizedHeaders: parsed.normalizedHeaders,
      rows: parsed.rows,
      forceRabbiOneTime: options.forceRabbiOneTime === true,
    });
    return {
      file_name: fileName,
      extension: ext,
      modified_at: stat.mtime.toISOString(),
      size_bytes: stat.size,
      sha256: sha256File(filePath),
      within_since_window: withinSinceWindow,
      row_count: parseStatus === 'sampled_oversize' || parseStatus.startsWith('skipped_oversize') ? null : parsed.rows.length,
      sampled_row_count: parseStatus === 'sampled_oversize' ? parsed.rows.length : null,
      header_count: parsed.normalizedHeaders.length,
      recognized_fields: recognizedFields(parsed.normalizedHeaders),
      parse_status: parseStatus,
      parse_error: parseError,
      ...classification,
    };
  }).sort((a, b) => Date.parse(b.modified_at) - Date.parse(a.modified_at));
  return {
    generated_at: now.toISOString(),
    downloads_dir: downloadsDir,
    since_days: sinceDays,
    privacy: {
      raw_rows_committed: false,
      raw_headers_committed: false,
      private_values_committed: false,
    },
    limits: {
      max_parse_bytes: maxParseBytes,
      max_sample_bytes: maxSampleBytes,
    },
    files: inventory,
    summary: {
      total_spreadsheets: inventory.length,
      within_since_window: inventory.filter((file) => file.within_since_window).length,
      rabbi_onetime_files: inventory.filter((file) => file.classification.startsWith('rabbi_onetime')).length,
      import_candidates: inventory.filter((file) => /import_candidate/.test(file.import_lane)).length,
      needs_review: inventory.filter((file) => file.import_lane === 'needs_review' || file.import_lane === 'review_only').length,
      excluded: inventory.filter((file) => file.import_lane === 'excluded').length,
    },
  };
}

function field(row, names = []) {
  for (const name of names) {
    const value = compactWhitespace(row[normalizeHeader(name)] || row[name] || '');
    if (value) return value;
  }
  return '';
}

function fieldByHeader(row = {}, predicate = () => false) {
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith('__')) continue;
    if (!predicate(key)) continue;
    const cleaned = compactWhitespace(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function emailValue(row = {}) {
  return normalizeEmail(field(row, EMAIL_FIELD_NAMES) || fieldByHeader(row, isEmailHeader));
}

function phoneValue(row = {}) {
  for (let index = 1; index <= 6; index += 1) {
    const label = field(row, [`phone_${index}_label`]).toLowerCase();
    const value = field(row, [`phone_${index}_value`]);
    if (value && /mobile|cell|whats|iphone|phone/.test(label)) {
      const normalized = normalizePhone(value);
      if (normalized) return normalized;
    }
  }
  const direct = normalizePhone(field(row, PHONE_FIELD_NAMES) || fieldByHeader(row, isPhoneHeader));
  if (direct) return direct;
  for (let index = 1; index <= 6; index += 1) {
    const normalized = normalizePhone(field(row, [`phone_${index}_value`]));
    if (normalized) return normalized;
  }
  return '';
}

function contactName(row = {}) {
  const explicit = field(row, ['name', 'full_name', 'parent_name', 'display_name']);
  if (explicit) return explicit;
  const first = field(row, ['first_name', 'first']);
  const last = field(row, ['last_name', 'last']);
  const combined = compactWhitespace(`${first} ${last}`);
  if (combined) return combined;
  const fileAs = field(row, ['file_as']);
  if (fileAs) return fileAs;
  const email = emailValue(row);
  const local = email.split('@')[0] || '';
  return local ? local.replace(/[._+-]+/g, ' ').replace(/\b[a-z]/g, (letter) => letter.toUpperCase()) : 'One Time contact';
}

function sourceFileState(fileName = '', row = {}) {
  const text = `${fileName} ${field(row, ['status', 'action', 'action_type'])}`.toLowerCase();
  if (/unsubscribed/.test(text)) return 'unsubscribed';
  if (/cleaned|bounce|complaint|suppressed/.test(text)) return 'cleaned';
  if (/trial/.test(text)) return 'trial';
  if (/cancelled|canceled/.test(text)) return 'cancelled';
  if (/active|subscribed|customer_created|member/.test(text)) return 'active';
  return 'unknown';
}

function tagList(tags = []) {
  return [...new Set(tags.map((tag) => compactWhitespace(tag)).filter(Boolean))].sort();
}

function contactFromRow(row = {}, source = {}) {
  const batchId = compactWhitespace(source.source_batch || ONE_TIME_LAUNCH_BATCH) || ONE_TIME_LAUNCH_BATCH;
  const email = emailValue(row);
  const phone = phoneValue(row);
  if (!email && !phone) return null;
  const status = sourceFileState(source.file_name, row);
  const activeOldApp = ['active', 'trial'].includes(status);
  const suppression = ['unsubscribed', 'cleaned', 'cancelled'].includes(status);
  const warmUncontacted = !suppression;
  const campaignCandidate = !suppression && Boolean(email);
  const importedNeedsReview = status === 'unknown' || !email;
  const exactTags = [
    'no_send',
    ONE_TIME_PROJECT_KEY,
    ONE_TIME_WORKSPACE_KEY,
    activeOldApp ? 'active_old_app' : '',
    warmUncontacted ? 'warm_uncontacted' : '',
    importedNeedsReview ? 'imported_needs_review' : '',
    campaignCandidate ? 'campaign_candidate_30_day_free' : '',
  ];
  const uiTags = [
    'one-time-list:rabbi-email-contacts',
    'one-time-campaign-staging',
    'one-time-no-send-until-approved',
    `one-time-status:${status}`,
    field(row, ['plan']) ? `one-time-plan:${normalizeHeader(field(row, ['plan']))}` : '',
    `one-time-import:${batchId}`,
  ];
  return {
    dedupe_key: email ? `email:${email}` : `phone:${phone}`,
    email,
    phone,
    parent_name: contactName(row),
    source_status: status,
    source_plan: field(row, ['plan']) || 'unknown',
    lead_status: suppression ? 'not_now' : activeOldApp ? 'interested' : 'lead_candidate',
    interest_level: suppression ? 'cool' : warmUncontacted ? 'warm' : 'unknown',
    active_old_app: activeOldApp,
    warm_uncontacted: warmUncontacted,
    imported_needs_review: importedNeedsReview,
    no_send: true,
    campaign_candidate_30_day_free: campaignCandidate,
    tags: tagList([...exactTags, ...uiTags]),
    source: {
      file_name: source.file_name,
      file_sha256: source.sha256,
      source_batch: batchId,
      row_number: row.__row_number,
      source_system: source.classification === 'rabbi_onetime_contact_export' ? 'spreadsheet_import' : 'legacy_rabbi_app',
    },
  };
}

function buildOneTimeContactImportPlan(options = {}) {
  const inventory = options.inventory || inventoryDownloadsSpreadsheets(options);
  const batchId = compactWhitespace(options.batchId || ONE_TIME_LAUNCH_BATCH) || ONE_TIME_LAUNCH_BATCH;
  const candidates = inventory.files.filter((file) =>
    file.within_since_window
    && ['contact_import_candidate', 'suppression_import_candidate'].includes(file.import_lane)
  );
  const contacts = [];
  const skipped = [];
  for (const candidate of candidates) {
    const filePath = path.join(inventory.downloads_dir, candidate.file_name);
    let parsed;
    try {
      parsed = readSpreadsheet(filePath);
    } catch (error) {
      skipped.push({ file_name: candidate.file_name, reason: `parse_failed:${error.message}` });
      continue;
    }
    for (const row of parsed.rows) {
      const contact = contactFromRow(row, { ...candidate, source_batch: batchId });
      if (contact) contacts.push(contact);
      else skipped.push({ file_name: candidate.file_name, reason: 'missing_email_and_phone' });
    }
  }
  const byDedupe = new Map();
  const duplicates = [];
  for (const contact of contacts) {
    if (byDedupe.has(contact.dedupe_key)) {
      const existing = byDedupe.get(contact.dedupe_key);
      existing.tags = tagList([...existing.tags, ...contact.tags]);
      existing.sources = [...(existing.sources || [existing.source]), contact.source];
      if (contact.active_old_app) existing.active_old_app = true;
      if (contact.campaign_candidate_30_day_free) existing.campaign_candidate_30_day_free = true;
      if (contact.imported_needs_review) existing.imported_needs_review = true;
      duplicates.push({ file_name: contact.source.file_name, dedupe_key_hash: sha256(contact.dedupe_key).slice(0, 16) });
    } else {
      byDedupe.set(contact.dedupe_key, { ...contact, sources: [contact.source] });
    }
  }
  const dedupedContacts = [...byDedupe.values()];
  return {
    generated_at: inventory.generated_at,
    batch_id: batchId,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    preview_only: options.apply !== true,
    apply_requested: options.apply === true,
    force_rabbi_onetime: options.forceRabbiOneTime === true,
    no_send: true,
    external_write_performed: false,
    source_files: candidates.map((file) => ({
      file_name: file.file_name,
      sha256: file.sha256,
      row_count: file.row_count,
      import_lane: file.import_lane,
      classification: file.classification,
    })),
    contacts: dedupedContacts,
    required_contact_tags: ONE_TIME_REQUIRED_CONTACT_TAGS,
    private_contact_values_in_report: false,
    counts: {
      files_considered: candidates.length,
      rows_considered: contacts.length + skipped.length,
      contacts_valid_before_dedupe: contacts.length,
      contacts_after_dedupe: dedupedContacts.length,
      duplicates_merged_or_skipped: duplicates.length,
      skipped_rows: skipped.length,
      active_old_app: dedupedContacts.filter((contact) => contact.active_old_app).length,
      warm_uncontacted: dedupedContacts.filter((contact) => contact.warm_uncontacted).length,
      imported_needs_review: dedupedContacts.filter((contact) => contact.imported_needs_review).length,
      no_send: dedupedContacts.filter((contact) => contact.no_send).length,
      campaign_candidate_30_day_free: dedupedContacts.filter((contact) => contact.campaign_candidate_30_day_free).length,
    },
    skipped,
    duplicate_key_hashes: duplicates,
    safety: [
      'No email, WhatsApp, SMS, Telegram, Buffer, Stripe, DNS, or external CRM action is performed by the import plan.',
      'Raw rows, contact values, and private headers are not written to evidence reports.',
      'Dedupe is project-scoped and uses email first, then phone when email is missing.',
    ],
  };
}

function buildOneTimeStripeTrialPolicy(options = {}) {
  return {
    provider: 'stripe',
    account_scope: 'rabbi_sheller_provider_own_stripe_account',
    stripe_only: true,
    stripe_connect_required: false,
    live_billing_enabled: false,
    live_charge_allowed: false,
    automatic_tax_enabled: false,
    refund_policy: 'no_refunds',
    receipt_language: 'en',
    trial: {
      days: Number(options.trial_days || ONE_TIME_TRIAL_DAYS),
      card_required: false,
      payment_method_required_at_signup: false,
      checkout_required_at_signup: false,
      access_during_trial: true,
    },
    grace_period: {
      days: 0,
      access_during_grace: false,
    },
    conversion: {
      checkout_timing: 'near_or_after_trial_end',
      payment_method_collection: 'later_explicit_checkout_or_setup',
      cancellation_workflow_live_enabled: false,
    },
    ignored_for_now: ['provider_revenue_split', 'payout_ownership', 'tax_configuration'],
  };
}

function buildOneTimeTrialSignupPreview(input = {}, options = {}) {
  const checkedAt = options.checkedAt || new Date().toISOString();
  const policy = buildOneTimeStripeTrialPolicy(options.policy || {});
  const email = normalizeEmail(input.email || input.parent_email || 'prospect@example.test');
  const referralCode = compactWhitespace(input.referral_code || input.referralCode || input.referral || '');
  const sourceLandingPage = compactWhitespace(input.source_landing_page || input.sourceLandingPage || '/one-time');
  const start = new Date(checkedAt);
  const end = new Date(start.getTime() + policy.trial.days * 24 * 60 * 60 * 1000);
  return {
    preview_only: true,
    local_write_performed: false,
    external_write_performed: false,
    email_send_performed: false,
    stripe_checkout_created: false,
    live_charge_performed: false,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    lead_status: 'trial_pending_review',
    list_membership_status: 'campaign_candidate_30_day_free',
    access_status: 'trial',
    signup_flow: 'no_card_30_day_trial',
    source_landing_page: sourceLandingPage,
    referral: {
      code: referralCode || null,
      captured: Boolean(referralCode),
      attribution_write_performed: false,
      reward_or_credit_created: false,
    },
    trial_start_at: start.toISOString(),
    trial_end_at: end.toISOString(),
    parent: {
      name: compactWhitespace(input.parent_name || input.parentName || 'One Time Prospect'),
      email,
    },
    student: {
      name: compactWhitespace(input.student_name || input.studentName || input.learner_name || 'One Time learner'),
    },
    required_tags: [
      'campaign_candidate_30_day_free',
      'warm_uncontacted',
      'no_send',
      'trial_30_days_no_card',
      ONE_TIME_PROJECT_KEY,
      ONE_TIME_WORKSPACE_KEY,
    ],
    policy,
  };
}

function sequenceDrafts(options = {}) {
  const cta = options.ctaUrl || 'https://onetimeonetime.com/one-time';
  return [
    {
      key: 'launch_announcement_30_day_free',
      stage: 'launch',
      audience: 'imported_contact_or_warm_lead',
      subject: 'Build the most amazing Mishnah Zoom class with Rabbi Sheller',
      body: [
        'Hi {{first_name|there}},',
        '',
        'Rabbi Sheller / OneTimeOneTime Mishnah is building a live Zoom Mishnah class experience that should feel clear, serious, warm, and easy to join.',
        '',
        'You can sign up now and get 30 days free. No credit card is required to start.',
        '',
        `Sign up here: ${cta}`,
        '',
        'You are receiving this as a OneTimeOneTime Mishnah update. You can unsubscribe from marketing updates.',
      ].join('\n'),
    },
    {
      key: 'welcome_after_signup',
      stage: 'onboarding',
      audience: 'signup_trial',
      subject: 'Welcome to your 30-day OneTimeOneTime Mishnah trial',
      body: 'Welcome. Your 30-day free trial is ready, and no card was collected. We will send class details and next steps before the next live session.',
    },
    {
      key: 'week_1_class_reminder',
      stage: 'weekly',
      audience: 'trial_or_member',
      subject: 'This week in the live Mishnah class',
      body: 'A short reminder for this week: come ready to follow the Mishnah inside, think clearly, and bring one good question.',
    },
    {
      key: 'week_2_engagement',
      stage: 'weekly',
      audience: 'trial_or_member',
      subject: 'Keep the Mishnah learning moving',
      body: 'Week 2 is about consistency. Review the last class, join live if you can, and send in a question for Rabbi review.',
    },
    {
      key: 'week_3_benefit_reminder',
      stage: 'weekly',
      audience: 'trial_or_member',
      subject: 'Your OneTimeOneTime Mishnah trial is still open',
      body: 'You still have time in the free trial. Use the live class, replay, and review prompts while access is open.',
    },
    {
      key: 'trial_ending_soon_payment_setup',
      stage: 'conversion',
      audience: 'trial_ending',
      subject: 'Your 30-day Mishnah trial is ending soon',
      body: 'Your free trial is almost complete. We will share the payment setup path separately before paid access starts. No automatic charge will happen.',
    },
    {
      key: 'trial_ended_payment_required',
      stage: 'conversion',
      audience: 'trial_ended',
      subject: 'Payment setup is needed to continue OneTimeOneTime Mishnah',
      body: 'The free trial has ended. To continue access, use the approved Stripe payment setup path when it is available.',
    },
    {
      key: 'missed_signup_followup',
      stage: 'follow_up',
      audience: 'warm_uncontacted',
      subject: 'Still want the 30-day free Mishnah trial?',
      body: `If you meant to sign up but did not finish, you can still start with 30 days free and no credit card: ${cta}`,
    },
  ];
}

function buildOneTimeEmailWorkflowPreview(options = {}) {
  const readiness = options.resendReadiness || {};
  const drafts = sequenceDrafts(options).map((draft, index) => ({
    draft_id: `ONETIME-EMAIL-${String(index + 1).padStart(2, '0')}`,
    ...draft,
    from_email: ONE_TIME_FROM_EMAIL,
    from_name: ONE_TIME_FROM_NAME,
    reply_to: ONE_TIME_REPLY_TO,
    status: 'draft',
    send_status: 'blocked_until_review_readiness_and_explicit_confirmation',
    blocked_actions: ['bulk_send', 'individual_send_without_confirmation', 'fallback_bna_domain_send'],
    preview_only: true,
    email_send_performed: false,
  }));
  return {
    generated_at: options.checkedAt || new Date().toISOString(),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    domain: ONE_TIME_DOMAIN,
    sender_identity: {
      from_email: ONE_TIME_FROM_EMAIL,
      reply_to: ONE_TIME_REPLY_TO,
      display_name: ONE_TIME_FROM_NAME,
      customer_facing_bna_branding: false,
    },
    resend_readiness: {
      configured: Boolean(readiness.configured),
      connected: Boolean(readiness.connected),
      domain: readiness.domain || ONE_TIME_DOMAIN,
      domain_verified: Boolean(readiness.domain_verified),
      send_allowed: false,
      blocker: readiness.blocker || 'Email send remains blocked until One Time sender/domain readiness and explicit SEND_RESEND_EMAIL approval.',
    },
    statuses: ['draft', 'reviewed', 'approved', 'queued', 'sent', 'failed', 'suppressed', 'unsubscribed'],
    filters: ['campaign_candidate_30_day_free', 'active_old_app', 'warm_uncontacted', 'imported_needs_review', 'no_send'],
    bulk_send_enabled: false,
    test_send_enabled: false,
    confirmation_required: 'SEND_RESEND_EMAIL',
    preview_only: true,
    email_send_performed: false,
    drafts,
  };
}

function buildWorkspaceIsolationAudit(records = []) {
  const rows = Array.isArray(records) ? records : [];
  const leaks = rows.filter((row) => {
    const workspace = String(row.workspace_key || row.workspace || '').trim();
    const project = String(row.project_key || row.project || '').trim();
    const intendedOneTime = workspace === ONE_TIME_WORKSPACE_KEY || project === ONE_TIME_PROJECT_KEY;
    const bna = workspace === 'bna' || project === 'bna';
    return intendedOneTime && bna;
  });
  return {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    checked_records: rows.length,
    leaks_found: leaks.length,
    ok: leaks.length === 0,
    leak_ids: leaks.map((row) => row.id || row.key || null).filter(Boolean),
  };
}

module.exports = {
  ONE_TIME_DOMAIN,
  ONE_TIME_FROM_EMAIL,
  ONE_TIME_FROM_NAME,
  ONE_TIME_LAUNCH_BATCH,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_REPLY_TO,
  ONE_TIME_REQUIRED_CONTACT_TAGS,
  ONE_TIME_TRIAL_DAYS,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeContactImportPlan,
  buildOneTimeEmailWorkflowPreview,
  buildOneTimeStripeTrialPolicy,
  buildOneTimeTrialSignupPreview,
  buildWorkspaceIsolationAudit,
  classifySpreadsheet,
  contactFromRow,
  inventoryDownloadsSpreadsheets,
  normalizeEmail,
  normalizePhone,
  parseDelimited,
  parseXlsxRows,
  readSpreadsheet,
  recognizedFields,
  safeRelative,
  sha256,
};
