# Plan

## Batches

1. Batch A: intake, run setup, clean worktree, git truth, baseline audit.
2. Batch B: additive data model/domain services and RBAC/tenancy.
3. Batch C: prompt compiler, schema validation, injection defense, correction patches.
4. Batch D: Studio navigation/dashboard/project UI and source/brief editors.
5. Batch E: storyboard/slideshow/video editor and responsive preview.
6. Batch F: durable jobs, mock generation/rendering, assets, exports.
7. Batch G: AI usage metering, budgets, alerts, provider/Super Admin views.
8. Batch H: Content/Library handoff and One Time pilot fixture.
9. Batch I: docs, registries, tests, browser evidence, independent verification.
10. Batch J: clean integration worktree and merge to actual default branch.

## Gate Summary

- No edits in the dirty shared checkout.
- Baseline before product code.
- Additive migrations only.
- No live vendor calls, sends, charges, DNS, Vimeo/Zoom/Google/Buffer writes, or
  Railway topology changes.
- Deterministic mocks for generation/rendering.
- Focused tests, full `npm test`, action/security watchdogs, secret audit,
  `git diff --check`, migration repeat test, Playwright Chromium/WebKit at
  390x844, 768x1024, and 1440x900.
- Independent clean verification before merge.
- Merge to actual default branch only after gates pass.
