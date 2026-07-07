# RAW-20260707-002 - One Time Super Admin Mailbox And Provider Login

Source: `codex_chat`

Created: 2026-07-07 Asia/Jerusalem

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Privacy classification: account-access and mailbox administration request. Do
not commit passwords, raw email bodies, sender addresses, private message
content, cookies, or session tokens.

## Raw intake

Shloimie said:

> so I also need to be able to see these emails from the super admin account and there just has to be a very clear filter in order for me to filter his emails versus my emails and like which inbox I'm viewing I also want to be able to actually log in and see like his account and see what he's seeing so how do we do that can I have like a separate login so I can actually log in and see what he's seeing like I'm supposed to be an admin on his account aside from the super admin that can view everything I actually want to log in like him like he's logging in and see what he sees so set that up for me

## Parsed source statements

| ID | Statement |
|---|---|
| SRC-20260707-002-001 | Super Admin needs to view One Time/Rabbi emails from the Super Admin account. |
| SRC-20260707-002-002 | The mailbox UI needs a clear filter that distinguishes Rabbi/One Time emails from Shloimie/BNA emails. |
| SRC-20260707-002-003 | The UI must make it obvious which inbox is currently being viewed. |
| SRC-20260707-002-004 | Shloimie needs a way to log in and see the provider portal as Rabbi sees it. |
| SRC-20260707-002-005 | Shloimie should have an admin-on-Rabbi-account path separate from global Super Admin. |

## Router output

Classifications:

- `PRODUCT_QUALITY`
- `UI_IMPLEMENTATION`
- `COMMUNICATIONS_EMAIL`
- `PROVIDER_SETUP`
- `SECURITY_PRIVACY`
- `DEPLOY_RELEASE`

Product Quality Compiler required: yes.

Super-Ramble Packet Splitter required: no. This is a focused account/mailbox
scope packet touching one major admin/account surface and one provider portal
entry path.

## Guardrails

- Do not expose or print Rabbi's password.
- Do not create a fake shared identity that hides Shloimie's admin action.
- Do not expose BNA private inbox rows inside the Rabbi provider portal.
- Do not expose unrelated provider/BNA rows inside the filtered Super Admin
  mailbox.
- No email send, bulk campaign, payment/access change, DNS/provider mutation,
  Drive write, or external CRM write is authorized by this request.

## Closeout

Status: implemented and locally verified; publication/deploy readback pending.

Register:
`tasks-pending/2026-07-07-onetime-super-admin-mailbox-and-provider-login.md`

Product Quality packet:
`ops/prompt-packets/2026-07-07-onetime-admin-mailbox-access/00-admin-mailbox-filter-provider-login.product-quality.json`

Implementation evidence:

- Operations Super Admin email workspace now has a literal BNA / Rabbi inbox
  selector and uses the selected inbox scope for communications reads, Resend
  draft reads, draft creation, and send-request validation.
- Super Admin can request a scoped Rabbi / One Time provider session through
  `/api/bna/one-time/provider-session/start`; no password or secret is returned.
- Provider portal opened with `admin_provider=one-time` shows an
  `ADMIN ON RABBI ACCOUNT` banner and return link to the Super Admin Rabbi
  inbox.
- Local tests, watchdogs, PQC validation, and stubbed browser smoke passed.
