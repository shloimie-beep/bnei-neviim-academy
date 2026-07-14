# AGENTS.md Migration Map

Generated for the Intent Preservation Gate instruction-size repair on
2026-07-14.

The previous root `AGENTS.md` measured 45,914 UTF-8 bytes. It was moved
verbatim to `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md`. The new root `AGENTS.md`
is a concise loader that keeps critical triggers near the top and links to
canonical docs.

## Preservation Rule

No prior operating rule was deleted. Prior prose now lives in one of:

- `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md` for the full moved guide;
- `docs/BNA-RAMBLE-TO-DONE.md` for durable ramble/run execution;
- `docs/PRODUCT-QUALITY-COMPILER.md` for PQC;
- `docs/INTENT-PRESERVATION-GATE.md` for the new fidelity gate;
- `ops/chatgpt-ramble-dropoff/*` for no-paste ChatGPT packet workflow;
- `memory-topics/*.md`, `MEMORY.md`, and `TASKS.md` for current durable facts
  and queue state.

## Section Map

| Previous root section | Current location |
|---|---|
| Purpose | `AGENTS.md`; full text in `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md` |
| Source Of Truth | `AGENTS.md`; full text in `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md` |
| Memory Topic Lookup Before Acting | `AGENTS.md`; full text in `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md` |
| Ramble Protocol - Required For All Operator Dumps | `AGENTS.md`; `docs/BNA-RAMBLE-TO-DONE.md`; full text in moved guide |
| Product Quality Compiler Validator | `AGENTS.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; full text in moved guide |
| Ramble Protocol v3 - Router, DAG, Audit-First Loop | `docs/BNA-RAMBLE-TO-DONE.md`; full text in moved guide |
| Goal-Mode Ramble Execution Trigger | `AGENTS.md`; full text in moved guide |
| Product Quality Compiler | `docs/PRODUCT-QUALITY-COMPILER.md`; full text in moved guide |
| Super-Ramble Packet Splitter | `docs/BNA-RAMBLE-TO-DONE.md`; full text in moved guide |
| ChatGPT Ramble Drop-off Protocol | `AGENTS.md`; `ops/chatgpt-ramble-dropoff/README.md`; full text in moved guide |
| Kimi Fallback Policy | Full text in `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md` |
| Raw Input Queue | `AGENTS.md`; `docs/BNA-RAMBLE-TO-DONE.md`; full text in moved guide |
| Universal Natural Language Intake Protocol | `AGENTS.md`; full text in moved guide |
| Agentic Goal Memory / Goal Promotion / Watchdogs | `AGENTS.md`; full text in moved guide |
| Audit Artifact Governance | Full text in moved guide; command remains `npm run audit:governance` |
| Action Registry Requirement | `AGENTS.md`; full text in moved guide |
| Route Registry Requirement | `AGENTS.md`; full text in moved guide |
| Privacy and Workspace-Scope Invariants | `AGENTS.md`; full text in moved guide |
| Natural-Language Approval For External Sends | `AGENTS.md`; full text in moved guide |
| Publish And Deployment Closeout Default | `AGENTS.md`; full text in moved guide |
| Definition of Done | `AGENTS.md`; full text in moved guide |
| Stale Document Warning | Full text in moved guide |
| Memory Promotion Rules | Full text in moved guide |
| Working Style | Full text in moved guide |
| Current Project Reality | `AGENTS.md`; full text in moved guide |
| Agent Review Agent Mode Protocol | Full text in moved guide |
| Current AI Setup | Full text in moved guide |
| Near-Term Priorities | Full text in moved guide |
| Telegram Ops Reality | Full text in moved guide |
| Pending Work Convention | Full text in moved guide |

## New Root Trigger

The new `Intent Preservation Gate` trigger was added near the beginning of the
root guide. This is the only new root rule introduced by the migration; detailed
behavior is canonical in `docs/INTENT-PRESERVATION-GATE.md`.
