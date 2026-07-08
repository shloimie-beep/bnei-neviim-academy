# Ramble Intake - 2026-07-08 - OneTime Vimeo Folder V1 Studio Workflow

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-011-onetime-vimeo-folder-v1-studio-workflow.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-011 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-onetime-vimeo-folder-v1-studio-workflow.md |

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then implement the local v1 batch and leave external writes approval-gated. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260708-059 and REQ-20260708-060 after operator approvals |

## Router Result

Classification: `SUPER_RAMBLE`, `PRODUCT_QUALITY`, `COMMUNITY_CLASSROOM`,
`PROVIDER_SETUP`, `EXTERNAL_WRITE_REQUEST`, `SECURITY_PRIVACY`,
`DECISION_REQUIRED`, `DEPLOY_RELEASE`.

The safe v1 implementation is a local/Drive-synced folder processor that edits
or plans edits, writes Vimeo-workflow sidecars, and performs a no-write dry-run
handoff into the existing One Time Vimeo folder-library workflow. Real Vimeo
upload, production DB review-package writes, member/student portal publish, and
bot knowledge promotion stay blocked until the exact account/folder/approval
gates pass.

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260708-055 | Register and compile the Vimeo folder v1 workflow into a scoped PQC packet. | RAW-20260708-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | protocol | P0 | 0 | none | Raw intake, register, surface map, and Product Quality packet exist; packet validates; external writes are explicitly gated. | `raw-input/*`, `tasks-pending/*`, `ops/prompt-packets/*`, `ops/surface-maps/*` | no | Done |
| REQ-20260708-056 | Build a local/Drive-synced folder processor for One Time class video drops. | RAW-20260708-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | media-workflow | P0 | 1 | REQ-20260708-055 | CLI can scan dropped folders from a local path, select video candidates, apply sidecar/default trim plans, add a static opener when rendering, and write a processed video plus safe sidecar metadata. | `src/lib/bna/one-time-vimeo-studio-pipeline.js`, `scripts/one-time-vimeo-studio-pipeline.mjs`, `package.json`, tests | no | Done |
| REQ-20260708-057 | Connect the processed output to the existing no-write Vimeo/library dry-run handoff. | RAW-20260708-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex + owner approval | provider-setup | P0 | 1 | REQ-20260708-056, DEC-20260708-011 | The processor can write a sidecar accepted by `one-time:vimeo-library`; dry-run proves no external write, no production mutation, and no member visibility change. | `src/lib/bna/one-time-vimeo-studio-pipeline.js`, `scripts/one-time-vimeo-studio-pipeline.mjs`, tests | no | Done |
| REQ-20260708-058 | Create a synthetic self-test for the folder processor. | RAW-20260708-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | verification | P0 | 1 | REQ-20260708-056 | A generated non-sensitive synthetic video drop runs through the processor and dry-run handoff; report records cut plan, output sidecar, no Vimeo upload, no DB mutation, and no publish. | `tests/one-time-vimeo-studio-pipeline.test.js`, `ops/one-time-mishnah/vimeo-studio-pipeline/` | no | Done |
| REQ-20260708-059 | Promote approved transcript/class context to One Time latest-class/student/bot knowledge after review. | RAW-20260708-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex + owner approval | classroom-bot-knowledge | P0 | 2 | REQ-20260708-057, DEC-20260708-012 | Approved transcript and class metadata can update the scoped One Time class/session/latest-class read model and bot knowledge source without raw transcript leakage or cross-workspace bleed. | `server.js`, helper knowledge/source-grounding modules, portal routes, tests | yes | Blocked pending approved transcript/publish policy |
| REQ-20260708-060 | Enable real Vimeo upload and student/member visibility only after private smoke and explicit approval. | RAW-20260708-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Shloimie/account owner + Codex | external-write | P0 | 3 | REQ-20260708-057, DEC-20260708-011, DEC-20260708-013 | Vimeo target account/project, token capability, privacy defaults, duplicate handling, rollback, and exact approval phrase are recorded; a private synthetic smoke passes before any real class upload. | Vimeo config/keyholder, `src/lib/integrations/vimeo.js`, `scripts/vimeo-private-smoke.mjs` | yes | Needs operator decision |

