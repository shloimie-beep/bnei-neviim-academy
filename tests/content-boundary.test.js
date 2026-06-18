const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('server class-session storage requires actual reusable teaching content', () => {
  const server = read('server.js');

  assert.match(server, /function isNonContentClassText\(value\) \{/);
  assert.match(server, /torah progress\|student progress\|progress update\|timer update\|torah timer\|parser fallback\|fallback parse\|review accountability notes/);
  assert.match(server, /const hasStructuredClassContent = Boolean\(fields\.summary[\s\S]*?fields\.highlights\.length\);/);
  assert.match(server, /const titleLooksLikeClass = \/class\|torah\|shiur\|lesson\|newsletter\|mishna\|mishnah\|pasuk\|verse\|source\/i\.test/);
  assert.match(server, /&& !isNonContentClassText\(`\$\{job\.title \|\| ''\} \$\{job\.caption \|\| ''\}`\);/);
  assert.match(server, /if \(!hasStructuredClassContent && !titleLooksLikeClass\) return null;/);
  assert.doesNotMatch(server, /const looksLikeClass = fields\.classNotes\.length/);
});

test('fallback mixed-recording parse does not manufacture Content class notes', () => {
  const server = read('server.js');

  assert.match(server, /function basicMixedRecordingParse\(\{ job, students, error \}\) \{/);
  assert.match(server, /class_notes: \[\],/);
  assert.doesNotMatch(server, /topics: \['Tasks', 'Student accountability', 'Torah progress'\]/);
});

test('Operations content renderer filters non-content progress and parser-review text', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function isNonContentSectionText\(value\) \{/);
  assert.match(operations, /torah progress\|student progress\|progress update\|timer update\|torah timer\|parser fallback\|fallback parse\|review accountability notes/);
  assert.match(operations, /function contentParsedSections\(job, parsed = \{\}\) \{/);
  assert.match(operations, /const topics = uniqueEnglishList\(/);
  assert.match(operations, /const discussions = uniqueEnglishList\(/);
  assert.match(operations, /const highlights = uniqueEnglishList\(/);
});
