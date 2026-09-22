const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const serverJs = fs.readFileSync('server.js', 'utf8');

function functionBody(source, name, nextName) {
  const start = source.indexOf(`async function ${name}`);
  assert.notEqual(start, -1, `${name} not found`);
  const end = nextName ? source.indexOf(`async function ${nextName}`, start + 1) : -1;
  assert.notEqual(end, -1, `${nextName} not found after ${name}`);
  return source.slice(start, end);
}

test('Content prompt correction regenerate shows inline progress and updates the card from the API response', () => {
  assert.match(operationsHtml, /let contentGenerationStates = \{\};/);
  assert.match(operationsHtml, /function renderPromptGenerationStatus/);
  assert.match(operationsHtml, /function applyContentJobGenerationResponse/);
  assert.match(operationsHtml, /function upsertContentOutput/);
  assert.match(operationsHtml, /Apply Correction \+ Regenerate/);
  assert.match(operationsHtml, /Patching the saved prompt and regenerating the output/);
  assert.match(operationsHtml, /applyContentJobGenerationResponse\(jobId, outputType, res \|\| \{\}\)/);

  const generateContentOutput = functionBody(operationsHtml, 'generateContentOutput', 'generateSelectedContentOutput');
  assert.match(generateContentOutput, /render\(\[\], \{ force: true \}\)/);
  assert.match(generateContentOutput, /await loadData\(\{ background: true \}\)/);
  assert.doesNotMatch(generateContentOutput, /alert\(res\?\.message/);
});

test('Newsletter prompt correction regenerate has the same inline progress path', () => {
  assert.match(operationsHtml, /let newsletterGenerationStates = \{\};/);
  assert.match(operationsHtml, /function applyNewsletterGenerationResponse/);
  assert.match(operationsHtml, /Patching the newsletter prompt and regenerating the draft/);
  assert.match(operationsHtml, /generateBundleNewsletter\(event, \$\{Number\(bundle\.id\)\}, \$\{Number\(output\.id\)\}\)/);

  const generateBundleNewsletter = functionBody(operationsHtml, 'generateBundleNewsletter', 'saveNewsletterBundleDraft');
  assert.match(generateBundleNewsletter, /render\(\[\], \{ force: true \}\)/);
  assert.match(generateBundleNewsletter, /await loadData\(\{ background: true \}\)/);
  assert.doesNotMatch(generateBundleNewsletter, /alert\(res\?\.message/);
});

test('Content job regeneration response includes patched prompt text for immediate UI refresh', () => {
  assert.match(serverJs, /prompt_text: prompt\.prompt_text/);
});
