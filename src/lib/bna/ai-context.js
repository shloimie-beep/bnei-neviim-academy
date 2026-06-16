const fs = require('fs');
const path = require('path');

const DEFAULT_CONTEXT_FILES = [
  'AGENTS.md',
  'MEMORY.md',
  'TASKS.md',
  'SYSTEM-STATE.md',
  'PROJECT-NOTES.md',
  'ops/openai-sidekick-capabilities.md',
  'ops/agent-task-ledger.jsonl',
  'ops/agent-changelog.md',
];

const BRAND_KIT_FILES = [
  'brand-kit/01-core-beliefs.md',
  'brand-kit/02-teaching-voice.md',
  'brand-kit/03-parent-messaging.md',
  'brand-kit/04-student-growth-principles.md',
  'brand-kit/05-phrases-to-use.md',
  'brand-kit/06-phrases-to-avoid.md',
  'brand-kit/07-brand-kit-suggestions.md',
  'brand-kit/08-current-learning-model.md',
  'brand-kit/09-visual-design-tokens.md',
];

function repoRootFrom(startDir = __dirname) {
  return path.resolve(startDir, '..', '..', '..');
}

function safeRead(filePath, maxChars = 2400) {
  if (!fs.existsSync(filePath)) return { exists: false, chars: 0, excerpt: '' };
  const text = fs.readFileSync(filePath, 'utf8');
  return {
    exists: true,
    chars: text.length,
    excerpt: redact(text.slice(0, maxChars)),
  };
}

function redact(value) {
  return String(value || '')
    .replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s`'"]+/gi, '$1=[redacted]')
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, 'sk-[redacted]');
}

function newestMarkdownFiles(dirPath, limit = 3) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const filePath = path.join(dirPath, name);
      return { name, filePath, mtimeMs: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, limit);
}

function loadBnaAiContext(options = {}) {
  const repoRoot = options.repoRoot || repoRootFrom();
  const maxChars = Number(options.maxChars || 2400);
  const contextFiles = [...DEFAULT_CONTEXT_FILES];
  const today = options.today || new Date().toISOString().slice(0, 10);
  contextFiles.push(`memory/${today}.md`);
  const newestBriefs = newestMarkdownFiles(path.join(repoRoot, 'tasks-pending'), 3)
    .map((entry) => `tasks-pending/${entry.name}`);
  const files = {};
  for (const file of [...contextFiles, ...newestBriefs]) {
    files[file] = safeRead(path.join(repoRoot, file), maxChars);
  }
  const brandKit = {};
  for (const file of BRAND_KIT_FILES) {
    brandKit[file] = safeRead(path.join(repoRoot, file), maxChars);
  }
  return {
    generated_at: new Date().toISOString(),
    files,
    brand_kit: brandKit,
    newest_task_pending: newestBriefs,
  };
}

function buildBnaAiContextSummary(options = {}) {
  const context = loadBnaAiContext(options);
  const existingContextFiles = Object.entries(context.files)
    .filter(([, value]) => value.exists)
    .map(([file, value]) => `${file} (${value.chars} chars)`);
  const existingBrandFiles = Object.entries(context.brand_kit)
    .filter(([, value]) => value.exists)
    .map(([file, value]) => `${file} (${value.chars} chars)`);
  return {
    ...context,
    summary_text: [
      'BNA AI context sources loaded:',
      `Core files: ${existingContextFiles.join(', ') || 'none'}`,
      `Brand kit: ${existingBrandFiles.join(', ') || 'none'}`,
      `Newest handoffs: ${context.newest_task_pending.join(', ') || 'none'}`,
      '',
      'Brand guardrail: use BNA parent messaging and teaching voice; avoid generic AI marketing copy. Do not reveal secrets, private student data, credentials, or unverified claims.',
      'Source boundary: BNA is currently centered on the 10-1 program. Do not invent school policies or operational facts from generic school knowledge. If a policy is not in the loaded BNA context, say it is not verified and offer to ask Shloimie.',
    ].join('\n'),
    counts: {
      core_files: existingContextFiles.length,
      brand_kit_files: existingBrandFiles.length,
      newest_handoffs: context.newest_task_pending.length,
    },
  };
}

module.exports = {
  BRAND_KIT_FILES,
  DEFAULT_CONTEXT_FILES,
  buildBnaAiContextSummary,
  loadBnaAiContext,
};
