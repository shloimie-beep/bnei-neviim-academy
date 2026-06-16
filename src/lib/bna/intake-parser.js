const crypto = require('crypto');
const {
  compactWhitespace,
  shapeTaskFromText,
  taskHasRequiredShape,
  titleFromActionText,
} = require('./task-shaping');
const {
  extractPeopleFromText,
  inferRelationshipsFromText,
  ambiguousPeopleFromExtraction,
} = require('./person-resolution');
const {
  buildCustomSectionProposal,
  sectionKeyForItemType,
  slugifySectionKey,
} = require('./section-registry');

const PARSER_VERSION = 'canonical-intake-parser-v1';

const CANONICAL_ARRAY_KEYS = [
  'extracted_people',
  'extracted_relationships',
  'tasks',
  'decisions',
  'tickets',
  'goals',
  'diet_nutrition_notes',
  'attendance',
  'assignments',
  'behavior_notes',
  'provider_leads',
  'class_session_notes',
  'custom_sections',
  'review_items',
  'filing_plan',
];

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function sourceExcerpt(text = '', start = 0, max = 420) {
  const raw = String(text || '');
  const index = Math.max(0, Number(start || 0));
  return compactWhitespace(raw.slice(index, index + max));
}

function detectLanguage(text = '') {
  const raw = String(text || '');
  const hebrewChars = (raw.match(/[\u0590-\u05ff]/g) || []).length;
  const englishChars = (raw.match(/[a-z]/gi) || []).length;
  const primary = hebrewChars > englishChars ? 'he' : 'en';
  return {
    primary,
    has_hebrew: hebrewChars > 0,
    has_english: englishChars > 0,
    mixed: hebrewChars > 0 && englishChars > 0,
  };
}

function splitIntoFragments(text = '') {
  const raw = String(text || '').trim();
  if (!raw) return [];
  const parts = raw
    .replace(/\s+\b(?:also|another thing|next|and then|plus|besides that)\b/gi, '\n$&')
    .split(/\r?\n|(?<=[.!?])\s+|[;]+/)
    .map((part) => compactWhitespace(part))
    .filter((part) => part.length >= 5);
  const result = [];
  let cursor = 0;
  for (const part of parts) {
    const found = raw.indexOf(part, cursor);
    const start = found >= 0 ? found : cursor;
    cursor = start + part.length;
    result.push({ text: part, start, end: start + part.length, excerpt: sourceExcerpt(raw, start, part.length + 40) });
  }
  return result;
}

function confidenceForFragment(fragment = {}, base = 0.76) {
  const text = compactWhitespace(fragment.text);
  let score = base;
  if (text.length >= 18) score += 0.05;
  if (/\b(specific|exact|today|tomorrow|by|assign|create|file|fix|build|parent|student|provider)\b/i.test(text)) score += 0.04;
  if (/\b(maybe|not sure|unclear|someone|somebody|one of the|i think|probably)\b/i.test(text)) score -= 0.18;
  if (text.length < 14) score -= 0.12;
  return Math.max(0.25, Math.min(0.95, Number(score.toFixed(2))));
}

function itemKey(type, text, index = 0) {
  return `${type}:${stableHash(`${type}|${index}|${compactWhitespace(text).toLowerCase()}`).slice(0, 16)}`;
}

function withCommonItemFields(item, type, fragment, index, confidence) {
  const excerpt = fragment?.excerpt || compactWhitespace(item.source_excerpt || item.summary || item.title || '');
  return {
    ...item,
    item_key: item.item_key || itemKey(type, `${item.title || item.summary || ''}|${excerpt}`, index),
    source_excerpt: excerpt,
    source_span: {
      start: fragment?.start ?? null,
      end: fragment?.end ?? null,
      excerpt,
    },
    confidence: item.confidence === undefined ? confidence : item.confidence,
  };
}

function makeTask(fragment, index, overrides = {}) {
  const shaped = shapeTaskFromText({ text: fragment.text, ...overrides });
  return withCommonItemFields({
    ...shaped,
    owner: shaped.owner || 'Unassigned',
    what: shaped.what,
    why: shaped.why,
    next_action: shaped.next_action,
    raw_excerpt: fragment.excerpt,
  }, 'task', fragment, index, confidenceForFragment(fragment, overrides.confidence || 0.8));
}

