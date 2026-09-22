# One Time CRM/Portal Surface Map - Initial

Raw source: `RAW-20260712-004`
Status: initial map from repo search and existing protocol memory; needs current-state audit before UI implementation.

## Workspace

- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- View classes: `SHLOIMIE_PLATFORM_SUPPORT`, `RABBI_PROVIDER_ADMIN`, `MEMBER_PARENT_PORTAL`, `STUDENT_PORTAL`, `PUBLIC_MARKETING`

## Routes And Screens

- Operations CRM/contact view: `/operations?workspace=rabbi_sheller_provider&view=contacts`
- Operations communications/inbox surfaces: `/operations?workspace=rabbi_sheller_provider&view=communications`
- Family/member portal technical route: `/rabbi-member`
- Parent setup/reset: `/one-time-parent`
- Student portal: `/student`
- Classroom: `/one-time-classroom`
- Library: `/member-library`
- Public landing: `/one-time/` on `join.onetimeonetime.com`
- Public WhatsApp redirect: `/api/one-time/public-whatsapp/redirect`

## Likely Files

- `server.js`
- `public/operations.html`
- `public/js/operations-shell.js`
- `src/lib/bna/crm-contact-model.js`
- `src/lib/bna/provider-lead-bot.js`
- `src/lib/bna/one-time-product-system.js`
- `public/rabbi-member.html`
- `public/one-time-parent*.html`
- `public/one-time-classroom.html`
- `public/member-library.html`
- `public/student.html`
- One Time landing files under `features/one-time-landing/` are untracked in the current worktree and must not be touched until ownership is clarified.

## API / Data Areas

- Operations auth and scoped identity: `/api/bna/auth/me`
- CRM/contact lists and detail/timeline routes in `server.js`
- Contact tables: `bna_contacts`, `bna_parent_leads`, `bna_contact_communications`, `bna_whatsapp_messages`
- Project/workspace tables: `bna_projects`, workspace/provider records
- One Time signup/import and delivery/outbox routes
- Provider lead bot and WhatsApp assistant handlers

## Registry / Evidence Points

- Action registry: `ops/action-registry/` and `ops/action-registry.json` when present.
- Route registry: `ops/route-registry.json`.
- Product Quality packets: `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/`.
- Visual audit report: `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/`.

## Blockers

- Source screenshots referenced by the packet are not available locally.
- Existing dirty/untracked work includes One Time landing component files under `features/`; do not modify those until lane ownership is clear.
- Broad UI implementation remains blocked until `REQ-20260712-102` has screenshot evidence or an authenticated regeneration report.
