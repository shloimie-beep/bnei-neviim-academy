# Agent Mode Prompt 02 - One Time Public Funnel Audit

```text
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
```
