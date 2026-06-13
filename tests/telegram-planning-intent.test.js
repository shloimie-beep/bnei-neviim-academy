const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildCodexWorkFromPlanningSession,
  buildVisiblePlanningPrompt,
  hasExplicitPromptImplementationStart,
  hasPromptPlanningIntent,
  isPromptPlanningRefinement,
  promptPlanningKind,
} = require('../src/lib/bna/telegram-planning-intent');

test('Codex prompt-building request enters planning mode', () => {
  const text = "I want to make a prompt for Codex where we're refining my idea right here before implementation.";

  assert.equal(hasPromptPlanningIntent(text), true);
  assert.equal(promptPlanningKind(text), 'codex');
  assert.equal(hasExplicitPromptImplementationStart(text), false);
});

test('Prompt for Codex to build something is not an immediate build command', () => {
  const text = 'Help me write a prompt for Codex to build the new dashboard flow.';

  assert.equal(hasPromptPlanningIntent(text), true);
  assert.equal(hasExplicitPromptImplementationStart(text), false);
});

test('Explicit apply wording starts implementation from an active planning draft', () => {
  assert.equal(hasExplicitPromptImplementationStart('Looks good, apply this prompt now.'), true);
  assert.equal(hasExplicitPromptImplementationStart('Go ahead and build from this draft.'), true);
});

test('Short follow-up edits are treated as prompt refinements', () => {
  assert.equal(isPromptPlanningRefinement('Make it shorter and include Playwright checks.'), true);
  assert.equal(isPromptPlanningRefinement('Also mention that raw input should be preserved.'), true);
});

test('Planning draft and execution handoff preserve raw input provenance', () => {
  const originalText = 'Make a prompt for Codex about planning mode and preserving the raw Telegram wording.';
  const session = {
    kind: 'codex',
    original_text: originalText,
    revision_inputs: [{ text: 'Add that it should not edit files until I say build.' }],
  };
  session.current_prompt = buildVisiblePlanningPrompt(session);

  assert.match(session.current_prompt, /Original operator input, preserved as provenance:/);
  assert.match(session.current_prompt, /Make a prompt for Codex/);
  assert.match(session.current_prompt, /Do not edit files/);

  const handoff = buildCodexWorkFromPlanningSession(session, 'apply this');
  assert.match(handoff, /Original operator input:/);
  assert.match(handoff, /Make a prompt for Codex/);
  assert.match(handoff, /Refinement history:/);
});
