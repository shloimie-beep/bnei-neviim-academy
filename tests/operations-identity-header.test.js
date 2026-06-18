const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations shell uses the approved BNA logo with private Operations identity', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /<link rel="manifest" href="\/operations-manifest\.json">/);
  assert.doesNotMatch(operations, /<link rel="manifest" href="\/manifest\.json">/);
  assert.match(operations, /<img src="\/images\/bna-logo-nobg\.png" alt="Bnei Nevi'im Academy" class="ops-brand-logo">/);
  assert.match(operations, /<img src="\/images\/bna-logo-nobg\.png" alt="Bnei Nevi'im Academy" class="mobile-brand-logo">/);
  assert.match(operations, /BNA Operations/);
  assert.match(operations, /Private Operations portal/);
  assert.match(operations, />Operations portal</);
  assert.match(operations, /aria-label="Operations language">EN/);
});

test('Operations login uses the same logo pattern without becoming the public app', () => {
  const login = read('public/operations-login.html');

  assert.match(login, /<link rel="manifest" href="\/operations-manifest\.json">/);
  assert.doesNotMatch(login, /<link rel="manifest" href="\/manifest\.json">/);
  assert.match(login, /<img src="\/images\/bna-logo-nobg\.png" alt="Bnei Nevi'im Academy" class="logo">/);
  assert.match(login, />Operations portal</);
  assert.match(login, /aria-label="Operations language">EN/);
  assert.match(login, /Sign in to BNA Operations/);
});

test('Student portal keeps student identity and language controls with the BNA logo', () => {
  const student = read('public/student.html');

  assert.match(student, /<html lang="en">/);
  assert.match(student, /aria-label="BNA Student Portal identity"/);
  assert.match(student, /<img src="\/images\/bna-logo-nobg\.png" alt="Bnei Nevi'im Academy" class="portal-logo">/);
  assert.match(student, /<span class="portal-brand-name">Bnei Neviim Academy<\/span>/);
  assert.match(student, /<p class="eyebrow">Student Portal<\/p>/);
  assert.match(student, /<div class="language-toggle" aria-label="Language">/);
  assert.match(student, /data-lang="en">EN<\/button>/);
  assert.match(student, /data-lang="he">HE<\/button>/);
});

test('Public and signup pages keep public identity separate from Operations', () => {
  const index = read('public/index.html');
  const signup = read('public/signup.html');
  const signupHe = read('public/signup-he.html');

  for (const html of [index, signup, signupHe]) {
    assert.match(html, /<link rel="manifest" href="\/manifest\.json">/);
    assert.doesNotMatch(html, /operations-manifest\.json/);
    assert.match(html, /bna-logo-nobg\.png/);
  }
  assert.match(index, /class="lang-toggle"/);
  assert.match(signup, /id="form_language" name="form_language" value="en"/);
  assert.match(signupHe, /<html lang="he" dir="rtl">/);
  assert.match(signupHe, /id="form_language" name="form_language" value="he"/);
});
