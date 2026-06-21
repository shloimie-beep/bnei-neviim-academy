# ONE TIME + BNA REVENUE LAUNCH, PARSER V2, CRM, AUTH, AND BETA QA FOLLOW-UP

## Execution mode

Resume the existing active execution run:

ops/execution-runs/2026-06-21-one-time-master-completion

Resume the canonical PR branch:

codex/agent-control-center-20260619

Do not create a parallel run.

Do not restart completed Batches 0–8.

Read and preserve:

- BNA-START-HERE.md
- AGENTS.md
- README.md
- MEMORY.md
- TASKS.md
- SYSTEM-STATE.md
- PROJECT-NOTES.md
- docs/BNA-RAMBLE-TO-DONE.md
- ops/execution-runs/latest.json
- the complete active execution-run directory
- ops/one-time-mishnah/master-backlog-reconciliation.*
- ops/ingestion-runs/*
- relevant parser, CRM, Stripe, Resend, portal, ticket and Telegram files
- current local and remote Git state
- current PR #5 state
- current Railway deployed commit

Verify the current remote branch HEAD before editing. Do not reset newer work to an older SHA.

This is an implementation prompt, not an audit-only prompt.

Continue automatically through every unblocked sub-batch below.

For each sub-batch:

1. inspect current behavior;
2. add or update stable requirements;
3. implement;
4. test;
5. commit;
6. push;
7. update PR #5;
8. deploy safe app-visible work;
9. live-smoke;
10. record evidence;
11. continue to the next unblocked sub-batch.

Do not stop after writing documentation.

Do not stop because one external decision is unresolved.

Create one Decision for the blocked item and continue all independent work.

---

# Durable product decisions

Record these in the appropriate source-of-truth files and active-run requirements.

## Product scope

- This system is currently for two operating contexts:
  - BNA
  - One Time One Time / Rabbi Ellie Scheller
- It is not currently being packaged or resold as standalone SaaS.
- Do not spend this wave building generic reseller onboarding, tenant billing, white-label self-service or a universal SaaS administration layer.
- Multi-workspace authentication and privacy are still mandatory because real parents, students, providers and members use the system.
- The custom first-party CRM is the active direction.
- GHL, GoHighLevel and LeadConnector are not active runtime systems.
- GHL is only a possible fallback if the internal system ultimately fails.
- Do not add new GHL code, routes, environment variables, automations or UI.

## Operating priority

The priority is:

1. privacy and authentication;
2. reliable intake/parsing;
3. CRM and lead organization;
4. email campaigns;
5. payment/trial/access;
6. class links and reminders;
7. community questions;
8. authenticated support tickets;
9. realistic beta testing;
10. Vimeo/Zoom automation;
11. advanced gamification and study bot.

## Admin-first

- Shloimie and internal administrators may manage complicated setup through Operations, first-party APIs and natural-language workflows.
- Do not spend this wave adding every possible self-service button for Rabbi Scheller or customers.
- Build only essential customer-facing actions:
  - sign up;
  - authenticate;
  - manage payment method where appropriate;
  - cancel future renewal;
  - open class;
  - open library;
  - ask a private/community question;
  - open a support ticket;
  - view appropriate progress and communications.
- Complex configuration remains admin-first.

## Privacy

- Everything private remains private by default.
- No BNA family/student data may appear in One Time.
- No One Time private data may appear in BNA.
- No user should access private data only through knowledge of a database ID or query parameter.
- Support tickets, questions, recordings, class links and transcript material must be workspace- and relationship-scoped.

## Support bot

- Authenticated users may use the bot to open support tickets even if they are not paid software customers.
- The support bot is not the unrestricted Mishnah study bot.
- Its initial purpose is:
  - identify the authenticated user;
  - identify current workspace/page;
  - collect the issue;
  - categorize it;
  - create a scoped ticket;
  - return a ticket number;
  - allow staff to answer;
  - notify the correct user privately.
- Do not expose other users’ tickets or internal technical notes.

---

# Revenue-launch decisions

Implement these as configurable launch settings and test-mode workflows.

Do not perform a real charge or bulk email send without an explicit later action-specific approval.

## Warm-lead launch promotion

Default proposed launch promotion:

- Audience: approved warm One Time leads.
- Offer: 30-day free trial.
- Payment method required at signup.
- Automatically renew at $67/month after the trial.
- Customer may cancel before the trial ends to avoid renewal.
- Display the exact renewal date and renewal amount before confirmation.
- Send a pre-renewal reminder.
- Allow only one introductory trial per eligible person/household/payment identity.
- Record offer version and acceptance timestamp.

Keep the promotion configurable so the operator can later change:

- trial length;
- price;
- eligibility;
- campaign segment;
- card requirement;
- renewal reminder timing;
- capacity;
- expiration date.

Do not automatically apply the trial to existing paying subscribers.

Existing subscribers must be reconciled separately and preserved until reviewed.

## Referral promotion

Implement a referral-credit model:

- A member refers a new family.
- The referred person must become a real paying customer.
- The referral reward activates only after the referred customer completes the first successful paid billing cycle after any trial.
- The referring family receives one month of base-plan credit.
- Prevent:
  - self-referral;
  - duplicate referral credit;
  - multiple credits for one referred customer;
  - referral activation after failed/refunded payment.
- Preserve audit history.
- Make reward amount/configuration adjustable.
- The referred family may receive the standard warm-lead launch promotion if otherwise eligible.

Do not apply real invoice credits during this implementation wave. Use Stripe test mode or local mocks.

## Cancellation and refund policy intent

Record the current business intent:

- Customers may cancel future renewal.
- Payments already processed are generally not subject to discretionary refunds.
- Exceptions must remain possible for:
  - duplicate charge;
  - incorrect charge;
  - provider-cancelled class where no appropriate makeup/credit was provided;
  - circumstances required by applicable law.
- Do not publish blunt wording such as “too bad.”
- Build policy-version storage and acceptance records.
- Create one operator Decision for final customer-facing legal wording.
- Do not let that Decision block test-mode implementation.

---

# Priority override to current Batch 9

Split parent requirement `REQ-20260619-306` into child requirements while preserving the parent requirement.

Create stable child requirements for:

1. source-envelope and mixed-context parser v2;
2. today’s class-upload trace;
3. Downloads spreadsheet inventory;
4. CRM import and deduplication;
5. CRM Contacts UX;
6. warm-lead trial and referral configuration;
7. payment-to-access and class-link flow;
8. authenticated questions and support-ticket bot;
9. test identities and mock data;
10. Agent Mode end-to-end acceptance.

Do not mark parent `REQ-20260619-306` complete until all required child requirements are appropriately closed or genuinely blocked.

Update BATCH-STATUS.md to show these sub-batches.

---

# Sub-batch 9A — Source-envelope and mixed-context parser v2

## Problem

One input file may contain:

- one main workspace;
- multiple topics;
- multiple students;
- class content;
- family discussion;
- Operations tasks;
- One Time tasks;
- BNA tasks;
- private questions;
- content ideas.

The parser must not allow one global keyword to incorrectly scope every fragment.

## Source-envelope classification

Add a first-pass source classifier.

Every source envelope must include:

- source_id;
- source hash;
- filename/title;
- source channel;
- upload time;
- source date;
- uploader where known;
- language;
- default workspace;
- default project;
- default context type;
- source-level confidence;
- privacy level;
- parser version;
- processing status.

Supported context types should include:

- class_recording;
- family_meeting;
- provider_meeting;
- operations_ramble;
- crm_spreadsheet;
- content_recording;
- mixed;
- unknown_needs_review.

## Title and filename behavior

The title/filename establishes a strong default context.

Examples:

- `Dratler family meeting`
  - Default the entire source to the existing Dratler/family workspace and family-meeting context.
  - Inspect the repository and database for the canonical family workspace key; do not invent a second key.
- `Rabbi Scheller class`, `Mishnayos class`, or clearly class-oriented title
  - Default to the identified class/project/workspace.
- `Operations ramble`
  - Default to platform/Operations work.
- `One Time meeting`
  - Default to Rabbi Scheller’s One Time workspace.

The default is not absolute.

A clear local segment may override it.

Example:

```text
Dratler family meeting

[family discussion...]

Operations task: fix the task queue mobile toolbar.