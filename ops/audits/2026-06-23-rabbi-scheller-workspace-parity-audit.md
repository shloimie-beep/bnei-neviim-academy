# Rabbi Scheller Workspace Parity Audit - 2026-06-23

Source: `RAW-20260623-006`
Register: `tasks-pending/2026-06-23-rabbi-scheller-workspace-parity-audit.md`
Route map: `ops/audits/2026-06-23-rabbi-scheller-route-map.json`
Workspace key: `rabbi_sheller_provider`
Project key: `one_time_mishnah_class`

## Executive classification

| Work body | Classification | Evidence |
|---|---|---|
| Existing One Time/Rabbi provider route shells and provider directory | LIVE VERIFIED | Prior live smoke: `ops/playwright-smokes/2026-06-14-rabbi-whitelabel-provider-privacy-live/report.md`; source files in `server.js`, `public/provider.html`, `public/rabbi.html`, route map. |
| Operations credential fallback from portal login forms | DEPLOYED / LIVE VERIFIED | `ops/live-smokes/2026-06-23T17-43-portal-ops-login-fallback-live-smoke.md`; local tests `tests/portal-operations-login-fallback.test.js`. |
| Workspace user/role management and service-provider studio | MERGED on `origin/master`, not in current branch | `origin/master` includes `9d8c2ba7 Merge service provider studio`, `4936394a Implement service provider studio`, and `c8d93646 feat: implement scoped workspace user roles`; current branch is 112 commits behind `origin/master`. |
| Full provider-platform parity for Rabbi Scheller | PARTIAL | Provider-level shells, data models, role tests, and directory exist; workspace user management and studio are merged remotely but absent locally; API usage backend metering not implemented. |
| Generic portal-agnostic identity/login layer | PARTIAL / IMPLEMENTED LOCALLY foundation | Existing route-specific auth plus Operations fallback exists; this pass now adds a shared server-side destination resolver for Operations/provider/parent/student password credentials, generic `/api/bna/auth/login` chooser support, wrong-portal redirect/chooser handling, provider/student/parent password-login chooser rendering, and generic multi-portal logout. It is not pushed/deployed/live-verified. |
| API usage readiness foundation added in this pass | IMPLEMENTED LOCALLY | `src/lib/bna/provider-api-usage.js`, `tests/provider-api-usage-readiness.test.js`; includes a sanitized recorder interface future bot code can call and a feature-flagged Provider Portal empty-state preview; no DB persistence wired. |
| Route inventory and navigation audit artifact | IMPLEMENTED LOCALLY | `scripts/build-rabbi-scheller-route-map.mjs`, generated route map with 689 Express route patterns, route-map contract test, and local Provider Portal navigation smoke that walks every supported section. |
| Push/merge/deploy/live verification for this pass | BLOCKED | `DEC-20260623-006`; prompt allows code/tests/docs but explicitly says not to deploy without authorization. |

## Git and deployment truth

| Item | Value |
|---|---|
| Current branch | `integration/20260619-platform-finish` |
| Local HEAD | `25609511186ef224cc7b3fc56b4b1143df16790b` |
| Tracking branch | none configured |
| Remote HEAD | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| `origin/master` | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| Ahead/behind vs `origin/master` | `112 14` from `git rev-list --left-right --count origin/master...HEAD`: 112 commits behind, 14 commits ahead of merge base |
| Current branch upstream status | no upstream; do not push without choosing target branch |
| Local dirty state | substantial pre-existing dirty tree plus this pass; exact state remains visible in `git status --short` |
| Pushed from this pass | none |
| Merged from this pass | none |
| Deployed from this pass | none |
| Live-verified from this pass | none |

Relevant remote commits found on `origin/master`:

- `a9528b2d` Close service provider studio goal.
- `9d8c2ba7` Merge service provider studio.
- `4936394a` Implement service provider studio.
- `4d412797` Merge PR #11: Automatic Operations auth for live smokes.
- `de77bc58` Merge PR #5: Agent Control and One Time recovery.
- `2af9e845` Harden One Time view-as Rabbi tokens.
- `fd8e28c5` Build One Time launch funnel and view-as Rabbi.
- `c8d93646` feat: implement scoped workspace user roles.

## Spelling and canonical naming

The durable workspace key is `rabbi_sheller_provider`; it should not be renamed casually because it appears in routes, tests, seed data, and historical evidence. Visible repository data currently contains `Rabbi Sheller`, `Rabbi Scheller`, `Rabbi Elie Scheller`, and, on `origin/master`, canonical role-model data using `Rabbi Ellie Scheller` with legacy aliases.

Safe action taken: new artifacts use "Rabbi Scheller" for the human-facing audit and preserve `rabbi_sheller_provider` as the key. Broad visible-name normalization is deferred until the checkout is reconciled with `origin/master`.

