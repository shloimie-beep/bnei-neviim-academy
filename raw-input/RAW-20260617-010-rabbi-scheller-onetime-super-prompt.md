# BNA / OneTime Rabbi Scheller Super-Duper Codex Goal Prompt
Date: 2026-06-17
Repository: `shloimie-beep/bnei-neviim-academy`

Use this in Codex **Goal Mode** after the Universal Agentic Goal Memory + Watchdog Hardening layer is installed or currently being installed.

This prompt captures Shloimie’s Rabbi Scheller / OneTime Mishnayos ramble as a raw intake record, meeting-prep pack, website/product brief, and implementation register. It must create tracked goals, tasks, decisions, open questions, and watchdog evidence. Do not silently drop any item.

---

## 0. Stop condition

Before doing this Rabbi Scheller work, verify the hardening layer exists.

Required files/features:

```text
AGENTS.md has Universal Natural Language Intake Protocol
QUALITY-GOALS.md exists
GOAL-MODE.md exists
AGENTIC-MEMORY.md exists
raw-input/README.md exists
bna_raw_intake migration/table plan exists
shared parser/intake modules exist
action/route registries exist
watchdog scripts exist
package.json has watchdog scripts
```

If these are missing, install/finish the hardening prompt first. Then return to this prompt.

---

## 1. Raw intake registration

Create or update the raw intake record:

```text
Raw ID: RAW-20260617-001
Source channel: codex_chat
Intake type: rabbi_scheller_onetime_product_meeting_ramble
Register path: tasks-pending/2026-06-17-rabbi-scheller-onetime-mishnayos-register.md
Workspace/project: one_time_mishnah_class / Rabbi Scheller / OneTime
Related standing goals:
- GOAL-CORE-001 Million-dollar app polish
- GOAL-CORE-002 Every button/action works
- GOAL-CORE-003 Every link/route works
- GOAL-CORE-004 Mobile layout clean
- GOAL-CORE-006 No private data leaks
- GOAL-CORE-007 Raw intake never lost
- GOAL-CORE-008 Natural language parsed into all lanes
- GOAL-CORE-011 Uploaded classes produce class notes, questions, research, tasks
- GOAL-CORE-014 Service-provider/classroom/community coherence
- GOAL-CORE-015 Evidence before done
```

Preserve the raw ramble in the raw-intake queue/database or repo fallback. Do not commit secrets, API keys, private email lists, private customer data, or private meeting location details into public repo files. Use redacted summaries where needed.

Create the register:

```text
tasks-pending/2026-06-17-rabbi-scheller-onetime-mishnayos-register.md
```

It must include:
- raw intake summary
- parsed goals
- requirements
- tasks
- decisions
- open questions
- meeting checklist
- implementation map
- audit/final status table

---

## 2. Context from supplied screenshots

The operator supplied screenshots of:

1. `onetimeonetime.com` hero with black top nav, yellow CTA, looped background video, and headline “Where Kids Fall in Love With Torah.”
2. Alternate hero/video section using Rabbi Scheller imagery and OneTime logo.
3. BNA `/parent` portal showing layout issues, header mismatch, text alignment issues, missing footer, and possible private-dashboard exposure.
4. `/rabbi-member` preview member area with BNA branding where OneTime branding should eventually apply.
5. `/student/login` with BNA shell and a crowded top nav.
6. OneTime landing page content section “Introducing... The OneTime OneTime Academy & Hotline.”
7. OneTime “The Story” section.
8. OneTime footer/contact section.
9. Additional OneTime top/hero screenshots showing black/white/yellow brand.

Use screenshots as visual inspiration and QA references. Do not copy copyrighted text verbatim unless the operator/Rabbi Scheller provides permission or approved source copy. Preserve structure, brand direction, and original drafted copy; paraphrase when not explicitly approved.

---

## 3. Product direction

This is not a full “OneTime Academy & Hotline” rebuild right now.

Current focused offer:

```text
Worldwide OneTime Mishnayos
Worldwide Mishnah Shir / Worldwide Mishnah Class
Live from Eretz Yisrael / the Holy Land
A live Mishnayos class where kids fall in love with Torah
Simple CTA: Join the Shir / Join the Class
Price: $67
Future upsell: higher-tier VIP class, likely $400–$500, capped around 30 kids, 12-week summer module
```

Avoid messaging that over-focuses on “school” for this offer. This is a live Mishnayos class / shir and digital library/community portal.

Potential language to draft for operator review:

```text
Worldwide OneTime Mishnayos
The live Mishnah class kids actually look forward to.
Join Rabbi Eli Scheller live from Eretz Yisrael for a Mishnah experience full of energy, warmth, stories, and real Torah connection.
```

Do not finalize marketing copy without review if uncertain. Create draft copy cards for approval.

---

## 4. Meeting prep for tomorrow

Create a meeting-prep card/task for the Rabbi Scheller meeting.

Meeting:

```text
Rabbi Scheller meeting
Date: tomorrow relative to intake date, confirm exact calendar date/timezone
Time: about 8:30
Location: his house / in-person
```

Do not put private address in public repo. Use redacted location text.

Agenda items:

1. Zoom API access and developer access.
2. GoDaddy access / delegate access / security code issue.
3. Resend setup and whether to use existing/new account/domain.
4. Vimeo API/access and whether videos can be managed/imported through API.
5. Get or confirm rights to use the background hero video.
6. Get or confirm rights to use the vertical hero image and graphics folder.
7. Confirm final offer name: Worldwide OneTime Mishnayos / Worldwide Mishnah Shir / Worldwide Mishnah Class.
8. Confirm $67 plan.
9. Discuss higher-tier VIP class pricing: $400–$500.
10. Discuss 12-week summer module dates.
11. Discuss expected number of kids, possibly 30 for VIP.
12. Discuss transition for existing active/live subscribers.
13. Discuss free month for currently live members during migration.
14. Review old subscriber/customer email list.
15. Review email sequence drafts.
16. Confirm UK/homeschool/after-school positioning.
17. Confirm student digital library concept.
18. Confirm parent-monitored portal/accountability upsell boundaries.
19. Confirm student reply/publish moderation model.
20. Confirm whether to rebuild current Replit site inside BNA repo or keep external site temporarily.
21. Confirm Telegram bot status and backlog capture.
22. Confirm internal calendar/timeline: when each item must be ready.

Create dashboard walkthrough tasks for:
- Zoom setup
- GoDaddy delegate access
- Resend setup
- Vimeo/API access check
- payment/pricing setup
- email sequence approval
- website assets collection

Each walkthrough task must say exactly what page/account to open, what information to collect, where to paste/store secrets, and what not to share publicly.

---

## 5. External integration notes for meeting walkthroughs

Use current official docs when implementing/checking.

### Zoom

Build a walkthrough for Zoom Server-to-Server OAuth or equivalent current Zoom app flow. Capture:
- who must be account owner/admin
- app type to create
- account ID / client ID / client secret
- required scopes
- token generation/expiry
- test endpoint
- storage location for credentials

Do not store credentials in repo.

### GoDaddy

Build a GoDaddy delegate-access walkthrough:
- owner logs in
- opens Delegate Access page
- invites Shloimie/developer email
- selects appropriate access level
- handles 2FA/security code live with owner if needed
- notes invitation expiry if applicable
- does not request/share password or permanent SMS codes

### Resend

Build Resend setup walkthrough:
- account/team/domain decision
- create domain / verify DNS
- create API key
- store key securely
- test send
- logs/monitoring
- key rotation reminder

### Vimeo

Build Vimeo/API access check:
- confirm current account plan/API permissions
- confirm whether video asset/background video may be downloaded/embedded/managed
- confirm whether API credentials/app are available
- if API is blocked, use approved downloaded video asset/manual upload path
- do not scrape or bypass access controls

---

## 6. Media/Canva/hero image requirements

### REQ-20260617-001 — Hero media asset plan

**Requirement:** Support both desktop and mobile hero assets for OneTime Mishnayos.

**Recommendation:** Use separate exports:
- Desktop hero/background video poster: `1920x1080` or wider 16:9 crop.
- Mobile portrait hero: `1080x1920`.
- If using one vertical image, use CSS `object-fit: cover`, focal-point controls, and separate mobile/desktop poster crops to avoid ugly stretching.

**Expected result:** The hero video/image looks crisp on desktop and mobile without stretching.

**Verification:** Screenshots at 390px, 768px, 1440px.

### REQ-20260617-002 — Use downloaded Vimeo hero video safely

**Requirement:** Operator downloaded the background video from Vimeo and wants it on the new page and possibly BNA webpage.

**Expected result:** Add video asset only if it is present locally and rights/permission are confirmed. Use optimized web video format and poster image. Do not commit huge raw video if repo size becomes a problem; use approved public/static storage or CDN path.

**Verification:** Page loads fast, video loops/mutes/plays inline, fallback poster works.

