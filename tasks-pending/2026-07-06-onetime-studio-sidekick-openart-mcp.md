# Ramble Intake - 2026-07-06 - One Time Studio Sidekick And OpenArt MCP Scope

## Raw intake

Raw source is preserved at:

- `raw-input/RAW-20260706-002-onetime-studio-sidekick-openart-mcp.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-002 |
| Source | codex_chat; updated by RAW-20260706-003 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-onetime-studio-sidekick-openart-mcp.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes, by RAW-20260706-003 |
| Active goal objective | Build the scoped One Time AI Studio operator sidekick system through terminal statuses: role, sidekick, prompt/image workflow, OpenArt MCP adapter boundary, scoped Studio CLI/Codex lane, verification, evidence, and live OpenArt blocked until signup. |
| Goal tool used | yes |
| Execution directive | Register first, create Product Quality Compiler/Definition of Ready for app-visible work, then implement in practical batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | Deploy/live-smoke approval and readiness gate; DEC-20260706-201 and DEC-20260706-203 after OpenArt/model signup |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260706-201 | Preserve and register the One Time Studio sidekick/OpenArt MCP scope. | RAW-20260706-002, RAW-20260706-003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | intake | P0 | B0 | Raw intake and planning register exist with stable IDs, goal-mode approval, scoped CLI constraint, and explicit OpenArt signup blocker. | raw-input, tasks-pending, memory, ledger | no | Done |
| REQ-20260706-202 | Define a narrow `one_time_ai_studio_operator` role. | RAW-20260706-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | rbac | P0 | B1 | Role can access only AI Studio, assigned Studio tasks, and allowed Studio assistant actions; no contacts, payments, settings, integrations, admin, broad content publishing, or cross-workspace data. | server.js, assistant policy, Operations UI, route/action registries, tests | yes | Done |
| REQ-20260706-203 | Design the Studio sidekick as a hosted multimodal prompt/image assistant, not a Codex/code agent. | RAW-20260706-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | assistant | P0 | B1 | Assistant can analyze uploaded render images, describe defects, draft official OpenArt-ready prompt patches, preview diffs, and save/apply patches to scoped Studio records. | assistant routes, Studio APIs, upload/intake, prompt patch domain, tests | yes | Blocked for live multimodal image analysis; no-live prompt/image-observation sidekick done |
| REQ-20260706-204 | Add an OpenArt MCP integration plan/capability map. | RAW-20260706-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | integration | P1 | B2 | MCP usage is limited to authenticated OpenArt account actions such as checking credits, listing projects/assets, sending approved prompts/references, and pulling result links; no secret leakage or unrelated account mutations. | integration adapter, assistant tool registry, registry docs, tests | yes | Done for no-live plan; live OAuth blocked by DEC-20260706-201 |
| REQ-20260706-205 | Implement image-upload-to-prompt-patch workflow. | RAW-20260706-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | product | P0 | B2 | Operator uploads image, says natural-language correction, assistant produces visual critique, suggested prompt patch, target scene/character, before/after diff, and reversible apply action. | Studio UI, assistant widget, upload storage, prompt patch APIs, tests | yes | Blocked for real upload/pixel analysis; image URL/reference-note plus render-observation patch flow done |
| REQ-20260706-206 | Repair and professionalize the Studio prompt patching UX before relying on the sidekick. | RAW-20260706-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | ui_quality | P0 | B2 | Prompt patching is easy to use, tracks versions, exposes character library links, supports scene-level corrections, and exports OpenArt-ready prompts. Requires current-state audit, PQC validation, screenshots, and live smoke before Done. | public/operations.html, Studio CSS/JS, Studio domain/API, tests, registries | yes | Done locally; deploy/live-smoke pending publish |
| REQ-20260706-207 | Gate bug reports and self-fix behavior safely with a Studio-only CLI/Codex lane. | RAW-20260706-002, RAW-20260706-003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | safety | P0 | B1 | User can say "this is broken"; assistant captures evidence and may create/run only a scoped Studio Codex repair lane for allowlisted Studio layout/functionality files and tests. It cannot run arbitrary CLI, edit unrelated website/workspace code, deploy, mutate secrets, send messages, charge, grant access, or broaden to other workspaces without Shloimie's later approval. | assistant policy, task creation, action registry, tests | yes | Done |
| REQ-20260706-208 | Verify Studio sidekick scope with negative tests and app-visible proof. | RAW-20260706-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | verification | P0 | B3 | Tests prove allowed prompt/image actions work and denied broad website/admin/CLI/external actions are blocked; local screenshots and deploy/live-smoke prove the app-visible sidekick. | tests, Playwright smokes, route/action registries, deployment evidence | yes | Done locally; deploy/live-smoke pending publish |
| REQ-20260706-209 | Create a Product Quality Compiler packet and Definition of Ready for this app-visible Studio/assistant build before UI/product edits. | RAW-20260706-003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | product_quality | P0 | B0 | PQC packet covers affected roles/routes, Studio assistant IA, state matrix, image upload, prompt patch states, OpenArt mock/live blockers, CLI safety, registries, screenshots, tests, deploy/live-smoke; `npm run pqc:validate <packet>` passes. | ops/prompt-packets, docs/contracts | no | Done |
| REQ-20260706-210 | Build everything possible without live OpenArt signup and mark live MCP/OAuth as a precise blocker. | RAW-20260706-003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | integration_blocker | P0 | B3 | Mock/no-live adapter and UI are complete; live OpenArt connection remains blocked on account/OAuth sign-in with owner and exact next action. | integration adapter, docs, register | yes | Done locally; live OAuth blocked by DEC-20260706-201 |

## Parsed tasks

Do not create a visible human Task yet. This is a product/system scope register until Shloimie asks Codex to build it.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260706-201 | onetime-studio-sidekick-openart-mcp | Build the scoped One Time Studio sidekick, OpenArt MCP boundary, and Studio-only Codex lane. | Codex | rabbi_sheller_provider / one_time_mishnah_class | RAW-20260706-002, RAW-20260706-003 | REQ-20260706-202..210 | Connect OpenArt OAuth/model when Shloimie signs up and approves model/privacy policy. | Agent lifecycle | BNA-side no-live build merged, deployed, and live-smoked; live OpenArt/model/upload blocked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-201 | OpenArt MCP account and runtime path are not decided. | Which OpenArt account/workspace, OAuth owner, Team/seat plan, and whether BNA will use a server-side MCP client, ChatGPT connector, or mostly deep links into OpenArt UI. | Shloimie / OpenArt account owner | Build BNA prompt/task/asset tracking, mock/no-live OpenArt adapter, and OpenArt UI deep links now; live MCP-assisted actions remain blocked until signup/OAuth. | Build full BNA OpenArt UI now; use only OpenArt UI with no BNA integration. | Full UI duplicates OpenArt and increases cost; no integration loses BNA prompt/task memory. | Shloimie signs up/connects OpenArt account/workspace after local build is complete. | REQ-20260706-204, REQ-20260706-205, REQ-20260706-210 | Open |
| DEC-20260706-202 | Studio operator may use a scoped CLI/Codex lane only for Studio layout/functionality. | Exact implementation allowlist and runtime safety mechanism. | Codex | Implement a mediated Studio repair lane with allowlisted files/actions/tests; deny raw shell, deployment, secrets, external writes, and non-Studio website/workspace changes. | Give broad Codex/CLI access; allow no bug reporting. | Broad CLI access risks website/admin/secret/deploy mutation; no bug reporting leaves the workflow stuck. | Codex creates the allowlist/policy/tests before exposing the lane. | REQ-20260706-207, REQ-20260706-208 | Accepted |
| DEC-20260706-203 | Exact hosted vision/prompt model is not selected. | Approved model name/provider, budget, retention/privacy settings, and image-upload policy. | Shloimie / Codex | Treat "GPT 5.5" as shorthand for an approved hosted multimodal GPT-style sidekick model; select exact model during implementation based on current official docs and account availability. | Use Codex for prompt writing; use a non-vision model. | Codex is wrong tool for routine prompt/image coaching; non-vision model cannot inspect uploads. | Confirm provider/model budget and privacy constraints before implementation. | REQ-20260706-203, REQ-20260706-205 | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260706-201 | Should the sidekick live inside Operations Studio, as a desktop side panel, in Telegram, or in more than one channel? | The channel determines upload handling, auth, page context, and assistant controls. | yes for implementation | Open |
| Q-20260706-202 | Should the operator finalize directly in OpenArt UI, from BNA through MCP, or both? | Determines how much OpenArt UI we duplicate and how much OAuth/tooling we need. | live MCP only | Answered for local build: support BNA workflow plus mock/deep-link path now; live MCP blocked until signup. |
| Q-20260706-203 | What image privacy/retention policy applies to uploaded AI renders and character references? | Uploaded images may contain generated faces, brand assets, or private references. | yes for implementation | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260706-201 | The One Time AI Studio operator should be scoped to AI Studio, assigned Studio tasks, prompt/image corrections, and OpenArt-assisted generation workflows only. | maybe | Durable if Shloimie confirms this role should be created. |
| MEM-20260706-202 | For this role, "GPT 5.5" means a hosted multimodal GPT-style sidekick model for prompt/image work, not Codex/code execution. | maybe | Durable if implementation proceeds. |
| MEM-20260706-203 | The One Time AI Studio operator is allowed to trigger only a Studio-scoped CLI/Codex repair lane for Studio layout/functionality, not broad website/workspace changes. | maybe | Durable if implementation ships and tests enforce it. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260706-209 | Product Quality Compiler packet | Created and validated app-visible product-quality packet before product/UI edits. | `npm run pqc:validate -- ops/prompt-packets/2026-07-06-onetime-studio-sidekick-openart-mcp/00-control-tower.product-quality.json` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | n/a |
| REQ-20260706-202 | server.js, src/lib/bna/one-time-role-model.js, assistant policy, route registry | Added env-backed `one_time_ai_studio_operator` with `studio` + `tasks` allowed views and a narrow route guard. | `node --test tests/one-time-studio-operator-role.test.js tests/assistant-scope-policy.test.js`; master-merge verification; live smoke | `52ba8b2b`; branch merge commit `1124cf8d`; PR #105 merge `8f2c9595` | pushed and merged to `master` | Railway deployment `42d7cfa8-7a39-4371-b799-46a62d88aadc` SUCCESS; live smoke passed |
| REQ-20260706-203, REQ-20260706-205 | src/lib/bna/service-provider-studio-sidekick.js, public/operations.html, Studio sidekick API routes | Added no-live prompt/image-observation sidekick panel and patch preview. True uploaded-image pixel analysis remains blocked on model/account/privacy. | `node --test tests/one-time-studio-openart-adapter.test.js`; browser smoke screenshot `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/desktop-sidekick-openart.png`; live app smoke | `52ba8b2b`; branch merge commit `1124cf8d`; PR #105 merge `8f2c9595` | pushed and merged to `master` | no-live flow deployed; true pixel analysis blocked by DEC-20260706-203 |
| REQ-20260706-204, REQ-20260706-210 | src/lib/bna/studio-openart-mcp-adapter.js, `/api/bna/studio/openart/status`, `/openart/export` | Added no-live OpenArt MCP readiness, request plan, prompt export/copy, and OAuth blocker. | `node --test tests/one-time-studio-openart-adapter.test.js`; screenshot `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/desktop-openart-status.png` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | live OAuth blocked by DEC-20260706-201 |
| REQ-20260706-206 | public/operations.html, route/action registries, Studio browser smoke | Added Studio Sidekick panel, OpenArt prompt export review, Studio repair plan review, and OpenArt status card. | `node --test tests/service-provider-studio-browser-smoke.test.js`; screenshots under `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/`; master-merge browser smoke; live smoke | `52ba8b2b`; branch merge commit `1124cf8d`; PR #105 merge `8f2c9595` | pushed and merged to `master` | Railway deployment `42d7cfa8-7a39-4371-b799-46a62d88aadc` SUCCESS; live smoke passed |
| REQ-20260706-207 | src/lib/bna/one-time-studio-sidekick-policy.js, assistant policy, `/api/bna/studio/repair/plan` | Added mediated Studio repair lane with file/route/test allowlists and no raw shell/CLI/deploy/secrets/external writes. | `node --test tests/one-time-studio-sidekick-policy.test.js`; master-merge verification; live smoke | `52ba8b2b`; branch merge commit `1124cf8d`; PR #105 merge `8f2c9595` | pushed and merged to `master` | deployed; live smoke passed |
| REQ-20260706-208 | tests, watchdog reports, action/route registries | Added negative policy tests, static route/UI tests, browser smoke evidence, action registry coverage, and protocol drift report. | `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `node --check server.js`; 40/40 master-merge tests; live smoke | `52ba8b2b`; branch merge commit `1124cf8d`; PR #105 merge `8f2c9595` | pushed and merged to `master` | Railway deployment `42d7cfa8-7a39-4371-b799-46a62d88aadc` SUCCESS; live smoke passed |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-201 | Done | raw-input/RAW-20260706-002-onetime-studio-sidekick-openart-mcp.md; raw-input/RAW-20260706-003-onetime-studio-sidekick-goal-mode-build.md; this register | raw-input, tasks-pending, memory, ledger/changelog | File capture and goal-mode register | none |
| REQ-20260706-202 | Done; deployed/live-smoked | `one_time_ai_studio_operator` env-backed role; static role test; route guard blocks CRM/payments/helper execute/admin routes; PR #105 merged at `8f2c9595`; Railway deployment `42d7cfa8-7a39-4371-b799-46a62d88aadc` | server.js; src/lib/bna/one-time-role-model.js; tests/one-time-studio-operator-role.test.js | Passed targeted tests, `node --check server.js`, post-deploy doctor, and live smoke | none for no-live BNA-side role |
| REQ-20260706-203 | Blocked for live multimodal image model; local no-live sidekick done | Sidekick policy/domain/API/UI implemented; no-live patch preview verified | src/lib/bna/service-provider-studio-sidekick.js; public/operations.html; server.js; tests | Passed unit/static/browser smoke | Exact hosted vision model, credentials, privacy/retention, and true pixel analysis not decided |
| REQ-20260706-204 | Done locally; live OAuth blocked | OpenArt MCP adapter status/export/request plan implemented; live calls remain disabled | src/lib/bna/studio-openart-mcp-adapter.js; server.js; public/operations.html; registries | Passed OpenArt adapter test and browser status screenshot | Shloimie must sign up/connect OpenArt OAuth/workspace |
| REQ-20260706-205 | Blocked for true image upload; reference-note flow done | UI accepts image/render observation plus reference URL/note and drafts a reversible patch | public/operations.html; server.js; sidekick tests | Browser smoke exercised Draft Prompt Patch | Need upload storage and live multimodal image analysis policy/model |
| REQ-20260706-206 | Done; deployed/live-smoked | Studio Sidekick, OpenArt Prompt Export, Studio Repair Plan, OpenArt status card, screenshots; PR #105 merged at `8f2c9595`; Railway deployment `42d7cfa8-7a39-4371-b799-46a62d88aadc` | public/operations.html; registries; tests | Browser smoke screenshots in `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/` and `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-master-merge/`; live smoke passed | none for no-live BNA-side UI; OpenArt live account/model blockers remain |
| REQ-20260706-207 | Done; deployed/live-smoked | Studio-only repair lane allows Studio layout/functionality and denies website/admin/shell/deploy/secrets/contacts/payments/cross-workspace; PR #105 merged at `8f2c9595`; Railway deployment `42d7cfa8-7a39-4371-b799-46a62d88aadc` | assistant policy; sidekick policy; server route | `node --test tests/one-time-studio-sidekick-policy.test.js tests/assistant-scope-policy.test.js`; live smoke passed | none for no-live BNA-side repair-lane policy |
| REQ-20260706-208 | Done for no-live BNA-side scope; deployed/live-smoked | Unit/static tests, browser smoke, PQC validation, action watchdog, protocol drift report, PR #105 merge, Railway deployment, live smoke reports | tests; ops/watchdog-audits; ops/product-quality-compiler; screenshots; live smoke reports | 40 targeted tests passed after master merge; browser smoke passed; watchdog action findings 0; drift findings 0; `npm run app:smoke`; `npm run app:smoke:rabbi-onetime-landing` | Live OpenArt/model/upload blockers remain below |
| REQ-20260706-209 | Done | PQC packet validated | ops/prompt-packets/2026-07-06-onetime-studio-sidekick-openart-mcp/00-control-tower.product-quality.json | `npm run pqc:validate -- ...` passed | none |
| REQ-20260706-210 | Done for no-live adapter; deployed/live-smoked; live OAuth blocked | OpenArt no-live adapter and UI blocker complete, merged, deployed, and live-smoked | OpenArt adapter, UI, server, register | OpenArt adapter tests, browser status card, live app smoke | Shloimie signs up/connects OpenArt OAuth/workspace before live MCP/API/generation/reference upload/credit actions |

