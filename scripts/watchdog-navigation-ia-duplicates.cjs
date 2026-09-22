#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const { buildNavigationIaAudit } = require('../src/lib/bna/issue24-navigation-ia');

const repoRoot = path.resolve(__dirname, '..');
const outDirArg = process.argv.includes('--out-dir')
  ? process.argv[process.argv.indexOf('--out-dir') + 1]
  : 'ops/navigation-ia/2026-06-25-issue-24';
const outDir = path.resolve(repoRoot, outDirArg);

function slash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function rel(file) {
  return slash(path.relative(repoRoot, file));
}

function markdown(audit) {
  const inventoryRows = audit.inventory.map((surface) => (
    `| ${surface.surface} | ${surface.route} | ${Array.isArray(surface.side_nav) ? surface.side_nav.join(', ') : surface.side_nav} | ${Array.isArray(surface.horizontal_tabs) ? surface.horizontal_tabs.join(', ') : surface.horizontal_tabs} | ${Array.isArray(surface.mobile_menu) ? surface.mobile_menu.join(', ') : surface.mobile_menu} |`
  ));
  const findings = audit.findings.map((finding) => (
    `- ${finding.type}: ${finding.label || finding.level || finding.module} (${finding.first_id || finding.main_nav_id || ''} / ${finding.duplicate_id || finding.tab_id || ''})`
  ));
  return [
    '# Issue #24 Navigation IA Duplicate Watchdog',
    '',
    `Generated: ${audit.generated_at}`,
    `Requirement: ${audit.audit_id}`,
    `Source: ${audit.source_raw_id}`,
    '',
    `Rule: ${audit.permanent_rule}`,
    '',
    '## Inventory',
    '',
    '| Surface | Route | Side nav | Horizontal tabs | Mobile menu |',
    '|---|---|---|---|---|',
    ...inventoryRows,
    '',
    '## Fixes Implemented',
    '',
    ...audit.fixes_implemented.map((item) => `- ${item}`),
    '',
    '## Findings',
    '',
    findings.length ? findings.join('\n') : '- None. Same-level duplicate labels and side/horizontal major-module repeats passed.',
    '',
  ].join('\n');
}

const audit = buildNavigationIaAudit({ root: repoRoot });
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'NAVIGATION-IA-AUDIT.json');
const mdPath = path.join(outDir, 'NAVIGATION-IA-AUDIT.md');
fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
fs.writeFileSync(mdPath, markdown(audit));

console.log(JSON.stringify({
  ok: audit.ok,
  findings: audit.findings.length,
  operations_main_nav: audit.operations.main_nav.length,
  operations_task_tabs: audit.operations.horizontal_tabs.tasks.length,
  json: rel(jsonPath),
  markdown: rel(mdPath),
}, null, 2));

if (!audit.ok) process.exitCode = 1;
