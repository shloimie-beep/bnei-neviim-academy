# 2026-07-12 Final Launch Branch Audit

Status: active closeout / no blind merge
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Base branch: `master`
Final audit commit: `2784847df`
GitHub PR closeout: PR #130 closed as stale/unsafe after this audit; remote
branches were not deleted.

## Summary

The One Time Mishnah signup form bug was fixed, merged to `master`, deployed to
the One Time Railway service, and live-smoked with no-write Family/School form
proof. The scoped One Time CRM/portal correction release was also merged,
deployed, live-smoked, and recorded.

The remaining remote branch backlog was audited branch-by-branch. Several
branches contain work already present on current `master`; several contain old
launch/protocol artifacts that would overwrite current deployed evidence; and
one safe code slice from the post-agent-delta branch was harvested as the One
Time delivery outbox cron runner.

Do not merge PR #130 or the stale remote branches wholesale. Doing so would
risk reverting the deployed signup form fix, compression release, CRM portal
closeout evidence, and current run state.

## Work Merged Or Harvested

| Source branch / PR | Terminal status | Evidence |
| --- | --- | --- |
| `codex/onetime-signup-form-hotfix-20260712` | Merged to `master`; deployed and live-smoked. | Commits `692b20ed`, `48c52797`; One Time deployment `e26ebaa2-7d71-49a6-9abd-50f94e128ecf`; live Family/School browser intercept no-write proof. |
| One Time CRM portal correction release | Merged to `master`; deployed and live-smoked. | Merge commit `b61db37a`; deployed app SHA `22cc6b88`; Railway deployment `89c697ad-3f72-4d4f-96a2-46f0b2c2d740`; focused suite `76/76`; live smokes passed. |
| `codex/onetime-post-agent-delta-20260712-v3` | Safe code slice harvested only. Branch itself remains stale. | Commit `0d050e592` adds `scripts/run-one-time-delivery-outbox-cron.mjs`, `railway.one-time-delivery-cron.json`, package script, env example, and focused tests. |
| `codex/launch-consolidation-20260712` / PR #130 | Safe WAPI/Rabbi readiness correction harvested only. Draft PR #130 closed as stale/unsafe; remote branch retained. | Raw correction `RAW-20260712-011`; readiness script/test updates; Rabbi Telegram watchdog readback now reports ready without sending. |

## Blocked Or Superseded Branches

| Branch | Status | Reason |
| --- | --- | --- |
| `origin/codex/launch-consolidation-20260712` | Blocked / stale draft PR closed. | Topic diff is too broad (`633` files from merge-base) and includes old launch artifacts. Safe WAPI/Rabbi readiness changes were ported; the rest requires scoped revival packets. |
| `origin/codex/onetime-signup-location-hotfix-20260712` | Superseded / do not merge wholesale. | Contains older direct-signup edits and proof. Current `master` already has the deployed Family/School branch fix; wholesale merge would collide with current signup payload handling and release evidence. |
| `origin/codex/onetime-post-agent-delta-20260712`, `-v2`, `-v3` | Superseded after safe slice harvest. | V3 cron runner was ported to `master`; branch run-pointer/evidence changes are stale and would rewrite current closeout state. |
| `origin/codex/shipping-gate-20260706` | Blocked pending scoped revival. | Includes parent reminder send packet / One Time Studio sidekick scope and external-send-adjacent work. Must not be merged into launch without a fresh packet and proof. |
| `origin/codex/one-time-launch-cleanup-20260702-no-workflow` | Blocked / historical mega-branch. | Extremely broad platform branch (`1351` files from merge-base). Not a launch hotfix; needs decomposition, not merge. |
| `origin/release/operations-parent-student-action-registry-2026-06-11` | Historical / not launch candidate. | Old release root with large unrelated action-registry/portal changes. Needs separate revival audit. |
| `origin/main` | Historical root / no merge base. | Not a merge candidate for this `master` launch line. |

## Already Satisfied On Current Master

These branches are either patch-equivalent by `git cherry` or their unique
topic changes are already present on current `master` by direct file inspection
and tests. They should not be re-merged just because the remote branch is still
listed as not merged.

- `origin/codex/agent-review-dropoff-repair-20260626`
- `origin/codex/agent-review-public-helper-guardrail-20260626`
- `origin/codex/issue24-owner-correction-followup-20260626`
- `origin/codex/issue24-owner-followup-live-evidence-20260626`
- `origin/codex/content-topic-multibucket-20260630`
- `origin/codex/telegram-participation-parser-20260630`
- `origin/codex/one-time-clean-integration-20260702`
- `origin/codex/onetime-class-session-metadata-repair-20260702`
- `origin/codex/onetime-canonical-target-routing-20260705`
- `origin/codex/drive-dropoff-scheduler-repair-canonical-20260705`
- `origin/codex/operations-login-glitch-20260705`
- `origin/codex/operations-login-live-evidence-20260705`
- `origin/codex/deploy-gate-scoped-deferral-20260706`
- `origin/codex/deploy-gate-closeout-record-20260706`
- `origin/codex/onetime-p0p1-corrective-20260711`

## Remaining Revival Candidates

These branches may contain useful older work, but they are not safe to merge in
this launch pass without a dedicated audit, test matrix, and deploy gate:

- `origin/codex/rabbi-onetime-comms-scope-release-20260629`
- `origin/codex/onetime-resend-inbound-crm-release-20260629`

Current `master` already includes the core Resend inbound CRM primitives and
Operations visibility discovered during audit; any remaining deltas should be
handled as a separate communications/CRM revival task.

## Verification

- `node --test tests/one-time-external-setup-readiness.test.js tests/one-time-wapi-scope-contract.test.js` passed `12/12`.
- `npm run one-time:setup:check` is still blocked only by Stripe sandbox and campaign setup fields; WAPI provider details are ready by redacted readback.
- `node scripts/check-onetime-wapi-readiness.mjs --json` reports provider setup ready and auto-reply ready with no WhatsApp send, no CRM mutation, and no secret values printed. Telegram notification approval remains gated.
- `npm run telegram:rabbi:readiness` reports Rabbi Telegram runtime config ready with no Telegram send attempted.
- `npm run production:readiness:gate -- --json` still blocks launch because Stripe/campaign setup, Rabbi Telegram live-smoke proof, Agent Mode terminal proof, and clean-tree release gate remain required.
- `npm run secrets:audit` passed with `0` tracked secret-risk files.

## Next Action

Keep `master` as the release source. Close or archive stale remote branches only
after their owners accept this audit, or after a separate branch-deletion policy
is approved. Any revival work must start from current `master` and a scoped
requirement packet, not by merging the old branch wholesale.
