# Product Quality Compiler

The operator is allowed to be vague. The assistant and agent layer are not
allowed to remain vague.

When Shloimie uses broad product-quality language, the assistant/agent must
compile it into exact product, UI, workflow, data, scope, evidence, and closeout
requirements before Codex edits product code.

Do not forward phrases such as "make it a million-dollar app" or "clean it up"
as standalone implementation work. Turn them into requirement IDs, affected
screens, expected states, visual findings, implementation batches, tests, and
proof gates.

## Trigger Phrases

Trigger phrases include, but are not limited to:

- million-dollar app
- perfect
- clean
- polished
- professional
- GHL-like
- Stripe-like dashboard
- Notion-like organization
- Google Classroom-like
- Kajabi-like
- Circle-like
- beautiful
- ugly
- sloppy
- embarrassing
- all over the place
- finish it
- make it work
- launch-ready
- configured
- working
- obvious mistakes
- redundant
- confusing
- not relevant to the user
- super admin stuff showing to Rabbi
- categories/subcategories/filters are wrong
- the UI is broken
- it should just be logical
- community section
- CRM
- pipeline
- bulk email
- payment/access
- automations
- dashboard
- portal

## Required Compiler Output

For every UI/product ramble that uses vague quality language, create or update a
register entry that names:

1. affected workspace/project;
2. affected roles;
3. affected routes/screens;
4. current-state inspection targets;
5. user-facing goal;
6. information architecture spec;
7. visual-layout spec;
8. visible data fields;
9. required tabs/cards/drawers/tables/boards;
10. required action/button states;
11. forbidden content;
12. mobile/tablet/desktop requirements;
13. accessibility/readability requirements;
14. data/API requirements;
15. external-provider blockers, if any;
16. implementation files likely touched;
17. tests/smokes to run;
18. screenshot evidence required;
19. deploy/live-smoke evidence required;
20. terminal done criteria.

If the compiler cannot fill one of these fields, it must mark the field as
`blocked`, `needs_current_state_inspection`, or `needs_operator_decision` with
an owner and next action. It must not leave the requirement vague.

## Product Quality Compiler Validator

Compiled product-quality packets must validate against
`ops/product-quality-compiler.schema.json` and the deterministic validator:

```bash
npm run pqc:validate
```

Before implementation, packets that include UI/product work must pass
validation or be split/blocked. The validator enforces required packet fields,
stage/role/view-class enums, raw/packet/requirement ID patterns, state matrix,
screenshots, action states, no-GHL policy, external-provider separation,
deployment gates, browser-security fields, and trace fields.

Fixture and eval checks:

```bash
npm run pqc:validate:fixtures
npm run pqc:evals
```

Protocol drift check:

```bash
npm run watchdog:protocol-drift
```

## Ramble Protocol v3 Integration

Product Quality Compiler packets now sit inside the Product Quality Operating
System:

1. Raw Capture.
2. Ramble Router.
3. Source-of-Truth Readback.
4. Product Quality Compiler.
5. Super-Ramble Packet DAG when needed.
6. Definition of Ready.
7. Current-State Visual Audit.
8. Small Implementation Packets.
9. Independent Verification.
10. Deploy/Live Smoke for app-visible work.
11. Trace/Observability.
12. Drift Watchdog.
13. Closeout and next packet.

Use:

- `docs/RAMBLE-ROUTER.md`;
- `docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md`;
- `docs/PACKET-DAG.md`;
- `docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md`;
- `docs/REPO-SURFACE-MAP.md`.

For broad UI/product language, the compiler must not generate a Codex
implementation packet until `00-control-tower` and
`01-current-state-visual-audit` exist and Definition of Ready passes.

New v3 machine-readable packets should use `schema_version: pqc.v2` and include
router output, packet DAG, design-pattern references, browser security,
context budget, trace, drift watchdog, and next-packet fields. The validator
continues to accept older `pqc.v1` fixtures for compatibility, but new broad
product-quality packets should use v2.

## Definition of Ready for Codex UI/Product Implementation

Codex may not implement a UI/product packet until the packet has passed Product
Quality Compiler validation.

Ready requires:

1. exact affected route/screen list;
2. workspace/project;
3. role/view class;
4. current-state screenshots or exact screenshot blocker;
5. VQ defect codes or explicit non-visual scope;
6. data fields to display;
7. action/button state matrix;
8. state matrix for loading, empty, populated, filtered_empty, error,
   blocked_setup, preview_only, success_readback, permission_denied, and mobile
   detail state;
