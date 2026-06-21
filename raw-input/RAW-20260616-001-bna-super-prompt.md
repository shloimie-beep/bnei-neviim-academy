# BNA Website + Operations + Ramble Parser Super Prompt — 2026-06-16

Repository: `shloimie-beep/bnei-neviim-academy`

Use this in Codex **Goal Mode** after the final Ramble Protocol + Raw Input Queue work has been applied locally.

This prompt converts Shloimie’s current correction ramble into a requirement register and implementation plan. Do not treat this as a vague redesign. Treat every item below as a tracked goal with evidence, verification, and final status.

---

## 0. Critical operating rules

You are working on Bnei Neviim Academy’s live system.

Before changing code:

1. Read `AGENTS.md`, `MEMORY.md`, `SYSTEM-STATE.md`, `TASKS.md`, and the latest `tasks-pending/*.md`.
2. Confirm the Ramble Protocol + Raw Input Queue exists:
   - `bna_raw_intake` migration/table plan
   - `raw-input/README.md`
   - `tasks-pending/_template-ramble-intake.md`
   - `tasks-pending/2026-06-16-website-ramble-correction-audit.md`
   - shared parser/intake module
3. Preserve this correction ramble as a raw input record:
   - Stable raw ID: `RAW-20260616-001`
   - Source: `codex_chat`
   - Type: `website_operations_correction_ramble`
   - Register path: `tasks-pending/2026-06-16-website-ramble-correction-audit.md`
4. Add the parsed requirements below to that register.
5. Do not silently drop anything.
6. Do not mark anything done without evidence.
7. Do not commit secrets, API keys, raw credentials, private contact exports, private parent records, or screenshots containing private details.

Final response must include:

```text
REQ ID | Status | Evidence | Files changed | Verification | Remaining issue
```

Status values only:

```text
Pending
Done
Already satisfied
Blocked
Failed
Needs operator decision
Merged into REQ-...
```

---

## 1. Sensitive data and security rules

The ramble includes references to parent records, child/student information, inbound email contents, communication logs, API keys, and local file paths. Handle these with strict care.

1. Do not expose parent/student/private-message content in public pages, logs, screenshots, or demo cards.
2. Do not copy the OpenAI key or any secret into the repo.
3. Treat this local path as local-only secret input, never as repo content:

```text
C:\Users\User\BNA-Keyholder\openaiv2.txt
```

4. Use safe secret storage only:
   - local `.secrets/` file when running locally
   - Railway environment variable or project secret for deployment
   - encrypted workspace integration storage for user-supplied third-party API keys
5. Kimi remains fallback-only after OpenAI is configured.
6. For parent/student “psychoanalysis” language, implement this as **non-clinical parent coaching / self-regulation / support observations**, not diagnosis or medical/mental-health labeling.

---

## 2. Screenshots supplied with this ramble

The operator supplied screenshots showing these live pages and issues:

1. `/operations?view=tasks&section=activity&workspace=platform&task=428`
   - Activity page has large dark queue boxes.
   - Text is too faint/illegible.
   - Queue health filters are confusing and not mobile-friendly.
   - Rows do not clearly open task details.
2. `/`
   - Public homepage header/nav is crowded and visually inconsistent.
   - Parent portal/service-provider links create confusing flows.
3. `/parent`
   - Parent portal can be reached from public website and shows a parent’s private dashboard without an obvious login step.
   - Header differs from main website.
4. `/parent/login`
   - Login page has inconsistent header.
   - Copy says “Start Accountability Intake,” which is wrong/confusing.
   - There appears to be a redirect/glitch between parent portal and login.
5. `onetimeonetime.com`
   - Rabbi Elie Scheller / OneTime branding uses black, white, and bright yellow.
   - This should inform his white-label BNA/OneTime service-provider portal.
6. `/operations?view=dashboard&section=overview&workspace=platform`
   - Operations dashboard wastes space with too many cards and oversized top areas.
   - BNA Helper bubble appears duplicated.
7. `/operations?view=settings&section=calendar_classroom&workspace=bna`
   - Google Calendar/Classroom are not ready; should show internal-first and “coming soon” for external connectors.
8. `/operations?view=settings&section=provider_index_core&workspace=bna`
   - Provider Index settings category layout is confusing.
   - Top tabs/buttons should use compact GHL-style navigation.
9. `/operations?view=communications&section=overview&workspace=platform`
   - Communications cards are too faint and do not surface important inbound/outbound events clearly.
10. `/operations?view=communications&section=email&workspace=platform`
   - Email cards do not show enough information.
   - Important inbound parent/accountability message was not surfaced/alerted as high-priority.

