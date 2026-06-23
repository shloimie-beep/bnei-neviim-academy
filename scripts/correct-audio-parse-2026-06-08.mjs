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
const correctionMarker = 'audio-parse-correction-2026-06-08';
const apply = process.argv.includes('--apply');

const torahCorrections = [
  {
    date: '2026-06-07',
    name: 'Amitai Kosofsky',
    percent: 100,
    attendance: 'present',
    note: 'Operator clarified that yesterday Amitai did the full Torah time.',
  },
  {
    date: '2026-06-07',
    name: 'Eitan Chaim Golombo',
    percent: 100,
    attendance: 'present',
    note: 'Operator clarified that yesterday Eitan Chaim did the full Torah time.',
  },
  {
    date: '2026-06-07',
    name: 'Hillel Baraka',
    percent: 50,
    attendance: 'present',
    note: 'Operator clarified that yesterday Hillel did half of the Torah time.',
  },
  {
    date: '2026-06-07',
    name: 'Huda Weber',
    percent: 50,
    attendance: 'present',
    note: 'Operator clarified that yesterday Huda did half of the Torah time.',
  },
  {
    date: '2026-06-07',
    name: 'Menachem Mendel Dratler',
    percent: 50,
    attendance: 'present',
    note: 'Operator clarified that yesterday Menachem did half of the Torah time.',
  },
  {
    date: '2026-06-08',
    name: 'Eitan Chaim Golombo',
    percent: 0,
    attendance: 'present',
    engagement: 'low',
    followUp: true,
    note: 'Operator clarified that today Eitan Chaim was present but did not earn Torah progress credit.',
  },
  {
    date: '2026-06-08',
    name: 'Menachem Mendel Dratler',
    percent: 0,
    attendance: 'absent',
    note: 'Operator clarified that today Menachem was not present and should receive no Torah progress credit.',
  },
  {
    date: '2026-06-08',
    name: 'Amitai Kosofsky',
    percent: 100,
    attendance: 'present',
    note: 'Operator clarified that today Amitai did the full Torah time.',
  },
  {
    date: '2026-06-08',
    name: 'Hillel Baraka',
    percent: 100,
    attendance: 'present',
    note: 'Operator clarified that today Hillel gets full Torah credit.',
  },
  {
    date: '2026-06-08',
    name: 'Huda Weber',
    percent: 100,
    attendance: 'present',
    note: 'Operator clarified that today Huda did the full Torah time.',
  },
];

const questionCorrections = [
  {
    key: 'job-26-huda-children-prayer',
    name: 'Huda Weber',
    title: "Question about children's prayers",
    topic: "Children's prayers",
    questionText: 'Why is it more important for children to pray?',
    notes: "Huda asked why children's prayers are more important.",
    occurredAt: '2026-06-08T10:17:20.423Z',
    sourceContentJobId: 26,
  },
  {
    key: 'job-26-eitan-coastal',
    name: 'Eitan Chaim Golombo',
    title: 'Question about unclear coastal transcript term',
    topic: 'Unclear class transcript term',
    questionText: 'What is the role of the coastal?',
    notes: 'Eitan Chaim asked about the role of the unclear transcript term heard as "coastal"; this needs review.',
    occurredAt: '2026-06-08T10:17:20.423Z',
    sourceContentJobId: 26,
    followUp: true,
    hideFromPortals: true,
  },
];

const analysisCorrections = [
  {
    key: 'hillel-learning-path-2026-06-08',
    name: 'Hillel Baraka',
    title: 'Student analysis: Hillel learning path',
    notes: 'Hillel said he wants to look inside, but the operator thinks he may not be ready for text-based learning yet. Current correction path: focus on inspiration and connection first, not text-based learning.',
    behaviorFocus: 'Wants to look inside, but text-based learning may not be the right next step yet.',
    correctionPath: 'Focus on inspiration, relationship, and connection before pushing text-based learning.',
    followUp: true,
  },
  {
    key: 'eitan-focus-parent-message-2026-06-08',
    name: 'Eitan Chaim Golombo',
    title: 'Student analysis: Eitan focus and parent follow-up',
    notes: 'Operator observed that Eitan Chaim is struggling to focus. A message was left for his parents on 2026-06-08.',
    behaviorFocus: 'Struggling to focus during Torah learning.',
    correctionPath: 'Track focus privately and continue parent follow-up.',
    followUp: true,
  },
];

