const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const helperKnowledge = fs.readFileSync('public/js/bna-helper-knowledge.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const signup = fs.readFileSync('public/signup.html', 'utf8');
const signupHe = fs.readFileSync('public/signup-he.html', 'utf8');
const signupThankYou = fs.readFileSync('public/signup-thank-you.html', 'utf8');
const registrationDocument = fs.readFileSync('public/documents/registration-document.html', 'utf8');
const serviceProviders = fs.readFileSync('public/service-providers.html', 'utf8');
const providersJoin = fs.readFileSync('public/providers-join.html', 'utf8');
const providerProfile = fs.readFileSync('public/provider-profile.html', 'utf8');
const oneTimePreview = fs.readFileSync('public/one-time-preview.html', 'utf8');
const blog = fs.readFileSync('public/blog.html', 'utf8');
const faq = fs.readFileSync('public/faq.html', 'utf8');
const blogPost = fs.readFileSync('public/blog-post.html', 'utf8');
const aiContext = fs.readFileSync('src/lib/bna/ai-context.js', 'utf8');
const publicHelperRetrieval = fs.readFileSync('src/lib/bna/public-helper-retrieval.js', 'utf8');
const openaiSmoke = fs.readFileSync('scripts/smoke-openai-sidekick.mjs', 'utf8');

test('assistant backend stores threads/messages and protects Codex routing by role', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_threads/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_messages/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_tool_calls/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_onboarding_intakes/);
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
  assert.match(widget, /function isMobileKeyboardSurface\(\)/);
  assert.match(widget, /function focusAssistantInput\(options = \{\}\)/);
  assert.match(widget, /input\.focus\(\{ preventScroll: true \}\)/);
  assert.match(widget, /--assistant-mobile-panel-height: clamp\(280px, calc\(var\(--app-vh\) \* 0\.72\), calc\(var\(--app-vh\) - 24px\)\)/);
  assert.match(widget, /bottom: calc\(max\(8px, env\(safe-area-inset-bottom\)\) \+ var\(--keyboard-offset\)\)/);
  assert.match(widget, /keepAssistantComposerReachable/);
  assert.match(widget, /transform: translateY\(110%\)/);
  assert.match(widget, /bna-bot-launcher\.is-panel-open/);
  assert.match(widget, /launcher\.classList\.toggle\('is-panel-open', open\)/);
  assert.match(widget, /M3 12a9 9 0 1 0 3-6\.7/);
  assert.doesNotMatch(widget, /data-agent-box/);
  assert.doesNotMatch(widget, /data-agent-prompt/);
  assert.doesNotMatch(widget, /data-mode=/);
  assert.doesNotMatch(widget, /chat\/completions|responses\.create|OPENAI_API_KEY/i);
  assert.doesNotMatch(widget, /openai/i);
  assert.doesNotMatch(widget, /Super Agent Box/);
});

