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
- Marketing system with Buffer for social posting and GHL/other connectors only
  where they remain explicitly wired
- School website for Whole Child Torah Learning Community
- Telegram bot integration
- Service provider network setup

**Phase 2 (Future):**
- Student accountability/tracking program (family app repurposed)

## Tooling Preferences

- **Codex**: Primary coding, development, and visible machine-work owner
- **OpenAI API**: Default Telegram reply engine for ordinary conversation,
  content/tone refinement, brainstorming, and normal system running when
  configured
- **Kimi**: Fallback-only provider/model path for failures or legacy records
- **Telegram**: Front-end channel for operator communication
- **GHL (GoHighLevel)**: CRM/marketing automation (ALREADY SET UP)
- **Buffer**: Active social posting provider for Facebook, LinkedIn, and
  YouTube. Buffer API credentials live in Railway and local `.secrets`; never
  commit or display the API key. The current key appears to be named `BNAv2`,
  created 2026-06-09, and expires 2026-07-09. GHL is not the active social
  posting provider.
- **Whapi/WAPI**: Active WhatsApp API path. Outbound sends and webhook delivery
  logs use WAPI/Whapi credentials; Operations also has an explicit admin-only
  Whapi log sync that imports recent sent/received message history into
  `bna_contact_communications` with sync-run audit records.
- **Railway**: Hosting plus current production Postgres/database source of truth
- **Supabase**: Not currently used for BNA operations data unless explicitly reintroduced
- Shared repo files should be the canonical brain for both terminal and future
  Telegram bridge use

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
- BNA Operations is the canonical internal-first operating system for CRM,
  tasks, workflows, provider platform, communications, calendar, settings, and
  bot action/audit context. External systems such as GHL, Google
  Calendar/Classroom, WhatsApp APIs, email providers, social schedulers, Vimeo,
  Green Invoice, and provider-owned class apps are connectors only unless
  explicitly promoted by a later decision.
- BNA is one school workspace. Rabbi/service-provider work belongs in separate
  provider/project workspaces and should not mix with BNA school parents or
  students.
- Current workspace model: Platform / Super Admin is Shloimie's control layer;
  BNA School Workspace is the live micro-school; Rabbi Sheller Provider
  Workspace is the first provider workspace for the One Time Mishnayos
  Membership and 7:00 class. Provider participants/members should not be called
  BNA students unless they are actually enrolled in BNA.
- Provider commercial packaging must be entitlement-driven. Separate free
  provider listings, paid managed provider setup, paid school/micro-school
  workspaces, and custom partner/revenue-share projects. Free listings get
  public profile/index visibility/basic CTA only; managed providers can unlock
  funnels, pipeline, email/WhatsApp/social, payment-link, content, reporting,
  automation, and support setup; school workspaces unlock parents, students,
  portals, goals, assignments, billing, communications, bots, and school
  operations; partner/revenue-share projects unlock custom terms, launch
  checklists, shared tasks, approvals, split reporting, and program/tier setup.
  Do not show paid automation or school controls to free providers except as a
  clear upgrade path.
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
- As of 2026-06-11, the provider commercial model is shipped and live: free
  listing, managed provider setup, school/micro-school workspace, and
  revenue-share partner plans exist; public provider onboarding is at
  `/providers/join`; Rabbi Sheller is the only active provider and is modeled as
  `revenue_share` / `revenue_share_partner`; archived/hidden provider records
  stay out of active commercial setup views.
- Provider intake should collect enough review context before BNA publishes or
  sells anything: business/contact details, category, location/service area,
  language, ages served, website/Google links, kids served, years active,
  background, problems solved, pricing, typical charges, discounts/group
  options, current ads, raw notes, and Shloimie approval notes. AI Max is an
  interest/application path only until pricing, payment, and delivery terms are
  explicitly approved.
- The first internal-first CRM backend primitives are persisted in the app:
  workspace settings, connector settings, internal calendar events, pipeline
  cards, internal dialogue threads/messages, and bot action logs. Missing live
  integrations should be shown as disabled/not configured/test/manual-mode
  controls, never faked as active.
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
- Hebrew menus must be RTL-native, open from the right, and avoid overlapping
  sticky controls on mobile.
- The parent dashboard treats the approved weekly newsletter/update as a
  first-screen hero when that data is available, preferably with pool/swimming
  media and optional talking-head video, plus navigation to prior updates. The
  admin weekly-update data model is live, but actual approved copy/media still
  needs operator selection before the first official update appears.
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
  categories: `school_interest`, `content_interest`, and `group_member`.
  School-interest leads are BNA-owned CRM records with lead status, interest
  level, source, notes, next follow-up, and optional GHL WhatsApp/contact
  linkage; GHL remains a connector, not the canonical CRM.
- Contacts parent records should expand inside the clicked card itself, not in a
  separate detail panel under/next to the list. Tag filtering and tag assignment
  should use compact dropdowns rather than large piles of buttons. Future GHL
  WhatsApp conversation sync should display recent conversation history inside
  the matching parent/lead card after message storage is explicitly built.
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
- Student checkoff links are private access-code portals at `/student.html`;
  public Torah displays must show cumulative 30-unit trip progress, not daily
  completion or private goal minutes/types.