Use these screenshots as visual QA targets.

---

## 3. Implementation batches

Work in batches. Each batch must update the register and verification notes.

### Batch A — Intake/register/security preflight
- Register this ramble as `RAW-20260616-001`.
- Add all REQs below to the active register.
- Confirm secrets are not being committed.
- Confirm parent/student data is not exposed publicly.

### Batch B — Security and portal routing
- Fix parent portal access/security before visual polish.
- Fix login redirect/glitch.
- Verify parent sessions are scoped.

### Batch C — Workspace model and operations shell
- Normalize workspace taxonomy.
- Fix sidebar/workspace selector.
- Compact global shell/header/tabs.

### Batch D — Activity/task UI
- Simplify activity statuses.
- Fix readability, mobile behavior, task row actions, details drawer.

### Batch E — Public website + portal consistency
- Fix public nav/header.
- Ensure portal pages have consistent nav/shell and correct public entry flows.

### Batch F — BNA Helper / natural-language actions
- Make helper a real sidekick command surface, not a decorative bubble.
- Tie it into raw input queue and action execution.

### Batch G — Parser, content, classes, research
- Merge ramble protocol with uploaded class parser.
- Reprocess unparsed raw intake.
- Route class topics/questions/student dialogue/research to proper locations.

### Batch H — Communications, WAPI, contacts, email
- Redesign communications.
- Add WAPI group visibility.
- Build contact imports/tagging.
- Surface important inbound/outbound events.

### Batch I — Integrations, billing, automations
- Internal-first calendar/classroom.
- Encrypted API key settings for Resend, Buffer, WAPI, payment providers.
- Automations summaries/toggles.

### Batch J — Rabbi Scheller / OneTime white-label
- Branding, roles, pricing, classroom/community behavior.

### Batch K — Verification/deploy/live smokes
- Run tests and live smokes.
- Update register, ledger, changelog.

---

## 4. Requirement register

### REQ-20260616-001 — Register this entire correction ramble as raw intake

**Requirement:** Preserve the whole correction dump as `RAW-20260616-001` and link it to the active register.

**Expected result:** The raw text is preserved before parsing. The active register contains parsed REQ/TASK/DEC/Q/MEM items and points back to the raw input record.

**Affected areas:**
- `bna_raw_intake`
- `raw-input/`
- `tasks-pending/2026-06-16-website-ramble-correction-audit.md`
- shared intake parser

**Verification:** Show raw ID, parsed item counts, and register path in final report.

---

### REQ-20260616-002 — Confirm Ramble Protocol + Raw Input Queue is deployed and live-smoked

**Requirement:** The protocol was reportedly implemented locally. Apply migration/deploy/live smoke before relying on direct Telegram/website rambling.

**Expected result:** Raw intake works in live Telegram and website/Operations helper, not just local code.

**Verification:**
- Migration applied or documented as blocked.
- Railway deploy done or documented as blocked.
- One real Telegram raw intake proof.
- One real website/helper raw intake proof.
- Final evidence includes raw IDs and parsed counts.

---

### REQ-20260616-003 — Merge uploaded-class parsing with the ramble protocol

**Requirement:** Uploaded class recordings, Drive raw intake, Telegram voice/video, and freeform correction rambles must share the same raw-first parsing architecture.

**Expected result:** Every uploaded class first creates a raw intake record, then parser routes class topics, student dialogue, questions, research items, tasks, accountability notes, content items, and decisions.

**Verification:** Upload or reprocess one class item and show created raw record plus routed outputs.

---

### REQ-20260616-004 — Reprocess older uploaded/raw content that never got parsed

**Requirement:** Audit old raw inputs/uploads/content jobs and find items that were uploaded but never parsed or never routed.

**Expected result:** A backfill report lists:
- raw item/content job
- parse status
- missing routed outputs
- action taken
- remaining blockers

**Verification:** Add report under `ops/` and update the active register.

---

### REQ-20260616-005 — Workspace taxonomy must be exactly School, Service Provider, Family, plus Super Admin

**Requirement:** Workspaces are only:
- School
- Service Provider
- Family

Super Admin is a global viewing/admin role, not a normal workspace type.

Parents and students belong inside schools, families, or service-provider programs. Parents are not top-level workspace categories.

**Expected result:** Operations UI, workspace selector, role model, and data filters reflect this model.

**Verification:** Workspace selector shows type first, then specific workspace dropdown. No duplicate “Family App,” “Home Accountability,” or other stale workspace categories.

---

