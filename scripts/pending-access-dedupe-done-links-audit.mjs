#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const confirmed = process.argv.includes('--confirm') && process.argv.includes('APPLY_PENDING_ACCESS_DEDUPE');

function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    const envPath = path.join(repoRoot, file);
    if (!fs.existsSync(envPath)) continue;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

function nowIso() {
  return new Date().toISOString();
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizeText(value) {
  let text = String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  text = text.replace(/^(?:get|need|needs|collect|request|ask for|confirm|please)\s+/, '').trim();
  if (/website.*landing page.*assets|landing page.*website.*assets|site assets|homepage assets/.test(text)) {
    return 'website landing page assets';
  }
  return text;
}

function normalizeOwner(value) {
  const normalized = normalizeText(value);
  if (!normalized || normalized === 'none' || normalized === 'unassigned') return 'unassigned';
  if (/^(codex|kimi|system|agent|automation|ai)$/.test(normalized)) return 'codex';
  if (/^(rabbi|rabbi elie|elie scheller|rabbi sheller|rabbi scheller)$/.test(normalized)) return 'rabbi elie scheller';
  if (/^(shloimie|shlomo|operator|me|myself)$/.test(normalized)) return 'shloimie';
  return normalized;
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function sourceRef(row = {}) {
  const context = parseJson(row.source_context);
  const parsed = parseJson(row.ai_parsed);
  const value = context.source_ref
    || context.seed_key
    || context.content_job_id
    || context.drive_file_id
    || parsed.seed_key
    || (parsed.rabbi_launch_seed && parsed.seed_key ? `${parsed.rabbi_launch_seed}:${parsed.seed_key}` : '')
    || '';
  return normalizeText(value);
}

function taskDedupe(row = {}) {
  const kind = normalizeText(row.task_kind || 'task') === 'pending access' ? 'pending_access' : normalizeText(row.task_kind || 'task');
  const title = normalizeText(row.display_title || row.title);
  if (!title) return { raw: '', key: '' };
  const raw = [
    kind || 'task',
    title,
    normalizeText(row.project_key || row.project_name || 'bna'),
    normalizeOwner(row.assigned_to),
    normalizeOwner(row.waiting_on),
    sourceRef(row),
  ].join('|');
  return { raw, key: sha256(raw).slice(0, 48) };
}

function isPendingAccessCandidate(row = {}) {
  const text = `${row.title || ''} ${row.display_title || ''} ${row.notes || ''} ${row.summary || ''}`.toLowerCase();
  return row.task_kind === 'pending_access'
    || (row.waiting_on && !/(codex|kimi|agent|system|automation)/i.test(row.waiting_on))
    || /(access|missing input|assets|landing[- ]?page assets|landing page assets|source sheet|sefaria|vimeo|zoom|resend|domain|dns)/i.test(text);
}

function knownWebsiteAssetMatch(row = {}) {
  const text = normalizeText(`${row.title || ''} ${row.display_title || ''} ${row.notes || ''} ${row.summary || ''}`);
  return /website landing page assets|website assets|site assets|current website|homepage assets/.test(text);
}

function canonicalForGroup(rows) {
  return [...rows].sort((a, b) => {
    const commentDelta = Number(b.comment_count || 0) - Number(a.comment_count || 0);
    if (commentDelta) return commentDelta;
    const updatedDelta = Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0);
    if (updatedDelta) return updatedDelta;
    return Number(a.id) - Number(b.id);
  })[0];
}

function reportPath() {
  const stamp = nowIso().replace(/[:.]/g, '-');
  const base = path.join(repoRoot, 'ops', 'system-audits', `${stamp}-pending-access-dedupe-done-links`);
  fs.mkdirSync(path.dirname(base), { recursive: true });
  return { md: `${base}.md`, json: `${base}.json` };
}

async function main() {
  if (apply && !confirmed) {
    throw new Error('Apply mode requires --confirm APPLY_PENDING_ACCESS_DEDUPE');
  }
  loadLocalEnv();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.PGURL || undefined });
  const client = await pool.connect();
  const summary = {
    generated_at: nowIso(),
    mode: apply ? 'apply' : 'dry_run',
    pending_candidates: 0,
    duplicate_groups: [],
    website_asset_matches: [],
    done_audit: { total: 0, with_links: 0, missing: 0, broken: 0, unchecked: 0, backfillable: 0 },
    applied: { archived_duplicate_ids: [], canonical_ids: [], proof_updates: 0 },
  };

  try {
    const taskRows = (await client.query(
      `SELECT t.*, p.project_key, p.name AS project_name, p.short_name AS project_short_name,
              COALESCE(cc.comment_count, 0)::int AS comment_count
       FROM bna_tasks t
       LEFT JOIN bna_projects p ON p.id = t.project_id
       LEFT JOIN (
         SELECT task_id, COUNT(*) AS comment_count
         FROM bna_task_comments
         GROUP BY task_id
       ) cc ON cc.task_id = t.id
       WHERE COALESCE(t.stage, '') NOT IN ('archive', 'done')
       ORDER BY t.created_at ASC`
    )).rows;

    const pendingRows = taskRows.filter(isPendingAccessCandidate).map((row) => ({ ...row, dedupe: taskDedupe(row) }));
    summary.pending_candidates = pendingRows.length;
    summary.website_asset_matches = pendingRows.filter(knownWebsiteAssetMatch).map((row) => ({
      id: row.id,
      title: row.title,
      project_key: row.project_key,
      waiting_on: row.waiting_on,
      assigned_to: row.assigned_to,
      dedupe_key: row.dedupe.key,
      dedupe_key_raw: row.dedupe.raw,
    }));

    if (apply) await client.query('BEGIN');

    for (const row of pendingRows) {
      if (apply && row.dedupe.key) {
        await client.query(
          `UPDATE bna_tasks
           SET task_kind = CASE WHEN COALESCE(task_kind, '') = '' THEN 'pending_access' ELSE task_kind END,
               workflow_status = COALESCE(workflow_status, status_detail, 'pending_access'),
               status_detail = COALESCE(status_detail, workflow_status, 'pending_access'),
               dedupe_key = COALESCE(dedupe_key, $2),
               dedupe_key_raw = COALESCE(dedupe_key_raw, $3),
               updated_at = NOW()
           WHERE id = $1`,
          [row.id, row.dedupe.key, row.dedupe.raw]
        );
      }
    }

    const groups = new Map();
    pendingRows.forEach((row) => {
      if (!row.dedupe.key) return;
      if (!groups.has(row.dedupe.key)) groups.set(row.dedupe.key, []);
      groups.get(row.dedupe.key).push(row);
    });

    for (const [key, rows] of groups) {
      if (rows.length < 2) continue;
      const canonical = canonicalForGroup(rows);
      const duplicates = rows.filter((row) => Number(row.id) !== Number(canonical.id));
      const group = {
        dedupe_key: key,
        dedupe_key_raw: canonical.dedupe.raw,
        canonical_id: canonical.id,
        duplicate_ids: duplicates.map((row) => row.id),
        titles: rows.map((row) => `#${row.id} ${row.title}`),
      };
      summary.duplicate_groups.push(group);
      if (apply) {
        summary.applied.canonical_ids.push(canonical.id);
        for (const duplicate of duplicates) {
          const reason = `Duplicate of task #${canonical.id} collapsed during WS03 pending/access dedupe cleanup.`;
          await client.query(
            `UPDATE bna_tasks
             SET stage = 'archive',
                 workflow_status = 'duplicate_archived',
                 status_detail = 'duplicate_archived',
                 canonical_task_id = $2,
                 duplicate_of_task_id = $2,
                 duplicate_archived_at = NOW(),
                 duplicate_reason = $3,
                 archived_at = COALESCE(archived_at, NOW()),
                 updated_at = NOW()
             WHERE id = $1`,
            [duplicate.id, canonical.id, reason]
          );
          await client.query(
            `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
             VALUES ($1, 'system', $2, 'internal', 'system', $3::jsonb)`,
            [duplicate.id, `${reason} Canonical task: #${canonical.id}.`, JSON.stringify({ action: 'ws03_archive_duplicate', canonical_task_id: canonical.id })]
          );
          await client.query(
            `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
             VALUES ($1, 'system', $2, 'internal', 'system', $3::jsonb)`,
            [canonical.id, `Duplicate task #${duplicate.id} was archived and linked here.`, JSON.stringify({ action: 'ws03_duplicate_linked', duplicate_task_id: duplicate.id })]
          );
          summary.applied.archived_duplicate_ids.push(duplicate.id);
        }
      }
    }

    const doneRows = (await client.query(
      `SELECT *
       FROM bna_tasks
       WHERE COALESCE(stage, '') = 'done' OR completed_at IS NOT NULL OR verified_at IS NOT NULL
       ORDER BY completed_at DESC NULLS LAST, updated_at DESC NULLS LAST`
    )).rows;
    summary.done_audit.total = doneRows.length;
    for (const row of doneRows) {
      const artifactLinks = Array.isArray(row.artifact_links) ? row.artifact_links : parseJson(row.artifact_links, []);
      const proofLinks = Array.isArray(row.proof_links_json) ? row.proof_links_json : parseJson(row.proof_links_json, []);
      const textLinks = [];
      const text = String(row.verification_notes || '');
      for (const match of text.matchAll(/\b((?:ops\/agent-fleet-runs|ops\/system-audits|ops\/playwright-smokes|ops\/local-smokes|screenshots|renders|content-memory|public\/documents)\/[^\s)\]}>"']+\.(?:md|json|txt|png|jpe?g|webp|pdf))\b/gi)) {
        const repoPath = match[1].replace(/\\/g, '/');
        textLinks.push({ label: 'Report', kind: 'report', repo_path: repoPath, status: fs.existsSync(path.join(repoRoot, repoPath)) ? 'valid' : 'broken' });
      }
      const links = [...artifactLinks, ...proofLinks, ...textLinks];
      if (links.length) summary.done_audit.with_links += 1;
      if (textLinks.length) summary.done_audit.backfillable += 1;
      const hasBroken = links.some((link) => link.status === 'broken');
      const status = links.length ? (hasBroken ? 'broken' : 'valid') : 'missing';
      summary.done_audit[status] += 1;
      if (apply) {
        const doneLinkStatus = status === 'valid' ? 'done_with_report' : status === 'broken' ? 'done_broken_report_link' : 'done_missing_link';
        await client.query(
          `UPDATE bna_tasks
           SET artifact_links = CASE WHEN jsonb_array_length(COALESCE(artifact_links, '[]'::jsonb)) = 0 THEN $2::jsonb ELSE artifact_links END,
               proof_links_json = CASE WHEN jsonb_array_length(COALESCE(proof_links_json, '[]'::jsonb)) = 0 THEN $2::jsonb ELSE proof_links_json END,
               workflow_status = $3,
               status_detail = $3,
               done_link_status = $3,
               proof_status = $4,
               done_link_checked_at = NOW(),
               proof_checked_at = NOW(),
               updated_at = NOW()
           WHERE id = $1`,
          [row.id, JSON.stringify(links), doneLinkStatus, status]
        );
        summary.applied.proof_updates += 1;
      }
    }

    if (apply) await client.query('COMMIT');
  } catch (error) {
    if (apply) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  const paths = reportPath();
  const md = [
    '# WS03 Pending/access Dedupe and Done Links Audit',
    '',
    `Generated: ${summary.generated_at}`,
    `Mode: ${summary.mode}`,
    '',
    `Pending/access candidates: ${summary.pending_candidates}`,
    `Duplicate groups: ${summary.duplicate_groups.length}`,
    '',
    '## Website Asset Matches',
    summary.website_asset_matches.length
      ? summary.website_asset_matches.map((row) => `- #${row.id} ${row.title} (${row.project_key || 'no project'}) key ${row.dedupe_key}`).join('\n')
      : '- None found.',
    '',
    '## Duplicate Groups',
    summary.duplicate_groups.length
      ? summary.duplicate_groups.map((group) => [
          `- Canonical #${group.canonical_id}`,
          `  Duplicates: ${group.duplicate_ids.map((id) => `#${id}`).join(', ') || 'none'}`,
          `  Key: ${group.dedupe_key_raw}`,
        ].join('\n')).join('\n')
      : '- None found.',
    '',
    '## Done Proof Audit',
    `- Total done/history: ${summary.done_audit.total}`,
    `- With links: ${summary.done_audit.with_links}`,
    `- Backfillable from notes: ${summary.done_audit.backfillable}`,
    `- Missing: ${summary.done_audit.missing}`,
    `- Broken: ${summary.done_audit.broken}`,
    '',
    '## Applied',
    `- Archived duplicate IDs: ${summary.applied.archived_duplicate_ids.map((id) => `#${id}`).join(', ') || 'none'}`,
    `- Canonical IDs: ${summary.applied.canonical_ids.map((id) => `#${id}`).join(', ') || 'none'}`,
    `- Proof updates: ${summary.applied.proof_updates}`,
    '',
  ].join('\n');
  fs.writeFileSync(paths.md, md);
  fs.writeFileSync(paths.json, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ...summary, report: { md: path.relative(repoRoot, paths.md), json: path.relative(repoRoot, paths.json) } }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
