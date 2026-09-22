const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const oneTime = fs.readFileSync('public/one-time/index.html', 'utf8');
const rabbiMember = fs.readFileSync('public/rabbi-member.html', 'utf8');
const rabbiMemberJs = fs.readFileSync('public/js/rabbi-member.js', 'utf8');
const memberLibrary = fs.readFileSync('public/member-library.html', 'utf8');
const classroom = fs.readFileSync('public/one-time-classroom.html', 'utf8');
const participant = fs.readFileSync('public/provider-participant.html', 'utf8');
const smokeScript = fs.readFileSync('scripts/smoke-public-route-privacy.mjs', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

function routeByPath(path) {
  return routeRegistry.routes.find((route) => route.route === path);
}

test('One Time has one canonical public-to-member route flow', () => {
  assert.match(server, /app\.get\(\['\/one-time', '\/one-time\/mishnayos', '\/one-time\/us', '\/one-time\/uk', '\/one-time\/israel', '\/one-time\/interest'\]/);
  assert.match(server, /app\.get\(\['\/one-time\/member-login', '\/member', '\/member-portal'\], redirectOneTimeMemberHome\)/);
  assert.match(server, /res\.redirect\(302, `\/rabbi-member\$\{query\}`\)/);
  assert.match(server, /\/member-library\?code=\$\{encodeURIComponent\(code\)\}/);

  assert.doesNotMatch(oneTime, /\/one-time\/member-login/);
  assert.match(oneTime, /href="\/rabbi-member"[^>]*>Member Login/);
});

test('One Time member pages expose app modules without public-site escape links', () => {
  const familyPortalNav = /aria-label="Family Portal"[\s\S]*>Family Portal<[\s\S]*Library[\s\S]*Classroom[\s\S]*aria-label="Questions\/support"[\s\S]*>Support<[\s\S]*aria-label="Account\/logout"[\s\S]*>Logout</;
  assert.match(rabbiMember, familyPortalNav);
  assert.match(memberLibrary, familyPortalNav);
  assert.match(classroom, familyPortalNav);
  assert.doesNotMatch(classroom, /<body class="one-time-review-active/);
  assert.match(classroom, /document\.body\.classList\.add\('one-time-review-active', 'one-time-classroom-review-shell'\)/);
  assert.match(participant, /Provider login[\s\S]*aria-label="Member home"[\s\S]*>Home<[\s\S]*Library[\s\S]*aria-label="Account\/logout"[\s\S]*>Logout</);
  for (const html of [rabbiMember, memberLibrary, classroom, participant]) {
    assert.doesNotMatch(html, /One Time home|Return to public site|href="\/one-time(?:[?#"])/);
    assert.doesNotMatch(html, /href="\/"/);
  }
});

test('One Time logout clears shared member access state without external writes', () => {
  for (const key of ['rabbi_member_session', 'one_time_member_library_code', 'oneTimeClassroomCode']) {
    assert.match(rabbiMemberJs, new RegExp(`localStorage\\.removeItem\\('${key}'\\)`));
    assert.match(memberLibrary, new RegExp(`localStorage\\.removeItem\\('${key}'\\)`));
    assert.match(classroom, new RegExp(`localStorage\\.removeItem\\('${key}'\\)`));
  }
  assert.match(rabbiMemberJs, /params\.get\('logout'\) === '1'/);
  assert.doesNotMatch(rabbiMemberJs, /fetch\([^)]*logout/i);
});

test('One Time legacy member routes are registry-classified aliases', () => {
  for (const route of ['/member', '/member-portal', '/member.html', '/one-time/member-login']) {
    const row = routeByPath(route);
    assert.ok(row, `${route} should be registered`);
    assert.equal(row.canonical_target, '/rabbi-member');
    assert.equal(row.access, 'public_entry');
    assert.equal(row.public_allowed, true);
  }

  assert.match(smokeScript, /PUBLIC_REDIRECT_ROUTES/);
  assert.match(smokeScript, /\/one-time\/member-login/);
  assert.match(smokeScript, /expectedLocationPattern: \/\\\/rabbi-member\//);
});