### REQ-20260616-006 — Dedupe and normalize workspace list

**Requirement:** The app is loading too many duplicate/confusing workspaces.

**Expected result:** Duplicate/stale workspace records are hidden, merged, archived, or flagged for admin decision. Visible workspaces are clear and unique.

**Verification:** Workspace directory shows only clean workspace names grouped by type.

---

### REQ-20260616-007 — Redesign workspace selector

**Requirement:** The left-hand workspace section should show:
1. Workspace type selector: School / Service Provider / Family / Super Admin view.
2. Specific workspace dropdown for that type.

**Expected result:** A user sees their permitted workspace(s). Super Admin can filter by workspace type and specific workspace.

**Verification:** Desktop and mobile screenshots.

---

### REQ-20260616-008 — Scope roles and permissions clearly

**Requirement:** Roles must be scoped by workspace and role.

**Known desired mapping:**
- Shlomo/Shloimie: Super Admin globally.
- Shlomo/Shloimie: BNA Admin for BNA.
- Rabbi Scheller: Owner/Admin for Rabbi Scheller / OneTime Mishnah program.
- Shlomo/Shloimie: Admin/Manager for Rabbi Scheller / OneTime workspace.
- Parents/students scoped only to their household/school/provider program.

**Expected result:** Role/permission settings can add users, invite users, send emails, reset portal access, and limit what each role sees.

**Verification:** Role matrix visible in settings and protected API access checks.

---

### REQ-20260616-009 — Standardize operations shell/header across all operations sections

**Requirement:** Operations pages waste vertical space and use too many cards. Use a compact GHL-like shell:
- left sidebar
- compact top bar
- breadcrumbs
- compact text/pill tabs
- fewer oversized cards
- consistent header/footer/spacing

**Expected result:** All operations views share a compact layout.

**Verification:** Audit at least Overview, Activity, Settings, Communications, Provider Index, Calendar/Classroom.

---

### REQ-20260616-010 — Replace oversized top filter buttons with compact pills/text tabs

**Requirement:** Top buttons look thrown in and break on mobile. Replace with compact words/pills similar to left-side small boxes or GHL-style tabs.

**Expected result:** Tabs/filters are readable, small, and mobile-friendly.

**Verification:** Mobile screenshot at 390px and desktop screenshot.

---

### REQ-20260616-011 — Fix mobile behavior for Operations filters/buttons

**Requirement:** Buttons and filters do not load nicely on mobile.

**Expected result:** No horizontal overflow, hidden inaccessible buttons, or broken wrapping. Use compact dropdown/tabs where needed.

**Verification:** Playwright/mobile screenshot of core operations pages.

---

### REQ-20260616-012 — Simplify Activity page summary

**Requirement:** Remove or redesign the large dark “Queued / Running / Urgent Today” boxes. They are unnecessary and visually heavy.

**Expected result:** Activity page has a compact summary strip or no summary boxes, with meaningful labels.

**Verification:** Screenshot and register evidence.

---

### REQ-20260616-013 — Fix Activity page readability

**Requirement:** Activity row text and titles are too light/illegible.

**Expected result:** Sufficient contrast for titles, evidence, next actions, and links.

**Verification:** Visual inspection and contrast check if available.

---

### REQ-20260616-014 — Simplify Activity/Queue Health statuses

**Requirement:** Current statuses are confusing:
- active fresh
- active stale
- duplicate
- abandoned/unknown
- do not redo
- queued/running/urgent
- etc.

**Expected result:** Use a smaller set of human-readable statuses:
- Needs decision
- Agent working
- Pending Shloimie
- Pending external
- Blocked
- Done verified
- Do not redo / Archived, only if clearly explained
- Failed, if actual failure

If duplicate/abandoned statuses are still technically needed, hide them behind diagnostics or explain them clearly.

**Verification:** Activity filters are understandable and clickable/openable.

---

### REQ-20260616-015 — Activity rows must open details and actions

**Requirement:** Tasks/items do not open properly from Activity.

**Expected result:** Clicking a row opens a details panel/drawer with:
- raw source
- parsed item IDs
- current status
- evidence/report links
- next action
- mark done / needs decision / back to task / do not redo as appropriate

**Verification:** Manual click test on desktop and mobile.

---

### REQ-20260616-016 — Clarify what queue health is actually queuing

**Requirement:** The operator does not know what Queue Health means or what it is linked to.

**Expected result:** Activity page explicitly states whether the queue is:
- agent task queue
- raw input queue
- Codex queue
- content parse queue
- communications queue

If multiple queues exist, show them separately.

