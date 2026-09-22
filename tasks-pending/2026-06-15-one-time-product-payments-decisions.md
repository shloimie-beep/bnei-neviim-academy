# WS10 One Time Product Payments Decisions

Cycle ID: `2026-06-15-cycle-ops-queue-helper-integrations`
Workstream ID: `WS10`
Updated: 2026-06-15 17:45 Asia/Jerusalem

## Status

Decision architecture reconciled locally. This pass did not create live
Operations task rows because the queue already has One Time Pending/access
cards and WS03 is the active duplicate/dedupe workstream for repeated website
asset blockers. Use this file as the canonical WS10 handoff until those cards
can be updated without creating duplicate task spam.

No legal, accounting, tax, revenue-share, bank, payment processor, refund,
checkout activation, access-grant, public launch, email send, or website asset
decision was made by code.

## Current Repo State

- The One Time project/workspace model exists as `one_time_mishnah_class`.
- Task comments, project filters, Decision Required markers, One Time
  categories, and scoped task access are implemented and have previous live
  verification evidence in `SYSTEM-STATE.md`, `TASKS.md`, and
  `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md`.
- The newer Rabbi checkout/access slice exists and was previously deployed and
  live-smoked. Relevant files:
  - `railway-migration-2026-06-15-rabbi-checkout-access.sql`
  - `src/lib/bna/rabbi-products.js`
  - `src/lib/bna/rabbi-payments.js`
  - `src/lib/bna/rabbi-access.js`
  - `src/lib/bna/rabbi-emails.js`
  - `src/lib/bna/rabbi-site.js`
  - `public/rabbi.html`
  - `public/rabbi-member.html`
  - `public/js/rabbi-launch.js`
  - `public/js/rabbi-member.js`
  - `tests/rabbi-checkout-access.test.js`
- The current checkout/access implementation is preview and guardrail oriented.
  Stripe and GreenInvoice can return blockers such as
  `stripe_not_configured` or `green_invoice_not_configured`; live checkout
  remains blocked without prices, provider-of-record approval, account keys,
  product/price IDs or payment links, webhook secrets, policy approval, and a
  test buyer/smoke path.
- BNA signup pages remain BNA school registration pages. They must not be
  treated as One Time checkout or landing pages.
- Current email runtime is centralized in `server.js` with `EMAIL_PROVIDER`,
  Gmail fallback, optional Resend config, and `bna_email_log`. The old
  `src/lib/email/client.ts` path from earlier audits no longer exists. Rabbi
  templates exist in `src/lib/bna/rabbi-emails.js`, but a Rabbi-owned
  Resend/domain/sender remains externally blocked.

## Architecture Direction

- American payments direction: Stripe.
- Israeli payments direction: GreenInvoice.
- One Time should use exactly one provider of record per live product/plan.
  A second provider may exist only for historical read-only import, manual
  exceptions, or a defined migration window with reconciliation notes.
- Business, bank, Stripe, GreenInvoice, and payment processor accounts should
  be under Rabbi Elie Scheller unless legal/accounting structure changes.
- App/workspace ownership is separate from merchant, bank, legal, tax, IP, and
  revenue ownership. Do not infer one from the other.
- Rabbi email/Resend setup is separate from Shloimie personal/family/BNA
  sender/domain setup.

## Classification

