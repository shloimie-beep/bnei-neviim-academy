# BNA_GOAL_MODE_EXECUTION_PACKET
# ONE TIME PROVIDER BILLING PLATFORM V2
# ROSH HASHANAH CONVERSION, PRODUCTS, PRICES, SUBSCRIPTIONS,
# INVOICES, PAYMENTS, ENTITLEMENTS, AUTOMATIONS, AND PROVIDER BILLING UI

Repository:
shloimie-beep/bnei-neviim-academy

Primary workspace:
rabbi_sheller_provider

Primary project:
one_time_mishnah_class

Primary provider:
Rabbi Eli Scheller

Recommended branch:
codex/onetime-rosh-hashanah-billing-platform-v2

Recommended lane key:
onetime-rosh-hashanah-billing-platform-v2

Recommended work method:
Dedicated Git worktree and feature branch, followed by a draft PR and a separate
integration/release pass.

## 1. Objective

Build a complete, professional, provider-scoped Billing system using One Time
Mishnayos as the first implementation.

The system must include:

- provider-owned Stripe account binding;
- product and price management;
- Rosh Hashanah promotional-access conversion;
- recurring $67/month subscriptions;
- pre-billing customer notice;
- recurring billing consent and payment-method readiness;
- checkout and customer management;
- subscriptions;
- invoices and payments;
- monthly invoice/receipt emails;
- cancellations;
- failed-payment handling;
- exceptional refund review;
- payment-to-access automation;
- billing activity and audit history;
- responsive provider-facing Billing UI;
- future-provider architecture.

The One Time implementation must be complete and polished, but the underlying
domain must be reusable by future service-provider workspaces without copying
One Time code or creating duplicate billing systems.

Do not stop after writing an audit, ADR, schema proposal, UI mockup, or test
plan. Implement all safe, unblocked work, commit it in bounded batches, push the
branch, and prepare a verified release handoff.

## 2. New operator decisions — these supersede conflicting older policy

Preserve this input as a new RAW record using the next available RAW ID.

Create dated correction Decisions and replacement requirements. Do not erase
historical evidence for the prior 30-day-trial work.

Record these decisions exactly:

### Decision A — No 30-day free trial

One Time no longer offers a 30-day Stripe trial.

Remove the active use of:

- trial_days = 30;
- trial_period_days;
- trial_end as the launch mechanism;
- one_time_warm_lead_intro_trial as the current policy;
- customer.subscription.trial_will_end as a required One Time launch workflow;
- “30-day free trial” from active UI, email, checkout, product, billing, tests,
  configuration, and automation copy.

Historical trial policy records and proof remain as provenance, but they are
superseded and must not drive new checkout or subscription creation.

### Decision B — Free promotional access lasts until the Rosh Hashanah cutoff

The pre-billing period is an application-level promotional-access campaign, not
a Stripe trial.

Use a new policy identity such as:

- policy_key:
  one_time_rosh_hashanah_promotional_access;
- conversion_policy_key:
  one_time_rosh_hashanah_paid_conversion;
- offer_key:
  membership_67_monthly.

Use one canonical campaign record and one canonical billing-start timestamp.

The campaign timezone is:

Asia/Jerusalem

Inspect the current public landing countdown and source-of-truth files.

Do not keep separate hardcoded dates in:

- landing JavaScript;
- email copy;
- Billing UI;
- automation scheduler;
- checkout creation;
- tests.

Create one canonical field such as:

billing_start_at

The exact timestamp must be displayed in Israel time and in each customer’s
local timezone where possible.

If the current landing countdown and current approved business date disagree,
create one Decision for the exact timestamp. This blocks only live conversion,
not the rest of the Billing implementation or sandbox verification.

### Decision C — $67/month recurring membership

The current commercial product is:

- One Time Mishnayos Membership;
- $67 USD per month;
- recurring monthly;
- no free trial;
- full first monthly charge at the approved billing-start time;
- no partial charge before the billing start;
- automatically renews monthly until canceled;
- taxes are not included in the displayed $67 price.

Model the price as tax-exclusive.

Customer-facing copy should say:

$67/month, plus applicable taxes where required.

Do not claim taxes are included.

Do not claim that no tax ever applies.

Automatic tax calculation must run only when the provider account and required
tax configuration support it.

### Decision D — Provider account ownership

The One Time Stripe account owner is:

Rabbi Eli Scheller

Future service providers will use their own Stripe accounts.

Create a provider-scoped Stripe account-binding model.

Do not reuse One Time Stripe credentials for BNA or another provider.

Do not reuse BNA credentials for One Time.

### Decision E — No provider payouts or Stripe Connect

Provider payouts, revenue splitting, commissions, transfers, and Stripe Connect
are out of scope.

Do not:

- create transfer objects;
- create connected accounts;
- calculate Rabbi/BNA revenue shares;
- implement payout reports;
- block One Time Billing on payout decisions.

The payment belongs to the provider’s own Stripe account.

The platform may display that provider’s scoped revenue totals but does not split
or distribute funds.

### Decision F — Refund policy

The default policy is:

- no automatic refunds;
- no prorated refunds;
- payments are non-refundable by default;
- exceptional problems may be submitted to support;
- a refund may be issued only after an authorized workspace admin manually
  reviews and explicitly approves the exception.

Do not build automatic refund rules.

Do not refund based only on:

- cancellation;
- support-ticket creation;
- access failure;
- payment failure;
- customer message;
- CRM status.

Build a manual exceptional-refund workflow with:

- reason;
- linked payment/invoice;
- linked customer;
- requested by;
- reviewed by;
- approval status;
- explicit confirmation;
- Stripe refund ID when executed;
- test/live mode;
- access decision;
- audit history.

