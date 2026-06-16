const { previewMessage, redactText } = require('./redaction');

function compactText(value, max = 1000) {
  return String(value || '').replace(/\r/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function firstMatch(text, pattern) {
  const match = String(text || '').match(pattern);
  return match ? match[1] || '' : '';
}

function textAfterIntent(text, pattern, fallback = '') {
  const match = String(text || '').match(pattern);
  return compactText(match ? match[1] || fallback : fallback || text, 1000);
}

function extractTaskId(text = '') {
  const value = firstMatch(text, /(?:task|#)\s*#?\s*(\d+)/i);
  return value ? Number(value) : null;
}

function extractEmail(text = '') {
  return firstMatch(text, /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i);
}

function extractSubject(text = '') {
  return compactText(firstMatch(text, /\bsubject\s*[:\-]\s*([^,\n]+?)(?:\s*,?\s*\bbody\b|\s*$)/i), 240);
}

function extractBody(text = '') {
  return compactText(firstMatch(text, /\bbody\s*[:\-]\s*([\s\S]+)$/i), 10000);
}

function guessPlatform(text = '') {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('linkedin')) return 'linkedin';
  if (lower.includes('youtube')) return 'youtube';
  if (lower.includes('whatsapp')) return 'whatsapp';
  if (lower.includes('instagram')) return 'instagram';
  return 'facebook';
}

function guessIntegrationType(text = '') {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('resend') || lower.includes('email sender')) return 'resend';
  if (lower.includes('buffer') || lower.includes('social')) return 'buffer';
  if (lower.includes('wapi') || lower.includes('whapi') || lower.includes('whatsapp')) return 'wapi';
  if (lower.includes('vimeo') || lower.includes('video host')) return 'vimeo';
  if (lower.includes('zoom')) return 'zoom';
  if (lower.includes('stripe') || lower.includes('checkout')) return 'stripe';
  if (lower.includes('godaddy') || lower.includes('dns') || lower.includes('domain')) return 'godaddy_dns';
  if (lower.includes('google drive') || lower.includes('drive')) return 'google_drive';
  return 'other';
}

function extractDomain(text = '') {
  return firstMatch(text, /\b((?:[a-z0-9-]+\.)+[a-z]{2,})\b/i);
}

function guessScheduledAt(text = '') {
  const raw = String(text || '');
  const iso = firstMatch(raw, /\b(\d{4}-\d{2}-\d{2}[T ][0-2]\d:[0-5]\d(?::[0-5]\d)?(?:Z|[+-]\d{2}:?\d{2})?)\b/);
  if (iso) return iso.replace(' ', 'T');
  const time = firstMatch(raw, /\b(?:at|@)\s*([0-2]?\d(?::[0-5]\d)?\s*(?:am|pm)?)\b/i) || '9 AM';
  if (/\btomorrow\b/i.test(raw)) return `tomorrow ${time}`;
  return time;
}

function deterministicPlan(message = '', registry, context = {}) {
  const text = compactText(redactText(message), 4000);
  const lower = text.toLowerCase();
  const actions = [];
  let reply = 'I can help with that.';

  if (/\b(show|audit|status|report)\b.*\b(codex|agent|queue)\b/.test(lower)) {
    reply = 'I can show the current Codex queue status.';
    actions.push({ tool: 'audit_queue_status', label: 'Show Codex queue', args: { limit: 50 }, reason: 'Queue/report request' });
  } else if (/\b(zoom|godaddy|dns|domain)\b.*\b(blocked|thursday|owner access|delegate)\b|\b(blocked|thursday)\b.*\b(zoom|godaddy|dns|domain)\b/i.test(text)) {
    const integrationType = guessIntegrationType(text);
    reply = `${integrationType === 'godaddy_dns' ? 'GoDaddy / DNS' : integrationType.toUpperCase()} can be marked as blocked until Thursday.`;
    actions.push({
      tool: 'mark_integration_blocked_until_thursday',
      label: 'Mark Thursday integration blocker',
      args: { integration_type: integrationType, reason: text, project_key: context.projectKey || undefined },
      reason: 'Thursday access blocker request',
    });
  } else if (/\b(create|add|make)\b.*\bdns\b.*\b(task|record|checklist)\b|\bdns\b.*\b(copy exact|dashboard|thursday|resend|stripe|google)\b/i.test(text)) {
    const integrationType = guessIntegrationType(text);
    const domain = extractDomain(text);
    reply = domain ? `I can create a DNS setup task for ${domain}.` : 'I can create a DNS setup task once the domain is supplied.';
    actions.push({
      tool: 'create_dns_setup_task',
      label: 'Create DNS setup task',
      args: { integration_type: integrationType, provider: integrationType, domain: domain || '', purpose: integrationType === 'resend' ? 'resend' : 'verification' },
      reason: 'DNS setup request',
    });
  } else if (/\b(show|check|test|status)\b.*\b(integration|resend|buffer|vimeo|zoom|wapi|whatsapp|stripe|dns|godaddy)\b|\b(integration|resend|buffer|vimeo|zoom|wapi|whatsapp|stripe|dns|godaddy)\b.*\b(show|check|test|status|ready|readiness)\b/i.test(text)) {
    const integrationType = guessIntegrationType(text);
    const testTools = {
      resend: 'test_resend_connection',
      buffer: 'test_buffer_connection',
      vimeo: 'test_vimeo_connection',
      wapi: 'test_wapi_connection',
    };
    const tool = testTools[integrationType] || 'show_integration_status';
    reply = tool === 'show_integration_status'
      ? 'I can show the integration status without exposing secrets.'
      : `I can run a safe ${integrationType} readiness check without external writes.`;
    actions.push({
      tool,
      label: tool === 'show_integration_status' ? 'Show integration status' : `Test ${integrationType} readiness`,
      args: { integration_type: integrationType, project_key: context.projectKey || undefined },
      reason: 'Integration status/readiness request',
    });
  } else if (/\b(set up|setup|connect|configure|create)\b.*\b(resend|buffer|vimeo|zoom|wapi|whatsapp|stripe|dns|godaddy|integration)\b/i.test(text)) {
    const integrationType = guessIntegrationType(text);
    reply = `I can create a provider-scoped ${integrationType} setup task.`;
    actions.push({
      tool: 'create_integration_setup_task',
      label: 'Create integration setup task',
      args: { integration_type: integrationType, reason: text, project_key: context.projectKey || undefined },
      reason: 'Integration setup request',
    });
  } else if (/\b(save|store|rotate|replace)\b.*\b(api key|apikey|token|secret)\b|\b(api key|token|secret)\b.*\b(save|store|belongs to|for)\b/i.test(text)) {
    const integrationType = guessIntegrationType(text);
    const rotate = /\b(rotate|replace)\b/i.test(text);
    reply = rotate
      ? `I can mark the ${integrationType} key for rotation without exposing it.`
      : `I can register a ${integrationType} secret reference and safe fingerprint.`;
    actions.push({
      tool: rotate ? 'rotate_provider_api_key' : 'save_provider_api_key',
      label: rotate ? 'Rotate provider API key' : 'Register provider API key reference',
      args: { integration_type: integrationType, project_key: context.projectKey || undefined },
      reason: 'Provider secret handling request',
    });
  } else if (/\b(vimeo)\b.*\b(upload|manual|url|library|attach)\b/i.test(text)) {
    const url = firstMatch(text, /(https?:\/\/[^\s]+vimeo\.com\/[^\s]+)/i);
    const tool = url ? 'attach_vimeo_url_to_library_item' : /\bmanual\b/i.test(text) ? 'mark_manual_vimeo_upload_needed' : 'prepare_vimeo_upload';
    reply = url ? 'I can attach that Vimeo URL for approval.' : 'I can prepare the Vimeo upload/manual fallback path.';
    actions.push({
      tool,
      label: url ? 'Attach Vimeo URL' : 'Prepare Vimeo path',
      args: url ? { vimeo_url: url, project_key: context.projectKey || undefined } : { title: 'Vimeo class video', reason: text, project_key: context.projectKey || undefined },
      reason: 'Vimeo video workflow request',
    });
  } else if (/\b(mark|set)\b.*\btask\s*#?\d+\b.*\b(done|complete|completed)\b/.test(lower)) {
    const taskId = extractTaskId(text);
    reply = `I can mark task #${taskId} done.`;
    actions.push({ tool: 'mark_task_done', label: 'Mark task done', args: { task_id: taskId, verification_notes: 'Marked done by BNA Helper.' }, reason: 'Task completion request' });
  } else if (/\badd\b.*\bcomment\b.*\btask\s*#?\d+\b/.test(lower)) {
    const taskId = extractTaskId(text);
    const body = textAfterIntent(text, /(?:comment|note)\s*(?:to|on)?\s*task\s*#?\d+\s*[:\-]?\s*([\s\S]+)$/i, 'Helper comment');
    reply = `I can add that comment to task #${taskId}.`;
    actions.push({ tool: 'add_task_comment', label: 'Add task comment', args: { task_id: taskId, body }, reason: 'Task comment request' });
  } else if (/\b(send|email)\b.*\bemail\b|\bsend this email\b/i.test(text)) {
    const to = extractEmail(text);
    const subject = extractSubject(text) || 'BNA update';
    const body = extractBody(text) || textAfterIntent(text, /(?:body|message)\s*[:\-]?\s*([\s\S]+)$/i, text);
    const sending = /\bsend\b/i.test(text) && to;
    reply = sending ? 'I can prepare this email and will require confirmation before sending.' : 'I can draft this email.';
    actions.push({
      tool: sending ? 'send_email' : 'draft_email',
      label: sending ? 'Send email' : 'Draft email',
      args: sending ? { to, subject, text: body } : { to, subject, body },
      reason: sending ? 'External email send request' : 'Email draft request',
    });
  } else if (/\bbuffer\b|\bschedule\b.*\b(post|social|facebook|linkedin|youtube)\b/i.test(text)) {
    const platform = guessPlatform(text);
    const textArg = textAfterIntent(text, /(?:saying|text|copy|post)\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = 'I can create a local draft and a Buffer setup blocker; live Buffer scheduling is not configured here.';
    actions.push({
      tool: 'schedule_social_post_via_buffer',
      label: 'Buffer schedule request',
      args: { platform, text: textArg, scheduled_at: guessScheduledAt(text) },
      reason: 'Buffer scheduling request',
    });
  } else if (/\bdraft\b.*\b(social|post|facebook|linkedin|youtube|whatsapp)\b/i.test(text)) {
    const platform = guessPlatform(text);
    const textArg = textAfterIntent(text, /(?:saying|text|copy|post)\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = `I can create a local ${platform} draft.`;
    actions.push({ tool: 'draft_social_post', label: 'Draft social post', args: { platform, text: textArg }, reason: 'Local social draft request' });
  } else if (/\b(create|add|new)\b.*\bstudent\b/i.test(text)) {
    const name = textAfterIntent(text, /(?:student named|student|add student|create student)\s*[:\-]?\s*([A-Za-z][^,\n]*)/i, '').replace(/\b(parent|email|phone)\b.*$/i, '').trim();
    reply = 'I can create a student record.';
    actions.push({ tool: 'create_student', label: 'Create student', args: { name: name || 'New student' }, reason: 'Student creation request' });
  } else if (/\b(create|add|new)\b.*\b(content|recording|video|post item)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:content item|content|recording|video)\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = 'I can create a local content item.';
    actions.push({ tool: 'create_content_item', label: 'Create content item', args: { title, notes: text }, reason: 'Content item request' });
  } else if (/\b(decision|decide|choose|approval)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:create\s*)?(?:decision|approval)\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = 'I can create a decision card.';
    actions.push({ tool: 'create_decision', label: 'Create decision', args: { title, context: text, owner: 'Shloimie' }, reason: 'Decision request' });
  } else if (/\b(blocker|blocked|missing access|missing input|need access|waiting on)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:blocker|blocked|missing access|missing input|need access|waiting on)\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = 'I can create a Pending/access blocker.';
    actions.push({ tool: 'create_pending_blocker', label: 'Create blocker', args: { title: title || 'Pending access blocker', blocker: text, needed_from: 'Shloimie' }, reason: 'Blocker request' });
  } else if (/\b(create|add|new)\b.*\bcodex\b|\bcodex\b.*\b(task|work|fix|build)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:create\s*)?(?:a\s*)?(?:codex\s*)?(?:task|work item|job)\s*(?:to|for)?\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = 'I can create one Codex work item.';
    actions.push({ tool: 'create_codex_work_item', label: 'Create Codex task', args: { title: title || text, brief: text }, reason: 'Codex work request' });
  } else if (/\b(create|add|new)\b.*\btask\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:create|add|new)\s+(?:a\s*)?task\s*(?:to|for)?\s*[:\-]?\s*([\s\S]+)$/i, text);
    reply = 'I can create one Operations task.';
    actions.push({ tool: 'create_task', label: 'Create task', args: { title: title || text, notes: text }, reason: 'Task creation request' });
  } else {
    reply = 'I can turn this into an Operations task unless you want a different tool.';
    actions.push({ tool: 'create_task', label: 'Create task', args: { title: text.slice(0, 220), notes: text }, reason: 'Fallback task capture' });
  }

  return {
    reply,
    actions: actions.filter((action) => registry.get(action.tool)),
    planner: 'deterministic',
  };
}

