# 2026-06-26 - Agent Review Drop-Off And Public Helper Guardrails

- Raw ID: `RAW-20260626-003`
- Task ID: `TASK-20260626-003`
- Source: `raw-input/RAW-20260626-003-agent-review-dropoff-public-helper-guardrails.md`
- Owner: Codex
- Workspace/project: `bna_platform` / `agent_review_hub`
- Status: `running`

## Verification Snapshot

| Item | Evidence |
| --- | --- |
| GitHub master before repair | `75cba023c8b03080050c1c956f840da96a1f26a0` |
| Railway deployment before repair | `3cd5b8d1-d63d-4b70-b08e-04473ba0cd2a`, `SUCCESS` |
| Issue/PR status before repair | Issue #24 open; PR #33/#34/#35 merged |
| Existing `operations-super-admin` AGR | No latest prompt result visible in live hub contexts before this repair |
| Task `#1738` before repair | Public-created deploy task, assigned to Codex, job `#346` queued |
| Task `#1738` after neutralization | Archived history, agent job `#346` completed, audit comment `#12439` |

## Requirements

| ID | Requirement | Status | Acceptance Criteria | Evidence |
| --- | --- | --- | --- | --- |
| `REQ-20260626-109` | Verify current master, deployment, Issue #24, PRs #33/#34/#35, existing AGR state, and task `#1738`. | Done | Record current GitHub, Railway, issue/PR, prompt/result, and task state before code changes. | `git ls-remote`, `gh issue view 24`, `gh pr view 33/34/35`, `npm run railway:doctor`, live hub/task API readback. |
| `REQ-20260626-110` | Harden Agent Mode prompt/drop-off contract. | Implemented, verification pending | Generated prompts require self-save, `SAVED AGR-...` on success, `DROP-OFF FAILED` only when all save paths fail, exact drop-off URL, API fallback, emergency fallback, and no manual-download/upload success wording. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/*.md`. |
| `REQ-20260626-111` | Add emergency paste JSON fallback UI. | Implemented, verification pending | Drop-off page exposes "Emergency paste JSON and save" as fallback, not normal path. | `public/agent-review-dropoff.html`. |
| `REQ-20260626-112` | Add strict Agent Mode prompt/drop-off tests. | Implemented, focused tests passed | Tests cover self-save, exact URLs, `SAVED AGR-...`, `DROP-OFF FAILED`, forbidden phrases, UI fallback, result API/readback/idempotency coverage. | `tests/agent-review-hub.test.js`; focused test pass 13/13 for new/adjacent tests. |
| `REQ-20260626-113` | Block public/wrong-role Tier-3 unsafe task creation. | Implemented, verification pending | Public/anonymous/non-admin unsafe actions return refusal and create no normal task, Codex queue item, deployment request, or support ticket; optional audit is redacted/non-executable. | `server.js`. |
| `REQ-20260626-114` | Add public helper unsafe-action tests and live smoke. | Implemented, focused tests passed | Tests cover deploy/Railway/class backfill/student contact/DNS/card/WhatsApp/Vimeo/worker probes; live smoke verifies both assistant endpoints refuse. | `tests/public-helper-agent-review-guardrails.test.js`, `scripts/smoke-public-helper-unsafe-action-live.mjs`. |
| `REQ-20260626-115` | Deploy, live-smoke, rerun exact owner pilot, and close evidence. | Running | Full local verification, deploy, Railway doctor, live Agent Review/Task drop-off/public unsafe smokes, owner pilot AGR, ledger/changelog/register closeout. | Pending final verification. |

## Decision / Blocker Register

| ID | Status | Decision | Recommended Option | Consequence |
| --- | --- | --- | --- | --- |
| `DEC-20260626-001` | Resolved | What to do with unsafe public task `#1738`. | Preserve history, archive as invalid, complete linked job, add audit comment. | Done via live task API; no deletion. |

## Final Audit Table

| Requirement | Terminal Status | Evidence | Verification |
| --- | --- | --- | --- |
| `REQ-20260626-109` | Done | Current master/deploy/issue/PR/live task readbacks recorded above. | Live APIs and CLI checks completed. |
| `REQ-20260626-110` | Pending final | Prompt source and generated files changed. | Focused tests passed; full suite pending. |
| `REQ-20260626-111` | Pending final | Drop-off HTML updated. | Focused tests passed; live smoke pending. |
| `REQ-20260626-112` | Pending final | Test coverage added. | Focused test pass 13/13; full suite pending. |
| `REQ-20260626-113` | Pending final | Server guardrail implemented. | Focused test pass; live public helper smoke pending. |
| `REQ-20260626-114` | Pending final | Unsafe-action tests and smoke script added. | Focused test pass; live smoke pending. |
| `REQ-20260626-115` | Running | Deployment/live closeout pending. | Pending. |
