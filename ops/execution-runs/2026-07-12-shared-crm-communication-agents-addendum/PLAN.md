# Plan

Record implementation batches and verification gates.

## 2026-07-13 One Time-First Addendum Plan

1. `REQ-20260713-906` - Control correction: capture raw addendum, source matrix, decisions, packet DAG, and next-session handoff.
2. `REQ-20260713-907` - Owner-only live integration tests: inspect guarded email/WAPI paths, resolve secure aliases without printing secrets, run readiness/preflight, then either run bounded owner sends with redacted readback or block only this requirement.
3. `REQ-20260713-908` - Architecture/performance baseline: write ADR and collect repeated cold/warm route measurements before more shell/performance implementation.
4. `REQ-20260713-909` - Dedicated One Time app shell: implement only after the ADR/baseline, with old-shell fallback and exact deploy/live proof.
5. `REQ-20260713-910` - Mobile CRM IA: create current-state visual audit and validated Product Quality packet before CRM UI edits.
6. `REQ-20260713-911` - Independent verifier/final report: verify provider readbacks without duplicate sends, budgets, exact deployed SHA, mobile screenshots, BNA safety, and final report sections.
