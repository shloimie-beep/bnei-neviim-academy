# 2026-06-26 - Issue #24 Owner Helper Guardrail Follow-Up

- Raw ID: `RAW-20260626-004`
- Task ID: `TASK-20260626-004`
- Source:
  `raw-input/RAW-20260626-004-issue24-owner-helper-guardrail-followup.md`
- Owner: Codex
- Workspace/project: `bna_platform` / `agent_review_hub`
- Status: `running`
- Parent issue: GitHub Issue #24

## Requirements

| ID | Requirement | Status | Acceptance Criteria | Evidence |
| --- | --- | --- | --- | --- |
| `REQ-20260626-116` | Preserve owner correction as canonical Issue #24 follow-up. | Running | Raw source, register, ledger/changelog, and Issue #24 comment link this correction to the Agent Review guardrail repair. | This register; raw input file; `TASKS.md`; `ops/agent-task-ledger.jsonl`. |
| `REQ-20260626-117` | Harden helper/task boundary for public, anonymous, parent, student, wrong-role, provider, and super-admin actors. | Implemented locally, pending deploy/live smoke | Non-admin and wrong-role helpers refuse unsafe admin/deploy/integration/billing/DNS/backfill/credential/send/publish/production-write requests without executable Tasks; Rabbi provider actions stay provider-scoped; super-admin broader work stays typed/audited. | `server.js` broadens Tier-3 unsafe matcher and removes generic non-superadmin `create_task` permissions; `tests/public-helper-agent-review-guardrails.test.js`; `scripts/smoke-public-helper-unsafe-action-live.mjs`; `npm test` passed 1365/1365; action/security watchdogs and secrets audit passed. |
| `REQ-20260626-118` | Inspect and preserve/neutralize task `#1738`. | Already satisfied, live readback verified | If task `#1738` is executable, archive/reclassify with audit note and keep history. | Live readback on 2026-06-26: task `#1738` title `Archived invalid public deploy request`, stage `archive`, `task_kind=history`, assigned_to `Shloimie`, `agent_status=completed`, no active agent jobs returned. |
| `REQ-20260626-119` | Re-verify Agent Mode drop-off contract. | Locally verified, pending required live AGR pilots | Prompts require direct BNA save, `SAVED AGR-...`, no manual downloadable JSON success, fallback save, and `DROP-OFF FAILED` only when every save path fails. | `tests/agent-review-hub.test.js`; generated prompt files still include direct save/API fallback/emergency fallback/`SAVED AGR-...`/`DROP-OFF FAILED` and forbid manual-download/upload success wording. |
| `REQ-20260626-120` | Rerun three required live pilots before broad audits continue. | Running | `operations-super-admin`, `public-login-setup`, and `cross-role-wrong-permission` each produce visible AGR results or exact BLOCKED results. | Pending live AGRs. |

## Guardrail Notes

- Broad parallel Agent Mode audits are paused until the three pilots above have
  visible terminal AGR/BLOCKED evidence.
- Public helper safety should prefer refusal plus redacted audit/support over
  executable work.

## Local Verification

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-public-helper-unsafe-action-live.mjs`
- PASS `node --check scripts/smoke-agent-review-required-pilots-live.mjs`
- PASS `node --test tests/public-helper-agent-review-guardrails.test.js tests/agent-review-hub.test.js` (15/15)
- PASS `node --test tests/watchdog-action-registry.test.js` (5/5)
- PASS `npm test` (1365/1365)
- PASS `npm run watchdog:actions` (`finding_count=0`)
- PASS `npm run watchdog:security` (`finding_count=0`)
- PASS `npm run secrets:audit` (4906 tracked paths, 0 tracked secret-risk files)

## Next Required Live Step

After merge/deploy, run:

1. `node scripts/smoke-public-helper-unsafe-action-live.mjs`
2. `node scripts/smoke-agent-review-required-pilots-live.mjs`

Do not resume broad parallel Agent Mode audits until those three required
pilot rows are visible as `AGR-...` PASS results or exact BLOCKED results.
