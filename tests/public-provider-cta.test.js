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

test('homepage has provider CTA to advertise programs for free', () => {
  const index = read('public/index.html');
  const section = blockBetween(index, '<section class="provider-listing-section" id="providers">', '<!-- CTA Section -->');

  assert.match(section, /data-i18n="providerTitle">Advertise your program for free/);
  assert.match(section, /data-i18n="providerCta">Advertise your program for free/);
  assert.match(section, /Bnei Neviim can list it for free/);
  assert.match(section, /Classes, chugim, tutoring, mentoring, homeschool support, and family or youth services/);
  assert.match(section, /Basic community listings are free/);
  assert.match(section, /href="https:\/\/wa\.me\/972534932631"/);
  assert.doesNotMatch(section, /\/operations|operations-login|BNA Operations|Operations portal/i);
});

test('provider CTA has matching translation keys and responsive layout', () => {
  const index = read('public/index.html');

  for (const key of [
    'providerEyebrow',
    'providerTitle',
    'providerLead',
    'providerCta',
    'providerListOneTitle',
    'providerListOneText',
    'providerListTwoTitle',
    'providerListTwoText',
    'providerListThreeTitle',
    'providerListThreeText',
  ]) {
    assert.match(index, new RegExp(`data-i18n="${key}"`), `${key} should be present in markup`);
    assert.match(index, new RegExp(`${key}:`), `${key} should be present in translation maps`);
  }

  assert.match(index, /providerTitle: "Advertise your program for free"/);
  assert.match(index, /providerTitle: "פרסמו את התוכנית שלכם בחינם"/);
  assert.match(index, /\.provider-listing-inner \{[\s\S]*?grid-template-columns: minmax\(0, 1\.1fr\) minmax\(280px, 0\.9fr\);/);
  assert.match(index, /@media \(max-width: 900px\) \{[\s\S]*?\.provider-listing-inner \{[\s\S]*?grid-template-columns: 1fr;/);
});
