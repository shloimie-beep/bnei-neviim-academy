#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  buildDraftIntentSpec,
  generateChangeReceipt,
  generateCodexPrompt,
  sha256Text,
  validateGeneratedPrompt,
  validateIntentSpec,
  withFingerprint,
} = require('../../../src/lib/bna/intent-preservation');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const GENERATED_DIR = path.join(HERE, 'generated');
const REPORT_JSON = path.join(HERE, 'latest-intent-eval-report.json');
const REPORT_MD = path.join(HERE, 'latest-intent-eval-report.md');

function repoPath(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeRaw(caseId, rawText) {
  const dir = ensureDir(path.join(GENERATED_DIR, caseId));
  const rawPath = path.join(dir, 'RAW.md');
  fs.writeFileSync(rawPath, rawText);
  return repoPath(rawPath);
}

function sourceSpan(rawText, quote = rawText, spanId = 'SPAN-001') {
  const start = rawText.indexOf(quote);
  if (start < 0) throw new Error(`Quote not found in raw: ${quote}`);
  return {
    span_id: spanId,
    start,
    end: start + quote.length,
    quote,
  };
}

function baseChange({ id, rawText, quote = rawText, operation = 'add', route = '/one-time', overrides = {} }) {
  const span = sourceSpan(rawText, quote, `${id}:S01`);
  const exactItems = overrides.exact_payload?.items || [];
  const assertionText = [
    quote,
    exactItems.length ? exactItems.join('\n') : '',
    ...(overrides.must_preserve || []),
    ...(overrides.must_remove || []),
  ].filter(Boolean).join('\n');
  return {
    change_id: id,
    source_spans: [span],
    classification: 'HARD_EXACT',
    provenance: 'USER_STATED',
    confidence: 1,
    ambiguity_status: 'none',
    route,
    screen: 'One Time public landing',
    target: {
      section: 'One Time public landing',
      component: 'Landing section',
      selector: '',
      accessible_name: '',
      current_text_anchor: '',
    },
    primary_operation: operation,
    current_state: 'Current state must be inspected before implementation.',
    required_state: quote,
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
      positive: [{ assertion_id: `${id}-POS-001`, text: assertionText }],
      negative: [],
    },
    dependencies: [],
    resolution_question: {
      question: '',
      choices: [],
    },
    ...overrides,
  };
}

function makeSpec({
  caseId,
  rawText,
  rawPath,
  change,
  changes = null,
  globalInvariants = [],
  readiness = 'ready_for_implementation',
}) {
  const relativeRawPath = rawPath || writeRaw(caseId, rawText);
  const effectiveChanges = changes || [change];
  const coverage = [
    ...effectiveChanges.flatMap((item, index) => item.source_spans.map((span) => ({
      coverage_id: `COV-20990101-${String(index + 1).padStart(3, '0')}`,
      span_id: span.span_id,
      start: span.start,
      end: span.end,
      quote: span.quote,
      classification: item.classification,
      coverage_status: item.classification === 'NON_ACTIONABLE' ? 'non_actionable' : 'covered',
      change_id: item.change_id,
      global_invariant_id: null,
      reason: 'Mapped to one atomic change by eval compiler.',
    }))),
    ...globalInvariants.flatMap((item, index) => item.source_spans.map((span) => ({
      coverage_id: `COV-20990101-I${String(index + 1).padStart(3, '0')}`,
      span_id: span.span_id,
      start: span.start,
      end: span.end,
      quote: span.quote,
      classification: item.classification,
      coverage_status: 'covered',
      change_id: null,
      global_invariant_id: item.change_id,
      reason: 'Mapped to one global invariant by eval compiler.',
    }))),
  ];
  return withFingerprint({
    spec_version: 'intent-preservation-v1',
    spec_id: `SPEC-20990101-${caseId.match(/\d+/)?.[0] || '001'}`,
    raw: {
      raw_id: `RAW-20990101-${caseId.match(/\d+/)?.[0] || '001'}`,
      path: relativeRawPath,
      capture_mode: 'verbatim',
      sha256: sha256Text(rawText),
      character_count: rawText.length,
    },
    scope: {
      workspace: 'rabbi_sheller_provider',
      project: 'one_time_mishnah_class',
      routes: ['/one-time'],
    },
    global_invariants: globalInvariants,
    changes: effectiveChanges,
    source_coverage: coverage,
    readiness: {
      status: readiness,
      blocking_change_ids: readiness.startsWith('ready') ? [] : effectiveChanges.map((item) => item.change_id),
      notes: [],
    },
  });
}