test('public non-student pages clear stale student access codes', () => {
  for (const html of [serviceProviders, providersJoin, providerProfile, registrationDocument]) {
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

test('assistant answers role-specific onboarding before creating generic portal tickets', () => {
  assert.match(server, /function assistantOnboardingIntent/);
  assert.match(server, /function assistantOnboardingCaptureIntent/);
  assert.match(server, /function createAssistantOnboardingIntake/);
  assert.match(server, /function assistantOnboardingCaptureReply/);
  assert.match(server, /function assistantOnboardingTopic/);
  assert.match(server, /function assistantRoleOnboardingReply/);
  assert.match(server, /kind: 'onboarding_coach'/);
  assert.match(server, /kind: 'onboarding_intake_capture'/);
  assert.match(server, /intent: 'role_onboarding_coach'/);
  assert.match(server, /intent: 'role_onboarding_intake_capture'/);
  assert.match(server, /toolName: 'assistant_onboarding_coach'/);
  assert.match(server, /toolName: 'assistant_onboarding_intake_capture'/);
  assert.match(server, /support_ticket_created: false/);
  assert.match(server, /durable_profile_write_performed: false/);
  assert.match(server, /child_visible_write_performed: false/);
  assert.match(server, /provider_public_write_performed: false/);
  assert.match(server, /external_write_performed: false/);
  assert.match(server, /no_send: true/);
  assert.match(server, /student_daily_checkin/);
  assert.match(server, /student_question_message/);
  assert.match(server, /parent_recording_upload/);
  assert.match(server, /provider_profile_setup/);
  assert.match(server, /bna_assistant_onboarding_intakes \(/);
  assert.match(server, /open_questions JSONB DEFAULT '\[\]'/);
  assert.match(server, /review_status TEXT NOT NULL DEFAULT 'needs_review'/);
  assert.match(server, /next_record_change_requires: 'staff review or explicit approved portal action'/);
  assert.match(server, /The self-governance model here is honesty, responsibility, repair, and one next step/);
  assert.match(server, /review before anything becomes child-visible/);
  assert.match(server, /Google Business status/);

  const captureIndex = server.indexOf("return { kind: 'onboarding_intake_capture'");
  const publicLeadIndex = server.indexOf("role === 'anonymous' && publicAssistantLeadIntent(text)");
  const onboardingIntentIndex = server.indexOf("return { kind: 'onboarding_coach'");
  const genericTicketIndex = server.indexOf("if (assistantShouldCreateTicket(actor, text))");
  assert.ok(captureIndex > -1, 'onboarding capture intent should be present');
  assert.ok(publicLeadIndex > -1, 'public lead intent should stay anonymous-scoped');
  assert.ok(onboardingIntentIndex > -1, 'onboarding intent should be present');
  assert.ok(genericTicketIndex > -1, 'generic ticket fallback should be present');
  assert.ok(captureIndex < publicLeadIndex, 'explicit onboarding capture should route before public lead reminders');
  assert.ok(captureIndex < onboardingIntentIndex, 'explicit onboarding capture should route before generic coaching');
  assert.ok(onboardingIntentIndex < genericTicketIndex, 'onboarding coaching should be routed before generic portal tickets');

  assert.match(widget, /walk you through Today, goals, daily checkoff, questions, reflection/);
});

test('public assistant is proactive, bilingual, knowledge-scoped, and lead aware', () => {
  assert.match(widget, /HELPER_FIRST_NUDGE_DELAY_MS = 12000/);
  assert.match(widget, /HELPER_SECOND_NUDGE_DELAY_MS = 45000/);
  assert.match(widget, /HELPER_DISMISS_SUPPRESS_HOURS = 24/);
  assert.match(widget, /showPublicNudge/);
  assert.match(widget, /schedulePublicFollowup/);
  assert.match(widget, /helperNudgeSuppressUntil/);
  assert.match(widget, /publicHelperData/);
  assert.match(widget, /renderHelperPath/);
  assert.match(widget, /looksLikeSafetyIssue/);
  assert.doesNotMatch(widget, /setOpen\(true, \{ autoPrompt: true, focus: false \}\)/);
  assert.match(helperKnowledge, /Sign up a child/);
  assert.match(helperKnowledge, /Become a service provider/);
  assert.match(helperKnowledge, /Ask about self-governance/);
  assert.match(helperKnowledge, /Parenting \/ SODAS help/);
  assert.match(helperKnowledge, /Need help finding the right path/);
  assert.match(helperKnowledge, /Self-governance means helping a child/);
  assert.match(helperKnowledge, /freedom with structure/);
  assert.match(helperKnowledge, /Situation, Options, Disadvantages, Advantages, Solution/);
  assert.doesNotMatch(widget, /I'm still here/);
  assert.doesNotMatch(widget, /אני עדיין כאן/);
  assert.match(widget, /אני כאן כדי לעזור/);
  assert.match(widget, /self-governance/);
  assert.match(widget, /publicPromptDismissed/);
  assert.match(server, /function buildPublicAssistantKnowledgeBase/);
  assert.match(server, /PUBLIC_HELPER_KNOWLEDGE_PATH/);
  assert.match(server, /function readPublicHelperKnowledgeBundle/);
  assert.match(server, /buildPublicHelperRetrievalContext/);
  assert.match(server, /buildPublicAssistantKnowledgeBase\(\{ db, message \}\)/);
  assert.match(server, /retrievedKnowledge\.slice\(0, 7\)/);
  assert.match(server, /Public helper knowledge module/);
  assert.match(server, /not transcript RAG/);
  assert.match(server, /SODAS parenting reflection path/);
  assert.match(server, /helperKnowledge\.slice\(0, 12\)/);
  assert.match(server, /Current public reality: BNA is currently centered on the 10-1 program/);
  assert.match(server, /Verified source boundary/);
  assert.match(server, /Unknown policy rule/);
  assert.match(server, /function publicAssistantUnknownPolicyQuestion/);
  assert.match(server, /allerg/);
  assert.match(server, /public_policy_boundary/);
  assert.match(server, /I do not have a verified BNA policy for that in the current public content/);
  assert.match(server, /Source boundary: use only the supplied BNA public content/);
  assert.match(server, /Do not fill gaps from generic school-policy knowledge/);
  assert.match(server, /Core public model: Mesorah, Torah learning, relationship, intrinsic motivation, self-governance/);
  assert.match(server, /bna_content_outputs/);
  assert.match(server, /sanitizePublicLearningText/);
  assert.match(server, /Do not use internal tasks, private student records/);
  assert.match(server, /function createAssistantLeadReminder/);
  assert.match(server, /create_public_lead_reminder/);
  assert.match(server, /bna_contact_communications/);
  assert.match(publicHelperRetrieval, /SAFE_TRANSCRIPT_STATUSES/);
  assert.match(publicHelperRetrieval, /BLOCKED_TRANSCRIPT_STATUSES/);
  assert.match(publicHelperRetrieval, /public\/js\/bna-content\.js/);
  assert.match(publicHelperRetrieval, /content-memory\/transcripts/);
  assert.match(publicHelperRetrieval, /bounded retrieval, not exhaustive transcript training/);
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

test('assistant mounts on Operations and signup surfaces without mixing admin and public widgets', () => {
  assert.match(operations, /data-bna-helper-open="true"/);
  assert.match(operations, /sendHelperMessage/);
  assert.doesNotMatch(operations, /\/js\/bna-bot-widget\.js/);
  assert.match(signup, /\/js\/bna-bot-widget\.js/);
  assert.match(signupHe, /\/js\/bna-bot-widget\.js/);
});

test('public assistant mounts with the public knowledge bundle across website, registration, and provider surfaces', () => {
  for (const html of [
    signup,
    signupHe,
    signupThankYou,
    registrationDocument,
    serviceProviders,
    providersJoin,
    providerProfile,
    oneTimePreview,
    blog,
    faq,
    blogPost,
  ]) {
    assert.match(html, /\/js\/bna-helper-knowledge\.js/);
    assert.match(html, /\/js\/bna-bot-widget\.js/);
  }

  for (const html of [serviceProviders, providersJoin, providerProfile]) {
    assert.match(html, /\/css\/bna-site-nav\.css/);
    assert.match(html, /data-bna-site-nav/);
    assert.match(html, /\/js\/bna-site-nav\.js/);
  }

  assert.ok(widget.includes('const isProvider = ['));
  assert.ok(widget.includes("'/provider-dashboard'"));
  assert.doesNotMatch(widget, /const isProvider = \/\^\\\/provider/);
});

test('AI context builder and smoke include BNA brand-kit context', () => {
  assert.match(aiContext, /brand-kit\/01-core-beliefs\.md/);
  assert.match(aiContext, /brand-kit\/06-phrases-to-avoid\.md/);
  assert.match(aiContext, /buildBnaAiContextSummary/);
  assert.match(aiContext, /Do not reveal secrets/);
  assert.match(aiContext, /BNA is currently centered on the 10-1 program/);
  assert.match(aiContext, /Do not invent school policies/);
  assert.match(openaiSmoke, /brand_kit_file_count/);
  assert.match(openaiSmoke, /brand kit context readable/);
});