9. out-of-scope list;
10. tests/smokes/watchdogs to run;
11. accessibility requirements;
12. security/privacy requirements;
13. deploy/live-smoke gate;
14. evidence paths;
15. terminal done criteria;
16. next packet or closeout rule.

If Definition of Ready fails:

- do not implement code;
- update the packet or split it;
- record blocker or validation failure;
- do not mark the requirement as done.

## Definition of Done for Product/UI Work

Done requires:

1. all related requirements have terminal statuses;
2. implementation files inspected and listed;
3. action registry updated for every visible action;
4. route registry updated for every affected route;
5. before screenshots exist or exact blocker recorded;
6. after screenshots exist for required viewports;
7. VQ defects resolved or explicitly blocked;
8. state matrix verified;
9. accessibility scan or documented blocker;
10. ARIA/semantic snapshot where applicable;
11. focused tests pass;
12. app-visible work deployed;
13. live smoke passes for app-visible work;
14. Product Quality Compiler validator passes;
15. protocol drift watchdog passes;
16. evidence files exist;
17. ledger/changelog/memory updated;
18. `NEXT-SESSION.md` names remaining work if anything remains.

Do not allow:

- "looks good" as evidence;
- "tests pass" as UI proof without screenshots;
- app-visible done status without deployed commit/live-smoke;
- vague done claims without requirement IDs.

## Enforcement References

- State matrix contract: `docs/UI-STATE-MATRIX.md`
- Visual/a11y harness contract: `docs/VISUAL-QUALITY-HARNESS.md`
- UI pattern reference: `docs/UI-PATTERN-REFERENCE.md`
- Browser-agent security: `docs/BROWSER-AGENT-SECURITY.md`
- Agent trace/observability: `docs/AGENT-TRACE-OBSERVABILITY.md`
- Visual defect taxonomy: `ops/visual-quality-rubric.md`
- Validator reports: `ops/product-quality-compiler/validation/`
- Eval reports: `ops/product-quality-compiler/evals/`
- Drift reports: `ops/watchdog-audits/`

## Million-Dollar App Quality Standard

"Million-dollar app" is not a marketing phrase. It compiles into concrete
standards for visual polish, information architecture, workflow completeness,
CRM/community/product credibility, speed, role scoping, and functional finish.

A screen is not million-dollar-quality unless it satisfies all relevant checks
below.

### A. Visual Polish

- consistent typography scale;
- readable body text and labels;
- no faded, gray-on-gray, or low-contrast text;
- no random font sizes;
- no mixed visual styles on the same screen;
- consistent card radius, padding, and section spacing;
- consistent button heights and icon sizing;
- aligned form controls, card headers, left edges, and filter rails;
- no overlapping panels;
- no horizontal overflow;
- no accidental scroll traps;
- no dense unstructured walls of text;
- no debug-looking UI in user-facing views;
- no raw JSON, raw provider payloads, or raw transcript bodies;
- no mechanical fallback titles;
- no internal IDs except in support/admin diagnostics;
- no inconsistent terms for the same concept;
- no duplicate buttons with the same purpose;
- no dead buttons without state explanation;
- no placeholder sections pretending to work.

### B. Information Architecture

- top-level categories must be broad and stable;
- subcategories must narrow the category logically;
- filters must refine the selected subcategory, not duplicate navigation;
- category, subcategory, and filter may not repeat the same concept in three
  places;
- Rabbi/member-facing screens must hide super-admin/platform-support machinery;
- internal support/debug tools belong in a support drawer, not the normal Rabbi
  workflow;
- each page needs a clear title;
- each page needs a one-line purpose statement where useful;
- each page needs one obvious primary action or a clear reason why no action is
  available;
- pages must have empty, loading, error, blocked, and success states;
- navigation labels must match user mental models, not database names.

### C. Workflow Completeness

- a user can tell what state they are in;
- a user can tell what to do next;
- a user can tell which actions work now, which are preview-only, and which are
  blocked;
- blocked actions show owner, reason, and next action;
- preview-only actions clearly state that no production write occurred;
- no workflow ends in a silent failure;
- every important workflow has readback or visible confirmation.

### D. CRM Quality

- contacts are not loose cards only;
- contacts support list, search, and filter;
- selected contact has a detail panel or drawer;
- contact detail exposes logical tabs when enough data exists;
- contacts show lifecycle stage, last activity, source, linked
  communications, and linked class/access/payment status when relevant;
- contacts show tasks/decisions as compact linked widgets, not overwhelming
  blocks;
- contacts must not show unrelated BNA school, global, private, or super-admin
  records inside Rabbi scope.

### E. Pipeline Quality

- pipeline stages are visible and business-meaningful;
- default One Time stages may include `New Lead`, `Interested`,
  `Free Class / Trial`, `Paid Member`, `Inactive`, `Cancelled`, and
  `Refund / Dispute Review` only if needed;
