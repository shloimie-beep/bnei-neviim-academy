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
    noWrite: false,
    postStatus: false,
    approvalPhrase: '',
    status: '',
    statusSummary: '',
    rawId: '',
    requirement: '',
    runId: '',
    branch: '',
    commit: '',
    pr: '',
    evidence: []
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
    else if (arg === '--post-status') args.postStatus = true;
    else if (arg === '--approval-phrase') args.approvalPhrase = argv[++index] || '';
    else if (arg === '--status') args.status = argv[++index] || '';
    else if (arg === '--status-summary') args.statusSummary = argv[++index] || '';
    else if (arg === '--raw-id') args.rawId = argv[++index] || '';
    else if (arg === '--requirement') args.requirement = argv[++index] || '';
    else if (arg === '--run-id') args.runId = argv[++index] || '';
    else if (arg === '--branch') args.branch = argv[++index] || '';
    else if (arg === '--commit') args.commit = argv[++index] || '';
    else if (arg === '--pr') args.pr = argv[++index] || '';
    else if (arg === '--evidence') args.evidence.push(argv[++index] || '');
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

function statusArgsPresent(args = {}) {
  return Boolean(args.status || args.statusSummary || args.rawId || args.requirement || args.runId || args.branch || args.commit || args.pr || args.evidence?.length || args.postStatus);
}

function buildStatusPayloadFromArgs(args = {}) {
  return {
    status: args.status || 'completed',
    summary: args.statusSummary || 'BNA agent status recorded.',
    raw_id: args.rawId || null,
    requirement_id: args.requirement || null,
    run_id: args.runId || null,
    branch: args.branch || null,
    commit: args.commit || null,
    pull_request: args.pr || null,
    evidence: (args.evidence || []).filter(Boolean)
  };
}

export function buildGitHubStatusPreview({ repo = DEFAULT_REPO, issue, commentId = '', comments = [], status = {} } = {}) {
  if (!issue?.number) throw new Error('issue payload with number is required');
  const statusPayload = {
    status: status.status || 'completed',
    summary: redactPublicText(status.summary || 'BNA agent status recorded.'),
    raw_id: status.raw_id || status.rawId || null,
    requirement_id: status.requirement_id || status.requirementId || null,
    run_id: status.run_id || status.runId || null,
    branch: status.branch || null,
    commit: status.commit || null,
    pull_request: status.pull_request || status.pullRequest || status.pr || null,
    evidence: (status.evidence || []).map((item) => redactPublicText(item)).filter(Boolean)
  };
  const idempotencyKey = `bna-github-status:${sha256([
    repo,
    issue.number,
    commentId || 'issue',
    statusPayload.raw_id || '',
    statusPayload.requirement_id || '',
    statusPayload.run_id || '',
    statusPayload.commit || '',
    statusPayload.status || ''
  ].join('\n')).slice(0, 32)}`;
  const marker = `<!-- ${idempotencyKey} -->`;
  const body = [
    marker,
    '## BNA agent status',
    '',
    `Status: ${statusPayload.status}`,
    `Summary: ${statusPayload.summary}`,
    '',
    'Canonical IDs:',
    `- raw: ${statusPayload.raw_id || 'n/a'}`,
    `- requirement: ${statusPayload.requirement_id || 'n/a'}`,
    `- run: ${statusPayload.run_id || 'n/a'}`,
    '',
    'Git state:',
    `- branch: ${statusPayload.branch || 'n/a'}`,
    `- commit: ${statusPayload.commit || 'n/a'}`,
    `- PR: ${statusPayload.pull_request || 'n/a'}`,
    '',
    'Evidence:',
    ...(statusPayload.evidence.length ? statusPayload.evidence.map((item) => `- ${item}`) : ['- n/a']),
    '',
    commentId ? `Source comment: ${issueUrl(repo, issue.number, commentId)}` : `Source issue: ${issueUrl(repo, issue.number)}`
  ].join('\n');
  const existing = (comments || []).find((comment) => String(comment.body || '').includes(marker)) || null;
  return {
    generated_at: nowIso(),
    idempotency_key: idempotencyKey,
    target_url: issueUrl(repo, issue.number, commentId),
    issue_number: issue.number,
    comment_id: commentId || null,
    body,
    existing_comment_id: existing?.id || null,
    existing_comment_url: existing?.html_url || null,
    would_create_comment: !existing,
    would_update_comment: Boolean(existing && String(existing.body || '') !== body),
    external_write_performed: false,
    approval_required: 'BNA_GITHUB_STATUS_POST_APPROVED=true and --approval-phrase POST_BNA_GITHUB_STATUS are required before posting.'
  };
}
export function buildGitHubIntakePreview({ repo = DEFAULT_REPO, issue, comments = [], commentId = '' } = {}) {
  if (!issue?.number) throw new Error('issue payload with number is required');
  const selectedComments = commentId
    ? comments.filter((comment) => String(comment.id) === String(commentId))
    : comments;
  const trustedActors = commentId && selectedComments.length
    ? selectedComments.map((comment) => comment.user?.login || '')
    : [issue.user?.login || ''];
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
    trusted_source: trustedActors.every((actor) => TRUSTED_AUTHORS.has(actor)),
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
    ...(report.github_status ? [
      '',
      '## GitHub Status Packet',
      '',
      `- idempotency_key: ${report.github_status.idempotency_key}`,
      `- target_url: ${report.github_status.target_url}`,
      `- existing_comment_id: ${report.github_status.existing_comment_id || 'none'}`,
      `- would_create_comment: ${report.github_status.would_create_comment}`,
      `- would_update_comment: ${report.github_status.would_update_comment}`,
      `- external_write_performed: ${report.github_status.external_write_performed}`,
    ] : []),
    ''
  ].join('\n');
}

