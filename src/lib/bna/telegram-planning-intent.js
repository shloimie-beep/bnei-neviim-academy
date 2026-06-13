function normalizePlanningText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\x20-\x7E]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactPlanningText(value, maxLength = 1600) {
  const text = String(value || '')
    .replace(/\r/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 14).trim()}... [truncated]`;
}

function hasPromptPlanningIntent(text) {
  const normalized = normalizePlanningText(text);
  if (!normalized) return false;

  const mentionsPrompt = /\b(prompt|prompts|brief|planning mode|planning-mode|plan mode|refine my idea|refining my idea)\b/.test(normalized);
  if (!mentionsPrompt) return false;

  const mentionsTarget = /\b(codex|kodak|codak|chatgpt|chat gpt|gpt|ai|you)\b/.test(normalized);
  const promptVerb =
    /\b(make|create|write|draft|build|prepare|design|refine|revise|work on|help me|turn this into|come up with)\b.{0,90}\b(prompt|brief)\b/.test(normalized) ||
    /\b(prompt|brief)\b.{0,90}\b(for|to give|that i'?m giving|i am giving)\b.{0,60}\b(codex|chatgpt|chat gpt|gpt|ai|you)\b/.test(normalized);
  const explicitPlanningMode =
    /\b(codex|chatgpt|chat gpt|gpt)\b.{0,100}\b(planning mode|planning-mode|plan mode|refine|refinement)\b/.test(normalized) ||
    /\b(planning mode|planning-mode|plan mode)\b.{0,100}\b(codex|chatgpt|chat gpt|gpt|prompt|brief)\b/.test(normalized);

  return Boolean((mentionsTarget && promptVerb) || explicitPlanningMode);
}

function promptPlanningKind(text) {
  const normalized = normalizePlanningText(text);
  if (/\b(chatgpt|chat gpt|gpt)\b/.test(normalized) && !/\bcodex\b/.test(normalized)) {
    return 'chatgpt';
  }
  return 'codex';
}

function hasExplicitPromptImplementationStart(text) {
  const normalized = normalizePlanningText(text);
  if (!normalized) return false;
  return (
    /\b(go ahead|start|execute|use|apply|run|test|build|implement|send)\b.{0,50}\b(this|it|the prompt|that prompt|draft|brief)\b/.test(normalized) ||
    /\b(this|it|the prompt|that prompt|draft|brief)\b.{0,50}\b(is ready|looks good|approved|go ahead|start|execute|apply|run|test|build|implement)\b/.test(normalized) ||
    /\b(send|pass|give)\b.{0,40}\b(to|into)\b.{0,20}\bcodex\b/.test(normalized) ||
    /\b(use this prompt|apply this prompt|run this prompt|build from this|implement from this|test from this)\b/.test(normalized)
  );
}

function isPromptPlanningCancel(text) {
  const normalized = normalizePlanningText(text);
  return /\b(cancel|nevermind|never mind|stop planning|drop this prompt|forget this prompt)\b/.test(normalized);
}

function isPromptPlanningRefinement(text) {
  const normalized = normalizePlanningText(text);
  if (!normalized || hasExplicitPromptImplementationStart(normalized) || isPromptPlanningCancel(normalized)) return false;
  return (
    /\b(make it|change it|revise|rewrite|refine|tighten|add|include|remove|take out|instead|more|less|shorter|longer|clearer|stronger|softer|mention|focus on|don't|do not|use this wording|word it)\b/.test(normalized) ||
    (/^(also|and|but|no|yes|right|ok|okay)\b/.test(normalized) && normalized.length <= 500)
  );
}

function bulletizeRevisions(revisions = []) {
  return revisions
    .map((item) => compactPlanningText(item.text || item, 420))
    .filter(Boolean)
    .map((item) => `- ${item}`);
}

function buildVisiblePlanningPrompt(input = {}) {
  const kind = input.kind || 'codex';
  const originalText = input.originalText || input.original_text || '';
  const revisions = input.revisions || input.revision_inputs || [];
  const target = kind === 'chatgpt' ? 'ChatGPT' : 'Codex';
  const raw = compactPlanningText(originalText, 1800);
  const revisionLines = bulletizeRevisions(revisions);

  const base = kind === 'chatgpt'
    ? [
        'You are ChatGPT helping Shloimie refine an idea before any execution.',
        'Turn the operator input into a clear working prompt or brief.',
        'Preserve the intent and important wording, but make the output structured and usable.',
      ]
    : [
        'You are Codex working in planning/refinement mode for the BNA repository.',
        'Read AGENTS.md, MEMORY.md, TASKS.md, SYSTEM-STATE.md, and relevant local files before recommending implementation.',
        'Do not edit files, run commands, deploy, or mark tasks done yet.',
      ];

  return [
    ...base,
    '',
    'Goal:',
    `Create a refined ${target} prompt/brief from the operator input below, then stop for operator review.`,
    '',
    'Original operator input, preserved as provenance:',
    '"""',
    raw || '[no source text provided]',
    '"""',
    revisionLines.length ? '' : null,
    revisionLines.length ? 'Operator refinements to incorporate:' : null,
    ...revisionLines,
    '',
    'Return format:',
    '1. Refined prompt/brief',
    '2. Assumptions and open decisions',
    '3. Recommended next step',
    '',
    'Boundary:',
    'Stay in planning mode. Wait for the operator to say build, apply, run, test, or implement before execution.',
  ].filter((line) => line !== null).join('\n');
}

function buildPlanningTelegramReply(session = {}) {
  const target = session.kind === 'chatgpt' ? 'ChatGPT' : 'Codex';
  return [
    `Planning mode: ${target} prompt draft`,
    '',
    'I will keep this as a visible draft and refine it here before implementation.',
    '',
    '--- Prompt draft ---',
    session.current_prompt || buildVisiblePlanningPrompt(session),
    '--- End prompt draft ---',
    '',
    'Reply with changes to refine it, or say "build this", "apply this", "run this", or "test this" when it is ready.',
  ].join('\n');
}

function buildCodexWorkFromPlanningSession(session = {}, latestText = '') {
  const revisionLines = bulletizeRevisions(session.revision_inputs || []);
  return [
    'Planning-mode prompt approved for execution.',
    '',
    'Use the visible prompt draft below as the work request. Preserve the original operator input as provenance in any task notes, comments, or implementation brief you create.',
    '',
    'Latest operator command:',
    compactPlanningText(latestText, 700) || '[none]',
    '',
    'Original operator input:',
    '"""',
    compactPlanningText(session.original_text, 1800) || '[none]',
    '"""',
    revisionLines.length ? '' : null,
    revisionLines.length ? 'Refinement history:' : null,
    ...revisionLines,
    '',
    'Approved prompt draft:',
    '"""',
    session.current_prompt || buildVisiblePlanningPrompt(session),
    '"""',
  ].filter((line) => line !== null).join('\n');
}

module.exports = {
  buildCodexWorkFromPlanningSession,
  buildPlanningTelegramReply,
  buildVisiblePlanningPrompt,
  compactPlanningText,
  hasExplicitPromptImplementationStart,
  hasPromptPlanningIntent,
  isPromptPlanningCancel,
  isPromptPlanningRefinement,
  normalizePlanningText,
  promptPlanningKind,
};
