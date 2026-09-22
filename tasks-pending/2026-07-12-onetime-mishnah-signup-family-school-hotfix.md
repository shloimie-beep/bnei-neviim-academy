# 2026-07-12 One Time Mishnah Signup Family/School Hotfix

- Raw source: raw-input/RAW-20260712-012-onetime-mishnah-signup-family-school-hotfix.md
- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- Branch: codex/onetime-signup-form-hotfix-20260712
- Status: deployed_live_smoked

## Requirements

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| REQ-20260712-701 | Direct signup chooser persists and submits Family or School branch | Done | `public/one-time/signup.html`; `tests/one-time-direct-signup-page.test.js`; focused browser test passes for Family and School; live production-JS intercept captured Family and School payloads without writing |
| REQ-20260712-702 | Continuation form honors saved branch from direct signup | Done | `public/one-time-preview.html`; `tests/one-time-onboarding-intake.test.js`; saved School branch opens School fields without URL override |
| REQ-20260712-703 | Hotfix is deployed and live-smoked before broader launch work resumes | Done | Railway deployment `e26ebaa2-7d71-49a6-9abd-50f94e128ecf` reached SUCCESS; deployed code commit `692b20ed06b832093a64a628a7a9731c1c5824ac`; live smokes passed |

## Acceptance Criteria

- `/one-time/signup` starts with no selected Family/School value.
- Clicking Family stores `Family` for existing backend/display compatibility and stores canonical branch `family` for continuation logic.
- Clicking School stores `School` for existing backend/display compatibility and stores canonical branch `school` for continuation logic.
- Both Family and School form paths submit to `/api/one-time/interest` with no student field required and with the selected branch in payload metadata/session storage.
- `/one-time-onboarding` defaults to the branch saved by direct signup when no `?audience=` override is present.
- `?audience=family` and `?audience=school` still explicitly override the saved branch.
- Verification uses local browser coverage and live no-write smoke/dry-run when available.

## Closeout Notes

- Do not mark done until the hotfix is committed, pushed, deployed, and live-smoked or an exact deploy blocker is recorded.

## Local Verification

- Reproduced pre-fix bug: saved `signup_as: School` opened `/one-time-onboarding` as Family and showed "Please enter your son's name and age or grade."
- Post-fix repro: saved `signup_as: School` opens `/one-time-onboarding` as School and shows "Please enter the school name and your role."
- `node --check src/lib/bna/one-time-signup-workflow.js; node --check server.js` passed.
- `node --test tests\one-time-direct-signup-page.test.js tests\one-time-onboarding-intake.test.js tests\one-time-signup-reminder-workflow.test.js` passed 17/17.
- `npm run test:onetime:focused` passed 73/73.
- `git diff --check` passed with line-ending warnings only.
- `npm run watchdog:actions` passed with finding_count 0.
- `npm run watchdog:protocol-drift` passed with 0 findings.
- `npm run bna:run:validate` was attempted and failed on an unrelated stale evidence path for `REQ-20260712-005`: `ops/live-smokes/2026-07-12T11-55-57-123Z-one-time-interest-crm-e2e-live-smoke.md` is not present on this branch.

## Deployment And Live Smoke

- Commit pushed: `692b20ed06b832093a64a628a7a9731c1c5824ac` on `codex/onetime-signup-form-hotfix-20260712`.
- Railway target guard passed for `https://join.onetimeonetime.com`, project `one-time-production`, service `one-time-web`.
- Initial generic deploy attempt was blocked before deploy because it targeted the BNA service; no BNA deploy occurred.
- One Time deploy used account auth with `BNA_DEPLOY_APP=one-time` and reached Railway deployment `e26ebaa2-7d71-49a6-9abd-50f94e128ecf` status `SUCCESS`.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 692b20ed06b832093a64a628a7a9731c1c5824ac` passed.
- `npm run app:smoke:one-time-interest-dry-run -- https://join.onetimeonetime.com` passed with no database write and report `ops/live-smokes/2026-07-12T18-53-45-457Z-one-time-interest-dry-run-live-smoke.md` (ignored local evidence path).
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` passed with report `ops/live-smokes/2026-07-12T18-53-45-611Z-rabbi-onetime-landing-smoke.md` (ignored local evidence path).
- Live production-JS browser intercept loaded `https://join.onetimeonetime.com/one-time/signup`, submitted Family and School with `/api/one-time/interest` intercepted locally, and captured two no-write payloads:
  - Family: `signup_as=Family`, `audience_type=family`, `family_school_classification=family`.
  - School: `signup_as=School`, `audience_type=school`, `family_school_classification=school`.
