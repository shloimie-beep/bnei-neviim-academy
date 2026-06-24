# Evidence

## Release Truth Evidence

| Item | Evidence |
|---|---|
| Local branch/HEAD at start | `codex/clean-slate-acceptance-20260624` at `116fea3339a922b045857f7ece8cc9a64e7cda64` |
| origin/master at start | `116fea3339a922b045857f7ece8cc9a64e7cda64` |
| PR #16 | MERGED, merge commit `c14507ab121daa221689ba285c203605bf2d64bf`, URL `https://github.com/shloimie-beep/bnei-neviim-academy/pull/16` |
| Current Railway deployment | `c0aafbc5-a6fa-42ca-828e-38ac8ee02cc7`, status SUCCESS |
| Current deployed SHA | `116fea3339a922b045857f7ece8cc9a64e7cda64` |
| Live health readback | `https://bneineviimacademy.org/api/health` returned HTTP 200 with `status=ok`, database connected, Buffer provider |
| Live app smoke | `ops/live-smokes/2026-06-24T17-25-03-642Z-live-app-smoke.md` |
| Public privacy smoke | `ops/live-smokes/2026-06-24T17-25-11-405Z-public-route-privacy-smoke.md` |
| Secret audit | `npm run secrets:audit` passed, tracked secret findings 0 |
| GitHub issue #18 | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18`, open and mapped to `REQ-20260624-028` |

## Queue Evidence

| Item | Evidence |
|---|---|
| Census query fix | `scripts/task-decision-census.mjs` now uses `w.workspace_key` instead of non-existent `w.key`. |
| Live census after safe cleanup | `ops/task-decision-census/2026-06-24T17-34-13-314Z-task-decision-census.md` |
| Queue audit | `ops/queue-audits/2026-06-24T17-35-00-836Z-queue-audit.md` |
| Task reconciler | `ops/system-audits/2026-06-24T17-35-53-601Z-task-queue-reconciler.md` |
| Safe reversible production cleanup | `ops/one-time-mishnah/task-decision-production-cleanup.md` |
| Owner-gated remaining cleanup | Same cleanup report plus `DEC-20260624-008`; broader cleanup was not applied. |

## Synthetic Ramble Evidence

- Script:
  `scripts/clean-slate-synthetic-ramble-proof.mjs`
- Report:
  `ops/acceptance/2026-06-24-clean-slate/synthetic-ramble-acceptance.md`
- JSON evidence:
  `ops/acceptance/2026-06-24-clean-slate/synthetic-ramble-acceptance.json`

Acceptance flags all passed, production writes were disabled, duplicate repeat
apply was idempotent, and synthetic records did not create production queue
pollution.

## Owner And Preservation Evidence

- Owner walkthrough:
  `ops/acceptance/2026-06-24-clean-slate/owner-walkthrough.md`
- Worktree preservation manifest:
  `ops/acceptance/2026-06-24-clean-slate/worktree-preservation-manifest.md`
- Final handoff:
  `ops/acceptance/2026-06-24-clean-slate/final-handoff.md`
