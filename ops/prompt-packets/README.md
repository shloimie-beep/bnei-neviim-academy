# Prompt Packets

This folder holds decomposed prompt packets for broad operator rambles that are
too large for one Codex implementation session.

Use this only as an extension of the raw-intake, requirement-register, and
execution-run protocol. Do not create a parallel source of truth.

## Ramble Protocol v3

Super-rambles use the Packet DAG contract in `docs/PACKET-DAG.md`. Router and
compiler contracts live in:

- `docs/RAMBLE-ROUTER.md`
- `docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md`
- `docs/PRODUCT-QUALITY-COMPILER.md`
- `docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md`
- `docs/REPO-SURFACE-MAP.md`

Vague product-quality UI work must start with:

1. `00-control-tower`
2. `01-current-state-visual-audit`

No Codex implementation packet is valid until the visual audit and Definition
of Ready pass.

## Product Quality Packet Validation

Product/UI packets created here should include a machine-readable
`*.product-quality.json` companion when they compile vague language such as
`clean`, `sloppy`, `million-dollar app`, `CRM`, `pipeline`, `community
section`, or `GHL-like`.

Validate before Codex implementation:

```bash
npm run pqc:validate path/to/packet.product-quality.json
```

Required closeout checks for broad product-quality work:

```bash
npm run pqc:evals
npm run watchdog:protocol-drift
```

If validation fails, split or repair the packet. Do not use an invalid packet
as Codex implementation scope.

## Folder Shape

For a super-ramble:

```text
ops/prompt-packets/YYYY-MM-DD-<slug>/
  MANIFEST.md
  manifest.json
  00-control-tower.md
  01-product-quality-spec.md
  02-ui-visual-audit-spec.md
  03-crm-packet.md
  04-community-packet.md
  05-communications-packet.md
  06-payments-access-packet.md
  07-verifier-closeout-packet.md
```

Only create packet files that are actually needed.

Reusable templates live under `ops/prompt-packets/templates/`.

Example Rabbi / One Time seed packets live under
`ops/prompt-packets/examples/rabbi-onetime-ui-cleanup/`.

## Required Manifest Fields

- parent raw ID;
- parent raw source path;
- requirement register path;
- packet DAG status;
- packet IDs;
- parent packet IDs;
- child packet IDs;
- packet dependencies;
- packet blockers;
- packet roles;
- stage labels;
- owner;
- scope;
- out-of-scope items;
- source statement coverage;
- dependencies;
- blockers;
- context budget;
- expected evidence;
- result handback fields;
- final closeout status.

## Packet Rules

- A packet must be independently understandable.
- A packet must say whether it is for ChatGPT prompt-generation or Codex
  implementation.
- A packet must include source statements it covers and explicit exclusions.
- A packet must include acceptance criteria, tests, screenshot requirements
  where relevant, deployment/live-smoke gates, and terminal status rules.
- A packet must not ask Codex to solve the entire parent ramble unless it is the
  control-tower packet.
- Provider setup packets for email, Stripe, DNS, API credentials, payment
  access, and external writes stay separate from visual/UI cleanup.

## Required Child-Packet Language

Each ChatGPT-generated child packet must include:

> You are working on Stage X of parent raw input RAW-YYYYMMDD-###. Do not solve
> the whole parent ramble. Produce only the output required by this packet.

## Closeout

Child packet results must return to the parent manifest and the dated
requirement register. Completion requires source coverage, evidence,
ledger/changelog records, and deploy/live-smoke proof for app-visible work.
