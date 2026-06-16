# BNA Memory

## Identity

- **BNA** = **Bnei Neviim Academy** = **Whole Child Torah Learning Community**
- A family-based Torah learning community in Beit Shemesh, Israel
- NOT a traditional school - a return to family-centered Torah education
- Current practical academy model: home-based integrative Torah learning,
  currently framed around a 10:00 to 1:00 learning window, with private
  coaching/check-ins and parent partnership around each boy.
- Do not frame current BNA as the archived family-accountability app, a generic
  secular-curriculum platform, or a full-day institutional school unless the
  operator explicitly changes the offer.
- Run by the operator
- The operator wants one shared brain across all channels (terminal + Telegram)

## Project Scope

**Phase 1 (Current): Foundation**
- New database for BNA operations (NOT using family accountability schema)
- Marketing system with Buffer for social posting and first-party BNA
  Operations as the CRM/community/provider source of truth
- School website for Whole Child Torah Learning Community
- Telegram bot integration
- Service provider network setup

**Phase 2 (Future):**
- Student accountability/tracking program (family app repurposed)

## Tooling Preferences

- **Codex**: Primary coding, development, and visible machine-work owner
- **OpenAI API**: Normal preferred Telegram/content hosted AI provider for
  ordinary conversation, content/tone refinement, brainstorming, and normal
  system running when configured and healthy
- **Kimi**: Normally fallback-only for provider failures or legacy records; as
  of 2026-06-14, approved as temporary primary hosted AI provider via
  `BNA_AI_PRIMARY_PROVIDER=kimi` while the OpenAI key issue is unresolved
- **Telegram**: Front-end channel for operator communication
- **Buffer**: Active social posting provider for Facebook, LinkedIn, and
  YouTube. Buffer API credentials live in Railway and local `.secrets`; never
  commit or display the API key. The current key appears to be named `BNAv2`,
  created 2026-06-09, and expires 2026-07-09.
- Current social posture: Buffer is draft-only first. Approved BNA and Rabbi/
  One Time content outputs may create Buffer drafts with exact source, channel,
  copy, hosted media URL when applicable, and rollback/no-post policy recorded;
  no auto-publish or mass scheduling by default.
- Current classroom posture: BNA is building its own first-party
  Google-Classroom-style Classroom experience. Google Classroom remains
  optional/secondary and approval-gated; classroom work must not require Google
  OAuth.
- Current email posture: keep low-volume/manual Gmail-style email paths for
  now. Resend readiness can remain visible, but do not build warm email
  campaigns or mass email automation unless explicitly requested later.
- Provider-owned integrations are the default for BNA, Rabbi Scheller / One
  Time, and future service-provider workspaces. Resend, Buffer, WAPI/WhatsApp,
  Vimeo, Zoom, Stripe, GoDaddy/DNS, Google Drive, and similar accounts should
  be stored as workspace/provider-scoped integration records and secret
  references. Do not silently reuse Shloimie's/BNA credentials for Rabbi or a
  service provider unless a managed-service exception is explicitly approved.
- Vimeo remains the default researched video-host candidate until account plan,
  primary-owner access, API app/token, upload access, private/domain embed
  behavior, and filtered-device playback prove it cannot support the workflow.
  Build manual Vimeo upload + paste-URL fallback before API upload is trusted.
- Stripe: a live Stripe secret key is stored only in the local BNA keyholder as
  `stripe-secret-key.txt` as of 2026-06-16. It is visible to the local
  keyholder-aware Stripe loader by fingerprint/status only. It has not been
  copied into `.secrets` or Railway, and live billing/checkout remains blocked
  until the exact target, account owner, product/price setup, webhook, rollback,
  and approval phrase are explicit.
- Rabbi Elie Scheller / One Time should use the same first-party classroom and
  content parsing/review pipeline as BNA, scoped to the One Time workspace.
- One Time Mishnayos community/course progress belongs in first-party WS11/BNA
  Operations tables and portal APIs, not an external forum. Student access-code
  fallback must keep working during rollout; parent-visible progress must be
  scoped through explicit parent-student access and approved parent-visible
  rows only; shoutouts, references, question responses, and public-facing
  recognition stay hidden until approved.
- **No-GHL policy**: BNA does not use GHL, GoHighLevel, LeadConnector, or
  LeadConnectorHQ as active runtime. Do not add new GHL code, MCP tools, env
  vars, smoke checks, dashboard promises, docs, routes, prompts, or Telegram
  actions. Historical files are archived under `docs/archive/legacy-ghl/`;
  existing production data that used old CRM column names should be kept only
  as `legacy_crm_*` compatibility references.
- **Whapi/WAPI**: Active WhatsApp API path. Outbound sends and webhook delivery
  logs use WAPI/Whapi credentials; Operations also has an explicit admin-only
  Whapi log sync that imports recent sent/received message history into
  `bna_contact_communications` with sync-run audit records.
- Zoom Server-to-Server OAuth and GoDaddy Delegate/DNS access are Thursday
  owner-access blockers for One Time. Do not substitute a Zoom Webhook Only app
  or guess DNS record values from screenshots.
- **Railway**: Hosting plus current production Postgres/database source of truth
- **Supabase**: Not currently used for BNA operations data unless explicitly reintroduced
- **BNA Keyholder**: Local key updates should go through
  `C:\Users\User\BNA-Keyholder`, outside the repo. Use `npm run keyholder:open`
  to open/create it and `npm run keyholder:diagnose` to report only metadata
  and SHA-256 fingerprints. Do not print or commit secret values; copying a key
  into `.secrets` or Railway requires an explicit operator request.
- Operator laptop bootstrap/setup packages belong behind Operations Super Admin
  access in Team/Admin > Operator Setup. Safe packages may include blank env
  templates, setup commands, and fingerprints only. Secret-bearing packages
  must be encrypted, short-lived, one-time download links, protected by an
  explicit approval phrase plus a strong passphrase, and must never expose raw
  values in chat, task titles, screenshots, logs, or tracked files.
- Shared repo files should be the canonical brain for both terminal and future
  Telegram bridge use
- The Downloads Markdown prompt pile is tracked through the 2026-06-15 prompt
  implementation audit. Current BNA/Rabbi/WS/Kimi prompt files are valid
  implementation source material; old WebCraft, GHL, LeadConnector, and
  unrelated-client prompt files are legacy/out of scope unless a current BNA
  prompt safely imports a requirement without active GHL runtime.
- The actual WS01-WS11 prompt pack Shloimie meant for the Downloads audit is
  `C:\Users\User\.codex\attachments\7e3bb822-96a8-43ff-b206-aa750f56a73a\pasted-text.txt`.
  Keep `ops/download-prompt-audit/2026-06-16-actual-ws-prompt-list-map.md` as
  the reference map when future messages say "the real list" or "the prompts I
  gave GPT."
- BNA now has a durable operating-goals register at
  `ops/operating-goals.md` and `ops/operating-goals.json`. Use it to keep the
  long-running goals visible across Telegram rambles, Codex sessions, prompt
  packets, handoffs, and live-proof blockers.
- Prompt intake is backed by `npm run prompts:audit`, which scans current repo
  handoffs/audits/memory plus recent Downloads/Codex attachment prompt sources
  and prompt zip entries, writes `ops/prompt-intake-register.jsonl`, and
  summarizes status in `ops/prompt-intake-summary.md`. It must never store raw
  secret values; it records only secret-risk level and redacted summaries.
- One Time/Rabbi owner-access blockers are centralized in
  `ops/thursday-access-checklist.md`. Zoom, GoDaddy/DNS, Vimeo, Resend,
  Buffer, WAPI/WhatsApp, Stripe, Google Drive, and old One Time app migration
  remain blocked until account owners, credentials, source data, and explicit
  approval gates are handled.

## Workflow Preferences

- Raw rambles captured first → distilled into durable memory + tasks
- `AGENTS.md`: Durable instructions
- `MEMORY.md`: Durable facts
- `TASKS.md`: Active work
- `tasks-pending/*.md`: internal Codex implementation handoffs
- `memory/YYYY-MM-DD.md`: Daily captures
- Current Operations admin sections are Dashboard, Tasks, Students, Parents /
  Contacts, Content, Service Providers, Communications, Accounting, API Usage,
  Team/Admin, and Settings.
- Operations uses a professional SaaS shell: global sidebar, workspace switcher,
  nested left subnav, top bar/breadcrumbs, and a main content region. Primary
  horizontal section tabs should not be reintroduced as the main IA.
- Public BNA website pages should use the shared `bna-site-nav` shell for
  header, hamburger, active nav, and footer. The current top public taxonomy is
  `School`, `Parents / Families / Parent App`, and `Service Providers`; `/school`,
  `/parents`, `/families`, `/parent-app`, and `/service-providers` should stay
  aligned with that taxonomy unless Shloimie changes the site model.
- Operations should not mount the public `bna-bot-widget.js` launcher. The
  private Operations helper entry belongs in the topbar/mobile header and opens
  the scoped Operations helper drawer. Super Admin platform navigation includes
  Calendar as a real module.
- Login, portal, onboarding, and assistant surfaces must be mobile-keyboard
  stable. Avoid fixed-height login shells, avoid automatic focus/scroll on
  narrow or coarse-pointer touch screens, keep input font sizes at least 16px
  on phone breakpoints, and skip background dashboard refresh while text entry
  or dictation/composition is active.
- BNA Helper answers must stay inside the source boundary for the current
  actor: public BNA content for public users, parent/student/provider-scoped
  portal context only after valid auth, and Operations context only for
  permitted admins. The helper must not invent school policies, medical/allergy
  rules, tuition/refund details, discipline rules, transportation, food, or
  other operational facts from generic school knowledge; if not verified in the
  loaded BNA context, it should say so and offer to ask Shloimie.
- Public homepage Torah progress must stay aggregate-only. The public page and
  `/api/torah-learning/public-summary` may show class progress, anonymous
  low-to-high range, status, and aggregate counts, but must not expose full
  student names, parent names/emails, private daily progress, goal minutes,
  notes, access codes, or per-student records. Individual Torah progress stays
  in authenticated parent/student/admin contexts only.
- After public route, portal, student-code, or privacy-sensitive changes, run
  `npm run app:smoke:public-privacy` against the live app or intended smoke
  base in addition to focused tests. That smoke is the repeatable Phase 1
  unauthenticated route audit for public, parent, student, signup, provider,
  Operations, and parent/student portal API boundaries.
- BNA Operations is the canonical internal-first operating system for CRM,
  tasks, workflows, provider platform, communications, calendar, settings, and
  bot action/audit context. External systems such as Google Calendar/Classroom,
  WhatsApp APIs, email providers, social schedulers, Vimeo, Green Invoice, and
  provider-owned class apps are connectors only unless explicitly promoted by a
  later decision.
- Support-ticket processed notifications are first-party/no-send by default:
  when a ticket is resolved or closed, the app should log a local
  `bna_contact_communications` internal-note draft and an internal ticket
  comment with `no_send` and `external_write_performed: false`; it must not send
  email, WhatsApp, SMS, Telegram, portal messages, or external CRM writes unless
  a later explicit approval adds a sender.
