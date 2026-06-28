'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_DIGEST_DIR = path.join('content-memory', 'transcript-digests');
const DEFAULT_AUDIT_DIR = path.join(
  'ops',
  'class-drive-intake',
  '2026-06-26-two-week-class-intake-audit'
);

const CONTENT_TOPIC_LABELS = Object.freeze({
  all: 'All topics',
  class_session: 'Class Sessions',
  class_notes: 'Class Notes',
  student_question: 'Student Questions',
  student_answer_or_discussion: 'Student Discussion',
  student_progress: 'Student Progress',
  student_score: 'Student Scores',
  accountability_event: 'Accountability',
  profile_note: 'Profile Notes',
  parent_update_candidate: 'Parent Updates',
  task: 'Tasks',
  decision: 'Decisions',
  open_question: 'Open Questions',
  content_idea: 'Content Ideas',
  article_angle: 'Article Angles',
  marketing_clip: 'Marketing Clips',
  source_sheet_candidate: 'Source Sheets',
  private_meeting: 'Private Review',
  private_student_detail: 'Private Student Detail',
  operations_note: 'Operations',
  billing_admin: 'Billing / Admin',
  support_ticket: 'Support Tickets',
  integration_issue: 'Integration Issues',
  drive_workflow_issue: 'Drive Workflow',
  parser_error: 'Parser Errors',
  unknown_needs_review: 'Needs Review',
  content_marketing: 'Content / Marketing',
  operations: 'Operations',
  one_time: 'One Time',
  torah: 'Torah',
  psychology: 'Psychology',
  health: 'Health',
  education: 'Education',
  parenting: 'Parenting',
  uncategorized: 'Uncategorized',
});

const TOPIC_ALIASES = Object.freeze({
  'billing/admin': 'billing_admin',
  billing_admin: 'billing_admin',
  billing: 'billing_admin',
  admin: 'billing_admin',
  operations: 'operations_note',
  ops: 'operations_note',
  support: 'support_ticket',
  integration: 'integration_issue',
  drive: 'drive_workflow_issue',
  drive_workflow: 'drive_workflow_issue',
  parser: 'parser_error',
  parse_error: 'parser_error',
  needs_parser: 'parser_error',
  question: 'student_question',
  questions: 'student_question',
  task_candidate: 'task',
  tasks: 'task',
  profile: 'profile_note',
  private_review: 'private_meeting',
  unknown: 'uncategorized',
  other: 'uncategorized',
  class_sessions: 'class_session',
  class_note: 'class_notes',
  profile_notes: 'profile_note',
  parser_errors: 'parser_error',
  student_questions: 'student_question',
  open_questions: 'open_question',
  content_ideas: 'content_idea',
  article_angles: 'article_angle',
  marketing_clips: 'marketing_clip',
  source_sheets: 'source_sheet_candidate',
  drive_workflows: 'drive_workflow_issue',
});

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined && String(item).trim());
  if (value === null || value === undefined || value === '') return [];
  return [value];
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

function normalizeContentTopicKey(value) {
  const raw = compactWhitespace(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!raw) return '';
  return TOPIC_ALIASES[raw] || raw;
}

function contentTopicLabel(key) {
  const normalized = normalizeContentTopicKey(key);
  if (CONTENT_TOPIC_LABELS[normalized]) return CONTENT_TOPIC_LABELS[normalized];
  return normalized
    ? normalized.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : CONTENT_TOPIC_LABELS.uncategorized;
}

