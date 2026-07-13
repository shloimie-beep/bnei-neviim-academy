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
- One Time class video drops may start from a laptop/Desktop Google Drive
  synced folder path as an operator surface. V1 can locally render a
  black/yellow opener, apply explicit/default trim points, and create Vimeo
  review sidecars, but real Vimeo upload, production DB writes, member
  visibility, and bot knowledge promotion remain approval-gated.
- On 2026-07-08, the canonical shared One Time Drive folder was visible
  through the Drive connector but not mounted under this desktop's
  `G:\My Drive`; local smoke testing used
  `G:\My Drive\One Time Vimeo Studio Desktop Test`. V1 automatic trimming is
  limited to leading/trailing black or silence edges and must not be described
  as semantic class-start/class-end detection.
- On 2026-07-08, Shloimie's broad approval allowed safe continuation of the
  One Time Vimeo workflow. OpenAI transcription passed on a synthetic speech
  smoke through keyholder credential `openaiv2.txt`, with transcript body kept
  out of GitHub proof. The One Time Drive drop folder ID was set on the
  `one-time-web` Railway production service with `--skip-deploys`. Vimeo live
  upload remains blocked because the configured keyholder Vimeo token returned
  401 in private smoke; no upload or public publish was performed.
- As of 2026-07-13, the owner-supplied Vimeo credential material validates as
  app credentials (`client_id` plus `client_secret`) but not as a direct user
  bearer token. The existing keyholder user access token reads the owner account
  as `Shloimie Dratler`. Do not store or print the raw values. Private upload
  remains blocked until a private Vimeo test project/folder is chosen, upload
  scope/plan readiness is confirmed, and Shloimie explicitly approves the
  synthetic private upload smoke.
- One Time transcript-derived bot knowledge must use only approved scoped
  class transcript/session context and must not leak BNA Academy, unrelated
  provider, private student, or raw transcript evidence into member/student
  surfaces.
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
- Rabbi-facing dashboards should show only role-scoped, useful, actionable
  cards. Non-actionable Super Admin/configuration/readiness cards such as
  "configured" or "not configured" belong in Super Admin/support surfaces or a
  role-gated support drawer, not the normal Rabbi provider view.
- As of 2026-07-13, the One Time WhatsApp bot knowledge/runtime must not claim
  portal, member-area, library, parent-login, or student-login access is
  available or being granted yet. Unknown or unpublished access, trial, renewal,
  pricing, portal, and library facts should be represented as unapproved and
  routed safely rather than phrased as program promises.
- The next UI cleanup work must start with `00-control-tower` and
  `01-current-state-visual-audit`, then split into focused implementation
  packets after audit and Definition of Ready.
- As of RAW-20260713-003, One Time is the current implementation and acceptance
  target. Simultaneous BNA frontend parity is deferred; shared API/security/
  privacy/database regression safety and workspace isolation still apply.
- RAW-20260713-003 allows bounded owner-only email/WhatsApp verification sends
  through secure aliases only. Do not expose full destinations in logs or proof,
  do not send to Rabbi/parents/students/leads without separate approval, and do
  not enable unrestricted public auto-reply for owner tests.

## 2026-07-13 - RAW-20260713-010 One Time final launch corrections

- Use spelling `Shloimie`.
- Shloimie is Super Admin and the real One Time workspace admin; One Time entry should be workspace/admin context, not View as Rabbi impersonation.
- Public One Time WhatsApp reactive auto-replies are approved after Shloimie canary and technical safety gates. Do not ask again for that same approval.
- Current slow-app report supersedes older performance-pass confidence until fresh proof says otherwise.
