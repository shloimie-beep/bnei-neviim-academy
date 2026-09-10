const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { serviceRoot } = require('./helpers');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

test('control-plane service does not import product runtime or deployment modules', () => {
  const forbidden = [
    /require\(['"].*src[\\/]+lib[\\/]+bna/i,
    /require\(['"].*src[\\/]+platform[\\/]+instances/i,
    /require\(['"].*server\.js/i,
    /require\(['"].*public[\\/]+/i,
    /require\(['"](?:node:)?child_process['"]\)/,
    /require\(['"]googleapis['"]\)/,
    /require\(['"]stripe['"]\)/i,
    /require\(['"]resend['"]\)/i,
    /require\(['"].*zoom/i,
    /require\(['"].*vimeo/i,
    /require\(['"].*buffer\.com/i,
    /require\(['"].*wapi/i,
    /require\(['"].*railway/i
  ];
  for (const file of walk(path.join(serviceRoot, 'src'))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${path.relative(serviceRoot, file)} matched ${pattern}`);
    }
  }
});

test('package has no runtime dependencies on the existing BNA app', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(serviceRoot, 'package.json'), 'utf8'));
  assert.deepEqual(pkg.dependencies || {}, {});
  assert.equal(pkg.private, true);
});
