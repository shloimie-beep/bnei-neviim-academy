# ADDENDUM — ONE TIME FIRST, OWNER-ACCOUNT LIVE TESTING,
# PROFESSIONAL PERFORMANCE ARCHITECTURE, AND MOBILE CRM IA

This addendum is part of the same BNA_GOAL_MODE_EXECUTION_PACKET.

It supersedes any conflicting language in the parent prompt concerning:

- a total prohibition on real test sends;
- simultaneous One Time and BNA feature implementation;
- treating cache-header work as sufficient performance completion;
- preserving the current CRM contact-detail layout merely because it already
  passes existing smoke tests.

Continue the existing active execution run. Do not create a competing active run.

## 1. New operator decisions

Record the following as an explicit correction/addendum with raw provenance.

### Decision A — One Time is the canonical implementation target now

The current priority is to finish the Rabbi Scheller / One Time Mishnayos
provider application properly before implementing equivalent feature parity in
BNA.

One Time is now the acceptance target for:

- product architecture;
- frontend architecture;
- CRM;
- contact workspace;
- communications;
- WhatsApp lead capture;
- email;
- private Rabbi agent;
- portals;
- performance;
- responsive layout;
- deployment;
- production verification.

Do not delay or complicate One Time implementation merely to build the same
feature in BNA during the same packet.

BNA requirements during this phase are limited to:

- no security or privacy regression;
- no broken shared APIs;
- no database migration regression;
- no cross-workspace data leakage;
- no accidental One Time branding or records in BNA;
- basic regression smoke when a genuinely shared runtime file changes.

Do not build new BNA UI parity in the current One Time packet.

Create a later, separate BNA adoption/migration packet after the One Time
implementation is stable, measured, deployed, and accepted.

Do not copy and paste One Time code back into BNA manually. Build One Time
first, identify stable reusable contracts, and extract shared modules that BNA
can deliberately adopt later.

### Decision B — Existing shared-CRM requirement needs a correction record

The current source of truth contains REQ-20260712-302, which expects BNA and One
Time to use the same shared CRM shell at the same time.

Do not erase or silently rewrite that historical requirement.

Create one correction Decision and either:

1. split it into:
   - One Time canonical CRM application — current P0;
   - shared domain/API contracts — current where useful;
   - BNA CRM frontend adoption — deferred follow-up;

or:

2. mark the original simultaneous-parity acceptance criterion superseded by this
   dated operator correction and create replacement requirements.

Preserve all existing implementation evidence.

### Decision C — Real owner-only testing is approved

This prompt is explicit operator authorization for bounded, reversible test
emails and test WhatsApp messages sent only to Shloimie-controlled personal test
accounts resolved from secure configuration.

This approval does not include:

- Rabbi Scheller’s personal account unless separately confirmed as an owner test
  destination;
- parents;
- students;
- leads;
- imported contacts;
- campaign lists;
- local-class lists;
- public auto-replies to arbitrary inbound contacts;
- payment or access messages;
- bulk sends.

The permission is for genuine system verification, not only dry runs.

## 2. Secure owner test-recipient policy

Resolve owner test destinations through existing approved configuration,
keyholder aliases, provider configuration, or Railway variables.

Do not:

- hardcode the email address or phone number in source;
- paste either value into a prompt;
- commit either value;
- expose full values in logs, screenshots, reports, task titles, GitHub issues,
  ledger entries, or changelog entries.

Evidence may contain only:

- `owner_test_email`;
- `owner_test_whatsapp`;
- masked destination;
- one-way fingerprint;
- provider message ID;
- test-run ID.

If an owner test alias is missing, create one precise blocker naming:

- missing alias or configuration field;
- expected secure location;
- owner;
- exact next action.

Continue all other tests rather than blocking the full run.

## 3. Owner-only live integration test matrix

Create a dedicated child packet:

`OWNER_ONLY_LIVE_INTEGRATION_TESTS`

