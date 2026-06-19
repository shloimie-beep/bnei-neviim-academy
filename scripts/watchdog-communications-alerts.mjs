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

export function buildCommunicationsAlertAudit() {
  const findings = [];
  const parsed = parseIntakeText({
    raw_input: 'Urgent parent WhatsApp: the student cannot log in and tuition payment receipt needs follow up today.',
    source_type: 'wapi',
    source_date: '2026-06-17',
  });
  if (!parsed.communications?.length) {
    addFinding(findings, {
      severity: 'high',
      category: 'communications-alerts',
      title: 'Communication fixture did not create communications lane',
      details: 'Parent/accountability/payment/provider signals must not be buried as generic tasks.',
      evidence: ['communications fixture'],
      recommended_fix: 'Harden communication detection in intake-parser.',
      goal_ids: ['GOAL-CORE-008', 'GOAL-CORE-013'],
    });
  }
  if (!parsed.alerts?.length) {
    addFinding(findings, {
      severity: 'high',
      category: 'communications-alerts',
      title: 'Important communication did not create alert',
      details: 'Important inbound signals need an alert/follow-up item with a redacted summary.',
      evidence: ['urgent parent WhatsApp fixture'],
      recommended_fix: 'Create alert records for important communication signals.',
      goal_ids: ['GOAL-CORE-013'],
    });
  }
  const report = writeWatchdogReport({
    kind: 'communications-alerts',
    title: 'Communications Alert Watchdog',
    summaryLines: [`Fixture summary: ${parsed.summary}`],
    findings,
    extraSections: [{
      title: 'Fixture Counts',
      lines: [
        `- communications: ${parsed.communications?.length || 0}`,
        `- alerts: ${parsed.alerts?.length || 0}`,
        `- tasks: ${parsed.tasks?.length || 0}`,
      ],
    }],
  });
  const severity = overallSeverity(findings);
  return { ok: !findings.some((finding) => isFailureSeverity(finding.severity)), severity, findings, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildCommunicationsAlertAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
