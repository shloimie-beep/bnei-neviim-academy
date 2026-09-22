const assert = require('node:assert/strict');
const test = require('node:test');

const {
  SAFE_TRANSCRIPT_STATUSES,
  buildPublicHelperRetrievalContext,
  expandedQueryTerms,
  loadPublicHelperRetrievalCorpus,
} = require('../src/lib/bna/public-helper-retrieval');

test('public helper retrieval loads bounded approved/safe source corpus', () => {
  const corpus = loadPublicHelperRetrievalCorpus();
  assert.ok(corpus.length > 10, 'expected public content, brand kit, and transcript source docs');
  assert.ok(corpus.some((doc) => doc.source_type === 'public_content'));
  assert.ok(corpus.some((doc) => doc.source_type === 'brand_kit'));
  assert.ok(corpus.some((doc) => doc.source_type === 'transcript'));
  assert.ok([...SAFE_TRANSCRIPT_STATUSES].includes('transcribed'));
  assert.equal(corpus.some((doc) => doc.status === 'needs_approval'), false);
  assert.equal(corpus.some((doc) => doc.status === 'archived'), false);
});

test('public helper retrieval scores self-governance against public BNA content', () => {
  const result = buildPublicHelperRetrievalContext({
    query: 'What does self-governance mean at BNA?',
    maxResults: 5,
  });
  assert.ok(result.result_count >= 1);
  assert.match(result.summary_text, /Retrieved helper context: query-scored/);
  assert.match(result.summary_text, /Self-Governance in Jewish Education|Current Learning Model/);
  assert.match(result.summary_text, /responsib|choice|structure|ownership/i);
  assert.doesNotMatch(result.summary_text, /drive_file_id|api[_-]?key|Bearer\s+[A-Za-z0-9]/i);
});

test('public helper retrieval can pull safe transcript snippets without needs-approval dumps', () => {
  const result = buildPublicHelperRetrievalContext({
    query: 'How do boys learn responsibility?',
    maxResults: 10,
  });
  assert.ok(result.results.some((item) => item.source_type === 'transcript'));
  assert.ok(result.results.some((item) => item.source_path.includes('052-youtube-the-importance-of-rules-and-responsibility')));
  assert.equal(result.results.some((item) => item.source_path.includes('008-gaava-focus-and-the-jewish-calendar')), false);
  assert.equal(result.results.some((item) => item.source_path.includes('009-free-choice-and-lashon-hara')), false);
  assert.match(result.summary_text, /bounded retrieval, not exhaustive transcript training/);
});

test('public helper retrieval expands role-specific helper query terms', () => {
  const selfTerms = expandedQueryTerms('self-governance choices');
  const providerTerms = expandedQueryTerms('service provider ecosystem');
  const sodasTerms = expandedQueryTerms('SODAS options and solution');
  assert.ok(selfTerms.includes('responsibility'));
  assert.ok(providerTerms.includes('homeschool'));
  assert.ok(sodasTerms.includes('situation'));
  assert.ok(sodasTerms.includes('consequences'));
});
