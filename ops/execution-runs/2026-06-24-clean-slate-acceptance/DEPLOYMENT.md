# Deployment

No manual deployment is planned for this acceptance branch unless runtime code
or live Operations behavior changes.

## Verified Current Live Deployment

- Railway project/service: `skillful-motivation`
- Deployment ID: `f8362b06-06b5-41f2-b4eb-102f67a91b85`
- Deployed SHA:
  `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772`
- Deployment status: SUCCESS
- Commit message: `Merge pull request #19 from shloimie-beep/codex/clean-slate-acceptance-20260624`
- Live health readback:
  `https://bneineviimacademy.org/api/health` returned HTTP 200 with
  `status=ok`, database connected, and Buffer social provider.

## Live Smoke Evidence

- `ops/live-smokes/2026-06-24T17-25-03-642Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-24T17-25-11-405Z-public-route-privacy-smoke.md`

## Deployment Decision

The acceptance changes are documentation, run metadata, evidence, and local
operator scripts. No manual Railway deployment command was run. The PR #19
merge triggered Railway automatically; deployment
`f8362b06-06b5-41f2-b4eb-102f67a91b85` reached SUCCESS and live doctor/smoke
checks passed.