## Route inventory

Machine-readable route map: `ops/audits/2026-06-23-rabbi-scheller-route-map.json`

| Inventory item | Count / result |
|---|---|
| Express route patterns scanned | 689 |
| Page/alias routes | 70 |
| API/webhook routes | 619 |
| HTML surfaces scanned | `public/operations.html`, `public/provider.html`, `public/parent.html`, `public/student.html`, `public/rabbi.html` |
| Key login routes | `/operations`, `/provider`, `/provider/login`, `/student`, `/student/login`, `/parent`, `/parent/login`, `/api/operations/login`, `/api/provider-portal/login`, `/api/student-portal/login`, `/api/parent-portal/login`, `/api/bna/auth/login` |
| Rabbi/One Time key routes | 91 route patterns including provider portal, One Time public, member library, classroom, and Rabbi admin APIs |

Route groups found:

- Public marketing/site: `/`, `/he`, `/blog`, `/faq`, `/school`, `/parents`, `/signup`, `/register`, `/service-providers`, `/providers`, `/providers/category/:categorySlug`, `/providers/:slug`.
- Login/entry: `/operations-login.html` static, `/operations`, `/provider`, `/provider/login`, `/student`, `/student/login`, `/parent/login`, `/parent-login`, `/api/*/login`.
- Operations: `/operations`, `/operations/agents/runs/:runKey`, `/api/bna/**`.
- Provider portal: `/provider`, `/provider/login`, `/provider-dashboard`, `/api/provider-portal/**`.
- Parent: `/parent`, `/parent/login`, `/family`, `/household`, `/api/parent/**`, `/api/parent-portal/**`.
- Student: `/student`, `/student/login`, `/api/student-portal/**`.
- One Time/Rabbi/member/classroom: `/one-time*`, `/rabbi`, `/rabbi/member`, `/member-library`, `/one-time-classroom`, `/api/bna/one-time/**`, `/api/bna/rabbi/**`, `/api/rabbi/**`, `/api/member-portal/**`.
- Integrations/webhooks: Google, Resend, Buffer, Zoom, Vimeo, Stripe/Rabbi, Green Invoice/Rabbi, Telegram, helper/assistant APIs.

Browser reachability, active nav state, console errors, failed fetches, 404s, and viewport behavior were not freshly live-smoked across the whole app in this pass. Local Playwright evidence now covers the Provider Portal navigation graph for every supported section, direct `section=` links, click reachability, active nav state, browser back/refresh behavior, failed requests, console/page errors, wrong-scope nav absence, and the required 390x844, 768x1024, and 1440x900 viewports. Local Playwright evidence also covers the Provider Portal API Usage preview and provider/student/parent password login chooser rendering at those three viewports.

## Navigation findings

| Finding | Status | Evidence / note |
|---|---|---|
| Operations has provider workspace query-state navigation. | PARTIAL / locally strengthened | `/operations?workspace=rabbi_sheller_provider&view=...`; `public/operations.html` has API Usage, workspace switcher, provider scope labels, and allowed views. This pass now initializes `taskProjectFilter` from the provider workspace on direct links, removes `platform_suite` from the client-side service-provider nav profile, and pushes route history after initial normalization so browser Back reloads the previous Operations deep link. |
| Provider portal has its own shell and nav sections. | PARTIAL | `public/provider.html` exposes Overview/Profile/Services/Classrooms/Media/Communications/Activity/Settings style sections and a feature-flagged API Usage preview with an honest empty state. Local smoke now proves every enabled provider section is reachable by nav click and direct `section=` URL, with one active nav, one visible section, refresh/back behavior, no super-admin nav, no failed requests, no console errors, and no horizontal overflow at all three required viewports. |
| One Time/member/classroom routes exist. | IMPLEMENTED LOCALLY / previously live-smoked | Route map lists `/rabbi`, `/rabbi/member`, `/member-library`, `/one-time-classroom`; tests cover public privacy. |
| Service-provider studio and workspace users are merged remotely but absent from current branch. | BLOCKED by branch reconciliation | Present on `origin/master`; current branch has no upstream and is behind. |
| Full live Operations graph walk at 390x844, 768x1024, 1440x900 was not run. | PARTIAL | Local fixture-backed Operations Rabbi workspace smoke now covers Dashboard, Tasks, Members, Program/Schedule, Communications, API Usage, Settings, toolbar navigation, browser Back/deep-link reload, scoped requests, no BNA-scoped requests, no super-admin nav, no failed requests/console errors, and no horizontal overflow at all three required viewports. Local Provider Portal navigation/API Usage and portal chooser smokes also passed. Full authenticated live graph walk is still blocked pending deploy/live authorization. |
| Some visible text still says Sheller/Elie variants. | PARTIAL | `rg` found mixed names in `server.js`, `public/provider.html`, historical ops evidence; no broad rename performed on stale branch. |

