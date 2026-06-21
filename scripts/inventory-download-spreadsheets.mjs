#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'ops', 'one-time-mishnah');
const outputJson = path.join(outputDir, 'downloads-spreadsheet-inventory.json');
const outputMd = path.join(outputDir, 'downloads-spreadsheet-inventory.md');
const defaultDownloads = path.join(os.homedir(), 'Downloads');
const sourceDir = path.resolve(process.argv[2] || process.env.DOWNLOADS_SPREADSHEET_SOURCE_DIR || defaultDownloads);
const spreadsheetExtensions = new Set(['.csv', '.tsv', '.xlsx', '.xls', '.ods']);
const maxFiles = Number(process.env.DOWNLOADS_SPREADSHEET_MAX_FILES || 500);

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function readStart(filePath, byteCount = 128 * 1024) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(byteCount);
    const { bytesRead } = await handle.read(buffer, 0, byteCount, 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally {
    await handle.close();
  }
}

function countDelimitedRowsFile(filePath) {
  return new Promise((resolve, reject) => {
    let rows = 0;
    let lastByte = null;
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => {
      for (const byte of chunk) {
        if (byte === 10) rows += 1;
        lastByte = byte;
      }
    });
    stream.on('end', () => resolve(rows + (lastByte === 10 || lastByte === null ? 0 : 1)));
    stream.on('error', reject);
  });
}

function normalizeName(value = '') {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function relativeDownloadPath(filePath) {
  return path.relative(sourceDir, filePath).replace(/\\/g, '/');
}

function redactFileName(value = '') {
  return String(value || '')
    .replace(/AC[0-9a-fA-F]{20,}/g, 'AC_REDACTED')
    .replace(/_([a-f0-9]{8,})(?=\.)/gi, '_HASH')
    .replace(/\b\d{13,}\b/g, 'LONGNUMBER_REDACTED');
}

function redactRelativePath(filePath) {
  return relativeDownloadPath(filePath)
    .split('/')
    .map((part) => redactFileName(part))
    .join('/');
}

async function walk(dir) {
  const out = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || ['node_modules', '$RECYCLE.BIN'].includes(entry.name)) continue;
      out.push(...await walk(fullPath));
    } else if (entry.isFile() && spreadsheetExtensions.has(path.extname(entry.name).toLowerCase())) {
      out.push(fullPath);
    }
  }
  return out;
}

function parseDelimitedHeader(text, delimiter) {
  const row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = '';
      continue;
    }
    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      break;
    }
    cell += char;
  }
  row.push(cell);
  return row.map(normalizeName).filter(Boolean);
}

function countDelimitedRows(text) {
  if (!text.trim()) return 0;
  let rows = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === '\n') rows += 1;
  }
  return rows + (text.endsWith('\n') ? 0 : 1);
}

function decodeXml(value = '') {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function readZipEntries(filePath, wantedEntries) {
  let yauzl;
  try {
    yauzl = require('yauzl');
  } catch {
    return Promise.resolve({});
  }
  const wanted = new Set(wantedEntries);
  return new Promise((resolve, reject) => {
    const found = {};
    yauzl.open(filePath, { lazyEntries: true }, (openError, zipfile) => {
      if (openError) {
        resolve({});
        return;
      }
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (!wanted.has(entry.fileName)) {
          zipfile.readEntry();
          return;
        }
        zipfile.openReadStream(entry, (streamError, stream) => {
          if (streamError) {
            reject(streamError);
            return;
          }
          const chunks = [];
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('end', () => {
            found[entry.fileName] = Buffer.concat(chunks).toString('utf8');
            if (Object.keys(found).length >= wanted.size) {
              zipfile.close();
              resolve(found);
            } else {
              zipfile.readEntry();
            }
          });
          stream.on('error', reject);
        });
      });
      zipfile.on('end', () => resolve(found));
      zipfile.on('error', reject);
    });
  });
}

function parseSharedStrings(xml = '') {
  const strings = [];
  for (const match of xml.matchAll(/<si\b[\s\S]*?<\/si>/g)) {
    const parts = [...match[0].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1]));
    strings.push(normalizeName(parts.join('')));
  }
  return strings;
}

