# Drive Transcript Visibility, OpenAI v2 Fallback, Parser Routing

Raw ID: `RAW-20260702-DRIVE-TRANSCRIPT-VISIBILITY-OPENAI2-KIMI-FALLBACK-PARSER-ROUTING`
Packet ID: `RAW-20260702-DRIVE-TRANSCRIPT-VISIBILITY-OPENAI2-KIMI-FALLBACK-PARSER-ROUTING`
Active goal: Drive media/transcript pipeline fix and audit
Related active run requirement: `REQ-20260702-103`
Evidence folder: `ops/drive-transcript-visibility/2026-07-02/`

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Goal tool used | yes |
| Execution directive | Register first, then work requirements in safe batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible/server-visible work | yes |
| Current active run pointer changed | no |

## Parsed Requirements

| ID | Requirement | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260702-201 | Create raw intake, register, and evidence folder. | BNA Academy / content pipeline | Codex | protocol | P0 | B0 | none | Required files exist without secrets/raw transcripts. | In progress |
| REQ-20260702-202 | Audit OpenAI/Kimi credential resolution and transcription provider path. | BNA Academy / content pipeline | Codex | credential_audit | P0 | B1 | 201 | `openaiv2.txt` detection, OpenAI validation, Kimi capability boundary, and transcription path gap recorded. | Pending |
| REQ-20260702-203 | Implement safe reusable OpenAI v2 credential fallback for transcription jobs. | BNA Academy / content pipeline | Codex | implementation | P0 | B2 | 202 | Bad env OpenAI key no longer strands transcription without trying valid keyholder candidate; no secrets logged. | Pending |
| REQ-20260702-204 | Implement/verify transcription provider fallback status model and resumable blocker behavior. | BNA Academy / content pipeline | Codex | implementation | P0 | B2 | 202 | 401/auth failures produce structured fallback/blocker fields and idempotent resumable status. | Pending |
| REQ-20260702-205 | Produce read-only Drive folder inventory and logical storage plan. | BNA Academy / Drive pipeline | Codex | drive_audit | P0 | B3 | 201 | Inventory JSON/MD covers configured folders, stuck files, transcript-doc gaps, and dry-run storage plan. | Pending |
| REQ-20260702-206 | Trace and repair Job `101` within safe gates. | BNA Academy / content job 101 | Codex | job_trace | P0 | B4 | 202,203,204 | Job `101` is completed or has exact blocker/next action; no raw transcript in GitHub. | Pending |
| REQ-20260702-207 | Build last-week backlog matrix and dry-run transcript doc plan. | BNA Academy / Drive pipeline | Codex | backlog_audit | P0 | B5 | 205 | Every 2026-06-25..2026-07-02 file/job has status and safe next action. | Pending |
| REQ-20260702-208 | Audit parser routing implementation for prior parser jobs and transcript-derived lanes. | BNA Academy / parser pipeline | Codex | parser_audit | P0 | B6 | 206,207 | Implemented/missing/dry-run/unsafe statuses recorded for questions, tasks, scores, newsletter, source sheets, private review. | Pending |
| REQ-20260702-209 | Verify/plan deterministic student question routing. | BNA Academy / class questions | Codex | routing_audit | P0 | B6 | 208 | Matched, class broadcast, and private-review routing rules have evidence/idempotency requirements. | Pending |
| REQ-20260702-210 | Verify/plan transcript-derived Codex/agent task routing. | BNA Academy / agent queue | Codex | routing_audit | P0 | B6 | 208 | Task candidates route to canonical queue or dry-run approval packet without duplicates/private text leakage. | Pending |
| REQ-20260702-211 | Produce score/progress/grading readiness and approval packet only. | BNA Academy / student progress | Codex | safety_gate | P0 | B6 | 208 | No production score/progress writes; redacted row-level readiness or blocker and exact approval phrase exist. | Pending |
| REQ-20260702-212 | Produce ChatGPT Drive connector readiness report. | BNA Academy / Drive transcript library | Codex | readiness | P1 | B7 | 205 | Search checklist and pass/fail conditions exist for private transcript docs. | Pending |
| REQ-20260702-213 | Run verification, update active run evidence, ledger, and changelog. | BNA Academy / repo protocol | Codex | closeout | P0 | B8 | 201-212 | Focused tests/audits pass or blockers recorded; active run and records point to evidence. | Pending |

## Decisions And Approval Gates

| ID | Decision | Owner | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|
| DEC-20260702-201 | Install OpenAI v2 keyholder value into Railway transcription worker if local resolver proves Railway env is stale and repo policy requires explicit propagation approval. | Shloimie / Railway key owner | `APPROVE_20260702_INSTALL_OPENAI_V2_KEY_FROM_BNA_KEYHOLDER_TO_TRANSCRIPTION_WORKER_ONLY` | 203, 204 production worker parity | Pending |
| DEC-20260702-202 | Create/update private Drive transcript docs for backlog and future uploads if dry-run proves exact target folder/doc changes. | Shloimie | `APPROVE_20260702_PRIVATE_DRIVE_TRANSCRIPT_DOC_SYNC_FOR_BACKLOG_AND_FUTURE_UPLOADS` | 205, 206, 207 apply writes | Pending |
| DEC-20260702-203 | Run backlog transcription and private Drive doc sync after exact dry-run. | Shloimie | `APPROVE_20260702_BACKLOG_TRANSCRIBE_AND_PRIVATE_DRIVE_DOC_SYNC_APPLY_EXACT_PACKET_ONLY` | 207 apply work | Pending |
| DEC-20260702-204 | Apply score/progress/grading rows after row-level before/after dry-run. | Shloimie | `APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY` | 211 apply work | Pending |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260702-201 | In progress | `ops/drive-transcript-visibility/2026-07-02/` | This register and raw record | Pending | Evidence files are being filled. |
