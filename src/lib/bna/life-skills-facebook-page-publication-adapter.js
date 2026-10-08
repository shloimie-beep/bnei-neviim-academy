const {
  SOURCE,
  applyFacebookPageProviderReadback,
  buildFacebookPagePublicationPreview,
  normalizeAcceptedBufferPost,
  reserveFacebookPagePublication,
} = require('./life-skills-facebook-page-publication');

const SYNTHETIC_STORAGE_SCOPE = 'disposable-synthetic';
const MAX_RECORDS = 50;

function recordFromRow(row = {}) {
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  return {
    id: row.id || null,
    source: row.source || SOURCE,
    state: String(metadata.publication_state || row.status || 'UNKNOWN').toUpperCase(),
    requestKey: metadata.request_key || null,
    pageBindingKey: metadata.page_binding_key || null,
    pageIdentityKey: metadata.page_identity_key || null,
    localBusinessDate: metadata.local_business_date || null,
    providerPostId: row.provider_post_id || metadata.provider_post_id || null,
    channelId: metadata.channel_id || null,
    pageId: metadata.page_id || null,
    scheduledAt: row.scheduled_at instanceof Date ? row.scheduled_at.toISOString() : row.scheduled_at || null,
    providerStatus: metadata.provider_status || null,
    providerPermalink: metadata.provider_permalink || null,
    providerReadAt: metadata.provider_read_at || null,
    publishedAt: metadata.published_at || null,
    noBlindRetry: metadata.no_blind_retry === true,
  };
}

async function readFacebookPagePublicationRecords(pool, { limit = MAX_RECORDS } = {}) {
  if (!pool?.query) throw new Error('A PostgreSQL pool is required');
  const boundedLimit = Math.max(1, Math.min(MAX_RECORDS, Number(limit) || MAX_RECORDS));
  const result = await pool.query(
    `SELECT id, status, source, provider_post_id, scheduled_at, metadata
       FROM bna_social_posts
      WHERE source = $1
      ORDER BY id DESC
      LIMIT $2`,
    [SOURCE, boundedLimit]
  );
  return (result.rows || []).map(recordFromRow);
}

function disabledState(preview, { providerReadbackSupplied = false } = {}) {
  const reason = preview?.reason || null;
  if (reason === 'FACEBOOK_PAGE_BINDING_UNVERIFIED') return 'UNCONFIGURED_DESTINATION';
  if (reason === 'EXACT_APPROVED_FEED_ASSET_REQUIRED') return 'ASSET_HELD';
  if (reason === 'PUBLIC_MEDIA_BYTES_UNVERIFIED') return 'MEDIA_EVIDENCE_UNAVAILABLE';
  if (reason === 'CAPTION_REQUIRED') return 'CAPTION_UNAVAILABLE';
  if (reason === 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL') return 'SCHEDULE_UNAVAILABLE';
  if (reason) return 'BLOCKED';
  if (preview?.state === 'UNKNOWN') return 'UNKNOWN_DELIVERY_NO_RETRY';
  if (['ACCEPTED', 'SCHEDULED', 'SENDING'].includes(preview?.state) && !providerReadbackSupplied)
    return 'READBACK_UNAVAILABLE';
  if (preview?.state === 'PUBLISHED') return 'PUBLISHED_READBACK_VERIFIED';
  if (preview?.state === 'READY') return 'READY_PREVIEW_DISABLED';
  if (preview?.state === 'RESERVED') return 'RESERVED_PROVIDER_EVIDENCE_ABSENT';
  return 'PROVIDER_EVIDENCE_ABSENT';
}

function publicRecordSummary(records) {
  return records.map((record) => ({
    id: record.id,
    state: record.state,
    localBusinessDate: record.localBusinessDate,
    scheduledAt: record.scheduledAt,
    providerReadAt: record.providerReadAt,
    publishedAt: record.publishedAt,
    noBlindRetry: record.noBlindRetry,
  }));
}

async function readDisabledFacebookPagePublicationState({
  pool,
  binding,
  asset,
  caption,
  scheduledAt,
  providerReadback,
  now = Date.now(),
} = {}) {
  const records = await readFacebookPagePublicationRecords(pool);
  let preview = buildFacebookPagePublicationPreview({
    binding,
    asset,
    caption,
    scheduledAt,
    existingRecords: records,
    now,
  });
  const providerReadbackSupplied = providerReadback && typeof providerReadback === 'object';
  if (providerReadbackSupplied && preview?.providerPostId) {
    preview = applyFacebookPageProviderReadback(preview, providerReadback);
  }
  return {
    state: disabledState(preview, { providerReadbackSupplied }),
    reason: preview?.reason || null,
    lifecycleState: preview?.state || 'BLOCKED',
    mode: 'disabled_read_only',
    destinationConfigured: preview?.reason !== 'FACEBOOK_PAGE_BINDING_UNVERIFIED',
    providerEvidenceAvailable: Boolean(preview?.providerPostId),
    externalWriteEnabled: false,
    externalWritePerformed: false,
    noBlindRetry: preview?.noBlindRetry === true || preview?.state === 'UNKNOWN',
    recentRecords: publicRecordSummary(records),
  };
}

async function runDisposableSyntheticFacebookPageLifecycle({
  pool,
  binding,
  asset,
  caption,
  scheduledAt,
  acceptedResponse,
  providerReadback,
  now = Date.now(),
} = {}) {
  if (pool?.storageScope !== SYNTHETIC_STORAGE_SCOPE)
    throw new Error('DISPOSABLE_SYNTHETIC_STORAGE_REQUIRED');
  const existingRecords = await readFacebookPagePublicationRecords(pool);
  const preview = buildFacebookPagePublicationPreview({
    binding,
    asset,
    caption,
    scheduledAt,
    existingRecords,
    now,
  });
  if (preview.state !== 'READY') {
    return { preview, reservation: null, acceptance: null, readback: null, externalWritePerformed: false };
  }
  const reservation = await reserveFacebookPagePublication(pool, preview, { clock: () => now });
  if (!acceptedResponse) {
    return {
      preview,
      reservation,
      acceptance: null,
      readback: { ...reservation, state: 'UNKNOWN', reason: 'PROVIDER_EVIDENCE_ABSENT', noBlindRetry: true },
      externalWritePerformed: false,
    };
  }
  const acceptance = normalizeAcceptedBufferPost(preview, acceptedResponse);
  const readback = providerReadback
    ? applyFacebookPageProviderReadback(acceptance, providerReadback)
    : { ...acceptance, state: 'UNKNOWN', reason: 'PROVIDER_READBACK_UNAVAILABLE', noBlindRetry: true };
  return { preview, reservation, acceptance, readback, externalWritePerformed: false };
}

module.exports = {
  MAX_RECORDS,
  SYNTHETIC_STORAGE_SCOPE,
  disabledState,
  readDisabledFacebookPagePublicationState,
  readFacebookPagePublicationRecords,
  recordFromRow,
  runDisposableSyntheticFacebookPageLifecycle,
};
