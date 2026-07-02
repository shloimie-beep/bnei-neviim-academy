const { stableId } = require('../core');
const { buildRabbiEmailTemplate } = require('../../lib/bna/rabbi-emails');
const { compactWhitespace } = require('../../lib/bna/task-shaping');
const { normalizeEmail } = require('../../lib/integrations/resend-client');

const ONE_TIME_RESEND_LOCAL_OUTBOX_VERSION = 'one-time-resend-local-outbox-v1';

const ONE_TIME_RESEND_TEMPLATE_KEYS = Object.freeze([
  'receipt_access',
  'payment_pending',
  'failed_checkout',
  'abandoned_checkout_followup',
  'manual_grant',
  'revoke_expiry',
  'magic_login',
  'class_reminder',
  'parent_update',
  'worksheet_ready',
  'question_response',
  'marketing_announcement',
]);

const MARKETING_TEMPLATE_KEYS = new Set(['marketing_announcement', 'abandoned_checkout_followup']);
const SERVICE_TEMPLATE_KEYS = new Set([
  'receipt_access',
  'payment_pending',
  'failed_checkout',
  'manual_grant',
  'revoke_expiry',
  'magic_login',
  'class_reminder',
  'parent_update',
  'worksheet_ready',
  'question_response',
]);

function truthy(value) {
  if (value === true) return true;
  if (typeof value === 'number') return value > 0;
  return /^(?:1|true|yes|on|approved|current)$/i.test(String(value || '').trim());
}

function htmlFromText(text = '') {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => compactWhitespace(line) ? `<p>${escapeHtml(line)}</p>` : '<br>')
    .join('');
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extraOneTimeTemplate(templateKey = '', context = {}) {
  const name = context.recipientName || context.parentName || context.memberName || 'there';
  const program = context.programName || 'One Time Mishnayos';
  const classTitle = context.classTitle || context.lessonTitle || 'the next class';
  const portalUrl = context.portalUrl || context.memberUrl || context.loginUrl || '';
  const worksheetTitle = context.worksheetTitle || context.resourceTitle || 'the worksheet';
  const questionTopic = context.questionTopic || context.classTitle || 'your question';
  const templates = {
    class_reminder: {
      subject: `${program}: ${classTitle}`,
      text: [
        `Hi ${name},`,
        '',
        `Reminder: ${classTitle} is coming up for ${program}.`,
        context.startAt ? `Time: ${context.startAt}` : '',
        portalUrl ? `Access: ${portalUrl}` : 'The access link will be shared only after approval.',
      ].filter(Boolean).join('\n'),
    },
    parent_update: {
      subject: `${program} parent update`,
      text: [
        `Hi ${name},`,
        '',
        context.summary || `Here is a short ${program} update for your family.`,
        portalUrl ? `Parent portal: ${portalUrl}` : '',
      ].filter(Boolean).join('\n'),
    },
    worksheet_ready: {
      subject: `${program}: ${worksheetTitle} is ready for review`,
      text: [
        `Hi ${name},`,
        '',
        `${worksheetTitle} is ready as a private draft for ${program}.`,
        'It should be reviewed before it is shared with students or parents.',
      ].join('\n'),
    },
    question_response: {
      subject: `${program}: response to ${questionTopic}`,
      text: [
        `Hi ${name},`,
        '',
        context.responseSummary || `Rabbi/provider response draft for ${questionTopic}.`,
        'This remains private until approved for the right audience.',
      ].join('\n'),
    },
    marketing_announcement: {
      subject: context.subject || `${program} update`,
      text: [
        `Hi ${name},`,
        '',
        context.body || `${program} has an update for interested families.`,
        '',
        'You can unsubscribe from marketing updates.',
      ].join('\n'),
    },
  };
  const template = templates[templateKey] || null;
  return template ? { ...template, html: htmlFromText(template.text) } : null;
}

function buildOneTimeResendTemplate(templateKey = 'parent_update', context = {}) {
  const key = ONE_TIME_RESEND_TEMPLATE_KEYS.includes(templateKey) ? templateKey : 'parent_update';
  const extra = extraOneTimeTemplate(key, context);
  const template = extra || buildRabbiEmailTemplate(key, context);
  return {
    template_key: key,
    subject: template.subject,
    text: template.text,
    html: template.html || htmlFromText(template.text),
    audience: context.audience || (key === 'class_reminder' || key === 'worksheet_ready' ? 'members' : 'parents'),
    category: MARKETING_TEMPLATE_KEYS.has(key) ? 'marketing' : 'transactional',
    requires_marketing_consent: MARKETING_TEMPLATE_KEYS.has(key),
    requires_service_email_consent: SERVICE_TEMPLATE_KEYS.has(key),
    unsubscribe_required: MARKETING_TEMPLATE_KEYS.has(key),
  };
}