| Subject | Status | Current classification |
| --- | --- | --- |
| One Time project/task/comment/decision support | Implemented with prior live evidence | `done_verified` for repo/live evidence already recorded; not re-deployed in WS10 |
| Pricing | No approved final price/currency | `decision_ready`, `externally_blocked` |
| Software ownership / revenue | No approved legal/IP/revenue split | `decision_ready`, `do_not_decide_in_code` |
| Business/bank/payment processor ownership | Direction captured, legal/accounting not decided | `decision_ready`, `do_not_decide_in_code` |
| Stripe for US payments | Direction and optional code path exist; not configured live | `task_ready`, `externally_blocked` |
| GreenInvoice for Israeli payments | Direction and webhook/payment-link fields exist; not configured live for One Time | `task_ready`, `externally_blocked` |
| Parent/student/member login model | Member magic-link/access model exists; final parent/student household model not approved | `decision_ready` |
| Access/materials | Member-library/access tables exist; final materials inventory and access rules blocked | `task_ready`, `externally_blocked` |
| Rabbi Resend/email | Templates and generic provider runtime exist; Rabbi sender/domain not configured | `decision_ready`, `externally_blocked` |
| Website/landing-page assets | Preview route exists; real copy/assets/testimonials/source URLs missing | `externally_blocked`, `stale_duplicate` for repeated asset blockers |
| Stale docs/tasks | June 5 stale repo-reality section marked historical; current WS10 file is canonical | `task_ready` / local doc cleanup |

## Decision Records

### 1. One Time Pricing

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `accounting`
- Owner: `Both`
- Status: `decision_ready`, `externally_blocked`
- Current repo state: product tiers exist for `library_only` and
  `live_library`, but seeded prices are null/TBD and checkout is blocked.
- Options:
  - A: One USD price with ILS equivalent.
  - B: Separate USD and ILS prices by market/provider.
  - C: Manual launch price first, then standardize after test families.
- Pros:
  - A is simplest to explain.
  - B fits different provider/accounting realities.
  - C can launch cautiously while policy is still forming.
- Cons:
  - A may be awkward for Israeli invoices/currency.
  - B needs clear market routing and support copy.
  - C needs strong manual tracking so exceptions do not become hidden policy.
- Blockers: approved amount, currencies, billing interval, first-cycle rule,
  tax/VAT/receipt wording, refund policy, and support owner.
- Recommended next action: Shloimie and Rabbi Elie Scheller approve price,
  currency, interval, and first-cycle rule before any live checkout.
- Related files/tasks:
  `tasks-pending/2026-06-15-rabbi-checkout-access.md`,
  `ops/rabbi-scheller/green-invoice-billing-options.md`,
  `railway-migration-2026-06-15-rabbi-checkout-access.sql`.

### 2. Software Ownership And Revenue

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `accounting`
- Owner: `Both`
- Status: `decision_ready`, `do_not_decide_in_code`
- Current repo state: app/workspace functionality exists, but no durable legal
  or revenue record decides software/IP ownership, admin fees, expenses,
  revenue share, customer list ownership, or exit rights.
- Options:
  - A: BNA owns the software, Rabbi owns his Torah/content relationship.
  - B: Joint partnership/revenue-share for the One Time product.
  - C: Rabbi-owned product with BNA as paid operator/software provider.
- Pros:
  - A keeps platform ownership simple.
  - B may match a true partnership.
  - C clarifies merchant/customer ownership under Rabbi.
- Cons:
  - A still needs fair revenue and content-use terms.
  - B needs legal/accounting clarity.
  - C needs service fees, support boundaries, and data portability.
- Blockers: legal/accounting advice, signed terms, software/IP scope, content
  rights, customer list policy, expense reimbursement, and reporting cadence.
- Recommended next action: create a decision meeting packet before any
  revenue automation, partner distribution report, or public promise.
- Related files/tasks:
  `ops/one-time-mishnah/partnership-drafting-pack.md`,
  `tasks-pending/2026-06-09-one-time-partnership-drive-map.md`.

### 3. Business, Bank, And Payment Processor Account Ownership

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `accounting`
- Owner: `Rabbi Elie Scheller`
- Status: `decision_ready`, `do_not_decide_in_code`
- Current repo state: BNA can model provider settings and checkout records, but
  merchant account ownership is not settled by the app. The current direction
  is that business/bank/payment processor setup should be under Rabbi Elie
  Scheller unless legal/accounting structure changes.
- Options:
  - A: Rabbi-owned Stripe and GreenInvoice accounts.
  - B: BNA-owned processor with Rabbi product sub-ledger.
  - C: Manual bridge while the legal/accounting structure is decided.