No real refund is authorized by this implementation packet.

Sandbox refund testing must use test-mode Stripe objects only.

### Decision G — Cancellation

Customer cancellation should:

- stop future renewals;
- use cancel-at-period-end by default;
- create no automatic refund;
- create no prorated credit;
- keep access active through the already-paid current period;
- revoke access when the current paid period ends;
- email a cancellation confirmation;
- remain reversible until the period ends where Stripe allows it.

Customer-facing copy should state clearly:

- cancellation stops future billing;
- the current paid period is not refunded;
- access remains through the end of the current paid period;
- customers may contact support about an exceptional problem.

Do not immediately delete the subscription, customer, CRM contact, member, or
billing history.

### Decision H — No grace period

There is no access grace period after a failed payment.

Remove active use of:

- seven-day grace;
- grace_until for newly processed One Time policy;
- access_during_grace = true;
- automatic access continuation while a renewal payment remains failed.

When a trusted renewal payment fails:

- set billing state to payment_failed or past_due;
- suspend paid entitlement immediately;
- retain the account and history;
- show an update-payment-method action;
- allow Stripe payment retries if configured;
- restore access only after a verified successful payment;
- create a local billing alert;
- create a customer email draft or approved Stripe failure notification;
- do not create duplicate alerts on webhook replay.

No access grace does not mean deleting the account.

### Decision I — Monthly invoice and receipt email

Interpret “in the mail” as email delivery.

Every monthly subscription billing cycle must produce:

- Stripe invoice;
- invoice number;
- invoice status;
- amount;
- currency;
- billing period;
- hosted invoice link where available;
- invoice PDF where available;
- receipt after successful payment;
- customer email delivery record.

Configure and verify Stripe test-mode email/invoice behavior where supported.

The customer should receive:

- a finalized monthly invoice or paid-invoice email;
- a successful-payment receipt;
- a PDF invoice/receipt where Stripe supplies it;
- a manage-billing or customer-portal link;
- a cancellation link or clear cancellation route.

Do not build physical postal mailing in this packet.

### Decision J — Workspace admins may manage and publish live prices

Within their own provider workspace:

- workspace owner;
- workspace admin

may:

- create product drafts;
- create price drafts;
- edit unpublished product information;
- create new price versions;
- archive prices;
- publish an approved live price;
- pause a live price from future new checkout use;
- configure product access packages;
- configure product automations;
- preview the Rosh Hashanah conversion cohort.

They may not:

- view another provider’s products or Stripe account;
- view raw secrets;
- alter global platform Stripe configuration;
- reuse another workspace’s provider account;
- bypass readiness;
- publish an invalid live price;
- retroactively alter an existing Stripe price amount;
- silently start a billing campaign merely by publishing a price.

Live price publication and customer billing activation are separate actions.

Publishing a price must not itself charge anyone.

## 3. Critical recurring-billing authorization rule

Do not use login status as billing authorization.

A customer is eligible for automatic billing only when all required evidence
exists:

1. correct One Time workspace/project relationship;
2. active promotional-access membership;
3. recurring-billing policy accepted;
4. policy version stored;
5. $67/month recurring price disclosed;
6. billing-start date disclosed;
7. no-trial status disclosed;
8. tax-exclusive status disclosed;
9. no-automatic-refund policy disclosed;
10. cancellation policy disclosed;
11. valid Stripe customer mapping;
12. valid payment method or completed authorized Checkout;
13. required billing notice sent;
14. customer has not canceled or opted out;
15. account is not complimentary, scholarship, staff, test, archived, suppressed,
    or manual-review blocked;
16. no duplicate active subscription exists.

“Still logged in” or “still using the app” may help identify an active member but
may never replace billing consent.

Customers without billing consent or a valid payment method must not be charged.

At the cutoff they move to:

payment_required

Their paid access is paused until they complete checkout.

## 4. Rosh Hashanah conversion models

Support two safe customer paths.

### Path A — Pre-authorized recurring billing

A customer has:

- explicitly accepted post-Rosh Hashanah recurring billing;
- provided a valid payment method;
- accepted the current policy version;
- received the billing notice;
- not canceled.

The system may schedule the first $67 monthly charge for the campaign’s
billing_start_at timestamp.

Implementation options:

- create a subscription before the cutoff using a future billing-cycle anchor
  with no trial and no proration; or
- create the subscription at the cutoff using a durable scheduler.

Choose the safest implementation supported by the current Stripe SDK and test
it.

Do not set:

- trial_period_days;
- trial_end;
- trial_settings.

The first full invoice should be $67, not a prorated partial amount.

### Path B — Consent or payment method missing

A customer has promotional access but lacks:

- recurring billing acceptance; or
- payment method; or
- complete customer data.

Before the cutoff:

- show Continue Membership;
- send or prepare the approved billing notice;
- direct the customer to Stripe Checkout or a secure payment-method flow;
- explain that paid membership begins at the cutoff.

After the cutoff:

- do not charge;
- set access state to payment_required;
- present checkout;
- preserve CRM/member/history;
- restore paid access only after invoice.paid or equivalent verified payment.

## 5. Pre-billing notice

Build a versioned One Time billing-conversion notice.

Do not treat a marketing newsletter as the billing notice.

Notice requirements:

- provider identity: One Time Mishnayos / Rabbi Eli Scheller;
- digital assistant or system identity where applicable;
- customer/member name;
- child name only where approved and appropriate;
- current free-access status;
- exact billing-start date and local time;
- exact price: $67/month;
- recurring monthly billing;
- no 30-day trial;
- taxes not included;
- payment method or Checkout status;
- automatic renewal until canceled;
- cancellation deadline before first charge;
- cancellation behavior;
- no automatic refunds;
- support contact route;
- manage billing link;
- update payment method link;
- cancellation link;
- clear call to action.

