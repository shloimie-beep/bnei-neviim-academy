# Next Session

Start here if resuming this run.

1. Review `ops/execution-runs/2026-06-29-onetime-ui-shell-repair/requirements.json`, `TEST-RESULTS.md`, `EVIDENCE.md`, and `DEPLOYMENT.md`.
2. Confirm the intended release branch/worktree is still `C:\Users\User\BNA-rabbi-onetime-comms-release`.
3. Start from draft PR #51: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`.
4. Resolve the Railway deployment target. `npm run railway:doctor` is blocked until the exact production service name/id for `bneineviimacademy.org` is explicit, or PR #51 is released through the approved normal production path.
5. Run live Railway smoke/readback for the One Time Operations routes listed in the after evidence.
6. If live smoke passes, mark `REQ-20260629-202` through `REQ-20260629-210` Done and append final deployment proof to the ledger/changelog.

Do not broaden this run into contact spreadsheet import, email audience import, Resend DNS, Stripe/payment setup, WAPI data import, sends, external CRM/GHL, or secrets.