**Verification:** UI label/copy and source file evidence.

---

### REQ-20260616-017 — BNA Helper must be one clean helper bubble, not duplicated

**Requirement:** Screenshots show duplicate helper bubbles.

**Expected result:** One helper instance per page, positioned cleanly, with stable load behavior.

**Verification:** Operations and public page screenshots.

---

### REQ-20260616-018 — BNA Helper must be branded per user/workspace

**Requirement:** It should not just say “BNA Helper.” For Shlomo, it should say something like “Shlomo’s BNA Helper.” For other users/workspaces, use appropriate branding.

**Expected result:** Helper title/identity changes by session/user/workspace.

**Verification:** Super admin and workspace admin screenshots.

---

### REQ-20260616-019 — BNA Helper must execute UI actions through natural language

**Requirement:** The helper should be able to do anything buttons can do:
- mark done
- edit task
- report problem
- go back to task
- decisions
- pending
- content
- calendar/scheduling
- settings
- workflows
- automation changes
- send/reset portal links
- create tickets when action is unsupported

**Expected result:** Helper has an action registry and tool/action router. Unsupported commands create tracked tickets/raw-intake items.

**Verification:** Implement at least a first action set and test commands.

---

### REQ-20260616-020 — Public homepage header/nav is broken/crowded

**Requirement:** The main website toolbar is visually messed up and overcrowded.

**Expected result:** Clean responsive public nav:
- Home
- School
- Parents/Families or Family App
- Service Providers
- Blog
- FAQ
- Login/Portal options grouped cleanly
- Hebrew toggle
- Contact/CTA

**Verification:** Desktop and mobile homepage screenshots.

---

### REQ-20260616-021 — Portal pages need consistent headers/nav

**Requirement:** Parent portal/login pages have different headers from the main website and do not clearly lead back.

**Expected result:** Portal pages share a consistent portal/public shell with:
- BNA branding
- Back to website
- correct login/logout
- no confusing mismatched header

**Verification:** `/parent`, `/parent/login`, student/provider/rabbi login pages.

---

### REQ-20260616-022 — Public “Parent Portal” link must not expose a private parent dashboard

**Requirement:** From the public homepage, clicking parent portal appeared to open a father’s private dashboard.

**Expected result:** Public links must go to a login/marketing entry. If a session exists, show “Continue as [parent]” only after validating session ownership and route scope.

**Verification:** Incognito, logged-out, and logged-in tests.

---

### REQ-20260616-023 — Fix parent login redirect/glitch

**Requirement:** Parent portal/login appears to switch/glitch between pages.

**Expected result:** Deterministic routing:
- unauthenticated -> `/parent/login`
- authenticated parent -> their own `/parent`
- expired/invalid session -> login with message
- public marketing link -> correct parent/family portal info or login CTA

**Verification:** Manual browser test and route smoke.

---

### REQ-20260616-024 — Replace “Start Accountability Intake” copy

**Requirement:** Parent login copy/button “Start Accountability Intake” is confusing/wrong.

**Expected result:** Use clearer copy such as:
- “Request Parent Access”
- “Start Family App Setup”
- “Try the Family Accountability App”
- “Reset / Set Parent Portal Access”

Choose copy based on actual flow.

**Verification:** Screenshot.

---

### REQ-20260616-025 — Add public positioning for schools/families/service providers

**Requirement:** Public site should separate:
- Families: try/use the family accountability app.
- Schools: learn about managing a school with natural language / Jewish AI microschool.
- Service Providers: provider index, transparency, classrooms, external service-provider ecosystem.

**Expected result:** Public pages/sections/CTAs clearly support these three user types.

**Verification:** Header, CTAs, section links.

---

### REQ-20260616-026 — Add AI microschool / overhead-reduction messaging

**Requirement:** Include content/CTA around:
- one-man AI microschool
- Jewish AI microschool
- natural-language school management
- AI reducing overhead
- supporting better rabbi pay
- transparency and service-provider collaboration
- home-based education where children grow in society

**Expected result:** Add or queue content sections/pages/blog prompts consistent with BNA brand.

**Verification:** Content appears on public site or is tracked in content task if copy needs operator review.

---

### REQ-20260616-027 — Full security audit for parent/student/provider portals

**Requirement:** Audit the direct parent data exposure issue.

**Expected result:** Review:
- session cookies
- parent access codes
- route guards
- API authorization
- workspace scoping
- caching
- public links
- browser back/redirect behavior

**Verification:** Security audit report under `ops/security-audits/` and fixed code.

---

### REQ-20260616-028 — Rabbi Scheller / OneTime white-label branding

