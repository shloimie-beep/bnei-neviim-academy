const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';

const ONE_TIME_TASK_LANES = Object.freeze([
  {
    id: 'needs_rabbi_decision',
    label: 'Needs Rabbi Decision',
    description: 'Choices or Rabbi-owned inputs that must be resolved before One Time work moves.',
  },
  {
    id: 'needs_shloimie',
    label: 'Needs Shloimie',
    description: 'Operator decisions, inputs, or human tasks that Shloimie owns.',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    description: 'Human-actionable One Time work that is not waiting on an external blocker.',
  },
  {
    id: 'blocked_external_setup',
    label: 'Blocked External Setup',
    description: 'True outside-account, credential, DNS, billing, or service-owner blockers.',
  },
  {
    id: 'done_activity',
    label: 'Done / Activity',
    description: 'Completed, verified, archived, or informational activity records.',
  },
]);

const ONE_TIME_TASK_OWNERS = Object.freeze([
  'Rabbi Sheller',
  'Shloimie',
  'Both',
  'Future admin',
  'Developer/agent',
  'External owner',
]);

const ONE_TIME_TASK_CATEGORIES = Object.freeze([
  'Business model',
  'Partnership terms',
  'Pricing',
  'GHL setup',
  'Payment processor',
  'Banking/admin',
  'Landing pages',
  'Email sequences',
  'WhatsApp sequences',
  'Drive/content workflow',
  'Organic marketing',
  'Ads/ad tracking',
  'Support/ticketing',
  'Reporting/dashboard',
  'Testimonials/reputation',
  'Referral system',
  'Software/IP',
  'Open questions',
  'Tasks',
]);

