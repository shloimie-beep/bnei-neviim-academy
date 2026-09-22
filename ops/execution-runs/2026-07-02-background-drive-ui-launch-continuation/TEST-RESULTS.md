# Test Results

Focused checks already run:

- PASS `npm run agent:fleet:status`
- PASS `npm run agent:fleet:readiness` with overall readiness false
- PASS `npm run agent:browser:health`
- TIMEOUT `npm run agent:fleet:once` after safe single-task attempt
- PASS `npm run drive:trace-newest-recording` with PARTIAL parser blocker
- PASS `npm run content:drive-intake-audit` with existing PARTIAL blockers
- PASS `npm run app:smoke:class-upload-trace`
- PASS `node --check scripts/seed-one-time-ui-review-data.mjs`
- PASS `node --check scripts/cleanup-one-time-ui-review-data.mjs`
- PASS `node --test tests/one-time-ui-review-data-seed.test.js`
- PASS `npm run one-time:seed:ui-review`
- PASS `npm run one-time:cleanup:ui-review`
- PASS `npm run one-time:railway-provision:check -- --write-report`
- PASS guarded `npm run one-time:railway-provision:apply -- --apply --confirm PROVISION_ONE_TIME_INSTANCE --skip-secrets --skip-deploy --skip-domain --write-report --json`
- PASS `railway domain join.onetimeonetime.com --service one-time-web --json`
- PASS `npm run one-time:railway-target:guard`
- EXPECTED FAIL `npm run one-time:setup:check -- --write-report` because 6/8 external setup areas still require human/provider input
- PASS `npm run one-time:smoke:resend-vimeo-stripe`
- PASS `npm run stripe:sandbox-smoke` with live-key blocker and no API calls
- PASS `node --test tests/one-time-task-view-model.test.js tests/one-time-external-setup-readiness.test.js tests/one-time-ui-review-data-seed.test.js`
- PASS `node --check server.js`
- PASS `node --check scripts/check-onetime-external-setup-readiness.mjs`
- PASS `node --test tests/rabbi-checkout-access.test.js tests/one-time-external-user-portal.test.js tests/one-time-community-moderation-workflow.test.js`
- PASS `npm run pqc:all`
- PASS `npm run bna:run:status`
- PASS `npm run bna:run:validate`
- PASS `npm run bna:run:source-coverage`
- PASS `npm run bna:run:stale-evidence`
- PASS `npm run secrets:audit`
- PASS `git diff --check` after trimming the generated Drive audit note; remaining output is line-ending warnings only
- PASS edited JSON/JSONL parse validation
- PASS `git push -u origin codex/one-time-ui-recording-clean-integration-20260702`
- PASS `gh pr create --draft`: PR #64
