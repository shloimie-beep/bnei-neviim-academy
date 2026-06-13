const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const signup = fs.readFileSync('public/signup.html', 'utf8');
const signupHe = fs.readFileSync('public/signup-he.html', 'utf8');
const aiContext = fs.readFileSync('src/lib/bna/ai-context.js', 'utf8');
const openaiSmoke = fs.readFileSync('scripts/smoke-openai-sidekick.mjs', 'utf8');

test('assistant backend stores threads/messages and protects Codex routing by role', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_threads/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_messages/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_tool_calls/);
  assert.match(server, /async function resolveAssistantActor/);
  assert.match(server, /canUseCodex: true/);
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/chat'/);
  assert.match(server, /createAssistantCodexTask/);
  assert.match(server, /createAssistantSupportTicket/);
  assert.match(server, /Web assistant users cannot invoke Codex or CLI directly/);
  assert.match(server, /source IN \('dashboard', 'telegram', 'api', 'system', 'web_assistant'\)/);
});

test('assistant widget is a chat UI with history, input, spinner, and server-side calls', () => {
  assert.match(widget, /data-thread/);
  assert.match(widget, /data-chat-form/);
  assert.match(widget, /bna-bot-typing/);
  assert.match(widget, /Thinking\.\.\./);
  assert.match(widget, /event\.key === 'Enter'/);
  assert.match(widget, /api\/bna\/assistant\/chat/);
  assert.match(widget, /api\/bna\/assistant\/threads/);
  assert.match(widget, /bna-universal-assistant-active/);
  assert.match(widget, /data-mode="\$\{hostedAiMode\}"/);
  assert.match(widget, /data-mode="codex"/);
  assert.doesNotMatch(widget, /chat\/completions|responses\.create|OPENAI_API_KEY/i);
  assert.doesNotMatch(widget, /openai/i);
});

test('assistant mounts on admin and signup surfaces as well as portal/public pages', () => {
  assert.match(operations, /\/js\/bna-bot-widget\.js/);
  assert.match(signup, /\/js\/bna-bot-widget\.js/);
  assert.match(signupHe, /\/js\/bna-bot-widget\.js/);
});

test('AI context builder and smoke include BNA brand-kit context', () => {
  assert.match(aiContext, /brand-kit\/01-core-beliefs\.md/);
  assert.match(aiContext, /brand-kit\/06-phrases-to-avoid\.md/);
  assert.match(aiContext, /buildBnaAiContextSummary/);
  assert.match(aiContext, /Do not reveal secrets/);
  assert.match(openaiSmoke, /brand_kit_file_count/);
  assert.match(openaiSmoke, /brand kit context readable/);
});
