# Next Session

Resume from:
`C:\Users\User\Documents\Codex\2026-06-24\issue-20-parent-run`

Active run:
`ops/execution-runs/2026-06-24-issue-20-parent-run`

Current branch:
`codex/issue-20-parent-run-20260624`

Open requirement:

- `REQ-20260624-047` - Owner setup and walkthrough.

Next safe step:

```powershell
npm run bna:run:next
```

Then recheck Git/GitHub/Railway/live baseline only if the branch or live
target has changed. Otherwise begin Batch G using the parent coordination
rules in `COORDINATION.md` and `LANE-MANIFEST.json`.

Batches A, C, D, and F are locally verified and blocked from Done only by
deploy/live proof under `REQ-20260624-048`. Batches B and E are Done. If
`npm run bna:run:next` selects `REQ-20260624-047`, create the owner
setup/walkthrough artifact and page without claiming unsupported deploy/live
state.

Do not run Tier 3 actions without explicit approval:

- production data mutation;
- class backfill apply;
- Drive write/move/upload;
- external sends or social posts;
- charges/refunds/access grants;
- DNS/account permission/credential changes.
