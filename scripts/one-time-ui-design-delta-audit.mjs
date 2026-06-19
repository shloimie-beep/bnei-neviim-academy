#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT_DIR = path.join(repoRoot, 'ops', 'ui-audits', '2026-06-19-one-time-ui-design-delta');

const REQUIRED_SURFACES = [
  ['operations_overview', 'Operations overview', 'dashboard'],
  ['operations_tasks', 'Operations tasks and decisions', 'tasks'],
  ['contacts', 'Contacts', 'contacts'],
  ['communications', 'Communications', 'communications'],
  ['whatsapp', 'WhatsApp', 'communications'],
  ['email', 'Email', 'communications'],
  ['community', 'Community', 'community'],
  ['content', 'Content', 'content'],
  ['live_classes', 'Live Classes', 'live_classes'],
  ['schedule', 'Schedule', 'calendar'],
  ['integrations', 'Integrations', 'integrations'],
  ['settings', 'Settings', 'settings'],
  ['agents', 'Agents', 'agents'],
  ['one_time_public', 'One Time public pages', 'public/one-time'],
  ['parent_portal', 'Parent portal', 'public/parent.html'],
  ['student_portal', 'Student portal', 'public/student.html'],
  ['provider_portal', 'Provider portal', 'public/provider.html'],
  ['member_library', 'Member library', 'members'],
  ['classroom', 'Classroom', 'one-time-classroom.html'],
];

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function addCheck(checks, check) {
  checks.push({
    status: 'pass',
    severity: 'info',
    evidence: [],
    ...check,
  });
}

function patternStatus(text, pattern) {
  return pattern.test(text) ? 'pass' : 'warn';
}

function allPatternsStatus(text, patterns) {
  return patterns.every((pattern) => pattern.test(text)) ? 'pass' : 'warn';
}

