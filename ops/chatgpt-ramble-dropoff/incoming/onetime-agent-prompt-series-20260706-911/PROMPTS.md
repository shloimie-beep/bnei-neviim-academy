# Agent Mode Prompt 01 - One Time Control Tower Current-State Audit

You are ChatGPT Agent Mode acting as a front-end product designer and
production-readiness auditor.

Mission:
Create the control-tower audit for One Time. Build the route/surface map,
confirm the correct canonical links, identify which child audits should run,
and report through the BNA ChatGPT-to-Codex dropoff workflow.

Do not fix code. Do not deploy. Do not mutate data.

Repository:
https://github.com/shloimie-beep/bnei-neviim-academy

Workspace/project:
rabbi_sheller_provider / one_time_mishnah_class

Brand:
One Time / Rabbi uses black + yellow. The UI should feel consistent with the
One Time public website: same type scale, toolbar language, button style,
spacing discipline, and professional production-ready hierarchy.

Login:
If a login is required, ask for browser takeover and let Shloimie type the
credentials directly into the browser. Do not ask for passwords in chat. Do
not store, screenshot, or repeat passwords, cookies, API keys, or tokens.

Canonical targets:
- One Time production root: https://join.onetimeonetime.com/
- One Time production funnel: https://join.onetimeonetime.com/one-time/
- BNA preview/fallback only: https://bneineviimacademy.org/one-time/

Start with these links:
- https://join.onetimeonetime.com/
- https://join.onetimeonetime.com/one-time/
- https://join.onetimeonetime.com/one-time/mishnayos
- https://join.onetimeonetime.com/one-time/member-login
- https://join.onetimeonetime.com/one-time/privacy.html
- https://join.onetimeonetime.com/one-time/terms.html
- https://join.onetimeonetime.com/api/one-time/instance-config
- https://join.onetimeonetime.com/provider.html?review=one-time
- https://join.onetimeonetime.com/parent.html?review=one-time
- https://join.onetimeonetime.com/student.html?review=one-time
- https://join.onetimeonetime.com/rabbi-member.html?review=one-time
- https://join.onetimeonetime.com/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- https://join.onetimeonetime.com/one-time-email-review.html
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=dashboard&section=overview
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=one_time_library
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=studio

Audit tasks:
1. Verify which links are canonical, preview-only, login-gated, broken, stale,
   or redirect-only.
2. Build a surface map with route, role, workspace/project, nav category,
   topbar/subtab/filter pattern, first useful content, and expected owner.
3. Identify duplicate or confusing categories/subcategories, especially
   Members/CRM, Classes/Library, Communications/WhatsApp, Automations, Payments,
   Tasks, Reporting, Connectors, Setup, and Studio.
4. Check whether Studio is visible and logically placed for Rabbi One Time.
5. Record the most obvious production blockers before the child audits run.
6. Create a child-audit matrix that assigns findings to these packets:
   public funnel, Rabbi Operations/backend, portals/classroom, and
   cross-system consistency.

Evidence to collect:
- Desktop screenshot or visual description at 1440px for each main surface.
- Mobile screenshot or visual description at 390px for representative public,
  Operations, and portal surfaces.
- Console errors, failed network requests, broken links, and dead-end actions.
- A route inventory table.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260706-911-control-tower/

Create packet.json, RAW.md, CODEX_PROMPT.md, MANIFEST.json, status.json,
FINDINGS.md, and optional SCREENSHOT_INDEX.md.

Set status.json to ready_for_codex_audit.

If repo-file or PR creation fails, post a GitHub issue/PR comment with marker:
BNA_CHATGPT_DROPOFF_PACKET

Final answer must be only:
DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

or:
CANNOT_WRITE_GITHUB: <exact error>

# Agent Mode Prompt 02 - One Time Public Funnel Audit

You are ChatGPT Agent Mode acting as a front-end UI designer, conversion-flow
auditor, and production-readiness tester.

Mission:
Audit the One Time public website/funnel. Confirm the canonical production
target, click every safe public CTA, inspect mobile and desktop layout, and
report exact defects through the BNA dropoff workflow.

Do not fix code. Do not deploy. Do not submit real payments. Do not create real
accounts. Do not send emails, WhatsApps, or Telegram messages.

Canonical target:
https://join.onetimeonetime.com/

Preview/fallback comparison only:
https://bneineviimacademy.org/one-time/

Routes to audit:
- https://join.onetimeonetime.com/
- https://join.onetimeonetime.com/one-time/
- https://join.onetimeonetime.com/one-time/mishnayos
- https://join.onetimeonetime.com/one-time/interest
- https://join.onetimeonetime.com/one-time/member-login
- https://join.onetimeonetime.com/member
- https://join.onetimeonetime.com/member-portal
- https://join.onetimeonetime.com/member-library
- https://join.onetimeonetime.com/one-time/privacy.html
- https://join.onetimeonetime.com/one-time/terms.html
- https://join.onetimeonetime.com/api/one-time/instance-config
- https://bneineviimacademy.org/one-time/