- Student portal data must not load without a valid server-side student access
  credential. Invalid, expired, missing, or revoked codes should return
  401/403-style errors, clear browser-stored codes, and return the child to
  login. The final long-term student auth model is still undecided; decide
  whether private code alone is enough or whether to add code plus PIN/password.
- Parent portal access is passwordless through short-lived hashed magic links
  at `/parent.html`; Operations can send those links by email or confirmed
  WhatsApp, and the app should not introduce plaintext parent passwords.
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
  repo, Drive, app, GHL API/browser automation, tests, deploys, and
  verification.
- One Time platform default is internal-first: BNA should own the parent,
  student, Rabbi/admin, meeting, task, assignment, calendar, and messaging
  interfaces unless GHL/HighLevel earns a specific backend connector role.
  Rabbi Elie already has video/library/statistics tooling, so GHL community or
  course-builder UI is not assumed necessary.
- One Time meeting recordings should be handled as Content > Meeting Drops:
  structure the relevant Drive/content job into a meeting summary, decision
  list, linked tasks, source-media provenance, and project-scoped follow-up
  under `one_time_mishnah_class`.
- Meeting artifact #1 / Content job #57 is the current One Time build-brief
  seed: next work should start with Rabbi software-stack discovery around his
  library/Vimeo analytics, Google Classroom/Workspace account strategy, Zoom
  scheduling, WhatsApp provider, current website/product tiers, and
  ownership/revenue terms, then build the internal-first parent/student/Rabbi
  admin MVP with GHL only as a justified connector.
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
- Task stages are Raw Input, Needs Decision, Assigned, In Progress, Done, and Archive.
- Do not use a generic Pending task lane or visible task bucket. Ambiguous work
  should be audited into Needs Decision, My Tasks, Changelog Queue/In Progress,
  Done, or Archive. Machine-owned implementation work belongs in Changelog from
  queued through verified; there should not be a separate visible Codex Queue
  lane.
- Active task owners are Shloimie and Codex.
- Visible task titles must be refined into normal actionable language; raw Telegram wording belongs only in provenance fields such as `ai_parsed.original_text` or daily memory captures.
- Telegram task captures should not show per-task owner/status buttons. The parser should infer owner and lane automatically, then summarize the routing in plain text.
- If an actionable Telegram ramble is found to have no capture summary/tasks, create a Codex-owned agent-fleet audit/backfill task. The worker should identify the missed message(s), explain why ingestion failed, backfill clean tasks/records, fix the routing gap when feasible, verify, and report completion back to Telegram.
- Telegram should feel like natural conversation first. Do not announce Codex
  background queues for ordinary chat; mention capture only when a real task,
  student note, payment item, content item, or decision was created or needs
  action.
- Telegram should keep persistent bottom buttons for `OpenAI API` and `Codex`.
  `OpenAI API` is the default mode for ordinary conversation and content/tone
  refinement. Clear repo/code/database/bridge/deploy/test/programming requests
  still route to Codex automatically. Pressing `Codex` forces Codex replies
  until `OpenAI API` is selected again.
- Prompt-building requests for Codex or ChatGPT should stay in visible
  planning/refinement mode first: show the prompt/brief draft in Telegram,
  preserve the raw operator input as provenance, and only implement after
  Shloimie explicitly says to build, apply, run, test, or implement.
- OpenAI sidekick capability must be verified by a real smoke test, not
  assumed. Use `npm run openai:smoke -- --telegram` locally, or Telegram
  `/smoke_openai`, to confirm OpenAI can read repo memory/task files, transcript
  exports, protected BNA app APIs, Drive folder metadata, live task/student/
  payment/Torah data, and send a Telegram summary. The smoke report writes to
  `ops/openai-smokes/`.
- Telegram OpenAI mode should use OpenAI Responses `web_search` for research,
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
- Integrate with existing GHL setup
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

## GHL/CRM Status

**Already Exists:**
- Service Provider Registration form (with specific field keys)
- Learning Community forms
- Affiliate Business forms
- Custom fields mapped

**Evaluation Criteria (2026-06-09):**
- The operator is evaluating whether GHL is worth keeping if its main use is
  connecting YouTube, Facebook, Google Business Profile, and a review widget.
- Required replacement coverage: YouTube posting/API, Facebook Page
  posting/API, Google Business Profile posts/reviews/API, a flowing Google
  reviews widget for the public website, and the chosen Wappy/WhatsApp path.
- Wappy must be disambiguated before replacing GHL WhatsApp: `wappy.chat` is
  primarily a website click-to-WhatsApp widget, while `wappy.ai` presents as a
  WhatsApp Business automation/API platform. Only an API/webhook/export-capable
  Wappy path can replace GHL's WhatsApp API role.
- BNA should remain the internal CRM/source of truth for contacts,
  conversations, tasks, and decisions; GHL or a scheduler can be a channel
  adapter, not canonical memory.