Tone:

- warm;
- direct;
- parent-friendly;
- thankful;
- not manipulative;
- no false urgency;
- no internal technical language.

The message may acknowledge the child’s growth and the family’s experience, but
must not imply guaranteed educational outcomes.

Create a template with fields such as:

- customer_name;
- student_display_name_if_approved;
- billing_start_local;
- amount;
- currency;
- cadence;
- manage_billing_url;
- cancel_url;
- support_url;
- policy_version.

Create these notice states:

- draft;
- approved;
- queued;
- sent;
- delivered;
- bounced;
- suppressed;
- failed;
- manual_review.

Record:

- template version;
- recipient relationship;
- delivery provider;
- provider message ID;
- sent_at;
- delivery status;
- policy version;
- exact campaign;
- redacted evidence.

Do not send the full live customer batch from this implementation packet unless
an exact recipient cohort, final copy, sender, suppressions, and release command
are separately approved.

Owner-only email testing is allowed through the existing secure test-recipient
policy.

## 6. Current-code correction audit

Search all tracked current files for:

- trial_days;
- trial_period_days;
- trial_end;
- trial_will_end;
- 30-day;
- free trial;
- one_time_warm_lead_intro_trial;
- grace_period;
- grace_until;
- access_during_grace;
- provider_revenue_split;
- refund decision required;
- manual month credit;
- old trial/referral legal wording;
- test policies that assume trialing.

Inspect at minimum:

- src/lib/billing/stripe-billing-lifecycle.js
- src/lib/integrations/stripe.js
- src/lib/bna/one-time-product-system.js
- src/platform/integrations/stripe-local-beta.js
- src/platform/instances/one-time-separate-deployment.js
- server.js
- current Billing/provider route modules
- docs/integrations/STRIPE.md
- package.json
- current migrations
- current Stripe tests
- current One Time product tests
- current trial/referral tests and smokes
- action and route registries
- active execution-run evidence
- customer-facing public and provider copy
- email templates
- automation definitions

Produce a correction map:

| Old artifact | Old behavior | New behavior | Action |
|---|---|---|---|
| warm-lead intro trial | 30-day trial | promotional access until Rosh Hashanah | supersede |
| Stripe trial days | 30 | 0 / absent | remove from new checkout |
| trial ending event | required | not used | remove from active workflow |
| grace period | seven days | none | replace |
| refund | undecided | no automatic refunds; exception review | replace |
| revenue split | decision pending | out of scope | archive/defer |
| account owner | unknown | Rabbi Eli Scheller | update after safe verification |

Preserve historical evidence. Do not rewrite old audit files to make them appear
as though the prior policy never existed.

## 7. Branch and parallel-work protocol

Do not implement this in the shared master checkout.

Run:

git fetch origin master
git status --short --branch
git log --oneline --decorate -30
npm run chatgpt:dropoff:tower
npm run bna:run:status
npm run bna:run:resume

Create a separate worktree and branch from the latest origin/master:

codex/onetime-rosh-hashanah-billing-platform-v2

Record:

- starting master SHA;
- worktree path;
- branch;
- packet ID;
- lane key;
- current active release owner;
- collision-prone files;
- files this branch owns.

Do not branch from the Stripe proof commit. That commit is evidence, not the
current implementation base.

Do not reset, clean, stash, discard, or overwrite another agent’s files.

Because server.js, generated Operations files, route registries, action
registries, migrations, and provider-shell navigation are collision-prone:

- build modular services first;
- keep central-file changes thin;
- generate an integration manifest;
- push a draft PR;
- allow the release agent to integrate against current master.

## 8. Packet DAG

Create these child packets:

### 00-control-tower-and-policy-correction

- raw capture;
- correction Decisions;
- old/new policy map;
- collision detection;
- branch ownership;
- source coverage;
- exact dependencies.

### 01-provider-billing-domain-and-schema

- existing-table audit;
- generic provider billing architecture;
- provider Stripe binding;
- policy versioning;
- product and price records;
- conversion campaign records;
- notice records;
- subscriptions, invoices, entitlements, automations, and audit.

### 02-products-prices-and-provider-account

- One Time product;
- $67 monthly test/live price versions;
- Rabbi Scheller Stripe account ownership;
- future provider-owned account contract;
- live price publication permissions;
- no payouts/Connect.

### 03-rosh-hashanah-conversion

- campaign;
- countdown;
- eligibility cohort;
- consent;
- payment-method readiness;
- notice;
- billing schedule;
- opt-out;
- payment-required fallback.

### 04-stripe-runtime-webhooks-and-invoices

- sandbox runtime;
- deployed test webhook;
- subscription creation with no trial;
- billing-cycle anchor;
- invoice lifecycle;
- invoice/receipt emails;
- cancellation;
- failed payment;
- exceptional-refund state.

### 05-billing-automations-and-access

- notice;
- conversion;
- invoice paid;
- payment failed;
- payment recovered;
- cancellation scheduled;
- cancellation completed;
- monthly invoice;
- refund exception;
- CRM timeline;
- access state.

### 06-provider-billing-ui

- Billing Overview;
- Catalog;
- Billing;
- Automations;
- Settings;
- responsive detail/subview patterns;
- Product Quality proof.

### 07-sandbox-e2e-verifier

- test product and price;
- test consent;
- test payment method;
- test notice;
- scheduled first charge;
- no-trial proof;
- invoice;
- payment;
- access;
- failure;
- recovery;
- cancellation;
- duplicate webhook;
- cleanup.

### 08-release-handoff

- migrations;
- variables by name only;
- exact integration order;
- deploy commands;
- webhook tests;
- rollback;
- live blockers;
- final activation packet.

