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
| Next requirement IDs to work | Release gate/deploy/live-smoke for app-visible changes; DEC-20260706-201 and DEC-20260706-203 after OpenArt/model signup |

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
| TASK-20260706-201 | onetime-studio-sidekick-openart-mcp | Build the scoped One Time Studio sidekick, OpenArt MCP boundary, and Studio-only Codex lane. | Codex | rabbi_sheller_provider / one_time_mishnah_class | RAW-20260706-002, RAW-20260706-003 | REQ-20260706-202..210 | Review/merge PR #105, run release gate/deploy/live-smoke if safe, then connect OpenArt OAuth/model when Shloimie signs up. | Agent lifecycle | Clean draft PR open; blocked on production deploy/live-smoke, live OpenArt/model/upload |

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
| REQ-20260706-202 | server.js, src/lib/bna/one-time-role-model.js, assistant policy, route registry | Added env-backed `one_time_ai_studio_operator` with `studio` + `tasks` allowed views and a narrow route guard. | `node --test tests/one-time-studio-operator-role.test.js tests/assistant-scope-policy.test.js` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | blocked pending release gate/deploy/live-smoke |
| REQ-20260706-203, REQ-20260706-205 | src/lib/bna/service-provider-studio-sidekick.js, public/operations.html, Studio sidekick API routes | Added no-live prompt/image-observation sidekick panel and patch preview. True uploaded-image pixel analysis remains blocked on model/account/privacy. | `node --test tests/one-time-studio-openart-adapter.test.js`; browser smoke screenshot `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/desktop-sidekick-openart.png` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | true pixel analysis blocked by DEC-20260706-203; app-visible release pending |
| REQ-20260706-204, REQ-20260706-210 | src/lib/bna/studio-openart-mcp-adapter.js, `/api/bna/studio/openart/status`, `/openart/export` | Added no-live OpenArt MCP readiness, request plan, prompt export/copy, and OAuth blocker. | `node --test tests/one-time-studio-openart-adapter.test.js`; screenshot `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/desktop-openart-status.png` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | live OAuth blocked by DEC-20260706-201 |
| REQ-20260706-206 | public/operations.html, route/action registries, Studio browser smoke | Added Studio Sidekick panel, OpenArt prompt export review, Studio repair plan review, and OpenArt status card. | `node --test tests/service-provider-studio-browser-smoke.test.js`; screenshots under `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | blocked pending release gate/deploy/live-smoke |
| REQ-20260706-207 | src/lib/bna/one-time-studio-sidekick-policy.js, assistant policy, `/api/bna/studio/repair/plan` | Added mediated Studio repair lane with file/route/test allowlists and no raw shell/CLI/deploy/secrets/external writes. | `node --test tests/one-time-studio-sidekick-policy.test.js` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | blocked pending release gate/deploy/live-smoke |
| REQ-20260706-208 | tests, watchdog reports, action/route registries | Added negative policy tests, static route/UI tests, browser smoke evidence, action registry coverage, and protocol drift report. | `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `node --check server.js` | `52ba8b2b` | pushed to `origin/codex/onetime-studio-sidekick-20260706`; clean draft PR #105 | blocked pending release gate/deploy/live-smoke |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-201 | Done | raw-input/RAW-20260706-002-onetime-studio-sidekick-openart-mcp.md; raw-input/RAW-20260706-003-onetime-studio-sidekick-goal-mode-build.md; this register | raw-input, tasks-pending, memory, ledger/changelog | File capture and goal-mode register | none |
| REQ-20260706-202 | Done locally; clean PR open | `one_time_ai_studio_operator` env-backed role; static role test; route guard blocks CRM/payments/helper execute/admin routes; commit `52ba8b2b`; draft PR #105 | server.js; src/lib/bna/one-time-role-model.js; tests/one-time-studio-operator-role.test.js | Passed targeted tests and `node --check server.js` | Needs release gate/deploy/live-smoke |
| REQ-20260706-203 | Blocked for live multimodal image model; local no-live sidekick done | Sidekick policy/domain/API/UI implemented; no-live patch preview verified | src/lib/bna/service-provider-studio-sidekick.js; public/operations.html; server.js; tests | Passed unit/static/browser smoke | Exact hosted vision model, credentials, privacy/retention, and true pixel analysis not decided |
| REQ-20260706-204 | Done locally; live OAuth blocked | OpenArt MCP adapter status/export/request plan implemented; live calls remain disabled | src/lib/bna/studio-openart-mcp-adapter.js; server.js; public/operations.html; registries | Passed OpenArt adapter test and browser status screenshot | Shloimie must sign up/connect OpenArt OAuth/workspace |
| REQ-20260706-205 | Blocked for true image upload; reference-note flow done | UI accepts image/render observation plus reference URL/note and drafts a reversible patch | public/operations.html; server.js; sidekick tests | Browser smoke exercised Draft Prompt Patch | Need upload storage and live multimodal image analysis policy/model |
| REQ-20260706-206 | Done locally; clean PR open | Studio Sidekick, OpenArt Prompt Export, Studio Repair Plan, OpenArt status card, screenshots; commit `52ba8b2b`; draft PR #105 | public/operations.html; registries; tests | Browser smoke screenshots in `ops/playwright-smokes/2026-07-06-one-time-studio-sidekick-local/` | Needs release gate/deploy/live-smoke |
| REQ-20260706-207 | Done locally; clean PR open | Studio-only repair lane allows Studio layout/functionality and denies website/admin/shell/deploy/secrets/contacts/payments/cross-workspace; commit `52ba8b2b`; draft PR #105 | assistant policy; sidekick policy; server route | `node --test tests/one-time-studio-sidekick-policy.test.js tests/assistant-scope-policy.test.js` | Needs release gate/deploy/live-smoke |
| REQ-20260706-208 | Done locally; clean PR open | Unit/static tests, browser smoke, PQC validation, action watchdog, protocol drift report; commit `52ba8b2b`; draft PR #105 | tests; ops/watchdog-audits; ops/product-quality-compiler; screenshots | 27 targeted tests passed; browser smoke passed; watchdog action findings 0; drift findings 0 | Needs release gate/deploy/live-smoke |
| REQ-20260706-209 | Done | PQC packet validated | ops/prompt-packets/2026-07-06-onetime-studio-sidekick-openart-mcp/00-control-tower.product-quality.json | `npm run pqc:validate -- ...` passed | none |
| REQ-20260706-210 | Done locally; live OAuth blocked | OpenArt no-live adapter and UI blocker complete | OpenArt adapter, UI, server, register | OpenArt adapter tests and browser status card | Shloimie signs up/connects OpenArt OAuth/workspace |
