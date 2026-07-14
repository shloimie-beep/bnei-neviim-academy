#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const {
  generateChangeReceipt,
  validateIntentSpec,
} = require('../src/lib/bna/intent-preservation');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv = process.argv.slice(2)) {
  const options = { spec: '', out: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out') options.out = argv[++index] || '';
    else if (arg.startsWith('--out=')) options.out = arg.slice('--out='.length);
    else if (!arg.startsWith('--') && !options.spec) options.spec = arg;
  }
  return options;
}

export function runReceipt(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (!options.spec) throw new Error('Usage: node scripts/generate-intent-receipt.mjs SPEC.json [--out RECEIPT.md]');
  const specPath = path.resolve(ROOT, options.spec);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const validation = validateIntentSpec(spec, { root: ROOT, specPath });
  if (!validation.ok) {
    const error = new Error(`Spec validation failed: ${[...new Set(validation.errors.map((item) => item.code))].join(', ')}`);
    error.validation = validation;
    throw error;
  }
  const receipt = generateChangeReceipt(spec);
  if (options.out) {
    const outPath = path.resolve(ROOT, options.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, receipt);
  } else {
    process.stdout.write(receipt);
  }
  return { receipt };
}

async function main() {
  try {
    runReceipt();
  } catch (error) {
    console.error(`Intent receipt generator error: ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