- Do not cancel, delete, or restructure GHL until current forms, workflows,
  connected social accounts, review/reputation tools, conversations, and paid
  add-ons have been audited.

**Guardrails:**
- Do NOT delete anything in GHL
- Do NOT change unique keys
- Always search by key first; create only if missing

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
- Features: academy-sidekick chat, GHL account commands, media intake, social job queue
- Natural language parsing for rambles plus structured Telegram ops commands

### GHL Integration (Active, Guarded)
- PIT-token based HighLevel integration uses the current LeadConnector API path
  with the required API-version header.
- GHL Social diagnostics are part of the live app smoke path and currently pass.
- GHL MCP is configured through `.mcp.json` with the local
  `scripts/ghl-mcp-stdio.mjs` wrapper; the PIT token is stored outside tracked
  files under `.secrets/ghl-pit-token.txt`.
- Live publish/send actions still require explicit operator approval, and a
  safe draft write/delete smoke remains the next GHL verification step.

### Kimi Runtime Note

- Local Kimi Code CLI is configured to use `kimi-k2.6`
- App-side AI config had been left on `kimi-k2.5`, which created confusing
  behavior across tools; keep repo-side Kimi settings aligned where possible

### Domain
- bneineviimacademy.org is the live production domain.

### Current Technical Blockers
- Safe GHL draft write/delete smoke for Telegram draft publishing.
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
- content, technology, accounting, ghl_setup, community, general
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
- GHL webhooks: real-time contact sync

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
  - Shloimie's personal/operator tasks go to My Tasks.
  - Codex/app/code/dashboard/parser/Railway/GHL/Remotion work goes to the machine/Changelog lane.
  - Named student accountability, goal updates, and Torah progress go to Students/accountability records, not general tasks.
  - Halacha/source lookup questions that Shloimie marks for research go to Tasks as `Torah Research` / `torah_research`, assigned to Codex. The task must preserve the exact question, use Sefaria/source research, include direct Sefaria links, include a source map and summary of where each source is found, and flag open points for Shloimie/rav review instead of presenting automated final psak.
  - Student philosophy/hashkafa/curiosity questions stay in Student Questions or class notes unless Shloimie explicitly marks them as halacha/source lookup work.
- Student Analysis notes are admin-only private accountability events with
  `metadata.kind = "student_analysis"`. Use them for dated behavior/focus
  observations and correction paths. They must be visible in Operations
  Students/Admin views and must not leak into the student portal, public
  website, or content lanes.
- The Tasks dashboard should not have a generic visible Pending lane or a
  visible Planned/Implementation Briefs lane. Open work belongs only in
  Decisions, My Tasks, Changelog Queue/In Progress, Done, or Archive. Machine
  work should be visible in Changelog from queue to verification.
  `tasks-pending/*.md` files are internal Codex handoffs, not an operator-facing
  workload section.

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

- Plain Telegram messages to the academy bot should use OpenAI API first for
  ordinary conversation, tone/content refinement, and brainstorming.
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
- Kimi remains fallback only for API/model-provider failures or legacy records.
- Operations Decisions must only contain real operator choices, ideally with
  explicit options. Actionable requests that Codex can execute should go into
  the Changelog/Codex queue, and human errands should go into My Tasks; nothing
  should sit in a vague pending/decision state without a concrete choice needed.
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
  2026-06-09, the live Menachem signup/student records use
  `hahuvadratler@gmail.com` for Ahuva parent access, while the previous Shloimie
  signup contact is preserved in the notes.
- Esti Dratler is a separate external accountability person, not a BNA
  school-enrolled student. Her record is tagged `external-accountability`,
  `external`, `dratler`, `girl`, and `not-bna-school`; her email is stored as
  `estidratler@gmail.com`.
- Menachem live Goal Board item #81 is `Floor cleanup and bed by 10:00 PM`,
  section `personal_home`, subsection `Chores and bedtime`, parent-visible and
  student-hidden pending Rabbi/admin review. Checklist: clean up the floor
  before 10:00 PM and be in bed by 10:00 PM. Agreement bedtime is `22:00`.
  Consequence under review: no going out the next day if the floor is not
  finished before 10:00 PM.

## One Time Mishnah Class And Rabbi Elie Scheller

- The existing Mishnah/Mishna project/filter should be standardized as `One
  Time Mishnah Class`; short display name may be `One Time`.
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
- Rabbi Elie needs his own scoped parent and student sections under the One
  Time account/project. Do not mix those records with BNA school students or BNA
  parents.
- One Time task categories should include Marketing, Content, Technology, Admin,
  Accounting, GHL Setup, Community, General, Torah Class Prep, Source Sheets,
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
- One Time/GHL automation should reuse the Holy Flow agent-loop pattern only as
  a design source: task deck, one workflow at a time, observe-before-act, API
  first, browser only for UI-only GHL work, operator walkthroughs for OAuth or
  vendor gates, and explicit confirmation before GHL writes.
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
