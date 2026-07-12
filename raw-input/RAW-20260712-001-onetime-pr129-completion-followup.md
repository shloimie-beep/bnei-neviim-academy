---
raw_id: RAW-20260712-001
source_channel: codex_chat
source_type: operator_followup_prompt
created_at: 2026-07-12T08:31:00+03:00
parse_status: registered
workspace: rabbi_sheller_provider
project: one_time_mishnah_class
requirement_register: tasks-pending/2026-07-12-onetime-p0p1-corrective-completion.md
execution_run: ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion
pr_url: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
branch: codex/onetime-p0p1-corrective-20260711
expected_pr_head_at_capture: ee264c5a4b8329719b5420ffb6f99ccae93e1a60
base_master_at_audit: d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a
---

# Raw Intake: One Time PR #129 Completion Follow-up

## Missing July 12 Context To Preserve

- This is a continuation of the existing One Time P0/P1 corrective lane, not a
  competing implementation.
- Canonical delivery lane: repository `shloimie-beep/bnei-neviim-academy`,
  draft PR #129, branch `codex/onetime-p0p1-corrective-20260711`.
- PR #129 head at capture was confirmed locally and through `gh` as
  `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`; base/master was
  `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`.
- Current coordinator checkout `C:\Users\User\BNA v2.0` is dirty on `master`;
  the clean worktree for this lane is
  `C:\Users\User\BNA-onetime-p0p1-corrective-20260711`.
- Existing July 11 run claimed local verification and draft PR creation, but
  the July 12 operator prompt reopens implementation and proof requirements:
  authentic provider login, real API persistence, exact landing hierarchy,
  canonical ramble-to-done service, worker-health truth, screenshots at five
  widths, and a requirement matrix.
- Earlier Robot/image corrections remain part of source context:
  `RAW-20260710-008` required the final Robot Scheller image to be copied to
  `public/assets/one-time/robot/robot-scheller-whatsapp.png`, used only as the
  floating WhatsApp assistant, not as a hero CTA, with full body/silhouette
  preserved and accessible label "Open Rabbi Scheller's WhatsApp assistant."
  `RAW-20260710-009` further corrected that the latest downloaded Robot should
  fit clearly in the bubble. The July 12 prompt repeats the current rule:
  preserve the entire silhouette with `object-fit: contain`, optimize the PNG,
  retain an accessible label, and do not use the Robot as a competing CTA.

## Raw Operator Wording

Continue and complete the existing One Time corrective work. Do not start a competing implementation or a parallel PR.

CANONICAL DELIVERY LANE

Repository: shloimie-beep/bnei-neviim-academy
Existing draft PR: #129
Branch: codex/onetime-p0p1-corrective-20260711
Expected current PR head: ee264c5a4b8329719b5420ffb6f99ccae93e1a60
Base/master at audit time: d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a

Use a new isolated clean worktree at the exact PR head. Do not reset, overwrite, or carry forward the unexplained dirty public/operations.html from another checkout. Establish clean Git truth first.

This is an implementation-and-verification assignment, not another planning-only audit. Reconcile the user's complete ramble into stable requirements, implement every safely actionable item, and leave explicit blockers only where real authority or credentials are missing.

DEFINITION OF DONE

"Done" does not mean parsed, filed, locally rendered, or task-created.

Done means:
1. requirement mapped;
2. implementation complete;
3. authentic tests pass;
4. independent visual/runtime proof exists;
5. PR records are current;
6. merged and deployed only when authorized;
7. exact deployed SHA is live-smoked.

If release authorization is unavailable, report "ready for release" with one precise blocker. Do not mark it Done.

SOURCE OF TRUTH FILES

Corrective intake and run:
- raw-input/RAW-20260711-001-onetime-p0p1-owner-crm-landing-corrective.md
- tasks-pending/2026-07-11-onetime-p0p1-owner-crm-landing-corrective.md
- ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/
- ops/execution-runs/latest.json

Landing/onboarding/Robot:
- public/one-time/index.html
- public/one-time-preview.html
- config/service-provider-sites/one-time.json
- public/assets/one-time/robot/robot-scheller-whatsapp.png
- public/js/bna-bot-widget.js

Canonical Operations:
- public/operations.html
- public/operations-bootstrap.html
- public/css/operations-shell.css
- public/js/operations-shell.js
- public/js/operations-deferred-renderers.js
- public/js/one-time-rabbi-dashboard-ia.generated.js
- scripts/split-operations-shell.mjs
- scripts/check-operations-canonical-artifact.mjs
- server.js

Ramble pipeline:
- server.js
- src/platform/ingestion/
- src/lib/bna/ramble-routing.js
- scripts/telegram-kimi-bridge.mjs
- scripts/chatgpt-dropoff-ingestor.mjs
- scripts/chatgpt-dropoff-comment-collector.mjs
- scripts/agent-fleet-supervisor.mjs
- scripts/bna-execution-run.mjs
- ops/chatgpt-ramble-dropoff/
- BNA-START-HERE.md

