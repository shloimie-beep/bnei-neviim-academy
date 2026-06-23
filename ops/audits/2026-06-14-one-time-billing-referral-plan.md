# One Time Billing, Referral, Library, and Forum Plan - 2026-06-14

## Billing Decision

Current uncertainty:

- The old One Time web/backend repo uses Stripe.
- The operator asked about Green Invoice possibly supporting pay-now plus recurring on the first of the month, but not pay-now plus repeat every 30 days.
- No live payment link should be connected until the provider and policy are confirmed.

## Billing Options

### Option A - One standard monthly billing date

User joins now. The formal recurring charge happens on the first of the month. If needed, today's amount is handled as a one-time charge or manual/pro-rated first payment.

Pros:

- Clean membership expectation.
- One recurring subscription structure.
- Easier support and reconciliation.
- Works well with first-of-month billing if Green Invoice supports that model.

Cons:

- Needs clear copy for the first period.
- May require a manual or one-time first payment.
- Needs policy for people who join close to the first.

### Option B - Daily link table

Create different payment links depending on the day joined.

Pros:

- Can approximate "bill every 30 days from signup" if provider limitations force it.

Cons:

- Messy, error-prone, hard to audit.
- Difficult to support across ILS and USD.
- High risk of wrong link selection.
- Not recommended unless there is no better provider path.

### Option C - Custom first payment plus recurring subscription

Use a first payment or pro-rated payment today, then attach the customer to the standard first-of-month recurring subscription.

Pros:

- Professional and transparent.
- Keeps one recurring billing calendar.
- Handles mid-month joins cleanly.

Cons:

- Requires provider support or extra implementation.
- Needs explicit receipt/copy/reconciliation logic.

### Option D - Use another billing/subscription provider

Use Stripe or another provider if Green Invoice cannot support the approved billing model.

Pros:

- May support flexible subscription anchors, trials, coupons, and referral credits more naturally.

Cons:

- Adds another provider and operational surface.
- May not fit Israeli invoicing/accounting needs.
- Requires policy approval.

## Recommendation

Recommend Option C if Green Invoice can support it cleanly:

1. One first payment or pro-rated first period.
2. Standard recurring subscription on the first of the month.
3. Clear copy on the preview page and checkout.
4. No automatic credit/refund behavior until policy is approved.

Fallback:

- Option A if the team wants simplest operations.
- Option D only if the provider cannot support the approved model.
- Avoid Option B unless forced.

## Refund / Cancellation Decision Card

Create a Shloimie decision, not an automatic policy:

Question:

Which refund and cancellation policy should One Time Mishnah use for monthly membership?

Options:

- Option A: No refunds after payment, cancel before next billing date.
- Option B: Partial refund during first 7 days only.
- Option C: Trial/preview period before billing, then no refunds.

Current recommendation:

- Option C if the funnel can support a true preview/trial without access abuse.
- Option B if a trial is not practical.
- Do not finalize without owner approval.

## Bring-A-Friend Referral

Design:

- Each member receives a referral code/link.
- New signup stores `referral_code` and `referred_by_member_id` where known.
- Referral record is created at signup, but reward is pending.
- Credit is awarded only after the referred friend pays and the payment is verified.
- Reward proposal: one month credit or equivalent manual credit.

Anti-abuse:

- No self-referrals.
- One reward per paying referred member.
- Require admin review before credit is applied.
- Log every referral, payment match, reward approval, and reward application.
- Do not expose other member private data.

Suggested tables or BNA records:

- `one_time_referrals`
  - `id`
  - `workspace_id`
  - `referrer_member_id`
  - `referral_code`
  - `referred_contact_id`
  - `signup_id`
  - `payment_id`
  - `status`
  - `admin_review_status`
  - `reward_type`
  - `reward_value`
  - `created_at`
  - `approved_at`
  - `applied_at`
- `one_time_referral_credits`
  - one row per approved/applied credit.

Do not apply billing credit automatically until billing provider behavior is confirmed.

## Video Library Fallback / Downsell

Main CTA:

- `Join the Mishnah Shiur`

Secondary fallback:

- `Preview the Video Library`

When to show:

- User backs out of join path.
- User clicks "not ready".
- User asks for sample videos/library.

Capture:

- Email or phone only with approved consent copy.
- Store source as `video_library_fallback`.
- Do not create paid access until checkout/payment succeeds.

Copy:

- "Not ready for the live class yet? Preview the video library and see if this learning style is right for your son."

## Forum / Questions / Gamification MVP

Goal:

- Boys can ask Mishnah questions and submit comments.
- Rabbi/admin can review, approve, answer, and highlight good questions.
- Safety comes before public visibility.

Moderation states:

- `submitted`
- `ai_approved`
- `needs_human_review`
- `hidden`
- `rejected`
- `escalated`
- `user_locked_pending_review`
- `user_suspended_by_admin`

AI filter categories:

- Mishnah relevance.
- Torah learning relevance.
- Critical thinking.
- Off-topic chatter.
- Bullying/harassment.
- Sexual content.
- Violent threats.
- Self-harm concern.
- Personal information.
- Meetup coordination.
- Links/files.
- Spam.
- Disrespectful language.
- Prompt injection/manipulation.

Student safety rule:

- Do not auto-permanently ban a child.
- Severe content is hidden, posting is temporarily locked, admin is notified, and a human decides final status.

Gamification:

- Approved question: small points.
- Rabbi marks "good question": larger points.
- Source-based answer: points.
- Thoughtful comment: points.
- Spam/off-topic: no points.
- Prefer personal progress and Rabbi highlights over public leaderboards.

## Implementation Order

1. Confirm billing provider and policy.
2. Keep `/preview/one-time-mishnah` inactive for checkout.
3. Add referral ledger only, with no auto-credit.
4. Add video-library fallback capture.
5. Build forum/question schema with moderation states.
6. Add admin/Rabbi review queue.
7. Add student/member submission UI only after moderation and role gates are tested.
8. Add points after question flow is safe.

## Blockers

- Billing provider and subscription anchor behavior.
- ILS/USD prices.
- Refund/cancellation policy.
- Live domain and checkout approval.
- Admin/Rabbi credentials for current One Time app.
- Moderation provider/model decision.