This is a provider/testing packet, separate from public launch activation.

### 3.1 Email test

Use the existing guarded email smoke or the canonical equivalent.

Prefer the One Time identity and scope:

- identity: `one_time`;
- workspace: `rabbi_sheller_provider`;
- project: `one_time_mishnah_class`;
- provider: the actual configured One Time Resend account;
- recipient: secure owner-test email alias.

Use exact test-only copy:

Subject:

`[TEST] One Time system verification — <RUN_ID>`

Body:

`This is an automated One Time Mishnayos system test. No action is required. Test run: <RUN_ID>.`

Perform:

1. readiness check;
2. dry-run/preflight;
3. one actual provider send;
4. provider acceptance readback;
5. delivery/event readback where available;
6. CRM communication/timeline readback;
7. duplicate/idempotency check;
8. redacted evidence recording.

Use `scripts/smoke-email.mjs` or the current canonical guarded replacement rather
than creating an unregistered send path.

The test is not Done merely because Resend accepted the request. Record:

- sender profile;
- masked owner recipient;
- provider message ID;
- accepted/sent/delivered/failed status where available;
- CRM timeline result;
- external_send_performed;
- no campaign expansion;
- no second recipient.

### 3.2 WhatsApp test

Use the actual One Time-scoped WAPI/Whapi provider path.

Recipient:

- secure owner-test WhatsApp alias only.

Message:

`TEST — One Time system verification. No action is required. Run ID: <RUN_ID>.`

Perform the maximum safe portion of this sequence:

1. WAPI/Whapi account and scoped-token readiness;
2. sender-number and instance binding;
3. webhook-secret and destination binding;
4. owner-only send allowlist enforcement;
5. one outbound owner test message;
6. provider message-ID/status readback;
7. CRM contact resolution;
8. CRM conversation creation/reuse;
9. communication timeline readback;
10. no ordinary automatic task proof;
11. replay/idempotency proof;
12. inbound webhook proof using an existing provider test facility or existing
    owner-originated test communication;
13. bot-response proof to the owner account when a safe inbound test is
    available;
14. redacted evidence.

Do not use Shloimie’s live personal contact record to test destructive opt-out,
wrong-number, archive, suppression, or access-reset behavior. Test those states
with a reversible synthetic identity or transaction rollback.

### 3.3 Message limits

For one execution run:

- maximum three owner-test emails;
- maximum five owner-test WhatsApp messages;
- maximum one message per distinct test scenario;
- no repeated retry loop that can spam the owner;
- exponential backoff for provider retries;
- idempotency key required for every attempted send.

A provider timeout or uncertain response must cause readback before retry.

### 3.4 Test-mode gate

Do not enable unrestricted public live auto-reply simply to run owner tests.

Inspect the existing runtime gates, including:

- `ONE_TIME_WAPI_AUTO_REPLY_ENABLED`;
- `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM`;
- `ONE_TIME_PROVIDER_LEAD_BOT_MODE`;
- `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM`;
- scoped WAPI token;
- webhook secret;
- instance binding;
- destination-number binding.

Separate these capabilities:

1. inbound capture;
2. CRM persistence;
3. model-response generation;
4. owner-only live test send;
5. public WhatsApp auto-reply;
6. Telegram notification.

Inbound capture and CRM persistence must not depend on:

- hosted AI availability;
- Telegram approval;
- public auto-reply approval;
- class-link availability.

If the code currently couples WhatsApp owner testing or lead capture to Telegram
approval unnecessarily, create a scoped repair requirement. Preserve strong
gates for public sending.

If no owner-only test mode exists, implement one using existing configuration
conventions:

- secure recipient allowlist;
- test-run ID;
- rate limit;
- test-only message prefix;
- no raw recipient logging;
- hard rejection for non-allowlisted recipients;
- separate from public live mode.

