# Super-Ramble Packet Splitter

SUPER-RAMBLES must not become one giant Codex implementation prompt.

The assistant/agent must classify a new ramble before producing Codex prompts.
A ramble is a SUPER-RAMBLE if any of these are true:

- touches more than one major product surface;
- touches CRM plus community plus email plus payments;
- includes visual/UI polish across multiple screens;
- includes external provider setup;
- includes broad phrases like "finish the whole system" or "million-dollar
  app";
- would require more than 12 implementation requirements;
- would require more than 3 routes/screens;
- would require both backend and frontend changes;
- would require design/audit plus implementation plus deployment;
- prompt would be too long for one focused Codex session;
- operator explicitly says "this is a huge ramble", "make multiple prompts",
  or "split into ChatGPT sessions".

## Required Output

Create:

1. Parent raw input: `RAW-YYYYMMDD-###`.
2. Decomposition manifest:
   - `ops/prompt-packets/YYYY-MM-DD-<slug>/MANIFEST.md`
   - `ops/prompt-packets/YYYY-MM-DD-<slug>/manifest.json`
3. Only the packet files needed for the actual ramble. Do not create empty fake
   packets.

Common packet names:

- `00-control-tower.md`
- `01-product-quality-spec.md`
- `02-ui-visual-audit-spec.md`
- `03-crm-packet.md`
- `04-community-packet.md`
- `05-communications-packet.md`
- `06-payments-access-packet.md`
- `07-verifier-closeout-packet.md`

## Packet Contract

Each packet must be independently understandable and must include:

- parent raw ID;
- packet ID;
- packet role;
- stage number;
- owner;
- scope;
- out-of-scope items;
- source statements it covers;
- affected routes/files;
- exact expected output;
- acceptance criteria;
- tests/evidence required;
- how to hand results back to the parent manifest;
- whether it is for ChatGPT prompt-generation or Codex implementation.

## Packet Roles

- `CONTROL_TOWER`: coordinates child packets, source coverage, blockers, and
  final integration.
- `SPEC_COMPILER`: converts vague product intent into exact product specs.
- `VISUAL_AUDITOR`: creates screenshot/defect finding requirements.
- `IMPLEMENTATION_PACKET`: gives Codex exact code work.
- `PROVIDER_SETUP_PACKET`: email/Stripe/DNS/API setup, always separate from UI
  cleanup.
- `VERIFIER_PACKET`: independent verification and closeout.
- `DEPLOY_PACKET`: push/deploy/live-smoke where appropriate.

## Stages

- `STAGE-0`: raw ramble capture and decomposition;
- `STAGE-1`: ChatGPT spec packet generation;
- `STAGE-2`: Codex implementation packet generation;
- `STAGE-3`: Codex implementation;
- `STAGE-4`: independent verification;
- `STAGE-5`: deploy/live smoke;
- `STAGE-6`: final source-of-truth update.

When the operator workflow is "ChatGPT first -> multiple ChatGPT windows ->
each creates a better Codex prompt", the manifest must preserve that as an
explicit staged workflow.

Each ChatGPT-generated child packet must say:

> You are working on Stage X of parent raw input RAW-YYYYMMDD-###. Do not solve
> the whole parent ramble. Produce only the output required by this packet.

If a packet becomes too broad during generation, split it again and update the
manifest.

## Product Quality Validation

Any child packet that carries UI/product quality work must have a
`*.product-quality.json` companion or equivalent machine-readable packet that
passes:

```bash
npm run pqc:validate path/to/packet.product-quality.json
```

Control-tower and verifier packets must run or require:

```bash
npm run watchdog:protocol-drift
```

Invalid packets are not Codex implementation scope. Repair, split, or block the
packet and update the parent manifest.

## Control Tower Responsibilities

The control tower must:

- preserve the parent raw source;
- maintain source-statement coverage;
- decide which child packets are needed;
- keep provider setup separate from UI cleanup;
- keep implementation packets small enough for one focused Codex session;
- track blocker ownership and next action;
- prevent child packets from claiming parent completion;
- collect evidence from child packet closeouts;
- update the parent requirement register and final source-of-truth files.

## Default Product/UI Batch Map

Use these batches unless a packet justifies a narrower order:

| Batch | Purpose |
|---|---|
| 0 | Intake, raw record, source coverage, requirement register |
| 1 | Current-state audit: routes, screenshots, controls, data/state, role/scope, action/route registry |
| 2 | Product spec: IA, workflow, data fields, tabs/cards/drawers/boards, action states, mobile expectations |
| 3 | Implementation slice A: one screen or module |
| 4 | Implementation slice B: next screen or module |
| 5 | Data/API/readback, only if needed |
| 6 | Action/automation states: works, preview, blocked, support-only |
| 7 | Responsive/mobile proof |
| 8 | Visual defect closeout with before/after screenshots |
| 9 | Verification: tests, smokes, watchdogs, registries, source coverage |
| 10 | Deploy/live smoke for app-visible work |
| 11 | Final handoff: statuses, blockers, next packet, changelog/ledger/memory |
