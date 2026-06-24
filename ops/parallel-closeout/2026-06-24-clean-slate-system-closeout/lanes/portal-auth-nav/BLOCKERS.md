# portal-auth-nav Blockers

## Final-Integrator Reserved

- `npm run bna:run:validate`, `npm run bna:run:status`, and
  `npm run bna:run:next` fail on this lane branch because the branch was
  created from `CONTROL.json` `integration_app_base_sha`
  `161f8623c50d7ef226066d101bfa58c28aff2346`, before the final
  control-run pointer commit. The commands report stale metadata for
  `codex/issue-8-complete-system-reconciliation`.
- Owner: final integrator.
- Recommended next action: rerun the execution-run CLI from
  `codex/clean-slate-integration-20260624` or the integrated release branch
  after lane branches are merged.
- Consequence: this does not block this lane merge, but it must be handled
  before release closeout.

## External / Live

- Full authenticated live graph walk is not performed in this lane.
- Owner: Shloimie / final integrator.
- Missing information: approved demo identities or configured read-only live
  target for Operations, provider, parent, student, and One Time member
  journeys.
- Recommended next action: after final integration and explicit release
  approval, run authenticated live smoke using approved demo identities.
- Consequence: local fixture evidence is complete, but live auth claims remain
  pending release-stage verification.

## Non-Blockers

- No deployment was requested or performed.
- No production database mutation, credential change, billing action, media
  upload, email/Telegram/WhatsApp send, DNS change, or external write was
  performed.