## 9. Architecture

Use one provider-neutral billing domain.

One Time is configuration and first implementation.

Do not build:

- a second CRM;
- a second member system;
- a second access system;
- a second communication outbox;
- a separate Stripe lifecycle per provider;
- a browser-owned billing state;
- a One Time-only billing schema that future providers cannot reuse.

Shared billing domain must be scoped by:

- workspace_key;
- project_key;
- provider_key;
- payment_provider;
- provider_account_binding;
- billing_mode: test/live;
- product_key;
- price_key;
- customer/contact/member relationship.

Keep One Time-specific:

- public product name;
- $67 price;
- Rosh Hashanah campaign;
- campaign copy;
- access package;
- One Time theme;
- One Time provider roles;
- One Time automation defaults.

Keep generic:

- Stripe adapter;
- provider account binding;
- product catalog;
- price versioning;
- checkouts;
- customers;
- subscriptions;
- invoices;
- webhook processing;
- entitlement events;
- automation rules;
- audits;
- permissions;
- UI primitives.

## 10. Schema consolidation

Audit existing tables before creating new ones.

Inspect:

- bna_product_programs;
- bna_product_tiers;
- bna_product_funnels;
- bna_product_decisions;
- bna_checkout_records;
- bna_access_grants;
- bna_one_time_policy_acceptances;
- bna_one_time_referrals;
- bna_one_time_referral_credits;
- existing provider integrations;
- existing automation tables;
- existing CRM/member/contact tables;
- proposed Stripe customer/subscription/invoice/webhook/revenue/audit tables.

Create a keep/extend/migrate/supersede map.

Do not create duplicate product, customer, subscription, invoice, access, or
webhook tables merely because an older migration proposal used different names.

Add missing generic records only where needed.

Likely missing domains include:

### Provider payment account binding

Fields:

- workspace_key;
- project_key;
- provider_key;
- provider = stripe;
- mode;
- account_id or safe fingerprint;
- account_owner;
- secret_reference;
- webhook_secret_reference;
- webhook_endpoint_id;
- webhook_status;
- readiness_state;
- live_enabled;
- live_approved;
- last_verified_at;
- last_webhook_at;
- metadata;
- audit timestamps.

No secret value belongs in the table.

### Billing policy version

Fields:

- policy_key;
- version;
- workspace/project/provider;
- product/price;
- amount/currency/cadence;
- no_trial;
- tax_behavior;
- refund_behavior;
- cancellation_behavior;
- failed_payment_access_behavior;
- invoice_email_behavior;
- effective_at;
- status;
- approved_by;
- approved_at;
- metadata.

### Promotional conversion campaign

Fields:

- campaign_key;
- workspace/project/provider;
- product_key;
- price_key;
- timezone;
- promotional_access_start_at;
- billing_start_at;
- notice_template_version;
- status;
- cohort_query_version;
- activation_state;
- pause state;
- created/approved/activated metadata.

### Campaign member state

Fields:

- campaign_id;
- contact_id;
- member_id;
- Stripe customer ID;
- consent status;
- policy acceptance ID;
- payment-method readiness;
- notice status;
- eligibility status;
- block reason;
- scheduled subscription ID;
- first invoice ID;
- conversion status;
- cancellation status;
- timestamps;
- test/live mode.

### Billing notice

Fields:

- campaign;
- customer/member;
- template version;
- channel;
- recipient fingerprint;
- status;
- provider message ID;
- queued/sent/delivered/failed times;
- policy version;
- redacted metadata.

All migrations must be:

- additive;
- idempotent;
- backward compatible;
- workspace scoped;
- test/live isolated;
- safe to roll back.

## 11. Provider-owned Stripe account model

One Time binding:

- provider owner: Rabbi Eli Scheller;
- provider workspace: rabbi_sheller_provider;
- project: one_time_mishnah_class;
- Stripe account: provider-owned;
- payouts: not implemented;
- Connect: not implemented.

Future provider setup:

1. create provider workspace;
2. create provider Stripe binding;
3. store secret references;
4. verify test account;
5. create provider product catalog;
6. bind provider test prices;
7. run sandbox smoke;
8. separately approve live mode.

Never silently copy an existing provider’s Stripe secret into another workspace.

## 12. Product catalog and price versions

Build a professional provider Product Catalog.

### Product fields

- stable product_key;
- workspace/project/provider;
- display name;
- internal name;
- description;
- product type;
- audience;
- access package;
- status:
  - draft;
  - testing;
  - active;
  - paused;
  - archived;
- visibility;
- public funnel association;
- campaign association;
- metadata;
- audit history.

### Price fields

- stable price_key;
- product_key;
- mode;
- amount_cents;
- currency;
- cadence;
- interval count;
- tax_behavior;
- trial_days = 0;
- Stripe product ID;
- Stripe price ID;
- status;
- version;
- effective start/end;
- replaced_by;
- access package;
- automation template;
- policy version;
- published_by;
- published_at;
- audit history.

Never modify a Stripe price amount in place.

Create a new price version and archive the old price from new checkout use.

### One Time initial catalog

Product:

One Time Mishnayos Membership

Price:

- $67 USD;
- monthly;
- no trial;
- tax exclusive;
- promotional access until the campaign cutoff;
- paid access after successful recurring billing;
- test price bound to the current stable sandbox alias;
- live price publication supported but separately gated;
- no provider payout configuration.

## 13. Price publication workflow

Separate:

- draft price;
- sandbox price;
- live price;
- published price;
- active checkout price;
- billing campaign price.

A workspace admin can publish a valid live price only after:

