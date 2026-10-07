const assert = require('node:assert/strict');
const test = require('node:test');

const {
  SOURCE,
  applyFacebookPageProviderReadback,
  buildBufferScheduleCommand,
  buildFacebookPagePublicationPreview,
  localBusinessDate,
  normalizeAcceptedBufferPost,
  publicationRequestKey,
  reserveFacebookPagePublication,
} = require('../src/lib/bna/life-skills-facebook-page-publication');

const binding = {
  verified: true,
  verifiedAt: '2026-10-07T18:00:00.000Z',
  provider: 'buffer',
  service: 'facebook',
  pageId: 'synthetic-page-1',
  pageUrl: 'https://www.facebook.com/synthetic-life-skills-page',
  channelId: 'synthetic-buffer-channel-1',
  providerReadback: {
    source: 'buffer_channel_readback',
    readAt: '2026-10-07T18:00:00.000Z',
    service: 'facebook',
    pageId: 'synthetic-page-1',
    pageUrl: 'https://www.facebook.com/synthetic-life-skills-page/',
    channelId: 'synthetic-buffer-channel-1',
  },
};
const asset = {
  id: 'C05-EN-FEED-WHITE-v03-OWNER-APPROVED',
  revision: 'v03',
  sha256: '297aaaa9e43ce145860c883495b6f425aeecd6089bfbbbaf0f58e89720a60f27',
  language: 'EN',
  surface: 'FEED',
  width: 1080,
  height: 1350,
  approval: 'OWNER_APPROVED_EXACT_FILE',
  libraryState: 'CURRENT_APPROVED',
  publicMediaUrl: 'https://media.example.test/life-skills/c05.png',
  mediaVerification: {
    source: 'https_media_readback',
    immutable: true,
    verifiedAt: '2026-10-07T18:00:00.000Z',
    url: 'https://media.example.test/life-skills/c05.png',
    sha256: '297aaaa9e43ce145860c883495b6f425aeecd6089bfbbbaf0f58e89720a60f27',
    width: 1080,
    height: 1350,
  },
};
const scheduledAt = '2026-10-08T17:00:00.000Z';
const now = Date.parse('2026-10-07T18:00:00.000Z');

function preview(patch = {}) {
  return buildFacebookPagePublicationPreview({
    binding,
    asset,
    caption: 'A practical Life Skills flyer.',
    scheduledAt,
    now,
    ...patch,
  });
}

test('Page workflow is blocked until an exact Facebook Page and Buffer channel binding are verified', () => {
  assert.equal(preview({ binding: { ...binding, verified: false } }).reason, 'FACEBOOK_PAGE_BINDING_UNVERIFIED');
  assert.equal(preview({ binding: { ...binding, pageUrl: 'https://buffer.com/channels/synthetic' } }).reason,
    'FACEBOOK_PAGE_BINDING_UNVERIFIED');
  assert.equal(preview({ binding: { ...binding, channelId: '' } }).reason, 'FACEBOOK_PAGE_BINDING_UNVERIFIED');
  assert.equal(preview({ binding: { ...binding, channelId: 'different-channel' } }).reason,
    'FACEBOOK_PAGE_BINDING_UNVERIFIED');
  assert.equal(preview({ binding: { ...binding, providerReadback: { ...binding.providerReadback, pageId: 'other-page' } } }).reason,
    'FACEBOOK_PAGE_BINDING_UNVERIFIED');
});

test('exact approved flyer pixels require a direct public immutable media URL', () => {
  assert.equal(preview({ asset: { ...asset, publicMediaUrl: 'https://drive.google.com/file/d/private/view' } }).reason,
    'PUBLIC_MEDIA_BYTES_UNVERIFIED');
  assert.equal(preview({ asset: { ...asset, publicMediaUrl: 'http://media.example.test/life-skills/c05.png' } }).reason,
    'PUBLIC_MEDIA_BYTES_UNVERIFIED');
  assert.equal(preview({ asset: { ...asset, mediaVerification: { ...asset.mediaVerification, sha256: '0'.repeat(64) } } }).reason,
    'PUBLIC_MEDIA_BYTES_UNVERIFIED');
  assert.equal(preview({ asset: { ...asset, sha256: 'changed' } }).reason, 'EXACT_APPROVED_FEED_ASSET_REQUIRED');
  assert.equal(preview({ asset: { ...asset, libraryState: 'CURRENT_ACCEPTED_HELD' } }).reason,
    'EXACT_APPROVED_FEED_ASSET_REQUIRED');
});