This prompt authorizes activation of that owner-only test mode through the
approved secret-safe runtime configuration path. It does not authorize
unrestricted public live mode.

## 4. Professional One Time application architecture

Create a new architecture/performance child packet before more piecemeal lag
patches:

`ONE_TIME_FIRST_ARCHITECTURE_AND_PERFORMANCE`

### 4.1 Architecture decision record

Inspect the current live architecture and write an ADR using the repository’s
existing decision-log convention.

Compare at least:

A. Continue optimizing the generated shared Operations monolith.

B. Create a dedicated One Time frontend application/entrypoint in the same
repository, backed by shared domain services and APIs.

C. Move One Time into a fully separate repository/application.

Unless the current audit produces strong contrary evidence, choose B:

- one repository;
- one source-of-truth workflow;
- dedicated One Time frontend build and deployment artifact;
- shared backend/domain modules where genuinely reusable;
- separate One Time route bundles, theme, shell, and feature loading;
- BNA frontend adoption deferred.

Do not begin with a full rewrite.

Use an incremental strangler migration:

1. preserve the current live route and authentication contracts;
2. create a dedicated One Time application shell;
3. move one route/module at a time;
4. keep a temporary fallback to the old shell;
5. verify parity and performance;
6. switch the canonical route;
7. remove the fallback only after proof.

### 4.2 Critical architectural outcome

The One Time authenticated application must no longer require the giant shared
BNA Operations monolith on its critical startup path.

The dedicated One Time build must load only:

- One Time shell;
- active route module;
- active workspace data;
- shared primitives actually needed by the route.

It must not eagerly load:

- unrelated BNA views;
- unrelated provider views;
- every Operations renderer;
- all CRM panels;
- all contact-detail sections;
- all settings screens;
- Vimeo;
- large legacy review tables;
- inactive communication channels;
- BNA-only content.

Use real build-time module boundaries and route/feature code splitting.

Do not treat mechanically moving code from one 2 MB file into one 1 MB file plus
one 800 KB file as final architecture completion.

### 4.3 Shared-code policy

Keep these reusable where appropriate:

- workspace/tenant authorization;
- canonical CRM contact service;
- communication pipeline;
- data contracts and DTO schemas;
- API client;
- action registry contracts;
- route/security contracts;
- design tokens and accessible UI primitives;
- audit/telemetry contracts.

Keep these One Time-specific:

- One Time shell and navigation;
- black/yellow theme;
- Rabbi-facing information architecture;
- allowed actions;
- provider-specific communication agents;
- provider-specific portals;
- One Time route bundles;
- One Time launch behavior.

After One Time stabilizes, create a separate packet for BNA to adopt selected
shared modules. Do not make BNA adoption a blocker for One Time completion.

## 5. Root-cause performance engineering

The previous cache/compression work is evidence, but it is not a final answer to
the continuing lag complaint.

Do not assume the current bottleneck.

Measure and classify:

- Railway cold start;
- warm server response;
- HTML TTFB;
- static-asset delivery;
- JavaScript download size;
- JavaScript parse/compile/execute time;
- long tasks and main-thread blocking;
- DOM size;
- rerenders and mutations;
- API latency;
- database-query duration;
- database connection-pool wait;
- N+1 queries;
- missing indexes;
- oversized responses;
- eager data loading;
- third-party requests;
- service-worker behavior;
- memory/CPU pressure;
- error/retry loops.

### 5.1 Required instrumentation

Add privacy-safe instrumentation where absent:

- request ID;
- trace ID;
- `Server-Timing`;
- route duration;
- API handler duration;
- database duration;
- connection-pool wait;
- response bytes;
- error status;
- frontend route transition duration;
- Web Vitals/RUM without personal data;
- deploy SHA;
- target app;
- cold/warm classification where detectable.

Do not log raw contact data or message bodies.

### 5.2 Repeated baseline

For each key route, collect repeated cold and warm measurements rather than one
successful sample:

