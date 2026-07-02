const { normalizeEmail } = require('./resend-client');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_INBOUND_DOMAIN = 'onetimeonetime.com';
const ONE_TIME_INBOUND_EMAIL = 'info@onetimeonetime.com';

function compact(value = '', max = 2000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function normalizeSubject(value = '') {
  return compact(value, 240)
    .replace(/^(?:re|fwd?):\s*/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'no_subject';
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

async function findExistingInboundCommunication(db, { eventId = '', emailId = '', messageId = '' } = {}) {
  const result = await db.query(
    `SELECT *
     FROM bna_communications
     WHERE provider = 'resend'
       AND direction = 'inbound'
       AND (
         ($1 <> '' AND external_message_id = $1)
         OR ($1 <> '' AND metadata->>'resend_received_email_id' = $1)
         OR ($2 <> '' AND metadata->>'resend_event_id' = $2)
         OR ($3 <> '' AND metadata->>'email_message_id' = $3)
       )
     ORDER BY occurred_at DESC, id DESC
     LIMIT 1`,
    [emailId || '', eventId || '', messageId || '']
  );
  return result.rows[0] || null;
}

async function upsertSenderContact(db, {
  workspaceId = null,
  fromEmail = '',
  fromName = '',
  projectKey = ONE_TIME_PROJECT_KEY,
  workspaceKey = ONE_TIME_WORKSPACE_KEY,
} = {}) {
  const email = normalizeEmail(fromEmail);
  if (!workspaceId || !email) return null;
  const existing = (await db.query(
    `SELECT c.*
     FROM bna_contacts c
     LEFT JOIN bna_contact_identities i ON i.contact_id = c.id
     WHERE c.workspace_id = $1
       AND (
         lower(COALESCE(c.primary_email, '')) = $2
         OR (i.identity_type = 'email' AND i.normalized_value = $2)
       )
     ORDER BY c.updated_at DESC NULLS LAST, c.created_at ASC
     LIMIT 1`,
    [workspaceId, email]
  )).rows[0] || null;
  const metadata = {
    source: 'resend_inbound',
    project_key: projectKey,
    workspace_key: workspaceKey,
  };
  const tags = ['resend_inbound', projectKey, workspaceKey];
  const result = existing
    ? await db.query(
      `UPDATE bna_contacts
       SET full_name = COALESCE(NULLIF($2, ''), full_name),
           primary_email = COALESCE(NULLIF($3, ''), primary_email),
           source = COALESCE(source, 'resend_inbound'),
           tags = (
             SELECT ARRAY(
               SELECT DISTINCT tag_value
               FROM unnest(COALESCE(tags, ARRAY[]::text[]) || $4::text[]) AS tag_values(tag_value)
               WHERE trim(tag_value) <> ''
             )
           ),
           metadata = COALESCE(metadata, '{}'::jsonb) || $5::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [existing.id, fromName || '', email, tags, JSON.stringify(metadata)]
    )
    : await db.query(
      `INSERT INTO bna_contacts (
         workspace_id, full_name, primary_email, status, source, tags, metadata
       ) VALUES ($1, $2, $3, 'lead', 'resend_inbound', $4, $5::jsonb)
       RETURNING *`,
      [workspaceId, fromName || null, email, tags, JSON.stringify(metadata)]
    );
  const contact = result.rows[0] || null;
  if (contact) {
    await db.query(
      `INSERT INTO bna_contact_identities (
         contact_id, identity_type, identity_value, normalized_value, verified, metadata
       ) VALUES ($1, 'email', $2, $3, false, $4::jsonb)
       ON CONFLICT (identity_type, normalized_value) DO UPDATE SET
         identity_value = EXCLUDED.identity_value,
         verified = bna_contact_identities.verified OR EXCLUDED.verified,
         metadata = COALESCE(bna_contact_identities.metadata, '{}'::jsonb) || EXCLUDED.metadata`,
      [contact.id, email, email, JSON.stringify(metadata)]
    ).catch(() => null);
  }
  return contact;
}

async function resolveThreadKey(db, {
  projectId = null,
  contactId = null,
  fromEmail = '',
  subject = '',
  emailMessageId = '',
  inReplyTo = '',
  references = [],
} = {}) {
  const relatedIds = [...new Set([inReplyTo, ...references].map((item) => String(item || '').trim()).filter(Boolean))];
  if (projectId && relatedIds.length) {
    const result = await db.query(
      `SELECT thread_key
       FROM bna_communications
       WHERE project_id = $1
         AND provider = 'resend'
         AND thread_key IS NOT NULL
         AND (
           external_message_id = ANY($2::text[])
           OR metadata->>'email_message_id' = ANY($2::text[])
         )
       ORDER BY occurred_at DESC, id DESC
       LIMIT 1`,
      [projectId, relatedIds]
    );
    if (result.rows[0]?.thread_key) return result.rows[0].thread_key;
  }
  if (emailMessageId) return `resend:${emailMessageId.replace(/[<>]/g, '').slice(0, 180)}`;
  return `resend:${ONE_TIME_PROJECT_KEY}:${contactId || normalizeEmail(fromEmail) || 'unknown'}:${normalizeSubject(subject)}`;
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
    eventId,
    emailId,
    messageId: eventMessageId,
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
  const emailMessageId = String(receivedEmail.message_id || headerLookup(headers, 'message-id') || data.message_id || '').trim();
  const inReplyTo = String(headerLookup(headers, 'in-reply-to') || '').trim();
  const references = headerReferences(headerLookup(headers, 'references'));
  const existingAfterFetch = await findExistingInboundCommunication(db, {
    eventId,
    emailId,
    messageId: emailMessageId || eventMessageId,
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
  const contact = await upsertSenderContact(db, {
    workspaceId,
    fromEmail,
    fromName,
    projectKey: ONE_TIME_PROJECT_KEY,
    workspaceKey: ONE_TIME_WORKSPACE_KEY,
  });
  const subject = compact(receivedEmail.subject || data.subject || '', 500);
  const threadKey = await resolveThreadKey(db, {
    projectId,
    contactId: contact?.id || null,
    fromEmail,
    subject,
    emailMessageId,
    inReplyTo,
    references,
  });
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
  const result = await db.query(
    `INSERT INTO bna_communications (
       workspace_id, project_id, contact_id, channel, direction, communication_type,
       from_name, from_address, to_address, subject, body_text, body_html,
       external_message_id, thread_key, provider, status, language, metadata, occurred_at
     ) VALUES (
       $1, $2, $3, 'email', 'inbound', 'resend_inbound_email',
       $4, $5, $6, $7, $8, $9,
       $10, $11, 'resend', 'received', 'en', $12::jsonb, COALESCE($13::timestamp, NOW())
     )
     RETURNING *`,
    [
      workspaceId || null,
      projectId || null,
      contact?.id || null,
      fromName || null,
      fromEmail || fromAddress || null,
      routing.all_recipient_emails.join(', '),
      subject || null,
      receivedEmail.text || null,
      receivedEmail.html || null,
      receivedEmail.id || emailId,
      threadKey,
      JSON.stringify(metadata),
      receivedEmail.created_at || data.created_at || now.toISOString(),
    ]
  );
  const communication = result.rows[0] || null;
  return {
    success: true,
    ignored: false,
    duplicate: false,
    fetched: true,
    communication_id: communication?.id || null,
    contact_id: contact?.id || null,
    provider_message_id: receivedEmail.id || emailId,
    email_message_id: emailMessageId || null,
    thread_key: threadKey,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    attachment_count: attachments.length,
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