- cards show name, contact method, stage, last activity, source, owner, and
  next action;
- card detail opens without losing context;
- moving a card is explicit, reversible, and audited;
- drag/drop may be added only if accessible fallback controls exist or are
  explicitly planned.

### F. Community Quality

One Time community is first-party, not an external CRM/forum runtime. It is a
class/community learning view:

- announcements;
- classes;
- class discussions/questions;
- library/resources;
- members/participants where appropriate;
- private questions to Rabbi;
- Rabbi-selected public question/answer posts;
- member/student portal view;
- parent portal view where applicable.

Students may respond privately to Rabbi. Students do not get public
student-to-student chat unless explicitly approved. Rabbi may post publicly and
choose which student responses/questions become public. Private student
responses remain private until selected/approved. Each class should have its
own discussion/question context. Portal views must not expose admin-only tools.

### G. Communications Quality

Email/communications UI must distinguish:

- draft;
- approved;
- sent;
- delivered;
- opened;
- clicked;
- failed;
- bounced;
- unsubscribed;
- blocked setup;
- preview only.

Email cards must show sender, recipients, subject, preview, date, status,
linked contact, workspace/project, and linked task/decision where relevant.

Bulk email UI requires recipient source/list clarity, unsubscribe/suppression
readiness, preview, test proof, and operator-approved real campaign packet
before any real campaign send. Rabbi-facing views must not show confusing
DNS/provider internals unless he needs to act. Platform setup details belong in
support/admin setup drawers.

### H. Stripe, Payment, And Access Quality

Stripe/payment setup and sandbox testing are later provider packets. The
protocol quality requirements are:

- sandbox first;
- product/price clarity;
- `$67/month` membership support as a captured assumption, not a charge;
- payment success maps to access grant only in an approved later packet;
- test records are clearly marked and reversible;
- receipts/invoices are emailed by the provider where configured;
- live billing/provider setup stays out of normal Rabbi UI unless action is
  required;
- refund/legal policy copy must not be invented by Codex and must become an
  owner/legal/business decision when missing.

Payment/access UI must show configured vs missing vs sandbox vs live clearly.

### I. Performance And Responsiveness

- first meaningful UI should load without obvious lag;
- avoid huge unstructured panels;
- lists should be searchable/filterable;
- detail panes should lazy-load heavy history when needed;
- mobile is not an afterthought;
- mobile 390px must be usable for every Rabbi/member-facing workflow;
- tablet 768px must be usable;
- desktop 1440px must look intentionally designed.

### J. Credibility

- no broken nav;
- no visible coming-soon clutter unless it is part of a clear setup path;
- no test/debug data in normal views unless explicitly test-prefixed;
- no weird fallback labels;
- no duplicate dashboards;
- no inconsistent project naming;
- no internal task/protocol noise in Rabbi-facing screens;
- every visible thing should help the user, be hidden, or be clearly marked as
  support-only.

## Vague Phrase Expansion Dictionary

### Clean

Means aligned layout, readable typography, consistent spacing, simple IA, no
redundant filters/nav, no internal/debug clutter, obvious next action,
consistent action states, mobile usability, and screenshot proof.

### Million-Dollar App

Means founder-demo-quality, polished visuals, no obvious unfinished UI,
complete core workflows, credible CRM/community/payment/communication surfaces,
fast navigation, logical IA, clear data, role-scoped views, external setup
hidden unless actionable, mobile/tablet/desktop proof, and deploy/live smoke.

### GHL-Like

Means first-party BNA Operations should adopt useful CRM patterns:

- list/detail contact layout;
- pipeline board;
- lifecycle stages;
- activity timeline;
- communication history;
- notes;
- tasks;
- appointments/classes;
- tags/source/status;
- quick actions;
- clean card detail drawer.

It does not mean add GHL runtime, LeadConnector runtime, GHL API tools, GHL env
vars, external CRM writes, or active GHL workflows. If the operator explicitly
reverses the no-GHL decision later, create a Decision first.

### Stripe-Like Dashboard

Means clear setup status, product/price/customer/payment/access state,
sandbox/live labeling, no confusing provider internals, actionable blockers,
audit/readback, and clean table/detail views.

### Notion-Like

Means logical page structure, clean sections, compact metadata, useful filters,
no clutter, progressive disclosure, and human-readable titles.

### Google Classroom-Like

Means classes, class posts, assignments/questions, private responses, teacher
moderation, resources, and a simple student portal.

### Kajabi/Circle-Like

