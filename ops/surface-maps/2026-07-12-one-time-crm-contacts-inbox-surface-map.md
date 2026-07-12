# One Time CRM Contacts/Inbox Surface Map

Raw source: `RAW-20260712-013`
Requirement: `REQ-20260712-805`
Spec: `ops/product-specs/one-time/crm/contacts-inbox.v1.json`
Status: current-state map for packetized CRM implementation. No product code changed in this batch.

## Scope

- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Product area: first-party One Time CRM Contacts and scoped Inbox
- External CRM policy: no GHL, LeadConnector, or external CRM runtime
- Write policy: local CRM writes only inside scoped packets with no-send proof; sends, payments, access grants, DNS/account changes, credential changes, and production imports are out of scope.

## Canonical Routes

| Surface | Canonical route | Purpose | Current state |
|---|---|---|---|
| Operations CRM Contacts | `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts` | Search, filter, sort, open, and read One Time CRM contacts. | Partial/already mostly implemented. |
| Scoped One Time Inbox | `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi` | Read One Time email/logged inbox with selected CRM context and readiness gates. | Partial/already mostly implemented. |
| Provider mailbox | `/provider.html?admin_provider=one-time&section=mailbox` | Rabbi/provider-facing scoped mailbox path. | Implemented with provider session requirements. |
| CRM contacts API | `/api/bna/crm/contacts` | Entitlement-gated list/filter/page of first-party CRM cards. | Implemented. |
| CRM timeline API | `/api/bna/crm/contacts/:id/timeline` | Read-only local contact timeline. | Implemented. |
| CRM update API | `/api/bna/crm/contacts/:id` | Local CRM field/note/follow-up update. | API implemented; UI enablement remains packetized. |
| Provider mailbox API | `/api/provider-portal/mailbox` and `/api/provider-portal/mailbox/:threadKey` | Scoped provider mailbox thread list and message readback. | Implemented. |

## Files

| File | Role | Current-state finding |
|---|---|---|
| `src/lib/bna/crm-contact-model.js` | DTO, filters, pagination, provider inquiry inbox, timeline normalization | Already maps contact, mailbox, support, task, access, and timeline context with no-send fields. |
| `server.js` | CRM/inbox APIs and persistence | Provides list/timeline/update/provider mailbox routes with workspace/project scope and no-send/external-write flags. |
| `public/js/operations-shell.js` | Contacts route and CRM workbench | Renders API-backed workbench, search/filter controls, selected contact panes, safe action locks, and scoped inbox navigation. |
| `public/js/operations-deferred-renderers.js` | Communications/email route | Renders Rabbi inbox selector, selected CRM context card, readiness gates, draft editor, email detail, and view rail. |
| `ops/action-registry.json` | Visible action registry | Contains CRM filter, expand, open scoped inbox, update, and email inbox action entries. Update only when new actions are exposed. |
| `ops/route-registry.json` | Route/security registry | Contains CRM contact APIs and scoped inbox/provider mailbox route coverage. Update only when new routes are exposed. |
| `tests/crm-contact-model.test.js` | DTO/entitlement/pagination/timeline tests | Covers card mapping, source labels, filters, pagination, provider inbox, and timeline no-send. |
| `tests/one-time-communications-workspace.test.js` | Static communications/CRM contract | Covers One Time email lane, CRM workbench markers, no-send copy, and scoped lead review. |
| `scripts/smoke-onetime-operations-crm-workbench-local.mjs` | Local browser smoke | Covers split/monolith Operations CRM, selected contact, inbox context, responsive viewports, and no external writes. |
| `scripts/smoke-onetime-crm-journey-local-db.mjs` | Isolated DB journey | Provides mutation/reload proof path; requires a local/test DB env before use. |
| `scripts/smoke-onetime-operations-crm-workbench-live.mjs` | Live no-write smoke | Read-only live proof path after app-visible/server-visible changes. |

## Packet Ownership

| Packet | Scope | Status |
|---|---|---|
| `OT-CRM-01` | Canonical DTO, query scoping, list, pagination, performance | Partial; DTO/list/pagination exist, but exact C0/C1/C7 geometry and performance proof remain open. |
| `OT-CRM-02` | Full contact workspace and mutations | Partial; PATCH exists for some local updates, but dedicated workspace/mutation endpoints/UI/proof remain open. |
| `OT-CRM-03` | Timeline, inbox handoff, guarded composer | Partial; timeline and scoped inbox context exist, but threads/composer/round-trip proof remain open. |
| `OT-CRM-04` | Tasks, lifecycle pipeline, access relationships | Partial; follow-up task summary exists, but Tasks tab, task endpoints, lifecycle registry, and access proof remain open. |
| `OT-CRM-05` | Canonical-route browser verification, responsive screenshots, deployment | Partial; scripts exist, but current isolated DB journey, screenshots, deployment/live no-write proof remain open. |

## Current Gaps

- `GAP-OT-CRM-004`: Full contact workspace and local mutations are partial.
- `GAP-OT-CRM-005`: Timeline, inbox handoff, and guarded composer are partial.
- `GAP-OT-CRM-006`: Tasks, lifecycle pipeline, and access relationships are partial.
- `GAP-OT-CRM-007`: Isolated CRM mutation/reload proof script exists but was not run in this blueprint-only batch.
- `GAP-OT-CRM-008`: Live no-write proof scripts exist and should be rerun after any app-visible change.
- `GAP-OT-CRM-009`: Exact C0-C9 implementation contract is now encoded in the blueprint.

## Verification Targets

- `node -e "JSON.parse(require('fs').readFileSync('ops/product-specs/one-time/crm/contacts-inbox.v1.json','utf8')); JSON.parse(require('fs').readFileSync('ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.json','utf8'));"`
- `node --test tests/crm-contact-model.test.js tests/one-time-communications-workspace.test.js tests/operations-contacts-intake-cleanup.test.js`
- `npm run bna:run:validate`
- Future product implementation: run the relevant PQC packet, `npm run watchdog:actions`, `npm run watchdog:protocol-drift`, local/browser screenshots, and live no-write smoke when deployed.
