const { createHash } = require('node:crypto');
const { isKnownNonDirectMediaUrl } = require('./buffer-media-assets');

const SOURCE = 'life_skills_daily_facebook_page';
const TIME_ZONE = 'Asia/Jerusalem';
const ACTIVE_STATES = new Set(['READY', 'RESERVED', 'ACCEPTED', 'SCHEDULED', 'SENDING', 'UNKNOWN', 'PUBLISHED', 'FAILED', 'SKIPPED']);

function digest(value) {
  return createHash('sha256').update(String(value || '')).digest('hex');
}

function validIso(value) {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

function localBusinessDate(iso) {
  if (!validIso(iso)) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso));
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function canonicalFacebookPageUrl(value) {
  let parsed;
  try { parsed = new URL(String(value || '').trim()); } catch { return null; }
  if (parsed.protocol !== 'https:' || !/(^|\.)facebook\.com$/i.test(parsed.hostname) || parsed.pathname === '/') return null;
  parsed.search = '';
  parsed.hash = '';
  parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
  return parsed.toString();
}

function normalizedPageBinding(binding = {}) {
  const pageId = String(binding.pageId || '').trim();
  const channelId = String(binding.channelId || '').trim();
  const pageUrl = String(binding.pageUrl || '').trim();
  const provider = String(binding.provider || '').trim().toLowerCase();
  const service = String(binding.service || '').trim().toLowerCase();
  const canonicalPageUrl = canonicalFacebookPageUrl(pageUrl);
  const providerReadback = binding.providerReadback && typeof binding.providerReadback === 'object'
    ? binding.providerReadback : {};
  const providerPageUrl = canonicalFacebookPageUrl(providerReadback.pageUrl);
  const evidenceMatches = providerReadback.source === 'buffer_channel_readback' &&
    validIso(providerReadback.readAt) && String(providerReadback.channelId || '').trim() === channelId &&
    String(providerReadback.pageId || '').trim() === pageId &&
    String(providerReadback.service || '').trim().toLowerCase() === 'facebook' &&
    providerPageUrl === canonicalPageUrl;
  const verified = binding.verified === true && validIso(binding.verifiedAt) && provider === 'buffer' &&
    service === 'facebook' && pageId && channelId && canonicalPageUrl && evidenceMatches;
  const pageIdentityKey = verified ? digest(['facebook_page', pageId].join('\n')) : null;
  return {
    verified,
    pageId: pageId || null,
    channelId: channelId || null,
    pageUrl: canonicalPageUrl,
    provider,
    service,
    verifiedAt: validIso(binding.verifiedAt) ? binding.verifiedAt : null,
    pageIdentityKey,
    key: verified ? digest(['facebook_page_binding', pageId, channelId, canonicalPageUrl].join('\n')) : null,
  };
}

function normalizedAsset(asset = {}) {
  const sha256 = String(asset.sha256 || '').trim().toLowerCase();
  const mediaUrl = String(asset.publicMediaUrl || '').trim();
  const mediaVerification = asset.mediaVerification && typeof asset.mediaVerification === 'object'
    ? asset.mediaVerification : {};
  let parsed;
  try { parsed = new URL(mediaUrl); } catch { parsed = null; }
  const directMedia = Boolean(parsed && parsed.protocol === 'https:' && !isKnownNonDirectMediaUrl(mediaUrl));
  const approved = ['OWNER_APPROVED', 'OWNER_APPROVED_EXACT_FILE'].includes(String(asset.approval || '').toUpperCase()) &&
    String(asset.libraryState || '').toUpperCase() === 'CURRENT_APPROVED';
  const exact = Boolean(asset.id && asset.revision && /^[a-f0-9]{64}$/.test(sha256) &&
    String(asset.surface || '').toUpperCase() === 'FEED' && Number(asset.width) > 0 && Number(asset.height) > 0);
  const exactHostedBytes = directMedia && mediaVerification.source === 'https_media_readback' &&
    mediaVerification.immutable === true && validIso(mediaVerification.verifiedAt) &&
    String(mediaVerification.url || '').trim() === parsed.toString() &&
    String(mediaVerification.sha256 || '').trim().toLowerCase() === sha256 &&
    Number(mediaVerification.width) === Number(asset.width) &&
    Number(mediaVerification.height) === Number(asset.height);
  return {
    id: String(asset.id || '').trim() || null,
    revision: String(asset.revision || '').trim() || null,
    sha256,
    language: String(asset.language || '').trim().toUpperCase() || null,
    surface: String(asset.surface || '').trim().toUpperCase() || null,
    width: Number(asset.width) || null,
    height: Number(asset.height) || null,
    approval: String(asset.approval || '').trim().toUpperCase(),
    libraryState: String(asset.libraryState || '').trim().toUpperCase(),
    publicMediaUrl: directMedia ? parsed.toString() : null,
    exact,
    approved,
    directMedia,
    exactHostedBytes,
  };
}

