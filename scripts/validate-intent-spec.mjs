#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const {
  validateIntentSpec,
} = require('../src/lib/bna/intent-preservation');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_DIR = path.join(ROOT, 'ops', 'intent-preservation', 'validation');

function asRepoPath(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function collectFiles(dir) {
  const root = path.resolve(ROOT, dir);
  if (!fs.existsSync(root)) return [];
  const files = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) files.push(full);
    }
  };
  walk(root);
  return files.sort();
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function summarize(file, result, expectedFailureCodes = []) {
  const actualCodes = [...new Set(result.errors.map((error) => error.code))];
  if (expectedFailureCodes.length) {
    const missing = expectedFailureCodes.filter((code) => !actualCodes.includes(code));
    return {
      file,
      expected_failure_codes: expectedFailureCodes,
      actual_failure_codes: actualCodes,
      passed: result.errors.length > 0 && missing.length === 0,
      missing_expected_failure_codes: missing,
      errors: result.errors,
      coverage: result.coverage,
    };
  }
  return {
    file,
    expected_failure_codes: [],
    actual_failure_codes: actualCodes,
    passed: result.ok,
    errors: result.errors,
    coverage: result.coverage,
  };
}

function writeReport(results, mode, files) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonPath = path.join(REPORT_DIR, 'latest-intent-validation.json');
  const mdPath = path.join(REPORT_DIR, 'latest-intent-validation.md');
  const failed = results.filter((result) => !result.passed);
  const payload = {
    generated_at: new Date().toISOString(),
    mode,
    files_scanned: files.map(asRepoPath),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results: results.map((result) => ({
      ...result,
      file: asRepoPath(result.file),
    })),
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  const lines = [
    '# Intent Preservation Validation',
    '',
    `Generated: ${payload.generated_at}`,
    `Mode: ${mode}`,
    `Files scanned: ${payload.files_scanned.length}`,
    `Passed: ${payload.passed}`,
    `Failed: ${payload.failed}`,
    '',
  ];
  for (const result of payload.results) {
    lines.push(`## ${result.passed ? 'PASS' : 'FAIL'} ${result.file}`);
    if (result.expected_failure_codes?.length) {
      lines.push(`Expected failure codes: ${result.expected_failure_codes.join(', ')}`);
    }
    if (result.actual_failure_codes?.length) {
      lines.push(`Actual failure codes: ${result.actual_failure_codes.join(', ')}`);
    }
    if (result.coverage) {
      lines.push(`Coverage: hard ${result.coverage.hard_signal_covered_count}/${result.coverage.hard_signal_count}; actionable ${result.coverage.covered_actionable_span_count}/${result.coverage.actionable_span_count}`);
    }
    if (result.errors?.length) {
      lines.push('');
      lines.push('| Code | Path | Message |');
      lines.push('|---|---|---|');
      for (const error of result.errors) {
        lines.push(`| ${error.code} | \`${error.path}\` | ${String(error.message).replace(/\|/g, '\\|')} |`);
      }
    }
    lines.push('');
  }
  fs.writeFileSync(mdPath, `${lines.join('\n').trimEnd()}\n`);
  return { jsonPath, mdPath, failedCount: failed.length };
}

export function runValidation(argv = process.argv.slice(2)) {
  const fixtureMode = argv.includes('--fixtures');
  const args = argv.filter((arg) => !arg.startsWith('--'));
  const files = fixtureMode
    ? collectFiles(path.join('ops', 'intent-preservation', 'fixtures'))
    : args.map((arg) => path.resolve(ROOT, arg));
  if (!files.length) {
    throw new Error(fixtureMode ? 'No intent fixtures found.' : 'Pass at least one SPEC.json path or --fixtures.');
  }
  const results = files.map((file) => {
    try {
      const json = loadJson(file);
      const expected = Array.isArray(json.expected_failure_codes) ? json.expected_failure_codes : [];
      const spec = { ...json };
      delete spec.expected_failure_codes;
      delete spec.fixture_description;
      const result = validateIntentSpec(spec, { root: ROOT, specPath: file });
      return summarize(file, result, expected);
    } catch (error) {
      return {
        file,
        expected_failure_codes: [],
        actual_failure_codes: ['IPG_SCHEMA_INVALID'],
        passed: false,
        errors: [{ code: 'IPG_SCHEMA_INVALID', path: '$', message: error instanceof Error ? error.message : String(error) }],
      };
    }
  });
  const report = writeReport(results, fixtureMode ? 'fixtures' : 'explicit', files);
  return {
    exitCode: report.failedCount > 0 ? 1 : 0,
    report,
    results,
  };
}

async function main() {
  try {
    const { exitCode, report } = runValidation();
    console.log(`Intent preservation validation report: ${asRepoPath(report.mdPath)}`);
    console.log(`Intent preservation validation JSON: ${asRepoPath(report.jsonPath)}`);
    process.exitCode = exitCode;
  } catch (error) {
    console.error(`Intent preservation validator error: ${error.stack || error.message}`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
