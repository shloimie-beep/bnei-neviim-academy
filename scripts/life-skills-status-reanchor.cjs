#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { parseInvocationArgs, runAuthorizedReanchorInvocation } = require('../src/lib/bna/life-skills-status-reanchor-invocation');

async function main() {
  const { authorizationFile } = parseInvocationArgs(process.argv.slice(2));
  const absolute = path.resolve(authorizationFile);
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('STATUS_REANCHOR_AUTHORIZATION_FILE_INVALID');
  const invocation = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  const receipt = await runAuthorizedReanchorInvocation(invocation);
  console.log(JSON.stringify(receipt, null, 2));
  if (receipt.result.state !== 'SCHEDULED') process.exitCode = 2;
}

main().catch(error => {
  console.error(JSON.stringify({ state: 'BLOCKED', reason: String(error?.message || error) }));
  process.exitCode = 1;
});
