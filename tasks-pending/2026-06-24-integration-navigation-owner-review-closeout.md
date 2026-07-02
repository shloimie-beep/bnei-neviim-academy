# Ramble Intake - 2026-06-24 - integration-navigation-owner-review-closeout

## Raw intake

Shloimie provided a credential-free closeout assignment after reviewing the
Telegram/website-assistant reports. The core correction is that control-plane
coverage does not prove the application is integrated, discoverable,
navigable, or owner-review ready.

Raw storage:
`raw-input/RAW-20260624-001-integration-navigation-owner-review-closeout.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-001 |
| Source | Codex chat |
| Parse status | registered |
| Requirement register | this file |
| Active execution run | `ops/execution-runs/2026-06-21-one-time-master-completion` |
| PR inputs | PR #12 head `428ee78682a201b233b2f3da71bf0205b48812ad`; PR #13 head `6560b8f02580e5f182a95df84ad8d5383403d887`; current `origin/master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| Guardrail | Credential-free only: no production readback, no production DB mutation, no backfill, no deploy, no external sends/uploads/publish/charge/DNS/OAuth/secret requests |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes; execution requested through a Codex prompt packet with terminal acceptance |
| Active goal objective | Complete the credential-free Integration, Navigation, and Owner-Review Closeout pass for BNA. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then complete credential-free integration/navigation/owner-review requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no for this pass; deploy and live production readback are explicitly blocked until owner approval |
| Next requirement IDs to work | `REQ-20260624-008` credential-free desktop/mobile browser QA, using PR #14 commit `d853b920` as the assistant-visible integrated baseline. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-001 | Discover all integration sources and create one clean credential-free owner-review integration branch/PR from current `origin/master`. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | integration_branch | P0 | A | none | PR #12, PR #13, and the final running-agent SHA are identified or blocked precisely; `server.js` and `public/operations.html` conflicts are resolved; one release-candidate SHA and owner-review PR exist; PR #12/#13 are noted as superseded/stacked as appropriate. | git branch/worktree; GitHub PR metadata; `server.js`; `public/operations.html`; owner-review docs | no | Done |
| REQ-20260624-002 | Run clean credential-free validation on the integrated release candidate and add an independent CI/status check if missing. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | validation_ci | P0 | B | REQ-20260624-001 | Clean install, full tests, secret audit, security watchdogs, route watchdogs, and independent clean-worktree verification pass or have precise blockers; release candidate has a GitHub Actions/status check path. | `package.json`; `.github/workflows/*`; test/watchdog scripts; owner-review proof | no | Needs operator decision |
| REQ-20260624-003 | Automatically inventory every page, route, link, form destination, redirect, service worker route, manifest entry, login/logout destination, and assistant/API deep link. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | route_inventory | P0 | C | REQ-20260624-001 | Generated inventory covers public HTML, server UI/API routes, aliases, redirects, literal and JS-generated links, `window.location`, form actions, manifests, service worker cache, login success, logout, and deep links; no manually curated-only route list. | route inventory script; `ROUTE-INVENTORY.csv`; `CANONICAL-SITEMAP.md`; route/action registries | no | Done |
| REQ-20260624-004 | Produce canonical route matrix, navigation graph, orphan/duplicate report, and fix unexplained customer-facing orphan pages, broken links, dead ends, auth loops, duplicate destinations, and missing return paths. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | navigation_architecture | P0 | D | REQ-20260624-003 | Every customer-facing page is discoverable or intentionally classified; internal-only pages are explicit; forms target implemented endpoints; protected pages have login/recovery paths; public navigation returns expected local statuses. | shared nav files; public HTML; server routes; `NAVIGATION-GRAPH.md`; `ORPHAN-AND-DUPLICATE-PAGES.md`; tests | no | Done |
| REQ-20260624-005 | Canonicalize the One Time journey across `/one-time`, `/rabbi`, `/rabbi-member`, `/member-library`, `/member`, and `/one-time-classroom`. | RAW-20260624-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | one_time_journey | P0 | E | REQ-20260624-004 | One obvious local journey exists from public landing to member access, member home, library, classroom/live class, questions/support, account/logout, and return-to-site; preview/internal pages are labeled internal or removed from user navigation. | One Time public/member HTML; server aliases/redirects; route registry; Playwright journey evidence | no | Done |
| REQ-20260624-006 | Repair public, provider, parent, student, provider-participant, and Operations information architecture and shared navigation on the integrated branch. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | information_architecture | P0 | F | REQ-20260624-004 | Public nav emphasizes School/Families/Provider Directory/One Time/Blog-FAQ/Registration/Portal Login; Operations is not primary consumer nav unless explicitly justified; provider, parent, student, and admin surfaces have clear home/back/help/account/logout paths and safe auth failure recovery. | shared nav; public/portal HTML; route registry; owner-review docs; tests | no | Done |
| REQ-20260624-007 | Make shared website assistant parity visible and correctly scoped on every intended user surface. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | assistant_visibility | P0 | G | REQ-20260624-006 | Public visitor, parent, student, provider, One Time member, and Operations surfaces have discoverable helper/help entry, scope wording, continuity, empty/loading/failure/unauthorized states, preview/approval UI where needed, unsupported-work handoff, and no duplicate assistant implementation. | shared assistant UI; portal HTML; control-plane code; role-flow QA evidence | no | Done |
| REQ-20260624-008 | Run credential-free desktop/mobile browser QA across all primary roles with synthetic local fixtures and mock integrations. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | browser_role_qa | P0 | H | REQ-20260624-005, REQ-20260624-006, REQ-20260624-007 | Public, parent one-child, parent multi-child, student, provider admin, provider participant/member, One Time member, super-admin, wrong-role, and logged-out journeys pass desktop/mobile Playwright checks for navigation/back/deep-link/refresh/login/logout/empty/loading/failure/API errors/console/images/links/mobile controls with no external writes. | Playwright scripts; `ROLE-FLOW-QA.md`; screenshots/evidence under `ops/playwright-smokes/` | no | Pending |
| REQ-20260624-009 | Rerun and reconcile the existing UX/click-map backlog against the integrated branch. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | ux_backlog_reconciliation | P1 | I | REQ-20260624-008 | Prior click-map issues are classified as resolved, still reproducible, superseded, false positive, intentionally deferred, or external-credential blocked; priority areas include parent/student assistant visibility, placeholders, provider participant/student confusion, small mobile controls, and provider workspace complexity. | click-map/audit scripts; `UX-BACKLOG-RECONCILIATION.md`; evidence artifacts | no | Pending |
| REQ-20260624-010 | Add permanent release gates for all-page discovery, route implementation, dead links, orphan pages, duplicate canonical pages, form destinations, auth recovery paths, safe return paths, mobile navigation, registry/doc drift, and visible controls without handlers. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | release_gates | P0 | J | REQ-20260624-003, REQ-20260624-004 | Tests fail for unexplained customer-facing orphan pages, internal links to unregistered routes, registered UI routes without implementations, duplicate canonical pages, absent form endpoints, protected pages without login/recovery, missing return paths, unexpected public navigation statuses, inaccessible mobile nav, doc-only routes, and visible buttons without handlers. | route/nav watchdog scripts; tests; package scripts; CI workflow | no | Pending |
| REQ-20260624-011 | Produce the owner-review packet and final blocker list. | RAW-20260624-001 | bna_platform / integration_navigation_owner_review | Codex | owner_review_packet | P0 | K | REQ-20260624-001 through REQ-20260624-010 | `APPLIED-NOT-APPLIED-MATRIX.md`, `CANONICAL-SITEMAP.md`, `ROUTE-INVENTORY.csv`, `NAVIGATION-GRAPH.md`, `ORPHAN-AND-DUPLICATE-PAGES.md`, `ROLE-FLOW-QA.md`, `UX-BACKLOG-RECONCILIATION.md`, desktop/mobile evidence, `OWNER-REVIEW-SCRIPT.md`, exact release SHA, and a blocker list limited to genuine external credentials, production approvals, and operator decisions exist. | owner-review packet docs; evidence directories; execution-run closeout | no | Pending |

