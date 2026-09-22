# Ramble Intake - 2026-06-17 - rabbi-scheller-onetime-mishnayos

This register tracks the Rabbi Scheller / OneTime Mishnayos Goal Mode packet
from `C:\Users\User\Downloads\bna_rabbi_scheller_onetime_super_prompt_2026_06_17.md`.

## Raw intake

- Raw prompt preserved at `raw-input/RAW-20260617-010-rabbi-scheller-onetime-super-prompt.md`.
- The packet requested `RAW-20260617-001` and `REQ-20260617-001` through
  `REQ-20260617-032`, but those IDs were already allocated earlier on
  2026-06-17. This register assigns the next free repo IDs and keeps the
  packet IDs as source/provenance labels.
- ID repair note: this register briefly used `RAW-20260617-009` and
  `REQ-20260617-140` through `REQ-20260617-171` during intake. Those collided
  with the already-closed helper deep-link navigation work, so this packet was
  repaired to `RAW-20260617-010` and `REQ-20260617-172` through
  `REQ-20260617-203`.
- Source channel: `codex_chat`.
- Intake type: `rabbi_scheller_onetime_product_meeting_ramble`.
- Workspace/project: `one_time_mishnah_class / Rabbi Scheller / OneTime`.
- Parse status: `registered`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260617-010 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-17-rabbi-scheller-onetime-mishnayos-register.md |
| Raw storage | raw-input/RAW-20260617-010-rabbi-scheller-onetime-super-prompt.md |
| Source file | C:\Users\User\Downloads\bna_rabbi_scheller_onetime_super_prompt_2026_06_17.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Register and execute the Rabbi Scheller / OneTime Mishnayos packet through terminal statuses or explicit blockers. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in practical batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | External/blocker rows: REQ-20260617-173, REQ-20260617-182, and REQ-20260617-191; all other rows have terminal proof/status in this register. |

## Hardening prerequisite check

| Prerequisite | Status | Evidence |
|---|---|---|
| AGENTS.md has universal intake protocol | Already satisfied | `AGENTS.md` includes Universal Natural Language Intake Protocol and Goal-Mode Ramble Execution Trigger. |
| QUALITY-GOALS.md exists | Already satisfied | `QUALITY-GOALS.md` exists. |
| GOAL-MODE.md exists | Already satisfied | `GOAL-MODE.md` exists. |
| AGENTIC-MEMORY.md exists | Already satisfied | `AGENTIC-MEMORY.md` exists. |
| raw-input/README.md exists | Already satisfied | `raw-input/README.md` exists. |
| bna_raw_intake migration/table plan exists | Already satisfied | `railway-migration-2026-06-16-raw-intake-queue.sql` and server startup SQL include `bna_raw_intake`. |
| shared parser/intake modules exist | Already satisfied | `src/lib/bna/intake-parser.js`, `src/lib/bna/intake-schema.js`, and `src/lib/bna/ramble-protocol.js`. |
| action/route registries exist | Already satisfied | `ops/action-registry.json`, `ops/action-registry/`, and `ops/route-registry.json`. |
| watchdog scripts exist | Already satisfied | `scripts/watchdog-*.mjs` and `scripts/lib/watchdog-common.mjs`. |
| package.json has watchdog scripts | Already satisfied | `package.json` includes `watchdog:audit`, `watchdog:links`, `watchdog:actions`, `watchdog:security`, `watchdog:ui`, and `watchdog:visual`. |

## Parsed requirements

