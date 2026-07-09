# Evidence

- Raw intake: `raw-input/RAW-20260702-006-background-drive-ui-launch-continuation.md`
- Register: `tasks-pending/2026-07-02-background-drive-ui-launch-continuation.md`
- Branch: `codex/one-time-ui-recording-clean-integration-20260702`
- Background agent readback:
  `ops/agent-fleet-readbacks/2026-07-02-background-agent-readback.md`
- Drive trace readback:
  `ops/drive-traces/2026-07-02-newest-ui-correction-recording-trace.md`
- Job 101 parser/private transcript-doc apply closeout:
  `ops/drive-transcript-visibility/2026-07-02/APPLY-CLOSEOUT.md`
- Job 101 review triage and canonical UI follow-up reduction:
  `ops/drive-transcript-visibility/2026-07-02/JOB-101-REVIEW-TRIAGE.md`
- UI correction packets:
  `ops/prompt-packets/2026-07-02-ui-correction-recording/`
- TEST/mock data dry-run:
  `ops/one-time-mishnah/mock-data/2026-07-02-ui-review-seed-readback.md`
- Cleanup dry-run:
  `ops/one-time-mishnah/mock-data/2026-07-02-ui-review-cleanup-readback.md`
- Railway provisioning report:
  `ops/one-time-mishnah/onetime-railway-provisioning-report.json`
- Setup checker report:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
- Current read-only setup/blocker readback:
  `ops/one-time-mishnah/launch-unblocker/2026-07-07-readiness-readback.md`
- Current Railway auth diagnostic readback:
  `ops/one-time-mishnah/launch-unblocker/2026-07-07-railway-auth-diagnostic-readback.md`
- 2026-07-09 target-context correction:
  `npm run one-time:railway-target:guard` passed with `one-time-web` /
  `production`, 52 Railway variables, usable `DATABASE_URL`, and matching
  OneTime domain/workspace/project. Current
  `npm run one-time:setup:check -- --write-report` still exits 1 as expected,
  but now reports ready 5/8: Railway target, DB, join domain, hosted
  Zoom/class link, and Vimeo/Drive are ready. Full launch is blocked only by
  Stripe sandbox/price alias, Whapi/WAPI instance/phone plus auto-reply
  approval flags if auto-reply is intended, and campaign approvals.
- 2026-07-09 WAPI readiness:
  `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md` confirms the
  class link is configured and blocks only Whapi/WAPI instance ID, sender phone
  metadata, auto-reply enable flag, and explicit approval flag. No WhatsApp,
  CRM, secret, raw class-link, or phone value was written.
- Immediate lead-capture/free-class lane:
  `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md`
- Domain/DNS task:
  `ops/domain-readbacks/2026-07-02-join-onetimeonetime-domain-task.md`
- Provider setup status:
  `ops/provider-config-readbacks/2026-07-02-one-time-provider-setup-status.md`
- Top task readback:
  `ops/task-view-readbacks/2026-07-02-one-time-top-task-readback.md`