function makeDecision(fragment, index) {
  const title = titleFromActionText(fragment.text, 'Decide next intake step');
  return withCommonItemFields({
    title,
    what: title,
    why: 'The intake contains a choice or approval gate that should not be silently filed as work.',
    next_action: 'Review the options, choose a path, or ask for missing information.',
    owner: 'Shloimie',
    decision_owner: 'Shloimie',
    summary: compactWhitespace(fragment.text),
  }, 'decision', fragment, index, confidenceForFragment(fragment, 0.78));
}

function makeTicket(fragment, index, overrides = {}) {
  const title = overrides.title || titleFromActionText(fragment.text, 'Review support issue');
  return withCommonItemFields({
    title,
    summary: overrides.summary || compactWhitespace(fragment.text),
    severity: overrides.severity || (/\b(blocked|blocking|cannot|can't|broken|urgent)\b/i.test(fragment.text) ? 'high' : 'normal'),
    category: overrides.category || 'other',
    owner: overrides.owner || 'Unassigned',
    next_action: overrides.next_action || 'Triage the issue and decide whether to create a repair task.',
  }, 'ticket', fragment, index, confidenceForFragment(fragment, overrides.confidence || 0.76));
}

function makeSectionNote(type, fragment, index, fields = {}, baseConfidence = 0.78) {
  const title = fields.title || titleFromActionText(fragment.text, `${sectionKeyForItemType(type)} note`);
  return withCommonItemFields({
    title,
    summary: fields.summary || compactWhitespace(fragment.text),
    section_key: fields.section_key || sectionKeyForItemType(type),
    fields,
  }, type, fragment, index, confidenceForFragment(fragment, baseConfidence));
}

function hasGoogleClassroomRequest(text = '') {
  return /\b(google classroom|classroom)\b/i.test(text) &&
    /\b(create|post|add students?|assignment|course|class|schedule|calendar|sync|homework)\b/i.test(text);
}

function deterministicParse(input = {}) {
  const rawInput = String(input.raw_input || input.raw_text || input.text || '').trim();
  const fragments = splitIntoFragments(rawInput);
  const people = extractPeopleFromText(rawInput);
  const relationships = inferRelationshipsFromText(rawInput, people);
  const language = detectLanguage(rawInput);
  const output = emptyCanonicalOutput({
    raw_input: rawInput,
    source: input.source || input.source_type || 'manual',
    source_type: input.source_type || input.source || 'manual',
    source_id: input.source_id || null,
    source_table: input.source_table || null,
    language,
    summary: '',
  });

  output.extracted_people.push(...people);
  output.extracted_relationships.push(...relationships);
  output.review_items.push(...ambiguousPeopleFromExtraction(people));

  fragments.forEach((fragment, index) => {
    const text = fragment.text;
    const lower = text.toLowerCase();

    if (hasGoogleClassroomRequest(text)) {
      output.tickets.push(makeTicket(fragment, index, {
        title: 'Backlog Google Classroom request',
        summary: 'Future Google Classroom automation request captured as backlog only. No Classroom write is performed.',
        category: 'automation',
        owner: 'Codex',
        next_action: 'Plan future Classroom capabilities: create classes, add students, set assignments, manage schedule, natural-language scheduling, calendar/classroom sync, teacher/project scopes, and approval.',
        confidence: 0.91,
      }));
      return;
    }

    if (/\b(decide|decision|choose|approval|approve|whether|which option|not sure)\b/i.test(text)) {
      output.decisions.push(makeDecision(fragment, index));
    }

    if (/\b(ticket|support|broken|not working|stuck|bug|error|failed|failing|cannot|can't)\b/i.test(text)) {
      output.tickets.push(makeTicket(fragment, index, {
        category: /\b(login|password|access)\b/i.test(text) ? 'access' : 'task_manager',
      }));
    }

    if (/\b(task|todo|fix|build|wire|implement|add|remove|update|create|make|run|deploy|verify|test|parse|route|file)\b/i.test(text)) {
      output.tasks.push(makeTask(fragment, index));
    }

    if (/\b(goal|target|practice|work on|next check|check-?in)\b/i.test(text) || /יעד|מטרה/.test(text)) {
      output.goals.push(makeSectionNote('goals', fragment, index, {
        title: titleFromActionText(text, 'Student goal'),
        note: text,
        parent_visible: /\b(parent|mom|mother|father|dad)\b/i.test(text),
        student_visible: !/\b(private|parent transcript|parent note)\b/i.test(text),
      }, 0.82));
    }

    if (/\b(diet|nutrition|food|eat|eating|meal|snack|protein|sugar|drink|hydration)\b/i.test(text)) {
      output.diet_nutrition_notes.push(makeSectionNote('diet_nutrition_notes', fragment, index, {
        title: titleFromActionText(text, 'Diet note'),
        note: text,
      }, 0.79));
    }

    if (/\b(absent|absence|attendance|late|present|showed up|missed class|no show)\b/i.test(text) || /איחר|נעדר|נוכח/.test(text)) {
      output.attendance.push(makeSectionNote('attendance', fragment, index, {
        title: titleFromActionText(text, 'Attendance note'),
        status: /\b(absent|missed|no show)\b/i.test(text) ? 'absent' : /\b(late)\b/i.test(text) ? 'late' : 'present',
        note: text,
      }, 0.83));
    }

    if (/\b(assignment|homework|worksheet|youtube|due|submit|classwork)\b/i.test(text)) {
      output.assignments.push(makeSectionNote('assignments', fragment, index, {
        title: titleFromActionText(text, 'Assignment note'),
        note: text,
        source: /\byoutube\b/i.test(text) ? 'youtube' : 'intake',
      }, 0.78));
    }

    if (/\b(behavior|meltdown|fight|argue|focus|distracted|shut down|respect|consequence|repair path)\b/i.test(text)) {
      output.behavior_notes.push(makeSectionNote('behavior_notes', fragment, index, {
        title: titleFromActionText(text, 'Behavior note'),
        note: text,
        repair_path: /\brepair\b/i.test(text) ? text : null,
      }, 0.77));
    }

    if (/\b(provider|service provider|khug|khugim|tutor|therapist|listing|directory|setup text|profile)\b/i.test(text)) {
      output.provider_leads.push(makeSectionNote('provider_leads', fragment, index, {
        title: titleFromActionText(text, 'Provider lead'),
        note: text,
        provider_name: extractProviderName(text),
        next_action: 'Review provider lead and decide whether to create or update a provider profile.',
      }, 0.8));
    }

    if (/\b(class session|class notes|recording|transcript|shiur|lesson|learned|topic|source|pasuk|mishnah|gemara|torah)\b/i.test(text) || /שיעור|תורה|משנה|גמרא/.test(text)) {
      output.class_session_notes.push(makeSectionNote('class_session_notes', fragment, index, {
        title: titleFromActionText(text, 'Class note'),
        summary: text,
        topics: extractTopics(text),
        sources: extractSources(text),
      }, 0.82));
    }

    if (/\b(medical|medicine|medication|allergy|doctor|diagnosis|therapy|therapist)\b/i.test(text)) {
      const medical = makeSectionNote('medical_note', fragment, index, {
        title: titleFromActionText(text, 'Medical note'),
        note: text,
        follow_up_required: true,
      }, 0.7);
      output.custom_sections.push(buildCustomSectionProposal({
        section_key: 'medical_note',
        label: 'Medical Note',
        scope: 'person',
        schema_json: { fields: ['note', 'follow_up_required', 'visibility'] },
        metadata: { system_sensitive: true },
      }));
      output.review_items.push({
        review_type: 'medical_note',
        reason: 'Medical notes require admin review before filing or visibility decisions.',
        payload: medical,
        confidence: medical.confidence,
      });
    }

    const customMatch = text.match(/\b(?:custom section|section)\s*[:=-]\s*([^.;\n]{3,80})/i);
    if (customMatch) {
      const proposal = buildCustomSectionProposal({
        label: customMatch[1],
        scope: /\b(household|family)\b/i.test(text) ? 'household' : /\b(workspace|school|provider)\b/i.test(text) ? 'workspace' : 'person',
        fields: ['notes', 'status', 'source_excerpt'],
        metadata: { source_excerpt: fragment.excerpt },
      });
      output.custom_sections.push(withCommonItemFields(proposal, 'custom_section', fragment, index, 0.62));
      output.review_items.push({
        review_type: 'custom_section',
        reason: `Parser proposed custom section "${proposal.label}". Admin approval is required before automatic filing.`,
        payload: proposal,
        confidence: 0.62,
      });
    }

    if (lower.includes('unclear') || lower.includes('not sure') || lower.includes('someone')) {
      output.review_items.push({
        review_type: 'unclear_scope',
        reason: 'The parser could not confidently determine the target person, owner, or filing scope.',
        payload: { excerpt: fragment.excerpt },
        confidence: 0.5,
      });
    }
  });

  if (!output.tasks.length && !output.decisions.length && !output.tickets.length && fragments.length) {
    const fragment = fragments[0];
    const task = makeTask(fragment, 0, {
      title: 'Review manual intake',
      owner: 'Unassigned',
      confidence: 0.52,
    });
    output.tasks.push({ ...task, confidence: 0.52 });
    output.review_items.push({
      review_type: 'low_confidence_item',
      reason: 'No clear filing type was detected; review before filing.',
      payload: task,
      confidence: 0.52,
    });
  }

  output.summary = summarizeCanonicalOutput(output);
  output.filing_plan = buildFilingPlan(output);
  addLowConfidenceReviews(output);
  return output;
}

function extractProviderName(text = '') {
  const match = String(text || '').match(/\b(?:provider|rabbi|teacher|tutor)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,4})/);
  return match ? match[1].trim() : null;
}

function extractTopics(text = '') {
  const compact = compactWhitespace(text);
  const topicMatch = compact.match(/\b(?:topic|about|learned|lesson on)\s+([^.;,]{3,70})/i);
  const topic = topicMatch ? topicMatch[1].trim() : compact.slice(0, 70);
  return topic ? [topic] : [];
}

function extractSources(text = '') {
  const sources = [];
  const sourcePattern = /\b(?:mishnah|gemara|rashi|onkelos|pasuk|parsha|chumash|sefaria|shulchan aruch|mishnah berurah)\b[^.;,\n]*/gi;
  let match;
  while ((match = sourcePattern.exec(String(text || '')))) {
    sources.push(compactWhitespace(match[0]));
  }
  return [...new Set(sources)].slice(0, 8);
}

function emptyCanonicalOutput(base = {}) {
  const output = {
    raw_input: base.raw_input || '',
    source: base.source || base.source_type || 'manual',
    source_type: base.source_type || base.source || 'manual',
    source_id: base.source_id || null,
    source_table: base.source_table || null,
    language: base.language || detectLanguage(base.raw_input || ''),
    summary: base.summary || '',
    extracted_people: [],
    extracted_relationships: [],
    tasks: [],
    decisions: [],
    tickets: [],
    goals: [],
    diet_nutrition_notes: [],
    attendance: [],
    assignments: [],
    behavior_notes: [],
    provider_leads: [],
    class_session_notes: [],
    custom_sections: [],
    review_items: [],
    filing_plan: [],
  };
  for (const key of CANONICAL_ARRAY_KEYS) {
    if (!Array.isArray(output[key])) output[key] = [];
  }
  return output;
}

function summarizeCanonicalOutput(output = {}) {
  const counts = {
    tasks: output.tasks?.length || 0,
    decisions: output.decisions?.length || 0,
    tickets: output.tickets?.length || 0,
    goals: output.goals?.length || 0,
    notes: (output.diet_nutrition_notes?.length || 0) + (output.behavior_notes?.length || 0) + (output.attendance?.length || 0),
    class_notes: output.class_session_notes?.length || 0,
    review: output.review_items?.length || 0,
  };
  const parts = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${count} ${key.replace(/_/g, ' ')}`);
  return parts.length ? `Parsed ${parts.join(', ')}.` : 'Parsed intake with no confident filings.';
}

function filingTargetForType(type = '') {
  if (type === 'task' || type === 'decision') return 'bna_tasks';
  if (type === 'ticket') return 'bna_support_tickets';
  if (type === 'class_session_note') return 'bna_class_sessions';
  if (type === 'provider_lead') return 'bna_section_records';
  if (type === 'custom_section') return 'bna_section_definitions';
  return 'bna_section_records';
}

function buildFilingPlan(output = {}) {
  const groups = [
    ['task', output.tasks],
    ['decision', output.decisions],
    ['ticket', output.tickets],
    ['goal', output.goals],
    ['diet_nutrition_note', output.diet_nutrition_notes],
    ['attendance', output.attendance],
    ['assignment', output.assignments],
    ['behavior_note', output.behavior_notes],
    ['provider_lead', output.provider_leads],
    ['class_session_note', output.class_session_notes],
    ['custom_section', output.custom_sections],
  ];
  const plan = [];
  for (const [type, items] of groups) {
    for (const item of items || []) {
      const confidence = Number(item.confidence || 0);
      const reviewRequired = type === 'custom_section' || confidence < 0.85 || /medical/i.test(type);
      plan.push({
        item_key: item.item_key,
        item_type: type,
        target_table: filingTargetForType(type),
        action: reviewRequired ? 'review' : 'insert',
        confidence,
        auto_file_allowed: confidence >= 0.85 && !reviewRequired,
        section_key: item.section_key || sectionKeyForItemType(type),
      });
    }
  }
  return plan;
}

function addLowConfidenceReviews(output = {}) {
  const existing = new Set((output.review_items || []).map((item) => `${item.review_type}:${item.payload?.item_key || item.reason}`));
  for (const plan of output.filing_plan || []) {
    if (plan.confidence >= 0.55 && plan.confidence < 0.85) {
      const key = `low_confidence_item:${plan.item_key}`;
      if (!existing.has(key)) {
        output.review_items.push({
          review_type: 'low_confidence_item',
          reason: `${plan.item_type.replace(/_/g, ' ')} is below automatic filing confidence.`,
          payload: { item_key: plan.item_key, item_type: plan.item_type },
          confidence: plan.confidence,
        });
        existing.add(key);
      }
    } else if (plan.confidence < 0.55) {
      const key = `proposed_only:${plan.item_key}`;
      if (!existing.has(key)) {
        output.review_items.push({
          review_type: 'proposed_only',
          reason: `${plan.item_type.replace(/_/g, ' ')} confidence is too low for filing.`,
          payload: { item_key: plan.item_key, item_type: plan.item_type },
          confidence: plan.confidence,
        });
        existing.add(key);
      }
    }
  }
}

function normalizeCanonicalOutput(candidate = {}, fallbackInput = {}) {
  const output = emptyCanonicalOutput({
    raw_input: candidate.raw_input || fallbackInput.raw_input || fallbackInput.raw_text || '',
    source: candidate.source || fallbackInput.source || fallbackInput.source_type || 'manual',
    source_type: candidate.source_type || fallbackInput.source_type || fallbackInput.source || 'manual',
    source_id: candidate.source_id || fallbackInput.source_id || null,
    source_table: candidate.source_table || fallbackInput.source_table || null,
    language: candidate.language || detectLanguage(candidate.raw_input || fallbackInput.raw_input || fallbackInput.raw_text || ''),
    summary: candidate.summary || '',
  });
  for (const key of CANONICAL_ARRAY_KEYS) {
    if (Array.isArray(candidate[key])) output[key] = candidate[key];
  }
  output.tasks = output.tasks.map((task, index) => {
    const shaped = shapeTaskFromText({ ...task, text: task.raw_excerpt || task.source_excerpt || task.summary || task.title });
    return {
      ...task,
      ...shaped,
      owner: task.owner || shaped.owner || 'Unassigned',
      item_key: task.item_key || itemKey('task', task.title || task.summary || index, index),
      confidence: Number(task.confidence || 0.75),
    };
  });
  output.summary = output.summary || summarizeCanonicalOutput(output);
  output.filing_plan = Array.isArray(candidate.filing_plan) && candidate.filing_plan.length
    ? candidate.filing_plan
    : buildFilingPlan(output);
  addLowConfidenceReviews(output);
  return output;
}

function parseIntakeText(input = {}) {
  const rawInput = String(input.raw_input || input.raw_text || input.text || '').trim();
  if (!rawInput) {
    const error = new Error('raw_input is required');
    error.statusCode = 400;
    throw error;
  }
  if (input.aiStructuredJson && typeof input.aiStructuredJson === 'object') {
    try {
      const normalized = normalizeCanonicalOutput(input.aiStructuredJson, { ...input, raw_input: rawInput });
      if (normalized.tasks.every(taskHasRequiredShape)) {
        normalized.parser_version = input.parser_version || PARSER_VERSION;
        return normalized;
      }
    } catch {
      // Fall through to deterministic parser.
    }
  }
  const parsed = deterministicParse({ ...input, raw_input: rawInput });
  parsed.parser_version = input.parser_version || PARSER_VERSION;
  return parsed;
}

module.exports = {
  PARSER_VERSION,
  CANONICAL_ARRAY_KEYS,
  stableHash,
  detectLanguage,
  splitIntoFragments,
  parseIntakeText,
  normalizeCanonicalOutput,
  buildFilingPlan,
  hasGoogleClassroomRequest,
  slugifySectionKey,
};
