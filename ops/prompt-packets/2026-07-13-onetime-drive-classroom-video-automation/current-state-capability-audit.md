# Current-State Capability Audit - One Time Drive-to-Classroom Video Automation

Parent raw ID: `RAW-20260713-004`

Requirement register:
`tasks-pending/2026-07-13-onetime-drive-classroom-video-automation.md`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

Audit date: 2026-07-13

## Credential And Provider Status

Literal Vimeo credential values are intentionally omitted.

| Check | Result | Evidence | Status |
|---|---|---|---|
| Existing `VIMEO_ACCESS_TOKEN` bearer readback | `/me` returned 200 for account `Shloimie Dratler`, plan `free`. | Read-only Vimeo API probe on 2026-07-13. | Works for account reads. |
| Newly supplied short string as bearer token candidate | `/me` returned 401. | Read-only Vimeo API probe on 2026-07-13. | Not a working user access token. |
| Newly supplied long string as bearer token candidate | `/me` returned 401. | Read-only Vimeo API probe on 2026-07-13. | Not a working user access token. |
| Newly supplied values as owner app credentials | Stored in local keyholder outside the repo; previous client-credential exchange succeeded, but minted app token did not provide `/me` user-video access. | Secret-redacted keyholder test; no repo secret storage. | Useful as app credentials, not enough by itself for uploads. |
| Private synthetic upload | Not rerun in this packet. | External write requires explicit gate. | Blocked until upload gate/owner token are confirmed. |

Conclusion: Vimeo read-only account access is currently available through the
existing local `VIMEO_ACCESS_TOKEN`. The newly supplied strings should not be
installed as `VIMEO_ACCESS_TOKEN` because both fail direct bearer readback.

## Verification

| Command/check | Result | Notes |
|---|---|---|
| Read-only Vimeo `/me` probe with existing local `VIMEO_ACCESS_TOKEN` | Passed | Returned account `Shloimie Dratler`, plan `free`. |
| Read-only Vimeo `/me` probe with each newly supplied value as bearer candidate | Failed | Both returned 401; no values printed. |
| `node --test tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-drive-intake-folder-map.test.js` | Passed 25/25 | Covers current Drive lane map, studio processor, folder-library upload gates, mocked private Vimeo upload path, and token-loader smoke. |
| Broader related run including member library/content command/shared review tests | Failed 44/45 | Failing assertion is `tests/one-time-member-library.test.js` expecting the literal text `Forgot parent password?` in `public/member-library.html`; this is a separate UI/test gap, not a Vimeo credential failure. |

## Capability Matrix

| Workflow area | Current status | Evidence inspected | Gap / next action |
|---|---|---|---|
| Raw intake, scope, packet DAG | Done | `raw-input/RAW-20260713-004-onetime-drive-classroom-video-automation.md`, this packet folder, register. | Keep the active dirty execution-run lane separate from this packet. |
| One Time workspace isolation | Already satisfied for existing library/studio workflow | `src/lib/bna/one-time-vimeo-folder-library.js`, `src/lib/bna/one-time-vimeo-studio-pipeline.js`, workflow tests. | Preserve `rabbi_sheller_provider` / `one_time_mishnah_class`; do not share BNA records. |
| Drive intake lane map | Partial | `src/lib/bna/one-time-drive-intake-map.js`, setup script/tests. | Lane and classifier exist, including media classification, but not the full stable Drive watcher/content-job orchestrator. |
| Stable-file admission | Missing for the requested automation | Drive intake map and older reconcile code inspected. | Add stable size/checksum/generation admission before creating content jobs. |
| Exactly-once content jobs, leases, retries, dead-letter states | Partial/missing | `src/lib/bna/class-drive-intake-reconcile.js`, `server.js` content job schema. | Older reconcile/idempotency exists, but not a One Time media job runner with leases and retry/dead-letter lifecycle. |
| Supported media formats | Partial | Studio/folder workflows support `.mp4`, `.mov`, `.m4v`, `.webm`; Drive classifier also recognizes `.mkv`. | Align studio/folder workflow with safe `.mkv` intake once FFmpeg verification is covered. |
| Conservative edge edit | Partial | `src/lib/bna/one-time-vimeo-studio-pipeline.js`, `tests/one-time-vimeo-studio-pipeline.test.js`. | Existing FFmpeg/sidecar/edge-detection workflow exists; default opener is still nonzero and should be zero for this Drive-to-classroom packet unless explicit config/sidecar requests it. |
| Original Drive video immutability | Partial | Studio workflow writes rendered outputs and reports; folder workflow blocks sensitive sidecars. | Need Drive orchestrator to guarantee source-file immutability and provenance hashes across reruns. |
| Long-form private transcription | Partial/missing | Studio workflow has OpenAI transcription helper and redacted reports. | Current path is whole-file/small-file oriented, not chunked long-form transcription with overlap, retries, dedupe, versioning, and state transitions. |
| Transcript privacy | Partial | Studio pipeline redacts transcript bodies from candidate reports. | Keep transcript bodies out of Git/logs; add versioned private storage/readback proof when implementing chunking. |
| Metadata generation | Partial/missing | Existing sidecar metadata and DB fields inspected. | Need versioned module for title, bullet description, Masechta/Perek/Mishnah/topic extraction, confidence, transliteration, and review states. |
| Bot knowledge handoff | Missing/partial | `server.js` helper knowledge schema exists. | Need scoped handoff contract that promotes approved, non-private knowledge without raw transcript leakage. |
| Vimeo upload | Partial | `src/lib/integrations/vimeo.js`, `scripts/vimeo-private-smoke.mjs`, folder workflow upload gate. | Upload code/gates exist; current owner access proof is read-only. Synthetic private upload remains blocked until explicit external-write gate and valid user upload token are confirmed. |
| Review package and member publication | Partial | `src/lib/bna/one-time-vimeo-folder-library.js`, `server.js` tables, tests. | DB review/publish gates exist; need Drive-origin package integration and portal/live smoke proof. |
| Latest video / older library views | Partial | `public/one-time-classroom.html`, `public/member-library.html`, `public/one-time-parent.html`, `public/student.html`, shared review data. | Needs end-to-end proof that entitled parent/student views show only approved One Time videos and no cross-workspace records. |
| Rabbi content UI | Blocked | Packet requires visual audit/PQC before UI code. | Generate visual audit/state matrix first; no UI edits yet. |

## Packet Recommendation

Next unblocked implementation packet is `PKT-20260713-004-02` after this audit:
Drive intake orchestrator. Keep it narrow:

- do not create a second pipeline;
- reuse the existing One Time Drive intake map and content job schema where
  possible;
- implement only dry-run/local tests until Drive/API credentials and runtime
  deployment gates are explicitly verified;
- keep Vimeo upload as a separate provider-gated packet.

The Vimeo packet `PKT-20260713-004-05` remains in progress, not done, because
read-only account proof is not the same as private upload/write proof.
