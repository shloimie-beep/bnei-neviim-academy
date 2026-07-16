# One Time Support Consumer Contract

## Endpoint

`POST /api/bna/integrations/one-time/support-tickets/v1`

The route accepts only `application/json` up to 64 KB and is registered before global JSON parsing.

## Headers

- `x-bna-onetime-event-id`: stable unique event id.
- `x-bna-onetime-timestamp`: epoch seconds, epoch ms, or ISO timestamp inside the replay window.
- `x-bna-onetime-signature`: `v1=<hex hmac sha256>`.
- `x-bna-onetime-key-id`: optional signing key identifier for audit.

Signature base:

```text
${timestamp}.${eventId}.${rawBody}
```

## Payload

Required:

- `event_id` matching the signed header.
- `event_type = one_time.support_ticket.created`.
- `schema_version = 2026-07-17.one_time_support_ticket.v1`.
- `account_key = rabbi_sheller_provider`.
- `product_key = one_time_mishnah_class`.
- `ticket.title` or `ticket.message`.
- Signed entitlement proof:
  - `proof_type = one_time_subscription_entitlement_v1`
  - `reference`
  - `signature`
  - active/current status
  - matching account/product
  - non-expired validity window

Attachments are rejected. Secrets, access links, class links, private IDs, emails, and phone numbers are redacted before ticket descriptions, comments, Telegram payloads, and source-context previews.

## Storage

- Durable inbox: `bna_one_time_support_consumer_events`.
- Canonical support record: `bna_support_tickets`.
- Operator comment/audit: `bna_support_ticket_comments`.
- BNA operator alert queue: `assistant_delivery_outbox`.
- Reverse provider-off status queue: `bna_one_time_support_status_outbox`.
- Dead letters: `assistant_dead_letters`.

## Routing

- Reproducible bug: support category `bot_api` or `task_manager`, source-context `agent_decision.status = awaiting_agent_review`, no automatic job.
- Billing/product/policy/data correction/new feature: source-context `decision_card.status = decision_needed`.
- Access/security/privacy: severity elevated to high/blocking path, restricted notification state, no secrets in alert.

## Guardrails

- No live Telegram send.
- No Rabbi bot token or One Time bot token.
- No provider action.
- No email/WhatsApp send.
- No charge, DNS, deployment, credential, access, or production runtime mutation.
- No automatic code execution, task creation, job creation, close, deploy, or CLI execution from intake.
- No Academy learner data crossover.
