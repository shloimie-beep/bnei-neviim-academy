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

function loadSpreadsheetUploadHelpers() {
  const bridgePath = path.join(__dirname, '..', 'scripts', 'telegram-kimi-bridge.mjs');
  const bridge = fs.readFileSync(bridgePath, 'utf8');
  const start = bridge.indexOf('function isSpreadsheetMime');
  const end = bridge.indexOf('function runProcess', start);
  assert.ok(start > 0 && end > start, 'spreadsheet upload helpers should be found');
  const sandbox = { path };
  vm.runInNewContext(`${bridge.slice(start, end)}
result = { isSpreadsheetDocument, safeTelegramErrorMessage };`, sandbox);
  return sandbox.result;
}

test('Telegram spreadsheet documents bypass transcription and Content routing', () => {
  const { isSpreadsheetDocument, safeTelegramErrorMessage } = loadSpreadsheetUploadHelpers();
  const bridge = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'telegram-kimi-bridge.mjs'), 'utf8');

  assert.equal(isSpreadsheetDocument({ filename: 'contacts-3.xlsx', mimeType: '' }), true);
  assert.equal(isSpreadsheetDocument({ filename: 'contacts.csv', mimeType: 'text/plain' }), true);
  assert.equal(
    isSpreadsheetDocument({
      filename: 'contacts-upload',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    true
  );
  assert.equal(isSpreadsheetDocument({ filename: 'source.pdf', mimeType: 'application/pdf' }), false);

  const branchIndex = bridge.indexOf("kind: 'spreadsheet-document'");
  const publishIntentIndex = bridge.indexOf('const publishIntent = parsePublishIntent(caption);');
  assert.ok(branchIndex > 0, 'spreadsheet branch should build spreadsheet jobs');
  assert.ok(publishIntentIndex > branchIndex, 'spreadsheet branch should run before publish/content routing');
  assert.match(bridge, /descriptor\.kind === 'document' && isSpreadsheetDocument\(descriptor\)/);
  assert.match(bridge, /I did not run transcription, create a Content job, or queue Buffer\/social drafting/);

  const sanitized = safeTelegramErrorMessage(
    new Error(
      'OpenAI transcription 401: {"error":{"message":"Incorrect API key provided: '
        + 'sk-' + 'testsecret1234567890'
        + '"}}'
    )
  );
  assert.equal(
    sanitized,
    'AI provider configuration error. The file was saved, but transcription cannot run until the provider key is fixed.'
  );
  assert.doesNotMatch(sanitized, /sk-/);
  assert.doesNotMatch(sanitized, /\{/);
  assert.equal((bridge.match(/safeTelegramErrorMessage\(error, 'Transcription could not be completed\.'\)/g) || []).length, 3);
});

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

test('Drive-backed mixed recordings normalize raw-intake source channel to drive', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  assert.match(server, /function normalizeRawIntakeSourceChannel/);
  assert.match(server, /normalizeRawIntakeSourceChannel\(source_channel \|\| source_type \|\| 'manual'\)/);
  assert.match(server, /source_channel: job\.source_type \|\| sourceType/);
  assert.match(server, /channel === 'class_recording' && \/drive\|google\/i\.test\(rawValue\)\) return 'drive'/);
});

test('content recording filing does not trust AI-only agent job labels', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const guard = server.slice(
    server.indexOf('function contentRecordingTaskIsExplicitSystemWork'),
    server.indexOf('async function fileTaskIntakeItem')
  );

  assert.match(guard, /CONTENT_RECORDING_SYSTEM_WORK_PATTERN\.test\(text\)/);
  assert.match(guard, /CONTENT_RECORDING_ACTION_PATTERN\.test\(text\) \|\| CONTENT_RECORDING_BUILD_INTENT_PATTERN\.test\(text\)/);
  assert.doesNotMatch(guard, /payload\.next_action/);
  assert.doesNotMatch(guard, /payload\.agent_executable === true/);
  assert.doesNotMatch(guard, /payload\.task_kind/);
  assert.match(server, /const suppressAgentInference = input\.agent_executable === false/);
  assert.match(server, /suppressAgentInference && isAgentAssignee\(assignedTo\)/);
  assert.match(server, /explicitTaskKind: suppressAgentInference \? null/);
  assert.match(server, /suppress_agent_inference: recordingReviewTask/);
  assert.match(server, /!assignedTo && !waitingOn && explicitItemType !== 'decision' && !suppressAgentInference/);
  assert.match(server, /All those together does not equal AI|CONTENT_RECORDING_BUILD_INTENT_PATTERN/);
});

test('mixed recording parser preserves absent Torah scores as zero percent daily rows', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  assert.match(server, /synthesizeAbsentDailyTorahUpdates/);
  assert.match(server, /daily_completion_percentage: 0/);
  assert.match(server, /daily_completed_boolean: false/);
  assert.match(server, /do not create a group_goal_entries row for an absence/);
});

test('content recording parse persists Torah progress rows alongside canonical intake', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const route = server.slice(
    server.indexOf('async function parseMixedRecordingSource'),
    server.indexOf("app.post('/api/bna/intake/parse'")
  );

  assert.match(route, /generateMixedRecordingProgressParse/);
  assert.match(route, /progressOnlyMixedRecordingParse/);
  assert.match(route, /persistMixedRecordingParse/);
  assert.match(route, /mergeMixedRecordingCounts/);
});