| ID | Packet ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260617-172 | REQ-20260617-001 | Plan desktop/mobile OneTime hero assets | Asset plan names 16:9 desktop, 9:16 mobile, focal-point handling, and screenshot sizes. | Assets / website | Asset audit and responsive screenshots. | Done |
| REQ-20260617-173 | REQ-20260617-002 | Use downloaded Vimeo hero video only when present and permitted | No raw video committed without asset plus rights confirmation; poster fallback documented. | Assets / website | Asset audit; page load check. | Blocked |
| REQ-20260617-174 | REQ-20260617-003 | Create OneTime graphics intake instructions | Operator can drop approved assets, optimize/copy to `public/images/onetime/`, and track source notes. | Assets | Asset audit. | Done |
| REQ-20260617-175 | REQ-20260617-004 | Build focused OneTime Mishnayos landing page | Existing `/one-time` route is focused on Worldwide OneTime Mishnayos, live Mishnah shir, $67 offer, simple CTA, and portal/library explanation. | Public website | Syntax/static tests, local browser screenshots, live smoke after deploy. | Done |
| REQ-20260617-176 | REQ-20260617-005 | Use one primary CTA | Landing page has one primary `Join the Shir` CTA. | Public website | Static test and screenshot. | Done |
| REQ-20260617-177 | REQ-20260617-006 | Avoid Academy & Hotline naming for focused offer | Public copy uses Mishnayos/shir/class language, not the broader old offer name. | Public website / copy | Static test. | Done |
| REQ-20260617-178 | REQ-20260617-007 | Show/configure $67 main plan | Main class offer visibly shows $67 with payment still blocked until provider/link approval. | Public website / payment | Static test; checkout guard. | Done |
| REQ-20260617-179 | REQ-20260617-008 | Track VIP summer module as future upsell | VIP module is internal/product-note only pending dates, cap, and price approval. | Product notes | Register and meeting prep. | Done |
| REQ-20260617-180 | REQ-20260617-009 | Use OneTime black/yellow/white brand | OneTime pages use black/dark, yellow, white, and OneTime logo/assets. | Public website | Screenshot. | Done |
| REQ-20260617-181 | REQ-20260617-010 | Represent student digital library | Student/member area supports enrolled class, library, live sessions, Rabbi messages, private replies, and moderated public display planning. | Student/member portal | Route/API inspection; smoke. | Done |
| REQ-20260617-182 | REQ-20260617-011 | Parent portal sync for service-provider enrollment and billing | Parent view can safely show child enrollment/provider/accounting status when data exists. | Parent portal | Route/API inspection; security smoke. | Blocked |
| REQ-20260617-183 | REQ-20260617-012 | Keep child-facing AI bot off OneTime for now | No OneTime child AI bot is launched without later approval. | Student/member portal | Code inspection. | Done |
| REQ-20260617-184 | REQ-20260617-013 | Support Rabbi broadcasts, private replies, moderation, and selected public display | First-party model/UI supports teacher broadcast, private replies, moderation queue, and selected display. | OneTime classroom/community | Route/API inspection; tests. | Done |
| REQ-20260617-185 | REQ-20260617-014 | Support teacher-led follow-up discussion prompts | Rabbi can publish a prompt based on a selected student answer; students cannot publish directly to public chat. | OneTime classroom/community | Route/API inspection; tests. | Done |
| REQ-20260617-186 | REQ-20260617-015 | Polish parent portal layout | Parent portal has clean typography/cards/footer and no endless blank page feel. | Parent portal | Visual/browser smoke. | Already satisfied |
| REQ-20260617-187 | REQ-20260617-016 | Align portal/login headers with site system | Parent/student/provider/login/form headers are consistent enough outside Operations. | Portal shells | Visual/browser smoke. | Already satisfied |
| REQ-20260617-188 | REQ-20260617-017 | Audit parent portal auth safety | `/parent` logged-out/incognito never exposes private data; session scoping works. | Parent portal security | Security audit and live/private-route smoke. | Done |
| REQ-20260617-189 | REQ-20260617-018 | Simplify student login header | Student login topbar is minimal and not crowded. | Student login | Visual/browser smoke. | Already satisfied |
| REQ-20260617-190 | REQ-20260617-019 | Make portal login role-aware | Unified portal login can route safely by role without public role leaks. | Auth / portals | Code inspection; security smoke. | Already satisfied |
| REQ-20260617-191 | REQ-20260617-020 | Simplify public BNA header and service-provider CTA | Header favors Home, Portal Login, Register, Hebrew, dropdown; provider CTA copy offers free chug advertising. | Public website | Static/visual test. | Needs operator decision |
| REQ-20260617-192 | REQ-20260617-021 | Add Technology section/page | Public site includes technology/AI/self-governance/accountability copy for review. | Public website content | Code inspection; visual check. | Already satisfied |
| REQ-20260617-193 | REQ-20260617-022 | Explain service provider model | Public path explains provider listing, chug ads, provider portal, classroom/community, parent/student visibility. | Public website content | Code inspection; visual check. | Already satisfied |
| REQ-20260617-194 | REQ-20260617-023 | Show parent meeting upload parse status | Upload flow shows uploaded/transcribed/parsed/applied/failed plus raw intake ID. | Intake / parent/admin uploads | Route/API inspection; tests. | Already satisfied |
| REQ-20260617-195 | REQ-20260617-024 | Add parent content section where appropriate | Parent sees only permitted content tied to family/provider enrollment. | Parent portal | Route/UI inspection; security smoke. | Already satisfied |
| REQ-20260617-196 | REQ-20260617-025 | Create dashboard walkthrough cards | Zoom, GoDaddy, Resend, Vimeo, payment, media import, and email review walkthroughs are written and task-ready. | Operations tasks / meeting prep | Meeting prep file. | Done |
| REQ-20260617-197 | REQ-20260617-026 | Create Rabbi Scheller meeting prep card | Meeting prep exists for 2026-06-18 about 8:30 with private location redacted. | Operations tasks / calendar | Meeting prep file; dashboard follow-up if API available. | Done |
| REQ-20260617-198 | REQ-20260617-027 | Track existing customer/subscriber summary task | Customer list review is captured without committing raw email lists. | Contacts / accounting | Meeting prep and register. | Done |
| REQ-20260617-199 | REQ-20260617-028 | Draft relaunch email sequence for approval only | Segment drafts exist; no send/external write. | Communications/content | Email draft file. | Done |
| REQ-20260617-200 | REQ-20260617-029 | Add sample email copy to meeting prep | Rabbi can review language during meeting. | Meeting prep | Meeting prep file. | Done |
| REQ-20260617-201 | REQ-20260617-030 | Audit Telegram bot status | Bridge/process/token metadata/update offset/status/raw intake/provider mode/log/backlog are checked without exposing secrets. | Telegram bridge | Telegram audit. | Done |
| REQ-20260617-202 | REQ-20260617-031 | Audit backlog recovery | Unparsed Telegram/Drive/recording/task/content backlog is listed redacted with next action. | Raw intake / backlog | Raw-intake audit. | Done |
| REQ-20260617-203 | REQ-20260617-032 | Track internal calendar/readiness timeline | Meeting, website, assets, emails, access setup, payment, approval, and launch readiness are timeline tasks. | Operations calendar/tasks | Meeting prep; TASKS/ledger. | Done |

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-641 | Prepare Rabbi Scheller meeting pack | Codex | Operations / Calendar | "Create a meeting-prep card/task for the Rabbi Scheller meeting." | Meeting pack exists with walkthroughs, sample emails, blockers, and checklist. | Done |
| TASK-20260617-642 | Refocus `/one-time` landing page | Codex | Public website | "Build focused OneTime Mishnayos landing page." | `/one-time` communicates the focused $67 live Mishnah shir offer with one primary CTA and safe no-checkout guard. | Done |
| TASK-20260617-643 | Audit OneTime assets | Codex | Assets | "Support both desktop and mobile hero assets." | Asset audit lists available files, missing video, permission blockers, and import path. | Done |
| TASK-20260617-644 | Audit parent/student/member security and UI | Codex | Portals / Security | "Parent portal security check." | Security audit names inspected routes, what passed, what remains blocked, and screenshots if taken. | Done |
| TASK-20260617-645 | Draft Rabbi Scheller relaunch emails | Codex | Communications | "Draft email sequence ... but do not send." | Draft sequence file exists by segment and is explicitly approval-only. | Done |
| TASK-20260617-646 | Audit Telegram/backlog health | Codex | Telegram / Intake | "Operator thinks Telegram bot may have stopped working." | Redacted audit covers bridge, `/status` safe smoke if possible, and backlog next actions. | Done |
| TASK-20260617-647 | Track readiness timeline | Codex | Operations / Calendar | "Put readiness/timeline into internal calendar/task system." | Timeline exists in meeting prep/TASKS with Google Calendar sync marked pending if unavailable. | Done |

