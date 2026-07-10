# Resend Integration

Date checked: 2026-06-29

Scope: One Time Mishnayos outbound sender identity and inbound received
email capture into first-party BNA Operations CRM. This file contains no
secrets.

## Official Documentation

- Verify webhook requests:
  https://resend.com/docs/webhooks/verify-webhooks-requests
- `email.received` webhook:
  https://resend.com/docs/webhooks/emails/received
- Retrieve received email:
  https://resend.com/docs/api-reference/emails/retrieve-received-email
- Get received email content:
  https://resend.com/docs/dashboard/receiving/get-email-content

## Current External State

- Resend domain: `onetimeonetime.com`
- Sender: `One Time Mishnayos <info@onetimeonetime.com>`
- Reply-to: `info@onetimeonetime.com`
- Receiving region: `us-east-1` / North Virginia
- Sending domain, DKIM, and return-path records are treated as verified per
  the operator packet.
- Receiving is enabled. Root MX for inbound receiving should be:
  `@ MX 10 inbound-smtp.us-east-1.amazonaws.com`
- Zoho MX records were removed and no active Zoho mailbox is assumed for this
  root address.
- If the app or webhook is down, received email content remains retrievable
  from Resend dashboard/API, but BNA Operations CRM sync may lag until events
  are replayed or reprocessed.

Do not change DNS, nameservers, public website routing, Zoho routing, or GHL
behavior from code. DNS/account-owner work remains an operator action.

## Runtime Configuration

Required server-side names:

- `RESEND_API_KEY`
- `RESEND_DOMAIN=onetimeonetime.com`
- `RESEND_FROM_EMAIL=info@onetimeonetime.com`
- `RESEND_FROM_NAME=One Time Mishnayos`
- `RESEND_REPLY_TO=info@onetimeonetime.com`
- `RESEND_WEBHOOK_SECRET`

Secrets must live only in the keyholder/server environment. Do not paste
`RESEND_API_KEY` or `RESEND_WEBHOOK_SECRET` into chat, tracked files,
screenshots, logs, or task titles.

## Outbound Behavior

- One Time / Rabbi Sheller scoped email uses:
  `One Time Mishnayos <info@onetimeonetime.com>`.
- Reply-to is `info@onetimeonetime.com`.
- No real email send is allowed without explicit Shloimie approval and a named
  recipient.
- Local tests and previews use mocked Resend calls or local outbox previews.

## Inbound Webhook

Public app endpoint:

```text
/api/resend/inbound
```

Production webhook URL:

```text
https://bneineviimacademy.org/api/resend/inbound
```

If Railway is using a generated public domain instead of the custom domain,
use:

```text
https://<railway-public-domain>/api/resend/inbound
```

Resend webhook setup:

- Event type: `email.received`
- Signing secret: store in Railway/keyholder as `RESEND_WEBHOOK_SECRET`
- Required request headers: `svix-id`, `svix-timestamp`, `svix-signature`

Server behavior:

- Invalid/missing Svix signature returns `401`.
- Missing `RESEND_WEBHOOK_SECRET` returns a safe `503` blocker.
- Non-`email.received` events return `2xx` and are ignored.
- `email.received` events use `data.email_id` to call:
  `GET /emails/receiving/:email_id?html_format=cid`
- The CRM stores sender/recipient metadata, subject, text, HTML, safe headers,
  message IDs, thread keys, and attachment metadata.
- Secret headers and authorization-like header values are not stored.

## CRM Routing

Recognized inbound recipients:

- `info@onetimeonetime.com`
- Any `@onetimeonetime.com` address from the Resend catch-all path

Recognized One Time inbound mail is scoped to:

- `workspace_key=rabbi_sheller_provider`
- `project_key=one_time_mishnah_class`

The inbound writer:

- dedupes on Resend event ID, received email ID, and message ID
- finds or creates the sender contact in first-party CRM tables
- stores the message in `bna_communications`
- exposes the conversation through existing Operations CRM/admin
  communication APIs

Unknown recipients are ignored after fetch and are not written to CRM.

## Local Acceptance

- `node --check server.js`
- `node --check src/lib/integrations/resend-client.js`
- `node --check src/lib/integrations/resend-inbound-crm.js`
- `node --test tests/resend-client.test.js tests/resend-inbound-crm.test.js tests/assistant-portal-communications-contract.test.js`

No acceptance step sends live email.
