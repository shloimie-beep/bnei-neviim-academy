# Rabbi Scheller / One Time Memory

- Rabbi Scheller / One Time is a service-provider workspace, not the BNA
  homepage.
- Pricing placeholders are `$67` and `$149`; live payment-link creation remains
  blocked until Stripe or Green Invoice choice and credentials/payment links are
  explicitly approved.
- One Time uses first-party BNA platform primitives and operating standards, but
  its classroom/content/community records, student responses, contacts,
  communications, payments/access, and provider workflow stay in a separate
  provider-specific pipeline scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`.
- One Time Vimeo uploads, Stripe setup, CRM/mailbox data, class content, and
  member-library publishing must remain scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`. BNA Academy media/payment records are separate
  unless an explicit cross-workspace link is created.
- Rabbi / One Time brand is black + yellow. Do not apply the BNA cream/navy/
  teal/cyan palette to One Time unless a later explicit design Decision says so.
- The One Time AI Studio operator role is `one_time_ai_studio_operator`. It is
  scoped to `studio` and `tasks`, prompt/image-observation patching, OpenArt
  prompt export/readiness, and a mediated Studio-only repair lane. It must not
  get raw shell/Codex CLI, deploy, secrets, payments, contacts/CRM, settings,
  sends, access grants, or cross-workspace access.
- The One Time AI video worker role is `one_time_ai_video_worker`. It is scoped
  to One Time Studio and the One Time task manager only for
  `rabbi_sheller_provider` / `one_time_mishnah_class`. It must not get broader
  Rabbi/provider admin, BNA, contacts/CRM, payments, settings, integrations,
  agent fleet, queue health, task artifact, Content handoff, raw shell/Codex,
  deploy, secrets, external send/publish/upload, or cross-workspace access.
- OpenArt integration is no-live until Shloimie signs up and connects
  OpenArt OAuth/MCP. BNA may prepare prompts, character/reference checklists,
  and request plans, but must not upload references, generate media, check
  credits live, or spend credits before account connection and approval.
- No live charge, payment link, access grant, send, or external sync without
  explicit approval.
- One Time parent/student classroom and library access should resolve from
  authenticated login, setup/magic link, or session context. Access codes may
  remain as a support fallback, but the default UX should not make logged-in
  parents/students feel like they are "joining" a classroom by code.
- One Time class/session pages should keep video, slideshow, worksheets/source
  sheets, comments, public updates, awards, and watch/progress data attached to
  the same class context so members never have to guess which materials belong
  to which class.
- One Time media security should use honest controls: member-only access,
  private Vimeo embeds, no raw download links by default, view-only rendered
  slides/PDFs instead of editable PowerPoint by default, watermarking/logging
  where useful, and clear residual-risk handling. Do not promise that browser
  media can fully prevent screenshots, screen recording, or determined capture.
- Rabbi Scheller's Telegram bot and in-platform helper should behave as a
  serious One Time scoped sidekick for his contacts, communications, student
  messages, content work, safe web research, scoped Drive/context previews, and
  internal reminders. Support tickets still route to Shloimie/super-admin with
  concise Telegram dings; Rabbi receives One Time communication alerts when his
  Telegram chat ID is configured. External sends, Drive/Vimeo/Zoom/WAPI writes,
  payments, access grants, credentials, and cross-workspace data remain gated.
- As of 2026-07-12, WAPI provider setup and One Time WhatsApp auto-reply
  readiness are present by redacted Railway/keyholder readback; do not keep
  treating WAPI token, Whapi/WAPI instance, sender metadata, webhook secret, or
  live auto-reply approval as missing unless a newer readback proves regression.
- As of 2026-07-12, Rabbi Telegram token/chat/ops runtime config is present by
  readiness check. Live Telegram-send proof still requires an exact scoped send
  approval and recorded no-secret evidence.
