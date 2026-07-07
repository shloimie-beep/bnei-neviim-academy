# Audit Fix Implementation - 2026-07-07

## Source

- Raw input: `raw-input/RAW-20260707-015-audit-fix-implementation.md`
- Product Quality packet: `ops/prompt-packets/2026-07-07-audit-fix-implementation/00-audit-fix-implementation.product-quality.json`
- Prior related packets:
  - `tasks-pending/2026-07-07-helper-crisp-aligned-ui-closeout.md`
  - `tasks-pending/2026-07-07-parent-student-login-ui-polish.md`
  - `tasks-pending/2026-07-07-parent-trial-login-and-ia-consistency.md`
  - `tasks-pending/2026-07-07-rabbi-crm-config-noise-cleanup.md`
  - `tasks-pending/2026-07-07-onetime-brand-helper-toolbar-isolation.md`
  - `tasks-pending/2026-07-07-clean-launch-everything.md`

## Parsed Requirements

| ID | Requirement | Workspace/project | Owner | Priority | Batch | Acceptance criteria | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|
| REQ-20260707-150 | Capture this audit-fix/deploy request as raw intake, register, and Product Quality packet. | platform + one_time_mishnah_class | Codex | P0 | 0 | Raw file, register, and PQC packet exist and validate. | no | Done |
| REQ-20260707-151 | Classify current audit outputs into fixable, already satisfied, superseded, and blocked findings. | platform + one_time_mishnah_class | Codex | P0 | 1 | Current audit inventory names the executable UI findings and preserves external/private blockers separately. | no | Done |
| REQ-20260707-152 | Fix the current One Time/Operations action-control height and wrapping defects from the visual audits. | platform + one_time_mishnah_class | Codex | P0 | 2 | Desktop/tablet/mobile audit no longer reports action-height spread for the scoped Operations/provider routes, or any remaining finding is explicitly tied to a non-code blocker. | yes | Done locally |
| REQ-20260707-153 | Fix the admin-as-Rabbi/provider preview identity banner and return path in active, denied, and session-required states. | one_time_mishnah_class | Codex | P0 | 2 | Provider admin-view route shows admin/provider context and return affordance consistently on desktop and mobile. | yes | Done locally |
| REQ-20260707-154 | Repair the One Time role UI audit runner so proof writes to the requested output folder. | platform QA tooling | Codex | P1 | 2 | `--out-dir` and `--out` both work without clobbering prior proof folders. | no | Done |
| REQ-20260707-155 | Verify, commit, push, deploy, and live-smoke the scoped app-visible fixes. | platform release | Codex | P0 | 3 | Focused syntax/tests/audit pass; staged scope excludes unrelated artifacts; pushed commit is deployed and live-smoked. | yes | Pending release |
| REQ-20260707-156 | Keep unsafe audit findings blocked instead of pretending they are done. | platform + one_time_mishnah_class | Codex/Shloimie | P0 | 4 | WAPI, Drive/private-doc, external send/payment/DNS/provider-account, and credential findings name owner and next action. | no | Blocked |

## Current Audit Classification

| Finding group | Source evidence | Classification | Requirement |
|---|---|---|---|
| Operations/provider button height spread and wrapping | `ops/ui-audits/2026-07-07-audit-fix-pass-local-after/report.md`; earlier helper/role UI reports | Fixable now | REQ-20260707-152 |
| Admin-on-provider banner missing in provider preview denied/session-required states | `ops/ui-audits/2026-07-07-audit-fix-pass-local-after/report.md` | Fixable now | REQ-20260707-153 |
| Audit runner ignored `--out-dir` and overwrote default output | local command behavior during this pass | Fixable now | REQ-20260707-154 |
| Helper static resolver, navigation IA, and latest security route watchdog | `ops/helper-audits/test-issue-24-helper-audit/HELPER-SURFACE-AUDIT.md`; `ops/navigation-ia/test-issue-24-navigation-ia/NAVIGATION-IA-AUDIT.md`; latest security route watchdog | Already satisfied/currently passing | REQ-20260707-151 |
| WAPI/Whapi phonebook/sync | `ops/queue-audits/2026-07-07-task-1839-wappy-wapi-phonebook-report-blocked.md` | Blocked external setup | REQ-20260707-156 |
| Drive/private recording review and transcript sync | `ops/queue-audits/2026-07-07-task-1853-job101-drive-reprocess-followup.md` | Blocked private-data/account approval | REQ-20260707-156 |
| Payment, DNS, email/WhatsApp sends, provider account writes, credential setup | prior clean-launch blocker table and active execution-run blockers | Blocked without exact approved packet | REQ-20260707-156 |
| Repeated ChatGPT pickup/dropoff generated artifacts | `git status --short` artifact groups | Parked/generated-noise until separate retention/dedupe packet | REQ-20260707-156 |