- BNA is one school workspace. Rabbi/service-provider work belongs in separate
  provider/project workspaces and should not mix with BNA school parents or
  students.
- Current workspace model: Platform / Super Admin is Shloimie's control layer;
  BNA School Workspace is the live micro-school; Rabbi Sheller Provider
  Workspace is the first provider workspace for the One Time Mishnayos
  Membership and 7:00 class. Provider participants/members should not be called
  BNA students unless they are actually enrolled in BNA.
- Operations should present workspaces as an official multi-workspace directory,
  not as a hard-coded single Rabbi Sheller workspace. Super Admin should see
  school, service-provider, family/home-accountability, parent-household,
  community/project, and platform workspaces through a switcher/filter pattern
  that can scale as real people and households are added.
- Provider public signup is free-listing-only. The data model may keep
  admin-only/future commercial fields, but the public UI must not advertise paid
  plans, paid placement, checkout, paid automation, or approval guarantees.
  Free listings get public profile/index visibility and an external CTA only.
  Provider booking stays on the provider's website, phone, WhatsApp, email, or
  custom URL unless BNA later approves a specific connector.
- Provider records should track commercial clarity fields such as
  `provider_status`, `commercial_model`, `source_of_truth`,
  `integration_status`, `setup_package`, `managed_services`,
  `provider_entitlements`, `provider_integrations`, and
  `provider_access_checklist`. Suggested source-of-truth values are
  `bna_operations`, `external_app`, `hybrid`, and `unknown_pending_access`;
  suggested integration statuses are `no_access`, `access_requested`,
  `read_only_access`, `full_access`, `api_available`, `manual_only`, and
  `integrated`.
- Rabbi Sheller is the first partner/provider case: service provider, not BNA
  school; commercial model is revenue-share/custom partner; source of truth is
  hybrid/external pending inspection; Replit/Vimeo/current app remains the
  external delivery system until inspected. BNA Operations owns CRM, lead
  pipeline, automations, content workflow, reporting, launch tasks, access
  checklist, and integration audit around that external delivery system.
- Public provider onboarding is at `/providers/join` and uses open admission:
  if a provider knows about it, they can join now. The signup creates an active
  free listing and provider workspace immediately; BNA can pause, reject, hide,
  or archive the provider later if needed. Rabbi Sheller is the first external
  provider/partner workspace and remains separate from BNA Academy
  parents/students unless explicit enrollment links them.
- Public website provider join links should open a conversational onboarding
  flow first, not a form wall. The flow should thank the provider, explain the
  open-join policy, explain BNA's student/homeschooler/alternative-education
  audience and provider-index/funnel direction, then ask the required listing
  questions one at a time before creating the active listing.
- Provider intake should collect enough listing context before publishing:
  provider/contact details, category, city/service area, languages,
  ages served, short description, services offered, website/phone/WhatsApp/
  email/custom CTA preference, image/logo URL, optional pricing summary,
  optional discount/group option, community/rabbi affiliation, and BNA notes.
- The first internal-first CRM backend primitives are persisted in the app:
  workspace settings, connector settings, internal calendar events, pipeline
  cards, internal dialogue threads/messages, and bot action logs. Missing live
  integrations should be shown as disabled/not configured/test/manual-mode
  controls, never faked as active.
- Operations Settings > Google Workspace includes a read-only Google Action
  Audit that filters local bot action logs for Google/Drive/Calendar/Classroom/
  Google Business Profile previews and executions. It is evidence/readback
  only and must not be treated as approval for live Google writes; live Google
  adapters still require OAuth/test-user setup, scope approval, and explicit
  external-write confirmation.
- The One Time/Rabbi launch calendar helper is
  `calendar_batch_launch_plan_preview`. It may preview an 8-week plan for
  `rabbi_sheller_provider`, but it must not create internal calendar events,
  write Google Calendar events, send messages, or run live Google sync. Turning
  the preview into real events requires a reviewed `start_date`; Google
  Calendar sync remains a separate OAuth/scope and explicit external-write
  approval path.
