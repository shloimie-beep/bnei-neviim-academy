const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const walkthroughRoot = path.join(repoRoot, 'docs', 'operator-walkthroughs');
const publicRoot = path.join(repoRoot, 'public');

function listMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(full);
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });
}

function markdownLinks(markdown) {
  const links = [];
  const regex = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) links.push(match[1]);
  return links;
}

function assertLocalPathExists(fromFile, href) {
  const [target] = href.split('#');
  if (!target || target.startsWith('mailto:')) return;
  if (target.startsWith('/')) {
    const publicPath = path.join(publicRoot, target.replace(/^\/+/, ''));
    assert.ok(fs.existsSync(publicPath), `${fromFile} links to missing public path ${href}`);
    return;
  }
  const resolved = path.resolve(path.dirname(fromFile), target);
  assert.ok(resolved.startsWith(walkthroughRoot), `${fromFile} link escapes walkthrough folder: ${href}`);
  assert.ok(fs.existsSync(resolved), `${fromFile} links to missing walkthrough file ${href}`);
}

test('walkthrough markdown links resolve locally or use safe external URLs', () => {
  for (const file of listMarkdownFiles(walkthroughRoot)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const href of markdownLinks(text)) {
      if (/^https:\/\//.test(href)) {
        assert.doesNotMatch(href, /\s/);
        continue;
      }
      assert.doesNotMatch(href, /^http:\/\//, `${file} should not use insecure http link ${href}`);
      assertLocalPathExists(file, href);
    }
  }
});

test('walkthrough index, inventory, and catalog stay in sync', () => {
  const inventory = JSON.parse(fs.readFileSync(path.join(walkthroughRoot, 'SETUP-CENTER-INVENTORY.json'), 'utf8'));
  const { buildOwnerSetupCatalog, listOwnerSetupIntegrationIds } = require('../src/lib/integrations/setup-catalog');
  const catalog = buildOwnerSetupCatalog({ generatedAt: '2026-06-24T00:00:00.000Z', env: {} });
  const ids = listOwnerSetupIntegrationIds();
  assert.deepEqual(inventory.integrations.map((item) => item.id), ids);
  assert.deepEqual(catalog.cards.map((card) => card.id), ids);
  for (const card of catalog.cards) {
    const walkthroughPath = path.join(repoRoot, card.walkthroughPath);
    assert.ok(fs.existsSync(walkthroughPath), `${card.id} walkthrough exists`);
    const walkthrough = fs.readFileSync(walkthroughPath, 'utf8');
    assert.match(walkthrough, /^# .+/m, `${card.id} has a title`);
    assert.match(walkthrough, new RegExp(`/integration-setup\\.html#${card.id}\\b`), `${card.id} names its setup anchor`);
  }
});
