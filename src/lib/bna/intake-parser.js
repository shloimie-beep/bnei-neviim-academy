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
const {
  RAMBLE_PROTOCOL_VERSION,
  RAMBLE_INTAKE_TEMPLATE_PATH,
  GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH,
  RAMBLE_CANONICAL_ARRAY_KEYS,
  buildProtocolItem,
  buildRawIntakeMetadata,
  broadCorrectionRegisterNeeded,
  extractedItemCounts,
  formatStableId,
  goalModeExecutionRequested,
  gptCorrectionPacketDetected,
  normalizeSourceChannel,
  requirementRegisterPath,
  sourceQuote,
  titleFromText: protocolTitleFromText,
} = require('./ramble-protocol');
const {
  CANONICAL_INTAKE_ARRAY_KEYS,
  defaultItemFields,
} = require('./intake-schema');
const { affectedGoalIdsForText } = require('./goal-registry');
const { createGoalCandidateFromText } = require('./goal-memory');

const PARSER_VERSION = 'canonical-intake-parser-v1';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';

const CANONICAL_ARRAY_KEYS = [...new Set([
  'extracted_people',
  'extracted_relationships',
  ...RAMBLE_CANONICAL_ARRAY_KEYS,
  ...CANONICAL_INTAKE_ARRAY_KEYS,
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
])];

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizeScopeKey(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function hasOneTimeScopeCue(text = '') {
  return /\b(one[-\s]?time|onetimeonetime|rabbi\s+elie|rabbi\s+(?:scheller|sheller)|scheller|sheller|mishnah|mishna|mishnayos|mishnayot|worldwide\s+mishnayos)\b/i
    .test(String(text || ''));
}

function hasAmbiguousWorkspaceRouting(text = '', input = {}) {
  if (input.project_key || input.projectKey || input.workspace_key || input.workspaceKey) return false;
  const value = String(text || '');
  const hasRoutingWords = /\b(workspace|project|scope|route|routing|file under|belongs to|where to file|which lane)\b/i.test(value);
  const hasUncertainty = /\b(not sure|unclear|unknown|do(?:n't| not) know|which workspace|which project|whether|maybe|probably|figure out|decide where|needs routing review)\b/i.test(value);
  const hasCompetingScopes = /\b(?:bna|one[-\s]?time|provider|family|dratler)\b[\s\S]{0,90}\bor\b[\s\S]{0,90}\b(?:bna|one[-\s]?time|provider|family|dratler)\b/i.test(value);
  return hasRoutingWords && (hasUncertainty || hasCompetingScopes);
}

function intakeSourceDate(input = {}) {
  const explicit = String(input.source_date || input.created_at || input.recorded_at || '').match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (explicit) return explicit[1];
  return new Date().toISOString().slice(0, 10);
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

function makeWorkspaceRoutingDecision(fragment, index) {
  return withCommonItemFields({
    title: 'Decide intake workspace routing',
    short_title: 'Decide intake workspace routing',
    what: 'Decide the correct workspace/project before creating visible tasks.',
    why: 'The intake contains work language, but its BNA/One Time/provider/family scope is unclear.',
    next_action: 'Choose the target workspace/project, then re-parse or file the raw intake under that scope.',
    owner: 'Shloimie',
    decision_owner: 'Shloimie',
    summary: compactWhitespace(fragment.text),
    workspace_key: 'needs_routing_decision',
    project_key: null,
    target_lane: 'Decisions',
    metadata: {
      decision_type: 'workspace_routing',
      auto_task_creation_blocked: true,
    },
  }, 'decision', fragment, index, 0.92);
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

function makeStructuredLaneItem(type, fragment, index, fields = {}, baseConfidence = 0.8) {
  const title = fields.title || titleFromActionText(fragment.text, `${type.replace(/_/g, ' ')} item`);
  const item = withCommonItemFields({
    ...fields,
    title,
    short_title: title,
    summary: fields.summary || compactWhitespace(fragment.text),
    section_key: fields.section_key || sectionKeyForItemType(type),
    related_goal_ids: fields.related_goal_ids || affectedGoalIdsForText(fragment.text),
    fields,
  }, type, fragment, index, confidenceForFragment(fragment, baseConfidence));
  return defaultItemFields(item, type, fields);
}

function makeAlert(fragment, index, fields = {}, baseConfidence = 0.86) {
  return makeStructuredLaneItem('alert', fragment, index, {
    title: fields.title || titleFromActionText(fragment.text, 'Communication alert'),
    severity: fields.severity || (/\b(urgent|emergency|asap|cannot|blocked|missed payment|chargeback)\b/i.test(fragment.text) ? 'high' : 'medium'),
    channel: fields.channel || communicationChannel(fragment.text),
    redacted_summary: sourceQuote(fields.redacted_summary || fragment.text, 220),
    ...fields,
  }, baseConfidence);
}

function sourceLooksLikeClassRecording(input = {}, text = '') {
  return /\b(class_recording|content_recording|class transcript|drive_recording|recording)\b/i.test(`${input.source_type || ''} ${input.source || ''}`)
    || /\b(class recording|class transcript|recording|lesson transcript|shiur recording)\b/i.test(text);
}

const TASK_TRIGGER_PATTERN = /\b(task|todo|fix|wire|implement|add|remove|update|create|run|deploy|verify|test|parse|route|file|repair|debug|harden|finish|clean|reset)\b/i;
const TASK_BUILD_INTENT_PATTERN = /\b(?:i\s+want\s+you\s+to|need\s+you\s+to|please|make\s+sure|make\s+it\s+so|has\s+to|have\s+to|should|build|make)\s+(?:the|a|an|this|that|it|everything|all|whole|new|proper|working|live|parents?|kids?|students?|dashboard|page|app|system|workflow|protocol|queue|parser|button|login|password|ui|website|bot|route|tool)\b/i;
const SYSTEM_WORK_PATTERN = /\b(codex|repo|server|api|database|dashboard|operations|website|web site|ui|button|login|password|pwa|manifest|railway|deploy|smoke|watchdog|ramble|parser|queue|telegram|bot|helper|drive intake|content job|route|filter|app)\b/i;
const CLASS_LEARNING_PATTERN = /\b(pasuk|pusik|rashi|hashem|beis(?:\s|-)?hamikdash|beit(?:\s|-)?hamikdash|mishnah|mishna|gemara|torah|shiur|class|rebbe|rabbi|student|worksheet|source sheet|test\s+[a-z]+|vav|yud[-\s]?heh)\b/i;
const PURE_CLASS_TEST_PATTERN = /^\s*(?:we(?:'re| are)\s+on\s+)?(?:pasuk|pusik|test)\b[\s\S]{0,120}$/i;

function hasTaskCreationIntent(text = '', input = {}) {
  const value = String(text || '');
  if (!TASK_TRIGGER_PATTERN.test(value) && !TASK_BUILD_INTENT_PATTERN.test(value)) return false;
  const classLike = sourceLooksLikeClassRecording(input, value) || /\b(google_drive|drive|content_job)\b/i.test(`${input.source_type || ''} ${input.source || ''}`);
  if (classLike && !SYSTEM_WORK_PATTERN.test(value) && (CLASS_LEARNING_PATTERN.test(value) || PURE_CLASS_TEST_PATTERN.test(value))) {
    return false;
  }
  return true;
}

function communicationChannel(text = '', sourceType = '') {
  const value = `${text} ${sourceType}`;
  if (/\bwapi|whapi\b/i.test(value)) return 'wapi';
  if (/\bwhatsapp|wa\b/i.test(value)) return 'whatsapp';
  if (/\bemail|gmail\b/i.test(value)) return 'email';
  if (/\bform|website\b/i.test(value)) return 'website_form';
  return 'unknown';
}

function isImportantCommunication(text = '') {
  return /\b(urgent|asap|important|payment|paid|invoice|tuition|missed|no response|accountability|parent|student struggling|provider|access|login|blocked|cannot|can't)\b/i.test(text);
}

function looksLikeDurableGoal(text = '') {
  return /\b(always|never|every time|from now on|standing rule|source of truth|set (it|this|that) as a goal|make (it|this|that) a goal|goal mode|system should|agents? must|watchdog should)\b/i.test(text);
}

function looksLikeStudentQuestion(text = '', input = {}) {
  return (
    /\b(student|boy|kid|child|learner)\b.{0,80}\b(asked|asks|question|wanted to know|wondered)\b/i.test(text)
    || /\b(question from|student question|asked:|asks:)\b/i.test(text)
    || (sourceLooksLikeClassRecording(input, text) && /\?\s*$/.test(text))
  );
}

function hasGoogleClassroomRequest(text = '') {
  return /\b(google classroom|classroom)\b/i.test(text) &&
    /\b(create|post|add students?|assignment|course|class|schedule|calendar|sync|homework)\b/i.test(text);
}

function isRambleSource(sourceType = '') {
  return /\b(ramble|telegram|recording|transcript|operator|manual|voice|drive)\b/i.test(String(sourceType || ''));
}

function isCorrectionLikeInput(text = '') {
  return /\b(correction|not what i meant|didn'?t want|do not file|don't file|wrong place|misfiled|instead|actually|no dude|no,? i)\b/i.test(String(text || ''));
}

function visibleFilingTargets(output = {}) {
  const counts = [
    ['Requirements', output.requirements?.length || 0],
    ['Tasks', output.tasks?.length || 0],
    ['Decisions', output.decisions?.length || 0],
    ['Open questions', output.open_questions?.length || 0],
    ['Memory candidates', output.memory_candidates?.length || 0],
    ['Goal candidates', output.goal_candidates?.length || 0],
    ['Tickets', output.tickets?.length || 0],
    ['Student notes', (
      (output.student_notes?.length || 0) +
      (output.student_observations?.length || 0) +
      (output.goals?.length || 0) +
      (output.diet_nutrition_notes?.length || 0) +
      (output.attendance?.length || 0) +
      (output.assignments?.length || 0) +
      (output.behavior_notes?.length || 0)
    )],
    ['Student questions', output.student_questions?.length || 0],
    ['Content items', output.content_items?.length || 0],
    ['Research items', output.research_items?.length || 0],
    ['Accounting items', output.accounting_items?.length || 0],
    ['Contact items', output.contact_items?.length || 0],
    ['Communications', output.communications?.length || 0],
    ['Alerts', output.alerts?.length || 0],
    ['Integrations', output.integration_items?.length || 0],
    ['Service providers', output.service_provider_items?.length || 0],
    ['Provider leads', output.provider_leads?.length || 0],
    ['Class notes', output.class_session_notes?.length || 0],
    ['Review', output.review_items?.length || 0],
  ].filter(([, count]) => count > 0);
  return counts.map(([label, count]) => ({ label, count }));
}

function makeProtocolIntakeItem(type, fragment, index, input = {}, fields = {}) {
  const sourceDate = intakeSourceDate(input);
  return buildProtocolItem({
    type,
    date: sourceDate,
    index: index + 1,
    text: fragment?.text || '',
    source_quote: fragment?.excerpt || fragment?.text || '',
    ...fields,
  });
}

function addRambleProtocolItems(output = {}, fragment = {}, index = 0, input = {}) {
  const text = String(fragment.text || '');
  if (!text.trim()) return;

  if (/\b(requirement|must|should|expected|expectation|website|homepage|landing page|page|site|correction|missed|bug|broken|doesn't work|does not work|needs to|make sure)\b/i.test(text)) {
    output.requirements.push(makeProtocolIntakeItem('requirement', fragment, index, input, {
      title: protocolTitleFromText(text, 'Review website correction requirement'),
      expected_result: 'The described correction is translated into an inspectable requirement before implementation starts.',
      target_lane: broadCorrectionRegisterNeeded(text) ? 'Requirement Register' : 'Tasks',
      verification_method: 'Map the item to affected files/routes/components, run relevant checks, and record evidence in the final audit table.',
      confidence: 0.82,
      needs_review: true,
    }));
  }

  if (/\b(open question|question|unclear|not sure|should we|do we|which|whether|what about)\b/i.test(text) || /\?\s*$/.test(text)) {
    output.open_questions.push(makeProtocolIntakeItem('open_question', fragment, index, input, {
      title: protocolTitleFromText(text, 'Clarify ramble question'),
      expected_result: 'The blocking choice or ambiguity is answered or explicitly marked non-blocking.',
      target_lane: 'Decisions',
      verification_method: 'Record the answer, decision, or non-blocking status before coding dependent work.',
      confidence: 0.79,
      needs_review: true,
    }));
  }

  if (/\b(remember|from now on|always|never|preference|source of truth|durable memory|stable rule|identity fact)\b/i.test(text)) {
    output.memory_candidates.push(makeProtocolIntakeItem('memory_candidate', fragment, index, input, {
      title: protocolTitleFromText(text, 'Review durable memory candidate'),
      expected_result: 'Promote only stable facts, preferences, requirements, identities, or integration details to MEMORY.md.',
      target_lane: 'Memory',
      verification_method: 'Check the memory promotion rules and either promote to MEMORY.md or leave in the register with a reason.',
      confidence: 0.78,
      needs_review: true,
    }));
  }

  if (/\b(student|boy|parent|goal|attendance|late|absent|homework|behavior|focus|diet|nutrition|accountability)\b/i.test(text)) {
    output.student_notes.push(makeProtocolIntakeItem('student_note', fragment, index, input, {
      title: protocolTitleFromText(text, 'Review student/accountability note'),
      expected_result: 'File the note into the right student/accountability lane with privacy-safe wording.',
      target_lane: 'Student Notes',
      verification_method: 'Verify the target student/accountability record and visibility before marking done.',
      confidence: 0.8,
      needs_review: true,
    }));
  }

  if (/\b(content|blog|post|caption|newsletter|social|facebook|linkedin|youtube|video|recording|article|website copy)\b/i.test(text)) {
    output.content_items.push(makeProtocolIntakeItem('content_item', fragment, index, input, {
      title: protocolTitleFromText(text, 'Review content item'),
      expected_result: 'Route the content idea or asset to the content/social workflow without losing the raw source.',
      target_lane: 'Content',
      verification_method: 'Confirm draft, asset path, Buffer/website target, or explicit blocker.',
      confidence: 0.8,
      needs_review: true,
    }));
  }

  if (/\b(payment|paid|invoice|tuition|accounting|receipt|refund|charge|stripe|green invoice|balance)\b/i.test(text)) {
    output.accounting_items.push(makeProtocolIntakeItem('accounting_item', fragment, index, input, {
      title: protocolTitleFromText(text, 'Review payment/accounting note'),
      expected_result: 'Route the accounting note to the right payment/accounting workflow with sensitive details protected.',
      target_lane: 'Accounting',
      verification_method: 'Verify against the payment/accounting source or document the external blocker.',
      confidence: 0.81,
      needs_review: true,
    }));
  }

  if (/\b(contact|lead|parent lead|phone|email|provider|service provider|GHL|GoHighLevel|LeadConnector|crm)\b/i.test(text)) {
    output.contact_items.push(makeProtocolIntakeItem('contact_item', fragment, index, input, {
      title: protocolTitleFromText(text, 'Review contact item'),
      expected_result: 'Route contact language into first-party BNA Operations contact/provider tables, not a new active GHL runtime.',
      target_lane: 'Contacts',
      verification_method: 'Verify the first-party contact/provider record, dedupe decision, or blocker.',
      confidence: 0.81,
      needs_review: true,
      metadata: { ghl_runtime_policy: 'first_party_bna_operations_only' },
    }));
  }
}

function addStableIdsToCanonicalOutput(output = {}, input = {}) {
  const sourceDate = intakeSourceDate(input);
  const globalScopeText = `${input.raw_input || input.raw_text || input.text || ''} ${output.raw_input || ''}`;
  const ambiguousGlobalScope = hasAmbiguousWorkspaceRouting(globalScopeText, input);
  const groups = [
    ['requirement', output.requirements],
    ['task', output.tasks],
    ['decision', output.decisions],
    ['calendar_event', output.calendar_events],
    ['ticket', output.tickets],
    ['open_question', output.open_questions],
    ['memory_candidate', output.memory_candidates],
    ['goal_candidate', output.goal_candidates],
    ['student_note', output.student_notes],
    ['student_question', output.student_questions],
    ['student_observation', output.student_observations],
    ['content_item', output.content_items],
    ['research_item', output.research_items],
    ['accounting_item', output.accounting_items],
    ['contact_item', output.contact_items],
    ['contact', output.contacts],
    ['communication', output.communications],
    ['integration_item', output.integration_items],
    ['service_provider_item', output.service_provider_items],
    ['goal', output.goals],
    ['diet_nutrition_note', output.diet_nutrition_notes],
    ['attendance', output.attendance],
    ['assignment', output.assignments],
    ['behavior_note', output.behavior_notes],
    ['provider_lead', output.provider_leads],
    ['class_session_note', output.class_session_notes],
    ['workspace_routing', output.workspace_routing],
    ['alert', output.alerts],
    ['error', output.errors],
    ['custom_section', output.custom_sections],
  ];
  for (const [type, items] of groups) {
    (items || []).forEach((item, index) => {
      const title = item.title || item.label || item.what || item.summary || type.replace(/_/g, ' ');
      const source = item.source_quote || item.source_excerpt || item.raw_excerpt || item.source_span?.excerpt || item.summary || title;
      if (!item.stable_id) item.stable_id = formatStableId(type, sourceDate, index + 1);
      if (!item.item_key) item.item_key = `${type}:${item.stable_id}`;
      if (!item.short_title) item.short_title = title;
      if (!item.source_quote) item.source_quote = sourceQuote(source);
      if (!item.item_type) item.item_type = type;
      const scopeText = ambiguousGlobalScope
        ? `${title} ${source} ${item.summary || ''} ${item.next_action || ''}`
        : `${title} ${source} ${item.summary || ''} ${item.next_action || ''} ${globalScopeText}`;
      const inferredWorkspaceKey = ambiguousGlobalScope
        ? (item.workspace_key || input.workspace_key || input.workspaceKey || 'needs_routing_decision')
        : inferWorkspaceKey(scopeText, input);
      const inferredProjectKey = ambiguousGlobalScope
        ? (item.project_key || input.project_key || input.projectKey || null)
        : inferProjectKey(scopeText, input);
      if (!item.scope_type) item.scope_type = input.scope_type || input.scopeType || 'workspace';
      if (!item.scope_id) item.scope_id = input.scope_id || input.scopeId || null;
      if (!item.workspace_key || (item.workspace_key === 'bna' && inferredWorkspaceKey !== 'bna') || item.workspace_key === ONE_TIME_PROJECT_KEY) {
        item.workspace_key = inferredWorkspaceKey;
      }
      if (!item.project_key || (item.project_key === 'bna' && inferredProjectKey && inferredProjectKey !== 'bna')) {
        item.project_key = inferredProjectKey;
      }
      if (!item.related_raw_id) item.related_raw_id = input.raw_id || input.raw_intake?.stable_id || null;
      if (!Array.isArray(item.related_goal_ids)) item.related_goal_ids = affectedGoalIdsForText(`${title} ${source}`);
      if (!Array.isArray(item.evidence_paths)) item.evidence_paths = [];
      if (!item.status) item.status = 'parsed';
      if (!item.metadata || typeof item.metadata !== 'object') item.metadata = {};
      if (!item.expected_result) item.expected_result = item.done_definition || item.next_action || item.summary || `Satisfy ${title}`;
      if (!item.done_definition) item.done_definition = item.expected_result;
      if (!item.target_lane) item.target_lane = type === 'decision' || type === 'open_question' ? 'Decisions' : type === 'calendar_event' ? 'Calendar' : type === 'memory_candidate' ? 'Memory' : 'Tasks';
      if (!item.verification_method) item.verification_method = 'Inspect the affected workflow, run the relevant check, and record evidence or a blocker.';
      if (item.needs_review === undefined) item.needs_review = Number(item.confidence || 0.8) < 0.85;
    });
  }
}

function buildRambleProtocol(output = {}, input = {}) {
  const sourceType = output.source_type || input.source_type || input.source || 'manual';
  const sourceDate = intakeSourceDate(input);
  const rawText = output.raw_input || input.raw_input || input.raw_text || input.text || '';
  const filingTargets = visibleFilingTargets(output);
  const rawQueue = buildRawIntakeMetadata({ ...input, raw_input: rawText }, output);
  const codexWork = [...(output.tasks || []), ...(output.tickets || [])]
    .some((item) => /\b(codex|system|agent)\b/i.test(`${item.owner || ''} ${item.assigned_to || ''} ${item.next_action || ''} ${item.summary || ''}`));
  const registerRequired = broadCorrectionRegisterNeeded(rawText);
  const goalModeRequested = goalModeExecutionRequested(rawText);
  const gptCorrectionPacket = gptCorrectionPacketDetected(rawText);
  const goalModeRequired = Boolean(goalModeRequested && (registerRequired || gptCorrectionPacket || codexWork));
  const needsFutureHandoff = Boolean(codexWork || registerRequired || input.needs_internal_handoff || input.future_coding_session);
  return {
    protocol_version: RAMBLE_PROTOCOL_VERSION,
    applies: isRambleSource(sourceType),
    source_type: sourceType,
    source_channel: normalizeSourceChannel(input.source_channel || sourceType),
    source_date: sourceDate,
    raw_id_format: 'RAW-YYYYMMDD-###',
    raw_id: formatStableId('raw', sourceDate, 1),
    raw_queue_table: 'bna_raw_intake',
    raw_capture_required: true,
    raw_capture_path: `memory/${sourceDate}.md`,
    raw_input_queue: rawQueue,
    item_counts: extractedItemCounts(output),
    visible_task_title_policy: 'distilled_action_titles_only',
    internal_handoff_template: RAMBLE_INTAKE_TEMPLATE_PATH,
    needs_internal_handoff: needsFutureHandoff,
    requirement_register_required: registerRequired,
    requirement_register_path: registerRequired ? requirementRegisterPath(sourceDate) : null,
    goal_mode_execution_requested: goalModeRequested,
    gpt_correction_packet_detected: gptCorrectionPacket,
    goal_mode_required: goalModeRequired,
    goal_mode_output_contract_path: GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH,
    goal_mode_execution_policy: goalModeRequired
      ? 'Create or continue an active Codex goal, register raw intake first, then work the requirement register in batches until every requirement is Done, Already satisfied, Blocked, Needs operator decision, Failed, or Archived with proof.'
      : '',
    should_create_or_continue_goal: goalModeRequired,
    terminal_requirement_statuses: ['Done', 'Already satisfied', 'Blocked', 'Needs operator decision', 'Failed', 'Archived'],
    correction_audit_required: isCorrectionLikeInput(output.raw_input || input.raw_input || input.text || ''),
    filing_targets: filingTargets,
    confirmations: [
      `Raw queue: bna_raw_intake using ${formatStableId('raw', sourceDate, 1)}-style IDs.`,
      `Raw saved: memory/${sourceDate}.md.`,
      filingTargets.length
        ? `Distilled filing: ${filingTargets.map((item) => `${item.label} ${item.count}`).join(', ')}.`
        : 'Distilled filing: no confident visible filing yet.',
      registerRequired ? `Requirement register: ${requirementRegisterPath(sourceDate)}.` : '',
      goalModeRequired ? `Goal mode: create/continue a durable Codex goal and execute requirements to terminal statuses using ${GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH}.` : '',
      'Visible titles must be concise; raw wording stays as provenance.',
      `Future Codex handoff template: ${RAMBLE_INTAKE_TEMPLATE_PATH}.`,
      'Done requires ledger/changelog plus proof, live smoke, blocker, or superseded status.',
    ].filter(Boolean),
    required_closeout: [
      'bna_raw_intake raw queue record with source channel, raw text/transcript, parse status, parsed payload, created item IDs, and register path',
      'memory/YYYY-MM-DD.md raw capture',
      'MEMORY.md durable facts only when stable',
      'TASKS.md concise visible tasks when operator-facing work remains',
      'tasks-pending/*.md handoff using the ramble intake template when future coding remains',
      'goal-mode correction output contract when a GPT packet or operator instruction asks to finish everything',
      'active Codex goal status for goal-mode rambles until every requirement reaches a terminal status',
      'ops/agent-task-ledger.jsonl structured record for created/updated/completed work',
      'ops/agent-changelog.md for implemented, verified, deployed, or superseded work',
      'proof path, live smoke, explicit blocker, or superseded record before Done',
    ],
  };
}

function deterministicParse(input = {}) {
  const rawInput = String(input.raw_input || input.raw_text || input.text || '').trim();
  const fragments = splitIntoFragments(rawInput);
  const ambiguousWorkspaceRouting = hasAmbiguousWorkspaceRouting(rawInput, input);
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

  if (ambiguousWorkspaceRouting) {
    const routingFragment = {
      text: rawInput,
      start: 0,
      end: rawInput.length,
      excerpt: sourceExcerpt(rawInput, 0, 420),
    };
    output.decisions.push(makeWorkspaceRoutingDecision(routingFragment, 0));
    output.workspace_routing.push(makeStructuredLaneItem('workspace_routing', routingFragment, 0, {
      title: 'Review ambiguous workspace routing',
      workspace_key: 'needs_routing_decision',
      project_key: null,
      scope_type: 'workspace',
      target_lane: 'Workspace Routing',
      metadata: {
        routing_basis: 'ambiguous_workspace_routing',
        auto_task_creation_blocked: true,
      },
    }, 0.52));
    output.review_items.push({
      review_type: 'ambiguous_workspace_routing',
      reason: 'The raw intake contains work language but the target workspace/project is unclear.',
      payload: { excerpt: routingFragment.excerpt, workspace_key: 'needs_routing_decision' },
      confidence: 0.52,
    });
  }

  fragments.forEach((fragment, index) => {
    const text = fragment.text;
    const lower = text.toLowerCase();
    addRambleProtocolItems(output, fragment, index, input);

    if (looksLikeDurableGoal(text)) {
      output.goal_candidates.push(createGoalCandidateFromText({
        text,
        raw_id: input.raw_id || input.raw_intake?.stable_id || null,
        source: input.source_type || input.source || 'manual',
        scope_type: input.scope_type || input.scopeType || 'workspace',
        scope_id: input.scope_id || input.scopeId || null,
        workspace_key: input.workspace_key || input.workspaceKey || 'bna',
        project_key: input.project_key || input.projectKey || null,
        date: intakeSourceDate(input),
        index: index + 1,
        confidence: confidenceForFragment(fragment, 0.84),
      }));
    }

    if (looksLikeStudentQuestion(text, input)) {
      output.student_questions.push(makeStructuredLaneItem('student_question', fragment, index, {
        title: titleFromActionText(text, 'Student question'),
        question: text,
        source_type: input.source_type || input.source || 'manual',
        class_related: sourceLooksLikeClassRecording(input, text),
        target_lane: 'Student Questions',
      }, 0.84));
    }

    if (/\b(observed|noticed|student seemed|struggled|improved|progress|accountability note|check in|check-in)\b/i.test(text)) {
      output.student_observations.push(makeStructuredLaneItem('student_observation', fragment, index, {
        title: titleFromActionText(text, 'Student observation'),
        observation: text,
        parent_visible: !/\b(private|internal only|admin only)\b/i.test(text),
        target_lane: 'Student Observations',
      }, 0.8));
    }

    if (/\b(research|source|sources|find sources|look up|reference|sefaria|mishnah|gemara|rashi|pasuk|parsha|torah idea|source sheet)\b/i.test(text)) {
      output.research_items.push(makeStructuredLaneItem('research_item', fragment, index, {
        title: titleFromActionText(text, 'Research item'),
        research_prompt: text,
        sources: extractSources(text),
        topics: extractTopics(text),
        target_lane: 'Research',
      }, 0.82));
    }

    if (/\b(parent|email|gmail|whatsapp|wapi|whapi|message|sms|called|call|voicemail|form submission|reply|follow up|follow-up|communication)\b/i.test(text)) {
      const channel = communicationChannel(text, input.source_type || input.source || '');
      output.communications.push(makeStructuredLaneItem('communication', fragment, index, {
        title: titleFromActionText(text, 'Communication intake'),
        channel,
        redacted_summary: sourceQuote(text, 260),
        important: isImportantCommunication(text),
        target_lane: 'Communications',
      }, 0.82));
      if (isImportantCommunication(text)) {
        output.alerts.push(makeAlert(fragment, index, {
          title: titleFromActionText(text, 'Important communication alert'),
          channel,
          related_goal_ids: ['GOAL-CORE-013'],
          target_lane: 'Alerts',
        }, 0.88));
      }
    }

    if (!ambiguousWorkspaceRouting && (
      /\b(calendar|schedule|scheduled|reschedule|event|meeting|appointment|class\s+(?:at|on)|session\s+(?:at|on)|due\s+(?:date|by|on))\b/i.test(text)
      || (/\b(today|tomorrow|tonight|next\s+(?:sunday|monday|tuesday|wednesday|thursday|friday|shabbos|shabbat|week))\b/i.test(text)
        && /\b(class|session|meeting|lesson|event|calendar)\b/i.test(text))
    )) {
      output.calendar_events.push(makeStructuredLaneItem('calendar_event', fragment, index, {
        title: titleFromActionText(text, 'Calendar item'),
        source_time_text: sourceQuote(text, 180),
        scheduling_status: 'draft_needs_confirmation',
        external_write_performed: false,
        metadata: {
          scheduling_status: 'draft_needs_confirmation',
          external_write_performed: false,
        },
        target_lane: 'Calendar',
      }, 0.8));
    }

    if (/\b(api|integration|credential|oauth|resend|buffer|vimeo|zoom|stripe|dns|godaddy|wapi|whapi|google drive)\b/i.test(text)) {
      output.integration_items.push(makeStructuredLaneItem('integration_item', fragment, index, {
        title: titleFromActionText(text, 'Integration item'),
        integration_type: guessIntegrationTypeFromText(text),
        no_secret_storage: true,
        target_lane: 'Integrations',
      }, 0.8));
    }

    if (/\b(service provider|provider classroom|provider profile|provider portal|provider page|teacher community|rabbi|tutor|therapist)\b/i.test(text)) {
      output.service_provider_items.push(makeStructuredLaneItem('service_provider_item', fragment, index, {
        title: titleFromActionText(text, 'Service provider item'),
        provider_name: extractProviderName(text),
        target_lane: 'Service Providers',
      }, 0.82));
    }

    if (!ambiguousWorkspaceRouting && /\b(workspace|project|scope|belongs to|route to|file under|one time|bna|provider workspace)\b/i.test(text)) {
      output.workspace_routing.push(makeStructuredLaneItem('workspace_routing', fragment, index, {
        title: titleFromActionText(text, 'Workspace routing'),
        workspace_key: inferWorkspaceKey(text, input),
        project_key: inferProjectKey(text, input),
        scope_type: 'workspace',
        metadata: {
          routing_basis: hasOneTimeScopeCue(text) ? 'one_time_scope_cue' : 'explicit_workspace_language',
        },
        target_lane: 'Workspace Routing',
      }, 0.78));
    }

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

    if (!ambiguousWorkspaceRouting && /\b(decide|decision|choose|approval|approve|whether|which option|not sure)\b/i.test(text)) {
      output.decisions.push(makeDecision(fragment, index));
    }

    if (/\b(ticket|support|broken|not working|stuck|bug|error|failed|failing|cannot|can't)\b/i.test(text)) {
      output.tickets.push(makeTicket(fragment, index, {
        category: /\b(login|password|access)\b/i.test(text) ? 'access' : 'task_manager',
      }));
    }

    if (!ambiguousWorkspaceRouting && hasTaskCreationIntent(text, input)) {
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

  const classRecordingHasRichItems = sourceLooksLikeClassRecording(input, rawInput) && [
    'student_questions',
    'research_items',
    'class_session_notes',
    'goals',
    'diet_nutrition_notes',
    'attendance',
    'assignments',
    'behavior_notes',
    'provider_leads',
    'workspace_routing',
  ].some((key) => Array.isArray(output[key]) && output[key].length > 0);

  if (!output.tasks.length && !output.decisions.length && !output.tickets.length && fragments.length && !classRecordingHasRichItems) {
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

  addStableIdsToCanonicalOutput(output, input);
  output.summary = summarizeCanonicalOutput(output);
  output.filing_plan = buildFilingPlan(output);
  addLowConfidenceReviews(output);
  output.ramble_protocol = buildRambleProtocol(output, input);
  return output;
}

function extractProviderName(text = '') {
  const match = String(text || '').match(/\b(?:provider|rabbi|teacher|tutor)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,4})/);
  return match ? match[1].trim() : null;
}

function guessIntegrationTypeFromText(text = '') {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('resend')) return 'resend';
  if (lower.includes('buffer')) return 'buffer';
  if (lower.includes('vimeo')) return 'vimeo';
  if (lower.includes('zoom')) return 'zoom';
  if (lower.includes('stripe') || lower.includes('checkout') || lower.includes('payment')) return 'stripe';
  if (lower.includes('godaddy') || lower.includes('dns') || lower.includes('domain')) return 'godaddy_dns';
  if (lower.includes('wapi') || lower.includes('whapi') || lower.includes('whatsapp')) return 'wapi';
  if (lower.includes('google drive') || lower.includes('drive')) return 'google_drive';
  return 'other';
}

function inferProjectKey(text = '', input = {}) {
  const explicitProject = input.project_key || input.projectKey || null;
  const workspaceKey = normalizeScopeKey(input.workspace_key || input.workspaceKey || '');
  const projectKey = normalizeScopeKey(explicitProject || '');
  if (hasOneTimeScopeCue(text) || workspaceKey === ONE_TIME_WORKSPACE_KEY || workspaceKey === ONE_TIME_PROJECT_KEY || projectKey === ONE_TIME_PROJECT_KEY) {
    return ONE_TIME_PROJECT_KEY;
  }
  return explicitProject;
}

function inferWorkspaceKey(text = '', input = {}) {
  const lower = String(text || '').toLowerCase();
  const explicitWorkspace = input.workspace_key || input.workspaceKey || null;
  const workspaceKey = normalizeScopeKey(explicitWorkspace || '');
  const projectKey = normalizeScopeKey(input.project_key || input.projectKey || '');
  if (hasOneTimeScopeCue(text) || workspaceKey === ONE_TIME_WORKSPACE_KEY || workspaceKey === ONE_TIME_PROJECT_KEY || projectKey === ONE_TIME_PROJECT_KEY) return ONE_TIME_WORKSPACE_KEY;
  if (lower.includes('provider')) return input.provider_workspace_key || input.workspace_key || 'provider_workspace';
  if (lower.includes('family')) return 'family_legacy';
  return input.workspace_key || input.workspaceKey || 'bna';
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
    ramble_protocol: base.ramble_protocol || null,
  };
  for (const key of CANONICAL_ARRAY_KEYS) {
    if (!Array.isArray(output[key])) output[key] = [];
  }
  return output;
}

function summarizeCanonicalOutput(output = {}) {
  const counts = {
    requirements: output.requirements?.length || 0,
    tasks: output.tasks?.length || 0,
    decisions: output.decisions?.length || 0,
    open_questions: output.open_questions?.length || 0,
    memory_candidates: output.memory_candidates?.length || 0,
    goal_candidates: output.goal_candidates?.length || 0,
    tickets: output.tickets?.length || 0,
    student_notes: output.student_notes?.length || 0,
    student_questions: output.student_questions?.length || 0,
    student_observations: output.student_observations?.length || 0,
    goals: output.goals?.length || 0,
    notes: (output.diet_nutrition_notes?.length || 0) + (output.behavior_notes?.length || 0) + (output.attendance?.length || 0),
    content_items: output.content_items?.length || 0,
    research_items: output.research_items?.length || 0,
    accounting_items: output.accounting_items?.length || 0,
    contact_items: output.contact_items?.length || 0,
    communications: output.communications?.length || 0,
    alerts: output.alerts?.length || 0,
    integrations: output.integration_items?.length || 0,
    service_providers: output.service_provider_items?.length || 0,
    class_notes: output.class_session_notes?.length || 0,
    review: output.review_items?.length || 0,
  };
  const parts = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${count} ${key.replace(/_/g, ' ')}`);
  return parts.length ? `Parsed ${parts.join(', ')}.` : 'Parsed intake with no confident filings.';
}

function filingTargetForType(type = '') {
  if (type === 'requirement') return 'tasks_pending_requirement_register';
  if (type === 'open_question') return 'bna_tasks';
  if (type === 'memory_candidate') return 'MEMORY.md';
  if (type === 'goal_candidate') return 'bna_goal_memory';
  if (['student_note', 'student_question', 'student_observation', 'content_item', 'research_item', 'accounting_item', 'contact_item', 'contact', 'communication', 'integration_item', 'service_provider_item', 'alert', 'error'].includes(type)) return 'bna_section_records';
  if (type === 'task' || type === 'decision') return 'bna_tasks';
  if (type === 'ticket') return 'bna_support_tickets';
  if (type === 'class_session_note') return 'bna_class_sessions';
  if (type === 'provider_lead') return 'bna_section_records';
  if (type === 'workspace_routing') return 'bna_intake_parse_items';
  if (type === 'custom_section') return 'bna_section_definitions';
  return 'bna_section_records';
}

function buildFilingPlan(output = {}) {
  const groups = [
    ['requirement', output.requirements],
    ['task', output.tasks],
    ['decision', output.decisions],
    ['ticket', output.tickets],
    ['open_question', output.open_questions],
    ['memory_candidate', output.memory_candidates],
    ['goal_candidate', output.goal_candidates],
    ['student_note', output.student_notes],
    ['student_question', output.student_questions],
    ['student_observation', output.student_observations],
    ['content_item', output.content_items],
    ['research_item', output.research_items],
    ['accounting_item', output.accounting_items],
    ['contact_item', output.contact_items],
    ['contact', output.contacts],
    ['communication', output.communications],
    ['integration_item', output.integration_items],
    ['service_provider_item', output.service_provider_items],
    ['goal', output.goals],
    ['diet_nutrition_note', output.diet_nutrition_notes],
    ['attendance', output.attendance],
    ['assignment', output.assignments],
    ['behavior_note', output.behavior_notes],
    ['provider_lead', output.provider_leads],
    ['class_session_note', output.class_session_notes],
    ['workspace_routing', output.workspace_routing],
    ['alert', output.alerts],
    ['error', output.errors],
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
  addStableIdsToCanonicalOutput(output, fallbackInput);
  output.summary = output.summary || summarizeCanonicalOutput(output);
  output.filing_plan = Array.isArray(candidate.filing_plan) && candidate.filing_plan.length
    ? candidate.filing_plan
    : buildFilingPlan(output);
  addLowConfidenceReviews(output);
  const generatedProtocol = buildRambleProtocol(output, fallbackInput);
  output.ramble_protocol = {
    ...(candidate.ramble_protocol && typeof candidate.ramble_protocol === 'object' ? candidate.ramble_protocol : {}),
    ...generatedProtocol,
    raw_input_queue: {
      ...((candidate.ramble_protocol && typeof candidate.ramble_protocol === 'object' && candidate.ramble_protocol.raw_input_queue) || {}),
      ...(generatedProtocol.raw_input_queue || {}),
    },
  };
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
  RAMBLE_PROTOCOL_VERSION,
  RAMBLE_INTAKE_TEMPLATE_PATH,
  GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH,
  stableHash,
  detectLanguage,
  splitIntoFragments,
  parseIntakeText,
  normalizeCanonicalOutput,
  buildFilingPlan,
  buildRambleProtocol,
  hasGoogleClassroomRequest,
  slugifySectionKey,
};
