# Status

Status as of 2026-06-23T20:58:00+03:00.

All One Time master-completion executable batches are done through their
required verification level. `REQ-20260619-313` remains a terminal
`needs_operator_decision` item for separate One Time paid infrastructure,
ownership, and DNS. The Telegram plus website-assistant addendum requirements
are now appended to this same execution run, as requested, without creating a
second execution run or duplicate control-plane systems. The next unblocked
batch should be `REQ-20260623-011`.

<!-- batch-2:start -->
## Batch 2 - Master Backlog Reconciliation

Status: done / verified local

Updated `ops/one-time-mishnah/master-backlog-reconciliation.md` and `ops/one-time-mishnah/master-backlog-reconciliation.json` for the June 21 active run. No visible Task fan-out, production mutation, external write, or app runtime change was performed.

Next unblocked batch after verification: `REQ-20260619-302` production Task and Decision cleanup.
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 - Production Task And Decision Cleanup

Status: done / deployed / verified live

Created the live production Task/Decision census and reversible cleanup tooling.
Applied only reversible production changes through existing authenticated task
APIs: One Time task re-scopes, one internal handoff quarantine, and
non-private duplicate fan-out archive actions. No hard deletes and no
parent/student/payment/communication records were mutated.

Final post-cleanup census:

- Tasks seen: 864
- Lane counts: Decisions 16, Blocked 14, Tasks 406, Calendar 18, Codex Queue 6, Completed/Activity 404
- Duplicate groups remaining in dry-run plan: 12
- Workspace isolation: 0 BNA records in One Time, 0 One Time records in BNA

The Operations UI/server changes for default Task and Decision views are
deployed in Railway deployment `89967278-38dc-49f3-a70d-4536c59f82f6` at
commit `f8a2fd62` and verified by standard plus focused live smokes.

Next unblocked batch: `REQ-20260619-303` workspace users and roles.
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 - Workspace Users, Roles, And Control-Plane Scope

Status: done / deployed / verified live

Added a shared assistant/control-plane scope policy module at
`src/platform/assistant/control-plane.js` and test coverage at
`tests/universal-control-plane-scope-policy.test.js`. This does not replace
the existing action registry, helper permission system, or One Time role model;
it gives Telegram and website assistant adapters one common policy shape for
channel normalization, actor role normalization, workspace/project scope,
linked-child/student scope, action-category allowlists, preview requirements,
approval requirements, and the rule that typed actions are required instead of
browser-click substitution.

Focused verification passed for the new policy, existing One Time role model,
scoped helper permissions, workspace RBAC isolation, universal assistant MVP
contracts, Operations task-lane label contracts, and the full local Node test
suite.

To avoid the dirty active worktree, Batch 4 was isolated in clean worktree
`C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane` on
branch `codex/one-time-batch4-control-plane-20260623`. Commit `bcb0e153` was
pushed and draft PR #13 was opened. The clean branch passed `npm test`
1069/1069, was deployed to Railway deployment
`641ac75e-d6d7-4379-a27c-4f7a4d9d3dbf`, and was verified by standard plus
focused live smokes.

Next unblocked batch after Batch 4: `REQ-20260621-502` visible action registry
and dead-button coverage.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 - Visible Action Registry And Dead-Button Coverage

Status: done / deployed / verified live

Added a generated One Time action-coverage gate that preserves the existing
action registry as the canonical source. The report now verifies legacy One
Time product controls plus registry-backed Operations controls, checks that
annotated UI controls have registry rows, and requires external/app-visible
write controls to remain covered by preview, confirmation, or approval gates.

Annotated the relevant Operations controls in `public/operations.html` with
canonical `data-action-id` values for helper open, One Time workspace view,
automation helper, member-library smoke/package/preview/approve/publish/
rollback, Drive brief preview, live Zoom dry-run/send, and parent access
setup actions. Added the matching registry rows in `ops/action-registry.json`
without creating a second registry or executing external sends/publishes.

The clean PR branch `codex/one-time-batch4-control-plane-20260623` now includes
Batch 5 commit `e22bd90d`. It passed the full clean Node test suite, was
deployed to Railway deployment `c93a9311-4eb0-4982-8c14-b5f7a9cd5c8e`, and was
verified by standard plus focused live smokes.

Next unblocked batch after Batch 5: `REQ-20260619-304` Operations UI/design.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 - Operations UI And Design-System Correction

Status: done / deployed / verified live

Polished the clean One Time Operations UI path on PR #13. The desktop shell now
keeps one module sidebar, one current-module top filter rail, and a full-width
non-wrapping status strip inside the topbar. The filter rail remains
horizontally scrollable on mobile and avoids page-level overflow.

Replaced two raw-JSON presentation spots with productized UI: automation
permissions now render and edit as readable key/value rules while still
accepting legacy JSON paste for advanced repair, and identity merge reviews now
show labeled signal/detail cards instead of a raw JSON `<pre>`.

The credential-free One Time UI design delta audit now passes without requiring
operator login storage for this batch, while still documenting that the full
authenticated crawl was skipped. Local screenshot evidence was refreshed for
desktop and mobile, the clean full test suite passed, and the deployed bundle
was verified by standard, authenticated taxonomy, and focused Batch 6 live
smokes.

Next unblocked batch after Batch 6: `REQ-20260619-305` first-party
communications parent requirement, covering `REQ-20260621-503` WhatsApp UX
and `REQ-20260621-504` Email/Resend UX.
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 - First-Party Communications

Status: done / deployed / verified live

