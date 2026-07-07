# Agent Mode Prompts - Parent Trial Login And IA Consistency

Use these prompts in parallel Agent Mode sessions. Each prompt has a unique
prompt key and idempotency key. Agents must use Operations Agent Review
drop-off as the primary handoff. Chat-only output is the emergency fallback.

## Prompt 01 - One Time Parent Trial Journey

```text
You are ChatGPT Agent Mode acting as a senior product designer, QA auditor,
and parent-journey auditor for BNA / OneTimeOneTime.

Mission:
Audit the One Time parent trial experience as if you are a brand-new parent
whose 30-day trial just started. You are not sending email and you are not
creating a real account. You are auditing the existing no-password TEST parent
journey and reporting what is missing before Codex can send a real parent link.

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `one-time-parent-trial-journey`
- context_key: `one_time_parent`
- requirement_id: `REQ-20260707-113`
- idempotency_key: `2026-06-26-agent-review-dropoff-repair:one-time-parent-trial-journey:one_time_parent:20260707-parent-trial`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-parent-trial-journey&context_key=one_time_parent&requirement_id=REQ-20260707-113&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-parent-trial-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-parent-trial-journey%3Aone_time_parent%3A20260707-parent-trial&autosave=1`
- API fallback:
  `POST https://bneineviimacademy.org/api/bna/agent-review/results`

Hard guardrails:
- Do not send email, WhatsApp, SMS, Telegram, or portal notifications.
- Do not create a real parent account, student account, Stripe checkout, payment,
  Zoom meeting, CRM record, access grant, DNS change, Drive permission, or
  provider-account mutation.
- Do not ask for or store passwords, cookies, tokens, access codes, API keys,
  or private student data.
- Use TEST/review routes only unless the UI itself gives a safe read-only path.

Exact navigation:
1. Open `https://bneineviimacademy.org/parent.html?review=one-time`.
2. Confirm this is a no-password TEST parent journey. Expected signals:
   `OneTimeOneTime`, `Parent Review Portal`, `Preview only`, `TEST-only`, or
   `Linked TEST child only`.
3. Audit the first viewport at 1440px desktop.
4. Repeat the same route at 1024px, 768px, 430px, and 390px.
5. On each viewport, inspect:
   - top section/header spacing;
   - button alignment and equal height;
   - whether any text is clipped or cramped;
   - whether schedule/class information is visible or findable;
   - whether library/resource access is visible or findable;
   - whether 30-day trial/access/billing state is visible or findable;
   - whether student attendance/click/activity state is visible or findable;
   - whether parent-safe support/private question UI is visible;
   - whether parent can find student login management/reset expectations.
6. Click `Open classroom/library` from the parent portal.
7. Confirm it opens:
   `https://bneineviimacademy.org/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
   or an equivalent TEST One Time classroom/library route.
8. In the classroom/library route, check whether a parent would understand:
   - where the next class link is;
   - where the library/recording is;
   - where worksheets/resources are;
   - what is disabled because this is review mode;
   - whether anything looks like raw admin/debug data.
9. Open `https://bneineviimacademy.org/one-time-email-review.html`.
10. Find the parent/trial email template cards. Confirm whether the UI previews
    copy similar to: "Welcome, your 30-day One Time trial is active. Here is
    your class/portal link." Record what is present and what is missing.

What to judge:
- A million-dollar app version is not just prettier. It is obvious what role
  the user is in, what the next action is, what the parent can see, what is
  disabled, and why.
- The parent should never see Super Admin diagnostics, setup warnings that only
  Codex can act on, unrelated BNA school records, raw tokens, or other families.
- The parent journey should feel like one coherent account: trial, class,
  schedule, library, child activity, support, and student access are in logical
  positions.

Report required:
1. Exact routes visited and click path.
2. Viewport matrix: 1440, 1024, 768, 430, 390.
3. PASS/FAIL for schedule, library, trial/billing, student click/activity,
   attendance, support, and student-login management.