PHASE 1 - REPAIR DELIVERY TRUTH

1. Confirm the branch is clean and contains both existing corrective commits.
2. Reconcile PR #129, REQ-20260711-009, requirements.json, run.json, STATUS, EVIDENCE, DEPLOYMENT, the task ledger, control tower, and latest.json.
3. Record the actual PR URL/head SHA. Remove stale claims that the PR still needs to be opened.
4. Add CI enforcement for:
   - operations:build
   - operations:check-generated
   - operations:check-canonical
   - focused One Time tests
   - secrets audit
5. Browser tests must load the same bootstrap/generated CSS and JS used by the real `/operations` server route. Do not substitute raw public/operations.html in the test server.

PHASE 2 - CANONICAL RABBI ACCOUNT

The normal Rabbi/provider login must use the BNA Super Admin structural shell, scoped to One Time.

Required behavior:
- Normal One Time provider credentials establish an appropriately scoped Operations session.
- Successful login lands on canonical `/operations`.
- `/provider`, `/provider.html`, the single-tenant provider route, and existing One Time provider sessions resolve to the canonical shell.
- The old provider CRM/dashboard must not remain independently reachable for the One Time owner.
- BNA Super Admin behavior must remain unchanged.
- Cross-workspace reads and writes must be denied.
- View-as mode remains visibly read-only and server-enforced.
- Remove duplicate subsection navigation between the sidebar and top rail.
- Use coherent One Time branding: black, premium yellow/chrome, restrained ice blue, and the white-on-black One Time logo.
- Remove internal implementation language such as references to Codex, persistence limitations, or test fixtures from normal customer-facing screens.

Prove this with an authentic provider login/session browser test, not query-string simulation.

PHASE 3 - REAL FIRST-PARTY CRM

Do not integrate GoHighLevel or another external CRM.

Create one scoped contact DTO that reconciles:
- contacts;
- public/product leads;
- memberships and access;
- linked parents and students;
- family versus school classification;
- messages and mailbox threads;
- support/questions;
- follow-up tasks;
- class/trial/access context;
- timeline activity.

Required CRM experience:
- Compact search/filter/sort toolbar, not six full-width filter rows.
- Contact list and useful detail panel.
- Editable name, email, optional phone, lifecycle, follow-up date, owner, tags, and internal note.
- Create/assign a follow-up task.
- Open the mailbox already filtered to the selected person/thread.
- Returning from mailbox restores the same selected contact and filters.
- Register real typed Command Bot actions or remove the misleading empty panel.
- Responsive at 1440, 1024, 768, 430, and 390 widths.
- No sample/redacted fixture record may count as final proof.

Run a real local/test-database journey through actual APIs:
search -> select -> edit -> add note -> assign follow-up -> reload -> confirm persistence -> open targeted mailbox -> return.

Also test cross-workspace denial.

PHASE 4 - ONBOARDING AND LEAD LINKAGE

The first signup interaction requires:
- parent/contact name;
- email;
- optional phone;
- Family or School choice.

Do not request student name in the first lightweight signup.

Continuation onboarding must:
- preserve and validate product_lead_id and crm_lead_id;
- link to the exact original capture rather than relying only on fuzzy deduplication;
- preserve UTM/referrer context;
- require the relevant family/student fields for Family;
- require school name and contact role for School;
- classify family and school leads correctly;
- use clean customer-facing language;
- persist through real APIs without any external send, payment, or access mutation.

PHASE 5 - COMPLETE THE LANDING PAGE

Implement the user's exact hierarchy and remove invented placeholder content.

Header:
- Static/sticky.
- White-on-black One Time logo.
- Clean white navigation.
- Member Login only in the header and footer.
- The sole prominent CTA is "Sign Up Now."
- No competing "See How It Works," "WhatsApp Robot Scheller," "Start Free," or embedded yellow signup panel.

Hero:
Eyebrow:
"Worldwide Mishnah learning - live from Eretz Yisrael"

Headline:
"Give your son a love for Torah you never thought possible."

Schedule:
"Live from Israel. Every day at 7 p.m. Israel time."

CTA:
"Sign Up Now"

Use the latest approved Robot as the floating WhatsApp assistant, not as a second CTA. Preserve the entire silhouette with object-fit: contain. Make it large enough to recognize as the Rabbi/WhatsApp Robot, optimize the 1.68 MB PNG, and retain an accessible label.

Who Rabbi Eli Scheller is:
- Book portrait.
- Visible "As Seen Across the Jewish World" heading.
- Transparent/no-background press-logo marquee.
- Remove unverified marketing claims.
- Do not display "Verified photo slot," "Replacement-ready," approval notes, or any placeholder to the public.

Teaching-across-the-world slider:
- Use only verified approved images.
- Show the verified location alongside each image.
- Hide the entire slider cleanly when assets are unavailable.
- Never publish asset instructions as customer copy.

