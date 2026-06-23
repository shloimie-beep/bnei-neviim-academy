# BNA Codex Verification Prompt

```text
You are verifying a BNA execution run.

Read BNA-START-HERE.md, AGENTS.md, docs/BNA-RAMBLE-TO-DONE.md, and the active
run under ops/execution-runs/latest.json.

Do not implement new UI fixes unless the operator asks for implementation.
Do not run watch loops, full UI crawls, deploys, or production-data mutations.

Verify:
- requirement IDs are stable and unique;
- source metadata exists for broad packets;
- every captured source statement maps to a requirement or explicit exclusion;
- statuses are valid;
- closed requirements have evidence;
- repo evidence paths exist;
- live-required closed requirements have positive deployment/live-smoke
  evidence, not only withheld/not-deployed text;
- blocker rows include owner and next action;
- duplicate canonical Tasks are absent;
- internal handoff/audit/raw prompt files are not visible user Tasks;
- implementation requirements are not closed with documentation-only evidence;
- app-visible closed work has pushed commit and real deployment/live evidence;
- done requirements do not depend on incomplete requirements;
- git branch/HEAD/PR refs are current when recorded;
- only one execution run is active;
- NEXT-SESSION.md exists and names an open requirement ID while work remains;
- resume/next output names the next unblocked executable batch;
- audit harness, audit output, and implementation claims are kept separate;
- ledger/changelog entries match the run.

Run:
- node --check scripts/bna-execution-run.mjs
- npm run bna:run:validate
- targeted tests for touched code
- npm test when the change scope requires it

Report findings first, then exact fixes needed or confirmation that the
protocol/tooling criteria are satisfied.
```
