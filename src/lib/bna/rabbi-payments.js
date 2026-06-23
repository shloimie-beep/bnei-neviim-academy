const RABBI_PAYMENT_PROVIDERS = Object.freeze(['stripe', 'green_invoice', 'manual']);
const RABBI_PROVIDER_MODES = Object.freeze(['test', 'live']);
const RABBI_CHECKOUT_STATUSES = Object.freeze([
  'created',
  'pending',
  'paid',
  'failed',
  'abandoned',
  'canceled',
  'expired',
  'manual_review',
]);
const RABBI_PAYMENT_EVENT_STATUSES = Object.freeze(['received', 'processed', 'duplicate', 'ignored', 'failed']);

function normalizeProvider(value, fallback = 'stripe') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (normalized === 'greeninvoice' || normalized === 'green_invoice') return 'green_invoice';
  return RABBI_PAYMENT_PROVIDERS.includes(normalized) ? normalized : fallback;
}

function normalizeProviderMode(value, fallback = 'test') {
  const normalized = String(value || '').trim().toLowerCase();
  return RABBI_PROVIDER_MODES.includes(normalized) ? normalized : fallback;
}

function normalizeCheckoutStatus(value, fallback = 'created') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return RABBI_CHECKOUT_STATUSES.includes(normalized) ? normalized : fallback;
}

function normalizePaymentEventStatus(value, fallback = 'received') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return RABBI_PAYMENT_EVENT_STATUSES.includes(normalized) ? normalized : fallback;
}

function stripeCheckoutStatus(eventType = '', object = {}) {
  const type = String(eventType || '').trim();
  if (type === 'checkout.session.completed') {
    return String(object.payment_status || '').toLowerCase() === 'paid' ? 'paid' : 'pending';
  }
  if (type === 'checkout.session.expired') return 'expired';
  if (type === 'payment_intent.payment_failed') return 'failed';
  if (type === 'payment_intent.canceled') return 'canceled';
  if (String(object.payment_status || '').toLowerCase() === 'paid') return 'paid';
  return 'manual_review';
}

function greenInvoiceCheckoutStatus(normalized = {}) {
  const status = String(normalized.paymentStatus || normalized.status || '').trim().toLowerCase();
  if (['paid', 'complete', 'completed', 'success', 'successful', 'approved'].includes(status)) return 'paid';
  if (['failed', 'declined', 'error'].includes(status)) return 'failed';
  if (['canceled', 'cancelled', 'void'].includes(status)) return 'canceled';
  if (['pending', 'open'].includes(status)) return 'pending';
  if (normalized.transactionId || normalized.amount) return 'paid';
  return 'manual_review';
}

function buildPaymentEventKey({ provider, eventId, eventType, checkoutId, paymentId, email, amount } = {}) {
  return [
    normalizeProvider(provider),
    eventId || eventType || 'event',
    checkoutId || paymentId || email || amount || 'unknown',
  ].map((part) => String(part || 'unknown').trim()).join(':');
}

function providerBlocker(provider) {
  const normalized = normalizeProvider(provider);
  return normalized === 'green_invoice' ? 'green_invoice_not_configured' : 'stripe_not_configured';
}

module.exports = {
  RABBI_PAYMENT_PROVIDERS,
  RABBI_PROVIDER_MODES,
  RABBI_CHECKOUT_STATUSES,
  RABBI_PAYMENT_EVENT_STATUSES,
  normalizeProvider,
  normalizeProviderMode,
  normalizeCheckoutStatus,
  normalizePaymentEventStatus,
  stripeCheckoutStatus,
  greenInvoiceCheckoutStatus,
  buildPaymentEventKey,
  providerBlocker,
};
