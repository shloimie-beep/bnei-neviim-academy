# BNA Memory

## Identity

- **BNA** = **Bnei Neviim Academy** = **Whole Child Torah Learning Community**
- A family-based Torah learning community in Beit Shemesh, Israel
- NOT a traditional school - a return to family-centered Torah education
- Run by the operator
- The operator wants one shared brain across all channels (terminal + Telegram)

## Project Scope

**Phase 1 (Current): Foundation**
- New database for BNA operations (NOT using family accountability schema)
- Marketing system with GHL integration (GHL already has existing infrastructure)
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
- **Supabase**: Database and backend
- **Railway**: Hosting (pending setup)
- Shared repo files should be the canonical brain for both terminal and future
  Telegram bridge use

## Workflow Preferences

- Raw rambles captured first → distilled into durable memory + tasks
- `AGENTS.md`: Durable instructions
- `MEMORY.md`: Durable facts
- `TASKS.md`: Active work
- `tasks-pending/*.md`: internal Codex implementation handoffs
- `memory/YYYY-MM-DD.md`: Daily captures
- BNA app sections are Tasks, Students, Content, Contacts, and Accounting.
- UI redesign work must preserve existing data, backend fields, business logic,
  and functionality unless Shloimie explicitly says to remove/change them.
- Student checkoff links are private access-code portals at `/student.html`;
  public Torah displays must show cumulative 30-unit trip progress, not daily
  completion or private goal minutes/types.
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
- Public website Blog/FAQ routes are live as a static Express-served layer:
  `/blog`, `/blog/:slug`, `/faq`, `/he`, `/he/blog`, `/he/blog/:slug`, and
  `/he/faq`. Future dynamic blog automation should extend this layer rather
  than recreating a separate blog surface.
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
- Telegram is the input surface for rambles, decisions, payment notes, and task commands.
- Google Drive is the operator-facing input surface for raw media and website images; the dashboard monitors status rather than acting as a manual entry screen.
- Drive should not be the canonical source for brand kit, agent memory, or transcript text. Those live in GitHub under `brand-kit/`, `content-memory/`, and `content-memory/transcripts/`, with the live app database as the working transcript source.
- Current Drive pipeline under `BNA V2`: upload recordings/videos/audio to `00 Upload Here - Raw Media Intake`; upload website/blog images to `00 Upload Here - Website Images`; processed source media lives in `20 Processed Recordings - Source Media`; approved website assets live in `30 Approved Website Assets`; old redundant workflow folders and the Drive brand mirror live in `_Archive - Legacy Pipeline Folders`.
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
- Telegram should feel like natural conversation first. Do not announce Codex
  background queues for ordinary chat; mention capture only when a real task,
  student note, payment item, content item, or decision was created or needs
  action.
- Telegram should keep persistent bottom buttons for `OpenAI API` and `Codex`.
  `OpenAI API` is the default mode for ordinary conversation and content/tone
  refinement. Clear repo/code/database/bridge/deploy/test/programming requests
  still route to Codex automatically. Pressing `Codex` forces Codex replies
  until `OpenAI API` is selected again.
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
- Parent WhatsApp updates from a video should preserve the video's main message first. If the recording has one main concern such as sleep/routines, summarize that first, then add a separate "Other things we did" section for weekly topics and activities.
- Video captions for parents should use Shloimie's concise newsletter tone:
  bullets about the video first, then a compact weekly recap. Avoid fluffy
  lines such as "the practical message is simple", "that is very special", and
  "if Torah really matters, the basics have to support it"; state the sleep,
  breakfast, food, screens, and routine points directly and professionally.
- Content is not a task, goal, or accountability lane. Content should show teaching philosophy, actual class topics, verses/sources learned, class discussions, and class questions only. Operator tasks go to Tasks; named student goals, progress, meetings, attendance, and follow-ups go to Students.
- Content jobs need a future website-blog lane: approved recordings/videos/content should be convertible into public blog posts that update the website blog index and article routes.
- Telegram audio/day recordings may include student accountability and Torah goal reports. The parser should extract which boy did what, daily completion ratings, tasks/follow-ups, and update private accountability records without exposing private goal details publicly.
- Public website SEO content now includes static Blog/Article/FAQ routes:
  `/blog`, `/blog/:slug`, `/faq`, `/he`, `/he/blog`, `/he/blog/:slug`, and
  `/he/faq`. Homepage remains short and links into deeper philosophy articles.

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