- public One Time landing;
- One Time login/provider entry;
- Operations overview;
- CRM list;
- selected contact detail;
- Conversations;
- Tasks;
- owner communication-agent test view.

Test:

- desktop;
- 1024/tablet;
- Android-sized 430;
- Android-sized 390;
- a realistic throttled mobile network/CPU profile;
- warm cache;
- cold cache.

Use enough samples to report p50, p75, p95, worst case, and failure rate.

### 5.3 Initial performance budgets

Treat these as required initial targets. Any deviation needs an ADR with measured
reasoning, not a silent threshold increase.

Public One Time:

- LCP p75 at or below 2.5 seconds;
- INP p75 at or below 200 ms;
- CLS at or below 0.1;
- warm HTML TTFB p95 at or below 500 ms;
- cold-start HTML TTFB p95 at or below 1.5 seconds;
- compressed initial JavaScript at or below 150 KB where practical;
- no helper/admin bundle on the public landing;
- no eager video player.

Authenticated One Time app:

- compressed initial app-shell JavaScript at or below 250 KB;
- no initial route chunk above 200 KB compressed without a recorded exception;
- active feature loaded on demand;
- CRM list API p95 at or below 500 ms for a 50-contact page;
- contact aggregate/detail API p95 at or below 500 ms for normal live data;
- initial CRM page renders no more than 50 contact cards;
- no root-app rerender when selecting a contact;
- no unbounded list or timeline response;
- no repeated main-thread task above 200 ms;
- no horizontal overflow at 390 px;
- no blocking third-party request on initial navigation.

### 5.4 Database and API requirements

For slow CRM endpoints:

- capture `EXPLAIN ANALYZE` or the safe equivalent;
- check indexes for workspace, project, contact identity, conversation, task,
  timeline, attendance, membership, consent, suppression, and source joins;
- eliminate N+1 lookup patterns;
- enforce pagination and response limits;
- avoid browser-side union of independent datasets;
- use stable `contact_key`;
- return tab-specific DTOs;
- cache only safe read models;
- invalidate cache deterministically after writes;
- measure pool wait and query duration separately.

Do not hide slow queries by increasing client timeouts.

### 5.5 Permanent regression prevention

Add performance gates to CI or the repository’s release gate:

- bundle-size budgets;
- route-chunk budgets;
- repeated Playwright performance smoke;
- CRM request/render limits;
- API response-size limits;
- Web Vitals thresholds;
- no eager Vimeo/player request;
- compression/cache header checks;
- p95 live readback after deploy.

A later commit that exceeds a budget must fail verification or produce an
explicit reviewed exception.

Create a small production performance dashboard/report showing:

- current deploy SHA;
- key-route p50/p75/p95;
- frontend errors;
- API errors;
- slowest endpoints;
- slowest database operations;
- bundle sizes;
- recent regressions.

## 6. One Time-first deployment policy

During this phase:

- feature development and visual acceptance happen against One Time;
- One Time receives the new dedicated frontend artifact;
- BNA does not need simultaneous visual or feature parity;
- shared backend changes still require BNA security/scope regression checks;
- deploy BNA only when a shared runtime change actually requires it;
- do not deploy a One Time-only frontend artifact to BNA;
- do not claim One Time Done because BNA also received the same old shell.

The final One Time deployment must prove:

- exact tested SHA;
- exact One Time target;
- no BNA assets loaded unnecessarily;
- performance budgets;
- mobile CRM behavior;
- owner-only communication tests;
- privacy and workspace isolation;
- rollback path.

## 7. CRM contact-workspace information architecture

Create a focused Product Quality packet for the CRM workspace before broad UI
edits.

The current contact card must stop rendering every section and action as one
long automatically open page.

### 7.1 Mobile state model

At 390 px and 430 px, CRM uses three clear states:

1. Contact list
2. Contact detail
3. Contact subview/action flow

