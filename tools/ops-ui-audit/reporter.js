const fs = require('node:fs');
const path = require('node:path');

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function writeReports(run, data) {
  fs.mkdirSync(run.dir, { recursive: true });
  writeJson(path.join(run.dir, 'route-map.json'), data.routeMap);
  writeJson(path.join(run.dir, 'state-map.json'), data.stateMap);
  writeJson(path.join(run.dir, 'issues.json'), data.issues);
  writeJson(path.join(run.dir, 'links.json'), data.links);
  writeJson(path.join(run.dir, 'controls.json'), data.controls);
  writeJson(path.join(run.dir, 'console-errors.json'), data.consoleErrors);
  writeJson(path.join(run.dir, 'network-errors.json'), data.networkErrors);
  writeJson(path.join(run.dir, 'accessibility.json'), data.accessibility);
  writeJson(path.join(run.dir, 'run-metadata.json'), data.metadata);
  fs.writeFileSync(path.join(run.dir, 'SCREENSHOT-INDEX.md'), screenshotIndex(data));
  fs.writeFileSync(path.join(run.dir, 'EXECUTIVE-SUMMARY.md'), executiveSummary(data));
  fs.writeFileSync(path.join(run.dir, 'GALLERY.html'), galleryHtml(data));
  fs.writeFileSync(path.join(run.dir, 'AUDIT.md'), auditMarkdown(data));
}

function executiveSummary(data) {
  const top = data.issues.slice(0, 15);
  return `# BNA Operations UI Audit - Executive Summary

## Coverage

- States visited: ${data.stateMap.states.length}
- Routes seen: ${data.routeMap.routes.length}
- Controls inventoried: ${data.controls.length}
- Screenshots: ${data.screenshots.length}
- Issues: ${data.issues.length}
- Incomplete because caps reached: ${data.metadata.incomplete ? 'yes' : 'no'}

## Top Issues

${top.length ? top.map(issueLine).join('\n') : '- No automated findings. Human review is still required.'}

## Privacy / Scoping Warnings

- Screenshots are best-effort redacted and should be reviewed before sharing.
- This audit does not prove backend authorization. It records UI evidence and recommended backend checks.
- Mutating actions and non-GET requests were blocked or skipped by default.

## Recommended Agent Mode Targets

- Review \`GALLERY.html\` and contact sheets first.
- Use \`issues.json\` for structured triage.
- Verify workspace/student/helper context on any state flagged with stale or duplicate context language.
`;
}

function auditMarkdown(data) {
  return `# BNA Operations Frontend UI Audit

## Run metadata

- Base URL: ${data.metadata.baseUrl}
- Start path: ${data.metadata.startPath}
- Started at: ${data.metadata.startedAt}
- Finished at: ${data.metadata.finishedAt || ''}
- Canonical Operations implementation: Express route \`GET /operations\` with \`requireAdmin\`, serving \`public/operations.html\`. Login shell is \`public/operations-login.html\`.
- Legacy Operations implementation found: no active \`src/app/operations/\` directory in this checkout.
- Auth storage state: loaded locally from configured path, never included in this package.
- Privacy mode: ${data.metadata.privacyMode}

## Executive summary

- States visited: ${data.stateMap.states.length}
- Routes seen: ${data.routeMap.routes.length}
- Issues found: ${data.issues.length}
- Console errors: ${data.consoleErrors.length}
- Network errors: ${data.networkErrors.length}
- Blocked mutating requests/actions: ${data.controls.filter((item) => item.skipped).length}

## Coverage and limitations

This is a live UI audit harness with a read-only interaction policy. It safely
opens routes, tabs, filters, menus, details, and navigation controls when they
do not look destructive. It does not submit forms, send messages, publish,
charge, sync, deploy, mutate records, or probe unauthorized IDs.

Automated redaction is best-effort. Review the ZIP before sharing it outside
the operator/Codex/Agent Mode workflow.

## Complete route and state map

See \`route-map.json\` and \`state-map.json\`.

${moduleFindings(data)}

## Global shell and navigation findings

${categoryFindings(data, 'navigation')}

## Module-by-module findings

${categoryFindings(data, 'general')}

## Helper findings

${categoryFindings(data, 'helper')}

## Workspace and role-context findings

${categoryFindings(data, 'workspace')}

## Responsive and layout findings

${categoryFindings(data, 'layout')}\n${categoryFindings(data, 'responsive')}

## Accessibility findings

${categoryFindings(data, 'accessibility')}

## Broken/dead/confusing controls

${categoryFindings(data, 'information-architecture')}

## Console and network findings

- Console errors: ${data.consoleErrors.length}
- Network errors: ${data.networkErrors.length}

## Screenshot index

See \`SCREENSHOT-INDEX.md\` and \`GALLERY.html\`.

## Recommended targeted live checks for Agent Mode

- Confirm ordinary workspace users cannot see global/super-admin controls.
- Confirm student detail screens never retain stale student data after switching context.
- Confirm helper context changes with workspace/module/student.
- Confirm any issue marked P0/P1 manually before product fixes.

## Codex implementation backlog

Use \`issues.json\` as the machine-readable backlog. Do not implement fixes from
this audit until Shloimie asks for a product-fix pass.

## Reproduction commands

\`\`\`bash
npm run ops:audit:auth
npm run ops:audit
npm run ops:audit -- package ${data.metadata.runDir}
\`\`\`
`;
}