## Unified login findings

| Requirement | Current result |
|---|---|
| Valid identity can authenticate from any portal login entry point. | PARTIAL / improved locally. Operations credentials fall back from provider/student/parent login forms. The new shared resolver recognizes Operations, provider, parent, and student password credentials server-side, and wrong-portal password entries redirect to the allowed portal or render a chooser response instead of issuing the wrong portal session. The parent password login form now accepts username as well as email so non-parent credentials are not blocked by browser email validation. Parent access-code login remains separate because it is not username/password auth. |
| Resolve memberships/roles/workspaces after auth. | PARTIAL. Operations identity includes `workspaceScope`, `projectKey`, allowed views, canonical role metadata. The shared resolver now returns normalized portal/workspace destinations for current password credential systems, but production identity assignment and `origin/master` workspace-user reconciliation remain open. |
| Safe `returnTo`. | PASS for Operations fallback: `safeOperationsReturnPath` permits only same-origin `/operations`; `oneTimeOperationsReturnPath` injects the Rabbi workspace/tasks destination when needed. |
| External/malformed returnTo rejected. | PASS in inspected Operations fallback helper and existing tests. |
| Refresh deep link keeps session. | PASS for server-backed Operations cookie path by code inspection; not freshly browser-smoked. |
| Sign-out clears session. | PRESENT and improved locally: `/api/operations/logout`, provider/parent/student logout routes exist, and generic `/api/bna/auth/logout` now clears Operations, active-workspace, provider, parent, and student cookies. Not freshly live-smoked. |
| No universal passwords/hard-coded client role trust. | PASS for inspected fallback: it calls `identifyOpsUser` server-side and issues only Operations session. |
| Provider credentials do not become super-admin credentials. | PASS for fallback scope: test proves fallback does not issue provider/student/parent session; RBAC tests prove scoped helper denial. |
| Provider owner/manager identities do not receive platform-suite capability. | PASS after local repair: provider-scoped `allowedViews` no longer include `platform_suite`, `admin`, or `accounting`. |
| Multiple legitimate destinations/role chooser. | IMPLEMENTED LOCALLY foundation: generic `/api/bna/auth/login` and wrong-portal password handlers return `chooser_required` with safe destinations when the same credentials match more than one legitimate destination. Provider, student, and parent password login pages now render those server-resolved destination links. |
| Visible chooser action coverage. | PASS locally: chooser destination links expose `ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION`, the root action registry documents the server-resolved same-origin behavior, and the watchdog action-registry test passes. |
| Visible provider navigation action coverage. | PASS locally: provider section buttons expose `ACTION-PROVIDER-SECTION-NAVIGATION`, the root action registry documents the section graph behavior, and the local browser smoke proves those controls do not reveal super-admin navigation. |

## Role and permission matrix

| Role | Workspaces visible | Navigation visible | Reads/writes/settings/users/billing/integrations/API/private notes/support | Switch/impersonate |
|---|---|---|---|
| BNA platform super admin | Platform-wide, including BNA and provider workspaces | Operations all allowed views | Can read/write platform operations records; can see platform-wide usage through super-admin scope; guarded by `requireAdmin` | Workspace switcher allowed; role preview exists in One Time review work on remote/local evidence |
| BNA operations user | BNA and assigned operational workspaces | Operations minus super-admin-only controls depending role | Scoped operations data; should not receive cross-provider access without membership | Limited by server-side allowed views |
| Provider workspace owner | Own provider workspace only | Provider workspace sections and allowed Operations workspace views | Own provider records, classes, students/members, communications, support, settings, integrations, API usage if permission allows | No platform-wide switch |
| Provider workspace administrator | Own provider workspace only | Provider admin nav minus platform controls | Own workspace reads/writes/settings/user management according to role; no super-admin APIs | No platform-wide switch |
| Provider staff/member | Assigned provider workspace records only | Staff/member-appropriate sections | Read/work on assigned classes/questions/content/support; no workspace-owner settings/API usage unless explicitly permitted | No provider switch |
| Rabbi/teacher | Rabbi Scheller workspace teaching scope | Class/content/questions/member context | Torah/class questions, notes, class/media workflows; no BNA private operations or platform admin | No platform switch |
| Parent/member | Own family/member records only | Parent/member portal | Own children/member progress/questions/library as applicable; no provider admin | No switch except owned roles |
| Student | Own student records only | Student/classroom portal | Own assignments, questions, worksheets, progress; student-safe only | No switch |
| Classroom-only participant | Current classroom/member route only | Classroom/member library | Classroom material and allowed responses | No switch |
| Review-only/test role | Explicit review route/data only | Review/test screens | Test/review data only; no writes unless review route permits | No switch |

