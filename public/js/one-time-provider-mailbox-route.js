(function () {
  'use strict';

  const MODULE_ID = 'one-time-provider-mailbox-route';
  const DEFAULT_INBOX = 'info@onetimeonetime.com';

  function routeHelpers(explicitHelpers) {
    return explicitHelpers
      || (typeof window.OneTimeProviderMailboxRouteHelpers === 'function'
        ? window.OneTimeProviderMailboxRouteHelpers()
        : {})
      || {};
  }

  function stateFrom(helpers) {
    return helpers.providerMailboxState || {};
  }

  function escapeHtml(helpers, value) {
    if (typeof helpers.escapeHtml === 'function') return helpers.escapeHtml(value);
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]);
  }

  function shortText(helpers, value, limit = 140) {
    if (typeof helpers.shortText === 'function') return helpers.shortText(value, limit);
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
  }

  function statusPill(helpers, label, options = {}) {
    if (typeof helpers.oneTimeStatusPill === 'function') return helpers.oneTimeStatusPill(label, options);
    return `<span class="status-pill">${escapeHtml(helpers, label)}</span>`;
  }

  function reviewHref(helpers, value, fallback) {
    if (typeof helpers.oneTimeReviewHref === 'function') return helpers.oneTimeReviewHref(value, fallback);
    return value || fallback;
  }

  function inboxAddress(helpers) {
    return helpers.ONE_TIME_INBOX_ADDRESS || DEFAULT_INBOX;
  }

  function mailboxEnabled(helpers) {
    return typeof helpers.providerMailboxEnabled === 'function' ? helpers.providerMailboxEnabled() : true;
  }

  function afterRender(helpers) {
    if (typeof helpers.afterRender === 'function') helpers.afterRender();
  }

  function mailboxReadinessPills(readiness = {}, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const provider = readiness.readiness || {};
    return [
      { label: `Inbox: ${readiness.inbox_address || inboxAddress(helpers)}`, fit: true },
      { label: provider.send_allowed ? 'Email replies available' : 'Draft replies only' },
      { label: 'Parent and student email stored in One Time CRM', fit: true },
    ].map((item) => statusPill(helpers, item.label, { fit: item.fit })).join('');
  }

  function renderProviderMailboxThreadList(threads = [], explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const state = stateFrom(helpers);
    if (!threads.length) {
      return `<p class="small one-time-fit-copy">No captured emails yet. New messages to ${escapeHtml(helpers, inboxAddress(helpers))} will appear here when they arrive.</p>`;
    }
    return threads.map((thread) => `
      <button type="button" class="mailbox-thread-button ${thread.thread_key === state.selectedThreadKey ? 'active' : ''}" data-action-id="ACTION-PROVIDER-MAILBOX-THREAD-OPEN" data-provider-mailbox-thread="${escapeHtml(helpers, thread.thread_key)}">
        <strong>${escapeHtml(helpers, thread.contact_name || thread.contact_email || 'Email thread')}</strong>
        <span class="small">${escapeHtml(helpers, shortText(helpers, thread.subject || 'No subject', 72))}</span>
        <span class="small">${escapeHtml(helpers, shortText(helpers, thread.preview || '', 110))}</span>
        <div class="service-meta">
          <span class="status-pill">${escapeHtml(helpers, thread.needs_reply ? 'Needs reply' : 'Updated')}</span>
          <span class="status-pill">${escapeHtml(helpers, String(thread.message_count || 1))} message${Number(thread.message_count || 1) === 1 ? '' : 's'}</span>
        </div>
      </button>
    `).join('');
  }

  function renderMailboxMessage(message = {}, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const direction = String(message.direction || '').toLowerCase();
    const party = direction === 'outbound'
      ? `To ${message.to_address || 'recipient'}`
      : `From ${message.from_name || message.from_address || 'sender'}`;
    const date = message.occurred_at ? new Date(message.occurred_at).toLocaleString('en-GB') : '';
    return `
      <article class="mailbox-message ${escapeHtml(helpers, direction)}">
        <div class="service-head">
          <div>
            <strong>${escapeHtml(helpers, party)}</strong>
            <span class="small">${escapeHtml(helpers, message.subject || 'No subject')}</span>
          </div>
          <span class="status-pill">${escapeHtml(helpers, message.status || direction || 'logged')}</span>
        </div>
        <div class="service-meta">
          ${date ? `<span class="status-pill">${escapeHtml(helpers, date)}</span>` : ''}
          ${message.provider ? `<span class="status-pill">${escapeHtml(helpers, message.provider)}</span>` : ''}
        </div>
        <p class="mailbox-message-body">${escapeHtml(helpers, message.body_text || message.preview || '')}</p>
      </article>
    `;
  }

  function renderProviderMailboxThread(thread = null, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const state = stateFrom(helpers);
    if (!thread) return '<p class="small">Select a thread to read the email timeline.</p>';
    const messages = Array.isArray(thread.messages) ? thread.messages : [];
    const readiness = state.readiness || {};
    const providerReadiness = readiness.readiness || {};
    const canDraft = Boolean(thread.reply_to_address);
    const canSend = Boolean(thread.reply_to_address && providerReadiness.send_allowed);
    const sendBlocker = !thread.reply_to_address
      ? 'No inbound sender address is available for this thread.'
      : 'Draft this reply here, then use the approved email sending flow when sending is available.';
    return `
      <section class="service-card">
        <div class="service-head">
          <div>
            <h3>${escapeHtml(helpers, thread.subject || 'Email thread')}</h3>
            <p class="small">${escapeHtml(helpers, thread.reply_to_address ? `Reply target: ${thread.reply_to_address}` : 'No reply target found')}</p>
          </div>
          <span class="status-pill">${escapeHtml(helpers, messages.length)} message${messages.length === 1 ? '' : 's'}</span>
        </div>
        <div class="service-list">
          ${messages.map((message) => renderMailboxMessage(message, helpers)).join('')}
        </div>
        <form class="mailbox-composer" data-provider-mailbox-reply="${escapeHtml(helpers, thread.thread_key)}">
          <label>Reply
            <textarea name="body_text" required maxlength="5000" placeholder="Write the reply here. Save Draft stores it in the One Time CRM; Send Reply uses the approved email flow after confirmation."></textarea>
          </label>
          <p class="small">${canSend ? 'Send Reply asks for explicit confirmation before any external email is sent.' : escapeHtml(helpers, sendBlocker)}</p>
          <div class="button-row">
            <button class="btn" type="submit" name="mailbox_action" value="draft" data-action-id="ACTION-PROVIDER-MAILBOX-DRAFT" ${canDraft ? '' : 'disabled'}>Save Draft</button>
            <button class="btn primary" type="submit" name="mailbox_action" value="send" data-action-id="ACTION-PROVIDER-MAILBOX-SEND" ${canSend ? '' : 'disabled'} title="${escapeHtml(helpers, canSend ? 'Send reply with explicit confirmation' : sendBlocker)}">Send Reply</button>
          </div>
        </form>
      </section>
    `;
  }

  function renderProviderMailbox(explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const state = stateFrom(helpers);
    const target = document.getElementById('providerMailbox');
    const readinessTarget = document.getElementById('providerMailboxReadiness');
    const mailboxSearchForm = document.getElementById('providerMailboxSearchForm');
    if (!target) return;
    if (mailboxSearchForm) mailboxSearchForm.classList.remove('hidden');
    if (readinessTarget) readinessTarget.innerHTML = mailboxReadinessPills(state.readiness || {}, helpers);
    target.innerHTML = `
      <div class="mailbox-layout" data-one-time-provider-mailbox-shell data-route-module="${MODULE_ID}">
        <aside class="mailbox-thread-list" aria-label="Mailbox threads">
          ${renderProviderMailboxThreadList(state.threads || [], helpers)}
        </aside>
        <div id="providerMailboxThread">
          ${renderProviderMailboxThread(state.thread, helpers)}
        </div>
      </div>
    `;
    afterRender(helpers);
  }

  function renderReviewMailbox(data = {}, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const parent = data.parent || {};
    const supportTicket = data.support_ticket || {};
    const thread = {
      contact_name: parent.name || 'TEST Parent One Time',
      contact_email: parent.email || 'test.parent+onetime@example.test',
      subject: supportTicket.title || 'Worksheet link question',
      preview: supportTicket.latest_activity || 'Parent asked where the worksheet is located.',
      message_count: 2,
      needs_reply: true,
    };
    return `
      <div class="mailbox-layout" data-one-time-provider-mailbox-shell data-one-time-provider-mailbox-review data-route-module="${MODULE_ID}">
        <aside class="mailbox-thread-list" aria-label="Mailbox threads">
          <article class="mailbox-thread-button active">
            <strong>${escapeHtml(helpers, thread.contact_name)}</strong>
            <span class="small">${escapeHtml(helpers, thread.subject)}</span>
            <span class="small">${escapeHtml(helpers, thread.preview)}</span>
            <div class="service-meta">
              <span class="status-pill">Needs reply</span>
              <span class="status-pill">${escapeHtml(helpers, String(thread.message_count))} messages</span>
            </div>
          </article>
        </aside>
        <div id="providerMailboxThread">
          <section class="service-card">
            <div class="service-head">
              <div>
                <h3>${escapeHtml(helpers, thread.subject)}</h3>
                <p class="small">Thread with ${escapeHtml(helpers, thread.contact_email)} inside the One Time CRM mailbox.</p>
              </div>
              <span class="status-pill">CRM mailbox</span>
            </div>
            <div class="service-list">
              <article class="mailbox-message inbound">
                <div class="service-head">
                  <div>
                    <strong>From ${escapeHtml(helpers, thread.contact_name)}</strong>
                    <span class="small">${escapeHtml(helpers, thread.subject)}</span>
                  </div>
                  <span class="status-pill">Received</span>
                </div>
                <p class="mailbox-message-body">${escapeHtml(helpers, thread.preview)}</p>
              </article>
              <article class="mailbox-message outbound">
                <div class="service-head">
                  <div>
                    <strong>Draft reply</strong>
                    <span class="small">Reply can be saved from the signed provider mailbox.</span>
                  </div>
                  <span class="status-pill">Draft action</span>
                </div>
                <p class="mailbox-message-body">Open the signed provider mailbox to save the reply draft. Live email sending stays behind the approved confirmation flow.</p>
              </article>
            </div>
            <div class="button-row">
              <button class="btn" type="button" data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION" data-provider-nav="crm" data-one-time-action-state="navigate">Open CRM</button>
              <a class="btn primary" href="${reviewHref(helpers, data.links?.email_preview, '/one-time-email-review.html')}" data-one-time-action-state="navigate">Preview Email</a>
              <button class="btn" type="button" disabled title="Use the signed provider mailbox to save live drafts.">Save Draft</button>
              <button class="btn" type="button" disabled title="Live email sending requires the approved confirmation flow.">Send Reply</button>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  async function loadMailbox(options = {}, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const state = stateFrom(helpers);
    const target = document.getElementById('providerMailbox');
    const searchInput = document.getElementById('providerMailboxSearch');
    if (!target || !mailboxEnabled(helpers)) return;
    const api = helpers.api;
    if (typeof api !== 'function') {
      target.innerHTML = '<p class="small">Mailbox API helper is unavailable.</p>';
      return;
    }
    const search = options.search !== undefined ? options.search : (searchInput?.value || state.search || '');
    target.innerHTML = '<p class="small">Loading mailbox...</p>';
    try {
      const query = search ? `?q=${encodeURIComponent(search)}` : '';
      const data = await api(`/api/provider-portal/mailbox${query}`);
      state.threads = data.mailbox?.threads || [];
      state.readiness = data.mailbox?.readiness || null;
      state.search = search || '';
      state.loaded = true;
      if (searchInput && searchInput.value !== state.search) searchInput.value = state.search;
      if (!state.threads.some((thread) => thread.thread_key === state.selectedThreadKey)) {
        state.selectedThreadKey = state.threads[0]?.thread_key || '';
        state.thread = null;
      }
      renderProviderMailbox(helpers);
      if (state.selectedThreadKey) await loadThread(state.selectedThreadKey, helpers);
    } catch (error) {
      target.innerHTML = `<p class="small">${escapeHtml(helpers, error.message || 'Could not load mailbox.')}</p>`;
    }
  }

  async function loadThread(threadKey, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const state = stateFrom(helpers);
    const target = document.getElementById('providerMailboxThread');
    const api = helpers.api;
    if (!threadKey || !target || typeof api !== 'function') return;
    state.selectedThreadKey = threadKey;
    document.querySelectorAll('[data-provider-mailbox-thread]').forEach((button) => {
      button.classList.toggle('active', button.dataset.providerMailboxThread === threadKey);
    });
    target.innerHTML = '<p class="small">Loading thread...</p>';
    try {
      const data = await api(`/api/provider-portal/mailbox/${encodeURIComponent(threadKey)}`);
      state.thread = data.thread || null;
      state.readiness = data.mailbox?.readiness || state.readiness;
      target.innerHTML = renderProviderMailboxThread(state.thread, helpers);
      const readinessTarget = document.getElementById('providerMailboxReadiness');
      if (readinessTarget) readinessTarget.innerHTML = mailboxReadinessPills(state.readiness || {}, helpers);
      afterRender(helpers);
    } catch (error) {
      target.innerHTML = `<p class="small">${escapeHtml(helpers, error.message || 'Could not load mailbox thread.')}</p>`;
    }
  }

  function renderPlaceholder(message = 'Mailbox loads when this section opens.', explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    return `
      <section class="service-card" data-one-time-provider-mailbox-route-placeholder data-route-module="${MODULE_ID}">
        <div class="service-head">
          <div>
            <h3>Mailbox</h3>
            <p class="small">${escapeHtml(helpers, message)}</p>
          </div>
          <span class="status-pill">Route module</span>
        </div>
      </section>
    `;
  }

  function hydrate(data = {}, explicitHelpers) {
    const helpers = routeHelpers(explicitHelpers);
    const target = document.getElementById('providerMailbox');
    const readinessTarget = document.getElementById('providerMailboxReadiness');
    const mailboxSearchForm = document.getElementById('providerMailboxSearchForm');
    if (!target) return;
    target.dataset.routeModule = MODULE_ID;
    if (helpers.oneTimeReviewMode || helpers.oneTimeViewAsRabbiToken) {
      if (mailboxSearchForm) mailboxSearchForm.classList.add('hidden');
      if (readinessTarget) {
        readinessTarget.innerHTML = [
          statusPill(helpers, inboxAddress(helpers), { fit: true }),
          '<span class="status-pill">One Time CRM mailbox</span>',
          '<span class="status-pill">Draft replies in signed provider login</span>',
        ].join('');
      }
      target.innerHTML = renderReviewMailbox(data, helpers);
      return;
    }
    if (!mailboxEnabled(helpers)) return;
    loadMailbox({}, helpers);
  }

  window.OneTimeProviderRouteModules = window.OneTimeProviderRouteModules || {};
  window.OneTimeProviderMailboxRoute = {
    module_id: MODULE_ID,
    loaded: true,
    hydrate,
    renderReviewMailbox,
    renderPlaceholder,
    loadMailbox,
    loadThread,
    mailboxReadinessPills,
    renderProviderMailboxThreadList,
  };
  window.OneTimeProviderRouteModules.mailbox = window.OneTimeProviderMailboxRoute;
  document.documentElement.dataset.oneTimeProviderMailboxRouteModule = 'loaded';
  document.dispatchEvent(new CustomEvent('one-time-provider-route-module-loaded', {
    detail: { section: 'mailbox', module_id: MODULE_ID },
  }));
})();
