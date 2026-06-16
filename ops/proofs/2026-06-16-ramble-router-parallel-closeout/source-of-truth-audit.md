# MASTER-07 Source-of-Truth Audit

Cycle ID: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`

## Current Source Hierarchy Used

1. Current repo code, docs, and migrations in this dirty worktree.
2. Current live/deployed proof already recorded in `SYSTEM-STATE.md`, `TASKS.md`, ledger, changelog, and smoke reports.
3. `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `SYSTEM-STATE.md`, and `memory/2026-06-16.md`.
4. `ops/agent-task-ledger.jsonl` and `ops/agent-changelog.md`.
5. Newest `tasks-pending/*.md`.
6. The MASTER-07 attached spec.
7. Older docs and archived files only as historical context.

## Findings

| Area | Current finding | MASTER-07 handling |
|---|---|---|
| README | The attached spec said `README.md` was legacy Family Accountability/Next.js text. Current `README.md` already describes BNA v2.0 as an Express/Postgres/Railway app with `server.js` as entrypoint. | Do not rewrite README. Record the spec conflict as already corrected in this worktree. |
| One Time/Rabbi | Core One Time workspace, scoped tasking, member/classroom/community foundations, and WS11 proof have been implemented and live-smoked in prior records. Product/pricing/account/asset decisions are still blocked. | Mark implemented pieces as proof-backed; keep product/account/legal/7pm launch choices in blocked handoffs. |
| Community/learning | WS11 course/community/gamification/parent-progress foundation is deployed and live-smoked. | Mark `COMMUNITY-06` completed/deployed/verified and link proof. |
| Helper | WS05 local helper tool registry and drawer are implemented with local proof. Final deployment/live helper smoke remains unresolved in its handoff. | Mark `HELPER-03` blocked on human deploy/release decision, not missing implementation. |
| Integrations | Buffer/Resend safe paths exist locally/partially, but live activation still depends on credentials, DNS, channel/account details, and approval gates. Zoom/Vimeo/Stripe require account/provider decisions. | Mark `INT-05` blocked on credentials and external/account decisions; keep dry-run/readiness-only policy. |
| Operations queue/workflows | Queue audit and pending/access dedupe work exist, but duplicate cleanup/live readback needs database access/reconciliation decisions. Communications/Funnel/calendar/Rabbi 7pm proof needs a focused workstream. | Mark `OPS-02` requeued for follow-up instead of silently closing. |
| Student identity | Existing sources conflict on `Eitan Chaim Golombo` vs `Eitan Chaim Golambo`; Menachem duplicate evidence is not complete in this master pass. | No student merge/rename/dedupe performed. Record as evidence-required blocker. |
| SDDraftler | Workspace category evidence is still missing. | No category change performed. Keep evidence-required blocker. |
| PWA routing | Current source-of-truth says public, parent, and Operations PWA identities must stay separate. Prior standalone Operations redirect behavior must not be reversed by UI work. | Recorded in conflict map and UI handoff guardrails. |

## Items Intentionally Not Changed

- No public pricing or payment ownership decisions.
- No legal/accounting ownership decisions.
- No live external sends, publishes, account grants, or connector writes.
- No secret values copied or exposed.
- No student duplicate/name merge without live evidence and current approval.
- No real device-control lock/unlock integration.
- No video-hosting decision finalized without verified provider capability and approval.
