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

test('UI-01 shared public shell exposes the audience taxonomy and footer mount', () => {
  for (const label of ['School', 'Parents / Families / Parent App', 'Service Providers']) {
    assert.match(siteNav, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(siteNav, /function renderSiteFooter/);
  assert.match(siteNavCss, /body > nav:not\(\.bna-site-nav\)/);
  assert.match(siteNavCss, /\.bna-site-footer/);

  for (const file of publicPages) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /bna-site-nav\.css/, `${file} should load shared shell CSS`);
    assert.match(html, /data-bna-site-nav/, `${file} should mount shared nav`);
    assert.match(html, /data-bna-site-footer/, `${file} should mount shared footer`);
  }
});

test('UI-01 audience pages keep safe public promises', () => {
  const parents = fs.readFileSync('public/parents.html', 'utf8');
  const school = fs.readFileSync('public/school.html', 'utf8');
  const serviceProviders = fs.readFileSync('public/service-providers.html', 'utf8');

  assert.match(parents, /student accountability/i);
  assert.match(parents, /Parent app screenshots coming soon/);
  assert.doesNotMatch(parents, /create account|grant access|payment setup/i);
  assert.match(school, /relationship-first learning environment/i);
  assert.match(serviceProviders, /Become a Service Provider/);
});

test('UI-01 Operations topbar has useful chips and a single visible helper entry', () => {
  assert.doesNotMatch(operations, /Search current workspace/);
  for (const label of ['Need decision', 'Agent working', 'Student accountability', 'Alerts']) {
    assert.match(operations, new RegExp(label));
  }
  assert.match(operations, /function operationsTopbarStatusChips/);
  assert.match(operations, /platform: \['dashboard', 'admin', 'tasks', 'students', 'contacts', 'intake', 'community', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'pipelines', 'accounting'/);
  assert.match(operations, /Ask \/ Search/);
  assert.match(operations, /data-bna-helper-open="true"/);
  assert.doesNotMatch(operations, /class="bna-helper-launcher"/);
  assert.doesNotMatch(operations, /bna-bot-widget\.js/);
  assert.doesNotMatch(operations, /openTaskModal\(\)">New Task/);
});
