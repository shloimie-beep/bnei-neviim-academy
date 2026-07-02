const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ANNOUNCEMENTS_FIRST_REQUIREMENT_ID,
  buildAnnouncementsFirstCommunityContract,
  buildAnnouncementsFirstDigestPreview,
  buildCommunityAnnouncementDraft,
  buildCommunityPrivateReplyPreview,
} = require('../src/platform/community');
const { buildOneTimeInstanceConfig } = require('../src/platform/instances/one-time');

test('One Time instance exposes an announcements-first community contract', () => {
  const config = buildOneTimeInstanceConfig();
  const community = config.community;

  assert.equal(community.requirement_id, 'REQ-20260619-411');
  assert.equal(community.mode, 'announcements_first');
  assert.equal(community.preview_only, true);
  assert.equal(community.external_write_performed, false);
  assert.equal(community.production_mutation_performed, false);
  assert.deepEqual(
    community.primary_lanes.map((lane) => lane.key),
    ['announcements', 'reminders', 'resource_links', 'private_reply_reviews']
  );
  assert.equal(community.posting_policy.open_forum_enabled, false);
  assert.equal(community.posting_policy.member_thread_creation_enabled, false);
  assert.equal(community.posting_policy.member_replies_muted_by_default, true);
  assert.equal(community.posting_policy.participant_replies_route, 'private_review_queue');
  assert.equal(community.posting_policy.student_to_student_chat_enabled, false);
  assert.ok(community.acceptance_checks.includes('announcements_reminders_and_links_sort_before_replies'));
});

test('announcement and reminder drafts are no-send previews with muted replies', () => {
  const reminder = buildCommunityAnnouncementDraft({
    kind: 'reminder',
    title: 'Tonight: Mishnah live class',
    body: 'Reminder: class starts at 7:00 PM. Bring the worksheet.',
    url: 'https://one-time.example/member/class?token=secret',
    audience: 'members',
    channels: ['member_portal', 'telegram'],
  });

  assert.equal(reminder.requirement_id, ANNOUNCEMENTS_FIRST_REQUIREMENT_ID);
  assert.equal(reminder.item_type, 'reminder');
  assert.equal(reminder.preview_only, true);
  assert.equal(reminder.external_write_performed, false);
  assert.equal(reminder.production_mutation_performed, false);
  assert.equal(reminder.no_send, true);
  assert.equal(reminder.no_portal_write, true);
  assert.equal(reminder.reply_policy.replies_muted_by_default, true);
  assert.equal(reminder.reply_policy.reply_destination, 'private_review_queue');
  assert.equal(reminder.reply_policy.visible_member_reply_feed, false);
  assert.equal(reminder.reply_policy.student_to_student_chat_enabled, false);
  assert.equal(reminder.links[0].display_url, 'https://one-time.example/member/class');
  assert.equal(reminder.links[0].url_query_redacted, true);
  assert.equal(reminder.links[0].safe_for_member_preview, false);
  assert.deepEqual(
    reminder.delivery_plan.map((channel) => [channel.channel, channel.status, channel.no_send]),
    [
      ['member_portal', 'draft_only_no_portal_write', true],
      ['telegram', 'blocked_requires_explicit_approval', true],
    ]
  );
});

test('participant replies become private review previews without returning raw text', () => {
  const reply = buildCommunityPrivateReplyPreview({
    thread_id: 'thread-7',
    reply: 'My name is Mendy Cohen and my email is mendy@example.com. Can someone message me?',
    author_type: 'student',
    author_label: 'Mendy Cohen',
    private_identifiers: ['Mendy Cohen'],
  });

  assert.equal(reply.requirement_id, ANNOUNCEMENTS_FIRST_REQUIREMENT_ID);
  assert.equal(reply.preview_only, true);
  assert.equal(reply.external_write_performed, false);
  assert.equal(reply.production_mutation_performed, false);
  assert.equal(reply.item_type, 'private_reply_review');
  assert.equal(reply.muted_in_community_feed, true);
  assert.equal(reply.community_feed_visible, false);
  assert.equal(reply.parent_visible, false);
  assert.equal(reply.reply_body_returned, false);
  assert.equal(reply.student_to_student_chat_enabled, false);
  assert.equal(reply.moderation.raw_body_returned, false);
  assert.equal(reply.moderation.safe_for_auto_publish, false);
  assert.ok(reply.moderation.report_flags.includes('contact_info'));
  assert.ok(reply.moderation.report_flags.includes('direct_chat_request'));
  assert.ok(reply.moderation.report_flags.includes('private_identifier'));
  assert.doesNotMatch(JSON.stringify(reply), /Mendy Cohen/);
  assert.doesNotMatch(JSON.stringify(reply), /mendy@example/);
});

test('digest preview sorts announcements, reminders, and links before private replies', () => {
  const digest = buildAnnouncementsFirstDigestPreview({
    items: [
      { kind: 'resource_link', title: 'Replay link', url: 'https://one-time.example/replay' },
      { kind: 'reminder', title: 'Worksheet due tomorrow' },
      { kind: 'announcement', title: 'Rabbi welcome note' },
      { kind: 'private_reply_review', title: 'Hidden reply review' },
    ],
  });

  assert.equal(digest.requirement_id, ANNOUNCEMENTS_FIRST_REQUIREMENT_ID);
  assert.equal(digest.preview_only, true);
  assert.equal(digest.no_send, true);
  assert.equal(digest.hidden_reply_items, 1);
  assert.deepEqual(
    digest.cards.map((card) => [card.item_type, card.title]),
    [
      ['announcement', 'Rabbi welcome note'],
      ['reminder', 'Worksheet due tomorrow'],
      ['resource_link', 'Replay link'],
    ]
  );
  assert.equal(digest.delivery_plan.every((channel) => channel.no_send === true), true);
});

test('announcements-first product doc records the no-send launch contract', () => {
  const doc = fs.readFileSync('docs/product/one-time-announcements-first-community.md', 'utf8');
  assert.match(doc, /announcements-first/i);
  assert.match(doc, /no student-to-student private chat/i);
  assert.match(doc, /no raw private reply text returned/i);
  assert.match(doc, /external_write_performed: false/);
});
