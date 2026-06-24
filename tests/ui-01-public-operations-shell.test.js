const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const siteNav = fs.readFileSync('public/js/bna-site-nav.js', 'utf8');
const siteNavCss = fs.readFileSync('public/css/bna-site-nav.css', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

const publicPages = [
  'public/index.html',
  'public/blog.html',
  'public/faq.html',
  'public/blog-post.html',
  'public/signup.html',
  'public/signup-he.html',
  'public/signup-thank-you.html',
  'public/school.html',
  'public/parents.html',
  'public/service-providers.html',
  'public/providers-join.html',
  'public/provider-profile.html',
  'public/documents/registration-document.html',
];

test('UI-01 public routes and aliases are wired without changing PWA identities', () => {
  assert.match(server, /app\.get\(\['\/school', '\/school\.html', '\/he\/school'\]/);
  assert.match(server, /app\.get\(\['\/parents', '\/parents\.html', '\/families', '\/parent-app'/);
  assert.match(server, /'\/he\/service-providers'/);
  assert.match(fs.readFileSync('public/manifest.json', 'utf8'), /"start_url": "\/\?source=public-pwa"/);
  assert.match(fs.readFileSync('public/operations-manifest.json', 'utf8'), /"start_url": "\/operations\?source=ops-pwa"/);
  assert.match(fs.readFileSync('public/parent-manifest.json', 'utf8'), /"start_url": "\/parent\?source=parent-pwa"/);
});

test('UI-01 shared public shell exposes direct audience navigation and footer mount', () => {
  for (const label of ['School', 'Families', 'Provider Directory', 'One Time', 'Blog', 'FAQ', 'Portal Login']) {
    assert.match(siteNav, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(siteNav, /id: 'school', href: schoolUrl\(lang\)/);
  assert.match(siteNav, /id: 'parents', href: parentsUrl\(lang\)/);
  assert.match(siteNav, /id: 'service-providers', href: serviceProvidersUrl\(lang\)/);
  assert.match(siteNav, /function renderPortalDropdown/);
  for (const safeHref of ['/parent/login', '/student/login', '/provider']) {
    assert.match(siteNav, new RegExp(safeHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(siteNav, /\/operations(?:-login)?(?:\.html)?/);
  assert.doesNotMatch(siteNav, /\/operations-login\.html/);
  assert.match(siteNav, /function renderSiteFooter/);
  assert.match(siteNavCss, /body > nav:not\(\.bna-site-nav\)/);
  assert.match(siteNavCss, /@media \(max-width: 1180px\)/);
  assert.match(siteNavCss, /\.bna-site-footer/);

  for (const file of publicPages) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /bna-site-nav\.css/, `${file} should load shared shell CSS`);
    assert.match(html, /data-bna-site-nav/, `${file} should mount shared nav`);
    assert.match(html, /data-bna-site-footer/, `${file} should mount shared footer`);
  }
});

test('UI-01 homepage positions schools, families, providers, and AI overhead clearly', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  for (const phrase of [
    'Schools / AI Microschool',
    'one-man Jewish AI microschool',
    'natural-language school management',
    'Families / Parent App',
    'family accountability app',
    'Service Provider Network',
    'AI reduces overhead',
    'better rabbi pay',
  ]) {
    assert.match(home, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(home, /href="\/school" data-i18n="ecosystemParentCta">Explore schools/);
  assert.match(home, /href="\/parents" data-i18n="ecosystemFamilyCta">Explore families/);
  assert.match(home, /href="\/providers\/join\?onboard=provider" data-i18n="ecosystemProviderCtaTwo">Join the provider list/);
  assert.match(home, /class="ecosystem-media"[\s\S]*?\/images\/learning-moments\/forest-learning-01-web\.jpg/);
});

test('UI-01 audience pages keep safe public promises', () => {
  const parents = fs.readFileSync('public/parents.html', 'utf8');
  const school = fs.readFileSync('public/school.html', 'utf8');
  const serviceProviders = fs.readFileSync('public/service-providers.html', 'utf8');

  assert.match(parents, /student accountability/i);
  assert.match(parents, /Families \/ Parent App/);
  assert.match(parents, /family accountability app/i);
  assert.match(parents, /href="\/parent\/login">Open Parent Login/);
  assert.match(parents, /Parent app screenshots coming soon/);
  assert.doesNotMatch(parents, /create account|grant access|payment setup/i);
  assert.match(school, /relationship-first learning environment/i);
  assert.match(serviceProviders, /Advertise your program for free/);
  assert.match(parents, /Sign up and start using the app/);
  assert.match(parents, /Six months free for early users/);
});

test('UI-01 Operations topbar has useful chips and a single visible helper entry', () => {
  assert.doesNotMatch(operations, /Search current workspace/);
  for (const label of ['Need decision', 'Codex Queue', 'Student accountability', 'Alerts']) {
    assert.match(operations, new RegExp(label));
  }
  assert.match(operations, /function operationsTopbarStatusChips/);
  assert.match(operations, /platform: \['dashboard', 'watchdog', 'admin', 'tasks', 'agents', 'platform_suite', 'students', 'contacts', 'community', 'studio', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'pipelines', 'accounting', 'automations', 'integrations', 'api_usage', 'settings'\]/);
  assert.match(operations, /Ask \/ Search/);
  assert.match(operations, /data-bna-helper-open="true"/);
  assert.equal((operations.match(/data-bna-helper-open="true"/g) || []).length, 2);
  assert.match(operations, /<header class="mobile-app-header">[\s\S]*data-bna-helper-open="true"/);
  assert.match(operations, /<header class="ops-brand-topbar saas-topbar">[\s\S]*data-bna-helper-open="true"/);
  assert.doesNotMatch(operations, /class="bna-helper-launcher"/);
  assert.doesNotMatch(operations, /\.bna-helper-launcher/);
  assert.doesNotMatch(operations, /bna-bot-widget\.js/);
  assert.doesNotMatch(operations, /openTaskModal\(\)">New Task/);
});