- Pros:
  - A keeps product revenue and invoices aligned with Rabbi's business.
  - B may be simpler technically if BNA already has integrations.
  - C avoids premature merchant setup.
- Cons:
  - A needs account setup and credentials.
  - B risks confusing BNA school accounting with One Time membership revenue.
  - C adds manual operational risk.
- Blockers: legal entity, bank account, Stripe account, GreenInvoice account,
  tax/invoice requirements, who is merchant of record, and who handles support.
- Recommended next action: confirm merchant-of-record and processor account
  owner before entering live keys or payment links.
- Related files/tasks:
  `.env.example`,
  `src/lib/bna/rabbi-payments.js`,
  `ops/rabbi-scheller/green-invoice-billing-options.md`.

### 4. Stripe Direction For US Payments

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `accounting`
- Owner: `Rabbi Elie Scheller`
- Status: `task_ready`, `externally_blocked`
- Current repo state: `stripe` is a dependency, `/api/rabbi/checkout` can
  create a Stripe Checkout Session only when a tier has `stripe_price_id` and
  `RABBI_STRIPE_SECRET_KEY`; `/api/webhooks/stripe/rabbi` is mounted before
  JSON middleware and requires `RABBI_STRIPE_WEBHOOK_SECRET`.
- Options:
  - A: Stripe is provider of record for US/credit-card payments.
  - B: Stripe is only a US fallback while GreenInvoice handles Israel.
  - C: Stripe stays disabled until GreenInvoice limitations are known.
- Pros:
  - Stripe has strong checkout/webhook tooling.
  - Existing code can support Stripe sessions after configuration.
  - US families may expect card checkout.
- Cons:
  - Accounting/invoice fit for Israeli product needs confirmation.
  - Requires Rabbi-owned account, prices, keys, and webhook secret.
  - Must not split provider-of-record state for the same plan.
- Blockers: account owner, secret key, webhook secret, price IDs, success/cancel
  URLs, test buyer, refund/cancellation policy, and approval phrase.
- Recommended next action: if approved for US, configure only test-mode
  Rabbi-owned Stripe first and run a no-real-customer smoke.
- Related files/tasks:
  `src/lib/bna/rabbi-payments.js`,
  `server.js`,
  `tests/rabbi-checkout-access.test.js`,
  `.env.example`.

### 5. GreenInvoice Direction For Israeli Payments

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `accounting`
- Owner: `Rabbi Elie Scheller`
- Status: `task_ready`, `externally_blocked`
- Current repo state: One Time tiers can store `green_invoice_item_id` and
  `green_invoice_payment_link_url`; `/api/webhooks/green-invoice/rabbi` exists
  and reuses normalized GreenInvoice payload handling. BNA also has a separate
  school GreenInvoice webhook route.
- Options:
  - A: GreenInvoice is provider of record for Israeli/ILS payments.
  - B: GreenInvoice is invoice/accounting layer while Stripe owns checkout.
  - C: Manual GreenInvoice first-cycle links until automated status readback is
  confirmed.
- Pros:
  - GreenInvoice may fit Israeli invoicing better.
  - Existing BNA code already knows GreenInvoice payload shapes.
  - Manual links can keep launch conservative.
- Cons:
  - Sender-side webhook/signing and subscription behavior need account access.
  - Manual links need careful audit notes.
  - Mixing providers without a provider-of-record rule creates confusion.
- Blockers: Rabbi GreenInvoice account/API access, product/item IDs, payment
  links, webhook/signing details, subscription anchor behavior, and test event.
- Recommended next action: verify GreenInvoice can support the approved
  first-cycle plus recurring policy before making it provider of record.
- Related files/tasks:
  `src/lib/bna/green-invoice.js`,
  `src/lib/bna/rabbi-payments.js`,
  `ops/rabbi-scheller/green-invoice-billing-options.md`,
  `TASKS.md` GreenInvoice sender-side verification blocker.