function resultCodes(validation) {
  return [...new Set(validation.errors.map((error) => error.code))];
}

function expectedFailureSatisfied(validation, expected = []) {
  if (!expected.length) return validation.ok;
  const codes = resultCodes(validation);
  return !validation.ok && expected.every((code) => codes.includes(code));
}

function mutationResult(mutation, spec) {
  if (mutation.expectPromptThrow) {
    try {
      generateCodexPrompt(spec, { root: ROOT });
      return { id: mutation.id, passed: false, actual_failure_codes: [], expected_failure_codes: mutation.expected, errors: [{ code: 'PROMPT_DID_NOT_THROW' }] };
    } catch (error) {
      const codes = error.validation ? resultCodes(error.validation) : [error.code || 'PROMPT_THROWN'];
      return {
        id: mutation.id,
        passed: mutation.expected.every((code) => codes.includes(code) || code === error.code),
        expected_failure_codes: mutation.expected,
        actual_failure_codes: codes,
        errors: error.validation?.errors || [{ code: error.code || 'PROMPT_THROWN', message: error.message }],
      };
    }
  }
  const validation = validateIntentSpec(spec, { root: ROOT });
  const codes = resultCodes(validation);
  return {
    id: mutation.id,
    passed: !validation.ok && mutation.expected.every((code) => codes.includes(code)),
    expected_failure_codes: mutation.expected,
    actual_failure_codes: codes,
    errors: validation.errors,
  };
}

