# Rabbi / One Time UI Release Deploy Gate - 2026-07-03

Raw input: `RAW-20260702-008`
Requirement: `REQ-20260702-805`, `REQ-20260702-823`
Decision/blocker: `DEC-20260702-801`
PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/87`
Branch: `codex/rabbi-onetime-ui-cleanup-release-20260703`

## Release Branch Gate

Command:
`npm run bna:release-gate -- --json --expected-branch codex/rabbi-onetime-ui-cleanup-release-20260703`

Result: passed.

- Branch matched expected release branch.
- HEAD `9f7119a9` was confirmed pushed to
  `origin/codex/rabbi-onetime-ui-cleanup-release-20260703`.
- Working tree was clean.
- Active execution run validation passed with no next unblocked executable
  batch.

## GitHub PR Readback

Command:
`gh pr view 87 --json number,state,isDraft,mergeable,mergeStateStatus,statusCheckRollup`

Result:

- State: `OPEN`
- Draft: `true`
- Mergeable: `MERGEABLE`
- Merge state: `CLEAN`
- GitHub checks: none reported

## Railway Target Readback

Default Railway doctor initially resolved the local checkout to the
`one-time-production` Railway project with no selected service. The guard
correctly refused to deploy the BNA domain from that target.

Read-only Railway project discovery then identified the BNA target:

- Project: `skillful-motivation`
- Environment: `production`
- Service: `skillful-motivation`
- Expected domain: `bneineviimacademy.org`

Command-scoped ID/name target values were passed to `npm run railway:doctor`.

Result: passed.

- Railway target guard passed with no blockers.
- `railway link` selected the `skillful-motivation` production service.
- Service status returned deployment `00a36c08-15ab-4f63-876c-f9897700dbbf`
  with status `SUCCESS`.
- No deploy upload was performed.

## Deploy Gate

Command:
`npm run bna:release-gate -- --deploy --confirm-deploy DEPLOY_BNA_PRODUCTION_CLOSEOUT --expected-branch codex/rabbi-onetime-ui-cleanup-release-20260703 --json`

Result: blocked. No production mutation, deploy, or live verification was
performed.

Deploy blockers:

- `BNA_PRODUCTION_DEPLOY_APPROVED=approved` is required before deploy closeout.
- OpenAI transcription/parser readiness is blocked by missing `OPENAI_API_KEY`.
- Vimeo member library readiness is blocked by missing `VIMEO_ACCESS_TOKEN`.
- Resend readiness is blocked by missing `RESEND_FROM`.
- Rabbi Stripe readiness is blocked by missing `RABBI_STRIPE_SECRET_KEY` and
  `RABBI_STRIPE_MODE`.
- Rabbi Telegram worker readiness is blocked by missing
  `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER` and unverified worker deployment
  state.
- Database, Railway, and Drive external readback gates are not ready.

## Next Action

To finish terminal app-visible Done:

1. Resolve/approve the deploy gate, including
   `BNA_PRODUCTION_DEPLOY_APPROVED=approved` and any required external
   readiness/readback approvals.
2. Deploy the BNA `skillful-motivation` production web service from the clean
   release branch or merged PR.
3. Run live verification against `https://bneineviimacademy.org`, including the
   One Time Library first-viewport contract.
4. Record the deployment ID, live smoke report, ledger entry, changelog entry,
   and register final status.