## 2026-07-06 Production Merge, Deploy, And Live Smoke Closeout

PR #105 was merged to `master` at
`8f2c95958084e05f379c23fe9b68d4e09c4994e0` after the branch was updated with
current `origin/master` and reverified. The scoped deploy gate passed from a
clean detached `origin/master` worktree with optional unrelated provider
readiness and external readback deferred through the approved release path.

Railway deploy was performed from the clean detached merged-master worktree,
not from a dirty local checkout:

- Service: `skillful-motivation` / production.
- Deployment: `42d7cfa8-7a39-4371-b799-46a62d88aadc`.
- Status: `SUCCESS`.
- Post-deploy doctor: PASS for project `skillful-motivation`, environment
  `production`, service `skillful-motivation`.
- Live smoke: PASS `npm run app:smoke`; report
  `ops/live-smokes/2026-07-06T11-01-41-071Z-live-app-smoke.md`.
- Live One Time landing smoke: PASS `npm run app:smoke:rabbi-onetime-landing`;
  report
  `ops/live-smokes/2026-07-06T11-01-40-419Z-rabbi-onetime-landing-smoke.md`.

Remaining blockers are not deploy blockers for the no-live BNA-side build:

- Live OpenArt OAuth/MCP/API calls remain blocked until Shloimie signs up and
  connects the OpenArt account/workspace.
