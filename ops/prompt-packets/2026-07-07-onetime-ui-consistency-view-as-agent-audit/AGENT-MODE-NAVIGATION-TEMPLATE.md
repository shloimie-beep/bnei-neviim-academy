# Agent Mode Navigation-First Template

Use this template for One Time / Rabbi / student Agent Mode audits.

## Core Rule

The agent must navigate the product itself. Do not inspect only pasted routes
or source files. Start from Super Admin, click through the visible app, and
record whether the path is discoverable, safe, mobile-usable, and role-scoped.

## Required Start

1. Open the Agent Review Hub for the prompt first, click `Start Audit` /
   `I started this agent mode`, and open the prompt's exact drop-off URL in a
   second tab before auditing.
2. Open `https://bneineviimacademy.org/operations`.
3. If login is required, ask for browser takeover and let Shloimie type the
   credentials directly. Do not ask for passwords in chat.
4. Confirm the page is the BNA Operations / Super Admin surface.
5. Find the workspace switcher in the left/sidebar/top Operations shell.
6. Choose the One Time / Rabbi workspace. Expected visible labels may include:
   - `One Time`
   - `Rabbi / One Time`
   - `One Time Mishnah Class`
   - `rabbi_sheller_provider`
   - `one_time_mishnah_class`
7. If the workspace switcher is hard to find, broken, hidden on mobile, or
   ambiguous, this is a finding. Continue by using the exact URL fallback only
   after recording that the click path failed:
   `https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class`

## Live One Time Host Check

Before auditing direct fixture routes, open:

- `https://join.onetimeonetime.com/`
- `https://join.onetimeonetime.com/parent/login`
- `https://join.onetimeonetime.com/student/login`

Confirm that these surfaces are OneTimeOneTime / One Time Mishnah Class,
black/yellow scoped, English-only, and do not flash BNA Academy branding,
BNA cream/navy/teal colors, or a Hebrew/English toggle. Parent forgot-password
must send a reset to the signup email. Parent scope should be able to reset the
child password. Student scope must not rely on a separate classroom code,
support recovery code, or fallback password.

## Super Admin To Rabbi Provider Path

1. From Operations, open Communications / Email.
2. If available, click `Rabbi / One Time` or `View Rabbi / One Time Inbox`.
3. Confirm the email panel says `Now Viewing: Rabbi / One Time Inbox` or shows
   `info@onetimeonetime.com`.
4. Click `Open Rabbi Provider Portal`.
5. Confirm the app navigates to
   `/provider.html?admin_provider=one-time&section=mailbox` or another
   provider route for One Time.
6. Confirm visible provider context:
   - OneTimeOneTime / Rabbi workspace branding;
   - `rabbi_sheller_provider`;
   - `one_time_mishnah_class`;
   - Rabbi/provider identity;
   - a banner or label that makes clear this is admin/provider/Rabbi scope.
7. If `Open Rabbi Provider Portal` is absent, disabled, errors, or redirects
   to the wrong place, save a `BLOCKED` or `FAIL` drop-off result with the
   exact step and error.

## Rabbi Provider To Student/Classroom Path

After reaching the Rabbi provider portal:

1. Find the provider sidebar or topbar.
2. Click `Student View`.
3. Confirm it opens `/student.html?review=one-time` or an equivalent One Time
   student review route.
4. Check whether the student view looks student-safe and One Time scoped:
   no Super Admin tools, no raw emails, no provider diagnostics, no unrelated
   BNA student/private data.
5. Return to the provider portal using browser back or the visible One Time /
   provider navigation.
6. Click `Classroom`.
7. Confirm it opens
   `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
   or an equivalent One Time classroom route.
8. Check whether the classroom view is member/student-safe and scoped to the
   One Time Mishnah class.
9. If a link is missing, confusing, opens the wrong route, requires unknown
   credentials, loops, or displays a broken/mobile-broken view, do not stop in
   chat. Save the finding in Operations drop-off.

## WhatsApp / WAPI Path

From Operations One Time workspace, open Communications / WhatsApp. Confirm
whether the Rabbi WAPI sender is configured, whether inbound WhatsApp messages
are logged into the One Time CRM, whether outbound sends are blocked unless
explicitly confirmed, and whether auto-reply readiness explains missing
credentials/class link without enabling a live send.

## Mandatory Drop-Off, Even On Failure

The agent's work is not complete until it saves the report in the Operations
Agent Review drop-off.

Use the drop-off linked from the task/prompt:

1. Open `Open drop-off` from the task/prompt card, or use the exact drop-off
   URL supplied in the prompt.
2. Choose:
   - `PASS` only when the audit completed and found no actionable defect.
   - `FAIL` when the UI works enough to audit but has actionable product,
     navigation, mobile, role-scope, privacy, IA, or polish defects.
   - `BLOCKED` when login, permissions, missing links, broken route, browser
     failure, redirect loop, or unclear path prevents the audit.
3. Fill `Blocker` for `BLOCKED`.
4. Fill `Suggested correction` with the highest-priority fix in Codex-ready
   language.
5. Paste the full redacted report into `Report`.
6. Click `Save Agent Review Result`.
7. Confirm the saved `AGR-*` result/readback.

If saving fails, retry the exact drop-off URL. If that also fails, use the
drop-off page emergency/API fallback if visible. Chat-only output is the last resort and must start with:

`OPERATIONS_DROPOFF_FAILED: <exact error>`

## Report Shape

Every report must include:

- exact click path attempted;
- expected page/context;
- actual page/context;
- where navigation failed, if it failed;
- desktop and mobile observations;
- role-scope/privacy findings;
- "million-dollar app" correction: what the polished, logical version should
  do instead;
- severity: `P0-SCOPE`, `P1-IA`, `P1-DEADEND`, `P2-TOOLBAR`,
  `P2-RESPONSIVE`, `P2-RELEVANCE`, `P2-TYPOGRAPHY`, or `P3-POLISH`;
- suggested Codex repair packet.