## Decisions

| ID | Decision | Impact | Where stored | Status |
|---|---|---|---|---|
| DEC-20260617-002 | Final offer name: Worldwide OneTime Mishnayos, Worldwide Mishnah Shir, or Worldwide Mishnah Class | Controls page H1, emails, payment labels, and portal naming. | Meeting prep | Needs operator/Rabbi decision |
| DEC-20260617-003 | CTA label: Join the Shir, Join the Class, or Join Now | Controls primary conversion language. | Landing page draft and meeting prep | Draft uses `Join the Shir`; needs approval |
| DEC-20260617-004 | Payment provider/link for the $67 plan | Blocks live checkout/payment action. | Meeting prep / Operations settings | Needs operator/Rabbi decision |
| DEC-20260617-005 | Use existing Resend/domain or create new account/domain | Blocks email production send readiness. | Meeting prep | Needs account-owner decision |
| DEC-20260617-006 | VIP module price, dates, and cap | Controls future upsell product, not current public page. | Meeting prep | Needs operator/Rabbi decision |
| DEC-20260617-007 | Permission to use downloaded video/images | Blocks hero-video and asset publishing. | Asset audit | Needs rights confirmation |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260617-140 | Is the 8:30 meeting time AM or PM, and is Asia/Jerusalem the intended timezone? | Calendar precision and reminders. | No for prep, yes for external calendar sync | Open |
| Q-20260617-141 | What is the final public offer name? | Avoids confusing copy and payment labels. | Yes for launch copy | Open |
| Q-20260617-142 | Is $67 monthly, one-time, or first module pricing? | Prevents wrong checkout/billing. | Yes for payment | Open |
| Q-20260617-143 | Who owns/approves the Vimeo background video and OneTime graphics? | Asset rights and repository/CDN storage. | Yes for video use | Open |
| Q-20260617-144 | Which payment provider should own the live plan? | Blocks live payment button. | Yes for checkout | Open |
| Q-20260617-145 | Should existing live subscribers get a free migration month? | Affects email segmentation and access grants. | Yes for customer communications | Open |
| Q-20260617-146 | Should the public BNA nav be simplified now or in a separate batch? | Larger homepage surface with possible design/regression blast radius. | No | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260617-002 | Immediate OneTime focus is the live Mishnayos class/shir, not the broader Academy & Hotline rebuild. | Yes | Stable product direction for future copy/work. |
| MEM-20260617-003 | The initial OneTime child/member experience should not include a child-facing AI bot. | Yes | Durable safety/product boundary. |
| MEM-20260617-004 | OneTime live payment remains blocked until provider choice, credentials/links, and rights/copy approvals exist. | Maybe | Already partly in memory; update only if not covered. |