function recipientSuppressed(recipient = {}, suppressionList = []) {
  const email = normalizeEmail(recipient.email || recipient.to || recipient.parent_email);
  const suppressionEmails = new Set((suppressionList || []).map((item) => normalizeEmail(item.email || item)).filter(Boolean));
  return Boolean(
    recipient.suppressed === true ||
    recipient.do_not_email === true ||
    /^(?:unsubscribed|suppressed|do_not_email|bounced|complained)$/i.test(String(recipient.unsubscribe_status || recipient.email_status || recipient.status || '')) ||
    (email && suppressionEmails.has(email))
  );
}

function consentForTemplate(template = {}, recipient = {}) {
  const consent = recipient.consent || recipient.consents || recipient.consent_records || {};
  const serviceConsent = truthy(consent.service_email_consent ?? recipient.service_email_consent ?? recipient.email_consent);
  const marketingConsent = truthy(consent.marketing_consent ?? recipient.marketing_consent);
  if (template.requires_marketing_consent && !marketingConsent) return { ok: false, missing: 'marketing_consent' };
  if (template.requires_service_email_consent && !serviceConsent) return { ok: false, missing: 'service_email_consent' };
  return { ok: true, missing: null };
}

function buildOneTimeResendOutboxPreview(messages = [], options = {}) {
  const rows = Array.isArray(messages) ? messages : [messages];
  const suppressionList = options.suppression_list || options.suppressionList || [];
  const readiness = options.resendReadiness || options.readiness || {};
  const checkedAt = options.checkedAt || new Date().toISOString();
  const drafts = rows.map((message, index) => {
    const template = buildOneTimeResendTemplate(message.template_key || message.templateKey || 'parent_update', {
      ...options.context,
      ...message.context,
      recipientName: message.recipient_name || message.recipientName || message.parent_name || message.member_name,
      subject: message.subject,
      body: message.body,
      summary: message.summary,
    });
    const to = normalizeEmail(message.to || message.email || message.parent_email || message.member_email || '');
    const suppression = recipientSuppressed({ ...message, email: to }, suppressionList);
    const consent = consentForTemplate(template, message);
    const blockers = [];
    if (!to) blockers.push('missing_recipient_email');
    if (suppression) blockers.push('recipient_suppressed');
    if (!consent.ok) blockers.push(`missing_consent:${consent.missing}`);
    if (message.approved_for_send !== true) blockers.push('send_not_operator_approved');
    if (!readiness.domain_verified) blockers.push('resend_domain_not_verified_for_live_send');
    return {
      draft_id: stableId('EMAILDRAFT', [template.template_key, to || index, template.subject, checkedAt.slice(0, 10)]),
      template_key: template.template_key,
      to,
      recipient_name: compactWhitespace(message.recipient_name || message.recipientName || message.parent_name || message.member_name || ''),
      subject: template.subject,
      text: template.text,
      html: template.html,
      category: template.category,
      audience: template.audience,
      status: blockers.filter((blocker) => blocker !== 'send_not_operator_approved' && blocker !== 'resend_domain_not_verified_for_live_send').length
        ? 'blocked_needs_review'
        : 'draft_ready_no_send',
      blockers,
      unsubscribe_required: template.unsubscribe_required,
      unsubscribe_url_placeholder: template.unsubscribe_required ? '{{one_time_unsubscribe_url}}' : null,
      consent,
      preview_only: true,
      send_performed: false,
      external_write_performed: false,
      metadata: {
        source_raw_id: message.raw_id || message.rawId || null,
        related_record_id: message.related_record_id || message.relatedRecordId || null,
      },
    };
  });
  return {
    outbox_version: ONE_TIME_RESEND_LOCAL_OUTBOX_VERSION,
    checked_at: checkedAt,
    provider: 'resend',
    preview_only: true,
    external_write_performed: false,
    email_send_performed: false,
    secret_values_included: false,
    readiness: {
      configured: Boolean(readiness.configured),
      connected: Boolean(readiness.connected),
      domain_verified: Boolean(readiness.domain_verified),
      mode: readiness.mode || 'local_preview',
      blocker: readiness.blocker || null,
    },
    drafts,
    counts: {
      total: drafts.length,
      draft_ready_no_send: drafts.filter((draft) => draft.status === 'draft_ready_no_send').length,
      blocked_needs_review: drafts.filter((draft) => draft.status === 'blocked_needs_review').length,
      suppressed: drafts.filter((draft) => draft.blockers.includes('recipient_suppressed')).length,
    },
    blocked_actions: ['email_send', 'domain_dns_mutation', 'fallback_send_without_approval'],
    guardrails: [
      'preview_only',
      'email_send_performed_false',
      'service_email_consent_required',
      'marketing_consent_required_for_marketing',
      'suppression_list_honored',
      'resend_domain_required_before_live_send',
    ],
  };
}

module.exports = {
  ONE_TIME_RESEND_LOCAL_OUTBOX_VERSION,
  ONE_TIME_RESEND_TEMPLATE_KEYS,
  buildOneTimeResendOutboxPreview,
  buildOneTimeResendTemplate,
};
