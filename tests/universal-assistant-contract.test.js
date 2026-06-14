const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const signup = fs.readFileSync('public/signup.html', 'utf8');
const signupHe = fs.readFileSync('public/signup-he.html', 'utf8');
const serviceProviders = fs.readFileSync('public/service-providers.html', 'utf8');
const providersJoin = fs.readFileSync('public/providers-join.html', 'utf8');
const providerProfile = fs.readFileSync('public/provider-profile.html', 'utf8');
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
  assert.match(server, /assistantAdaptiveIntent/);
  assert.match(server, /assistantRunActionTool/);
  assert.match(server, /assistantProviderGoogleBusinessLinkRequest/);
  assert.match(server, /capture_provider_google_business_link/);
  assert.match(server, /visibleActionsForActor\(listActions\(\), actionActor\)/);
  assert.match(server, /Web assistant users cannot invoke Codex or CLI directly/);
  assert.match(server, /source IN \('dashboard', 'telegram', 'api', 'system', 'web_assistant'\)/);
});

test('assistant widget is one chat UI with input, spinner, and server-side calls', () => {
  assert.match(widget, /data-thread/);
  assert.match(widget, /data-chat-form/);
  assert.match(widget, /bna-bot-typing/);
  assert.match(widget, /Thinking\.\.\./);
  assert.match(widget, /event\.key === 'Enter'/);
  assert.match(widget, /api\/bna\/assistant\/chat/);
  assert.match(widget, /api\/bna\/assistant\/threads/);
  assert.match(widget, /bna-universal-assistant-active/);
  assert.match(widget, /mode: 'safe'/);
  assert.match(widget, /const studentAccessCode = \(\) => isStudent \? \(new URLSearchParams\(window\.location\.search\)\.get\('code'\) \|\| ''\) : ''/);
  assert.match(widget, /if \(!isStudent\) localStorage\.removeItem\('bnaStudentAccessCode'\)/);
  assert.doesNotMatch(widget, /localStorage\.getItem\('bnaStudentAccessCode'\)/);
  assert.match(widget, /data-history-toggle/);
  assert.match(widget, /bna-bot-history-toggle/);
  assert.match(widget, /bna-bot-history-list/);
  assert.match(widget, /Continue chat/);
  assert.match(widget, /M3 12a9 9 0 1 0 3-6\.7/);
  assert.doesNotMatch(widget, /data-agent-box/);
  assert.doesNotMatch(widget, /data-agent-prompt/);
  assert.doesNotMatch(widget, /data-mode=/);
  assert.doesNotMatch(widget, /chat\/completions|responses\.create|OPENAI_API_KEY/i);
  assert.doesNotMatch(widget, /openai/i);
  assert.doesNotMatch(widget, /Super Agent Box/);
});

test('public provider pages clear stale student access codes', () => {
  for (const html of [serviceProviders, providersJoin, providerProfile]) {
    assert.match(html, /localStorage\.removeItem\('bnaStudentAccessCode'\)/);
  }
});

test('assistant hosted AI fallback is provider-neutral for users', () => {
  assert.match(server, /function hostedAssistantProviderConfigs/);
  assert.match(server, /async function maybeHostedAssistantReply/);
  assert.match(server, /AI_PRIMARY_PROVIDER/);
  assert.match(server, /fallback_used/);
  assert.match(server, /toolCatalog/);
  assert.match(server, /webSearchUnavailable/);
  assert.match(server, /Hosted AI provider failed; trying fallback/);
  assert.match(server, /provider: hostedReply\.provider/);
  assert.match(server, /hostedAssistantErrorForUser/);
  assert.match(server, /Do not mention OpenAI, Kimi, Moonshot, fallback providers/);
  assert.match(server, /safe_hosted_ai_query/);
  assert.doesNotMatch(server, /OpenAI was not available for this web reply/);
  assert.doesNotMatch(server, /OpenAI is not configured for this server reply/);
  assert.doesNotMatch(server, /OpenAI responses/);
});

test('assistant backend supports adaptive tools and live web-search fallback', () => {
  assert.match(server, /function assistantShouldUseWebSearch/);
  assert.match(server, /async function fetchOpenAiAssistantWebSearch/);
  assert.match(server, /OPENAI_RESEARCH_MODEL/);
  assert.match(server, /\/responses/);
  assert.match(server, /tools: \[\{ type: 'web_search' \}\]/);
  assert.match(server, /Live web search was requested but is not available/);
  assert.match(server, /toolName: 'web_search'/);
  assert.match(server, /status: 'failed'/);
  assert.match(server, /kind: 'codex_task'/);
  assert.match(server, /kind: 'action', action_id: 'create_ticket'/);
  assert.match(server, /kind: 'action', action_id: 'create_task'/);
  assert.match(server, /kind: 'action', action_id: 'create_decision'/);
});

test('public assistant is proactive, bilingual, knowledge-scoped, and lead aware', () => {
  assert.match(widget, /PUBLIC_ASSISTANT_AUTOPROMPT_DELAY_MS/);
  assert.match(widget, /PUBLIC_ASSISTANT_FOLLOWUP_DELAY_MS/);
  assert.match(widget, /publicFollowupCopy/);
  assert.match(widget, /setOpen\(true, \{ autoPrompt: true, focus: false \}\)/);
  assert.match(widget, /Hi, I am here to help/);
  assert.match(widget, /אני כאן כדי לעזור/);
  assert.match(widget, /self-governance/);
  assert.match(widget, /publicPromptDismissed/);
  assert.match(server, /function buildPublicAssistantKnowledgeBase/);
  assert.match(server, /Core public model: Mesorah, Torah learning, relationship, intrinsic motivation, self-governance/);
  assert.match(server, /bna_content_outputs/);
  assert.match(server, /sanitizePublicLearningText/);
  assert.match(server, /Do not use internal tasks, private student records/);
  assert.match(server, /function createAssistantLeadReminder/);
  assert.match(server, /create_public_lead_reminder/);
  assert.match(server, /bna_contact_communications/);
});

test('public assistant feedback becomes tickets, Codex review, or Shloimie decisions without public admin power', () => {
  assert.match(server, /function publicAssistantFeedbackKind/);
  assert.match(server, /kind: 'public_feedback'/);
  assert.match(server, /function createAssistantPublicFeedback/);
  assert.match(server, /queue_public_codex_review/);
  assert.match(server, /create_public_decision/);
  assert.match(server, /public users do not receive admin, CLI, deploy, or data access/);
  assert.match(server, /public_user_has_admin_power: false/);
  assert.match(server, /related_task_id = \$2/);
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