function normalizeDigestCategories(...values) {
  const seen = new Set();
  const categories = [];
  for (const value of values.flatMap(toArray)) {
    const raw = typeof value === 'object'
      ? (value.lane || value.category || value.key || value.id || value.name || value.label)
      : value;
    const key = normalizeContentTopicKey(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    categories.push({ key, label: contentTopicLabel(key) });
  }
  return categories;
}

function isPoorContentTitle(value = '') {
  const text = compactWhitespace(value);
  const lower = text.toLowerCase();
  if (!text) return true;
  if (text.length < 4) return true;
  if (/[�]{1,}|(?:Ã|Â|×|×�){1,}/.test(text)) return true;
  if (/\.(m4a|mp3|mp4|mov|wav|webm)$/i.test(text)) return true;
  if (/^(whatsapp audio|voice|audio|video|recording|screen recording)(?:\b|[_\-\d])/i.test(text)) return true;
  if (/^class recording(?:\s+\d{4}-\d{2}-\d{2})?\s+-?\s+job\s+\d+/i.test(text)) return true;
  if (/^(untitled|unknown|no title|test|new recording)$/i.test(text)) return true;
  if (lower.replace(/[^a-z0-9]/g, '').length < 4) return true;
  return false;
}

function isGenericDigestSummary(value = '') {
  const text = compactWhitespace(value);
  return !text || /^privacy-safe digest for class recording\b/i.test(text);
}

function dateFromDigestTitle(value = '') {
  const match = String(value || '').match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return match ? match[1] : '';
}

function jobIdFromDigest(digest = {}, job = {}) {
  return Number(digest.job_id || job.id || job.job_id || 0) || null;
}

function cleanDigestTitle(digest = {}, job = {}, categories = []) {
  const explicit = compactWhitespace(digest.clean_title || digest.display_title || digest.title);
  if (explicit && !isPoorContentTitle(explicit)) return explicit;

  const generated = compactWhitespace(digest.generated_title || job.generated_title);
  if (generated && !isPoorContentTitle(generated)) return generated;

  const jobTitle = compactWhitespace(job.title || '');
  if (jobTitle && !isPoorContentTitle(jobTitle)) return jobTitle;

  const jobId = jobIdFromDigest(digest, job);
  const date = dateFromDigestTitle(generated) || compactWhitespace(job.class_date || '').slice(0, 10);
  const primary = categories
    .filter((category) => !['drive_workflow_issue', 'parser_error', 'unknown_needs_review', 'private_student_detail'].includes(category.key))
    .slice(0, 2)
    .map((category) => category.label);
  const label = primary.length ? primary.join(' + ') : 'Needs title';
  const pieces = [label];
  if (date) pieces.push(date);
  if (jobId) pieces.push(`#${jobId}`);
  return pieces.join(' - ');
}

function digestSummary(digest = {}, categories = []) {
  const summary = compactWhitespace(digest.summary || digest.short_summary);
  if (summary && !isGenericDigestSummary(summary)) return summary;
  if (categories.length) {
    return `Privacy-safe digest with ${categories.map((category) => category.label).join(', ')} routing. Raw transcript body remains private.`;
  }
  return 'Digest metadata is not ready yet. Raw transcript body remains private.';
}

function buildMainPoints(digest = {}, categories = []) {
  const points = [];
  const transcriptChars = Number(digest.transcript_chars || 0);
  if (transcriptChars > 0) points.push(`${transcriptChars.toLocaleString('en-US')} transcript chars indexed privately`);
  if (digest.parser_used) points.push(`Parser: ${digest.parser_used}`);
  if (digest.class_session_linkage) points.push(`Class/session: ${String(digest.class_session_linkage).toLowerCase().replace(/_/g, ' ')}`);
  if (Number(digest.questions_extracted_count || 0) > 0) points.push(`${Number(digest.questions_extracted_count)} student question candidate${Number(digest.questions_extracted_count) === 1 ? '' : 's'}`);
  if (Number(digest.tasks_extracted || 0) > 0) points.push(`${Number(digest.tasks_extracted)} task candidate${Number(digest.tasks_extracted) === 1 ? '' : 's'}`);
  if (digest.private_review_flag || digest.private_meeting_flag || categories.some((category) => category.key.startsWith('private_'))) {
    points.push('Private review required before student/parent-facing use');
  }
  if (digest.content_marketing_flag) points.push('Content/marketing candidate after review');
  return points.slice(0, 6);
}

function status(key, label, detail = '') {
  return { key, label, detail };
}

function parseStatus(digest = {}, job = {}, categories = []) {
  const hasParserError = categories.some((category) => category.key === 'parser_error');
  if (hasParserError) return status('needs_parse', 'Needs parse', 'Parser error category is present.');
  if (digest.parser_used || digest.parse_run_id || job.parse_json) return status('parsed', 'Parsed', digest.parser_used || 'Parser metadata available.');
  if (Number(digest.transcript_chars || 0) > 0 || String(job.transcript_text || '').trim()) return status('needs_parse', 'Needs parse', 'Transcript exists but parser metadata is missing.');
  return status('needs_transcript', 'Needs transcript', 'No transcript count or parser metadata is available.');
}

function digestStatus(digest = {}) {
  if (digest && (digest.generated_title || digest.job_ref || digest.raw_transcript_body_included === false)) {
    return status('digest_ready', 'Digest ready', 'Privacy-safe digest manifest is available.');
  }
  return status('needs_digest', 'Needs digest', 'No privacy-safe digest manifest is available.');
}

function routingStatus(categories = []) {
  const useful = categories.filter((category) => !['uncategorized', 'unknown_needs_review'].includes(category.key));
  if (useful.length) return status('routing_ready', 'Routing ready', `${useful.length} normalized categor${useful.length === 1 ? 'y' : 'ies'}.`);
  return status('needs_routing', 'Needs routing', 'No normalized routing category is available.');
}

function topicStatus(topicKeys = []) {
  if (topicKeys.length && !topicKeys.includes('uncategorized')) return status('classified', 'Classified', 'Topic filter uses digest/classification categories.');
  return status('needs_topic_classification', 'Needs topic classification', 'No digest/classification category is available.');
}

function titleStatus(displayTitle = '', digest = {}, job = {}) {
  const sourceTitle = compactWhitespace(digest.clean_title || digest.display_title || digest.generated_title || job.title);
  if (!displayTitle || /^needs title\b/i.test(displayTitle)) return status('needs_title', 'Needs title', 'No usable title is available.');
  if (isPoorContentTitle(sourceTitle)) return status('generated_title', 'Generated title', 'Display title was derived from digest categories/date.');
  return status('title_ready', 'Title ready', 'Clean source title available.');
}

function buildContentCardViewModel(job = {}, options = {}) {
  const digest = options.digest || job.digest_card || job.digest || {};
  const categories = normalizeDigestCategories(
    digest.categories,
    digest.category_list,
    digest.topic_keys,
    digest.topics,
    options.categories
  );
  const topicKeys = categories.length ? categories.map((category) => category.key) : ['uncategorized'];
  const displayTitle = cleanDigestTitle(digest, job, categories);
  const title = titleStatus(displayTitle, digest, job);
  const parse = parseStatus(digest, job, categories);
  const digestState = digestStatus(digest);
  const routing = routingStatus(categories);
  const topic = topicStatus(topicKeys);
  const stateBadges = [title, parse, digestState, routing, topic]
    .filter((item) => item.key.startsWith('needs_') || item.key === 'generated_title')
    .map((item) => item.label);
  const nextAction = compactWhitespace(digest.next_action)
    || (stateBadges.length ? `Resolve: ${stateBadges.join(', ')}.` : 'Review digest card and approve the next content action.');

  return {
    job_id: jobIdFromDigest(digest, job),
    display_title: displayTitle,
    title_status: title,
    summary: digestSummary(digest, categories),
    main_points: buildMainPoints(digest, categories),
    categories,
    category_labels: categories.map((category) => category.label),
    topic_keys: topicKeys,
    topic_labels: topicKeys.map(contentTopicLabel),
    parse_status: parse,
    digest_status: digestState,
    routing_status: routing,
    topic_status: topic,
    next_action: nextAction,
    state_badges: stateBadges,
    raw_transcript_body_included: false,
  };
}

function loadDigestRecording(repoRoot, digestRoot, recording) {
  const manifestPath = path.resolve(repoRoot, digestRoot, recording.path || '');
  const manifest = readJson(manifestPath, null);
  if (!manifest) return null;
  const folder = path.dirname(manifestPath);
  const categoriesFile = readJson(path.join(folder, 'CATEGORIES.json'), {});
  const digest = {
    ...manifest,
    categories: categoriesFile.categories || manifest.category_list || manifest.categories || [],
    sections: categoriesFile.sections || [],
  };
  return buildContentCardViewModel({ id: manifest.job_id }, { digest });
}

function loadTranscriptDigestCards(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const digestRoot = options.digestRoot || DEFAULT_DIGEST_DIR;
  const manifestPath = path.resolve(repoRoot, digestRoot, 'manifest.json');
  const manifest = readJson(manifestPath, { recordings: [] });
  const cards = new Map();
  for (const recording of toArray(manifest.recordings)) {
    const card = loadDigestRecording(repoRoot, digestRoot, recording);
    if (!card || !card.job_id) continue;
    cards.set(Number(card.job_id), card);
  }
  return { manifest, cards };
}

function buildContentCardTopicFilterAudit(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const digestRoot = options.digestRoot || DEFAULT_DIGEST_DIR;
  const { manifest, cards } = loadTranscriptDigestCards({ repoRoot, digestRoot });
  const rows = Array.from(cards.values()).sort((a, b) => Number(b.job_id) - Number(a.job_id)).map((card) => ({
    job_id: card.job_id,
    display_title: card.display_title,
    title_status: card.title_status.label,
    parse_status: card.parse_status.label,
    digest_status: card.digest_status.label,
    routing_status: card.routing_status.label,
    topic_status: card.topic_status.label,
    topic_keys: card.topic_keys,
    category_labels: card.category_labels,
    main_points_count: card.main_points.length,
    state_badges: card.state_badges,
    next_action: card.next_action,
    raw_transcript_body_included: false,
  }));
  const topicCounts = {};
  for (const row of rows) {
    for (const key of row.topic_keys) topicCounts[key] = (topicCounts[key] || 0) + 1;
  }
  const countWhere = (predicate) => rows.filter(predicate).length;
  return {
    generated_at: new Date().toISOString(),
    source_digest_root: digestRoot,
    recording_count: rows.length,
    manifest_recording_count: Number(manifest.recording_count || 0),
    raw_transcript_bodies_included: false,
    summary: {
      needs_title: countWhere((row) => row.title_status === 'Needs title'),
      generated_title: countWhere((row) => row.title_status === 'Generated title'),
      needs_parse: countWhere((row) => row.parse_status === 'Needs parse'),
      needs_digest: countWhere((row) => row.digest_status === 'Needs digest'),
      needs_routing: countWhere((row) => row.routing_status === 'Needs routing'),
      needs_topic_classification: countWhere((row) => row.topic_status === 'Needs topic classification'),
      multi_topic_cards: countWhere((row) => row.topic_keys.length > 1),
      uncategorized_cards: countWhere((row) => row.topic_keys.includes('uncategorized')),
    },
    topic_counts: topicCounts,
    filter_checks: {
      all_reset_count: rows.length,
      uses_normalized_digest_categories: true,
      counts_multi_topic_cards_in_each_topic: true,
      uncategorized_state_is_explicit: true,
      search_uses_digest_card_without_raw_transcript_body: true,
    },
    guardrails: {
      drive_writes_performed: false,
      production_db_mutation_performed: false,
      class_backfill_performed: false,
      raw_transcript_body_exported: false,
    },
    rows,
  };
}

function renderAuditMarkdown(audit) {
  const lines = [
    '# Content Card Topic Filter Audit',
    '',
    `Generated: ${audit.generated_at}`,
    `Recordings audited: ${audit.recording_count}`,
    `Manifest recordings: ${audit.manifest_recording_count}`,
    `Raw transcript bodies included: ${audit.raw_transcript_bodies_included}`,
    '',
    '## Summary',
    '',
    `- Generated clean titles: ${audit.summary.generated_title}`,
    `- Needs title: ${audit.summary.needs_title}`,
    `- Needs parse: ${audit.summary.needs_parse}`,
    `- Needs digest: ${audit.summary.needs_digest}`,
    `- Needs routing: ${audit.summary.needs_routing}`,
    `- Needs topic classification: ${audit.summary.needs_topic_classification}`,
    `- Multi-topic cards: ${audit.summary.multi_topic_cards}`,
    `- Uncategorized cards: ${audit.summary.uncategorized_cards}`,
    '',
    '## Topic Counts',
    '',
    '| Topic | Count |',
    '| --- | ---: |',
    ...Object.entries(audit.topic_counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => `| ${contentTopicLabel(key)} | ${count} |`),
    '',
    '## Recording Rows',
    '',
    '| Job | Clean Title | Parse | Digest | Routing | Topic | Categories | Next Action |',
    '| ---: | --- | --- | --- | --- | --- | --- | --- |',
    ...audit.rows.map((row) => [
      row.job_id,
      row.display_title,
      row.parse_status,
      row.digest_status,
      row.routing_status,
      row.topic_status,
      row.category_labels.join(', ') || 'Uncategorized',
      row.next_action,
    ].map((cell) => String(cell).replace(/\|/g, '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Guardrails',
    '',
    '- No Drive write.',
    '- No production database mutation.',
    '- No class backfill.',
    '- No raw transcript body export.',
  ];
  return lines.join('\n');
}

function writeContentCardTopicFilterAudit(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const outDir = path.resolve(repoRoot, options.outDir || DEFAULT_AUDIT_DIR);
  const audit = buildContentCardTopicFilterAudit({ repoRoot, digestRoot: options.digestRoot || DEFAULT_DIGEST_DIR });
  const jsonPath = path.join(outDir, 'CONTENT-CARD-TOPIC-FILTER-AUDIT.json');
  const mdPath = path.join(outDir, 'CONTENT-CARD-TOPIC-FILTER-AUDIT.md');
  writeJson(jsonPath, audit);
  writeText(mdPath, renderAuditMarkdown(audit));
  return { audit, jsonPath, mdPath };
}

module.exports = {
  CONTENT_TOPIC_LABELS,
  DEFAULT_AUDIT_DIR,
  DEFAULT_DIGEST_DIR,
  buildContentCardTopicFilterAudit,
  buildContentCardViewModel,
  contentTopicLabel,
  isPoorContentTitle,
  loadTranscriptDigestCards,
  normalizeContentTopicKey,
  normalizeDigestCategories,
  writeContentCardTopicFilterAudit,
};
