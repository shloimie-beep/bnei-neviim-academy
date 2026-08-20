const fs = require('node:fs');
const path = require('node:path');

const serviceRoot = path.resolve(__dirname, '..');

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(serviceRoot, 'fixtures', name), 'utf8'));
}

function deepMerge(base, patch) {
  if (Array.isArray(base) || Array.isArray(patch) || !base || !patch || typeof base !== 'object' || typeof patch !== 'object') {
    return patch === undefined ? base : patch;
  }
  const output = { ...base };
  for (const [key, value] of Object.entries(patch)) output[key] = deepMerge(base[key], value);
  return output;
}

function withPatch(name, patch) {
  return deepMerge(fixture(name), patch);
}

module.exports = {
  fixture,
  serviceRoot,
  withPatch,
};