"What Your Son Will Gain" must use exactly:
- Clarity
- Accomplishment
- Excitement for learning Torah

"What You Receive" must explicitly include:
- live daily Mishnayos class;
- online class library;
- parent portal;
- student portal;
- worksheets and review materials;
- daily reminders;
- monitored online platform;
- structured communication with the Rabbi.

"How It Works":
- sign up;
- choose Family or School;
- receive class details/reminder;
- join the live learning rhythm.

"Who It's For":
- families;
- English-speaking homeschoolers;
- schools using it as a class;
- local boys joining the free live class at 7 p.m. in Ramat Beit Shemesh Alef;
- HaGaon MiVilna 8, if this already-approved public address remains correct.

The Rosh Hashanah offer may appear as a restrained informational band, but it must not become a separate embedded form or competing CTA.

Visual direction:
- Premium modern black foundation.
- Chrome/holographic yellow CTA with controlled glow and light sweep.
- Ice-blue highlights/shading.
- Strong modern type pairing.
- Layered depth, refined panels, subtle motion and polished transitions.
- Respect prefers-reduced-motion.
- Avoid flat yellow blocks, default Georgia-heavy styling, gaudy animation, or generic template cards.
- Keep mobile hierarchy crisp and fast.

Synchronize config/service-provider-sites/one-time.json with the actual live asset paths and page navigation.

PHASE 6 - FIX RAMBLE-TO-DONE

This cannot be another documentation-only patch.

Create one canonical application service, such as ingestOperatorRamble(), and require every channel adapter to call it before specialized extraction:

channel adapter
-> immutable raw source
-> complete statement segmentation
-> requirement/decision/question/task routing
-> requirement register and execution-run projection
-> executable tasks and observable agent jobs
-> verification evidence
-> upstream completion propagation

Required repairs:
1. Connect Operations intake, general Telegram, scoped Telegram, ChatGPT/Codex dropoff, and file intake to the same service.
2. Fix source recognition for codex_chat, telegram_ramble, telegram_scoped_task, chatgpt, and operations_ui.
3. Pass the real bna_raw_intake stable_id into parsing; eliminate phantom IDs.
4. Use one requirement ID contract accepted by the parser, database, repository register, and execution-run validator.
5. Store every source statement with offsets, hash, classification, and mapped requirement IDs.
6. Enforce a true no-lost-sentence gate.
7. Give every broad ramble a unique register path derived from its raw ID.
8. Materialize real requirement rows; do not file requirements as generic section records.
9. Do not strand all broad requirements below the 0.85 threshold. Human-review items may wait, while independent executable requirements continue.
10. Separate statuses:
   captured, parsed, registered, queued, running, implemented, verified, deployed, blocked, failed.
11. Never mark a raw ramble implemented merely because downstream tasks were filed.
12. Propagate verified results back through job, task, requirement, parse item, source statement, parent work item, raw intake, packet, and execution run.
13. Use one shared packet-status enum. Migrate or reject unknown codex_done values.
14. Investigate and correct the duplicate task ID 1945 claims.
15. Surface review-queue items and worker health in Operations.
16. Report "stored; worker offline" when no agent fleet heartbeat exists.
17. Update BNA-START-HERE.md and latest.json atomically when runs activate or close.
18. Add an explicit receipt for every ramble:
   raw ID, statement count, requirements, questions, tasks, queued jobs, blockers, and links.
19. Be honest about ChatGPT: ordinary conversation is not invisibly connected to the repo. Provide and enforce an explicit API/CLI/GitHub-dropoff capture step.

Capture this follow-up prompt itself as a new July 12 raw input and execution run before implementation. Include the missing July 12 conversation context and earlier image/Robot corrections, not only a shortened summary.

MANDATORY REGRESSION TESTS

- Long ramble: one raw source, complete statement map, zero unmapped statements.
- Duplicate Telegram message: one idempotent work graph.
- codex_chat input: recognized and captured.
- Broad UI ramble: executable requirements plus unique register.
- One blocked decision does not stop independent work.
- Worker claim/heartbeat/result/verification propagates to every parent.
- Failed verification leaves the requirement open.
- UI work cannot become Done without release/live evidence.
- Parser-generated IDs pass execution-run validation.
- Real intake API populates canonical parent/entity records.
- Unknown packet status codex_done is rejected or migrated.
- Worker-offline state is visible and truthful.

FINAL VERIFICATION

Produce authentic screenshots at 1440, 768, 430, and 390 for:
- landing;
- signup modal;
- Family continuation;
- School continuation;
- normal Rabbi login;
- canonical Rabbi dashboard;
- CRM list/detail;
- persisted CRM edit;
- targeted mailbox;
- Robot launcher.

Then provide a requirement matrix with:
requirement ID -> original source statement -> code files -> test -> screenshot -> PR/commit -> deployment/live proof.

Do not declare completion based on source markers or synthetic fixtures. Do not deploy, send messages, charge, import historical data, or perform other external writes without the required existing authorization.
