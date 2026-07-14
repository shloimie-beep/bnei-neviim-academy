#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outgoingRoot = path.join(repoRoot, 'ops', 'chatgpt-ramble-dropoff', 'outgoing');

const DEFAULT_LANES = [
  {
    suffix: 'atomic-spec-receipt',
    role: 'intent_preservation_spec',
    title: 'Atomic Intent Spec And Receipt',
    scope: 'Preserve the full raw source, create SPEC.json with one atomic change per independently testable operation, generate RECEIPT.md from the spec, and block unresolved ambiguities without implementation.',
    output: 'A repo-visible prompt_packet containing RAW.md, SPEC.json, generated RECEIPT.md, generated CODEX_PROMPT.md only when the spec is ready, and exact blockers for unresolved atoms.',
  },
  {
    suffix: 'ambiguity-resolution-audit',
    role: 'intent_ambiguity_resolution',
    title: 'Ambiguity Resolution Audit',
    scope: 'Inspect repo history, current DOM/code, assets, screenshots, and prior raw files only to resolve ambiguous source atoms. Do not implement product code.',
    output: 'A repo-visible current_state_audit packet that updates or blocks only the affected SPEC.json atoms with focused resolution questions and 2-3 choices.',
  },
  {
    suffix: 'pqc-product-completeness',
    role: 'product_quality_compiler_packet',
    title: 'PQC Completeness Packet',
    scope: 'After the intent spec is validated and unambiguous, expand only those atoms through PQC for product completeness, states, screenshots, safety, and closeout gates.',
    output: 'A repo-visible product-quality packet that references SPEC.json fingerprint and contains no implementation prompt that drifts from the validated spec.',
  },
  {
    suffix: 'implementation-by-change-id',
    role: 'implementation_bundle_by_change_id',
    title: 'Implementation Bundle By Change ID',
    scope: 'Prepare code changes only for validated implementation-ready change IDs. Every patch, test, and evidence item must name the change ID it satisfies.',
    output: 'A repo-visible implementation_bundle packet with SPEC.json, RECEIPT.md, generated CODEX_PROMPT.md, PATCHES.md when useful, tests, and evidence expectations per change ID.',
  },
  {
    suffix: 'verifier-change-id-closeout',
    role: 'verifier_change_id_closeout',
    title: 'Verifier And Change-ID Closeout',
    scope: 'Verify that implementation, tests, screenshots/evidence, packet status, and closeout records satisfy every included change ID without adding unscoped work.',
    output: 'A repo-visible verifier packet with pass/fail/blocker status per change ID, spec fingerprint, stale prompt check, and exact next packet or blocker.',
  },
];

function nowDate() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function slugify(value, fallback = 'chatgpt-packet-prompts') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || fallback;
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    write: false,
    rawFile: '',
    rawText: '',
    title: '',
    batchId: '',
    workspace: 'bna_platform',
    project: '',
    promptCount: 5,
    outDir: '',
    parentRawId: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write') options.write = true;
    else if (arg === '--raw-file') options.rawFile = argv[++index] || '';
    else if (arg.startsWith('--raw-file=')) options.rawFile = arg.slice('--raw-file='.length);
    else if (arg === '--raw-text') options.rawText = argv[++index] || '';
    else if (arg.startsWith('--raw-text=')) options.rawText = arg.slice('--raw-text='.length);
    else if (arg === '--title') options.title = argv[++index] || '';
    else if (arg.startsWith('--title=')) options.title = arg.slice('--title='.length);
    else if (arg === '--batch-id') options.batchId = argv[++index] || '';
    else if (arg.startsWith('--batch-id=')) options.batchId = arg.slice('--batch-id='.length);
    else if (arg === '--workspace') options.workspace = argv[++index] || options.workspace;
    else if (arg.startsWith('--workspace=')) options.workspace = arg.slice('--workspace='.length);
    else if (arg === '--project') options.project = argv[++index] || '';
    else if (arg.startsWith('--project=')) options.project = arg.slice('--project='.length);
    else if (arg === '--parent-raw-id') options.parentRawId = argv[++index] || '';
    else if (arg.startsWith('--parent-raw-id=')) options.parentRawId = arg.slice('--parent-raw-id='.length);
    else if (arg === '--count') options.promptCount = Number(argv[++index] || 0);
    else if (arg.startsWith('--count=')) options.promptCount = Number(arg.slice('--count='.length) || 0);
    else if (arg === '--out-dir') options.outDir = argv[++index] || '';
    else if (arg.startsWith('--out-dir=')) options.outDir = arg.slice('--out-dir='.length);
  }
  return options;
}

