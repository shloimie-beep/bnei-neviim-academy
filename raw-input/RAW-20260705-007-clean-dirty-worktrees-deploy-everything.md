# RAW-20260705-007 - Clean Dirty Worktrees And Deploy Everything

## Metadata

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-007 |
| Source channel | codex_chat |
| Captured at | 2026-07-05T15:31:01+03:00 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-05-clean-dirty-worktrees-deploy-everything.md |
| Privacy classification | operator_goal_mode_request_no_secrets_no_private_rows |
| Workspace/project | bna_platform / release_closeout |

## Raw intake

> Look, there's a lot of, you know, stuff that's not getting deployed because of the dirty work trees. Can you please clean everything up and just deploy everything? And don't stop till you're done. There's tons of stuff that needs to just get pushed live.

## Parsed intent

Shloimie is authorizing goal-mode release cleanup: inspect dirty worktrees,
separate deployable scoped work from unsafe or blocked work, preserve real work
in commits/PRs, push safe changes, deploy app/server-visible releases, run live
smokes, and record exact blockers for anything that cannot safely ship.

Guardrails still apply: do not commit secrets, raw private transcript/contact
bodies, unrelated unfinished work, credential mutations, DNS changes, live
payment/access actions, external provider writes, broad Telegram/WhatsApp/email
sends, or production data mutations unless a scoped requirement and approval
explicitly allow it.
