const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const plan = fs.readFileSync('ops/one-time-mishnah/forum-gamification-moderation-plan.md', 'utf8');

test('One Time forum moderation plan exists with the required safety sections', () => {
  const sections = [
    '## Purpose',
    '## Current State',
    '## Launch Principle',
    '## Roles And Visibility',
    '## Moderation Pipeline',
    '## Moderation Categories',
    '## Review States',
    '## Temporary Hold Policy',
    '## Gamification Policy',
    '## Data Model Candidates',
    '## AI Moderation Prompt Contract',
    '## Notifications',
    '## Implementation Sequence',
    '## Approval Gate',
    '## Smoke Tests Before Launch',
    '## Current Recommendation',
  ];

  for (const section of sections) {
    assert.match(plan, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('One Time forum moderation plan blocks unsafe public forum behavior', () => {
  assert.match(plan, /No public forum, unreviewed member-visible answer\s+feed/);
  assert.match(plan, /Nothing submitted by a child, parent, member, or Rabbi participant becomes\s+public or member-visible automatically/);
  assert.match(plan, /Bullying, insults, name-calling/);
  assert.match(plan, /Sharing phone numbers, emails, addresses, or private contact info/);
  assert.match(plan, /temporary holds instead of automatic bans/i);
  assert.match(plan, /Permanent suspension requires explicit human decision and audit trail/);
});

test('One Time gamification plan rewards quality without leaderboards or shame', () => {
  assert.match(plan, /Internal points for a thoughtful question/);
  assert.match(plan, /Rabbi\/admin mark as excellent/);
  assert.match(plan, /Not allowed for launch:[\s\S]*Public shame[\s\S]*Negative points[\s\S]*Open anonymous\/public leaderboard/);
  assert.match(plan, /Approved 2026-07-08 scoreboard rule/);
  assert.match(plan, /approved_question = 5/);
  assert.match(plan, /Raw private replies, held responses, rejected\s+messages, unreviewed student text/);
  assert.match(plan, /Approved-only rewards scoreboard appears only from reviewed classroom events/);
});

test('One Time forum moderation plan keeps external writes approval-gated', () => {
  assert.match(plan, /Private in-app Operations alert/);
  assert.match(plan, /Telegram notification to Shloimie\/Rabbi/);
  assert.match(plan, /Every external notification needs sender, recipient, copy, channel, opt-in/);
  assert.match(plan, /No email\/WhatsApp\/SMS\/Telegram\/portal send runs during dry-run/);
  assert.doesNotMatch(plan, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(plan, /password\s*[:=]\s*\S+/i);
});
