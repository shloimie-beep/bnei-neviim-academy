# OneTime WAPI Class-Link Runtime Readiness - 2026-07-08

Requirement: `REQ-20260708-077`
Raw input: `raw-input/RAW-20260708-021-onetime-runtime-class-link-wapi-readiness.md`

## Result

Partially unblocked. The current OneTime class link is now configured in the
OneTime Railway production runtime by secret environment variables. The raw
Zoom URL is not committed.

Set on `one-time-web` production with `--skip-deploys`, then redeployed:

- `ONE_TIME_WHATSAPP_CLASS_LINK`
- `ONE_TIME_LIVE_CLASS_URL`
- `ONE_TIME_CURRENT_CLASS_LINK`
- `ONE_TIME_ZOOM_JOIN_URL`

Deployment:

- OneTime Railway deployment `e724304b-671b-4ea8-8514-5ed2ed9acc72` reached `SUCCESS`.

## Live Readback

Read-only WAPI diagnostics after redeploy:

- `workspace_key=rabbi_sheller_provider`
- `project_key=one_time_mishnah_class`
- `auto_reply_class_link_configured=true`
- `auto_reply_credentials_configured=false`
- `auto_reply_ready=false`
- `external_write_performed=false`

Remaining blockers:

- `ONE_TIME_WAPI_AUTO_REPLY_ENABLED not enabled`
- `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM must equal APPROVE_ONE_TIME_WAPI_AUTO_REPLY`
- `OneTime WAPI token missing`

Required send/sync env still missing:

- `ONE_TIME_WAPI_API_TOKEN or RABBI_SHELLER_WAPI_API_TOKEN or WAPI_API_TOKEN`

## Verification

- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed after redeploy.
- WAPI diagnostics were read-only and performed no external write.

## Guardrails

- No WhatsApp/WAPI message was sent.
- WAPI auto-reply was not enabled.
- WAPI approval flag was not set.
- No payment/access, account grant, DNS, Zoom meeting creation, Vimeo, Drive,
  Stripe, or external CRM mutation was performed.
