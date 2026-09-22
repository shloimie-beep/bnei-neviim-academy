# One Time Partnership Drafting Pack

Date: 2026-06-15

Status: local drafting handoff for Claude or another writing assistant. This
pack does not create or edit Google Docs, upload to Drive, send emails,
publish pages, create payment links, grant access, modify Rabbi-owned systems,
or provide final legal advice.

## Purpose

Turn the current Rabbi Scheller / One Time partnership proposal into a set of
reviewable writing tasks that a drafting assistant can complete without
touching production systems. The output should help Shloimie and Rabbi Elie
review:

- a cleaner agreement draft
- a values checklist
- refund and cancellation policy options
- family, device, Zoom, and access rules
- landing-page copy
- launch emails
- past-customer and interested-list reactivation copy

Everything produced from this pack is draft-only until Shloimie/Rabbi review,
legal/accounting review where needed, and explicit approval.

## Source Boundaries

Use these local BNA artifacts as source context:

- `ops/one-time-mishnah-class/partnership-drive-map.md`
- `ops/one-time-mishnah-class/partnership-drive-map.json`
- `ops/audits/2026-06-14-one-time-billing-referral-plan.md`
- `ops/one-time-mishnah/first-party-capability-map.md`
- `ops/one-time-mishnah/content-media-intake-workflow.md`
- `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md`

Known Drive destinations from the map:

- `01 Agreement and Values`
- `02 Offer, Pricing, and Policies`
- `05 Marketing and Launch`
- `09 Claude Drafting Tasks`
- `90 Completed and Approved`
- `99 Needs Shloimie Decision`

Do not treat old GHL/legacy CRM language as active runtime direction. Translate
new operating instructions to first-party BNA Operations and approved
connectors only. Historical CRM wording may be summarized as "legacy external
CRM idea" and moved into a decision section when it affects a real policy.

## Global Drafting Rules

- Mark every uncertain fact as `DECISION NEEDED`.
- Do not invent prices, payment provider behavior, refunds, legal terms,
  revenue terms, access credentials, domains, or sender identities.
- Do not write final legal language; produce plain-language drafts for review.
- Keep BNA school students, parents, accounting, and accountability recordings
  separate from One Time member/customer material.
- Do not include secrets, passwords, tokens, reset links, private emails,
  private phone numbers, or live payment links.
- Do not approve or send email, WhatsApp, Buffer, Google, Drive, Zoom, billing,
  access, or member-library actions.
- Use "draft", "proposed", "for review", and "needs approval" language where
  policy is not final.

## Drafting Task 1: Cleaner Agreement Draft

Goal: rewrite the current proposal into a short, readable partnership memo
that a human can review before any formal agreement is prepared.

Output format:

1. Title and date.
2. Parties and purpose.
3. Product scope: One Time Mishnah class, video library, live membership,
   worksheets/source sheets, questions, clips, and future premium cohort.
4. Shloimie responsibilities.
5. Rabbi Elie responsibilities.
6. Shared responsibilities.
7. Revenue-share concept, with exact percentages and exceptions marked
   `DECISION NEEDED` unless already confirmed.
8. Expense handling and approval threshold.
9. Ownership and use of content, customer lists, brand assets, recordings,
   source materials, and derived clips.
10. Customer/member support ownership.
11. Reporting cadence and what monthly reports should include.
12. Refund, cancellation, access, and failed-payment policy references.
13. Decision process for launches, copy, pricing, ads, and platform changes.
14. Buyout, pause, termination, dispute, and wind-down placeholders.
15. Legal/accounting review checklist.

Drafting prompt:

```text
Rewrite the One Time partnership proposal as a plain-language partnership memo.
Use the source boundaries and global drafting rules from the BNA drafting pack.
Preserve the intent of a collaborative Shloimie/Rabbi Elie partnership, but do
not make final legal claims. Put uncertain business, legal, billing, ownership,
expense, buyout, and dispute details under DECISION NEEDED. End with a concise
review checklist for Shloimie, Rabbi Elie, legal/accounting, and implementation.
```