function parseSheetNames(workbookXml = '') {
  return [...workbookXml.matchAll(/<sheet\b[^>]*name="([^"]+)"/g)]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean);
}

function columnLettersToNumber(value = '') {
  return String(value || '').toUpperCase().split('').reduce((sum, char) => {
    const code = char.charCodeAt(0);
    if (code < 65 || code > 90) return sum;
    return sum * 26 + (code - 64);
  }, 0);
}

function parseDimension(ref = '') {
  const tail = String(ref || '').split(':').pop() || '';
  const match = tail.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return { row_count_estimate: null, column_count: null };
  return {
    row_count_estimate: Number(match[2]),
    column_count: columnLettersToNumber(match[1]),
  };
}

function parseFirstRowHeaders(sheetXml = '', sharedStrings = []) {
  const headers = [];
  const rowMatch = sheetXml.match(/<row\b[^>]*r="1"[\s\S]*?<\/row>/);
  if (!rowMatch) return headers;
  for (const cellMatch of rowMatch[0].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
    const attrs = cellMatch[1] || '';
    const body = cellMatch[2] || '';
    const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || '';
    const rawValue = (body.match(/<v>([\s\S]*?)<\/v>/) || body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '';
    let value = decodeXml(rawValue);
    if (type === 's') value = sharedStrings[Number(rawValue)] || '';
    headers.push(normalizeName(value));
  }
  return headers.filter(Boolean);
}

async function inspectXlsx(filePath) {
  const entries = await readZipEntries(filePath, [
    'xl/workbook.xml',
    'xl/sharedStrings.xml',
    'xl/worksheets/sheet1.xml',
  ]);
  const sheetNames = parseSheetNames(entries['xl/workbook.xml'] || '');
  const sharedStrings = parseSharedStrings(entries['xl/sharedStrings.xml'] || '');
  const sheet1 = entries['xl/worksheets/sheet1.xml'] || '';
  const dimensionRef = (sheet1.match(/<dimension\b[^>]*ref="([^"]+)"/) || [])[1] || '';
  return {
    sheet_names_redacted: sheetNames.map((name) => classifySheetName(name)),
    sheet_count: sheetNames.length || null,
    ...parseDimension(dimensionRef),
    headers: parseFirstRowHeaders(sheet1, sharedStrings),
  };
}

function classifySheetName(name = '') {
  const normalized = name.toLowerCase();
  if (/contact|lead|follower|subscriber/.test(normalized)) return 'contacts_or_audience';
  if (/opportunit|deal|pipeline/.test(normalized)) return 'opportunities_or_pipeline';
  if (/payment|transaction|invoice|billing/.test(normalized)) return 'accounting';
  if (/log|call|sms|message|whatsapp/.test(normalized)) return 'communications_log';
  if (/sheet\d*|table\d*/.test(normalized)) return 'generic_sheet';
  return 'named_sheet_redacted';
}

async function inspectDelimited(filePath, extension) {
  const text = await readStart(filePath);
  const delimiter = extension === '.tsv' ? '\t' : ',';
  const headers = parseDelimitedHeader(text.slice(0, 128 * 1024), delimiter);
  const rowCount = await countDelimitedRowsFile(filePath);
  return {
    row_count_estimate: Math.max(0, rowCount - 1),
    column_count: headers.length || null,
    headers,
  };
}

function detectHeaderSignals(headers = []) {
  const text = headers.join(' | ').toLowerCase();
  const signals = [];
  const add = (name, regex) => {
    if (regex.test(text)) signals.push(name);
  };
  add('email', /\be-?mail\b|email address/);
  add('phone', /\bphone\b|mobile|cell|whatsapp|sms/);
  add('name', /\b(first|last|full)?\s*name\b|contact name/);
  add('address', /\baddress\b|city|state|zip|postal|country/);
  add('subscription_status', /subscrib|unsubscrib|opt.?in|opt.?out|audience/);
  add('campaign_source', /campaign|source|utm|medium|ad set|facebook|lead form/);
  add('opportunity_pipeline', /opportunit|pipeline|stage|deal|value/);
  add('communication_log', /\bcall\b|\bsms\b|message|conversation|direction|duration/);
  add('accounting', /payment|transaction|invoice|amount|paid|balance/);
  add('student_or_parent', /student|parent|child|guardian|grade|school/);
  add('rabbi_or_onetime', /rabbi|scheller|sheller|one time|mishnah|mishna/);
  return [...new Set(signals)].sort();
}

function classifyFile(fileName, headerSignals = []) {
  const normalized = fileName.toLowerCase();
  const signals = new Set(headerSignals);
  if (/rabbi.*scheller.*followers/.test(normalized)) return 'one_time_rabbi_scheller_followers';
  if (/cleaned_email_audience|subscribed_email_audience|unsubscribed_email_audience|subscribers/.test(normalized)) return 'email_audience_export';
  if (/ghl|opportunities|pipeline/.test(normalized) || signals.has('opportunity_pipeline')) return 'legacy_crm_or_pipeline_export';
  if (/call-log|sms-log|whats.?app|bulk-action-logs/.test(normalized) || signals.has('communication_log')) return 'communications_export';
  if (/transaction|invoice|payment/.test(normalized) || signals.has('accounting')) return 'accounting_export';
  if (/import_map/.test(normalized)) return 'import_mapping_reference';
  if (/facebook|leads|doctors|orthopedists|businesses/.test(normalized) || signals.has('campaign_source')) return 'external_lead_list';
  if (/cohort|review|results|proposal/.test(normalized)) return 'research_or_campaign_working_file';
  if (signals.has('email') || signals.has('phone') || signals.has('name')) return 'contact_list_candidate';
  return 'unknown_spreadsheet';
}

function recommendLane(classification, headerSignals = []) {
  if (classification === 'one_time_rabbi_scheller_followers') return 'one_time_crm_import_candidate';
  if (classification === 'email_audience_export') return 'email_audience_reconciliation';
  if (classification === 'legacy_crm_or_pipeline_export') return 'first_party_crm_migration_candidate_no_ghl_runtime';
  if (classification === 'communications_export') return 'communications_history_reference';
  if (classification === 'accounting_export') return 'accounting_reference_not_crm_import';
  if (classification === 'import_mapping_reference') return 'mapping_reference_only';
  if (classification === 'external_lead_list') return 'possible_lead_import_needs_operator_approval';
  if (headerSignals.includes('student_or_parent')) return 'bna_private_contact_review';
  return 'needs_operator_review';
}

async function inspectFile(filePath) {
  const stat = await fs.promises.stat(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const fileHash = await sha256File(filePath);
  let details = {};
  if (extension === '.csv' || extension === '.tsv') {
    details = await inspectDelimited(filePath, extension);
  } else if (extension === '.xlsx') {
    details = await inspectXlsx(filePath);
  }
  const headerSignals = detectHeaderSignals(details.headers || []);
  const classification = classifyFile(path.basename(filePath), headerSignals);
  return {
    id: `DL-SHEET-${sha256(Buffer.from(filePath)).slice(0, 10)}`,
    file_name: redactFileName(path.basename(filePath)),
    relative_path: redactRelativePath(filePath),
    source_name_hash: sha256(Buffer.from(relativeDownloadPath(filePath))).slice(0, 16),
    extension,
    size_bytes: stat.size,
    modified_at: stat.mtime.toISOString(),
    sha256: fileHash,
    row_count_estimate: details.row_count_estimate ?? null,
    column_count: details.column_count ?? null,
    sheet_count: details.sheet_count ?? null,
    sheet_name_signals: details.sheet_names_redacted || [],
    header_fingerprint: details.headers?.length ? sha256(Buffer.from(details.headers.map((h) => h.toLowerCase()).join('|'))) : null,
    header_signals: headerSignals,
    classification,
    recommended_lane: recommendLane(classification, headerSignals),
    import_candidate: [
      'one_time_rabbi_scheller_followers',
      'email_audience_export',
      'legacy_crm_or_pipeline_export',
      'contact_list_candidate',
    ].includes(classification),
    privacy_classification: headerSignals.length ? 'private_or_contact_export_metadata_only' : 'unknown_metadata_only',
    blockers: [
      'Do not commit raw spreadsheet rows or private exports.',
      'Operator must select canonical source and approve dedupe/import mapping before production import.',
      classification === 'legacy_crm_or_pipeline_export' ? 'Historical GHL/CRM export may be migrated only into first-party BNA Operations; do not add GHL runtime.' : '',
    ].filter(Boolean),
  };
}

function summarize(items) {
  const counts = {};
  for (const item of items) counts[item.classification] = (counts[item.classification] || 0) + 1;
  const duplicateHashes = Object.entries(items.reduce((acc, item) => {
    acc[item.sha256] = acc[item.sha256] || [];
    acc[item.sha256].push(item.id);
    return acc;
  }, {})).filter(([, ids]) => ids.length > 1);
  return {
    total_files: items.length,
    import_candidates: items.filter((item) => item.import_candidate).length,
    classification_counts: counts,
    duplicate_hash_groups: duplicateHashes.map(([hash, ids]) => ({ sha256: hash, ids })),
  };
}

function writeMarkdown(report) {
  const rows = report.items.map((item) => [
    `| ${item.id} | ${item.file_name.replace(/\|/g, '\\|')} | ${item.extension} | ${item.modified_at.slice(0, 10)} | ${item.size_bytes} | ${item.classification} | ${item.recommended_lane} | ${item.header_signals.join(', ') || 'none'} | ${item.sha256.slice(0, 12)} | ${item.import_candidate ? 'yes' : 'no'} |`,
  ].join('\n'));
  const lines = [
    '# Downloads Spreadsheet Inventory',
    '',
    `Generated at: ${report.generated_at}`,
    `Source directory: Downloads (absolute path intentionally omitted)`,
    `Files inventoried: ${report.summary.total_files}`,
    `Import candidates: ${report.summary.import_candidates}`,
    '',
    '## Guardrails',
    '',
    '- This inventory stores filenames, file hashes, sizes, dates, row/column counts, sheet/header signals, and classifications only.',
    '- It does not store spreadsheet rows, email addresses, phone numbers, names, raw headers, formulas, or private export content.',
    '- Historical GHL/GoHighLevel/LeadConnector-named exports are inventory-only migration candidates for first-party BNA Operations; no GHL runtime, client, API key, env var, schema, or connector was added.',
    '',
    '## Classification Counts',
    '',
    ...Object.entries(report.summary.classification_counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => `- ${name}: ${count}`),
    '',
    '## Inventory',
    '',
    '| ID | File | Ext | Modified | Bytes | Classification | Recommended lane | Header signals | SHA-256 prefix | Import candidate |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '## Next Actions',
    '',
    '- Treat `one_time_rabbi_scheller_followers` as the highest-priority One Time CRM import candidate.',
    '- Reconcile email audience exports before any campaign send; keep unsubscribed/cleaned/subscribed source boundaries explicit.',
    '- Use historical CRM/opportunity exports only for first-party BNA Operations migration and deduplication planning; do not revive GHL runtime.',
    '- Before Batch 9D import work, create an import mapping and dedupe plan that uses hashes/IDs from this inventory, not raw row dumps.',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory does not exist: ${sourceDir}`);
  const files = (await walk(sourceDir))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    .slice(0, maxFiles);
  const items = [];
  for (const file of files) {
    items.push(await inspectFile(file));
  }
  const report = {
    generated_at: new Date().toISOString(),
    source_directory_label: 'Downloads',
    source_directory_absolute_path_omitted: true,
    privacy: 'metadata_and_redacted_schema_signals_only',
    items,
    summary: summarize(items),
  };
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(outputMd, writeMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    files: items.length,
    import_candidates: report.summary.import_candidates,
    output_json: path.relative(repoRoot, outputJson).replace(/\\/g, '/'),
    output_md: path.relative(repoRoot, outputMd).replace(/\\/g, '/'),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