const ONE_TIME_BLOCKER_TYPES = Object.freeze({
  resend_domain_readiness: Object.freeze({
    id: 'resend_domain_readiness',
    label: 'Resend/domain readiness',
    owner: 'External owner',
    category: 'Email sequences',
    missing_information: 'Approved sender/from/reply-to policy plus DNS/domain verification status for Resend.',
    recommended_option: 'Keep live sends disabled and use preview-only email templates until Resend sender/domain readiness is confirmed.',
    alternatives: [
      'Use a manually approved existing sender only after Shloimie confirms policy and DNS state.',
      'Keep the email sequence as a no-send checklist until the One Time domain plan is final.',
    ],
    consequence: 'Live email cannot be enabled without risking failed sends, wrong sender identity, or an unapproved domain path.',
    exact_next_action: 'Confirm the sender policy and complete/read back Resend DNS/domain verification before enabling live sends.',
    dependent_module_action: 'one_time.communications.email_send',
    patterns: ['resend', 'sender', 'reply-to', 'reply to', 'email domain', 'dns', 'domain verification'],
  }),
  stripe_live_billing_approval: Object.freeze({
    id: 'stripe_live_billing_approval',
    label: 'Stripe/live billing approval',
    owner: 'Shloimie',
    category: 'Payment processor',
    missing_information: 'Final pricing, billing provider, entitlement, refund, and live-charge approval.',
    recommended_option: 'Keep Stripe/live checkout disabled until Shloimie approves pricing and billing policy.',
    alternatives: [
      'Use sandbox-only billing smoke checks.',
      'Collect interest leads without payment until the billing decision is closed.',
    ],
    consequence: 'Live billing cannot launch without risking wrong pricing, unauthorized charges, or unclear entitlement rules.',
    exact_next_action: 'Approve final billing policy and live-charge gate, then run the payment readiness smoke before exposing checkout.',
    dependent_module_action: 'one_time.billing.live_checkout',
    patterns: ['stripe', 'billing', 'checkout', 'live charge', 'payment processor', 'refund'],
  }),
  zoom_owner_admin_meeting_policy: Object.freeze({
    id: 'zoom_owner_admin_meeting_policy',
    label: 'Zoom owner/admin meeting policy',
    owner: 'Rabbi Sheller',
    category: 'Drive/content workflow',
    missing_information: 'Approved Zoom account owner/admin policy and authorization to create or manage real class meetings.',
    recommended_option: 'Keep Zoom creation operator-gated and use dry-run/link-preview state until the owner policy is approved.',
    alternatives: [
      'Use an existing manually provided Zoom link.',
      'Create meetings manually outside the app until account ownership is settled.',
    ],
    consequence: 'Automated meeting creation could duplicate classes or write to the wrong Zoom account.',
    exact_next_action: 'Rabbi/owner confirms the Zoom account policy and authorizes the exact meeting-creation workflow.',
    dependent_module_action: 'one_time.live_class.zoom_meeting_create',
    patterns: ['zoom', 'meeting creation', 'class meeting', 'join link', 'admin meeting', 'meeting policy'],
  }),
  vimeo_user_authorization_upload_policy: Object.freeze({
    id: 'vimeo_user_authorization_upload_policy',
    label: 'Vimeo user-level authorization/upload policy',
    owner: 'Rabbi Sheller',
    category: 'Drive/content workflow',
    missing_information: 'User-level Vimeo authorization, destination account/folder, and upload/posting policy.',
    recommended_option: 'Keep manual Vimeo references and preview upload packages until the Vimeo user token and policy are approved.',
    alternatives: [
      'Manually paste existing Vimeo links into the class library.',
      'Use local upload previews only, with no Vimeo write.',
    ],
    consequence: 'Automated upload could publish to the wrong account, expose class media, or violate the partner upload policy.',
    exact_next_action: 'Approve/install the Vimeo user authorization and document the allowed upload destination before enabling uploads.',
    dependent_module_action: 'one_time.member_library.vimeo_upload',
    patterns: ['vimeo', 'video library', 'upload policy', 'user token', 'manual vimeo', 'video host'],
  }),
  hosted_transcription_credential: Object.freeze({
    id: 'hosted_transcription_credential',
    label: 'Hosted transcription credential',
    owner: 'External owner',
    category: 'Drive/content workflow',
    missing_information: 'Valid hosted transcription credential after the previous invalid credential failure.',
    recommended_option: 'Keep transcription retry blocked until the credential is provided or rotated through the keyholder path.',
    alternatives: [
      'Use local/manual transcript upload for review-only content.',
      'Defer transcription-dependent class ingestion until credentials are repaired.',
    ],
    consequence: 'Retrying without a valid credential will fail again and can create noisy duplicate agent work.',
    exact_next_action: 'Provide or rotate the hosted transcription credential, then rerun the specific blocked transcription job.',
    dependent_module_action: 'one_time.content.hosted_transcription',
    patterns: ['transcription', 'transcript credential', 'invalid_credential', '401', 'hosted transcript'],
  }),
  separate_railway_domain_paused: Object.freeze({
    id: 'separate_railway_domain_paused',
    label: 'Separate Railway/domain paused',
    owner: 'Both',
    category: 'Landing pages',
    missing_information: 'Operator approval to resume separate Railway service, database, DNS, and domain provisioning.',
    recommended_option: 'Keep the One Time review on the shared scoped app until Shloimie explicitly resumes separate-instance work.',
    alternatives: [
      'Prepare a dry-run provisioning package only.',
      'Continue using the shared review URLs for UI review.',
    ],
    consequence: 'Provisioning early can create topology drift, DNS confusion, or a partially owned partner deployment.',
    exact_next_action: 'Get explicit approval to resume the separate Railway/domain requirement before any provisioning or DNS work.',
    dependent_module_action: 'one_time.deployment.separate_instance',
    patterns: ['railway', 'separate instance', 'join.onetimeonetime.com', 'dns hookup', 'domain provisioning'],
  }),
  ghl_leadconnector_conflict: Object.freeze({
    id: 'ghl_leadconnector_conflict',
    label: 'GHL/LeadConnector policy conflict',
    owner: 'Developer/agent',
    category: 'GHL setup',
    missing_information: 'A current source-of-truth change explicitly authorizing active GHL/LeadConnector runtime.',
    recommended_option: 'Keep GHL/LeadConnector out of the active runtime and route contacts through first-party BNA Operations.',
    alternatives: [
      'Archive or annotate legacy GHL references as historical only.',
      'Create a decision only if Shloimie explicitly changes the no-GHL runtime policy.',
    ],
    consequence: 'Adding active GHL runtime conflicts with the current no-GHL policy and can pollute contacts, tasks, and integration state.',
    exact_next_action: 'Do not wire GHL. If a new source claims GHL is active, mark it as a policy conflict until AGENTS.md/source-of-truth changes.',
    dependent_module_action: 'one_time.contacts.first_party_operations',
    patterns: ['ghl', 'gohighlevel', 'leadconnector', 'leadconnectorhq', 'legacy crm'],
    policy_conflict: true,
  }),
  generic_external_setup: Object.freeze({
    id: 'generic_external_setup',
    label: 'External setup blocker',
    owner: 'External owner',
    category: 'Tasks',
    missing_information: 'A human, account owner, credential, approval, asset, or outside service is blocking the next action.',
    recommended_option: 'Keep the item in Blocked External Setup with one owner and one exact next action.',
    alternatives: [
      'Convert to a Rabbi/Shloimie decision if the missing input is actually a product choice.',
      'Move to In Progress only after the blocker is received.',
    ],
    consequence: 'Treating external blockers as ordinary Pending or Codex work hides the real owner and stalls follow-up.',
    exact_next_action: 'Name the missing input, owner, and dependent module before integration exposes this as a human blocker.',
    dependent_module_action: 'one_time.external_setup.generic',
    patterns: ['external', 'credential', 'access', 'approval', 'permission', 'account owner', 'missing input'],
  }),
});

