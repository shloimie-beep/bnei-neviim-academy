# One Time Revenue Launch, Parser V2, CRM, Auth, And Beta QA Decisions

Source: `RAW-20260621-002`

Status: active decision packet for `ops/execution-runs/2026-06-21-one-time-master-completion`.

## Durable Product Scope

- Current operating contexts are BNA and One Time / Rabbi Ellie Scheller.
- This wave is not a standalone SaaS, reseller onboarding, white-label
  self-service, or universal SaaS admin build.
- Multi-workspace authentication and privacy remain mandatory.
- The custom first-party CRM is the active direction.
- GHL, GoHighLevel, LeadConnector, and LeadConnectorHQ are not active runtime
  systems and must not receive new code, routes, env vars, automations, UI, or
  smoke checks.

## Operating Priority

1. Privacy and authentication.
2. Reliable intake/parsing.
3. CRM and lead organization.
4. Email campaigns.
5. Payment/trial/access.
6. Class links and reminders.
7. Community questions.
8. Authenticated support tickets.
9. Realistic beta testing.
10. Vimeo/Zoom automation.
11. Advanced gamification and study bot.

## Admin-First Boundary

Internal administrators may manage complex setup through Operations,
first-party APIs, and natural-language workflows. Customer-facing work in this
wave should stay limited to signup, authentication, payment-method management
where appropriate, future-renewal cancellation, class/library access,
private/community questions, support tickets, and appropriate progress and
communications.

## Privacy And Support Bot

- BNA family/student data must not appear in One Time.
- One Time private data must not appear in BNA.
- No user may access private data only by knowing a database ID or query
  parameter.
- Tickets, questions, recordings, class links, and transcript material must be
  workspace- and relationship-scoped.
- The support bot is authenticated ticket intake, not an unrestricted Mishnah
  study bot. It should identify the user/workspace/page, collect and
  categorize the issue, create a scoped ticket, return a ticket number, and
  allow private staff replies.

## Warm-Lead Launch Promotion

Default test-mode promotion:

- Audience: approved warm One Time leads.
- Offer: 30-day free trial.
- Payment method required at signup.
- Renewal: $67/month after the trial.
- The confirmation must display renewal date and amount.
- Pre-renewal reminder required.
- One introductory trial per eligible person/household/payment identity.
- Store offer version and acceptance timestamp.

The operator can later change trial length, price, eligibility, segment, card
requirement, reminder timing, capacity, and expiration date. Existing paying
subscribers are not automatically moved into this promotion.

## Referral Promotion

Default test-mode referral model:

- A member refers a new family.
- Reward activates only after the referred customer completes the first
  successful paid billing cycle after any trial.
- Reward is one month of base-plan credit.
- Prevent self-referral, duplicate referral credit, multiple credits for one
  referred customer, and activation after failed/refunded payment.
- Preserve audit history and keep reward amount/config adjustable.
- Do not apply real invoice credits in this implementation wave.

## Cancellation And Refund Intent

Current business intent:

- Customers may cancel future renewal.
- Payments already processed are generally not subject to discretionary
  refunds.
- Exceptions remain possible for duplicate charge, incorrect charge,
  provider-cancelled class without appropriate makeup/credit, and
  legally-required circumstances.
- Do not publish blunt or hostile wording.
- Build policy-version storage and acceptance records.

## Operator Decision

Decision ID: `DEC-20260621-901`

Question: What final customer-facing legal wording should One Time use for
trial renewal, cancellation, refund exceptions, and policy acceptance?

Owner: Shloimie / Rabbi Ellie Scheller

Status: needs operator decision

Recommended next action: approve polished customer-facing legal wording after
reviewing the test-mode implementation and any required legal/accounting input.

This Decision blocks only final public/legal copy and live billing launch. It
does not block test-mode implementation of configurable trial/referral/policy
storage.