## Parsed tasks

No visible human Tasks were created. This is Codex/Agent integration and QA
work. External approvals remain explicit blockers only after local
credential-free work is complete.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-001 | integration-navigation-owner-review-closeout | Produce a credential-free integrated owner-review candidate and navigation QA packet. | Codex | bna_platform / integration_navigation_owner_review | RAW-20260624-001 | REQ-20260624-001 through REQ-20260624-011 | Continue `REQ-20260624-008` browser role QA on PR #14. | Agent lifecycle only | Running |

## Decisions

No new external approval is required to start. The source explicitly forbids
production readback, production mutation, deployment, sends, uploads, charges,
DNS, OAuth/account-owner actions, and secret requests during this pass.

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-001 | Which third/final running-agent SHA should be included if it is not PR #12 or PR #13? | The prompt references "the final pushed SHA from the currently running agent" but only names PR #12 and PR #13 heads. | Codex first, Shloimie only if not discoverable from GitHub/local state | Inspect local/GitHub branches and open PRs; if no third candidate exists, record PR #13 `6560b8f0` as the final known running-agent SHA and proceed. | Pause and ask Shloimie for the SHA. | Asking early would delay credential-free work that can continue from known refs. | Discovery found only PR #12 and PR #13 open; current `origin/master` is the additional base/source SHA. | REQ-20260624-001 | Resolved |
| DEC-20260624-002 | Should the repo owner grant GitHub `workflow` scope or manually add the credential-free CI workflow? | GitHub rejected pushing `.github/workflows/credential-free-ci.yml` from the current OAuth app because it lacks `workflow` scope. | Shloimie / GitHub repository token owner | Grant workflow-scope credential or have a repo owner add the credential-free CI workflow. | Explicitly accept PR #14 without independent GitHub status checks for this pass. | Without workflow scope, local validation can pass but PR #14 will not have independent GitHub Actions checks. | Decide whether to grant workflow scope/add workflow or accept no independent status check. | REQ-20260624-002 | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260624-001 | Is there a third branch beyond PR #12 and PR #13 that must be included? | The prompt mentions a final pushed SHA from a currently running agent without providing the SHA. | not initially | Resolved; discovery found only PR #12 and PR #13 as open integration inputs, with PR #13 head treated as the final known running-agent SHA. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260624-001 | Before owner review, BNA should consolidate active feature branches into one credential-free integration candidate and prove real navigation, role journeys, route inventory, and owner-review readiness before production readback/deploy/credentials. | yes | Stable release-readiness workflow preference. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-001 | integration branch, PR #12, PR #13, PR #14 | Completed source discovery and integration branch. PR #12 and PR #13 merged cleanly into `codex/integration-navigation-owner-review-20260624`; draft PR #14 opened; PR #12/#13 commented as superseded for owner-review. | `gh pr view 12`; `gh pr view 13`; clean worktree from `origin/master`; merge PR #12 PASS; merge PR #13 PASS; push PASS; PR #14 `mergeStateStatus=CLEAN`. | `fc4d8814` | `fc4d8814` / draft PR #14 | deployment intentionally blocked |
| REQ-20260624-002 | test/watchdog scripts; route/action registries | Local validation passed; CI workflow creation blocked by missing GitHub `workflow` scope. | `npm ci` PASS; `npm test` PASS 1202/1202; `npm run secrets:audit` PASS; `node --test tests/watchdog-action-registry.test.js` PASS 5/5; `npm run watchdog:links` PASS 0 findings; `npm run watchdog:actions` PASS 0 findings; `npm run watchdog:security` PASS 0 findings. | `fc4d8814` | `fc4d8814` / draft PR #14 | deployment intentionally blocked; CI status check blocked by GitHub workflow scope |
| REQ-20260624-003 | route inventory script and owner-review docs | Added generated inventory baseline on PR #14 commit `094ca7c6`: 689 route rows, 34 HTML pages, 753 server route declarations, 71 linked destinations, 0 missing implementation rows, 44 customer-facing orphan-review rows, and 26 duplicate implementation groups. | `npm run owner-review:routes` PASS; `node --test tests/owner-review-route-inventory.test.js` PASS; push PASS. | `094ca7c6` | `094ca7c6` / draft PR #14 | deployment intentionally blocked |
| REQ-20260624-004 | shared nav, public/provider helper links, One Time member/library/classroom/participant pages, owner-review route inventory generator/artifacts | Repaired the generated navigation findings on PR #14 commit `e4378c31`: One Time is primary nav, provider onboarding uses canonical `/providers/join`, One Time pages expose member/library/classroom/support/public return links, and route inventory reports 0 orphan-review rows and 0 duplicate implementation groups. | `owner-review:routes` PASS; focused route/provider/public suite 36/36 PASS; `npm test` 1203/1203 PASS; secret audit PASS; link/action/security watchdogs PASS. | `e4378c31` | `e4378c31` / draft PR #14 | deployment intentionally blocked |
| REQ-20260624-005 | One Time public/member pages; server aliases/redirects; route registry; Playwright smoke | Canonicalized the local One Time path on PR #14 commit `3375c9fe`: `/one-time` -> `/rabbi-member` -> `/member-library` -> `/one-time-classroom` -> questions/support -> account/logout -> return to public site. | `npm run one-time:smoke:canonical-journey-local` PASS; focused contracts 23/23 PASS; `npm test` 1207/1207 PASS; route inventory, secret audit, and link/action/security watchdogs PASS. | `3375c9fe` | `3375c9fe` / draft PR #14 | deployment intentionally blocked |
| REQ-20260624-006 | Shared public nav; parent/student/provider portal topbars; owner-review docs; parity artifacts | Repaired integrated IA on PR #14 commit `ca49a140`: direct public nav for School/Families/Provider Directory/One Time/Blog/FAQ/Portal Login/Register, Operations absent from consumer nav, and parent/student/provider topbars include stable home/help/return links. | Focused IA/privacy suite 27/27 PASS; `npm test` 1207/1207 PASS; route inventory, parity, secret audit, and link/action/security watchdogs PASS. | `ca49a140` | `ca49a140` / draft PR #14 | deployment intentionally blocked |
| REQ-20260624-007 | Shared assistant widget and role surfaces | Completed on PR #14 commit `d853b920`: One Time pages use `one_time_member` scope, parent/student/provider topbars open the shared assistant, Operations keeps BNA Helper, and route/parity evidence was regenerated. | Focused assistant contracts 66/66; full suite 1208/1208; route inventory; One Time smoke; secret audit; link/action/security watchdogs. | `d853b920` | `d853b920` / draft PR #14 | deployment intentionally blocked |
| REQ-20260624-008 through REQ-20260624-011 | Browser QA, UX backlog, release gates, owner-review packet | Pending implementation after assistant-visible integrated baseline. | Pending | pending | pending | deployment intentionally blocked |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-001 | Done | Draft PR #14, release-candidate SHA `fc4d8814`, PR #12/#13 source heads, and superseded comments. | Integrated branch and route/parity preflight commit. | Branch/PR discovery, clean merges, push, and PR creation passed. | None for this requirement. |
| REQ-20260624-002 | Needs operator decision | Local validation proof exists; CI workflow push rejected by GitHub `workflow` scope policy. | Route aliases, regenerated parity artifacts, local tests/watchdogs. | Local validation passed. | GitHub workflow/status-check creation requires owner/token decision. |
| REQ-20260624-003 | Done | `docs/owner-review/ROUTE-INVENTORY.csv`, `CANONICAL-SITEMAP.md`, `NAVIGATION-GRAPH.md`, `ORPHAN-AND-DUPLICATE-PAGES.md`, and pushed PR #14 commit `094ca7c6`. | Inventory generator, npm script, test, and generated owner-review docs. | `owner-review:routes` and focused route-inventory test passed. | Superseded by repaired inventory baseline under `REQ-20260624-004`. |
| REQ-20260624-004 | Done | PR #14 commit `e4378c31`, regenerated owner-review docs, shared nav changes, canonical provider join route, One Time member/library/classroom/support return paths. | Route inventory generator/artifacts, public/One Time/provider HTML, helper knowledge, tests. | `owner-review:routes`; focused route/provider/public suite 36/36; `npm test` 1203/1203; secret audit; link/action/security watchdogs. | None for this requirement. |
| REQ-20260624-005 | Done | PR #14 commit `3375c9fe`, route aliases/redirects, route registry classification, desktop/mobile Playwright smoke report, full route inventory. | `server.js`, One Time public/member pages, route registry, smoke script, tests, owner-review artifacts. | Local Playwright smoke; focused contracts 23/23; `npm test` 1207/1207; route inventory; secret audit; link/action/security watchdogs. | None for this requirement. |
| REQ-20260624-006 | Done | PR #14 commit `ca49a140`, direct public nav, portal topbar home/help links, regenerated owner-review docs and universal parity. | `public/js/bna-site-nav.js`, parent/student/provider portal HTML, IA/privacy tests, route docs, parity artifacts. | Focused IA suite 27/27; parity generator/test; `npm test` 1207/1207; route inventory; secret audit; link/action/security watchdogs. | None for this requirement. |
| REQ-20260624-007 | Done | PR #14 commit `d853b920`, shared assistant launcher and One Time member scope, regenerated route/parity artifacts, and current local watchdog evidence. | `server.js`, `public/js/bna-bot-widget.js`, parent/student/provider/One Time member HTML, tests, route/parity artifacts. | Focused assistant contracts 66/66; `npm test` 1208/1208; `owner-review:routes`; One Time smoke; secret audit; link/action/security watchdogs. | None for this requirement. |
| REQ-20260624-008 through REQ-20260624-011 | Pending | Assistant-visible integrated baseline exists. | Pending. | Pending. | Browser QA, backlog reconciliation, release gates, and owner-review packet remain. |