Server-side enforcement evidence: `requireAdmin`, `requireProviderSession`, `assertWorkspaceAccess`, focused RBAC tests, and the new API-usage permission tests.

## BNA-to-Rabbi-Scheller feature parity matrix

| Provider-level feature | BNA/reference route or component | Rabbi Scheller equivalent | Status | Decision |
|---|---|---|---|---|
| Provider dashboard/workspace overview | `/operations?workspace=...&view=dashboard`; `/provider` | `/operations?workspace=rabbi_sheller_provider&view=dashboard`; `/provider` | PARTIAL | Share with provider config; no super-admin controls. |
| Students/student profile | Operations contacts/students, One Time classroom APIs | Operations workspace contacts/students sections; classroom/member data | PARTIAL | Provider-scoped subset only; exclude BNA global goals/private notes. |
| Parents/members | Parent/member APIs and Rabbi member APIs | `/api/bna/rabbi/members`, `/member-library`, parent portal where linked | PARTIAL | Provider-scoped version. |
| Staff/users/roles | `origin/master` workspace user management | Merged remotely, absent locally | MERGED remote only | Reconcile branch before local edits. |
| Classes/schedule/attendance | `/api/bna/one-time/classes`, `/api/bna/classes`, calendar routes | One Time class/admin APIs, classroom page | PARTIAL | Share class components with workspace key. |
| Questions/assignments/class notes | course questions, worksheets, assistant/helper APIs | student/classroom/provider scoped APIs | PARTIAL | Provider-scoped subset. |
| Content/library/video | `content` view, video library APIs, Rabbi library/member routes | `/member-library`, `/api/bna/rabbi/library-items`, provider class media | PARTIAL | Share component with provider config; external delivery still pending access. |
| Communications/announcements/email review | Operations communications APIs and provider portal messages | Provider messages, Rabbi communications, contact communications | PARTIAL | Scoped communications only; no unauthorized sends. |
| Support/activity/history | support tickets, task/activity APIs | Provider workspace activity and support sections | PARTIAL | Workspace-scoped records. |
| Payments/trials/revenue | BNA accounting/Rabbi checkout APIs | Rabbi checkout/member APIs; accounting controls excluded from provider owner local allowed views | PARTIAL | Revenue view can be provider-scoped; platform accounting excluded. |
| Integrations | Operations integrations view and provider portal external apps | Provider external apps and integrations status | PARTIAL | Show status/empty states, do not expose credentials. |
| Settings/branding/roles/invitations | workspace settings/branding APIs | workspace settings route with `assertWorkspaceAccess`; provider settings UI | PARTIAL | Provider-scoped settings; role management needs remote merge. |
| Usage/API usage | Operations API Usage placeholder | New utility foundation; Operations honest empty state; Provider Portal feature-flagged preview | IMPLEMENTED LOCALLY foundation | Feature-flag UI until real metering persistence. |
| Audit trail/reports/search/filters/exports | Operations tasks/activity/audit routes | Mixed, workspace-scoped APIs exist | PARTIAL | Use server workspace filters; no cross-provider exports. |
| Decisions/operator actions | Operations task/decision lifecycle | Provider-scoped task/activity records | PARTIAL | Provider owners see only their workspace decisions; BNA operator decisions remain internal. |
| BNA super-admin controls | Admin, platform suite, credentials, billing/integrations secrets | None for provider | EXCLUDED | Provider parity is not super-admin parity. |

## Tenant isolation findings

| Surface | Finding | Test/evidence |
|---|---|---|
| Workspace query trust | Server code uses `assertWorkspaceAccess` in many high-risk Operations routes; tests cover One Time admin routes and helper scope. | `tests/one-time-rbac-negative-isolation.test.js`, `tests/workspace-rbac-negative-isolation.test.js`. |
| Provider portal session | Provider portal APIs require `requireProviderSession`; route map records scoped APIs. | `tests/provider-login-phase12-audit.test.js`. |
| Public/provider directory | Public provider records are sanitized and safe CTA flow is tested. | `tests/service-provider-directory.test.js`, `tests/public-route-privacy-contract.test.js`. |
| API usage | New foundation filters and aggregates by authenticated workspace; cross-provider reads denied. | `tests/provider-api-usage-readiness.test.js`. |
| Search/autocomplete/exports | Operations task search is now covered by a static tenant-isolation contract proving server-side scoped project filtering is applied before broad text matching. Task detail linked child rows are now scoped by the authenticated project. No active provider export/autocomplete API route was found in this pass. | `tests/rabbi-scheller-tenant-isolation-contract.test.js`; `server.js`; full live API/browser crawl remains future hardening. |
| Integration credentials | Tests assert secret-safe provider login and secret storage contracts; no credential changes performed. | Existing provider tests; no production credential mutation. |
| Error messages | Existing RBAC tests cover denial behavior; no full live crawl. | PARTIAL. |