## Meeting checklist

See `ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md`.

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260617-175 through REQ-20260617-180 | `public/one-time/index.html`, `server.js`, `ops/route-registry.json`, `ops/action-registry.json`, tests | Refocus existing `/one-time` route; add `/one-time/mishnayos` alias; register actions/routes; keep payment disabled. | `node --check server.js`, static landing test, browser screenshots. |
| REQ-20260617-196 through REQ-20260617-200 and REQ-20260617-203 | `ops/meeting-prep/*`, `ops/email-drafts/*`, `TASKS.md`, ledger/changelog | Write meeting prep, walkthroughs, sample email, and timeline. | File inspection; watchdog audit. |
| REQ-20260617-172 through REQ-20260617-174 | `ops/asset-audits/*`, `public/images/onetime/` if approved | Audit local assets and leave video blocked until present/approved. | Asset audit; image listing. |
| REQ-20260617-188, REQ-20260617-201, REQ-20260617-202 | security/Telegram/backlog audits | Inspect local app/security prior proof, run safe local checks, document blockers. | Audit files and focused scripts. |

## Final audit

Status summary: 21 Done, 8 Already satisfied, 2 Blocked, 1 Needs operator
decision, 0 Pending.

Post-closeout verification:

- Focused OneTime/classroom/provider/parent tests passed 36/36.
- Full `npm test` passed 721/721.
- `npm run watchdog:actions` passed:
  `ops/watchdog-audits/2026-06-17T14-36-watchdog-action-audit.md`.
- `npm run watchdog:security` passed:
  `ops/watchdog-audits/2026-06-17T14-36-watchdog-security-routes.md`.
- `npm run watchdog:links` passed:
  `ops/watchdog-audits/2026-06-17T14-36-watchdog-link-audit.md`.
- `npm run watchdog:audit` passed:
  `ops/watchdog-audits/2026-06-17T14-37-watchdog-audit.md`.
- `npm run watchdog:ui` passed:
  `ops/watchdog-audits/2026-06-17T14-37-watchdog-ui-smoke.md`.