Selecting a contact opens a full-screen contact-detail state.

The contact-detail top area must include:

- clear Back to contacts control;
- contact name;
- concise lifecycle/status indicator;
- no more than two high-frequency primary actions;
- one More actions overflow button.

Below that, use a sticky, horizontally scrollable section rail.

Recommended contact sections:

- Overview
- Activity
- Conversations
- Notes
- Tasks
- Family
- Access
- More

`More` may contain lower-frequency sections such as:

- Identity
- class activity;
- communication preferences;
- consent/suppression;
- membership;
- technical details available only to authorized roles.

Use actual product needs from the current-state audit; do not add empty tabs for
appearance.

### 7.2 Section behavior

Only one primary section is visible at a time.

Do not:

- render all section bodies expanded;
- mount every form at startup;
- fetch all tab data at startup;
- leave multiple editing forms open;
- scatter duplicate actions throughout the detail page.

Each section:

- has its own loading, empty, populated, error, and permission-denied state;
- lazy-loads its data on first open;
- preserves data after first load where safe;
- has a clear section heading;
- exposes only actions relevant to that section;
- updates URL state;
- supports direct-link and browser Back behavior.

Preserve:

- selected contact;
- active tab;
- contact-list search;
- filters;
- sort;
- list scroll position.

Back to contacts must return the operator to the same list position and filter
state.

### 7.3 Dense-action rule across the application

Apply this rule to CRM and other dense One Time screens:

- more than four peer actions: keep one or two primary actions and move the rest
  into a contextual overflow menu or bottom sheet;
- more than three persistent filters: show a Filters action with active-filter
  count and open a drawer/sheet;
- more than five distinct content groups: use tabs/subroutes;
- editing a substantial object: open a dedicated subview, drawer, dialog, or
  route rather than expanding another long inline form;
- destructive actions: keep out of the primary toolbar;
- disabled actions: show an exact reason;
- no action may exist in multiple scattered places without a documented reason.

### 7.4 Android/mobile pattern

For Android-sized layouts use:

- sticky top app bar;
- explicit Back button;
- horizontally scrollable tabs with visible selected state;
- optional bottom sheet for overflow actions and filters;
- 44 px minimum touch targets;
- clear hierarchy text;
- no side toolbar as the only navigation;
- no gesture-only navigation;
- no nested horizontal page overflow;
- no clipped action labels.

The section tab rail may scroll horizontally. The page itself must not overflow
horizontally.

### 7.5 Desktop/tablet pattern

Desktop may keep an efficient split layout, but the selected contact still uses
the same section model.

Recommended structure:

- contact list on the left;
- focused selected-contact workspace in the main area;
- optional inspector/support drawer only when requested;
- sticky contact header and section rail;
- one active detail section;
- no always-open wall of cards and forms.

Tablet may collapse from split view to list/detail navigation based on measured
space, not merely device name.

### 7.6 CRM URL and accessibility contract

Add or preserve stable URL state for:

- selected contact;
- active section;
- search;
- type;
- lifecycle/status;
- source;
- tag;
- sort;
- list scroll.

Use semantic tab patterns where tabs are appropriate:

- `role=tablist`;
- `role=tab`;
- `aria-selected`;
- associated tab panel;
- keyboard arrow navigation on desktop;
- visible focus state;
- screen-reader-readable contact and section names.

Do not use inaccessible generic div click handlers.

### 7.7 CRM visual and behavior proof

Capture:

- 1440;
- 1024;
- 768;
- 430;
- 390.

Prove:

- list state;
- detail Overview;
- Activity;
- Conversations;
- Notes;
- Tasks;
- Family/Access;
- overflow action menu;
- filter sheet;
- Back-state restoration;
- long contact name;
- no phone/email;
- empty contact;
- many notes/tasks/conversations;
- loading;
- error;
- permission denied;
- read-only mode.

Measure:

- initial requests;
- tab-specific requests;
- DOM nodes;
- long tasks;
- root rerenders;
- horizontal overflow;
- tap-target sizes;
- list-scroll restoration.

## 8. Required packet additions

Add these packets to the existing parent DAG before final release. Preserve
stable packet IDs and existing completed evidence.

### ONE_TIME_FIRST_CONTROL_CORRECTION

- register this raw addendum;
- record the conflict with simultaneous BNA parity;
- update or supersede requirement acceptance criteria;
- freeze One Time-first scope.

### OWNER_ONLY_LIVE_INTEGRATION_TESTS

- guarded email;
- guarded WhatsApp;
- provider readback;
- CRM readback;
- idempotency;
- no ordinary tasks;
- redacted evidence.

### ONE_TIME_ARCHITECTURE_AND_PERFORMANCE_BASELINE

- ADR;
- route/surface map;
- cold/warm repeated measurements;
- frontend/server/database root-cause classification;
- target budgets;
- migration plan.

### ONE_TIME_DEDICATED_APP_SHELL

- incremental dedicated One Time frontend;
- route-level modules;
- shared API/domain packages;
- old-shell fallback;
- exact performance proof.

### MOBILE_CRM_INFORMATION_ARCHITECTURE

- current-state visual audit;
- validated Product Quality packet;
- list/detail/subview state;
- contextual toolbar;
- scrollable section rail;
- overflow actions;
- lazy section data;
- responsive screenshots.

### PERFORMANCE_AND_INTEGRATION_VERIFIER

Independent verification must:

- rerun owner-test readbacks without duplicating sends;
- verify provider message IDs;
- verify recipient allowlist;
- verify no non-owner recipient;
- verify exact tested/deployed SHA;
- verify bundle budgets;
- verify live route performance;
- verify mobile CRM screenshots and behavior;
- verify BNA privacy/regression safety;
- verify One Time is not loading unrelated BNA bundles.

## 9. Updated completion rule

Do not call the lag problem fixed merely because:

- one sample passed;
- cache headers exist;
- Brotli works;
- the shell is under the old 1.2 MB threshold;
- a deferred bundle was created;
- Railway health is green;
- the page eventually loads.

The lag requirement is Done only when:

1. root cause is recorded;
2. architecture decision is recorded;
3. One Time critical path is measurably smaller;
4. repeated cold/warm tests meet budgets;
5. relevant API/database budgets pass;
6. mobile CRM navigation is responsive;
7. production instrumentation exists;
8. CI/release regression gates exist;
9. exact deployed SHA passes live tests;
10. evidence is linked in the execution run.

## 10. Updated final report

Add these sections to the required final report.

### Owner-account test results

For each email and WhatsApp scenario:

- test-run ID;
- channel;
- secure recipient label;
- masked destination;
- provider;
- provider message ID;
- send status;
- delivery/readback status;
- CRM contact/conversation/timeline result;
- external send count;
- duplicate prevention result;
- blocker if incomplete.

### One Time architecture

- chosen architecture;
- alternatives rejected;
- old critical path;
- new critical path;
- shared packages/contracts;
- One Time-specific modules;
- BNA adoption status;
- rollback path.

### Performance

- baseline p50/p75/p95;
- post-change p50/p75/p95;
- cold and warm TTFB;
- LCP/INP/CLS;
- initial compressed JavaScript;
- route chunks;
- request count;
- DOM nodes;
- long tasks;
- API timings;
- database timings;
- pool wait;
- bundle-budget result;
- regression-gate result;
- live deploy SHA.

### CRM mobile IA

- list/detail/subview proof;
- sticky header;
- section rail;
- one active section;
- overflow actions;
- filter sheet;
- Back-state restoration;
- lazy data-loading proof;
- 390/430 screenshots;
- accessibility proof.

Continue through the next unblocked packet automatically. Do not stop after
writing the ADR, audit, or test plan.