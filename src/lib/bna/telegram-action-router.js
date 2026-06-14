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
