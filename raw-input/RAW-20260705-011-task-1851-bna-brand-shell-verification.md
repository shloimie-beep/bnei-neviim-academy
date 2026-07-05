# RAW-20260705-011 - Task 1851 BNA Brand Shell Verification

## Metadata

- Source channel: agent_fleet
- Source task ID: 1851
- Source task title: Apply app-wide BNA brand shell and million-dollar SaaS UI polish
- Captured at: 2026-07-05T20:57:42+03:00
- Parse status: registered
- Requirement register: `tasks-pending/2026-07-05-task-1851-bna-brand-shell-verification.md`
- Product-quality packet: `ops/prompt-packets/2026-07-05-task-1851-bna-brand-shell-verification/01-bna-brand-shell-verifier.product-quality.json`

## Raw Assignment

Codex was assigned live task 1851:

> Apply app-wide BNA brand shell and million-dollar SaaS UI polish.

Task notes:

> Backfilled from Telegram messages 1003, 1011, and 1111 on 2026-06-10.
> The earlier #372 side-menu/dropdown task did not fully cover the operator
> request. Implement a crisp light BNA brand shell across Operations,
> parent/student/provider/external pages: static branded toolbar,
> blue/yellow/light-orange palette, mobile-first side/sandwich section menus,
> top filters, in-app dropdowns instead of native mobile select sheets where
> supported, and no loss of existing button behavior. Verify desktop and mobile
> UI screenshots plus live smoke before marking done.

Related existing evidence found during pickup:

- `TASKS.md` already records the historical live task #402 as done/verified for
  the app-wide brand shell.
- `ops/agent-changelog.md` has the 2026-06-10 task #402 closeout and the
  2026-07-02 reconciler backfill that created task #1851.
- `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/`
  contains the older desktop/mobile screenshot evidence.

## Guardrails

- No production data mutation.
- No external sends, charges, DNS changes, credential changes, Drive writes,
  access grants, provider-account mutations, or public publishing.
- Do not deploy from this worker. Parent release gate owns Tier 2 actions.
- Do not overwrite unrelated dirty agent-fleet/dropoff files in the worktree.
