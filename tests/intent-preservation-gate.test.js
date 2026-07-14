const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const {
  generateChangeReceipt,
  generateCodexPrompt,
  sha256Text,
  validateGeneratedPrompt,
  validateIntentSpec,
  withFingerprint,
} = require('../src/lib/bna/intent-preservation');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bna-intent-spec-'));
}

function sourceSpan(rawText, quote = rawText) {
  const start = rawText.indexOf(quote);
  assert.notEqual(start, -1, `quote not found: ${quote}`);
  return {
    span_id: 'SPAN-001',
    start,
    end: start + quote.length,
    quote,
  };
}

function baseSpec({ rawText, rawPath = 'RAW.md', root = '', operation = 'remove', overrides = {} }) {
  const span = sourceSpan(rawText, overrides.quote || rawText);
  const change = {
    change_id: 'CHG-20990101-001',
    source_spans: [span],
    classification: 'HARD_EXACT',
    provenance: 'USER_STATED',
    confidence: 1,
    ambiguity_status: 'none',
    route: '/one-time',
    screen: 'One Time public landing',
    target: {
      section: 'Landing copy',
      component: 'feature card',
      selector: '',
      accessible_name: '',
      current_text_anchor: 'Monitored online platform',
    },
    primary_operation: operation,
    current_state: 'Current state inspected before implementation.',
    required_state: rawText,
    exact_payload: {},
    layout: { parent: '', sibling_before: '', sibling_after: '', order: [] },
    style_scope: { allowed_targets: [], forbidden_targets: [], properties: [] },
    viewport_behavior: [],
    must_preserve: [],
    must_remove: [],
    conflicts: [],
    supersedes_ids: [],
    acceptance_assertions: {
      positive: [{ assertion_id: 'A-POS-001', text: rawText }],
      negative: [],
    },
    dependencies: [],
    resolution_question: { question: '', choices: [] },
    ...overrides.change,
  };
  return withFingerprint({
    spec_version: 'intent-preservation-v1',
    spec_id: 'SPEC-20990101-001',
    raw: {
      raw_id: 'RAW-20990101-001',
      path: rawPath,
      capture_mode: 'verbatim',
      sha256: sha256Text(rawText),
      character_count: rawText.length,
    },
    scope: {
      workspace: 'rabbi_sheller_provider',
      project: 'one_time_mishnah_class',
      routes: ['/one-time'],
    },
    global_invariants: [],
    changes: [change],
    source_coverage: [{
      coverage_id: 'COV-20990101-001',
      span_id: span.span_id,
      start: span.start,
      end: span.end,
      quote: span.quote,
      classification: change.classification,
      coverage_status: 'covered',
      change_id: change.change_id,
      global_invariant_id: null,
      reason: 'Unit-test atomic mapping.',
    }],
    readiness: {
      status: 'ready_for_implementation',
      blocking_change_ids: [],
      notes: [],
    },
  });
}

test('intent spec validates raw hash, exact spans, fingerprint, receipt, and generated prompt', () => {
  const root = tempDir();
  const rawText = 'Remove Monitored online platform and Questions with Rabbi Scheller.';
  fs.writeFileSync(path.join(root, 'RAW.md'), rawText);
  const spec = baseSpec({
    rawText,
    root,
    operation: 'remove',
    overrides: {
      change: {
        must_remove: ['Monitored online platform', 'Questions with Rabbi Scheller'],
        acceptance_assertions: {
          positive: [{ assertion_id: 'A-POS-001', text: rawText }],
          negative: [{ assertion_id: 'A-NEG-001', text: 'Monitored online platform is absent. Questions with Rabbi Scheller is absent.' }],
        },
      },
    },
  });

  const validation = validateIntentSpec(spec, { root });
  assert.equal(validation.ok, true);
  assert.equal(validation.prompt_ready, true);

  const receipt = generateChangeReceipt(spec);
  assert.match(receipt, /CHG-20990101-001/);
  assert.match(receipt, /Monitored online platform/);

  const prompt = generateCodexPrompt(spec, { root });
  assert.match(prompt, new RegExp(spec.fingerprint));
  assert.match(prompt, /CHG-20990101-001/);
  assert.equal(validateGeneratedPrompt(spec, prompt).ok, true);
});

