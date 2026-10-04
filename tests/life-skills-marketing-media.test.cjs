const assert = require('node:assert/strict');
const test = require('node:test');
const { createHash } = require('node:crypto');
const { Readable } = require('node:stream');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { MAX_BYTES, driveFileId, selectedAsset, readLifeSkillsMarketingMedia } = require('../src/lib/bna/life-skills-marketing-media');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aNfkAAAAASUVORK5CYII=', 'base64');
const digest = createHash('sha256').update(png).digest('hex');
const asset = { assetId: 'DEMO-EN-FEED-r1', revision: 1, registeredRevision: true, contentDigest: digest, libraryState: 'CURRENT_REVIEW', review: 'in_review', imageUrl: 'https://drive.google.com/file/d/synthetic_file_01/view', width: 1, height: 1 };
function fixture({ row = asset, metadata = {}, bytes = png, error = false } = {}) {
  const calls = [], request = { snapshot: { creatives: [row] }, assetId: asset.assetId, revision: 1, digest };
  const drive = { files: { get: async (params, options) => { calls.push({ params, options }); if (error) throw Error('PRIVATE_PROVIDER_DETAIL'); return params.alt === 'media' ? { data: Readable.from([bytes]) } : { data: { id: 'synthetic_file_01', mimeType: 'image/png', size: String(png.length), trashed: false, capabilities: { canDownload: true }, ...metadata } }; } } };
  return { request, drive, calls };
}
test('exact current review bytes can be privately inspected without approving or scheduling them', async () => {
  const f = fixture(), before = JSON.stringify(f.request.snapshot);
  const result = await readLifeSkillsMarketingMedia({ ...f.request, drive: f.drive });
  assert.deepEqual(result.bytes, png); assert.equal(result.digest, digest); assert.equal(result.mimeType, 'image/png');
  assert.equal(JSON.stringify(f.request.snapshot), before); assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].options.responseType, 'stream');
});
test('actual workbook fallback revisions cannot select media or obtain a Drive file', async () => {
  const { parseWorkbook } = require('../src/lib/bna/life-skills-marketing');
  const headers=['Asset key','Concept','Language','Surface','Revision','Width px','Height px','Approval','Drive file / archive','SHA256','Current library state'];
  for(const revision of ['', 'unknown', 'revision one', 'r0', 'r1 trailing', '1000000']){
    const snapshot=parseWorkbook({assetRows:[headers,[asset.assetId,'1','EN','FEED',revision,'1','1','REVIEW',asset.imageUrl,digest,'CURRENT_REVIEW']]}),f=fixture();
    await assert.rejects(readLifeSkillsMarketingMedia({...f.request,snapshot,drive:f.drive}),error=>error.code==='ASSET_VERSION_CHANGED'&&error.status===409);assert.deepEqual(f.calls,[]);
  }
  const snapshot=parseWorkbook({assetRows:[headers,[asset.assetId,'1','EN','FEED','r1','1','1','REVIEW',asset.imageUrl,digest,'CURRENT_REVIEW']]}),f=fixture();
  assert.deepEqual((await readLifeSkillsMarketingMedia({...f.request,snapshot,drive:f.drive})).bytes,png);assert.equal(f.calls.length,2);
  for(const registeredRevision of [undefined,false,'true',1]){const f=fixture({row:{...asset,registeredRevision}});await assert.rejects(readLifeSkillsMarketingMedia({...f.request,drive:f.drive}),/ASSET_VERSION_CHANGED/);assert.deepEqual(f.calls,[]);}
});
test('selection rejects unregistered IDs, stale hashes/revisions, retired entries and ambiguous registry rows before a provider read', async () => {
  const f = fixture();
  for (const patch of [{ assetId: '../other' }, { assetId: 'other' }, { revision: 2 }, { digest: 'b'.repeat(64) }, { snapshot: { creatives: [{ ...asset, review: 'retired' }] } }, { snapshot: { creatives: [asset, asset] } }]) await assert.rejects(readLifeSkillsMarketingMedia({ ...f.request, ...patch, drive: f.drive }));
  assert.equal(f.calls.length, 0);
  assert.throws(() => selectedAsset(null, f.request), /ASSET_NOT_FOUND/);
});
test('Drive identifiers come only from the registered exact-file source, never arbitrary URLs or a folder', () => {
  assert.equal(driveFileId(asset.imageUrl), 'synthetic_file_01');
  for (const url of ['http://drive.google.com/file/d/synthetic_file_01/view', 'https://drive.google.com.evil.invalid/file/d/synthetic_file_01/view', 'https://drive.google.com/drive/folders/synthetic_file_01', 'https://user:secret@drive.google.com/file/d/synthetic_file_01/view', 'https://example.invalid/image.png']) assert.throws(() => driveFileId(url), /ASSET_SOURCE_UNAVAILABLE/);
});
test('unavailable permission, deleted file, non-PNG and oversized metadata fail closed without downloading', async () => {
  for (const metadata of [{ capabilities: { canDownload: false } }, { trashed: true }, { mimeType: 'text/html' }, { size: MAX_BYTES + 1 }, { id: 'another_file' }]) { const f = fixture({ metadata }); await assert.rejects(readLifeSkillsMarketingMedia({ ...f.request, drive: f.drive })); assert.equal(f.calls.length, 1); }
});
test('truncated, oversized, altered and dimension-mismatched bytes never leave the bridge', async () => {
  for (const patch of [{ bytes: png.subarray(0, 40) }, { bytes: Buffer.concat([png, Buffer.alloc(1)]) }, { bytes: Buffer.from(png.map((value, index) => index === 50 ? value ^ 1 : value)) }, { row: { ...asset, width: 1080 } }]) { const f = fixture(patch); await assert.rejects(readLifeSkillsMarketingMedia({ ...f.request, drive: f.drive })); }
});
test('provider errors expose only a safe recoverable code, not credentials or original error text', async () => {
  const f = fixture({ error: true }); await assert.rejects(readLifeSkillsMarketingMedia({ ...f.request, drive: f.drive }), error => error.message === 'ASSET_SOURCE_UNAVAILABLE' && error.status === 503);
});