### 6. Parent, Student, And Member Login Model

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `technology`
- Owner: `Both`
- Status: `decision_ready`
- Current repo state: BNA school student access-code policy is decided for the
  current school portal. One Time has a separate member model with
  `bna_members`, `bna_member_login_tokens`, scoped library/live grants, and
  `/rabbi-member` routes. The final parent/student household model for One
  Time is still not approved.
- Options:
  - A: Parent/member account owns access and students only view through parent.
  - B: Student/member login with parent oversight.
  - C: Separate parent, student, and member roles inside One Time.
- Pros:
  - A is simplest and parent-safe.
  - B supports direct learners.
  - C is flexible for families and live classes.
- Cons:
  - A may not fit teen/self-directed use.
  - B needs consent, recovery, and safety policies.
  - C needs more support and role-boundary testing.
- Blockers: household model, parent consent, student identity display,
  recovery, support owner, access duration, data retention, test family, and
  rollback plan.
- Recommended next action: approve a launch model before exposing One Time
  parent/student management beyond the existing member preview.
- Related files/tasks:
  `src/lib/bna/rabbi-access.js`,
  `public/rabbi-member.html`,
  `ops/access/student-portal-auth-policy.md`,
  `tasks-pending/2026-06-15-rabbi-checkout-access.md`.

### 7. Access And Materials

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `technology`
- Owner: `Rabbi Elie Scheller`
- Status: `task_ready`, `externally_blocked`
- Current repo state: member-library and live-session access structures exist,
  and publish-package/readiness previews exist. Real library/live access and
  material publishing remain approval gated.
- Options:
  - A: Video library only at launch.
  - B: Live plus library at launch.
  - C: Manual materials/access list first, then automated member library.
- Pros:
  - A is easier to protect and support.
  - B matches a richer membership offer.
  - C avoids publishing automation before materials are clean.
- Cons:
  - A may understate the offer.
  - B needs Zoom/live policy and recordings.
  - C is manual and can drift.
- Blockers: material inventory, hosted media URLs, source sheets, worksheets,
  Zoom/live-session policy, tier visibility, publish approval, revoke/rollback,
  and smoke item.
- Recommended next action: Rabbi supplies a materials inventory and launch
  access rules; Shloimie approves publish/revoke smoke before any live grants.
- Related files/tasks:
  `tasks-pending/2026-06-14-one-time-content-library-build.md`,
  `tasks-pending/2026-06-15-rabbi-checkout-access.md`,
  `ops/one-time-mishnah/content-media-intake-workflow.md`.

### 8. Rabbi Resend And Email Setup

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `technology`
- Owner: `Rabbi Elie Scheller`
- Status: `decision_ready`, `externally_blocked`
- Current repo state: generic email runtime supports Gmail and optional
  Resend; Rabbi email templates exist; `bna_email_log` has Rabbi metadata
  columns. No Rabbi-owned Resend account/domain/sender is confirmed.
- Options:
  - A: Rabbi-owned Resend sender/domain for One Time product email.
  - B: Gmail fallback for early manual/dry-run email only.
  - C: BNA office sender for admin-only support notices, not product email.
- Pros:
  - A is cleanest for branding and deliverability.
  - B is fastest for manual tests.
  - C may be acceptable for internal operations.
- Cons:
  - A needs DNS/domain/account setup.
  - B may not scale and may confuse product identity.
  - C risks mixing BNA school email with Rabbi product email.
- Blockers: Rabbi domain/sender, Resend API key, DNS verification, reply-to,
  webhook secret, approved test recipient, and exact sender identity.
- Recommended next action: configure Rabbi-owned sender only after account and
  DNS are confirmed. Do not reuse Shloimie's personal/family sender.
- Related files/tasks:
  `.env.example`,
  `src/lib/bna/rabbi-emails.js`,
  `server.js`,
  `tasks-pending/2026-06-14-assistant-portal-communications.md`.

### 9. Website And Landing-Page Assets