## Parsed Tasks

No broad human-visible task fan-out. This register is the canonical machine-work queue.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260708-011 | onetime_vimeo_folder_v1_local_processor | Build and test One Time Vimeo folder v1 local processor. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | RAW-20260708-011 | REQ-20260708-056..058 | Commit/push local processor; use `npm run one-time:vimeo-studio -- --folder <synced-drive-folder> --render --write-report` for laptop/Drive Desktop testing. | internal_codex | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260708-011 | Choose the synced Drive drop folder that laptop Codex should watch. | Exact local path on the laptop and whether it maps to the existing Drive folder ID `1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t` or a personal shared-folder shortcut. | Shloimie | Use the desktop Google Drive path when present and allow `--folder` override for laptop setup. | Use Drive API polling only; manually copy into `media-inbox/one-time-vimeo-studio-drop`. | Wrong folder can process unrelated/private media or miss the Rabbi drop. | On laptop, run the command with the exact synced folder path or confirm the Drive folder ID/shortcut. | REQ-20260708-056 | Open |
| DEC-20260708-012 | Approve transcript and bot knowledge promotion policy. | Whether full transcripts may be used by the scoped One Time bot, which transcript status counts as approved, and what summaries can appear in student/member portal. | Shloimie/Rabbi | Use only approved transcript/class-session rows as source-grounded One Time bot context; keep raw transcript bodies private and use digest/metadata for portal summaries. | No bot knowledge until manual review; use transcript summaries only; publish full transcript to members. | Over-sharing raw transcripts can leak private class/student details; under-sharing leaves the bot unaware of current class state. | Approve the transcript/knowledge promotion policy after the first dry-run output is reviewed. | REQ-20260708-059 | Needs operator decision |
| DEC-20260708-013 | Approve real Vimeo upload and member publish gates. | Vimeo account/project target, token upload/private capability, privacy/embed defaults, rollback/delete policy, duplicate policy, and exact upload/publish approval. | Shloimie/account owner | Keep v1 no-write until `vimeo-private-smoke` succeeds with a synthetic clip, then approve one real class upload explicitly. | Manual Vimeo upload plus paste URL; direct Drive embed; continue no-write dry-runs. | Uploading before this can expose the wrong recording, duplicate assets, or publish before review. | Provide target/account confirmation and explicit approval for a private synthetic smoke, then later a real class upload. | REQ-20260708-060 | Needs operator decision |

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260708-006 | Should v1 default trim be 30 seconds from the start and 15 seconds from the end when no sidecar timestamps exist? | Fully automatic camera-fixing/class-ending detection is not reliable without transcript/audio review; a default trim needs owner comfort. | No for local synthetic test; yes for real unattended class processing | Open |
| Q-20260708-007 | What exact opener copy should appear before One Time classes? | Static opener can be generated now, but final copy should match Rabbi/One Time brand voice. | No; default copy can be overridden in sidecar | Open |

## Durable Memory Candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260708-005 | One Time class video drops should support a laptop/Desktop Google Drive-synced folder path as an operator input surface, in addition to Drive API folder IDs. | Yes | Durable workflow preference for how Shloimie wants to operate the Vimeo folder. |
| MEM-20260708-006 | One Time transcript-derived bot knowledge must be scoped to `rabbi_sheller_provider` / `one_time_mishnah_class` and should use approved class transcript/session context only. | Yes | Durable privacy/scope rule for student/member bot behavior. |

## Product Quality Packet DAG