Closed `REQ-20260619-305` plus child requirements `REQ-20260621-503` and
`REQ-20260621-504` using the already-deployed PR #13 clean branch at commit
`2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The WhatsApp workspace is deployed with the required three-pane desktop
layout, sequential mobile navigation, workspace-scoped WAPI/Whapi readback,
hidden raw provider payloads by default, related notes/work visibility, and
disabled no-send guardrails.

The Email/Resend workspace is deployed with draft-only editing, reply-to and
template metadata, locked send controls, provider/sender/domain readiness
separation, readable domain/status and webhook-event readback, mocked webhook
verification/storage coverage, and the existing sender/domain Decision
remaining open for real outbound email readiness.

Live verification passed for WhatsApp UX, Email/Resend UX, and communications
screening. No WhatsApp message, email, external CRM write, DNS mutation,
account change, billing action, real WAPI outbound action, or Resend production
send was performed.

Next unblocked batch after Batch 7: run `npm run bna:run:next`.
<!-- batch-7:end -->

<!-- batch-9:start -->
## Batch 9 - Product, Scheduling, Booking, Portals, And Billing

Status: done / deployed / verified live

Closed `REQ-20260619-306` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The One Time product foundations are deployed with draft/decision-pending
offers, no guessed final pricing entitlements, schedule and availability
readback, internal class-event creation, internal appointment-intent creation,
parent/student/provider portal foundation readback, payment/access/class-link
guardrails, and shared review surfaces across public, provider, parent,
student, classroom, email, and Operations views.

Live verification created only internal One Time class-event and
appointment-intent records. No live payment, checkout, payment link, charge,
invoice, subscription, access grant, email, WhatsApp, external CRM write, DNS
mutation, real Zoom meeting/registrant/join-link mutation, upload, or external
calendar write was performed.

Next unblocked batch after Batch 9: `REQ-20260619-307` Zoom meeting and
attendance foundation.
<!-- batch-9:end -->

<!-- batch-12:start -->
## Batch 12 - Zoom Meeting And Attendance Foundation

Status: done / deployed / verified live

Closed `REQ-20260619-307` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The deployed Zoom foundation has token-cache and API-client scaffolding,
meeting and registrant request builders with secure defaults, webhook
signature/replay/idempotency protections, attendance reconciliation that does
not treat dashboard clicks as attendance, review-only attendance correction
drafts, protected preview endpoints, and an Operations Live Classes readiness
panel.

Production verification passed through the Zoom attendance live smoke. It read
the deployed Zoom status and preview endpoints, confirmed real meeting
creation is blocked, and verified the Operations readiness panel at 1440px and
390px. No Zoom meeting, registrant, webhook attendance write, attendance
correction, recording read, transcript read, summary read, external send,
portal publish, participant invite, host start URL exposure, or raw Zoom join
URL exposure was performed.

Next unblocked batch after Batch 12: `REQ-20260619-308` Vimeo, member-library,
recording, transcript, and publication pipeline.
<!-- batch-12:end -->

<!-- batch-11-13:start -->
## Batch 11/13 - Vimeo, Member Library, Recording, Transcript, And Publication

Status: done / deployed / verified live

Closed `REQ-20260619-308` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The deployed pipeline supports manual Vimeo URL validation, class package
metadata, source-sheet asset attachment, package previews, member previews,
approval-gated first-party member-library publish, rollback/archive, recording
pipeline preview, transcript/summary readiness, retention preview, and
Operations/member-library UI. Automated Vimeo upload remains disabled behind
the setup feature flag, and recordings do not publish directly from webhooks.

Production verification passed through the Vimeo/member-library live smoke. It
created a temporary internal One Time class package, attached an approved
asset, previewed the package, approved it with the explicit approval phrase,
published a smoke-scoped member-library item, rolled the item back, ran the
library smoke endpoint, archived the temporary class, and checked Operations
and member-library UI at 1440px and 390px.

No Vimeo upload, provider publish/unpublish/delete, email, WhatsApp, payment,
Zoom meeting, participant invite, real member access grant, external portal
write, DNS change, or duplicate connector/action system was created.

Next unblocked batch after Batch 11/13: `REQ-20260619-309` transcript privacy.
<!-- batch-11-13:end -->

<!-- batch-14:start -->
## Batch 14 - Transcript Privacy And Knowledge Scoping

Status: done / deployed / verified live

Closed `REQ-20260619-309` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The deployed transcript privacy layer models transcript versions, timestamped
segments, speaker confidence, match methods and confidence thresholds,
privacy classes, manual-review requirements for uncertain/guessed identity,
parent-visible reviewed feedback requirements, student/parent/staff retrieval
boundaries, and public-helper safe retrieval rules. Member-safe classroom
payloads blank raw transcript text, notes, and segments.

Production verification passed through the read-only transcript privacy live
smoke. It checked the protected readiness API, confirmed the response is
body-free and no-write, verified project/workspace scope, confirmed raw public
RAG/cross-student/guessed-speaker gates are disabled, and verified the
Operations readiness panel marker and guardrail text.

No transcript content write, student record write, public-helper corpus write,
portal data write, raw transcript body, staff-private note, cross-student
private segment, send, charge, Zoom/Vimeo/Google/DNS mutation, external CRM/GHL
write, or secret exposure was performed.

Next unblocked batch after Batch 14: `REQ-20260619-310` server-side
gamification and badge auditing.
<!-- batch-14:end -->

<!-- batch-15:start -->
## Batch 15 - Gamification And Badge Auditing

Status: done / deployed / verified live

Closed `REQ-20260619-310` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The deployed gamification layer has server-side event types, automatic badge
definitions, Rabbi-awarded badge definitions, threshold/idempotency helpers,
award/reversal draft models, audit-event schema, parent-safe explanations,
Operations readiness UI, and classroom/member-safe participation display
without a ranked public individual leaderboard.

Production verification passed through the read-only gamification live smoke.
It checked the badge readiness API, confirmed 11 automatic badges and 6
Rabbi-awarded badges, verified the readiness route does not write awards or
reversals, verified public leaderboard/access-grant gates are disabled, and
confirmed the Operations badge panel marker and guardrail text.

No gamification event creation, badge award, badge reversal, notification,
access grant, prize/credit change, public individual leaderboard,
negative-point action, external CRM/GHL write, send, charge,
Zoom/Vimeo/Google/DNS mutation, or secret exposure was performed.

Next unblocked batch after Batch 15: `REQ-20260619-311` community.
<!-- batch-15:end -->

<!-- batch-16:start -->
## Batch 16 - Community And Moderation Workflow

Status: done / deployed / verified live

Closed `REQ-20260619-311` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db` and Railway deployment
`e9949680-4330-454c-9b1c-b61dce2d475b`.

The deployed community/moderation layer has private-first classroom replies,
Rabbi/admin announcements, moderated cohort discussion readiness, private
questions, parent-visible safety holds, staff-only notes, report/flag flow,
edit/delete history, private-to-public anonymization previews, linked original
and published version metadata, and no unrestricted student-to-student
messaging.

Production verification passed through the read-only community live smoke. It
checked the community moderation readiness API, confirmed raw private message
text is not returned, verified unrestricted student messaging and publication
write gates are disabled, verified the private-to-public workflow has six
steps, and confirmed the Operations community panel marker and guardrail text.

No thread creation, message creation, approval, public post, parent-visible
message, staff note, notification, delete/purge action, unrestricted
student-to-student messaging, unreviewed publication, public promotion write,
external notification, send, charge, Zoom/Vimeo/Google/DNS mutation, external
CRM/GHL write, or secret exposure was performed.

Next unblocked batch after Batch 16: `REQ-20260619-312` Sefaria and scoped
study assistant readiness.
<!-- batch-16:end -->

<!-- batch-17:start -->
## Batch 17 - Sefaria And Study Assistant Readiness

Status: done / deployed / verified live

Closed `REQ-20260619-312` using the already-deployed PR #13 clean branch at
commit `2291d03a47ab0d9ec39b78561bc8e41361d959db`.

Verified scope:

- approved source-version metadata and content hashing without returning source
  bodies;
- scoped retrieval preview that blocks restricted, raw, and cross-student
  sources;
- licensing, citation, transcript privacy, Rabbi approval, and audit-release
  gates;
- disabled study-assistant feature flag and no unrestricted AI chat;
- protected no-write readiness API and Operations readiness panel.

Verification:

- `node --check src/lib/bna/study-assistant-readiness.js`
- `node --check scripts/smoke-one-time-study-assistant-live.mjs`
- `node --test tests/one-time-study-assistant-readiness.test.js tests/one-time-transcript-privacy.test.js tests/public-helper-context.test.js tests/public-helper-privacy.test.js tests/provider-classroom-local-contract.test.js tests/parent-student-portal-contract.test.js tests/one-time-community-moderation-workflow.test.js`
  passed 47/47.
- `npm run railway:doctor` passed for deployment
  `e9949680-4330-454c-9b1c-b61dce2d475b`.
- `node scripts/smoke-one-time-study-assistant-live.mjs` passed and wrote
  `ops/live-smokes/2026-06-23T17-48-36-925Z-one-time-study-assistant-live-smoke.md`.

Live smoke result:

- readiness API status `implemented_read_only`;
- 10 source-version metadata records seen;
- 0 assistant-ready sources;
- Operations study-assistant panel marker and guardrails shipped.

No Sefaria/API ingestion, source corpus mutation, portal publishing, answer
generation, chat session creation, arbitrary version ingestion, arbitrary
translation merge, raw transcript retrieval, raw source body return,
cross-student retrieval, external send, charge, Zoom/Vimeo/Google/DNS mutation,
external CRM/GHL write, or secret exposure was performed.

Next unblocked batch after Batch 17: `REQ-20260619-314` final verification and
release. `REQ-20260619-313` remains `needs_operator_decision` for separate
paid infrastructure, ownership, and DNS.
<!-- batch-17:end -->

<!-- batch-19:start -->
## Batch 19 - Final Verification And Release

Status: done / deployed / verified live

Closed `REQ-20260619-314` using the clean PR #13 branch at commit
`2291d03a47ab0d9ec39b78561bc8e41361d959db`.

Final verification:

- clean worktree on `codex/one-time-batch4-control-plane-20260623`;
- remote branch `refs/heads/codex/one-time-batch4-control-plane-20260623`
  resolves to `2291d03a47ab0d9ec39b78561bc8e41361d959db`;
- `npm test` passed 1071/1071 in the clean worktree;
- `npm run secrets:audit` passed with 4100 tracked paths checked and 0 tracked
  secret-risk files;
- `npm run watchdog:actions` passed with severity `ok` and 0 findings;
- `npm run railway:doctor` passed for deployment
  `e9949680-4330-454c-9b1c-b61dce2d475b`;
- `npm run app:smoke` passed and wrote
  `ops/live-smokes/2026-06-23T17-55-00-705Z-live-app-smoke.md`;
- `npm run app:smoke:final-register-surfaces` passed and wrote
  `ops/live-smokes/2026-06-23T17-55-27-727Z-final-register-surfaces-live-smoke.md`;
- `npm run app:smoke:operations-workspace-taxonomy` passed and wrote
  `ops/live-smokes/2026-06-23T17-55-27-745Z-operations-workspace-taxonomy-live-smoke.md`.

Final live smoke proof:

- standard smoke covered public health, Operations login/session, protected
  reads, Torah public/admin scoping, task create/comment/delete, signup
  dry-run, Buffer diagnostics, and Drive website image lane;
- final-register smoke covered provider public/portal routes, Operations
  internal-first markers, helper tools, recording intake dry-run provenance,
  calendar readback, and automation readback;
- workspace taxonomy smoke confirmed canonical categories `Super Admin`,
  `School`, `Service Provider`, and `Family`, 4 workspaces, no duplicate keys,
  and no stale visible terms.

No live external send, billing charge, DNS mutation, real Zoom meeting
creation, real Vimeo upload/publication, hard delete, live badge award/reversal
write, prize/credit issuance, access grant, public leaderboard exposure,
unreviewed community publication, unrestricted student messaging, transcript
publication, vector corpus mutation, Sefaria/API ingestion, answer generation,
separate One Time infrastructure provisioning, PR merge, external CRM/GHL
write, or secret exposure was performed.

All active-run requirements are now terminal: done, already terminal, or
needs-operator-decision. Continue queued `RAW-20260623-005` Telegram plus
website-assistant control-plane addendum work only by reusing the shared
intake/action/permission/approval/agent systems already recorded in this run.
<!-- batch-19:end -->

<!-- addendum-activation:start -->
## Issue #7 Addendum Activation

Status: active in the same execution run

Appended `REQ-20260623-010` through `REQ-20260623-026` from
`tasks-pending/2026-06-23-telegram-website-control-plane-addendum.md` into
this execution run after the One Time master-completion batches reached
terminal status.

Guardrails:

- no second execution run;
- no duplicate Telegram architecture;
- no separate website-bot action system;
- no duplicate action registry;
- no duplicate intake pipeline;
- no duplicate agent queue;
- no duplicate provider onboarding system;
- no browser-click substitution for typed actions.

Next unblocked batch: `REQ-20260623-011` shared assistant control-plane
contract.
<!-- addendum-activation:end -->

<!-- addendum-req-011:start -->
## REQ-20260623-011 - Shared Assistant Control-Plane Contract

Status: done / verified local

Implemented the addendum's shared assistant contract without creating duplicate
systems:

- `docs/architecture/telegram-control-plane.md` defines Telegram, website
  assistant, Operations helper, provider portal assistant, parent portal
  assistant, student portal assistant, and future approved channels as adapters
  over one canonical control plane.
- `src/platform/assistant/control-plane.js` now exports
  `CONTROL_PLANE_CONTRACT`, `SHARED_CONTROL_PLANE_LAYERS`,
  `ADAPTER_ONLY_RESPONSIBILITIES`, and `FORBIDDEN_DUPLICATE_SYSTEMS`.
- `tests/universal-control-plane-scope-policy.test.js` locks the required
  shared layers, adapter-only transport responsibilities, Service Provider
  Studio requirement, typed-action rule, and browser-click-substitution ban.

Verification:

- `node --check src/platform/assistant/control-plane.js`
- `node --test tests/universal-control-plane-scope-policy.test.js` passed 8/8.

No deploy/live smoke is required for this documentation and local contract
batch. App-visible/server-visible follow-up begins at `REQ-20260623-012`.
<!-- addendum-req-011:end -->

<!-- addendum-req-012:start -->
## REQ-20260623-012 - Shared Assistant Data Model

Status: done / deployed / live-smoked

Implemented the addendum's shared assistant data model as one canonical schema
for Telegram, website assistant, Operations helper, provider/parent/student
assistants where enabled, and future approved channels:

- `src/platform/assistant/control-plane.js` exports
  `ASSISTANT_DATA_MODEL_TABLES` with the 18 canonical assistant tables.
- `server.js` bootstraps idempotent `assistant_*` tables for channels,
  identities, conversations, messages, context objects, action plans/runs,
  previews, approvals, drafts/versions, templates, saved views, reminders,
  notifications, onboarding sessions, delivery outbox, and dead letters.
