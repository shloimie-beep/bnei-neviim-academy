#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  buildLeaseAndRetryPlan,
  buildOneTimeDriveVideoIntakePlan,
  safeIntakeReport,
} = require('../src/lib/bna/one-time-drive-video-orchestrator');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const defaultDriveMapPath = path.join(repoRoot, 'ops', 'one-time-mishnah-class', 'drive-social-ingestion-map.json');

function parseArgs(argv) {
  const args = {
    fixture: '',
    driveMap: defaultDriveMapPath,
    json: false,
    leasePlan: false,
    now: '',
    projectId: null,
    stabilitySeconds: undefined,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === '--fixture') args.fixture = path.resolve(argv[++index] || '');
    else if (item === '--drive-map') args.driveMap = path.resolve(argv[++index] || '');
    else if (item === '--json') args.json = true;
    else if (item === '--lease-plan') args.leasePlan = true;
    else if (item === '--now') args.now = argv[++index] || '';
    else if (item === '--project-id') args.projectId = Number(argv[++index] || 0) || null;
    else if (item === '--stability-seconds') args.stabilitySeconds = Number(argv[++index] || 0) || undefined;
    else if (item.startsWith('--fixture=')) args.fixture = path.resolve(item.slice('--fixture='.length));
    else if (item.startsWith('--drive-map=')) args.driveMap = path.resolve(item.slice('--drive-map='.length));
    else if (item.startsWith('--now=')) args.now = item.slice('--now='.length);
    else if (item.startsWith('--project-id=')) args.projectId = Number(item.slice('--project-id='.length)) || null;
    else if (item.startsWith('--stability-seconds=')) args.stabilitySeconds = Number(item.slice('--stability-seconds='.length)) || undefined;
  }
  return args;
}

function readJsonIfExists(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function renderMarkdown(report, leaseReport = null) {
  const lines = [
    '# One Time Drive Video Orchestrator Dry Run',
    '',
    `Generated: ${report.generated_at || ''}`,
    `Mode: ${report.mode || 'dry_run_no_writes'}`,
    `Workspace: ${report.workspace_key || ''}`,
    `Project: ${report.project_key || ''}`,
    `Drive stage: ${report.drive_stage || ''}`,
    `Folder source: ${report.folder_source || ''}`,
    `Folder ref: ${report.folder_ref || ''}`,
    `No Drive write: ${report.no_drive_write !== false}`,
    `No database write: ${report.no_database_write !== false}`,
    `No Vimeo write: ${report.no_vimeo_write !== false}`,
    '',
    '## Summary',
    '',
    `- Discovered: ${report.discovered_count || 0}`,
    `- Inserts: ${report.insert_count || 0}`,
    `- Skips: ${report.skip_count || 0}`,
    `- Blockers: ${report.blocker_count || 0}`,
    '',
    '## Job Inserts',
    '',
    '| Action | File Ref | State | Source Type | No Source Mutation |',
    '| --- | --- | --- | --- | --- |',
    ...(report.job_inserts || []).map((row) => `| ${row.action || ''} | ${row.drive_file_ref || ''} | ${row.processing_state || ''} | ${row.source_type || ''} | ${row.no_source_drive_mutation ? 'yes' : 'no'} |`),
    ...((report.job_inserts || []).length ? [] : ['| - | - | - | - | - |']),
    '',
    '## Skips',
    '',
    '| Action | File Ref | Reason | Blockers |',
    '| --- | --- | --- | --- |',
    ...(report.skips || []).map((row) => `| ${row.action || ''} | ${row.drive_file_ref || ''} | ${row.reason || row.existing_state || ''} | ${(row.blockers || []).join(', ')} |`),
    ...((report.skips || []).length ? [] : ['| - | - | - | - |']),
  ];

  if (leaseReport) {
    lines.push(
      '',
      '## Lease / Retry Plan',
      '',
      `- Updates: ${leaseReport.update_count || 0}`,
      `- Skips: ${leaseReport.skip_count || 0}`,
      '',
      '| Job | Action | Next State |',
      '| ---: | --- | --- |',
      ...(leaseReport.updates || []).map((row) => `| ${row.job_id || ''} | ${row.action || ''} | ${row.after?.processing_state || ''} |`),
      ...((leaseReport.updates || []).length ? [] : ['| - | - | - |'])
    );
  }

  return `${lines.join('\n')}\n`;
}

const args = parseArgs(process.argv.slice(2));
const fixture = readJsonIfExists(args.fixture, {});
const driveMap = readJsonIfExists(args.driveMap, {});
const now = args.now || fixture.now || new Date().toISOString();

const plan = buildOneTimeDriveVideoIntakePlan({
  files: fixture.files || [],
  previousFiles: fixture.previousFiles || [],
  existingJobs: fixture.existingJobs || [],
  driveMap,
  now,
  projectId: args.projectId || fixture.projectId || null,
  stabilitySeconds: args.stabilitySeconds || fixture.stabilitySeconds,
});
const report = safeIntakeReport(plan);
const leaseReport = args.leasePlan
  ? buildLeaseAndRetryPlan({ jobs: fixture.jobs || fixture.existingJobs || [], now })
  : null;

process.stdout.write(args.json
  ? `${JSON.stringify({ report, lease_report: leaseReport }, null, 2)}\n`
  : renderMarkdown(report, leaseReport));
