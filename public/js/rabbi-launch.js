(function () {
  const state = {
    tiers: [],
    site: null,
    previewMode: true,
    selectedTier: '',
    notice: '',
    loading: true,
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(cents, currency) {
    if (cents === null || cents === undefined || Number.isNaN(Number(cents))) return 'Price coming soon';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(Number(cents) / 100);
  }

  async function api(path, options) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed: ${response.status}`);
      error.data = data;
      throw error;
    }
    return data;
  }

  function renderHero() {
    const content = state.site?.content || {};
    $('heroTitle').textContent = content.hero_title || 'One Time';
    $('heroSubtitle').textContent = content.hero_subtitle || 'Stories, Mishnayos learning, and moderated group calls for children, now wired as a BNA service-provider landing and membership preview.';
    $('previewBanner').hidden = !state.previewMode;
  }

  function renderTiers() {
    const container = $('tiers');
    if (!container) return;
    if (state.loading) {
      container.innerHTML = '<div class="soft-panel">Loading tiers...</div>';
      return;
    }
    if (!state.tiers.length) {
      container.innerHTML = '<div class="soft-panel">No active tiers are configured yet.</div>';
      return;
    }
    container.innerHTML = state.tiers.map((tier) => {
      const scopes = (tier.access_scopes || []).join(' + ') || 'library';
      const checkout = tier.checkout || {};
      const stripeReady = Boolean(checkout.stripe_price_configured || checkout.stripe_payment_link_url);
      const greenReady = Boolean(checkout.green_invoice_item_configured || checkout.green_invoice_payment_link_url);
      const checkoutReady = Boolean(stripeReady || greenReady);
      const statusClass = checkoutReady ? 'ready' : 'blocked';
      const statusText = checkoutReady
        ? 'Payment link configured'
        : 'Payment setup blocked: add a Stripe or Green Invoice link in Operations';
      return `
        <article class="tier-card">
          <div>
            <span class="eyebrow">${escapeHtml(scopes)}</span>
            <h3>${escapeHtml(tier.display_name)}</h3>
            <p>${escapeHtml(tier.description)}</p>
          </div>
          <div class="tier-row">
            <div class="tier-price">${escapeHtml(money(tier.price_amount_cents, tier.currency))}<span>/${escapeHtml(tier.billing_interval || 'month')}</span></div>
            <span class="setup-status ${statusClass}">${escapeHtml(statusText)}</span>
          </div>
          <div class="tier-actions">
            <button class="primary" type="button" ${stripeReady ? `onclick="RabbiLaunch.checkout('${escapeHtml(tier.tier_key)}', 'stripe')"` : 'disabled'}>Stripe checkout</button>
            <button type="button" ${greenReady ? `onclick="RabbiLaunch.checkout('${escapeHtml(tier.tier_key)}', 'green_invoice')"` : 'disabled'}>Green Invoice checkout</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderNotice() {
    const node = $('notice');
    if (!node) return;
    node.textContent = state.notice || '';
    node.hidden = !state.notice;
  }

  async function load() {
    try {
      state.loading = true;
      renderTiers();
      const data = await api('/api/rabbi/tiers');
      state.tiers = data.tiers || [];
      state.site = data.site || null;
      state.previewMode = data.preview_mode !== false;
      state.selectedTier = state.tiers[0]?.tier_key || '';
      renderHero();
    } catch (error) {
      state.notice = error.message || 'Could not load Rabbi preview.';
    } finally {
      state.loading = false;
      renderTiers();
      renderNotice();
    }
  }

  async function checkout(tierKey, provider) {
    const form = $('checkoutForm');
    const payload = {
      tier_key: tierKey,
      provider,
      name: form?.elements.name?.value || '',
      email: form?.elements.email?.value || '',
      phone: form?.elements.phone?.value || '',
    };
    if (!payload.email) {
      state.notice = 'Enter an email before starting checkout.';
      renderNotice();
      return;
    }
    try {
      state.notice = 'Preparing checkout...';
      renderNotice();
      const data = await api('/api/rabbi/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.checkout_url) {
        state.notice = 'Checkout record created. Opening provider checkout.';
        renderNotice();
        window.open(data.checkout_url, '_blank', 'noopener');
        return;
      }
      state.notice = 'Checkout record created, but no provider URL was returned.';
    } catch (error) {
      const blocker = error.data?.blocker ? ` (${error.data.blocker})` : '';
      state.notice = `${error.message || 'Checkout is not configured yet'}${blocker}`;
    }
    renderNotice();
  }

  window.RabbiLaunch = { checkout };
  document.addEventListener('DOMContentLoaded', load);
})();