- Project: `one_time_mishnah_class`
- Decision required: `true`
- Stage: `needs_decision`
- Category: `marketing`
- Owner: `Rabbi Elie Scheller`
- Status: `externally_blocked`, `stale_duplicate`
- Current repo state: preview pages exist and are intentionally marked preview.
  Public BNA pages remain BNA. Existing task/dialogue work already represents
  website/content assets as Pending/access; WS03 owns dedupe for repeated
  `Get website and landing-page assets` variants.
- Options:
  - A: Keep `/rabbi` preview until real assets arrive.
  - B: Use a private/internal preview for review only.
  - C: Replace public homepage only after explicit approval phrase and env flag.
- Pros:
  - A is safe and already implemented.
  - B avoids accidental public claims.
  - C can launch once assets and approvals are real.
- Cons:
  - A/B are not a finished marketing launch.
  - C needs real copy, assets, testimonials, pricing, and rollback.
- Blockers: final offer copy, Rabbi bio, images/headshots, brand assets,
  testimonials, source URLs, product/materials list, payment copy, refund and
  support terms.
- Recommended next action: keep one canonical asset blocker; do not add
  duplicate cards. Feed dedupe through WS03 when task actions are ready.
- Related files/tasks:
  `public/rabbi.html`,
  `public/js/rabbi-launch.js`,
  `tasks-pending/2026-06-15-pending-access-dedupe-done-links.md`,
  `ops/agent-task-ledger.jsonl` Rabbi dialogue board record.

### 10. Stale Repo Docs And Tasks

- Project: `one_time_mishnah_class`
- Decision required: `false`
- Stage: `assigned`
- Category: `general`
- Owner: `Developer/agent`
- Status: `task_ready`
- Current repo state: `SYSTEM-STATE.md` and `TASKS.md` now contain many newer
  June 15 entries. The older June 5 handoff already labels the missing
  project/comment/decision schema as historical and superseded; this WS10 file
  is the current product/payment decision handoff.
- Options:
  - A: Leave old sections as historical with a clear supersession note.
  - B: Rewrite old files completely.
- Pros:
  - A preserves provenance and avoids churn.
  - B reduces old wording but risks losing audit history.
- Cons:
  - A requires readers to notice the supersession note.
  - B is noisy in a dirty worktree.
- Blockers: none for local doc cleanup; live task reconciliation should wait
  for queue dedupe where duplicates are suspected.
- Recommended next action: keep this WS10 file as canonical and only update
  old handoffs with short supersession notes.
- Related files/tasks:
  `SYSTEM-STATE.md`,
  `TASKS.md`,
  `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md`.

## Tasks

- [ ] Approve One Time product prices and currencies
  - Owner: Both
  - Category: Accounting
  - Priority: High
  - Depends on: final offer, tiers, billing interval, tax/invoice guidance
  - Related file: `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`
  - Notes: Decide library-only and live-library price/currency before any live
    checkout, payment link, or public pricing copy.

- [ ] Decide One Time provider of record and billing policy
  - Owner: Both
  - Category: Accounting
  - Priority: High
  - Depends on: GreenInvoice capability proof, Stripe account readiness,
    refund/cancellation decision
  - Related file: `ops/rabbi-scheller/green-invoice-billing-options.md`
  - Notes: Choose GreenInvoice, Stripe, or a short manual bridge for each live
    product/plan. Do not split checkout and access truth for the same plan.

- [ ] Confirm Rabbi-owned business, bank, and processor setup
  - Owner: Rabbi Elie Scheller
  - Category: Accounting
  - Priority: High
  - Depends on: legal/accounting structure
  - Related file: `.env.example`
  - Notes: Current direction is Rabbi-owned accounts unless legal/accounting
    structure changes. This is not a code decision.

- [ ] Decide software ownership, content rights, and revenue terms
  - Owner: Both
  - Category: Accounting
  - Priority: High
  - Depends on: partnership/legal agreement
  - Related file: `ops/one-time-mishnah/partnership-drafting-pack.md`
  - Notes: Do not automate revenue distribution, admin fees, or partner
    reporting until terms are approved.

