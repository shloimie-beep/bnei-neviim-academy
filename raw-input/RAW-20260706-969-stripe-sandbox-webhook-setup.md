# RAW-20260706-969 - Stripe Sandbox Webhook Setup

## Metadata

- Raw ID: `RAW-20260706-969`
- Source: Codex chat
- Source channel: `codex_chat`
- Created at: 2026-07-06
- Parse status: parsed
- Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Raw source

> I just need to get my Stripe. Right now we have the Stripe, we have like a real API key, but I'm gonna give you the test key, but I need to get my webhook, my Stripe webhook. Can you give me the webhook that I can give him so you can give me the, so I can get the secret webhook key from Stripe? But in terms of the other two keys, I think right now we have the live ones, right? What I really want to give you is the test, the test API keys for Stripe, the sandbox ones.

## Parsed result

- Current live code Stripe webhook path: `POST /api/webhooks/stripe/rabbi`.
- Canonical One Time public domain: `https://join.onetimeonetime.com`.
- Full Stripe test webhook endpoint to configure after the One Time runtime is
  deployed there: `https://join.onetimeonetime.com/api/webhooks/stripe/rabbi`.
- Runtime secret names currently used by the webhook handler:
  `RABBI_STRIPE_SECRET_KEY` and `RABBI_STRIPE_WEBHOOK_SECRET`.
- Stripe sandbox smoke on 2026-07-06 returned `live_key_blocked`,
  `external_write_performed=false`, `webhook_secret_configured=false`.
- Needed from Stripe test mode: test secret key (`sk_test...`), publishable key
  if checkout UI needs it (`pk_test...`), webhook signing secret (`whsec...`),
  and the $67/month test recurring price ID.

## Guardrails

- Do not paste Stripe secret values into tracked files.
- Do not use live keys for sandbox smoke.
- Do not create live checkout, live product, live price, charge, access grant,
  refund, cancellation, or webhook mutation without an explicit approved packet.
