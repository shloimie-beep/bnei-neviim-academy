# Job 101 Review Triage

Status: Done for triage; no database review statuses changed.

## Plain-English Answer

The Job `101` parser did not find 440 separate UI tasks. It produced hundreds
of review candidates because the transcript mixed Shloimie's UI/system
dictation with class discussion, student interruptions, repeated ASR fragments,
and a little parser-instruction leakage.

In this system, a **review item** means "candidate found, needs routing or
human/agent judgment." It does **not** mean a background agent already fixed it.
Only candidates that are converted into canonical tasks, product-quality
packets, or already-authorized workflows become executable agent work.

## Evidence Used

- Job `101` apply closeout says parser output exists with counts:
  tasks `4`, class notes `43`, accountability events `201`, review `442`.
- Earlier same-session metadata readback for parse run `59` found the likely
  UI/system slice was small compared with the full review queue.
- Current fresh DB requery was blocked by DNS:
  `getaddrinfo ENOTFOUND db.amipeuneopdbzuhlnimt.supabase.co`.
- Existing background UI work was inspected in:
  `tasks-pending/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely.md`.

## What The Real UI/System Items Collapse Into

| Cluster | Status | What Shloimie likely meant | Background-agent status | Next action |
|---|---|---|---|---|
| Operations/top filters | Partly covered | Filter boxes at the top are too big/awkward and need compact layout cleanup. | One Time task route density was locally fixed in `REQ-20260702-809`; exact Job 101 route still needs dedupe/spot check. | Do one focused Operations filter-layout verification packet if not the same route. |
| Contacts/interested parents/communications | Not done from Job 101 | Contacts should be unified with tags/filters; interested-parent buttons and communication/email controls should be arranged more logically. | Not implemented by the Job 101 parser. Related broader CRM/contact-detail polish is still a future child packet. | Create one canonical contact/communication IA task, not dozens of review rows. |
| Mobile bot/helper input | Not verified done | The bot/helper text input has an unacceptable Samsung/default keyboard-style behavior. | Mobile helper closed-state was fixed, but Samsung/default input behavior was not proven. | Create focused Android/Samsung mobile input QA/fix packet. |
| Rabbi/One Time scope/UI | Partly covered | Rabbi/provider UI and records should stay scoped and should not pollute unrelated BNA dashboard context. | Broad Rabbi/One Time local UI cleanup packets 02-09 are locally verified; deploy/live smoke remains blocked. | Keep under the existing Rabbi/One Time UI goal; do not duplicate review rows. |
| Content/Drive queue | Already satisfied for transcripts | Transcript/content should be in Drive/content queue so ChatGPT can find it. | Private Drive transcript docs for jobs `101`, `100`, `85`, `84`, `83`, `82` are created/readable/searchable. | No extra review work for transcript visibility. |

## What Should Not Become UI Tasks

| Bucket | Status | Routing |
|---|---|---|
| Student/class interruptions | Needs review in correct lane | Keep as class notes/student review/private review where appropriate. |
| Torah/class content | Needs content review | Route to class/content/newsletter-safe review, not UI/background tasks. |
| Parser instruction leakage | Needs cleanup | Archive/supersede after DB is reachable; examples include generic "split coding/app/dashboard/parser..." wording. |
| Repeated ASR fragments | Needs cleanup | Deduplicate by normalized source/hash/title. |
| Score/progress/grading | Blocked | No writes unless `APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY` is supplied with row-level packet. |

## Recommended Canonical Tasks

1. Fix Operations top filter controls and compact filter-box layout.
2. Unify Contacts, Interested Parents, tags, and communication filters.
3. Repair mobile bot/helper text input behavior on Android/Samsung-style keyboard.
4. Verify Rabbi/One Time workspace-scope isolation in Operations dashboard.
5. Archive/supersede Job 101 parser-instruction leakage and duplicate review fragments.

## Cleanup Status

| Requirement | Status | Evidence | Verification | Remaining blocker |
|---|---|---|---|---|
| Reinterpret Job 101 review queue with interruption context | Done | This file and `JOB-101-REVIEW-TRIAGE.json` | Compared parser counts, prior metadata readback, and existing UI packets | None |
| Determine whether review items were implemented by background agents | Done | Existing Rabbi/One Time UI register shows packets 02-09 locally verified; Job 101-specific contacts/mobile-input items are not done | Register and ledger readback | Deploy/live smoke still blocked for app-visible UI |
| Reduce review queue to canonical action clusters | Done | Five canonical tasks above | No raw transcript body stored | None |
| Mutate DB review statuses | Blocked | Fresh DB requery failed DNS | No DB mutation performed | Retry when Supabase DNS is reachable |
| Close score/progress/grading rows | Blocked | Existing approval rule | No apply phrase supplied | Needs exact approval phrase and row-level packet |

## Important Distinction

The background agent did deal with several **related** Rabbi/One Time UI issues
today: shell headings, library language/layout, provider contrast, helper
closed state, task dialogue contrast, task route density, provider review load
error, and student review readability. Those are locally verified but still
need deploy/live-smoke proof.

The Job `101` review queue itself still needs a cleanup pass when the database
is reachable: close only duplicates/instruction leakage, preserve student and
private review rows, and link the real UI/system clusters to canonical tasks.