4. **Affiliate Business Apprenticeship**
   - Student teams do real work for real businesses

## Visual Brand (LOCKED)

- Hand-drawn pencil sketches
- Monochrome graphite with sepia
- Parchment shading
- Calligraphic handwriting
- Torah scroll aesthetic

**NOT:** Stock photos, corporate polish, bright colors, generic Jewish clipart

## GHL/CRM Status

**Already Exists:**
- Service Provider Registration form (with specific field keys)
- Learning Community forms
- Affiliate Business forms
- Custom fields mapped

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

2. **MCP Memory Server + Supabase** (When needed)
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

### GHL Integration (Blocked ⏳)
- PIT token is valid against HighLevel's current API
- The legacy code was using the wrong HighLevel API generation
- Current fix path is `services.leadconnectorhq.com` with API version header
- 4 existing signups pending sync

### Kimi Runtime Note

- Local Kimi Code CLI is configured to use `kimi-k2.6`
- App-side AI config had been left on `kimi-k2.5`, which created confusing
  behavior across tools; keep repo-side Kimi settings aligned where possible

### Domain
- bneineviimacademy.org
- DNS configuration pending

### Pending
- Apply database migration for pipeline tables
- Update Operations dashboard with pipeline UI
- Deploy Telegram webhook
- Set up CLI bridge (Telegram → terminal)
- Green Invoice webhook configuration

---

## Holy Flow Task Pipeline System

## Public Website Current State

- The homepage source is `public/index.html`.
- The homepage now has a schedule/goal/media section named `program-pulse`.
- "The image slider" means the Learning Moments carousel in `public/index.html`.
- Learning Moments data lives in the `learningMoments` JavaScript array.
- Current public carousel images live in `public/images/learning-moments/`.
- The current 30-page goal progress is 2/30 pages.
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
- Mixed uploaded audio/video/text recordings should route items by type:
  - Shloimie's personal/operator tasks go to My Tasks.
  - Codex/app/code/dashboard/parser/Railway/GHL/Remotion work goes to the machine/Changelog lane.
  - Named student accountability, goal updates, and Torah progress go to Students/accountability records, not general tasks.
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
- Source videos are expected to arrive through Google Drive `BNA V2 / 01 Raw Intake`, local `media-drop/inbox`, or small direct Telegram uploads.
- Natural-language edit commands should support timeline edits such as speed changes, trims/cuts, image overlays, audio overlays/background music, subtitles, transitions, zoom/focus, and brightness/contrast adjustments.
- Rendered MP4s should be sent back to Telegram when small enough; larger renders should be saved locally and reported with their file path.

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

## Current Accounting Facts

- As of 2026-06-07, Naomi/Mordechai Braka for Hillel Baraka is partially paid:
  ILS 800.00 via Green Invoice transaction `DP488806585` on 2026-06-01 09:16,
  with ILS 200.00 still due against the ILS 1000.00 registration balance.
- Nikki Weber / Huda Weber and Shalom Galambo / Eitan Chaim remain paid intake
  records needing signup/matching records, not unpaid balances.

## One Time Mishnah Class And Rabbi Elie Scheller

- The existing Mishnah/Mishna project/filter should be standardized as `One
  Time Mishnah Class`; short display name may be `One Time`.
- Do not create a duplicate project if the existing Mishnah/Mishna filter already
  represents this work.
- Rabbi Elie Scheller should eventually have scoped access to the One Time
  Mishnah Class task manager: view/create/comment on tasks, brainstorm, turn
  discussions into tasks, mark decisions, and see tasks assigned to either him
  or Shloimie within that project.
- One Time task categories should include Marketing, Content, Technology, Admin,
  Accounting, GHL Setup, Community, General, Torah Class Prep, Source Sheets,
  and Shiur Ideas.
- Rabbi Elie Scheller should have his own scoped agent configuration/memory area
  using the same Telegram/agentic framework as Shloimie where possible.
- Rabbi Elie Scheller's bot should be scoped to One Time Mishnah Class and
  should not expose BNA private Students, Accounting, Devices, or student
  accountability areas unless explicitly granted later.
- The Rabbi Elie Scheller scoped Telegram profile is wired as
  `npm run telegram:rabbi` / `npm run telegram:rabbi:start`. It uses
  `agents/rabbi-elie-scheller/` context, scoped One Time Operations credentials,
  and separate runtime lock/mode files. Live use still needs the Rabbi bot token,
  Rabbi chat ID, and One Time scoped login/password.
