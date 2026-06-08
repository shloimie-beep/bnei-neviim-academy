function normalizedText(...parts) {
  return parts
    .map((part) => String(part || ''))
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function parseContentOutputTypeFromText(text, fallbackText = '') {
  const normalized = normalizedText(text, fallbackText);
  if (/\b(facebook|fb)\b/.test(normalized)) return 'facebook_post';
  if (/\b(whatsapp|what'?s\s*app|wa update|parent update)\b/.test(normalized)) return 'whatsapp_update';
  if (/\b(newsletter|weekly update|week update|end[-\s]?of[-\s]?week)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(email|e-mail)\s+(draft|copy|newsletter|weekly update)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(draft|copy)\s+(email|e-mail)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(blog|article|website post|website draft)\b/.test(normalized)) return 'blog_draft';
  if (/\blinkedin\b/.test(normalized)) return 'linkedin_post';
  if (/\byoutube\b/.test(normalized)) return 'youtube_description';
  return null;
}

function hasAppSurfaceWorkIntent(text) {
  return /\b(sign\s*up|signup|registration|form|page|toolbar|button|buttons|payment|cash|credit|bank transfer|confirmation email|email goes|email sends|send(?:s|ing)? an email|document|documents|waiver|parent handbook|student handbook|tuition agreement|modal|new page|hebrew and english|english and hebrew)\b/i
    .test(String(text || ''));
}

function hasExplicitDraftEvidence(text, replyText = '') {
  const combined = normalizedText(text, replyText);
  return /\b(content output|output\s*#?\s*\d+|content draft|draft\s*#?\s*\d+|newsletter draft|weekly newsletter|weekly update|whatsapp draft|facebook draft|blog draft|caption|copy block|copy-paste)\b/
    .test(combined);
}

function shouldBlockContentDraftEditIntent({
  text = '',
  replyText = '',
  outputId = null,
  jobId = null,
  contentFollowup = false,
  draftLikeReply = false,
} = {}) {
  if (outputId || jobId || contentFollowup || draftLikeReply) return false;
  if (!hasAppSurfaceWorkIntent(text)) return false;
  return !hasExplicitDraftEvidence(text, replyText);
}

module.exports = {
  hasAppSurfaceWorkIntent,
  hasExplicitDraftEvidence,
  parseContentOutputTypeFromText,
  shouldBlockContentDraftEditIntent,
};
