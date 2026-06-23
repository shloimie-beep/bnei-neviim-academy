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
  const canonicalContracts = [];
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

  function requireCanonicalContract({ file, label, patterns, recommended_fix }) {
    const filePath = path.join(repoRoot, file);
    const text = readText(filePath);
    const missing = [];
    if (!text) {
      missing.push('file is missing or unreadable');
    } else {
      for (const [name, pattern] of patterns) {
        if (!pattern.test(text)) missing.push(name);
      }
    }
    canonicalContracts.push({
      file,
      label,
      checked: patterns.length,
      ok: missing.length === 0,
      missing,
    });
    if (missing.length) {
      addFinding(findings, {
        severity: 'high',
        category: 'canonical-intake',
        title: `${label} contract drift`,
        details: `Missing required markers: ${missing.join(', ')}.`,
        evidence: [file],
        recommended_fix,
        goal_ids: ['GOAL-CORE-007', 'GOAL-CORE-015'],
      });
    }
  }

  requireCanonicalContract({
    file: 'src/platform/ingestion/intake-service.js',
    label: 'Canonical intake service',
    patterns: [
      ['buildCanonicalIntakePacket export', /\bbuildCanonicalIntakePacket\b/],
      ['source record creation', /\bcreateIntakeSourceRecord\b/],
      ['platform parser bridge', /\bparsePlatformIntake\b/],
      ['parent prompt bridge', /\bcreateParentPrompt\b/],
      ['persistence plan', /\bbuildPersistencePlan\b/],
      ['no external write flag', /external_write_performed:\s*false/],
    ],
    recommended_fix: 'Restore the shared source/parse/parent-prompt/persistence packet service before adapters bypass it.',
  });
  requireCanonicalContract({
    file: 'src/platform/ingestion/intake-persistence.js',
    label: 'Canonical intake persistence readback',
    patterns: [
      ['memory store factory', /\bcreateMemoryIntakePersistenceStore\b/],
      ['memory apply function', /\bapplyCanonicalIntakePacketToMemory\b/],
      ['readback function', /\breadCanonicalIntakePersistence\b/],
      ['idempotent map upsert', /\.set\(rows\.(?:raw_intake|parse_run|parent_prompt)/],
      ['no external write flag', /external_write_performed:\s*false/],
    ],
    recommended_fix: 'Restore local apply/readback coverage before approving any production persistence path.',
  });
  requireCanonicalContract({
    file: 'src/platform/ingestion/intake-postgres-persistence.js',
    label: 'Canonical intake Postgres persistence',
    patterns: [
      ['postgres plan builder', /\bbuildCanonicalIntakePostgresPlan\b/],
      ['postgres apply helper', /\bapplyCanonicalIntakePacketToPostgres\b/],
      ['postgres readback helper', /\breadCanonicalIntakePersistenceFromPostgres\b/],
      ['injected client guard', /Postgres client with query\(sql, values\) is required/],
      ['parent prompt table', /\bbna_canonical_parent_prompts\b/],
      ['parsed entities table', /\bbna_canonical_parsed_entities\b/],
      ['no external write flag', /external_write_performed:\s*false/],
    ],
    recommended_fix: 'Keep approved production persistence on the canonical Postgres apply/readback adapter with injected-client gating.',
  });
  requireCanonicalContract({
    file: 'src/platform/ingestion/prompt-queue.js',
    label: 'Parent prompt auto-resume lifecycle',
    patterns: [
      ['auto-resume planner', /\bbuildPromptAutoResumePlan\b/],
      ['auto-resume apply helper', /\bapplyPromptAutoResumePlan\b/],
      ['resolved decision action', /resume_after_decision/],
      ['stale heartbeat routing', /stale_heartbeat/],
      ['no external write flag', /external_write_performed:\s*false/],
    ],
    recommended_fix: 'Restore local prompt auto-resume planning before enabling production watchdog resume paths.',
  });
  requireCanonicalContract({
    file: 'scripts/intake-github.mjs',
    label: 'GitHub intake adapter',
    patterns: [
      ['canonical packet service import', /\bbuildCanonicalIntakePacket\b/],
      ['github provider', /source_provider:\s*'github'/],
      ['github issue kind', /source_kind:\s*'github_issue'/],
      ['persistence plan summary', /\bpersistence_plan\b/],
    ],
    recommended_fix: 'Route GitHub dry-run intake through the canonical service with first-class GitHub source metadata.',
  });
  requireCanonicalContract({
    file: 'scripts/ramble-intake-contract.mjs',
    label: 'Ramble intake contract script',
    patterns: [
      ['canonical packet service import', /\bbuildCanonicalIntakePacket\b/],
      ['memory readback adapter import', /\bapplyCanonicalIntakePacketToMemory\b/],
      ['postgres plan adapter import', /\bbuildCanonicalIntakePostgresPlan\b/],
      ['memory readback flag', /--memory-readback/],
      ['postgres plan flag', /--postgres-plan/],
      ['persistence output', /\bpersistence:\s*packet\.persistence\b/],
    ],
    recommended_fix: 'Keep the local contract script on the canonical service and readback adapter.',
  });

  const report = writeWatchdogReport({
    kind: 'raw-intake-drift',
    title: 'Raw Intake Drift Watchdog',
    summaryLines: [
      `Raw fallback files: ${rawFiles.length}`,
      `Memory files: ${memoryFiles.length}`,
      `Requirement registers: ${registers.length}`,
      `Canonical intake contract checks: ${canonicalContracts.reduce((sum, item) => sum + item.checked, 0)}`,
    ],
    findings,
    extraSections: [
      {
        title: 'Canonical Intake Contract Checks',
        lines: canonicalContracts.map((item) => (
          `- ${item.ok ? 'PASS' : 'FAIL'} ${item.label}: ${item.file}${item.missing.length ? ` missing ${item.missing.join(', ')}` : ''}`
        )),
      },
    ],
  });
  const severity = overallSeverity(findings);
  return {
    ok: !findings.some((finding) => isFailureSeverity(finding.severity)),
    severity,
    findings,
    report,
    canonical_contract_checks: canonicalContracts,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildRawIntakeDriftAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
