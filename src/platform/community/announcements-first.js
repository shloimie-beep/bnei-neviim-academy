const { buildPrivateQuestionModerationDraft } = require('../../lib/bna/community-moderation');
const { cleanString, normalizeArray, normalizeKey, stableId } = require('../core/ids');

const ANNOUNCEMENTS_FIRST_REQUIREMENT_ID = 'REQ-20260619-411';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';

const ANNOUNCEMENTS_FIRST_LANES = Object.freeze([
  {
    key: 'announcements',
    rank: 10,
    label: 'Announcements',
    purpose: 'Rabbi/admin updates that members should see first.',
  },
  {
    key: 'reminders',
    rank: 20,
    label: 'Reminders',
    purpose: 'Class time, worksheet, live link, deadline, and replay reminders.',
  },
  {
    key: 'resource_links',
    rank: 30,
    label: 'Links',
    purpose: 'Approved class, worksheet, video, Zoom, Vimeo, and member-library links.',
  },
  {
    key: 'private_reply_reviews',
    rank: 90,
    label: 'Private Replies',
    purpose: 'Muted participant replies routed to Rabbi/admin review only.',
  },
]);

const ANNOUNCEMENTS_FIRST_ALLOWED_TYPES = Object.freeze([
  'announcement',
  'reminder',
  'resource_link',
  'digest',
]);

function safeText(value, fallback = '') {
  return cleanString(value, fallback);
}

function normalizedList(value = []) {
  return normalizeArray(value).map((item) => safeText(item)).filter(Boolean);
}

function itemType(input = {}) {
  const explicit = normalizeKey(input.item_type || input.itemType || input.kind || input.type);
  if (ANNOUNCEMENTS_FIRST_ALLOWED_TYPES.includes(explicit)) return explicit;
  const text = `${input.title || ''} ${input.body || input.message || ''}`.toLowerCase();
  if (/\b(remind|reminder|tomorrow|today|starts?|due|deadline|zoom)\b/.test(text)) return 'reminder';
  if (safeText(input.url || input.href) || normalizedList(input.links).length > 0) return 'resource_link';
  return 'announcement';
}

function audienceKey(value = 'members') {
  const normalized = normalizeKey(value || 'members');
  return [
    'members',
    'parents',
    'students',
    'service_provider',
    'admins',
    'cohort_visible',
    'private_review',
  ].includes(normalized) ? normalized : 'members';
}

function urlPreview(value = '') {
  const raw = safeText(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    const unsafeSearch = /(?:^|[?&])(token|key|secret|password|signature|code)=/i.test(parsed.search);
    return {
      display_url: `${parsed.origin}${parsed.pathname}`,
      url_present: true,
      url_query_redacted: Boolean(parsed.search),
      safe_for_member_preview: !unsafeSearch,
    };
  } catch {
    return {
      display_url: '',
      url_present: true,
      url_query_redacted: true,
      safe_for_member_preview: false,
    };
  }
}

function resourceLinks(input = {}) {
  const links = normalizedList(input.links).map((url) => ({ url }));
  if (safeText(input.url || input.href)) links.unshift({ url: safeText(input.url || input.href) });
  return links.map((link, index) => {
    const preview = urlPreview(link.url || link.href);
    return {
      key: normalizeKey(link.key || link.title || `link_${index + 1}`),
      title: safeText(link.title || link.label || `Link ${index + 1}`),
      ...preview,
    };
  });
}

function deliveryPlan(input = {}) {
  const channels = normalizedList(input.channels).length
    ? normalizedList(input.channels)
    : ['member_portal', 'email', 'telegram', 'whatsapp'];
  return channels.map((channel) => {
    const key = normalizeKey(channel);
    return {
      channel: key,
      status: key === 'member_portal' ? 'draft_only_no_portal_write' : 'blocked_requires_explicit_approval',
      no_send: true,
      external_write_performed: false,
    };
  });
}

function buildAnnouncementsFirstCommunityContract(options = {}) {
  return {
    requirement_id: ANNOUNCEMENTS_FIRST_REQUIREMENT_ID,
    workspace_key: safeText(options.workspace_key || options.workspaceKey || ONE_TIME_WORKSPACE_KEY),
    project_key: safeText(options.project_key || options.projectKey || ONE_TIME_PROJECT_KEY),
    mode: 'announcements_first',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    primary_lanes: ANNOUNCEMENTS_FIRST_LANES.map((lane) => ({ ...lane })),
    posting_policy: {
      open_forum_enabled: false,
      member_thread_creation_enabled: false,
      member_replies_muted_by_default: true,
      participant_replies_route: 'private_review_queue',
      student_to_student_chat_enabled: false,
      public_member_feed_enabled: false,
      external_notifications_enabled: false,
    },
    operator_actions: [
      'draft_announcement',
      'draft_reminder',
      'attach_approved_resource_link',
      'review_private_reply',
      'approve_anonymized_digest_candidate',
    ],
    acceptance_checks: [
      'announcements_reminders_and_links_sort_before_replies',
      'member_replies_do_not_become_feed_posts',
      'reply_raw_body_is_not_returned_from_preview',
      'all_delivery_channels_are_no_send_without_explicit_approval',
      'student_to_student_private_chat_is_disabled',
    ],
  };
}

