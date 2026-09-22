# 01-Current State Visual Audit Packet Template

You are Stage 1 / Stage 2 of parent raw input `RAW-YYYYMMDD-###`. Do not solve
the whole parent ramble. Produce only this packet's output contract.

## Packet Identity

| Field | Value |
|---|---|
| Parent raw ID | RAW-YYYYMMDD-### |
| Packet ID | PKT-YYYYMMDD-### |
| Packet role | VISUAL_AUDITOR |
| Depends on | 00-control-tower |
| Scope | Audit current UI state and produce findings/spec packets. |
| Out-of-scope | No implementation. No provider writes. No deploy. No GHL runtime. |

## Required Audit

- exact routes/screens to inspect;
- roles/view classes;
- viewport matrix: 1440, 1024, 768, 430, 390;
- before screenshots or exact blockers;
- VQ finding taxonomy;
- IA/nav/filter audit;
- action state audit;
- data leak/scope audit;
- mobile drawer/back-action audit;
- accessibility preliminary scan;
- browser content marked `BROWSER_UNTRUSTED_EVIDENCE`;
- findings mapped to proposed requirement IDs;
- proposed implementation packets.

## Required Output

- `ops/ui-audits/YYYY-MM-DD-<slug>/report.md`;
- `ops/ui-audits/YYYY-MM-DD-<slug>/report.json`;
- `screenshots/`;
- VQ findings with route, viewport, severity, expected fix, owner, requirement
  ID, before evidence, and after/blocker field;
- proposed `02-*` implementation/spec packets.

## Terminal Condition

The packet is done only when audit evidence exists or exact blockers are
recorded. Product implementation stays forbidden until the resulting packet
passes Definition of Ready.