- Live OpenArt generation, reference upload, credit spend/checks, or result
  pulls remain blocked until the OpenArt account/auth path is explicit.
- True uploaded-image pixel analysis remains blocked until hosted multimodal
  model/provider, budget, retention/privacy, and image-upload policy are
  approved.
- No external send, payment/access change, DNS change, secret change, CRM
  mutation, OpenArt generation/reference upload/credit action, or unrelated
  production data mutation was performed.

## 2026-07-06 Master-Merge Verification

PR #105 was merged locally with current `origin/master` after PR #108 landed.
Append-only conflicts in `memory/2026-07-06.md`, `ops/agent-changelog.md`,
and `ops/agent-task-ledger.jsonl` were resolved by preserving both the Studio
sidekick records and the parent-reminder/deploy-gate/dropoff cleanup records.

Verification after the master merge:

- PASS `node --check server.js`
- PASS `node --check scripts/bna-production-closeout-gate.mjs`
- PASS `node --test tests/assistant-scope-policy.test.js tests/one-time-studio-sidekick-policy.test.js tests/one-time-studio-openart-adapter.test.js tests/one-time-studio-operator-role.test.js tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/bna-production-closeout-gate.test.js` 40/40
- PASS `BNA_SERVICE_PROVIDER_STUDIO_SMOKE_DIR=ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-master-merge node --test tests/service-provider-studio-browser-smoke.test.js` 1/1
- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-06-onetime-studio-sidekick-openart-mcp/00-control-tower.product-quality.json`
- PASS `npm run watchdog:actions` with findings `0`
- PASS `npm run watchdog:protocol-drift` with findings `0`
- PASS `npm run bna:run:status`
- PASS `npm run bna:run:next` with no unblocked executable batch
- PASS `git diff --check`

Fresh evidence:

- `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-master-merge/`
- `ops/watchdog-audits/2026-07-06T10-51-watchdog-action-audit.md`
- `ops/watchdog-audits/2026-07-06-product-quality-drift.md`
- `ops/product-quality-compiler/validation/latest-product-quality-validation.md`

Remaining status:

- PR #105 was pushed and merged to master at
  `8f2c95958084e05f379c23fe9b68d4e09c4994e0`.
- Production deploy/live smoke passed on Railway deployment
  `42d7cfa8-7a39-4371-b799-46a62d88aadc`.
- Live OpenArt OAuth/MCP, live generation/reference upload/credit actions, and
  true uploaded-image pixel analysis remain blocked on the OpenArt account and
  hosted multimodal model/privacy decisions.