- product complete;
- Stripe live account binding ready;
- live price ID verified;
- amount/currency/cadence readback matches;
- no-trial policy matches;
- tax behavior matches;
- policy version approved;
- access package assigned;
- automation template assigned;
- terms copy present;
- cancellation copy present;
- no-refund copy present;
- invoice settings ready;
- action is explicitly confirmed.

Publishing a live price does not:

- start the Rosh Hashanah campaign;
- create subscriptions;
- send notices;
- charge customers;
- grant access.

Those actions have their own controls and audits.

## 14. Stripe checkout and subscription creation

Use server-owned product and price mappings.

Do not accept an arbitrary Stripe price ID from the browser.

Checkout requirements:

- provider scope derived server-side;
- product and price active;
- price belongs to provider;
- price mode matches account mode;
- idempotency key;
- customer/contact/member linkage;
- recurring terms acceptance;
- policy version acceptance;
- payment method;
- success/cancel URLs;
- no trial fields;
- no secrets returned;
- internal checkout record persisted.

Remove:

trial_period_days

from the One Time checkout payload.

For pre-cutoff authorized conversion, use the supported future billing date
mechanism without creating a Stripe trial.

Verify the current Stripe SDK’s exact parameters before implementation.

Expected behavior:

- no charge before billing_start_at;
- no partial proration;
- first full invoice at billing_start_at;
- $67 amount;
- monthly renewal based on the first billing anchor;
- no trial state.

## 15. Conversion eligibility engine

Build a deterministic server-owned eligibility service.

Possible statuses:

- promotional_access;
- needs_policy_acceptance;
- needs_payment_method;
- needs_email;
- notice_ready;
- notice_queued;
- notice_sent;
- notice_failed;
- scheduled_for_billing;
- converted;
- payment_required;
- opted_out;
- canceled_before_start;
- complimentary;
- manual_review;
- blocked;
- archived.

The UI must explain why each person is or is not eligible.

Do not infer eligibility from:

- latest login;
- browser cookie;
- page visit;
- a generic CRM tag alone;
- email open tracking;
- verbal interest without recorded policy acceptance.

Provide cohort counts without exposing private data:

- total promotional members;
- eligible;
- needs consent;
- needs payment method;
- notice pending;
- scheduled;
- opted out;
- complimentary;
- blocked/manual review.

## 16. Conversion scheduler

Build a durable, idempotent scheduler.

Requirements:

- campaign-specific;
- timezone aware;
- lock/claim protection;
- safe retries;
- no duplicate subscriptions;
- no duplicate notices;
- no duplicate invoices;
- no duplicate access changes;
- pause/resume;
- dry run;
- cohort preview;
- per-member result;
- dead-letter/manual-review state;
- audit trail;
- exact deploy SHA and policy version.

Before live activation, require:

- exact campaign timestamp;
- final cohort preview;
- notice template approved;
- notice send results;
- live price published;
- live Stripe binding ready;
- webhook healthy;
- consent/payment-method coverage;
- exception list;
- rollback plan;
- explicit activation confirmation.

## 17. Billing lifecycle and access

### Invoice paid

On trusted invoice.paid or equivalent verified success:

- mark invoice paid;
- activate or extend paid entitlement;
- set access expiration to current paid period end;
- update CRM timeline;
- record revenue;
- record invoice/receipt links;
- run paid-event automations;
- avoid duplicate effects.

### Invoice failed

On trusted invoice.payment_failed:

- set payment_failed/past_due;
- suspend paid entitlement immediately;
- do not apply a grace period;
- create one local billing alert;
- provide update-payment-method link;
- trigger approved Stripe failure notification or create a draft;
- allow payment retries;
- restore access only after a later verified paid event.

### Payment recovered

- mark paid;
- close or resolve local alert;
- restore entitlement;
- update activity;
- avoid duplicate restoration.

### Cancellation scheduled

- set cancel_at_period_end;
- keep access until current_period_end;
- create cancellation confirmation;
- show scheduled cancellation date;
- stop future renewal after the paid period;
- no refund;
- no proration.

### Cancellation completed

- revoke paid entitlement;
- preserve CRM contact/member;
- preserve invoice and subscription history;
- update activity.

### Exceptional refund

- manual request;
- explicit reason;
- workspace admin review;
- two-step confirmation;
- no automatic action;
- test/live separation;
- audit;
- separate access decision.

## 18. Monthly invoices and customer billing email

Use Stripe-generated invoices as the billing record.

For every monthly cycle, record:

- invoice ID;
- invoice number;
- customer;
- subscription;
- product/price;
- billing period;
- subtotal;
- tax;
- total;
- amount paid;
- amount remaining;
- status;
- payment state;
- hosted invoice URL;
- PDF URL;
- receipt URL;
- finalized_at;
- paid_at;
- email status.

Configure and verify:

- finalized-invoice email;
- successful-payment receipt email;
- PDF attachment where supported;
- failed-payment email;
- payment-method update link;
- subscription-management/cancellation link.

Do not expose raw private invoice URLs to unrelated workspaces or users.

Billing emails must use the customer billing email tied to the correct CRM
contact/member.

## 19. Billing automations

Reuse the existing Automation Center when possible.

Do not create a second automation engine.

Support these provider-scoped rules:

### Promotional member added

- add to campaign candidate pool;
- evaluate eligibility;
- do not bill;
- do not create an ordinary task unless explicitly configured.

### Billing consent recorded

- update eligibility;
- link policy version;
- verify payment method;
- prepare schedule.

### Notice sent

- update notice state;
- update CRM timeline;
- no duplicate send.

### Billing date reached

- process eligible members;
- create or activate subscription;
- mark noneligible members payment_required;
- record per-member result.

### Invoice paid