function publicationRequestKey({ bindingKey, localDate, asset, captionDigest, scheduledAt } = {}) {
  if (!bindingKey || !localDate || !asset?.id || !asset?.revision || !asset?.sha256 || !captionDigest || !scheduledAt) return null;
  return `${SOURCE}:${digest([bindingKey, localDate, asset.id, asset.revision, asset.sha256, captionDigest, scheduledAt].join('\n'))}`;
}

function buildFacebookPagePublicationPreview({ binding, asset, caption, scheduledAt, existingRecords = [], now = Date.now() } = {}) {
  const page = normalizedPageBinding(binding);
  const flyer = normalizedAsset(asset);
  const text = String(caption || '').trim();
  if (!page.verified) return { state: 'BLOCKED', reason: 'FACEBOOK_PAGE_BINDING_UNVERIFIED', externalWritePerformed: false };
  if (!flyer.exact || !flyer.approved) return { state: 'BLOCKED', reason: 'EXACT_APPROVED_FEED_ASSET_REQUIRED', externalWritePerformed: false };
  if (!flyer.directMedia || !flyer.exactHostedBytes)
    return { state: 'BLOCKED', reason: 'PUBLIC_MEDIA_BYTES_UNVERIFIED', externalWritePerformed: false };
  if (!text) return { state: 'BLOCKED', reason: 'CAPTION_REQUIRED', externalWritePerformed: false };
  if (!validIso(scheduledAt) || Date.parse(scheduledAt) <= now)
    return { state: 'BLOCKED', reason: 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL', externalWritePerformed: false };
  const localDate = localBusinessDate(scheduledAt);
  const captionDigest = digest(text);
  const requestKey = publicationRequestKey({ bindingKey: page.key, localDate, asset: flyer, captionDigest, scheduledAt });
  const sameDay = (Array.isArray(existingRecords) ? existingRecords : []).filter((record) =>
    record?.source === SOURCE && record?.pageIdentityKey === page.pageIdentityKey && record?.localBusinessDate === localDate &&
    ACTIVE_STATES.has(String(record?.state || '').toUpperCase()));
  if (sameDay.length > 1)
    return { state: 'BLOCKED', reason: 'MULTIPLE_PAGE_POST_RECORDS_REQUIRE_RECONCILIATION', externalWritePerformed: false };
  if (sameDay.length === 1) {
    const existing = sameDay[0];
    if (existing.requestKey === requestKey)
      return { ...existing, state: String(existing.state || 'RESERVED').toUpperCase(), replay: true, externalWritePerformed: false };
    return { state: 'BLOCKED', reason: 'ONE_PAGE_POST_PER_LOCAL_DAY', existingRecordId: existing.id || null, externalWritePerformed: false };
  }
  return {
    state: 'READY',
    replay: false,
    source: SOURCE,
    requestKey,
    pageBindingKey: page.key,
    pageIdentityKey: page.pageIdentityKey,
    page,
    asset: flyer,
    caption: text,
    captionDigest,
    scheduledAt,
    localBusinessDate: localDate,
    externalWritePerformed: false,
  };
}

function buildBufferScheduleCommand(preview, { ownerConfirmed = false, now = Date.now() } = {}) {
  if (preview?.state !== 'READY') return { ok: false, reason: preview?.reason || 'PAGE_PUBLICATION_NOT_READY', externalWritePerformed: false };
  if (ownerConfirmed !== true) return { ok: false, reason: 'EXPLICIT_PAGE_SCHEDULE_CONFIRMATION_REQUIRED', externalWritePerformed: false };
  if (!validIso(preview.scheduledAt) || Date.parse(preview.scheduledAt) <= now)
    return { ok: false, reason: 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL', externalWritePerformed: false };
  return {
    ok: true,
    requestKey: preview.requestKey,
    input: {
      channelIds: [preview.page.channelId],
      text: preview.caption,
      scheduledAt: preview.scheduledAt,
      media: [{ type: 'image', url: preview.asset.publicMediaUrl }],
      confirmation: { confirmed: true },
    },
    expected: {
      pageId: preview.page.pageId,
      channelId: preview.page.channelId,
      assetSha256: preview.asset.sha256,
      captionDigest: preview.captionDigest,
      localBusinessDate: preview.localBusinessDate,
    },
    externalWritePerformed: false,
  };
}

function normalizeAcceptedBufferPost(preview, response = {}) {
  const posts = Array.isArray(response.posts) ? response.posts : [];
  if (posts.length !== 1) return { state: 'UNKNOWN', reason: 'BUFFER_ACCEPTANCE_NOT_UNIQUE', noBlindRetry: true };
  const post = posts[0];
  if (!post?.id || String(post.channel?.id || '') !== preview?.page?.channelId ||
      String(post.channel?.service || '').toLowerCase() !== 'facebook')
    return { state: 'UNKNOWN', reason: 'BUFFER_ACCEPTANCE_BINDING_MISMATCH', noBlindRetry: true };
  return {
    state: 'ACCEPTED',
    requestKey: preview.requestKey,
    provider: 'buffer',
    providerPostId: String(post.id),
    channelId: preview.page.channelId,
    pageId: preview.page.pageId,
    pageBindingKey: preview.pageBindingKey,
    localBusinessDate: preview.localBusinessDate,
    scheduledAt: preview.scheduledAt,
    providerStatus: String(post.status || '').toLowerCase() || null,
    providerPermalink: null,
    providerReadAt: null,
    publishedAt: null,
    noBlindRetry: true,
  };
}

function applyFacebookPageProviderReadback(record, readback = {}, { readAt = new Date().toISOString() } = {}) {
  if (!record?.providerPostId) return { ...record, state: 'UNKNOWN', reason: 'PROVIDER_POST_ID_MISSING', noBlindRetry: true };
  const post = readback.post || readback;
  if (!post || String(post.id || '') !== record.providerPostId)
    return { ...record, state: 'UNKNOWN', reason: 'PROVIDER_READBACK_MISSING_OR_MISMATCHED', noBlindRetry: true };
  if (String(post.channelId || post.channel?.id || '') !== String(record.channelId || ''))
    return { ...record, state: 'UNKNOWN', reason: 'PROVIDER_READBACK_CHANNEL_MISMATCH', noBlindRetry: true };
  const status = String(post.status || '').toLowerCase();
  if (!['published', 'sent'].includes(status))
    return { ...record, state: status === 'failed' ? 'FAILED' : 'ACCEPTED', providerStatus: status || null,
      providerReadAt: validIso(readAt) ? readAt : null, noBlindRetry: true };
  let permalink;
  try { permalink = new URL(String(post.permalink || post.url || '')); } catch { permalink = null; }
  if (!permalink || permalink.protocol !== 'https:' || !/(^|\.)facebook\.com$/i.test(permalink.hostname) ||
      !validIso(post.publishedAt))
    return { ...record, state: 'UNKNOWN', reason: 'PUBLISHED_READBACK_INCOMPLETE', providerStatus: status,
      providerReadAt: validIso(readAt) ? readAt : null, noBlindRetry: true };
  return { ...record, state: 'PUBLISHED', providerStatus: status, providerPermalink: permalink.toString(),
    publishedAt: post.publishedAt, providerReadAt: validIso(readAt) ? readAt : null, noBlindRetry: true };
}

async function reserveFacebookPagePublication(pool, preview, { actor = 'life-skills-private-app', clock = Date.now } = {}) {
  if (preview?.state !== 'READY')
    return { state: 'BLOCKED', reason: preview?.reason || 'PAGE_PUBLICATION_NOT_READY', externalWritePerformed: false };
  if (!validIso(preview.scheduledAt))
    return { state: 'BLOCKED', reason: 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL', externalWritePerformed: false };
  const client = typeof pool?.connect === 'function' ? await pool.connect() : pool;
  if (!client?.query) throw new Error('A PostgreSQL client or pool is required');
  let began = false;
  try {
    await client.query('BEGIN');
    began = true;
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      [SOURCE, `${preview.pageIdentityKey}:${preview.localBusinessDate}`]);
    const afterLock = clock();
    const existing = await client.query(
      `SELECT id, status, source, source_id, provider_post_id, scheduled_at, metadata
       FROM bna_social_posts
       WHERE source = $1
         AND metadata->>'page_identity_key' = $2
         AND metadata->>'local_business_date' = $3
         AND status <> 'archived'
       ORDER BY id
       FOR UPDATE`,
      [SOURCE, preview.pageIdentityKey, preview.localBusinessDate]
    );
    if (existing.rows.length > 1) {
      await client.query('ROLLBACK');
      began = false;
      return { state: 'BLOCKED', reason: 'MULTIPLE_PAGE_POST_RECORDS_REQUIRE_RECONCILIATION', externalWritePerformed: false };
    }
    if (existing.rows.length === 1) {
      const row = existing.rows[0];
      const requestKey = row.metadata?.request_key || null;
      await client.query('COMMIT');
      began = false;
      return requestKey === preview.requestKey
        ? { state: String(row.metadata?.publication_state || 'RESERVED').toUpperCase(), replay: true,
          id: row.id, requestKey, internalRecordWritten: false, externalWritePerformed: false }
        : { state: 'BLOCKED', reason: 'ONE_PAGE_POST_PER_LOCAL_DAY', existingRecordId: row.id,
          externalWritePerformed: false };
    }
    if (Date.parse(preview.scheduledAt) <= afterLock || Date.parse(preview.scheduledAt) <= clock()) {
      await client.query('ROLLBACK');
      began = false;
      return { state: 'BLOCKED', reason: 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL', externalWritePerformed: false };
    }
    const metadata = {
      publication_state: 'RESERVED',
      request_key: preview.requestKey,
      page_binding_key: preview.pageBindingKey,
      page_identity_key: preview.pageIdentityKey,
      page_id: preview.page.pageId,
      page_url: preview.page.pageUrl,
      channel_id: preview.page.channelId,
      binding_verified_at: preview.page.verifiedAt,
      local_business_date: preview.localBusinessDate,
      asset_id: preview.asset.id,
      asset_revision: preview.asset.revision,
      asset_sha256: preview.asset.sha256,
      asset_width: preview.asset.width,
      asset_height: preview.asset.height,
      caption_sha256: preview.captionDigest,
      no_backfill: true,
      no_blind_retry: true,
    };
    const inserted = await client.query(
      `INSERT INTO bna_social_posts (
         provider, provider_account, status, channel_ids, body, media, scheduled_at,
         source, source_id, metadata, created_by, updated_at
       ) VALUES ('buffer', $1, 'schedule_preview', $2::jsonb, $3, $4::jsonb, $5, $6, $7, $8::jsonb, $9, NOW())
       RETURNING id, status, source, source_id, scheduled_at, metadata`,
      [preview.page.pageId, JSON.stringify([preview.page.channelId]), preview.caption,
        JSON.stringify([{ type: 'image', url: preview.asset.publicMediaUrl, sha256: preview.asset.sha256 }]),
        preview.scheduledAt, SOURCE, preview.asset.id, JSON.stringify(metadata), String(actor || 'life-skills-private-app').slice(0, 120)]
    );
    await client.query('COMMIT');
    began = false;
    return { state: 'RESERVED', replay: false, id: inserted.rows[0]?.id || null,
      requestKey: preview.requestKey, internalRecordWritten: true, externalWritePerformed: false };
  } catch (error) {
    if (began) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (typeof client.release === 'function') client.release();
  }
}

module.exports = {
  SOURCE,
  TIME_ZONE,
  applyFacebookPageProviderReadback,
  buildBufferScheduleCommand,
  buildFacebookPagePublicationPreview,
  localBusinessDate,
  normalizeAcceptedBufferPost,
  normalizedAsset,
  normalizedPageBinding,
  publicationRequestKey,
  reserveFacebookPagePublication,
};