function buildOneTimeUiDesignDeltaAudit({ outputDir = DEFAULT_OUTPUT_DIR, write = true } = {}) {
  const operations = readText('public/operations.html');
  const shellCss = readText('public/css/bna-app-shell.css');
  const parentHtml = readText('public/parent.html');
  const studentHtml = readText('public/student.html');
  const providerHtml = readText('public/provider.html');
  const checks = [];

  addCheck(checks, {
    id: 'prior_ui_closeout_available',
    title: 'Prior UI closeout proof is available',
    status: fileExists('ops/ui-audits/2026-06-16-ui-closeout.md') ? 'pass' : 'warn',
    evidence: ['ops/ui-audits/2026-06-16-ui-closeout.md', 'ops/ui-audits/2026-06-16/'],
  });

  addCheck(checks, {
    id: 'current_one_time_smoke_available',
    title: 'Current One Time Operations UI smoke evidence exists',
    status: fileExists('ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json') ? 'pass' : 'warn',
    evidence: [
      'ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md',
      'ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json',
    ],
  });

  addCheck(checks, {
    id: 'ops_audit_storage_state',
    title: 'Authenticated Operations audit storage state',
    status: fileExists('.runtime/auth/operations-storage-state.json') ? 'pass' : 'blocked',
    severity: fileExists('.runtime/auth/operations-storage-state.json') ? 'info' : 'medium',
    evidence: ['.runtime/auth/operations-storage-state.json'],
    details: fileExists('.runtime/auth/operations-storage-state.json')
      ? 'Storage state exists for a full authenticated audit crawl.'
      : 'Full authenticated ops:audit crawl is blocked until a local Operations storage state is created through npm run ops:audit:auth.',
  });

  addCheck(checks, {
    id: 'top_toolbar_contract',
    title: 'Top toolbar contract',
    status: patternStatus(operations, /class="ops-brand-topbar saas-topbar"[\s\S]*renderWorkspaceContextStrip/),
    evidence: ['public/operations.html'],
    details: 'Operations keeps a branded topbar with workspace context.',
  });

  addCheck(checks, {
    id: 'module_toolbar_contract',
    title: 'Module toolbar contract',
    status: patternStatus(operations, /data-module-toolbar-priority="\$\{MODULE_TOOLBAR_PRIORITY\.join\(','\)\}"[\s\S]*data-module-toolbar-id/),
    evidence: ['public/operations.html'],
    details: 'Operations exposes a stable module toolbar with data IDs for testing and navigation.',
  });

  addCheck(checks, {
    id: 'module_toolbar_mobile_scroll',
    title: 'Module toolbar mobile scroll',
    status: patternStatus(operations, /@media \(max-width: 900px\)[\s\S]*\.ops-module-toolbar-track\s*{[\s\S]*overflow-x:\s*auto/),
    evidence: ['public/operations.html'],
    details: 'Module toolbar scrolls horizontally on smaller screens instead of forcing page overflow.',
  });

  addCheck(checks, {
    id: 'button_tap_target_contract',
    title: 'Button tap target and wrapping contract',
    status: allPatternsStatus(shellCss, [
      /body\.bna-ops-shell-page \.task-action,[\s\S]*min-height:\s*40px/,
      /body\.bna-ops-shell-page \.task-action,[\s\S]*white-space:\s*normal/,
      /body\.bna-ops-shell-page \.task-action,[\s\S]*overflow-wrap:\s*anywhere/,
    ]),
    evidence: ['public/css/bna-app-shell.css'],
    details: 'Shared shell CSS gives Operations actions mobile-safe height and wrapping behavior.',
  });

  addCheck(checks, {
    id: 'filter_dropdown_contract',
    title: 'Filter dropdown contract',
    status: allPatternsStatus(operations, [
      /function toggleFilterDropdown/,
      /\.filter-dropdown-menu\s*{[\s\S]*position:\s*fixed/,
      /\.filter-dropdown-menu\s*{[\s\S]*z-index:\s*5000/,
    ]),
    evidence: ['public/operations.html'],
    details: 'Filter menus are fixed-position, high z-index overlays and use shared toggle behavior.',
  });

  addCheck(checks, {
    id: 'cards_lists_states',
    title: 'Cards, lists, empty, loading, and error states',
    status: allPatternsStatus(operations, [
      /\.content-card/,
      /\.task-row/,
      /\.loading/,
      /\.error-banner/,
      /\.empty-state/,
    ]),
    evidence: ['public/operations.html'],
    details: 'Operations defines shared list/card surfaces and basic loading, error, and empty states.',
  });

  addCheck(checks, {
    id: 'horizontal_overflow_guard',
    title: 'Horizontal overflow guard',
    status: patternStatus(shellCss, /html,[\s\S]*body\.bna-ops-shell-page\s*{[\s\S]*overflow-x:\s*hidden/),
    evidence: ['public/css/bna-app-shell.css'],
    details: 'Page-level horizontal overflow is hidden while tables may intentionally scroll.',
  });

  addCheck(checks, {
    id: 'portal_mobile_shells',
    title: 'Portal mobile shells',
    status: parentHtml.includes('bna-parent-page') && studentHtml.includes('bna-student-page') && providerHtml.includes('bna-provider-page') ? 'pass' : 'warn',
    evidence: ['public/parent.html', 'public/student.html', 'public/provider.html'],
    details: 'Parent, student, and provider portals use the shared BNA shell classes.',
  });

  const surfaceChecks = REQUIRED_SURFACES.map(([id, label, marker]) => {
    let status = 'pass';
    let evidence = ['public/operations.html'];
    if (marker.startsWith('public/')) {
      status = fileExists(marker) ? 'pass' : 'warn';
      evidence = [marker];
    } else if (marker === 'public/one-time') {
      status = /one-time|rabbi|mishnah/i.test(operations) || fileExists('public/one-time.html') ? 'pass' : 'warn';
      evidence = ['public/operations.html', 'public/rabbi.html'];
    } else if (marker === 'one-time-classroom.html') {
      status = fileExists('public/one-time-classroom.html') ? 'pass' : 'warn';
      evidence = ['public/one-time-classroom.html'];
    } else {
      status = operations.includes(marker) ? 'pass' : 'warn';
    }
    return { id, label, marker, status, evidence };
  });

  const rawJsonPatterns = [
    /<pre class="event-meta">\$\{escapeHtml\(JSON\.stringify/,
    /<textarea name="permissions"[\s\S]*JSON\.stringify/,
  ];
  const rawJsonFindings = rawJsonPatterns
    .filter((pattern) => pattern.test(operations))
    .map((pattern) => String(pattern));
  addCheck(checks, {
    id: 'raw_json_review',
    title: 'Raw JSON review',
    status: rawJsonFindings.length ? 'warn' : 'pass',
    severity: rawJsonFindings.length ? 'low' : 'info',
    evidence: ['public/operations.html'],
    details: rawJsonFindings.length
      ? 'Admin/debug-adjacent JSON presentations remain in advanced panels and should be reviewed in a future UI polish pass.'
      : 'No obvious raw JSON presentation patterns found.',
    findings: rawJsonFindings,
  });

  const blockers = checks.filter((check) => check.status === 'blocked');
  const warnings = checks.filter((check) => check.status === 'warn');
  const status = blockers.length ? 'needs_operator_decision' : warnings.length ? 'needs_review' : 'pass';
  const audit = {
    generated_at: new Date().toISOString(),
    requirement_id: 'REQ-20260619-304',
    status,
    external_write_performed: false,
    production_mutation_performed: false,
    authenticated_crawl_performed: false,
    broad_crawl_performed: false,
    required_surfaces: surfaceChecks,
    checks,
    blockers,
    warnings,
    next_requirement: 'REQ-20260619-305',
  };

  if (write) writeAudit(audit, outputDir);
  return audit;
}

function renderMarkdown(audit) {
  const lines = [
    '# One Time UI Design Delta Audit - 2026-06-19',
    '',
    `Requirement: \`${audit.requirement_id}\``,
    `Status: \`${audit.status}\``,
    '',
    'This is a credential-free current-state delta audit. It did not run a full authenticated production crawl, mutate production data, send messages, deploy, or write external systems.',
    '',
    '## Required Surfaces',
    '',
    '| Surface | Status | Evidence |',
    '| --- | --- | --- |',
    ...audit.required_surfaces.map((surface) => `| ${surface.label} | ${surface.status} | ${surface.evidence.join('<br>')} |`),
    '',
    '## Checks',
    '',
    '| Check | Status | Details | Evidence |',
    '| --- | --- | --- | --- |',
    ...audit.checks.map((check) => `| ${check.title} | ${check.status} | ${check.details || ''} | ${(check.evidence || []).join('<br>')} |`),
    '',
    '## Blockers',
    '',
    audit.blockers.length
      ? audit.blockers.map((check) => `- ${check.title}: ${check.details || 'blocked'}`).join('\n')
      : '- None.',
    '',
    '## Warnings',
    '',
    audit.warnings.length
      ? audit.warnings.map((check) => `- ${check.title}: ${check.details || 'review needed'}`).join('\n')
      : '- None.',
    '',
    '## Guardrails',
    '',
    '- External write performed: no.',
    '- Production mutation performed: no.',
    '- Full authenticated crawl performed: no.',
    '- Broad crawl performed: no.',
  ];
  return `${lines.join('\n')}\n`;
}

function writeAudit(audit, outputDir = DEFAULT_OUTPUT_DIR) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'audit.md'), renderMarkdown(audit));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildOneTimeUiDesignDeltaAudit();
  console.log(`One Time UI design delta audit: ${audit.status}`);
  console.log(`Report: ${path.relative(repoRoot, path.join(DEFAULT_OUTPUT_DIR, 'audit.md'))}`);
  if (audit.checks.some((check) => check.status === 'warn' && check.severity === 'high')) {
    process.exitCode = 1;
  }
}

export {
  DEFAULT_OUTPUT_DIR,
  REQUIRED_SURFACES,
  buildOneTimeUiDesignDeltaAudit,
  renderMarkdown,
  writeAudit,
};
