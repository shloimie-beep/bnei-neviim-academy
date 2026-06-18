const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

test('server exposes clean public route aliases for signup, blog, FAQ, and portals', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\(\['\/blog', '\/he\/blog'\][\s\S]*?blog\.html/);
  assert.match(server, /app\.get\(\['\/faq', '\/he\/faq'\][\s\S]*?faq\.html/);
  assert.match(server, /app\.get\(\['\/signup'\][\s\S]*?signup\.html/);
  assert.match(server, /app\.get\(\['\/signup-he', '\/he\/signup'\][\s\S]*?signup-he\.html/);
  assert.match(server, /app\.get\(\['\/signup-thank-you'\][\s\S]*?signup-thank-you\.html/);
  assert.match(server, /app\.get\(\['\/student'\][\s\S]*?student\.html/);
  assert.match(server, /app\.get\(\['\/blog\/:slug', '\/he\/blog\/:slug'\][\s\S]*?blog-post\.html/);
});

test('public signup CTAs use clean public routes and avoid private app shells', () => {
  const index = read('public/index.html');
  const content = read('public/js/bna-content.js');
  const blogPost = read('public/blog-post.html');

  assert.match(index, /href="\/signup" class="nav-btn nav-btn-signup"/);
  assert.match(index, /href="\/signup" class="hero-btn hero-btn-signup"/);
  assert.match(index, /href="\/signup" class="cta-button cta-signup"/);
  assert.doesNotMatch(index, /href="\/signup\.html"/);

  assert.match(content, /signup: "\/signup"/);
  assert.match(blogPost, /href="\$\{BNAContent\.site\.signup\}"/);
  for (const source of [index, content, blogPost]) {
    assert.doesNotMatch(source, /\/operations\b|operations-login|Operations portal/i);
  }
});

test('parent PWA, signup language links, thank-you redirects, and signup emails use clean routes', () => {
  const parentManifest = json('public/parent-manifest.json');
  const signup = read('public/signup.html');
  const signupHe = read('public/signup-he.html');
  const server = read('server.js');

  assert.equal(parentManifest.start_url, '/signup?source=parent-pwa');
  assert.equal(parentManifest.scope, '/signup');
  assert.match(signup, /href="\/signup-he" class="nav-btn"/);
  assert.match(signupHe, /href="\/signup" class="nav-btn"/);
  assert.match(signup, /return `\/signup-thank-you\?\$\{params\.toString\(\)\}`;/);
  assert.match(signupHe, /return `\/signup-thank-you\?\$\{params\.toString\(\)\}`;/);
  assert.match(server, /https:\/\/bneineviimacademy\.org\/signup-he/);
  assert.match(server, /https:\/\/bneineviimacademy\.org\/signup'/);
  assert.doesNotMatch(server, /bneineviimacademy\.org\/signup(?:-he)?\.html/);
});

test('student portal links use the clean student route while APIs stay private/data-only', () => {
  const server = read('server.js');
  const operations = read('public/operations.html');
  const student = read('public/student.html');

  assert.match(server, /return `\$\{origin\}\/student\?code=\$\{encodeURIComponent\(code\)\}`;/);
  assert.match(operations, /return `\$\{window\.location\.origin\}\/student\?code=\$\{encodeURIComponent\(student\.student_access_code\)\}`;/);
  assert.match(student, /\/api\/student-portal\?code=/);
  assert.doesNotMatch(operations, /\/student\.html\?code=/);
  assert.doesNotMatch(server, /\/student\.html\?code=/);
});

test('sitemap advertises canonical clean public routes', () => {
  const sitemap = read('public/sitemap.xml');

  for (const route of ['/', '/he', '/blog', '/faq', '/signup', '/he/blog', '/he/faq']) {
    assert.ok(sitemap.includes(`<loc>https://bneineviimacademy.org${route}</loc>`), route);
  }
  assert.doesNotMatch(sitemap, /signup\.html|operations|student\.html/);
});