## API usage readiness

Implemented local foundation:

- `src/lib/bna/provider-api-usage.js`
- `tests/provider-api-usage-readiness.test.js`

Capabilities:

- Requires `workspace_key` on every event.
- Normalizes workspace, user, feature/agent, bot identifier, provider/model, request count, input/output/cached tokens, estimated/actual cost, latency, success/failure, error category, timestamp, billing period, quota/limit, environment, and correlation ID.
- Strips prompt, messages, response, API key, password, token, secret, credential, and private fields.
- Enforces provider workspace read permissions before filtering/aggregation.
- Allows platform super admin aggregation through explicit platform scope.
- Returns honest not-instrumented empty state with feature-flag signal.
- Provides `createProviderApiUsageRecorder()` so future bot/AI code can call a single workspace-required, prompt/secret-scrubbed instrumentation interface before persistence exists.
- Adds a feature-flagged Provider Portal API Usage preview that says usage metering is not instrumented yet and shows no fabricated requests, tokens, or cost.
- Registers the visible Provider Portal API Usage nav control as `ACTION-PROVIDER-API-USAGE-PREVIEW-NAV` with preview/feature-flag status.
- Registers server-resolved portal login chooser destination links as `ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION` so the new visible auth controls are covered by the action registry.
- Registers generated provider section navigation buttons as `ACTION-PROVIDER-SECTION-NAVIGATION` so provider navigation controls are watchdog-covered.
- Adds provider portal section query-state so `section=api_usage` deep-links into the preview, refresh preserves it, clicks update the URL, and browser back returns to Overview.

Not implemented now:

- Database table/migration for usage events.
- Live backend recorder endpoint.
- DB-backed Provider Portal API Usage endpoint, persisted usage table, exports, quotas, and billing-period controls.
- Bot UI or bot behavior.
- Billing/quota enforcement.

## Future provider bot requirement

Durable requirement: Provider Workspace Bot is planned later. It must be workspace-scoped, provider-permission-aware, API-usage tracked, and must not use cross-provider data. It is not part of the current implementation scope.

## Repaired defects / implemented local changes