- `server.js` exposes authenticated read-only
  `/api/bna/assistant/control-plane/readiness` for schema/index readiness only.
- `ops/route-registry.json` records the readiness endpoint as a private
  Operations API surface with no-write/no-secret expectations.

Verification:

- Clean branch syntax checks passed for `server.js` and
  `src/platform/assistant/control-plane.js`.
- Clean branch assistant/control-plane suite passed 49/49.
- Main workspace focused suite passed 13/13.
- Railway deployment `04756fab-bd9c-4f6b-869a-39668f64c419` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T18-25-13-013Z-live-app-smoke.md`.
- Assistant readiness live smoke passed:
  `ops/live-smokes/2026-06-23T18-26-39-444Z-assistant-control-plane-readiness-live-smoke.md`
  with 18/18 tables and 17/17 indexes present.

No assistant rows, external sends, publish actions, charges, DNS changes,
OAuth actions, connector calls, secret values, or row payloads were returned or
mutated by the readiness smoke.
<!-- addendum-req-012:end -->

<!-- addendum-req-013:start -->
## REQ-20260623-013 - Single Action Parity Source

Status: done / deployed / live-smoked

Implemented the universal action parity gate by extending the existing action
registry/watchdog system instead of creating another action registry:

- `scripts/generate-universal-action-parity.mjs` reads the root action
  registry, detailed typed action registry, and visible UI action hooks.
- `ops/action-registry/universal-action-parity.json` and `.md` classify UI
  buttons, Telegram requests, website assistant requests, Operations helper
  requests, automation actions, and Agent Work handoffs from the same canonical
  sources.
- `tests/watchdog-action-registry.test.js` now fails if the universal parity
  artifact is stale or if visible controls have missing contracts, handlers,
  tests, or risky unapproved actions.
- `ops/action-registry/one-time-action-coverage.*` was refreshed from the same
  source hashes.

Clean PR branch parity counts:

- Registry rows: 133
- Visible controls: 22
- Classified visible controls: 22/22
- Missing contracts: 0
- Missing handlers: 0
- Missing tests: 0
- Risky actions without approval: 0
- Telegram request parity rows: 75
- Website assistant parity rows: 133
- Operations helper parity rows: 126
- Automation parity rows: 69
- Agent Work handoff parity rows: 75

Verification:

- Clean branch `node --check scripts/generate-universal-action-parity.mjs`.
- Clean branch `node scripts/generate-one-time-action-coverage.mjs`.
- Clean branch `node scripts/generate-universal-action-parity.mjs`.
- Clean branch `node --test tests/watchdog-action-registry.test.js` passed 5/5.
- Clean branch `node --test tests/action-registry-telegram-ui-bot.test.js`
  passed 33/33.
- Clean branch `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `e4b035db-e309-4402-b19c-4a26774aab8d` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T18-41-53-481Z-live-app-smoke.md`.

No browser-click substitution, external send, publish, charge, DNS mutation,
OAuth action, connector call, hard delete, or secret exposure was performed.
Future non-visible categories remain marked `not_applicable_current_surface`
until a typed registry row is added before exposure.
<!-- addendum-req-013:end -->

<!-- addendum-req-014:start -->
## REQ-20260623-014 - Shared Registry-Constrained Planner And Runner

Status: done / deployed / live-smoked

Implemented the shared natural-language planner/runner contract without adding
a second Telegram architecture, website-bot action system, registry, or action
runner:

- `src/platform/assistant/action-planner.js` builds the planner schema from
  `visibleActionsForActor(listActions(), actor)`, so each actor sees only
  role/workspace-authorized actions.
- Requested action IDs are rejected when unknown or permission-denied before
  execution can be attempted.
- The planner infers typed inputs for core task, decision, ticket, Codex Agent
  Work, provider Google Business link, and provider-question actions.
- Missing required inputs are returned as focused questions.
- `runPlannedAssistantAction` executes only by calling the canonical
  `src/lib/actions/runner.js` `runAction` path, preserving dry-run, approval,
  actor, workspace, source, and audit behavior.
- `tests/assistant-action-planner-contract.test.js` covers Telegram/website
  parity, role filtering, unknown/denied actions, parent-vs-admin Codex
  routing, missing provider input collection, and approval preview execution.

Verification:

- Clean PR branch `node --check src/platform/assistant/action-planner.js`.
- Clean PR branch
  `node --test tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/action-registry-telegram-ui-bot.test.js`
  passed 47/47.
- Main workspace focused suite passed 47/47.
- Railway deployment `d61bbb67-c6bd-409a-89a1-c0e9c63e11e6` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T18-53-31-401Z-live-app-smoke.md`.

No model text can execute an action directly, no parent/student actor can route
technical work to Codex, and no duplicate action/intake/agent/onboarding
system was introduced.
<!-- addendum-req-014:end -->

<!-- addendum-req-015:start -->
## REQ-20260623-015 - Shared Drafts, Templates, Previews, And Versioning

Status: done / deployed / live-smoked

Implemented the shared draft/template/version/preview contract on top of the
existing `assistant_*` data model instead of adding a separate versioning
system:

- `src/platform/assistant/draft-versioning.js` shapes rows for
  `assistant_drafts`, `assistant_draft_versions`, `assistant_templates`, and
  `assistant_previews`.
- The contract covers email, SMS, WhatsApp copy, Telegram messages,
  announcements, landing-page copy, website sections, chart layouts,
  worksheets, course outlines, onboarding scripts, automations, and support
  macros.
- Version rows include object type/id, parent version, editor identity,
  channel, audience scope, prompt/instruction, content/config, change summary,
  approval state, active state, scheduled/use state, rollback relationship, and
  created time.
- Preview rows identify the draft version, real vs sample data, audience,
  workspace/project, blockers, external-action risk, status, and payload.
- Role/workspace/relationship safety reuses shared `actionPolicy` /
  `assertActionPolicy`; parents can draft linked-child chart layouts but cannot
  create email-campaign drafts or cross-child layouts.
- Draft content validation rejects raw code/CSS injection fields and strings.
- `tests/assistant-draft-versioning-contract.test.js` locks object coverage,
  version creation, previews, provider Studio website drafts, linked-child
  chart scope, rollback/compare, templates, injection rejection, and
  clarification questions.

Verification:

- Main workspace draft/versioning suite passed 8/8.
- Main workspace combined assistant/action suite passed 60/60.
- Clean PR worktree combined assistant/action suite passed 60/60.
- Railway deployment `be818786-b5ab-416a-bbb3-0818c79cfc76` reached
  `SUCCESS`.
- Standard production smoke passed on rerun:
  `ops/live-smokes/2026-06-23T19-05-47-613Z-live-app-smoke.md`.

No external send, publish, charge, DNS mutation, OAuth action, connector call,
browser-click substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-015:end -->

<!-- addendum-req-016:start -->
## REQ-20260623-016 - Unified File/Media/Forwarded-Message Intake

Status: done / deployed / live-smoked

