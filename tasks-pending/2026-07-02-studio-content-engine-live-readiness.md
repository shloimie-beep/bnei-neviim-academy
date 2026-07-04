# Studio Content Engine Live Readiness - 2026-07-02

## Raw intake

See `raw-input/RAW-20260702-010-studio-content-engine-live-readiness.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260702-010 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-02-studio-content-engine-live-readiness.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Current-state audit and focused implementation slices approved by operator follow-up: polished Studio review readbacks, reusable prompt/character/guardrail library, local source-to-review-pack workflow, and Studio layout cleanup. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260702-968, then REQ-20260702-969 |

## Current-state inspection summary

Inspected:

- `BNA-START-HERE.md`
- `docs/BNA-RAMBLE-TO-DONE.md`
- `docs/PRODUCT-QUALITY-COMPILER.md`
- `docs/RAMBLE-ROUTER.md`
- `memory-topics/one-time-rabbi-sheller.md`
- `memory-topics/provider-pipelines.md`
- `memory-topics/service-provider-classrooms.md`
- `memory-topics/ui-quality-goals.md`
- `memory-topics/design-references.md`
- `memory-topics/workspace-scope-isolation.md`
- `src/lib/bna/service-provider-studio.js`
- `server.js` Studio API block
- `public/operations.html` Studio renderer/handlers
- `railway-migration-2026-06-23-service-provider-studio.sql`
- `ops/route-registry.json` Studio route entries
- `ops/action-registry.json` Studio action entries
- `docs/product/service-provider-studio-baseline-2026-06-23.md`
- `docs/product/service-provider-studio.md`
- `ops/live-smokes/2026-06-23T07-33-52-389Z-service-provider-studio-live-smoke.md`
- `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`

Findings:

- Studio exists as a private Operations module at `/operations?view=studio`.
- Schema/API/UI scaffold covers projects, source intake, storyboard scenes,
  prompt layers, correction patches, mock jobs, usage, and local Content
  handoff.
- Current generation is deterministic/mock. It does not call live AI/video
  vendors and does not produce final slideshow/video assets.
- The UI exposes compiled prompts and job manifests in raw code/JSON blocks.
  This is likely what Shloimie saw when he clicked around.
- Live unauthenticated `/operations?view=studio`,
  `/api/bna/studio/dashboard`, and `/api/bna/studio/usage` return 401, as
  expected for private Operations.
- The 2026-06-23 live smoke proved the route/API existed then, but it was
  read-only and did not create a real Studio project.
- Current local focused Studio checks pass.

Verification run:

- `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js` - PASS, 11/11.
- `npm run studio:smoke` - PASS, browser no-send workflow.
- Live logged-out checks - PASS expected 401 for private Studio route/API.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/02-polished-review-ux.product-quality.json` - PASS.
- `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` - PASS, 12/12.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/03-prompt-character-guardrail-library.product-quality.json` - PASS.
- `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` - PASS, 12/12 after library implementation.
- `npm run studio:smoke` - PASS after library implementation.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/04-source-to-slideshow-output-pipeline.product-quality.json` - PASS.
- `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` - PASS, 12/12 after review-pack implementation.
- `npm run studio:smoke` - PASS after review-pack implementation.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/05-studio-desktop-layout-cleanup.product-quality.json` - PASS.
- `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` - PASS, 12/12 after layout cleanup.
- `npm run studio:smoke` - PASS after layout cleanup.
- `npm run watchdog:actions` - PASS, finding_count=0.
- `npm run watchdog:protocol-drift` - PASS, findings=0.

## 2026-07-04 release branch closeout

| Field | Value |
|---|---|
| Release branch | `codex/studio-content-engine-release-20260704` |
| Base branch | `codex/rabbi-onetime-ui-cleanup-release-20260703` |
| PR URL | pending after push |
| Scope | Studio content engine prompt-layer/library/review-pack evidence and tests stacked on PR #87 |
| Production deploy | not performed |
| Live smoke | blocked until PR #87 and this stacked Studio branch are released through the production gate |

Verification on the clean release worktree:

- PASS `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` with `NODE_PATH=C:\Users\User\BNA v2.0\node_modules` - 12/12.
- PASS `npm run pqc:validate ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/05-studio-desktop-layout-cleanup.product-quality.json`.
- PASS `npm run studio:smoke` with `NODE_PATH=C:\Users\User\BNA v2.0\node_modules` - 1/1.
- PASS `npm run watchdog:actions` - finding_count 0, report `ops/watchdog-audits/2026-07-04T18-56-watchdog-action-audit.md`.
- PASS `npm run watchdog:protocol-drift` - findings 0, report `ops/watchdog-audits/2026-07-04-product-quality-drift.md`.
- PASS `git diff --check`.

Note: the first full browser-suite attempt in this clean worktree failed only
because local dependency resolution could not find `playwright`. The rerun used
the already-installed main workspace `node_modules` through `NODE_PATH` and
passed.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260702-961 | Preserve and register the Studio content-engine ramble with raw wording and stable IDs. | RAW-20260702-010 / SRC-20260702-010-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | intake | P0 | B0 | none | Raw intake exists; register exists; ledger/changelog note exists; no product code changed. | raw-input, tasks-pending, memory, ledger, changelog | no | Done |
| REQ-20260702-962 | Inspect current Studio implementation and identify whether it is usable live product or test/mock scaffolding. | RAW-20260702-010 / SRC-20260702-010-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | audit | P0 | B1 | REQ-20260702-961 | Relevant files/routes/tests inspected; current state summarized; verification commands recorded. | src/lib/bna/service-provider-studio.js, server.js, public/operations.html, tests | no | Done |
| REQ-20260702-963 | Create a Studio-specific Product Quality Compiler packet for next implementation planning. | RAW-20260702-010 / SRC-20260702-010-003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | protocol | P0 | B1 | REQ-20260702-961 | Product-quality packet validates and names next exact packets; code implementation remains blocked until DoR. | ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness | no | Done |
| REQ-20260702-964 | Run an authenticated current-state Studio visual and workflow audit using a scoped test project. | RAW-20260702-010 / SRC-20260702-010-004 | rabbi_sheller_provider / one_time_mishnah_class | Codex | visual_audit | P0 | B2 | REQ-20260702-963 | Screenshots/state matrix cover overview, source, storyboard, prompts, jobs, usage, handoff at desktop/tablet/mobile; raw prompt/code-block UX findings are recorded. | ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/01-current-state-studio-audit.md | no | Done |
| REQ-20260702-965 | Replace raw code/test-looking Studio readbacks with a polished operator-facing review experience while keeping expandable diagnostics. | RAW-20260702-010 / SRC-20260702-010-005 | rabbi_sheller_provider / one_time_mishnah_class | Codex | frontend | P0 | B3 | REQ-20260702-964 | Compiled prompts, patch previews, job manifests, and handoffs show structured cards/tabs/diff/review states; raw JSON/code stays behind an explicit diagnostics control. | public/operations.html, action registry, tests | yes | Blocked - local verified; deploy/live-smoke required |
| REQ-20260702-966 | Add reusable Studio prompt/character/guardrail library support for One Time Mishnah slideshows. | RAW-20260702-010 / SRC-20260702-010-006 | rabbi_sheller_provider / one_time_mishnah_class | Codex | backend_frontend | P0 | B4 | REQ-20260702-964 | Character bible, Jewish guardrails, scenario-specific character sets, prompt templates, versions, and correction patches are durable and reusable by project/scene. | src/lib/bna/service-provider-studio.js, server.js, migration, public/operations.html, tests | yes | Blocked - local verified; deploy/live-smoke required |
| REQ-20260702-967 | Connect drop-in content to real reviewable slideshow/prompt outputs without external publish or send. | RAW-20260702-010 / SRC-20260702-010-007 | rabbi_sheller_provider / one_time_mishnah_class | Codex | pipeline | P0 | B5 | REQ-20260702-966 | A scoped source can become storyboard scenes, editable prompt packs, asset prompts, local preview artifacts, and Content handoff records with provenance/readback. | public/operations.html, action registry, Studio browser smoke | yes | Blocked - local verified; deploy/live-smoke required |
| REQ-20260702-968 | Define AI-video vendor integration boundaries before any vendor adapter is built. | RAW-20260702-010 / SRC-20260702-010-008 | rabbi_sheller_provider / one_time_mishnah_class | Shloimie / vendor / Codex | provider_setup | P1 | B6 | REQ-20260702-963 | Vendor API contract, rights policy, cost controls, input/output schema, retry/cancel behavior, storage path, approval gate, and no-live-publish rule are captured. | provider packet only | no | Needs operator decision |
| REQ-20260702-969 | After implementation, deploy and live-smoke Studio as an actually usable private Operations workflow. | RAW-20260702-010 / SRC-20260702-010-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | deploy_verification | P0 | B7 | REQ-20260702-965, REQ-20260702-966, REQ-20260702-967, REQ-20260702-980 | Authenticated live smoke creates/opens a scoped TEST Studio project, saves source, generates storyboard, compiles prompt, applies a correction, creates no-send handoff, and verifies no external publish/send/upload. | live smoke evidence | yes | Pending |
| REQ-20260702-980 | Clean up Studio desktop layout so the operator workflow is not squeezed into the right rail. | RAW-20260702-010 / SRC-20260702-010-005, SRC-20260702-010-007 | rabbi_sheller_provider / one_time_mishnah_class | Codex | frontend_layout | P0 | B5b | REQ-20260702-967 | Studio uses a full-width workspace with horizontal section tabs and a project/detail layout that keeps the selected workflow readable on desktop and mobile. | public/operations.html, tests | yes | Blocked - local verified; deploy/live-smoke required |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260702-010 | studio-content-engine-live-readiness | Turn Studio from mock/internal scaffold into a polished content-to-slideshow/prompt workflow. | Codex | rabbi_sheller_provider / one_time_mishnah_class | RAW-20260702-010 | REQ-20260702-964, REQ-20260702-965, REQ-20260702-966, REQ-20260702-967, REQ-20260702-968, REQ-20260702-969, REQ-20260702-980 | Next: capture AI-video vendor adapter scope, then deploy/live smoke the private Studio workflow after release. | Agent lifecycle | local verified / deploy blocked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260702-961 | Choose AI-video vendor adapter scope. | Vendor API capabilities, prompt format, media output format, character consistency method, cost model, rights/storage terms, and whether outputs are only previews or can become final renders. | Shloimie / AI video vendor | Start with a no-external-publish adapter spec and sample prompt/output exchange; keep real vendor generation behind preview and budget gates. | Keep Studio mock-only for now; or build direct vendor calls after credentials/contract. | Without this, Codex can polish internal prompt/character workflow but cannot safely connect real AI-video output. | Bring back vendor notes/API sample and approve a provider setup packet. | REQ-20260702-968 | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260702-961 | Should One Time Studio outputs target Google Slides, Remotion video, vendor video renders, or all three as separate export types? | The export target changes schema, UI, tests, and provider setup. | yes, for final render adapter | open |
| Q-20260702-962 | What are the first approved reusable character profiles and Jewish guardrails? | Required to create a real character/guardrail library instead of generic examples. | no, can start with UI/library structure | open |
| Q-20260702-963 | Who is allowed to approve a Studio prompt/version for reuse? | Needed for versioning, audit trail, and preventing accidental public/member use. | no, but blocks final approval workflow | open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260702-961 | Shloimie wants One Time Studio to store reusable slideshow characters, Jewish guardrails, and prompt patches so the same character types can recur across Mishnah scenarios. | yes | Stable product direction for Studio/content workflows. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260702-964 | `/operations?view=studio`, `/api/bna/studio/*`, Studio tests | Generate current-state Studio audit with screenshots and state matrix. | `01-current-state-studio-audit.md`; PQC packet 02 validated | n/a | n/a | not required for audit |
| REQ-20260702-965 | `public/operations.html`, tests, action registry | Replace raw code blocks with Studio review cards and diagnostics toggle. | PASS focused Studio suite 12/12; PASS Studio smoke; PASS action watchdog; PASS drift watchdog; screenshots updated | n/a | n/a | blocked until deploy/live smoke |
| REQ-20260702-966 | `src/lib/bna/service-provider-studio.js`, `public/operations.html`, migration, action registry, Studio tests | Add durable prompt/character/guardrail library and compiler guardrail layer. | PASS PQC packet 03; PASS focused Studio suite 12/12; PASS Studio smoke; PASS action watchdog; PASS drift watchdog; screenshot `desktop-prompt-review.png` updated | n/a | n/a | blocked until deploy/live smoke |
| REQ-20260702-967 | `public/operations.html`, action registry, Studio browser smoke | Build source-to-reviewable-output path with no external publish. | PASS PQC packet 04; PASS focused Studio suite 12/12; PASS Studio smoke; PASS action watchdog; PASS drift watchdog; screenshots `desktop-review-pack.png`, `mobile-review-pack.png` | n/a | n/a | blocked until deploy/live smoke |
| REQ-20260702-980 | `public/operations.html`, Studio browser smoke | Replace the cramped Studio right-rail layout with scoped horizontal tabs and a full-width project/detail workspace. | PASS PQC packet 05; PASS focused Studio suite 12/12; PASS Studio smoke with review-pack width guard; PASS action watchdog; PASS drift watchdog; screenshots regenerated | n/a | n/a | blocked until deploy/live smoke |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260702-961 | Done | raw-input/RAW-20260702-010-studio-content-engine-live-readiness.md | raw-input, tasks-pending, memory, ledger, changelog | registered | none |
| REQ-20260702-962 | Done | This register; terminal inspection output | no product code changed | Studio focused tests and smoke passed | live authenticated smoke not run |
| REQ-20260702-963 | Done | ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/00-control-tower.product-quality.json | prompt packet | PQC validation passed | next packet required |
| REQ-20260702-964 | Done | ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/01-current-state-studio-audit.md | audit packet | current-state finding recorded | none |
| REQ-20260702-965 | Blocked - local verified | `public/operations.html`; `ops/action-registry.json`; Studio tests; screenshots `desktop-prompt-review.png`, `mobile-handoff.png` | public/operations.html, action registry, tests | PQC packet 02 PASS; focused Studio tests 12/12 PASS; `npm run studio:smoke` PASS; `npm run watchdog:actions` PASS; `npm run watchdog:protocol-drift` PASS | deploy/live authenticated Studio smoke not run; existing Studio shell/right-rail layout remains a separate next UX packet |
| REQ-20260702-966 | Blocked - local verified | `ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/03-prompt-character-guardrail-library.product-quality.json`; screenshot `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-prompt-review.png` | `src/lib/bna/service-provider-studio.js`, `public/operations.html`, `railway-migration-2026-06-23-service-provider-studio.sql`, `ops/action-registry.json`, Studio tests | PQC packet 03 PASS; focused Studio tests 12/12 PASS; `npm run studio:smoke` PASS; `npm run watchdog:actions` PASS; `npm run watchdog:protocol-drift` PASS | deploy/live authenticated Studio smoke not run; real approved character/guardrail copy remains a content decision, but the save/readback/compiler structure is in place |
| REQ-20260702-967 | Blocked - local verified | `ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/04-source-to-slideshow-output-pipeline.product-quality.json`; screenshots `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-review-pack.png`, `mobile-review-pack.png` | `public/operations.html`, `ops/action-registry.json`, Studio tests | PQC packet 04 PASS; focused Studio tests 12/12 PASS; `npm run studio:smoke` PASS; `npm run watchdog:actions` PASS; `npm run watchdog:protocol-drift` PASS | deploy/live authenticated Studio smoke not run; layout cleanup is tracked separately under REQ-20260702-980 |
| REQ-20260702-980 | Blocked - local verified | `ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/05-studio-desktop-layout-cleanup.product-quality.json`; screenshots `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-review-pack.png`, `desktop-prompt-review.png`, `mobile-review-pack.png` | `public/operations.html`, Studio tests | PQC packet 05 PASS; focused Studio tests 12/12 PASS; `npm run studio:smoke` PASS; review-pack desktop width guard PASS; `npm run watchdog:actions` PASS; `npm run watchdog:protocol-drift` PASS | deploy/live authenticated Studio smoke not run |
