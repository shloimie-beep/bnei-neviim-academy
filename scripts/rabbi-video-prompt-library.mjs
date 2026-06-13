#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const libraryPath = path.join(
  repoRoot,
  'content-memory',
  'prompt-patches',
  'rabbi-video-content',
  'library.json',
);

function usage() {
  return [
    'Rabbi video prompt patch composer',
    '',
    'Usage:',
    '  node scripts/rabbi-video-prompt-library.mjs --list',
    '  node scripts/rabbi-video-prompt-library.mjs --stack one-time-vertical-short --topic "Bava Metzia responsibility"',
    '  node scripts/rabbi-video-prompt-library.mjs --patches project-one-time-scope,ratio-wide-youtube,camera-lesson-preview,jewish-mishnayos-visuals',
    '',
    'Flags:',
    '  --list                 List stacks and patch ids',
    '  --stack <id>           Compose a named stack',
    '  --patches <ids>        Compose comma-separated patch ids',
    '  --topic <text>         Topic or source idea',
    '  --audience <text>      Target audience',
    '  --platform <text>      Platform/use case',
    '  --duration <seconds>   Target duration',
    '  --source <text>        Source context note',
    '  --json                 Print machine-readable JSON',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    list: false,
    stackId: '',
    patchIds: [],
    topic: '',
    audience: '',
    platform: '',
    duration: '',
    source: '',
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--list') {
      options.list = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--stack') {
      options.stackId = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--stack=')) {
      options.stackId = arg.slice('--stack='.length);
    } else if (arg === '--patches') {
      options.patchIds.push(...String(argv[index + 1] || '').split(','));
      index += 1;
    } else if (arg.startsWith('--patches=')) {
      options.patchIds.push(...arg.slice('--patches='.length).split(','));
    } else if (arg === '--topic') {
      options.topic = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--topic=')) {
      options.topic = arg.slice('--topic='.length);
    } else if (arg === '--audience') {
      options.audience = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--audience=')) {
      options.audience = arg.slice('--audience='.length);
    } else if (arg === '--platform') {
      options.platform = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--platform=')) {
      options.platform = arg.slice('--platform='.length);
    } else if (arg === '--duration') {
      options.duration = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--duration=')) {
      options.duration = arg.slice('--duration='.length);
    } else if (arg === '--source') {
      options.source = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--source=')) {
      options.source = arg.slice('--source='.length);
    }
  }

  options.patchIds = options.patchIds.map((id) => id.trim()).filter(Boolean);
  return options;
}

function loadLibrary() {
  return JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
}

function mapById(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function resolvePatchIds(library, options) {
  if (options.patchIds.length) return options.patchIds;
  const stack = library.stacks.find((item) => item.id === options.stackId);
  if (!stack) {
    throw new Error(`Unknown stack "${options.stackId || ''}". Use --list to see available stacks.`);
  }
  return stack.patch_ids;
}

function composePrompt(library, options) {
  const patchById = mapById(library.patches);
  const stack = library.stacks.find((item) => item.id === options.stackId) || null;
  const patchIds = resolvePatchIds(library, options);
  const patches = patchIds.map((id) => {
    const patch = patchById.get(id);
    if (!patch) throw new Error(`Unknown patch id "${id}"`);
    return patch;
  });
  const duration = options.duration || stack?.default_duration_seconds || library.defaults.duration_seconds;
  const platform = options.platform || stack?.platform || library.defaults.platform;

  const promptLines = [
    `Create a ${duration}-second video prompt or video plan for ${library.owner_project}.`,
    `Primary person/project context: ${library.primary_person}.`,
    options.topic ? `Topic: ${options.topic}` : 'Topic: [fill in the shiur, source, or video idea]',
    options.audience ? `Audience: ${options.audience}` : 'Audience: [fill in parents, boys, old customers, or ad prospects]',
    `Platform/use case: ${platform}`,
    options.source ? `Source context: ${options.source}` : 'Source context: [attach transcript, source-sheet notes, or Rabbi notes when available]',
    '',
    'Apply these prompt patches:',
  ];

  for (const patch of patches) {
    promptLines.push('', `## ${patch.title} (${patch.id})`);
    for (const line of patch.prompt_lines || []) promptLines.push(`- ${line}`);
  }

  const negativeLines = patches.flatMap((patch) => patch.negative_prompt_lines || []);
  promptLines.push(
    '',
    'Output requirements:',
    '- Return one final generation prompt.',
    '- Return a shot list with shot durations and camera angles.',
    '- Return aspect-ratio and safe-crop notes.',
    '- Return caption/title guidance.',
    '- Return review flags for Torah sources, claims, prices, or approvals.',
    '- Do not invent sources, students, testimonials, prices, dates, or approvals.',
  );

  if (negativeLines.length) {
    promptLines.push('', 'Negative prompt / avoid:', ...negativeLines.map((line) => `- ${line}`));
  }

  return {
    library_id: library.library_id,
    library_version: library.version,
    stack_id: stack?.id || null,
    stack_title: stack?.title || null,
    patch_ids: patchIds,
    duration_seconds: Number(duration) || duration,
    platform,
    prompt: promptLines.join('\n'),
  };
}

const options = parseArgs(process.argv.slice(2));
const library = loadLibrary();

if (options.list) {
  const output = {
    library_id: library.library_id,
    version: library.version,
    stacks: library.stacks.map((stack) => ({
      id: stack.id,
      title: stack.title,
      platform: stack.platform,
      patch_ids: stack.patch_ids,
    })),
    patches: library.patches.map((patch) => ({
      id: patch.id,
      category: patch.category,
      title: patch.title,
    })),
  };
  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(`${output.library_id} v${output.version}`);
    console.log('');
    console.log('Stacks:');
    for (const stack of output.stacks) console.log(`- ${stack.id}: ${stack.title} (${stack.platform})`);
    console.log('');
    console.log('Patches:');
    for (const patch of output.patches) console.log(`- ${patch.id}: ${patch.category} - ${patch.title}`);
  }
  process.exit(0);
}

if (!options.stackId && !options.patchIds.length) {
  console.log(usage());
  process.exit(1);
}

const composed = composePrompt(library, options);
if (options.json) {
  console.log(JSON.stringify(composed, null, 2));
} else {
  console.log(composed.prompt);
}
