# OPS-02 Blockers

- Exact custom calendar visibility and Rabbi 7pm class behavior need confirmation/proof.
- Queue stale/duplicate/done-missing-report cleanup still needs reconciliation decisions and safe database access.
- Generic lead routing must be verified in the current Operations UI before marking complete.
- Full `npm test` currently fails four Operations shell/contract assertions in
  the dirty worktree. MASTER-07 did not edit `server.js` or
  `public/operations.html`; resolve this in the OPS/UI follow-up before using
  the full suite as green proof.
