#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  buildContentCardViewModel,
} = require('../src/lib/bna/content-card-view-model');

const DEFAULT_AUDIT_DIR = path.join('ops', 'class-drive-intake', '2026-06-26-two-week-class-intake-audit');
const DEFAULT_DIGEST_DIR = path.join('content-memory', 'transcript-digests');

function parseArgs(argv) {
  const options = {
    auditDir: DEFAULT_AUDIT_DIR,
    digestDir: DEFAULT_DIGEST_DIR,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out-dir' || arg === '--audit-dir') options.auditDir = argv[++index];
    else if (arg.startsWith('--out-dir=')) options.auditDir = arg.slice('--out-dir='.length);
    else if (arg.startsWith('--audit-dir=')) options.auditDir = arg.slice('--audit-dir='.length);
    else if (arg === '--digest-dir') options.digestDir = argv[++index];
    else if (arg.startsWith('--digest-dir=')) options.digestDir = arg.slice('--digest-dir='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${String(text || '').replace(/\s+$/, '')}\n`);
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows) {
    const key = String(row[field] || 'unknown');
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function countTopicKeys(cards) {
  const counts = {};
  for (const card of cards) {
    const keys = Array.isArray(card.topic_keys) && card.topic_keys.length ? card.topic_keys : [card.topic_key || 'other'];
    for (const key of keys) {
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}

function countCategories(cards) {
  const counts = {};
  for (const card of cards) {
    for (const category of card.categories || []) {
      counts[category] = (counts[category] || 0) + 1;
    }
  }
  return counts;
}

function operationsFilterCoverage(repoRoot) {
  const operationsPath = path.join(repoRoot, 'public', 'operations.html');
  const text = fs.existsSync(operationsPath) ? fs.readFileSync(operationsPath, 'utf8') : '';
  const required = [
    'contentTopicFilter',
    'contentSourceFilter',
    'CONTENT_TOPIC_FILTERS',
    'CONTENT_SOURCE_FILTERS',
    'setContentFilter',
    'contentTopicKey',
    'contentTopicKeys',
    'countByTopicKeys',
    'contentSourceKey',
    'Needs parse',
  ];
  return {
    file: 'public/operations.html',
    checks: required.map((pattern) => ({
      pattern,
      present: text.includes(pattern),
    })),
  };
}

function buildJobsFromDigest(repoRoot, digestDir) {
  const manifestPath = path.resolve(repoRoot, digestDir, 'manifest.json');
  const manifest = readJson(manifestPath, { recordings: [] });
  return (manifest.recordings || []).map((recording) => {
    const itemPath = path.resolve(repoRoot, digestDir, recording.path || '');
    const item = readJson(itemPath, {});
    return {
      id: recording.job_id,
      title: recording.generated_title,
      source_type: 'google_drive',
      status: item.parser_used ? 'parsed' : 'transcribed',
      transcript_chars: recording.transcript_chars,
      categories: recording.categories || item.category_list || [],
      parser_used: item.parser_used || '',
      outputs: [],
      drive_file_ref: item.drive_file_ref || null,
    };
  });
}

function renderAuditMarkdown(audit) {
  return [
    '# Content Card Topic Filter Audit',
    '',
    `Generated: ${audit.generated_at}`,
    '',
    '## Summary',
    '',
    `- Digest cards checked: ${audit.summary.card_count}`,
    `- Needs parse cards: ${audit.summary.needs_parse_count}`,
    `- Raw transcript body fields in card payload: ${audit.summary.raw_transcript_body_field_count}`,
    `- Operations filter checks passed: ${audit.summary.operations_filter_checks_passed}/${audit.summary.operations_filter_checks_total}`,
    '',
    '## Status Counts',
    '',
    '```json',
    JSON.stringify(audit.status_counts, null, 2),
    '```',
    '',
    '## Topic Counts',
    '',
    '```json',
    JSON.stringify(audit.topic_counts, null, 2),
    '```',
    '',
    '## Category Counts',
    '',
    '```json',
    JSON.stringify(audit.category_counts, null, 2),
    '```',
    '',
    '## Source Counts',
    '',
    '```json',
    JSON.stringify(audit.source_counts, null, 2),
    '```',
    '',
  ].join('\n');
}

function renderReadbackMarkdown(readback) {
  return [
    '# Content Card Readback',
    '',
    `Generated: ${readback.generated_at}`,
    '',
    'This is a repo/local readback of generated digest-card payloads. It is not a live production smoke.',
    '',
    `- Mode: ${readback.mode}`,
    `- Cards returned: ${readback.card_count}`,
    `- Expected cards: ${readback.expected_card_count}`,
    `- Body-free payload: ${readback.body_free_payload}`,
    `- Raw transcript fields found: ${readback.raw_transcript_field_count}`,
    `- Needs parse cards: ${readback.needs_parse_count}`,
    '',
  ].join('\n');
}

function main() {
  const repoRoot = process.cwd();
  const options = parseArgs(process.argv.slice(2));
  const auditDir = path.resolve(repoRoot, options.auditDir);
  const jobs = buildJobsFromDigest(repoRoot, options.digestDir);
  const cards = buildContentCardViewModel(jobs);
  const filterCoverage = operationsFilterCoverage(repoRoot);
  const failedFilters = filterCoverage.checks.filter((check) => !check.present);
  const rawTranscriptFieldCount = cards.filter((card) => Object.prototype.hasOwnProperty.call(card, 'transcript_text')).length;
  const needsParseCount = cards.filter((card) => card.status_key === 'needs_parse').length;
  const topicCounts = countTopicKeys(cards);
  const categoryCounts = countCategories(cards);
  const failedTopicChecks = [];
  if ((topicCounts.torah || 0) <= 1) failedTopicChecks.push('Torah topic count must be greater than 1 for digest class fixtures');
  if ((topicCounts.class_notes || 0) <= 1) failedTopicChecks.push('Class Notes topic count must be greater than 1 for digest class fixtures');
  if (!cards.some((card) => (card.topic_keys || []).includes('torah') && (card.topic_keys || []).includes('class_notes'))) {
    failedTopicChecks.push('At least one card must count as both Torah and Class Notes');
  }

  const audit = {
    generated_at: new Date().toISOString(),
    mode: 'repo_local_digest_card_topic_filter_audit',
    card_count: cards.length,
    cards,
    topic_counts: topicCounts,
    primary_topic_counts: countBy(cards, 'topic_key'),
    category_counts: categoryCounts,
    source_counts: countBy(cards, 'source_key'),
    status_counts: countBy(cards, 'status_key'),
    filter_coverage: filterCoverage,
    failed_topic_checks: failedTopicChecks,
    summary: {
      card_count: cards.length,
      needs_parse_count: needsParseCount,
      raw_transcript_body_field_count: rawTranscriptFieldCount,
      operations_filter_checks_total: filterCoverage.checks.length,
      operations_filter_checks_passed: filterCoverage.checks.length - failedFilters.length,
      content_filter_normalized: failedFilters.length === 0,
      body_free_payload: rawTranscriptFieldCount === 0 && cards.every((card) => card.raw_transcript_body_included === false),
      torah_topic_count: topicCounts.torah || 0,
      class_notes_topic_count: topicCounts.class_notes || 0,
      one_time_topic_count: topicCounts.one_time || 0,
      multi_topic_card_count: cards.filter((card) => (card.topic_keys || []).length > 1).length,
    },
  };

  const readback = {
    generated_at: audit.generated_at,
    mode: 'repo_local_digest_card_readback_not_live_smoke',
    card_count: cards.length,
    expected_card_count: 29,
    body_free_payload: audit.summary.body_free_payload,
    raw_transcript_field_count: rawTranscriptFieldCount,
    needs_parse_count: needsParseCount,
    clean_title_coverage: cards.filter((card) => card.title && !/^content job #/i.test(card.title)).length,
    normalized_status_counts: audit.status_counts,
    normalized_topic_counts: audit.topic_counts,
    normalized_primary_topic_counts: audit.primary_topic_counts,
    skipped_live_smoke_reason: 'No app-visible code changed in this batch and the packet only approved safe local/read-only/dry-run work.',
  };

  writeJson(path.join(auditDir, 'CONTENT-CARD-TOPIC-FILTER-AUDIT.json'), audit);
  writeText(path.join(auditDir, 'CONTENT-CARD-TOPIC-FILTER-AUDIT.md'), renderAuditMarkdown(audit));
  writeJson(path.join(auditDir, 'CONTENT-TOPIC-ROUTING-AUDIT.json'), audit);
  writeText(path.join(auditDir, 'CONTENT-TOPIC-ROUTING-AUDIT.md'), renderAuditMarkdown(audit));
  writeJson(path.join(auditDir, 'LIVE-CONTENT-CARD-READBACK.json'), readback);
  writeText(path.join(auditDir, 'LIVE-CONTENT-CARD-READBACK.md'), renderReadbackMarkdown(readback));
  writeJson(path.join(auditDir, 'LIVE-READBACK.json'), readback);
  writeText(path.join(auditDir, 'LIVE-READBACK.md'), renderReadbackMarkdown(readback));

  console.log([
    'Content card topic audit complete.',
    `Output: ${path.relative(repoRoot, auditDir)}`,
    `Cards: ${cards.length}`,
    `Needs parse: ${needsParseCount}`,
    `Raw transcript fields: ${rawTranscriptFieldCount}`,
    `Filter checks: ${audit.summary.operations_filter_checks_passed}/${audit.summary.operations_filter_checks_total}`,
    `Torah topics: ${audit.summary.torah_topic_count}`,
    `Class Notes topics: ${audit.summary.class_notes_topic_count}`,
  ].join('\n'));
  if (failedFilters.length || rawTranscriptFieldCount || failedTopicChecks.length) process.exitCode = 1;
}

main();
