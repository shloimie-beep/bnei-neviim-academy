const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildProviderLeadBotPlan,
  buildProviderLeadBotSystemPrompt,
  classifyProviderLeadBotIntent,
  loadProviderLeadBotProfile,
  providerLeadBotClassLinkAllowed,
  validateProviderLeadBotProfile,
} = require('../src/lib/bna/provider-lead-bot');

const profile = loadProviderLeadBotProfile('one-time');

test('One Time provider-bot profile has explicit GHL-style sections without private runtime values', () => {
  const schema = JSON.parse(fs.readFileSync('config/service-provider-bots/schema.json', 'utf8'));
  const site = JSON.parse(fs.readFileSync('config/service-provider-sites/one-time.json', 'utf8'));
  const validation = validateProviderLeadBotProfile(profile);
  assert.deepEqual(validation, { valid: true, errors: [] });
  assert.equal(profile.identity.assistant_name, 'Robot Scheller');
  assert.equal(profile.identity.assistant_subtitle, "Rabbi Scheller's digital assistant");
  assert.equal(profile.identity.may_impersonate_owner, false);
  assert.ok(profile.personality.tone.includes('warm'));
  assert.ok(profile.goals.length >= 5);
  assert.equal(profile.offer.status, 'not_published_for_bot');
  assert.equal(profile.offer.trial_days, 0);
  assert.equal(profile.offer.renewal.amount, 0);
  assert.ok(profile.knowledge_base.approved_benefits.some((item) => /live hybrid Mishnayos/i.test(item)));
  assert.ok(profile.knowledge_base.approved_benefits.every((item) => !/parent portal|student portal|library|accountability/i.test(item)));
  assert.equal(profile.knowledge_base.access_policy.portal_access_status, 'not_currently_granted');
  assert.match(profile.knowledge_base.access_policy.safe_public_answer, /not being opened or promised yet/i);
  assert.equal(profile.policies.activation_mode, 'observe_only');
  assert.equal(schema.$id, 'bna.provider_lead_bot.v1');
  assert.equal(site.lead_bot.profile_key, profile.profile_key);
  const serialized = JSON.stringify(profile);
  assert.doesNotMatch(serialized, /zoom\.us|api\.telegram\.org\/bot|"chat_id"|"api_token"/i);
});

test('intent precedence keeps opt-out, human, tech, link, signup, and knowledge lanes deterministic', () => {
  assert.equal(classifyProviderLeadBotIntent('STOP, wrong number'), 'opt_out_or_wrong_number');
  assert.equal(classifyProviderLeadBotIntent('I have a Torah question for the Rabbi'), 'rabbi_or_torah_question');
  assert.equal(classifyProviderLeadBotIntent('The parent portal login is not working'), 'technology_support');
  assert.equal(classifyProviderLeadBotIntent('My child cannot log in to the portal'), 'technology_support');
  assert.equal(classifyProviderLeadBotIntent('Please send me the Zoom link'), 'class_join_link_request');
  assert.equal(classifyProviderLeadBotIntent('I want to sign up for the free trial'), 'signup_or_trial_start');
  assert.equal(classifyProviderLeadBotIntent('What time is the next class?'), 'schedule');
  assert.equal(classifyProviderLeadBotIntent('Which masechta are you learning?'), 'current_learning');
  assert.equal(classifyProviderLeadBotIntent('How much is it after the trial?'), 'price_or_trial');
});