- activate/extend access;
- update CRM;
- record invoice;
- record revenue;
- send/verify receipt.

### Invoice failed

- suspend access immediately;
- local alert;
- update-payment-method workflow;
- no grace;
- no duplicate task.

### Subscription cancellation scheduled

- maintain access through period;
- record end date;
- send confirmation.

### Subscription ended

- revoke paid access;
- preserve account/history.

### Refund exception requested

- create manual-review item;
- no Stripe write.

### Refund issued

- process only from verified Stripe event;
- update payment record;
- route access decision to manual review unless an explicit policy applies.

Every rule needs:

- rule key;
- provider scope;
- product/price filter;
- trigger;
- conditions;
- actions;
- mode;
- enabled status;
- idempotency;
- retry policy;
- last result;
- run history;
- error/dead-letter state;
- audit evidence.

## 20. Billing UI — professional information architecture

Build Billing inside the dedicated One Time provider shell.

Do not add another giant always-open wall to the Operations monolith.

Use this primary hierarchy:

### Billing

Primary categories:

1. Overview
2. Catalog
3. Billing
4. Automations
5. Settings

Use a clear secondary navigation within each category.

### Overview

Show:

- TEST or LIVE mode;
- Stripe account readiness;
- active product;
- published price;
- Rosh Hashanah countdown;
- billing start;
- promotional members;
- eligible members;
- consent missing;
- payment method missing;
- notice pending;
- scheduled conversions;
- active subscriptions;
- failed payments;
- canceled subscriptions;
- current month invoiced;
- current month collected;
- webhook health;
- automation health.

Use concise cards and one obvious next action.

Do not show raw IDs or debug text in the main overview.

### Catalog

Secondary sections:

- Products
- Prices
- Access Packages
- Checkout
- Product Activity

#### Product detail

Use:

- Summary
- Pricing
- Access
- Rosh Hashanah Conversion
- Automations
- Checkout
- Activity

Actions:

- Add Product
- Edit Draft
- Add Price Version
- Sync Sandbox Product
- Publish Live Price
- Pause New Checkouts
- Archive Product
- Create Test Checkout
- Preview Customer Experience

Use no more than two primary actions. Put remaining actions in More.

### Billing category

Secondary sections:

- Conversion Campaign
- Customers
- Subscriptions
- Invoices & Payments
- Refund Exceptions
- Billing Activity

#### Conversion Campaign

Show:

- campaign name;
- countdown;
- exact Israel timestamp;
- local-time preview;
- product and price;
- policy version;
- notice version;
- campaign state;
- eligible counts;
- blockers;
- dry run;
- preview cohort;
- notice status;
- scheduled conversions;
- failed/manual-review rows;
- pause/resume state;
- activation history.

Primary actions:

- Preview Cohort
- Run Dry Test

Overflow:

- Approve Notice
- Queue Owner Test
- Schedule Conversion
- Pause Conversion
- Export Redacted Summary

Live activation must not appear as an ordinary button without readiness and
confirmation.

#### Customers

Show:

- linked CRM contact;
- member;
- consent;
- payment-method readiness;
- campaign eligibility;
- notice state;
- subscription;
- invoices;
- access;
- cancellation;
- activity.

#### Subscriptions

Show:

- customer;
- product;
- price;
- test/live;
- status;
- billing anchor;
- next invoice;
- current period;
- cancellation state;
- access state;
- payment failures;
- invoice history.

#### Invoices & Payments

Show:

- invoice number;
- customer;
- amount;
- tax;
- total;
- paid/failed/open;
- billing period;
- receipt;
- PDF;
- email status;
- payment attempt history;
- linked subscription and CRM record.

#### Refund Exceptions

Show:

- requested;
- under review;
- approved;
- rejected;
- processed;
- failed;
- reason;
- linked payment;
- access decision;
- audit.

Default empty-state copy should explain that refunds are not automatic.

### Automations

Secondary sections:

- Rules
- Runs
- Failures
- Templates

Show customer-facing labels, not code keys.

Each rule detail should show:

- trigger;
- conditions;
- actions;
- product;
- mode;
- enabled status;
- last run;
- next action;
- error state;
- replay protection.

### Settings

Secondary sections:

- Stripe Account
- Webhook
- Invoice Emails
- Policies
- Permissions
- Test & Live Modes

#### Stripe Account

Show only:

- provider owner;
- account binding status;
- test/live;
- secret configured;
- secret fingerprint;
- webhook configured;
- webhook fingerprint;
- last verification;
- provider account readback;
- readiness;
- blockers.

Never show a secret.

#### Policies

Show:

- $67/month;
- no trial;
- tax exclusive;
- no automatic refunds;
- manual exception review;
- cancel at period end;
- no grace period;
- monthly invoice email;
- current policy version;
- history.

#### Permissions

Show which workspace roles may:

- view billing;
- edit products;
- add prices;
- publish live prices;
- manage automations;
- review refund exceptions;
- configure Stripe;
- activate billing campaign.

## 21. Responsive UI contract

Desktop:

- focused primary category;
- compact secondary navigation;
- data table or card list;
- dedicated detail pane/route;
- no always-open forms;
- sticky record header;
- contextual actions.

Mobile at 390 and 430:

- list state;
- detail state;
- subview/action state;
- explicit Back;
- sticky top bar;
- horizontally scrollable secondary tabs;
- maximum two primary actions;
- More overflow;
- Filters sheet;
- one active section;
- lazy data;
- preserved search/filter/scroll state;
- 44px minimum controls;
- no horizontal page overflow.

Apply the dense-action rule:

- more than four peer actions → overflow menu;
- more than three persistent filters → Filters drawer/sheet;
- more than five content groups → tabs/subroutes;
- substantial form → dedicated subview/drawer/route;
- destructive actions → never primary;
- disabled action → exact reason.