- Remaining live connector/publishing gates should be made explicit in
  Operations with checklist-style approval packets before execution. The
  current required phrases are `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` for live
  Google adapter testing and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` for
  One Time member-library publishing; showing those packets is readiness only,
  not permission to perform external writes, sends, checkout/access, member
  visibility changes, or connector publishing.
- Approval packets may preview a local Shloimie decision draft through the
  typed `create_decision` action only as `dry_run: true`. That preview may log
  a local action-audit row, but it must return `executed: false` and
  `preview.decision_created: false`; it must not create a decision task or run
  Google, Drive/video-host, Buffer/social, email, WhatsApp, checkout/access,
  member visibility, publishing, or external CRM writes.
- Member/community work should use the product term `learning communities`, not
  generic groups. As of 2026-06-12, the live app has BNA learning-community,
  membership, thread, and message tables/APIs, with default community
  `bna-main`. A rabbi can own/manage a learning community, admit scoped
  members, and participate in internal dialogue with students, parents, staff,
  service providers, and Shloimie/admin according to server-side permissions.
- BNA signup parent permissions are now a durable data model. New signups store
  normalized `parent_permissions` for leaving premises, walking alone, swimming,
  buying food, junk food, spending money, staying late, plus pickup/drop-off
  responsibility acknowledgement and notes. Signup/student sync writes
  `bna_parent_permission_profiles`. These choices are for awareness,
  values-based coaching, and parent reporting only; they are not a BNA
  enforcement responsibility or a separate approval system for every change.
  The signup UI should not use a final checkbox for this responsibility notice.
- Credit-card signup confirmations must email the configured `PAYMENT_LINK` to
  every parent email supplied on the form. Parent 1 is stored as
  `signups.parent_email`; Parent 2 email may only exist in the submitted form or
  the `Parent 2 Email:` line in signup notes, so confirmation sending must fan
  out before relying only on the saved signup row. Log each recipient send in
  `bna_email_log`.
- BNA signup documents now use four required branded document pages for
  Handbook, Tuition, Waiver/Safety Acknowledgment, and Student Handbook/Code of
  Conduct. The page flow preserves the typed signup form in the opener tab and
  writes the existing four-signature payload with signer, version, language, and
  timestamp context.
- Telegram, in-app bots, and UI buttons should be different interfaces over the
  same typed Operations Action Registry. Normal operations such as refining
  newsletters, drafting/scheduling email, creating calendar events, moving CRM
  stages, generating parent updates, updating provider records, and adding
  timeline notes should execute through typed actions with permission checks,
  dry-run/approval gates, and audit logs. Codex should only be routed work when
  the request is code, repo, deployment, migration, testing, debugging, or
  technical implementation.
- The in-app assistant is a sliding bot widget over the same safe action
  registry, not a separate raw LLM endpoint or duplicate memory system. Public
  pages show quick links only; portal action previews are session-gated,
  role-filtered, and preview-only unless they flow through existing approval
  systems.
- The universal in-app assistant should remain one role-aware chat interface
  across BNA surfaces. Avoid scattered helper buttons, duplicate parent/student
  text boxes, or static quick-action widgets that bypass the shared assistant,
  action registry, task ledger, and memory trail.
- Public website, signup/registration, One Time preview, and public provider
  pages should load the public helper knowledge bundle before the BNA Helper
  widget when the widget is mounted. Public `/providers` and `/provider-signup`
  routes are public lead/onboarding surfaces and must not be scoped as the
  private provider workspace.
- Role-specific onboarding/help requests from parent, student, and provider
  portal assistants should be coached in chat before the generic support-ticket
  fallback. The deployed `assistant_onboarding_coach` path returns English/
  Hebrew role guidance for student Today/goals/daily checkoff/questions,
  parent recording/goals/device setup, and provider profile/media/Google
  readiness while creating no support ticket, durable profile/goal write, send,
  or external connector write.
- The public website assistant is a lead-magnet guide, not a settings panel:
  it should open proactively after a short delay, speak Hebrew on Hebrew/RTL
  pages and English on English pages, use Shloimie's public self-governance/
  accountability/learning-program knowledge, and avoid internal tasks, private
  records, provider names, API/provider failures, or admin implementation
  details.
- On phone-width public pages, the shared BNA Helper should behave like a
  partial bottom sheet rather than a full-screen takeover: it should leave the
  page visible, keep the launcher reachable for minimize, avoid mobile
  auto-focus jank, and use concise 10-1 program copy without "I'm still here"
  style nudges.
- Public assistant contact requests should create an internal Shloimie
  follow-up reminder/ticket/communication. Public bug or UX feedback should
  become a support ticket plus a Codex review queue item when it is a clear
  site/app issue; product suggestions should become Shloimie Decisions. This
  must not grant public users admin, CLI, deploy, migration, or private-data
  access.
- Super-admin/Shloimie may access OpenAI and tracked Codex/CLI routing from the
  web assistant. Non-admin users may create tickets/messages and use scoped safe
  helper workflows, but must never invoke Codex, CLI, deployments, migrations,
  or unrestricted diagnostics.
- BNA contact identity must distinguish students, parents, service providers,
  staff, rabbis, and admins even when a student reuses parent email or phone for
  access. Shared contact details are relationship metadata, not proof that the
  same CRM/person record should receive both parent and student roles.
- BNA admin UI should follow the brand kit and current light BNA palette, not
  generic dark placeholder dashboard styling.
- Rabbi Scheller / One Time technical source-of-truth split as of 2026-06-14:
  `shloimie-beep/one-time-one-time` is the existing web/backend product source;
  `shloimie-beep/one-time-app` is an Expo/mobile companion prototype and UI
  reference. Keep One Time member/media/payment records separate from BNA school
  private records until a deliberate integration decision is approved.
- The One Time Mishnah website/funnel work in BNA is preview-only unless
  Shloimie approves launch. `/preview/one-time-mishnah` and `/one-time-preview`
  may show draft copy, TBD ILS/USD pricing, and a secondary video-library
  fallback, but must not activate checkout or replace Rabbi Scheller's live site
  without approval.
- One Time video-library item creation is now a first-party, review-only helper
  action: `create_one_time_video_library_item` creates a scoped
  `bna_content_jobs` record plus internal content-output draft states for the
  library card, transcript, thumbnail, worksheet/source sheet, social copy plan,
  and newsletter plan. These records are not member/public visible and must not
  trigger Buffer/social drafts, email/WhatsApp sends, Drive/video-host writes,
  checkout/access, or external CRM writes without a later approved publishing
  path.
- Operations Content > One Time Library is the internal review surface for those
  scoped One Time video-library records. It may track hosted media URLs,
  transcript/thumbnail/worksheet/social/newsletter review lanes, report status,
  and internal approvals. Its first-party Class Package Manager can publish
  `bna_class_sessions` packages to the One Time member library only when the
  destination is `member_library`, visibility/audience tier are explicit, and
  the exact `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` phrase is supplied.
  It still must not send email/WhatsApp/social posts, create checkout/billing,
  perform real Vimeo upload/API or Drive/video-host writes, write external CRM,
  or merge into the BNA student goal-checkoff portal.
- Public One Time member-library access is separate from BNA student/parent
  portals: `/member-library` and `GET /api/member-library?code=...` may show
  only active-code, tier-visible, `published` item fields. They must hide
  approval flags, rollback metadata, private transcript notes, and unrelated
  BNA student/accounting data. Rollback archives a library item so member
  readback no longer shows it.
- Task/decision helper actions now include `add_decision_option`,
  `schedule_task_on_date`, and `move_task_workspace`. They are approval-gated
  and preview-first; approved execution may only update local task fields,
  task comments, due/planned dates, or first-party project/workspace scope. They
  must not create Codex jobs, connector writes, email/WhatsApp/social sends, or
  external CRM records.
- Rabbi/One Time content helper actions now include `create_rabbi_shiur_idea`
  and `create_rabbi_source_sheet_task`. They are approval-gated and
  preview-first; approved execution creates only scoped local One Time review
  tasks. They must not create Codex jobs automatically, Drive/Sefaria/member
  library writes, email/WhatsApp/social sends, public visibility, or external
  CRM records.
- One Time referral/moderation helper actions now include
  `create_referral_ledger_entry`, `submit_student_question_for_moderation`, and
  `review_moderated_question`. They are approval-gated and preview-first.
  Approved referral execution may create only first-party One Time referral
  candidate/ledger/review-task records. Approved question moderation may create
  or update only private local review tasks/comments. These helpers must not
  create Codex jobs automatically, referral links, rewards/coupons, sends,
  forum posts, public/member visibility, Drive/Sefaria/member-library writes,
  or external CRM records.
- Hebrew menus must be RTL-native, open from the right, and avoid overlapping
  sticky controls on mobile.
- The parent dashboard treats the approved weekly newsletter/update as a
  first-screen hero when that data is available, preferably with pool/swimming
  media and optional talking-head video, plus navigation to prior updates. The
  admin weekly-update data model is live, but actual approved copy/media still
  needs operator selection before the first official update appears.
- Operations Communications > Announcements is the approval workspace for
  parent-visible weekly updates. It should use the in-page candidate/form flow
  with title/body/image URL/video URL readback, `Preview No-Write`, and typed
  `APPROVE_PARENT_ANNOUNCEMENT` local approval. Do not restore native browser
  prompt approval. Preview and smoke paths must use `dry_run: true`; approval
  selects only a local weekly update and must not send email, WhatsApp, social
  posts, Buffer drafts, or external CRM writes.
- Weekly update recipient review is preview-only until Shloimie approves
  recipient policy and send rules. `GET /api/bna/parent-announcements/recipients`
  may show current BNA student parent recipients, signup-only review
  candidates, second-parent/spouse policy candidates, missing-email records,
  and external-accountability exclusions. It must return no-send/no-write flags
  and keep test-send/live-send disabled behind
  `APPROVE_PARENT_WEEKLY_UPDATE_SEND`.
- API Usage may show real available communication/support/activity counts, but
  token, cost, budget, and rate-limit data must stay clearly disabled/not
  configured until a real metering backend exists.
- Parent/student-facing screens must remain usable in English LTR and Hebrew
  RTL. Full admin Hebrew translation is deferred unless explicitly requested.
- Current Operations QA baseline from 2026-06-10: the full professional QA pass
  is recorded at `ops/qa-runs/2026-06-10-operations-full-qa.md`; the latest
  verified production deployment is `ea35c7ae-f36d-4fd1-98f2-4327ceea530e`.
  Future major Operations UI changes should preserve the workspace/role clarity,
  no-visible-TODO, no-overflow, dry-run connector, and role/privacy checks from
  that report.
- Contacts should distinguish current/signed-up parents from separate lead
  categories: `school_interest`, `content_interest`, `group_member`, and
  `accountability_interest`. School-interest and accountability leads are
  BNA-owned CRM records with lead status, interest level, source, notes, next
  follow-up, and optional historical `legacy_crm_*` linkage only. First-party
  BNA Operations remains the canonical CRM.
- Admin > Roles is the read-only policy matrix for workspace access. It should
  keep Super Admin, BNA School Admin/Rabbi, Parent primary contact,
  second-parent/spouse, Student, Service Provider/Rabbi Sheller, Community
  Member, and Codex/Agent lifecycle access states visible without creating
  invitations, login tokens, password resets, sends, access grants, billing
  changes, or connector writes. Second-parent/spouse and community-member
  access remain policy-gated until Shloimie explicitly approves the rules.
- Parent/accountability onboarding at `/parent/login?onboard=accountability`
  writes first-party `bna_parent_leads` rows with
  `lead_type = 'accountability_interest'`, plus a support ticket, lead-linked
  `bna_contact_communications` inbound note, and private in-app Operations
  notification. Its `dry_run` mode is no-write; it must not send email,
  WhatsApp, Telegram, portal messages, create child-visible goals, or write
  external CRM.
- Contacts parent records should expand inside the clicked card itself, not in a
  separate detail panel under/next to the list. Tag filtering and tag assignment
  should use compact dropdowns rather than large piles of buttons. Future
  WhatsApp/WAPI conversation sync should display recent conversation history
  inside the matching parent/lead card after message storage is explicitly
  built.
- Contacts WAPI/local communication history readback is now available both in
  the expanded parent/interested-parent cards and through the
  `show_contact_communication_history` helper action. It matches local
  `bna_contact_communications` by direct first-party IDs, normalized phone
  variants, email/source-address tokens, contact names, and WAPI source context.
  It is read-only/no-send: no Whapi sync, WhatsApp send, broadcast, contact/tag
  write, Google/Drive action, Buffer/social action, or external CRM write.
- UI redesign work must preserve existing data, backend fields, business logic,
  and functionality unless Shloimie explicitly says to remove/change them.
- Operations app sections should show subcategory counts only once, in the
  compact top subcategory buttons. Under those buttons, show the real filters
  for that section, including date and relevant status/category/tag/payment
  filters. Do not add large repeated count cards that only restate subcategory
  totals.
- Operations filters should keep variable option sets in compact dropdowns
  instead of long scattered chip rows. This applies to tags, category, project,
  status, payment, source, method, media type, interest level, and
  accountability state. Fixed date choices may remain as compact date controls.
- Student portal access uses parent-managed student username/password login as
  the primary model, with the existing private access-code link retained as
  fallback/recovery. Student self-reset is out of scope; parents create/reset
  student credentials from the parent portal.
- Student portal data must not load without a valid server-side student access
  credential or valid student session. Invalid, expired, missing, or revoked
  credentials should return generic 401/403-style errors, clear browser-stored
  access codes, and return the child to login. Public Torah displays must show
  cumulative 30-unit trip progress, not daily completion or private goal
  minutes/types.
- Parent portal access is passwordless through short-lived hashed magic links
  at `/parent.html`; Operations can send those links by email or confirmed
  WhatsApp, and the app should not introduce plaintext parent passwords.
- Operations Students > Next Year Login is the governed parent/student rollout
  workspace. Student links may be prepared in bulk, but parent login links,
  parent password setup/reset emails, and WhatsApp login links must stay
  explicit per family. Parent password setup preview uses
  `POST /api/bna/parent-access/password-reset` with `dry_run: true`; real email
  requires the single-family action plus `SEND_PARENT_PASSWORD_SETUP` and must
  not create a bulk onboarding campaign or external CRM/Google/Buffer write.
- Cumulative Torah trip progress counts actual daily completion fractions:
  full daily goal = 1 unit, half = 0.5, two-thirds = about 0.6667. Do not flatten
  multiple students to one uniform completed-unit value unless Shloimie
  explicitly asks for a uniform reset.
- The selected future student accountability base is a mobile student Goal
  Board: school-tracked Torah/morning progress at the top, read-only for the
  student, with student-owned goals below. Google Classroom YouTube assignments
  and private natural-consequence agreements should attach to this board.
  Device/filter consequences require parent/admin approval before any
  device-control action.
- Google Classroom assignment integration should use `CourseWork` with native
  YouTube materials, `scheduledTime`, `dueDate`/`dueTime`, and
  `individualStudentsOptions`; Google Calendar reminders are a separate
  `events.insert` sync against a student/parent authenticated account or a
  writable calendar, where `primary` means the logged-in user's primary
  calendar.
- Public website Blog/FAQ routes are live as a static Express-served layer:
  `/blog`, `/blog/:slug`, `/faq`, `/he`, `/he/blog`, `/he/blog/:slug`, and
  `/he/faq`. Future dynamic blog automation should extend this layer rather
  than recreating a separate blog surface.
- The public domain root `/` must show the public landing page in normal
  browsers, but the installed phone/PWA app should launch Operations. The
  public `/manifest.json` starts at `/operations?source=pwa`, standalone
  homepage launches redirect to Operations, and `/operations-manifest.json` is
  the Operations-specific manifest.
- Homepage Blog cards should stay compact: the public homepage Blog section is
  a horizontal carousel, showing three cards at a time on desktop and scrolling
  for the rest instead of stacking every blog card down the page.
- Accounting can contain admin-created signup placeholders for paid families
  who have not filled out the official signup form. Known information should be
  filled in, unknown parent contact fields may stay blank, and the record should
  not remain in `needs_signup` once the payment/student match is clear.
- Current payment facts after the 2026-06-07 reconciliation: Nikki Weber / Huda
  Weber paid ILS 1000 by Green Invoice on 2026-05-25 and is signup #9; Shalom
  Galambo / Eitan Chaim Golombo paid ILS 1000 cash on 2026-05-25 and is signup
  #10; Braka / Hillel Baraka paid ILS 800 by Green Invoice on 2026-06-01 and
  still owes ILS 200.
- Signup required documents should be signed deliberately, not buried as tiny
  unread checkboxes. The signup flow uses the downloaded 2026-2027 registration
  document package `bnei_neviim_registration_documents_bilingual_codex.md`; do
  not use the old Student Contract file. Parents must open large readable
  document modals, click signature buttons, and the system stores signer
  name/email, server timestamp, client click timestamp, agreement version, and
  a text snapshot in `bna_signup_agreement_signatures`.
- Public signup should show four visible required documents: Handbook, Tuition,
  Waiver, and Student Handbook. Registration/Intake and Parent
  Agreement/Signature Page are hidden/archived reference sections because the
  live signup form and electronic signature flow already capture those details.
- Telegram is the input surface for rambles, decisions, payment notes, and task commands.
- Google Drive is the operator-facing input surface for raw media and website
  images; the dashboard monitors status rather than acting as a manual entry
  screen.
- Drive should not be the canonical source for brand kit, agent memory, or
  transcript text. Those live in GitHub under `brand-kit/`, `content-memory/`,
  and `content-memory/transcripts/`, with the live app database as the working
  transcript source. Drive now also has a readable marketing mirror at
  `BNA V2 / 40 Content Library - Marketing` so Shloimie can browse transcript
  Google Docs, subject breakdowns, and website articles for article generation.
- YouTube playlist transcript uploads are high-value content inventory. When a
  playlist transcript Google Doc/text file appears in Drive Raw Intake or
  Processing, split it into one Content job per YouTube video transcript using
  `npm run content:ingest-playlist-transcripts -- --file-id <drive-file-id>`
  or the same script without `--file-id` for matching Drive docs. Each imported
  video should feed Content cards, class-session notes, blog angles, brand-guide
  themes, recommended outputs, transcript Markdown exports, and the Drive
  marketing content-library mirror. Do not leave playlist transcripts as one
  giant raw transcript blob.
- Current Drive pipeline under `BNA V2`: upload recordings/videos/audio to
  `00 Upload Here - Raw Media Intake`; upload website/blog images to
  `00 Upload Here - Website Images`; processed source media lives in
  `20 Processed Recordings - Source Media`; approved website assets live in
  `30 Approved Website Assets`; readable transcript/article docs live in
  `40 Content Library - Marketing`; old redundant workflow folders and the
  Drive brand mirror live in `_Archive - Legacy Pipeline Folders`.
- One Time Mishnah Class partnership/project material should live in the
  separate Google Drive workspace `My Drive / One Time Mishnah Class - Rabbi
  Elie Scheller`, not in the BNA Academy media pipeline. The canonical folder
  is `https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`.
  A prior BNA-nested draft folder `BNA V2 / 50 One Time Mishnah Class -
  Partnership Project` exists but is not the canonical workspace. Claude or
  another drafting assistant may be used for text drafting, proposal cleanup,
  policy wording, launch copy, and summaries; Codex remains responsible for
  repo, Drive, app, tests, deploys, and verification.
- One Time platform default is internal-first: BNA should own the parent,
  student, Rabbi/admin, meeting, task, assignment, calendar, and messaging
  interfaces. Rabbi Elie already has video/library/statistics tooling, so a
  legacy CRM community or course-builder UI is not assumed necessary.
- One Time first-party capability map lives at
  `ops/one-time-mishnah/first-party-capability-map.md`. BNA Operations can
  safely own scoped contacts, tags, pipelines/opportunities, calendars/classes,
  payment/access readiness, workflow previews, private community/membership
  support, content/media review, Buffer/social previews, and WAPI/local
  communication readback. Rabbi-owned live app, Replit, Vimeo/media host,
  billing, Resend/email, DNS, Google live adapters, Buffer publishing, and
  WhatsApp/Wappy outbound automation remain external/browser-only targets until
  access, approval phrase, rollback, and focused smoke are explicit.
- One Time content/media intake workflow lives at
  `ops/one-time-mishnah/content-media-intake-workflow.md`. The internal-first
  path is Drive drops -> recording/session record -> transcript/source notes ->
  source sheets -> worksheets -> question digests -> organic clips -> ad
  candidates -> approval package -> posting/reporting. It uses first-party BNA
  Operations records until explicit approval; no raw recording, source sheet,
  worksheet, question digest, clip, ad, newsletter, social post, member-library
  item, Google/Drive write, video-host write, Buffer draft/publish action,
  WhatsApp/email send, access grant, or external CRM write should run
  automatically.
- One Time partnership drafting pack lives at
  `ops/one-time-mishnah/partnership-drafting-pack.md`. It is the local
  draft-only handoff for Claude or another writing assistant to produce a
  cleaner agreement memo, values checklist, refund/cancellation options,
  family/device/Zoom/access rules, landing-page copy, launch emails, and
  reactivation copy. Outputs stay in human review; no Drive upload, live page,
  campaign, billing, access, Zoom, Buffer/social, Google, WhatsApp/email,
  member-library, or external CRM action is approved by the pack.
- Operations Admin > Users / External Access is the super-admin surface for
  external project users such as Rabbi/One Time admins. It separates external
  provider/Rabbi users from parent accounts, shows workspace/role/login context,
  and can create a short-lived BNA Operations access link only for configured
  login usernames after an explicit click. It does not create parent accounts,
  Rabbi-owned app credentials, emails, WhatsApp sends, password resets,
  billing links, member-library access, Google/Drive/Buffer writes, or external
  CRM writes.
- One Time meeting recordings should be handled as Content > Meeting Drops:
  structure the relevant Drive/content job into a meeting summary, decision
  list, linked tasks, source-media provenance, and project-scoped follow-up
  under `one_time_mishnah_class`.
- Meeting artifact #1 / Content job #57 is the current One Time build-brief
  seed: next work should start with Rabbi software-stack discovery around his
  library/Vimeo analytics, Google Classroom/Workspace account strategy, Zoom
  scheduling, WhatsApp provider, current website/product tiers, and
  ownership/revenue terms, then build the internal-first parent/student/Rabbi
  admin MVP in first-party BNA Operations.
- One Time user access should stay project-scoped: Shloimie is super admin,
  Rabbi Elie is an external One Time admin, and future BNA versus One Time
  parent/student accounts must be separated by `project_id` and project-level
  login scope.
- Student Operations navigation should be list to student workspace to section
  page. The mobile hamburger should open a full navigation page/state with a
  Back action, not a blocking slide-down/overlay drawer. Student subcategories
  should live in a side/section list with clear Back navigation rather than
  oversized square buttons.
- Google Drive Raw Media Intake is also allowed to feed website updates: single dropped images should be candidates for the public website image/learning-moments lane, and uploaded recordings/videos can be candidates for website blog generation after approval.
- Operations task buckets are Decisions, Pending, and Tasks, with Calendar and
  Done / Activity as supporting views.
- Operations Tasks > Calendar selected-day view should show an exact
  `Selected: Weekday, Month Day, Year` label, Hebrew date/item context, and
  Add Task / Move Selected Task actions. The adjacent Google Calendar control
  is preview-only through `sync_google_calendar` with `dry_run: true` and must
  not create internal calendar events or Google Calendar writes.
- Pending means blocked by a human or external system, such as Rabbi access,
  account approval, payment/email/domain credentials, or legal/accounting
  choice. Pending must not be used for Codex/system work.
- Codex/system work uses agent status (`queued`, `running`, `completed`,
  `failed`, or `blocked_needs_human_decision`) and must auto-spawn an agent job
  when executable. A failed or blocked agent job should create a clear Decision
  or human/external Pending blocker, never a vague "waiting for Codex" card.
- Active task actors include Shloimie, Rabbi/workspace owners, external
  providers/managers, and Codex/internal agents.
- Visible task titles must be refined into normal actionable language; raw Telegram wording belongs only in provenance fields such as `ai_parsed.original_text` or daily memory captures.
- Telegram task captures should not show per-task owner/status buttons. The parser should infer owner and lane automatically, then summarize the routing in plain text.
- If an actionable Telegram ramble is found to have no capture summary/tasks, create a Codex-owned agent-fleet audit/backfill task. The worker should identify the missed message(s), explain why ingestion failed, backfill clean tasks/records, fix the routing gap when feasible, verify, and report completion back to Telegram.
- Telegram should feel like natural conversation first. Do not announce Codex
  background queues for ordinary chat; mention capture only when a real task,
  student note, payment item, content item, or decision was created or needs
  action.
- Telegram should keep persistent bottom buttons for `Assistant` and `Codex`.
  `Assistant` means provider-neutral hosted chat mode for normal users: OpenAI
  when healthy, or Kimi during approved temporary Kimi-primary mode/fallback.
  Clear repo/code/database/bridge/deploy/test/programming requests still route
  to Codex automatically. Pressing `Codex` forces Codex replies until Assistant
  chat mode is selected again.
- Prompt-building requests for Codex or ChatGPT should stay in visible
  planning/refinement mode first: show the prompt/brief draft in Telegram,
  preserve the raw operator input as provenance, and only implement after
  Shloimie explicitly says to build, apply, run, test, or implement.
- Telegram Assistant capability must be verified by a real smoke test, not
  assumed. Use `npm run openai:smoke -- --telegram` locally, or Telegram
  `/smoke_assistant`, to confirm the hosted assistant can read repo memory/task
  files, transcript exports, protected BNA app APIs, Drive folder metadata,
  live task/student/payment/Torah data, and send a Telegram summary. The smoke
  report writes to `ops/openai-smokes/`.
- Telegram Assistant mode should use hosted web research when available for
  current-information, API/framework, YouTube/research-tooling, SEO/AEO/GEO, and
  similar questions where live outside information matters. It should combine
  web results with BNA repo/app/Drive context, not replace local context.
- Agent outputs sent to Telegram or visible task notes must be concise
  summaries. Raw Codex CLI prompts, stack traces, and long logs belong in report
  files under `ops/agent-fleet-runs/`, not in `verification_notes` or Telegram
  messages.
- Telegram completion replies must explicitly say when a requested test, fix, deploy, or verification was accomplished, with the concrete verification result.
- When Shloimie says `build everything`, he means Codex should choose the order,
  start working through the queued tasks without asking for ordering
  confirmation, and report back as tasks are completed or verified.
- Codex-owned queued work should be handled by the autonomous agent fleet when
  possible. The fleet claims live Operations Changelog Queue tasks, uses a lock
  so only one worker edits the repo at a time, runs Codex CLI, runs verifier smokes
  such as `npm test` and `npm run openai:smoke`, writes
  `ops/agent-fleet-runs/`, appends `ops/agent-changelog.md` and
  `ops/agent-task-ledger.jsonl`, updates the live task, and notifies Telegram.
  Commands: `npm run agent:fleet:status`, `npm run agent:fleet:once`,
  `npm run agent:fleet:start`, or Telegram `/agent_fleet_status`,
  `/agent_fleet_once`, `/agent_fleet_start`.
- Content generation must read brand memory before drafting: `brand-kit/`, `content-memory/platform-prompts/`, platform examples, and recent approved outputs.
- BNA public content should sound like Shloimie: professional, direct,
  grounded, parent-friendly, concise, Torah-aware when the source is
  Torah-based, slightly poetic only when it sharpens the truth, and specific to
  what happened at Bnei Neviim Academy. Public daily social posts should
  usually open with `Today at Bnei Neviim Academy,`; weekly recaps with `This
  week at Bnei Neviim Academy,`. Avoid generic school-brochure copy, vague
  inspiration, overpraise, private student accountability details, and setup
  lines like "we turned the conversation into..." - state what was discussed or
  learned directly.
- Content prompt improvement should be feedback-driven: after viewing a generated
  output, Shloimie should write what he dislikes in the inline correction box
  and use one regenerate action. If a correction is present, the app patches
  and versions the saved platform prompt first, then regenerates the output
  from that better prompt. Manual examples/files stay available separately, and
  approved outputs remain reusable examples.
- Parent WhatsApp updates from a video should preserve the video's main message first. If the recording has one main concern such as sleep/routines, summarize that first, then add a separate "Other things we did" section for weekly topics and activities.
- Video captions for parents should use Shloimie's concise newsletter tone:
  bullets about the video first, then a compact weekly recap. Avoid fluffy
  lines such as "the practical message is simple", "that is very special", and
  "if Torah really matters, the basics have to support it"; state the sleep,
  breakfast, food, screens, and routine points directly and professionally.
- Content is not a task, goal, or accountability lane. Content should show teaching philosophy, actual class topics, verses/sources learned, class discussions, and class questions only. Operator tasks go to Tasks; named student goals, progress, meetings, attendance, and follow-ups go to Students.
- Public/Torah content drafts must silently exclude staff-only operational remarks, backend notes, admin notes, task instructions, UI fixes, prompt/parser comments, dashboard work, Codex/system work, attendance tracking, accountability progress, and learning-progress data. Those items route to staff tasks/decisions/student records instead. Do not add public meta disclaimers such as "technical or administrative remarks are excluded."
- Content jobs need a future website-blog lane: approved recordings/videos/content should be convertible into public blog posts that update the website blog index and article routes.
- Telegram audio/day recordings may include student accountability and Torah goal reports. The parser should extract which boy did what, daily completion ratings, tasks/follow-ups, and update private accountability records without exposing private goal details publicly.
- Public website SEO content now includes static Blog/Article/FAQ routes:
  `/blog`, `/blog/:slug`, `/faq`, `/he`, `/he/blog`, `/he/blog/:slug`, and
  `/he/faq`. Homepage remains short and links into deeper philosophy articles.
- Admissions and marketing availability copy should say there are 7 spots left
  at the current pre-registration/current tuition rate, not that BNA only has
  7 seats total. BNA may consider more families later at a higher rate. Primary
  CTA language: English `Register for This Year`; Hebrew `הרשמה לשנה הקרובה`.
- Public marketing copy should use positive positioning: say BNA is for boys
  ready for something more than regular school, not "boys who don't fit the
  system" or Hebrew equivalents such as boys who do not fit/find their place in
  the system.
- Homepage hero design preference: no gray CTA band/slab over the photo. Keep
  the first-screen hero focused on one small primary contact/call action, with
  registration available in the top navigation.

## My Role (AI Sidekick)

- Run entire repo and database
- Build and operate first-party BNA systems and approved connectors
- Handle marketing systems
- Build/manage task managers
- Build school website
- Be operator's sidekick across terminal and Telegram
- Track ALL tasks from rambles
- Coach operator: present options, encourage, push, challenge
- Ask follow-up questions to maintain momentum

---

# BNA / Whole Child Torah Learning Community

## Core Identity

**What This Is:**
A family-based Torah learning community rooted in Mesorah, intrinsic motivation, self-governance, and whole-child growth.

**What This Is NOT:**
A traditional school. Schools are historical compromises. Torah education is family-centered, relational, and choice-driven.

**Core Claim:**
"School trains compliance. Torah trains leadership."

## Educational Philosophy

### Foundational Pillars

1. **Family as root of education** - "Veshinantam"; "Chinuch al pi darko"
2. **Real-life learning** - "Every problem is curriculum"
3. **Connection before correction** - regulate → relate → reason
4. **Self-governance** - Structured freedom + accountability
5. **Middos as measurable** - Values operationalized into behaviors
6. **Body/brain/Torah** - Health as infrastructure for learning
7. **Tech/AI & Geulah readiness** - Torah as master OS

### Key Principles

- **Intrinsic motivation** - Real learning only happens when child wants to learn
- **Self-governance** - Child learns to notice internal state, regulate emotions, take responsibility
- **Leadership (not obedience)** - Torah assumes leadership development is the goal
- **Emotional regulation** - Learning impossible without emotional safety
- **Whole-child integration** - Mind, heart, body, identity, purpose
- **Real work/apprenticeship** - Father's obligation to teach trade is Torah-grounded

### Target Audience

Jewish boys (ages 8-16, flexible)
Families dissatisfied with institutional schooling
Boys who are: intelligent but disengaged, sensitive/strong-willed, under-challenged

## Programs/Offers

1. **Learning Community (Beit Shemesh)**
   - Small Torah groups (3-6 boys, 45-min sessions)
   - Coaching groups (regulation, identity, life skills)
   - Physical integration (movement, exercise)

2. **Family Coaching + Parent Partnership**
   - Parent onboarding/coaching
   - Community as extension of family system

3. **Service Provider Network**
   - Curated providers (therapists, coaches, tutors, mentors)
   - BNA should have a service-provider login and approved-provider directory
     for classes/services such as math tutoring, electronics groups, therapy,
     coaching, and Rabbi-led learning offerings.
   - Providers can be connected to a Rabbi/subscription context. Families
     subscribed through that Rabbi should receive the configured discount on
     the provider's service.
   - BNA may optionally run provider billing, management, and marketing for an
     external admin fee or through the marketing-agency lane.
   - Parent portal should expose the approved provider index to parents, linked
     to their own student/family account, with filters for location/city,
     near-me radius, service type, price, child age range, group size/capacity,
     and available class options.
   - First seeded provider/class option to account for: the 7:00 Rabbi Scheller
     Mishnah class.

4. **Affiliate Business Apprenticeship**
   - Student teams do real work for real businesses

## Visual Brand (LOCKED)

- Hand-drawn pencil sketches
- Monochrome graphite with sepia
- Parchment shading
- Calligraphic handwriting
- Torah scroll aesthetic
- UI/control colors are documented in `brand-kit/09-visual-design-tokens.md`:
  primary blue `#1e3a5f`, secondary blue `#2c5282`, accent gold `#c9a227`, soft
  blue `#e8f0f8`, parchment `#f7f3e8`, and crisp white/ink neutrals. Blue/gold
  is the control and system palette; it does not replace the graphite/sepia
  hand-drawn visual identity.

