#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addFinding,
  isFailureSeverity,
  overallSeverity,
  printCliResult,
  readText,
  relative,
  repoRoot,
  walkFiles,
  writeWatchdogReport,
} from './lib/watchdog-common.mjs';

export function buildRawIntakeDriftAudit() {
  const findings = [];
  const rawDir = path.join(repoRoot, 'raw-input');
  const rawFiles = walkFiles(rawDir, (file) => file.endsWith('.md') && !file.endsWith('README.md'));
  const memoryFiles = walkFiles(path.join(repoRoot, 'memory'), (file) => file.endsWith('.md'));
  const registers = walkFiles(path.join(repoRoot, 'tasks-pending'), (file) => file.endsWith('.md'));
  const rawIds = new Set();
  for (const filePath of rawFiles) {
    const text = readText(filePath);
    const match = text.match(/\bRAW-\d{8}-\d{3}\b/) || path.basename(filePath).match(/\bRAW-\d{8}-\d{3}\b/);
    if (!match) {
      addFinding(findings, {
        severity: 'high',
        category: 'raw-intake',
        title: `Raw intake file lacks stable RAW ID`,
        details: 'Repo fallback raw files must preserve the stable raw ID in filename or body.',
        evidence: [relative(filePath)],
        recommended_fix: 'Rename or annotate the raw file with RAW-YYYYMMDD-###.',
        goal_ids: ['GOAL-CORE-007'],
      });
    } else {
      rawIds.add(match[0]);
    }
  }
  for (const filePath of registers) {
    const text = readText(filePath);
    const ids = [...text.matchAll(/\bRAW-\d{8}-\d{3}\b/g)].map((match) => match[0]);
    for (const id of ids) {
      if (!rawIds.has(id) && !memoryFiles.some((memoryPath) => readText(memoryPath).includes(id))) {
        addFinding(findings, {
          severity: 'medium',
          category: 'raw-intake',
          title: `Register references ${id} without repo raw fallback`,
          details: 'If the live DB is unavailable, raw provenance should also be visible in raw-input/ or memory/YYYY-MM-DD.md.',
          evidence: [relative(filePath), id],
          recommended_fix: 'Link the live bna_raw_intake row or add a redacted repo fallback pointer.',
          goal_ids: ['GOAL-CORE-007', 'GOAL-CORE-015'],
        });
      }
    }
  }
  const report = writeWatchdogReport({
    kind: 'raw-intake-drift',
    title: 'Raw Intake Drift Watchdog',
    summaryLines: [
      `Raw fallback files: ${rawFiles.length}`,
      `Memory files: ${memoryFiles.length}`,
      `Requirement registers: ${registers.length}`,
    ],
    findings,
  });
  const severity = overallSeverity(findings);
  return { ok: !findings.some((finding) => isFailureSeverity(finding.severity)), severity, findings, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildRawIntakeDriftAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
