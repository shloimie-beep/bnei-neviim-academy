import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const serverPath = path.join(repoRoot, 'server.js');
const outputPath =
  process.argv[2] || path.join(repoRoot, 'ops', 'audits', '2026-06-23-rabbi-scheller-route-map.json');

const server = fs.readFileSync(serverPath, 'utf8');
const lines = server.split(/\r?\n/);
const routeCallPattern = /app\.(get|post|put|patch|delete)\(\s*(\[[^\]]+\]|(['"`])([^'"`]+)\3)/;
const quotedRoutePattern = /(['"`])([^'"`]+)\1/g;

function routeKind(route) {
  if (route.startsWith('/api/')) return 'api';
  if (route.includes('login')) return 'login_or_auth_entry';
  if (route === '/operations' || route.startsWith('/operations/')) return 'operations_page';
  if (route.startsWith('/provider') || route.startsWith('/providers') || route.startsWith('/service-providers')) {
    return 'provider_public_or_portal_page';
  }
  if (route.startsWith('/parent') || route.startsWith('/family') || route.startsWith('/household')) return 'parent_page';
  if (route.startsWith('/student')) return 'student_page';
  if (route.startsWith('/rabbi') || route.startsWith('/one-time') || route.startsWith('/member')) return 'one_time_page';
  if (route.startsWith('/documents')) return 'document_page';
  return 'public_or_legacy_page';
}

function ownerFor(route) {
  if (route.startsWith('/api/bna/rabbi') || route.startsWith('/api/rabbi') || route.startsWith('/rabbi')) {
    return 'Rabbi Scheller / One Time';
  }
  if (route.includes('one-time') || route.includes('member-library') || route.includes('one-time-classroom')) {
    return 'Rabbi Scheller / One Time';
  }
  if (route.startsWith('/api/provider-portal') || route.startsWith('/provider')) return 'Provider portal';
  if (route.startsWith('/api/bna') || route.startsWith('/operations')) return 'BNA Operations';
  if (route.startsWith('/api/parent') || route.startsWith('/parent') || route.startsWith('/family') || route.startsWith('/household')) return 'Parent portal';
  if (route.startsWith('/api/student') || route.startsWith('/student')) return 'Student portal';
  if (route.startsWith('/api/community')) return 'Community portal';
  return 'Public site';
}

function intendedRole(route, line) {
  if (line.includes('requireAdmin') || route.startsWith('/operations') || route.startsWith('/api/bna')) return 'operations_authorized';
  if (route.startsWith('/api/provider-portal') || route.startsWith('/provider')) return 'provider_owner_or_provider_admin';
  if (route.startsWith('/api/parent') || route.startsWith('/parent') || route.startsWith('/family') || route.startsWith('/household')) return 'parent';
  if (route.startsWith('/api/student') || route.startsWith('/student')) return 'student';
  if (route.startsWith('/api/rabbi/member') || route.startsWith('/member')) return 'member';
  if (route.includes('classroom')) return 'classroom_participant';
  return 'anonymous_or_public';
}

function accessFor(route, line) {
  if (line.includes('requireAdmin') || route.startsWith('/operations')) return 'private_server_guarded';
  if (line.includes('requireProviderSession')) return 'private_provider_session_guarded';
  if (route.includes('/login') || route.includes('/auth/') || route.includes('setup-password')) return 'public_entry_auth';
  if (route.startsWith('/api/') && !route.startsWith('/api/providers') && !route.startsWith('/api/provider-plans')) return 'mixed_or_handler_guarded';
  return 'public_or_page_shell';
}

function navigationEntry(route) {
  if (route === '/operations') return 'Operations login, portal fallback, bookmarked deep links';
  if (route === '/provider' || route === '/provider/login' || route === '/provider-dashboard') return 'Provider portal login';
  if (route === '/parent' || route === '/parent/login') return 'Parent portal login';
  if (route === '/student' || route === '/student/login') return 'Student portal login';
  if (route.includes('one-time') || route.startsWith('/rabbi') || route.startsWith('/member')) return 'One Time marketing/member/classroom links';
  if (route.startsWith('/api/')) return 'Client fetch, form submit, automation, or webhook';
  return 'Public site nav or alias';
}

function routeStatus(route) {
  if (route.includes('preview')) return 'preview_only';
  if (route.includes('legacy')) return 'legacy';
  if (route.startsWith('/api/webhooks')) return 'production_external_webhook';
  if (route.startsWith('/api/')) return 'production_or_internal_api';
  return 'production_or_alias_page';
}

const routes = [];
for (const [index, line] of lines.entries()) {
  const match = line.match(routeCallPattern);
  if (!match) continue;
  const method = match[1].toUpperCase();
  const routeArg = match[2];
  const patterns = routeArg.startsWith('[')
    ? [...routeArg.matchAll(quotedRoutePattern)].map((routeMatch) => routeMatch[2])
    : [match[4]];
  for (const pattern of patterns) {
    routes.push({
      method,
      url_pattern: pattern,
      line: index + 1,
      route_name: `${method} ${pattern}`,
      owning_workspace: ownerFor(pattern),
      intended_role: intendedRole(pattern, line),
      navigation_entry_point: navigationEntry(pattern),
      parent_page: pattern.startsWith('/api/') ? null : parentPage(pattern),
      child_pages: [],
      direct_deep_link_expected: method === 'GET',
      refresh_expected: method === 'GET',
      back_navigation_expected: method === 'GET' && !pattern.startsWith('/api/'),
      active_navigation_expected: navigationEntry(pattern),
      reachable: 'static_inventory_only',
      orphaned: pattern.startsWith('/api/') ? 'not_applicable_api' : 'requires_browser_walk',
      wrong_workspace_exposure: 'requires_auth_and_tenant_tests',
      lifecycle: routeStatus(pattern),
      kind: routeKind(pattern),
      access: accessFor(pattern, line),
      source: 'server.js',
    });
  }
}

function parentPage(route) {
  if (route.includes('/:')) return route.split('/:')[0] || '/';
  if (route === '/') return null;
  const segments = route.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return `/${segments.slice(0, -1).join('/')}`;
}

const htmlFiles = ['public/operations.html', 'public/provider.html', 'public/parent.html', 'public/student.html', 'public/rabbi.html'];
const htmlSignals = [];
for (const relativePath of htmlFiles) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');
  const hrefs = [...html.matchAll(/\bhref=(['"])(.*?)\1/g)]
    .map((match) => match[2])
    .filter((href) => href.startsWith('/'))
    .sort();
  const dataViews = [...html.matchAll(/\bdata-(?:view|provider-section|provider-nav)=(['"])(.*?)\1/g)]
    .map((match) => match[2])
    .sort();
  htmlSignals.push({
    file: relativePath,
    internal_hrefs: [...new Set(hrefs)],
    data_navigation_keys: [...new Set(dataViews)],
  });
}

const publicPageRoutes = routes.filter((route) => route.kind !== 'api');
const apiRoutes = routes.filter((route) => route.kind === 'api');
const groups = {};
for (const route of routes) {
  const key = route.url_pattern.split('/').slice(0, 4).join('/') || '/';
  groups[key] ||= { count: 0, methods: new Set(), examples: [] };
  groups[key].count += 1;
  groups[key].methods.add(route.method);
  if (groups[key].examples.length < 8) groups[key].examples.push(route.url_pattern);
}

const inventory = {
  generated_at: new Date().toISOString(),
  source_files: ['server.js', ...htmlFiles.filter((relativePath) => fs.existsSync(path.join(repoRoot, relativePath)))],
  scope:
    'Static route/navigation inventory for Rabbi Scheller provider workspace audit. Browser reachability, console, 404, and viewport claims require separate Playwright/live smoke evidence.',
  canonical_provider_workspace_key: 'rabbi_sheller_provider',
  canonical_project_key: 'one_time_mishnah_class',
  spelling_note:
    'Repository data uses rabbi_sheller_provider as the durable workspace key and has visible legacy Sheller/Scheller/Elie/Ellie spelling variants. The route map does not rename durable keys.',
  totals: {
    express_routes: routes.length,
    public_or_page_routes: publicPageRoutes.length,
    api_routes: apiRoutes.length,
    html_files_scanned: htmlSignals.length,
  },
  groups: Object.fromEntries(
    Object.entries(groups).map(([key, value]) => [
      key,
      { count: value.count, methods: [...value.methods].sort(), examples: value.examples },
    ])
  ),
  key_login_entry_points: routes.filter((route) =>
    ['/operations', '/provider', '/provider/login', '/student', '/student/login', '/parent', '/parent/login'].includes(route.url_pattern) ||
    ['/api/operations/login', '/api/provider-portal/login', '/api/student-portal/login', '/api/parent-portal/login', '/api/bna/auth/login'].includes(route.url_pattern)
  ),
  rabbi_scheller_key_routes: routes.filter((route) =>
    /rabbi|one-time|member-library|member-portal|one-time-classroom|provider-portal/.test(route.url_pattern)
  ),
  html_navigation_signals: htmlSignals,
  routes,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`Wrote ${routes.length} Express routes to ${path.relative(repoRoot, outputPath)}`);