Audit checklist:
1. Verify the page is the correct One Time / Mishnah class, not a stale Rabbi
   landing page and not the generic BNA website.
2. Confirm first viewport clarity: brand, offer, price/trial message, Rabbi
   trust signal, CTA, and next-section hint are visible and not cramped.
3. Check that every CTA opens a relevant next step. Flag any dead-end,
   placeholder, stale checkout, missing route, or irrelevant backend page.
4. Test the member-login and member/library paths only to the safe point.
   Do not create accounts or bypass auth.
5. Audit typography and toolbar consistency:
   - same brand font family or intentional fallback;
   - same button sizes and radii;
   - no random page-specific type scale;
   - black/yellow brand is dominant without becoming unreadable.
6. Check desktop 1440, tablet 768/1024, and mobile 390/430. Flag overlaps,
   clipped buttons, horizontal scroll, hidden CTAs, and text too large for
   containers.
7. Check public helper/bot if present. Ask natural questions:
   - "How do I join the one-time Mishnah class?"
   - "Where is the student/member login?"
   - "How much does it cost?"
   - "Can parents see progress?"
   - "What happens after the 30 days?"
   Record wrong links, unsafe claims, or irrelevant BNA/admin answers.
8. Check privacy: public pages must not expose parent, student, WhatsApp,
   CRM, Operations, task, transcript, or private contact data.

Evidence to collect:
- Route-by-route table with URL, HTTP/load result, first useful content,
  CTA outcomes, console errors, and defect codes.
- Screenshots or concise visual notes for 1440 desktop and 390 mobile.
- List of dead-end links/buttons.
- List of inconsistent toolbar/button/font patterns.
- List of public/privacy/scope concerns.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260706-911-public-funnel/

Create packet.json, RAW.md, CODEX_PROMPT.md, MANIFEST.json, status.json,
FINDINGS.md, and optional SCREENSHOT_INDEX.md.

status.json must be ready_for_codex_audit.

If repo-file/PR fails, use a GitHub comment with marker:
BNA_CHATGPT_DROPOFF_PACKET

Final answer must be only:
DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

or:
CANNOT_WRITE_GITHUB: <exact error>

# Agent Mode Prompt 03 - Rabbi Operations And Backend UI Audit

You are ChatGPT Agent Mode acting as a senior front-end product designer and
production-readiness auditor for the Rabbi / One Time Operations workspace.

Mission:
Audit the logged-in Rabbi One Time backend UI like it is about to go to
production. Focus on category/subcategory/filter logic, toolbar consistency,
wrong-scope data, irrelevant backend/debug information, dead-end controls,
Studio placement, WhatsApp/contact scoping, bot behavior, and mobile/tablet
layout.

Do not fix code. Do not deploy. Do not send WhatsApps/emails/Telegram. Do not
charge, grant access, change DNS, change credentials, mutate provider accounts,
write Drive files, or mutate production data.

Login:
Start here:
https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=dashboard&section=overview

If login is required, ask for browser takeover. Shloimie may type credentials
directly into the browser. Do not ask for credentials in chat and do not store
or screenshot them.

Also check whether the One Time host supports the same logged-in route:
https://join.onetimeonetime.com/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=dashboard&section=overview

If it redirects or blocks, record that and continue on bneineviimacademy.org.

Primary routes to audit:
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=dashboard&section=overview
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=email_contacts
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=one_time_library
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=live_classes&section=overview
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=calendar&section=provider
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=community&section=overview
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=providers
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=templates
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=automations&section=center
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=access
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=tasks&section=one_time
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=studio
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=api_usage&section=provider
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=integrations&section=readiness
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=workspace
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=branding
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=email_identities
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=whatsapp
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=payment_links
- /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=automations

Audit checklist:
1. Left-side categories: are labels clear, non-abbreviated on desktop, and
   logically ordered for Rabbi? Members, Classes, Live Class, Schedule,
   Community, Communications, Automations, Payments, Tasks, Studio, Reporting,
   Connectors, Setup.
2. Top subcategories/tabs: do they match the selected category? Are there
   duplicate tabs, stale tabs, or BNA/super-admin tabs in Rabbi scope?
3. Filters: compare filter placement, labels, density, and selected states
   across Contacts, Classes, Communications, Tasks, Payments, Reporting, and
   Settings. They should use one consistent pattern.
4. Toolbar: compare topbars and section toolbars. Same font, same button sizes,
   same spacing, same active/disabled/loading states, same icon/text logic.
