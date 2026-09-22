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

export function buildLinkAudit({
  routeRegistryPath = path.join(repoRoot, 'ops', 'route-registry.json'),
  htmlPaths = [
    path.join(repoRoot, 'public', 'index.html'),
    path.join(repoRoot, 'public', 'parent-login.html'),
    path.join(repoRoot, 'public', 'parent.html'),
    path.join(repoRoot, 'public', 'student.html'),
    path.join(repoRoot, 'public', 'provider.html'),
    path.join(repoRoot, 'public', 'operations.html'),
  ],
} = {}) {
  const findings = [];
  const registry = readJson(routeRegistryPath, null);
  const routes = Array.isArray(registry?.routes) ? registry.routes : [];
  if (!routes.length) {
    addFinding(findings, {
      severity: 'high',
      category: 'route-registry',
      title: 'Route registry missing or empty',
      details: 'ops/route-registry.json must declare public, portal, Operations, API, alias, and manifest routes.',
      evidence: [relative(routeRegistryPath)],
      recommended_fix: 'Add route rows with access, scope, and expected logged-out behavior.',
      goal_ids: ['GOAL-CORE-003', 'GOAL-CORE-006'],
    });
  }

  const routePatterns = routes.map((route) => String(route.route || '').split('?')[0]).filter(Boolean);
  routes.forEach((route, index) => {
    for (const field of ['route', 'access', 'expected_logged_out_behavior', 'privacy_risk']) {
      if (!String(route[field] ?? '').trim()) {
        addFinding(findings, {
          severity: 'medium',
          category: 'route-registry',
          title: `Route row ${route.route || index + 1} missing ${field}`,
          details: 'Every route row needs access, scope, expected behavior, and privacy metadata.',
          evidence: [route.route || `row ${index + 1}`],
          recommended_fix: 'Fill the route registry fields before relying on route watchdogs.',
          goal_ids: ['GOAL-CORE-003', 'GOAL-CORE-006'],
        });
      }
    }
  });

  const hrefs = [];
  for (const filePath of htmlPaths) {
    if (!fs.existsSync(filePath)) continue;
    const html = readText(filePath);
    let match;
    const pattern = /\bhref=["']([^"']+)["']/gi;
    while ((match = pattern.exec(html))) {
      const href = match[1];
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const route = href.split('#')[0].split('?')[0] || '/';
      hrefs.push({ filePath, href, route });
    }
  }

  for (const item of hrefs) {
    if (!routeIsRegistered(item.route, routePatterns) && !/\.(css|js|png|jpg|jpeg|webp|svg|ico|json|txt|xml)$/i.test(item.route)) {
      addFinding(findings, {
        severity: 'medium',
        category: 'route-registry',
        title: `Linked route ${item.route} is not in route registry`,
        details: 'Internal links should be declared so privacy and logged-out behavior can be audited.',
        evidence: [`${relative(item.filePath)} -> ${item.href}`],
        recommended_fix: 'Add the linked route to ops/route-registry.json or correct the href.',
        goal_ids: ['GOAL-CORE-003'],
      });
    }
  }

  const report = writeWatchdogReport({
    kind: 'watchdog-link-audit',
    title: 'Watchdog Link Audit',
    summaryLines: [
      `Registered routes: ${routes.length}`,
      `Internal hrefs scanned: ${hrefs.length}`,
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

function routeIsRegistered(route = '', registeredRoutes = []) {
  if (registeredRoutes.includes(route)) return true;
  const valueParts = String(route || '').split('/').filter(Boolean);
  return registeredRoutes.some((candidate) => {
    const candidateParts = String(candidate || '').split('/').filter(Boolean);
    if (candidateParts.length !== valueParts.length) return false;
    return candidateParts.every((part, index) => {
      if (part.startsWith(':')) return true;
      if (/\$\{/.test(valueParts[index])) return true;
      return part === valueParts[index];
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildLinkAudit();
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
