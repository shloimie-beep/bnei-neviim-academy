const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('Railway shared config stays process-neutral for web and worker services', () => {
  const railwayConfig = JSON.parse(read('railway.json'));

  assert.equal(railwayConfig.build?.builder, 'NIXPACKS');
  assert.equal(railwayConfig.deploy, undefined);
});

test('Docker image starts through the Railway process dispatcher', () => {
  const dockerfile = read('Dockerfile');

  assert.match(dockerfile, /CMD \["node", "scripts\/railway-start\.mjs"\]/);
});

test('Railway dispatcher maps Rabbi worker selector to the scoped Telegram script', () => {
  const starter = read('scripts/railway-start.mjs');

  assert.match(starter, /BNA_RAILWAY_PROCESS/);
  assert.match(starter, /\['telegram-rabbi', \{ command: 'npm', args: \['run', 'telegram:rabbi'\] \}\]/);
  assert.match(starter, /\['web', \{ command: 'node', args: \['server\.js'\] \}\]/);
});