**Requirement:** Use Rabbi Scheller / OneTime colors and feel from `onetimeonetime.com`:
- black
- white
- bright yellow
- strong CTA style

**Expected result:** White-label provider login/portal/landing shell for Rabbi Scheller / OneTime.

**Verification:** Screenshot comparison.

---

### REQ-20260616-029 — Rabbi Scheller service-provider landing page

**Requirement:** Build a simple landing page in our system for Rabbi Scheller based on his current external site, with adjusted CTA.

**Expected result:** A crisp white-label service-provider landing page, initially external/public, later connected to portal.

**Verification:** URL and screenshot.

---

### REQ-20260616-030 — Rabbi Scheller pricing/payment links

**Requirement:** Keep pricing at `$67` and `$149`. Set up payment links via API key if possible. If not possible, set up the UI/config placeholders and create a blocked task.

**Expected result:** Provider billing page shows $67/$149 plans and payment-link status.

**Verification:** Payment links work or blocker is explicit.

---

### REQ-20260616-031 — Safe OpenAI API key setup with Kimi fallback

**Requirement:** Configure new OpenAI key from local file path safely. Kimi remains fallback.

**Expected result:**
- OpenAI primary works.
- Kimi fallback remains configured.
- Key is stored only in safe secret storage.
- No key in repo/logs/changelog.

**Verification:** OpenAI smoke passes, fallback path documented.

---

### REQ-20260616-032 — All dashboard cards/headers should be consolidated

**Requirement:** Dashboard wastes space with too many large cards and repeated top labels like current workspace/current role/viewing/filters.

**Expected result:** Compact shell using top bar/breadcrumbs/small pills. Remove redundant cards.

**Verification:** Overview/settings/activity screenshots.

---

### REQ-20260616-033 — Settings pages need GHL-like compact navigation

**Requirement:** Settings category pages use confusing cards and “Open” buttons. Top tabs should be compact words/pills.

**Expected result:** Settings pages use compact navigation:
- Account
- Workspace
- Users & Roles
- Communications
- Learning
- Calendar & Classroom
- Bots & AI
- Provider Index
- Billing & Payments
- Integrations
- Advanced

Inside each, use compact sub-tabs and focused forms.

**Verification:** Settings screenshots and mobile check.

---

### REQ-20260616-034 — Users & Roles must support adding users and sending invites

**Requirement:** Need add users, roles, workspace permissions, invite emails, portal reset emails.

**Expected result:** Users & Roles UI supports:
- add user
- assign role
- assign workspace
- send invite/access email
- reset portal access
- audit invitation status

**Verification:** Dry-run mode or live test with safe test email.

---

### REQ-20260616-035 — Parent/student portal access management

**Requirement:** Learning/parent/student sections should send new portal emails, generate access, and track people.

**Expected result:** Admin can manage parent/student portal access from workspace.

**Verification:** UI and API smoke.

---

### REQ-20260616-036 — API usage limits by workspace and role

**Requirement:** API usage limits should tie to parents/students/workspaces. Super Admin sees all; workspace admin sees only own workspace.

**Expected result:** Bots & AI settings show usage, limits, and spend by workspace and role.

**Verification:** Super Admin vs workspace admin view.

---

### REQ-20260616-037 — Billing & Payments should show payment links and workflows

**Requirement:** Billing should connect to billing system and show payment links, billing workflows, and accounting.

**Expected result:** Billing & Payments has:
- payment links
- plan/pricing status
- billing workflows
- payment events
- integration status

**Verification:** Screenshot and data source evidence.

---

### REQ-20260616-038 — Integrations must show actual integrations with setup links

**Requirement:** Integrations should list real integrations: Resend, Buffer, WAPI, payment provider, Google Calendar/Classroom, etc.

**Expected result:** Each integration shows:
- status
- setup instructions
- API key/token entry
- validation/test button
- encrypted storage
- rotation reminder option

**Verification:** Integration settings screen and encrypted storage check.

---

### REQ-20260616-039 — Resend should be wired separately as email provider

**Requirement:** Wire Resend as a separate email provider. Do not confuse it with Gmail or other connectors.

**Expected result:** Resend configuration exists, with workspace/provider-specific setup where needed.

**Verification:** Test email dry-run/smoke.

---

### REQ-20260616-040 — Buffer should be a separate integration

**Requirement:** Buffer should have its own integration section and not be mixed with other automations.

**Expected result:** Buffer setup/status UI and future posting workflow hooks.

**Verification:** UI and tracked task if credentials unavailable.

---

