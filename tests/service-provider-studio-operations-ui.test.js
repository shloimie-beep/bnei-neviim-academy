const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');

function studioBlock() {
  const start = operations.indexOf('function renderStudio()');
  const end = operations.indexOf('function renderApiUsage()', start);
  assert.ok(start > -1, 'renderStudio should exist');
  assert.ok(end > start, 'Studio block should end before API usage renderer');
  return operations.slice(start, end);
}

test('Studio is a first-class Operations view for platform and provider workspaces', () => {
  assert.match(operations, /const STUDIO_SUBTABS = \[/);
  assert.match(operations, /let studioSection = currentView === 'studio'/);
  assert.match(operations, /studio: \{ tabs: STUDIO_SUBTABS, active: studioSection, countSource: studioSubnavCounts\(\), label: 'Studio' \}/);
  assert.match(operations, /case 'studio': content = renderStudio\(\); break;/);
  assert.match(operations, /platform: \[[^\]]*'studio'[^\]]*\]/);
  assert.match(operations, /service_provider: \[[^\]]*'studio'[^\]]*\]/);
  assert.match(operations, /if \(currentView === 'studio' \|\| currentView === 'content'/);
});

test('Studio client methods cover intake, storyboard, prompt, correction, render, usage, and handoff actions', () => {
  [
    'getStudioDashboard',
    'getStudioProjects',
    'getStudioProject',
    'createStudioProject',
    'saveStudioSource',
    'generateStudioOutline',
    'generateStudioStoryboard',
    'compileStudioPrompt',
    'previewStudioCorrection',
    'applyStudioCorrection',
    'updateStudioScene',
    'regenerateStudioScene',
    'renderStudioProject',
    'retryStudioJob',
    'cancelStudioJob',
    'handoffStudioProject',
    'getStudioUsage',
  ].forEach((method) => assert.match(operations, new RegExp(`${method}\\(`)));
});

test('Studio renderer exposes complete workflow panels without external publish controls', () => {
  const block = studioBlock();
  [
    'renderStudioSourcePanel',
    'renderStudioStoryboardPanel',
    'renderStudioPromptPanel',
    'renderStudioJobsPanel',
    'renderStudioUsagePanel',
    'renderStudioHandoffPanel',
    'Save Source',
    'Generate Storyboard',
    'Compile Prompt',
    'Preview Correction',
    'Apply Preview',
    'Run Mock Render',
    'Create Content Handoff',
    'No Content handoffs have been created',
  ].forEach((needle) => assert.match(block, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.match(block, /It does not publish, send, schedule, upload, or call an external social provider/);
  assert.doesNotMatch(block, /Buffer|publishNow|sendEmail|grantMemberAccess|GoHighLevel|LeadConnector/i);
});

test('Studio handlers are exported for inline Operations controls', () => {
  const exportStart = operations.indexOf('Object.assign(window, {');
  assert.ok(exportStart > -1);
  const exportBlock = operations.slice(exportStart, operations.indexOf('});', exportStart) + 3);
  [
    'setStudioSection',
    'selectStudioProject',
    'createStudioProjectFromForm',
    'saveStudioSourceFromForm',
    'compileStudioPrompt',
    'applyStudioCorrection',
    'handoffStudioProject',
  ].forEach((handler) => assert.match(exportBlock, new RegExp(`\\b${handler}\\b`)));
});
