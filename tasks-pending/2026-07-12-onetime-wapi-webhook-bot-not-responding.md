# One Time WAPI webhook bot not responding

Source: `raw-input/RAW-20260712-009-onetime-wapi-webhook-bot-not-responding.md`
Approval source: `raw-input/RAW-20260712-010-onetime-wapi-auto-reply-live-approval.md`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Owner: Codex
Status: live inbound fixed; auto-reply enabled and live-ready

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| REQ-20260712-501 | Inspect why the One Time WhatsApp bot is not responding without printing secrets or raw contact data. | done | Live env readback showed WAPI credentials and webhook secret present, broad auto-reply flags disabled, and the provider channel had no webhook entries. |
| REQ-20260712-502 | Configure the scoped Whapi channel webhook for inbound One Time messages. | done | Provider settings patched to send `messages/post` callbacks to the One Time app webhook URL with the verification header configured; final settings readback redacted the header value. |
| REQ-20260712-503 | Fix app-side inbound webhook processing defects exposed by provider callback tests. | done | Pushed commits `e23a02bb`, `66ab1aa2`, `8b24c3c`, and `92bcc2e`; final deployment `5417ad1f-5974-4f8d-871d-2366c655cb2b` succeeded. |
| REQ-20260712-504 | Verify the provider webhook can reach the live app and create a communication record. | done | Final provider webhook test returned HTTP 200/success true; live webhook log ID `4` status `processed`; communication ID `58` created; no raw body returned. |
| REQ-20260712-505 | Enable automatic live WhatsApp replies from the One Time WAPI identity only after explicit operator approval. | done | Shloimie approved live mode in `RAW-20260712-010`; Railway flags were set, deployment `ee81b96e-a5a3-4645-b922-13cf237e3200` reached `SUCCESS`, and live diagnostics report `auto_reply_readiness.ready=true` with empty blockers. |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260712-501 | Whether to turn on live inbound WhatsApp auto-replies for One Time. | n/a | Shloimie | Approve live replies only after confirming the exact auto-reply behavior and sender identity. | Keep observe-only mode and file inbound communications without replying automatically. | Inbound texters can now receive automatic WhatsApp replies from the scoped One Time WAPI identity when the provider-bot plan allows a reply. | Done: set `ONE_TIME_PROVIDER_LEAD_BOT_MODE=live`, `ONE_TIME_WAPI_AUTO_REPLY_ENABLED=true`, and `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM=APPROVE_ONE_TIME_WAPI_AUTO_REPLY`; redeployed and verified live diagnostics. | REQ-20260712-505 | Done |

## Verification

- `node --test tests/service-provider-lead-bot.test.js tests/one-time-wapi-scope-contract.test.js tests/one-time-delivery-outbox.test.js`: pass 16/16.
- `node --check server.js`: pass.
- Redacted leak scan: pass.
- Whapi callback test: final result HTTP 200, success true.
- Live database readback: webhook log ID `4` processed and communication ID
  `58` created; auto-reply skipped because observe-only mode remains active.
- Live approval and enablement: Railway deployment
  `ee81b96e-a5a3-4645-b922-13cf237e3200` reached `SUCCESS`; redacted live
  diagnostics show `auto_reply_readiness.ready=true`, empty blockers,
  `credential_scope=one_time_scoped`, class link configured, webhook secret
  configured, instance binding configured, and sender binding configured.
- Live smokes: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed; `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
  passed.

## Guardrails

- No raw phone numbers, raw emails, raw Zoom URL, webhook secret, API token, or
  message body in tracked files.
- No manual WhatsApp send during repair.
- Automatic live replies were enabled only after explicit operator approval in
  `RAW-20260712-010`.
- Telegram alerts, campaigns, payments, DNS, access grants, and unrelated
  provider actions remain out of scope.
