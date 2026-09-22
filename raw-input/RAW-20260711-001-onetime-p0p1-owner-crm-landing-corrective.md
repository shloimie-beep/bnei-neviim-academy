P0/P1 CORRECTIVE IMPLEMENTATION — ONE TIME OWNER EXPERIENCE, CRM, AND LANDING

Work from current origin/master. Current audited head is d68e3f9a, but fetch first and report the exact head used.

Read AGENTS.md, the One Time current-state requirements, the July 10 One Time landing/CRM registers, and the existing readiness verdict. Do not trust existing “Done” labels without verifying the actual served route.

This is an implementation goal, not another audit-only or evidence-refresh goal.

PRIMARY OUTCOME

Rabbi Eli Scheller’s normal One Time owner account must use the same structural application shell as BNA Super Admin:

- one left sidebar;
- one selected-module subsection rail;
- shared responsive behavior and components;
- One Time black/yellow/ice-blue branding;
- strictly scoped to workspace=rabbi_sheller_provider and project=one_time_mishnah_class;
- no BNA school-private data;
- no Super Admin infrastructure, Watchdog, Agents, Intake, raw queues, raw keys, TEST review mode, or platform diagnostics in normal Rabbi mode.

The CRM must become an operational first-party CRM, and the public landing must match the approved content and premium visual brief.

Do not improve the evidence around the current UI and call that completion. Change the owner-visible product until it matches the requirement, then prove that exact served result.

GUARDRAILS

- Do not send email, WhatsApp, Telegram, or campaigns.
- Do not charge cards, grant access, import historical contacts, or modify external providers.
- Preserve explicit confirmation gates for future sensitive actions.
- Preserve unrelated user changes.
- Work on one clean corrective branch and open one corrective PR.
- Do not merge stale remote branches.
- Do not create another shell, another CRM model, or fixture-only proof.

FILES TO INSPECT AT MINIMUM

- server.js
- public/operations-bootstrap.html
- public/operations.html
- public/js/operations-shell.js
- public/js/operations-deferred-renderers.js
- public/css/operations-shell.css
- scripts/split-operations-shell.mjs
- public/provider.html
- src/platform/instances/one-time-rabbi-dashboard-ia.js
- src/lib/bna/one-time-role-model.js
- src/lib/bna/crm-contact-model.js
- public/one-time/index.html
- public/one-time-preview.html
- config/service-provider-sites/one-time.json
- config/brands/one-time.json
- public/js/bna-bot-widget.js
- all One Time CRM, provider-navigation, landing, preview, and canonical-route smokes/tests

WAVE 0 — RESET PRODUCT TRUTH

1. Create one new canonical execution run and update ops/execution-runs/latest.json.
2. Reopen any requirements that claimed:
   - canonical CRM completion;
   - provider/Operations parity;
   - real family/school continuation;
   - completed premium landing design;
   when the actual served product does not satisfy them.
3. Record explicitly that direct operations.html proof does not prove canonical /operations.
4. Do not create another historical-source mapping series.
5. Freeze evidence-only refresh commits until an implementation slice or genuine blocker changes.

WAVE 1 — FIX THE ACTIVE OPERATIONS ARTIFACT

1. Verify that canonical /operations is served by operations-bootstrap.html and loads operations-shell.js.
2. Verify that the stronger July 10 CRM workbench was implemented in operations.html without being propagated completely to the generated production assets.
3. Add explicit package commands:
   - operations:build
   - operations:check-generated
4. Use scripts/split-operations-shell.mjs or replace it with one clearly documented source/build process.
5. Add a CI drift gate that fails when operations.html and the generated bootstrap/CSS/JS/deferred assets disagree.
6. Regenerate the production assets.
7. If the initial JS size gate is exceeded, move CRM renderers into the deferred bundle. Do not leave the served bundle stale.
8. All browser tests must load canonical /operations with operations-bootstrap.html and its real generated assets.
9. No smoke may substitute operations.html for /operations or prove a production feature solely by searching the source file.
10. Direct /operations.html should redirect to /operations or be clearly treated as nonproduction source.