test('intent validator rejects lost spans, stale fingerprints, broad styling, conditional removal, and lost exact copy', () => {
  const root = tempDir();
  const rawText = 'Make only "Live daily Mishnayos" labels yellow. Keep body copy unchanged.';
  fs.writeFileSync(path.join(root, 'RAW.md'), rawText);
  const styleSpec = baseSpec({
    rawText,
    operation: 'style',
    overrides: {
      change: {
        target: { section: 'Labels', component: 'label', selector: '', accessible_name: '', current_text_anchor: 'Live daily Mishnayos' },
        style_scope: {
          allowed_targets: ['whole section'],
          forbidden_targets: ['body copy'],
          properties: ['color: yellow'],
        },
        must_preserve: ['body copy unchanged'],
      },
    },
  });
  assert.ok(validateIntentSpec(styleSpec, { root }).errors.some((error) => error.code === 'IPG_STYLE_SCOPE_GLOBALIZED'));

  const stale = structuredClone(styleSpec);
  stale.changes[0].source_spans[0].quote = 'Make everything yellow.';
  assert.ok(validateIntentSpec(stale, { root }).errors.some((error) => error.code === 'IPG_SPAN_QUOTE_MISMATCH'));

  const removeRaw = 'Remove Monitored online platform and Questions with Rabbi Scheller.';
  fs.writeFileSync(path.join(root, 'RAW.md'), removeRaw);
  const removeSpec = baseSpec({
    rawText: removeRaw,
    operation: 'remove',
    overrides: {
      change: {
        required_state: 'Remove Monitored online platform and Questions with Rabbi Scheller where redundant.',
        must_remove: ['Monitored online platform', 'Questions with Rabbi Scheller'],
        acceptance_assertions: {
          positive: [{ assertion_id: 'A-POS-001', text: removeRaw }],
          negative: [{ assertion_id: 'A-NEG-001', text: 'Remove Monitored online platform and Questions with Rabbi Scheller where redundant.' }],
        },
      },
    },
  });
  assert.ok(validateIntentSpec(removeSpec, { root }).errors.some((error) => error.code === 'IPG_REMOVAL_CONDITIONALIZED'));

  const exactRaw = 'Use these exact bullets in order: "First exact bullet", "Second exact bullet".';
  fs.writeFileSync(path.join(root, 'RAW.md'), exactRaw);
  const exactSpec = baseSpec({
    rawText: exactRaw,
    operation: 'add',
    overrides: {
      change: {
        exact_payload: { items: ['First exact bullet', 'Second exact bullet'] },
        acceptance_assertions: {
          positive: [
            { assertion_id: 'A-POS-001', text: exactRaw },
            { assertion_id: 'A-POS-002', text: 'First exact bullet' },
          ],
          negative: [],
        },
      },
    },
  });
  const exactCodes = validateIntentSpec(exactSpec, { root }).errors.map((error) => error.code);
  assert.ok(exactCodes.includes('IPG_EXACT_COPY_ASSERTION_MISSING'));
  assert.ok(exactCodes.includes('IPG_EXACT_COPY_ORDER_MISSING'));
});

test('intent prompt generation rejects unresolved ambiguous changes', () => {
  const root = tempDir();
  const rawText = 'The text I mentioned before should be fixed.';
  fs.writeFileSync(path.join(root, 'RAW.md'), rawText);
  const spec = baseSpec({
    rawText,
    operation: 'behavior',
    overrides: {
      change: {
        classification: 'AMBIGUOUS',
        ambiguity_status: 'unresolved',
        resolution_question: {
          question: 'Which exact earlier text source should apply?',
          choices: [
            { label: 'Attach source', description: 'Attach prior raw source.', recommended: true },
            { label: 'Restate', description: 'Restate the exact copy.', recommended: false },
          ],
        },
      },
    },
  });
  spec.readiness.status = 'needs_clarification';
  spec.readiness.blocking_change_ids = ['CHG-20990101-001'];
  const blocked = withFingerprint(spec);
  assert.throws(() => generateCodexPrompt(blocked, { root }), /not ready/);
});

test('intent eval runner catches mandatory regression mutations', () => {
  execFileSync(process.execPath, ['ops/intent-preservation/evals/run-intent-preservation-evals.mjs'], {
    cwd: process.cwd(),
    stdio: 'pipe',
  });
  const report = JSON.parse(fs.readFileSync('ops/intent-preservation/evals/latest-intent-eval-report.json', 'utf8'));
  assert.equal(report.failed, 0);
  assert.equal(report.mutation_passed, report.mutation_total);
  assert.ok(report.results.some((item) => item.id === '008-july-13-landing-mistranslation'));
});
