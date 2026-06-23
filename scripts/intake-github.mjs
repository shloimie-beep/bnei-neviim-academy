#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { buildCanonicalIntakePacket } = require('../src/platform/ingestion/intake-service');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const DEFAULT_REPO = 'shloimie-beep/bnei-neviim-academy';
const TRUSTED_AUTHORS = new Set(['sdratler', 'shloimie-beep']);

function nowIso() {
  return new Date().toISOString();
}

function slugStamp() {
  return nowIso().replace(/[:.]/g, '-');
}

function redactPublicText(value = '') {
  return String(value || '')
    .replace(/\b(sk|rk|gh[pousr]|xox[baprs]|whsec|re)_[A-Za-z0-9._-]{12,}\b/g, '[redacted-secret]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s"',}]+/gi, '$1=[redacted]');
}

export function parseGitHubReference(argv = []) {
  const args = {
    repo: DEFAULT_REPO,
    issue: '',
    comment: '',
    url: '',
    dryRun: false,
    json: false,
    noWrite: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo') args.repo = argv[++index] || args.repo;
    else if (arg === '--issue') args.issue = argv[++index] || '';
    else if (arg === '--comment') args.comment = argv[++index] || '';
    else if (arg === '--url') args.url = argv[++index] || '';
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
  }

  if (args.url) {
    const match = args.url.match(/github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)(?:#issuecomment-(\d+))?/i);
    if (match) {
      args.repo = match[1];
      args.issue = match[2];
      args.comment = args.comment || match[3] || '';
    }
  }
  return args;
}

function ghApi(pathname) {
  const result = spawnSync('gh', ['api', pathname], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 8
  });
  if (result.status !== 0 || result.error) {
    throw new Error(`gh api failed for ${pathname}: ${String(result.stderr || result.error?.message || '').trim()}`);
  }
  return JSON.parse(result.stdout || '{}');
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function safeExcerpt(value = '') {
  return redactPublicText(value).replace(/\s+/g, ' ').trim().slice(0, 360);
}

function issueUrl(repo, issueNumber, commentId = '') {
  const base = `https://github.com/${repo}/issues/${issueNumber}`;
  return commentId ? `${base}#issuecomment-${commentId}` : base;
}

export function buildGitHubIntakePreview({ repo = DEFAULT_REPO, issue, comments = [], commentId = '' } = {}) {
  if (!issue?.number) throw new Error('issue payload with number is required');
  const selectedComments = commentId
    ? comments.filter((comment) => String(comment.id) === String(commentId))
    : comments;
  const body = [
    `# ${issue.title || `Issue #${issue.number}`}`,
    '',
    issue.body || '',
    ...selectedComments.map((comment) => [
      '',
      `## Comment ${comment.id} by ${comment.user?.login || 'unknown'}`,
      '',
      comment.body || ''
    ].join('\n'))
  ].join('\n');
  const redactedBody = redactPublicText(body);
  const externalId = commentId
    ? `${repo}#${issue.number}:comment:${commentId}`
    : `${repo}#${issue.number}`;
  const fingerprint = sha256([externalId, redactedBody].join('\n--bna-github-intake--\n'));
  let packet = null;
  try {
    packet = buildCanonicalIntakePacket({
      raw_text: redactedBody,
      workspace_key: 'internal_super_admin',
      project_key: 'bna_operations',
      source_provider: 'github',
      source_kind: 'github_issue',
      source_type: 'github_issue',
      source_id: externalId,
      source_link: issueUrl(repo, issue.number, commentId),
      title: issue.title,
      actor: issue.user?.login || null,
      created_at: issue.created_at || nowIso(),
      raw_id: `RAW-GITHUB-${issue.number}`,
      metadata: {
        repo,
        issue_number: issue.number,
        comment_id: commentId || null,
        github_state: issue.state || null
      }
    });
  } catch (error) {
    packet = {
      source_record: {
        source_id: externalId,
        stable_key: null,
        idempotency_key: null,
        source_provider: 'github',
        source_channel: 'github',
        source_kind: 'github_issue'
      },
      parsed: { schema_valid: false, schema_errors: [error.message] },
      parent_prompt: null,
      persistence: null
    };
  }
  const source = packet.source_record;
  const parser = packet.parsed;
  return {
    generated_at: nowIso(),
    mode: 'dry_run',
    external_write_performed: false,
    secret_values_printed: false,
    repo,
    issue_number: issue.number,
    comment_id: commentId || null,
    url: issueUrl(repo, issue.number, commentId),
    trusted_source: TRUSTED_AUTHORS.has(issue.user?.login || ''),
    source_envelope: {
      source_provider: source.source_provider,
      source_channel: source.source_channel,
      source_kind: source.source_kind,
      source_id: source.source_id,
      stable_key: source.stable_key,
      idempotency_key: source.idempotency_key,
      fingerprint,
      body_length: redactedBody.length,
      excerpt: safeExcerpt(redactedBody),
      privacy_classification: 'redacted_repo_safe'
    },
    parent_prompt_id: packet.parent_prompt?.prompt_id || null,
    persistence_plan: packet.persistence
      ? {
          contract_version: packet.persistence.contract_version,
          external_write_performed: packet.persistence.external_write_performed,
          parse_item_count: packet.persistence.parse_items.length,
          raw_intake_stable_id: packet.persistence.raw_intake.stable_id,
          parse_run_status: packet.persistence.parse_run.status
        }
      : null,
    parser_counts: parser
      ? {
          decisions: parser.decisions?.length || 0,
          tasks: parser.tasks?.length || 0,
          content_items: parser.content_items?.length || 0,
          community_items: parser.community_items?.length || 0,
          integration_items: parser.integration_items?.length || 0,
          notes: parser.notes?.length || 0,
          unresolved: parser.unresolved?.length || 0,
          schema_valid: Boolean(parser.schema_valid),
          schema_errors: parser.schema_errors || []
        }
      : null,
    apply_blocker: 'Database persistence and GitHub acknowledgement are intentionally not performed by this dry-run command.'
  };
}

function renderMarkdown(report) {
  return [
    `# GitHub Intake Dry Run - Issue #${report.issue_number}`,
    '',
    `Generated: ${report.generated_at}`,
    `URL: ${report.url}`,
    `Trusted source: ${report.trusted_source}`,
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
    '## Source Envelope',
    '',
    `- source_id: ${report.source_envelope.source_id}`,
    `- stable_key: ${report.source_envelope.stable_key}`,
    `- idempotency_key: ${report.source_envelope.idempotency_key}`,
    `- privacy_classification: ${report.source_envelope.privacy_classification}`,
    `- body_length: ${report.source_envelope.body_length}`,
    `- excerpt: ${report.source_envelope.excerpt}`,
    '',
    '## Canonical Packet',
    '',
    `- parent_prompt_id: ${report.parent_prompt_id || 'none'}`,
    `- persistence_contract: ${report.persistence_plan?.contract_version || 'none'}`,
    `- persistence_external_write_performed: ${report.persistence_plan?.external_write_performed ?? false}`,
    `- persistence_parse_item_count: ${report.persistence_plan?.parse_item_count ?? 0}`,
    `- raw_intake_stable_id: ${report.persistence_plan?.raw_intake_stable_id || 'none'}`,
    `- parse_run_status: ${report.persistence_plan?.parse_run_status || 'none'}`,
    '',
    '## Parser Counts',
    '',
    ...Object.entries(report.parser_counts || {}).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join('; ') : value}`),
    '',
    `Apply blocker: ${report.apply_blocker}`,
    ''
  ].join('\n');
}

function writeReport(report) {
  const dir = path.join(repoRoot, 'ops', 'source-truth');
  fs.mkdirSync(dir, { recursive: true });
  const suffix = report.comment_id ? `issue-${report.issue_number}-comment-${report.comment_id}` : `issue-${report.issue_number}`;
  const base = `${slugStamp()}-github-${suffix}-dry-run`;
  const jsonPath = path.join(dir, `${base}.json`);
  const mdPath = path.join(dir, `${base}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return {
    json: path.relative(repoRoot, jsonPath).replaceAll(path.sep, '/'),
    md: path.relative(repoRoot, mdPath).replaceAll(path.sep, '/')
  };
}

async function main(argv = process.argv.slice(2)) {
  const args = parseGitHubReference(argv);
  if (!args.issue) throw new Error('Use --issue <number> or --url <github issue url>.');
  if (!args.dryRun) {
    throw new Error('Only --dry-run is currently supported; DB-backed apply remains gated.');
  }
  const issue = ghApi(`repos/${args.repo}/issues/${args.issue}`);
  const comments = ghApi(`repos/${args.repo}/issues/${args.issue}/comments`);
  const report = buildGitHubIntakePreview({ repo: args.repo, issue, comments, commentId: args.comment });
  const paths = args.noWrite ? null : writeReport(report);
  if (args.json) console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  else {
    console.log(renderMarkdown(report));
    if (paths) console.log(`Report written: ${paths.md}, ${paths.json}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
