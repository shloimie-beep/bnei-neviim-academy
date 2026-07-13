(function () {
  'use strict';

  const MODULE_ID = 'one-time-provider-billing-route';

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
      statusPill: helpers.oneTimeStatusPill || ((value) => `<span class="status-pill">${escapeHtml(value)}</span>`),
      afterRender: helpers.afterRender || (() => {}),
    };
  }

  function statusText(value = '') {
    return String(value || '').replace(/_/g, ' ');
  }

  function humanText(value = '') {
    const normalized = String(value || '').trim();
    const labels = {
      billing_start_at_decision_required_before_live_conversion: 'Final billing start date in Asia/Jerusalem',
      billing_start_at_decision_required_before_live_notice: 'Final billing start date for the notice',
      billing_notice_and_policy_copy_required_before_public_copy: 'Final customer billing notice and policy copy',
      billing_provider_and_test_checkout_required_before_live_card_collection: 'Hosted Stripe readback and approved test checkout',
      accounting_owner_approval_required_before_real_invoice_credit_or_reward: 'Accounting owner approval for real invoice credits',
      authorized_admin_approval_required_before_refund_execution: 'Authorized admin approval before refund execution',
      sender_identity_required_before_live_notice: 'Approved sender identity for billing notices',
      customer_notice_copy_required_before_live_notice: 'Approved customer notice copy',
      recipient_cohort_review_required_before_batch_send: 'Reviewed recipient cohort before batch send',
      final_refund_policy_copy_required_before_live_checkout: 'Final refund policy copy before live checkout',
      linked_invoice_payment_customer_required_before_refund_review: 'Linked invoice, payment, and customer before refund review',
      exact_approval_required_before_live_charges_sends_refunds_or_access_changes: 'Exact approval before live charges, sends, refunds, or access changes',
      non_refundable_except_manual_exception: 'Non-refundable except manual exception',
      cancel_at_period_end: 'Cancel at period end',
    };
    return labels[normalized] || statusText(normalized);
  }

  function moneyFromCents(cents = 0, currency = 'USD') {
    const amount = Number(cents || 0) / 100;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  function defaultBillingWorkspace() {
    return {
      status: 'sandbox_ready_live_blocked',
      price: {
        product_name: 'One Time Mishnayos Membership',
        display_price: '$67.00 / month',
        amount_cents: 6700,
        currency: 'USD',
        interval: 'month',
        tax_behavior: 'exclusive',
        stripe_trial_enabled: false,
      },
      campaign: {
        name: 'Rosh Hashanah paid conversion',
        billing_start_at: null,
        timezone: 'Asia/Jerusalem',
        billing_authorization_required: true,
      },
      counts: {
        customers: 0,
        subscriptions: 0,
        invoices: 0,
        payments: 0,
        refund_reviews: 0,
      },
      catalog: [
        { label: 'Product', value: 'One Time Mishnayos Membership', state: 'draft ready' },
        { label: 'Price', value: '$67.00 / month', state: 'sandbox verified' },
        { label: 'Tax', value: 'Exclusive', state: 'account readiness gated' },
        { label: 'Stripe trial', value: 'Disabled', state: 'no trial' },
      ],
      billing: [
        { label: 'Customers', value: 'Synthetic test identities only', state: 'no real customer' },
        { label: 'Subscriptions', value: 'Create after final billing start approval', state: 'blocked live' },
        { label: 'Invoices', value: 'Monthly invoice/receipt email modeled', state: 'send disabled' },
        { label: 'Payments', value: 'Sandbox smoke passed, live charges disabled', state: 'test only' },
        { label: 'Refunds', value: 'Manual exceptional review only', state: 'execution disabled' },
      ],
      automations: [
        { label: 'Pre-billing notice', value: 'Preview enabled, batch/live sends disabled', state: 'no send' },
        { label: 'Failed payment', value: 'Access suspends immediately, no grace period', state: 'modeled' },
        { label: 'Cancellation', value: 'Cancel at period end by default', state: 'modeled' },
        { label: 'Referral credit', value: 'Manual review after first paid cycle', state: 'manual only' },
      ],
      settings: [
        { label: 'Provider account', value: 'Stripe test sandbox configured locally', state: 'live readback needed' },
        { label: 'Policies', value: 'No trial, no automatic refunds, no live sends', state: 'locked local' },
        { label: 'Permissions', value: 'Price publishing is separate from customer charging', state: 'separated' },
        { label: 'Launch packet', value: 'Final start date, sender, cohort, hosted env readback', state: 'blocked' },
      ],
      blockers: [
        'Final billing start date in Asia/Jerusalem',
        'Final customer notice copy, sender, and recipient cohort',
        'Hosted Stripe webhook/env readback before deployed write path',
        'Exact approval before live charges, sends, refunds, or access changes',
      ],
      gates: {
        live_charges_enabled: false,
        notice_email_send_enabled: false,
        stripe_refund_create_enabled: false,
        access_grant_automation_enabled: false,
      },
    };
  }

  function workspaceFromData(data = {}) {
    const workspace = data.billing_workspace || {};
    const fallback = defaultBillingWorkspace();
    return {
      ...fallback,
      ...workspace,
      price: { ...fallback.price, ...(workspace.price || {}) },
      campaign: { ...fallback.campaign, ...(workspace.campaign || {}) },
      counts: { ...fallback.counts, ...(workspace.counts || {}) },
      gates: { ...fallback.gates, ...(workspace.gates || {}) },
      catalog: Array.isArray(workspace.catalog) ? workspace.catalog : fallback.catalog,
      billing: Array.isArray(workspace.billing) ? workspace.billing : fallback.billing,
      automations: Array.isArray(workspace.automations) ? workspace.automations : fallback.automations,
      settings: Array.isArray(workspace.settings) ? workspace.settings : fallback.settings,
      blockers: Array.isArray(workspace.blockers) ? workspace.blockers : fallback.blockers,
    };
  }

  function metric(label, value, state, h) {
    return `
      <div class="one-time-billing-metric">
        <span>${h.escapeHtml(label)}</span>
        <strong>${h.escapeHtml(value)}</strong>
        <small>${h.escapeHtml(state)}</small>
      </div>
    `;
  }

  function rows(items = [], h) {
    return items.map((item) => `
      <div class="one-time-billing-row">
        <div>
          <strong>${h.escapeHtml(item.label)}</strong>
          <span>${h.escapeHtml(humanText(item.value))}</span>
        </div>
        ${h.statusPill(statusText(item.state || 'review'))}
      </div>
    `).join('');
  }

  function gateButton(actionId, label, blocker, h) {
    return `
      <div class="one-time-billing-gated-action">
        <button class="btn" type="button" disabled data-action-id="${h.escapeHtml(actionId)}" data-button-state="blocked" title="${h.escapeHtml(blocker)}">
          ${h.escapeHtml(label)}
        </button>
        <span>${h.escapeHtml(blocker)}</span>
      </div>
    `;
  }

  function render(data = {}, helpers = {}) {
    const h = helpersFor(helpers);
    const workspace = workspaceFromData(data);
    const price = workspace.price || {};
    const campaign = workspace.campaign || {};
    const counts = workspace.counts || {};
    const displayPrice = price.display_price || `${moneyFromCents(price.amount_cents, price.currency || 'USD')} / ${price.interval || 'month'}`;
    const billingStart = campaign.billing_start_at || 'Start date not approved';
    const blockerItems = (workspace.blockers || []).map((item) => humanText(item)).filter(Boolean);
    const liveBlocked = workspace.gates?.live_charges_enabled === false;

    return `
      <section class="one-time-billing-shell" data-one-time-provider-billing-shell data-route-module="${MODULE_ID}" aria-label="One Time billing workspace">
        <div class="one-time-billing-hero">
          <div>
            <span class="status-pill">Billing V2</span>
            <h3>${h.escapeHtml(price.product_name || 'One Time Mishnayos Membership')}</h3>
            <p class="small">Provider-scoped billing readback for products, prices, customers, subscriptions, invoices, payments, refunds, account policy, and launch permissions.</p>
          </div>
          <div class="one-time-billing-price">
            <strong>${h.escapeHtml(displayPrice)}</strong>
            <span>${price.stripe_trial_enabled ? 'Stripe trial enabled' : 'No Stripe trial'}</span>
            <small>${h.escapeHtml(statusText(workspace.status || 'sandbox ready'))}</small>
          </div>
        </div>

        <div class="one-time-billing-metrics" aria-label="Billing summary">
          ${metric('Catalog', price.tax_behavior === 'exclusive' ? 'Tax exclusive' : 'Tax policy set', 'plus applicable taxes', h)}
          ${metric('Campaign', billingStart, campaign.timezone || 'Asia/Jerusalem', h)}
          ${metric('Customers', String(counts.customers || 0), 'synthetic/test identities', h)}
          ${metric('Subscriptions', String(counts.subscriptions || 0), liveBlocked ? 'live creation blocked' : 'ready', h)}
          ${metric('Refunds', String(counts.refund_reviews || 0), 'manual review only', h)}
        </div>

        <div class="one-time-billing-category-row" aria-label="Billing categories">
          <span>Overview</span>
          <span>Catalog</span>
          <span>Billing</span>
          <span>Automations</span>
          <span>Settings</span>
        </div>

        <div class="one-time-billing-grid">
          <section class="one-time-billing-band">
            <div class="one-time-billing-band-head">
              <h3>Catalog</h3>
              ${h.statusPill(price.stripe_trial_enabled ? 'trial enabled' : 'no trial')}
            </div>
            ${rows(workspace.catalog, h)}
          </section>

          <section class="one-time-billing-band">
            <div class="one-time-billing-band-head">
              <h3>Billing</h3>
              ${h.statusPill('test only')}
            </div>
            ${rows(workspace.billing, h)}
          </section>

          <section class="one-time-billing-band">
            <div class="one-time-billing-band-head">
              <h3>Automations</h3>
              ${h.statusPill('preview')}
            </div>
            ${rows(workspace.automations, h)}
          </section>

          <section class="one-time-billing-band">
            <div class="one-time-billing-band-head">
              <h3>Settings</h3>
              ${h.statusPill('gated')}
            </div>
            ${rows(workspace.settings, h)}
          </section>
        </div>

        <section class="one-time-billing-launch">
          <div>
            <h3>Launch blockers</h3>
            <ul class="one-time-billing-blocker-list">
              ${(blockerItems.length ? blockerItems : ['No launch blockers recorded.']).map((item) => `<li>${h.escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>
          <div class="one-time-billing-actions">
            ${gateButton('ACTION-ONETIME-BILLING-NOTICE-PREVIEW', 'Preview notice', 'Preview-only until sender, copy, cohort, and billing start are approved.', h)}
            ${gateButton('ACTION-ONETIME-BILLING-LIVE-CHARGE-BLOCKED', 'Start live billing', 'Blocked until exact approval and hosted Stripe readback exist.', h)}
            ${gateButton('ACTION-ONETIME-BILLING-REFUND-REVIEW-BLOCKED', 'Create refund', 'Blocked until authorized admin approval and linked invoice/payment/customer are present.', h)}
            ${gateButton('ACTION-ONETIME-BILLING-ACCESS-AUTOMATION-BLOCKED', 'Run access automation', 'Blocked until approved paid event, entitlement policy, and final launch packet pass.', h)}
          </div>
        </section>
      </section>
    `;
  }

  function renderPlaceholder(message = 'Billing loads when this section opens.', helpers = {}) {
    const h = helpersFor(helpers);
    return `
      <section class="service-card" data-one-time-provider-billing-route-placeholder data-route-module="${MODULE_ID}">
        <div class="service-head">
          <div>
            <h3>Billing</h3>
            <p class="small">${h.escapeHtml(message)}</p>
          </div>
          <span class="status-pill">Route module</span>
        </div>
      </section>
    `;
  }

  window.OneTimeProviderBillingRoute = {
    module_id: MODULE_ID,
    render,
    renderPlaceholder,
  };
  window.OneTimeProviderRouteModules = window.OneTimeProviderRouteModules || {};
  window.OneTimeProviderRouteModules.billing = window.OneTimeProviderBillingRoute;
  document.documentElement.dataset.oneTimeProviderBillingRouteModule = 'loaded';
})();
