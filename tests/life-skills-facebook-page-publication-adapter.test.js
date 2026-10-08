const assert = require('node:assert/strict');
const test = require('node:test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const {
  SYNTHETIC_STORAGE_SCOPE,
  readDisabledFacebookPagePublicationState,
  readFacebookPagePublicationRecords,
  runDisposableSyntheticFacebookPageLifecycle,
} = require('../src/lib/bna/life-skills-facebook-page-publication-adapter');

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

function fakePool({ synthetic = true } = {}) {
  const rows = [];
  const queries = [];
  let sequence = 1;
  const query = async (sql, params = []) => {
    queries.push({ sql, params });
    if (/SELECT id, status, source, provider_post_id/.test(sql)) {
      return { rows: rows.filter((row) => row.source === params[0]).slice(0, params[1]) };
    }
    if (/SELECT id, status, source/.test(sql)) {
      return { rows: rows.filter((row) => row.source === params[0] &&
        row.metadata.page_identity_key === params[1] &&
        row.metadata.local_business_date === params[2] && row.status !== 'archived') };
    }
    if (/INSERT INTO bna_social_posts/.test(sql)) {
      const row = {
        id: sequence++,
        status: 'schedule_preview',
        source: params[5],
        source_id: params[6],
        provider_post_id: null,
        scheduled_at: params[4],
        metadata: JSON.parse(params[7]),
      };
      rows.push(row);
      return { rows: [row] };
    }
    return { rows: [] };
  };
  const client = { query, release() {} };
  return {
    storageScope: synthetic ? SYNTHETIC_STORAGE_SCOPE : 'runtime',
    rows,
    queries,
    query,
    connect: async () => client,
  };
}

function lifecycle(pool, patch = {}) {
  return runDisposableSyntheticFacebookPageLifecycle({
    pool,
    binding,
    asset,
    caption: 'A practical Life Skills flyer.',
    scheduledAt,
    now,
    ...patch,
  });
}

test('private adapter reports an unconfigured destination without provider or write activity', async () => {
  const pool = fakePool();
  const state = await readDisabledFacebookPagePublicationState({ pool, now });
  assert.equal(state.state, 'UNCONFIGURED_DESTINATION');
  assert.equal(state.reason, 'FACEBOOK_PAGE_BINDING_UNVERIFIED');
  assert.equal(state.externalWriteEnabled, false);
  assert.equal(state.externalWritePerformed, false);
  assert.equal(pool.queries.length, 1);
  assert.match(pool.queries[0].sql, /FROM bna_social_posts/);
});

test('wrong Page or channel evidence remains an unconfigured destination', async () => {
  for (const badBinding of [
    { ...binding, pageId: 'wrong-page' },
    { ...binding, channelId: 'wrong-channel' },
    { ...binding, service: 'instagram' },
  ]) {
    const state = await readDisabledFacebookPagePublicationState({
      pool: fakePool(), binding: badBinding, asset, caption: 'copy', scheduledAt, now,
    });
    assert.equal(state.state, 'UNCONFIGURED_DESTINATION');
  }
});

test('missing or revoked exact media approval is surfaced as an asset hold', async () => {
  for (const heldAsset of [
    undefined,
    { ...asset, approval: 'NEEDS_REVIEW' },
    { ...asset, libraryState: 'CURRENT_ACCEPTED_HELD' },
  ]) {
    const state = await readDisabledFacebookPagePublicationState({
      pool: fakePool(), binding, asset: heldAsset, caption: 'copy', scheduledAt, now,
    });
    assert.equal(state.state, 'ASSET_HELD');
    assert.equal(state.externalWriteEnabled, false);
  }
});

test('synthetic lifecycle reserves one durable local record without a provider call', async () => {
  const pool = fakePool();
  const result = await lifecycle(pool);
  assert.equal(result.preview.state, 'READY');
  assert.equal(result.reservation.state, 'RESERVED');
  assert.equal(result.reservation.internalRecordWritten, true);
  assert.equal(result.readback.state, 'UNKNOWN');
  assert.equal(result.readback.reason, 'PROVIDER_EVIDENCE_ABSENT');
  assert.equal(result.readback.noBlindRetry, true);
  assert.equal(result.externalWritePerformed, false);
  assert.equal(pool.rows.length, 1);
});

test('exact replay is idempotent and a changed same-day request remains blocked', async () => {
  const pool = fakePool();
  const first = await lifecycle(pool);
  const replay = await lifecycle(pool);
  const changed = await lifecycle(pool, { caption: 'Different approved copy.' });
  assert.equal(first.reservation.internalRecordWritten, true);
  assert.equal(replay.preview.replay, true);
  assert.equal(replay.reservation, null);
  assert.equal(changed.preview.reason, 'ONE_PAGE_POST_PER_LOCAL_DAY');
  assert.equal(pool.rows.length, 1);
});

test('provider acceptance without readback becomes unknown and cannot be blindly retried', async () => {
  const pool = fakePool();
  const result = await lifecycle(pool, {
    acceptedResponse: { posts: [{ id: 'synthetic-buffer-post-1', status: 'scheduled',
      channel: { id: binding.channelId, service: 'facebook' } }] },
  });
  assert.equal(result.acceptance.state, 'ACCEPTED');
  assert.equal(result.readback.state, 'UNKNOWN');
  assert.equal(result.readback.reason, 'PROVIDER_READBACK_UNAVAILABLE');
  assert.equal(result.readback.noBlindRetry, true);
});

