const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '../../../config/service-provider-bots');
const CURRENT_CLASS_LINK_ACTION_ID = 'ACTION-ONETIME-GET-CURRENT-CLASS-LINK';
const CLASS_LINK_RELEASE_STATES = new Set(['class_info_requested', 'class_info_consented', 'active_member']);
const ACCESS_STATES = new Set(['anonymous', 'lead', 'class_info_requested', 'class_info_consented', 'verified_signup', 'active_member']);

const INTENT_MATCHERS = Object.freeze([
  ['opt_out_or_wrong_number', /\b(stop|unsubscribe|remove\s+me|wrong\s+number|do\s+not\s+(?:message|contact)|don['`]?t\s+(?:message|contact)|leave\s+me\s+alone)\b/i],
  ['urgent_or_safety_handoff', /\b(urgent|emergency|unsafe|danger|immediate\s+help)\b/i],
  ['rabbi_or_torah_question', /\b(halach(?:a|ic)|psak|pasken|torah\s+question|mishnah\s+question|ask\s+(?:the\s+)?rabbi|rabbi\s+question|what\s+does\s+(?:the\s+)?mishnah\s+mean)\b/i],
  ['technology_support', /\b(tech(?:nology|nical)?|login|password|portal\s+(?:error|problem|broken)|app\s+(?:error|problem|broken)|not\s+working|(?:can['`]?t|cannot)\s+(?:open|log\s*in|hear|see)|camera|microphone|audio|sound|bug|error)\b/i],
  ['parent_or_student_question', /\b(parent\s+question|student\s+question|my\s+(?:son|daughter|child)|for\s+my\s+child|student\s+needs)\b/i],
  ['class_join_link_request', /\b(zoom\s+link|class\s+link|join\s+link|live\s+link|where\s+(?:is|can\s+i\s+find)\s+(?:the\s+)?link|send\s+(?:me\s+)?(?:the\s+)?link)\b/i],
  ['signup_or_trial_start', /\b(sign\s*up|signup|register|enroll|start\s+(?:the\s+)?trial|try\s+(?:the\s+)?class|join\s+(?:the\s+)?program|interested\s+in\s+joining|free\s+trial)\b/i],
  ['local_class_location', /\b(address|location|in\s+person|local\s+class|where\s+(?:is|are)\s+(?:you|the\s+class)|ramat\s+beit\s+shemesh|rbs|hagaon|gaon\s+mi?v?ilna|vilna)\b/i],
  ['schedule', /\b(schedule|what\s+time|when\s+(?:is|are)|days?\s+of\s+(?:the\s+)?week|next\s+class|class\s+time)\b/i],
  ['current_learning', /\b(current\s+(?:masechta|tractate|perek|mishnah)|which\s+(?:masechta|tractate|perek)|what\s+are\s+(?:you|they|we)\s+learning|up\s+to\s+in\s+mishnayos)\b/i],
  ['price_or_trial', /\b(price|pricing|cost|how\s+much|\$\s*67|67\s+dollars?|trial|monthly|per\s+month)\b/i],
  ['program_benefits', /\b(what\s+(?:do\s+you\s+get|is\s+included)|included|benefits?|parent\s+portal|student\s+portal|worksheets?|accountability|library|how\s+does\s+it\s+work)\b/i],
  ['human_handoff', /\b(speak|talk|message|connect)\s+(?:to|with)\s+(?:rabbi|someone|a\s+person|a\s+human)|\breal\s+person\b|\bcall\s+me\b/i],
  ['greeting', /^\s*(hi|hello|hey|shalom|good\s+(?:morning|afternoon|evening))[.!\s]*$/i],
]);

function compactText(value, maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeProfileKey(value) {
  const key = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!key || key.includes('..')) throw new Error('A valid provider lead-bot profile key is required');
  return key;
}

function validateProviderLeadBotProfile(profile = {}) {
  const errors = [];
  if (profile.schema_version !== 'bna.provider_lead_bot.v1') errors.push('schema_version must be bna.provider_lead_bot.v1');
  if (!compactText(profile.profile_key, 120)) errors.push('profile_key is required');
  if (!compactText(profile.version, 120)) errors.push('version is required');
  if (!compactText(profile.scope?.workspace_key, 120)) errors.push('scope.workspace_key is required');
  if (!compactText(profile.scope?.project_key, 120)) errors.push('scope.project_key is required');
  const scopeChannels = Array.isArray(profile.scope?.channels)
    ? profile.scope.channels.map((channel) => compactText(channel, 80).toLowerCase()).filter(Boolean)
    : [];
  if (profile.scope?.channel === 'whatsapp') errors.push('scope.channel must not be WhatsApp-only; use scope.channels and channel_bindings');
  if (!scopeChannels.includes('whatsapp') || !scopeChannels.includes('email')) {
    errors.push('scope.channels must include whatsapp and email');
  }
  if (profile.agent_model?.model_family !== 'communication_agent') errors.push('agent_model.model_family must be communication_agent');
  if (profile.agent_model?.agent_key && profile.agent_model.agent_key !== profile.profile_key) {
    errors.push('agent_model.agent_key must match profile_key');
  }
  if (profile.agent_model?.shared_knowledge_snapshot !== true) errors.push('agent_model.shared_knowledge_snapshot must be true');
  if (profile.agent_model?.build_qa_agent !== false) errors.push('agent_model.build_qa_agent must be false');
  const channelBindings = Array.isArray(profile.channel_bindings) ? profile.channel_bindings : [];
  const activeBindingFor = (channel) => channelBindings.find((binding = {}) => (
    binding.active !== false
    && compactText(binding.channel, 80).toLowerCase() === channel
  ));
  const whatsappBinding = activeBindingFor('whatsapp');
  const emailBinding = activeBindingFor('email');
  if (!whatsappBinding) errors.push('channel_bindings must include an active whatsapp binding');
  if (!emailBinding) errors.push('channel_bindings must include an active email binding');
  for (const binding of channelBindings) {
    const channel = compactText(binding.channel, 80).toLowerCase();
    if (!scopeChannels.includes(channel)) errors.push(`channel_bindings.${channel || 'unknown'} must be listed in scope.channels`);
    if (binding.agent_version !== profile.version) errors.push(`channel_bindings.${channel || 'unknown'}.agent_version must match profile.version`);
    if (binding.create_contact_on_inbound !== true) errors.push(`channel_bindings.${channel || 'unknown'}.create_contact_on_inbound must be true`);
    if (binding.create_conversation_on_inbound !== true) errors.push(`channel_bindings.${channel || 'unknown'}.create_conversation_on_inbound must be true`);
    if (binding.create_task_on_inbound !== false) errors.push(`channel_bindings.${channel || 'unknown'}.create_task_on_inbound must be false`);
    if (binding.formatting_policy?.raw_class_link_in_model_context !== false) {
      errors.push(`channel_bindings.${channel || 'unknown'}.formatting_policy.raw_class_link_in_model_context must be false`);
    }
    if (binding.formatting_policy?.raw_class_link_in_logs !== false) {
      errors.push(`channel_bindings.${channel || 'unknown'}.formatting_policy.raw_class_link_in_logs must be false`);
    }
  }
  if (whatsappBinding?.knowledge_snapshot_ref && emailBinding?.knowledge_snapshot_ref && whatsappBinding.knowledge_snapshot_ref !== emailBinding.knowledge_snapshot_ref) {
    errors.push('email and whatsapp channel bindings must use the same knowledge_snapshot_ref');
  }
  if (!compactText(profile.identity?.assistant_name, 120)) errors.push('identity.assistant_name is required');
  if (!compactText(profile.identity?.assistant_subtitle, 180)) errors.push('identity.assistant_subtitle is required');
  if (profile.identity?.may_impersonate_owner !== false) errors.push('identity.may_impersonate_owner must be false');
  if (!Array.isArray(profile.goals) || profile.goals.length < 3) errors.push('at least three ordered goals are required');
  if (!Array.isArray(profile.knowledge_base?.approved_benefits) || !profile.knowledge_base.approved_benefits.length) {
    errors.push('knowledge_base.approved_benefits is required');
  }
  const releaseStates = profile.knowledge_base?.links?.class_join?.release_states;
  if (!Array.isArray(releaseStates) || releaseStates.some((state) => !CLASS_LINK_RELEASE_STATES.has(state))) {
    errors.push('class_join.release_states may contain only class_info_requested, class_info_consented, or active_member');
  }
  if (profile.offer?.bot_may_charge !== false) errors.push('offer.bot_may_charge must be false');
  if (profile.offer?.bot_may_grant_access !== false) errors.push('offer.bot_may_grant_access must be false');
  if (!['observe_only', 'capture_only', 'live'].includes(profile.policies?.activation_mode)) {
    errors.push('policies.activation_mode must be observe_only, capture_only, or live');
  }
  const serialized = JSON.stringify(profile);
  if (/https?:\/\/[^"\s]*zoom\.us/i.test(serialized)) errors.push('raw Zoom links are forbidden in provider-bot profiles');
  if (/api\.telegram\.org\/bot/i.test(serialized)) errors.push('Telegram bot URLs are forbidden in provider-bot profiles');
  if (/\b(?:chat_id|telegram_chat_id|api_token)\b\s*:\s*"[^"\s]+"/i.test(serialized)) {
    errors.push('private recipient identifiers and API tokens are forbidden in provider-bot profiles');
  }
  return { valid: errors.length === 0, errors };
}

function loadProviderLeadBotProfile(profileKey = 'one-time', options = {}) {
  const key = normalizeProfileKey(profileKey);
  const configDir = path.resolve(options.configDir || CONFIG_DIR);
  const filePath = path.join(configDir, `${key}.json`);
  if (!filePath.startsWith(`${configDir}${path.sep}`)) throw new Error('Provider lead-bot profile path is outside the config directory');
  const profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const validation = validateProviderLeadBotProfile(profile);
  if (!validation.valid) throw new Error(`Invalid provider lead-bot profile: ${validation.errors.join('; ')}`);
  return profile;
}

function classifyProviderLeadBotIntent(text = '') {
  const input = compactText(text, 3000);
  for (const [intent, pattern] of INTENT_MATCHERS) {
    if (pattern.test(input)) return intent;
  }
  return 'unknown';
}

function extractEmail(text = '') {
  const match = String(text || '').match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  return match ? match[0].toLowerCase().slice(0, 240) : '';
}

function cleanCapturedName(text = '') {
  const candidate = compactText(text, 100)
    .replace(/^(?:my\s+name\s+is|the\s+parent\s+is|parent\s+is|student(?:'s)?\s+(?:name\s+)?is|it(?:'s|\s+is))\s+/i, '')
    .replace(/[.!?]+$/g, '')
    .trim();
  if (!candidate || candidate.includes('@') || /\d/.test(candidate)) return '';
  const words = candidate.split(/\s+/).filter(Boolean);
  return words.length <= 6 ? candidate : '';
}

function extractProviderLeadBotFields(text = '', { awaitingField = '' } = {}) {
  const input = compactText(text, 1000);
  const fields = {};
  const email = extractEmail(input);
  if (email) fields.parent_email = email;
  if (/\b(yes[, ]+you\s+may|yes[, ]+please|you\s+may\s+(?:message|contact)|keep\s+me\s+posted|i\s+agree|i\s+consent|sign\s+me\s+up)\b/i.test(input)) {
    fields.contact_consent = true;
  }
  if (awaitingField === 'parent_name' || awaitingField === 'student_name') {
    const name = cleanCapturedName(input);
    if (name) fields[awaitingField] = name;
  }
  if (awaitingField === 'student_age_band') {
    const age = input.match(/\b(?:age\s*)?(\d{1,2})(?:\s*(?:years?|yrs?)\s*old)?\b/i);
    if (age && Number(age[1]) >= 5 && Number(age[1]) <= 19) fields.student_age_band = age[1];
    else if (/\b(elementary|middle\s+school|high\s+school|teen(?:ager)?)\b/i.test(input)) {
      fields.student_age_band = input.match(/\b(elementary|middle\s+school|high\s+school|teen(?:ager)?)\b/i)[1].toLowerCase();
    }
  }
  if (awaitingField === 'timezone' && input && input.length <= 100) fields.timezone = input;
  if (awaitingField === 'contact_consent' && /^(?:yes|y|sure|okay|ok|i\s+agree|please\s+do)[.!\s]*$/i.test(input)) {
    fields.contact_consent = true;
  }
  return fields;
}

function providerLeadBotAccessState(contact = {}) {
  const explicit = compactText(contact.access_state || contact.accessState, 80).toLowerCase();
  if (['anonymous', 'lead', 'class_info_requested', 'class_info_consented'].includes(explicit)) return explicit;
  if (['verified_signup', 'active_member'].includes(explicit) && contact.access_verified === true) return explicit;
  if (contact.active_member === true && contact.access_verified === true) return 'active_member';
  if (contact.verified_signup === true && contact.access_verified === true) return 'verified_signup';
  if (contact.class_info_consented === true || contact.classInfoConsented === true || contact.contact_consent === true || contact.consent === true) {
    return 'class_info_consented';
  }
  if (contact.class_info_requested === true || contact.classInfoRequested === true || contact.class_link_requested === true || contact.classLinkRequested === true) {
    return 'class_info_requested';
  }
  if (contact.lead_id || contact.leadId) return 'lead';
  return 'anonymous';
}

function providerLeadBotHasResolvedContact(contact = {}) {
  const type = compactText(contact.contact_type || contact.contactType, 80).toLowerCase();
  return Boolean(
    contact.lead_id || contact.leadId ||
    contact.signup_id || contact.signupId ||
    contact.student_id || contact.studentId ||
    ['lead', 'signup', 'student'].includes(type)
  );
}

function providerLeadBotClassInfoState({ intent, contact, accessState }) {
  if (intent !== 'class_join_link_request') return accessState;
  if (accessState === 'active_member' || accessState === 'class_info_consented') return accessState;
  return providerLeadBotHasResolvedContact(contact) ? 'class_info_requested' : accessState;
}

function providerLeadBotClassLinkAllowed(profile = {}, accessState = 'anonymous', classJoinUrl = '') {
  const releaseStates = profile.knowledge_base?.links?.class_join?.release_states || [];
  const url = String(classJoinUrl || '').trim();
  if (!releaseStates.includes(accessState) || !url) return false;
  try {
    return new URL(url).protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function sameOriginLink(baseUrl = '', pathValue = '') {
  const route = String(pathValue || '').trim();
  if (!route) return '';
  const base = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!base) return route;
  return `${base}${route.startsWith('/') ? route : `/${route}`}`;
}

function formatDynamicSchedule(dynamicKnowledge = {}) {
  const nextClass = dynamicKnowledge.next_class || dynamicKnowledge.nextClass || null;
  if (!nextClass?.start_at && !nextClass?.startAt) return '';
  const date = new Date(nextClass.start_at || nextClass.startAt);
  if (Number.isNaN(date.getTime())) return '';
  const timezone = compactText(nextClass.timezone || dynamicKnowledge.timezone || 'Asia/Jerusalem', 100) || 'Asia/Jerusalem';
  let when = date.toISOString();
  try {
    when = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  } catch (_) {}
  return `${compactText(nextClass.title || 'The next live class', 160)} is scheduled for ${when}.`;
}

function currentLearningText(dynamicKnowledge = {}) {
  const learning = dynamicKnowledge.current_learning || dynamicKnowledge.currentLearning || {};
  if (typeof learning === 'string') return compactText(learning, 300);
  const parts = [learning.masechta, learning.perek, learning.mishnah_range || learning.mishnahRange]
    .map((value) => compactText(value, 120))
    .filter(Boolean);
  return parts.join(', ');
}

function approvedProgramFact(profile = {}, key = '') {
  return compactText(profile.knowledge_base?.public_facts?.[key], 500);
}

function approvedAudience(profile = {}) {
  const audience = profile.knowledge_base?.public_facts?.audience;
  return Array.isArray(audience) ? audience.map((item) => compactText(item, 160)).filter(Boolean) : [];
}

function providerLeadBotOfferPublished(profile = {}) {
  const status = compactText(profile.offer?.status || 'published', 80).toLowerCase();
  return ['published', 'approved', 'active'].includes(status)
    && Number(profile.offer?.trial_days) > 0
    && Number(profile.offer?.renewal?.amount) > 0
    && !/not[_ -]?published|unknown|pending/i.test(String(profile.offer?.renewal?.cadence || ''));
}

function providerLeadBotOfferText(profile = {}) {
  if (providerLeadBotOfferPublished(profile)) {
    return `${profile.offer.trial_days}-day trial, then $${profile.offer.renewal.amount} per ${profile.offer.renewal.cadence}`;
  }
  return compactText(
    profile.offer?.safe_summary,
    500
  ) || 'Trial terms, pricing, renewal, payment flow, and access are being confirmed; do not guess.';
}

function providerLeadBotAccessPolicyText(profile = {}) {
  return compactText(profile.knowledge_base?.access_policy?.safe_public_answer, 500);
}

function mergedCaptureState(profile, contact = {}, capturedFields = {}) {
  const previous = contact.bot_state && typeof contact.bot_state === 'object' ? contact.bot_state : {};
  const stored = previous.captured_fields && typeof previous.captured_fields === 'object' ? previous.captured_fields : {};
  const contactFields = {
    parent_name: contact.parent_name || contact.parentName || '',
    parent_email: contact.parent_email || contact.parentEmail || contact.email || '',
    student_name: contact.student_name || contact.studentName || '',
    student_age_band: contact.student_age_band || contact.studentAgeBand || contact.student_age || contact.studentAge || '',
    timezone: contact.timezone || '',
    contact_consent: contact.contact_consent === true || contact.consent === true,
  };
  const fields = { ...stored, ...Object.fromEntries(Object.entries(contactFields).filter(([, value]) => value !== '' && value !== false)), ...capturedFields };
  const required = profile.lead_capture?.signup_fields || [];
  const missing = required.filter((field) => fields[field] === undefined || fields[field] === null || fields[field] === '' || fields[field] === false);
  return {
    captured_fields: fields,
    missing_fields: missing,
    awaiting_field: missing[0] || '',
    complete: missing.length === 0,
  };
}

function routeAliasesForPlan(profile, intent, { newLead = false, verifiedSignup = false } = {}) {
  const aliases = new Set(profile.routing?.intent_routes?.[intent] || []);
  const exclusiveRoute = ['technology_support', 'urgent_or_safety_handoff', 'opt_out_or_wrong_number'].includes(intent);
  if (!exclusiveRoute) for (const alias of profile.routing?.default_inbound || []) aliases.add(alias);
  if (newLead && !exclusiveRoute) for (const alias of profile.routing?.event_routes?.new_whatsapp_lead || []) aliases.add(alias);
  if (verifiedSignup) for (const alias of profile.routing?.event_routes?.verified_signup || []) aliases.add(alias);
  return [...aliases];
}

function renderProviderLeadBotReply({ profile, intent, capture, dynamicKnowledge, accessState, classJoinUrl, publicBaseUrl }) {
  const name = profile.identity.assistant_name;
  const subtitle = profile.identity.assistant_subtitle;
  const signupUrl = sameOriginLink(publicBaseUrl, profile.knowledge_base?.links?.signup?.path || '/one-time/signup');
  const offer = profile.offer || {};
  const offerPublished = providerLeadBotOfferPublished(profile);
  const offerText = providerLeadBotOfferText(profile);
  const accessPolicyText = providerLeadBotAccessPolicyText(profile);
  const schedule = formatDynamicSchedule(dynamicKnowledge);
  const approvedSchedule = approvedProgramFact(profile, 'schedule');
  const localLocation = approvedProgramFact(profile, 'local_location');
  const programName = approvedProgramFact(profile, 'program') || 'One Time Mishnayos';
  const learning = currentLearningText(dynamicKnowledge);
  const classLinkAllowed = providerLeadBotClassLinkAllowed(profile, accessState, classJoinUrl);

  if (intent === 'opt_out_or_wrong_number') return '';
  if (intent === 'urgent_or_safety_handoff') return `I'm ${name}, ${subtitle}. I flagged this for a human to review right away. If anyone may be unsafe, please use local emergency help now too.`;
  if (intent === 'technology_support') return `Sorry, that sounds frustrating. I'm ${name}, ${subtitle}, and I sent this to platform support. What device are you using, and what do you see on the screen?`;
  if (['rabbi_or_torah_question', 'parent_or_student_question', 'human_handoff'].includes(intent)) {
    return `Got it. I'm ${name}, ${subtitle}. I saved your question for Rabbi Scheller, and I won't answer in his name.`;
  }
  if (intent === 'class_join_link_request') {
    if (classLinkAllowed) return `Sure. I can send the current ${programName} live-class link here: ${String(classJoinUrl).trim()}`;
    return `I can send the current class link after I save your contact request. Please sign up here: ${signupUrl}`;
  }
  if (intent === 'signup_or_trial_start') {
    if (capture.complete) return `Thanks, I saved those details for the One Time team to verify. You can also review the signup page here: ${signupUrl}`;
    const prompt = profile.lead_capture?.field_prompts?.[capture.awaiting_field] || 'What parent contact detail should we use?';
    if (offerPublished) return `Great, I can help start the ${offer.trial_days}-day trial. After that it is $${offer.renewal.amount}/${offer.renewal.cadence}. ${prompt}`;
    return `Great, I can help with the public signup for One Time Mishnayos. ${prompt}`;
  }
  if (intent === 'local_class_location') {
    return localLocation
      ? `The local One Time class is at ${localLocation}.`
      : `I do not have a confirmed local address in the approved public facts yet, so I asked the One Time team to confirm it.`;
  }
  if (intent === 'schedule') {
    return schedule || approvedSchedule || `I don't have the confirmed class time in front of me, so I won't guess. I asked the One Time team to confirm the current schedule.`;
  }
  if (intent === 'current_learning') {
    return learning ? `The current approved learning is ${learning}.` : `I don't want to guess the current masechta. I asked Rabbi Scheller's team to confirm it.`;
  }
  if (intent === 'price_or_trial') return `${offerText} The bot does not charge, create checkout, or activate access.`;
  if (intent === 'program_benefits') {
    const accessNote = accessPolicyText ? ` ${accessPolicyText}` : '';
    const nextStep = offerPublished ? `Want help starting the ${offer.trial_days}-day trial?` : 'Want me to collect safe signup details for the One Time team?';
    const audience = approvedAudience(profile);
    const audienceNote = audience.length ? ` Audience: ${audience.join(', ')}.` : '';
    return `Approved facts: ${profile.knowledge_base.approved_benefits.join('; ')}.${audienceNote}${accessNote} ${nextStep}`;
  }
  if (intent === 'greeting') return `Hi, I'm ${name}, ${subtitle}. I can explain the class, help with signup, send the current class link after saving your request, or pass a question to Rabbi Scheller. What would you like to know?`;
  return `Thanks, I got your message. I'm ${name}, ${subtitle}. Are you asking about signup, the schedule, the local class, the current Mishnah, or a question for Rabbi Scheller?`;
}

function buildProviderLeadBotPlan({
  profile,
  message = '',
  contact = {},
  dynamicKnowledge = {},
  classJoinUrl = '',
  publicBaseUrl = '',
  newLead = false,
} = {}) {
  const selectedProfile = profile || loadProviderLeadBotProfile('one-time');
  const validation = validateProviderLeadBotProfile(selectedProfile);
  if (!validation.valid) throw new Error(`Invalid provider lead-bot profile: ${validation.errors.join('; ')}`);
  const previousState = contact.bot_state && typeof contact.bot_state === 'object' ? contact.bot_state : {};
  const classifiedIntent = classifyProviderLeadBotIntent(message);
  const signupCaptureInterrupts = new Set([
    'opt_out_or_wrong_number',
    'urgent_or_safety_handoff',
    'rabbi_or_torah_question',
    'technology_support',
    'parent_or_student_question',
    'class_join_link_request',
    'local_class_location',
    'human_handoff',
  ]);
  const intent = previousState.state === 'signup_capture' && !signupCaptureInterrupts.has(classifiedIntent)
    ? 'signup_or_trial_start'
    : classifiedIntent;
  const capturedFields = extractProviderLeadBotFields(message, { awaitingField: previousState.awaiting_field || '' });
  const capture = mergedCaptureState(selectedProfile, contact, capturedFields);
  const baseAccessState = providerLeadBotAccessState(contact);
  const accessState = providerLeadBotClassInfoState({ intent, contact, accessState: baseAccessState });
  const classLinkReleased = intent === 'class_join_link_request'
    && providerLeadBotClassLinkAllowed(selectedProfile, accessState, classJoinUrl);
  const optOut = intent === 'opt_out_or_wrong_number';
  const persistedSuppression = contact.whatsapp_suppressed === true || contact.suppress_outbound === true;
  const suppressOutbound = optOut || persistedSuppression;
  const routeAliases = routeAliasesForPlan(selectedProfile, intent, {
    newLead: Boolean(newLead && !optOut),
    verifiedSignup: false,
  });
  const reply = suppressOutbound ? '' : renderProviderLeadBotReply({
    profile: selectedProfile,
    intent,
    capture,
    dynamicKnowledge,
    accessState,
    classJoinUrl,
    publicBaseUrl,
  });
  return {
    profile_key: selectedProfile.profile_key,
    profile_version: selectedProfile.version,
    workspace_key: selectedProfile.scope.workspace_key,
    project_key: selectedProfile.scope.project_key,
    intent,
    access_state: accessState,
    base_access_state: baseAccessState,
    class_info_state: accessState,
    capture,
    captured_fields: capturedFields,
    should_capture_lead: true,
    lead_status: optOut ? 'not_now' : intent === 'signup_or_trial_start' ? 'follow_up' : 'lead_candidate',
    lead_tags: [...new Set(['one-time', 'whatsapp-lead-bot', `bot-intent:${intent}`, ...(optOut ? ['whatsapp-opt-out'] : [])])],
    route_aliases: routeAliases,
    create_support_ticket: intent === 'technology_support' || intent === 'urgent_or_safety_handoff',
    notify_rabbi: routeAliases.includes('one_time_rabbi_operator'),
    notify_platform_support: routeAliases.includes('platform_support_shloimie'),
    opt_out: optOut,
    persisted_suppression: persistedSuppression,
    suppress_outbound: suppressOutbound,
    class_link_requested: intent === 'class_join_link_request',
    class_link_released: classLinkReleased,
    class_link_blocked: intent === 'class_join_link_request' && !classLinkReleased,
    class_link_action_id: intent === 'class_join_link_request' ? CURRENT_CLASS_LINK_ACTION_ID : null,
    deterministic_actions: intent === 'class_join_link_request'
      ? [{
          action_id: CURRENT_CLASS_LINK_ACTION_ID,
          status: classLinkReleased ? 'executed_in_final_channel_delivery' : 'blocked_until_contact_request',
          raw_link_in_model_context: false,
          raw_link_in_logs: false,
        }]
      : [],
    reply_body: reply,
    reply_audit_body: classLinkReleased
      ? '[Approved One Time live-class link sent through final channel delivery; restricted URL omitted from logs.]'
      : reply,
    reply_allowed: Boolean(reply && !suppressOutbound),
    bot_state: {
      state: capture.complete ? 'lead_created' : intent === 'signup_or_trial_start' || previousState.state === 'signup_capture' ? 'signup_capture' : 'engaged',
      awaiting_field: capture.awaiting_field,
      captured_fields: capture.captured_fields,
      last_intent: intent,
      profile_version: selectedProfile.version,
      class_info_state: accessState,
      class_link_requested: intent === 'class_join_link_request',
      class_link_action_id: intent === 'class_join_link_request' ? CURRENT_CLASS_LINK_ACTION_ID : null,
    },
    guardrails: {
      deterministic_privileged_actions: true,
      deterministic_natural_reply: true,
      no_charge: true,
      no_access_grant: true,
      portal_access_not_granted_by_bot: true,
      no_raw_link_in_metadata: true,
      no_raw_link_in_persisted_reply_body: true,
      class_link_requires_server_authorized_request: true,
    },
  };
}

function buildProviderLeadBotSystemPrompt(profile, dynamicKnowledge = {}) {
  const selectedProfile = profile || loadProviderLeadBotProfile('one-time');
  const validation = validateProviderLeadBotProfile(selectedProfile);
  if (!validation.valid) throw new Error(`Invalid provider lead-bot profile: ${validation.errors.join('; ')}`);
  const schedule = formatDynamicSchedule(dynamicKnowledge) || approvedProgramFact(selectedProfile, 'schedule') || 'Schedule is not currently confirmed; do not guess.';
  const learning = currentLearningText(dynamicKnowledge) || 'Current learning is not currently confirmed; do not guess.';
  const offerPublished = providerLeadBotOfferPublished(selectedProfile);
  const offerLine = offerPublished
    ? `Approved offer: ${selectedProfile.offer.trial_days}-day trial, then $${selectedProfile.offer.renewal.amount} per ${selectedProfile.offer.renewal.cadence}.`
    : `Offer terms: ${providerLeadBotOfferText(selectedProfile)} Do not state a trial length, price, renewal term, payment flow, portal availability, library availability, or member access as an approved fact.`;
  const accessPolicy = providerLeadBotAccessPolicyText(selectedProfile);
  return [
    `Identity: ${selectedProfile.identity.assistant_name}, ${selectedProfile.identity.assistant_subtitle}.`,
    `Personality: ${selectedProfile.personality.tone.join(', ')}.`,
    `Goals: ${[...selectedProfile.goals].sort((a, b) => a.priority - b.priority).map((goal) => goal.instruction).join(' ')}`,
    offerLine,
    `Approved benefits: ${selectedProfile.knowledge_base.approved_benefits.join('; ')}.`,
    `Approved public facts: ${Object.entries(selectedProfile.knowledge_base.public_facts || {}).filter(([, value]) => !Array.isArray(value)).map(([key, value]) => `${key}: ${compactText(value, 300)}`).join('; ') || 'none'}.`,
    accessPolicy ? `Access policy: ${accessPolicy}` : 'Access policy: do not promise or grant portal, library, member, parent-login, or student-login access.',
    `Dynamic schedule: ${schedule}`,
    `Dynamic current learning: ${learning}`,
    `Boundaries: ${selectedProfile.personality.boundaries.join(' ')}`,
    'The model may phrase an approved answer, but it may not authorize a send, release a class link, create access, charge, or choose a Telegram recipient.',
  ].join('\n');
}

module.exports = {
  ACCESS_STATES,
  CURRENT_CLASS_LINK_ACTION_ID,
  buildProviderLeadBotPlan,
  buildProviderLeadBotSystemPrompt,
  classifyProviderLeadBotIntent,
  extractProviderLeadBotFields,
  loadProviderLeadBotProfile,
  providerLeadBotAccessState,
  providerLeadBotClassLinkAllowed,
  validateProviderLeadBotProfile,
};
