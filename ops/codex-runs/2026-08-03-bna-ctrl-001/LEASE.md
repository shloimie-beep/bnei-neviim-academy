# BNA-CTRL-001 recovery lease

- Branch: `codex/bna-ctrl-001-20260803`
- Base: `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c` (`origin/master`)
- Owner: Codex task `BNA-CTRL-001`
- Owned runtime paths: academy Telegram bridge/startup/progress-notifier code; canonical BNA task, decision, ticket, agent-job, and control APIs; the live Operations task surface; focused tests and runtime/readiness helpers.
- Owned record paths: this run folder, the BNA-CTRL raw intake/register, scoped action/route registry rows, agent ledger, and changelog entries.
- Excluded: standalone One Time source/database/cookies/server code; Rabbi bot identity, token, worker, or provider data; payments, DNS, account/access grants, bulk/customer messaging; stale local worktrees; unrelated active execution-run files.
- Deploy owner: this Codex task, through the existing BNA release path, only after Railway project/environment/service and exact token consumer ownership are proven.
- Stop conditions: bot/chat identity mismatch; another live consumer for the same token; remote-base or owned-path drift; missing redaction; secret/private-body exposure; failed focused/release gates; unbounded sends or production writes; inability to prove rollback and exact deploy target.
- External-effect bounds before canary: read-only provider/runtime diagnostics only; zero messages, deploys, credential changes, or production data mutations.
