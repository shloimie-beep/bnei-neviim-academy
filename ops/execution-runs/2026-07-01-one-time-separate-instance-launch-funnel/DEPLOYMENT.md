# Deployment

## 2026-07-02 Existing BNA Railway Deploy

Codex reconciled the dirty worktree, committed the intentional One Time launch
cleanup/protocol work, pushed branch
`codex/one-time-launch-cleanup-20260702-no-workflow`, and opened draft PR #62:
`https://github.com/shloimie-beep/bnei-neviim-academy/pull/62`.

The current local app bundle was deployed to the existing BNA Railway service:

- project: `skillful-motivation`
- service: `skillful-motivation`
- environment: `production`
- deployment: `7af5568c-6fcd-4201-98e2-3fc350388c4b`
- status: `SUCCESS`

Live smoke evidence was produced under ignored local smoke artifacts and is
referenced here instead of being committed:

- `ops/live-smokes/2026-07-02T11-19-36-691Z-live-app-smoke.md`
- `ops/live-smokes/2026-07-02T11-19-36-691Z-live-app-smoke.json`
- `ops/live-smokes/2026-07-02T11-19-35-409Z-rabbi-onetime-landing-smoke.md`
- `ops/live-smokes/2026-07-02T11-19-45-687Z-public-route-privacy-smoke.md`

The live smokes passed for the existing BNA app target:

- general health, Operations login/session, protected reads, Torah public/admin
  progress, task create/comment/delete, signup dry-run validation, Buffer
  diagnostics, and Drive website image lane;
- Rabbi/One Time public landing branding and safe setup language;
- public-route privacy and protected-route rejection.

This deploy does not clear the separate One Time launch-domain blocker.

One Time separate Railway project/service/database provisioning and deploy are
not performed until safe target/approval gates pass. Apex/root
`onetimeonetime.com` remains untouched.

`REQ-20260701-701` produced only local no-write provisioning readiness checks
and reports. The current blocker is the missing exact One Time Railway target,
separate One Time DB URL/alias, and approved environment values. No Railway
resource, variable, custom domain, deploy, DNS record, or database row was
created/changed.

`REQ-20260701-703` changed server-visible routing and was deployed to the
existing BNA Railway service. Live `join.onetimeonetime.com` verification stays
under `REQ-20260701-717` and depends on the external separate One Time
Railway/custom-domain/DNS blockers. The apex/root `onetimeonetime.com` remains
untouched.

`REQ-20260701-704` changed the visible landing/signup page, produced static
local screenshots, and passed the existing live `/rabbi` One Time landing
smoke. Live `join.onetimeonetime.com` landing/signup verification remains under
`REQ-20260701-717` and depends on the same separate One Time
Railway/custom-domain/DNS blockers.

`REQ-20260701-711` changed the local Operations WhatsApp setup/readiness panel
and redacted WAPI diagnostics only. No deploy, live smoke, provider mutation,
WhatsApp send, broadcast, reminder enablement, or external CRM write was
performed.

`REQ-20260701-712` changed the local Operations communications setup panel and
server guard for One Time Buffer drafts/schedules only. No deploy, live smoke,
Buffer draft, Buffer schedule, Buffer publish, media attach, ad spend, provider
mutation, email send, WhatsApp send, or external CRM write was performed.

`REQ-20260701-715` is documentation/read-only audit packet work. No deploy,
provider API call, billing mutation, user migration, access grant/revoke, email
send, WhatsApp send, or external CRM write was performed.
