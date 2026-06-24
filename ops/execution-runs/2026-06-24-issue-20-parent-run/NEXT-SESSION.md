# Next Session

Resume from:
`C:\Users\User\Documents\Codex\2026-06-24\issue-20-parent-run`

Active run:
`ops/execution-runs/2026-06-24-issue-20-parent-run`

Current branch:
`codex/issue-20-parent-run-20260624`

Open requirement:

- `REQ-20260624-041` - Global visual quality system and watchdog.

Next safe step:

```powershell
npm run bna:run:next
```

Then recheck Git/GitHub/Railway/live baseline and write the parent coordination
manifest only if the branch has changed. Otherwise begin the visual-quality
audit from Batch A using the parent coordination rules in `COORDINATION.md` and
`LANE-MANIFEST.json`.

Do not run Tier 3 actions without explicit approval:

- production data mutation;
- class backfill apply;
- Drive write/move/upload;
- external sends or social posts;
- charges/refunds/access grants;
- DNS/account permission/credential changes.
