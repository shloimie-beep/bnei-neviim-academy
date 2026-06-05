function normalizeString(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function toAmount(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function inferPaymentStatus(payload, transaction) {
  const explicit = normalizeString(payload.status || payload.payment_status);
  if (explicit) return explicit.toLowerCase();
  if (transaction || payload.total !== undefined || payload.amount !== undefined) return 'completed';
  return 'unknown';
}

function inferEventType(payload, headers) {
  const headerNames = [
    'x-green-invoice-topic',
    'x-greeninvoice-topic',
    'x-webhook-topic',
    'x-green-invoice-event',
    'x-greeninvoice-event',
  ];
  for (const headerName of headerNames) {
    const headerValue = normalizeString(headers?.[headerName]);
    if (headerValue) return headerValue;
  }
  const explicit = normalizeString(payload.event_type || payload.eventType || payload.topic || payload.event);
  if (explicit) return explicit;
  if (Array.isArray(payload.transactions) && payload.transactions.length) return 'payment/received';
  return 'green-invoice/unknown';
}

function buildEventKey(normalized) {
  const parts = [
    normalized.eventType || 'green-invoice',
    normalized.transactionId || normalized.gatewayTransactionId || normalized.documentId || 'unknown',
    normalized.payerEmail || normalizeDigits(normalized.payerPhone) || normalized.amount || 'unknown',
  ];
  return parts.join(':');
}

function normalizeGreenInvoiceWebhookPayload(rawPayload = {}, headers = {}) {
  const payload =
    rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) ? rawPayload : {};
  const transaction = Array.isArray(payload.transactions) ? payload.transactions[0] || null : null;
  const payer = payload.payer || transaction?.payer || {};
  const paymentMethodType = normalizeString(
    transaction?.paymentMethod?.type || payload.payment_method || payload.method
  );

  const normalized = {
    eventType: inferEventType(payload, headers),
    documentId: normalizeString(payload.id || payload.document_id || payload.documentId),
    transactionId: normalizeString(transaction?.id || payload.payment_id || payload.paymentId),
    gatewayTransactionId: normalizeString(
      transaction?.gatewayTransactionId || payload.gateway_transaction_id
    ),
    productId: normalizeString(payload.productId || payload.product_id),
    channel: normalizeString(payload.channel),
    description: normalizeString(payload.description),
    payerName: normalizeString(payer.name || payload.name || payload.customer_name),
    payerEmail: normalizeString(payer.email || payload.email || payload.customer_email),
    payerPhone: normalizeString(
      payer.phone ||
        payer.mobile ||
        transaction?.payer?.phone ||
        payload.phone ||
        payload.mobile ||
        payload.customer_phone
    ),
    amount: toAmount(transaction?.total ?? payload.total ?? payload.amount),
    currency: normalizeString(transaction?.currency || payload.currency) || 'ILS',
    paymentStatus: inferPaymentStatus(payload, transaction),
    paymentMethodType,
    greenInvoiceUrl: normalizeString(
      payload.green_invoice_url || payload.payment_url || payload.url || payload.document_url
    ),
    rawPayload: payload,
  };

  normalized.eventKey = buildEventKey(normalized);
  return normalized;
}

module.exports = {
  normalizeDigits,
  normalizeGreenInvoiceWebhookPayload,
};