4. Top 5 UI/IA fixes in Codex-ready language.
5. Explicit missing pieces before a real parent welcome email can be sent.
6. Recommended final email copy shape, but do not send anything.
7. Severity labels: `P0-SCOPE`, `P1-IA`, `P1-DEADEND`, `P2-TOOLBAR`,
   `P2-RESPONSIVE`, `P2-RELEVANCE`, `P2-TYPOGRAPHY`, or `P3-POLISH`.

Mandatory drop-off:
Save the full redacted report in Operations Agent Review drop-off using the
exact URL above. Choose:
- PASS only if the audit completed and found no actionable defect.
- FAIL if the journey works but has actionable product/UI/IA defects.
- BLOCKED if routing, login, permissions, browser failure, or missing pages
  prevented the audit.

If the drop-off save fails, retry the exact URL. If the page offers emergency
paste/API fallback, use it. If every save path fails, final answer must begin:
`OPERATIONS_DROPOFF_FAILED: <exact UI/API/connector error>`
and then include the complete redacted report in chat.

Successful final answer must be only:
`OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`
```

## Prompt 02 - One Time Student Login And Parent Reset Journey

```text
You are ChatGPT Agent Mode acting as a senior product designer, student-safety
auditor, and auth-flow QA auditor.

Mission:
Audit whether the One Time student journey is clear, student-safe, and
consistent with parent-managed student login/reset expectations. You are not
creating real credentials. You are auditing visible TEST/review surfaces and
reporting whether the parent/student account model is understandable.

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `one-time-student-login-reset-journey`
- context_key: `one_time_student`
- requirement_id: `REQ-20260707-114`
- idempotency_key: `2026-06-26-agent-review-dropoff-repair:one-time-student-login-reset-journey:one_time_student:20260707-student-reset`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-student-login-reset-journey&context_key=one_time_student&requirement_id=REQ-20260707-114&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-student-login-reset-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-student-login-reset-journey%3Aone_time_student%3A20260707-student-reset&autosave=1`
- API fallback:
  `POST https://bneineviimacademy.org/api/bna/agent-review/results`

Hard guardrails:
- Do not create, reset, or reveal a real password.
- Do not use shared real credentials.
- Do not expose parent billing, adult/private notes, Super Admin controls,
  unrelated BNA school records, or other students.
- Do not send messages, grant access, charge cards, or mutate production data.

Exact navigation:
1. Open `https://bneineviimacademy.org/student.html?review=one-time`.
2. Confirm this is a no-password TEST student review route. Expected text may
   include `One Time student review`, `TEST-only class data`, `No bot / no BNA
   goals`, or `One Time only`.
3. Audit at 1440px, 1024px, 768px, 430px, and 390px.
4. On each viewport, inspect:
   - topbar/header spacing and wasted first-viewport space;
   - sidebar/hamburger behavior;
   - category/subcategory placement;
   - button alignment and equal height;
   - whether student sees class, library, worksheet/resource, attendance,
     progress, question/support, achievement/reward;
   - whether anything looks like parent billing, Super Admin, provider admin,
     raw setup/debug, or BNA school accountability data.
5. Click the visible `Parent` link in the student topbar.
6. Confirm it opens `https://bneineviimacademy.org/parent.html?review=one-time`
   or equivalent TEST parent route.
7. In the parent route, look specifically for whether a parent can understand
   how to set/reset a student login. If no visible reset/manage student login
   UI appears in TEST mode, record whether that is acceptable for review mode
   or whether a visible preview card should exist.
8. Open `https://bneineviimacademy.org/student/login`.
9. Audit the real logged-out student login shell at 1440 and 390:
   - username/password fields;
   - access-code fallback;
   - error/help copy;
   - mobile spacing;
   - whether a student and parent would understand who sets the password.
10. Open `https://bneineviimacademy.org/parent/login`.
11. Audit whether the parent login/reset model explains parent setup clearly
    enough and does not confuse parent login with student login.

What to judge:
- The product can have both parent and student logins even if students often
  use the parent device. The distinction must be obvious:
  Parent = household, billing/trial, support, attendance/click tracking,
  student login reset.
  Student = class, library, worksheet, questions, progress, attendance,
  achievements.
- The student view must feel age-appropriate, lighter, and student-safe.
- Mobile must not look cramped, overlapped, uneven, or stuffed with random
  information.