**NOT:** Stock photos, corporate polish, bright colors, generic Jewish clipart

## No-GHL Status

- As of 2026-06-14, GHL, GoHighLevel, LeadConnector, and LeadConnectorHQ are
  not active BNA runtime, social posting provider, CRM source of truth,
  dashboard dependency, Telegram action path, smoke target, or MCP server.
- Archived legacy code lives under `docs/archive/legacy-ghl/` for reference
  only. Do not revive it unless the operator explicitly creates a new task to
  inspect historical data or export records.
- BNA-owned contacts, leads, students, learning communities, provider listings,
  provider messages, parent/provider portals, tasks, communications, and
  internal dialogue belong in first-party BNA Operations tables and APIs.
- Buffer is the active social scheduler connector. Whapi/WAPI is the active
  WhatsApp API path. Gmail/Google APIs, Green Invoice, Vimeo/Replit/provider
  apps, and future review widgets are connector candidates, not canonical CRM.
- Existing old CRM identifiers in production data should be treated as
  historical `legacy_crm_*` references only. Do not write new records back to
  retired GHL/LeadConnector systems, create tags there, depend on PIT tokens, or
  expose retired setup controls in Operations.

## Non-Negotiables

1. No humiliation, no public shaming
2. No bribing for Torah or basic responsibilities
3. Family is primary; school is secondary
4. Intrinsic motivation over control
5. Real responsibility over fake performance
6. Daas (integration) over information
7. Connection before correction
8. Autonomy with accountability
9. Torah as life, not curriculum
10. Dignity of child, parent, rebbe
11. Parents must enter the process, not outsource