const LANE_BY_ID = Object.freeze(
  ONE_TIME_TASK_LANES.reduce((map, lane) => Object.assign(map, { [lane.id]: lane }), {})
);

function buildOneTimeTaskViewModel(tasks, options = {}) {
  const list = Array.isArray(tasks) ? tasks : [];
  const classifications = [];
  const duplicateSeen = new Map();
  const duplicateKeys = list.map((task) => duplicateKey(task)).filter(Boolean);
  const duplicateCounts = duplicateKeys.reduce((counts, key) => {
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  for (const task of list) {
    const key = duplicateKey(task);
    const occurrence = key ? (duplicateSeen.get(key) || 0) : 0;
    if (key) duplicateSeen.set(key, occurrence + 1);
    classifications.push(classifyOneTimeTask(task, {
      ...options,
      duplicate_key: key,
      duplicate_index: occurrence,
      duplicate_count: key ? duplicateCounts[key] || 0 : 0,
    }));
  }

  const laneItems = {};
  for (const lane of ONE_TIME_TASK_LANES) laneItems[lane.id] = [];
  const hidden = [];
  const agentActivity = [];
  const blockers = [];

  for (const classification of classifications) {
    if (classification.blocker) blockers.push(classification.blocker);
    if (classification.visible && classification.lane && laneItems[classification.lane]) {
      laneItems[classification.lane].push(classification);
      continue;
    }
    if (classification.demoted_to === 'agent_activity') {
      agentActivity.push(classification);
      continue;
    }
    hidden.push(classification);
  }

  const lanes = ONE_TIME_TASK_LANES.map((lane) => ({
    ...lane,
    items: laneItems[lane.id].sort(compareClassifications),
    count: laneItems[lane.id].length,
  }));

  return {
    scope: normalizedScope(options),
    lanes,
    lane_items: laneItems,
    blockers: uniqueBlockers(blockers),
    agent_activity: agentActivity.sort(compareClassifications),
    hidden,
    classifications,
    counts: {
      total: list.length,
      visible: lanes.reduce((sum, lane) => sum + lane.count, 0),
      hidden: hidden.length,
      agent_activity: agentActivity.length,
      blockers: uniqueBlockers(blockers).length,
    },
    dry_run_only: true,
    mutation_required: false,
    production_mutation_required: false,
    rules: Object.freeze([
      'Raw prompt titles are not shown as user tasks.',
      'tasks-pending/*.md handoffs are hidden from default human task lanes.',
      'Duplicate parser fan-out and audit-output rows are hidden by default.',
      'Pending means a true human or external blocker, not waiting for Codex.',
      'Codex/system work is demoted to agent/activity status.',
    ]),
  };
}

function classifyOneTimeTask(task, options = {}) {
  const source = task && typeof task === 'object' ? task : {};
  const scope = normalizedTaskScope(source, options);
  const parsed = parseJson(source.ai_parsed) || {};
  const rawTitle = firstText(source.title, parsed.title);
  const displayTitle = cleanDisplayTitle(source, parsed);
  const text = taskText(source, parsed);
  const stage = normalizeStage(source.stage);
  const agentStatus = normalizeAgentStatus(source.agent_status || source.effective_agent_status);
  const owner = normalizeOwner(source.assigned_to || source.decision_owner || source.waiting_on || parsed.owner);
  const category = normalizeCategory(source.category || parsed.category || inferCategory(text));
  const blocker = detectBlocker(source, parsed, options);
  const done = isDone(source, stage);
  const machine = isMachineTask(source, agentStatus);
  const decisionLike = isDecisionLike(source, stage);
  const internalReason = internalHiddenReason(source, parsed, options);
  const outOfScope = !isOneTimeScope(scope, text);
  const duplicateReason = duplicateHiddenReason(source, options);
  const rawReason = rawTitleHiddenReason(source, rawTitle, displayTitle, parsed, options);

  const base = {
    id: source.id ?? source.task_id ?? source.key ?? null,
    task: source,
    title: displayTitle || fallbackTitle(source, parsed),
    raw_title: rawTitle,
    summary: firstText(source.cleaned_summary, source.summary, parsed.display_note, parsed.summary, source.next_action, source.notes),
    owner,
    category,
    scope,
    lane: null,
    lane_label: null,
    visible: true,
    hidden_reason: null,
    demoted_to: null,
    blocker,
    is_one_time_scope: isOneTimeScope(scope, text),
    is_internal: Boolean(internalReason),
    is_duplicate: Boolean(duplicateReason),
    is_raw_prompt_title: Boolean(rawReason),
    is_machine_work: machine,
    is_decision: decisionLike,
    status: {
      stage,
      agent_status: agentStatus,
      decision_status: normalizeText(source.decision_status),
      workflow_status: normalizeText(source.workflow_status || source.status_detail),
    },
    next_action: blocker?.exact_next_action || firstText(source.next_action, source.next_action_label, parsed.next_action),
    dry_run_only: true,
    mutation_required: false,
  };

  if (outOfScope && !truthy(options.include_out_of_scope)) {
    return hide(base, 'out_of_scope');
  }
  if (internalReason && !truthy(options.include_internal)) {
    return hide(base, internalReason);
  }
  if (duplicateReason && !truthy(options.include_duplicates)) {
    return hide(base, duplicateReason);
  }
  if (rawReason && !truthy(options.include_raw_prompts)) {
    return hide(base, rawReason);
  }
  if (done) {
    return show(base, 'done_activity');
  }
  if (machine) {
    return demote(base, 'agent_activity', 'machine_work_agent_lifecycle');
  }
  if (blocker) {
    return show(base, 'blocked_external_setup');
  }
  if (needsRabbi(source, text, decisionLike)) {
    return show(base, 'needs_rabbi_decision');
  }
  if (needsShloimie(source, text, decisionLike)) {
    return show(base, 'needs_shloimie');
  }
  return show(base, 'in_progress');
}

function show(classification, laneId) {
  const lane = LANE_BY_ID[laneId];
  return {
    ...classification,
    lane: laneId,
    lane_label: lane?.label || laneId,
    visible: true,
    hidden_reason: null,
    demoted_to: null,
  };
}

function hide(classification, reason) {
  return {
    ...classification,
    lane: null,
    lane_label: null,
    visible: false,
    hidden_reason: reason,
  };
}

function demote(classification, target, reason) {
  return {
    ...classification,
    lane: null,
    lane_label: null,
    visible: false,
    hidden_reason: reason,
    demoted_to: target,
  };
}

function normalizedScope(options = {}) {
  return {
    workspace_key: normalizeWorkspaceKey(options.workspace_key || options.workspaceKey || ONE_TIME_WORKSPACE_KEY),
    project_key: normalizeProjectKey(options.project_key || options.projectKey || ONE_TIME_PROJECT_KEY),
  };
}

function normalizedTaskScope(task = {}, options = {}) {
  const fallback = normalizedScope(options);
  return {
    workspace_key: normalizeWorkspaceKey(task.workspace_key || task.workspace || task.workspace_slug || fallback.workspace_key),
    project_key: normalizeProjectKey(task.project_key || task.project || task.project_name || fallback.project_key),
  };
}

function isOneTimeScope(scope, text = '') {
  return scope.project_key === ONE_TIME_PROJECT_KEY
    || scope.workspace_key === ONE_TIME_WORKSPACE_KEY
    || /\b(one\s*time|onetime|mishnah|mishna|rabbi\s+(elie\s+)?sche?ller)\b/i.test(text);
}

function normalizeProjectKey(value) {
  const key = slug(value);
  if (!key) return ONE_TIME_PROJECT_KEY;
  if (['one_time', 'one_time_mishna', 'one_time_mishnah', 'one_time_mishna_class', 'mishna', 'mishnah', 'rabbi_sheller_provider'].includes(key)) {
    return ONE_TIME_PROJECT_KEY;
  }
  if (['bna', 'school', 'bnei_neviim', 'bnei_neviim_academy', 'academy'].includes(key)) return 'bna';
  return key;
}

function normalizeWorkspaceKey(value) {
  const key = slug(value);
  if (!key) return ONE_TIME_WORKSPACE_KEY;
  if (['one_time', 'one_time_mishna', 'one_time_mishnah', 'one_time_mishna_class', 'mishna', 'mishnah', 'rabbi_elie', 'rabbi_elie_scheller', 'rabbi_sheller', 'rabbi_scheller', 'rabbi_sheller_provider'].includes(key)) {
    return ONE_TIME_WORKSPACE_KEY;
  }
  if (['bna', 'school', 'bnei_neviim', 'bnei_neviim_academy', 'academy'].includes(key)) return 'bna';
  return key;
}

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeStage(stage) {
  const normalized = slug(stage);
  return ({
    inbox: 'raw_input',
    clarify: 'needs_decision',
    plan: 'needs_decision',
    execute: 'in_progress',
    review: 'needs_decision',
    complete: 'done',
    completed: 'done',
    archived: 'archive',
  })[normalized] || normalized || 'raw_input';
}

function normalizeAgentStatus(value) {
  const status = slug(value);
  if (['queued', 'running', 'completed', 'failed', 'blocked_needs_human_decision'].includes(status)) return status;
  if (['in_progress', 'started'].includes(status)) return 'running';
  if (['done', 'verified'].includes(status)) return 'completed';
  return status || 'none';
}

function normalizeOwner(value) {
  const raw = String(value || '').trim();
  const normalized = raw.toLowerCase();
  if (!raw) return 'Future admin';
  if (/\b(codex|kimi|system|agent|automation|machine|developer)\b/i.test(raw)) return 'Developer/agent';
  if (/\b(rabbi|elie|scheller|sheller)\b/i.test(raw)) return 'Rabbi Sheller';
  if (/\b(shloimie|shlomo|operator|manager|me|myself)\b/i.test(raw)) return 'Shloimie';
  if (/\b(both|rabbi and shloimie|shloimie and rabbi)\b/i.test(raw)) return 'Both';
  if (/\b(external|stripe|resend|vimeo|zoom|railway|dns|domain|bank|legal|account owner|provider)\b/i.test(raw)) return 'External owner';
  if (normalized === 'future admin' || normalized === 'admin') return 'Future admin';
  return raw.slice(0, 120);
}

function normalizeCategory(value) {
  const raw = String(value || '').trim();
  const slugged = slug(raw);
  const matches = {
    business_model: 'Business model',
    partnership: 'Partnership terms',
    partnership_terms: 'Partnership terms',
    pricing: 'Pricing',
    ghl: 'GHL setup',
    ghl_setup: 'GHL setup',
    payment: 'Payment processor',
    payments: 'Payment processor',
    payment_processor: 'Payment processor',
    billing: 'Payment processor',
    banking: 'Banking/admin',
    banking_admin: 'Banking/admin',
    admin: 'Banking/admin',
    landing: 'Landing pages',
    landing_pages: 'Landing pages',
    website: 'Landing pages',
    email: 'Email sequences',
    email_sequences: 'Email sequences',
    whatsapp: 'WhatsApp sequences',
    whatsapp_sequences: 'WhatsApp sequences',
    drive: 'Drive/content workflow',
    content: 'Drive/content workflow',
    drive_content_workflow: 'Drive/content workflow',
    organic_marketing: 'Organic marketing',
    marketing: 'Organic marketing',
    ads: 'Ads/ad tracking',
    ad_tracking: 'Ads/ad tracking',
    ads_ad_tracking: 'Ads/ad tracking',
    support: 'Support/ticketing',
    support_ticketing: 'Support/ticketing',
    reporting: 'Reporting/dashboard',
    dashboard: 'Reporting/dashboard',
    reporting_dashboard: 'Reporting/dashboard',
    testimonials: 'Testimonials/reputation',
    reputation: 'Testimonials/reputation',
    testimonials_reputation: 'Testimonials/reputation',
    referrals: 'Referral system',
    referral_system: 'Referral system',
    software: 'Software/IP',
    software_ip: 'Software/IP',
    ip: 'Software/IP',
    open_questions: 'Open questions',
    questions: 'Open questions',
    tasks: 'Tasks',
    operations: 'Tasks',
  };
  if (matches[slugged]) return matches[slugged];
  return ONE_TIME_TASK_CATEGORIES.includes(raw) ? raw : 'Tasks';
}

function inferCategory(text = '') {
  const lower = String(text || '').toLowerCase();
  if (/\b(stripe|checkout|billing|payment|refund|price|pricing)\b/.test(lower)) return 'Payment processor';
  if (/\b(bank|banking|accounting|admin)\b/.test(lower)) return 'Banking/admin';
  if (/\b(resend|email|sequence|sender)\b/.test(lower)) return 'Email sequences';
  if (/\b(whatsapp|wapi|whapi)\b/.test(lower)) return 'WhatsApp sequences';
  if (/\b(vimeo|zoom|drive|transcript|transcription|recording|content|class library)\b/.test(lower)) return 'Drive/content workflow';
  if (/\b(landing|page|website|domain|railway)\b/.test(lower)) return 'Landing pages';
  if (/\b(ghl|gohighlevel|leadconnector)\b/.test(lower)) return 'GHL setup';
  if (/\b(ad|ads|tracking|pixel)\b/.test(lower)) return 'Ads/ad tracking';
  if (/\b(testimonial|reputation|review)\b/.test(lower)) return 'Testimonials/reputation';
  if (/\b(referral|refer)\b/.test(lower)) return 'Referral system';
  if (/\b(partnership|revenue share|terms)\b/.test(lower)) return 'Partnership terms';
  if (/\b(model|business model)\b/.test(lower)) return 'Business model';
  if (/\b(dashboard|reporting|report)\b/.test(lower)) return 'Reporting/dashboard';
  if (/\b(support|ticket)\b/.test(lower)) return 'Support/ticketing';
  if (/\b(software|ip|intellectual property)\b/.test(lower)) return 'Software/IP';
  if (/\b(question|decide|decision|open item)\b/.test(lower)) return 'Open questions';
  return 'Tasks';
}

function detectBlocker(task = {}, parsed = {}, options = {}) {
  const text = taskText(task, parsed);
  const lower = text.toLowerCase();
  const explicit = firstText(task.blocker_type, parsed.blocker_type, parsed.blocker?.type);
  const candidates = Object.values(ONE_TIME_BLOCKER_TYPES);
  const selected = candidates.find((type) => slug(type.id) === slug(explicit))
    || candidates.find((type) => type.id !== 'generic_external_setup' && type.patterns.some((pattern) => lower.includes(pattern)));

  if (!selected && !hasExternalWaiting(task)) return null;
  if (selected?.id === 'ghl_leadconnector_conflict' && truthy(options.allow_ghl_runtime)) return null;
  const type = selected || ONE_TIME_BLOCKER_TYPES.generic_external_setup;
  const ownerText = firstText(task.waiting_on, task.decision_owner, parsed.owner);
  const owner = ownerText ? normalizeOwner(ownerText) : type.owner;
  return {
    id: type.id,
    type: type.id,
    label: type.label,
    category: type.category,
    missing_information: firstText(parsed.missing_information, parsed.blocker?.missing_information, task.missing_information, type.missing_information),
    owner: isExternalOwner(type.owner) ? type.owner : owner || type.owner,
    recommended_option: firstText(parsed.recommended_option, parsed.blocker?.recommended_option, type.recommended_option),
    alternatives: Array.isArray(parsed.alternatives) && parsed.alternatives.length ? parsed.alternatives : [...type.alternatives],
    consequence: firstText(parsed.consequence, parsed.blocker?.consequence, type.consequence),
    exact_next_action: firstText(task.next_action, parsed.next_action, parsed.blocker?.exact_next_action, type.exact_next_action),
    dependent_module_action: firstText(parsed.dependent_module_action, parsed.blocker?.dependent_module_action, task.action_key, type.dependent_module_action),
    policy_conflict: Boolean(type.policy_conflict),
  };
}

function isExternalOwner(owner) {
  return owner === 'External owner' || owner === 'Both' || owner === 'Developer/agent';
}

function hasExternalWaiting(task = {}) {
  const waiting = String(task.waiting_on || task.blocked_reason || task.status_detail || '').toLowerCase();
  return /\b(external|credential|access|permission|approval|account|owner|stripe|resend|vimeo|zoom|railway|dns|domain|bank|legal)\b/.test(waiting)
    && !/\b(codex|agent|system|kimi|automation)\b/.test(waiting);
}

function needsRabbi(task = {}, text = '', decisionLike = false) {
  const people = `${task.assigned_to || ''} ${task.waiting_on || ''} ${task.decision_owner || ''} ${text}`.toLowerCase();
  if (/\b(rabbi|elie|scheller|sheller)\b/.test(String(task.waiting_on || task.decision_owner || '').toLowerCase())) return true;
  return (decisionLike || /\b(waiting|needs|need|decision|approve|approval|confirm)\b/.test(people))
    && /\b(rabbi|elie|scheller|sheller)\b/.test(people);
}

function needsShloimie(task = {}, text = '', decisionLike = false) {
  const people = `${task.assigned_to || ''} ${task.waiting_on || ''} ${task.decision_owner || ''} ${text}`.toLowerCase();
  if (/\b(shloimie|shlomo|operator|manager|me|myself)\b/.test(String(task.assigned_to || task.waiting_on || task.decision_owner || '').toLowerCase())) return true;
  return (decisionLike || /\b(waiting|needs|need|decision|approve|approval|confirm|assigned)\b/.test(people))
    && /\b(shloimie|shlomo|operator|manager|me|myself)\b/.test(people);
}

function isDone(task = {}, stage = normalizeStage(task.stage)) {
  return Boolean(task.completed_at || task.verified_at || task.archived_at || task.duplicate_archived_at)
    || ['done', 'archive'].includes(stage)
    || ['done', 'decided'].includes(slug(task.decision_status))
    || slug(task.task_kind) === 'history';
}

function isDecisionLike(task = {}, stage = normalizeStage(task.stage)) {
  return slug(task.task_kind) === 'decision'
    || slug(task.item_type) === 'decision'
    || stage === 'needs_decision'
    || truthy(task.decision_required)
    || Boolean(String(task.decision_status || '').trim());
}

function isMachineTask(task = {}, agentStatus = normalizeAgentStatus(task.agent_status || task.effective_agent_status)) {
  const owner = `${task.assigned_to || ''} ${task.owner || ''} ${task.agent_name || ''}`.toLowerCase();
  return slug(task.task_kind) === 'agent_job'
    || /\b(codex|kimi|system|agent|automation|machine|developer)\b/.test(owner)
    || ['queued', 'running', 'failed', 'blocked_needs_human_decision'].includes(agentStatus);
}

function internalHiddenReason(task = {}, parsed = {}, options = {}) {
  const text = taskText(task, parsed).toLowerCase();
  const source = `${task.source || ''} ${task.source_path || ''} ${task.source_ref || ''} ${parsed.source_path || ''}`.toLowerCase();
  if (truthy(options.include_internal)) return null;
  if (/tasks-pending[\\/]/i.test(source) || /tasks-pending[\\/]/i.test(text)) return 'internal_tasks_pending_handoff';
  if (/\b(planned briefs?|pending briefs?|implementation briefs?|handoff brief|codex handoff)\b/.test(text)) return 'internal_handoff_brief';
  if (/\b(audit output|watchdog audit|generated audit|task-decision census|route inventory|coverage report)\b/.test(text)) return 'audit_output_not_human_task';
  if (['audit_output', 'internal_handoff', 'system_audit', 'watchdog', 'raw_intake'].includes(slug(task.task_kind))) return 'internal_system_record';
  return null;
}

function duplicateHiddenReason(task = {}, options = {}) {
  if (truthy(options.include_duplicates)) return null;
  if (task.duplicate_of_task_id || task.canonical_task_id || task.duplicate_archived_at || slug(task.decision_status) === 'stale') {
    return 'duplicate_or_superseded';
  }
  if (options.duplicate_key && options.duplicate_count > 1 && options.duplicate_index > 0) {
    return 'duplicate_parser_fanout';
  }
  return null;
}

function rawTitleHiddenReason(task = {}, rawTitle = '', displayTitle = '', parsed = {}, options = {}) {
  if (truthy(options.include_raw_prompts)) return null;
  if (!rawTitleLooksRaw(rawTitle)) return null;
  if (displayTitle && displayTitle !== rawTitle && !rawTitleLooksRaw(displayTitle)) return null;
  if (firstText(task.cleaned_summary, task.summary, parsed.display_note)) return null;
  return 'raw_prompt_title';
}

function rawTitleLooksRaw(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const lower = text.toLowerCase();
  if (!text) return false;
  if (text.length > 150) return true;
  if (/\b(umm+|uh+|you know|voice note|ramble|i want you to|i need you to|what i want you to do|can you|could you|please|i don't know)\b/.test(lower)) return true;
  if (text.length > 95 && (lower.match(/\b(and|also|then|so)\b/g) || []).length >= 4) return true;
  return false;
}

function cleanDisplayTitle(task = {}, parsed = {}) {
  const display = firstText(task.display_title, task.clean_title, parsed.display_title, parsed.clean_title);
  if (display && !rawTitleLooksRaw(display)) return limitText(display, 140);
  const title = firstText(task.title, parsed.title);
  if (title && !rawTitleLooksRaw(title)) return limitText(title, 140);
  return display ? limitText(display, 140) : '';
}

function fallbackTitle(task = {}, parsed = {}) {
  const text = firstText(task.display_title, parsed.display_title, task.cleaned_summary, task.summary, parsed.summary, task.next_action, task.title);
  if (!text) return 'Review One Time task';
  if (rawTitleLooksRaw(text)) return 'Review captured One Time task';
  return limitText(text, 140);
}

function duplicateKey(task = {}) {
  const explicit = firstText(task.dedupe_key, task.canonical_key, task.source_statement_id);
  if (explicit) return `explicit:${slug(explicit)}`;
  const kind = slug(task.task_kind || task.item_type || 'task');
  const source = slug(task.source || task.source_ref || '');
  if (!['parser_fanout', 'audit_output', 'raw_intake', 'system_audit'].includes(kind) && !/(parser|audit|watchdog)/.test(source)) {
    return '';
  }
  const title = slug(task.display_title || task.title || task.summary || task.notes);
  const scope = `${normalizeWorkspaceKey(task.workspace_key || task.workspace)}:${normalizeProjectKey(task.project_key || task.project)}`;
  return title ? `${scope}:${kind}:${title}` : '';
}

function compareClassifications(a, b) {
  const priorityA = priorityRank(a.task);
  const priorityB = priorityRank(b.task);
  if (priorityA !== priorityB) return priorityA - priorityB;
  const dateA = Date.parse(a.task.due_date || a.task.planned_at || a.task.updated_at || a.task.created_at || 0);
  const dateB = Date.parse(b.task.due_date || b.task.planned_at || b.task.updated_at || b.task.created_at || 0);
  return (Number.isFinite(dateB) ? dateB : 0) - (Number.isFinite(dateA) ? dateA : 0);
}

function priorityRank(task = {}) {
  return ({ urgent: 0, today: 1, this_week: 2, low: 3 })[slug(task.urgency)] ?? 2;
}

function uniqueBlockers(blockers = []) {
  const seen = new Set();
  const result = [];
  for (const blocker of blockers.filter(Boolean)) {
    const key = `${blocker.type}:${blocker.owner}:${blocker.dependent_module_action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(blocker);
  }
  return result;
}

function taskText(task = {}, parsed = {}) {
  return [
    task.title,
    task.display_title,
    task.summary,
    task.cleaned_summary,
    task.notes,
    task.why_exists,
    task.next_action,
    task.blocked_reason,
    task.waiting_on,
    task.decision_owner,
    task.source,
    task.source_path,
    task.source_ref,
    task.original_raw_message,
    task.raw_message,
    parsed.title,
    parsed.summary,
    parsed.context,
    parsed.original_text,
    parsed.blocker,
    parsed.blocker?.type,
  ].filter(Boolean).join(' ');
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch (error) {
    return {};
  }
}

function firstText(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return '';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function limitText(value, max = 140) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 3)).trim()}...`;
}

function truthy(value) {
  return value === true || /^(1|true|yes|y)$/i.test(String(value || ''));
}

module.exports = {
  buildOneTimeTaskViewModel,
  classifyOneTimeTask,
  ONE_TIME_TASK_LANES,
  ONE_TIME_BLOCKER_TYPES,
  ONE_TIME_TASK_OWNERS,
  ONE_TIME_TASK_CATEGORIES,
};