Implemented the shared file/media/forwarded-message intake contract without
creating a separate Telegram or website upload pipeline:

- `src/platform/assistant/file-media-intake.js` wraps the existing canonical
  `src/platform/ingestion/intake-source.js` source record.
- Telegram forwards/uploads and website assistant uploads now share source
  envelope, content fingerprint, idempotency, safety check, privacy
  classification, workspace/object resolution, preview, linked outcome, and
  retry/resume contract shapes.
- Type/size checks include blocked executable/script extensions and MIME
  patterns plus virus-scan-required metadata for media/files.
- Privacy classification flags group-chat context, forwarded private context,
  secret-like content, and student/family-sensitive material.
- Outcome planning covers provider brand assets, worksheets/resources,
  class/course media, assistant draft versions, ticket attachments, contact
  notes, and manual review.
- Parent/provider workspace and relationship checks reuse shared
  `actionPolicy` / `assertActionPolicy`.
- Ambiguous student/person matching blocks auto-parse and requires human
  review.
- Adapter routing explicitly keeps Telegram buttons and website cards as
  transport rendering only.

Verification:

- Main workspace file/media intake suite passed 8/8.
- Main workspace focused intake/media/assistant suite passed 42/42.
- Clean PR worktree focused intake/media/assistant suite passed 41/41.
- Railway deployment `6a3c0cfe-44bb-4154-8f1c-00bcf6f9a169` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T19-14-56-082Z-live-app-smoke.md`.

No duplicate intake pipeline, external send, publish, charge, DNS mutation,
OAuth action, connector call, browser-click substitution, hard delete, or
secret exposure was performed.
<!-- addendum-req-016:end -->

<!-- addendum-req-017:start -->
## REQ-20260623-017 - Assistant-Led Service-Provider Onboarding Through Studio

Status: done / deployed / live-smoked

Implemented the assistant-led provider onboarding contract through Service
Provider Studio without adding a separate onboarding forum or page builder:

- `src/platform/assistant/provider-onboarding-studio.js` defines the canonical
  provider onboarding stages from secure start through launch.
- Providers can start in Telegram and continue the same onboarding session in
  the website assistant.
- Studio draft package generation creates profile/listing, website, brand
  asset, course/community, communications, preview, and launch-gate structures
  using the shared draft/versioning and file/media intake contracts.
- Legacy provider form capture is classified as `adapter_capture_only`;
  `assistant_onboarding_sessions` remains canonical and
  `service_provider_studio` is the creation/editing system.
- Launch remains blocked until public listing preview, landing-page preview,
  portal configuration, class/course draft, communications templates,
  integration readiness, asset review, and operator approval are complete.
- File/media intake now routes provider hero/photo/gallery assets to Service
  Provider Studio asset review.

Verification:

- Main workspace provider onboarding contract suite passed 6/6.
- Main workspace provider/onboarding/provider-directory pack passed 59/59.
- Clean PR worktree provider/onboarding/provider-directory pack passed 59/59.
- Railway deployment `24301b82-8b71-45e4-b0a9-aa3d2f236cad` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T19-25-10-625Z-live-app-smoke.md`.

No duplicate provider onboarding system, page builder, intake pipeline,
external send, publish, charge, DNS mutation, OAuth action, connector call,
browser-click substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-017:end -->

<!-- addendum-req-018:start -->
## REQ-20260623-018 - Parent Natural-Language Self-Service

Status: done / deployed / live-smoked

Implemented the parent natural-language self-service contract without adding a
separate parent assistant or chart builder:

- `src/platform/assistant/parent-self-service.js` defines linked-child-scoped
  parent assistant context, chart layout previews, layout version patches,
  allowed update review plans, official correction review plans, ticket plans,
  and reminder plans.
- Parent chart layouts reuse the shared `chart_layout` draft/version/preview
  contract from `src/platform/assistant/draft-versioning.js`.
- Parent relationship, workspace, channel, and action-category enforcement
  reuse shared `actionPolicy` / `assertActionPolicy`.
- Approved parent display templates and sections are validated, while private
  admin/provider notes, billing status, official scores, and official
  attendance fields are rejected.
- Home-practice updates and official-record corrections produce review plans
  only. They do not mutate official attendance, scores, provider/school
  metrics, billing, or another child.
- Parent tickets and reminders are scoped to the linked child and mark
  sensitive or group-chat contexts as private-reply required.

Verification:

- Main workspace parent self-service suite passed 6/6.
- Main workspace focused assistant/control-plane suite passed 47/47.
- Clean PR worktree focused assistant/control-plane suite passed 47/47.
- Railway deployment `c8abec9b-5f50-481d-8d5c-7c39714ffa3a` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T19-37-26-570Z-live-app-smoke.md`.

No duplicate parent assistant system, chart builder, external send, official
attendance/score write, publish, charge, DNS mutation, OAuth action, connector
call, browser-click substitution, hard delete, or secret exposure was
performed.
<!-- addendum-req-018:end -->

<!-- addendum-req-019:start -->
## REQ-20260623-019 - Natural-Language Chart/Dashboard Configuration

Status: done / deployed / live-smoked

Implemented the canonical chart/dashboard configuration contract:

- `src/platform/assistant/chart-dashboard-config.js` defines the shared model
  for chart definitions, templates, dashboard layouts, layout versions, metric
  visibility, role/workspace/student scope, date ranges, display preferences,
  previews, compare/rollback, and saved views.
- `src/platform/assistant/parent-self-service.js` now builds chart content
  through the canonical chart/dashboard model instead of carrying a separate
  parent-only configuration shape.
- Natural-language patch compilation covers section reordering, bars/line
  chart choices, last-30-days/weekly/monthly ranges, grandparent/simple views,
  saved view names, and rollback intent.
- Parent, provider, student, and super-admin scope enforcement uses the shared
  control-plane policy. Service providers can use the provider class overview
  template through the same `dashboard_layout` category.
- Raw code/CSS/HTML/script fields, private/admin metrics, billing state,
  other-child records, and official attendance/score mutation requests are
  rejected.

Verification:

- Main workspace chart/parent/control-plane suite passed 20/20.
- Main workspace focused assistant suite passed 59/59.
- Clean PR worktree focused assistant suite passed 59/59.
- Railway deployment `5196fc2f-1e56-4a6f-a1ff-e44649831540` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T19-51-57-448Z-live-app-smoke.md`.

No duplicate chart builder, external send, official attendance/score write,
publish, charge, DNS mutation, OAuth action, connector call,
browser-click substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-019:end -->

<!-- addendum-req-020:start -->
## REQ-20260623-020 - Super-Admin Campaign And Drip-Sequence Control

Status: done / deployed / live-smoked

Implemented the campaign/segment/drip sequence control contract:

- `src/platform/assistant/campaign-control.js` defines audience segment
  previews, suppression counts, email campaign draft packages, drip sequence
  draft packages, versioned message previews, send safety gates, and
  natural-language campaign plan compilation.
