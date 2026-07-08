#!/usr/bin/env node
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
const pipeline = require('../src/lib/bna/one-time-vimeo-studio-pipeline');

function printHelp() {
  console.log(`One Time Vimeo studio folder processor

Plan-only scan:
  npm run one-time:vimeo-studio -- --folder "G:/My Drive/..." --no-render --write-report

Synthetic/local render:
  node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/one-time-vimeo-studio-drop --render --write-report

Optional edge trim:
  node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/one-time-vimeo-studio-drop --render --auto-trim-edges --default-trim-start 0 --default-trim-end 0

Optional local transcription smoke:
  node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/one-time-vimeo-studio-drop --render --transcribe-openai

The v1 processor performs no real Vimeo upload, no production DB mutation, no member publish, and no bot knowledge promotion.`);
}

function parseArgs(argv = []) {
  const args = {
    repoRoot: process.cwd(),
    folder: '',
    processedFolder: '',
    reportDir: '',
    recursive: false,
    limit: 0,
    render: false,
    runVimeoDryRun: true,
    writeReport: false,
    json: false,
    ensureFolder: true,
    defaultTrimStartSeconds: pipeline.DEFAULT_TRIM_START_SECONDS,
    defaultTrimEndSeconds: pipeline.DEFAULT_TRIM_END_SECONDS,
    openerSeconds: pipeline.DEFAULT_OPENER_SECONDS,
    autoTrimEdges: false,
    autoTrimMaxEdgeSeconds: pipeline.DEFAULT_AUTO_TRIM_MAX_EDGE_SECONDS,
    blackDetectThreshold: 0.98,
    blackDetectDuration: 0.4,
    silenceThresholdDb: -35,
    silenceDetectDuration: 0.5,
    transcribeOpenAI: false,
    transcriptionModel: '',
    width: 1920,
    height: 1080,
    fontPath: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--repo-root') {
      args.repoRoot = argv[index + 1] || args.repoRoot;
      index += 1;
    } else if (arg === '--folder' || arg === '--inbox') {
      args.folder = argv[index + 1] || args.folder;
      index += 1;
    } else if (arg === '--processed-folder' || arg === '--out-folder') {
      args.processedFolder = argv[index + 1] || args.processedFolder;
      index += 1;
    } else if (arg === '--report-dir') {
      args.reportDir = argv[index + 1] || args.reportDir;
      index += 1;
    } else if (arg === '--recursive') {
      args.recursive = true;
    } else if (arg === '--limit') {
      args.limit = Number(argv[index + 1] || 0) || 0;
      index += 1;
    } else if (arg === '--render') {
      args.render = true;
    } else if (arg === '--no-render' || arg === '--dry-run') {
      args.render = false;
    } else if (arg === '--skip-vimeo-dry-run') {
      args.runVimeoDryRun = false;
    } else if (arg === '--write-report') {
      args.writeReport = true;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--no-ensure-folder') {
      args.ensureFolder = false;
    } else if (arg === '--default-trim-start') {
      args.defaultTrimStartSeconds = Number(argv[index + 1] || args.defaultTrimStartSeconds);
      index += 1;
    } else if (arg === '--default-trim-end') {
      args.defaultTrimEndSeconds = Number(argv[index + 1] || args.defaultTrimEndSeconds);
      index += 1;
    } else if (arg === '--opener-seconds') {
      args.openerSeconds = Number(argv[index + 1] || args.openerSeconds);
      index += 1;
    } else if (arg === '--auto-trim-edges') {
      args.autoTrimEdges = true;
    } else if (arg === '--auto-trim-max-edge') {
      args.autoTrimMaxEdgeSeconds = Number(argv[index + 1] || args.autoTrimMaxEdgeSeconds);
      index += 1;
    } else if (arg === '--black-threshold') {
      args.blackDetectThreshold = Number(argv[index + 1] || args.blackDetectThreshold);
      index += 1;
    } else if (arg === '--black-duration') {
      args.blackDetectDuration = Number(argv[index + 1] || args.blackDetectDuration);
      index += 1;
    } else if (arg === '--silence-threshold-db') {
      args.silenceThresholdDb = Number(argv[index + 1] || args.silenceThresholdDb);
      index += 1;
    } else if (arg === '--silence-duration') {
      args.silenceDetectDuration = Number(argv[index + 1] || args.silenceDetectDuration);
      index += 1;
    } else if (arg === '--transcribe-openai') {
      args.transcribeOpenAI = true;
    } else if (arg === '--transcription-model') {
      args.transcriptionModel = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--width') {
      args.width = Number(argv[index + 1] || args.width);
      index += 1;
    } else if (arg === '--height') {
      args.height = Number(argv[index + 1] || args.height);
      index += 1;
    } else if (arg === '--font') {
      args.fontPath = argv[index + 1] || '';
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function summarize(report) {
  const summary = report.summary || {};
  return [
    `One Time Vimeo studio pipeline: ${summary.candidate_count || 0} candidate(s).`,
    `Rendered: ${summary.rendered_count || 0}.`,
    `Sidecars: ${summary.sidecar_count || 0}.`,
    `External Vimeo write: ${report.external_write_performed === true}.`,
    `Production mutation: ${report.production_mutation_performed === true}.`,
    `Member visibility: ${report.member_visibility_performed === true}.`,
    report.report_paths?.md ? `Report: ${path.relative(process.cwd(), report.report_paths.md)}` : '',
  ].filter(Boolean).join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  const report = await pipeline.runStudioPipeline(args);
  if (args.writeReport) {
    report.report_paths = pipeline.writeWorkflowReport(report, args);
  }
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(summarize(report));
  }
  if (!report.ok || report.summary?.blockers_count > 0) {
    process.exitCode = report.summary?.candidate_count ? 2 : 0;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
