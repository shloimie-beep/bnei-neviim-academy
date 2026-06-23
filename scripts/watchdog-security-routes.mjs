#!/usr/bin/env node
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

export function buildRouteSecurityAudit({
  routeRegistryPath = path.join(repoRoot, 'ops', 'route-registry.json'),
  serverPath = path.join(repoRoot, 'server.js'),
} = {}) {
  const findings = [];
  const registry = readJson(routeRegistryPath, null);
  const routes = Array.isArray(registry?.routes) ? registry.routes : [];
  const server = readText(serverPath);

  if (!routes.length) {
    addFinding(findings, {
      severity: 'high',
      category: 'route-security',
      title: 'No route registry rows to audit',
      details: 'Route security cannot run without ops/route-registry.json rows.',
      evidence: [relative(routeRegistryPath)],
      recommended_fix: 'Create route registry rows for public/private/API routes.',
      goal_ids: ['GOAL-CORE-006'],
    });
  }

  for (const route of routes) {
    const routePath = String(route.route || '');
    const access = String(route.access || '').toLowerCase();
    const publicAllowed = Boolean(route.public_allowed);
    const loggedOut = String(route.expected_logged_out_behavior || '').toLowerCase();
    if (access === 'private' && publicAllowed) {
      addFinding(findings, {
        severity: 'critical',
        category: 'route-security',
        title: `Private route ${routePath} is marked public_allowed`,
        details: 'Private routes must not be public_allowed.',
        evidence: [routePath],
        recommended_fix: 'Set public_allowed false and document login/wrong-scope behavior.',
        goal_ids: ['GOAL-CORE-006'],
      });
    }
    if (access === 'private' && !/(login|redirect|anonymous|shell|reject|unauthorized|forbid)/.test(loggedOut)) {
      addFinding(findings, {
        severity: 'high',
        category: 'route-security',
        title: `Private route ${routePath} lacks safe logged-out behavior`,
        details: 'Private route rows must say how anonymous users are rejected or shown a private-data-free shell.',
        evidence: [routePath, route.expected_logged_out_behavior || 'missing'],
        recommended_fix: 'Document redirect/login/rejection behavior and verify it in smoke tests.',
        goal_ids: ['GOAL-CORE-006'],
      });
    }
    if (String(route.privacy_risk || '').toLowerCase() === 'critical' && !route.related_goal_ids?.includes('GOAL-CORE-006')) {
      addFinding(findings, {
        severity: 'medium',
        category: 'route-security',
        title: `Critical privacy route ${routePath} is not linked to GOAL-CORE-006`,
        details: 'Critical privacy routes must link to the no-privacy-leaks standing goal.',
        evidence: [routePath],
        recommended_fix: 'Add GOAL-CORE-006 to related_goal_ids.',
        goal_ids: ['GOAL-CORE-006'],
      });
    }
  }

  if (!/requireAdmin|assertWorkspaceAccess|requireParent|requireStudent|requireProvider/i.test(server)) {
    addFinding(findings, {
      severity: 'high',
      category: 'route-security',
      title: 'Server auth guards were not found',
      details: 'The server should expose route guard markers for private Operations/portal APIs.',
      evidence: [relative(serverPath)],
      recommended_fix: 'Verify server auth middleware names or add explicit route guard checks.',
      goal_ids: ['GOAL-CORE-006', 'GOAL-CORE-009'],
    });
  }

  const report = writeWatchdogReport({
    kind: 'watchdog-security-routes',
    title: 'Watchdog Security Route Audit',
    summaryLines: [`Registered routes: ${routes.length}`],
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
  const audit = buildRouteSecurityAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
