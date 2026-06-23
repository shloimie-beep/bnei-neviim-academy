# Universal Service Provider Studio - Goal Mode Register

## Raw intake

Shloimie provided the attached prompt
`C:\Users\User\Downloads\CODEX_UNIVERSAL_SERVICE_PROVIDER_STUDIO_2026-06-23.md`
and instructed Codex to execute it in goal mode: audit and reuse canonical
implementation first, work only in a clean isolated worktree, implement and
test the complete feature, independently verify it, then integrate and merge it
into the repository's actual default branch only after all required gates pass.

Full raw wording is preserved at
`raw-input/RAW-20260623-001-universal-service-provider-studio.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260623-001 |
| Source | codex_chat / attached Downloads Markdown prompt |
| Source path | `C:\Users\User\Downloads\CODEX_UNIVERSAL_SERVICE_PROVIDER_STUDIO_2026-06-23.md` |
| Repo raw path | `raw-input/RAW-20260623-001-universal-service-provider-studio.md` |
| SHA-256 | `3B6B88280C25591236CFEE5676A84733C0E775019BBF8569B90C630A6F49657E` |
| Parse status | Registered |
| Requirement register | `tasks-pending/2026-06-23-universal-service-provider-studio.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Execute the Universal Service Provider Studio prompt end to end: intake/register, canonical audit, implementation, tests, independent verification, and merge to actual default branch after gates pass. |
| Goal tool used | yes |
| GPT output contract | `tasks-pending/_template-goal-mode-correction-output.md` |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes, unless default-branch auto-deploy is unavailable or explicitly blocked |
| Next requirement IDs to work | none; all registered requirements are terminal Done |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260623-001 | Establish raw intake, clean worktree, active execution run, and merge-safe git truth. | RAW-20260623-001 / SRC-20260623-001..004 | all / service-provider-studio | Codex | run_control | P0 | A | none | Raw prompt preserved; dirty checkout untouched; feature worktree clean; actual default branch and PR #5 state recorded; active Studio run validates. | raw-input, memory, tasks-pending, ops/execution-runs | no | Done |
| REQ-20260623-002 | Audit and reuse canonical provider, content, prompt, Remotion, job, usage, and RBAC primitives before building. | RAW-20260623-001 / SRC-20260623-005 | service_provider / all | Codex | audit | P0 | A | REQ-20260623-001 | `docs/product/service-provider-studio-baseline-2026-06-23.md` classifies every major capability as already_verified, partial, missing, conflicting, or blocked_external. | docs/product, server.js, public, src, tests | no | Done |
| REQ-20260623-003 | Add additive Studio schema/domain services for projects, immutable sources, briefs, characters, guardrails, scenes, versions, assets, exports, and idempotent migration repeatability. | RAW-20260623-001 / SRC-20260623-006..009 | service_provider / all | Codex | backend | P0 | B | REQ-20260623-002 | Additive migration reruns safely; raw source is immutable/versioned; stages are separate from approvals/render/publish; no large binaries in Postgres. | server.js, src, railway migrations, tests | yes | Done |
| REQ-20260623-004 | Enforce Studio RBAC and tenancy across provider, editor, reviewer, viewer, and Super Admin access. | RAW-20260623-001 / SRC-20260623-010 | service_provider / all | Codex | security | P0 | B | REQ-20260623-003 | Provider A cannot enumerate provider B Studio objects or usage; public/member routes cannot access drafts; Super Admin aggregation is explicit. | server.js, src, tests | yes | Done |
| REQ-20260623-005 | Implement source paste, sanitization, normalization, annotations, and WebKit/Safari paste recovery. | RAW-20260623-001 / SRC-20260623-011..014 | service_provider / all | Codex | frontend_backend | P0 | D | REQ-20260623-003 | Plain/rich/Hebrew/mixed RTL paste works; raw source is never overwritten; emphasis is stored as annotation; unsafe clipboard HTML is stripped; WebKit paste tests pass. | public, server.js, src, tests, scripts | yes | Done |
| REQ-20260623-006 | Implement deterministic layered prompt compiler, version history, schema validation, and prompt-injection defense. | RAW-20260623-001 / SRC-20260623-015..017 | service_provider / all | Codex | prompt_engine | P0 | C | REQ-20260623-003 | Prompt layers are visible/versioned/compiled in order; untrusted source is delimited; invalid structured output is rejected or repaired; adversarial pasted instructions cannot override policy. | src, server.js, public, tests | yes | Done |
| REQ-20260623-007 | Implement natural-language correction preview/apply/revert with scene, character, project, and workspace-default scopes. | RAW-20260623-001 / SRC-20260623-018 | service_provider / all | Codex | prompt_engine | P0 | C | REQ-20260623-006 | Corrections become structured patches; broad changes show affected layers and require confirmation; every material change has history and rollback. | src, server.js, public, tests | yes | Done |
| REQ-20260623-008 | Add Studio as a separate provider module before Content with canonical shell, dashboard, project tabs, and responsive layout. | RAW-20260623-001 / SRC-20260623-019..020 | service_provider / all | Codex | frontend | P0 | D | REQ-20260623-004 | Studio appears before Content for service providers, not for unauthorized/family workspaces; dashboard shows operational project facts, usage, job errors, and next actions. | public, server.js, ops/action-registry.json, ops/route-registry.json, tests | yes | Done |
| REQ-20260623-009 | Implement storyboard/slideshow/video editor v1 with preview, scene rail, inspector, timeline, responsive mobile/tablet behavior, and version compare. | RAW-20260623-001 / SRC-20260623-021 | service_provider / all | Codex | frontend | P0 | E | REQ-20260623-008 | Add/duplicate/delete/reorder scenes; edit title/body/narration/assets/duration/transition/text styling/focal point/characters; preview sequence; no horizontal overflow at 390/768/1440. | public, src, tests, scripts | yes | Done |
| REQ-20260623-010 | Implement durable Studio jobs, deterministic mock generation/rendering, asset metadata, retry/cancel/stale visibility, and render/export records. | RAW-20260623-001 / SRC-20260623-022..023 | service_provider / all | Codex | jobs_rendering | P0 | F | REQ-20260623-003 | Jobs are scoped, idempotent, observable, retryable, cancellable, and mockable without live vendor credentials; assets carry rights/privacy metadata. | src, server.js, scripts, tests | yes | Done |
| REQ-20260623-011 | Implement Studio AI usage metering, price catalog, budgets, limits, alerts, provider usage view, and Super Admin aggregate view. | RAW-20260623-001 / SRC-20260623-024 | service_provider / all | Codex | usage_metering | P0 | G | REQ-20260623-010 | Every mock/vendor attempt logs workspace/provider/user/model/operation/tokens/media/latency/status/cost; provider sees own totals only; Super Admin sees explicit aggregate; hard limits and audited override work. | src, server.js, public, tests | yes | Done |
| REQ-20260623-012 | Implement approved Studio output handoff to existing Content/Library drafts without automatic publication. | RAW-20260623-001 / SRC-20260623-025 | service_provider / all | Codex | content_handoff | P0 | H | REQ-20260623-009, REQ-20260623-010 | Handoff is idempotent, carries provenance/rights/usage/manifest data, creates canonical content draft, and never publishes or grants member access automatically. | src, server.js, public, tests | yes | Done |
| REQ-20260623-013 | Seed and verify Rabbi Eli Scheller / One Time as a configuration-only pilot fixture. | RAW-20260623-001 / SRC-20260623-026 | rabbi_sheller_provider / one_time_mishnah_class | Codex | fixture | P1 | H | REQ-20260623-003, REQ-20260623-012 | One Time config includes Mishnah source, goal, three scenes, two characters, Jewish context pack, correction patches, mock image/render, content draft handoff, and usage rollups without hard-coding global behavior. | config, src, tests, docs | yes | Done |
| REQ-20260623-014 | Complete documentation, route/action registries, security/privacy docs, tests, watchdogs, browser evidence, independent verification, and final audit. | RAW-20260623-001 / SRC-20260623-027..030 | all / service-provider-studio | Codex | verification | P0 | I | REQ-20260623-003..REQ-20260623-013 | Required docs exist; focused/full tests, watchdogs, secret/large-file scans, migration repeat tests, Chromium/WebKit 390/768/1440, and independent verification pass or blockers are explicit. | docs, ops, tests, scripts | no | Done |
| REQ-20260623-015 | Integrate from a clean integration worktree and merge to the actual default branch only after all gates pass. | RAW-20260623-001 / SRC-20260623-031 | repository / master | Codex | integration | P0 | J | REQ-20260623-014 | Clean integration worktree from latest default; conflicts reviewed; feature branch merged/pushed to actual default branch or exact branch-protection blocker recorded; final default worktree clean. | git, ops, docs | no | Done |

