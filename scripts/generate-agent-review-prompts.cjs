#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  AGENT_MODE_PROMPTS,
  buildPromptIndex,
  promptFileName,
  renderAgentModePrompt,
} = require('../src/lib/bna/agent-review-hub');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'public', 'agent-review-prompts');

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || 'https://bneineviimacademy.org',
    outDir: OUT_DIR,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--base-url') args.baseUrl = argv[++i] || args.baseUrl;
    else if (item.startsWith('--base-url=')) args.baseUrl = item.slice('--base-url='.length);
    else if (item === '--out-dir') args.outDir = path.resolve(argv[++i]);
    else if (item.startsWith('--out-dir=')) args.outDir = path.resolve(item.slice('--out-dir='.length));
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  for (const prompt of AGENT_MODE_PROMPTS) {
    fs.writeFileSync(
      path.join(args.outDir, promptFileName(prompt)),
      renderAgentModePrompt(prompt, { baseUrl: args.baseUrl, generatedAt })
    );
  }
  fs.writeFileSync(
    path.join(args.outDir, 'index.json'),
    `${JSON.stringify({
      generated_at: generatedAt,
      prompt_count: AGENT_MODE_PROMPTS.length,
      prompts: buildPromptIndex({ baseUrl: args.baseUrl }),
    }, null, 2)}\n`
  );
  process.stdout.write(`Generated ${AGENT_MODE_PROMPTS.length} Agent Review prompt files in ${args.outDir}\n`);
}

main();
