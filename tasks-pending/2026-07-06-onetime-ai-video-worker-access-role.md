# Ramble Intake - 2026-07-06 - One Time AI Video Worker Access Role

## Raw intake

Implement a new scoped One Time role for the AI video worker that can access only the One Time Studio and the One Time task manager, with no broader Rabbi or BNA data. Inspect the existing Rabbi/One Time access model, task-manager work, and Studio packets first, then wire the role end to end with tests, route/action registry updates, and a clear access matrix.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-908 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-onetime-ai-video-worker-access-role.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Implement the scoped access role in the current turn, preserving existing Studio handoff work. |
| Terminal statuses required | Done / Blocked |
| Deploy/live-smoke required for app-visible work | yes, if released |
| Next requirement IDs to work | REQ-20260706-930 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260706-930 | Add a scoped `one_time_ai_video_worker` role limited to One Time Studio and One Time task manager. | RAW-20260706-908 | rabbi_sheller_provider / one_time_mishnah_class | Codex | access_control | P0 | B1 | Existing One Time role model, task manager scoping, Studio packets inspected. | Role has its own canonical identity, env-backed login, allowed views `studio` and `tasks`, route guard allows only scoped Studio/task APIs, UI does not fetch broader Operations data, registries and access matrix are updated, tests prove allowed/denied access. | server.js, src/lib/bna/one-time-role-model.js, src/lib/bna/one-time-studio-sidekick-policy.js, public/operations.html, public/operations-login.html, ops/route-registry.json, ops/action-registry.json, docs/ONE-TIME-AI-VIDEO-WORKER-ACCESS-MATRIX.md, tests | yes | Local verified / publish-deploy pending |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260706-930 | onetime-ai-video-worker-access-role | Implement and verify scoped One Time AI video worker access. | Codex | rabbi_sheller_provider / one_time_mishnah_class | RAW-20260706-908 | REQ-20260706-930 | Commit/push this scoped change, then deploy/live-smoke after approved release and env configuration. | Access control / Studio | Local verified / publish-deploy pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-930 | Whether to deploy this role change to production immediately. | Approved release window and production credentials. | Shloimie / release owner | Commit/push after local verification, then deploy through the normal approved release path when safe. | Keep local only; open a PR first. | Local-only changes are not visible to GitHub-connected ChatGPT or production. | Approve or run the release path after tests pass. | REQ-20260706-930 live proof | Needs operator decision if release is not performed |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260706-930 | What username/password should be configured for `ONE_TIME_AI_VIDEO_WORKER_USERNAME` / `ONE_TIME_AI_VIDEO_WORKER_PASSWORD` in the target environment? | The role is wired, but live login requires environment configuration. | Blocks live login only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260706-930 | One Time AI video worker role key is `one_time_ai_video_worker`, scoped to Studio and Tasks only for `rabbi_sheller_provider` / `one_time_mishnah_class`. | yes | Durable access model and future operator expectation. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260706-930 | Role model, server auth/guard, Operations shell, Studio policy, registries, tests, access matrix doc. | Add role, deny broad APIs, keep Content handoff unavailable, prove route/action registry alignment. | PASS `node --check server.js`; PASS focused Studio/role/API/UI suite 41/41; PASS registry JSON parse; PASS `npm run watchdog:actions`; PASS `npm run watchdog:protocol-drift`; PASS `npm run bna:run:status`; PASS `npm run bna:run:next` | Pending | Pending | Deploy/live smoke pending env config and approved release |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-930 | Local verified / publish-deploy pending | `docs/ONE-TIME-AI-VIDEO-WORKER-ACCESS-MATRIX.md`; `tests/one-time-studio-operator-role.test.js`; `tests/one-time-role-auth-model.test.js`; `tests/operations-pwa-login.test.js`; `ops/action-registry.json`; `ops/route-registry.json`; `ops/watchdog-audits/2026-07-06T12-34-watchdog-action-audit.md`; `ops/watchdog-audits/2026-07-06-product-quality-drift.md` | `server.js`, `src/lib/bna/one-time-role-model.js`, `src/lib/bna/one-time-studio-sidekick-policy.js`, `src/lib/bna/assistant-scope-policy.js`, `src/lib/bna/service-provider-studio-sidekick.js`, `public/operations.html`, `public/operations-login.html`, registries, tests, access matrix doc | `node --check server.js` PASS; focused Studio/role/API/UI suite PASS 41/41; registry JSON parse PASS; `npm run watchdog:actions` PASS finding_count=0; `npm run watchdog:protocol-drift` PASS findings=0; `npm run bna:run:status` PASS; `npm run bna:run:next` PASS no executable batch | Live login requires target env `ONE_TIME_AI_VIDEO_WORKER_USERNAME` / `ONE_TIME_AI_VIDEO_WORKER_PASSWORD`; deploy/live authenticated smoke not run yet |
