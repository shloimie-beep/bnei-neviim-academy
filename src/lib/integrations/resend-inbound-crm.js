const { normalizeEmail } = require('./resend-client');
const {
  findExistingInboundCommunication,
  ingestInboundCommunication,
} = require('../bna/crm/ingest-inbound-communication');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_INBOUND_DOMAIN = 'onetimeonetime.com';
const ONE_TIME_INBOUND_EMAIL = 'info@onetimeonetime.com';

function compact(value = '', max = 2000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function arrayFrom(value) {
  if (value === null || value === undefined || value === '') return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function emailCandidateStrings(value) {
  if (value === null || value === undefined || value === '') return [];
  if (Array.isArray(value)) return value.flatMap(emailCandidateStrings);
  if (typeof value === 'object') {
    return [
      value.email,
      value.address,
      value.value,
      value.text,
      value.name && value.email ? `${value.name} <${value.email}>` : '',
    ].filter(Boolean);
  }
  return [value];
}

function extractEmailAddresses(value) {
  const rows = emailCandidateStrings(value);
  const found = [];
  for (const row of rows) {
    const matches = String(row || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig) || [];
    for (const match of matches) found.push(match.toLowerCase());
  }
  return [...new Set(found)];
}

function displayNameFromAddress(value = '') {
  const direct = String(value || '').trim();
  const angleIndex = direct.indexOf('<');
  if (angleIndex > 0) {
    return direct.slice(0, angleIndex).replace(/^"|"$/g, '').trim();
  }
  return '';
}

function safeHeaders(headers = {}) {
  const input = headers && typeof headers === 'object' && !Array.isArray(headers) ? headers : {};
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (/api[_-]?key|token|secret|password|authorization|credential|cookie/i.test(key)) continue;
    output[String(key).slice(0, 120)] = Array.isArray(value)
      ? value.map((item) => String(item || '').slice(0, 2000)).slice(0, 25)
      : String(value ?? '').slice(0, 4000);
  }
  return output;
}

function safeAttachments(attachments = []) {
  return arrayFrom(attachments)
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: item.id || null,
      filename: item.filename || item.name || null,
      content_type: item.content_type || item.contentType || null,
      content_disposition: item.content_disposition || item.contentDisposition || null,
      content_id: item.content_id || item.contentId || null,
      size: item.size || null,
    }));
}

function safeEventMetadata(event = {}) {
  const data = event.data && typeof event.data === 'object' ? event.data : {};
  return {
    id: event.id || event.event_id || event.__svix_id || null,
    type: event.type || event.event || null,
    created_at: event.created_at || null,
    data: {
      email_id: data.email_id || data.emailId || null,
      created_at: data.created_at || null,
      from: data.from || null,
      to: extractEmailAddresses(data.to),
      cc: extractEmailAddresses(data.cc),
      bcc: extractEmailAddresses(data.bcc),
      received_for: extractEmailAddresses(data.received_for),
      message_id: data.message_id || data.messageId || null,
      subject: data.subject || null,
      attachments: safeAttachments(data.attachments),
    },
  };
}

function headerLookup(headers = {}, name = '') {
  const wanted = String(name || '').toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (String(key || '').toLowerCase() === wanted) return Array.isArray(value) ? value.join(' ') : String(value || '');
  }
  return '';
}

