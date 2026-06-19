# Agent Control Manual Browser Judgment Smoke

PASS. The in-app browser exercised the manual Agent Mode smoke prompt against fake local data only.

- Run target: /operations/agents/runs/run_agent_control_smoke
- Browser URL: http://127.0.0.1:50885/operations/agents/runs/run_agent_control_smoke?run=run_agent_control_smoke&workspace=platform&view=agents&section=ready
- Identity/workspace: Super Admin / Platform Operations fake local fixture
- Action sequence: claim -> progress -> artifacts -> submit -> seal
- Final status: blocked
- Final outcome: needs_operator
- Linked Decision count: 1
- Linked Decision ID: DEC-MANUAL-001
- Artifact count at first readback: 2
- Production writes: no
- External writes: no
- Deployment: no
- Broad crawl: no
- Watch/agent-fleet loop: no
- Secret-shaped text displayed: no

Evidence:
- ops/playwright-smokes/2026-06-19-agent-control-manual-browser/manual-browser-report.md
- ops/playwright-smokes/2026-06-19-agent-control-manual-browser/manual-browser-dom-snapshot.txt

Screenshot note:
- In-app browser screenshot capture timed out twice; DOM/readback report is the durable visual-state evidence for this manual smoke.

Readback excerpt:

```text
AGENT RUN RUN_AGENT_CONTROL_SMOKE Verify Agent Control manual browser judgment flow Manual in-app browser judgment completed locally. Agent Control works with fake local data; release/live approval remains required before production closeout. Back Copy Agent Prompt Open ChatGPT Agent Run Summary STATUS Blocked TASK #901 Verify Agent Control manual browser judgment flow WORKSPACE BNA AGENT Browser QA MODE mixed EVIDENCE 2 artifacts EVENTS 7 events UPDATED 19 Jun, 15:20 Resume Reopen Fresh Run Agent Prompt Progress Post Progress sealed Manual in-app browser judgment completed locally. Agent Control works with fake local data; release/live approval remains required before production closeout. / In-app browser manual smoke / 19 Jun, 15:26 submitted Manual in-app browser judgment completed locally. Agent Control works with fake local data; release/live approval remains required before production closeout. / In-app browser manual smoke / 19 Jun, 15:25 evidence attached Manual in-app browser smoke evidence / In-app browser manual smoke / 19 Jun, 15:24 progress Manual in-app browser smoke inspected the Super Admin Agent Run portal with fake local data only; no production, secrets, deployment, or external writes used. / In-app browser manual smoke / 19 Jun, 15:23 claimed Manual browser smoke claimed the run. / In-app browser manual smoke / 19 Jun, 15:22 prompt generated Prompt generated without credentials. / Super Admin / 19 Jun, 15:10 created Agent run created for manual browser smoke. / Super Admin / 19 Jun, 15:10 Evidence Type Screenshot Title URL Repo path Redaction Not needed Attach Evidence Agent Control manual smoke prompt report / ops/agent-control/2026-06-19-manual-agent-mode-smoke.md / not_needed / 19 Jun, 15:12 Manual in-app browser smoke evidence screenshot / ops/pl
```
Final evidence attach readback:

- Manual report evidence visible: yes
- Final artifact count: 3
- Final action sequence: claim -> progress -> artifacts -> submit -> seal -> artifacts