Means member-facing class/community home, announcements, content library, class
discussions/questions, clear access state, polished portal presentation, and no
admin/debug leakage.

### Sloppy

Must compile into visual finding codes, not remain subjective: misaligned,
redundant, low contrast, broken hierarchy, duplicate controls, irrelevant
sections, leaked support/admin controls, hard-to-use filters, inconsistent
labels, unreadable mobile, unstructured cards, and unclear workflow.

### Working

Means the UI action performs expected first-party behavior or clearly says
preview/blocked, API/readback exists where needed, tests pass, state is visible
after action, errors are handled, action is registered, route is registered,
and role/scope is enforced.

### Configured

Means setup status is clear, missing provider values are named, unnecessary
provider noise is hidden from normal users, blockers have owner/next action,
and test/sandbox/live state is distinguished.

### Community

For One Time, means Rabbi/admin posts, class announcements, class sessions,
resources/library, private student responses/questions to Rabbi,
Rabbi-selected public posts/questions, member/student/parent portal views, and
no uncontrolled public student-to-student chat.

### CRM

For One Time, means contacts/parents/students/leads, lifecycle stage, pipeline,
contact detail, communication history, notes, tasks/decisions,
class/access/payment state, source and last activity, scoped to
`rabbi_sheller_provider` / `one_time_mishnah_class` unless explicitly global.

## Role/View Scope Compiler

Every UI/product ramble must classify screens by audience:

1. `PUBLIC_MARKETING`
2. `RABBI_PROVIDER_ADMIN`
3. `SHLOIMIE_PLATFORM_SUPPORT`
4. `MEMBER_PARENT_PORTAL`
5. `STUDENT_PORTAL`
6. `INTERNAL_AGENT_SUPPORT`
7. `PAYMENT_PROVIDER_SETUP`
8. `EMAIL_PROVIDER_SETUP`

Rules:

- Rabbi provider admin view must not show platform-wide admin machinery.
- Student portal must not show admin/provider/parent/private cross-student data.
- Parent portal must show only approved parent-visible data.
- Platform support diagnostics belong behind support drawer/role gate.
- Provider setup details should be hidden from ordinary Rabbi workflow unless
  Rabbi must take action.
- If a screen mixes view classes, split the requirements.

For Rabbi Sheller / One Time:

- `workspace_key`: `rabbi_sheller_provider`
- `project_key`: `one_time_mishnah_class`

Common modules:

- Overview
- CRM / Pipeline
- Contacts / Members
- Classes
- Community / Questions
- Content Library
- Communications
- Payments & Access
- Tasks / Decisions
- Settings
- Support Drawer

## IA Compiler Rules

Top-level categories answer "what area of the product am I in?", must be
stable, should fit cleanly in nav, and must not duplicate filters.

Subcategories answer "which part of this area?", must be more specific than the
top level, and must not repeat the same label with different wording.

Filters answer "which records inside this part?", belong near the list/grid/
board they filter, must not be mixed into global nav, must show current state,
and must clear/reset predictably.

For One Time service-provider cleanup:

Bad:

- Service Providers -> Rabbi Scheller -> One Time -> Provider -> Community ->
  Members -> Contacts where each level repeats scope.
- Horizontal rail containing both modules and filters.
- DNS/provider diagnostics inside Rabbi's normal dashboard.

Good:

- Workspace: Rabbi Sheller / One Time.
- Main nav: Overview, CRM, Classes, Community, Communications,
  Payments & Access, Tasks, Settings.
- Subnav inside CRM: Pipeline, Contacts, Segments, Import/Review.
- Filters inside Pipeline: Stage, Source, Last activity, Payment status.
- Support drawer: DNS, route/action registry, smoke evidence, provider setup
  diagnostics.

## Screenshot-First UI Loop

For any requirement involving clean UI, visual polish, layout, community UI,
CRM UI, portal UI, mobile cleanup, million-dollar quality, Rabbi-facing
screens, or member/student/parent-facing screens, the agent must:

1. identify routes and states;
2. capture before screenshots or document why before screenshots cannot be
   captured;
3. inspect screenshots against `ops/visual-quality-rubric.md`;
4. create findings with VQ codes;
5. map findings to REQ IDs;
6. implement fixes;
7. capture after screenshots;
8. run focused tests/smokes;
9. deploy/live-smoke if app-visible;
10. mark done only when after evidence shows the defect resolved or the blocker
    is exact.

Required viewport set unless irrelevant to the route:

- 1440 desktop;
- 1024 desktop/tablet;
- 768 tablet;
- 430 mobile;
- 390 mobile.

No screenshot means no "clean UI" done status unless the requirement is
explicitly blocked with the exact reason.

