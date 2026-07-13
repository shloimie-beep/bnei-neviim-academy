const crypto = require('crypto');
const { normalizeEmail } = require('../../integrations/resend-client');
const {
  communicationAgentMetadata,
  resolveAssignedCommunicationAgent,
} = require('./communication-agent-runtime');

function compact(value = '', max = 1000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function normalizePhoneDigits(value = '') {
  return String(value || '').replace(/\D+/g, '');
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function maskEmail(value = '') {
  const email = normalizeEmail(value);
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '';
  const safeLocal = local.length <= 2
    ? `${local.slice(0, 1)}*`
    : `${local.slice(0, 1)}***${local.slice(-1)}`;
  return `${safeLocal}@${domain}`;
}

function maskPhoneDigits(value = '') {
  const digits = normalizePhoneDigits(value);
  if (!digits) return '';
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function redactedIdentitySummary(identity = {}) {
  const normalized = normalizeIdentity(identity);
  const identityKey = normalized.email || normalized.whatsapp || normalized.phone || normalized.raw_address;
  return {
    identity_type: normalized.email ? 'email' : normalized.whatsapp ? 'whatsapp' : normalized.phone ? 'phone' : identityKey ? 'other' : 'unknown',
    email_masked: normalized.email ? maskEmail(normalized.email) : null,
    phone_masked: normalized.whatsapp || normalized.phone ? maskPhoneDigits(normalized.whatsapp || normalized.phone) : null,
    identity_fingerprint: identityKey ? sha256(identityKey).slice(0, 16) : null,
    raw_identity_returned: false,
  };
}

function buildInboundPipelineReceipt({
  success = true,
  duplicate = false,
  ignored = false,
  reason = '',
  channel = '',
  provider = '',
  workspaceKey = '',
  projectKey = '',
  communicationId = null,
  contactId = null,
  providerMessageId = '',
  providerEventId = '',
  threadKey = '',
  sender = {},
  taskCreated = false,
  agentReplyMode = 'capture_only',
  agentLoaded = false,
  agentKey = '',
  agentVersion = '',
  knowledgeSnapshotVersion = '',
  outboxStatus = 'not_created',
} = {}) {
  return {
    success: Boolean(success),
    ignored: Boolean(ignored),
    duplicate: Boolean(duplicate),
    reason: reason || null,
    channel: compact(channel, 40) || null,
    provider: compact(provider, 80) || null,
    workspace_key: compact(workspaceKey, 120) || null,
    project_key: compact(projectKey, 120) || null,
    communication_id: communicationId || null,
    contact_id: contactId || null,
    thread_key_hash: threadKey ? sha256(threadKey).slice(0, 16) : null,
    provider_message_hash: providerMessageId ? sha256(providerMessageId).slice(0, 16) : null,
    provider_event_hash: providerEventId ? sha256(providerEventId).slice(0, 16) : null,
    sender: redactedIdentitySummary(sender),
    body_returned: false,
    html_returned: false,
    raw_headers_returned: false,
    raw_payload_returned: false,
    task_created: Boolean(taskCreated),
    unread: !duplicate && !ignored,
    agent_loaded: Boolean(agentLoaded),
    agent_key: compact(agentKey, 120) || null,
    agent_version: compact(agentVersion, 120) || null,
    knowledge_snapshot_version: compact(knowledgeSnapshotVersion, 240) || null,
    agent_reply_mode: agentReplyMode || 'capture_only',
    outbox_status: outboxStatus || 'not_created',
    external_write_performed: false,
    redacted_receipt: true,
  };
}

function normalizeIdentity(identity = {}) {
  const email = normalizeEmail(identity.email || identity.address || '');
  const phone = normalizePhoneDigits(identity.phone || identity.address || '');
  const whatsapp = normalizePhoneDigits(identity.whatsapp || identity.phone || identity.address || '');
  return {
    display_name: compact(identity.displayName || identity.display_name || identity.name || '', 180),
    raw_address: compact(identity.address || identity.email || identity.phone || identity.whatsapp || '', 240),
    email,
    phone,
    whatsapp,
  };
}

async function resolveWorkspaceId(db, { workspaceId = null, workspaceKey = '' } = {}) {
  if (workspaceId) return workspaceId;
  const key = compact(workspaceKey, 120);
  if (!key) return null;
  const result = await db.query(
    'SELECT id FROM bna_workspace_settings WHERE workspace_key = $1 LIMIT 1',
    [key]
  );
  return result.rows[0]?.id || null;
}

async function resolveProjectId(db, { projectId = null, projectKey = '' } = {}) {
  if (projectId) return projectId;
  const key = compact(projectKey, 120);
  if (!key) return null;
  const result = await db.query(
    'SELECT id FROM bna_projects WHERE project_key = $1 LIMIT 1',
    [key]
  );
  return result.rows[0]?.id || null;
}

async function findExistingInboundCommunication(db, {
  provider = '',
  direction = 'inbound',
  providerMessageId = '',
  providerEventId = '',
  emailMessageId = '',
  wapiMessageId = '',
} = {}) {
  const result = await db.query(
    `SELECT *
     FROM bna_communications
     WHERE provider = $1
       AND direction = $2
       AND (
         ($3 <> '' AND external_message_id = $3)
         OR ($4 <> '' AND metadata->>'provider_event_id' = $4)
         OR ($4 <> '' AND metadata->>'resend_event_id' = $4)
         OR ($3 <> '' AND metadata->>'resend_received_email_id' = $3)
         OR ($5 <> '' AND metadata->>'email_message_id' = $5)
         OR ($6 <> '' AND metadata->>'wapi_message_id' = $6)
       )
     ORDER BY occurred_at DESC, id DESC
     LIMIT 1`,
    [
      compact(provider, 80),
      compact(direction, 20) || 'inbound',
      compact(providerMessageId, 240),
      compact(providerEventId, 240),
      compact(emailMessageId, 240),
      compact(wapiMessageId, 240),
    ]
  );
  return result.rows[0] || null;
}

async function upsertContactIdentity(db, {
  workspaceId,
  contactId,
  identityType,
  identityValue,
  normalizedValue,
  metadata = {},
} = {}) {
  if (!workspaceId || !contactId || !identityType || !normalizedValue) return null;
  const result = await db.query(
    `INSERT INTO bna_contact_identities (
       workspace_id, contact_id, identity_type, identity_value, normalized_value, verified, metadata
     ) VALUES ($1, $2, $3, $4, $5, false, $6::jsonb)
     ON CONFLICT (workspace_id, identity_type, normalized_value) WHERE workspace_id IS NOT NULL DO UPDATE SET
       contact_id = EXCLUDED.contact_id,
       identity_value = EXCLUDED.identity_value,
       metadata = COALESCE(bna_contact_identities.metadata, '{}'::jsonb) || EXCLUDED.metadata
     RETURNING *`,
    [
      workspaceId,
      contactId,
      identityType,
      compact(identityValue, 240),
      compact(normalizedValue, 240),
      JSON.stringify(metadata || {}),
    ]
  ).catch(() => ({ rows: [] }));
  return result.rows[0] || null;
}

async function resolveOrCreateWorkspaceContact(db, {
  workspaceId,
  sender = {},
  source = 'inbound_communication',
  tags = [],
  metadata = {},
  status = 'lead',
} = {}) {
  const identity = normalizeIdentity(sender);
  if (!workspaceId || (!identity.email && !identity.phone && !identity.whatsapp)) return null;
  const existing = (await db.query(
    `SELECT c.*
     FROM bna_contacts c
     LEFT JOIN bna_contact_identities i ON i.contact_id = c.id AND i.workspace_id = c.workspace_id
     WHERE c.workspace_id = $1
       AND (
         ($2 <> '' AND lower(COALESCE(c.primary_email, '')) = $2)
         OR ($3 <> '' AND regexp_replace(COALESCE(c.primary_phone, ''), '\\D', '', 'g') = $3)
         OR (i.workspace_id = $1 AND (
           ($2 <> '' AND i.identity_type = 'email' AND i.normalized_value = $2)
           OR ($3 <> '' AND i.identity_type = 'phone' AND i.normalized_value = $3)
           OR ($4 <> '' AND i.identity_type = 'whatsapp' AND i.normalized_value = $4)
         ))
       )
     ORDER BY c.updated_at DESC NULLS LAST, c.created_at ASC
     LIMIT 1`,
    [workspaceId, identity.email, identity.phone, identity.whatsapp]
  )).rows[0] || null;
  const mergedMetadata = {
    source,
    lifecycle: metadata.lifecycle || metadata.lifecycle_status || 'New Inquiry',
    ...metadata,
  };
  const cleanTags = [...new Set((Array.isArray(tags) ? tags : []).map((tag) => compact(tag, 80)).filter(Boolean))];
  const result = existing
    ? await db.query(
      `UPDATE bna_contacts
       SET full_name = COALESCE(NULLIF($2, ''), full_name),
           primary_email = COALESCE(NULLIF($3, ''), primary_email),
           primary_phone = COALESCE(NULLIF($4, ''), primary_phone),
           source = COALESCE(source, $5),
           tags = (
             SELECT ARRAY(
               SELECT DISTINCT tag_value
               FROM unnest(COALESCE(tags, ARRAY[]::text[]) || $6::text[]) AS tag_values(tag_value)
               WHERE trim(tag_value) <> ''
             )
           ),
           metadata = COALESCE(metadata, '{}'::jsonb) || $7::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        existing.id,
        identity.display_name,
        identity.email,
        identity.phone || identity.whatsapp,
        source,
        cleanTags,
        JSON.stringify(mergedMetadata),
      ]
    )
    : await db.query(
      `INSERT INTO bna_contacts (
         workspace_id, full_name, primary_email, primary_phone, status, source, tags, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING *`,
      [
        workspaceId,
        identity.display_name || null,
        identity.email || null,
        identity.phone || identity.whatsapp || null,
        status || 'lead',
        source,
        cleanTags,
        JSON.stringify(mergedMetadata),
      ]
    );
  const contact = result.rows[0] || null;
  if (!contact) return null;
  const identityMetadata = { source, ...metadata };
  if (identity.email) {
    await upsertContactIdentity(db, {
      workspaceId,
      contactId: contact.id,
      identityType: 'email',
      identityValue: identity.email,
      normalizedValue: identity.email,
      metadata: identityMetadata,
    });
  }
  if (identity.phone) {
    await upsertContactIdentity(db, {
      workspaceId,
      contactId: contact.id,
      identityType: 'phone',
      identityValue: sender.phone || sender.address || identity.phone,
      normalizedValue: identity.phone,
      metadata: identityMetadata,
    });
  }
  if (identity.whatsapp) {
    await upsertContactIdentity(db, {
      workspaceId,
      contactId: contact.id,
      identityType: 'whatsapp',
      identityValue: sender.whatsapp || sender.phone || sender.address || identity.whatsapp,
      normalizedValue: identity.whatsapp,
      metadata: identityMetadata,
    });
  }
  return contact;
}

async function resolveThreadKey(db, {
  projectId = null,
  provider = '',
  channel = '',
  contactId = null,
  sender = {},
  subject = '',
  threadHints = {},
} = {}) {
  const relatedIds = [
    threadHints.inReplyTo,
    ...(Array.isArray(threadHints.references) ? threadHints.references : []),
  ].map((item) => compact(item, 240)).filter(Boolean);
  if (projectId && relatedIds.length) {
    const result = await db.query(
      `SELECT thread_key
       FROM bna_communications
       WHERE project_id = $1
         AND provider = $2
         AND thread_key IS NOT NULL
         AND (
           external_message_id = ANY($3::text[])
           OR metadata->>'email_message_id' = ANY($3::text[])
         )
       ORDER BY occurred_at DESC, id DESC
       LIMIT 1`,
      [projectId, compact(provider, 80), relatedIds]
    );
    if (result.rows[0]?.thread_key) return result.rows[0].thread_key;
  }
  const emailMessageId = compact(threadHints.emailMessageId, 240).replace(/[<>]/g, '');
  if (emailMessageId) return `${compact(provider, 40) || 'provider'}:${emailMessageId}`.slice(0, 220);
  const chatId = compact(threadHints.chatId || threadHints.threadKey, 180);
  if (chatId) return `${compact(provider, 40) || compact(channel, 40) || 'provider'}:${chatId}`.slice(0, 220);
  const identity = normalizeIdentity(sender);
  const identityKey = identity.email || identity.whatsapp || identity.phone || contactId || 'unknown';
  const subjectKey = compact(subject, 180).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'no_subject';
  return `${compact(provider, 40) || compact(channel, 40) || 'provider'}:${projectId || 'project'}:${identityKey}:${subjectKey}`.slice(0, 220);
}

async function ingestInboundCommunication({
  db,
  binding = {},
  channel = '',
  provider = '',
  communicationType = '',
  providerMessageId = '',
  providerEventId = '',
  sender = {},
  recipients = [],
  subject = '',
  bodyText = '',
  bodyHtml = '',
  occurredAt = null,
  threadHints = {},
  metadata = {},
  contact = {},
  direction = 'inbound',
  createContactOnInbound = true,
  createConversationOnInbound = true,
  createTaskOnInbound = false,
} = {}) {
  if (!db || typeof db.query !== 'function') throw new Error('db.query is required');
  const normalizedDirection = compact(direction, 20) || 'inbound';
  const normalizedProvider = compact(provider, 80) || compact(channel, 80) || 'unknown';
  const assignedAgent = resolveAssignedCommunicationAgent({
    binding,
    channel,
    provider: normalizedProvider,
  });
  const agentMetadata = communicationAgentMetadata(assignedAgent);
  const emailMessageId = compact(threadHints.emailMessageId || metadata.email_message_id || '', 240);
  const wapiMessageId = compact(threadHints.wapiMessageId || metadata.wapi_message_id || providerMessageId || '', 240);
  const existing = await findExistingInboundCommunication(db, {
    provider: normalizedProvider,
    direction: normalizedDirection,
    providerMessageId,
    providerEventId,
    emailMessageId,
    wapiMessageId,
  });
  if (existing) {
    return {
      success: true,
      duplicate: true,
      communication_id: existing.id,
      contact_id: existing.contact_id || null,
      provider_message_id: existing.external_message_id || providerMessageId || null,
      thread_key: existing.thread_key || null,
      receipt: buildInboundPipelineReceipt({
        duplicate: true,
        channel,
        provider: normalizedProvider,
        workspaceKey: binding.workspaceKey || binding.workspace_key || '',
        projectKey: binding.projectKey || binding.project_key || '',
        communicationId: existing.id,
        contactId: existing.contact_id || null,
        providerMessageId: existing.external_message_id || providerMessageId,
        providerEventId,
        threadKey: existing.thread_key || '',
        sender,
        taskCreated: false,
        agentReplyMode: agentMetadata.agent_reply_mode || binding.replyMode || binding.reply_mode || 'capture_only',
        agentLoaded: agentMetadata.agent_loaded,
        agentKey: agentMetadata.agent_key || '',
        agentVersion: agentMetadata.agent_version || '',
        knowledgeSnapshotVersion: agentMetadata.knowledge_snapshot_version || '',
        outboxStatus: agentMetadata.outbox_status || 'not_created',
      }),
      redacted_receipt: true,
    };
  }
  const workspaceId = await resolveWorkspaceId(db, {
    workspaceId: binding.workspaceId || binding.workspace_id || null,
    workspaceKey: binding.workspaceKey || binding.workspace_key || '',
  });
  const projectId = await resolveProjectId(db, {
    projectId: binding.projectId || binding.project_id || null,
    projectKey: binding.projectKey || binding.project_key || '',
  });
  const workspaceKey = compact(binding.workspaceKey || binding.workspace_key || '', 120);
  const projectKey = compact(binding.projectKey || binding.project_key || '', 120);
  const senderIdentity = normalizeIdentity(sender);
  const shouldCreateContact = normalizedDirection === 'inbound' && createContactOnInbound !== false;
  const crmContact = shouldCreateContact
    ? await resolveOrCreateWorkspaceContact(db, {
      workspaceId,
      sender,
      source: contact.source || `${normalizedProvider}_inbound`,
      status: contact.status || 'lead',
      tags: contact.tags || [normalizedProvider, channel, projectKey, workspaceKey],
      metadata: {
        workspace_key: workspaceKey,
        project_key: projectKey,
        lifecycle: contact.lifecycle || contact.lifecycle_status || 'New Inquiry',
        ...contact.metadata,
      },
    })
    : null;
  const threadKey = createConversationOnInbound === false
    ? null
    : await resolveThreadKey(db, {
      projectId,
      provider: normalizedProvider,
      channel,
      contactId: crmContact?.id || null,
      sender,
      subject,
      threadHints,
    });
  const recipientText = Array.isArray(recipients)
    ? recipients.map((item) => typeof item === 'string' ? item : item.address || item.email || item.phone || '').filter(Boolean).join(', ')
    : compact(recipients, 500);
  const canonicalMetadata = {
    ...metadata,
    provider: normalizedProvider,
    provider_event_id: compact(providerEventId, 240) || null,
    provider_message_id: compact(providerMessageId, 240) || null,
    channel,
    workspace_key: workspaceKey,
    project_key: projectKey,
    sender_identity_type: senderIdentity.email ? 'email' : senderIdentity.whatsapp ? 'whatsapp' : senderIdentity.phone ? 'phone' : 'unknown',
    create_contact_on_inbound: createContactOnInbound !== false,
    create_conversation_on_inbound: createConversationOnInbound !== false,
    create_task_on_inbound: createTaskOnInbound === true,
    task_created: false,
    binding_resolved: Boolean(workspaceId || projectId || workspaceKey || projectKey),
    contact_resolution_status: crmContact?.id ? 'resolved' : 'not_resolved',
    conversation_resolved: Boolean(threadKey),
    message_persisted: true,
    timeline_projection: 'operations_communications_unified_timeline',
    unread: normalizedDirection === 'inbound',
    ...agentMetadata,
    external_write_performed: false,
    inbound_pipeline_version: '2026-07-13-v1',
    redacted_receipt: true,
  };
  const result = await db.query(
    `INSERT INTO bna_communications (
       workspace_id, project_id, contact_id, channel, direction, communication_type,
       from_name, from_address, to_address, subject, body_text, body_html,
       external_message_id, thread_key, provider, status, language, metadata, occurred_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11, $12,
       $13, $14, $15, $16, 'en', $17::jsonb, COALESCE($18::timestamp, NOW())
     )
     RETURNING *`,
    [
      workspaceId || null,
      projectId || null,
      crmContact?.id || null,
      compact(channel, 40) || 'web',
      normalizedDirection,
      compact(communicationType, 120) || `${normalizedProvider}_inbound_${compact(channel, 40) || 'message'}`,
      senderIdentity.display_name || null,
      senderIdentity.email || senderIdentity.raw_address || senderIdentity.phone || senderIdentity.whatsapp || null,
      recipientText || null,
      compact(subject, 500) || null,
      bodyText || null,
      bodyHtml || null,
      compact(providerMessageId, 240) || sha256(JSON.stringify({ providerEventId, sender, subject, bodyText }).slice(0, 2000)).slice(0, 64),
      threadKey,
      normalizedProvider,
      normalizedDirection === 'inbound' ? 'received' : 'logged',
      JSON.stringify(canonicalMetadata),
      occurredAt || null,
    ]
  );
  const communication = result.rows[0] || null;
  return {
    success: true,
    duplicate: false,
    communication_id: communication?.id || null,
    contact_id: crmContact?.id || communication?.contact_id || null,
    provider_message_id: communication?.external_message_id || providerMessageId || null,
    thread_key: communication?.thread_key || threadKey || null,
    workspace_key: workspaceKey,
    project_key: projectKey,
    channel,
    provider: normalizedProvider,
    task_created: false,
    receipt: buildInboundPipelineReceipt({
      duplicate: false,
      channel,
      provider: normalizedProvider,
      workspaceKey,
      projectKey,
      communicationId: communication?.id || null,
      contactId: crmContact?.id || communication?.contact_id || null,
      providerMessageId: communication?.external_message_id || providerMessageId || '',
      providerEventId,
      threadKey: communication?.thread_key || threadKey || '',
      sender,
      taskCreated: false,
      agentReplyMode: agentMetadata.agent_reply_mode || binding.replyMode || binding.reply_mode || 'capture_only',
      agentLoaded: agentMetadata.agent_loaded,
      agentKey: agentMetadata.agent_key || '',
      agentVersion: agentMetadata.agent_version || '',
      knowledgeSnapshotVersion: agentMetadata.knowledge_snapshot_version || '',
      outboxStatus: agentMetadata.outbox_status || 'not_created',
    }),
    redacted_receipt: true,
    communication,
    contact: crmContact,
  };
}

module.exports = {
  buildInboundPipelineReceipt,
  findExistingInboundCommunication,
  ingestInboundCommunication,
  maskEmail,
  maskPhoneDigits,
  normalizePhoneDigits,
  resolveOrCreateWorkspaceContact,
};
