# Codex Pickup Prompt – One Time Agent Mode Audit Prompt Series

You are Codex working in the BNA repo.  This packet contains a series of five Agent Mode audit prompts intended for Shloimie to run with ChatGPT Agent Mode.  The goal is to perform a full front‑end and product readiness audit of the One Time system, covering control tower mapping, public funnel, Rabbi operations backend, portals/classroom surfaces, and a cross‑system synthesis.

## Instructions for Codex

1. Read the source‑of‑truth files (`BNA‑START‑HERE.md`, `AGENTS.md`, `MEMORY.md`, the relevant `tasks-pending` entry, and `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/README.md`) to understand the scope and guardrails.

2. Deliver the prompts in `PROMPTS.md` to Shloimie via ChatGPT Agent Mode or whichever agent platform he intends to use.  They should be run in the following order:
   - **Prompt 01 – Control Tower current‑state audit** must run first.  It builds the route/surface map and coordinates the child audits.
   - **Prompts 02, 03 and 04** (public funnel audit, Rabbi operations/backend audit, and portals/classroom audit) may run in parallel after the control‑tower agent finishes.
   - **Prompt 05 – Cross‑system synthesis** should run last, after at least two of the surface audits have delivered their findings.

3. Ensure Shloimie (or the Agent Mode instance) can write repo‑visible packets or, if that fails, marked GitHub comments.  Each prompt instructs the agent to drop its report under `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/` with the required files and `status.json` set to `ready_for_codex_audit`.

4. After Shloimie runs these prompts and dropoff packets appear in the repo (or via marked comments), run the usual ChatGPT dropoff ingestor (`npm run chatgpt:dropoff:scan` or targeted comment scan) to queue them for Codex auditing.  Audit each report, update the requirement register, identify production blockers, and plan repair packets.  Do **not** apply implementation changes from the audit reports themselves.

5. Maintain the guardrails: the agents must not edit source code, deploy, send messages, make payments, grant access, change DNS, write provider accounts, access Drive, or mutate production data.  Login must happen via browser takeover and never by pasting credentials into chat.  Ensure any evidence collected by the agents does not include secrets, raw tokens, private contact exports, or unredacted screenshots.

6. If the ChatGPT session cannot write repo files and cannot post a comment, you may need to intervene manually.  Otherwise, proceed through the normal dropoff→audit→implementation flow.

## Expected Outcome

- Shloimie receives five concise, high‑quality prompts that instruct Agent Mode to audit the One Time system comprehensively.
- The resulting audit reports are delivered back into the repo via the dropoff workflow.
- Codex audits those reports, compiles a deduplicated repair plan, and prepares implementation packets without blindly applying any unvetted changes.
