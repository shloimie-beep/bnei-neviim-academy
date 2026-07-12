# PKT-20260712-107 - One Time CRM And Inbox UI

Parent raw ID: `RAW-20260712-004`
Requirement: `REQ-20260712-107`
Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`

## Scope

Implement only the One Time Operations CRM/inbox experience layer:

- CRM desktop layout: left contact list, center activity/conversation, right profile.
- CRM mobile flow: list to selected-contact view with a real `Back to contacts` button.
- CRM action states: reply draft, internal note, and task controls are visibly disabled or preview-only unless a scoped local write path is already approved.
- Inbox route: Communications > Email stays clearly scoped to Rabbi / One Time with selected-contact context, provider/project metadata, and locked send gates.
- Evidence: PQC validation, action registry coverage, local split-shell + monolith smoke screenshots/tests.

## Out Of Scope

- No live email, WhatsApp, payment, access, DNS, provider-account, external CRM, GHL, LeadConnector, or production-data writes.
- No portal IA, public landing, bundle delivery, deploy, or live-smoke closeout.
- Do not solve the whole parent ramble. Complete only this packet's scope and record the next packet or blocker.

## Acceptance

- Desktop CRM shows three panes.
- Mobile CRM hides the list after selecting a contact and restores it with Back to contacts.
- Inbox keeps One Time scope and selected-contact context visible.
- View-as/project-scoped preview labels write controls read-only/no-send.
- New visible controls are in the action registry.
- Local smoke proves layout/actions and records no external writes.