## Automatic Batch Compiler

For product/UI rambles, default batches are:

- Batch 0 - intake and source coverage;
- Batch 1 - current-state audit;
- Batch 2 - product spec;
- Batch 3 - implementation slice A, one screen/module only;
- Batch 4 - implementation slice B, next screen/module only;
- Batch 5 - data/API/readback if needed;
- Batch 6 - actions/automation states;
- Batch 7 - responsive/mobile;
- Batch 8 - visual defect closeout;
- Batch 9 - verification;
- Batch 10 - deploy/live smoke;
- Batch 11 - final handoff.

A batch should not include more than one major module unless it is audit/spec
only. External provider setup gets a separate provider packet. Email/Stripe
sandbox setup must not be mixed into visual UI cleanup. If implementation scope
expands, split the batch.

## Test Data And Sloppy-System Replacement

Agents may create test contacts/classes/payments only when the execution packet
explicitly allows test data, records are `TEST-` prefixed, metadata identifies
the test run, cleanup/readback exists, no external write or live charge/send
occurs unless separately approved, and production data is not hard-deleted.

When replacing sloppy UI/code:

- do not preserve broken duplicate UI just because it exists;
- remove or hide superseded controls/views when a better scoped replacement
  exists;
- update action/route registry accordingly;
- preserve data and audit evidence;
- do not hard-delete production data;
- archive/supersede protocol records only where required by existing policy;
- keep the normal user-facing UI uncluttered by historical artifacts.

## Email And Stripe As Late Provider Packets

Email/Resend and Stripe/payment setup are separate `PROVIDER_SETUP_PACKET`
work. They should not block visual/product-quality protocol work.

Email/Resend:

- can be a later provider setup packet;
- UI should show email readiness clearly;
- Rabbi-facing UI should not show DNS details unless Rabbi must act;
- bulk email requires recipient source/list clarity, unsubscribe/suppression
  readiness, preview, test send/readback, deliverability/status tracking where
  supported, and an operator-approved real campaign packet;
- this protocol never implies permission to send email.

Stripe/payment:

- can be a later provider setup packet;
- sandbox test comes before live payments;
- `$67/month` membership is a captured product assumption, not a charge;
- payment success/access grant mapping belongs in later implementation;
- Codex must not invent refund/legal policy copy;
- this protocol never implies permission to run Stripe.

## Design Reference Capture Gate

Any UI/product packet that mentions brand, colors, screenshots, photos, Replit
apps, website examples, or `make it look like this` must inspect existing
design-reference artifacts under `ops/design-references/` or create a precise
design-reference gap blocker before implementation.

Use `docs/DESIGN-REFERENCE-CAPTURE.md` for the required package shape. At
minimum, packets must record the source, workspace/project, authoritative brand
or component scope, extracted colors/tokens where available, current config
comparison, contradictions, and exact implementation target.

For current brand scope:

- Rabbi / One Time = black + yellow.
- BNA = cream + navy + teal/cyan.

Do not mix those palettes unless a later explicit design Decision says to do
so.

## Rabbi / One Time Examples

### Example 1

Operator says:

> Fix Rabbi Sheller's whole section. It's sloppy, redundant, and not a
> million-dollar app.

Compiler output:

- workspace: `rabbi_sheller_provider`;
- project: `one_time_mishnah_class`;
- view class: `RABBI_PROVIDER_ADMIN`;
- affected surfaces: Operations One Time overview, CRM/pipeline,
  contacts/members, community/classes/questions, communications,
  payments/access, settings/support drawer;
- likely defects: `VQ-IA-001`, `VQ-IA-004`, `VQ-LAYOUT-002`,
  `VQ-ACTION-003`, `VQ-DATA-008`, `VQ-RESP-006`;
- split packets: `00-control-tower`, `01-current-state-visual-audit`,
  `02-IA-and-nav-cleanup`, `03-CRM-pipeline`,
  `04-community-classes-questions`, `05-communications-readiness`,
  `06-payments-access-status`, `07-mobile-polish`,
  `08-verifier-deploy-closeout`.

### Example 2

Operator says:

> Make the CRM like GHL.

Compiler output: no GHL runtime. Implement first-party CRM patterns: pipeline
board, contact list/detail, stage filters, activity timeline, notes/tasks,
communication history, class/payment/access linkage, clean drawer/card UX,
mobile stacked flow, and screenshot proof.

### Example 3

Operator says:

> Community section.

Compiler output: One Time community/class view with announcements, classes,
class resources, private student responses/questions to Rabbi,
Rabbi-selected public Q&A, student portal view, parent portal view, admin
moderation, and no student-to-student public posting unless approved.
