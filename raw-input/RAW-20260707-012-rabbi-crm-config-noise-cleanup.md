# RAW-20260707-012 - Rabbi CRM Config Noise Cleanup

- Source channel: codex_chat
- Created at: 2026-07-07T15:35:00+03:00
- Parse status: registered
- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- Requirement register: tasks-pending/2026-07-07-rabbi-crm-config-noise-cleanup.md
- Product Quality packet: ops/prompt-packets/2026-07-07-rabbi-crm-config-noise-cleanup/00-rabbi-crm-config-noise-cleanup.product-quality.json

## Raw Operator Wording

Also I was not able to even see the actual rabbis CRM and like wear his emails are stored I didn't see any clean CRM with like you know send a message send an email all I see is a bunch of like random information about what's configured not configured all of that information I've already told you before should not appear anywhere other than super admin it shouldn't be any like not configured yes configured like a random weird stuff laying around in the rabbis portal and she just be clear buttons and actions that actually do things

## Parsed Source Statements

- SRC-20260707-012-001: Rabbi/provider view did not make the actual CRM obvious.
- SRC-20260707-012-002: Rabbi/provider view did not make email storage/inbox location obvious.
- SRC-20260707-012-003: Rabbi/provider view needs clear Send Message and Send Email style actions.
- SRC-20260707-012-004: Configuration/readiness text such as configured, not configured, setup, and provider integration diagnostics must appear only in Super Admin surfaces.
- SRC-20260707-012-005: Rabbi/provider portal should show clear role-facing buttons/actions that actually route or save through safe handlers.

## Guardrails

- Do not enable live email, WhatsApp, SMS, payment, access, DNS, Zoom, Vimeo, Drive, or external CRM writes from this cleanup.
- Do not expose passwords, raw private email bodies, secrets, webhook details, API keys, or internal provider setup diagnostics.
- Keep Super Admin configuration/readiness diagnostics available outside Rabbi/provider role views.
