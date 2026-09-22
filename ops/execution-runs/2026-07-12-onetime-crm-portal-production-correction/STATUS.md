# Status

Final production closeout as of 2026-07-12T22:38:00+03:00:

- Final deployed `master` SHA: `22cc6b88b0045f9052a403582ec8249e369196a0`.
- One Time Railway deployment `89c697ad-3f72-4d4f-96a2-46f0b2c2d740` reached `SUCCESS` for `one-time-production / production / one-time-web`.
- `https://join.onetimeonetime.com/api/deploy-info` and `https://bneineviimacademy.org/api/deploy-info` both returned the final SHA.
- Live One Time smokes passed: separate instance exact-SHA smoke, interest dry-run, Rabbi landing/WhatsApp readiness, Operations CRM workbench, portal route scope, signed view-as Rabbi negative scope/write checks, and Family/School signup browser intercept with no live lead write.
- Live BNA no-write route smoke passed, including `/operations` returning the expected logged-out 401.
- Production compression readback passed on One Time and BNA routes with `content-encoding: br` and `Vary: Accept-Encoding`.
- All requirements in this run are terminal `done`; older blocked/release-candidate notes below are retained as history only.

As of release-lane closeout on 2026-07-12T21:14:00+03:00:

- Clean release branch `codex/onetime-crm-portal-release-20260712` was created from current `origin/master`.
- Scoped One Time correction work was reapplied, validated, committed, and pushed as implementation commit `833cac222`.
- Draft PR `#131` is open and mergeable/clean: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/131`.
- GitHub currently reports no status checks on the PR branch.
- Local release-gate dry-run reports ready on the release branch.
- No production deployment, production mutation, or live verification was performed.

- `REQ-20260712-101`: done. PQC validation and execution-run validation passed.
- `REQ-20260712-102`: done. Original source PNGs remain missing, but authenticated/current-state regeneration produced 35 screenshots, broader Rabbi/One Time audit produced 80 screenshots, parallel frontend audit produced 45 checks and 140 screenshots/crops, and the live public/review performance baseline passed with 0 samples needing attention.
- `REQ-20260712-103`: done locally. Production release/live-smoke is centralized in `REQ-20260712-112`.
- `REQ-20260712-104`: done locally. CRM isolation/source-label tests and redacted local scope report are complete; production release/live-smoke is centralized in `REQ-20260712-112`.
- `REQ-20260712-105`: done locally. CRM list pagination/cursor metadata/source fetch caps and 10,000-row fixture are complete; production DB EXPLAIN/live-smoke is centralized in `REQ-20260712-112`.
- `REQ-20260712-106`: done locally. CRM list/detail loading now uses scoped panel refresh, abortable list/timeline requests, debounced search, query cache, 50-card render cap, split-shell parity, and lazy legacy review table construction. Production release/live-smoke is centralized in `REQ-20260712-112`; shell byte-budget debt is tracked under `REQ-20260712-111`.
- `REQ-20260712-107`: done locally. One Time CRM now has three-pane list/activity/profile UI, mobile selected-contact Back flow, disabled/no-send reply/note/task controls, scoped One Time Inbox selected-contact context, action registry rows, and split-shell/monolith screenshot smoke proof. Production release/live-smoke is centralized in `REQ-20260712-112`; shell byte-budget debt is tracked under `REQ-20260712-111`.
- `REQ-20260712-108`: done locally. Family, Student, Classroom, Library, and parent setup/reset surfaces now share the One Time portal shell, Family Portal/account setup labels, TEST preview banner, review-link preservation, accessible mobile menu button, and no-write preview boundaries. Local screenshots cover 1440, 1024, 768, 430, and 390 px with no console errors, HTTP errors, or POST/write requests. Production release/live-smoke is centralized in `REQ-20260712-112`; bundle/performance debt remains under `REQ-20260712-111`.
- `REQ-20260712-109`: done locally. The public One Time landing page now uses one accessible fixed WhatsApp launcher backed by the same-origin runtime redirect, and no longer loads the public helper scripts, Robot Scheller helper chrome, or hard-coded `wa.me` links. Local screenshots cover 1440, 1024, 768, 430, and 390 px with no HTTP errors, helper-script requests, POSTs, or writes. Production public-number readback/release/live-smoke is centralized in `REQ-20260712-112`.
- `REQ-20260712-110`: done locally. WhatsApp assistant deterministic natural replies and WAPI safety gates pass local tests; production WAPI readback/no-unapproved-send proof is centralized in `REQ-20260712-112`.
- `REQ-20260712-111`: done locally. Operations split delivery is under the 1.2 MB shell budget, CRM first-page/list/detail metrics pass locally, local cache policy passes, and member-library Vimeo loads only after Play Video. Production Brotli/gzip, `Vary`, long-cache/fingerprint readback, commit/push/deploy, and live smoke remain under `REQ-20260712-112`.
- `REQ-20260712-112`: blocked / needs operator release decision. The stale `master` / dirty worktree blocker has been superseded by the clean pushed release branch and mergeable/clean draft PR `#131`. Production deploy/live verification still needs PR review/release approval, explicit release-gate confirmation, and either completion or approved deferral of external Railway/Drive readbacks.

Next expected step after this local batch:

```bash
npm run bna:run:validate
npm run bna:release-gate -- --expected-branch codex/onetime-crm-portal-release-20260712
```

There is no next unblocked implementation requirement in this run. To resume, review/merge PR `#131` or otherwise confirm the production release path, run the approved deploy/live-verify gate commands, verify exact SHA readback on the BNA Operations/portal service and One Time public service, then run the required live smokes before closing `REQ-20260712-112`.
