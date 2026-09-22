# Operations Drop-Off Contract For This Prompt Series

Primary handoff is BNA Operations Agent Review drop-off, not GitHub.

Use this contract for every prompt in this series:

1. Start from the Operations task or Agent Review prompt card for the prompt
   you are running.
2. Use `Copy prompt` for the latest prompt text.
3. Use `Open drop-off`, or open the exact drop-off URL shown in the prompt.
4. Complete the audit.
5. Paste the full redacted report into the drop-off `Report` field.
6. Set `Result`:
   - `PASS` only when the audit completed and found no actionable P0/P1/P2
     defect.
   - `FAIL` when the audit completed and found actionable defects that Codex
     should repair.
   - `BLOCKED` when login, permissions, route access, browser limits, or
     missing context prevented the audit.
7. Fill `Blocker` for `BLOCKED`.
8. Fill `Suggested correction` with the highest-priority repair packet or
   rerun instruction.
9. Click `Save Agent Review Result`.
10. Confirm the page or readback shows an `AGR-*` result ID.

Successful final answer:

`OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`

Fallback order:

1. If the normal task form fails, retry the exact drop-off URL from the prompt.
2. If the page offers API/emergency paste fallback, use it with the same prompt
   key, task ID when present, and idempotency key.
3. If a GitHub connector is available, post a marked
   `BNA_CHATGPT_DROPOFF_PACKET` comment or repo-visible packet as backup.
4. If every save path fails, final answer must start with:

   `OPERATIONS_DROPOFF_FAILED: <exact UI/API/connector error>`

   Then include the complete redacted report in chat so Codex can recover it.

Do not use `/mnt/data`, local downloads, ZIP files, screenshot-only summaries,
or "I prepared a file" as the only handoff.

Do not create duplicate visible tasks. A saved `FAIL` or `BLOCKED` result may
create repair work automatically through the Agent Review workflow.
