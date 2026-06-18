const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function blockBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('public primary navigation does not advertise private Operations login', () => {
  const index = read('public/index.html');
  const navBlock = blockBetween(index, '<nav>', '</nav>');

  assert.match(navBlock, /aria-label="Primary links"/);
  assert.match(navBlock, /data-i18n="contact"/);
  assert.match(navBlock, /data-i18n="signup"/);
  assert.doesNotMatch(navBlock, /\/operations\b|operations-login|BNA Operations|Operations portal|Operations login/i);
  assert.doesNotMatch(navBlock, /href=["'][^"']*\/operations/i);
});

test('shared public pages and nav scripts do not link to Operations', () => {
  const publicSources = [
    'public/index.html',
    'public/signup.html',
    'public/signup-he.html',
    'public/signup-thank-you.html',
    'public/blog.html',
    'public/blog-post.html',
    'public/faq.html',
    'public/student.html',
    'public/js/bna-pages.js',
    'public/js/bna-content.js',
  ];

  for (const file of publicSources) {
    const source = read(file);
    assert.doesNotMatch(source, /\/operations\b|operations-login|BNA Operations|Operations portal|Operations login/i, file);
    assert.doesNotMatch(source, /href=["'][^"']*\/operations/i, file);
  }
});

test('private Operations routes remain private app routes, not public nav links', () => {
  const server = read('server.js');
  const operationsLogin = read('public/operations-login.html');
  const operations = read('public/operations.html');

  assert.match(server, /app\.get\('\/operations', requireAdmin/);
  assert.match(operationsLogin, /Sign in to BNA Operations/);
  assert.match(operations, /BNA Operations/);
  assert.match(operations, /window\.location\.replace\('\/operations'\)/);
});
