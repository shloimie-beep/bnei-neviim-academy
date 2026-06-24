const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const homepage = fs.readFileSync('public/index.html', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const helperKnowledge = fs.readFileSync('public/js/bna-helper-knowledge.js', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const helperRetrieval = fs.readFileSync('src/lib/bna/public-helper-retrieval.js', 'utf8');

test('public helper bot renders deterministic paths with calm nudge timing', () => {
  assert.match(homepage, /\/js\/bna-helper-knowledge\.js/);
  assert.match(homepage, /\/js\/bna-bot-widget\.js/);
  assert.match(widget, /const HELPER_FIRST_NUDGE_DELAY_MS = 12000/);
  assert.match(widget, /const HELPER_SECOND_NUDGE_DELAY_MS = 45000/);
  assert.match(widget, /const HELPER_DISMISS_SUPPRESS_HOURS = 24/);
  assert.match(widget, /showPublicNudge\('first'\)/);
  assert.match(widget, /showPublicNudge\('second'\)/);
  assert.match(widget, /localStorage\.setItem\(publicNudgeSuppressUntilKey\(\)/);
  assert.doesNotMatch(widget, /setOpen\(true, \{ autoPrompt: true, focus: false \}\)/);
  assert.match(helperKnowledge, /Need help finding the right path/);
  assert.match(helperKnowledge, /I can help with signup, the school model, self-governance, or becoming a service provider/);
});

test('public helper bot offers parent, student, provider, self-governance, SODAS, and question choices in both languages', () => {
  assert.match(helperKnowledge, /Sign up a child/);
  assert.match(helperKnowledge, /Learn about BNA/);
  assert.match(helperKnowledge, /I'm a student/);
  assert.match(helperKnowledge, /Become a service provider/);
  assert.match(helperKnowledge, /Ask about self-governance/);
  assert.match(helperKnowledge, /Parenting \/ SODAS help/);
  assert.match(helperKnowledge, /Ask a question/);
  assert.match(helperKnowledge, /\\u05dc\\u05e8\\u05e9\\u05d5\\u05dd \\u05d9\\u05dc\\u05d3/);
  assert.match(helperKnowledge, /\\u05d0\\u05e0\\u05d9 \\u05ea\\u05dc\\u05de\\u05d9\\u05d3/);
  assert.match(helperKnowledge, /\\u05e2\\u05d6\\u05e8\\u05d4 \\u05dc\\u05d4\\u05d5\\u05e8\\u05d9\\u05dd/);
});

test('self-governance and SODAS knowledge stay grounded and action-oriented', () => {
  assert.match(helperKnowledge, /Self-governance means helping a child (?:learn to )?notice/);
  assert.match(helperKnowledge, /not "do whatever you want/);
  assert.match(helperKnowledge, /freedom with structure/);
  assert.match(helperKnowledge, /responsibility/);
  assert.match(helperKnowledge, /choices/);
  assert.match(helperKnowledge, /Situation, Options, Disadvantages, Advantages, Solution/);
  assert.match(helperKnowledge, /What was the situation - what happened, and how did it make him feel\?/);
  assert.match(helperKnowledge, /What choices were available in that moment\?/);
  assert.match(widget, /trusted adult right now/);
  assert.match(widget, /looksLikeSafetyIssue/);
});

test('learning ecosystem landing section includes audience model, real images, and CTAs', () => {
  assert.match(homepage, /id="learning-ecosystem"/);
  assert.match(homepage, /A Learning Ecosystem, Not Just a Morning Program/);
  assert.match(homepage, /Schools \/ AI Microschool/);
  assert.match(homepage, /one-man Jewish AI microschool/);
  assert.match(homepage, /Families \/ Parent App/);
  assert.match(homepage, /Less Overhead, Better Teaching/);
  assert.match(homepage, /Service Provider Network/);
  assert.match(homepage, /class="ecosystem-media"[\s\S]*?forest-learning-01-web\.jpg/);
  assert.match(homepage, /href="\/providers\/join\?onboard=provider"/);
  assert.match(homepage, /data-helper-open/);
  assert.match(homepage, /ecosystemProviderCtaTwo/);
  assert.match(homepage, /ecosystemHelperCta/);
});

test('helper layout keeps mobile and safe-area constraints explicit', () => {
  assert.match(widget, /--app-vh: 100dvh/);
  assert.match(widget, /env\(safe-area-inset-bottom\)/);
  assert.match(widget, /calc\(100vw - 24px\)/);
  assert.match(widget, /window\.visualViewport/);
  assert.match(widget, /aria-expanded/);
  assert.match(widget, /aria-label/);
});

test('public helper lead and provider capture use existing visible routes', () => {
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/chat'/);
  assert.match(server, /app\.get\('\/providers\/join', sendProviderJoinPage\)/);
  assert.match(server, /app\.get\('\/become-service-provider', sendProviderJoinPage\)/);
  assert.match(server, /bna_provider_leads/);
  assert.match(server, /bna_contact_communications/);
});

test('public assistant backend reuses curated helper knowledge without fake RAG claims', () => {
  assert.match(server, /PUBLIC_HELPER_KNOWLEDGE_PATH/);
  assert.match(server, /function readPublicHelperKnowledgeBundle/);
  assert.match(server, /Public helper knowledge module/);
  assert.match(server, /Service-provider ecosystem path/);
  assert.match(server, /Self-governance path/);
  assert.match(server, /SODAS parenting reflection path/);
  assert.match(server, /not transcript RAG/);
  assert.match(server, /buildPublicHelperRetrievalContext/);
  assert.match(server, /retrievedKnowledge\.slice\(0, 7\)/);
  assert.match(helperRetrieval, /query-scored approved\/safe local BNA sources/);
  assert.match(helperRetrieval, /BLOCKED_TRANSCRIPT_STATUSES/);
  assert.match(server, /helperKnowledge\.slice\(0, 12\)/);
});
