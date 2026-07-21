# BNA School No-GHL Policy And One Time Exception

## Policy

BNA School does not use GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as
an active runtime dependency or CRM source of truth.

Do not add GHL code, env vars, routes, prompts, MCP tools, smoke checks,
dashboard controls, Telegram actions, tags, workflows, or schema assumptions
to `bna_school`.

`DEC-20260721-002` creates one narrow exception for the One Time external
product connector: GHL is the One Time customer-communication source of truth.
The One Time app remains the product/account source of truth. This is not a
BNA School or platform-wide GHL adoption and does not authorize any provider
write by itself.

## Source Of Truth

First-party BNA School Operations records are canonical for BNA School:

- Contacts, parents, students, staff, rabbis, and service providers
- School workspace settings and school-scoped provider links
- BNA learning communities and scoped community dialogue
- BNA provider listings, provider requests, provider messages, and updates
- Parent/student/provider portals
- Weekly updates and newsletters
- Bot prompts, bot actions, tickets, decisions, worksheets, and assignments

For One Time only:

- GHL is canonical for customer conversations, drafts, sends, and statuses.
- The One Time app is canonical for accounts, access, products, enrollment,
  classes, and entitlements.
- Telegram is a non-canonical interface for assigned Rabbi Torah/content work.
- Resend is limited to security-token email delivery.

## Allowed Connectors

Connectors may help deliver or synchronize data. They are not a BNA School
source of truth unless an explicit BNA School decision approves one later.

- Buffer: social scheduling connector for Facebook, LinkedIn, and YouTube
- Whapi/WAPI: WhatsApp connector
- Gmail/Google APIs: office email, Drive, Docs, Sheets, Classroom, Calendar
- Green Invoice/payment links: payment reconciliation connector
- Provider-owned systems: external booking, delivery, video, forms, and CTAs
- One Time GHL: explicit customer-communication source of truth for the One
  Time external product connector only

## Legacy Archive

Legacy BNA GHL files may remain only under `docs/archive/legacy-ghl/` and must
be treated as retired historical reference. They are not the implementation
source for the One Time connector contract.

Every legacy archive file that is edited or newly moved there should include:

> Legacy retired GHL archive. GHL/GoHighLevel/LeadConnector is not active BNA School runtime and must not be used for new BNA School implementation.

## Implementation Rules

- Public provider signup is free-listing-only.
- Booking remains external through the provider CTA unless a new connector is
  approved.
- Parent/provider requests are stored in first-party BNA records before any
  external notification.
- Bot actions must use typed, permissioned, audited Action Registry entries.
- Technical bugs may route to Codex only from authorized admin/system roles.
- Product/design/approval questions route to Shloimie's Decisions.
- Normal parent/provider requests route to support/provider/community records,
  not Codex.
- One Time customer communication changes require GHL write/readback, but any
  real send or provider mutation still requires its own exact approval.
- Live class questions, GHL business conversations, and Super Admin technical
  tickets remain separate records; technical tickets require source workspace.

## Verification

BNA School no-GHL verification should scan active `bna_school` source and docs
outside the retired archive. Explicit One Time connector contracts under
`docs/architecture/contracts/` are allowed only when they preserve
`bna_school.ghl_exception_applies=false`. Historical mentions are allowed only
when clearly marked retired or explicitly superseded.
