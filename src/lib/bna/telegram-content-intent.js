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
  if (/\b(google business|gbp|google post|business profile)\b/.test(normalized)) return 'google_business_post';
  if (/\b(daily report|internal report|ops report|operations report)\b/.test(normalized)) return 'daily_report';
  if (/\b(parent email|email to parents?|parent-facing email)\b/.test(normalized)) return 'parent_email';
  if (/\b(teaching philosophy|philosophy note|teaching note)\b/.test(normalized)) return 'teaching_philosophy_note';
  if (/\b(short clip|clip packaging|reel caption|short-form|short form)\b/.test(normalized)) return 'short_clip';
  if (/\b(newsletter|weekly update|week update|end[-\s]?of[-\s]?week)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(email|e-mail)\s+(draft|copy|newsletter|weekly update)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(draft|copy)\s+(email|e-mail)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(blog|article|website post|website draft)\b/.test(normalized)) return 'blog_draft';
  if (/\blinkedin\b/.test(normalized)) return 'linkedin_post';
  if (/\byoutube\b/.test(normalized)) return 'youtube_description';
  return null;
}

function hasAppSurfaceWorkIntent(text) {
  return /\b(sign\s*up|signup|registration|form|page|toolbar|static toolbar|side\s*menu|side\s*bar|sidebar|sandwich|hamburger|drop[-\s]?down|dropdown|section|sections|filter|filters|button|buttons|student login|parent login|teacher login|attendance|meeting recordings?|questions?|payment|cash|credit|bank transfer|confirmation email|email goes|email sends|send(?:s|ing)? an email|document|documents|waiver|parent handbook|student handbook|tuition agreement|modal|new page|hebrew and english|english and hebrew)\b/i
    .test(String(text || ''));
}

function hasExplicitDraftEvidence(text, replyText = '') {
  const combined = normalizedText(text, replyText);
  return /\b(content output|output\s*#?\s*\d+|content draft|draft\s*#?\s*\d+|newsletter draft|weekly newsletter|weekly update|whatsapp draft|facebook draft|blog draft|caption|copy block|copy-paste)\b/
    .test(combined);
}

function hasContentCommitToSchedulingIntent(text, replyText = '') {
  const combined = normalizedText(text, replyText);
  return /\b(commit|commit it|committed|finalize|finalise|create facebook draft|create buffer draft|send to buffer|push to buffer|push it to buffer|ready to schedule|schedule it|schedule this|scheduler|buffer draft)\b/
    .test(combined);
}

function hasPublicPublishNowIntent(text, replyText = '') {
  const combined = normalizedText(text, replyText);
  return /\b(publish now|post now|publish publicly|make public|send to facebook now|post to facebook now|go public)\b/
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
  hasContentCommitToSchedulingIntent,
  hasAppSurfaceWorkIntent,
  hasExplicitDraftEvidence,
  hasPublicPublishNowIntent,
  parseContentOutputTypeFromText,
  shouldBlockContentDraftEditIntent,
};