Report required:
1. Exact routes and click path.
2. Viewport matrix: 1440, 1024, 768, 430, 390.
3. PASS/FAIL for student-safe scope, class visibility, library visibility,
   worksheet/resource, attendance/progress, parent link, parent reset clarity,
   student login shell, access-code fallback.
4. Any missing copy/UI needed so parent and student know who controls login.
5. Top 5 fixes in Codex-ready language.
6. Severity labels: `P0-SCOPE`, `P1-IA`, `P1-DEADEND`, `P2-TOOLBAR`,
   `P2-RESPONSIVE`, `P2-RELEVANCE`, `P2-TYPOGRAPHY`, or `P3-POLISH`.

Mandatory drop-off:
Save the full redacted report in Operations Agent Review drop-off using the
exact URL above. Use PASS/FAIL/BLOCKED correctly. If every save path fails,
final answer starts with `OPERATIONS_DROPOFF_FAILED:` and includes the full
redacted report. Otherwise final answer is only:
`OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`
```

## Prompt 03 - Cross-Role IA Consistency Audit

```text
You are ChatGPT Agent Mode acting as a senior front-end product designer,
information-architecture auditor, and role-scope auditor.

Mission:
Audit whether the One Time surfaces use one consistent navigation grammar:
same side panel pattern, same top subcategory/filter placement, same drawer
behavior, same role labels, and logical category/subcategory relationships
across Super Admin, Rabbi/provider, parent, student, member, and classroom
views.

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `one-time-role-ia-consistency`
- context_key: `rabbi_provider_admin`
- requirement_id: `REQ-20260707-115`
- idempotency_key: `2026-06-26-agent-review-dropoff-repair:one-time-role-ia-consistency:rabbi_provider_admin:20260707-ia`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-role-ia-consistency&context_key=rabbi_provider_admin&requirement_id=REQ-20260707-115&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-role-ia-consistency&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-role-ia-consistency%3Arabbi_provider_admin%3A20260707-ia&autosave=1`
- API fallback:
  `POST https://bneineviimacademy.org/api/bna/agent-review/results`

Hard guardrails:
- Audit only. Do not edit code.
- Do not send messages, grant access, charge cards, publish, deploy, change
  DNS, write external providers, or mutate production data.
- If Operations login is required, use browser takeover so Shloimie types
  credentials directly. Do not ask for credentials in chat.
- Use no-password TEST routes for parent/student/member/classroom.

Exact navigation:
1. Open `https://bneineviimacademy.org/operations`.
2. If login is required, ask for browser takeover. Let Shloimie type the
   credentials. Do not store or repeat them.
3. Confirm you are in BNA Operations / Super Admin.
4. Find the workspace switcher.
5. Select One Time / Rabbi / One Time Mishnah Class. Acceptable labels:
   `One Time`, `Rabbi / One Time`, `One Time Mishnah Class`,
   `rabbi_sheller_provider`, `one_time_mishnah_class`.
6. If you cannot find the click path, record that as a finding, then use:
   `https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class`
7. Inspect Operations at 1440 and 390:
   - side panel categories;
   - active workspace/project label;
   - top subcategories/tabs;
   - filters/search placement;
   - drawer/slide-out behavior;
   - whether Super Admin diagnostic/config cards are hidden from Rabbi view.
8. From Operations, open Communications > Email.
9. Click `Rabbi / One Time` or `View Rabbi / One Time Inbox`.
10. Confirm the inbox says `Now Viewing: Rabbi / One Time Inbox` or shows
    `info@onetimeonetime.com`.
11. Click `Open Rabbi Provider Portal`.
12. Confirm provider route:
    `https://bneineviimacademy.org/provider.html?admin_provider=one-time&section=mailbox`
    or equivalent.
13. In provider route, inspect the same IA grammar at 1440 and 390.
14. Open these no-password role routes and inspect at 1440 and 390:
    - Parent: `https://bneineviimacademy.org/parent.html?review=one-time`
    - Student: `https://bneineviimacademy.org/student.html?review=one-time`
    - Member: `https://bneineviimacademy.org/rabbi-member?review=one-time`
    - Classroom: `https://bneineviimacademy.org/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`