## Drafting Task 2: Values Checklist

Goal: produce a one-page checklist that anchors the partnership before policy
or copy gets polished.

Required checklist areas:

- Torah learning quality and Rabbi review.
- Child/student safety and dignity.
- No shame, leaderboard pressure, or public comparison without explicit
  approval.
- Parent trust, clear expectations, and calm support.
- Privacy between BNA school records and One Time member records.
- Honest marketing: no inflated promises, fake urgency, fake scarcity, or
  hidden billing behavior.
- Accessibility for families with different devices/time zones.
- Respect for Rabbi content ownership and Shloimie's operating ownership.
- Transparent reporting, expense approval, and revenue-share reconciliation.
- Human review before public answers, ads, emails, or member-visible content.

Drafting prompt:

```text
Create a one-page values checklist for the One Time Mishnah partnership. Make it
practical rather than inspirational. Each value should include a short "what it
means in operations" line and a "watch out for" line. Include privacy, child
safety, Rabbi review, honest marketing, support ownership, and revenue
transparency. Mark any item that needs Shloimie/Rabbi confirmation.
```

## Drafting Task 3: Refund And Cancellation Policy Options

Goal: draft clear policy options without selecting a final policy.

Source recommendation from the billing/referral plan:

- Prefer a preview/trial period before billing if the funnel can support it.
- If a true trial is not practical, consider a first 7-day partial refund
  option.
- Avoid daily payment-link sprawl.
- Do not finalize until billing provider, subscription anchor, ILS/USD prices,
  access revoke path, and accounting requirements are confirmed.

Policy draft must cover:

- trial or preview period
- first payment timing
- recurring monthly billing date
- cancellation timing and effective date
- refund window
- failed-payment grace period
- access pause/revoke behavior
- family/device exceptions
- support contact and response expectation
- chargeback/dispute escalation
- manual credit/referral handling

Drafting prompt:

```text
Draft three refund and cancellation policy options for One Time Mishnah:
Option A: trial/preview before billing, then no refunds after payment.
Option B: first 7-day partial refund, then cancel before next billing date.
Option C: simple monthly cancellation with no refunds after payment.
For each option, include parent-facing copy, admin notes, operational risks,
and exact decisions needed before launch. Do not choose a final policy or
create payment links.
```

## Drafting Task 4: Family, Device, Zoom, And Access Rules

Goal: draft practical rules families can understand before joining.

Required rules:

- Account is for one household unless approved otherwise.
- Parent/admin contact owns billing and support.
- Student/member access should not expose admin tools, private notes, or other
  families' data.
- Device limits need a decision before enforcement.
- No sharing login credentials outside the household.
- Live Zoom/class link is for registered members only.
- Recording access, replay window, and downloadable materials need approval.
- Source sheets and worksheets are reviewed learning materials, not final
  personal psak.
- Questions are private by default until Rabbi/Shloimie review.
- Misuse, harassment, unsafe messages, or unauthorized sharing may pause access
  pending human review.
- Refund/cancellation and access revoke must match the approved billing policy.

Drafting prompt:

```text
Draft family, device, Zoom, and access rules for One Time Mishnah. Make the
language parent-friendly and calm. Separate "confirmed rules" from "decisions
needed before launch." Include household/device/login sharing, live class
attendance, recordings, source sheets, worksheets, questions, support, misuse,
and access pause/revoke behavior. Do not imply automatic enforcement exists.
```

## Drafting Task 5: Landing-Page Copy

Goal: draft a launch page that can later be reviewed and implemented.

Required sections:

- headline and subheadline
- who this is for
- what the child/member gets
- how the live class works
- video library / replay value
- worksheets, source sheets, and question support
- Rabbi trust section
- pricing/offer placeholder with `DECISION NEEDED`
- refund/cancellation placeholder
- FAQ
- CTA variants:
  - `Join the Mishnah Shiur`
  - `Preview the Video Library`
  - `Ask a Question First`

