#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = path.resolve(path.dirname(__filename), '..');
const DEFAULT_OUTPUT_DIR = path.join('docs', 'owner-review');

const ROUTE_LIKE_EXTENSIONS = /\.(html?|json|txt|xml|webmanifest)$/i;
const ASSET_EXTENSIONS = /\.(css|js|mjs|png|jpe?g|webp|svg|ico|gif|avif|woff2?|ttf|mp4|mp3|wav|pdf|csv|zip)$/i;
const CUSTOMER_FACING_AUDIENCES = new Set([
  'public',
  'parent',
  'student',
  'provider',
  'provider participant',
  'member',
  'one time',
]);

function readText(filePath, fallback = '') {
  try {
    return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  } catch {
    return fallback;
  }
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(readText(filePath));
  } catch {
    return fallback;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function relative(root, filePath) {
  return slash(path.relative(root, filePath));
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))].sort();
}

function addToMapSet(map, key, value) {
  if (!key || !value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function walkFiles(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git'].includes(entry.name)) out.push(...walkFiles(full, predicate));
    } else if (entry.isFile() && predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function lineForIndex(text, index) {
  return text.slice(0, Math.max(index, 0)).split(/\r?\n/).length;
}

function normalizeRouteTarget(rawTarget, registryRoutes = new Set()) {
  const raw = String(rawTarget || '').trim();
  if (!raw || raw === '#') return null;
  if (/^(mailto|tel|sms|javascript):/i.test(raw)) return null;
  if (raw.startsWith('#')) return null;
  if (/^\{\{/.test(raw) || /\bhttps?:\/\/(?!bneineviimacademy\.org|www\.bneineviimacademy\.org|localhost|127\.0\.0\.1)/i.test(raw)) {
    return null;
  }

  let candidate = raw;
  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      if (!['bneineviimacademy.org', 'www.bneineviimacademy.org', 'localhost', '127.0.0.1'].includes(url.hostname)) return null;
      candidate = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }
  if (!candidate.startsWith('/')) return null;
  candidate = candidate.replace(/\$\{([^}]+)\}/g, (_match, expression) => {
    if (/slug/i.test(expression)) return ':slug';
    if (/thread/i.test(expression)) return ':id';
    if (/\bid\b/i.test(expression)) return ':id';
    return ':dynamic';
  });

  const withoutHash = candidate.split('#')[0] || '/';
  const exact = withoutHash;
  let pathOnly = exact.split('?')[0] || '/';
  if (pathOnly.length > 1) pathOnly = pathOnly.replace(/\/+$/, '');
  if (pathOnly.includes(':dynamic')) return null;
  if (registryRoutes.has(exact)) return exact;
  if (registryRoutes.has(pathOnly)) return pathOnly;
  if (ASSET_EXTENSIONS.test(pathOnly) && !ROUTE_LIKE_EXTENSIONS.test(pathOnly)) return null;
  return pathOnly;
}

function htmlRouteForFile(root, filePath) {
  const publicRoot = path.join(root, 'public');
  const rel = relative(publicRoot, filePath);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel}`;
}

function routeMatchesPattern(route, pattern) {
  if (route === pattern) return true;
  const routeParts = String(route || '').split('?')[0].split('/').filter(Boolean);
  const patternParts = String(pattern || '').split('?')[0].split('/').filter(Boolean);
  if (routeParts.length !== patternParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(':') || part === routeParts[index]);
}

function registryForRoute(route, routes) {
  return routes.find((item) => item.route === route) || routes.find((item) => routeMatchesPattern(route, item.route));
}

function inferAudience(route, registryRow = null) {
  const text = `${route} ${registryRow?.surface || ''} ${registryRow?.required_role || ''}`.toLowerCase();
  if (/operations|super_admin|platform_super_admin/.test(text)) return 'admin';
  if (/parent|family|household/.test(text)) return 'parent';
  if (/student/.test(text)) return 'student';
  if (/provider-participant|provider\/member/.test(text)) return 'provider participant';
  if (/provider|studio|service-provider/.test(text)) return 'provider';
  if (/rabbi-member|member-library|one-time-classroom|\/member\b|member_portal/.test(text)) return 'member';
  if (/one-time|rabbi/.test(text)) return 'one time';
  if (/api\//.test(text)) return 'internal';
  return 'public';
}

function authLabel(registryRow = null, route = '') {
  const access = String(registryRow?.access || '').toLowerCase();
  if (access === 'private') return 'protected';
  if (access === 'public_entry') return 'entry page';
  if (access === 'public') return 'none';
  if (route.startsWith('/api/')) return 'protected';
  return 'none';
}

function dependencyForRoute(route) {
  if (/google|oauth|stripe|checkout|payment|telegram|resend|vimeo|zoom|drive|wapi|whatsapp|buffer|openai|youtube|sefaria/i.test(route)) {
    return 'live credential';
  }
  if (/review|preview|test|studio|synthetic|mock/i.test(route)) return 'mocked integration';
  return 'local';
}

function implementationStatus(route, registryRow, implementation, inbound, statusHint) {
  if (statusHint) return statusHint;
  if (registryRow?.canonical_target && registryRow.canonical_target !== route) return 'alias';
  if (route.startsWith('/api/')) return 'internal-only';
  if (/preview|review|test-login|assistant-setup|platform-ui|operations-login|operations-access/i.test(route)) return 'internal-only';
  if (!implementation) return 'missing implementation';
  if (!inbound.length && CUSTOMER_FACING_AUDIENCES.has(inferAudience(route, registryRow))) return 'orphan-review';
  return 'keep';
}

function reviewStateForRoute({ route, registryRow, implementation, inbound, status, dependency }) {
  if (status === 'missing implementation') return 'incomplete';
  if (!registryRow && !route.startsWith('/api/') && !ASSET_EXTENSIONS.test(route)) return 'incomplete';
  if (status === 'orphan-review') return 'incomplete';
  if (dependency === 'live credential') return 'intentionally blocked';
  return 'ready';
}

function firstArgExpression(text, openIndex) {
  let quote = '';
  let escaped = false;
  let depth = 0;
  const start = openIndex;
  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '[' || char === '(' || char === '{') depth += 1;
    if (char === ']' || char === ')' || char === '}') depth -= 1;
    if (char === ',' && depth === 0) return text.slice(start, index);
  }
  return text.slice(start, start + 500);
}

function extractStringRoutes(value) {
  const routes = [];
  const pattern = /['"`](\/[^'"`]+?)['"`]/g;
  let match;
  while ((match = pattern.exec(value))) {
    routes.push(match[1]);
  }
  return routes;
}

function sendFileImplementations(snippet) {
  const implementations = [];
  const sendFilePattern = /sendFile\(([\s\S]*?)\);/g;
  let sendMatch;
  while ((sendMatch = sendFilePattern.exec(snippet))) {
    const sendFileText = sendMatch[0];
    if (!/public/.test(sendFileText)) {
      implementations.push('server.js');
      continue;
    }
    const pieces = [];
    const pattern = /['"]([^'"]+)['"]/g;
    let match;
    while ((match = pattern.exec(sendFileText))) pieces.push(match[1]);
    const publicIndex = pieces.indexOf('public');
    if (publicIndex === -1) {
      implementations.push('server.js');
      continue;
    }
    const rel = pieces.slice(publicIndex).join('/');
    if (rel) implementations.push(slash(rel));
  }
  return unique(implementations);
}

function collectServerRoutes(root, registryRoutes) {
  const serverPath = path.join(root, 'server.js');
  const text = readText(serverPath);
  const routes = [];
  const redirects = [];
  const serverPattern = /app\.(get|post|put|patch|delete|all|use)\s*\(/g;
  let match;
  while ((match = serverPattern.exec(text))) {
    const method = match[1].toUpperCase();
    const argStart = serverPattern.lastIndex;
    const firstArg = firstArgExpression(text, argStart);
    const routeTargets = extractStringRoutes(firstArg)
      .map((target) => normalizeRouteTarget(target, registryRoutes))
      .filter(Boolean);
    if (!routeTargets.length) continue;
    const line = lineForIndex(text, match.index);
    const nextRouteOffset = text.slice(match.index + 1).search(/\r?\napp\.(get|post|put|patch|delete|all|use)\s*\(/);
    const snippetEnd = nextRouteOffset === -1 ? match.index + 1200 : match.index + 1 + nextRouteOffset;
    const snippet = text.slice(match.index, snippetEnd);
    const implementation = sendFileImplementations(snippet);
    const redirectTargets = [];
    const redirectPattern = /res\.redirect\((?:\d+,\s*)?[`'"]([^`'"]+)[`'"]/g;
    let redirectMatch;
    while ((redirectMatch = redirectPattern.exec(snippet))) {
      const target = normalizeRouteTarget(redirectMatch[1], registryRoutes);
      if (target) redirectTargets.push(target);
    }
    for (const route of routeTargets) {
      routes.push({
        route,
        method,
        implementation: implementation.length ? implementation : [`server.js:${line}`],
        source: `server.js:${line}`,
      });
      for (const target of redirectTargets) {
        redirects.push({ from: route, to: target, source: `server.js:${line}` });
      }
    }
  }
  return { routes, redirects };
}

function collectHtmlAndStaticRoutes(root) {
  const publicRoot = path.join(root, 'public');
  const htmlFiles = walkFiles(publicRoot, (filePath) => filePath.endsWith('.html'));
  return htmlFiles.map((filePath) => ({
    route: htmlRouteForFile(root, filePath),
    implementation: relative(root, filePath),
    filePath,
  }));
}

function collectManifestRoutes(root, registryRoutes) {
  const publicRoot = path.join(root, 'public');
  const manifestFiles = walkFiles(publicRoot, (filePath) => /manifest.*\.json$|.*-manifest\.json$/i.test(path.basename(filePath)));
  const links = [];
  for (const filePath of manifestFiles) {
    const manifest = readJson(filePath, {});
    for (const key of ['start_url', 'scope', 'id']) {
      const route = normalizeRouteTarget(manifest?.[key], registryRoutes);
      if (route) links.push({ from: relative(root, filePath), to: route, kind: `manifest:${key}`, raw: manifest[key] });
    }
    for (const icon of manifest?.icons || []) {
      const route = normalizeRouteTarget(icon?.src, registryRoutes);
      if (route) links.push({ from: relative(root, filePath), to: route, kind: 'manifest:icon', raw: icon.src });
    }
  }
  return links;
}

function collectServiceWorkerRoutes(root, registryRoutes) {
  const swPath = path.join(root, 'public', 'sw.js');
  const text = readText(swPath);
  const links = [];
  const pattern = /['"`](\/[^'"`]+?)['"`]/g;
  let match;
  while ((match = pattern.exec(text))) {
    const route = normalizeRouteTarget(match[1], registryRoutes);
    if (route && route !== '/api') links.push({ from: 'public/sw.js', to: route, kind: 'service-worker', raw: match[1] });
  }
  return links;
}

function collectClientLinks(root, registryRoutes) {
  const publicRoot = path.join(root, 'public');
  const files = walkFiles(publicRoot, (filePath) => /\.(html|js|mjs)$/i.test(filePath));
  const links = [];
  const formActions = [];
  const formWithoutAction = [];
  for (const filePath of files) {
    const rel = relative(root, filePath);
    const sourceRoute = filePath.endsWith('.html') ? htmlRouteForFile(root, filePath) : rel;
    const text = readText(filePath);

    const hrefPattern = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = hrefPattern.exec(text))) {
      const route = normalizeRouteTarget(match[1], registryRoutes);
      if (route) links.push({ from: sourceRoute, to: route, kind: 'literal-a-href', raw: match[1], source: rel });
    }

    const formPattern = /<form\b([^>]*)>/gi;
    while ((match = formPattern.exec(text))) {
      const attrs = match[1] || '';
      const actionMatch = attrs.match(/\baction=["']([^"']+)["']/i);
      if (actionMatch) {
        const route = normalizeRouteTarget(actionMatch[1], registryRoutes);
        if (route) {
          links.push({ from: sourceRoute, to: route, kind: 'form-action', raw: actionMatch[1], source: rel });
          formActions.push({ from: sourceRoute, to: route, source: rel });
        }
      } else {
        formWithoutAction.push({ from: sourceRoute, source: rel });
      }
    }

    const navigationPatterns = [
      { kind: 'window.location', pattern: /\b(?:window\.)?location(?:\.href)?\s*=\s*["'`]([^"'`]+)["'`]/g },
      { kind: 'location.assign', pattern: /\b(?:window\.)?location\.assign\(\s*["'`]([^"'`]+)["'`]/g },
      { kind: 'location.replace', pattern: /\b(?:window\.)?location\.replace\(\s*["'`]([^"'`]+)["'`]/g },
      { kind: 'history.pushState', pattern: /\bhistory\.pushState\([^)]*?,\s*["'`][^"'`]*["'`]\s*,\s*["'`]([^"'`]+)["'`]/g },
      { kind: 'fetch', pattern: /\bfetch\(\s*["'`]([^"'`]+)["'`]/g },
    ];
    for (const { kind, pattern } of navigationPatterns) {
      while ((match = pattern.exec(text))) {
        const route = normalizeRouteTarget(match[1], registryRoutes);
        if (route) links.push({ from: sourceRoute, to: route, kind, raw: match[1], source: rel });
      }
    }

    const scanGeneratedRouteStrings = /public\/js\/(bna-pages|bna-site-nav|bna-content)\.js$/i.test(rel);
    if (scanGeneratedRouteStrings) {
      const routeStringPattern = /["'`](\/(?!\/)[^"'`<>\s]+)["'`]/g;
      while ((match = routeStringPattern.exec(text))) {
        const route = normalizeRouteTarget(match[1], registryRoutes);
        if (route) links.push({ from: sourceRoute, to: route, kind: 'js-generated-route-string', raw: match[1], source: rel });
      }
    }
  }
  return { links, formActions, formWithoutAction };
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows) {
  const headers = [
    'Canonical URL',
    'Implementation',
    'Audience',
    'Authentication',
    'Entry point',
    'Back path',
    'Inbound links',
    'Outbound links',
    'Status',
    'Dependencies',
    'Review state',
    'Registry surface',
    'Discovered as',
  ];
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n';
}

function renderSitemap(report) {
  const rowsByAudience = report.rows.reduce((acc, row) => {
    const audience = row.Audience || 'unknown';
    if (!acc.has(audience)) acc.set(audience, []);
    acc.get(audience).push(row);
    return acc;
  }, new Map());
  const lines = [
    '# Canonical Sitemap',
    '',
    `Generated at ${report.generated_at}.`,
    '',
    'This file is generated by `npm run owner-review:routes` from public HTML, server routes, route registry rows, manifests, service-worker entries, client navigation, form actions, redirects, and API/fetch destinations.',
    '',
    '## Summary',
    '',
    `- Total routes: ${report.summary.total_routes}`,
    `- HTML pages: ${report.summary.html_pages}`,
    `- Server routes: ${report.summary.server_routes}`,
    `- API routes: ${report.summary.api_routes}`,
    `- Linked destinations: ${report.summary.linked_destinations}`,
    `- Orphan review rows: ${report.summary.orphan_review_rows}`,
    `- Duplicate implementation groups: ${report.summary.duplicate_implementation_groups}`,
    '',
  ];
  for (const [audience, rows] of [...rowsByAudience.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`## ${audience}`, '', '| URL | Auth | Status | Review | Implementation |', '| --- | --- | --- | --- | --- |');
    for (const row of rows) {
      lines.push(`| ${row['Canonical URL']} | ${row.Authentication} | ${row.Status} | ${row['Review state']} | ${String(row.Implementation || '').replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function renderNavigationGraph(report) {
  const lines = [
    '# Navigation Graph',
    '',
    `Generated at ${report.generated_at}.`,
    '',
    'Edges are discovered from literal anchors, JavaScript navigation, form actions, redirects, manifests, service-worker cache entries, and fetch/API calls.',
    '',
    '| From | To | Kind | Source |',
    '| --- | --- | --- | --- |',
  ];
  for (const edge of report.edges.slice().sort((a, b) => `${a.from} ${a.to} ${a.kind}`.localeCompare(`${b.from} ${b.to} ${b.kind}`))) {
    lines.push(`| ${edge.from} | ${edge.to} | ${edge.kind} | ${edge.source || edge.raw || ''} |`);
  }
  return `${lines.join('\n')}\n`;
}

function renderOrphanDuplicateReport(report) {
  const lines = [
    '# Orphan And Duplicate Pages',
    '',
    `Generated at ${report.generated_at}.`,
    '',
    '## Customer-Facing Orphan Review',
    '',
  ];
  const orphans = report.rows.filter((row) => row.Status === 'orphan-review');
  if (!orphans.length) {
    lines.push('- None.');
  } else {
    for (const row of orphans) {
      lines.push(`- ${row['Canonical URL']} (${row.Audience}) -> ${row.Implementation || 'missing implementation'}`);
    }
  }

  lines.push('', '## Duplicate Canonical Implementations', '');
  if (!report.duplicate_groups.length) {
    lines.push('- None.');
  } else {
    for (const group of report.duplicate_groups) {
      lines.push(`- ${group.implementation}: ${group.routes.join(', ')}`);
    }
  }

  lines.push('', '## Missing Implementation Rows', '');
  const missing = report.rows.filter((row) => row.Status === 'missing implementation');
  if (!missing.length) {
    lines.push('- None.');
  } else {
    for (const row of missing) {
      lines.push(`- ${row['Canonical URL']} (${row['Discovered as']})`);
    }
  }
  return `${lines.join('\n')}\n`;
}

function writeOutputs(root, outputDir, report) {
  const dir = path.join(root, outputDir);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'ROUTE-INVENTORY.csv'), toCsv(report.rows));
  fs.writeFileSync(path.join(dir, 'CANONICAL-SITEMAP.md'), `${renderSitemap(report)}\n`);
  fs.writeFileSync(path.join(dir, 'NAVIGATION-GRAPH.md'), renderNavigationGraph(report));
  fs.writeFileSync(path.join(dir, 'ORPHAN-AND-DUPLICATE-PAGES.md'), renderOrphanDuplicateReport(report));
  fs.writeFileSync(path.join(dir, 'ROUTE-INVENTORY.json'), `${JSON.stringify(report, null, 2)}\n`);
}

export function buildOwnerReviewRouteInventory({
  root = DEFAULT_ROOT,
  outputDir = DEFAULT_OUTPUT_DIR,
  write = false,
} = {}) {
  const routeRegistryPath = path.join(root, 'ops', 'route-registry.json');
  const registry = readJson(routeRegistryPath, { routes: [] });
  const registryRows = Array.isArray(registry?.routes) ? registry.routes : [];
  const registryRoutes = new Set(registryRows.map((row) => row.route).filter(Boolean));

  const htmlRoutes = collectHtmlAndStaticRoutes(root);
  const { routes: serverRoutes, redirects } = collectServerRoutes(root, registryRoutes);
  const { links: clientLinks, formActions, formWithoutAction } = collectClientLinks(root, registryRoutes);
  const manifestLinks = collectManifestRoutes(root, registryRoutes);
  const serviceWorkerLinks = collectServiceWorkerRoutes(root, registryRoutes);
  const knownRoutes = unique([
    ...registryRows.map((row) => row.route),
    ...htmlRoutes.map((row) => row.route),
    ...serverRoutes.map((row) => row.route),
  ]);
  const canonicalizeDiscoveredRoute = (route) => (
    knownRoutes.includes(route) ? route : (knownRoutes.find((candidate) => routeMatchesPattern(route, candidate)) || route)
  );
  const edges = [
    ...clientLinks,
    ...manifestLinks,
    ...serviceWorkerLinks,
    ...redirects.map((item) => ({ from: item.from, to: item.to, kind: 'server-redirect', source: item.source })),
  ].map((edge) => ({ ...edge, to: canonicalizeDiscoveredRoute(edge.to) }));

  const routeSources = new Map();
  const implementations = new Map();
  const inbound = new Map();
  const outbound = new Map();
  const statusHints = new Map();

  for (const registryRow of registryRows) {
    addToMapSet(routeSources, registryRow.route, 'route-registry');
  }
  for (const item of htmlRoutes) {
    addToMapSet(routeSources, item.route, 'html-page');
    addToMapSet(implementations, item.route, item.implementation);
  }
  for (const item of serverRoutes) {
    addToMapSet(routeSources, item.route, `server-${item.method.toLowerCase()}`);
    for (const implementation of item.implementation) addToMapSet(implementations, item.route, implementation);
  }
  for (const edge of edges) {
    addToMapSet(routeSources, edge.to, edge.kind);
    addToMapSet(inbound, edge.to, `${edge.from} (${edge.kind})`);
    addToMapSet(outbound, edge.from, `${edge.to} (${edge.kind})`);
  }
  for (const redirect of redirects) {
    statusHints.set(redirect.from, 'redirect');
  }

  const allRoutes = unique([
    ...knownRoutes,
    ...edges.map((edge) => edge.to),
  ]);

  for (const route of allRoutes) {
    const pathOnly = route.split('?')[0] || '/';
    if (route.includes('?')) {
      for (const implementation of implementations.get(pathOnly) || []) {
        addToMapSet(implementations, route, implementation);
      }
    }
    if ([...(implementations.get(route) || [])].length) continue;
    const publicCandidate = path.join(root, 'public', decodeURIComponent(pathOnly.replace(/^\//, '')));
    if (pathOnly !== '/' && fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
      addToMapSet(implementations, route, relative(root, publicCandidate));
      addToMapSet(routeSources, route, 'public-static-file');
    }
  }

  const rows = allRoutes.map((route) => {
    const registryRow = registryForRoute(route, registryRows);
    const implementationList = unique([...(implementations.get(route) || [])]);
    const inboundList = unique([...(inbound.get(route) || [])]);
    const outboundList = unique([...(outbound.get(route) || [])]);
    const implementation = implementationList.join(' | ');
    const audience = inferAudience(route, registryRow);
    const dependency = dependencyForRoute(route);
    const status = implementationStatus(route, registryRow, implementation, inboundList, statusHints.get(route));
    const backCandidates = outboundList
      .map((value) => value.split(' ')[0])
      .filter((target) => ['/', '/school', '/parents', '/service-providers', '/one-time', '/rabbi', '/parent', '/student', '/provider', '/operations', '/rabbi-member', '/member', '/member-library', '/one-time-classroom'].includes(target));
    const entryPoint = inboundList.length ? inboundList.slice(0, 8).join(' | ') : (implementation ? 'direct/server/static' : 'registry-only');
    return {
      'Canonical URL': route,
      Implementation: implementation || '',
      Audience: audience,
      Authentication: authLabel(registryRow, route),
      'Entry point': entryPoint,
      'Back path': unique(backCandidates).join(' | ') || 'none detected',
      'Inbound links': inboundList.join(' | '),
      'Outbound links': outboundList.slice(0, 30).join(' | '),
      Status: status,
      Dependencies: dependency,
      'Review state': reviewStateForRoute({ route, registryRow, implementation, inbound: inboundList, status, dependency }),
      'Registry surface': registryRow?.surface || '',
      'Discovered as': unique([...(routeSources.get(route) || [])]).join(' | '),
    };
  });

  const implementationGroups = new Map();
  for (const row of rows) {
    if (!row.Implementation || row.Implementation.includes('server.js')) continue;
    for (const impl of row.Implementation.split('|').map((value) => value.trim()).filter(Boolean)) {
      if (!impl.endsWith('.html')) continue;
      if (!implementationGroups.has(impl)) implementationGroups.set(impl, []);
      implementationGroups.get(impl).push(row['Canonical URL']);
    }
  }
  const duplicateGroups = [...implementationGroups.entries()]
    .map(([implementation, routes]) => ({ implementation, routes: unique(routes) }))
    .filter((group) => group.routes.length > 1);

  const stablePayload = JSON.stringify({
    rows,
    edgeCount: edges.length,
    formActions,
    formWithoutAction,
    duplicateGroups,
  });
  const report = {
    generated_at: new Date().toISOString(),
    requirement_id: 'REQ-20260624-003',
    source_id: 'RAW-20260624-001',
    content_hash: crypto.createHash('sha256').update(stablePayload).digest('hex'),
    summary: {
      total_routes: rows.length,
      html_pages: htmlRoutes.length,
      server_routes: serverRoutes.length,
      api_routes: rows.filter((row) => row['Canonical URL'].startsWith('/api/')).length,
      linked_destinations: unique(edges.map((edge) => edge.to)).length,
      client_edges: clientLinks.length,
      manifest_edges: manifestLinks.length,
      service_worker_edges: serviceWorkerLinks.length,
      form_actions: formActions.length,
      forms_without_action: formWithoutAction.length,
      orphan_review_rows: rows.filter((row) => row.Status === 'orphan-review').length,
      duplicate_implementation_groups: duplicateGroups.length,
      incomplete_rows: rows.filter((row) => row['Review state'] === 'incomplete').length,
    },
    rows,
    edges,
    form_actions: formActions,
    forms_without_action: formWithoutAction,
    duplicate_groups: duplicateGroups,
  };

  if (write) writeOutputs(root, outputDir, report);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const report = buildOwnerReviewRouteInventory({ write: true });
  console.log(`Owner-review route inventory: ${report.summary.total_routes} routes, ${report.summary.html_pages} HTML pages, ${report.summary.orphan_review_rows} orphan-review rows`);
}