### REQ-20260617-003 — Use vertical OneTime graphic/assets from Downloads folder if available

**Requirement:** Operator has a OneTime graphics folder in Downloads and wants those graphics used.

**Expected result:** Codex should not assume access to `Downloads` in repo. Create asset intake instructions:
- operator drops assets into agreed folder
- script optimizes/copies to `public/images/onetime/`
- filenames are clean
- source/permission notes tracked

**Verification:** Asset manifest and screenshots.

---

## 7. OneTime / Rabbi Scheller landing page requirements

### REQ-20260617-004 — Build focused OneTime Mishnayos landing page

Create a page for the focused offer. Candidate routes:

```text
/onetime
/onetime/mishnayos
/rabbi-scheller
```

Pick the route that fits existing routing and document it.

Page should include:
- black top toolbar
- OneTime logo
- yellow CTA style
- hero video background
- headline around Worldwide OneTime Mishnayos / live Mishnah class
- simple Join button
- short proof/positioning sections
- story/about Rabbi Scheller section
- digital library/class access section
- parent/student portal explanation
- footer/contact
- no clutter
- mobile-first behavior

### REQ-20260617-005 — One button primary CTA

**Requirement:** Keep the landing page simple. Main CTA should be one button:

```text
Join the Shir
Join the Class
Join Now
```

Pick one, or create copy variants for review.

### REQ-20260617-006 — Do not call it “Academy & Hotline” unless explicitly chosen

**Requirement:** The current focus is worldwide Mishnah class/shir, not full Academy/Hotline.

**Expected result:** Page copy uses the focused offer name and avoids confusing old language.

### REQ-20260617-007 — Pricing visible/configured at $67

**Requirement:** $67 plan is the main class subscription.

**Expected result:** Pricing section/config exists. Payment action is ready or marked blocked pending provider/API.

### REQ-20260617-008 — VIP summer module as future upsell

**Requirement:** Track future upsell:
- $400–$500
- 30 kids
- 12-week summer VIP Rebbe class/module
- dates need Rabbi confirmation

**Expected result:** Create goal/task/product note, not necessarily public page unless approved.

### REQ-20260617-009 — Use OneTime black/yellow/white brand

**Requirement:** White-label page should look like Rabbi Scheller / OneTime brand.

**Expected result:** Brand tokens:
- black/dark background
- bright yellow CTA/accent
- white text
- bold, energetic, Torah/kids class feeling
- OneTime logo if asset available

---

## 8. Student/parent/provider portal behavior for OneTime

### REQ-20260617-010 — Student digital library

**Requirement:** Each student/member should have their own digital library for the OneTime Mishnayos class.

**Expected result:** Student portal/service-provider section shows:
- enrolled OneTime class
- recorded classes/library
- live sessions
- messages from Rabbi
- replies/submissions
- moderated public display items

### REQ-20260617-011 — Parent portal sync

**Requirement:** Parent portal should show which service-provider/class the child is enrolled in and relevant billing/accounting status.

**Expected result:** Parent sees child’s OneTime enrollment, class access, service-provider link, and billing status where applicable.

### REQ-20260617-012 — No AI bot for OneTime kids initially

**Requirement:** Do not give OneTime kids a bot right now. Kids can respond in portal. Parents can monitor as designed.

**Expected result:** No child-facing AI chat bot for this service-provider program unless later approved.

### REQ-20260617-013 — Rabbi bulk messages and moderated replies

**Requirement:** Rabbi can bulk message students. Students reply privately from their portals. Rabbi can choose replies/questions to publish to a community/front-page display.

**Expected result:** Data model/UI supports:
- teacher broadcast
- private student replies
- teacher moderation queue
- publish selected responses
- public/community display
- students cannot publish directly to public chat

### REQ-20260617-014 — Ask follow-up discussion prompts

**Requirement:** Rabbi can publish a student answer and ask other students “What do you think about his answer?”

**Expected result:** Moderated discussion prompt model supports teacher-led dialogue.

---

## 9. Parent/student portal UI fixes from screenshots

### REQ-20260617-015 — Parent portal layout polish

**Requirement:** Parent portal text is misaligned/sloppy, some labels need bolding, layout needs cleaner typography, and page should not scroll endlessly without footer.

**Expected result:** Parent portal has:
- consistent header
- clean cards
- aligned labels
- readable typography
- footer/end section
- working logo
- no weird infinite-looking blank page

### REQ-20260617-016 — Parent portal header matches site system

**Requirement:** Portal/login/form pages should use same public header style unless inside Operations.

