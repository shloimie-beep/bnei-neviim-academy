# Final Release Supersession Matrix

| Field | Value |
|---|---|
| Raw source | `RAW-20260624-005` |
| Requirement | `REQ-20260624-022` |
| Final branch | `codex/clean-slate-integration-20260624` |
| Current final branch head | `7e7cae25` |
| Draft final PR | `https://github.com/shloimie-beep/bnei-neviim-academy/pull/16` |
| Deployment/live smoke | Not run yet |

## Source History Disposition

| Source | Ref / PR | Head | Disposition |
|---|---|---|---|
| Default branch baseline | `origin/master` | `a9528b2d` | Contained in final branch; `REQ-20260624-020` found no new master commits to merge. |
| Owner-review integration | PR #14 / `origin/codex/integration-navigation-owner-review-20260624` | `f9625e8c` | Already merged into clean-slate branch before final release lane integration; final PR #16 supersedes separate PR #14 merge. |
| Rabbi Scheller parity | PR #15 / `origin/codex/rabbi-scheller-parity-20260624` | `1ab57eac` | Already merged into clean-slate branch before final release lane integration; final PR #16 supersedes separate PR #15 merge. Railway evidence only proves deployment of earlier commit `8f8b0b45`, so live proof remains a later release requirement. |
| Preserved local Rabbi closeout | `origin/codex/preserve-rabbi-closeout-20260624` | `487a660b` | Already merged into clean-slate branch before lane integration; preserved local Rabbi/One Time review work remains part of final PR #16. |
| Public UI lane | `origin/codex/closeout-public-ui-20260624` | `c9ba17da` | Merged into final branch at `d71fa58a`. |
| Portal auth/nav lane | `origin/codex/closeout-portal-auth-nav-20260624` | `e2aa72e5` | Merged into final branch at `b412ee17`. |
| Class/Drive intake lane | `origin/codex/closeout-class-drive-intake-20260624` | `b4958dc0` | Merged into final branch at `b604e967`; backfill apply remains blocked by unsafe recommendation. |
| Assistant/ramble/usage lane | `origin/codex/closeout-assistant-ramble-usage-20260624` | `adf4e6d8` | Merged into final branch at `4547a696`; hosted/live proof remains external-credential gated. |
| Stripe sandbox lane | `origin/codex/closeout-stripe-sandbox-20260624` | `6c161c50` | Merged into final branch at `9377862b`; live billing remains blocked. |
| Vimeo media lane | `origin/codex/closeout-vimeo-media-20260624` | `f6975ab8` | Merged into final branch at `f721d435`; private synthetic real upload remains unconfigured and not run. |
| Operator walkthrough lane | `origin/codex/closeout-operator-walkthrough-20260624` | `768a2ae0` | Merged into final branch at `7e7cae25`; live setup walkthrough remains deploy-gated. |

## PR Policy Note

The final release branch/PR is the integration vehicle for all included work.
PR #14 and PR #15 should not be merged separately after this branch is reviewed;
they are superseded by PR #16 unless the release manager deliberately abandons
this final branch.

## Remaining Non-Superseded Work

- `REQ-20260624-023`: shared route/UI/server authorization wiring from reviewed
  patches.
- `REQ-20260624-024`: migration/database readiness review.
- `REQ-20260624-025`: exact release SHA gate.
- `REQ-20260624-026` through `REQ-20260624-031`: merge, deploy/live smoke,
  external readiness, canonical records, and cleanup.
- `REQ-20260624-028`: class backfill remains blocked under current evidence:
  `safe_to_apply=false`, zero approved candidate jobs, and no row-level write
  plan.

