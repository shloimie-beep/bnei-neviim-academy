#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import torahLearning from '../src/lib/bna/torah-learning.js';

const {
  calculateDailyCompletedUnits,
  calculateStudentTorahProgress,
  calculateStudentTripProgress,
  dailyCompletionPercentageFromEntry,
} = torahLearning;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultCorrectionDate = '2026-06-04';
const correctionMarker = 'Task #134 correction';

const corrections = [
  {
    name: 'Eitan Chaim Golombo',
    fraction: 1,
    note: 'operator clarified he did the full 20 minutes.',
  },
  {
    name: 'Amitai Kosofsky',
    fraction: 1,
    note: 'operator clarified he did the full assigned time.',
  },
  {
    name: 'Menachem Mendel Dratler',
    fraction: 0.5,
    note: 'operator clarified he did half time, not 5 of 20 minutes.',
  },
  {
    name: 'Huda Weber',
    fraction: 0.5,
    note: 'operator clarified he did half time.',
  },
  {
    name: 'Hillel Baraka',
    fraction: 2 / 3,
    note: 'operator clarified he did two-thirds time.',
  },
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
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
    result[line.slice(0, separator).trim()] = value;
  }
  return result;
}

function readSecret(name) {
  const filePath = path.join(repoRoot, '.secrets', name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function loadDatabaseUrl() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  if (env.DATABASE_URL && !env.DATABASE_URL.includes('[YOUR-PASSWORD]')) return env.DATABASE_URL;
  return readSecret('railway-database-url.txt');
}

function argValue(prefix) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`));
  return match ? match.slice(prefix.length + 1) : null;
}

function rounded(value, places = 4) {
  const factor = 10 ** places;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function appendNote(existing, addition) {
  const current = String(existing || '').trim();
  if (current.includes(addition)) return current;
  return [current, addition].filter(Boolean).join('\n');
}

async function fetchCorrectionRows(client, date) {
  const result = await client.query(
    `SELECT
       s.id AS student_id,
       s.name,
       e.id AS entry_id,
       e.date::text AS date,
       e.engaged_listening_minutes,
       e.inside_engaged_minutes,
       e.listening_without_following_minutes,
       e.counted_minutes,
       e.individual_percentage,
       e.daily_completion_percentage,
       e.daily_completed_boolean,
       e.completed_daily_units,
       e.carried_over_completed_units,
       e.total_completed_units,
       e.total_required_units,
       e.total_trip_progress_percentage,
       e.note,
       g.id AS goal_id,
       g.goal_minutes,
       g.goal_type
     FROM bna_students s
     JOIN bna_torah_learning_entries e ON e.student_id = s.id
     JOIN bna_torah_learning_goals g ON g.id = e.goal_id
     WHERE lower(s.name) = ANY($1::text[])
       AND e.date = $2::date
     ORDER BY s.name`,
    [corrections.map((item) => item.name.toLowerCase()), date]
  );
  return result.rows;
}

async function refreshStudentSnapshots(client, studentId) {
  const entries = (await client.query(
    `SELECT *
     FROM bna_torah_learning_entries
     WHERE student_id = $1
     ORDER BY date ASC, id ASC`,
    [studentId]
  )).rows;

  let completedDailyUnits = 0;
  const carriedOverCompletedUnits = Number(entries[0]?.carried_over_completed_units ?? 3.5);
  const totalRequiredUnits = Number(entries[0]?.total_required_units ?? 30);

  for (const entry of entries) {
    const dailyCompletionPercentage = dailyCompletionPercentageFromEntry(entry);
    const dailyCompletedBoolean = dailyCompletionPercentage >= 100;
    completedDailyUnits += calculateDailyCompletedUnits(dailyCompletionPercentage);
    const trip = calculateStudentTripProgress({
      carriedOverCompletedUnits,
      completedDailyUnits,
      totalRequiredUnits,
    });

    // eslint-disable-next-line no-await-in-loop
    await client.query(
      `UPDATE bna_torah_learning_entries
       SET daily_completion_percentage = $2,
           daily_completed_boolean = $3,
           individual_complete = $3,
           completed_daily_units = $4,
           carried_over_completed_units = $5,
           total_completed_units = $6,
           total_required_units = $7,
           total_trip_progress_percentage = $8,
           updated_at = NOW()
       WHERE id = $1`,
      [
        entry.id,
        dailyCompletionPercentage,
        dailyCompletedBoolean,
        rounded(trip.completedDailyUnits),
        trip.carriedOverCompletedUnits,
        rounded(trip.totalCompletedUnits),
        trip.totalRequiredUnits,
        rounded(trip.totalTripProgressPercentageRaw),
      ]
    );
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const date = argValue('--date') || defaultCorrectionDate;
  const databaseUrl = loadDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured and .secrets/railway-database-url.txt was not found.');
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const beforeRows = await fetchCorrectionRows(client, date);
    console.log(`Task #134 Torah correction for ${date} (${apply ? 'apply' : 'dry-run'}).`);
    console.table(beforeRows.map((row) => ({
      name: row.name,
      goal: Number(row.goal_minutes),
      type: row.goal_type,
      inside: Number(row.inside_engaged_minutes || 0),
      listening: Number(row.engaged_listening_minutes || 0),
      percent: Number(row.daily_completion_percentage || 0),
      completed_units: Number(row.completed_daily_units || 0),
      trip_percent: Number(row.total_trip_progress_percentage || 0),
    })));

    const missing = corrections.filter((correction) =>
      !beforeRows.some((row) => row.name.toLowerCase() === correction.name.toLowerCase())
    );
    if (missing.length) {
      throw new Error(`Missing ${date} Torah rows for: ${missing.map((item) => item.name).join(', ')}`);
    }

    const planned = corrections.map((correction) => {
      const row = beforeRows.find((item) => item.name.toLowerCase() === correction.name.toLowerCase());
      const goalMinutes = Number(row.goal_minutes);
      const creditedMinutes = rounded(goalMinutes * correction.fraction, 2);
      const progress = calculateStudentTorahProgress({
        goalMinutes,
        goalType: row.goal_type,
        engagedListeningMinutes: row.goal_type === 'LISTENING' ? creditedMinutes : creditedMinutes,
        insideEngagedMinutes: row.goal_type === 'INSIDE' ? creditedMinutes : 0,
        listeningWithoutFollowingMinutes: 0,
      });
      return {
        correction,
        row,
        creditedMinutes,
        progress,
      };
    });

    console.log('Planned correction:');
    console.table(planned.map(({ row, creditedMinutes, progress }) => ({
      name: row.name,
      goal: Number(row.goal_minutes),
      credited_minutes: creditedMinutes,
      daily_percent: rounded(progress.individualPercentageRaw, 2),
      full_day: progress.individualComplete,
    })));

    if (!apply) {
      console.log('Dry run only. Re-run with --apply to write these values.');
      return;
    }

    await client.query('BEGIN');
    for (const { correction, row, creditedMinutes, progress } of planned) {
      const correctionNote = [
        `${correctionMarker}: ${correction.note}`,
        `Applied to stored ${date} Torah row from the uploaded recording; cumulative trip progress is recalculated from actual daily fractions.`,
      ].join(' ');
      const nextNote = appendNote(row.note, correctionNote);
      // eslint-disable-next-line no-await-in-loop
      await client.query(
        `UPDATE bna_torah_learning_entries
         SET engaged_listening_minutes = $2,
             inside_engaged_minutes = $3,
             listening_without_following_minutes = 0,
             counted_minutes = $4,
             individual_percentage = $5,
             individual_complete = $6,
             daily_completion_percentage = $5,
             daily_completed_boolean = $6,
             note = $7,
             updated_at = NOW()
         WHERE id = $1`,
        [
          row.entry_id,
          row.goal_type === 'LISTENING' ? creditedMinutes : creditedMinutes,
          row.goal_type === 'INSIDE' ? creditedMinutes : 0,
          progress.countedMinutes,
          progress.individualPercentageRaw,
          progress.individualComplete,
          nextNote,
        ]
      );
      // eslint-disable-next-line no-await-in-loop
      await refreshStudentSnapshots(client, row.student_id);
    }
    await client.query('COMMIT');

    const afterRows = await fetchCorrectionRows(client, date);
    console.log('Applied correction:');
    console.table(afterRows.map((row) => ({
      name: row.name,
      percent: Number(row.daily_completion_percentage || 0),
      completed_units: Number(row.completed_daily_units || 0),
      total_units: Number(row.total_completed_units || 0),
      trip_percent: Number(row.total_trip_progress_percentage || 0),
    })));
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback failures; the original error is more useful.
    }
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