test('signup flow asks one missing question at a time and never claims enrollment', () => {
  const first = buildProviderLeadBotPlan({
    profile,
    message: 'I want to sign up for the trial',
    contact: { contact_type: 'lead', parent_name: 'Parent Example', lead_id: 42 },
    publicBaseUrl: 'https://example.invalid',
    newLead: true,
  });
  assert.equal(first.intent, 'signup_or_trial_start');
  assert.equal(first.capture.awaiting_field, 'parent_email');
  assert.match(first.reply_body, /What email/i);
  assert.doesNotMatch(first.reply_body, /30-day|\$67|per month/i);
  assert.doesNotMatch(first.reply_body, /you are enrolled|membership is active/i);
  assert.deepEqual(first.route_aliases, ['one_time_rabbi_operator']);

  const second = buildProviderLeadBotPlan({
    profile,
    message: 'parent@example.invalid',
    contact: {
      contact_type: 'lead',
      parent_name: 'Parent Example',
      lead_id: 42,
      bot_state: first.bot_state,
    },
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(second.captured_fields.parent_email, 'parent@example.invalid');
  assert.equal(second.capture.awaiting_field, 'student_name');
  assert.equal(second.intent, 'signup_or_trial_start');
  assert.match(second.reply_body, /student.s first name/i);
});

test('class link is denied to anonymous, lead, and signup states and allowed only for active member state', () => {
  const privateJoinUrl = 'https://private.example.invalid/class';
  assert.equal(providerLeadBotClassLinkAllowed(profile, 'anonymous', privateJoinUrl), false);
  assert.equal(providerLeadBotClassLinkAllowed(profile, 'lead', privateJoinUrl), false);
  assert.equal(providerLeadBotClassLinkAllowed(profile, 'verified_signup', privateJoinUrl), false);
  assert.equal(providerLeadBotClassLinkAllowed(profile, 'active_member', privateJoinUrl), true);

  const anonymous = buildProviderLeadBotPlan({
    profile,
    message: 'Send me the class link',
    contact: { contact_type: 'lead', lead_id: 9 },
    classJoinUrl: privateJoinUrl,
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(anonymous.class_link_released, false);
  assert.equal(anonymous.class_link_blocked, true);
  assert.doesNotMatch(anonymous.reply_body, /private\.example\.invalid/);
  assert.match(anonymous.reply_body, /until active membership is verified/i);

  const unverifiedSignup = buildProviderLeadBotPlan({
    profile,
    message: 'Send me the class link',
    contact: { contact_type: 'signup' },
    classJoinUrl: privateJoinUrl,
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(unverifiedSignup.class_link_released, false);
  assert.doesNotMatch(unverifiedSignup.reply_body, /private\.example\.invalid/);

  const forgedMemberState = buildProviderLeadBotPlan({
    profile,
    message: 'Send me the class link',
    contact: { access_state: 'active_member', access_verified: false },
    classJoinUrl: privateJoinUrl,
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(forgedMemberState.class_link_released, false);

  const forgedSignupState = buildProviderLeadBotPlan({
    profile,
    message: 'Send me the class link',
    contact: { access_state: 'verified_signup' },
    classJoinUrl: privateJoinUrl,
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(forgedSignupState.class_link_released, false);

  const verified = buildProviderLeadBotPlan({
    profile,
    message: 'Send me the class link',
    contact: { contact_type: 'signup', access_state: 'active_member', access_verified: true },
    classJoinUrl: privateJoinUrl,
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(verified.class_link_released, true);
  assert.match(verified.reply_body, /private\.example\.invalid/);
  assert.doesNotMatch(verified.reply_audit_body, /private\.example\.invalid/);
  assert.equal(verified.guardrails.no_raw_link_in_metadata, true);
  assert.equal(verified.guardrails.no_raw_link_in_persisted_reply_body, true);
  assert.equal(verified.guardrails.class_link_requires_active_member, true);
});

test('dynamic schedule/current learning answer only from supplied approved facts', () => {
  const missing = buildProviderLeadBotPlan({ profile, message: 'When is class?', contact: { contact_type: 'lead' } });
  assert.match(missing.reply_body, /so I won.t guess/i);

  const known = buildProviderLeadBotPlan({
    profile,
    message: 'Which masechta are you learning?',
    contact: { contact_type: 'lead' },
    dynamicKnowledge: {
      current_learning: { masechta: 'Example Masechta', perek: 'Perek 2', mishnah_range: 'Mishnayos 1-3' },
    },
  });
  assert.match(known.reply_body, /Example Masechta, Perek 2, Mishnayos 1-3/);
});

test('natural WhatsApp replies stay deterministic and safety-gated', () => {
  const greeting = buildProviderLeadBotPlan({
    profile,
    message: 'Hi',
    contact: { contact_type: 'lead', lead_id: 19 },
  });
  assert.equal(greeting.intent, 'greeting');
  assert.match(greeting.reply_body, /^Hi, I'm Robot Scheller/);
  assert.match(greeting.reply_body, /What would you like to know\?/);
  assert.equal(greeting.guardrails.deterministic_natural_reply, true);
  assert.equal(greeting.guardrails.no_charge, true);
  assert.equal(greeting.guardrails.no_access_grant, true);

  const unknown = buildProviderLeadBotPlan({
    profile,
    message: 'Can you help me with this?',
    contact: { contact_type: 'lead', lead_id: 19 },
  });
  assert.match(unknown.reply_body, /Thanks, I got your message/);
  assert.match(unknown.reply_body, /joining, the schedule, the current Mishnah, or a question for Rabbi Scheller/);
  assert.doesNotMatch(unknown.reply_body, /as an ai|dear user|ticket has been closed/i);

  const tech = buildProviderLeadBotPlan({
    profile,
    message: 'The login is not working',
    contact: { contact_type: 'lead', lead_id: 19 },
  });
  assert.match(tech.reply_body, /Sorry, that sounds frustrating/);
  assert.match(tech.reply_body, /What device are you using/);
  assert.equal(tech.create_support_ticket, true);
  assert.equal(tech.notify_platform_support, true);
  assert.equal(tech.notify_rabbi, false);

  const blockedLink = buildProviderLeadBotPlan({
    profile,
    message: 'Please send the class link',
    contact: { contact_type: 'lead', lead_id: 19 },
    classJoinUrl: 'https://private.example.invalid/class',
    publicBaseUrl: 'https://example.invalid',
  });
  assert.equal(blockedLink.class_link_released, false);
  assert.match(blockedLink.reply_body, /I can't send the live-class link until active membership is verified/);
  assert.doesNotMatch(blockedLink.reply_body, /private\.example\.invalid/);
});

test('program, portal, trial, and price replies use only safe unpublished bot facts', () => {
  const benefits = buildProviderLeadBotPlan({
    profile,
    message: 'Do we get a parent portal and library?',
    contact: { contact_type: 'lead', lead_id: 19 },
  });
  assert.equal(benefits.intent, 'program_benefits');
  assert.match(benefits.reply_body, /Portal, library, student-login, parent-login, and member access are not being opened or promised yet/);
  assert.doesNotMatch(benefits.reply_body, /A parent portal and a student portal|Online class library|30-day|\$67/i);
  assert.equal(benefits.guardrails.portal_access_not_granted_by_bot, true);

  const price = buildProviderLeadBotPlan({
    profile,
    message: 'How much is it after the trial?',
    contact: { contact_type: 'lead', lead_id: 19 },
  });
  assert.equal(price.intent, 'price_or_trial');
  assert.match(price.reply_body, /Trial terms, renewal pricing, payment flow, portal access, library access, and member access are not currently approved facts/i);
  assert.match(price.reply_body, /does not charge, create checkout, or activate access/i);
  assert.doesNotMatch(price.reply_body, /30-day|\$67|per month/i);
});

test('tech routes only to platform support, Torah routes to Rabbi, and opt-out suppresses all replies', () => {
  const tech = buildProviderLeadBotPlan({
    profile,
    message: 'The portal login is broken',
    contact: { contact_type: 'lead' },
    newLead: true,
  });
  assert.equal(tech.create_support_ticket, true);
  assert.equal(tech.notify_platform_support, true);
  assert.equal(tech.notify_rabbi, false);
  assert.deepEqual(tech.route_aliases, ['platform_support_shloimie']);

  const torah = buildProviderLeadBotPlan({ profile, message: 'I have a Torah question for Rabbi', contact: { contact_type: 'lead' } });
  assert.equal(torah.notify_rabbi, true);
  assert.equal(torah.notify_platform_support, false);
  assert.match(torah.reply_body, /won.t answer in his name/i);

  const stop = buildProviderLeadBotPlan({ profile, message: 'Please stop and remove me', contact: { contact_type: 'lead' } });
  assert.equal(stop.opt_out, true);
  assert.equal(stop.suppress_outbound, true);
  assert.equal(stop.reply_allowed, false);
  assert.equal(stop.reply_body, '');
  assert.deepEqual(stop.route_aliases, []);
  assert.ok(stop.lead_tags.includes('whatsapp-opt-out'));

  const laterMessage = buildProviderLeadBotPlan({
    profile,
    message: 'Hello',
    contact: { contact_type: 'lead', lead_id: 9, whatsapp_suppressed: true },
  });
  assert.equal(laterMessage.persisted_suppression, true);
  assert.equal(laterMessage.suppress_outbound, true);
  assert.equal(laterMessage.reply_allowed, false);
  assert.equal(laterMessage.reply_body, '');
});

test('natural-language prompt is knowledge-scoped and never receives the raw join link', () => {
  const prompt = buildProviderLeadBotSystemPrompt(profile, {
    current_learning: { masechta: 'Example Masechta' },
  });
  assert.match(prompt, /Robot Scheller/);
  assert.match(prompt, /Offer terms:/);
  assert.match(prompt, /Do not state a trial length, price, renewal term, payment flow, portal availability, library availability, or member access as an approved fact/);
  assert.match(prompt, /Portal, library, student-login, parent-login, and member access are not being opened or promised yet/);
  assert.doesNotMatch(prompt, /30-day trial|\$67/);
  assert.match(prompt, /may not authorize a send/i);
  assert.doesNotMatch(prompt, /server_secret_alias|ONE_TIME_WHATSAPP_CLASS_LINK|zoom\.us/i);
});

test('server wires fail-closed hosted webhook auth, sanitized headers, CRM lead capture, routing, and safe reply plan', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const webhookAuth = server.slice(
    server.indexOf('function authorizeWapiWebhookRequest'),
    server.indexOf('function oneTimeWapiAutoReplyReadiness')
  );
  assert.match(server, /function authorizeWapiWebhookRequest/);
  assert.match(server, /WAPI webhook is disabled until a server-side webhook secret is configured/);
  assert.match(server, /function sanitizedWapiWebhookHeaders/);
  assert.match(server, /function minimizedWapiWebhookPayload/);
  assert.match(server, /raw_auth_headers_stored: false/);
  assert.doesNotMatch(webhookAuth, /req\.query\.secret/);
  assert.match(server, /WAPI_WEBHOOK_ALLOW_INSECURE_LOCAL_TEST/);
  assert.match(server, /function oneTimeWapiBindingError/);
  assert.match(server, /provider-number binding/);
  assert.match(server, /!normalized\.fromMe && suppliedInstance && suppliedInstance === ONE_TIME_WAPI_INSTANCE_ID/);
  assert.match(server, /async function ensureOneTimeProviderBotLead/);
  assert.match(server, /pg_advisory_xact_lock/);
  assert.match(server, /active_member_phone/);
  assert.match(server, /AND project_id = \$3/);
  assert.match(server, /async function oneTimeProviderBotWasSuppressed/);
  assert.match(server, /async function loadOneTimeProviderBotKnowledge/);
  assert.match(server, /visibility = 'public'/);
  assert.match(server, /buildProviderLeadBotPlan/);
  assert.match(server, /async function ensureOneTimeProviderBotSupportTicket/);
  assert.match(server, /platform_support_shloimie/);
  assert.match(server, /providerBotPlan\?\.notify_rabbi === true/);
  assert.match(server, /oneTimeProviderLeadBotTelegramApproved\(\)/);
  assert.match(server, /roleAlias: 'one_time_rabbi_operator'/);
  assert.match(server, /auto_reply_type: 'provider_lead_bot_reply'/);
  assert.match(server, /claimOneTimeWapiAutoReplyAttempt/);
  assert.match(server, /normalized\.messageId && db === pool && typeof db\.connect === 'function'/);
  assert.match(server, /db !== pool \|\| typeof db\.connect !== 'function'/);
  assert.match(server, /\$2::text <> ''/);
  assert.match(server, /reply_audit_body/);
  assert.match(server, /skipped_observe_only/);
  assert.match(server, /ONE_TIME_PROVIDER_LEAD_BOT_MODE === 'live'/);
  assert.doesNotMatch(server, /Here is the link for today.s shiur/);
});
