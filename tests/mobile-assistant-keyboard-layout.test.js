const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');

test('mobile assistant panel uses keyboard offset and visible viewport height', () => {
  assert.match(widget, /--assistant-mobile-panel-height: clamp\(280px, calc\(var\(--app-vh\) \* 0\.72\), calc\(var\(--app-vh\) - 24px\)\)/);
  assert.match(widget, /bottom: calc\(max\(8px, env\(safe-area-inset-bottom\)\) \+ var\(--keyboard-offset\)\)/);
  assert.match(widget, /height: var\(--assistant-mobile-panel-height\)/);
  assert.match(widget, /max-width: calc\(100vw - 16px\)/);
  assert.match(widget, /max-height: calc\(var\(--app-vh\) - 16px\)/);
  assert.match(widget, /body\.bna-assistant-keyboard-open \.bna-bot-launcher\.is-panel-open[\s\S]*?display: none/);
});

test('assistant composer is kept reachable after mobile viewport changes', () => {
  assert.match(widget, /function keepAssistantComposerReachable\(\)/);
  assert.match(widget, /form\.scrollIntoView\(\{ block: 'end', inline: 'nearest' \}\)/);
  assert.match(widget, /threadEl\.scrollTop = threadEl\.scrollHeight/);
  assert.match(widget, /function handleAssistantViewportChange\(\)/);
  assert.match(widget, /window\.visualViewport\?\.addEventListener\('resize', handleAssistantViewportChange\)/);
  assert.match(widget, /window\.visualViewport\?\.addEventListener\('scroll', handleAssistantViewportChange\)/);
  assert.match(widget, /document\.body\?\.classList\.toggle\('bna-assistant-keyboard-open', keyboardOffset > 40\)/);
  assert.match(widget, /setTimeout\(keepAssistantComposerReachable, 260\)/);
});

test('assistant sheet keeps internal scrolling without horizontal expansion', () => {
  assert.match(widget, /grid-template-rows: auto minmax\(0, 1fr\) auto auto/);
  assert.match(widget, /\.bna-bot-panel[\s\S]*?box-sizing: border-box[\s\S]*?overflow: hidden/);
  assert.match(widget, /\.bna-bot-thread[\s\S]*?min-height: 0[\s\S]*?min-width: 0[\s\S]*?overflow: auto[\s\S]*?overscroll-behavior: contain/);
  assert.match(widget, /\.bna-bot-form[\s\S]*?box-sizing: border-box[\s\S]*?min-width: 0[\s\S]*?flex-shrink: 0/);
  assert.match(widget, /\.bna-bot-input[\s\S]*?overflow: auto[\s\S]*?min-width: 0/);
});