function ghApiWrite(method, pathname, fields = {}) {
  const args = ['api', '-X', method, pathname];
  for (const [key, value] of Object.entries(fields)) {
    args.push('-f', `${key}=${value}`);
  }
  const result = spawnSync('gh', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 8
  });
  if (result.status !== 0 || result.error) {
    throw new Error(`gh api write failed for ${pathname}: ${String(result.stderr || result.error?.message || '').trim()}`);
  }
  return JSON.parse(result.stdout || '{}');
}

function postGitHubStatus({ repo = DEFAULT_REPO, issueNumber, preview, approvalPhrase = '' } = {}) {
  if (process.env.BNA_GITHUB_STATUS_POST_APPROVED !== 'true' || approvalPhrase !== 'POST_BNA_GITHUB_STATUS') {
    throw new Error('GitHub status posting requires BNA_GITHUB_STATUS_POST_APPROVED=true and --approval-phrase POST_BNA_GITHUB_STATUS.');
  }
  if (preview.existing_comment_id && !preview.would_update_comment) {
    return { ...preview, external_write_performed: false, posted: false, idempotent_replay: true };
  }
  const posted = preview.existing_comment_id
    ? ghApiWrite('PATCH', `repos/${repo}/issues/comments/${preview.existing_comment_id}`, { body: preview.body })
    : ghApiWrite('POST', `repos/${repo}/issues/${issueNumber}/comments`, { body: preview.body });
  return {
    ...preview,
    external_write_performed: true,
    posted: true,
    posted_comment_id: posted.id || preview.existing_comment_id || null,
    posted_comment_url: posted.html_url || preview.existing_comment_url || null
  };
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
  if (!args.dryRun && !args.postStatus) {
    throw new Error('Only --dry-run is currently supported; DB-backed apply remains gated.');
  }
  const issue = ghApi(`repos/${args.repo}/issues/${args.issue}`);
  const comments = ghApi(`repos/${args.repo}/issues/${args.issue}/comments`);
  const report = buildGitHubIntakePreview({ repo: args.repo, issue, comments, commentId: args.comment });
  if (statusArgsPresent(args)) {
    const statusPreview = buildGitHubStatusPreview({
      repo: args.repo,
      issue,
      comments,
      commentId: args.comment,
      status: buildStatusPayloadFromArgs(args)
    });
    report.github_status = args.postStatus
      ? postGitHubStatus({ repo: args.repo, issueNumber: issue.number, preview: statusPreview, approvalPhrase: args.approvalPhrase })
      : statusPreview;
  }
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
