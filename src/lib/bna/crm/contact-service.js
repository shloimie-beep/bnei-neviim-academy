'use strict';

function parseCrmContactRef(value = '') {
  const raw = String(value || '').trim();
  const [source, id] = raw.includes(':') ? raw.split(':', 2) : ['bna_contacts', raw];
  return {
    source: ['bna_contacts', 'bna_parent_leads'].includes(source) ? source : 'bna_contacts',
    id: Number(id),
  };
}

function normalizeContactFilters(filters = {}) {
  return {
    contact_type: filters.contact_type || 'all',
    status: filters.status || 'all',
    source: filters.source || 'all',
    tag: filters.tag || 'all',
    search: filters.search || '',
    sort_key: filters.sort_key || 'last_contact_desc',
    limit: filters.limit,
    cursor: filters.cursor,
  };
}

function redactedSuccessEnvelope(payload = {}) {
  return {
    success: true,
    no_send: true,
    no_checkout: true,
    no_access_granted: true,
    no_import_performed: true,
    external_write_performed: false,
    ...payload,
  };
}

function normalizePageOptions(options = {}) {
  const requestedLimit = Number(options.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.floor(requestedLimit), 100))
    : 50;
  return {
    limit,
    cursor: options.cursor || null,
  };
}

function mapConversationDto(row = {}) {
  const context = normalizeSourceContext(row.source_context);
  const channel = row.channel || context.channel || 'internal_note';
  const source = row.source || row.provider || context.source || context.provider || null;
  const haystack = `${channel} ${source} ${row.communication_type || ''}`.toLowerCase();
  const openAction = /whatsapp|wapi|whapi/.test(haystack)
    ? 'whatsapp'
    : (/email|resend|mail/.test(haystack) ? 'email' : null);
  return {
    id: row.id,
    channel,
    direction: row.direction || context.direction || 'internal',
    summary: row.body || row.summary || 'Conversation',
    body: row.notes || row.body || '',
    subject: row.subject || context.subject || null,
    source,
    provider: row.provider || context.provider || source,
    occurred_at: row.occurred_at || row.created_at || null,
    communication_type: row.communication_type || 'communication',
    thread_key: row.thread_key || context.thread_key || context.conversation_id || context.chat_id || context.wapi_chat_id || null,
    external_message_id: row.external_message_id || context.external_message_id || context.message_id || context.email_message_id || context.wapi_message_id || null,
    from_address: row.from_address || context.from_address || context.from_number || null,
    to_address: row.to_address || context.to_address || context.to_number || null,
    status: row.status || context.status || null,
    open_action: openAction,
    no_send: true,
    external_write_performed: false,
  };
}

function isTaskTimelineRow(row = {}) {
  return row.communication_type === 'follow_up_task' || row.channel === 'task';
}

function isSupportTicketTimelineRow(row = {}) {
  return row.communication_type === 'support_ticket' || row.channel === 'support';
}

function normalizeSourceContext(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function mapTaskDto(row = {}) {
  const context = normalizeSourceContext(row.source_context);
  return {
    id: context.task_id || row.task_id || row.id,
    title: row.body || row.title || 'CRM follow-up task',
    notes: row.notes || '',
    assigned_to: context.assigned_to || row.assigned_to || null,
    due_date: context.due_date || row.due_date || null,
    stage: context.stage || row.stage || 'assigned',
    occurred_at: row.occurred_at || row.created_at || null,
    no_send: true,
    external_write_performed: false,
  };
}

function createContactService({
  model,
  listContactRows,
  timelineRows,
  conversationRows,
  taskRows,
  parseContactRef = parseCrmContactRef,
} = {}) {
  if (!model || typeof model.filterCrmContacts !== 'function' || typeof model.buildTimeline !== 'function') {
    throw new Error('CRM contact service requires the CRM contact model.');
  }
  if (typeof listContactRows !== 'function') {
    throw new Error('CRM contact service requires a listContactRows loader.');
  }
  if (typeof timelineRows !== 'function') {
    throw new Error('CRM contact service requires a timelineRows loader.');
  }

  return {
    async listContacts(scope = {}, filters = {}) {
      const normalizedFilters = normalizeContactFilters(filters);
      const rows = await listContactRows(scope, normalizedFilters);
      const aggregate = model.filterCrmContacts(rows, normalizedFilters, scope);
      return redactedSuccessEnvelope({
        ...aggregate,
        aggregate_service: 'bna_crm_contact_service_v1',
      });
    },

    async getContactTimeline(contactKey = '', scope = {}) {
      const contactRef = parseContactRef(contactKey);
      const rows = await timelineRows(contactRef, scope);
      return redactedSuccessEnvelope({
        contact_key: `${contactRef.source}:${contactRef.id || ''}`,
        timeline: model.buildTimeline(rows),
        aggregate_service: 'bna_crm_contact_service_v1',
      });
    },

    async getContactConversations(contactKey = '', scope = {}, options = {}) {
      const page = normalizePageOptions(options);
      const contactRef = parseContactRef(contactKey);
      const loader = typeof conversationRows === 'function'
        ? conversationRows
        : async (ref, scoped, pageOptions) => {
            const rows = await timelineRows(ref, scoped);
            return rows.filter((row) => !isTaskTimelineRow(row) && !isSupportTicketTimelineRow(row));
          };
      const rows = await loader(contactRef, scope, page);
      return redactedSuccessEnvelope({
        contact_key: `${contactRef.source}:${contactRef.id || ''}`,
        conversations: rows.slice(0, page.limit).map(mapConversationDto),
        page: {
          limit: page.limit,
          next_cursor: null,
        },
        aggregate_service: 'bna_crm_contact_service_v1',
      });
    },

    async getContactTasks(contactKey = '', scope = {}, options = {}) {
      const page = normalizePageOptions(options);
      const contactRef = parseContactRef(contactKey);
      const loader = typeof taskRows === 'function'
        ? taskRows
        : async (ref, scoped, pageOptions) => {
            const rows = await timelineRows(ref, scoped);
            return rows.filter(isTaskTimelineRow);
          };
      const rows = await loader(contactRef, scope, page);
      return redactedSuccessEnvelope({
        contact_key: `${contactRef.source}:${contactRef.id || ''}`,
        tasks: rows.slice(0, page.limit).map(mapTaskDto),
        page: {
          limit: page.limit,
          next_cursor: null,
        },
        aggregate_service: 'bna_crm_contact_service_v1',
      });
    },
  };
}

module.exports = {
  parseCrmContactRef,
  normalizeContactFilters,
  normalizePageOptions,
  redactedSuccessEnvelope,
  createContactService,
};
