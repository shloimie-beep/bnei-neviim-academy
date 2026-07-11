# 00 Control Tower - One Time P0/P1 Corrective

Packet ID: `PKT-20260711-001-CONTROL`
Parent raw ID: `RAW-20260711-001`
Branch: `codex/onetime-p0p1-corrective-20260711`
Scope: One Time owner Operations shell, first-party CRM, public landing/signup/onboarding, generated Operations artifact proof.

## Lane Claim

- Owner: Codex current thread.
- Worktree: `C:\Users\User\BNA-onetime-p0p1-corrective-20260711`.
- Base head: `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`.
- Parallel packet tower: no ready ChatGPT packet was waiting; this branch's dirty files are the claimed lane.

## Do Not Touch

- No email, WhatsApp, Telegram, campaign, payment, access-grant, DNS, production data, contact import, or external provider mutation.
- No unrelated dirty work from the original `C:\Users\User\BNA v2.0` checkout.
- No new historical-source mapping package. Existing historical reports are provenance only.

## First Current-State Findings

- Canonical Express `/operations` route sends `public/operations-bootstrap.html`, but direct `public/operations.html` remains reachable as a browser page and package scripts lack `operations:build` / `operations:check-generated`.
- Existing local CRM smoke serves static `operations.html` as `/operations`, so it cannot prove the authenticated canonical Express route.
- Public `/one-time` is partially corrected but config still contains stale "free class", FAQ, and "See How It Works" contract copy.
- `/one-time-preview` is still branded as preview/TBD/checklist content and should become a real next-step onboarding page or alias.
- `/api/one-time/interest` may attempt an internal Telegram reminder for non-synthetic public leads; this corrective lane must suppress that external send.
- The latest downloaded Robot Scheller image exists locally in Downloads and must be imported as the launcher asset with non-destructive fit.

## Next Batches

1. Wave 1: generated Operations artifact gate and canonical route proof.
2. Wave 4 quick correction: Robot Scheller asset, no-send guard, landing config/onboarding route cleanup.
3. Wave 2/3 deeper implementation: Rabbi owner shell/CRM proof and mutations.
4. Wave 5/6 verification, PR, and deploy-after-review blocker.
