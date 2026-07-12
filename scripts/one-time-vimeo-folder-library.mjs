#!/usr/bin/env node
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
const workflow = require('../src/lib/bna/one-time-vimeo-folder-library');

function printHelp() {
  console.log(`One Time Vimeo folder-to-library workflow

Dry-run scan:
  npm run one-time:vimeo-library

Create a scoped review package after dry-run evidence:
  node scripts/one-time-vimeo-folder-library.mjs --apply --create-review-package --review-confirm ${workflow.REVIEW_PACKAGE_CONFIRMATION}

Upload a reviewed synthetic/private test video:
  node scripts/one-time-vimeo-folder-library.mjs --apply --upload --upload-confirm ${workflow.VIMEO_UPLOAD_CONFIRMATION}

Real class recordings require --allow-real-media plus the exact upload confirmation.
Member-library publishing also requires --approval-flag ${workflow.ONE_TIME_LIBRARY_APPROVAL_FLAG}.`);
}

function parseArgs(argv = []) {
  const args = {
    repoRoot: process.cwd(),
    folder: '',
    recursive: false,
    limit: 0,
    apply: false,
    upload: false,
    uploadConfirmation: '',
    allowRealMedia: false,
    createReviewPackage: false,
    reviewConfirmation: '',
    publish: false,
    approvalFlag: '',
    libraryVisibility: 'tier',
    requiredTier: 'library_only',
    databaseUrl: '',
    vimeoProjectUri: '',
    writeReport: false,
    json: false,
    ensureFolder: true,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--repo-root') {
      args.repoRoot = argv[index + 1] || args.repoRoot;
      index += 1;
    } else if (arg === '--folder') {
      args.folder = argv[index + 1] || args.folder;
      index += 1;
    } else if (arg === '--recursive') {
      args.recursive = true;
    } else if (arg === '--limit') {
      args.limit = Number(argv[index + 1] || 0) || 0;
      index += 1;
    } else if (arg === '--apply') {
      args.apply = true;
    } else if (arg === '--upload') {
      args.upload = true;
    } else if (arg === '--upload-confirm' || arg === '--confirm-upload') {
      args.uploadConfirmation = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--allow-real-media') {
      args.allowRealMedia = true;
    } else if (arg === '--create-review-package' || arg === '--write-db') {
      args.createReviewPackage = true;
    } else if (arg === '--review-confirm' || arg === '--confirm-review') {
      args.reviewConfirmation = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--publish') {
      args.publish = true;
    } else if (arg === '--approval-flag') {
      args.approvalFlag = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--library-visibility') {
      args.libraryVisibility = argv[index + 1] || args.libraryVisibility;
      index += 1;
    } else if (arg === '--required-tier') {
      args.requiredTier = argv[index + 1] || args.requiredTier;
      index += 1;
    } else if (arg === '--database-url') {
      args.databaseUrl = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--vimeo-project-uri') {
      args.vimeoProjectUri = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--write-report') {
      args.writeReport = true;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--no-ensure-folder') {
      args.ensureFolder = false;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function summarize(report) {
  const summary = report.summary || {};
  return [
    `One Time Vimeo folder workflow: ${summary.candidate_count || 0} candidate(s).`,
    `Dry run: ${report.dry_run === true}.`,
    `Vimeo access: ${report.vimeo_access_status?.configured ? 'configured' : 'missing'} (${report.vimeo_access_status?.source || 'not configured'}).`,
    `Vimeo test target: ${report.vimeo_test_target_status?.configured ? 'configured' : 'missing'} (${report.vimeo_test_target_status?.source || 'not configured'}).`,
    `External Vimeo write: ${report.external_write_performed === true}.`,
    `Review package DB write: ${report.production_mutation_performed === true}.`,
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
  const report = await workflow.runFolderLibraryWorkflow(args);
  if (args.writeReport) {
    report.report_paths = workflow.writeWorkflowReport(report, args);
  }
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(summarize(report));
  }
  if (args.apply && report.summary?.blockers_count > 0 && !report.external_write_performed && !report.production_mutation_performed) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
