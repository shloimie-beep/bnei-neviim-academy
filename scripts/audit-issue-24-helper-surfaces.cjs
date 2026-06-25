#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const { buildIssue24HelperAudit } = require('../src/lib/bna/issue24-helper-audit');

const repoRoot = path.resolve(__dirname, '..');
const outDirArg = process.argv.includes('--out-dir')
  ? process.argv[process.argv.indexOf('--out-dir') + 1]
  : 'ops/helper-audits/2026-06-25-issue-24';
const outDir = path.resolve(repoRoot, outDirArg);

function slash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function rel(file) {
  return slash(path.relative(repoRoot, file));
}

function markdown(audit) {
  const surfaceRows = audit.surfaces.map((surface) => (
    `| ${surface.key} | ${surface.endpoint} | ${surface.identity_resolution} | ${surface.workspace_resolution} | ${surface.permission_check} | ${surface.response_source} |`
  ));
  const roleRows = audit.conversation_library.roles.map((role) => (
    `| ${role} | ${audit.conversation_library.single_turn_per_role[role]} | ${audit.conversation_library.multi_turn_per_role[role]} |`
  ));
  const failures = audit.evaluation.needs_repair.map((item) => (
    `- ${item.case_id}: ${item.resolver?.reason || 'unknown'}`
  ));
  return [
    '# Issue #24 Helper Surface Audit',
    '',
    `Generated: ${audit.generated_at}`,
    `Requirement: ${audit.audit_id}`,
    `Source: ${audit.source_raw_id}`,
    `Parent goal: ${audit.parent_goal_id}`,
    '',
    audit.scope_note,
    '',
    '## Surface Inventory',
    '',
    '| Surface | Endpoint | Identity | Workspace | Permission Check | Response Source |',
    '|---|---|---|---|---|---|',
    ...surfaceRows,
    '',
    '## Conversation Pack Counts',
    '',
    '| Role | Single-turn cases | Multi-turn conversations |',
    '|---|---:|---:|',
    ...roleRows,
    '',
    '## Static Resolver Evaluation',
    '',
    `- Static route/action resolver pass rate: ${audit.acceptance_summary.static_resolver_pass_rate}`,
    `- Helper surfaces inventoried: ${audit.acceptance_summary.helper_surfaces_inventoried}`,
    `- Portal roles with at least 25 cases: ${audit.acceptance_summary.portal_roles_with_25_cases}/${audit.conversation_library.roles.length}`,
    `- Portal roles with at least 10 multi-turn conversations: ${audit.acceptance_summary.portal_roles_with_10_multi_turn}/${audit.conversation_library.roles.length}`,
    `- Live Agent Mode/browser evidence required: ${audit.acceptance_summary.live_agent_mode_required ? 'yes' : 'no'}`,
    '',
    '## Static Failures',
    '',
    failures.length ? failures.join('\n') : '- None in static resolver evaluation.',
    '',
  ].join('\n');
}

const audit = buildIssue24HelperAudit();
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'HELPER-SURFACE-AUDIT.json');
const mdPath = path.join(outDir, 'HELPER-SURFACE-AUDIT.md');
fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
fs.writeFileSync(mdPath, markdown(audit));

console.log(JSON.stringify({
  ok: audit.evaluation.needs_repair.length === 0,
  surfaces: audit.acceptance_summary.helper_surfaces_inventoried,
  single_turn_roles: audit.acceptance_summary.portal_roles_with_25_cases,
  multi_turn_roles: audit.acceptance_summary.portal_roles_with_10_multi_turn,
  static_resolver_pass_rate: audit.acceptance_summary.static_resolver_pass_rate,
  live_agent_mode_required: audit.acceptance_summary.live_agent_mode_required,
  json: rel(jsonPath),
  markdown: rel(mdPath),
}, null, 2));

if (audit.evaluation.needs_repair.length) process.exitCode = 1;
