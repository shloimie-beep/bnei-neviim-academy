# One Time / Rabbi Sheller Memory

- Workspace key: `rabbi_sheller_provider`.
- Project key: `one_time_mishnah_class`.
- View class for Rabbi admin work: `RABBI_PROVIDER_ADMIN`.
- Brand: black + yellow.
- GHL-like means first-party BNA CRM/product patterns only. Do not add GHL,
  LeadConnector, GHL env vars, GHL APIs, or external CRM writes.
- Classroom/content/community pipeline is provider-specific and separate from
  BNA Academy classroom/content/video records.
- The One Time AI Studio operator role is `one_time_ai_studio_operator`: only
  Studio + Tasks, Studio prompt/image-observation patching, OpenArt prompt
  export/readiness, and mediated Studio-only repair plans. No raw shell/Codex
  CLI, deploy, secrets, payments, contacts/CRM, settings, sends, access grants,
  or cross-workspace access.
- OpenArt is no-live until Shloimie connects OAuth/MCP. BNA can prepare
  prompts/reference checklists/request plans, but cannot upload/generate/spend
  credits/check credits live before account connection and approval.
- The next UI cleanup work must start with `00-control-tower` and
  `01-current-state-visual-audit`, then split into focused implementation
  packets after audit and Definition of Ready.

