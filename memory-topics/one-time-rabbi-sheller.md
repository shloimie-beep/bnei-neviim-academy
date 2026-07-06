# One Time / Rabbi Sheller Memory

- Workspace key: `rabbi_sheller_provider`.
- Project key: `one_time_mishnah_class`.
- View class for Rabbi admin work: `RABBI_PROVIDER_ADMIN`.
- Brand: black + yellow.
- GHL-like means first-party BNA CRM/product patterns only. Do not add GHL,
  LeadConnector, GHL env vars, GHL APIs, or external CRM writes.
- Classroom/content/community pipeline is provider-specific and separate from
  BNA Academy classroom/content/video records.
- One Time Vimeo, Stripe, CRM/mailbox, class/content, and member-library
  work must stay scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`. Do not treat BNA Academy Vimeo/media/payment
  records as One Time records unless an explicit cross-workspace link exists.
- The One Time AI Studio operator role is `one_time_ai_studio_operator`: only
  Studio + Tasks, Studio prompt/image-observation patching, OpenArt prompt
  export/readiness, and mediated Studio-only repair plans. No raw shell/Codex
  CLI, deploy, secrets, payments, contacts/CRM, settings, sends, access grants,
  or cross-workspace access.
- The One Time AI video worker role is `one_time_ai_video_worker`: only One
  Time Studio + One Time task manager for `rabbi_sheller_provider` /
  `one_time_mishnah_class`. It may use no-live Studio prompt/storyboard/mock
  render/AI video worker handoff actions and scoped task comments/updates. It
  must not access broader Rabbi/provider admin data, BNA data, contacts/CRM,
  payments, settings, integrations, agent fleet, queue health, task artifacts,
  Content handoff, raw shell/Codex/deploy/secrets, or external writes.
- OpenArt is no-live until Shloimie connects OAuth/MCP. BNA can prepare
  prompts/reference checklists/request plans, but cannot upload/generate/spend
  credits/check credits live before account connection and approval.
- The next UI cleanup work must start with `00-control-tower` and
  `01-current-state-visual-audit`, then split into focused implementation
  packets after audit and Definition of Ready.