function parsePlannerJson(content = '') {
  const text = String(content || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function aiPlan(message = '', registry, context = {}) {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey || typeof fetch !== 'function') return null;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const toolMetadata = registry.metadata(context).filter((tool) => tool.available || tool.unavailable_reason === 'missing_integration');
  const payload = {
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You plan BNA Operations Helper actions. Return strict JSON only.',
          'Hosted AI may only plan. It must never claim execution.',
          'Output shape: {"reply":"string","actions":[{"tool":"name","label":"short","args":{},"reason":"short"}],"missing_input":[],"notes":"string"}',
          'Use only listed tools and compact args. Do not include secrets.',
          'External sends, social publishing, payments, destructive changes, and Buffer scheduling require confirmation.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify({
          message: previewMessage(message, 2000),
          view: context.view || null,
          project_key: context.projectKey || null,
          role: context.userRole || null,
          tools: toolMetadata,
        }),
      },
    ],
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parsePlannerJson(content);
    if (!parsed || !Array.isArray(parsed.actions)) return null;
    return {
      reply: compactText(parsed.reply || 'I found a possible plan.', 1000),
      actions: parsed.actions
        .filter((action) => action && registry.get(action.tool))
        .slice(0, 6)
        .map((action) => ({
          tool: String(action.tool || ''),
          label: compactText(action.label || action.tool, 140),
          args: action.args && typeof action.args === 'object' ? action.args : {},
          reason: compactText(action.reason || '', 500),
        })),
      missing_input: Array.isArray(parsed.missing_input) ? parsed.missing_input.slice(0, 6) : [],
      notes: compactText(parsed.notes || '', 1000),
      planner: 'ai',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function buildHelperPlan(message = '', registry, context = {}) {
  const ai = await aiPlan(message, registry, context);
  if (ai && ai.actions.length) return ai;
  return deterministicPlan(message, registry, context);
}

module.exports = {
  buildHelperPlan,
  deterministicPlan,
  parsePlannerJson,
};
