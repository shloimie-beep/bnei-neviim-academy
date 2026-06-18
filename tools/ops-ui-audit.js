#!/usr/bin/env node
const path = require('node:path');
const { loadConfig } = require('./ops-ui-audit/config');
const { runAuth } = require('./ops-ui-audit/auth');
const { runAudit, smokeLogin } = require('./ops-ui-audit/crawler');
const { createReviewPackage } = require('./ops-ui-audit/package-export');

function help() {
  return `BNA Operations UI Audit

Commands:
  npm run ops:audit:auth
      Open headed Chromium for one-time manual Operations login and save local storage state.

  npm run ops:audit
      Run the authenticated, read-only Operations UI crawl with redacted screenshots.

  npm run ops:audit:headed
      Run the audit in headed mode.

  npm run ops:audit -- package <run-directory>
      Rebuild agent-review-package.zip for an existing run directory.

  npm run ops:audit -- smoke-login
      Credential-free smoke that verifies an unauthenticated browser reaches login.

Environment defaults:
  OPS_AUDIT_BASE_URL=https://bneineviimacademy.org
  OPS_AUDIT_START_PATH=/operations
  OPS_AUDIT_STORAGE_STATE=.runtime/auth/operations-storage-state.json
  OPS_AUDIT_OUTPUT_ROOT=ops/ui-audits/runs
  OPS_AUDIT_PRIVACY_MODE=redact
  OPS_AUDIT_MAX_STATES=250
  OPS_AUDIT_MAX_ACTIONS_PER_STATE=80
  OPS_AUDIT_HEADLESS=true
  OPS_AUDIT_TIMEOUT_MS=30000
`;
}

async function main(argv = process.argv.slice(2)) {
  const config = loadConfig();
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === 'help') {
    console.log(help());
    return;
  }
  if (command === 'auth') {
    await runAuth(config);
    return;
  }
  if (command === 'package' || (command === 'run' && rest[0] === 'package')) {
    const runDirArg = command === 'package' ? rest[0] : rest[1];
    if (!runDirArg) throw new Error('Missing run directory for package command.');
    const runDir = path.isAbsolute(runDirArg) ? runDirArg : path.resolve(config.repoRoot, runDirArg);
    const result = createReviewPackage(runDir);
    console.log(`Rebuilt ZIP: ${result.outputPath}`);
    return;
  }
  if (command === 'smoke-login' || (command === 'run' && rest[0] === 'smoke-login')) {
    const result = await smokeLogin(config);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (command === 'run') {
    const headed = rest.includes('--headed');
    const result = await runAudit(config, { headed });
    console.log(`Audit folder: ${result.runDir}`);
    console.log(`Agent review ZIP: ${result.zipPath}`);
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${help()}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exitCode = 1;
  });
}

module.exports = {
  help,
  main,
};