## Statement of Continuity

"Bnei Neviim is no longer a building. It is a living transmission -- from rabbi to parent, from parent to child, from Torah to life. The school was never the point. The relationships were. The growth was. We are not closing a school; we are widening a doorway."

## Business Model

**Phase 1: House-Based (Now)**
- 10 kids × 1,000 shekels/month = operator's living money
- Default monthly tuition tracking is 1,000 shekels/month
- Reinvest ALL revenue into marketing
- Target: 10-15 kids

**Phase 2: Scale & Fundraise**
- Drive to 50 signups
- Approach rabbi/donor with proof of demand
- Fundraise for proper facility

---

## Technical Infrastructure

### Completed ✅
- Kimi 2.6 model configured
- Desktop shortcut created
- Master document discovered and parsed
- Visual QA toolchain installed (Playwright, Lighthouse, Prettier)
- Screenshot testing script (`npm run screenshot`)

### Required Toolchain for UI Work
**ALWAYS use these tools for any visual changes:**

1. **Playwright** - Screenshot testing across viewports
   ```bash
   npm run screenshot  # Captures 360/390/430/768/1440px widths
   ```

2. **Lighthouse** - Performance/accessibility audits
   ```bash
   npm run lighthouse  # Generates report
   ```

3. **Prettier** - HTML/CSS formatting
   ```bash
   npm run format      # Formats public/index.html
   ```

4. **MCP Browser Tools** - Live inspection
   - Chrome DevTools MCP for computed styles
   - Playwright MCP for interactive debugging

**Rule: No CSS changes without screenshot verification.**

### Multi-Agent Memory Strategy

**Current:** File-based (AGENTS.md, MEMORY.md, TASKS.md, memory/YYYY-MM-DD.md)

**Future Options (ranked):**

1. **Enhanced File-Based** (Now)
   - Create CLAUDE.md that imports AGENTS.md
   - Add shared-context.md for runtime state
   - Works with both Kimi and Claude today

2. **MCP Memory Server + Postgres** (When needed)
   - Use `@modelcontextprotocol/server-memory`
   - Knowledge graph with entities/relations/observations
   - Requires Kimi CLI MCP support (not yet available)

3. **Mem0 Self-Hosted** (Scale phase)
   - Universal memory layer with semantic search
   - Docker compose: Postgres + Qdrant
   - Best for multiple operators

**Recommendation:** Stick with file-based until MEMORY.md exceeds 200 lines or you need semantic search ("what did I say about marketing last month?").

### Railway Hosting (Completed ✅)
- Railway account created
- 9 environment variables configured
- Auto-deploy from GitHub enabled

### Telegram Bot (Configured ✅)
- Bot token: `@bneineviimacademy_bot`
- Chat ID: 8202155026
- Features: academy-sidekick chat, Buffer account commands, media intake, social job queue
- Natural language parsing for rambles plus structured Telegram ops commands

### Social And First-Party Runtime
- Buffer is the active social scheduler for Facebook, LinkedIn, and YouTube.
- First-party BNA Operations is the CRM/community/provider runtime.
- Retired GHL/LeadConnector code is archive-only and should not be used for new
  runtime paths, smoke checks, MCP tools, dashboard controls, docs, prompts,
  routes, or Telegram commands.
- Live publish/send actions still require explicit operator approval.

### Kimi Runtime Note

- Local Kimi Code CLI is configured to use `kimi-k2.6`
- App-side AI config had been left on `kimi-k2.5`, which created confusing
  behavior across tools; keep repo-side Kimi settings aligned where possible

### Domain
- bneineviimacademy.org is the live production domain.

### Current Technical Blockers
- Hosted media URL support for Buffer media publishing from local uploads.
- Google posting alias/default selection for multiple connected Google accounts.
- Rabbi Elie Scheller live bot token/chat credentials and scoped login.
- Physical tablet plus QStudio/Qustodio/Headwind/FreeKiosk credentials for real
  device-control verification.