function readRaw(options) {
  if (options.rawText) return options.rawText;
  if (!options.rawFile) return '';
  const absolute = path.resolve(repoRoot, options.rawFile);
  if (!fs.existsSync(absolute)) throw new Error(`Raw file not found: ${options.rawFile}`);
  return fs.readFileSync(absolute, 'utf8');
}

function resolveBatch(options) {
  const titleSlug = slugify(options.title || options.parentRawId || path.basename(options.rawFile || ''), 'chatgpt-packet-prompts');
  const batchId = slugify(options.batchId || `${nowDate()}-${titleSlug}`, `${nowDate()}-chatgpt-packet-prompts`);
  const outDir = path.resolve(repoRoot, options.outDir || path.join(outgoingRoot, batchId));
  return { batchId, outDir, titleSlug };
}

function laneSet(count) {
  const requested = Math.max(1, Math.min(Number(count || 5), DEFAULT_LANES.length));
  return DEFAULT_LANES.slice(0, requested);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function sourceBlock(rawText, options) {
  const sourcePath = options.rawFile ? options.rawFile.replace(/\\/g, '/') : '';
  if (sourcePath) {
    return [
      `Read the full parent raw source from \`${sourcePath}\`.`,
      '',
      'Do not treat any prompt excerpt, summary, or shortened source as authority.',
      'The authoritative source for SPEC.json hashing and source-span offsets is the full file above.',
    ].join('\n');
  }
  return [
    'The full parent raw source is embedded below because no repo raw file was provided.',
    '',
    '```text',
    String(rawText || '').trim() || '[no raw source provided]',
    '```',
  ].join('\n');
}

function promptForLane({ lane, laneIndex, batchId, options, rawText }) {
  const num = String(laneIndex + 1).padStart(2, '0');
  const packetId = `${batchId}-${num}-${lane.suffix}`;
  const laneKey = `${slugify(options.workspace)}-${slugify(options.project || 'general')}-${lane.suffix}`;
  const rawId = options.parentRawId || 'RAW-YYYYMMDD-###';
  return `# ChatGPT Window ${num}: ${lane.title}

You are a repo-connected ChatGPT sidekick for BNA. Your job is to create one
repo-visible packet for Codex. Do not solve the whole parent ramble. Complete
only this prompt's scope and record the next packet or blocker.

## Required Read Order

1. \`BNA-START-HERE.md\`
2. \`AGENTS.md\`
3. \`docs/BNA-RAMBLE-TO-DONE.md\`
4. \`ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md\`
5. \`ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md\`
6. \`ops/chatgpt-ramble-dropoff/README.md\`
7. \`ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md\` when present

## Lane

- Parent raw ID: \`${rawId}\`
- Prompt batch: \`${batchId}\`
- Prompt ID: \`${packetId}\`
- Packet ID to create: \`${packetId}\`
- Packet role: \`${lane.role}\`
- Owner: \`ChatGPT-window-${num}\`
- Workspace: \`${options.workspace}\`
- Project: \`${options.project || 'general'}\`
- Lane key: \`${laneKey}\`

## Scope

${lane.scope}

## Out Of Scope

- Do not solve the whole parent ramble.
- Do not edit unrelated product/code lanes.
- Do not claim Codex verification, deployment, live smoke, payment, send,
  access grant, DNS/account, credential, provider account, Drive, WhatsApp/WAPI,
  Telegram-recipient, or production-data mutations.
- Do not duplicate work if the control tower already shows this lane active,
  blocked, or terminal.

## Required Output

Create a repo-visible packet folder:

\`ops/chatgpt-ramble-dropoff/incoming/${packetId}/\`

The folder must include:

- \`packet.json\`
- \`RAW.md\`
- \`SPEC.json\`
- \`RECEIPT.md\`
- \`CODEX_PROMPT.md\`
- \`MANIFEST.json\`
- \`status.json\`
- \`PATCHES.md\` when code/diff help is useful
- optional \`attachments/\`

Set \`status.json.status\` to \`ready_for_codex_audit\` or
\`ready_for_codex_pickup\` only when the packet is complete.

Expected output from this lane:

${lane.output}

## Intent Preservation Gate

New implementation, UI, product, correction, and prompt packets must include a
validated \`SPEC.json\`. \`CODEX_PROMPT.md\` must be generated from that spec and
must include the spec fingerprint and every included change ID. If any atom is
ambiguous, keep that atom blocked and do not include it in an implementation-
ready prompt.

## Parent Source

${sourceBlock(rawText, options)}
`;
}

function buildPackage(options = parseArgs()) {
  const rawText = readRaw(options);
  const { batchId, outDir } = resolveBatch(options);
  const lanes = laneSet(options.promptCount);
  const promptsDir = path.join(outDir, 'prompts');
  const prompts = lanes.map((lane, index) => {
    const name = `${String(index + 1).padStart(2, '0')}-${lane.suffix}.md`;
    return {
      id: `${batchId}-${String(index + 1).padStart(2, '0')}-${lane.suffix}`,
      lane,
      path: path.join(promptsDir, name),
      relative_path: relative(path.join(promptsDir, name)),
      content: promptForLane({ lane, laneIndex: index, batchId, options, rawText }),
    };
  });
  const manifest = {
    schema_version: 'bna.chatgpt_prompt_split.v1',
    generated_at: new Date().toISOString(),
    batch_id: batchId,
    parent_raw_id: options.parentRawId || '',
    title: options.title || '',
    workspace: options.workspace,
    project: options.project || '',
    raw_file: options.rawFile ? options.rawFile.replace(/\\/g, '/') : '',
    prompt_count: prompts.length,
    prompts: prompts.map((prompt) => ({
      prompt_id: prompt.id,
      packet_role: prompt.lane.role,
      lane_key: `${slugify(options.workspace)}-${slugify(options.project || 'general')}-${prompt.lane.suffix}`,
      path: prompt.relative_path,
      packet_id_to_create: prompt.id,
      scope: prompt.lane.scope,
    })),
    handoff_rule: 'Paste one prompt into one ChatGPT window. Each window creates only its assigned packet folder and status.json.',
  };
  const readme = `# ChatGPT Multi-Window Prompt Batch

- Batch ID: \`${batchId}\`
- Parent raw ID: \`${options.parentRawId || ''}\`
- Title: ${options.title || ''}
- Workspace/project: \`${options.workspace}\` / \`${options.project || 'general'}\`

Use one prompt per ChatGPT window. Do not paste all prompts into one window.
Each window must create only its assigned packet under
\`ops/chatgpt-ramble-dropoff/incoming/\`.

Before pasting prompts, check:

\`\`\`bash
npm run chatgpt:dropoff:tower
\`\`\`

## Prompts

${prompts.map((prompt, index) => `${index + 1}. [${path.basename(prompt.relative_path)}](${prompt.relative_path})`).join('\n')}
`;
  return {
    batch_id: batchId,
    out_dir: outDir,
    manifest,
    readme,
    prompts,
  };
}

function writePackage(pkg) {
  fs.mkdirSync(path.join(pkg.out_dir, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(pkg.out_dir, 'manifest.json'), `${JSON.stringify(pkg.manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(pkg.out_dir, 'README.md'), pkg.readme);
  for (const prompt of pkg.prompts) {
    fs.writeFileSync(prompt.path, prompt.content);
  }
}

function main() {
  const options = parseArgs();
  const pkg = buildPackage(options);
  if (options.write) writePackage(pkg);
  const summary = {
    batch_id: pkg.batch_id,
    out_dir: relative(pkg.out_dir),
    prompt_count: pkg.prompts.length,
    prompts: pkg.prompts.map((prompt) => prompt.relative_path),
    written: options.write,
  };
  console.log(JSON.stringify(summary, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}

export {
  buildPackage,
  DEFAULT_LANES,
  laneSet,
  parseArgs,
  promptForLane,
  slugify,
};