| Packet | Role | Status | Purpose |
|---|---|---|---|
| `00-vimeo-folder-v1-control.product-quality.json` | CONTROL_TOWER | Done | Compile the ramble, split local processor from external writes, and define the v1 safe scope. |
| `01-vimeo-folder-v1-local-processor.product-quality.json` | PROVIDER_SETUP_PACKET | Done | Build the no-write local/Drive-synced folder processor and synthetic dry-run. |
| `02-transcript-bot-latest-class.product-quality.json` | IMPLEMENTATION_PACKET | Blocked | Later app-visible latest-class/student portal/bot knowledge update after approval. |
| `03-real-vimeo-upload-publish.product-quality.json` | PROVIDER_SETUP_PACKET | Blocked | Later real Vimeo upload/member publish packet after private smoke and explicit approval. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-055 | raw/register/PQC/surface map | Created raw intake, requirement register, v1 surface map, and two PQC packets with external-write gates. | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-vimeo-folder-v1-studio-workflow/00-vimeo-folder-v1-control.product-quality.json ops/prompt-packets/2026-07-08-onetime-vimeo-folder-v1-studio-workflow/01-vimeo-folder-v1-local-processor.product-quality.json` | Pending closeout commit | Pending push | Not required |
| REQ-20260708-056 | local CLI/module | Built scoped processor with folder discovery, metadata sidecar parsing, trim plan, static opener render path, processed sidecar output, and package script. | PASS `node --check src/lib/bna/one-time-vimeo-studio-pipeline.js`; PASS `node --check scripts/one-time-vimeo-studio-pipeline.mjs`; PASS focused node tests 11/11 | Pending closeout commit | Pending push | Not required |
| REQ-20260708-057 | existing Vimeo dry-run handoff | Reused `src/lib/bna/one-time-vimeo-folder-library.js` to verify output package in dry-run mode. | PASS synthetic report dry-run summary: external write false, production mutation false, member visibility false, blockers 0 | Pending closeout commit | Pending push | Not required |
| REQ-20260708-058 | synthetic self-test | Generated non-sensitive tiny test clip, processed it, and inspected committed report. | PASS `node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/onetime-vimeo-studio-self-test --processed-folder media-inbox/onetime-vimeo-studio-self-test-processed --report-dir ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-synthetic-self-test --render --default-trim-start 1 --default-trim-end 1 --opener-seconds 1 --width 640 --height 360 --json --write-report` | Pending closeout commit | Pending push | Not required |
| REQ-20260708-059 | student portal/bot knowledge | Block until approved transcript/knowledge policy and implementation packet exist. | Blocked by DEC-20260708-012 | Pending | Pending | Required |
| REQ-20260708-060 | real Vimeo upload/member publish | Block until Vimeo private smoke and explicit upload/publish approvals exist. | Blocked by DEC-20260708-013 | Pending | Pending | Required |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-055 | Done | `raw-input/RAW-20260708-011-onetime-vimeo-folder-v1-studio-workflow.md`; this register; `ops/surface-maps/2026-07-08-onetime-vimeo-folder-v1-surface-map.md`; PQC validation report | `raw-input/*`, `tasks-pending/*`, `ops/prompt-packets/*`, `ops/surface-maps/*`, `memory/2026-07-08.md` | PASS PQC validation; PASS `npm run watchdog:protocol-drift` | None |
| REQ-20260708-056 | Done | `src/lib/bna/one-time-vimeo-studio-pipeline.js`; `scripts/one-time-vimeo-studio-pipeline.mjs`; `tests/one-time-vimeo-studio-pipeline.test.js`; `package.json` | local processor, CLI, tests, package script | PASS syntax checks; PASS focused node tests 11/11 | Exact laptop synced folder path remains an operator setup detail under DEC-20260708-011 |
| REQ-20260708-057 | Done | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-synthetic-self-test/2026-07-08T14-36-02-478Z-report.md` | processor + Vimeo dry-run sidecar output | PASS no-write Vimeo dry-run: candidate count 1, ready for review 1, external write false, DB mutation false, member visibility false | Real Vimeo upload remains blocked by DEC-20260708-013 |
| REQ-20260708-058 | Done | synthetic local self-test report and ignored processed clip/sidecar under `media-inbox/onetime-vimeo-studio-self-test-processed` | tests and report | PASS rendered output exists; PASS sidecar exists; PASS blockers 0 | Synthetic clip only; real class smoke still blocked by decisions |
| REQ-20260708-059 | Blocked | DEC-20260708-012 | none | Not run | Needs approved transcript/bot knowledge policy |
| REQ-20260708-060 | Needs operator decision | DEC-20260708-013 | none | Not run | Needs Vimeo account/private-smoke/upload approval |