### REQ-20260616-041 — External connectors should be “coming soon” where not ready

**Requirement:** Google Calendar and Google Classroom should show “coming soon” or internal-first status for now.

**Expected result:** Internal calendar/classroom works. Google connectors are visibly disabled/coming soon unless credentials are complete.

**Verification:** Calendar & Classroom settings.

---

### REQ-20260616-042 — Automations section must be separate and understandable

**Requirement:** Automation should show organized folders/groups and summary of each automation.

**Expected result:** Each automation shows:
- name
- purpose
- trigger
- action
- workspace
- enabled/disabled
- last run
- edit/toggle controls
- “create automation with helper” route

**Verification:** Automation UI and at least one example.

---

### REQ-20260616-043 — Service providers can create classrooms/communities through natural language

**Requirement:** Service providers should be able to open/start a classroom and have the bot walk them through setup:
- how many classes
- community/dialogue style
- student access
- display rules
- message permissions

**Expected result:** Natural-language guided classroom setup flow, even if first version creates draft/config records.

**Verification:** Test prompt creates a classroom draft.

---

### REQ-20260616-044 — Community layout and classroom layout must be crisp/mobile-friendly

**Requirement:** Finish community and classroom layouts using existing app patterns. Do not reinvent unnecessarily. Must be beautiful, crisp, navigable on mobile.

**Expected result:** Community/class pages have clear:
- header
- class list
- student/member list
- teacher posts
- student questions/replies
- display/publish controls
- mobile layout

**Verification:** Screenshots.

---

### REQ-20260616-045 — Rabbi Scheller classroom reply/publish rules

**Requirement:** For Rabbi Scheller, students can reply to him privately. He chooses which replies/questions to publish to the public/community display.

**Expected result:** Classroom config supports:
- student-to-teacher replies
- no student-to-student chat unless enabled
- teacher moderation/publish queue
- public community display

**Verification:** Data model/config UI and test flow.

---

### REQ-20260616-046 — Provider Index settings must be reorganized

**Requirement:** Current Provider Index settings category does not make sense.

**Expected result:** Reorganize into:
- Public Provider Index
- Provider Plans
- Provider Entitlements
- Provider Onboarding
- Commercial Models

Keep “free for now” status visible for not-yet-billed provider features.

**Verification:** Settings screenshot.

---

### REQ-20260616-047 — Content must be scoped to the correct workspace

**Requirement:** Content is showing up in the wrong workspace.

**Expected result:** Strict guardrails:
- every content job/output has workspace/project/source
- BNA content stays in BNA
- OneTime/Rabbi content stays in OneTime
- family/private content stays in family workspace
- cross-workspace leakage is prevented

**Verification:** Audit report of current mis-scoped items and fix/backfill.

---

### REQ-20260616-048 — BNA admin prompt library must show prompts

**Requirement:** Prompts are not showing for BNA admin.

**Expected result:** BNA admin can see relevant prompt library/studio entries scoped to BNA.

**Verification:** UI screenshot and API result.

---

### REQ-20260616-049 — Research section must work

**Requirement:** The research section has been requested repeatedly and is not working.

**Expected result:** Research section shows:
- class topics
- boys’ questions
- sources learned
- further sources
- follow-up research
- topic categories
- linked class/transcript/raw input
- workspace scope

**Verification:** Reprocess at least one transcript/class and show research output.

---

### REQ-20260616-050 — Student questions must appear in student portal

**Requirement:** If a boy asks a question in class, his portal should show the question and follow-up sources.

**Expected result:** Student portal includes:
- “My questions”
- linked class/session
- answer/follow-up sources
- private teacher notes if permitted
- no other student private data

**Verification:** Test student question record.

---

### REQ-20260616-051 — Teacher/operator research view

**Requirement:** Shlomo should see all sources/topics discussed and further research in a research section.

**Expected result:** Admin/research view has searchable/filterable research items from transcripts/classes/questions.

**Verification:** Research UI and data route.

---

### REQ-20260616-052 — Content library sync audit

**Requirement:** Raw input has content, meetings, and other data, but sync/routing is broken.

**Expected result:** Audit:
- raw input
- content jobs
- transcripts
- meetings
- student accountability
- class notes
- research
- content outputs

Fix routing and create backfill tasks where needed.

**Verification:** Audit file and corrected sample records.

---

### REQ-20260616-053 — Communications section redesign

**Requirement:** Communications section is unclear. Cards are faint, titles missing, and important events are buried.

