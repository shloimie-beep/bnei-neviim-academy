import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function parseEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[line.slice(0, separator).trim()] = value;
  }
  return env;
}

function usableSecretValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.includes('[YOUR-PASSWORD]')) return '';
  return normalized;
}

function readLocalSecretFile(name) {
  try {
    return fs.readFileSync(path.join(repoRoot, '.secrets', name), 'utf8').trim();
  } catch {
    return '';
  }
}

function safeJsonParse(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function asList(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined && String(item).trim());
  if (!value) return [];
  if (typeof value === 'string') return value.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean);
  return [value];
}

function classNotes(parsed = {}) {
  return [
    ...asList(parsed.class_notes),
    ...asList(parsed.mixed_recording_parse?.class_notes),
  ].filter((item) => item && typeof item === 'object');
}

function textFromValue(value) {
  if (!value) return '';
  if (typeof value === 'object') {
    return [
      value.title,
      value.summary,
      value.reference,
      value.source,
      value.text,
      value.notes,
      value.body,
    ].filter(Boolean).join(' ');
  }
  return String(value);
}

function collectJobText(job) {
  const parsed = safeJsonParse(job.parse_json);
  const notes = classNotes(parsed);
  const parseText = [
    parsed.summary,
    ...asList(parsed.topics),
    ...asList(parsed.discussions),
    ...asList(parsed.questions_or_discussions),
    ...asList(parsed.sources),
    ...asList(parsed.highlights),
    ...notes.flatMap((note) => [
      note.title,
      note.summary,
      ...asList(note.topics),
      ...asList(note.discussions),
      ...asList(note.sources),
      ...asList(note.highlights),
      ...asList(note.student_questions),
    ]),
  ].map(textFromValue).join(' ');
  const outputText = asList(job.outputs)
    .map((output) => [output.title, output.body].filter(Boolean).join(' '))
    .join(' ');
  return [
    job.title,
    job.caption,
    job.notes,
    parseText,
    outputText,
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function countMatches(text, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

const nonContentPatterns = [
  /\bgoals?\b/i,
  /\baccountability\b/i,
  /\bprivate meeting|check-?in|follow-?up|attendance|engagement\b/i,
  /\bprogress|percent|percentage|daily completion|group goal|points?|camping trip\b/i,
  /\bfitness|exercise|workout|diet|job goal|work goal\b/i,
  /\bcodex|kimi|dashboard|telegram|bot|bridge|railway|ghl|webhook|parser|routing|task|tasks\b/i,
];

const classContentPatterns = [
  /\bclass|shiur|lesson|teaching philosophy|topics? covered|what we learned\b/i,
  /\btorah|chumash|tanach|mishna|mishnah|gemara|parsha|pasuk|verse|sources?\b/i,
  /\bdeuteronomy|lashon hara|gaava|humility|free choice|moshe|miriam|har sinai\b/i,
];

function classifyJob(job, explicitIds) {
  const parsed = safeJsonParse(job.parse_json);
  const text = collectJobText(job);
  const nonContentScore = countMatches(text, nonContentPatterns);
  const classScore = countMatches(text, classContentPatterns);
  const parserOnly = parsed.intake_lane === 'tasks_students' || Boolean(parsed.routing?.parser_only);
  const mixedCounts = parsed.mixed_recording_parse?.counts || {};
  const extractedStudentWork = Number(mixedCounts.accountability_events || 0) +
    Number(mixedCounts.group_goal_entries || 0) +
    Number(mixedCounts.daily_torah_updates || 0) +
    Number(mixedCounts.torah_learning_entries || 0);
  const explicit = explicitIds.has(Number(job.id));

  if (explicit) return { archive: true, reason: 'explicit id requested' };
  if (parserOnly) return { archive: true, reason: 'parser-only intake' };
  if (extractedStudentWork > 0 && nonContentScore >= 2 && classScore <= 2) {
    return { archive: true, reason: 'task/accountability/goal-heavy after parser filing' };
  }
  if (nonContentScore >= 3 && classScore === 0) {
    return { archive: true, reason: 'non-content operational card' };
  }
  return { archive: false, reason: `kept: class_score=${classScore}, non_content_score=${nonContentScore}` };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const idsArg = process.argv.slice(2).find((arg) => arg.startsWith('--ids='));
  const explicitIds = new Set(
    String(idsArg ? idsArg.slice('--ids='.length) : '')
      .split(',')
      .map((value) => Number(value.trim()))
      .filter(Boolean)
  );

  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const databaseUrl =
    usableSecretValue(readLocalSecretFile('railway-database-url.txt')) ||
    usableSecretValue(env.DATABASE_URL);
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(
      `SELECT j.*,
        COALESCE(
          json_agg(o.* ORDER BY o.created_at ASC) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) AS outputs
       FROM bna_content_jobs j
       LEFT JOIN bna_content_outputs o ON o.job_id = j.id
       WHERE j.status <> 'archived'
       GROUP BY j.id
       ORDER BY j.created_at DESC`
    );
    const decisions = result.rows.map((job) => ({
      job,
      decision: classifyJob(job, explicitIds),
    }));
    const candidates = decisions.filter((item) => item.decision.archive);

    console.log(`${apply ? 'Applying' : 'Dry run'} content cleanup. Candidates: ${candidates.length}`);
    for (const { job, decision } of decisions) {
      console.log(`#${job.id} ${decision.archive ? 'ARCHIVE' : 'keep'} - ${job.title} (${decision.reason})`);
    }

    if (!apply || !candidates.length) return;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const { job, decision } of candidates) {
        const cleanupNote = `Codex cleanup ${new Date().toISOString()}: archived from Content because ${decision.reason}. Extracted Tasks/Students records remain in their proper lanes.`;
        await client.query(
          `UPDATE bna_content_jobs
           SET status = 'archived',
               drive_stage = COALESCE(drive_stage, '04 Parsed'),
               notes = CONCAT(COALESCE(notes, ''), CASE WHEN COALESCE(notes, '') = '' THEN '' ELSE E'\n\n' END, $2::text),
               updated_at = NOW()
           WHERE id = $1`,
          [job.id, cleanupNote]
        );
        await client.query(
          `UPDATE bna_content_outputs
           SET status = 'archived',
               updated_at = NOW()
           WHERE job_id = $1
             AND status IN ('draft', 'needs_approval')`,
          [job.id]
        );
        await client.query('DELETE FROM bna_class_sessions WHERE content_job_id = $1', [job.id]);
      }
      await client.query('COMMIT');
      console.log(`Archived ${candidates.length} content job(s).`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
