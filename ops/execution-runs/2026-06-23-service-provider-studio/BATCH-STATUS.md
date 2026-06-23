# Batch Status

| Batch | Requirement IDs | Status | Evidence | Next action |
|---|---|---|---|---|
| A | REQ-20260623-001 | done | raw-input, memory, register, active run created; `npm run bna:run:validate` PASS | baseline audit |
| A | REQ-20260623-002 | done | `docs/product/service-provider-studio-baseline-2026-06-23.md` | additive schema/domain/RBAC |
| B | REQ-20260623-003, REQ-20260623-004 | needs_verification | additive migration/domain/API/RBAC implemented; focused/full tests and watchdogs passed | clean integration/default merge/deploy proof |
| C | REQ-20260623-006, REQ-20260623-007 | needs_verification | prompt compiler, structured output validation, and correction preview/apply implemented and tested | clean integration/default merge/deploy proof |
| D | REQ-20260623-005, REQ-20260623-008 | needs_verification | source sanitization and Operations Studio module implemented; route/action registries passed | clean integration/default merge/deploy proof |
| E | REQ-20260623-009 | needs_verification | storyboard editor and browser smoke screenshots passed | clean integration/default merge/deploy proof |
| F | REQ-20260623-010 | needs_verification | mock jobs/render/export/asset records implemented and tested | clean integration/default merge/deploy proof |
| G | REQ-20260623-011 | needs_verification | usage metering, price catalog, budget view, and API Usage rollup implemented and tested | clean integration/default merge/deploy proof |
| H | REQ-20260623-012, REQ-20260623-013 | needs_verification | no-publish Content handoff and One Time pilot fixture implemented and tested | clean integration/default merge/deploy proof |
| I | REQ-20260623-014 | needs_verification | docs, focused/full tests, secret scan, diff check, watchdogs, and browser evidence passed locally | clean integration/default merge/deploy proof |
| J | REQ-20260623-015 | in_progress | local gates passed in feature worktree | create clean integration worktree from latest default, merge, rerun gates, push only if clean |