**Expected result:** Communications view clearly shows:
- contact/person
- channel
- direction inbound/outbound
- subject/title
- timestamp
- tags
- summary
- source
- follow-up/action
- open/click/status where available
- associated workspace/person/student/parent/provider

**Verification:** Screenshot of email and overview sections.

---

### REQ-20260616-054 — WAPI group/contact visibility

**Requirement:** Use WAPI to pull WhatsApp group names and show what groups the operator is in.

**Expected result:** Communications / WhatsApp section lists:
- groups
- members/count if available
- last message
- tags
- pipeline stage
- bot screening status

**Verification:** If credentials unavailable, implement UI/config and mark live WAPI pull blocked.

---

### REQ-20260616-055 — Inbound message screening and tagging pipeline

**Requirement:** Bot should screen inbound WhatsApp/email/messages and tag by pipeline.

**Expected result:** New inbound messages are classified into:
- parent lead
- parent accountability
- student issue
- provider
- payment
- content
- support
- urgent/needs attention
- general

**Verification:** Test on sample inbound message.

---

### REQ-20260616-056 — Contact imports from phone/email exports

**Requirement:** Operator will upload phone contacts and email exports. Contacts need to be imported and tagged, including parents and community groups.

**Expected result:** Add import workflow:
- CSV/vCard/email export upload
- field mapping
- dedupe
- tags
- workspace association
- parent/provider/student classification
- preview before commit

**Verification:** Dry-run import with sample file or placeholder UI if file unavailable.

---

### REQ-20260616-057 — Email communication details must show subject/title and events

**Requirement:** Email cards do not show the subject/title clearly. The operator could not tell what was sent or clicked.

**Expected result:** Email cards show:
- subject
- body summary
- to/from
- sent/received timestamp
- delivery/open/click if tracked
- linked portal reset/access record
- follow-up status

**Verification:** Screenshot.

---

### REQ-20260616-058 — Important inbound parent/accountability messages must trigger alerts

**Requirement:** A parent accountability inbound message contained important child information and should have alerted the operator.

**Expected result:** Inbound parent/accountability messages create:
- in-app alert
- communication record
- parsed parent/student note
- follow-up task if needed
- raw intake link

**Verification:** Reprocess the visible/similar inbound message and show alert.

---

### REQ-20260616-059 — Parent coaching/self-regulation protocol should inform parsing

**Requirement:** Parent messages about child behavior/responsibility/self-regulation should be parsed against BNA’s parent coaching/self-governance protocols.

**Expected result:** Parser produces non-clinical coaching categories:
- sleep/routine
- screens
- responsibility
- food/body regulation
- dignity/connection
- self-governance
- parent follow-up
- child support observation

**Verification:** Sample parse output, no medical diagnosis labels.

---

### REQ-20260616-060 — Communications should surface “top news”

**Requirement:** Important communication events should not be buried.

**Expected result:** Operations overview/Today/Alerts shows high-priority events:
- form filled
- inbound accountability message
- portal link clicked
- payment issue
- parent reply needing follow-up
- failed email
- urgent WhatsApp

**Verification:** Top news/in-app alert appears for test event.

---

### REQ-20260616-061 — Public service-provider pages should lead to provider index/classroom

**Requirement:** Service provider public and portal flows should support:
- public provider page
- provider index
- classroom/community setup
- billing/plans
- portal login

**Expected result:** Coherent provider flow.

**Verification:** Navigation audit.

---

### REQ-20260616-062 — Display audit across every page

**Requirement:** Every page should use space properly and have consistent display behavior.

**Expected result:** Audit these routes at desktop/mobile:
- `/`
- `/parent`
- `/parent/login`
- `/operations`
- `/operations?view=dashboard`
- `/operations?view=tasks&section=activity`
- `/operations?view=settings`
- `/operations?view=communications`
- provider pages
- classroom/community pages
- OneTime/Rabbi pages

**Verification:** Write `ops/display-audits/2026-06-16-display-audit.md`.

---

### REQ-20260616-063 — Remove stale/confusing Family App/Home Accountability naming

**Requirement:** Workspace list and UI contain stale names like Family App/Home Accountability that confuse the model.

**Expected result:** Archive/rename/hide stale labels according to workspace taxonomy.

**Verification:** Workspace UI and data audit.

---

### REQ-20260616-064 — Direct parent/student/provider portal links should be safe public CTAs

**Requirement:** Public nav should not send users straight into private data unless a valid session exists and is scoped.

**Expected result:** Portal links are:
- Parent Login
- Student Login
- Rabbi/Provider Login
- Super/Admin login if needed
No automatic exposure.

**Verification:** Incognito checks.

---

