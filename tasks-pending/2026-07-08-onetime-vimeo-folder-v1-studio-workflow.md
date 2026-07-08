# Ramble Intake - 2026-07-08 - OneTime Vimeo Folder V1 Studio Workflow

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-011-onetime-vimeo-folder-v1-studio-workflow.md`

Continuation raw record:
`raw-input/RAW-20260708-012-onetime-vimeo-desktop-setup-test-continuation.md`

Approval continuation raw record:
`raw-input/RAW-20260708-013-onetime-vimeo-approved-continue.md`

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
| Goal-mode requested | yes, continuation from RAW-20260708-012 and RAW-20260708-013 |
| Active goal objective | Continue the One Time Vimeo folder workflow after broad approval, move safe configured steps forward, and keep irreversible Vimeo/portal/bot writes blocked unless all credential, privacy, duplicate, rollback, and class-package gates pass. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then implement the local v1 batch and leave external writes approval-gated. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260708-065 through REQ-20260708-067 are done; REQ-20260708-068 and REQ-20260708-069 remain blocked by invalid Vimeo token/private-smoke and missing approved real class package. |

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
| REQ-20260708-061 | Set up the desktop local/Drive-aware Vimeo Studio test surface. | RAW-20260708-012 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | desktop-setup | P0 | 4 | REQ-20260708-056 | Desktop setup report identifies canonical Drive folder metadata, local mounted Drive status, chosen local fallback drop folder, processed folder, and exact commands for this computer without committing private media. | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-setup-readback.md` | no | Done |
| REQ-20260708-062 | Run the workflow against available safe local videos on this computer. | RAW-20260708-012 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | local-media-smoke | P0 | 4 | REQ-20260708-061 | At least one non-sensitive local video drop renders through opener/trim/sidecar and Vimeo dry-run; evidence redacts raw/private content and records no external write. | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-drive-edge-smoke/`, `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-promo-smoke/` | no | Done |
| REQ-20260708-063 | Improve v1 trimming where safely possible before real unattended class runs. | RAW-20260708-012 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | media-workflow | P0 | 4 | REQ-20260708-056 | Processor supports explicit sidecar trims, deterministic defaults, and any safe automatic edge-trim signal that can be verified locally without pretending to understand class semantics. | `src/lib/bna/one-time-vimeo-studio-pipeline.js`, CLI, tests | no | Done |
| REQ-20260708-064 | Prove full no-write workflow readiness and list remaining live blockers. | RAW-20260708-012 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | closeout | P0 | 4 | REQ-20260708-061..063 | Syntax/tests/PQC/watchdog pass; reports show render + sidecar + Vimeo dry-run; final audit names exactly what is ready on this computer and what remains blocked for Vimeo upload, transcript promotion, portal visibility, and bot knowledge. | register, ledger, changelog, reports | no | Done locally; live external writes blocked |
| REQ-20260708-065 | Capture broad approval and preserve the safe interpretation. | RAW-20260708-013 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | protocol | P0 | 5 | RAW-20260708-013 | Raw approval is captured; register states what can proceed and what remains blocked despite the broad wording. | `raw-input/RAW-20260708-013-onetime-vimeo-approved-continue.md`, `memory/2026-07-08.md`, this register | no | Done |
| REQ-20260708-066 | Resolve OpenAI transcription credentials through keyholder and prove transcription on non-private smoke media. | RAW-20260708-013 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | transcription | P0 | 5 | REQ-20260708-063 | Stale repo OpenAI secret does not block keyholder credential; synthetic speech smoke records transcript status/length/hash without committing transcript body. | `src/lib/bna/one-time-vimeo-studio-pipeline.js`, `tests/one-time-vimeo-studio-pipeline.test.js`, `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-approved-speech-transcription-smoke/` | no | Done |
| REQ-20260708-067 | Set One Time Drive drop folder ID on the OneTime Railway service and update readiness readback. | RAW-20260708-013 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | provider-setup | P0 | 5 | DEC-20260708-011 | Drive folder metadata is connector-verified; non-secret Railway variable is set with skip-deploys; readiness checker reports Vimeo/Drive config presence without printing secrets. | `scripts/check-onetime-external-setup-readiness.mjs`, `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.*` | yes, later deploy picks up variable | Done |
| REQ-20260708-068 | Attempt approved private synthetic Vimeo smoke without exposing or publishing content. | RAW-20260708-013 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Shloimie/account owner + Codex | external-write | P0 | 5 | DEC-20260708-013 | Private smoke reads the configured token without printing it, uses synthetic media only, and either uploads privately with rollback evidence or records the provider blocker. | `scripts/vimeo-private-smoke.mjs`, `ops/one-time-mishnah/vimeo-private-smoke/2026-07-08-approved-private-smoke-readiness/` | yes | Blocked: Vimeo token rejected with 401; no upload performed |
| REQ-20260708-069 | Upload real class, update portal/latest-class, and promote scoped bot knowledge only after gates pass. | RAW-20260708-013 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Shloimie/Rabbi + Codex | classroom-bot-knowledge | P0 | 6 | REQ-20260708-068, DEC-20260708-012, DEC-20260708-013, DEC-20260708-015 | A reviewed real class package can be uploaded to the intended private Vimeo target, linked to latest-class/member portal state, and used by the scoped bot only after valid token, private smoke, duplicate/rollback policy, approved transcript/class package, deploy, and live smoke proof. | future app/media packet | yes | Blocked |

## Parsed Tasks

No broad human-visible task fan-out. This register is the canonical machine-work queue.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260708-011 | onetime_vimeo_folder_v1_local_processor | Build and test One Time Vimeo folder v1 local processor. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | RAW-20260708-011 | REQ-20260708-056..058 | Commit/push local processor; use `npm run one-time:vimeo-studio -- --folder <synced-drive-folder> --render --write-report` for laptop/Drive Desktop testing. | internal_codex | Done |
| TASK-20260708-012 | onetime_vimeo_desktop_setup_test | Set up and exercise the One Time Vimeo Studio workflow on this desktop. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | RAW-20260708-012 | REQ-20260708-061..064 | Use `G:\My Drive\OneTime Vimeo Studio Desktop Test\drop` for this desktop smoke testing; use the CLI with `--render --auto-trim-edges --write-report` for new local drops. | internal_codex | Done locally |
| TASK-20260708-013 | onetime_vimeo_approved_provider_readiness | Continue approved Vimeo/transcription/provider readiness and stop at live blockers. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | RAW-20260708-013 | REQ-20260708-065..069 | Replace/regenerate the Vimeo access token with upload/read/private-video capability, configure the intended private test project/account confirmation, rerun `scripts/vimeo-private-smoke.mjs`, then create a real-class upload/latest-class packet only after smoke passes. | internal_codex | Blocked on DEC-20260708-015 |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260708-011 | Choose the synced Drive drop folder that laptop Codex should watch. | Exact local path on the laptop and whether it maps to the existing Drive folder ID `1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t` or a personal shared-folder shortcut. | Shloimie | Use the desktop Google Drive path when present and allow `--folder` override for laptop setup. | Use Drive API polling only; manually copy into `media-inbox/one-time-vimeo-studio-drop`. | Wrong folder can process unrelated/private media or miss the Rabbi drop. | On laptop, run the command with the exact synced folder path or confirm the Drive folder ID/shortcut. | REQ-20260708-056 | Open |
| DEC-20260708-012 | Approve transcript and bot knowledge promotion policy. | Broad approval allows local transcription smokes, but not raw transcript publication or bot promotion from an unreviewed real class. | Shloimie/Rabbi | Use only approved transcript/class-session rows as source-grounded One Time bot context; keep raw transcript bodies private and use digest/metadata for portal summaries. | No bot knowledge until manual review; use transcript summaries only; publish full transcript to members. | Over-sharing raw transcripts can leak private class/student details; under-sharing leaves the bot unaware of current class state. | After a real reviewed class package exists, approve which transcript/session fields can feed latest-class and the scoped bot. | REQ-20260708-059, REQ-20260708-069 | Approved for smoke; blocked for real class promotion |
| DEC-20260708-013 | Approve real Vimeo upload and member publish gates. | Broad approval allowed a private synthetic smoke, but the token failed and real class upload still needs target/privacy/rollback/class-package proof. | Shloimie/account owner | Keep v1 no-write until `vimeo-private-smoke` succeeds with a synthetic clip using the intended account/project, then approve one real class upload explicitly. | Manual Vimeo upload plus paste URL; direct Drive embed; continue no-write dry-runs. | Uploading before this can expose the wrong recording, duplicate assets, or publish before review. | Regenerate valid Vimeo token, configure account/project confirmation, rerun private synthetic smoke, then approve one reviewed real class upload. | REQ-20260708-060, REQ-20260708-068, REQ-20260708-069 | Approved for private smoke; blocked by credential_invalid |
| DEC-20260708-014 | Coordinate with the other active agent and avoid unrelated dirty files. | Another agent may be editing unrelated files while this workflow continues. | Codex | Stage/commit only Vimeo-folder workflow files and leave unrelated dirty files untouched. | Pause all work until the other agent finishes; commit everything together. | Mixing unrelated provider-session work into Vimeo commits can break provenance and rollback. | Inspect `git status` before staging and use explicit path staging. | REQ-20260708-064 | Done for this closeout |
| DEC-20260708-015 | Vimeo configured access token is invalid for private smoke. | A valid Vimeo access token with the intended account/project and upload/read/private-video capability is missing or rejected. | Shloimie/account owner | Regenerate the Vimeo token from the intended app/account, store it in keyholder/server-side `VIMEO_ACCESS_TOKEN`, set private test project/account confirmation env, and rerun the synthetic private smoke before real upload. | Manual private Vimeo upload and paste URL into review package; continue dry-runs only. | Without a valid token, no API upload/readback/rollback proof exists and real class publication cannot be called ready. | Provide/store the valid token and test project/account confirmation; Codex reruns private smoke and records rollback evidence. | REQ-20260708-068, REQ-20260708-069 | Blocked |

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
| `04-desktop-setup-local-video-smoke.product-quality.json` | VERIFICATION_PACKET | Done | Set up this desktop and run safe local video workflow smokes without external writes. |
| `05-approved-provider-readiness-transcription.product-quality.json` | PROVIDER_SETUP_PACKET | Done with blocked live write | Continue after broad approval: OpenAI synthetic transcription works, Railway Drive ID set, Vimeo private smoke blocked on 401 token, no real upload/publish. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-055 | raw/register/PQC/surface map | Created raw intake, requirement register, v1 surface map, and two PQC packets with external-write gates. | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-vimeo-folder-v1-studio-workflow/00-vimeo-folder-v1-control.product-quality.json ops/prompt-packets/2026-07-08-onetime-vimeo-folder-v1-studio-workflow/01-vimeo-folder-v1-local-processor.product-quality.json` | Pending closeout commit | Pending push | Not required |
| REQ-20260708-056 | local CLI/module | Built scoped processor with folder discovery, metadata sidecar parsing, trim plan, static opener render path, processed sidecar output, and package script. | PASS `node --check src/lib/bna/one-time-vimeo-studio-pipeline.js`; PASS `node --check scripts/one-time-vimeo-studio-pipeline.mjs`; PASS focused node tests 11/11 | Pending closeout commit | Pending push | Not required |
| REQ-20260708-057 | existing Vimeo dry-run handoff | Reused `src/lib/bna/one-time-vimeo-folder-library.js` to verify output package in dry-run mode. | PASS synthetic report dry-run summary: external write false, production mutation false, member visibility false, blockers 0 | Pending closeout commit | Pending push | Not required |
| REQ-20260708-058 | synthetic self-test | Generated non-sensitive tiny test clip, processed it, and inspected committed report. | PASS `node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/onetime-vimeo-studio-self-test --processed-folder media-inbox/onetime-vimeo-studio-self-test-processed --report-dir ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-synthetic-self-test --render --default-trim-start 1 --default-trim-end 1 --opener-seconds 1 --width 640 --height 360 --json --write-report` | Pending closeout commit | Pending push | Not required |
| REQ-20260708-059 | student portal/bot knowledge | Block until approved transcript/knowledge policy and implementation packet exist. | Blocked by DEC-20260708-012 | Pending | Pending | Required |
| REQ-20260708-060 | real Vimeo upload/member publish | Block until Vimeo private smoke and explicit upload/publish approvals exist. | Blocked by DEC-20260708-013 | Pending | Pending | Required |
| REQ-20260708-061 | desktop setup/readiness | Grounded canonical Drive folder through connector, inspected `G:\My Drive`, and created desktop test surface at `G:\My Drive\OneTime Vimeo Studio Desktop Test`. | PASS desktop readback: `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-setup-readback.md` | Scoped closeout commit | Scoped closeout push | Not required |
| REQ-20260708-062 | local video smoke | Ran Drive Desktop synthetic edge-trim smoke and local OneTime promo smoke through render + sidecar + Vimeo dry-run. | PASS reports `2026-07-08T14-57-57-516Z-report.md` and `2026-07-08T14-57-46-513Z-report.md`; outputs read back as 6.02s and 13.02s MP4 with audio, 640x360, 30fps | Scoped closeout commit | Scoped closeout push | Not required |
| REQ-20260708-063 | trim improvement | Added BOM-safe sidecar parsing, explicit non-class media safety flag handling, optional black/silence edge trimming, optional OpenAI transcription smoke path, and 30fps normalization for rendered trims. | PASS `node --check` module/CLI; PASS focused node tests 17/17 | Scoped closeout commit | Scoped closeout push | Not required |
| REQ-20260708-064 | no-write readiness closeout | Validated no-write readiness and named live blockers. | PASS PQC validation 3/3; PASS `npm run watchdog:protocol-drift`; PASS transcription blocker report redacts the invalid OpenAI key; real Vimeo/portal/bot writes not performed | Scoped closeout commit | Scoped closeout push | Not required |
| REQ-20260708-065 | approval capture | Captured broad approval and safe interpretation as raw/protocol evidence. | PASS raw record and memory entry exist; irreversible writes remain gated. | Pending closeout commit | Pending push | Not required |
| REQ-20260708-066 | transcription credential/readiness | Added keyholder-first OpenAI credential candidate resolution and reran synthetic speech transcription. | PASS synthetic speech smoke: `external_ai_transcription_performed=true`, transcript present, length 73, hash `32e598043f89f6f4`, no transcript body committed. | Pending closeout commit | Pending push | Not required |
| REQ-20260708-067 | Drive folder/Railway readiness | Verified Drive folder `04 Content and Media Intake` ID `1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv`, set `ONE_TIME_DRIVE_DROP_FOLDER_ID` on `one-time-web` production with `--skip-deploys`, and updated readiness checker. | PASS readiness now marks SETUP-ONETIME-VIMEO-001 ready at config-presence level; overall 4/8 setup areas ready, unrelated launch blockers remain. | Pending closeout commit | Pending push | Deploy later to consume env |
| REQ-20260708-068 | Vimeo private smoke | Updated private smoke script to load keyholder token safely and attempted synthetic private smoke. | BLOCKED provider response `credential_invalid` 401; external_write=false, public_publish=false, token_printed=false. | Pending closeout commit | Pending push | Blocked |
| REQ-20260708-069 | real upload/portal/bot | Stopped before real class upload, portal latest-class update, or bot knowledge promotion. | BLOCKED by invalid Vimeo token, no passed private smoke, and no reviewed real class package. | Pending | Pending | Required after blockers clear |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-055 | Done | `raw-input/RAW-20260708-011-onetime-vimeo-folder-v1-studio-workflow.md`; this register; `ops/surface-maps/2026-07-08-onetime-vimeo-folder-v1-surface-map.md`; PQC validation report | `raw-input/*`, `tasks-pending/*`, `ops/prompt-packets/*`, `ops/surface-maps/*`, `memory/2026-07-08.md` | PASS PQC validation; PASS `npm run watchdog:protocol-drift` | None |
| REQ-20260708-056 | Done | `src/lib/bna/one-time-vimeo-studio-pipeline.js`; `scripts/one-time-vimeo-studio-pipeline.mjs`; `tests/one-time-vimeo-studio-pipeline.test.js`; `package.json` | local processor, CLI, tests, package script | PASS syntax checks; PASS focused node tests 11/11 | Exact laptop synced folder path remains an operator setup detail under DEC-20260708-011 |
| REQ-20260708-057 | Done | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-synthetic-self-test/2026-07-08T14-36-02-478Z-report.md` | processor + Vimeo dry-run sidecar output | PASS no-write Vimeo dry-run: candidate count 1, ready for review 1, external write false, DB mutation false, member visibility false | Real Vimeo upload remains blocked by DEC-20260708-013 |
| REQ-20260708-058 | Done | synthetic local self-test report and ignored processed clip/sidecar under `media-inbox/onetime-vimeo-studio-self-test-processed` | tests and report | PASS rendered output exists; PASS sidecar exists; PASS blockers 0 | Synthetic clip only; real class smoke still blocked by decisions |
| REQ-20260708-059 | Blocked | DEC-20260708-012 | none | Not run | Needs approved transcript/bot knowledge policy |
| REQ-20260708-060 | Needs operator decision | DEC-20260708-013 | none | Not run | Needs Vimeo account/private-smoke/upload approval |
| REQ-20260708-061 | Done | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-setup-readback.md` | readback report, raw continuation, register | PASS connector/local mount readback; canonical Drive folder visible by connector but not mounted in local `G:\My Drive` | Exact laptop shared-folder mount remains open under DEC-20260708-011 |
| REQ-20260708-062 | Done | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-drive-edge-smoke/2026-07-08T14-57-57-516Z-report.md`; `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-promo-smoke/2026-07-08T14-57-46-513Z-report.md` | smoke reports, processor output sidecars | PASS rendered outputs exist; PASS Vimeo dry-run external_write=false, DB mutation=false, member visibility=false, blockers 0 | Real class file smoke should use reviewed source media only |
| REQ-20260708-063 | Done | `src/lib/bna/one-time-vimeo-studio-pipeline.js`; `scripts/one-time-vimeo-studio-pipeline.mjs`; `tests/one-time-vimeo-studio-pipeline.test.js` | processor, CLI, tests | PASS focused tests 17/17; PASS output duration regression fixed by fps normalization | Semantic class-start/class-end detection remains later work; edge trim only detects leading/trailing black or silence |
| REQ-20260708-064 | Done locally; live blocked | `ops/product-quality-compiler/validation/latest-product-quality-validation.md`; `ops/watchdog-audits/2026-07-08-product-quality-drift.md`; `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-promo-transcription-smoke/2026-07-08T15-01-20-367Z-report.md` | register, PQC packet, validation/watchdog reports, transcription blocker report | PASS PQC 3/3; PASS watchdog 0 findings; PASS no real Vimeo upload, DB write, member visibility, portal publish, or bot knowledge promotion | OpenAI transcription key rejected with 401; Vimeo upload, transcript promotion, portal visibility, and bot knowledge remain approval-gated by DEC-20260708-012/013 |
| REQ-20260708-065 | Done | `raw-input/RAW-20260708-013-onetime-vimeo-approved-continue.md`; `memory/2026-07-08.md` | raw/memory/register | PASS raw approval preserved and safe interpretation recorded | None |
| REQ-20260708-066 | Done | `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-approved-speech-transcription-smoke/2026-07-08T15-19-21-874Z-report.md` | pipeline module/tests/report | PASS OpenAI transcription used keyholder `openaiv2.txt`; transcript present length 73; committed report has status/length/hash only | Real class transcript promotion still needs reviewed class package/policy |
| REQ-20260708-067 | Done | `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md` | readiness script/report | PASS Drive folder ID set on Railway with skip deploys; readiness shows Vimeo/Drive config presence without secret output | Production deploy later needed to consume env; other launch setup areas remain blocked |
| REQ-20260708-068 | Blocked | `ops/one-time-mishnah/vimeo-private-smoke/2026-07-08-approved-private-smoke-readiness/2026-07-08T15-19-37-633Z-vimeo-private-smoke.md` | private smoke script/report | BLOCKED Vimeo returned 401 `credential_invalid`; external_write=false, public_publish=false, token_printed=false | Needs DEC-20260708-015 valid token and private project/account confirmation |
| REQ-20260708-069 | Blocked | DEC-20260708-012, DEC-20260708-013, DEC-20260708-015 | none | Not run by design | Needs passed private smoke plus approved real class package, portal/latest-class packet, deploy, and live smoke |