test('daily preview uses Jerusalem business date, allows Friday, and never backfills', () => {
  const ready = preview();
  assert.equal(ready.state, 'READY');
  assert.equal(ready.localBusinessDate, '2026-10-08');
  assert.equal(localBusinessDate('2026-10-08T22:30:00.000Z'), '2026-10-09');
  const friday = preview({ scheduledAt: '2026-10-09T09:00:00.000Z' });
  assert.equal(friday.state, 'READY');
  assert.equal(friday.localBusinessDate, '2026-10-09');
  const saturday = preview({ scheduledAt: '2026-10-10T09:00:00.000Z' });
  assert.equal(saturday.state, 'READY');
  assert.equal(saturday.localBusinessDate, '2026-10-10');
  assert.equal(preview({ scheduledAt: '2026-10-06T17:00:00.000Z' }).reason, 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL');
});

test('one Page per local day replays the exact request and blocks a changed flyer or caption', () => {
  const ready = preview();
  const record = { id: 7, source: SOURCE, state: 'RESERVED', requestKey: ready.requestKey,
    pageIdentityKey: ready.pageIdentityKey, pageBindingKey: ready.pageBindingKey, localBusinessDate: ready.localBusinessDate };
  const replay = preview({ existingRecords: [record] });
  assert.equal(replay.replay, true);
  assert.equal(replay.id, 7);
  const changed = preview({ caption: 'Changed caption', existingRecords: [record] });
  assert.equal(changed.reason, 'ONE_PAGE_POST_PER_LOCAL_DAY');
  const changedSha = '9f7a876b9ad6e4fb23d46fe5808e61ea4cd3e665610506f4e23ef6bbe40a7b2d';
  const changedAsset = preview({ asset: { ...asset, id: 'C06-EN-FEED-WHITE-v03-OWNER-APPROVED', sha256: changedSha,
    mediaVerification: { ...asset.mediaVerification, sha256: changedSha } },
    existingRecords: [record] });
  assert.equal(changedAsset.reason, 'ONE_PAGE_POST_PER_LOCAL_DAY');
  assert.notEqual(changedAsset.requestKey, ready.requestKey);
  const rebound = preview({ binding: { ...binding, channelId: 'replacement-channel',
    providerReadback: { ...binding.providerReadback, channelId: 'replacement-channel' } }, existingRecords: [record] });
  assert.equal(rebound.reason, 'ONE_PAGE_POST_PER_LOCAL_DAY');
  assert.equal(publicationRequestKey({}), null);
});

test('Buffer schedule command remains a confirmed single-channel preparation and performs no write itself', () => {
  const ready = preview();
  assert.equal(buildBufferScheduleCommand(ready).reason, 'EXPLICIT_PAGE_SCHEDULE_CONFIRMATION_REQUIRED');
  const command = buildBufferScheduleCommand(ready, { ownerConfirmed: true, now });
  assert.equal(command.ok, true);
  assert.deepEqual(command.input.channelIds, [binding.channelId]);
  assert.deepEqual(command.input.media, [{ type: 'image', url: asset.publicMediaUrl }]);
  assert.equal(command.externalWritePerformed, false);
  assert.equal(buildBufferScheduleCommand(ready, { ownerConfirmed: true, now: Date.parse(scheduledAt) }).reason,
    'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL');
});

test('provider acceptance is not publication proof and mismatches become unknown with no blind retry', () => {
  const ready = preview();
  const accepted = normalizeAcceptedBufferPost(ready, { posts: [{ id: 'buffer-post-1', status: 'scheduled',
    channel: { id: binding.channelId, service: 'facebook' } }] });
  assert.equal(accepted.state, 'ACCEPTED');
  assert.equal(accepted.providerPermalink, null);
  assert.equal(normalizeAcceptedBufferPost(ready, { posts: [] }).state, 'UNKNOWN');
  assert.equal(normalizeAcceptedBufferPost(ready, { posts: [{ id: 'buffer-post-2', channel: { id: 'wrong', service: 'facebook' } }] }).state,
    'UNKNOWN');
});

test('only an exact Facebook provider readback can mark the daily flyer published', () => {
  const accepted = normalizeAcceptedBufferPost(preview(), { posts: [{ id: 'buffer-post-1', status: 'scheduled',
    channel: { id: binding.channelId, service: 'facebook' } }] });
  const waiting = applyFacebookPageProviderReadback(accepted, { id: 'buffer-post-1', status: 'scheduled', channelId: binding.channelId },
    { readAt: '2026-10-08T17:01:00.000Z' });
  assert.equal(waiting.state, 'ACCEPTED');
  const unknown = applyFacebookPageProviderReadback(accepted, {});
  assert.equal(unknown.state, 'UNKNOWN');
  assert.equal(unknown.noBlindRetry, true);
  const incomplete = applyFacebookPageProviderReadback(accepted, { id: 'buffer-post-1', status: 'published',
    channelId: binding.channelId, permalink: 'https://www.facebook.com/synthetic/posts/1' });
  assert.equal(incomplete.state, 'UNKNOWN');
  const published = applyFacebookPageProviderReadback(accepted, { id: 'buffer-post-1', status: 'published',
    channelId: binding.channelId, permalink: 'https://www.facebook.com/synthetic/posts/1', publishedAt: '2026-10-08T17:00:42.000Z' },
    { readAt: '2026-10-08T17:01:00.000Z' });
  assert.equal(published.state, 'PUBLISHED');
  assert.equal(published.providerPermalink, 'https://www.facebook.com/synthetic/posts/1');
});

function fakeReservationPool() {
  const rows = [];
  const queries = [];
  let sequence = 1;
  const client = {
    async query(sql, params = []) {
      queries.push({ sql, params });
      if (/SELECT id, status, source/.test(sql)) {
        return { rows: rows.filter((row) => row.source === params[0] && row.metadata.page_identity_key === params[1] &&
          row.metadata.local_business_date === params[2] && row.status !== 'archived') };
      }
      if (/INSERT INTO bna_social_posts/.test(sql)) {
        const row = { id: sequence++, status: 'schedule_preview', source: params[5], source_id: params[6],
          scheduled_at: params[4], metadata: JSON.parse(params[7]) };
        rows.push(row);
        return { rows: [row] };
      }
      return { rows: [] };
    },
    release() {},
  };
  return { rows, queries, connect: async () => client };
}

test('two workers for the same Page/day share the transaction lock and create only one native reservation', async () => {
  const pool = fakeReservationPool();
  const ready = preview();
  const first = await reserveFacebookPagePublication(pool, ready, { now });
  const second = await reserveFacebookPagePublication(pool, ready, { now });
  assert.equal(first.state, 'RESERVED');
  assert.equal(first.internalRecordWritten, true);
  assert.equal(second.state, 'RESERVED');
  assert.equal(second.replay, true);
  assert.equal(second.internalRecordWritten, false);
  assert.equal(pool.rows.length, 1);
  assert.equal(pool.queries.filter((entry) => /pg_advisory_xact_lock/.test(entry.sql)).length, 2);
  assert.equal(pool.queries.filter((entry) => /INSERT INTO bna_social_posts/.test(entry.sql)).length, 1);
});

test('a different same-day request is blocked before Buffer and unknown prior state is preserved', async () => {
  const pool = fakeReservationPool();
  const ready = preview();
  await reserveFacebookPagePublication(pool, ready, { now });
  const changed = preview({ caption: 'Different approved caption' });
  const blocked = await reserveFacebookPagePublication(pool, changed, { now });
  assert.equal(blocked.reason, 'ONE_PAGE_POST_PER_LOCAL_DAY');
  assert.equal(blocked.externalWritePerformed, false);
  pool.rows[0].metadata.publication_state = 'UNKNOWN';
  const unknown = await reserveFacebookPagePublication(pool, ready, { now });
  assert.equal(unknown.state, 'UNKNOWN');
  assert.equal(unknown.replay, true);
  assert.equal(pool.rows.length, 1);
});

test('a stale READY preview cannot reserve after the future schedule fence closes', async () => {
  const pool = fakeReservationPool();
  const ready = preview();
  const blocked = await reserveFacebookPagePublication(pool, ready, { now: Date.parse(scheduledAt) });
  assert.equal(blocked.state, 'BLOCKED');
  assert.equal(blocked.reason, 'FUTURE_SCHEDULE_REQUIRED_NO_BACKFILL');
  assert.equal(pool.rows.length, 0);
});
