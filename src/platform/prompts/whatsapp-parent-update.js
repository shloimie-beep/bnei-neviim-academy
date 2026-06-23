const fs = require('node:fs');
const path = require('node:path');

const WHATSAPP_PARENT_UPDATE_PROMPT_VERSION = 'whatsapp-parent-update-v3';

const BANNED_PHRASES = [
  'What a beautiful week',
  'What a powerful week',
  'We explored',
  'We dove into',
  'This reminds us',
  'The practical message is simple',
  'The message is simple',
  'That is very special',
  "It wasn't just",
  'It was not just',
];

const REQUIRED_ENDING = 'Good Shabbos.';

function promptPath(repoRoot = process.cwd()) {
  return path.join(repoRoot, 'content-memory', 'platform-prompts', 'whatsapp.md');
}

function examplesPath(repoRoot = process.cwd()) {
  return path.join(repoRoot, 'content-memory', 'whatsapp', 'examples.md');
}

function readPromptContract(repoRoot = process.cwd()) {
  return fs.readFileSync(promptPath(repoRoot), 'utf8');
}

function hasEmoji(value = '') {
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(String(value || ''));
}

function validateWhatsAppParentUpdateDraft(draft = '', { parsha = null, approved_private_data = false } = {}) {
  const text = String(draft || '').trim();
  const errors = [];
  if (!text.endsWith(REQUIRED_ENDING)) errors.push('Draft must end exactly with Good Shabbos.');
  for (const phrase of BANNED_PHRASES) {
    if (new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)) {
      errors.push(`Banned phrase present: ${phrase}`);
    }
  }
  if (hasEmoji(text)) errors.push('No emojis unless the operator explicitly requests them.');
  if (/\[(?:question|answer|source|activity|name|parsha|.*)\]/i.test(text)) {
    errors.push('Draft still contains placeholder text.');
  }
  if (!parsha && /^\*?\s*(?:Parsha|פרשת)\b/im.test(text)) {
    errors.push('Parsha line is present without a supplied parsha fact.');
  }
  if (parsha && !new RegExp(`פרשת\\s+${escapeRegExp(parsha)}|Parsha\\s+${escapeRegExp(parsha)}`, 'i').test(text)) {
    errors.push('Supplied parsha fact is not reflected in the parsha line.');
  }
  if (!approved_private_data && /\b(accountability|behavior note|private note|medical|therapy|diagnosis|payment|tuition balance)\b/i.test(text)) {
    errors.push('Potential private accountability/payment data requires explicit approval.');
  }
  return {
    ok: errors.length === 0,
    version: WHATSAPP_PARENT_UPDATE_PROMPT_VERSION,
    errors,
  };
}

function escapeRegExp(value = '') {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function approvedExampleFlow() {
  return {
    version: WHATSAPP_PARENT_UPDATE_PROMPT_VERSION,
    examples_path: 'content-memory/whatsapp/examples.md',
    approval_required: true,
    rule: 'Add real approved examples only after operator approval; drafts and generated outputs are not examples by default.',
    allowed_statuses: ['candidate', 'operator_approved', 'archived'],
  };
}

module.exports = {
  WHATSAPP_PARENT_UPDATE_PROMPT_VERSION,
  BANNED_PHRASES,
  REQUIRED_ENDING,
  promptPath,
  examplesPath,
  readPromptContract,
  validateWhatsAppParentUpdateDraft,
  approvedExampleFlow,
};
