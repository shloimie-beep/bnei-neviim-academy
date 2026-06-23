# GitHub Branch Protection

Recommended protection for BNA production branches:

- Require the `BNA Quality Gate` workflow before merge.
- Require pull request review for changes touching `server.js`, migrations,
  portal auth, helper tools, parser/intake, payment/accounting, or Operations.
- Require branches to be up to date before merge when practical.
- Do not allow workflows to deploy, send messages, publish posts, charge cards,
  change DNS, upload video, or copy credentials from quality-gate jobs.
- Keep live deploy and Railway doctor as an explicit post-merge/operator step
  unless a separate protected deploy workflow is deliberately created.

The quality gate runs syntax checks, unit tests, route/action/security/raw
intake/content/communications watchdogs, and the general goal audit.
