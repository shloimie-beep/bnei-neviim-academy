# One Time Forum And Gamification Moderation Plan

Date: 2026-06-15

Status: local readiness plan with approved-only classroom rewards scoreboard
allowed as of 2026-07-08. No public forum, unreviewed member-visible answer
feed, open student discussion surface, reward ledger, notification send,
access grant, prize/coupon/credit, or external connector write exists from
this document.

## Purpose

The One Time Mishnah community may eventually benefit from a structured
question/comment space, but the first safe milestone is not an open forum. The
first milestone is a private, authenticated, moderated question path that can
surface strong Torah questions to Rabbi Elie and Shloimie without exposing
children, members, private contact details, support issues, or unreviewed AI
answers.

## Current State

- Workflow L documents private question submission without a public forum.
- `bna_one_time_question_reviews` stores private One Time question reviews.
- `GET /api/bna/one-time/question-moderation` reads the private Operations
  queue.
- `submit_student_question_for_moderation` can create a private review item.
- `review_moderated_question` can update the private review item.
- Operations Content > One Time Library shows the private queue.
- Operations Dashboard > Alerts can show private in-app moderation alerts.

Current limits:

- There is no approved member-visible question feed.
- There is no public forum.
- There is an approved-only classroom participation event table that can power
  a member-visible positive rewards scoreboard. There is still no prize,
  coupon, credit, payment, access-grant, or external reward ledger.
- There is no AI moderation classifier attached to a public/member posting
  surface.
- There is no approved parent/provider policy for student discussion.
- There is no external send or notification channel for forum activity.

## Launch Principle

Private first, then moderated, then selectively visible.

Nothing submitted by a child, parent, member, or Rabbi participant becomes
public or member-visible automatically. AI may triage and recommend, but a
human reviewer controls publication, answer visibility, rewards, and any hold
or suspension.

## Roles And Visibility

| Role | Can submit | Can review | Can publish/feature | Notes |
|---|---:|---:|---:|---|
| Authenticated student/participant | Yes | No | No | Display name should be initials or approved nickname by default. |
| Parent/member account | Yes | No | No | May submit for household or flag safety concerns. |
| Rabbi Elie | Yes | Yes | Recommend/approve Torah answers | Can mark strong questions and answer paths. |
| Shloimie/admin | Yes | Yes | Yes | Owns safety, visibility, holds, and operational policy. |
| Codex/assistant | Draft/triage only | Suggest only | No | Cannot publish, reward, suspend, or message externally. |

## Moderation Pipeline

1. Authenticated participant submits a question/comment.
2. The item is stored private with `member_visible = false`,
   `forum_post_created = false`, `no_send = true`, and
   `external_write_performed = false`.
3. AI moderation triages the text and produces categories, severity,
   suggested visibility, and reviewer notes.
4. Safe Torah/class questions move to human review.
5. Strong questions can be assigned to Rabbi, added to a digest, or marked for
   source-sheet/class follow-up.
6. Unsafe or ambiguous items stay hidden and route to Shloimie/admin review.
7. Severe safety issues create urgent internal alerts and a temporary hold
   recommendation, not an automatic permanent ban.
8. Human review decides whether the item is answered privately, answered in
   class, anonymized for a digest, rewarded, archived, rejected, or escalated.

## Moderation Categories

Allowed or encouraged after review:

- Mishnah questions.
- Class clarification questions.
- Thoughtful source questions.
- Relevant comments on class material.
- Critical thinking that stays respectful.
- Private learning struggles that should remain private.

Blocked or flagged before publication:

- Bullying, insults, name-calling, or social pressure.
- Inappropriate language.
- Adult, sexual, or romantic content.
- Personal meetup requests.
- Sharing phone numbers, emails, addresses, or private contact info.
- Harassment, threats, or intimidation.
- Irrelevant spam or promotion.
- Private family, payment, access, medical, or support issues.
- Attempts to identify or shame another child/member.

## Review States

Recommended future state values:

- `submitted_private`
- `ai_reviewing`
- `needs_human_review`
- `safe_for_rabbi_review`
- `excellent_question_candidate`
- `answered_privately`
- `answered_in_class`
- `approved_anonymized_digest`
- `held_for_safety_review`
- `temporary_hold_pending_admin`
- `rejected_private`
- `archived_private`

No state above should imply member visibility unless a separate
`member_visible` or `published_at` field is explicitly set by an approved
human action.

## Temporary Hold Policy

Use temporary holds instead of automatic bans.

- AI can recommend `temporary_hold_pending_admin` for severe or repeated risk.
- The hold should prevent new public/member-visible submissions only if such a
  surface exists; it should not block private support/safety contact.
- Admin must see reason, evidence, affected account, duration, appeal/review
  path, and prior incidents.
- Permanent suspension requires explicit human decision and audit trail.

## Gamification Policy

Rewards should encourage Torah thinking, not social comparison.