function runCase(testCase) {
  const draftRawPath = writeRaw(testCase.id, testCase.raw);
  const draft = buildDraftIntentSpec({
    rawText: testCase.raw,
    rawId: `RAW-20990101-${testCase.id.match(/\d+/)?.[0] || '001'}`,
    rawPath: draftRawPath,
    specId: `SPEC-20990101-${testCase.id.match(/\d+/)?.[0] || '001'}`,
    scope: { workspace: 'rabbi_sheller_provider', project: 'one_time_mishnah_class', routes: ['/one-time'] },
  });
  const draftValidation = validateIntentSpec(draft, { root: ROOT });
  const passSpec = testCase.passSpec(draftRawPath);
  const passValidation = validateIntentSpec(passSpec, { root: ROOT });
  const draftPassed = expectedFailureSatisfied(draftValidation, testCase.draftExpectedFailureCodes || []);
  const passPassed = expectedFailureSatisfied(passValidation, testCase.passExpectedFailureCodes || []);
  const artifacts = {};
  if (passValidation.ok && passSpec.readiness.status === 'ready_for_implementation') {
    const dir = ensureDir(path.join(GENERATED_DIR, testCase.id));
    const receipt = generateChangeReceipt(passSpec);
    const prompt = generateCodexPrompt(passSpec, { root: ROOT });
    fs.writeFileSync(path.join(dir, 'SPEC.json'), `${JSON.stringify(passSpec, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, 'RECEIPT.md'), receipt);
    fs.writeFileSync(path.join(dir, 'CODEX_PROMPT.md'), prompt);
    artifacts.spec = repoPath(path.join(dir, 'SPEC.json'));
    artifacts.receipt = repoPath(path.join(dir, 'RECEIPT.md'));
    artifacts.prompt = repoPath(path.join(dir, 'CODEX_PROMPT.md'));
    const promptIntegrity = validateGeneratedPrompt(passSpec, prompt);
    if (!promptIntegrity.ok) {
      passValidation.errors.push(...promptIntegrity.errors);
    }
  }
  const mutationResults = testCase.mutations.map((mutation) => mutationResult(mutation, mutation.spec.call(testCase, passSpec, draftRawPath)));
  return {
    id: testCase.id,
    description: testCase.description,
    draft_path: draftRawPath,
    draft_passed: draftPassed,
    pass_passed: passPassed,
    draft_expected_failure_codes: testCase.draftExpectedFailureCodes || [],
    pass_expected_failure_codes: testCase.passExpectedFailureCodes || [],
    pass_failure_codes: resultCodes(passValidation),
    mutations_passed: mutationResults.filter((item) => item.passed).length,
    mutations_total: mutationResults.length,
    mutation_results: mutationResults,
    artifacts,
  };
}

function clone(value) {
  return structuredClone(value);
}

const cases = [
  {
    id: '001-containment-versus-repetition',
    description: 'Several exact bullets must stay inside one Live Daily Mishnayos bubble with icon/title order.',
    raw: 'Add these exact bullets inside the same Live Daily Mishnayos bubble in order: "Daily class link", "7:00 p.m. live class", "Review sheets". Put the icon above the bubble and the title below the icon.',
    passSpec(rawPath) {
      const raw = this.raw;
      const change = baseChange({
        id: 'CHG-20990101-001',
        rawText: raw,
        operation: 'add',
        overrides: {
          target: { section: 'Live Daily Mishnayos', component: 'bubble', selector: '[data-live-daily-mishnayos]', accessible_name: 'Live Daily Mishnayos', current_text_anchor: 'Live Daily Mishnayos' },
          exact_payload: { items: ['Daily class link', '7:00 p.m. live class', 'Review sheets'] },
          layout: { parent: 'Live Daily Mishnayos bubble', sibling_before: 'icon', sibling_after: '', order: ['icon', 'title', 'bubble', 'Daily class link', '7:00 p.m. live class', 'Review sheets'] },
        },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change });
    },
    mutations: [
      {
        id: 'FAIL-separate-cards',
        expected: ['IPG_CONTAINMENT_MISMATCH'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].layout.parent = 'separate cards';
          return withFingerprint(spec);
        },
      },
      {
        id: 'FAIL-icon-below-list',
        expected: ['IPG_CONTAINMENT_MISMATCH'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].layout.order = ['title', 'bubble', 'Daily class link', '7:00 p.m. live class', 'Review sheets', 'icon'];
          return withFingerprint(spec);
        },
      },
    ],
  },
  {
    id: '002-scoped-yellow-styling',
    description: 'Only named labels may become yellow; body copy remains unchanged.',
    raw: 'Make only "Live daily Mishnayos", "Review support", and "Family and school signup" labels yellow. Keep body copy unchanged.',
    passSpec(rawPath) {
      const raw = this.raw;
      const change = baseChange({
        id: 'CHG-20990101-002',
        rawText: raw,
        operation: 'style',
        overrides: {
          target: { section: 'Landing labels', component: 'labels', selector: '.feature-label', accessible_name: '', current_text_anchor: 'Live daily Mishnayos' },
          style_scope: {
            allowed_targets: ['Live daily Mishnayos', 'Review support', 'Family and school signup'],
            forbidden_targets: ['body copy', 'section wrapper', 'all labels'],
            properties: ['color: yellow'],
          },
          must_preserve: ['body copy unchanged'],
        },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change });
    },
    mutations: [
      {
        id: 'FAIL-global-yellow',
        expected: ['IPG_STYLE_SCOPE_GLOBALIZED'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].style_scope.allowed_targets = ['whole section'];
          return withFingerprint(spec);
        },
      },
    ],
  },
  {
    id: '003-unconditional-removal',
    description: 'Exact removal instructions must remain unconditional.',
    raw: 'Remove Monitored online platform and Questions with Rabbi Scheller.',
    passSpec(rawPath) {
      const raw = this.raw;
      const change = baseChange({
        id: 'CHG-20990101-003',
        rawText: raw,
        operation: 'remove',
        overrides: {
          target: { section: 'Landing copy', component: 'feature cards', selector: '', accessible_name: '', current_text_anchor: 'Monitored online platform' },
          must_remove: ['Monitored online platform', 'Questions with Rabbi Scheller'],
          acceptance_assertions: {
            positive: [{ assertion_id: 'CHG-20990101-003-POS-001', text: raw }],
            negative: [{ assertion_id: 'CHG-20990101-003-NEG-001', text: 'Monitored online platform is absent. Questions with Rabbi Scheller is absent.' }],
          },
        },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change });
    },
    mutations: [
      {
        id: 'FAIL-conditional-removal',
        expected: ['IPG_REMOVAL_CONDITIONALIZED'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].required_state = 'Remove Monitored online platform and Questions with Rabbi Scheller where redundant.';
          spec.changes[0].acceptance_assertions.negative[0].text = 'Remove Monitored online platform and Questions with Rabbi Scheller where redundant.';
          return withFingerprint(spec);
        },
      },
    ],
  },
  {
    id: '004-preserve-versus-stale-instruction',
    description: 'Current Accomplishment image supersedes older Toronto instruction.',
    raw: 'Preserve the currently approved Accomplishment image C:\\Users\\User\\Downloads\\Lakewood 3.jpg. Supersede the older Toronto-image instruction.',
    passSpec(rawPath) {
      const raw = this.raw;
      const invariant = baseChange({
        id: 'CHG-20990101-004',
        rawText: raw,
        operation: 'preserve',
        overrides: {
          target: { section: 'Gain cards', component: 'Accomplishment image', selector: '[data-outcome="accomplishment"]', accessible_name: 'Accomplishment', current_text_anchor: 'Accomplishment' },
          must_preserve: ['C:\\Users\\User\\Downloads\\Lakewood 3.jpg'],
          conflicts: [{ conflicting_change_id: 'CHG-20260712-TORONTO', field: 'asset_path', resolution: 'Lakewood 3.jpg is newer and currently approved.', superseded_by: 'CHG-20990101-004' }],
          supersedes_ids: ['CHG-20260712-TORONTO'],
        },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change: invariant, changes: [], globalInvariants: [invariant] });
    },
    mutations: [
      {
        id: 'FAIL-stale-asset-wins',
        expected: ['IPG_READY_ASSERTION_MISSING_HARD_SIGNAL'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.global_invariants[0].must_preserve = ['Toronto image'];
          spec.global_invariants[0].acceptance_assertions.positive[0].text = 'Preserve the older Toronto image.';
          return withFingerprint(spec);
        },
      },
    ],
  },
  {
    id: '005-mobile-cta-invariant',
    description: 'Mobile first load must show an enabled unobscured Sign Up Now control and preserve header actions.',
    raw: 'When the mobile landing page first loads, at least one primary Sign Up Now control must be fully visible without scrolling. Assert 360x640, 375x667, 390x844, and 430x932. The visible control is enabled, unobscured, and goes to /one-time/signup. Preserve the logo, mobile navigation control, and Member Login action.',
    passSpec(rawPath) {
      const raw = this.raw;
      const change = baseChange({
        id: 'CHG-20990101-005',
        rawText: raw,
        operation: 'behavior',
        overrides: {
          target: { section: 'Mobile header and hero', component: 'primary CTA', selector: 'a[href="/one-time/signup"]', accessible_name: 'Sign Up Now', current_text_anchor: 'Sign Up Now' },
          viewport_behavior: ['360x640', '375x667', '390x844', '430x932'].map((viewport) => ({ viewport, assertion: `${viewport}: Sign Up Now is fully visible without scrolling, enabled, unobscured, links to /one-time/signup, and preserves logo, mobile navigation control, and Member Login action.` })),
          must_preserve: ['logo', 'mobile navigation control', 'Member Login action'],
        },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change });
    },
    mutations: [
      {
        id: 'FAIL-missing-mobile-viewport',
        expected: ['IPG_MOBILE_CTA_VIEWPORT_MISSING'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].viewport_behavior = spec.changes[0].viewport_behavior.filter((entry) => entry.viewport !== '360x640');
          return withFingerprint(spec);
        },
      },
      {
        id: 'FAIL-member-login-ambiguity-ready',
        expected: ['IPG_UNRESOLVED_CONTEXT_REFERENCE'],
        spec(passSpec, rawPath) {
          const raw = 'Treat "Member Login must be visibly written in the compact top bar" versus "Member Login may be in the opened menu" as unresolved unless the source explicitly chooses one.';
          const pathForRaw = writeRaw('005-mobile-cta-member-login-ambiguity', raw);
          const change = baseChange({ id: 'CHG-20990101-055', rawText: raw, operation: 'behavior' });
          return makeSpec({ caseId: '005-mobile-cta-member-login-ambiguity', rawText: raw, rawPath: pathForRaw, change });
        },
      },
    ],
  },
  {
    id: '006-exact-copy-survival',
    description: 'Every user-provided bullet remains byte-for-byte identical and ordered.',
    raw: 'Use these exact bullets in order: "First exact bullet", "Second exact bullet", "Third exact bullet".',
    passSpec(rawPath) {
      const raw = this.raw;
      const items = ['First exact bullet', 'Second exact bullet', 'Third exact bullet'];
      const change = baseChange({
        id: 'CHG-20990101-006',
        rawText: raw,
        operation: 'add',
        overrides: {
          exact_payload: { items },
          acceptance_assertions: {
            positive: [
              { assertion_id: 'CHG-20990101-006-POS-001', text: raw },
              { assertion_id: 'CHG-20990101-006-POS-002', text: items.join('\n') },
            ],
            negative: [],
          },
        },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change });
    },
    mutations: [
      {
        id: 'FAIL-omitted-bullet',
        expected: ['IPG_EXACT_COPY_ASSERTION_MISSING', 'IPG_EXACT_COPY_ORDER_MISSING'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].acceptance_assertions.positive[1].text = 'First exact bullet\nThird exact bullet';
          return withFingerprint(spec);
        },
      },
    ],
  },
  {
    id: '007-generated-artifact-integrity',
    description: 'Prompt must contain every change ID and the spec fingerprint; stale specs fail.',
    raw: 'Replace "old line" with "new line" exactly.',
    passSpec(rawPath) {
      const raw = this.raw;
      const change = baseChange({
        id: 'CHG-20990101-007',
        rawText: raw,
        operation: 'replace',
        overrides: { exact_payload: { old_text: 'old line', new_text: 'new line' } },
      });
      return makeSpec({ caseId: this.id, rawText: raw, rawPath, change });
    },
    mutations: [
      {
        id: 'FAIL-stale-fingerprint',
        expected: ['IPG_FINGERPRINT_MISMATCH'],
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].required_state = 'Replace old line with new line and extra drift.';
          return spec;
        },
      },
      {
        id: 'FAIL-ambiguous-change-in-prompt',
        expected: ['IPG_PROMPT_NOT_READY'],
        expectPromptThrow: true,
        spec(passSpec) {
          const spec = clone(passSpec);
          spec.changes[0].classification = 'AMBIGUOUS';
          spec.changes[0].ambiguity_status = 'unresolved';
          spec.readiness.status = 'needs_clarification';
          spec.readiness.blocking_change_ids = [spec.changes[0].change_id];
          return withFingerprint(spec);
        },
      },
    ],
  },
  {
    id: '008-july-13-landing-mistranslation',
    description: 'The July 13 broad fix-the-text source must stop at clarification instead of inventing a removal requirement.',
    raw: fs.readFileSync(path.join(ROOT, 'raw-input', 'RAW-20260713-007-onetime-landing-text-crop-followup.md'), 'utf8',
    ),
    draftExpectedFailureCodes: ['IPG_RAW_IDENTIFIES_AS_SUMMARY'],
    passExpectedFailureCodes: ['IPG_RAW_IDENTIFIES_AS_SUMMARY'],
    passSpec(rawPath) {
      const raw = this.raw;
      const quote = 'Also, make sure you, you fix the text. I remember I talked about the text also. There were some things I wanted you to change. So, remember, just do all these things regarding the landing page, because people are gonna start signing up now.';
      const change = baseChange({
        id: 'CHG-20990101-008',
        rawText: raw,
        quote,
        operation: 'behavior',
        overrides: {
          classification: 'AMBIGUOUS',
          ambiguity_status: 'unresolved',
          confidence: 0.2,
          resolution_question: {
            question: 'Which exact previously mentioned landing text changes should be applied?',
            choices: [
              { label: 'Attach prior source', description: 'Use the earlier raw packet that contains exact text changes.', recommended: true },
              { label: 'Restate changes', description: 'Operator restates each exact text add/remove/preserve instruction.', recommended: false },
            ],
          },
        },
      });
      const spec = makeSpec({ caseId: this.id, rawText: raw, rawPath: 'raw-input/RAW-20260713-007-onetime-landing-text-crop-followup.md', change, readiness: 'needs_clarification' });
      spec.source_coverage.push({
        coverage_id: 'COV-20990101-008-FULL',
        span_id: 'RAW-20260713-007:FULL',
        start: 0,
        end: raw.length,
        quote: raw,
        classification: 'AMBIGUOUS',
        coverage_status: 'ambiguous',
        change_id: null,
        global_invariant_id: null,
        reason: 'Full raw is not trustworthy verbatim authority because it contains compiled/source-summary text; block for clarification.',
      });
      return withFingerprint(spec);
    },
    mutations: [
      {
        id: 'FAIL-inferred-removal-ready',
        expected: ['IPG_RAW_IDENTIFIES_AS_SUMMARY', 'IPG_UNRESOLVED_CONTEXT_REFERENCE'],
        spec() {
          const raw = this.raw;
          const quote = 'Also, make sure you, you fix the text. I remember I talked about the text also. There were some things I wanted you to change. So, remember, just do all these things regarding the landing page, because people are gonna start signing up now.';
          const change = baseChange({
            id: 'CHG-20990101-088',
            rawText: raw,
            quote,
            operation: 'remove',
            overrides: {
              must_remove: ['Monitored online platform', 'Questions with Rabbi Scheller'],
              acceptance_assertions: {
                positive: [{ assertion_id: 'CHG-20990101-088-POS-001', text: quote }],
                negative: [{ assertion_id: 'CHG-20990101-088-NEG-001', text: 'Monitored online platform is absent. Questions with Rabbi Scheller is absent.' }],
              },
            },
          });
          return makeSpec({ caseId: '008-july-13-landing-mistranslation', rawText: raw, rawPath: 'raw-input/RAW-20260713-007-onetime-landing-text-crop-followup.md', change });
        },
      },
    ],
  },
];

function main() {
  ensureDir(GENERATED_DIR);
  const results = cases.map(runCase);
  const failed = results.filter((result) => !result.draft_passed || !result.pass_passed || result.mutations_passed !== result.mutations_total);
  const payload = {
    generated_at: new Date().toISOString(),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    mutation_total: results.reduce((sum, result) => sum + result.mutations_total, 0),
    mutation_passed: results.reduce((sum, result) => sum + result.mutations_passed, 0),
    results,
  };
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  const lines = [
    '# Intent Preservation Eval Report',
    '',
    `Generated: ${payload.generated_at}`,
    `Passed: ${payload.passed}/${payload.total}`,
    `Mutation failures caught: ${payload.mutation_passed}/${payload.mutation_total}`,
    '',
  ];
  for (const result of results) {
    lines.push(`## ${!result.draft_passed || !result.pass_passed || result.mutations_passed !== result.mutations_total ? 'FAIL' : 'PASS'} ${result.id}`);
    lines.push(result.description);
    lines.push(`Draft valid: ${result.draft_passed ? 'yes' : 'no'}`);
    lines.push(`Completed spec valid: ${result.pass_passed ? 'yes' : 'no'}`);
    if (result.pass_failure_codes.length) lines.push(`Pass failure codes: ${result.pass_failure_codes.join(', ')}`);
    lines.push(`Mutations caught: ${result.mutations_passed}/${result.mutations_total}`);
    if (result.artifacts.spec) lines.push(`Generated SPEC: \`${result.artifacts.spec}\``);
    for (const mutation of result.mutation_results) {
      lines.push(`- ${mutation.passed ? 'PASS' : 'FAIL'} ${mutation.id}: expected ${mutation.expected_failure_codes.join(', ') || '(throw)'}; actual ${mutation.actual_failure_codes.join(', ') || '(none)'}`);
    }
    lines.push('');
  }
  fs.writeFileSync(REPORT_MD, `${lines.join('\n').trimEnd()}\n`);
  console.log(`Intent preservation eval report: ${repoPath(REPORT_MD)}`);
  console.log(`Intent preservation eval JSON: ${repoPath(REPORT_JSON)}`);
  process.exitCode = failed.length ? 1 : 0;
}

try {
  main();
} catch (error) {
  console.error(`Intent preservation eval runner failed: ${error.stack || error.message}`);
  process.exitCode = 2;
}