**Expected result:** Static consistent header/footer across:
- parent login
- parent portal shell
- student login
- rabbi/provider member page
- registration/forms

### REQ-20260617-017 — Parent portal security check

**Requirement:** Parent portal appears to open a parent dashboard directly on this computer. Determine whether this is due to valid local session or an auth leak.

**Expected result:** Logged-out/incognito route test:
- public link never exposes private data
- `/parent` redirects to login if unauthenticated
- authenticated parent only sees own household
- session expiry works
- route caching does not leak private content

**Verification:** Security audit report and screenshots.

### REQ-20260617-018 — Student login header simplification

**Requirement:** Student login top toolbar has too many buttons.

**Expected result:** Student login page top nav should be minimal:
- logo
- Public site
- Families or Register
- Portal login / correct login context
- Hebrew toggle
- menu dropdown for extras

Remove confusing top clutter.

### REQ-20260617-019 — Portal login should be role-aware

**Requirement:** A unified portal login can route by email/session to the correct role/workspace: parent, teacher/provider, student, admin.

**Expected result:** “Portal Login” can safely route users after auth/scoping. Do not expose role data publicly.

---

## 10. Public BNA site nav/content changes

### REQ-20260617-020 — Main header simplified

**Requirement:** Too many buttons in top toolbar. Desired top:
- Home
- Portal Login
- Register
- Hebrew toggle
- dropdown menu for everything else

Also replace “Become a Service Provider” with something like:

```text
Advertise your Chug for Free
Do you work with kids? Advertise for free
```

Create copy variants.

### REQ-20260617-021 — Add Technology section

**Requirement:** Add a public section/page about technology:
- how BNA incorporates AI
- technology as a nisayon and power of this generation
- harnessing it for self-governance/accountability
- app/accountability system
- families and service providers

**Expected result:** Public nav/dropdown includes Technology. Page/section copy is drafted for review.

### REQ-20260617-022 — Service provider explanation

**Requirement:** Explain how service providers work:
- index
- advertising chug/service
- kids/classes
- provider portal
- classroom/community features
- parent/student visibility

**Expected result:** Clear public path for service providers.

---

## 11. Parent meeting uploads and parsing

### REQ-20260617-023 — Parent meeting upload parser status

**Requirement:** When a meeting is uploaded, it should parse and show whether it was applied.

**Expected result:** Parent/admin meeting upload flow shows:
- uploaded
- transcribed
- parsed
- applied to goals/calendar/student notes/content/research
- failed/needs review
- linked raw intake ID

### REQ-20260617-024 — Parent content section

**Requirement:** Parent portal should have a content section where appropriate.

**Expected result:** Parent can see permitted content relevant to their child/family/service-provider enrollment.

---

## 12. Resend / Zoom / Vimeo / GoDaddy walkthroughs

### REQ-20260617-025 — Dashboard walkthrough cards

**Requirement:** Whenever Shloimie needs help with setup, the task should include a clear walkthrough.

Create cards/tasks for:
- Zoom API/developer access
- GoDaddy delegate access/security code
- Resend setup
- Vimeo API/access check
- payment link setup
- OneTime media asset import
- email sequence review

Each should include:
- objective
- account owner needed?
- exact page to visit
- fields to copy/paste
- where to store secret
- test result
- blocker status
- meeting discussion notes

### REQ-20260617-026 — Meeting dashboard card

**Requirement:** Meeting notes should show up on dashboard for tomorrow’s meeting.

**Expected result:** A “Rabbi Scheller Meeting Prep” card appears in Operations/Tasks/Calendar or the correct internal location.

---

## 13. Email sequence and customer list

### REQ-20260617-027 — Existing customer/subscriber summary

**Requirement:** Add a task/note to summarize existing customers/subscribers:
- currently live/active
- former subscribers
- UK/homeschool/after-school audience
- who gets migration free month
- who gets relaunch email

Do not commit raw email list. Use secure import/storage.

### REQ-20260617-028 — Email sequence drafts for approval

**Requirement:** Draft email sequence for Rabbi Scheller’s customer list, but do not send.

Segments:
- currently active/live members
- former subscribers
- UK families
- homeschoolers
- schools/classes
- general interested list

Message themes:
- new worldwide Mishnah learning program live from Eretz Yisrael
- $67 subscription
- free migration month for active users if approved
- digital library
- Sunday/after-school/homeschool access
- student portal
- parent-monitored access
- VIP class future option

Output should be draft cards in Content/Communications for Rabbi approval.

### REQ-20260617-029 — Add email copy to meeting note card