Allowed after approval:

- Internal points for a thoughtful question.
- Badge such as `thoughtful_question`, `clear_source`, or `excellent_question`.
- Rabbi/admin mark as excellent.
- Private praise or parent/member acknowledgement after send approval.
- Digest inclusion with anonymized attribution when approved.

Not allowed for launch:

- Public shame.
- Negative points.
- Public discipline labels.
- Open anonymous/public leaderboard.
- Ranking students by raw volume, private replies, unreviewed text, discipline,
  or negative behavior.
- Rewarding volume over quality.
- Automatic prizes, coupons, discounts, or payment credits.

Approved 2026-07-08 scoreboard rule: the One Time classroom may show a
member-visible positive rewards scoreboard that counts only approved
classroom-visible participation events. Initial scoring formula:
`approved_question = 5`, `approved_response = 3`, `rabbi_featured = 8`, and
`assignment_participation = 2`. Raw private replies, held responses, rejected
messages, unreviewed student text, negative points, prizes, coupons, discounts,
access grants, and external notifications remain forbidden.

## Data Model Candidates

Build only after approval:

- `bna_one_time_question_reviews` extension fields:
  - `ai_moderation_status`
  - `ai_moderation_categories`
  - `ai_moderation_severity`
  - `ai_recommended_action`
  - `member_visible`
  - `published_at`
  - `published_by`
  - `anonymized_display_name`
  - `reward_points_delta`
  - `reward_badges`
  - `hold_recommended`
  - `hold_decision`
  - `reviewed_by`
  - `reviewed_at`
- New audit table if needed:
  - `bna_one_time_moderation_events`
  - immutable event type, actor, target review id, old/new state, reason,
    model/prompt version, timestamp, and no secret values.
- Optional future reward ledger:
  - `bna_one_time_participant_rewards`
  - participant id, question review id, points delta, badge, awarded by,
    awarded at, visibility, and revocation reason.

## AI Moderation Prompt Contract

The moderation prompt must:

- Classify allowed, needs review, blocked, or severe hold candidate.
- Return structured JSON only.
- Quote no more private text than needed for reviewer context.
- Never answer Torah questions as final public/member content.
- Never recommend permanent ban.
- Never publish, send, notify externally, grant access, or update billing.
- Distinguish support/access/payment issues from Torah questions.
- Flag private contact info and child-identifying details.
- Include confidence and reason codes.

## Notifications

Allowed now:

- Private in-app Operations alert for new review or severe safety flag.

Approval-gated:

- Telegram notification to Shloimie/Rabbi.
- Email notification.
- WhatsApp/SMS.
- Member portal notification.
- Parent acknowledgement.

Every external notification needs sender, recipient, copy, channel, opt-in,
rollback/no-send plan, and smoke evidence.

## Implementation Sequence

1. Keep existing private queue as the source of truth.
2. Add AI moderation preview fields and a dry-run classifier.
3. Add an Operations reviewer panel for categories, severity, state, reward
   candidate, and temporary hold recommendation.
4. Add immutable moderation event logging.
5. Add private reward candidate marking for strong questions.
6. Add approved anonymized digest preview.
7. Add optional member-visible digest only after explicit visibility approval.
8. Add any external notifications only after channel-specific approval.

## Approval Gate

Do not build or enable any public/member-visible forum behavior until Shloimie
approves:

- participant identity source and authentication route
- parent/provider safety policy
- AI moderation prompt and severity rubric
- human reviewer owner and response cadence
- visibility options and anonymization format
- temporary hold policy and appeal path
- reward/points/badge rules
- leaderboard decision, explicitly yes or no
- notification channels and copy
- test participant and smoke path
- rollback/unpublish/hold removal path

## Smoke Tests Before Launch

Required before any member-visible surface:

- Unauthenticated user cannot submit or view questions.
- Authenticated test participant can submit a private sample question.
- AI moderation dry-run flags allowed Torah question as reviewable.
- AI moderation dry-run flags bullying, contact-sharing, adult content,
  threats, spam, and private support/payment/access issues.
- Severe sample creates only internal urgent alert and temporary hold
  recommendation.
- Reviewer can approve an anonymized digest preview without publishing.
- Reviewer can mark an excellent question and award private points/badge.
- Approved-only rewards scoreboard appears only from reviewed classroom events.
- No raw/private/unreviewed leaderboard appears.
- No public/member feed appears until explicit approval.
- No email/WhatsApp/SMS/Telegram/portal send runs during dry-run.
- Audit log shows every state transition.

## Current Recommendation

Keep the current private moderation queue as the launch foundation. The next
safe build step is an AI moderation dry-run and reviewer scoring panel inside
Operations, still private and no-send. The approved-only classroom rewards
scoreboard may display reviewed classroom participation, but any broader
member-visible forum, digest, reward ledger, prize, coupon, credit, access
grant, or external notification still requires a separate approved policy and
smoke path.
