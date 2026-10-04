const { createHash } = require('node:crypto');
const MAX_BYTES = 10 * 1024 * 1024;
class MarketingMediaError extends Error {
  constructor(code, status = 503) { super(code); this.code = code; this.status = status; }
}
function driveFileId(value) {
  let url; try { url = new URL(value); } catch { throw new MarketingMediaError('ASSET_SOURCE_UNAVAILABLE'); }
  if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com' || url.port || url.username || url.password) throw new MarketingMediaError('ASSET_SOURCE_UNAVAILABLE');
  const match = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/view)?\/?$/);
  const id = match?.[1] || (['/open', '/uc'].includes(url.pathname) ? url.searchParams.get('id') : null);
  if (!id || !/^[A-Za-z0-9_-]{8,200}$/.test(id)) throw new MarketingMediaError('ASSET_SOURCE_UNAVAILABLE');
  return id;
}
function selectedAsset(snapshot, { assetId, revision, digest }) {
  if (typeof assetId !== 'string' || !/^[A-Za-z0-9._-]{1,200}$/.test(assetId) || !/^[1-9]\d{0,5}$/.test(String(revision)) || typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) throw new MarketingMediaError('INVALID_ASSET_REQUEST', 400);
  const matches = (snapshot?.creatives || []).filter(item => item.assetId === assetId);
  if (!matches.length) throw new MarketingMediaError('ASSET_NOT_FOUND', 404);
  if (matches.length !== 1) throw new MarketingMediaError('ASSET_REGISTRY_CONFLICT', 409);
  const asset = matches[0];
  if (!['CURRENT_APPROVED', 'CURRENT_REVIEW', 'CURRENT_REVIEW_CANDIDATE', 'CURRENT_ACCEPTED_HELD'].includes(asset.libraryState) || asset.review === 'retired') throw new MarketingMediaError('ASSET_NOT_FOUND', 404);
  if (asset.registeredRevision !== true || asset.revision !== Number(revision) || asset.contentDigest !== digest) throw new MarketingMediaError('ASSET_VERSION_CHANGED', 409);
  return asset;
}
async function readLifeSkillsMarketingMedia({ drive, snapshot, assetId, revision, digest }) {
  const asset = selectedAsset(snapshot, { assetId, revision, digest });
  const fileId = driveFileId(asset.imageUrl);
  let stream;
  try {
    const metadata = (await drive.files.get({ fileId, fields: 'id,mimeType,size,trashed,capabilities(canDownload)', supportsAllDrives: true }, { timeout: 15000 })).data;
    const size = Number(metadata?.size);
    if (metadata?.id !== fileId || metadata.trashed || metadata.mimeType !== 'image/png' || metadata.capabilities?.canDownload === false) throw new MarketingMediaError('ASSET_SOURCE_UNAVAILABLE');
    if (!Number.isSafeInteger(size) || size < 33 || size > MAX_BYTES) throw new MarketingMediaError('ASSET_SIZE_UNAVAILABLE');
    stream = (await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'stream', timeout: 15000 })).data;
    const chunks = []; let total = 0;
    for await (const chunk of stream) {
      const bytes = Buffer.from(chunk); total += bytes.length;
      if (total > MAX_BYTES || total > size) throw new MarketingMediaError('ASSET_SIZE_UNAVAILABLE');
      chunks.push(bytes);
    }
    if (total !== size) throw new MarketingMediaError('ASSET_SIZE_UNAVAILABLE');
    const bytes = Buffer.concat(chunks, total);
    if (createHash('sha256').update(bytes).digest('hex') !== asset.contentDigest) throw new MarketingMediaError('ASSET_BYTES_CHANGED', 409);
    if (!bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new MarketingMediaError('ASSET_FORMAT_UNAVAILABLE');
    if (bytes.readUInt32BE(16) !== asset.width || bytes.readUInt32BE(20) !== asset.height || asset.width < 1 || asset.height < 1 || asset.width > 4096 || asset.height > 4096) throw new MarketingMediaError('ASSET_DIMENSIONS_CHANGED', 409);
    return { bytes, mimeType: 'image/png', filename: `${asset.assetId}-r${asset.revision}.png`, digest: asset.contentDigest };
  } catch (error) {
    if (error instanceof MarketingMediaError) throw error;
    throw new MarketingMediaError('ASSET_SOURCE_UNAVAILABLE');
  } finally { stream?.destroy?.(); }
}
module.exports = { MAX_BYTES, MarketingMediaError, driveFileId, selectedAsset, readLifeSkillsMarketingMedia };
