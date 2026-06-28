#!/usr/bin/env node
'use strict';

const path = require('path');

const {
  DEFAULT_AUDIT_DIR,
  DEFAULT_DIGEST_DIR,
  writeContentCardTopicFilterAudit,
} = require('../src/lib/bna/content-card-view-model');

function parseArgs(argv) {
  const options = {
    digestRoot: DEFAULT_DIGEST_DIR,
    outDir: DEFAULT_AUDIT_DIR,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--digest-root') options.digestRoot = argv[++index];
    else if (arg.startsWith('--digest-root=')) options.digestRoot = arg.slice('--digest-root='.length);
    else if (arg === '--out-dir') options.outDir = argv[++index];
    else if (arg.startsWith('--out-dir=')) options.outDir = arg.slice('--out-dir='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { audit, jsonPath, mdPath } = writeContentCardTopicFilterAudit(options);
  console.log([
    'Content card topic filter audit complete.',
    `Digest root: ${options.digestRoot}`,
    `Recordings audited: ${audit.recording_count}`,
    `Raw transcript bodies included: ${audit.raw_transcript_bodies_included}`,
    `Generated titles: ${audit.summary.generated_title}`,
    `Needs parse: ${audit.summary.needs_parse}`,
    `Needs routing: ${audit.summary.needs_routing}`,
    `Needs topic classification: ${audit.summary.needs_topic_classification}`,
    `JSON: ${path.relative(process.cwd(), jsonPath)}`,
    `Markdown: ${path.relative(process.cwd(), mdPath)}`,
  ].join('\n'));
}

main();
