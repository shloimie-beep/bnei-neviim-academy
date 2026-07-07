# One Time UI Consistency And View-As Agent Audit Prompts

Raw source: `RAW-20260707-004`

Related evidence:

- `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md`
- `ops/system-audits/2026-07-07-agent-mode-prompt-reconciliation.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

## Purpose

These prompts are for ChatGPT Agent Mode to audit the parts of the One Time UI
that the earlier prompt series did not fully close:

- consistency of categories, subcategories, filters, toolbars, and buttons;
- clear login-once navigation from Shloimie's Super Admin login into Rabbi /
  provider and student/member perspectives;
- brand separation between BNA Academy and One Time while keeping component
  behavior consistent.

The prompts are audit-only. They do not ask agents to edit code, deploy, send
messages, charge cards, grant access, change DNS, write Drive files, mutate
provider accounts, or change production data.

All role/view-as prompts must follow the navigation-first template:
`AGENT-MODE-NAVIGATION-TEMPLATE.md`. Agents must start from Super Admin, click
through visible One Time/Rabbi navigation, and save `FAIL` or `BLOCKED` in
Operations drop-off when a path breaks instead of stopping with chat-only
output.

## Prompt Files

0. `AGENT-MODE-NAVIGATION-TEMPLATE.md`
1. `01-navigation-filter-consistency-agent-mode.md`
2. `02-view-as-navigation-agent-mode.md`
3. `03-role-perspective-screen-matrix-agent-mode.md`
4. `04-consistency-view-as-synthesis-agent-mode.md`

## Recommended Run Order

Parallel mode is allowed and preferred when multiple Agent Mode sessions are
available:

- Run `01`, `02`, and `03` at the same time in separate Agent Mode sessions.
- Each session must use its own packet ID and must not wait for the others.
- If one session needs evidence from another session, it should record a
  blocker/unknown row instead of stalling or inventing results.
- Run `04` only after at least two of `01`, `02`, and `03` have produced
  repo-visible dropoff packets or marked GitHub comments.

Sequential fallback: run `01` and `02` first, run `03` after `02` identifies
the available view-as/access paths, then run `04`.

Parallel session names:

- Session A: Navigation / filter / toolbar consistency.
- Session B: Login once / view-as navigation.
- Session C: Role perspective screen matrix.
- Session D: Synthesis after at least two reports exist.

Known live operator observations to preserve in the parallel audits:

- The top toolbar/top section has too much empty/wasted space.
- Mobile behavior must be audited as seriously as desktop behavior.
- The Communications section appears to have a loop or bad-display state while
  clicking through views.
- Rabbi-facing dashboard views should not show non-actionable Super Admin
  setup/configuration cards.

## Dropoff Rule

Primary handoff is BNA Operations Agent Review drop-off. This is the preferred
path because Agent Mode sessions can run in parallel and save results through
the app even when they do not have GitHub write access.

For each Agent Mode run:

1. Open the Operations task or Agent Review prompt card for that prompt.
2. Click `Copy prompt`.
3. Click `Open drop-off`, or use the exact drop-off URL shown in the prompt.
4. Paste the full redacted report into `Report`.
5. Choose `PASS`, `FAIL`, or `BLOCKED`.
6. Click `Save Agent Review Result`.
7. Verify the saved `AGR-*` result/readback.

Successful final answer:

`OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`

Fallback order:

1. Retry the exact drop-off URL.
2. Use the drop-off page API/emergency paste fallback if offered.
3. If a GitHub connector is available, post a marked
   `BNA_CHATGPT_DROPOFF_PACKET` comment or repo-visible packet as backup.
4. If every save path fails, return:

   `OPERATIONS_DROPOFF_FAILED: <exact UI/API/connector error>`

   Then include the full redacted report in chat so Codex can recover it.

See `OPERATIONS-DROPOFF.md` for the full contract.

Do not use `/mnt/data`, a ZIP, local downloads, or screenshot-only answers as
the only handoff.
