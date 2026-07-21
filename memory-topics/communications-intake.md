# Communications Intake Memory

- BNA School inbound email, WAPI/WhatsApp, form, and portal communications are
  first-party BNA intake.
- For the One Time external connector only, GHL is the customer-communication
  source of truth and Shloimie is the default inbound owner. The One Time app
  remains authoritative for product/account state.
- Important inbound parent/accountability/payment/provider signals should
  create redacted local alerts or follow-up tasks.
- Do not auto-send, publish, or sync external connectors without explicit
  approval.
- Shloimie's clear natural-language approval is explicit approval when it
  unambiguously authorizes the exact prepared external send, recipient segment,
  and copy. Do not add a typed magic-phrase blocker on top of that in obvious
  cases. Ambiguous, money/access/legal/privacy-sensitive, or changed-scope
  actions still block for clarification.
- Hebrew-tagged BNA parent contacts should receive checked Hebrew copy for
  parent reminders. If the Hebrew body or subject shows mojibake or repeated
  `????`, block and repair before sending.
- For BNA school-wide parent reminders, prefer parents tied to current
  canonical BNA student records and exclude stale duplicates/signup-only
  records unless Shloimie explicitly broadens the audience.
- For Rabbi / One Time, login, billing, support, scheduling, parent
  administration, and unknown/general messages belong to Shloimie/Super Admin
  routing. Rabbi Telegram receives only assigned substantive Torah/Mishnah/
  halachic questions, Rabbi-authored newsletter/content drafts, and approved
  warm enrollment drafts. Telegram is not the canonical transcript; every
  One Time send, draft, or status change must be represented in GHL. AI must
  not originate Torah answers in Rabbi Eli's name.
- 2026-07-06 correction: the Webers are just away/on vacation and are not
  hosting today's BNA meeting. Do not describe them as having permanently left
  or stopped hosting unless Shloimie explicitly says that later.
- Relevant standing goal: `GOAL-CORE-013`.