Copy constraints:

- No live checkout link.
- No fake deadline, fake scarcity, or unsupported guarantee.
- No claim that every child will love learning.
- No public BNA school private data.
- No GHL, external CRM, or platform-specific backend promise.

Drafting prompt:

```text
Draft a parent-facing landing page for One Time Mishnah. Write in a warm,
specific, trustworthy voice. Include the required sections and CTA variants.
Keep pricing, refund/cancellation, schedule, platform, and access details as
DECISION NEEDED placeholders unless already confirmed in the source material.
Do not include live payment links, fake urgency, or claims that require proof.
```

## Drafting Task 6: Launch Email Pack

Goal: create send-ready draft copy that still requires human approval before
any send.

Draft these emails:

- warm announcement to interested families
- Rabbi introduction / why this class exists
- live class invitation
- video library preview invitation
- launch reminder
- last-call reminder, without fake scarcity
- welcome after approved payment/access
- weekly class reminder
- recording/source-sheet posted notice
- failed-payment support note
- cancellation confirmation

Each email must include:

- audience/segment
- subject line options
- preview text
- body draft
- CTA
- suppression notes
- approval checklist

Drafting prompt:

```text
Create a One Time Mishnah launch email pack. For each email, include audience,
subject options, preview text, body, CTA, suppression notes, and approval
checklist. Keep every message as draft-only. Do not send, schedule, upload, or
create a campaign. Avoid fake urgency and do not include payment links unless
the source explicitly marks them approved.
```

## Drafting Task 7: Reactivation Copy

Goal: prepare careful copy for prior customers or old interested-list contacts
without assuming they can all be emailed.

Segments:

- warm interested list
- prior small purchase, such as old $9 library/customer records
- prior higher purchase, such as old $30 records
- lapsed member
- not-ready / video-library preview lead
- do-not-contact, unsubscribed, bounced, or unknown consent: suppress by
  default

Required copy:

- short reactivation email
- Rabbi-update email
- "what changed" email
- soft ask for questions
- video-library preview invite
- support/reply-to-us note

Drafting prompt:

```text
Draft reactivation copy for One Time Mishnah using the listed segments. Keep
suppressed, unsubscribed, bounced, and unknown-consent contacts out of the send
audience. For each draft, include the segment, why this message is appropriate,
the copy, CTA, and suppression rules. Do not create campaigns, import lists,
write tags, send messages, or assume consent.
```

## Review And Approval Checklist

Before any drafted output moves to Drive, public pages, email, social, billing,
Zoom, member-library, or access tools, confirm:

- Shloimie approved the exact copy or policy.
- Rabbi Elie approved Rabbi-facing claims, Torah/source claims, class
  expectations, and public/member answer behavior.
- Legal/accounting reviewed agreement, refund/cancellation, revenue-share,
  expense, tax, and chargeback wording where appropriate.
- Billing provider, subscription anchor, currency, price, receipt, refund, and
  revoke path are explicit.
- Email sender/domain, recipient segment, suppression list, and test-send plan
  are explicit.
- Zoom/live class destination, recording policy, replay window, and access
  owner are explicit.
- Public landing page destination, CTA behavior, analytics/tracking, and
  rollback are explicit.
- Any Buffer/social draft has source material, channel/account, schedule,
  hosted media URL if needed, and `APPROVE_BUFFER_SOCIAL_DRAFT`.
- Any Google/Drive live write has `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Any member-library publish/access test has
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.

## Current Recommendation

Use this pack to generate local draft text only. Put the generated outputs into
human review before any Drive upload, public page, campaign, billing, access,
Zoom, Buffer/social, Google, WhatsApp/email, or member-library action. The
highest-value first drafts are:

1. cleaner agreement memo
2. values checklist
3. refund/cancellation decision card
4. landing page v1
5. launch email pack
6. reactivation copy with suppression rules