- `src/lib/actions/registry.js` now exposes `preview_campaign_segment`,
  `draft_email_campaign`, and `draft_drip_sequence` as typed,
  approval-gated registry actions.
- `src/lib/actions/actions/operations.js` returns campaign-control contracts
  for those actions through the canonical `runAction` path.
- `src/platform/assistant/action-planner.js` infers audience count, message
  count, exclusions, and campaign/sequence intent from natural language.
- Shared control-plane policy allows authorized service-provider campaign
  previews within their workspace while preserving preview/approval gates.

Verification:

- Main workspace campaign/planner/action-registry suite passed 52/52.
- Main workspace focused assistant/action suite passed 97/97.
- Main workspace parity generators and `npm run watchdog:actions` passed with
  0 findings.
- Clean PR worktree focused assistant/action suite passed 97/97.
- Clean PR worktree `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `b796a1b9-8de7-43ea-90fb-0f9a87a9304b` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T20-05-05-992Z-live-app-smoke.md`.

No external send, campaign execution, live schedule enablement, contact-list
write, suppression write, connector call, DNS mutation, billing action,
browser-click substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-020:end -->

<!-- addendum-req-021:start -->
## REQ-20260623-021 - Natural-Language Automation Builder

Status: done / deployed / live-smoked

Implemented the automation builder contract:

- `src/platform/assistant/automation-builder.js` defines typed automation
  triggers, conditions, delays, actions, validation, readable previews,
  simple diagrams, sample-event dry runs, draft/version creation, and
  approval-gated enable planning.
- `src/lib/actions/registry.js` now exposes `draft_automation` as a typed,
  approval-required registry action.
- `src/lib/actions/actions/operations.js` returns the automation builder
  contract through the canonical `runAction` path.
- `src/platform/assistant/action-planner.js` infers automation intent and
  sample-event hints from natural language.
- `ops/action-registry/actions.json` was aligned with the runtime registry by
  adding the prior campaign actions and the new automation action; generated
  parity remains green.

Verification:

- Main workspace automation/planner/action-registry suite passed 45/45.
- Main workspace focused assistant/action suite passed 97/97.
- Clean PR worktree focused assistant/action suite passed 97/97.
- Clean PR worktree parity generators passed with 22 visible controls and 137
  registry rows.
- Clean PR worktree `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `8006f53f-d12b-4a38-9233-26b9f217d26b` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T20-19-39-519Z-live-app-smoke.md`.

No automation enablement, external send, connector call, live schedule
activation, contact-list write, official data mutation, publish, charge, DNS
mutation, OAuth action, browser-click substitution, hard delete, or secret
exposure was performed.
<!-- addendum-req-021:end -->

<!-- addendum-req-022:start -->
## REQ-20260623-022 - Natural-Language Ticketing And Problem Resolution

Status: done / deployed / live-smoked

Implemented the shared problem-resolution contract:

- `src/platform/assistant/problem-resolution.js` defines classification,
  source envelope capture, route/object/device/file context, privacy flags,
  dedupe keys, safe-help suggestions, Agent Work package planning, and
  evidence/user-confirmation closure gating.
- `src/lib/actions/actions/operations.js` now enriches existing
  `create_ticket` and `create_report_problem_ticket` results with the shared
  `problem_resolution` payload.
- `src/lib/actions/registry.js` explicitly declares source context, device,
  viewport, file, existing-ticket, workspace/project, child, and provider
  inputs for the ticket actions.
- `ops/action-registry/actions.json` was refreshed for the affected ticket
  rows; generated parity remains green.

Verification:

- Main workspace problem/planner/action-registry suite passed 45/45.
- Main workspace focused assistant/action suite passed 103/103.
- Clean PR worktree focused assistant/action suite passed 103/103.
- Clean PR worktree parity generators passed with 22 visible controls and 137
  registry rows.
- Clean PR worktree `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `7cc4fbe0-2d98-4496-b44f-f38e3a4c87e0` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T20-31-58-654Z-live-app-smoke.md`.

No duplicate ticketing system, personal Pending card, Codex task execution,
external send, connector call, official data mutation, publish, charge, DNS
mutation, OAuth action, browser-click substitution, hard delete, or secret
exposure was performed.
<!-- addendum-req-022:end -->

<!-- addendum-req-023:start -->
## REQ-20260623-023 - Unified Reminders And Proactive Notifications

Status: done / deployed / live-smoked

Implemented the shared reminder/notification contract:

- `src/platform/assistant/reminder-notifications.js` defines the canonical
  assistant reminder plan, notification payload, delivery outbox rows, consent
  checks, quiet hours, recurrence, dedupe keys, retry policy, and pause/cancel
  state-transition previews.
- `src/lib/actions/registry.js` now exposes
  `schedule_assistant_reminder` as a typed, approval-required registry action
  shared by Telegram, website assistant, Operations helper, parent/provider
  helpers, and future adapters.
- `src/lib/actions/actions/operations.js` returns the reminder contract through
  the canonical `runAction` path.
- `src/platform/assistant/action-planner.js` infers reminder intent from
  natural language and routes reminder/notify/alert language away from
  automation drafting unless the request is explicitly an automation.
- `ops/action-registry/actions.json` and generated parity artifacts were
  refreshed; generated parity remains green.

Verification:

- Main workspace reminder/planner/action-registry suite passed 45/45.
- Main workspace focused assistant/action suite passed 109/109.
- Clean PR worktree reminder/planner/action-registry suite passed 45/45.
- Clean PR worktree focused assistant/action suite passed 109/109.
- Clean PR worktree parity generators passed with 22 visible controls and 138
  registry rows.
- Clean PR worktree `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `a811771e-60e1-43f9-902c-70b0865d78ed` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T20-44-13-808Z-live-app-smoke.md`.

No reminder delivery, external send, connector call, live schedule activation,
official data mutation, publish, charge, DNS mutation, OAuth action,
browser-click substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-023:end -->

<!-- addendum-req-024:start -->
## REQ-20260623-024 - Role And Workspace Security Across All Scopes

Status: done / deployed / live-smoked

Implemented the shared security-scope hardening:

- `src/platform/assistant/control-plane.js` now computes interaction risk for
  guessed identifiers, Telegram group/supergroup/channel contexts, private
  forwarded content, private privacy classifications, and human-review state.
- The shared policy rejects guessed IDs, private group-chat actions, private
  group-chat content, and unreviewed private forwarded content before typed
  action execution.
- `tests/universal-control-plane-scope-policy.test.js` now covers family/BNA
  isolation, One Time/provider isolation, cross-provider rejection, parent
  linked-child scope, student own-record scope, guessed IDs, group chats, and
  private forwarded content.

Verification:

- Main workspace scope-policy suite passed 10/10.
- Main workspace focused assistant/action suite passed 119/119.
- Clean PR worktree scope-policy suite passed 10/10.
- Clean PR worktree focused assistant/action suite passed 119/119.
- Clean PR worktree `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `6620b95b-0771-4e38-9fb9-1e6c4921e2bd` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T20-53-13-014Z-live-app-smoke.md`.