function routes({ authorized = true, configured = true } = {}) {
  const source = readFileSync(join(__dirname, '..', 'server.js'), 'utf8'), start = source.indexOf('function lifeSkillsMarketingClient('), end = source.indexOf("app.post('/api/bna/life-skills-app/prospects'", start), handlers = new Map(), calls = [];
  assert.ok(start > 0 && end > start);
  const mediaStart=source.indexOf("app.get('/api/bna/life-skills-app/marketing/assets/:assetId'"),mediaEnd=source.indexOf('\n});',mediaStart)+5;
  assert.ok(mediaStart>0&&mediaEnd>mediaStart);
  vm.runInNewContext(source.slice(start, end)+'\n'+source.slice(mediaStart,mediaEnd), { app: { get: (path, handler) => handlers.set(path, handler) }, authorizeLifeSkillsAppBridge: () => authorized,
    createGoogleClientFromRefreshToken: () => { calls.push('auth'); if (!configured) throw Error('PRIVATE_SECRET_DETAIL'); return {}; },
    google: { sheets: () => ({}), drive: () => ({}) }, readLifeSkillsMarketingSnapshot: async () => { calls.push('snapshot'); return { creatives: [asset] }; },
    readLifeSkillsMarketingMedia: async input => { calls.push('media'); selectedAsset(input.snapshot, input); return { bytes: png, mimeType: 'image/png', filename: 'DEMO-image.png' }; }, MarketingMediaError: require('../src/lib/bna/life-skills-marketing-media').MarketingMediaError });
  return { handlers, calls };
}
function response() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(value) { this.statusCode = value; return this; }, json(body) { this.body = body; return this; }, send(bytes) { this.bytes = bytes; return this; } }; }
test('actual registered read-only routes deny public requests before obtaining any Google credential or file', async () => {
  const f = routes({ authorized: false });
  for (const handler of f.handlers.values()) { const res = response(); await handler({ params: {}, query: {} }, res); assert.equal(res.statusCode, 401); assert.equal(res.headers['Cache-Control'], 'private, no-store'); }
  assert.deepEqual(f.calls, []);
});
test('actual media route delivers only exact registered bytes with private download headers and no CRM writer dependency', async () => {
  const f = routes(), handler = f.handlers.get('/api/bna/life-skills-app/marketing/assets/:assetId'), res = response();
  await handler({ params: { assetId: asset.assetId }, query: { revision: '1', digest, download: '1' } }, res);
  assert.equal(res.statusCode, 200); assert.deepEqual(res.bytes, png); assert.equal(res.headers['Content-Disposition'], 'attachment; filename="DEMO-image.png"'); assert.equal(res.headers['X-Content-Type-Options'], 'nosniff');
  const conflict = response(); await handler({ params: { assetId: asset.assetId }, query: { revision: '2', digest } }, conflict); assert.equal(conflict.statusCode, 409); assert.equal(conflict.bytes, undefined);
});
test('actual routes report missing existing runtime authorization as unavailable, not a successful empty library', async () => {
  const f = routes({ configured: false }); for (const handler of f.handlers.values()) { const res = response(); await handler({ params: {}, query: {} }, res); assert.equal(res.statusCode, 503); assert.equal(JSON.stringify(res.body).includes('PRIVATE_SECRET_DETAIL'), false); }
  assert.deepEqual(f.calls, ['auth', 'auth']);
});
test('both actual private marketing routes retain explicit registry privacy and denial requirements', () => {
  const registry=JSON.parse(readFileSync(join(__dirname,'..','ops','route-registry.json'),'utf8'));
  for(const path of ['/api/bna/life-skills-app/marketing','/api/bna/life-skills-app/marketing/assets/:assetId']){
    const rows=registry.routes.filter(row=>row.route===path);assert.equal(rows.length,1);assert.equal(rows[0].access,'private');assert.equal(rows[0].public_allowed,false);assert.equal(rows[0].expected_logged_out_behavior,'reject_unauthorized_401');
  }
});