function moduleFindings(data) {
  const modules = new Map();
  for (const issue of data.issues) {
    const key = issue.module || 'Unknown module';
    if (!modules.has(key)) modules.set(key, []);
    modules.get(key).push(issue);
  }
  if (!modules.size) return 'No module-specific automated findings.';
  return [...modules.entries()].map(([module, issues]) => `### ${module}\n\n${issues.slice(0, 8).map(issueLine).join('\n')}`).join('\n\n');
}

function categoryFindings(data, category) {
  const items = data.issues.filter((issue) => issue.category === category);
  if (!items.length) return 'No automated findings in this category.';
  return items.map(issueLine).join('\n');
}

function issueLine(issue) {
  return `- **${issue.id}** ${issue.severity} ${issue.confidence}: ${issue.issue} (${issue.route || issue.stateId}, ${issue.viewport}) - ${issue.evidence || 'see screenshot'}${issue.screenshot ? `; screenshot: \`${issue.screenshot}\`` : ''}`;
}

function screenshotIndex(data) {
  const lines = ['# Screenshot Index', ''];
  for (const shot of data.screenshots) {
    const state = data.stateMap.states.find((item) => item.id === shot.stateId) || {};
    lines.push(`- \`${shot.path}\` - ${shot.stateId} - ${state.route || ''} - ${shot.viewport} - overflow: ${shot.metrics?.horizontalOverflow ? 'yes' : 'no'}`);
  }
  return `${lines.join('\n')}\n`;
}

function galleryHtml(data) {
  const cards = data.screenshots.map((shot) => {
    const state = data.stateMap.states.find((item) => item.id === shot.stateId) || {};
    return `<figure><a href="${escapeHtml(shot.path)}"><img src="${escapeHtml(shot.path)}" alt="${escapeHtml(shot.stateId)} ${escapeHtml(shot.viewport)}"></a><figcaption><strong>${escapeHtml(shot.stateId)}</strong><br>${escapeHtml(shot.viewport)}<br>${escapeHtml(state.route || '')}</figcaption></figure>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BNA Operations UI Audit Gallery</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f8fafc;color:#0f172a}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}figure{margin:0;padding:10px;background:white;border:1px solid #cbd5e1}img{width:100%;height:280px;object-fit:contain;object-position:top;background:#e2e8f0}figcaption{font-size:12px;line-height:1.4;word-break:break-word}</style></head><body><h1>BNA Operations UI Audit Gallery</h1><p>Review redacted screenshots before sharing.</p><div class="grid">${cards}</div></body></html>`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

module.exports = {
  auditMarkdown,
  executiveSummary,
  galleryHtml,
  screenshotIndex,
  writeReports,
};
