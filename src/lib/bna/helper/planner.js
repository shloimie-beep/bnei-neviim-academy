const { previewMessage, redactText } = require('./redaction');

function compactText(value, max = 1000) {
  return String(value || '').replace(/\r/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isRabbiOneTimeContext(context = {}) {
  const projectKey = String(context.projectKey || context.project_key || '').toLowerCase();
  const workspaceKey = String(context.workspaceKey || context.workspace_key || context.helperScope?.workspaceKey || '').toLowerCase();
  const scopeType = String(context.helperScope?.scopeType || context.scopeType || context.identity?.scope?.type || '').toLowerCase();
  return projectKey === 'one_time_mishnah_class'
    || workspaceKey === 'rabbi_sheller_provider'
    || scopeType === 'rabbi';
}

function scopedTool(registry, context, aliasName, fallbackName) {
  return isRabbiOneTimeContext(context) && registry.get(aliasName) ? aliasName : fallbackName;
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

function extractStudentId(text = '') {
  const value = firstMatch(text, /\bstudent\s*#?\s*(\d+)\b/i) || firstMatch(text, /\bchild\s*#?\s*(\d+)\b/i);
  return value ? Number(value) : null;
}

function selectedTaskId(context = {}) {
  const record = context.pageContext?.selectedRecord || context.selectedRecord || {};
  if (String(record.type || '').toLowerCase() === 'task' && record.id) return Number(record.id) || null;
  return null;
}

function selectedStudentId(context = {}) {
  const record = context.pageContext?.selectedRecord || context.selectedRecord || {};
  if (String(record.type || '').toLowerCase() === 'student' && record.id) return Number(record.id) || null;
  return null;
}

function selectedAutomationId(context = {}) {
  const record = context.pageContext?.selectedRecord || context.selectedRecord || {};
  const type = String(record.type || '').toLowerCase();
  if ((type === 'automation' || type === 'workflow') && record.id) return Number(record.id) || null;
  return null;
}

function extractAutomationId(text = '') {
  const value = firstMatch(text, /(?:automation|workflow)\s*#?\s*(\d+)/i) || firstMatch(text, /#\s*(\d+)\b/);
  return value ? Number(value) : null;
}

function extractAutomationIdOrSelected(text = '', context = {}) {
  return extractAutomationId(text) || selectedAutomationId(context);
}

function extractTaskIdOrSelected(text = '', context = {}) {
  return extractTaskId(text) || selectedTaskId(context);
}

function extractStudentIdOrSelected(text = '', context = {}) {
  return extractStudentId(text) || selectedStudentId(context);
}

function extractEmail(text = '') {
  return firstMatch(text, /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i);
}

function extractPhone(text = '') {
  const match = String(text || '').match(/\b(?:\+?\d[\d\s().-]{6,}\d)\b/);
  return match ? compactText(match[0], 80) : '';
}

function extractCalendarEventId(text = '') {
  const value = firstMatch(text, /\b(?:calendar\s*)?event\s*#?\s*(\d+)\b/i);
  return value ? Number(value) : null;
}

function extractContentId(text = '') {
  const value = firstMatch(text, /\b(?:content(?: item)?|recording|library item)\s*#?\s*(\d+)\b/i);
  return value ? Number(value) : null;
}

function contactHistoryArgs(text = '', context = {}) {
  const args = {
    workspace_key: context.workspaceKey || undefined,
    project_key: context.projectKey || undefined,
  };
  const contactId = firstMatch(text, /\bcontact\s*#?\s*(\d+)\b/i);
  const signupId = firstMatch(text, /\bsignup\s*#?\s*(\d+)\b/i);
  const studentId = firstMatch(text, /\bstudent\s*#?\s*(\d+)\b/i);
  if (contactId) args.contact_id = Number(contactId);
  if (signupId) args.signup_id = Number(signupId);
  if (studentId) args.student_id = Number(studentId);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  if (email) args.email = email;
  if (phone) args.phone = phone;
  const name = firstMatch(text, /\b(?:for|with|about)\s+([A-Z][A-Za-z.' -]{1,80})(?:\s*(?:email|phone|contact|history|messages?)|\s*$)/);
  if (!email && !phone && !contactId && !signupId && !studentId && name) args.contact_name = compactText(name, 120);
  return args;
}

function studentSummaryArgs(text = '', context = {}) {
  const args = {
    workspace_key: context.workspaceKey || undefined,
    project_key: context.projectKey || undefined,
  };
  const studentId = extractStudentIdOrSelected(text, context);
  if (studentId) args.student_id = studentId;
  const search = firstMatch(text, /\b(?:student|child|kid)\s+named\s+([A-Z][A-Za-z.' -]{1,80})/i)
    || firstMatch(text, /\b(?:for|about)\s+([A-Z][A-Za-z.' -]{1,80})(?:\s*(?:assignments?|goals?|progress|calendar|notes?|students?)|\s*$)/);
  if (!studentId && search) args.search = compactText(search, 120);
  return args;
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

function extractClassCount(text = '') {
  const value = String(text || '');
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

function providerClassroomArgs(text = '', context = {}) {
  const lower = String(text || '').toLowerCase();
  const privateReplies = /\b(private|privately|directly to (?:rabbi|teacher|provider))\b/.test(lower);
  const publicDisplay = /\b(public|community display|publish(?:es|ed|ing)?|featured|show selected)\b/.test(lower);
  const noStudentChat = /\b(no student[-\s]?student|no open chat|no group chat|private only)\b/.test(lower);
  const dialogueStyle = privateReplies
    ? 'Rabbi/teacher-led Q&A with private student replies'
    : /\bannouncement\b/.test(lower)
      ? 'Announcements with teacher-controlled replies'
      : /\bdiscussion|dialogue|community\b/.test(lower)
        ? 'Moderated community dialogue'
        : 'Guided classroom Q&A';
  return {
    title: textAfterIntent(text, /\b(?:start|open|create|make|set up|setup|launch)\b\s*(?:a\s*)?(?:provider\s*)?(?:classroom|learning community|community|course)\s*(?:for|:|-)?\s*([\s\S]+)$/i, 'Provider classroom setup draft'),
    raw_prompt: text,
    class_count: extractClassCount(text),
    community_dialogue_style: dialogueStyle,
    student_access: /\b(member|membership|participants?)\b/.test(lower)
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
    workspace_key: context.workspaceKey || undefined,
    project_key: context.projectKey || undefined,
  };
}

function automationCreateArgs(text = '', context = {}) {
  const billing = /\b(billing|payment|invoice|tuition|green invoice|stripe)\b/i.test(text);
  const name = textAfterIntent(
    text,
    /\b(?:create|add|make|set up|setup|build)\b\s*(?:a\s*)?(?:new\s*)?(?:billing\s*)?(?:automation|workflow)\s*(?:for|called|named|:|-)?\s*([\s\S]+)$/i,
    billing ? 'Billing workflow draft' : 'Automation workflow draft'
  );
  return {
    name: name || (billing ? 'Billing workflow draft' : 'Automation workflow draft'),
    summary: text,
    description: text,
    raw_prompt: text,
    package_key: billing ? 'accounting' : 'operations',
    package_name: billing ? 'Accounting' : 'Operations',
    automation_type: billing ? 'accounting' : 'workflow',
    trigger: /\b(remind|reminder)\b/i.test(text) ? 'Reminder trigger after operator approval' : 'Manual helper-created workflow draft',
    channel: billing ? 'accounting' : 'dashboard',
    setup_blockers: ['Review trigger, permissions, owner, and rollback before enabling any live handler.'],
    project_key: context.projectKey || undefined,
  };
}

function automationUpdateArgs(text = '', context = {}) {
  const lower = String(text || '').toLowerCase();
  const args = {
    automation_id: extractAutomationIdOrSelected(text, context) || undefined,
    reason: text,
    project_key: context.projectKey || undefined,
  };
  if (/\b(disable|pause|turn off|stop)\b/i.test(text)) {
    args.enabled = false;
    args.status = 'paused';
    args.change_note = 'Paused by helper natural-language request.';
  } else if (/\b(enable|turn on|reactivate|unpause)\b/i.test(text)) {
    args.enabled = true;
    args.status = 'guarded';
    args.change_note = 'Re-enabled into guarded status by helper natural-language request.';
  } else if (/\b(block|blocked)\b/i.test(text)) {
    args.status = 'blocked';
    args.blocker = textAfterIntent(text, /\b(?:block|blocked|because|reason)\b\s*[:\-]?\s*([\s\S]+)$/i, text);
  } else {
    args.status = firstMatch(text, /\bstatus\s*(?:to|=|:)\s*(active|guarded|draft|blocked|paused|archived)\b/i) || undefined;
    args.description = textAfterIntent(text, /\b(?:edit|update|change)\b\s*(?:automation|workflow)?\s*#?\d*\s*(?:to|:|-)?\s*([\s\S]+)$/i, text);
  }
  if (lower.includes('billing') || lower.includes('payment')) args.summary = text;
  return args;
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

function guessSupportCategory(text = '') {
  const lower = String(text || '').toLowerCase();
  if (/\b(bot|api|openai|kimi|telegram|assistant)\b/.test(lower)) return 'bot_api';
  if (/\b(automation|scheduler|cron)\b/.test(lower)) return 'automation';
  if (/\b(login|password|sign in|access code)\b/.test(lower)) return 'login';
  if (/\b(access|permission|locked|role)\b/.test(lower)) return 'access';
  if (/\b(payment|billing|charge|refund|stripe)\b/.test(lower)) return 'payment';
  if (/\b(recording|video|vimeo)\b/.test(lower)) return 'recording';
  if (/\b(worksheet|source sheet|assignment)\b/.test(lower)) return 'worksheet';
  if (/\b(drive|google doc|upload)\b/.test(lower)) return 'drive';
  if (/\b(student|parent|family|kid|child)\b/.test(lower)) return 'student_parent_data';
  if (/\b(link|url|button|route|page)\b/.test(lower)) return 'link';
  if (/\b(slow|slowness|lag|laggy|performance|takes forever|loading forever)\b/.test(lower)) return 'other';
  return 'task_manager';
}

function guessSeverity(text = '') {
  const lower = String(text || '').toLowerCase();
  if (/\b(blocking|can't work|cannot work|down|broken|urgent)\b/.test(lower)) return 'blocking';
  if (/\b(high|serious|major)\b/.test(lower)) return 'high';
  if (/\b(low|minor|small)\b/.test(lower)) return 'low';
  return 'normal';
}

function currentOperationsRouteArgs(context = {}) {
  const pageContext = context.pageContext || {};
  const query = pageContext.query && typeof pageContext.query === 'object' ? pageContext.query : {};
  const view = compactText(query.view || pageContext.view || context.view || '', 80);
  if (!view) return null;
  const args = {
    view,
    section: compactText(query.section || pageContext.section || pageContext.visibleSection || '', 80) || undefined,
    workspace_key: compactText(query.workspace || context.workspaceKey || '', 120) || undefined,
  };
  const selectedTask = pageContext.selectedRecord?.type === 'task' ? pageContext.selectedRecord?.id : null;
  const taskId = query.task || selectedTask;
  if (taskId && Number.isFinite(Number(taskId))) args.task_id = Number(taskId);
  if (query.student && Number.isFinite(Number(query.student))) args.student_id = Number(query.student);
  if (query.content_job && Number.isFinite(Number(query.content_job))) args.content_job_id = Number(query.content_job);
  return Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined && value !== ''));
}

function navigationArgs(text = '', context = {}) {
  const lower = String(text || '').toLowerCase();
  const currentPageIntent = /\b(?:this|that|current)\s+(?:page|screen|view|route|link)\b/.test(lower)
    || /\b(?:link|url)\s+(?:to|for)\s+(?:this|that|current)\b/.test(lower)
    || /\bbring me\b.{0,80}\b(?:to|right to)\b.{0,80}\b(?:page|link|route)\b/.test(lower);
  if (currentPageIntent) {
    const currentArgs = currentOperationsRouteArgs(context);
    if (currentArgs) return currentArgs;
  }
  const taskId = extractTaskIdOrSelected(text, context);
  if (/\b(task|ticket)\s*#?\d+\b/.test(lower) || /\b(go back|return|open|show|edit)\b.*\btask\b/.test(lower)) {
    return { view: 'tasks', section: 'tasks', task_id: taskId || undefined };
  }
  if (/\bdecision|decisions|approval|approvals\b/.test(lower)) return { view: 'tasks', section: 'decisions' };
  if (/\bpending|blocked|blockers|waiting\b/.test(lower)) return { view: 'tasks', section: 'pending' };
  if (/\bdone|completed|history|activity\b/.test(lower)) return { view: 'tasks', section: lower.includes('activity') ? 'activity' : 'done' };
  if (/\b(?:settings?|setup|configuration)\b.*\b(?:calendar|classroom)\b/.test(lower) || /\bcalendar[_\s/-]*classroom\b/.test(lower)) {
    return { view: 'settings', section: 'calendar_classroom', workspace_key: context.workspaceKey || undefined };
  }
  if (/\b(calendar|schedule|scheduled|date|day|week|month)\b/.test(lower)) return { view: 'tasks', section: 'schedule', calendar_mode: lower.includes('week') ? 'week' : lower.includes('day') ? 'day' : undefined };
  if (/\bcontent|recording|library|post|social\b/.test(lower)) return { view: 'content', section: 'library' };
  if (/\bstudent|students|accountability\b/.test(lower)) return { view: 'students', section: 'list' };
  if (/\bcontact|contacts|parent|lead|people\b/.test(lower)) return { view: 'contacts', section: 'overview' };
  if (/\badmin|ticket|support\b/.test(lower)) return { view: 'admin', section: 'tickets' };
  return null;
}

function extractTaskUpdateArgs(text = '', context = {}) {
  const taskId = extractTaskIdOrSelected(text, context);
  if (!taskId) return null;
  const args = { task_id: taskId };
  const title = firstMatch(text, /\btitle\s*(?:to|=|:|-)\s*([^,\n]+)/i);
  const notes = firstMatch(text, /\b(?:notes?|description)\s*(?:to|=|:|-)\s*([\s\S]+)/i);
  const assignee = firstMatch(text, /\bassign(?:ed)?\s*(?:to|=|:|-)\s*([^,\n]+)/i);
  const dueDate = firstMatch(text, /\b(?:due|date)\s*(?:to|=|:|-)\s*([^,\n]+)/i);
  const stage = firstMatch(text, /\b(?:stage|status)\s*(?:to|=|:|-)\s*(raw input|needs decision|assigned|in progress|done|archive|raw_input|needs_decision|in_progress)/i);
  if (title) args.title = title;
  if (notes) args.notes = notes;
  if (assignee) args.assigned_to = assignee;
  if (dueDate) args.due_date = dueDate;
  if (stage) args.stage = stage.replace(/\s+/g, '_').toLowerCase();
  return Object.keys(args).length > 1 ? args : null;
}

function deterministicPlan(message = '', registry, context = {}) {
  const text = compactText(redactText(message), 4000);
  const lower = text.toLowerCase();
  const actions = [];
  let reply = 'I can help with that.';

  if (/\b(capture|save|remember|raw intake|ramble|transcript|recording|goal mode|set (it|this|that) as a goal|make (it|this|that) a goal|from now on|always|never|every time|do all those things|finish everything)\b/i.test(text)) {
    const tool = scopedTool(registry, context, 'capture_ramble', 'capture_raw_intake');
    reply = 'I can capture this as raw intake, parse it into BNA lanes, and return the raw ID plus counts.';
    actions.push({
      tool,
      label: 'Capture raw intake',
      args: {
        raw_text: text,
        source_type: 'operations_helper',
        source_channel: 'operations_helper',
        project_key: context.projectKey || undefined,
      },
      reason: 'Universal natural-language intake request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(view|show|list)\b.*\b(parent[-\s]?visible notes?|parent notes?|notes? for parents?|family[-\s]?visible notes?)\b/i.test(text)) {
    reply = 'I can show scoped parent-visible note previews without returning private notes or metadata.';
    actions.push({
      tool: 'view_parent_visible_notes',
      label: 'View parent-visible notes',
      args: studentSummaryArgs(text, context),
      reason: 'Rabbi / One Time parent-visible notes request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(show|view|check|list)\b.*\b(student progress|progress for parent|parent progress|my progress|child progress)\b/i.test(text)) {
    const tool = /\b(parent|child)\b/i.test(text) ? 'show_student_progress_for_parent' : 'show_student_progress';
    reply = tool === 'show_student_progress_for_parent'
      ? 'I can show parent-visible One Time student progress without private notes, access codes, or raw links.'
      : 'I can show student-visible One Time progress without private notes, access codes, or raw links.';
    actions.push({
      tool,
      label: tool === 'show_student_progress_for_parent' ? 'Show parent-visible progress' : 'Show student progress',
      args: studentSummaryArgs(text, context),
      reason: 'Rabbi / One Time student progress request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(show|view|list|check)\b.*\b(my assignments?|student assignments?|assignments?|homework)\b/i.test(text)) {
    const tool = /\b(my|student)\b/i.test(text) ? 'show_my_assignments' : 'show_assignments';
    reply = tool === 'show_my_assignments'
      ? 'I can show student-visible One Time assignments without worksheet bodies, raw instructions, or private links.'
      : 'I can show parent-visible One Time assignments without worksheet bodies, raw instructions, or private links.';
    actions.push({
      tool,
      label: tool === 'show_my_assignments' ? 'Show my assignments' : 'Show assignments',
      args: studentSummaryArgs(text, context),
      reason: 'Rabbi / One Time assignment summary request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(show|view|list|check)\b.*\b(my goals?|student goals?)\b|\bwhat are my goals?\b/i.test(text)) {
    reply = 'I can show student-visible One Time goals without raw notes or private metadata.';
    actions.push({
      tool: 'show_my_goals',
      label: 'Show my goals',
      args: studentSummaryArgs(text, context),
      reason: 'Rabbi / One Time student goal request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(show|view|list|check)\b.*\b(child|children|kid|student)\b.*\b(calendar|schedule)\b/i.test(text)) {
    reply = 'I can show the parent-visible child calendar without returning meeting links.';
    actions.push({
      tool: 'show_child_calendar',
      label: 'Show child calendar',
      args: studentSummaryArgs(text, context),
      reason: 'Rabbi / One Time child calendar request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(show|view|list)\b.*\b(parent students?|student roster|students|children|kids|roster)\b/i.test(text)) {
    const tool = /\bparent students?\b/i.test(text) ? 'show_parent_students' : 'list_students';
    reply = 'I can list scoped One Time student summaries without parent contact values, access codes, or private notes.';
    actions.push({
      tool,
      label: tool === 'show_parent_students' ? 'Show parent students' : 'List students',
      args: studentSummaryArgs(text, context),
      reason: 'Rabbi / One Time student summary request',
    });
  } else if (/\b(show|list|status)\b.*\b(goals?|quality goals?|watchdog goals?)\b|\bwhat goals?\b/i.test(text)) {
    const tool = scopedTool(registry, context, 'show_operating_goals', 'show_goal_status');
    reply = 'I can show the related BNA standing goals.';
    actions.push({
      tool,
      label: 'Show related goals',
      args: { text },
      reason: 'Goal memory status request',
    });
  } else if (/\b(run|start|create|request)\b.*\bwatchdog\b.*\b(audit|check|scan)\b|\bwatchdog\b.*\b(audit|check|scan)\b/i.test(text)) {
    reply = 'I can create a Codex-owned watchdog audit request.';
    actions.push({
      tool: 'run_watchdog_audit',
      label: 'Request watchdog audit',
      args: { reason: text, project_key: context.projectKey || undefined },
      reason: 'Watchdog audit helper request',
    });
  } else if (/\b(show|audit|status|report)\b.*\b(codex|agent|queue)\b/.test(lower)) {
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
  } else if (/\b(create|add|make|set up|setup|build)\b.*\b(automation|workflow)\b/i.test(text)) {
    const billing = /\b(billing|payment|invoice|tuition|green invoice|stripe)\b/i.test(text);
    reply = billing
      ? 'I can create a guarded local billing workflow draft without sending reminders or changing payments.'
      : 'I can create a guarded local automation draft without running it.';
    actions.push({
      tool: 'create_automation',
      label: billing ? 'Create billing workflow draft' : 'Create automation draft',
      args: automationCreateArgs(text, context),
      reason: billing ? 'Billing workflow helper request' : 'Automation helper request',
    });
  } else if (/\b(disable|pause|turn off|stop|enable|turn on|reactivate|unpause|edit|update|change|block)\b.*\b(automation|workflow)\b/i.test(text)) {
    const args = automationUpdateArgs(text, context);
    reply = args.automation_id
      ? `I can update automation #${args.automation_id} metadata without running it.`
      : 'I can update the selected automation once its ID is available.';
    actions.push({
      tool: 'update_automation',
      label: args.enabled === false ? 'Pause automation' : args.enabled === true ? 'Re-enable automation' : 'Update automation',
      args,
      reason: 'Automation edit helper request',
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
  } else if (isRabbiOneTimeContext(context) && /\b(launch checklist|launch readiness|one time checklist|rabbi checklist|what still blocks launch)\b/i.test(text)) {
    reply = 'I can show the scoped One Time launch checklist without changing anything.';
    actions.push({
      tool: 'show_one_time_launch_checklist',
      label: 'Show One Time launch checklist',
      args: { workspace_key: context.workspaceKey || undefined, project_key: context.projectKey || undefined },
      reason: 'Rabbi / One Time launch checklist request',
    });
  } else if (isRabbiOneTimeContext(context) && /\bopen\b.*\b(?:calendar\s*)?event\s*#?\s*\d+\b/i.test(text)) {
    const eventId = extractCalendarEventId(text);
    reply = eventId ? `I can open scoped calendar event #${eventId}.` : 'I can open the scoped calendar event once its ID is supplied.';
    actions.push({
      tool: 'open_calendar_event',
      label: eventId ? `Open calendar event #${eventId}` : 'Open calendar event',
      args: { event_id: eventId || undefined, workspace_key: context.workspaceKey || undefined, project_key: context.projectKey || undefined },
      reason: 'Rabbi / One Time calendar event request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(list|show|what|view)\b.*\b(calendar sessions?|class sessions?|upcoming sessions?|schedule)\b|\b(upcoming|next)\b.*\b(class|shiur|session|calendar)\b/i.test(text)) {
    reply = 'I can list scoped One Time calendar sessions without returning meeting links.';
    actions.push({
      tool: 'list_calendar_sessions',
      label: 'List One Time calendar sessions',
      args: { workspace_key: context.workspaceKey || undefined, project_key: context.projectKey || undefined },
      reason: 'Rabbi / One Time calendar list request',
    });
  } else if (isRabbiOneTimeContext(context) && /\bopen\b.*\b(content(?: item)?|recording|library item)\s*#?\s*\d+\b/i.test(text)) {
    const contentId = extractContentId(text);
    reply = contentId ? `I can open scoped content item #${contentId}.` : 'I can open the scoped content item once its ID is supplied.';
    actions.push({
      tool: 'open_content_item_url',
      label: contentId ? `Open content item #${contentId}` : 'Open content item',
      args: { content_id: contentId || undefined, workspace_key: context.workspaceKey || undefined, project_key: context.projectKey || undefined },
      reason: 'Rabbi / One Time content item request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(view|show|list|check)\b.*\b(email log|recent emails|email history)\b/i.test(text)) {
    reply = 'I can show scoped One Time email log summaries without returning bodies or raw addresses.';
    actions.push({
      tool: 'view_email_log',
      label: 'View One Time email log',
      args: { workspace_key: context.workspaceKey || undefined, project_key: context.projectKey || undefined },
      reason: 'Rabbi / One Time email log request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(show|view|list|check)\b.*\b(contact|communication|message|whatsapp|email)\b.*\b(history|thread|timeline|log)\b/i.test(text)) {
    reply = 'I can show scoped communication history summaries once the contact identifier is supplied.';
    actions.push({
      tool: 'show_contact_communication_history',
      label: 'Show contact communication history',
      args: contactHistoryArgs(text, context),
      reason: 'Rabbi / One Time communication history request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(list|show|view|check)\b.*\b(provider leads?|provider contacts?|service provider leads?|provider intake|intake leads?|parent leads?|signups?)\b/i.test(text)) {
    reply = 'I can list scoped One Time contact lead and signup summaries without exposing contact exports.';
    actions.push({
      tool: 'list_provider_leads',
      label: 'List provider contact leads',
      args: { workspace_key: context.workspaceKey || undefined, project_key: context.projectKey || undefined },
      reason: 'Rabbi / One Time provider contact lead request',
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
  } else if (/\b(?:settings?|setup|configuration)\b.*\b(?:calendar|classroom)\b|\bcalendar[_\s/-]*classroom\b/i.test(text) && navigationArgs(text, context)) {
    const args = navigationArgs(text, context);
    reply = `I can open ${args.view}${args.section ? ` / ${args.section}` : ''}.`;
    actions.push({ tool: 'open_operations_view', label: `Open ${args.view} / ${args.section || 'overview'}`, args, reason: 'Operations settings navigation request' });
  } else if (/\b(start|open|create|make|set up|setup|launch)\b.{0,90}\b(classroom|learning community|community|course)\b/i.test(text)) {
    reply = 'I can create a provider classroom setup draft and capture the remaining setup questions.';
    actions.push({
      tool: 'create_provider_classroom_draft',
      label: 'Create classroom draft',
      args: providerClassroomArgs(text, context),
      reason: 'Provider classroom/community setup request',
    });
  } else if (/\b(edit|update|change|set)\b.*\btask\b/i.test(text) && extractTaskUpdateArgs(text, context)) {
    const args = extractTaskUpdateArgs(text, context);
    reply = `I can update task #${args.task_id}.`;
    actions.push({ tool: 'update_task', label: 'Update task', args, reason: 'Task edit/update request' });
  } else if (
    /\b(mark|set)\b.*\btask\s*#?\d+\b.*\b(done|complete|completed)\b/.test(lower)
    || (selectedTaskId(context) && /\b(mark|set)\b.*\b(this|selected|current)?\s*\b(done|complete|completed)\b/.test(lower))
  ) {
    const taskId = extractTaskIdOrSelected(text, context);
    reply = `I can mark task #${taskId} done.`;
    actions.push({ tool: 'mark_task_done', label: 'Mark task done', args: { task_id: taskId, verification_notes: 'Marked done by BNA Helper.' }, reason: 'Task completion request' });
  } else if (/\badd\b.*\bcomment\b.*\btask\s*#?\d+\b/.test(lower)) {
    const taskId = extractTaskIdOrSelected(text, context);
    const body = textAfterIntent(text, /(?:comment|note)\s*(?:to|on)?\s*task\s*#?\d+\s*[:\-]?\s*([\s\S]+)$/i, 'Helper comment');
    reply = `I can add that comment to task #${taskId}.`;
    actions.push({ tool: 'add_task_comment', label: 'Add task comment', args: { task_id: taskId, body }, reason: 'Task comment request' });
  } else if (isRabbiOneTimeContext(context) && /\b(route|send|file|create|open)\b.*\b(bug|issue|problem)\b.*\bcodex\b|\bcodex\b.*\b(bug|issue|problem|fix)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:route|send|file|create|open)?\s*(?:a\s*)?(?:bug|issue|problem)\s*(?:to\s*)?(?:codex)?\s*(?:about|for|:|-)?\s*([\s\S]+)$/i, text);
    reply = 'I can route this One Time issue to Codex as a scoped work item.';
    actions.push({
      tool: 'route_bug_to_codex',
      label: 'Route issue to Codex',
      args: {
        title: title.slice(0, 240) || 'Route Rabbi helper issue to Codex',
        issue: text,
        project_key: context.projectKey || undefined,
      },
      reason: 'Rabbi / One Time Codex issue routing request',
    });
  } else if (/\b(report|file|create|open)\b.*\b(problem|bug|issue|support ticket|ticket|help request)\b|\b(broken|not working|looks wrong|looked wrong|error|slow|slowness|lag|laggy|performance|takes forever|loading forever)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:report|file|create|open)?\s*(?:a\s*)?(?:problem|bug|issue|support ticket|ticket|help request)\s*(?:about|for|:|-)?\s*([\s\S]+)$/i, text);
    const tool = isRabbiOneTimeContext(context)
      ? /\bhelp request\b/i.test(text)
        ? 'create_help_request'
        : /\bticket\b/i.test(text)
          ? 'create_ticket'
          : 'create_report_problem_ticket'
      : 'create_support_ticket';
    reply = 'I can create a first-party support ticket with the current page context.';
    actions.push({
      tool,
      label: 'Create support ticket',
      args: {
        title: title.slice(0, 180) || 'Helper support report',
        description: text,
        severity: guessSeverity(text),
        category: guessSupportCategory(text),
        project_key: context.projectKey || undefined,
      },
      reason: 'Problem report request',
    });
  } else if (
    (
      /\b(go to|open|show|return|go back|back to|take me to)\b/i.test(text)
      || /^(tasks?|decisions?|pending|content|calendar|schedule|scheduling|done|activity|students?|contacts?)$/i.test(text.trim())
    )
    && navigationArgs(text, context)
  ) {
    const args = navigationArgs(text, context);
    const label = args.task_id ? `Open task #${args.task_id}` : `Open ${args.view}${args.section ? ` / ${args.section}` : ''}`;
    reply = `I can open ${args.view}${args.section ? ` / ${args.section}` : ''}.`;
    actions.push({ tool: 'open_operations_view', label, args, reason: 'Operations navigation request' });
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
  } else if (isRabbiOneTimeContext(context) && /\b(draft|write|prepare|compose)\b.*\b(parent response|parent reply|reply to parent|parent email)\b/i.test(text)) {
    const body = textAfterIntent(text, /(?:parent response|parent reply|reply to parent|parent email)\s*(?:about|for|:|-)?\s*([\s\S]+)$/i, text);
    reply = 'I can prepare a scoped parent response draft without sending it.';
    actions.push({
      tool: 'draft_parent_response',
      label: 'Draft parent response',
      args: {
        body,
        subject: 'One Time parent response draft',
        project_key: context.projectKey || undefined,
      },
      reason: 'Rabbi / One Time parent-response draft request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(draft|write|prepare|compose)\b.*\b(weekly update|parent update|newsletter|class update)\b/i.test(text)) {
    const body = textAfterIntent(text, /(?:weekly update|parent update|newsletter|class update)\s*(?:about|for|:|-)?\s*([\s\S]+)$/i, text);
    reply = 'I can prepare a scoped One Time weekly update draft without sending it.';
    actions.push({
      tool: 'draft_weekly_update',
      label: 'Draft weekly update',
      args: {
        body,
        subject: 'One Time weekly update draft',
        project_key: context.projectKey || undefined,
      },
      reason: 'Rabbi / One Time weekly update draft request',
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
  } else if (isRabbiOneTimeContext(context) && /\b(create|add|new|prepare|make)\b.*\b(source sheet|source-sheet|mareh mekomos|worksheet sources?)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:source sheet|source-sheet|mareh mekomos|worksheet sources?)\s*(?:for|about|:|-)?\s*([\s\S]+)$/i, text);
    reply = 'I can create a scoped Rabbi source sheet preparation task.';
    actions.push({
      tool: 'create_rabbi_source_sheet_task',
      label: 'Create source sheet task',
      args: {
        title: title || 'Prepare Rabbi source sheet',
        prompt: text,
        project_key: context.projectKey || undefined,
      },
      reason: 'Rabbi / One Time source-sheet task request',
    });
  } else if (isRabbiOneTimeContext(context) && /\b(create|add|new|save|capture)\b.*\b(shiur idea|class idea|lesson idea|torah idea|mishnah topic)\b/i.test(text)) {
    const title = textAfterIntent(text, /(?:shiur idea|class idea|lesson idea|torah idea|mishnah topic)\s*(?:for|about|:|-)?\s*([\s\S]+)$/i, text);
    reply = 'I can create a scoped Rabbi shiur idea task.';
    actions.push({
      tool: 'create_rabbi_shiur_idea',
      label: 'Create shiur idea',
      args: {
        title: title || 'Rabbi shiur idea',
        idea: text,
        project_key: context.projectKey || undefined,
      },
      reason: 'Rabbi / One Time shiur idea request',
    });
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

function deterministicNavigationPlan(message = '', registry, context = {}) {
  const text = compactText(redactText(message), 4000);
  const lower = text.toLowerCase();
  if (
    !(
      /\b(go to|open|show|return|go back|back to|take me to)\b/i.test(text)
      || /^(tasks?|decisions?|pending|content|calendar|schedule|scheduling|done|activity|students?|contacts?)$/i.test(text.trim())
      || /\b(?:settings?|setup|configuration)\b.*\b(?:calendar|classroom)\b|\bcalendar[_\s/-]*classroom\b/i.test(text)
    )
  ) {
    return null;
  }
  const args = navigationArgs(text, context);
  if (!args) return null;
  const action = {
    tool: 'open_operations_view',
    label: args.task_id ? `Open task #${args.task_id}` : `Open ${args.view}${args.section ? ` / ${args.section}` : ''}`,
    args,
    reason: lower.includes('setting') || lower.includes('classroom')
      ? 'Operations settings navigation request'
      : 'Operations navigation request',
  };
  if (!registry.get(action.tool)) return null;
  return {
    reply: `I can open ${args.view}${args.section ? ` / ${args.section}` : ''}.`,
    actions: [action],
    planner: 'deterministic',
  };
}

function deterministicPriorityPlan(message = '', registry, context = {}) {
  const navigation = deterministicNavigationPlan(message, registry, context);
  if (navigation) return navigation;
  const plan = deterministicPlan(message, registry, context);
  const priorityTools = new Set([
    'create_support_ticket',
    'update_task',
    'mark_task_done',
    'add_task_comment',
  ]);
  if (plan.actions.length === 1 && priorityTools.has(plan.actions[0].tool)) return plan;
  return null;
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
          'Use capture_raw_intake for rambles, transcripts, uploaded-class notes, goal-mode requests, and durable memory phrases before creating ordinary tasks.',
          'Use show_goal_status for goal-memory/status questions and run_watchdog_audit for watchdog audit requests.',
          'For Rabbi / One Time scope, prefer Rabbi-specific aliases such as capture_ramble, show_operating_goals, create_rabbi_source_sheet_task, create_rabbi_shiur_idea, route_bug_to_codex, draft_parent_response, draft_weekly_update, create_ticket, create_help_request, and create_report_problem_ticket when available.',
          'External sends, social publishing, payments, destructive changes, and Buffer scheduling require confirmation.',
          'Use open_operations_view for navigation requests such as open tasks, decisions, pending, content, calendar, or a task detail.',
          'Use create_support_ticket for problem, bug, broken UI, or support-ticket reports.',
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
  const priority = deterministicPriorityPlan(message, registry, context);
  if (priority) return priority;
  const ai = await aiPlan(message, registry, context);
  if (ai && ai.actions.length) return ai;
  return deterministicPlan(message, registry, context);
}

module.exports = {
  buildHelperPlan,
  deterministicPlan,
  parsePlannerJson,
};