## Parsed tasks

Visible human task fan-out is intentionally not created. This is Codex-owned
goal-mode implementation work. Human/external decisions are listed only if a
real credential/account/legal/financial/privacy choice blocks a requirement.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260623-001 | studio-goal-mode-execution | Implement and verify Universal Service Provider Studio from the registered prompt. | Codex | all service-provider workspaces | RAW-20260623-001 | REQ-20260623-001..REQ-20260623-015 | Default branch pushed and live-smoked; monitor for follow-up refinements only. | Agent lifecycle | completed |

## Decisions

No human/external blocker is required at intake. Live paid/vendor generation,
real provider sends, billing, DNS, Vimeo/Zoom/Google/Buffer writes, and Railway
topology changes are explicitly out of scope unless separately approved.

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260623-001 | Does the default branch auto-deploy after push/merge? | App-visible Done status needs deploy/live proof unless unavailable or blocked. | no | Answered: live app and Studio read-only smokes passed after default push; Railway doctor metadata was blocked by missing token. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260623-001 | Service-provider workspaces need a separate Studio module before Content for pre-production lesson/media preparation. | promoted | Added to `MEMORY.md` under Service Provider Network after default push/live smoke. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260623-001 | raw-input, memory, tasks-pending, ops/execution-runs | Register source and active run in clean worktree. | `npm run bna:run:validate` PASS; `npm run bna:run:next` PASS. | pending | pending | n/a |
| REQ-20260623-002 | docs/product baseline plus inspected files | Inspected canonical Operations, provider workspace, content/prompt, job, Remotion, usage, registry, and browser-smoke patterns; documented reuse plan. | Baseline artifact created at `docs/product/service-provider-studio-baseline-2026-06-23.md`. | pending | pending | n/a |
| REQ-20260623-003..REQ-20260623-013 | server.js, public, src, migrations, tests, registries | Implement complete credential-free Studio product slice. | `npm test` PASS 1060/1060 locally and 1063/1063 after integration; Studio live smoke PASS. | `4936394a` | `2d49578e` | live smoke `ops/live-smokes/2026-06-23T07-33-52-389Z-service-provider-studio-live-smoke.md` |
| REQ-20260623-014 | docs, ops, screenshots, verification reports | Independent second pass from clean state. | Clean integration gates PASS; watchdog reports `2026-06-23T07-28-*`; standard and Studio live smokes PASS. | `4936394a` | `2d49578e` | `ops/live-smokes/2026-06-23T07-32-08-023Z-live-app-smoke.md`; `ops/live-smokes/2026-06-23T07-33-52-389Z-service-provider-studio-live-smoke.md` |
| REQ-20260623-015 | clean integration worktree/default branch | Merge only after gates. | Clean integration from `origin/master` at `4d412797` passed; default push advanced `origin/master` to `2d49578e`; live smokes passed. | `4936394a` | `2d49578e` | standard app smoke and Studio read-only smoke passed |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260623-001 | Done | Raw prompt, memory record, requirement register, active execution run, `npm run bna:run:validate` PASS. | raw-input, memory, tasks-pending, ops/execution-runs | `npm run bna:run:validate` PASS; `npm run bna:run:next` PASS. | none |
| REQ-20260623-002 | Done | `docs/product/service-provider-studio-baseline-2026-06-23.md`; inspected `server.js`, `public/operations.html`, `src/remotion`, content APIs, scope helpers, registries, and Playwright smoke patterns. | docs/product/service-provider-studio-baseline-2026-06-23.md, tasks-pending register, run docs | Canonical baseline audit completed before product-code edits. | none |
| REQ-20260623-003 | Done | Additive schema/domain implemented and locally verified. | `railway-migration-2026-06-23-service-provider-studio.sql`; `src/lib/bna/service-provider-studio.js`; `server.js`; tests | Focused Studio tests PASS; `npm test` PASS 1060/1060. | none |
| REQ-20260623-004 | Done | Scoped API allowlist, project ownership checks, and private route registry implemented. | `server.js`; `ops/route-registry.json`; `docs/security/service-provider-studio-privacy.md`; tests | Route-security watchdog PASS; focused/full tests PASS. | none |
| REQ-20260623-005 | Done | Source paste/sanitize/normalize and annotation flow implemented; raw source withheld from API readback. | `src/lib/bna/service-provider-studio.js`; `server.js`; `public/operations.html`; tests | Browser smoke PASS; focused/full tests PASS. | none |
| REQ-20260623-006 | Done | Layered prompt compiler, untrusted source boundaries, schema validation, and injection defense implemented. | `src/lib/bna/service-provider-studio.js`; `server.js`; `public/operations.html`; docs/tests | Focused domain tests PASS; full suite PASS. | none |
| REQ-20260623-007 | Done | Correction preview/apply workflow implemented with structured patches and confirmation path. | `src/lib/bna/service-provider-studio.js`; `server.js`; `public/operations.html`; tests | Browser smoke PASS; focused/full tests PASS. | none |
| REQ-20260623-008 | Done | Operations Studio module added before Content for provider/platform views; family/household excluded. | `public/operations.html`; `server.js`; registries; tests | Action watchdog PASS; route-security watchdog PASS; focused/full tests PASS. | none |
| REQ-20260623-009 | Done | Storyboard editor, scene rail/inspector, preview, and responsive handoff flow implemented. | `public/operations.html`; `src/lib/bna/service-provider-studio.js`; browser smoke screenshots | `npm run studio:smoke` PASS; desktop/mobile screenshots saved. | none |
| REQ-20260623-010 | Done | Mock render/job/export/asset records and retry/cancel flow implemented without vendor writes. | `src/lib/bna/service-provider-studio.js`; `server.js`; migration; tests/docs | Focused/full tests PASS. | none |
| REQ-20260623-011 | Done | Usage events, price catalog, budget rollups, and API Usage Studio cards implemented. | `src/lib/bna/service-provider-studio.js`; `server.js`; `public/operations.html`; docs/tests | Focused/full tests PASS. | none |
| REQ-20260623-012 | Done | No-publish Content handoff implemented with provenance and idempotent local draft creation. | `src/lib/bna/service-provider-studio.js`; `server.js`; `public/operations.html`; tests/docs | Focused/full tests PASS; browser handoff smoke PASS. | none |
| REQ-20260623-013 | Done | One Time/Rabbi pilot fixture implemented as configuration-only helper data, not global hard-coding. | `src/lib/bna/service-provider-studio.js`; `docs/product/service-provider-studio.md`; tests | Focused/full tests PASS. | none |
| REQ-20260623-014 | Done | Docs, registry rows, browser evidence, full suite, secret scan, diff check, and watchdogs passed locally. | docs, tests, `ops/watchdog-audits/2026-06-23T07-19-*`, `ops/playwright-smokes/2026-06-23-service-provider-studio-local/` | `npm test` PASS 1060/1060; watchdogs PASS; secret scan PASS; `git diff --check` PASS. | none |
| REQ-20260623-015 | Done | Clean integration worktree from updated `origin/master` merged the feature branch with no conflicts and passed integration gates. | run docs; integration watchdog reports `ops/watchdog-audits/2026-06-23T07-28-*` | `npm test` PASS 1063/1063; `npm run studio:smoke` PASS; watchdogs PASS; secret scan PASS; `git diff --check` PASS. | none |