### REQ-20260616-065 — Calendar/Classroom should use internal system first

**Requirement:** Google Calendar/Classroom are coming later. Internal calendar/classroom should work now.

**Expected result:** Google controls are labeled “Coming soon” or “Disconnected.” Internal controls are active.

**Verification:** Calendar/Classroom settings and parent/student calendar.

---

### REQ-20260616-066 — Integration API keys must support encrypted workspace storage and rotation reminders

**Requirement:** Schools/service providers should paste their own API keys in settings with instructions. System stores securely and can remind them to replace keys every 30 days if desired.

**Expected result:** Add integration credential model:
- provider
- workspace_id
- encrypted secret
- test status
- created/rotated timestamps
- optional 30-day reminder

**Verification:** Migration/model/UI, no plaintext secrets.

---

### REQ-20260616-067 — Billing/workflows/automations should be controllable by helper

**Requirement:** The helper should create/disable/edit automations and billing workflows via natural language.

**Expected result:** Helper can explain, draft, create, toggle, and open tickets for workflows.

**Verification:** Sample command creates/toggles a draft automation.

---

### REQ-20260616-068 — Operations copy should explain sections clearly

**Requirement:** The operator often cannot tell what sections mean.

**Expected result:** Add concise explanatory copy/tooltips for:
- Queue Health
- Activity
- Decisions
- Pending
- Agent work
- Communications
- Automations
- Provider Index
- Raw Input Queue
- Research
- Integrations

**Verification:** UI text present.

---

### REQ-20260616-069 — All implementation must update ledger/changelog/register

**Requirement:** Every completed item must leave evidence.

**Expected result:** Update:
- active register
- `ops/agent-changelog.md`
- `ops/agent-task-ledger.jsonl`
- `TASKS.md` if new work remains

**Verification:** Final report cites entries.

---

## 5. Open questions / blockers to handle without stalling

Do not ask Shloimie to clarify before doing obvious safe work. Use safe defaults and mark real blockers.

### Q-20260616-001 — Payment API provider details

If exact payment API/provider credentials are unavailable, build the pricing/config UI and mark API link creation blocked.

### Q-20260616-002 — WAPI credentials

If WAPI credentials are unavailable, build the integration screen and backend placeholders. Mark live group pull blocked.

### Q-20260616-003 — Contact export files

If phone/email export files are not present in repo/runtime, build import workflow and mark actual import blocked pending upload.

### Q-20260616-004 — Exact public copy

Draft copy using BNA tone, but put major marketing copy into review if uncertain.

### Q-20260616-005 — Rabbi Scheller images/assets

Use current external-site reference and placeholders. Mark image replacement pending if assets are not available.

---

## 6. Required audits

Create or update these reports:

```text
ops/security-audits/2026-06-16-portal-security-audit.md
ops/display-audits/2026-06-16-display-audit.md
ops/content-audits/2026-06-16-content-workspace-routing-audit.md
ops/raw-intake-audits/2026-06-16-raw-intake-backfill-audit.md
ops/communications-audits/2026-06-16-communications-alerts-audit.md
```

Each audit must include:
- what was checked
- findings
- fixes applied
- remaining blockers
- verification commands/manual checks

---

## 7. Verification commands

Run all applicable checks:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check src/lib/bna/ramble-protocol.js
node --check src/lib/bna/intake-parser.js
npm test
```

If available:

```bash
npm run watchdog:audit
npm run openai:smoke
npm run screenshot
npm run lighthouse
```

Also run live/manual smokes after deploy:

```text
- public homepage nav desktop/mobile
- parent login incognito
- parent portal logged-in scoped user
- operations overview mobile
- activity page row open/detail
- communications email card
- BNA Helper one instance
- Telegram raw intake
- website/helper raw intake
- class upload raw intake
```

---

## 8. Final answer format for Codex

Return this exact structure:

```text
## Summary

## Raw intake
- Raw ID:
- Register:
- Parsed requirements:
- Parsed tasks:
- Decisions:
- Open questions:

## Files changed

## Requirement status table
REQ ID | Status | Evidence | Files changed | Verification | Remaining issue

## Audits created

## Verification results

## Deploy/live smoke status

## Blockers

## Next required operator decisions
```

Do not claim completion for any REQ unless evidence exists.

---

## 9. Implementation instruction

Begin by updating the active register with this requirement list. Then work through the batches in order.

Security fixes and portal access fixes come before visual polish.

Raw intake and parser guardrails come before reprocessing old content.

Do not start broad visual rewrites until the workspace model and shell rules are clear.

Do not expose private parent/student information while testing.
