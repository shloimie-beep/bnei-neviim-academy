# One Time Real Send Operator Decision Handoff

Generated: 2026-07-01T19:31:00+03:00

Requirement links: `REQ-20260701-601`, `REQ-20260701-607`,
`REQ-20260701-608`, `REQ-20260701-611`, `REQ-20260701-612`,
`REQ-20260701-614`, `REQ-20260701-615`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Current Send Decision

Transactional signup confirmation is live/send-ready for current signup
recipients only.

The real launch campaign is not send-ready and is not authorized. It can become
send-eligible only after every gate below has explicit evidence.

## Gates Before Real Campaign Send

| Gate | Current status | Required operator/external input | Proof needed before send |
|---|---|---|---|
| Campaign domain | Blocked | Route `onetimeonetime.com` and `www.onetimeonetime.com` to the Railway app, or explicitly approve a final fallback link. | Live smoke proves the final campaign link opens the One Time landing page. |
| Final copy | Needs decision | Final subject line and final email body. | Copy is recorded in a later campaign-send packet. |
| Recipient segment | Needs decision | Exact final list or segment. | Readback shows only approved recipients are eligible. |
| Suppression | Needs decision | Suppression rules for bounced, complained, unsubscribed, do-not-contact, manually suppressed, duplicate, and imported-but-not-approved rows. | Redacted suppression readback passes before send. |
| Seed send | Needs decision | Exact seed recipients and explicit seed-send approval. | Seed-send proof passes; failures stop the real campaign. |
| Explicit send command | Needs decision | A later explicit command approving the real campaign send. | Command names final copy, final segment/list, final links, and send approval. |

## Other Launch Gates

| Requirement | Current status | Required input |
|---|---|---|
| `REQ-20260701-607` reminders | Needs operator decision | Final live class date/time, cadence, approved reminder copy, eligible recipient source, suppression policy, approved seed/test member, and explicit activation approval. |
| `REQ-20260701-608` WAPI/Whapi | Blocked | Exact keyholder alias/path for Whapi/WAPI credentials and approved sending number. Do not paste credential values in chat. |
| `REQ-20260701-611` Vimeo | Blocked | Exact keyholder alias/path for `VIMEO_ACCESS_TOKEN` plus Vimeo owner, plan/quota, upload scopes, privacy/embed policy, private test folder, and synthetic upload-smoke file decision. Do not paste token values in chat. |
| `REQ-20260701-612` Zoom | Needs operator decision | Approved Zoom/session details and date/time. Do not paste private access details into tracked files. |

## Resume Rule

When one or more gates changes, resume the active run and execute only the
matching safe batch:

- Domain routed: rerun the One Time campaign-domain live smoke.
- Final copy/list/link supplied: prepare the final campaign-send packet, but do
  not send until explicit send approval is present.
- Seed approved: run a seed-only send to approved seed recipients, then record
  redacted proof.
- Reminder details approved: configure reminder metadata/activation under the
  explicit reminder approval only.
- WAPI, Vimeo, or Zoom details supplied: run the relevant credential/account or
  session readiness check without broad campaign, WhatsApp, payment, DNS, GHL,
  or production media writes.

## Still Forbidden

- No bulk campaign send.
- No imported lead/contact send.
- No WhatsApp send.
- No Stripe/Green Invoice charge, checkout, payment-link creation,
  subscription change, cancellation, or refund.
- No DNS mutation.
- No GHL/LeadConnector runtime write.
- No Vimeo production upload or publish.
- No BNA/One Time data mixing.
