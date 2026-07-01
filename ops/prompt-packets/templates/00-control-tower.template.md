# 00-Control Tower Packet Template

You are Stage 0 / Stage 1 of parent raw input `RAW-YYYYMMDD-###`. Do not solve
the whole parent ramble. Produce only this packet's output contract.

## Packet Identity

| Field | Value |
|---|---|
| Parent raw ID | RAW-YYYYMMDD-### |
| Packet ID | PKT-YYYYMMDD-### |
| Packet role | CONTROL_TOWER |
| Stage | STAGE_0_RAW_CAPTURE / STAGE_1_SPEC_COMPILER |
| Status | ready_for_generation |
| Owner | ChatGPT / Codex |
| Scope | Decompose the parent ramble into router output, source coverage, packet DAG, and next packet. |
| Out-of-scope | Product UI implementation, external sends/writes, payment/access grants, GHL runtime. |

## Required Output

- parent raw capture path;
- source statement map;
- Ramble Router classification;
- Product Quality Compiler expansion;
- super-ramble decision;
- Packet DAG;
- exact child packets needed;
- provider setup separation;
- no-GHL interpretation when relevant;
- schema validation command;
- next packet: `01-current-state-visual-audit`.

## Required Commands

```bash
npm run pqc:validate path/to/control-tower.product-quality.json
npm run watchdog:protocol-drift
```

## Handoff

Update the parent manifest and requirement register. Do not mark parent work
done unless every child packet is terminal or blocked with exact next action.
