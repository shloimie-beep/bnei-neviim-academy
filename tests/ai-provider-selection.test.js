const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const smoke = fs.readFileSync('scripts/smoke-openai-sidekick.mjs', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const agents = fs.readFileSync('AGENTS.md', 'utf8');

test('temporary Kimi-primary hosted AI override is wired across runtime and smoke paths', () => {
  assert.match(envExample, /^BNA_AI_PRIMARY_PROVIDER=openai$/m);
  assert.match(server, /function normalizeAiPrimaryProvider/);
  assert.match(server, /readLocalEnvValue\('BNA_AI_PRIMARY_PROVIDER'\)/);
  assert.match(server, /AI_PRIMARY_PROVIDER === 'kimi' && KIMI_API_KEY/);
  assert.match(bridge, /function normalizeApiPrimaryProvider/);
  assert.match(bridge, /apiPrimaryProvider: normalizeApiPrimaryProvider/);
  assert.match(bridge, /const providers = apiProviderConfigs\(config\)/);
  assert.match(smoke, /function selectAiSmokeProvider/);
  assert.match(smoke, /preferred === 'kimi' && kimiApiKey/);
  assert.match(smoke, /temperature: config\.aiProvider === 'kimi' \? 1 : 0/);
});

test('hosted chat fallbacks do not expose provider failures to chat users', () => {
  assert.match(server, /function hostedAssistantProviderConfigs/);
  assert.match(server, /function hostedAssistantErrorForUser/);
  assert.match(server, /fallback_used/);
  assert.match(bridge, /\{ text: 'Assistant' \}/);
  assert.match(bridge, /Mode set to Assistant chat/);
  assert.match(bridge, /Assistant diagnostics/);
  assert.doesNotMatch(server, /OpenAI was not available for this web reply/);
  assert.doesNotMatch(server, /OpenAI is not configured for this server reply/);
  assert.doesNotMatch(bridge, /By the way, this is Kimi fallback/);
  assert.doesNotMatch(bridge, /OpenAI API was unavailable for this reply/);
  assert.doesNotMatch(bridge, /OpenAI API mode is selected/);
  assert.doesNotMatch(bridge, /text: 'OpenAI API'/);
  assert.doesNotMatch(bridge, /Plain messages use OpenAI API/);
  assert.doesNotMatch(bridge, /Press the bottom buttons to switch between OpenAI API and Codex/);
  assert.doesNotMatch(bridge, /OpenAI default reply failed/);
});

test('docs keep Kimi as provider override, not a Codex replacement', () => {
  assert.match(agents, /Kimi-primary mode/);
  assert.match(agents, /Kimi is never the task owner/);
  assert.match(agents, /Codex remains the development\/task\/deploy owner/);
});
