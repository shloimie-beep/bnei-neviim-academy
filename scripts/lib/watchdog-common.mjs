import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const repoRoot = path.resolve(path.dirname(__filename), '..', '..');

export function readText(filePath, fallback = '') {
  try {
    return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  } catch {
    return fallback;
  }
}

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(readText(filePath));
  } catch {
    return fallback;
  }
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

export function stampForFile(date = new Date()) {
  return date.toISOString().slice(0, 16).replace(/:/g, '-');
}

export function compact(value = '', max = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function addFinding(findings, {
  severity = 'info',
  category = 'watchdog',
  title = 'Watchdog finding',
  details = '',
  evidence = [],
  recommended_fix = '',
  goal_ids = [],
  repair_task = null,
} = {}) {
  findings.push({
    severity,
    category,
    title,
    details: compact(details, 900),
    evidence: evidence.filter(Boolean).map((item) => compact(item, 260)),
    recommended_fix: compact(recommended_fix, 500),
    goal_ids,
    repair_task,
  });
}

export function severityRank(severity = '') {
  return { critical: 5, high: 4, medium: 3, low: 2, warning: 2, info: 1, ok: 0 }[String(severity).toLowerCase()] ?? 1;
}

export function overallSeverity(findings = []) {
  return findings.reduce((worst, finding) => (
    severityRank(finding.severity) > severityRank(worst) ? finding.severity : worst
  ), 'ok');
}

export function isFailureSeverity(severity = '') {
  return severityRank(severity) >= severityRank('high');
}

export function walkFiles(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'docs'].includes(entry.name)) out.push(...walkFiles(full, predicate));
    } else if (entry.isFile() && predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

export function watchdogReportPath(kind, date = new Date()) {
  const dir = path.join(repoRoot, 'ops', 'watchdog-audits');
  ensureDir(dir);
  return path.join(dir, `${stampForFile(date)}-${kind}.md`);
}

export function writeWatchdogReport({ kind, title, summaryLines = [], findings = [], extraSections = [] }) {
  const reportPath = watchdogReportPath(kind);
  const severity = overallSeverity(findings);
  const lines = [
    `# ${title}`,
    '',
    `Generated at ${new Date().toISOString()}.`,
    '',
    'This watchdog is local-safe and read-only except for writing this report.',
    '',
    '## Summary',
    '',
    `- Severity: ${severity}`,
    `- Findings: ${findings.length}`,
    ...summaryLines.map((line) => `- ${line}`),
    '',
    '## Findings',
    '',
  ];
  if (!findings.length) {
    lines.push('- None.');
  } else {
    for (const finding of findings) {
      lines.push(`- **${String(finding.severity || 'info').toUpperCase()}** ${finding.title}: ${finding.details}`);
      if (finding.goal_ids?.length) lines.push(`  Goals: ${finding.goal_ids.join(', ')}`);
      if (finding.evidence?.length) lines.push(`  Evidence: ${finding.evidence.join(' | ')}`);
      if (finding.recommended_fix) lines.push(`  Fix: ${finding.recommended_fix}`);
      if (finding.repair_task) lines.push(`  Repair: ${finding.repair_task}`);
    }
  }
  for (const section of extraSections) {
    lines.push('', `## ${section.title}`, '', ...(section.lines?.length ? section.lines : ['- None.']));
  }
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  return reportPath;
}

export function printCliResult(audit) {
  console.log(JSON.stringify({
    ok: audit.ok,
    severity: audit.severity,
    finding_count: audit.findings.length,
    report: audit.report ? relative(audit.report) : null,
  }, null, 2));
}
