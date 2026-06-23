const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.heic']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const NON_DIRECT_MEDIA_HOSTS = [
  /(^|\.)drive\.google\.com$/i,
  /(^|\.)docs\.google\.com$/i,
  /(^|\.)dropbox\.com$/i,
];

function compactText(value = '', max = 900) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function firstText(...values) {
  for (const value of values) {
    const text = compactText(value);
    if (text) return text;
  }
  return '';
}

function metadataObject(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function httpUrl(value = '', fieldName = 'hosted media URL') {
  const url = compactText(value);
  if (!url) return '';
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    const error = new Error(`${fieldName} must be a full http:// or https:// URL`);
    error.status = 400;
    throw error;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    const error = new Error(`${fieldName} must be a full http:// or https:// URL`);
    error.status = 400;
    throw error;
  }
  return parsed.toString();
}

function isKnownNonDirectMediaUrl(url = '') {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return NON_DIRECT_MEDIA_HOSTS.some((pattern) => pattern.test(parsed.hostname));
  } catch {
    return false;
  }
}

function pathExtension(url = '') {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/(\.[a-z0-9]+)$/i);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function inferBufferAssetKind({ url = '', mediaType = '', outputType = '' } = {}) {
  const type = compactText(mediaType, 120).toLowerCase();
  if (type.startsWith('image/') || type === 'image' || type === 'photo') return 'image';
  if (type.startsWith('video/') || type === 'video' || type === 'clip' || type === 'recording') return 'video';

  const ext = pathExtension(url);
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (String(outputType || '') === 'youtube_description') return 'video';
  return '';
}

function bufferMediaUrlCandidates(job = {}, output = {}, metadata = {}, options = {}) {
  return [
    options.hostedMediaUrl,
    options.hosted_media_url,
    options.mediaUrl,
    options.media_url,
    metadata.hosted_media_url,
    metadata.hostedMediaUrl,
    metadata.media_url,
    metadata.mediaUrl,
    metadata.source_media_url,
    metadata.sourceMediaUrl,
    metadata.source_url,
    metadata.sourceUrl,
    job.hosted_media_url,
    job.hostedMediaUrl,
    job.media_url,
    job.mediaUrl,
    job.source_media_url,
    job.sourceMediaUrl,
  ];
}

function buildBufferAssets(job = {}, output = {}, options = {}) {
  const metadata = metadataObject(output.metadata);
  const mediaUrlRaw = firstText(...bufferMediaUrlCandidates(job, output, metadata, options));
  if (!mediaUrlRaw) {
    return {
      assets: [],
      media_url: null,
      media_type: null,
      thumbnail_url: null,
    };
  }

  const mediaUrl = httpUrl(mediaUrlRaw, 'hosted media URL');
  if (isKnownNonDirectMediaUrl(mediaUrl)) {
    const error = new Error('Hosted media URL must be a direct public file URL, not a Drive/Dropbox preview link');
    error.status = 400;
    error.hint = 'Host the image/video on a stable public file host such as Cloudinary or Cloudflare R2 before creating the Buffer draft.';
    throw error;
  }

  const mediaType = firstText(
    options.mediaType,
    options.media_type,
    metadata.media_type,
    metadata.mediaType,
    job.mime_type,
    job.mimeType,
    job.media_type,
    job.mediaType,
  );
  const kind = inferBufferAssetKind({ url: mediaUrl, mediaType, outputType: output.output_type });
  if (!kind) {
    const error = new Error('Hosted media URL must point to a recognizable image or video file, or include media_type image/video');
    error.status = 400;
    error.hint = 'Use a direct .jpg/.png/.webp/.mp4/.mov/.webm URL or set media_type before creating the Buffer draft.';
    throw error;
  }

  const thumbnailRaw = firstText(
    options.thumbnailUrl,
    options.thumbnail_url,
    metadata.thumbnail_url,
    metadata.thumbnailUrl,
    metadata.thumbnail_image_url,
    metadata.thumbnailImageUrl,
    job.thumbnail_url,
    job.thumbnailUrl,
  );
  const thumbnailUrl = kind === 'video' && thumbnailRaw
    ? httpUrl(thumbnailRaw, 'thumbnail URL')
    : null;

  if (thumbnailUrl && isKnownNonDirectMediaUrl(thumbnailUrl)) {
    const error = new Error('Thumbnail URL must be a direct public file URL, not a Drive/Dropbox preview link');
    error.status = 400;
    error.hint = 'Use a stable public thumbnail URL before creating the Buffer draft.';
    throw error;
  }

  const asset = kind === 'image'
    ? { image: { url: mediaUrl } }
    : {
      video: {
        url: mediaUrl,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      },
    };

  return {
    assets: [asset],
    media_url: mediaUrl,
    media_type: kind,
    thumbnail_url: thumbnailUrl,
  };
}

module.exports = {
  buildBufferAssets,
  inferBufferAssetKind,
  isKnownNonDirectMediaUrl,
};
