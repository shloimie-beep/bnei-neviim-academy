const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  hasParentAccountabilityRoutingIntent,
} = require('../src/lib/bna/telegram-accountability-parser');

function loadMediaRouting() {
  const bridgePath = path.join(__dirname, '..', 'scripts', 'telegram-kimi-bridge.mjs');
  const bridge = fs.readFileSync(bridgePath, 'utf8');
  const start = bridge.indexOf('function shouldGenerateWhatsAppDraft');
  const end = bridge.indexOf('function buildGeneratedContentOutputs', start);
  assert.ok(start > 0 && end > start, 'media-routing functions should be found');
  const sandbox = { hasParentAccountabilityRoutingIntent };
  vm.runInNewContext(`${bridge.slice(start, end)}
result = { buildRecordingIntakeTranscript, classifyMediaRouting, shouldAutoSendGeneratedWhatsAppDraftPreview, shouldGenerateWhatsAppDraft, shouldUseRecordingIntake };`, sandbox);
  return sandbox.result;
}

test('task and student recordings with incidental WhatsApp wording are parser-only', () => {
  const { classifyMediaRouting } = loadMediaRouting();
  const transcript = [
    'Parent meeting recordings should upload, get parsed with AI, and update accountability.',
    'The student login and parent portal need a WhatsApp button for contacting parents.',
    'This is system work, not a parent update draft.',
  ].join(' ');

  const routing = classifyMediaRouting('', transcript);

  assert.equal(routing.parserIntent, true);
  assert.equal(routing.transcriptMarketingIntent, true);
  assert.equal(routing.marketingIntent, false);
  assert.equal(routing.parserOnly, true);
  assert.equal(routing.contentLane, false);
  assert.equal(routing.shouldParse, true);
});

test('parser-only recordings use recording intake instead of Content jobs', () => {
  const { buildRecordingIntakeTranscript, classifyMediaRouting, shouldUseRecordingIntake } = loadMediaRouting();
  const caption = 'Parent meeting recording from Ahuva: parse bedtime chores and update accountability.';
  const transcript = 'Menachem agreed to clean the floor and be in bed by 10 PM. This is not a WhatsApp update draft.';
  const routing = classifyMediaRouting(caption, transcript);

  assert.equal(shouldUseRecordingIntake(routing, caption, transcript), true);
  assert.match(buildRecordingIntakeTranscript(caption, transcript), /Caption\/context:/);

  const bridge = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'telegram-kimi-bridge.mjs'), 'utf8');
  assert.match(bridge, /\/api\/bna\/recording-intake\/parse-mixed-recording/);
  assert.match(bridge, /no Content job was created/);
});

test('explicit WhatsApp content captions still route to Content', () => {
  const { classifyMediaRouting, shouldGenerateWhatsAppDraft, shouldUseRecordingIntake } = loadMediaRouting();
  const caption = 'WhatsApp parent update: make this into short bullets for parents.';
  const transcript = 'Today the class discussed humility and the students asked questions about Torah sources.';

  assert.equal(shouldGenerateWhatsAppDraft(caption), true);

  const routing = classifyMediaRouting(caption, transcript, { generatedContent: true });
  assert.equal(routing.marketingIntent, true);
  assert.equal(routing.contentLane, true);
  assert.equal(routing.parserOnly, false);
  assert.equal(shouldUseRecordingIntake(routing, caption, transcript), false);
});

test('parent accountability captions do not create WhatsApp drafts from parents alone', () => {
  const { shouldGenerateWhatsAppDraft } = loadMediaRouting();

  assert.equal(
    shouldGenerateWhatsAppDraft('Parent meeting recording: parse accountability and update parent portal records.'),
    false
  );
});

test('parent accountability recordings with incidental WhatsApp wording stay parser-only', () => {
  const { classifyMediaRouting, shouldGenerateWhatsAppDraft } = loadMediaRouting();
  const caption = 'Parent meeting recording from Ahuva: parse bedtime chores, consequence, incentive target, and WhatsApp button note.';

  assert.equal(shouldGenerateWhatsAppDraft(caption), false);

  const routing = classifyMediaRouting(caption, '');
  assert.equal(routing.parserIntent, true);
  assert.equal(routing.parserOnly, true);
  assert.equal(routing.contentLane, false);
  assert.equal(routing.shouldParse, true);
});

test('saved generated WhatsApp drafts are not auto-previewed in Telegram', () => {
  const { shouldAutoSendGeneratedWhatsAppDraftPreview } = loadMediaRouting();

  assert.equal(shouldAutoSendGeneratedWhatsAppDraftPreview({ outputId: 123, contentJobId: 456 }), false);
  assert.equal(shouldAutoSendGeneratedWhatsAppDraftPreview({ outputId: '', contentJobId: 456 }), true);
});

test('default WhatsApp prompt excludes backend and task chatter from parent copy', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  assert.match(server, /Ignore operator backend notes, parser\/debug comments, task instructions, Codex\/system work/);
});

test('server has non-Content recording intake parser endpoint', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  assert.match(server, /app\.post\('\/api\/bna\/recording-intake\/parse-mixed-recording'/);
  assert.match(server, /contentBacked: false/);
  assert.match(server, /recordingSourceContext\(job\)/);
});

test('mixed recording parser preserves absent Torah scores as zero percent daily rows', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  assert.match(server, /synthesizeAbsentDailyTorahUpdates/);
  assert.match(server, /daily_completion_percentage: 0/);
  assert.match(server, /daily_completed_boolean: false/);
  assert.match(server, /do not create a group_goal_entries row for an absence/);
});
