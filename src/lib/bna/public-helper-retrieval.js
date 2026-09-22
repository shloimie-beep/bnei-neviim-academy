const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PUBLIC_CONTENT_PATH = 'public/js/bna-content.js';
const BRAND_KIT_FILES = [
  'brand-kit/01-core-beliefs.md',
  'brand-kit/02-teaching-voice.md',
  'brand-kit/03-parent-messaging.md',
  'brand-kit/04-student-growth-principles.md',
  'brand-kit/05-phrases-to-use.md',
  'brand-kit/06-phrases-to-avoid.md',
  'brand-kit/08-current-learning-model.md',
];
const TRANSCRIPTS_DIR = 'content-memory/transcripts';
const SAFE_TRANSCRIPT_STATUSES = new Set(['transcribed', 'approved', 'published']);
const BLOCKED_TRANSCRIPT_STATUSES = new Set(['needs_approval', 'archived']);

let corpusCache = null;

function repoRootFrom(startDir = __dirname) {
  return path.resolve(startDir, '..', '..', '..');
}

function redactPublicHelperText(value = '') {
  return String(value || '')
    .replace(/(api[_-]?key|token|secret|password|authorization|database_url)\s*[:=]\s*[^\s`'"]+/gi, '$1=[redacted]')
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, 'sk-[redacted]')
    .replace(/Bearer\s+[A-Za-z0-9._-]{12,}/gi, 'Bearer [redacted]');
}

function cleanPublicHelperText(value = '', maxChars = 1200) {
  return redactPublicHelperText(value)
    .replace(/\r/g, '\n')
    .replace(/\((\d{1,2}:)?\d{2}:\d{2}\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);
}

function tokenize(value = '') {
  return String(value || '').toLowerCase().match(/[a-z0-9]{3,}|[\u0590-\u05ff]{2,}/g) || [];
}

function expandedQueryTerms(query = '') {
  const base = new Set(tokenize(query));
  const lower = String(query || '').toLowerCase();
  const groups = [
    {
      test: /\b(self[-\s]?govern\w*|responsib\w*|autonom\w*|choice|choices|freedom|structure|motivat\w*|ownership)\b/,
      terms: ['self', 'governance', 'responsibility', 'responsible', 'autonomy', 'choice', 'choices', 'freedom', 'structure', 'ownership', 'motivation', 'purpose'],
    },
    {
      test: /\b(sodas|situation|options|disadvantages|advantages|solution|parenting|reflection|feel|angry|frustrated)\b/,
      terms: ['sodas', 'situation', 'options', 'disadvantages', 'advantages', 'solution', 'parenting', 'reflection', 'feel', 'choices', 'consequences'],
    },
    {
      test: /\b(provider|service|directory|chug|evening|program|homeschool|ecosystem)\b/,
      terms: ['provider', 'service', 'directory', 'evening', 'program', 'homeschool', 'family', 'ecosystem', 'support'],
    },
    {
      test: /\b(signup|sign up|enroll|register|child|student|boy|fit)\b/,
      terms: ['signup', 'register', 'child', 'student', 'boy', 'boys', 'fit', 'program', 'parent'],
    },
    {
      test: /\b(torah|limudei|learning|kodesh|rebbe|rabbi|mitzv|hashem)\b/,
      terms: ['torah', 'limudei', 'kodesh', 'learning', 'rebbe', 'rabbi', 'hashem', 'meaning'],
    },
  ];
  for (const group of groups) {
    if (group.test.test(lower)) group.terms.forEach((term) => base.add(term));
  }
  return [...base].filter((term) => term.length >= 3);
}

function parseFrontmatter(text = '') {
  const match = String(text || '').match(/^---\s*\n([\s\S]*?)\n---\s*/);
  const data = {};
  if (!match) return data;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!item) continue;
    data[item[1]] = item[2].replace(/^["']|["']$/g, '').trim();
  }
  return data;
}

function stripFrontmatter(text = '') {
  return String(text || '').replace(/^---\s*\n[\s\S]*?\n---\s*/, '');
}

function addDoc(docs, doc) {
  const text = cleanPublicHelperText(doc.text || '', 12000);
  if (!text || text.length < 80) return;
  docs.push({
    source_path: doc.source_path,
    source_type: doc.source_type,
    title: cleanPublicHelperText(doc.title || doc.source_path, 180),
    text,
    status: doc.status || '',
  });
}

function loadPublicContentDocs(repoRoot, docs) {
  const filePath = path.join(repoRoot, PUBLIC_CONTENT_PATH);
  if (!fs.existsSync(filePath)) return;
  const sandbox = {
    window: {},
    console: { error() {}, log() {}, warn() {} },
    fetch() {
      return Promise.resolve({ ok: false, json: async () => ({ posts: [] }) });
    },
  };
  vm.runInNewContext(fs.readFileSync(filePath, 'utf8'), sandbox, {
    filename: filePath,
    timeout: 1000,
  });
  const content = sandbox.window?.BNAContent;
  if (!content) return;
  const siteText = [
    content.site?.name,
    content.site?.description,
    ...(content.categories?.en || []),
    ...(content.keywords?.en || []),
  ].filter(Boolean).join('. ');
  addDoc(docs, {
    source_path: PUBLIC_CONTENT_PATH,
    source_type: 'public_content',
    title: 'BNA public site metadata and categories',
    status: 'public',
    text: siteText,
  });
  for (const post of content.blogPosts || []) {
    if (post.lang && post.lang !== 'en') continue;
    addDoc(docs, {
      source_path: `${PUBLIC_CONTENT_PATH}#${post.slug || post.title}`,
      source_type: 'public_content',
      title: post.title || post.slug || 'BNA public content',
      status: 'public',
      text: [
        post.category,
        post.title,
        post.excerpt,
        ...(Array.isArray(post.body) ? post.body : []),
        post.cta,
      ].filter(Boolean).join('\n\n'),
    });
  }
  for (const faq of content.faqs?.en || []) {
    addDoc(docs, {
      source_path: `${PUBLIC_CONTENT_PATH}#faq`,
      source_type: 'public_content',
      title: faq.question || 'BNA FAQ',
      status: 'public',
      text: [faq.question, faq.answer].filter(Boolean).join('\n\n'),
    });
  }
}

