const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildBufferAssets,
  inferBufferAssetKind,
  isKnownNonDirectMediaUrl,
} = require('../src/lib/bna/buffer-media-assets');

test('buildBufferAssets returns no assets when no hosted media URL is present', () => {
  const result = buildBufferAssets({}, { output_type: 'facebook_post', metadata: {} });

  assert.deepEqual(result.assets, []);
  assert.equal(result.media_url, null);
  assert.equal(result.media_type, null);
});

test('buildBufferAssets maps hosted image URLs to Buffer image assets', () => {
  const result = buildBufferAssets({}, {
    output_type: 'facebook_post',
    metadata: { hosted_media_url: 'https://cdn.example.com/class-photo.webp' },
  });

  assert.deepEqual(result.assets, [
    { image: { url: 'https://cdn.example.com/class-photo.webp' } },
  ]);
  assert.equal(result.media_type, 'image');
});

test('buildBufferAssets maps hosted video URLs and thumbnails to Buffer video assets', () => {
  const result = buildBufferAssets(
    {
      media_url: 'https://cdn.example.com/mishnah-review',
      thumbnail_url: 'https://cdn.example.com/mishnah-review-thumb.jpg',
      mime_type: 'video/mp4',
    },
    { output_type: 'youtube_description', metadata: {} },
  );

  assert.deepEqual(result.assets, [
    {
      video: {
        url: 'https://cdn.example.com/mishnah-review',
        thumbnailUrl: 'https://cdn.example.com/mishnah-review-thumb.jpg',
      },
    },
  ]);
  assert.equal(result.media_type, 'video');
  assert.equal(result.thumbnail_url, 'https://cdn.example.com/mishnah-review-thumb.jpg');
});

test('buildBufferAssets rejects local media paths before a Buffer write', () => {
  assert.throws(
    () => buildBufferAssets(
      { media_url: 'C:\\Users\\User\\Videos\\class.mp4' },
      { output_type: 'facebook_post', metadata: {} },
    ),
    /hosted media URL must be a full http:\/\/ or https:\/\//,
  );
});

test('buildBufferAssets rejects Drive preview links as non-direct media URLs', () => {
  assert.equal(isKnownNonDirectMediaUrl('https://drive.google.com/file/d/example/view'), true);
  assert.throws(
    () => buildBufferAssets(
      { media_url: 'https://drive.google.com/file/d/example/view', mime_type: 'video/mp4' },
      { output_type: 'facebook_post', metadata: {} },
    ),
    /direct public file URL/,
  );
});

test('inferBufferAssetKind recognizes mime types, extensions, and YouTube video outputs', () => {
  assert.equal(inferBufferAssetKind({ mediaType: 'image/png' }), 'image');
  assert.equal(inferBufferAssetKind({ mediaType: 'video/mp4' }), 'video');
  assert.equal(inferBufferAssetKind({ url: 'https://cdn.example.com/photo.jpg' }), 'image');
  assert.equal(inferBufferAssetKind({ url: 'https://cdn.example.com/clip.mov' }), 'video');
  assert.equal(inferBufferAssetKind({ url: 'https://cdn.example.com/no-extension', outputType: 'youtube_description' }), 'video');
});
