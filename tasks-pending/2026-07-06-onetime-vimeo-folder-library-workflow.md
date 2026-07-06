# One Time Vimeo Folder-To-Library Workflow - 2026-07-06

## Raw intake

> I saved the Vimeo access token. It's in a file called Vimeo secret stuff in downloads. And I want you to build out the whole workflow that we're able to save stuff in a folder and have it sent directly to the, you know, the library.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260706-967` |
| Source | Codex chat |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-06-onetime-vimeo-folder-library-workflow.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes - operator asked to build out the whole workflow |
| Active goal objective | Build the One Time Rabbi Scheller Mishnah class Vimeo folder-to-library workflow with safe credential intake, scoped upload/readiness, review/publish gates, verification, and blockers for any real external upload/member-library publish that lacks explicit approval. |
| Goal tool used | yes |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | `REQ-20260706-965`, `REQ-20260706-966`, `REQ-20260706-967` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260706-965` | Safely ingest the Vimeo access token from Downloads into the local BNA keyholder by fingerprint/status only. | `RAW-20260706-967` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | credential_readiness | P0 | B1 | none | Token value is never printed; keyholder gets `vimeo-access-token.txt`; diagnostics show present by fingerprint; no Railway push unless separately approved. | `C:\Users\User\BNA-Keyholder\vimeo-access-token.txt`, `ops/one-time-mishnah/vimeo-folder-library/2026-07-06T17-25-02-751Z-report.*` | no | Done |
| `REQ-20260706-966` | Build the folder-to-library workflow for One Time media intake. | `RAW-20260706-967` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | media_workflow | P0 | B2 | `REQ-20260706-965` | A repeatable CLI scans a configured local folder, records safe media candidates, supports dry-run by default, uploads only under explicit synthetic/apply gates, links results to One Time scoped class/media metadata, and produces a handoff for internal review/member-library publish. | `src/lib/bna/one-time-vimeo-folder-library.js`, `scripts/one-time-vimeo-folder-library.mjs`, `package.json`, `tests/one-time-vimeo-folder-library-workflow.test.js` | no app-visible route/UI change | Done |
| `REQ-20260706-967` | Preserve external-write and member-visibility gates. | `RAW-20260706-967` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | safety | P0 | B2 | `REQ-20260706-966` | No real Vimeo upload, member-library publish, member visibility, send, access grant, Drive write/move/delete, billing action, or deployment happens without exact approval and smoke evidence. | `src/lib/bna/one-time-vimeo-folder-library.js`, `tests/one-time-vimeo-folder-library-workflow.test.js`, `scripts/check-onetime-external-setup-readiness.mjs` | no | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260706-965` | onetime-vimeo-folder-library-workflow | Build One Time scoped Vimeo folder-to-library automation. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260706-967` | `REQ-20260706-965`-`REQ-20260706-967` | Use `npm run one-time:vimeo-library` for default dry-run scan; real upload/publish remains approval-gated. | agent work | local verified |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260706-965` | Approve real Vimeo uploads/member-library publish after synthetic smoke. | Exact apply command, folder target, test/real media source, library destination, visibility/tier, rollback/unpublish path. | Shloimie / provider owner | Run dry-run and synthetic private smoke first; only then approve one exact real-file apply. | Keep manual Vimeo upload + paste URL; keep review-only queue. | Without this, the workflow can be built and dry-run but real uploads/publishing stay blocked. | After dry-run evidence, approve the exact upload/publish packet or choose manual fallback. | `REQ-20260706-966`, `REQ-20260706-967` real external-write closeout | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| `Q-20260706-965` | Which exact local folder should be the watched/drop folder for videos if different from the existing One Time Drive dropoff workflow? | The CLI can accept `--folder`, but a scheduled watcher needs a stable folder path/alias. | Blocks scheduled automation only | Defaulted locally to `media-inbox/one-time-vimeo-drop`; open only if Shloimie wants a different watched folder or scheduled watcher. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| `MEM-20260706-967` | Vimeo folder-to-library workflow must be scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`. | Already covered in memory topics; reinforce if implementation reveals a new invariant. | Prevents global BNA/provider leakage. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260706-965` | Keyholder and no-secret diagnostics | Copied normalized token from `C:\Users\User\Downloads\vimeo seceret stuff.txt` to `C:\Users\User\BNA-Keyholder\vimeo-access-token.txt`; reported only length and fingerprint. | Dry-run report shows `vimeo_access_status.configured=true`, source `keyholder`, length `232`, fingerprint `d57f6ab0e5c0`; latest clean-branch run `npm run one-time:vimeo-library` wrote report `2026-07-06T17-25-02-751Z`; `npm run secrets:audit` passed. | pending | pending | not required |
| `REQ-20260706-966` | `src/lib/bna/one-time-vimeo-folder-library.js`, `scripts/one-time-vimeo-folder-library.mjs`, `package.json` | Added scoped workflow: default drop folder `media-inbox/one-time-vimeo-drop`; supported media `.mp4/.mov/.m4v/.webm`; optional sidecar JSON; dry-run report; exact gates for upload, DB review-package write, and member-library publish. | `npm run one-time:vimeo-library` created `ops/one-time-mishnah/vimeo-folder-library/2026-07-06T17-25-02-751Z-report.*`; focused and adjacent tests pass. | pending | pending | no app-visible route/UI change |
| `REQ-20260706-967` | `tests/one-time-vimeo-folder-library-workflow.test.js`, existing One Time member-library APIs | Implemented gates: `UPLOAD_ONE_TIME_VIMEO_LIBRARY` for Vimeo upload, `CREATE_ONE_TIME_LIBRARY_REVIEW` for DB review package, `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` for member publish; real media also requires `--allow-real-media`. | Tests prove wrong-scope sidecars are blocked, upload without exact confirmation is blocked, mocked synthetic upload does not publish, and publish remains blocked without the existing approval flag. | pending | pending | not required |

## Operator command notes

Default no-write scan:

```powershell
npm run one-time:vimeo-library
```

Put videos in:

```text
media-inbox/one-time-vimeo-drop
```

Optional sidecar file next to a video, for example `class-01.json` beside `class-01.mp4`:

```json
{
  "title": "Mishnah Berachos 1:1",
  "class_date": "2026-07-06",
  "masechta": "Berachos",
  "perek": "1",
  "mishnah_range": "1",
  "summary": "Reviewed class summary.",
  "transcript_status": "approved",
  "synthetic_test": false,
  "real_class_recording": true,
  "contains_sensitive_data": false
}
```

Real upload/review/publish commands are intentionally split and require exact
flags. No real command was run in this closeout.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260706-965` | Done | `C:\Users\User\BNA-Keyholder\vimeo-access-token.txt`; `ops/one-time-mishnah/vimeo-folder-library/2026-07-06T17-25-02-751Z-report.json`; no token printed | keyholder file plus workflow dry-run report | `npm run one-time:vimeo-library`; `npm run secrets:audit` | No Railway/production env secret push was performed. |
| `REQ-20260706-966` | Done | `src/lib/bna/one-time-vimeo-folder-library.js`; `scripts/one-time-vimeo-folder-library.mjs`; `tests/one-time-vimeo-folder-library-workflow.test.js`; report path above | workflow module, CLI, package script, tests | `node --check` for new files; `node --test tests/one-time-vimeo-folder-library-workflow.test.js`; adjacent One Time/Vimeo/member tests 27/27 | Scheduled watcher and alternate folder path remain optional future work. |
| `REQ-20260706-967` | Done | Tests and report show `external_write_performed=false`, `production_mutation_performed=false`, `member_visibility_performed=false`; setup check now shows Vimeo token present and Drive/drop-folder still missing. | workflow gates and setup-check warning correction | `node --test tests/vimeo-media-integration-readiness.test.js tests/one-time-recording-vimeo-pipeline.test.js tests/one-time-member-library.test.js tests/one-time-vimeo-folder-library-workflow.test.js`; `npm run one-time:setup:check` returned expected remaining blockers | Real Vimeo upload/member publish requires `DEC-20260706-965` approval and exact command. |
