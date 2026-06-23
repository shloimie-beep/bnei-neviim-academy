#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addFinding,
  isFailureSeverity,
  overallSeverity,
  printCliResult,
  readText,
  repoRoot,
  writeWatchdogReport,
} from './lib/watchdog-common.mjs';

export function buildVisualBaselineAudit() {
  const findings = [];
  const cssFiles = [
    'public/css/bna-app-shell.css',
    'public/css/bna-site-nav.css',
  ];
  let colorText = '';
  for (const file of cssFiles) colorText += `\n/* ${file} */\n${readText(path.join(repoRoot, file))}`;
  const purpleHits = (colorText.match(/purple|violet|indigo|#6d|#7c|#8b/gi) || []).length;
  const beigeHits = (colorText.match(/beige|tan|sand|cream|#f5f0|#f8f1|#fff7/gi) || []).length;
  if (purpleHits > 45) {
    addFinding(findings, {
      severity: 'medium',
      category: 'visual-baseline',
      title: 'Palette may be overly purple/indigo',
      details: `Static CSS scan found ${purpleHits} purple/indigo-like tokens.`,
      evidence: cssFiles,
      recommended_fix: 'Review affected screens and diversify the palette if the UI reads one-note.',
      goal_ids: ['GOAL-CORE-001'],
    });
  }
  if (beigeHits > 45) {
    addFinding(findings, {
      severity: 'medium',
      category: 'visual-baseline',
      title: 'Palette may be overly beige/cream',
      details: `Static CSS scan found ${beigeHits} beige/cream-like tokens.`,
      evidence: cssFiles,
      recommended_fix: 'Review affected screens and diversify the palette if the UI reads one-note.',
      goal_ids: ['GOAL-CORE-001'],
    });
  }
  if (/letter-spacing:\s*-\d/i.test(colorText)) {
    addFinding(findings, {
      severity: 'high',
      category: 'visual-baseline',
      title: 'Negative letter spacing detected',
      details: 'Design rules require letter spacing to be 0, not negative.',
      evidence: cssFiles,
      recommended_fix: 'Remove negative letter spacing from UI CSS.',
      goal_ids: ['GOAL-CORE-001'],
    });
  }
  const report = writeWatchdogReport({
    kind: 'watchdog-visual-baseline',
    title: 'Watchdog Visual Baseline',
    summaryLines: [`CSS files scanned: ${cssFiles.length}`],
    findings,
  });
  const severity = overallSeverity(findings);
  return { ok: !findings.some((finding) => isFailureSeverity(finding.severity)), severity, findings, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildVisualBaselineAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