Create and validate a Product Quality packet before claiming UI completion.

Run:

npm run pqc:validate

Capture:

- 1440 × 900
- 1024 × 900
- 768 × 1024
- 430 × 860
- 390 × 844

## 22. API requirements

Prefer modular provider Billing routes.

Server derives workspace/project/provider from authenticated context.

Do not trust browser-supplied scope.

APIs should cover:

- overview;
- products;
- product detail;
- price versions;
- price publication;
- conversion campaign;
- cohort preview;
- consent;
- notice status;
- customer billing;
- subscriptions;
- invoices;
- payments;
- exceptional refund requests;
- automations;
- automation runs;
- billing activity;
- Stripe readiness;
- webhook health;
- sandbox reconciliation.

Private routes must reject:

- anonymous users;
- wrong workspace;
- wrong provider;
- wrong project;
- unauthorized role;
- test/live mismatch;
- guessed record IDs.

Register all routes and visible actions.

## 23. Permissions

### Workspace owner/admin

May, within their own workspace:

- view Billing;
- create/edit product drafts;
- create price versions;
- publish a valid live price;
- configure product access;
- configure automations;
- view customers/subscriptions/invoices;
- preview conversion cohort;
- review refund exceptions;
- pause product or conversion campaign;
- run approved sandbox actions.

### Platform Super Admin

May:

- support any provider with explicit context;
- configure secret references;
- inspect integration health;
- manage provider account binding;
- audit cross-system failures.

Must not silently cross provider data.

### Future provider admin

Sees only their provider Billing records and provider Stripe binding.

### Parent/customer

Sees only relationship-scoped:

- their subscription;
- invoices;
- receipt;
- next charge;
- cancellation;
- update payment method;
- access status.

No provider administration.

### Public

No private Billing data.

## 24. Stripe runtime and webhook

Verify and complete the canonical public webhook route.

Expected route or canonical equivalent:

/api/webhooks/stripe/rabbi

Requirements:

- raw body;
- Stripe signature verification;
- strict method/body limits;
- provider account binding;
- test/live validation;
- event persistence;
- idempotency;
- replay handling;
- redacted payload summary;
- failure/dead-letter state;
- fast acknowledgement;
- durable processing;
- no secret logging;
- no unrelated provider event processing.

Handle at minimum:

- checkout.session.completed;
- checkout.session.expired;
- customer.subscription.created;
- customer.subscription.updated;
- customer.subscription.deleted;
- invoice.created;
- invoice.finalized;
- invoice.paid;
- invoice.payment_failed;
- invoice.payment_action_required;
- invoice.upcoming;
- charge.refunded;
- payment_method.attached.

Trial-ending events may remain safely ignored for historical Stripe objects, but
they are not an active One Time launch mechanism.

## 25. Railway sandbox configuration

Before changing Railway:

- confirm target project one-time-production;
- confirm service one-time-web;
- confirm environment;
- confirm BNA is not target;
- inventory variable names safely;
- ensure no live key is copied.

Propagate only required test-mode values through the approved secret-safe path.

Keep:

- mode=test;
- live billing disabled;
- live approval false/absent.

Read back:

- presence;
- source type;
- safe length;
- fingerprint;
- effective mode;
- account owner;
- test price binding;
- webhook readiness.

Do not echo values.

## 26. Sandbox E2E

Use synthetic TEST-prefixed identities only.

Test the entire Rosh Hashanah lifecycle using an injected clock, Stripe test
clock where suitable, or another deterministic sandbox mechanism.

Scenarios:

1. promotional member without consent;
2. promotional member with consent but no payment method;
3. fully eligible member;
4. notice draft;
5. notice owner test;
6. notice sent status;
7. scheduled no-trial subscription;
8. no charge before billing start;
9. full $67 first invoice at billing start;
10. monthly renewal;
11. invoice email/receipt record;
12. payment failure;
13. immediate access suspension;
14. payment recovery;
15. access restoration;
16. cancellation before first charge;
17. cancellation after payment;
18. access through paid period;
19. no refund;
20. exceptional refund request;
21. webhook replay;
22. wrong workspace event;
23. wrong mode event;
24. cleanup.

Explicitly prove:

- no `trialing` subscription is required;
- no trial fields are sent;
- no grace period is applied;
- no provider payout is created;
- no Stripe Connect object is created;
- no real customer;
- no real money;
- no real access grant;
- no real customer email;
- no duplicate product or price;
- no duplicate subscription;
- no duplicate invoice effects;
- no duplicate alert/task.

Do not delete the stable sandbox product and price during cleanup.

Clean disposable:

- test customers;
- test checkouts;
- test subscriptions;
- synthetic access;
- test notices;
- temporary automation runs.

## 27. Tests

Update or replace old trial assertions.

Add negative assertions:

- no trial_period_days;
- no active trial_days=30;
- no active 30-day trial copy;
- no Rosh Hashanah conversion using trial_end;
- no active seven-day grace;
- no automatic refund;
- no provider split;
- no Connect;
- no payout;
- no login-only billing eligibility.

Add positive tests for:

- campaign policy;
- canonical date;
- timezone;
- recurring consent;
- payment-method readiness;
- billing notice;
- eligibility;
- billing-cycle anchor;
- no proration;
- full first invoice;
- monthly renewal;
- invoice email state;
- cancel at period end;
- no refund;
- exceptional refund review;
- immediate payment-failure suspension;
- recovery;
- workspace admin live-price publication;
- price publication separate from campaign activation;
- future provider account isolation;
- secret isolation;
- webhook idempotency;
- CRM linkage;
- access linkage.

Run:

