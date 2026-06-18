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

test('signup pages state direct parent signup, self-governance, and six months free', () => {
  const signup = read('public/signup.html');
  const signupHe = read('public/signup-he.html');

  assert.match(signup, /Direct parent signup for BNA families/);
  assert.match(signup, /parent-app setup/);
  assert.match(signup, /self-governance/);
  assert.match(signup, /Parent app access is six months free/);
  assert.match(signup, /separate parent decision/);

  assert.match(signupHe, /הרשמה ישירה להורי BNA/);
  assert.match(signupHe, /אפליקציית ההורים/);
  assert.match(signupHe, /אחריות אישית/);
  assert.match(signupHe, /בחינם לשישה חודשים/);
  assert.match(signupHe, /החלטת הורים נפרדת/);
});

test('thank-you page preserves the same six-month parent app offer after signup', () => {
  const thankYou = read('public/signup-thank-you.html');

  assert.match(thankYou, /Parent app access is six months free/);
  assert.match(thankYou, /self-governance goals/);
  assert.match(thankYou, /separate parent decision/);
  assert.match(thankYou, /אפליקציית ההורים בחינם לשישה חודשים/);
  assert.match(thankYou, /אחריות אישית/);
});

test('parent manifest uses direct signup copy without Operations or one-year offer drift', () => {
  const parentManifest = json('public/parent-manifest.json');

  assert.equal(parentManifest.name, 'BNA Parent Portal');
  assert.equal(parentManifest.start_url, '/signup?source=parent-pwa');
  assert.match(parentManifest.description, /Direct parent signup/);
  assert.match(parentManifest.description, /self-governance/);
  assert.match(parentManifest.description, /six months free/);
  assert.doesNotMatch(parentManifest.description, /Operations/i);
});

test('parent offer copy never says one year free', () => {
  const publicParentSources = [
    'public/signup.html',
    'public/signup-he.html',
    'public/signup-thank-you.html',
    'public/parent-manifest.json',
  ];

  for (const file of publicParentSources) {
    const source = read(file);
    assert.doesNotMatch(source, /\bone year free\b|\byear free\b|\b12 months free\b/i, file);
    assert.doesNotMatch(source, /שנה\s+בחינם|12\s+חודשים\s+בחינם/, file);
  }
});
