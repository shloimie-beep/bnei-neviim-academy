# Wappy Connector Decision Packet

Date: 2026-06-15

Purpose: close the open Wappy product-identification task without adding a live
WhatsApp connector. This packet is a no-write decision artifact only. It does
not add credentials, API clients, webhook routes, sends, sync jobs, external CRM
writes, or user-visible WhatsApp automation.

## Decision

Do not select Wappy yet.

The current BNA runtime should stay on the already-deployed Whapi/WAPI path for
local WhatsApp import, grouping, correction preview, contact history readback,
and first-party lead-candidate review. Wappy remains a future vendor candidate
only until the operator confirms the exact product, account model, API/export
contract, number model, data ownership, and approval gate.

Do not add new `WAPPY_*` environment variables, Wappy API clients, Wappy MCP
tools, webhook receivers, smoke scripts, dashboard controls, Telegram commands,
or schema assumptions until the acceptance gate below is satisfied.

## Public Source Readback

Sources checked on 2026-06-15:

- `https://wappy.chat/en/`
- `https://wappy.chat/en/pricing`
- `https://wappy.chat/en/general-terms-and-conditions`
- `https://wappy.chat/en/privacy-statement`
- `https://www.wappy.ai/`
- `https://www.wappy.ai/privacy-policy`
- `https://whapi.cloud/`
- `https://whatsappbusiness.com/developers/developer-hub/`

### wappy.chat

`wappy.chat` presents itself as a website WhatsApp widget. The official home
page says the visitor types a message, their WhatsApp opens, and the typed
message is carried into WhatsApp. The pricing page adds an AI Chat add-on with
uploaded files, prompt preferences, Sales/Leads/Service focus, leads and
conversation overview, easy lead tracking, and PipeDrive/Zapier listed for
Q2 2026 on higher AI Chat plans.

This is useful for website conversion and lightweight lead capture, but the
public pages reviewed do not prove:

- a server-to-server WhatsApp messaging API for BNA-owned workflows
- webhook event export suitable for BNA `bna_contact_communications`
- number portability or migration details
- official WhatsApp Business Platform/BSP status
- bulk history export or durable data ownership terms for CRM migration
- an immediate Pipedrive/Zapier production integration, since the pricing page
  says PipeDrive/Zapier is Q2 2026

### wappy.ai

`wappy.ai` presents itself as "Wappy - Turn conversations into opportunities"
and the public HTML describes "Wappy on Whatsapp" as "like shopify for
websites." The public JavaScript bundle exposes product copy for an AI agentic
platform, WhatsApp Business automation, lead capture, workflow automation,
Facebook SDK usage, and n8n webhook-style endpoints. Its privacy-policy route
mentions WhatsApp Business automation, message/contact processing, and control
over data.

That is not enough to choose it as a BNA connector. The public material reviewed
does not provide a stable developer API reference, webhook schema, pricing and
limits, account/session ownership model, data export promise, WhatsApp number
portability plan, Meta Business Platform/BSP status, or rollback path.

### Whapi/WAPI

Whapi.Cloud remains the active BNA path. Its public documentation positions it
as a developer HTTP API with webhooks, media, groups, channels, existing-number
QR/pairing, no-code integrations through standard HTTP/webhooks, and fixed
per-channel pricing. It also warns that any WhatsApp automation can still carry
restriction risk based on sending patterns, number reputation, recipient
feedback, and message quality.

BNA already uses this path in no-send/readback mode for local import, grouping,
correction preview, contact history, Telegram note-to-CRM matching, and
lead-candidate review. That should remain the default until a better-approved
connector is explicitly selected.

### Meta WhatsApp Business Platform

The official WhatsApp Business developer hub remains the compliance baseline
for any future official WhatsApp Business API direction. It points to docs,
test numbers, code samples, webhooks, sandbox resources, API reference, policy
enforcement, rate limits, opt-in rules, pricing, and partner options.

If BNA needs official WhatsApp Business API behavior rather than linked-device
automation, the comparison must include Meta Cloud API setup, approved business
assets, phone number ownership, opt-in/template policy, pricing, webhooks, and
rollback.

## Comparison For BNA

| Candidate | What public evidence supports | What is missing for BNA | Current decision |
|---|---|---|---|
| `wappy.chat` | Website WhatsApp widget, AI Chat add-on, lead/conversation overview, future PipeDrive/Zapier timing. | Public API docs, webhook/export schema, number portability, official platform status, ownership/rollback detail. | Do not select. Good only as a possible website-widget candidate. |
| `wappy.ai` | AI-agent workflow product around WhatsApp Business automation and lead capture. | Stable public API docs, webhook schema, pricing, session/account ownership, export, number model, compliance status. | Do not select. Needs vendor answers first. |
| Whapi/WAPI | Developer HTTP API, webhooks, existing-number linked-device model, current BNA code already deployed in no-send mode. | Official Meta API compliance is not the same as Cloud API; live sends still require approval and anti-spam guardrails. | Keep active for current local import/readback only. |
| Meta Cloud API | Official WhatsApp Business Platform docs, webhooks, sandbox/test numbers, policy/rate/pricing references. | Owner approval, business/account setup, number policy, scopes/assets, templates/opt-in, smoke/rollback. | Use as compliance baseline for any official future path. |

## Vendor Questions Before Any Switch

Ask these before selecting `wappy.chat`, `wappy.ai`, or another WhatsApp
provider:

1. Exact product URL, contracting entity, and support owner.
2. Does the product use the official Meta WhatsApp Business Platform/Cloud API,
   a BSP model, or a linked-device/web WhatsApp session?
3. Can BNA keep the current WhatsApp number, and what is the migration,
   coexistence, or rollback path?
4. Can BNA export all conversations, contacts, tags, lead fields, media links,
   and delivery/read events?
5. Is there a stable public API reference for messages, contacts, webhooks,
   broadcasts, templates, tags, attachments, history sync, and opt-outs?
6. Is webhook delivery signed, retryable, idempotent, and replayable?
7. Are Zapier/Pipedrive/n8n integrations available in production now, and which
   plans include them?
8. Who owns message data, transcripts, AI prompt data, contact records, and
   derived lead fields?
9. What retention, deletion, privacy, subprocessor, and data residency terms
   apply for BNA families, students, providers, and Rabbi/provider workspaces?
10. What explicit opt-in, template, rate-limit, broadcast, and unsubscribe
    rules must BNA follow?
11. What happens when the vendor account is canceled, suspended, over quota, or
    disconnected?
12. What exact smoke test can be run without sending a real message?

## Acceptance Gate

A Wappy or replacement connector may be added only after all of these are true:

- Operator names the exact product, account, and owner.
- Vendor answers the questions above in writing or in a durable capture.
- The selected path is mapped against current first-party BNA tables/APIs.
- A dry-run/read-only smoke is designed before any live send.
- Live sends remain behind an exact typed approval phrase and recipient policy.
- Rollback/export/no-send behavior is documented.
- The implementation adds tests proving no hidden sends, broadcasts, external
  CRM writes, or unapproved contact/tag changes.

## Guardrail

No Wappy work may reintroduce GHL/LeadConnector assumptions. WhatsApp
communications continue to belong in first-party BNA Operations tables. Until
this packet is explicitly superseded, the safe default is:

- Whapi/WAPI import/readback/correction preview only
- no automatic WhatsApp sends
- no broadcasts
- no external CRM writes
- no new Wappy runtime keys or routes
- no vendor switch based on name similarity alone