| Item | Route/role/viewport | Observed behavior | Fix | Test proving fix | Git state |
|---|---|---|---|---|---|
| Missing reusable API-usage foundation | Provider workspace API usage / provider admin / not viewport-specific | Operations UI had an honest placeholder but no reusable normalized usage event foundation for future bot instrumentation. | Added `src/lib/bna/provider-api-usage.js`. | `node --test tests/provider-api-usage-readiness.test.js`; included in 77-test focused run. | LOCAL ONLY |
| Future provider bot lacked a safe usage recorder call target | Provider workspace API usage / provider bot / not viewport-specific | Usage model could normalize and aggregate events, but future bot code still had no single recorder abstraction to call. | Added `createProviderApiUsageRecorder()` with configured-sink and no-sink behavior, timestamp/environment defaults, and prompt/secret scrubbing. | `node --test tests/provider-api-usage-readiness.test.js`; included in 77-test focused run. | LOCAL ONLY |
| Provider Portal lacked a safe API Usage entry point for future provider metering | `/provider?api_usage_preview=1&section=api_usage` / provider admin / 390x844, 768x1024, 1440x900 | API usage was represented only in Operations, so provider admins had no safe preview/empty state for the future workspace-scoped metering surface; the new visible nav needed registry coverage and direct deep-link/back behavior. | Added feature-flagged Provider Portal API Usage section with honest empty-state copy, no fabricated token/cost/request fields, `section=` query-state, and `ACTION-PROVIDER-API-USAGE-PREVIEW-NAV` in `ops/action-registry.json`. | `node --test tests/rabbi-scheller-auth-navigation-contract.test.js`; `node scripts/smoke-rabbi-scheller-provider-api-usage-local.mjs`; included in 77-test focused run. | LOCAL ONLY |
| Provider identities were handed `platform_suite` in server allowed views | `/operations?workspace=rabbi_sheller_provider&view=platform_suite` / provider owner-manager / all viewports | `ownerAllowedViews`, `managerAllowedViews`, and `providerAllowedViews` included `platform_suite`; hidden UI nav was not enough because provider identities should not receive the capability. | Removed `platform_suite` from provider-scoped allowed views while keeping platform super-admin access. | `node --test tests/one-time-role-auth-model.test.js tests/google-workspace-settings-contract.test.js tests/operations-one-time-view-as.test.js`; included in 79-test focused run. | LOCAL ONLY |
| Operations client provider nav still listed `platform_suite` | `/operations?workspace=rabbi_sheller_provider` / provider workspace admin / all viewports | The server no longer granted `platform_suite`, but the client-side `service_provider` nav profile still contained `platform_suite`, relying on allowed-view filtering. | Removed `platform_suite` from the service-provider nav profile and added static/browser proof that provider nav excludes `platform_suite`, `admin`, `accounting`, and `students`. | `node --test tests/rabbi-scheller-auth-navigation-contract.test.js`; `node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs`; included in 79-test focused run. | LOCAL ONLY |
| Operations Rabbi workspace direct links loaded broad task data | `/operations?workspace=rabbi_sheller_provider&view=dashboard` / provider workspace admin and super-admin view-as / all viewports | Direct provider workspace links initialized `currentWorkspaceId`, but left `taskProjectFilter` as `all` unless a `project=` query was also present. Dashboard/task data could therefore be requested too broadly for platform users viewing the provider workspace. | Derived the initial task project filter from `initialWorkspaceKey`, so Rabbi workspace links initialize `taskProjectFilter` to `one_time_mishnah_class`; local smoke proves `/api/bna/tasks?project_key=one_time_mishnah_class` is requested. | `node --test tests/rabbi-scheller-auth-navigation-contract.test.js`; `node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs`; included in 79-test focused run. | LOCAL ONLY |
| Operations browser Back did not return between workspace pages | `/operations?workspace=rabbi_sheller_provider` / provider workspace admin / all viewports | Operations route updates used `replaceState` only and had no `popstate` handling, so browser Back left the app history rather than returning to the prior Operations deep link. | Initial normalization still uses `replaceState`; subsequent route changes use `pushState` when the URL changes, and `popstate` reloads the restored deep link through the existing server-backed initialization path. | `node --test tests/rabbi-scheller-auth-navigation-contract.test.js`; `node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs`; included in 79-test focused run. | LOCAL ONLY |
| Task detail linked tasks could leak cross-project child summaries | `/api/bna/tasks/:id` / provider-scoped Operations identity / not viewport-specific | The detail route called `assertTaskAccess` for the parent task, but then loaded linked children with `WHERE parent_task_id = $1` only. If a child task were mistakenly linked across projects, the provider-scoped response could expose the child summary. | Added scoped linked-task query construction with `opsScopeProjectKey(req)`, joined child tasks to `bna_projects`, and filters child rows by `p.project_key` for scoped logins. | `node --test tests/rabbi-scheller-tenant-isolation-contract.test.js tests/operations-task-queue-visibility.test.js`; included in 79-test focused run. | LOCAL ONLY |
| Route inventory was manual/stale risk | All routes / all roles / not viewport-specific | Route registry did not enumerate all Express arrays and API aliases needed for this audit. | Added `scripts/build-rabbi-scheller-route-map.mjs` and generated JSON route map. | `node --test tests/rabbi-scheller-route-map-contract.test.js`; included in focused run. | LOCAL ONLY |
| Generic auth endpoint was parent-only | `/api/bna/auth/login` and wrong-portal password login entries / Operations, provider, parent, student / not viewport-specific | The generic BNA auth endpoint only issued parent sessions, and valid provider/parent/student credentials typed into the wrong password portal could get a misleading invalid-credentials response. | Added `collectPortalLoginDestinations()`, safe destination redirects, chooser response support, destination-specific session issuing, wrong-portal redirect/chooser handling, provider/student/parent chooser rendering, and generic logout across all portal cookies. | `node --test tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/rabbi-scheller-auth-navigation-contract.test.js`; included in 77-test focused run. | LOCAL ONLY |
| Parent password login blocked non-email credentials in browser | `/parent` / provider, student, or Operations credential typed into parent password login / 390x844, 768x1024, 1440x900 | Server now accepts username/email identity, but the parent login field was still `type="email"`, preventing non-email credentials from submitting from that portal. | Changed the parent password login identity field to `type="text"` with username autocomplete and added chooser browser proof. | `node --test tests/portal-agnostic-auth-contract.test.js`; `node scripts/smoke-portal-agnostic-login-chooser-local.mjs` PASS at all three required viewports. | LOCAL ONLY |
| Portal chooser links were visible but not first-class registered actions | `/provider`, `/student`, `/parent` password login chooser / provider, student, parent, Operations identities / 390x844, 768x1024, 1440x900 | The chooser UI generated destination links after `chooser_required`, but those visible controls did not have a stable action hook or registry row. | Added `data-action-id="ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION"` to chooser links, added the root action registry row, regenerated One Time action coverage hash, and added auth/action contract assertions. | `node --test tests/portal-agnostic-auth-contract.test.js tests/watchdog-action-registry.test.js`; `node scripts/smoke-portal-agnostic-login-chooser-local.mjs`; included in 77-test focused run. | LOCAL ONLY |
| Provider section nav buttons were visible but not first-class registered actions | `/provider` / provider workspace member / 390x844, 768x1024, 1440x900 | The Provider Portal generated section buttons without a stable action hook, and the broader provider section graph had not been browser-walked beyond API Usage. | Added `data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION"` to generated provider nav buttons, added the root action registry row, regenerated One Time action coverage hash, added contract assertions, and added a local provider navigation smoke that clicks and direct-links every supported section. | `node --test tests/rabbi-scheller-auth-navigation-contract.test.js tests/watchdog-action-registry.test.js`; `node scripts/smoke-rabbi-scheller-provider-navigation-local.mjs`; included in 77-test focused run. | LOCAL ONLY |