No data exposure, permission bypass, external send, connector call, official
data mutation, publish, charge, DNS mutation, OAuth action, browser-click
substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-024:end -->

<!-- addendum-req-025:start -->
## REQ-20260623-025 - Operations Assistant Control Center

Status: done / deployed / live-smoked

Implemented the Operations Assistant Control Center readback:

- `src/platform/assistant/control-center.js` builds a read-only snapshot over
  shared assistant conversations, action plans/runs, previews, approvals,
  drafts, versions, reminders, notifications, onboarding, deliveries, dead
  letters, registry coverage, blockers, and management prompts.
- `server.js` exposes `/api/bna/assistant/control-center` as a Super Admin
  only, no-write route.
- `public/operations.html` shows Control Center counts and blockers inside the
  existing Universal Assistant panel in the Agents view.
- `tests/assistant-control-center-contract.test.js` verifies read-only SQL,
  redaction, registry coverage, route wiring, and UI markers.

Verification:

- Main control-center/data-model/scope suite passed 18/18.
- Main focused assistant/action suite passed 122/122.
- Clean PR worktree control-center/data-model/scope suite passed 18/18.
- Clean PR worktree focused assistant/action suite passed 122/122.
- Clean PR worktree `npm run watchdog:actions` passed with 0 findings.
- Railway deployment `02944240-4c1b-477b-a57f-5f6140e80400` reached
  `SUCCESS`.
- Standard production smoke passed:
  `ops/live-smokes/2026-06-23T21-07-46-763Z-live-app-smoke.md`.
- Focused live endpoint readback returned status 200 for
  `/api/bna/assistant/control-center`.

No action execution, queue mutation, raw body/payload exposure, external send,
connector call, official data mutation, publish, charge, DNS mutation, OAuth
action, browser-click substitution, hard delete, or secret exposure was
performed.
<!-- addendum-req-025:end -->

<!-- addendum-req-026:start -->
## REQ-20260623-026 - Final Cross-Channel QA

Status: done / deployed / live-smoked

Completed the final Telegram plus website-assistant parity closeout:

- Created the required Telegram system truth audit, action parity audit,
  cross-channel QA run, provider onboarding doc, and ChatGPT return packet.
- Force-added the `.runtime/telegram-audit/CHATGPT-RETURN-PACKET.*` files
  because the prompt required those runtime artifacts even though `.runtime/`
  is ignored by default.
- Verified final JSON artifacts parse cleanly.
- Confirmed the final PR branch head is `6560b8f0`.
- Confirmed Railway deployment
  `359bd3c5-8cdc-4b70-a2eb-535e03f8d62e` reached `SUCCESS`.
- Ran the standard live app smoke successfully:
  `ops/live-smokes/2026-06-23T21-16-19-796Z-live-app-smoke.md`.
- Ran focused live readback for
  `/api/bna/assistant/control-center`: status 200,
  `total_actions=79`, `telegram_ready=79`, `website_ready=79`,
  `blocker_count=0`, and no-write guards present.
- Final execution-run validation passed:
  `npm run bna:run:validate`, `npm run bna:run:source-coverage`, and
  `npm run bna:run:next`; the selector returned no unblocked executable batch.

No unblocked addendum requirement remains. The only remaining active-run
terminal blocker is `REQ-20260619-313`, which stays
`needs_operator_decision` for separate One Time paid infrastructure, ownership,
and DNS approval.
<!-- addendum-req-026:end -->

<!-- integration-navigation-owner-review:start -->
## RAW-20260624-001 - Integration Navigation Owner-Review Closeout

Status: registered / pending implementation

Registered Shloimie's credential-free Integration, Navigation, and
Owner-Review Closeout packet as `RAW-20260624-001` and appended
`REQ-20260624-001` through `REQ-20260624-011` to this execution run.

The next unblocked batch is `REQ-20260624-001`: discover PR/source heads,
create a clean integration branch from current `origin/master`, merge PR #12,
PR #13, and any discoverable final running-agent SHA, resolve combined
`server.js` and `public/operations.html` changes, and produce one
owner-review release-candidate PR/SHA.

Guardrails for the whole pass:

- no external credentials;
- no production state readback;
- no production database mutation;
- no backfill application;
- no deploy or live production smoke;
- no email or Telegram sends;
- no publish, upload, charge, DNS, OAuth/account-owner action, or secret
  request;
- no broad new feature family or approval-wrapper-only slice.
<!-- integration-navigation-owner-review:end -->

<!-- integration-navigation-req-001-002:start -->
## REQ-20260624-001 / REQ-20260624-002 - Integration Preflight

`REQ-20260624-001` status: done

- Created clean worktree:
  `C:\Users\User\Documents\Codex\2026-06-24\integration-navigation-owner-review`
- Branch: `codex/integration-navigation-owner-review-20260624`
- Base: `origin/master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f`
- Merged PR #12 head:
  `428ee78682a201b233b2f3da71bf0205b48812ad`
- Merged PR #13 head:
  `6560b8f02580e5f182a95df84ad8d5383403d887`
- Merge conflicts: none; `server.js` and `public/operations.html` merged by
  Git `ort`.
- Added route-gate repair commit `fc4d8814` and pushed the branch.
- Draft integration PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- PR #12 and PR #13 were commented as superseded for owner-review purposes.

`REQ-20260624-002` status: needs_operator_decision

Local credential-free validation passed:

- `npm ci`
- `npm test` 1202/1202
- `npm run secrets:audit`
- `node --test tests/watchdog-action-registry.test.js` 5/5
- `npm run watchdog:links` 0 findings after registering `/parent.html`,
  `/student.html`, and `/one-time-classroom.html` aliases
- `npm run watchdog:actions` 0 findings
- `npm run watchdog:security` 0 findings

Blocked item:

- GitHub rejected adding `.github/workflows/credential-free-ci.yml` because
  the current OAuth app lacks `workflow` scope. Owner action required:
  grant workflow-scope GitHub credentials, have a repo owner add the workflow,
  or explicitly accept no independent GitHub status check for this pass.

Next unblocked batch: `REQ-20260624-003` complete route/page/link inventory.
<!-- integration-navigation-req-001-002:end -->

<!-- integration-navigation-req-003:start -->
## REQ-20260624-003 - Route/Page Inventory

Status: done

PR #14 branch `codex/integration-navigation-owner-review-20260624` now includes
commit `094ca7c6634b3ade13d158e15b0716907c367d3a`, which adds a generated
owner-review route inventory baseline:

- `npm run owner-review:routes`
- `scripts/generate-owner-review-route-inventory.mjs`
- `tests/owner-review-route-inventory.test.js`
- `docs/owner-review/ROUTE-INVENTORY.csv`
- `docs/owner-review/ROUTE-INVENTORY.json`
- `docs/owner-review/CANONICAL-SITEMAP.md`
- `docs/owner-review/NAVIGATION-GRAPH.md`
- `docs/owner-review/ORPHAN-AND-DUPLICATE-PAGES.md`