- Green Invoice sender-side delivery logs/settings access.

---

## Holy Flow Task Pipeline System

## Public Website Current State

- The homepage source is `public/index.html`.
- The homepage now has a schedule/goal/media section named `program-pulse`.
- "The image slider" means the Learning Moments carousel in `public/index.html`.
- Learning Moments data lives in the `learningMoments` JavaScript array.
- Current public carousel images live in `public/images/learning-moments/`.
- The current homepage 30-page goal progress is 3.5/30 pages.
- Monday and Wednesday are forest learning days; other days meet at HaChozeh MiLublin 7.

### Pipeline Stages
1. **Inbox** - Raw captures from rambles/Telegram
2. **Clarify** - Needs clarification/validation
3. **Plan** - Steps defined
4. **Execute** - Active work
5. **Review** - Done, needs verification
6. **Complete** - Verified complete
7. **Archive** - Historical record

### Task Categories
- admin, marketing, parent_coaching, student_operations
- finance, legal, communications, operations
- content, technology, accounting, community_setup, community, general
- torah_class_prep, torah_research, source_sheets, shiur_ideas

### Ramble Protocol
- Capture raw text/voice in `bna_ramble_raw` table
- Auto-parse for: urgency, category, steps, entities
- Create task in Inbox with extracted metadata
- Present for operator confirmation

### Event-Driven Architecture
- No cron jobs (avoid API usage burn)
- Webhook-triggered actions only
- Telegram bot: inline buttons link to Operations dashboard
- WAPI, Google, Green Invoice, and approved first-party webhooks only

---

## Content Parsing And Operations UI Preferences

- Operations Content collapsed cards should be scan-friendly: English title, uploaded time, status/media chips, and only very short topic labels.
- Do not show raw transcripts or long transcript-like bullets in collapsed Content cards.
- Expanded Content cards may show fuller explanations, questions/discussions, sources, highlights, next steps, and prompt/output controls.
- Content Library v2 should become a normalized, source-aware knowledge library,
  not only a draft-generation pipeline. The target model is content jobs to
  segments, ideas/punchlines, claims, sources, research tasks, taxonomy tags,
  and repurposing assets.
- Content topics should come from controlled taxonomy records and reviewed
  `bna_content_job_terms`, not display-side regex inference. Regex labels are
  acceptable only as temporary fallback for old or unparsed items.
- Torah content needs first-class metadata for area, masechta/daf, parsha,
  halacha refs, Sefaria refs/source sheets, source status, and open rav/Shloimie
  review points. ADHD/science/nutrition claims need source type, source status,
  claim strength, and medical-disclaimer flags to prevent overclaiming.
- Content Library v2 must preserve existing `bna_content_jobs`,
  `bna_content_outputs`, Prompt Studio, bundles, WhatsApp/Facebook/newsletter/
  blog generation, and ingestion workflows while adding normalized records and
  backfill.
- Mixed uploaded audio/video/text recordings should route items by type:
  - Human choices go to Decisions with clear options and owner.
  - Human/external blockers go to Pending with `waiting_on` and the exact
    missing access/input.
  - Actionable operator/provider/agent work goes to Tasks; executable Codex
    work should spawn an agent job immediately.
  - Named student accountability, goal updates, and Torah progress go to Students/accountability records, not general tasks.
  - Halacha/source lookup questions that Shloimie marks for research go to Tasks as `Torah Research` / `torah_research`, assigned to Codex. The task must preserve the exact question, use Sefaria/source research, include direct Sefaria links, include a source map and summary of where each source is found, and flag open points for Shloimie/rav review instead of presenting automated final psak.
  - Student philosophy/hashkafa/curiosity questions stay in Student Questions or class notes unless Shloimie explicitly marks them as halacha/source lookup work.
- Student Analysis notes are admin-only private accountability events with
  `metadata.kind = "student_analysis"`. Use them for dated behavior/focus
  observations and correction paths. They must be visible in Operations
  Students/Admin views and must not leak into the student portal, public
  website, or content lanes.
- The Tasks dashboard primary structure is Decisions, Pending, and Tasks.
  Waiting for Shloimie/Rabbi/External and Agent Working are filters or metadata,
  not primary columns. `tasks-pending/*.md` files are internal Codex handoffs,
  not an operator-facing workload section.
- Bulk task-title cleanup should run through `npm run task:title-cleanup` first.
  The script is dry-run by default, skips closed tasks unless explicitly
  included, excludes full raw operator wording from reports, and requires
  `--apply --confirm APPLY_TASK_TITLE_CLEANUP` before patching live tasks.
- Single task retitles can use the typed helper action
  `retitle_task_naturally`. It is approval-gated, requires a specific task id
  and clean replacement title, rejects raw ramble-looking replacement titles,
  and preserves the previous title only as a truncated provenance preview.

## Remotion Video Editing Workflow

- Telegram should be the main command surface for Remotion video editing.
- The operator expects to be able to tell Codex, in plain English, what should happen in a video and have Codex translate that into Remotion timeline/props/render work.
- Canva is a separate connected design/editor API lane; use it when the operator explicitly wants Canva, but do not confuse it with the repo's Remotion natural-language video editor.
- For the current organic short-form content workflow, the operator meant CapCut, not Canva. Treat CapCut as the manual/editor finishing lane for AI clip picking, auto captions, transitions, templates, and quick polishing; use Remotion for repo-controlled automation and repeatable rendering.
- Source videos are expected to arrive through Google Drive `BNA V2 / 01 Raw Intake`, local `media-drop/inbox`, or small direct Telegram uploads.
- Natural-language edit commands should support timeline edits such as speed changes, trims/cuts, image overlays, audio overlays/background music, subtitles, transitions, zoom/focus, and brightness/contrast adjustments.
- Rendered MP4s should be sent back to Telegram when small enough; larger renders should be saved locally and reported with their file path.

## Organic Short-Form Content Mission

- BNA's near-term marketing push is constant high-quality organic content that helps interested families understand the school and drives student signups.
- The desired repeatable format is roughly 22-second vertical clips from older and new raw videos/images: Torah learning/classroom energy, short text/caption overlays, quick transitions, rock-style background music when appropriate, and a final flyer/update card.
- The operator wants to be able to drop raw videos or folders of images into Drive/local intake and have Codex prepare usable social clips or a CapCut-ready handoff without manual asset hunting.
- Image folders should be usable as clip sources: chunk screenshots/images into short segments, often around two seconds each, with text overlays and transitions.
- Preserve a CapCut-friendly path for manual finishing, but do not depend on unofficial CapCut automation APIs for the core production workflow.

## Telegram Development Agent

- Plain Telegram messages to the academy bot should use hosted API chat first
  for ordinary conversation, tone/content refinement, and brainstorming:
  OpenAI normally, Kimi temporarily when `BNA_AI_PRIMARY_PROVIDER=kimi`.
- For dashboard/system questions, OpenAI must receive and use the live Operations
  snapshot first: sections, subtabs, visible actions/buttons, task lanes,
  task records/comments, students/accountability, content/prompts/bundles,
  contacts/accounting, devices, agent fleet status, and recent updates.
- Transcript/topic inventory should only answer explicit transcript/class-content
  requests. Logistics, scheduling, pending/queued work, section ordering, task
  audits, and dashboard questions should use live app/system data instead of
  transcript summaries.
- Development conversations should still feel like talking to Codex in the repo:
  Codex may inspect, edit, test, and summarize work when the operator asks for
  repo, code, database, bridge, deploy, or dashboard changes.
- Kimi remains fallback only for API/model-provider failures or legacy records
  unless `BNA_AI_PRIMARY_PROVIDER=kimi` is explicitly set as the current
  temporary primary-provider override.
- Operations Decisions must only contain real human choices, ideally with
  explicit options and a clear owner. Actionable requests that Codex can execute
  should become Tasks with an agent job; human/external blockers should become
  Pending with a precise `waiting_on`; nothing should sit in a vague
  pending/decision state without a concrete choice or blocker.
- Operations task details should support inline comments from the expanded row,
  and dashboard refreshes must preserve active Windows+H dictation/text entry by
  deferring full re-renders while an input, textarea, contenteditable field, or
  composition session is active.

## Current Accounting Facts

- As of 2026-06-07, Naomi/Mordechai Braka for Hillel Baraka is partially paid:
  ILS 800.00 via Green Invoice transaction `DP488806585` on 2026-06-01 09:16,
  with ILS 200.00 still due against the ILS 1000.00 registration balance.
