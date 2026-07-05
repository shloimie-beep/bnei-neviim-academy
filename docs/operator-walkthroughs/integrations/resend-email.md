# Resend Email Walkthrough

Updated: 2026-06-29

Setup Center anchor: `/integration-setup.html#resend-email`

Use this for OneTimeOneTime Mishnah email setup. Do not paste secrets into
chat, docs, screenshots, or tracked files.

## Sender Identity

- Domain: `onetimeonetime.com`
- From email: `info@onetimeonetime.com`
- From name: `OneTimeOneTime Mishnah`
- Reply-to: `info@onetimeonetime.com`
- BNA domain is not used as the OneTime sender.

No live email send should happen unless Shloimie explicitly approves the exact
recipient and send.

## Railway Environment Names

Set these in Railway/server environment:

- `RESEND_API_KEY`
- `RESEND_DOMAIN=onetimeonetime.com`
- `RESEND_FROM_EMAIL=info@onetimeonetime.com`
- `RESEND_FROM_NAME=OneTimeOneTime Mishnah`
- `RESEND_REPLY_TO=info@onetimeonetime.com`
- `RESEND_WEBHOOK_SECRET`

Only the names and non-secret identity values belong in docs. `RESEND_API_KEY`
and `RESEND_WEBHOOK_SECRET` must stay in the keyholder/server environment.

## Resend Receiving

Receiving region:

```text
us-east-1 / North Virginia
```

Expected root MX:

```text
@ MX 10 inbound-smtp.us-east-1.amazonaws.com
```

The operator packet says sending domain, DKIM, and return-path records are
verified, receiving is enabled, and Zoho MX has been removed. If MX is still
pending in Resend, wait for DNS propagation or recheck the DNS host.

## Webhook Setup

Create a Resend webhook with:

```text
https://bneineviimacademy.org/api/resend/inbound
```

If Railway is not yet using the custom domain, use:

```text
https://<railway-public-domain>/api/resend/inbound
```

Select only:

```text
email.received
```

Copy the webhook signing secret into Railway/keyholder as
`RESEND_WEBHOOK_SECRET`. Do not share the value in chat.

## What Codex Built

- Public signed webhook endpoint: `/api/resend/inbound`
- Svix verification using `svix-id`, `svix-timestamp`, and `svix-signature`
- Full received-email fetch using `data.email_id`
- Dedupe by Resend event ID, received email ID, and email message ID
- CRM write to `bna_communications`
- Contact match/create in first-party BNA CRM
- Scope:
  `workspace_key=rabbi_sheller_provider`,
  `project_key=one_time_mishnah_class`

Non-`email.received` webhook events are ignored with a successful response.
Invalid signatures are rejected.

## Final Check

After deploy, run the live doctor/smoke that checks:

- app route exists
- invalid signature gets `401`
- webhook secret is configured by name
- OneTime sender identity is reported as `info@onetimeonetime.com`
- no live send was triggered
