import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { createIntakeSourceRecord } = require('../src/platform/ingestion/intake-source');
const {
  createParentPrompt,
  appendChildOutcome,
  transitionPrompt,
  buildQueueViewModel,
  buildPromptDetailViewModel,
  buildRambleStatusViewModel,
} = require('../src/platform/ingestion/prompt-queue');

const rawText = process.argv.find((arg) => arg.startsWith('--text='))
  ?.slice('--text='.length)
  || fs.readFileSync(0, 'utf8');

const source = createIntakeSourceRecord({
  source_provider: 'manual',
  source_kind: 'text',
  raw_text: rawText || 'Demo prompt queue item',
});
let prompt = createParentPrompt({ source_record: source, status: 'queued', agent: 'Codex' });
prompt = transitionPrompt(prompt, 'in_progress', { current_phase: 'contract_demo' });
prompt = appendChildOutcome(prompt, {
  item_type: 'task',
  title: 'Verify prompt queue contract',
  status: 'queued',
});

process.stdout.write(`${JSON.stringify({
  queue: buildQueueViewModel([prompt]),
  prompt: buildPromptDetailViewModel(prompt),
  ramble_status: buildRambleStatusViewModel(prompt),
}, null, 2)}\n`);
