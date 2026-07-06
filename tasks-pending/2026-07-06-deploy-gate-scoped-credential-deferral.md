# Deploy Gate Scoped Credential Deferral

- Raw source: `RAW-20260706-901`
- Requirement: `REQ-20260706-901`
- Task: `TASK-20260706-901`
- Workspace/project: `bna_platform` / `release_workflow`
- Status: Local verified, pending publish/merge

## Requirement

The production closeout gate must allow an explicitly approved scoped deploy to proceed when unrelated provider credentials/readback are missing. Vimeo, Stripe, Rabbi Telegram, and broad external readback readiness should be recorded as deferred findings for that deploy, not hard blockers.

## Guardrails

- Still require the deploy confirmation phrase and `BNA_PRODUCTION_DEPLOY_APPROVED=approved`.
- Do not approve any send, charge, DNS write, access grant, credential change, provider-account mutation, production database mutation, or external write.
- Live verification and final closeout still require their normal readback/readiness evidence.
- Integration-specific work, such as payment checkout, Vimeo upload, or Rabbi Telegram runtime startup, still needs the relevant credential/readiness proof.

## Verification Plan

- `node --check scripts/bna-production-closeout-gate.mjs`
- `node --test tests/bna-production-closeout-gate.test.js`
- `npm run bna:release-gate -- --json --deploy --confirm-deploy DEPLOY_BNA_PRODUCTION_CLOSEOUT --defer-optional-integrations --defer-external-readback` with deploy approval in env, after the branch is pushed

## Evidence

- PASS `node --check scripts/bna-production-closeout-gate.mjs`
- PASS `node --test tests/bna-production-closeout-gate.test.js` - 13/13
- PASS `git diff --check`
