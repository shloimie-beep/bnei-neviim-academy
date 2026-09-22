# Release And Rollback Walkthrough

Purpose: ship setup-center and integration work only when branch, evidence,
and validation are clear.

1. Confirm the branch is `codex/closeout-operator-walkthrough-20260624`.
2. Confirm this lane did not edit `server.js`, existing portal HTML, central
   run files, ledger, changelog, or memory.
3. Run focused setup-center tests.
4. Run `git diff --check`.
5. Run `npm run secrets:audit`.
6. Commit only lane-owned files.
7. Push the branch.
8. If a deployment is approved later, apply `SHARED-PATCH.diff` on an
   integration branch and rerun the focused tests.
9. Deploy only after owner approval.
10. Run Railway doctor and the relevant live smoke.
11. If live smoke fails, revert the shared patch or redeploy the previous
    accepted commit.
12. Keep integration cards open until their own provider-specific live
    acceptance criteria pass.

Local gates can stand in temporarily while GitHub workflow scope is missing,
but the release notes must say that independent GitHub Actions checks are not
attached yet.
