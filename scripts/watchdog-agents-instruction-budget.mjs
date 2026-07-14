#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_PATH = path.join(ROOT, 'AGENTS.md');
const REPORT_DIR = path.join(ROOT, 'ops', 'watchdog-audits');
const MAX_BYTES = 24 * 1024;
const CRITICAL_PATTERNS = [
  /Intent Preservation Gate/,
  /VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS\/EVIDENCE/,
  /docs\/INTENT-PRESERVATION-GATE\.md/,
  /npm run intent:validate/,
  /docs\/BNA-AGENT-OPERATING-GUIDE-FULL\.md/,
  /docs\/AGENTS-MIGRATION-MAP\.md/,
];

function repoPath(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

export function runWatchdog() {
  const text = fs.readFileSync(AGENTS_PATH, 'utf8');
  const byte_count = Buffer.byteLength(text, 'utf8');
  const findings = [];
  if (byte_count > MAX_BYTES) {
    findings.push({
      code: 'AGENTS_ROOT_TOO_LARGE',
      severity: 'P1',
      message: `AGENTS.md is ${byte_count} bytes; budget is ${MAX_BYTES}.`,
    });
  }
  for (const pattern of CRITICAL_PATTERNS) {
    if (!pattern.test(text)) {
      findings.push({
        code: 'AGENTS_CRITICAL_TRIGGER_MISSING',
        severity: 'P0',
        message: `AGENTS.md is missing critical trigger: ${pattern}`,
      });
    }
  }
  const payload = {
    generated_at: new Date().toISOString(),
    agents_path: 'AGENTS.md',
    byte_count,
    max_bytes: MAX_BYTES,
    passed: findings.length === 0,
    findings,
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonPath = path.join(REPORT_DIR, 'latest-agents-instruction-budget.json');
  const mdPath = path.join(REPORT_DIR, 'latest-agents-instruction-budget.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  const lines = [
    '# AGENTS Instruction Budget Watchdog',
    '',
    `Generated: ${payload.generated_at}`,
    `Bytes: ${byte_count}/${MAX_BYTES}`,
    `Passed: ${payload.passed ? 'yes' : 'no'}`,
    '',
  ];
  if (findings.length) {
    for (const finding of findings) {
      lines.push(`- ${finding.severity} ${finding.code}: ${finding.message}`);
    }
  } else {
    lines.push('No findings.');
  }
  fs.writeFileSync(mdPath, `${lines.join('\n').trimEnd()}\n`);
  return { ...payload, report: { json: repoPath(jsonPath), md: repoPath(mdPath) } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = runWatchdog();
  console.log(`AGENTS instruction budget report: ${result.report.md}`);
  process.exitCode = result.passed ? 0 : 1;
}
