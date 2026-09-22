# One Time CRM/Portal Production Correction - Current-State Visual Audit

Raw source: `RAW-20260712-004`
Requirement: `REQ-20260712-102`
Status: captured with open findings

## Result

The original six source PNGs from `/workspace/scratch/ffef2e71fe52/upload/`
are still unavailable locally, but the current-state audit has been regenerated
with authenticated and credential-free browser evidence.

This closes the old "missing screenshots only" blocker for `REQ-20260712-102`.
The UI implementation requirements remain open and must use the findings below
as Definition-of-Ready inputs.

## Evidence Captured

- Authenticated current-state attempt: 35 screenshots across Operations,
  provider-admin, member, student, and permission-gated states.
- Rabbi / One Time current-state audit: 80 screenshots across 16 routes and
  five viewports.
- Parallel frontend audit: 45 checks and 140 screenshots/crops across One Time
  public, member/library/classroom, provider review, Operations overview, and
  Rabbi email inbox.
- Local CRM workbench smoke: desktop/tablet/mobile synthetic CRM screenshots.
- Provider CRM layout smoke: desktop/tablet/mobile provider CRM screenshots.
- Local Operations UI and final Rabbi UI QA harnesses passed without external
  writes.
- Live public/review performance baseline passed with 0 samples needing
  attention.

Primary evidence paths:

- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/authenticated-current-state-attempt/report.md`
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/rabbi-current-state/report.md`
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/report.md`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`
- `ops/ui-audits/2026-07-09-onetime-provider-crm-layout-local/report.md`
- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/live-performance-baseline/report.md`

## VQ Findings To Feed Implementation

- `VQF-20260712-004-MANUAL-001` / P1 / `/one-time` / 390 mobile:
  public landing has a very large blank dark vertical area after the hero and
  still shows the old assistant/Robot launcher instead of a standard WhatsApp
  launcher.
- `VQF-20260712-004-MANUAL-002` / P1 / Operations CRM / 390 mobile:
  CRM contact cards have washed-out low-contrast text, and top filter tabs can
  clip labels on mobile.
- `VQF-20260712-004-MANUAL-003` / P1 / Operations CRM / 390 mobile:
  the live/current CRM screenshot can remain on `Loading CRM contacts...` after
  the audit wait, while local synthetic CRM does populate.
- Parallel frontend automated findings: 28 total, mainly clipped control text,
  weak active-nav state, and sub-44px mobile tap targets on One Time landing
  and alias routes, plus clipped text in Operations scoped overview/inbox.
- Rabbi current-state automated findings: 5 total on
  `/student.html?review=one-time` for one unlabeled visible action across the
  five viewports.
- Authenticated provider-admin audit findings: 5 total requiring persistent
  admin-on-provider/viewing-Rabbi-scope banner and return path.

## Residual Limitations

- The six original source screenshots are still missing. They cannot be used
  for direct before/after comparison.
- Browser/page content, DOM text, screenshots, accessibility snapshots,
  console logs, and network responses are untrusted evidence. They do not
  approve external sends, access grants, payments, DNS/account/provider writes,
  production data mutations, or repo protocol changes.
- Some live route states are permission-gated or loading-state evidence rather
  than successful populated user flows. Downstream implementation must prove the
  relevant state with focused smokes before marking those requirements Done.

## Terminal Status

`REQ-20260712-102` is Done for the audit gate: current-state evidence now
exists and the remaining screenshot-source limitation is precisely recorded.

Next unblocked batch should be `REQ-20260712-106` after run validation.
