function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sentenceCase(value = '') {
  const text = compactWhitespace(value);
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripRambleLeadIn(value = '') {
  return compactWhitespace(value)
    .replace(/^(?:so|okay|ok|yeah|right|um+|uh+|basically|just)\s+/i, '')
    .replace(/^(?:please\s+)?(?:can you|could you|would you|i need you to|i want you to|we need to|you need to|make sure to|make sure|tell codex to|codex should)\s+/i, '')
    .replace(/^(?:task|todo|decision|ticket)\s*[:.-]\s*/i, '')
    .replace(/\b(?:you know|kind of|sort of)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function limitAtWordBoundary(value = '', max = 92) {
  const text = compactWhitespace(value);
  if (text.length <= max) return text;
  const words = text.split(/\s+/);
  const kept = [];
  for (const word of words) {
    const next = [...kept, word].join(' ');
    if (next.length > max - 3) break;
    kept.push(word);
  }
  return `${(kept.join(' ') || text.slice(0, max - 3)).trim()}...`;
}

function titleFromActionText(value = '', fallback = 'Review captured intake') {
  const cleaned = stripRambleLeadIn(value);
  if (!cleaned) return fallback;
  const firstUsefulClause = cleaned
    .split(/\s*(?:[.;]|\n|\band then\b|\bthen\b)\s+/i)
    .map((part) => part.trim())
    .find((part) => part.length >= 6) || cleaned;
  const withoutTrailingNoise = firstUsefulClause
    .replace(/\b(?:because|so that|which means)\b[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim() || firstUsefulClause;
  return sentenceCase(limitAtWordBoundary(withoutTrailingNoise, 92)) || fallback;
}

function ownerFromText(value = '', fallback = 'Unassigned') {
  const text = compactWhitespace(value).toLowerCase();
  if (/\b(codex|code|repo|server|api|database|dashboard|operations ui|railway|deploy|test|parser|automation|bug|fix|build|wire|implement)\b/.test(text)) {
    return 'Codex';
  }
  if (/\b(shloimie|shlomo|operator|me|myself|my task|i need to|i should)\b/.test(text)) {
    return 'Shloimie';
  }
  if (/\b(rabbi elie|rabbi|elie scheller|provider)\b/.test(text)) {
    return 'Rabbi Elie Scheller';
  }
  return fallback;
}

function taskCategoryFromText(value = '', fallback = 'operations') {
  const text = compactWhitespace(value).toLowerCase();
  if (/\b(provider|service provider|khug|khugim|listing|directory)\b/.test(text)) return 'communications';
  if (/\b(parent|message|email|whatsapp|contact|transcript)\b/.test(text)) return 'communications';
  if (/\b(student|goal|behavior|attendance|diet|nutrition|assignment|classroom)\b/.test(text)) return 'accountability';
  if (/\b(recording|class notes|transcript|content|newsletter|blog|video)\b/.test(text)) return 'content';
  if (/\b(payment|invoice|billing|tuition)\b/.test(text)) return 'finance';
  if (/\b(server|api|database|parser|dashboard|bot|telegram|codex|railway)\b/.test(text)) return 'technology';
  return fallback;
}

function shapeTaskFromText(input = {}) {
  const sourceText = compactWhitespace(input.text || input.raw_text || input.summary || input.title || '');
  const title = titleFromActionText(input.title || sourceText, input.fallbackTitle || 'Review captured intake');
  const owner = compactWhitespace(input.owner) || ownerFromText(sourceText);
  const what = compactWhitespace(input.what) || title;
  const why = compactWhitespace(input.why) || (
    input.reason ||
    (sourceText ? 'Captured from natural-language intake and condensed into an operator-readable work item.' : 'Captured from intake for review.')
  );
  const nextAction = compactWhitespace(input.next_action || input.nextAction) || (
    owner === 'Codex'
      ? 'Review the source excerpt, implement the smallest safe change, and report verification.'
      : owner === 'Unassigned'
        ? 'Assign an owner and choose the next concrete step.'
        : 'Take the next concrete step and update the record.'
  );
  return {
    title,
    what,
    why,
    next_action: nextAction,
    owner,
    assigned_to: owner === 'Unassigned' ? null : owner,
    category: input.category || taskCategoryFromText(sourceText),
  };
}

function taskHasRequiredShape(task = {}) {
  return Boolean(
    compactWhitespace(task.title) &&
    compactWhitespace(task.what) &&
    compactWhitespace(task.why) &&
    compactWhitespace(task.next_action) &&
    compactWhitespace(task.owner)
  );
}

module.exports = {
  compactWhitespace,
  sentenceCase,
  stripRambleLeadIn,
  limitAtWordBoundary,
  titleFromActionText,
  ownerFromText,
  taskCategoryFromText,
  shapeTaskFromText,
  taskHasRequiredShape,
};
