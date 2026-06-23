const { getAction } = require('../actions/registry');
const {
  hasDirectReplyInsteadOfCodexIntent,
} = require('./telegram-direct-reply-guard');

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalized(value) {
  return compact(value).toLowerCase();
}

function looksLikeCodeOrSystemDevelopment(text = '') {
  const value = normalized(text);
  if (!value) return false;
  const devObject = /\b(repo|code|files?|server|server\.js|database|schema|migration|railway|deploy|tests?|smoke|lighthouse|playwright|browser automation|telegram bridge|parser|routing|endpoint|api route|css|html|javascript|bug|fix the app|implementation|codex)\b/.test(value);
  const devVerb = /\b(build|fix|wire|implement|edit|change|update|deploy|run|test|verify|debug|inspect|refactor|migrate|patch|create)\b/.test(value);
  return devObject && devVerb;
}

function extractTaskId(text = '') {
  const match = String(text).match(/\b(?:task|#)\s*#?\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function extractContentJobId(text = '') {
  const value = String(text || '');
  const explicit = value.match(/\b(?:content\s*)?(?:job|item|library\s*item)\s*#?\s*(\d+)\b/i);
  if (explicit) return Number(explicit[1]);
  const fallback = value.match(/\b#\s*(\d+)\b/);
  return fallback ? Number(fallback[1]) : null;
}

function extractOutputId(text = '') {
  const match = String(text).match(/\b(?:output|newsletter|draft)\s*#?\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function extractDateTime(text = '') {
  const value = String(text);
  const iso = value.match(/\b(20\d{2}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2}))?\b/);
  if (iso) return `${iso[1]}T${iso[2] || '09:00'}:00`;
  const slash = value.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?\b/i);
  if (slash) {
    let hour = Number(slash[4] || 9);
    const minute = slash[5] || '00';
    const meridiem = String(slash[6] || '').toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minute}:00`;
  }
  return '';
}

function extractProviderId(text = '') {
  const match = String(text || '').match(/\b(?:provider|profile)\s*#?\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function extractGoogleBusinessUrl(text = '') {
  const urls = String(text || '').match(/https?:\/\/[^\s<>"')]+/gi) || [];
  return urls.find((url) => /google|maps\.app\.goo\.gl|g\.page|goo\.gl\/maps/i.test(url)) || '';
}

function extractFirstUrl(text = '') {
  return (String(text || '').match(/https?:\/\/[^\s<>"')]+/i) || [])[0] || '';
}

function extractEmailAddress(text = '') {
  return (String(text || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
}

function extractPhoneNumber(text = '') {
  const match = String(text || '').match(/(?:\+?\d[\d\s().-]{6,}\d)/);
  return match ? compact(match[0]) : '';
}

function extractContactHistoryName(text = '') {
  const value = compact(text);
  const patterns = [
    /\b(?:history|messages?|conversation|thread|touchpoints?)\s+(?:for|from|with)\s+(.+)$/i,
    /\b(?:for|from|with)\s+(.+?)\s+(?:history|messages?|conversation|thread|touchpoints?)\b/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match?.[1]) continue;
    const candidate = compact(match[1])
      .replace(/[?!.]+$/g, '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
      .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, '')
      .trim();
    if (candidate && candidate.length >= 2) return candidate.slice(0, 160);
  }
  return '';
}

function extractGooglePlaceId(text = '') {
  const explicit = String(text || '').match(/\b(?:place[_\s-]?id|placeid)\s*[:=]\s*([A-Za-z0-9_-]{10,220})/i)?.[1];
  if (explicit) return explicit;
  const queryParam = String(text || '').match(/[?&](?:place_id|placeid)=([^&#\s]+)/i)?.[1];
  return queryParam ? decodeURIComponent(queryParam) : '';
}

function titleAfterKeyword(text = '', keywordPattern, fallback = '') {
  const value = compact(text);
  const match = value.match(keywordPattern);
  if (match?.[1]) return compact(match[1]).slice(0, 220);
  return fallback || value.slice(0, 220);
}

function extractClassroomTopicName(text = '') {
  const value = compact(text);
  const patterns = [
    /\b(?:under|in|into|to)\s+(?:the\s+)?(?:classroom\s+)?topic\s+["'`]?([^"'`|.,]+)["'`]?/i,
    /\btopic\s*[:=-]\s*["'`]?([^"'`|.,]+)["'`]?/i,
    /\btopic\s+["'`]?([^"'`|.,]+)["'`]?/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match?.[1]) continue;
    const candidate = compact(match[1].replace(/\s+\bfor\s+(?:course|class)\b.*$/i, ''));
    if (!candidate || /^(right|correct|best|proper|the right|right topic)$/i.test(candidate)) continue;
    return candidate.slice(0, 120);
  }
  return '';
}

function extractClassroomCourseName(text = '') {
  const value = compact(text);
  const patterns = [
    /\b(?:for|in|inside)\s+(?:course|class)\s+["'`]?([^"'`|.,]+)["'`]?/i,
    /\b(?:course|class)\s*[:=-]\s*["'`]?([^"'`|.,]+)["'`]?/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match?.[1]) continue;
    const candidate = compact(match[1].replace(/\s+\b(?:under|in|into|to)\s+(?:the\s+)?(?:classroom\s+)?topic\b.*$/i, ''));
    if (candidate) return candidate.slice(0, 180);
  }
  return '';
}

function extractClassroomMaterialTitle(text = '') {
  const value = compact(text);
  const match = value.match(/\b(?:material|worksheet|source[-\s]?sheet|video|link|doc|document)\b\s*(?:called|titled|named|for|:|-)?\s*([^|]+?)(?:\s+\b(?:under|in|into|to)\s+(?:the\s+)?(?:classroom\s+)?topic\b|\s+\bfor\s+(?:course|class)\b|https?:\/\/|$)/i);
  if (match?.[1]) return compact(match[1]).slice(0, 180);
  return '';
}

function extractDecisionOptionLabel(text = '') {
  const value = compact(text);
  const direct = value.match(/\b(?:add|append)\s+(?:a\s+)?(?:decision\s+)?option\s+["'`]?(.+?)["'`]?\s+(?:to|for|on)\s+task\b/i);
  if (direct?.[1]) return compact(direct[1]).slice(0, 140);
  const asOption = value.match(/\b(?:add|append)\s+["'`]?(.+?)["'`]?\s+as\s+(?:a\s+)?(?:decision\s+)?option\s+(?:to|for|on)\s+task\b/i);
  if (asOption?.[1]) return compact(asOption[1]).slice(0, 140);
  return '';
}

function extractWorkspaceKey(text = '') {
  const value = normalized(text);
  if (/\b(one time|one-time|mishnah|mishna|rabbi|sheller)\b/.test(value)) return 'one_time_mishnah_class';
  if (/\b(bna|school|academy|bnei neviim)\b/.test(value)) return 'bna';
  if (/\bplatform\b/.test(value)) return 'platform';
  const match = compact(text).match(/\b(?:workspace|project)\s+([a-z0-9 _-]{2,80})\b/i);
  return match?.[1] ? compact(match[1]).toLowerCase().replace(/[\s-]+/g, '_') : '';
}

function extractClassCount(text = '') {
  const value = compact(text);
  const numeric = value.match(/\b(\d{1,2})[\s-]*(?:classes|class sessions|class|sessions|weeks|meetings|shiurim|lessons)\b/i);
  if (numeric) return Math.max(1, Math.min(Number(numeric[1]), 52));
  const words = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    twelve: 12,
  };
  const word = value.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve)[\s-]*(?:classes|class sessions|class|sessions|weeks|meetings|shiurim|lessons)\b/i)?.[1];
  return word ? words[word.toLowerCase()] : undefined;
}

function providerClassroomInputs(text = '') {
  const value = normalized(text);
  const privateReplies = /\b(private|privately|directly to (?:rabbi|teacher|provider))\b/.test(value);
  const publicDisplay = /\b(public|community display|publish(?:es|ed|ing)?|featured|show selected)\b/.test(value);
  const noStudentChat = /\b(no student[-\s]?student|no open chat|no group chat|private only)\b/.test(value);
  return {
    title: titleAfterKeyword(text, /\b(?:start|open|create|make|set up|setup|launch)\b\s*(?:a\s*)?(?:provider\s*)?(?:classroom|learning community|community|course)\s*(?:for|:|-)?\s*([\s\S]+)$/i, 'Provider classroom setup draft'),
    raw_prompt: text,
    class_count: extractClassCount(text),
    community_dialogue_style: privateReplies
      ? 'Rabbi/teacher-led Q&A with private student replies'
      : /\bdiscussion|dialogue|community\b/.test(value)
        ? 'Moderated community dialogue'
        : 'Guided classroom Q&A',
    student_access: /\b(member|membership|participants?)\b/.test(value)
      ? 'Provider members/participants after BNA admin review'
      : 'Provider-managed students/members after BNA admin review',
    display_rules: publicDisplay
      ? 'Only teacher-approved replies/questions may be published to the public/community display'
      : 'Internal classroom first; public/community display remains off until approved',
    message_permissions: noStudentChat || privateReplies
      ? 'Students may reply privately to the teacher; no student-to-student chat unless explicitly enabled'
      : 'Teacher-moderated replies; student-to-student chat disabled by default',
    student_to_teacher_replies: true,
    student_to_student_chat_enabled: false,
    teacher_moderation_required: true,
    public_display_enabled: publicDisplay,
    workspace_key: extractWorkspaceKey(text) || 'one_time_mishnah_class',
  };
}

function extractRabbiContentTitle(text = '') {
  const value = compact(text);
  const match = value.match(/\b(?:shiur idea|shiur topic|class idea|topic idea|source[-\s]?sheet(?:\s+task)?|source task)\b\s*(?:about|for|on|:|-)?\s*(.+)$/i);
  if (match?.[1]) return compact(match[1]).slice(0, 220);
  return value.slice(0, 220);
}

function extractReferralParts(text = '') {
  const value = compact(text);
  const forFrom = value.match(/\breferral(?:\s+ledger\s+entry|\s+entry)?\b.*?\bfor\s+(.+?)\s+\bfrom\s+(.+)$/i);
  if (forFrom) {
    return {
      referred_name: compact(forFrom[1]).slice(0, 160),
      referrer_name: compact(forFrom[2]).slice(0, 160),
    };
  }
  const fromTo = value.match(/\breferral(?:\s+ledger\s+entry|\s+entry)?\b.*?\bfrom\s+(.+?)\s+\b(?:to|for)\s+(.+)$/i);
  if (fromTo) {
    return {
      referrer_name: compact(fromTo[1]).slice(0, 160),
      referred_name: compact(fromTo[2]).slice(0, 160),
    };
  }
  return { referred_name: '', referrer_name: '' };
}

function extractModeratedQuestionText(text = '') {
  const value = compact(text);
  const colon = value.match(/\b(?:question|moderation)\s*[:=-]\s*(.+)$/i);
  if (colon?.[1]) return compact(colon[1]).slice(0, 1800);
  const tail = value.match(/\b(?:submit|file|capture|add|create|moderate)\b.{0,60}\bquestion\b(?:\s+(?:for|to)\s+(?:moderation|rabbi review|private review))?\s*(?:about|on|:|-)?\s*(.+)$/i);
  if (tail?.[1]) return compact(tail[1]).slice(0, 1800);
  return value.slice(0, 1800);
}

function extractModerationReviewStatus(text = '') {
  const value = normalized(text);
  const explicit = value.match(/\b(?:as|to|status)\s+(approved for rabbi|needs source sheet|needs parent safe response|needs member safe response|needs clarification|duplicate grouped|rejected private|needs review|approved|rejected|duplicate)\b/);
  if (explicit?.[1]) return explicit[1].replace(/\s+/g, '_');
  if (/\bsource[-\s]?sheet\b/.test(value)) return 'needs_source_sheet';
  if (/\bapproved?\b.{0,30}\brabbi\b|\brabbi\b.{0,30}\bapproved?\b/.test(value)) return 'approved_for_rabbi';
  if (/\bclarif/.test(value)) return 'needs_clarification';
  if (/\bduplicate\b/.test(value)) return 'duplicate_grouped';
  if (/\breject|keep private|private only\b/.test(value)) return 'rejected_private';
  if (/\b(parent|member)[-\s]?safe response|draft response\b/.test(value)) return 'needs_parent_safe_response';
  return '';
}

function extractSocialChannels(text = '') {
  const value = normalized(text);
  const channels = [];
  const add = (channel) => {
    if (!channels.includes(channel)) channels.push(channel);
  };
  if (/\bfacebook\b|\bfb\b/.test(value)) add('facebook');
  if (/\blinkedin\b|\blinked\s*in\b/.test(value)) add('linkedin');
  if (/\byoutube\b|\byou\s*tube\b|\bshorts?\b/.test(value)) add('youtube');
  return channels;
}

function extractSocialPostCount(text = '') {
  const value = normalized(text);
  const numbered = value.match(/\b(?:make|create|draft|schedule|queue|preview)?\s*(\d{1,2})\s+(?:social\s+)?posts?\b/);
  if (numbered) return Math.min(Number(numbered[1]), 14);
  if (/\bone\s+(?:post\s+)?per\s+day\s+this\s+week\b/.test(value)) return 7;
  return undefined;
}

function socialScheduleCadence(text = '') {
  const value = normalized(text);
  if (/\b(per\s+day|daily|each\s+day|every\s+day)\b/.test(value)) return 'daily';
  return 'single';
}

function classifyTelegramActionRequest(input = {}) {
  const text = compact(typeof input === 'string' ? input : input.text);
  const value = normalized(text);
  const intentPlan = input.intentPlan || {};
  if (!text) return { kind: 'normal_chat', confidence: 0, reason: 'empty' };
  const intentBlocksCodex = Array.isArray(intentPlan.blockedHandlers) && intentPlan.blockedHandlers.includes('codex');
  if (hasDirectReplyInsteadOfCodexIntent(text) || (intentPlan.primaryIntent === 'conversation' && intentBlocksCodex)) {
    return { kind: 'normal_chat', confidence: 0.96, reason: 'direct_reply_requested_instead_of_codex' };
  }
  if (looksLikeCodeOrSystemDevelopment(text) || intentPlan.primaryIntent === 'codex_work' || intentPlan.primaryIntent === 'browser_test') {
    return { kind: 'codex_development', confidence: 0.9, reason: 'code_or_system_development_request' };
  }

  const outputId = extractOutputId(text);
  const contactHistoryRequest = /\b(show|find|get|lookup|preview|pull|read)\b.{0,70}\b(whatsapp|wapi|communication|communications|message|messages|conversation|thread|touchpoints?|contact)\b.{0,80}\b(history|messages?|conversation|thread|touchpoints?)\b/.test(value)
    || /\b(whatsapp|wapi|communication|communications|message|messages|conversation|thread|touchpoints?)\b.{0,80}\b(history|messages?|conversation|thread|touchpoints?)\b.{0,60}\b(for|from|with)\b/.test(value);
  if (contactHistoryRequest) {
    return {
      kind: 'typed_action',
      action_id: 'show_contact_communication_history',
      confidence: 0.9,
      dry_run: true,
      inputs: {
        phone: extractPhoneNumber(text) || undefined,
        email: extractEmailAddress(text) || undefined,
        contact_name: extractContactHistoryName(text) || undefined,
      },
      reason: 'contact_communication_history_lookup',
    };
  }

  if (/\b(refine|revise|polish|tighten|clean up|rewrite|improve)\b.{0,80}\b(newsletter|weekly update|parent update)\b/.test(value)
    || /\b(newsletter|weekly update|parent update)\b.{0,80}\b(refine|revise|polish|tighten|clean up|rewrite|improve)\b/.test(value)) {
    return {
      kind: 'typed_action',
      action_id: 'refine_newsletter_draft',
      confidence: 0.92,
      dry_run: false,
      inputs: {
        output_id: outputId || undefined,
        instruction: text,
        save_revision: true,
      },
      reason: 'newsletter_refinement',
    };
  }

  if (/\b(find|open|show|get)\b.{0,50}\b(newsletter|weekly update|parent update)\b/.test(value)) {
    return {
      kind: 'typed_action',
      action_id: 'find_latest_newsletter_draft',
      confidence: 0.86,
      dry_run: false,
      inputs: { output_id: outputId || undefined },
      reason: 'newsletter_lookup',
    };
  }

  if (/\b(draft|write|compose|create)\b.{0,80}\b(email|e-mail)\b/.test(value)
    || /\b(email|e-mail)\b.{0,80}\b(draft|copy|version)\b/.test(value)) {
    return {
      kind: 'typed_action',
      action_id: /\b(newsletter|weekly update|parent update)\b/.test(value) ? 'draft_email_from_newsletter' : 'draft_email',
      confidence: 0.88,
      dry_run: false,
      inputs: {
        source_text: text,
        subject: titleAfterKeyword(text, /\bsubject\s*[:=-]\s*([^|]+)/i, ''),
        audience: /\brabbi|sheller|mishnayos|mishnah|member|participant\b/.test(value) ? 'Rabbi Sheller participants' : 'BNA parents/students',
      },
      reason: 'email_draft',
    };
  }

  if (
    !/\bpublish\s+now\b/.test(value)
    && (
      /\b(schedule|queue|commit|buffer|preview)\b.{0,100}\b(facebook|fb|linkedin|youtube|social|posts?|buffer)\b/.test(value)
      || /\bmake\b.{0,20}\b\d{1,2}\s+(?:social\s+)?posts?\b.{0,100}\b(video|clip|recording|facebook|fb|linkedin|youtube|social)\b/.test(value)
      || /\bone\s+(?:post\s+)?per\s+day\s+this\s+week\b/.test(value)
    )
  ) {
    return {
      kind: 'typed_action',
      action_id: 'preview_social_schedule_package',
      confidence: 0.84,
      dry_run: true,
      inputs: {
        source_text: text,
        channels: extractSocialChannels(text),
        post_count: extractSocialPostCount(text) || undefined,
        schedule_start: extractDateTime(text) || undefined,
        cadence: socialScheduleCadence(text),
        source_url: extractFirstUrl(text) || undefined,
        workspace_key: extractWorkspaceKey(text) || undefined,
      },
      reason: 'social_schedule_package_preview',
    };
  }

  if (/\b(retitle|rename|clean up|rewrite)\b.{0,45}\btask\b/.test(value) && extractTaskId(text)) {
    const titleMatch = text.match(/\b(?:to|as|title)\s+["'`]?(.+?)["'`]?$/i);
    return {
      kind: 'typed_action',
      action_id: 'retitle_task_naturally',
      confidence: titleMatch?.[1] ? 0.86 : 0.64,
      dry_run: true,
      inputs: {
        task_id: extractTaskId(text),
        new_title: titleMatch?.[1] ? compact(titleMatch[1]).slice(0, 180) : undefined,
        reason: text,
      },
      reason: titleMatch?.[1] ? 'task_retitle' : 'task_retitle_needs_new_title',
    };
  }

  if (/\b(?:add|append)\b.{0,40}\b(?:decision\s+)?option\b.{0,80}\btask\b/.test(value) && extractTaskId(text)) {
    return {
      kind: 'typed_action',
      action_id: 'add_decision_option',
      confidence: extractDecisionOptionLabel(text) ? 0.86 : 0.62,
      dry_run: true,
      inputs: {
        task_id: extractTaskId(text),
        option_label: extractDecisionOptionLabel(text) || undefined,
        reason: text,
      },
      reason: extractDecisionOptionLabel(text) ? 'decision_option_preview' : 'decision_option_needs_label',
    };
  }

  if (
    /\b(start|open|create|make|set up|setup|launch)\b.{0,90}\b(classroom|learning community|community|course)\b/.test(value)
    && /\b(provider|service provider|rabbi|sheller|scheller|one time|mishnah|mishna|member|student|class)\b/.test(value)
  ) {
    return {
      kind: 'typed_action',
      action_id: 'create_provider_classroom_draft',
      confidence: 0.86,
      dry_run: true,
      inputs: providerClassroomInputs(text),
      reason: 'provider_classroom_setup_preview',
    };
  }

  if (
    /\b(create|add|capture|make|file|prepare)\b.{0,90}\b(one time|one-time|mishnah|mishna|rabbi|sheller)\b.{0,100}\b(shiur idea|shiur topic|class idea|topic idea)\b/.test(value)
    || /\b(shiur idea|shiur topic|class idea|topic idea)\b.{0,100}\b(one time|one-time|mishnah|mishna|rabbi|sheller)\b/.test(value)
  ) {
    return {
      kind: 'typed_action',
      action_id: 'create_rabbi_shiur_idea',
      confidence: 0.84,
      dry_run: true,
      inputs: {
        title: extractRabbiContentTitle(text),
        topic: extractRabbiContentTitle(text),
        summary: text,
      },
      reason: 'rabbi_shiur_idea_preview',
    };
  }

  if (
    /\b(create|add|capture|make|file|prepare)\b.{0,90}\b(one time|one-time|mishnah|mishna|rabbi|sheller)\b.{0,120}\bsource[-\s]?sheet(?:\s+task)?\b/.test(value)
    || /\bsource[-\s]?sheet(?:\s+task)?\b.{0,120}\b(one time|one-time|mishnah|mishna|rabbi|sheller)\b/.test(value)
  ) {
    return {
      kind: 'typed_action',
      action_id: 'create_rabbi_source_sheet_task',
      confidence: 0.84,
      dry_run: true,
      inputs: {
        title: extractRabbiContentTitle(text),
        topic: extractRabbiContentTitle(text),
        summary: text,
      },
      reason: 'rabbi_source_sheet_task_preview',
    };
  }

  if (/\b(create|add|log|capture|file)\b.{0,80}\breferral\b.{0,80}\b(ledger|entry|lead|review)\b/.test(value)
    || /\breferral\b.{0,80}\b(ledger|entry|lead|review)\b/.test(value)) {
    const referral = extractReferralParts(text);
    const title = [
      'Referral review',
      referral.referred_name ? `for ${referral.referred_name}` : '',
      referral.referrer_name ? `from ${referral.referrer_name}` : '',
    ].filter(Boolean).join(' ');
    return {
      kind: 'typed_action',
      action_id: 'create_referral_ledger_entry',
      confidence: 0.84,
      dry_run: true,
      inputs: {
        title: title || titleAfterKeyword(text, /\breferral(?:\s+ledger\s+entry|\s+entry|\s+lead)?\b\s*(?:for|:|-)?\s*(.+)$/i, text),
        referred_name: referral.referred_name || undefined,
        referrer_name: referral.referrer_name || undefined,
        notes: text,
      },
      reason: 'referral_ledger_preview',
    };
  }

  if (/\b(review|mark|record)\b.{0,80}\bmoderated\s+question\b/.test(value) && extractTaskId(text)) {
    const reviewStatus = extractModerationReviewStatus(text);
    return {
      kind: 'typed_action',
      action_id: 'review_moderated_question',
      confidence: reviewStatus ? 0.86 : 0.64,
      dry_run: true,
      inputs: {
        task_id: extractTaskId(text),
        review_status: reviewStatus || undefined,
        review_notes: text,
      },
      reason: reviewStatus ? 'moderated_question_review_preview' : 'moderated_question_review_needs_status',
    };
  }

  if (/\b(submit|file|capture|add|create|moderate)\b.{0,90}\b(student|member|one time|one-time|rabbi|private)?\s*question\b.{0,90}\b(moderation|moderated|rabbi review|private review)\b/.test(value)
    || /\b(question)\b.{0,70}\b(for moderation|for rabbi review|private review)\b/.test(value)) {
    const questionText = extractModeratedQuestionText(text);
    return {
      kind: 'typed_action',
      action_id: 'submit_student_question_for_moderation',
      confidence: questionText ? 0.84 : 0.62,
      dry_run: true,
      inputs: {
        question_text: questionText || undefined,
        title: questionText ? `Moderate question: ${questionText.slice(0, 120)}` : undefined,
        context: text,
      },
      reason: questionText ? 'student_question_moderation_preview' : 'student_question_moderation_needs_question',
    };
  }

  if (
    /\b(preview|check|prepare|review)\b.{0,90}\b(one time|one-time|mishnah|mishna|rabbi|sheller)?\b.{0,90}\b(member[-\s]?library|publish(?:ing)? package|publishing blockers|package preview)\b/.test(value)
    || /\b(member[-\s]?library|publish(?:ing)? package|publishing blockers|package preview)\b.{0,120}\b(one time|one-time|mishnah|mishna|rabbi|sheller)\b/.test(value)
  ) {
    const contentJobId = extractContentJobId(text);
    return {
      kind: 'typed_action',
      action_id: 'preview_one_time_member_library_publish_package',
      confidence: contentJobId ? 0.84 : 0.58,
      dry_run: true,
      inputs: {
        content_job_id: contentJobId || undefined,
        title: contentJobId ? `One Time content job #${contentJobId}` : undefined,
        project_key: 'one_time_mishnah_class',
        workspace_key: 'rabbi_sheller_provider',
        source_url: extractFirstUrl(text) || undefined,
        notification_plan: 'no-send until separately approved',
      },
      reason: contentJobId ? 'one_time_member_library_publish_package_preview' : 'one_time_publish_package_needs_content_job_id',
    };
  }

  if (
    /\b(create|add|make|capture|prepare)\b.{0,80}\b(one time|mishnah|mishna|rabbi|sheller)\b.{0,100}\b(video library|library item|library card|video card|recording card)\b/.test(value)
    || /\b(video library|library item|library card|video card|recording card)\b.{0,100}\b(one time|mishnah|mishna|rabbi|sheller)\b/.test(value)
  ) {
    return {
      kind: 'typed_action',
      action_id: 'create_one_time_video_library_item',
      confidence: 0.84,
      dry_run: true,
      inputs: {
        title: titleAfterKeyword(text, /\b(?:video library item|library item|library card|video card|recording card|for)\b\s*(?:for|:|-)?\s*([^|]+?)(?:\s+https?:\/\/|$)/i, text),
        source_url: extractFirstUrl(text) || undefined,
        source_type: extractFirstUrl(text) ? 'manual' : undefined,
        summary: text,
      },
      reason: 'one_time_video_library_item_preview',
    };
  }

  if (/\b(create|add|file|make)\b.{0,30}\b(task|todo|to-do)\b/.test(value)) {
    return {
      kind: 'typed_action',
      action_id: 'create_task',
      confidence: 0.88,
      dry_run: false,
      inputs: {
        title: titleAfterKeyword(text, /\b(?:task|todo|to-do)\b\s*(?:to|:|-)?\s*(.+)$/i, text),
        raw_text: text,
        source: 'telegram',
        created_by: 'telegram',
      },
      reason: 'task_create',
    };
  }

  if (/\b(schedule|set|put|plan)\b.{0,40}\btask\b/.test(value) && extractTaskId(text) && extractDateTime(text)) {
    const scheduledAt = extractDateTime(text);
    return {
      kind: 'typed_action',
      action_id: 'schedule_task_on_date',
      confidence: 0.86,
      dry_run: true,
      inputs: {
        task_id: extractTaskId(text),
        due_date: scheduledAt.slice(0, 10),
        planned_at: scheduledAt,
        reason: text,
      },
      reason: 'task_schedule_preview',
    };
  }

  if (/\b(move|transfer|put)\b.{0,35}\btask\b/.test(value) && extractTaskId(text) && /\b(workspace|project|one time|one-time|mishnah|mishna|rabbi|sheller|bna|school|academy|platform)\b/.test(value)) {
    const workspaceKey = extractWorkspaceKey(text);
    return {
      kind: 'typed_action',
      action_id: 'move_task_workspace',
      confidence: workspaceKey ? 0.86 : 0.62,
      dry_run: true,
      inputs: {
        task_id: extractTaskId(text),
        workspace_key: workspaceKey || undefined,
        reason: text,
      },
      reason: workspaceKey ? 'task_workspace_move_preview' : 'task_workspace_move_needs_workspace',
    };
  }

  if (/\b(move|mark|update)\b.{0,25}\btask\b/.test(value) && extractTaskId(text)) {
    const stageMatch = value.match(/\b(?:to|as)\s+(raw input|needs decision|assigned|in progress|done|archive|archived|complete|completed)\b/);
    return {
      kind: 'typed_action',
      action_id: 'update_task_stage',
      confidence: 0.84,
      dry_run: false,
      inputs: {
        task_id: extractTaskId(text),
        stage: stageMatch ? stageMatch[1].replace(/\s+/g, '_') : 'assigned',
        verification_notes: text,
      },
      reason: 'task_stage_update',
    };
  }

  if (/\b(move|put|set)\b.{0,80}\b(lead|contact|prospect)\b.{0,80}\b(payment pending|paid|follow up|application sent|not now)\b/.test(value)) {
    const stageMatch = value.match(/\b(payment pending|paid|follow up|application sent|not now)\b/);
    const leadId = (text.match(/\blead\s*#?\s*(\d+)\b/i) || [])[1];
    return {
      kind: 'typed_action',
      action_id: 'move_lead_stage',
      confidence: 0.83,
      dry_run: false,
      inputs: {
        stage: stageMatch ? stageMatch[1].replace(/\s+/g, '_') : 'follow_up',
        lead_id: leadId ? Number(leadId) : undefined,
        lead_name: titleAfterKeyword(text, /\blead\s+([^#\d][^,|]+?)(?:\s+to\s+|\s+into\s+|$)/i, ''),
      },
      reason: 'crm_stage_update',
    };
  }

  if (/\b(list|show|preview|get)\b.{0,80}\b(google business|gbp|business profile)\b.{0,80}\b(location|locations|account|accounts)\b/.test(value)
    || /\b(location|locations|account|accounts)\b.{0,80}\b(google business|gbp|business profile)\b/.test(value)) {
    const providerId = extractProviderId(text);
    return {
      kind: 'typed_action',
      action_id: 'google_business_list_locations_preview',
      confidence: providerId ? 0.84 : 0.72,
      dry_run: true,
      inputs: {
        provider_id: providerId || undefined,
        provider_name: titleAfterKeyword(text, /\b(?:provider|for|profile)\b\s*(?:called|named|:|-)?\s*([^|]+?)(?:\s+\b(?:locations?|accounts?)\b|$)/i, ''),
        notes: text,
      },
      reason: providerId ? 'google_business_locations_preview' : 'google_business_locations_needs_provider_or_account',
    };
  }

  if (/\b(find|lookup|look up|resolve|get|preview)\b.{0,100}\b(place[_\s-]?id|placeid|google maps|maps link|google business|business profile)\b/.test(value)
    || /\b(place[_\s-]?id|placeid)\b.{0,100}\b(google maps|maps link|google business|business profile)\b/.test(value)) {
    const placeId = extractGooglePlaceId(text);
    return {
      kind: 'typed_action',
      action_id: 'google_business_place_id_lookup',
      confidence: placeId ? 0.86 : 0.72,
      dry_run: true,
      inputs: {
        provider_id: extractProviderId(text) || undefined,
        query: text,
        google_business_profile_url: extractGoogleBusinessUrl(text) || undefined,
        google_place_id: placeId || undefined,
        notes: text,
      },
      reason: placeId ? 'google_business_place_id_found_in_input' : 'google_business_place_id_lookup_preview',
    };
  }

  if (/\b(attach|capture|save|store|add|put)\b.{0,80}\b(google business|google profile|google maps|maps link|place id)\b/.test(value)
    || /\b(google business|google profile|google maps|maps link|place id)\b.{0,80}\b(provider|profile|listing)\b/.test(value)) {
    const providerId = extractProviderId(text);
    return {
      kind: 'typed_action',
      action_id: 'capture_provider_google_business_link',
      confidence: providerId ? 0.9 : 0.72,
      dry_run: false,
      inputs: {
        provider_id: providerId || undefined,
        google_business_profile_url: extractGoogleBusinessUrl(text) || undefined,
        google_place_id: extractGooglePlaceId(text) || undefined,
        notes: text,
      },
      reason: providerId ? 'provider_google_business_link_capture' : 'provider_google_business_link_capture_needs_provider_id',
    };
  }

  if (/\b(preview|create|build|make|prepare)\b.{0,80}\b(8[-\s]?week|eight[-\s]?week|launch)\b.{0,80}\b(calendar|schedule|plan)\b/.test(value)
    || /\b(calendar|schedule|plan)\b.{0,80}\b(8[-\s]?week|eight[-\s]?week|launch)\b/.test(value)) {
    const startAt = extractDateTime(text);
    return {
      kind: 'typed_action',
      action_id: 'calendar_batch_launch_plan_preview',
      confidence: 0.84,
      dry_run: true,
      inputs: {
        program: /\brabbi|sheller|mishnayos|mishnah|one time|one-time\b/.test(value) ? 'One Time Mishnayos launch' : 'Launch plan',
        weeks: /\b(8[-\s]?week|eight[-\s]?week)\b/.test(value) ? 8 : undefined,
        start_date: startAt ? startAt.slice(0, 10) : undefined,
        start_at: startAt || undefined,
        notes: text,
      },
      reason: startAt ? 'calendar_batch_launch_plan_preview' : 'calendar_batch_launch_plan_needs_start_date',
    };
  }

  if (
    /\b(preview|put|place|add|attach|file|create|prepare)\b.{0,100}\b(material|worksheet|source[-\s]?sheet|video|link|doc|document)\b.{0,140}\b(topic|classroom|course)\b/.test(value)
    || /\b(classroom|course)\b.{0,100}\btopic\b.{0,120}\b(material|worksheet|source[-\s]?sheet|video|link|doc|document)\b/.test(value)
  ) {
    const topicName = extractClassroomTopicName(text);
    const courseName = extractClassroomCourseName(text);
    const materialUrl = extractFirstUrl(text);
    return {
      kind: 'typed_action',
      action_id: 'classroom_topic_material_preview',
      confidence: topicName && courseName ? 0.86 : 0.72,
      dry_run: true,
      inputs: {
        material_title: extractClassroomMaterialTitle(text) || (materialUrl ? 'Linked Classroom material' : undefined),
        material_url: materialUrl || undefined,
        topic_name: topicName || undefined,
        course_name: courseName || undefined,
        notes: text,
      },
      reason: topicName ? 'classroom_topic_material_preview' : 'classroom_topic_material_needs_topic',
    };
  }

  if (/\b(create|add|schedule|make)\b.{0,50}\b(calendar event|event|meeting|class session|schedule item)\b/.test(value)) {
    const startAt = extractDateTime(text);
    const provider = /\brabbi|sheller|mishnayos|mishnah|provider|member|participant|class session\b/.test(value);
    const studentVisible = /\bstudent[-\s]?visible|for student|student calendar\b/.test(value);
    const parentVisible = /\bparent[-\s]?visible|for parent|parent calendar\b/.test(value);
    let actionId = 'create_calendar_event';
    if (provider) actionId = 'create_provider_class_session';
    if (studentVisible) actionId = 'create_student_schedule_item';
    if (parentVisible) actionId = 'create_parent_visible_event';
    return {
      kind: 'typed_action',
      action_id: actionId,
      confidence: startAt ? 0.87 : 0.68,
      dry_run: !startAt,
      inputs: {
        title: titleAfterKeyword(text, /\b(?:calendar event|event|meeting|class session|schedule item)\b\s*(?:for|:|-)?\s*([^|]+?)(?:\s+\bon\b|\s+\bat\b|$)/i, text),
        start_at: startAt || undefined,
        description: text,
        visibility: parentVisible ? 'parent' : studentVisible ? 'student' : provider ? 'provider' : 'internal',
        source: provider ? 'provider_program' : 'manual',
      },
      reason: startAt ? 'calendar_create' : 'calendar_create_needs_datetime',
    };
  }

  return { kind: 'normal_chat', confidence: 0.4, reason: 'no_typed_action_match' };
}

function shortResultText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim().slice(0, 500);
  return JSON.stringify(value).replace(/\s+/g, ' ').slice(0, 500);
}

function formatTelegramActionResult(actionResult = {}) {
  const action = actionResult.action || getAction(actionResult.action_id) || {};
  const title = action.label || action.action_id || 'Typed action';
  const auditId = actionResult.audit_log?.action_run_id || actionResult.audit_log?.id || '';
  const result = actionResult.result || actionResult.preview || {};
  const lines = [];
  if (!actionResult.success) {
    lines.push(`I tried to run ${title}, but it did not pass safely.`);
    lines.push(`Reason: ${actionResult.error || actionResult.message || 'Unknown error'}`);
  } else if (actionResult.approval_required) {
    lines.push(`I found the typed action: ${title}.`);
    lines.push('This needs approval before it executes.');
    lines.push(`Preview: ${shortResultText(result)}`);
  } else if (actionResult.executed) {
    lines.push(`Done through typed action: ${title}.`);
    lines.push(actionResult.message || action.success_message || 'Action executed.');
    const summary = actionResult.audit_log?.result_summary || result;
    lines.push(`Result: ${shortResultText(summary)}`);
  } else {
    lines.push(`Previewed typed action: ${title}.`);
    lines.push(`Preview: ${shortResultText(result)}`);
  }
  if (auditId) lines.push(`Audit: ${auditId}`);
  if (actionResult.result?.next_actions?.length) {
    lines.push(`Next: ${actionResult.result.next_actions.join(', ')}`);
  }
  return lines.filter(Boolean).join('\n');
}

module.exports = {
  classifyTelegramActionRequest,
  formatTelegramActionResult,
  looksLikeCodeOrSystemDevelopment,
};
