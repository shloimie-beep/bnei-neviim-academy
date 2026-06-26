#!/usr/bin/env node
'use strict';

const path = require('path');

const {
  DEFAULT_AUDIT_DIR,
  DEFAULT_OUTPUT_DIR,
  scanOutputForLeaks,
  writeDigestOutputs,
} = require('../src/lib/bna/transcript-digest-export');

function parseArgs(argv) {
  const options = {
    auditDir: DEFAULT_AUDIT_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    dryRun: false,
    manifestOnly: false,
    deleteStale: false,
    includeRawTranscript: false,
    privacyScan: false,
    jobIds: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--audit-dir') options.auditDir = argv[++index];
    else if (arg.startsWith('--audit-dir=')) options.auditDir = arg.slice('--audit-dir='.length);
    else if (arg === '--out-dir') options.outputDir = argv[++index];
    else if (arg.startsWith('--out-dir=')) options.outputDir = arg.slice('--out-dir='.length);
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--manifest-only') options.manifestOnly = true;
    else if (arg === '--delete-stale') options.deleteStale = true;
    else if (arg === '--include-raw-transcript') options.includeRawTranscript = true;
    else if (arg === '--privacy-scan') options.privacyScan = true;
    else if (arg === '--job-id') options.jobIds.push(Number(argv[++index]));
    else if (arg.startsWith('--job-id=')) options.jobIds.push(Number(arg.slice('--job-id='.length)));
    else if (/^\d+$/.test(arg)) options.jobIds.push(Number(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.includeRawTranscript) {
    throw new Error(
      '--include-raw-transcript is intentionally unsupported by this repo-safe digest exporter. ' +
      'Use private Drive/app database tooling for raw transcript bodies.'
    );
  }

  const result = writeDigestOutputs(options);
  const outputPath = path.resolve(options.outputDir);
  const lines = [
    options.dryRun ? 'Transcript digest export dry run complete.' : 'Transcript digest export complete.',
    `Audit source: ${options.auditDir}`,
    `Output: ${options.outputDir}`,
    `Recordings: ${result.manifest.recording_count}`,
    `Raw transcript bodies included: ${result.manifest.raw_transcript_bodies_included}`,
    `Delete stale requested: ${options.deleteStale}`,
    `Manifest only: ${options.manifestOnly}`,
  ];

  if (options.privacyScan && !options.dryRun) {
    const findings = scanOutputForLeaks(outputPath);
    lines.push(`Privacy scan findings: ${findings.length}`);
    if (findings.length) {
      for (const finding of findings.slice(0, 20)) {
        lines.push(`- ${path.relative(process.cwd(), finding.file)}: ${finding.kind}`);
      }
      process.exitCode = 1;
    }
  }

  console.log(lines.join('\n'));
}

main();
