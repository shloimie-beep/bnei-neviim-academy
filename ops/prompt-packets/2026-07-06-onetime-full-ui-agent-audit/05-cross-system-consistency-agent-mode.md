# Agent Mode Prompt 05 - Cross-System Consistency And Repair Packet Synthesis

```text
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
```