WAVE 2 — ONE CANONICAL RABBI OWNER SHELL

1. Make the BNA Operations shell the sole One Time owner/admin experience.
2. Successful One Time provider-owner login must safely bridge into a scoped Operations session and land at:
   /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class
3. One Time owner access through /provider or /provider.html must bridge or redirect to the canonical shell after authentication.
4. Keep the generic provider portal only for unrelated directory/service providers.
5. “View as Rabbi” must use the identical canonical shell in read-only impersonation mode.
6. Make one-time-rabbi-dashboard-ia.js the real navigation source consumed by production UI and tests.
7. Remove or stop using the conflicting One Time navigation arrays in provider.html and operations-shell.js.
8. Use:
   - left sidebar for main modules;
   - top rail only for the selected module’s subsections;
   - no duplicated sidebar drilldown plus top-tab navigation.
9. Apply One Time branding without changing the BNA shell structure:
   - black/deep navy;
   - chrome yellow-gold;
   - restrained ice-blue lighting;
   - white typography;
   - consistent buttons, fields, cards, spacing, and status states.
10. Tighten server-side role permissions. Do not rely only on hiding navigation.

WAVE 3 — BUILD THE REAL ONE TIME CRM

Create one canonical workspace-scoped contact DTO that reconciles authorized One Time data from:

- bna_contacts;
- bna_parent_leads;
- One Time product leads;
- members and access records;
- linked parent/student records;
- bna_communications;
- bna_contact_communications;
- bna_provider_messages and mailbox threads;
- relevant support items and follow-up tasks.

Required CRM experience:

- compact single-row search/filter/sort/action toolbar on desktop;
- responsive toolbar/drawer on mobile;
- contact list;
- selected-contact detail;
- identity and contact fields;
- source and lifecycle stage;
- assigned owner;
- tags;
- notes;
- next follow-up;
- related task/reminder;
- parent/student/member links where authorized;
- class, trial, attendance, library, and access context;
- unified local activity timeline;
- linked mailbox conversation;
- safe next actions;
- optional One Time-specific pipeline/Kanban backed by the canonical lifecycle stage.

Required working mutations:

- add an internal note;
- set, change, and clear follow-up;
- update lifecycle stage;
- update approved contact fields and tags;
- create or assign a follow-up task.

Preserve the currently working parent-lead Add Note and Follow-up behavior while moving it into the canonical selected-contact detail.

Email, WhatsApp, payment, and access actions must remain guarded. Normal Rabbi copy should say what the user can do; do not fill the interface with protocol/no-write/internal implementation explanations.

Register real page actions. “0 typed actions” is not acceptable on the completed CRM screen.

Opening a mailbox thread from CRM must retain the selected contact. New communication records must appear on the same canonical timeline.

Do not claim the historical CRM is imported. Keep that as a separate blocked decision lane until the canonical source, dedupe rules, suppression list, and unsubscribe policy are approved.

WAVE 4 — FINISH THE PUBLIC LANDING AND SIGNUP JOURNEY

The landing must use this approved message hierarchy:

Eyebrow:
“Worldwide Mishnah learning — live from Eretz Yisrael”

Headline:
“Give your son a love for Torah you never thought possible.”

Schedule:
“Live from Israel. Every day at 7 p.m. Israel time.”

The only large public CTA is:
“Sign Up Now”

Member Login appears only in the header and final footer.

Quick signup modal:

- parent/name required;
- email required;
- phone optional;
- no student name;
- Family or School choice;
- preserve submitted values securely into the continuation flow.

Build a real next-step onboarding page:

- Family and School branch into appropriate fields;
- Family collects student information;
- School collects school/contact information;
- no BNA preview/TBD/approval-checklist language;
- no fake checkout;
- correctly links the onboarding record to the original CRM lead.

Required landing sections:

1. Rabbi section with approved book portrait.
2. “As Seen Across the Jewish World” transparent logo marquee.
3. Teaching-across-the-world carousel using only verified photographs and approved place captions.
4. “What Your Son Will Gain”:
   - Clarity;
   - Accomplishment;
   - Excitement for learning Torah.
5. “What You Receive”:
   - live digital classes;
   - online class library;
   - parent portal;
   - student portal;
   - worksheets/review materials;
   - reminders;
   - monitored online platform;
   - communication with the Rabbi.
6. How It Works using customer-facing steps.
7. Who It’s For:
   - families;
   - schools;
   - English-speaking homeschoolers;
   - local Ramat Beit Shemesh attendance only when the exact address wording is approved.
8. Clean footer with only verified social URLs plus Member Login.

If approved teaching photos or social URLs are absent, hide those items elegantly. Never publish “verified photo slot,” operator instructions, fake logos, or placeholder social links.

Visual direction:

- premium modern editorial/technology presentation;
- black base with ice-blue depth;
- chrome/holographic yellow CTA using controlled multi-stop gradients, edge highlights, subtle glow, and a restrained light sweep;
- rich hover/focus states;
- modern display serif plus clean sans-serif system;
- strategic negative space;
- elegant image composition;
- fewer repetitive generic cards;
- reduced-motion support;
- no flat yellow slabs;
- no default Georgia/template appearance.

Do not invent final hero photography. Use intentional abstract lighting/negative space until approved media exists.

Synchronize config/service-provider-sites/one-time.json with the real page. Remove stale FAQ, “Join the Free Class,” “See How It Works,” and obsolete asset-path contracts.

Use the latest approved full-body Robot asset:
 /workspace/scratch/ffef2e71fe52/generated_images/exec-3a5ead43-7bb8-4ba1-b1e9-51aa03913c08.png

Import it without destructive upper-body cropping. Verify launcher and expanded states. Preserve the full WhatsApp body and requested full figure.

Do not perform a full React migration merely to claim modern components. Use reusable components/modules in the existing architecture unless a deliberate, tested framework migration is clearly justified. Stop adding more inline monolith code.

MANDATORY ACCEPTANCE

1. Authentic One Time owner login lands in canonical /operations.
2. The browser loads operations-bootstrap.html and generated production assets.
3. The canonical browser route—not operations.html—contains the completed CRM workbench.
4. Search a persisted One Time contact.
5. Select it and load its real timeline.
6. Add a note and follow-up, reload, and verify persistence.
7. Open its mailbox thread and return without losing selection.
8. View-as Rabbi uses the same shell and rejects writes in both UI and server enforcement.
9. Cross-workspace tests prove no BNA school-only record leakage.
10. Direct One Time owner access no longer exposes the static provider CRM.
11. Family and School signup flows preserve values and reach distinct real onboarding forms.
12. No technical/operator placeholder copy is visible publicly.
13. Landing config and rendered page agree.
14. Generated Operations drift gate passes.
15. Capture authentic screenshots at 1440, 768, 430, and 390 for:
    - landing hero;
    - signup modal;
    - Family and School onboarding;
    - Rabbi Overview;
    - Members/CRM;
    - selected CRM detail/timeline;
    - Communications/Mailbox;
    - normal Rabbi login destination.
16. Conduct a human visual review against the approved brief. “Captured” or “zero automated findings” is not visual approval.
17. Run focused tests plus canonical-route browser tests.
18. Push the branch and open one corrective PR.
19. After review, deploy through the normal approved pipeline and live-smoke the exact canonical routes.
20. Reconcile execution-run status and GitHub issues #127 and #128.
21. Mark a requirement Done only after code, tests, pushed commit, deployment, live route readback, after-screenshot, and human product review all agree.

Final report must separate:
- implemented;
- deployed;
- live-verified;
- blocked by missing approved assets/input;
- intentionally not performed because it would send, charge, import, or grant access.