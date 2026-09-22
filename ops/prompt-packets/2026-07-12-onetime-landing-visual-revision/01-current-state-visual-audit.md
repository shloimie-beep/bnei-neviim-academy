# 01 Current-State Visual Audit - One Time landing visual revision

Parent raw ID: `RAW-20260712-004`
Requirement IDs: `REQ-20260712-102` through `REQ-20260712-107`

## Reference Inputs

- Operator prompt: `raw-input/RAW-20260712-004-onetime-landing-visual-revision.md`
- Requested reference screenshot path:
  `/workspace/scratch/ffef2e71fe52/upload/8d1a83ad-4652-409b-869d-269e98173323.png`
- Local result: reference screenshot path is unavailable on this machine.

## Before Evidence

Before screenshots were captured under:
`ops/ui-audits/2026-07-12-onetime-landing-visual-revision/`

Key files:

- `before-landing-1440.png`
- `before-landing-1024.png`
- `before-landing-768.png`
- `before-landing-430.png`
- `before-landing-390.png`
- `before-signup-1440.png`
- `before-signup-1024.png`
- `before-signup-768.png`
- `before-signup-430.png`
- `before-signup-390.png`
- `before-metrics.json`

## Findings

| Finding | Route | Evidence | Requirement | Status |
|---|---|---|---|---|
| Old hero contained oversized descriptive copy and proof boxes. | `/one-time` | before landing screenshots | REQ-20260712-102 | fixed locally, after proof pending |
| Section order put Rabbi/static promotion before required receive/gain/how/who order. | `/one-time` | before landing screenshots | REQ-20260712-102 | fixed locally, after proof pending |
| Feature area used plain white card grid and older labels. | `/one-time` | before landing screenshots | REQ-20260712-102 | fixed locally, after proof pending |
| Rosh Hashanah area was static, not a dynamic ticker. | `/one-time` | before landing screenshots | REQ-20260712-104 | fixed locally, after proof pending |
| Signup city field required a fixed city list and matching option. | `/one-time/signup` | source inspection | REQ-20260712-106 | fixed locally, browser proof pending |
| Robot launcher used background-image styling that could crop the figure. | public assistant widget | source inspection | REQ-20260712-105 | fixed locally, after proof pending |

## Definition of Ready

- Raw intake preserved.
- Requirement register created.
- Current-state screenshots captured.
- Missing external screenshot blocker recorded.
- Product-quality packet prepared and validator required before final closeout.

## Do Not Do

Do not merge, deploy, publish, or call the visual revision Done until after
desktop/mobile screenshots are presented for operator approval.