const taskCorrections = [
  {
    key: 'call-hillel-rabbi-learning-approach',
    title: "Call Hillel's rabbi about learning approach",
    notes: 'Speak with Hillel Baraka\'s rabbi about whether the current path should focus on inspiration and connection before text-based learning.',
    category: 'student_operations',
    assignedTo: 'Shloimie',
  },
  {
    key: 'set-up-updated-payment-links',
    title: 'Set up updated payment links for new and existing credit-card parents',
    notes: 'Payment workflow to preserve: new signups should be charged immediately, then charged on the first of the month for 12 payments. Existing credit-card parents should receive a new first-of-month payment link that does not charge immediately. Do not send links or charge anyone from this correction script.',
    category: 'accounting',
    assignedTo: 'Shloimie',
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

function metadataObject(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function rounded(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function appendNote(existing, addition) {
  const current = String(existing || '').trim();
  if (current.includes(correctionMarker)) return current;
  return [current, addition].filter(Boolean).join('\n');
}

function occurredAtForDate(date) {
  return `${date}T10:00:00+03:00`;
}

async function fetchStudent(client, name) {
  const result = await client.query(
    `SELECT *
     FROM bna_students
     WHERE lower(name) = lower($1)
       AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')
     ORDER BY id DESC
     LIMIT 1`,
    [name]
  );
  if (!result.rows[0]) throw new Error(`Missing active student: ${name}`);
  return result.rows[0];
}

async function ensureGoalForDate(client, student, date) {
  const existing = (await client.query(
    `SELECT *
     FROM bna_torah_learning_goals
     WHERE student_id = $1
       AND start_date <= $2::date
       AND (end_date IS NULL OR end_date >= $2::date)
     ORDER BY active DESC, start_date DESC, id DESC
     LIMIT 1`,
    [student.id, date]
  )).rows[0];
  if (existing) return existing;

  const result = await client.query(
    `INSERT INTO bna_torah_learning_goals (
       student_id, goal_minutes, goal_type, active, start_date, end_date
     ) VALUES (
       $1, 10, 'INSIDE', TRUE, $2::date, (date_trunc('month', $2::date) + interval '1 month - 1 day')::date
     )
     RETURNING *`,
    [student.id, date]
  );
  return result.rows[0];
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

async function upsertTorahEntry(client, correction) {
  const student = await fetchStudent(client, correction.name);
  const goal = await ensureGoalForDate(client, student, correction.date);
  const goalMinutes = Number(goal.goal_minutes || 10);
  const goalType = String(goal.goal_type || 'INSIDE').toUpperCase();
  const creditedMinutes = rounded(goalMinutes * (Number(correction.percent) / 100));
  const insideMinutes = goalType === 'INSIDE' ? creditedMinutes : 0;
  const engagedListeningMinutes = creditedMinutes;
  const progress = calculateStudentTorahProgress({
    goalMinutes,
    goalType,
    engagedListeningMinutes,
    insideEngagedMinutes: insideMinutes,
    listeningWithoutFollowingMinutes: 0,
  });
  const existing = (await client.query(
    `SELECT *
     FROM bna_torah_learning_entries
     WHERE student_id = $1 AND date = $2::date
     LIMIT 1`,
    [student.id, correction.date]
  )).rows[0];
  const note = appendNote(
    existing?.note,
    `${correctionMarker}: ${correction.note} Stored daily completion ${Number(correction.percent)}%.`
  );

  const result = await client.query(
    `INSERT INTO bna_torah_learning_entries (
       student_id, goal_id, date, engaged_listening_minutes, inside_engaged_minutes,
       listening_without_following_minutes, counted_minutes, individual_percentage,
       individual_complete, daily_completion_percentage, daily_completed_boolean,
       completed_daily_units, carried_over_completed_units, total_completed_units,
       total_required_units, total_trip_progress_percentage, note
     ) VALUES (
       $1, $2, $3::date, $4, $5,
       0, $6, $7,
       $8, $7, $8,
       0, COALESCE($9::numeric, 3.5), COALESCE($10::numeric, 3.5),
       COALESCE($11::numeric, 30), 0, $12
     )
     ON CONFLICT (student_id, date) DO UPDATE SET
       goal_id = EXCLUDED.goal_id,
       engaged_listening_minutes = EXCLUDED.engaged_listening_minutes,
       inside_engaged_minutes = EXCLUDED.inside_engaged_minutes,
       listening_without_following_minutes = 0,
       counted_minutes = EXCLUDED.counted_minutes,
       individual_percentage = EXCLUDED.individual_percentage,
       individual_complete = EXCLUDED.individual_complete,
       daily_completion_percentage = EXCLUDED.daily_completion_percentage,
       daily_completed_boolean = EXCLUDED.daily_completed_boolean,
       note = EXCLUDED.note,
       updated_at = NOW()
     RETURNING *`,
    [
      student.id,
      goal.id,
      correction.date,
      engagedListeningMinutes,
      insideMinutes,
      progress.countedMinutes,
      progress.individualPercentageRaw,
      progress.individualComplete,
      existing?.carried_over_completed_units ?? null,
      existing?.total_completed_units ?? null,
      existing?.total_required_units ?? null,
      note,
    ]
  );

  await refreshStudentSnapshots(client, student.id);
  return { student, goal, entry: result.rows[0], progress };
}

async function upsertTorahAccountability(client, correction, torahRecord) {
  const { student, goal, entry, progress } = torahRecord;
  const existing = (await client.query(
    `SELECT *
     FROM bna_accountability_events
     WHERE (
       metadata->>'correction_key' = $1
       OR metadata->>'torah_entry_id' = $2
       OR (
         event_type = 'learning_note'
         AND student_id = $3
         AND occurred_at::date = $4::date
         AND title ILIKE 'Torah timer update%'
       )
     )
     ORDER BY id ASC
     LIMIT 1`,
    [`${correctionMarker}:${correction.date}:${student.id}`, String(entry.id), student.id, correction.date]
  )).rows[0];
  const metadata = {
    ...metadataObject(existing?.metadata),
    correction_marker: correctionMarker,
    correction_key: `${correctionMarker}:${correction.date}:${student.id}`,
    kind: 'torah_progress_correction',
    torah_entry_id: entry.id,
    corrected_from_operator: true,
  };
  const title = `Torah progress correction for ${student.name}`;
  const notes = `${correction.note} Daily Torah completion corrected to ${Number(correction.percent)}%.`;
  const args = [
    'learning_note',
    student.id,
    student.name,
    title,
    notes,
    'Torah daily engagement',
    Number(goal.goal_minutes || 10),
    progress.countedMinutes,
    'minutes',
    Math.round(Number(correction.percent)),
    correction.attendance,
    correction.engagement || (correction.percent >= 100 ? 'high' : correction.percent > 0 ? 'medium' : null),
    Boolean(correction.followUp),
    JSON.stringify(metadata),
    occurredAtForDate(correction.date),
  ];

  if (existing) {
    await client.query(
      `UPDATE bna_accountability_events
       SET event_type = $1,
           student_id = $2,
           student_name = $3,
           title = $4,
           notes = $5,
           topic = $6,
           goal_target_value = $7,
           goal_actual_value = $8,
           goal_unit = $9,
           progress_percent = $10,
           attendance_status = $11,
           engagement_level = $12,
           follow_up_required = $13,
           metadata = $14,
           occurred_at = $15::timestamp,
           source = 'manual',
           updated_at = NOW()
       WHERE id = $16`,
      [...args, existing.id]
    );
    return { action: 'updated', id: existing.id };
  }

  const inserted = await client.query(
    `INSERT INTO bna_accountability_events (
       event_type, student_id, student_name, title, notes, topic,
       goal_target_value, goal_actual_value, goal_unit, progress_percent,
       attendance_status, engagement_level, follow_up_required, metadata,
       source, occurred_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10,
       $11, $12, $13, $14,
       'manual', $15::timestamp
     )
     RETURNING id`,
    args
  );
  return { action: 'inserted', id: inserted.rows[0].id };
}

async function ensureQuestionEvent(client, correction) {
  const student = await fetchStudent(client, correction.name);
  const correctionKey = `${correctionMarker}:${correction.key}`;
  const existing = (await client.query(
    `SELECT *
     FROM bna_accountability_events
     WHERE event_type = 'question'
       AND student_id = $1
       AND (
         metadata->>'correction_key' = $2
         OR lower(COALESCE(question_text, '')) = lower($3)
       )
     ORDER BY id ASC
     LIMIT 1`,
    [student.id, correctionKey, correction.questionText]
  )).rows[0];
  const metadata = {
    ...metadataObject(existing?.metadata),
    correction_marker: correctionMarker,
    correction_key: correctionKey,
    kind: 'student_question_correction',
    source_content_job_id: correction.sourceContentJobId,
    hide_from_portals: Boolean(correction.hideFromPortals),
    portal_hidden: Boolean(correction.hideFromPortals),
  };
  const args = [
    student.id,
    student.name,
    correction.title,
    correction.notes,
    correction.topic,
    correction.questionText,
    'high',
    Boolean(correction.followUp),
    JSON.stringify(metadata),
    correction.occurredAt,
  ];

  if (existing) {
    await client.query(
      `UPDATE bna_accountability_events
       SET student_id = $1,
           student_name = $2,
           title = $3,
           notes = $4,
           topic = $5,
           question_text = $6,
           engagement_level = $7,
           follow_up_required = $8,
           metadata = $9,
           occurred_at = $10::timestamp,
           source = 'manual',
           updated_at = NOW()
       WHERE id = $11`,
      [...args, existing.id]
    );
    return { action: 'updated', id: existing.id };
  }

  const inserted = await client.query(
    `INSERT INTO bna_accountability_events (
       event_type, student_id, student_name, title, notes, topic, question_text,
       engagement_level, follow_up_required, metadata, source, occurred_at
     ) VALUES (
       'question', $1, $2, $3, $4, $5, $6,
       $7, $8, $9, 'manual', $10::timestamp
     )
     RETURNING id`,
    args
  );
  return { action: 'inserted', id: inserted.rows[0].id };
}

async function ensureAnalysisEvent(client, correction) {
  const student = await fetchStudent(client, correction.name);
  const correctionKey = `${correctionMarker}:${correction.key}`;
  const existing = (await client.query(
    `SELECT *
     FROM bna_accountability_events
     WHERE student_id = $1
       AND metadata->>'kind' = 'student_analysis'
       AND metadata->>'analysis_key' = $2
     ORDER BY id ASC
     LIMIT 1`,
    [student.id, correction.key]
  )).rows[0];
  const metadata = {
    ...metadataObject(existing?.metadata),
    correction_marker: correctionMarker,
    correction_key: correctionKey,
    kind: 'student_analysis',
    analysis_key: correction.key,
    visibility: 'admin_only',
    analysis_date: '2026-06-08',
    behavior_focus: correction.behaviorFocus,
    correction_path: correction.correctionPath,
  };
  const args = [
    student.id,
    student.name,
    correction.title,
    correction.notes,
    'Student Analysis',
    Boolean(correction.followUp),
    JSON.stringify(metadata),
    '2026-06-08T12:00:00+03:00',
  ];

  if (existing) {
    await client.query(
      `UPDATE bna_accountability_events
       SET event_type = 'private_meeting',
           student_id = $1,
           student_name = $2,
           title = $3,
           notes = $4,
           topic = $5,
           follow_up_required = $6,
           metadata = $7,
           occurred_at = $8::timestamp,
           source = 'manual',
           updated_at = NOW()
       WHERE id = $9`,
      [...args, existing.id]
    );
    return { action: 'updated', id: existing.id };
  }

  const inserted = await client.query(
    `INSERT INTO bna_accountability_events (
       event_type, student_id, student_name, title, notes, topic,
       follow_up_required, metadata, source, occurred_at
     ) VALUES (
       'private_meeting', $1, $2, $3, $4, $5,
       $6, $7, 'manual', $8::timestamp
     )
     RETURNING id`,
    args
  );
  return { action: 'inserted', id: inserted.rows[0].id };
}

async function ensureBnaProject(client) {
  const result = await client.query(
    `INSERT INTO bna_projects (project_key, name, short_name, description, metadata)
     VALUES ('bna', 'BNA', 'BNA', 'Bnei Neviim Academy work', '{}')
     ON CONFLICT (project_key) DO UPDATE
       SET name = COALESCE(bna_projects.name, EXCLUDED.name),
           short_name = COALESCE(bna_projects.short_name, EXCLUDED.short_name),
           updated_at = NOW()
     RETURNING *`
  );
  return result.rows[0];
}

async function ensureTask(client, correction) {
  const project = await ensureBnaProject(client);
  const existing = (await client.query(
    `SELECT *
     FROM bna_tasks
     WHERE lower(title) = lower($1)
       AND COALESCE(project_id, $2) = $2
       AND COALESCE(stage, 'assigned') <> 'archive'
     ORDER BY id ASC
     LIMIT 1`,
    [correction.title, project.id]
  )).rows[0];
  const aiParsed = {
    parser: correctionMarker,
    kind: 'task',
    display_title: correction.title,
    original_text: correction.notes,
    project: 'bna',
    task_key: correction.key,
  };
  const args = [
    correction.title,
    correction.notes,
    'assigned',
    correction.category,
    'this_week',
    'manual',
    'codex',
    correction.assignedTo,
    JSON.stringify(aiParsed),
    project.id,
    false,
    'codex',
  ];

  if (existing) {
    await client.query(
      `UPDATE bna_tasks
       SET title = $1,
           notes = $2,
           stage = CASE WHEN stage IN ('done', 'archive') THEN stage ELSE $3 END,
           category = $4,
           urgency = $5,
           source = $6,
           created_by = $7,
           assigned_to = $8,
           ai_parsed = $9,
           project_id = $10,
           decision_required = $11,
           author = $12,
           updated_at = NOW()
       WHERE id = $13`,
      [...args, existing.id]
    );
    return { action: 'updated', id: existing.id };
  }

  const inserted = await client.query(
    `INSERT INTO bna_tasks (
       title, notes, stage, category, urgency, source, created_by,
       assigned_to, ai_parsed, project_id, decision_required, author
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12
     )
     RETURNING id`,
    args
  );
  return { action: 'inserted', id: inserted.rows[0].id };
}

async function fetchTorahSummaryRows(client, date) {
  const result = await client.query(
    `SELECT s.name,
            e.daily_completion_percentage,
            e.inside_engaged_minutes,
            e.counted_minutes,
            e.total_trip_progress_percentage
     FROM bna_students s
     LEFT JOIN bna_torah_learning_entries e
       ON e.student_id = s.id
      AND e.date = $1::date
     WHERE lower(s.name) = ANY($2::text[])
     ORDER BY s.name`,
    [date, [...new Set(torahCorrections.map((item) => item.name.toLowerCase()))]]
  );
  return result.rows;
}

async function main() {
  const databaseUrl = loadDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured and .secrets/railway-database-url.txt was not found.');
  }
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const summary = {
    torah: [],
    torahEvents: [],
    questions: [],
    analysis: [],
    tasks: [],
  };

  try {
    await client.query('BEGIN');

    for (const correction of torahCorrections) {
      // eslint-disable-next-line no-await-in-loop
      const torahRecord = await upsertTorahEntry(client, correction);
      // eslint-disable-next-line no-await-in-loop
      const event = await upsertTorahAccountability(client, correction, torahRecord);
      summary.torah.push({
        date: correction.date,
        name: correction.name,
        percent: correction.percent,
        entry_id: torahRecord.entry.id,
      });
      summary.torahEvents.push({ ...event, name: correction.name, date: correction.date });
    }

    for (const correction of questionCorrections) {
      // eslint-disable-next-line no-await-in-loop
      const event = await ensureQuestionEvent(client, correction);
      summary.questions.push({ ...event, name: correction.name, key: correction.key });
    }

    for (const correction of analysisCorrections) {
      // eslint-disable-next-line no-await-in-loop
      const event = await ensureAnalysisEvent(client, correction);
      summary.analysis.push({ ...event, name: correction.name, key: correction.key });
    }

    for (const correction of taskCorrections) {
      // eslint-disable-next-line no-await-in-loop
      const task = await ensureTask(client, correction);
      summary.tasks.push({ ...task, title: correction.title });
    }

    if (apply) {
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }

    console.log(`${apply ? 'Applied' : 'Dry run'} ${correctionMarker}`);
    console.log(JSON.stringify(summary, null, 2));

    if (apply) {
      for (const date of ['2026-06-07', '2026-06-08']) {
        // eslint-disable-next-line no-await-in-loop
        const rows = await fetchTorahSummaryRows(client, date);
        console.log(`Torah rows ${date}:`);
        console.table(rows.map((row) => ({
          name: row.name,
          daily: Number(row.daily_completion_percentage || 0),
          inside: Number(row.inside_engaged_minutes || 0),
          counted: Number(row.counted_minutes || 0),
          trip: Number(row.total_trip_progress_percentage || 0),
        })));
      }
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors.
    }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
