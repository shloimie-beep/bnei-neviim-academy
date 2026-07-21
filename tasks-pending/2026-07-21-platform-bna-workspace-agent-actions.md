# 2026-07-21 - Platform, BNA Workspace, And Agent Action Drop-Off

Raw source: `raw-input/RAW-20260721-001-platform-bna-workspace-agent-actions.md`
Raw SHA-256: `sha256:7b3913c7a20e0dcaff563decf277aad7ef241a2560800548c4ed09966d48f538`
Spec: `tasks-pending/2026-07-21-platform-bna-workspace-agent-actions.SPEC.json`
Branch: `codex/platform-bna-workspace-agent-actions`

## Intake Snapshot

- Clean isolated worktree: `C:\Users\User\BNA-platform-bna-workspace-agent-actions`.
- Base: current `origin/master` at `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`.
- Source refs fetched: PR #134 and PR #138.
- Source PR rule: port safe semantics only; no mechanical merge.
- External source: One Time current HighLevel branch `codex/highlevel-api-finalize-agent-queue` contains `integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json` at SHA `1000e8f46210a85f720f83fce2678b24a44fa94d`.
- Production deploy: explicitly out of scope.

## Requirement Register

| ID | Requirement | Workspace/project | Acceptance | Status |
|---|---|---|---|---|
| REQ-20260721-001 | Isolated worktree, branch, and draft PR | platform_control / platform_operations | Branch is based on current master, source PR refs inspected, draft PR targets master. | Done locally; PR pending |
| REQ-20260721-002 | Canonical taxonomy and compatibility resolver | all platform workspaces | Canonical keys and aliases resolve; no destructive DB rename; migration plan exists. | Done |
| REQ-20260721-003 | Normal workspace switcher and routes | platform_control | `/operations`, `/operations/school`, `/operations/workspaces/one-time`, `/operations/agent-actions` exist and normal nav does not rely on View-as. | Done |
| REQ-20260721-004 | Focused BNA school workspace | bna_school / bna_school | `/operations/school` shows BNA school workspace and bounded summary data without One Time leakage. | Done |
| REQ-20260721-005 | Agent Action job/drop-off | platform_control / platform_operations | Required routes, API, job contract, statuses, controls, idempotency, emergency save, and readback rule exist while Agent Review remains. | Done |
| REQ-20260721-006 | HighLevel Agent Mode import | one_time / one_time_mishnayos | Safe importer pins/ref/fingerprints/dedupes/imports no secrets and preserves prompt text. | Done |
| REQ-20260721-007 | Ticket routing correction | platform_control, bna_school, one_time | Live questions, business conversations, and technical tickets are distinct records with correct ownership. | Done |
| REQ-20260721-008 | Registries and focused validation | platform_control | Route/action registries updated and focused checks run. | Done |
| REQ-20260721-009 | Isolated preview | platform_control | Local/PR preview shows the new surfaces without production deployment. | Done |

## Blockers

None.

## Closeout Evidence To Record

- Changed JS parse checks.
- Focused taxonomy, route, school workspace, and Agent Action tests.
- Agent Action result idempotency/readback proof.
- `npm run secrets:audit`.
- `git diff --check`.
- Local preview URL or PR environment URL.
- Draft PR URL.

## Closeout Snapshot

- Local preview URL: `http://127.0.0.1:8095/operations/agent-actions`.
- Evidence: `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/`.
- Validation: changed JS parse PASS, focused tests PASS, Agent Action idempotency/readback PASS, HighLevel import dry-run PASS, secrets audit PASS, `git diff --check` PASS, preview smoke PASS.
- HighLevel import: `GHL_JOBS_IMPORTED=14`; first imported dry-run job `GHL-UI-01`.
- Production changed: no.
- Remaining blocker: none.
