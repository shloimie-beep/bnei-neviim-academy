const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SPEC_VERSION = 'intent-preservation-v1';
const READY_STATUSES = new Set(['ready_for_pqc', 'ready_for_implementation']);
const PROMPT_READY_STATUS = 'ready_for_implementation';
const CLASSIFICATIONS = new Set(['HARD_EXACT', 'SOFT_GOAL', 'AMBIGUOUS', 'NON_ACTIONABLE']);
const PROVENANCE = new Set(['USER_STATED', 'AGENT_INFERRED']);
const OPERATIONS = new Set(['add', 'replace', 'remove', 'move', 'style', 'preserve', 'behavior']);
const REQUIRED_MOBILE_CTA_VIEWPORTS = ['360x640', '375x667', '390x844', '430x932'];

const TOP_LEVEL_KEYS = new Set([
  'spec_version',
  'spec_id',
  'raw',
  'scope',
  'global_invariants',
  'changes',
  'source_coverage',
  'readiness',
  'fingerprint',
]);

const RAW_KEYS = new Set(['raw_id', 'path', 'capture_mode', 'sha256', 'character_count']);
const SCOPE_KEYS = new Set(['workspace', 'project', 'routes']);
const READINESS_KEYS = new Set(['status', 'blocking_change_ids', 'notes']);
const SPAN_KEYS = new Set(['span_id', 'start', 'end', 'quote']);
const TARGET_KEYS = new Set(['section', 'component', 'selector', 'accessible_name', 'current_text_anchor']);
const LAYOUT_KEYS = new Set(['parent', 'sibling_before', 'sibling_after', 'order']);
const STYLE_KEYS = new Set(['allowed_targets', 'forbidden_targets', 'properties']);
const ASSERTIONS_KEYS = new Set(['positive', 'negative']);
const ASSERTION_KEYS = new Set(['assertion_id', 'text']);
const CONFLICT_KEYS = new Set(['conflicting_change_id', 'field', 'resolution', 'superseded_by']);
const RESOLUTION_KEYS = new Set(['question', 'choices']);
const RESOLUTION_CHOICE_KEYS = new Set(['label', 'description', 'recommended']);
const VIEWPORT_KEYS = new Set(['viewport', 'assertion']);
const COVERAGE_KEYS = new Set([
  'coverage_id',
  'span_id',
  'start',
  'end',
  'quote',
  'classification',
  'coverage_status',
  'change_id',
  'global_invariant_id',
  'reason',
]);
const CHANGE_KEYS = new Set([
  'change_id',
  'source_spans',
  'classification',
  'provenance',
  'confidence',
  'ambiguity_status',
  'route',
  'screen',
  'target',
  'primary_operation',
  'current_state',
  'required_state',
  'exact_payload',
  'layout',
  'style_scope',
  'viewport_behavior',
  'must_preserve',
  'must_remove',
  'conflicts',
  'supersedes_ids',
  'acceptance_assertions',
  'dependencies',
  'resolution_question',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sha256Text(text = '') {
  return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (isPlainObject(value)) {
    const result = {};
    for (const key of Object.keys(value).sort()) {
      if (key === 'fingerprint') continue;
      result[key] = canonicalize(value[key]);
    }
    return result;
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function fingerprintSpec(spec = {}) {
  return sha256Text(canonicalJson(spec));
}

function withFingerprint(spec = {}) {
  return {
    ...spec,
    fingerprint: fingerprintSpec(spec),
  };
}

function addFinding(list, code, message, jsonPath = '$', severity = 'error', details = {}) {
  list.push({ code, message, path: jsonPath, severity, ...details });
}

function checkUnexpectedKeys(value, allowed, findings, jsonPath) {
  if (!isPlainObject(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      addFinding(findings, 'IPG_ADDITIONAL_PROPERTY', `Unexpected property: ${key}`, `${jsonPath}.${key}`);
    }
  }
}

function requireFields(value, fields, findings, jsonPath, label) {
  if (!isPlainObject(value)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', `${label} must be an object.`, jsonPath);
    return;
  }
  for (const field of fields) {
    if (!(field in value)) {
      addFinding(findings, 'IPG_SCHEMA_INVALID', `${label} missing ${field}.`, `${jsonPath}.${field}`);
    }
  }
}

function resolveRawPath(rawPath = '', options = {}) {
  const root = options.root || process.cwd();
  if (!rawPath) return '';
  if (path.isAbsolute(rawPath)) return rawPath;
  return path.resolve(root, rawPath);
}

function readRawForSpec(spec = {}, options = {}) {
  const rawPath = resolveRawPath(spec.raw?.path || '', options);
  if (!rawPath || !fs.existsSync(rawPath)) {
    return { rawPath, rawText: '', exists: false };
  }
  return { rawPath, rawText: fs.readFileSync(rawPath, 'utf8'), exists: true };
}

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function classifySourceSpan(text = '') {
  const value = String(text || '');
  if (/\b(only|inside|above|below|before|after|keep|preserve|remove|delete|replace|exact|called|named|must|never|file|image|asset|yellow|black|#[0-9a-f]{3,6}|\d)\b/i.test(value)) {
    return 'HARD_EXACT';
  }
  if (/\b(clean|professional|consistent|faster|easier|polished|nice|sloppy|beautiful|launch-ready)\b/i.test(value)) {
    return 'SOFT_GOAL';
  }
  if (/\b(mentioned before|talked about|remember|maybe|unclear|which one|previous|earlier)\b/i.test(value)) {
    return 'AMBIGUOUS';
  }
  if (/\b(context|because|frustrat|people are gonna|as a note)\b/i.test(value)) {
    return 'NON_ACTIONABLE';
  }
  return value.trim() ? 'AMBIGUOUS' : 'NON_ACTIONABLE';
}

function splitRawIntoDraftSpans(rawText = '') {
  const raw = String(rawText || '');
  const parts = raw
    .split(/\r?\n|(?<=[.!?])\s+|;+/)
    .map((part) => compactWhitespace(part))
    .filter((part) => part.length >= 4);
  const spans = [];
  let cursor = 0;
  for (const part of parts) {
    const start = raw.indexOf(part, cursor);
    const safeStart = start >= 0 ? start : cursor;
    const end = safeStart + part.length;
    cursor = end;
    spans.push({ start: safeStart, end, quote: raw.slice(safeStart, end) || part });
  }
  if (!spans.length && raw.trim()) {
    spans.push({ start: raw.indexOf(raw.trim()), end: raw.indexOf(raw.trim()) + raw.trim().length, quote: raw.trim() });
  }
  return spans;
}

function draftChangeForSpan({ rawId, dateStamp, index, span, classification, scope = {} }) {
  const changeId = `CHG-${dateStamp}-${String(index + 1).padStart(3, '0')}`;
  return {
    change_id: changeId,
    source_spans: [{
      span_id: `${rawId}:S${String(index + 1).padStart(2, '0')}`,
      start: span.start,
      end: span.end,
      quote: span.quote,
    }],
    classification,
    provenance: 'USER_STATED',
    confidence: classification === 'HARD_EXACT' ? 0.7 : 0.4,
    ambiguity_status: classification === 'AMBIGUOUS' ? 'unresolved' : 'none',
    route: asArray(scope.routes)[0] || '',
    screen: '',
    target: {
      section: '',
      component: '',
      selector: '',
      accessible_name: '',
      current_text_anchor: '',
    },
    primary_operation: 'behavior',
    current_state: 'Uninspected draft source span.',
    required_state: 'Agent must atomize this source span before PQC or implementation.',
    exact_payload: {},
    layout: {
      parent: '',
      sibling_before: '',
      sibling_after: '',
      order: [],
    },
    style_scope: {
      allowed_targets: [],
      forbidden_targets: [],
      properties: [],
    },
    viewport_behavior: [],
    must_preserve: [],
    must_remove: [],
    conflicts: [],
    supersedes_ids: [],
    acceptance_assertions: {
      positive: [],
      negative: [],
    },
    dependencies: [],
    resolution_question: {
      question: classification === 'AMBIGUOUS' ? 'Which exact implementation should this source span become after current-state inspection?' : '',
      choices: [],
    },
  };
}

function buildDraftIntentSpec({
  rawText = '',
  rawId = 'RAW-00000000-001',
  rawPath = '',
  specId = '',
  scope = {},
  createdAt = null,
} = {}) {
  const dateStamp = (String(createdAt || '').match(/\d{4}-?\d{2}-?\d{2}/)?.[0] || rawId.match(/\d{8}/)?.[0] || '00000000').replace(/-/g, '');
  const spans = splitRawIntoDraftSpans(rawText);
  const changes = [];
  const sourceCoverage = [];
  spans.forEach((span, index) => {
    const classification = classifySourceSpan(span.quote);
    const change = classification === 'NON_ACTIONABLE'
      ? null
      : draftChangeForSpan({
        rawId,
        dateStamp,
        index,
        span,
        classification,
        scope,
      });
    if (change) changes.push(change);
    sourceCoverage.push({
      coverage_id: `COV-${dateStamp}-${String(index + 1).padStart(3, '0')}`,
      span_id: `${rawId}:S${String(index + 1).padStart(2, '0')}`,
      start: span.start,
      end: span.end,
      quote: span.quote,
      classification,
      coverage_status: classification === 'NON_ACTIONABLE' ? 'non_actionable' : 'ambiguous',
      change_id: change?.change_id || null,
      global_invariant_id: null,
      reason: classification === 'NON_ACTIONABLE'
        ? 'Draft classifier marked this as non-actionable context.'
        : 'Draft spec requires agent atomization, current-state inspection, and acceptance assertions before PQC.',
    });
  });
  if (rawText) {
    sourceCoverage.push({
      coverage_id: `COV-${dateStamp}-FULL`,
      span_id: `${rawId}:FULL`,
      start: 0,
      end: String(rawText).length,
      quote: String(rawText),
      classification: 'AMBIGUOUS',
      coverage_status: 'ambiguous',
      change_id: null,
      global_invariant_id: null,
      reason: 'Draft full-raw guard coverage so hard signals cannot be lost before atomization.',
    });
  }
  return withFingerprint({
    spec_version: SPEC_VERSION,
    spec_id: specId || `SPEC-${dateStamp}-001`,
    raw: {
      raw_id: rawId,
      path: rawPath,
      capture_mode: 'verbatim',
      sha256: sha256Text(rawText),
      character_count: String(rawText || '').length,
    },
    scope: {
      workspace: scope.workspace || scope.workspace_key || 'bna_platform',
      project: scope.project || scope.project_key || 'protocol_tooling',
      routes: asArray(scope.routes),
    },
    global_invariants: [],
    changes,
    source_coverage: sourceCoverage,
    readiness: {
      status: 'draft',
      blocking_change_ids: changes.map((change) => change.change_id),
      notes: ['Draft intent spec only. Do not generate an implementation packet from this draft.'],
    },
  });
}

function extractHardSignals(rawText = '') {
  const text = String(rawText || '');
  const signals = [];
  const add = (kind, value, start, end) => {
    const clean = String(value || '').trim();
    if (!clean) return;
    const id = `${kind}:${start}:${end}:${clean}`;
    if (signals.some((signal) => signal.id === id)) return;
    signals.push({ id, kind, text: clean, start, end });
  };
  const regexes = [
    ['quoted_string', /"([^"\r\n]{1,220})"/g],
    ['quoted_string', /`([^`\r\n]{1,220})`/g],
    ['asset_or_file', /\b(?:[A-Za-z]:\\[^\r\n:*?"<>|]+|[\w./-]+\.(?:jpg|jpeg|png|webp|gif|svg|md|json|html|js|mjs|css|sql))\b/gi],
    ['number', /\b\d+(?::\d+)?(?:\s*(?:x\d+|px|%|p\.m\.|a\.m\.|cards?|bullets?|labels?|viewports?|items?))?\b/gi],
    ['named_color', /\b(?:black|yellow|navy|teal|cyan|cream|blue|green|red|purple|white|gray|grey|orange|brown|#[0-9a-f]{3,8})\b/gi],
    ['removal', /\b(?:remove|delete|hide|must remove|must not show|absence|absent|without|no longer)\b/gi],
    ['preservation', /\b(?:keep|preserve|must preserve|do not change|unchanged|current(?:ly)? approved)\b/gi],
    ['position', /\b(?:inside|outside|above|below|before|after|under|over|first loads|without scrolling|sibling|parent|same|order|ordered|compact top bar|opened menu)\b/gi],
    ['component_or_action', /\b(?:Sign Up Now|Member Login|Live Daily Mishnayos|Accomplishment|Questions with Rabbi Scheller|Monitored online platform|CTA|logo|mobile navigation control|bubble|card|section|label|body copy)\b/g],
  ];
  for (const [kind, regex] of regexes) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text))) {
      add(kind, match[1] || match[0], match.index, match.index + match[0].length);
    }
  }
  return signals.sort((a, b) => a.start - b.start || a.kind.localeCompare(b.kind));
}

function textIncludes(haystack = '', needle = '') {
  return String(haystack || '').toLowerCase().includes(String(needle || '').toLowerCase());
}

function allAssertionText(item = {}) {
  return [
    ...asArray(item.acceptance_assertions?.positive).map((entry) => entry.text),
    ...asArray(item.acceptance_assertions?.negative).map((entry) => entry.text),
  ].join('\n');
}

function allSpecAssertionText(spec = {}) {
  return [
    ...asArray(spec.changes).map(allAssertionText),
    ...asArray(spec.global_invariants).map(allAssertionText),
  ].join('\n');
}

function allSourceSpanText(item = {}) {
  return asArray(item.source_spans).map((span) => span.quote).join('\n');
}

function coverageOverlapsSignal(coverage = {}, signal = {}) {
  if (Number.isInteger(coverage.start) && Number.isInteger(coverage.end)) {
    return coverage.start <= signal.start && coverage.end >= signal.end;
  }
  return textIncludes(coverage.quote, signal.text);
}

function validateSourceSpan(span, rawText, findings, jsonPath, allowedKeys = SPAN_KEYS) {
  checkUnexpectedKeys(span, allowedKeys, findings, jsonPath);
  requireFields(span, ['span_id', 'start', 'end', 'quote'], findings, jsonPath, 'source span');
  if (!Number.isInteger(span.start) || !Number.isInteger(span.end) || span.end < span.start) {
    addFinding(findings, 'IPG_SPAN_INVALID', 'Source span start/end offsets are invalid.', jsonPath);
    return;
  }
  const actual = rawText.slice(span.start, span.end);
  if (actual !== span.quote) {
    addFinding(findings, 'IPG_SPAN_QUOTE_MISMATCH', 'Source span quote does not exactly match raw content at start/end offsets.', jsonPath, 'error', {
      expected_quote: actual,
      recorded_quote: span.quote,
    });
  }
}

function validateNestedObjects(change, findings, base) {
  checkUnexpectedKeys(change, CHANGE_KEYS, findings, base);
  requireFields(change, Array.from(CHANGE_KEYS), findings, base, 'change');
  checkUnexpectedKeys(change.target, TARGET_KEYS, findings, `${base}.target`);
  checkUnexpectedKeys(change.layout, LAYOUT_KEYS, findings, `${base}.layout`);
  checkUnexpectedKeys(change.style_scope, STYLE_KEYS, findings, `${base}.style_scope`);
  checkUnexpectedKeys(change.acceptance_assertions, ASSERTIONS_KEYS, findings, `${base}.acceptance_assertions`);
  checkUnexpectedKeys(change.resolution_question, RESOLUTION_KEYS, findings, `${base}.resolution_question`);
  asArray(change.source_spans).forEach((span, index) => checkUnexpectedKeys(span, SPAN_KEYS, findings, `${base}.source_spans[${index}]`));
  asArray(change.viewport_behavior).forEach((viewport, index) => checkUnexpectedKeys(viewport, VIEWPORT_KEYS, findings, `${base}.viewport_behavior[${index}]`));
  asArray(change.conflicts).forEach((conflict, index) => checkUnexpectedKeys(conflict, CONFLICT_KEYS, findings, `${base}.conflicts[${index}]`));
  for (const side of ['positive', 'negative']) {
    asArray(change.acceptance_assertions?.[side]).forEach((assertion, index) => {
      checkUnexpectedKeys(assertion, ASSERTION_KEYS, findings, `${base}.acceptance_assertions.${side}[${index}]`);
      requireFields(assertion, ['assertion_id', 'text'], findings, `${base}.acceptance_assertions.${side}[${index}]`, 'assertion');
    });
  }
  asArray(change.resolution_question?.choices).forEach((choice, index) => {
    checkUnexpectedKeys(choice, RESOLUTION_CHOICE_KEYS, findings, `${base}.resolution_question.choices[${index}]`);
    requireFields(choice, ['label', 'description', 'recommended'], findings, `${base}.resolution_question.choices[${index}]`, 'resolution choice');
  });
}

function validateChange(change, rawText, findings, base, ready) {
  validateNestedObjects(change, findings, base);
  if (!/^CHG-\d{8}-\d{3,}$/.test(change.change_id || '')) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'change_id must match CHG-YYYYMMDD-###.', `${base}.change_id`);
  }
  if (!CLASSIFICATIONS.has(change.classification)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'classification is invalid.', `${base}.classification`);
  }
  if (!PROVENANCE.has(change.provenance)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'provenance is invalid.', `${base}.provenance`);
  }
  if (!OPERATIONS.has(change.primary_operation)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'primary_operation is invalid.', `${base}.primary_operation`);
  }
  if (!asArray(change.source_spans).length) {
    addFinding(findings, 'IPG_SOURCE_SPAN_REQUIRED', 'Every change requires at least one source span.', `${base}.source_spans`);
  }
  asArray(change.source_spans).forEach((span, index) => validateSourceSpan(span, rawText, findings, `${base}.source_spans[${index}]`));
  if (change.classification === 'AMBIGUOUS' && change.ambiguity_status !== 'unresolved' && !asArray(change.supersedes_ids).length) {
    addFinding(findings, 'IPG_AMBIGUITY_STATE_INVALID', 'AMBIGUOUS changes must remain unresolved or explicitly superseded/resolved.', `${base}.ambiguity_status`);
  }
  if (ready && change.ambiguity_status === 'unresolved') {
    addFinding(findings, 'IPG_READY_WITH_UNRESOLVED_AMBIGUITY', 'Ready specs cannot include unresolved ambiguous changes.', base);
  }
  if (change.classification === 'SOFT_GOAL' && asArray(change.must_remove).length) {
    addFinding(findings, 'IPG_SOFT_GOAL_OVERRIDES_HARD', 'SOFT_GOAL changes may not own removal constraints; split the hard removal into a HARD_EXACT atom.', `${base}.must_remove`);
  }
  if (change.primary_operation === 'style' && ready) {
    if (!asArray(change.style_scope?.allowed_targets).length || !asArray(change.style_scope?.forbidden_targets).length) {
      addFinding(findings, 'IPG_STYLE_SCOPE_NOT_BOUNDED', 'Ready style changes require allowed and forbidden targets.', `${base}.style_scope`);
    }
    const allowed = asArray(change.style_scope?.allowed_targets).join(' ');
    if (/\b(global|whole section|everything|all labels|all copy)\b/i.test(allowed)) {
      addFinding(findings, 'IPG_STYLE_SCOPE_GLOBALIZED', 'Style scope appears globalized instead of allowlisted to named targets.', `${base}.style_scope.allowed_targets`);
    }
  }
  const sourceText = allSourceSpanText(change);
  if (ready && /\b(inside|above|below|sibling|parent)\b/i.test(sourceText)) {
    if (!change.layout?.parent || !asArray(change.layout?.order).length) {
      addFinding(findings, 'IPG_LAYOUT_RELATION_MISSING', 'Ready layout changes with positional language require parent and order assertions.', `${base}.layout`);
    }
    const sameParent = sourceText.match(/\binside the same ([^,.]+?)(?: in order| with|,|\.| and|$)/i);
    if (sameParent && !textIncludes(change.layout?.parent || '', sameParent[1].trim())) {
      addFinding(findings, 'IPG_CONTAINMENT_MISMATCH', `Source requires containment inside the same ${sameParent[1].trim()}.`, `${base}.layout.parent`);
    }
    if (/\bicon above\b/i.test(sourceText)) {
      const order = asArray(change.layout?.order).map((item) => String(item).toLowerCase());
      const iconIndex = order.findIndex((item) => item.includes('icon'));
      const bubbleIndex = order.findIndex((item) => item.includes('bubble'));
      if (iconIndex < 0 || (bubbleIndex >= 0 && iconIndex > bubbleIndex)) {
        addFinding(findings, 'IPG_CONTAINMENT_MISMATCH', 'Source requires the icon above the bubble/list order.', `${base}.layout.order`);
      }
    }
  }
  if (ready && change.primary_operation === 'remove') {
    const negativeText = asArray(change.acceptance_assertions?.negative).map((entry) => entry.text).join('\n');
    for (const literal of asArray(change.must_remove)) {
      if (!textIncludes(negativeText, literal)) {
        addFinding(findings, 'IPG_READY_ASSERTION_MISSING_HARD_SIGNAL', `Removal literal is missing from negative assertions: ${literal}`, `${base}.acceptance_assertions.negative`);
      }
    }
    if (/\b(where redundant|if redundant|when redundant|where possible|if present)\b/i.test(`${change.required_state}\n${negativeText}`)) {
      addFinding(findings, 'IPG_REMOVAL_CONDITIONALIZED', 'Unconditional removal became conditional.', `${base}.required_state`);
    }
  }
  if (ready && change.primary_operation === 'preserve') {
    const positiveText = asArray(change.acceptance_assertions?.positive).map((entry) => entry.text).join('\n');
    for (const literal of asArray(change.must_preserve)) {
      if (!textIncludes(positiveText, literal)) {
        addFinding(findings, 'IPG_PRESERVE_ASSERTION_MISSING', `Preservation literal is missing from positive assertions: ${literal}`, `${base}.acceptance_assertions.positive`);
      }
    }
  }
  if (ready && /\bmobile landing page first loads\b/i.test(sourceText)) {
    const viewports = new Set(asArray(change.viewport_behavior).map((entry) => entry.viewport));
    for (const viewport of REQUIRED_MOBILE_CTA_VIEWPORTS) {
      if (!viewports.has(viewport)) {
        addFinding(findings, 'IPG_MOBILE_CTA_VIEWPORT_MISSING', `Missing mobile CTA viewport assertion ${viewport}.`, `${base}.viewport_behavior`);
      }
    }
    const assertionText = `${allAssertionText(change)}\n${asArray(change.viewport_behavior).map((entry) => entry.assertion).join('\n')}`;
    for (const term of ['Sign Up Now', 'enabled', 'unobscured', '/one-time/signup', 'logo', 'mobile navigation control', 'Member Login']) {
      if (!textIncludes(assertionText, term)) {
        addFinding(findings, 'IPG_MOBILE_CTA_ASSERTION_MISSING', `Mobile CTA invariant assertion missing ${term}.`, `${base}.acceptance_assertions`);
      }
    }
  }
  const exactItems = asArray(change.exact_payload?.items);
  if (ready && exactItems.length) {
    const assertions = allAssertionText(change);
    for (const item of exactItems) {
      const occurrences = assertions.split(item).length - 1;
      if (occurrences < 2) {
        addFinding(findings, 'IPG_EXACT_COPY_ASSERTION_MISSING', `Exact payload item is missing byte-for-byte from assertions: ${item}`, `${base}.acceptance_assertions`);
      }
    }
    const joined = exactItems.join('\n');
    if (!assertions.includes(joined) && exactItems.length > 1) {
      addFinding(findings, 'IPG_EXACT_COPY_ORDER_MISSING', 'Ordered exact payload list is not preserved byte-for-byte in assertions.', `${base}.acceptance_assertions`);
    }
  }
  const operationSignals = (sourceText.match(/\b(add|replace|remove|move|style|preserve|keep)\b/gi) || []).map((item) => item.toLowerCase());
  const distinctOps = [...new Set(operationSignals.filter((item) => OPERATIONS.has(item)))];
  if (ready && distinctOps.length > 1 && !(change.primary_operation === 'remove' && distinctOps.every((item) => item === 'remove'))) {
    addFinding(findings, 'IPG_BROAD_ATOM', `Change combines independently testable operations: ${distinctOps.join(', ')}.`, base);
  }
  asArray(change.conflicts).forEach((conflict, index) => {
    const conflictPath = `${base}.conflicts[${index}]`;
    requireFields(conflict, ['conflicting_change_id', 'field', 'resolution', 'superseded_by'], findings, conflictPath, 'conflict');
    if (ready && (!conflict.field || !conflict.superseded_by || !textIncludes(asArray(change.supersedes_ids).join('\n'), conflict.conflicting_change_id))) {
      addFinding(findings, 'IPG_CONFLICT_SUPERSESSION_MISSING', 'Ready conflicting changes require field-level supersession.', conflictPath);
    }
  });
}

function detectSummaryRaw(rawText = '') {
  const head = String(rawText || '').slice(0, 5000);
  return /\b(summary|summarized|compiled correction|current correction compiled|normalized prompt|source excerpt|parent source excerpt|excerpt only|not verbatim)\b/i.test(head);
}

function validateBasicSpecShape(spec, findings) {
  if (!isPlainObject(spec)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'Spec must be a JSON object.');
    return;
  }
  checkUnexpectedKeys(spec, TOP_LEVEL_KEYS, findings, '$');
  requireFields(spec, Array.from(TOP_LEVEL_KEYS), findings, '$', 'spec');
  checkUnexpectedKeys(spec.raw, RAW_KEYS, findings, '$.raw');
  checkUnexpectedKeys(spec.scope, SCOPE_KEYS, findings, '$.scope');
  checkUnexpectedKeys(spec.readiness, READINESS_KEYS, findings, '$.readiness');
  requireFields(spec.raw, Array.from(RAW_KEYS), findings, '$.raw', 'raw');
  requireFields(spec.scope, Array.from(SCOPE_KEYS), findings, '$.scope', 'scope');
  requireFields(spec.readiness, ['status', 'blocking_change_ids'], findings, '$.readiness', 'readiness');
  if (spec.spec_version !== SPEC_VERSION) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', `spec_version must be ${SPEC_VERSION}.`, '$.spec_version');
  }
  if (!/^SPEC-\d{8}-\d{3,}$/.test(spec.spec_id || '')) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'spec_id must match SPEC-YYYYMMDD-###.', '$.spec_id');
  }
  if (!/^RAW-\d{8}-\d{3,}$/.test(spec.raw?.raw_id || '')) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'raw.raw_id must match RAW-YYYYMMDD-###.', '$.raw.raw_id');
  }
  if (spec.raw?.capture_mode !== 'verbatim') {
    addFinding(findings, 'IPG_RAW_CAPTURE_NOT_VERBATIM', 'raw.capture_mode must be verbatim.', '$.raw.capture_mode');
  }
  if (!Array.isArray(spec.changes)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'changes must be an array.', '$.changes');
  }
  if (!Array.isArray(spec.global_invariants)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'global_invariants must be an array.', '$.global_invariants');
  }
  if (!Array.isArray(spec.source_coverage)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'source_coverage must be an array.', '$.source_coverage');
  }
  if (!['draft', 'needs_clarification', 'ready_for_pqc', 'ready_for_implementation'].includes(spec.readiness?.status)) {
    addFinding(findings, 'IPG_SCHEMA_INVALID', 'readiness.status is invalid.', '$.readiness.status');
  }
}

function validateSourceCoverage(spec, rawText, hardSignals, findings) {
  const coveredRanges = new Map();
  asArray(spec.source_coverage).forEach((coverage, index) => {
    const base = `$.source_coverage[${index}]`;
    checkUnexpectedKeys(coverage, COVERAGE_KEYS, findings, base);
    requireFields(coverage, Array.from(COVERAGE_KEYS), findings, base, 'source coverage');
    validateSourceSpan(coverage, rawText, findings, base, COVERAGE_KEYS);
    if (coverage.coverage_status === 'covered') {
      if (!coverage.change_id && !coverage.global_invariant_id) {
        addFinding(findings, 'IPG_COVERAGE_TARGET_MISSING', 'Covered source coverage rows require exactly one change_id or global_invariant_id.', base);
      }
      if (coverage.change_id && coverage.global_invariant_id) {
        addFinding(findings, 'IPG_COVERAGE_TARGET_DUPLICATE', 'Coverage row maps to both a change and global invariant.', base);
      }
      const key = `${coverage.start}:${coverage.end}`;
      if (coveredRanges.has(key)) {
        addFinding(findings, 'IPG_SOURCE_SPAN_MAPPED_MULTIPLE_TIMES', `Source span already covered by ${coveredRanges.get(key)}.`, base);
      }
      coveredRanges.set(key, coverage.change_id || coverage.global_invariant_id);
    } else if (!coverage.reason) {
      addFinding(findings, 'IPG_COVERAGE_REASON_MISSING', 'Ambiguous and non-actionable coverage rows require a reason.', `${base}.reason`);
    }
  });

  for (const signal of hardSignals) {
    const coverage = asArray(spec.source_coverage).find((entry) => coverageOverlapsSignal(entry, signal));
    if (!coverage) {
      addFinding(findings, 'IPG_HARD_SIGNAL_UNCOVERED', `Hard signal is not covered or explicitly classified: ${signal.text}`, '$.source_coverage', 'error', { signal });
    }
  }
}

function validateReadyAssertions(spec, hardSignals, findings) {
  if (!READY_STATUSES.has(spec.readiness?.status)) return;
  const assertionText = allSpecAssertionText(spec);
  for (const signal of hardSignals) {
    if (['number', 'quoted_string', 'asset_or_file', 'named_color', 'removal', 'preservation', 'position', 'component_or_action'].includes(signal.kind)
      && !textIncludes(assertionText, signal.text)) {
      addFinding(
        findings,
        'IPG_READY_ASSERTION_MISSING_HARD_SIGNAL',
        `Ready spec assertions do not represent hard signal: ${signal.text}`,
        '$.changes'
      );
    }
  }
}

function validateIntentSpec(spec = {}, options = {}) {
  const findings = [];
  const warnings = [];
  validateBasicSpecShape(spec, findings);
  if (!isPlainObject(spec)) {
    return { ok: false, ready: false, errors: findings, warnings, hard_signals: [] };
  }

  const { rawPath, rawText, exists } = readRawForSpec(spec, options);
  if (!exists) {
    addFinding(findings, 'IPG_RAW_FILE_MISSING', `Raw file not found: ${spec.raw?.path || '(missing)'}`, '$.raw.path');
  }
  const rawHash = sha256Text(rawText);
  if (exists && spec.raw?.sha256 !== rawHash) {
    addFinding(findings, 'IPG_RAW_HASH_MISMATCH', 'Spec raw.sha256 does not match raw file SHA-256.', '$.raw.sha256', 'error', {
      expected_sha256: rawHash,
      recorded_sha256: spec.raw?.sha256,
    });
  }
  if (exists && spec.raw?.character_count !== rawText.length) {
    addFinding(findings, 'IPG_RAW_CHARACTER_COUNT_MISMATCH', 'Spec raw.character_count does not match raw file character count.', '$.raw.character_count', 'error', {
      expected_character_count: rawText.length,
      recorded_character_count: spec.raw?.character_count,
    });
  }
  if (exists && spec.raw?.capture_mode === 'verbatim' && detectSummaryRaw(rawText)) {
    addFinding(findings, 'IPG_RAW_IDENTIFIES_AS_SUMMARY', 'Spec claims verbatim raw, but the raw source identifies itself as a summary/excerpt/compiled correction.', '$.raw.capture_mode');
  }

  const ready = READY_STATUSES.has(spec.readiness?.status);
  asArray(spec.changes).forEach((change, index) => validateChange(change, rawText, findings, `$.changes[${index}]`, ready));
  asArray(spec.global_invariants).forEach((change, index) => validateChange(change, rawText, findings, `$.global_invariants[${index}]`, ready));

  const hardSignals = exists ? extractHardSignals(rawText) : [];
  validateSourceCoverage(spec, rawText, hardSignals, findings);
  validateReadyAssertions(spec, hardSignals, findings);

  if (ready && asArray(spec.readiness?.blocking_change_ids).length) {
    addFinding(findings, 'IPG_READY_WITH_BLOCKERS', 'Ready specs cannot have blocking_change_ids.', '$.readiness.blocking_change_ids');
  }
  if (ready && asArray(spec.changes).some((change) => change.classification === 'AMBIGUOUS' || change.ambiguity_status === 'unresolved')) {
    addFinding(findings, 'IPG_READY_WITH_UNRESOLVED_AMBIGUITY', 'Ready specs cannot include unresolved ambiguous changes.', '$.changes');
  }
  if (ready && /\b(the text I mentioned before|mentioned before|talked about the text|remember I talked about)\b/i.test(rawText)) {
    const resolved = asArray(spec.source_coverage).some((entry) => /resolved from|superseded by|attached earlier source/i.test(entry.reason || ''));
    if (!resolved) {
      addFinding(findings, 'IPG_UNRESOLVED_CONTEXT_REFERENCE', 'Unresolved contextual reference requires attached earlier source or clarification.', '$.source_coverage');
    }
  }
  if (ready && /\bMember Login must be visibly written in the compact top bar\b/i.test(rawText)
    && /\bMember Login may be in the opened menu\b/i.test(rawText)) {
    const unresolved = asArray(spec.changes).some((change) => change.classification === 'AMBIGUOUS' || change.ambiguity_status === 'unresolved')
      || asArray(spec.source_coverage).some((entry) => entry.coverage_status === 'ambiguous');
    if (!unresolved) {
      addFinding(findings, 'IPG_UNRESOLVED_CONTEXT_REFERENCE', 'Member Login top-bar versus opened-menu placement is material ambiguity and cannot be ready without resolution.', '$.source_coverage');
    }
  }

  const computedFingerprint = fingerprintSpec(spec);
  if (spec.fingerprint !== computedFingerprint) {
    addFinding(findings, 'IPG_FINGERPRINT_MISMATCH', 'Spec fingerprint is stale or incorrect.', '$.fingerprint', 'error', {
      expected_fingerprint: computedFingerprint,
      recorded_fingerprint: spec.fingerprint,
    });
  }

  return {
    ok: findings.length === 0,
    ready: findings.length === 0 && ready,
    prompt_ready: findings.length === 0 && spec.readiness?.status === PROMPT_READY_STATUS,
    errors: findings,
    warnings,
    raw_path: rawPath,
    raw_sha256: rawHash,
    computed_fingerprint: computedFingerprint,
    hard_signals: hardSignals,
    coverage: calculateCoverage(spec, hardSignals),
  };
}

function calculateCoverage(spec = {}, hardSignals = []) {
  const coverageRows = asArray(spec.source_coverage);
  const hardCovered = hardSignals.filter((signal) => coverageRows.some((entry) => coverageOverlapsSignal(entry, signal))).length;
  const actionableRows = coverageRows.filter((entry) => entry.coverage_status !== 'non_actionable');
  const coveredRows = actionableRows.filter((entry) => entry.coverage_status === 'covered');
  return {
    hard_signal_count: hardSignals.length,
    hard_signal_covered_count: hardCovered,
    hard_signal_coverage_ratio: hardSignals.length ? hardCovered / hardSignals.length : 1,
    actionable_span_count: actionableRows.length,
    covered_actionable_span_count: coveredRows.length,
    actionable_span_coverage_ratio: actionableRows.length ? coveredRows.length / actionableRows.length : 1,
  };
}

function changeTargetLabel(change = {}) {
  const target = change.target || {};
  return [
    change.route || '',
    target.section || '',
    target.component || '',
    target.selector || target.accessible_name || target.current_text_anchor || '',
  ].filter(Boolean).join(' > ') || '(unspecified target)';
}

function generateChangeReceipt(spec = {}) {
  const lines = [
    `# Intent Change Receipt - ${spec.spec_id}`,
    '',
    `Fingerprint: ${spec.fingerprint}`,
    '',
  ];
  for (const invariant of asArray(spec.global_invariants)) {
    lines.push(`- ${invariant.change_id} | invariant | ${changeTargetLabel(invariant)} | ${invariant.primary_operation} | ${invariant.required_state}`);
  }
  for (const change of asArray(spec.changes)) {
    lines.push(`- ${change.change_id} | ${changeTargetLabel(change)} | ${change.primary_operation} | ${change.required_state}`);
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function inferFilesFromSpec(spec = {}) {
  const text = [
    ...asArray(spec.scope?.routes),
    ...asArray(spec.changes).flatMap((change) => [
      change.route,
      change.screen,
      change.target?.section,
      change.target?.component,
      change.target?.selector,
      change.target?.current_text_anchor,
      ...asArray(change.must_preserve),
      ...asArray(change.must_remove),
      JSON.stringify(change.exact_payload || {}),
    ]),
  ].join('\n').toLowerCase();
  const files = new Set();
  if (text.includes('/one-time')) {
    files.add('public/one-time/index.html');
    files.add('tests/one-time-focused-landing.test.js');
  }
  if (text.includes('operations')) {
    files.add('public/operations.html');
    files.add('public/js/operations-shell.js');
  }
  if (text.includes('action')) files.add('ops/action-registry.json');
  if (text.includes('route')) files.add('ops/route-registry.json');
  return [...files].sort();
}

function generateCodexPrompt(spec = {}, options = {}) {
  const validation = validateIntentSpec(spec, options);
  if (!validation.prompt_ready) {
    const error = new Error(`Intent spec is not ready for Codex prompt generation: ${[...new Set(validation.errors.map((item) => item.code))].join(', ') || spec.readiness?.status}`);
    error.code = 'IPG_PROMPT_NOT_READY';
    error.validation = validation;
    throw error;
  }
  const includedChanges = [
    ...asArray(spec.global_invariants).map((change) => ({ ...change, invariant: true })),
    ...asArray(spec.changes),
  ].filter((change) => change.classification !== 'NON_ACTIONABLE' && change.ambiguity_status !== 'unresolved');
  const files = inferFilesFromSpec(spec);
  const lines = [
    `# CODEX PROMPT - ${spec.spec_id}`,
    '',
    `Spec fingerprint: ${spec.fingerprint}`,
    `Raw source: ${spec.raw.path}`,
    `Raw SHA-256: ${spec.raw.sha256}`,
    `Workspace/project: ${spec.scope.workspace} / ${spec.scope.project}`,
    `Routes: ${asArray(spec.scope.routes).join(', ') || '(none declared)'}`,
    '',
    '## Operating Order',
    '',
    'VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE',
    '',
    'Report implementation status and evidence per change ID. Do not implement changes outside these IDs.',
    '',
    '## Scoped Files / Routes',
    '',
    ...(files.length ? files.map((file) => `- ${file}`) : ['- Inferred files unavailable; inspect only the routes and targets listed below.']),
    '',
    '## Included Changes',
    '',
  ];
  for (const change of includedChanges) {
    lines.push(`### ${change.change_id}${change.invariant ? ' (global invariant)' : ''}`);
    lines.push(`- Classification: ${change.classification}`);
    lines.push(`- Target: ${changeTargetLabel(change)}`);
    lines.push(`- Operation: ${change.primary_operation}`);
    lines.push(`- Current state: ${change.current_state}`);
    lines.push(`- Required state: ${change.required_state}`);
    lines.push(`- Exact payload: ${JSON.stringify(change.exact_payload || {})}`);
    lines.push(`- Placement: parent=${change.layout?.parent || ''}; before=${change.layout?.sibling_before || ''}; after=${change.layout?.sibling_after || ''}; order=${asArray(change.layout?.order).join(' > ')}`);
    lines.push(`- Style allowlist: ${asArray(change.style_scope?.allowed_targets).join(', ') || '(none)'}`);
    lines.push(`- Style forbidden targets: ${asArray(change.style_scope?.forbidden_targets).join(', ') || '(none)'}`);
    lines.push(`- Must preserve: ${asArray(change.must_preserve).join(' | ') || '(none)'}`);
    lines.push(`- Must remove: ${asArray(change.must_remove).join(' | ') || '(none)'}`);
    lines.push(`- Dependencies: ${asArray(change.dependencies).join(', ') || '(none)'}`);
    lines.push(`- Supersedes: ${asArray(change.supersedes_ids).join(', ') || '(none)'}`);
    lines.push('- Source spans:');
    for (const span of asArray(change.source_spans)) {
      lines.push(`  - ${span.span_id} [${span.start}, ${span.end}]: ${JSON.stringify(span.quote)}`);
    }
    lines.push('- Positive assertions:');
    for (const assertion of asArray(change.acceptance_assertions?.positive)) {
      lines.push(`  - ${assertion.assertion_id}: ${assertion.text}`);
    }
    lines.push('- Negative assertions:');
    for (const assertion of asArray(change.acceptance_assertions?.negative)) {
      lines.push(`  - ${assertion.assertion_id}: ${assertion.text}`);
    }
    lines.push('');
  }
  lines.push('## Forbidden');
  lines.push('');
  lines.push('- Do not paraphrase exact payloads.');
  lines.push('- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.');
  lines.push('- Do not implement unresolved ambiguous changes.');
  lines.push('- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.');
  return `${lines.join('\n').trimEnd()}\n`;
}

function validateGeneratedPrompt(spec = {}, promptText = '') {
  const findings = [];
  const text = String(promptText || '');
  if (!text.includes(spec.spec_id)) {
    addFinding(findings, 'IPG_PROMPT_MISSING_SPEC_ID', 'Generated prompt is missing spec ID.');
  }
  if (!text.includes(spec.fingerprint)) {
    addFinding(findings, 'IPG_PROMPT_MISSING_FINGERPRINT', 'Generated prompt is missing spec fingerprint.');
  }
  for (const change of [...asArray(spec.global_invariants), ...asArray(spec.changes)]) {
    if (change.ambiguity_status === 'unresolved' || change.classification === 'NON_ACTIONABLE') {
      if (text.includes(change.change_id)) {
        addFinding(findings, 'IPG_PROMPT_INCLUDED_BLOCKED_CHANGE', `Prompt includes blocked/non-actionable change ${change.change_id}.`);
      }
    } else if (!text.includes(change.change_id)) {
      addFinding(findings, 'IPG_PROMPT_MISSING_CHANGE_ID', `Prompt is missing change ID ${change.change_id}.`);
    }
  }
  if (fingerprintSpec(spec) !== spec.fingerprint) {
    addFinding(findings, 'IPG_FINGERPRINT_MISMATCH', 'Spec fingerprint is stale or incorrect.');
  }
  return {
    ok: findings.length === 0,
    errors: findings,
  };
}

module.exports = {
  CLASSIFICATIONS,
  OPERATIONS,
  PROMPT_READY_STATUS,
  READY_STATUSES,
  REQUIRED_MOBILE_CTA_VIEWPORTS,
  SPEC_VERSION,
  buildDraftIntentSpec,
  calculateCoverage,
  classifySourceSpan,
  extractHardSignals,
  fingerprintSpec,
  generateChangeReceipt,
  generateCodexPrompt,
  readRawForSpec,
  sha256Text,
  validateGeneratedPrompt,
  validateIntentSpec,
  withFingerprint,
};