node --test tests/stripe-billing-lifecycle.test.js
node --test tests/one-time-stripe-local-beta.test.js
node --test tests/one-time-product-system.test.js
node --test tests/rabbi-checkout-access.test.js
npm run stripe:sandbox-smoke
npm run one-time:setup:check -- --json
npm run test:onetime:focused
npm run secrets:audit
npm run watchdog:actions
npm run watchdog:links
npm run watchdog:security
npm run watchdog:workspace-scope
npm run watchdog:protocol-drift
npm run audit:governance:strict
npm run bna:run:validate
git diff --check

Run the full relevant test suite before final integration.

## 28. Performance

Billing must be route-loaded.

Do not load all Billing features at provider-shell startup.

Lazy-load:

- product details;
- campaign cohort;
- customers;
- subscriptions;
- invoices;
- automations;
- activity.

Use pagination.

Do not return unlimited rows.

Add Billing route-module budgets.

Measure:

- module size;
- initial requests;
- API p95;
- response size;
- DOM nodes;
- mobile LCP;
- action readiness;
- route transition.

Use existing Server-Timing, trace, and privacy-safe RUM infrastructure.

## 29. Commit plan

Use bounded commits:

1. Register no-trial Rosh Hashanah billing policy correction
2. Consolidate provider Billing schema and account binding
3. Add product and price version management
4. Add Rosh Hashanah campaign and eligibility engine
5. Add billing notice and consent workflow
6. Add no-trial Stripe checkout and webhook persistence
7. Add invoices payments cancellation and refund-review lifecycle
8. Add Billing automations and entitlement integration
9. Add professional provider Billing UI
10. Add sandbox E2E and verifier proof
11. Add release handoff

After each:

- inspect diff;
- run focused tests;
- record evidence;
- push branch.

## 30. Draft PR and release handoff

Push:

codex/onetime-rosh-hashanah-billing-platform-v2

Open a draft PR.

PR must state:

- raw ID;
- Decisions;
- superseded trial policy;
- branch base SHA;
- tables reused;
- migrations;
- routes;
- actions;
- UI;
- tests;
- sandbox results;
- no real funds;
- no live customer billing;
- secrets excluded;
- live activation blockers;
- central-file conflicts;
- integration order;
- rollback.

Create a release handoff containing:

- branch SHA;
- current master SHA;
- migration order;
- variable names only;
- Railway target;
- test mode propagation;
- deploy commands;
- invalid/valid webhook tests;
- campaign dry run;
- owner notice test;
- sandbox billing test;
- cleanup;
- rollback;
- exact final-live activation requirements.

## 31. Live activation boundary

This packet builds and proves the full system in sandbox.

It does not authorize charging real customers merely because the code is ready.

Before real billing activation, require one final exact launch packet with:

- exact billing_start_at;
- final live price;
- live Stripe binding;
- live webhook;
- final customer-facing policy;
- final notice copy;
- exact customer cohort;
- recurring consent proof;
- payment-method coverage;
- cancellation route;
- support route;
- invoice-email setup;
- suppression/exception list;
- dry-run counts;
- rollback;
- operator approval;
- exact deployed SHA.

No real user may be charged solely because they remain logged in.

## 32. Definition of Done

The branch is complete only when:

1. old 30-day trial policy is superseded;
2. no new One Time checkout uses a Stripe trial;
3. one canonical Rosh Hashanah campaign exists;
4. $67 monthly product and price are modeled;
5. provider account owner is Rabbi Eli Scheller;
6. future providers can bind their own Stripe account;
7. no payouts or Connect exist;
8. tax is modeled as exclusive;
9. no automatic refunds exist;
10. exceptional refund review exists;
11. cancellation is period-end with no refund;
12. no grace period exists;
13. failed payment suspends access immediately;
14. monthly invoices and receipt emails are modeled and tested;
15. billing consent is required;
16. valid payment method is required;
17. notice state is tracked;
18. campaign eligibility is deterministic;
19. price publication permissions work for workspace admins;
20. price publication does not start billing;
21. persistent webhook lifecycle works;
22. replay is idempotent;
23. CRM, subscriptions, invoices, access, and automations agree;
24. professional responsive Billing UI exists;
25. sandbox E2E passes;
26. no secrets leak;
27. no real money/customer/access is used;
28. branch is pushed;
29. draft PR exists;
30. exact release handoff exists.

## 33. Final report

Return:

### Policy correction

- old policy;
- new policy;
- superseded files;
- historical records preserved.

### Branch

- worktree;
- branch;
- base SHA;
- final SHA;
- PR;
- release owner.

### Product

- product;
- test price;
- live-price readiness;
- no-trial proof;
- tax behavior;
- access package.

### Campaign

- campaign key;
- billing-start source;
- timezone;
- eligibility counts;
- consent;
- payment readiness;
- notice state;
- scheduling;
- blockers.

### Stripe

- provider owner;
- mode;
- product/price readback;
- checkout;
- billing anchor;
- webhook;
- invoice;
- payment;
- cancellation;
- replay;
- cleanup.

### Policies

- no trial;
- no grace;
- no automatic refund;
- exception review;
- period-end cancellation;
- monthly invoice email;
- no payouts/Connect.

### Automations

- rules;
- runs;
- idempotency;
- alerts;
- drafts;
- access effects.

### UI

- category structure;
- subcategories;
- screenshots;
- responsive behavior;
- accessibility;
- performance.

### Verification

- tests;
- migration proof;
- sandbox E2E;
- secret audit;
- workspace isolation;
- exact evidence.

### Remaining live blockers

- exact billing timestamp;
- final live price readback;
- live Stripe/webhook;
- final notice copy;
- exact cohort;
- consent/payment coverage;
- final activation approval.