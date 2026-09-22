const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const feedPath = path.join(repoRoot, 'public', 'data', 'learning-moments.json');
const homepagePath = path.join(repoRoot, 'public', 'index.html');

function normalizePublicSrc(src) {
  const value = String(src || '').trim();
  return value.startsWith('/') ? value : `/${value}`;
}

function publicPathForSrc(src) {
  return path.join(repoRoot, 'public', normalizePublicSrc(src).replace(/^\/+/, ''));
}

test('Learning Moments feed points to bundled public images', () => {
  const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
  assert.ok(Array.isArray(feed.items), 'feed.items must be an array');
  assert.ok(feed.items.length >= 3, 'feed should include the current Drive-backed homepage images');

  const seen = new Set();
  for (const item of feed.items) {
    assert.equal(item.type, 'image');
    assert.ok(item.title, 'feed item should have an internal title');
    assert.ok(item.alt, 'feed item should have alt text');

    const src = normalizePublicSrc(item.src);
    assert.match(src, /^\/images\/learning-moments\/[^/]+\.(jpe?g|png|webp)$/i);
    assert.ok(!seen.has(src), `duplicate Learning Moments feed src: ${src}`);
    seen.add(src);

    const imagePath = publicPathForSrc(src);
    assert.ok(fs.existsSync(imagePath), `missing public image asset: ${src}`);
    assert.ok(fs.statSync(imagePath).size > 10_000, `image asset looks too small: ${src}`);
  }
});

test('Homepage normalizes and dedupes Learning Moments feed and fallback paths', () => {
  const homepage = fs.readFileSync(homepagePath, 'utf8');
  assert.match(homepage, /function normalizeLearningMomentSrc/);
  assert.match(homepage, /seen\.has\(normalizedSrc\)/);

  const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
  const fallbackSrcs = [...homepage.matchAll(/src:\s*'([^']*images\/learning-moments\/[^']+)'/g)]
    .map((match) => normalizePublicSrc(match[1]));
  assert.ok(fallbackSrcs.length >= 3, 'homepage should keep bundled fallback moments');

  const combined = [...feed.items.map((item) => normalizePublicSrc(item.src)), ...fallbackSrcs];
  assert.ok(new Set(combined).size < combined.length, 'test fixture should cover duplicate feed/fallback paths');
});