function headerReferences(value = '') {
  return String(value || '')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function inboundRoutingForEmail(event = {}, receivedEmail = {}) {
  const data = event.data && typeof event.data === 'object' ? event.data : {};
  const toEmails = extractEmailAddresses([receivedEmail.to, data.to]);
  const ccEmails = extractEmailAddresses([receivedEmail.cc, data.cc]);
  const bccEmails = extractEmailAddresses([receivedEmail.bcc, data.bcc]);
  const receivedFor = extractEmailAddresses([receivedEmail.received_for, data.received_for]);
  const allRecipients = [...new Set([...toEmails, ...ccEmails, ...bccEmails, ...receivedFor])];
  const directInfo = allRecipients.includes(ONE_TIME_INBOUND_EMAIL);
  const domainMatched = allRecipients.some((email) => email.endsWith(`@${ONE_TIME_INBOUND_DOMAIN}`));
  return {
    recognized: directInfo || domainMatched,
    reason: directInfo ? 'primary_inbound_address' : domainMatched ? 'onetime_domain_catch_all' : 'unrecognized_recipient',
    workspace_key: directInfo || domainMatched ? ONE_TIME_WORKSPACE_KEY : null,
    project_key: directInfo || domainMatched ? ONE_TIME_PROJECT_KEY : null,
    to_emails: toEmails,
    cc_emails: ccEmails,
    bcc_emails: bccEmails,
    received_for: receivedFor,
    all_recipient_emails: allRecipients,
  };
}

async function processResendInboundEvent({
  db,
  event = {},
  fetchReceivedEmail,
  workspaceId = null,
  projectId = null,
  now = new Date(),
} = {}) {
  if (!db || typeof db.query !== 'function') throw new Error('db.query is required');
  const eventType = String(event.type || event.event || '').trim();
  if (eventType !== 'email.received') {
    return { success: true, ignored: true, reason: 'unsupported_event_type', event_type: eventType };
  }
  const data = event.data && typeof event.data === 'object' ? event.data : {};
  const emailId = String(data.email_id || data.emailId || '').trim();
  const eventId = String(event.id || event.event_id || event.__svix_id || '').trim();
  const eventMessageId = String(data.message_id || data.messageId || '').trim();
  if (!emailId) {
    const error = new Error('email.received event is missing data.email_id');
    error.status = 400;
    throw error;
  }
  const existing = await findExistingInboundCommunication(db, {
    provider: 'resend',
    direction: 'inbound',
    providerMessageId: emailId,
    providerEventId: eventId,
    emailMessageId: eventMessageId,
  });
  if (existing) {
    return {
      success: true,
      duplicate: true,
      communication_id: existing.id,
      provider_message_id: existing.external_message_id || emailId,
      fetched: false,
    };
  }
  if (typeof fetchReceivedEmail !== 'function') throw new Error('fetchReceivedEmail is required');
  const receivedEmail = await fetchReceivedEmail(emailId);
  const routing = inboundRoutingForEmail(event, receivedEmail);
  if (!routing.recognized) {
    return {
      success: true,
      ignored: true,
      reason: routing.reason,
      event_type: eventType,
      provider_message_id: emailId,
      fetched: true,
    };
  }
  const headers = safeHeaders(receivedEmail.headers || {});
  const fromAddress = receivedEmail.from || data.from || '';
  const fromEmail = normalizeEmail(fromAddress);
  const fromName = displayNameFromAddress(fromAddress);
  const emailMessageId = String(receivedEmail.message_id || data.message_id || headerLookup(headers, 'message-id') || '').trim();
  const inReplyTo = String(headerLookup(headers, 'in-reply-to') || '').trim();
  const references = headerReferences(headerLookup(headers, 'references'));
  const existingAfterFetch = await findExistingInboundCommunication(db, {
    provider: 'resend',
    direction: 'inbound',
    providerMessageId: emailId,
    providerEventId: eventId,
    emailMessageId: emailMessageId || eventMessageId,
  });
  if (existingAfterFetch) {
    return {
      success: true,
      duplicate: true,
      communication_id: existingAfterFetch.id,
      provider_message_id: existingAfterFetch.external_message_id || emailId,
      fetched: true,
    };
  }
  const subject = compact(receivedEmail.subject || data.subject || '', 500);
  const attachments = safeAttachments(receivedEmail.attachments || data.attachments || []);
  const metadata = {
    provider: 'resend',
    source: 'resend_email_received',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    routing_reason: routing.reason,
    resend_event_id: eventId || null,
    resend_received_email_id: receivedEmail.id || emailId,
    email_message_id: emailMessageId || null,
    in_reply_to: inReplyTo || null,
    references,
    from_email: fromEmail || null,
    to_emails: routing.to_emails,
    cc_emails: routing.cc_emails,
    bcc_emails: routing.bcc_emails,
    received_for: routing.received_for,
    raw_headers_json: headers,
    attachment_metadata_json: attachments,
    attachment_retrieval_status: attachments.length ? 'metadata_only_follow_up' : 'none',
    raw_event_metadata: safeEventMetadata(event),
  };
  const ingest = await ingestInboundCommunication({
    db,
    binding: {
      workspaceId,
      projectId,
      workspaceKey: ONE_TIME_WORKSPACE_KEY,
      projectKey: ONE_TIME_PROJECT_KEY,
      channelId: 'resend:one_time_inbound_email',
      replyMode: 'draft',
    },
    channel: 'email',
    provider: 'resend',
    communicationType: 'resend_inbound_email',
    providerMessageId: receivedEmail.id || emailId,
    providerEventId: eventId,
    sender: {
      displayName: fromName,
      email: fromEmail,
      address: fromEmail || fromAddress,
    },
    recipients: routing.all_recipient_emails,
    subject,
    bodyText: receivedEmail.text || null,
    bodyHtml: receivedEmail.html || null,
    occurredAt: receivedEmail.created_at || data.created_at || now.toISOString(),
    threadHints: {
      emailMessageId,
      inReplyTo,
      references,
    },
    metadata,
    contact: {
      source: 'resend_inbound',
      lifecycle: 'New Inquiry',
      tags: ['resend_inbound', ONE_TIME_PROJECT_KEY, ONE_TIME_WORKSPACE_KEY],
      metadata: {
        source: 'resend_inbound',
        workspace_key: ONE_TIME_WORKSPACE_KEY,
        project_key: ONE_TIME_PROJECT_KEY,
      },
    },
    createContactOnInbound: true,
    createConversationOnInbound: true,
    createTaskOnInbound: false,
  });
  return {
    success: true,
    ignored: false,
    duplicate: ingest.duplicate === true,
    fetched: true,
    communication_id: ingest.communication_id || null,
    contact_id: ingest.contact_id || null,
    provider_message_id: receivedEmail.id || emailId,
    email_message_id: emailMessageId || null,
    thread_key: ingest.thread_key || null,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    attachment_count: attachments.length,
    receipt: ingest.receipt || null,
    redacted_receipt: ingest.redacted_receipt === true,
  };
}

module.exports = {
  ONE_TIME_INBOUND_DOMAIN,
  ONE_TIME_INBOUND_EMAIL,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  extractEmailAddresses,
  inboundRoutingForEmail,
  processResendInboundEvent,
  safeAttachments,
};
