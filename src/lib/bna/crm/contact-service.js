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

function createContactService({
  model,
  listContactRows,
  timelineRows,
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
  };
}

module.exports = {
  parseCrmContactRef,
  normalizeContactFilters,
  redactedSuccessEnvelope,
  createContactService,
};