function loadBrandKitDocs(repoRoot, docs) {
  for (const sourcePath of BRAND_KIT_FILES) {
    const filePath = path.join(repoRoot, sourcePath);
    if (!fs.existsSync(filePath)) continue;
    const text = fs.readFileSync(filePath, 'utf8');
    const title = (text.match(/^#\s+(.+)$/m) || [null, sourcePath])[1];
    addDoc(docs, {
      source_path: sourcePath,
      source_type: 'brand_kit',
      title,
      status: 'curated',
      text,
    });
  }
}

function loadTranscriptDocs(repoRoot, docs) {
  const dirPath = path.join(repoRoot, TRANSCRIPTS_DIR);
  if (!fs.existsSync(dirPath)) return;
  for (const name of fs.readdirSync(dirPath).filter((item) => item.endsWith('.md')).sort()) {
    if (name === 'index.md') continue;
    const sourcePath = `${TRANSCRIPTS_DIR}/${name}`;
    const filePath = path.join(repoRoot, sourcePath);
    const raw = fs.readFileSync(filePath, 'utf8');
    const meta = parseFrontmatter(raw);
    const status = String(meta.status || '').trim().toLowerCase();
    if (BLOCKED_TRANSCRIPT_STATUSES.has(status) || !SAFE_TRANSCRIPT_STATUSES.has(status)) continue;
    const title = meta.title || (raw.match(/^#\s+(.+)$/m) || [null, name])[1];
    const body = stripFrontmatter(raw)
      .replace(/^# .+$/m, '')
      .replace(/^- (Content job|Drive stage|Source file|Outputs):.+$/gm, '')
      .replace(/^## Transcript$/m, '');
    addDoc(docs, {
      source_path: sourcePath,
      source_type: 'transcript',
      title,
      status,
      text: body,
    });
  }
}

function loadPublicHelperRetrievalCorpus(options = {}) {
  const repoRoot = options.repoRoot || repoRootFrom();
  if (corpusCache?.repoRoot === repoRoot) return corpusCache.docs;
  const docs = [];
  try {
    loadPublicContentDocs(repoRoot, docs);
  } catch (error) {}
  try {
    loadBrandKitDocs(repoRoot, docs);
  } catch (error) {}
  try {
    loadTranscriptDocs(repoRoot, docs);
  } catch (error) {}
  corpusCache = { repoRoot, docs };
  return docs;
}

function chunkDocument(doc, maxChars = 900) {
  const paragraphs = doc.text.split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/).map((item) => item.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if ((current + ' ' + paragraph).trim().length > maxChars && current) {
      chunks.push(current);
      current = '';
    }
    if (paragraph.length > maxChars) {
      for (let i = 0; i < paragraph.length; i += maxChars) chunks.push(paragraph.slice(i, i + maxChars));
      continue;
    }
    current = [current, paragraph].filter(Boolean).join(' ');
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 12);
}

function scoreChunk(doc, chunk, queryTerms) {
  if (!queryTerms.length) return 0;
  const haystack = `${doc.title} ${chunk}`.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    if (!haystack.includes(term)) continue;
    score += term.length >= 8 ? 3 : 1;
    if (String(doc.title || '').toLowerCase().includes(term)) score += 2;
  }
  if (doc.source_type === 'public_content') score += 1.2;
  if (doc.source_type === 'brand_kit') score += 1;
  if (doc.source_type === 'transcript') score += 0.4;
  return score;
}

function buildPublicHelperRetrievalContext(options = {}) {
  const repoRoot = options.repoRoot || repoRootFrom();
  const query = options.query || '';
  const maxResults = Math.max(1, Math.min(10, Number(options.maxResults || 6)));
  const queryTerms = expandedQueryTerms(query);
  const docs = loadPublicHelperRetrievalCorpus({ repoRoot });
  const scored = [];
  for (const doc of docs) {
    for (const chunk of chunkDocument(doc)) {
      const score = scoreChunk(doc, chunk, queryTerms);
      if (score <= 0) continue;
      scored.push({
        score,
        source_path: doc.source_path,
        source_type: doc.source_type,
        title: doc.title,
        status: doc.status,
        excerpt: cleanPublicHelperText(chunk, 720),
      });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.source_path.localeCompare(b.source_path));
  const perSource = new Map();
  const results = [];
  for (const item of scored) {
    const count = perSource.get(item.source_path) || 0;
    if (count >= 2) continue;
    perSource.set(item.source_path, count + 1);
    results.push(item);
    if (results.length >= maxResults) break;
  }
  const lines = results.length
    ? [
        'Retrieved helper context: query-scored approved/safe local BNA sources only; this is bounded retrieval, not exhaustive transcript training.',
        ...results.map((item) =>
          `Retrieved public helper source (${item.source_type}, ${item.title}, ${item.source_path}): ${item.excerpt}`
        ),
      ]
    : [];
  return {
    query_terms: queryTerms,
    corpus_count: docs.length,
    result_count: results.length,
    results,
    lines,
    summary_text: lines.join('\n'),
  };
}

module.exports = {
  BRAND_KIT_FILES,
  PUBLIC_CONTENT_PATH,
  SAFE_TRANSCRIPT_STATUSES,
  buildPublicHelperRetrievalContext,
  expandedQueryTerms,
  loadPublicHelperRetrievalCorpus,
};
