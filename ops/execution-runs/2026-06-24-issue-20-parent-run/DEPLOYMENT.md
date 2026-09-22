# Deployment

Status: deployed and live-verified.

## Release Order

- PR #21 was reviewed, marked ready, and merged first.
- PR #21 remains read-only Issue #18 evidence with verdict
  `NOT SAFE TO APPLY`; no class backfill is authorized or applied.
- Issue #20 PR #22 then merged to `master`.

## Railway Target

- Project: `skillful-motivation`
- Project ID: `bd5b6d78-5e83-4e83-89b2-cd5f52ed7889`
- Environment: `production`
- Environment ID: `3ce30933-49c7-4b90-8c36-a5afd67df329`
- Service: `skillful-motivation`
- Service ID: `4079db35-5f4a-44ef-a767-3406c74f6005`
- Custom domain: `bneineviimacademy.org`
- Connected GitHub repo/branch:
  `shloimie-beep/bnei-neviim-academy` / `master`

## Deployment Proof

- Issue #20 PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/22`
- Merged master SHA: `378cc562a7dd4ffc8f2cc81a7341502df42d0295`
- Railway deployment ID: `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa`
- Deployed SHA: `378cc562a7dd4ffc8f2cc81a7341502df42d0295`
- Deployment path: verified GitHub `master` auto-deploy to the canonical BNA
  Railway service.

## Live Verification

- `npm run railway:doctor` passed against the canonical BNA target and selected
  deployment `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa`.
- `npm run app:smoke` passed and wrote
  `ops/live-smokes/2026-06-25T04-22-25-680Z-live-app-smoke.md`.
- `npm run app:smoke:public-privacy` passed and wrote
  `ops/live-smokes/2026-06-25T04-22-36-357Z-public-route-privacy-smoke.md`.
- Issue #20 live verifier passed for public viewports, role routes,
  authenticated Operations queue/UI readback, helper button, Owner Setup
  Center, and agent-fleet status; report:
  `ops/live-smokes/2026-06-25T04-33-00-045Z-issue20-live-verification/issue20-live-verification.md`.
- `npm run owner-review:visual` passed for release-local and production public.
- `npm run watchdog:helper-destinations` passed 10/10 cases after deployment.
- `npm run agent:browser:health -- --json` and
  `npm run agent:browser:smoke -- --all --json` passed after deployment.
- `npm run agent:fleet:readiness -- --json` passed with parent coordination
  `ok=true`, 0 findings, and `external_write_performed=false`.

## Resolved Blocker

The original release blocker was a stale local Railway target pointing at
`one-time-production` with no selected BNA service. The canonical BNA target is
now verified, deployment scripts fail closed, and the release used the existing
GitHub auto-deploy path rather than deploying BNA to the stale One Time target.

## Guardrails

No class backfill was applied. No send, charge, DNS change, credential/account
change, Drive write, Buffer publish, public publishing, or secret exposure was
performed for this release.