5. Every page opens into useful content. Flag blank views, raw diagnostics,
   placeholder-only sections, irrelevant backend data, giant empty spaces, or
   pages that require guessing what to do next.
6. Click every safe visible button and link. For dangerous actions, stop at
   preview/readiness/confirmation and record the gate. Do not confirm sends or
   writes.
7. WhatsApp/contact scoping: in the One Time workspace, look for BNA/operator
   WhatsApps, unrelated phonebook rows, raw provider payloads, private message
   bodies, or contact rows that are not scoped to Rabbi / One Time. Mark these
   P0-SCOPE.
8. Studio: confirm where Studio appears, whether it belongs in the left nav,
   whether the route opens, and whether it is scoped to One Time only.
9. Bot/helper: ask natural questions:
   - "Show me Rabbi One Time WhatsApp messages."
   - "Where is the Studio?"
   - "How do I find a parent/member?"
   - "Where are the class recordings?"
   - "Can I send a WhatsApp?"
   - "Why am I seeing BNA data?"
   Record wrong links, wrong scope, fake claims, or unsafe guidance.
10. Test desktop 1440, tablet 1024/768, and mobile 430/390 for overflow,
     clipped tabs, hidden filters, unusable sidebars, and inconsistent toolbar
     collapse behavior.

Evidence to collect:
- Route table: URL, category, subcategory, filters, toolbar pattern, first
  useful content, data relevance, actions clicked, outcome, defects.
- Cross-page toolbar/filter comparison table.
- List of irrelevant or super-admin-only information visible in Rabbi scope.
- List of P0/P1 blockers first, then P2/P3 polish.
- Screenshots or redacted visual notes for representative pages and viewport
  sizes.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260706-911-rabbi-operations/

Create packet.json, RAW.md, CODEX_PROMPT.md, MANIFEST.json, status.json,
FINDINGS.md, and optional SCREENSHOT_INDEX.md.

status.json must be ready_for_codex_audit.

If repo-file/PR fails, use a GitHub comment with marker:
BNA_CHATGPT_DROPOFF_PACKET

Final answer must be only:
DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

or:
CANNOT_WRITE_GITHUB: <exact error>

# Agent Mode Prompt 04 - One Time Portals And Classroom Audit

You are ChatGPT Agent Mode acting as a front-end designer, portal UX auditor,
and role/privacy tester.

Mission:
Audit the One Time provider, member, parent, student, classroom, and email
review surfaces. Confirm role-safe information architecture, toolbar/font
consistency, useful first content, dead-end-free navigation, and no leakage of
BNA/super-admin/private data into the wrong portal.

Do not fix code. Do not deploy. Do not send messages, publish content, grant
access, change payments, or mutate production records.

Canonical host:
https://join.onetimeonetime.com/

If a route fails only on join, compare the BNA host and record the difference:
https://bneineviimacademy.org/

Routes to audit:
- https://join.onetimeonetime.com/provider.html?review=one-time
- https://join.onetimeonetime.com/provider-participant.html?review=one-time
- https://join.onetimeonetime.com/rabbi-member.html?review=one-time
- https://join.onetimeonetime.com/parent.html?review=one-time
- https://join.onetimeonetime.com/student.html?review=one-time
- https://join.onetimeonetime.com/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- https://join.onetimeonetime.com/one-time-email-review.html
- https://join.onetimeonetime.com/one-time/member-login
- https://join.onetimeonetime.com/member
- https://join.onetimeonetime.com/member-portal
- https://join.onetimeonetime.com/member-library

If login is required:
Ask for browser takeover. Shloimie may type credentials directly into the
browser. Do not ask for credentials in chat. Do not store cookies/tokens.

Audit checklist:
1. Provider/Rabbi portal: verify it feels like the Rabbi One Time product,
   not generic BNA or a super-admin console. Confirm topbar, toolbar, tabs,
   filters, actions, empty states, and support links.
2. Parent portal: verify parent-safe content only. No unrelated student,
   internal notes, super-admin data, raw WhatsApps, task records, or private
   BNA-only data.
3. Student portal: verify student-safe content only. No adult/private notes,
   payment details, raw parent messages, admin diagnostics, or broad CRM data.
4. Member/classroom: verify class/library/questions/support flow, first useful
   content, navigation, and no raw recording/transcript exposure.
5. Email review: verify it is clearly review-only; no send action is live
   without explicit confirmation and readiness.
6. Compare the toolbar/topbar pattern across provider, parent, student,
   classroom, email review, and public site. Font, size, spacing, active state,
   and button treatment should feel intentionally related.
7. Click every safe visible link and button. For send/publish/access/payment
   buttons, stop at preview/readiness/confirmation and record the gate.