## Blocker Table

| ID | Blocker | Owner | Recommended next action | Blocks requirements | Status |
|---|---|---|---|---|---|
| BLK-20260707-150 | WAPI/Whapi phonebook and sync require exact instance/phone aliases and external account setup. | Shloimie/account owner | Provide the exact WAPI/Whapi instance and phone aliases plus approval for a setup/sync packet. | REQ-20260707-156 | Blocked |
| BLK-20260707-151 | Drive/private recording reprocess and transcript sync require exact private-data approval and account reachability. | Shloimie/account owner | Approve the exact Job101/Drive sync scope and provide any required connector/account access. | REQ-20260707-156 | Blocked |
| BLK-20260707-152 | Payment, DNS, external sends, provider writes, credential mutations, and access grants are not approved by this broad audit-fix request. | Shloimie/account owner | Approve an exact action packet naming account, recipient/target, environment, copy/data, and rollback where applicable. | REQ-20260707-156 | Blocked |
| BLK-20260707-153 | Repeated generated dropoff/audit artifacts are too broad to commit safely in this implementation batch. | Codex | Create a separate retention/dedupe/ignore cleanup packet if these artifacts should be archived or pruned. | REQ-20260707-156 | Blocked |

## Verification Plan

- `npm run pqc:validate -- ops\prompt-packets\2026-07-07-audit-fix-implementation\00-audit-fix-implementation.product-quality.json`
- `node --check scripts\audit-onetime-role-ui-current-state.mjs`
- Local role UI visual audit to a new output folder.
- Relevant watchdogs/tests after code edits.
- `git diff --cached --check` and secret audit before commit.
- Deploy through the approved release path and live-smoke affected routes before app-visible Done.

## Final Audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260707-150 | Done | `raw-input/RAW-20260707-015-audit-fix-implementation.md`; this register; `ops/prompt-packets/2026-07-07-audit-fix-implementation/00-audit-fix-implementation.product-quality.json`. | `npm run pqc:validate -- ops\prompt-packets\2026-07-07-audit-fix-implementation\00-audit-fix-implementation.product-quality.json` passed. | None. |
| REQ-20260707-151 | Done | Audit classification table above. | Current audits classified into fixable, passing/already satisfied, parked/generated-noise, and blocked external/private-data groups. | External blockers remain. |
| REQ-20260707-152 | Done locally | `public/operations.html`; `public/provider.html`; `ops/ui-audits/2026-07-07-audit-fix-pass-local-final4/report.md`. | Final local role UI audit captured 35 screenshots across 7 routes and 5 viewports with 0 automated findings. | Deploy/live smoke still required before app-visible Done. |
| REQ-20260707-153 | Done locally | `public/provider.html`; `ops/ui-audits/2026-07-07-audit-fix-pass-local-final4/screenshots/provider-admin-mailbox-390-mobile.png`. | Provider admin route is `preview_only`, admin banner detector passes, and manual screenshot spot-check shows no username/password form. | Deploy/live smoke still required before app-visible Done. |
| REQ-20260707-154 | Done | `scripts/audit-onetime-role-ui-current-state.mjs`; `ops/ui-audits/2026-07-07-audit-fix-pass-local-final4/report.md`. | `--out-dir` wrote to the requested proof folder; `node --check scripts\audit-onetime-role-ui-current-state.mjs` passed. | None. |
| REQ-20260707-155 | Pending release | Local verification passed: PQC validation, syntax check, final local role UI audit, action watchdog, protocol-drift watchdog, tracked secret audit, active-run validation. | Commit, push, Railway deployment, and live smoke pending. | Not terminal until deployed/live-smoked. |
| REQ-20260707-156 | Blocked | Blocker table above. | WAPI, Drive/private-data, payments, DNS, external sends, provider writes, credentials, and generated artifact flood remain separated from this code batch. | Requires exact account-owner/private-data/action packets. |