- Nikki Weber / Huda Weber and Shalom Galambo / Eitan Chaim Golombo have been
  reconciled into paid signup/payment rows (#9 and #10). They should not appear
  as unpaid balances or `needs_signup` intake records.
- New payment-link rule from 2026-06-08: new signups should be charged
  immediately, then charged again on the first of the month with a 12-payment
  schedule; existing credit-card parents should receive a first-of-month link
  with no immediate charge. Do not send links or charge anyone without explicit
  operator action.
- For the next parent registration/payment email, prior payments should be
  described as covering the end of May and June; July 1 starts registration and
  the billing cycle for the coming school year. The full school-year tuition
  framing is ILS 12,000, with prorated billing structure details to be included
  in parent-facing renewal copy.

## Parent And Student Portal Requirements

- Parent portal login links sent from Operations should use the parent email on
  file and should open the parent portal directly from that emailed link without
  asking the parent to type their email again.
- Student-facing Torah/source references should display Hebrew source refs when
  available, even if the student portal language is set to English.
- Student and parent portal dashboards should surface weekly private meeting
  information, goals between meetings, attendance, questions/sources, and a
  simple WhatsApp path to Rabbi Shloimie for questions.
- Active boys should each have a weekly private meeting slot between 9:00 and
  10:00, roughly one student per day while the roster remains around five boys.
- Accountability records need an internal/external distinction: BNA school
  students are internal/school accountability, while non-enrolled family or
  external accountability people should be tagged and filterable as external.
- Parent-facing accountability should include bedtime/agreement entry for the
  commitments parents and children make together, connected to parent weekly
  meetings, Rabbi weekly meetings, and student goal displays.
- Parent-created accountability from parent portal chat or uploaded parent
  meeting recordings should be parent-visible immediately but student-hidden
  until Rabbi/admin approval when the item affects student-visible goals,
  consequences, permissions, or incentives.
- Parent portal should allow parent-specific natural-language parser
  instructions for each child. Parent uploads and parent chat are
  accountability-only inputs and must not create marketing/content jobs.
- Parent, student, and service-provider portals should be natural-language
  first in English and Hebrew: the assistant welcomes the user, explains what
  the app does, walks through setup, guides recording uploads, captures goals
  and prompt/instruction preferences, and turns the conversation into durable
  scoped records.
- The first deployed student onboarding layer is coaching-only: student
  help/setup questions explain Today, goals, daily checkoff, questions,
  reflection, and Rabbi/Shloimie messages before generic ticket fallback, but
  they do not create support tickets, profile/goal rows, checkoffs, messages,
  sends, or external connector writes.
- Parent/family onboarding should teach the BNA self-governance model:
  children take responsibility through clear goals, check-ins, reflection,
  parent/Rabbi review, and ownership of commitments rather than hidden control
  or punishment-only automation.
- Public website parent/accountability links should also support a
  conversational pre-login intake that asks what the child is struggling with,
  goals, motivators/interests, chores/responsibilities, meal/eating preferences,
  recording/setup context, and saves a durable setup request for review.
- Hebrew-speaking parent portal records are identified by Hebrew signup
  language or tags such as `hebrew_form`, `hebrew_speaking`, `ivrit`, and
  `parent_portal_hebrew`; those records should default the parent portal to
  Hebrew/RTL while preserving an English toggle.
- Kosofsky/Amitai parent portal records should default Hebrew when tagged as
  Hebrew-speaking.

## Dratler Records

- Menachem Mendel Dratler is an internal BNA school student/accountability
  record.
- Ahuva Dratler is Menachem's mother and parent-portal contact. As of
  2026-06-15, the corrected live Ahuva parent portal email is
  `ahuvadratler@gmail.com`. The older `hahuvadratler@gmail.com` spelling was
  corrected in live Dratler parent access records; the previous Shloimie
  signup contact remains preserved in notes.
- Esti Dratler is a separate external accountability person, not a BNA
  school-enrolled student. Her record is tagged `external-accountability`,
  `external`, `dratler`, `girl`, and `not-bna-school`; her email is stored as
  `estidratler@gmail.com`. As of 2026-06-15, Ahuva was cleared from Esti's
  parent-login fields so Ahuva's parent portal links resolve through Menachem.
- Menachem live Goal Board item #81 is `Floor cleanup and bed by 10:00 PM`,
  section `personal_home`, subsection `Chores and bedtime`, parent-visible and
  student-hidden pending Rabbi/admin review. Checklist: clean up the floor
  before 10:00 PM and be in bed by 10:00 PM. Agreement bedtime is `22:00`.
  Consequence under review: no going out the next day if the floor is not
  finished before 10:00 PM.

## One Time Mishnah Class And Rabbi Elie Scheller

- The existing Mishnah/Mishna project/filter should be standardized as `One
  Time Mishnah Class`; short display name may be `One Time`.
- The 2026-06-14 white-label/onboarding/Google/content superprompt is now an
  active Codex build brief for One Time/BNA continuation work. The canonical
  internal handoff is
  `tasks-pending/2026-06-14-rabbi-sheller-whitelabel-onboarding-google-content.md`;
  the original source file path is recorded there rather than copied into
  visible task titles.
- Do not create a duplicate project if the existing Mishnah/Mishna filter already
  represents this work.
- Rabbi Elie Scheller should eventually have scoped access to the One Time
  Mishnah Class task manager: view/create/comment on tasks, brainstorm, turn
  discussions into tasks, mark decisions, and see tasks assigned to either him
  or Shloimie within that project.
- Rabbi Elie Scheller should be treated as the first external user/account, not
  as a parent. Shloimie is the super admin who can manage Rabbi Elie's account.
- The app needs a broader Users/accounts model: BNA parents and BNA students are
  separate from Rabbi Elie's One Time parents and One Time students.
- One Time should be treated as the first real service-provider/white-label
  workspace: Shloimie is platform super admin/admin manager, Rabbi Elie is a
  scoped provider/teacher admin, and One Time members/students/parents must not
  see BNA private students, accounting, family accountability, or Shloimie's
  super-admin data.
- Rabbi Elie needs his own scoped parent and student sections under the One
  Time account/project. Do not mix those records with BNA school students or BNA
  parents.
- One Time task categories should include Marketing, Content, Technology, Admin,
  Accounting, Community Setup, Community, General, Torah Class Prep, Source Sheets,
  and Shiur Ideas.
- Rabbi Elie's scoped workspace should reuse the BNA task-management machinery
  where possible: tasks, comments, natural-language task updates, parser
  routing, watchdog-style monitoring, and Telegram/API access.
- Rabbi Elie needs a support ticket path for broken-system reports. Tickets
  should route quickly to Shloimie/Codex and should be distinct from Torah
  class/project tasks when the issue is about the system not working.
- Rabbi Elie Scheller should have his own scoped agent configuration/memory area
  using the same Telegram/agentic framework as Shloimie where possible.
- Rabbi Elie Scheller's bot should be scoped to One Time Mishnah Class and
  should not expose BNA private Students, Accounting, Devices, or student
  accountability areas unless explicitly granted later.
- The Rabbi Elie Scheller scoped Telegram profile is wired as
  `npm run telegram:rabbi` / `npm run telegram:rabbi:start`. It uses
  `agents/rabbi-elie-scheller/` context, scoped One Time Operations credentials,
  and separate runtime lock/mode files. The local Rabbi bot token is configured
  and smoke-tested. Railway production has the Rabbi bot token,
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`, and generated
  `ONE_TIME_OPS_USERNAME` / `ONE_TIME_OPS_PASSWORD` values. Live bot startup now
  intentionally refuses to run until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` (or
  an accepted alias) is set and a hosted bridge runtime is chosen/started.
- One Time automation should reuse the Holy Flow agent-loop pattern as a design
  source only: task deck, one workflow at a time, observe-before-act, API first,
  operator walkthroughs for OAuth/vendor gates, and explicit confirmation
  before any external connector writes. Do not add new GHL/LeadConnector writes.
- One Time live site/payment behavior is preview-first: preview landing pages,
  offer copy, pricing, checkout/payment links, and public replacement require
  Shloimie approval before going live. The video library supports the live
  Mishnayos/community offer but should not replace the main membership CTA.
- One Time billing must use exactly one provider of record per live product/
  plan. As of 2026-06-15 the provider is still undecided, with Green Invoice,
  Stripe, and a short manual bridge documented as options in
  `ops/rabbi-scheller/green-invoice-billing-options.md`. Checkout, payment
  links, refunds/cancellations, subscription status, member access, and rollback
  must not be implemented until Shloimie approves the provider, price/currency,
  first-cycle rule, subscription anchor, refund policy, access-start rule,
  failed-payment grace policy, support owner, and rollback/revoke owner.
- The BNA preview funnel has a scoped One Time Mishnah onboarding intake at
  `/one-time-preview#one-time-onboarding` and
  `POST /api/one-time/mishnah/onboarding`. It may create only first-party,
  One Time scoped review records: parent lead, Rabbi provider-workspace
  contact, internal transcript/note, support ticket, and Shloimie/Rabbi
  follow-up task. It must not create checkout, grant access, send email,
  send WhatsApp, post publicly, or write to an external CRM without a later
  explicit approval path.
- One Time content intake should support Drive/upload to transcript, library
  card, worksheet/source-sheet draft, newsletter/social drafts, approval queue,
  and workspace-scoped publishing.
- The canonical separate One Time Drive workspace was rechecked on 2026-06-10
  with `npm run drive:setup-one-time`: `My Drive / One Time Mishnah Class -
  Rabbi Elie Scheller` exists, the exact final proposal
  `Rabbi_Sheller_Shloimie_50_50_Full_Workflow_Proposal_2026-06-10.docx` is the
  canonical Start Here copy, the original upload is preserved, and the June 9
  draft plus superseded generic copy are archived under Historical Drafts.
- Rabbi Elie's scoped login must be sent last: finish the One Time Drive/social
  ingestion setup first, have Shloimie confirm social destinations, ask Rabbi
  for the best email address in WhatsApp, store Rabbi email/WhatsApp/login
  fields on the scoped records, and only then send scoped login information.
- First-pass One Time external portal/ticketing shipped on 2026-06-10:
  Rabbi's scoped Operations login is `one_time_admin`, allowed views are Tasks,
  Students, Content, Contacts, Accounting, Support, and Roadmap, One Time
  parent/student/task/comment/support-ticket APIs are project-scoped, support
  tickets can hand off high/blocking or bot/task/automation issues into Codex
  tasks, and the scoped Telegram bridge can create support tickets from
  `/ticket` or clear broken-system language.

## UX Audit Artifacts

- The full app click-map audit for the current SaaS/CRM UI is saved at
  `ops/ux-audit-runs/2026-06-11-click-map/` and mirrored to Google Drive:
  `BNA UX Audit / 2026-06-11 Click Map`
  (`https://drive.google.com/drive/folders/1HH-8ZFBj2ZrdCq_keQeiGZsAouaAo1dG`).
- That audit is intentionally not a redesign. It is the traceable map for the
  next implementation prompt: screenshots, routes, actions, flows, issues,
  role/workspace matrix, bot-placement audit, and prioritized backlog.

## Provider Join / Portal

- Service providers can self-join without screening for now. Public provider
  signup creates an active free listing and provider workspace immediately; BNA
  can pause, reject, hide, or archive providers later.
- Public provider join should stay short. The current conversational intake asks
  10 questions and leaves languages, ages, pricing, images, discounts, and
  other polish for the provider portal.
- Provider join sends a provider portal setup email after the provider record is
  committed. Provider setup links use `bna_provider_password_setup_tokens`,
  land on `/provider?setup=...`, set `bna_service_providers.password_hash`, and
  sign the provider into the scoped provider portal.
- Operations provider workspace cards can resend a setup email through
  `POST /api/bna/service-providers/:id/setup-email`. Do not expose raw setup
  tokens in chat, tracked files, screenshots, task titles, or logs.
- The provider onboarding/integrations foundation is live-smoked on production:
  public `/api/service-providers` must stay sanitized, `/service-providers`
  and `/providers/join` remain public onboarding surfaces, and `/provider/login`
  remains the scoped provider portal entry. Verification must stay no-write
  unless explicitly testing provider signup or messaging.

## Public / Portal Privacy Rules

- Public and unauthenticated routes must never hydrate real parent/student
  records from cookies, query parameters, local storage, or stale browser state.
- `/parent/login?onboard=accountability` is a public intake/onboarding route;
  it must keep the login/onboarding shell visible and must not auto-render the
  private parent portal even when a valid parent session cookie exists.
- `/student/login` must show the access-code login shell unless a current code
  is explicitly supplied or entered; stale `bnaStudentAccessCode` values should
  be cleared instead of auto-opening a student board.
- Non-student public/parent/provider/signup pages should clear saved student
  access codes so a previous student session cannot influence public assistant
  or page context.
- Public registration document pages under `/documents/registration-document`
  are non-student public pages and must clear stale `bnaStudentAccessCode`
  values before rendering.
- Student-audience portal payloads should not include parent email, parent
  phone, or other parent contact fields. Parent-audience portal payloads may
  include scoped parent/student fields after parent authentication.
- Student portal Hebrew/RTL behavior is fixture-smoked on production with
  screenshots. Student-facing answer prefixes, Rabbi WhatsApp CTAs, calendar
  labels, helper text, and source labels should use the student i18n label map
  instead of hardcoded English when the portal is in Hebrew.

## Google Integration Rules

- Natural-language Google commands still require OAuth scopes for execution.
  BNA should preview/dry-run Google actions now, run them only for connected
  test users where configured, and prepare public verification later.
- Google OAuth must default to least privilege: identity-only
  `https://www.googleapis.com/auth/userinfo.email` unless a specific
  Calendar, Classroom, Drive, or Google Business Profile test-user smoke has
  an explicit feature/scope/setup request and owner-approved target/rollback.
  Do not reintroduce Gmail, broad Drive, Classroom roster, guardian, grade, or
  profile-email scopes as defaults.
- Operations > Integrations > Google is the canonical Google readiness surface
  for Drive, Calendar, Classroom, and Google Business Profile. Settings >
  Google Workspace is only a compatibility mirror. The surface previews and
  dry-runs only until OAuth/test-user/scope approvals are explicit; no Google
  API read/write/send or external connector action runs from the page.
- Classroom material/topic placement is available only as the preview action
  `classroom_topic_material_preview` until Google Classroom OAuth/test-user
  scopes, topic policy, and explicit external-write approval are complete.
- Manual Google Business links and Place IDs are allowed now. Live Google
  Business Profile API actions require provider opt-in, `business.manage`, and
  approval/verification planning.
- Google Business Place ID/location helpers are preview-only
  (`google_business_place_id_lookup`, `google_business_list_locations_preview`)
  until provider opt-in, `business.manage` OAuth/API approval, and explicit
  external-read/write approval are complete.

## WAPI Phonebook Workspace

- Operations Communications > WhatsApp has a deployed phonebook-first WAPI
  workspace as of Railway deployment `6c9f06bc-6c1b-47b9-980a-4e8baca73eae`.
- The workspace is read-first and no-send: phonebook/contact list, selected
  timeline, details, local internal notes, related tasks, support tickets, and
  linked records all stay in first-party BNA Operations.
- Adding a WAPI workspace note writes only a local
  `bna_contact_communications` internal note with no-send/external-write false
  metadata. It must not send WhatsApp messages, broadcasts, or external CRM
  writes.
- Manual phonebook corrections remain preview/confirm-gated and require
  `APPLY_WAPI_CORRECTION` for local contact/lead tag writes.
- Operations Contacts parent and interested-parent expanded cards now show
  local WAPI/Whapi/contact communication history directly in their
  Communication tabs. Matching is conservative: first-party record IDs,
  normalized phone variants such as `050...` / `97250...`, email addresses,
  and WAPI source context. The card is read-only and must not trigger Whapi
  sync, WhatsApp sends, broadcasts, contact/tag writes, or external CRM writes.
  Deployed in Railway `7a866693-367d-4c1d-81d2-f6e8c60f4288`.

## Social Scheduling / Buffer

- Buffer is the active social scheduler for Facebook, LinkedIn, and YouTube
  text drafts/posts, but BNA helper/social scheduling must preview packages
  before connector writes.
- The typed helper action `preview_social_schedule_package` may plan channels,
  schedule slots, blockers, and the `APPROVE_BUFFER_SOCIAL_DRAFT` approval
  phrase. It must not write Buffer drafts, upload media, publish, send, or
  write external systems.
- Actual Buffer draft creation remains a separate approval path after source
  material, channel/account, copy, schedule window, media-hosting, and
  rollback/no-post policy are explicit.

## Automation / Prompt Library

- Operations Settings > Automations is the canonical read-only automation map
  for current BNA/provider/One Time workflow planning.
- The library may show triggers, audiences, channels, prompt/template families,
  statuses, first-party linked records, dry-run preview affordances, and
  disabled enable controls.
- The Automation Library is not an execution surface. It must not run external
  sends, publish content, change billing/access/member visibility, write
  Google/Drive/video hosts, create checkout/access grants, or write external
  CRM systems without a separate typed approval path and connector/sender.
- Prompt Browser rows in the library are review/readback pointers to content
  prompts, assignment prompts, helper policies, and no-send/no-external-write
  guardrails. Editable prompt work still belongs in the scoped prompt/content
  surfaces.

## One Time App / Member-Library Access

- Operations Settings > Drive / Social Intake now includes a deployed
  `One Time App Readiness` card and
  `GET /api/bna/one-time/app-access-readiness`.
- Rabbi Elie Scheller's provider workspace is scoped to
  `one_time_mishnah_class` with workspace key `rabbi_sheller_provider`.
- The Rabbi/One Time provider portal now has a deployed `Class Media` intake
  for manual hosted URL submissions only. It creates/reviews first-party One
  Time content jobs, internal output lanes, class-session readback, and local
  in-app review notifications; it must not upload files, publish to the member
  library, send email/WhatsApp, grant access, create checkout, write Drive or a
  video host, trigger Buffer, or write external CRM systems without a future
  explicit approval path.
- This readiness surface is read-only and no-write. It must not reset One Time
  admin credentials, grant member access, publish to the member library, write
  Drive/video hosts, send Resend/email/WhatsApp/SMS, create checkout/billing
  writes, or write external CRM.
- Operations Content > One Time Library shows display-only thumbnail previews
  from `thumbnail_brief` metadata, parsed metadata, or job thumbnail/image URL
  fields when an HTTP(S) thumbnail URL exists, plus a missing-thumbnail state.
  This preview is review UI only and must not generate thumbnails, upload
  media, publish, send, grant access, or write external systems.
- Live One Time app/admin/member-library integration remains blocked until the
  owner-approved admin URL/access path, Rabbi/member test login, DB/source,
  media host, Resend/domain/copy, billing/access policy, rollback/revoke path,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` are explicit.

## One Time Question Moderation

- One Time student/member questions must flow through first-party private
  moderation before any public/member-facing answer surface exists.
- Question intake uses `submit_student_question_for_moderation`, which creates
  a private task plus `bna_one_time_question_reviews` row; review uses
  `review_moderated_question`, which updates the private review row and task
  comment only.
- Operations Content > One Time Library includes `Private Question Moderation
  Queue`, backed by `GET /api/bna/one-time/question-moderation`.
- The queue is read-only/no-send/no-forum/no-member-visible. It must not create
  forum posts, member-visible answers, email/WhatsApp/SMS/portal sends, Codex
  jobs, checkout/access changes, Drive/video-host writes, or external CRM
  writes without a later explicit approval path.
- One Time forum/gamification policy is private-first: authenticated
  participants only, AI moderation before human review, temporary holds pending
  admin review instead of automatic bans, quality rewards/badges only after
  Rabbi/admin approval, no public shame, and no leaderboard unless Shloimie
  explicitly approves the audience, scoring, privacy format, opt-out path, and
  smoke test.
- One Time Classroom is the approved first implementation target for the
  reusable BNA classroom/community design. The classroom should organize Rabbi
  Elie's Mishnah videos under the six Sedarim, show live/daily video context,
  schedule video assignments through BNA's internal calendar, and reuse the
  same model later for BNA school communities.
- One Time classroom discussion is Rabbi-thread based, not open student chat.
  Students/members may submit responses to Rabbi/admin posts or class/video
  threads, but AI screening and Rabbi/admin approval must happen before any
  response becomes classroom-visible. Held or inappropriate responses should
  create staff/parent safety context where appropriate.
- One Time participation leaderboard is approved-participation only: approved
  questions, approved responses, Rabbi-featured items, and assignment
  participation may count. Raw private discussion, unreviewed student text, and
  student-to-student chat must not be exposed.
- One Time student/member bot answers must be source-grounded only: approved
  class transcripts, source sheets/assets, assignments, calendar/live-session
  records, access records, Zoom-link eligibility, and critical-thinking
  questions. If no approved source supports an answer, the bot should refuse or
  route to Rabbi/moderation rather than invent Torah content or citations.

## Operations Decisions

- Operations decision cards should read like real human decisions: a
  question-style prompt, context, why it matters, workspace, owner, due date,
  Option A/B/C choice cards, pros, cons, consequences, recommendation when
  known, `Needs more info`, and a workspace comment box.
- Decision comments are shared workspace context only by default. They must use
  `requeue: false` and must not create agent jobs, choose options, send email
  or WhatsApp, write Google/Buffer, or touch external CRM systems unless a
  separate explicit action/approval path is used.

## Operations Agent Lifecycle

- Telegram/bot-to-Codex machine work now uses the observable first-party
  lifecycle: `bna_tickets` -> `bna_tasks` -> `bna_agent_jobs` ->
  `bna_agent_job_events`.
- `bna_agent_jobs` is the canonical machine lifecycle table with statuses
  `queued`, `running`, `completed`, `failed`, and
  `blocked_needs_human_decision`; `bna_tasks.agent_status` mirrors those values
  for the human-facing task UI, while `bna_tickets.status` may use
  operator-friendly ticket labels such as `queued_for_codex`, `in_progress`,
  `done`, and `needs_decision`.
- Use `/api/bna/bot/capture` or `captureIncomingBotMessage()` for idempotent
  bot captures. It stores source channel/chat/message IDs, raw message,
  ticket/task/job IDs, owner, status, blocker, and reply hints.
- The agent fleet should claim `/api/bna/agent-jobs` rows before falling back
  to old Codex-owned task selection, and it must complete/block the job plus
  report back to the source Telegram chat when available.

## Live Closeout Proofs

- WS11 gamification/parent progress is production-migrated and live-smoked as
  of Railway deployment `7c8c7010-497c-41c7-a127-6370cca049eb`. Startup must
  run `createWs11CommunityGamificationSQL` before
  `ensureWs11CommunityFoundation`.
- The repeatable WS11 live proof command is
  `npm run app:smoke:ws11-parent-progress`; it uses temporary synthetic
  parent-link/session and hidden WS11 rows, then cleans them up.
- The repeatable secure Operator Setup proof command is
  `npm run app:smoke:operator-setup`; safe packages must remain no-secret by
  default, one-time, short-lived, and blank for sensitive env template values.

## Rabbi / One Time Task Hygiene

- Use `npm run task:rabbi-flow-audit` before reviewing Rabbi/One Time task-flow
  cleanup. The script is read-only, has no apply mode, writes reports under
  `ops/system-audits/`, redacts private BNA title-preview terms, and must not
  be treated as permission to move, close, retitle, reassign, publish, send, or
  grant access from the report alone.
- One Time Mishnayos product launch work is draft/decision-ready until Shloimie
  approves final pricing, public copy, checkout/billing, member access, account
  grants, and external writes. Candidate prices may be stored for review only:
  low-touch/library-live around `$50`/`$67`/`$100`/`$149`, interactive Zoom
  around `$149` or `$150`, and VIP/high-touch at `$300+`.
- Rabbi Scheller's 7pm Israel class time should be represented as first-party
  One Time schedule/calendar data and can drive regional funnel review for
  Israel, UK, US, and worldwide audiences.
- One Time public launch pages should remain noindex/draft and avoid final
  pricing, checkout buttons, unverified claims, account grants, billing actions,
  sends, Google/Drive writes, Zoom writes, Buffer publishing, and external CRM
  writes until the relevant human decisions are approved.
