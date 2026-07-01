# Implementation Packet Template

You are Stage 3 of parent raw input `RAW-YYYYMMDD-###`. Do not solve the whole
parent ramble. Complete only this packet's scope and record the next packet or
blocker.

## Packet Identity

| Field | Value |
|---|---|
| Parent raw ID | RAW-YYYYMMDD-### |
| Packet ID | PKT-YYYYMMDD-### |
| Packet role | IMPLEMENTATION_PACKET |
| Depends on | 01-current-state-visual-audit and relevant spec packet |
| Scope | One module or one screen only. |
| Out-of-scope | Other modules, provider setup, sends, payments, access grants, deploy unless this is also deploy packet, GHL runtime. |

## Context Budget

- max major surfaces: 1;
- max routes to touch: 3;
- max high-risk files to edit: 4 unless justified;
- max implementation requirements: 12;
- split if exceeded: yes.

## Required Sections

- consumed audit findings;
- surface map path;
- files allowed to edit;
- exact requirements;
- acceptance criteria;
- action states;
- state matrix;
- tests/smokes;
- after screenshots;
- route/action registry expectations;
- accessibility/security requirements;
- deploy gate;
- next packet.

## Terminal Condition

Implementation is not done until focused tests pass, after screenshots exist or
blockers are exact, registries are covered, and verifier packet receives
evidence. App-visible work still needs deploy/live smoke before Done.