Latest generated inventory summary:

- 689 total route rows
- 34 public HTML pages
- 753 server route declarations
- 584 API route rows
- 71 linked destinations
- 182 client edges
- 9 manifest edges
- 13 service-worker edges
- 92 forms without explicit action attributes
- 0 missing implementation rows
- 44 customer-facing orphan-review rows
- 26 duplicate implementation groups

`REQ-20260624-003` is complete as an inventory baseline. The unresolved
navigation/orphan/duplicate findings remain open under `REQ-20260624-004`.
<!-- integration-navigation-req-003:end -->

<!-- integration-navigation-req-004:start -->
## REQ-20260624-004 - Navigation Repair And Classification

Status: done

PR #14 branch `codex/integration-navigation-owner-review-20260624` now includes
commit `e4378c31c7d70f7d3c2c8505d3907ff29d7e2a5f`, which repairs the generated
route inventory findings instead of leaving them as manual review work.

Implemented:

- Shared public navigation now exposes One Time as a primary destination.
- Public/provider/helper links use canonical `/providers/join?onboard=provider`
  while `/become-service-provider` remains a compatibility alias.
- One Time member, library, classroom, and participant pages now expose
  consistent return paths across One Time home, member home, library,
  classroom, questions/support, and public site.
- Parent public page links the parent handbook instead of leaving that
  document page undiscoverable.
- The owner-review inventory generator classifies aliases/internal-only
  destinations without reporting customer-facing duplicate canonical pages.

Latest generated inventory summary:

- 689 total route rows
- 34 public HTML pages
- 753 server route declarations
- 584 API route rows
- 74 linked destinations
- 207 client edges
- 9 manifest edges
- 13 service-worker edges
- 92 forms without explicit action attributes
- 0 missing implementation rows
- 0 customer-facing orphan-review rows
- 0 duplicate implementation groups

Remaining batches start from this baseline: `REQ-20260624-005` One Time journey,
`REQ-20260624-006` broader role information architecture, and then assistant
visibility/browser QA/UX reconciliation/owner-review packet work.
<!-- integration-navigation-req-004:end -->

<!-- integration-navigation-req-005:start -->
## REQ-20260624-005 - Canonical One Time Journey

Status: done

PR #14 branch `codex/integration-navigation-owner-review-20260624` now includes
commit `3375c9fe33e3eb7efe6e0333067265e6d3429756`, which makes the One Time
member path one obvious local journey:

`/one-time` -> `/rabbi-member` -> `/member-library` ->
`/one-time-classroom` -> `/rabbi-member#support` ->
`/rabbi-member?logout=1` -> public site return.

Implemented:

- `/one-time` member CTAs now point to `/rabbi-member`.
- Legacy member entry aliases `/one-time/member-login`, `/member`, and
  `/member-portal` redirect to `/rabbi-member`; `/member.html` is classified
  as a legacy static code entry with safe member-home return links.
- Member home, library, classroom, and participant pages expose consistent
  navigation for One Time home, member home, library, classroom/live class,
  questions/support, account/logout, and public site return.
- One Time member logout clears the shared local member state keys without any
  external write.
- Route registry and privacy smoke coverage classify canonical/legacy One Time
  routes explicitly.

Verification summary:

- Local desktop/mobile Playwright journey smoke passed in no-DB mode.
- Focused One Time/route inventory contracts passed 23/23.
- Full local suite passed 1207/1207.
- Route inventory reports 689 routes, 34 HTML pages, and 0 orphan-review rows.
- Secret audit and link/action/security watchdogs all passed with 0 findings.

Remaining batches start from `REQ-20260624-006` broader public/provider/parent/
student/provider-participant/Operations information architecture repair, then
assistant visibility, role browser QA, UX backlog reconciliation, release
gates, and the owner-review packet.
<!-- integration-navigation-req-005:end -->

<!-- integration-navigation-req-006:start -->
## REQ-20260624-006 - Integrated Information Architecture

Status: done

PR #14 branch `codex/integration-navigation-owner-review-20260624` now includes
commit `ca49a1404ab619dc37319ad2f6108049e9c2f347`, which repairs the public
and portal IA for owner review.

Implemented:

- Shared public navigation now exposes direct links for School, Families,
  Provider Directory, One Time, Blog, FAQ, Portal Login, and Register.
- Operations is explicitly kept out of the consumer navigation.
- Parent portal topbar now has public-site return, Families, Parent home,
  Assistant/help, and Student login links.
- Student portal topbar now has public-site return, Families, Student home,
  Assistant/help, and Parent login links.
- Provider portal topbar now has public-site return, Directory, Provider home,
  and Join links.
- Universal action parity artifacts were regenerated after visible nav changes.
- Owner-review route inventory and navigation graph were regenerated.

Verification summary:

- Focused IA/privacy/contracts passed 27/27.
- Full local suite passed 1207/1207.
- Route inventory reports 689 routes, 34 HTML pages, and 0 orphan-review rows.
- Secret audit and link/action/security watchdogs all passed with 0 findings.

Remaining batches start from `REQ-20260624-007` website assistant visibility and
scoping on intended user surfaces, followed by role browser QA, UX backlog
reconciliation, release gates, and the owner-review packet.
<!-- integration-navigation-req-006:end -->

<!-- integration-navigation-req-007:start -->
## REQ-20260624-007 - Shared Website Assistant Visibility

Status: done

PR #14 branch `codex/integration-navigation-owner-review-20260624` now includes
commit `d853b9205626e6ea50bd3b639b7718b1f374040d`, which makes website
assistant access visible and scoped on the owner-review surfaces without adding
a second assistant framework.

Implemented:

- The shared assistant widget recognizes One Time member surfaces and records
  them as `surface=one_time_member`.
- Parent, student, and provider topbar Assistant/help links now open the shared
  assistant launcher.
- One Time member home, member library, classroom, and provider-participant
  pages load the shared helper knowledge and assistant widget, with a visible
  Assistant/help entry.
- Operations continues to use the existing BNA Helper drawer rather than the
  public floating widget.
- Contract tests now gate the shared launcher, One Time scoping, and portal
  assistant visibility.
- Route inventory, One Time action coverage, universal action parity, One Time
  browser smoke evidence, and link/action/security watchdog reports were
  regenerated.

Verification summary:

- Focused assistant/portal/One Time/provider route contracts passed 66/66.
- Full local suite passed 1208/1208.
- Route inventory reports 689 routes, 34 HTML pages, and 0 orphan-review rows.
- One Time local desktop/mobile journey smoke passed.
- Secret audit and link/action/security watchdogs all passed with 0 findings.

Remaining batches start from `REQ-20260624-008` credential-free desktop/mobile
browser QA across public, parent, student, provider, provider participant,
One Time member, super-admin, wrong-role, and logged-out journeys.
<!-- integration-navigation-req-007:end -->