**Requirement:** Add sample/draft email to Rabbi meeting prep card so he can review language.

---

## 14. Telegram bot and backlog

### REQ-20260617-030 — Telegram bot status audit

**Requirement:** Operator thinks Telegram bot may have stopped working.

**Expected result:** Audit:
- bridge process
- bot token configured
- latest update offset
- command response
- raw intake capture
- OpenAI/Kimi mode
- errors/logs
- backlog count

### REQ-20260617-031 — Backlog capture and prior ramble recovery

**Requirement:** There is likely backlog because previous rambles were not captured.

**Expected result:** Run raw-intake drift/backfill audit and list:
- unparsed Telegram messages
- unparsed Drive uploads
- unparsed class recordings
- unregistered tasks
- orphan content jobs
- next action for each

Do not expose private contents in repo logs.

---

## 15. Calendar / readiness timeline

### REQ-20260617-032 — Internal calendar/timeline for Rabbi work

**Requirement:** Put readiness/timeline into internal calendar/task system.

**Expected result:** Track:
- meeting tomorrow
- website draft
- asset import
- email drafts
- Zoom setup
- Resend setup
- Vimeo check
- GoDaddy access
- $67 payment setup
- Rabbi approval
- launch target

If Google Calendar connector is “coming soon,” use internal calendar/tasks and mark Google sync pending.

---

## 16. Implementation notes and safety

### Secrets

Never commit:
- Zoom client secret
- Resend API key
- Vimeo tokens
- GoDaddy credentials
- email lists
- raw private customer data
- SMS/security codes
- private meeting address
- payment provider keys

Use:
- `.secrets/` local only
- Railway env vars
- encrypted workspace credentials table
- redacted audit summaries

### Copyright/asset permission

Do not scrape or use copyrighted text/media without permission. The operator says he downloaded the video. Still create an asset-permission checklist:
- who owns video
- permission to use on new site
- where stored
- optimization status
- fallback poster

### Public/private boundary

Keep service-provider member/library pages protected unless intentionally public. Public landing page can market the offer; library/class access is private after login/payment.

---

## 17. Required files/reports

Create/update:

```text
tasks-pending/2026-06-17-rabbi-scheller-onetime-mishnayos-register.md
ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md
ops/asset-audits/2026-06-17-onetime-assets-audit.md
ops/security-audits/2026-06-17-parent-portal-access-audit.md
ops/telegram-audits/2026-06-17-telegram-bot-status-audit.md
ops/raw-intake-audits/2026-06-17-backlog-recovery-audit.md
ops/email-drafts/2026-06-17-rabbi-scheller-relaunch-sequence.md
```

If directories do not exist, create them.

---

## 18. Verification

Run:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
npm test
npm run watchdog:audit
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
```

If UI changed:

```bash
npm run watchdog:ui
npm run watchdog:visual
```

Manual/live smoke targets:

```text
/onetime or selected route
/rabbi-member
/student/login
/parent/login
/parent incognito logged-out
/parent logged-in valid parent
public homepage nav desktop/mobile
Telegram bot /status or safe smoke
```

---

## 19. Final Codex response format

Return:

```text
## Summary

## Raw intake
- Raw ID:
- Register:
- Parsed requirements:
- Parsed tasks:
- Decisions:
- Open questions:

## Meeting prep created
- Meeting card:
- Walkthrough tasks:

## Website/page changes
- Route:
- Assets:
- CTA:
- Payment status:

## Security findings
- Parent portal:
- Student/provider portals:

## Telegram/backlog findings

## Files changed

## Requirement status table
ID | Status | Evidence | Files changed | Verification | Remaining issue

## Verification results

## Blockers
Only real blockers.

## What Shloimie needs to bring to tomorrow’s meeting
```

Do not claim “done” unless the item is implemented, verified, and the relevant watchdogs pass.

---

## 20. What Shloimie needs for tomorrow’s meeting

At the end, generate a concise operator-facing checklist:

```text
1. Ask Rabbi for Zoom owner/admin access or owner to create S2S OAuth app.
2. Ask Rabbi to open GoDaddy Delegate Access and invite Shloimie.
3. Ask Rabbi whether to use existing Resend/domain or create new.
4. Ask Rabbi about Vimeo API/account access and permission to use video.
5. Confirm final offer name.
6. Confirm $67 price.
7. Confirm VIP class price/date/cap.
8. Confirm free month for active users.
9. Review email sequence.
10. Confirm student digital library and moderated reply model.
11. Confirm background video and hero image assets.
```
