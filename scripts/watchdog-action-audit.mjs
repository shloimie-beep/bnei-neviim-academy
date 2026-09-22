#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addFinding,
  isFailureSeverity,
  overallSeverity,
  printCliResult,
  readJson,
  readText,
  relative,
  repoRoot,
  writeWatchdogReport,
} from './lib/watchdog-common.mjs';

const REQUIRED_FIELDS = ['action_id', 'label', 'route', 'expected_behavior', 'permission', 'status'];

function actionRowsFromRegistry(registry = {}) {
  if (Array.isArray(registry)) return registry;
  if (Array.isArray(registry.actions)) return registry.actions;
  return [];
}

function collectRegisteredActionIds(rows = []) {
  return new Set(rows.map((row) => String(row.action_id || row.id || row.name || '').trim()).filter(Boolean));
}

function collectHtmlActionIds(htmlByPath = {}) {
  const ids = [];
  for (const [filePath, html] of Object.entries(htmlByPath)) {
    const patterns = [
      /\bdata-action-id=["']([^"']+)["']/gi,
      /\bdata-watchdog-action=["']([^"']+)["']/gi,
      /\bdata-helper-action=["']([^"']+)["']/gi,
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html))) {
        ids.push({ filePath, action_id: match[1] });
      }
    }
  }
  return ids;
}

export function buildActionAudit({
  registryPath = path.join(repoRoot, 'ops', 'action-registry.json'),
  detailedRegistryPath = path.join(repoRoot, 'ops', 'action-registry', 'actions.json'),
  htmlPaths = [
    path.join(repoRoot, 'public', 'operations.html'),
    path.join(repoRoot, 'public', 'parent.html'),
    path.join(repoRoot, 'public', 'student.html'),
    path.join(repoRoot, 'public', 'provider.html'),
    path.join(repoRoot, 'public', 'index.html'),
  ],
} = {}) {
  const findings = [];
  const registry = readJson(registryPath, null);
  const detailed = readJson(detailedRegistryPath, []);
  if (!registry) {
    addFinding(findings, {
      severity: 'high',
      category: 'action-registry',
      title: 'Action registry missing',
      details: `${relative(registryPath)} could not be read.`,
      evidence: [relative(registryPath)],
      recommended_fix: 'Create ops/action-registry.json with visible action rows.',
      goal_ids: ['GOAL-CORE-002'],
    });
  }
  const rows = actionRowsFromRegistry(registry || {});
  if (registry && !rows.length) {
    addFinding(findings, {
      severity: 'high',
      category: 'action-registry',
      title: 'Action registry has no actions',
      details: 'The root action registry must contain an actions array.',
      evidence: [relative(registryPath)],
      recommended_fix: 'Add action rows or point the registry at the detailed action map.',
      goal_ids: ['GOAL-CORE-002'],
    });
  }
  rows.forEach((row, index) => {
    const missing = REQUIRED_FIELDS.filter((field) => !String(row[field] ?? '').trim());
    if (missing.length) {
      addFinding(findings, {
        severity: 'medium',
        category: 'action-registry',
        title: `Action row ${row.action_id || index + 1} missing fields`,
        details: `Missing fields: ${missing.join(', ')}`,
        evidence: [row.action_id || `row ${index + 1}`],
        recommended_fix: 'Fill route, selector/action hint, behavior, permission, status, and test/handler data.',
        goal_ids: ['GOAL-CORE-002'],
      });
    }
    const status = String(row.status || '').toLowerCase();
    const hasExecutionTarget = row.handler || row.api_route || row.helper_tool || row.test || row.expected_behavior || row.disabled_reason || row.coming_soon_reason;
    if (status === 'active' && !hasExecutionTarget) {
      addFinding(findings, {
        severity: 'high',
        category: 'action-registry',
        title: `Active action ${row.action_id || index + 1} lacks an execution target`,
        details: 'Active visible actions need a handler, API route, helper tool, test expectation, or explicit disabled/coming-soon reason.',
        evidence: [row.action_id || `row ${index + 1}`],
        recommended_fix: 'Wire the action or mark it disabled/coming soon with a reason.',
        goal_ids: ['GOAL-CORE-002', 'GOAL-CORE-010'],
      });
    }
  });

  const registered = collectRegisteredActionIds(rows);
  if (Array.isArray(detailed)) {
    for (const row of detailed) {
      const id = String(row.action_id || '').trim();
      if (id) registered.add(id);
    }
  }

  const htmlByPath = {};
  for (const filePath of htmlPaths) {
    if (fs.existsSync(filePath)) htmlByPath[filePath] = readText(filePath);
  }
  for (const item of collectHtmlActionIds(htmlByPath)) {
    if (!registered.has(item.action_id)) {
      addFinding(findings, {
        severity: 'high',
        category: 'action-registry',
        title: `Visible action ${item.action_id} is not registered`,
        details: 'A visible data-action-id/data-watchdog-action/data-helper-action must be present in the action registry.',
        evidence: [`${relative(item.filePath)} -> ${item.action_id}`],
        recommended_fix: 'Add an action registry row with selector, behavior, handler/tool, scope, and verification.',
        goal_ids: ['GOAL-CORE-002'],
        repair_task: `WATCH action issue ${item.action_id}: register or disable with reason.`,
      });
    }
  }

  const report = writeWatchdogReport({
    kind: 'watchdog-action-audit',
    title: 'Watchdog Action Audit',
    summaryLines: [
      `Root actions: ${rows.length}`,
      `Detailed registry rows: ${Array.isArray(detailed) ? detailed.length : 0}`,
      `HTML files scanned: ${Object.keys(htmlByPath).length}`,
    ],
    findings,
  });
  const severity = overallSeverity(findings);
  return {
    ok: !findings.some((finding) => isFailureSeverity(finding.severity)),
    severity,
    findings,
    report,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildActionAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