- `npm run watchdog:visual` passed:
  `ops/watchdog-audits/2026-06-17T14-37-watchdog-visual-baseline.md`.

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-172 | Done | Asset plan names 16:9 desktop, 9:16 mobile, focal-point handling, and required screenshots. | `ops/asset-audits/2026-06-17-onetime-assets-audit.md` | Local responsive screenshots at 390, 768, and 1440 in `ops/playwright-smokes/2026-06-17-onetime-focused-landing-local/report.md`. | OneTime-specific approved media still needed under REQ-20260617-173. |
| REQ-20260617-173 | Blocked | No local hero video was found and usage rights are not confirmed. | None | Downloads video scan found no matching `.mp4`, `.mov`, `.webm`, or `.m4v`; asset audit records rights blocker. | Need approved video file/source and permission notes. |
| REQ-20260617-174 | Done | Graphics intake/import instructions are written. | `ops/asset-audits/2026-06-17-onetime-assets-audit.md` | Asset audit lists import steps, storage rules, and screenshot requirements. | Future approved assets should be copied to `public/images/onetime/` after rights confirmation. |
| REQ-20260617-175 | Done | `/one-time` and `/one-time/mishnayos` serve the focused Worldwide OneTime Mishnayos draft page. | `public/one-time/index.html`; `server.js`; `ops/route-registry.json`; `tests/one-time-focused-landing.test.js` | Static test, local screenshots, and live smoke `ops/live-smokes/2026-06-17T14-28-38-904Z-onetime-focused-landing-live-smoke.md`. | Final offer name/copy still needs Rabbi/Shloimie approval. |
| REQ-20260617-176 | Done | One primary `Join the Shir` CTA is visible. | `public/one-time/index.html`; `ops/action-registry.json` | Static test, local screenshots, and live focused landing smoke. | CTA label is still a draft decision. |
| REQ-20260617-177 | Done | Focused page avoids old Academy & Hotline copy. | `public/one-time/index.html`; `tests/one-time-focused-landing.test.js` | Static test and live focused landing smoke both checked old copy absence. | None. |
| REQ-20260617-178 | Done | Page shows `$67 planned` and explicitly blocks payment/provider/link actions. | `public/one-time/index.html`; `tests/one-time-focused-landing.test.js` | Live focused landing smoke checked no active charge/access/send language. | Billing cadence and payment provider remain decision blockers before live checkout. |
| REQ-20260617-179 | Done | VIP summer module is tracked as future/internal review only. | `ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md` | Meeting prep agenda captures price/date/cap decision. | Need Rabbi/Shloimie decision before public upsell. |
| REQ-20260617-180 | Done | Focused OneTime draft uses dark/yellow/white styling and OneTime logo direction with a temporary text-free learning image. | `public/one-time/index.html`; `ops/asset-audits/2026-06-17-onetime-assets-audit.md` | Local screenshots and live smoke verified the current page. | Replace fallback image after approved OneTime/Rabbi media arrives. |
| REQ-20260617-181 | Done | Member/classroom surfaces keep library/live/reply model and private-first framing. | `public/one-time-classroom.html`; `server.js`; `tests/one-time-classroom-calendar-community-bot.test.js` | Focused classroom/portal tests passed. | Needs real launch data and approved media before production class use. |
| REQ-20260617-182 | Blocked | Parent portal shell and privacy contract exist, but OneTime-specific enrollment/billing sync depends on real product/payment/access records. | `ops/security-audits/2026-06-17-parent-portal-access-audit.md` | Parent/security tests and privacy smoke prove safe shell behavior. | Blocked on payment provider, billing cadence, and actual OneTime parent/student enrollment data. |
| REQ-20260617-183 | Done | OneTime child-facing bot was removed/disabled; endpoint now approval-blocks. | `public/one-time-classroom.html`; `server.js`; `public/parent.html`; `tests/one-time-classroom-calendar-community-bot.test.js` | Endpoint POST returned 403 locally; focused tests passed. | Future child bot requires explicit operator/Rabbi approval. |
| REQ-20260617-184 | Done | Classroom/community model supports teacher posts, private replies, moderation, and selected display without open student chat. | `public/one-time-classroom.html`; `server.js`; focused tests | Focused classroom tests passed. | Real moderation workflow needs launch data. |
| REQ-20260617-185 | Done | Teacher-led follow-up/prompt model stays Rabbi/admin-led, not student-public-chat-led. | `public/one-time-classroom.html`; `server.js`; focused tests | Focused classroom and provider-classroom contract tests passed. | None for this packet. |
| REQ-20260617-186 | Already satisfied | Parent portal polish was covered in earlier deployed portal/security work. | `ops/security-audits/2026-06-17-parent-student-provider-portal-security.md`; `TASKS.md` | Prior deployed parent portal proof and current privacy smoke path. | New visual redesign is outside this packet batch. |
| REQ-20260617-187 | Already satisfied | Portal/login headers were aligned in the earlier public/portal navigation closeout. | `TASKS.md`; `memory/2026-06-17.md` | Prior live public/portal navigation smoke. | None for this packet. |
| REQ-20260617-188 | Done | Parent/public/private route safety was audited for this packet. | `ops/security-audits/2026-06-17-parent-portal-access-audit.md` | Local and live public-route privacy smokes passed; protected APIs reject anonymous access. | Fresh credentialed parent-session proof still requires approved credentials/session. |
| REQ-20260617-189 | Already satisfied | Student login/header work was covered in the earlier public/portal navigation and portal contract work. | `TASKS.md`; `tests/parent-student-portal-contract.test.js` | Focused portal tests passed in this packet. | None for this packet. |
| REQ-20260617-190 | Already satisfied | Role-aware portal login and protected route contracts already exist. | `server.js`; `tests/parent-student-portal-contract.test.js`; `tests/provider-classroom-settings-contract.test.js` | Focused portal tests and privacy smoke passed. | None for this packet. |
| REQ-20260617-191 | Needs operator decision | Global public BNA nav/provider CTA changes are larger than the meeting-focused OneTime page. | This register; open question `Q-20260617-146` | Existing public nav has prior deployed proof, but the exact new global nav/CTA wording was not changed here. | Decide whether to change global public nav now or run it as a separate batch. |
| REQ-20260617-192 | Already satisfied | Public technology/AI/self-governance/accountability positioning exists from prior deployed website batches. | `TASKS.md`; `memory/2026-06-17.md` | Prior live website/register closeout proof. | None for this packet. |
| REQ-20260617-193 | Already satisfied | Service-provider model copy/routes were covered in prior public provider route closeout. | `TASKS.md`; `memory/2026-06-17.md` | Prior final register and provider-classroom live smokes. | None for this packet. |
| REQ-20260617-194 | Already satisfied | Raw-first upload/recording parse status was covered by the final register closeout. | `TASKS.md`; `memory/2026-06-17.md`; raw-intake audit | Prior final register proof and raw watchdog pass. | New Drive/class-recording backlog scans need connector/source access when requested. |
| REQ-20260617-195 | Already satisfied | Parent content remains scoped through the existing parent/portal contract. | `tests/parent-student-portal-contract.test.js`; security audit | Focused portal tests and privacy smoke passed. | Real OneTime enrollment content waits on REQ-20260617-182. |
| REQ-20260617-196 | Done | Meeting walkthrough cards cover Zoom, GoDaddy, Resend, Vimeo, payment, media import, and email review. | `ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md` | File inspection; official reference links recorded. | Account-owner access still needed during meeting. |
| REQ-20260617-197 | Done | Meeting prep exists for 2026-06-18, about 8:30, private location redacted. | `ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md` | File inspection. | Confirm AM/PM and timezone before external calendar sync. |
| REQ-20260617-198 | Done | Customer/subscriber review task is tracked without committing raw emails. | Meeting prep; this register | File inspection. | Need Rabbi/customer export policy and no raw list in repo. |
| REQ-20260617-199 | Done | Relaunch email sequence is drafted approval-only. | `ops/email-drafts/2026-06-17-rabbi-scheller-relaunch-sequence.md` | File inspection. | No send/import until explicit approval and sender/domain decision. |
| REQ-20260617-200 | Done | Sample email copy is in the meeting prep. | `ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md` | File inspection. | Needs Rabbi approval. |
| REQ-20260617-201 | Done | Telegram status audit completed without exposing secrets/private bodies. | `ops/telegram-audits/2026-06-17-telegram-bot-status-audit.md` | Process, lock, offset, log, and secret metadata checks. | Bridge appears stale/not running; restart/safe smoke remains a follow-up. |
| REQ-20260617-202 | Done | Backlog recovery audit exists with redacted findings and next actions. | `ops/raw-intake-audits/2026-06-17-backlog-recovery-audit.md` | `npm run watchdog:raw` passed; repo raw IDs unique after repair. | Drive/recording/live Telegram backlog require connector/live access when approved. |
| REQ-20260617-203 | Done | Internal readiness timeline exists. | `ops/meeting-prep/2026-06-18-rabbi-scheller-meeting.md`; `TASKS.md` | File inspection and ledger/changelog closeout. | Google Calendar sync remains connector/integration-gated. |
