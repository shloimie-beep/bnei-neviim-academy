# Workspace / Community / Provider / Bot No-GHL Release Gate - 2026-06-14

Overall: BLOCKED BEFORE DEPLOY

## Summary

The local product buildout and cleanup checks are green, but deployment is held
because the OpenAI key loaded by the repo and Railway is rejected by OpenAI with
`401 invalid_api_key`.

## Git Safety

- Safety branch pushed earlier in this run:
  `safety/pre-next-superprompt-20260614-072250`
- Safety commit: `30bddbd chore: preserve no-ghl cleanup work before workspace buildout`
- Current checkout while recording this gate:
  `cleanup/workspace-task-dialogue-rabbi-scheller`
- Accidental local Operations lane diffs were preserved in
  `.runtime/operations-html-accidental-lane-edits.patch` and then discarded from
  the working file.

## No-GHL Scan

- Active runtime scan for GoHighLevel/LeadConnector/LeadConnectorHQ tokens is
  clean outside intentional guard-test assertions.
- Active source-of-truth docs now state the no-GHL policy.
- Every file under `docs/archive/legacy-ghl/` includes the required
  `Legacy retired GHL archive` warning banner.
- Remaining direct historical mentions are in old status/task handoff history
  and should not be revived as implementation guidance. Runtime and current
  handoff policy treat these as superseded.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/openai-key-diagnostics.mjs`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `npm test` 309/309
- PASS focused Operations regressions:
  `node --test tests/one-time-external-user-portal.test.js tests/operations-saas-crm-redesign.test.js tests/operations-task-comments-and-dictation.test.js`
- PASS `npm run railway:doctor`
  - service: `skillful-motivation`
  - environment: `production`
  - latest deployment: `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d`
- PASS `npm run app:smoke`
  - report: `ops/live-smokes/2026-06-14T05-39-22-374Z-live-app-smoke.md`
- PASS `npm run screenshot`
  - local server used throwaway local-only Operations credentials
  - mobile/tablet/desktop horizontal scroll all reported `false`

## OpenAI Result

- FAIL `npm run openai:diagnose`
  - report: `ops/qa-runs/2026-06-14T05-38-48-982Z-openai-diagnostics.md`
  - selected source: `.secrets/openai-api-key.txt`
  - local/Railway fingerprint: `02079c0b5ca1`
  - `.env.local` fingerprint differs and is not the selected source
  - local secret contains BOM/newline that normalization strips safely
  - `/v1/models`: `401 invalid_api_key`
  - request id: `b56d1e96-62f7-4e87-a339-14e54409c8fb`
- FAIL `npm run openai:smoke`
  - report: `ops/openai-smokes/2026-06-14T05-39-06-579Z-openai-sidekick-smoke.md`
  - failure: OpenAI `401 invalid_api_key`

## Deploy Decision

No deploy was run. The operator explicitly required OpenAI smoke to pass unless
a real blocker is proven. This run proves the blocker: the selected key is
loaded locally, the same fingerprint is present in Railway, and OpenAI rejects
it. A valid/re-enabled key for the correct project/org is required before the
release can proceed, unless the operator explicitly approves deploying with the
known OpenAI blocker.
