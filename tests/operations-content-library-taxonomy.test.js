const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');

test('Content Library exposes topic and source filters above the library', () => {
  assert.match(operationsHtml, /let contentTopicFilter = 'all';/);
  assert.match(operationsHtml, /let contentSourceFilter = 'all';/);
  assert.match(operationsHtml, /const CONTENT_TOPIC_FILTERS = \[/);
  assert.match(operationsHtml, /\{ id: 'torah', label: 'Torah' \}/);
  assert.match(operationsHtml, /\{ id: 'class_notes', label: 'Class Notes' \}/);
  assert.match(operationsHtml, /\{ id: 'psychology', label: 'Psychology' \}/);
  assert.match(operationsHtml, /\{ id: 'health', label: 'Health' \}/);
  assert.match(operationsHtml, /const CONTENT_SOURCE_FILTERS = \[/);
  assert.match(operationsHtml, /\{ id: 'youtube', label: 'YouTube' \}/);
  assert.match(operationsHtml, /\{ id: 'drive', label: 'Drive' \}/);
  assert.match(operationsHtml, /renderFilterSelect\('setContentFilter', 'topic'/);
  assert.match(operationsHtml, /renderFilterSelect\('setContentFilter', 'source'/);
  assert.match(operationsHtml, /if \(kind === 'topic'\) contentTopicFilter = value;/);
  assert.match(operationsHtml, /if \(kind === 'source'\) contentSourceFilter = value;/);
});

test('Content Library topic filtering is multi-topic and does not use raw transcript body search', () => {
  assert.match(operationsHtml, /function contentTopicKeys/);
  assert.match(operationsHtml, /contentTopicKeys\(job\)\.includes\(contentTopicFilter\)/);
  assert.match(operationsHtml, /const topicCounts = countByTopicKeys\(visibleJobs\);/);
  assert.match(operationsHtml, /function countByTopicKeys/);
  assert.match(operationsHtml, /Search title, source, output, or metadata/);
  assert.doesNotMatch(operationsHtml, /Search title, transcript, source, output, or metadata/);
});

test('Transcript-only content jobs are shown as needing output, with source context', () => {
  assert.match(operationsHtml, /\{ id: 'needs_output', label: 'Needs Output' \}/);
  assert.match(operationsHtml, /function contentNeedsOutput/);
  assert.match(operationsHtml, /return status === 'transcribed' && activeContentOutputs\(job\)\.length === 0;/);
  assert.match(operationsHtml, /if \(contentNeedsOutput\(job\)\) return 'Needs Output';/);
  assert.match(operationsHtml, /if \(contentNeedsOutput\(job\)\) return 'needs_output';/);
  assert.match(operationsHtml, /Open source/);
  assert.match(operationsHtml, /transcript chars/);
  assert.match(operationsHtml, /Transcript is saved, but no platform output has been generated yet/);
});

test('Content Library taxonomy helpers classify topic and source from job data', () => {
  assert.match(operationsHtml, /function contentTopicKey/);
  assert.match(operationsHtml, /function contentTopicKeys/);
  assert.match(operationsHtml, /function contentSourceKey/);
  assert.match(operationsHtml, /function contentTopicHaystack/);
  assert.match(operationsHtml, /function inferredContentTopics/);
  assert.match(operationsHtml, /youtube\\.com\|youtu\\.be/);
  assert.match(operationsHtml, /sourceType\.includes\('google_drive'\)/);
});