- [ ] Configure Stripe only after owner approval
  - Owner: Developer/agent
  - Category: Technology
  - Priority: Medium
  - Depends on: Stripe approval phrase, Rabbi account, price IDs, webhook
    secret, test buyer, rollback plan
  - Related file: `src/lib/bna/rabbi-payments.js`
  - Notes: Start in test mode. Live mode requires a separate approval and
    payment smoke.

- [ ] Configure GreenInvoice only after owner approval
  - Owner: Developer/agent
  - Category: Technology
  - Priority: Medium
  - Depends on: Rabbi GreenInvoice account/API access, product IDs/payment
    links, webhook/signing details, test event
  - Related file: `src/lib/bna/green-invoice.js`
  - Notes: Preserve the existing BNA school webhook route and One Time scoped
    Rabbi webhook separately. Do not add duplicate live handlers.

- [ ] Approve One Time parent/student/member login model
  - Owner: Both
  - Category: Technology
  - Priority: High
  - Depends on: household model, consent, recovery, support owner, test family
  - Related file: `src/lib/bna/rabbi-access.js`
  - Notes: Existing member login preview is not a final parent/student product
    decision.

- [ ] Provide One Time materials inventory and access rules
  - Owner: Rabbi Elie Scheller
  - Category: Content
  - Priority: High
  - Depends on: class recordings, source sheets, worksheets, live-session plan,
    tier visibility
  - Related file: `tasks-pending/2026-06-14-one-time-content-library-build.md`
  - Notes: Member-library publishing and grants remain blocked until material,
    access, and rollback rules are approved.

- [ ] Configure Rabbi-owned email sender or Resend setup
  - Owner: Rabbi Elie Scheller
  - Category: Technology
  - Priority: Medium
  - Depends on: domain/sender, Resend or Gmail choice, DNS, reply-to, approved
    test recipient
  - Related file: `src/lib/bna/rabbi-emails.js`
  - Notes: Keep Rabbi product email separate from Shloimie personal/family/BNA
    sender setup.

- [ ] Provide final One Time website and landing-page assets
  - Owner: Rabbi Elie Scheller
  - Category: Marketing
  - Priority: High
  - Depends on: offer copy, Rabbi bio, images, brand assets, testimonials,
    source URLs, pricing/payment copy, legal/support terms
  - Related file: `public/rabbi.html`
  - Notes: Keep one canonical blocker. WS03 owns dedupe for repeated website
    asset pending-access cards.

- [ ] Keep stale One Time docs reconciled with current implementation
  - Owner: Developer/agent
  - Category: General
  - Priority: Medium
  - Depends on: future code/payment changes
  - Related file: `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`
  - Notes: Update this file, `SYSTEM-STATE.md`, and `TASKS.md` when provider,
    pricing, access, or email decisions move from blocked to approved.

## External Blockers

- Final One Time price and currency policy.
- Provider of record: Stripe, GreenInvoice, or manual bridge.
- Revenue split, software/IP ownership, and content/customer-list rights.
- Legal entity, partnership, tax structure, and merchant of record.
- Rabbi bank account and processor accounts.
- Rabbi Stripe keys, price IDs, payment links, and webhook secret.
- Rabbi GreenInvoice account/API access, item IDs/payment links, and webhook
  signing/readback details.
- Rabbi Resend/domain/sender or approved Gmail sender.
- Final parent/student/member login model and recovery policy.
- Materials inventory, hosted media URLs, source sheets, worksheets, access
  duration, live-session policy, and revoke/rollback path.
- Website copy, images, brand assets, Rabbi bio, testimonials, source URLs,
  refund/support/legal terms.

## Verification Notes For WS10

- Freshness checked the current checkout/access handoff, Rabbi payment/product
  helpers, access helpers, site/email helpers, GreenInvoice normalizer,
  `.env.example`, `SYSTEM-STATE.md`, `TASKS.md`, and the old June 5 handoff.
- No runtime code was changed in WS10.
- No live DB/API task creation was performed to avoid duplicate decision and
  website-asset blocker spam while queue dedupe work is active.
