#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import {
  addFinding,
  isFailureSeverity,
  overallSeverity,
  printCliResult,
  writeWatchdogReport,
} from './lib/watchdog-common.mjs';

const require = createRequire(import.meta.url);
const { parseIntakeText } = require('../src/lib/bna/intake-parser');

export function buildContentRoutingAudit() {
  const findings = [];
  const parsed = parseIntakeText({
    raw_input: [
      'Class recording: Rabbi Scheller taught Mishnah Berachos and a pasuk source.',
      'A student asked why the Mishnah changes language?',
      'Research: find sources from Rashi and Gemara for the worksheet.',
      'Route this to the One Time Mishnah workspace.',
    ].join(' '),
    source_type: 'class_recording',
    workspace_key: 'one_time_mishnah_class',
    source_date: '2026-06-17',
  });
  const expectations = [
    ['class_session_notes', parsed.class_session_notes],
    ['student_questions', parsed.student_questions],
    ['research_items', parsed.research_items],
    ['workspace_routing', parsed.workspace_routing],
  ];
  for (const [lane, rows] of expectations) {
    if (!rows?.length) {
      addFinding(findings, {
        severity: 'high',
        category: 'content-routing',
        title: `Parser dropped ${lane} from class recording fixture`,
        details: 'Class recordings must parse into class, student-question, research, and workspace-routing lanes.',
        evidence: [`fixture lane ${lane}`],
        recommended_fix: `Harden intake-parser ${lane} detection and add a regression fixture.`,
        goal_ids: ['GOAL-CORE-008', 'GOAL-CORE-011', 'GOAL-CORE-012'],
      });
    }
  }
  const report = writeWatchdogReport({
    kind: 'content-routing',
    title: 'Content/Class/Research Routing Watchdog',
    summaryLines: [`Fixture summary: ${parsed.summary}`],
    findings,
    extraSections: [{
      title: 'Fixture Counts',
      lines: expectations.map(([lane, rows]) => `- ${lane}: ${rows?.length || 0}`),
    }],
  });
  const severity = overallSeverity(findings);
  return { ok: !findings.some((finding) => isFailureSeverity(finding.severity)), severity, findings, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildContentRoutingAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