function buildCommunityAnnouncementDraft(input = {}) {
  const type = itemType(input);
  const title = safeText(input.title || input.subject || (type === 'reminder' ? 'Class reminder' : 'Community announcement'));
  const body = safeText(input.body || input.message || input.copy);
  const audience = audienceKey(input.audience || input.visibility || 'members');
  const links = resourceLinks(input);
  const rank = ANNOUNCEMENTS_FIRST_LANES.find((lane) => {
    if (type === 'announcement' || type === 'digest') return lane.key === 'announcements';
    if (type === 'reminder') return lane.key === 'reminders';
    return lane.key === 'resource_links';
  })?.rank || 50;

  return {
    requirement_id: ANNOUNCEMENTS_FIRST_REQUIREMENT_ID,
    id: safeText(input.id || stableId('COMMUNITYDRAFT', [type, title, audience, body, links.map((link) => link.display_url).join('|')])),
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    no_send: true,
    no_portal_write: true,
    mode: 'announcements_first',
    item_type: type,
    lane_rank: rank,
    title,
    body,
    audience,
    status: 'draft_needs_human_review',
    pinned: input.pinned !== false,
    links,
    reply_policy: {
      replies_muted_by_default: true,
      reply_destination: 'private_review_queue',
      visible_member_reply_feed: false,
      student_to_student_chat_enabled: false,
    },
    delivery_plan: deliveryPlan(input),
    guardrails: [
      'No email, WhatsApp, Telegram, portal notification, Buffer/social, Drive, Zoom, Vimeo, or database publish write is performed by this preview.',
      'Participant replies stay private until Rabbi/admin review.',
    ],
  };
}

function buildCommunityPrivateReplyPreview(input = {}) {
  const body = safeText(input.body || input.message || input.reply || input.question);
  const moderation = buildPrivateQuestionModerationDraft({
    question_ref: input.reply_ref || input.replyRef || input.id || stableId('COMMUNITYREPLY', [input.thread_id || input.threadId, body]),
    body,
    author_type: input.author_type || input.authorType || 'member',
    author_label: input.author_label || input.authorLabel || input.author_name || input.authorName,
    private_identifiers: input.private_identifiers || input.privateIdentifiers || [],
    desired_visibility: 'private',
  });

  return {
    requirement_id: ANNOUNCEMENTS_FIRST_REQUIREMENT_ID,
    id: safeText(input.id || stableId('COMMUNITYREPLYREVIEW', [input.thread_id || input.threadId, moderation.question_ref])),
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    thread_ref: safeText(input.thread_id || input.threadId || input.thread_ref || input.threadRef),
    mode: 'announcements_first',
    item_type: 'private_reply_review',
    muted_in_community_feed: true,
    community_feed_visible: false,
    parent_visible: false,
    reply_body_returned: false,
    student_to_student_chat_enabled: false,
    review_destination: 'rabbi_admin_private_review_queue',
    moderation,
    guardrails: [
      'Reply preview does not return raw participant text.',
      'No member-visible feed post, parent-visible post, notification, or external send is created.',
    ],
  };
}

function buildAnnouncementsFirstDigestPreview(input = {}) {
  const items = Array.isArray(input.items) ? input.items : [];
  const hiddenReplyItems = items.filter((item) => normalizeKey(item.item_type || item.type || item.kind) === 'private_reply_review');
  const drafts = items
    .filter((item) => normalizeKey(item.item_type || item.type || item.kind) !== 'private_reply_review')
    .map((item) => buildCommunityAnnouncementDraft(item))
    .sort((a, b) => a.lane_rank - b.lane_rank || a.title.localeCompare(b.title));
  return {
    requirement_id: ANNOUNCEMENTS_FIRST_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    no_send: true,
    mode: 'announcements_first',
    cards: drafts.map((draft) => ({
      id: draft.id,
      item_type: draft.item_type,
      title: draft.title,
      audience: draft.audience,
      lane_rank: draft.lane_rank,
      link_count: draft.links.length,
    })),
    hidden_reply_items: hiddenReplyItems.length,
    delivery_plan: deliveryPlan(input),
  };
}

module.exports = {
  ANNOUNCEMENTS_FIRST_LANES,
  ANNOUNCEMENTS_FIRST_REQUIREMENT_ID,
  buildAnnouncementsFirstCommunityContract,
  buildAnnouncementsFirstDigestPreview,
  buildCommunityAnnouncementDraft,
  buildCommunityPrivateReplyPreview,
};