The Provider Portal preview and server allowed-view repair are app-visible/server-visible local changes. No deployment/live-smoke can be claimed for this pass because `DEC-20260623-006` is still required before push/deploy/live verification.

## Intentionally excluded super-admin capabilities

- Platform-wide Operations admin.
- Cross-provider directory management inside provider workspace.
- BNA credentials, API keys, provider secrets, DNS, Stripe, Zoom, Vimeo, Resend configuration changes.
- BNA private notes, global BNA student goals, operator-only decisions, platform accounting, deployment controls, agent fleet controls.
- Service-provider studio super-admin controls until branch reconciliation and role gating are reviewed.

## Tests and verification

Commands run:

```text
node scripts/build-rabbi-scheller-route-map.mjs
node --test tests/provider-api-usage-readiness.test.js
node --test tests/rabbi-scheller-auth-navigation-contract.test.js
node --test tests/rabbi-scheller-route-map-contract.test.js
node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-operations-login-fallback.test.js tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/provider-login-phase12-audit.test.js tests/service-provider-directory.test.js tests/public-route-privacy-contract.test.js
node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-operations-login-fallback.test.js tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/provider-login-phase12-audit.test.js tests/service-provider-directory.test.js tests/public-route-privacy-contract.test.js tests/google-workspace-settings-contract.test.js tests/operations-one-time-view-as.test.js
node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/provider-login-phase12-audit.test.js tests/service-provider-directory.test.js tests/public-route-privacy-contract.test.js tests/google-workspace-settings-contract.test.js tests/operations-one-time-view-as.test.js tests/watchdog-action-registry.test.js
node --test tests/rabbi-scheller-tenant-isolation-contract.test.js tests/operations-task-queue-visibility.test.js
node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/operations-task-queue-visibility.test.js tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/provider-login-phase12-audit.test.js tests/service-provider-directory.test.js tests/public-route-privacy-contract.test.js tests/google-workspace-settings-contract.test.js tests/operations-one-time-view-as.test.js tests/watchdog-action-registry.test.js
node scripts/generate-one-time-action-coverage.mjs
node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs
node scripts/smoke-rabbi-scheller-provider-navigation-local.mjs
node scripts/smoke-rabbi-scheller-provider-api-usage-local.mjs
node scripts/smoke-portal-agnostic-login-chooser-local.mjs
node --check scripts/build-rabbi-scheller-route-map.mjs
node --check src/lib/bna/provider-api-usage.js
node --check server.js
node -e "JSON.parse(require('fs').readFileSync('ops/action-registry.json','utf8')); console.log('action registry ok')"
node -e "const fs=require('fs'); const p='ops/agent-task-ledger.jsonl'; const lines=fs.readFileSync(p,'utf8').trim().split(/\r?\n/); lines.forEach((line)=>JSON.parse(line)); console.log('ledger jsonl ok lines='+lines.length);"
npm run bna:run:status
npm run bna:run:next
```

Result:

- Focused suite: 79 tests passed, 0 failed after the provider allowed-view, Operations client provider-nav hardening, Operations direct provider-workspace task-project initialization, Operations URL history/back handling, Provider Portal section navigation action registration, Provider Portal API Usage preview, recorder, shared portal-login resolver, wrong-portal redirect/chooser, provider/student/parent chooser rendering, generic logout repairs, task search/detail tenant-isolation coverage, linked-child tenant-scoping repair, and visible action registry coverage for chooser links.
- Local Operations Rabbi workspace browser smoke: passed at 390x844, 768x1024, and 1440x900 with screenshots and report in `ops/playwright-smokes/2026-06-23-rabbi-scheller-operations-navigation-local/`; it proves Dashboard, Tasks, Members, Program/Schedule, Communications, API Usage, Settings, toolbar navigation, browser Back/deep-link reload, scoped task/workspace/project requests, no BNA-scoped requests, no super-admin nav labels, no failed requests, no console/page errors, and no horizontal overflow.
- Local Provider Portal navigation browser smoke: passed at 390x844, 768x1024, and 1440x900 with screenshots and report in `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/`; it proves every supported provider section direct-links and clicks correctly, exactly one active nav and one visible section, browser back from Settings to API Usage, refresh on Settings, no super-admin nav labels, no failed requests, no console/page errors, and no horizontal overflow.
- Local Provider Portal API Usage browser smoke: passed at 390x844, 768x1024, and 1440x900 with screenshots and report in `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/`; it proves direct `section=api_usage` deep-link, refresh, active nav state, click URL update, back-to-Overview behavior, no fake usage, no horizontal overflow, no console/page errors, and no failed requests.
- Local portal-agnostic login chooser browser smoke: passed for provider, student, and parent password login pages at 390x844, 768x1024, and 1440x900 with screenshots and report in `ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/`; it proves chooser visibility, Operations/Provider/Parent/Student destinations, server-resolved same-origin `redirect_to` links, masked passwords, and no horizontal overflow.
- Action registry JSON parse, watchdog action-registry test, and registry contracts passed for `ACTION-PROVIDER-SECTION-NAVIGATION`, `ACTION-PROVIDER-API-USAGE-PREVIEW-NAV`, and `ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION`; derived One Time action coverage regenerated cleanly at 40 controls.
- Ledger JSONL parse: passed, 1,328 lines after this update.
- Run CLI validation: passed.
- Active run still has remaining work; current next unblocked batch is Batch 6 `REQ-20260619-304` Operations UI/design-system correction.

Not run:

- Full authenticated Operations/provider live graph walk at 390x844, 768x1024, 1440x900.
- Fresh live Railway smoke of this pass.
- Deploy verification.

Reason: local fixture-based browser evidence is available for the new Provider Portal API Usage preview and portal login chooser UI, but this pass did not receive push/deploy authorization and the worktree/branch state requires reconciliation before live rollout.

## Remaining blockers and Decisions

| ID | Decision / blocker | Owner | Status | Blocks |
|---|---|---|---|---|
| DEC-20260623-006 | Authorize push/deploy/live-smoke for any repaired Rabbi Scheller workspace bundle. | Shloimie | Needs My Decision | Marking this pass pushed, deployed, or live-verified. |
| Q-20260623-027 | Confirm Rabbi Scheller production owner login identity. | Shloimie / Rabbi Scheller | Open | Live credential tests and owner assignment. |
| Q-20260623-028 | Decide Shloimie's exact role inside Rabbi Scheller workspace. | Shloimie | Open | Final role assignment and workspace switcher behavior. |
| Branch reconciliation | Current local branch is behind `origin/master`, which contains service-provider-studio and workspace-user work. | Codex after approval | Open | Completing parity without duplicating merged remote work. |
| Browser/live verification | Local Operations Rabbi workspace, Provider Portal navigation, Provider Portal API Usage preview, and portal chooser smokes passed; full authenticated live Operations/provider graph walk still needs approved environment and/or deploy path. | Shloimie/Codex | Open | Final UI/navigation evidence. |

## Exact links

Local/static:

- `/operations?workspace=rabbi_sheller_provider&view=dashboard`
- `/operations?workspace=rabbi_sheller_provider&view=tasks`
- `/operations?workspace=rabbi_sheller_provider&view=contacts&section=students`
- `/operations?workspace=rabbi_sheller_provider&view=content&section=library`
- `/operations?workspace=rabbi_sheller_provider&view=calendar&section=classes`
- `/operations?workspace=rabbi_sheller_provider&view=api_usage`
- `/provider/login`
- `/provider`
- `/provider?api_usage_preview=1&section=api_usage`
- `/student/login`
- `/parent/login`
- `/rabbi`
- `/rabbi/member`
- `/member-library`
- `/one-time-classroom`

Expected login behavior:

- Operations credentials on `/operations-login.html` -> authorized Operations destination.
- Operations credentials on `/provider/login`, `/student/login`, `/parent/login` -> Operations session only, redirect to safe `/operations` return target, not provider/student/parent session.
- Provider credentials on `/provider/login` -> provider portal session only.
- Student credentials on `/student/login` -> student portal session only.
- Parent credentials on `/parent/login` -> parent portal session only.
- Unauthorized role at a portal -> reject or explain access; never display unauthorized records.

## Final state for this audit artifact

PARTIAL
