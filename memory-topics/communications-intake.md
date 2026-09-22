# Communications Intake Memory

- Inbound email, WAPI/WhatsApp, form, and portal communications are first-party
  BNA intake.
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
- For Rabbi / One Time, support tickets belong to Shloimie/super-admin review
  and should ding Shloimie's Telegram. Rabbi communications, including scoped
  email, WhatsApp/WAPI, provider messages, and student/class messages, should
  ding Rabbi Scheller's Telegram once `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
  is configured. Alerts must be metadata-only and scoped to
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- 2026-07-06 correction: the Webers are just away/on vacation and are not
  hosting today's BNA meeting. Do not describe them as having permanently left
  or stopped hosting unless Shloimie explicitly says that later.
- Relevant standing goal: `GOAL-CORE-013`.
