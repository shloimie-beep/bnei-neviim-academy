# One Time Operations Sidebar Live Closeout

Generated: 2026-07-05T16:59:00+03:00

## GitHub

- PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/97
- Branch: `codex/release-captain-onetime-ui-20260705`
- Implementation commit: `8ce40037`
- Merge commit: `e405bfe484db6515ccc52d4d9913938ee9e0d633`
- Merged at: 2026-07-05T13:55:21Z

## Live Deployed Readback

Production URL: `https://bneineviimacademy.org`

Strict source readback passed after merge:

```json
{
  "ok": true,
  "operationsBytes": 2269058,
  "cssBytes": 52228,
  "missingOps": [],
  "missingCss": [],
  "staleCss": []
}
```

The live `operations.html` includes:

- `live_class_schedule`
- `program_schedule`
- `community_questions`
- `reporting_readiness`
- `connector_setup`
- `renderSidebarSubnav()`

The live `one-time-operations.css` includes the black/yellow One Time tokens:

- `--ot-ops-accent: #ede518`
- `--ot-ops-accent-deep: #c9a227`
- `--ot-ops-card: #101010`

The live CSS readback did not contain the stale One Time teal/cyan literals
`#0b9fc9`, `#08779c`, or `#b8dff0`.

## Live Smokes

`npm run app:smoke:one-time-shared-review` passed on
2026-07-05T13:57:14.679Z for the public health endpoint, One Time public and
review pages, and the authenticated One Time Operations route at mobile 390px,
tablet 768px, and desktop 1440px.

`npm run app:smoke` passed on 2026-07-05T13:58:43.910Z for public health,
Operations login/session, protected API reads, Torah public/admin progress,
task create/comment/delete, signup dry-run validation, Buffer diagnostics, and
Drive website image lane.

Local generated smoke reports exist under ignored `ops/live-smokes/`:

- `ops/live-smokes/2026-07-05T13-57-14-679Z-one-time-shared-review-live-smoke.md`
- `ops/live-smokes/2026-07-05T13-58-43-910Z-live-app-smoke.md`

## Railway Readback

Railway CLI deployment-ID readback could not be completed from this shell:

- `npm run railway:doctor` first resolved the current Railway status to the
  separate `one-time-production` project rather than the BNA production target.
- Re-running with explicit BNA service/domain made the target guard pass for
  project/service `skillful-motivation`, production, domain
  `bneineviimacademy.org`.
- The follow-up `railway link --project ... --environment production --service
  skillful-motivation --json` returned `Unauthorized` with the available
  project token.
- Direct `railway service status --service skillful-motivation --environment
  production` returned `Service "skillful-motivation" not found`.

This blocks only Railway deployment-ID readback from this shell. It does not
block the deployed-code proof above: the production app served the merged
Operations sidebar code and passed live browser/API smokes.

## Guardrails

No checkout session, charge, payment link creation, member creation, access
grant, live email/WhatsApp/SMS/Telegram send, DNS write, Drive upload/share,
external CRM write, provider account mutation, credential change, or production
data cleanup mutation was performed.
