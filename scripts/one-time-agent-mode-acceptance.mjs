#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildOneTimeAgentModeAcceptance } = require('../src/platform/agent-control/one-time-acceptance');

const root = process.cwd();
const outputDir = path.join(root, 'ops', 'one-time-mishnah');
const jsonPath = path.join(outputDir, 'agent-mode-acceptance.json');
const mdPath = path.join(outputDir, 'agent-mode-acceptance.md');

function writeMarkdown(acceptance) {
  const lines = [
    '# One Time Agent Mode Acceptance',
    '',
    `Requirement: ${acceptance.requirement_id}`,
    `Status: ${acceptance.status}`,
    `Checked at: ${acceptance.checked_at}`,
    `Workspace: ${acceptance.workspace_key}`,
    `Project: ${acceptance.project_key}`,
    '',
    '## Stages',
    ...acceptance.stages.map((stage) => [
      `- ${stage.title} (${stage.requirement_id}): ${stage.status}`,
      `  - Evidence: ${stage.evidence}`,
      `  - External write: ${stage.external_write_performed}`,
      `  - Acceptance: ${stage.acceptance.join('; ')}`,
    ].join('\n')),
    '',
    '## Checks',
    ...Object.entries(acceptance.acceptance_checks).map(([key, value]) => `- ${key}: ${value ? 'PASS' : 'FAIL'}`),
    '',
    '## Remaining External Blockers',
    ...acceptance.remaining_external_blockers.map((blocker) => (
      `- ${blocker.key} (${blocker.requirement_id}): ${blocker.status}; owner ${blocker.owner}; next action: ${blocker.next_action}`
    )),
    '',
    '## Guardrails',
    ...acceptance.guardrails.map((item) => `- ${item}`),
    '',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
}

const acceptance = buildOneTimeAgentModeAcceptance({ checked_at: new Date().toISOString() });
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(acceptance, null, 2)}\n`);
writeMarkdown(acceptance);
if (acceptance.status !== 'pass') {
  throw new Error(`One Time Agent Mode acceptance did not pass: ${JSON.stringify({
    missing_stages: acceptance.missing_stages,
    failed_stages: acceptance.failed_stages,
  })}`);
}
console.log(`One Time Agent Mode acceptance written: ${path.relative(root, jsonPath).replace(/\\/g, '/')}`);