test('only exact synthetic Facebook readback reaches published state', async () => {
  const acceptedResponse = { posts: [{ id: 'synthetic-buffer-post-1', status: 'scheduled',
    channel: { id: binding.channelId, service: 'facebook' } }] };
  const mismatch = await lifecycle(fakePool(), {
    acceptedResponse,
    providerReadback: { id: 'synthetic-buffer-post-1', status: 'published', channelId: 'wrong-channel',
      permalink: 'https://www.facebook.com/synthetic/posts/1', publishedAt: '2026-10-08T17:00:42.000Z' },
  });
  assert.equal(mismatch.readback.state, 'UNKNOWN');
  assert.equal(mismatch.readback.noBlindRetry, true);
  const exact = await lifecycle(fakePool(), {
    acceptedResponse,
    providerReadback: { id: 'synthetic-buffer-post-1', status: 'published', channelId: binding.channelId,
      permalink: 'https://www.facebook.com/synthetic/posts/1', publishedAt: '2026-10-08T17:00:42.000Z' },
  });
  assert.equal(exact.readback.state, 'PUBLISHED');
  assert.equal(exact.readback.providerPermalink, 'https://www.facebook.com/synthetic/posts/1');
});

test('adapter refuses reservations against any storage not marked disposable synthetic', async () => {
  const pool = fakePool({ synthetic: false });
  await assert.rejects(lifecycle(pool), /DISPOSABLE_SYNTHETIC_STORAGE_REQUIRED/);
  assert.equal(pool.queries.length, 0);
  assert.equal(pool.rows.length, 0);
});

test('record reads are source-scoped, bounded and omit copy, media and destination identifiers', async () => {
  const pool = fakePool();
  pool.rows.push({ id: 8, source: 'life_skills_daily_facebook_page', status: 'schedule_preview',
    scheduled_at: scheduledAt, provider_post_id: 'provider-id', metadata: {
      publication_state: 'ACCEPTED', request_key: 'secret-request-key', page_id: 'page-id',
      channel_id: 'channel-id', local_business_date: '2026-10-08', no_blind_retry: true,
    } });
  const records = await readFacebookPagePublicationRecords(pool, { limit: 5000 });
  assert.equal(pool.queries[0].params[1], 50);
  assert.equal(records[0].providerPostId, 'provider-id');
  const state = await readDisabledFacebookPagePublicationState({ pool, now });
  assert.deepEqual(Object.keys(state.recentRecords[0]).sort(),
    ['id', 'localBusinessDate', 'noBlindRetry', 'providerReadAt', 'publishedAt', 'scheduledAt', 'state'].sort());
});

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(value) { this.statusCode = value; return this; },
    json(body) { this.body = body; return this; },
  };
}

function route({ authorized = true, readError = false } = {}) {
  const source = readFileSync(join(__dirname, '..', 'server.js'), 'utf8');
  const start = source.indexOf("app.get('/api/bna/life-skills-app/marketing/facebook-page-publication'");
  const end = source.indexOf("app.post('/api/bna/life-skills-app/prospects'", start);
  assert.ok(start > 0 && end > start);
  const handlers = new Map();
  const calls = [];
  vm.runInNewContext(source.slice(start, end), {
    app: { get: (path, handler) => handlers.set(path, handler) },
    authorizeLifeSkillsAppBridge: () => authorized,
    pool: {},
    readDisabledFacebookPagePublicationState: async () => {
      calls.push('read');
      if (readError) throw new Error('PRIVATE_DATABASE_DETAIL');
      return { state: 'UNCONFIGURED_DESTINATION', externalWriteEnabled: false };
    },
  });
  return { handler: handlers.get('/api/bna/life-skills-app/marketing/facebook-page-publication'), calls };
}

test('actual private route rejects public requests before reading publication records', async () => {
  const f = route({ authorized: false });
  const res = response();
  await f.handler({}, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.headers['Cache-Control'], 'private, no-store');
  assert.deepEqual(f.calls, []);
});

test('actual private route exposes disabled read-only state and safely masks storage errors', async () => {
  const ok = route();
  const okRes = response();
  await ok.handler({}, okRes);
  assert.equal(okRes.statusCode, 200);
  assert.equal(okRes.body.publication.state, 'UNCONFIGURED_DESTINATION');
  assert.equal(okRes.body.publication.externalWriteEnabled, false);
  assert.deepEqual(ok.calls, ['read']);
  const failed = route({ readError: true });
  const failedRes = response();
  await failed.handler({}, failedRes);
  assert.equal(failedRes.statusCode, 503);
  assert.equal(JSON.stringify(failedRes.body).includes('PRIVATE_DATABASE_DETAIL'), false);
});

test('route registry records the private disabled Page publication state bridge exactly once', () => {
  const registry = JSON.parse(readFileSync(join(__dirname, '..', 'ops', 'route-registry.json'), 'utf8'));
  const rows = registry.routes.filter((row) => row.route === '/api/bna/life-skills-app/marketing/facebook-page-publication');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].access, 'private');
  assert.equal(rows[0].public_allowed, false);
  assert.equal(rows[0].expected_logged_out_behavior, 'reject_unauthorized_401');
  assert.match(rows[0].security_expectation, /no destination credentials, provider call, reservation, scheduling or publication action/);
});
