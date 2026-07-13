(function () {
  'use strict';

  function fallbackEscapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]);
  }

  function helpersFor(helpers = {}) {
    const escapeHtml = helpers.escapeHtml || fallbackEscapeHtml;
    return {
      escapeHtml,
      reviewCard: helpers.reviewCard || ((title, body = '', status = '') => `
        <article class="service-card">
          <div class="service-head">
            <div>
              <h3>${escapeHtml(title)}</h3>
              <p class="small">${escapeHtml(body)}</p>
            </div>
            <span class="status-pill">${escapeHtml(status)}</span>
          </div>
        </article>
      `),
    };
  }

  function renderReviewCommunications(data = {}, helpers = {}) {
    const h = helpersFor(helpers);
    return `
      <div data-route-module="one-time-provider-communications-route">
        ${[
          h.reviewCard('Announcement', data.announcement?.body || '', data.announcement?.visibility || 'review'),
          h.reviewCard('Private question', data.private_question?.body || '', data.private_question?.status || 'review'),
          h.reviewCard('Support ticket', data.support_ticket?.latest_activity || '', data.support_ticket?.status || 'open'),
          h.reviewCard('WhatsApp credential handoff', data.login_access?.handoff_note || 'Prepare approved WhatsApp credential handoff after recipient/body approval. No WhatsApp was sent from this review.', data.login_access?.whatsapp_send_state || 'not sent'),
          h.reviewCard('Email previews', `${data.email_templates?.length || 0} templates are available at ${data.links?.email_preview || '/one-time-email-review.html'}`, 'preview only'),
        ].join('')}
      </div>
    `;
  }

  function renderPlaceholder(message = 'Messages load when this section opens.', helpers = {}) {
    const h = helpersFor(helpers);
    return `
      <section class="service-card" data-one-time-provider-communications-route-placeholder data-route-module="one-time-provider-communications-route">
        <div class="service-head">
          <div>
            <h3>Messages</h3>
            <p class="small">${h.escapeHtml(message)}</p>
          </div>
          <span class="status-pill">Route module</span>
        </div>
      </section>
    `;
  }

  window.OneTimeProviderCommunicationsRoute = {
    module_id: 'one-time-provider-communications-route',
    renderReviewCommunications,
    renderPlaceholder,
  };
  window.OneTimeProviderRouteModules = window.OneTimeProviderRouteModules || {};
  window.OneTimeProviderRouteModules.communications = window.OneTimeProviderCommunicationsRoute;
  document.documentElement.dataset.oneTimeProviderCommunicationsRouteModule = 'loaded';
})();