Consistency rules:
- Side panel/hamburger location should be predictable across app shells.
- Top subcategories/tabs should appear in the same conceptual location.
- Filters should live near the content they filter and should not duplicate
  categories.
- Category names should be logical for the role. Parent/student should not see
  Super Admin internals.
- Role identity must be visible: Super Admin, Rabbi/provider, Parent, Student,
  Member/Classroom.
- "Million-dollar app" means: no cramped controls, no mystery buttons, no
  random setup diagnostics in user views, no inconsistent topbars, no duplicate
  filter rows, no mobile overflow, no dead empty first viewport.

Report required:
1. IA matrix with rows:
   Super Admin Operations, Rabbi/provider, Parent, Student, Member, Classroom.
2. Columns:
   side panel, top subcategories, filters, role label, drawer/menu, primary
   action, mobile behavior, scope/privacy, biggest defect.
3. Screenshot/visual notes for 1440 and 390.
4. Exact click path attempted from Super Admin to Rabbi provider.
5. Any loops/bad displays, especially Communications.
6. Top 10 Codex-ready fixes, ordered by severity.
7. Suggested shared component/pattern to use across all roles.

Mandatory drop-off:
Save the full redacted report in Operations Agent Review drop-off using the
exact URL above. Use PASS/FAIL/BLOCKED correctly. If every save path fails,
final answer starts with `OPERATIONS_DROPOFF_FAILED:` and includes the full
redacted report. Otherwise final answer is only:
`OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`
```

## Prompt 04 - Parent Welcome Email And Live-Send Readiness Audit

```text
You are ChatGPT Agent Mode acting as a communications/product-flow auditor.

Mission:
Audit what a real One Time parent welcome/trial email should say and what
must be confirmed before Codex sends it to Shloimie. You are not sending any
email. You are producing a no-send readiness report.

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `one-time-parent-trial-journey`
- context_key: `one_time_parent`
- requirement_id: `REQ-20260707-111`
- idempotency_key: `2026-06-26-agent-review-dropoff-repair:one-time-parent-trial-journey:one_time_parent:20260707-email-readiness`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-parent-trial-journey&context_key=one_time_parent&requirement_id=REQ-20260707-111&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-parent-trial-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-parent-trial-journey%3Aone_time_parent%3A20260707-email-readiness&autosave=1`

Hard guardrails:
- Do not send email.
- Do not create or update a real parent/member/student account.
- Do not trigger password reset or magic-link send.
- Do not create Stripe checkout, Zoom, CRM, or access records.

Exact navigation:
1. Open `https://bneineviimacademy.org/one-time-email-review.html`.
2. Review the parent invitation, trial confirmation, class reminder, worksheet,
   attendance/progress, payment receipt, payment issue, and support template
   cards.
3. Open `https://bneineviimacademy.org/parent.html?review=one-time`.
4. Identify the exact links a real email should point to:
   - parent portal/login link;
   - class/classroom link;
   - library/resource link;
   - support/help link.
5. Open `https://bneineviimacademy.org/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
   and confirm what class/library destination exists today.
6. Write the recommended no-send email copy. It should be short and parent
   friendly:
   - greeting;
   - "your 30-day One Time trial starts now";
   - class/portal link;
   - what parent can see: schedule, library, child activity/attendance;
   - how student login will be managed by parent;
   - support path;
   - note that billing does not start until the trial/payment policy says so.
7. List exact blockers before Codex can send the real email:
   - exact recipient email;
   - exact class link;
   - sender/from address;
   - whether this is a real account or test-only account;
   - whether parent password setup or magic-link is preferred;
   - whether the email should mention billing/Stripe yet.

Report required:
1. Existing template coverage.
2. Missing template/copy pieces.
3. Recommended final email subject and body.
4. Exact send blockers.
5. Whether the email should be "magic link", "set password", or "test-only
   preview link".
6. Codex-ready next action.

Mandatory drop-off:
Save the full redacted report in Operations Agent Review drop-off. Use
BLOCKED if live send cannot proceed because the recipient/link/scope is
unclear. If every save path fails, final answer starts with
`OPERATIONS_DROPOFF_FAILED:` and includes the full report. Otherwise final
answer is only:
`OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`
```
