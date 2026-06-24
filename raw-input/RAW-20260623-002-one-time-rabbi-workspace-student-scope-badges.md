# RAW-20260623-002 - One Time Rabbi Workspace, Student Scope, Badges

Source: Codex chat ramble, 2026-06-23, local timezone Asia/Jerusalem.

## Operator Intent

Build Rabbi Eli Scheller's One Time provider view as a scoped workspace that is
closer to the super-admin operating model without granting super-admin
cross-account access. The Rabbi workspace should have a sidebar/hamburger
navigation model, workspace identity, users, CRM, content, automations,
settings, parent/student/classroom preview links, and clear setup/configuration
sections.

The owner identity should display as Rabbi Eli Scheller with login username
`ELISHELLER`. Password handoff should be treated as a WhatsApp handoff, but no
WhatsApp should be sent without explicit recipient/body approval.

The One Time student portal must remain separate from the BNA school student
portal. BNA school accountability goals, school goal checkoffs, consequences,
device controls, bot/accountability goals, and unrelated household/student
records must not bleed into the Rabbi Scheller One Time workspace.

The Rabbi UI should clearly show where Rabbi Eli can award badges, and those
badges should also appear in the One Time automation map. Badge/reward records
must stay scoped to One Time and must not write into BNA school accountability
goal ledgers.

## Parsed Requirements

- REQ-20260623-OT-RABBI-001: Add a scoped One Time Rabbi workspace shell with
  sidebar/hamburger navigation and sections for workspace, users, CRM, content,
  automations, communications, live class, library, payments, integrations,
  settings, and support.
- REQ-20260623-OT-RABBI-002: Expose Rabbi Eli Scheller / `ELISHELLER` as the
  One Time workspace owner in review data and UI; keep password handoff blocked
  behind approved WhatsApp flow.
- REQ-20260623-OT-RABBI-003: Add explicit One Time vs BNA school student portal
  boundary in provider and student review UI/data/tests.
- REQ-20260623-OT-RABBI-004: Add One Time badge awarding and badge automation
  surfaces, scoped away from BNA school accountability goals.
- REQ-20260623-OT-RABBI-005: Record implementation and verification in task
  notes, changelog, and JSONL ledger so other agents do not remap or overwrite
  the work.

## Guardrails

No WhatsApp, email, SMS, portal message, checkout, charge, access grant, Zoom
meeting creation, Vimeo upload, external CRM write, or cross-account
super-admin grant should be performed from this review work.