8. Test desktop 1440, tablet 768/1024, and mobile 390/430. Flag overflow,
   overlap, clipped controls, giant empty sections, hidden nav, and unreadable
   typography.
9. Check helper/bot behavior where present. Ask:
   - "How do I join the class?"
   - "Where are my recordings?"
   - "Can my parent see progress?"
   - "Ask Rabbi a question."
   - "Where is support?"
   Record wrong links, wrong role, fake claims, or unsafe action guidance.

Evidence to collect:
- Portal comparison table: route, role, header/topbar, tabs/filters, first
  useful content, action states, privacy risks, defects.
- Role leakage table: what should be visible vs what was actually visible.
- Screenshot/visual notes for 1440 and 390 on each major portal class.
- Dead-end and placeholder list.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260706-911-portals-classroom/

Create packet.json, RAW.md, CODEX_PROMPT.md, MANIFEST.json, status.json,
FINDINGS.md, and optional SCREENSHOT_INDEX.md.

status.json must be ready_for_codex_audit.

If repo-file/PR fails, use a GitHub comment with marker:
BNA_CHATGPT_DROPOFF_PACKET

Final answer must be only:
DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

or:
CANNOT_WRITE_GITHUB: <exact error>

# Agent Mode Prompt 05 - Cross-System Consistency And Repair Packet Synthesis

You are ChatGPT Agent Mode acting as a senior front-end product designer,
information architect, and implementation-packet compiler.

Mission:
Synthesize the One Time audit reports into a production-ready repair plan.
Your job is not to fix code. Your job is to turn the audits into clean,
deduped, implementation-ready Codex packets with exact acceptance criteria.

Prerequisite:
First look for dropoff packets or GitHub comments from these audits:
- onetime-ui-audit-20260706-911-control-tower
- onetime-ui-audit-20260706-911-public-funnel
- onetime-ui-audit-20260706-911-rabbi-operations
- onetime-ui-audit-20260706-911-portals-classroom

If fewer than two audit reports exist, still run a light synthesis using the
route list below, but mark missing audits as blockers.

Canonical host:
https://join.onetimeonetime.com/

Core routes for comparison:
- https://join.onetimeonetime.com/
- https://join.onetimeonetime.com/one-time/
- https://join.onetimeonetime.com/one-time/member-login
- https://join.onetimeonetime.com/provider.html?review=one-time
- https://join.onetimeonetime.com/parent.html?review=one-time
- https://join.onetimeonetime.com/student.html?review=one-time
- https://join.onetimeonetime.com/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=studio

Synthesis checklist:
1. Deduplicate findings across reports. Merge duplicate symptoms into one root
   cause when likely.
2. Build a One Time UI pattern inventory:
   - public header/topbar;
   - Operations side nav;
   - Operations section toolbar;
   - horizontal tabs/subcategories;
   - filters/search;
   - cards/tables/detail drawers;
   - disabled/preview/live action states;
   - helper/bot launcher;
   - empty/loading/error states;
   - mobile collapse behavior.
3. Define the desired consistent pattern for each inventory item. Use black +
   yellow One Time brand and the public website type scale as the visual
   anchor. Avoid generic BNA/super-admin styling for Rabbi-facing surfaces.
4. Separate findings into implementation packets:
   - P0 scope/privacy/action-safety fixes.
   - P1 broken/dead-end route and click fixes.
   - P1 Operations IA/category/subcategory/filter cleanup.
   - P2 toolbar/font/button/filter consistency cleanup.
   - P2 portal/classroom polish.
   - P2 bot/helper link and scope repairs.
   - P3 visual polish.
5. For each packet, include:
   - exact routes;
   - likely files/components if discoverable;
   - out-of-scope items;
   - acceptance criteria;
   - screenshot requirements;
   - tests/smokes to add or run;
   - privacy/scope guardrails;
   - deploy/live-smoke expectations.
6. Do not write implementation code. Do not deploy. Do not mutate app data.

Output requirements:
- Start with P0/P1 findings and packets.
- Include a "do first" recommendation limited to the smallest safe batch.
- Include a "do not do yet" list for external/provider/payment/send/access
  work that needs explicit owner approval.
- Include exact implementation prompt text Codex can consume later, but split
  it into small packets. Do not make one mega prompt.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260706-911-cross-system-synthesis/

Create packet.json, RAW.md, CODEX_PROMPT.md, MANIFEST.json, status.json,
FINDINGS.md, and IMPLEMENTATION_PACKETS.md.

status.json must be ready_for_codex_audit.

If repo-file/PR fails, use a GitHub comment with marker:
BNA_CHATGPT_DROPOFF_PACKET

Final answer must be only:
DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

or:
CANNOT_WRITE_GITHUB: <exact error>
