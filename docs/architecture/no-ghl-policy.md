# No-GHL Policy

## Policy

BNA no longer uses GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as an
active runtime dependency.

Do not add new GHL code, env vars, tests, docs, routes, prompts, MCP tools,
smoke checks, dashboard controls, Telegram actions, tags, workflows, or schema
assumptions.

## Source Of Truth

First-party BNA Operations records are canonical for:

- Contacts, parents, students, staff, rabbis, and service providers
- School workspaces, provider workspaces, and workspace settings
- Learning communities and scoped community dialogue
- Provider listings, provider requests, provider messages, and provider updates
- Parent/student/provider portals
- Weekly updates and newsletters
- Bot prompts, bot actions, tickets, decisions, worksheets, and assignments

## Allowed Connectors

Connectors may help deliver or synchronize data, but they are not the source of
truth unless explicitly approved later.

- Buffer: social scheduling connector for Facebook, LinkedIn, and YouTube
- Whapi/WAPI: WhatsApp connector
- Gmail/Google APIs: office email, Drive, Docs, Sheets, Classroom, Calendar
- Green Invoice/payment links: payment reconciliation connector
- Provider-owned systems: external booking, delivery, video, forms, and CTAs

## Legacy Archive

Legacy GHL files may remain only under `docs/archive/legacy-ghl/` and must be
treated as retired historical reference.

Every legacy archive file that is edited or newly moved there should include:

> Legacy retired GHL archive. GHL/GoHighLevel/LeadConnector is not active BNA runtime and must not be used for new BNA implementation.

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

## Verification

No-GHL verification should scan active source and docs outside the retired
archive. Historical mentions are allowed only when clearly marked retired or
when they are old completed changelog context that is explicitly superseded by
this policy.
